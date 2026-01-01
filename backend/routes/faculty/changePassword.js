/**
 * Change Password Routes (Faculty)
 */

const express = require('express');
const router = express.Router();
const { isAuthenticated, isFaculty, hashPassword, comparePassword } = require('../../middleware/auth');
const { User } = require('../../models');
const { validatePasswordStrength } = require('../../utils/passwordGenerator');

router.post('/', isAuthenticated, isFaculty, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Both current and new passwords are required' });
        }

        // Validate new password strength
        const validation = validatePasswordStrength(newPassword);
        if (!validation.isValid) {
            return res.status(400).json({ success: false, message: validation.message });
        }

        // Get user
        const user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // Verify current password
        const isValid = await comparePassword(currentPassword, user.password);
        if (!isValid) {
            return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }

        // Hash and update new password
        const hashedPassword = await hashPassword(newPassword);
        await user.update({ password: hashedPassword });

        res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to change password', error: error.message });
    }
});

module.exports = router;
