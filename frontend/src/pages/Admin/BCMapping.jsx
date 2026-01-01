import { useState, useEffect } from 'react';
import api from '../../utils/api';
import '../Admin/Programs.css';

const BCMapping = () => {
    const [mappings, setMappings] = useState([]);
    const [pbMappings, setPBMappings] = useState([]);
    const [regulations, setRegulations] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [currentMapping, setCurrentMapping] = useState({
        pbMappingId: '',
        regulationId: '',
        courseId: ''
    });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchMappings();
        fetchPBMappings();
        fetchRegulations();
        fetchCourses();
    }, []);

    const fetchMappings = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/admin/bc-mapping');
            setMappings(response.data.data);
        } catch (err) {
            setError('Failed to fetch mappings');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchPBMappings = async () => {
        try {
            const response = await api.get('/api/admin/pb-mapping?isActive=true');
            setPBMappings(response.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchRegulations = async () => {
        try {
            const response = await api.get('/api/admin/regulations?isActive=true');
            setRegulations(response.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchCourses = async () => {
        try {
            const response = await api.get('/api/admin/courses?isActive=true');
            setCourses(response.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/admin/bc-mapping', currentMapping);
            fetchMappings();
            closeModal();
        } catch (err) {
            setError(err.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this mapping?')) return;
        try {
            await api.delete(`/api/admin/bc-mapping/${id}`);
            fetchMappings();
        } catch (err) {
            setError(err.response?.data?.message || 'Delete failed');
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await api.patch(`/api/admin/bc-mapping/${id}/toggle-status`);
            fetchMappings();
        } catch (err) {
            setError(err.response?.data?.message || 'Status toggle failed');
        }
    };

    const openModal = () => {
        setCurrentMapping({ pbMappingId: '', regulationId: '', courseId: '' });
        setShowModal(true);
        setError('');
    };

    const closeModal = () => {
        setShowModal(false);
        setCurrentMapping({ pbMappingId: '', regulationId: '', courseId: '' });
        setError('');
    };

    if (loading) {
        return <div className="loading-spinner"></div>;
    }

    return (
        <div className="programs-page">
            <div className="page-header">
                <h1>Branch-Course Mapping</h1>
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
                                <th>Regulation</th>
                                <th>Course</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mappings.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center">No mappings found</td>
                                </tr>
                            ) : (
                                mappings.map((mapping, index) => (
                                    <tr key={mapping.id}>
                                        <td>{index + 1}</td>
                                        <td>{mapping.PBMapping?.Program?.programName}</td>
                                        <td>{mapping.PBMapping?.Branch?.branchName}</td>
                                        <td>{mapping.Regulation?.regulationName}</td>
                                        <td>{mapping.Course?.courseName} ({mapping.Course?.courseCode})</td>
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
                            <h2>Add Branch-Course Mapping</h2>
                            <button className="modal-close" onClick={closeModal}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Program-Branch *</label>
                                <select
                                    className="form-control"
                                    value={currentMapping.pbMappingId}
                                    onChange={(e) => setCurrentMapping({ ...currentMapping, pbMappingId: e.target.value })}
                                    required
                                >
                                    <option value="">Select Program-Branch</option>
                                    {pbMappings.map(pb => (
                                        <option key={pb.id} value={pb.id}>
                                            {pb.Program?.programName} - {pb.Branch?.branchName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Regulation *</label>
                                <select
                                    className="form-control"
                                    value={currentMapping.regulationId}
                                    onChange={(e) => setCurrentMapping({ ...currentMapping, regulationId: e.target.value })}
                                    required
                                >
                                    <option value="">Select Regulation</option>
                                    {regulations.map(r => (
                                        <option key={r.id} value={r.id}>{r.regulationName}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Course *</label>
                                <select
                                    className="form-control"
                                    value={currentMapping.courseId}
                                    onChange={(e) => setCurrentMapping({ ...currentMapping, courseId: e.target.value })}
                                    required
                                >
                                    <option value="">Select Course</option>
                                    {courses.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.courseCode} - {c.courseName}
                                        </option>
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

export default BCMapping;
