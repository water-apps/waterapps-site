# waterapps-site — Copilot Instructions

This is the **live WaterApps consulting website** at waterapps.com.au — the primary trust and conversion surface for regulated-industry clients. Changes here are visible to CTOs, founders, and procurement at Australian banks, government agencies, and telcos.

## Stack
- Vanilla HTML/CSS/JS — no heavy frameworks
- Deployed via GitHub Pages (recovery path) and CloudFront (primary)
- Contact form → AWS API Gateway → Lambda → SES

## Standards
- Mobile-first, minimum 375px viewport
- SEO: every page needs `<title>`, `<meta description>`, canonical URL, and Open Graph tags
- No inline scripts or styles on production pages — CSP compliance
- Images must have `alt` attributes
- Performance: no render-blocking resources without async/defer

## CI
- Site Quality workflow validates HTML, links, and performance on every PR
- OWASP ZAP baseline runs weekly — do not introduce new findings
- CloudFront deploy is gated — do not merge bypassing CI checks

## Content tone
- Authoritative, concise, enterprise-appropriate
- No placeholder text (`Lorem ipsum`, `TBD`, `Coming soon`) in production pages
- Portal and auth pages must use production-language copy, not preview/demo wording

## Do not
- Change repo visibility to private — site is still on GitHub Pages; making it private takes the live site offline
- Add npm dependencies or build steps without updating the CI workflow
- Modify CloudFront or Pages deploy workflows without a reviewed PR
