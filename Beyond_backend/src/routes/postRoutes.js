// ============================================================================
// postRoutes.js — Route Definitions for Blog Posts
// ============================================================================
//
// 🎓 LEARNING: Route Order Matters!
// Express matches routes TOP-TO-BOTTOM. If you put `/:slug` before `/search`,
// a request to `/search` would be caught by `/:slug` (treating "search" as a slug).
// Always put specific/static routes BEFORE parameterized/dynamic ones.
//
// Route hierarchy in this file:
//   1. Public read routes (no auth) — anyone can read posts
//   2. Public metric routes (no auth) — anyone can increment views
//   3. Protected metric routes (auth required) — must be logged in to like
//   4. Admin-only write routes (auth + admin) — only admins can create/delete
// ============================================================================

const express = require('express');
const postController = require('../controllers/postController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

const router = express.Router();

// ============================================================================
// PUBLIC ROUTES — No authentication required
// ============================================================================
// These are the "read" endpoints. Anyone visiting the blog should be able to
// browse posts without creating an account. This is standard for any blog.

// GET /api/posts — List all posts (with optional ?type=blogs filter)
router.get('/', postController.listPosts);

// GET /api/posts/:slug — Get a single post by its URL slug
// 🎓 LEARNING: The `:slug` is a route parameter. Express extracts it and
// makes it available as `req.params.slug` in the controller.
router.get('/:slug', postController.getPost);

// PATCH /api/posts/:id/views — Increment view count (no auth needed)
// We don't require auth for views because even anonymous visitors should
// contribute to the view count.
router.patch('/:id/views', postController.incrementViews);

// ============================================================================
// AUTHENTICATED ROUTES — JWT token required
// ============================================================================

// PATCH /api/posts/:id/likes — Increment like count (must be logged in)
// 🎓 LEARNING: We require auth for likes (but not views) because:
//   1. It prevents spam-liking by bots
//   2. We can track which users liked which posts (future feature)
//   3. It encourages users to create accounts
router.patch('/:id/likes', protect, postController.incrementLikes);

// PATCH /api/posts/:id/dislikes — Increment dislike count (must be logged in)
router.patch('/:id/dislikes', protect, postController.incrementDislikes);

// ============================================================================
// ADMIN ROUTES — JWT token + admin role required
// ============================================================================
// These are the "write" endpoints. Only admins can create or delete posts.
// The `protect` middleware verifies the JWT, and `adminOnly` checks the role.

// POST /api/posts — Create a new post
router.post('/', protect, adminOnly, postController.createPost);

// PUT /api/posts/:id — Update a post
router.put('/:id', protect, adminOnly, postController.updatePost);

// DELETE /api/posts/:id — Delete a post
router.delete('/:id', protect, adminOnly, postController.removePost);

module.exports = router;
