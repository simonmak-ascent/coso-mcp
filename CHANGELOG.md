# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1] — 2026-10-12

### Changed

- Published to npm (`@simonmak-ascent/coso-mcp@0.1.1`, latest) and to the MCP
  registry as `io.github.simonmak-ascent/coso-mcp@0.1.1`.
- Hosted endpoint redeployed at `https://internal-control.ascent-partners.com/mcp`
  reporting `0.1.1`.

## [Unreleased]

### Added

- P0 scaffold: TypeScript ESM package, MCP server over stdio
  (`@modelcontextprotocol/server` + Zod 4), `get_server_info` tool, Vitest
  setup, MIT license, house community files, and the MCP registry manifest.
- P1 reference engine: COSO ICIF-2013 data (5 components, 17 principles,
  paraphrased points of focus, 3 objective categories) with read tools
  (`list_components`, `list_principles`, `get_principle`, `get_component`,
  `list_objective_categories`), the `coso://framework/icif-2013` resource, and
  five workflow prompts.
- P2 engagement/planning: Zod domain schemas (engagement, scope, risk, control,
  audit event, assertions), a file-backed engagement store, and tools
  (`create_engagement`, `get_engagement`, `list_engagements`, `add_scope_item`,
  `list_scope_items`, `register_risk`, `list_risks`, `register_control`,
  `list_controls`, `get_audit_log`), plus the `coso://engagement/{id}` resource
  and `list_assertions`. End-to-end tests run over an in-memory MCP transport.
- P3 sampling/testing: population, sample and test-result/exception schemas; a
  deterministic sample-size guide (frequency × risk) and seeded
  random/systematic/haphazard selection (plus targeted); tools
  (`compute_sample_size`, `create_population`, `list_populations`,
  `select_sample`, `record_test_result`, `list_test_results`, `note_exception`,
  `list_exceptions`).
- P4 workpapers/review: workpaper and review-note schemas; a Markdown workpaper
  renderer; tools (`assemble_workpaper`, `list_workpapers`, `get_workpaper`,
  `add_review_note`, `resolve_review_note`, `sign_off`, `get_activity_log`).
  Sign-off warns (never blocks) when the same person prepared and reviewed.
- P5 deficiency & assessment: deficiency schema with a deterministic
  likelihood × magnitude classifier and aggregation; data-driven COSO
  principle/component coverage indicators and a framework integration check; a
  Markdown engagement report. Tools: `classify_deficiency`, `list_deficiencies`,
  `aggregate_deficiencies`, `assess_principle`, `assess_component`,
  `framework_integration_check`, `generate_report`.
- P6 hosted endpoint: ephemeral in-memory sandbox store, per-client rate
  limiting, a Node streamable-HTTP handler with idle session eviction, the
  Vercel entrypoints (`api/mcp.js`, `api/well-known.js`), a landing page and
  `/.well-known/mcp` discovery. Deployed to
  `https://internal-control.ascent-partners.com/mcp` (open access; writes are
  ephemeral). `server.json` is registry-valid; npm/registry publishing is
  pending account authentication.

[Unreleased]: https://github.com/simonmak-ascent/coso-mcp/commits/main
