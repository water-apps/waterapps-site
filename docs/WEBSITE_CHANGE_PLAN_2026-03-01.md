# Website Change Plan (2026-03-01)

Status: Draft v1  
Owner: PO + CTO  
Objective: Raise website UI quality to world-class while improving conversion and trust signals with measurable quality gates.

## Audit Summary

Current baseline:

1. `Site Quality` workflow is active and passing (`required files`, `HTML close tags`, basic link and legal markers).
2. Homepage has strong structure and conversion CTAs, but mobile navigation/accessibility and performance governance are not yet at world-class level.
3. Metadata and analytics coverage is inconsistent across key pages.

## What Is Working

1. Core pages and internal links resolve correctly.
2. Contact form UX includes clear error and success handling.
3. Primary homepage messaging and CTA hierarchy are business-aligned.
4. Security/legal markers exist on homepage and core legal pages.

## Gaps Found (Priority Order)

1. `P0` Mobile navigation and landmark accessibility are incomplete on homepage.
2. `P0` Several key pages are missing canonical/OG/Twitter metadata.
3. `P0` Analytics is loaded only on homepage; cross-page funnel visibility is limited.
4. `P1` Homepage includes large inline style block and render-blocking third-party CSS that limits performance/CSP hardening.
5. `P1` CI quality gates do not enforce Lighthouse/accessibility thresholds or metadata consistency.
6. `P2` CTA analytics mapping depends on visible text matching, which is fragile during copy updates.

## Prioritized Backlog (with Story Points)

| ID | Priority | Story | SP | Acceptance Criteria |
|---|---|---|---:|---|
| WEB-UI-001 | P0 | Add accessible mobile nav, skip-link, and main landmark to homepage | 5 | Mobile menu works with keyboard; `Skip to content` present; homepage wrapped in `<main id=\"main-content\">`; focus states visible |
| WEB-UI-002 | P0 | Standardize SEO/social metadata on key pages (`enterprise-readiness`, `capability-statement`, `quality-engineering`, `privacy`, `terms`, `insights` pages missing tags) | 3 | All key pages have unique title, description, canonical, OG title/description/url/image, twitter card |
| WEB-UI-003 | P0 | Add GA base snippet consistently to high-value pages and confirm event capture coverage | 3 | GA loaded on all conversion and insights pages; baseline page-view/event visibility confirmed |
| WEB-UI-004 | P1 | Move homepage inline CSS to stylesheet and add reduced-motion handling | 5 | Inline style block removed/minimized; `prefers-reduced-motion` honored for wave animation and smooth scrolling |
| WEB-UI-005 | P1 | Introduce Lighthouse CI quality gate with thresholds from UI quality standard | 5 | CI fails below thresholds (`Perf/A11y/SEO/Best Practices`); artifacts stored in workflow run |
| WEB-UI-006 | P1 | Extend static quality script checks beyond homepage to all primary pages | 3 | Script validates metadata presence, legal links, and local link integrity for defined page set |
| WEB-UI-009 | P1 | Remove hardcoded production contact API endpoint from HTML and source from config | 2 | `index.html` no longer contains production API URL; endpoint loaded from runtime config only |
| WEB-UI-007 | P2 | Replace text-based CTA analytics triggers with `data-*` attributes | 3 | Events mapped by `data-analytics-id`; copy changes do not break event taxonomy |
| WEB-UI-008 | P2 | Optimize third-party asset strategy (Font Awesome usage audit + icon strategy) | 5 | Unused icon payload reduced; documented asset policy; no visual regression on primary pages |

Total planned: `34 SP`

## 2-Week Execution Plan

## Week 1 (Foundational Quality)

1. `WEB-UI-001` (5 SP)
2. `WEB-UI-002` (3 SP)
3. `WEB-UI-003` (3 SP)
4. `WEB-UI-006` (3 SP)

Week 1 target: `14 SP`

## Week 2 (Performance + Durable Governance)

1. `WEB-UI-004` (5 SP)
2. `WEB-UI-005` (5 SP)
3. `WEB-UI-009` (2 SP)
4. `WEB-UI-007` (3 SP)
5. `WEB-UI-008` (5 SP)

Week 2 target: `20 SP`

## Ownership Split for Parallel Execution

1. `PO`: messaging/CTA intent acceptance criteria, metadata quality review.
2. `Frontend Dev`: homepage accessibility + style refactor + analytics data attributes.
3. `QA`: keyboard/a11y checks, mobile viewport validation, event validation.
4. `DevOps`: CI gate additions (Lighthouse + script extension), evidence artifacts.
5. `Security/Legal`: final wording review for trust/compliance pages when metadata and claims are updated.

## Evidence Required per Story

1. PR link.
2. Before/after screenshots (desktop + mobile).
3. CI run link.
4. Lighthouse summary for changed pages.
5. Event validation notes for CTA/contact tracking stories.

## Success Metrics

1. Lighthouse targets hit as defined in `docs/WEBSITE_UI_QUALITY_STANDARD.md`.
2. Mobile navigation completion rate and usability checks pass.
3. Cross-page conversion funnel visibility available in GA.
4. Zero broken internal links or missing required metadata on primary pages.
