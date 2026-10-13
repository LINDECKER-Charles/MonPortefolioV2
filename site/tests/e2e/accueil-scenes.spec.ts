import { expect, test, type Locator, type Page } from '@playwright/test';

/**
 * Les scènes de l’accueil (gardées le 13/10/2026, règles de mouvement
 * d’AGENTS.md) : la figure du plafond se trace à son arrivée ; les trois
 * règles apparaissent de 1 à 3 ; le système communique en boucle tant qu’il
 * est visible ; les autres scènes (les gravures du registre qui s’allument
 * depuis leur lanterne, les cartes de Gwent, les lanternes) se jouent une
 * fois à leur arrivée, puis se rejouent d’un clic sur le dessin ou au
 * clavier. Mouvement réduit et impression : l’état final, sans mouvement.
 *
 * Blocs déplacés depuis illustrations.spec.ts et interactions.spec.ts avec
 * la refonte de l’accueil.
 */

test.use({ reducedMotion: 'no-preference' });

/**
 * La hauteur de mise en page (offsetHeight), pas celle de la boîte affichée :
 * une carte de Gwent qui se soulève en tournant de 1,5° grandit à l’écran de
 * quelques pixels sans rien décaler autour d’elle. C’est le décalage qu’on
 * interdit, pas le mouvement.
 */
async function lireEtat(zone: Locator) {
  return zone.evaluate((element) => ({
    texte: element.textContent,
    hauteur: element instanceof HTMLElement ? element.offsetHeight : element.getBoundingClientRect().height,
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

/** Laisse l’observateur recevoir le défilement, sans masquer un rejeu bref. */
async function resteImmobile(zone: Locator, duree = 500) {
  return zone.evaluate((element, attente) => new Promise<boolean>((resolve) => {
    const fin = performance.now() + attente;
    const observer = () => {
      if (element.getAnimations({ subtree: true }).some((animation) => animation.playState === 'running')) {
        resolve(false);
      } else if (performance.now() >= fin) resolve(true);
      else requestAnimationFrame(observer);
    };
    requestAnimationFrame(observer);
  }), duree);
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

for (const scene of ['pc', 'cartes', 'portes', 'diplome', 'pupitre', 'lanternes']) {
  test(`la scène ${scene} joue à son arrivée puis se rejoue avec Entrée et Espace`, async ({ page }) => {
    await page.goto('/');
    const figure = page.locator(`figure[data-scene="${scene}"]`);
    await verifierPremiereApparition(figure.locator('[data-rejouer]'), figure);
    await rejouerAuClavier(page, figure.locator('[data-rejouer]'), figure);
  });
}

test('une scène s’allume depuis la lanterne de son image, et le bouton couvre tout le dessin', async ({ page }) => {
  await page.goto('/');
  const figure = page.locator('figure[data-scene="pc"]');
  const bouton = figure.locator('[data-rejouer]');
  const [cadre, commande] = await Promise.all([figure.locator('[data-visuel]').boundingBox(), bouton.boundingBox()]);
  expect(Math.abs((cadre?.width ?? 0) - (commande?.width ?? 1))).toBeLessThanOrEqual(1);
  expect(Math.abs((cadre?.height ?? 0) - (commande?.height ?? 1))).toBeLessThanOrEqual(1);
  // La lumière part de la place que la consigne du registre impose à la lanterne (28 %, 58 %).
  const centre = await figure.locator('.scene__halo').evaluate((halo) => {
    const svg = (halo as SVGCircleElement).ownerSVGElement as SVGSVGElement;
    const boite = svg.viewBox.baseVal;
    return { x: Number(halo.getAttribute('cx')) / boite.width, y: Number(halo.getAttribute('cy')) / boite.height };
  });
  expect(centre.x).toBeCloseTo(0.28, 2);
  expect(centre.y).toBeCloseTo(0.58, 2);
});

test('le retour vers une scène ne la rejoue pas et le clic reste disponible', async ({ page }) => {
  await page.goto('/');
  const figure = page.locator('figure[data-scene="pc"]');
  const bouton = figure.locator('[data-rejouer]');
  const zone = zoneAnimee(bouton);
  await verifierPremiereApparition(bouton, figure);

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await expect(bouton).not.toBeInViewport();
  expect(await resteImmobile(zone, 250)).toBe(true);
  await bouton.scrollIntoViewIfNeeded();
  await expect(bouton).toBeInViewport();
  expect(await resteImmobile(zone)).toBe(true);

  await cliquerDessin(bouton);
  await expect(zone).toHaveClass(/animation-en-cours/);
  await expect.poll(async () => (await mouvements(zone)).length > 0).toBe(true);
  await expect(zone).not.toHaveClass(/animation-en-cours/, { timeout: 4_000 });
});

test('cliquer le PC pendant son animation la redémarre et revient au dessin complet', async ({ page }) => {
  await page.goto('/');
  const figure = page.locator('figure[data-scene="pc"]');
  const bouton = figure.locator('[data-rejouer]');
  const zone = zoneAnimee(bouton);
  const avant = await lireEtat(figure);

  await cliquerDessin(bouton);
  await expect(zone).toHaveClass(/animation-en-cours/);
  await expect.poll(async () => (await mouvements(zone)).some((temps) => temps > 350)).toBe(true);
  await cliquerDessin(bouton);
  await expect.poll(async () => (await mouvements(zone)).some((temps) => temps < 250)).toBe(true);
  await expect(zone).not.toHaveClass(/animation-en-cours/, { timeout: 4_000 });
  await verifierStabilite(figure, avant);

  await cliquerDessin(bouton);
  await expect(zone).toHaveClass(/animation-en-cours/);
  await expect(zone).not.toHaveClass(/animation-en-cours/, { timeout: 4_000 });
  await verifierStabilite(figure, avant);
});

for (const [id, nom] of [['fig-gwent', 'Gwent'], ['fig-2', 'PvZ']] as const) {
  test(`les trois dessins de ${nom} se rejouent au clic et au clavier`, async ({ page }) => {
    await page.goto('/');
    const figure = page.locator(`#${id}`);
    const boutons = figure.locator('[data-rejouer]');
    await expect(boutons).toHaveCount(3);
    await verifierPremiereApparition(boutons.first(), figure);
    for (const bouton of await boutons.all()) {
      const zone = zoneAnimee(bouton);
      await cliquerDessin(bouton);
      await expect(zone).toHaveClass(/animation-en-cours/);
      await expect.poll(async () => (await mouvements(zone)).length > 0).toBe(true);
      await expect(zone).not.toHaveClass(/animation-en-cours/, { timeout: 4_000 });
      await rejouerAuClavier(page, bouton, zone);
    }
  });
}

test('les commandes de rejeu enveloppent les dessins sans bouton ajouté à côté', async ({ page }) => {
  await page.goto('/');
  const boutons = page.locator('[data-rejouer]');
  // Cinq scènes du récit, trois cartes, trois étapes du pôle, le plafond, le système et les lanternes.
  await expect(boutons).toHaveCount(14);
  for (const bouton of await boutons.all()) {
    // Rendues désactivées, réactivées par le script qui les rejoue.
    await expect(bouton).toBeEnabled();
    await expect(bouton.locator('svg:visible')).toHaveCount(1);
    await expect(bouton.locator('span').filter({ hasText: '↻' })).toHaveCount(0);
  }
});

test.describe('sans JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('aucune commande de rejeu inerte dans l’ordre de tabulation', async ({ page }) => {
    await page.goto('/');
    const boutons = page.locator('[data-rejouer]');
    await expect(boutons).toHaveCount(14);
    // Le dessin est déjà dans son état final : rien à rejouer, rien à atteindre au clavier.
    for (const bouton of await boutons.all()) {
      await expect(bouton).toBeDisabled();
      await expect(bouton).toBeVisible();
    }
    const focalisables = await boutons.evaluateAll((elements) => elements.filter((element) => {
      (element as HTMLElement).focus();
      return document.activeElement === element;
    }).length);
    expect(focalisables).toBe(0);
  });
});

test('le graphique retrace le plafond puis interrompt le mouvement sur demande', async ({ page }) => {
  await page.goto('/');
  const figure = page.locator('#fig-1');
  const plan = figure.locator('[data-plafond]');
  const bouton = figure.locator('[data-rejouer]');
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

  await cliquerDessin(bouton);
  await expect.poll(decalage).toBeGreaterThan(1);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(courbe).toHaveCSS('stroke-dashoffset', '0px');
  expect(await courbe.evaluate((c) => Number.parseFloat(getComputedStyle(c).transitionDuration))).toBeLessThanOrEqual(0.001);
  await expect(plan.locator('svg:visible .annot--1')).toHaveCSS('opacity', '1');
  await verifierStabilite(figure, avant);
});

test('la communication joue dans l’écran et s’arrête hors écran ou dans un onglet masqué', async ({ page }) => {
  await page.goto('/');
  const bouton = page.locator('[data-scene="architecte"] [data-rejouer]');
  const zone = zoneAnimee(bouton);
  await expect(bouton).toHaveAttribute('data-animation-continue', /.*/);
  await expect.poll(async () => (await mouvements(zone)).length).toBe(0);
  await bouton.scrollIntoViewIfNeeded();
  await expect.poll(async () => (await mouvements(zone)).length > 0).toBe(true);

  await cliquerDessin(bouton);
  await expect.poll(async () => (await mouvements(zone)).some((temps) => temps < 250)).toBe(true);

  // Chromium sans fenêtre garde ses pages « visibles » : on simule le signal
  // du navigateur pour vérifier le traitement de visibilitychange.
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect.poll(async () => (await mouvements(zone)).length).toBe(0);
  await page.evaluate(() => {
    Reflect.deleteProperty(document, 'hidden');
    Reflect.deleteProperty(document, 'visibilityState');
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect.poll(async () => (await mouvements(zone)).length > 0).toBe(true);

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(async () => (await mouvements(zone)).length).toBe(0);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect.poll(async () => (await mouvements(zone)).length > 0).toBe(true);

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await expect.poll(async () => (await mouvements(zone)).length).toBe(0);
});

test('les trois règles apparaissent dans l’ordre à leur arrivée dans l’écran', async ({ page }) => {
  await page.goto('/');
  const regles = page.locator('[data-revelation-progressive]');
  await expect(regles.locator(':scope > li')).toHaveCount(3);
  const apparitions = await regles.evaluate((element) => new Promise<number[]>((resolve) => {
    const cartes = [...element.children];
    const instants = cartes.map(() => -1);
    const debut = performance.now();
    element.scrollIntoView({ behavior: 'instant', block: 'start' });
    const observer = () => {
      const maintenant = performance.now();
      for (const [i, carte] of cartes.entries()) {
        if (instants[i] === -1 && Number.parseFloat(getComputedStyle(carte).opacity) > 0.95) {
          instants[i] = maintenant - debut;
        }
      }
      if (instants.every((instant) => instant >= 0) || performance.now() - debut > 4_000) resolve(instants);
      else requestAnimationFrame(observer);
    };
    requestAnimationFrame(observer);
  }));
  expect(apparitions[0]).toBeGreaterThanOrEqual(0);
  expect(apparitions[1]).toBeGreaterThan(apparitions[0]);
  expect(apparitions[2]).toBeGreaterThan(apparitions[1]);
  for (const regle of await regles.locator(':scope > li').all()) await expect(regle).toHaveCSS('opacity', '1');
});

test.describe('les gestes sans mouvement', () => {
  test.use({ reducedMotion: 'reduce' });

  test('tous les dessins restent complets au scroll, au clic et au clavier', async ({ page }) => {
    await page.goto('/');
    for (const bouton of await page.locator('[data-rejouer]').all()) {
      const zone = zoneAnimee(bouton);
      const avant = await lireEtat(zone);
      await bouton.scrollIntoViewIfNeeded();
      expect(await resteImmobile(zone, 250)).toBe(true);
      await expect(zone).not.toHaveClass(/animation-en-cours/);
      await cliquerDessin(bouton);
      await bouton.focus();
      await page.keyboard.press('Enter');
      await expect(zone).not.toHaveClass(/animation-en-cours/);
      await expect.poll(async () => (await mouvements(zone)).length).toBe(0);
      await verifierStabilite(zone, avant);
    }
    for (const regle of await page.locator('[data-revelation-progressive] > li').all()) {
      await expect(regle).toHaveCSS('opacity', '1');
    }
    // Au repos, la lumière des scènes est éteinte le jour, sans voile.
    for (const voile of await page.locator('.scene__voile').all()) await expect(voile).toHaveCSS('opacity', '0');
  });
});

test('l’impression conserve tous les dessins et toutes les règles sans mouvement', async ({ page }) => {
  await page.goto('/');
  await page.emulateMedia({ media: 'print' });
  for (const bouton of await page.locator('[data-rejouer]').all()) {
    await expect(bouton).toBeVisible();
    await expect(bouton.locator('svg:visible')).toHaveCount(1);
    await expect.poll(async () => (await mouvements(zoneAnimee(bouton))).length).toBe(0);
  }
  for (const regle of await page.locator('[data-revelation-progressive] > li').all()) {
    await expect(regle).toHaveCSS('opacity', '1');
  }
  await expect(page.locator('[data-plafond] svg:visible .courbe')).toHaveCSS('stroke-dashoffset', '0px');
  for (const annotation of await page.locator('[data-plafond] svg:visible .annot').all()) {
    await expect(annotation).toHaveCSS('opacity', '1');
  }
});
