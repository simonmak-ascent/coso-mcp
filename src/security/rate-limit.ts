export interface RateDecision {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/** Fixed-window per-key rate limiter. */
export class RateLimiter {
  private readonly hits = new Map<string, { count: number; resetAt: number }>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number
  ) {}

  check(key: string, now: number = Date.now()): RateDecision {
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

  sweep(now: number = Date.now()): void {
    for (const [key, entry] of this.hits) {
      if (now >= entry.resetAt) this.hits.delete(key);
    }
  }

  get size(): number {
    return this.hits.size;
  }
}
