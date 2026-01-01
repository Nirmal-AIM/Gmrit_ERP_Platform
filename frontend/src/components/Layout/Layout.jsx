/**
 * Main Layout Component
 * Wraps all authenticated pages with navbar and sidebar
 */

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import './Layout.css';

function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className="layout">
            <Navbar toggleSidebar={toggleSidebar} />
            <div className="layout-body">
                <Sidebar isOpen={sidebarOpen} />
                <main className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                    <div className="container-fluid">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Layout;
