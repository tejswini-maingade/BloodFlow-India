const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/utils/prisma');
const { resetDb, seedBasics } = require('./helpers');

afterAll(() => prisma.$disconnect());

describe('GET /api/dashboard', () => {
  beforeEach(async () => {
    await resetDb();
    await seedBasics(); // O+ 25 & O- 3 in Pune; O+ 12 & A+ 7 in Mumbai
  });

  test('headline totals', async () => {
    const res = await request(app).get('/api/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.data.totals).toEqual({
      totalUnits: 47,
      lowStockCount: 1, // A+ at 7 units (HIGH)
      criticalCount: 1, // O- at 3 units (CRITICAL)
      totalFacilities: 2,
    });
  });

  test('risk distribution counts every row once', async () => {
    const res = await request(app).get('/api/dashboard');
    expect(res.body.data.riskDistribution).toEqual({ LOW: 1, MEDIUM: 1, HIGH: 1, CRITICAL: 1 });
  });

  test('blood group summary lists all 8 groups', async () => {
    const res = await request(app).get('/api/dashboard');
    const groups = res.body.data.bloodGroups;
    expect(groups).toHaveLength(8);
    expect(groups.find((g) => g.bloodGroup === 'O+')).toMatchObject({ totalUnits: 37, criticalCount: 0 });
    expect(groups.find((g) => g.bloodGroup === 'O-')).toMatchObject({ totalUnits: 3, criticalCount: 1 });
    expect(groups.find((g) => g.bloodGroup === 'A+')).toMatchObject({ totalUnits: 7, lowStockCount: 1 });
    expect(groups.find((g) => g.bloodGroup === 'AB-').totalUnits).toBe(0);
  });

  test('location summary', async () => {
    const res = await request(app).get('/api/dashboard');
    const { locations } = res.body.data;
    expect(locations.map((l) => l.city)).toEqual(['Mumbai', 'Pune']);
    expect(locations.find((l) => l.city === 'Pune')).toMatchObject({
      totalUnits: 28, facilities: 1, lowStockCount: 0, criticalCount: 1,
    });
  });

  test('recent updates include risk, and the response carries the demo labels', async () => {
    const res = await request(app).get('/api/dashboard');
    expect(res.body.data.recentUpdates).toHaveLength(4);
    expect(res.body.data.recentUpdates[0].risk.level).toBeDefined();
    expect(res.body.data.riskThresholds).toHaveProperty('highMin');
    expect(res.body.meta.riskModel).toMatch(/not a medical prediction/i);
    expect(res.body.meta.dataNotice).toMatch(/synthetic/i);
  });
});

test('empty database gives zeros, not errors', async () => {
  await resetDb();
  const res = await request(app).get('/api/dashboard');
  expect(res.status).toBe(200);
  expect(res.body.data.totals).toEqual({
    totalUnits: 0, lowStockCount: 0, criticalCount: 0, totalFacilities: 0,
  });
  expect(res.body.data.bloodGroups).toHaveLength(8);
  expect(res.body.data.locations).toEqual([]);
  expect(res.body.data.recentUpdates).toEqual([]);
});
