import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { surveillerConsole } from './support/navigateur';

/**
 * Omnicard, sur le gabarit commun des pages de projet (règle E5) : en-tête
 * au pli à 1 440 et 390 px (E1), fiche, repères sourcés, un seul lien de
 * code (le dépôt de présentation public), aucune mécanique inventée ni date
 * de lancement non validée ; puis tout ce que la page gardait : les trois
 * univers en éventail, la collection, le deck et le booster en captures,
 * agrandis dans la visionneuse partagée, et désormais le rééquilibrage des
 * cartes, le plateau et le compte à rebours de GitGud. Complète sans
 * JavaScript, accessible jour et nuit, états ouverts compris.
 */

const CHEMIN = '/projets/omnicard';
const DEPOT = 'https://github.com/LINDECKER-Charles/public-Omnicard';
const NBSP = ' ';

async function liensSortants(page: Page) {
  return page.locator('main a[href^="http"]').evaluateAll((liens) =>
    liens.map((lien) => ({
      href: lien.getAttribute('href') ?? '',
      evenement: lien.getAttribute('data-umami-event'),
      domaine: lien.getAttribute('data-umami-event-domaine'),
      emplacement: lien.getAttribute('data-umami-event-emplacement'),
      rel: lien.getAttribute('rel'),
    })),
  );
}

test('l’en-tête tient dans le premier écran : titre, identité, preuve, action', async ({ page }) => {
  await page.goto(CHEMIN);
  for (const marque of ['titre', 'identite', 'preuve', 'action']) {
    await expect(page.locator(`[data-pli="${marque}"]`), marque).toBeInViewport();
  }
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Imaginer le jeu. Construire les règles.');
  if ((page.viewportSize()?.width ?? 0) >= 1440) {
    await expect(page.locator('[data-pli="preuve"] li')).toHaveCount(3);
    for (const preuve of await page.locator('[data-pli="preuve"] li').all()) await expect(preuve).toBeInViewport({ ratio: 1 });
    await expect(page.getByRole('group', { name: 'Fiche du projet' })).toBeInViewport({ ratio: 1 });
  } else {
    await expect(page.locator('[data-pli="preuve"] li').first()).toBeInViewport({ ratio: 1 });
  }
});

test('le nom canonique, l’étiquette de preuve et le chemin vers « Sous le capot »', async ({ page }) => {
  await page.goto(CHEMIN);
  await expect(page.getByRole('navigation', { name: 'Fil d’Ariane', exact: true }).locator('[aria-current="page"]')).toHaveText('Omnicard');
  const entete = page.locator('.projet-tete');
  await expect(entete).toContainText('Réinventer');
  const construit = entete.locator('[data-pli="action"]').getByRole('link', { name: /Sous le capot/ });
  await expect(construit).toHaveAttribute('href', '#construit');
  // « Le jeu en images », l’appel de l’ancienne page, reste une action de l’en-tête.
  await expect(entete.locator('[data-pli="action"]').getByRole('link', { name: /Le jeu en images/ })).toHaveAttribute('href', '#jeu');
  await construit.click();
  await expect(page.locator('#construit')).toBeInViewport();
  await expect(page.locator('#construit .point-capot')).toHaveCount(4);
});

test('la fiche : sept cases, statut hors ligne à forme et mot, sans marque « à confirmer », liens mesurés', async ({ page }) => {
  await page.goto(CHEMIN);
  const fiche = page.getByRole('group', { name: 'Fiche du projet' });
  await expect(fiche.locator('dt')).toHaveText(['Besoin', 'Ma part', 'Rôle', 'Période', 'Équipe', 'Statut', 'Liens publics']);
  await expect(fiche.locator('.statut')).toHaveText('Hors ligne, en attente de refonte');
  // Un seul rôle : les règles du jeu papier sont co-écrites, le jeu en ligne est fait seul.
  await expect(fiche.locator('.fiche-projet__case--role dd')).toHaveText(`Co-auteur du jeu papier${NBSP}; seul pour le jeu en ligne (équilibrage, moteur, interface)`);
  await expect(fiche.locator('.statut')).toHaveClass(/statut--eteint/);
  await expect(fiche).not.toContainText('à confirmer');
  await expect(fiche).toContainText('moteur de règles en C#');
  for (const lien of await fiche.locator('a').all()) {
    expect(await lien.getAttribute('href')).toMatch(new RegExp(`^${DEPOT}`));
    await expect(lien).toHaveAttribute('data-umami-event', 'lien-sortant');
    await expect(lien).toHaveAttribute('data-umami-event-domaine', 'github.com');
    await expect(lien).toContainText('↗');
  }
});

test('trois repères sourcés, un seul surligné : les 181 cartes, la durée ensuite', async ({ page }) => {
  await page.goto(CHEMIN);
  const preuves = page.locator('[data-pli="preuve"] .preuve-chiffree');
  await expect(preuves.locator('.preuve-chiffree__valeur')).toHaveText(['181', `≈${NBSP}3${NBSP}mois`, '5']);
  for (const preuve of await preuves.all()) await expect(preuve.locator('.preuve-chiffree__source')).not.toBeEmpty();
  const surligne = page.locator('.projet-tete mark');
  await expect(surligne).toHaveCount(1);
  await expect(surligne).toHaveText('181');
  await expect(surligne).toHaveAttribute('data-source', /Galerie publique, version 1\.2\.0/);
});

test('un seul lien de code, le dépôt de présentation public ; aucune démo hors ligne', async ({ page }) => {
  await page.goto(CHEMIN);
  const liens = await liensSortants(page);
  expect(liens.length).toBeGreaterThan(5);
  for (const lien of liens) {
    expect(lien.href.startsWith(DEPOT), lien.href).toBe(true);
    // La racine du dépôt affiche encore « Jouer maintenant » : on relie ses règles, sa galerie, son archive.
    expect(lien.href.replace(/\/$/, ''), lien.href).not.toBe(DEPOT);
    expect(lien).toMatchObject({ evenement: 'lien-sortant', domaine: 'github.com', emplacement: 'preuves', rel: 'external' });
  }
  const html = await page.content();
  expect(html).not.toMatch(/omnicard\.fr|Omnicard-app|LINDECKER-Charles\/Omnicard\b|discord|ko-fi/i);
});

test('aucun fait non sourcé : ni mécanique « Combiner », ni date de lancement', async ({ page }) => {
  await page.goto(CHEMIN);
  const texte = (await page.locator('main').textContent()) ?? '';
  expect(texte).not.toMatch(/Combiner/);
  expect(texte).not.toMatch(/16\s?mai|16\/05\/2026|lancé le|lancement public/i);
  await expect(page.locator('main')).toContainText('sans moteur de jeu existant');
});

test('une seule navigation de page, sans la note de sources', async ({ page }) => {
  await page.goto(CHEMIN);
  const navigation = page.locator('nav[aria-label="Dans cette page"]');
  await expect(navigation).toHaveCount(1);
  if ((page.viewportSize()?.width ?? 0) > 1100) await expect(navigation).toBeVisible();
  const attendus = ['#papier', '#reequilibrer', '#partie', '#jeu', '#moteur', '#construit', '#retiens'];
  expect(await navigation.locator('a').evaluateAll((liens) => liens.map((lien) => lien.getAttribute('href')))).toEqual(attendus);
  for (const ancre of attendus) await expect(page.locator(ancre)).toHaveCount(1);
});

test('les univers révèlent l’effet de leur carte au clic et au clavier', async ({ page }) => {
  const erreurs = surveillerConsole(page);
  await page.goto(CHEMIN);
  const univers = page.getByRole('group', { name: 'Choisir une carte et son univers' });
  await univers.scrollIntoViewIfNeeded();
  const effet = univers.locator('.effet:visible');
  await expect(effet).toHaveCount(1);
  await expect(effet.locator('.effet__mecanique')).toHaveText('Transformer');

  await univers.locator('.oc-pastille', { hasText: 'Bloodborne' }).click();
  await expect(effet.locator('.effet__mecanique')).toHaveText('Invoquer');
  // La carte elle-même est une commande : cliquer Floppa choisit l’univers WTF.
  await univers.locator('label.eventail__carte').nth(2).click();
  await expect(univers.getByRole('radio', { name: /WTF/ })).toBeChecked();
  await expect(effet.locator('.effet__mecanique')).toHaveText('Piocher');

  // Un nom par bouton : l’univers, sans doublon venu de l’image de la carte.
  await expect(univers.getByRole('radio', { name: 'Bloodborne', exact: true })).toHaveCount(1);
  await univers.getByRole('radio', { name: /WTF/ }).focus();
  await page.keyboard.press('ArrowLeft');
  await expect(univers.getByRole('radio', { name: /JoJo/ })).toBeChecked();
  await expect(univers.getByRole('radio', { name: /JoJo/ })).toBeFocused();
  await expect(effet.locator('.effet__mecanique')).toHaveText('Transformer');
  expect(erreurs).toEqual([]);
});

test('le rééquilibrage montre, carte par carte, la saison 1 et la version actuelle côte à côte', async ({ page }) => {
  await page.goto(CHEMIN);
  const comparateur = page.getByRole('group', { name: 'Une carte, deux versions' });
  await comparateur.scrollIntoViewIfNeeded();
  const visible = comparateur.locator('.comparaison:visible');
  await expect(visible).toHaveCount(1);
  await expect(visible.getByRole('img')).toHaveCount(2);
  await expect(visible.getByRole('img').first()).toHaveAttribute('alt', /saison 1.*4\/8/);
  await expect(visible.getByRole('img').last()).toHaveAttribute('alt', /version actuelle.*4\/15/);
  // La version en ligne de ces valeurs n’est pas établie : l’étiquette le dit.
  await expect(visible.locator('.comparaison__carte--apres .comparaison__etiquette')).toContainText('Version actuelle du projet');
  await expect(visible.locator('.comparaison__carte--apres')).not.toContainText('à confirmer');
  await expect(comparateur).not.toContainText('Jeu en ligne');
  await expect(visible.locator('dd')).toHaveText(['4/8 → devient 4/15']);

  await comparateur.locator('.oc-pastille', { hasText: 'GitGud' }).click();
  await expect(visible.locator('dd')).toHaveText(['13 → devient 10']);
  await comparateur.getByRole('radio', { name: 'GitGud' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(comparateur.getByRole('radio', { name: 'Floppa' })).toBeChecked();
  await expect(visible.locator('dd')).toHaveText(['5 → devient 6', '0/4 → devient 2/8']);
  // Un cercle par valeur changée, sur chacune des deux cartes.
  await expect(visible.locator('.marque')).toHaveCount(6);
});

test('le plateau en schéma : quatre cibles, quatre repères chiffrés', async ({ page }) => {
  await page.goto(CHEMIN);
  const partie = page.locator('#partie');
  await expect(partie.locator('[data-figure="OMN-03"] .oc-cible')).toHaveCount(4);
  // Deux lignes de 10 places par joueur, comme le dit le repère 4.
  await expect(partie.locator('[data-figure="OMN-03"] .ligne')).toHaveCount(4);
  await expect(partie.locator('[data-figure="OMN-03"] .place')).toHaveCount(40);
  const reperes = partie.getByRole('list', { name: 'Les repères d’une partie' }).locator('li');
  await expect(reperes).toHaveCount(4);
  await expect(reperes.locator('.reperes__valeur')).toHaveText(['30', '40', '10', '2']);
});

test('le compte à rebours de GitGud : neuf fins de tour, cinq comptent, puis l’égalité', async ({ page }) => {
  await page.goto(CHEMIN);
  const frise = page.getByRole('button', { name: 'Rejouer l’animation : le compte à rebours de GitGud' });
  await expect(frise.locator('.etape')).toHaveCount(10);
  await expect(frise.locator('.etape--lanceur .etape__compte')).toHaveText(['4', '3', '2', '1', '0']);
  await expect(frise.locator('.etape--adverse .etape__compte')).toHaveText(['4', '3', '2', '1']);
  await expect(frise.locator('.etape--fin')).toContainText('Égalité');
  await expect(page.locator('[data-figure="OMN-05"] figcaption')).toContainText('cinq de mes fins de tour');
  // La règle affichée ne s’appuie que sur le glossaire public : aucune précision incertaine.
  await expect(page.locator('[data-figure="OMN-05"] figcaption')).not.toContainText('à confirmer');
  await expect(page.locator('[data-figure="OMN-05"] figcaption')).toContainText('jamais à la fin du tour adverse');
});

test('le serveur arbitre : le dessin OMN-04 posé, suivi des trois étapes en texte', async ({ page }) => {
  await page.goto(CHEMIN);
  const dessin = page.locator('#moteur [data-visuel="OMN-04"]');
  await expect(dessin).not.toHaveAttribute('data-manquant');
  await expect(dessin.getByRole('img', { name: /Deux navigateurs envoient leurs actions à un serveur/ })).toBeVisible();
  await expect(page.getByRole('list', { name: 'Le trajet d’une action de jeu' }).locator('li')).toHaveCount(3);
});

test('« Rééquilibrer » remonte sous la citation : pas de vide au-dessus du titre', async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 0) <= 1100, 'Colonnes côte à côte seulement au-delà de 1 100 px.');
  await page.goto(CHEMIN);
  const titre = (await page.locator('#reequilibrer-titre').boundingBox())!;
  const comparateur = (await page.getByRole('group', { name: 'Une carte, deux versions' }).boundingBox())!;
  // Le titre s’aligne sur le haut du comparateur au lieu de se centrer sur sa hauteur.
  expect(Math.abs(titre.y - comparateur.y)).toBeLessThan(40);
});

test.describe('la scène se rejoue au clic', () => {
  test.use({ reducedMotion: 'no-preference' });

  test('un clic sur la frise relance l’allumage des fins de tour', async ({ page }) => {
    await page.goto(CHEMIN);
    const frise = page.getByRole('button', { name: 'Rejouer l’animation : le compte à rebours de GitGud' });
    await expect(frise).toBeEnabled();
    await frise.scrollIntoViewIfNeeded();
    await expect(frise).not.toHaveClass(/animation-en-cours/, { timeout: 8000 });
    await frise.click();
    await expect(frise).toHaveClass(/animation-en-cours/);
    await expect(frise).not.toHaveClass(/animation-en-cours/, { timeout: 8000 });
  });
});

for (const javaScriptEnabled of [true, false]) {
  test.describe(`écrans du jeu ${javaScriptEnabled ? 'avec' : 'sans'} JavaScript`, () => {
    test.use({ javaScriptEnabled, reducedMotion: 'reduce' });

    test('changer d’écran au clic et au clavier garde la capture en place', async ({ page }) => {
      await page.goto(CHEMIN);
      const galerie = page.getByRole('group', { name: 'Choisir un écran d’Omnicard' });
      await page.evaluate(async () => {
        await document.fonts.ready;
        const commande = document.querySelector('.galerie .onglet:nth-child(2)')!;
        window.scrollTo({ top: window.scrollY + commande.getBoundingClientRect().top - 220, behavior: 'instant' });
      });
      const position = await page.evaluate(() => window.scrollY);
      const capture = galerie.locator('.galerie__ecran:visible .capture__vue');
      const haut = (await capture.boundingBox())!.y;

      for (const [rang, nom] of [[1, 'deck'], [2, 'ouverture'], [0, 'collection']] as const) {
        await galerie.locator('.onglet').nth(rang).click();
        await expect(galerie.locator(`input[value="${nom}"]`)).toBeChecked();
        await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(position);
        expect((await capture.boundingBox())!.y).toBeCloseTo(haut, 0);
      }
      await page.keyboard.press('ArrowRight');
      await expect(galerie.locator('input[value="deck"]')).toBeChecked();
      await expect(galerie.locator('.galerie__ecran:visible')).toContainText('Un deck, c’est le jeu de cartes');
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(position);
    });
  });
}

test('une capture s’ouvre dans la visionneuse partagée, Échap rend le focus à la bonne image', async ({ page }) => {
  const erreurs = surveillerConsole(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(CHEMIN);
  await page.evaluate(() => document.fonts.ready);
  const galerie = page.getByRole('group', { name: 'Choisir un écran d’Omnicard' });
  await galerie.locator('.onglet').nth(1).click();
  const ouvrir = galerie.locator('.galerie__ecran:visible a[data-agrandir]');
  await ouvrir.focus();
  const position = await page.evaluate(() => ({ x: window.scrollX, y: window.scrollY }));
  const source = await ouvrir.getAttribute('href');
  const description = await ouvrir.locator('img').getAttribute('alt');

  await page.keyboard.press('Enter');
  const dialogue = page.locator('dialog[data-visionneuse]');
  await expect(dialogue).toBeVisible();
  await expect(dialogue.locator('[data-visionneuse-legende]')).toContainText('Un deck, c’est le jeu de cartes');
  const image = dialogue.locator('[data-visionneuse-image]');
  await expect(image).toBeVisible();
  await expect(image).toHaveAttribute('src', new URL(source!, page.url()).href);
  await expect(image).toHaveAttribute('alt', description ?? '');
  expect(await image.evaluate((element: HTMLImageElement) => element.naturalWidth)).toBeGreaterThan(0);
  await expect(dialogue.getByRole('button', { name: /Fermer/ })).toBeFocused();
  await expect(page.locator('html')).toHaveCSS('overflow', 'hidden');

  await page.keyboard.press('Escape');
  await expect(dialogue).toBeHidden();
  await expect(ouvrir).toBeFocused();
  await expect.poll(() => page.evaluate(() => ({ x: window.scrollX, y: window.scrollY }))).toEqual(position);
  expect(erreurs).toEqual([]);
});

test('la sortie : projets voisins dans l’ordre de la vitrine, « Discutons » vers /contact', async ({ page }) => {
  await page.goto(CHEMIN);
  const sortie = page.locator('#retiens');
  const discutons = sortie.getByRole('link', { name: /^Discutons/ });
  await expect(discutons).toHaveAttribute('href', '/contact');
  await expect(discutons).toHaveAttribute('data-umami-event', 'contact-page');
  await expect(discutons).toHaveAttribute('data-umami-event-emplacement', 'discutons');
  await expect(sortie.getByRole('link', { name: /Projet suivant\s+Bloodborne Legendary Run/ })).toHaveAttribute('href', '/projets/bloodborne-legendary-run');
  await expect(sortie.getByRole('link', { name: /Projet précédent\s+PvZ Fusion, pôle francophone/ })).toHaveAttribute('href', '/projets/pvz-fusion');
  await expect(sortie.locator('[data-citation]')).toHaveText(/Le projet qui m’a fait le plus apprendre/);
});

for (const theme of ['jour', 'nuit'] as const) {
  test.describe(`axe, ${theme}, états ouverts`, () => {
    test.use({ colorScheme: theme === 'nuit' ? 'dark' : 'light', reducedMotion: 'reduce' });

    test('univers, rééquilibrage et écran du jeu changés restent accessibles', async ({ page }) => {
      await page.goto(CHEMIN);
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await page.getByRole('group', { name: 'Choisir une carte et son univers' }).locator('.oc-pastille', { hasText: 'WTF' }).click();
      await page.getByRole('group', { name: 'Une carte, deux versions' }).locator('.oc-pastille', { hasText: 'Floppa' }).click();
      await page.getByRole('group', { name: 'Choisir un écran d’Omnicard' }).locator('.onglet').nth(2).click();
      for (const zone of ['.projet-tete', '#reequilibrer', '#partie', '#jeu', '#moteur']) {
        const resultats = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']).include(zone).analyze();
        expect(resultats.violations.map((v) => ({ id: v.id, cibles: v.nodes.slice(0, 3).map((n) => n.target) })), zone).toEqual([]);
      }
    });
  });
}

test.describe('sans JavaScript', () => {
  test.use({ javaScriptEnabled: false, reducedMotion: 'reduce' });

  test('la page est complète : choix natifs, frise entière, captures en liens vers leur image', async ({ page }) => {
    const erreurs = surveillerConsole(page);
    await page.goto(CHEMIN);
    for (const marque of ['titre', 'identite', 'preuve', 'action']) await expect(page.locator(`[data-pli="${marque}"]`)).toBeInViewport();

    const univers = page.getByRole('group', { name: 'Choisir une carte et son univers' });
    await univers.locator('.oc-pastille', { hasText: 'Bloodborne' }).click();
    await expect(univers.locator('.effet:visible .effet__mecanique')).toHaveText('Invoquer');

    const comparateur = page.getByRole('group', { name: 'Une carte, deux versions' });
    await comparateur.locator('.oc-pastille', { hasText: 'GitGud' }).click();
    await expect(comparateur.locator('.comparaison:visible dd')).toHaveText(['13 → devient 10']);

    await expect(page.locator('[data-figure="OMN-05"] .etape:visible')).toHaveCount(10);
    // Rien ne rejouerait la frise : son bouton reste désactivé, hors de la tabulation.
    await expect(page.getByRole('button', { name: 'Rejouer l’animation : le compte à rebours de GitGud' })).toBeDisabled();

    const galerie = page.getByRole('group', { name: 'Choisir un écran d’Omnicard' });
    for (const lien of await galerie.locator('a[data-agrandir]').all()) {
      const adresse = await lien.getAttribute('href');
      if (!adresse) throw new Error('Chaque capture doit rester un lien vers son image.');
      const reponse = await page.request.get(adresse);
      expect(reponse.ok()).toBe(true);
      expect(reponse.headers()['content-type']).toMatch(/^image\//);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
    expect(erreurs).toEqual([]);
  });
});
