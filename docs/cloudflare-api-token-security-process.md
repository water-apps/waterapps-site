# Cloudflare API Token Security Process

Use this runbook when any engineer needs Cloudflare API access for `waterapps.com.au`.

## Purpose

- Prevent token leakage and over-privileged access
- Keep auditable records of token issuance and revocation
- Standardize how security engineers approve and verify token use

## Scope

- Cloudflare account operations for `waterapps.com.au`
- DNS, Workers, Routes, and Zone settings changes

## Roles

- Requester: engineer performing operational change
- Approver: security engineer (or delegated platform owner)
- Executor: engineer using token
- Verifier: engineer confirming revocation and outcome evidence

## Token Classes

1. Verify-only token:
- Permissions: `Zone:Read`

2. DNS operations token:
- Permissions: `Zone:Read`, `DNS:Read`, `DNS:Edit`

3. Security header rollout token:
- Permissions: `Zone:Read`, `DNS:Edit`, `Workers Scripts:Edit`, `Workers Routes:Edit`, `Zone Settings:Edit`

Use the smallest class that satisfies the task.

## Standard Process

### 1) Request

Create a work item (issue/ticket) with:
- change objective
- expected impacted assets (zone, routes, records)
- rollback plan
- requested token class
- requested expiry window (default: <= 24h)

### 2) Approve

Security approver confirms:
- least-privilege permission set
- expiry window
- owner and verifier assignment

### 3) Issue Token

In Cloudflare:
- create scoped token for `waterapps.com.au` only
- set short expiry
- name format: `wa-<purpose>-<yyyymmdd>-<owner>`

### 4) Store/Distribute

- store only in a secret manager or one-time secure channel
- never paste token in chat, issue comments, docs, commit history, or CI logs

### 5) Execute Change

- perform only approved operations
- capture evidence (before/after headers, DNS checks, API output without secrets)

### 6) Revoke/Rotate

Immediately after task completion:
- revoke token in Cloudflare UI/API
- verify it is inactive (invalid token response)

### 7) Record Closure

Update ticket with:
- exact operations performed
- verification evidence
- revocation timestamp and verifier name

## Emergency Response (Token Exposure)

If token is exposed:

1. Revoke immediately
2. Audit Cloudflare activity for unauthorized changes
3. Re-verify critical settings:
- DNS records/proxy state
- Worker routes/scripts
- TLS mode and HTTPS settings
- security header rules
4. Document incident summary and corrective action

## Verification Checklist

- [ ] Token scope is limited to required zone and permissions
- [ ] Expiry is short-lived
- [ ] No secret appears in commits/issues/chat logs
- [ ] Change objective achieved
- [ ] Post-change validation passed
- [ ] Token revoked and revocation verified

## Operational Evidence Commands

```bash
# DNS nameservers
dig +short NS waterapps.com.au

# Live headers
curl -sSI https://www.waterapps.com.au

# HTTP redirect behavior
curl -sSI http://www.waterapps.com.au
```

## Audit Log Template

Use this table in ticket comments:

| Date (UTC) | Purpose | Token Class | Owner | Approver | Operations | Revoked At (UTC) | Verifier |
|---|---|---|---|---|---|---|---|
| YYYY-MM-DD | Example: CSP rollout | Security header rollout | name | name | DNS+Transform Rules | YYYY-MM-DD HH:MM | name |

## Current Reference

- Cloudflare zone rollout runbook:
  - `/Users/varunau/Projects/waterapps/waterapps-site/docs/cloudflare-security-headers-rollout.md`

## Recent Event Record (Sanitized)

- Date: 2026-03-01
- Purpose: Cloudflare DNS/headers rollout verification
- Outcome: token was revoked after completion and revocation verified (`Invalid API Token` on verification call)
- Secret value: not retained in documentation
