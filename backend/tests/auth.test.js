const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const prisma = require('../src/utils/prisma');
const ApiError = require('../src/utils/ApiError');
const { requireRole } = require('../src/middleware/auth');
const { ADMIN, resetDb, seedBasics } = require('./helpers');

beforeEach(async () => {
  await resetDb();
  await seedBasics();
});

afterAll(() => prisma.$disconnect());

describe('POST /api/auth/login', () => {
  test('returns a token and never the password hash', async () => {
    const res = await request(app).post('/api/auth/login').send(ADMIN);
    expect(res.status).toBe(200);
    expect(typeof res.body.data.token).toBe('string');
    expect(res.body.data.user.role).toBe('ADMIN');
    expect(JSON.stringify(res.body)).not.toMatch(/passwordHash|password_hash/);
  });

  test('wrong password and unknown email give the same 401', async () => {
    const wrongPw = await request(app).post('/api/auth/login').send({ ...ADMIN, password: 'wrong-password' });
    const noUser = await request(app).post('/api/auth/login').send({ email: 'nobody@test.example', password: 'whatever123' });
    expect(wrongPw.status).toBe(401);
    expect(noUser.status).toBe(401);
    expect(wrongPw.body.error.message).toBe(noUser.body.error.message);
  });

  test('400 when the password is missing', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: ADMIN.email });
    expect(res.status).toBe(400);
  });

  test('400 for an invalid email format', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'not-an-email', password: 'x' });
    expect(res.status).toBe(400);
  });
});

describe('token handling', () => {
  const attempt = (authorization) =>
    request(app).delete('/api/blood/1').set('Authorization', authorization);

  test('garbage token -> 401', async () => {
    expect((await attempt('Bearer garbage')).status).toBe(401);
  });

  test('wrong auth scheme -> 401', async () => {
    expect((await attempt('Basic abc')).status).toBe(401);
  });

  test('token signed with another secret -> 401', async () => {
    const forged = jwt.sign({ role: 'ADMIN' }, 'some-other-secret-value-xyz', { subject: '1' });
    expect((await attempt(`Bearer ${forged}`)).status).toBe(401);
  });

  test('expired token -> 401', async () => {
    const expired = jwt.sign({ role: 'ADMIN' }, process.env.JWT_SECRET, { subject: '1', expiresIn: -10 });
    expect((await attempt(`Bearer ${expired}`)).status).toBe(401);
  });
});

describe('requireRole', () => {
  test('403 when the role is not allowed', () => {
    const next = jest.fn();
    requireRole('ADMIN')({ user: { role: 'VIEWER' } }, {}, next);
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(403);
  });

  test('passes when the role is allowed', () => {
    const next = jest.fn();
    requireRole('ADMIN')({ user: { role: 'ADMIN' } }, {}, next);
    expect(next).toHaveBeenCalledWith();
  });
});
