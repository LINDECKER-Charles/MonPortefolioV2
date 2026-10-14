import { expect, test, type Locator, type Page } from '@playwright/test';

/**
 * Les scènes animées des pages de projet : elles jouent à leur arrivée, puis
 * se rejouent au clic ou au clavier, sans bouger le texte autour. Celles de
 * l’accueil sont couvertes par accueil-scenes.spec.ts.
 */

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

function zoneAnimee(bouton: Locator) {
  return bouton.locator('xpath=ancestor-or-self::*[@data-figure-animation][1]');
}

async function mouvements(zone: Locator) {
  return zone.evaluate((element) => element.getAnimations({ subtree: true })
    .filter((animation) => animation.playState === 'running')
    .map((animation) => Number(animation.currentTime)));
}

/** Le dessin reçoit lui-même le clic, y compris quand la cible est un SVG. */
async function cliquerDessin(bouton: Locator) {
  await bouton.scrollIntoViewIfNeeded();
  await bouton.locator('svg:visible').click();
}

async function verifierPremiereApparition(bouton: Locator, contenu: Locator) {
  const zone = zoneAnimee(bouton);
  const avant = await lireEtat(contenu);
  await expect.poll(async () => (await mouvements(zone)).length).toBe(0);
  await bouton.scrollIntoViewIfNeeded();
  await expect(zone).toHaveClass(/animation-en-cours/);
  await expect.poll(async () => (await mouvements(zone)).length > 0).toBe(true);
  await verifierStabilite(contenu, avant);
  await expect(zone).not.toHaveClass(/animation-en-cours/, { timeout: 4_000 });
  await verifierStabilite(contenu, avant);
}

async function rejouerAuClavier(page: Page, bouton: Locator, contenu: Locator) {
  const zone = zoneAnimee(bouton);
  const avant = await lireEtat(contenu);
  await expect(bouton).toHaveAttribute('type', 'button');
  await expect(bouton).toHaveAccessibleName(/^Rejouer l’animation\s*:/);
  await expect(contenu.locator('details, summary')).toHaveCount(0);
  await bouton.scrollIntoViewIfNeeded();

  for (const touche of ['Enter', 'Space']) {
    await bouton.focus();
    await page.keyboard.press(touche);
    await expect(zone).toHaveClass(/animation-en-cours/);
    await expect.poll(async () => (await mouvements(zone)).length > 0).toBe(true);
    await verifierStabilite(contenu, avant);
    await expect(zone).not.toHaveClass(/animation-en-cours/, { timeout: 4_000 });
    await expect(bouton).toBeFocused();
    await verifierStabilite(contenu, avant);
  }
}

// PvZ Fusion : les deux scènes gardées par la page (figures codées depuis les relevés).
for (const scene of ['pvz-equipe', 'pvz-rattrapage']) {
  test(`la scène ${scene} de PvZ Fusion joue à son arrivée puis se rejoue au clic et au clavier`, async ({ page }) => {
    await page.goto('/projets/pvz-fusion');
    const bouton = page.locator(`[data-rejouer][data-scene="${scene}"]`);
    await expect(bouton).toHaveCount(1);
    await verifierPremiereApparition(bouton, bouton);
    const zone = zoneAnimee(bouton);
    await cliquerDessin(bouton);
    await expect(zone).toHaveClass(/animation-en-cours/);
    await expect.poll(async () => (await mouvements(zone)).length > 0).toBe(true);
    await expect(zone).not.toHaveClass(/animation-en-cours/, { timeout: 4_000 });
    await rejouerAuClavier(page, bouton, bouton);
    await expect(bouton.locator('svg:visible')).toHaveCount(1);
  });
}
