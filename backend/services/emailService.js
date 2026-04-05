const { Resend } = require('resend');

// Initialize Resend with API key from environment
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

/**
 * Real Email Service for CodeGuardian AI
 * Falls back to mock console logs if no API key is provided.
 */
const sendEmail = async (to, subject, html) => {
    console.log(`📧 [Email Service] Outgoing to: ${to} | Subject: ${subject}`);

    if (resend) {
        try {
            const { data, error } = await resend.emails.send({
                from: 'CodeGuardian AI <security@codeguardian.ai>',
                to,
                subject,
                html,
            });

            if (error) {
                console.error('❌ [Email Service] Resend Error:', error);
                return false;
            }
            console.log('✅ [Email Service] Email sent successfully via Resend');
            return true;
        } catch (err) {
            console.error('❌ [Email Service] Failed to send email:', err);
            return false;
        }
    }

    // Simulation fallback
    console.log(`📧 [MOCK MODE] Content: ${html}`);
    return true;
};

const templates = {
    verification: (token) => `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #3b82f6;">Verify Your Email - CodeGuardian AI</h2>
            <p>Welcome! Please verify your email to activate your account and start secure scanning.</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3010'}/auth/verify?token=${token}" 
                   style="padding: 12px 24px; background: #3b82f6; color: white; border-radius: 8px; text-decoration: none; font-weight: bold;">
                    Verify Email Address
                </a>
            </div>
            <p style="color: #666; font-size: 0.9em;">This link expires in 24 hours. If you didn't create an account, please ignore this email.</p>
        </div>
    `,
    passwordReset: (token) => `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #ef4444;">Password Reset Request - CodeGuardian AI</h2>
            <p>We received a request to reset your password. Click the button below to proceed:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3010'}/auth/reset-password?token=${token}" 
                   style="padding: 12px 24px; background: #ef4444; color: white; border-radius: 8px; text-decoration: none; font-weight: bold;">
                    Reset Password
                </a>
            </div>
            <p style="color: #666; font-size: 0.9em;">This link expires in 1 hour. If you didn't request this, your account is still secure.</p>
        </div>
    `,
    accountLockout: (email, unlockTime) => `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #f59e0b;">Account Locked - CodeGuardian AI</h2>
            <p>Hello,</p>
            <p>Your account (<strong>${email}</strong>) has been temporarily locked due to 5 consecutive failed login attempts.</p>
            <p>For security reasons, your account will remain locked for 30 minutes. You can try logging in again after <strong>${new Date(unlockTime).toLocaleTimeString()}</strong>.</p>
            <p style="color: #666; font-size: 0.9em;">If this wasn't you, we recommend resetting your password immediately after the lockout period ends.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <small>Protected by CodeGuardian AI Security Core</small>
        </div>
    `,
    adminNotification: (user) => `
        <div style="font-family: sans-serif; max-width: 600px; padding: 20px;">
            <h3>New User Registered</h3>
            <p>A new account has been created on CodeGuardian AI:</p>
            <ul>
                <li><strong>Email:</strong> ${user.email}</li>
                <li><strong>Role:</strong> ${user.role}</li>
                <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
            </ul>
            <p>Access the <a href="${process.env.FRONTEND_URL || 'http://localhost:3010'}/admin">Admin Panel</a> to manage this user.</p>
        </div>
    `
};

module.exports = { sendEmail, templates };
