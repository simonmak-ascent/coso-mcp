/** Fixed-window per-key rate limiter. */
export class RateLimiter {
    limit;
    windowMs;
    hits = new Map();
    constructor(limit, windowMs) {
        this.limit = limit;
        this.windowMs = windowMs;
    }
    check(key, now = Date.now()) {
        const entry = this.hits.get(key);
        if (!entry || now >= entry.resetAt) {
            const resetAt = now + this.windowMs;
            this.hits.set(key, { count: 1, resetAt });
            return { allowed: true, remaining: this.limit - 1, resetAt };
        }
        if (entry.count >= this.limit) {
            return { allowed: false, remaining: 0, resetAt: entry.resetAt };
        }
        entry.count += 1;
        return { allowed: true, remaining: this.limit - entry.count, resetAt: entry.resetAt };
    }
    sweep(now = Date.now()) {
        for (const [key, entry] of this.hits) {
            if (now >= entry.resetAt)
                this.hits.delete(key);
        }
    }
    get size() {
        return this.hits.size;
    }
}
//# sourceMappingURL=rate-limit.js.map