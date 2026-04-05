const jwt = require('jsonwebtoken');

const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (!roles.includes(req.user.role)) {
            console.warn(`🚫 [RBAC] Access Denied: User ${req.user.email} (${req.user.role}) attempted to access ${req.originalUrl}`);
            return res.status(403).json({
                error: 'Access Denied',
                message: `Your role (${req.user.role}) does not have permission to perform this action.`
            });
        }

        next();
    };
};

module.exports = { checkRole };
