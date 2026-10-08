import { expect, test, type Locator, type Page } from '@playwright/test';

test.use({ reducedMotion: 'no-preference' });

async function lireEtat(zone: Locator) {
  return zone.evaluate((element) => ({
    texte: element.textContent,
    hauteur: element.getBoundingClientRect().height,
  }));
}

async function verifierStabilite(zone: Locator, avant: Awaited<ReturnType<typeof lireEtat>>) {
  const apres = await lireEtat(zone);
  expect(apres.texte).toBe(avant.texte);
  expect(Math.abs(apres.hauteur - avant.hauteur)).toBeLessThanOrEqual(1);
}

/** Un vrai bouton rejoue le dessin ; aucune explication ne se déplie. */
async function rejouerDeuxFois(page: Page, zone: Locator, dessin: Locator, animation: string) {
  const bouton = zone.getByRole('button', { name: /^Rejouer l’animation\s*:/ });
  await expect(bouton).toHaveAttribute('data-rejouer', '');
  await expect(bouton).toHaveAttribute('type', 'button');
  await expect(zone.locator('details, summary')).toHaveCount(0);
  await bouton.scrollIntoViewIfNeeded();
  const avant = await lireEtat(zone);

  for (const touche of ['Enter', 'Space']) {
    await bouton.focus();
    await page.keyboard.press(touche);
    await expect(zone).toHaveClass(/animation-en-cours/);
    await expect(dessin).toHaveCSS('animation-name', animation);
    await verifierStabilite(zone, avant);
    await expect(zone).not.toHaveClass(/animation-en-cours/, { timeout: 3_000 });
    await expect(bouton).toBeFocused();
    await verifierStabilite(zone, avant);
  }
}

test('le PC rejoue son animation au clavier sans modifier le contenu', async ({ page }) => {
  await page.goto('/');
  const zone = page.locator('.planche [data-figure-animation]').first();
  const dessin = zone.locator('.planche__dessin');
  await rejouerDeuxFois(page, zone, dessin, 'planche-deployer');
  await expect(dessin).toHaveClass(/est-proche/);
});

test('les trois gestes de PvZ se rejouent sans ajouter de texte', async ({ page }) => {
  await page.goto('/');
  const figure = page.locator('#fig-2');
  await expect(figure).toContainText('Une vingtaine');
  await expect(figure).toContainText('Jusqu’à dix');
  await expect(figure.locator('details, summary')).toHaveCount(0);
  const zones = figure.locator('[data-figure-animation]');
  await expect(zones).toHaveCount(3);
  await expect(figure.getByRole('button', { name: /^Rejouer l’animation\s*:/ })).toHaveCount(3);
  for (let i = 0; i < 3; i++) {
    const zone = zones.nth(i);
    await rejouerDeuxFois(page, zone, zone.locator('.collectif__mouvement').first(), 'collectif-tracer');
  }
});

test('les trois cartes de Gwent se rejouent au clavier', async ({ page }) => {
  await page.goto('/');
  const figure = page.locator('#fig-gwent');
  await expect(figure.locator('details, summary')).toHaveCount(0);
  const zones = figure.locator('[data-figure-animation]');
  await expect(zones).toHaveCount(3);
  await expect(figure.getByRole('button', { name: /^Rejouer l’animation\s*:/ })).toHaveCount(3);
  for (let i = 0; i < 3; i++) {
    const zone = zones.nth(i);
    await rejouerDeuxFois(page, zone, zone.locator('.gwent__carte'), 'gwent-sortir');
  }
});

test('le graphique retrace le plafond puis interrompt le mouvement sur demande', async ({ page }) => {
  await page.goto('/');
  const figure = page.locator('#fig-1');
  const plan = figure.locator('[data-plafond]');
  const bouton = figure.getByRole('button', { name: /^Rejouer l’animation\s*:/ });
  const courbe = plan.locator('svg:visible .courbe');
  const decalage = () => courbe.evaluate((c) => Number.parseFloat(getComputedStyle(c).strokeDashoffset));
  await expect(figure.locator('details, summary')).toHaveCount(0);
  await bouton.scrollIntoViewIfNeeded();
  await expect.poll(decalage, { timeout: 4_000 }).toBeLessThan(1);
  const avant = await lireEtat(figure);

  await bouton.focus();
  await page.keyboard.press('Enter');
  await expect.poll(decalage).toBeGreaterThan(1);
  await verifierStabilite(figure, avant);
  await expect.poll(decalage, { timeout: 4_000 }).toBeLessThan(1);
  await verifierStabilite(figure, avant);

  await page.keyboard.press('Space');
  await expect.poll(decalage).toBeGreaterThan(1);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(courbe).toHaveCSS('stroke-dashoffset', '0px');
  expect(await courbe.evaluate((c) => Number.parseFloat(getComputedStyle(c).transitionDuration))).toBeLessThanOrEqual(0.001);
  await expect(plan.locator('svg:visible .annot--1')).toHaveCSS('opacity', '1');
  await verifierStabilite(figure, avant);
});

test.describe('les gestes sans mouvement', () => {
  test.use({ reducedMotion: 'reduce' });

  test('les planches et les trois cartes et gestes restent stables', async ({ page }) => {
    await page.goto('/');
    const zones = [
      page.locator('.planche [data-figure-animation]').first(),
      ...await page.locator('#fig-gwent [data-figure-animation]').all(),
      ...await page.locator('#fig-2 [data-figure-animation]').all(),
    ];
    expect(zones).toHaveLength(7);
    for (const zone of zones) {
      const bouton = zone.getByRole('button', { name: /^Rejouer l’animation\s*:/ });
      await bouton.scrollIntoViewIfNeeded();
      const avant = await lireEtat(zone);
      await bouton.focus();
      await page.keyboard.press('Enter');
      await expect(zone).not.toHaveClass(/animation-en-cours/);
      // Les transitions globales réduites à 0,01 ms disparaissent au rendu suivant.
      await expect.poll(() => zone.evaluate((element) => element.getAnimations({ subtree: true }).filter((animation) => animation.playState === 'running').length)).toBe(0);
      const dessins = zone.locator('.planche__dessin, .gwent__carte, .gwent__anime, .collectif__mouvement, .collectif__personne');
      for (const dessin of await dessins.all()) {
        await expect(dessin).toHaveCSS('animation-name', 'none');
        await expect(dessin).toHaveCSS('transform', 'none');
      }
      await verifierStabilite(zone, avant);
    }
  });
});
