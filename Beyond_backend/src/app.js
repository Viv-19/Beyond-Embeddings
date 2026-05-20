// ============================================================================
// app.js — Express Application Setup
// ============================================================================
//
// 🎓 LEARNING: Why separate app.js from server.js?
// This is the "separation of concerns" pattern used in production:
//   - app.js  → Configures Express (middlewares, routes, error handling)
//   - server.js → Starts the HTTP server (listens on a port)
//
// Benefits:
//   1. Testing: You can import `app` in tests without starting a real server.
//   2. Clarity: Each file has a single, clear responsibility.
//   3. Flexibility: You can attach `app` to different servers (HTTP, HTTPS, WebSocket).
//
// This is the exact same pattern used in the Academic Sloth backend.
// ============================================================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');

// --- Initialize the Express application ---
const app = express();

// ============================================================================
// MIDDLEWARE STACK
// ============================================================================
// Middlewares are functions that run on EVERY request, in the order they are
// registered. Think of them as a pipeline:
//   Request → Helmet → CORS → Morgan → JSON Parser → Routes → Error Handler
// ============================================================================

// 1. Helmet: Sets secure HTTP headers to protect against common web vulnerabilities
//    (XSS, clickjacking, MIME sniffing, etc.)
//    🎓 LEARNING: Always use Helmet in production. It's a one-liner that prevents
//    entire categories of attacks. There's no reason NOT to use it.
app.use(helmet());

// 2. CORS (Cross-Origin Resource Sharing): Allows the React frontend (running on
//    a different port, e.g. localhost:5173) to make API requests to this backend.
//    Without CORS, the browser would block all cross-origin requests.
//    🎓 LEARNING: In production, you'd restrict this to your specific domain:
//    app.use(cors({ origin: 'https://beyondembeddings.com' }))
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

// 3. Morgan: HTTP request logger — prints each incoming request to the console.
//    The 'dev' format shows: :method :url :status :response-time ms
//    Example output: POST /api/auth/login 200 45ms
//    🎓 LEARNING: Invaluable for debugging. In production, switch to 'combined'
//    format and pipe to a log file instead of console.
app.use(morgan('dev'));

// 4. Rate Limiting: Prevent brute-force attacks and spam
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true,
    legacyHeaders: false,
    message: { status: 'error', message: 'Too many requests, please try again later.' }
});
app.use('/api', limiter);

// 5. JSON Body Parser: Parses incoming JSON request bodies and makes them
//    available as `req.body`. Without this, `req.body` would be `undefined`.
app.use(express.json());

// 6. URL-Encoded Body Parser: Parses form submissions (application/x-www-form-urlencoded)
//    `extended: true` allows nested objects in form data.
app.use(express.urlencoded({ extended: true }));

// 7. Static File Serving: Serve uploaded images from the /uploads directory
//    🎓 LEARNING: express.static() serves files directly without going through
//    any route handler. A request for /uploads/photo.jpg will serve the file at
//    Beyond_backend/uploads/photo.jpg automatically.
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ============================================================================
// ROUTE MOUNTING
// ============================================================================
// Each route module handles a specific "resource" or "domain" of the application.
// We prefix each one with /api/ to clearly separate API routes from static files.
//
// 🎓 LEARNING: This is the "modular routing" pattern. Each route file is a
// mini Express app (an express.Router()) that we "mount" at a specific path.
// This keeps app.js clean and each route file focused on one thing.
// ============================================================================

const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');

// Mount route modules at their respective URL prefixes
app.use('/api/auth', authRoutes);         // POST /api/auth/signup, /api/auth/login
app.use('/api/posts', postRoutes);        // GET /api/posts, POST /api/posts, etc.
app.use('/api/comments', commentRoutes);  // POST /api/comments, etc.

// ============================================================================
// HEALTH CHECK ENDPOINT
// ============================================================================
// A simple endpoint that returns 200 OK if the server is alive.
// Used by load balancers, Docker health checks, and monitoring tools
// to verify the service is running.
//
// 🎓 LEARNING: Every production backend should have a /health endpoint.
// It's the first thing you check when something goes wrong in deployment.
// ============================================================================
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'BeyondEmbeddings Backend is running.',
        timestamp: new Date().toISOString()
    });
});

// ============================================================================
// GLOBAL ERROR HANDLER
// ============================================================================
// This is a special Express middleware with 4 arguments: (err, req, res, next).
// Express automatically sends errors here if any route calls `next(error)`.
//
// 🎓 LEARNING: Without this, unhandled errors would crash the entire server.
// This middleware catches them, logs the stack trace for debugging, and sends
// a clean error response to the client instead of exposing internal details.
// ============================================================================
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err.stack);

    // Handle Prisma Specific Errors
    if (err.code === 'P2002') {
        return res.status(400).json({
            status: 'error',
            message: `A unique constraint failed on the field: ${err.meta?.target?.join(', ')}`
        });
    }

    if (err.code === 'P2025') {
        return res.status(404).json({
            status: 'error',
            message: 'Record to update or delete not found.'
        });
    }

    res.status(500).json({
        status: 'error',
        message: err.message || 'Something went wrong on the server!'
    });
});

// Export the app so server.js can start it
module.exports = app;
