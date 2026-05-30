// ============================================================================
// analyticsRoutes.js — Route Definitions for Analytics
// ============================================================================

const express = require('express');
const analyticsController = require('../controllers/analyticsController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

const router = express.Router();

// ============================================================================
// PUBLIC ROUTES
// ============================================================================

// POST /api/analytics/visit — Record a page visit (no auth needed)
// Wait, we can optionally use the protect middleware without failing if there's no token.
// Actually, `protect` fails if there's no token. 
// We should create an optionalAuth middleware, or just let the controller handle it if we want to track user_id.
// For now, let's keep it simple. If we want to extract user_id, we can parse the token in the controller itself or use a soft-protect middleware.
// Let's modify the controller slightly to parse the token manually if present, or just leave it anonymous.
router.post('/visit', (req, res, next) => {
    // Soft token extraction (don't fail if missing)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        const jwt = require('jsonwebtoken');
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_dev');
            req.user = { id: decoded.userId };
        } catch (e) {
            // Ignore invalid tokens for this public endpoint
        }
    }
    next();
}, analyticsController.recordVisit);

// ============================================================================
// ADMIN ROUTES — JWT token + admin role required
// ============================================================================

// GET /api/analytics/stats — Get dashboard stats
router.get('/stats', protect, adminOnly, analyticsController.getStats);

module.exports = router;
