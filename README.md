# coso-mcp

[![npm](https://img.shields.io/npm/v/@simonmak-ascent/coso-mcp.svg)](https://www.npmjs.com/package/@simonmak-ascent/coso-mcp)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![MCP](https://img.shields.io/badge/MCP-compatible-purple.svg)](https://modelcontextprotocol.io)

An open **Model Context Protocol** server for internal-control reviews under the
**COSO Internal Control—Integrated Framework (ICIF-2013)**. It covers the full
review lifecycle — scope → risk assessment → control register → population →
sampling → testing → workpapers → review sign-off → deficiency evaluation →
report — grounded in the framework's 5 components, 17 principles and points of
focus.

- **Local:** runs over stdio (`npx @simonmak-ascent/coso-mcp`).
- **Hosted:** public endpoint at **https://internal-control.ascent-partners.com/mcp**
  (reference + read tools, plus an ephemeral per-session sandbox for the full
  write lifecycle — nothing persists).

> **Not audit or legal advice.** This server assists with internal-control review
> methodology. All workpapers and assessments must be reviewed by qualified
> professionals before use in audit documentation.

## Why this exists (competitive advantage)

Existing MCP servers either expose a vendor's GRC records (read-mostly,
proprietary, product-shaped) or cover ISO 27001 / security controls. None *runs*
a traceable COSO review. `coso-mcp` is the first **COSO/ICFR-native,
write-capable, open** MCP for the whole lifecycle.

| Dimension | coso-mcp | Vendor GRC MCPs (Workiva, Vanta, Drata, Optro, OpenPages, LogicGate…) | Community MCPs (iso27001-mcp, unidoc/isms, mcp-server-scf…) | AI skills (sox-testing / audit-support) |
|---|---|---|---|---|
| COSO ICIF-2013 native (5 components / 17 principles / points of focus) | ✅ core engine | ❌ product objects | ❌ ISO/SCF-shaped | ⚠️ text only |
| Full lifecycle to signed workpaper | ✅ | ❌ retrieval; Workiva GRC tools are read-only | ❌ planning/findings at best | ⚠️ templates, not executable |
| Write/stateful workpapers + preparer/reviewer sign-off + audit trail | ✅ | ❌ mostly read | ❌ | ❌ |
| Framework effectiveness (principle/component *present & functioning*) | ✅ | ❌ | ❌ | ❌ |
| Deterministic, reproducible computation (sample-size tables, seeded selection) | ✅ | partial | ❌ | ❌ (freeform) |
| Open source + open access (MIT, public endpoint, no account) | ✅ | ❌ paid platform | ⚠️ some OSS | ⚠️ not a server |

**Moat:** it is the *lifecycle layer, not the data layer* — it can sit on top of
Workiva/Vanta/Drata rather than compete for their data; its sampling and
deficiency math are computed, not improvised; and openness gives zero-friction
distribution no gated vendor can match.

## Tools

| Tool | Kind | Purpose |
|---|---|---|
| `get_server_info` | read | Server identity, framework coverage, disclaimer. |
| `list_components` | read | The five COSO components. |
| `list_principles` | read | The 17 principles (optionally filtered by component). |
| `get_principle` | read | A principle by number or slug, with paraphrased points of focus. |
| `get_component` | read | A component by id, with its principles. |
| `list_objective_categories` | read | Operations / reporting / compliance. |
| `list_assertions` | read | The CEAVOP assertions used to frame control objectives. |
| `create_engagement` | write | Create a review engagement. |
| `get_engagement` | read | Get an engagement by id. |
| `list_engagements` | read | List engagements. |
| `add_scope_item` | write | Add a significant account/process to scope. |
| `list_scope_items` | read | List scope items. |
| `register_risk` | write | Register a risk to objectives (likelihood, assertions, principles, fraud). |
| `list_risks` | read | List registered risks. |
| `register_control` | write | Register a control (type, frequency, linked risks, assertions). |
| `list_controls` | read | List registered controls. |
| `get_audit_log` | read | Append-only audit events for an engagement. |
| `compute_sample_size` | read | Recommended sample size from frequency × risk, with rationale. |
| `create_population` | write | Register a population (item list or declared size, bounded). |
| `list_populations` | read | List populations. |
| `select_sample` | write | Seeded, reproducible sample selection (random/systematic/targeted/haphazard). |
| `record_test_result` | write | Record attribute-level outcomes (pass/fail/na) and a conclusion. |
| `list_test_results` | read | List test results. |
| `note_exception` | write | Record an exception with root cause and impact. |
| `list_exceptions` | read | List exceptions. |
| `assemble_workpaper` | write | Assemble a Markdown control-testing workpaper. |
| `list_workpapers` | read | List workpapers. |
| `get_workpaper` | read | Get a workpaper with its Markdown. |
| `add_review_note` | write | Add a reviewer note. |
| `resolve_review_note` | write | Resolve a reviewer note. |
| `sign_off` | write | Preparer/reviewer sign-off (warns on same-person independence). |
| `get_activity_log` | read | Append-only activity log for an engagement. |
| `classify_deficiency` | write | Classify a deficiency (deficiency / significant / material weakness). |
| `list_deficiencies` | read | List deficiencies. |
| `aggregate_deficiencies` | read | Group and flag deficiencies that may aggregate. |
| `assess_principle` | read | Coverage indicators for one COSO principle. |
| `assess_component` | read | Coverage indicators for one COSO component. |
| `framework_integration_check` | read | Check all five components have coverage. |
| `generate_report` | read | Generate the Markdown review report. |

Resources: `coso://framework/icif-2013` (framework reference),
`coso://engagement/{id}` (engagement bundle: scope, risks, controls).
Prompts: `scope-review`, `assess-risk`, `build-control-matrix`,
`draft-test-workpaper`, `evaluate-deficiencies`.

## Usage

### Local (stdio)

```bash
npx -y @simonmak-ascent/coso-mcp
```

Claude Desktop / generic MCP client config:

```json
{
  "mcpServers": {
    "coso": {
      "command": "npx",
      "args": ["-y", "@simonmak-ascent/coso-mcp"]
    }
  }
}
```

### Hosted (streamable HTTP)

```
https://internal-control.ascent-partners.com/mcp
```

The hosted endpoint is open. Write operations run in an ephemeral, isolated,
rate-limited per-session sandbox and are not persisted.

## Development

Compute runs on a box, never locally: `cs run "<cmd>"`.

```bash
pnpm install
pnpm typecheck
pnpm test
pnpm test:coverage
pnpm build        # tsc
```

## Security

See [SECURITY.md](./SECURITY.md). Report vulnerabilities privately — do not open
a public issue.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) and the
[Code of Conduct](./CODE_OF_CONDUCT.md).

## License

[MIT](./LICENSE) © Simon Mak / Ascent Partners Group Limited.
