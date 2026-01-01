import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import '../Admin/Programs.css';

const CourseOutcomes = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [outcomes, setOutcomes] = useState([]);
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentCO, setCurrentCO] = useState({
        coNumber: '',
        coDescription: ''
    });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCourseOutcomes();
    }, [courseId]);

    const fetchCourseOutcomes = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/faculty/course-outcomes/${courseId}`);
            setOutcomes(response.data.data.outcomes);
            setCourse(response.data.data.course);
        } catch (err) {
            setError('Failed to fetch course outcomes');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editMode) {
                await api.put(`/faculty/course-outcomes/${currentCO.id}`, currentCO);
            } else {
                await api.post(`/faculty/course-outcomes/${courseId}`, currentCO);
            }
            fetchCourseOutcomes();
            closeModal();
        } catch (err) {
            setError(err.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this CO?')) return;
        try {
            await api.delete(`/faculty/course-outcomes/${id}`);
            fetchCourseOutcomes();
        } catch (err) {
            setError(err.response?.data?.message || 'Delete failed');
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await api.patch(`/faculty/course-outcomes/${id}/toggle-status`);
            fetchCourseOutcomes();
        } catch (err) {
            setError(err.response?.data?.message || 'Status toggle failed');
        }
    };

    const openModal = (co = null) => {
        if (co) {
            setEditMode(true);
            setCurrentCO(co);
        } else {
            setEditMode(false);
            setCurrentCO({ coNumber: '', coDescription: '' });
        }
        setShowModal(true);
        setError('');
    };

    const closeModal = () => {
        setShowModal(false);
        setEditMode(false);
        setCurrentCO({ coNumber: '', coDescription: '' });
        setError('');
    };

    if (loading) {
        return <div className="loading-spinner"></div>;
    }

    return (
        <div className="programs-page">
            <div className="page-header">
                <div>
                    <button className="btn btn-secondary" onClick={() => navigate('/faculty/my-courses')} style={{ marginBottom: '0.5rem' }}>
                        ← Back to My Courses
                    </button>
                    <h1>Course Outcomes</h1>
                    {course && <p style={{ color: 'var(--text-secondary)' }}>{course.courseCode} - {course.courseName}</p>}
                </div>
                <button className="btn btn-primary" onClick={() => openModal()}>
                    + Add CO
                </button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="card">
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>S.No</th>
                                <th>CO Number</th>
                                <th>CO Description</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {outcomes.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center">No course outcomes found</td>
                                </tr>
                            ) : (
                                outcomes.map((co, index) => (
                                    <tr key={co.id}>
                                        <td>{index + 1}</td>
                                        <td><strong>{co.coNumber}</strong></td>
                                        <td>{co.coDescription}</td>
                                        <td>
                                            <span className={`badge ${co.isActive ? 'badge-success' : 'badge-danger'}`}>
                                                {co.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="actions">
                                            <button className="btn-icon btn-edit" onClick={() => openModal(co)} title="Edit">✏️</button>
                                            <button className="btn-icon btn-toggle" onClick={() => handleToggleStatus(co.id)} title="Toggle">{co.isActive ? '🔒' : '🔓'}</button>
                                            <button className="btn-icon btn-delete" onClick={() => handleDelete(co.id)} title="Delete">🗑️</button>
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
                            <h2>{editMode ? 'Edit Course Outcome' : 'Add Course Outcome'}</h2>
                            <button className="modal-close" onClick={closeModal}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>CO Number *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={currentCO.coNumber}
                                    onChange={(e) => setCurrentCO({ ...currentCO, coNumber: e.target.value })}
                                    required
                                    placeholder="e.g., CO1, CO2"
                                />
                            </div>
                            <div className="form-group">
                                <label>CO Description *</label>
                                <textarea
                                    className="form-control"
                                    rows="4"
                                    value={currentCO.coDescription}
                                    onChange={(e) => setCurrentCO({ ...currentCO, coDescription: e.target.value })}
                                    required
                                    placeholder="Describe the course outcome..."
                                ></textarea>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                                <button type="submit" className="btn btn-primary">{editMode ? 'Update' : 'Create'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseOutcomes;
