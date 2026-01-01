/**
 * Sidebar Component
 * Navigation menu for Admin and Faculty
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

function Sidebar({ isOpen }) {
    const { isAdmin, isFaculty } = useAuth();

    const adminMenuItems = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/admin/programs', label: 'Programs', icon: '🎓' },
        { path: '/admin/branches', label: 'Branches', icon: '🏢' },
        { path: '/admin/regulations', label: 'Regulations', icon: '📋' },
        { path: '/admin/pb-mapping', label: 'P-B Mapping', icon: '🔗' },
        { path: '/admin/courses', label: 'Courses', icon: '📚' },
        { path: '/admin/bc-mapping', label: 'B-C Mapping', icon: '🔗' },
        { path: '/admin/faculty', label: 'Faculty', icon: '👥' },
        { path: '/admin/fc-mapping', label: 'F-C Mapping', icon: '🔗' },
        { path: '/admin/course-plugins', label: 'Course Plugins', icon: '🔌' },
        { path: '/admin/qp-generation', label: 'QP Generation', icon: '📝' }
    ];

    const facultyMenuItems = [
        { path: '/faculty/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/faculty/my-courses', label: 'My Courses', icon: '📚' },
        { path: '/faculty/change-password', label: 'Change Password', icon: '🔒' }
    ];

    const menuItems = isAdmin ? adminMenuItems : facultyMenuItems;

    return (
        <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `sidebar-link ${isActive ? 'active' : ''}`
                        }
                    >
                        <span className="sidebar-icon">{item.icon}</span>
                        <span className="sidebar-label">{item.label}</span>
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}

export default Sidebar;
