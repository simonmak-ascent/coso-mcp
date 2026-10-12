# Project Constitution

Status: Ratified
Version: 1.0
Last updated: 2026-10-12

> Impact Chain: Phase 0 — Constitution (immutable)

## Architecture Principles

- **Standards-native.** The COSO Internal Control—Integrated Framework
  (ICIF-2013) — 5 components, 17 principles, points of focus — is modelled as a
  first-class reference engine, not as free text. No other framework is
  substituted for it.
- **Lifecycle, not data plane.** The server runs the review lifecycle (scope →
  risk → controls → population → sampling → testing → workpapers → sign-off →
  deficiency evaluation → report). It does not own source data and ships no
  ERP/GRC integrations in v1 — inputs are uploaded/declared.
- **Deterministic and reproducible.** Sampling algorithms are seeded; sample-size
  guidance, deficiency classification and aggregation are computed — same inputs
  ⇒ same outputs. Nothing is improvised by a model.
- **No fabricated data.** Reference content is seeded only from COSO's own
  public wording; review records come only from user-supplied inputs; missing
  data stays absent.
- **Open by default.** MIT-licensed and openly accessible. The hosted endpoint is
  public; write operations run in an **ephemeral, isolated, rate-limited
  per-session sandbox** and are never persisted.
- **Not advice.** Every assessment/report surface carries the disclaimer: the
  server assists with methodology and is not an audit opinion or legal advice.
- **Contract-first & spec-driven.** Zod schemas are the contract for every tool;
  VDD artifacts (`constitution.md`, `vdd/*`) are authoritative.

## Technology Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Language | TypeScript 7.x | strict; no `any` |
| Runtime | Node.js 20+ | ESM (`NodeNext`) |
| Interface | MCP | stdio (local) + streamable HTTP (hosted) |
| SDK | `@modelcontextprotocol/server` (+ `@modelcontextprotocol/node` for HTTP) | current SDK v2 line |
| Validation | Zod 4 | every tool input/output |
| Store (local) | filesystem | JSON records + Markdown workpapers |
| Store (hosted) | ephemeral in-memory | per-session sandbox, TTL |
| Testing | Vitest | unit + contract |
| Deploy | Vercel | `api/mcp.js`; domain on Alibaba Cloud DNS |

## Security Constraints

- Zod-validate every tool input/output; declared size caps for uploaded inputs.
- Hosted writes are ephemeral and isolated — no cross-session access, no
  persistence; TTL-bounded.
- Rate-limit the public endpoint per client; log abuse events (no PII/secrets).
- No secrets in the repository; environment only; `gitleaks` in CI; redacted logs.
- Bounded, paginated outputs — no unbounded dumps.

## Naming Conventions

- Files: kebab-case (`sample-size.ts`)
- Variables/functions: camelCase
- Types/interfaces: PascalCase
- MCP tool names: snake_case (`select_sample`)
- Env vars: SCREAMING_SNAKE_CASE

## Banned Patterns

- No `any` type in TypeScript.
- No `console.log` in library code (use `process.stderr` for startup errors).
- No pasted licensed COSO framework text; no invented principles/points of focus.
- No fabricated/sample review data.
- No wildcard CORS origins in production.
- Never log secrets, tokens, keys, or PII.
- No bespoke ERP/GRC integrations in v1.

## File Structure Rules

```
src/
  server.ts        # createServer(): tool/resource/prompt registry
  index.ts         # stdio entrypoint
  http.ts          # streamable-HTTP handler (hosted)
  version.ts       # identity, framework label, disclaimer
  framework/       # ICIF-2013 reference data
  domain/          # Zod schemas
  store/           # local file store
  tools/           # one module per tool group
  security/        # validation, rate limiting, sandbox, audit
api/
  mcp.js           # hosted MCP endpoint (Vercel)
vdd/               # vision, strategy, tactics, specs/
constitution.md
test/
```

## Domain Primitives

- mcp-server
- internal-control
- coso
- icfr
- audit-methodology
- open-access

## Open Questions / Deferred Decisions

- Deferred — Persistent (durable) engagements for authenticated callers; current
  hosted model is ephemeral-only (revisit if demand appears).
- Deferred — Optional API keys for higher rate limits / durable sessions.
- Deferred — `server.json` schema pin for MCP registry publishing (validate at
  P6 with the registry CLI).
- Deferred — Edge protection (Vercel WAF / rate-limit rules) tuning under load.
