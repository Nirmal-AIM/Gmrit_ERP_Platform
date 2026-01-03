/**
 * Faculty Routes (Admin)
 * 
 * CRUD operations for Faculty with user creation, password generation, and email sending
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const { isAuthenticated, isAdmin, hashPassword } = require('../../middleware/auth');
const { Faculty, User, Branch, sequelize } = require('../../models');
const { generatePassword } = require('../../utils/passwordGenerator');
const { sendFacultyCredentials } = require('../../config/email');

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/temp/' });

// Get all faculty
router.get('/', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { active } = req.query;
        const whereClause = {};
        if (active !== undefined) whereClause.isActive = active === 'true';

        const faculty = await Faculty.findAll({
            where: whereClause,
            include: [
                { model: User, as: 'user', attributes: ['id', 'email', 'userType', 'isActive'] },
                { model: Branch, as: 'branch', attributes: ['id', 'branchName', 'branchCode'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({ success: true, data: faculty });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch faculty', error: error.message });
    }
});

// Get single faculty
router.get('/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const faculty = await Faculty.findByPk(req.params.id, {
            include: [
                { model: User, as: 'user' },
                { model: Branch, as: 'branch' }
            ]
        });

        if (!faculty) return res.status(404).json({ success: false, message: 'Faculty not found' });
        res.json({ success: true, data: faculty });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch faculty', error: error.message });
    }
});

// Create faculty
router.post('/', isAuthenticated, isAdmin, async (req, res) => {
    let transaction;
    try {
        console.log('📝 Faculty creation request received');
        console.log('Request body:', req.body);

        const { email, userType, branchId, honorific, facultyName, empId, phoneNumber } = req.body;

        if (!email || !branchId || !facultyName || !empId) {
            console.log('❌ Validation failed: Missing required fields');
            return res.status(400).json({ success: false, message: 'All required fields must be provided' });
        }

        console.log('✅ Validation passed');

        // Check if user already exists
        console.log('🔍 Checking if email exists:', email);
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            console.log('❌ Email already exists');
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }

        // Check if empId already exists
        console.log('🔍 Checking if empId exists:', empId);
        const existingFaculty = await Faculty.findOne({ where: { empId } });
        if (existingFaculty) {
            console.log('❌ Employee ID already exists');
            return res.status(400).json({ success: false, message: 'Employee ID already exists' });
        }

        console.log('✅ No duplicates found');

        // Generate random password
        const plainPassword = generatePassword(12);
        const hashedPassword = await hashPassword(plainPassword);
        console.log('🔐 Password generated and hashed');

        // Start transaction for actual creation
        console.log('🔄 Starting database transaction');
        transaction = await sequelize.transaction();

        // Create user
        console.log('👤 Creating user record');
        const user = await User.create({
            email,
            password: hashedPassword,
            userType: userType || 'Faculty',
            isActive: true
        }, { transaction });
        console.log('✅ User created with ID:', user.id);

        // Create faculty
        console.log('👨‍🏫 Creating faculty record');
        const faculty = await Faculty.create({
            userId: user.id,
            branchId: parseInt(branchId),
            honorific: honorific || 'Mr.',
            facultyName,
            empId,
            phoneNumber,
            isActive: true
        }, { transaction });
        console.log('✅ Faculty created with ID:', faculty.id);

        await transaction.commit();
        console.log('✅ Transaction committed');

        // Send credentials via email (after commit)
        try {
            await sendFacultyCredentials(email, plainPassword, facultyName);
            console.log('📧 Email sent successfully');
        } catch (emailError) {
            console.error('⚠️ Email sending failed:', emailError.message);
            // Continue even if email fails
        }

        const result = await Faculty.findByPk(faculty.id, {
            include: [
                { model: User, as: 'user' },
                { model: Branch, as: 'branch' }
            ]
        });

        console.log('✅ Faculty creation completed successfully');
        res.status(201).json({
            success: true,
            message: 'Faculty created successfully. Credentials sent via email.',
            data: result,
            password: plainPassword
        });

    } catch (error) {
        if (transaction) {
            await transaction.rollback();
            console.log('🔄 Transaction rolled back');
        }
        console.error('❌ Create faculty error:', error);
        res.status(500).json({ success: false, message: 'Failed to create faculty', error: error.message });
    }
});

// Bulk upload faculty
router.post('/bulk-upload', isAuthenticated, isAdmin, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const results = [];
        const errors = [];

        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', (row) => {
                results.push(row);
            })
            .on('end', async () => {
                // Delete temp file
                fs.unlinkSync(req.file.path);

                // Process each row
                for (const row of results) {
                    try {
                        const { email, branchId, honorific, facultyName, empId, phoneNumber } = row;

                        // Generate password
                        const plainPassword = generatePassword(12);
                        const hashedPassword = await hashPassword(plainPassword);

                        // Create user
                        const user = await User.create({
                            email,
                            password: hashedPassword,
                            userType: 'Faculty',
                            isActive: true
                        });

                        // Create faculty
                        await Faculty.create({
                            userId: user.id,
                            branchId: parseInt(branchId),
                            honorific: honorific || 'Mr.',
                            facultyName,
                            empId,
                            phoneNumber,
                            isActive: true
                        });

                        // Send email
                        await sendFacultyCredentials(email, plainPassword, facultyName);

                    } catch (error) {
                        errors.push({ row, error: error.message });
                    }
                }

                res.json({
                    success: true,
                    message: `Bulk upload completed. ${results.length - errors.length} faculty created successfully.`,
                    errors: errors.length > 0 ? errors : undefined
                });
            });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Bulk upload failed', error: error.message });
    }
});

// Update faculty
router.put('/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const faculty = await Faculty.findByPk(req.params.id);
        if (!faculty) return res.status(404).json({ success: false, message: 'Faculty not found' });

        await faculty.update(req.body);

        const result = await Faculty.findByPk(faculty.id, {
            include: [
                { model: User, as: 'user' },
                { model: Branch, as: 'branch' }
            ]
        });

        res.json({ success: true, message: 'Faculty updated successfully', data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update faculty', error: error.message });
    }
});

// Delete faculty
router.delete('/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const faculty = await Faculty.findByPk(req.params.id);
        if (!faculty) return res.status(404).json({ success: false, message: 'Faculty not found' });

        // Delete associated user
        await User.destroy({ where: { id: faculty.userId } });

        res.json({ success: true, message: 'Faculty deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete faculty', error: error.message });
    }
});

// Toggle status
router.patch('/:id/status', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const faculty = await Faculty.findByPk(req.params.id);
        if (!faculty) return res.status(404).json({ success: false, message: 'Faculty not found' });

        await faculty.update({ isActive: !faculty.isActive });

        // Also update user status
        await User.update({ isActive: faculty.isActive }, { where: { id: faculty.userId } });

        res.json({ success: true, message: `Faculty ${faculty.isActive ? 'activated' : 'deactivated'} successfully`, data: faculty });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to toggle status', error: error.message });
    }
});

module.exports = router;
