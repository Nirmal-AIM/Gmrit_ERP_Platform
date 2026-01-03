import { useState, useEffect } from 'react';
import api from '../../utils/api';
import '../Admin/Programs.css';
import './QPGeneration.css';

const QPGeneration = () => {
    const [step, setStep] = useState(1);
    const [programs, setPrograms] = useState([]);
    const [courses, setCourses] = useState([]);
    const [regulations, setRegulations] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        programId: '',
        courseId: '',
        assessmentType: 'MID-1',
        examDate: '',
        regulationId: '',
        year: 'I',
        semester: 'I'
    });

    const [questionConfig, setQuestionConfig] = useState({
        totalQuestions: 5,
        questionsPerUnit: 1,
        marksPerQuestion: 10
    });

    useEffect(() => {
        fetchPrograms();
        fetchRegulations();
        fetchHistory();
    }, []);

    const fetchPrograms = async () => {
        try {
            const response = await api.get('/admin/programs?isActive=true');
            setPrograms(response.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchRegulations = async () => {
        try {
            const response = await api.get('/admin/regulations?isActive=true');
            setRegulations(response.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchCourses = async (programId, regulationId) => {
        if (!programId || !regulationId) return;
        try {
            const response = await api.get(`/api/admin/qp-generation/courses?programId=${programId}&regulationId=${regulationId}`);
            setCourses(response.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchHistory = async () => {
        try {
            const response = await api.get('/admin/qp-generation/history');
            setHistory(response.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleFormChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
        if (field === 'programId' || field === 'regulationId') {
            fetchCourses(
                field === 'programId' ? value : formData.programId,
                field === 'regulationId' ? value : formData.regulationId
            );
        }
    };

    const handleGenerateQP = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await api.post('/api/admin/qp-generation/generate', {
                ...formData,
                ...questionConfig
            });

            setSuccess('Question Paper generated successfully!');

            // Download PDF
            const pdfUrl = response.data.data.pdfPath;
            window.open(`http://localhost:5000${pdfUrl}`, '_blank');

            fetchHistory();
            resetForm();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to generate QP');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setStep(1);
        setFormData({
            programId: '',
            courseId: '',
            assessmentType: 'MID-1',
            examDate: '',
            regulationId: '',
            year: 'I',
            semester: 'I'
        });
        setQuestionConfig({
            totalQuestions: 5,
            questionsPerUnit: 1,
            marksPerQuestion: 10
        });
    };

    const renderStep1 = () => (
        <div className="qp-step">
            <h3>Step 1: Basic Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                    <label>Program *</label>
                    <select className="form-control" value={formData.programId} onChange={(e) => handleFormChange('programId', e.target.value)} required>
                        <option value="">Select Program</option>
                        {programs.map(p => <option key={p.id} value={p.id}>{p.programName}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label>Regulation *</label>
                    <select className="form-control" value={formData.regulationId} onChange={(e) => handleFormChange('regulationId', e.target.value)} required>
                        <option value="">Select Regulation</option>
                        {regulations.map(r => <option key={r.id} value={r.id}>{r.regulationName}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label>Course *</label>
                    <select className="form-control" value={formData.courseId} onChange={(e) => handleFormChange('courseId', e.target.value)} required disabled={!courses.length}>
                        <option value="">Select Course</option>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.courseCode} - {c.courseName}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label>Assessment Type *</label>
                    <select className="form-control" value={formData.assessmentType} onChange={(e) => handleFormChange('assessmentType', e.target.value)} required>
                        <option value="MID-1">MID-1</option>
                        <option value="MID-2">MID-2</option>
                        <option value="Regular">Regular</option>
                        <option value="Supply">Supply</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Year *</label>
                    <select className="form-control" value={formData.year} onChange={(e) => handleFormChange('year', e.target.value)} required>
                        <option value="I">I Year</option>
                        <option value="II">II Year</option>
                        <option value="III">III Year</option>
                        <option value="IV">IV Year</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Semester *</label>
                    <select className="form-control" value={formData.semester} onChange={(e) => handleFormChange('semester', e.target.value)} required>
                        <option value="I">I Semester</option>
                        <option value="II">II Semester</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Exam Date *</label>
                    <input type="date" className="form-control" value={formData.examDate} onChange={(e) => handleFormChange('examDate', e.target.value)} required />
                </div>
            </div>
            <button className="btn btn-primary" onClick={() => setStep(2)} disabled={!formData.programId || !formData.courseId || !formData.examDate}>
                Next: Configure Questions →
            </button>
        </div>
    );

    const renderStep2 = () => (
        <div className="qp-step">
            <h3>Step 2: Question Configuration</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                    <label>Total Questions *</label>
                    <input type="number" className="form-control" value={questionConfig.totalQuestions} onChange={(e) => setQuestionConfig({ ...questionConfig, totalQuestions: e.target.value })} min="1" max="20" required />
                </div>
                <div className="form-group">
                    <label>Questions Per Unit *</label>
                    <input type="number" className="form-control" value={questionConfig.questionsPerUnit} onChange={(e) => setQuestionConfig({ ...questionConfig, questionsPerUnit: e.target.value })} min="1" max="5" required />
                </div>
                <div className="form-group">
                    <label>Marks Per Question *</label>
                    <input type="number" className="form-control" value={questionConfig.marksPerQuestion} onChange={(e) => setQuestionConfig({ ...questionConfig, marksPerQuestion: e.target.value })} min="1" max="20" required />
                </div>
            </div>
            <div className="alert alert-info">
                <strong>Total Marks:</strong> {questionConfig.totalQuestions * questionConfig.marksPerQuestion} marks
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn btn-secondary" onClick={() => setStep(1)}>← Back</button>
                <button className="btn btn-primary" onClick={() => setStep(3)}>Next: Review & Generate →</button>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="qp-step">
            <h3>Step 3: Review & Generate</h3>
            <div className="qp-summary">
                <div className="summary-item">
                    <strong>Program:</strong> {programs.find(p => p.id == formData.programId)?.programName}
                </div>
                <div className="summary-item">
                    <strong>Course:</strong> {courses.find(c => c.id == formData.courseId)?.courseName}
                </div>
                <div className="summary-item">
                    <strong>Assessment:</strong> {formData.assessmentType}
                </div>
                <div className="summary-item">
                    <strong>Year/Sem:</strong> {formData.year} Year - {formData.semester} Semester
                </div>
                <div className="summary-item">
                    <strong>Exam Date:</strong> {formData.examDate}
                </div>
                <div className="summary-item">
                    <strong>Total Questions:</strong> {questionConfig.totalQuestions}
                </div>
                <div className="summary-item">
                    <strong>Total Marks:</strong> {questionConfig.totalQuestions * questionConfig.marksPerQuestion}
                </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button className="btn btn-secondary" onClick={() => setStep(2)}>← Back</button>
                <button className="btn btn-primary" onClick={handleGenerateQP} disabled={loading}>
                    {loading ? 'Generating...' : '🎯 Generate Question Paper'}
                </button>
            </div>
        </div>
    );

    return (
        <div className="programs-page">
            <div className="page-header">
                <h1>Question Paper Generation</h1>
                <button className="btn btn-secondary" onClick={resetForm}>🔄 New QP</button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {/* Progress Steps */}
            <div className="qp-progress">
                <div className={`qp-progress-step ${step >= 1 ? 'active' : ''}`}>1. Basic Info</div>
                <div className={`qp-progress-step ${step >= 2 ? 'active' : ''}`}>2. Configure</div>
                <div className={`qp-progress-step ${step >= 3 ? 'active' : ''}`}>3. Generate</div>
            </div>

            <div className="card">
                <div style={{ padding: '2rem' }}>
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                </div>
            </div>

            {/* History */}
            <div className="card" style={{ marginTop: '2rem' }}>
                <div style={{ padding: '1.5rem' }}>
                    <h3>Generated Question Papers History</h3>
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>S.No</th>
                                    <th>Course</th>
                                    <th>Assessment</th>
                                    <th>Year/Sem</th>
                                    <th>Exam Date</th>
                                    <th>Generated On</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.length === 0 ? (
                                    <tr><td colSpan="7" className="text-center">No history found</td></tr>
                                ) : (
                                    history.map((qp, index) => (
                                        <tr key={qp.id}>
                                            <td>{index + 1}</td>
                                            <td>{qp.Course?.courseName}</td>
                                            <td>{qp.assessmentType}</td>
                                            <td>{qp.year}-{qp.semester}</td>
                                            <td>{new Date(qp.examDate).toLocaleDateString()}</td>
                                            <td>{new Date(qp.createdAt).toLocaleString()}</td>
                                            <td>
                                                <button className="btn btn-sm btn-primary" onClick={() => window.open(`http://localhost:5000${qp.pdfPath}`, '_blank')}>
                                                    📄 View PDF
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QPGeneration;
