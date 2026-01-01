/**
 * Regulation Routes (Admin)
 * 
 * CRUD operations for Regulations (AR23, AR21, AR20, etc.)
 */

const express = require('express');
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../../middleware/auth');
const { Regulation } = require('../../models');

// Get all regulations
router.get('/', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { active } = req.query;
        const whereClause = {};
        if (active !== undefined) whereClause.isActive = active === 'true';

        const regulations = await Regulation.findAll({
            where: whereClause,
            order: [['regulationYear', 'DESC']]
        });

        res.json({ success: true, data: regulations });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch regulations', error: error.message });
    }
});

// Get single regulation
router.get('/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const regulation = await Regulation.findByPk(req.params.id);
        if (!regulation) return res.status(404).json({ success: false, message: 'Regulation not found' });
        res.json({ success: true, data: regulation });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch regulation', error: error.message });
    }
});

// Create regulation
router.post('/', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { regulationName, regulationYear, description } = req.body;

        if (!regulationName) {
            return res.status(400).json({ success: false, message: 'Regulation name is required' });
        }

        const existing = await Regulation.findOne({ where: { regulationName } });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Regulation already exists' });
        }

        const regulation = await Regulation.create({ regulationName, regulationYear, description, isActive: true });
        res.status(201).json({ success: true, message: 'Regulation created successfully', data: regulation });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create regulation', error: error.message });
    }
});

// Update regulation
router.put('/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { regulationName, regulationYear, description } = req.body;
        const regulation = await Regulation.findByPk(req.params.id);

        if (!regulation) return res.status(404).json({ success: false, message: 'Regulation not found' });

        if (regulationName && regulationName !== regulation.regulationName) {
            const existing = await Regulation.findOne({ where: { regulationName } });
            if (existing) return res.status(400).json({ success: false, message: 'Regulation name already exists' });
        }

        await regulation.update({
            regulationName: regulationName || regulation.regulationName,
            regulationYear: regulationYear !== undefined ? regulationYear : regulation.regulationYear,
            description: description !== undefined ? description : regulation.description
        });

        res.json({ success: true, message: 'Regulation updated successfully', data: regulation });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update regulation', error: error.message });
    }
});

// Delete regulation
router.delete('/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const regulation = await Regulation.findByPk(req.params.id);
        if (!regulation) return res.status(404).json({ success: false, message: 'Regulation not found' });

        await regulation.destroy();
        res.json({ success: true, message: 'Regulation deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete regulation', error: error.message });
    }
});

// Toggle status
router.patch('/:id/status', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const regulation = await Regulation.findByPk(req.params.id);
        if (!regulation) return res.status(404).json({ success: false, message: 'Regulation not found' });

        await regulation.update({ isActive: !regulation.isActive });
        res.json({ success: true, message: `Regulation ${regulation.isActive ? 'activated' : 'deactivated'} successfully`, data: regulation });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to toggle status', error: error.message });
    }
});

module.exports = router;
