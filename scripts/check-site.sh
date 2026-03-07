#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

fail() {
  echo "[FAIL] $1" >&2
  exit 1
}

pass() {
  echo "[PASS] $1"
}

required_files=(
  "index.html"
  "privacy.html"
  "terms.html"
  "enterprise-readiness.html"
  "portal-login.html"
  "management-dashboard.html"
  "robots.txt"
  "sitemap.xml"
  "CNAME"
)

for f in "${required_files[@]}"; do
  [[ -f "$f" ]] || fail "Missing required file: $f"
done
pass "required files present"

# Basic HTML closing tag sanity (cheap guard against accidental truncation)
for f in index.html privacy.html terms.html enterprise-readiness.html portal-login.html management-dashboard.html; do
  tail -20 "$f" | grep -q '</html>' || fail "$f missing closing </html>"
  tail -20 "$f" | grep -q '</body>' || fail "$f missing closing </body>"
done
pass "html files close correctly"

# Internal href targets (local html files + anchors) in index page
while IFS= read -r href; do
  [[ -z "$href" ]] && continue
  case "$href" in
    \#*)
      anchor="${href#\#}"
      [[ "$anchor" == "" ]] && continue
      grep -Eq "id=\"$anchor\"" index.html || fail "Missing anchor target in index.html: $href"
      ;;
    *.html)
      [[ -f "$href" ]] || fail "Missing local html target: $href"
      ;;
    *.html\#*)
      page="${href%%#*}"
      anchor="${href#*#}"
      [[ -f "$page" ]] || fail "Missing local html target: $page"
      grep -Eq "id=\"$anchor\"" "$page" || fail "Missing anchor '$anchor' in $page"
      ;;
    *)
      :
      ;;
  esac
done < <(grep -Eo 'href="[^"]+"' index.html | sed -E 's/^href="(.*)"$/\1/' | sort -u)
pass "internal links and anchors resolve"

# Security hygiene spot checks
grep -q 'rel="noopener noreferrer"' index.html || fail "Expected noopener/noreferrer in index.html external links"
grep -q 'Privacy Policy' index.html || fail "Expected Privacy Policy link on homepage"
grep -q 'Website Terms' index.html || fail "Expected Website Terms link on homepage"
pass "homepage legal/security markers present"

# Portal route must remain fail-closed for unauthenticated users
grep -q "window.__WATERAPPS_PORTAL_AUTH_STATUS" management-dashboard.html || fail "Dashboard auth bootstrap marker missing"
grep -q "data-portal-auth" management-dashboard.html || fail "Dashboard auth render gate missing"
grep -q "noscript" management-dashboard.html || fail "Dashboard noscript redirect missing"
pass "management dashboard auth gates present"

echo "Site quality checks passed."
