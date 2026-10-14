import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { surveillerConsole } from './support/navigateur';

/**
 * GitHealth, sur le gabarit commun des pages de projet (règle E5) : en-tête
 * au pli (E1), fiche à sept cases, trois chiffres sourcés et datés dont un
 * seul surligné, sorties limitées au dépôt public et figées aux révisions
 * relevées, six vraies captures agrandissables dont deux annotées, des loupes
 * qui montrent bien leur détail, PRJ-06 posé sous la liste des verdicts, la
 * sortie commune (gup avant, Karl Scraper après), la carte de la vitrine, et
 * la page complète et accessible sans script, jour et nuit.
 */

const CHEMIN = '/projets/githealth';
const DEPOT = 'https://github.com/LINDECKER-Charles/App.GitHealth';
/** Les deux révisions relevées le 14/10/2026 : la tête de dev et la release 0.2.0. */
const REVISIONS = ['bd2e5c9743cea30ff64498830191ed0d49ecfe52', '4cd740df0f8dd0e56e7ff3ee92a7a75758f26624'];

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
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Voir quelles branches comptent, sans toucher au dépôt.');
  if ((page.viewportSize()?.width ?? 0) >= 1440) {
    await expect(page.locator('[data-pli="preuve"] li')).toHaveCount(3);
    for (const preuve of await page.locator('[data-pli="preuve"] li').all()) await expect(preuve).toBeInViewport({ ratio: 1 });
  } else {
    await expect(page.locator('[data-pli="preuve"] li').first()).toBeInViewport({ ratio: 1 });
  }
});

test('le nom canonique, l’étiquette de preuve et « Comment je l’ai construit »', async ({ page }) => {
  await page.goto(CHEMIN);
  const ariane = page.getByRole('navigation', { name: 'Fil d’Ariane', exact: true });
  await expect(ariane.locator('[aria-current="page"]')).toHaveText('GitHealth');
  const entete = page.locator('.projet-tete');
  await expect(entete).toContainText('Une application de bureau');
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
  await expect(fiche.locator('.statut')).toHaveText('Open source, version 0.2.0');
  await expect(fiche).toContainText('Auteur et mainteneur');
  await expect(fiche).toContainText('Depuis août 2026');
  // Un projet public : aucune mention de dépôt privé.
  await expect(fiche).not.toContainText('dépôt privé');
  await expect(fiche.locator('a')).toHaveCount(2);
  for (const lien of await fiche.locator('a').all()) {
    const href = (await lien.getAttribute('href')) ?? '';
    expect(href.startsWith(DEPOT), href).toBe(true);
    await expect(lien).toHaveAttribute('data-umami-event', 'lien-sortant');
    await expect(lien).toHaveAttribute('data-umami-event-domaine', new URL(href).hostname);
    await expect(lien).toContainText('↗');
  }
});

test('trois chiffres sourcés et datés, 231 ms seul surligné', async ({ page }) => {
  await page.goto(CHEMIN);
  const preuves = page.locator('[data-pli="preuve"] .preuve-chiffree');
  await expect(preuves.locator('.preuve-chiffree__valeur')).toHaveText(['231 ms', '6', '4']);
  for (const preuve of await preuves.all()) {
    await expect(preuve.locator('.preuve-chiffree__source')).toHaveText(/\d{2}\/\d{2}\/\d{4}/);
  }
  const surligne = page.locator('.projet-tete mark');
  await expect(surligne).toHaveCount(1);
  await expect(surligne).toHaveText('231 ms');
  await expect(surligne).toHaveAttribute('data-source', /Rapport de la version 0\.2\.0/);
  // Le nombre de tests n’est jamais cité sans sa réserve : il ne l’est pas du tout ici.
  const texte = (await page.locator('main').innerText()).replace(/\s+/g, ' ');
  expect(texte).not.toMatch(/\d+ tests/);
  expect(texte).not.toMatch(/utilisateurs|téléchargements/i);
});

test('aucun lien hors du dépôt public ; chaque sortie mesurée, chaque preuve figée à sa révision', async ({ page }) => {
  await page.goto(CHEMIN);
  const liens = await liensSortants(page);
  expect(liens.length).toBeGreaterThan(10);
  for (const lien of liens) {
    expect(lien.href.startsWith(DEPOT), lien.href).toBe(true);
    expect(lien).toMatchObject({ evenement: 'lien-sortant', domaine: 'github.com', emplacement: 'preuves', rel: 'external' });
    // Le fichier d’instructions du dépôt n’est jamais lié.
    expect(lien.href, lien.href).not.toMatch(/AGENTS\.md|CLAUDE\.md/);
  }
  for (const lien of liens.filter((l) => l.href.includes('/blob/'))) {
    expect(REVISIONS.some((revision) => lien.href.includes(`/blob/${revision}/`)), lien.href).toBe(true);
  }
  expect(liens.map((lien) => lien.href)).toContain(DEPOT);
  expect(liens.map((lien) => lien.href)).toContain(`${DEPOT}/releases/tag/v0.2.0`);
});

test('les verdicts : les cinq étiquettes de l’écran, en anglais, et ce qu’elles veulent dire ; PRJ-06 dessous', async ({ page }) => {
  await page.goto(CHEMIN);
  const section = page.locator('#verdicts');
  const termes = section.locator('.gh-verdicts dt');
  await expect(termes).toHaveText(['Keep', 'Done', 'Review', 'Cleanup possible', 'Excluded']);
  for (const terme of await termes.all()) await expect(terme).toHaveAttribute('lang', 'en');
  await expect(section.locator('.gh-verdicts dd').nth(3)).toContainText('ne perd aucun commit');
  const dessin = section.locator('[data-visuel="PRJ-06"]');
  await expect(dessin).toHaveCount(1);
  await expect(dessin).not.toHaveAttribute('data-manquant', /.*/);
  await dessin.scrollIntoViewIfNeeded();
  await expect(dessin.locator('img:visible')).toHaveAttribute('alt', /Trois branches d’un même tronc/);
});

test('six vraies captures, chacune avec ce qu’elle prouve ; une s’ouvre en grand et se referme à Échap', async ({ page }) => {
  await page.goto(CHEMIN);
  const captures = page.locator('main figure.capture');
  await expect(captures).toHaveCount(6);
  for (const capture of await captures.all()) {
    await expect(capture.locator('.capture__vue > a img')).toHaveAttribute('alt', /.{40,}/);
    await expect(capture.locator('.capture__legende')).not.toBeEmpty();
  }
  await expect(page.locator('#analyse .capture__vue > a img')).toHaveAttribute('alt', /analyse en cours/i);
  await expect(page.locator('#analyse .capture__legende')).toContainText('106 branches sur 169');
  await expect(page.locator('main .cible')).toHaveCount(2);
  // L’en-tête montre l’écran entier, sans recadrage.
  await expect(page.locator('.gh-entete-capture')).not.toHaveClass(/capture--region|capture--recadree/);
  // La politique est recadrée au-dessus du scan planifié, qui n’est pas publié.
  await expect(page.locator('#politique .capture')).toHaveClass(/capture--region/);
  const agrandir = page.locator('#verdicts a[data-agrandir]');
  await agrandir.scrollIntoViewIfNeeded();
  await agrandir.click();
  const visionneuse = page.locator('dialog[data-visionneuse]');
  await expect(visionneuse).toBeVisible();
  const entiere = visionneuse.locator('[data-visionneuse-image]');
  await expect(entiere).toBeVisible();
  expect(await entiere.evaluate((img: HTMLImageElement) => img.naturalWidth / img.naturalHeight)).toBeCloseTo(2400 / 1500, 2);
  await page.keyboard.press('Escape');
  await expect(visionneuse).toBeHidden();
  await expect(agrandir).toBeFocused();
});

test('les loupes montrent leur détail, à côté de leur cible ; sous 560 px, elles passent sous l’écran', async ({ page }) => {
  await page.goto(CHEMIN);
  for (const zone of ['#verdicts', '#analyse']) {
    const figure = page.locator(`${zone} .capture-annotee`);
    await figure.scrollIntoViewIfNeeded();
    const detail = figure.locator('.loupe img');
    await expect.poll(() => detail.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
    // L’image de la loupe garde ses proportions : aucun recadrage de la capture ne l’écrase.
    const proportions = await detail.evaluate((img) => img.getBoundingClientRect().height / img.getBoundingClientRect().width);
    expect(proportions, zone).toBeCloseTo(1500 / 2400, 2);
    const [loupe, cible, ecran] = await Promise.all([figure.locator('.loupe').boundingBox(), figure.locator('.cible').boundingBox(), figure.locator('.capture__vue > a img').boundingBox()]);
    const separees = loupe!.x > cible!.x + cible!.width || loupe!.y > cible!.y + cible!.height || loupe!.x + loupe!.width < cible!.x || loupe!.y + loupe!.height < cible!.y;
    expect(separees, zone).toBe(true);
    if ((page.viewportSize()?.width ?? 0) <= 560) {
      expect(loupe!.y, zone).toBeGreaterThanOrEqual(ecran!.y + ecran!.height);
      const legende = await figure.locator('.capture__legende').boundingBox();
      expect(legende!.y, zone).toBeGreaterThanOrEqual(loupe!.y + loupe!.height);
    }
  }
});

test('la sortie : gup avant, Karl Scraper après, retour à la vitrine, « Discutons » vers /contact', async ({ page }) => {
  await page.goto(CHEMIN);
  const sortie = page.locator('#retiens');
  await expect(sortie.getByRole('heading', { level: 2 })).toHaveText('Aujourd’hui');
  await expect(sortie).toContainText('La version 0.2.0, publiée le 14/09/2026');
  const discutons = sortie.getByRole('link', { name: /^Discutons/ });
  await expect(discutons).toHaveAttribute('href', '/contact');
  await expect(discutons).toHaveAttribute('data-umami-event', 'contact-page');
  await expect(discutons).toHaveAttribute('data-umami-event-emplacement', 'discutons');
  await expect(sortie.getByRole('link', { name: /Projet précédent\s+gup/ })).toHaveAttribute('href', '/projets/gup');
  await expect(sortie.getByRole('link', { name: /Projet suivant\s+Karl Scraper/ })).toHaveAttribute('href', '/projets/karl-scraper');
  await expect(sortie.getByRole('link', { name: /Tous les projets/ })).toHaveAttribute('href', '/projets');
});

test('une seule navigation de page ; la note de sources dit la révision et ce qui n’est pas publié', async ({ page }) => {
  await page.goto(CHEMIN);
  const navigation = page.locator('nav[aria-label="Dans cette page"]');
  await expect(navigation).toHaveCount(1);
  if ((page.viewportSize()?.width ?? 0) > 1100) await expect(navigation).toBeVisible();
  const attendus = ['#verdicts', '#politique', '#analyse', '#visualisation', '#construit', '#retiens'];
  expect(await navigation.locator('a').evaluateAll((liens) => liens.map((lien) => lien.getAttribute('href')))).toEqual(attendus);
  for (const ancre of attendus) await expect(page.locator(ancre)).toHaveCount(1);
  const sources = page.locator('#sources');
  await expect(sources).toContainText('bd2e5c9');
  await expect(sources).toContainText('ne sont pas encore publiés');
  await expect(sources).toContainText('dépôts Git de démonstration');
});

test('la carte de la vitrine : une capture réelle de la fiche de branche, le seul dépôt public, aucun dessin', async ({ page }) => {
  await page.goto('/projets');
  const carte = page.locator('li#githealth');
  await expect(carte.locator('.carte-projet__chiffre')).toContainText('231 ms');
  const capture = carte.locator('.carte-projet__visuel .capture--navigateur img');
  await expect(capture).toHaveAttribute('alt', /fiche d’une branche dans GitHealth/);
  await capture.scrollIntoViewIfNeeded();
  await expect(capture).toBeVisible();
  await expect(carte.locator('[data-visuel="PRJ-06"]')).toHaveCount(0);
  await expect(page.locator('[data-visuel="PRJ-06"]')).toHaveCount(0);
  const liens = carte.locator('.carte-projet__liens a');
  await expect(liens).toHaveCount(1);
  await expect(liens).toHaveAttribute('href', DEPOT);
});

for (const theme of ['jour', 'nuit'] as const) {
  test.describe(`axe, ${theme}`, () => {
    test.use({ colorScheme: theme === 'nuit' ? 'dark' : 'light', reducedMotion: 'reduce' });

    test('en-tête, sections, décisions et sortie restent accessibles', async ({ page }) => {
      await page.goto(CHEMIN);
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      for (const zone of ['.projet-tete', '#verdicts', '#politique', '#analyse', '#visualisation', '#construit', '#retiens']) {
        const resultats = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']).include(zone).analyze();
        expect(resultats.violations.map((v) => ({ id: v.id, cibles: v.nodes.slice(0, 3).map((n) => n.target) })), zone).toEqual([]);
      }
    });
  });
}

test.describe('sans JavaScript', () => {
  test.use({ javaScriptEnabled: false, reducedMotion: 'reduce' });

  test('la page est complète : en-tête, verdicts, captures, décisions et sortie', async ({ page }) => {
    const erreurs = surveillerConsole(page);
    await page.goto(CHEMIN);
    for (const marque of ['titre', 'identite', 'preuve', 'action']) await expect(page.locator(`[data-pli="${marque}"]`)).toBeInViewport();
    await expect(page.locator('.gh-entete-capture img')).toBeVisible();
    await expect(page.locator('#verdicts .gh-verdicts dt')).toHaveCount(5);
    await expect(page.locator('main figure.capture')).toHaveCount(6);
    await expect(page.locator('#construit .decision')).toHaveCount(4);
    await page.locator('[data-pli="action"]').getByRole('link', { name: /Comment je l’ai construit/ }).click();
    expect(new URL(page.url()).hash).toBe('#construit');
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
    expect(erreurs).toEqual([]);
  });
});
