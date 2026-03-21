#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="${ROOT}/dist"

rm -rf "${DIST_DIR}"
mkdir -p "${DIST_DIR}"

rsync -a --delete \
  --exclude '.git/' \
  --exclude '.github/' \
  --exclude 'docs/' \
  --exclude 'node_modules/' \
  --exclude 'scripts/' \
  --exclude 'test-results/' \
  --exclude 'tests/' \
  --exclude 'CODEOWNERS' \
  --exclude 'CNAME' \
  --exclude 'package-lock.json' \
  --exclude 'package.json' \
  --exclude 'playwright.config.js' \
  --exclude 'tailwind.config.cjs' \
  "${ROOT}/" "${DIST_DIR}/"

echo "Deployment bundle created at ${DIST_DIR}"
