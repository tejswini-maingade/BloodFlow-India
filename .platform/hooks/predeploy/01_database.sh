#!/bin/bash
# Runs on Elastic Beanstalk before each new version starts.
# 1) apply database migrations  2) load synthetic demo data only if the database is empty.
set -euo pipefail

cd /var/app/staging

echo "[hook] applying database migrations"
node node_modules/prisma/build/index.js migrate deploy

echo "[hook] checking whether demo data is needed"
node prisma/seed-if-empty.js
