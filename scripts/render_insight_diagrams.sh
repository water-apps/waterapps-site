#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SRC_DIR="$ROOT_DIR/assets/diagrams/src"
INSIGHTS_DIR="$ROOT_DIR/assets/diagrams/insights"
REFERENCE_DIR="$ROOT_DIR/assets/diagrams/reference"
THEME=5
PAD=48

render() {
  local source_file="$1"
  local output_file="$2"
  d2 "$source_file" "$output_file" --theme="$THEME" --layout=dagre --scale=1 --pad="$PAD" --salt="$(basename "$source_file" .d2)"
}

mkdir -p "$INSIGHTS_DIR" "$REFERENCE_DIR"
render "$SRC_DIR/insights-aks-scaling-enterprise.d2" "$INSIGHTS_DIR/insights-aks-scaling-enterprise.svg"
render "$SRC_DIR/insights-400-enterprise-aws-stack.d2" "$INSIGHTS_DIR/insights-400-enterprise-aws-stack.svg"
render "$SRC_DIR/insights-gitops-regulated-releases.d2" "$INSIGHTS_DIR/insights-gitops-regulated-releases.svg"

render "$SRC_DIR/reference-waterapps-default-product-stack.d2" "$REFERENCE_DIR/reference-waterapps-default-product-stack.svg"
render "$SRC_DIR/reference-waterapps-serverless-intake.d2" "$REFERENCE_DIR/reference-waterapps-serverless-intake.svg"
render "$SRC_DIR/reference-waterapps-hosted-api-worker.d2" "$REFERENCE_DIR/reference-waterapps-hosted-api-worker.svg"
render "$SRC_DIR/reference-waterapps-observability-stack.d2" "$REFERENCE_DIR/reference-waterapps-observability-stack.svg"
