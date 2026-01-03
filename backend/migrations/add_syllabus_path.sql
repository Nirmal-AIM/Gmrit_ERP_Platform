-- SQL Migration: Add syllabusPath column to courses table
-- Run this in your MySQL database

USE academic_erp;

ALTER TABLE courses 
ADD COLUMN syllabusPath VARCHAR(500) NULL 
COMMENT 'Path to uploaded syllabus PDF file'
AFTER description;

-- Verify the column was added
DESCRIBE courses;
