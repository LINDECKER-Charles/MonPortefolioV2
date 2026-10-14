import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { surveillerConsole } from './support/navigateur';

/**
 * gup, sur le gabarit commun des pages de projet (règle E5) : en-tête au pli
 * (E1), fiche à sept cases, trois chiffres sourcés dont un seul surligné,
 * aucun téléchargement npm affiché, liens publics seulement, quatre vrais
 * écrans agrandissables, la démonstration conservée (une source en échec, le
 * lot administrateur en dernier), les 153 sources filtrées par système sans
 * JavaScript, la sortie commune, et la page complète et accessible sans
 * script, jour et nuit.
 */

const CHEMIN = '/projets/gup';

/** Les seules sorties admises depuis la page : le dépôt gup, son site et son paquet npm. */
const SORTIES_ADMISES = [
  'https://github.com/LINDECKER-Charles/gup',
  'https://lindecker-charles.github.io/gup/',
  'https://www.npmjs.com/package/@charles_lindecker/gup',
];

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
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Une commande pour mettre à jour toute sa machine.');
  if ((page.viewportSize()?.width ?? 0) >= 1440) {
    await expect(page.locator('[data-pli="preuve"] li')).toHaveCount(3);
    for (const preuve of await page.locator('[data-pli="preuve"] li').all()) await expect(preuve).toBeInViewport({ ratio: 1 });
  } else {
    await expect(page.locator('[data-pli="preuve"] li').first()).toBeInViewport({ ratio: 1 });
  }
});

test('le nom canonique en minuscules, l’étiquette de preuve et « Comment je l’ai construit »', async ({ page }) => {
  await page.goto(CHEMIN);
  const ariane = page.getByRole('navigation', { name: 'Fil d’Ariane', exact: true });
  await expect(ariane.locator('[aria-current="page"]')).toHaveText('gup');
  await expect(page.locator('.projet-tete')).not.toContainText('GUP');
  const entete = page.locator('.projet-tete');
  await expect(entete).toContainText('Un outil open source');
  const construit = entete.locator('[data-pli="action"]').getByRole('link', { name: /Comment je l’ai construit/ });
  await expect(construit).toHaveAttribute('href', '#construit');
  await construit.click();
  await expect(page.locator('#construit')).toBeInViewport();
  await expect(page.locator('#construit .decision')).toHaveCount(4);
});

test('la fiche technique : sept cases, statut à forme et mot, liens publics mesurés', async ({ page }) => {
  await page.goto(CHEMIN);
  const fiche = page.getByRole('group', { name: 'Fiche du projet' });
  await expect(fiche.locator('dt')).toHaveText(['Besoin', 'Ma part', 'Rôle', 'Période', 'Équipe', 'Statut', 'Liens publics']);
  await expect(fiche.locator('.statut')).toHaveText('Open source, sur npm');
  await expect(fiche).toContainText('Auteur et mainteneur');
  await expect(fiche.locator('a')).toHaveCount(3);
  for (const lien of await fiche.locator('a').all()) {
    const href = (await lien.getAttribute('href')) ?? '';
    await expect(lien).toHaveAttribute('data-umami-event', 'lien-sortant');
    await expect(lien).toHaveAttribute('data-umami-event-domaine', new URL(href).hostname);
    await expect(lien).toContainText('↗');
  }
});

test('trois chiffres sourcés et datés, 153 seul surligné, aucun téléchargement ni utilisateur', async ({ page }) => {
  await page.goto(CHEMIN);
  const preuves = page.locator('[data-pli="preuve"] .preuve-chiffree');
  await expect(preuves.locator('.preuve-chiffree__valeur')).toHaveText(['153', '3', '12']);
  for (const preuve of await preuves.all()) {
    await expect(preuve.locator('.preuve-chiffree__source')).toHaveText(/\d{2}\/\d{2}\/\d{4}/);
  }
  const surligne = page.locator('.projet-tete mark');
  await expect(surligne).toHaveCount(1);
  await expect(surligne).toHaveText('153');
  await expect(surligne).toHaveAttribute('data-source', /Registre du dépôt/);
  // Téléchargements npm : jamais un chiffre (décision du 13/10/2026), jamais « utilisateurs ».
  const texte = (await page.locator('main').innerText()).replace(/\s+/g, ' ');
  expect(texte).not.toMatch(/\d[\d\s]*téléchargements?/i);
  expect(texte).not.toMatch(/utilisateurs/i);
});

test('aucun lien hors du dépôt gup, de son site et de son paquet ; chaque sortie mesurée', async ({ page }) => {
  await page.goto(CHEMIN);
  const liens = await liensSortants(page);
  expect(liens.length).toBeGreaterThan(10);
  for (const lien of liens) {
    expect(SORTIES_ADMISES.some((debut) => lien.href.startsWith(debut)), lien.href).toBe(true);
    expect(lien).toMatchObject({ evenement: 'lien-sortant', domaine: new URL(lien.href).hostname, emplacement: 'preuves', rel: 'external' });
  }
  // Les preuves du dépôt sont des permaliens figés à la release relevée.
  for (const lien of liens.filter((l) => l.href.includes('/gup/blob/'))) expect(lien.href, lien.href).toContain('/blob/0c0e85ab5ee715f1abdea9f08fde243dbe634d9f/');
  for (const attendu of SORTIES_ADMISES) expect(liens.map((lien) => lien.href)).toContain(attendu);
});

test('quatre vrais écrans dans l’ordre, annotés, qui s’ouvrent en grand et se referment à Échap', async ({ page }) => {
  await page.goto(CHEMIN);
  const etapes = page.locator('#etapes .gup-etape');
  await expect(etapes).toHaveCount(4);
  await expect(etapes.locator('h3')).toHaveText(['Analyser', 'Choisir', 'Mettre à jour', 'Garder une trace']);
  await expect(etapes.locator('.cible')).toHaveCount(4);
  await expect(etapes.first().locator('img').first()).toHaveAttribute('alt', /Scoop a échoué/);
  const agrandir = etapes.first().locator('a[data-agrandir]');
  await agrandir.scrollIntoViewIfNeeded();
  await agrandir.click();
  const visionneuse = page.locator('dialog[data-visionneuse]');
  await expect(visionneuse).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(visionneuse).toBeHidden();
  await expect(agrandir).toBeFocused();
});

test('la démonstration ne met à jour que les paquets cochés, et permet de recommencer', async ({ page }) => {
  const erreurs = surveillerConsole(page);
  await page.goto(CHEMIN);
  const demo = page.locator('[data-gup-demo]');
  const lancer = demo.locator('[data-gup-update]');
  await expect(demo.locator('[data-gup-echec]')).toContainText('Scoop');
  await expect(demo.locator('[data-gup-echec]')).toContainText('Les autres sources continuent');
  await expect(lancer).toBeDisabled();
  await demo.locator('input[value="Git"]').check();
  await demo.locator('input[value="ruff"]').check();
  await expect(demo.locator('[data-gup-status]')).toHaveText('2 paquets cochés.');
  await lancer.focus();
  await page.keyboard.press('Enter');
  // Pendant le déroulé, le bouton reste visible et garde le focus.
  await expect(lancer).toBeVisible();
  await expect(lancer).toHaveAttribute('aria-disabled', 'true');
  await expect(lancer).toBeFocused();
  await expect(demo.locator('[data-gup-status]')).toHaveText('2 paquets mis à jour dans cette démonstration.');
  const ligne = (nom: string) => demo.locator('[data-gup-package]').filter({ has: page.locator(`input[value="${nom}"]`) });
  await expect(ligne('Git').locator('[data-gup-version]')).toHaveText('2.52.0');
  await expect(ligne('Git').locator('[data-gup-state]')).toHaveText('à jour');
  await expect(ligne('typescript').locator('[data-gup-version]')).toHaveText('6.0.2');
  await expect(ligne('typescript').locator('[data-gup-state]')).toHaveText('disponible');
  await expect(demo.locator('[data-gup-reset]')).toBeFocused();
  await expect(lancer).toBeHidden();
  await demo.locator('[data-gup-reset]').click();
  await expect(demo.locator('input:checked')).toHaveCount(0);
  await expect(lancer).toBeDisabled();
  await expect(ligne('Git').locator('[data-gup-version]')).toHaveText('2.51.0');
  await expect(demo.locator('input[value="Git"]')).toBeFocused();
  expect(erreurs).toEqual([]);
});

test('la démonstration passe le paquet administrateur en dernier, derrière une seule demande', async ({ page }) => {
  await page.goto(CHEMIN);
  const demo = page.locator('[data-gup-demo]');
  const ligne = (nom: string) => demo.locator('[data-gup-package]').filter({ has: page.locator(`input[value="${nom}"]`) });
  await demo.locator('input[value="nodejs-lts"]').check();
  await demo.locator('input[value="typescript"]').check();
  await demo.locator('[data-gup-update]').click();
  // Le paquet ordinaire finit avant que le lot administrateur commence.
  await expect(ligne('typescript').locator('[data-gup-state]')).toHaveText('à jour');
  await expect(demo.locator('[data-gup-status]')).toContainText(/une seule demande de droits/);
  await expect(ligne('nodejs-lts').locator('[data-gup-state]')).toHaveText('à jour');
  await expect(demo.locator('[data-gup-status]')).toHaveText(/^2 paquets mis à jour dans cette démonstration\. Le paquet administrateur est passé en dernier/);
});

test('les 153 sources : choisir un système grise celles que gup n’y lance jamais', async ({ page }) => {
  await page.goto(CHEMIN);
  const figure = page.locator('[data-visuel="GUP-F2"]');
  await expect(figure.locator('.sources__carres .carre')).toHaveCount(153);
  const bilan = figure.locator('.sources__bilan');
  await expect(bilan).toHaveText(/Sous Windows\s:\s139 sources possibles, 14 grisées/);
  for (const [systeme, possibles, grises] of [['macOS', 132, 21], ['Linux', 126, 27], ['Windows', 139, 14]] as const) {
    await figure.getByRole('radio', { name: systeme, exact: true }).check();
    await expect(bilan).toHaveText(new RegExp(`Sous ${systeme}\\s:\\s${possibles} sources possibles, ${grises} grisées`));
    // Les carrés grisés suivent : un motif de hachures, jamais la couleur seule.
    const hachures = await figure.locator('.sources__carres .carre').evaluateAll((carres) => carres.filter((c) => getComputedStyle(c).backgroundImage.includes('repeating-linear-gradient')).length);
    expect(hachures, systeme).toBe(grises);
  }
});

test('la sortie : projets voisins dans l’ordre de la vitrine, retour à la vitrine, « Discutons » vers /contact', async ({ page }) => {
  await page.goto(CHEMIN);
  const sortie = page.locator('#retiens');
  const discutons = sortie.getByRole('link', { name: /^Discutons/ });
  await expect(discutons).toHaveAttribute('href', '/contact');
  await expect(discutons).toHaveAttribute('data-umami-event', 'contact-page');
  await expect(discutons).toHaveAttribute('data-umami-event-emplacement', 'discutons');
  await expect(sortie.getByRole('link', { name: /Projet précédent\s+League Of Data Base/ })).toHaveAttribute('href', '/projets/league-of-database');
  await expect(sortie.getByRole('link', { name: /Tous les projets/ })).toHaveAttribute('href', '/projets');
  await expect(sortie.getByRole('link', { name: /Projet suivant\s+GitHealth/ })).toHaveAttribute('href', '/projets/githealth');
  // La phrase de clôture est sourcée : aucune formulation « à confirmer ».
  await expect(sortie.getByRole('heading', { level: 2 })).toHaveText('En une phrase');
  await expect(sortie).toContainText('quel que soit l’outil qui l’a installé');
  await expect(sortie.locator('.a-confirmer')).toHaveCount(0);
  // Le guide de contribution vit dans l’encart de « Tenu comme un produit », pas dans la sortie.
  await expect(sortie.getByRole('link', { name: /guide de contribution/ })).toHaveCount(0);
  await expect(page.locator('#produit').getByRole('link', { name: /guide de contribution/ })).toHaveAttribute('href', /CONTRIBUTING\.md/);
  await expect(page.locator('#produit').getByRole('link', { name: /La gouvernance/ })).toHaveAttribute('href', /GOVERNANCE\.md/);
});

test('la part de chacun : la contribution extérieure est dite, le lot administrateur ne m’est pas attribué', async ({ page }) => {
  await page.goto(CHEMIN);
  const fiche = page.getByRole('group', { name: 'Fiche du projet' });
  await expect(fiche.locator('.fiche-projet__case--part')).toContainText('l’essentiel de son code');
  const equipe = fiche.locator('.fiche-projet__case--equipe');
  await expect(equipe).toContainText('deux pull requests extérieures fusionnées en mai 2026');
  await expect(equipe.locator('.a-confirmer')).toHaveCount(0);
  // La note de sources dit d’où viennent la règle Chocolatey et le lot administrateur, preuves à l’appui.
  const sources = page.locator('#sources');
  await expect(sources).toContainText('La règle des codes 3010 et 1641 de Chocolatey et le lot administrateur unique viennent d’une contribution extérieure de mai 2026');
  // La note est repliée : ses liens ne sont exposés qu’une fois ouverte.
  await sources.locator('summary').click();
  await expect(sources.getByRole('link', { name: /n°\s22/ })).toHaveAttribute('href', 'https://github.com/LINDECKER-Charles/gup/pull/22');
  await expect(sources.getByRole('link', { name: /n°\s23/ })).toHaveAttribute('href', 'https://github.com/LINDECKER-Charles/gup/pull/23');
  await expect(page.locator('.projet-tete')).not.toContainText(/conçu, écrit/);
  // Le lot administrateur unique vient d’une contribution extérieure : pas une décision « à moi ».
  expect((await page.locator('#construit .decision').allInnerTexts()).join(' ')).not.toMatch(/UAC|administrateur/);
  await expect(page.locator('#construit')).toContainText('Un paquet par appel');
  // L’exception Scoop à la règle « sans shell » est dite, avec sa source.
  await expect(page.locator('#construit')).toContainText('Seul Scoop');
  await expect(page.locator('#sources').getByRole('link', { name: /ligne 484/ })).toHaveAttribute('href', /architecture\.md\?plain=1#L484$/);
});

test('les cibles autonomes font au moins 44 px : liens de trace et choix du système', async ({ page }) => {
  await page.goto(CHEMIN);
  const cibles = page.locator('.gup-cas a, .gup-pratiques a, .gup-autres a, [data-visuel="GUP-F2"] .sources__choix label');
  expect(await cibles.count()).toBeGreaterThan(15);
  for (const cible of await cibles.all()) {
    const boite = await cible.boundingBox();
    expect(boite?.height ?? 0, (await cible.textContent()) ?? '').toBeGreaterThanOrEqual(44);
  }
});

test('l’en-tête montre la fenêtre entière, barre de titre comprise ; la visionneuse l’agrandit', async ({ page }) => {
  await page.goto(CHEMIN);
  const vue = page.locator('.gup-entete-capture .capture__vue');
  const image = vue.locator('img');
  const [cadre, rendu] = await Promise.all([vue.boundingBox(), image.boundingBox()]);
  // Aucun recadrage : l’image remplit la vue sans la déborder, au ratio de la capture.
  expect(Math.abs(rendu!.x - cadre!.x)).toBeLessThan(1);
  expect(Math.abs(rendu!.y - cadre!.y)).toBeLessThan(1);
  expect(Math.abs(rendu!.width - cadre!.width)).toBeLessThan(1);
  expect(rendu!.width / rendu!.height).toBeCloseTo(2436 / 1578, 1);
  await expect(page.locator('.gup-entete-capture')).not.toHaveClass(/capture--region/);
  const agrandir = vue.locator('a[data-agrandir]');
  await agrandir.click();
  const visionneuse = page.locator('dialog[data-visionneuse]');
  await expect(visionneuse).toBeVisible();
  const entiere = visionneuse.locator('[data-visionneuse-image]');
  await expect(entiere).toBeVisible();
  const ratio = await entiere.evaluate((img: HTMLImageElement) => img.naturalWidth / img.naturalHeight);
  expect(ratio).toBeCloseTo(2436 / 1578, 2);
});

test('les loupes ne recouvrent pas leur cible ; sous 560 px, elles passent sous l’écran', async ({ page }) => {
  await page.goto(CHEMIN);
  for (const etape of await page.locator('#etapes .gup-etape').all()) {
    await etape.scrollIntoViewIfNeeded();
    const [loupe, cible, ecran] = await Promise.all([etape.locator('.loupe').boundingBox(), etape.locator('.cible').boundingBox(), etape.locator('.capture__vue > a img').boundingBox()]);
    const separees = loupe!.x > cible!.x + cible!.width || loupe!.y > cible!.y + cible!.height || loupe!.x + loupe!.width < cible!.x || loupe!.y + loupe!.height < cible!.y;
    expect(separees).toBe(true);
    if ((page.viewportSize()?.width ?? 0) <= 560) {
      expect(loupe!.y).toBeGreaterThanOrEqual(ecran!.y + ecran!.height);
      expect(loupe!.width).toBeGreaterThan(ecran!.width - 2);
      // La légende vient après la loupe, sans chevauchement.
      const legende = await etape.locator('.capture__legende').boundingBox();
      expect(legende!.y).toBeGreaterThanOrEqual(loupe!.y + loupe!.height);
    }
  }
});

test('une seule navigation de page, sans la note de sources', async ({ page }) => {
  await page.goto(CHEMIN);
  const navigation = page.locator('nav[aria-label="Dans cette page"]');
  await expect(navigation).toHaveCount(1);
  if ((page.viewportSize()?.width ?? 0) > 1100) await expect(navigation).toBeVisible();
  const attendus = ['#probleme', '#etapes', '#essai', '#regles', '#produit', '#construit', '#retiens'];
  expect(await navigation.locator('a').evaluateAll((liens) => liens.map((lien) => lien.getAttribute('href')))).toEqual(attendus);
  for (const ancre of attendus) await expect(page.locator(ancre)).toHaveCount(1);
  await expect(page.locator('#sources')).toContainText('0.4.0');
});

test('GUP-02 : six pictos dessinés, en ligne et muets, à la place du cadre hachuré', async ({ page }) => {
  await page.goto(CHEMIN);
  const pictos = page.locator('#construit [data-visuel="GUP-02"]');
  await expect(pictos).toHaveCount(1);
  await expect(pictos).not.toHaveAttribute('data-manquant', /.*/);
  await expect(pictos.locator('svg')).toHaveAttribute('aria-hidden', 'true');
  await expect(pictos.locator('svg > g')).toHaveCount(6);
  await expect(page.locator('[data-manquant][data-visuel="GUP-02"]')).toHaveCount(0);
});

for (const theme of ['jour', 'nuit'] as const) {
  test.describe(`axe, ${theme}, états ouverts`, () => {
    test.use({ colorScheme: theme === 'nuit' ? 'dark' : 'light', reducedMotion: 'reduce' });

    test('démonstration terminée et sources filtrées restent accessibles', async ({ page }) => {
      await page.goto(CHEMIN);
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      const demo = page.locator('[data-gup-demo]');
      await demo.locator('input[value="nodejs-lts"]').check();
      await demo.locator('input[value="Git"]').check();
      await demo.locator('[data-gup-update]').click();
      await expect(demo.locator('[data-gup-reset]')).toBeVisible();
      await page.locator('[data-visuel="GUP-F2"]').getByRole('radio', { name: 'macOS', exact: true }).check();
      for (const zone of ['.projet-tete', '#etapes', '#essai', '#regles', '#produit', '#construit']) {
        const resultats = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']).include(zone).analyze();
        expect(resultats.violations.map((v) => ({ id: v.id, cibles: v.nodes.slice(0, 3).map((n) => n.target) })), zone).toEqual([]);
      }
    });
  });
}

test.describe('sans JavaScript', () => {
  test.use({ javaScriptEnabled: false, reducedMotion: 'reduce' });

  test('la page est complète : en-tête, écrans, démonstration figée, figure des sources qui filtre encore', async ({ page }) => {
    const erreurs = surveillerConsole(page);
    await page.goto(CHEMIN);
    for (const marque of ['titre', 'identite', 'preuve', 'action']) await expect(page.locator(`[data-pli="${marque}"]`)).toBeInViewport();
    await expect(page.locator('#etapes .gup-etape img').first()).toBeVisible();
    const demo = page.locator('[data-gup-demo]');
    await expect(demo.locator('[data-gup-package]')).toHaveCount(5);
    await expect(demo.getByRole('button')).toHaveCount(0);
    await expect(page.getByText('Sans JavaScript, la démonstration reste figée')).toBeVisible();
    // La figure des 153 sources n’a pas besoin de script : radios et :has().
    const figure = page.locator('[data-visuel="GUP-F2"]');
    await figure.getByRole('radio', { name: 'Linux', exact: true }).check();
    await expect(figure.locator('.sources__bilan')).toHaveText(/Sous Linux\s:\s126 sources possibles/);
    await page.locator('[data-pli="action"]').getByRole('link', { name: /Comment je l’ai construit/ }).click();
    expect(new URL(page.url()).hash).toBe('#construit');
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
    expect(erreurs).toEqual([]);
  });
});
