/**
 * Course Outcomes Routes (Faculty)
 */

const express = require('express');
const router = express.Router();
const { isAuthenticated, isFaculty } = require('../../middleware/auth');
const { CourseOutcome, Faculty } = require('../../models');

// Get COs for a course
router.get('/:courseId', isAuthenticated, isFaculty, async (req, res) => {
    try {
        const { Course } = require('../../models');

        const course = await Course.findByPk(req.params.courseId);
        if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

        const cos = await CourseOutcome.findAll({
            where: { courseId: req.params.courseId },
            order: [['coNumber', 'ASC']]
        });

        res.json({
            success: true,
            data: {
                course: {
                    id: course.id,
                    courseCode: course.courseCode,
                    courseName: course.courseName
                },
                outcomes: cos
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch COs', error: error.message });
    }
});

// Create CO
router.post('/:courseId', isAuthenticated, isFaculty, async (req, res) => {
    try {
        const { coNumber, coDescription } = req.body;
        const courseId = req.params.courseId;

        if (!coNumber || !coDescription) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        const co = await CourseOutcome.create({ courseId, coNumber, coDescription, isActive: true });
        res.status(201).json({ success: true, message: 'CO created successfully', data: co });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create CO', error: error.message });
    }
});

// Update CO
router.put('/:id', isAuthenticated, isFaculty, async (req, res) => {
    try {
        const co = await CourseOutcome.findByPk(req.params.id);
        if (!co) return res.status(404).json({ success: false, message: 'CO not found' });

        await co.update(req.body);
        res.json({ success: true, message: 'CO updated successfully', data: co });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update CO', error: error.message });
    }
});

// Delete CO
router.delete('/:id', isAuthenticated, isFaculty, async (req, res) => {
    try {
        const co = await CourseOutcome.findByPk(req.params.id);
        if (!co) return res.status(404).json({ success: false, message: 'CO not found' });

        await co.destroy();
        res.json({ success: true, message: 'CO deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete CO', error: error.message });
    }
});

// Toggle status
router.patch('/:id/status', isAuthenticated, isFaculty, async (req, res) => {
    try {
        const co = await CourseOutcome.findByPk(req.params.id);
        if (!co) return res.status(404).json({ success: false, message: 'CO not found' });

        await co.update({ isActive: !co.isActive });
        res.json({ success: true, message: 'Status updated successfully', data: co });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to toggle status', error: error.message });
    }
});

module.exports = router;
