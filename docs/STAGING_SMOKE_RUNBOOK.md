# Staging Smoke Runbook

## Purpose
Run a fast, repeatable smoke check before merge and before production promotion.

## Prerequisites
- Node.js 24 available.
- Dependencies installed (`npm ci`).
- Chromium installed for Playwright (`npx playwright install chromium`).

## Automated Gates
Run these commands from the repo root:

```bash
./scripts/check-site.sh
npm run test:portal-auth
node --test tests/functional-smoke.test.js
npm run test:playwright
```

## Manual UI Checklist
Use this list when validating a staging deployment URL:

1. Open `/portal-login.html`.
2. Confirm expected auth mode banner appears:
   - Production host: password login disabled, Cognito SSO required.
   - Non-production host: preview password login enabled.
3. Submit invalid preview email domain and verify error message.
4. Sign in with valid credentials for active mode and verify redirect to `/management-dashboard.html`.
5. Confirm dashboard renders KPI cards and moderation panel.
6. If logged in with preview session, confirm moderation panel shows SSO requirement warning.
7. If logged in with Cognito session, verify review queue fetches and moderation buttons send decisions.
8. Validate booking/contact flows from homepage contact section.

## Release Decision
- GO: all automated gates pass and all manual checks pass.
- NO-GO: any gate fails, or any auth/dashboard flow is broken.

