import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { surveillerConsole } from './support/navigateur';

const PROJETS = [
  { id: 'bloodborne', nom: 'Bloodborne Legendary Run', chemin: '/projets/bloodborne-legendary-run' },
  { id: 'gup', nom: 'GUP', chemin: '/projets/gup' },
  { id: 'pvz', nom: 'PVZF Translation', chemin: '/projets/pvz-fusion' },
] as const;
const REGLES = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

function entreeProjet(page: Page, projet: (typeof PROJETS)[number]) {
  return page.locator(`[data-project-card="${projet.id}"]`).getByRole('link', {
    name: `Page du projet ${projet.nom}`, exact: true,
  });
}

async function verifierThemes(page: Page) {
  const visibles = page.locator('[data-project-card]:visible');
  await expect(visibles).toHaveCount(3);
  const jeux = page.locator('[data-project-section="jeux"]');
  const outils = page.locator('[data-project-section="outils"]');
  await expect(jeux.locator('[data-project-card]')).toHaveCount(2);
  await expect(jeux.locator('[data-project-card="bloodborne"]')).toBeVisible();
  await expect(jeux.locator('[data-project-card="pvz"]')).toBeVisible();
  await expect(outils.locator('[data-project-card]')).toHaveCount(1);
  await expect(outils.locator('[data-project-card="gup"]')).toBeVisible();
  for (const theme of ['jeux', 'outils']) {
    const lien = page.locator(`[data-project-theme="${theme}"]`);
    await expect(lien).toHaveAttribute('href', `#theme-${theme}`);
    await lien.focus();
    await page.keyboard.press('Enter');
    expect(new URL(page.url()).hash).toBe(`#theme-${theme}`);
    await expect(page.locator(`[data-project-section="${theme}"]`)).toBeInViewport();
    await expect(visibles).toHaveCount(3);
  }
}

test('la vedette mène directement à la page du projet au clavier', async ({ page }) => {
  const erreurs = surveillerConsole(page);
  await page.goto('/projets');
  const vedette = page.locator('[data-featured-project="bloodborne"]');
  await expect(vedette.getByRole('img', { name: /constellation|objectifs/i })).toBeVisible();
  await expect(vedette.getByRole('link')).toHaveCount(1);
  await expect(page.locator('dialog')).toHaveCount(0);
  await expect(page.getByRole('link', { name: /Ouvrir l’aperçu/ })).toHaveCount(0);
  const lien = vedette.getByRole('link', { name: 'Page du projet', exact: true });
  await expect(lien).toHaveAttribute('href', '/projets/bloodborne-legendary-run');
  await expect(lien).not.toHaveAttribute('aria-haspopup');
  await lien.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/projets\/bloodborne-legendary-run$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  expect(erreurs).toEqual([]);
});

test('les centres d’intérêt mènent à leurs sections sans masquer les projets', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/projets');
  await verifierThemes(page);
  await expect(page.locator('[data-featured-project="bloodborne"]')).toBeVisible();
});

for (const projet of PROJETS) {
  test(`la carte ${projet.id} mène directement à sa page au clavier`, async ({ page }) => {
    const erreurs = surveillerConsole(page);
    await page.goto('/projets');
    const entree = entreeProjet(page, projet);
    await expect(entree).toHaveAttribute('href', projet.chemin);
    await entree.focus();
    await page.keyboard.press('Enter');
    await expect.poll(() => new URL(page.url()).pathname).toBe(projet.chemin);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(erreurs).toEqual([]);
  });

  test(`le visuel ${projet.id} ouvre directement sa page`, async ({ page }) => {
    await page.goto('/projets');
    const visuel = page.locator(`[data-project-card="${projet.id}"]`).getByRole('link', {
      name: `Voir le projet ${projet.nom}`, exact: true,
    });
    await expect(visuel).toHaveAttribute('href', projet.chemin);
    await visuel.click();
    await expect.poll(() => new URL(page.url()).pathname).toBe(projet.chemin);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
}

test('les projets archivés restent discrets et repliés', async ({ page }) => {
  await page.goto('/projets');
  const archives = page.locator('#projets-archives');
  await expect(archives).not.toHaveAttribute('open');
  await expect(archives.locator('summary')).toHaveText('Projets archivés');
  await archives.locator('summary').click();
  await expect(archives).toHaveAttribute('open', '');
  await expect(archives.getByText('Aucun projet archivé pour le moment.')).toBeVisible();
});

for (const theme of ['jour', 'nuit'] as const) {
  test.describe(`hub en thème ${theme}`, () => {
    test.use({ colorScheme: theme === 'nuit' ? 'dark' : 'light', reducedMotion: 'reduce' });

    test('axe : les projets et leurs liens directs', async ({ page }) => {
      await page.goto('/projets');
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      const resultats = await new AxeBuilder({ page }).withTags(REGLES).analyze();
      expect(resultats.violations.map((violation) => ({
        regle: violation.id,
        impact: violation.impact,
        aide: violation.help,
        cibles: violation.nodes.map((noeud) => noeud.target),
      }))).toEqual([]);
    });
  });
}

test.describe('le hub sans JavaScript', () => {
  test.use({ javaScriptEnabled: false, reducedMotion: 'reduce' });

  test('les thèmes mènent à leurs sections en gardant les trois projets visibles', async ({ page }) => {
    await page.goto('/projets');
    await verifierThemes(page);
  });

  for (const projet of PROJETS) {
    test(`le lien ${projet.id} ouvre sa page sans JavaScript`, async ({ page }) => {
      await page.goto('/projets');
      const entree = entreeProjet(page, projet);
      await expect(entree).toHaveAttribute('href', projet.chemin);
      await entree.click();
      await expect.poll(() => new URL(page.url()).pathname).toBe(projet.chemin);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });
  }

  test('la vedette ouvre sa page sans JavaScript', async ({ page }) => {
    await page.goto('/projets');
    const lien = page.locator('[data-featured-project="bloodborne"]').getByRole('link', {
      name: 'Page du projet', exact: true,
    });
    await expect(lien).toHaveAttribute('href', '/projets/bloodborne-legendary-run');
    await lien.click();
    await expect(page).toHaveURL(/\/projets\/bloodborne-legendary-run$/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});
