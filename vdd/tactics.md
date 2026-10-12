# Tactics

> Impact Chain: Phase 3 — Tactics

## Repo Audit (current state)

- **Language/runtime:** TypeScript strict (ESM, NodeNext), Node ≥20.
- **Surface:** 39 MCP tools across reference, engagement, testing, workpaper and
  assessment groups; 2 resources; 5 prompts.
- **Data:** Zod schemas for every record; two stores implementing one interface —
  `FileEngagementStore` (local, `~/.coso-mcp`) and `MemoryEngagementStore`
  (hosted, ephemeral).
- **Transport:** stdio (`src/index.ts`) + streamable HTTP (`src/http.ts`).
- **Tests:** 67 tests (Vitest) incl. 10 in-memory-transport end-to-end tests and
  2 live HTTP tests.
- **Deploy:** Vercel `api/mcp.js` + `api/well-known.js`; `public/index.html`;
  custom domain on Alibaba Cloud DNS.
- **CI:** `.github/workflows/ci.yml` (typecheck/test/build), dependabot, gitleaks.

## Technical Debt

| Id | Item | Severity | Note |
|---|---|---|---|
| TD-1 | `dist/` is committed (Vercel needs it without a build) | Low | Acceptable; rebuilt by `prepare` on install |
| TD-2 | Hosted session state is in-process (no cross-instance sharing) | Medium | Serverless constraint; documented |
| TD-3 | No client-side integration test against the deployed URL in CI | Low | Verified manually via HTTP tests + live probe |
| TD-4 | Points of focus are an illustrative subset | Low | Documented as paraphrased, non-exhaustive |
| TD-5 | npm/registry publishing not yet automated | Low | Blocked on account auth |

## Gap Analysis

Filled by this project (vs the market): COSO-native lifecycle, write/stateful
workpapers with sign-off, deterministic sampling/deficiency math, framework
coverage indicators, open access.

Remaining gaps (deferred):
- Persistent/durable engagements for authenticated callers (currently ephemeral).
- Live ERP/GRC evidence integrations (v1 = uploaded/declared inputs).
- Full points-of-focus enumeration (subset only).

## Action Items (MoSCoW)

**Must (done):**
- A-001 Reference engine: ICIF-2013 data + read tools/resource/prompts.
- A-002 Engagement/scope/risk/control register + file store.
- A-003 Sampling (sample-size + seeded selection) + attribute testing.
- A-004 Workpapers, review notes, warn-only sign-off, activity log.
- A-005 Deficiency classification/aggregation + framework indicators + report.
- A-006 Hosted open endpoint + ephemeral sandbox + rate limiting + deploy.

**Should (done):**
- A-007 Community files, CI, gitleaks, SECURITY/CONTRIBUTING/CoC.
- A-008 Landing page + `/.well-known/mcp` discovery.

**Could (next):**
- A-009 Publish to npm + MCP registry (blocked on auth) — see deferred register.
- A-010 Optional authenticated durable sessions.
- A-011 Full points-of-focus enumeration.
- A-012 Deployed-URL integration test in CI.

**Won't (this release):** ERP/GRC integrations; multi-tenant persistence.

## Dependency Map

- SDK/runtime: `@modelcontextprotocol/server`, `@modelcontextprotocol/node`,
  `zod` (runtime); `@modelcontextprotocol/client`, `vitest`, `typescript`
  (dev).
- Deploy: Vercel (project `coso-mcp`) ← GitHub `simonmak-ascent/coso-mcp`.
- DNS: Alibaba Cloud DNS (`ascent-partners.com`) → CNAME → Vercel.

## Infrastructure Requirements

- Compute: SWAS boxes for verification (`cs run`), never local.
- Hosting: Vercel serverless (Node 24), region `hkg1`/`iad1`.
- Domain/TLS: `internal-control.ascent-partners.com` (Vercel-managed cert).
- No database required (ephemeral hosted; file store local).

## Human-Decision Register

| Id | Item | Status |
|---|---|---|
| HD-1 | npm + MCP registry publish | Pending account auth (npm login / `mcp-publisher login github`) |
| HD-2 | Optional durable sessions for authenticated callers | Deferred |
