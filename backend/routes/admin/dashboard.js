/**
 * Admin Dashboard Routes
 * 
 * Provides statistics and overview data for admin dashboard
 * Route: GET /api/admin/dashboard
 */

const express = require('express');
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../../middleware/auth');
const {
    Program,
    Branch,
    Course,
    Faculty,
    Question,
    GeneratedQP,
    FacultyCourseMapping
} = require('../../models');

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get dashboard statistics
 * @access  Private (Admin only)
 */
router.get('/', isAuthenticated, isAdmin, async (req, res) => {
    try {
        // Get counts
        const [
            totalPrograms,
            activePrograms,
            totalBranches,
            activeBranches,
            totalCourses,
            activeCourses,
            totalFaculty,
            activeFaculty,
            totalQuestions,
            totalQPGenerated
        ] = await Promise.all([
            Program.count(),
            Program.count({ where: { isActive: true } }),
            Branch.count(),
            Branch.count({ where: { isActive: true } }),
            Course.count(),
            Course.count({ where: { isActive: true } }),
            Faculty.count(),
            Faculty.count({ where: { isActive: true } }),
            Question.count({ where: { isActive: true } }),
            GeneratedQP.count()
        ]);

        // Get recent faculty course mappings
        const recentMappings = await FacultyCourseMapping.findAll({
            limit: 5,
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: Faculty,
                    as: 'faculty',
                    attributes: ['facultyName', 'empId']
                },
                {
                    model: Course,
                    as: 'course',
                    attributes: ['courseName', 'courseCode']
                }
            ]
        });

        res.json({
            success: true,
            data: {
                statistics: {
                    programs: {
                        total: totalPrograms,
                        active: activePrograms,
                        inactive: totalPrograms - activePrograms
                    },
                    branches: {
                        total: totalBranches,
                        active: activeBranches,
                        inactive: totalBranches - activeBranches
                    },
                    courses: {
                        total: totalCourses,
                        active: activeCourses,
                        inactive: totalCourses - activeCourses
                    },
                    faculty: {
                        total: totalFaculty,
                        active: activeFaculty,
                        inactive: totalFaculty - activeFaculty
                    },
                    questions: {
                        total: totalQuestions
                    },
                    qpGenerated: {
                        total: totalQPGenerated
                    }
                },
                recentActivities: recentMappings.map(mapping => ({
                    id: mapping.id,
                    facultyName: mapping.faculty.facultyName,
                    courseName: mapping.course.courseName,
                    courseCode: mapping.course.courseCode,
                    academicYear: mapping.academicYear,
                    createdAt: mapping.createdAt
                }))
            }
        });

    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard data',
            error: error.message
        });
    }
});

module.exports = router;
