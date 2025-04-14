const RateLimiter = require('../services/rateLimiter');

// Create a rate limiter instance with Redis URL
const rateLimiter = new RateLimiter();

const rateLimitMiddleware = async (req, res, next) => {
    try {
        // Get user ID from headers or query params
        const userId = req.headers['x-user-id'] || req.query.userId || 'anonymous';

        const result = await rateLimiter.checkRateLimit(userId);
        
        console.log(`Rate limit check for user ${userId}: Global=${result.globalCount}/${result.globalLimit}, User=${result.userCount}/${result.userLimit}`);

        if (result.isLimited) {
            console.log(`Rate limit exceeded for user ${userId}: Global=${result.globalCount}/${result.globalLimit}, User=${result.userCount}/${result.userLimit}`);
            
            res.setHeader('Retry-After', result.retryAfter);
            return res.status(429).json({
                error: 'Too Many Requests',
                message: 'Rate limit exceeded',
                retryAfter: result.retryAfter,
                limits: {
                    global: {
                        current: result.globalCount,
                        limit: result.globalLimit
                    },
                    user: {
                        current: result.userCount,
                        limit: result.userLimit
                    }
                }
            });
        }

        // Add rate limit info to response headers
        res.setHeader('X-RateLimit-Global-Limit', result.globalLimit);
        res.setHeader('X-RateLimit-Global-Remaining', Math.max(0, result.globalLimit - result.globalCount));
        res.setHeader('X-RateLimit-User-Limit', result.userLimit);
        res.setHeader('X-RateLimit-User-Remaining', Math.max(0, result.userLimit - result.userCount));

        next();
    } catch (error) {
        console.error('Rate limit error:', error);
        // In case of Redis failure, allow the request to pass
        next();
    }
};

module.exports = rateLimitMiddleware; 