#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SRC_DIR="$ROOT_DIR/assets/diagrams/src"
OUT_DIR="$ROOT_DIR/assets/diagrams/insights"
THEME=5
PAD=48

render() {
  local source_file="$1"
  local output_file="$2"
  d2 "$source_file" "$output_file" --theme="$THEME" --layout=dagre --scale=1 --pad="$PAD" --salt="$(basename "$source_file" .d2)"
}

mkdir -p "$OUT_DIR"
render "$SRC_DIR/insights-aks-scaling-enterprise.d2" "$OUT_DIR/insights-aks-scaling-enterprise.svg"
render "$SRC_DIR/insights-gitops-regulated-releases.d2" "$OUT_DIR/insights-gitops-regulated-releases.svg"
