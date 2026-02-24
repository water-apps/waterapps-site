# Cloudflare Security Headers Rollout (GitHub Pages Frontend)

Use this runbook to fix weak website security-header grades for `waterapps.com.au` while keeping GitHub Pages as the origin.

## Why This Exists

`waterapps.com.au` is served by GitHub Pages. GitHub Pages does not let us set custom response headers such as:

- `Content-Security-Policy`
- `Strict-Transport-Security`
- `X-Content-Type-Options`
- `Referrer-Policy`
- `Permissions-Policy`

The solution is to place Cloudflare in front of GitHub Pages and inject the headers there.

## Scope

- Domain: `waterapps.com.au`
- Origin: GitHub Pages (`water-apps.github.io`)
- Goal: improve public security-header grade and enforce browser security policies

## Preconditions

- Cloudflare account access
- GoDaddy DNS access (current DNS host)
- Confirm site is healthy before changes:
  - `curl -sSI https://www.waterapps.com.au`

## Rollout Steps

### 1. Add Domain to Cloudflare

1. Add `waterapps.com.au` in Cloudflare
2. Import DNS records
3. Confirm `www` and apex records exist and point to the GitHub Pages target

### 2. Change Nameservers in GoDaddy

Replace GoDaddy nameservers with the two Cloudflare nameservers assigned to the zone.

Verify propagation:

```bash
dig +short NS waterapps.com.au
```

Expected: Cloudflare nameservers (not `ns07.domaincontrol.com` / `ns08.domaincontrol.com`)

### 3. Enable Cloudflare Proxy

In Cloudflare DNS:

- Set apex `A`/flattened records to **Proxied** (orange cloud)
- Set `www` CNAME to **Proxied** (orange cloud)

Verify live traffic goes through Cloudflare:

```bash
curl -sSI https://www.waterapps.com.au
```

Expected headers include Cloudflare indicators (for example `server: cloudflare`, `cf-ray`)

### 4. SSL/TLS

Recommended Cloudflare settings:

- SSL/TLS mode: `Full (strict)` (after cert issuance/validation is complete)
- `Always Use HTTPS`: enabled
- `Automatic HTTPS Rewrites`: enabled

### 5. Add Security Headers (Worker or Transform Rules)

Apply the approved header set for the site dependencies (Tailwind CDN, Google Analytics, Calendly, Font Awesome CDN, Google Fonts, contact-form API).

Minimum required headers:

- `Strict-Transport-Security`
- `X-Content-Type-Options`
- `X-Frame-Options` (or `frame-ancestors` in CSP)
- `Referrer-Policy`
- `Permissions-Policy`
- `Content-Security-Policy`

Keep the CSP aligned with current site dependencies:

- `https://cdn.tailwindcss.com`
- `https://cdnjs.cloudflare.com`
- `https://www.googletagmanager.com`
- `https://assets.calendly.com`
- `https://fonts.googleapis.com`
- `https://fonts.gstatic.com`
- `https://roatlihulb.execute-api.ap-southeast-2.amazonaws.com`

### 6. Validate After Deployment

Local checks:

```bash
curl -sSI https://www.waterapps.com.au
curl -sSI http://www.waterapps.com.au
```

Confirm:

- HTTPS serves Cloudflare headers
- Security headers are present
- HTTP redirects to HTTPS

Functional checks:

- Homepage loads correctly
- Calendly widget loads
- Contact form submit still works
- Analytics script loads (if enabled)

### 7. External Grade Recheck

Re-run a public header grader after the Cloudflare headers are live:

- Mozilla Observatory
- SecurityHeaders.com

## Rollback

If the Worker/headers break functionality:

1. Disable the Worker route (or disable the Transform Rule)
2. Re-test site functionality
3. Narrow CSP restrictions incrementally until dependencies load correctly

## Notes

- GitHub Pages origin will still appear in some traces if Cloudflare is not proxying the records
- Tailwind CDN runtime usage may require `'unsafe-eval'` in CSP; self-hosted compiled CSS is a future hardening improvement
