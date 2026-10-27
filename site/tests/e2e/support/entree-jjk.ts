import type { Page } from '@playwright/test';

/**
 * L’entrée Jujutsu Kaisen, choisie comme par son bouton discret : le choix
 * mémorisé (« cl-backoffice-jjk »), que public/backoffice-entree.js repose
 * avant le premier rendu. Sans lui, la connexion est celle de la lanterne.
 */
export async function choisirEntreeJjk(page: Page): Promise<void> {
  await page.addInitScript(() => {
    try { localStorage.setItem('cl-backoffice-jjk', '1'); } catch { /* Stockage bloqué : la lanterne reste. */ }
  });
}
