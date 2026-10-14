import { expect, test } from '@playwright/test';
import { surveillerConsole } from './support/navigateur';

test('la traduction passe du chinois au français sans lancer le jeu', async ({ page }) => {
  const erreurs = surveillerConsole(page);
  await page.goto('/projets/pvz-fusion');
  const demo = page.locator('[data-pvz-traduction]');
  await expect(demo.locator('#extraits-francais')).toBeVisible();
  await demo.getByRole('button', { name: 'Texte d’origine', exact: true }).click();
  await expect(demo.locator('#extraits-origine')).toBeVisible();
  await expect(demo.locator('#extraits-origine')).toContainText('选择你的植物');
  await expect(demo.locator('#extraits-francais')).toBeHidden();
  await demo.getByRole('button', { name: 'Français', exact: true }).click();
  await expect(demo.locator('#extraits-francais')).toContainText('Choisissez Vos Plantes');
  await expect(demo.locator('#extraits-francais button, #extraits-francais a')).toHaveCount(0);
  expect(erreurs).toEqual([]);
});
