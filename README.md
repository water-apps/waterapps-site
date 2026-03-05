# WaterApps — Enterprise DevOps & Cloud Consulting

Official website for **Water Apps Pty Ltd** — DevOps transformation, platform engineering, and compliance automation for Australia's most regulated industries.

🌐 **Live site:** [www.waterapps.com.au](https://www.waterapps.com.au)

---

## Deployment (GitHub Pages)

### Step 1: Create the repository

```bash
mkdir waterapps-site && cd waterapps-site
git init
```

### Step 2: Add files

Copy these files into the repo root:

```
waterapps-site/
├── index.html    ← Main website
├── CNAME         ← Custom domain config
└── README.md     ← This file
```

### Step 3: Push to GitHub

```bash
git add .
git commit -m "Initial site launch"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/waterapps-site.git
git push -u origin main
```

### Step 4: Enable GitHub Pages

1. Go to your repo on GitHub
2. **Settings** → **Pages**
3. Under "Source", select **Deploy from a branch**
4. Branch: `main` / Folder: `/ (root)`
5. Click **Save**
6. Wait 2–3 minutes — GitHub will deploy at `https://YOUR_USERNAME.github.io/waterapps-site/`

### Step 5: Connect your custom domain

#### In your domain registrar (e.g. VentraIP, Crazy Domains, GoDaddy):

Add these DNS records:

| Type  | Name  | Value                        |
|-------|-------|------------------------------|
| CNAME | www   | YOUR_USERNAME.github.io      |
| A     | @     | 185.199.108.153              |
| A     | @     | 185.199.109.153              |
| A     | @     | 185.199.110.153              |
| A     | @     | 185.199.111.153              |

> The A records point the root domain (waterapps.com.au) to GitHub Pages.
> The CNAME record points www.waterapps.com.au to your GitHub Pages site.

#### In GitHub:

1. Go to **Settings** → **Pages**
2. Under "Custom domain", enter: `www.waterapps.com.au`
3. Click **Save**
4. Check **Enforce HTTPS** (may take up to 24 hours to provision the certificate)

### Step 6: Verify

- Visit `https://www.waterapps.com.au` — should load the site
- Visit `https://waterapps.com.au` — should redirect to www

DNS propagation can take 15 minutes to 48 hours.

---

## Making Changes

Edit `index.html` and push:

```bash
git add index.html
git commit -m "Update: description of change"
git push
```

GitHub Pages auto-deploys on every push to `main`. Changes go live within 1–2 minutes.

---

## Contact + Booking API Integration (Serverless Backend)

The site includes:
- a browser-submitted contact form (`POST /contact`)
- a native discovery-call scheduler (`GET /availability`, `POST /booking`)
- moderation dashboard integrations for independent review workflows (`GET /reviews`, `POST /reviews/{id}/moderate`)

Before promoting to production, configure the API endpoint in one of these ways:

1. Define `window.WATERAPPS_CONFIG` before page scripts run (preferred), for example:
   - `contactApiEndpoint: "https://.../contact"`
   - `reviewApiEndpoint: "https://.../reviews"`
2. Define `window.WATERAPPS_DASHBOARD_CONFIG.reviewApiBase = "https://..."` for moderation pages
3. Use legacy `window.WATERAPPS_CONTACT_API_ENDPOINT = "https://.../contact"` fallback if required

For booking UI in `#booking-form`:
- set `data-availability-endpoint="https://.../availability"`
- set `data-booking-endpoint="https://.../booking"`
- or set only `contactApiEndpoint` and the frontend derives booking endpoints from it

The frontend expects JSON responses and handles:
- `200` success
- `400` validation failures with `fieldErrors`
- `403` origin errors (misconfigured allowlist/origin)
- `429` throttling
- `500` fallback message

Reference article:
- `/Users/varunau/Projects/waterapps/waterapps-site/docs/BOOKING_PLATFORM_ARTICLE.md`

### Email Deliverability / Trust Notice (Completed: DNS Auth Active)

The contact form is live and sending to `varun@waterapps.com.au`, but some mailbox providers may show "sender can't be verified" or similar warnings until domain email authentication is fully configured for `waterapps.com.au`.

This is a DNS/email-authentication rollout task (SPF/DKIM/DMARC), not a frontend form bug.

Current status (2026-02-24):
- SES domain identity for `waterapps.com.au` is verified in AWS (`ap-southeast-2`)
- Easy DKIM is active (`SUCCESS`)
- SPF is published at the domain apex
- DMARC remains published
- Some mailbox-provider warnings may linger temporarily due to provider caching/learning

Team note:
- Treat this as an active deliverability hardening item
- Do not remove the contact form because of this warning alone
- Coordinate changes with the backend SES configuration in `waterapps-contact-form`
- Re-test delivery headers after provider cache refresh if mailbox warnings persist

### Website Security Header Grade (Cloudflare Active)

The website is served from GitHub Pages behind Cloudflare. Security headers are now injected at Cloudflare for production traffic.

Operational runbooks:
- `/Users/varunau/Projects/waterapps/waterapps-site/docs/cloudflare-security-headers-rollout.md`
- `/Users/varunau/Projects/waterapps/waterapps-site/docs/RELEASE_TESTING_POLICY.md`
- `/Users/varunau/Projects/waterapps/waterapps-site/docs/RUN_LEARNINGS.md` (execution rules and per-run learning log)
- `/Users/varunau/Projects/waterapps/waterapps-site/docs/cloudflare-api-token-security-process.md`
- `/Users/varunau/Projects/waterapps/waterapps-site/docs/token-key-management-standard.md` (all tokens/keys across providers)
- `/Users/varunau/Projects/waterapps/waterapps-site/docs/token-key-security-design-article.md` (design assessment + target model)

Website UI quality standard:
- `/Users/varunau/Projects/waterapps/waterapps-site/docs/WEBSITE_UI_QUALITY_STANDARD.md`

Security engineering note:
- Treat Cloudflare API tokens as short-lived privileged credentials and follow the token lifecycle process (issue, use, revoke, verify).

Generate or refresh the token/key design article:

```bash
python3 scripts/generate_token_security_article.py
```

Smoke test checklist after deployment:
- Submit a valid message from `https://www.waterapps.com.au` and confirm success UI
- Submit invalid fields and confirm inline validation messages
- Confirm the backend `ALLOWED_ORIGINS` includes `https://www.waterapps.com.au` and `https://waterapps.com.au`

Mandatory release rule:
- Do not promote code without functional testing.
- Minimum local gate before PR/merge:
  - `bash scripts/check-site.sh`
  - `npm run test:functional-smoke`
  - `npm run test:playwright`
  - `npm run test:booking-availability`
  - `npm run test:portal-auth`

---

## Key Sections to Personalise

Before going live, update these in `index.html`:

1. **Case study metrics** — Replace placeholder numbers with your real outcomes
2. **Email address** — Currently set to `varun@waterapps.com.au`
3. **ABN** — Add your actual ABN in the footer/contact section
4. **LinkedIn URL** — Verify the company page link is correct

---

## Tech Stack

- Static HTML/CSS/JS website (GitHub Pages)
- Tailwind CSS utilities compiled to a checked-in stylesheet (`assets/css/tailwind.generated.css`) using a small local build script (`npm run build:css`)
- Google Fonts (DM Sans + Instrument Serif)
- Scroll-reveal animations via Intersection Observer
- Fully responsive (mobile, tablet, desktop)
- Lighthouse-optimised for performance and SEO

---

© 2026 Water Apps Pty Ltd
