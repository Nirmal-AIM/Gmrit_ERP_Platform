import { useState, useEffect } from 'react';
import api from '../../utils/api';
import '../Admin/Programs.css';

const AIQuestionGenerator = () => {
    const [courses, setCourses] = useState([]);
    const [filters, setFilters] = useState({
        courseOutcomes: [],
        bloomsLevels: [],
        difficultyLevels: [],
        units: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        courseId: '',
        coId: '',
        bloomsLevelId: '',
        difficultyLevelId: '',
        unitId: '',
        count: 5,
        marks: 10
    });

    const [generatedQuestions, setGeneratedQuestions] = useState([]);

    useEffect(() => {
        fetchMyCourses();
    }, []);

    const fetchMyCourses = async () => {
        try {
            const response = await api.get('/faculty/qp-generation/my-courses');
            setCourses(response.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchFilters = async (courseId) => {
        try {
            const response = await api.get(`/faculty/qp-generation/question-filters/${courseId}`);
            setFilters(response.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCourseChange = (courseId) => {
        setFormData({ ...formData, courseId });
        if (courseId) {
            fetchFilters(courseId);
        }
    };

    const handleGenerateAI = async () => {
        try {
            setLoading(true);
            setError('');
            setSuccess('');

            const response = await api.post('/faculty/ai-questions/generate', formData);

            setGeneratedQuestions(response.data.data);
            setSuccess(`✨ Successfully generated ${response.data.data.length} questions using AI!`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to generate questions');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="programs-page">
            <div className="page-header">
                <h1>🤖 AI Question Generator</h1>
                <p style={{ fontSize: '14px', color: '#666' }}>Generate high-quality questions automatically using AI</p>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="card">
                <h3>Generation Parameters</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                    <div className="form-group">
                        <label>Course *</label>
                        <select className="form-control" value={formData.courseId} onChange={(e) => handleCourseChange(e.target.value)} required>
                            <option value="">Select Course</option>
                            {courses.map(c => <option key={c.id} value={c.id}>{c.courseCode} - {c.courseName}</option>)}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Course Outcome *</label>
                        <select className="form-control" value={formData.coId} onChange={(e) => setFormData({ ...formData, coId: e.target.value })} required disabled={!formData.courseId}>
                            <option value="">Select CO</option>
                            {filters.courseOutcomes.map(co => <option key={co.id} value={co.id}>CO{co.coNumber} - {co.coDescription}</option>)}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Bloom's Level *</label>
                        <select className="form-control" value={formData.bloomsLevelId} onChange={(e) => setFormData({ ...formData, bloomsLevelId: e.target.value })} required>
                            <option value="">Select Level</option>
                            {filters.bloomsLevels.map(b => <option key={b.id} value={b.id}>{b.levelName}</option>)}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Difficulty *</label>
                        <select className="form-control" value={formData.difficultyLevelId} onChange={(e) => setFormData({ ...formData, difficultyLevelId: e.target.value })} required>
                            <option value="">Select Difficulty</option>
                            {filters.difficultyLevels.map(d => <option key={d.id} value={d.id}>{d.levelName}</option>)}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Unit *</label>
                        <select className="form-control" value={formData.unitId} onChange={(e) => setFormData({ ...formData, unitId: e.target.value })} required>
                            <option value="">Select Unit</option>
                            {filters.units.map(u => <option key={u.id} value={u.id}>{u.unitName}</option>)}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Number of Questions *</label>
                        <input type="number" className="form-control" value={formData.count} onChange={(e) => setFormData({ ...formData, count: e.target.value })} min="1" max="20" required />
                    </div>

                    <div className="form-group">
                        <label>Marks per Question *</label>
                        <input type="number" className="form-control" value={formData.marks} onChange={(e) => setFormData({ ...formData, marks: e.target.value })} min="1" max="100" required />
                    </div>
                </div>

                <button
                    className="btn btn-primary"
                    onClick={handleGenerateAI}
                    disabled={loading || !formData.courseId || !formData.coId || !formData.bloomsLevelId || !formData.difficultyLevelId || !formData.unitId}
                    style={{ marginTop: '1rem' }}
                >
                    {loading ? '🔄 Generating with AI...' : '✨ Generate Questions with AI'}
                </button>
            </div>

            {generatedQuestions.length > 0 && (
                <div className="card" style={{ marginTop: '2rem' }}>
                    <h3>Generated Questions ({generatedQuestions.length})</h3>
                    <div style={{ marginTop: '1rem' }}>
                        {generatedQuestions.map((q, index) => (
                            <div key={q.id} style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '1rem', backgroundColor: '#f9f9f9' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <strong>Question {index + 1}</strong>
                                    <span className="badge badge-success">{q.marks} Marks</span>
                                </div>
                                <p style={{ margin: '0.5rem 0' }}>{q.questionText}</p>
                                <div style={{ fontSize: '12px', color: '#666', marginTop: '0.5rem' }}>
                                    <span>CO: {q.co}</span> |
                                    <span> Bloom's: {q.bloomsLevel}</span> |
                                    <span> Difficulty: {q.difficultyLevel}</span> |
                                    <span> Unit: {q.unit}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#e8f5e9', borderRadius: '8px' }}>
                        <p style={{ margin: 0, color: '#2e7d32' }}>
                            ✅ All {generatedQuestions.length} questions have been saved to your question bank and are ready to use for QP generation!
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIQuestionGenerator;
