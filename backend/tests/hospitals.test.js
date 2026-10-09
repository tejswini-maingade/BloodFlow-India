const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/utils/prisma');
const { resetDb, seedBasics } = require('./helpers');

let ctx;

beforeEach(async () => {
  await resetDb();
  ctx = await seedBasics();
});

afterAll(() => prisma.$disconnect());

describe('GET /api/hospitals', () => {
  test('lists facilities sorted by city, with stats and no raw inventory', async () => {
    const res = await request(app).get('/api/hospitals');
    expect(res.status).toBe(200);
    expect(res.body.data.map((f) => f.city)).toEqual(['Mumbai', 'Pune']);
    expect(res.body.data[0].inventory).toBeUndefined();

    const pune = res.body.data.find((f) => f.city === 'Pune');
    expect(pune.stats).toEqual({ totalUnits: 28, groupsTracked: 2, worstRisk: 'CRITICAL' });
    const mumbai = res.body.data.find((f) => f.city === 'Mumbai');
    expect(mumbai.stats.worstRisk).toBe('HIGH');
  });

  test('filters by city, case-insensitive', async () => {
    const res = await request(app).get('/api/hospitals?city=pune');
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toBe('Test Hospital Pune');
  });

  test('filters by type', async () => {
    const res = await request(app).get('/api/hospitals?type=BLOOD_BANK');
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].type).toBe('BLOOD_BANK');
  });

  test('rejects an invalid type', async () => {
    const res = await request(app).get('/api/hospitals?type=CLINIC');
    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe('Invalid facility type');
  });

  test('a facility with no stock has worstRisk null', async () => {
    await prisma.facility.create({
      data: { name: 'Empty Test Facility', type: 'HOSPITAL', city: 'Nashik', state: 'Maharashtra' },
    });
    const res = await request(app).get('/api/hospitals?city=Nashik');
    expect(res.body.data[0].stats).toEqual({ totalUnits: 0, groupsTracked: 0, worstRisk: null });
  });
});

describe('GET /api/hospitals/:id', () => {
  test('returns the facility with inventory, most urgent first, with risk reasons', async () => {
    const res = await request(app).get(`/api/hospitals/${ctx.pune.id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.inventory).toHaveLength(2);
    expect(res.body.data.inventory[0].bloodGroup).toBe('O-');
    expect(res.body.data.inventory[0].risk.level).toBe('CRITICAL');
    expect(res.body.data.inventory[0].risk.reason).toMatch(/critical-stock threshold/);
  });

  test('404 for an unknown id', async () => {
    const res = await request(app).get('/api/hospitals/999999');
    expect(res.status).toBe(404);
  });

  test('400 for a non-numeric id', async () => {
    const res = await request(app).get('/api/hospitals/abc');
    expect(res.status).toBe(400);
  });
});
