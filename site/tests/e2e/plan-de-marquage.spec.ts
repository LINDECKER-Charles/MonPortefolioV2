import { expect, test } from '@playwright/test';
import { fileDeMesure, PAGES } from './support/navigateur';
import { problemesEvenement } from './plan-de-marquage';

/**
 * Plan de marquage, page par page : chaque attribut `data-umami-*` appartient
 * au dictionnaire, tout lien `mailto:` est mesuré avec son emplacement, tout
 * lien sortant porte le nom d'hôte de sa cible. Et ce que `mesurer()` envoie
 * au fil de la lecture respecte les mêmes règles.
 */

for (const chemin of PAGES) {
  test(`plan de marquage : ${chemin}`, async ({ page }) => {
    await page.goto(chemin);
    const marques = await page.locator('[data-umami-event]').evaluateAll((elements) =>
      elements.map((element) => ({
        nom: element.getAttribute('data-umami-event') ?? '',
        href: element instanceof HTMLAnchorElement ? element.href : undefined,
        donnees: Object.fromEntries(
          element
            .getAttributeNames()
            .filter((a) => a.startsWith('data-umami-event-'))
            .map((a) => [a.slice('data-umami-event-'.length), element.getAttribute(a) ?? '']),
        ),
      })),
    );
    const problemes = marques.flatMap(({ nom, donnees, href }) => problemesEvenement(nom, donnees, href));

    const liens = await page.locator('a[href]').evaluateAll((elements) =>
      elements.map((e) => ({ href: (e as HTMLAnchorElement).href, evenement: e.getAttribute('data-umami-event') })),
    );
    for (const { href, evenement } of liens) {
      if (href.startsWith('mailto:') && evenement !== 'contact-email') {
        problemes.push(`${href} : data-umami-event="contact-email" attendu`);
      }
      const externe = /^https?:/.test(href) && new URL(href).host !== new URL(page.url()).host;
      if (externe && evenement !== 'lien-sortant') {
        problemes.push(`${href} : data-umami-event="lien-sortant" attendu`);
      }
    }
    expect(problemes).toEqual([]);
  });
}

test('ce que la lecture envoie respecte le dictionnaire', async ({ page }) => {
  await page.goto('/');
  const hauteur = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < hauteur; y += 500) {
    await page.evaluate((position) => window.scrollTo({ top: position, behavior: 'instant' }), y);
    await page.waitForTimeout(30);
  }
  await page.getByRole('button', { name: 'Mode nuit' }).click();
  const evenements = await fileDeMesure(page);
  expect(evenements.filter(([nom]) => nom === 'lecture').map(([, donnees]) => donnees?.chapitre)).toEqual(['origine', 'aujourdhui', 'discutons']);
  expect(evenements).toContainEqual(['theme', { choix: 'nuit' }]);
  expect(evenements).toHaveLength(4);
  expect(evenements.flatMap(([nom, donnees]) => problemesEvenement(nom, donnees ?? {}))).toEqual([]);
});
