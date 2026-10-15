import { expect, test } from '@playwright/test';
import { fileDeMesure } from './support/navigateur';
import { CONTACT_EMAIL } from './support/serveurs.mjs';

/**
 * Les interactions qui portent du sens : le mode nuit et son allumage, le
 * glossaire, la copie de l'adresse, le menu et le sommaire à portée de pouce,
 * le tracé de la figure 1. Chacune répond à un geste et le dit ; chacune
 * envoie l'événement prévu par le plan de marquage, et rien de plus. La
 * navigation de page de l’accueil est vérifiée dans accueil.spec.ts.
 */

test.describe('mode nuit', () => {
  test('le bouton bascule, le dit, et le choix survit au rechargement', async ({ page }) => {
    await page.goto('/');
    const racine = page.locator('html');
    const bouton = page.getByRole('button', { name: 'Mode nuit' });
    await expect(racine).toHaveAttribute('data-theme', 'jour');
    await expect(bouton).toHaveAttribute('aria-pressed', 'false');

    await bouton.click();
    await expect(racine).toHaveAttribute('data-theme', 'nuit');
    await expect(bouton).toHaveAttribute('aria-pressed', 'true');
    // La lanterne de la bascule s'allume : sa flamme prend la lumière de la lanterne.
    await expect(bouton.locator('.lt-flamme')).toHaveCSS('fill', 'rgb(240, 178, 74)');
    expect(await fileDeMesure(page)).toContainEqual(['theme', { choix: 'nuit' }]);

    await page.reload();
    await expect(racine).toHaveAttribute('data-theme', 'nuit');
    await expect(page.getByRole('button', { name: 'Mode nuit' })).toHaveAttribute('aria-pressed', 'true');
  });

  test.describe('système en mode sombre', () => {
    test.use({ colorScheme: 'dark' });

    test('sans choix, le site suit le système, sans rien mesurer', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'nuit');
      expect((await fileDeMesure(page)).filter(([nom]) => nom === 'theme')).toEqual([]);
    });
  });

  test('l’allumage part de la lanterne : la nuit tombe sur elle, le jour en repart', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      const etats: [string | null, string][] = [];
      (window as unknown as { __allumage: typeof etats }).__allumage = etats;
      const racine = document.documentElement;
      new MutationObserver(() => etats.push([racine.getAttribute('data-transition-theme'), racine.style.getPropertyValue('--vt-x')])).observe(
        racine,
        { attributes: true, attributeFilter: ['data-transition-theme'] },
      );
    });
    const lanterne = page.locator('[data-theme-bascule]');
    const boite = await lanterne.boundingBox();
    await lanterne.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'nuit');
    await expect(page.locator('html')).not.toHaveAttribute('data-transition-theme', /.+/, { timeout: 2_000 });
    await lanterne.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'jour');
    await expect(page.locator('html')).not.toHaveAttribute('data-transition-theme', /.+/, { timeout: 2_000 });
    const etats = await page.evaluate(() => (window as unknown as { __allumage: [string | null, string][] }).__allumage);
    expect(etats.map(([etat]) => etat)).toEqual(['vers-nuit', null, 'vers-jour', null]);
    // Le masque est centré sur la lanterne touchée.
    expect(Number.parseFloat(etats[0][1])).toBeCloseTo((boite?.x ?? 0) + (boite?.width ?? 0) / 2, -1);
  });

  test('le fondu ne se prépare que sur un changement de thème', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).not.toHaveAttribute('data-transition-theme', /.+/);
    const commande = page.locator('[data-theme-bascule]');
    await commande.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'nuit');
    await expect(page.locator('html')).not.toHaveAttribute('data-transition-theme', /.+/, { timeout: 2_000 });
    await page.goto('/parcours');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'nuit');
  });

  test('le changement reste possible sans View Transitions', async ({ page }) => {
    await page.addInitScript(() => Object.defineProperty(document, 'startViewTransition', { value: undefined }));
    await page.goto('/');
    await page.locator('[data-theme-bascule]').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'nuit');
    await expect(page.locator('html')).not.toHaveAttribute('data-transition-theme', /.+/, { timeout: 2_000 });
  });

  test.describe('thème et mouvement réduit', () => {
    test.use({ reducedMotion: 'reduce' });

    test('le choix est immédiat et sans fondu', async ({ page }) => {
      await page.goto('/');
      await page.locator('[data-theme-bascule]').click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'nuit');
      await expect(page.locator('html')).not.toHaveAttribute('data-transition-theme', /.+/);
    });
  });
});

test.describe('glossaire', () => {
  test('un mot s’ouvre au clavier, se referme par Échap, et rend le focus', async ({ page }) => {
    await page.goto('/');
    const mot = page.locator('button.terme[data-terme="classement-mondial"]');
    const bulle = page.locator('#terme-classement-mondial');
    await mot.scrollIntoViewIfNeeded();
    await mot.focus();
    await page.keyboard.press('Enter');
    await expect(bulle).toBeVisible();
    await expect(bulle).toContainText('le rang 0');
    await expect(mot).toHaveAttribute('aria-expanded', 'true');

    // La bulle est posée contre son mot, et reste dans l'écran.
    const [rectMot, rectBulle] = await Promise.all([mot.boundingBox(), bulle.boundingBox()]);
    const ecart = Math.min(
      Math.abs((rectBulle?.y ?? 0) - ((rectMot?.y ?? 0) + (rectMot?.height ?? 0))),
      Math.abs((rectMot?.y ?? 0) - ((rectBulle?.y ?? 0) + (rectBulle?.height ?? 0))),
    );
    expect(ecart).toBeLessThanOrEqual(12);
    const largeurEcran = page.viewportSize()?.width ?? 0;
    expect((rectBulle?.x ?? 0) + (rectBulle?.width ?? 0)).toBeLessThanOrEqual(largeurEcran);

    await page.keyboard.press('Escape');
    await expect(bulle).toBeHidden();
    await expect(mot).toHaveAttribute('aria-expanded', 'false');
    await expect(mot).toBeFocused();
    expect(await fileDeMesure(page)).toContainEqual(['glossaire', { terme: 'classement-mondial' }]);
  });

  test('la bulle suit son mot au défilement, et se ferme quand il sort de l’écran', async ({ page }) => {
    await page.goto('/');
    const mot = page.locator('button.terme[data-terme="deck"]');
    const bulle = page.locator('#terme-deck');
    await mot.scrollIntoViewIfNeeded();
    await mot.click();
    await expect(bulle).toBeVisible();
    await page.evaluate(() => window.scrollBy({ top: 60, behavior: 'instant' }));
    await expect(bulle).toBeVisible();
    await page.evaluate(() => window.scrollBy({ top: 2400, behavior: 'instant' }));
    await expect(bulle).toBeHidden();
  });
});

test('« Copier l’adresse » copie, le dit, puis revient', async ({ page, context, browserName }) => {
  test.skip(browserName !== 'chromium', 'permissions du presse-papiers propres à Chromium');
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/contact');
  // Le bouton de la page ; celui du pied de page a sa propre mesure.
  const bouton = page.locator('main button[data-copier]');
  await bouton.scrollIntoViewIfNeeded();
  await bouton.click();
  await expect(bouton).toHaveText(/Adresse copiée/);
  await expect(page.locator('main [data-copier-statut]')).toHaveText('Adresse copiée');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(CONTACT_EMAIL);
  expect(await fileDeMesure(page)).toContainEqual(['contact-copie', { emplacement: 'contact' }]);
  await expect(bouton).toHaveText(/Copier l’adresse/, { timeout: 4_000 });
});

test('chaque chapitre atteint est mesuré une fois, dans l’ordre de lecture', async ({ page }) => {
  await page.goto('/');
  const hauteur = await page.evaluate(() => document.documentElement.scrollHeight);
  // Une lecture complète, puis un retour en arrière et une relecture : rien
  // ne doit partir deux fois.
  for (const pas of [450, -1800, 1800]) {
    const depart = pas > 0 ? 0 : hauteur;
    for (let y = depart; pas > 0 ? y < hauteur : y > 0; y += pas) {
      await page.evaluate((position) => window.scrollTo({ top: position, behavior: 'instant' }), y);
      await page.waitForTimeout(30);
    }
  }
  const lectures = (await fileDeMesure(page)).filter(([nom]) => nom === 'lecture').map(([, donnees]) => donnees?.chapitre);
  expect(lectures).toEqual(['origine', 'aujourdhui', 'discutons']);
});

test.describe('mobile', () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) >= 1100, 'sommaire de l’en-tête : sous 1100 px');

  test('le menu donne accès aux pages au clavier', async ({ page }) => {
    await page.goto('/');
    const menu = page.getByRole('banner').locator('details[data-menu-mobile]');
    await menu.locator('summary').focus();
    await page.keyboard.press('Enter');
    await expect(menu).toHaveAttribute('open', '');
    await page.keyboard.press('Escape');
    await expect(menu).not.toHaveAttribute('open', '');
    await expect(menu.locator('summary')).toBeFocused();
    await page.keyboard.press('Enter');
    for (const [nom, href] of [['Projets', '/projets'], ['Parcours', '/parcours'], ['Blog', '/blog'], ['Contact', '/contact']]) {
      await expect(menu.getByRole('link', { name: nom, exact: true })).toHaveAttribute('href', href);
    }
    await menu.getByRole('link', { name: 'Projets', exact: true }).click();
    await expect(page).toHaveURL(/\/projets$/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('le sommaire de l’en-tête mène aux chapitres, et se referme comme le menu', async ({ page }) => {
    await page.goto('/');
    const sommaire = page.getByRole('banner').locator('details', { has: page.getByText('Sommaire', { exact: true }) });
    const menu = page.getByRole('banner').locator('details[data-menu-mobile]');
    await sommaire.locator('summary').click();
    await expect(sommaire).toHaveAttribute('open', '');
    const liens = sommaire.getByRole('navigation', { name: 'Sommaire de la page' }).getByRole('link');
    await expect(liens).toHaveCount(3);
    await expect(liens.first()).toHaveAttribute('href', '#origine');
    // Ouvrir le menu referme le sommaire ; Échap referme le menu et rend le focus.
    await menu.locator('summary').click();
    await expect(sommaire).not.toHaveAttribute('open', '');
    await page.keyboard.press('Escape');
    await expect(menu).not.toHaveAttribute('open', '');
    await expect(menu.locator('summary')).toBeFocused();
    await sommaire.locator('summary').click();
    await liens.nth(2).click();
    await expect(sommaire).not.toHaveAttribute('open', '');
    await expect(page.locator('#discutons')).toBeInViewport();
  });

  test('la barre de 2 px suit la lecture', async ({ page }) => {
    await page.goto('/contact');
    const barre = page.locator('[data-progression]');
    await expect(barre).toBeAttached();
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
    await expect.poll(() => barre.evaluate((element) => Number.parseFloat(element.style.getPropertyValue('--progression')))).toBeGreaterThan(0.99);
  });
});

test.describe('figure 1', () => {
  test('la courbe se trace à son arrivée, puis les annotations apparaissent', async ({ page }) => {
    await page.goto('/');
    const plan = page.locator('[data-plafond]');
    await expect(plan).toHaveClass(/est-pret/);
    await plan.scrollIntoViewIfNeeded();
    await expect(plan).toHaveClass(/est-trace/);
    const courbe = plan.locator('svg:visible .courbe');
    await expect
      .poll(() => courbe.evaluate((c) => Number.parseFloat(getComputedStyle(c).strokeDashoffset)), { timeout: 4_000 })
      .toBeLessThan(1);
    await expect
      .poll(() => plan.locator('svg:visible .annot--2').evaluate((a) => getComputedStyle(a).opacity), { timeout: 4_000 })
      .toBe('1');
  });

  test.describe('mouvement réduit', () => {
    test.use({ reducedMotion: 'reduce' });

    test('la figure arrive complète, sans préparation', async ({ page }) => {
      await page.goto('/');
      const plan = page.locator('[data-plafond]');
      await expect(plan).not.toHaveClass(/est-pret/);
      await expect(plan.locator('svg:visible .annot--1')).toHaveCSS('opacity', '1');
    });
  });
});
