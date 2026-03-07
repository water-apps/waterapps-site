#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

run_module() {
  local name="$1"
  local cmd="$2"
  echo "== Module: ${name} =="
  eval "$cmd"
  echo
}

./scripts/check-site.sh

run_module "marketing" "npm run test:module:marketing"
run_module "portal" "npm run test:module:portal"
run_module "booking" "npm run test:module:booking"
run_module "dashboard" "npm run test:module:dashboard"

echo "All module test suites passed."
