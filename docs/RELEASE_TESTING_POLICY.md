# Release Testing Policy

Status: Active  
Last updated: 2026-03-01  
Owner: Website Engineering

## Mandatory Rule

Do not promote or merge website changes without passing functional tests.

If functional testing is not complete, release is blocked.

## Required Automated Gates

All pull requests to `main` must pass:

1. `checks` workflow job
2. `portal-auth-tests`
3. `booking-availability-tests`

The `checks` job must include:

1. `scripts/check-site.sh`
2. `tests/functional-smoke.test.js`

## Required Functional Coverage (Minimum)

Each release must verify:

1. Booking form loads and critical controls are present.
2. Booking API wiring exists (`availability` and `booking` endpoints).
3. Google Calendar fallback booking link exists and is safe (`noopener noreferrer`).
4. Contact form endpoint wiring exists.
5. Analytics event mapping exists for fallback booking CTA.

## Local Pre-PR Commands

Run these before opening or updating a PR:

```bash
bash scripts/check-site.sh
npm run test:functional-smoke
npm run test:booking-availability
npm run test:portal-auth
```

## Post-Deploy Smoke Validation

After merge to `main`, verify live site:

1. Homepage returns `HTTP 200`.
2. Booking section renders with slot controls.
3. Fallback booking link opens Google Calendar.
4. Contact form UI loads without JS errors.

## Evidence Requirement

PR description must include:

1. Commands run and pass/fail results.
2. Any manual smoke checks performed.
3. Known residual risk (if any).

