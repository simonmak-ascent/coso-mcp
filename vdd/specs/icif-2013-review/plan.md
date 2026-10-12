# Plan — `icif-2013-review`

> Impact Chain: V → S → T → SP → PL → TK

## Component Breakdown

| Component | Module(s) | Responsibility |
|---|---|---|
| Reference engine | `src/framework/*`, `src/tools/reference.ts` | ICIF-2013 data, framework resource, CEAVOP |
| Domain schemas | `src/domain/*` | Zod contracts for every record |
| Stores | `src/store/{types,file-store,memory-store,ids}.ts` | Local file + hosted ephemeral, one interface |
| Planning tools | `src/tools/engagement.ts` | Engagement, scope, risk, control |
| Sampling/testing | `src/util/sampling.ts`, `src/tools/testing.ts` | Sample size + seeded selection + attribute tests |
| Workpapers/review | `src/render/workpaper.ts`, `src/tools/workpaper.ts` | Assembly, notes, sign-off, activity log |
| Deficiency/assessment | `src/util/{deficiency,assessment}.ts`, `src/tools/assessment.ts` | Classification, aggregation, coverage, report |
| Hosted surface | `src/http.ts`, `src/security/rate-limit.ts`, `api/*` | Streamable HTTP, sessions, rate limiting |

## AC Coverage Map

| AC | Covered by |
|---|---|
| AC-1 | `test/framework.test.ts`, `list_principles` |
| AC-2 | `test/sampling.test.ts` (`computeSampleSize`) |
| AC-3 | `test/sampling.test.ts` (determinism) |
| AC-4 | `test/deficiency.test.ts` (`classifyDeficiency`) |
| AC-5 | `test/integration.test.ts` (sign-off warning) |
| AC-6 | `test/assessment.test.ts`, integration |
| AC-7 | `test/render.test.ts` (report), integration |
| AC-8 | `test/http.test.ts` (session persistence) |

## Technology Choices

- TypeScript (strict, ESM/NodeNext), Zod 4, MCP v2 SDK
  (`@modelcontextprotocol/server`, `@modelcontextprotocol/node`,
  `@modelcontextprotocol/client` for tests).
- Vitest for unit + in-memory-transport + HTTP tests.
- Vercel (Node) for hosting; Alibaba Cloud DNS for the domain.

## Verification Toolchain

- `cs run "pnpm check"` — typecheck (`tsc --noEmit`) + tests (Vitest).
- `cs run "pnpm build"` — `tsc` (dist consumed by Vercel).
- CI (`ci.yml`) mirrors the above on push/PR.
- Live probe: `initialize` + `tools/list` + `create_engagement`/`get_engagement`
  against the hosted URL.
