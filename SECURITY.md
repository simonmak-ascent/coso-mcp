# Security Policy

## Reporting a vulnerability

Please report security issues **privately** — do not open a public issue.

- Email: simon.pl.mak@gmail.com (subject: `[coso-mcp security]`)
- Or use GitHub's private vulnerability reporting for this repository.

Include reproduction steps, affected version/commit, and impact. We aim to
acknowledge within 72 hours and to ship a fix or mitigation as quickly as
practical.

## Scope

In scope: the MCP server (stdio and the hosted endpoint), tool input validation,
the ephemeral sandbox isolation, rate limiting, and any data-exposure path.

## Design guarantees

- **Zod validation on every tool input/output**; declared size caps for uploaded
  population/evidence files.
- **Hosted writes are ephemeral and isolated** — per-session sandbox with TTL and
  no cross-session access; nothing persists beyond the session.
- **Rate limiting** per client on the public endpoint; abuse is logged.
- **No secrets in the repository** — environment only; `gitleaks` runs in
  pre-commit and CI; logs are redacted.
- **Deterministic, bounded outputs** — no unbounded dumps; paginated results.

## Out of scope

- The correctness of a user's control design, sample rationale or conclusion —
  the server assists with methodology and does not provide audit or legal advice.
