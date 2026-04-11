---
applyTo: "**/*.js"
---
# JavaScript Instructions — waterapps-site

## Standards
- Vanilla JS only — no frameworks or heavy libraries
- Use `const` by default, `let` when reassignment needed, never `var`
- Use ES modules where possible

## Performance
- All `<script>` tags must use `async` or `defer`
- No synchronous XHR — use `fetch()` with async/await
- Event delegation over per-element listeners for repeated elements

## Security
- No `eval()`, `innerHTML` with user input, or `document.write()`
- Sanitise any user-supplied data before DOM insertion
- No API keys, secrets, or sensitive data in JS files
- No `console.log()` in production code — use conditional debug logging

## GA4 events
Use the standard event pattern:
```javascript
gtag('event', 'cta_click', {
  cta_type: 'booking',
  cta_section: 'hero'
});
```
Event names: `cta_click`, `contact_click`, `case_study_expand`
