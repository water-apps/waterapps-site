# WaterApps Diagram Workflow

Use a free, source-controlled D2 workflow for WaterApps architecture diagrams.

## Standard

1. Keep diagram sources in:
   - `assets/diagrams/src/`
2. Write both `insight` and `reference` diagrams as `.d2` files.
3. Render website-ready SVG outputs into:
   - `assets/diagrams/insights/`
   - `assets/diagrams/reference/`
4. Follow the core notation standard in:
   - `/Users/varunau/Projects/waterapps/instances/water-apps/waterapps/docs/architecture/D2_ARCHITECTURE_STANDARD.md`
5. Prefer simple left-to-right architecture or delivery flows unless a trust-boundary grouping is clearer.

## Tooling

This repo now uses:

- `D2` for diagram authoring
- `scripts/render_insight_diagrams.sh` for reproducible SVG output

Current source files:

- `assets/diagrams/src/insights-400-enterprise-aws-stack.d2`
- `assets/diagrams/src/insights-aks-scaling-enterprise.d2`
- `assets/diagrams/src/insights-gitops-regulated-releases.d2`
- `assets/diagrams/src/reference-waterapps-default-product-stack.d2`
- `assets/diagrams/src/reference-waterapps-serverless-intake.d2`
- `assets/diagrams/src/reference-waterapps-hosted-api-worker.d2`
- `assets/diagrams/src/reference-waterapps-observability-stack.d2`

## Render Commands

Render all maintained insight diagrams:

```bash
./scripts/render_insight_diagrams.sh
```

Validate individual source files:

```bash
d2 validate assets/diagrams/src/insights-400-enterprise-aws-stack.d2
d2 validate assets/diagrams/src/insights-aks-scaling-enterprise.d2
d2 validate assets/diagrams/src/insights-gitops-regulated-releases.d2
d2 validate assets/diagrams/src/reference-waterapps-default-product-stack.d2
d2 validate assets/diagrams/src/reference-waterapps-serverless-intake.d2
d2 validate assets/diagrams/src/reference-waterapps-hosted-api-worker.d2
d2 validate assets/diagrams/src/reference-waterapps-observability-stack.d2
```

## Rendering Defaults

The render script uses:

- theme `5` (`Mixed Berry Blue`)
- `dagre` layout
- `48px` padding
- unique salts per diagram so SVG IDs stay stable when multiple diagrams appear on one page

## Design Rules

- insight diagrams: 4 to 6 blocks max
- reference diagrams: 6 to 10 blocks max
- one clear primary flow direction
- short labels with outcome-oriented edge text
- architecture first, implementation second
- trust boundaries should be explicit in reference diagrams
- diagrams should explain the operating model, not decorate the page

## Why D2

- free and source-controlled
- cleaner architecture layouts than ad hoc hand-drawn blocks
- easy to review in Git
- fast to regenerate for website, PDF, or article updates
- works well for a reusable WaterApps reference architecture library

## Vendor Icon Rule

- Use official vendor architecture icons when the diagram represents a named cloud service.
- Use official GitHub icons when a workflow step specifically represents GitHub concepts like issues, pull requests, or repository state.
- Keep only the minimum SVG subset needed in-repo under `assets/icons/vendors/`.
- Prefer Azure icons for Azure service diagrams and AWS icons for AWS service diagrams.
- Do not mix unofficial logo packs with official architecture icon sets.
