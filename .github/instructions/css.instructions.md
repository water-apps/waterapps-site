---
applyTo: "**/*.css"
---
# CSS Instructions — waterapps-site

## Mobile-first
- Base styles target 375px viewport
- Use `min-width` media queries to enhance for larger screens
- No `!important` unless overriding third-party styles

## Performance
- No unused selectors — remove dead CSS
- Prefer CSS custom properties for theming
- Keep specificity low — avoid deep nesting

## Accessibility
- Sufficient color contrast (WCAG AA minimum: 4.5:1 for text)
- Focus styles visible for keyboard navigation
- No `display: none` on content that should be screen-reader accessible — use visually-hidden pattern instead
