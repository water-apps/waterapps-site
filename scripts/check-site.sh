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
  "management-dashboard.html"
  "privacy.html"
  "terms.html"
  "enterprise-readiness.html"
  "schedulease.html"
  "service-overview.html"
  "reference-architecture.html"
  "portal-login.html"
  "robots.txt"
  "sitemap.xml"
  "CNAME"
  "assets/docs/capability-statement.pdf"
  "assets/docs/service-overview.pdf"
  "assets/docs/reference-architecture.pdf"
)

for f in "${required_files[@]}"; do
  [[ -f "$f" ]] || fail "Missing required file: $f"
done
pass "required files present"

# Basic HTML closing tag sanity (cheap guard against accidental truncation)
for f in index.html privacy.html terms.html enterprise-readiness.html schedulease.html service-overview.html reference-architecture.html portal-login.html management-dashboard.html; do
  tail -20 "$f" | grep -q '</html>' || fail "$f missing closing </html>"
  tail -20 "$f" | grep -q '</body>' || fail "$f missing closing </body>"
done
pass "html files close correctly"

grep -q 'assets/docs/capability-statement.pdf' capability-statement-download.html || fail "Expected capability statement download route to use assets/docs path"
pass "public document download path is wired"

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
grep -q 'https://calendar.app.google/MaHkjyQHyDLd5qPw5' index.html || fail "Expected Google Calendar fallback booking link on homepage"
if grep -q 'calendly-inline-widget' index.html; then
  fail "Calendly embed should not exist after native booking rollout"
fi
pass "booking flow markers present"

# Dashboard moderation regression guards
[[ -f "scripts/management-dashboard.js" ]] || fail "Expected dashboard moderation script"
grep -q 'id="reviews-moderation"' management-dashboard.html || fail "Expected reviews moderation section in management dashboard"
grep -q 'scripts/management-dashboard.js' management-dashboard.html || fail "Expected management dashboard script include"
pass "management dashboard moderation markers present"

# Portal route must remain fail-closed for unauthenticated users
grep -q "window.__WATERAPPS_PORTAL_AUTH_STATUS" management-dashboard.html || fail "Dashboard auth bootstrap marker missing"
grep -q "data-portal-auth" management-dashboard.html || fail "Dashboard auth render gate missing"
grep -q "noscript" management-dashboard.html || fail "Dashboard noscript redirect missing"
pass "management dashboard auth gates present"

# Public content policy: do not expose internal tool names.
blocked_term="$(printf '\143\157\144\145\170')"
if grep -R -n -i --include='*.html' "\\b${blocked_term}\\b" . >/tmp/internal_tooling_policy_hits.txt; then
  fail "Public HTML contains blocked internal tooling reference (see /tmp/internal_tooling_policy_hits.txt)"
fi
pass "internal tooling names are not exposed in public pages"

echo "Site quality checks passed."
