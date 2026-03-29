# Operations Runbook

Status: Draft v1
Last updated: 2026-03-20

## Health Checks

1. Confirm the live homepage loads.
2. Confirm core navigation pages load without broken assets.
3. Confirm the contact form can reach the backend API.

## Common Failures

### Static site regression

Symptoms:

- broken layout
- missing assets
- JavaScript behavior fails on key pages

First response:

1. compare the deployed change against the last known-good revision
2. rerun site-quality checks
3. inspect browser console locally if the issue is script-related

### Contact form failure

Symptoms:

- submit fails
- origin error
- success state never appears

First response:

1. verify the backend endpoint is correct
2. confirm backend origin allowlist includes the current site origin
3. use the backend smoke-test runbook if needed

### Security header grade issue

Symptoms:

- header scan remains weak despite expected hardening

First response:

1. confirm whether traffic is still direct from GitHub Pages or routed through Cloudflare
2. recheck the Cloudflare rollout config
3. validate actual response headers with `curl -I`

## Evidence

Useful evidence sources:

1. GitHub workflow logs
2. browser/network checks
3. live site response headers
4. contact form backend smoke tests
