import { useState, useEffect } from 'react';
import api from '../../utils/api';
import './Programs.css';

const Programs = () => {
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentProgram, setCurrentProgram] = useState({
        programName: '',
        programCode: '',
        description: ''
    });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchPrograms();
    }, []);

    const fetchPrograms = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/programs');
            setPrograms(response.data.data);
        } catch (err) {
            setError('Failed to fetch programs');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editMode) {
                await api.put(`/admin/programs/${currentProgram.id}`, currentProgram);
            } else {
                await api.post('/admin/programs', currentProgram);
            }
            fetchPrograms();
            closeModal();
        } catch (err) {
            setError(err.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this program?')) return;
        try {
            await api.delete(`/admin/programs/${id}`);
            fetchPrograms();
        } catch (err) {
            setError(err.response?.data?.message || 'Delete failed');
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await api.patch(`/admin/programs/${id}/status`);
            fetchPrograms();
        } catch (err) {
            setError(err.response?.data?.message || 'Status toggle failed');
        }
    };

    const openModal = (program = null) => {
        if (program) {
            setEditMode(true);
            setCurrentProgram(program);
        } else {
            setEditMode(false);
            setCurrentProgram({ programName: '', programCode: '', description: '' });
        }
        setShowModal(true);
        setError('');
    };

    const closeModal = () => {
        setShowModal(false);
        setEditMode(false);
        setCurrentProgram({ programName: '', programCode: '', description: '' });
        setError('');
    };

    if (loading) {
        return <div className="loading-spinner"></div>;
    }

    return (
        <div className="programs-page">
            <div className="page-header">
                <h1>Programs Management</h1>
                <button className="btn btn-primary" onClick={() => openModal()}>
                    + Add Program
                </button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="card">
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>S.No</th>
                                <th>Program Name</th>
                                <th>Program Code</th>
                                <th>Description</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {programs.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center">No programs found</td>
                                </tr>
                            ) : (
                                programs.map((program, index) => (
                                    <tr key={program.id}>
                                        <td>{index + 1}</td>
                                        <td>{program.programName}</td>
                                        <td>{program.programCode || '-'}</td>
                                        <td>{program.description || '-'}</td>
                                        <td>
                                            <span className={`badge ${program.isActive ? 'badge-success' : 'badge-danger'}`}>
                                                {program.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="actions">
                                            <button
                                                className="btn-icon btn-edit"
                                                onClick={() => openModal(program)}
                                                title="Edit"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="btn-icon btn-toggle"
                                                onClick={() => handleToggleStatus(program.id)}
                                                title="Toggle Status"
                                            >
                                                {program.isActive ? '🔒' : '🔓'}
                                            </button>
                                            <button
                                                className="btn-icon btn-delete"
                                                onClick={() => handleDelete(program.id)}
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
                            <h2>{editMode ? 'Edit Program' : 'Add New Program'}</h2>
                            <button className="modal-close" onClick={closeModal}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Program Name *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={currentProgram.programName}
                                    onChange={(e) => setCurrentProgram({ ...currentProgram, programName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Program Code</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={currentProgram.programCode}
                                    onChange={(e) => setCurrentProgram({ ...currentProgram, programCode: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    className="form-control"
                                    rows="3"
                                    value={currentProgram.description}
                                    onChange={(e) => setCurrentProgram({ ...currentProgram, description: e.target.value })}
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

export default Programs;
