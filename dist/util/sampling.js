const TIERS = ['low', 'moderate', 'high'];
/**
 * Sample-size guidance by control frequency and risk (low / moderate / high).
 * Per-transaction controls split by population size (small <250, large ≥250).
 */
const GUIDE = {
    annual: { low: 1, moderate: 1, high: 1 },
    quarterly: { low: 2, moderate: 2, high: 3 },
    monthly: { low: 2, moderate: 3, high: 4 },
    weekly: { low: 5, moderate: 8, high: 15 },
    daily: { low: 20, moderate: 30, high: 40 },
    'per-transaction': { low: 20, moderate: 30, high: 40 }
};
const PER_TRANSACTION_LARGE = { low: 25, moderate: 40, high: 60 };
function sizeFor(frequency, risk, populationSize) {
    if (frequency === 'per-transaction') {
        const large = (populationSize ?? 0) >= 250;
        return (large ? PER_TRANSACTION_LARGE : GUIDE['per-transaction'])[risk];
    }
    return GUIDE[frequency][risk];
}
/** Deterministic sample-size recommendation with a documented rationale. */
export function computeSampleSize(input) {
    const requestedRisk = input.risk ?? 'moderate';
    let effectiveRisk = requestedRisk;
    const rationale = [
        `frequency ${input.frequency}; ${requestedRisk} risk`
    ];
    if (input.priorDeficiency && requestedRisk !== 'high') {
        effectiveRisk = TIERS[TIERS.indexOf(requestedRisk) + 1] ?? 'high';
        rationale.push('escalated one risk tier for a prior-period deficiency');
    }
    if (input.externalReliance) {
        rationale.push('external auditor reliance may require a larger sample than the minimum');
    }
    let recommended = sizeFor(input.frequency, effectiveRisk, input.populationSize);
    let capped = false;
    if (input.populationSize !== undefined && recommended > input.populationSize) {
        recommended = input.populationSize;
        capped = true;
        rationale.push(`capped at the population size of ${input.populationSize}`);
    }
    return {
        frequency: input.frequency,
        requestedRisk,
        effectiveRisk,
        recommended,
        populationSize: input.populationSize,
        capped,
        rationale: rationale.join('; ')
    };
}
/** mulberry32 — a small, fast, seeded PRNG so selection is reproducible. */
export function mulberry32(seed) {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
/** FNV-1a hash of the joined parts, used to derive a stable seed from inputs. */
export function hashSeed(parts) {
    const joined = parts.join('\u0001');
    let h = 2166136261 >>> 0;
    for (let i = 0; i < joined.length; i += 1) {
        h ^= joined.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}
function indices(size) {
    return Array.from({ length: size }, (_, i) => i + 1);
}
/** Simple random selection without replacement (1-based indices, ascending). */
export function randomSelection(size, n, seed) {
    const take = Math.min(n, size);
    const pool = indices(size);
    const rand = mulberry32(seed);
    const out = [];
    for (let i = 0; i < take; i += 1) {
        const j = i + Math.floor(rand() * (size - i));
        const tmp = pool[i];
        pool[i] = pool[j];
        pool[j] = tmp;
        out.push(pool[i]);
    }
    return out.sort((a, b) => a - b);
}
/** Systematic selection: a random start then every Nth item. */
export function systematicSelection(size, n, seed) {
    if (n >= size)
        return indices(size);
    const interval = Math.floor(size / n);
    if (interval < 1)
        return randomSelection(size, n, seed);
    const rand = mulberry32(seed);
    const start = 1 + Math.floor(rand() * interval);
    const out = [];
    for (let idx = start; idx <= size && out.length < n; idx += interval) {
        out.push(idx);
    }
    let k = 1;
    while (out.length < n && k <= size) {
        if (!out.includes(k))
            out.push(k);
        k += 1;
    }
    return out.sort((a, b) => a - b);
}
/** Haphazard selection: a seeded shuffle, no fixed interval. */
export function haphazardSelection(size, n, seed) {
    const take = Math.min(n, size);
    const pool = indices(size);
    const rand = mulberry32(seed);
    for (let i = size - 1; i > 0; i -= 1) {
        const j = Math.floor(rand() * (i + 1));
        const tmp = pool[i];
        pool[i] = pool[j];
        pool[j] = tmp;
    }
    return pool.slice(0, take).sort((a, b) => a - b);
}
//# sourceMappingURL=sampling.js.map