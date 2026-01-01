/**
 * Academic Year Utility Functions
 * 
 * This file contains functions to calculate and format academic years
 * Based on June-May cycle (e.g., June 2025 - May 2026 = AY 2025-2026)
 */

/**
 * Get current academic year based on the date
 * Logic: If current month is June or later, AY starts from current year
 *        If current month is before June, AY started from previous year
 * 
 * @returns {string} Academic year in format "YYYY-YYYY" (e.g., "2025-2026")
 */
const getCurrentAcademicYear = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // getMonth() returns 0-11, so add 1

    // Academic year starts in June (month 6)
    let startYear, endYear;

    if (currentMonth >= 6) {
        // June onwards: Current year is the start year
        startYear = currentYear;
        endYear = currentYear + 1;
    } else {
        // Before June: Previous year is the start year
        startYear = currentYear - 1;
        endYear = currentYear;
    }

    return `${startYear}-${endYear}`;
};

/**
 * Get academic year for a specific date
 * 
 * @param {Date} date - The date to calculate academic year for
 * @returns {string} Academic year in format "YYYY-YYYY"
 */
const getAcademicYearForDate = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    let startYear, endYear;

    if (month >= 6) {
        startYear = year;
        endYear = year + 1;
    } else {
        startYear = year - 1;
        endYear = year;
    }

    return `${startYear}-${endYear}`;
};

/**
 * Get all academic years within a range
 * 
 * @param {number} yearsBack - Number of years to go back
 * @param {number} yearsForward - Number of years to go forward
 * @returns {Array<string>} Array of academic years
 */
const getAcademicYearRange = (yearsBack = 5, yearsForward = 2) => {
    const currentAY = getCurrentAcademicYear();
    const [currentStartYear] = currentAY.split('-').map(Number);

    const academicYears = [];

    for (let i = -yearsBack; i <= yearsForward; i++) {
        const startYear = currentStartYear + i;
        const endYear = startYear + 1;
        academicYears.push(`${startYear}-${endYear}`);
    }

    return academicYears;
};

/**
 * Check if a given academic year is valid
 * 
 * @param {string} academicYear - Academic year string (e.g., "2025-2026")
 * @returns {boolean} True if valid, false otherwise
 */
const isValidAcademicYear = (academicYear) => {
    if (!academicYear || typeof academicYear !== 'string') {
        return false;
    }

    const parts = academicYear.split('-');
    if (parts.length !== 2) {
        return false;
    }

    const [startYear, endYear] = parts.map(Number);

    // Check if both are valid numbers
    if (isNaN(startYear) || isNaN(endYear)) {
        return false;
    }

    // Check if end year is exactly one more than start year
    if (endYear !== startYear + 1) {
        return false;
    }

    // Check if years are in reasonable range (e.g., 2000-2100)
    if (startYear < 2000 || startYear > 2100) {
        return false;
    }

    return true;
};

/**
 * Get semester based on current month
 * 
 * @returns {string} "I" or "II"
 */
const getCurrentSemester = () => {
    const currentMonth = new Date().getMonth() + 1;

    // June to November: Odd semester (I)
    // December to May: Even semester (II)
    if (currentMonth >= 6 && currentMonth <= 11) {
        return 'I';
    } else {
        return 'II';
    }
};

// Export all functions
module.exports = {
    getCurrentAcademicYear,
    getAcademicYearForDate,
    getAcademicYearRange,
    isValidAcademicYear,
    getCurrentSemester
};

// Example usage (for testing):
if (require.main === module) {
    console.log('Current Academic Year:', getCurrentAcademicYear());
    console.log('Current Semester:', getCurrentSemester());
    console.log('Academic Year Range:', getAcademicYearRange(3, 1));
    console.log('Is "2025-2026" valid?', isValidAcademicYear('2025-2026'));
    console.log('Is "2025-2027" valid?', isValidAcademicYear('2025-2027'));
}
