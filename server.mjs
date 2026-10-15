#!/usr/bin/env node
/**
 * Standalone HTTP server for coso-mcp — the box (ecs-01) deployment entry point.
 *
 * Mirrors the Vercel function contract (see `vercel.json`):
 *   /mcp            -> the MCP streamable-http handler (`dist/http.js`)
 *   /.well-known/mcp -> the discovery document
 *   everything else -> the static `public/` site
 *
 * Vercel pre-parses the request body; a plain Node server does not, so we read
 * and JSON-parse it here before handing off to the request handler.
 */
import { createServer as createHttpServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, extname, join, normalize } from "node:path";

import { createRequestHandler } from "./dist/http.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, "public");
const PORT = Number(process.env.PORT || 8080);
const HOST = process.env.HOST || "127.0.0.1";

const handleMcp = createRequestHandler({ actor: "hosted" });

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
};

async function readBody(req) {
  if (req.method === "GET" || req.method === "HEAD") return undefined;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

function sendWellKnown(res) {
  res.writeHead(200, { "content-type": "application/json", "cache-control": "public, max-age=3600" });
  res.end(
    JSON.stringify({
      name: "com.ascent-partners/coso-mcp",
      description:
        "Open MCP server for COSO (ICIF-2013) internal-control reviews: scope, risk, controls, sampling, testing, workpapers, sign-off, deficiency evaluation and reporting.",
      transport: "streamable-http",
      endpoint: "https://internal-control.ascent-partners.com/mcp",
      protocol: "modelcontextprotocol",
      license: "MIT",
      repository: "https://github.com/simonmak-ascent/coso-mcp",
      access: "open (writes are ephemeral and not persisted)",
    })
  );
}

async function serveStatic(res, pathname) {
  let rel = normalize(decodeURIComponent(pathname)).replace(/^([/\\])+/, "");
  if (rel === "" ) rel = "index.html";
  const file = join(PUBLIC_DIR, rel);
  if (!file.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { "content-type": "text/plain; charset=utf-8" }).end("forbidden");
    return;
  }
  try {
    const info = await stat(file);
    if (info.isDirectory()) {
      res.writeHead(404, { "content-type": "text/plain; charset=utf-8" }).end("not found");
      return;
    }
    const body = await readFile(file);
    res.writeHead(200, { "content-type": MIME[extname(file).toLowerCase()] || "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" }).end("not found");
  }
}

const server = createHttpServer(async (req, res) => {
  const { pathname } = new URL(req.url || "/", "http://localhost");
  try {
    if (pathname === "/mcp" || pathname.startsWith("/mcp/")) {
      req.body = await readBody(req);
      await handleMcp(req, res);
      return;
    }
    if (pathname === "/.well-known/mcp") {
      sendWellKnown(res);
      return;
    }
    if (pathname === "/healthz" || pathname === "/health") {
      res.writeHead(200, { "content-type": "text/plain; charset=utf-8" }).end("ok");
      return;
    }
    await serveStatic(res, pathname);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`coso-mcp server error: ${message}\n`);
    if (!res.headersSent) res.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
    res.end("internal error");
  }
});

server.listen(PORT, HOST, () => {
  process.stdout.write(`coso-mcp listening on ${HOST}:${PORT}\n`);
});
