# Building a Calendly-Style Booking Flow for WaterApps

## Summary

WaterApps can replace third-party booking tools for core discovery-call scheduling using its existing serverless stack.

This implementation introduces:
- native booking UI on the website
- API endpoints for slot discovery and booking requests
- email notifications to operations inbox

## Why Build It

- Lower recurring SaaS cost for basic scheduling
- Full control over UX, branding, and security posture
- Tighter integration with existing contact-form infrastructure
- Better ownership of analytics and conversion funnel

## Implemented MVP

### Frontend
- Replaced embedded Calendly widget with native booking form
- Added slot loading from API (`GET /availability`)
- Added booking request submission (`POST /booking`)
- Preserved contact-form fallback path for users

### Backend
- Added `GET /availability` endpoint to expose configurable UTC slots
- Added `POST /booking` endpoint for validated booking requests
- Added SES notification email for each booking request
- Added validation guardrails (lead time, booking window, slot format)

### Infrastructure
- Added API Gateway routes for `/availability` and `/booking`
- Added Terraform-configurable booking settings:
  - slot duration
  - lookahead window
  - minimum lead time
  - UTC booking hours
  - allowed UTC weekdays

## Known Limits (MVP)

- Booking is request-based; final confirmation is email-driven
- No two-way Google/Microsoft calendar sync yet
- No automated reschedule/cancel links yet
- No atomic slot-locking persistence yet

## Security and Operations

- CORS remains restricted to approved origins
- Server-side validation is enforced for all booking fields
- Contact/booking requests are observable through CloudWatch logs
- No new secret classes introduced in frontend code

## Delivery Backlog

- `P1` Add persistent slot locking (atomic conflict prevention)
- `P1` Add operational dashboard for availability/booking request metrics
- `P2` Add Google/Microsoft calendar OAuth sync
- `P2` Add auto-generated confirmation and reminder emails
- `P3` Add reschedule/cancel flows with signed links
- `P3` Add meeting type presets (15/30/60 min)
- `P4` Add team routing and round-robin assignment

## Recommendation

Keep this MVP in production as the default booking path, then phase in `P1` persistence and `P2` calendar sync to reach near-Calendly parity while retaining platform ownership.
