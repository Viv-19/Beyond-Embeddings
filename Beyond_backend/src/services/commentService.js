// ============================================================================
// commentService.js — Comment Business Logic
// ============================================================================
//
// 🎓 LEARNING: Comments are a "join" entity — they connect Users to Posts.
// A comment only makes sense in the context of BOTH a user and a post.
// That's why the Comment model has two foreign keys: user_id and post_id.
//
// This service handles creating comments and fetching them.
// Deletion cascades are handled by Prisma (when a post or user is deleted,
// their comments are automatically removed).
// ============================================================================

const prisma = require('../config/db');

// ============================================================================
// addComment — Creates a new comment on a post
// ============================================================================
// @param {string} postId — The ID of the post being commented on
// @param {string} userId — The ID of the user writing the comment
// @param {string} text — The comment text
// @returns {object} The created comment with the author's username
//
// 🎓 LEARNING: We return the comment with `include: { user }` so the
// frontend immediately has the username to display without making another API call.
// This is called "response enrichment" — returning more data than strictly
// necessary to reduce the number of round-trips between client and server.
// ============================================================================
async function addComment(postId, userId, text, parentId = null) {
    // Verify the post exists before creating a comment
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
        throw new Error('Post not found.');
    }

    // Create the comment and include the author's username and role in the response
    const comment = await prisma.comment.create({
        data: {
            text,
            user_id: userId,
            post_id: postId,
            parent_id: parentId || null
        },
        include: {
            user: {
                select: { username: true, role: true }  // Return username and role
            }
        }
    });

    return comment;
}

// ============================================================================
// getCommentsByPost — Retrieves all comments for a specific post
// ============================================================================
// @param {string} postId — The post ID
// @returns {array} Array of comments with author usernames, oldest first
// ============================================================================
async function getCommentsByPost(postId) {
    return await prisma.comment.findMany({
        where: { post_id: postId },
        include: {
            user: {
                select: { username: true, role: true }
            }
        },
        orderBy: { created_at: 'asc' }  // Chronological order
    });
}

// ============================================================================
// deleteComment — Deletes a comment (admin only or comment owner)
// ============================================================================
// @param {string} commentId — The comment ID
// @param {string} userId — The requesting user's ID (for ownership verification)
// @param {string} userRole — The requesting user's role ("admin" bypasses ownership check)
// ============================================================================
async function deleteComment(commentId, userId, userRole) {
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });

    if (!comment) {
        throw new Error('Comment not found.');
    }

    // Only allow deletion if the user owns the comment OR is an admin
    if (comment.user_id !== userId && userRole !== 'admin') {
        throw new Error('Not authorized to delete this comment.');
    }

    return await prisma.comment.delete({ where: { id: commentId } });
}

module.exports = {
    addComment,
    getCommentsByPost,
    deleteComment
};
