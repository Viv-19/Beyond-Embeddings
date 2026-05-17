// ============================================================================
// db.js — Prisma Client Singleton
// ============================================================================
//
// 🎓 LEARNING: Why a singleton?
// Every time you write `new PrismaClient()`, it opens a new connection pool
// to your database. If every file that needs DB access creates its own instance,
// you'd quickly exhaust your database's connection limit.
//
// By creating ONE instance here and exporting it, every file in the project
// shares the same connection pool. This is the standard pattern used in
// production Node.js applications.
//
// Usage in any other file:
//   const prisma = require('../config/db');
//   const users = await prisma.user.findMany();
// ============================================================================

const { PrismaClient } = require('@prisma/client');

// Initialize a single Prisma Client instance for the entire application
const prisma = new PrismaClient();

module.exports = prisma;
