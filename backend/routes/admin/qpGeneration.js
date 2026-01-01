/**
 * Question Paper Generation Routes (Admin)
 * 
 * Automated question paper generation with balanced distribution
 */

const express = require('express');
const router = express.Router();
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const { isAuthenticated, isAdmin } = require('../../middleware/auth');
const {
    Program, Course, Regulation, Question, GeneratedQP,
    CourseOutcome, BloomsLevel, DifficultyLevel, Unit
} = require('../../models');
const { getCurrentAcademicYear } = require('../../utils/academicYear');

// Get courses by program (for dependent dropdown)
router.get('/courses-by-program/:programId', isAuthenticated, isAdmin, async (req, res) => {
    try {
        // This would need to join through P-B mapping and B-C mapping
        // For simplicity, returning all active courses
        const courses = await Course.findAll({
            where: { isActive: true },
            include: [
                { model: Regulation, as: 'regulation', attributes: ['id', 'regulationName'] }
            ],
            attributes: ['id', 'courseName', 'courseCode', 'year', 'semester', 'regulationId']
        });

        res.json({ success: true, data: courses });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch courses', error: error.message });
    }
});

// Get course details (for auto-fill)
router.get('/course-details/:courseId', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const course = await Course.findByPk(req.params.courseId, {
            include: [
                { model: Regulation, as: 'regulation' }
            ]
        });

        if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

        res.json({
            success: true,
            data: {
                regulationId: course.regulationId,
                regulationName: course.regulation.regulationName,
                year: course.year,
                semester: course.semester
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch course details', error: error.message });
    }
});

// Get available filters for question selection
router.get('/question-filters/:courseId', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const [cos, blooms, difficulties, units] = await Promise.all([
            CourseOutcome.findAll({
                where: { courseId: req.params.courseId, isActive: true },
                attributes: ['id', 'coNumber', 'coDescription']
            }),
            BloomsLevel.findAll({
                where: { isActive: true },
                order: [['levelNumber', 'ASC']]
            }),
            DifficultyLevel.findAll({
                where: { isActive: true }
            }),
            Unit.findAll({
                where: { isActive: true },
                order: [['unitNumber', 'ASC']]
            })
        ]);

        res.json({
            success: true,
            data: {
                courseOutcomes: cos,
                bloomsLevels: blooms,
                difficultyLevels: difficulties,
                units: units
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch filters', error: error.message });
    }
});

// Generate random questions based on criteria
router.post('/generate-questions', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { courseId, criteria } = req.body;
        // criteria is an array of { coId, bloomsLevelId, difficultyLevelId, unitId, marks, count }

        if (!courseId || !criteria || !Array.isArray(criteria)) {
            return res.status(400).json({ success: false, message: 'Invalid request data' });
        }

        const selectedQuestions = [];

        for (const criterion of criteria) {
            const { coId, bloomsLevelId, difficultyLevelId, unitId, marks, count } = criterion;

            const whereClause = {
                courseId,
                isActive: true
            };

            if (coId) whereClause.coId = coId;
            if (bloomsLevelId) whereClause.bloomsLevelId = bloomsLevelId;
            if (difficultyLevelId) whereClause.difficultyLevelId = difficultyLevelId;
            if (unitId) whereClause.unitId = unitId;
            if (marks) whereClause.marks = marks;

            // Get matching questions
            const questions = await Question.findAll({
                where: whereClause,
                include: [
                    { model: CourseOutcome, as: 'courseOutcome', attributes: ['coNumber'] },
                    { model: BloomsLevel, as: 'bloomsLevel', attributes: ['levelName'] },
                    { model: DifficultyLevel, as: 'difficultyLevel', attributes: ['levelName'] },
                    { model: Unit, as: 'unit', attributes: ['unitName'] }
                ]
            });

            if (questions.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: `No questions found matching the criteria: CO${coId}, Bloom's Level ${bloomsLevelId}, Difficulty ${difficultyLevelId}`
                });
            }

            // Randomly select 'count' questions
            const numToSelect = Math.min(count || 1, questions.length);
            const shuffled = questions.sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, numToSelect);

            selectedQuestions.push(...selected);
        }

        res.json({
            success: true,
            data: selectedQuestions.map(q => ({
                id: q.id,
                questionText: q.questionText,
                imagePath: q.imagePath,
                marks: q.marks,
                co: q.courseOutcome.coNumber,
                bloomsLevel: q.bloomsLevel.levelName,
                difficultyLevel: q.difficultyLevel.levelName,
                unit: q.unit.unitName
            }))
        });

    } catch (error) {
        console.error('Generate questions error:', error);
        res.status(500).json({ success: false, message: 'Failed to generate questions', error: error.message });
    }
});

// Generate and save QP
router.post('/generate-qp', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const {
            programId, courseId, assessmentType, examDate,
            regulationId, year, semester, questions, institutionName
        } = req.body;

        if (!programId || !courseId || !assessmentType || !examDate || !questions) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        const academicYear = getCurrentAcademicYear();

        // Get course and program details
        const [course, program] = await Promise.all([
            Course.findByPk(courseId),
            Program.findByPk(programId)
        ]);

        // Generate PDF
        const pdfPath = await generateQPPDF({
            institutionName: institutionName || 'Your Institution Name',
            programName: program.programName,
            courseName: course.courseName,
            courseCode: course.courseCode,
            assessmentType,
            examDate,
            year,
            semester,
            academicYear,
            questions
        });

        // Save to database
        const qp = await GeneratedQP.create({
            programId,
            courseId,
            assessmentType,
            examDate,
            regulationId,
            year,
            semester,
            academicYear,
            questionPaperData: JSON.stringify(questions),
            pdfPath,
            generatedBy: req.user.id
        });

        res.json({
            success: true,
            message: 'Question paper generated successfully',
            data: {
                id: qp.id,
                pdfPath: pdfPath,
                pdfUrl: `/uploads/qp/${path.basename(pdfPath)}`
            }
        });

    } catch (error) {
        console.error('Generate QP error:', error);
        res.status(500).json({ success: false, message: 'Failed to generate QP', error: error.message });
    }
});

// Helper function to generate PDF
async function generateQPPDF(data) {
    const {
        institutionName, programName, courseName, courseCode,
        assessmentType, examDate, year, semester, academicYear, questions
    } = data;

    // Create uploads/qp directory if it doesn't exist
    const uploadDir = path.join(__dirname, '../../uploads/qp');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `QP_${courseCode}_${assessmentType}_${Date.now()}.pdf`;
    const filePath = path.join(uploadDir, fileName);

    // HTML template for QP
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Times New Roman', serif; margin: 40px; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { margin: 5px 0; font-size: 24px; }
        .header h2 { margin: 5px 0; font-size: 18px; font-weight: normal; }
        .details { margin: 20px 0; }
        .details table { width: 100%; border-collapse: collapse; }
        .details td { padding: 5px; }
        .instructions { margin: 20px 0; }
        .questions { margin-top: 30px; }
        .question { margin: 20px 0; page-break-inside: avoid; }
        .question-number { font-weight: bold; }
        .marks { float: right; font-weight: bold; }
        hr { border: 1px solid #000; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${institutionName}</h1>
        <h2>${programName}</h2>
        <h2>${assessmentType} Examination - ${academicYear}</h2>
        <h2>Year: ${year}, Semester: ${semester}</h2>
      </div>
      
      <hr>
      
      <div class="details">
        <table>
          <tr>
            <td><strong>Course Name:</strong> ${courseName}</td>
            <td><strong>Course Code:</strong> ${courseCode}</td>
          </tr>
          <tr>
            <td><strong>Date:</strong> ${new Date(examDate).toLocaleDateString()}</td>
            <td><strong>Time:</strong> 3 Hours</td>
          </tr>
          <tr>
            <td colspan="2"><strong>Max. Marks:</strong> ${questions.reduce((sum, q) => sum + q.marks, 0)}</td>
          </tr>
        </table>
      </div>
      
      <div class="instructions">
        <strong>Instructions:</strong>
        <ol>
          <li>Answer all questions.</li>
          <li>All questions carry equal marks unless specified.</li>
          <li>Use of calculators is permitted.</li>
        </ol>
      </div>
      
      <hr>
      
      <div class="questions">
        ${questions.map((q, index) => `
          <div class="question">
            <div>
              <span class="question-number">${index + 1}.</span>
              <span class="marks">[${q.marks} Marks]</span>
            </div>
            <div style="margin-top: 10px;">
              ${q.questionText}
              ${q.imagePath ? `<br><img src="${q.imagePath}" style="max-width: 500px; margin-top: 10px;">` : ''}
            </div>
            <div style="margin-top: 5px; font-size: 12px; color: #666;">
              <em>CO: ${q.co} | Bloom's: ${q.bloomsLevel} | Difficulty: ${q.difficultyLevel} | Unit: ${q.unit}</em>
            </div>
          </div>
        `).join('')}
      </div>
      
      <div style="margin-top: 50px; text-align: center;">
        <p>*** END OF QUESTION PAPER ***</p>
      </div>
    </body>
    </html>
  `;

    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setContent(html);
    await page.pdf({
        path: filePath,
        format: 'A4',
        margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
        printBackground: true
    });
    await browser.close();

    return filePath;
}

// Get all generated QPs
router.get('/history', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const qps = await GeneratedQP.findAll({
            include: [
                { model: Program, as: 'program', attributes: ['programName'] },
                { model: Course, as: 'course', attributes: ['courseName', 'courseCode'] }
            ],
            order: [['createdAt', 'DESC']],
            limit: 50
        });

        res.json({ success: true, data: qps });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch QP history', error: error.message });
    }
});

module.exports = router;
