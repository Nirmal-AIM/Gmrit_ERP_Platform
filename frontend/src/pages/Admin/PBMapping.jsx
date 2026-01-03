import { useState, useEffect } from 'react';
import api from '../../utils/api';
import '../Admin/Programs.css';

const PBMapping = () => {
    const [mappings, setMappings] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [currentMapping, setCurrentMapping] = useState({
        programId: '',
        branchId: ''
    });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchMappings();
        fetchPrograms();
        fetchBranches();
    }, []);

    const fetchMappings = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/pb-mapping');
            setMappings(response.data.data);
        } catch (err) {
            setError('Failed to fetch mappings');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchPrograms = async () => {
        try {
            const response = await api.get('/admin/programs?isActive=true');
            setPrograms(response.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchBranches = async () => {
        try {
            const response = await api.get('/admin/branches?isActive=true');
            setBranches(response.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/pb-mapping', currentMapping);
            fetchMappings();
            closeModal();
        } catch (err) {
            setError(err.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this mapping?')) return;
        try {
            await api.delete(`/admin/pb-mapping/${id}`);
            fetchMappings();
        } catch (err) {
            setError(err.response?.data?.message || 'Delete failed');
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await api.patch(`/admin/pb-mapping/${id}/status`);
            fetchMappings();
        } catch (err) {
            setError(err.response?.data?.message || 'Status toggle failed');
        }
    };

    const openModal = () => {
        setCurrentMapping({ programId: '', branchId: '' });
        setShowModal(true);
        setError('');
    };

    const closeModal = () => {
        setShowModal(false);
        setCurrentMapping({ programId: '', branchId: '' });
        setError('');
    };

    if (loading) {
        return <div className="loading-spinner"></div>;
    }

    return (
        <div className="programs-page">
            <div className="page-header">
                <h1>Program-Branch Mapping</h1>
                <button className="btn btn-primary" onClick={openModal}>
                    + Add Mapping
                </button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="card">
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>S.No</th>
                                <th>Program</th>
                                <th>Branch</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mappings.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center">No mappings found</td>
                                </tr>
                            ) : (
                                mappings.map((mapping, index) => (
                                    <tr key={mapping.id}>
                                        <td>{index + 1}</td>
                                        <td>{mapping.program?.programName}</td>
                                        <td>{mapping.branch?.branchName} ({mapping.branch?.branchCode})</td>
                                        <td>
                                            <span className={`badge ${mapping.isActive ? 'badge-success' : 'badge-danger'}`}>
                                                {mapping.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="actions">
                                            <button
                                                className="btn-icon btn-toggle"
                                                onClick={() => handleToggleStatus(mapping.id)}
                                                title="Toggle Status"
                                            >
                                                {mapping.isActive ? '🔒' : '🔓'}
                                            </button>
                                            <button
                                                className="btn-icon btn-delete"
                                                onClick={() => handleDelete(mapping.id)}
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
                            <h2>Add Program-Branch Mapping</h2>
                            <button className="modal-close" onClick={closeModal}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Program *</label>
                                <select
                                    className="form-control"
                                    value={currentMapping.programId}
                                    onChange={(e) => setCurrentMapping({ ...currentMapping, programId: e.target.value })}
                                    required
                                >
                                    <option value="">Select Program</option>
                                    {programs.map(p => (
                                        <option key={p.id} value={p.id}>{p.programName}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Branch *</label>
                                <select
                                    className="form-control"
                                    value={currentMapping.branchId}
                                    onChange={(e) => setCurrentMapping({ ...currentMapping, branchId: e.target.value })}
                                    required
                                >
                                    <option value="">Select Branch</option>
                                    {branches.map(b => (
                                        <option key={b.id} value={b.id}>{b.branchName} ({b.branchCode})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Create Mapping
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PBMapping;
