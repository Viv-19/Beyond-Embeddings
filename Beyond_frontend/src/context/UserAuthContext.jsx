// ============================================================================
// UserAuthContext.jsx — User Authentication State Management
// ============================================================================
//
// 🎓 LEARNING: What is a React Context?
// React Context is a way to share data across the component tree without
// passing props down manually through every level. It works like a "global store"
// that any component can read from or write to.
//
// This context manages:
//   - The current user object (null if not logged in)
//   - Login/register/logout functions that call the backend API
//   - JWT token storage in localStorage (persists across page refreshes)
//
// 🎓 LEARNING: Why localStorage for the token?
// When a user logs in, the backend returns a JWT token. We store it in
// localStorage so the user stays logged in even after closing the browser.
// On each page load, we call /api/auth/me to verify the token is still valid.
// If it's expired or invalid, we clear it and the user is logged out.
//
// PREVIOUSLY (before restructuring):
//   - Users were stored in localStorage as plain JSON (including passwords!)
//   - Authentication happened entirely client-side (no server verification)
//   - Anyone could inspect localStorage and see all registered users
//
// NOW (after restructuring):
//   - Passwords are hashed with bcrypt and stored in PostgreSQL
//   - Authentication is verified server-side via JWT
//   - localStorage only stores the opaque JWT token (no sensitive data)
// ============================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';

// --- API Base URL ---
// 🎓 LEARNING: We don't hardcode http://localhost:3000 here because
// the Vite proxy (vite.config.js) forwards /api/* requests to the backend.
// In production, the frontend and backend are on the same domain.
const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/auth` : '/api/auth';

// Create the context object
const UserAuthContext = createContext();

export const UserAuthProvider = ({ children }) => {
    // --- State ---
    const [user, setUser] = useState(null);       // Current user object or null
    const [loading, setLoading] = useState(true);  // True while checking token validity

    // ========================================================================
    // On mount: Check if a saved token is still valid
    // ========================================================================
    // 🎓 LEARNING: This runs ONCE when the app first loads.
    // It reads the JWT token from localStorage and calls the /me endpoint
    // to verify it. If valid, the user is logged in automatically.
    // If invalid (expired, tampered), we clear the token.
    // ========================================================================
    useEffect(() => {
        const token = localStorage.getItem('be_token') || sessionStorage.getItem('be_admin_token');
        if (token) {
            // Call the backend to verify the token and get user data
            fetch(`${API_BASE}/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => {
                    if (res.ok) return res.json();
                    throw new Error('Token invalid');
                })
                .then(data => {
                    setUser(data.data.user);
                })
                .catch(() => {
                    // Token is invalid or expired — clear it
                    localStorage.removeItem('be_token');
                    sessionStorage.removeItem('be_admin_token');
                    setUser(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    // ========================================================================
    // login — Authenticates a user via the backend API
    // ========================================================================
    // @param {string} email — User's email
    // @param {string} password — User's password (sent over HTTPS in production)
    // @returns {boolean} true if login succeeded, false otherwise
    //
    // 🎓 LEARNING: The password is sent to the backend in the request body.
    // The backend hashes it and compares with the stored hash (bcrypt).
    // We NEVER store or compare passwords on the frontend.
    // ========================================================================
    const login = async (email, password) => {
        try {
            const res = await fetch(`${API_BASE}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (res.ok) {
                // Save the JWT token to localStorage for persistence
                localStorage.setItem('be_token', data.data.token);
                setUser(data.data.user);
                return true;
            }
            return false;

        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    };

    // ========================================================================
    // register — Creates a new user account via the backend API
    // ========================================================================
    // @param {string} username — Display name
    // @param {string} email — User's email (must be unique)
    // @param {string} password — Will be hashed by the backend
    // @returns {boolean} true if registration succeeded, false otherwise
    // ========================================================================
    const register = async (username, email, password) => {
        try {
            const res = await fetch(`${API_BASE}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });

            const data = await res.json();

            if (res.ok) {
                // After successful registration, the user is automatically logged in
                localStorage.setItem('be_token', data.data.token);
                setUser(data.data.user);
                return true;
            }
            return false;

        } catch (error) {
            console.error('Register error:', error);
            return false;
        }
    };

    // ========================================================================
    // logout — Clears the token and user state
    // ========================================================================
    // 🎓 LEARNING: Logout on the frontend is simple — just delete the token.
    // The JWT is "stateless", meaning the backend doesn't keep track of active
    // sessions. Once the token is deleted from the browser, the user can't
    // make authenticated requests anymore (until they log in again).
    //
    // For more security, you could add a server-side "token blacklist" that
    // invalidates tokens before they expire. But for a blog, this is overkill.
    // ========================================================================
    const logout = () => {
        localStorage.removeItem('be_token');
        sessionStorage.removeItem('be_admin_token');
        setUser(null);
    };

    return (
        <UserAuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </UserAuthContext.Provider>
    );
};

// Custom hook for consuming the auth context
// Usage: const { user, login, logout } = useUserAuth();
export const useUserAuth = () => useContext(UserAuthContext);
