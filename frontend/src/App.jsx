/**
 * Main App Component
 * Handles routing and authentication flow
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Pages
import Login from './pages/Login';
import AdminDashboard from './pages/Admin/Dashboard';
import FacultyDashboard from './pages/Faculty/Dashboard';
import Programs from './pages/Admin/Programs';
import Branches from './pages/Admin/Branches';
import Regulations from './pages/Admin/Regulations';
import Courses from './pages/Admin/Courses';
import Faculty from './pages/Admin/Faculty';
import PBMapping from './pages/Admin/PBMapping';
import BCMapping from './pages/Admin/BCMapping';
import FCMapping from './pages/Admin/FCMapping';
import CoursePlugins from './pages/Admin/CoursePlugins';
import QPGeneration from './pages/Admin/QPGeneration';
import MyCourses from './pages/Faculty/MyCourses';
import ChangePassword from './pages/Faculty/ChangePassword';
import CourseOutcomes from './pages/Faculty/CourseOutcomes';
import Questions from './pages/Faculty/Questions';

// Layout
import Layout from './components/Layout/Layout';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && user.userType !== requiredRole) {
        return <Navigate to="/" replace />;
    }

    return children;
};

// Main App Routes
function AppRoutes() {
    const { user } = useAuth();

    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={
                user ? <Navigate to="/" replace /> : <Login />
            } />

            {/* Protected Routes */}
            <Route path="/" element={
                <ProtectedRoute>
                    <Layout />
                </ProtectedRoute>
            }>
                {/* Dashboard - Redirect based on role */}
                <Route index element={
                    user?.userType === 'Admin'
                        ? <Navigate to="/admin/dashboard" replace />
                        : <Navigate to="/faculty/dashboard" replace />
                } />

                {/* Admin Routes */}
                <Route path="admin/dashboard" element={
                    <ProtectedRoute requiredRole="Admin">
                        <AdminDashboard />
                    </ProtectedRoute>
                } />
                <Route path="admin/programs" element={
                    <ProtectedRoute requiredRole="Admin">
                        <Programs />
                    </ProtectedRoute>
                } />
                <Route path="admin/branches" element={
                    <ProtectedRoute requiredRole="Admin">
                        <Branches />
                    </ProtectedRoute>
                } />
                <Route path="admin/regulations" element={
                    <ProtectedRoute requiredRole="Admin">
                        <Regulations />
                    </ProtectedRoute>
                } />
                <Route path="admin/courses" element={
                    <ProtectedRoute requiredRole="Admin">
                        <Courses />
                    </ProtectedRoute>
                } />
                <Route path="admin/faculty" element={
                    <ProtectedRoute requiredRole="Admin">
                        <Faculty />
                    </ProtectedRoute>
                } />
                <Route path="admin/pb-mapping" element={
                    <ProtectedRoute requiredRole="Admin">
                        <PBMapping />
                    </ProtectedRoute>
                } />
                <Route path="admin/bc-mapping" element={
                    <ProtectedRoute requiredRole="Admin">
                        <BCMapping />
                    </ProtectedRoute>
                } />
                <Route path="admin/fc-mapping" element={
                    <ProtectedRoute requiredRole="Admin">
                        <FCMapping />
                    </ProtectedRoute>
                } />
                <Route path="admin/course-plugins" element={
                    <ProtectedRoute requiredRole="Admin">
                        <CoursePlugins />
                    </ProtectedRoute>
                } />
                <Route path="admin/qp-generation" element={
                    <ProtectedRoute requiredRole="Admin">
                        <QPGeneration />
                    </ProtectedRoute>
                } />

                {/* Faculty Routes */}
                <Route path="faculty/dashboard" element={
                    <ProtectedRoute requiredRole="Faculty">
                        <FacultyDashboard />
                    </ProtectedRoute>
                } />
                <Route path="faculty/my-courses" element={
                    <ProtectedRoute requiredRole="Faculty">
                        <MyCourses />
                    </ProtectedRoute>
                } />
                <Route path="faculty/course-outcomes/:courseId" element={
                    <ProtectedRoute requiredRole="Faculty">
                        <CourseOutcomes />
                    </ProtectedRoute>
                } />
                <Route path="faculty/questions/:courseId" element={
                    <ProtectedRoute requiredRole="Faculty">
                        <Questions />
                    </ProtectedRoute>
                } />
                <Route path="faculty/change-password" element={
                    <ProtectedRoute requiredRole="Faculty">
                        <ChangePassword />
                    </ProtectedRoute>
                } />
            </Route>

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <BrowserRouter>
                    <AppRoutes />
                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
