import { expect, test } from '@playwright/test';
import { surveillerConsole } from './support/navigateur';

const CHEMIN = '/projets/omnicard';

for (const javaScriptEnabled of [true, false]) {
  test.describe(`position de la galerie ${javaScriptEnabled ? 'avec' : 'sans'} JavaScript`, () => {
    test.use({ javaScriptEnabled, reducedMotion: 'reduce' });

    test('changer de capture au clic et au clavier garde l’image en place', async ({ page }) => {
      await page.goto(CHEMIN);
      await page.evaluate(async () => {
        await document.fonts.ready;
        const commande = document.querySelector('label[for="ecran-deck"]')!;
        window.scrollTo({ top: window.scrollY + commande.getBoundingClientRect().top - 220, behavior: 'instant' });
      });
      const position = await page.evaluate(() => window.scrollY);
      const image = page.locator('.oc-ecran:visible [data-oc-capture]');
      const hautImage = (await image.boundingBox())!.y;

      for (const ecran of ['deck', 'ouverture', 'collection']) {
        await page.locator(`label[for="ecran-${ecran}"]`).click();
        await expect(page.locator(`#ecran-${ecran}`)).toBeChecked();
        await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(position);
        expect((await image.boundingBox())!.y).toBeCloseTo(hautImage, 0);
      }

      await page.keyboard.press('ArrowRight');
      await expect(page.locator('#ecran-deck')).toBeChecked();
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(position);
      expect((await image.boundingBox())!.y).toBeCloseTo(hautImage, 0);
    });
  });
}

test('les univers révèlent les effets des cartes au clic et au clavier', async ({ page }) => {
  const erreurs = surveillerConsole(page);
  await page.goto(CHEMIN);
  const cartes = page.getByRole('group', { name: 'Explorer les univers et les effets des cartes' });
  await expect(cartes.getByText('Transformer.', { exact: true })).toBeVisible();

  // Chaque univers a aussi un label sur sa carte : choisir la commande textuelle.
  await cartes.locator('.oc-univers label[for="univers-gehrman"]').click();
  await expect(cartes.locator('#univers-gehrman')).toBeChecked();
  await expect(cartes.getByText('Invoquer.', { exact: true })).toBeVisible();
  await expect(cartes.getByText('Transformer.', { exact: true })).toBeHidden();

  await cartes.locator('#univers-gehrman').focus();
  await page.keyboard.press('ArrowRight');
  await expect(cartes.locator('#univers-jonathan')).toBeChecked();
  await expect(cartes.locator('#univers-jonathan')).toBeFocused();
  await expect(cartes.getByText('Transformer.', { exact: true })).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await expect(cartes.locator('#univers-floppa')).toBeChecked();
  await expect(cartes.locator('#univers-floppa')).toBeFocused();
  await expect(cartes.getByText('Combiner.', { exact: true })).toBeVisible();
  await expect(cartes.getByText('Transformer.', { exact: true })).toBeHidden();
  // Sur téléphone, le focus poursuit vers les actions sous l’éventail.
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Voir le jeu', exact: true })).toBeFocused();
  expect(erreurs).toEqual([]);
});

test('la galerie montre le deck puis le booster avec leurs explications', async ({ page }) => {
  const erreurs = surveillerConsole(page);
  await page.goto(CHEMIN);
  const galerie = page.getByRole('group', { name: 'Choisir un écran d’Omnicard' });
  await expect(galerie.getByRole('link', { name: 'Agrandir — Collectionner', exact: true })).toBeVisible();

  await galerie.locator('label[for="ecran-deck"]').click();
  await expect(galerie.locator('#ecran-deck')).toBeChecked();
  await expect(galerie.getByRole('link', { name: 'Agrandir — Composer son deck', exact: true })).toBeVisible();
  await expect(galerie.getByRole('link', { name: 'Agrandir — Collectionner', exact: true })).toBeHidden();
  await expect(galerie.locator('figcaption:visible')).toContainText('Un deck, c’est le jeu de cartes');

  await galerie.locator('#ecran-deck').focus();
  await page.keyboard.press('ArrowRight');
  await expect(galerie.locator('#ecran-ouverture')).toBeChecked();
  await expect(galerie.locator('#ecran-ouverture')).toBeFocused();
  await expect(galerie.getByRole('link', { name: 'Agrandir — Ouvrir un booster', exact: true })).toBeVisible();
  await expect(galerie.getByRole('link', { name: 'Agrandir — Composer son deck', exact: true })).toBeHidden();
  await expect(galerie.locator('figcaption:visible')).toContainText('Un booster est un paquet de cartes');
  expect(erreurs).toEqual([]);
});

test('une capture s’agrandit au clavier et Échap rend le focus à la bonne image', async ({ page }) => {
  const erreurs = surveillerConsole(page);
  // Mesurer la restitution du défilement après la mise au point, sans animation en cours.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(CHEMIN);
  await page.evaluate(() => document.fonts.ready);
  await page.locator('label[for="ecran-deck"]').click();
  const ouvrir = page.getByRole('link', { name: 'Agrandir — Composer son deck', exact: true });
  const dialogue = page.getByRole('dialog', { name: 'Capture d’Omnicard agrandie' });
  await ouvrir.focus();
  const position = await page.evaluate(() => ({
    x: window.scrollX,
    y: window.scrollY,
    overflow: document.documentElement.style.overflow,
  }));
  const source = await ouvrir.getAttribute('href');
  if (!source) throw new Error('La capture du deck doit avoir une adresse.');
  const description = await ouvrir.locator('img').getAttribute('alt');

  await page.keyboard.press('Enter');
  await expect(dialogue).toBeVisible();
  await expect(dialogue).toHaveAttribute('aria-busy', 'false');
  const image = dialogue.locator('img');
  await expect(image).toBeVisible();
  await expect(image).toHaveAttribute('src', new URL(source, page.url()).href);
  await expect(image).toHaveAttribute('alt', description ?? '');
  expect(await image.evaluate((element: HTMLImageElement) => element.naturalWidth)).toBeGreaterThan(0);
  await expect(dialogue.getByRole('button', { name: 'Fermer la capture' })).toBeFocused();
  await expect(page.locator('html')).toHaveCSS('overflow', 'hidden');

  await page.keyboard.press('Escape');
  await expect(dialogue).toBeHidden();
  await expect(ouvrir).toBeFocused();
  await expect.poll(() => page.evaluate(() => ({
    x: window.scrollX,
    y: window.scrollY,
    overflow: document.documentElement.style.overflow,
  }))).toEqual(position);
  expect(erreurs).toEqual([]);
});

test.describe('Omnicard sans JavaScript', () => {
  test.use({ javaScriptEnabled: false, reducedMotion: 'reduce' });

  test('les univers, la galerie et les liens vers les captures restent utilisables', async ({ page }) => {
    const erreurs = surveillerConsole(page);
    await page.goto(CHEMIN);
    const cartes = page.getByRole('group', { name: 'Explorer les univers et les effets des cartes' });
    await cartes.locator('.oc-univers label[for="univers-floppa"]').click();
    await expect(cartes.locator('#univers-floppa')).toBeChecked();
    await expect(cartes.getByText('Combiner.', { exact: true })).toBeVisible();
    await expect(cartes.getByText('Transformer.', { exact: true })).toBeHidden();

    const galerie = page.getByRole('group', { name: 'Choisir un écran d’Omnicard' });
    await galerie.locator('label[for="ecran-deck"]').click();
    await expect(galerie.getByRole('link', { name: 'Agrandir — Composer son deck', exact: true })).toBeVisible();
    await galerie.locator('#ecran-deck').focus();
    await page.keyboard.press('ArrowRight');
    await expect(galerie.locator('#ecran-ouverture')).toBeChecked();
    const capture = galerie.getByRole('link', { name: 'Agrandir — Ouvrir un booster', exact: true });
    await expect(capture).toBeVisible();
    await expect(galerie.getByRole('link', { name: 'Agrandir — Composer son deck', exact: true })).toBeHidden();

    for (const lien of await galerie.locator('a[data-oc-capture]').all()) {
      const adresse = await lien.getAttribute('href');
      if (!adresse) throw new Error('Chaque capture doit rester un lien vers son image.');
      const reponse = await page.request.get(adresse);
      expect(reponse.ok()).toBe(true);
      expect(reponse.headers()['content-type']).toMatch(/^image\//);
    }
    const adresse = await capture.getAttribute('href');
    await capture.click();
    expect(new URL(page.url()).pathname).toBe(adresse);
    expect(erreurs).toEqual([]);
  });
});
