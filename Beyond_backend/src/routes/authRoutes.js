// ============================================================================
// authRoutes.js — Route Definitions for Authentication
// ============================================================================
//
// 🎓 LEARNING: What is a Router?
// express.Router() creates a mini Express application that handles routes.
// We define routes here and then "mount" this router in app.js at a prefix:
//   app.use('/api/auth', authRoutes);
//
// So when we define `router.post('/signup', ...)` here, the full URL becomes:
//   POST /api/auth/signup
//
// This is called "modular routing" — each feature gets its own route file.
// Benefits: clean separation, easy to add/remove features, clear ownership.
// ============================================================================

const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// --- Public Routes (no authentication required) ---
// These endpoints are accessible to anyone — they're how users CREATE accounts
// and OBTAIN JWT tokens. Protecting them would be a chicken-and-egg problem.

// POST /api/auth/signup — Create a new user account
router.post('/signup', authController.signup);

// POST /api/auth/login — Log in and receive a JWT token
router.post('/login', authController.login);

// POST /api/auth/admin-login — Log in as admin (verified server-side)
router.post('/admin-login', authController.adminLogin);

// --- Protected Routes (JWT required) ---
// These endpoints require a valid JWT token in the Authorization header.
// The `protect` middleware verifies the token before the controller runs.

// GET /api/auth/me — Get the current user's profile
// 🎓 LEARNING: This is the "session check" endpoint. The frontend calls this
// on page load to verify the stored token is still valid. If it returns 401,
// the frontend clears the token and redirects to login.
router.get('/me', protect, authController.getMe);

module.exports = router;
