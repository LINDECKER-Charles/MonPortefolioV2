import { expect, test, type Page } from '@playwright/test';
import { choisirEntreeJjk } from './support/entree-jjk';

test.use({ reducedMotion: 'no-preference' });
test.beforeEach(({ page }) => choisirEntreeJjk(page));

async function preparer(page: Page, horloge = true) {
  if (horloge) await page.clock.install({ time: new Date('2026-10-27T12:00:00Z') });
  await page.addInitScript(() => {
    const trace = window as typeof window & { __audio: { debuts: number[]; contextes: AudioContext[] } };
    trace.__audio = { debuts: [], contextes: [] };
    const Audio = window.AudioContext;
    window.AudioContext = class extends Audio {
      constructor(options?: AudioContextOptions) { super(options); trace.__audio.contextes.push(this); }
      createBufferSource() {
        const source = super.createBufferSource();
        const demarrer = source.start.bind(source);
        source.start = (quand = 0, position = 0, duree?: number) => {
          trace.__audio.debuts.push(position);
          demarrer(quand, position, duree);
        };
        return source;
      }
    };
  });
  await page.route('**/api/backoffice/**', route => route.fulfill({ status: 401, contentType: 'application/json', body: '{"code":"UNAUTHORIZED"}' }));
  await page.goto('/backoffice');
  await expect(page.locator('[data-cinema-open]').last()).toBeEnabled();
  if (horloge) await page.clock.pauseAt(new Date('2026-10-27T12:01:00Z'));
  await page.locator('[data-cinema-open]').last().click();
  await expect(page.locator('#bo-cinema')).toHaveAttribute('data-cinema-state', 'playing');
}

function debuts(page: Page) {
  return page.evaluate(() => (window as typeof window & { __audio: { debuts: number[] } }).__audio.debuts);
}
async function son(page: Page) {
  await page.locator('#bo-cinema-sound').click();
  await expect(page.locator('#bo-cinema-sound')).toHaveAttribute('aria-busy', 'false');
  await expect.poll(async () => (await debuts(page)).length).toBeGreaterThan(0);
}

test('le master reste local, ne se charge que sur demande et possède un volume au clavier', async ({ page }) => {
  const sons: string[] = [];
  page.on('request', req => { if (new URL(req.url()).pathname.endsWith('.mp3')) sons.push(req.url()); });
  await preparer(page);
  expect(sons).toEqual([]);
  expect(await debuts(page)).toEqual([]);
  await son(page);
  expect(sons).toHaveLength(1);
  expect(new URL(sons[0]).origin).toBe(new URL(page.url()).origin);
  await page.locator('.jjk-cinema__mix summary').click();
  const volume = page.getByLabel('Volume du son', { exact: false });
  await volume.focus();
  await page.keyboard.press('Home');
  await expect(volume).toHaveValue('0');
  await page.keyboard.press('End');
  await expect(volume).toHaveValue('100');
  await expect(page.locator('[data-cinema-volume]')).toHaveText('100 %');
  await page.locator('#bo-cinema-close').click();
  await page.clock.runFor(50);
  await expect.poll(() => page.evaluate(() => (window as typeof window & { __audio: { contextes: AudioContext[] } }).__audio.contextes.map(audio => audio.state))).toEqual(['closed']);
});

test('la reprise, le même chapitre et le mute reprennent à la position exacte du film', async ({ page }) => {
  await preparer(page);
  await son(page);
  await page.clock.runFor(2750);
  await page.locator('#bo-cinema-pause').click();
  const arret = await page.locator('[data-cinema-progress]').evaluate(el => Number((el as HTMLElement).style.getPropertyValue('--cinema-progression')) * 17.8);
  await page.clock.fastForward(20000);
  await page.locator('#bo-cinema-pause').click();
  await expect.poll(async () => (await debuts(page)).at(-1)).toBeCloseTo(arret, 1);
  await page.locator('[data-cinema-seek="duel"]').click();
  await expect.poll(async () => (await debuts(page)).at(-1)).toBeCloseTo(8.8, 1);
  const avant = (await debuts(page)).length;
  await page.clock.runFor(500);
  await page.locator('[data-cinema-seek="duel"]').click();
  await expect.poll(async () => (await debuts(page)).length).toBe(avant + 1);
  expect((await debuts(page)).at(-1)).toBeCloseTo(8.8, 1);
  await page.locator('#bo-cinema-sound').click();
  await page.clock.runFor(650);
  await son(page);
  await expect.poll(async () => (await debuts(page)).at(-1)).toBeCloseTo(9.45, 1);
});

test('une erreur audio est visible et la nouvelle tentative fonctionne', async ({ page }) => {
  let requetes = 0;
  await page.route('**/audio/connexion-jjk.mp3', route => ++requetes === 1
    ? route.fulfill({ status: 503, body: 'indisponible' }) : route.continue());
  await preparer(page);
  await page.locator('#bo-cinema-sound').click();
  await expect(page.locator('[data-cinema-audio-status]')).toContainText('Réessayez.');
  await expect(page.locator('#bo-cinema-sound')).toHaveText('Réessayer le son');
  await expect(page.locator('#bo-cinema')).toHaveAttribute('data-cinema-state', 'playing');
  await son(page);
  expect(requetes).toBe(2);
  await expect(page.locator('[data-cinema-audio-status]')).toBeEmpty();
});

test('la résonance finale conserve sa position et ne redémarre pas après sa fin', async ({ page }) => {
  await preparer(page, false);
  await son(page);
  await page.locator('[data-cinema-seek="final"]').click();
  await expect.poll(async () => (await debuts(page)).at(-1)).toBeCloseTo(17.8, 1);
  await page.waitForTimeout(700);
  await page.locator('#bo-cinema-sound').click();
  await son(page);
  await expect.poll(async () => (await debuts(page)).at(-1)).toBeGreaterThan(18.3);
  await expect.poll(() => page.evaluate(() => (window as typeof window & { __audio: { contextes: AudioContext[] } }).__audio.contextes[0].state)).toBe('suspended');
  const nombre = (await debuts(page)).length;
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
    Reflect.deleteProperty(document, 'hidden');
    document.dispatchEvent(new Event('visibilitychange'));
  });
  expect(await debuts(page)).toHaveLength(nombre);
});

test('activer le mouvement réduit pendant la lecture coupe le son et conserve un focus visible', async ({ page }) => {
  await preparer(page);
  await son(page);
  await page.locator('.jjk-cinema__mix summary').click();
  await page.locator('#bo-cinema-volume').focus();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('#bo-cinema')).toHaveAttribute('data-cinema-state', 'final');
  await expect(page.locator('#bo-cinema-sound')).toBeHidden();
  await expect(page.locator('#bo-cinema-enter')).toBeFocused();
  await expect.poll(() => page.evaluate(() => (window as typeof window & { __audio: { contextes: AudioContext[] } }).__audio.contextes[0].state)).toBe('suspended');
});

test('le chargement audio fige le film et une fermeture annule sa lecture tardive', async ({ page }) => {
  let liberer!: () => void;
  const attente = new Promise<void>(resolve => { liberer = resolve; });
  await page.route('**/audio/connexion-jjk.mp3', async route => { await attente; await route.continue().catch(() => {}); });
  await preparer(page);
  await page.locator('#bo-cinema-sound').click();
  await expect(page.locator('#bo-cinema-sound')).toHaveAttribute('aria-busy', 'true');
  await expect(page.locator('#bo-cinema')).toHaveAttribute('data-cinema-state', 'paused');
  const progression = await page.locator('[data-cinema-progress]').getAttribute('style');
  await page.clock.fastForward(20000);
  await expect(page.locator('[data-cinema-progress]')).toHaveAttribute('style', progression!);
  await page.locator('#bo-cinema-close').click();
  liberer();
  await page.clock.runFor(50);
  await expect(page.locator('#bo-cinema')).toBeHidden();
  expect(await debuts(page)).toEqual([]);
});

test('le mouvement réduit reste utilisable même si un plan animé ne répond pas', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/*JJK-04*', route => route.abort());
  await page.route('**/api/backoffice/**', route => route.fulfill({ status: 401, body: '{}' }));
  await page.goto('/backoffice');
  await page.locator('[data-cinema-open]').last().click();
  await expect(page.locator('#bo-cinema')).toHaveAttribute('data-cinema-state', 'final');
  await expect(page.locator('#bo-cinema-enter')).toBeVisible();
  await expect(page.locator('#bo-cinema-sound')).toBeHidden();
});

test('une cinématique impossible à importer donne un retour visible', async ({ page }) => {
  await page.route('**/connexion-cinema.*.js', route => route.abort());
  await page.route('**/api/backoffice/**', route => route.fulfill({ status: 401, body: '{}' }));
  await page.goto('/backoffice');
  await page.locator('[data-cinema-open]').last().click();
  await expect(page.locator('#bo-cinema-retour')).toBeVisible();
  await expect(page.locator('#bo-cinema-retour')).toContainText('Impossible de charger');
  await expect(page.locator('#bo-cinema')).toBeHidden();
});
