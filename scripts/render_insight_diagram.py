#!/usr/bin/env python3
"""Render simple WaterApps insight flow diagrams from a JSON spec."""

from __future__ import annotations

import argparse
import json
import math
import textwrap
from pathlib import Path


FONT_FAMILY = "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial"
BG_TOP = "#f8fbff"
BG_BOTTOM = "#eaf2ff"
CARD_STROKE = "#7aa7ef"
CARD_SHADOW = "#dbeafe"
CARD_FILL = "#ffffff"
TEXT = "#1f2937"
ARROW = "#2563eb"


def wrap_lines(text: str, width: int = 24) -> list[str]:
    parts = textwrap.wrap(text, width=width, break_long_words=False)
    return parts[:3] if parts else [text]


def svg_escape(text: str) -> str:
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def render(spec: dict) -> str:
    steps = spec["steps"]
    if len(steps) < 2:
        raise ValueError("diagram spec requires at least two steps")

    width = int(spec.get("width", 1440))
    height = int(spec.get("height", 360))
    padding_x = 42
    card_gap = 44
    card_w = int((width - (padding_x * 2) - (card_gap * (len(steps) - 1))) / len(steps))
    card_h = 124
    card_y = int((height - card_h) / 2) - 8
    shadow_offset = 2

    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" role="img" aria-label="{svg_escape(spec["aria_label"])}">',
        "<defs>",
        '  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">',
        f'    <stop offset="0%" stop-color="{BG_TOP}"/>',
        f'    <stop offset="100%" stop-color="{BG_BOTTOM}"/>',
        "  </linearGradient>",
        "</defs>",
        f'<rect width="{width}" height="{height}" rx="20" fill="url(#bg)"/>',
    ]

    centers = []
    for index, step in enumerate(steps):
        x = padding_x + index * (card_w + card_gap)
        centers.append((x, x + card_w))
        parts.append(
            f'<rect x="{x + shadow_offset}" y="{card_y + shadow_offset + 3}" width="{card_w}" height="{card_h}" rx="16" fill="{CARD_SHADOW}" opacity="0.6"/>'
        )
        parts.append(
            f'<rect x="{x}" y="{card_y}" width="{card_w}" height="{card_h}" rx="16" fill="{CARD_FILL}" stroke="{CARD_STROKE}" stroke-width="2"/>'
        )
        title_lines = wrap_lines(step["title"], 24)
        subtitle_lines = wrap_lines(step.get("subtitle", ""), 24) if step.get("subtitle") else []
        lines = title_lines + subtitle_lines
        total_text_h = len(lines) * 22
        start_y = card_y + math.floor((card_h - total_text_h) / 2) + 18
        for offset, line in enumerate(lines):
            weight = "600" if offset < len(title_lines) else "500"
            parts.append(
                f'<text x="{x + (card_w / 2)}" y="{start_y + offset * 22}" text-anchor="middle" fill="{TEXT}" font-size="16" font-family="{FONT_FAMILY}" font-weight="{weight}">{svg_escape(line)}</text>'
            )

    arrow_y = card_y + (card_h / 2)
    for left, right in zip(centers, centers[1:]):
        x1 = left[1]
        x2 = right[0]
        arrow_start = x1 + 8
        arrow_end = x2 - 12
        parts.append(
            f'<line x1="{arrow_start}" y1="{arrow_y}" x2="{arrow_end}" y2="{arrow_y}" stroke="{ARROW}" stroke-width="4" stroke-linecap="round"/>'
        )
        parts.append(
            f'<polygon points="{arrow_end},{arrow_y - 6} {arrow_end + 12},{arrow_y} {arrow_end},{arrow_y + 6}" fill="{ARROW}"/>'
        )

    parts.append("</svg>")
    return "\n".join(parts) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--spec", required=True, help="Path to JSON diagram spec")
    parser.add_argument("--output", required=True, help="Path to output SVG")
    args = parser.parse_args()

    spec_path = Path(args.spec)
    output_path = Path(args.output)
    spec = json.loads(spec_path.read_text())
    svg = render(spec)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(svg)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
