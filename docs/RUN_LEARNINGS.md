# Run Learnings and Execution Rules

## Rules

1. All infrastructure changes must be implemented through Terraform and version-controlled in Git.
2. Every execution run must append a concise learning entry in this file before completion.
3. Each learning entry must include date, scope, what changed, validation evidence, and follow-up actions.

## Run Log

| Date | Scope | What Changed | Validation Evidence | Follow-up |
|---|---|---|---|---|
| 2026-03-03 | Insights publishing | Published SAS Viya Phase 00 article and updated compliance framing (APRA, Essential Eight, PCI DSS), plus insights index and sitemap links. | `bash scripts/check-site.sh` passed; link/keyword checks passed for article, `insights.html`, and `sitemap.xml`. | Validate production URL and metadata preview after merge/deploy. |
| 2026-03-03 | Release execution | Rebuilt release on clean branch from `main` (`codex/insights-sasviya-phase00-publish`) and opened PR #36 to avoid long-lived branch conflicts. | PR checks all green (`checks`, `portal-auth-tests`, `booking-availability-tests`). | Merge is blocked by branch policy requiring 1 approving review from a writer; obtain approval then merge PR #36. |
| 2026-03-08 | Module UI test matrix | Split website testing into module-level suites for Marketing, Portal/Auth, Booking/Contact, and Management Dashboard; added `npm run test:modules` runner and executed the full matrix. | `npm run test:modules` passed after rerunning with elevated permissions; module gates green for static checks, unit tests, and Playwright e2e. | Keep module scripts as the default pre-release gate; in sandboxed agent sessions elevate before Playwright because the local web server must bind to `127.0.0.1:4173`. |
