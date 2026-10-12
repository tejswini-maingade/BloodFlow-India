#!/usr/bin/env bash
# Post-deployment smoke test. Works against any BloodFlow URL (local, Docker or AWS).
# Usage: scripts/smoke-test.sh http://your-domain
# Needs: curl, jq.
set -uo pipefail

BASE="${1:?Usage: $0 http://your-domain}"
BASE="${BASE%/}"
fail=0

check() { # $1 = name, $2 = exit code of the test just run
  if [ "$2" -eq 0 ]; then echo "PASS  $1"; else echo "FAIL  $1"; fail=1; fi
}
code() { curl -s -o /dev/null -m 15 -w "%{http_code}" "$@"; }

[ "$(curl -s -m 15 "$BASE/health" | jq -r .status 2>/dev/null)" = "healthy" ]
check "GET /health reports healthy" $?

[ "$(code "$BASE/")" = "200" ]
check "GET / serves the React app" $?

[ "$(code "$BASE/availability")" = "200" ]
check "SPA route /availability returns 200" $?

[ "$(code "$BASE/api/nope")" = "404" ]
check "unknown API route returns 404" $?

[ "$(curl -s -m 15 "$BASE/api/dashboard" | jq -r '.data.totals.totalFacilities // 0' 2>/dev/null)" -gt 0 ] 2>/dev/null
check "dashboard reads facilities from the database" $?

[ "$(curl -s -m 15 "$BASE/api/blood?bloodGroup=O%2B&city=Pune" | jq -r '.meta.count // 0' 2>/dev/null)" -gt 0 ] 2>/dev/null
check "search O+ in Pune returns results" $?

[ "$(code -X DELETE "$BASE/api/blood/1")" = "401" ]
check "write without a token is rejected (401)" $?

curl -s -m 15 "$BASE/.env" | grep -qE "JWT_SECRET|DATABASE_URL" ; [ $? -ne 0 ]
check "/.env does not expose secrets" $?

curl -sI -m 15 "$BASE/" | grep -qi "x-content-type-options: nosniff"
check "security headers (Helmet) are present" $?

echo
if [ "$fail" -eq 0 ]; then echo "All checks passed."; else echo "Some checks FAILED."; exit 1; fi
