import { expect, test, type Page } from '@playwright/test';
import { visuelParId } from '../../src/config/visuels';

/**
 * Les deux rendus d’une image générée (components/ui/Visuel.astro), sur une
 * page réelle : le triptyque de l’équipe de PvZ Fusion (PVZ-02a, chargé à la
 * demande). Le jour par défaut ; la nuit sous `data-theme='nuit'` (la
 * lanterne), sous `prefers-color-scheme: dark` sans JavaScript, et dans un
 * acte sombre (PVZ-04) ; le jour à l’impression. La version masquée n’est ni
 * affichée, ni lue, ni téléchargée.
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

const charge = (image: ReturnType<typeof rendus>['jour']) => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0);

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

      await page.emulateMedia({ media: 'print' });
      await expect(jour).toBeVisible();
      await expect(nuit).toBeHidden();
    });
  });
});

test.describe('jour du système, sans JavaScript', () => {
  test.use({ javaScriptEnabled: false, colorScheme: 'light' });

  test('le jour affiché et seul lu', async ({ page }) => {
    await page.goto(PAGE, { waitUntil: 'networkidle' });
    const { figure, jour, nuit } = rendus(page);
    await figure.scrollIntoViewIfNeeded();
    await expect(jour).toBeVisible();
    await expect(nuit).toBeHidden();
    await expect(figure.getByRole('img')).toHaveCount(1);
  });
});

/**
 * Budget d’images : 1,5 Mo par page à 390 px, page entière parcourue, avec les deux versions des
 * gravures posées. Les pages les plus chargées en images, le jour ; l’accueil aussi la nuit.
 */
test.describe('poids des images à 390 px', () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) > 390, 'budget mesuré à 390 px');
  const BUDGET = 1.5 * 1024 * 1024;

  for (const [chemin, theme] of [['/', 'light'], ['/', 'dark'], ['/projets/league-of-database', 'light'], ['/parcours/professionnel', 'light']] as const) {
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
