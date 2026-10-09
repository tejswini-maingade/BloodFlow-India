const request = require('supertest');
const app = require('../src/app');

test('GET /health returns healthy', async () => {
  const res = await request(app).get('/health');
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ status: 'healthy', service: 'bloodflow-backend' });
});

test('unknown route returns JSON 404', async () => {
  const res = await request(app).get('/api/nope');
  expect(res.status).toBe(404);
  expect(res.body.success).toBe(false);
});
