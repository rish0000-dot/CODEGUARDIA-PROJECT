const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'codeguardian-enterprise-2026-supersecret';

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Session expired or invalid token.' });
        req.user = user;
        next();
    });
};

const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const userRole = req.user.role?.toLowerCase();
        const allowedRoles = roles.map(r => r.toLowerCase());

        if (!allowedRoles.includes(userRole)) {
            console.warn(`🚫 [RBAC] Access Denied: User ${req.user.email} (${req.user.role}) attempted to access ${req.originalUrl}`);
            return res.status(403).json({
                error: 'Access Denied',
                message: `Your role (${req.user.role}) does not have permission to perform this action.`
            });
        }

        next();
    };
};

module.exports = { authenticateToken, checkRole };
