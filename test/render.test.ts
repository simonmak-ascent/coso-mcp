import { describe, expect, it } from 'vitest';

import type { Control } from '../src/domain/control';
import type { Engagement } from '../src/domain/engagement';
import type { Population } from '../src/domain/population';
import type { Risk } from '../src/domain/risk';
import type { Sample } from '../src/domain/sample';
import type { Exception, TestResult } from '../src/domain/test-result';
import { renderWorkpaper } from '../src/render/workpaper';

const now = '2026-10-12T00:00:00.000Z';

const engagement: Engagement = {
  id: 'eng-1',
  title: 'FY25 ICFR',
  entity: 'Acme Ltd',
  period: '2025',
  framework: 'COSO Internal Control—Integrated Framework (ICIF-2013)',
  status: 'active',
  createdAt: now,
  updatedAt: now
};

const control: Control = {
  id: 'C-0001',
  engagementId: 'eng-1',
  description: 'Three-way match before payment',
  type: 'automated',
  frequency: 'per-transaction',
  key: true,
  riskIds: ['R-0001'],
  assertions: ['completeness', 'accuracy'],
  principles: [10, 11],
  scopeItemId: 'S-0001',
  status: 'active',
  createdAt: now
};

const risk: Risk = {
  id: 'R-0001',
  engagementId: 'eng-1',
  description: 'Duplicate or unauthorised payment',
  likelihood: 'medium',
  assertions: ['completeness'],
  principles: [10],
  fraud: true,
  status: 'open',
  createdAt: now
};

const population: Population = {
  id: 'P-0001',
  engagementId: 'eng-1',
  controlId: 'C-0001',
  description: 'Q4 payments',
  items: [],
  declaredSize: 250,
  createdAt: now
};

const sample: Sample = {
  id: 'SM-0001',
  engagementId: 'eng-1',
  controlId: 'C-0001',
  populationId: 'P-0001',
  method: 'systematic',
  sampleSize: 2,
  seed: 7,
  selectedReferences: ['#0001', '#0126'],
  rationale: 'systematic over the period',
  createdAt: now
};

const testResult: TestResult = {
  id: 'T-0001',
  engagementId: 'eng-1',
  controlId: 'C-0001',
  sampleId: 'SM-0001',
  populationId: 'P-0001',
  attribute: 'Match evidenced',
  procedure: 'Inspect the three-way match screenshot.',
  results: [
    { reference: '#0001', outcome: 'pass' },
    { reference: '#0126', outcome: 'fail' }
  ],
  conclusion: 'effective-with-exceptions',
  createdAt: now
};

const exception: Exception = {
  id: 'E-0001',
  engagementId: 'eng-1',
  testResultId: 'T-0001',
  reference: '#0126',
  description: 'Match override used',
  rootCause: 'Manual override',
  createdAt: now
};

describe('renderWorkpaper', () => {
  it('renders the control, risks, sample, results and exceptions', () => {
    const markdown = renderWorkpaper({
      engagement,
      control,
      risks: [risk],
      population,
      sample,
      testResults: [testResult],
      exceptions: [exception]
    });

    expect(markdown).toContain('# Control testing workpaper — C-0001');
    expect(markdown).toContain('Three-way match before payment');
    expect(markdown).toContain('R-0001');
    expect(markdown).toContain('systematic');
    expect(markdown).toContain('#0126');
    expect(markdown).toContain('Pass 1 / Fail 1 / N/A 0');
    expect(markdown).toContain('Match override used');
    expect(markdown).toContain('Preparer:');
    expect(markdown).toContain('does not provide audit or legal advice');
  });

  it('handles an empty context gracefully', () => {
    const markdown = renderWorkpaper({
      engagement,
      control,
      risks: [],
      testResults: [],
      exceptions: []
    });
    expect(markdown).toContain('_No risks linked to this control._');
    expect(markdown).toContain('_No population registered for this control._');
    expect(markdown).toContain('_No test results recorded._');
    expect(markdown).toContain('_No exceptions noted._');
  });
});
