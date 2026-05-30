// ============================================================================
// analyticsService.js — Analytics Business Logic
// ============================================================================
//
// 🎓 LEARNING: This service tracks site visits and computes statistics
// for the admin analytics dashboard. It answers questions like:
//   - How many people visited the site today/this week/all time?
//   - How many users have signed up?
//   - Which posts are most viewed?
//   - How many posts of each type exist?
//
// All database queries use Prisma's aggregate/groupBy/count features.
// ============================================================================

const prisma = require('../config/db');

// ============================================================================
// recordVisit — Saves a page visit to the database
// ============================================================================
// @param {string} path — The URL path (e.g. "/", "/post/gemma-4")
// @param {string|null} userId — The user's ID if logged in, null if anonymous
// ============================================================================
async function recordVisit(path, userId = null) {
    return await prisma.siteVisit.create({
        data: {
            path,
            user_id: userId || null
        }
    });
}

// ============================================================================
// getStats — Computes all analytics data for the admin dashboard
// ============================================================================
// Returns an object with:
//   - totalVisits: All-time page views
//   - visitsToday: Page views in the last 24 hours
//   - visitsThisWeek: Page views in the last 7 days
//   - totalUsers: Number of registered users
//   - newUsersThisWeek: Users who signed up in the last 7 days
//   - totalPosts: Total content pieces
//   - postsByType: Count of each content type
//   - topPosts: The 10 most viewed posts
//   - recentVisits: Visit counts per day for the last 14 days
// ============================================================================
async function getStats() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Run all queries in parallel for speed
    const [
        totalVisits,
        visitsToday,
        visitsThisWeek,
        totalUsers,
        newUsersThisWeek,
        totalPosts,
        postsByType,
        topPosts,
        recentVisitsRaw,
        totalComments
    ] = await Promise.all([
        // 1. Total all-time visits
        prisma.siteVisit.count(),

        // 2. Visits today
        prisma.siteVisit.count({
            where: { created_at: { gte: startOfToday } }
        }),

        // 3. Visits this week
        prisma.siteVisit.count({
            where: { created_at: { gte: oneWeekAgo } }
        }),

        // 4. Total registered users
        prisma.user.count(),

        // 5. New users this week
        prisma.user.count({
            where: { created_at: { gte: oneWeekAgo } }
        }),

        // 6. Total posts
        prisma.post.count(),

        // 7. Posts grouped by type
        prisma.post.groupBy({
            by: ['type'],
            _count: { id: true }
        }),

        // 8. Top 10 most viewed posts
        prisma.post.findMany({
            orderBy: { views: 'desc' },
            take: 10,
            select: {
                id: true,
                title: true,
                slug: true,
                type: true,
                views: true,
                likes: true,
                created_at: true
            }
        }),

        // 9. Recent visits (last 14 days) for chart data
        prisma.siteVisit.findMany({
            where: { created_at: { gte: twoWeeksAgo } },
            select: { created_at: true },
            orderBy: { created_at: 'asc' }
        }),

        // 10. Total comments
        prisma.comment.count()
    ]);

    // Process recent visits into daily counts for chart visualization
    const dailyVisits = {};
    for (let i = 13; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const key = date.toISOString().split('T')[0]; // "2026-05-29"
        dailyVisits[key] = 0;
    }
    recentVisitsRaw.forEach(visit => {
        const key = visit.created_at.toISOString().split('T')[0];
        if (dailyVisits[key] !== undefined) {
            dailyVisits[key]++;
        }
    });

    // Convert postsByType from Prisma groupBy format to a clean object
    const typeCountMap = {};
    postsByType.forEach(group => {
        typeCountMap[group.type] = group._count.id;
    });

    return {
        totalVisits,
        visitsToday,
        visitsThisWeek,
        totalUsers,
        newUsersThisWeek,
        totalPosts,
        totalComments,
        postsByType: typeCountMap,
        topPosts,
        dailyVisits // { "2026-05-15": 12, "2026-05-16": 8, ... }
    };
}

module.exports = {
    recordVisit,
    getStats
};
