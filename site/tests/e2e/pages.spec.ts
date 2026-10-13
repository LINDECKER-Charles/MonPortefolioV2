import { expect, test } from '@playwright/test';
import { PAGES, surveillerConsole } from './support/navigateur';

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

test('la fin du récit mène à la vitrine et à des projets qui se répondent', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('navigation', { name: 'Pour aller plus loin', exact: true }).locator('a[href="/projets"]').click();
  await expect(page).toHaveURL(/\/projets$/);
  await page.locator('[data-project-card="pvz"]').getByRole('link', { name: 'Page du projet PVZF Translation', exact: true }).click();
  await expect(page).toHaveURL(/\/projets\/pvz-fusion$/);
  // La sortie commune des pages de projet mène au projet suivant de la vitrine.
  await page.locator('#retiens').getByRole('link', { name: /Projet suivant/ }).click();
  await expect(page).toHaveURL(/\/projets\/league-of-database$/);
  await page.locator('main a[href="/projets/bloodborne-legendary-run"]').first().click();
  await expect(page).toHaveURL(/\/projets\/bloodborne-legendary-run$/);
  await page.locator('main a[href="/projets/gup"]').first().click();
  await expect(page).toHaveURL(/\/projets\/gup$/);
});

test('le blog ne publie aucun article fictif', async ({ page }) => {
  await page.goto('/blog');
  await expect(page.locator('main')).toContainText(/aucun article|pas encore d’article/i);
  await expect(page.locator('main time')).toHaveCount(0);
});
