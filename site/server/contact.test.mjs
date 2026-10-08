import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer, request } from 'node:http';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { creerServeur } from './server.mjs';
import { lireEmailContact, lireConfigBackend } from './contact.mjs';

const EMAIL = 'charles+contact@example.test';
const TOKEN = 'a-private-contact-proxy-token-longer-than-thirty-two';
const HTML = '<!doctype html><html><body><a href="mailto:contact%40portfolio.invalid?subject=Discutons">contact@portfolio.invalid</a><button data-copier="contact@portfolio.invalid">Copier</button><script type="application/ld+json">{"email":"contact@portfolio.invalid"}</script></body></html>';

async function ecouter(serveur) {
  await new Promise((ok) => serveur.listen(0, '127.0.0.1', ok));
  return `http://127.0.0.1:${serveur.address().port}`;
}

async function fermer(serveur) {
  serveur.closeAllConnections();
  await new Promise((ok) => serveur.close(ok));
}

async function demarrer(env) {
  const dossier = await mkdtemp(path.join(tmpdir(), 'portfolio-contact-'));
  for (const nom of ['index.html', 'contact/index.html', 'mentions-legales/index.html']) {
    await mkdir(path.dirname(path.join(dossier, nom)), { recursive: true });
    await writeFile(path.join(dossier, nom), HTML);
  }
  const serveur = creerServeur({ dossier, env: { CONTACT_EMAIL: EMAIL, ...env } });
  return {
    base: await ecouter(serveur),
    serveur,
    dossier,
    async fermer() { await fermer(serveur); await rm(dossier, { recursive: true, force: true }); },
  };
}

describe('adresse de contact au démarrage', () => {
  test('une adresse simple est validée ; les valeurs malformées sont refusées', () => {
    assert.equal(lireEmailContact({ CONTACT_EMAIL: ` ${EMAIL} ` }), EMAIL);
    assert.equal(lireEmailContact({}), null);
    for (const email of ['Charles <contact@example.test>', 'a@localhost', 'a..b@example.test', 'a@-example.test', 'a@example.test\nBcc:attacker@example.test', '"><script>@example.test']) {
      assert.throws(() => lireEmailContact({ CONTACT_EMAIL: email }), undefined, email);
    }
  });

  test('texte, mailto, copie et JSON-LD suivent CONTACT_EMAIL sans JavaScript ni rebuild', async () => {
    const site = await demarrer();
    try {
      for (const route of ['/', '/contact', '/mentions-legales']) {
        const reponse = await fetch(`${site.base}${route}`);
        const html = await reponse.text();
        assert.match(html, /mailto:charles%2Bcontact%40example.test\?subject=Discutons/);
        assert.match(html, /data-copier="charles\+contact@example.test"/);
        assert.match(html, /"email":"charles\+contact@example.test"/);
        assert.doesNotMatch(html, /portfolio.invalid/);
        assert.equal(Number(reponse.headers.get('content-length')), Buffer.byteLength(html));
        const head = await fetch(`${site.base}${route}`, { method: 'HEAD' });
        assert.equal(head.headers.get('etag'), reponse.headers.get('etag'));
        assert.equal(await head.text(), '');
        const cache = await fetch(`${site.base}${route}`, { headers: { 'If-None-Match': reponse.headers.get('etag') } });
        assert.equal(cache.status, 304);
      }
      assert.equal(await (await import('node:fs/promises')).readFile(path.join(site.dossier, 'index.html'), 'utf8'), HTML);
      const second = creerServeur({ dossier: site.dossier, env: { CONTACT_EMAIL: 'another@example.test' } });
      const base = await ecouter(second);
      try {
        const avant = await fetch(`${site.base}/`);
        const apres = await fetch(`${base}/`, { headers: { 'If-None-Match': avant.headers.get('etag') } });
        assert.equal(apres.status, 200);
        assert.notEqual(apres.headers.get('etag'), avant.headers.get('etag'));
        assert.match(await apres.text(), /another@example.test/);
      } finally { await fermer(second); }
    } finally { await site.fermer(); }
  });
});

describe('relais API vers Rust', () => {
  let site, backend, appels;
  before(async () => {
    appels = [];
    backend = createServer(async (req, res) => {
      let corps = '';
      for await (const morceau of req) corps += morceau;
      appels.push({ chemin: req.url, methode: req.method, headers: req.headers, corps });
      const donnees = corps ? JSON.parse(corps) : {};
      if (donnees.mode === 'redirect') {
        res.writeHead(302, { Location: 'https://example.test' });
        res.end();
        return;
      }
      res.writeHead(donnees.mode === 'rate' ? 429 : 200, { 'Content-Type': 'application/json', 'Retry-After': '3600', 'Set-Cookie': 'backend=secret' });
      res.end(JSON.stringify(donnees.mode === 'large' ? { message: 'x'.repeat(30_000) } : donnees.mode === 'rate' ? { code: 'rate_limited', message: 'Attendre' } : { status: 'ok' }));
    });
    const url = await ecouter(backend);
    site = await demarrer({ BACKEND_URL: url, BACKEND_PROXY_TOKEN: TOKEN, TRUST_PROXY: '1' });
  });
  after(async () => { await site.fermer(); await fermer(backend); });

  test('POST JSON et santé sont relayés ; les en-têtes privés du visiteur sont écrasés', async () => {
    const payload = { name: 'Visiteur', email: 'visitor@example.test', subject: 'Projet', message: 'Une discussion à préparer.' };
    const reponse = await fetch(`${site.base}/api/contact?url=https://attacker.test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: site.base, 'X-Contact-Proxy-Token': 'fake', 'X-Contact-Client-IP': '198.51.100.7', 'X-Forwarded-For': 'fake, 203.0.113.42' },
      body: JSON.stringify(payload),
    });
    assert.equal(reponse.status, 200);
    assert.deepEqual(await reponse.json(), { status: 'ok' });
    assert.equal(reponse.headers.get('cache-control'), 'no-store');
    assert.equal(reponse.headers.get('set-cookie'), null);
    const appel = appels.at(-1);
    assert.equal(appel.chemin, '/api/contact');
    assert.equal(appel.headers['x-contact-proxy-token'], TOKEN);
    assert.equal(appel.headers['x-contact-client-ip'], '203.0.113.42');
    assert.deepEqual(JSON.parse(appel.corps), payload);
    assert.equal((await fetch(`${site.base}/api/health`)).status, 200);
    assert.equal((await fetch(`${site.base}/api/health`, { method: 'HEAD' })).status, 200);
  });

  test('les adresses et les méthodes exposées sont strictement limitées', async () => {
    assert.equal((await fetch(`${site.base}/api/contact`)).status, 405);
    assert.equal((await fetch(`${site.base}/api/contact/`, { method: 'POST' })).status, 404);
    assert.equal((await fetch(`${site.base}/api/unknown`)).status, 404);
    assert.equal((await fetch(`${site.base}/api/health`, { method: 'POST' })).status, 405);
  });

  test('une origine tierce et une charge sans JSON sont refusées avant le backend', async () => {
    const avant = appels.length;
    assert.equal((await fetch(`${site.base}/api/contact`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://attacker.test' }, body: '{}' })).status, 403);
    assert.equal((await fetch(`${site.base}/api/contact`, { method: 'POST', body: '{}' })).status, 415);
    assert.equal(appels.length, avant);
  });

  test('les erreurs backend et Retry-After arrivent au formulaire', async () => {
    const reponse = await fetch(`${site.base}/api/contact`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"mode":"rate"}' });
    assert.equal(reponse.status, 429);
    assert.equal(reponse.headers.get('retry-after'), '3600');
    assert.equal((await reponse.json()).code, 'rate_limited');
  });

  test('une charge annoncée ou envoyée par morceaux dépassant 24 KiB est refusée', async () => {
    const avant = appels.length;
    assert.equal((await fetch(`${site.base}/api/contact`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: 'x'.repeat(30_000) })).status, 413);
    const resultat = await new Promise((ok, ko) => {
      const req = request(`${site.base}/api/contact`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Transfer-Encoding': 'chunked' } }, (res) => {
        res.resume();
        res.on('end', () => ok(res.statusCode));
      });
      req.on('error', ko);
      req.write('x'.repeat(16_000));
      req.end('x'.repeat(16_000));
    });
    assert.equal(resultat, 413);
    assert.equal(appels.length, avant);
  });

  test('les redirections et les réponses volumineuses du backend ne sont jamais suivies', async () => {
    for (const mode of ['redirect', 'large']) {
      const reponse = await fetch(`${site.base}/api/contact`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode }) });
      assert.equal(reponse.status, 503);
      assert.equal((await reponse.json()).code, 'service_unavailable');
    }
  });

  test('backend absent ou arrêté : erreur explicite, aucune fausse confirmation', async () => {
    for (const config of [{}, { BACKEND_URL: 'http://127.0.0.1:9' }]) {
      const indisponible = await demarrer(config);
      try {
        const reponse = await fetch(`${indisponible.base}/api/contact`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
        assert.equal(reponse.status, 503);
        assert.equal((await reponse.json()).code, 'service_unavailable');
      } finally { await indisponible.fermer(); }
    }
  });

  test('les configurations qui permettraient de relayer une URL arbitraire sont refusées', () => {
    for (const url of ['file:///tmp/email', 'https://user:pass@example.test', 'http://backend:8080/api', 'http://backend:8080?url=x']) {
      assert.throws(() => lireConfigBackend({ BACKEND_URL: url }));
    }
    assert.throws(() => lireConfigBackend({ BACKEND_URL: 'http://backend:8080', BACKEND_PROXY_TOKEN: 'short' }));
  });
});
