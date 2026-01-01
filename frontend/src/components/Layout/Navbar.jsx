/**
 * Navbar Component
 */

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import './Navbar.css';

function Navbar({ toggleSidebar }) {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <button className="menu-toggle" onClick={toggleSidebar} aria-label="Toggle sidebar">
                    <span className="menu-icon">☰</span>
                </button>
                <h2 className="navbar-title">Academic ERP</h2>
            </div>

            <div className="navbar-right">
                <button className="btn-icon" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}>
                    {theme === 'dark' ? '☀️' : '🌙'}
                </button>

                <div className="user-info">
                    <div className="user-details">
                        <span className="user-name">{user?.facultyInfo?.facultyName || user?.email}</span>
                        <span className="user-role">{user?.userType}</span>
                    </div>
                    <button className="btn btn-secondary btn-sm" onClick={logout}>
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
