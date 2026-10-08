#!/usr/bin/env node
/**
 * Intégration réelle du backend Rust, du relais Node et du MCP, sans mocks.
 * Prérequis : cargo build --manifest-path backend/Cargo.toml et build du site.
 * Usage : node scripts/test-backoffice.mjs [--screenshots]
 * Les données, mots de passe et jetons sont factices ; aucun SMTP n’est utilisé.
 */
import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import { createHash, createHmac, randomBytes } from 'node:crypto';
import { once } from 'node:events';
import { access, mkdtemp, readFile, rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { createServer } from 'node:net';
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
      await page.getByRole('tab', { name: 'Boîte à outils' }).click();
      await page.locator('#bo-link-list a').waitFor({ state: 'visible' });
      await stabiliserCapture(page);
      const outils = path.join(dossierImages, `backoffice-tools-${nom}.png`);
      await page.screenshot({ path: outils, fullPage: true });
      screenshots.push(outils);
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
    BACKOFFICE_EMAIL: emailConnexion, BACKOFFICE_PASSWORD: motDePasse, BACKOFFICE_TOTP_ENCRYPTION_KEY: '',
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
  const jeton = (await requete('/api/backoffice/tokens', { method: 'POST', data: { name: 'Client de test' }, session: true, status: 201 })).json;
  assert(typeof jeton.token === 'string' && jeton.token.length >= 32, 'La création doit retourner un secret MCP.');
  const catalogueJetons = await requete('/api/backoffice/tokens', { session: true });
  assert(!catalogueJetons.texte.includes(jeton.token), 'La liste des accès ne doit pas exposer leur secret.');
  console.log('[integration] Destinataire actualisé sans rebuild, outils et jeton : OK');

  const initialise = await mcp('initialize', { protocolVersion: '2025-11-25', capabilities: {}, clientInfo: { name: 'integration-portfolio', version: '1.0' } }, { bearer: jeton.token });
  assert.equal(initialise.result.protocolVersion, '2025-11-25');
  const outils = await mcp('tools/list', {}, { bearer: jeton.token });
  assert.deepEqual(outils.result.tools.map((outil) => outil.name).sort(), ['contacts_summary', 'get_contact_request', 'list_contact_requests', 'list_toolbox_links']);
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
  if (process.argv.includes('--screenshots')) await capturerInterface();
  await testerDoubleAuthentification(envBackend);
  console.log('[integration] Tous les contrôles du backoffice passent.');
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
