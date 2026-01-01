/**
 * Branch Routes (Admin)
 * 
 * CRUD operations for Branches (CSE, IT, ECE, etc.)
 */

const express = require('express');
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../../middleware/auth');
const { Branch } = require('../../models');

// Get all branches
router.get('/', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { active } = req.query;
        const whereClause = {};
        if (active !== undefined) whereClause.isActive = active === 'true';

        const branches = await Branch.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']]
        });

        res.json({ success: true, data: branches });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch branches', error: error.message });
    }
});

// Get single branch
router.get('/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const branch = await Branch.findByPk(req.params.id);
        if (!branch) return res.status(404).json({ success: false, message: 'Branch not found' });
        res.json({ success: true, data: branch });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch branch', error: error.message });
    }
});

// Create branch
router.post('/', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { branchName, branchCode, description } = req.body;

        if (!branchName || !branchCode) {
            return res.status(400).json({ success: false, message: 'Branch name and code are required' });
        }

        const existing = await Branch.findOne({ where: { branchCode } });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Branch code already exists' });
        }

        const branch = await Branch.create({ branchName, branchCode, description, isActive: true });
        res.status(201).json({ success: true, message: 'Branch created successfully', data: branch });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create branch', error: error.message });
    }
});

// Update branch
router.put('/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { branchName, branchCode, description } = req.body;
        const branch = await Branch.findByPk(req.params.id);

        if (!branch) return res.status(404).json({ success: false, message: 'Branch not found' });

        if (branchCode && branchCode !== branch.branchCode) {
            const existing = await Branch.findOne({ where: { branchCode } });
            if (existing) return res.status(400).json({ success: false, message: 'Branch code already exists' });
        }

        await branch.update({
            branchName: branchName || branch.branchName,
            branchCode: branchCode || branch.branchCode,
            description: description !== undefined ? description : branch.description
        });

        res.json({ success: true, message: 'Branch updated successfully', data: branch });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update branch', error: error.message });
    }
});

// Delete branch
router.delete('/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const branch = await Branch.findByPk(req.params.id);
        if (!branch) return res.status(404).json({ success: false, message: 'Branch not found' });

        await branch.destroy();
        res.json({ success: true, message: 'Branch deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete branch', error: error.message });
    }
});

// Toggle status
router.patch('/:id/status', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const branch = await Branch.findByPk(req.params.id);
        if (!branch) return res.status(404).json({ success: false, message: 'Branch not found' });

        await branch.update({ isActive: !branch.isActive });
        res.json({ success: true, message: `Branch ${branch.isActive ? 'activated' : 'deactivated'} successfully`, data: branch });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to toggle status', error: error.message });
    }
});

module.exports = router;
