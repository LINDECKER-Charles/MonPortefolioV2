import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { surveillerConsole } from './support/navigateur';
import { confidentialite, motifsPage, motifsTrouves } from '../support/prive';

/**
 * Relais, sur le gabarit commun des pages de projet (règle E5) : en-tête au
 * pli (E1), fiche à sept cases dans sa variante « dépôt privé », trois
 * chiffres sourcés dont un seul surligné, aucun lien vers l’extérieur (dépôt
 * privé, décision du 14/10/2026), de vraies vues sur des données de
 * démonstration dont les loupes montrent le bon détail, la figure du point
 * d’accès, les liens vers Sillage et Karl Scraper, une sortie sans projet
 * suivant (Relais est le dernier de la vitrine), et la page complète et
 * accessible sans script, jour et nuit.
 */

const CHEMIN = '/projets/relais';

test('l’en-tête tient dans le premier écran : titre, identité, preuve, action', async ({ page }) => {
  await page.goto(CHEMIN);
  for (const marque of ['titre', 'identite', 'preuve', 'action']) {
    await expect(page.locator(`[data-pli="${marque}"]`), marque).toBeInViewport();
  }
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Un seul point d’accès aux agents IA de ma machine.');
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
  await expect(ariane.locator('[aria-current="page"]')).toHaveText('Relais');
  const entete = page.locator('.projet-tete');
  await expect(entete).toContainText('Encadrer des agents IA');
  // Aucune action vers le code : le seul lien de l’en-tête mène à la construction.
  await expect(entete.locator('[data-pli="action"] a')).toHaveCount(1);
  const construit = entete.locator('[data-pli="action"]').getByRole('link', { name: /Sous le capot/ });
  await expect(construit).toHaveAttribute('href', '#construit');
  await construit.click();
  await expect(page.locator('#construit')).toBeInViewport();
  await expect(page.locator('#construit .point-capot')).toHaveCount(10);
});

test('la fiche technique : sept cases, statut à forme et mot, aucun lien public mais le dépôt privé dit', async ({ page }) => {
  await page.goto(CHEMIN);
  const fiche = page.getByRole('group', { name: 'Fiche du projet' });
  await expect(fiche.locator('dt')).toHaveText(['Besoin', 'Ma part', 'Rôle', 'Période', 'Équipe', 'Statut', 'Liens publics']);
  await expect(fiche.locator('.statut')).toHaveText('Outil personnel, en usage sur ma machine');
  await expect(fiche).toContainText('Conception et développement');
  await expect(fiche).toContainText('Depuis septembre 2026');
  await expect(fiche.locator('a')).toHaveCount(0);
  await expect(fiche.locator('.fiche-projet__case--liens')).toContainText(/Aucun\s: le code est dans un dépôt privé\./);
  const discuter = page.getByRole('link', { name: /Discutons de ce projet/ });
  await expect(discuter).toHaveAttribute('href', '/contact');
  await expect(discuter).toHaveAttribute('data-umami-event-emplacement', 'fiche-projet');
});

test('trois chiffres sourcés et datés, 1 011 seul surligné', async ({ page }) => {
  await page.goto(CHEMIN);
  const preuves = page.locator('[data-pli="preuve"] .preuve-chiffree');
  await expect(preuves.locator('.preuve-chiffree__valeur')).toHaveText(['1 011', '52', '373']);
  for (const preuve of await preuves.all()) {
    await expect(preuve.locator('.preuve-chiffree__source')).toHaveText(/\d{2}\/\d{2}\/\d{4}/);
  }
  const surligne = page.locator('.projet-tete mark');
  await expect(surligne).toHaveCount(1);
  await expect(surligne).toHaveText('1 011');
  await expect(surligne).toHaveAttribute('data-source', /Registre des correctifs du dépôt/);
});

test('dépôt privé : aucune sortie du site, ni nom privé, ni bascule entre abonnements', async ({ page }) => {
  await page.goto(CHEMIN);
  // Aucun lien vers l’extérieur dans la page, note de sources comprise.
  await expect(page.locator('main a[href^="http"]')).toHaveCount(0);
  await expect(page.locator('main a[href^="mailto:"]')).toHaveCount(0);
  const html = await page.content();
  // Motifs du cadrage privé (tests/support/prive.ts), désignés par leur numéro.
  expect(motifsTrouves(html, motifsPage('relais'))).toEqual([]);
  const texte = (await page.locator('main').innerText()).replace(/\s+/g, ' ');
  expect(motifsTrouves(texte, [new RegExp(confidentialite().employeur, 'i')])).toEqual([]);
  // La capacité se dit en visibilité et en admission : ni bascule, ni secours, ni connexion automatisée.
  expect(texte).not.toMatch(/bascul|secours|OAuth|contourn/i);
  // Les chiffres des écrans ne passent pas pour un usage réel.
  await expect(page.locator('#sources')).toContainText('données de démonstration');
  await expect(page.locator('#sources')).toContainText('bdf041f');
});

test('le point d’accès : la figure, et les liens vers Sillage et Karl Scraper', async ({ page }) => {
  await page.goto(CHEMIN);
  const acces = page.locator('#acces');
  await expect(acces.getByRole('link', { name: 'Sillage', exact: true })).toHaveAttribute('href', '/projets/sillage');
  await expect(acces.getByRole('link', { name: 'Karl Scraper', exact: true })).toHaveAttribute('href', '/projets/karl-scraper');
  const figure = acces.locator('figure[data-visuel="REL-F1"]');
  await expect(figure).toBeVisible();
  await expect(figure.getByRole('list', { name: 'Les outils de la machine' }).locator('li')).toHaveCount(4);
  await expect(figure.getByRole('list', { name: 'Relais', exact: true }).locator('li')).toHaveCount(5);
  await expect(figure.getByRole('list', { name: 'Les agents' })).toContainText('2.1.281');
  await expect(figure.getByRole('list', { name: 'Les agents' })).toContainText('0.157.1');
  // Lisible à toutes les largeurs : rien ne déborde de la colonne.
  const [boite, section] = await Promise.all([figure.boundingBox(), acces.boundingBox()]);
  expect(boite!.x + boite!.width).toBeLessThanOrEqual(section!.x + section!.width + 1);
});

test('cinq vraies vues : l’en-tête entière, quatre annotées, toutes agrandissables', async ({ page }) => {
  await page.goto(CHEMIN);
  const vue = page.locator('.rel-entete-capture .capture__vue');
  const image = vue.locator('img');
  await expect(image).toHaveAttribute('alt', /tableau de bord de Relais/);
  const [cadre, rendu] = await Promise.all([vue.boundingBox(), image.boundingBox()]);
  // Aucun recadrage : la fenêtre entière, au ratio de la capture.
  expect(Math.abs(rendu!.width - cadre!.width)).toBeLessThan(1);
  expect(rendu!.width / rendu!.height).toBeCloseTo(2880 / 1800, 1);
  await expect(page.locator('main a[data-agrandir]')).toHaveCount(5);
  await expect(page.locator('main .capture-annotee')).toHaveCount(4);
  await expect(page.locator('#perimetre img').first()).toHaveAttribute('alt', /hors du périmètre/);
  await expect(page.locator('#capacite .rel-capacite__etape h3')).toHaveText(['Voir', 'Admettre']);
  const agrandir = page.locator('#perimetre a[data-agrandir]');
  await agrandir.scrollIntoViewIfNeeded();
  await agrandir.click();
  const visionneuse = page.locator('dialog[data-visionneuse]');
  await expect(visionneuse).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(visionneuse).toBeHidden();
  await expect(agrandir).toBeFocused();
});

test('les loupes montrent leur détail, sans recouvrir leur cible ; sous 560 px, elles passent sous l’écran', async ({ page }) => {
  await page.goto(CHEMIN);
  for (const capture of await page.locator('main .capture-annotee').all()) {
    await capture.scrollIntoViewIfNeeded();
    const loupe = capture.locator('.loupe');
    const detail = loupe.locator('img');
    await expect(detail).toHaveJSProperty('complete', true);
    const [boiteLoupe, cible, ecran, image] = await Promise.all([loupe.boundingBox(), capture.locator('.cible').boundingBox(), capture.locator('.capture__vue > a img').boundingBox(), detail.boundingBox()]);
    // L’image de la loupe garde ses proportions : elle n’est pas écrasée à la hauteur de la loupe.
    expect(image!.width / image!.height).toBeCloseTo(2880 / 1800, 1);
    expect(image!.height).toBeGreaterThan(boiteLoupe!.height * 1.5);
    const separees = boiteLoupe!.x > cible!.x + cible!.width || boiteLoupe!.y > cible!.y + cible!.height || boiteLoupe!.x + boiteLoupe!.width < cible!.x || boiteLoupe!.y + boiteLoupe!.height < cible!.y;
    expect(separees).toBe(true);
    if ((page.viewportSize()?.width ?? 0) <= 560) {
      expect(boiteLoupe!.y).toBeGreaterThanOrEqual(ecran!.y + ecran!.height);
      expect(boiteLoupe!.width).toBeGreaterThan(ecran!.width - 2);
      const legende = await capture.locator('.capture__legende').boundingBox();
      expect(legende!.y).toBeGreaterThanOrEqual(boiteLoupe!.y + boiteLoupe!.height);
    }
  }
});

test('la sortie : Sillage avant, aucun projet suivant, les projets archivés, la vitrine et « Discutons »', async ({ page }) => {
  await page.goto(CHEMIN);
  const sortie = page.locator('#retiens');
  await expect(sortie.getByRole('heading', { level: 2 })).toHaveText('En une phrase');
  await expect(sortie).toContainText('lancés, encadrés et relus');
  await expect(sortie).not.toContainText('à confirmer');
  const discutons = sortie.getByRole('link', { name: /^Discutons/ });
  await expect(discutons).toHaveAttribute('href', '/contact');
  await expect(discutons).toHaveAttribute('data-umami-event', 'contact-page');
  await expect(discutons).toHaveAttribute('data-umami-event-emplacement', 'discutons');
  await expect(sortie.getByRole('link', { name: /Projet précédent\s+Sillage/ })).toHaveAttribute('href', '/projets/sillage');
  await expect(sortie).not.toContainText('Projet suivant');
  await expect(sortie.getByRole('link', { name: /Projets archivés/ })).toHaveAttribute('href', '/projets#projets-archives');
  await expect(sortie.getByRole('link', { name: /Tous les projets/ })).toHaveAttribute('href', '/projets');
  await expect(sortie.getByRole('list', { name: 'Liens publics du projet' })).toHaveCount(0);
});

test('une seule navigation de page, sans la note de sources', async ({ page }) => {
  await page.goto(CHEMIN);
  const navigation = page.locator('nav[aria-label="Dans cette page"]');
  await expect(navigation).toHaveCount(1);
  if ((page.viewportSize()?.width ?? 0) > 1100) await expect(navigation).toBeVisible();
  const attendus = ['#acces', '#perimetre', '#capacite', '#analyse', '#fonctions', '#construit', '#retiens'];
  expect(await navigation.locator('a').evaluateAll((liens) => liens.map((lien) => lien.getAttribute('href')))).toEqual(attendus);
  for (const ancre of attendus) await expect(page.locator(ancre)).toHaveCount(1);
});

test('la carte de la vitrine : son chiffre, aucun lien sortant, et une vue lisible à sa taille', async ({ page }) => {
  await page.goto('/projets');
  const carte = page.locator('li#relais');
  await expect(carte).toContainText('1 011');
  await expect(carte).toContainText('Encadrer des agents IA');
  await expect(carte.locator('a[href^="http"]')).toHaveCount(0);
  await expect(carte.getByRole('link', { name: 'Relais', exact: true })).toHaveAttribute('href', CHEMIN);
  await expect(carte.locator('.carte-projet__voir')).toHaveText(/Voir le projet/);
  // Le cadre navigateur de ses voisines de la famille « IA », pas un terminal.
  await expect(carte.locator('.carte-projet__visuel .capture--navigateur')).toHaveCount(1);
  const image = carte.locator('.carte-projet__visuel img');
  await expect(image).toHaveAttribute('alt', /Dashboard de Relais/);
  await image.scrollIntoViewIfNeeded();
  await expect(image).toHaveJSProperty('complete', true);
  // Le recadrage couvre 585 px de l’interface (deux compteurs et la consommation locale) : montré
  // sur 260 px au moins, ses chiffres restent lisibles, sans agrandir le fichier de 960 px.
  const rendu = await image.boundingBox();
  expect(rendu!.width).toBeGreaterThanOrEqual(260);
  expect(rendu!.width).toBeLessThanOrEqual(960);
});

for (const theme of ['jour', 'nuit'] as const) {
  test.describe(`axe, ${theme}`, () => {
    test.use({ colorScheme: theme === 'nuit' ? 'dark' : 'light', reducedMotion: 'reduce' });

    test('en-tête, corps, décisions et sortie restent accessibles', async ({ page }) => {
      await page.goto(CHEMIN);
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      const analyser = async (zone: string) => {
        const resultats = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']).include(zone).analyze();
        expect(resultats.violations.map((v) => ({ id: v.id, cibles: v.nodes.slice(0, 3).map((n) => n.target) })), zone).toEqual([]);
      };
      for (const zone of ['.projet-tete', '#acces', '#perimetre', '#capacite', '#analyse', '#fonctions', '#construit', '#retiens']) await analyser(zone);
      // La note de sources, ouverte.
      await page.locator('#sources summary').click();
      await analyser('#sources');
    });
  });
}

test.describe('sans JavaScript', () => {
  test.use({ javaScriptEnabled: false, reducedMotion: 'reduce' });

  test('la page est complète : en-tête, figure, vues, décisions et note de sources', async ({ page }) => {
    const erreurs = surveillerConsole(page);
    await page.goto(CHEMIN);
    for (const marque of ['titre', 'identite', 'preuve', 'action']) await expect(page.locator(`[data-pli="${marque}"]`)).toBeInViewport();
    await expect(page.locator('.rel-entete-capture img')).toBeVisible();
    await expect(page.locator('figure[data-visuel="REL-F1"]')).toBeVisible();
    await expect(page.locator('main .capture-annotee img').first()).toBeAttached();
    await expect(page.locator('#construit .point-capot')).toHaveCount(10);
    // La note de sources se lit sans script : le résumé l’ouvre.
    await page.locator('#sources summary').click();
    await expect(page.locator('#sources')).toContainText('260');
    await page.locator('[data-pli="action"]').getByRole('link', { name: /Sous le capot/ }).click();
    expect(new URL(page.url()).hash).toBe('#construit');
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
    expect(erreurs).toEqual([]);
  });
});
