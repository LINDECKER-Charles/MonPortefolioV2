import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { surveillerConsole } from './support/navigateur';

/**
 * Bloodborne Legendary Run sur le gabarit commun des pages de projet (règle
 * E5) : en-tête au pli (E1), fiche à sept cases, chiffres sourcés et datés,
 * liens publics seulement (jamais le dépôt privé), et tout ce que Charles a
 * gardé le 13/10/2026 : l’allumage qui se joue une fois à l’arrivée, la
 * planche des 22 constellations, les quatre rituels à la demande, le guide,
 * les trois écrans entre amis, le carrousel de la boutique, l’accès web de
 * test, la vue de Yharnam, les couches explorables et la livraison.
 */

const CHEMIN = '/projets/bloodborne-legendary-run';
const AXE = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

/** Les seules sorties admises depuis la page (cahier, § 5.6 ; accès de test gardés par Charles). */
const SORTIES_ADMISES = [
  'https://bloodborne-legendary-run.com/fr/sky',
  'https://bloodborne-legendary-run.com/fr/changelog',
  'https://test.bb-legendary.charles-lindecker.com/fr/sky',
  'https://test.bb-legendary.charles-lindecker.com/fr/download',
  'https://angular.dev/press-kit',
  'https://creativecommons.org/licenses/by/4.0/',
];

async function liensSortants(page: Page) {
  return page.locator('main a[href^="http"]').evaluateAll((liens) =>
    liens.map((lien) => ({
      href: lien.getAttribute('href') ?? '',
      evenement: lien.getAttribute('data-umami-event'),
      domaine: lien.getAttribute('data-umami-event-domaine'),
      emplacement: lien.getAttribute('data-umami-event-emplacement'),
    })),
  );
}

test('l’en-tête tient dans le premier écran : titre, identité, preuve, action', async ({ page }) => {
  await page.goto(CHEMIN);
  for (const marque of ['titre', 'identite', 'preuve', 'action']) {
    await expect(page.locator(`[data-pli="${marque}"]`), marque).toBeInViewport();
  }
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Bloodborne Legendary Run Plus de mille objectifs, un ciel pour s’y retrouver.');
  if ((page.viewportSize()?.width ?? 0) >= 1440) {
    for (const preuve of await page.locator('[data-pli="preuve"] li').all()) await expect(preuve).toBeInViewport({ ratio: 1 });
    await expect(page.getByRole('group', { name: 'Fiche du projet' })).toBeInViewport({ ratio: 1 });
  } else {
    await expect(page.locator('[data-pli="preuve"] li').first()).toBeInViewport({ ratio: 1 });
  }
});

test('le nom canonique, l’étiquette de preuve et trois décisions sourcées', async ({ page }) => {
  await page.goto(CHEMIN);
  const ariane = page.getByRole('navigation', { name: 'Fil d’Ariane', exact: true });
  await expect(ariane.locator('[aria-current="page"]')).toHaveText('Bloodborne Legendary Run');
  await expect(page.locator('.projet-tete')).toContainText('Un produit de bout en bout');
  const construit = page.locator('[data-pli="action"]').getByRole('link', { name: /Sous le capot/ });
  await expect(construit).toHaveAttribute('href', '#construit');
  await construit.click();
  await expect(page.locator('#construit')).toBeInViewport();
  const decisions = page.locator('#construit .point-capot');
  await expect(decisions).toHaveCount(3);
  await expect(decisions.first()).toContainText('Un seul croisement de traits sur 1 008, contre 68 sur 319.');
  // Chacune des trois renvoie à son étape du journal public.
  for (const decision of await decisions.all()) {
    await expect(decision.locator('a[href="https://bloodborne-legendary-run.com/fr/changelog"]')).toHaveCount(1);
  }
});

test('la légende de l’en-tête ne nomme que ce qui est visible', async ({ page }) => {
  await page.goto(CHEMIN);
  const legende = page.locator('.blr-tete__legende');
  const bureau = page.locator('.blr-tete__bureau');
  if ((page.viewportSize()?.width ?? 0) > 860) {
    await expect(bureau).toBeVisible();
    await expect(legende).toHaveText('Un boss vaincu : l’étoile s’allume. Derrière, la carte des constellations sur ordinateur.');
  } else {
    await expect(bureau).toBeHidden();
    expect(await legende.evaluate((el) => (el as HTMLElement).innerText.trim())).toMatch(/^Un boss vaincu\s: l’étoile s’allume\.$/);
  }
});

test('le guide : fiches reliées aux objectifs, cycle de la partie et noms corrigés', async ({ page }) => {
  await page.goto(CHEMIN);
  const guide = page.locator('#guide');
  await expect(guide).toContainText('Chaque objectif renvoie aux fiches qui en parlent.');
  await expect(guide).toContainText('Le cycle choisi, de la première partie aux suivantes, adapte les données du combat.');
  await expect(guide).toContainText('143 appellations corrigées');
});

test('la fiche technique : sept cases, statut à forme et mot, liens publics mesurés', async ({ page }) => {
  await page.goto(CHEMIN);
  const fiche = page.getByRole('group', { name: 'Fiche du projet' });
  await expect(fiche.locator('dt')).toHaveText(['Besoin', 'Ma part', 'Rôle', 'Période', 'Équipe', 'Statut', 'Liens publics']);
  await expect(fiche.locator('.statut')).toHaveText('En ligne');
  await expect(fiche).toContainText('Depuis septembre 2026');
  const liens = fiche.locator('a');
  await expect(liens).toHaveCount(2);
  for (const lien of await liens.all()) {
    const href = (await lien.getAttribute('href')) ?? '';
    await expect(lien).toHaveAttribute('data-umami-event', 'lien-sortant');
    await expect(lien).toHaveAttribute('data-umami-event-domaine', new URL(href).hostname);
    await expect(lien).toContainText('↗');
  }
});

test('trois chiffres sourcés et datés, un seul surligné', async ({ page }) => {
  await page.goto(CHEMIN);
  const preuves = page.locator('[data-pli="preuve"] .preuve-chiffree');
  await expect(preuves.locator('.preuve-chiffree__valeur')).toHaveText(['1 289', '22', '864']);
  for (const preuve of await preuves.all()) await expect(preuve.locator('.preuve-chiffree__source')).toHaveText(/\d{2}\/\d{2}\/\d{4}/);
  const surligne = page.locator('.projet-tete mark');
  await expect(surligne).toHaveCount(1);
  await expect(surligne).toHaveText('1 289');
  await expect(surligne).toHaveAttribute('data-source', /Catalogue du projet/);
});

test('aucun lien hors de la liste blanche, jamais le dépôt privé, chaque sortie mesurée', async ({ page }) => {
  await page.goto(CHEMIN);
  const liens = await liensSortants(page);
  expect(liens.length).toBeGreaterThan(5);
  for (const lien of liens) {
    expect(SORTIES_ADMISES, lien.href).toContain(lien.href);
    expect(lien).toMatchObject({ evenement: 'lien-sortant', domaine: new URL(lien.href).hostname, emplacement: 'preuves' });
  }
  const html = await page.content();
  expect(html).not.toMatch(/github\.com\/[^"'\s]*Bloodborne-Legendary-Run/i);
  expect(html).not.toContain('bloodborne-legendary-run.com/fr/download');
  // La phrase de motivation inventée n’existe plus nulle part.
  await expect(page.getByText(/retrouver mes repères entre deux sessions/)).toHaveCount(0);
});

test('une seule navigation de page, dans l’ordre des sections', async ({ page }) => {
  await page.goto(CHEMIN);
  const navigation = page.locator('nav[aria-label="Dans cette page"]');
  await expect(navigation).toHaveCount(1);
  if ((page.viewportSize()?.width ?? 0) > 1100) await expect(navigation).toBeVisible();
  const attendus = ['#ciel', '#reprendre', '#geste', '#guide', '#amis', '#boutique', '#essayer', '#construit', '#retiens'];
  expect(await navigation.locator('a').evaluateAll((liens) => liens.map((lien) => lien.getAttribute('href')))).toEqual(attendus);
  for (const ancre of attendus) await expect(page.locator(ancre)).toHaveCount(1);
  // L’essayer précède la technique, comme Charles l’a demandé.
  expect(await page.locator('#essayer').evaluate((section) => Boolean(section.compareDocumentPosition(document.querySelector('#construit')!) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
});

test('l’allumage de l’en-tête se joue une fois, muet, puis se met en pause et se rejoue au clic', async ({ page }) => {
  const erreurs = surveillerConsole(page);
  await page.goto(CHEMIN);
  const video = page.locator('video[data-blr-allumage]');
  await video.scrollIntoViewIfNeeded();
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime)).toBeGreaterThan(0);
  expect(await video.evaluate((v: HTMLVideoElement) => ({ muet: v.muted, commandes: v.controls }))).toEqual({ muet: true, commandes: false });
  const bouton = page.locator('[data-blr-rejouer]');
  await expect(bouton).toHaveAttribute('aria-label', 'Mettre en pause l’allumage de l’étoile');
  await bouton.click();
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
  await expect(bouton).toHaveAttribute('aria-label', 'Rejouer l’allumage de l’étoile');
  await bouton.focus();
  await page.keyboard.press('Enter');
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => !v.paused)).toBe(true);
  expect(erreurs).toEqual([]);
});

test.describe('mouvement réduit', () => {
  test.use({ reducedMotion: 'reduce' });

  test('l’allumage garde son poster et la planche reste entière, sans animation', async ({ page }) => {
    await page.goto(CHEMIN);
    const video = page.locator('video[data-blr-allumage]');
    await page.waitForTimeout(600);
    expect(await video.evaluate((v: HTMLVideoElement) => v.paused && v.currentTime === 0)).toBe(true);
    await expect(video).toHaveAttribute('poster', '/demos/bloodborne/boss-fin-poster.webp');
    const planche = page.locator('[data-scene="blr-constellations"]');
    await planche.scrollIntoViewIfNeeded();
    await expect(planche).not.toHaveClass(/animation-en-cours/);
    // Le clic reste une demande explicite : la vidéo se lance.
    await page.locator('[data-blr-rejouer]').click();
    await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime)).toBeGreaterThan(0);
  });
});

test('la planche des 22 constellations, nommées et comptées, se rejoue au clic', async ({ page }) => {
  await page.goto(CHEMIN);
  const planche = page.locator('.blr-planche');
  await expect(planche.locator('.blr-planche__titre')).toHaveText('22 constellations, 1 289 objectifs');
  const constellations = planche.locator('.blr-planche__liste > li');
  await expect(constellations).toHaveCount(22);
  await expect(constellations.first()).toContainText('La Nuit de la chasse');
  await expect(constellations.first()).toContainText('86 étoiles');
  await expect(constellations.last()).toContainText('L’Épreuve des armes');
  const scene = page.locator('[data-scene="blr-constellations"]');
  await scene.scrollIntoViewIfNeeded();
  await expect(scene).toHaveClass(/animation-en-cours/);
  await expect(scene).not.toHaveClass(/animation-en-cours/, { timeout: 8_000 });
  await scene.locator('[data-rejouer]').click();
  await expect(scene).toHaveClass(/animation-en-cours/);
});

test('l’avant et l’après du ciel lisible : deux captures du journal, agrandissables', async ({ page }) => {
  await page.goto(CHEMIN);
  const paire = page.locator('#ciel .blr-avant-apres');
  await expect(paire.locator('.blr-avant-apres__etiquette')).toHaveText(['Avant', 'Après']);
  await expect(paire.locator('a[data-agrandir]')).toHaveCount(2);
  await expect(paire).toContainText('08/09/2026');
});

test('les quatre rituels se choisissent au clavier et se lisent à la demande, un seul à la fois', async ({ page }) => {
  const erreurs = surveillerConsole(page);
  await page.goto(CHEMIN);
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
  await page.locator('#guide').scrollIntoViewIfNeeded();
  await page.locator('#amis').scrollIntoViewIfNeeded();
  await expect.poll(() => rituels.locator('video').evaluateAll((elements) => elements.every((element) => (element as HTMLVideoElement).paused))).toBe(true);
  expect(erreurs).toEqual([]);
});

test('choisir un rituel ne fait pas remonter la page', async ({ page }, testInfo) => {
  await page.goto(CHEMIN);
  const choix = page.locator('label[for="rituel-gemme"]');
  await choix.scrollIntoViewIfNeeded();
  const position = await page.evaluate(() => window.scrollY);
  if (testInfo.project.name.startsWith('mobile')) await choix.tap();
  else await choix.click();
  await expect(page.locator('#rituel-gemme')).toBeChecked();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThanOrEqual(position - 2);
  await expect(page.locator('[data-blr-rituel="gemme"] video')).toBeInViewport({ ratio: 0.9 });
});

test('les rayons de la boutique défilent sans déplacer la page', async ({ page }) => {
  const erreurs = surveillerConsole(page);
  await page.goto(CHEMIN);
  const boutique = page.locator('[data-blr-boutique]');
  const galerie = boutique.locator('[data-blr-boutique-ecrans]');
  await boutique.scrollIntoViewIfNeeded();
  const position = await page.evaluate(() => window.scrollY);
  await boutique.getByRole('button', { name: 'Bannières', exact: true }).click();
  await expect(boutique.getByRole('button', { name: 'Bannières', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(boutique.locator('[data-rayon="bannieres"] a[data-agrandir]')).toBeInViewport();
  await expect(boutique.locator('[data-blr-boutique-annonce]')).toHaveText('Bannières, 2 sur 3');
  await galerie.focus();
  await page.keyboard.press('ArrowRight');
  await expect(boutique.getByRole('button', { name: 'Portraits', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(boutique.getByRole('button', { name: 'Voir le rayon suivant', exact: true })).toHaveAttribute('aria-disabled', 'true');
  await expect(boutique.locator('[data-blr-boutique-position]')).toHaveText('3 / 3');
  await page.keyboard.press('Home');
  await expect(boutique.getByRole('button', { name: 'Fonds', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(boutique.locator('[data-blr-boutique-position]')).toHaveText('1 / 3');
  await expect(boutique.getByRole('button', { name: 'Voir le rayon précédent', exact: true })).toHaveAttribute('aria-disabled', 'true');
  expect(Math.abs((await page.evaluate(() => window.scrollY)) - position)).toBeLessThanOrEqual(2);
  expect(erreurs).toEqual([]);
});

test('une capture s’agrandit dans la visionneuse partagée et rend le focus à la fermeture', async ({ page }) => {
  const erreurs = surveillerConsole(page);
  await page.goto(CHEMIN);
  const ouvrir = page.locator('#guide a[data-agrandir]');
  const dialogue = page.locator('dialog[data-visionneuse]');
  await ouvrir.focus();
  await page.keyboard.press('Enter');
  await expect(dialogue).toBeVisible();
  await expect(dialogue.locator('[data-visionneuse-image]')).toBeVisible();
  await expect(dialogue.locator('[data-visionneuse-image]')).toHaveAttribute('alt', /Père Gascoigne/);
  await expect(dialogue.getByRole('button', { name: /Fermer/ })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialogue).toBeHidden();
  await expect(ouvrir).toBeFocused();
  // La boutique passe par la même visionneuse.
  await page.locator('[data-rayon="fonds"] a[data-agrandir]').click();
  await expect(dialogue).toBeVisible();
  await expect(dialogue.locator('[data-visionneuse-legende]')).toContainText('fonds de constellation');
  await page.keyboard.press('Escape');
  expect(erreurs).toEqual([]);
});

test('entre amis : trois écrans, la couleur de l’ami dite en mots, l’ajout d’un ami et ce qui reste personnel', async ({ page }) => {
  await page.goto(CHEMIN);
  const amis = page.locator('#amis');
  await expect(amis.locator('.blr-serie > li')).toHaveCount(3);
  await expect(amis).toContainText('En turquoise sur les captures : les réussites de l’ami.');
  await expect(amis).toContainText('les notes, les morts et les captures restent personnels');
  await amis.locator('.blr-ajout').click();
  await expect(page.locator('dialog[data-visionneuse]')).toBeVisible();
  await expect(page.locator('[data-visionneuse-legende]')).toContainText('ajout d’un ami');
});

test('les accès : web public et de test, APK de test, Google Play à venir', async ({ page }) => {
  await page.goto(CHEMIN);
  const acces = page.locator('[data-blr-acces]');
  await expect(acces.getByRole('link', { name: /Version publique Ouvrir l’application/ })).toHaveAttribute('href', 'https://bloodborne-legendary-run.com/fr/sky');
  await expect(acces.getByRole('link', { name: /Version de test Essayer sur le web/ })).toHaveAttribute('href', 'https://test.bb-legendary.charles-lindecker.com/fr/sky');
  await expect(acces.getByRole('link', { name: /Version de test Télécharger l’APK/ })).toHaveAttribute('href', 'https://test.bb-legendary.charles-lindecker.com/fr/download');
  await expect(acces.locator('.blr-acces__magasin')).toContainText('Google Play');
  await expect(acces.locator('.blr-acces__magasin')).toContainText('À venir');
  await expect(acces.locator('[data-visuel]')).toHaveCount(2);
  // BLR-06 et BLR-07 sont dessinés : plus de cadre hachuré.
  await expect(acces.locator('[data-visuel][data-manquant]')).toHaveCount(0);
  // Inséré en ligne, décoratif, et recoloré par les jetons du site (trait à la couleur du texte).
  const dessin = acces.locator('[data-visuel="BLR-06"] > svg.v-blr');
  await expect(dessin).toHaveAttribute('aria-hidden', 'true');
  const [trait, texte] = await dessin.evaluate((svg) => [getComputedStyle(svg.querySelector('.t')!).stroke, getComputedStyle(svg).color]);
  expect(trait).toBe(texte);
});

test('les couches de l’application s’explorent au clavier, puis la livraison', async ({ page }) => {
  await page.goto(CHEMIN);
  const technique = page.locator('[data-blr-fabrication]');
  await technique.locator('#blr-fabrication-interface').focus();
  await page.keyboard.press('ArrowRight');
  await expect(technique.locator('.blr-fab__detail--api')).toBeVisible();
  await expect(technique.locator('.blr-fab__detail--interface')).toBeHidden();
  await page.keyboard.press('ArrowRight');
  await expect(technique.locator('.blr-fab__detail--donnees')).toBeVisible();
  await expect(technique.locator('.blr-fab__detail--donnees')).toContainText('PostgreSQL');
  await expect(technique.locator('.blr-fab__etapes > li')).toHaveCount(3);
  expect(await technique.locator('[data-visuel]').evaluateAll((v) => v.map((e) => e.getAttribute('data-visuel')))).toEqual(['BLR-08', 'BLR-09', 'BLR-10']);
  await expect(technique.locator('[data-visuel][data-manquant]')).toHaveCount(0);
});

test('la vidéo prise au clavier montre son anneau de focus sur le cadre du téléphone', async ({ page }) => {
  await page.goto(CHEMIN);
  const video = page.locator('[data-blr-rituel="boss"] video');
  await page.locator('#rituel-gemme').focus();
  for (let i = 0; i < 10 && !(await video.evaluate((v) => v === document.activeElement)); i++) await page.keyboard.press('Tab');
  await expect(video).toBeFocused();
  const cadre = page.locator('[data-blr-rituel="boss"] .capture__cadre');
  expect(await cadre.evaluate((c) => getComputedStyle(c).outlineStyle)).toBe('solid');
  expect(await cadre.evaluate((c) => getComputedStyle(c).outlineWidth)).toBe('2px');
});

test('sur mobile, les deux séries d’écrans défilent avec un compteur et le bord du suivant', async ({ page }) => {
  await page.goto(CHEMIN);
  const mobile = (page.viewportSize()?.width ?? 1440) < 860;
  for (const serie of [page.locator('#reprendre .blr-serie'), page.locator('#amis .blr-serie')]) {
    const compteurs = serie.locator('.blr-serie__compte');
    expect(await compteurs.allTextContents()).toEqual(['1 / 3', '2 / 3', '3 / 3']);
    await expect(compteurs.first()).toHaveAttribute('aria-hidden', 'true');
    if (!mobile) {
      await expect(compteurs.first()).toBeHidden();
      continue;
    }
    await expect(compteurs.first()).toBeVisible();
    const [largeurSerie, largeurEcran] = await serie.evaluate((ol) => [ol.clientWidth, (ol.firstElementChild as HTMLElement).offsetWidth]);
    expect(largeurEcran).toBeLessThan(largeurSerie);
    expect(largeurEcran).toBeGreaterThan(largeurSerie * 0.7);
    // Le titre de l’écran tient en entier dans sa diapositive.
    const titre = serie.locator('.blr-serie__tete strong').nth(1);
    expect(await titre.evaluate((t) => t.scrollWidth <= t.clientWidth)).toBe(true);
  }
});

test('la documentation des allumages n’est pas servie avec les vidéos', async ({ request }) => {
  for (const fichier of ['README.md', 'captures.json']) {
    expect((await request.get(`/demos/bloodborne/${fichier}`)).status()).toBe(404);
  }
  expect((await request.get('/demos/bloodborne/boss.mp4')).ok()).toBe(true);
});

test('la sortie : projet suivant et précédent de la vitrine, « Discutons » vers /contact', async ({ page }) => {
  await page.goto(CHEMIN);
  const sortie = page.locator('#retiens');
  const discutons = sortie.getByRole('link', { name: /^Discutons/ });
  await expect(discutons).toHaveAttribute('href', '/contact');
  await expect(discutons).toHaveAttribute('data-umami-event', 'contact-page');
  await expect(discutons).toHaveAttribute('data-umami-event-emplacement', 'discutons');
  await expect(sortie.getByRole('link', { name: /Projet suivant\s+League Of Data Base/ })).toHaveAttribute('href', '/projets/league-of-database');
  await expect(sortie.getByRole('link', { name: /Projet précédent\s+Omnicard/ })).toHaveAttribute('href', '/projets/omnicard');
  await expect(sortie.getByRole('link', { name: /Tous les projets/ })).toHaveAttribute('href', '/projets');
  await expect(page.locator('#sources')).toContainText('MoonlightGhost');
});

for (const theme of ['jour', 'nuit'] as const) {
  test.describe(`axe, ${theme}, états ouverts`, () => {
    test.use({ colorScheme: theme === 'nuit' ? 'dark' : 'light', reducedMotion: 'reduce' });

    test('couche, rituel et rayon choisis, puis la visionneuse ouverte, restent accessibles', async ({ page }) => {
      await page.goto(CHEMIN);
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await page.locator('label[for="blr-fabrication-api"]').click();
      await page.locator('label[for="rituel-rune"]').click();
      await page.locator('[data-blr-boutique]').getByRole('button', { name: 'Portraits', exact: true }).click();
      for (const zone of ['.projet-tete', '#ciel', '#geste', '#boutique', '#construit']) {
        const resultats = await new AxeBuilder({ page }).withTags(AXE).include(zone).analyze();
        expect(resultats.violations.map((v) => ({ id: v.id, cibles: v.nodes.slice(0, 3).map((n) => n.target) })), zone).toEqual([]);
      }
      await page.locator('#guide a[data-agrandir]').click();
      await expect(page.locator('dialog[data-visionneuse] [data-visionneuse-image]')).toBeVisible();
      const ouverte = await new AxeBuilder({ page }).withTags(AXE).include('dialog[data-visionneuse]').analyze();
      expect(ouverte.violations.map((v) => ({ id: v.id, cibles: v.nodes.map((n) => [n.target, n.failureSummary]) }))).toEqual([]);
    });
  });
}

test.describe('sans JavaScript', () => {
  test.use({ javaScriptEnabled: false, reducedMotion: 'reduce' });

  test('la page est complète : en-tête, planche, rituels, boutique, couches, captures et ancres', async ({ page }) => {
    const erreurs = surveillerConsole(page);
    await page.goto(CHEMIN);
    for (const marque of ['titre', 'identite', 'preuve', 'action']) await expect(page.locator(`[data-pli="${marque}"]`)).toBeInViewport();
    // L’allumage garde ses commandes natives ; le bouton de rejeu, inutile, disparaît.
    await expect(page.locator('video[data-blr-allumage]')).toHaveAttribute('controls', '');
    await expect(page.locator('[data-blr-rejouer]')).toBeHidden();
    await expect(page.locator('.blr-planche__liste > li')).toHaveCount(22);
    await expect(page.locator('[data-rejouer]')).toBeHidden();

    const rituels = page.locator('[data-blr-rituels]');
    await expect(rituels.locator('video[controls]')).toHaveCount(4);
    await page.locator('label[for="rituel-rune"]').click();
    await expect(rituels.locator('[data-blr-rituel="rune"]')).toBeVisible();
    await expect(rituels.locator('[data-blr-rituel="boss"]')).toBeHidden();

    await expect(page.locator('[data-blr-boutique-navigation]')).toBeHidden();
    const galerie = page.locator('[data-blr-boutique-ecrans]');
    await galerie.focus();
    for (let i = 0; i < 3; i++) await page.keyboard.press('Tab');
    const portrait = page.locator('[data-rayon="portraits"] a[data-agrandir]');
    await expect(portrait).toBeFocused();
    await expect.poll(() => galerie.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);

    await page.locator('label[for="blr-fabrication-api"]').click();
    await expect(page.locator('.blr-fab__detail--api')).toBeVisible();
    await expect(page.locator('#amis .blr-serie > li')).toHaveCount(3);

    // Chaque capture est un lien vers l’image elle-même.
    const captures = page.locator('main a[data-agrandir]');
    expect(await captures.count()).toBeGreaterThanOrEqual(14);
    for (const capture of await captures.all()) {
      const href = await capture.getAttribute('href');
      expect(href).toMatch(/^\/_astro\/.+\.webp$/);
      const reponse = await page.request.get(href!);
      expect(reponse.ok()).toBe(true);
      expect(reponse.headers()['content-type']).toMatch(/^image\/webp/);
    }

    await page.locator('[data-pli="action"]').getByRole('link', { name: /Sous le capot/ }).click();
    expect(new URL(page.url()).hash).toBe('#construit');
    await expect(page.locator('#construit')).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
    expect(erreurs).toEqual([]);
  });
});

test('la classe de la page règle l’image de la section « Ranger » : 440 px de large au plus, détachée du texte', async ({ page }) => {
  // Les règles de base de <Visuel> ont une spécificité nulle : `:global(.blr-probleme)` l’emporte.
  await page.goto(CHEMIN);
  const image = page.locator('figure[data-visuel="BLR-01"]');
  const { largeur, marge } = await image.evaluate((element) => ({ largeur: element.getBoundingClientRect().width, marge: getComputedStyle(element).marginTop }));
  const colonne = await image.evaluate((element) => element.parentElement!.getBoundingClientRect().width);
  expect(largeur).toBeCloseTo(Math.min(colonne, 440), 0);
  expect(Number.parseFloat(marge)).toBeGreaterThan(0);
});
