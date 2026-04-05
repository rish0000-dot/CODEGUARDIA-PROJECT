const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { sendEmail, templates } = require('../services/emailService');
const { authenticateToken } = require('../middleware/auth');
const { rateLimiter } = require('../middleware/security');

const loginLimiter = rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: 'Too many login attempts from this IP, please try again after 15 minutes'
});

const JWT_SECRET = process.env.JWT_SECRET || 'codeguardian-enterprise-2026-supersecret';

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
    try {
        const { email, password, name, role = 'user' } = req.body;

        // 1. Check for duplicate email
        const existingUser = await db.users.find(email);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'Account already exists',
                redirect: '/auth/login'
            });
        }

        // 2. Hash password
        const password_hash = await bcrypt.hash(password, 10);

        // 3. Create user
        const user = await db.users.create({
            email,
            password_hash,
            name,
            role: db.config.isAdmin(email) ? 'admin' : role,
            email_verified: false
        });

        // 4. Generate verification token
        const verificationToken = Math.random().toString(36).substr(2, 12);
        await db.tokens.createVerification({
            user_id: user.id,
            token: verificationToken,
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        });

        // 5. Send verification email
        await sendEmail(email, 'Verify Your Email - CodeGuardian AI', templates.verification(verificationToken));

        // 6. Log event
        await db.audit.log({ user: email, action: 'USER_SIGNUP', details: 'User registered successfully' });

        res.status(201).json({
            success: true,
            message: 'Account created! Please check your email to verify.',
            user: { email: user.email, role: user.role }
        });
    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ error: 'Server error during signup' });
    }
});

// POST /api/auth/login
router.post('/login', loginLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await db.users.find(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Check if account is locked
        if (user.locked_until && new Date() < new Date(user.locked_until)) {
            const waitTime = Math.ceil((new Date(user.locked_until).getTime() - Date.now()) / 60000);
            return res.status(403).json({
                error: 'Account Locked',
                message: `This account has been locked due to too many failed attempts. Try again in ${waitTime} minutes.`
            });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            const attempts = (user.failed_login_attempts || 0) + 1;
            let updateData = { failed_login_attempts: attempts };

            if (attempts >= 5) {
                updateData.locked_until = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 min lock

                // Send Lockout Email
                await sendEmail(email, 'Account Locked - CodeGuardian AI', templates.accountLockout(email, updateData.locked_until));

                await db.audit.log({
                    user: email,
                    action: 'ACCOUNT_LOCKED',
                    details: 'Account locked after 5 failed attempts',
                    ip: req.ip,
                    userAgent: req.headers['user-agent']
                });
            }

            await db.users.update(user.id, updateData);
            await db.audit.log({
                user: email,
                action: 'LOGIN_FAILED',
                details: `Invalid password attempt (${attempts}/5)`,
                ip: req.ip,
                userAgent: req.headers['user-agent']
            });

            return res.status(401).json({ error: 'Invalid email or password', attemptsRemaining: 5 - attempts });
        }

        // Reset failed attempts on successful login
        await db.users.update(user.id, { failed_login_attempts: 0, locked_until: null, last_login_at: new Date().toISOString() });

        if (!user.email_verified) {
            return res.status(403).json({
                error: 'Email not verified',
                message: 'Please verify your email before logging in.'
            });
        }

        if (user.mfa_enabled) {
            // Generate temporary MFA token
            const mfaToken = jwt.sign({ id: user.id, type: 'mfa_challenge' }, JWT_SECRET, { expiresIn: '10m' });
            return res.json({
                success: true,
                requiresMFA: true,
                mfaToken,
                message: 'MFA verification required'
            });
        }

        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

        await db.audit.log({ user: email, action: 'LOGIN_SUCCESS', details: 'User logged in' });

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                mfaEnabled: user.mfa_enabled,
                avatar: user.name.charAt(0).toUpperCase()
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error during login' });
    }
});

// --- MFA ROUTES ---

// POST /api/auth/mfa/setup
router.post('/mfa/setup', authenticateToken, async (req, res) => {
    try {
        const speakeasy = require('speakeasy');
        const QRCode = require('qrcode');

        const secret = speakeasy.generateSecret({ name: `CodeGuardian:${req.user.email}` });
        const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

        // Store temporary secret for verification
        await db.users.update(req.user.id, { temp_mfa_secret: secret.base32 });

        res.json({
            success: true,
            secret: secret.base32,
            qrCode: qrCodeUrl
        });
    } catch (err) {
        res.status(500).json({ error: 'MFA setup failed' });
    }
});

// POST /api/auth/mfa/verify
router.post('/mfa/verify', authenticateToken, async (req, res) => {
    try {
        const { code } = req.body;
        const speakeasy = require('speakeasy');

        const user = await db.users.findById(req.user.id);
        const secret = user.temp_mfa_secret;

        const verified = speakeasy.totp.verify({
            secret: secret,
            encoding: 'base32',
            token: code
        });

        if (verified) {
            await db.users.update(user.id, {
                mfa_enabled: true,
                mfa_secret: secret,
                temp_mfa_secret: null
            });
            await db.audit.log({ user: user.email, action: 'MFA_ENABLED', details: 'Authenticator MFA enabled' });
            res.json({ success: true, message: 'MFA enabled successfully' });
        } else {
            res.status(400).json({ error: 'Invalid verification code' });
        }
    } catch (err) {
        res.status(500).json({ error: 'MFA verification failed' });
    }
});

// POST /api/auth/mfa/verify-login
router.post('/mfa/verify-login', async (req, res) => {
    try {
        const { mfaToken, code } = req.body;
        const speakeasy = require('speakeasy');

        const decoded = jwt.verify(mfaToken, JWT_SECRET);
        if (decoded.type !== 'mfa_challenge') throw new Error('Invalid token type');

        const user = await db.users.findById(decoded.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const verified = speakeasy.totp.verify({
            secret: user.mfa_secret,
            encoding: 'base32',
            token: code
        });

        if (verified) {
            const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
            await db.audit.log({ user: user.email, action: 'LOGIN_MFA_SUCCESS', details: 'Successful MFA login' });
            res.json({
                success: true,
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    mfaEnabled: true,
                    avatar: user.name.charAt(0).toUpperCase()
                }
            });
        } else {
            res.status(401).json({ error: 'Invalid MFA code' });
        }
    } catch (err) {
        res.status(401).json({ error: 'Verification expired or invalid' });
    }
});

// POST /api/auth/verify-email
router.post('/verify-email', async (req, res) => {
    const { token } = req.body;
    const tv = await db.tokens.findVerification(token);

    if (!tv || tv.used || new Date() > tv.expires_at) {
        return res.status(400).json({ error: 'Invalid or expired token' });
    }

    await db.users.update(tv.user_id, { email_verified: true, email_verified_at: new Date().toISOString() });
    await db.tokens.consumeVerification(token);

    res.json({ success: true, message: 'Email verified successfully! You can now login.' });
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await db.users.find(email);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const resetToken = Math.random().toString(36).substr(2, 12);
        await db.tokens.createReset({
            user_id: user.id,
            token: resetToken,
            expires_at: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
        });

        await sendEmail(email, 'Reset Your Password - CodeGuardian AI', templates.passwordReset(resetToken));
        await db.audit.log({ user: email, action: 'PASSWORD_RESET_REQUESTED', details: 'Reset link sent' });

        res.json({ success: true, message: 'Password reset link sent to your email.' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to process request' });
    }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const rt = await db.tokens.findReset(token);

        if (!rt || rt.used || new Date() > rt.expires_at) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }

        const password_hash = await bcrypt.hash(newPassword, 10);
        await db.users.update(rt.user_id, { password_hash });
        await db.tokens.consumeReset(token);

        const user = await db.users.findById(rt.user_id);
        await db.audit.log({ user: user.email, action: 'PASSWORD_RESET_SUCCESS', details: 'Password changed successfully' });

        res.json({ success: true, message: 'Password reset successful! You can now login with your new password.' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to reset password' });
    }
});

module.exports = router;
