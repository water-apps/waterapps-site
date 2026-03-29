# Website Guide Agent Pilot Plan

Status: Draft v1  
Last updated: 2026-03-29  
Owner: Product + CTO

## Purpose

Define the MVP build, estimate, test path, and pilot plan for the Website Guide Agent on `waterapps-site`.

## MVP Scope

Release a guided website assistant that:

1. helps first-time visitors choose the right WaterApps path
2. recommends the best page, section, or CTA
3. carries a structured summary into the existing contact flow
4. logs guide interactions so WaterApps can evaluate conversion quality

## Design Decisions

### What the MVP is

- a structured side-panel guide
- curated intent classification, not free-form open chat
- recommendation-led, with every path ending in a page or CTA
- compatible with later AI and `n8n` back-end follow-up

### What the MVP is not

- a general-purpose chatbot
- an autonomous sales agent
- a replacement for the existing site information architecture
- a production AI orchestration back end on day one

## Estimate

### Build estimate

1. Design and content model: `0.5-1 day`
2. Homepage integration and interaction logic: `1-1.5 days`
3. Tests and quality gates: `0.5 day`
4. Pilot instrumentation and review docs: `0.5 day`

Estimated MVP delivery effort: `2.5-3.5 days`

### Pilot estimate

1. Internal review and message tuning: `2-3 days`
2. Soft launch on WaterApps site: `1 week`
3. First outcome review and tuning cycle: `0.5-1 day`

## Implementation Plan

### Phase 1: MVP build

1. add homepage launcher and side panel
2. define intent taxonomy and recommendation model
3. add structured guide logic and analytics hooks
4. support contact-form prefill from guided recommendation
5. add smoke and helper tests

### Phase 2: Pilot activation

1. review recommendation copy and CTA quality
2. confirm guided brief lands cleanly in contact intake
3. monitor interaction and contact conversion signals
4. tune paths with the highest drop-off

### Phase 3: Intelligent follow-up

1. add real AI classification behind the same UX
2. add `n8n` lead-routing and follow-up automation
3. add MCP knowledge retrieval for service, proof, and product catalog
4. introduce operator review for high-value leads

## Test Plan

### MVP release checks

1. homepage contains the launcher, panel, and guide script
2. intent branches resolve to valid recommendation outcomes
3. guided brief can be carried into the contact path
4. existing booking and contact flows still work

### Manual smoke test

1. open homepage and launch the guide from hero CTA and floating button
2. run at least three paths:
- cloud/platform
- site tour
- website/workflow
3. confirm each path ends with a sensible recommendation
4. confirm a contact-prefill path scrolls to contact and seeds the message
5. confirm mobile layout remains usable

## Pilot Success Metrics

1. guide open rate
2. recommendation completion rate
3. percentage of guided sessions that reach a CTA
4. percentage of guided sessions that reach contact or booking
5. operator view on whether guided summaries improve enquiry quality

## Pilot Rollout Rules

1. keep the pilot visible but secondary to core contact and booking paths
2. do not allow the guide to make unsupported claims
3. keep recommendation knowledge curated and versioned
4. fall back to contact and booking when confidence is low
5. review analytics and real enquiries before expanding scope

## Next Improvements After Pilot

1. add true AI classification for free-text visitor prompts
2. attach `n8n` workflow for lead routing and follow-up
3. store guide outcomes as structured lead metadata
4. add operator feedback loop for recommendation tuning
