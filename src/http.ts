import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';

import { NodeStreamableHTTPServerTransport } from '@modelcontextprotocol/node';
import type { McpServer } from '@modelcontextprotocol/server';

import { RateLimiter } from './security/rate-limit.js';
import { createServer } from './server.js';
import { MemoryEngagementStore } from './store/memory-store.js';

export interface HttpHandlerOptions {
  /** Requests allowed per client per minute. @default 120 */
  rateLimitPerMinute?: number;
  /** Session idle time-to-live in ms. @default 30 minutes */
  sessionTtlMs?: number;
  /** Maximum concurrent sessions before oldest eviction. @default 500 */
  maxSessions?: number;
  /** Actor recorded for hosted sessions. @default "hosted" */
  actor?: string;
}

interface Session {
  server: McpServer;
  transport: NodeStreamableHTTPServerTransport;
  lastSeen: number;
}

type NodeRequest = IncomingMessage & { body?: unknown; headers: IncomingMessage['headers'] };

function header(req: NodeRequest, name: string): string | undefined {
  const value = req.headers[name];
  return Array.isArray(value) ? value[0] : value;
}

function clientIp(req: NodeRequest): string {
  const forwarded = header(req, 'x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() ?? 'unknown';
  return req.socket?.remoteAddress ?? 'unknown';
}

function sendJson(res: ServerResponse, status: number, body: unknown, headers: Record<string, string> = {}): void {
  res.writeHead(status, { 'content-type': 'application/json', ...headers });
  res.end(JSON.stringify(body));
}

/**
 * Node request handler for the hosted MCP endpoint. Each MCP session gets its
 * own ephemeral in-memory store; sessions are idle-evicted and never persisted.
 */
export function createRequestHandler(
  options: HttpHandlerOptions = {}
): (req: NodeRequest, res: ServerResponse) => Promise<void> {
  const limiter = new RateLimiter(options.rateLimitPerMinute ?? 120, 60_000);
  const ttl = options.sessionTtlMs ?? 30 * 60_000;
  const maxSessions = options.maxSessions ?? 500;
  const actor = options.actor ?? 'hosted';
  const sessions = new Map<string, Session>();

  function closeSession(session: Session): void {
    try {
      session.transport.close();
    } catch {
      // ignore
    }
    try {
      void session.server.close();
    } catch {
      // ignore
    }
  }

  function sweep(now: number): void {
    limiter.sweep(now);
    for (const [id, session] of sessions) {
      if (now - session.lastSeen > ttl) {
        closeSession(session);
        sessions.delete(id);
      }
    }
  }

  return async (req, res) => {
    const now = Date.now();
    const decision = limiter.check(clientIp(req), now);
    if (!decision.allowed) {
      sendJson(res, 429, { error: 'rate_limited' }, {
        'retry-after': String(Math.max(1, Math.ceil((decision.resetAt - now) / 1000)))
      });
      return;
    }

    sweep(now);

    const sessionId = header(req, 'mcp-session-id');
    if (sessionId) {
      const session = sessions.get(sessionId);
      if (!session) {
        sendJson(res, 404, { error: 'session_not_found' });
        return;
      }
      session.lastSeen = now;
      await session.transport.handleRequest(req as never, res, req.body);
      return;
    }

    const server = createServer({ store: new MemoryEngagementStore(), actor });
    const transport = new NodeStreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID()
    });
    transport.onclose = () => {
      const id = transport.sessionId;
      if (id) sessions.delete(id);
    };
    await server.connect(transport);
    await transport.handleRequest(req as never, res, req.body);

    const createdId = transport.sessionId;
    if (createdId) {
      sessions.set(createdId, { server, transport, lastSeen: now });
      if (sessions.size > maxSessions) {
        let oldestId: string | undefined;
        let oldest = Infinity;
        for (const [id, session] of sessions) {
          if (session.lastSeen < oldest) {
            oldest = session.lastSeen;
            oldestId = id;
          }
        }
        if (oldestId && oldestId !== createdId) {
          const evicted = sessions.get(oldestId);
          if (evicted) closeSession(evicted);
          sessions.delete(oldestId);
        }
      }
    }
  };
}
