import { expect, test, type Locator, type Page } from '@playwright/test';
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

const DIMENSIONS_CAPTURE = { bureau: { largeur: 2880, hauteur: 2000 }, mobile: { largeur: 860, hauteur: 1864 } };
const DIMENSIONS_STATISTIQUES = { bureau: { largeur: 672, hauteur: 1302 }, mobile: { largeur: 764, hauteur: 1302 } };

async function verifierCaptureEtZoom(page: Page, capture: Locator, nom: string, dimensions = DIMENSIONS_CAPTURE) {
  const mobile = page.viewportSize()!.width < 800;
  const image = capture.locator('img');
  await capture.scrollIntoViewIfNeeded();
  await image.evaluate((element: HTMLImageElement) => element.decode());
  expect(new URL(await image.evaluate((element: HTMLImageElement) => element.currentSrc)).pathname)
    .toMatch(new RegExp(`/${nom}${mobile ? '-mobile' : ''}(?:-\\d+)?\\.webp$`));
  await expect(image).toBeVisible();
  await capture.focus();
  await page.keyboard.press('Enter');
  const dialogue = page.locator('[data-lod-dialog]');
  await expect(dialogue).toBeVisible();
  const originale = new URL(`/images/league-of-database/${nom}${mobile ? '-mobile' : ''}.webp`, page.url()).href;
  await expect(dialogue.locator('img')).toHaveAttribute('src', originale);
  await dialogue.locator('img').evaluate((element: HTMLImageElement) => element.decode());
  expect(await dialogue.locator('img').evaluate((element: HTMLImageElement) => ({
    largeur: element.naturalWidth, hauteur: element.naturalHeight,
  }))).toEqual(mobile ? dimensions.mobile : dimensions.bureau);
  await expect(dialogue.locator('img')).toHaveAttribute('alt', await image.getAttribute('alt') ?? '');
  await page.keyboard.press('Escape');
  await expect(dialogue).toBeHidden();
  await expect(capture).toBeFocused();
}

async function lireValeurs(vue: Locator) {
  return vue.locator('.lod-valeurs').evaluate((element) => Object.fromEntries(
    [...element.querySelectorAll('div')].map((valeur) => [
      valeur.querySelector('dt')!.textContent!.trim(), valeur.querySelector('dd')!.textContent!.trim(),
    ]),
  ));
}

const RUBRIQUES = ['explorer', 'versions', 'anciennes-fiches', 'champions', 'objets', 'langues', 'fabrication', 'trafic', 'audience', 'sauvegardes', 'livraison'];

test('League of Database montre les usages avant son exploitation', async ({ page }) => {
  const erreurs = surveillerConsole(page);
  await page.goto(CHEMIN);
  for (const rubrique of RUBRIQUES) {
    await expect(page.locator(`#${rubrique}`)).toBeAttached();
  }
  const champions = page.locator('#champions');
  const trafic = page.locator('#trafic');
  const lecture = ['versions', 'anciennes-fiches', 'champions', 'objets', 'langues', 'fabrication', 'trafic'];
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
  const captures = [
    ['explorer', 'histoire-ahri'],
    ['anciennes-fiches', 'histoire-champions'],
    ['anciennes-fiches', 'histoire-skins'],
  ];
  for (const [rubrique, nom] of captures) {
    const capture = page.locator(`#${rubrique} [data-lod-capture][href$="/${nom}.webp"]`);
    await verifierCaptureEtZoom(page, capture, nom);
  }
  expect(erreurs).toEqual([]);
});

test('choisir un ancien patch retrouve ses valeurs et agrandit leur preuve', async ({ page }) => {
  const erreurs = surveillerConsole(page);
  await page.goto(CHEMIN);
  const archive = page.locator('#version-archive');
  const actuel = page.locator('#version-actuel');
  const ancienneFiche = page.locator('.lod-version--archive');
  const ficheActuelle = page.locator('.lod-version--actuel');
  await expect(archive).toBeChecked();
  await archive.focus();
  await page.keyboard.press('ArrowRight');
  await expect(actuel).toBeChecked();
  await expect(actuel).toBeFocused();
  await expect(ficheActuelle).toBeVisible();
  await expect(ancienneFiche).toBeHidden();
  expect(await lireValeurs(ficheActuelle)).toEqual({ 'Points de vie': '590', Attaque: '53', Armure: '21', Mana: '418' });
  await expect(ficheActuelle.getByRole('link', { name: 'Ouvrir cette version dans l’application' }))
    .toHaveAttribute('href', 'https://www.league-of-data-base.com/fr/16.20.1/champions/Ahri');
  await verifierCaptureEtZoom(page, ficheActuelle.locator('[data-lod-capture]'), 'ahri-actuel-statistiques', DIMENSIONS_STATISTIQUES);

  await actuel.focus();
  await page.keyboard.press('ArrowLeft');
  await expect(archive).toBeChecked();
  await expect(archive).toBeFocused();
  await expect(ancienneFiche).toBeVisible();
  await expect(ficheActuelle).toBeHidden();
  expect(await lireValeurs(ancienneFiche)).toEqual({ 'Points de vie': '380', Attaque: '50', Armure: '11', Mana: '230' });
  await expect(ancienneFiche.getByRole('link', { name: 'Ouvrir cette version dans l’application' }))
    .toHaveAttribute('href', 'https://www.league-of-data-base.com/fr/3.6.14/champions/Ahri');
  await verifierCaptureEtZoom(page, ancienneFiche.locator('[data-lod-capture]'), 'ahri-archive-statistiques', DIMENSIONS_STATISTIQUES);
  expect(erreurs).toEqual([]);
});

test('changer de langue au clavier conserve le patch et ouvre la bonne capture', async ({ page }) => {
  const erreurs = surveillerConsole(page);
  await page.goto(CHEMIN);
  const langues = [
    { id: 'fr', libelle: 'Français', nom: 'ahri', titre: 'Renarde à neuf queues' },
    { id: 'en', libelle: 'Anglais', nom: 'ahri-langue-anglaise', titre: 'the Nine-Tailed Fox' },
    { id: 'ko', libelle: 'Coréen', nom: 'ahri-langue-coreenne', titre: '구미호' },
  ];
  const section = page.locator('#langues');
  await section.scrollIntoViewIfNeeded();
  await section.getByRole('radio', { name: langues[0].libelle, exact: true }).focus();
  for (const [index, langue] of langues.entries()) {
    if (index > 0) await page.keyboard.press('ArrowRight');
    const controle = section.getByRole('radio', { name: langue.libelle, exact: true });
    await expect(controle).toBeChecked();
    await expect(controle).toBeFocused();
    const vue = section.locator(`.lod-traduction--${langue.id}`);
    await expect(vue).toBeVisible();
    await expect(vue.locator('.lod-traduction__titre')).toContainText(langue.titre);
    await expect(vue.locator('.lod-traduction__titre')).toContainText('Patch 16.20.1');
    await expect(vue.locator('figcaption a'))
      .toHaveAttribute('href', `https://www.league-of-data-base.com/${langue.id}/16.20.1/champions/Ahri`);
    for (const autre of langues.filter((autre) => autre.id !== langue.id)) {
      await expect(section.locator(`.lod-traduction--${autre.id}`)).toBeHidden();
    }
    await verifierCaptureEtZoom(page, vue.locator('[data-lod-capture]'), langue.nom);
    await controle.focus();
  }
  await page.keyboard.press('ArrowRight');
  await expect(section.getByRole('radio', { name: 'Français', exact: true })).toBeChecked();
  await expect(section.locator('.lod-traduction--fr')).toBeVisible();
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
  const mobile = page.viewportSize()!.width < 800;
  const originale = `/images/league-of-database/histoire-ahri${mobile ? '-mobile' : ''}.webp`;
  let demandes = 0;
  // Les aperçus peuvent employer l’original sur un téléphone à haute densité.
  // Cette panne concerne l’ouverture en grand, après le chargement de l’aperçu.
  await page.goto(CHEMIN);
  const capture = page.locator('.lod-bureau [data-lod-capture]');
  await capture.locator('img').evaluate((image: HTMLImageElement) => image.decode());
  await page.route(`**${originale}`, async (route) => {
    if (++demandes === 1) await route.abort('failed');
    else await route.continue();
  });
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
  expect(await dialogue.locator('[data-lod-full]').evaluate((image: HTMLImageElement) => image.naturalWidth)).toBe(mobile ? 860 : 2880);
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

  test('les valeurs d’un ancien patch et les langues restent consultables', async ({ page }) => {
    const erreurs = surveillerConsole(page);
    await page.goto(CHEMIN);
    await page.locator('label[for="version-actuel"]').click();
    await expect(page.locator('.lod-version--actuel')).toBeVisible();
    await page.locator('#version-actuel').focus();
    await page.keyboard.press('ArrowLeft');
    await expect(page.locator('#version-archive')).toBeChecked();
    const archive = page.locator('.lod-version--archive');
    await expect(archive).toBeVisible();
    await expect(page.locator('.lod-version--actuel')).toBeHidden();
    expect(await lireValeurs(archive)).toEqual({ 'Points de vie': '380', Attaque: '50', Armure: '11', Mana: '230' });
    await expect(archive.locator('[data-lod-capture]')).toHaveAttribute('href', '/images/league-of-database/ahri-archive-statistiques.webp');

    const langues = page.locator('#langues');
    await langues.scrollIntoViewIfNeeded();
    await langues.getByRole('radio', { name: 'Français', exact: true }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(langues.getByRole('radio', { name: 'Anglais', exact: true })).toBeChecked();
    await expect(langues.locator('.lod-traduction--en')).toBeVisible();
    await expect(langues.locator('.lod-traduction--en')).toContainText('the Nine-Tailed Fox');
    await page.keyboard.press('ArrowRight');
    await expect(langues.getByRole('radio', { name: 'Coréen', exact: true })).toBeChecked();
    const coreen = langues.locator('.lod-traduction--ko');
    await expect(coreen).toBeVisible();
    await expect(coreen.locator('.lod-traduction__titre')).toContainText('구미호');
    await expect(langues.locator('.lod-traduction--fr')).toBeHidden();
    await expect(langues.locator('.lod-traduction--en')).toBeHidden();
    const capture = coreen.locator('[data-lod-capture]');
    await capture.scrollIntoViewIfNeeded();
    await capture.locator('img').evaluate((image: HTMLImageElement) => image.decode());
    const mobile = page.viewportSize()!.width < 800;
    expect(new URL(await capture.locator('img').evaluate((image: HTMLImageElement) => image.currentSrc)).pathname)
      .toMatch(new RegExp(`/ahri-langue-coreenne${mobile ? '-mobile' : ''}(?:-\\d+)?\\.webp$`));
    await capture.click();
    expect(new URL(page.url()).pathname).toBe('/images/league-of-database/ahri-langue-coreenne.webp');
    expect(erreurs).toEqual([]);
  });

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
