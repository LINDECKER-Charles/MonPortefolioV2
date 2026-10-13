import { expect, test } from '@playwright/test';
import { surveillerConsole } from './support/navigateur';

test('GUP ne met à jour que les logiciels choisis et permet de recommencer', async ({ page }) => {
  const erreurs = surveillerConsole(page);
  await page.goto('/projets/gup');
  const demo = page.locator('[data-gup-demo]');
  const lancer = demo.locator('[data-gup-update]');
  await expect(lancer).toBeDisabled();
  await demo.locator('input[value="Git"]').check();
  await demo.locator('input[value="Ruff"]').check();
  await expect(demo.locator('[data-gup-status]')).toHaveText('2 logiciels sélectionnés.');
  await lancer.click();
  await expect(demo.locator('[data-gup-status]')).toHaveText('2 logiciels mis à jour dans cette démonstration.');
  await expect(demo.locator('[data-gup-package]').filter({ has: page.locator('input[value="Git"]') }).locator('[data-gup-version]')).toHaveText('2.52.0');
  await expect(demo.locator('[data-gup-package]').filter({ has: page.locator('input[value="TypeScript"]') }).locator('[data-gup-version]')).toHaveText('6.0.2');
  await demo.locator('[data-gup-reset]').click();
  await expect(demo.locator('input:checked')).toHaveCount(0);
  await expect(lancer).toBeDisabled();
  await expect(demo.locator('input[value="Git"]')).toBeFocused();
  expect(erreurs).toEqual([]);
});

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
