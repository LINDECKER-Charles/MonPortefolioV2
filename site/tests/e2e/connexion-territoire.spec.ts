import { expect, test, type Page } from '@playwright/test';
import { choisirEntreeJjk } from './support/entree-jjk';

/** Les techniques modifient la scène, jamais la saisie ni le contrôle d’accès. */
test.use({ reducedMotion: 'no-preference' });
test.beforeEach(({ page }) => choisirEntreeJjk(page));

async function ouvrir(page: Page, connexionReussie = false) {
  const mutations: string[] = [];
  let connecte = false;
  await page.route('**/api/backoffice/**', async (route) => {
    if (route.request().method() !== 'GET') mutations.push(route.request().url());
    const chemin = new URL(route.request().url()).pathname.replace('/api/backoffice', '');
    if (connexionReussie && chemin === '/login') connecte = true;
    if (connecte) {
      const reponses: Record<string, unknown> = {
        '/login': { authenticated: true }, '/session': { authenticated: true, smtp_configured: true },
        '/settings': { email: 'contact@example.test' }, '/contacts': { contacts: [], total: 0, new_count: 0 },
        '/links': { links: [] }, '/tokens': { tokens: [] },
      };
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify(reponses[chemin] ?? {}) });
      return;
    }
    await route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ code: 'UNAUTHORIZED', message: 'Connexion nécessaire.' }) });
  });
  await page.goto('/backoffice');
  await expect(page.locator('[data-sanctuaire]')).toHaveAttribute('data-initialise', 'true');
  return mutations;
}

async function instrumenterSon(page: Page) {
  await page.addInitScript(() => {
    const fenetre = window as typeof window & { __audioCreations?: number; __audioContexte?: AudioContext };
    const Contexte = window.AudioContext;
    fenetre.__audioCreations = 0;
    window.AudioContext = class extends Contexte {
      constructor(options?: AudioContextOptions) {
        super(options);
        fenetre.__audioCreations! += 1;
        fenetre.__audioContexte = this;
      }
    };
  });
}

function etatAudio(page: Page) {
  return page.evaluate(() => (window as typeof window & { __audioContexte?: AudioContext }).__audioContexte?.state);
}

test('choisir une technique au clavier conserve la saisie et ne soumet rien', async ({ page }) => {
  const mutations = await ouvrir(page);
  const scene = page.locator('[data-sanctuaire]');
  await page.getByLabel('Adresse e-mail de connexion', { exact: true }).fill('admin@example.test');
  await page.getByLabel('Mot de passe', { exact: true }).fill('demonstration');
  const infini = page.locator('button[data-technique="infini"]');
  await infini.focus();
  await page.keyboard.press('Enter');
  await expect(scene).toHaveAttribute('data-technique', 'infini');
  await expect(infini).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('button[data-technique="ombres"]')).toHaveAttribute('aria-pressed', 'false');
  await page.locator('button[data-technique="sanctuaire"]').click();
  await expect(scene).toHaveAttribute('data-technique', 'sanctuaire');
  await expect(page.locator('button[data-technique][aria-pressed="true"]')).toHaveCount(1);
  await expect(page.locator('#bo-password')).toHaveValue('demonstration');
  await expect(page.locator('#bo-login-email')).toHaveValue('admin@example.test');
  expect(mutations).toEqual([]);
});

test('le territoire se joue puis se referme, et la pause l’interrompt immédiatement', async ({ page }) => {
  const mutations = await ouvrir(page);
  const scene = page.locator('[data-sanctuaire]');
  const lancer = page.locator('#bo-domain-trigger');
  await expect(lancer).toBeEnabled();
  await lancer.click();
  await expect(scene).toHaveAttribute('data-domain', 'active');
  await expect(lancer).toBeDisabled();
  await expect(scene).not.toHaveAttribute('data-domain', 'active');
  await expect(lancer).toBeEnabled();
  await lancer.click();
  await expect(scene).toHaveAttribute('data-domain', 'active');
  await page.locator('#bo-motion-toggle').click();
  await expect(scene).not.toHaveAttribute('data-domain', 'active');
  await expect(lancer).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Se connecter', exact: true })).toBeEnabled();
  expect(mutations).toEqual([]);
});

test('sur mobile, le territoire se déploie depuis le bas du formulaire même quand la roue est hors écran', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-390', 'Parcours de défilement propre au mobile.');
  // Une hauteur mobile plus courte permet réellement de sortir toute la roue
  // de l’écran, sans introduire de marge artificielle dans la page testée.
  await page.setViewportSize({ width: 390, height: 640 });
  const mutations = await ouvrir(page);
  const surface = page.locator('[data-wheel-surface]');
  const lancer = page.locator('#bo-domain-trigger');
  await lancer.scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
  await expect(surface).not.toBeInViewport();
  await expect(surface).toHaveAttribute('data-wheel-motion', 'paused');
  await expect(page.locator('[data-sanctuaire]')).toHaveAttribute('data-motion', 'active');
  await expect(lancer).toBeEnabled();
  await lancer.click();
  await expect(page.locator('[data-sanctuaire]')).toHaveAttribute('data-domain', 'active');
  await expect(page.locator('.jjk-territoire')).toBeInViewport();
  expect(mutations).toEqual([]);
});

test('le mouvement réduit garde le choix des techniques et neutralise le déploiement', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await ouvrir(page);
  await expect(page.locator('#bo-domain-trigger')).toBeDisabled();
  await page.locator('button[data-technique="infini"]').click();
  await expect(page.locator('[data-sanctuaire]')).toHaveAttribute('data-technique', 'infini');
  await expect(page.locator('[data-sanctuaire]')).not.toHaveAttribute('data-domain', 'active');
  await expect(page.getByRole('button', { name: 'Se connecter', exact: true })).toBeEnabled();
});

test('aucun contexte audio n’est créé avant l’activation explicite du son', async ({ page }) => {
  await instrumenterSon(page);
  await ouvrir(page);
  await page.locator('button[data-technique="infini"]').click();
  expect(await page.evaluate(() => (window as typeof window & { __audioCreations: number }).__audioCreations)).toBe(0);
  const son = page.locator('#bo-sound-toggle');
  await expect(son).toHaveAttribute('aria-pressed', 'false');
  await son.click();
  await expect(son).toHaveAttribute('aria-pressed', 'true');
  expect(await page.evaluate(() => (window as typeof window & { __audioCreations: number }).__audioCreations)).toBe(1);
  await son.click();
  await expect(son).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('[data-sanctuaire]')).toHaveAttribute('data-sound', 'off');
});

test('la pause coupe le son et une connexion réussie laisse finir sa note après le masquage du sanctuaire', async ({ page }) => {
  await instrumenterSon(page);
  await ouvrir(page, true);
  await page.locator('#bo-sound-toggle').click();
  await page.locator('#bo-domain-trigger').click();
  await expect.poll(() => etatAudio(page)).toBe('running');
  await page.locator('#bo-motion-toggle').click();
  await expect.poll(() => etatAudio(page)).toBe('suspended');
  await page.locator('#bo-motion-toggle').click();
  await page.getByLabel('Adresse e-mail de connexion', { exact: true }).fill('admin@example.test');
  await page.getByLabel('Mot de passe', { exact: true }).fill('demonstration');
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
  await expect(page.locator('#bo-workspace')).toBeVisible();
  await expect(page.locator('[data-sanctuaire]')).toBeHidden();
  await expect.poll(() => etatAudio(page)).toBe('running');
  // Laisser passer le callback IntersectionObserver du composant masqué.
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  expect(await etatAudio(page)).toBe('running');
  await expect.poll(() => etatAudio(page)).toBe('suspended');
});
