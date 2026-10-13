import { expect, test } from '@playwright/test';
import { NOMBRE_TECHNOLOGIES, QUOTIDIEN } from '../../src/config/competences';

/**
 * Page Compétences : trois niveaux de technologies, l’intégration IA, la
 * chaîne de livraison et les compétences humaines. Contrat de la page : un
 * logo (ou picto de repli) et un lien officiel par technologie, aucune case
 * vide, aucun lien de projet.
 */

test.describe('sans JavaScript', () => {
  test.use({ javaScriptEnabled: false, reducedMotion: 'reduce' });

  test('chaque technologie a un logo visible et le lien de son site officiel', async ({ page }) => {
    await page.goto('/parcours/competences');
    const technos = page.locator('main a.techno');
    await expect(technos).toHaveCount(NOMBRE_TECHNOLOGIES);
    for (const lien of await technos.all()) {
      await lien.scrollIntoViewIfNeeded();
      await expect(lien).toHaveAttribute('href', /^https:\/\//);
      await expect(lien).toHaveAttribute('rel', 'external');
      await expect(lien).toHaveAttribute('data-umami-event', 'lien-sortant');
      await expect(lien).toHaveAttribute('data-umami-event-emplacement', 'competences');
      const domaine = new URL((await lien.getAttribute('href')) ?? '').hostname;
      await expect(lien).toHaveAttribute('data-umami-event-domaine', domaine);
      const logo = lien.locator('.logo-stack');
      await expect(logo).toHaveCount(1);
      await expect(logo).toBeVisible();
      if (await logo.evaluate((element) => element.tagName === 'IMG')) {
        await expect.poll(() => logo.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
      }
      expect((await lien.innerText()).trim().length).toBeGreaterThan(0);
    }
  });

  test('les trois niveaux, l’IA, la livraison et les compétences humaines se lisent sans script', async ({ page }) => {
    await page.goto('/parcours/competences');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Compétences');

    const quotidien = page.getByRole('region', { name: 'Au quotidien', exact: true });
    await expect(quotidien.locator('a.techno--tuile')).toHaveCount(QUOTIDIEN.length);
    await expect(quotidien.getByRole('link', { name: /^Angular/ })).toHaveAttribute('href', 'https://angular.dev/');
    await expect(quotidien.locator('.a-confirmer')).toHaveText('niveaux à confirmer');

    const pratique = page.getByRole('region', { name: 'Pratiqué', exact: true });
    await expect(pratique.getByRole('link', { name: 'ASP.NET Core', exact: true })).toBeVisible();
    for (const famille of ['Langages', 'Web et interfaces', 'Backend et API', 'Données', 'Mobile']) {
      await expect(pratique.getByRole('region', { name: famille, exact: true }).getByRole('heading', { level: 3 })).toBeVisible();
    }

    // Exploré : ouvert par défaut, complet sans script.
    const explore = page.getByRole('region', { name: 'Exploré ou ponctuel', exact: true });
    await expect(explore.locator('details')).toHaveAttribute('open', '');
    await expect(explore.getByRole('link', { name: 'Rust', exact: true })).toBeVisible();
    await expect(explore.getByRole('link', { name: 'Photino.NET', exact: true })).toBeVisible();

    const ia = page.getByRole('region', { name: 'Intégration IA', exact: true });
    await expect(ia.getByRole('link', { name: 'MCP', exact: true })).toHaveAttribute('href', 'https://modelcontextprotocol.io/');
    await expect(ia.getByRole('link', { name: 'Claude', exact: true })).toHaveAttribute('href', 'https://claude.com/');
    await expect(ia.getByRole('link', { name: 'Codex', exact: true })).toHaveAttribute('href', 'https://openai.com/codex/');

    const livraison = page.getByRole('region', { name: 'Tests et livraison', exact: true });
    const etapes = livraison.locator('.chaine__etapes > li');
    await expect(etapes).toHaveCount(5);
    await expect(etapes.first()).toContainText('Vérifier');
    await expect(etapes.last()).toContainText('Promouvoir sans reconstruire');
    await expect(livraison.locator('.chaine__empreinte')).toHaveCount(4);

    const humaines = page.getByRole('region', { name: 'Compétences humaines', exact: true });
    await expect(humaines.locator('.humaine')).toHaveCount(7);
    await expect(humaines.getByRole('heading', { name: 'Pédagogie', exact: true })).toBeVisible();
    await expect(humaines.getByRole('link', { name: 'Trello', exact: true })).toHaveAttribute('href', 'https://trello.com/');
    for (const id of ['CMP-02', 'CMP-03', 'CMP-04', 'CMP-05', 'CMP-06', 'CMP-07', 'CMP-08']) {
      await expect(humaines.locator(`[data-visuel="${id}"]`)).toHaveCount(1);
    }

    // Une synthèse, pas un récit : aucun lien de projet ; l’appel mène au contact.
    await expect(page.locator('main a[href^="/projets"]')).toHaveCount(0);
    await expect(page.locator('main a[href="/contact"]').filter({ hasText: 'Discutons' })).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
});

test('le sommaire mène à chaque section et « Exploré » se replie', async ({ page, isMobile }, testInfo) => {
  await page.goto('/parcours/competences');
  const sommaire = isMobile
    ? page.getByRole('navigation', { name: 'Sections de la page', exact: true })
    : page.getByRole('navigation', { name: 'Dans cette page', exact: true });
  await expect(sommaire).toBeVisible();

  await sommaire.getByRole('link', { name: 'Intégration IA', exact: true }).click();
  await expect(page).toHaveURL(/#ia$/);
  await expect(page.getByRole('heading', { level: 2, name: 'Intégration IA', exact: true })).toBeInViewport();
  if (!isMobile) await expect(sommaire.locator('a[aria-current="location"]')).toHaveAttribute('href', '#ia');

  await sommaire.getByRole('link', { name: 'Compétences humaines', exact: true }).click();
  await expect(page.getByRole('heading', { level: 2, name: 'Compétences humaines', exact: true })).toBeInViewport();

  const explore = page.locator('#explore details');
  await explore.locator('summary').click();
  await expect(explore).not.toHaveAttribute('open', '');
  await expect(explore.locator('.explore__afficher')).toBeVisible();
  await expect(explore.locator('.explore__masquer')).toBeHidden();
  await explore.locator('summary').click();
  await expect(explore).toHaveAttribute('open', '');

  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('competences.png'), fullPage: true });
});

test('la chaîne de livraison se joue à son arrivée et se rejoue au clic', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Le rail animé s’efface sous 860 px : la liste se lit à la verticale.');
  await page.goto('/parcours/competences');
  const rail = page.getByRole('button', { name: /^Rejouer l’animation : la même image/ });
  await rail.scrollIntoViewIfNeeded();
  await expect(rail).toHaveClass(/animation-en-cours/);
  await expect(rail).not.toHaveClass(/animation-en-cours/, { timeout: 8_000 });
  await rail.click();
  await expect(rail).toHaveClass(/animation-en-cours/);
});

test.describe('mouvement réduit', () => {
  test.use({ reducedMotion: 'reduce' });

  test('le rail reste immobile, sceau posé à l’arrivée', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Le rail s’efface sous 860 px.');
    await page.goto('/parcours/competences');
    const rail = page.getByRole('button', { name: /^Rejouer l’animation : la même image/ });
    await rail.scrollIntoViewIfNeeded();
    await rail.click();
    await expect(rail).not.toHaveClass(/animation-en-cours/);
    const sceau = rail.locator('.chaine__sceau');
    const [boiteRail, boiteSceau] = await Promise.all([rail.boundingBox(), sceau.boundingBox()]);
    if (!boiteRail || !boiteSceau) throw new Error('Rail ou sceau absent');
    expect(boiteSceau.x - boiteRail.x).toBeGreaterThan(boiteRail.width * 0.75);
  });
});
