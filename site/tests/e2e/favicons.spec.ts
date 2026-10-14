import { expect, test } from '@playwright/test';

/**
 * Vérifie les déclarations, les réponses HTTP et le décodage réel des trois
 * formats. Playwright ne photographie pas la barre d’onglets du navigateur.
 * Les fonds colorés et les petites tailles sont contrôlés dans favicons.test.ts.
 */
for (const colorScheme of ['light', 'dark'] as const) {
  for (const javaScriptEnabled of [true, false]) {
    test.describe(`${colorScheme}, JavaScript ${javaScriptEnabled ? 'actif' : 'inactif'}`, () => {
      test.use({ colorScheme, javaScriptEnabled });

      test('le favicon reste disponible sur le site et dans l’atelier', async ({ page, request }) => {
        for (const route of ['/', '/contact', '/backoffice']) {
          await page.goto(route);
          const liens = page.locator('link[rel="icon"]');
          await expect(liens).toHaveCount(3);
          const icones = await liens.evaluateAll((elements) => elements.map((element) => ({
            href: (element as HTMLLinkElement).href,
            type: (element as HTMLLinkElement).type,
            media: (element as HTMLLinkElement).media,
          })));
          for (const icone of icones) {
            expect(icone.media).toBe('');
            expect(new URL(icone.href).searchParams.get('v')).toBeTruthy();
            const reponse = await request.get(icone.href);
            expect(reponse.status()).toBe(200);
            expect(reponse.headers()['content-type']).toContain(icone.type);
          }
          // Images déclarées dans le HTML : Firefox sans JavaScript ne résout
          // pas Image.decode() sur une image détachée créée par le banc de test.
          await page.setContent(`<!doctype html><html lang="fr"><body>${icones.map(({ href }) => `<img src="${href}" alt="Favicon">`).join('')}</body></html>`);
          for (const image of await page.locator('img').all()) {
            await expect.poll(() => image.evaluate((img) => (img as HTMLImageElement).complete && (img as HTMLImageElement).naturalWidth > 0)).toBe(true);
            const taille = await image.evaluate((img) => [(img as HTMLImageElement).naturalWidth, (img as HTMLImageElement).naturalHeight]);
            expect(taille[0]).toBeGreaterThanOrEqual(16);
            expect(taille[0]).toBe(taille[1]);
          }
        }
      });
    });
  }
}
