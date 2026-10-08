import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { surveillerConsole } from './support/navigateur';

const PROJETS = [
  { id: 'bloodborne', chemin: '/projets/bloodborne-legendary-run' },
  { id: 'gup', chemin: '/projets/gup' },
  { id: 'pvz', chemin: '/projets/pvz-fusion' },
] as const;
const REGLES = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

function entreeProjet(page: Page, id: string) {
  return page.locator(`[data-project-card="${id}"] [data-open-project="${id}"]`).first();
}

async function ouvrirProjet(page: Page, id: string) {
  await entreeProjet(page, id).click();
  const dialogue = page.locator(`dialog[data-project-dialog="${id}"]`);
  await expect(dialogue).toBeVisible();
  await expect(dialogue).toHaveAttribute('open', '');
  return dialogue;
}

test('la vedette ouvre son aperçu au clavier et rend le focus à la fermeture', async ({ page }) => {
  await page.goto('/projets');
  const vedette = page.locator('[data-featured-project="bloodborne"]');
  await expect(vedette.getByRole('radio')).toHaveCount(0);
  await expect(vedette.getByRole('img', { name: /constellation|objectifs/i })).toBeVisible();
  await expect(vedette.locator('[data-open-project="bloodborne"]')).toHaveCount(1);
  const apercu = vedette.getByRole('link', { name: 'Ouvrir l’aperçu', exact: true });
  await apercu.focus();
  await page.keyboard.press('Enter');
  const dialogue = page.locator('dialog[data-project-dialog="bloodborne"]');
  await expect(dialogue).toBeVisible();
  await expect(page).toHaveURL(/\/projets$/);
  await expect.poll(() => dialogue.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(dialogue).toBeHidden();
  await expect(apercu).toBeFocused();
});

test('les centres d’intérêt mènent à leurs sections sans masquer les projets', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/projets');
  const visibles = page.locator('[data-project-card]:visible');
  await expect(visibles).toHaveCount(3);
  const jeux = page.locator('[data-project-section="jeux"]');
  const outils = page.locator('[data-project-section="outils"]');
  await expect(jeux.locator('[data-project-card]')).toHaveCount(2);
  await expect(jeux.locator('[data-project-card="bloodborne"]')).toBeVisible();
  await expect(jeux.locator('[data-project-card="pvz"]')).toBeVisible();
  await expect(outils.locator('[data-project-card]')).toHaveCount(1);
  await expect(outils.locator('[data-project-card="gup"]')).toBeVisible();
  for (const theme of ['jeux', 'outils']) {
    const lien = page.locator(`[data-project-theme="${theme}"]`);
    await expect(lien).toHaveAttribute('href', `#theme-${theme}`);
    await lien.focus();
    await page.keyboard.press('Enter');
    expect(new URL(page.url()).hash).toBe(`#theme-${theme}`);
    await expect(page.locator(`[data-project-section="${theme}"]`)).toBeInViewport();
    await expect(visibles).toHaveCount(3);
  }
  await expect(page.locator('[data-featured-project="bloodborne"]')).toBeVisible();
});

test('la vedette permet de rejoindre directement la page du projet', async ({ page }) => {
  await page.goto('/projets');
  const vedette = page.locator('[data-featured-project="bloodborne"]');
  const presentation = vedette.getByRole('link', { name: 'Page du projet', exact: true });
  await expect(presentation).toHaveAttribute('href', '/projets/bloodborne-legendary-run');
  await presentation.click();
  await expect(page).toHaveURL(/\/projets\/bloodborne-legendary-run$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

for (const projet of PROJETS) {
  test(`la présentation ${projet.id} s’ouvre au clavier et rend le focus à la fermeture`, async ({ page }) => {
    const erreurs = surveillerConsole(page);
    await page.goto('/projets');
    const entree = entreeProjet(page, projet.id);
    await entree.focus();
    await page.keyboard.press('Enter');
    const dialogue = page.locator(`dialog[data-project-dialog="${projet.id}"]`);
    await expect(dialogue).toBeVisible();
    await expect(page).toHaveURL(/\/projets$/);
    await expect.poll(() => dialogue.evaluate((element) => element.contains(document.activeElement))).toBe(true);

    const presentation = dialogue.getByRole('region');
    const deborde = await presentation.evaluate((element) => element.scrollHeight > element.clientHeight + 1);
    if (deborde) {
      await presentation.focus();
      await expect(presentation).toBeFocused();
      await page.keyboard.press('PageDown');
      await expect.poll(() => presentation.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
    }

    // Une modale native garde la navigation clavier dans sa présentation.
    for (let tabulation = 0; tabulation < 12; tabulation += 1) {
      await page.keyboard.press('Tab');
      await expect.poll(() => dialogue.evaluate((element) => element.contains(document.activeElement))).toBe(true);
    }
    await page.keyboard.press('Escape');
    await expect(dialogue).toBeHidden();
    await expect(entree).toBeFocused();
    expect(erreurs).toEqual([]);
  });
}

test('le bouton de fermeture et le fond du dialogue permettent de revenir au hub', async ({ page }) => {
  await page.goto('/projets');
  const entree = entreeProjet(page, 'bloodborne');
  const dialogue = await ouvrirProjet(page, 'bloodborne');
  await dialogue.locator('[data-close-project]').click();
  await expect(dialogue).toBeHidden();
  await expect(entree).toBeFocused();

  await entree.click();
  await expect(dialogue).toBeVisible();
  const cadre = await dialogue.boundingBox();
  const viewport = page.viewportSize();
  expect(cadre).not.toBeNull();
  expect(viewport).not.toBeNull();
  if (!cadre || !viewport) return;
  const coins = [
    { x: 1, y: 1 },
    { x: viewport.width - 1, y: 1 },
    { x: 1, y: viewport.height - 1 },
    { x: viewport.width - 1, y: viewport.height - 1 },
  ];
  const fond = coins.find(({ x, y }) => x < cadre.x || x > cadre.x + cadre.width || y < cadre.y || y > cadre.y + cadre.height);
  test.skip(!fond, 'La présentation occupe tout le viewport sans fond visible.');
  if (!fond) return;
  await page.mouse.click(fond.x, fond.y);
  await expect(dialogue).toBeHidden();
  await expect(entree).toBeFocused();
});

test('la démonstration GUP du dialogue met à jour le choix et garde les autres logiciels', async ({ page }) => {
  await page.goto('/projets');
  const dialogue = await ouvrirProjet(page, 'gup');
  await expect(dialogue.locator('[data-modal-gup-capture] img')).toBeVisible();
  const exemple = dialogue.locator('[data-modal-gup-example]');
  const demo = dialogue.locator('[data-gup-demo]');
  await expect(exemple).not.toHaveAttribute('open');
  await expect(demo).toBeHidden();
  const ouvrirExemple = exemple.locator('summary');
  await expect(ouvrirExemple).toHaveText('Essayer un exemple');
  await ouvrirExemple.focus();
  await page.keyboard.press('Enter');
  await expect(exemple).toHaveAttribute('open', '');
  await expect(demo).toBeVisible();
  const lancer = demo.locator('[data-gup-update]');
  await expect(lancer).toBeDisabled();
  const git = demo.locator('input[value="Git"]');
  await git.focus();
  await page.keyboard.press('Space');
  await expect(git).toBeChecked();
  await expect(lancer).toBeEnabled();
  await lancer.click();
  await expect(demo.locator('[data-gup-status]')).toHaveText('1 logiciel mis à jour dans cette démonstration.');
  await expect(demo.locator('[data-gup-package]:has(input[value="Git"]) [data-gup-version]')).toHaveText('2.52.0');
  await expect(demo.locator('[data-gup-package]:has(input[value="TypeScript"]) [data-gup-version]')).toHaveText('6.0.2');
  await expect(demo.locator('[data-gup-reset]')).toBeFocused();
  await demo.locator('[data-gup-reset]').click();
  await expect(demo.locator('input:checked')).toHaveCount(0);
  await expect(lancer).toBeDisabled();
  await expect(git).toBeFocused();
});

test('l’aperçu Bloodborne présente son interface et ses usages sans sélection préalable', async ({ page }) => {
  await page.goto('/projets');
  const dialogue = await ouvrirProjet(page, 'bloodborne');
  await expect(dialogue.getByRole('radio')).toHaveCount(0);
  const presentation = dialogue.locator('[data-modal-bloodborne-presentation]');
  await expect(presentation.getByRole('img', { name: /constellation|objectifs/i })).toBeVisible();
  await expect(presentation.getByRole('img', { name: /Gascoigne|combat/i })).toBeVisible();
  const usages = dialogue.locator('[data-modal-bloodborne-uses]');
  for (const nom of ['Retrouver où reprendre', 'Compléter sa collection', 'Préparer le prochain combat']) {
    await expect(usages.getByRole('heading', { name: nom, exact: true })).toBeVisible();
  }
});

test('l’aperçu PVZF montre ensemble le texte chinois et sa traduction française', async ({ page }) => {
  await page.goto('/projets');
  const dialogue = await ouvrirProjet(page, 'pvz');
  await expect(dialogue.getByRole('radio')).toHaveCount(0);
  const comparaison = dialogue.locator('[data-modal-pvz-comparison]');
  await expect(comparaison.getByRole('columnheader', { name: 'Texte chinois', exact: true })).toBeVisible();
  await expect(comparaison.getByRole('columnheader', { name: 'Français', exact: true })).toBeVisible();
  for (const [origine, francais] of [
    ['选择你的植物', 'Choisissez Vos Plantes'],
    ['查看图鉴', 'Voir l’Almanach'],
    ['返回游戏', 'Reprendre'],
  ]) {
    const ligne = comparaison.getByRole('row').filter({ hasText: origine });
    const original = ligne.locator('[data-modal-pvz-original]');
    const traduction = ligne.locator('[data-modal-pvz-french]');
    await expect(original).toBeVisible();
    await expect(original).toHaveAttribute('lang', 'zh-CN');
    await expect(traduction).toBeVisible();
    await expect(traduction).toHaveAttribute('lang', 'fr');
    await expect(traduction).toHaveText(francais);
  }
  await expect(comparaison.locator('button, a')).toHaveCount(0);
});

test('le dialogue garde un accès à la page complète du projet', async ({ page }) => {
  await page.goto('/projets');
  const dialogue = await ouvrirProjet(page, 'gup');
  const pageComplete = dialogue.getByRole('link', { name: 'Voir la page du projet', exact: true });
  await expect(pageComplete).toHaveAttribute('href', '/projets/gup');
  await pageComplete.click();
  await expect(page).toHaveURL(/\/projets\/gup$/);
  await expect(page.locator('[data-gup-demo]')).toBeVisible();
});

for (const theme of ['jour', 'nuit'] as const) {
  test.describe(`dialogues en thème ${theme}`, () => {
    test.use({ colorScheme: theme === 'nuit' ? 'dark' : 'light', reducedMotion: 'reduce' });

    for (const projet of PROJETS) {
      test(`axe : la présentation ${projet.id} ouverte`, async ({ page }) => {
        await page.goto('/projets');
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
        const dialogue = await ouvrirProjet(page, projet.id);
        if (projet.id === 'gup') {
          await dialogue.locator('[data-modal-gup-example] summary').click();
          await expect(dialogue.locator('[data-gup-demo]')).toBeVisible();
        }
        const resultats = await new AxeBuilder({ page }).withTags(REGLES).analyze();
        expect(resultats.violations.map((violation) => ({
          regle: violation.id,
          impact: violation.impact,
          aide: violation.help,
          cibles: violation.nodes.map((noeud) => noeud.target),
        }))).toEqual([]);
      });
    }
  });
}

test.describe('le hub sans JavaScript', () => {
  // Vérifier la destination des ancres sans courir contre le défilement
  // fluide déclenché par le clic précédent : ce test porte sur la navigation.
  test.use({ javaScriptEnabled: false, reducedMotion: 'reduce' });

  test('les trois cartes restent visibles et les thèmes mènent à leur section', async ({ page }) => {
    await page.goto('/projets');
    await expect(page.locator('[data-project-card]:visible')).toHaveCount(3);
    for (const theme of ['jeux', 'outils']) {
      const lien = page.locator(`[data-project-theme="${theme}"]`);
      await expect(lien).toHaveAttribute('href', `#theme-${theme}`);
      const href = await lien.getAttribute('href');
      expect(href).not.toBeNull();
      if (!href) continue;
      const cible = page.locator(`[data-project-section="${theme}"][id="${href.slice(1)}"]`);
      await expect(cible).toHaveCount(1);
      await lien.click();
      expect(new URL(page.url()).hash).toBe(href);
      await expect(cible).toBeInViewport();
      await expect(page.locator('[data-project-card]:visible')).toHaveCount(3);
    }
  });

  for (const projet of PROJETS) {
    test(`le lien ${projet.id} ouvre sa page sans JavaScript`, async ({ page }) => {
      await page.goto('/projets');
      const entree = entreeProjet(page, projet.id);
      await expect(entree).toHaveAttribute('href', projet.chemin);
      await entree.click();
      expect(new URL(page.url()).pathname).toBe(projet.chemin);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });
  }

  for (const nom of ['Ouvrir l’aperçu', 'Page du projet']) {
    test(`la vedette ouvre la page via « ${nom} » sans JavaScript`, async ({ page }) => {
      await page.goto('/projets');
      const vedette = page.locator('[data-featured-project="bloodborne"]');
      const lien = vedette.getByRole('link', { name: nom, exact: true });
      await expect(lien).toHaveAttribute('href', '/projets/bloodborne-legendary-run');
      await lien.click();
      await expect(page).toHaveURL(/\/projets\/bloodborne-legendary-run$/);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });
  }
});
