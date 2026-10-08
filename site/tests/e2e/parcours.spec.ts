import { expect, test } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

const rubriques = [
  ['Parcours professionnel', '/parcours/professionnel'],
  ['Compétences', '/parcours/competences'],
  ['Formation et certifications', '/parcours/formation'],
] as const;

test('chaque illustration du hub ouvre la page de son panneau', async ({ page }) => {
  await page.goto('/parcours');
  for (const [nom, chemin] of rubriques) {
    const entree = page.getByRole('navigation', { name: 'Explorer le parcours', exact: true }).getByRole('link', { name: nom, exact: true });
    const illustration = entree.locator('svg').first();
    await illustration.scrollIntoViewIfNeeded();
    const cadre = await illustration.boundingBox();
    if (!cadre) throw new Error(`Illustration absente pour ${nom}`);

    // Le centre du dessin appartient au lien, même si le SVG ignore les événements de pointeur.
    await page.mouse.click(cadre.x + cadre.width / 2, cadre.y + cadre.height / 2);
    await expect(page).toHaveURL(new RegExp(`${chemin}$`));
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(nom);
    await page.getByRole('navigation', { name: 'Navigation du parcours', exact: true }).getByRole('link', { name: 'Vue d’ensemble', exact: true }).click();
    await expect(page).toHaveURL(/\/parcours$/);
  }
});

test.describe('navigation sans JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('le hub mène aux trois pages au clavier, avec un retour et un repère de page', async ({ page }) => {
    await page.goto('/parcours');
    for (const [nom, chemin] of rubriques) {
      const entree = page.getByRole('navigation', { name: 'Explorer le parcours', exact: true }).getByRole('link', { name: nom, exact: true });
      await entree.focus();
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(new RegExp(`${chemin}$`));
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(nom);

      const fil = page.getByRole('navigation', { name: 'Fil d’Ariane', exact: true });
      await expect(fil.getByRole('link', { name: 'Parcours', exact: true })).toHaveAttribute('href', '/parcours');
      const navigation = page.getByRole('navigation', { name: 'Navigation du parcours', exact: true });
      await expect(navigation.locator('[aria-current="page"]')).toHaveCount(1);
      await expect(navigation.getByRole('link', { name: nom, exact: true })).toHaveAttribute('aria-current', 'page');
      for (const [destination, href] of rubriques) {
        await expect(navigation.getByRole('link', { name: destination, exact: true })).toHaveAttribute('href', href);
      }
      await navigation.getByRole('link', { name: 'Vue d’ensemble', exact: true }).focus();
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(/\/parcours$/);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Mon parcours');
    }
  });

  test('les contextes professionnels et les certifications se déplient au clavier', async ({ page }) => {
    await page.goto('/parcours/professionnel');
    const contexte = page.locator('details').filter({ has: page.locator('summary', { hasText: /^Le contexte chez Elan$/ }) });
    await expect(contexte).not.toHaveAttribute('open', '');
    await contexte.locator('summary').focus();
    await page.keyboard.press('Enter');
    await expect(contexte).toHaveAttribute('open', '');
    await expect(contexte.locator('.prose')).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(contexte).not.toHaveAttribute('open', '');

    const navigation = page.getByRole('navigation', { name: 'Navigation du parcours', exact: true });
    await navigation.getByRole('link', { name: 'Formation et certifications', exact: true }).focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/parcours\/formation$/);
    const certifications = page.locator('details.certifications-detail');
    await expect(certifications).not.toHaveAttribute('open', '');
    await certifications.locator('summary').focus();
    await page.keyboard.press('Enter');
    await expect(certifications).toHaveAttribute('open', '');
    await expect(certifications.locator('time[datetime]').first()).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(certifications).not.toHaveAttribute('open', '');
  });
});

function contrasteSurBlanc(couleur: string): number {
  const composantes = couleur.match(/[\d.]+/g)?.slice(0, 3).map(Number);
  if (!composantes || composantes.length !== 3) throw new Error(`Couleur inattendue : ${couleur}`);
  const lineaires = composantes.map((valeur) => {
    const canal = valeur / 255;
    return canal <= 0.04045 ? canal / 12.92 : ((canal + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * lineaires[0] + 0.7152 * lineaires[1] + 0.0722 * lineaires[2];
  return 1.05 / (luminance + 0.05);
}

test('les pages du parcours restent contrastées à l’impression depuis le mode nuit', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  for (const chemin of ['/parcours', ...rubriques.map(([, chemin]) => chemin)]) {
    await page.goto(chemin);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'nuit');
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    const titre = await page.getByRole('heading', { level: 1 }).evaluate((element) => getComputedStyle(element).color);
    expect(contrasteSurBlanc(titre)).toBeGreaterThanOrEqual(7);
    if (chemin === '/parcours') {
      const hub = page.getByRole('navigation', { name: 'Explorer le parcours', exact: true });
      for (const [nom] of rubriques) {
        const panneau = hub.getByRole('link', { name: nom, exact: true });
        await expect(panneau).toHaveCSS('background-color', 'rgb(255, 255, 255)');
        const descriptionId = await panneau.getAttribute('aria-describedby');
        if (!descriptionId) throw new Error(`Description absente pour ${nom}`);
        const description = page.locator(`[id="${descriptionId}"]`);
        await expect(description).toBeVisible();
        const [couleurTitre, couleurDescription] = await Promise.all([
          panneau.getByRole('heading', { level: 2 }).evaluate((element) => getComputedStyle(element).color),
          description.evaluate((element) => getComputedStyle(element).color),
        ]);
        expect(contrasteSurBlanc(couleurTitre)).toBeGreaterThanOrEqual(4.5);
        expect(contrasteSurBlanc(couleurDescription)).toBeGreaterThanOrEqual(4.5);
      }
    }
  }
  const date = await page.locator('#formation .formation-date').last().evaluate((element) => getComputedStyle(element).color);
  expect(contrasteSurBlanc(date)).toBeGreaterThanOrEqual(4.5);
  await expect(page.locator('details.certifications-detail time').first()).toBeVisible();
});
