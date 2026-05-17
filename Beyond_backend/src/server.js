// ============================================================================
// server.js — HTTP Server Entry Point
// ============================================================================
//
// 🎓 LEARNING: This is the file you run to start the backend:
//   node src/server.js        (production)
//   nodemon src/server.js     (development — auto-restarts on file changes)
//
// It does exactly TWO things:
//   1. Loads environment variables from the .env file
//   2. Starts the Express app listening on a port
//
// We load dotenv HERE (before importing app) because app.js, services,
// and middlewares all rely on process.env variables being available.
// If we loaded dotenv inside app.js, the import order could cause issues.
// ============================================================================

// Load environment variables from .env file FIRST, before anything else
// This makes process.env.DATABASE_URL, process.env.JWT_SECRET, etc. available
require('dotenv').config();

// Import the configured Express application
const app = require('./app');

// Read the port from environment variables, or default to 3000
// 🎓 LEARNING: Using process.env.PORT allows deployment platforms (Heroku, Railway, etc.)
// to assign their own port. Hardcoding a port would break cloud deployments.
const PORT = process.env.PORT || 3000;

// Start the HTTP server
app.listen(PORT, () => {
    console.log(`=================================`);
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`=================================`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`API base:     http://localhost:${PORT}/api`);
});
