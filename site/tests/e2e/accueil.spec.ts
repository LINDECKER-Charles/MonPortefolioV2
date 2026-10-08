import { expect, test } from '@playwright/test';
import { surveillerConsole } from './support/navigateur';

/**
 * L'accueil se lit de haut en bas : couverture, sommaire, cinq chapitres dans
 * l'ordre, un seul appel principal. Sans erreur de console (une violation de
 * la CSP en serait une), sans défilement horizontal, à chaque largeur.
 */

const CHAPITRES = [
  ['origine', 'L’origine'],
  ['aujourdhui', 'Aujourd’hui'],
  ['preuves', 'Les preuves'],
  ['dehors', 'En dehors du code'],
  ['discutons', 'Discutons'],
] as const;

test('la couverture dit qui, quoi, et comment écrire', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Charles Lindecker, mode d’emploi');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Je maîtrise d’abord les règles du jeu. Ensuite, je les réinvente.',
  );
  await expect(page.getByRole('link', { name: 'Discutons' }).first()).toHaveAttribute('href', '#discutons');
  await expect(page.getByRole('banner').getByRole('link', { name: 'Contact', exact: true })).toHaveAttribute('href', '/contact');
  const photo = page.locator('#fig-0 img');
  await expect(photo).toHaveAttribute('alt', /Charles Lindecker/);
  expect(await photo.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
});

test('le sommaire annonce les cinq chapitres, dans l’ordre, et une durée de lecture', async ({ page }) => {
  await page.goto('/');
  const sommaire = page.getByRole('navigation', { name: 'Sommaire', exact: true });
  const liens = sommaire.getByRole('link');
  await expect(liens).toHaveCount(CHAPITRES.length);
  for (const [i, [id, titre]] of CHAPITRES.entries()) {
    await expect(liens.nth(i)).toHaveAttribute('href', `#${id}`);
    await expect(liens.nth(i)).toContainText(titre);
    await expect(page.locator(`section#${id} h2`)).toContainText(titre);
  }
  const duree = await sommaire.getByText(/Lecture complète/).textContent();
  const minutes = Number(duree?.match(/(\d+)\s*minutes/)?.[1]);
  expect(minutes).toBeGreaterThanOrEqual(4);
  expect(minutes).toBeLessThanOrEqual(12);
});

test('les figures dessinées se décrivent', async ({ page }) => {
  await page.goto('/');
  for (const figure of ['#fig-1']) {
    const svg = page.locator(`${figure} svg:visible`);
    await expect(svg).toHaveCount(1);
    await expect(svg).toHaveAttribute('role', 'img');
    expect((await svg.locator('desc').textContent())?.length).toBeGreaterThan(60);
  }
  const collectif = page.locator('#fig-2');
  await expect(collectif.locator('details, summary')).toHaveCount(0);
  await expect(collectif.getByRole('button', { name: /^Rejouer l’animation\s*:/ })).toHaveCount(3);
  await expect(collectif).toContainText('Accueillir');
  await expect(collectif).toContainText('Former');
  await expect(collectif).toContainText('Contribuer');
});

test('la page se parcourt sans erreur ni défilement horizontal', async ({ page }) => {
  const problemes = surveillerConsole(page);
  await page.goto('/');
  const hauteur = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < hauteur; y += 700) {
    await page.evaluate((position) => window.scrollTo({ top: position, behavior: 'instant' }), y);
    await page.waitForTimeout(30);
  }
  await page.waitForLoadState('networkidle');
  const debord = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(debord).toBeLessThanOrEqual(0);
  expect(problemes).toEqual([]);
});

test('le contact est à un clic depuis n’importe où dans la page', async ({ page }) => {
  await page.goto('/');
  await page.locator('#preuves').scrollIntoViewIfNeeded();
  await expect(page.getByRole('banner').getByRole('link', { name: 'Contact', exact: true })).toBeInViewport();
});

test('le lien d’évitement mène au contenu', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const evitement = page.getByRole('link', { name: 'Aller au contenu' });
  await expect(evitement).toBeFocused();
  await expect(evitement).toBeInViewport();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
});
