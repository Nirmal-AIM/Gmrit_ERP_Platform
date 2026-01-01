# Backend Setup Guide

## Prerequisites
- Node.js v18+ installed
- MySQL v8+ installed and running
- npm or yarn package manager

## Installation Steps

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the `backend` directory with the following content:

```env
NODE_ENV=development
PORT=5000

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=academic_erp
DB_PORT=3306

# JWT Secret
JWT_SECRET=academic_erp_jwt_secret_key_2026_change_in_production

# Session Secret
SESSION_SECRET=academic_erp_session_secret_key_2026_change_in_production

# Email Configuration (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password

# Frontend URL
FRONTEND_URL=http://localhost:5173

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

### 3. Setup Database
```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE academic_erp;

# Exit MySQL
exit

# Import schema
mysql -u root -p academic_erp < database/schema.sql
```

### 4. Start the Server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## Default Admin Credentials
- **Email**: admin@erp.com
- **Password**: Admin@123

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Admin Routes
- `/api/admin/dashboard` - Dashboard statistics
- `/api/admin/programs` - Program management
- `/api/admin/branches` - Branch management
- `/api/admin/regulations` - Regulation management
- `/api/admin/pb-mapping` - Program-Branch mapping
- `/api/admin/courses` - Course management
- `/api/admin/bc-mapping` - Branch-Course mapping
- `/api/admin/faculty` - Faculty management
- `/api/admin/fc-mapping` - Faculty-Course mapping
- `/api/admin/course-plugins` - Bloom's, Difficulty, Units
- `/api/admin/qp-generation` - Question paper generation

### Faculty Routes
- `/api/faculty/dashboard` - Faculty dashboard
- `/api/faculty/my-courses` - My mapped courses
- `/api/faculty/course-outcomes` - Course outcomes management
- `/api/faculty/questions` - Question bank management
- `/api/faculty/change-password` - Change password

## Email Setup (Gmail)
1. Enable 2-factor authentication on your Gmail account
2. Generate an app-specific password:
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Select "Mail" and "Other (Custom name)"
   - Copy the generated password
3. Use this password in the `.env` file as `EMAIL_PASSWORD`

## Troubleshooting

### Database Connection Error
- Verify MySQL is running
- Check database credentials in `.env`
- Ensure `academic_erp` database exists

### Email Not Sending
- Verify email credentials
- Check if app-specific password is used (for Gmail)
- Email errors won't stop the application

### Port Already in Use
- Change `PORT` in `.env` to a different port
- Or stop the process using port 5000

## File Structure
```
backend/
├── config/          # Configuration files
├── middleware/      # Express middleware
├── models/          # Sequelize models
├── routes/          # API routes
│   ├── admin/       # Admin routes
│   └── faculty/     # Faculty routes
├── utils/           # Utility functions
├── uploads/         # File uploads
├── database/        # Database schema
├── server.js        # Entry point
├── package.json     # Dependencies
└── .env             # Environment variables
```
