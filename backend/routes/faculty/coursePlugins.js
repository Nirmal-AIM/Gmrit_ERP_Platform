/**
 * Course Plugins Routes (Admin)
 * 
 * CRUD for Bloom's Level, Difficulty Level, and Units
 */

const express = require('express');
const router = express.Router();
const { isAuthenticated, isFaculty } = require('../../middleware/auth');
const { BloomsLevel, DifficultyLevel, Unit } = require('../../models');

// ============================================
// BLOOM'S LEVEL ROUTES
// ============================================

// Get all Bloom's levels
router.get('/blooms-level', isAuthenticated, isFaculty, async (req, res) => {
    try {
        const levels = await BloomsLevel.findAll({ order: [['levelNumber', 'ASC']] });
        res.json({ success: true, data: levels });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch Bloom\'s levels', error: error.message });
    }
});

// Create Bloom's level
router.post('/blooms-level', isAuthenticated, isFaculty, async (req, res) => {
    try {
        const { levelName, levelNumber, description } = req.body;
        if (!levelName) return res.status(400).json({ success: false, message: 'Level name is required' });

        const level = await BloomsLevel.create({ levelName, levelNumber, description, isActive: true });
        res.status(201).json({ success: true, message: 'Bloom\'s level created successfully', data: level });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create Bloom\'s level', error: error.message });
    }
});

// Update Bloom's level
router.put('/blooms-level/:id', isAuthenticated, isFaculty, async (req, res) => {
    try {
        const level = await BloomsLevel.findByPk(req.params.id);
        if (!level) return res.status(404).json({ success: false, message: 'Bloom\'s level not found' });

        await level.update(req.body);
        res.json({ success: true, message: 'Bloom\'s level updated successfully', data: level });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update Bloom\'s level', error: error.message });
    }
});

// Delete Bloom's level
router.delete('/blooms-level/:id', isAuthenticated, isFaculty, async (req, res) => {
    try {
        const level = await BloomsLevel.findByPk(req.params.id);
        if (!level) return res.status(404).json({ success: false, message: 'Bloom\'s level not found' });

        await level.destroy();
        res.json({ success: true, message: 'Bloom\'s level deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete Bloom\'s level', error: error.message });
    }
});

// Toggle Bloom's level status
router.patch('/blooms-level/:id/status', isAuthenticated, isFaculty, async (req, res) => {
    try {
        const level = await BloomsLevel.findByPk(req.params.id);
        if (!level) return res.status(404).json({ success: false, message: 'Bloom\'s level not found' });

        await level.update({ isActive: !level.isActive });
        res.json({ success: true, message: 'Status updated successfully', data: level });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to toggle status', error: error.message });
    }
});

// ============================================
// DIFFICULTY LEVEL ROUTES
// ============================================

// Get all Difficulty levels
router.get('/difficulty-level', isAuthenticated, isFaculty, async (req, res) => {
    try {
        const levels = await DifficultyLevel.findAll({ order: [['createdAt', 'ASC']] });
        res.json({ success: true, data: levels });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch difficulty levels', error: error.message });
    }
});

// Create Difficulty level
router.post('/difficulty-level', isAuthenticated, isFaculty, async (req, res) => {
    try {
        const { levelName, description } = req.body;
        if (!levelName) return res.status(400).json({ success: false, message: 'Level name is required' });

        const level = await DifficultyLevel.create({ levelName, description, isActive: true });
        res.status(201).json({ success: true, message: 'Difficulty level created successfully', data: level });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create difficulty level', error: error.message });
    }
});

// Update Difficulty level
router.put('/difficulty-level/:id', isAuthenticated, isFaculty, async (req, res) => {
    try {
        const level = await DifficultyLevel.findByPk(req.params.id);
        if (!level) return res.status(404).json({ success: false, message: 'Difficulty level not found' });

        await level.update(req.body);
        res.json({ success: true, message: 'Difficulty level updated successfully', data: level });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update difficulty level', error: error.message });
    }
});

// Delete Difficulty level
router.delete('/difficulty-level/:id', isAuthenticated, isFaculty, async (req, res) => {
    try {
        const level = await DifficultyLevel.findByPk(req.params.id);
        if (!level) return res.status(404).json({ success: false, message: 'Difficulty level not found' });

        await level.destroy();
        res.json({ success: true, message: 'Difficulty level deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete difficulty level', error: error.message });
    }
});

// Toggle Difficulty level status
router.patch('/difficulty-level/:id/status', isAuthenticated, isFaculty, async (req, res) => {
    try {
        const level = await DifficultyLevel.findByPk(req.params.id);
        if (!level) return res.status(404).json({ success: false, message: 'Difficulty level not found' });

        await level.update({ isActive: !level.isActive });
        res.json({ success: true, message: 'Status updated successfully', data: level });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to toggle status', error: error.message });
    }
});

// ============================================
// UNIT ROUTES
// ============================================

// Get all Units
router.get('/units', isAuthenticated, isFaculty, async (req, res) => {
    try {
        const units = await Unit.findAll({ order: [['unitNumber', 'ASC']] });
        res.json({ success: true, data: units });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch units', error: error.message });
    }
});

// Create Unit
router.post('/units', isAuthenticated, isFaculty, async (req, res) => {
    try {
        const { unitName, unitNumber, description } = req.body;
        if (!unitName) return res.status(400).json({ success: false, message: 'Unit name is required' });

        const unit = await Unit.create({ unitName, unitNumber, description, isActive: true });
        res.status(201).json({ success: true, message: 'Unit created successfully', data: unit });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create unit', error: error.message });
    }
});

// Update Unit
router.put('/units/:id', isAuthenticated, isFaculty, async (req, res) => {
    try {
        const unit = await Unit.findByPk(req.params.id);
        if (!unit) return res.status(404).json({ success: false, message: 'Unit not found' });

        await unit.update(req.body);
        res.json({ success: true, message: 'Unit updated successfully', data: unit });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update unit', error: error.message });
    }
});

// Delete Unit
router.delete('/units/:id', isAuthenticated, isFaculty, async (req, res) => {
    try {
        const unit = await Unit.findByPk(req.params.id);
        if (!unit) return res.status(404).json({ success: false, message: 'Unit not found' });

        await unit.destroy();
        res.json({ success: true, message: 'Unit deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete unit', error: error.message });
    }
});

// Toggle Unit status
router.patch('/units/:id/status', isAuthenticated, isFaculty, async (req, res) => {
    try {
        const unit = await Unit.findByPk(req.params.id);
        if (!unit) return res.status(404).json({ success: false, message: 'Unit not found' });

        await unit.update({ isActive: !unit.isActive });
        res.json({ success: true, message: 'Status updated successfully', data: unit });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to toggle status', error: error.message });
    }
});

module.exports = router;
