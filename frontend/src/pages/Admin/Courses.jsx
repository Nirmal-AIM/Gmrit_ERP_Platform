import { useState, useEffect } from 'react';
import api from '../../utils/api';
import '../Admin/Programs.css';

const Courses = () => {
    const [courses, setCourses] = useState([]);
    const [branches, setBranches] = useState([]);
    const [regulations, setRegulations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentCourse, setCurrentCourse] = useState({
        courseName: '',
        courseCode: '',
        branchId: '',
        regulationId: '',
        year: 'I',
        semester: 'I',
        courseType: 'Theory',
        electiveType: 'CORE',
        credits: '',
        description: ''
    });
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        branchId: '',
        regulationId: '',
        year: '',
        semester: '',
        courseType: ''
    });

    useEffect(() => {
        fetchCourses();
        fetchBranches();
        fetchRegulations();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            Object.keys(filters).forEach(key => {
                if (filters[key]) params.append(key, filters[key]);
            });
            const response = await api.get(`/api/admin/courses?${params}`);
            setCourses(response.data.data);
        } catch (err) {
            setError('Failed to fetch courses');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchBranches = async () => {
        try {
            const response = await api.get('/api/admin/branches?isActive=true');
            setBranches(response.data.data);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editMode) {
                await api.put(`/api/admin/courses/${currentCourse.id}`, currentCourse);
            } else {
                await api.post('/api/admin/courses', currentCourse);
            }
            fetchCourses();
            closeModal();
        } catch (err) {
            setError(err.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this course?')) return;
        try {
            await api.delete(`/api/admin/courses/${id}`);
            fetchCourses();
        } catch (err) {
            setError(err.response?.data?.message || 'Delete failed');
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await api.patch(`/api/admin/courses/${id}/toggle-status`);
            fetchCourses();
        } catch (err) {
            setError(err.response?.data?.message || 'Status toggle failed');
        }
    };

    const openModal = (course = null) => {
        if (course) {
            setEditMode(true);
            setCurrentCourse(course);
        } else {
            setEditMode(false);
            setCurrentCourse({
                courseName: '',
                courseCode: '',
                branchId: '',
                regulationId: '',
                year: 'I',
                semester: 'I',
                courseType: 'Theory',
                electiveType: 'CORE',
                credits: '',
                description: ''
            });
        }
        setShowModal(true);
        setError('');
    };

    const closeModal = () => {
        setShowModal(false);
        setEditMode(false);
        setError('');
    };

    const applyFilters = () => {
        fetchCourses();
    };

    const clearFilters = () => {
        setFilters({
            branchId: '',
            regulationId: '',
            year: '',
            semester: '',
            courseType: ''
        });
        setTimeout(() => fetchCourses(), 100);
    };

    if (loading) {
        return <div className="loading-spinner"></div>;
    }

    return (
        <div className="programs-page">
            <div className="page-header">
                <h1>Courses Management</h1>
                <button className="btn btn-primary" onClick={() => openModal()}>
                    + Add Course
                </button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {/* Filters */}
            <div className="card" style={{ marginBottom: '1rem' }}>
                <div style={{ padding: '1rem' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Filters</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <select
                            className="form-control"
                            value={filters.branchId}
                            onChange={(e) => setFilters({ ...filters, branchId: e.target.value })}
                        >
                            <option value="">All Branches</option>
                            {branches.map(b => <option key={b.id} value={b.id}>{b.branchName}</option>)}
                        </select>
                        <select
                            className="form-control"
                            value={filters.regulationId}
                            onChange={(e) => setFilters({ ...filters, regulationId: e.target.value })}
                        >
                            <option value="">All Regulations</option>
                            {regulations.map(r => <option key={r.id} value={r.id}>{r.regulationName}</option>)}
                        </select>
                        <select
                            className="form-control"
                            value={filters.year}
                            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                        >
                            <option value="">All Years</option>
                            <option value="I">I Year</option>
                            <option value="II">II Year</option>
                            <option value="III">III Year</option>
                            <option value="IV">IV Year</option>
                        </select>
                        <select
                            className="form-control"
                            value={filters.semester}
                            onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
                        >
                            <option value="">All Semesters</option>
                            <option value="I">I Semester</option>
                            <option value="II">II Semester</option>
                        </select>
                        <select
                            className="form-control"
                            value={filters.courseType}
                            onChange={(e) => setFilters({ ...filters, courseType: e.target.value })}
                        >
                            <option value="">All Types</option>
                            <option value="Theory">Theory</option>
                            <option value="Lab">Lab</option>
                            <option value="Project">Project</option>
                            <option value="Seminar">Seminar</option>
                        </select>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn btn-primary" onClick={applyFilters}>Apply</button>
                            <button className="btn btn-secondary" onClick={clearFilters}>Clear</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>S.No</th>
                                <th>Course Code</th>
                                <th>Course Name</th>
                                <th>Branch</th>
                                <th>Regulation</th>
                                <th>Year</th>
                                <th>Sem</th>
                                <th>Type</th>
                                <th>Elective</th>
                                <th>Credits</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courses.length === 0 ? (
                                <tr>
                                    <td colSpan="12" className="text-center">No courses found</td>
                                </tr>
                            ) : (
                                courses.map((course, index) => (
                                    <tr key={course.id}>
                                        <td>{index + 1}</td>
                                        <td>{course.courseCode}</td>
                                        <td>{course.courseName}</td>
                                        <td>{course.Branch?.branchName}</td>
                                        <td>{course.Regulation?.regulationName}</td>
                                        <td>{course.year}</td>
                                        <td>{course.semester}</td>
                                        <td>{course.courseType}</td>
                                        <td>{course.electiveType}</td>
                                        <td>{course.credits}</td>
                                        <td>
                                            <span className={`badge ${course.isActive ? 'badge-success' : 'badge-danger'}`}>
                                                {course.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="actions">
                                            <button className="btn-icon btn-edit" onClick={() => openModal(course)} title="Edit">✏️</button>
                                            <button className="btn-icon btn-toggle" onClick={() => handleToggleStatus(course.id)} title="Toggle">{course.isActive ? '🔒' : '🔓'}</button>
                                            <button className="btn-icon btn-delete" onClick={() => handleDelete(course.id)} title="Delete">🗑️</button>
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
                            <h2>{editMode ? 'Edit Course' : 'Add New Course'}</h2>
                            <button className="modal-close" onClick={closeModal}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Course Name *</label>
                                <input type="text" className="form-control" value={currentCourse.courseName} onChange={(e) => setCurrentCourse({ ...currentCourse, courseName: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Course Code *</label>
                                <input type="text" className="form-control" value={currentCourse.courseCode} onChange={(e) => setCurrentCourse({ ...currentCourse, courseCode: e.target.value })} required />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Branch *</label>
                                    <select className="form-control" value={currentCourse.branchId} onChange={(e) => setCurrentCourse({ ...currentCourse, branchId: e.target.value })} required>
                                        <option value="">Select Branch</option>
                                        {branches.map(b => <option key={b.id} value={b.id}>{b.branchName}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Regulation *</label>
                                    <select className="form-control" value={currentCourse.regulationId} onChange={(e) => setCurrentCourse({ ...currentCourse, regulationId: e.target.value })} required>
                                        <option value="">Select Regulation</option>
                                        {regulations.map(r => <option key={r.id} value={r.id}>{r.regulationName}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Year *</label>
                                    <select className="form-control" value={currentCourse.year} onChange={(e) => setCurrentCourse({ ...currentCourse, year: e.target.value })} required>
                                        <option value="I">I Year</option>
                                        <option value="II">II Year</option>
                                        <option value="III">III Year</option>
                                        <option value="IV">IV Year</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Semester *</label>
                                    <select className="form-control" value={currentCourse.semester} onChange={(e) => setCurrentCourse({ ...currentCourse, semester: e.target.value })} required>
                                        <option value="I">I Semester</option>
                                        <option value="II">II Semester</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Course Type *</label>
                                    <select className="form-control" value={currentCourse.courseType} onChange={(e) => setCurrentCourse({ ...currentCourse, courseType: e.target.value })} required>
                                        <option value="Theory">Theory</option>
                                        <option value="Lab">Lab</option>
                                        <option value="Project">Project</option>
                                        <option value="Seminar">Seminar</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Elective Type *</label>
                                    <select className="form-control" value={currentCourse.electiveType} onChange={(e) => setCurrentCourse({ ...currentCourse, electiveType: e.target.value })} required>
                                        <option value="CORE">CORE</option>
                                        <option value="Professional Elective">Professional Elective</option>
                                        <option value="Open Elective">Open Elective</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Credits *</label>
                                <input type="number" className="form-control" value={currentCourse.credits} onChange={(e) => setCurrentCourse({ ...currentCourse, credits: e.target.value })} required min="1" max="10" />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea className="form-control" rows="3" value={currentCourse.description} onChange={(e) => setCurrentCourse({ ...currentCourse, description: e.target.value })}></textarea>
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

export default Courses;
