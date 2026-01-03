/**
 * Question Paper Generation Routes (Faculty)
 * 
 * Automated question paper generation with balanced distribution
 */

const express = require('express');
const router = express.Router();
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { isAuthenticated, isFaculty } = require('../../middleware/auth');
const {
    Faculty, FacultyCourseMapping, Course, Question, GeneratedQP,
    CourseOutcome, BloomsLevel, DifficultyLevel, Unit, Program, Regulation,
    BranchCourseMapping, ProgramBranchMapping
} = require('../../models');
const { getCurrentAcademicYear } = require('../../utils/academicYear');

// Configure multer for syllabus uploads
const syllabusStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads/syllabus');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `syllabus_${req.params.courseId}_${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const syllabusUpload = multer({
    storage: syllabusStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'));
        }
    }
});

// Upload syllabus for a course
router.post('/upload-syllabus/:courseId', isAuthenticated, isFaculty, syllabusUpload.single('syllabus'), async (req, res) => {
    try {
        const { courseId } = req.params;

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

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        // Update course with syllabus path
        const course = await Course.findByPk(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Delete old syllabus file if exists
        if (course.syllabusPath && fs.existsSync(course.syllabusPath)) {
            fs.unlinkSync(course.syllabusPath);
        }

        await course.update({ syllabusPath: req.file.path });

        res.json({
            success: true,
            message: 'Syllabus uploaded successfully',
            data: {
                syllabusPath: req.file.path,
                syllabusUrl: `/uploads/syllabus/${req.file.filename}`
            }
        });

    } catch (error) {
        console.error('Syllabus upload error:', error);
        res.status(500).json({ success: false, message: 'Failed to upload syllabus', error: error.message });
    }
});

// Get faculty's mapped courses
router.get('/my-courses', isAuthenticated, isFaculty, async (req, res) => {
    try {
        const faculty = await Faculty.findOne({ where: { userId: req.user.id } });
        if (!faculty) return res.status(404).json({ success: false, message: 'Faculty profile not found' });

        const mappings = await FacultyCourseMapping.findAll({
            where: { facultyId: faculty.id, isActive: true },
            include: [
                {
                    model: Course,
                    as: 'course',
                    include: [
                        { model: Regulation, as: 'regulation', attributes: ['id', 'regulationName'] }
                    ]
                }
            ]
        });

        const courses = mappings.map(m => ({
            id: m.course.id,
            courseName: m.course.courseName,
            courseCode: m.course.courseCode,
            year: m.course.year,
            semester: m.course.semester,
            regulationId: m.course.regulationId,
            regulationName: m.course.regulation?.regulationName
        }));

        res.json({ success: true, data: courses });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch courses', error: error.message });
    }
});

// Get course details (for auto-fill)
router.get('/course-details/:courseId', isAuthenticated, isFaculty, async (req, res) => {
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
router.get('/question-filters/:courseId', isAuthenticated, isFaculty, async (req, res) => {
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
router.post('/generate-questions', isAuthenticated, isFaculty, async (req, res) => {
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
                // Build a helpful error message
                const criteriaDesc = [];
                if (coId) {
                    const co = await CourseOutcome.findByPk(coId);
                    criteriaDesc.push(`CO: ${co?.coNumber || coId}`);
                }
                if (bloomsLevelId) {
                    const bloom = await BloomsLevel.findByPk(bloomsLevelId);
                    criteriaDesc.push(`Bloom's Level: ${bloom?.levelName || bloomsLevelId}`);
                }
                if (difficultyLevelId) {
                    const diff = await DifficultyLevel.findByPk(difficultyLevelId);
                    criteriaDesc.push(`Difficulty: ${diff?.levelName || difficultyLevelId}`);
                }
                if (unitId) {
                    const unit = await Unit.findByPk(unitId);
                    criteriaDesc.push(`Unit: ${unit?.unitName || unitId}`);
                }
                if (marks) criteriaDesc.push(`Marks: ${marks}`);

                return res.status(400).json({
                    success: false,
                    message: `No questions found matching: ${criteriaDesc.join(', ') || 'the specified criteria'}. Please add questions to the question bank first or use more flexible criteria (select "Any" options).`
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
router.post('/generate-qp', isAuthenticated, isFaculty, async (req, res) => {
    try {
        const {
            courseId, assessmentType, examDate,
            regulationId, year, semester, questions, institutionName
        } = req.body;

        if (!courseId || !assessmentType || !examDate || !questions) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        const faculty = await Faculty.findOne({ where: { userId: req.user.id } });
        if (!faculty) {
            return res.status(404).json({ success: false, message: 'Faculty profile not found' });
        }

        const academicYear = getCurrentAcademicYear();

        // Get course details (with error handling check)
        const course = await Course.findByPk(courseId, {
            include: [
                { model: Regulation, as: 'regulation' }
            ]
        });

        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Generate PDF
        const pdfPath = await generateQPPDF({
            institutionName: institutionName || 'Your Institution Name',
            courseName: course.courseName,
            courseCode: course.courseCode,
            assessmentType,
            examDate,
            year: year || course.year,
            semester: semester || course.semester,
            academicYear,
            questions
        });

        // Find Program ID via BranchCourseMapping
        let programId = null;
        const bcMapping = await BranchCourseMapping.findOne({
            where: {
                courseId: course.id,
                regulationId: regulationId || course.regulationId
            },
            include: [{ model: ProgramBranchMapping, as: 'pbMapping' }]
        });

        if (bcMapping && bcMapping.pbMapping) {
            programId = bcMapping.pbMapping.programId;
        } else {
            // Fallback: Try to find any program for this branch
            const pbMapping = await ProgramBranchMapping.findOne({
                where: { branchId: course.branchId }
            });
            if (pbMapping) programId = pbMapping.programId;
        }

        // If still null, use a default ID (e.g. 1) to prevent crash
        if (!programId) {
            console.warn('Could not find ProgramID for course, defaulting to 1');
            programId = 1;
        }

        // Save to database
        const qp = await GeneratedQP.create({
            courseId,
            programId, // Added programId
            assessmentType,
            examDate,
            regulationId: regulationId || course.regulationId,
            year: year || course.year,
            semester: semester || course.semester,
            academicYear,
            questionPaperData: questions, // Store JSON directly
            pdfPath,
            generatedBy: req.user.id // Correct: Points to Users table
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
        res.status(500).json({ success: false, message: `Failed to generate QP: ${error.message}`, error: error.message });
    }
});

// Helper function to generate PDF
async function generateQPPDF(data) {
    const {
        institutionName, courseName, courseCode,
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
          <li>All questions carry marks as specified.</li>
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
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
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

// Get QP history for faculty's courses
router.get('/history', isAuthenticated, isFaculty, async (req, res) => {
    try {
        const faculty = await Faculty.findOne({ where: { userId: req.user.id } });
        if (!faculty) return res.status(404).json({ success: false, message: 'Faculty profile not found' });

        // Get faculty's course IDs
        const mappings = await FacultyCourseMapping.findAll({
            where: { facultyId: faculty.id, isActive: true },
            attributes: ['courseId']
        });
        const courseIds = mappings.map(m => m.courseId);

        const qps = await GeneratedQP.findAll({
            where: { courseId: courseIds },
            include: [
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
