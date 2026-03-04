#!/usr/bin/env python3
"""
Generate a sanitized token/key security design article for the docs folder.
"""

from __future__ import annotations

import argparse
from datetime import datetime, timezone
from pathlib import Path
from textwrap import dedent


def build_article(generated_at_utc: str) -> str:
    return dedent(
        f"""\
        # Token and Key Security Design for WaterApps

        _Generated at (UTC): {generated_at_utc}_

        ## Executive Summary

        Yes, the current WaterApps token/key approach is **strong and directionally correct**:
        - documented lifecycle exists (request, approve, issue, use, revoke, verify)
        - least-privilege and short-lived token principles are defined
        - Cloudflare-specific runbook exists and revocation verification is documented

        It is not yet "best-in-class" until all provider tokens are managed through one measurable operating model with recurring evidence checks.

        ## Current Design Assessment

        | Design Area | Current State | Rating |
        |---|---|---|
        | Governance standard | Global token/key standard documented | Strong |
        | Provider playbooks | Cloudflare playbook documented and used | Strong |
        | Secret exposure controls | "No secret in chat/issues/docs/logs" policy documented | Strong |
        | Token lifecycle evidence | Revocation verification process documented | Strong |
        | Cross-provider maturity | AWS/GitHub/Snyk runbooks need same depth as Cloudflare | Medium |
        | Automation coverage | Manual process works; full recurring automation can be improved | Medium |
        | Audit KPIs and dashboards | Cadence is defined; KPI reporting should be operationalized | Medium |

        ## Target "Best Design" (Reference Model)

        1. Identity-first access:
        - prefer OIDC/workload identity over static keys across CI/CD and workloads
        - keep long-lived secrets as approved exceptions only

        2. Unified lifecycle controls:
        - one lifecycle for every token/key: request -> approve -> issue -> store -> use -> revoke -> verify -> audit close
        - mandatory metadata on every credential event (owner, scope, expiry, verifier, ticket)

        3. Private-by-default handling:
        - strategic/security notes remain private
        - public repos contain only sanitized operational documentation

        4. Automated guardrails:
        - CI secret scanning and commit blocking
        - automated stale-secret reporting and expiration alerts
        - standard verification scripts for provider APIs

        5. Measured security operations:
        - weekly high-privilege token review
        - monthly inventory reconciliation
        - quarterly exception burn-down review

        ## Practical Architecture Pattern

        - **Policy layer:** token/key management standard (`docs/token-key-management-standard.md`)
        - **Provider layer:** provider-specific runbooks (Cloudflare complete, others to match)
        - **Execution layer:** scripted checks and evidence capture
        - **Audit layer:** recurring reconciliation and exception reporting

        ## Minimum Controls Every Security Engineer Should Follow

        1. Never use personal permanent tokens for production changes.
        2. Scope each token to one system, one purpose, and shortest feasible validity.
        3. Store secrets only in approved secret stores/one-time channels.
        4. Record non-secret evidence only (status, headers, diffs, timestamps).
        5. Revoke immediately after completion; verify revocation with API response.
        6. Log closure evidence in ticket/issues without exposing sensitive values.

        ## 30-60-90 Day Maturity Plan

        ### 30 days
        - align AWS/GitHub/Snyk runbooks to the same lifecycle quality as Cloudflare
        - define one token inventory format and owner mapping per provider

        ### 60 days
        - add automated checks for token expiry windows and policy drift
        - add weekly "high-privilege active token" report to ops review

        ### 90 days
        - reduce remaining long-lived token exceptions
        - show measurable KPI trend improvement (fewer exceptions, faster revocation, cleaner audits)

        ## KPI Set for Ongoing Governance

        - `% short-lived credentials vs total active credentials`
        - `median token validity duration`
        - `mean time to revoke after change completion`
        - `count of long-lived exception secrets`
        - `count of secret exposure incidents`
        - `weekly reconciliation completion rate`

        ## Conclusion

        WaterApps has a solid foundation and a safe operating direction.  
        To claim "best design," complete cross-provider standardization, automate recurring evidence checks, and track KPI outcomes continuously.
        """
    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate token/key security design article markdown."
    )
    parser.add_argument(
        "--output",
        default="docs/token-key-security-design-article.md",
        help="Output markdown file path",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    generated_at_utc = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(build_article(generated_at_utc), encoding="utf-8")
    print(f"Wrote article: {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
