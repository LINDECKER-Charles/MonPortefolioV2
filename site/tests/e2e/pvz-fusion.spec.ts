import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { surveillerConsole } from './support/navigateur';

/**
 * PvZ Fusion, pôle francophone : la première page sur le gabarit commun des
 * pages de projet (règle E5). En-tête au pli à 1 440 et 390 px (E1), fiche
 * à sept cases, chiffres sourcés et datés, liens publics seulement, la
 * gestion de projet en quatre cartes, la sortie commune, la page complète
 * sans JavaScript et accessible jour et nuit, états ouverts compris.
 */

const CHEMIN = '/projets/pvz-fusion';

/** Les seules sorties admises depuis la page (liste blanche, cahier § 5.3). */
const SORTIES_ADMISES = [
  'https://github.com/Teyliu/PVZF-Translation',
  'https://github.com/LINDECKER-Charles/PVZ-Fuzion-ConsolManager',
  'https://lindecker-charles.github.io/PVZ-Fuzion-ConsolManager/',
  'https://www.npmjs.com/package/@charles_lindecker/pvzf-console',
  'https://github.com/LINDECKER-Charles/PVZF-Translation-fr/blob/',
];

async function liensSortants(page: Page) {
  return page.locator('main a[href^="http"]').evaluateAll((liens) =>
    liens.map((lien) => ({
      href: lien.getAttribute('href') ?? '',
      evenement: lien.getAttribute('data-umami-event'),
      domaine: lien.getAttribute('data-umami-event-domaine'),
      emplacement: lien.getAttribute('data-umami-event-emplacement'),
      rel: lien.getAttribute('rel'),
      dansLesSources: Boolean(lien.closest('#sources')),
    })),
  );
}

test('l’en-tête tient dans le premier écran : titre, identité, preuve, action', async ({ page }) => {
  await page.goto(CHEMIN);
  for (const marque of ['titre', 'identite', 'preuve', 'action']) {
    await expect(page.locator(`[data-pli="${marque}"]`), marque).toBeInViewport();
  }
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('PvZ Fusion, pôle francophone Traduire un jeu. Faire grandir une équipe.');
  // À 1 440 × 900, tout l’en-tête est au pli, chiffres et fiche compris.
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
  const ariane = page.getByRole('navigation', { name: 'Fil d’Ariane', exact: true });
  await expect(ariane.locator('[aria-current="page"]')).toHaveText('PvZ Fusion, pôle francophone');
  const entete = page.locator('.projet-tete');
  await expect(entete).toContainText('Une équipe formée et menée');
  const construit = entete.locator('[data-pli="action"]').getByRole('link', { name: /Sous le capot/ });
  await expect(construit).toHaveAttribute('href', '#construit');
  await construit.click();
  await expect(page.locator('#construit')).toBeInViewport();
  await expect(page.locator('#construit .point-capot')).toHaveCount(3);
});

test('la fiche technique : sept cases à filets, statut à forme et mot, liens publics mesurés', async ({ page }) => {
  await page.goto(CHEMIN);
  const fiche = page.getByRole('group', { name: 'Fiche du projet' });
  await expect(fiche.locator('dt')).toHaveText(['Besoin', 'Ma part', 'Rôle', 'Période', 'Équipe', 'Statut', 'Liens publics']);
  await expect(fiche).toContainText('lead depuis décembre 2025');
  await expect(fiche.locator('.statut')).toHaveText('En cours, bénévole');
  for (const lien of await fiche.locator('a').all()) {
    const href = (await lien.getAttribute('href')) ?? '';
    await expect(lien).toHaveAttribute('data-umami-event', 'lien-sortant');
    await expect(lien).toHaveAttribute('data-umami-event-domaine', new URL(href).hostname);
    await expect(lien).toContainText('↗');
  }
});

test('trois chiffres sourcés et datés, un seul surligné, la part personnelle en note de sources', async ({ page }) => {
  await page.goto(CHEMIN);
  const preuves = page.locator('[data-pli="preuve"] .preuve-chiffree');
  await expect(preuves.locator('.preuve-chiffree__valeur')).toHaveText(['20', '1\u00a0335 → 0', '35']);
  for (const preuve of await preuves.all()) {
    await expect(preuve.locator('.preuve-chiffree__source')).toHaveText(/\d{2}\/\d{2}\/\d{4}/);
  }
  const surligne = page.locator('.projet-tete mark');
  await expect(surligne).toHaveCount(1);
  // Le même chiffre surligné que sur l’accueil et la vitrine : 20 personnes formées.
  await expect(surligne).toHaveText('20');
  await expect(surligne).toHaveAttribute('data-source', /Témoignage/);
  // 4 862 sur 5 179 : seulement dans la note de sources, jamais sous le titre.
  await expect(page.locator('.projet-tete')).not.toContainText(/4\s?862/);
  await expect(page.locator('#sources')).toContainText(/4\s862 dans mon bilan/);
  await expect(page.locator('main').getByText(/4\s862/)).toHaveCount(1);
});

test('la cadence, le rattrapage et ses limites sont dits tels que les sources les donnent', async ({ page }) => {
  await page.goto(CHEMIN);
  const main = page.locator('main');
  // 15 versions du jeu en 25 publications : pas « toutes les deux ou trois semaines ».
  await expect(main).not.toContainText(/deux ou trois semaines/);
  await expect(page.locator('.projet-tete')).toContainText('quinze versions en quatorze mois');
  await expect(page.locator('#sources')).toContainText(/25\spublications .* pour 15\sversions distinctes du jeu/);
  // Le retard a disparu, sans promettre qu’il ne revient plus.
  await expect(page.locator('#resultat h2')).toHaveText('Rattraper le retard');
  await expect(page.locator('#resultat')).toContainText(/la 4\.0\.5 ajoute 29\sentrées à traduire/);
  await expect(main).not.toContainText(/ne plus décrocher|avant même sa sortie/);
  // Les écarts du bilan, conservés tels quels.
  await expect(page.locator('#sources')).toContainText(/4\s853 nouvelles traductions et 293 ajustements/);
  await expect(page.locator('#sources')).toContainText('douze autres membres du bilan');
  await expect(page.locator('#equipe')).toContainText('ma première pull request date du 16');
  await expect(page.locator('#equipe .pvz-temps h3')).toHaveText(['Accueillir', 'Former et relire', 'Contribuer en autonomie']);
  await expect(page.locator('#construit')).toContainText('la PR #110 en crédite huit');
});

test('aucun lien hors de la liste blanche, chaque sortie mesurée, le fork seulement dans les sources', async ({ page }) => {
  await page.goto(CHEMIN);
  const liens = await liensSortants(page);
  expect(liens.length).toBeGreaterThan(5);
  for (const lien of liens) {
    expect(SORTIES_ADMISES.some((debut) => lien.href.startsWith(debut)), lien.href).toBe(true);
    expect(lien.href).not.toMatch(/PVZ-Modding-Tutorial-Web|modding\.pvzf-almanac\.com/);
    expect(lien).toMatchObject({ evenement: 'lien-sortant', domaine: new URL(lien.href).hostname, emplacement: 'preuves', rel: 'external' });
    if (lien.href.includes('PVZF-Translation-fr')) expect(lien.dansLesSources, lien.href).toBe(true);
  }
  for (const attendu of ['https://github.com/Teyliu/PVZF-Translation/pull/110', 'https://lindecker-charles.github.io/PVZ-Fuzion-ConsolManager/', 'https://www.npmjs.com/package/@charles_lindecker/pvzf-console']) {
    expect(liens.map((lien) => lien.href)).toContain(attendu);
  }
});

test('la gestion de projet en quatre cartes, dans l’ordre de la semaine, et l’outil du pôle', async ({ page }) => {
  await page.goto(CHEMIN);
  const semaine = page.locator('#semaine');
  const cartes = semaine.getByRole('list', { name: 'La semaine type, en quatre gestes' }).locator(':scope > li');
  await expect(cartes).toHaveCount(4);
  await expect(cartes.locator('h3')).toHaveText(['Un endroit pour avancer ensemble.', 'Faire du travail une livraison.', 'Donner envie de se dépasser.', 'Prendre le temps de dire merci.']);
  await expect(cartes.locator('[data-visuel]')).toHaveCount(4);
  expect(await cartes.locator('[data-visuel]').evaluateAll((v) => v.map((e) => e.getAttribute('data-visuel')))).toEqual(['PVZ-05', 'PVZ-07', 'PVZ-08', 'PVZ-11']);
  await expect(cartes.nth(1).getByRole('link', { name: /La PR #110 et ses huit crédits/ })).toHaveAttribute('href', 'https://github.com/Teyliu/PVZF-Translation/pull/110');
  await expect(semaine.getByRole('heading', { level: 3, name: /Console Manager/ })).toBeVisible();
  await expect(semaine).toContainText('19 langues');
});

test('la sortie : projet suivant de la vitrine, retour à la vitrine, « Discutons » vers /contact', async ({ page }) => {
  await page.goto(CHEMIN);
  const sortie = page.locator('#retiens');
  const discutons = sortie.getByRole('link', { name: /^Discutons/ });
  await expect(discutons).toHaveAttribute('href', '/contact');
  await expect(discutons).toHaveAttribute('data-umami-event', 'contact-page');
  await expect(discutons).toHaveAttribute('data-umami-event-emplacement', 'discutons');
  await expect(sortie.getByRole('link', { name: /Projet suivant\s+Omnicard/ })).toHaveAttribute('href', '/projets/omnicard');
  await expect(sortie.getByRole('link', { name: /Tous les projets/ })).toHaveAttribute('href', '/projets');
  await expect(sortie).not.toContainText('Projet précédent');
});

test('une seule navigation de page, sans la note de sources, et ses intitulés en sur-titre des sections', async ({ page }) => {
  await page.goto(CHEMIN);
  // Après un clic dans le sommaire, le lecteur retrouve le mot choisi au-dessus du titre.
  for (const [ancre, intitule] of [['#depart', 'Le point de départ'], ['#equipe', 'L’équipe'], ['#semaine', 'La semaine type'], ['#resultat', 'Le résultat']]) {
    await expect(page.locator(`${ancre} .section-projet__etiquette`)).toHaveText(intitule);
  }
  // Une seule navigation de page (E4) : en colonne au-delà de 1 100 px, masquée en dessous.
  const navigation = page.locator('nav[aria-label="Dans cette page"]');
  await expect(navigation).toHaveCount(1);
  if ((page.viewportSize()?.width ?? 0) > 1100) await expect(navigation).toBeVisible();
  const attendus = ['#depart', '#equipe', '#semaine', '#resultat', '#construit', '#retiens'];
  expect(await navigation.locator('a').evaluateAll((liens) => liens.map((lien) => lien.getAttribute('href')))).toEqual(attendus);
  for (const ancre of attendus) await expect(page.locator(ancre)).toHaveCount(1);
});

test('dépliés, les relevés défilent dans leur cadre sans élargir la page', async ({ page }) => {
  await page.goto(CHEMIN);
  await page.locator('.rattrapage__releves summary').click();
  const largeur = page.viewportSize()?.width ?? 0;
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  const titre = await page.locator('figcaption.rattrapage__titre').boundingBox();
  expect(titre!.x + titre!.width).toBeLessThanOrEqual(largeur);
  const [visible, totale] = await page.locator('.rattrapage__table').evaluate((cadre) => [cadre.clientWidth, cadre.scrollWidth]);
  expect(visible).toBeLessThanOrEqual(largeur);
  if (largeur < 600) expect(totale).toBeGreaterThan(visible);
});

test('les dates de la frise de l’équipe existent aussi en texte', async ({ page }) => {
  await page.goto(CHEMIN);
  const texte = page.locator('#equipe .pvz-equipe ul.sr');
  await expect(texte.locator('li')).toHaveText([
    'Traducteur le 21/10/2025',
    'Lead du pôle le 05/12/2025',
    'Mainteneur au plus tard le 26/09/2026',
    /^Arrivées consignées dans les journaux publics du pôle\s:\sdeux le 08\/12\/2025, une le 15\/12\/2025, une le 22\/12\/2025, une le 16\/02\/2026, une le 20\/02\/2026, une le 02\/03\/2026, deux le 23\/03\/2026\.$/,
  ]);
  for (const scene of ['pvz-equipe', 'pvz-rattrapage']) await expect(page.locator(`[data-scene="${scene}"]`)).toBeEnabled();
});

test('les relevés du rattrapage s’ouvrent au clavier, en tableau', async ({ page }) => {
  await page.goto(CHEMIN);
  const releves = page.locator('.rattrapage__releves');
  await releves.locator('summary').focus();
  await page.keyboard.press('Enter');
  await expect(releves).toHaveAttribute('open', '');
  const lignes = releves.locator('tbody tr');
  await expect(lignes).toHaveCount(8);
  await expect(lignes.first()).toContainText('1 335');
  await expect(releves.locator('.rattrapage__atteint')).toContainText('15/08/2026');
});

for (const theme of ['jour', 'nuit'] as const) {
  test.describe(`axe, ${theme}, états ouverts`, () => {
    test.use({ colorScheme: theme === 'nuit' ? 'dark' : 'light', reducedMotion: 'reduce' });

    test('les relevés ouverts et le texte d’origine affiché restent accessibles', async ({ page }) => {
      await page.goto(CHEMIN);
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await page.locator('.rattrapage__releves summary').click();
      await page.locator('[data-pvz-traduction]').getByRole('button', { name: 'Texte d’origine', exact: true }).click();
      for (const zone of ['#resultat', '.projet-tete', '#semaine']) {
        const resultats = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']).include(zone).analyze();
        expect(resultats.violations.map((v) => ({ id: v.id, cibles: v.nodes.slice(0, 3).map((n) => n.target) })), zone).toEqual([]);
      }
    });
  });
}

test.describe('sans JavaScript', () => {
  test.use({ javaScriptEnabled: false, reducedMotion: 'reduce' });

  test('la page est complète : en-tête, figures dessinées, démonstration en français, ancres', async ({ page }) => {
    const erreurs = surveillerConsole(page);
    await page.goto(CHEMIN);
    for (const marque of ['titre', 'identite', 'preuve', 'action']) await expect(page.locator(`[data-pli="${marque}"]`)).toBeInViewport();
    for (const scene of ['pvz-equipe', 'pvz-rattrapage']) {
      const dessin = page.locator(`[data-scene="${scene}"] svg:visible`);
      await expect(dessin).toHaveCount(1);
      await dessin.scrollIntoViewIfNeeded();
      await expect(dessin).toBeVisible();
      // Rien ne rejouerait la scène : le bouton est désactivé, hors de la tabulation.
      await expect(page.locator(`[data-scene="${scene}"]`)).toBeDisabled();
    }
    const demo = page.locator('[data-pvz-traduction]');
    await expect(demo.locator('#extraits-francais')).toBeVisible();
    await expect(demo.locator('#extraits-origine')).toBeHidden();
    await expect(demo.getByRole('button')).toHaveCount(0);
    await page.locator('[data-pli="action"]').getByRole('link', { name: /Sous le capot/ }).click();
    expect(new URL(page.url()).hash).toBe('#construit');
    await expect(page.locator('#construit')).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
    expect(erreurs).toEqual([]);
  });
});
