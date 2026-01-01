/**
 * Faculty Dashboard Component
 */

import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import '../Admin/Dashboard.css';

function FacultyDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await api.get('/faculty/dashboard');
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
            <h1>Faculty Dashboard</h1>
            <p className="text-secondary">Welcome to your dashboard</p>

            <div className="stats-grid grid grid-3">
                <div className="stat-card card">
                    <div className="stat-icon">📚</div>
                    <div className="stat-content">
                        <h3>{stats?.totalCourses || 0}</h3>
                        <p>My Courses</p>
                        <span className="stat-detail">Mapped courses</span>
                    </div>
                </div>

                <div className="stat-card card">
                    <div className="stat-icon">❓</div>
                    <div className="stat-content">
                        <h3>{stats?.totalQuestions || 0}</h3>
                        <p>Questions Created</p>
                        <span className="stat-detail">Total questions</span>
                    </div>
                </div>

                <div className="stat-card card">
                    <div className="stat-icon">📝</div>
                    <div className="stat-content">
                        <h3>0</h3>
                        <p>Pending Tasks</p>
                        <span className="stat-detail">No pending tasks</span>
                    </div>
                </div>
            </div>

            <div className="card mt-4">
                <div className="card-header">
                    <h3 className="card-title">Quick Actions</h3>
                </div>
                <div className="quick-actions grid grid-3">
                    <a href="/faculty/my-courses" className="action-btn">
                        <span className="action-icon">📚</span>
                        <span>View My Courses</span>
                    </a>
                    <a href="/faculty/my-courses" className="action-btn">
                        <span className="action-icon">❓</span>
                        <span>Add Questions</span>
                    </a>
                    <a href="/faculty/change-password" className="action-btn">
                        <span className="action-icon">🔒</span>
                        <span>Change Password</span>
                    </a>
                </div>
            </div>
        </div>
    );
}

export default FacultyDashboard;
