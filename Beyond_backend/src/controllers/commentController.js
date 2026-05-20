// ============================================================================
// commentController.js — HTTP Handlers for Comments
// ============================================================================
//
// 🎓 LEARNING: Comments are a "nested resource" — they exist within the
// context of a post. In REST API design, there are two common approaches:
//
//   1. Nested URLs:  POST /api/posts/:postId/comments
//   2. Flat URLs:    POST /api/comments (with postId in the request body)
//
// We use approach #2 (flat URLs) because it keeps our routing simpler
// and avoids deeply nested URL structures. The postId is sent in the
// request body instead of the URL path.
// ============================================================================

const commentService = require('../services/commentService');

// ============================================================================
// POST /api/comments — Create a new comment
// ============================================================================
// Request body: { postId, text }
// Requires authentication (protect middleware) — req.user.id is available
//
// 🎓 LEARNING: Notice how the controller extracts `req.user.id` from the JWT
// payload. The user CANNOT choose which user ID to comment as — it's always
// derived from their authenticated token. This prevents impersonation attacks
// where a user might try to post comments as someone else.
// ============================================================================
async function createComment(req, res, next) {
    try {
        const { postId, text, parentId } = req.body;
        const userId = req.user.id;  // From the JWT token (set by protect middleware)

        // --- Input Validation ---
        if (!postId || !text) {
            return res.status(400).json({
                status: 'error',
                message: 'Post ID and comment text are required.'
            });
        }

        // Delegate to the service layer
        const comment = await commentService.addComment(postId, userId, text, parentId);

        res.status(201).json({
            status: 'success',
            message: 'Comment posted!',
            data: comment
        });

    } catch (error) {
        if (error.message === 'Post not found.') {
            return res.status(404).json({ status: 'error', message: error.message });
        }
        next(error);
    }
}

// ============================================================================
// GET /api/comments/:postId — Get all comments for a post
// ============================================================================
// No authentication required — anyone can read comments.
// ============================================================================
async function listComments(req, res, next) {
    try {
        const { postId } = req.params;
        const comments = await commentService.getCommentsByPost(postId);

        res.status(200).json({
            status: 'success',
            data: comments
        });
    } catch (error) {
        next(error);
    }
}

// ============================================================================
// DELETE /api/comments/:id — Delete a comment
// ============================================================================
// Requires authentication. Only the comment author or an admin can delete.
//
// 🎓 LEARNING: This is "ownership-based authorization". Unlike the `adminOnly`
// middleware which is binary (admin or not), here we need to check:
//   "Is this user the OWNER of this specific resource, OR are they an admin?"
// This check happens in the service layer, not the middleware, because it
// requires fetching the comment to compare user IDs.
// ============================================================================
async function removeComment(req, res, next) {
    try {
        const { id } = req.params;
        await commentService.deleteComment(id, req.user.id, req.user.role);

        res.status(200).json({
            status: 'success',
            message: 'Comment deleted.'
        });
    } catch (error) {
        if (error.message === 'Comment not found.' ||
            error.message === 'Not authorized to delete this comment.') {
            return res.status(403).json({ status: 'error', message: error.message });
        }
        next(error);
    }
}

module.exports = { createComment, listComments, removeComment };
