import { gzipSync } from 'node:zlib';
import { expect, test } from '@playwright/test';
import { choisirEntreeJjk } from './support/entree-jjk';

const BUDGET_JS = 15 * 1024;
/**
 * La mise en scène de l’entrée lanterne (scripts/backoffice-entree.ts et ses
 * modules), chargée à part sur les deux habits pour les champs communs : hors
 * du budget de la page, comme l’atelier du blog (AGENTS.md, « Entrée du
 * backoffice »). C’est la seule exemption.
 */
const HORS_BUDGET = /\/_astro\/backoffice-entree\.[\w-]+\.js$/;

test('l’entrée JJK puis le cinéma restent sous 15 Kio de JavaScript gzip réellement chargé', async ({ page }) => {
  await choisirEntreeJjk(page);
  const poids = new Map<string, number>();
  const lectures = new Map<string, Promise<void>>();
  const erreurs: string[] = [];

  // Inclure les imports différés et les scripts publics, une seule fois par URL.
  // Seule la mise en scène lanterne est exemptée (HORS_BUDGET).
  page.on('response', (reponse) => {
    const url = reponse.url();
    if (reponse.request().resourceType() !== 'script' && !/\.m?js$/.test(new URL(url).pathname)) return;
    if (HORS_BUDGET.test(new URL(url).pathname)) return;
    if (lectures.has(url)) return;
    lectures.set(url, reponse.body().then((corps) => {
      if (!reponse.ok()) throw new Error(`HTTP ${reponse.status()}`);
      poids.set(url, gzipSync(corps).length);
    }).catch((erreur: unknown) => {
      erreurs.push(`${url} : ${erreur instanceof Error ? erreur.message : String(erreur)}`);
    }));
  });

  async function verifierBudget(etape: string): Promise<void> {
    // L’événement response arrive aux en-têtes : attendre aussi tous les corps,
    // et les éventuelles réponses ajoutées pendant leur lecture.
    let nombre: number;
    do {
      nombre = lectures.size;
      await Promise.all(lectures.values());
    } while (lectures.size !== nombre);
    expect(erreurs, `${etape} : chaque script reçu doit pouvoir être mesuré`).toEqual([]);
    expect(poids.size, `${etape} : la mesure doit inclure des scripts`).toBeGreaterThan(0);
    const total = [...poids.values()].reduce((somme, octets) => somme + octets, 0);
    const detail = [...poids].map(([url, octets]) => `${new URL(url).pathname} : ${octets} octets`).join('\n');
    expect(total, `${etape} : ${total} octets gzip au total\n${detail}`).toBeLessThanOrEqual(BUDGET_JS);
  }

  await page.route('**/api/backoffice/**', (route) => route.fulfill({
    status: 401,
    contentType: 'application/json',
    body: JSON.stringify({ code: 'UNAUTHORIZED', message: 'Connexion nécessaire.' }),
  }));
  await page.goto('/backoffice');
  await expect(page.locator('[data-sanctuaire]')).toHaveAttribute('data-initialise', 'true');
  await expect(page.locator('#bo-login fieldset')).toBeEnabled();
  await verifierBudget('Connexion prête');

  await page.locator('[data-cinema-open]').last().click();
  await expect(page.locator('#bo-cinema[open]')).toBeVisible();
  await verifierBudget('Cinéma ouvert');
  const master = page.waitForResponse('**/audio/connexion-jjk.mp3');
  await page.locator('#bo-cinema-sound').click();
  await expect(page.locator('#bo-cinema-sound')).toHaveAttribute('aria-busy', 'false');
  await expect(page.locator('#bo-cinema-sound')).toHaveAttribute('aria-pressed', 'true');
  const fichier = await master;
  expect(fichier.headers()['content-type']).toBe('audio/mpeg');
  expect((await fichier.body()).byteLength).toBeLessThanOrEqual(450_000);
  await verifierBudget('Cinéma sonorisé');
});
