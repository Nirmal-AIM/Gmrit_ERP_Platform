/**
 * Admin Dashboard Component
 */

import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import './Dashboard.css';

function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await api.get('/admin/dashboard');
            if (response.data.success) {
                setStats(response.data.data.statistics);
            }
        } catch (err) {
            setError('Failed to load dashboard data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    if (error) {
        return <div className="alert alert-error">{error}</div>;
    }

    return (
        <div className="dashboard fade-in">
            <h1>Admin Dashboard</h1>
            <p className="text-secondary">Welcome to the Academic ERP System</p>

            <div className="stats-grid grid grid-4">
                <div className="stat-card card">
                    <div className="stat-icon">🎓</div>
                    <div className="stat-content">
                        <h3>{stats?.programs?.total || 0}</h3>
                        <p>Total Programs</p>
                        <span className="stat-detail">
                            {stats?.programs?.active || 0} active
                        </span>
                    </div>
                </div>

                <div className="stat-card card">
                    <div className="stat-icon">🏢</div>
                    <div className="stat-content">
                        <h3>{stats?.branches?.total || 0}</h3>
                        <p>Total Branches</p>
                        <span className="stat-detail">
                            {stats?.branches?.active || 0} active
                        </span>
                    </div>
                </div>

                <div className="stat-card card">
                    <div className="stat-icon">📚</div>
                    <div className="stat-content">
                        <h3>{stats?.courses?.total || 0}</h3>
                        <p>Total Courses</p>
                        <span className="stat-detail">
                            {stats?.courses?.active || 0} active
                        </span>
                    </div>
                </div>

                <div className="stat-card card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-content">
                        <h3>{stats?.faculty?.total || 0}</h3>
                        <p>Total Faculty</p>
                        <span className="stat-detail">
                            {stats?.faculty?.active || 0} active
                        </span>
                    </div>
                </div>

                <div className="stat-card card">
                    <div className="stat-icon">❓</div>
                    <div className="stat-content">
                        <h3>{stats?.questions?.total || 0}</h3>
                        <p>Question Bank</p>
                        <span className="stat-detail">Total questions</span>
                    </div>
                </div>

                <div className="stat-card card">
                    <div className="stat-icon">📝</div>
                    <div className="stat-content">
                        <h3>{stats?.qpGenerated?.total || 0}</h3>
                        <p>QP Generated</p>
                        <span className="stat-detail">Total papers</span>
                    </div>
                </div>
            </div>

            <div className="card mt-4">
                <div className="card-header">
                    <h3 className="card-title">Quick Actions</h3>
                </div>
                <div className="quick-actions grid grid-3">
                    <a href="/admin/programs" className="action-btn">
                        <span className="action-icon">🎓</span>
                        <span>Manage Programs</span>
                    </a>
                    <a href="/admin/faculty" className="action-btn">
                        <span className="action-icon">👥</span>
                        <span>Manage Faculty</span>
                    </a>
                    <a href="/admin/qp-generation" className="action-btn">
                        <span className="action-icon">📝</span>
                        <span>Generate QP</span>
                    </a>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
