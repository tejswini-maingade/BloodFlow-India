#!/usr/bin/env bash
# Builds the Elastic Beanstalk deployment zip: backend + built React app, nothing else.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

STAGE="build/eb-bundle"
ZIP="build/bloodflow-eb-$(date +%Y%m%d-%H%M%S).zip"

echo "==> Building the React app"
(cd frontend && npm ci && npm run build)

echo "==> Assembling the bundle"
rm -rf "$STAGE"
mkdir -p "$STAGE"
cp backend/package.json backend/package-lock.json "$STAGE/"
cp -r backend/src backend/prisma "$STAGE/"
cp -r frontend/dist "$STAGE/public"          # Express serves this folder
[ -d .platform ] && cp -r .platform "$STAGE/"

echo "==> Safety checks"
test -f "$STAGE/public/index.html" || { echo "FAIL: React build missing"; exit 1; }
test -f "$STAGE/package-lock.json" || { echo "FAIL: lockfile missing"; exit 1; }
if find "$STAGE" -name '.env*' | grep -q .; then
  echo "FAIL: an .env file is inside the bundle. Refusing to continue."; exit 1
fi
if find "$STAGE" -name node_modules -prune | grep -q .; then
  echo "FAIL: node_modules is inside the bundle."; exit 1
fi

echo "==> Zipping"
(cd "$STAGE" && zip -qr "$ROOT/$ZIP" .)

echo "Created: $ZIP ($(du -h "$ZIP" | cut -f1))"
unzip -l "$ZIP" | tail -n 1
