#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
VENDOR_DIR="$ROOT_DIR/assets/icons/vendors"
SIMPLE_DIR="$VENDOR_DIR/simple"
GITHUB_DIR="$VENDOR_DIR/github"

mkdir -p "$SIMPLE_DIR" "$GITHUB_DIR"

fetch() {
  local url="$1"
  local out="$2"
  curl -sSL "$url" -o "$out"
}

fetch "https://unpkg.com/simple-icons/icons/kubernetes.svg" "$SIMPLE_DIR/kubernetes.svg"
fetch "https://unpkg.com/simple-icons/icons/terraform.svg" "$SIMPLE_DIR/terraform.svg"
fetch "https://unpkg.com/simple-icons/icons/docker.svg" "$SIMPLE_DIR/docker.svg"
fetch "https://unpkg.com/simple-icons/icons/python.svg" "$SIMPLE_DIR/python.svg"
fetch "https://unpkg.com/simple-icons/icons/slack.svg" "$SIMPLE_DIR/slack.svg"
fetch "https://unpkg.com/simple-icons/icons/n8n.svg" "$SIMPLE_DIR/n8n.svg"
fetch "https://unpkg.com/simple-icons/icons/prometheus.svg" "$SIMPLE_DIR/prometheus.svg"
fetch "https://unpkg.com/simple-icons/icons/grafana.svg" "$SIMPLE_DIR/grafana.svg"
fetch "https://unpkg.com/simple-icons/icons/githubactions.svg" "$SIMPLE_DIR/githubactions.svg"
fetch "https://unpkg.com/simple-icons/icons/postgresql.svg" "$SIMPLE_DIR/postgresql.svg"
fetch "https://unpkg.com/simple-icons/icons/nginx.svg" "$SIMPLE_DIR/nginx.svg"
fetch "https://unpkg.com/simple-icons/icons/react.svg" "$SIMPLE_DIR/react.svg"
fetch "https://unpkg.com/simple-icons/icons/node.js.svg" "$SIMPLE_DIR/nodejs.svg"

fetch "https://unpkg.com/@primer/octicons@19.15.0/build/svg/mark-github-16.svg" "$GITHUB_DIR/mark-github-16.svg"
fetch "https://unpkg.com/@primer/octicons@19.15.0/build/svg/git-pull-request-16.svg" "$GITHUB_DIR/git-pull-request-16.svg"
fetch "https://unpkg.com/@primer/octicons@19.15.0/build/svg/issue-opened-16.svg" "$GITHUB_DIR/issue-opened-16.svg"
