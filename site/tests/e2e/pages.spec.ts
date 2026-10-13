import { expect, test } from '@playwright/test';
import { VITRINE } from '../../src/config/projets';
import { PAGES, surveillerConsole } from './support/navigateur';

/** Un nom de projet, lu tel quel dans une expression régulière. */
const exact = (texte: string) => texte.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const nouvellesPages = PAGES.filter((chemin) => chemin !== '/' && chemin !== '/mentions-legales');

for (const chemin of nouvellesPages) {
  test(`page statique et maillage : ${chemin}`, async ({ page }) => {
    const erreurs = surveillerConsole(page);
    const reponse = await page.goto(chemin);
    expect(reponse?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://charles-lindecker.com${chemin}`);
    await expect(page.getByRole('contentinfo').getByRole('link', { name: 'Projets', exact: true })).toHaveAttribute('href', '/projets');
    await expect(page.getByRole('banner').getByRole('link', { name: 'Contact', exact: true })).toHaveAttribute('href', '/contact');
    await expect(page.locator('main a[href="/"]').first()).toBeVisible();
    await page.waitForLoadState('networkidle');
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
    expect(erreurs).toEqual([]);
  });
}

test('la fin du récit mène à la vitrine, puis d’un projet au suivant dans l’ordre de la vitrine', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('navigation', { name: 'Pour aller plus loin', exact: true }).locator('a[href="/projets"]').click();
  await expect(page).toHaveURL(/\/projets$/);
  const [premier, ...suivants] = VITRINE;
  await page.locator(`#${premier.id}`).getByRole('link', { name: premier.nom, exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`${exact(premier.href)}$`));
  // La sortie commune des pages de projet (#retiens) suit l’ordre de VITRINE
  // (config/projets.ts) : chaque page mène à la suivante, et renvoie à la précédente.
  let precedent = premier;
  for (const projet of suivants) {
    const voisins = page.locator('#retiens').getByRole('navigation', { name: 'Autres projets', exact: true });
    await expect(voisins.getByRole('link', { name: /^Projet suivant/ })).toHaveCount(1);
    await voisins.getByRole('link', { name: new RegExp(`^Projet suivant\\s*${exact(projet.nom)}`) }).click();
    await expect(page).toHaveURL(new RegExp(`${exact(projet.href)}$`));
    await expect(page.locator('#retiens').getByRole('link', { name: new RegExp(`^Projet précédent\\s*${exact(precedent.nom)}`) })).toHaveAttribute('href', precedent.href);
    precedent = projet;
  }
  // Le dernier projet de la vitrine n’a pas de suivant : la sortie ramène à la vitrine.
  const sortie = page.locator('#retiens');
  await expect(sortie.getByRole('link', { name: /^Projet suivant/ })).toHaveCount(0);
  await sortie.getByRole('link', { name: /^Tous les projets/ }).click();
  await expect(page).toHaveURL(/\/projets$/);
});

test('le blog ne publie aucun article fictif', async ({ page }) => {
  await page.goto('/blog');
  await expect(page.locator('main')).toContainText(/aucun article|pas encore d’article/i);
  await expect(page.locator('main time')).toHaveCount(0);
});
