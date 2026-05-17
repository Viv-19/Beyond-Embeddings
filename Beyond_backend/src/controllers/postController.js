// ============================================================================
// postController.js — HTTP Handlers for Blog Posts
// ============================================================================
//
// 🎓 LEARNING: REST API Design
// This controller follows RESTful conventions:
//   GET    /api/posts           → List all posts (optional ?type=blogs filter)
//   GET    /api/posts/:slug     → Get a single post by its slug
//   POST   /api/posts           → Create a new post (admin only)
//   DELETE /api/posts/:id       → Delete a post (admin only)
//   PATCH  /api/posts/:id/views → Increment view count
//   PATCH  /api/posts/:id/likes → Increment like count
//
// 🎓 LEARNING: HTTP Methods have meaning:
//   - GET    = Read data (safe, no side effects)
//   - POST   = Create new data
//   - PATCH  = Partially update existing data
//   - DELETE = Remove data
//   - PUT    = Replace entire data (rarely used in practice)
// ============================================================================

const postService = require('../services/postService');

// ============================================================================
// GET /api/posts — List posts (optionally filtered by type)
// ============================================================================
// Query params:
//   ?type=blogs       → Only return blog posts
//   ?type=experiments  → Only return experiments
//   (no type param)   → Return ALL posts across all types
//
// 🎓 LEARNING: Query params vs Route params
//   - Route params (/posts/:id) identify a SPECIFIC resource
//   - Query params (/posts?type=blogs) FILTER or SEARCH a collection
//   We use query params here because "type" is a filter, not an identifier.
// ============================================================================
async function listPosts(req, res, next) {
    try {
        const { type } = req.query;

        let posts;
        if (type) {
            // Validate the type parameter to prevent unexpected values
            const validTypes = ['blogs', 'experiments', 'papers', 'notes'];
            if (!validTypes.includes(type)) {
                return res.status(400).json({
                    status: 'error',
                    message: `Invalid type. Must be one of: ${validTypes.join(', ')}`
                });
            }
            posts = await postService.getPostsByType(type);
        } else {
            posts = await postService.getAllPosts();
        }

        res.status(200).json({
            status: 'success',
            data: posts
        });
    } catch (error) {
        next(error);
    }
}

// ============================================================================
// GET /api/posts/:slug — Get a single post by its URL slug
// ============================================================================
// The slug is the URL-friendly version of the title.
// Example: /api/posts/interpreting-latent-representations
//
// This endpoint also returns all comments for the post (eager loaded).
// ============================================================================
async function getPost(req, res, next) {
    try {
        const { slug } = req.params;
        const post = await postService.getPostBySlug(slug);

        if (!post) {
            return res.status(404).json({
                status: 'error',
                message: 'Post not found.'
            });
        }

        res.status(200).json({
            status: 'success',
            data: post
        });
    } catch (error) {
        next(error);
    }
}

// ============================================================================
// POST /api/posts — Create a new post (admin only)
// ============================================================================
// Request body: { type, title, body, excerpt, image, category, readTime, ... }
// Protected by: protect + adminOnly middlewares (set up in routes)
//
// 🎓 LEARNING: This endpoint is protected by TWO middlewares:
//   1. `protect` — verifies the JWT token (is the user logged in?)
//   2. `adminOnly` — checks if the user has the "admin" role
// This is called "middleware chaining" — each middleware adds a layer of security.
// ============================================================================
async function createPost(req, res, next) {
    try {
        const { type = 'blogs', ...postData } = req.body;

        // Validate type
        const validTypes = ['blogs', 'experiments', 'papers', 'notes'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({
                status: 'error',
                message: `Invalid type. Must be one of: ${validTypes.join(', ')}`
            });
        }

        // For non-chat posts, title is required
        if (type !== 'notes' && !postData.title) {
            return res.status(400).json({
                status: 'error',
                message: 'Title is required for this post type.'
            });
        }

        // For chat/notes, body is required
        if (type === 'notes' && !postData.body) {
            return res.status(400).json({
                status: 'error',
                message: 'Body content is required for chat posts.'
            });
        }

        const post = await postService.createPost(type, postData);

        res.status(201).json({
            status: 'success',
            message: 'Post created successfully!',
            data: post
        });
    } catch (error) {
        next(error);
    }
}

// ============================================================================
// DELETE /api/posts/:id — Delete a post (admin only)
// ============================================================================
// 🎓 LEARNING: We use the database ID (UUID) for deletion, not the slug.
// This is because slugs can theoretically change, but IDs are immutable.
// ============================================================================
async function removePost(req, res, next) {
    try {
        const { id } = req.params;
        await postService.deletePost(id);

        res.status(200).json({
            status: 'success',
            message: 'Post deleted successfully.'
        });
    } catch (error) {
        next(error);
    }
}

// ============================================================================
// PATCH /api/posts/:id/views — Increment the view count
// ============================================================================
// Called by the frontend when a user opens a post page.
// No authentication required — anyone viewing a post should increment the count.
// ============================================================================
async function incrementViews(req, res, next) {
    try {
        const { id } = req.params;
        const updated = await postService.incrementMetric(id, 'views');

        res.status(200).json({
            status: 'success',
            data: { views: updated.views }
        });
    } catch (error) {
        next(error);
    }
}

// ============================================================================
// PATCH /api/posts/:id/likes — Increment the like count
// ============================================================================
// Called when a user clicks the heart button.
// Requires authentication (you must be logged in to like a post).
// ============================================================================
async function incrementLikes(req, res, next) {
    try {
        const { id } = req.params;
        const updated = await postService.incrementMetric(id, 'likes');

        res.status(200).json({
            status: 'success',
            data: { likes: updated.likes }
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    listPosts,
    getPost,
    createPost,
    removePost,
    incrementViews,
    incrementLikes
};
