# Spec — COSO ICIF-2013 internal-control review

> Impact Chain: V → S → T → SP → PL → TK
> Action item: A-001…A-006 (feature: `icif-2013-review`)

## Summary

Enable an MCP client to run a complete internal-control review under COSO
ICIF-2013: from framework reference and scoping through sampling, testing,
workpapers, sign-off, deficiency evaluation and reporting — over local stdio
(file store) or the hosted open endpoint (ephemeral store).

## User Stories

- **US-1** As an auditor, I read the framework (components, principles, points of
  focus, assertions) so my review is anchored to the standard.
- **US-2** As an auditor, I register scope, risks and controls and link them.
- **US-3** As a tester, I create a population, get a sample size, select a
  reproducible sample, record attribute results and note exceptions.
- **US-4** As a preparer/reviewer, I assemble a workpaper, add/resolve review
  notes, and sign off (with a warning if the same person does both).
- **US-5** As a reviewer, I classify/aggregate deficiencies, view COSO coverage
  indicators, and generate the report.

## Boundaries

- **Always:** paraphrase COSO wording; compute sampling/deficiency logic
  deterministically; carry the disclaimer on assessment/report surfaces; validate
  every tool input with Zod.
- **Ask:** never silently — surface a warning (e.g., same-person sign-off) rather
  than blocking.
- **Never:** paste licensed COSO text; invent principles/points of focus;
  fabricate review data; present the output as audit or legal advice; persist
  hosted writes.

## Acceptance Criteria

- **AC-1** Given no filter, When `list_principles` is called, Then exactly 17
  principles are returned, each mapped to a known component.
- **AC-2** Given a control frequency and risk, When `compute_sample_size` is
  called, Then the recommendation follows the published table and is capped at
  the population size.
- **AC-3** Given identical inputs and seed, When `select_sample` is called twice,
  Then the selected references are identical.
- **AC-4** Given a material magnitude and more-than-remote likelihood, When
  `classify_deficiency` is called, Then severity is `material-weakness`.
- **AC-5** Given a workpaper where one actor signs preparer and reviewer, When
  `sign_off` is called for the second role, Then a warning is returned and the
  sign-off is still recorded (status `approved`).
- **AC-6** Given an engagement with a control mapped to a principle and a
  deficiency on that control, When `assess_principle` is called, Then status is
  `indicators-of-gap`.
- **AC-7** Given any engagement, When `generate_report` is called, Then the
  Markdown includes scope, risks, controls, testing, deficiencies, COSO coverage
  and the disclaimer.
- **AC-8** Given the hosted endpoint, When a client initialises and then calls
  tools across requests with its session id, Then state persists within the
  session and is never written to durable storage.

### Edge cases

- **AC-E1** An unknown engagement id returns a tool error, not a crash.
- **AC-E2** A population larger than the cap is rejected.
- **AC-E3** An unknown session id returns HTTP 404.
- **AC-E4** Exceeding the rate limit returns HTTP 429.

## Non-Functional Requirements

- Determinism: same inputs ⇒ same outputs (seeded PRNG).
- Security: Zod validation, bounded inputs, rate limiting, ephemeral sessions.
- Interoperability: stdio and streamable HTTP; MCP v2 SDK.
- Portability: Node ≥20, ESM; no native deps beyond the SDK's tree.

## MoSCoW

- Must: US-1…US-5, AC-1…AC-8.
- Should: landing page, discovery, CI, community files (delivered).
- Could: npm/registry publish; durable sessions; full points of focus.
- Won't: ERP/GRC integrations; multi-tenant persistence.

## Impact Verification

Every principle/tool traces to a framework component and an audit assertion; the
report and assessment surfaces carry the disclaimer; the hosted endpoint performs
no persistence.
