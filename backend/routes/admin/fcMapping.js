/**
 * Faculty-Course Mapping Routes (Admin)
 */

const express = require('express');
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../../middleware/auth');
const { FacultyCourseMapping, Faculty, Course } = require('../../models');
const { getCurrentAcademicYear } = require('../../utils/academicYear');

// Get all mappings
router.get('/', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const mappings = await FacultyCourseMapping.findAll({
            include: [
                { model: Faculty, as: 'faculty', attributes: ['id', 'facultyName', 'empId'] },
                { model: Course, as: 'course', attributes: ['id', 'courseName', 'courseCode', 'courseType'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({ success: true, data: mappings });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch mappings', error: error.message });
    }
});

// Get courses by type (for dependent dropdown)
router.get('/courses-by-type/:courseType', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const courses = await Course.findAll({
            where: { courseType: req.params.courseType, isActive: true },
            attributes: ['id', 'courseName', 'courseCode', 'year', 'semester', 'electiveType']
        });

        res.json({ success: true, data: courses });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch courses', error: error.message });
    }
});

// Create mapping
router.post('/', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { facultyId, courseId, courseType, year, semester, electiveType } = req.body;

        if (!facultyId || !courseId || !courseType || !year || !semester || !electiveType) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        // Auto-calculate academic year
        const academicYear = getCurrentAcademicYear();

        const mapping = await FacultyCourseMapping.create({
            facultyId, courseId, courseType, year, semester, academicYear, electiveType,
            isActive: true
        });

        const result = await FacultyCourseMapping.findByPk(mapping.id, {
            include: [
                { model: Faculty, as: 'faculty' },
                { model: Course, as: 'course' }
            ]
        });

        res.status(201).json({ success: true, message: 'Mapping created successfully', data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create mapping', error: error.message });
    }
});

// Delete mapping
router.delete('/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const mapping = await FacultyCourseMapping.findByPk(req.params.id);
        if (!mapping) return res.status(404).json({ success: false, message: 'Mapping not found' });

        await mapping.destroy();
        res.json({ success: true, message: 'Mapping deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete mapping', error: error.message });
    }
});

// Toggle status
router.patch('/:id/status', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const mapping = await FacultyCourseMapping.findByPk(req.params.id);
        if (!mapping) return res.status(404).json({ success: false, message: 'Mapping not found' });

        await mapping.update({ isActive: !mapping.isActive });
        res.json({ success: true, message: 'Status updated successfully', data: mapping });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to toggle status', error: error.message });
    }
});

module.exports = router;
