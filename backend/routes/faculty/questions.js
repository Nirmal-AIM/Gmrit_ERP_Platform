/**
 * Questions Routes (Faculty)
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const { isAuthenticated, isFaculty } = require('../../middleware/auth');
const { Question, Faculty, CourseOutcome, BloomsLevel, DifficultyLevel, Unit } = require('../../models');

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/questions';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

// Get questions for a course
router.get('/:courseId', isAuthenticated, isFaculty, async (req, res) => {
    try {
        const questions = await Question.findAll({
            where: { courseId: req.params.courseId, isActive: true },
            include: [
                { model: CourseOutcome, as: 'courseOutcome', attributes: ['coNumber'] },
                { model: BloomsLevel, as: 'bloomsLevel', attributes: ['levelName'] },
                { model: DifficultyLevel, as: 'difficultyLevel', attributes: ['levelName'] },
                { model: Unit, as: 'unit', attributes: ['unitName'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({ success: true, data: questions });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch questions', error: error.message });
    }
});

// Create question
router.post('/', isAuthenticated, isFaculty, upload.single('image'), async (req, res) => {
    try {
        const { courseId, coId, bloomsLevelId, difficultyLevelId, unitId, questionText, marks } = req.body;

        if (!courseId || !coId || !bloomsLevelId || !difficultyLevelId || !unitId || !questionText || !marks) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        const faculty = await Faculty.findOne({ where: { userId: req.user.id } });
        if (!faculty) return res.status(404).json({ success: false, message: 'Faculty profile not found' });

        const imagePath = req.file ? `/uploads/questions/${req.file.filename}` : null;

        const question = await Question.create({
            courseId, coId, bloomsLevelId, difficultyLevelId, unitId,
            questionText, imagePath, marks,
            createdBy: faculty.id,
            isActive: true
        });

        const result = await Question.findByPk(question.id, {
            include: [
                { model: CourseOutcome, as: 'courseOutcome' },
                { model: BloomsLevel, as: 'bloomsLevel' },
                { model: DifficultyLevel, as: 'difficultyLevel' },
                { model: Unit, as: 'unit' }
            ]
        });

        res.status(201).json({ success: true, message: 'Question created successfully', data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create question', error: error.message });
    }
});

// Bulk upload questions
router.post('/bulk-upload', isAuthenticated, isFaculty, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const faculty = await Faculty.findOne({ where: { userId: req.user.id } });
        const results = [];
        const errors = [];

        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', (row) => results.push(row))
            .on('end', async () => {
                fs.unlinkSync(req.file.path);

                for (const row of results) {
                    try {
                        await Question.create({
                            courseId: parseInt(row.courseId),
                            coId: parseInt(row.coId),
                            bloomsLevelId: parseInt(row.bloomsLevelId),
                            difficultyLevelId: parseInt(row.difficultyLevelId),
                            unitId: parseInt(row.unitId),
                            questionText: row.questionText,
                            marks: parseInt(row.marks),
                            createdBy: faculty.id,
                            isActive: true
                        });
                    } catch (error) {
                        errors.push({ row, error: error.message });
                    }
                }

                res.json({
                    success: true,
                    message: `Bulk upload completed. ${results.length - errors.length} questions created.`,
                    errors: errors.length > 0 ? errors : undefined
                });
            });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Bulk upload failed', error: error.message });
    }
});

// Update question
router.put('/:id', isAuthenticated, isFaculty, upload.single('image'), async (req, res) => {
    try {
        const question = await Question.findByPk(req.params.id);
        if (!question) return res.status(404).json({ success: false, message: 'Question not found' });

        const updateData = { ...req.body };
        if (req.file) {
            updateData.imagePath = `/uploads/questions/${req.file.filename}`;
        }

        await question.update(updateData);
        res.json({ success: true, message: 'Question updated successfully', data: question });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update question', error: error.message });
    }
});

// Delete question
router.delete('/:id', isAuthenticated, isFaculty, async (req, res) => {
    try {
        const question = await Question.findByPk(req.params.id);
        if (!question) return res.status(404).json({ success: false, message: 'Question not found' });

        await question.destroy();
        res.json({ success: true, message: 'Question deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete question', error: error.message });
    }
});

// Toggle status
router.patch('/:id/status', isAuthenticated, isFaculty, async (req, res) => {
    try {
        const question = await Question.findByPk(req.params.id);
        if (!question) return res.status(404).json({ success: false, message: 'Question not found' });

        await question.update({ isActive: !question.isActive });
        res.json({ success: true, message: 'Status updated successfully', data: question });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to toggle status', error: error.message });
    }
});

module.exports = router;
