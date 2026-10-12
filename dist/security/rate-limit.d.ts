export interface RateDecision {
    allowed: boolean;
    remaining: number;
    resetAt: number;
}
/** Fixed-window per-key rate limiter. */
export declare class RateLimiter {
    private readonly limit;
    private readonly windowMs;
    private readonly hits;
    constructor(limit: number, windowMs: number);
    check(key: string, now?: number): RateDecision;
    sweep(now?: number): void;
    get size(): number;
}
//# sourceMappingURL=rate-limit.d.ts.map