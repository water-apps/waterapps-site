#!/usr/bin/env python3
"""Generate a polished capability statement PDF at repo root.

This script intentionally avoids external dependencies so it can run in CI/local
with stock Python.
"""

from __future__ import annotations

from datetime import date
from pathlib import Path


PAGE_W = 595
PAGE_H = 842
LEFT = 52
RIGHT = 52
TOP_TEXT_Y = 744
BOTTOM_MARGIN = 64
LINE_GAP = 17


def esc(text: str) -> str:
    return text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def wrap_text(text: str, font_size: int, max_width: int) -> list[str]:
    if not text:
        return [""]
    # Approximate Helvetica average glyph width for safe wrapping.
    max_chars = max(12, int(max_width / (font_size * 0.52)))
    words = text.split()
    lines: list[str] = []
    current: list[str] = []
    for word in words:
        probe = " ".join(current + [word])
        if len(probe) <= max_chars:
            current.append(word)
        else:
            if current:
                lines.append(" ".join(current))
            current = [word]
    if current:
        lines.append(" ".join(current))
    return lines or [text]


def text_cmd(x: int, y: int, font: str, size: int, text: str, rgb: tuple[float, float, float]) -> str:
    r, g, b = rgb
    return f"{r:.3f} {g:.3f} {b:.3f} rg BT /{font} {size} Tf 1 0 0 1 {x} {y} Tm ({esc(text)}) Tj ET"


def rect_cmd(x: int, y: int, w: int, h: int, rgb: tuple[float, float, float]) -> str:
    r, g, b = rgb
    return f"q {r:.3f} {g:.3f} {b:.3f} rg {x} {y} {w} {h} re f Q"


def line_cmd(x1: int, y1: int, x2: int, y2: int, rgb: tuple[float, float, float], width: float = 1.0) -> str:
    r, g, b = rgb
    return f"q {r:.3f} {g:.3f} {b:.3f} RG {width:.2f} w {x1} {y1} m {x2} {y2} l S Q"


def page_header(commands: list[str], page_num: int) -> int:
    commands.append(rect_cmd(0, 774, PAGE_W, 68, (0.05, 0.23, 0.54)))
    commands.append(text_cmd(LEFT, 812, "F2", 22, "WaterApps Capability Statement", (1.0, 1.0, 1.0)))
    commands.append(
        text_cmd(
            LEFT,
            790,
            "F1",
            11,
            "Cloud Platform Engineering | DevSecOps | Regulated Delivery",
            (0.86, 0.92, 1.0),
        )
    )
    commands.append(text_cmd(PAGE_W - RIGHT - 52, 790, "F1", 10, f"Page {page_num}", (0.86, 0.92, 1.0)))
    commands.append(line_cmd(LEFT, 768, PAGE_W - RIGHT, 768, (0.74, 0.82, 0.95), 0.8))
    return TOP_TEXT_Y


def page_footer(commands: list[str]) -> None:
    commands.append(line_cmd(LEFT, 44, PAGE_W - RIGHT, 44, (0.82, 0.86, 0.9), 0.8))
    commands.append(text_cmd(LEFT, 30, "F1", 9, "www.waterapps.com.au  |  varun@waterapps.com.au", (0.38, 0.44, 0.5)))
    commands.append(text_cmd(PAGE_W - RIGHT - 110, 30, "F1", 9, f"Updated {date.today().isoformat()}", (0.38, 0.44, 0.5)))


def ensure_space(pages: list[list[str]], y: int, needed: int) -> tuple[list[str], int]:
    if y - needed >= BOTTOM_MARGIN:
        return pages[-1], y
    page_num = len(pages) + 1
    pages.append([])
    page = pages[-1]
    y = page_header(page, page_num)
    return page, y


def add_wrapped_text(
    pages: list[list[str]],
    y: int,
    text: str,
    *,
    font: str = "F1",
    size: int = 11,
    color: tuple[float, float, float] = (0.15, 0.2, 0.27),
    indent: int = 0,
) -> int:
    lines = wrap_text(text, size, PAGE_W - LEFT - RIGHT - indent)
    for line in lines:
        page, y = ensure_space(pages, y, LINE_GAP)
        page.append(text_cmd(LEFT + indent, y, font, size, line, color))
        y -= LINE_GAP
    return y


def add_section(pages: list[list[str]], y: int, title: str, body_lines: list[str], bullet: bool = False) -> int:
    page, y = ensure_space(pages, y, 28)
    page.append(text_cmd(LEFT, y, "F2", 14, title, (0.06, 0.25, 0.56)))
    y -= 20
    for entry in body_lines:
        if bullet:
            page, y = ensure_space(pages, y, LINE_GAP)
            page.append(text_cmd(LEFT, y, "F1", 11, "-", (0.06, 0.25, 0.56)))
            y = add_wrapped_text(
                pages,
                y,
                entry,
                font="F1",
                size=11,
                color=(0.15, 0.2, 0.27),
                indent=14,
            )
        else:
            y = add_wrapped_text(pages, y, entry, font="F1", size=11, color=(0.15, 0.2, 0.27))
        y -= 4
    y -= 8
    return y


def build_pages() -> list[bytes]:
    pages: list[list[str]] = [[]]
    y = page_header(pages[0], 1)

    y = add_wrapped_text(
        pages,
        y,
        "WaterApps helps regulated teams design, secure, and scale cloud delivery systems with practical engineering execution.",
        font="F1",
        size=12,
        color=(0.12, 0.18, 0.26),
    )
    y -= 8
    y = add_section(
        pages,
        y,
        "Company Snapshot",
        [
            "Legal entity: Water Apps Pty Ltd",
            "ABN: 63 632 823 084",
            "Primary region: Australia",
            "Model: Principal-led delivery with specialist augmentation as needed",
        ],
        bullet=True,
    )

    y = add_section(
        pages,
        y,
        "Core Services",
        [
            "Platform engineering and cloud modernization",
            "DevSecOps and CI/CD hardening with auditable controls",
            "Kubernetes architecture, security baseline, and delivery enablement",
            "Operational runbooks, automation, and reliability improvements",
        ],
        bullet=True,
    )

    y = add_section(
        pages,
        y,
        "Engagement Types",
        [
            "Discovery and architecture assessment",
            "Targeted remediation and technical uplift",
            "Delivery acceleration with repeatable templates and playbooks",
            "Advisory support for procurement and enterprise readiness",
        ],
        bullet=True,
    )

    y = add_section(
        pages,
        y,
        "Regulated Environment Alignment",
        [
            "Experience supporting delivery contexts in banking, government, and telecommunications.",
            "Emphasis on evidence-linked workflows, least-privilege controls, and repeatable operational governance.",
            "Public artifacts are sanitized by design while deeper detail can be shared during procurement stages.",
        ],
        bullet=False,
    )

    y = add_section(
        pages,
        y,
        "Representative Outcomes",
        [
            "Reduced delivery lead time through standardized CI/CD and environment controls.",
            "Improved deployment safety using approval gates, traceable change records, and runbook-driven operations.",
            "Higher platform consistency via reusable infrastructure and documentation baselines.",
        ],
        bullet=True,
    )

    y = add_section(
        pages,
        y,
        "Operating Principles",
        [
            "Build trust first: secure defaults, explicit ownership, and measurable controls.",
            "Ship with evidence: every delivery item links to proof of execution.",
            "Design for repeatability: productize useful patterns to reduce risk and cost over time.",
        ],
        bullet=True,
    )

    y = add_section(
        pages,
        y,
        "Contact and Next Step",
        [
            "Website: https://www.waterapps.com.au",
            "Capability statement web version: https://www.waterapps.com.au/capability-statement.html",
            "Contact: varun@waterapps.com.au",
            "Recommended next step: 30-minute discovery call to align scope, risks, and delivery model.",
        ],
        bullet=False,
    )

    for page in pages:
        page_footer(page)

    return ["\n".join(page).encode("latin-1", errors="replace") for page in pages]


def build_pdf(page_streams: list[bytes]) -> bytes:
    page_count = len(page_streams)

    # Object ids:
    # 1: catalog, 2: pages-root
    # per page: page object + content object
    # final: font regular, font bold
    def page_obj_id(i: int) -> int:
        return 3 + (i * 2)

    def content_obj_id(i: int) -> int:
        return 4 + (i * 2)

    font_regular_id = 3 + (page_count * 2)
    font_bold_id = font_regular_id + 1
    total_objects = font_bold_id

    objects: dict[int, bytes] = {}
    objects[1] = b"<< /Type /Catalog /Pages 2 0 R >>"

    kids = " ".join(f"{page_obj_id(i)} 0 R" for i in range(page_count))
    objects[2] = f"<< /Type /Pages /Kids [{kids}] /Count {page_count} >>".encode("ascii")

    for i, stream in enumerate(page_streams):
        pid = page_obj_id(i)
        cid = content_obj_id(i)
        objects[pid] = (
            f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {PAGE_W} {PAGE_H}] "
            f"/Resources << /Font << /F1 {font_regular_id} 0 R /F2 {font_bold_id} 0 R >> >> "
            f"/Contents {cid} 0 R >>"
        ).encode("ascii")
        objects[cid] = f"<< /Length {len(stream)} >>\nstream\n".encode("ascii") + stream + b"\nendstream"

    objects[font_regular_id] = b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"
    objects[font_bold_id] = b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>"

    pdf = bytearray(b"%PDF-1.4\n")
    offsets = [0] * (total_objects + 1)

    for obj_id in range(1, total_objects + 1):
        offsets[obj_id] = len(pdf)
        pdf.extend(f"{obj_id} 0 obj\n".encode("ascii"))
        pdf.extend(objects[obj_id])
        pdf.extend(b"\nendobj\n")

    xref_start = len(pdf)
    pdf.extend(f"xref\n0 {total_objects + 1}\n".encode("ascii"))
    pdf.extend(b"0000000000 65535 f \n")
    for obj_id in range(1, total_objects + 1):
        pdf.extend(f"{offsets[obj_id]:010d} 00000 n \n".encode("ascii"))

    pdf.extend(
        (
            f"trailer\n<< /Size {total_objects + 1} /Root 1 0 R >>\n"
            f"startxref\n{xref_start}\n%%EOF\n"
        ).encode("ascii")
    )
    return bytes(pdf)


def main() -> None:
    repo_root = Path(__file__).resolve().parents[1]
    out_pdf = repo_root / "capability-statement.pdf"
    page_streams = build_pages()
    out_pdf.write_bytes(build_pdf(page_streams))
    print(f"Wrote {out_pdf} ({len(page_streams)} pages)")


if __name__ == "__main__":
    main()
