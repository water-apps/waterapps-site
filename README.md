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

## Contact Form API Integration (Serverless Backend)

The site now includes a browser-submitted contact form UI in `index.html` that can post to the WaterApps serverless contact-form API.

Before promoting to production, configure the API endpoint in one of these ways:

1. Set the form attribute `data-api-endpoint` on `#contact-form` in `index.html`
2. Or define `window.WATERAPPS_CONFIG = { contactApiEndpoint: "https://.../contact" }` before the inline script runs
3. Or define `window.WATERAPPS_CONTACT_API_ENDPOINT = "https://.../contact"`

The frontend expects JSON responses and handles:
- `200` success
- `400` validation failures with `fieldErrors`
- `403` origin errors (misconfigured allowlist/origin)
- `429` throttling
- `500` fallback message

### Email Deliverability / Trust Notice (In Progress)

The contact form is live and sending to `varun@waterapps.com.au`, but some mailbox providers may show "sender can't be verified" or similar warnings until domain email authentication is fully configured for `waterapps.com.au`.

This is a DNS/email-authentication rollout task (SPF/DKIM/DMARC), not a frontend form bug.

Team note:
- Treat this as an active deliverability hardening item
- Do not remove the contact form because of this warning alone
- Coordinate changes with the backend SES configuration in `waterapps-contact-form`

Smoke test checklist after deployment:
- Submit a valid message from `https://www.waterapps.com.au` and confirm success UI
- Submit invalid fields and confirm inline validation messages
- Confirm the backend `ALLOWED_ORIGINS` includes `https://www.waterapps.com.au` and `https://waterapps.com.au`

---

## Key Sections to Personalise

Before going live, update these in `index.html`:

1. **Case study metrics** — Replace placeholder numbers with your real outcomes
2. **Email address** — Currently set to `varun@waterapps.com.au`
3. **ABN** — Add your actual ABN in the footer/contact section
4. **LinkedIn URL** — Verify the company page link is correct

---

## Tech Stack

- Pure HTML/CSS/JS — no build tools, no dependencies
- Google Fonts (DM Sans + Instrument Serif)
- Scroll-reveal animations via Intersection Observer
- Fully responsive (mobile, tablet, desktop)
- Lighthouse-optimised for performance and SEO

---

© 2026 Water Apps Pty Ltd
