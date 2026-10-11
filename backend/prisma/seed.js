// SYNTHETIC DEMO DATA ONLY. These facilities and numbers are fictional.
require('dotenv').config({ quiet: true });
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const BLOOD_GROUPS = ['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG'];

// [min, max] units per blood group (inclusive). Rarer groups sit lower, so the demo has variety:
// mostly healthy stock, with a realistic minority of low and critical rows.
const RANGE = {
  A_POS: [4, 60], B_POS: [4, 60], O_POS: [4, 60],
  A_NEG: [2, 34], B_NEG: [2, 34], O_NEG: [2, 34], AB_POS: [2, 34],
  AB_NEG: [1, 22],
};

// Fixed values for the live demo ("search O+ in Pune, then change one").
const DEMO_OVERRIDES = {
  'Pune Lifeline Hospital (Demo)|O_POS': 18,   // MEDIUM: update it to 3 to show the risk change
  'Deccan Blood Bank (Demo)|O_POS': 34,        // LOW
  'Lakeside Medical Centre (Demo)|O_POS': 12,  // MEDIUM
  'Pune Lifeline Hospital (Demo)|O_NEG': 6,    // HIGH
};

const FACILITIES = [
  ['Mumbai Central Care (Demo)', 'HOSPITAL', 'Mumbai', 'Maharashtra'],
  ['Harbour Blood Centre (Demo)', 'BLOOD_BANK', 'Mumbai', 'Maharashtra'],
  ['Pune Lifeline Hospital (Demo)', 'HOSPITAL', 'Pune', 'Maharashtra'],
  ['Deccan Blood Bank (Demo)', 'BLOOD_BANK', 'Pune', 'Maharashtra'],
  ['Godavari Community Hospital (Demo)', 'HOSPITAL', 'Nashik', 'Maharashtra'],
  ['Nagpur Orange City Hospital (Demo)', 'HOSPITAL', 'Nagpur', 'Maharashtra'],
  ['Vidarbha Blood Bank (Demo)', 'BLOOD_BANK', 'Nagpur', 'Maharashtra'],
  ['Capital General Hospital (Demo)', 'HOSPITAL', 'Delhi', 'Delhi'],
  ['Yamuna Blood Centre (Demo)', 'BLOOD_BANK', 'Delhi', 'Delhi'],
  ['Garden City Hospital (Demo)', 'HOSPITAL', 'Bengaluru', 'Karnataka'],
  ['Silicon Valley Blood Bank (Demo)', 'BLOOD_BANK', 'Bengaluru', 'Karnataka'],
  ['Charminar Care Hospital (Demo)', 'HOSPITAL', 'Hyderabad', 'Telangana'],
  ['Deccan Plateau Blood Bank (Demo)', 'BLOOD_BANK', 'Hyderabad', 'Telangana'],
  ['Lakeside Medical Centre (Demo)', 'HOSPITAL', 'Pune', 'Maharashtra'],
];

// Small deterministic random generator (same seed, same data every run).
function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

async function seedAdmin() {
  const { ADMIN_NAME = 'Demo Admin', ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 10) {
    console.warn('Skipping admin user: set ADMIN_EMAIL and ADMIN_PASSWORD (10+ chars) in .env');
    return;
  }
  const email = ADMIN_EMAIL.toLowerCase();
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await prisma.user.upsert({
    where: { email },
    update: { name: ADMIN_NAME, passwordHash },
    create: { name: ADMIN_NAME, email, passwordHash, role: 'ADMIN' },
  });
  console.log(`Admin user ready: ${email}`);
}

// A few synthetic alerts for the most urgent rows, so the dashboard's alert panel has content.
// Thresholds come from the same central risk service the API uses.
async function seedAlerts() {
  const { calculateRisk } = require('../src/services/riskService');
  const { toApi } = require('../src/utils/bloodGroups');

  const rows = await prisma.bloodInventory.findMany({
    include: { facility: true },
    orderBy: [{ unitsAvailable: 'asc' }, { id: 'asc' }],
  });
  const urgent = rows
    .map((row) => ({ row, level: calculateRisk(row.unitsAvailable).level }))
    .filter(({ level }) => level === 'CRITICAL' || level === 'HIGH')
    .slice(0, 6);

  for (const [i, { row, level }] of urgent.entries()) {
    await prisma.alert.create({
      data: {
        bloodGroup: row.bloodGroup,
        location: `${row.facility.city}, ${row.facility.state}`,
        riskLevel: level,
        message: `${toApi(row.bloodGroup)} stock at ${row.facility.name} is ${level} (${row.unitsAvailable} units).`,
        createdAt: new Date(Date.now() - (i + 1) * 90 * 60 * 1000), // 1.5 h apart
      },
    });
  }
  console.log(`Seeded ${urgent.length} demo alerts.`);
}

async function main() {
  const rand = mulberry32(2026);

  // Clear in FK-safe order so the seed can be re-run.
  await prisma.alert.deleteMany();
  await prisma.bloodInventory.deleteMany();
  await prisma.facility.deleteMany();

  for (const [name, type, city, state] of FACILITIES) {
    const facility = await prisma.facility.create({
      data: { name, type, city, state, contact: 'demo-contact@example.invalid' },
    });

    const rows = BLOOD_GROUPS.map((bloodGroup) => {
      const [min, max] = RANGE[bloodGroup];
      const random = min + Math.floor(rand() * (max - min + 1)); // always drawn, so data stays deterministic
      const unitsAvailable = DEMO_OVERRIDES[`${name}|${bloodGroup}`] ?? random;
      return { facilityId: facility.id, bloodGroup, unitsAvailable };
    });

    await prisma.bloodInventory.createMany({ data: rows });
  }

  await seedAlerts();
  await seedAdmin();

  const facilities = await prisma.facility.count();
  const inventory = await prisma.bloodInventory.count();
  console.log(`Seeded ${facilities} demo facilities and ${inventory} inventory rows (synthetic data).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
