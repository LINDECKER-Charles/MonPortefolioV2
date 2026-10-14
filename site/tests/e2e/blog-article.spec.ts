import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import sharp from 'sharp';
import { creerServeur } from '../../server/server.mjs';
import { surveillerConsole } from './support/navigateur';

/**
 * Un article publié, rendu par le vrai serveur de production (server/server.mjs
 * sur dist/) et lu dans Chromium aux deux largeurs : le texte de l’auteur ne
 * déborde pas, les tableaux et le code défilent au clavier, l’impression et la
 * nuit restent lisibles. Le backend est une doublure qui sert
 * tests/fixtures/article-complet.json (document que la validation Rust admet,
 * backend/tests/blog_api.rs) et des images dessinées ici, avec leurs variantes.
 *
 * Les deux serveurs tournent dans le processus de chaque worker, sur des ports
 * libres : les serveurs de playwright.config.ts restent sans backend, comme
 * l’exige « le blog ne publie aucun article fictif » (pages.spec.ts).
 */
const ARTICLE = JSON.parse(readFileSync(new URL('../fixtures/article-complet.json', import.meta.url), 'utf8'));
const DIST = new URL('../../dist', import.meta.url).pathname;
const CHEMIN = `/blog/${ARTICLE.slug}`;
const REGLES = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

/** Les images de l’article : dimensions réelles et variantes, comme blog_media.rs les produit. */
const IMAGES: Record<number, { width: number; height: number; type: 'image/jpeg' | 'image/png'; variants: number[]; transparent?: boolean }> = {
  1: { width: 1600, height: 1000, type: 'image/jpeg', variants: [480, 960, 1600] },
  2: { width: 800, height: 2800, type: 'image/png', variants: [480] },
  3: { width: 320, height: 200, type: 'image/png', variants: [] },
  4: { width: 1200, height: 800, type: 'image/png', variants: [480, 960], transparent: true },
  5: { width: 800, height: 1400, type: 'image/jpeg', variants: [480, 800] },
  6: { width: 1200, height: 630, type: 'image/png', variants: [] },
};
const MEDIA = Object.fromEntries(Object.entries(IMAGES).map(([id, { width, height, variants }]) => [`/api/blog/media/${id}`, { width, height, variants }]));

function dessin(largeur: number, hauteur: number, transparent = false) {
  const r = Math.min(largeur, hauteur) / 3;
  const trait = Math.max(4, Math.round(r / 12));
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${largeur}" height="${hauteur}">${transparent ? '' : '<rect width="100%" height="100%" fill="#1f3a5f"/>'}<circle cx="${largeur / 2}" cy="${hauteur / 2}" r="${r}" fill="none" stroke="#111111" stroke-width="${trait}"/></svg>`);
}

async function fichiers() {
  const sortie = new Map<string, { type: string; octets: Buffer }>();
  for (const [id, image] of Object.entries(IMAGES)) {
    const source = sharp(dessin(image.width, image.height, image.transparent));
    const encoder = (s: sharp.Sharp) => (image.type === 'image/jpeg' ? s.jpeg({ quality: 80 }) : s.png());
    sortie.set(id, { type: image.type, octets: await encoder(source.clone()).toBuffer() });
    for (const largeur of image.variants) {
      sortie.set(`${id}/${largeur}`, { type: image.type, octets: await encoder(source.clone().resize({ width: largeur })).toBuffer() });
    }
  }
  return sortie;
}

let backend: Server;
let site: Server;
let base = '';

test.beforeAll(async () => {
  const octets = await fichiers();
  const publie = { id: 1, ...ARTICLE, status: 'published', published_at: 1791468000, scheduled_at: null, created_at: '2026-10-08T12:00:00Z', updated_at: '2026-10-08T12:00:00Z', revision: 2, has_unpublished_changes: false, scheduled_revision: null, media: MEDIA };
  const { content: _contenu, ...resume } = publie;
  backend = createServer((req, res) => {
    const url = req.url ?? '';
    const image = /^\/api\/blog\/media\/(\d+)(?:\/(\d+))?$/.exec(url);
    if (image) {
      const fichier = octets.get(image[2] ? `${image[1]}/${image[2]}` : image[1]);
      if (!fichier) { res.writeHead(404, { 'Content-Type': 'application/json' }); res.end('{}'); return; }
      res.writeHead(200, { 'Content-Type': fichier.type });
      res.end(fichier.octets);
      return;
    }
    res.setHeader('Content-Type', 'application/json');
    if (url === '/api/config/contact') { res.end('{"email":"e2e-contact@example.test"}'); return; }
    if (url.startsWith('/api/blog/posts?')) { res.end(JSON.stringify({ posts: [resume], total: 1, limit: 20, offset: 0 })); return; }
    if (url === `/api/blog/posts/${ARTICLE.slug}`) { res.end(JSON.stringify(publie)); return; }
    res.writeHead(404);
    res.end('{}');
  });
  await new Promise<void>((resolve) => backend.listen(0, '127.0.0.1', resolve));
  site = creerServeur({ dossier: DIST, env: { HOST: '127.0.0.1', CONTACT_EMAIL: 'e2e-contact@example.test', BACKEND_URL: `http://127.0.0.1:${(backend.address() as AddressInfo).port}` } });
  await new Promise<void>((resolve) => site.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${(site.address() as AddressInfo).port}`;
});

test.afterAll(async () => {
  await Promise.all([site, backend].filter(Boolean).map((serveur) => new Promise((resolve) => serveur.close(resolve))));
});

test.use({ reducedMotion: 'reduce' });

/** Ouvre l’article et le parcourt : les images différées arrivent. */
async function ouvrir(page: Page, chemin = CHEMIN) {
  const reponse = await page.goto(base + chemin);
  expect(reponse?.status()).toBe(200);
  const hauteur = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < hauteur; y += 600) await page.evaluate((position) => window.scrollTo({ top: position, behavior: 'instant' }), y);
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
}

test('le texte de l’auteur reste dans l’écran : titre, étiquettes, carte de la liste', async ({ page }) => {
  for (const chemin of [CHEMIN, '/blog']) {
    await ouvrir(page, chemin);
    const debordements = await page.evaluate(() => {
      const largeur = document.documentElement.clientWidth;
      return [...document.querySelectorAll<HTMLElement>('.blog-article__header *, .blog-list *')]
        .filter((el) => { const boite = el.getBoundingClientRect(); return boite.width > 0 && (boite.right > largeur + 0.5 || el.scrollWidth > el.clientWidth + 1); })
        .map((el) => `${el.tagName.toLowerCase()} « ${(el.textContent ?? '').trim().slice(0, 40)} »`);
    });
    expect(debordements, chemin).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), chemin).toBe(true);
  }
});

test('un tableau large défile au lieu de couper ses mots lettre à lettre', async ({ page }) => {
  await ouvrir(page);
  const large = await page.locator('.blog-table').first().evaluate((region) => ({
    defile: region.scrollWidth > region.clientWidth,
    plusEtroite: Math.min(...[...region.querySelectorAll('th, td')].map((cellule) => cellule.getBoundingClientRect().width)),
  }));
  expect(large.defile).toBe(true);
  expect(large.plusEtroite).toBeGreaterThanOrEqual(80);
  const lignes = await page.locator('th', { hasText: 'Montant' }).evaluate((cellule) => {
    const plage = document.createRange();
    plage.selectNodeContents(cellule.querySelector('p') ?? cellule);
    return plage.getClientRects().length;
  });
  expect(lignes, '« Montant » tient sur une ligne').toBe(1);
});

test('les cellules gardent l’alignement choisi par l’auteur', async ({ page }) => {
  await ouvrir(page);
  const alignements = await page.locator('.blog-table').nth(1).evaluate((region) => [...region.querySelectorAll('[class*="blog-align-"]')].map((cellule) => [cellule.className, getComputedStyle(cellule).textAlign]));
  expect(alignements.length).toBe(6);
  for (const [classe, valeur] of alignements) expect(valeur, classe).toBe(classe.replace('blog-align-', ''));
});

test('tableaux et blocs de code défilent au clavier', async ({ page }) => {
  await ouvrir(page);
  for (const selecteur of ['.blog-table', '.blog-prose pre']) {
    const region = page.locator(selecteur).first();
    await region.focus();
    await expect(region).toBeFocused();
    const avant = await region.evaluate((el) => el.scrollLeft);
    await page.keyboard.press('ArrowRight');
    await expect.poll(() => region.evaluate((el) => el.scrollLeft), selecteur).toBeGreaterThan(avant);
  }
});

test('les paragraphes restent séparés dans les listes, les citations et les cellules', async ({ page }) => {
  await ouvrir(page);
  const ecarts = await page.evaluate(() => ['li > p + p', 'blockquote > p + p', 'td > p + p', 'blockquote > h3 + p'].map((selecteur) => {
    const el = document.querySelector(`.blog-prose ${selecteur}`);
    return [selecteur, el ? parseFloat(getComputedStyle(el).marginTop) : -1] as const;
  }));
  for (const [selecteur, ecart] of ecarts) expect(ecart, selecteur).toBeGreaterThan(0);
  const titre = await page.locator('.blog-prose blockquote h3').evaluate((el) => [getComputedStyle(el).fontStyle, getComputedStyle(el.nextElementSibling!).fontStyle]);
  expect(titre[0], 'un titre cité se distingue du texte cité').not.toBe(titre[1]);
});

test('les images réservent leur place, ne s’agrandissent pas et chargent la variante utile', async ({ page }) => {
  await page.addInitScript(() => {
    (window as unknown as { decalage: number }).decalage = 0;
    new PerformanceObserver((liste) => { for (const entree of liste.getEntries() as unknown as { value: number; hadRecentInput: boolean }[]) if (!entree.hadRecentInput) (window as unknown as { decalage: number }).decalage += entree.value; }).observe({ type: 'layout-shift', buffered: true });
  });
  await ouvrir(page);
  const images = await page.locator('.blog-article img').evaluateAll((liste) => (liste as HTMLImageElement[]).map((img) => ({
    source: img.currentSrc.replace(location.origin, ''),
    attributs: [img.getAttribute('width'), img.getAttribute('height')],
    rendu: [img.getBoundingClientRect().width, img.getBoundingClientRect().height],
    naturel: [img.naturalWidth, img.naturalHeight],
  })));
  expect(images).toHaveLength(6);
  for (const image of images) {
    expect(image.attributs.every(Boolean), image.source).toBe(true);
    expect(Math.abs(image.rendu[0] / image.rendu[1] - image.naturel[0] / image.naturel[1]), `${image.source} garde ses proportions`).toBeLessThan(0.02);
    expect(image.rendu[1], image.source).toBeLessThanOrEqual(800.5);
  }
  expect(images.find((image) => image.source.startsWith('/api/blog/media/1'))?.source, 'la variante de 960 px suffit aux deux largeurs').toBe('/api/blog/media/1/960');
  const petites = images.filter((image) => image.source === '/api/blog/media/3');
  expect(petites.map((image) => Math.round(image.rendu[0]))).toEqual([320, 160]);
  expect(await page.evaluate(() => (window as unknown as { decalage: number }).decalage)).toBeLessThan(0.02);
  await expect(page.locator('.blog-article__cover')).toHaveAttribute('fetchpriority', 'high');
});

test('sans JavaScript, l’article est complet', async ({ browser }) => {
  const contexte = await browser.newContext({ javaScriptEnabled: false });
  const page = await contexte.newPage();
  await page.goto(base + CHEMIN);
  await expect(page.locator('.blog-article h1')).toContainText('extraordinairementlong');
  await expect(page.locator('.blog-prose table')).toHaveCount(4);
  await expect(page.locator('.blog-prose figure img')).toHaveCount(5);
  await contexte.close();
});

for (const theme of ['jour', 'nuit'] as const) {
  test.describe(`thème ${theme}`, () => {
    test.use({ colorScheme: theme === 'nuit' ? 'dark' : 'light' });

    test(`axe : l’article publié, sans erreur de console ni de CSP (${theme})`, async ({ page }) => {
      const problemes = surveillerConsole(page);
      await ouvrir(page);
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      const resultats = await new AxeBuilder({ page }).withTags(REGLES).analyze();
      expect(resultats.violations.map((v) => ({ regle: v.id, cibles: v.nodes.slice(0, 3).map((n) => n.target.join(' ')) }))).toEqual([]);
      expect(problemes).toEqual([]);
    });
  });
}
