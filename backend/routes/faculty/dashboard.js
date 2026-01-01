/**
 * Faculty Dashboard Routes
 */

const express = require('express');
const router = express.Router();
const { isAuthenticated, isFaculty } = require('../../middleware/auth');
const { Faculty, FacultyCourseMapping, Question } = require('../../models');

router.get('/', isAuthenticated, isFaculty, async (req, res) => {
    try {
        const faculty = await Faculty.findOne({ where: { userId: req.user.id } });
        if (!faculty) return res.status(404).json({ success: false, message: 'Faculty profile not found' });

        const [totalCourses, totalQuestions] = await Promise.all([
            FacultyCourseMapping.count({ where: { facultyId: faculty.id, isActive: true } }),
            Question.count({ where: { createdBy: faculty.id, isActive: true } })
        ]);

        res.json({
            success: true,
            data: {
                statistics: {
                    totalCourses,
                    totalQuestions
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch dashboard', error: error.message });
    }
});

module.exports = router;
