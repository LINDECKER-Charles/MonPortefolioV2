import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { surveillerConsole } from './support/navigateur';
import { motifsPage, motifsTrouves } from '../support/prive';

/**
 * Karl Scraper, sur le gabarit commun des pages de projet (règle E5) : en-tête
 * au pli (E1), fiche à sept cases en variante « dépôt privé », trois chiffres
 * sourcés dont un seul surligné, aucune sortie du site (dépôt privé, décision
 * de Charles du 14/10/2026), rien qui nomme l’outil source ni une donnée privée,
 * quatre vrais écrans agrandissables, la chaîne d’un ticket (KSC-F1), la
 * sortie commune entre GitHealth et Sillage, et la page complète et
 * accessible sans script, jour et nuit.
 */

const CHEMIN = '/projets/karl-scraper';

/** Dépôt privé : aucune sortie admise depuis le contenu de la page. */
const SORTIES_ADMISES: readonly string[] = [];

/** Le texte et les attributs lus par un visiteur ou un lecteur d’écran (alt, title, aria-label). */
async function texteEtAttributs(page: Page) {
  return page.locator('main').evaluate((main) => {
    const attributs = [...main.querySelectorAll('[alt], [title], [aria-label], [data-legende]')].flatMap((el) =>
      ['alt', 'title', 'aria-label', 'data-legende'].map((nom) => el.getAttribute(nom) ?? ''),
    );
    return `${main.textContent ?? ''} ${attributs.join(' ')}`.replace(/\s+/g, ' ');
  });
}

test('l’en-tête tient dans le premier écran : titre, identité, preuve, action', async ({ page }) => {
  await page.goto(CHEMIN);
  for (const marque of ['titre', 'identite', 'preuve', 'action']) {
    await expect(page.locator(`[data-pli="${marque}"]`), marque).toBeInViewport();
  }
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Automatiser le chemin d’un ticket. Sans ouvrir l’outil aux agents.');
  if ((page.viewportSize()?.width ?? 0) >= 1440) {
    await expect(page.locator('[data-pli="preuve"] li')).toHaveCount(3);
    for (const preuve of await page.locator('[data-pli="preuve"] li').all()) await expect(preuve).toBeInViewport({ ratio: 1 });
  } else {
    await expect(page.locator('[data-pli="preuve"] li').first()).toBeInViewport({ ratio: 1 });
  }
});

test('le nom canonique, l’étiquette de preuve et « Sous le capot »', async ({ page }) => {
  await page.goto(CHEMIN);
  const ariane = page.getByRole('navigation', { name: 'Fil d’Ariane', exact: true });
  await expect(ariane.locator('[aria-current="page"]')).toHaveText('Karl Scraper');
  const entete = page.locator('.projet-tete');
  await expect(entete).toContainText('Automatiser des tâches');
  const construit = entete.locator('[data-pli="action"]').getByRole('link', { name: /Sous le capot/ });
  await expect(construit).toHaveAttribute('href', '#construit');
  await expect(entete.locator('[data-pli="action"] a')).toHaveCount(1);
  await construit.click();
  await expect(page.locator('#construit')).toBeInViewport();
  await expect(page.locator('#construit .point-capot')).toHaveCount(10);
});

test('la fiche technique : sept cases, statut à forme et mot, dépôt privé sans aucun lien', async ({ page }) => {
  await page.goto(CHEMIN);
  const fiche = page.getByRole('group', { name: 'Fiche du projet' });
  await expect(fiche.locator('dt')).toHaveText(['Besoin', 'Ma part', 'Rôle', 'Période', 'Équipe', 'Statut', 'Liens publics']);
  // Seul ce qui est sourcé s’affiche : le service tourne sur le poste ; la présentation en projet
  // personnel est validée le 15/10/2026 (Q92).
  await expect(fiche.locator('.statut')).toHaveText('Outil personnel, en service sur mon poste');
  // Plus aucune marque « à confirmer » depuis le 15/10/2026.
  await expect(fiche).not.toContainText('à confirmer');
  await expect(fiche.locator('.fiche-projet__case--part')).toContainText('282 commits');
  await expect(fiche.locator('.fiche-projet__case--liens')).toHaveText(/Aucun\s:\sle code est dans un dépôt privé\./);
  await expect(fiche.locator('a')).toHaveCount(0);
  const discuter = page.locator('.fiche-projet__discuter a');
  await expect(discuter).toHaveAttribute('href', '/contact');
  await expect(discuter).toHaveAttribute('data-umami-event-emplacement', 'fiche-projet');
});

test('trois chiffres sourcés et datés, 18 seul surligné, chacun mène à sa section', async ({ page }) => {
  await page.goto(CHEMIN);
  const preuves = page.locator('[data-pli="preuve"] .preuve-chiffree');
  await expect(preuves.locator('.preuve-chiffree__valeur')).toHaveText(['18', '13', '1']);
  for (const preuve of await preuves.all()) {
    await expect(preuve.locator('.preuve-chiffree__source')).toHaveText(/du dépôt, relevé le 14\/10\/2026$/);
  }
  expect(await preuves.locator('a').evaluateAll((liens) => liens.map((lien) => lien.getAttribute('href')))).toEqual(['#chaine', '#agent', '#construit']);
  const surligne = page.locator('.projet-tete mark');
  await expect(surligne).toHaveCount(1);
  await expect(surligne).toHaveText('18');
  await expect(surligne).toHaveAttribute('data-source', /Catalogue des enchaînements du dépôt/);
});

test('dépôt privé : aucune sortie du site depuis la page, et aucun nom de dépôt', async ({ page }) => {
  await page.goto(CHEMIN);
  const sorties = await page.locator('main a[href^="http"]').evaluateAll((liens) => liens.map((lien) => lien.getAttribute('href') ?? ''));
  expect(sorties.filter((href) => !SORTIES_ADMISES.some((debut) => href.startsWith(debut)))).toEqual([]);
  await expect(page.locator('main a[href*="github.com"]')).toHaveCount(0);
  // Les liens de l’écosystème restent internes.
  const chaine = page.locator('#chaine');
  await expect(chaine.getByRole('link', { name: 'Relais', exact: true })).toHaveAttribute('href', '/projets/relais');
  await expect(chaine.getByRole('link', { name: 'Sillage', exact: true })).toHaveAttribute('href', '/projets/sillage');
});

test('rien ne nomme une donnée privée ni une référence réelle : « Karl » n’existe que dans « Karl Scraper »', async ({ page }) => {
  await page.goto(CHEMIN);
  const texte = await texteEtAttributs(page);
  // Motifs du cadrage privé (tests/support/prive.ts), désignés par leur numéro.
  expect(motifsTrouves(texte, motifsPage('karl-scraper'))).toEqual([]);
  // Chaque « Karl » est suivi de « Scraper » (texte, alts, légendes et titres compris).
  expect(texte.match(/\bKarl\b(?!\sScraper)/gi) ?? []).toEqual([]);
  // Aucun volume réel de tâches : la démonstration compte seize tâches fictives.
  expect(texte).not.toMatch(/\b181\b/);
  await expect(page.locator('#sources')).toContainText('données fictives');
  await expect(page.locator('#sources')).toContainText('6615950');
});

test('quatre vrais écrans : l’en-tête recadré sur sa colonne, chacun s’ouvre en grand et se referme à Échap', async ({ page }) => {
  await page.goto(CHEMIN);
  const entete = page.locator('.ksc-entete-capture');
  await expect(entete).toHaveClass(/capture--region/);
  await expect(entete.locator('img').first()).toHaveAttribute('alt', /deux règles qui retiennent une lecture et la confient à Relais/);
  const captures = page.locator('main .capture a[data-agrandir]');
  await expect(captures).toHaveCount(4);
  const agrandir = page.locator('#copie a[data-agrandir]');
  await agrandir.scrollIntoViewIfNeeded();
  await agrandir.click();
  const visionneuse = page.locator('dialog[data-visionneuse]');
  await expect(visionneuse).toBeVisible();
  // La visionneuse montre l’écran entier, pas le recadrage. Son image se charge à
  // l’ouverture : ses dimensions se lisent une fois chargée.
  const entiere = visionneuse.locator('[data-visionneuse-image]');
  await expect.poll(() => entiere.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
  const ratio = await entiere.evaluate((img: HTMLImageElement) => img.naturalWidth / img.naturalHeight);
  expect(ratio).toBeCloseTo(2392 / 562, 1);
  await page.keyboard.press('Escape');
  await expect(visionneuse).toBeHidden();
  await expect(agrandir).toBeFocused();
});

test('la Galaxie, toujours sombre, vit dans un acte de veille, et sa loupe lit le compte d’en-tête', async ({ page }) => {
  await page.goto(CHEMIN);
  const galaxie = page.locator('#galaxie');
  expect(await galaxie.evaluate((section) => Boolean(section.closest('.acte-veille')))).toBe(true);
  await expect(galaxie.locator('img').first()).toHaveAttribute('alt', /seize tâches fictives/);
  await expect(galaxie.locator('.capture__legende')).toContainText('le goulot');
  const capture = galaxie.locator('.capture-annotee');
  await capture.scrollIntoViewIfNeeded();
  const imageLoupe = capture.locator('.loupe img');
  await expect.poll(() => imageLoupe.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  const [loupe, detail, ecran] = await Promise.all([capture.locator('.loupe').boundingBox(), imageLoupe.boundingBox(), capture.locator('.capture__vue > a img').boundingBox()]);
  // L’image de la loupe est entière (2400 × 1350) et agrandie : le compte s’y lit.
  expect(detail!.width / detail!.height).toBeCloseTo(2400 / 1350, 1);
  expect(detail!.width).toBeGreaterThan(loupe!.width * 3.5);
  // La capture entière, à son ratio, et assez large pour la page.
  expect(ecran!.width / ecran!.height).toBeCloseTo(2400 / 1350, 1);
  if ((page.viewportSize()?.width ?? 0) >= 1440) expect(ecran!.width).toBeGreaterThan(800);
});

test('l’en-tête : sur mobile, les deux règles seules, lisibles ; sur ordinateur, la colonne entière', async ({ page }) => {
  await page.goto(CHEMIN);
  const vue = page.locator('.ksc-entete-capture .capture__vue');
  const boite = await vue.boundingBox();
  const ratio = boite!.width / boite!.height;
  if ((page.viewportSize()?.width ?? 0) <= 860) expect(ratio).toBeCloseTo((0.39 * 2728) / (0.46 * 1278), 1);
  else expect(ratio).toBeCloseTo((0.59 * 2728) / 1278, 1);
});

test('sur mobile, l’écart seul se lit ; sur ordinateur, les trois panneaux', async ({ page }) => {
  await page.goto(CHEMIN);
  const vue = page.locator('#copie .capture__vue');
  await vue.scrollIntoViewIfNeeded();
  const boite = await vue.boundingBox();
  const ratio = boite!.width / boite!.height;
  if ((page.viewportSize()?.width ?? 0) <= 860) expect(ratio).toBeCloseTo(801 / 562, 1);
  else expect(ratio).toBeCloseTo(2392 / 562, 1);
});

test('la loupe de la vue agent : l’image garde sa proportion, ne couvre pas la cible, passe dessous sous 560 px', async ({ page }) => {
  await page.goto(CHEMIN);
  const capture = page.locator('#agent .capture-annotee');
  await capture.scrollIntoViewIfNeeded();
  const imageLoupe = capture.locator('.loupe img');
  await expect.poll(() => imageLoupe.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  const [loupe, cible, ecran, detail] = await Promise.all([
    capture.locator('.loupe').boundingBox(),
    capture.locator('.cible').boundingBox(),
    capture.locator('.capture__vue > a img').boundingBox(),
    capture.locator('.loupe img').boundingBox(),
  ]);
  // L’image de la loupe est entière (1696 × 1668), pas écrasée à la hauteur de la loupe.
  expect(detail!.width / detail!.height).toBeCloseTo(1696 / 1668, 1);
  expect(detail!.height).toBeGreaterThan(loupe!.height * 2);
  const separees = loupe!.x > cible!.x + cible!.width || loupe!.y > cible!.y + cible!.height || loupe!.x + loupe!.width < cible!.x || loupe!.y + loupe!.height < cible!.y;
  expect(separees).toBe(true);
  if ((page.viewportSize()?.width ?? 0) <= 560) {
    expect(loupe!.y).toBeGreaterThanOrEqual(ecran!.y + ecran!.height);
    expect(loupe!.width).toBeGreaterThan(ecran!.width - 2);
  }
});

test('la chaîne d’un ticket : cinq étapes, une seule écrit dans l’outil source, et seulement le statut', async ({ page }) => {
  await page.goto(CHEMIN);
  const figure = page.locator('#chaine [data-visuel="KSC-F1"]');
  const etapes = figure.locator('.chaine__etape');
  await expect(etapes).toHaveCount(5);
  await expect(etapes.locator('.chaine__geste')).toHaveText(['Synchroniser', 'Comprendre', 'Trancher', 'Réaliser', 'Poser le statut']);
  await expect(figure.locator('.chaine__etape--statut')).toHaveCount(1);
  await expect(figure.locator('.chaine__etape--statut .chaine__acces')).toHaveText(/y écrit le statut/);
  await expect(figure.locator('.chaine__etape--lecture')).toHaveCount(1);
  // L’agent qui prépare lit une copie déposée par le service, jamais le serveur MCP.
  await expect(etapes.nth(1).locator('.chaine__texte')).toContainText('dossier que le service lui prépare');
  await expect(figure).not.toContainText('MCP');
  // Les flèches entre étapes sont muettes pour les lecteurs d’écran.
  const flecheMuette = await etapes.first().evaluate((li) => getComputedStyle(li, '::after').content);
  expect(flecheMuette).toMatch(/\/\s*""$/);
  // Ce qui n’est pas livré n’est pas présenté : aucune règle fournie, l’interrupteur coupé par défaut.
  await expect(page.locator('#chaine')).toContainText('Aucune règle n’est livrée');
});

test('la sortie : GitHealth avant, Sillage après, retour à la vitrine, « Discutons » vers /contact', async ({ page }) => {
  await page.goto(CHEMIN);
  const sortie = page.locator('#retiens');
  await expect(sortie.getByRole('heading', { level: 2 })).toHaveText('Où il en est');
  const discutons = sortie.getByRole('link', { name: /^Discutons/ });
  await expect(discutons).toHaveAttribute('href', '/contact');
  await expect(discutons).toHaveAttribute('data-umami-event', 'contact-page');
  await expect(discutons).toHaveAttribute('data-umami-event-emplacement', 'discutons');
  await expect(sortie.getByRole('link', { name: /Projet précédent\s+GitHealth/ })).toHaveAttribute('href', '/projets/githealth');
  await expect(sortie.getByRole('link', { name: /Projet suivant\s+Sillage/ })).toHaveAttribute('href', '/projets/sillage');
  await expect(sortie.getByRole('link', { name: /Tous les projets/ })).toHaveAttribute('href', '/projets');
  await expect(sortie.locator('a[href^="http"]')).toHaveCount(0);
  await expect(sortie).toContainText('les écrans de cette page sont provisoires');
});

test('une seule navigation de page, sans la note de sources', async ({ page }) => {
  await page.goto(CHEMIN);
  const navigation = page.locator('nav[aria-label="Dans cette page"]');
  await expect(navigation).toHaveCount(1);
  if ((page.viewportSize()?.width ?? 0) > 1100) await expect(navigation).toBeVisible();
  const attendus = ['#copie', '#galaxie', '#agent', '#chaine', '#fonctions', '#construit', '#retiens'];
  expect(await navigation.locator('a').evaluateAll((liens) => liens.map((lien) => lien.getAttribute('href')))).toEqual(attendus);
  for (const ancre of attendus) await expect(page.locator(ancre)).toHaveCount(1);
});

for (const theme of ['jour', 'nuit'] as const) {
  test.describe(`axe, ${theme}`, () => {
    test.use({ colorScheme: theme === 'nuit' ? 'dark' : 'light', reducedMotion: 'reduce' });

    test('en-tête, écrans, chaîne, décisions et sortie restent accessibles', async ({ page }) => {
      await page.goto(CHEMIN);
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await page.locator('#sources summary').click();
      for (const zone of ['.projet-tete', '#copie', '#galaxie', '#agent', '#chaine', '#fonctions', '#construit', '#retiens', '#sources']) {
        // En haut de page : l’en-tête collant ne recouvre aucune cible (règle target-size).
        await page.evaluate(() => window.scrollTo(0, 0));
        const resultats = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']).include(zone).analyze();
        expect(resultats.violations.map((v) => ({ id: v.id, cibles: v.nodes.slice(0, 3).map((n) => n.target) })), zone).toEqual([]);
      }
    });
  });
}

test.describe('sans JavaScript', () => {
  test.use({ javaScriptEnabled: false, reducedMotion: 'reduce' });

  test('la page est complète : en-tête, écrans, chaîne, sortie et sources', async ({ page }) => {
    const erreurs = surveillerConsole(page);
    await page.goto(CHEMIN);
    for (const marque of ['titre', 'identite', 'preuve', 'action']) await expect(page.locator(`[data-pli="${marque}"]`)).toBeInViewport();
    for (const zone of ['.projet-tete', '#copie', '#galaxie', '#agent']) {
      const image = page.locator(`${zone} .capture__vue img`).first();
      await image.scrollIntoViewIfNeeded();
      await expect(image, zone).toBeVisible();
      await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0), zone).toBe(true);
    }
    await expect(page.locator('#chaine .chaine__etape')).toHaveCount(5);
    await page.locator('[data-pli="action"]').getByRole('link', { name: /Sous le capot/ }).click();
    expect(new URL(page.url()).hash).toBe('#construit');
    await page.locator('#sources summary').click();
    await expect(page.locator('#sources')).toContainText('faux serveur source');
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
    expect(erreurs).toEqual([]);
  });
});
