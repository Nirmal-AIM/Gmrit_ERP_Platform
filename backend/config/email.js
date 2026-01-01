/**
 * Email Configuration
 * 
 * This file configures Nodemailer for sending emails
 * Used for sending auto-generated passwords to faculty members
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,     // Your email address
        pass: process.env.EMAIL_PASSWORD  // Your email password or app-specific password
    },
    tls: {
        rejectUnauthorized: false // For development only
    }
});

/**
 * Send email function
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text body
 * @param {string} options.html - HTML body
 * @returns {Promise} - Promise resolving to email info
 */
const sendEmail = async (options) => {
    try {
        const mailOptions = {
            from: `"Academic ERP System" <${process.env.EMAIL_USER}>`,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully:', info.messageId);
        return info;
    } catch (error) {
        console.error('❌ Error sending email:', error.message);
        throw error;
    }
};

/**
 * Send faculty credentials email
 * @param {string} email - Faculty email address
 * @param {string} password - Auto-generated password
 * @param {string} facultyName - Faculty name
 */
const sendFacultyCredentials = async (email, password, facultyName) => {
    const subject = 'Your Academic ERP System Credentials';

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .credentials { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; }
        .credential-item { margin: 10px 0; }
        .credential-label { font-weight: bold; color: #667eea; }
        .credential-value { font-family: monospace; background: #f0f0f0; padding: 5px 10px; border-radius: 4px; display: inline-block; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Academic ERP System</h1>
        </div>
        <div class="content">
          <p>Dear <strong>${facultyName}</strong>,</p>
          
          <p>Your account has been successfully created in the Academic ERP System. Below are your login credentials:</p>
          
          <div class="credentials">
            <div class="credential-item">
              <span class="credential-label">Email:</span><br>
              <span class="credential-value">${email}</span>
            </div>
            <div class="credential-item">
              <span class="credential-label">Password:</span><br>
              <span class="credential-value">${password}</span>
            </div>
          </div>
          
          <div class="warning">
            <strong>⚠️ Important Security Notice:</strong><br>
            Please change your password immediately after your first login for security purposes.
          </div>
          
          <p><strong>Next Steps:</strong></p>
          <ol>
            <li>Visit the ERP portal login page</li>
            <li>Enter your email and the password provided above</li>
            <li>Navigate to "Change Password" in your profile</li>
            <li>Set a strong, unique password</li>
          </ol>
          
          <p>If you have any questions or face any issues, please contact the IT department.</p>
          
          <p>Best regards,<br>
          <strong>Academic ERP System</strong></p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply to this message.</p>
        </div>
      </div>
    </body>
    </html>
  `;

    const text = `
    Dear ${facultyName},
    
    Your account has been successfully created in the Academic ERP System.
    
    Login Credentials:
    Email: ${email}
    Password: ${password}
    
    IMPORTANT: Please change your password immediately after your first login.
    
    Best regards,
    Academic ERP System
  `;

    return sendEmail({ to: email, subject, html, text });
};

// Verify email configuration on startup
const verifyEmailConfig = async () => {
    try {
        await transporter.verify();
        console.log('✅ Email server is ready to send messages');
    } catch (error) {
        console.warn('⚠️  Email server configuration issue:', error.message);
        console.warn('   Emails will not be sent. Please check your .env file.');
    }
};

module.exports = {
    transporter,
    sendEmail,
    sendFacultyCredentials,
    verifyEmailConfig
};
