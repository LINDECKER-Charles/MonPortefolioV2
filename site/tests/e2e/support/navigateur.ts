import type { Page } from '@playwright/test';
import { PAGES_SITEMAP } from '../../../src/config/pages';

/**
 * Relève ce qu'une page signale dans la console pendant le test : erreurs de
 * script, ressources introuvables, et violations de la CSP — Chromium les
 * écrit en erreurs de console, c'est le seul endroit où un script en ligne
 * bloqué en production se voit.
 */
export function surveillerConsole(page: Page): string[] {
  const problemes: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') problemes.push(`console : ${message.text()}`);
  });
  page.on('pageerror', (erreur) => problemes.push(`exception : ${erreur.message}`));
  return problemes;
}

/** La file de mesure de la page (sans traceur, les événements s'y accumulent). */
export function fileDeMesure(page: Page): Promise<[string, Record<string, unknown>?][]> {
  return page.evaluate(() => {
    const file = (window as unknown as { clFile?: unknown }).clFile;
    return Array.isArray(file) ? (file as [string, Record<string, unknown>?][]) : [];
  });
}

/**
 * Les pages du site, telles que le sitemap les liste : la même source que
 * `pages/sitemap.xml.ts` (`config/pages.ts`), donc jamais une liste de plus à
 * tenir à jour. Le vérificateur du build garantit que le sitemap est exact.
 */
export const PAGES: readonly string[] = PAGES_SITEMAP.map((page) => page.chemin);
