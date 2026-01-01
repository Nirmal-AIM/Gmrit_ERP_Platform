import { useState, useEffect } from 'react';
import api from '../../utils/api';
import '../Admin/Programs.css';

const Branches = () => {
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentBranch, setCurrentBranch] = useState({
        branchName: '',
        branchCode: '',
        description: ''
    });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchBranches();
    }, []);

    const fetchBranches = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/branches');
            setBranches(response.data.data);
        } catch (err) {
            setError('Failed to fetch branches');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editMode) {
                await api.put(`/admin/branches/${currentBranch.id}`, currentBranch);
            } else {
                await api.post('/admin/branches', currentBranch);
            }
            fetchBranches();
            closeModal();
        } catch (err) {
            setError(err.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this branch?')) return;
        try {
            await api.delete(`/admin/branches/${id}`);
            fetchBranches();
        } catch (err) {
            setError(err.response?.data?.message || 'Delete failed');
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await api.patch(`/admin/branches/${id}/toggle-status`);
            fetchBranches();
        } catch (err) {
            setError(err.response?.data?.message || 'Status toggle failed');
        }
    };

    const openModal = (branch = null) => {
        if (branch) {
            setEditMode(true);
            setCurrentBranch(branch);
        } else {
            setEditMode(false);
            setCurrentBranch({ branchName: '', branchCode: '', description: '' });
        }
        setShowModal(true);
        setError('');
    };

    const closeModal = () => {
        setShowModal(false);
        setEditMode(false);
        setCurrentBranch({ branchName: '', branchCode: '', description: '' });
        setError('');
    };

    if (loading) {
        return <div className="loading-spinner"></div>;
    }

    return (
        <div className="programs-page">
            <div className="page-header">
                <h1>Branches Management</h1>
                <button className="btn btn-primary" onClick={() => openModal()}>
                    + Add Branch
                </button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="card">
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>S.No</th>
                                <th>Branch Name</th>
                                <th>Branch Code</th>
                                <th>Description</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {branches.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center">No branches found</td>
                                </tr>
                            ) : (
                                branches.map((branch, index) => (
                                    <tr key={branch.id}>
                                        <td>{index + 1}</td>
                                        <td>{branch.branchName}</td>
                                        <td>{branch.branchCode}</td>
                                        <td>{branch.description || '-'}</td>
                                        <td>
                                            <span className={`badge ${branch.isActive ? 'badge-success' : 'badge-danger'}`}>
                                                {branch.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="actions">
                                            <button
                                                className="btn-icon btn-edit"
                                                onClick={() => openModal(branch)}
                                                title="Edit"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="btn-icon btn-toggle"
                                                onClick={() => handleToggleStatus(branch.id)}
                                                title="Toggle Status"
                                            >
                                                {branch.isActive ? '🔒' : '🔓'}
                                            </button>
                                            <button
                                                className="btn-icon btn-delete"
                                                onClick={() => handleDelete(branch.id)}
                                                title="Delete"
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editMode ? 'Edit Branch' : 'Add New Branch'}</h2>
                            <button className="modal-close" onClick={closeModal}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Branch Name *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={currentBranch.branchName}
                                    onChange={(e) => setCurrentBranch({ ...currentBranch, branchName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Branch Code *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={currentBranch.branchCode}
                                    onChange={(e) => setCurrentBranch({ ...currentBranch, branchCode: e.target.value })}
                                    required
                                    placeholder="e.g., 05, 12, 42"
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    className="form-control"
                                    rows="3"
                                    value={currentBranch.description}
                                    onChange={(e) => setCurrentBranch({ ...currentBranch, description: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editMode ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Branches;
