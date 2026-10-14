import { expect, test, type Page } from '@playwright/test';
import { visuelParId } from '../../src/config/visuels';

/**
 * Les deux rendus d’une image générée (components/ui/Visuel.astro), sur une
 * page réelle : le triptyque de l’équipe de PvZ Fusion (PVZ-02a, chargé à la
 * demande). Le jour par défaut ; la nuit sous `data-theme='nuit'` (la
 * lanterne), sous `prefers-color-scheme: dark` sans JavaScript, et dans un
 * acte sombre (PVZ-04) ; le jour à l’impression. La version masquée n’est ni
 * affichée, ni lue, ni téléchargée : avec JavaScript par le chargement
 * différé, même quand la page demande un chargement immédiat ; sans, par une
 * source neutre (`(scripting: none)`). À la bascule, le rendu visé est chargé
 * et décodé avant que la nouvelle vue s’affiche (scripts/theme.ts).
 */

const PAGE = '/projets/pvz-fusion';
const ID = 'PVZ-02a';
const ALT = visuelParId(ID)!.alt;
/** Les fichiers servis par Astro : `/_astro/PVZ-02a_1200x900.<empreinte>.avif`, `.nuit.<empreinte>.avif` pour la nuit. */
const estJour = (url: string) => /\/PVZ-02a_1200x900\.(?!nuit\.)[^/]+$/.test(url);
const estNuit = (url: string) => /\/PVZ-02a_1200x900\.nuit\.[^/]+$/.test(url);

function suivreImages(page: Page): string[] {
  const urls: string[] = [];
  page.on('request', (requete) => {
    if (requete.resourceType() === 'image') urls.push(requete.url());
  });
  return urls;
}

function rendus(page: Page, id = ID) {
  const figure = page.locator(`figure[data-visuel="${id}"]`);
  return { figure, jour: figure.locator('picture.visuel__jour img'), nuit: figure.locator('picture.visuel__nuit img') };
}

const charge = (image: ReturnType<typeof rendus>['jour']) => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 1);

/** Le rendu d’une image d’Astro : `/_astro/<ID>_<l>x<h>.<empreinte>.<format>`, `.nuit.` pour la nuit. */
const rendu = (id: string, version: 'jour' | 'nuit') => (url: string) =>
  version === 'nuit' ? new RegExp(`/${id}_\\d+x\\d+\\.nuit\\.[^/]+$`).test(url) : new RegExp(`/${id}_\\d+x\\d+\\.(?!nuit\\.)[^/]+$`).test(url);

/** Un réseau lent, émulé par Chromium. */
async function ralentir(page: Page, latence: number, debit: number) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: latence, downloadThroughput: debit, uploadThroughput: debit });
}

/**
 * Relève, à chaque image animée jusqu’à la fin de la bascule, si l’image
 * affichée de la figure est chargée : jamais de cadre vide à l’écran.
 */
async function releverPendantBascule(figure: ReturnType<typeof rendus>['figure']) {
  await figure.evaluate((element) => {
    const releves: boolean[] = [];
    (window as unknown as { releves: boolean[] }).releves = releves;
    const relever = () => {
      const affichee = [...element.querySelectorAll('picture')].find((p) => getComputedStyle(p).display !== 'none')?.querySelector('img');
      releves.push(Boolean(affichee && affichee.complete && affichee.naturalWidth > 1));
      if (document.documentElement.hasAttribute('data-transition-theme') || releves.length < 30) requestAnimationFrame(relever);
    };
    relever();
  });
}

test('le jour : la version de jour s’affiche, seule lue et seule téléchargée ; un acte sombre garde la nuit', async ({ page }) => {
  const urls = suivreImages(page);
  await page.goto(PAGE);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'jour');
  const { figure, jour, nuit } = rendus(page);
  await figure.scrollIntoViewIfNeeded();
  await expect(jour).toBeVisible();
  await expect(nuit).toBeHidden();
  await expect.poll(() => charge(jour)).toBe(true);
  // Une seule image pour les lecteurs d’écran, avec l’alt du registre.
  await expect(figure.getByRole('img')).toHaveCount(1);
  await expect(figure.getByRole('img', { name: ALT, exact: true })).toBeVisible();
  await page.waitForLoadState('networkidle');
  expect(urls.filter(estJour).length).toBeGreaterThan(0);
  expect(urls.filter(estNuit), 'la nuit masquée, chargée à la demande, ne part pas sur le réseau').toEqual([]);

  // L’acte de veille est la nuit dans le jour : la gravure y prend sa version de nuit.
  const veille = rendus(page, 'PVZ-04');
  await veille.figure.scrollIntoViewIfNeeded();
  await expect(veille.nuit).toBeVisible();
  await expect(veille.jour).toBeHidden();
});

test('la nuit choisie à la lanterne : la version de nuit prend la place, sans double image pendant l’allumage', async ({ page }) => {
  const urls = suivreImages(page);
  await page.goto(PAGE);
  const { figure, jour, nuit } = rendus(page);
  await figure.scrollIntoViewIfNeeded();
  await expect.poll(() => charge(jour)).toBe(true);

  // Pendant toute la bascule, une seule des deux versions est affichée.
  await figure.evaluate((element) => {
    const releves: number[] = [];
    (window as unknown as { releves: number[] }).releves = releves;
    const relever = () => {
      releves.push([...element.querySelectorAll('picture')].filter((p) => getComputedStyle(p).display !== 'none').length);
      if (releves.length < 600) requestAnimationFrame(relever);
    };
    relever();
  });
  await page.locator('[data-theme-bascule]:visible').first().click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'nuit');
  await expect(page.locator('html')).not.toHaveAttribute('data-transition-theme', /.+/, { timeout: 4_000 });
  const releves = await page.evaluate(() => (window as unknown as { releves: number[] }).releves);
  expect(releves.length).toBeGreaterThan(5);
  expect(new Set(releves)).toEqual(new Set([1]));

  await expect(nuit).toBeVisible();
  await expect(jour).toBeHidden();
  await expect.poll(() => charge(nuit)).toBe(true);
  await expect(figure.getByRole('img')).toHaveCount(1);
  await expect(figure.getByRole('img', { name: ALT, exact: true })).toBeVisible();
  expect(urls.filter(estNuit).length).toBeGreaterThan(0);

  // L’impression repasse au jour, quel que soit le thème.
  await page.emulateMedia({ media: 'print' });
  await expect(jour).toBeVisible();
  await expect(nuit).toBeHidden();
});

test.describe('nuit du système', () => {
  test.use({ colorScheme: 'dark' });

  test('avec JavaScript : la nuit d’emblée, le jour jamais téléchargé', async ({ page }) => {
    const urls = suivreImages(page);
    await page.goto(PAGE);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'nuit');
    const { figure, jour, nuit } = rendus(page);
    await figure.scrollIntoViewIfNeeded();
    await expect(nuit).toBeVisible();
    await expect(jour).toBeHidden();
    await expect.poll(() => charge(nuit)).toBe(true);
    await page.waitForLoadState('networkidle');
    expect(urls.filter(estJour), 'le jour masqué, chargé à la demande, ne part pas sur le réseau').toEqual([]);
  });

  test.describe('sans JavaScript', () => {
    test.use({ javaScriptEnabled: false });

    // Sans script, le navigateur ignore `loading="lazy"` (spécification HTML) : toute image de
    // la page part au chargement, les deux versions comprises. Reste à n’en montrer qu’une.
    test('prefers-color-scheme décide : la nuit affichée et seule lue, le jour à l’impression', async ({ page }) => {
      const urls = suivreImages(page);
      await page.goto(PAGE, { waitUntil: 'networkidle' });
      await expect(page.locator('html')).not.toHaveAttribute('data-theme', /.+/);
      const { figure, jour, nuit } = rendus(page);
      await figure.scrollIntoViewIfNeeded();
      await expect(nuit).toBeVisible();
      await expect(jour).toBeHidden();
      await expect(figure.getByRole('img')).toHaveCount(1);
      await expect(figure.getByRole('img', { name: ALT, exact: true })).toBeVisible();
      expect(urls.filter(estNuit).length).toBeGreaterThan(0);
      // La source neutre du jour (`(scripting: none) and (prefers-color-scheme: dark)`) : rien ne part.
      expect(urls.filter(estJour), 'le jour masqué ne part pas, même sans chargement différé').toEqual([]);

      await page.emulateMedia({ media: 'print' });
      await expect(jour).toBeVisible();
      await expect(nuit).toBeHidden();
    });
  });
});

test.describe('jour du système, sans JavaScript', () => {
  test.use({ javaScriptEnabled: false, colorScheme: 'light' });

  test('le jour affiché, seul lu et seul téléchargé', async ({ page }) => {
    const urls = suivreImages(page);
    await page.goto(PAGE, { waitUntil: 'networkidle' });
    const { figure, jour, nuit } = rendus(page);
    await figure.scrollIntoViewIfNeeded();
    await expect(jour).toBeVisible();
    await expect(nuit).toBeHidden();
    await expect(figure.getByRole('img')).toHaveCount(1);
    await expect.poll(() => charge(jour)).toBe(true);
    expect(urls.filter(estNuit), 'la nuit masquée ne part pas, même sans chargement différé').toEqual([]);
  });

  test('un acte sombre ne télécharge que sa nuit, et une image masquée sous 860 px rien sur mobile', async ({ page }) => {
    const urls = suivreImages(page);
    await page.goto(PAGE, { waitUntil: 'networkidle' });
    expect(urls.filter(rendu('PVZ-04', 'nuit')).length).toBeGreaterThan(0);
    expect(urls.filter(rendu('PVZ-04', 'jour'))).toEqual([]);
    await page.goto('/projets/gup', { waitUntil: 'networkidle' });
    const mobile = (page.viewportSize()?.width ?? 1440) <= 860;
    if (mobile) expect(urls.filter(rendu('GUP-01', 'jour')), 'GUP-01, masquée sous 860 px').toEqual([]);
    else expect(urls.filter(rendu('GUP-01', 'jour')).length).toBeGreaterThan(0);
    expect(urls.filter(rendu('GUP-01', 'nuit'))).toEqual([]);
  });
});

test.describe('chargement demandé immédiat', () => {
  // La page demande loading="eager" : la version affichée part avec une priorité haute, la version masquée jamais.
  for (const [chemin, id, theme] of [
    ['/parcours/formation', 'FOR-01', 'light'],
    ['/parcours/formation', 'FOR-01', 'dark'],
    ['/projets/omnicard', 'OMN-01', 'light'],
    ['/page-absente', 'ERR-01', 'dark'],
  ] as const) {
    test(`${id} (${theme === 'dark' ? 'nuit' : 'jour'}) : seule la version affichée est téléchargée`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: theme });
      const urls = suivreImages(page);
      await page.goto(chemin);
      const { figure, jour, nuit } = rendus(page, id);
      const affichee = theme === 'dark' ? nuit : jour;
      await figure.scrollIntoViewIfNeeded();
      await expect.poll(() => charge(affichee)).toBe(true);
      await expect(affichee).toHaveAttribute('fetchpriority', 'high');
      await page.waitForLoadState('networkidle');
      const masquee = theme === 'dark' ? 'jour' : 'nuit';
      expect(urls.filter(rendu(id, masquee)), `${id} : la version de ${masquee} ne part pas`).toEqual([]);
    });
  }

  test('un acte sombre ne télécharge jamais le jour à l’écran (PRJ-01, vitrine)', async ({ page }) => {
    const urls = suivreImages(page);
    await page.goto('/projets');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'jour');
    const { nuit } = rendus(page, 'PRJ-01');
    await expect.poll(() => charge(nuit)).toBe(true);
    await page.waitForLoadState('networkidle');
    expect(urls.filter(rendu('PRJ-01', 'jour'))).toEqual([]);
  });
});

test.describe('bascule sur un réseau lent', () => {
  test('survoler la lanterne charge le rendu visé ; la bascule ne montre jamais de cadre vide', async ({ page, isMobile }) => {
    test.skip(isMobile, 'le survol est un geste de souris');
    await page.goto(PAGE);
    const { figure, jour, nuit } = rendus(page);
    await figure.scrollIntoViewIfNeeded();
    await expect.poll(() => charge(jour)).toBe(true);
    await ralentir(page, 300, 50 * 1024);
    const bascule = page.locator('[data-theme-bascule]:visible').first();
    await bascule.hover();
    // La nuit, encore masquée, part sur le réseau dès le survol.
    await expect.poll(() => charge(nuit), { timeout: 10_000 }).toBe(true);
    await releverPendantBascule(figure);
    await bascule.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'nuit');
    await expect(page.locator('html')).not.toHaveAttribute('data-transition-theme', /.+/, { timeout: 4_000 });
    const releves = await page.evaluate(() => (window as unknown as { releves: boolean[] }).releves);
    expect(releves.length).toBeGreaterThan(5);
    expect(releves.filter((charge) => !charge).length, 'images animées où le cadre est vide').toBe(0);
  });

  test('sans survol, la bascule attend le rendu visé avant de montrer la nouvelle vue', async ({ page }) => {
    await page.goto(PAGE);
    const { figure, jour, nuit } = rendus(page);
    await figure.scrollIntoViewIfNeeded();
    await expect.poll(() => charge(jour)).toBe(true);
    await ralentir(page, 60, 2 * 1024 * 1024);
    await releverPendantBascule(figure);
    // Un clic sans survol ni focus préalables : seule l’attente de appliquer() charge la nuit.
    await page.locator('[data-theme-bascule]:visible').first().dispatchEvent('click');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'nuit');
    await expect(page.locator('html')).not.toHaveAttribute('data-transition-theme', /.+/, { timeout: 4_000 });
    await expect.poll(() => charge(nuit)).toBe(true);
    const releves = await page.evaluate(() => (window as unknown as { releves: boolean[] }).releves);
    expect(releves.filter((charge) => !charge).length, 'images animées où le cadre est vide').toBe(0);
  });
});

test('chaque image générée posée dans un acte sombre le déclare (acte), et seulement elle', async ({ page }) => {
  for (const chemin of ['/', '/projets', '/projets/pvz-fusion', '/projets/omnicard', '/parcours', '/parcours/professionnel', '/parcours/formation', '/contact']) {
    await page.goto(chemin);
    const ecarts = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>('figure.visuel--jour-nuit')]
        .filter((f) => Boolean(f.closest('.acte-veille, .acte-bleu')) !== f.hasAttribute('data-acte'))
        .map((f) => f.dataset.visuel),
    );
    expect(ecarts, chemin).toEqual([]);
  }
});

/**
 * Budget d’images : 1,5 Mo par page à 390 px, page entière parcourue, avec les deux versions des
 * gravures posées. Les pages les plus chargées en images, le jour ; l’accueil aussi la nuit.
 */
test.describe('poids des images à 390 px', () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) > 390, 'budget mesuré à 390 px');
  const BUDGET = 1.5 * 1024 * 1024;

  for (const [chemin, theme] of [['/', 'light'], ['/', 'dark'], ['/projets', 'light'], ['/projets/league-of-database', 'light'], ['/parcours/professionnel', 'light'], ['/parcours', 'dark']] as const) {
    test(`${chemin} (${theme === 'dark' ? 'nuit' : 'jour'}) : au plus 1,5 Mo d’images`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: theme });
      const poids = new Map<string, number>();
      page.on('response', async (reponse) => {
        if (reponse.request().resourceType() !== 'image') return;
        try {
          poids.set(reponse.url(), (await reponse.body()).length);
        } catch {
          // Réponse abandonnée (image hors écran annulée) : rien de téléchargé à compter.
        }
      });
      await page.goto(chemin);
      const hauteur = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y <= hauteur; y += 400) {
        await page.evaluate((position) => window.scrollTo(0, position), y);
        await page.waitForTimeout(30);
      }
      await page.waitForLoadState('networkidle');
      const total = [...poids.values()].reduce((a, b) => a + b, 0);
      expect(total, `${(total / 1024).toFixed(0)} Ko`).toBeLessThanOrEqual(BUDGET);
    });
  }
});

/**
 * Sans JavaScript, le navigateur ignore le chargement différé : toute image de
 * la page part d’emblée. Les sources neutres (versions masquées, vues
 * masquées par la largeur) tiennent le budget, en densité 3.
 */
test.describe('poids des images à 390 px, sans JavaScript', () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) > 390, 'budget mesuré à 390 px');
  test.use({ javaScriptEnabled: false, deviceScaleFactor: 3 });
  const BUDGET = 1.5 * 1024 * 1024;

  // /projets : sans JavaScript, les vignettes du volet replié des projets archivés partent aussi.
  for (const [chemin, theme] of [['/', 'light'], ['/', 'dark'], ['/projets', 'light'], ['/projets', 'dark'], ['/projets/league-of-database', 'light'], ['/projets/league-of-database', 'dark'], ['/parcours/professionnel', 'dark']] as const) {
    test(`${chemin} (${theme === 'dark' ? 'nuit' : 'jour'}) : au plus 1,5 Mo d’images`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: theme });
      const poids = new Map<string, number>();
      page.on('response', async (reponse) => {
        if (reponse.request().resourceType() !== 'image') return;
        try {
          poids.set(reponse.url(), (await reponse.body()).length);
        } catch {
          // Réponse abandonnée : rien de téléchargé à compter.
        }
      });
      await page.goto(chemin, { waitUntil: 'networkidle' });
      const total = [...poids.values()].reduce((a, b) => a + b, 0);
      expect(total, `${(total / 1024).toFixed(0)} Ko`).toBeLessThanOrEqual(BUDGET);
    });
  }
});
