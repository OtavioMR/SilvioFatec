import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startServer } from '../helpers/server.js';

let ctx;
before(async () => { ctx = await startServer(); });
after(() => new Promise((resolve) => ctx.server.close(resolve)));

test('GET /api/health responde 200 e status ok', async () => {
  const r = await fetch(`${ctx.url}/api/health`);
  assert.equal(r.status, 200);
  assert.equal((await r.json()).status, 'ok');
});

test('GET /api/hello sem nome', async () => {
  const r = await fetch(`${ctx.url}/api/hello`);
  assert.equal(r.status, 200);
  assert.deepEqual(await r.json(), { message: 'Olá, mundo!' });
});

test('GET /api/hello com nome', async () => {
  const r = await fetch(`${ctx.url}/api/hello?name=Ana`);
  assert.deepEqual(await r.json(), { message: 'Olá, Ana!' });
});

test('GET /api/hello com nome gigante responde 400', async () => {
  const r = await fetch(`${ctx.url}/api/hello?name=${'a'.repeat(100)}`);
  assert.equal(r.status, 400);
  assert.match((await r.json()).error, /máximo/);
});

test('POST /api/hello responde 405 com header Allow', async () => {
  const r = await fetch(`${ctx.url}/api/hello`, { method: 'POST' });
  assert.equal(r.status, 405);
  assert.equal(r.headers.get('allow'), 'GET');
});

test('rota inexistente responde 404', async () => {
  const r = await fetch(`${ctx.url}/api/nada`);
  assert.equal(r.status, 404);
});
