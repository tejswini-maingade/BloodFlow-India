const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/utils/prisma');
const { resetDb, seedBasics, loginAsAdmin } = require('./helpers');

let ctx;

beforeEach(async () => {
  await resetDb();
  ctx = await seedBasics();
});

afterAll(() => prisma.$disconnect());

describe('GET /api/alerts', () => {
  test('empty list when nothing has triggered an alert', async () => {
    const res = await request(app).get('/api/alerts');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  test('a stock decrease through the API shows up as an alert', async () => {
    const token = await loginAsAdmin();
    const row = await prisma.bloodInventory.findFirst({
      where: { facilityId: ctx.mumbai.id, bloodGroup: 'O_POS' },
    });

    await request(app)
      .put(`/api/blood/${row.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ unitsAvailable: 2 });

    const res = await request(app).get('/api/alerts');
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0]).toMatchObject({
      bloodGroup: 'O+',
      riskLevel: 'CRITICAL',
      location: 'Mumbai, Maharashtra',
    });
    expect(res.body.data[0].message).toMatch(/CRITICAL/);
  });

  test('newest first, and limit is respected', async () => {
    for (const n of [1, 2, 3]) {
      await prisma.alert.create({
        data: { bloodGroup: 'A_POS', location: 'Pune, Maharashtra', riskLevel: 'HIGH', message: `alert ${n}` },
      });
    }
    const res = await request(app).get('/api/alerts?limit=2');
    expect(res.body.data.map((a) => a.message)).toEqual(['alert 3', 'alert 2']);
  });

  test.each(['0', '101', 'abc', '2.5'])('rejects limit=%s', async (limit) => {
    const res = await request(app).get(`/api/alerts?limit=${limit}`);
    expect(res.status).toBe(400);
  });
});
