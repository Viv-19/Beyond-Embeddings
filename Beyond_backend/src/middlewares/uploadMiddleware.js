// ============================================================================
// uploadMiddleware.js — File Upload Handler (Multer)
// ============================================================================
//
// 🎓 LEARNING: What is Multer?
// Browsers send file uploads as "multipart/form-data" — a special encoding
// that mixes text fields and binary file data. Express's built-in JSON parser
// cannot handle this format. Multer is the de-facto middleware for parsing
// multipart form data in Express.
//
// How it works:
//   1. The frontend sends a FormData object with a file field
//   2. Multer intercepts the request, saves the file to disk
//   3. Multer attaches file info to `req.file` (single file) or `req.files` (multiple)
//   4. Your route handler can then access req.file.path, req.file.originalname, etc.
//
// Usage in routes:
//   router.post('/upload', upload.single('image'), controller.handleUpload);
//   The 'image' string must match the field name in the frontend's FormData.
// ============================================================================

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// --- Ensure the uploads directory exists ---
// 🎓 LEARNING: We create the directory at module load time (not per-request)
// because this only needs to happen once. `recursive: true` creates parent
// directories if they don't exist (like `mkdir -p` in Linux).
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// --- Configure Multer's disk storage ---
// This tells Multer WHERE to save files and WHAT to name them.
const storage = multer.diskStorage({
    // destination: The folder where uploaded files will be saved
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    // filename: How to name the saved file
    // 🎓 LEARNING: We prepend a timestamp + random number to prevent collisions.
    // If two users upload "photo.jpg" at the same time, they won't overwrite each other.
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

// --- Configure the Multer instance with our storage rules ---
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size for images
    },
    // fileFilter: Only accept image files (JPEG, PNG, GIF, WebP)
    // 🎓 LEARNING: Always validate file types on the server side.
    // The frontend might check file types too, but a malicious user can bypass
    // the frontend entirely using tools like cURL or Postman.
    fileFilter: function (req, file, cb) {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);  // Accept the file
        } else {
            cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed!'), false);
        }
    }
});

module.exports = upload;
