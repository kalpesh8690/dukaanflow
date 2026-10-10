const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/app');

async function withServer(t, run) {
  const server = app.listen(0);
  t.after(() => new Promise((resolve) => server.close(resolve)));
  await new Promise((resolve) => server.once('listening', resolve));
  const address = server.address();
  return run(`http://127.0.0.1:${address.port}`);
}

test('health endpoint returns API status', async (t) => {
  await withServer(t, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/health`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { status: 'ok', service: 'dukaanflow-api' });
  });
});

test('product listing requires authentication', async (t) => {
  await withServer(t, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/products`);
    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), { error: 'Authentication required' });
  });
});

test('product creation requires authentication', async (t) => {
  await withServer(t, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/products`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'Test item', price: 1, stock: 1 }),
    });
    assert.equal(response.status, 401);
  });
});
