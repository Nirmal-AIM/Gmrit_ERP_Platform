/**
 * Program-Branch Mapping Routes (Admin)
 * 
 * Maps programs to branches (e.g., B.Tech - CSE)
 */

const express = require('express');
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../../middleware/auth');
const { ProgramBranchMapping, Program, Branch } = require('../../models');

// Get all mappings
router.get('/', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const mappings = await ProgramBranchMapping.findAll({
            include: [
                { model: Program, as: 'program', attributes: ['id', 'programName', 'programCode'] },
                { model: Branch, as: 'branch', attributes: ['id', 'branchName', 'branchCode'] }
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
        const { programId, branchId } = req.body;

        if (!programId || !branchId) {
            return res.status(400).json({ success: false, message: 'Program and Branch are required' });
        }

        // Check if mapping already exists
        const existing = await ProgramBranchMapping.findOne({ where: { programId, branchId } });
        if (existing) {
            return res.status(400).json({ success: false, message: 'This mapping already exists' });
        }

        const mapping = await ProgramBranchMapping.create({ programId, branchId, isActive: true });

        // Fetch with includes
        const result = await ProgramBranchMapping.findByPk(mapping.id, {
            include: [
                { model: Program, as: 'program' },
                { model: Branch, as: 'branch' }
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
        const mapping = await ProgramBranchMapping.findByPk(req.params.id);
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
        const mapping = await ProgramBranchMapping.findByPk(req.params.id);
        if (!mapping) return res.status(404).json({ success: false, message: 'Mapping not found' });

        await mapping.update({ isActive: !mapping.isActive });
        res.json({ success: true, message: 'Status updated successfully', data: mapping });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to toggle status', error: error.message });
    }
});

module.exports = router;
