import { defineConfig, devices } from '@playwright/test';
import { IS_CI, MESURE, SITE, SKIP_BUILD } from './tests/e2e/support/serveurs.mjs';

/**
 * Tests de bout en bout : le build de production, servi par le serveur de
 * production (server/server.mjs), dans Chromium à deux largeurs. Pas
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
  projects: [
    {
      name: 'mobile-390',
      // Réponses du serveur et marquage identiques à toutes les largeurs : vérifiés une fois, à 1440 px.
      testIgnore: /(en-tetes|mesure|plan-de-marquage)\.spec\.ts$/,
      use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } },
    },
    { name: 'bureau-1440', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
  ],
  webServer: [
    {
      // Le build enchaîne le vérificateur du site : un build rouge arrête les
      // tests avant leur premier navigateur.
      command: `${SKIP_BUILD ? '' : 'npm run build && '}node server/server.mjs`,
      url: `${SITE.url}/`,
      env: SITE.env,
      timeout: 240_000,
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
