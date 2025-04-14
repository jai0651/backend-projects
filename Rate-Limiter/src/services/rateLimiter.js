const Redis = require('ioredis');
const { promisify } = require('util');

class RateLimiter {
    constructor(redisConfig) {
        this.redis = new Redis(process.env.REDIS_URL, {
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            }
        });
        
        
        this.globalLimit = parseInt(process.env.GLOBAL_RATE_LIMIT) || 1000;
        this.globalWindow = parseInt(process.env.GLOBAL_WINDOW) || 60;
        this.userLimit = parseInt(process.env.USER_RATE_LIMIT) || 10;
        this.userWindow = parseInt(process.env.USER_WINDOW) || 1;
        
    }

    async checkRateLimit(userId) {
        const now = Date.now();
        const globalKey = 'global:rate:limit';
        const userKey = `user:${userId}:rate:limit`;

        // Check global rate limit
        const globalCount = await this.redis.incr(globalKey);
        if (globalCount === 1) {
            await this.redis.expire(globalKey, this.globalWindow);
        }

        // Check user rate limit
        const userCount = await this.redis.incr(userKey);
        if (userCount === 1) {
            await this.redis.expire(userKey, this.userWindow);
        }

        const isGlobalLimited = globalCount > this.globalLimit;
        const isUserLimited = userCount > this.userLimit;

        return {
            isLimited: isGlobalLimited || isUserLimited,
            globalCount,
            userCount,
            globalLimit: this.globalLimit,
            userLimit: this.userLimit,
            retryAfter: isGlobalLimited ? this.globalWindow : this.userWindow
        };
    }

    async getRateLimitStatus(userId) {
        const globalKey = 'global:rate:limit';
        const userKey = `user:${userId}:rate:limit`;

        const [globalCount, userCount] = await Promise.all([
            this.redis.get(globalKey) || 0,
            this.redis.get(userKey) || 0
        ]);

        return {
            globalCount: parseInt(globalCount),
            userCount: parseInt(userCount),
            globalLimit: this.globalLimit,
            userLimit: this.userLimit
        };
    }
}

module.exports = RateLimiter; 