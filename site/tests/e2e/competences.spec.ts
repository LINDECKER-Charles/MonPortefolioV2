import { expect, test } from '@playwright/test';

test.use({ javaScriptEnabled: false, reducedMotion: 'reduce' });

test('les familles de stacks et les compétences humaines restent faciles à parcourir', async ({ page }, testInfo) => {
  await page.goto('/parcours/competences');
  const synthese = page.locator('.competences-synthese');
  const technologies = synthese.getByRole('region', { name: 'Technologies pratiquées' });
  const humaines = synthese.getByRole('region', { name: 'Compétences humaines' });

  await expect(technologies.getByText('Angular', { exact: true })).toBeVisible();
  await expect(technologies.getByText('ASP.NET Core', { exact: true })).toBeVisible();
  await expect(technologies.getByText('Rust', { exact: true })).toBeVisible();
  await expect(technologies.getByText('Photino.NET', { exact: true })).toBeVisible();
  await expect(technologies.getByRole('link', { name: 'Angular', exact: true })).toHaveAttribute('href', 'https://angular.dev/');
  await expect(technologies.getByRole('link', { name: 'MCP', exact: true })).toHaveAttribute('href', 'https://modelcontextprotocol.io/');
  await expect(humaines.getByRole('heading', { name: 'Pédagogie', exact: true })).toBeVisible();
  await expect(synthese.locator('a[href^="/projets"]')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  for (const famille of await synthese.locator('.domaine').all()) {
    await famille.scrollIntoViewIfNeeded();
    for (const outil of await famille.locator('.stack li').all()) {
      const lien = outil.getByRole('link');
      await expect(lien).toHaveCount(1);
      await expect(lien).toHaveAttribute('href', /^https:\/\//);
      await expect(lien.locator('.logo-stack')).toHaveCount(1);
      await expect(lien.locator('.logo-stack')).toBeVisible();
    }
    for (const logo of await famille.locator('img').all()) {
      await expect(logo).toBeVisible();
      await expect.poll(() => logo.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
    }
  }

  await synthese.getByRole('navigation', { name: 'Sommaire des compétences' }).getByRole('link', { name: 'Compétences humaines', exact: true }).click();
  await expect(humaines.getByRole('heading', { name: 'Compétences humaines', exact: true })).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await humaines.screenshot({ path: testInfo.outputPath('competences-humaines.png') });
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await page.screenshot({ path: testInfo.outputPath('competences.png'), fullPage: true });
});
