import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import '../Admin/Programs.css';

const MyCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchMyCourses();
    }, []);

    const fetchMyCourses = async () => {
        try {
            setLoading(true);
            const response = await api.get('/faculty/my-courses');
            setCourses(response.data.data);
        } catch (err) {
            setError('Failed to fetch courses');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading-spinner"></div>;
    }

    return (
        <div className="programs-page">
            <div className="page-header">
                <h1>My Courses</h1>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {courses.length === 0 ? (
                <div className="card">
                    <div style={{ padding: '3rem', textAlign: 'center' }}>
                        <h3>No courses assigned yet</h3>
                        <p>Please contact the administrator to assign courses to you.</p>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {courses.map((mapping) => (
                        <div key={mapping.id} className="card" style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={{ padding: '1.5rem' }}>
                                <h3 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>
                                    {mapping.Course?.courseName}
                                </h3>
                                <div style={{ marginBottom: '0.5rem' }}>
                                    <strong>Code:</strong> {mapping.Course?.courseCode}
                                </div>
                                <div style={{ marginBottom: '0.5rem' }}>
                                    <strong>Type:</strong> {mapping.courseType}
                                </div>
                                <div style={{ marginBottom: '0.5rem' }}>
                                    <strong>Year/Sem:</strong> {mapping.year} Year - {mapping.semester} Semester
                                </div>
                                <div style={{ marginBottom: '0.5rem' }}>
                                    <strong>Academic Year:</strong> {mapping.academicYear}
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <strong>Elective:</strong> {mapping.electiveType}
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                    <button
                                        className="btn btn-primary"
                                        style={{ flex: 1, fontSize: '0.9rem' }}
                                        onClick={() => navigate(`/faculty/course-outcomes/${mapping.courseId}`)}
                                    >
                                        📝 COs
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        style={{ flex: 1, fontSize: '0.9rem' }}
                                        onClick={() => navigate(`/faculty/questions/${mapping.courseId}`)}
                                    >
                                        ❓ Questions
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyCourses;
