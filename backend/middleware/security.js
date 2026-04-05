const db = require('../db');

const rateLimiter = (options) => {
    const { windowMs, max, message } = options;

    return async (req, res, next) => {
        const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const now = Date.now();

        let record = await db.rateLimit.get(ip);

        // Check if currently locked
        if (record.lockedUntil && now < new Date(record.lockedUntil).getTime()) {
            const waitTime = Math.ceil((new Date(record.lockedUntil).getTime() - now) / 60000);
            return res.status(429).json({
                error: 'Too many attempts',
                message: message || `Too many requests. Please try again in ${waitTime} minutes.`,
                retryAfter: waitTime
            });
        }

        // Reset if window passed
        if (record.lastAttempt && now - new Date(record.lastAttempt).getTime() > windowMs) {
            record.count = 0;
        }

        record.count += 1;
        record.lastAttempt = new Date().toISOString();

        if (record.count > max) {
            record.lockedUntil = new Date(now + windowMs).toISOString();
            await db.rateLimit.set(ip, record);

            await db.audit.log({
                action: 'RATE_LIMIT_EXCEEDED',
                user: 'system',
                ip,
                details: `IP ${ip} blocked for ${windowMs / 60000} minutes after ${record.count} attempts.`
            });

            return res.status(429).json({
                error: 'Too many attempts',
                message: message || `Too many requests. Please try again later.`,
                retryAfter: windowMs / 60000
            });
        }

        await db.rateLimit.set(ip, record);
        next();
    };
};

module.exports = { rateLimiter };
