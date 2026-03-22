#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="${1:-${ROOT}/dist}"

release_sha="${BUILD_RELEASE_SHA:-$(git -C "${ROOT}" rev-parse HEAD)}"
release_version="${BUILD_RELEASE_VERSION:-$(git -C "${ROOT}" describe --tags --always --dirty 2>/dev/null || git -C "${ROOT}" rev-parse --short=12 HEAD)}"
release_ref="${BUILD_RELEASE_REF:-$(git -C "${ROOT}" rev-parse --abbrev-ref HEAD)}"
release_created_at="${BUILD_RELEASE_CREATED_AT:-$(date -u +"%Y-%m-%dT%H:%M:%SZ")}"
release_id="${BUILD_RELEASE_ID:-${release_sha}}"
release_target="${BUILD_RELEASE_TARGET:-static-site}"
release_run_id="${BUILD_RELEASE_RUN_ID:-}"
release_run_attempt="${BUILD_RELEASE_RUN_ATTEMPT:-}"
release_run_url="${BUILD_RELEASE_RUN_URL:-}"
release_bucket_prefix="${BUILD_RELEASE_BUCKET_PREFIX:-}"

rm -rf "${DIST_DIR}"
mkdir -p "${DIST_DIR}"

rsync -a --delete \
  --exclude '.git/' \
  --exclude '.github/' \
  --exclude '.DS_Store' \
  --exclude 'dist/' \
  --exclude 'docs/' \
  --exclude 'node_modules/' \
  --exclude 'scripts/' \
  --exclude 'test-results/' \
  --exclude 'tests/' \
  --exclude 'CODEOWNERS' \
  --exclude 'package-lock.json' \
  --exclude 'package.json' \
  --exclude 'playwright.config.js' \
  --exclude 'tailwind.config.cjs' \
  "${ROOT}/" "${DIST_DIR}/"

cat > "${DIST_DIR}/release.json" <<EOF
{
  "release_id": "${release_id}",
  "release_sha": "${release_sha}",
  "release_version": "${release_version}",
  "release_ref": "${release_ref}",
  "release_created_at": "${release_created_at}",
  "release_target": "${release_target}",
  "release_run_id": "${release_run_id}",
  "release_run_attempt": "${release_run_attempt}",
  "release_run_url": "${release_run_url}",
  "release_bucket_prefix": "${release_bucket_prefix}"
}
EOF

cat > "${DIST_DIR}/release.txt" <<EOF
release_id=${release_id}
release_sha=${release_sha}
release_version=${release_version}
release_ref=${release_ref}
release_created_at=${release_created_at}
release_target=${release_target}
release_run_id=${release_run_id}
release_run_attempt=${release_run_attempt}
release_run_url=${release_run_url}
release_bucket_prefix=${release_bucket_prefix}
EOF

echo "Deployment bundle created at ${DIST_DIR}"
