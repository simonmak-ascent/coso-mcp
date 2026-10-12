# Operations

Operational notes for the hosted endpoint at
`https://internal-control.ascent-partners.com/mcp`.

## Deployment

- **Platform:** Vercel (team `simonmak-ascent`, "AP Team").
- **Function:** `api/mcp.js` — serverless MCP endpoint; `vercel.json` rewrites
  `/mcp` → `/api/mcp`.
- **Domain:** `internal-control.ascent-partners.com` added as a Vercel project
  domain. DNS is managed at **Alibaba Cloud DNS** (`ns7/ns8.alidns.com`); the
  subdomain record points at Vercel, which terminates TLS.

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

- Redeploy the previous Vercel deployment (deployments are immutable and
  promotable). No persistent state to migrate — sessions are ephemeral.

## Secrets

- Environment only. Never commit `.env*`. `gitleaks` runs in CI.
