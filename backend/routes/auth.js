/**
 * Authentication Routes
 * 
 * Handles user login, logout, and session management
 * Routes:
 *  - POST /api/auth/login - User login
 *  - POST /api/auth/logout - User logout
 *  - GET /api/auth/me - Get current user info
 */

const express = require('express');
const router = express.Router();
const { User, Faculty } = require('../models');
const { comparePassword, generateToken, isAuthenticated } = require('../middleware/auth');

/**
 * @route   POST /api/auth/login
 * @desc    Login user (Admin or Faculty)
 * @access  Public
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find user by email
        const user = await User.findOne({
            where: { email, isActive: true }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Verify password
        const isPasswordValid = await comparePassword(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate JWT token
        const token = generateToken({
            id: user.id,
            email: user.email,
            userType: user.userType
        });

        // Save token in session
        req.session.token = token;
        req.session.userId = user.id;
        req.session.userType = user.userType;

        // Get additional info if Faculty
        let facultyInfo = null;
        if (user.userType === 'Faculty') {
            facultyInfo = await Faculty.findOne({
                where: { userId: user.id },
                attributes: ['id', 'facultyName', 'empId', 'honorific']
            });
        }

        // Send response
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    userType: user.userType,
                    facultyInfo: facultyInfo || null
                }
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', isAuthenticated, (req, res) => {
    try {
        // Destroy session
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Logout failed'
                });
            }

            res.json({
                success: true,
                message: 'Logout successful'
            });
        });

    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Logout failed',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user information
 * @access  Private
 */
router.get('/me', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: ['id', 'email', 'userType', 'isActive']
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get faculty info if user is faculty
        let facultyInfo = null;
        if (user.userType === 'Faculty') {
            facultyInfo = await Faculty.findOne({
                where: { userId: user.id },
                attributes: ['id', 'facultyName', 'empId', 'honorific', 'phoneNumber']
            });
        }

        res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    userType: user.userType,
                    isActive: user.isActive,
                    facultyInfo: facultyInfo || null
                }
            }
        });

    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user information',
            error: error.message
        });
    }
});

module.exports = router;
