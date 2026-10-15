# Operations

Operational notes for the hosted endpoint at
`https://internal-control.ascent-partners.com/mcp`.

## Deployment

- **Platform:** Alibaba Cloud ECS **`ecs-01`** (edge node), behind Caddy.
- **Runtime:** `server.mjs` — a long-running Node HTTP server (systemd
  `coso-mcp@<slot>`), exposing `/mcp` (streamable-http), `/.well-known/mcp`
  and the static `public/` site. `createRequestHandler()` in `src/http.ts` is
  the shared handler; `server.mjs` mirrors the old `vercel.json` rewrites.
- **Slots:** blue `:8070`, green `:8071` (preview `:8072`), switched behind Caddy.
- **Domain:** `internal-control.ascent-partners.com` resolves to the node via the
  `*.ascent-partners.com` wildcard (DNS at **Alibaba Cloud DNS**); Caddy
  terminates TLS with the site wildcard certificate.
- **CD:** `.github/workflows/deploy.yml` → `app-cd.yml` (self-hosted runner
  `apg-ecs-01`), driven by `.deploy/apps.yaml` (`kind: node-service`).

## Access model

- The endpoint is **open** (no account required).
- **Read/reference tools** return COSO framework data.
- **Write tools** (engagement, testing, workpapers, sign-off, deficiency) run in
  an **ephemeral per-session sandbox**: isolated, TTL-bounded, never persisted,
  no cross-session access.
- Per-client **rate limiting** and input size caps apply; abuse is logged.

## Health & observability

- Structured logs with secret redaction; no PII/secrets logged.
- Track request rate, error rate, sandbox creations, and rate-limit rejections.

## Rollback

- `bash .deploy/kinds/node-service.sh rollback` switches production back to the
  previous slot (`blue`/`green`). The CD workflow does this automatically when a
  deploy fails. No persistent state to migrate — sessions are ephemeral.

## Secrets

- Environment only. Never commit `.env*`. `gitleaks` runs in CI.
