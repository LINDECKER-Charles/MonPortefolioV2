import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { CONTACT_EMAIL } from './support/serveurs.mjs';

/**
 * La coque commune « Lanterne » : en-tête, pied de page, polices et thème.
 * Les mêmes sur toutes les pages : vérifiés sur la page de contact, qui n’a
 * pas de sommaire, et sur l’accueil, qui en a un.
 */

test('l’en-tête : l’emblème mène à l’accueil, la navigation marque la page, la lanterne bascule', async ({ page }) => {
  await page.goto('/contact');
  const entete = page.getByRole('banner');
  await expect(entete.getByRole('link', { name: 'Charles Lindecker, accueil' })).toHaveAttribute('href', '/');
  await expect(entete.getByRole('button', { name: 'Mode nuit' })).toBeVisible();
  // « mode d’emploi » a quitté l’en-tête : il ne reste qu’en clin d’œil.
  await expect(entete).not.toContainText(/mode d’emploi/i);

  const bureau = (page.viewportSize()?.width ?? 0) > 860;
  if (bureau) {
    const navigation = entete.getByRole('navigation', { name: 'Navigation principale' });
    await expect(navigation.getByRole('link')).toHaveText(['Projets', 'Parcours', 'Blog', 'Contact']);
    await expect(navigation.getByRole('link', { name: 'Contact' })).toHaveAttribute('aria-current', 'page');
  } else {
    await expect(entete.getByRole('link', { name: 'Contact', exact: true })).toHaveAttribute('aria-current', 'page');
    await expect(entete.getByRole('navigation', { name: 'Navigation principale' })).toBeHidden();
  }
});

test('le pied de page : l’adresse visible et mesurée, les profils marqués, les polices nommées', async ({ page }) => {
  await page.goto('/projets');
  const pied = page.getByRole('contentinfo');
  const courriel = pied.getByRole('link', { name: CONTACT_EMAIL, exact: true });
  await expect(courriel).toBeVisible();
  await expect(courriel).toHaveAttribute('href', `mailto:${encodeURIComponent(CONTACT_EMAIL)}?subject=Discutons`);
  await expect(courriel).toHaveAttribute('data-umami-event', 'contact-email');
  await expect(courriel).toHaveAttribute('data-umami-event-emplacement', 'pied-de-page');
  for (const [nom, domaine] of [['LinkedIn', 'www.linkedin.com'], ['GitHub', 'github.com']]) {
    const profil = pied.getByRole('link', { name: nom, exact: true });
    await expect(profil).toContainText('↗');
    await expect(profil).toHaveAttribute('data-umami-event', 'lien-sortant');
    await expect(profil).toHaveAttribute('data-umami-event-domaine', domaine);
  }
  await expect(pied.getByRole('navigation', { name: 'Explorer le site' }).getByRole('link')).toHaveText(['Accueil', 'Projets', 'Parcours', 'Blog', 'Contact']);
  await expect(pied).toContainText('Composé en Instrument Serif et Instrument Sans.');
  await expect(pied).toContainText('mode d’emploi');
});

test('les polices de la direction : Instrument Serif aux titres, Instrument Sans au texte, aucun zéro barré', async ({ page }) => {
  await page.goto('/contact');
  await page.evaluate(() => document.fonts.ready);
  const titre = await page.getByRole('heading', { level: 1 }).evaluate((h) => getComputedStyle(h).fontFamily);
  const texte = await page.locator('body').evaluate((b) => getComputedStyle(b).fontFamily);
  expect(titre).toMatch(/^"?Instrument Serif/);
  expect(texte).toMatch(/^"?Instrument Sans/);
  // Astro suffixe le nom de famille d’une empreinte : « Instrument Sans-7ebe… ».
  const chargees = await page.evaluate(() =>
    [...document.fonts].filter((f) => f.status === 'loaded').map((f) => `${f.family.replace(/"/g, '').replace(/-[0-9a-f]{8,}$/, '')} ${f.style}`),
  );
  expect(chargees).toEqual(expect.arrayContaining(['Instrument Serif normal', 'Instrument Sans normal']));
});

test.describe('nuit choisie', () => {
  test.use({ colorScheme: 'dark' });

  test('la nuit « clair de lune » : fond de suie, lanterne allumée, halo sur la flamme du logo', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'nuit');
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(11, 13, 18)');
    await expect(page.getByRole('button', { name: 'Mode nuit' })).toHaveAttribute('aria-pressed', 'true');
    const halo = await page.locator('.entete .logo__embleme').evaluate((e) => getComputedStyle(e, '::after').opacity);
    expect(halo).toBe('1');
  });
});

test.describe('sans JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('la bascule est masquée, la navigation complète', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('[data-theme-bascule]')).toBeHidden();
    await expect(page.getByRole('contentinfo').locator('button[data-copier]')).toBeHidden();
    await expect(page.getByRole('banner').getByRole('link', { name: 'Contact', exact: true })).toBeVisible();
  });

  test.describe('système en mode sombre', () => {
    test.use({ colorScheme: 'dark' });

    test('le thème suit prefers-color-scheme', async ({ page }) => {
      await page.goto('/contact');
      await expect(page.locator('html')).not.toHaveAttribute('data-theme', /.+/);
      await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(11, 13, 18)');
      await expect(page.locator('body')).toHaveCSS('color', 'rgb(228, 231, 238)');
    });
  });
});

test.describe('mobile', () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) > 860, 'menu de l’en-tête : sous 860 px');
  test.use({ reducedMotion: 'reduce' });

  for (const theme of ['light', 'dark'] as const) {
    test(`axe, menu ouvert (${theme === 'dark' ? 'nuit' : 'jour'})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: theme });
      await page.goto('/');
      const menu = page.getByRole('banner').locator('details[data-menu-mobile]');
      await menu.locator('summary').click();
      await expect(menu.getByRole('navigation', { name: 'Navigation mobile' })).toBeVisible();
      const resultats = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
        .include('header')
        .analyze();
      expect(resultats.violations.map((v) => ({ id: v.id, cibles: v.nodes.map((n) => n.target) }))).toEqual([]);
    });
  }

  test('l’en-tête tient sur une ligne, sans débordement, jusqu’à 340 px', async ({ page }) => {
    await page.setViewportSize({ width: 340, height: 740 });
    await page.goto('/');
    const lanterne = await page.locator('[data-theme-bascule]').boundingBox();
    expect((lanterne?.x ?? 0) + (lanterne?.width ?? 0)).toBeLessThanOrEqual(340);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  });
});
