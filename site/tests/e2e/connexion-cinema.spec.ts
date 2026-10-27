import { expect, test, type Page } from '@playwright/test';
import { choisirEntreeJjk } from './support/entree-jjk';

test.use({ reducedMotion: 'no-preference' });
test.beforeEach(({ page }) => choisirEntreeJjk(page));

async function ouvrir(page: Page, options: { horloge?: boolean; connexion?: Promise<void> } = {}) {
  if (options.horloge) await page.clock.install({ time: new Date('2026-10-27T10:00:00Z') });
  const mutations: string[] = [];
  let connecte = false;
  await page.route('**/api/backoffice/**', async (route) => {
    if (route.request().method() !== 'GET') mutations.push(route.request().url());
    const chemin = new URL(route.request().url()).pathname.replace('/api/backoffice', '');
    if (chemin === '/login' && options.connexion) {
      await options.connexion;
      connecte = true;
    }
    const reponses: Record<string, unknown> = {
      '/login': { authenticated: true }, '/session': { authenticated: true, smtp_configured: true },
      '/settings': { email: 'contact@example.test' }, '/contacts': { contacts: [], total: 0, new_count: 0 },
      '/links': { links: [] }, '/tokens': { tokens: [] },
    };
    await route.fulfill({ status: connecte ? 200 : 401, contentType: 'application/json', body: JSON.stringify(
      connecte ? reponses[chemin] ?? {} : { code: 'UNAUTHORIZED', message: 'Connexion nécessaire.' },
    ) });
  });
  await page.goto('/backoffice');
  await expect(page.locator('[data-cinema-open]').last()).toBeEnabled();
  if (options.horloge) await page.clock.pauseAt(new Date('2026-10-27T10:01:00Z'));
  return mutations;
}

function progression(page: Page) {
  return page.locator('[data-cinema-progress]').evaluate((element) => Number((element as HTMLElement).style.getPropertyValue('--cinema-progression')));
}

async function renseigner(page: Page) {
  await page.getByLabel('Adresse e-mail de connexion', { exact: true }).fill('admin@example.test');
  await page.getByLabel('Mot de passe', { exact: true }).fill('demonstration');
}

test('le cinéma reste facultatif, confine le clavier et restitue le focus sans altérer la saisie', async ({ page }) => {
  const mutations = await ouvrir(page);
  const dialog = page.locator('#bo-cinema');
  const declencheur = page.locator('[data-cinema-open]').last();
  await expect(dialog).toBeHidden();
  await renseigner(page);
  await page.locator('button[data-technique="infini"]').click();
  await declencheur.focus();
  await page.keyboard.press('Enter');
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute('data-technique', 'infini');
  await expect(page.locator('#bo-cinema-close')).toBeFocused();
  await page.locator('#bo-login-email').evaluate((element) => element.focus());
  await expect(page.locator('#bo-cinema-close')).toBeFocused();
  for (let tour = 0; tour < 6; tour += 1) {
    await page.keyboard.press('Tab');
    // Le parcours natif peut passer par la barre du navigateur (body), mais
    // aucun contrôle de la page derrière le dialog ne reçoit le focus.
    expect(await dialog.evaluate((element) => element.matches(':modal') &&
      (element.contains(document.activeElement) || document.activeElement === document.body))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(dialog).toHaveAttribute('data-cinema-state', 'closed');
  await expect(declencheur).toBeFocused();
  await expect(page.locator('#bo-login-email')).toHaveValue('admin@example.test');
  await expect(page.locator('#bo-password')).toHaveValue('demonstration');
  expect(mutations).toEqual([]);
});

test('la pause fige le temps, puis les neuf plans se terminent et se rejouent', async ({ page }) => {
  await ouvrir(page, { horloge: true });
  await page.locator('[data-cinema-open]').last().click();
  await expect(page.locator('#bo-cinema')).toBeVisible();
  const dialog = page.locator('#bo-cinema');
  const stage = page.locator('[data-cinema-stage]');
  await expect(dialog).toHaveAttribute('data-cinema-state', 'playing');
  await expect(stage).toHaveAttribute('data-shot', 'invocation');
  await page.clock.runFor(500);
  await page.locator('#bo-cinema-pause').click();
  await expect(dialog).toHaveAttribute('data-cinema-state', 'paused');
  const tempsArrete = await progression(page);
  await page.clock.fastForward(20_000);
  expect(await progression(page)).toBe(tempsArrete);
  await expect(stage).toHaveAttribute('data-shot', 'invocation');
  expect(await page.locator('.jjk-film__appel > span').evaluate((element) => getComputedStyle(element).animationPlayState)).toBe('paused');
  await page.getByRole('button', { name: 'Reprendre la lecture', exact: true }).click();
  await page.clock.runFor(1400);
  await expect(stage).toHaveAttribute('data-shot', 'signes');
  await page.clock.runFor(2200);
  await expect(stage).toHaveAttribute('data-shot', 'regard');
  await page.clock.runFor(1600);
  await expect(stage).toHaveAttribute('data-shot', 'revelation');
  await page.clock.runFor(3200);
  await expect(stage).toHaveAttribute('data-shot', 'duel');
  await page.clock.runFor(2600);
  await expect(stage).toHaveAttribute('data-shot', 'adaptation');
  await page.clock.runFor(2600);
  await expect(stage).toHaveAttribute('data-shot', 'expansion');
  await page.clock.runFor(2800);
  await expect(stage).toHaveAttribute('data-shot', 'silence');
  await page.clock.runFor(1000);
  await expect(stage).toHaveAttribute('data-shot', 'final');
  await expect(dialog).toHaveAttribute('data-cinema-state', 'final');
  await expect(page.locator('#bo-cinema-enter')).toBeFocused();
  await expect(page.locator('#bo-cinema-pause')).toBeHidden();
  expect(await progression(page)).toBe(1);
  await page.clock.fastForward(60_000);
  await expect(stage).toHaveAttribute('data-shot', 'final');
  await page.locator('#bo-cinema-replay').click();
  await expect(stage).toHaveAttribute('data-shot', 'invocation');
  await expect(dialog).toHaveAttribute('data-cinema-state', 'playing');
  await expect(page.locator('#bo-cinema-pause')).toBeFocused();
  expect(await progression(page)).toBe(0);
});

test('le temps passé dans un onglet masqué ne compte pas dans la lecture', async ({ page }) => {
  await ouvrir(page, { horloge: true });
  await page.locator('[data-cinema-open]').last().click();
  await expect(page.locator('#bo-cinema')).toBeVisible();
  await expect(page.locator('#bo-cinema')).toHaveAttribute('data-cinema-state', 'playing');
  await page.clock.runFor(500);
  // Chromium sans écran conserve ses pages visibles : simuler le signal natif,
  // puis restituer la propriété du navigateur avant de reprendre la lecture.
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(page.locator('#bo-cinema')).toHaveAttribute('data-cinema-state', 'paused');
  const tempsArrete = await progression(page);
  await page.clock.fastForward(60_000);
  expect(await progression(page)).toBe(tempsArrete);
  await page.evaluate(() => {
    Reflect.deleteProperty(document, 'hidden');
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(page.locator('#bo-cinema')).toHaveAttribute('data-cinema-state', 'playing');
  await page.clock.runFor(1400);
  await expect(page.locator('[data-cinema-stage]')).toHaveAttribute('data-shot', 'signes');
});

test('le mouvement réduit présente immédiatement la fin complète, même après rejouer', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const mutations = await ouvrir(page);
  await renseigner(page);
  await page.locator('[data-cinema-open]').last().click();
  await expect(page.locator('#bo-cinema')).toBeVisible();
  const dialog = page.locator('#bo-cinema');
  await expect(dialog).toHaveAttribute('data-cinema-state', 'final');
  await expect(page.locator('[data-cinema-stage]')).toHaveAttribute('data-shot', 'final');
  await expect(page.locator('#bo-cinema-pause')).toBeHidden();
  expect(await dialog.evaluate((element) => element.getAnimations({ subtree: true }).filter((animation) => animation.playState === 'running').length)).toBe(0);
  await page.locator('#bo-cinema-replay').click();
  await expect(dialog).toHaveAttribute('data-cinema-state', 'final');
  await expect(page.locator('#bo-cinema-enter')).toBeFocused();
  await page.locator('#bo-cinema-enter').click();
  await expect(dialog).toBeHidden();
  await expect(page.locator('#bo-login-email')).toBeFocused();
  await expect(page.locator('#bo-password')).toHaveValue('demonstration');
  expect(mutations).toEqual([]);
});

test('sur mobile, les commandes et la sortie restent accessibles après le défilement du formulaire', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-390', 'Parcours propre au petit écran.');
  await page.setViewportSize({ width: 390, height: 640 });
  await ouvrir(page, { horloge: true });
  await renseigner(page);
  await page.locator('[data-cinema-open]').last().click();
  await expect(page.locator('#bo-cinema')).toBeVisible();
  await expect(page.locator('#bo-cinema-close')).toBeInViewport();
  await expect(page.locator('#bo-cinema')).toHaveAttribute('data-cinema-state', 'playing');
  await expect(page.locator('#bo-cinema-pause')).toBeInViewport();
  await page.clock.fastForward(20_000);
  await expect(page.locator('#bo-cinema-enter')).toBeInViewport();
  await expect(page.locator('#bo-cinema-replay')).toBeInViewport();
  await page.locator('#bo-cinema-enter').click();
  await expect(page.locator('#bo-login-email')).toBeFocused();
  await expect(page.locator('#bo-password')).toHaveValue('demonstration');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('une authentification réelle en cours ferme le cinéma sans retarder l’atelier', async ({ page }) => {
  let confirmer!: () => void;
  const connexion = new Promise<void>((resolve) => { confirmer = resolve; });
  const mutations = await ouvrir(page, { connexion });
  await renseigner(page);
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
  await page.locator('[data-cinema-open]').last().click();
  await expect(page.locator('#bo-cinema')).toBeVisible();
  await expect(page.locator('#bo-cinema')).toBeVisible();
  confirmer();
  await expect(page.locator('#bo-workspace')).toBeVisible();
  await expect(page.locator('#bo-cinema')).toBeHidden();
  await expect(page.locator('#bo-cinema')).toHaveAttribute('data-cinema-state', 'closed');
  await expect(page.locator('#bo-titre-contacts')).toBeFocused();
  expect(mutations.map((url) => new URL(url).pathname)).toEqual(['/api/backoffice/login']);
});

test('le son exige un clic explicite, se suspend en pause et libère son contexte à la fermeture', async ({ page }) => {
  await page.addInitScript(() => {
    const fenetre = window as typeof window & { __cinemaAudio?: AudioContext[] };
    const Contexte = window.AudioContext;
    fenetre.__cinemaAudio = [];
    window.AudioContext = class extends Contexte {
      constructor(options?: AudioContextOptions) {
        super(options);
        fenetre.__cinemaAudio!.push(this);
      }
    };
  });
  await ouvrir(page);
  await page.locator('[data-cinema-open]').last().click();
  await expect(page.locator('#bo-cinema')).toBeVisible();
  const audio = () => page.evaluate(() => (window as typeof window & { __cinemaAudio: AudioContext[] }).__cinemaAudio.map((contexte) => contexte.state));
  expect(await audio()).toEqual([]);
  await page.locator('#bo-cinema-sound').click();
  await expect.poll(audio).toEqual(['running']);
  await page.locator('#bo-cinema-pause').click();
  await expect.poll(audio).toEqual(['suspended']);
  await page.locator('#bo-cinema-close').click();
  await expect.poll(audio).toEqual(['closed']);
  await page.locator('[data-cinema-open]').last().click();
  await expect(page.locator('#bo-cinema')).toBeVisible();
  await expect(page.locator('#bo-cinema-sound')).toHaveAttribute('aria-pressed', 'false');
  expect(await audio()).toEqual(['closed']);
});

test('les neuf chapitres permettent de revoir un plan et de reprendre le montage', async ({ page }) => {
  await ouvrir(page, { horloge: true });
  await page.locator('[data-cinema-open]').last().click();
  const dialog = page.locator('#bo-cinema');
  await expect(dialog).toHaveAttribute('data-cinema-state', 'playing');
  expect(await dialog.locator('img').evaluateAll((images) => images.every((image) => (image as HTMLImageElement).naturalWidth > 0))).toBe(true);
  await page.locator('[data-cinema-seek="duel"]').click();
  await expect(page.locator('[data-cinema-stage]')).toHaveAttribute('data-shot', 'duel');
  await expect(page.locator('[data-cinema-seek="duel"]')).toHaveAttribute('aria-current', 'step');
  await page.clock.runFor(2700);
  await expect(page.locator('[data-cinema-stage]')).toHaveAttribute('data-shot', 'adaptation');
  await page.locator('[data-cinema-seek="signes"]').click();
  await expect(page.locator('[data-cinema-stage]')).toHaveAttribute('data-shot', 'signes');
  expect(await progression(page)).toBeCloseTo(1800 / 17800, 2);
  await page.locator('[data-cinema-seek="final"]').click();
  await expect(dialog).toHaveAttribute('data-cinema-state', 'final');
  await expect(page.locator('#bo-cinema-enter')).toBeVisible();
});

test('fermer pendant le chargement empêche un démarrage tardif', async ({ page }) => {
  let liberer!: () => void;
  const attente = new Promise<void>((resolve) => { liberer = resolve; });
  await page.route('**/*JJK-04*', async (route) => { await attente; await route.continue(); });
  await ouvrir(page);
  await page.locator('[data-cinema-open]').last().click();
  const dialog = page.locator('#bo-cinema');
  await expect(dialog).toHaveAttribute('data-cinema-state', 'loading');
  await page.locator('#bo-cinema-close').click();
  liberer();
  await page.waitForLoadState('networkidle');
  await expect(dialog).toBeHidden();
  await expect(dialog).toHaveAttribute('data-cinema-state', 'closed');
});

test('le plein écran se ferme avec la cinématique', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'bureau-1440', 'Commande réservée au grand écran.');
  await ouvrir(page, { horloge: true });
  await page.locator('[data-cinema-open]').last().click();
  await expect(page.locator('#bo-cinema')).toHaveAttribute('data-cinema-state', 'playing');
  await page.locator('#bo-cinema-fullscreen').click();
  await expect.poll(() => page.evaluate(() => Boolean(document.fullscreenElement))).toBe(true);
  await expect(page.locator('#bo-cinema-fullscreen')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('#bo-cinema-close').click();
  await expect.poll(() => page.evaluate(() => Boolean(document.fullscreenElement))).toBe(false);
  await expect(page.locator('#bo-cinema')).toBeHidden();
});

