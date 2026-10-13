import { expect, test, type Route } from '@playwright/test';
import { surveillerConsole } from './support/navigateur';

/**
 * Les pages annexes de la direction « Lanterne » : Contact (puces de sujet,
 * panneau de réussite, carte d’identité), le blog sans article, la 404 qui
 * réoriente selon l’adresse cassée, et les mentions légales. Le formulaire
 * lui-même (validation, envoi, limites) reste couvert par contact.spec.ts.
 */
test.use({ reducedMotion: 'reduce' });

const SUCCES = 'Votre message a bien été envoyé. Je vous répondrai par e-mail.';
const repondre = (route: Route, status: number, body: Record<string, unknown>) =>
  route.fulfill({ status, contentType: 'application/json; charset=utf-8', body: JSON.stringify(body) });

// Règle E1 : ce qui dit où l’on est et quoi faire tient dans le premier écran.
// Sur mobile, le formulaire de Contact suit le titre : son bouton est plus bas.
for (const [chemin, marques, marquesMobile] of [
  ['/contact', ['titre', 'identite', 'action'], ['titre', 'identite']],
  ['/blog', ['titre', 'identite', 'action'], ['titre', 'identite', 'action']],
  ['/une-page-qui-n-existe-pas', ['titre', 'identite', 'action'], ['titre', 'identite', 'action']],
  ['/mentions-legales', ['titre', 'identite'], ['titre', 'identite']],
] as const) {
  test(`${chemin} : titre, identité et action au pli`, async ({ page, isMobile }) => {
    await page.goto(chemin);
    for (const marque of isMobile ? marquesMobile : marques) {
      await expect(page.locator(`[data-pli="${marque}"]`), marque).toBeInViewport({ ratio: 1 });
    }
  });
}

test.describe('contact', () => {
  test('« Discutons » titre la page, avec le portrait réel et les autres canaux', async ({ page }) => {
    const erreurs = surveillerConsole(page);
    await page.goto('/contact');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Discutons.');
    await expect(page.locator('main .portrait img')).toHaveAttribute('alt', /Charles Lindecker/);
    const moi = page.locator('.contact__moi');
    await expect(moi.getByRole('link', { name: /GitHub/ })).toHaveAttribute('data-umami-event-emplacement', 'contact');
    await expect(moi.getByRole('link', { name: /LinkedIn/ })).toHaveAttribute('data-umami-event-domaine', 'www.linkedin.com');
    // Le formulaire est la seule zone éclairée de l’écran.
    await expect(page.locator('main .foyer')).toHaveCount(1);
    await expect(page.locator('.contact__lettre')).toHaveClass(/foyer/);
    await page.waitForLoadState('networkidle');
    expect(erreurs).toEqual([]);
  });

  test('sur ordinateur, le bouton d’envoi tient dans le premier écran', async ({ page, isMobile }) => {
    test.skip(isMobile, 'sur mobile, le formulaire suit le titre');
    await page.goto('/contact');
    const bouton = page.getByRole('button', { name: 'Envoyer le message', exact: true });
    await expect(bouton).toBeInViewport({ ratio: 1 });
    // Une marge sous le bouton, pour qu’une police un peu plus grande ne le pousse pas sous le pli.
    const boite = await bouton.boundingBox();
    expect(boite!.y + boite!.height).toBeLessThanOrEqual(900 - 40);
  });

  test('sur mobile, le premier champ arrive dans le premier écran', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'mise en page mobile');
    await page.goto('/contact');
    await expect(page.locator('#contact-name')).toBeInViewport();
  });

  test('une puce remplit le sujet, « Autre » rend la main au champ libre', async ({ page }) => {
    await page.goto('/contact');
    const sujet = page.locator('#contact-subject');
    const puces = page.getByRole('group', { name: 'Sujets fréquents' });
    await puces.getByRole('button', { name: 'Une équipe ou un projet' }).click();
    await expect(sujet).toHaveValue('Une équipe ou un projet');
    await expect(puces.getByRole('button', { name: 'Une équipe ou un projet' })).toHaveAttribute('aria-pressed', 'true');
    await puces.getByRole('button', { name: 'Autre' }).click();
    await expect(sujet).toHaveValue('');
    await expect(sujet).toBeFocused();
    await sujet.fill('Une question sur gup');
    await expect(puces.getByRole('button', { name: 'Autre' })).toHaveAttribute('aria-pressed', 'true');
    await expect(puces.getByRole('button', { name: 'Une équipe ou un projet' })).toHaveAttribute('aria-pressed', 'false');
  });

  test('après un envoi réussi, le panneau propose la suite de la visite', async ({ page }) => {
    await page.route('**/api/contact', (route) => repondre(route, 200, { message: SUCCES }));
    await page.goto('/contact');
    const suite = page.locator('.contact-retour__suite');
    await expect(suite).toBeHidden();
    await page.locator('#contact-name').fill('Camille Martin');
    await page.locator('#contact-email').fill('camille@example.test');
    await page.getByRole('button', { name: 'Un échange technique' }).click();
    await page.locator('#contact-message').fill('Bonjour Charles, une question sur votre architecture.');
    await page.getByRole('button', { name: 'Envoyer le message', exact: true }).click();
    await expect(page.locator('[data-contact-status]')).toHaveText(SUCCES);
    await expect(suite).toBeVisible();
    // Le panneau, sous le formulaire, est amené dans l’écran (sur mobile surtout).
    await expect(page.locator('.contact-retour')).toBeInViewport({ ratio: 1 });
    await expect(page.locator('[data-contact-status]')).toBeFocused();
    await expect(suite.getByRole('link', { name: 'les projets' })).toHaveAttribute('href', '/projets');
    await expect(suite.getByRole('link', { name: 'le parcours' })).toHaveAttribute('href', '/parcours');
    // Le formulaire vidé, les puces le sont aussi.
    await expect(page.getByRole('button', { name: 'Un échange technique' })).toHaveAttribute('aria-pressed', 'false');
  });

  test.describe('sans JavaScript', () => {
    test.use({ javaScriptEnabled: false });

    test('les puces, qui ne feraient rien, ne s’affichent pas', async ({ page }) => {
      await page.goto('/contact');
      await expect(page.getByRole('group', { name: 'Sujets fréquents' })).toBeHidden();
      await expect(page.locator('#contact-subject')).toBeVisible();
    });
  });
});

test.describe('blog', () => {
  test('sans article : un seul titre, une phrase, le livre éclairé et un lien vers les projets', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.locator('main').getByRole('heading')).toHaveCount(1);
    const vide = page.locator('#blog-publications > section.blog-vide');
    await expect(vide).toContainText('Le premier article reste à écrire.');
    await expect(vide.locator('[data-visuel="BLG-01"]')).toBeVisible();
    await expect(vide.getByRole('link', { name: /lire les projets/ })).toHaveAttribute('href', '/projets');
    // La phrase reste une phrase, pas un second grand titre cassé en colonne.
    const phrase = vide.locator('.blog-vide__phrase');
    const lignes = await phrase.evaluate((el) => el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight));
    expect(lignes).toBeLessThanOrEqual(2.4);
    // Le bloc que le serveur remplace se ferme bien sur </section></div>.
    const html = await page.content();
    expect(html).toMatch(/<div id="blog-publications"[^>]*>[\s\S]*?<\/section>\s*<\/div>/);
  });
});

test.describe('404', () => {
  test('photo, lanterne, cinq tuiles et les chapitres de l’accueil', async ({ page }) => {
    const reponse = await page.goto('/une-page-qui-n-existe-pas');
    expect(reponse?.status()).toBe(404);
    await expect(page.locator('main .portrait img')).toHaveAttribute('alt', /Charles Lindecker/);
    await expect(page.locator('[data-visuel="ERR-01"]')).toBeVisible();
    const tuiles = page.locator('.introuvable__tuiles > li > a');
    await expect(tuiles).toHaveCount(5);
    expect(await tuiles.evaluateAll((liens) => liens.map((lien) => lien.getAttribute('href')))).toEqual(['/', '/projets', '/parcours', '/blog', '/contact']);
    await expect(page.getByRole('navigation', { name: 'Où aller' }).locator('a[href="/#origine"]')).toBeVisible();
    await expect(page.locator('[data-section]')).toHaveCount(2);
    await expect(page.locator('[data-section="projets"]')).toBeHidden();
  });

  for (const [adresse, section, premiere] of [
    ['/projets/omnicart', 'projets', '/projets/pvz-fusion'],
    ['/parcours/stage', 'parcours', '/parcours/professionnel'],
  ] as const) {
    test(`une adresse cassée sous /${section}/ met les pages de la section en tête`, async ({ page }) => {
      await page.goto(adresse);
      const liste = page.locator(`[data-section="${section}"]`);
      await expect(liste).toBeVisible();
      await expect(liste.locator('a').first()).toHaveAttribute('href', premiere);
      await expect(page.locator('[data-section]:visible')).toHaveCount(1);
    });
  }
});

test.describe('mentions légales', () => {
  test('les adresses e-mail portent la flèche de sortie, comme les autres liens externes', async ({ page }) => {
    await page.goto('/mentions-legales');
    const adresses = page.locator('main a[href^="mailto:"]');
    await expect(adresses).toHaveCount(2);
    for (const adresse of await adresses.all()) await expect(adresse.locator('.fleche')).toHaveText(/↗/);
  });

  test('un sommaire d’ancres, le tableau des données et la date de mise à jour', async ({ page }) => {
    await page.goto('/mentions-legales');
    await expect(page.locator('time[datetime="2026-10-13"]')).toBeVisible();
    await expect(page.locator('nav[aria-label="Dans cette page"]')).toHaveCount(1);
    const tableau = page.locator('#donnees table');
    await expect(tableau.locator('thead th')).toHaveText(['Donnée', 'Pourquoi', 'Combien de temps', 'Qui la reçoit']);
    await expect(tableau.locator('tbody tr')).toHaveCount(5);
    await expect(page.locator('#mesure-audience [data-opposition]')).toHaveCount(1);
    await expect(page.locator('#credits')).toContainText('Instrument Serif');
    await expect(page.locator('#credits')).toContainText('SIL Open Font License');
  });
});
