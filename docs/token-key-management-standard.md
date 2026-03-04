# Token and Key Management Standard

This standard defines how WaterApps engineers handle all tokens, API keys, and credentials across cloud, CI/CD, and SaaS systems.

## Scope

Applies to:
- Cloud provider credentials and access keys
- GitHub tokens and app credentials
- SaaS API tokens (Cloudflare, Snyk, monitoring, analytics, etc.)
- Database/service credentials
- Signing keys and webhook secrets

## Principles

1. Prefer short-lived federated auth over static secrets.
- Use OIDC/workload identity where available (GitHub Actions, cloud IAM, managed identities).

2. Least privilege by default.
- Scope by environment, service, and operation.

3. Private-by-default handling.
- Never paste secrets in chat, issue comments, docs, commit history, CI logs, or screenshots.

4. Time-boxed access.
- Set explicit expiry for manually issued tokens.

5. Verifiable lifecycle.
- Every token has issuance record, owner, purpose, expiry, and revocation evidence.

## Secret Classes

1. Machine identity (preferred)
- OIDC/workload identity, no static key material.

2. Short-lived human/API token
- Expiry <= 24h by default.

3. Long-lived secret (exception only)
- Requires explicit exception approval and tighter monitoring.

## Required Metadata (for every issued token/key)

- System/provider
- Token class
- Owner
- Approver
- Purpose/change ticket
- Scope/permissions
- Created at (UTC)
- Expiry at (UTC)
- Revoked at (UTC)
- Revocation verifier

## Standard Lifecycle

### 1) Request

Requester opens a ticket with:
- objective
- exact permissions required
- target systems/environments
- rollback plan
- requested validity window

### 2) Approve

Security engineer validates:
- least privilege
- expiry
- owner/verifier assignment

### 3) Issue

Create token/key scoped to minimum required resources.

### 4) Store/Distribute

- Use approved secret manager or one-time secure channel.
- Do not store in local plaintext files or shell history.

### 5) Use

- Execute only approved changes.
- Capture non-secret evidence (headers, statuses, resource diffs).

### 6) Revoke/Rotate

- Revoke immediately after task completion or at expiry.
- Verify token is inactive.

### 7) Close and Audit

- Update ticket with operations performed and revocation evidence.
- Record any incident or deviation.

## Rotation Policy (Baseline)

- Short-lived manual tokens: revoke immediately after use
- CI/CD static secrets (exceptions): rotate at least every 30 days
- High-privilege service keys: rotate at least every 7 days or move to federated auth
- Signing keys: follow service-specific crypto rotation policy with overlap window

## Incident Response (Secret Exposure)

1. Revoke exposed secret immediately.
2. Audit related systems for unauthorized changes.
3. Restore intended state and re-validate controls.
4. Record incident timeline and corrective actions.

## Engineering Controls

- Secret scanning in CI and pre-commit hooks.
- Masking in CI logs.
- Block public issue/comment updates that include secret-like patterns.
- Provider audit logs enabled and retained.

## Implementation Guidance by Provider

- Cloudflare:
  - `/Users/varunau/Projects/waterapps/waterapps-site/docs/cloudflare-api-token-security-process.md`
- Additional provider runbooks (AWS, GitHub, Snyk, etc.) should follow this standard and reference it.

## Audit Cadence

- Weekly: review active high-privilege tokens
- Monthly: full token/key inventory reconciliation
- Quarterly: exception review and deprecation plan for static credentials

## Sanitized Token Inventory Template

| Date (UTC) | Provider | Purpose | Class | Owner | Approver | Expiry | Status | Revoked At | Verifier | Ticket |
|---|---|---|---|---|---|---|---|---|---|---|
| YYYY-MM-DD | Cloudflare | Header rollout | Short-lived token | name | name | YYYY-MM-DD HH:MM | Active/Revoked | YYYY-MM-DD HH:MM | name | #123 |

Note: Keep full token identifiers and raw values in private systems only, not public repos.
