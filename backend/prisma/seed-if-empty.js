// Loads the SYNTHETIC demo data only when the database has no facilities.
// Safe to run on every deploy: it never wipes existing data.
require('dotenv').config({ quiet: true });
const path = require('path');
const { spawnSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  const count = await prisma.facility.count();
  await prisma.$disconnect();

  if (count > 0) {
    console.log(`[seed] ${count} facilities already exist, skipping demo data`);
    return;
  }

  console.log('[seed] database is empty, loading synthetic demo data');
  const result = spawnSync(process.execPath, [path.join(__dirname, 'seed.js')], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
