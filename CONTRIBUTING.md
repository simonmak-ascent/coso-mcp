# Contributing

Thanks for helping improve `coso-mcp`.

## Ground rules

- The COSO reference data is **paraphrased from public COSO descriptions** — never
  paste licensed COSO framework text, and never invent principles or points of
  focus. If in doubt, leave it out and open an issue.
- **No fabricated data.** Reference/lookup content is seeded only from COSO's own
  wording; review records come only from user-supplied inputs.
- Keep the server **framework-/methodology-native**: no bespoke ERP/GRC
  integrations in v1 (inputs are uploaded/declared).
- The server assists with methodology — it does not provide audit or legal advice.
  Keep the disclaimer on assessment/report surfaces.

## Development

Compute runs on a box, never locally:

```bash
cs run "pnpm install"
cs run "pnpm check"        # typecheck + tests
cs run "pnpm build"        # tsc
```

- TypeScript strict; Zod schemas for every tool input/output; named exports.
- Co-locate types with the code that uses them.
- Tests live in `test/` and use throwaway fixture directories only.

## Pull requests

- Keep changes scoped; reference the relevant VDD action item / spec when there is
  one (e.g. `A-003`).
- Ensure `cs run "pnpm check"` and `cs run "pnpm build"` pass.
- No secrets committed (`gitleaks` green).
- Update `vdd/` artifacts and `CHANGELOG.md` when behaviour changes.

By contributing you agree your contributions are licensed under the
[MIT License](./LICENSE).
