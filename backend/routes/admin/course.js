/**
 * Course Routes (Admin)
 * 
 * CRUD operations for Courses with branch, regulation, year, semester, type, etc.
 */

const express = require('express');
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../../middleware/auth');
const { Course, Branch, Regulation } = require('../../models');

// Get all courses
router.get('/', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { active, branchId, regulationId } = req.query;
        const whereClause = {};

        if (active !== undefined) whereClause.isActive = active === 'true';
        if (branchId) whereClause.branchId = branchId;
        if (regulationId) whereClause.regulationId = regulationId;

        const courses = await Course.findAll({
            where: whereClause,
            include: [
                { model: Branch, as: 'branch', attributes: ['id', 'branchName', 'branchCode'] },
                { model: Regulation, as: 'regulation', attributes: ['id', 'regulationName'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({ success: true, data: courses });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch courses', error: error.message });
    }
});

// Get single course
router.get('/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const course = await Course.findByPk(req.params.id, {
            include: [
                { model: Branch, as: 'branch' },
                { model: Regulation, as: 'regulation' }
            ]
        });

        if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
        res.json({ success: true, data: course });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch course', error: error.message });
    }
});

// Create course
router.post('/', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const {
            courseName, courseCode, branchId, regulationId,
            year, semester, courseType, electiveType, credits, description
        } = req.body;

        if (!courseName || !courseCode || !branchId || !regulationId || !year || !semester || !courseType || !electiveType || !credits) {
            return res.status(400).json({ success: false, message: 'All required fields must be provided' });
        }

        const existing = await Course.findOne({ where: { courseCode } });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Course code already exists' });
        }

        const course = await Course.create({
            courseName, courseCode, branchId, regulationId,
            year, semester, courseType, electiveType, credits, description,
            isActive: true
        });

        const result = await Course.findByPk(course.id, {
            include: [
                { model: Branch, as: 'branch' },
                { model: Regulation, as: 'regulation' }
            ]
        });

        res.status(201).json({ success: true, message: 'Course created successfully', data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create course', error: error.message });
    }
});

// Update course
router.put('/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const course = await Course.findByPk(req.params.id);
        if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

        const { courseCode } = req.body;
        if (courseCode && courseCode !== course.courseCode) {
            const existing = await Course.findOne({ where: { courseCode } });
            if (existing) return res.status(400).json({ success: false, message: 'Course code already exists' });
        }

        await course.update(req.body);

        const result = await Course.findByPk(course.id, {
            include: [
                { model: Branch, as: 'branch' },
                { model: Regulation, as: 'regulation' }
            ]
        });

        res.json({ success: true, message: 'Course updated successfully', data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update course', error: error.message });
    }
});

// Delete course
router.delete('/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const course = await Course.findByPk(req.params.id);
        if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

        await course.destroy();
        res.json({ success: true, message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete course', error: error.message });
    }
});

// Toggle status
router.patch('/:id/status', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const course = await Course.findByPk(req.params.id);
        if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

        await course.update({ isActive: !course.isActive });
        res.json({ success: true, message: `Course ${course.isActive ? 'activated' : 'deactivated'} successfully`, data: course });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to toggle status', error: error.message });
    }
});

module.exports = router;
