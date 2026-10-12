import { createServer as createHttpServer, type Server } from 'node:http';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createRequestHandler } from '../src/http';

let server: Server;
let baseUrl: string;

beforeAll(async () => {
  const handler = createRequestHandler({ rateLimitPerMinute: 10_000, sessionTtlMs: 60_000 });
  server = createHttpServer((req, res) => {
    void handler(req as never, res);
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 0;
  baseUrl = `http://127.0.0.1:${port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

async function readJson(response: Response): Promise<Record<string, unknown>> {
  const contentType = response.headers.get('content-type') ?? '';
  const body = await response.text();
  if (body.trim() === '') return {};
  if (contentType.includes('text/event-stream')) {
    const data = body
      .split('\n')
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.slice(5).trim())
      .filter((line) => line.length > 0);
    return JSON.parse(data[data.length - 1] ?? '{}') as Record<string, unknown>;
  }
  return JSON.parse(body) as Record<string, unknown>;
}

async function post(
  body: unknown,
  sessionId?: string
): Promise<{ status: number; sessionId: string | null; json: Record<string, unknown> }> {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    accept: 'application/json, text/event-stream'
  };
  if (sessionId) headers['mcp-session-id'] = sessionId;
  const response = await fetch(`${baseUrl}/mcp`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });
  return {
    status: response.status,
    sessionId: response.headers.get('mcp-session-id'),
    json: await readJson(response)
  };
}

describe('hosted HTTP endpoint', () => {
  it('initializes and lists the tools', async () => {
    const init = await post({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2026-07-28',
        capabilities: {},
        clientInfo: { name: 'http-test', version: '0.0.0' }
      }
    });
    expect(init.status).toBeLessThan(300);
    const result = init.json.result as { serverInfo?: { name?: string } } | undefined;
    expect(result?.serverInfo?.name).toBe('@simonmak-ascent/coso-mcp');

    const sessionId = init.sessionId ?? undefined;
    if (sessionId) {
      await post({ jsonrpc: '2.0', method: 'notifications/initialized' }, sessionId);
    }

    const list = await post(
      { jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} },
      sessionId
    );
    const tools = (list.json.result as { tools?: { name: string }[] } | undefined)?.tools ?? [];
    expect(tools.map((tool) => tool.name)).toContain('get_server_info');
  });

  it('rejects an unknown session id', async () => {
    const response = await post(
      { jsonrpc: '2.0', id: 3, method: 'tools/list', params: {} },
      'does-not-exist'
    );
    expect(response.status).toBe(404);
    expect(response.json.error).toBe('session_not_found');
  });
});
