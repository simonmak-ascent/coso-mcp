import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { FileEngagementStore } from '../src/store/file-store';

let dir: string;
let store: FileEngagementStore;

beforeEach(async () => {
  dir = await mkdtemp(path.join(os.tmpdir(), 'coso-testing-'));
  store = new FileEngagementStore(dir);
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe('FileEngagementStore — testing records', () => {
  it('stores populations, samples, test results and exceptions', async () => {
    const { id } = await store.createEngagement({ title: 'T', entity: 'E' }, 'tester');

    const population = await store.addPopulation(
      id,
      {
        description: 'Q4 purchase orders',
        items: [
          { reference: 'PO-1', amount: 100 },
          { reference: 'PO-2', amount: 250 },
          { reference: 'PO-3', amount: 999 }
        ]
      },
      'tester'
    );
    expect(population.id).toBe('P-0001');
    expect(await store.listPopulations(id)).toHaveLength(1);
    expect((await store.getPopulation(id, population.id))?.description).toBe(
      'Q4 purchase orders'
    );

    const sample = await store.addSample(
      id,
      {
        populationId: population.id,
        method: 'random',
        sampleSize: 2,
        seed: 42,
        selectedReferences: ['PO-1', 'PO-3']
      },
      'tester'
    );
    expect(sample.id).toBe('SM-0001');
    expect(await store.listSamples(id)).toHaveLength(1);

    const testResult = await store.addTestResult(
      id,
      {
        controlId: 'C-0001',
        sampleId: sample.id,
        populationId: population.id,
        attribute: 'Approval evidence',
        results: [
          { reference: 'PO-1', outcome: 'pass' },
          { reference: 'PO-3', outcome: 'fail' }
        ],
        conclusion: 'effective-with-exceptions'
      },
      'tester'
    );
    expect(testResult.id).toBe('T-0001');
    expect(await store.listTestResults(id)).toHaveLength(1);

    const exception = await store.addException(
      id,
      {
        testResultId: testResult.id,
        reference: 'PO-3',
        description: 'Approval taken after PO date',
        rootCause: 'Manual override'
      },
      'tester'
    );
    expect(exception.id).toBe('E-0001');
    expect(await store.listExceptions(id)).toHaveLength(1);
  });

  it('rejects an oversized population', async () => {
    const { id } = await store.createEngagement({ title: 'T', entity: 'E' }, 'tester');
    const items = Array.from({ length: 10_001 }, (_, i) => ({ reference: `PO-${i}` }));
    await expect(
      store.addPopulation(id, { description: 'too big', items }, 'tester')
    ).rejects.toThrow(/maximum/);
  });

  it('records audit events for the testing lifecycle', async () => {
    const { id } = await store.createEngagement({ title: 'T', entity: 'E' }, 'tester');
    const population = await store.addPopulation(
      id,
      { description: 'p', declaredSize: 5 },
      'tester'
    );
    await store.addSample(
      id,
      { populationId: population.id, method: 'systematic', sampleSize: 2, seed: 1, selectedReferences: ['#0001', '#0004'] },
      'tester'
    );
    const audit = await store.listAudit(id);
    expect(audit.map((e) => e.action)).toEqual([
      'create_engagement',
      'create_population',
      'select_sample'
    ]);
  });
});
