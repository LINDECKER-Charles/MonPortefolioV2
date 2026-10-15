#!/usr/bin/env node
/**
 * Intégration réelle du backend Rust, du relais Node et du MCP, sans mocks.
 * Prérequis : cargo build --manifest-path backend/Cargo.toml et build du site.
 * Usage : node scripts/test-backoffice.mjs [--screenshots] [--dev]
 * Les données, mots de passe et jetons sont factices. Le seul serveur SMTP est
 * un faux serveur local, sur la boucle : aucun e-mail ne part.
 */
import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import { createHash, createHmac, randomBytes } from 'node:crypto';
import { once } from 'node:events';
import { access, mkdtemp, readFile, rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { createServer } from 'node:net';
import { DatabaseSync } from 'node:sqlite';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { setTimeout as attendre } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { creerServeur } from '../site/server/server.mjs';

const racine = fileURLToPath(new URL('../', import.meta.url));
const executable = path.join(racine, 'backend/target/debug/portfolio-backend');
const dist = path.join(racine, 'site/dist');
const motDePasse = 'integration-portfolio-factice';
const emailConnexion = 'administration@example.test';
const adresseInitiale = 'integration-initiale@example.test';
const adresseFinale = 'integration-finale@example.test';
const message = {
  name: 'Camille Martin', email: 'camille@example.test', subject: 'Un projet à construire',
  message: 'Bonjour Charles, je voudrais échanger sur un projet web et sa mise en ligne.', website: '',
};
let dossierTemporaire;
let backend;
let serveur;
let navigateur;
let origine;
let backendOrigine;
let cookie;
let identifiantRpc = 0;

async function portLibre() {
  const reservation = createServer();
  reservation.listen(0, '127.0.0.1');
  await once(reservation, 'listening');
  const port = reservation.address().port;
  await new Promise((resolve, reject) => reservation.close((error) => error ? reject(error) : resolve()));
  return port;
}

async function arreterBackend() {
  const processus = backend;
  backend = undefined;
  if (!processus?.pid || processus.exitCode !== null || processus.signalCode !== null) return;
  const sortie = once(processus, 'exit');
  processus.kill('SIGTERM');
  const delai = setTimeout(() => processus.kill('SIGKILL'), 5000);
  try { await sortie; } finally { clearTimeout(delai); }
}

async function demarrerBackend(env) {
  const processus = spawn(executable, [], { cwd: dossierTemporaire, env, stdio: ['ignore', 'pipe', 'pipe'] });
  backend = processus;
  let echec;
  processus.on('error', (error) => { echec = error; });
  // Consommer les sorties sans exposer de valeurs de configuration.
  processus.stdout.resume();
  processus.stderr.resume();
  const debut = Date.now();
  while (Date.now() - debut < 10_000) {
    if (echec || processus.exitCode !== null || processus.signalCode !== null) throw new Error('Le backend de test n’a pas pu démarrer.');
    try {
      const reponse = await fetch(`${backendOrigine}/api/health`, { signal: AbortSignal.timeout(1000) });
      await reponse.arrayBuffer();
      if (reponse.ok) return;
    } catch { /* Attendre l’ouverture du port Rust. */ }
    await attendre(100);
  }
  throw new Error('Le backend de test ne répond pas après dix secondes.');
}

async function requete(chemin, { method = 'GET', data, session = false, bearer, csrf = true, accept = 'application/json', headers = {}, status = 200 } = {}) {
  const entetes = { Accept: accept, ...headers };
  if (session) entetes.Cookie = cookie;
  if (bearer) entetes.Authorization = `Bearer ${bearer}`;
  if (data !== undefined || ['POST', 'PUT', 'PATCH'].includes(method)) entetes['Content-Type'] = 'application/json';
  if (method !== 'GET' && method !== 'HEAD') {
    entetes.Origin ??= origine;
    if (chemin.startsWith('/api/backoffice') && csrf) entetes['X-Backoffice-Request'] = '1';
  }
  const reponse = await fetch(`${origine}${chemin}`, {
    method, headers: entetes, ...(data !== undefined ? { body: JSON.stringify(data) } : {}),
    redirect: 'error', cache: 'no-store', signal: AbortSignal.timeout(10_000),
  });
  assert.equal(reponse.status, status, `${method} ${chemin} : statut HTTP inattendu`);
  const texte = await reponse.text();
  const json = reponse.headers.get('content-type')?.includes('application/json') && texte ? JSON.parse(texte) : undefined;
  return { reponse, texte, json };
}

async function mcp(method, params, options = {}) {
  const resultat = await requete('/mcp', {
    method: 'POST', accept: 'application/json, text/event-stream',
    data: { jsonrpc: '2.0', id: ++identifiantRpc, method, params },
    headers: { 'MCP-Protocol-Version': '2025-11-25' }, ...options,
  });
  if (options.status === undefined || options.status === 200) {
    assert(!resultat.json.error, `${method} : erreur JSON-RPC inattendue`);
  }
  return resultat.json;
}

/** Un appel MCP par le chemin de Claude Code (révision 2026-07-28) : en-têtes et métadonnées exigés. */
async function mcpModerne(method, params, options = {}) {
  const resultat = await requete('/mcp', {
    method: 'POST', accept: 'application/json, text/event-stream',
    data: { jsonrpc: '2.0', id: ++identifiantRpc, method, params: { ...params, _meta: { 'io.modelcontextprotocol/protocolVersion': '2026-07-28', 'io.modelcontextprotocol/clientCapabilities': {} } } },
    ...options,
    headers: { 'MCP-Protocol-Version': '2026-07-28', 'MCP-Method': method, ...(method === 'tools/call' ? { 'MCP-Name': params.name } : {}), ...options.headers },
  });
  if (options.status === undefined || options.status === 200) {
    assert(!resultat.json.error, `${method} : erreur JSON-RPC inattendue`);
  }
  return resultat.json;
}

/**
 * L’accès que crée le backoffice par défaut (préréglage Rédaction, sans les
 * demandes), tel que Claude Code le voit à travers le relais Node : le
 * catalogue de la rédaction seul, les demandes refusées, les indications de
 * cache que Claude Code exige, et l’origine du site acceptée, une autre non.
 */
async function testerAccesRedaction() {
  const acces = (await requete('/api/backoffice/tokens', { method: 'POST', data: { name: 'Claude Code', scopes: ['blog:read', 'blog:write'] }, session: true, status: 201 })).json;
  assert.deepEqual(acces.scopes, ['blog:read', 'blog:write']);
  const decouverte = await mcpModerne('server/discover', {}, { bearer: acces.token });
  assert(decouverte.result.supportedVersions.includes('2026-07-28'));
  const catalogue = await mcpModerne('tools/list', {}, { bearer: acces.token });
  assert.deepEqual(catalogue.result.tools.map((outil) => outil.name).sort(), ['blog_create_post', 'blog_get_post', 'blog_list_media', 'blog_list_posts', 'blog_preview_post', 'blog_seo_audit', 'blog_update_post', 'blog_upload_media']);
  for (const resultat of [decouverte.result, catalogue.result]) {
    assert.equal(resultat.resultType, 'complete');
    assert.equal(resultat.ttlMs, 300000, 'Claude Code refuse un catalogue sans ttlMs.');
    assert.equal(resultat.cacheScope, 'private', 'Le catalogue dépend de l’accès : jamais partagé.');
  }
  const refus = await mcpModerne('tools/call', { name: 'contacts_summary', arguments: {} }, { bearer: acces.token });
  assert.equal(refus.result.isError, true);
  assert.equal(refus.result.structuredContent.code, 'PERMISSION_DENIED', 'Un accès Rédaction ne lit pas les demandes.');
  // « Vérifier l’accès » appelle /mcp depuis la page : l’origine du site passe, une autre non.
  await mcpModerne('tools/list', {}, { bearer: acces.token, headers: { Origin: origine } });
  await mcpModerne('tools/list', {}, { bearer: acces.token, headers: { Origin: 'https://etranger.example.test' }, status: 403 });
  await requete(`/api/backoffice/tokens/${acces.id}`, { method: 'DELETE', session: true });
  await mcpModerne('tools/list', {}, { bearer: acces.token, status: 401 });
  console.log('[integration] Accès Rédaction en 2026-07-28 : catalogue, demandes refusées, cache et origine : OK');
}

function memoriserCookie(reponse, nom) {
  const entetes = reponse.headers.getSetCookie();
  const valeur = entetes.find((entete) => entete.startsWith(`${nom}=`) && !entete.includes('Max-Age=0'));
  assert(valeur, 'La réponse doit définir le cookie attendu.');
  assert(valeur.includes('HttpOnly') && valeur.includes('SameSite=Strict') && valeur.includes('Path=/api/backoffice'), 'Le cookie doit être privé et limité au backoffice.');
  cookie = valeur.split(';', 1)[0];
  return valeur;
}

function decoderBase32(secret) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  for (const lettre of secret.replace(/=+$/, '').toUpperCase()) {
    const indice = alphabet.indexOf(lettre);
    assert(indice >= 0, 'Le secret TOTP doit être en Base32.');
    bits += indice.toString(2).padStart(5, '0');
  }
  const octets = [];
  for (let index = 0; index + 8 <= bits.length; index += 8) octets.push(Number.parseInt(bits.slice(index, index + 8), 2));
  return Buffer.from(octets);
}

// Générateur indépendant du backend : RFC 6238, SHA-1, six chiffres, 30 secondes.
function codeTotp(secret) {
  const compteur = Buffer.alloc(8);
  compteur.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30_000)));
  const hmac = createHmac('sha1', decoderBase32(secret)).update(compteur).digest();
  const decalage = hmac[hmac.length - 1] & 0x0f;
  return ((hmac.readUInt32BE(decalage) & 0x7fffffff) % 1_000_000).toString().padStart(6, '0');
}

async function testerDoubleAuthentification(envBackend) {
  const envProtege = { ...envBackend, APP_ENV: 'production', BACKOFFICE_COOKIE_SECURE: 'true', BACKOFFICE_TOTP_ENCRYPTION_KEY: randomBytes(32).toString('hex') };
  await arreterBackend();
  await demarrerBackend(envProtege);
  await requete('/api/backoffice/session', { session: true, status: 401 });
  const connexion = await requete('/api/backoffice/login', { method: 'POST', data: { email: emailConnexion, password: motDePasse } });
  assert.equal(connexion.json.authenticated, false);
  assert.equal(connexion.json.two_factor_required, true);
  assert.equal(connexion.json.enrollment_required, true);
  assert(memoriserCookie(connexion.reponse, 'portfolio_backoffice_challenge').includes('; Secure'), 'Le défi de production doit porter Secure.');
  await requete('/api/backoffice/contacts', { session: true, status: 401 });
  const inscription = (await requete('/api/backoffice/2fa/setup', { method: 'POST', data: {}, session: true })).json;
  assert(inscription.secret.length >= 32, 'L’inscription doit fournir une clé TOTP forte.');
  assert(inscription.otpauth_url.startsWith('otpauth://totp/'));
  assert(inscription.qr_code_data_url.startsWith('data:image/png;base64,'), 'Le QR doit être fourni localement, sans service tiers.');
  const codeInitial = codeTotp(inscription.secret);
  const validation = await requete('/api/backoffice/2fa/verify', { method: 'POST', data: { code: codeInitial }, session: true });
  assert.equal(validation.json.authenticated, true);
  assert.equal(validation.json.recovery_codes.length, 8);
  const codesSecours = validation.json.recovery_codes;
  assert.equal(new Set(codesSecours).size, 8);
  assert(memoriserCookie(validation.reponse, 'portfolio_backoffice').includes('; Secure'));
  assert((await requete('/api/backoffice/session', { session: true })).json.authenticated);
  console.log('[integration] Production : identifiants → inscription TOTP → session, QR et codes de secours : OK');

  await requete('/api/backoffice/logout', { method: 'POST', session: true });
  const reconnexion = await requete('/api/backoffice/login', { method: 'POST', data: { email: emailConnexion, password: motDePasse } });
  assert.equal(reconnexion.json.enrollment_required, false);
  memoriserCookie(reconnexion.reponse, 'portfolio_backoffice_challenge');
  await requete('/api/backoffice/2fa/verify', { method: 'POST', data: { code: codeInitial }, session: true, status: 401 });
  const secours = await requete('/api/backoffice/2fa/verify', { method: 'POST', data: { code: codesSecours[0] }, session: true });
  assert.equal(secours.json.authenticated, true);
  assert(!('recovery_codes' in secours.json), 'Les codes de secours ne doivent être affichés qu’à l’inscription.');
  memoriserCookie(secours.reponse, 'portfolio_backoffice');

  await arreterBackend();
  await demarrerBackend(envProtege);
  assert((await requete('/api/backoffice/session', { session: true })).json.authenticated, 'La session 2FA complète doit survivre au redémarrage.');
  await requete('/api/backoffice/logout', { method: 'POST', session: true });
  const connexionApres = await requete('/api/backoffice/login', { method: 'POST', data: { email: emailConnexion, password: motDePasse } });
  assert.equal(connexionApres.json.enrollment_required, false, 'L’inscription doit survivre au redémarrage.');
  memoriserCookie(connexionApres.reponse, 'portfolio_backoffice_challenge');
  await requete('/api/backoffice/2fa/verify', { method: 'POST', data: { code: codesSecours[0] }, session: true, status: 401 });
  const secondSecours = await requete('/api/backoffice/2fa/verify', { method: 'POST', data: { code: codesSecours[1] }, session: true });
  memoriserCookie(secondSecours.reponse, 'portfolio_backoffice');
  assert.equal((await requete('/api/backoffice/contacts?status=all', { session: true })).json.total, 1);
  console.log('[integration] TOTP non réutilisable, secours à usage unique et inscription persistée : OK');

  await arreterBackend();
  const base = await readFile(envProtege.DATABASE_PATH);
  assert(!base.includes(Buffer.from(inscription.secret)) && !base.includes(decoderBase32(inscription.secret)), 'Le secret TOTP doit rester chiffré en SQLite.');
  assert(codesSecours.every((code) => !base.includes(Buffer.from(code)) && !base.includes(Buffer.from(code.replaceAll('-', '')))), 'Les codes de secours doivent être stockés sous forme d’empreintes.');
  execFileSync(executable, ['--reset-2fa'], { cwd: dossierTemporaire, env: envProtege, encoding: 'utf8', maxBuffer: 4096 });
  await demarrerBackend(envProtege);
  await requete('/api/backoffice/session', { session: true, status: 401 });
  const apresReset = await requete('/api/backoffice/login', { method: 'POST', data: { email: emailConnexion, password: motDePasse } });
  assert.equal(apresReset.json.enrollment_required, true, 'La CLI doit imposer une nouvelle inscription et révoquer les sessions.');
  assert.equal(apresReset.json.authenticated, false);
  assert.equal(apresReset.json.two_factor_required, true);
  console.log('[integration] Réinitialisation 2FA hors ligne : accès révoqué et réinscription obligatoire : OK');
}

async function capturerInterface() {
  const require = createRequire(new URL('../site/package.json', import.meta.url));
  const { chromium } = require('@playwright/test');
  const AxeBuilder = require('@axe-core/playwright').default;
  navigateur = await chromium.launch({ headless: true });
  const separateur = cookie.indexOf('=');
  const screenshots = [];
  const stabiliserCapture = async (page) => {
    await page.evaluate(() => {
      document.activeElement?.blur?.();
      window.scrollTo(0, 0);
    });
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  };
  const capturerBlog = async (page, nom, ecran) => {
    await stabiliserCapture(page);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `L’écran ${ecran} doit tenir dans la fenêtre ${nom}.`);
    const audit = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']).analyze();
    assert.deepEqual(audit.violations.map((violation) => ({ rule: violation.id, targets: violation.nodes.map((node) => node.target) })), [], `L’écran ${ecran} doit rester accessible à la largeur ${nom}.`);
    const image = path.join(process.platform === 'win32' ? tmpdir() : '/tmp', `backoffice-blog-${ecran}-${nom}.png`);
    await page.screenshot({ path: image, fullPage: true });
    screenshots.push(image);
  };
  for (const [nom, largeur, hauteur] of [['desktop', 1440, 1000], ['mobile', 390, 844]]) {
    const contexte = await navigateur.newContext({ viewport: { width: largeur, height: hauteur }, locale: 'fr-FR', timezoneId: 'Europe/Paris', reducedMotion: 'reduce' });
    try {
      await contexte.addCookies([{ name: cookie.slice(0, separateur), value: cookie.slice(separateur + 1), domain: '127.0.0.1', path: '/api/backoffice', httpOnly: true, secure: false, sameSite: 'Strict' }]);
      const page = await contexte.newPage();
      const erreurs = [];
      page.on('pageerror', (error) => erreurs.push(error.message));
      await page.goto(`${origine}/backoffice`);
      await page.locator('#bo-workspace').waitFor({ state: 'visible' });
      await page.locator('#bo-contact-list button').first().click();
      await page.locator('#bo-contact-message').waitFor({ state: 'visible' });
      await page.evaluate(() => document.fonts.ready);
      assert(await page.locator('#bo-contact-message').textContent() === message.message, 'L’interface doit afficher le message réellement conservé.');
      assert(await page.locator('.bo-skip').evaluate((lien) => lien.getBoundingClientRect().bottom <= 0), 'Au scroll, le lien d’évitement sans focus doit rester hors de la fenêtre.');
      // Le détail défile à sa sélection sur mobile. Revenir en haut évite que
      // les éléments fixes soient placés au milieu d’une capture pleine page.
      await stabiliserCapture(page);
      const dossierImages = process.platform === 'win32' ? tmpdir() : '/tmp';
      const reception = path.join(dossierImages, `backoffice-${nom}.png`);
      await page.screenshot({ path: reception, fullPage: true });
      screenshots.push(reception);
      await page.getByRole('navigation', { name: 'Rubriques du backoffice' }).getByRole('link', { name: 'Boîte à outils' }).click();
      await page.locator('#bo-link-list a').waitFor({ state: 'visible' });
      await stabiliserCapture(page);
      const outils = path.join(dossierImages, `backoffice-tools-${nom}.png`);
      await page.screenshot({ path: outils, fullPage: true });
      screenshots.push(outils);
      await page.getByRole('navigation', { name: 'Rubriques du backoffice' }).getByRole('link', { name: 'Blog', exact: true }).click();
      await page.waitForURL('**/backoffice/blog');
      await page.locator('#blog-new').click();
      await page.waitForURL('**/backoffice/blog/redaction');
      await page.locator('#blog-title').fill(`Comprendre les décisions de conception (${nom})`);
      await page.locator('#blog-excerpt').fill('Expliquer une décision et les contraintes qui ont guidé sa mise en œuvre.');
      await page.locator('.tiptap').fill('Une décision gagne à être expliquée à ceux qui devront la faire évoluer.');
      await page.locator('.tiptap').press('ControlOrMeta+A');
      await page.getByRole('button', { name: 'Lien', exact: true }).click();
      await page.locator('#blog-link-url').fill('/projets');
      await page.getByRole('button', { name: 'Appliquer le lien', exact: true }).click();
      await page.locator('.tiptap').press('ControlOrMeta+End');
      await page.locator('.tiptap').press('Enter');
      await page.getByRole('button', { name: 'Tableau', exact: true }).click();
      for (const [index, titre] of ['Choix', 'Contrainte', 'Conséquence'].entries()) {
        await page.locator('.tiptap th p').nth(index).fill(titre);
      }
      for (const [index, contenu] of ['Séparer les responsabilités', 'Faire évoluer chaque partie', 'Une modification reste localisée'].entries()) {
        await page.locator('.tiptap td p').nth(index).fill(contenu);
      }
      await page.locator('#blog-save').click();
      await page.waitForFunction(() => document.querySelector('#blog-save-state')?.textContent === 'Enregistré');
      const articleId = new URL(page.url()).searchParams.get('id');
      assert(articleId && /^[1-9]\d*$/.test(articleId), 'La création doit inscrire l’identifiant dans l’adresse de rédaction.');
      await capturerBlog(page, nom, 'redaction');
      await page.locator('[data-blog-section-link="medias"]').click();
      await page.waitForURL(`**/backoffice/blog/medias?id=${articleId}`);
      await page.locator('#blog-tags').fill('Architecture, transmission');
      await page.locator('#blog-save').click();
      await page.waitForFunction(() => document.querySelector('#blog-save-state')?.textContent === 'Enregistré');
      await capturerBlog(page, nom, 'medias');
      await page.locator('[data-blog-section-link="seo"]').click();
      await page.waitForURL(`**/backoffice/blog/seo?id=${articleId}`);
      await page.locator('#blog-seo-title').fill('Comprendre et partager les décisions de conception');
      await page.locator('#blog-seo-description').fill('Expliquer les contraintes qui ont guidé une décision de conception et partager les choix pour permettre à chacun de les comprendre.');
      await page.locator('#blog-save').click();
      await page.waitForFunction(() => document.querySelector('#blog-save-state')?.textContent === 'Enregistré');
      await capturerBlog(page, nom, 'seo');
      await page.locator('[data-blog-section-link="publication"]').click();
      await page.waitForURL(`**/backoffice/blog/publication?id=${articleId}`);
      await page.locator('#blog-scheduled-at').fill('2030-06-08T14:30');
      await capturerBlog(page, nom, 'publication');
      await page.locator('#blog-back').click();
      await page.waitForURL('**/backoffice/blog');
      await page.locator('#blog-post-list .blog-post-row').first().waitFor({ state: 'visible' });
      await capturerBlog(page, nom, 'liste');
      assert((await page.locator('#blog-post-list').innerText()).includes(`Comprendre les décisions de conception (${nom})`), 'La liste doit montrer l’article réellement enregistré.');
      await page.goto(`${origine}/backoffice/blog/seo?id=${articleId}`);
      await page.locator('#blog-seo-title').waitFor({ state: 'visible' });
      await page.waitForFunction(() => document.querySelector('#blog-seo-title')?.value === 'Comprendre et partager les décisions de conception');
      assert.equal(await page.locator('#blog-seo-title').inputValue(), 'Comprendre et partager les décisions de conception', 'L’accès direct doit retrouver les réglages SEO persistés.');
      assert.equal(erreurs.length, 0, 'L’interface réelle doit être sans exception JavaScript.');
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'L’interface doit tenir dans la largeur de la fenêtre.');
    } finally { await contexte.close(); }
  }
  console.log(`[integration] Captures : ${screenshots.join(', ')}`);
}

async function main() {
  await access(executable);
  await access(path.join(dist, 'backoffice/index.html'));
  dossierTemporaire = await mkdtemp(path.join(tmpdir(), 'portfolio-backoffice-test-'));
  const portBackend = await portLibre();
  backendOrigine = `http://127.0.0.1:${portBackend}`;
  const proxyToken = randomBytes(32).toString('hex');
  const envBackend = {
    BACKEND_ADDR: `127.0.0.1:${portBackend}`, DATABASE_PATH: path.join(dossierTemporaire, 'portfolio.sqlite3'),
    CONTACT_EMAIL: adresseInitiale, BACKEND_PROXY_TOKEN: proxyToken, APP_ENV: 'development',
    BACKOFFICE_EMAIL: emailConnexion, BACKOFFICE_PASSWORD: motDePasse, BACKOFFICE_TOTP_ENCRYPTION_KEY: randomBytes(32).toString('hex'),
    BACKOFFICE_COOKIE_SECURE: 'false', SMTP_HOST: '', SMTP_FROM: '', SMTP_USERNAME: '', SMTP_PASSWORD: '', SMTP_PORT: '', SMTP_TLS: '',
  };
  await demarrerBackend(envBackend);
  serveur = creerServeur({ dossier: dist, env: {
    BACKEND_URL: backendOrigine, BACKEND_PROXY_TOKEN: proxyToken, CONTACT_EMAIL: '', TRUST_PROXY: '0',
    UMAMI_WEBSITE_ID: '', UMAMI_SITE_DOMAIN: '', REDIRECT_HOSTS: '', CANONICAL_ORIGIN: '',
  } });
  serveur.listen(0, '127.0.0.1');
  await once(serveur, 'listening');
  origine = `http://127.0.0.1:${serveur.address().port}`;
  const empreinteBuild = createHash('sha256').update(await readFile(path.join(dist, 'contact/index.html'))).digest('hex');
  const publicAvant = await requete('/contact');
  assert(publicAvant.texte.includes(adresseInitiale), 'L’adresse initiale doit venir de la base, sans env côté Node.');
  const prive = await requete('/backoffice');
  assert.equal(prive.reponse.headers.get('cache-control'), 'no-store');
  assert.equal(prive.reponse.headers.get('x-robots-tag'), 'noindex, nofollow');
  assert(!prive.texte.includes('/mesure.js'), 'Le backoffice doit rester hors mesure.');
  for (const page of ['blog', 'blog/redaction', 'blog/medias', 'blog/seo', 'blog/publication']) {
    await access(path.join(dist, `backoffice/${page}/index.html`));
    const route = `/backoffice/${page}`;
    const prive = await requete(route);
    assert.equal(prive.reponse.headers.get('cache-control'), 'no-store', `${route} doit rester hors cache.`);
    assert.equal(prive.reponse.headers.get('x-robots-tag'), 'noindex, nofollow', `${route} doit rester hors indexation.`);
    assert(!prive.texte.includes('/mesure.js'), `${route} doit rester hors mesure.`);
    const head = await requete(route, { method: 'HEAD' });
    assert.equal(head.reponse.headers.get('cache-control'), 'no-store');
    assert.equal(head.texte, '');
  }
  await requete('/api/backoffice/session', { status: 401 });
  const connexion = await requete('/api/backoffice/login', { method: 'POST', data: { email: emailConnexion, password: motDePasse } });
  const setCookie = memoriserCookie(connexion.reponse, 'portfolio_backoffice');
  assert(!setCookie.includes('; Secure'), 'Le cookie de ce test HTTP local doit être utilisable.');
  assert((await requete('/api/backoffice/session', { session: true })).json.authenticated, 'La session doit traverser le relais Node.');
  console.log('[integration] Connexion réelle et cookie du relais Node : OK');

  const contact = await requete('/api/contact', { method: 'POST', data: message });
  assert(contact.json.message.includes('enregistré'), 'Le succès doit confirmer la conservation de la demande.');
  const boite = (await requete('/api/backoffice/contacts?status=new&limit=50&offset=0', { session: true })).json;
  assert.equal(boite.total, 1);
  assert.equal(boite.new_count, 1);
  assert.equal(boite.contacts[0].message, message.message);
  assert.equal(boite.contacts[0].delivery_status, 'unconfigured');
  const contactId = boite.contacts[0].id;
  console.log('[integration] Demande conservée et visible sans SMTP : OK');

  await requete('/api/backoffice/settings', { method: 'PUT', data: { email: adresseFinale }, session: true, csrf: false, status: 403 });
  await requete('/api/backoffice/settings', { method: 'PUT', data: { email: adresseFinale }, session: true, headers: { Origin: 'https://etranger.example.test' }, status: 403 });
  await requete('/api/backoffice/settings', { method: 'PUT', data: { email: adresseFinale }, session: true });
  const publicApres = await requete('/contact');
  assert(publicApres.texte.includes(adresseFinale) && !publicApres.texte.includes(adresseInitiale), 'Le HTML servi doit refléter le changement sans redémarrage.');
  assert(publicApres.texte.includes(`mailto:${encodeURIComponent(adresseFinale)}`), 'Le lien e-mail doit lui aussi être actualisé.');
  assert.notEqual(publicAvant.reponse.headers.get('etag'), publicApres.reponse.headers.get('etag'));
  assert.equal(createHash('sha256').update(await readFile(path.join(dist, 'contact/index.html'))).digest('hex'), empreinteBuild, 'Le build doit rester identique après le réglage.');
  const lien = (await requete('/api/backoffice/links', { method: 'POST', data: { label: 'Umami', url: 'https://umami.example.test', description: 'Mesure d’audience' }, session: true, status: 201 })).json;
  // Sans permissions demandées, un accès lit seulement le blog : les demandes se demandent exprès.
  const parDefaut = (await requete('/api/backoffice/tokens', { method: 'POST', data: { name: 'Accès par défaut' }, session: true, status: 201 })).json;
  assert.deepEqual(parDefaut.scopes, ['blog:read'], 'Un accès sans permissions demandées ne doit pas lire les demandes de contact.');
  await requete(`/api/backoffice/tokens/${parDefaut.id}`, { method: 'DELETE', session: true });
  const jeton = (await requete('/api/backoffice/tokens', { method: 'POST', data: { name: 'Client de test', scopes: ['contacts:read', 'blog:read'] }, session: true, status: 201 })).json;
  assert(typeof jeton.token === 'string' && jeton.token.length >= 32, 'La création doit retourner un secret MCP.');
  assert.deepEqual(jeton.scopes, ['contacts:read', 'blog:read']);
  const catalogueJetons = await requete('/api/backoffice/tokens', { session: true });
  assert(!catalogueJetons.texte.includes(jeton.token), 'La liste des accès ne doit pas exposer leur secret.');
  console.log('[integration] Destinataire actualisé sans rebuild, outils et jeton : OK');

  const initialise = await mcp('initialize', { protocolVersion: '2025-11-25', capabilities: {}, clientInfo: { name: 'integration-portfolio', version: '1.0' } }, { bearer: jeton.token });
  assert.equal(initialise.result.protocolVersion, '2025-11-25');
  const outils = await mcp('tools/list', {}, { bearer: jeton.token });
  assert.deepEqual(outils.result.tools.map((outil) => outil.name).sort(), ['blog_get_post', 'blog_list_media', 'blog_list_posts', 'blog_preview_post', 'blog_seo_audit', 'contacts_summary', 'get_contact_request', 'list_contact_requests', 'list_toolbox_links']);
  assert(outils.result.tools.every((outil) => outil.annotations.readOnlyHint), 'Les outils MCP doivent être déclarés en lecture seule.');
  const resume = await mcp('tools/call', { name: 'contacts_summary', arguments: {} }, { bearer: jeton.token });
  assert.equal(resume.result.structuredContent.new_count, 1);
  const liste = await mcp('tools/call', { name: 'list_contact_requests', arguments: { status: 'new', limit: 10, offset: 0 } }, { bearer: jeton.token });
  assert.equal(liste.result.structuredContent.contacts[0].id, contactId);
  assert(!('email' in liste.result.structuredContent.contacts[0]) && !('message' in liste.result.structuredContent.contacts[0]), 'Les résumés MCP doivent omettre le corps et l’e-mail.');
  const detail = await mcp('tools/call', { name: 'get_contact_request', arguments: { id: contactId } }, { bearer: jeton.token });
  assert.equal(detail.result.structuredContent.contact.message, message.message);
  assert.equal(detail.result.structuredContent.contact.status, 'new', 'La lecture MCP ne doit pas marquer la demande comme lue.');
  const liens = await mcp('tools/call', { name: 'list_toolbox_links', arguments: {} }, { bearer: jeton.token });
  assert.equal(liens.result.structuredContent.links[0].id, lien.id);
  await testerBlog(jeton.token);
  await testerStockage(jeton.token);
  await testerAccesRedaction();
  await mcp('tools/list', {}, { session: true, status: 401 });
  await requete('/api/backoffice/contacts', { bearer: jeton.token, status: 401 });
  await requete(`/api/backoffice/tokens/${jeton.id}`, { method: 'DELETE', session: true });
  await mcp('tools/list', {}, { bearer: jeton.token, status: 401 });
  console.log('[integration] MCP réel, isolation cookie/Bearer et révocation immédiate : OK');

  await arreterBackend();
  await demarrerBackend({ ...envBackend, CONTACT_EMAIL: '' });
  const sessionApres = (await requete('/api/backoffice/session', { session: true })).json;
  assert.equal(sessionApres.authenticated, true, 'La session existante doit survivre au redémarrage.');
  assert.equal(sessionApres.smtp_configured, false);
  assert.equal((await requete('/api/backoffice/settings', { session: true })).json.email, adresseFinale);
  const boiteApres = (await requete('/api/backoffice/contacts?status=all&limit=50&offset=0', { session: true })).json;
  assert.equal(boiteApres.total, 1);
  assert.equal(boiteApres.contacts[0].id, contactId);
  assert.equal((await requete('/api/backoffice/links', { session: true })).json.links[0].id, lien.id);
  assert.equal((await requete('/api/backoffice/tokens', { session: true })).json.tokens.length, 0);
  assert((await requete('/contact')).texte.includes(adresseFinale));
  console.log('[integration] Redémarrage sans CONTACT_EMAIL : données, adresse et session conservées');
  await testerEnvoi(envBackend);
  await testerExpiration(envBackend);
  if (process.argv.includes('--screenshots')) await capturerInterface();
  await testerDoubleAuthentification(envBackend);
  console.log('[integration] Tous les contrôles du backoffice passent.');
}

/**
 * Un faux serveur SMTP en clair sur la boucle locale (permis en développement) :
 * il accepte l’authentification PLAIN et chaque message, et garde ce qu’il reçoit.
 */
async function fauxSmtp() {
  const recu = { lignes: [], connexions: 0 };
  const serveurSmtp = createServer((socket) => {
    recu.connexions += 1;
    socket.setEncoding('utf8');
    socket.write('220 faux.test ESMTP\r\n');
    let tampon = '';
    let donnees = false;
    socket.on('data', (morceau) => {
      tampon += morceau;
      let fin;
      while ((fin = tampon.indexOf('\r\n')) >= 0) {
        const ligne = tampon.slice(0, fin);
        tampon = tampon.slice(fin + 2);
        recu.lignes.push(ligne);
        if (donnees) {
          if (ligne === '.') { donnees = false; socket.write('250 Accepted\r\n'); }
          continue;
        }
        const commande = ligne.toUpperCase();
        if (commande.startsWith('EHLO')) socket.write('250-faux.test\r\n250-AUTH PLAIN\r\n250 8BITMIME\r\n');
        else if (commande.startsWith('AUTH')) socket.write('235 2.7.0 OK\r\n');
        else if (commande === 'DATA') { donnees = true; socket.write('354 Fin par un point\r\n'); }
        else if (commande.startsWith('QUIT')) { socket.end('221 Au revoir\r\n'); }
        else socket.write('250 OK\r\n');
      }
    });
    socket.on('error', () => {});
  });
  serveurSmtp.listen(0, '127.0.0.1');
  await once(serveurSmtp, 'listening');
  return { recu, port: serveurSmtp.address().port, fermer: () => new Promise((resolve) => { serveurSmtp.close(resolve); serveurSmtp.unref(); }) };
}

/**
 * Le serveur d’envoi réglé dans le backoffice, à travers le relais Node : le
 * mot de passe n’est jamais renvoyé, l’essai et la notification suivante
 * passent par le réglage enregistré, sans redémarrage, puis le réglage s’oublie.
 */
async function testerEnvoi() {
  const smtp = await fauxSmtp();
  const secretBoite = 'mot-de-passe-de-la-boite-factice';
  try {
    const initial = (await requete('/api/backoffice/mail', { session: true })).json;
    assert.equal(initial.source, 'none');
    assert.equal(initial.active, false);
    assert.equal(initial.password_storage, true, 'La clé du .env permet de chiffrer le mot de passe.');
    const refus = await requete('/api/backoffice/mail', { method: 'PUT', session: true, status: 422, data: { enabled: true, host: 'https://smtp.hostinger.com', port: 8080, security: 'tls', username: '', from: 'pas-une-adresse' } });
    assert.deepEqual(Object.keys(refus.json.fields).sort(), ['from', 'host', 'port']);
    await requete('/api/backoffice/mail/test', { method: 'POST', data: {}, session: true, status: 409 });
    const reglage = { enabled: true, host: '127.0.0.1', port: smtp.port, security: 'none', username: 'boite@example.test', password: secretBoite, from: 'boite@example.test' };
    await requete('/api/backoffice/mail', { method: 'PUT', data: reglage, session: true, csrf: false, status: 403 });
    const enregistre = await requete('/api/backoffice/mail', { method: 'PUT', data: reglage, session: true });
    assert(!enregistre.texte.includes(secretBoite), 'Le mot de passe ne revient jamais.');
    assert.equal(enregistre.json.settings.password_set, true);
    assert.equal(enregistre.json.active, true);
    assert.equal((await requete('/api/backoffice/session', { session: true })).json.smtp_configured, true);
    const base = new DatabaseSync(path.join(dossierTemporaire, 'portfolio.sqlite3'), { readOnly: true });
    const chiffre = base.prepare('SELECT encrypted_password FROM mail_settings').get().encrypted_password;
    base.close();
    assert(!Buffer.from(chiffre).includes(Buffer.from(secretBoite)), 'Le mot de passe est chiffré au repos.');

    const essai = await requete('/api/backoffice/mail/test', { method: 'POST', data: {}, session: true });
    assert.equal(essai.json.result, 'sent');
    assert.equal(essai.json.recipient, adresseFinale);
    assert(smtp.recu.lignes.includes(`RCPT TO:<${adresseFinale}>`), 'L’essai part vers l’adresse de contact.');
    const authentification = smtp.recu.lignes.find((ligne) => ligne.startsWith('AUTH PLAIN '));
    assert.equal(Buffer.from(authentification.slice(11), 'base64').toString(), `\0boite@example.test\0${secretBoite}`, 'Le mot de passe déchiffré est celui saisi.');
    const suivant = await requete('/api/backoffice/mail/test', { method: 'POST', data: {}, session: true, status: 429 });
    assert(suivant.reponse.headers.get('retry-after'), 'L’essai suivant attend son tour.');

    // La prochaine demande suit le réglage, sans redémarrage.
    await requete('/api/contact', { method: 'POST', data: { ...message, subject: 'Notification par le réglage' } });
    const boite = (await requete('/api/backoffice/contacts?status=all&limit=50&offset=0', { session: true })).json;
    assert.equal(boite.contacts[0].subject, 'Notification par le réglage');
    assert.equal(boite.contacts[0].delivery_status, 'sent');
    assert(smtp.recu.lignes.some((ligne) => ligne.startsWith('Reply-To:') && ligne.includes(message.email)), 'Le visiteur est en Reply-To.');
    // Les contrôles suivants comptent une seule demande.
    await requete(`/api/backoffice/contacts/${boite.contacts[0].id}`, { method: 'DELETE', session: true });

    const oublie = (await requete('/api/backoffice/mail', { method: 'DELETE', session: true })).json;
    assert.equal(oublie.source, 'none');
    assert.equal(oublie.settings, null);
    console.log('[integration] Serveur d’envoi réglé, chiffré, essayé, notifié sans redémarrage puis oublié : OK');
  } finally {
    await smtp.fermer();
  }
}

/** Un accès MCP expire au plus tard dans un an ; expiré, il reste listé et le MCP le refuse. */
async function testerExpiration() {
  await requete('/api/backoffice/tokens', { method: 'POST', data: { name: 'Trop long', scopes: ['blog:read'], expires_in_days: 366 }, session: true, status: 422 });
  const acces = (await requete('/api/backoffice/tokens', { method: 'POST', data: { name: 'Une semaine', scopes: ['blog:read'], expires_in_days: 7 }, session: true, status: 201 })).json;
  const jours = (Date.parse(acces.expires_at) - Date.now()) / 86_400_000;
  assert(jours > 6.9 && jours <= 7, 'L’accès expire dans sept jours.');
  await mcpModerne('tools/list', {}, { bearer: acces.token });
  const base = new DatabaseSync(path.join(dossierTemporaire, 'portfolio.sqlite3'));
  base.prepare("UPDATE tokens SET expires_at='2026-01-01T00:00:00.000Z' WHERE id=?").run(acces.id);
  base.close();
  const refus = await requete('/mcp', { method: 'POST', accept: 'application/json, text/event-stream', bearer: acces.token, data: { jsonrpc: '2.0', id: 1, method: 'tools/list' }, headers: { 'MCP-Protocol-Version': '2025-11-25' }, status: 401 });
  assert.equal(refus.json.code, 'TOKEN_EXPIRED');
  assert(refus.reponse.headers.get('www-authenticate'), 'Le relais garde l’en-tête d’authentification.');
  assert(!refus.texte.includes('Une semaine'), 'Le refus ne dit rien de l’accès.');
  const liste = (await requete('/api/backoffice/tokens', { session: true })).json.tokens;
  assert.equal(liste.find(({ id }) => id === acces.id).expired, true);
  await requete(`/api/backoffice/tokens/${acces.id}`, { method: 'DELETE', session: true });
  console.log('[integration] Accès MCP : un an au plus, expiré refusé (TOKEN_EXPIRED) puis supprimé : OK');
}

async function testerBlog(lecture) {
  const jeton = (await requete('/api/backoffice/tokens', { method: 'POST', data: { name: 'Édition blog test', scopes: ['blog:read', 'blog:write', 'blog:publish'] }, session: true, status: 201 })).json;
  const call = async (name, args, bearer = jeton.token) => (await mcp('tools/call', { name, arguments: args }, { bearer })).result;
  // Le catalogue de la Publication : tout le blog, suppression des images comprise (blog:publish).
  const catalogue = await mcpModerne('tools/list', {}, { bearer: jeton.token });
  assert.deepEqual(catalogue.result.tools.map((outil) => outil.name).sort(), ['blog_create_post', 'blog_delete_media', 'blog_delete_post', 'blog_get_post', 'blog_list_media', 'blog_list_posts', 'blog_preview_post', 'blog_publish_post', 'blog_schedule_post', 'blog_seo_audit', 'blog_unpublish_post', 'blog_update_post', 'blog_upload_media']);
  assert.equal(catalogue.result.cacheScope, 'private');
  const image = (await call('blog_upload_media', { filename: 'figure.png', content_type: 'image/png', data_base64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aXioAAAAASUVORK5CYII=' })).structuredContent;
  assert.equal(typeof image.url, 'string');
  await requete(image.url, { status: 404 });
  const privateImage = await requete(image.url.replace('/api/blog/', '/api/backoffice/blog/'), { session: true });
  assert.equal(privateImage.reponse.headers.get('content-type'), 'image/png');
  assert.equal(privateImage.reponse.headers.get('cache-control'), 'no-store');
  const input = {
    title: 'Comprendre les décisions de conception', slug: 'decisions-de-conception', excerpt: 'Expliquer une décision et les contraintes qui ont guidé sa mise en œuvre.',
    content: { type: 'doc', content: [{ type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Une décision expliquée' }] }, { type: 'paragraph', content: [{ type: 'text', text: 'Le premier contenu de la publication.' }] }] },
    seo_title: 'Comprendre les décisions de conception', seo_description: 'Expliquer les choix de conception et les contraintes qui guident une décision pour permettre à chacun de comprendre et de la faire évoluer.',
    tags: ['Architecture'],
    cover_image: image.url, cover_alt: 'Figure de la décision de conception',
  };
  assert.equal((await call('blog_create_post', input, lecture)).isError, true, 'Un jeton de lecture ne doit pas rédiger.');
  let post = (await call('blog_create_post', input)).structuredContent;
  assert.equal(post.status, 'draft');
  await requete(`/blog/${post.slug}`, { status: 404 });
  await requete(`/api/backoffice/blog/preview/${post.id}`, { status: 401 });
  const preview = await requete(`/api/backoffice/blog/preview/${post.id}`, { session: true });
  assert(preview.texte.includes('Le premier contenu de la publication.'));
  assert.equal(preview.reponse.headers.get('cache-control'), 'no-store');
  assert.equal(preview.reponse.headers.get('x-robots-tag'), 'noindex, nofollow');
  assert(!preview.texte.includes('/mesure.js'));
  await requete(`/api/backoffice/blog/preview/${post.id}`, { session: true, method: 'HEAD' });
  const seo = await call('blog_seo_audit', { id: post.id });
  assert(Array.isArray(seo.structuredContent.checks));
  post = (await call('blog_publish_post', { id: post.id, revision: post.revision })).structuredContent;
  const html = (await requete(`/blog/${post.slug}`)).texte;
  assert(html.includes('<h1>Comprendre les décisions de conception</h1>'));
  assert(html.includes('BlogPosting') && html.includes('rel="canonical"'));
  const publicImage = await requete(image.url);
  assert.equal(publicImage.reponse.headers.get('content-type'), 'image/png');
  assert.equal(publicImage.reponse.headers.get('x-robots-tag'), null, 'Une image publiée doit rester indexable.');
  assert((await requete('/blog')).texte.includes(`/blog/${post.slug}`));
  assert((await requete('/sitemap.xml')).texte.includes(`/blog/${post.slug}`));
  if (process.argv.includes('--dev')) await testerRenduDeveloppement(post);
  const revised = { ...input, content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'La version programmée pour la suite.' }] }] } };
  post = (await call('blog_update_post', { ...revised, id: post.id, revision: post.revision })).structuredContent;
  assert((await requete(`/blog/${post.slug}`)).texte.includes('Le premier contenu de la publication.'), 'Enregistrer doit conserver la version publique.');
  assert.equal((await call('blog_publish_post', { id: post.id, revision: post.revision - 1 })).isError, true, 'Une ancienne révision doit être refusée.');
  post = (await call('blog_schedule_post', { id: post.id, revision: post.revision, scheduled_at: Math.floor(Date.now() / 1000) + 2 })).structuredContent;
  assert.equal(post.status, 'scheduled');
  await attendre(2200);
  assert((await requete(`/blog/${post.slug}`)).texte.includes('La version programmée pour la suite.'));
  post = (await call('blog_get_post', { id: post.id })).structuredContent;
  post = (await call('blog_unpublish_post', { id: post.id, revision: post.revision })).structuredContent;
  await requete(`/blog/${post.slug}`, { status: 404 });
  await requete(image.url, { status: 404 });
  // Une image citée par la version de travail reste ; libérée, elle se supprime par MCP.
  const enUsage = await call('blog_delete_media', { id: image.id });
  assert.equal(enUsage.isError, true);
  assert.equal(enUsage.structuredContent.code, 'MEDIA_IN_USE');
  await requete(`/api/backoffice/blog/posts/${post.id}`, { method: 'DELETE', data: { revision: post.revision }, session: true });
  assert.deepEqual((await call('blog_delete_media', { id: image.id })).structuredContent, { deleted: true, id: image.id });
  await requete(image.url.replace('/api/blog/', '/api/backoffice/blog/'), { session: true, status: 404 });
  await requete(`/api/backoffice/tokens/${jeton.id}`, { method: 'DELETE', session: true });
  console.log('[integration] Blog réel : MCP, brouillon privé, SEO HTML, snapshots, programmation, dépublication et suppression d’image : OK');
}

/**
 * La rubrique Stockage : GET /api/backoffice/storage à travers le relais Node,
 * session seulement (un accès MCP est refusé), et son contrat ; puis la
 * suppression d’une image inutilisée comme la fait l’interface (corps JSON
 * vide, exigé par le relais pour une mutation du blog).
 */
async function testerStockage(bearer) {
  await requete('/api/backoffice/storage', { status: 401 });
  await requete('/api/backoffice/storage', { bearer, status: 401 });
  const png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aXioAAAAASUVORK5CYII=';
  const image = (await requete('/api/backoffice/blog/media', { method: 'POST', data: { filename: 'stockage.png', content_type: 'image/png', data_base64: png }, session: true, status: 201 })).json;
  const rapport = (await requete('/api/backoffice/storage', { session: true })).json;
  assert.deepEqual(Object.keys(rapport).sort(), ['categories', 'contacts', 'database', 'disk', 'media', 'posts']);
  assert(rapport.disk && Number.isInteger(rapport.disk.total) && Number.isInteger(rapport.disk.available) && rapport.disk.available <= rapport.disk.total, 'Une base fichier doit dire la place de son disque.');
  const { database: base, categories } = rapport;
  assert(Number.isInteger(base.file) && Number.isInteger(base.wal), 'Une base fichier doit dire la taille de son fichier et de son journal.');
  assert.deepEqual(Object.keys(categories).sort(), ['contacts', 'media_originals', 'media_variants', 'posts', 'system']);
  assert.equal(Object.values(categories).reduce((total, valeur) => total + valeur, 0) + base.free, base.size, 'Les catégories et l’espace libre doivent faire la taille de la base.');
  assert.equal(rapport.contacts.count, 1);
  const totaux = rapport.media.map(({ total }) => total);
  assert.deepEqual(totaux, [...totaux].sort((a, b) => b - a), 'Les images vont de la plus lourde à la plus légère.');
  const stockee = rapport.media.find(({ id }) => id === image.id);
  assert(stockee, 'L’image importée doit apparaître dans le stockage.');
  assert.equal(stockee.filename, 'stockage.png');
  assert.equal(stockee.admin_url, `/api/backoffice/blog/media/${image.id}`);
  assert.deepEqual(stockee.posts, [], 'Une image tout juste importée n’est citée par aucun article.');
  assert.equal(stockee.total, stockee.size + stockee.variants.size);
  // La suppression : sans corps JSON, le relais la refuse ; avec, elle passe et le rapport suit.
  await requete(`/api/backoffice/blog/media/${image.id}`, { method: 'DELETE', session: true, status: 415 });
  assert.deepEqual((await requete(`/api/backoffice/blog/media/${image.id}`, { method: 'DELETE', data: {}, session: true })).json, { deleted: true, id: image.id });
  assert(!(await requete('/api/backoffice/storage', { session: true })).json.media.some(({ id }) => id === image.id), 'Une image supprimée doit quitter le stockage.');
  console.log('[integration] Stockage : session seulement, contrat, suppression d’une image inutilisée : OK');
}

async function testerRenduDeveloppement(post) {
  const port = await portLibre();
  const dev = spawn(process.execPath, [path.join(racine, 'site/node_modules/astro/bin/astro.mjs'), 'dev', '--ignore-lock', '--host', '127.0.0.1', '--port', String(port)], {
    cwd: path.join(racine, 'site'), env: { ...process.env, BACKEND_URL: backendOrigine, CONTACT_EMAIL: adresseFinale, UMAMI_WEBSITE_ID: '', UMAMI_SITE_DOMAIN: '' }, stdio: ['ignore', 'pipe', 'pipe'],
  });
  dev.stdout.resume(); dev.stderr.resume();
  try {
    const url = `http://127.0.0.1:${port}`;
    const started = Date.now();
    while (true) {
      try { if ((await fetch(`${url}/backoffice`, { signal: AbortSignal.timeout(1000) })).ok) break; } catch { /* Serveur de développement en démarrage. */ }
      if (dev.exitCode !== null || Date.now() - started > 20_000) throw new Error('Le serveur Astro de développement n’a pas démarré.');
      await attendre(100);
    }
    for (const route of ['/blog', `/blog/${post.slug}`, `/api/backoffice/blog/preview/${post.id}`]) {
      const response = await fetch(`${url}${route}`, { headers: { Cookie: cookie }, signal: AbortSignal.timeout(15_000) });
      assert.equal(response.status, 200, `Rendu Astro dev ${route}`);
      const html = await response.text();
      assert(html.includes(post.title), `Rendu Astro dev doit inclure l’article (${route}).`);
    }
    console.log('[integration] Astro dev : liste, article HTML et aperçu privé : OK');
  } finally {
    if (dev.exitCode === null && dev.signalCode === null) {
      const finished = once(dev, 'exit'); dev.kill('SIGTERM');
      const timer = setTimeout(() => dev.kill('SIGKILL'), 5000);
      try { await finished; } finally { clearTimeout(timer); }
    }
  }
}

try {
  await main();
} catch (error) {
  // Les assertions portent seulement sur des valeurs factices et jamais les secrets.
  console.error(`[integration] Échec : ${error.message}`);
  process.exitCode = 1;
} finally {
  const nettoyages = await Promise.allSettled([
    navigateur?.close(),
    (async () => {
      if (!serveur) return;
      serveur.closeAllConnections();
      await new Promise((resolve) => serveur.close(resolve));
    })(),
    arreterBackend(),
  ]);
  if (dossierTemporaire) await rm(dossierTemporaire, { recursive: true, force: true });
  if (nettoyages.some((resultat) => resultat.status === 'rejected')) {
    console.error('[integration] Le nettoyage d’un service de test a échoué.');
    process.exitCode = 1;
  }
}
