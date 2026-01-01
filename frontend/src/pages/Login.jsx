/**
 * Login Page Component
 * Premium Split-Screen Design
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Login.css';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(email, password);

        if (!result.success) {
            setError(result.message);
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            {/* Left Side: Visuals */}
            <div className="login-visual">
                <div className="visual-content">
                    <div className="logo-box">
                        <span className="logo-icon">🎓</span>
                        <span className="logo-text">WEBSAGA</span>
                    </div>
                    <div className="hero-text">
                        <h1>Empowering<br />Academic Excellence.</h1>
                        <p>Streamline your institution's management with our advanced ERP solution. Automated QP Generation, Course Mapping, and more.</p>
                    </div>
                </div>

                {/* Background Shapes */}
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
                <div className="shape shape-3"></div>
            </div>

            {/* Right Side: Form */}
            <div className="login-form-container">
                <div className="login-card">
                    <div className="form-header">
                        <h2>Welcome Back</h2>
                        <p>Sign in to your account</p>
                    </div>

                    {error && (
                        <div className="alert alert-error">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                className="login-input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@university.edu"
                                required
                                autoFocus
                            />
                        </div>

                        <div className="input-group">
                            <label>Password</label>
                            <input
                                type="password"
                                className="login-input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="login-btn"
                            disabled={loading}
                        >
                            {loading ? <span className="spinner"></span> : 'Sign In'}
                        </button>
                    </form>

                    <div className="login-footer">
                        <p>Default Admin: <strong>admin@erp.com</strong></p>
                        <p>Password: <strong>Admin@123</strong></p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
