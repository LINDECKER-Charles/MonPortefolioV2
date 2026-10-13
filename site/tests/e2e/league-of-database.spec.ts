import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { surveillerConsole } from './support/navigateur';

/**
 * League Of Data Base, sur le gabarit commun des pages de projet (règle E5) :
 * l’en-tête au pli (E1), la fiche, trois chiffres sourcés et datés, Ahri
 * côte à côte entre deux patchs, les trois langues et les fiches à explorer
 * au clavier et sans script, les captures réelles qui suivent la largeur de
 * l’écran et s’agrandissent dans la visionneuse partagée, les schémas de
 * l’exploitation gardés, les liens publics seulement, la sortie commune, la
 * page complète sans JavaScript et accessible jour et nuit.
 */

const CHEMIN = '/projets/league-of-database';
const APPLICATION = 'https://league-of-data-base.com/';
const DEPOT = 'https://github.com/LINDECKER-Charles/LeagueOfDataBaseFinal';
const ESPACES = /[\s  ]/g;

const sansEspaces = (texte: string | null) => (texte ?? '').replace(ESPACES, '');
const mobile = (page: Page) => (page.viewportSize()?.width ?? 0) <= 860;

/** Le nom de la capture servie (Astro ajoute une empreinte au nom du fichier). */
async function captureAffichee(page: Page, conteneur: string, variante: 'bureau' | 'mobile' = mobile(page) ? 'mobile' : 'bureau') {
  const image = page.locator(`${conteneur} .capture-league__${variante} .capture__vue > a img`).first();
  await image.scrollIntoViewIfNeeded();
  await image.evaluate((element: HTMLImageElement) => element.decode());
  await expect(image).toBeVisible();
  return new URL(await image.evaluate((element: HTMLImageElement) => element.currentSrc)).pathname;
}

test('l’en-tête tient dans le premier écran : titre, identité, preuve, action', async ({ page }) => {
  await page.goto(CHEMIN);
  for (const marque of ['titre', 'identite', 'preuve', 'action']) {
    await expect(page.locator(`[data-pli="${marque}"]`), marque).toBeInViewport();
  }
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Retrouver le jeu tel qu’il était.');
  if (!mobile(page)) {
    await expect(page.locator('[data-pli="preuve"] li')).toHaveCount(3);
    for (const preuve of await page.locator('[data-pli="preuve"] li').all()) await expect(preuve).toBeInViewport({ ratio: 1 });
    await expect(page.getByRole('group', { name: 'Fiche du projet' })).toBeInViewport({ ratio: 1 });
  } else {
    await expect(page.locator('[data-pli="preuve"] li').first()).toBeInViewport({ ratio: 1 });
  }
});

test('le nom canonique, l’étiquette de preuve et le chemin vers « Comment je l’ai construit »', async ({ page }) => {
  await page.goto(CHEMIN);
  const ariane = page.getByRole('navigation', { name: 'Fil d’Ariane', exact: true });
  await expect(ariane.locator('[aria-current="page"]')).toHaveText('League Of Data Base');
  await expect(page.locator('main')).not.toContainText(/League Of Database|League of Database/);
  const entete = page.locator('.projet-tete');
  await expect(entete).toContainText('Un système en production');
  const construit = entete.locator('[data-pli="action"]').getByRole('link', { name: /Comment je l’ai construit/ });
  await expect(construit).toHaveAttribute('href', '#construit');
  await construit.click();
  await expect(page.locator('#construit')).toBeInViewport();
  await expect(page.locator('#construit .decision')).toHaveCount(3);
});

test('la fiche technique : sept cases à filets, statut à forme et mot, liens publics mesurés', async ({ page }) => {
  await page.goto(CHEMIN);
  const fiche = page.getByRole('group', { name: 'Fiche du projet' });
  await expect(fiche.locator('dt')).toHaveText(['Besoin', 'Ma part', 'Rôle', 'Période', 'Équipe', 'Statut', 'Liens publics']);
  await expect(fiche).toContainText('Seul');
  await expect(fiche.locator('.statut')).toHaveText('En ligne');
  for (const lien of await fiche.locator('a').all()) {
    const href = (await lien.getAttribute('href')) ?? '';
    await expect(lien).toHaveAttribute('data-umami-event', 'lien-sortant');
    await expect(lien).toHaveAttribute('data-umami-event-domaine', new URL(href).hostname);
    await expect(lien).toContainText('↗');
  }
});

test('trois chiffres sourcés et datés, un seul surligné dans l’en-tête', async ({ page }) => {
  await page.goto(CHEMIN);
  const preuves = page.locator('[data-pli="preuve"] .preuve-chiffree');
  expect((await preuves.locator('.preuve-chiffree__valeur').allTextContents()).map(sansEspaces)).toEqual(['403', '21', '12260']);
  for (const preuve of await preuves.all()) {
    await expect(preuve.locator('.preuve-chiffree__source')).toHaveText(/\d{2}\/\d{2}\/\d{4}/);
  }
  const surligne = page.locator('.projet-tete mark');
  await expect(surligne).toHaveCount(1);
  await expect(surligne).toHaveText('403');
  await expect(surligne).toHaveAttribute('data-source', /Historique public/);
});

test('aucun lien hors de l’application et du dépôt public, chaque sortie mesurée, jamais le www', async ({ page }) => {
  await page.goto(CHEMIN);
  const liens = await page.locator('main a[href^="http"]').evaluateAll((elements) =>
    elements.map((lien) => ({
      href: lien.getAttribute('href') ?? '',
      evenement: lien.getAttribute('data-umami-event'),
      domaine: lien.getAttribute('data-umami-event-domaine'),
      emplacement: lien.getAttribute('data-umami-event-emplacement'),
      rel: lien.getAttribute('rel'),
    })),
  );
  expect(liens.length).toBeGreaterThan(15);
  for (const lien of liens) {
    expect([APPLICATION, DEPOT].some((debut) => lien.href.startsWith(debut)), lien.href).toBe(true);
    expect(lien.href).not.toContain('www.league-of-data-base.com');
    expect(lien).toMatchObject({ evenement: 'lien-sortant', domaine: new URL(lien.href).hostname, emplacement: 'preuves', rel: 'external' });
  }
  const adresses = liens.map((lien) => lien.href);
  for (const attendu of [`${APPLICATION}fr/`, `${APPLICATION}fr/3.6.14/champions/Ahri`, `${APPLICATION}fr/16.20.1/champions/Ahri`, DEPOT]) {
    expect(adresses).toContain(attendu);
  }
});

test('Ahri côte à côte : les deux patchs se lisent ensemble, un seul surlignage, deux panneaux réels', async ({ page }) => {
  await page.goto(CHEMIN);
  const section = page.locator('#versions');
  const tableau = section.locator('table');
  await expect(tableau.locator('thead th')).toHaveText([/Patch 3\.6\.14/, /Patch 16\.20\.1/]);
  const lignes = await tableau.locator('tbody tr').evaluateAll((rangees) =>
    Object.fromEntries(rangees.map((rangee) => [rangee.querySelector('th')!.textContent!.trim(), [...rangee.querySelectorAll('td')].map((cellule) => cellule.textContent!.trim())])),
  );
  expect(lignes).toMatchObject({
    Titre: ['Renard à neuf queues', 'Renarde à neuf queues'],
    'Points de vie': ['380', '590'],
    Attaque: ['50', '53'],
    Armure: ['11', '21'],
    Mana: ['230', '418'],
  });
  expect(lignes['Ultime, recharge'].map(sansEspaces)).toEqual(['110/95/80s', '140/120/100s']);
  const marques = section.locator('mark');
  await expect(marques).toHaveCount(1);
  await expect(marques).toHaveText('590');
  // Côte à côte : les deux valeurs de points de vie sont visibles en même temps.
  const pointsDeVie = tableau.locator('tbody tr').nth(1).locator('td');
  await pointsDeVie.first().scrollIntoViewIfNeeded();
  await expect(pointsDeVie.first()).toBeVisible();
  await expect(pointsDeVie.last()).toBeVisible();
  const panneaux = section.getByRole('group', { name: /panneaux de statistiques/ }).locator('a[data-agrandir] img');
  await expect(panneaux).toHaveCount(2);
  await expect(panneaux.first()).toHaveAttribute('alt', /3\.6\.14.*points de vie 380/);
  await expect(panneaux.last()).toHaveAttribute('alt', /16\.20\.1.*points de vie 590/);
  await expect(section.getByRole('link', { name: 'Ahri au patch 3.6.14', exact: true })).toHaveAttribute('href', `${APPLICATION}fr/3.6.14/champions/Ahri`);
  await expect(section.getByRole('link', { name: 'Ahri au patch 16.20.1', exact: true })).toHaveAttribute('href', `${APPLICATION}fr/16.20.1/champions/Ahri`);
});

test('les captures suivent la largeur de l’écran : téléphone sur mobile, navigateur sur ordinateur', async ({ page }) => {
  const erreurs = surveillerConsole(page);
  await page.goto(CHEMIN);
  const variante = mobile(page) ? '-mobile' : '';
  for (const nom of ['histoire-version', 'histoire-navigation', 'histoire-skins', 'histoire-ahri']) {
    expect(await captureAffichee(page, `[data-capture-league="${nom}"]`)).toMatch(new RegExp(`/${nom}${variante}\\.`));
  }
  // Les deux catalogues restent des écrans d’ordinateur, annotés, à toutes les largeurs.
  for (const [nom, legende] of [['histoire-champions', '113 champions'], ['champions', '173 champions']]) {
    const capture = page.locator(`[data-capture-league="${nom}"]`);
    await expect(capture.locator('.capture__legende')).toContainText(legende);
    await expect(capture.locator('.cible')).toHaveCount(1);
    expect(await captureAffichee(page, `[data-capture-league="${nom}"]`, 'bureau')).toMatch(new RegExp(`/${nom}\\.`));
  }
  expect(erreurs).toEqual([]);
});

test('une capture s’agrandit dans la visionneuse partagée, Échap rend le focus et la position', async ({ page }) => {
  const erreurs = surveillerConsole(page);
  await page.goto(CHEMIN);
  const lien = page.locator(`#champions .onglets__vue--ahri .capture-league__${mobile(page) ? 'mobile' : 'bureau'} a[data-agrandir]`);
  await lien.scrollIntoViewIfNeeded();
  await lien.focus();
  const position = await page.evaluate(() => window.scrollY);
  await page.keyboard.press('Enter');
  const dialogue = page.locator('dialog[data-visionneuse]');
  await expect(dialogue).toBeVisible();
  const image = dialogue.locator('[data-visionneuse-image]');
  await expect(image).toBeVisible();
  expect(new URL(await image.evaluate((element: HTMLImageElement) => element.src)).pathname).toBe(new URL((await lien.getAttribute('href'))!, page.url()).pathname);
  await expect(image).toHaveAttribute('alt', (await lien.locator('img').getAttribute('alt')) ?? '');
  expect(await image.evaluate((element: HTMLImageElement) => element.naturalWidth)).toBeGreaterThan(mobile(page) ? 800 : 2000);
  await expect(page.locator('html')).toHaveCSS('overflow', 'hidden');
  await page.keyboard.press('Escape');
  await expect(dialogue).toBeHidden();
  await expect(lien).toBeFocused();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(position);
  expect(erreurs).toEqual([]);
});

test('la même fiche en trois langues, au clavier : les trois titres restent lisibles, une capture à la fois', async ({ page }) => {
  const erreurs = surveillerConsole(page);
  await page.goto(CHEMIN);
  const section = page.locator('#langues');
  const langues = [
    { id: 'fr', libelle: 'Français', nom: 'ahri', titre: 'Renarde à neuf queues', langue: 'français' },
    { id: 'en', libelle: 'Anglais', nom: 'ahri-langue-anglaise', titre: 'the Nine-Tailed Fox', langue: 'anglais' },
    { id: 'ko', libelle: 'Coréen', nom: 'ahri-langue-coreenne', titre: '구미호', langue: 'coréen' },
  ];
  // Le bandeau des trois titres : chacun dans sa langue, tous visibles.
  for (const langue of langues) {
    await expect(section.locator(`label[for="langue-ahri-${langue.id}"] [lang="${langue.id}"]`)).toContainText(langue.titre);
  }
  await section.getByRole('radio', { name: 'Français', exact: true }).focus();
  for (const [index, langue] of langues.entries()) {
    if (index > 0) await page.keyboard.press('ArrowRight');
    const controle = section.getByRole('radio', { name: langue.libelle, exact: true });
    await expect(controle).toBeChecked();
    await expect(controle).toBeFocused();
    const vue = section.locator(`.onglets__vue--${langue.id}`);
    await expect(vue).toBeVisible();
    for (const autre of langues.filter((autre) => autre.id !== langue.id)) await expect(section.locator(`.onglets__vue--${autre.id}`)).toBeHidden();
    await expect(vue.getByRole('link', { name: `Consulter cette fiche en ${langue.langue}` })).toHaveAttribute('href', `${APPLICATION}${langue.id}/16.20.1/champions/Ahri`);
    expect(await captureAffichee(page, `#langues .onglets__vue--${langue.id}`)).toMatch(new RegExp(`/${langue.nom}${mobile(page) ? '-mobile' : ''}\\.`));
    await controle.focus();
  }
  await page.keyboard.press('ArrowRight');
  await expect(section.getByRole('radio', { name: 'Français', exact: true })).toBeChecked();
  expect(erreurs).toEqual([]);
});

test('les six fiches à explorer restent entières avec leurs onglets dans l’écran', async ({ page }) => {
  await page.goto(CHEMIN);
  const largeur = page.viewportSize()!.width;
  const ecrans = mobile(page) ? [page.viewportSize()!, { width: largeur, height: 667 }] : [page.viewportSize()!, { width: largeur, height: 700 }];
  const fiches = ['ahri', 'ahri-capacites', 'ahri-skins', 'ahri-skin-detail', 'objet-recette', 'runes'];
  for (const ecran of ecrans) {
    await page.setViewportSize(ecran);
    for (const nom of fiches) {
      await page.locator(`label[for="fiche-${nom}"]`).click();
      await expect(page.locator(`#fiche-${nom}`)).toBeChecked();
      const vue = page.locator(`#champions .onglets__vue--${nom}`);
      await expect(vue).toBeVisible();
      for (const autre of fiches.filter((autre) => autre !== nom)) await expect(page.locator(`#champions .onglets__vue--${autre}`)).toBeHidden();
      // L’atelier en haut de l’écran, sous l’en-tête collant : onglets, capture et légende tiennent ensemble.
      await page.locator('#champions .onglets__choix').evaluate((element) => {
        const entete = document.querySelector('.entete')!.getBoundingClientRect().height;
        window.scrollTo({ top: window.scrollY + element.getBoundingClientRect().top - entete - 8, behavior: 'instant' });
      });
      const image = vue.locator(`.capture-league__${mobile(page) ? 'mobile' : 'bureau'} .capture__vue img`).first();
      await image.evaluate((element: HTMLImageElement) => element.decode());
      expect(await page.evaluate((identifiant) => {
        const vue = document.querySelector(`#champions .onglets__vue--${identifiant}`)!;
        const figure = [...vue.querySelectorAll<HTMLElement>('figure.capture')].find((element) => element.offsetParent !== null)!;
        const image = figure.querySelector('.capture__vue img')!.getBoundingClientRect();
        const legende = figure.querySelector('figcaption')!.getBoundingClientRect();
        const choix = document.querySelector('#champions .onglets__choix')!.getBoundingClientRect();
        const entete = document.querySelector('.entete')!.getBoundingClientRect();
        // Sur mobile, les onglets défilent en une rangée : l’onglet choisi reste dans l’écran.
        const choisi = document.querySelector(`#champions label[for="fiche-${identifiant}"]`)!.getBoundingClientRect();
        return choix.top >= entete.bottom - 1 && image.top >= choix.bottom && image.bottom <= window.innerHeight && legende.bottom <= window.innerHeight
          && choisi.left >= 0 && choisi.right <= window.innerWidth;
      }, nom), `${nom} à ${ecran.width} × ${ecran.height}`).toBe(true);
    }
  }
});

test('les pièges des données, la réécriture et l’exploitation gardent leurs schémas', async ({ page }) => {
  await page.goto(CHEMIN);
  await expect(page.locator('#donnees .piege')).toHaveCount(5);
  await expect(page.locator('#donnees [data-visuel]')).toHaveCount(5);
  const jalons = page.locator('#reecriture .jalon');
  await expect(jalons).toHaveCount(4);
  for (const date of await jalons.locator('time').all()) await expect(date).toHaveAttribute('datetime', /^\d{4}-\d{2}-\d{2}$/);
  await expect(jalons.last()).toContainText('04/10/2026');
  await expect(page.locator('#reecriture [data-visuel="LOD-04"]')).toHaveCount(1);
  for (const bloc of ['#trafic', '#sauvegardes', '#livraison', '#audience']) {
    await expect(page.locator(`#fabrication ${bloc} figure`), bloc).toHaveCount(1);
  }
  await expect(page.locator('#audience')).toContainText('Umami');
  // Le dispositif des sauvegardes est public ; son activation reste à confirmer, et la page le dit.
  await expect(page.locator('#sauvegardes .a-confirmer')).toContainText('à confirmer');
});

test('la sortie : projets voisins dans l’ordre de la vitrine, « Discutons » vers /contact', async ({ page }) => {
  await page.goto(CHEMIN);
  const sortie = page.locator('#retiens');
  const discutons = sortie.getByRole('link', { name: /^Discutons/ });
  await expect(discutons).toHaveAttribute('href', '/contact');
  await expect(discutons).toHaveAttribute('data-umami-event', 'contact-page');
  await expect(discutons).toHaveAttribute('data-umami-event-emplacement', 'discutons');
  await expect(sortie.getByRole('link', { name: /Projet suivant\s+Omnicard/ })).toHaveAttribute('href', '/projets/omnicard');
  await expect(sortie.getByRole('link', { name: /Projet précédent\s+PvZ Fusion, pôle francophone/ })).toHaveAttribute('href', '/projets/pvz-fusion');
  await expect(sortie.getByRole('link', { name: /Tous les projets/ })).toHaveAttribute('href', '/projets');
  await expect(page.locator('#sources')).toContainText('sans affiliation à Riot Games');
});

test('une seule navigation de page, sans la note de sources', async ({ page }) => {
  await page.goto(CHEMIN);
  const navigation = page.locator('nav[aria-label="Dans cette page"]');
  await expect(navigation).toHaveCount(1);
  if (!mobile(page)) await expect(navigation).toBeVisible();
  const attendus = ['#versions', '#anciennes-fiches', '#champions', '#plateforme', '#donnees', '#reecriture', '#fabrication', '#construit', '#retiens'];
  expect(await navigation.locator('a').evaluateAll((liens) => liens.map((lien) => lien.getAttribute('href')))).toEqual(attendus);
  for (const ancre of attendus) await expect(page.locator(ancre)).toHaveCount(1);
});

for (const theme of ['jour', 'nuit'] as const) {
  test.describe(`axe, ${theme}, états ouverts`, () => {
    test.use({ colorScheme: theme === 'nuit' ? 'dark' : 'light', reducedMotion: 'reduce' });

    test('les onglets choisis et la visionneuse ouverte restent accessibles', async ({ page }) => {
      await page.goto(CHEMIN);
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await page.locator('label[for="langue-ahri-ko"]').click();
      await page.locator('label[for="fiche-ahri-capacites"]').click();
      for (const zone of ['.projet-tete', '#versions', '#anciennes-fiches', '#champions', '#fabrication']) {
        const resultats = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']).include(zone).analyze();
        expect(resultats.violations.map((v) => ({ id: v.id, cibles: v.nodes.slice(0, 3).map((n) => n.target) })), zone).toEqual([]);
      }
      await page.locator('#versions a[data-agrandir]').first().click();
      await expect(page.locator('dialog[data-visionneuse] [data-visionneuse-image]')).toBeVisible();
      // axe ne voit pas le ::backdrop sombre du <dialog> : le contraste de la légende claire
      // s’y mesure sur la page, dessous. Il est vérifié la nuit, où le fond de page est sombre.
      const regles = theme === 'jour' ? { 'color-contrast': { enabled: false } } : {};
      const ouverte = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).options({ rules: regles }).include('dialog[data-visionneuse]').analyze();
      expect(ouverte.violations.map((v) => v.id)).toEqual([]);
    });
  });
}

test.describe('sans JavaScript', () => {
  test.use({ javaScriptEnabled: false, reducedMotion: 'reduce' });

  test('la page est complète : en-tête, comparaison, onglets, schémas, captures en lien direct', async ({ page }) => {
    const erreurs = surveillerConsole(page);
    await page.goto(CHEMIN);
    for (const marque of ['titre', 'identite', 'preuve', 'action']) await expect(page.locator(`[data-pli="${marque}"]`)).toBeInViewport();
    await expect(page.locator('#versions table')).toBeVisible();
    await expect(page.locator('dialog[data-visionneuse]')).toBeHidden();
    // Les onglets fonctionnent sans script : un groupe radio et du CSS.
    await page.locator('#langue-ahri-fr').focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#langue-ahri-en')).toBeChecked();
    await expect(page.locator('#langues .onglets__vue--en')).toBeVisible();
    await expect(page.locator('#langues .onglets__vue--fr')).toBeHidden();
    await page.locator('label[for="fiche-ahri-skins"]').click();
    await expect(page.locator('#champions .onglets__vue--ahri-skins')).toBeVisible();
    for (const bloc of ['#trafic', '#sauvegardes', '#livraison', '#audience']) await expect(page.locator(`${bloc} figure`)).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
    // Une capture s’ouvre en grand comme une simple image.
    const lien = page.locator('#versions a[data-agrandir]').first();
    const adresse = (await lien.getAttribute('href'))!;
    const reponse = await page.request.get(adresse);
    expect(reponse.ok()).toBe(true);
    expect(reponse.headers()['content-type']).toMatch(/^image\//);
    await lien.click();
    expect(new URL(page.url()).pathname).toBe(adresse);
    expect(erreurs).toEqual([]);
  });
});
