import { useState, useEffect } from 'react';
import api from '../../utils/api';
import '../Admin/Programs.css';

const Faculty = () => {
    const [faculty, setFaculty] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentFaculty, setCurrentFaculty] = useState({
        email: '',
        branchId: '',
        honorific: 'Mr.',
        facultyName: '',
        empId: '',
        phoneNumber: ''
    });
    const [bulkFile, setBulkFile] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchFaculty();
        fetchBranches();
    }, []);

    const fetchFaculty = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/faculty');
            setFaculty(response.data.data);
        } catch (err) {
            setError('Failed to fetch faculty');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchBranches = async () => {
        try {
            const response = await api.get('/admin/branches?active=true');
            setBranches(response.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editMode) {
                await api.put(`/admin/faculty/${currentFaculty.id}`, currentFaculty);
                setSuccess('Faculty updated successfully');
            } else {
                const response = await api.post('/admin/faculty', currentFaculty);
                setSuccess(`Faculty created! Password: ${response.data.password}`);
            }
            fetchFaculty();
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
            const response = await api.post('/admin/faculty/bulk-upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSuccess(`Bulk upload successful! ${response.data.data.created} faculty created.`);
            fetchFaculty();
            setShowBulkModal(false);
            setBulkFile(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Bulk upload failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure? This will also delete the associated user account.')) return;
        try {
            await api.delete(`/admin/faculty/${id}`);
            setSuccess('Faculty deleted successfully');
            fetchFaculty();
        } catch (err) {
            setError(err.response?.data?.message || 'Delete failed');
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await api.patch(`/admin/faculty/${id}/status`);
            fetchFaculty();
        } catch (err) {
            setError(err.response?.data?.message || 'Status toggle failed');
        }
    };

    const openModal = (fac = null) => {
        if (fac) {
            setEditMode(true);
            setCurrentFaculty({
                id: fac.id,
                email: fac.user?.email || '',
                branchId: fac.branchId,
                honorific: fac.honorific,
                facultyName: fac.facultyName,
                empId: fac.empId,
                phoneNumber: fac.phoneNumber || ''
            });
        } else {
            setEditMode(false);
            setCurrentFaculty({
                email: '',
                branchId: '',
                honorific: 'Mr.',
                facultyName: '',
                empId: '',
                phoneNumber: ''
            });
        }
        setShowModal(true);
        setError('');
        setSuccess('');
    };

    const closeModal = () => {
        setShowModal(false);
        setEditMode(false);
        setError('');
    };

    const downloadSampleCSV = () => {
        const csv = 'email,branchId,honorific,facultyName,empId,phoneNumber\nfaculty1@example.com,1,Dr.,John Doe,EMP001,1234567890';
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'faculty_sample.csv';
        a.click();
    };

    if (loading) {
        return <div className="loading-spinner"></div>;
    }

    return (
        <div className="programs-page">
            <div className="page-header">
                <h1>Faculty Management</h1>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-secondary" onClick={() => setShowBulkModal(true)}>
                        📤 Bulk Upload
                    </button>
                    <button className="btn btn-primary" onClick={() => openModal()}>
                        + Add Faculty
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
                                <th>Emp ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Branch</th>
                                <th>Phone</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {faculty.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center">No faculty found</td>
                                </tr>
                            ) : (
                                faculty.map((fac, index) => (
                                    <tr key={fac.id}>
                                        <td>{index + 1}</td>
                                        <td>{fac.empId}</td>
                                        <td>{fac.honorific} {fac.facultyName}</td>
                                        <td>{fac.user?.email}</td>
                                        <td>{fac.branch?.branchName}</td>
                                        <td>{fac.phoneNumber || '-'}</td>
                                        <td>
                                            <span className={`badge ${fac.isActive ? 'badge-success' : 'badge-danger'}`}>
                                                {fac.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="actions">
                                            <button className="btn-icon btn-edit" onClick={() => openModal(fac)} title="Edit">✏️</button>
                                            <button className="btn-icon btn-toggle" onClick={() => handleToggleStatus(fac.id)} title="Toggle">{fac.isActive ? '🔒' : '🔓'}</button>
                                            <button className="btn-icon btn-delete" onClick={() => handleDelete(fac.id)} title="Delete">🗑️</button>
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
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editMode ? 'Edit Faculty' : 'Add New Faculty'}</h2>
                            <button className="modal-close" onClick={closeModal}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Email *</label>
                                <input type="email" className="form-control" value={currentFaculty.email} onChange={(e) => setCurrentFaculty({ ...currentFaculty, email: e.target.value })} required disabled={editMode} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Honorific *</label>
                                    <select className="form-control" value={currentFaculty.honorific} onChange={(e) => setCurrentFaculty({ ...currentFaculty, honorific: e.target.value })} required>
                                        <option value="Dr.">Dr.</option>
                                        <option value="Mr.">Mr.</option>
                                        <option value="Mrs.">Mrs.</option>
                                        <option value="Ms.">Ms.</option>
                                        <option value="Prof.">Prof.</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Faculty Name *</label>
                                    <input type="text" className="form-control" value={currentFaculty.facultyName} onChange={(e) => setCurrentFaculty({ ...currentFaculty, facultyName: e.target.value })} required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Employee ID *</label>
                                <input type="text" className="form-control" value={currentFaculty.empId} onChange={(e) => setCurrentFaculty({ ...currentFaculty, empId: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Branch *</label>
                                <select className="form-control" value={currentFaculty.branchId} onChange={(e) => setCurrentFaculty({ ...currentFaculty, branchId: e.target.value })} required>
                                    <option value="">Select Branch</option>
                                    {branches.map(b => <option key={b.id} value={b.id}>{b.branchName}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input type="tel" className="form-control" value={currentFaculty.phoneNumber} onChange={(e) => setCurrentFaculty({ ...currentFaculty, phoneNumber: e.target.value })} />
                            </div>
                            {!editMode && (
                                <div className="alert alert-info" style={{ marginTop: '1rem' }}>
                                    A random password will be generated and sent to the faculty's email.
                                </div>
                            )}
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
                            <h2>Bulk Upload Faculty</h2>
                            <button className="modal-close" onClick={() => setShowBulkModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleBulkUpload}>
                            <div className="form-group">
                                <label>Upload CSV File *</label>
                                <input type="file" className="form-control" accept=".csv" onChange={(e) => setBulkFile(e.target.files[0])} required />
                                <small>CSV format: email, branchId, honorific, facultyName, empId, phoneNumber</small>
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

export default Faculty;
