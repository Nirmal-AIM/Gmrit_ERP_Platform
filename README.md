# EVENT-WEBSAGA: Academic ERP System

A comprehensive web-based Academic ERP system with automated question paper generation for higher educational institutions.

## 🎯 Features

### Admin Module
- **Dashboard**: Overview of programs, branches, courses, and faculty
- **Program Management**: CRUD operations for academic programs (B.Tech, M.Tech, MBA, etc.)
- **Branch Management**: Manage branches with codes (CSE, IT, etc.)
- **Regulation Management**: Handle academic regulations (AR23, AR21, etc.)
- **Mapping Systems**: 
  - Program-Branch Mapping
  - Branch-Course Mapping
  - Faculty-Course Mapping
- **Course Management**: Complete course lifecycle with year, semester, type, credits
- **Faculty Management**: User management with auto-generated passwords sent via email
- **Course Plugins**: Bloom's Levels, Difficulty Levels, Units
- **Automated QP Generation**: AI-powered question paper generation with balanced distribution

### Faculty Module
- **Dashboard**: Personal overview of assigned courses
- **My Courses**: View all mapped courses in card format
- **Course Outcomes**: Manage COs for assigned courses
- **Question Bank**: Create and manage questions with image support
- **Bulk Upload**: Import questions via CSV/Excel templates
- **Change Password**: Secure password management

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JWT + bcrypt password hashing
- **Session**: express-session
- **Email**: Nodemailer
- **File Upload**: Multer
- **PDF Generation**: Puppeteer

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Styling**: Vanilla CSS with modern design system
- **Charts**: Chart.js / Recharts
- **Forms**: React Hook Form

## 📁 Project Structure

```
erp/
├── backend/
│   ├── config/              # Configuration files
│   ├── middleware/          # Express middleware
│   ├── models/              # Sequelize models
│   ├── routes/              # API routes
│   │   ├── admin/           # Admin module routes
│   │   └── faculty/         # Faculty module routes
│   ├── utils/               # Utility functions
│   ├── uploads/             # File uploads directory
│   ├── database/            # Database schema
│   └── server.js            # Entry point
├── frontend/
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── context/         # React context
│   │   ├── pages/           # Page components
│   │   ├── styles/          # CSS files
│   │   └── utils/           # Helper functions
│   └── index.html
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MySQL (v8 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
cd C:\Users\NIRMAL'S LOQ\Downloads\erp
```

2. **Setup Backend**
```bash
cd backend
npm install
```

3. **Configure Database**
- Create a MySQL database named `academic_erp`
- Update `backend/config/database.js` with your credentials
- Run the schema: `mysql -u root -p academic_erp < database/schema.sql`

4. **Configure Email**
- Update `backend/config/email.js` with your SMTP credentials

5. **Start Backend Server**
```bash
npm run dev
```
Backend runs on `http://localhost:5000`

6. **Setup Frontend**
```bash
cd ../frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`

## 🔐 Default Credentials

After running the database schema, a default admin account is created:
- **Email**: admin@erp.com
- **Password**: Admin@123

## 📊 Academic Year Logic

The system automatically calculates the academic year based on the current date:
- **Cycle**: June to May
- **Example**: June 2025 - May 2026 = Academic Year 2025-2026
- **Implementation**: Automatic calculation in all relevant modules

## 📝 Question Paper Generation

The automated QP generation algorithm:
1. Filters questions based on selected course, CO, Bloom's level, difficulty
2. Randomly selects questions matching criteria
3. Ensures balanced distribution across COs and units
4. Generates formatted PDF with institution header
5. Saves generated QP to database for future reference

## 🎨 Design Features

- **Responsive Design**: Works seamlessly on mobile, tablet, laptop, and desktop
- **Modern UI**: Glassmorphism effects, smooth animations, vibrant colors
- **Dark Mode Ready**: CSS variables for easy theming
- **Accessibility**: WCAG compliant with proper ARIA labels

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Session Management**: Server-side session validation
- **Role-Based Access**: Admin and Faculty role separation
- **SQL Injection Prevention**: Sequelize ORM parameterized queries
- **File Upload Validation**: Type and size restrictions

## 📚 API Documentation

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Admin Routes
- `/api/admin/dashboard` - Dashboard statistics
- `/api/admin/programs` - Program CRUD
- `/api/admin/branches` - Branch CRUD
- `/api/admin/regulations` - Regulation CRUD
- `/api/admin/pb-mapping` - Program-Branch mapping
- `/api/admin/courses` - Course CRUD
- `/api/admin/bc-mapping` - Branch-Course mapping
- `/api/admin/faculty` - Faculty CRUD
- `/api/admin/fc-mapping` - Faculty-Course mapping
- `/api/admin/course-plugins` - Bloom's, Difficulty, Unit CRUD
- `/api/admin/qp-generation` - Question paper generation

### Faculty Routes
- `/api/faculty/dashboard` - Faculty dashboard
- `/api/faculty/my-courses` - Get mapped courses
- `/api/faculty/course-outcomes` - CO CRUD
- `/api/faculty/questions` - Question bank CRUD
- `/api/faculty/change-password` - Password update

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm run test
```

## 📦 Deployment

### Backend Deployment
1. Set environment variables for production
2. Update database credentials
3. Configure email service
4. Deploy to Node.js hosting (Heroku, AWS, DigitalOcean)

### Frontend Deployment
1. Build production bundle: `npm run build`
2. Deploy `dist` folder to static hosting (Netlify, Vercel, AWS S3)

## 🤝 Contributing

This is an institutional project. For contributions, please contact the development team.

## 📄 License

Proprietary - All rights reserved

## 👥 Support

For support and queries, contact the IT department.

---

**Developed for Higher Educational Institutions**
