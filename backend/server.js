/**
 * Main Server File - Academic ERP System
 * 
 * This is the entry point of the backend application
 * It sets up Express server, middleware, routes, and database connection
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const { testConnection } = require('./config/database');
const { verifyEmailConfig } = require('./config/email');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================

// CORS - Allow frontend to make requests
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true // Allow cookies and sessions
}));

// Body parser - Parse JSON and URL-encoded data
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        httpOnly: true, // Prevent XSS attacks
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Static files - Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Request logging middleware (development only)
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.path}`);
        next();
    });
}

// ============================================
// ROUTES
// ============================================

// Health check route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Academic ERP API is running',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// Authentication routes
app.use('/api/auth', require('./routes/auth'));

// Admin routes
app.use('/api/admin/dashboard', require('./routes/admin/dashboard'));
app.use('/api/admin/programs', require('./routes/admin/program'));
app.use('/api/admin/branches', require('./routes/admin/branch'));
app.use('/api/admin/regulations', require('./routes/admin/regulation'));
app.use('/api/admin/pb-mapping', require('./routes/admin/pbMapping'));
app.use('/api/admin/courses', require('./routes/admin/course'));
app.use('/api/admin/bc-mapping', require('./routes/admin/bcMapping'));
app.use('/api/admin/faculty', require('./routes/admin/faculty'));
app.use('/api/admin/fc-mapping', require('./routes/admin/fcMapping'));
app.use('/api/admin/course-plugins', require('./routes/admin/coursePlugins'));
app.use('/api/admin/qp-generation', require('./routes/admin/qpGeneration'));

// Faculty routes
app.use('/api/faculty/dashboard', require('./routes/faculty/dashboard'));
app.use('/api/faculty/my-courses', require('./routes/faculty/myCourses'));
app.use('/api/faculty/course-outcomes', require('./routes/faculty/courseOutcomes'));
app.use('/api/faculty/questions', require('./routes/faculty/questions'));
app.use('/api/faculty/change-password', require('./routes/faculty/changePassword'));

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================

// 404 handler - Route not found
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);

    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// ============================================
// START SERVER
// ============================================

const startServer = async () => {
    try {
        // Test database connection
        await testConnection();

        // Verify email configuration
        await verifyEmailConfig();

        // Start listening
        app.listen(PORT, () => {
            console.log('');
            console.log('╔════════════════════════════════════════╗');
            console.log('║   Academic ERP System - Backend API   ║');
            console.log('╚════════════════════════════════════════╝');
            console.log('');
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`🌐 API URL: http://localhost:${PORT}`);
            console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log('');
            console.log('Available endpoints:');
            console.log('  - GET  /                           Health check');
            console.log('  - POST /api/auth/login             User login');
            console.log('  - POST /api/auth/logout            User logout');
            console.log('  - GET  /api/admin/*                Admin routes');
            console.log('  - GET  /api/faculty/*              Faculty routes');
            console.log('');
            console.log('Press Ctrl+C to stop the server');
            console.log('');
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\nSIGINT signal received: closing HTTP server');
    process.exit(0);
});

// Start the server
startServer();

module.exports = app;
