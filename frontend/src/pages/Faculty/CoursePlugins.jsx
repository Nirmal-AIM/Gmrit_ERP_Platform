import { useState, useEffect } from 'react';
import api from '../../utils/api';
import '../Admin/Programs.css';
import './CoursePlugins.css';

const CoursePlugins = () => {
    const [activeTab, setActiveTab] = useState('blooms');
    const [bloomsLevels, setBloomsLevels] = useState([]);
    const [difficultyLevels, setDifficultyLevels] = useState([]);
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentItem, setCurrentItem] = useState({});
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const [bloomsRes, diffRes, unitsRes] = await Promise.all([
                api.get('/faculty/course-plugins/blooms-level'),
                api.get('/faculty/course-plugins/difficulty-level'),
                api.get('/faculty/course-plugins/units')
            ]);
            setBloomsLevels(bloomsRes.data.data);
            setDifficultyLevels(diffRes.data.data);
            setUnits(unitsRes.data.data);
        } catch (err) {
            setError('Failed to fetch data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getEndpoint = () => {
        if (activeTab === 'blooms') return '/faculty/course-plugins/blooms-level';
        if (activeTab === 'difficulty') return '/faculty/course-plugins/difficulty-level';
        return '/faculty/course-plugins/units';
    };

    const getCurrentData = () => {
        if (activeTab === 'blooms') return bloomsLevels;
        if (activeTab === 'difficulty') return difficultyLevels;
        return units;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const endpoint = getEndpoint();
            if (editMode) {
                await api.put(`${endpoint}/${currentItem.id}`, currentItem);
            } else {
                await api.post(endpoint, currentItem);
            }
            fetchAllData();
            closeModal();
        } catch (err) {
            setError(err.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;
        try {
            await api.delete(`${getEndpoint()}/${id}`);
            fetchAllData();
        } catch (err) {
            setError(err.response?.data?.message || 'Delete failed');
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await api.patch(`${getEndpoint()}/${id}/status`);
            fetchAllData();
        } catch (err) {
            setError(err.response?.data?.message || 'Status toggle failed');
        }
    };

    const openModal = (item = null) => {
        if (item) {
            setEditMode(true);
            setCurrentItem(item);
        } else {
            setEditMode(false);
            if (activeTab === 'blooms') {
                setCurrentItem({ levelName: '', levelNumber: '', description: '' });
            } else if (activeTab === 'difficulty') {
                setCurrentItem({ levelName: '', description: '' });
            } else {
                setCurrentItem({ unitName: '', unitNumber: '', description: '' });
            }
        }
        setShowModal(true);
        setError('');
    };

    const closeModal = () => {
        setShowModal(false);
        setEditMode(false);
        setCurrentItem({});
        setError('');
    };

    if (loading) {
        return <div className="loading-spinner"></div>;
    }

    const data = getCurrentData();

    return (
        <div className="programs-page">
            <div className="page-header">
                <h1>Course Plugins</h1>
                <button className="btn btn-primary" onClick={() => openModal()}>
                    + Add {activeTab === 'blooms' ? "Bloom's Level" : activeTab === 'difficulty' ? 'Difficulty Level' : 'Unit'}
                </button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {/* Tabs */}
            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'blooms' ? 'active' : ''}`}
                    onClick={() => setActiveTab('blooms')}
                >
                    Bloom's Levels
                </button>
                <button
                    className={`tab ${activeTab === 'difficulty' ? 'active' : ''}`}
                    onClick={() => setActiveTab('difficulty')}
                >
                    Difficulty Levels
                </button>
                <button
                    className={`tab ${activeTab === 'units' ? 'active' : ''}`}
                    onClick={() => setActiveTab('units')}
                >
                    Units
                </button>
            </div>

            <div className="card">
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>S.No</th>
                                <th>{activeTab === 'units' ? 'Unit Name' : 'Level Name'}</th>
                                {(activeTab === 'blooms' || activeTab === 'units') && <th>Number</th>}
                                <th>Description</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.length === 0 ? (
                                <tr>
                                    <td colSpan={activeTab === 'difficulty' ? '5' : '6'} className="text-center">No data found</td>
                                </tr>
                            ) : (
                                data.map((item, index) => (
                                    <tr key={item.id}>
                                        <td>{index + 1}</td>
                                        <td>{item.levelName || item.unitName}</td>
                                        {(activeTab === 'blooms' || activeTab === 'units') && <td>{item.levelNumber || item.unitNumber}</td>}
                                        <td>{item.description || '-'}</td>
                                        <td>
                                            <span className={`badge ${item.isActive ? 'badge-success' : 'badge-danger'}`}>
                                                {item.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="actions">
                                            <button className="btn-icon btn-edit" onClick={() => openModal(item)} title="Edit">✏️</button>
                                            <button className="btn-icon btn-toggle" onClick={() => handleToggleStatus(item.id)} title="Toggle">{item.isActive ? '🔒' : '🔓'}</button>
                                            <button className="btn-icon btn-delete" onClick={() => handleDelete(item.id)} title="Delete">🗑️</button>
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
                            <h2>{editMode ? 'Edit' : 'Add'} {activeTab === 'blooms' ? "Bloom's Level" : activeTab === 'difficulty' ? 'Difficulty Level' : 'Unit'}</h2>
                            <button className="modal-close" onClick={closeModal}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>{activeTab === 'units' ? 'Unit Name' : 'Level Name'} *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={currentItem.levelName || currentItem.unitName || ''}
                                    onChange={(e) => setCurrentItem({
                                        ...currentItem,
                                        [activeTab === 'units' ? 'unitName' : 'levelName']: e.target.value
                                    })}
                                    required
                                />
                            </div>
                            {(activeTab === 'blooms' || activeTab === 'units') && (
                                <div className="form-group">
                                    <label>{activeTab === 'units' ? 'Unit Number' : 'Level Number'}</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={currentItem.levelNumber || currentItem.unitNumber || ''}
                                        onChange={(e) => setCurrentItem({
                                            ...currentItem,
                                            [activeTab === 'units' ? 'unitNumber' : 'levelNumber']: e.target.value
                                        })}
                                        min="1"
                                    />
                                </div>
                            )}
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    className="form-control"
                                    rows="3"
                                    value={currentItem.description || ''}
                                    onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
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

export default CoursePlugins;
