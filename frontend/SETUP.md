# Frontend Setup Guide

## Prerequisites
- Node.js v18+ installed
- npm or yarn package manager
- Backend server running on `http://localhost:5000`

## Installation Steps

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

### 3. Build for Production
```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

## Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable components
│   │   ├── Layout/      # Layout components (Navbar, Sidebar)
│   │   └── Common/      # Common components (future)
│   ├── context/         # React contexts
│   │   └── AuthContext.jsx
│   ├── pages/           # Page components
│   │   ├── Admin/       # Admin pages
│   │   ├── Faculty/     # Faculty pages
│   │   └── Login.jsx
│   ├── styles/          # CSS files
│   │   └── global.css
│   ├── utils/           # Utility functions
│   │   └── api.js       # Axios instance
│   ├── App.jsx          # Main app component
│   └── main.jsx         # Entry point
├── index.html           # HTML template
├── vite.config.js       # Vite configuration
└── package.json         # Dependencies
```

## Features Implemented

### ✅ Authentication
- Login page with email/password
- JWT token management
- Session persistence
- Protected routes
- Role-based access control (Admin/Faculty)

### ✅ Layout
- Responsive navbar with user info
- Collapsible sidebar navigation
- Role-based menu items
- Mobile-friendly design

### ✅ Dashboards
- **Admin Dashboard**: Statistics for programs, branches, courses, faculty, questions, QP
- **Faculty Dashboard**: My courses and questions statistics

### ✅ Design System
- Modern CSS variables
- Gradient color scheme (Purple/Blue)
- Glassmorphism effects
- Smooth animations
- Responsive utilities
- Premium aesthetics

## API Integration

The frontend uses Axios with automatic:
- JWT token injection in headers
- Session cookie handling
- 401 error handling (auto-redirect to login)
- Base URL configuration via Vite proxy

## Available Routes

### Public Routes
- `/login` - Login page

### Admin Routes (Protected)
- `/admin/dashboard` - Admin dashboard
- `/admin/programs` - Program management (to be implemented)
- `/admin/branches` - Branch management (to be implemented)
- `/admin/regulations` - Regulation management (to be implemented)
- `/admin/pb-mapping` - Program-Branch mapping (to be implemented)
- `/admin/courses` - Course management (to be implemented)
- `/admin/bc-mapping` - Branch-Course mapping (to be implemented)
- `/admin/faculty` - Faculty management (to be implemented)
- `/admin/fc-mapping` - Faculty-Course mapping (to be implemented)
- `/admin/course-plugins` - Course plugins (to be implemented)
- `/admin/qp-generation` - QP generation (to be implemented)

### Faculty Routes (Protected)
- `/faculty/dashboard` - Faculty dashboard
- `/faculty/my-courses` - My courses (to be implemented)
- `/faculty/change-password` - Change password (to be implemented)

## Default Login Credentials

**Admin:**
- Email: admin@erp.com
- Password: Admin@123

**Faculty:**
- Use credentials sent via email when created by admin

## Development Tips

### Hot Module Replacement (HMR)
Vite provides instant HMR. Changes to React components will reflect immediately without full page reload.

### API Proxy
The Vite dev server proxies `/api` and `/uploads` requests to `http://localhost:5000`. No CORS issues during development.

### State Management
Currently using React Context for authentication. For complex state, consider adding Redux or Zustand.

### Styling Approach
- Global styles in `src/styles/global.css`
- Component-specific styles in same directory as component
- Use CSS variables from global.css for consistency

## Browser Support
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance
- Code splitting via React.lazy() (can be added)
- Tree shaking enabled
- Minification in production build
- Gzip compression recommended for deployment

## Deployment

### Static Hosting (Netlify, Vercel, AWS S3)
```bash
npm run build
# Deploy the 'dist' folder
```

### Environment Variables
Create `.env` file for production:
```env
VITE_API_URL=https://your-api-domain.com
```

Update `vite.config.js` to use environment variable for API proxy.

## Troubleshooting

### Port Already in Use
Change port in `vite.config.js`:
```js
server: {
  port: 3000  // Change to desired port
}
```

### API Connection Error
- Ensure backend is running on port 5000
- Check browser console for CORS errors
- Verify proxy configuration in `vite.config.js`

### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

To complete the frontend, implement:
1. All Admin module pages (Programs, Branches, etc.)
2. All Faculty module pages (My Courses, Questions, etc.)
3. QP Generation interface with PDF preview
4. Bulk upload interfaces
5. Form validation
6. Loading states and error handling
7. Pagination for large datasets
8. Search and filter functionality

## Tech Stack
- **React 18** - UI library
- **Vite** - Build tool
- **React Router v6** - Routing
- **Axios** - HTTP client
- **Vanilla CSS** - Styling (no framework for maximum control)
