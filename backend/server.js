require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const http = require('http');
const socketIO = require('./socket');

const app = express();
const server = http.createServer(app);
const io = socketIO.init(server);

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'codeguardian-enterprise-2026-supersecret';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001', 'http://127.0.0.1:3001', 'http://localhost:3005', 'http://127.0.0.1:3005', 'http://localhost:3008', 'http://127.0.0.1:3008', 'http://localhost:3010', 'http://127.0.0.1:3010'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Request logging for debugging
app.use((req, res, next) => {
    console.log(`📡 [${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

// Hardening: Prevent silent exits
process.on('uncaughtException', (err) => {
    console.error('💥 CRITICAL ERROR (Uncaught Exception):', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 CRITICAL ERROR (Unhandled Rejection) at:', promise, 'reason:', reason);
});

// Heartbeat to ensure the event loop stays alive in concurrently
setInterval(() => {
    // Silent heartbeat for logs
    if (process.env.DEBUG_HEARTBEAT) console.log('💓 Backend heartbeat...');
}, 60000);

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Backend is connected', timestamp: new Date().toISOString() });
});

// In-memory Database & Services
const db = require('./db');
const { authenticateToken, checkRole } = require('./middleware/auth');
const authRoutes = require('./routes/auth');

// In-memory Shared Reports
const sharedReports = new Map();

// Using real DB abstraction for Issues... (to be refactored)
let allIssues = [];
const DEFAULT_ISSUES = [
    { id: '1', file_path: 'src/components/Login.jsx', line_start: 42, category: '🚨 XSS Vulnerability', severity: 'HIGH', confidence: 92, suggestion: 'npm install dompurify\n```jsx\nconst cleanInput = DOMPurify.sanitize(userInput);\n<div>{cleanInput}</div>\n```', assigned_to: null, status: 'open' },
    { id: '2', file_path: 'src/utils/database.js', line_start: 18, category: '💀 SQL Injection', severity: 'CRITICAL', confidence: 98, suggestion: '```js\n// WRONG: db.query(`SELECT * FROM users WHERE id=${id}`)\n// FIXED: db.query("SELECT * FROM users WHERE id=?", [id])\n```', assigned_to: null, status: 'open' },
    { id: '3', file_path: 'src/hooks/useFetchData.ts', line_start: 33, category: '🐌 Memory Leak', severity: 'MEDIUM', confidence: 85, suggestion: '```tsx\nuseEffect(() => {\n  const controller = new AbortController();\n  return () => controller.abort();\n}, [])\n```', assigned_to: null, status: 'open' },
    { id: '4', file_path: '.env.local', line_start: 5, category: '🚨 OpenAI API Key Leaked', severity: 'CRITICAL', confidence: 99, suggestion: '1. NEXT_PUBLIC_OPENAI_API_KEY regenerate\n2. Add `.env*` to `.gitignore`', assigned_to: null, status: 'open' },
    { id: '5', file_path: 'package.json', line_start: 15, category: '📦 lodash Vulnerable (XSS)', severity: 'HIGH', confidence: 95, suggestion: 'npm install lodash@4.17.21', assigned_to: null, status: 'open' },
    { id: '6', file_path: 'src/config.js', line_start: 8, category: '🔑 AWS Access Key Exposed', severity: 'CRITICAL', confidence: 99, suggestion: '1. AWS IAM → New Access Key\n2. git rm --cached src/config.js', assigned_to: null, status: 'open' }
];
allIssues = [...DEFAULT_ISSUES];

// In-memory Custom Rules
let customRules = [
    { id: 'r1', name: 'No console.log', pattern: 'console\\.log', severity: 'MEDIUM', category: 'Best Practice', description: 'Remove debug logs from production code.' },
    { id: 'r2', name: 'Potential SQLi', pattern: '`SELECT.*\\${.*}`', severity: 'CRITICAL', category: 'Security', description: 'Detects template literal SQL queries which are prone to injection.' }
];

// In-memory Webhooks
let webhooks = [];

// In-memory Report Automation Schedules
const reportSchedules = [];

// Unified Logging System
const logEvent = (action, userEmail, details = '') => {
    db.audit.log({ user: userEmail, action, details });
    console.log(`📡 [AUDIT LOG] ${new Date().toISOString()} - ${userEmail}: ${action} ${details}`);
};

// --- AUTH ROUTES ---
app.use('/api/auth', authRoutes);

// Redundant checkRole removed (using imported one from middleware/auth)

// --- ADMIN ROUTES ---
app.get('/api/admin/users', authenticateToken, checkRole(['admin']), async (req, res) => {
    try {
        const users = await db.users.list();
        res.json({ success: true, users });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

app.post('/api/admin/users', authenticateToken, checkRole(['admin']), async (req, res) => {
    try {
        const { email, password, name, role } = req.body;
        const existingUser = await db.users.find(email);
        if (existingUser) return res.status(400).json({ error: 'User already exists' });

        const password_hash = await bcrypt.hash(password, 10);
        const newUser = await db.users.create({
            email,
            password_hash,
            name,
            role,
            email_verified: true, // Admin-created users are pre-verified
            mfa_enabled: false
        });

        logEvent('USER_CREATED_BY_ADMIN', req.user.email, `Created user: ${email} with role: ${role}`);
        res.status(201).json({ success: true, user: newUser });
    } catch (err) {
        res.status(500).json({ error: 'Failed to create user' });
    }
});

app.delete('/api/admin/users/:id', authenticateToken, checkRole(['admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const success = await db.users.delete(id);
        if (!success) return res.status(404).json({ error: 'User not found' });

        logEvent('USER_DELETED_BY_ADMIN', req.user.email, `Deleted user ID: ${id}`);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

app.post('/api/admin/users/:id/unlock', authenticateToken, checkRole(['admin']), async (req, res) => {
    try {
        const { id } = req.params;
        await db.users.update(id, { failed_login_attempts: 0, locked_until: null });
        const user = await db.users.findById(id);
        logEvent('USER_UNLOCKED_BY_ADMIN', req.user.email, `Unlocked user: ${user ? user.email : id}`);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to unlock user' });
    }
});

app.get('/api/admin/audit-logs', authenticateToken, checkRole(['admin']), async (req, res) => {
    try {
        const logs = await db.audit.list();
        res.json({ success: true, logs: logs.reverse() });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
});

app.get('/api/admin/audit-logs/export', authenticateToken, checkRole(['admin']), async (req, res) => {
    try {
        const logs = await db.audit.list();
        const csv = 'timestamp,user,action,details\n' +
            logs.map(l => `${l.timestamp},${l.user},${l.action},"${l.details}"`).join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=audit-logs.csv');
        res.send(csv);
    } catch (err) {
        res.status(500).json({ error: 'Export failed' });
    }
});

// --- MIGRATED API LOGIC ---

// Webhook Notification Helper
const sendWebhookNotification = async (message) => {
    webhooks.forEach(async (hook) => {
        try {
            // Simplified fetch mock since global fetch is available in Node 18+
            // In a real app, we'd use axios or similar
            console.log(`[Notification] Sending to ${hook.type} (${hook.url}): ${message}`);
            // await fetch(hook.url, { method: 'POST', body: JSON.stringify({ text: message }) });
        } catch (e) {
            console.error(`Failed to send webhook to ${hook.url}`, e);
        }
    });
};

const MASTER_VALIDATOR = (input, scanType) => {
    const REPO_REGEX = /^((https?:\/\/)?(www\.)?(github\.com\/))?[\w.-]+\/[\w.-]+$/;
    const CODE_REGEX = /\b(function|const|let|var|useEffect|useState|fetch|axios|console\.log|import|export|class|async|await|interface|type|return|if|for|while|switch|case|break)\b/;

    const isRepo = REPO_REGEX.test(input);
    const isCode = CODE_REGEX.test(input);

    if (isRepo) return { valid: true, type: 'repo', repoUrl: input };
    if (isCode) {
        const CODE_TABS = ['review', 'pr_automation'];
        if (!CODE_TABS.includes(scanType)) {
            return { valid: false, type: 'invalid', error: `❌ ${scanType.toUpperCase()} requires GitHub repo only (owner/repo)` };
        }
        return { valid: true, type: 'code' };
    }

    const canAcceptCode = scanType === 'review' || scanType === 'pr_automation';
    return {
        valid: false,
        type: 'invalid',
        error: `❌ INVALID INPUT\n\n${scanType.toUpperCase()} accepts:\n✅ GitHub repo: rish0000-dot/Portfolio\n${canAcceptCode ? '✅ Code snippet: console.log("debug")\n' : ''}❌ Random text`
    };
};

// legacy routes removed

app.get('/api/audit-logs', authenticateToken, checkRole(['ADMIN']), async (req, res) => {
    let filtered = await db.audit.list();
    const { user, action, page = 1, limit = 10 } = req.query;

    if (user) filtered = filtered.filter(l => l.user.toLowerCase().includes(user.toLowerCase()));
    if (action) filtered = filtered.filter(l => l.action.includes(action));

    // Sort by timestamp desc
    filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + parseInt(limit));

    res.json({ success: true, logs: paginated, total, totalPages, page: parseInt(page) });
});

app.get('/api/audit-logs/export', authenticateToken, checkRole(['ADMIN']), async (req, res) => {
    const logs = await db.audit.list();
    const csvRows = [
        ['ID', 'Timestamp', 'User', 'Action', 'Details'].join(','),
        ...logs.map(log => [
            log.id,
            log.timestamp,
            log.user,
            log.action,
            `"${log.details.replace(/"/g, '""')}"`
        ].join(','))
    ];

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=audit-logs.csv');
    res.send(csvRows.join('\n'));
});

app.get('/api/dashboard', authenticateToken, (req, res) => {
    res.json({
        success: true,
        data: {
            email: req.user.email,
            role: req.user.role,
            roi: "$142K",
            quality: "89/100",
            team: "@sarah 97/100",
            scans: 124,
            vulnerabilitiesFixed: 45
        }
    });
});

// --- SCAN ENDPOINT ---
app.post('/api/scan', authenticateToken, checkRole(['admin', 'developer']), async (req, res) => {
    const { repoUrl } = req.body;
    if (!repoUrl || repoUrl.trim().length < 3) {
        return res.status(400).json({ success: false, error: 'Enter repo name (ex: rish0000-dot/Portfolio)' });
    }

    logEvent('SCAN_STARTED', req.user?.email || 'ANONYMOUS', `Started scan for ${repoUrl}`);

    const issues = [
        { id: '1', file: 'src/components/Login.jsx', line: 42, category: '🚨 XSS Vulnerability', severity: 'HIGH', confidence: 92, suggestion: 'npm install dompurify\n```jsx\nconst cleanInput = DOMPurify.sanitize(userInput);\n<div>{cleanInput}</div>\n```' },
        { id: '2', file: 'src/utils/database.js', line: 18, category: '💀 SQL Injection', severity: 'CRITICAL', confidence: 98, suggestion: '```js\n// WRONG: db.query(`SELECT * FROM users WHERE id=${id}`)\n// FIXED: db.query("SELECT * FROM users WHERE id=?", [id])\n```' },
        { id: '3', file: 'src/hooks/useFetchData.ts', line: 33, category: '🐌 Memory Leak', severity: 'MEDIUM', confidence: 85, suggestion: '```tsx\nuseEffect(() => {\n  const controller = new AbortController();\n  return () => controller.abort();\n}, [])\n```' },
        { id: '4', file: '.env.local', line: 5, category: '🚨 OpenAI API Key Leaked', severity: 'CRITICAL', confidence: 99, suggestion: '1. NEXT_PUBLIC_OPENAI_API_KEY regenerate\n2. Add `.env*` to `.gitignore`' },
        { id: '5', file: 'package.json', line: 15, category: '📦 lodash Vulnerable (XSS)', severity: 'HIGH', confidence: 95, suggestion: 'npm install lodash@4.17.21' },
        { id: '6', file: 'src/config.js', line: 8, category: '🔑 AWS Access Key Exposed', severity: 'CRITICAL', confidence: 99, suggestion: '1. AWS IAM → New Access Key\n2. git rm --cached src/config.js' }
    ];

    // Simulate Scanning Steps
    const steps = [
        { progress: 10, status: 'CLONING_REPOSITORY' },
        { progress: 30, status: 'PARSING_AST' },
        { progress: 60, status: 'RUNNING_SAST_ENGINE' },
        { progress: 90, status: 'GENERATING_AI_INSIGHTS' },
        { progress: 100, status: 'COMPLETED' }
    ];

    for (const step of steps) {
        await new Promise(r => setTimeout(r, 1000));
        socketIO.emitScanProgress(repoUrl, step.progress, step.status, step.progress === 100 ? issues.length : 0);
    }

    // Inject custom rules matches (simulated)
    customRules.forEach(rule => {
        if (Math.random() > 0.4) {
            issues.push({
                id: `cr-${Date.now()}-${rule.id}`,
                file: 'src/app/core.js',
                line: Math.floor(Math.random() * 100),
                category: `⚡ Custom Rule: ${rule.name}`,
                severity: rule.severity,
                confidence: 100,
                suggestion: rule.description
            });
        }
    });

    // Update in-memory store
    allIssues = issues.map(iss => ({
        ...iss,
        file_path: iss.file || iss.file_path,
        line_start: iss.line || iss.line_start,
        assigned_to: null,
        status: 'open'
    }));

    const riskScore = Math.min(issues.length * 12, 95);

    // Trigger Webhook on completion
    sendWebhookNotification(`🚀 Scan completed for ${repoUrl}. Found ${issues.length} issues. Security Score: ${riskScore}/100.`);

    res.json({ success: true, issues: allIssues, repoUrl: repoUrl.trim(), riskScore, timestamp: new Date().toISOString() });
});

app.post('/api/issues/assign', authenticateToken, async (req, res) => {
    const { issueId, userId } = req.body;
    const issue = allIssues.find(i => i.id === issueId);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    const user = await db.users.findById(userId);
    if (!user && userId !== null) return res.status(404).json({ error: 'User not found' });

    issue.assigned_to = userId;
    logEvent('ISSUE_ASSIGNED', req.user.email, `Assigned issue ${issueId} to ${userId || 'unassigned'}`);
    res.json({ success: true, issue });
});

app.post('/api/issues/status', authenticateToken, async (req, res) => {
    const { issueId, status } = req.body;
    const issue = allIssues.find(i => i.id === issueId);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    issue.status = status;
    logEvent('ISSUE_STATUS_UPDATED', req.user.email, `Updated issue ${issueId} status to ${status}`);
    res.json({ success: true, issue });
});

app.get('/api/issues', authenticateToken, (req, res) => {
    let filtered = [...allIssues];
    const { severity, status, category, search, assignee } = req.query;

    if (severity) filtered = filtered.filter(i => i.severity === severity);
    if (status) filtered = filtered.filter(i => i.status === status);
    if (category) filtered = filtered.filter(i => i.category.includes(category));
    if (assignee) filtered = filtered.filter(i => i.assigned_to === assignee);
    if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(i =>
            i.category.toLowerCase().includes(s) ||
            i.file_path.toLowerCase().includes(s) ||
            i.suggestion.toLowerCase().includes(s)
        );
    }

    res.json({ success: true, issues: filtered });
});

// Webhook Endpoints
app.get('/api/webhooks', authenticateToken, (req, res) => {
    res.json({ success: true, webhooks });
});

app.post('/api/webhooks', authenticateToken, (req, res) => {
    const { type, url, channel } = req.body;
    const newHook = { id: `hook-${Date.now()}`, type, url, channel };
    webhooks.push(newHook);
    logEvent('WEBHOOK_CREATED', req.user.email, `Added ${type} webhook for ${channel}`);
    res.json({ success: true, webhook: newHook });
});

app.delete('/api/webhooks/:id', authenticateToken, (req, res) => {
    webhooks = webhooks.filter(h => h.id !== req.params.id);
    logEvent('WEBHOOK_DELETED', req.user.email, `Removed webhook ${req.params.id}`);
    res.json({ success: true });
});

app.post('/api/ai-review', async (req, res) => {
    const scanType = req.body.type || 'SECURITY';
    const { repoUrl, code, files, customRules } = req.body;
    const input = repoUrl?.trim() || code?.trim() || '';

    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ success: false, error: 'GEMINI_API_KEY missing' });
    }

    if (!input) return res.status(400).json({ success: false, error: "❌ Empty input" });

    const validation = MASTER_VALIDATOR(input, scanType);
    if (!validation.valid) return res.status(400).json({ success: false, error: validation.error });

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        let systemPrompt = `You are an expert Senior Software Architect. Review Type: ${scanType.toUpperCase()}\nOutput format JSON...`;
        const userMessage = `Repo: ${repoUrl}\nFiles: ${JSON.stringify(files || [])}\nCode:\n${code}`;

        const result = await model.generateContent([systemPrompt, userMessage]);
        const response = await result.response;
        let text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();

        res.json({ success: true, review: text, type: scanType, timestamp: new Date().toISOString() });
    } catch (error) {
        // Fallback
        res.json({ success: true, review: JSON.stringify({ overallScore: 85, issues: [] }), type: scanType, isMock: true });
    }
});

// Reports: Share Snapshot
app.post('/api/reports/share', authenticateToken, (req, res) => {
    const { reportData } = req.body;
    const shareId = `report_${Math.random().toString(36).substr(2, 9)}`;

    sharedReports.set(shareId, {
        ...reportData,
        author: req.user.email,
        timestamp: new Date().toISOString()
    });

    res.json({ success: true, shareId });
});

// Reports: Get Shared Snapshot
app.get('/api/reports/share/:id', (req, res) => {
    const report = sharedReports.get(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json({ success: true, report });
});

// Reports: Schedule Automation
app.post('/api/reports/automate', authenticateToken, checkRole(['ADMIN']), (req, res) => {
    const { reportType, cadence, time, recipient } = req.body;

    const newSchedule = {
        id: `schedule_${Date.now()}`,
        reportType,
        cadence,
        time,
        recipient,
        active: true,
        createdBy: req.user.email,
        createdAt: new Date().toISOString()
    };

    reportSchedules.push(newSchedule);
    logEvent('REPORT_SCHEDULED', req.user.email, `Scheduled ${reportType} (${cadence}) for ${recipient}`);

    res.json({ success: true, schedule: newSchedule });
});

// Reports: Get Schedules
app.get('/api/reports/automate', authenticateToken, checkRole(['ADMIN']), (req, res) => {
    const adminSchedules = reportSchedules.filter(s => s.createdBy === req.user.email);
    res.json({ success: true, schedules: adminSchedules });
});

// Reports: Delete Schedule
app.delete('/api/reports/automate/:id', authenticateToken, checkRole(['ADMIN']), (req, res) => {
    const { id } = req.params;
    const index = reportSchedules.findIndex(s => s.id === id && s.createdBy === req.user.email);

    if (index === -1) {
        return res.status(404).json({ error: 'Schedule not found or unauthorized' });
    }

    const deleted = reportSchedules.splice(index, 1)[0];
    logEvent('REPORT_DELETED', req.user.email, `Deleted schedule ${deleted.id} (${deleted.reportType})`);

    res.json({ success: true, message: 'Schedule deleted successfully' });
});

// Custom Rules Endpoints
app.get('/api/rules', authenticateToken, (req, res) => {
    res.json({ success: true, rules: customRules });
});

app.post('/api/rules', authenticateToken, (req, res) => {
    const { name, pattern, severity, category, description } = req.body;
    const newRule = {
        id: `r${Date.now()}`,
        name, pattern, severity, category, description
    };
    customRules.push(newRule);
    logEvent('RULE_CREATED', req.user.email, `Created rule: ${name}`);
    res.json({ success: true, rule: newRule });
});

app.delete('/api/rules/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const index = customRules.findIndex(r => r.id === id);
    if (index === -1) return res.status(404).json({ error: 'Rule not found' });

    const deleted = customRules.splice(index, 1)[0];
    logEvent('RULE_DELETED', req.user.email, `Deleted rule: ${deleted.name}`);
    res.json({ success: true });
});

server.listen(PORT, () => {
    console.log(`🚀 CodeGuardian Enterprise Backend running on http://localhost:${PORT}`);
});
