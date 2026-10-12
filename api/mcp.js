import { createRequestHandler } from '../dist/http.js';

const handler = createRequestHandler();

/**
 * Hosted MCP endpoint (Vercel Node function). Rewritten from `/mcp`.
 * Each session gets its own ephemeral in-memory store; nothing is persisted.
 */
export default async function mcp(req, res) {
  await handler(req, res);
}

export const config = { maxDuration: 30 };
