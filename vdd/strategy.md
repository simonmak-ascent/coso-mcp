# Strategy

> Impact Chain: Phase 2 — Strategy

## Strategic Pillars

1. **Standards-native.** COSO ICIF-2013 is modelled as a first-class reference
   engine (5 components, 17 principles, points of focus) — not free text.
2. **Full lifecycle, not data retrieval.** The server runs the review; it does
   not merely expose a vendor's records.
3. **Deterministic and auditable.** Sampling and deficiency math are computed and
   reproducible; conclusions trace to evidence.
4. **Open by default.** MIT, open endpoint, npm — distribution no gated vendor
   can match.
5. **Safety by architecture.** Ephemeral, isolated, rate-limited sessions; no
   persistence, no cross-tenant leakage.

## Competitive Analysis

**Positioning.** the only open, COSO/ICFR-native, write-capable MCP that runs the
*entire* internal-control review lifecycle. Existing servers either expose a
vendor's GRC records (read-mostly, proprietary, product-shaped) or cover
ISO 27001/security controls. None performs a traceable COSO review.

| Dimension | coso-mcp | Vendor GRC MCPs (Workiva, Vanta, Drata, Optro, OpenPages, LogicGate…) | Community MCPs (iso27001-mcp, unidoc/isms, mcp-server-scf, gigachad-grc) | AI skills (sox-testing / audit-support) |
|---|---|---|---|---|
| COSO ICIF-2013 native (5 / 17 / points of focus) | Yes | No (product objects) | No (ISO/SCF-shaped) | Text only |
| Full lifecycle to signed workpaper | Yes | No — retrieval; Workiva GRC tools are read-only | Planning/findings at best | Templates, not executable |
| Write/stateful workpapers + sign-off + audit trail | Yes | Mostly read | No | No |
| Framework effectiveness (present & functioning) | Yes (indicators) | No | No | No |
| Deterministic, reproducible computation | Yes | Partial | No | No (freeform) |
| Open source + open access | Yes | Paid platform + licence | Some OSS | Not a server |

**The moat.**

1. **Lifecycle layer, not data layer** — sits on top of Workiva/Vanta/Drata
   rather than competing for their data; complements incumbents.
2. **Standards-grounded and auditable** — outputs trace to COSO principles and
   PCAOB AS 2201 terms; sampling/deficiency math is computed, not improvised.
3. **Openness as distribution** — MIT + npm + registry + public endpoint.
4. **First-mover on a real gap** — no publicly documented MCP delivers an
   auditor-ready, reviewer-approved COSO/ICFR workflow.
5. **Safety by architecture** — ephemeral per-session sandbox.
6. **Depth** — deficiency aggregation, CEAVOP assertion mapping, COSO
   component-level coverage indicators.

**Honest boundaries.** Not a GRC system of record; not audit/legal advice; no
live ERP/GRC integrations in v1. Incumbents have richer live data; the edge is
the open, standards-native methodology engine plus distribution.

## Risk Register

| Id | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| RSK-1 | COSO licensing/IP misuse (pasting framework text) | Low | High | Paraphrase only; provenance notice; review before publish |
| RSK-2 | Misread as audit advice | Medium | High | Disclaimer on every assessment/report surface |
| RSK-3 | Hosted endpoint abuse / cost | Medium | Medium | Rate limiting, size caps, ephemeral sessions, TTL eviction |
| RSK-4 | Non-deterministic "mapping" creeping in | Medium | Medium | Only computed/deterministic logic; no model-invented mappings |
| RSK-5 | Serverless session state lost on cold start | Medium | Low | Best-effort in-memory sessions; documented; stateless-safe tools |
| RSK-6 | Publishing blocked on account auth | High | Low | Documented; manifest validated; publish when auth is refreshed |
| RSK-7 | Scope creep into ERP/GRC integrations | Medium | Medium | v1 accepts uploaded/declared inputs only |
| RSK-8 | Dependency/SDK drift (MCP v2 line) | Low | Medium | Pin ranges; CI typecheck/test on every change |
