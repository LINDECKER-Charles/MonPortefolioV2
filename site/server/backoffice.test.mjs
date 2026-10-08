import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { creerServeur } from './server.mjs';

let backend, site, base, directory, calls;
let email = 'initial@example.test';
async function listen(server) {
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  return `http://127.0.0.1:${server.address().port}`;
}
async function close(server) {
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
}
before(async () => {
  calls = [];
  backend = createServer(async (req, res) => {
    let body = '';
    for await (const chunk of req) body += chunk;
    calls.push({ url: req.url, method: req.method, headers: req.headers, body });
    if (req.url === '/api/config/contact') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ email }));
      return;
    }
    if (req.method === 'DELETE' || (req.url === '/mcp' && body.includes('notifications/initialized'))) {
      res.writeHead(req.method === 'DELETE' ? 204 : 202);
      res.end();
      return;
    }
    const cookies = req.url === '/api/backoffice/2fa/verify'
      ? ['portfolio_session=opaque; HttpOnly; SameSite=Strict; Path=/api/backoffice', 'portfolio_challenge=; HttpOnly; SameSite=Strict; Path=/api/backoffice; Max-Age=0']
      : 'portfolio_session=opaque; HttpOnly; SameSite=Strict; Path=/api/backoffice';
    res.writeHead(200, { 'Content-Type': 'application/json', 'Set-Cookie': cookies });
    const contacts = req.url?.endsWith('limit=100')
      ? Array.from({ length: 100 }, (_, id) => ({ id, name: '😀'.repeat(100), subject: '😀'.repeat(160), message: '😀'.repeat(5000) }))
      : [{ message: 'x'.repeat(30_000) }];
    res.end(JSON.stringify({ contacts }));
  });
  const backendUrl = await listen(backend);
  directory = await mkdtemp(path.join(tmpdir(), 'portfolio-backoffice-proxy-'));
  await mkdir(path.join(directory, 'backoffice'));
  const html = '<html><a href="mailto:contact%40portfolio.invalid">contact@portfolio.invalid</a></html>';
  await writeFile(path.join(directory, 'index.html'), html);
  await writeFile(path.join(directory, 'backoffice/index.html'), html);
  site = creerServeur({ dossier: directory, env: { BACKEND_URL: backendUrl, CONTACT_EMAIL: 'bootstrap@example.test', BACKEND_PROXY_TOKEN: 'a'.repeat(64) } });
  base = await listen(site);
});
after(async () => { await close(site); await close(backend); await rm(directory, { recursive: true, force: true }); });

test('l’adresse persistée remplace le bootstrap et change sans redémarrage avec son ETag', async () => {
  const first = await fetch(base);
  assert.match(await first.text(), /initial@example.test/);
  email = 'changed+contact@example.test';
  const second = await fetch(base, { headers: { 'If-None-Match': first.headers.get('etag') } });
  assert.equal(second.status, 200);
  assert.notEqual(second.headers.get('etag'), first.headers.get('etag'));
  assert.match(await second.text(), /mailto:changed%2Bcontact%40example.test/);
  email = '<script>@example.test';
  assert.match(await (await fetch(base)).text(), /changed\+contact@example.test/);
});

test('le backoffice est hors cache et hors index', async () => {
  const response = await fetch(`${base}/backoffice`);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(response.headers.get('x-robots-tag'), 'noindex, nofollow');
});

test('le relais admin conserve cookie, origine, hôte et pagination autorisée', async () => {
  const response = await fetch(`${base}/api/backoffice/contacts?status=new&limit=50&offset=2&url=https://evil.test`, {
    headers: { Cookie: 'portfolio_session=test', Authorization: 'Bearer must-not-reach-admin', Origin: base },
  });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).contacts[0].message.length, 30_000);
  const call = calls.at(-1);
  assert.equal(call.url, '/api/backoffice/contacts?status=new&limit=50&offset=2');
  assert.equal(call.headers.cookie, 'portfolio_session=test');
  assert.equal(call.headers.authorization, undefined);
  assert.equal(call.headers.host, new URL(base).host);
  assert.equal(call.headers.origin, base);
  assert.match(response.headers.get('set-cookie'), /HttpOnly/);
});

test('une mutation exige JSON et le marqueur CSRF, une origine étrangère est refusée', async () => {
  const before = calls.length;
  for (const [headers, status] of [
    [{ 'Content-Type': 'application/json' }, 403],
    [{ 'X-Backoffice-Request': '1' }, 415],
    [{ 'Content-Type': 'application/json', 'X-Backoffice-Request': '1', Origin: 'https://evil.test' }, 403],
  ]) {
    assert.equal((await fetch(`${base}/api/backoffice/login`, { method: 'POST', headers, body: '{}' })).status, status);
  }
  assert.equal(calls.length, before);
  const response = await fetch(`${base}/api/backoffice/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Backoffice-Request': '1', Origin: base }, body: '{"email":"admin@example.test","password":"example"}',
  });
  assert.equal(response.status, 200);
  assert.equal(calls.at(-1).body, '{"email":"admin@example.test","password":"example"}');
});

test('les deux étapes 2FA sont explicitement relayées avec le défi et les deux cookies de validation', async () => {
  const headers = { 'Content-Type': 'application/json', 'X-Backoffice-Request': '1', Cookie: 'portfolio_challenge=opaque', Origin: base };
  const setup = await fetch(`${base}/api/backoffice/2fa/setup`, { method: 'POST', headers });
  assert.equal(setup.status, 200);
  assert.equal(calls.at(-1).url, '/api/backoffice/2fa/setup');
  assert.equal(calls.at(-1).body, '');
  assert.equal(calls.at(-1).headers.cookie, 'portfolio_challenge=opaque');
  assert.equal(calls.at(-1).headers['x-backoffice-request'], '1');
  const verification = await fetch(`${base}/api/backoffice/2fa/verify`, {
    method: 'POST', headers, body: '{"code":"ABCD-1234-EFGH-5678"}',
  });
  assert.equal(verification.status, 200);
  assert.equal(calls.at(-1).body, '{"code":"ABCD-1234-EFGH-5678"}');
  assert.deepEqual(verification.headers.getSetCookie(), [
    'portfolio_session=opaque; HttpOnly; SameSite=Strict; Path=/api/backoffice',
    'portfolio_challenge=; HttpOnly; SameSite=Strict; Path=/api/backoffice; Max-Age=0',
  ]);
  const before = calls.length;
  assert.equal((await fetch(`${base}/api/backoffice/2fa/setup`)).status, 405);
  assert.equal((await fetch(`${base}/api/backoffice/2fa/reset`, { method: 'POST', headers })).status, 404);
  assert.equal((await fetch(`${base}/api/backoffice/2fa/verify`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status, 403);
  assert.equal(calls.length, before);
});

test('une page de 100 demandes maximales Unicode peut dépasser 2 Mio et reste consultable', async () => {
  const response = await fetch(`${base}/api/backoffice/contacts?limit=100`);
  assert.equal(response.status, 200);
  const body = await response.text();
  assert.ok(Buffer.byteLength(body) > 2 * 1024 * 1024);
  assert.equal(JSON.parse(body).contacts.length, 100);
});

test('les routes explicites gardent DELETE sans corps et refusent les chemins arbitraires', async () => {
  const response = await fetch(`${base}/api/backoffice/tokens/12`, { method: 'DELETE', headers: { 'X-Backoffice-Request': '1' } });
  assert.equal(response.status, 204);
  assert.equal(await response.text(), '');
  assert.equal((await fetch(`${base}/api/backoffice/anything`)).status, 404);
  assert.equal((await fetch(`${base}/api/backoffice/tokens/../../health`, { method: 'DELETE', headers: { 'X-Backoffice-Request': '1' } })).status, 405);
});

test('MCP transmet le Bearer et les en-têtes de protocole sans cookies, et accepte les notifications vides', async () => {
  const response = await fetch(`${base}/mcp`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer mcp-secret', Cookie: 'portfolio_session=must-not-reach-mcp', 'Mcp-Protocol-Version': '2025-11-25' },
    body: '{"jsonrpc":"2.0","method":"notifications/initialized"}',
  });
  assert.equal(response.status, 202);
  assert.equal(await response.text(), '');
  const call = calls.at(-1);
  assert.equal(call.headers.authorization, 'Bearer mcp-secret');
  assert.equal(call.headers.cookie, undefined);
  assert.equal(call.headers['mcp-protocol-version'], '2025-11-25');
  assert.equal((await fetch(`${base}/mcp`)).status, 405);
});
