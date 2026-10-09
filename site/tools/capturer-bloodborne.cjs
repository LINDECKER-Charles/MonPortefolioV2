#!/usr/bin/env node
/**
 * Enregistrer les vrais rituels du front Bloodborne sur une API de démonstration.
 * Usage : node tools/capturer-bloodborne.cjs /chemin/Bloodborne-Legendary-Run
 * Le dépôt source reste en lecture seule ; aucun appel n’atteint une API réelle.
 * Prérequis : build front/dist/front/browser, Playwright/Chromium et ffmpeg.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');
const { execFileSync } = require('node:child_process');
const { chromium } = require('playwright');
const sharp = require('sharp');

const project = path.resolve(process.argv[2] || '');
assert.ok(process.argv[2], 'Indiquer le chemin du dépôt Bloodborne-Legendary-Run.');
const build = path.join(project, 'front/dist/front/browser');
assert.ok(fs.existsSync(path.join(build, 'index.html')), 'Construire le front source au préalable.');
const { source, seed } = require(path.join(project, 'front/e2e/mobile-fixtures.cjs'));
const capturedOn = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Paris' }).format(new Date());
const buildModifiedAt = fs.statSync(path.join(build, 'index.html')).mtime;
const output = path.resolve(__dirname, '../public/demos/bloodborne');
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-bloodborne-videos-'));
const selected = [
  { file: 'boss', kind: 'Boss', code: 'bos-001', label: 'Une victoire contre un boss' },
  { file: 'decouverte', kind: 'Zone', code: 'loc-003', label: 'La découverte d’un lieu' },
  { file: 'rune', kind: 'Rune', code: 'run-001', label: 'Une rune de Caryll' },
  { file: 'gemme', kind: 'BloodGem', code: 'spr-001', label: 'Une gemme de sang' },
];
const mimetypes = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json',
  '.woff2': 'font/woff2', '.png': 'image/png', '.webp': 'image/webp',
  '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.wav': 'audio/wav',
};

function encode(args) {
  execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], {
    stdio: 'pipe', timeout: 120000,
  });
}

function duration(file) {
  return Number(execFileSync('ffprobe', [
    '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', file,
  ], { encoding: 'utf8' }).trim());
}

function progressEntry(code) {
  return {
    starCode: code, achievedOn: capturedOn, claimedOn: capturedOn,
    deaths: null, note: null, screenshot: null, updatedAt: new Date().toISOString(),
  };
}

async function fixtures(context, base, galaxy, target) {
  const unexpected = await seed(context, base);
  const stars = new Map(source.stars.map((star) => [star.code, star]));
  const ancestors = new Set();
  function preceding(code) {
    for (const link of galaxy.links.filter((link) => link.to === code)) {
      if (ancestors.has(link.from)) continue;
      ancestors.add(link.from);
      preceding(link.from);
    }
  }
  preceding(target);
  const entries = new Map([...ancestors].map((code) => [code, progressEntry(code)]));
  let writes = 0;
  await context.route('**/api/progress/**', async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === '/api/progress/me' && route.request().method() === 'GET') {
      return route.fulfill({ json: {
        runId: 'first', characterName: 'Gehrman', entries: [...entries.values()],
        claims: [...entries.values()].map(({ starCode, claimedOn }) => ({ starCode, claimedOn })),
        spentEchoes: 0,
        summary: {
          litCount: entries.size, starCount: source.stars.length,
          bossLitCount: [...entries.keys()].filter((code) => stars.get(code).kind === 'Boss').length,
          bossCount: 45, bloodEchoes: [...entries.keys()].reduce((sum, code) => sum + (stars.get(code).bloodEchoes || 0), 0),
          unvaluedEchoesCount: 0, title: 'Chasseur', titleRarity: 'Commun',
        },
      } });
    }
    if (url.pathname === `/api/progress/${target}` && route.request().method() === 'PUT') {
      const entry = { ...progressEntry(target), ...route.request().postDataJSON(), ignitedGlobals: [] };
      entries.set(target, entry);
      writes += 1;
      return route.fulfill({ json: entry });
    }
    throw new Error(`Appel de progression inattendu : ${route.request().method()} ${url.pathname}`);
  });
  await context.addInitScript(() => {
    localStorage.setItem('bblr.opening.enabled', 'false');
    localStorage.setItem('bblr.feedback.sound', 'false');
    localStorage.setItem('bblr.motion.hold-ms', '1200');
    localStorage.setItem('bblr.motion.ignition-ms', '2400');
  });
  return { unexpected, isSaved: () => entries.has(target), writes: () => writes };
}

async function capture(browser, base, sample) {
  const galaxy = source.galaxies.find((galaxy) => galaxy.stars.some((star) => star.code === sample.code));
  assert.ok(galaxy, `Une galaxie doit poser ${sample.code}.`);
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, deviceScaleFactor: 1,
    isMobile: true, hasTouch: true, locale: 'fr-FR',
    reducedMotion: 'no-preference', recordVideo: { dir: temporary, size: { width: 390, height: 844 } },
  });
  const fixture = await fixtures(context, base, galaxy, sample.code);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => {
    if (response.url().includes('/assets/rituals/') && response.status() >= 400)
      errors.push(`${response.status()} ${response.url()}`);
  });
  try {
    await page.goto(`${base}/fr/sky/${galaxy.code}?star=${sample.code}`);
    const skip = page.getByRole('button', { name: 'Passer l’ouverture' });
    if (await skip.isVisible()) await skip.click();
    await page.locator('app-opening').waitFor({ state: 'detached' });
    const coal = page.locator('app-sky-coal button:not([disabled])');
    await coal.waitFor({ timeout: 20000 });
    await page.waitForTimeout(900);
    assert.match(await coal.innerText(), /Éveiller/);
    const clipStart = Date.now();
    await page.waitForTimeout(950);
    const box = await coal.boundingBox();
    assert.ok(box);
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    const saved = page.waitForResponse((response) =>
      new URL(response.url()).pathname === `/api/progress/${sample.code}` && response.request().method() === 'PUT');
    await page.mouse.down();
    await page.waitForTimeout(1350);
    await page.mouse.up();
    assert.equal((await saved).status(), 200);
    await page.locator('app-sky-ritual').waitFor();
    await page.waitForFunction(() => Number(document.querySelector('app-sky-ritual .ritual-scene')?.style.opacity) > 0);
    assert.equal(await page.locator('main[inert]').count(), 1);
    await page.waitForTimeout(2700);
    assert.equal(await page.locator('app-sky-ritual canvas').evaluate((canvas) => canvas.width > 0 && canvas.height > 0), true);
    assert.equal(await page.locator('app-sky-ritual .ritual-confirmation').evaluate((node) => node.classList.contains('ritual-hidden')), true);
    const poster = path.join(temporary, `${sample.file}-poster.png`);
    await page.screenshot({ path: poster });
    await page.locator('app-sky-ritual').waitFor({ state: 'detached', timeout: 12000 });
    assert.equal(fixture.isSaved(), true);
    assert.equal(fixture.writes(), 1);
    assert.match(await coal.innerText(), /Éteindre/);
    await page.waitForTimeout(1500);
    const clipLength = (Date.now() - clipStart) / 1000;
    const video = page.video();
    await context.close();
    const raw = path.join(temporary, `${sample.file}-raw.webm`);
    await video.saveAs(raw);
    const trimStart = Math.max(0, duration(raw) - clipLength);
    const trim = ['-ss', trimStart.toFixed(3), '-i', raw, '-t', clipLength.toFixed(3), '-an'];
    const mp4 = path.join(output, `${sample.file}.mp4`);
    const webm = path.join(output, `${sample.file}.webm`);
    encode([...trim, '-c:v', 'libx264', '-preset', 'medium', '-crf', '24', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', mp4]);
    encode([...trim, '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '34', '-row-mt', '1', webm]);
    await sharp(poster).webp({ quality: 88 }).toFile(path.join(output, `${sample.file}-poster.webp`));
    assert.deepEqual(errors, []);
    assert.deepEqual(fixture.unexpected, []);
    assert.ok(fs.statSync(mp4).size < 1500000, 'Le MP4 doit rester sous 1,5 Mo.');
    assert.ok(fs.statSync(webm).size < 1500000, 'Le WebM doit rester sous 1,5 Mo.');
    const report = {
      ...sample, name: source.stars.find((star) => star.code === sample.code).name,
      galaxy: galaxy.code, width: 390, height: 844, duration: Number(duration(mp4).toFixed(2)),
      mp4Bytes: fs.statSync(mp4).size, webmBytes: fs.statSync(webm).size,
      savedByGesture: true, ritualCompleted: true, errors,
    };
    console.log(JSON.stringify(report));
    return report;
  } catch (error) {
    await page.screenshot({ path: path.join(temporary, `${sample.file}-error.png`) }).catch(() => {});
    console.error('Captures de diagnostic :', temporary);
    throw error;
  } finally {
    await context.close();
  }
}

async function main() {
  fs.mkdirSync(output, { recursive: true });
  const server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    let file = path.resolve(build, `.${pathname}`);
    if (!file.startsWith(`${build}${path.sep}`) || !fs.existsSync(file) || !fs.statSync(file).isFile())
      file = path.join(build, 'index.html');
    response.setHeader('Content-Type', mimetypes[path.extname(file)] || 'application/octet-stream');
    response.setHeader('Cache-Control', 'no-store');
    fs.createReadStream(file).pipe(response);
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ headless: true });
  try {
    const reports = [];
    for (const sample of selected) reports.push(await capture(browser, base, sample));
    fs.writeFileSync(path.join(output, 'captures.json'), JSON.stringify({
      capturedOn, source: 'Bloodborne-Legendary-Run',
      buildAvailableSince: new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Paris' }).format(buildModifiedAt),
      buildLastModifiedAt: buildModifiedAt.toISOString(),
      sourceNote: 'Build local disponible, associé au catalogue JSON courant du projet.',
      interface: 'Front Angular construit ; moteur et gestes de l’application sans modification.',
      data: 'Catalogue réel ; compte et progression de démonstration ; API entièrement interceptée.',
      audio: false, clips: reports,
    }, null, 2) + '\n');
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
