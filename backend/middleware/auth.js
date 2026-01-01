/**
 * Authentication Middleware
 * 
 * This file contains middleware functions for:
 * 1. Password hashing and verification (using bcrypt)
 * 2. JWT token generation and verification
 * 3. Session validation
 * 4. Role-based access control
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ============================================
// PASSWORD HASHING FUNCTIONS
// ============================================

/**
 * Hash a plain text password using bcrypt
 * 
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
const hashPassword = async (password) => {
    const saltRounds = 10; // Number of salt rounds (higher = more secure but slower)
    return await bcrypt.hash(password, saltRounds);
};

/**
 * Compare a plain text password with a hashed password
 * 
 * @param {string} password - Plain text password
 * @param {string} hashedPassword - Hashed password from database
 * @returns {Promise<boolean>} True if passwords match
 */
const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

// ============================================
// JWT TOKEN FUNCTIONS
// ============================================

/**
 * Generate a JWT token for a user
 * 
 * @param {Object} user - User object
 * @param {number} user.id - User ID
 * @param {string} user.email - User email
 * @param {string} user.userType - User type (Admin/Faculty)
 * @returns {string} JWT token
 */
const generateToken = (user) => {
    const payload = {
        id: user.id,
        email: user.email,
        userType: user.userType
    };

    const options = {
        expiresIn: '24h' // Token expires in 24 hours
    };

    return jwt.sign(payload, process.env.JWT_SECRET, options);
};

/**
 * Verify a JWT token
 * 
 * @param {string} token - JWT token
 * @returns {Object|null} Decoded token payload or null if invalid
 */
const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
};

// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================

/**
 * Middleware to verify if user is authenticated
 * Checks for JWT token in Authorization header or session
 */
const isAuthenticated = (req, res, next) => {
    try {
        // Check for token in Authorization header
        const authHeader = req.headers.authorization;
        let token = null;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7); // Remove 'Bearer ' prefix
        }

        // If no token in header, check session
        if (!token && req.session && req.session.token) {
            token = req.session.token;
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        // Verify token
        const decoded = verifyToken(token);

        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token.'
            });
        }

        // Attach user info to request object
        req.user = decoded;
        next();

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Authentication error',
            error: error.message
        });
    }
};

/**
 * Middleware to check if user is an Admin
 */
const isAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    if (req.user.userType !== 'Admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }

    next();
};

/**
 * Middleware to check if user is a Faculty
 */
const isFaculty = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    if (req.user.userType !== 'Faculty') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Faculty privileges required.'
        });
    }

    next();
};

/**
 * Middleware to check if user is either Admin or Faculty
 */
const isAdminOrFaculty = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    if (req.user.userType !== 'Admin' && req.user.userType !== 'Faculty') {
        return res.status(403).json({
            success: false,
            message: 'Access denied.'
        });
    }

    next();
};

// ============================================
// SESSION VALIDATION
// ============================================

/**
 * Middleware to validate session
 */
const validateSession = (req, res, next) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({
            success: false,
            message: 'Session expired. Please login again.'
        });
    }

    next();
};

// Export all functions and middleware
module.exports = {
    // Password functions
    hashPassword,
    comparePassword,

    // JWT functions
    generateToken,
    verifyToken,

    // Middleware
    isAuthenticated,
    isAdmin,
    isFaculty,
    isAdminOrFaculty,
    validateSession
};
