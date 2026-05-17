// ============================================================================
// authMiddleware.js — JWT Authentication Guard
// ============================================================================
//
// 🎓 LEARNING: What is a "middleware"?
// A middleware is a function that sits BETWEEN the incoming request and the
// route handler. It can:
//   - Inspect or modify the request (req)
//   - Send an early response (res) — e.g., 401 Unauthorized
//   - Pass control to the next handler (next)
//
// This middleware checks if the request has a valid JWT token in the
// Authorization header. If it does, it attaches the user's ID to `req.user`
// so the route handler knows WHO is making the request.
//
// Usage in routes:
//   router.use(protect);                    // Protect ALL routes below this line
//   router.get('/secret', protect, handler); // Protect a SINGLE route
// ============================================================================

const jwt = require('jsonwebtoken');

// Read the JWT secret from environment variables
// 🎓 LEARNING: The JWT_SECRET is the "password" used to sign and verify tokens.
// If someone knows your secret, they can forge tokens and impersonate any user.
// NEVER commit this to Git — it belongs in .env only.
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev';

/**
 * Middleware: Verifies the JWT token in the Authorization header.
 * If valid, attaches `req.user = { id: userId }` and calls next().
 * If invalid or missing, returns 401 Unauthorized.
 *
 * 🎓 LEARNING: The Authorization header format is:
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
 * The "Bearer" prefix is a convention from the OAuth 2.0 spec.
 * We split on the space to extract just the token part.
 */
function protect(req, res, next) {
    // 1. Extract the Authorization header from the incoming request
    const authHeader = req.headers.authorization;

    // 2. Check if the header exists and starts with "Bearer "
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            status: 'error',
            message: 'Not authorized. No token provided.'
        });
    }

    // 3. Extract the token (everything after "Bearer ")
    const token = authHeader.split(' ')[1];

    try {
        // 4. Verify the token using our secret key
        // jwt.verify() will throw an error if:
        //   - The token was tampered with (signature mismatch)
        //   - The token has expired (exp claim in the past)
        //   - The token is malformed
        const decoded = jwt.verify(token, JWT_SECRET);

        // 5. Attach the user's ID to the request object
        // Now any route handler after this middleware can access req.user.id
        // to know which user is making the request
        req.user = { id: decoded.userId, role: decoded.role };

        // 6. Pass control to the next middleware or route handler
        next();
    } catch (error) {
        // Token verification failed — could be expired, tampered, or malformed
        return res.status(401).json({
            status: 'error',
            message: 'Not authorized. Invalid or expired token.'
        });
    }
}

/**
 * Middleware: Restricts access to admin-only routes.
 * Must be used AFTER the `protect` middleware (which sets req.user).
 *
 * Usage:
 *   router.post('/create', protect, adminOnly, controller.create);
 *
 * 🎓 LEARNING: This is "role-based access control" (RBAC).
 * The `protect` middleware checks IF the user is logged in.
 * The `adminOnly` middleware checks if the logged-in user HAS permission.
 * They are separate because some routes need auth but not admin access.
 */
function adminOnly(req, res, next) {
    if (req.user && req.user.role === 'admin') {
        next(); // User is admin — proceed
    } else {
        return res.status(403).json({
            status: 'error',
            message: 'Forbidden. Admin access required.'
        });
    }
}

module.exports = { protect, adminOnly };
