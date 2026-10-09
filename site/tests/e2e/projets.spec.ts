import { expect, test } from '@playwright/test';
import { surveillerConsole } from './support/navigateur';

test('le hub garde les archives discrètes et les pages accessibles', async ({ page }) => {
  await page.goto('/projets');
  await expect(page.locator('[data-project-card]')).toHaveCount(3);
  const archives = page.locator('#projets-archives');
  await expect(archives).not.toHaveAttribute('open');
  await archives.locator('summary').focus();
  await page.keyboard.press('Enter');
  await expect(archives).toHaveAttribute('open', '');
  await expect(archives).toContainText('Aucun projet archivé pour le moment.');
  await expect(archives.locator('a')).toHaveCount(0);
  await page.locator('[data-project-card="bloodborne"]').getByRole('link', { name: 'Page du projet Bloodborne Legendary Run', exact: true }).click();
  await expect(page).toHaveURL(/\/projets\/bloodborne-legendary-run$/);
});

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

test('les vrais rituels Bloodborne se choisissent au clavier et se lisent sur demande', async ({ page }) => {
  const erreurs = surveillerConsole(page);
  await page.goto('/projets/bloodborne-legendary-run');
  const rituels = page.locator('[data-blr-rituels]');
  const boss = rituels.locator('[data-blr-rituel="boss"] video');
  await rituels.scrollIntoViewIfNeeded();
  await expect(rituels.locator('video')).toHaveCount(4);
  expect(await rituels.locator('video[autoplay]').count()).toBe(0);
  expect(await boss.evaluate((video: HTMLVideoElement) => video.paused && video.currentTime === 0)).toBe(true);
  await boss.evaluate((video: HTMLVideoElement) => video.play());
  await expect.poll(() => boss.evaluate((video: HTMLVideoElement) => video.currentTime)).toBeGreaterThan(0);
  await page.locator('#rituel-boss').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#rituel-decouverte')).toBeChecked();
  await expect(rituels.locator('[data-blr-rituel="decouverte"]')).toBeVisible();
  await expect(rituels.locator('[data-blr-rituel="boss"]')).toBeHidden();
  expect(await boss.evaluate((video: HTMLVideoElement) => video.paused)).toBe(true);
  for (const id of ['decouverte', 'rune', 'gemme']) {
    await rituels.locator(`label[for="rituel-${id}"]`).click();
    const video = rituels.locator(`[data-blr-rituel="${id}"] video`);
    await video.scrollIntoViewIfNeeded();
    await video.evaluate((element: HTMLVideoElement) => element.play());
    await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.currentTime)).toBeGreaterThan(0);
    expect(await video.evaluate((element: HTMLVideoElement) => element.videoWidth)).toBe(390);
  }
  await page.locator('#entre-amis').scrollIntoViewIfNeeded();
  await expect.poll(() => rituels.locator('video').evaluateAll((elements) => elements.every((element) => (element as HTMLVideoElement).paused))).toBe(true);
  expect(erreurs).toEqual([]);
});

test('les amis et les couches techniques Bloodborne sont explorables', async ({ page }) => {
  await page.goto('/projets/bloodborne-legendary-run');
  const social = page.locator('#entre-amis');
  await expect(social.locator('figure')).toHaveCount(3);
  await expect(social).toContainText('Turquoise');
  await expect(social).toContainText('Les notes, les morts et les captures restent personnels.');
  const technique = page.locator('[data-blr-fabrication]');
  await technique.locator('#blr-fabrication-interface').focus();
  await page.keyboard.press('ArrowRight');
  await expect(technique.locator('.blr-fab__detail--api')).toBeVisible();
  await expect(technique.locator('.blr-fab__detail--interface')).toBeHidden();
  await page.keyboard.press('ArrowRight');
  await expect(technique.locator('.blr-fab__detail--donnees')).toBeVisible();
  await expect(technique.locator('.blr-fab__detail--donnees')).toContainText('PostgreSQL');
});

test('choisir une vidéo Bloodborne ne remonte pas vers le titre', async ({ page }, testInfo) => {
  await page.goto('/projets/bloodborne-legendary-run');
  const choix = page.locator('label[for="rituel-gemme"]');
  await choix.scrollIntoViewIfNeeded();
  const position = await page.evaluate(() => window.scrollY);
  if (testInfo.project.name.startsWith('mobile')) await choix.tap();
  else await choix.click();
  await expect(page.locator('#rituel-gemme')).toBeChecked();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThanOrEqual(position - 2);
  await expect(page.locator('[data-blr-rituel="gemme"] video')).toBeInViewport({ ratio: .9 });
});

test('les rayons de boutique Bloodborne se parcourent sans déplacer la page', async ({ page }) => {
  const erreurs = surveillerConsole(page);
  await page.goto('/projets/bloodborne-legendary-run');
  await expect(page.getByText('Relire un souvenir de combat', { exact: true })).toHaveCount(0);
  const boutique = page.locator('[data-blr-boutique]');
  const galerie = boutique.locator('[data-blr-boutique-ecrans]');
  await boutique.scrollIntoViewIfNeeded();
  await boutique.getByRole('button', { name: 'Bannières', exact: true }).click();
  await expect(boutique.locator('[data-blr-boutique-position]')).toHaveText('2 / 3');
  await expect(boutique.locator('[data-blr-capture="boutique-bannieres"]')).toBeInViewport();
  await expect(boutique.getByRole('button', { name: 'Bannières', exact: true })).toBeFocused();
  await galerie.focus();
  await page.keyboard.press('ArrowRight');
  await expect(boutique.locator('[data-blr-boutique-position]')).toHaveText('3 / 3');
  await expect(boutique.getByRole('button', { name: 'Voir le rayon suivant', exact: true })).toHaveAttribute('aria-disabled', 'true');
  await page.keyboard.press('Home');
  await expect(boutique.locator('[data-blr-boutique-position]')).toHaveText('1 / 3');
  await boutique.locator('[data-blr-capture="boutique-fonds"]').click();
  await expect(page.locator('[data-blr-dialog]')).toBeVisible();
  await expect(page.locator('[data-blr-full="boutique-fonds"] img')).toHaveAttribute('alt', /fonds de constellation/);
  await page.keyboard.press('Escape');
  await expect(boutique.locator('[data-blr-capture="boutique-fonds"]')).toBeFocused();
  expect(erreurs).toEqual([]);
});

test('les accès Bloodborne précèdent la technique et annoncent le Play Store à venir', async ({ page }) => {
  await page.goto('/projets/bloodborne-legendary-run');
  const acces = page.locator('[data-blr-acces]');
  await expect(acces.getByRole('link', { name: /Version publique Ouvrir l’application/ })).toHaveAttribute('href', 'https://bloodborne-legendary-run.com/fr/sky');
  await expect(acces.getByRole('link', { name: /Version de test Essayer sur le web/ })).toHaveAttribute('href', 'https://test.bb-legendary.charles-lindecker.com/fr/sky');
  await expect(acces.getByRole('link', { name: /Version de test Télécharger l’APK/ })).toHaveAttribute('href', 'https://test.bb-legendary.charles-lindecker.com/fr/download');
  await expect(acces.locator('.blr-acces__store')).toContainText('Google Play');
  await expect(acces.locator('.blr-acces__store')).toContainText('À venir');
  expect(await acces.evaluate((element) => Boolean(element.compareDocumentPosition(document.querySelector('#la-fabrication')!) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
});

test('une capture Bloodborne s’agrandit et rend le focus à la fermeture', async ({ page }) => {
  const erreurs = surveillerConsole(page);
  await page.goto('/projets/bloodborne-legendary-run');
  const ouvrir = page.locator('[data-blr-capture="3"]');
  const dialogue = page.locator('[data-blr-dialog]');
  const fermer = dialogue.locator('[data-blr-full="3"] [data-blr-close]');
  const debordementInitial = await page.evaluate(() => document.documentElement.style.overflow);
  await ouvrir.focus();
  await page.keyboard.press('Enter');
  await expect(dialogue).toBeVisible();
  await expect(dialogue).toHaveAttribute('open', '');
  expect(await dialogue.evaluate((element) => {
    const cadre = element.getBoundingClientRect();
    return cadre.width === window.innerWidth && cadre.height === window.innerHeight;
  })).toBe(true);
  await dialogue.locator('[data-blr-full="3"] img').evaluate((image: HTMLImageElement) => image.decode());
  await expect(dialogue.locator('[data-blr-full="3"] img')).toBeVisible();
  expect(await dialogue.locator('[data-blr-full="3"] img').evaluate((image) => {
    const cadre = image.getBoundingClientRect();
    return cadre.width > 100 && cadre.height > 100 && cadre.top >= 0 && cadre.left >= 0 && cadre.bottom <= window.innerHeight && cadre.right <= window.innerWidth;
  })).toBe(true);
  await expect(dialogue.locator('[data-blr-full="3"] img')).toHaveAttribute('alt', /Père Gascoigne/);
  await expect(dialogue.locator('[data-blr-full]:visible')).toHaveCount(1);
  await expect(fermer).toBeFocused();
  await expect(page.locator('html')).toHaveCSS('overflow', 'hidden');

  await page.keyboard.press('Escape');
  await expect(dialogue).toBeHidden();
  await expect(ouvrir).toBeFocused();
  await expect.poll(() => page.evaluate(() => document.documentElement.style.overflow)).toBe(debordementInitial);

  await page.keyboard.press('Enter');
  await expect(dialogue).toBeVisible();
  await fermer.click();
  await expect(dialogue).toBeHidden();
  await expect(ouvrir).toBeFocused();
  await expect.poll(() => page.evaluate(() => document.documentElement.style.overflow)).toBe(debordementInitial);
  expect(erreurs).toEqual([]);
});

test.describe('Bloodborne sans JavaScript', () => {
  test.use({ javaScriptEnabled: false, reducedMotion: 'reduce' });

  test('la page garde son contenu, ses captures et sa navigation', async ({ page }) => {
    const erreurs = surveillerConsole(page);
    await page.goto('/projets/bloodborne-legendary-run');
    const galerie = page.locator('[data-blr-boutique-ecrans]');
    await expect(page.locator('[data-blr-boutique-navigation]')).toBeHidden();
    await galerie.focus();
    for (let i = 0; i < 3; i++) await page.keyboard.press('Tab');
    await expect.poll(() => galerie.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
    const portrait = page.locator('[data-blr-capture="boutique-portraits"]');
    await expect(portrait).toBeFocused();
    await expect(portrait).toBeInViewport();
    const rituels = page.locator('[data-blr-rituels]');
    await expect(rituels.locator('video[controls]')).toHaveCount(4);
    await page.locator('label[for="rituel-rune"]').click();
    await expect(rituels.locator('[data-blr-rituel="rune"]')).toBeVisible();
    await expect(rituels.locator('[data-blr-rituel="boss"]')).toBeHidden();
    await page.locator('label[for="blr-fabrication-api"]').click();
    await expect(page.locator('.blr-fab__detail--api')).toBeVisible();
    await expect(page.locator('#entre-amis figure')).toHaveCount(3);
    await expect(page.locator('[data-blr-dialog]')).toBeHidden();

    await page.getByRole('navigation', { name: 'Dans cette page', exact: true }).getByRole('link', { name: 'Le guide', exact: true }).click();
    expect(new URL(page.url()).hash).toBe('#le-guide');
    await expect(page.locator('#le-guide')).toBeInViewport();

    const captures = page.locator('[data-blr-capture]');
    await expect(captures).toHaveCount(13);
    for (const capture of await captures.all()) {
      const href = await capture.getAttribute('href');
      expect(href).toMatch(/^\/_astro\/.+\.webp$/);
      if (!href) throw new Error('La capture doit avoir une adresse.');
      const reponse = await page.request.get(href);
      expect(reponse.ok()).toBe(true);
      expect(reponse.headers()['content-type']).toMatch(/^image\/webp/);
    }

    const guide = page.locator('[data-blr-capture="3"]');
    const adresseGuide = await guide.getAttribute('href');
    if (!adresseGuide) throw new Error('La capture du guide doit avoir une adresse.');
    await guide.click();
    expect(new URL(page.url()).pathname).toBe(adresseGuide);
    await page.goBack();
    await page.getByRole('navigation', { name: 'Fil d’Ariane', exact: true }).getByRole('link', { name: 'Projets', exact: true }).click();
    await expect(page).toHaveURL(/\/projets$/);
    await expect(page.locator('[data-project-card]')).toHaveCount(3);
    expect(erreurs).toEqual([]);
  });
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
