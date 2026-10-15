import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { COMPTE_GITHUB, DEPOTS_PUBLICS } from '../../src/config/liens-publics';
import { PROJETS_ARCHIVES, VEDETTE, VITRINE, VITRINE_PAR_FAMILLE, type ProjetVitrine } from '../../src/config/projets';
import { surveillerConsole } from './support/navigateur';

/**
 * La vitrine /projets (cahier des charges, § 5.2 ; décisions de Charles du
 * 13 et du 14/10/2026) : un titre, une phrase, l’index des étiquettes de
 * preuve par famille, puis une section par famille — « Lead et équipe » (PvZ
 * Fusion en vedette), « Jeu vidéo », « Outils », « IA » —, dans l’ordre de
 * VITRINE. Chaque carte mène à sa page au clavier et sans JavaScript, porte
 * son rang, un chiffre, un rôle, un statut et des liens publics mesurés ;
 * suivent les projets archivés (repliés, avec les vignettes de l’ancienne
 * rangée « Aussi »), « Contribuer » et « Discutons ».
 *
 * L’ordre, les familles et les noms se lisent dans config/projets.ts : ce test
 * ne fige que les valeurs des cinq premières cartes, et vérifie pour les
 * autres la structure (rang, chiffre, liens), quelle que soit leur page.
 */

/** Les chiffres figés des cinq cartes historiques (config/vitrine.ts). */
const CHIFFRES: Partial<Record<ProjetVitrine['id'], string>> = { pvz: '20', omnicard: '181', bloodborne: '1 289', league: '403', gup: '153' };

/** Les seules sorties admises depuis la vitrine hors des cartes entrées le 14/10/2026 : liste blanche et sites des projets. */
const SORTIES_ADMISES = [
  'https://github.com/Teyliu/PVZF-Translation',
  'https://league-of-data-base.com/fr/',
  'https://github.com/LINDECKER-Charles/LeagueOfDataBaseFinal',
  'https://github.com/LINDECKER-Charles/public-Omnicard',
  'https://github.com/LINDECKER-Charles/public-Omnicard/blob/main/docs/rules.md',
  'https://bloodborne-legendary-run.com/fr/sky',
  'https://github.com/LINDECKER-Charles/gup',
  'https://www.npmjs.com/package/@charles_lindecker/gup',
  'https://github.com/LINDECKER-Charles/app-life-pixel',
  'https://github.com/LINDECKER-Charles/Web-Image-Formateur',
  'https://lindecker-charles.github.io/ShrekSophone/',
  'https://github.com/LINDECKER-Charles/ShrekSophone',
  'https://github.com/LINDECKER-Charles/gup/blob/main/.github/CONTRIBUTING.md',
  'https://github.com/LINDECKER-Charles/PVZ-Fuzion-ConsolManager/blob/main/CONTRIBUTING.md',
  'https://github.com/LINDECKER-Charles?tab=repositories',
];

/** Un dépôt GitHub de la liste blanche (liens-publics.ts), quelle que soit la page du dépôt visée. */
const DEPOT_PUBLIC = new RegExp(`^https://github\\.com/${COMPTE_GITHUB}/(?:${DEPOTS_PUBLICS.map((d) => d.nom.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})(?:[/?#]|$)`, 'i');

const REGLES = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];
const deuxChiffres = (rang: number) => String(rang).padStart(2, '0');
const exact = (texte: string) => texte.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const carte = (page: Page, id: string) => page.locator(`.vitrine-famille .vitrine > li#${id}`);
const cartes = (page: Page) => page.locator('.vitrine-famille .vitrine > li');
const lienDeCarte = (page: Page, projet: ProjetVitrine) => carte(page, projet.id).getByRole('link', { name: projet.nom, exact: true });
const index = (page: Page) => page.getByRole('navigation', { name: 'Ce que prouve chaque projet', exact: true });

async function axe(page: Page) {
  const resultats = await new AxeBuilder({ page }).withTags(REGLES).analyze();
  return resultats.violations.map((violation) => ({
    regle: violation.id,
    impact: violation.impact,
    cibles: violation.nodes.map((noeud) => noeud.target),
  }));
}

test('le premier écran dit quoi et pourquoi : titre, phrase, index des preuves et chiffre de la vedette', async ({ page }) => {
  const erreurs = surveillerConsole(page);
  await page.goto('/projets');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Projets');
  await expect(page.locator('[data-pli="titre"]')).toBeInViewport();
  await expect(page.locator('[data-pli="identite"]')).toHaveText('Des projets menés au bout : une équipe, des systèmes en production, des outils publiés, des agents IA encadrés.');
  await expect(page.locator('[data-pli="identite"]')).toBeInViewport();
  await expect(index(page).getByRole('link').first()).toBeInViewport();
  const vedette = carte(page, VEDETTE);
  await expect(vedette).toHaveClass(/carte-projet--vedette/);
  // La preuve du premier écran : le chiffre de la vedette, marqué par CarteProjet (règle E1).
  const preuve = page.locator('[data-pli="preuve"]');
  await expect(preuve).toHaveCount(1);
  await expect(preuve).toHaveClass(/carte-projet__chiffre/);
  await expect(preuve).toBeInViewport({ ratio: 1 });
  await expect(vedette.locator('[data-pli="preuve"] b')).toHaveText('20');
  expect(erreurs).toEqual([]);
});

test('les chiffres des cartes portent leur date (règle C1)', async ({ page }) => {
  await page.goto('/projets');
  const releve = page.locator('.vitrine-releve');
  // Le relevé commun des cinq premières cartes, puis celui des cartes relevées à une autre date.
  // Les espaces avant « ; » sont insécables (typo) : \s les lit toutes.
  await expect(releve).toHaveText(/^Chiffres au 13 octobre 2026\s;\sobjectifs de Bloodborne Legendary Run au 8 octobre 2026(?:\s;\s[^;]+ au \d{1,2} [a-zéû]+ \d{4})*\.$/);
  // Juste sous la dernière famille, avant les projets archivés.
  expect(await releve.evaluate((p) => p.previousElementSibling?.matches('section.vitrine-famille'))).toBe(true);
});

test('sur ordinateur, le visuel d’une carte « ligne » remplit son panneau', async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 0) <= 860, 'ordinateur seulement');
  await page.goto('/projets');
  // Depuis le 15/10/2026, League Of Data Base et Omnicard montrent une vraie capture, comme gup.
  for (const [id, cible] of [['league', '.capture__cadre'], ['omnicard', '.capture__cadre'], ['gup', '.capture__vue']] as const) {
    const panneau = carte(page, id).locator('.carte-projet__visuel');
    const { interieur, visuel } = await panneau.evaluate((el, selecteur) => {
      const style = getComputedStyle(el);
      const cadre = el.querySelector(selecteur)!.getBoundingClientRect();
      return { interieur: el.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom), visuel: cadre.height };
    }, cible);
    expect(visuel / interieur, id).toBeGreaterThan(0.95);
  }
  // La capture de gup reste recadrée, jamais étirée.
  await expect(carte(page, 'gup').locator('.capture__vue img')).toHaveCSS('object-fit', 'cover');
});

test('sur ordinateur, une famille de trois tient sur une ligne, ses visuels à la même hauteur', async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 0) <= 1100, 'grand écran seulement');
  await page.goto('/projets');
  for (const famille of VITRINE_PAR_FAMILLE.filter((f) => f.projets.length === 3)) {
    const boites = await page.locator(`#famille-${famille.id} .vitrine > li`).evaluateAll((liste) =>
      liste.map((li) => ({ haut: li.getBoundingClientRect().top, visuel: li.querySelector('.carte-projet__visuel')?.getBoundingClientRect().height })),
    );
    expect(new Set(boites.map((b) => Math.round(b.haut))).size, famille.id).toBe(1);
    const hauteurs = boites.flatMap((b) => (b.visuel ? [Math.round(b.visuel)] : []));
    expect(new Set(hauteurs).size, famille.id).toBeLessThanOrEqual(1);
  }
});

test('entre 861 et 1 100 px, une famille de trois met une carte par ligne : ses captures restent lisibles', async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 0) <= 1100, 'vérifié une fois, depuis le projet bureau');
  await page.setViewportSize({ width: 1000, height: 900 });
  await page.goto('/projets');
  for (const famille of VITRINE_PAR_FAMILLE.filter((f) => f.projets.length === 3)) {
    const gauches = await page.locator(`#famille-${famille.id} .vitrine > li`).evaluateAll((liste) => liste.map((li) => Math.round(li.getBoundingClientRect().left)));
    expect(new Set(gauches).size, famille.id).toBe(1);
  }
  // Sur deux colonnes, la Galaxie et le graphe tenaient dans un panneau d’environ 200 px.
  for (const id of ['karl-scraper', 'sillage']) {
    const largeur = (await carte(page, id).locator('.capture__vue img').first().boundingBox())?.width ?? 0;
    expect(largeur, id).toBeGreaterThan(320);
  }
});

test('une section par famille, dans l’ordre ; chaque projet une seule fois, à son rang', async ({ page }) => {
  await page.goto('/projets');
  const sections = page.locator('section.vitrine-famille');
  await expect(sections).toHaveCount(VITRINE_PAR_FAMILLE.length);
  await expect(sections.getByRole('heading', { level: 2 })).toHaveText(VITRINE_PAR_FAMILLE.map((famille) => famille.titre));
  expect(await sections.evaluateAll((liste) => liste.map((s) => s.id))).toEqual(VITRINE_PAR_FAMILLE.map((famille) => `famille-${famille.id}`));
  for (const famille of VITRINE_PAR_FAMILLE) {
    // La liste de la famille porte le nom de son titre.
    const liste = page.locator(`#famille-${famille.id}`).getByRole('list', { name: famille.titre, exact: true });
    expect(await liste.locator(':scope > li').evaluateAll((li) => li.map((x) => x.id))).toEqual(famille.projets.map((p) => p.id));
  }
  await expect(cartes(page)).toHaveCount(VITRINE.length);
  expect(await cartes(page).evaluateAll((liste) => liste.map((li) => li.id))).toEqual(VITRINE.map((p) => p.id));
  await expect(page.locator('.vitrine .carte-projet--vedette')).toHaveCount(1);
  await expect(page.locator('.vitrine .carte-projet--ligne')).toHaveCount(VITRINE.length - 1);
  for (const [i, projet] of VITRINE.entries()) {
    const li = carte(page, projet.id);
    await expect(li.getByRole('heading', { level: 3 })).toContainText(projet.nom);
    await expect(li.locator('.carte-projet__preuve')).toHaveText(new RegExp(`^\\s*${deuxChiffres(i + 1)}\\s*${exact(projet.preuve)}\\s*$`));
    // Un chiffre par carte, sourcé et daté (règle C1) ; ceux des cinq premières sont figés ici.
    await expect(li.locator('.carte-projet__chiffre b')).toHaveCount(1);
    await expect(li.locator('.carte-projet__chiffre b')).toHaveText(CHIFFRES[projet.id] ?? /\d/);
    await expect(li.locator('.carte-projet__voir')).toHaveText(/^\s*Voir le projet\s*→\s*$/);
    await expect(li.locator('.carte-projet__fiche dt')).toHaveText(['Rôle', 'Statut']);
    await expect(li.locator('.statut')).toHaveCount(1);
    expect(await li.locator('.carte-projet__technos img').count()).toBeLessThanOrEqual(3);
  }
  // Un seul passage de chaque projet dans la page : plus de vedette en double.
  await expect(page.locator('main').getByRole('link', { name: 'Bloodborne Legendary Run', exact: true })).toHaveCount(1);
  await expect(page.locator('main')).not.toContainText('Jouer et explorer');
  await expect(page.locator('main')).not.toContainText('Simplifier le quotidien');
  await expect(page.locator('[data-project-theme], [data-featured-project]')).toHaveCount(0);
  // Les noms canoniques seulement (règle E6).
  await expect(page.locator('main')).not.toContainText(/PVZF Translation|League of Database|\bGUP\b/);
});

test('les statuts sont honnêtes : une forme et un mot', async ({ page }) => {
  await page.goto('/projets');
  await expect(carte(page, 'omnicard').locator('.statut')).toHaveClass(/statut--eteint/);
  await expect(carte(page, 'omnicard').locator('.statut')).toHaveText('Hors ligne, en attente de refonte');
  await expect(carte(page, 'gup').locator('.statut')).toHaveClass(/statut--ouvert/);
  await expect(carte(page, 'bloodborne').locator('.statut')).toHaveText('En ligne, web ; Android en test');
  // La réserve sur le nom est dite une fois, dans la note de sources de la page League.
  await expect(carte(page, 'league').locator('.a-confirmer')).toHaveCount(0);
});

test('l’index des preuves, famille par famille, mène à chaque carte sans rien masquer', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/projets');
  const familles = index(page).locator('.index-preuves__famille');
  await expect(familles.locator('.index-preuves__titre')).toHaveText(VITRINE_PAR_FAMILLE.map((famille) => famille.titre));
  for (const [i, famille] of VITRINE_PAR_FAMILLE.entries()) {
    await expect(index(page).getByRole('list', { name: famille.titre, exact: true }).getByRole('link')).toHaveCount(famille.projets.length);
    expect(await familles.nth(i).getByRole('link').evaluateAll((liens) => liens.map((a) => a.getAttribute('href')))).toEqual(famille.projets.map((p) => `#${p.id}`));
  }
  const liens = index(page).getByRole('link');
  await expect(liens).toHaveCount(VITRINE.length);
  for (const [rang, projet] of VITRINE.entries()) {
    const lien = liens.nth(rang);
    await expect(lien).toHaveAttribute('href', `#${projet.id}`);
    // Le numéro se voit à toutes les largeurs ; l’étiquette est dans le nom du lien.
    await expect(lien).toHaveAccessibleName(new RegExp(`^${deuxChiffres(rang + 1)}\\s*${exact(projet.preuve)}$`));
    await lien.focus();
    await page.keyboard.press('Enter');
    expect(new URL(page.url()).hash).toBe(`#${projet.id}`);
    await expect(carte(page, projet.id)).toBeInViewport();
    await expect(cartes(page).locator(':scope:visible')).toHaveCount(VITRINE.length);
  }
});

for (const projet of VITRINE) {
  test(`la carte ${projet.id} mène à sa page au clavier`, async ({ page }) => {
    const erreurs = surveillerConsole(page);
    await page.goto('/projets');
    const lien = lienDeCarte(page, projet);
    await expect(lien).toHaveAttribute('href', projet.href);
    await lien.focus();
    await page.keyboard.press('Enter');
    await expect.poll(() => new URL(page.url()).pathname).toBe(projet.href);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(erreurs).toEqual([]);
  });
}

test('toute la carte est cliquable, ses liens publics restent à part', async ({ page }) => {
  await page.goto('/projets');
  // Un clic sur le visuel ouvre la page du projet (le lien du nom couvre la carte).
  await carte(page, 'gup').scrollIntoViewIfNeeded();
  const visuel = await carte(page, 'gup').locator('.carte-projet__visuel').boundingBox();
  if (!visuel) throw new Error('La carte gup doit avoir un visuel.');
  await page.mouse.click(visuel.x + visuel.width / 2, visuel.y + visuel.height / 2);
  await expect.poll(() => new URL(page.url()).pathname).toBe('/projets/gup');
  await page.goBack();
  // Un lien public de la carte garde sa propre destination.
  const npm = carte(page, 'gup').getByRole('link', { name: /npm/ });
  await expect(npm).toHaveAttribute('href', 'https://www.npmjs.com/package/@charles_lindecker/gup');
  await npm.scrollIntoViewIfNeeded();
  const cible = await npm.evaluate((lien) => {
    const boite = lien.getBoundingClientRect();
    return document.elementFromPoint(boite.x + boite.width / 2, boite.y + boite.height / 2)?.closest('a')?.getAttribute('href');
  });
  expect(cible).toBe('https://www.npmjs.com/package/@charles_lindecker/gup');
});

test('des captures réelles dans leurs cadres, et les emplacements de la commande', async ({ page }) => {
  await page.goto('/projets');
  const telephone = carte(page, 'bloodborne').locator('.capture--telephone img');
  await expect(telephone).toHaveAttribute('alt', /atlas de Bloodborne Legendary Run sur téléphone/);
  await expect(telephone).toBeVisible();
  const terminal = carte(page, 'gup').locator('.capture--terminal img');
  await expect(terminal).toHaveAttribute('alt', /gup en français dans un terminal/);
  // Les jeux vidéo montrent une vraie capture (15/10/2026) ; seule la vedette garde son illustration.
  await expect(carte(page, 'pvz').locator('[data-visuel="PRJ-01"]')).toHaveCount(1);
  for (const [id, alt] of [['league', /catalogue des champions de League Of Data Base/], ['omnicard', /page d’accueil d’Omnicard/]] as const) {
    await expect(carte(page, id).locator('.capture--navigateur img'), id).toHaveAttribute('alt', alt);
    await expect(carte(page, id).locator('[data-visuel]'), id).toHaveCount(0);
  }
  for (const visuel of ['PRJ-07', 'PRJ-08', 'PRJ-10', 'PRJ-11', 'PRJ-12']) {
    await expect(page.locator(`[data-visuel="${visuel}"]`)).toHaveCount(1);
  }
  // Le visuel d’une carte, quand elle en a un, vit dans son panneau, dans l’acte de veille.
  for (const projet of VITRINE) {
    const panneau = carte(page, projet.id).locator('.carte-projet__visuel');
    if (await panneau.count()) await expect(panneau, projet.id).toHaveClass(/acte-veille/);
  }
});

test('les liens sortants sont publics, marqués « ↗ » et mesurés ; aucun pour un projet privé', async ({ page }) => {
  await page.goto('/projets');
  const nouvelles = VITRINE.filter((projet) => !(projet.id in CHIFFRES)).map((projet) => projet.id);
  const liens = await page.locator('main a[href^="http"]').evaluateAll(
    (elements, ids) =>
      elements.map((lien) => ({
        href: lien.getAttribute('href') ?? '',
        texte: lien.textContent ?? '',
        rel: lien.getAttribute('rel'),
        evenement: lien.getAttribute('data-umami-event'),
        domaine: lien.getAttribute('data-umami-event-domaine'),
        emplacement: lien.getAttribute('data-umami-event-emplacement'),
        contribuer: Boolean(lien.closest('#contribuer')),
        carte: ids.find((id) => lien.closest(`li#${id}`)) ?? null,
      })),
    nouvelles,
  );
  expect(liens.length).toBeGreaterThanOrEqual(13);
  for (const lien of liens) {
    // Une carte entrée le 14/10/2026 ne mène qu’à un dépôt de la liste blanche, ou hors de GitHub.
    if (lien.carte) expect(new URL(lien.href).hostname !== 'github.com' || DEPOT_PUBLIC.test(lien.href), lien.href).toBe(true);
    else expect(SORTIES_ADMISES, lien.href).toContain(lien.href);
    expect(lien.texte, lien.href).toContain('↗');
    expect(lien.rel, lien.href).toBe('external');
    expect(lien.evenement, lien.href).toBe('lien-sortant');
    expect(lien.domaine, lien.href).toBe(new URL(lien.href).hostname);
    // L’invitation open source garde l’emplacement de l’objectif O3.
    expect(lien.emplacement, lien.href).toBe(lien.contribuer ? 'discutons' : 'preuves');
  }
  // Un projet privé n’a aucun lien sortant sur sa carte : sans lien public, elle dit pourquoi.
  for (const projet of VITRINE.filter((p) => p.prive)) {
    await expect(carte(page, projet.id).locator('a[href^="http"]'), projet.id).toHaveCount(0);
    await expect(carte(page, projet.id).locator('.carte-projet__prive'), projet.id).toHaveText('Dépôt privé');
  }
  // Une carte qui porte des liens publics n’a pas la mention.
  for (const projet of VITRINE.filter((p) => !p.prive)) await expect(carte(page, projet.id).locator('.carte-projet__prive'), projet.id).toHaveCount(0);
});

test('« Contribuer » : deux guides de contribution et tous les dépôts publics', async ({ page }) => {
  await page.goto('/projets#contribuer');
  const contribuer = page.locator('#contribuer');
  await expect(contribuer.getByRole('heading', { level: 2 })).toHaveText('Contribuer');
  // Les noms constants (règle E6) : le Console Manager comme sur la page PvZ Fusion.
  await expect(contribuer.getByRole('heading', { level: 3 })).toHaveText(['gup', 'Console Manager de PvZ Fusion']);
  // Le titre est la zone éclairée de l’écran ; l’illustration reste dans le bloc.
  await expect(contribuer.locator('.contribuer__tete')).toHaveClass(/\bfoyer\b/);
  await expect(contribuer.locator('.acte-veille [data-visuel="PRJ-11"]')).toHaveCount(1);
  await expect(contribuer.getByRole('link', { name: /Guide de contribution/ })).toHaveCount(2);
  await expect(contribuer.getByRole('link', { name: /Tous mes dépôts publics/ })).toHaveAttribute('href', 'https://github.com/LINDECKER-Charles?tab=repositories');
});

test('les projets archivés restent discrets, repliés et ouvrables au clavier', async ({ page }) => {
  await page.goto('/projets');
  const archives = page.locator('#projets-archives');
  await expect(archives).not.toHaveAttribute('open');
  // Le nombre des projets archivés, dès qu’il y en a un.
  await expect(archives.locator('summary')).toHaveText(`Projets archivés (${PROJETS_ARCHIVES.length})`);
  // Un signe dit qu’il s’ouvre : « + », qui tourne en « × » une fois ouvert.
  const signe = archives.locator('summary .archives__signe');
  await expect(signe).toBeVisible();
  await expect(signe).toHaveAttribute('aria-hidden', 'true');
  await expect(signe).toHaveCSS('transform', 'none');
  await archives.locator('summary').focus();
  await page.keyboard.press('Enter');
  await expect(archives).toHaveAttribute('open', '');
  await expect(signe).not.toHaveCSS('transform', 'none');
  // Le volet a son titre dans le plan de la page, masqué à l’œil : le résumé le dit déjà.
  await expect(page.getByRole('region', { name: 'Projets archivés', exact: true })).toContainText('Des projets publics, sans page dédiée.');
});

test('une adresse qui vise les archives les ouvre : la sortie de la dernière page de la vitrine', async ({ page }) => {
  await page.goto('/projets#projets-archives');
  const archives = page.locator('#projets-archives');
  await expect(archives).toHaveAttribute('open', '');
  await expect(archives.locator('li.archives__projet:visible')).toHaveCount(PROJETS_ARCHIVES.length);
  // Au changement d’ancre aussi, sur la page déjà chargée.
  await archives.locator('summary').click();
  await expect(archives).not.toHaveAttribute('open');
  await page.evaluate(() => (location.hash = '#contribuer'));
  await page.evaluate(() => (location.hash = '#projets-archives'));
  await expect(archives).toHaveAttribute('open', '');
});

test('les archives reprennent les cartes de l’ancienne rangée « Aussi », vignettes et liens publics', async ({ page }) => {
  await page.goto('/projets');
  const archives = page.locator('#projets-archives');
  await archives.locator('summary').click();
  await expect(archives.getByRole('heading', { level: 3 })).toHaveText(PROJETS_ARCHIVES.map((projet) => projet.nom));
  for (const projet of PROJETS_ARCHIVES) {
    const entree = archives.locator(`li#${projet.id}`);
    await expect(entree.locator('.visuel'), projet.id).toHaveCount(projet.visuel ? 1 : 0);
    if (projet.visuel) await expect(entree.locator(`[data-visuel="${projet.visuel}"]`)).toBeVisible();
    for (const lien of projet.liens ?? []) await expect(entree.getByRole('link', { name: new RegExp(`^${exact(lien.libelle)}`) })).toHaveAttribute('href', lien.href);
  }
  // L’illustration du volet ferme la liste, décorative.
  await expect(archives.locator('[data-visuel="PRJ-12"]')).toBeVisible();
  await expect(archives.getByRole('link', { name: /La démo/ })).toHaveAttribute('href', 'https://lindecker-charles.github.io/ShrekSophone/');
  await expect(page.locator('a[href*="shrek.charles-lindecker.com"]')).toHaveCount(0);
  // Un nom de dépôt en linéale : son trait d’union ne s’ouvre pas comme dans la sérif.
  const depot = archives.getByRole('heading', { level: 3, name: 'img-convertor' });
  expect(await depot.evaluate((h) => getComputedStyle(h).fontFamily)).toMatch(/Instrument Sans/);
  // La rangée « Aussi » est rangée dans les archives : plus de section à part.
  await expect(page.locator('#aussi')).toHaveCount(0);
});

test('« Discutons » mène à la page Contact et se mesure', async ({ page }) => {
  await page.goto('/projets');
  const discutons = page.locator('main').getByRole('link', { name: /^Discutons/ });
  await expect(discutons).toHaveCount(1);
  await expect(discutons).toHaveAttribute('href', '/contact');
  await expect(discutons).toHaveAttribute('data-umami-event', 'contact-page');
  await expect(discutons).toHaveAttribute('data-umami-event-emplacement', 'discutons');
  await discutons.click();
  await expect(page).toHaveURL(/\/contact$/);
});

test('sur mobile, l’index se replie par famille : chaque numéro entier, rien ne défile', async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 0) > 860, 'mobile seulement');
  await page.goto('/projets');
  const liste = index(page).locator('.index-preuves__familles');
  const { defile, hauteur } = await liste.evaluate((ul) => ({ defile: ul.scrollWidth > ul.clientWidth, hauteur: ul.getBoundingClientRect().height }));
  expect(defile).toBe(false);
  // Trois lignes au plus : le chiffre de la vedette reste au premier écran (E1).
  expect(hauteur).toBeLessThan(110);
  for (const lien of await liste.getByRole('link').all()) {
    await expect(lien).toBeInViewport({ ratio: 1 });
    // Une cible d’au moins 24 px de côté (WCAG 2.5.8).
    const boite = (await lien.boundingBox())!;
    expect(Math.min(boite.width, boite.height)).toBeGreaterThanOrEqual(24);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
});

for (const theme of ['jour', 'nuit'] as const) {
  test.describe(`vitrine en thème ${theme}`, () => {
    test.use({ colorScheme: theme === 'nuit' ? 'dark' : 'light', reducedMotion: 'reduce' });

    test('axe : la vitrine, archives ouvertes', async ({ page }) => {
      await page.goto('/projets');
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await page.locator('#projets-archives summary').click();
      await expect(page.locator('#projets-archives')).toHaveAttribute('open', '');
      // L’en-tête collant recouvre ce qui passe sous lui au défilement :
      // l’analyse part du haut de la page, comme une arrivée.
      await page.evaluate(() => window.scrollTo(0, 0));
      expect(await axe(page)).toEqual([]);
    });
  });
}

test.describe('la vitrine sans JavaScript', () => {
  test.use({ javaScriptEnabled: false, reducedMotion: 'reduce' });

  test('tout le contenu est là : les cartes de chaque famille, l’index, « Contribuer » et les archives', async ({ page }) => {
    await page.goto('/projets');
    await expect(cartes(page).locator(':scope:visible')).toHaveCount(VITRINE.length);
    await expect(page.locator('section.vitrine-famille:visible')).toHaveCount(VITRINE_PAR_FAMILLE.length);
    await expect(page.locator('#contribuer')).toBeVisible();
    await expect(page.locator('#projets-archives summary')).toBeVisible();
    await page.locator('#projets-archives summary').click();
    await expect(page.locator('#projets-archives li.archives__projet:visible')).toHaveCount(PROJETS_ARCHIVES.length);
    await index(page).getByRole('link').nth(3).click();
    expect(new URL(page.url()).hash).toBe(`#${VITRINE[3].id}`);
    await expect(carte(page, VITRINE[3].id)).toBeInViewport();
  });

  for (const projet of VITRINE) {
    test(`la carte ${projet.id} ouvre sa page sans JavaScript`, async ({ page }) => {
      await page.goto('/projets');
      await lienDeCarte(page, projet).click();
      await expect.poll(() => new URL(page.url()).pathname).toBe(projet.href);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });
  }
});

test('depuis la vitrine, la vedette mène à sa page, puis au projet suivant', async ({ page }) => {
  const [premier, second] = VITRINE;
  await page.goto('/projets');
  await lienDeCarte(page, premier).click();
  await expect(page).toHaveURL(new RegExp(`${exact(premier.href)}$`));
  await page.locator('#retiens').getByRole('link', { name: /Projet suivant/ }).click();
  await expect(page).toHaveURL(new RegExp(`${exact(second.href)}$`));
});
