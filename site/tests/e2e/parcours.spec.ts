import { expect, test, type Page } from '@playwright/test';

/**
 * Le parcours : le hub, la page Professionnel et la page Formation
 * (direction « Lanterne »). La page Compétences a sa propre spec.
 */
test.use({ reducedMotion: 'reduce' });

const rubriques = [
  ['Parcours professionnel', '/parcours/professionnel', 'Professionnel'],
  ['Compétences', '/parcours/competences', 'Compétences'],
  ['Formation et certifications', '/parcours/formation', 'Formation'],
] as const;

const EXPERIENCES = [
  { id: 'architecture', poste: 'Architecte logiciel', repere: 'Architecte logiciel', dates: ['2026-08'], statut: 'En poste', nature: 'CDI' },
  { id: 'mission-locale', poste: 'Mentor et animateur d’ateliers', repere: 'Mission Locale', dates: ['2026-01'], statut: 'Terminé', nature: 'Bénévolat' },
  { id: 'elan', poste: 'Formateur en développement web', repere: 'Elan Formation', dates: ['2025-12'], statut: 'Mission terminée', nature: 'Freelance' },
  { id: 'devmates', poste: 'Développeur indépendant', repere: 'Dev-Mates', dates: ['2025-11'], statut: 'Société ouverte', nature: 'Freelance' },
  { id: 'pvz', poste: 'Lead et mainteneur', repere: 'PvZ Fusion', dates: ['2025-10', '2025-12'], statut: 'En cours', nature: 'Bénévolat' },
  { id: 'atis', poste: 'Développeur full stack', repere: 'ATIS Solutions', dates: ['2025-08', '2025-09'], statut: 'Stage terminé', nature: 'Stage' },
] as const;

const ongletsDuParcours = (page: Page) => page.getByRole('navigation', { name: 'Navigation du parcours', exact: true });

test.describe('hub', () => {
  test('le premier écran dit qui, où et depuis quand, avec la photo de la séance', async ({ page }) => {
    await page.goto('/parcours');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Mon parcours');
    await expect(page.locator('[data-pli="titre"]')).toBeInViewport();
    const identite = page.locator('[data-pli="identite"]');
    await expect(identite).toBeInViewport();
    await expect(identite).toContainText('Architecte logiciel chez B-Hive, à Mulhouse, depuis août 2026');
    await expect(identite).toContainText('Lead du pôle francophone de PvZ Fusion et mainteneur de sa traduction multilingue');
    const photo = page.getByRole('img', { name: /Charles Lindecker, en chemise bleu roi/ });
    await expect(photo).toBeVisible();
    expect(await photo.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
  });

  test('chaque porte ouvre sa page, et les onglets ramènent à la vue d’ensemble', async ({ page }) => {
    await page.goto('/parcours');
    for (const [nom, chemin] of rubriques) {
      const porte = page.getByRole('navigation', { name: 'Explorer le parcours', exact: true }).getByRole('link', { name: nom, exact: true });
      await porte.locator('[data-visuel]').click();
      await expect(page).toHaveURL(new RegExp(`${chemin}$`));
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(nom);
      await ongletsDuParcours(page).getByRole('link', { name: 'Vue d’ensemble', exact: true }).click();
      await expect(page).toHaveURL(/\/parcours$/);
    }
  });

  test('chaque porte porte un fait et son emplacement de visuel', async ({ page }) => {
    await page.goto('/parcours');
    const portes = page.getByRole('navigation', { name: 'Explorer le parcours', exact: true });
    await expect(portes.getByRole('link', { name: 'Parcours professionnel', exact: true })).toHaveAccessibleDescription(/6 expériences.*20 personnes formées au pôle francophone/);
    // Une seule source pour le cœur de la stack : « Au quotidien » (config/competences.ts).
    await expect(portes.getByRole('link', { name: 'Compétences', exact: true })).toHaveAccessibleDescription(/Au quotidien\s:\sC#, \.NET, Angular, TypeScript, PostgreSQL, Docker, Git, GitHub Actions\sniveaux à confirmer/);
    await expect(portes).not.toContainText(/à valider|MySQL/);
    await expect(portes.getByRole('link', { name: 'Formation et certifications', exact: true })).toHaveAccessibleDescription(/Titre DWWM, RNCP niveau 5.*12 certifications/);
    for (const id of ['PAR-01', 'PAR-02', 'PAR-03']) await expect(portes.locator(`[data-visuel="${id}"]`)).toHaveCount(1);
    // Aucune flèche de sortie pour un lien interne.
    await expect(portes).not.toContainText('↗');
  });

  test('la frise montre le parcours de 2023 à aujourd’hui, chaque ligne vers sa fiche', async ({ page }) => {
    await page.goto('/parcours');
    const frise = page.getByRole('figure', { name: 'De 2023 à aujourd’hui' });
    await expect(frise).toBeVisible();
    const liens = frise.getByRole('link');
    await expect(liens).toHaveCount(8);
    await expect(frise.getByRole('list', { name: 'Formation' }).getByRole('link')).toHaveCount(2);
    await expect(frise.getByRole('list', { name: 'Travail' }).getByRole('link')).toHaveCount(4);
    await expect(frise.getByRole('list', { name: 'Communauté' }).getByRole('link')).toHaveCount(2);
    for (const lien of await liens.all()) {
      await expect(lien).toHaveAttribute('href', /^\/parcours\/(?:professionnel|formation)#[a-z-]+$/);
    }
    // Le nom du lien lit la période en mots : jamais « flèche droite ».
    await expect(frise.getByRole('link', { name: 'Formateur, Elan Formation, Freelance, décembre 2025, fin à confirmer', exact: true })).toHaveCount(1);
    await expect(frise.getByRole('link', { name: 'BUT Réseaux & Télécoms, Formation, de 2023 à 2024', exact: true })).toHaveAttribute('href', '/parcours/formation#reseaux');
    await expect(frise.getByRole('link', { name: 'Titre DWWM, Elan Formation, Formation, avril à octobre 2025', exact: true })).toHaveCount(1);
    for (const lien of await liens.all()) expect(await lien.getAttribute('aria-label')).not.toContain('→');

    await frise.getByRole('link', { name: /^Architecte logiciel, B-Hive/ }).click();
    await expect(page).toHaveURL(/\/parcours\/professionnel#architecture$/);
    await expect(page.locator('#architecture').getByRole('heading', { level: 3, name: 'Architecte logiciel' })).toBeInViewport();
  });

  test('la page se termine sur les projets et « Discutons » vers le contact', async ({ page }) => {
    await page.goto('/parcours');
    await expect(page.locator('main').getByRole('link', { name: /^Mes projets/ })).toHaveAttribute('href', '/projets');
    const discutons = page.locator('main').getByRole('link', { name: /^Discutons/ });
    await expect(discutons).toHaveAttribute('href', '/contact');
    await expect(discutons).toHaveAttribute('data-umami-event', 'contact-page');
    await expect(discutons).toHaveAttribute('data-umami-event-emplacement', 'discutons');
  });
});

test.describe('PvZ Fusion : lead depuis décembre 2025, jamais depuis octobre', () => {
  for (const chemin of ['/parcours', '/parcours/professionnel']) {
    test(`frise de ${chemin}`, async ({ page }) => {
      await page.goto(chemin);
      const lignes = page.locator('.frise__ligne a');
      await expect(lignes.first()).toBeVisible();
      for (const lien of await lignes.all()) {
        const nom = (await lien.getAttribute('aria-label')) ?? '';
        const texte = (await lien.innerText()).replace(/\s+/g, ' ');
        for (const ligne of [nom, texte]) {
          // Aucune ligne n’affirme « Lead … octobre 2025 » sans dire quand le rôle a commencé.
          if (/lead/i.test(ligne)) expect(ligne).toContain('lead depuis décembre 2025');
          expect(ligne).not.toMatch(/^Lead/);
        }
      }
      const pvz = page.getByRole('link', { name: 'Traducteur puis lead, PvZ Fusion, Bénévolat, depuis octobre 2025, lead depuis décembre 2025', exact: true });
      await expect(pvz).toHaveCount(1);
      // La barre se coupe en deux : la part de traducteur, puis celle de lead.
      await expect(pvz.locator('.frise__barre')).toHaveCount(2);
      await expect(pvz.locator('.frise__barre--avant')).toHaveCount(1);
    });
  }
});

test.describe('mise en page', () => {
  test('le contenu du hub tient en moins de deux écrans sur ordinateur, la frise commence dans le premier', async ({ page, isMobile }) => {
    test.skip(isMobile, 'mesure sur ordinateur');
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/parcours');
    const fin = await page.locator('main').evaluate((main) => main.getBoundingClientRect().bottom + window.scrollY);
    expect(fin).toBeLessThan(2 * 900);
    const frise = await page.getByRole('figure', { name: 'De 2023 à aujourd’hui' }).boundingBox();
    expect(frise!.y).toBeLessThan(900);
  });

  for (const largeur of [1440, 1024, 800]) {
    test(`les stations d’avant le DWWM restent compactes, sur une rangée, à ${largeur} px`, async ({ page, isMobile }) => {
      test.skip(isMobile, 'mesure sur ordinateur et tablette');
      await page.setViewportSize({ width: largeur, height: 900 });
      await page.goto('/parcours/formation');
      const dwwm = await page.locator('#dwwm').boundingBox();
      const stations = page.locator('.etape--station');
      await expect(stations).toHaveCount(5);
      const boites = await stations.evaluateAll((elements) => elements.map((e) => e.getBoundingClientRect().toJSON()));
      for (const boite of boites) expect(Math.round(boite.top)).toBe(Math.round(boites[0].top));
      // Le chemin d’avant pèse bien moins que le titre obtenu : vignette à gauche sur ordinateur.
      const hauteurs = await page.locator('.station').evaluateAll((elements) => elements.map((e) => e.getBoundingClientRect().height));
      for (const hauteur of hauteurs) {
        expect(hauteur).toBeLessThan(largeur >= 1300 ? 190 : 260);
        expect(hauteur).toBeLessThan(dwwm!.height * (largeur >= 1300 ? 0.45 : 0.65));
      }
      // Le trait de la frise finit sur la dernière pastille, sans dépasser la liste.
      const depasse = await page.locator('.formation-timeline').evaluate((liste) => {
        const droite = liste.getBoundingClientRect().right;
        const derniere = liste.lastElementChild as HTMLElement;
        const trait = getComputedStyle(derniere, '::before');
        return derniere.getBoundingClientRect().right - parseFloat(trait.right) > droite + 0.5;
      });
      expect(depasse).toBe(false);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    });
  }

  test('les certificats sont des cibles de 44 px', async ({ page }) => {
    await page.goto('/parcours/formation');
    const hauteurs = await page.locator('a.certification-preuve').evaluateAll((liens) => liens.map((lien) => lien.getBoundingClientRect().height));
    expect(hauteurs).toHaveLength(12);
    for (const hauteur of hauteurs) expect(hauteur).toBeGreaterThanOrEqual(44);
  });

  test('sur mobile, le rôle et le titre obtenu précèdent leur visuel', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'ordre propre au mobile');
    await page.goto('/parcours/professionnel');
    const titre = await page.locator('#architecture h3').boundingBox();
    const visuel = await page.locator('#architecture [data-visuel]').boundingBox();
    expect(titre!.y).toBeLessThan(visuel!.y);
    await page.goto('/parcours/formation');
    const dwwm = await page.locator('#dwwm h3').boundingBox();
    const image = await page.locator('#dwwm [data-visuel]').boundingBox();
    expect(dwwm!.y).toBeLessThan(image!.y);
  });
});

test.describe('onglets du parcours', () => {
  test('sur téléphone, les quatre onglets restent visibles et entiers, vue d’ensemble comprise', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'deux rangées sur téléphone seulement');
    for (const [, chemin, court] of rubriques) {
      await page.goto(chemin);
      const onglets = ongletsDuParcours(page);
      await expect(onglets.getByRole('link', { name: court, exact: true })).toHaveAttribute('aria-current', 'page');
      // Entiers, à l’arrondi du sous-pixel près : aucun ne sort par la gauche.
      for (const nom of ['Vue d’ensemble', 'Professionnel', 'Compétences', 'Formation']) {
        await expect(onglets.getByRole('link', { name: nom, exact: true })).toBeInViewport({ ratio: 0.99 });
      }
    }
  });
});

test.describe('page Professionnel', () => {
  test('la chronologie ouvre la page, du poste actuel au stage, avec des durées', async ({ page }) => {
    await page.goto('/parcours/professionnel');
    const chronologie = page.getByRole('figure', { name: 'D’août 2025 à aujourd’hui' });
    const lignes = chronologie.getByRole('link');
    await expect(lignes).toHaveCount(EXPERIENCES.length);
    await expect(lignes.first()).toBeInViewport();
    await expect(lignes.first()).toContainText('CDI, depuis août 2026');
    for (const [index, { id }] of EXPERIENCES.entries()) await expect(lignes.nth(index)).toHaveAttribute('href', `#${id}`);
    await expect(chronologie.getByRole('link', { name: 'Mentor, Mission Locale, Bénévolat, janvier 2026, fin à confirmer', exact: true })).toHaveCount(1);
    await expect(chronologie.getByRole('link', { name: 'Développeur full stack, ATIS Solutions, Stage, août à septembre 2025', exact: true })).toHaveCount(1);

    await lignes.nth(2).click();
    await expect(page).toHaveURL(/#elan$/);
    await expect(page.locator('#elan').getByRole('heading', { level: 3, name: 'Formateur en développement web', exact: true })).toBeInViewport();
  });

  test('la navigation de page suit la lecture (ordinateur) ou passe par le sommaire de l’en-tête (mobile)', async ({ page, isMobile }) => {
    await page.goto('/parcours/professionnel');
    if (isMobile) {
      const sommaire = page.locator('details.entete__sommaire');
      await sommaire.locator('summary').click();
      const liens = page.getByRole('navigation', { name: 'Sommaire de la page', exact: true }).getByRole('link');
      await expect(liens).toHaveText(EXPERIENCES.map(({ repere }) => new RegExp(`^${repere}`)));
      await liens.nth(4).click();
      await expect(page).toHaveURL(/#pvz$/);
      await expect(page.locator('#pvz').getByRole('heading', { level: 3, name: 'Lead et mainteneur', exact: true })).toBeInViewport();
      return;
    }
    const navigation = page.getByRole('navigation', { name: 'Dans cette page', exact: true });
    await expect(navigation.getByRole('link')).toHaveText(EXPERIENCES.map(({ repere }) => new RegExp(`^${repere}`)));
    await navigation.getByRole('link', { name: 'Elan Formation', exact: true }).click();
    await expect(page).toHaveURL(/#elan$/);
    await expect(navigation.locator('a[aria-current="location"]')).toHaveAttribute('href', '#elan');
    await expect(navigation).toBeInViewport();
  });

  test('le contexte d’une expérience se déplie au clavier', async ({ page }) => {
    await page.goto('/parcours/professionnel');
    const contexte = page.locator('details').filter({ has: page.locator('summary', { hasText: /^Le contexte chez Elan$/ }) });
    await expect(contexte).not.toHaveAttribute('open', '');
    await contexte.locator('summary').focus();
    await page.keyboard.press('Enter');
    await expect(contexte).toHaveAttribute('open', '');
    await expect(contexte).toContainText('Des étudiants que j’ai croisés pendant ma formation donnent mon nom.');
    await page.keyboard.press('Enter');
    await expect(contexte).not.toHaveAttribute('open', '');
  });

  test.describe('sans JavaScript', () => {
    test.use({ javaScriptEnabled: false });

    test('les fiches se lisent de la plus récente à la plus ancienne, au même gabarit', async ({ page }) => {
      await page.goto('/parcours/professionnel');
      const fiches = page.locator('ol.chronologie > li');
      await expect(fiches).toHaveCount(EXPERIENCES.length);
      await expect(fiches.getByRole('heading', { level: 3 })).toHaveText(EXPERIENCES.map(({ poste }) => poste));
      for (const [index, { id, dates, statut, nature }] of EXPERIENCES.entries()) {
        const fiche = fiches.nth(index);
        await expect(fiche).toHaveAttribute('id', id);
        await expect(fiche.locator('.fiche__nature')).toHaveText(nature);
        await expect(fiche.locator('.statut')).toHaveText(statut);
        const temps = fiche.locator('.fiche__periode time');
        await expect(temps).toHaveCount(dates.length);
        for (const [position, date] of dates.entries()) await expect(temps.nth(position)).toHaveAttribute('datetime', date);
        await expect(fiche.locator('[data-visuel^="PRO-0"]')).toHaveCount(1);
      }
      await expect(page.locator('#architecture .fiche__structure')).toHaveText('B-Hive Mulhouse');
      await expect(page.locator('#architecture')).toContainText('Je travaille sur le développement web et le DevOps.');
      // Fins inconnues : jamais extrapolées.
      for (const id of ['elan', 'mission-locale']) await expect(page.locator(`#${id} .a-confirmer`)).toHaveText('fin à confirmer');
      // Dev-Mates : la société ouverte, mais sans client ; rien de non sourcé (« conseil »).
      await expect(page.locator('#devmates .fiche__situation')).toHaveText('Ma société reste ouverte, sans client actuellement.');
      await expect(page.locator('#devmates')).not.toContainText(/conseil/i);
    });

    test('PvZ Fusion : traducteur, puis lead en décembre 2025, et la preuve chiffrée sourcée', async ({ page }) => {
      await page.goto('/parcours/professionnel');
      const pvz = page.locator('#pvz');
      await expect(pvz.getByRole('list', { name: 'Évolution du rôle' }).getByRole('listitem')).toHaveText([
        /Traducteur\s+octobre 2025/, /Lead du pôle francophone\s+décembre 2025/, /Mainteneur du projet multilingue/,
      ]);
      // Arrivé comme traducteur en octobre 2025 ; lead seulement depuis décembre 2025.
      await expect(pvz.locator('.fiche__periode')).toHaveText(/^\s*Depuis octobre 2025\s+\(lead depuis décembre 2025\)\s*$/);
      const preuve = pvz.locator('mark.surligneur');
      await expect(preuve).toHaveText('20');
      await expect(pvz).toContainText('confirmé le 13 octobre 2026');
      await expect(preuve).toHaveAttribute('data-source', /Témoignage/);
      await expect(pvz.getByRole('link', { name: /Voir le travail avec la communauté/ })).toHaveAttribute('href', '/projets/pvz-fusion');
      await expect(page.locator('#atis mark.surligneur')).toHaveText('−30 %');
    });

    test('la navigation de page mène à chaque fiche au clavier', async ({ page, isMobile }) => {
      test.skip(isMobile, 'la colonne de navigation s’efface sous 1 100 px');
      await page.goto('/parcours/professionnel');
      const liens = page.getByRole('navigation', { name: 'Dans cette page', exact: true }).getByRole('link');
      for (const [index, { id, poste }] of EXPERIENCES.entries()) {
        await liens.nth(index).focus();
        await page.keyboard.press('Enter');
        await expect(page).toHaveURL(new RegExp(`#${id}$`));
        await expect(page.locator(`#${id}`).getByRole('heading', { name: poste, level: 3, exact: true })).toBeInViewport();
      }
    });
  });
});

test.describe('page Formation', () => {
  test('les raccourcis de la page mènent aux formations, aux certifications et à Frontend Mentor', async ({ page, isMobile }) => {
    await page.goto('/parcours/formation');
    const destinations = [['Formations', 'formation'], ['Certifications', 'certifications'], ['Frontend Mentor', 'frontend-mentor']] as const;
    if (isMobile) await page.locator('details.entete__sommaire summary').click();
    const navigation = page.getByRole('navigation', { name: isMobile ? 'Sommaire de la page' : 'Dans cette page', exact: true });
    await expect(navigation.getByRole('link')).toHaveText(destinations.map(([nom]) => new RegExp(`^${nom}`)));
    for (const [nom, ancre] of destinations) {
      if (isMobile && !(await navigation.isVisible())) await page.locator('details.entete__sommaire summary').click();
      await navigation.getByRole('link', { name: new RegExp(`^${nom}`) }).click();
      await expect(page).toHaveURL(new RegExp(`/parcours/formation#${ancre}$`));
      await expect(page.locator(`#${ancre}`)).toBeInViewport();
    }
  });

  test.describe('sans JavaScript', () => {
    test.use({ javaScriptEnabled: false });

    test('le titre obtenu domine, et le programme CDA reste distinct', async ({ page }) => {
      await page.goto('/parcours/formation');
      const dwwm = page.locator('#dwwm');
      await expect(dwwm.getByText('Titre professionnel obtenu', { exact: true })).toBeVisible();
      await expect(dwwm.getByRole('heading', { level: 3, name: 'Développeur Web et Web Mobile', exact: true })).toBeVisible();
      await expect(dwwm).toContainText('Elan Formation, Mulhouse');
      await expect(dwwm).toContainText('RNCP niveau 5');
      const dates = await dwwm.locator('time[datetime]').evaluateAll((elements) => elements.map((e) => e.getAttribute('datetime')));
      expect(dates).toEqual(['2025-04', '2025-10']);
      await expect(dwwm.locator('mark.surligneur')).toHaveText('1 mois');

      const complement = page.locator('#complement-cda');
      await expect(complement.getByRole('heading', { name: 'Concepteur Développeur d’Applications', exact: true })).toBeVisible();
      await expect(complement.getByText('Programme étudié en complément', { exact: true })).toBeVisible();
      await expect(complement).toContainText(/≈\s*80\s*%/);
      await expect(complement.getByText('Titre non passé', { exact: true })).toBeVisible();
    });

    test('la frise présente les formations récentes en premier, sans date inventée', async ({ page }) => {
      await page.goto('/parcours/formation');
      const frise = page.locator('#formation ol.formation-timeline');
      const etapes = frise.locator(':scope > li');
      const formations = ['Développeur Web et Web Mobile', 'Piscine de 42', 'BUT Réseaux & Télécoms', 'Physique-chimie', 'BUT Informatique', 'Programmation en autodidacte'];
      const visuels = ['FOR-01', 'FOR-07', 'FOR-06', 'FOR-05', 'FOR-04', 'FOR-03'];
      await expect(etapes).toHaveCount(formations.length);
      for (const [index, formation] of formations.entries()) {
        await expect(etapes.nth(index).getByRole('heading', { level: 3, name: formation, exact: true })).toBeVisible();
        await expect(etapes.nth(index).locator(`[data-visuel="${visuels[index]}"]`)).toBeVisible();
      }
      const datesReseaux = await etapes.nth(2).locator('time[datetime]').evaluateAll((dates) => dates.map((date) => date.getAttribute('datetime')));
      expect(datesReseaux).toEqual(['2023', '2024']);
      // Q9 : pas de date pour la piscine de 42, ni pour les deux premières années.
      for (const index of [1, 3, 4, 5]) await expect(etapes.nth(index).locator('time')).toHaveCount(0);
      await expect(etapes.nth(1)).not.toContainText(/20\d\d/);
      await expect(etapes.nth(5)).toContainText(/vers\s*13\s*ans/i);
      await expect(etapes.nth(5)).toContainText('Le C, pour passer ensuite au C++ et coder mes jeux sur Unreal Engine');
      await expect(etapes.nth(1).getByRole('link', { name: /Mes exercices/ })).toHaveAttribute('href', 'https://github.com/LINDECKER-Charles/Piscine42-Mulhouse-2024');

      await expect(page.locator('#formation ~ #certifications')).toHaveCount(1);
      await expect(frise).not.toContainText(/ATIS Solutions|Dev[- ]Mates|Mission Locale|architecte logiciel|formateur en développement web/i);
    });

    test('les douze certifications gardent chacune leur certificat, daté et mesuré', async ({ page }) => {
      await page.goto('/parcours/formation');
      const section = page.locator('#certifications');
      await expect(section).toContainText('12 certifications, 2024–2026');
      await expect(section.locator('.domaine')).toHaveCount(5);
      // Les versions d’une même certification partagent une ligne.
      await expect(section.locator('.certification-ligne')).toHaveCount(10);
      const preuves = section.locator('a.certification-preuve');
      await expect(preuves).toHaveCount(12);
      for (const preuve of await preuves.all()) {
        await expect(preuve).toBeVisible();
        await expect(preuve).toHaveAttribute('href', /^https:\/\/www\.freecodecamp\.org\/certification\/hexanti\/[^/?#]+$/);
        await expect(preuve).toHaveAttribute('data-umami-event', 'lien-sortant');
        await expect(preuve).toHaveAttribute('data-umami-event-domaine', 'www.freecodecamp.org');
        await expect(preuve).toHaveAttribute('data-umami-event-emplacement', 'preuves');
        await expect(preuve.locator('time[datetime]')).toHaveCount(1);
      }
      const adresses = await preuves.evaluateAll((liens) => liens.map((lien) => lien.getAttribute('href')));
      expect(new Set(adresses).size).toBe(12);
      await expect(section.getByRole('link', { name: 'Relational Database V9 Mars 2026', exact: true })).toHaveCount(1);
      await expect(section.getByRole('link', { name: /Mon profil freeCodeCamp/ })).toHaveAttribute('href', 'https://www.freecodecamp.org/hexanti');
    });

    test('Frontend Mentor suit les certifications, avec un profil et un relevé daté', async ({ page }) => {
      await page.goto('/parcours/formation');
      const pratique = page.locator('#certifications ~ section#frontend-mentor');
      await expect(pratique).toHaveCount(1);
      await expect(pratique.getByRole('heading', { level: 2, name: 'Frontend Mentor' })).toBeVisible();
      await expect(pratique.getByRole('link', { name: /Voir mon profil Frontend Mentor/ })).toHaveAttribute('href', 'https://www.frontendmentor.io/profile/LINDECKER-Charles');
      await expect(pratique).toContainText(/20\s*solutions publiées/);
      await expect(pratique).toContainText(/385\s*points/);
      await expect(pratique).toContainText('Repères relevés le 9 octobre 2026.');
      await expect(pratique.locator('[data-visuel="FOR-09"]')).toHaveCount(1);
    });
  });
});

test.describe('sans JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('le hub mène aux trois pages au clavier, avec un fil d’Ariane et un onglet courant', async ({ page }) => {
    await page.goto('/parcours');
    for (const [nom, chemin, court] of rubriques) {
      const porte = page.getByRole('navigation', { name: 'Explorer le parcours', exact: true }).getByRole('link', { name: nom, exact: true });
      await porte.focus();
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(new RegExp(`${chemin}$`));
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(nom);

      const fil = page.getByRole('navigation', { name: 'Fil d’Ariane', exact: true });
      await expect(fil.getByRole('link', { name: 'Parcours', exact: true })).toHaveAttribute('href', '/parcours');
      const onglets = ongletsDuParcours(page);
      await expect(onglets.locator('[aria-current="page"]')).toHaveCount(1);
      await expect(onglets.getByRole('link', { name: court, exact: true })).toHaveAttribute('aria-current', 'page');
      for (const [, href, autre] of rubriques) await expect(onglets.getByRole('link', { name: autre, exact: true })).toHaveAttribute('href', href);
      await onglets.getByRole('link', { name: 'Vue d’ensemble', exact: true }).focus();
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(/\/parcours$/);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Mon parcours');
    }
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
  for (const chemin of ['/parcours', '/parcours/professionnel', '/parcours/formation']) {
    await page.emulateMedia({ media: 'screen' });
    await page.goto(chemin);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'nuit');
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    const titre = await page.getByRole('heading', { level: 1 }).evaluate((element) => getComputedStyle(element).color);
    expect(contrasteSurBlanc(titre)).toBeGreaterThanOrEqual(7);
    if (chemin === '/parcours') {
      const portes = page.getByRole('navigation', { name: 'Explorer le parcours', exact: true });
      for (const [nom] of rubriques) {
        const porte = portes.getByRole('link', { name: nom, exact: true });
        await expect(porte).toHaveCSS('background-color', 'rgb(255, 255, 255)');
        const couleurs = await porte.locator('h2, .porte__description').evaluateAll((elements) => elements.map((e) => getComputedStyle(e).color));
        for (const couleur of couleurs) expect(contrasteSurBlanc(couleur)).toBeGreaterThanOrEqual(4.5);
      }
    }
    if (chemin === '/parcours/formation') {
      const date = await page.locator('#dwwm .formation-date').evaluate((element) => getComputedStyle(element).color);
      expect(contrasteSurBlanc(date)).toBeGreaterThanOrEqual(4.5);
      await expect(page.locator('#certifications a.certification-preuve time[datetime]')).toHaveCount(12);
    }
  }
});
