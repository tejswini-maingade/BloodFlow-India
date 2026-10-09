const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/utils/prisma');
const { resetDb, seedBasics, loginAsAdmin } = require('./helpers');

let ctx;
let token;
let rows; // inventory rows keyed for convenience

const auth = () => ({ Authorization: `Bearer ${token}` });

beforeEach(async () => {
  await resetDb();
  ctx = await seedBasics();
  token = await loginAsAdmin();
  const all = await prisma.bloodInventory.findMany();
  rows = {
    puneOPos: all.find((r) => r.facilityId === ctx.pune.id && r.bloodGroup === 'O_POS'),
    puneONeg: all.find((r) => r.facilityId === ctx.pune.id && r.bloodGroup === 'O_NEG'),
    mumbaiOPos: all.find((r) => r.facilityId === ctx.mumbai.id && r.bloodGroup === 'O_POS'),
  };
});

afterAll(() => prisma.$disconnect());

describe('GET /api/blood (availability + search)', () => {
  test('returns all inventory with risk, most urgent first', async () => {
    const res = await request(app).get('/api/blood');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(4);
    expect(res.body.data[0].unitsAvailable).toBe(3);
    expect(res.body.data[0].risk.level).toBe('CRITICAL');
    expect(res.body.data[0].risk.reason).toMatch(/critical-stock threshold/);
    expect(res.body.meta.riskModel).toMatch(/not a medical prediction/i);
  });

  test('filters by blood group (encoded plus)', async () => {
    const res = await request(app).get('/api/blood?bloodGroup=O%2B');
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data.every((r) => r.bloodGroup === 'O+')).toBe(true);
  });

  test('accepts an unencoded plus too', async () => {
    const res = await request(app).get('/api/blood?bloodGroup=O+');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });

  test('filters by city, case-insensitive', async () => {
    const res = await request(app).get('/api/blood?city=pune');
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data.every((r) => r.facility.city === 'Pune')).toBe(true);
  });

  test('combines blood group and city', async () => {
    const res = await request(app).get('/api/blood?bloodGroup=O%2B&city=Mumbai');
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].unitsAvailable).toBe(12);
    expect(res.body.data[0].risk.level).toBe('MEDIUM');
  });

  test.each([
    ['LOW', 1],
    ['MEDIUM', 1],
    ['HIGH', 1],
    ['CRITICAL', 1],
  ])('filters by risk %s', async (risk, count) => {
    const res = await request(app).get(`/api/blood?risk=${risk}`);
    expect(res.body.data).toHaveLength(count);
    expect(res.body.data.every((r) => r.risk.level === risk)).toBe(true);
  });

  test('rejects an invalid blood group filter', async () => {
    const res = await request(app).get('/api/blood?bloodGroup=Z%2B');
    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe('Invalid blood group');
  });

  test('rejects an invalid risk filter', async () => {
    const res = await request(app).get('/api/blood?risk=SCARY');
    expect(res.status).toBe(400);
  });
});

describe('GET /api/blood/:id', () => {
  test('returns one record', async () => {
    const res = await request(app).get(`/api/blood/${rows.puneONeg.id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.bloodGroup).toBe('O-');
  });

  test('404 for an unknown id', async () => {
    const res = await request(app).get('/api/blood/999999');
    expect(res.status).toBe(404);
  });

  test('400 for a non-numeric id', async () => {
    const res = await request(app).get('/api/blood/abc');
    expect(res.status).toBe(400);
  });
});

describe('POST /api/blood (create)', () => {
  const valid = () => ({ facilityId: ctx.pune.id, bloodGroup: 'B+', unitsAvailable: 30 });

  test('401 without a token', async () => {
    const res = await request(app).post('/api/blood').send(valid());
    expect(res.status).toBe(401);
  });

  test('creates a record (201)', async () => {
    const res = await request(app).post('/api/blood').set(auth()).send(valid());
    expect(res.status).toBe(201);
    expect(res.body.data.bloodGroup).toBe('B+');
    expect(res.body.data.risk.level).toBe('LOW');
  });

  test('creating a critical record also creates an alert', async () => {
    const res = await request(app)
      .post('/api/blood').set(auth())
      .send({ ...valid(), bloodGroup: 'AB-', unitsAvailable: 1 });
    expect(res.status).toBe(201);
    expect(await prisma.alert.count()).toBe(1);
  });

  test('rejects an invalid blood group', async () => {
    const res = await request(app).post('/api/blood').set(auth()).send({ ...valid(), bloodGroup: 'Z+' });
    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe('Invalid blood group');
  });

  test('rejects negative units', async () => {
    const res = await request(app).post('/api/blood').set(auth()).send({ ...valid(), unitsAvailable: -5 });
    expect(res.status).toBe(400);
    expect(res.body.error.message).toMatch(/negative/);
  });

  test('rejects units above the maximum', async () => {
    const res = await request(app).post('/api/blood').set(auth()).send({ ...valid(), unitsAvailable: 100000 });
    expect(res.status).toBe(400);
    expect(res.body.error.message).toMatch(/cannot exceed/);
  });

  test('rejects units sent as a string', async () => {
    const res = await request(app).post('/api/blood').set(auth()).send({ ...valid(), unitsAvailable: '10' });
    expect(res.status).toBe(400);
    expect(res.body.error.message).toMatch(/must be a number/);
  });

  test('reports every missing required field', async () => {
    const res = await request(app).post('/api/blood').set(auth()).send({});
    expect(res.status).toBe(400);
    const fields = res.body.error.details.map((d) => d.field);
    expect(fields).toEqual(expect.arrayContaining(['facilityId', 'bloodGroup', 'unitsAvailable']));
  });

  test('rejects unexpected fields', async () => {
    const res = await request(app).post('/api/blood').set(auth()).send({ ...valid(), isAdmin: true });
    expect(res.status).toBe(400);
  });

  test('409 for a duplicate facility + blood group', async () => {
    const res = await request(app).post('/api/blood').set(auth()).send({ ...valid(), bloodGroup: 'O+' });
    expect(res.status).toBe(409);
  });

  test('400 for an unknown facility', async () => {
    const res = await request(app).post('/api/blood').set(auth()).send({ ...valid(), facilityId: 999999 });
    expect(res.status).toBe(400);
  });

  test('400 for malformed JSON', async () => {
    const res = await request(app)
      .post('/api/blood').set(auth()).set('Content-Type', 'application/json').send('{bad json');
    expect(res.status).toBe(400);
    expect(res.body.error.message).toMatch(/not valid JSON/);
  });
});

describe('PUT /api/blood/:id (update)', () => {
  test('401 without a token', async () => {
    const res = await request(app).put(`/api/blood/${rows.mumbaiOPos.id}`).send({ unitsAvailable: 5 });
    expect(res.status).toBe(401);
  });

  test('lowering stock changes risk and raises an alert', async () => {
    const res = await request(app)
      .put(`/api/blood/${rows.mumbaiOPos.id}`).set(auth()).send({ unitsAvailable: 2 });
    expect(res.status).toBe(200);
    expect(res.body.data.unitsAvailable).toBe(2);
    expect(res.body.data.risk.level).toBe('CRITICAL');
    expect(await prisma.alert.count()).toBe(1);
  });

  test('raising stock does not create an alert', async () => {
    const res = await request(app)
      .put(`/api/blood/${rows.puneONeg.id}`).set(auth()).send({ unitsAvailable: 30 });
    expect(res.status).toBe(200);
    expect(res.body.data.risk.level).toBe('LOW');
    expect(await prisma.alert.count()).toBe(0);
  });

  test('rejects negative units', async () => {
    const res = await request(app)
      .put(`/api/blood/${rows.puneOPos.id}`).set(auth()).send({ unitsAvailable: -1 });
    expect(res.status).toBe(400);
  });

  test('404 for an unknown id', async () => {
    const res = await request(app).put('/api/blood/999999').set(auth()).send({ unitsAvailable: 5 });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/blood/:id', () => {
  test('401 without a token', async () => {
    const res = await request(app).delete(`/api/blood/${rows.puneOPos.id}`);
    expect(res.status).toBe(401);
  });

  test('deletes a record', async () => {
    const res = await request(app).delete(`/api/blood/${rows.puneOPos.id}`).set(auth());
    expect(res.status).toBe(200);
    const after = await request(app).get(`/api/blood/${rows.puneOPos.id}`);
    expect(after.status).toBe(404);
  });

  test('404 for an unknown id', async () => {
    const res = await request(app).delete('/api/blood/999999').set(auth());
    expect(res.status).toBe(404);
  });
});
