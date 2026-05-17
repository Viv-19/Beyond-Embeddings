// ============================================================================
// commentRoutes.js — Route Definitions for Comments
// ============================================================================
//
// 🎓 LEARNING: These routes handle user-generated comments on posts.
// Comments require authentication (you must be logged in to comment),
// but reading comments is public (anyone can see them).
//
// This follows the principle of "read-open, write-protected" — maximize
// content visibility while preventing abuse.
// ============================================================================

const express = require('express');
const commentController = require('../controllers/commentController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// ============================================================================
// PUBLIC ROUTES
// ============================================================================

// GET /api/comments/:postId — Get all comments for a specific post
// No auth required — comments are publicly visible
router.get('/:postId', commentController.listComments);

// ============================================================================
// PROTECTED ROUTES — JWT token required
// ============================================================================

// POST /api/comments — Create a new comment
// Requires authentication so we know WHO is commenting
router.post('/', protect, commentController.createComment);

// DELETE /api/comments/:id — Delete a comment
// Requires authentication — only the author or an admin can delete
router.delete('/:id', protect, commentController.removeComment);

module.exports = router;
