#!/usr/bin/env python3
"""Generate a compact CI context pack for dashboards and agent workflows."""

from __future__ import annotations

import argparse
import json
import os
from datetime import datetime, timezone
from pathlib import Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate MCP-ready CI context for the site-quality workflow."
    )
    parser.add_argument("--checks-result", required=True)
    parser.add_argument("--portal-auth-result", required=True)
    parser.add_argument("--booking-availability-result", required=True)
    parser.add_argument("--output-dir", default="artifacts/ci-context")
    return parser.parse_args()


def normalize_result(value: str) -> str:
    normalized = (value or "").strip().lower()
    return normalized if normalized else "unknown"


def outcome_summary(modules: list[dict[str, str]]) -> tuple[str, list[str]]:
    failures = [module["name"] for module in modules if module["result"] != "success"]
    if failures:
        return "fail", failures
    return "pass", []


def build_context(args: argparse.Namespace) -> dict:
    modules = [
        {"name": "checks", "result": normalize_result(args.checks_result)},
        {"name": "portal-auth-tests", "result": normalize_result(args.portal_auth_result)},
        {
            "name": "booking-availability-tests",
            "result": normalize_result(args.booking_availability_result),
        },
    ]
    overall_status, failing_modules = outcome_summary(modules)

    run_id = os.getenv("GITHUB_RUN_ID", "")
    repository = os.getenv("GITHUB_REPOSITORY", "")
    server_url = os.getenv("GITHUB_SERVER_URL", "https://github.com")
    run_url = (
        f"{server_url}/{repository}/actions/runs/{run_id}"
        if repository and run_id
        else ""
    )

    recommended_actions = (
        ["Review failing module logs and attached artifacts before merge."]
        if failing_modules
        else ["Release gates passed. Safe to continue with review or deploy promotion."]
    )

    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "workflow": os.getenv("GITHUB_WORKFLOW", "Site Quality"),
        "repository": repository,
        "event_name": os.getenv("GITHUB_EVENT_NAME", ""),
        "ref_name": os.getenv("GITHUB_REF_NAME", ""),
        "sha": os.getenv("GITHUB_SHA", ""),
        "run_id": run_id,
        "run_url": run_url,
        "overall_status": overall_status,
        "failing_modules": failing_modules,
        "modules": modules,
        "recommended_actions": recommended_actions,
        "artifacts": ["playwright-report", "site-quality-context"],
    }


def render_markdown(context: dict) -> str:
    lines = [
        "## Site Quality Context",
        f"- Overall status: `{context['overall_status']}`",
        f"- Repository: `{context['repository']}`",
        f"- Event: `{context['event_name']}`",
        f"- Ref: `{context['ref_name']}`",
    ]
    if context["run_url"]:
        lines.append(f"- Run: {context['run_url']}")

    lines.append("")
    lines.append("### Module Results")
    for module in context["modules"]:
        lines.append(f"- `{module['name']}`: `{module['result']}`")

    lines.append("")
    lines.append("### Recommended Actions")
    for action in context["recommended_actions"]:
        lines.append(f"- {action}")

    return "\n".join(lines) + "\n"


def main() -> int:
    args = parse_args()
    context = build_context(args)
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    json_path = output_dir / "site-quality-context.json"
    md_path = output_dir / "site-quality-context.md"

    json_path.write_text(json.dumps(context, indent=2) + "\n", encoding="utf-8")
    md_path.write_text(render_markdown(context), encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
