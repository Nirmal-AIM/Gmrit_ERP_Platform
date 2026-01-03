/**
 * Database Migration Script
 * Adds syllabusPath column to courses table
 */

require('dotenv').config();
const { sequelize } = require('../models');

async function runMigration() {
    try {
        console.log('🔄 Starting database migration...');

        // Add syllabusPath column to courses table
        await sequelize.query(`
            ALTER TABLE courses 
            ADD COLUMN IF NOT EXISTS syllabusPath VARCHAR(500) NULL 
            COMMENT 'Path to uploaded syllabus PDF file'
            AFTER description
        `);

        console.log('✅ Migration completed successfully!');
        console.log('✅ Added syllabusPath column to courses table');

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
}

runMigration();
