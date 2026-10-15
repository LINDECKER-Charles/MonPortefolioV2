import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import sharp from 'sharp';
import { creerServeur } from '../../server/server.mjs';
import { surveillerConsole } from './support/navigateur';

/**
 * Un article publié, rendu par le vrai serveur de production (server/server.mjs
 * sur dist/) et lu dans Chromium aux deux largeurs, de jour et de nuit : le
 * texte de l’auteur ne déborde pas, les ancres mènent à leur titre, les
 * tableaux et le code défilent au clavier, l’impression reste lisible et les
 * images tiennent dans le budget. Le backend est une doublure qui sert
 * tests/fixtures/article-complet.json (document qui emploie tout l’inventaire
 * de schema-blog.json et que la validation Rust publie, backend/tests/blog_api.rs)
 * et les images de article-complet-media.json, dessinées ici avec leurs variantes
 * (l’original `lourd` est du bruit, plus lourd que le budget : seules ses
 * variantes, légères, doivent partir). La liste ajoute quatre articles, avec et
 * sans couverture, pour la grille. L’atelier du blog ouvre le même article,
 * API privée doublée dans le navigateur : ses images s’y affichent comme en
 * public.
 *
 * Les deux serveurs tournent dans le processus de chaque worker, sur des ports
 * libres : les serveurs de playwright.config.ts restent sans backend, comme
 * l’exige « le blog ne publie aucun article fictif » (pages.spec.ts).
 */
type Image = { width: number; height: number; type: 'image/jpeg' | 'image/png'; variants: number[]; transparent?: boolean; lourd?: boolean };
type Noeud = { type: string; attrs?: Record<string, unknown>; content?: Noeud[] };
const fixture = (nom: string) => JSON.parse(readFileSync(new URL(`../fixtures/${nom}`, import.meta.url), 'utf8'));
const ARTICLE = fixture('article-complet.json');
const IMAGES: Record<string, Image> = fixture('article-complet-media.json').images;
const DIST = new URL('../../dist', import.meta.url).pathname;
const CHEMIN = `/blog/${ARTICLE.slug}`;
const REGLES = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];
/** Budget d’images d’une page (AGENTS.md, « Budgets ») : 1,5 Mo. */
const BUDGET_IMAGES = 1.5 * 1024 * 1024;
const MEDIA = Object.fromEntries(Object.entries(IMAGES).map(([id, { width, height, variants }]) => [`/api/blog/media/${id}`, { width, height, variants }]));

/** Les nœuds d’un type dans l’article de test. */
function compter(type: string, node: Noeud = ARTICLE.content): number {
  return (node.type === type ? 1 : 0) + (node.content ?? []).reduce((total, enfant) => total + compter(type, enfant), 0);
}

function dessin(largeur: number, hauteur: number, transparent = false) {
  const r = Math.min(largeur, hauteur) / 3;
  const trait = Math.max(4, Math.round(r / 12));
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${largeur}" height="${hauteur}">${transparent ? '' : '<rect width="100%" height="100%" fill="#1f3a5f"/>'}<circle cx="${largeur / 2}" cy="${hauteur / 2}" r="${r}" fill="none" stroke="#111111" stroke-width="${trait}"/></svg>`);
}

async function fichiers() {
  const sortie = new Map<string, { type: string; octets: Buffer }>();
  for (const [id, image] of Object.entries(IMAGES)) {
    const source = sharp(dessin(image.width, image.height, image.transparent));
    const encoder = (s: ReturnType<typeof sharp>) => (image.type === 'image/jpeg' ? s.jpeg({ quality: 80 }) : s.png());
    const original = image.lourd ? sharp(randomBytes(image.width * image.height * 3), { raw: { width: image.width, height: image.height, channels: 3 } }) : source.clone();
    sortie.set(id, { type: image.type, octets: await encoder(original).toBuffer() });
    for (const largeur of image.variants) {
      sortie.set(`${id}/${largeur}`, { type: image.type, octets: await encoder(source.clone().resize({ width: largeur })).toBuffer() });
    }
  }
  return sortie;
}

let backend: Server;
let site: Server;
let base = '';
let octets: Map<string, { type: string; octets: Buffer }>;
let publie: Record<string, unknown>;

test.beforeAll(async () => {
  octets = await fichiers();
  publie = { id: 1, ...ARTICLE, status: 'published', published_at: 1791468000, scheduled_at: null, created_at: '2026-10-08T12:00:00Z', updated_at: '2026-10-08T12:00:00Z', revision: 2, has_unpublished_changes: false, scheduled_revision: null, media: MEDIA };
  const { content: _contenu, ...resume } = publie;
  // Après la vedette, deux rangées de la grille : sans puis avec couverture, et l’inverse.
  const carte = (id: number, slug: string, couverture: string | null) => ({ ...resume, id, slug, title: `Carte ${slug}`, excerpt: 'Un résumé de deux lignes environ, pour la grille de la liste.', cover_image: couverture, cover_alt: couverture ? 'Une couverture' : '', media: couverture ? { [couverture]: MEDIA[couverture] } : {} });
  const liste = [resume, carte(2, 'sans-a', null), carte(3, 'avec-a', '/api/blog/media/1'), carte(4, 'avec-b', '/api/blog/media/6'), carte(5, 'sans-b', null)];
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
    if (url.startsWith('/api/blog/posts?')) { res.end(JSON.stringify({ posts: liste, total: liste.length, limit: 20, offset: 0 })); return; }
    if (url === `/api/blog/posts/${ARTICLE.slug}`) { res.end(JSON.stringify(publie)); return; }
    res.writeHead(404);
    res.end('{}');
  });
  await new Promise<void>((resolve) => backend.listen(0, '127.0.0.1', resolve));
  // Options passées par variable : le type que TypeScript déduit de server.mjs omet `dossier`.
  const options = { dossier: DIST, env: { HOST: '127.0.0.1', CONTACT_EMAIL: 'e2e-contact@example.test', BACKEND_URL: `http://127.0.0.1:${(backend.address() as AddressInfo).port}` } };
  site = creerServeur(options);
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

/**
 * Les éléments du texte qui dépassent l’écran ou sont rognés, hors des régions
 * qui défilent et des troncatures voulues (points de suspension du fil d’Ariane).
 */
function debordements(page: Page, selecteur: string) {
  return page.evaluate((cible) => {
    const largeur = document.documentElement.clientWidth;
    return [...document.querySelectorAll<HTMLElement>(cible)]
      .filter((el) => !el.closest('.blog-table, pre'))
      .filter((el) => { const boite = el.getBoundingClientRect(); return boite.width > 0 && (boite.right > largeur + 0.5 || boite.left < -0.5 || (el.scrollWidth > el.clientWidth + 1 && !['visible', 'hidden'].includes(getComputedStyle(el).overflowX)) || (el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).overflowX === 'hidden' && getComputedStyle(el).textOverflow !== 'ellipsis')); })
      .map((el) => `${el.tagName.toLowerCase()} « ${(el.textContent ?? '').trim().slice(0, 40)} »`);
  }, selecteur);
}

test('le texte de l’auteur reste dans l’écran : titre, étiquettes, carte de la liste', async ({ page }) => {
  for (const chemin of [CHEMIN, '/blog']) {
    await ouvrir(page, chemin);
    expect(await debordements(page, '.blog-article__header *, .blog-list *'), chemin).toEqual([]);
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
  // Une région qui défile le montre sans JavaScript : ombres fixes, voiles qui défilent.
  for (const region of [page.locator('.blog-table').first(), page.locator('.blog-prose pre').first()]) {
    expect(await region.evaluate((el) => getComputedStyle(el).backgroundAttachment)).toMatch(/local.*scroll/);
  }
});

test('un tableau aux colonnes inégales garde des rangées de quelques lignes', async ({ page }) => {
  await ouvrir(page);
  const rangees = await page.locator('.blog-table').nth(1).evaluate((region) => [...region.querySelectorAll('tr')].map((rangee) => {
    const cellule = rangee.querySelector('td, th')!;
    const style = getComputedStyle(cellule);
    const interieur = rangee.getBoundingClientRect().height - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
    return Math.round(interieur / parseFloat(style.lineHeight));
  }));
  expect(rangees.length).toBe(2);
  for (const lignes of rangees) expect(lignes, 'lignes de la rangée la plus haute').toBeLessThanOrEqual(4);
  // Sur écran étroit, le tableau prend sa largeur naturelle : une colonne courte reste étroite.
  if ((page.viewportSize()?.width ?? 0) <= 860) {
    const courte = await page.locator('.blog-table').nth(1).locator('td', { hasText: 'oui' }).evaluate((cellule) => cellule.getBoundingClientRect().width);
    expect(courte, 'une colonne courte reste étroite').toBeLessThan(112);
  }
});

test('les cellules et les paragraphes gardent l’alignement choisi par l’auteur', async ({ page }) => {
  await ouvrir(page);
  const alignements = await page.locator('.blog-table').nth(1).evaluate((region) => [...region.querySelectorAll('[class*="blog-align-"]')].map((cellule) => [cellule.className, getComputedStyle(cellule).textAlign]));
  expect(alignements.length).toBe(6);
  for (const [classe, valeur] of alignements) expect(valeur, classe).toBe(classe.replace('blog-align-', ''));
  const blocs = await page.locator('.blog-prose > :is(p, h2, h3, h4)[class*="blog-align-"]').evaluateAll((liste) => liste.map((el) => [el.className, getComputedStyle(el).textAlign, el.tagName]));
  expect(blocs.length).toBeGreaterThanOrEqual(5);
  // Un titre ne se justifie pas : le justifié y revient au début de ligne.
  for (const [classe, valeur, balise] of blocs) expect(valeur, classe).toBe(/^H/.test(balise) && classe === 'blog-align-justify' ? 'start' : classe.replace('blog-align-', ''));
});

test('chaque ancre de l’article mène à son titre', async ({ page }) => {
  await ouvrir(page);
  const ancres = await page.locator('.blog-prose a[href^="#"]').evaluateAll((liens) => liens.map((lien) => lien.getAttribute('href')!.slice(1)));
  expect(ancres.length).toBeGreaterThanOrEqual(3);
  for (const ancre of ancres) {
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.locator(`.blog-prose a[href="#${ancre}"]`).first().click();
    await expect(page).toHaveURL(new RegExp(`#${ancre}$`));
    const titre = page.locator(`[id="${ancre}"]`);
    await expect(titre, ancre).toHaveCount(1);
    await expect(titre, ancre).toBeInViewport();
  }
});

test('chaque tableau et chaque bloc de code s’atteint à la tabulation et défile au clavier', async ({ page }) => {
  await ouvrir(page);
  const regions = page.locator('.blog-table, .blog-prose pre');
  await expect(regions).toHaveCount(compter('table') + compter('codeBlock'));
  // Tout le parcours au clavier : chaque région y passe, avec un contour visible.
  const atteintes = new Set<string>();
  await page.locator('body').focus();
  for (let n = 0; n < 400 && atteintes.size < (await regions.count()); n += 1) {
    await page.keyboard.press('Tab');
    const region = await page.evaluate(() => {
      const actif = document.activeElement as HTMLElement | null;
      if (!actif?.matches('.blog-table, .blog-prose pre')) return null;
      return { nom: actif.getAttribute('aria-label') ?? '', contour: getComputedStyle(actif).outlineStyle };
    });
    if (region) {
      expect(region.contour, region.nom).not.toBe('none');
      atteintes.add(region.nom);
    }
  }
  expect([...atteintes].sort()).toEqual((await regions.evaluateAll((liste) => liste.map((el) => el.getAttribute('aria-label') ?? ''))).sort());
  for (const region of await regions.all()) {
    if (!(await region.evaluate((el) => el.scrollWidth > el.clientWidth))) continue;
    await region.focus();
    const avant = await region.evaluate((el) => el.scrollLeft);
    await page.keyboard.press('ArrowRight');
    await expect.poll(() => region.evaluate((el) => el.scrollLeft), (await region.getAttribute('aria-label')) ?? '').toBeGreaterThan(avant);
  }
});

test('les paragraphes restent séparés dans les listes, les citations et les cellules', async ({ page }) => {
  await ouvrir(page);
  const ecarts = await page.evaluate(() => ['li > p + p', 'blockquote > p + p', 'td > p + p', 'blockquote > h3 + p'].map((selecteur) => {
    const el = document.querySelector(`.blog-prose ${selecteur}`);
    return [selecteur, el ? parseFloat(getComputedStyle(el).marginTop) : -1] as const;
  }));
  for (const [selecteur, ecart] of ecarts) expect(ecart, selecteur).toBeGreaterThan(0);
  const debut = await page.locator('.blog-prose td > ul:first-child').evaluate((liste) => parseFloat(getComputedStyle(liste).marginTop));
  expect(debut, 'une liste en tête de cellule commence avec la cellule').toBe(0);
  const titre = await page.locator('.blog-prose blockquote h3').evaluate((el) => [getComputedStyle(el).fontStyle, getComputedStyle(el.nextElementSibling!).fontStyle]);
  expect(titre[0], 'un titre cité se distingue du texte cité').not.toBe(titre[1]);
});

test('le code garde la taille de son bloc, et celle de son titre sans le dépasser', async ({ page }) => {
  await ouvrir(page);
  const tailles = await page.evaluate(() => {
    const taille = (selecteur: string) => parseFloat(getComputedStyle(document.querySelector(selecteur)!).fontSize);
    const code = document.querySelector('.blog-prose h2 code')!;
    return { pre: taille('.blog-prose pre'), codeDuBloc: taille('.blog-prose pre code'), titre: taille('.blog-prose h2:has(code)'), codeDuTitre: taille('.blog-prose h2 code'), interligne: parseFloat(getComputedStyle(code.closest('h2')!).lineHeight), pastille: code.getBoundingClientRect().height };
  });
  expect(tailles.codeDuBloc).toBe(tailles.pre);
  expect(tailles.codeDuTitre / tailles.titre, 'le code suit le titre, en retrait').toBeGreaterThanOrEqual(0.7);
  expect(tailles.codeDuTitre / tailles.titre).toBeLessThanOrEqual(0.9);
  expect(tailles.pastille, 'sa pastille tient dans l’interligne').toBeLessThanOrEqual(tailles.interligne);
});

test('le fil d’Ariane de l’article garde des cibles de 44 px et des séparateurs hors du lien souligné', async ({ page }) => {
  await ouvrir(page);
  const liens = await page.locator('.blog-article__nav a').evaluateAll((liste) => liste.map((lien) => ({ hauteur: lien.getBoundingClientRect().height, display: getComputedStyle(lien).display, separateur: getComputedStyle(lien, '::before').display })));
  expect(liens).toHaveLength(2);
  for (const lien of liens) {
    expect(lien.hauteur).toBeGreaterThanOrEqual(44);
    // Un lien en flex ferait de son séparateur un élément souligné avec lui.
    expect(lien.display).not.toMatch(/flex/);
  }
  expect(liens[1].separateur, 'le séparateur reste un élément atomique').toBe('inline-block');
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
  expect(images).toHaveLength(compter('image') + 1);
  for (const image of images) {
    expect(image.attributs.every(Boolean), image.source).toBe(true);
    expect(Math.abs(image.rendu[0] / image.rendu[1] - image.naturel[0] / image.naturel[1]), `${image.source} garde ses proportions`).toBeLessThan(0.02);
    expect(image.rendu[1], image.source).toBeLessThanOrEqual(800.5);
    expect(image.naturel[0], `${image.source} : jamais plus de 1 600 px servis`).toBeLessThanOrEqual(1600);
  }
  expect(images.find((image) => image.source.startsWith('/api/blog/media/1'))?.source, 'la variante de 960 px suffit aux deux largeurs').toBe('/api/blog/media/1/960');
  const petites = images.filter((image) => image.source === '/api/blog/media/3');
  expect(petites.map((image) => Math.round(image.rendu[0])), 'une petite image n’est jamais agrandie').toEqual([320, 160, 320]);
  expect(await page.evaluate(() => (window as unknown as { decalage: number }).decalage)).toBeLessThan(0.02);
  await expect(page.locator('.blog-article__cover')).toHaveAttribute('fetchpriority', 'high');
});

for (const javaScript of [true, false]) {
  test(`les images de l’article tiennent dans le budget de la page (${javaScript ? 'avec' : 'sans'} JavaScript)`, async ({ browser }, testInfo) => {
    const { viewport, deviceScaleFactor, isMobile, hasTouch, userAgent } = testInfo.project.use;
    const contexte = await browser.newContext({ viewport, deviceScaleFactor, isMobile, hasTouch, userAgent, javaScriptEnabled: javaScript, reducedMotion: 'reduce' });
    const page = await contexte.newPage();
    const tailles: Promise<number>[] = [];
    page.on('response', (reponse) => { if (reponse.request().resourceType() === 'image') tailles.push(reponse.body().then((corps) => corps.length, () => 0)); });
    await page.goto(base + CHEMIN);
    // Sans JavaScript, la page se parcourt à la molette : les images différées arrivent aussi.
    for (let n = 0; n < 40; n += 1) await page.mouse.wheel(0, 800);
    await page.waitForLoadState('networkidle');
    const total = (await Promise.all(tailles)).reduce((somme, taille) => somme + taille, 0);
    expect(tailles.length).toBeGreaterThanOrEqual(compter('image'));
    expect(total, `${Math.round(total / 1024)} Kio d’images`).toBeLessThanOrEqual(BUDGET_IMAGES);
    await contexte.close();
  });
}

test('la vignette de la liste reste recadrée en 16:9, quelles que soient les dimensions de l’image', async ({ page }) => {
  await ouvrir(page, '/blog');
  const vignette = page.locator('.blog-list__article img').first();
  await expect(vignette).toHaveAttribute('height', '1400');
  const [largeur, hauteur] = await vignette.evaluate((img) => [img.getBoundingClientRect().width, img.getBoundingClientRect().height]);
  expect(largeur / hauteur).toBeCloseTo(16 / 9, 1);
});

/**
 * L’atelier du blog sur le même article : la session et l’API privée sont
 * doublées dans le navigateur, et ses images privées servent les mêmes octets
 * que les publiques.
 */
async function ouvrirAtelier(page: Page, page_: 'redaction' | 'medias') {
  await page.context().route('**/api/backoffice/**', async (route) => {
    const chemin = new URL(route.request().url()).pathname.replace('/api/backoffice', '');
    const image = /^\/blog\/media\/(\d+)$/.exec(chemin);
    if (image) {
      const fichier = octets.get(image[1]);
      await (fichier ? route.fulfill({ contentType: fichier.type, body: fichier.octets }) : route.fulfill({ status: 404, body: '{}' }));
      return;
    }
    const json = (valeur: unknown) => route.fulfill({ contentType: 'application/json', body: JSON.stringify(valeur) });
    if (chemin === '/session') { await json({ authenticated: true, smtp_configured: true }); return; }
    if (chemin === '/settings') { await json({ email: 'e2e-contact@example.test' }); return; }
    if (chemin === '/contacts') { await json({ contacts: [], total: 0, new_count: 0 }); return; }
    if (chemin === '/links') { await json({ links: [] }); return; }
    if (chemin === '/tokens') { await json({ tokens: [] }); return; }
    if (chemin === '/blog/media') { await json({ media: [], offset: 0, limit: 100 }); return; }
    if (chemin === '/blog/posts') { await json({ posts: [], total: 0, offset: 0, limit: 20 }); return; }
    if (chemin === '/blog/posts/1') { await json(publie); return; }
    await route.fulfill({ status: 404, contentType: 'application/json', body: '{}' });
  });
  const reponse = await page.goto(`${base}/backoffice/blog/${page_}?id=1`);
  expect(reponse?.status()).toBe(200);
}

/** Les images chargées d’une zone : source (sans origine ni préfixe privé), boîte et fond. */
function boites(page: Page, selecteur: string) {
  return page.locator(selecteur).evaluateAll((liste) => (liste as HTMLImageElement[]).map((img) => ({
    source: img.src.replace(location.origin, '').replace('/api/backoffice/', '/api/'),
    boite: [Math.round(img.getBoundingClientRect().width), Math.round(img.getBoundingClientRect().height)],
    gauche: Math.round(img.getBoundingClientRect().left - img.closest('figure')!.getBoundingClientRect().left),
    colonne: img.closest('figure')!.clientWidth,
  })));
}

test('la rédaction montre les images à la taille de l’article publié', async ({ page }) => {
  await ouvrir(page);
  const publiques = (await boites(page, '.blog-prose figure img')).filter((image) => image.source === '/api/blog/media/3');
  expect(publiques.map((image) => image.boite)).toEqual([[320, 200], [160, 100], [320, 200]]);
  expect(publiques.map((image) => image.gauche)).toEqual([0, 0, 0]);
  await ouvrirAtelier(page, 'redaction');
  const figures = page.locator('.blog-editor-content figure img');
  await expect(figures).toHaveCount(compter('image'));
  await expect.poll(() => figures.evaluateAll((liste) => (liste as HTMLImageElement[]).every((img) => img.complete && img.naturalWidth > 0))).toBe(true);
  const atelier = (await boites(page, '.blog-editor-content figure img')).filter((image) => image.source === '/api/blog/media/3');
  // La feuille de rédaction peut être plus étroite que la colonne de l’article (390 px) :
  // l’image y tient alors, sans changer de proportions, jamais agrandie.
  const attendu = publiques.map(({ boite: [largeur, hauteur] }, rang) => {
    const echelle = Math.min(1, atelier[rang]?.colonne / largeur);
    return [Math.round(largeur * echelle), Math.round(hauteur * echelle)];
  });
  expect(atelier.map((image) => image.boite), 'même taille qu’en public, au plus la feuille').toEqual(attendu);
  expect(atelier.map((image) => image.gauche), 'alignées à gauche, comme en public').toEqual([0, 0, 0]);
});

test('l’aperçu de couverture recadre l’image en 16:9, comme la liste du blog', async ({ page }) => {
  await ouvrirAtelier(page, 'medias');
  const apercu = page.locator('#blog-cover-preview');
  await expect(apercu).toBeVisible();
  await expect.poll(() => apercu.evaluate((img) => (img as HTMLImageElement).complete && (img as HTMLImageElement).naturalWidth > 0)).toBe(true);
  const { image, scene } = await apercu.evaluate((img) => {
    const boite = (el: Element) => { const r = el.getBoundingClientRect(); return { haut: r.top, bas: r.bottom, largeur: r.width, hauteur: r.height }; };
    return { image: boite(img), scene: boite(img.closest('.blog-cover-stage')!) };
  });
  expect(image.largeur / image.hauteur).toBeCloseTo(16 / 9, 1);
  expect(image.bas, 'l’image tient dans sa scène : rien n’est rogné en bas').toBeLessThanOrEqual(scene.bas + 1);
  await expect(apercu).toHaveCSS('object-fit', 'cover');
  await expect(apercu).toHaveCSS('object-position', '50% 50%');
});

test('dans la grille de la liste, deux cartes voisines alignent leur date, avec ou sans couverture', async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 0) <= 860, 'une seule colonne sous 861 px');
  await ouvrir(page, '/blog');
  const cartes = await page.locator('.blog-list__article:not(:first-child)').evaluateAll((liste) => liste.map((carte) => ({
    date: Math.round(carte.querySelector('.blog-meta')!.getBoundingClientRect().top),
    image: carte.querySelector('img') ? Math.round(carte.querySelector('img')!.getBoundingClientRect().bottom) : null,
    retrait: Math.round(carte.querySelector('.blog-meta')!.getBoundingClientRect().left - carte.getBoundingClientRect().left),
  })));
  expect(cartes).toHaveLength(4);
  for (const carte of cartes) expect(carte.retrait, 'le texte part du bord de sa case').toBe(0);
  for (const [gauche, droite] of [[cartes[0], cartes[1]], [cartes[2], cartes[3]]]) {
    expect(gauche.date, 'même ligne de départ pour la date et le titre').toBe(droite.date);
    // L’image d’une carte se lit au-dessus de son propre texte, jamais au-dessus du titre voisin seul.
    for (const image of [gauche.image, droite.image]) if (image !== null) expect(image).toBeLessThan(gauche.date);
  }
});

test('sans JavaScript, l’article est complet', async ({ browser }) => {
  const contexte = await browser.newContext({ javaScriptEnabled: false });
  const page = await contexte.newPage();
  await page.goto(base + CHEMIN);
  await expect(page.locator('.blog-article h1')).toContainText('extraordinairementlong');
  await expect(page.locator('.blog-prose table')).toHaveCount(compter('table'));
  await expect(page.locator('.blog-prose pre')).toHaveCount(compter('codeBlock'));
  await expect(page.locator('.blog-prose figure img')).toHaveCount(compter('image'));
  await expect(page.locator('.blog-prose :is(h2, h3, h4)')).toHaveCount(compter('heading'));
  await contexte.close();
});

for (const theme of ['jour', 'nuit'] as const) {
  test.describe(`thème ${theme}`, () => {
    test.use({ colorScheme: theme === 'nuit' ? 'dark' : 'light' });

    test(`axe : l’article publié, sans erreur de console ni de CSP (${theme})`, async ({ page }) => {
      const problemes = surveillerConsole(page);
      await page.addInitScript(() => {
        const csp: string[] = [];
        (window as unknown as { csp: string[] }).csp = csp;
        document.addEventListener('securitypolicyviolation', (evenement) => csp.push(`${evenement.violatedDirective} ${evenement.blockedURI}`));
      });
      await ouvrir(page);
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      const resultats = await new AxeBuilder({ page }).withTags(REGLES).analyze();
      expect(resultats.violations.map((v) => ({ regle: v.id, cibles: v.nodes.slice(0, 3).map((n) => n.target.join(' ')) }))).toEqual([]);
      expect(await page.evaluate(() => (window as unknown as { csp: string[] }).csp)).toEqual([]);
      expect(problemes).toEqual([]);
    });

    test(`aucun élément de l’article ne déborde de l’écran (${theme})`, async ({ page }) => {
      await ouvrir(page);
      expect(await debordements(page, '.blog-article *')).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    });

    test(`une image transparente garde une plaque claire (${theme})`, async ({ page }) => {
      await ouvrir(page);
      const fond = await page.locator('.blog-prose figure img[src*="/api/blog/media/4"]').evaluate((img) => getComputedStyle(img).backgroundColor);
      const [r, g, b, a = 1] = (fond.match(/[\d.]+/g) ?? []).map(Number);
      expect(a, fond).toBe(1);
      expect((0.2126 * r + 0.7152 * g + 0.0722 * b) / 255, fond).toBeGreaterThan(0.8);
    });

    test(`dans la rédaction aussi, une image transparente garde une plaque claire (${theme})`, async ({ page }) => {
      await ouvrirAtelier(page, 'redaction');
      const image = page.locator('.blog-editor-content figure img[src$="/api/backoffice/blog/media/4"]');
      await expect(image).toBeVisible();
      const fond = await image.evaluate((img) => getComputedStyle(img).backgroundColor);
      const [r, g, b, a = 1] = (fond.match(/[\d.]+/g) ?? []).map(Number);
      expect(a, fond).toBe(1);
      expect((0.2126 * r + 0.7152 * g + 0.0722 * b) / 255, fond).toBeGreaterThan(0.8);
    });

    test(`à l’impression, le code et les tableaux ne sont pas rognés (${theme})`, async ({ page }) => {
      await ouvrir(page);
      await page.emulateMedia({ media: 'print' });
      const rognes = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>('.blog-prose pre, .blog-table')].filter((el) => el.scrollWidth > el.clientWidth + 1).map((el) => el.getAttribute('aria-label') ?? el.className));
      expect(rognes).toEqual([]);
      expect(await debordements(page, '.blog-article *'), 'rien ne sort de la page imprimée').toEqual([]);
      // Les mots se coupent par la césure, et une rangée ne se partage pas entre deux pages.
      const papier = await page.evaluate(() => ({ cellule: getComputedStyle(document.querySelector('.blog-prose td')!).hyphens, rangee: getComputedStyle(document.querySelector('.blog-prose tr')!).breakInside }));
      expect(papier).toEqual({ cellule: 'auto', rangee: 'avoid' });
    });
  });
}
