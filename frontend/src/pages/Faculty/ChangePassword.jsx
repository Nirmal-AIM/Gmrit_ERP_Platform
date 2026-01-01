import { useState } from 'react';
import api from '../../utils/api';
import '../Admin/Programs.css';

const ChangePassword = () => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validation
        if (formData.newPassword !== formData.confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        if (formData.newPassword.length < 8) {
            setError('New password must be at least 8 characters long');
            return;
        }

        try {
            setLoading(true);
            await api.post('/faculty/change-password', {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });
            setSuccess('Password changed successfully!');
            setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="programs-page">
            <div className="page-header">
                <h1>Change Password</h1>
            </div>

            <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
                <div style={{ padding: '2rem' }}>
                    {error && <div className="alert alert-error">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Current Password *</label>
                            <input
                                type="password"
                                className="form-control"
                                value={formData.currentPassword}
                                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>New Password *</label>
                            <input
                                type="password"
                                className="form-control"
                                value={formData.newPassword}
                                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                required
                                minLength="8"
                            />
                            <small>Must be at least 8 characters long</small>
                        </div>

                        <div className="form-group">
                            <label>Confirm New Password *</label>
                            <input
                                type="password"
                                className="form-control"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                            style={{ width: '100%', marginTop: '1rem' }}
                        >
                            {loading ? 'Changing Password...' : 'Change Password'}
                        </button>
                    </form>

                    <div className="alert alert-info" style={{ marginTop: '2rem' }}>
                        <strong>Password Requirements:</strong>
                        <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                            <li>Minimum 8 characters</li>
                            <li>Include uppercase and lowercase letters</li>
                            <li>Include numbers</li>
                            <li>Include special characters (@, #, $, etc.)</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;
