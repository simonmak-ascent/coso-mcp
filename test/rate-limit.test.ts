import { describe, expect, it } from 'vitest';

import { RateLimiter } from '../src/security/rate-limit';

describe('RateLimiter', () => {
  it('allows up to the limit then blocks within the window', () => {
    const limiter = new RateLimiter(3, 1000);
    const t0 = 1_000_000;
    expect(limiter.check('ip', t0).allowed).toBe(true);
    expect(limiter.check('ip', t0 + 1).allowed).toBe(true);
    expect(limiter.check('ip', t0 + 2).allowed).toBe(true);
    const blocked = limiter.check('ip', t0 + 3);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it('resets after the window and tracks keys independently', () => {
    const limiter = new RateLimiter(1, 1000);
    const t0 = 2_000_000;
    expect(limiter.check('a', t0).allowed).toBe(true);
    expect(limiter.check('a', t0 + 1).allowed).toBe(false);
    expect(limiter.check('b', t0 + 1).allowed).toBe(true);
    expect(limiter.check('a', t0 + 1000).allowed).toBe(true);
  });

  it('sweeps expired windows', () => {
    const limiter = new RateLimiter(1, 1000);
    limiter.check('a', 1_000_000);
    expect(limiter.size).toBe(1);
    limiter.sweep(1_001_001);
    expect(limiter.size).toBe(0);
  });
});
