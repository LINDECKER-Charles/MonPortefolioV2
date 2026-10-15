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
  await expect(page.locator('[data-pli="identite"]')).toHaveText(/Architecte logiciel chez B-Hive, à Mulhouse\.\s+Lead du pôle francophone de PvZ\sFusion/);
  // Le métier d’abord : la ligne d’identité est composée plus grand que l’histoire qui la suit.
  const corps = (selecteur: string) => page.locator(selecteur).evaluate((e) => Number.parseFloat(getComputedStyle(e).fontSize));
  expect(await corps('.couverture__identite')).toBeGreaterThan(await corps('.couverture__chapeau'));
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
  // Ce qui reste vrai quand on clique : Omnicard est hors ligne, son moteur de règles prouve la réinvention.
  await expect(preuves.nth(1).locator('mark')).toHaveText('moteur de règles');
  // La même formule que la page PvZ Fusion.
  await expect(preuves.nth(2)).toContainText('personnes formées au pôle francophone');
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
  // Les lanternes au trait, de la même main que la bascule : ni dégradé, ni flou, ni ombre ; un contour d’encre de 1,5 px.
  const lanternes = page.locator('[data-scene="lanternes"] svg');
  await expect(lanternes.locator('linearGradient, radialGradient, filter, .lt-ombre, .lt-halo')).toHaveCount(0);
  for (const trait of await lanternes.locator('.lt-aplat, .lt-flamme').all()) {
    await expect(trait).toHaveCSS('filter', 'none');
  }
  await expect(lanternes.locator('.lt-aplat').first()).toHaveCSS('stroke-width', '1.5px');
  await expect(lanternes.locator('.lt-aplat').first()).toHaveCSS('vector-effect', 'non-scaling-stroke');
  // Plus aucun dessin de l’ancienne direction.
  await expect(page.locator('.scene-origine, .illustration, .planche')).toHaveCount(0);
  // Les portes portent leurs intitulés en HTML, chacune datée (retour du 15/10/2026).
  await expect(page.locator('#portes .portes li')).toHaveText(['BUT Informatique, 2021–2022', 'Physique-chimie, 2022–2023', 'BUT Réseaux & Télécoms, 2023–2024', 'Piscine de 42, juillet 2024', 'Elan Formation, 2025']);
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
  await expect(reperes.locator('li').first()).toContainText('personnes formées au pôle francophone');
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
  // Elles rappellent le moment sans répéter son chiffre : une histoire racontée une fois.
  for (const preuve of await page.locator('#regles .regle__preuves li').all()) await expect(preuve).not.toContainText(/\d/);
  await expect(page.locator('main mark', { hasText: /^un mois$/ })).toHaveCount(2);
  await expect(page.locator('main mark', { hasText: /^20$/ })).toHaveCount(2);
});

test('les quatre gestes du pôle : repliés, en vignettes légendées, sans « semaine type »', async ({ page }) => {
  await page.goto('/');
  const gestes = page.locator('#collectif details.gestes');
  await expect(gestes).toHaveCount(1);
  // Repliés par défaut : la page PvZ Fusion les raconte déjà, le chapitre « Emmener » ne s’y dilue plus.
  await expect(gestes).not.toHaveAttribute('open', /.*/);
  const resume = gestes.locator('summary');
  await expect(resume).toHaveText('Comment j’organise le pôle, en quatre gestes');
  await expect(gestes).not.toContainText('semaine type');
  expect((await resume.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(44);
  await resume.click();
  await expect(gestes).toHaveAttribute('open', /.*/);
  const visuels = gestes.locator('.geste [data-visuel]');
  await expect(visuels).toHaveCount(4);
  const minimum = bureau(page.viewportSize()?.width) ? 160 : 120;
  for (const geste of await gestes.locator('.geste').all()) {
    const [image, texte] = await Promise.all([geste.locator('[data-visuel]').boundingBox(), geste.locator('.geste__texte').boundingBox()]);
    // Une vignette carrée, sa légende en ligne, à sa droite.
    expect(image?.width ?? 0).toBeGreaterThanOrEqual(minimum);
    expect(image?.width ?? 0).toBeLessThanOrEqual(200);
    expect(Math.abs((image?.width ?? 0) - (image?.height ?? 1))).toBeLessThanOrEqual(1);
    expect(texte?.x ?? 0).toBeGreaterThan((image?.x ?? 0) + (image?.width ?? 0));
    // L’étiquette de l’emplacement tient entière dans son cadre.
    const etiquette = geste.locator('.visuel__id');
    if (await etiquette.count()) {
      expect(await etiquette.evaluate((e) => e.scrollWidth <= e.clientWidth + 1 && e.getBoundingClientRect().right <= (e.closest('.visuel') as Element).getBoundingClientRect().right + 1)).toBe(true);
    }
  }
  await expect(gestes.getByRole('link', { name: /^Chaque geste en détail/ })).toHaveAttribute('href', '/projets/pvz-fusion#semaine');
});

test('les trois étapes du pôle, recadrées en 2:1', async ({ page }) => {
  await page.goto('/');
  for (const visuel of await page.locator('#fig-2 [data-visuel]').all()) {
    const boite = await visuel.boundingBox();
    expect((boite?.width ?? 0) / (boite?.height ?? 1)).toBeCloseTo(2, 1);
  }
});

test('la figure du plafond se lit : libellés à la taille du texte, sans chevauchement', async ({ page }) => {
  await page.goto('/');
  const dessin = page.locator('#fig-1 .plafond__dessin:visible');
  await expect(dessin).toHaveCount(1);
  await dessin.scrollIntoViewIfNeeded();
  const libelles = await dessin.locator('.f-l').evaluateAll((elements) => elements.map((element) => {
    const r = element.getBoundingClientRect();
    return { texte: element.textContent ?? '', taille: Number.parseFloat(getComputedStyle(element).fontSize), boite: [r.left, r.top, r.right, r.bottom] };
  }));
  expect(libelles.length).toBeGreaterThan(5);
  // Les libellés ne grandissent pas avec le dessin : ni cri au bureau, ni chuchotement sur mobile.
  for (const { texte, taille } of libelles) {
    expect(taille, texte).toBeGreaterThanOrEqual(14);
    expect(taille, texte).toBeLessThanOrEqual(18);
  }
  // Aucun ne touche un autre, tous restent dans le cadre de la figure.
  const cadre = await page.locator('#fig-1 .plafond__plan').evaluate((e) => {
    const r = e.getBoundingClientRect();
    return [r.left, r.top, r.right, r.bottom];
  });
  for (const [i, a] of libelles.entries()) {
    expect(a.boite[0] >= cadre[0] && a.boite[1] >= cadre[1] && a.boite[2] <= cadre[2] && a.boite[3] <= cadre[3], a.texte).toBe(true);
    for (const b of libelles.slice(i + 1)) {
      const disjoints = a.boite[2] <= b.boite[0] || b.boite[2] <= a.boite[0] || a.boite[3] <= b.boite[1] || b.boite[3] <= a.boite[1];
      expect(disjoints, `${a.texte} / ${b.texte}`).toBe(true);
    }
  }
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
    // Le chiffre et sa légende partagent la ligne de base du chiffre.
    const [chiffre, legende] = await carte.locator('.construit__chiffre > *').evaluateAll((elements) => elements.map((e) => e.getBoundingClientRect().top));
    expect(Math.abs(chiffre - legende)).toBeLessThan(24);
  }
  // Le chiffre de chaque carte est celui de la vitrine (règle E6).
  await expect(construits.locator('.construit__chiffre b')).toHaveText(['403', '1 289', '153']);
  await expect(construits.first().locator('.construit__chiffre')).toContainText('patchs, dans 21 langues');
  const omnicard = page.locator('#omnicard');
  await expect(omnicard.getByRole('link', { name: 'Omnicard', exact: true })).toHaveAttribute('href', '/projets/omnicard');
  await expect(omnicard).toContainText('Hors ligne, en attente de refonte');
  // Le lien et le rôle de la vitrine : les règles, jamais la racine du dépôt ; co-auteur du jeu papier.
  await expect(omnicard.getByRole('link', { name: /^Règles du jeu \(GitHub\)/ })).toHaveAttribute('href', 'https://github.com/LINDECKER-Charles/public-Omnicard/blob/main/docs/rules.md');
  await expect(omnicard).toContainText('Co-auteur du jeu papier');
  await expect(omnicard).not.toContainText('Seul : règles');
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
  // L’invitation mène au bloc « Contribuer » de la vitrine, dont les liens portent l’objectif O3.
  const contribuer = conclusion.getByRole('link', { name: /^Contribuer à mes projets open source/ });
  await expect(contribuer).toHaveAttribute('href', '/projets#contribuer');
  await expect(contribuer).not.toHaveAttribute('data-umami-event', /.+/);
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
