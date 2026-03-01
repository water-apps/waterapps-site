# WaterApps Website UI Quality Standard (World-Class Baseline)

## Purpose

Define a measurable quality bar for UI/UX decisions so the website looks premium, performs fast, converts qualified buyers, and remains trustworthy for enterprise and government audiences.

This document is the default acceptance standard for homepage and key landing pages.

## Quality Principles

1. Clarity over decoration: every section must communicate one clear value.
2. Trust by evidence: claims, metrics, and compliance wording must be supportable.
3. Speed is UX: slow pages are low-quality pages.
4. Accessibility is non-negotiable: UI must work for keyboard and assistive technology users.
5. Consistency at scale: components and spacing should be predictable across pages.
6. Conversion with intent: CTAs should match buyer stage (explore, evaluate, contact).

## World-Class UI Definition (Measurable Targets)

Apply these targets to `index.html`, `enterprise-readiness.html`, `capability-statement.html`, and top insights pages.

### Performance Targets

- Lighthouse Performance:
  - Mobile: `>= 90`
  - Desktop: `>= 95`
- Core Web Vitals:
  - LCP: `<= 2.5s`
  - INP: `<= 200ms`
  - CLS: `<= 0.10`
- First-page payload (HTML + CSS + JS + critical images): target `<= 1.5 MB` transferred on first view.

### Accessibility Targets

- Lighthouse Accessibility: `>= 95`
- WCAG 2.2 AA for:
  - color contrast
  - keyboard navigation
  - focus visibility
  - form labels and error messages
  - semantic heading structure
  - meaningful link/button names

### SEO and Trust Targets

- Lighthouse SEO: `>= 95`
- All primary pages must include:
  - unique `<title>` and meta description
  - canonical URL
  - Open Graph and Twitter card basics
  - legal links (privacy + terms)

## UI System Rules

### Visual Hierarchy

- One primary CTA per viewport section.
- Use a clear type scale and consistent spacing rhythm.
- Keep dense technical detail inside expandable patterns (`details`, secondary sections) when possible.

### Typography

- Maintain current font system unless an explicit rebrand is approved.
- Body text should stay readable on mobile (`~16px` equivalent minimum).
- Avoid low-contrast light gray paragraphs for key value statements.

### Color and Contrast

- Primary CTA must remain visually dominant and consistent site-wide.
- Status colors (success, warning, critical) must not rely on color alone; pair with icon/text.
- Never introduce decorative palettes that reduce enterprise readability.

### Component Consistency

- Buttons, cards, badges, and section containers should reuse existing utility patterns.
- Interactive states required for all controls: `hover`, `focus-visible`, `disabled`.
- Do not ship one-off styling if an equivalent pattern already exists.

## UX and Conversion Standards

### Messaging Structure

- Hero must answer:
  - who this is for
  - what outcome is delivered
  - what action to take next
- Each major section should map to one buyer question (trust, capability, proof, engagement model).

### CTA Strategy

- Primary CTA: discovery/contact path.
- Secondary CTA: capability/procurement information path.
- CTAs must communicate intent clearly (`Book`, `Request`, `Download`, `Read`).

### Trust Signals

- Keep compliance and security language precise and non-overclaiming.
- Keep case studies confidentiality-safe unless explicit permission exists.
- Ensure legal disclaimers are present where outcome metrics are shown.

## Implementation Best Practices

1. Keep CSS utility-first and avoid large inline style blocks.
2. Defer or remove non-critical third-party scripts.
3. Compress/optimize media assets before commit.
4. Prefer SVG for logos/icons and responsive image sizing for photos.
5. Avoid layout shifts caused by late-loading fonts/images.
6. Keep JS progressive: page should remain usable if optional JS fails.

## QA and Release Checklist (UI Changes)

Before merge:

1. Run `./scripts/check-site.sh`.
2. Validate desktop + mobile rendering for changed pages.
3. Validate keyboard flow and visible focus states.
4. Validate form states (default, validation error, success, failure).
5. Confirm no broken local links/anchors.
6. Capture Lighthouse evidence for major UI changes (homepage + changed pages).
7. Confirm analytics events for changed CTAs still fire as expected.

## Definition of Done (UI Story)

A UI story is done only when:

1. Business intent and target buyer stage are explicit.
2. Acceptance criteria include at least one measurable quality target (performance, accessibility, or conversion event).
3. Visual consistency with existing system is maintained.
4. Evidence links are attached (PR, screenshots, Lighthouse summary).

## Ownership and Governance

- `PO`: UX intent, acceptance criteria, conversion objective.
- `CTO/Lead Engineer`: technical quality, performance, architecture impact.
- `QA`: accessibility and behavior validation.
- `Security/Legal`: wording checks where claims/compliance statements changed.

## Recommended Roadmap for UI Uplift

1. Establish a baseline Lighthouse report for key pages.
2. Prioritize top 3 UX friction points (hero clarity, CTA flow, mobile readability).
3. Standardize section and component tokens.
4. Add CI evidence artifact for major UI changes.
5. Review monthly against conversion + quality metrics.
