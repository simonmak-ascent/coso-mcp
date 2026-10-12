import { describe, expect, it } from 'vitest';

import {
  computeSampleSize,
  haphazardSelection,
  hashSeed,
  mulberry32,
  randomSelection,
  systematicSelection
} from '../src/util/sampling';

describe('computeSampleSize', () => {
  it('follows the frequency × risk guidance table', () => {
    expect(computeSampleSize({ frequency: 'annual', risk: 'low' }).recommended).toBe(1);
    expect(computeSampleSize({ frequency: 'quarterly', risk: 'high' }).recommended).toBe(3);
    expect(computeSampleSize({ frequency: 'monthly', risk: 'moderate' }).recommended).toBe(3);
    expect(computeSampleSize({ frequency: 'weekly', risk: 'high' }).recommended).toBe(15);
    expect(computeSampleSize({ frequency: 'daily', risk: 'moderate' }).recommended).toBe(30);
  });

  it('splits per-transaction populations by size', () => {
    expect(
      computeSampleSize({ frequency: 'per-transaction', risk: 'moderate', populationSize: 100 })
        .recommended
    ).toBe(30);
    expect(
      computeSampleSize({ frequency: 'per-transaction', risk: 'moderate', populationSize: 500 })
        .recommended
    ).toBe(40);
  });

  it('escalates one risk tier for a prior-period deficiency', () => {
    const result = computeSampleSize({
      frequency: 'weekly',
      risk: 'low',
      priorDeficiency: true
    });
    expect(result.effectiveRisk).toBe('moderate');
    expect(result.recommended).toBe(8);
    expect(result.rationale).toMatch(/prior-period deficiency/);
  });

  it('caps the recommendation at the population size', () => {
    const result = computeSampleSize({
      frequency: 'daily',
      risk: 'high',
      populationSize: 10
    });
    expect(result.recommended).toBe(10);
    expect(result.capped).toBe(true);
  });
});

describe('seeded selection', () => {
  it('is reproducible for a given seed', () => {
    expect(randomSelection(100, 10, 42)).toEqual(randomSelection(100, 10, 42));
    expect(systematicSelection(100, 10, 7)).toEqual(systematicSelection(100, 10, 7));
    expect(haphazardSelection(100, 10, 3)).toEqual(haphazardSelection(100, 10, 3));
  });

  it('returns distinct, in-range, ascending indices', () => {
    for (const selection of [
      randomSelection(50, 8, 1),
      systematicSelection(50, 8, 2),
      haphazardSelection(50, 8, 3)
    ]) {
      expect(selection).toHaveLength(8);
      expect(new Set(selection).size).toBe(8);
      expect(selection.every((i) => i >= 1 && i <= 50)).toBe(true);
      expect([...selection].sort((a, b) => a - b)).toEqual(selection);
    }
  });

  it('handles a sample as large as the population', () => {
    expect(randomSelection(5, 10, 1)).toEqual([1, 2, 3, 4, 5]);
    expect(systematicSelection(5, 10, 1)).toEqual([1, 2, 3, 4, 5]);
  });

  it('hashSeed is stable and differs by input', () => {
    expect(hashSeed(['a', 'b'])).toBe(hashSeed(['a', 'b']));
    expect(hashSeed(['a', 'b'])).not.toBe(hashSeed(['a', 'c']));
  });

  it('mulberry32 produces values in [0, 1)', () => {
    const rand = mulberry32(123);
    for (let i = 0; i < 100; i += 1) {
      const value = rand();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});
