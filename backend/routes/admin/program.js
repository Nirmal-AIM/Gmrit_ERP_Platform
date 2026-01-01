/**
 * Program Routes (Admin)
 * 
 * CRUD operations for Programs (B.Tech, M.Tech, MBA, etc.)
 * Routes:
 *  - GET    /api/admin/programs - Get all programs
 *  - GET    /api/admin/programs/:id - Get single program
 *  - POST   /api/admin/programs - Create program
 *  - PUT    /api/admin/programs/:id - Update program
 *  - DELETE /api/admin/programs/:id - Delete program
 *  - PATCH  /api/admin/programs/:id/status - Toggle status
 */

const express = require('express');
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../../middleware/auth');
const { Program } = require('../../models');

/**
 * @route   GET /api/admin/programs
 * @desc    Get all programs
 * @access  Private (Admin)
 */
router.get('/', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { active } = req.query;

        const whereClause = {};
        if (active !== undefined) {
            whereClause.isActive = active === 'true';
        }

        const programs = await Program.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            data: programs
        });

    } catch (error) {
        console.error('Get programs error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch programs',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/admin/programs/:id
 * @desc    Get single program
 * @access  Private (Admin)
 */
router.get('/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const program = await Program.findByPk(req.params.id);

        if (!program) {
            return res.status(404).json({
                success: false,
                message: 'Program not found'
            });
        }

        res.json({
            success: true,
            data: program
        });

    } catch (error) {
        console.error('Get program error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch program',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/admin/programs
 * @desc    Create new program
 * @access  Private (Admin)
 */
router.post('/', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { programName, programCode, description } = req.body;

        // Validation
        if (!programName) {
            return res.status(400).json({
                success: false,
                message: 'Program name is required'
            });
        }

        // Check if program already exists
        const existingProgram = await Program.findOne({
            where: { programName }
        });

        if (existingProgram) {
            return res.status(400).json({
                success: false,
                message: 'Program with this name already exists'
            });
        }

        // Create program
        const program = await Program.create({
            programName,
            programCode,
            description,
            isActive: true
        });

        res.status(201).json({
            success: true,
            message: 'Program created successfully',
            data: program
        });

    } catch (error) {
        console.error('Create program error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create program',
            error: error.message
        });
    }
});

/**
 * @route   PUT /api/admin/programs/:id
 * @desc    Update program
 * @access  Private (Admin)
 */
router.put('/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { programName, programCode, description } = req.body;

        const program = await Program.findByPk(req.params.id);

        if (!program) {
            return res.status(404).json({
                success: false,
                message: 'Program not found'
            });
        }

        // Check if new name conflicts with existing program
        if (programName && programName !== program.programName) {
            const existingProgram = await Program.findOne({
                where: { programName }
            });

            if (existingProgram) {
                return res.status(400).json({
                    success: false,
                    message: 'Program with this name already exists'
                });
            }
        }

        // Update program
        await program.update({
            programName: programName || program.programName,
            programCode: programCode !== undefined ? programCode : program.programCode,
            description: description !== undefined ? description : program.description
        });

        res.json({
            success: true,
            message: 'Program updated successfully',
            data: program
        });

    } catch (error) {
        console.error('Update program error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update program',
            error: error.message
        });
    }
});

/**
 * @route   DELETE /api/admin/programs/:id
 * @desc    Delete program
 * @access  Private (Admin)
 */
router.delete('/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const program = await Program.findByPk(req.params.id);

        if (!program) {
            return res.status(404).json({
                success: false,
                message: 'Program not found'
            });
        }

        await program.destroy();

        res.json({
            success: true,
            message: 'Program deleted successfully'
        });

    } catch (error) {
        console.error('Delete program error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete program',
            error: error.message
        });
    }
});

/**
 * @route   PATCH /api/admin/programs/:id/status
 * @desc    Toggle program status (active/inactive)
 * @access  Private (Admin)
 */
router.patch('/:id/status', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const program = await Program.findByPk(req.params.id);

        if (!program) {
            return res.status(404).json({
                success: false,
                message: 'Program not found'
            });
        }

        await program.update({
            isActive: !program.isActive
        });

        res.json({
            success: true,
            message: `Program ${program.isActive ? 'activated' : 'deactivated'} successfully`,
            data: program
        });

    } catch (error) {
        console.error('Toggle status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle program status',
            error: error.message
        });
    }
});

module.exports = router;
