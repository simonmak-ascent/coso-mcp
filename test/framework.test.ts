import { describe, expect, it } from 'vitest';

import { ICIF } from '../src/framework/icif';
import { COMPONENT_IDS } from '../src/framework/query';
import {
  getComponent,
  getPrincipleById,
  getPrincipleByNumber,
  listPrinciples
} from '../src/framework/query';

describe('COSO ICIF-2013 reference data', () => {
  it('has five components numbered 1..5', () => {
    expect(ICIF.components).toHaveLength(5);
    expect(ICIF.components.map((c) => c.number)).toEqual([1, 2, 3, 4, 5]);
  });

  it('has 17 principles numbered 1..17 with no gaps', () => {
    expect(ICIF.principles).toHaveLength(17);
    expect(ICIF.principles.map((p) => p.number)).toEqual(
      Array.from({ length: 17 }, (_, i) => i + 1)
    );
  });

  it('assigns every principle to a known component', () => {
    for (const principle of ICIF.principles) {
      expect(COMPONENT_IDS).toContain(principle.component);
    }
  });

  it('keeps component principle lists consistent with the principles', () => {
    for (const component of ICIF.components) {
      const fromPrinciples = listPrinciples(component.id).map((p) => p.number);
      expect(component.principles).toEqual(fromPrinciples);
    }
  });

  it('gives every principle an id, a statement and at least one point of focus', () => {
    for (const principle of ICIF.principles) {
      expect(principle.id).toMatch(/^[a-z0-9-]+$/);
      expect(principle.statement.length).toBeGreaterThan(10);
      expect(principle.pointsOfFocus.length).toBeGreaterThan(0);
    }
  });

  it('has unique principle numbers and ids', () => {
    const numbers = new Set(ICIF.principles.map((p) => p.number));
    const ids = new Set(ICIF.principles.map((p) => p.id));
    expect(numbers.size).toBe(17);
    expect(ids.size).toBe(17);
  });

  it('has three objective categories', () => {
    expect(ICIF.objectiveCategories.map((c) => c.id)).toEqual([
      'operations',
      'reporting',
      'compliance'
    ]);
  });

  it('paraphrases points of focus from public sources (notice present)', () => {
    expect(ICIF.notice).toMatch(/paraphrased/i);
    expect(ICIF.sourceUrl).toBe('https://www.coso.org/guidance-on-ic');
  });
});

describe('framework queries', () => {
  it('finds principles by number and id', () => {
    expect(getPrincipleByNumber(1)?.id).toBe('integrity-and-ethical-values');
    expect(getPrincipleByNumber(17)?.id).toBe('evaluates-and-communicates-deficiencies');
    expect(getPrincipleById('considers-fraud')?.number).toBe(8);
    expect(getPrincipleByNumber(0)).toBeUndefined();
  });

  it('filters principles by component', () => {
    expect(listPrinciples('monitoring-activities').map((p) => p.number)).toEqual([16, 17]);
    expect(getComponent('risk-assessment')?.principles).toEqual([6, 7, 8, 9]);
  });
});
