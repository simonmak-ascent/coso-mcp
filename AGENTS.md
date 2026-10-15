# AGENTS.md

## Project overview

`@simonmak-ascent/coso-mcp` — an open TypeScript MCP server for internal-control
reviews under the **COSO Internal Control—Integrated Framework (ICIF-2013)**. It
runs the full lifecycle (scope → risk → controls → population → sampling →
testing → workpapers → sign-off → deficiency evaluation → report). Two surfaces:
local stdio (full lifecycle, file-backed store) and the hosted, open endpoint at
`https://internal-control.ascent-partners.com/mcp` (reference + read tools, plus
an ephemeral per-session sandbox for writes).

## Commands

Compute runs on a box, never locally: `cs run "<cmd>"`.

```bash
pnpm install
pnpm typecheck
pnpm test
pnpm test:coverage
pnpm build        # tsc
```

CI: `.github/workflows/ci.yml` (typecheck / test / build).

## Architecture

- `src/server.ts` — `createServer()`; registers tools/resources/prompts.
- `src/index.ts` — stdio entrypoint.
- `src/version.ts` — server identity, framework label, disclaimer.
- `src/framework/` — the COSO ICIF-2013 reference data (components, principles,
  points of focus), paraphrased from public sources.
- `src/domain/` — Zod schemas (engagement, scope, risk, control, population,
  sample, test, workpaper, deficiency, sign-off, audit event).
- `src/store/` — local file store (JSON records + derived Markdown workpapers).
- `src/tools/` — one module per tool group (reference, engagement, testing,
  workpaper, assessment).
- `src/security/` — validation, rate limiting, ephemeral sandbox, audit log.
- `server.mjs` — box (ecs-01) HTTP entrypoint; `test/` — vitest; `vdd/` — VDD chain artifacts.

## Conventions

- TypeScript strict; Zod schemas for every tool input/output; named exports.
- MCP tools are snake_case; files kebab-case; types PascalCase.
- COSO reference data is paraphrased only — never paste licensed framework text,
  never invent principles/points of focus.
- **No fabricated data**: seed reference content only from COSO's own wording;
  review records come only from user inputs.
- Missing data stays absent — never synthesise a value.

## Gotchas

- The hosted endpoint is **open**; writes are ephemeral and never persisted.
- Keep the disclaimer on assessment/report surfaces (not audit advice).
- No runtime dependency sprawl — the SDK + Zod only, by design.
