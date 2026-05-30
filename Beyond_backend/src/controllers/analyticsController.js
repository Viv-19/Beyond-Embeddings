// ============================================================================
// analyticsController.js — HTTP Handlers for Analytics
// ============================================================================
//
// Endpoints:
//   POST /api/analytics/visit — Record a page visit (public, no auth)
//   GET  /api/analytics/stats — Get dashboard stats (admin only)
// ============================================================================

const analyticsService = require('../services/analyticsService');

// ============================================================================
// POST /api/analytics/visit — Record a page visit
// ============================================================================
// Request body: { path: "/post/gemma-4" }
// Called by the frontend on every page navigation.
// No auth required — we track anonymous visitors too.
// ============================================================================
async function recordVisit(req, res, next) {
    try {
        const { path } = req.body;

        if (!path) {
            return res.status(400).json({
                status: 'error',
                message: 'Path is required.'
            });
        }

        // If the user is authenticated (token provided), extract their ID
        let userId = null;
        if (req.user && req.user.id) {
            userId = req.user.id;
        }

        await analyticsService.recordVisit(path, userId);

        res.status(201).json({
            status: 'success',
            message: 'Visit recorded.'
        });
    } catch (error) {
        next(error);
    }
}

// ============================================================================
// GET /api/analytics/stats — Get all analytics data (admin only)
// ============================================================================
// Returns comprehensive dashboard statistics.
// Protected by protect + adminOnly middlewares.
// ============================================================================
async function getStats(req, res, next) {
    try {
        const stats = await analyticsService.getStats();

        res.status(200).json({
            status: 'success',
            data: stats
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    recordVisit,
    getStats
};
