/**
 * My Courses Routes (Faculty)
 */

const express = require('express');
const router = express.Router();
const { isAuthenticated, isFaculty } = require('../../middleware/auth');
const { Faculty, FacultyCourseMapping, Course, Branch } = require('../../models');

router.get('/', isAuthenticated, isFaculty, async (req, res) => {
    try {
        const faculty = await Faculty.findOne({ where: { userId: req.user.id } });
        if (!faculty) return res.status(404).json({ success: false, message: 'Faculty profile not found' });

        const courses = await FacultyCourseMapping.findAll({
            where: { facultyId: faculty.id, isActive: true },
            include: [
                {
                    model: Course,
                    as: 'course',
                    include: [{ model: Branch, as: 'branch', attributes: ['branchName', 'branchCode'] }]
                }
            ]
        });

        res.json({
            success: true,
            data: courses.map(mapping => ({
                id: mapping.id,
                courseId: mapping.courseId,
                courseCode: mapping.course.courseCode,
                courseName: mapping.course.courseName,
                courseType: mapping.courseType,
                branch: mapping.course.branch.branchName,
                branchCode: mapping.course.branch.branchCode,
                electiveType: mapping.electiveType,
                year: mapping.year,
                semester: mapping.semester,
                academicYear: mapping.academicYear
            }))
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch courses', error: error.message });
    }
});

module.exports = router;
