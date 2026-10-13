import { expect, test, type Page } from '@playwright/test';
import { surveillerConsole } from './support/navigateur';

const CHEMIN = '/projets/league-of-database';
async function cadrerFiches(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  await page.locator('.lod-fiches').evaluate((element) => {
    const haut = document.querySelector('.entete')!.getBoundingClientRect().height
      + document.querySelector('.lod-sommaire')!.getBoundingClientRect().height + 12;
    window.scrollTo({ top: window.scrollY + element.getBoundingClientRect().top - haut, behavior: 'instant' });
  });
}

const RUBRIQUES = ['explorer', 'versions', 'anciennes-fiches', 'champions', 'objets', 'trafic', 'audience', 'sauvegardes', 'livraison'];

test('League of Database montre les usages avant son exploitation', async ({ page }) => {
  const erreurs = surveillerConsole(page);
  await page.goto(CHEMIN);
  for (const rubrique of RUBRIQUES) {
    await expect(page.locator(`#${rubrique}`)).toBeAttached();
  }
  const champions = page.locator('#champions');
  const trafic = page.locator('#trafic');
  const lecture = ['versions', 'anciennes-fiches', 'champions', 'objets', 'trafic'];
  expect(await page.evaluate((rubriques) => rubriques.every((rubrique, index) => {
    const suivante = rubriques[index + 1];
    return !suivante || Boolean(document.getElementById(rubrique)!
      .compareDocumentPosition(document.getElementById(suivante)!) & Node.DOCUMENT_POSITION_FOLLOWING);
  }), lecture)).toBe(true);
  await expect(page.locator('.lod-hero a.btn')).toHaveAttribute('href', 'https://www.league-of-data-base.com');
  await expect(page.locator('#versions img').first()).toBeVisible();
  await expect(page.locator('#anciennes-fiches')).toContainText('3.6.14');
  await champions.locator('[data-lod-capture]').first().scrollIntoViewIfNeeded();
  await champions.locator('img').first().evaluate((element: HTMLImageElement) => element.decode());
  await expect(champions.locator('img').first()).toBeVisible();
  await expect(page.locator('#objets img').first()).toBeVisible();
  await expect(trafic.locator('svg').first()).toBeVisible();
  await expect(page.locator('#sauvegardes svg').first()).toBeVisible();
  await expect(page.locator('#audience')).toContainText('Umami');
  expect(erreurs).toEqual([]);
});

test('les archives montrent le bon écran selon l’appareil et l’agrandissent en haute définition', async ({ page }) => {
  const erreurs = surveillerConsole(page);
  await page.goto(CHEMIN);
  const mobile = page.viewportSize()!.width < 800;
  const captures = [
    ['versions', 'historique-anciens-patchs'],
    ['versions', 'histoire-champions'],
    ['anciennes-fiches', 'histoire-ahri-statistiques'],
    ['anciennes-fiches', 'histoire-skins'],
  ];
  const dialogue = page.locator('[data-lod-dialog]');
  for (const [rubrique, nom] of captures) {
    const capture = page.locator(`#${rubrique} [data-lod-capture][href$="/${nom}.webp"]`);
    const image = capture.locator('img');
    await capture.scrollIntoViewIfNeeded();
    await image.evaluate((element: HTMLImageElement) => element.decode());
    const imageAffichee = await image.evaluate((element: HTMLImageElement) => ({
      source: element.currentSrc,
      largeur: element.naturalWidth,
      hauteur: element.naturalHeight,
      largeurAffichee: element.getBoundingClientRect().width,
    }));
    expect(new URL(imageAffichee.source).pathname).toMatch(new RegExp(`/${nom}${mobile ? '-mobile' : ''}(?:-\\d+)?\\.webp$`));
    expect(imageAffichee.largeurAffichee).toBeGreaterThan(100);
    await capture.focus();
    await page.keyboard.press('Enter');
    await expect(dialogue).toBeVisible();
    const originale = new URL(`/images/league-of-database/${nom}${mobile ? '-mobile' : ''}.webp`, page.url()).href;
    await expect(dialogue.locator('img')).toHaveAttribute('src', originale);
    await dialogue.locator('img').evaluate((element: HTMLImageElement) => element.decode());
    expect(await dialogue.locator('img').evaluate((element: HTMLImageElement) => ({
      largeur: element.naturalWidth, hauteur: element.naturalHeight,
    }))).toEqual({ largeur: mobile ? 860 : 2880, hauteur: mobile ? 1864 : 2000 });
    await expect(dialogue.locator('img')).toHaveAttribute('alt', await image.getAttribute('alt') ?? '');
    await page.keyboard.press('Escape');
    await expect(capture).toBeFocused();
  }
  expect(erreurs).toEqual([]);
});

test('les quatre fiches restent entières avec leurs commandes sur un écran court', async ({ page }) => {
  await page.goto(CHEMIN);
  const largeur = page.viewportSize()!.width;
  const ecrans = largeur < 800
    ? [page.viewportSize()!, { width: largeur, height: 667 }, { width: 320, height: 568 }, { width: 667, height: 375 }]
    : [page.viewportSize()!, { width: largeur, height: 600 }, { width: largeur, height: 400 }];
  for (const ecran of ecrans) {
    await page.setViewportSize(ecran);
    await cadrerFiches(page);
    // La première sélection doit aussi cadrer l’atelier si sa fin était hors écran.
    await page.evaluate(() => window.scrollBy({ top: -80, behavior: 'instant' }));
    await page.locator('label[for="fiche-ahri-capacites"]').click();
    for (const nom of ['ahri', 'ahri-capacites', 'ahri-skins', 'ahri-skin-detail']) {
      await page.locator(`label[for="fiche-${nom}"]`).click();
      const fiche = page.locator(`.lod-fiche--${nom}`);
      await expect(fiche).toBeVisible();
      await fiche.locator('img').evaluate((image: HTMLImageElement) => image.decode());
      await expect(fiche.locator('img')).toHaveCSS('object-fit', 'contain');
      expect(await page.evaluate((identifiant) => {
        const fiche = document.querySelector(`.lod-fiche--${identifiant}`)!;
        const commandes = document.querySelector('.lod-fiches__choix')!.getBoundingClientRect();
        const image = fiche.querySelector('img')!.getBoundingClientRect();
        const legende = fiche.querySelector('figcaption')!.getBoundingClientRect();
        const barre = document.querySelector('.lod-sommaire')!.getBoundingClientRect();
        const choix = [...document.querySelectorAll('.lod-fiches__choix label')].map((label) => label.getBoundingClientRect());
        return commandes.top >= barre.bottom
          && choix.every((cadre) => cadre.left >= 0 && cadre.right <= window.innerWidth)
          && image.top >= commandes.bottom
          && image.bottom <= window.innerHeight
          && legende.bottom <= window.innerHeight;
      }, nom)).toBe(true);
    }
  }
});

test('les captures League s’ouvrent au clavier et conservent la position', async ({ page }) => {
  const erreurs = surveillerConsole(page);
  await page.goto(CHEMIN);
  const ouvrir = page.locator('#champions [data-lod-capture]').first();
  const dialogue = page.locator('[data-lod-dialog]');
  await ouvrir.scrollIntoViewIfNeeded();
  await ouvrir.focus();
  const position = await page.evaluate(() => ({
    x: window.scrollX,
    y: window.scrollY,
    overflow: document.documentElement.style.overflow,
  }));
  await page.keyboard.press('Enter');
  await expect(dialogue).toBeVisible();
  await expect(dialogue).toHaveAttribute('open', '');
  expect(await dialogue.evaluate((element) => {
    const cadre = element.getBoundingClientRect();
    return cadre.width === window.innerWidth && cadre.height === window.innerHeight;
  })).toBe(true);
  const image = dialogue.locator('img:visible').first();
  await image.evaluate((element: HTMLImageElement) => element.decode());
  expect(await image.evaluate((element) => {
    const cadre = element.getBoundingClientRect();
    return cadre.width > 100 && cadre.height > 100
      && cadre.left >= 0 && cadre.top >= 0
      && cadre.right <= window.innerWidth && cadre.bottom <= window.innerHeight;
  })).toBe(true);
  await expect(page.locator('html')).toHaveCSS('overflow', 'hidden');
  await page.keyboard.press('Escape');
  await expect(dialogue).toBeHidden();
  await expect(ouvrir).toBeFocused();
  await expect.poll(() => page.evaluate(() => ({
    x: window.scrollX,
    y: window.scrollY,
    overflow: document.documentElement.style.overflow,
  }))).toEqual(position);

  await page.keyboard.press('Enter');
  await expect(dialogue).toBeVisible();
  await image.click();
  await expect(dialogue).toBeHidden();
  await expect(ouvrir).toBeFocused();
  expect(erreurs).toEqual([]);
});

test('une fiche encore en chargement garde la bonne vue dans le zoom', async ({ page }) => {
  let liberer!: () => void;
  const attente = new Promise<void>((resolve) => { liberer = resolve; });
  await page.route('**/*ahri-capacites*.webp', async (route) => {
    await attente;
    await route.continue();
  });
  try {
    await page.goto(CHEMIN);
    await cadrerFiches(page);
    await page.locator('label[for="fiche-ahri-capacites"]').click();
    const capture = page.locator('.lod-fiche--ahri-capacites [data-lod-capture]');
    await expect(capture).toHaveAttribute('aria-busy', 'true');
    await expect(capture.locator('[role="status"]')).toContainText('Chargement');
    await capture.click();
    const dialogue = page.locator('[data-lod-dialog]');
    await expect(dialogue).toBeVisible();
    const image = dialogue.locator('[data-lod-full]');
    const mobile = page.viewportSize()!.width < 800;
    await expect(image).toHaveAttribute('src', new URL(`/images/league-of-database/ahri-capacites${mobile ? '-mobile' : ''}.webp`, page.url()).href);
    await expect(dialogue.locator('.lod-visionneuse__image')).toHaveAttribute('aria-busy', 'true');
    await expect(dialogue.locator('[role="status"]')).toContainText('Chargement');
    liberer();
    await expect(dialogue.locator('.lod-visionneuse__image')).toHaveAttribute('aria-busy', 'false');
    await expect(dialogue.locator('[role="status"]')).toBeHidden();
    expect(await image.evaluate((element: HTMLImageElement) => element.naturalWidth)).toBe(mobile ? 860 : 2880);
    await page.keyboard.press('Escape');
    await expect(capture).toBeFocused();
    await expect(capture).toHaveAttribute('aria-busy', 'false');
  } finally {
    liberer();
    await page.unrouteAll({ behavior: 'wait' });
  }
});

test('un échec de chargement du zoom permet de revenir et de réessayer', async ({ page }) => {
  let demandes = 0;
  await page.route('**/images/league-of-database/histoire-champions.webp', async (route) => {
    if (++demandes === 1) await route.abort('failed');
    else await route.continue();
  });
  await page.goto(CHEMIN);
  const capture = page.locator('.lod-bureau [data-lod-capture]');
  const dialogue = page.locator('[data-lod-dialog]');
  await capture.focus();
  await page.keyboard.press('Enter');
  await expect(dialogue.locator('[role="status"]')).toContainText('Capture indisponible');
  await expect(dialogue.locator('.lod-visionneuse__image')).toHaveAttribute('aria-busy', 'false');
  await page.keyboard.press('Escape');
  await expect(capture).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(dialogue).toBeVisible();
  await expect(dialogue.locator('.lod-visionneuse__image')).toHaveAttribute('aria-busy', 'false');
  await expect(dialogue.locator('[role="status"]')).toBeHidden();
  expect(await dialogue.locator('[data-lod-full]').evaluate((image: HTMLImageElement) => image.naturalWidth)).toBe(2880);
  expect(demandes).toBe(2);
  await page.keyboard.press('Escape');
  await expect(capture).toBeFocused();
});

test('le zoom réserve la place de son aide sur petit écran et en paysage', async ({ page }) => {
  await page.goto(CHEMIN);
  for (const ecran of [{ width: 320, height: 568 }, { width: 667, height: 375 }]) {
    await page.setViewportSize(ecran);
    await cadrerFiches(page);
    await page.locator('label[for="fiche-ahri-capacites"]').click();
    const capture = page.locator('.lod-fiche--ahri-capacites [data-lod-capture]');
    await capture.click();
    const dialogue = page.locator('[data-lod-dialog]');
    await expect(dialogue).toBeVisible();
    await expect(dialogue.locator('.lod-visionneuse__image')).toHaveAttribute('aria-busy', 'false');
    expect(await dialogue.evaluate((element) => {
      const image = element.querySelector('img')!.getBoundingClientRect();
      const bouton = element.querySelector('button')!.getBoundingClientRect();
      const aide = element.querySelector('p')!.getBoundingClientRect();
      return image.width > 40 && image.height > 40
        && image.left >= bouton.left && image.right <= bouton.right
        && image.top >= bouton.top && image.bottom <= bouton.bottom
        && image.bottom < aide.top && aide.bottom <= window.innerHeight;
    })).toBe(true);
    await page.keyboard.press('Escape');
    await expect(capture).toBeFocused();
  }
});

test('les onglets d’Ahri se parcourent au clavier et agrandissent la capture affichée', async ({ page }) => {
  const erreurs = surveillerConsole(page);
  await page.goto(CHEMIN);
  const champion = page.locator('#fiche-ahri');
  const capacites = page.locator('#fiche-ahri-capacites');
  const ecran = page.locator('.lod-fiche--ahri-capacites');
  await cadrerFiches(page);
  await champion.focus();
  const position = await page.evaluate(() => window.scrollY);
  await page.keyboard.press('ArrowRight');
  await expect(capacites).toBeChecked();
  await expect(capacites).toBeFocused();
  await expect(ecran).toBeVisible();
  await expect(page.locator('.lod-fiche--ahri')).toBeHidden();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(position);

  const capture = ecran.locator('[data-lod-capture]');
  const apercu = capture.locator('img');
  await apercu.evaluate((image: HTMLImageElement) => image.decode());
  const mobile = page.viewportSize()!.width < 800;
  const source = new URL(`/images/league-of-database/ahri-capacites${mobile ? '-mobile' : ''}.webp`, page.url()).href;
  expect(new URL(await apercu.evaluate((image: HTMLImageElement) => image.currentSrc)).pathname)
    .toMatch(new RegExp(`/ahri-capacites${mobile ? '-mobile' : ''}(?:-\\d+)?\\.webp$`));
  await capture.focus();
  await page.keyboard.press('Enter');
  const dialogue = page.locator('[data-lod-dialog]');
  await expect(dialogue).toBeVisible();
  await expect(dialogue.locator('img')).toHaveAttribute('src', source);
  await expect(dialogue.locator('img')).toHaveAttribute('alt', await apercu.getAttribute('alt') ?? '');
  await page.keyboard.press('Escape');
  await expect(capture).toBeFocused();

  await expect(dialogue).toBeHidden();
  await capacites.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#fiche-ahri-skins')).toBeChecked();
  await expect(page.locator('#fiche-ahri-skins')).toBeFocused();
  await page.keyboard.press('ArrowRight');
  const detail = page.locator('#fiche-ahri-skin-detail');
  await expect(detail).toBeChecked();
  await expect(detail).toBeFocused();
  await expect(ecran).toBeHidden();
  const detailCapture = page.locator('.lod-fiche--ahri-skin-detail [data-lod-capture]');
  await expect(detailCapture).toBeVisible();
  const detailImage = detailCapture.locator('img');
  await detailImage.evaluate((image: HTMLImageElement) => image.decode());
  const detailSource = new URL(`/images/league-of-database/ahri-skin-detail${mobile ? '-mobile' : ''}.webp`, page.url()).href;
  expect(new URL(await detailImage.evaluate((image: HTMLImageElement) => image.currentSrc)).pathname)
    .toMatch(new RegExp(`/ahri-skin-detail${mobile ? '-mobile' : ''}(?:-\\d+)?\\.webp$`));
  await detailCapture.focus();
  await page.keyboard.press('Enter');
  await expect(dialogue).toBeVisible();
  await expect(dialogue.locator('img')).toHaveAttribute('src', detailSource);
  await expect(dialogue.locator('img')).toHaveAttribute('alt', await detailImage.getAttribute('alt') ?? '');
  await page.keyboard.press('Escape');
  await expect(detailCapture).toBeFocused();
  expect(erreurs).toEqual([]);
});

test.describe('League of Database sans JavaScript', () => {
  test.use({ javaScriptEnabled: false, reducedMotion: 'reduce' });

  test('les captures restent accessibles et les schémas lisibles', async ({ page }) => {
    const erreurs = surveillerConsole(page);
    await page.goto(CHEMIN);
    await expect(page.locator('[data-lod-dialog]')).toBeHidden();
    await expect(page.locator('#trafic svg').first()).toBeVisible();
    await expect(page.locator('#sauvegardes svg').first()).toBeVisible();
    const captures = page.locator('a[data-lod-capture]');
    expect(await captures.count()).toBeGreaterThanOrEqual(4);
    const adresses = await captures.evaluateAll((elements) => [...new Set(elements.map((element) => (element as HTMLAnchorElement).href))]);
    for (const adresse of adresses) {
      const reponse = await page.request.get(adresse);
      expect(reponse.ok()).toBe(true);
      expect(reponse.headers()['content-type']).toMatch(/^image\//);
    }
    const capture = page.locator('#champions a[data-lod-capture]').first();
    const adresse = await capture.getAttribute('href');
    expect(adresse).toBeTruthy();
    await capture.click();
    expect(new URL(page.url()).pathname).toBe(adresse);
    expect(erreurs).toEqual([]);
  });
});
