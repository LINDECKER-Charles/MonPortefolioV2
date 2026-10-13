import { expect, test } from '@playwright/test';
import { surveillerConsole } from './support/navigateur';

/**
 * L’accueil, direction « Lanterne » (cahier, § 5.1) : au premier écran, qui,
 * quoi, une preuve et l’action ; puis le récit en trois chapitres dont les
 * identifiants nourrissent la mesure de lecture ; puis « Discutons » et
 * « Pour aller plus loin ». Sans erreur de console (une violation de la CSP
 * en serait une), sans défilement horizontal, à chaque largeur.
 *
 * Les scènes animées (rejeu au clic, au clavier, mouvement réduit,
 * impression) sont couvertes par accueil-scenes.spec.ts.
 */

const CHAPITRES = [
  ['origine', 'L’origine'],
  ['aujourdhui', 'Aujourd’hui'],
  ['discutons', 'La suite, à plusieurs'],
] as const;

const bureau = (largeur: number | undefined) => (largeur ?? 0) >= 1100;

test('le premier écran dit qui, quoi, une preuve et l’action (règle E1)', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Charles Lindecker — architecte logiciel');
  const titre = page.getByRole('heading', { level: 1 });
  // Le nom en sur-titre, puis l’accroche validée, seul grand titre de la page.
  expect((await titre.textContent())?.replace(/\s+/g, ' ').trim()).toBe('Charles Lindecker Je maîtrise d’abord les règles du jeu. Ensuite, je les réinvente.');
  for (const marque of ['titre', 'identite', 'preuve', 'action']) {
    await expect(page.locator(`[data-pli="${marque}"]`), marque).toBeInViewport();
  }
  await expect(page.locator('[data-pli="identite"]')).toHaveText(/Architecte logiciel chez B-Hive, à Mulhouse\. Lead du pôle francophone de PvZ\sFusion/);
  // Les trois preuves tiennent entières au pli, à 1 440 × 900 comme à 390 × 844.
  for (const preuve of await page.locator('[data-pli="preuve"] li').all()) await expect(preuve).toBeInViewport({ ratio: 1 });

  const action = page.locator('[data-pli="action"]');
  const discutons = action.getByRole('link', { name: /^Discutons/ });
  await expect(discutons).toHaveAttribute('href', '/contact');
  await expect(discutons).toHaveAttribute('data-umami-event', 'contact-page');
  await expect(discutons).toHaveAttribute('data-umami-event-emplacement', 'hero');
  await expect(action.getByRole('link', { name: /^Lire mon histoire/ })).toHaveAttribute('href', '#origine');
  await expect(action).toContainText(/\d+\smin de lecture/);

  const photo = page.locator('#portrait img');
  await expect(photo).toHaveAttribute('alt', /Charles Lindecker/);
  expect(await photo.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
});

test('le bandeau des preuves : Maîtriser, Réinventer, Emmener, et Emmener en plus fort', async ({ page }) => {
  await page.goto('/');
  const preuves = page.getByRole('navigation', { name: 'Trois preuves' }).getByRole('link');
  await expect(preuves).toHaveCount(3);
  await expect(preuves.nth(0)).toContainText('Maîtriser');
  await expect(preuves.nth(0)).toHaveAttribute('href', '#voie');
  await expect(preuves.nth(1)).toContainText('Réinventer');
  await expect(preuves.nth(1)).toHaveAttribute('href', '/projets/omnicard');
  await expect(preuves.nth(2)).toContainText('Emmener');
  await expect(preuves.nth(2)).toHaveAttribute('href', '/projets/pvz-fusion');
  // Un seul fait surligné par preuve, sourcé.
  for (const preuve of await preuves.all()) {
    await expect(preuve.locator('mark')).toHaveCount(1);
    await expect(preuve.locator('mark')).toHaveAttribute('data-source', /.+/);
  }
  await expect(preuves.nth(2).locator('mark')).toHaveText('20');
  // La case « Emmener » est la plus forte : la seule éclairée, la plus large, le verbe le plus grand.
  const cases = page.locator('[data-pli="preuve"] li');
  await expect(cases.nth(2)).toHaveClass(/foyer/);
  await expect(page.locator('[data-pli="preuve"] .foyer')).toHaveCount(1);
  const mesures = await cases.evaluateAll((elements) => elements.map((element) => ({
    largeur: element.getBoundingClientRect().width,
    verbe: Number.parseFloat(getComputedStyle(element.querySelector('.preuve__verbe') as Element).fontSize),
  })));
  expect(mesures[2].verbe).toBeGreaterThan(mesures[0].verbe);
  expect(mesures[2].verbe).toBeGreaterThan(mesures[1].verbe);
  if (bureau(page.viewportSize()?.width)) expect(mesures[2].largeur).toBeGreaterThan(mesures[0].largeur);
});

test('le récit suit ses trois chapitres, dans l’ordre, avec leurs identifiants de mesure', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('section[data-chapitre]')).toHaveCount(3);
  const ids = await page.locator('section[data-chapitre]').evaluateAll((sections) => sections.map((s) => s.id));
  expect(ids).toEqual(CHAPITRES.map(([id]) => id));
  for (const [id, titre] of CHAPITRES) {
    await expect(page.locator(`section#${id}`)).toHaveAttribute('data-chapitre', id);
    await expect(page.locator(`section#${id} h2`).first()).toContainText(titre);
  }
  // Les actes alternent : l’acte teinté de Gwent, l’acte de veille d’aujourd’hui, le bleu nuit de la suite.
  await expect(page.locator('#gwent')).toHaveClass(/acte-teinte/);
  await expect(page.locator('#aujourdhui > .acte-veille')).toHaveCount(1);
  await expect(page.locator('#aujourdhui > .acte-veille h2')).toContainText('Aujourd’hui');
  await expect(page.locator('#discutons')).toHaveClass(/acte-bleu/);
  await expect(page.locator('#discutons .aplat-roi')).toHaveCount(1);
});

test('le récit garde ses moments, ses figures et ses scènes', async ({ page }) => {
  await page.goto('/');
  for (const id of ['terrain', 'gwent', 'portes', 'voie', 'bureau', 'construire', 'collectif', 'regles']) {
    await expect(page.locator(`#${id}`), id).toHaveCount(1);
  }
  // Les cartes de Gwent illustrées, leur valeur et leur titre.
  const cartes = page.locator('#fig-gwent .gwent__carte');
  await expect(cartes).toHaveCount(3);
  await expect(cartes.locator('.gwent__titre')).toHaveText(['Lire le jeu', 'Tester mes idées', 'Prendre le contre-pied']);
  await expect(cartes.locator('.gwent__valeur')).toHaveText(['1', '2', '3']);
  // Les scènes illustrées sont les emplacements du registre, dans le style « Lanterne ».
  const attendues = { pc: 'ACC-03', cartes: 'ACC-04', portes: 'ACC-08', diplome: 'ACC-09', pupitre: 'ACC-11', 'pole-accueillir': 'ACC-21', 'pole-former': 'ACC-22', 'pole-autonomie': 'ACC-23' };
  for (const [scene, visuel] of Object.entries(attendues)) {
    await expect(page.locator(`[data-scene="${scene}"] [data-visuel="${visuel}"]`), scene).toHaveCount(1);
  }
  for (const [i, visuel] of ['ACC-18', 'ACC-19', 'ACC-20'].entries()) {
    await expect(cartes.nth(i).locator(`[data-visuel="${visuel}"]`)).toHaveCount(1);
  }
  // Le système qui communique en boucle et les lanternes : les dessins du registre, insérés dans la page.
  await expect(page.locator('[data-scene="architecte"] [data-animation-continue] .sys-paquet')).toHaveCount(4);
  await expect(page.locator('[data-scene="lanternes"] .lt-particule')).toHaveCount(2);
  // Plus aucun dessin de l’ancienne direction.
  await expect(page.locator('.scene-origine, .illustration, .planche')).toHaveCount(0);
  // Les portes portent leurs intitulés en HTML, sans date pour la piscine de 42.
  await expect(page.locator('#portes .portes li')).toHaveText(['BUT Informatique', 'Physique-chimie', 'BUT Réseaux & Télécoms, 2023-2024', 'Piscine de 42', 'Elan Formation, 2025']);
  // Les trois règles, de 1 à 3, chacune renvoyant là où le récit la prouve.
  const regles = page.locator('#regles [data-revelation-progressive] > li');
  await expect(regles.locator('h4')).toHaveText(['Maîtriser', 'Réinventer', 'Emmener']);
  for (const regle of await regles.all()) expect(await regle.locator('.regle__preuves a').count()).toBeGreaterThanOrEqual(2);
});

test('les faits du récit : C puis C++, lead depuis décembre 2025, « Seul on va vite » en conclusion', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#terrain')).toContainText('j’apprends le C sur OpenClassrooms, pour passer ensuite au C++ et coder mes jeux sur Unreal Engine');
  await expect(page.locator('#collectif')).toContainText('Quand le titre de lead arrive, en décembre 2025');
  const seul = page.locator('blockquote', { hasText: 'Seul on va vite' });
  await expect(seul).toHaveCount(1);
  await expect(page.locator('#collectif blockquote')).toContainText('Seul on va vite, à plusieurs on va loin');
  // Les trois repères du pôle : un seul surligné, chacun sa source.
  const reperes = page.getByRole('list', { name: 'Le pôle francophone en trois chiffres' });
  await expect(reperes.locator('.preuve-chiffree__valeur')).toHaveText(['20', '10', '35']);
  await expect(reperes.locator('mark')).toHaveCount(1);
  // La citation d’Omnicard attend la réponse de Charles (Q8) : pas affichée.
  await expect(page.locator('main')).not.toContainText('un moment j’en ai eu marre');
});

test('sous les preuves, une entrée vers tous les projets, hors du pli', async ({ page }) => {
  await page.goto('/');
  const suite = page.locator('.couverture__suite');
  await expect(suite).toContainText('Un parcours, une méthode, des réalisations.');
  await expect(suite.getByRole('link', { name: /^Voir tous mes projets/ })).toHaveAttribute('href', '/projets');
  await expect(suite.locator('[data-pli]')).toHaveCount(0);
});

test('chaque preuve n’est surlignée qu’une fois dans le récit, en plus du bandeau', async ({ page }) => {
  await page.goto('/');
  // Les règles renvoient à la preuve par un lien, sans la surligner de nouveau.
  await expect(page.locator('#regles mark')).toHaveCount(0);
  await expect(page.locator('main mark', { hasText: /^un mois$/ })).toHaveCount(2);
  await expect(page.locator('main mark', { hasText: /^20$/ })).toHaveCount(2);
});

test('les quatre gestes du pôle : l’image en tête, en grand, sans « semaine type »', async ({ page }) => {
  await page.goto('/');
  const gestes = page.locator('#collectif .gestes');
  await expect(gestes).toContainText('Comment j’organise le pôle, en quatre gestes');
  await expect(gestes).not.toContainText('semaine type');
  const visuels = gestes.locator('.geste [data-visuel]');
  await expect(visuels).toHaveCount(4);
  const minimum = bureau(page.viewportSize()?.width) ? 200 : 150;
  for (const visuel of await visuels.all()) {
    const boite = await visuel.boundingBox();
    expect(boite?.width ?? 0).toBeGreaterThanOrEqual(minimum);
    // L’étiquette de l’emplacement tient entière dans son cadre.
    const etiquette = visuel.locator('.visuel__id');
    if (await etiquette.count()) {
      expect(await etiquette.evaluate((e) => e.scrollWidth <= e.clientWidth + 1 && e.getBoundingClientRect().right <= (e.closest('.visuel') as Element).getBoundingClientRect().right + 1)).toBe(true);
    }
  }
});

test('la figure du plafond se lit : aucun libellé sous 12 px', async ({ page }) => {
  await page.goto('/');
  const figure = page.locator('#fig-1 svg:visible');
  await figure.scrollIntoViewIfNeeded();
  const tailles = await figure.locator('text').evaluateAll((textes) => textes.map((t) => {
    const svg = t.closest('svg') as SVGSVGElement;
    const echelle = svg.getBoundingClientRect().width / svg.viewBox.baseVal.width;
    return Number.parseFloat(getComputedStyle(t).fontSize) * echelle;
  }));
  expect(tailles.length).toBeGreaterThan(5);
  expect(Math.min(...tailles)).toBeGreaterThanOrEqual(12);
});

test('les cartes de projets suivent l’ordre de la vitrine', async ({ page }) => {
  await page.goto('/');
  const construits = page.getByRole('list', { name: 'Trois projets que je construis' }).locator(':scope > li');
  await expect(construits).toHaveCount(3);
  const liens = await construits.locator('.construit__nom a').evaluateAll((a) => a.map((lien) => lien.getAttribute('href')));
  expect(liens).toEqual(['/projets/league-of-database', '/projets/bloodborne-legendary-run', '/projets/gup']);
  // Hors de l’index de /projets, les cartes ne portent pas le rang de la vitrine.
  await expect(construits.locator('.construit__rang')).toHaveCount(0);
  await expect(construits.locator('.construit__preuve')).toHaveText(['Un système en production', 'Un produit de bout en bout', 'Un outil open source']);
  for (const carte of await construits.all()) {
    await expect(carte).toContainText('Voir le projet');
    await expect(carte.locator('img').first()).toHaveAttribute('alt', /.{40,}/);
  }
  const omnicard = page.locator('#omnicard');
  await expect(omnicard.getByRole('link', { name: 'Omnicard', exact: true })).toHaveAttribute('href', '/projets/omnicard');
  await expect(omnicard).toContainText('Hors ligne, en attente de refonte');
  // Omnicard porte le verbe du bandeau, sans rang.
  await expect(omnicard.locator('.carte-projet__rang')).toHaveCount(0);
  await expect(omnicard.locator('.carte-projet__preuve')).toHaveText('Réinventer');
});

test('la conclusion mène à Discutons, aux projets open source, puis plus loin', async ({ page }) => {
  await page.goto('/');
  const conclusion = page.locator('#discutons');
  const contact = conclusion.getByRole('link', { name: /^Discutons/ });
  await expect(contact).toHaveAttribute('href', '/contact');
  await expect(contact).toHaveAttribute('data-umami-event-emplacement', 'discutons');
  await expect(conclusion.locator('.aplat-roi').getByRole('link', { name: /^Discutons/ })).toHaveCount(1);
  const contribuer = conclusion.getByRole('link', { name: /^Contribuer à mes projets open source/ });
  await expect(contribuer).toHaveAttribute('href', 'https://github.com/LINDECKER-Charles');
  await expect(contribuer).toHaveAttribute('data-umami-event', 'lien-sortant');
  const suite = page.getByRole('navigation', { name: 'Pour aller plus loin', exact: true });
  await expect(suite.getByRole('link')).toHaveCount(3);
  for (const destination of ['projets', 'parcours', 'blog']) {
    await expect(suite.locator(`a[href="/${destination}"]`)).toHaveCount(1);
  }
  // « Discutons » mène partout à /contact (règle E2).
  for (const lien of await page.getByRole('link', { name: /^Discutons/ }).all()) await expect(lien).toHaveAttribute('href', '/contact');
  await contact.click();
  await expect(page).toHaveURL(/\/contact$/);
  await expect(page.locator('[data-contact-form]')).toBeVisible();
});

test('les figures dessinées se décrivent', async ({ page }) => {
  await page.goto('/');
  const plafond = page.locator('#fig-1 svg:visible');
  await expect(plafond).toHaveCount(1);
  await expect(plafond).toHaveAttribute('role', 'img');
  expect((await plafond.locator('desc').textContent())?.length).toBeGreaterThan(60);
  await expect(page.locator('#fig-1')).not.toContainText('Fig. 1');
  const collectif = page.locator('#fig-2');
  await expect(collectif.locator('details, summary')).toHaveCount(0);
  await expect(collectif.getByRole('button', { name: /^Rejouer l’animation\s*:/ })).toHaveCount(3);
  await expect(collectif).toContainText('Accueillir');
  await expect(collectif).toContainText('Former');
  await expect(collectif).toContainText('Contribuer');
});

test('la page se parcourt sans erreur ni défilement horizontal', async ({ page }) => {
  const problemes = surveillerConsole(page);
  await page.goto('/');
  const hauteur = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < hauteur; y += 700) {
    await page.evaluate((position) => window.scrollTo({ top: position, behavior: 'instant' }), y);
    await page.waitForTimeout(30);
  }
  await page.waitForLoadState('networkidle');
  const debord = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(debord).toBeLessThanOrEqual(0);
  expect(problemes).toEqual([]);
});

test('le contact est à un clic depuis n’importe où dans la page', async ({ page }) => {
  await page.goto('/');
  await page.locator('#discutons').scrollIntoViewIfNeeded();
  await expect(page.getByRole('banner').getByRole('link', { name: 'Contact', exact: true })).toBeInViewport();
});

test('le lien d’évitement mène au contenu', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const evitement = page.getByRole('link', { name: 'Aller au contenu' });
  await expect(evitement).toBeFocused();
  await expect(evitement).toBeInViewport();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
});

test.describe('bureau', () => {
  test.skip(({ viewport }) => !bureau(viewport?.width), 'navigation de page en colonne : bureau seulement');

  test('« Dans cette page » marque la section lue, du premier chapitre à la suite', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Dans cette page' });
    await expect(nav).toBeVisible();
    await expect(nav.getByRole('link')).toHaveCount(7);
    await expect(nav.getByRole('link').first()).toHaveAttribute('href', '#origine');
    await page.evaluate(() => document.getElementById('discutons')?.scrollIntoView({ behavior: 'instant' }));
    await expect(nav.locator('[aria-current="location"]')).toHaveText(/La suite/);
    await page.evaluate(() => document.getElementById('gwent')?.scrollIntoView({ behavior: 'instant' }));
    await expect(nav.locator('[aria-current="location"]')).toHaveText(/Gwent/);
  });
});

test.describe('sans JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('le récit est complet : preuves, chapitres, scènes, règles et appel', async ({ page }) => {
    await page.goto('/');
    for (const marque of ['titre', 'identite', 'preuve', 'action']) await expect(page.locator(`[data-pli="${marque}"]`)).toBeVisible();
    await expect(page.locator('section[data-chapitre]')).toHaveCount(3);
    for (const scene of await page.locator('[data-scene] [data-visuel]').all()) await expect(scene).toBeVisible();
    for (const regle of await page.locator('[data-revelation-progressive] > li').all()) await expect(regle).toHaveCSS('opacity', '1');
    await expect(page.locator('#fig-1 svg:visible .annot--2')).toHaveCSS('opacity', '1');
    await expect(page.locator('#discutons').getByRole('link', { name: /^Discutons/ })).toBeVisible();
  });
});
