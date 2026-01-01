/**
 * Branch-Course Mapping Routes (Admin)
 */

const express = require('express');
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../../middleware/auth');
const { BranchCourseMapping, ProgramBranchMapping, Regulation, Course, Program, Branch } = require('../../models');

// Get all mappings
router.get('/', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const mappings = await BranchCourseMapping.findAll({
            include: [
                {
                    model: ProgramBranchMapping,
                    as: 'pbMapping',
                    include: [
                        { model: Program, as: 'program' },
                        { model: Branch, as: 'branch' }
                    ]
                },
                { model: Regulation, as: 'regulation' },
                { model: Course, as: 'course' }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({ success: true, data: mappings });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch mappings', error: error.message });
    }
});

// Create mapping
router.post('/', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { pbMappingId, regulationId, courseId } = req.body;

        if (!pbMappingId || !regulationId || !courseId) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        const mapping = await BranchCourseMapping.create({ pbMappingId, regulationId, courseId, isActive: true });
        res.status(201).json({ success: true, message: 'Mapping created successfully', data: mapping });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create mapping', error: error.message });
    }
});

// Delete mapping
router.delete('/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const mapping = await BranchCourseMapping.findByPk(req.params.id);
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
        const mapping = await BranchCourseMapping.findByPk(req.params.id);
        if (!mapping) return res.status(404).json({ success: false, message: 'Mapping not found' });

        await mapping.update({ isActive: !mapping.isActive });
        res.json({ success: true, message: 'Status updated successfully', data: mapping });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to toggle status', error: error.message });
    }
});

module.exports = router;
