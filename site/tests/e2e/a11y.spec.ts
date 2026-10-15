import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { PAGES } from './support/navigateur';

/**
 * Accessibilité : zéro violation axe-core, WCAG 2.2 A/AA et bonnes pratiques,
 * à chaque largeur et dans les deux thèmes — le mode nuit tient les mêmes
 * contrastes que le jour (design system, § Accessibilité).
 *
 * Mouvement réduit : le contraste se mesure sur l'état final, pas au milieu
 * du tracé de la figure 1.
 */
test.use({ reducedMotion: 'reduce' });

const REGLES = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

async function violations(page: Page) {
  // Les planches arrivent à l'approche : on parcourt la page pour tout afficher.
  const hauteur = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < hauteur; y += 800) await page.evaluate((position) => window.scrollTo({ top: position, behavior: 'instant' }), y);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  const resultats = await new AxeBuilder({ page }).withTags(REGLES).analyze();
  return resultats.violations.map((v) => ({
    regle: v.id,
    impact: v.impact,
    aide: v.help,
    cibles: v.nodes.slice(0, 5).map((n) => n.target.join(' ')),
  }));
}

for (const theme of ['jour', 'nuit'] as const) {
  test.describe(`thème ${theme}`, () => {
    test.use({ colorScheme: theme === 'nuit' ? 'dark' : 'light' });

    for (const chemin of PAGES) {
      test(`axe : ${chemin}`, async ({ page }) => {
        await page.goto(chemin);
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
        expect(await violations(page)).toEqual([]);
        if (chemin === '/') {
          await page.locator('#discutons').scrollIntoViewIfNeeded();
          const contact = await new AxeBuilder({ page }).withTags(REGLES).include('#discutons').analyze();
          expect(contact.violations.map((v) => ({ id: v.id, cibles: v.nodes.map((n) => n.target) }))).toEqual([]);
        }
      });
    }

    test('axe : la page 404', async ({ page }) => {
      const reponse = await page.goto('/cette-adresse-n-existe-pas');
      expect(reponse?.status()).toBe(404);
      expect(await violations(page)).toEqual([]);
    });
  });
}

test('axe : une définition du glossaire ouverte', async ({ page }) => {
  await page.goto('/');
  const mot = page.locator('button.terme[data-terme="deck"]');
  await mot.scrollIntoViewIfNeeded();
  await mot.click();
  await expect(page.locator('#terme-deck')).toBeVisible();
  const resultats = await new AxeBuilder({ page }).withTags(REGLES).include('#terme-deck').analyze();
  expect(resultats.violations.map((v) => v.id)).toEqual([]);
});
