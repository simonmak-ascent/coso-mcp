## Summary

<!-- What changes and why. Reference the VDD action item / spec when relevant (e.g. A-003). -->

- Spec / action item: A-___
- Impact chain: V → S → T → SP → PL → TK

## Changes

<!-- Bullet the substantive changes. -->

## Verification

- [ ] `cs run "pnpm check"` passes (typecheck + tests)
- [ ] `cs run "pnpm build"` succeeds (Vercel function imports `dist/`)
- [ ] No secrets committed (env only; `gitleaks` green)
- [ ] VDD artifacts updated if behaviour/spec changed (`vdd/specs/...`)
- [ ] Disclaimer intact on assessment/report surfaces

## Notes for reviewers

<!-- Risks, follow-ups, rollout/rollback. -->
