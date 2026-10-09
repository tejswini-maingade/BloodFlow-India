// SYNTHETIC DEMO DATA ONLY. These facilities and numbers are fictional.
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const BLOOD_GROUPS = ['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG'];

// Rarer groups get lower stock, so the demo shows realistic variety.
const SCALE = { A_POS: 1, A_NEG: 0.35, B_POS: 0.9, B_NEG: 0.3, AB_POS: 0.4, AB_NEG: 0.15, O_POS: 1.1, O_NEG: 0.3 };

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
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

async function main() {
  const rand = mulberry32(2026);

  // Clear in FK-safe order so the seed can be re-run.
  await prisma.blood_inventory_placeholder?.deleteMany?.();
  await prisma.bloodInventory.deleteMany();
  await prisma.facility.deleteMany();

  for (const [name, type, city, state] of FACILITIES) {
    const facility = await prisma.facility.create({
      data: { name, type, city, state, contact: 'demo-contact@example.invalid' },
    });

    const rows = BLOOD_GROUPS.map((bloodGroup) => ({
      facilityId: facility.id,
      bloodGroup,
      unitsAvailable: Math.round((4 + rand() * 40) * SCALE[bloodGroup]),
    }));

    await prisma.bloodInventory.createMany({ data: rows });
  }

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
