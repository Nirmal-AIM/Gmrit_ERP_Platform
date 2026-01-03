# Syllabus Upload Feature

## ✅ Implementation Complete

### What Was Added:

1. **Database Schema Update**
   - Added `syllabusPath` field to `Course` model in `backend/models/index.js`
   - Stores the file path of uploaded syllabus PDFs

2. **Backend API Endpoint**
   - Route: `POST /api/faculty/qp-generation/upload-syllabus/:courseId`
   - Location: `backend/routes/faculty/qpGeneration.js`
   - Features:
     - File validation (PDF only, 10MB max)
     - Faculty access verification
     - Automatic old file deletion
     - Stores file in `uploads/syllabus/` directory

3. **Frontend UI**
   - Location: `frontend/src/pages/Faculty/QPGeneration.jsx`
   - Added to **Step 1** of QP Generation
   - Features:
     - File input with PDF restriction
     - Upload button with loading state
     - Success/error messages
     - Course selection requirement

### How to Use:

1. Navigate to **Faculty → QP Generation**
2. Select a **Course** in Step 1
3. Click **"Select Syllabus PDF"** and choose a PDF file
4. Click **"📤 Upload Syllabus"**
5. Syllabus is saved to database and stored in `uploads/syllabus/`

### File Storage:

- **Directory**: `backend/uploads/syllabus/`
- **Naming**: `syllabus_{courseId}_{timestamp}.pdf`
- **Database Field**: `courses.syllabusPath`

### Security:

- ✅ Faculty access verification
- ✅ PDF-only file type restriction
- ✅ 10MB file size limit
- ✅ Old syllabus auto-deletion on re-upload

### Notes:

- **No changes** to existing QP generation functionality
- Syllabus upload is **optional**
- Each course can have **one syllabus** (re-upload replaces old one)
- Files are accessible via `/uploads/syllabus/{filename}`
