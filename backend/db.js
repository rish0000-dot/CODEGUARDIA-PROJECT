/**
 * CodeGuardian AI Database Abstraction Layer
 * This simulates a database connection but is ready for Supabase/Postgres integration.
 */

// In-memory store for demo (to be replaced by real DB calls)
let users = [];
let sessions = [];
let verificationTokens = [];
let resetTokens = [];
let auditLogs = [];
let rateLimits = new Map(); // ip -> { count, lastAttempt, lockedUntil }
let adminConfigs = [{ admin_email: process.env.ADMIN_EMAIL || 'admin@codeguardian.ai', super_admin: true }];

const db = {
    users: {
        find: async (email) => users.find(u => u.email === email),
        findById: async (id) => users.find(u => u.id === id),
        create: async (userData) => {
            const newUser = { id: `u_${Date.now()}`, ...userData, created_at: new Date().toISOString() };
            users.push(newUser);
            return newUser;
        },
        update: async (id, data) => {
            const idx = users.findIndex(u => u.id === id);
            if (idx === -1) return null;
            users[idx] = { ...users[idx], ...data, updated_at: new Date().toISOString() };
            return users[idx];
        },
        list: async () => users,
        delete: async (id) => {
            const idx = users.findIndex(u => u.id === id);
            if (idx === -1) return false;
            users.splice(idx, 1);
            return true;
        }
    },
    sessions: {
        create: async (sessionData) => {
            const newSession = { id: `s_${Date.now()}`, ...sessionData, created_at: new Date().toISOString() };
            sessions.push(newSession);
            return newSession;
        },
        find: async (token) => sessions.find(s => s.token === token)
    },
    tokens: {
        createVerification: async (tokenData) => {
            verificationTokens.push({ ...tokenData, id: `v_${Date.now()}` });
        },
        findVerification: async (token) => verificationTokens.find(t => t.token === token),
        consumeVerification: async (token) => {
            const t = verificationTokens.find(vt => vt.token === token);
            if (t) t.used = true;
        },
        createReset: async (tokenData) => {
            resetTokens.push({ ...tokenData, id: `r_${Date.now()}` });
        },
        findReset: async (token) => resetTokens.find(t => t.token === token),
        consumeReset: async (token) => {
            const t = resetTokens.find(rt => rt.token === token);
            if (t) t.used = true;
        }
    },
    audit: {
        log: async (event) => {
            const entry = {
                id: `a_${Date.now()}`,
                timestamp: new Date().toISOString(),
                ip: event.ip || 'unknown',
                userAgent: event.userAgent || 'unknown',
                ...event
            };
            auditLogs.push(entry);
        },
        list: async () => auditLogs
    },
    rateLimit: {
        get: async (ip) => rateLimits.get(ip) || { count: 0, lastAttempt: null, lockedUntil: null },
        set: async (ip, data) => rateLimits.set(ip, data),
        reset: async (ip) => rateLimits.delete(ip)
    },
    config: {
        isAdmin: (email) => adminConfigs.some(c => c.admin_email === email)
    }
};

// Seed initial admin
const seed = async () => {
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash('password123', 10);
    users.push({
        id: 'u1',
        email: 'admin@codeguardian.ai',
        password_hash: hash,
        name: 'Super Admin',
        role: 'admin',
        email_verified: true,
        mfa_enabled: false,
        failed_login_attempts: 0,
        locked_until: null,
        created_at: new Date().toISOString()
    });
};
seed();

module.exports = db;
