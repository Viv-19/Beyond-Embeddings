// ============================================================================
// postService.js — Blog Post Business Logic (CRUD Operations)
// ============================================================================
//
// 🎓 LEARNING: CRUD = Create, Read, Update, Delete
// These are the four fundamental operations for any data-driven application.
// This service handles ALL post types (blogs, experiments, papers, notes)
// using the `type` field as a discriminator.
//
// The service layer talks to the database (Prisma) and returns plain objects.
// It does NOT know about HTTP, requests, or responses — that's the controller's job.
// ============================================================================

const prisma = require('../config/db');
const { sendNewPostNotification } = require('./emailService');

// ============================================================================
// createPost — Creates a new post of any type
// ============================================================================
// @param {string} type — "blogs", "experiments", "papers", or "notes"
// @param {object} data — The post fields (title, body, excerpt, etc.)
// @returns {object} The created post record from the database
//
// 🎓 LEARNING: We generate the slug from the title if one isn't provided.
// A slug is the URL-friendly version of the title:
//   "My First Blog Post" → "my-first-blog-post"
// Slugs are used in URLs: /post/my-first-blog-post (instead of /post/abc123)
// This is better for SEO and human readability.
// ============================================================================
async function createPost(type, data) {
    // Auto-generate slug from title if not provided
    // Replace spaces with hyphens, remove special chars, lowercase everything
    const slug = data.slug || (data.title
        ? data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        : null);

    const post = await prisma.post.create({
        data: {
            type,
            title: data.title || null,
            slug,
            subtitle: data.subtitle || null,
            excerpt: data.excerpt || null,
            body: data.body || null,
            image: data.image || null,
            category: data.category || null,
            readTime: data.readTime || null,
            repoLink: data.repoLink || null,
            pdfUrl: data.pdfUrl || null,
        }
    });

    // 🎓 LEARNING: Fire-and-forget email notification for blog posts.
    // We don't `await` this because we don't want email failures to
    // prevent the post from being created. The email sends in the background.
    if (type === 'blogs' && post.title) {
        sendNewPostNotification(post);
    }

    return post;
}

// ============================================================================
// getPostsByType — Retrieves all posts of a specific type
// ============================================================================
// @param {string} type — "blogs", "experiments", "papers", or "notes"
// @returns {array} Array of post objects, newest first
//
// 🎓 LEARNING: We use `orderBy: { created_at: 'desc' }` to show the most
// recent posts first. This is the expected behavior for any blog or feed.
// We also include a count of comments using `_count` so the frontend can
// display "5 comments" without making a separate API call.
// ============================================================================
async function getPostsByType(type) {
    return await prisma.post.findMany({
        where: { type },
        orderBy: { created_at: 'desc' },
        include: {
            comments: {
                include: {
                    user: {
                        select: { username: true, role: true }
                    }
                },
                orderBy: { created_at: 'asc' }
            },
            _count: {
                select: { comments: true }
            }
        }
    });
}

// ============================================================================
// getAllPosts — Retrieves ALL posts across all types
// ============================================================================
// Used for the Archive page and search functionality.
// Returns posts from all categories, sorted by date (newest first).
// ============================================================================
async function getAllPosts() {
    return await prisma.post.findMany({
        orderBy: { created_at: 'desc' },
        include: {
            comments: {
                include: {
                    user: {
                        select: { username: true, role: true }
                    }
                },
                orderBy: { created_at: 'asc' }
            },
            _count: {
                select: { comments: true }
            }
        }
    });
}

// ============================================================================
// getPostBySlug — Retrieves a single post by its URL slug
// ============================================================================
// @param {string} slug — The URL-friendly identifier (e.g. "my-first-post")
// @returns {object|null} The post with its comments, or null if not found
//
// 🎓 LEARNING: We use `include: { comments: { include: { user: ... } } }`
// to fetch the post AND its comments AND the username of each commenter
// in a SINGLE database query. This is called "eager loading" — it prevents
// the "N+1 query problem" where you'd make 1 query for the post + N queries
// for each comment's author.
// ============================================================================
async function getPostBySlug(slug) {
    return await prisma.post.findUnique({
        where: { slug },
        include: {
            comments: {
                include: {
                    user: {
                        select: { username: true }  // Only fetch the username, not the password hash!
                    }
                },
                orderBy: { created_at: 'asc' }  // Oldest comments first (chronological)
            }
        }
    });
}

// ============================================================================
// getPostById — Retrieves a single post by its database ID
// ============================================================================
// Used internally (e.g., for comment creation where we have the post ID)
// ============================================================================
async function getPostById(id) {
    return await prisma.post.findUnique({
        where: { id },
        include: {
            comments: {
                include: {
                    user: {
                        select: { username: true }
                    }
                },
                orderBy: { created_at: 'asc' }
            }
        }
    });
}

// ============================================================================
// updatePost — Updates an existing post
// ============================================================================
// @param {string} id — The post database ID
// @param {object} data — The fields to update
// ============================================================================
async function updatePost(id, data) {
    // Re-generate slug from title if it was changed
    let slug = data.slug;
    if (data.title && !data.slug) {
        slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }

    return await prisma.post.update({
        where: { id },
        data: {
            title: data.title !== undefined ? data.title : undefined,
            slug: slug !== undefined ? slug : undefined,
            subtitle: data.subtitle !== undefined ? data.subtitle : undefined,
            excerpt: data.excerpt !== undefined ? data.excerpt : undefined,
            body: data.body !== undefined ? data.body : undefined,
            image: data.image !== undefined ? data.image : undefined,
            category: data.category !== undefined ? data.category : undefined,
            readTime: data.readTime !== undefined ? data.readTime : undefined,
            repoLink: data.repoLink !== undefined ? data.repoLink : undefined,
            pdfUrl: data.pdfUrl !== undefined ? data.pdfUrl : undefined,
            type: data.type !== undefined ? data.type : undefined
        }
    });
}

// ============================================================================
// deletePost — Deletes a post by its ID
// ============================================================================
// 🎓 LEARNING: Because we set `onDelete: Cascade` in the Prisma schema,
// deleting a post will AUTOMATICALLY delete all its associated comments.
// We don't need to manually delete comments first.
// ============================================================================
async function deletePost(id) {
    return await prisma.post.delete({
        where: { id }
    });
}

// ============================================================================
// incrementMetric — Increments a numeric field (views or likes)
// ============================================================================
// @param {string} id — The post ID
// @param {string} metric — "views" or "likes"
//
// 🎓 LEARNING: We use Prisma's `increment` operation instead of fetching
// the current value, adding 1, and saving it back. This is important because:
//   - It's atomic (prevents race conditions with concurrent requests)
//   - It's efficient (one DB operation instead of read + write)
//   - It's safe (no risk of "lost updates" when two users view simultaneously)
// ============================================================================
async function incrementMetric(id, metric) {
    const validMetrics = ['views', 'likes', 'dislikes'];
    if (!validMetrics.includes(metric)) {
        throw new Error(`Invalid metric: ${metric}. Must be one of: ${validMetrics.join(', ')}`);
    }

    return await prisma.post.update({
        where: { id },
        data: {
            [metric]: { increment: 1 }  // Atomic increment — no race conditions!
        }
    });
}

module.exports = {
    createPost,
    getPostsByType,
    getAllPosts,
    getPostBySlug,
    getPostById,
    updatePost,
    deletePost,
    incrementMetric
};
