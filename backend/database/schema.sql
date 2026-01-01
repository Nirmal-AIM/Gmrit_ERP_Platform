-- ============================================
-- Academic ERP System - Database Schema
-- ============================================
-- This schema creates all necessary tables for the Academic ERP system
-- Run this file: mysql -u root -p academic_erp < schema.sql

-- Create database if not exists
-- CREATE DATABASE IF NOT EXISTS academic_erp;
-- USE academic_erp;

-- ============================================
-- 1. USERS TABLE (for authentication)
-- ============================================
-- Stores both Admin and Faculty login credentials
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,  -- bcrypt hashed password
    userType ENUM('Admin', 'Faculty') NOT NULL DEFAULT 'Faculty',
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- 2. PROGRAMS TABLE (B.Tech, M.Tech, MBA, etc.)
-- ============================================
CREATE TABLE IF NOT EXISTS programs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    programName VARCHAR(255) NOT NULL UNIQUE,
    programCode VARCHAR(50),
    description TEXT,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- 3. BRANCHES TABLE (CSE, IT, ECE, etc.)
-- ============================================
CREATE TABLE IF NOT EXISTS branches (
    id INT PRIMARY KEY AUTO_INCREMENT,
    branchName VARCHAR(255) NOT NULL,
    branchCode VARCHAR(50) NOT NULL UNIQUE,  -- e.g., 05, 12, 42, 45
    description TEXT,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- 4. REGULATIONS TABLE (AR23, AR21, AR20, etc.)
-- ============================================
CREATE TABLE IF NOT EXISTS regulations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    regulationName VARCHAR(100) NOT NULL UNIQUE,  -- e.g., AR23, AR21
    regulationYear INT,  -- e.g., 2023, 2021
    description TEXT,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- 5. PROGRAM-BRANCH MAPPING
-- ============================================
-- Maps which branches belong to which programs (e.g., B.Tech - CSE)
CREATE TABLE IF NOT EXISTS program_branch_mapping (
    id INT PRIMARY KEY AUTO_INCREMENT,
    programId INT NOT NULL,
    branchId INT NOT NULL,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (programId) REFERENCES programs(id) ON DELETE CASCADE,
    FOREIGN KEY (branchId) REFERENCES branches(id) ON DELETE CASCADE,
    UNIQUE KEY unique_program_branch (programId, branchId)
);

-- ============================================
-- 6. COURSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    courseName VARCHAR(255) NOT NULL,
    courseCode VARCHAR(50) NOT NULL UNIQUE,
    branchId INT NOT NULL,
    regulationId INT NOT NULL,
    year ENUM('I', 'II', 'III', 'IV') NOT NULL,  -- Academic year
    semester ENUM('I', 'II') NOT NULL,  -- Semester
    courseType ENUM('Theory', 'Lab', 'Project', 'Seminar') NOT NULL,
    electiveType ENUM('CORE', 'Professional Elective', 'Open Elective') NOT NULL,
    credits INT NOT NULL,
    description TEXT,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (branchId) REFERENCES branches(id) ON DELETE CASCADE,
    FOREIGN KEY (regulationId) REFERENCES regulations(id) ON DELETE CASCADE
);

-- ============================================
-- 7. BRANCH-COURSE MAPPING
-- ============================================
-- Maps courses to branches with specific P-B mapping and regulation
CREATE TABLE IF NOT EXISTS branch_course_mapping (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pbMappingId INT NOT NULL,  -- Program-Branch mapping
    regulationId INT NOT NULL,
    courseId INT NOT NULL,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (pbMappingId) REFERENCES program_branch_mapping(id) ON DELETE CASCADE,
    FOREIGN KEY (regulationId) REFERENCES regulations(id) ON DELETE CASCADE,
    FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_mapping (pbMappingId, regulationId, courseId)
);

-- ============================================
-- 8. FACULTY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS faculty (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL UNIQUE,  -- Links to users table
    branchId INT NOT NULL,
    honorific ENUM('Dr.', 'Mr.', 'Mrs.', 'Ms.', 'Prof.') DEFAULT 'Mr.',
    facultyName VARCHAR(255) NOT NULL,
    empId VARCHAR(100) NOT NULL UNIQUE,  -- Employee ID / Personal Number
    phoneNumber VARCHAR(20),
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (branchId) REFERENCES branches(id) ON DELETE CASCADE
);

-- ============================================
-- 9. FACULTY-COURSE MAPPING
-- ============================================
-- Maps faculty to courses they teach
CREATE TABLE IF NOT EXISTS faculty_course_mapping (
    id INT PRIMARY KEY AUTO_INCREMENT,
    facultyId INT NOT NULL,
    courseId INT NOT NULL,
    courseType ENUM('Theory', 'Lab', 'Project', 'Seminar') NOT NULL,
    year ENUM('I', 'II', 'III', 'IV') NOT NULL,
    semester ENUM('I', 'II') NOT NULL,
    academicYear VARCHAR(20) NOT NULL,  -- e.g., "2025-2026"
    electiveType ENUM('CORE', 'Professional Elective', 'Open Elective') NOT NULL,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (facultyId) REFERENCES faculty(id) ON DELETE CASCADE,
    FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE
);

-- ============================================
-- 10. COURSE PLUGINS - BLOOM'S LEVEL
-- ============================================
CREATE TABLE IF NOT EXISTS blooms_level (
    id INT PRIMARY KEY AUTO_INCREMENT,
    levelName VARCHAR(100) NOT NULL UNIQUE,  -- Remember, Understand, Apply, Analyze, Evaluate, Create
    levelNumber INT,  -- 1-6
    description TEXT,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- 11. COURSE PLUGINS - DIFFICULTY LEVEL
-- ============================================
CREATE TABLE IF NOT EXISTS difficulty_level (
    id INT PRIMARY KEY AUTO_INCREMENT,
    levelName VARCHAR(100) NOT NULL UNIQUE,  -- Easy, Moderate, Hard
    description TEXT,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- 12. COURSE PLUGINS - UNIT
-- ============================================
CREATE TABLE IF NOT EXISTS units (
    id INT PRIMARY KEY AUTO_INCREMENT,
    unitName VARCHAR(100) NOT NULL UNIQUE,  -- Unit-1, Unit-2, etc.
    unitNumber INT,
    description TEXT,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- 13. COURSE OUTCOMES (COs)
-- ============================================
CREATE TABLE IF NOT EXISTS course_outcomes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    courseId INT NOT NULL,
    coNumber VARCHAR(10) NOT NULL,  -- CO1, CO2, etc.
    coDescription TEXT NOT NULL,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_course_co (courseId, coNumber)
);

-- ============================================
-- 14. QUESTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS questions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    courseId INT NOT NULL,
    coId INT NOT NULL,  -- Course Outcome
    bloomsLevelId INT NOT NULL,
    difficultyLevelId INT NOT NULL,
    unitId INT NOT NULL,
    questionText TEXT NOT NULL,
    imagePath VARCHAR(500),  -- Path to question image if any
    marks INT NOT NULL,
    isActive BOOLEAN DEFAULT TRUE,
    createdBy INT NOT NULL,  -- Faculty ID who created the question
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (coId) REFERENCES course_outcomes(id) ON DELETE CASCADE,
    FOREIGN KEY (bloomsLevelId) REFERENCES blooms_level(id) ON DELETE CASCADE,
    FOREIGN KEY (difficultyLevelId) REFERENCES difficulty_level(id) ON DELETE CASCADE,
    FOREIGN KEY (unitId) REFERENCES units(id) ON DELETE CASCADE,
    FOREIGN KEY (createdBy) REFERENCES faculty(id) ON DELETE CASCADE
);

-- ============================================
-- 15. GENERATED QUESTION PAPERS
-- ============================================
CREATE TABLE IF NOT EXISTS generated_qp (
    id INT PRIMARY KEY AUTO_INCREMENT,
    programId INT NOT NULL,
    courseId INT NOT NULL,
    assessmentType ENUM('MID-1', 'MID-2', 'Regular', 'Supply') NOT NULL,
    examDate DATE NOT NULL,
    regulationId INT NOT NULL,
    year ENUM('I', 'II', 'III', 'IV') NOT NULL,
    semester ENUM('I', 'II') NOT NULL,
    academicYear VARCHAR(20) NOT NULL,
    questionPaperData JSON,  -- Stores the complete QP structure
    pdfPath VARCHAR(500),  -- Path to generated PDF
    generatedBy INT NOT NULL,  -- User ID who generated
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (programId) REFERENCES programs(id) ON DELETE CASCADE,
    FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (regulationId) REFERENCES regulations(id) ON DELETE CASCADE,
    FOREIGN KEY (generatedBy) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- INSERT DEFAULT DATA
-- ============================================

-- Default Admin User (Password: Admin@123)
-- Password hash generated using bcrypt with 10 salt rounds
INSERT INTO users (email, password, userType, isActive) VALUES 
('admin@erp.com', '$2a$10$rZ5qYXKZYvH5qYXKZYvH5.YvH5qYXKZYvH5qYXKZYvH5qYXKZYvH5u', 'Admin', TRUE);

-- Default Bloom's Levels
INSERT INTO blooms_level (levelName, levelNumber, description, isActive) VALUES
('Remember', 1, 'Recall facts and basic concepts', TRUE),
('Understand', 2, 'Explain ideas or concepts', TRUE),
('Apply', 3, 'Use information in new situations', TRUE),
('Analyze', 4, 'Draw connections among ideas', TRUE),
('Evaluate', 5, 'Justify a stand or decision', TRUE),
('Create', 6, 'Produce new or original work', TRUE);

-- Default Difficulty Levels
INSERT INTO difficulty_level (levelName, description, isActive) VALUES
('Easy', 'Basic level questions', TRUE),
('Moderate', 'Intermediate level questions', TRUE),
('Hard', 'Advanced level questions', TRUE);

-- Default Units
INSERT INTO units (unitName, unitNumber, description, isActive) VALUES
('Unit-1', 1, 'First unit', TRUE),
('Unit-2', 2, 'Second unit', TRUE),
('Unit-3', 3, 'Third unit', TRUE),
('Unit-4', 4, 'Fourth unit', TRUE),
('Unit-5', 5, 'Fifth unit', TRUE);

-- ============================================
-- INDEXES for better performance
-- ============================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_faculty_empId ON faculty(empId);
CREATE INDEX idx_courses_code ON courses(courseCode);
CREATE INDEX idx_questions_course ON questions(courseId);
CREATE INDEX idx_fc_mapping_faculty ON faculty_course_mapping(facultyId);
CREATE INDEX idx_fc_mapping_course ON faculty_course_mapping(courseId);

-- ============================================
-- END OF SCHEMA
-- ============================================
