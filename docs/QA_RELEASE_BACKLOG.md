# QA & Release Backlog

## P1 (Immediate)
- `P1-01` Enforce production auth mode guard:
  - Keep preview password login disabled on `waterapps.com.au` and `www.waterapps.com.au`.
  - Require Cognito SSO for production dashboard access.
  - Status: Implemented in portal auth config/script, verify each release.
- `P1-02` Expand release-gate e2e coverage:
  - Dashboard unauthenticated redirect test.
  - Portal login success/failure tests.
  - Moderation approve and reject tests.
  - Status: Implemented, keep mandatory in CI.
- `P1-03` Functional release checklist:
  - Runbook-backed smoke process for auth + dashboard + booking/contact.
  - Status: Implemented (`docs/STAGING_SMOKE_RUNBOOK.md`).

## P2 (Near Term)
- `P2-01` Monitoring and alerting:
  - Track auth failures, moderation API error rates, and deployment health.
  - Route alerts to operations channel/email.
- `P2-02` Session handling hardening:
  - Add idle timeout UX and explicit forced re-auth path.
  - Validate token expiry behavior in e2e tests.
- `P2-03` Moderation audit visibility:
  - Add read-only view of moderation history in dashboard.

## P3 (Medium)
- `P3-01` UX polish for auth states:
  - Improve inline guidance for disabled auth modes.
  - Add clearer progressive disclosure for SSO vs preview mode.
- `P3-02` Cross-browser e2e matrix:
  - Add Firefox/WebKit runs for smoke subset.

## P4 (Opportunistic)
- `P4-01` Performance regression checks:
  - Add Lighthouse budget checks for portal and dashboard pages.
- `P4-02` Visual regression snapshots:
  - Add baseline snapshots for login and dashboard core panels.

