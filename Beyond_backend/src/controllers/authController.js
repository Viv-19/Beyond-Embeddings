// ============================================================================
// authController.js — HTTP Handlers for Authentication
// ============================================================================
//
// 🎓 LEARNING: What is a "Controller"?
// Controllers are the bridge between HTTP and business logic.
// They do THREE things:
//   1. Parse input from the request (req.body, req.params, req.query)
//   2. Call the appropriate service function
//   3. Format and send the response (res.json, res.status)
//
// Controllers should NEVER contain business logic (password hashing, DB queries).
// That belongs in the service layer. If you find yourself writing Prisma queries
// inside a controller, move them to a service.
// ============================================================================

const authService = require('../services/authService');

// ============================================================================
// POST /api/auth/signup — Register a new user account
// ============================================================================
// Request body: { username, email, password }
// Success: 201 Created + user object + JWT token
// Error: 409 Conflict (email taken) or 400 Bad Request (missing fields)
// ============================================================================
async function signup(req, res, next) {
    try {
        const { username, email, password } = req.body;

        // --- Input Validation ---
        // 🎓 LEARNING: Always validate on the server side, even if the frontend
        // already validates. A malicious user can bypass the frontend entirely
        // by sending requests directly via cURL, Postman, or browser DevTools.
        if (!username || !email || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Username, email, and password are required.'
            });
        }

        // Delegate to the service layer for actual registration logic
        const result = await authService.registerUser(username, email, password);

        // Send success response with the new user data and JWT token
        res.status(201).json({
            status: 'success',
            message: 'Account created successfully!',
            data: result
        });

    } catch (error) {
        // Handle known errors with appropriate HTTP status codes
        if (error.message === 'User with this email already exists.') {
            return res.status(409).json({ status: 'error', message: error.message });
        }
        // Pass unknown errors to the global error handler
        next(error);
    }
}

// ============================================================================
// POST /api/auth/login — Authenticate a user and return a JWT
// ============================================================================
// Request body: { email, password }
// Success: 200 OK + user object + JWT token
// Error: 401 Unauthorized (wrong credentials)
// ============================================================================
async function login(req, res, next) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Email and password are required.'
            });
        }

        const result = await authService.loginUser(email, password);

        res.status(200).json({
            status: 'success',
            message: 'Logged in successfully!',
            data: result
        });

    } catch (error) {
        if (error.message === 'Invalid email or password.') {
            return res.status(401).json({ status: 'error', message: error.message });
        }
        next(error);
    }
}

// ============================================================================
// POST /api/auth/admin-login — Authenticate an admin user
// ============================================================================
// Same as login, but also verifies the user has role="admin".
// This is used by the CMS admin panel.
//
// 🎓 LEARNING: We have a separate admin login endpoint (instead of just
// checking the role on the frontend) because it's more secure. The frontend
// should never be the sole gatekeeper for admin access — a determined user
// could modify the frontend code to bypass role checks.
// ============================================================================
async function adminLogin(req, res, next) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Email and password are required.'
            });
        }

        const result = await authService.loginAdmin(email, password);

        res.status(200).json({
            status: 'success',
            message: 'Admin authenticated successfully!',
            data: result
        });

    } catch (error) {
        if (error.message === 'Invalid email or password.' ||
            error.message === 'Access denied. Admin privileges required.') {
            return res.status(401).json({ status: 'error', message: error.message });
        }
        next(error);
    }
}

// ============================================================================
// GET /api/auth/me — Get the current user's profile (requires JWT)
// ============================================================================
// This endpoint is called by the frontend on page load to check if the
// stored JWT token is still valid. If it is, the user stays logged in.
// If not (expired or tampered), the frontend redirects to the login page.
//
// 🎓 LEARNING: The `protect` middleware (in authMiddleware.js) runs before
// this handler. By the time we get here, req.user.id is guaranteed to be set.
// ============================================================================
async function getMe(req, res, next) {
    try {
        const prisma = require('../config/db');
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                username: true,
                email: true,
                role: true
            }
        });

        if (!user) {
            return res.status(404).json({ status: 'error', message: 'User not found.' });
        }

        res.status(200).json({
            status: 'success',
            data: { user }
        });

    } catch (error) {
        next(error);
    }
}

module.exports = { signup, login, adminLogin, getMe };
