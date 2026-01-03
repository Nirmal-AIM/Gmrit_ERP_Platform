/**
 * Main Layout Component
 * Wraps all authenticated pages with navbar and sidebar
 */

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Chatbot from '../Common/Chatbot';

function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className="layout">
            <Navbar toggleSidebar={toggleSidebar} />
            <div className="layout-body" style={{ paddingTop: '80px' }}>
                <Sidebar isOpen={sidebarOpen} />
                <main className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                    <div className="container-fluid">
                        <Outlet />
                    </div>
                </main>
            </div>
            <Chatbot />
        </div>
    );
}

export default Layout;
