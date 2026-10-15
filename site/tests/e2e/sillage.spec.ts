import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { surveillerConsole } from './support/navigateur';

/**
 * Sillage, sur le gabarit commun des pages de projet (règle E5) : en-tête au
 * pli (E1), fiche à sept cases en variante « dépôt privé », trois chiffres
 * sourcés dont un seul surligné, aucune sortie du site (dépôt privé, décision
 * du 14/10/2026), de vrais écrans sur des projets de démonstration, la loupe
 * qui montre le refus de Sillage, la page projet qui suit la largeur de
 * l’écran, la sortie commune entre Karl Scraper et Relais, et la page complète
 * et accessible sans script, jour et nuit.
 */

const CHEMIN = '/projets/sillage';

test('l’en-tête tient dans le premier écran : titre, identité, preuve, action', async ({ page }) => {
  await page.goto(CHEMIN);
  for (const marque of ['titre', 'identite', 'preuve', 'action']) {
    await expect(page.locator(`[data-pli="${marque}"]`), marque).toBeInViewport();
  }
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Confier un long travail à des agents, sans perdre la main.');
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
  await expect(ariane.locator('[aria-current="page"]')).toHaveText('Sillage');
  const entete = page.locator('.projet-tete');
  await expect(entete).toContainText('Orchestrer des agents IA');
  // Dépôt privé : la seule action de l’en-tête mène à la page elle-même.
  await expect(entete.locator('[data-pli="action"] a')).toHaveCount(1);
  const construit = entete.locator('[data-pli="action"]').getByRole('link', { name: /Sous le capot/ });
  await expect(construit).toHaveAttribute('href', '#construit');
  await construit.click();
  await expect(page.locator('#construit')).toBeInViewport();
  await expect(page.locator('#construit .point-capot')).toHaveCount(10);
});

test('la fiche technique : sept cases, statut à forme et mot, dépôt privé sans aucun lien', async ({ page }) => {
  await page.goto(CHEMIN);
  const fiche = page.getByRole('group', { name: 'Fiche du projet' });
  await expect(fiche.locator('dt')).toHaveText(['Besoin', 'Ma part', 'Rôle', 'Période', 'Équipe', 'Statut', 'Liens publics']);
  await expect(fiche.locator('.statut')).toHaveText('Outil personnel, en usage sur ma machine');
  await expect(fiche.locator('.fiche-projet__case--part')).toContainText('serveur en Rust');
  await expect(fiche.locator('.fiche-projet__case--liens')).toHaveText(/Aucun\s:\sle code est dans un dépôt privé\./);
  await expect(fiche.locator('a')).toHaveCount(0);
});

test('trois chiffres sourcés et datés, 579 seul surligné', async ({ page }) => {
  await page.goto(CHEMIN);
  const preuves = page.locator('[data-pli="preuve"] .preuve-chiffree');
  await expect(preuves.locator('.preuve-chiffree__valeur')).toHaveText(['579', '63 500', '643']);
  for (const preuve of await preuves.all()) {
    await expect(preuve.locator('.preuve-chiffree__source')).toHaveText(/\d{2}\/\d{2}\/\d{4}/);
  }
  const surligne = page.locator('.projet-tete mark');
  await expect(surligne).toHaveCount(1);
  await expect(surligne).toHaveText('579');
  await expect(surligne).toHaveAttribute('data-source', /Registre des blocages du dépôt/);
  // Les ancres des repères existent : la sortie et la note de sources.
  for (const href of await preuves.locator('a').evaluateAll((liens) => liens.map((lien) => lien.getAttribute('href') ?? ''))) {
    await expect(page.locator(href), href).toHaveCount(1);
  }
});

test('dépôt privé : aucune sortie du site, aucun nom de dépôt ni projet voisin non retenu', async ({ page }) => {
  await page.goto(CHEMIN);
  await expect(page.locator('main a[href^="http"]')).toHaveCount(0);
  await expect(page.locator('main a[href*="github"]')).toHaveCount(0);
  const texte = (await page.locator('main').innerText()).replace(/\s+/g, ' ');
  expect(texte).not.toMatch(/github|depot-prive|b-?hive/i);
  // Les trois pages de la famille « IA » se citent entre elles, en liens internes.
  const principe = page.locator('#principe');
  await expect(principe.getByRole('link', { name: 'Relais', exact: true })).toHaveAttribute('href', '/projets/relais');
  await expect(principe.getByRole('link', { name: 'Karl Scraper', exact: true })).toHaveAttribute('href', '/projets/karl-scraper');
  // Le lien vers Relais vit dans le pli de sa décision, replié par défaut.
  await expect(page.locator('#construit a[href="/projets/relais"]')).toHaveCount(1);
});

test('de vrais écrans, dans l’ordre du récit, qui s’ouvrent en grand et se referment à Échap', async ({ page }) => {
  await page.goto(CHEMIN);
  await expect(page.locator('.sil-entete-capture img').first()).toHaveAttribute('alt', /coordinateur a créé trois sous-agents/);
  const ecrans = [
    ['#principe', /page du projet Carnet de route/],
    ['#composer', /agent est refusé/],
    ['#reprendre', /reprend sa session encore active/],
    ['#resultat', /dossier, branche et commit du résultat/],
  ] as const;
  for (const [section, alt] of ecrans) {
    const image = page.locator(`${section} .capture`).filter({ visible: true }).locator('img').first();
    await expect(image, section).toHaveAttribute('alt', alt);
  }
  const agrandir = page.locator('#reprendre a[data-agrandir]').filter({ visible: true });
  await agrandir.scrollIntoViewIfNeeded();
  await agrandir.click();
  const visionneuse = page.locator('dialog[data-visionneuse]');
  await expect(visionneuse).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(visionneuse).toBeHidden();
  await expect(agrandir).toBeFocused();
});

test('la loupe montre le refus de Sillage, entier, sans recouvrir la cible ; sous 560 px, elle passe sous l’écran', async ({ page }) => {
  await page.goto(CHEMIN);
  const figure = page.locator('#composer .capture-annotee');
  await figure.scrollIntoViewIfNeeded();
  const loupe = figure.locator('.loupe');
  const detail = loupe.locator('img');
  await expect(detail).toBeVisible();
  // L’image de la loupe garde ses proportions (le recadrage de la capture ne la touche pas) :
  // elle est bien plus haute que la loupe, qui n’en montre qu’une bande.
  const [boiteLoupe, boiteDetail, cible, ecran] = await Promise.all([loupe.boundingBox(), detail.boundingBox(), figure.locator('.cible').boundingBox(), figure.locator('.capture__vue > a img').boundingBox()]);
  expect(boiteDetail!.height).toBeGreaterThan(boiteLoupe!.height * 4);
  expect(boiteDetail!.width / boiteDetail!.height).toBeCloseTo(2400 / 1733, 1);
  const separees = boiteLoupe!.x > cible!.x + cible!.width || boiteLoupe!.y > cible!.y + cible!.height || boiteLoupe!.x + boiteLoupe!.width < cible!.x || boiteLoupe!.y + boiteLoupe!.height < cible!.y;
  expect(separees).toBe(true);
  if ((page.viewportSize()?.width ?? 0) <= 560) {
    expect(boiteLoupe!.y).toBeGreaterThanOrEqual(ecran!.y + ecran!.height);
    const legende = await figure.locator('.capture__legende').boundingBox();
    expect(legende!.y).toBeGreaterThanOrEqual(boiteLoupe!.y + boiteLoupe!.height);
  }
  await expect(figure.locator('.capture__legende')).toContainText('Une relecture refusée');
});

test('la page projet suit la largeur de l’écran : bureau au-delà de 860 px, téléphone en dessous', async ({ page }) => {
  await page.goto(CHEMIN);
  const bureau = page.locator('#principe .sil-projet__bureau');
  const mobile = page.locator('#principe .sil-projet__mobile');
  if ((page.viewportSize()?.width ?? 0) > 860) {
    await expect(bureau).toBeVisible();
    await expect(mobile).toBeHidden();
  } else {
    await expect(bureau).toBeHidden();
    await expect(mobile).toBeVisible();
    await expect(mobile).toHaveClass(/capture--telephone/);
  }
});

test('le dialogue et le récapitulatif restent lisibles : la vue capturée à 390 px sous 861 px, celle de bureau au-delà', async ({ page }) => {
  await page.goto(CHEMIN);
  const etroit = (page.viewportSize()?.width ?? 0) <= 860;
  // Largeur d’écran de chaque capture (en px CSS, densité 2), bureau puis téléphone.
  const largeurs: Record<string, [number, number]> = { '#reprendre': [620, 370], '#resultat': [794, 332] };
  for (const section of ['#reprendre', '#resultat']) {
    const bureau = page.locator(`${section} .sil-paire__bureau`);
    const mobile = page.locator(`${section} .sil-paire__mobile`);
    await expect(etroit ? mobile : bureau, section).toBeVisible();
    await expect(etroit ? bureau : mobile, section).toBeHidden();
    // Un panneau sans fenêtre : le cadre « panneau », filet et coins, sans barre de navigateur.
    await expect(etroit ? mobile : bureau, section).toHaveClass(/capture--panneau/);
    // Échelle d’affichage : la capture (densité 2) n’est jamais réduite sous 0,55 de sa taille d’écran.
    const image = (etroit ? mobile : bureau).locator('img');
    await image.scrollIntoViewIfNeeded();
    const affichee = (await image.boundingBox())!.width;
    expect(affichee / largeurs[section][etroit ? 1 : 0], section).toBeGreaterThan(0.55);
  }
});

test('la capture d’en-tête est recadrée sur le coordinateur et ses sous-agents', async ({ page }) => {
  await page.goto(CHEMIN);
  const figure = page.locator('.sil-entete-capture');
  await expect(figure).toHaveClass(/capture--region/);
  const [vue, image] = await Promise.all([figure.locator('.capture__vue').boundingBox(), figure.locator('img').boundingBox()]);
  // L’image déborde de sa vue : seule la région du graphe se voit, à plus de deux fois la largeur du cadre.
  expect(image!.width).toBeGreaterThan(vue!.width * 2);
});

test('« Reprendre » et « Le résultat » changent de lumière : un acte teinté', async ({ page }) => {
  await page.goto(CHEMIN);
  for (const section of ['#reprendre', '#resultat']) await expect(page.locator(`.acte-teinte ${section}`), section).toHaveCount(1);
});

test('la sortie : Karl Scraper avant, Relais après, retour à la vitrine, « Discutons » vers /contact', async ({ page }) => {
  await page.goto(CHEMIN);
  const sortie = page.locator('#retiens');
  await expect(sortie.getByRole('heading', { level: 2 })).toHaveText('Aujourd’hui');
  await expect(sortie).toContainText('579');
  await expect(sortie).not.toContainText('à confirmer');
  // Dépôt privé : aucune liste de liens publics dans la sortie.
  await expect(sortie.getByRole('list', { name: 'Liens publics du projet' })).toHaveCount(0);
  const discutons = sortie.getByRole('link', { name: /^Discutons/ });
  await expect(discutons).toHaveAttribute('href', '/contact');
  await expect(discutons).toHaveAttribute('data-umami-event', 'contact-page');
  await expect(discutons).toHaveAttribute('data-umami-event-emplacement', 'discutons');
  await expect(sortie.getByRole('link', { name: /Projet précédent\s+Karl Scraper/ })).toHaveAttribute('href', '/projets/karl-scraper');
  await expect(sortie.getByRole('link', { name: /Projet suivant\s+Relais/ })).toHaveAttribute('href', '/projets/relais');
  await expect(sortie.getByRole('link', { name: /Tous les projets/ })).toHaveAttribute('href', '/projets');
});

test('une seule navigation de page, sans la note de sources ; la note dit d’où vient chaque chiffre', async ({ page }) => {
  await page.goto(CHEMIN);
  const navigation = page.locator('nav[aria-label="Dans cette page"]');
  await expect(navigation).toHaveCount(1);
  if ((page.viewportSize()?.width ?? 0) > 1100) await expect(navigation).toBeVisible();
  const attendus = ['#principe', '#composer', '#reprendre', '#resultat', '#fonctions', '#construit', '#retiens'];
  expect(await navigation.locator('a').evaluateAll((liens) => liens.map((lien) => lien.getAttribute('href')))).toEqual(attendus);
  for (const ancre of attendus) await expect(page.locator(ancre)).toHaveCount(1);
  const sources = page.locator('#sources');
  await expect(sources).toContainText('c256e76');
  await expect(sources).toContainText('9b4533a');
  await expect(sources).toContainText('démonstration');
  await expect(sources.locator('a')).toHaveCount(0);
});

test('la carte de la vitrine : un chiffre, aucun lien public, la vraie vue du graphe', async ({ page }) => {
  await page.goto('/projets');
  const carte = page.locator('li#sillage');
  await expect(carte.locator('.carte-projet__chiffre b')).toHaveText('579');
  await expect(carte.locator('a[href^="http"]')).toHaveCount(0);
  await expect(carte.getByRole('link', { name: 'Sillage', exact: true })).toHaveAttribute('href', CHEMIN);
  const vue = carte.locator('.vitrine-capture img');
  await expect(vue).toHaveAttribute('alt', /trois sous-agents/);
  await vue.scrollIntoViewIfNeeded();
  await expect(vue).toBeVisible();
});

for (const theme of ['jour', 'nuit'] as const) {
  test.describe(`axe, ${theme}`, () => {
    test.use({ colorScheme: theme === 'nuit' ? 'dark' : 'light', reducedMotion: 'reduce' });

    test('en-tête, écrans, décisions et sortie restent accessibles', async ({ page }) => {
      await page.goto(CHEMIN);
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      for (const zone of ['.projet-tete', '#principe', '#composer', '#reprendre', '#resultat', '#fonctions', '#construit', '#retiens']) {
        const resultats = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']).include(zone).analyze();
        expect(resultats.violations.map((v) => ({ id: v.id, cibles: v.nodes.slice(0, 3).map((n) => n.target) })), zone).toEqual([]);
      }
    });
  });
}

test.describe('sans JavaScript', () => {
  test.use({ javaScriptEnabled: false, reducedMotion: 'reduce' });

  test('la page est complète, et la vue de la page projet masquée ne se télécharge pas', async ({ page }) => {
    const erreurs = surveillerConsole(page);
    const requetes: string[] = [];
    page.on('request', (requete) => requetes.push(requete.url()));
    await page.goto(CHEMIN, { waitUntil: 'load' });
    for (const marque of ['titre', 'identite', 'preuve', 'action']) await expect(page.locator(`[data-pli="${marque}"]`)).toBeInViewport();
    await expect(page.locator('.sil-entete-capture img').first()).toBeVisible();
    await expect(page.locator('#resultat .capture img').filter({ visible: true })).toHaveCount(1);
    const largeur = page.viewportSize()?.width ?? 0;
    // La vue que la largeur masque prend une source neutre (ImageAdaptative) : rien ne part.
    const masquee = largeur > 860 ? /\/(page-projet|reprendre-execution|recapitulatif)-mobile\.[^/]*\.webp/ : /\/(page-projet|reprendre-execution|recapitulatif)\.[^/]*\.webp/;
    expect(requetes.filter((url) => masquee.test(url))).toEqual([]);
    await page.locator('[data-pli="action"]').getByRole('link', { name: /Sous le capot/ }).click();
    expect(new URL(page.url()).hash).toBe('#construit');
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
    expect(erreurs).toEqual([]);
  });
});
