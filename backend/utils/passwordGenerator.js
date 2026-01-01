/**
 * Password Generator Utility
 * 
 * Generates secure random passwords for faculty accounts
 * Password format: Uppercase + Lowercase + Numbers + Special characters
 */

/**
 * Generate a secure random password
 * 
 * @param {number} length - Length of the password (default: 12)
 * @returns {string} Generated password
 */
const generatePassword = (length = 12) => {
    // Character sets for password generation
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const specialChars = '@#$%&*!';

    // Combine all character sets
    const allChars = uppercase + lowercase + numbers + specialChars;

    let password = '';

    // Ensure password has at least one character from each set
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += specialChars[Math.floor(Math.random() * specialChars.length)];

    // Fill the rest of the password with random characters
    for (let i = password.length; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password to avoid predictable patterns
    password = shuffleString(password);

    return password;
};

/**
 * Shuffle a string randomly
 * 
 * @param {string} str - String to shuffle
 * @returns {string} Shuffled string
 */
const shuffleString = (str) => {
    const arr = str.split('');

    // Fisher-Yates shuffle algorithm
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    return arr.join('');
};

/**
 * Validate password strength
 * 
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with isValid and message
 */
const validatePasswordStrength = (password) => {
    const minLength = 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[@#$%&*!]/.test(password);

    if (password.length < minLength) {
        return {
            isValid: false,
            message: `Password must be at least ${minLength} characters long`
        };
    }

    if (!hasUppercase) {
        return {
            isValid: false,
            message: 'Password must contain at least one uppercase letter'
        };
    }

    if (!hasLowercase) {
        return {
            isValid: false,
            message: 'Password must contain at least one lowercase letter'
        };
    }

    if (!hasNumber) {
        return {
            isValid: false,
            message: 'Password must contain at least one number'
        };
    }

    if (!hasSpecialChar) {
        return {
            isValid: false,
            message: 'Password must contain at least one special character (@#$%&*!)'
        };
    }

    return {
        isValid: true,
        message: 'Password is strong'
    };
};

module.exports = {
    generatePassword,
    validatePasswordStrength
};

// Example usage (for testing):
if (require.main === module) {
    const password = generatePassword(12);
    console.log('Generated Password:', password);
    console.log('Validation:', validatePasswordStrength(password));
}
