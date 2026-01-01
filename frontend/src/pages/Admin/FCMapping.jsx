import { useState, useEffect } from 'react';
import api from '../../utils/api';
import '../Admin/Programs.css';

const FCMapping = () => {
    const [mappings, setMappings] = useState([]);
    const [faculty, setFaculty] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [currentMapping, setCurrentMapping] = useState({
        facultyId: '',
        courseId: '',
        courseType: 'Theory',
        year: 'I',
        semester: 'I',
        electiveType: 'CORE'
    });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchMappings();
        fetchFaculty();
        fetchCourses();
    }, []);

    const fetchMappings = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/admin/fc-mapping');
            setMappings(response.data.data);
        } catch (err) {
            setError('Failed to fetch mappings');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchFaculty = async () => {
        try {
            const response = await api.get('/api/admin/faculty?isActive=true');
            setFaculty(response.data.data);
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
            await api.post('/api/admin/fc-mapping', currentMapping);
            fetchMappings();
            closeModal();
        } catch (err) {
            setError(err.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this mapping?')) return;
        try {
            await api.delete(`/api/admin/fc-mapping/${id}`);
            fetchMappings();
        } catch (err) {
            setError(err.response?.data?.message || 'Delete failed');
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await api.patch(`/api/admin/fc-mapping/${id}/toggle-status`);
            fetchMappings();
        } catch (err) {
            setError(err.response?.data?.message || 'Status toggle failed');
        }
    };

    const openModal = () => {
        setCurrentMapping({
            facultyId: '',
            courseId: '',
            courseType: 'Theory',
            year: 'I',
            semester: 'I',
            electiveType: 'CORE'
        });
        setShowModal(true);
        setError('');
    };

    const closeModal = () => {
        setShowModal(false);
        setError('');
    };

    if (loading) {
        return <div className="loading-spinner"></div>;
    }

    return (
        <div className="programs-page">
            <div className="page-header">
                <h1>Faculty-Course Mapping</h1>
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
                                <th>Faculty</th>
                                <th>Course</th>
                                <th>Type</th>
                                <th>Year/Sem</th>
                                <th>Academic Year</th>
                                <th>Elective</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mappings.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="text-center">No mappings found</td>
                                </tr>
                            ) : (
                                mappings.map((mapping, index) => (
                                    <tr key={mapping.id}>
                                        <td>{index + 1}</td>
                                        <td>{mapping.Faculty?.honorific} {mapping.Faculty?.facultyName}</td>
                                        <td>{mapping.Course?.courseName} ({mapping.Course?.courseCode})</td>
                                        <td>{mapping.courseType}</td>
                                        <td>{mapping.year}-{mapping.semester}</td>
                                        <td>{mapping.academicYear}</td>
                                        <td>{mapping.electiveType}</td>
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
                    <div className="modal-content" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Add Faculty-Course Mapping</h2>
                            <button className="modal-close" onClick={closeModal}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Faculty *</label>
                                <select
                                    className="form-control"
                                    value={currentMapping.facultyId}
                                    onChange={(e) => setCurrentMapping({ ...currentMapping, facultyId: e.target.value })}
                                    required
                                >
                                    <option value="">Select Faculty</option>
                                    {faculty.map(f => (
                                        <option key={f.id} value={f.id}>
                                            {f.honorific} {f.facultyName} ({f.empId})
                                        </option>
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
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Course Type *</label>
                                    <select
                                        className="form-control"
                                        value={currentMapping.courseType}
                                        onChange={(e) => setCurrentMapping({ ...currentMapping, courseType: e.target.value })}
                                        required
                                    >
                                        <option value="Theory">Theory</option>
                                        <option value="Lab">Lab</option>
                                        <option value="Project">Project</option>
                                        <option value="Seminar">Seminar</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Elective Type *</label>
                                    <select
                                        className="form-control"
                                        value={currentMapping.electiveType}
                                        onChange={(e) => setCurrentMapping({ ...currentMapping, electiveType: e.target.value })}
                                        required
                                    >
                                        <option value="CORE">CORE</option>
                                        <option value="Professional Elective">Professional Elective</option>
                                        <option value="Open Elective">Open Elective</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Year *</label>
                                    <select
                                        className="form-control"
                                        value={currentMapping.year}
                                        onChange={(e) => setCurrentMapping({ ...currentMapping, year: e.target.value })}
                                        required
                                    >
                                        <option value="I">I Year</option>
                                        <option value="II">II Year</option>
                                        <option value="III">III Year</option>
                                        <option value="IV">IV Year</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Semester *</label>
                                    <select
                                        className="form-control"
                                        value={currentMapping.semester}
                                        onChange={(e) => setCurrentMapping({ ...currentMapping, semester: e.target.value })}
                                        required
                                    >
                                        <option value="I">I Semester</option>
                                        <option value="II">II Semester</option>
                                    </select>
                                </div>
                            </div>
                            <div className="alert alert-info" style={{ marginTop: '1rem' }}>
                                Academic year will be calculated automatically based on current date (June-May cycle).
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

export default FCMapping;
