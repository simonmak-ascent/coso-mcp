# Vision

> Impact Chain: Phase 1 — Vision

## Impact Model

**Goal.** Make a defensible, standards-grounded COSO internal-control review
accessible to anyone, through an open MCP server that runs the full lifecycle —
scope → risk → controls → population → sampling → testing → workpapers →
sign-off → deficiency evaluation → report.

**Actors.**

- Internal-audit / SOX / ICFR practitioners without a GRC platform.
- Consultancies running control reviews on behalf of clients.
- Builders who want a composable COSO review layer over existing GRC tools.
- AI agents/clients (Claude and other MCP hosts) acting on a practitioner's behalf.

**Impacts.**

- Practitioners run a framework-native review with deterministic sampling and
  deficiency math instead of ad-hoc spreadsheets and freeform prompts.
- Review evidence and conclusions trace to COSO principles and ICFR severity
  terms, so workpapers are defensible in an audit file.
- Zero-friction adoption (open source, open hosted endpoint, npm) removes the
  procurement barrier that gated this capability behind paid GRC platforms.

## Stakeholder Map

| Stakeholder | Interest | Influence |
|---|---|---|
| Practitioners (auditors, controllers) | A usable, correct review workflow | High (adoption) |
| Reviewers / those charged with governance | Evidence, sign-off, independence | High (acceptance) |
| Builders / MCP clients | Discoverable, well-shaped tools | High (reach) |
| Maintainer (Ascent Partners) | Credible open tooling, standards fidelity | High |
| Framework owner (COSO) | No misrepresentation of licensed text | Medium (legal) |

## Success Metrics

**Leading.** npm installs; hosted endpoint sessions; GitHub stars/forks;
tool-call volume per session; coverage of the 39-tool surface.

**Lagging.** Reviews completed end-to-end via the server; workpapers produced;
citations/adoption in audit toolchains; community contributions.

## Constraints & Boundaries

- **Standards fidelity:** the COSO reference data is paraphrased; no licensed
  framework text; no invented principles or points of focus.
- **No fabricated data:** review records come only from user inputs; missing data
  stays absent.
- **Not advice:** the server assists with methodology; not an audit opinion or
  legal advice.
- **No bespoke integrations (v1):** inputs are uploaded/declared.
- **Open + ephemeral:** the hosted endpoint is open; writes are ephemeral and
  never persisted.

## Target Domains

- internal-control / ICFR / SOX 404
- COSO ICIF-2013 (five components, 17 principles, points of focus)
- audit methodology (sampling, testing, workpapers, deficiency evaluation)
- open-access MCP tooling
