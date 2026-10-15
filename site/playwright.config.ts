import { defineConfig, devices } from '@playwright/test';
import { IS_CI, MESURE, SITE, SKIP_BUILD } from './tests/e2e/support/serveurs.mjs';

const CHROMIUM_SANS_HINTING = ['--font-render-hinting=none'];

/**
 * Tests de bout en bout : le build de production, servi par le serveur de
 * production (server/server.mjs), dans Chromium à deux largeurs ; le favicon
 * est aussi vérifié dans Firefox et WebKit. Pas
 * d'`astro dev` : c'est ce qui part en ligne qui est testé — en-têtes,
 * statuts, chargeur de mesure compris.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: IS_CI,
  retries: IS_CI ? 1 : 0,
  workers: IS_CI ? 2 : undefined,
  reporter: IS_CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  timeout: 30_000,
  expect: { timeout: 5_000 },
  use: {
    baseURL: SITE.url,
    locale: 'fr-FR',
    timezoneId: 'Europe/Paris',
    trace: 'retain-on-failure',
  },
  // Sous Linux, Chromium sans écran arrondit au pixel la chasse des caractères :
  // une ligne déborde là où macOS, Windows et le Chromium de bureau la tiennent
  // (fiche de PvZ Fusion : 906 px au lieu de 880 à 1 440 × 900, mesuré le
  // 15/10/2026 dans l’image Playwright). Sans ce réglage, la CI teste un rendu
  // que les visiteurs n’ont pas.
  projects: [
    {
      name: 'mobile-390',
      // Réponses du serveur et marquage identiques à toutes les largeurs : vérifiés une fois, à 1440 px.
      testIgnore: /(en-tetes|mesure|plan-de-marquage)\.spec\.ts$/,
      use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 }, launchOptions: { args: CHROMIUM_SANS_HINTING } },
    },
    { name: 'bureau-1440', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 }, launchOptions: { args: CHROMIUM_SANS_HINTING } } },
    { name: 'favicon-firefox', testMatch: 'favicons.spec.ts', use: { ...devices['Desktop Firefox'] } },
    { name: 'favicon-webkit', testMatch: 'favicons.spec.ts', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: [
    {
      // Le build enchaîne le vérificateur du site : un build rouge arrête les
      // tests avant leur premier navigateur.
      command: `${SKIP_BUILD ? '' : 'npm run build && '}node server/server.mjs`,
      url: `${SITE.url}/`,
      env: SITE.env,
      // Un build à froid en CI optimise plus de 1 000 images : près de 7 min.
      timeout: IS_CI ? 900_000 : 240_000,
      reuseExistingServer: false,
    },
    {
      // Même dist/, mesure active.
      command: 'node server/server.mjs',
      url: `${MESURE.url}/`,
      env: MESURE.env,
      timeout: 240_000,
      reuseExistingServer: false,
    },
  ],
});
