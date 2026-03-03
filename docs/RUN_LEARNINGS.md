# Run Learnings and Execution Rules

## Rules

1. All infrastructure changes must be implemented through Terraform and version-controlled in Git.
2. Every execution run must append a concise learning entry in this file before completion.
3. Each learning entry must include date, scope, what changed, validation evidence, and follow-up actions.

## Run Log

| Date | Scope | What Changed | Validation Evidence | Follow-up |
|---|---|---|---|---|
| 2026-03-03 | Insights publishing | Published SAS Viya Phase 00 article and updated compliance framing (APRA, Essential Eight, PCI DSS), plus insights index and sitemap links. | `bash scripts/check-site.sh` passed; link/keyword checks passed for article, `insights.html`, and `sitemap.xml`. | Validate production URL and metadata preview after merge/deploy. |
