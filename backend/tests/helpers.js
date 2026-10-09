const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const prisma = require('../src/utils/prisma');

const ADMIN = { email: 'admin@test.example', password: 'test-password-123' };

async function resetDb() {
  await prisma.alert.deleteMany();
  await prisma.bloodInventory.deleteMany();
  await prisma.facility.deleteMany();
  await prisma.user.deleteMany();
}

// Known data, so every test knows exactly what to expect.
async function seedBasics() {
  const pune = await prisma.facility.create({
    data: { name: 'Test Hospital Pune', type: 'HOSPITAL', city: 'Pune', state: 'Maharashtra' },
  });
  const mumbai = await prisma.facility.create({
    data: { name: 'Test Blood Bank Mumbai', type: 'BLOOD_BANK', city: 'Mumbai', state: 'Maharashtra' },
  });

  await prisma.bloodInventory.createMany({
    data: [
      { facilityId: pune.id, bloodGroup: 'O_POS', unitsAvailable: 25 },   // LOW
      { facilityId: pune.id, bloodGroup: 'O_NEG', unitsAvailable: 3 },    // CRITICAL
      { facilityId: mumbai.id, bloodGroup: 'O_POS', unitsAvailable: 12 }, // MEDIUM
      { facilityId: mumbai.id, bloodGroup: 'A_POS', unitsAvailable: 7 },  // HIGH
    ],
  });

  await prisma.user.create({
    data: {
      name: 'Test Admin',
      email: ADMIN.email,
      passwordHash: await bcrypt.hash(ADMIN.password, 4), // low cost = fast tests
      role: 'ADMIN',
    },
  });

  return { pune, mumbai };
}

async function loginAsAdmin() {
  const res = await request(app).post('/api/auth/login').send(ADMIN);
  return res.body.data.token;
}

module.exports = { ADMIN, resetDb, seedBasics, loginAsAdmin };
