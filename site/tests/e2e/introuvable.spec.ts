import { expect, test } from '@playwright/test';
import { fileDeMesure } from './support/navigateur';

/**
 * Une adresse inconnue : le vrai statut 404, une page qui dit quoi faire, hors
 * index, et l'origine du lien cassé mesurée pour le réparer.
 */
test('une adresse inconnue rend la page 404 du site, avec son statut', async ({ page }) => {
  const reponse = await page.goto('/une-page-qui-n-existe-pas');
  expect(reponse?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Cette page ne figure pas dans ce mode d’emploi.');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Revenir à l’accueil' })).toHaveAttribute('href', '/');
  await expect.poll(() => fileDeMesure(page)).toContainEqual(['erreur-404', { origine: 'directe' }]);
});

test('/404.html demandé par son nom reste une erreur', async ({ request }) => {
  const reponse = await request.get('/404.html');
  expect(reponse.status()).toBe(404);
});
