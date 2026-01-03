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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                    {courses.map((course) => (
                        <div key={course.id} className="card" style={{
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            cursor: 'pointer'
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <div style={{ padding: '1.5rem' }}>
                                <h3 style={{
                                    marginBottom: '1rem',
                                    color: 'var(--primary-color)',
                                    fontSize: '1.2rem',
                                    fontWeight: '600'
                                }}>
                                    {course.courseName}
                                </h3>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: '600', color: '#555' }}>Course Code:</span>
                                        <span style={{ color: '#333', fontWeight: '500' }}>{course.courseCode}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: '600', color: '#555' }}>Course Type:</span>
                                        <span className="badge badge-info">{course.courseType}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: '600', color: '#555' }}>Branch:</span>
                                        <span style={{ color: '#333', fontWeight: '500' }}>{course.branch} ({course.branchCode})</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: '600', color: '#555' }}>Elective Type:</span>
                                        <span className="badge badge-success">{course.electiveType}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: '600', color: '#555' }}>Year / Sem:</span>
                                        <span style={{ color: '#333', fontWeight: '500' }}>{course.yearSem}</span>
                                    </div>
                                </div>

                                <div style={{
                                    borderTop: '1px solid #e0e0e0',
                                    paddingTop: '1rem',
                                    display: 'flex',
                                    gap: '0.75rem'
                                }}>
                                    <button
                                        className="btn btn-primary"
                                        style={{ flex: 1, fontSize: '0.9rem', padding: '0.6rem' }}
                                        onClick={() => navigate(`/faculty/course-outcomes/${course.courseId}`)}
                                    >
                                        📝 Course Outcomes
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        style={{ flex: 1, fontSize: '0.9rem', padding: '0.6rem' }}
                                        onClick={() => navigate(`/faculty/questions/${course.courseId}`)}
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
