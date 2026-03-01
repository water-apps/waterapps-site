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
  "robots.txt"
  "sitemap.xml"
  "CNAME"
)

for f in "${required_files[@]}"; do
  [[ -f "$f" ]] || fail "Missing required file: $f"
done
pass "required files present"

# Basic HTML closing tag sanity (cheap guard against accidental truncation)
for f in index.html privacy.html terms.html enterprise-readiness.html; do
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

# Booking flow regression guards
grep -q 'id="booking-form"' index.html || fail "Expected native booking form on homepage"
grep -q 'data-availability-endpoint=' index.html || fail "Expected availability endpoint wiring on booking form"
grep -q 'data-booking-endpoint=' index.html || fail "Expected booking endpoint wiring on booking form"
grep -q 'id="booking-slot"' index.html || fail "Expected booking slot selector on homepage"
if grep -q 'calendly-inline-widget' index.html; then
  fail "Calendly embed should not exist after native booking rollout"
fi
pass "booking flow markers present"

# Public content policy: do not expose internal tool names.
blocked_term="$(printf '\143\157\144\145\170')"
if grep -R -n -i --include='*.html' "\\b${blocked_term}\\b" . >/tmp/internal_tooling_policy_hits.txt; then
  fail "Public HTML contains blocked internal tooling reference (see /tmp/internal_tooling_policy_hits.txt)"
fi
pass "internal tooling names are not exposed in public pages"

echo "Site quality checks passed."
