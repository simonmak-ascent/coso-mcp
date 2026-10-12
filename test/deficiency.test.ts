import { describe, expect, it } from 'vitest';

import type { Deficiency } from '../src/domain/deficiency';
import { aggregateDeficiencies, classifyDeficiency } from '../src/util/deficiency';

const now = '2026-10-12T00:00:00.000Z';

function deficiency(partial: Partial<Deficiency> & Pick<Deficiency, 'id' | 'severity'>): Deficiency {
  return {
    engagementId: 'eng-1',
    title: 't',
    description: 'd',
    likelihood: 'more-than-remote',
    magnitude: 'material',
    pervasive: false,
    rationale: 'r',
    exceptionIds: [],
    createdAt: now,
    ...partial
  };
}

describe('classifyDeficiency', () => {
  it('classifies material + more-than-remote as a material weakness', () => {
    expect(
      classifyDeficiency({ likelihood: 'more-than-remote', magnitude: 'material' }).severity
    ).toBe('material-weakness');
  });

  it('classifies material + remote as a significant deficiency', () => {
    expect(classifyDeficiency({ likelihood: 'remote', magnitude: 'material' }).severity).toBe(
      'significant-deficiency'
    );
  });

  it('classifies more-than-inconsequential as a significant deficiency', () => {
    expect(
      classifyDeficiency({ likelihood: 'remote', magnitude: 'more-than-inconsequential' }).severity
    ).toBe('significant-deficiency');
  });

  it('classifies inconsequential as a deficiency', () => {
    expect(classifyDeficiency({ likelihood: 'remote', magnitude: 'inconsequential' }).severity).toBe(
      'deficiency'
    );
  });

  it('escalates one level for a pervasive control', () => {
    expect(
      classifyDeficiency({
        likelihood: 'remote',
        magnitude: 'inconsequential',
        pervasive: true
      }).severity
    ).toBe('significant-deficiency');
  });
});

describe('aggregateDeficiencies', () => {
  it('groups by control and flags combinations', () => {
    const result = aggregateDeficiencies([
      deficiency({ id: 'D-0001', severity: 'significant-deficiency', controlId: 'C-0001' }),
      deficiency({ id: 'D-0002', severity: 'significant-deficiency', controlId: 'C-0001' }),
      deficiency({ id: 'D-0003', severity: 'deficiency', controlId: 'C-0002' })
    ]);
    expect(result.overallSeverity).toBe('significant-deficiency');
    const c1 = result.groups.find((group) => group.key === 'C-0001');
    expect(c1?.aggregated).toBe(true);
    expect(c1?.count).toBe(2);
    expect(result.notes.join(' ')).toMatch(/in combination/);
  });

  it('returns an undefined overall severity for no deficiencies', () => {
    const result = aggregateDeficiencies([]);
    expect(result.overallSeverity).toBeUndefined();
    expect(result.groups).toHaveLength(0);
  });
});
