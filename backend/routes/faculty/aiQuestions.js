/**
 * AI Question Generation Routes (Faculty)
 * Generate questions automatically using AI
 */

const express = require('express');
const router = express.Router();
const { isAuthenticated, isFaculty } = require('../../middleware/auth');
const {
    Faculty, FacultyCourseMapping, Course, Question,
    CourseOutcome, BloomsLevel, DifficultyLevel, Unit
} = require('../../models');
const { generateQuestions } = require('../../utils/aiQuestionGenerator');

// Generate questions using AI
router.post('/generate', isAuthenticated, isFaculty, async (req, res) => {
    try {
        const {
            courseId, coId, bloomsLevelId, difficultyLevelId, unitId,
            count = 5, marks = 10
        } = req.body;

        // Verify faculty has access to this course
        const faculty = await Faculty.findOne({ where: { userId: req.user.id } });
        if (!faculty) {
            return res.status(404).json({ success: false, message: 'Faculty profile not found' });
        }

        const mapping = await FacultyCourseMapping.findOne({
            where: { facultyId: faculty.id, courseId, isActive: true }
        });

        if (!mapping) {
            return res.status(403).json({ success: false, message: 'You do not have access to this course' });
        }

        // If IDs are missing (user selected "Any"), pick valid defaults
        let effectiveCoId = coId;
        let effectiveBloomsId = bloomsLevelId;
        let effectiveDiffId = difficultyLevelId;
        let effectiveUnitId = unitId;

        // Auto-select defaults if missing
        if (!effectiveCoId) {
            const randomCo = await CourseOutcome.findOne({ where: { courseId } });
            effectiveCoId = randomCo ? randomCo.id : null;
        }
        if (!effectiveBloomsId) {
            const randomBloom = await BloomsLevel.findOne();
            effectiveBloomsId = randomBloom ? randomBloom.id : null;
        }
        if (!effectiveDiffId) {
            const randomDiff = await DifficultyLevel.findOne();
            effectiveDiffId = randomDiff ? randomDiff.id : null;
        }
        if (!effectiveUnitId) {
            const randomUnit = await Unit.findOne();
            effectiveUnitId = randomUnit ? randomUnit.id : null;
        }

        if (!effectiveCoId || !effectiveBloomsId || !effectiveDiffId || !effectiveUnitId) {
            return res.status(400).json({
                success: false,
                message: 'Could not find required metadata (COs, Units, etc.) in database to support "Any" selection.'
            });
        }

        // Get course and related data with resolved IDs
        const [course, co, bloomsLevel, difficultyLevel, unit] = await Promise.all([
            Course.findByPk(courseId),
            CourseOutcome.findByPk(effectiveCoId),
            BloomsLevel.findByPk(effectiveBloomsId),
            DifficultyLevel.findByPk(effectiveDiffId),
            Unit.findByPk(effectiveUnitId)
        ]);

        if (!course || !co || !bloomsLevel || !difficultyLevel || !unit) {
            return res.status(404).json({ success: false, message: 'One or more required entities not found' });
        }

        // Generate questions using AI
        const aiQuestions = await generateQuestions({
            courseName: course.courseName,
            topic: unit.unitName,
            coDescription: co.coDescription,
            bloomsLevel: bloomsLevel.levelName,
            difficulty: difficultyLevel.levelName,
            count: parseInt(count),
            marks: parseInt(marks)
        });

        // Save generated questions to database
        const savedQuestions = [];
        for (const aiQ of aiQuestions) {
            const question = await Question.create({
                courseId,
                coId: effectiveCoId,
                bloomsLevelId: effectiveBloomsId,
                difficultyLevelId: effectiveDiffId,
                unitId: effectiveUnitId,
                questionText: aiQ.questionText,
                marks: parseInt(marks),
                isActive: true,
                createdBy: faculty.id
            });

            savedQuestions.push({
                id: question.id,
                questionText: question.questionText,
                marks: question.marks,
                co: co.coNumber,
                bloomsLevel: bloomsLevel.levelName,
                difficultyLevel: difficultyLevel.levelName,
                unit: unit.unitName
            });
        }

        res.json({
            success: true,
            message: `Successfully generated and saved ${savedQuestions.length} questions`,
            data: savedQuestions
        });

    } catch (error) {
        console.error('AI Question Generation Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate questions',
            error: error.message
        });
    }
});

// Bulk generate questions for multiple criteria
router.post('/bulk-generate', isAuthenticated, isFaculty, async (req, res) => {
    try {
        const { courseId, criteria } = req.body;
        // criteria is an array of { coId, bloomsLevelId, difficultyLevelId, unitId, count, marks }

        if (!courseId || !criteria || !Array.isArray(criteria)) {
            return res.status(400).json({
                success: false,
                message: 'courseId and criteria array are required'
            });
        }

        const faculty = await Faculty.findOne({ where: { userId: req.user.id } });
        if (!faculty) {
            return res.status(404).json({ success: false, message: 'Faculty profile not found' });
        }

        const allGeneratedQuestions = [];

        for (const criterion of criteria) {
            const result = await generateQuestionsForCriterion(
                courseId,
                criterion,
                faculty.id
            );
            allGeneratedQuestions.push(...result);
        }

        res.json({
            success: true,
            message: `Successfully generated ${allGeneratedQuestions.length} questions`,
            data: allGeneratedQuestions
        });

    } catch (error) {
        console.error('Bulk AI Generation Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to bulk generate questions',
            error: error.message
        });
    }
});

// Helper function
async function generateQuestionsForCriterion(courseId, criterion, facultyId) {
    const { coId, bloomsLevelId, difficultyLevelId, unitId, count, marks } = criterion;

    const [course, co, bloomsLevel, difficultyLevel, unit] = await Promise.all([
        Course.findByPk(courseId),
        CourseOutcome.findByPk(coId),
        BloomsLevel.findByPk(bloomsLevelId),
        DifficultyLevel.findByPk(difficultyLevelId),
        Unit.findByPk(unitId)
    ]);

    const aiQuestions = await generateQuestions({
        courseName: course.courseName,
        topic: unit.unitName,
        coDescription: co.coDescription,
        bloomsLevel: bloomsLevel.levelName,
        difficulty: difficultyLevel.levelName,
        count: parseInt(count || 1),
        marks: parseInt(marks || 10)
    });

    const savedQuestions = [];
    for (const aiQ of aiQuestions) {
        const question = await Question.create({
            courseId,
            coId,
            bloomsLevelId,
            difficultyLevelId,
            unitId,
            questionText: aiQ.questionText,
            marks: parseInt(marks || 10),
            isActive: true,
            createdBy: facultyId
        });

        savedQuestions.push({
            id: question.id,
            questionText: question.questionText,
            marks: question.marks
        });
    }

    return savedQuestions;
}

module.exports = router;
