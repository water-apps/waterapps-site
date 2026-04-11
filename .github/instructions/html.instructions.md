---
applyTo: "**/*.html"
---
# HTML Instructions — waterapps-site

## Required on every page
- `<title>` tag — unique, descriptive, < 60 characters
- `<meta name="description">` — unique, < 160 characters
- Canonical URL: `<link rel="canonical" href="...">`
- Open Graph: `og:title`, `og:description`, `og:image`, `og:url`

## Images
- All `<img>` tags must have `alt` attributes
- Prefer WebP format with fallback
- Include `width` and `height` attributes for layout stability
- Lazy-load below-fold images: `loading="lazy"`

## CSP compliance
- No inline `<script>` or `<style>` tags
- External files only with `async` or `defer`
- No `onclick`, `onload`, or other inline event handlers

## Mobile-first
- Design for 375px viewport first, enhance upward
- Touch targets minimum 44×44px
- No horizontal scroll at any breakpoint

## Content
- No placeholder text: `Lorem ipsum`, `TBD`, `Coming soon`
- Enterprise-appropriate tone for regulated-industry clients
