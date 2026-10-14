import { describe, expect, it } from 'vitest';
import { ROUTES_PROXY_DEV } from '../../src/lib/proxy-dev.mjs';

/**
 * Le proxy d’`astro dev` (src/lib/proxy-dev.mjs) : Vite compare l’adresse
 * complète, chaîne de requête comprise. Sans `(\?.*)?`, les listes filtrées
 * du backoffice tombaient en 404 sous astro dev.
 */
describe('routes relayées par le proxy de développement', () => {
  const relayee = (adresse: string) => new RegExp(ROUTES_PROXY_DEV).test(adresse);

  it('relaie les listes filtrées, avec leurs paramètres', () => {
    for (const adresse of [
      '/api/backoffice/contacts?status=all&limit=50',
      '/api/backoffice/blog/posts?status=draft',
      '/api/backoffice/blog/media?limit=24&offset=0',
      '/api/backoffice/tokens',
      '/api/backoffice/tokens/3',
      '/api/backoffice/storage',
      '/api/backoffice/blog/posts/12/preview',
      '/api/blog/posts/mon-article',
      '/api/blog/media/4',
      '/api/blog/media/4/640',
      '/api/backoffice/blog/media/4',
      '/api/backoffice/blog/media/4/1280',
      '/mcp',
    ]) expect(relayee(adresse), adresse).toBe(true);
  });

  it('ne relaie ni une route inconnue ni un préfixe trompeur', () => {
    for (const adresse of [
      '/api/backoffice/inconnu?x=1',
      '/api/backoffice/tokens/0',
      '/api/backoffice/storage/1',
      '/api/backoffice/storagex',
      '/mcpx',
      '/mcp/outils',
      '/backoffice',
      '/api/backoffice/blog/posts/12/supprimer',
      '/api/blog/media/4/0',
      '/api/blog/media/4/640/2',
    ]) expect(relayee(adresse), adresse).toBe(false);
  });
});
