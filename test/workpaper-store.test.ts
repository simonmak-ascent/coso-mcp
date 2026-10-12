import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { FileEngagementStore } from '../src/store/file-store';

let dir: string;
let store: FileEngagementStore;

beforeEach(async () => {
  dir = await mkdtemp(path.join(os.tmpdir(), 'coso-wp-'));
  store = new FileEngagementStore(dir);
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe('FileEngagementStore — workpapers', () => {
  it('adds, lists, gets and saves workpapers', async () => {
    const { id } = await store.createEngagement({ title: 'T', entity: 'E' }, 'tester');

    const workpaper = await store.addWorkpaper(
      id,
      { controlId: 'C-0001', title: 'WP C-0001', markdown: '# hello' },
      'tester'
    );
    expect(workpaper.id).toBe('WP-0001');
    expect(workpaper.status).toBe('draft');

    expect(await store.listWorkpapers(id)).toHaveLength(1);
    expect((await store.getWorkpaper(id, workpaper.id))?.title).toBe('WP C-0001');

    const saved = await store.saveWorkpaper(id, {
      ...workpaper,
      status: 'in-review',
      markdown: '# updated'
    });
    expect(saved.status).toBe('in-review');
    expect((await store.getWorkpaper(id, workpaper.id))?.markdown).toBe('# updated');
  });

  it('records arbitrary review events', async () => {
    const { id } = await store.createEngagement({ title: 'T', entity: 'E' }, 'tester');
    await store.addWorkpaper(id, { controlId: 'C-0001', title: 'w', markdown: 'm' }, 'tester');
    await store.recordEvent(id, {
      action: 'sign_off',
      entityType: 'workpaper',
      entityId: 'WP-0001',
      actor: 'alice',
      details: { role: 'preparer' }
    });
    const audit = await store.listAudit(id);
    const signOff = audit.find((event) => event.action === 'sign_off');
    expect(signOff?.actor).toBe('alice');
    expect(signOff?.details).toEqual({ role: 'preparer' });
  });
});
