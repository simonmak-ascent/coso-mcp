import { describe, expect, it } from 'vitest';

import { createServer } from '../src/server';
import {
  DISCLAIMER,
  FRAMEWORK_LABEL,
  SERVER_DESCRIPTION,
  SERVER_NAME,
  SERVER_VERSION
} from '../src/version';

describe('createServer', () => {
  it('constructs a connectable MCP server', () => {
    const server = createServer();
    expect(server).toBeDefined();
    expect(typeof server.connect).toBe('function');
  });
});

describe('server identity', () => {
  it('uses the scoped package name and a semver version', () => {
    expect(SERVER_NAME).toBe('@simonmak-ascent/coso-mcp');
    expect(SERVER_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('names the COSO framework and carries the mandatory disclaimer', () => {
    expect(FRAMEWORK_LABEL).toMatch(/COSO/);
    expect(FRAMEWORK_LABEL).toMatch(/ICIF-2013/);
    expect(DISCLAIMER).toMatch(/does not provide audit or legal advice/);
    expect(SERVER_DESCRIPTION).toMatch(/COSO/);
  });
});
