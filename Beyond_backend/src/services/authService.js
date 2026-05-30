// ============================================================================
// authService.js — Authentication Business Logic
// ============================================================================
//
// 🎓 LEARNING: What is a "Service"?
// In the Controller → Service → Database pattern:
//   - Controllers handle HTTP (req, res) — they parse input and format output
//   - Services handle BUSINESS LOGIC — the actual work (hashing, DB queries, etc.)
//   - The database layer (Prisma) handles data persistence
//
// Why separate Controllers from Services?
//   1. Testability: You can test business logic without spinning up an HTTP server
//   2. Reusability: Multiple controllers (or background jobs) can call the same service
//   3. Clarity: Each layer has one job — no mixing of HTTP logic with DB queries
//
// This is the exact same architecture used in the Academic Sloth backend.
// ============================================================================

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

// We will read the JWT secret from environment variables at call time to avoid timing issues in AWS Lambda.

// ============================================================================
// registerUser — Creates a new user account
// ============================================================================
// Steps:
//   1. Check if email is already taken
//   2. Hash the password with bcrypt
//   3. Save the user to the database
//   4. Generate a JWT token
//   5. Return the user object and token
//
// 🎓 LEARNING: Why hash passwords?
// If your database is ever breached (it happens to big companies too),
// hashed passwords are useless to attackers. bcrypt is the gold standard
// because it's intentionally SLOW (making brute-force attacks impractical)
// and automatically handles salting (adding random data before hashing).
// ============================================================================
async function registerUser(username, email, password) {
    // 1. Check for existing user with the same email
    const existingUser = await prisma.user.findUnique({
        where: { email }
    });

    if (existingUser) {
        throw new Error('User with this email already exists.');
    }

    // 2. Hash the password
    // The "10" is the salt rounds — higher = more secure but slower
    // 10 is the industry standard (takes ~100ms to hash)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create the user in the database
    const user = await prisma.user.create({
        data: {
            username,
            email,
            password_hash: hashedPassword,
            role: 'reader' // Default role — admin accounts are created manually
        }
    });

    // 4. Generate a JWT token so the user is immediately logged in
    // 🎓 LEARNING: The token payload contains the userId and role.
    // This data is embedded IN the token itself (base64-encoded, NOT encrypted).
    // Anyone can decode a JWT and read the payload — but they can't MODIFY it
    // without the secret key. That's why we never put sensitive data (passwords,
    // credit cards) in the payload.
    const secret = process.env.JWT_SECRET || 'fallback_secret_for_dev';
    const token = jwt.sign(
        { userId: user.id, role: user.role },
        secret,
        { expiresIn: '1d' } // Token expires in 1 day
    );

    // 5. Return user data (without the password hash!) and the token
    return {
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        },
        token
    };
}

// ============================================================================
// loginUser — Authenticates an existing user
// ============================================================================
// Steps:
//   1. Find the user by email
//   2. Compare the provided password with the stored hash
//   3. Generate a JWT token
//   4. Return user data and token
//
// 🎓 LEARNING: We use the SAME error message ("Invalid email or password")
// for both "user not found" and "wrong password" cases. This is intentional!
// If we said "User not found" vs "Wrong password", an attacker could figure
// out which emails are registered in our system. This is called "user enumeration".
// ============================================================================
async function loginUser(email, password) {
    // 1. Look up the user by email
    const user = await prisma.user.findUnique({
        where: { email }
    });

    // Use the same error message for both cases (prevents user enumeration)
    if (!user) {
        throw new Error('Invalid email or password.');
    }

    // 2. Compare the plaintext password with the stored bcrypt hash
    // bcrypt.compare() internally extracts the salt from the hash and
    // re-hashes the input to see if they match
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
        throw new Error('Invalid email or password.');
    }

    // 3. Generate JWT token
    const secret = process.env.JWT_SECRET || 'fallback_secret_for_dev';
    const token = jwt.sign(
        { userId: user.id, role: user.role },
        secret,
        { expiresIn: '1d' }
    );

    // 4. Return user data and token
    return {
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        },
        token
    };
}

// ============================================================================
// loginAdmin — Authenticates an admin user
// ============================================================================
// Identical to loginUser but adds a role check.
// Only users with role="admin" can access the CMS.
// ============================================================================
async function loginAdmin(email, password) {
    const result = await loginUser(email, password);

    if (result.user.role !== 'admin') {
        throw new Error('Access denied. Admin privileges required.');
    }

    return result;
}

module.exports = {
    registerUser,
    loginUser,
    loginAdmin
};
