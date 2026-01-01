import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import '../Admin/Programs.css';

const Questions = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const [course, setCourse] = useState(null);
    const [courseOutcomes, setCourseOutcomes] = useState([]);
    const [bloomsLevels, setBloomsLevels] = useState([]);
    const [difficultyLevels, setDifficultyLevels] = useState([]);
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState({
        coId: '',
        bloomsLevelId: '',
        difficultyLevelId: '',
        unitId: '',
        questionText: '',
        marks: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [bulkFile, setBulkFile] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchQuestions();
        fetchDropdownData();
    }, [courseId]);

    const fetchQuestions = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/faculty/questions/${courseId}`);
            setQuestions(response.data.data.questions);
            setCourse(response.data.data.course);
        } catch (err) {
            setError('Failed to fetch questions');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchDropdownData = async () => {
        try {
            const [coRes, bloomsRes, diffRes, unitsRes] = await Promise.all([
                api.get(`/faculty/course-outcomes/${courseId}`),
                api.get('/admin/course-plugins/blooms-level?isActive=true'),
                api.get('/admin/course-plugins/difficulty-level?isActive=true'),
                api.get('/admin/course-plugins/units?isActive=true')
            ]);
            setCourseOutcomes(coRes.data.data.outcomes.filter(co => co.isActive));
            setBloomsLevels(bloomsRes.data.data);
            setDifficultyLevels(diffRes.data.data);
            setUnits(unitsRes.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            Object.keys(currentQuestion).forEach(key => {
                formData.append(key, currentQuestion[key]);
            });
            if (imageFile) {
                formData.append('image', imageFile);
            }

            if (editMode) {
                await api.put(`/faculty/questions/${currentQuestion.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post(`/faculty/questions/${courseId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            setSuccess('Question saved successfully');
            fetchQuestions();
            closeModal();
        } catch (err) {
            setError(err.response?.data?.message || 'Operation failed');
        }
    };

    const handleBulkUpload = async (e) => {
        e.preventDefault();
        if (!bulkFile) {
            setError('Please select a CSV file');
            return;
        }

        const formData = new FormData();
        formData.append('file', bulkFile);

        try {
            const response = await api.post(`/faculty/questions/${courseId}/bulk-upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSuccess(`Bulk upload successful! ${response.data.data.created} questions created.`);
            fetchQuestions();
            setShowBulkModal(false);
            setBulkFile(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Bulk upload failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this question?')) return;
        try {
            await api.delete(`/faculty/questions/${id}`);
            setSuccess('Question deleted successfully');
            fetchQuestions();
        } catch (err) {
            setError(err.response?.data?.message || 'Delete failed');
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await api.patch(`/faculty/questions/${id}/toggle-status`);
            fetchQuestions();
        } catch (err) {
            setError(err.response?.data?.message || 'Status toggle failed');
        }
    };

    const openModal = (question = null) => {
        if (question) {
            setEditMode(true);
            setCurrentQuestion(question);
        } else {
            setEditMode(false);
            setCurrentQuestion({
                coId: '',
                bloomsLevelId: '',
                difficultyLevelId: '',
                unitId: '',
                questionText: '',
                marks: ''
            });
        }
        setShowModal(true);
        setImageFile(null);
        setError('');
        setSuccess('');
    };

    const closeModal = () => {
        setShowModal(false);
        setEditMode(false);
        setImageFile(null);
        setError('');
    };

    const downloadSampleCSV = () => {
        const csv = 'coId,bloomsLevelId,difficultyLevelId,unitId,questionText,marks\n1,1,1,1,What is a data structure?,2';
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'questions_sample.csv';
        a.click();
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
                    <h1>Question Bank</h1>
                    {course && <p style={{ color: 'var(--text-secondary)' }}>{course.courseCode} - {course.courseName}</p>}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-secondary" onClick={() => setShowBulkModal(true)}>
                        📤 Bulk Upload
                    </button>
                    <button className="btn btn-primary" onClick={() => openModal()}>
                        + Add Question
                    </button>
                </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="card">
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>S.No</th>
                                <th>Question</th>
                                <th>CO</th>
                                <th>Bloom's</th>
                                <th>Difficulty</th>
                                <th>Unit</th>
                                <th>Marks</th>
                                <th>Image</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {questions.length === 0 ? (
                                <tr>
                                    <td colSpan="10" className="text-center">No questions found</td>
                                </tr>
                            ) : (
                                questions.map((q, index) => (
                                    <tr key={q.id}>
                                        <td>{index + 1}</td>
                                        <td style={{ maxWidth: '300px' }}>{q.questionText.substring(0, 100)}...</td>
                                        <td>{q.CourseOutcome?.coNumber}</td>
                                        <td>{q.BloomsLevel?.levelName}</td>
                                        <td>{q.DifficultyLevel?.levelName}</td>
                                        <td>{q.Unit?.unitName}</td>
                                        <td>{q.marks}</td>
                                        <td>{q.imagePath ? '📷' : '-'}</td>
                                        <td>
                                            <span className={`badge ${q.isActive ? 'badge-success' : 'badge-danger'}`}>
                                                {q.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="actions">
                                            <button className="btn-icon btn-edit" onClick={() => openModal(q)} title="Edit">✏️</button>
                                            <button className="btn-icon btn-toggle" onClick={() => handleToggleStatus(q.id)} title="Toggle">{q.isActive ? '🔒' : '🔓'}</button>
                                            <button className="btn-icon btn-delete" onClick={() => handleDelete(q.id)} title="Delete">🗑️</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" style={{ maxWidth: '700px' }} onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editMode ? 'Edit Question' : 'Add New Question'}</h2>
                            <button className="modal-close" onClick={closeModal}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Question Text *</label>
                                <textarea
                                    className="form-control"
                                    rows="4"
                                    value={currentQuestion.questionText}
                                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, questionText: e.target.value })}
                                    required
                                ></textarea>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Course Outcome *</label>
                                    <select className="form-control" value={currentQuestion.coId} onChange={(e) => setCurrentQuestion({ ...currentQuestion, coId: e.target.value })} required>
                                        <option value="">Select CO</option>
                                        {courseOutcomes.map(co => <option key={co.id} value={co.id}>{co.coNumber}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Bloom's Level *</label>
                                    <select className="form-control" value={currentQuestion.bloomsLevelId} onChange={(e) => setCurrentQuestion({ ...currentQuestion, bloomsLevelId: e.target.value })} required>
                                        <option value="">Select Bloom's</option>
                                        {bloomsLevels.map(b => <option key={b.id} value={b.id}>{b.levelName}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Difficulty Level *</label>
                                    <select className="form-control" value={currentQuestion.difficultyLevelId} onChange={(e) => setCurrentQuestion({ ...currentQuestion, difficultyLevelId: e.target.value })} required>
                                        <option value="">Select Difficulty</option>
                                        {difficultyLevels.map(d => <option key={d.id} value={d.id}>{d.levelName}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Unit *</label>
                                    <select className="form-control" value={currentQuestion.unitId} onChange={(e) => setCurrentQuestion({ ...currentQuestion, unitId: e.target.value })} required>
                                        <option value="">Select Unit</option>
                                        {units.map(u => <option key={u.id} value={u.id}>{u.unitName}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Marks *</label>
                                    <input type="number" className="form-control" value={currentQuestion.marks} onChange={(e) => setCurrentQuestion({ ...currentQuestion, marks: e.target.value })} required min="1" max="20" />
                                </div>
                                <div className="form-group">
                                    <label>Question Image (Optional)</label>
                                    <input type="file" className="form-control" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                                <button type="submit" className="btn btn-primary">{editMode ? 'Update' : 'Create'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Bulk Upload Modal */}
            {showBulkModal && (
                <div className="modal-overlay" onClick={() => setShowBulkModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Bulk Upload Questions</h2>
                            <button className="modal-close" onClick={() => setShowBulkModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleBulkUpload}>
                            <div className="form-group">
                                <label>Upload CSV File *</label>
                                <input type="file" className="form-control" accept=".csv" onChange={(e) => setBulkFile(e.target.files[0])} required />
                                <small>CSV format: coId, bloomsLevelId, difficultyLevelId, unitId, questionText, marks</small>
                            </div>
                            <button type="button" className="btn btn-secondary" onClick={downloadSampleCSV} style={{ marginBottom: '1rem' }}>
                                📥 Download Sample CSV
                            </button>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowBulkModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Upload</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Questions;
