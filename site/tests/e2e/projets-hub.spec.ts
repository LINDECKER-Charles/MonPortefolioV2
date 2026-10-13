import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { surveillerConsole } from './support/navigateur';

/**
 * La vitrine /projets (cahier des charges, § 5.2 ; décisions de Charles du
 * 13/10/2026) : un titre, une phrase, l’index des étiquettes de preuve, puis
 * cinq projets dans l’ordre de ce qu’ils prouvent, PvZ Fusion en vedette.
 * Chaque carte mène à sa page au clavier et sans JavaScript, porte un chiffre,
 * un rôle, un statut et des liens publics mesurés ; suivent la rangée
 * « Aussi », les archives discrètes, « Contribuer » et « Discutons ».
 */

const PROJETS = [
  { id: 'pvz', nom: 'PvZ Fusion, pôle francophone', preuve: 'Mener une équipe', chemin: '/projets/pvz-fusion', chiffre: '20' },
  { id: 'league', nom: 'League Of Data Base', preuve: 'Un système en production', chemin: '/projets/league-of-database', chiffre: '403' },
  { id: 'omnicard', nom: 'Omnicard', preuve: 'Inventer', chemin: '/projets/omnicard', chiffre: '≈ 3 mois' },
  { id: 'bloodborne', nom: 'Bloodborne Legendary Run', preuve: 'Un produit de bout en bout', chemin: '/projets/bloodborne-legendary-run', chiffre: '1 289' },
  { id: 'gup', nom: 'gup', preuve: 'Un outil open source', chemin: '/projets/gup', chiffre: '153' },
] as const;

/** Les seules sorties admises depuis la vitrine : liste blanche et sites des projets. */
const SORTIES_ADMISES = [
  'https://github.com/Teyliu/PVZF-Translation',
  'https://league-of-data-base.com/fr/',
  'https://github.com/LINDECKER-Charles/LeagueOfDataBaseFinal',
  'https://github.com/LINDECKER-Charles/public-Omnicard',
  'https://bloodborne-legendary-run.com/fr/sky',
  'https://github.com/LINDECKER-Charles/gup',
  'https://www.npmjs.com/package/@charles_lindecker/gup',
  'https://github.com/LINDECKER-Charles/App.GitHealth',
  'https://github.com/LINDECKER-Charles/app-life-pixel',
  'https://github.com/LINDECKER-Charles/Web-Image-Formateur',
  'https://lindecker-charles.github.io/ShrekSophone/',
  'https://github.com/LINDECKER-Charles/ShrekSophone',
  'https://github.com/LINDECKER-Charles/gup/blob/main/.github/CONTRIBUTING.md',
  'https://github.com/LINDECKER-Charles/PVZ-Fuzion-ConsolManager/blob/main/CONTRIBUTING.md',
  'https://github.com/LINDECKER-Charles?tab=repositories',
];

const REGLES = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

const vitrine = (page: Page) => page.getByRole('list', { name: 'Cinq projets, ordonnés par ce qu’ils prouvent', exact: true });
const carte = (page: Page, id: string) => vitrine(page).locator(`:scope > li#${id}`);
const lienDeCarte = (page: Page, projet: (typeof PROJETS)[number]) => carte(page, projet.id).getByRole('link', { name: projet.nom, exact: true });

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
  await expect(page.locator('[data-pli="identite"]')).toHaveText('Des projets menés au bout : une équipe, des systèmes en production, des outils publiés.');
  await expect(page.locator('[data-pli="identite"]')).toBeInViewport();
  const index = page.getByRole('navigation', { name: 'Ce que prouve chaque projet', exact: true });
  await expect(index.getByRole('link').first()).toBeInViewport();
  const vedette = carte(page, 'pvz');
  await expect(vedette).toHaveClass(/carte-projet--vedette/);
  await expect(vedette.locator('.carte-projet__chiffre')).toBeInViewport({ ratio: 1 });
  await expect(vedette.locator('.carte-projet__chiffre b')).toHaveText('20');
  expect(erreurs).toEqual([]);
});

test('les chiffres des cartes portent leur date (règle C1)', async ({ page }) => {
  await page.goto('/projets');
  const releve = page.locator('.vitrine-releve');
  await expect(releve).toHaveText('Chiffres au 13 octobre 2026 ; objectifs de Bloodborne Legendary Run au 8 octobre 2026.');
  // Juste sous la vitrine, avant « Aussi ».
  expect(await releve.evaluate((p) => p.previousElementSibling?.matches('ol.vitrine'))).toBe(true);
});

test('sur ordinateur, le visuel d’une carte « ligne » remplit son panneau', async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 0) <= 860, 'ordinateur seulement');
  await page.goto('/projets');
  for (const [id, cible] of [['league', '[data-visuel="PRJ-02"]'], ['omnicard', '[data-visuel="PRJ-03"]'], ['gup', '.capture__vue']] as const) {
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

test('cinq projets dans l’ordre de ce qu’ils prouvent, une seule fois chacun, sans catégorie par loisir', async ({ page }) => {
  await page.goto('/projets');
  const cartes = vitrine(page).locator(':scope > li');
  await expect(cartes).toHaveCount(5);
  expect(await cartes.evaluateAll((liste) => liste.map((li) => li.id))).toEqual(PROJETS.map((p) => p.id));
  await expect(vitrine(page).locator('.carte-projet--vedette')).toHaveCount(1);
  await expect(vitrine(page).locator('.carte-projet--ligne')).toHaveCount(4);
  for (const [index, projet] of PROJETS.entries()) {
    const li = carte(page, projet.id);
    await expect(li.getByRole('heading', { level: 2 })).toContainText(projet.nom);
    await expect(li.locator('.carte-projet__preuve')).toHaveText(new RegExp(`^\\s*${index + 1}\\s*${projet.preuve}\\s*$`));
    await expect(li.locator('.carte-projet__chiffre b')).toHaveText(projet.chiffre);
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
  await expect(carte(page, 'omnicard').locator('.statut')).toHaveText('Hors ligne, en refonte');
  await expect(carte(page, 'gup').locator('.statut')).toHaveClass(/statut--ouvert/);
  await expect(carte(page, 'bloodborne').locator('.statut')).toHaveText('En ligne, web ; Android en test');
  await expect(carte(page, 'league').locator('.a-confirmer')).toHaveText('nom à confirmer');
});

test('l’index des preuves mène à chaque carte, sans rien masquer', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/projets');
  const index = page.getByRole('navigation', { name: 'Ce que prouve chaque projet', exact: true });
  const liens = index.getByRole('link');
  await expect(liens).toHaveCount(5);
  for (const [rang, projet] of PROJETS.entries()) {
    const lien = liens.nth(rang);
    await expect(lien).toHaveAttribute('href', `#${projet.id}`);
    await expect(lien).toContainText(projet.preuve);
    await lien.focus();
    await page.keyboard.press('Enter');
    expect(new URL(page.url()).hash).toBe(`#${projet.id}`);
    await expect(carte(page, projet.id)).toBeInViewport();
    await expect(vitrine(page).locator(':scope > li:visible')).toHaveCount(5);
  }
});

for (const projet of PROJETS) {
  test(`la carte ${projet.id} mène à sa page au clavier`, async ({ page }) => {
    const erreurs = surveillerConsole(page);
    await page.goto('/projets');
    const lien = lienDeCarte(page, projet);
    await expect(lien).toHaveAttribute('href', projet.chemin);
    await lien.focus();
    await page.keyboard.press('Enter');
    await expect.poll(() => new URL(page.url()).pathname).toBe(projet.chemin);
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
  for (const [id, visuel] of [['pvz', 'PRJ-01'], ['league', 'PRJ-02'], ['omnicard', 'PRJ-03']] as const) {
    await expect(carte(page, id).locator(`[data-visuel="${visuel}"]`)).toHaveCount(1);
  }
  for (const visuel of ['PRJ-06', 'PRJ-07', 'PRJ-08', 'PRJ-10', 'PRJ-11']) {
    await expect(page.locator(`[data-visuel="${visuel}"]`)).toHaveCount(1);
  }
});

test('« Aussi » : quatre projets publics, et la démo de Shreksophone en ligne', async ({ page }) => {
  await page.goto('/projets');
  const aussi = page.getByRole('region', { name: 'Aussi', exact: true });
  await expect(aussi.getByRole('heading', { level: 3 })).toHaveText(['GitHealth', 'Life Pixel', 'img-convertor', 'Shreksophone']);
  await expect(aussi.getByRole('link', { name: /La démo/ })).toHaveAttribute('href', 'https://lindecker-charles.github.io/ShrekSophone/');
  await expect(page.locator('a[href*="shrek.charles-lindecker.com"]')).toHaveCount(0);
});

test('les liens sortants sont publics, marqués « ↗ » et mesurés', async ({ page }) => {
  await page.goto('/projets');
  const liens = await page.locator('main a[href^="http"]').evaluateAll((elements) =>
    elements.map((lien) => ({
      href: lien.getAttribute('href') ?? '',
      texte: lien.textContent ?? '',
      rel: lien.getAttribute('rel'),
      evenement: lien.getAttribute('data-umami-event'),
      domaine: lien.getAttribute('data-umami-event-domaine'),
      emplacement: lien.getAttribute('data-umami-event-emplacement'),
      contribuer: Boolean(lien.closest('#contribuer')),
    })),
  );
  expect(liens.length).toBeGreaterThanOrEqual(15);
  for (const lien of liens) {
    expect(SORTIES_ADMISES, lien.href).toContain(lien.href);
    expect(lien.texte, lien.href).toContain('↗');
    expect(lien.rel, lien.href).toBe('external');
    expect(lien.evenement, lien.href).toBe('lien-sortant');
    expect(lien.domaine, lien.href).toBe(new URL(lien.href).hostname);
    // L’invitation open source garde l’emplacement de l’objectif O3.
    expect(lien.emplacement, lien.href).toBe(lien.contribuer ? 'discutons' : 'preuves');
  }
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
  await expect(archives.locator('summary')).toHaveText('Projets archivés');
  // Un signe dit qu’il s’ouvre : « + », qui tourne en « × » une fois ouvert.
  const signe = archives.locator('summary .archives__signe');
  await expect(signe).toBeVisible();
  await expect(signe).toHaveAttribute('aria-hidden', 'true');
  await expect(signe).toHaveCSS('transform', 'none');
  await archives.locator('summary').focus();
  await page.keyboard.press('Enter');
  await expect(archives).toHaveAttribute('open', '');
  await expect(signe).not.toHaveCSS('transform', 'none');
  await expect(archives).toContainText('Aucun projet archivé pour le moment.');
  await expect(archives.locator('a')).toHaveCount(0);
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

test('l’index défile sur lui-même sur mobile, jamais la page', async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 0) > 860, 'mobile seulement');
  await page.goto('/projets');
  const liste = page.getByRole('navigation', { name: 'Ce que prouve chaque projet', exact: true }).locator('ol');
  const { defile, hauteur } = await liste.evaluate((ol) => ({ defile: ol.scrollWidth > ol.clientWidth, hauteur: ol.getBoundingClientRect().height }));
  expect(defile).toBe(true);
  expect(hauteur).toBeLessThan(80);
  const dernier = liste.getByRole('link').last();
  await dernier.focus();
  await expect(dernier).toBeInViewport();
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

  test('tout le contenu est là : cinq cartes, l’index, « Aussi », « Contribuer » et les archives', async ({ page }) => {
    await page.goto('/projets');
    await expect(vitrine(page).locator(':scope > li:visible')).toHaveCount(5);
    await expect(page.getByRole('region', { name: 'Aussi', exact: true }).locator('li:visible')).toHaveCount(4);
    await expect(page.locator('#contribuer')).toBeVisible();
    await expect(page.locator('#projets-archives summary')).toBeVisible();
    await page.getByRole('navigation', { name: 'Ce que prouve chaque projet', exact: true }).getByRole('link').nth(3).click();
    expect(new URL(page.url()).hash).toBe('#bloodborne');
    await expect(carte(page, 'bloodborne')).toBeInViewport();
  });

  for (const projet of PROJETS) {
    test(`la carte ${projet.id} ouvre sa page sans JavaScript`, async ({ page }) => {
      await page.goto('/projets');
      await lienDeCarte(page, projet).click();
      await expect.poll(() => new URL(page.url()).pathname).toBe(projet.chemin);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });
  }
});

test('depuis la vitrine, la vedette mène à PvZ Fusion, puis au projet suivant', async ({ page }) => {
  await page.goto('/projets');
  await lienDeCarte(page, PROJETS[0]).click();
  await expect(page).toHaveURL(/\/projets\/pvz-fusion$/);
  await page.locator('#retiens').getByRole('link', { name: /Projet suivant/ }).click();
  await expect(page).toHaveURL(/\/projets\/league-of-database$/);
});
