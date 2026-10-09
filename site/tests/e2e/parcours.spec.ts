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

test('le poste actuel apparaît dès l’ouverture et les repères suivent la navigation', async ({ page, isMobile }) => {
  await page.goto('/parcours/professionnel');
  const emploi = page.locator('#architecture');
  const posteActuel = emploi.getByRole('heading', { name: 'Architecte logiciel', level: 3, exact: true });
  await expect(posteActuel).toBeInViewport({ ratio: 1 });
  await expect(emploi.getByText('Je travaille sur le développement web et le DevOps.', { exact: true })).toBeInViewport({ ratio: 1 });

  const raccourcis = page.locator('details.raccourcis-mobile');
  if (isMobile) {
    await expect(raccourcis).not.toHaveAttribute('open', '');
    await raccourcis.locator('summary', { hasText: /^Aller à une expérience$/ }).click();
    await expect(raccourcis).toHaveAttribute('open', '');
  }
  const reperes = page.getByRole('navigation', { name: 'Repères chronologiques', exact: true });
  const courant = reperes.locator('a[aria-current="location"]');
  if (!isMobile) {
    await expect(courant).toHaveCount(1);
    await expect(courant).toHaveAttribute('href', '#architecture');
  }
  await reperes.locator('a[href="#elan"]').click();
  await expect(page).toHaveURL(/#elan$/);
  await expect(page.locator('#elan').getByRole('heading', { name: 'Formateur en développement web', level: 3, exact: true })).toBeInViewport({ ratio: 1 });

  if (isMobile) {
    await expect(raccourcis).not.toHaveAttribute('open', '');
  } else {
    await expect(courant).toHaveCount(1);
    await expect(courant).toHaveAttribute('href', '#elan');
    await page.mouse.wheel(0, -10_000);
    await expect(posteActuel).toBeInViewport({ ratio: 1 });
    await expect(courant).toHaveCount(1);
    await expect(courant).toHaveAttribute('href', '#architecture');
    await expect(page).toHaveURL(/#elan$/);
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

  test('les expériences se lisent de la plus récente à la plus ancienne, avec des repères accessibles au clavier', async ({ page }) => {
    await page.goto('/parcours/professionnel');
    await expect(page.getByRole('heading', { name: 'Expériences', level: 2, exact: true })).toBeVisible();
    const emploi = page.locator('#architecture');
    await expect(emploi.getByText('Août 2026', { exact: true })).toBeVisible();
    await expect(emploi.getByRole('heading', { name: 'Architecte logiciel', level: 3, exact: true })).toBeVisible();
    await expect(emploi.locator('.experience__structure')).toHaveText('B-Hive Mulhouse');

    const parcours = [
      { id: 'architecture', poste: 'Architecte logiciel', dates: ['2026-08'], statut: 'CDI' },
      { id: 'mission-locale', poste: 'Mentor et animateur d’ateliers', dates: ['2026-01'], statut: 'Bénévolat terminé' },
      { id: 'elan', poste: 'Formateur en développement web', dates: ['2025-12'], statut: 'Mission terminée' },
      { id: 'devmates', poste: 'Développeur indépendant', dates: ['2025-11'], statut: 'Société ouverte' },
      { id: 'pvz', poste: 'Lead et mainteneur', dates: ['2025-10'], statut: 'Bénévolat en cours' },
      { id: 'atis', poste: 'Développeur full stack', dates: ['2025-08', '2025-09'], statut: 'Stage terminé' },
    ];
    const etapes = page.locator('ol.chronologie > li.chronologie__etape');
    await expect(etapes).toHaveCount(parcours.length);
    await expect(etapes.getByRole('heading', { level: 3 })).toHaveText(parcours.map(({ poste }) => poste));

    const raccourcis = page.locator('details.raccourcis-mobile');
    if (await raccourcis.isVisible()) {
      await expect(raccourcis).not.toHaveAttribute('open', '');
      await raccourcis.locator('summary', { hasText: /^Aller à une expérience$/ }).focus();
      await page.keyboard.press('Enter');
      await expect(raccourcis).toHaveAttribute('open', '');
    }
    const reperes = page.getByRole('navigation', { name: 'Repères chronologiques', exact: true });
    const liens = reperes.getByRole('link');
    await expect(liens).toHaveCount(parcours.length);
    for (const [index, { id, poste, dates, statut }] of parcours.entries()) {
      const etape = etapes.nth(index);
      await expect(etape).toHaveAttribute('id', id);
      const temps = etape.locator('time');
      await expect(temps).toHaveCount(dates.length);
      for (const [position, date] of dates.entries()) {
        await expect(temps.nth(position)).toHaveAttribute('datetime', date);
      }
      await expect(etape.getByText(statut, { exact: true })).toBeVisible();

      const repere = liens.nth(index);
      await expect(repere).toHaveAttribute('href', `#${id}`);
      await repere.focus();
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(new RegExp(`#${id}$`));
      await expect(page.locator(`#${id}`).getByRole('heading', { name: poste, level: 3, exact: true })).toBeInViewport();
    }
    await expect(page.locator('#devmates').getByText(/sans client actuellement/)).toBeVisible();
  });

  test('les contextes professionnels se déplient au clavier', async ({ page }) => {
    await page.goto('/parcours/professionnel');
    const contexte = page.locator('details').filter({ has: page.locator('summary', { hasText: /^Le contexte chez Elan$/ }) });
    await expect(contexte).not.toHaveAttribute('open', '');
    await contexte.locator('summary').focus();
    await page.keyboard.press('Enter');
    await expect(contexte).toHaveAttribute('open', '');
    await expect(contexte.locator('.prose')).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(contexte).not.toHaveAttribute('open', '');
  });

  test('les certifications sont consultables sans déplier et les repères fonctionnent au clavier', async ({ page }) => {
    await page.goto('/parcours/formation');
    const certifications = page.locator('#certifications .certification-ligne');
    await expect(certifications).toHaveCount(12);
    await expect(page.locator('#certifications .certification-domaine')).toHaveCount(5);
    await expect(page.locator('#certifications .domaine-description')).toHaveCount(0);
    for (const certification of await certifications.all()) {
      await expect(certification).toBeVisible();
      await expect(certification.locator('time[datetime]')).toBeVisible();
    }

    const reperes = page.getByRole('navigation', { name: 'Repères de formation', exact: true });
    const destinations = [
      ['Formations', 'formation'],
      ['Certifications', 'certifications'],
      ['Frontend Mentor', 'frontend-mentor'],
    ] as const;
    await expect(reperes.getByRole('link')).toHaveCount(destinations.length);
    for (const [nom, ancre] of destinations) {
      const lien = reperes.getByRole('link', { name: nom, exact: true });
      await expect(lien).toHaveText(nom);
      await expect(lien).toHaveAttribute('href', `#${ancre}`);
      await lien.focus();
      await expect(lien).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(new RegExp(`/parcours/formation#${ancre}$`));
      await expect(page.locator(`#${ancre}`)).toBeInViewport();
    }
  });

  test('le diplôme obtenu et le programme CDA étudié restent distincts', async ({ page }) => {
    await page.goto('/parcours/formation');
    const diplome = page.locator('#formation');
    await expect(diplome.getByRole('heading', { level: 2, name: 'Parcours de formation', exact: true })).toBeVisible();
    await expect(diplome.getByText('Titre professionnel obtenu', { exact: true })).toBeVisible();
    await expect(diplome.getByRole('heading', { level: 3, name: 'Développeur Web et Web Mobile', exact: true })).toBeVisible();

    const complement = page.locator('#complement-cda');
    await expect(complement.getByRole('heading', { name: 'Concepteur Développeur d’Applications', exact: true })).toBeVisible();
    await expect(complement.getByText('Programme étudié en complément', { exact: true })).toBeVisible();
    await expect(complement).toContainText(/≈\s*80\s*%/);
    await expect(complement.getByText('Titre non passé', { exact: true })).toBeVisible();
  });

  test('chaque certification possède une preuve individuelle distincte et mesurée', async ({ page }) => {
    await page.goto('/parcours/formation');
    const certifications = page.locator('#certifications .certification-ligne');
    await expect(certifications).toHaveCount(12);
    for (const certification of await certifications.all()) {
      const preuve = certification.getByRole('link');
      await expect(preuve).toHaveCount(1);
      await expect(preuve).toBeVisible();
      await expect(preuve).toHaveAttribute('href', /^https:\/\/www\.freecodecamp\.org\/certification\/hexanti\/[^/?#]+$/);
      await expect(preuve).toHaveAttribute('data-umami-event', 'lien-sortant');
      await expect(preuve).toHaveAttribute('data-umami-event-domaine', 'www.freecodecamp.org');
      await expect(preuve).toHaveAttribute('data-umami-event-emplacement', 'preuves');
    }
    const adresses = await certifications.locator('a').evaluateAll((liens) => liens.map((lien) => lien.getAttribute('href')));
    expect(new Set(adresses).size).toBe(12);
  });

  test('la frise présente les formations récentes en premier et reste séparée des certifications et des missions', async ({ page }) => {
    await page.goto('/parcours/formation');
    const frise = page.locator('#formation ol.formation-timeline');
    const etapes = frise.locator(':scope > li');
    const formations = [
      'Développeur Web et Web Mobile',
      'Piscine de 42',
      'BUT Réseaux & Télécoms',
      'Physique-chimie',
      'BUT Informatique',
      'Programmation en autodidacte',
    ];
    const illustrations = ['diplome', 'piscine', 'reseaux', 'sciences', 'informatique', 'autodidacte'];
    await expect(etapes).toHaveCount(formations.length);
    for (const [index, formation] of formations.entries()) {
      await expect(etapes.nth(index).getByRole('heading', { level: 3, name: formation, exact: true })).toBeVisible();
      const illustration = etapes.nth(index).locator(`svg.visuel-formation--${illustrations[index]}`);
      await expect(illustration).toHaveCount(1);
      await expect(illustration).toHaveAttribute('aria-hidden', 'true');
      await expect(illustration).toBeVisible();
    }
    await expect(frise.locator('.diplome-acquis, .reseaux-acquis')).toHaveCount(0);

    const datesDwwm = await etapes.nth(0).locator('time[datetime]').evaluateAll((dates) => dates.map((date) => date.getAttribute('datetime')));
    const datesReseaux = await etapes.nth(2).locator('time[datetime]').evaluateAll((dates) => dates.map((date) => date.getAttribute('datetime')));
    expect(datesDwwm).toEqual(expect.arrayContaining(['2025-04', '2025-10']));
    expect(datesReseaux).toEqual(expect.arrayContaining(['2023', '2024']));
    for (const index of [1, 3, 4, 5]) {
      await expect(etapes.nth(index).locator('time')).toHaveCount(0);
    }
    await expect(etapes.nth(5)).toContainText(/vers\s*13\s*ans/i);

    await expect(page.locator('#formation ~ #certifications')).toHaveCount(1);
    await expect(frise.locator('.certification-ligne, #certifications, #frontend-mentor')).toHaveCount(0);
    await expect(frise).not.toContainText(/ATIS Solutions|Dev[- ]Mates|Mission Locale|architecte logiciel|formateur en développement web/i);
  });

  test('Frontend Mentor est une pratique distincte après les certifications, avec un profil et un relevé daté', async ({ page }) => {
    await page.goto('/parcours/formation');
    const pratique = page.locator('#certifications ~ section#frontend-mentor');
    await expect(pratique).toHaveCount(1);
    await expect(pratique.getByRole('heading', { level: 2 })).toBeVisible();
    await expect(pratique.locator('.certification-ligne')).toHaveCount(0);
    await expect(pratique.getByRole('link', { name: 'Voir mon profil Frontend Mentor', exact: true })).toHaveAttribute('href', 'https://www.frontendmentor.io/profile/LINDECKER-Charles');
    await expect(pratique).toContainText(/20\s+projets/i);
    await expect(pratique).toContainText(/385\s+points/i);
    await expect(pratique).toContainText('Repères relevés en octobre 2026.');
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
  const datesCertification = page.locator('#certifications .certification-ligne time[datetime]');
  await expect(datesCertification).toHaveCount(12);
  for (const dateCertification of await datesCertification.all()) {
    await expect(dateCertification).toBeVisible();
  }
});
