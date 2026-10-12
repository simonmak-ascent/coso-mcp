import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { FileEngagementStore } from '../src/store/file-store';

let dir: string;
let store: FileEngagementStore;

beforeEach(async () => {
  dir = await mkdtemp(path.join(os.tmpdir(), 'coso-test-'));
  store = new FileEngagementStore(dir);
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe('FileEngagementStore — engagements', () => {
  it('creates, retrieves and lists engagements', async () => {
    const created = await store.createEngagement(
      { title: 'FY25 ICFR', entity: 'Acme Ltd', period: '2025' },
      'tester'
    );
    expect(created.id).toMatch(/^eng-[0-9a-f]{8}$/);
    expect(created.status).toBe('draft');
    expect(created.framework).toMatch(/COSO/);

    const fetched = await store.getEngagement(created.id);
    expect(fetched?.title).toBe('FY25 ICFR');

    const list = await store.listEngagements();
    expect(list.map((e) => e.id)).toContain(created.id);
  });

  it('honours an explicit id and rejects duplicates', async () => {
    await store.createEngagement({ id: 'eng-2025', title: 'A', entity: 'X' }, 'tester');
    await expect(
      store.createEngagement({ id: 'eng-2025', title: 'B', entity: 'X' }, 'tester')
    ).rejects.toThrow(/already exists/);
  });

  it('returns undefined for an unknown engagement', async () => {
    expect(await store.getEngagement('eng-missing')).toBeUndefined();
  });

  it('rejects ids that would escape the store root', async () => {
    await expect(store.getEngagement('../escape')).rejects.toThrow(/Invalid engagement id/);
    await expect(store.getEngagement('a/b')).rejects.toThrow(/Invalid engagement id/);
  });
});

describe('FileEngagementStore — planning records', () => {
  it('adds scope, risk and control records with sequential ids', async () => {
    const { id } = await store.createEngagement({ title: 'T', entity: 'E' }, 'tester');

    const s1 = await store.addScopeItem(id, { area: 'Revenue', objectiveCategory: 'reporting' }, 'tester');
    const s2 = await store.addScopeItem(id, { area: 'Payroll', objectiveCategory: 'operations' }, 'tester');
    expect([s1.id, s2.id]).toEqual(['S-0001', 'S-0002']);

    const r1 = await store.addRisk(id, { description: 'Cut-off error', assertions: ['completeness'] }, 'tester');
    const r2 = await store.addRisk(id, { description: 'Duplicate payment', fraud: true }, 'tester');
    expect([r1.id, r2.id]).toEqual(['R-0001', 'R-0002']);
    expect(r2.fraud).toBe(true);

    const c1 = await store.addControl(
      id,
      { description: 'Three-way match', type: 'automated', frequency: 'per-transaction', riskIds: [r1.id] },
      'tester'
    );
    expect(c1.id).toBe('C-0001');
    expect(c1.key).toBe(true);

    expect(await store.listScopeItems(id)).toHaveLength(2);
    expect(await store.listRisks(id)).toHaveLength(2);
    expect(await store.listControls(id)).toHaveLength(1);
  });

  it('refuses to add records to a missing engagement', async () => {
    await expect(
      store.addRisk('eng-ghost', { description: 'x' }, 'tester')
    ).rejects.toThrow(/not found/);
  });

  it('records an append-only audit trail', async () => {
    const { id } = await store.createEngagement({ title: 'T', entity: 'E' }, 'alice');
    await store.addRisk(id, { description: 'r' }, 'alice');
    const audit = await store.listAudit(id);
    expect(audit.map((e) => e.action)).toEqual(['create_engagement', 'register_risk']);
    expect(audit.every((e) => e.actor === 'alice')).toBe(true);
  });

  it('persists across store instances', async () => {
    const { id } = await store.createEngagement({ title: 'T', entity: 'E' }, 'tester');
    await store.addControl(
      id,
      { description: 'Review', type: 'manual', frequency: 'monthly' },
      'tester'
    );

    const reopened = new FileEngagementStore(dir);
    expect((await reopened.getEngagement(id))?.id).toBe(id);
    expect(await reopened.listControls(id)).toHaveLength(1);
  });
});
