import { describe, expect, it } from 'vitest';

import { MemoryEngagementStore } from '../src/store/memory-store';

describe('MemoryEngagementStore', () => {
  it('runs the lifecycle in memory with an audit trail', async () => {
    const store = new MemoryEngagementStore();
    const { id } = await store.createEngagement({ title: 'H', entity: 'E' }, 'hosted');
    const risk = await store.addRisk(id, { description: 'r', principles: [10] }, 'hosted');
    const control = await store.addControl(
      id,
      { description: 'c', type: 'manual', frequency: 'monthly', riskIds: [risk.id], principles: [10] },
      'hosted'
    );

    expect(control.id).toBe('C-0001');
    expect(await store.listRisks(id)).toHaveLength(1);
    expect((await store.getEngagement(id))?.title).toBe('H');
    const audit = await store.listAudit(id);
    expect(audit.map((event) => event.action)).toEqual([
      'create_engagement',
      'register_risk',
      'register_control'
    ]);
  });

  it('isolates separate store instances (per-session sandbox)', async () => {
    const a = new MemoryEngagementStore();
    const b = new MemoryEngagementStore();
    await a.createEngagement({ id: 'eng-x', title: 'X', entity: 'E' }, 'a');
    expect(await b.getEngagement('eng-x')).toBeUndefined();
    expect(await b.listEngagements()).toHaveLength(0);
  });

  it('rejects operations on a missing engagement', async () => {
    const store = new MemoryEngagementStore();
    await expect(store.addRisk('eng-ghost', { description: 'x' }, 'hosted')).rejects.toThrow(
      /not found/
    );
  });
});
