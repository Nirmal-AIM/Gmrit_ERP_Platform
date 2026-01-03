import { useState, useEffect } from 'react';
import api from '../../utils/api';
import '../Admin/Programs.css';

const Regulations = () => {
    const [regulations, setRegulations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentRegulation, setCurrentRegulation] = useState({
        regulationName: '',
        regulationYear: '',
        description: ''
    });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchRegulations();
    }, []);

    const fetchRegulations = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/regulations');
            setRegulations(response.data.data);
        } catch (err) {
            setError('Failed to fetch regulations');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editMode) {
                await api.put(`/admin/regulations/${currentRegulation.id}`, currentRegulation);
            } else {
                await api.post('/admin/regulations', currentRegulation);
            }
            fetchRegulations();
            closeModal();
        } catch (err) {
            setError(err.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this regulation?')) return;
        try {
            await api.delete(`/admin/regulations/${id}`);
            fetchRegulations();
        } catch (err) {
            setError(err.response?.data?.message || 'Delete failed');
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await api.patch(`/admin/regulations/${id}/status`);
            fetchRegulations();
        } catch (err) {
            setError(err.response?.data?.message || 'Status toggle failed');
        }
    };

    const openModal = (regulation = null) => {
        if (regulation) {
            setEditMode(true);
            setCurrentRegulation(regulation);
        } else {
            setEditMode(false);
            setCurrentRegulation({ regulationName: '', regulationYear: '', description: '' });
        }
        setShowModal(true);
        setError('');
    };

    const closeModal = () => {
        setShowModal(false);
        setEditMode(false);
        setCurrentRegulation({ regulationName: '', regulationYear: '', description: '' });
        setError('');
    };

    if (loading) {
        return <div className="loading-spinner"></div>;
    }

    return (
        <div className="programs-page">
            <div className="page-header">
                <h1>Regulations Management</h1>
                <button className="btn btn-primary" onClick={() => openModal()}>
                    + Add Regulation
                </button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="card">
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>S.No</th>
                                <th>Regulation Name</th>
                                <th>Year</th>
                                <th>Description</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {regulations.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center">No regulations found</td>
                                </tr>
                            ) : (
                                regulations.map((regulation, index) => (
                                    <tr key={regulation.id}>
                                        <td>{index + 1}</td>
                                        <td>{regulation.regulationName}</td>
                                        <td>{regulation.regulationYear || '-'}</td>
                                        <td>{regulation.description || '-'}</td>
                                        <td>
                                            <span className={`badge ${regulation.isActive ? 'badge-success' : 'badge-danger'}`}>
                                                {regulation.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="actions">
                                            <button
                                                className="btn-icon btn-edit"
                                                onClick={() => openModal(regulation)}
                                                title="Edit"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="btn-icon btn-toggle"
                                                onClick={() => handleToggleStatus(regulation.id)}
                                                title="Toggle Status"
                                            >
                                                {regulation.isActive ? '🔒' : '🔓'}
                                            </button>
                                            <button
                                                className="btn-icon btn-delete"
                                                onClick={() => handleDelete(regulation.id)}
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
                            <h2>{editMode ? 'Edit Regulation' : 'Add New Regulation'}</h2>
                            <button className="modal-close" onClick={closeModal}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Regulation Name *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={currentRegulation.regulationName}
                                    onChange={(e) => setCurrentRegulation({ ...currentRegulation, regulationName: e.target.value })}
                                    required
                                    placeholder="e.g., AR23, AR21"
                                />
                            </div>
                            <div className="form-group">
                                <label>Regulation Year</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={currentRegulation.regulationYear}
                                    onChange={(e) => setCurrentRegulation({ ...currentRegulation, regulationYear: e.target.value })}
                                    placeholder="e.g., 2023"
                                    min="2000"
                                    max="2100"
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    className="form-control"
                                    rows="3"
                                    value={currentRegulation.description}
                                    onChange={(e) => setCurrentRegulation({ ...currentRegulation, description: e.target.value })}
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

export default Regulations;
