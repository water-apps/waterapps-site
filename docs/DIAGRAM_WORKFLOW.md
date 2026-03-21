# WaterApps Diagram Workflow

Use a free, source-controlled workflow for architecture diagrams.

## Standard

1. Keep diagram source specs in:
   - `assets/diagrams/src/`
2. Render website-ready SVG outputs into:
   - `assets/diagrams/insights/`
3. Prefer simple left-to-right architecture or delivery flows for insight articles.

## Current Renderer

This repo includes:

- `scripts/render_insight_diagram.py`

The script reads a JSON spec and produces a WaterApps-styled SVG with:

- soft blue background
- white cards with blue stroke
- horizontal arrows
- clean sans-serif labels

## Render Command

```bash
python3 scripts/render_insight_diagram.py \
  --spec assets/diagrams/src/insights-aks-scaling-enterprise.json \
  --output assets/diagrams/insights/insights-aks-scaling-enterprise.svg
```

```bash
python3 scripts/render_insight_diagram.py \
  --spec assets/diagrams/src/insights-gitops-regulated-releases.json \
  --output assets/diagrams/insights/insights-gitops-regulated-releases.svg
```

## Design Rules

- 4 to 6 blocks max
- one flow direction
- short labels
- architecture first, implementation second
- diagrams should explain the operating model, not decorate the page

## Tooling Direction

Preferred long-term authoring option:

- `D2` for source-controlled diagrams when the CLI is available

Current repo-native fallback:

- JSON spec + Python SVG renderer

This keeps the workflow free, version-controlled, and easy to automate in CI.
