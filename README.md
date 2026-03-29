# WaterApps — Enterprise DevOps & Cloud Consulting

Official website for **Water Apps Pty Ltd** — DevOps transformation, platform engineering, and compliance automation for Australia's most regulated industries.

Live site: [www.waterapps.com.au](https://www.waterapps.com.au)

---

## Architecture

Static HTML/CSS/JS site with release-stamped deployment bundles. GitHub Pages remains the public recovery path, while CloudFront is the target production delivery path.

```
Browser → GitHub Pages (waterapps.com.au) → HTML/CSS/JS
                                           → Website Guide Agent (guided site assistant)
                                           → Contact Form → AWS API Gateway → Lambda → SES
                                           → Portal Login → Auth gate (JWT, client-side)
                                           → Management Dashboard (protected)
```

**DNS**: GoDaddy (not Route 53). `www` CNAME → `water-apps.github.io`, apex A records → GitHub Pages IPs.

**Hosting dependency**: The repo must remain **public** while GitHub Pages is the origin. Do not change repo visibility to private without first migrating hosting to CloudFront. See [`docs/DEPLOYMENT_GUIDE.md`](docs/DEPLOYMENT_GUIDE.md).

---

## Pages

| Page | Path | Notes |
|---|---|---|
| Homepage | `index.html` | Primary conversion page |
| Website Guide Agent | `index.html` | Guided site assistant embedded in homepage |
| Architecture Library | `index.html#architecture-library` | Public reference-architecture section with reusable D2 diagrams |
| Insights library | `insights.html` + `insights-*.html` | ~20 articles |
| Capability statement | `capability-statement.html` | PDF download variant available |
| Enterprise readiness | `enterprise-readiness.html` | Buyer-facing trust page |
| AI use assurance | `ai-use-assurance.html` | |
| Quality engineering | `quality-engineering.html` | |
| Portal login | `portal-login.html` | JWT-gated auth page |
| Management dashboard | `management-dashboard.html` | Protected |
| SchedulEase | `schedulease.html` | Booking product page |
| Privacy / Terms | `privacy.html`, `terms.html` | |

---

## CI/CD

All changes flow through pull request → CI → merge to `main` → auto-deploy.

| Workflow | Trigger | Purpose |
|---|---|---|
| `site-quality.yml` | push to `main`, PR | Static quality checks + portal auth unit tests |
| `deploy-pages.yml` | push to `main`, manual | Deploy to GitHub Pages |
| `owasp-zap-baseline.yml` | scheduled | OWASP ZAP security baseline scan |
| `deploy-cloudfront.yml` | successful `Site Quality` on `main`, manual | Deploy stamped bundle to S3 + invalidate CloudFront |

**Required checks on `main`**: `site-quality` must pass before merge.

---

## Release flow

1. Branch from `main` — use a clean checkout or worktree, not the local `main` directly
2. Make changes, push, open PR
3. Wait for `site-quality` to pass
4. Merge to `main` — GitHub Pages deploys within 1–2 minutes with a stamped release bundle
5. After `Site Quality` succeeds on `main`, CloudFront deploys the same release automatically when production variables/secrets are configured
6. Use manual `deploy-cloudfront.yml` only for dry runs, backfills, or explicit redeploys of an approved ref
7. Verify at [https://www.waterapps.com.au](https://www.waterapps.com.au) and confirm `/release.json`
8. Run smoke test if contact form or portal auth was changed: [`docs/STAGING_SMOKE_RUNBOOK.md`](docs/STAGING_SMOKE_RUNBOOK.md)

## Release metadata

Every deployment bundle now includes:
- `release.json`
- `release.txt`

These files expose the deployed commit SHA, release version string, build timestamp, target, and workflow run metadata.

For CloudFront deployments, the workflow also stores an immutable copy of the bundle under:

`s3://<frontend-bucket>/releases/<commit-sha>/`

That gives WaterApps a cleaner rollback path and a verifiable release record without depending on rebuilding from the branch later.

---

## Contact form

The contact/booking form posts to the WaterApps serverless API (`waterapps-contact-form` repo).

Endpoint is configured via `window.WATERAPPS_CONFIG.contactApiEndpoint` or the `data-api-endpoint` attribute on `#contact-form` in `index.html`.

Expected responses: `200` success, `400` field errors, `403` origin mismatch, `429` throttle, `500` fallback.

The homepage also includes the Website Guide Agent MVP. In the current phase it is a structured guided assistant that recommends pages and can prefill a summary into the existing contact path. Pilot plan: [`docs/WEBSITE_GUIDE_AGENT_PILOT_PLAN.md`](docs/WEBSITE_GUIDE_AGENT_PILOT_PLAN.md).

---

## Local development

No build pipeline. Open any HTML file directly or serve with a static server:

```bash
npx serve .
# or
python3 -m http.server 8080
```

CSS is pre-compiled Tailwind checked into `assets/css/tailwind.generated.css`. To rebuild after Tailwind class changes:

```bash
npm install
npm run build:css
```

---

## Key docs

| Doc | Purpose |
|---|---|
| [`docs/DEPLOYMENT_GUIDE.md`](docs/DEPLOYMENT_GUIDE.md) | Deploy steps, GitHub Pages config, CloudFront migration path |
| [`docs/WEBSITE_GUIDE_AGENT_PILOT_PLAN.md`](docs/WEBSITE_GUIDE_AGENT_PILOT_PLAN.md) | MVP scope, estimate, test path, and pilot plan for the guided website assistant |
| [`docs/STAGING_SMOKE_RUNBOOK.md`](docs/STAGING_SMOKE_RUNBOOK.md) | Post-deploy smoke test procedure |
| [`docs/RELEASE_TESTING_POLICY.md`](docs/RELEASE_TESTING_POLICY.md) | Release gate policy |
| [`docs/cloudflare-security-headers-rollout.md`](docs/cloudflare-security-headers-rollout.md) | Security header improvement via Cloudflare |
| [`docs/token-key-management-standard.md`](docs/token-key-management-standard.md) | Token/key security standard |

---

## Ownership

**Owner**: Varun Kaushik — Water Apps Pty Ltd (ABN 63 632 823 084)
**Repo**: [github.com/water-apps/waterapps-site](https://github.com/water-apps/waterapps-site)
**Contact**: varun@waterapps.com.au
