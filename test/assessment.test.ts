import { describe, expect, it } from 'vitest';

import type { Control } from '../src/domain/control';
import type { Deficiency } from '../src/domain/deficiency';
import type { Risk } from '../src/domain/risk';
import { assessComponents, assessPrinciples, integrationCheck } from '../src/util/assessment';

const now = '2026-10-12T00:00:00.000Z';

function control(id: string, principles: number[]): Control {
  return {
    id,
    engagementId: 'eng-1',
    description: 'c',
    type: 'manual',
    frequency: 'monthly',
    key: true,
    riskIds: [],
    assertions: [],
    principles,
    status: 'active',
    createdAt: now
  };
}

function risk(id: string, principles: number[]): Risk {
  return {
    id,
    engagementId: 'eng-1',
    description: 'r',
    likelihood: 'medium',
    assertions: [],
    principles,
    fraud: false,
    status: 'open',
    createdAt: now
  };
}

function deficiency(id: string, controlId: string): Deficiency {
  return {
    id,
    engagementId: 'eng-1',
    title: 'd',
    description: 'd',
    likelihood: 'more-than-remote',
    magnitude: 'material',
    pervasive: false,
    severity: 'significant-deficiency',
    rationale: 'r',
    controlId,
    exceptionIds: [],
    createdAt: now
  };
}

describe('assessPrinciples', () => {
  it('reports no-coverage, indicators-present and indicators-of-gap', () => {
    const controls = [control('C-0001', [10]), control('C-0002', [16])];
    const risks = [risk('R-0001', [11])];
    const deficiencies = [deficiency('D-0001', 'C-0002')];

    const assessments = assessPrinciples({ controls, risks, deficiencies });
    expect(assessments).toHaveLength(17);

    const p10 = assessments.find((a) => a.number === 10);
    expect(p10?.status).toBe('indicators-present');
    expect(p10?.controls).toBe(1);

    const p11 = assessments.find((a) => a.number === 11);
    expect(p11?.status).toBe('indicators-present');
    expect(p11?.risks).toBe(1);

    const p16 = assessments.find((a) => a.number === 16);
    expect(p16?.status).toBe('indicators-of-gap');
    expect(p16?.deficiencies).toBe(1);

    const p7 = assessments.find((a) => a.number === 7);
    expect(p7?.status).toBe('no-coverage');
  });
});

describe('assessComponents and integrationCheck', () => {
  it('aggregates to components and flags uncovered components', () => {
    const components = assessComponents([control('C-0001', [10])], [], []);
    const controlActivities = components.find((c) => c.id === 'control-activities');
    expect(controlActivities?.status).toBe('indicators-present');

    const monitoring = components.find((c) => c.id === 'monitoring-activities');
    expect(monitoring?.status).toBe('no-coverage');

    const integration = integrationCheck(components);
    expect(integration.totalPrinciples).toBe(17);
    expect(integration.coveredPrinciples).toBe(1); // only principle 10 is mapped
    expect(integration.uncoveredComponents.length).toBeGreaterThan(0);
  });
});
