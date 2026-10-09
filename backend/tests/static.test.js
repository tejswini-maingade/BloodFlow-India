const fs = require('fs');
const os = require('os');
const path = require('path');

// Must be set BEFORE the app is loaded: config reads it at startup.
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bloodflow-static-'));
fs.writeFileSync(path.join(dir, 'index.html'), '<!doctype html><title>BloodFlow test app</title>');
fs.mkdirSync(path.join(dir, 'assets'));
fs.writeFileSync(path.join(dir, 'assets', 'app.js'), 'console.log("ok");');
process.env.STATIC_DIR = dir;

const request = require('supertest');
const app = require('../src/app');

afterAll(() => fs.rmSync(dir, { recursive: true, force: true }));

describe('serving the React app', () => {
  test('GET / returns the app', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toMatch(/BloodFlow test app/);
  });

  test('client-side routes fall back to index.html', async () => {
    const res = await request(app).get('/availability');
    expect(res.status).toBe(200);
    expect(res.text).toMatch(/BloodFlow test app/);
  });

  test('static assets are served', async () => {
    const res = await request(app).get('/assets/app.js');
    expect(res.status).toBe(200);
    expect(res.text).toMatch(/console\.log/);
  });

  test('a missing asset is a 404, not index.html', async () => {
    const res = await request(app).get('/assets/missing.js');
    expect(res.status).toBe(404);
    expect(res.text).not.toMatch(/BloodFlow test app/);
  });

  test('unknown API routes still return JSON 404', async () => {
    const res = await request(app).get('/api/nope');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test('/health still returns JSON', async () => {
    const res = await request(app).get('/health');
    expect(res.body).toEqual({ status: 'healthy', service: 'bloodflow-backend' });
  });

  test('HTTP-friendly headers by default: no HSTS, no upgrade-insecure-requests', async () => {
    const res = await request(app).get('/');
    expect(res.headers['strict-transport-security']).toBeUndefined();
    expect(res.headers['content-security-policy']).not.toMatch(/upgrade-insecure-requests/);
    expect(res.headers['x-content-type-options']).toBe('nosniff'); // other protections stay on
  });
});
