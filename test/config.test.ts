import { describe, expect, it } from 'vitest';

import { resolveActor, resolveDataDir } from '../src/config';

describe('config', () => {
  it('defaults the data dir under the home directory', () => {
    expect(resolveDataDir({})).toMatch(/\.coso-mcp$/);
  });

  it('honours COSO_MCP_DATA_DIR', () => {
    expect(resolveDataDir({ COSO_MCP_DATA_DIR: '/tmp/coso' })).toBe('/tmp/coso');
    expect(resolveDataDir({ COSO_MCP_DATA_DIR: '   ' })).toMatch(/\.coso-mcp$/);
  });

  it('defaults the audit actor to local', () => {
    expect(resolveActor({})).toBe('local');
    expect(resolveActor({ COSO_MCP_ACTOR: 'alice' })).toBe('alice');
  });
});
