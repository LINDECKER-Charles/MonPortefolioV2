import { defineMiddleware } from 'astro:middleware';
import { chargerEmailContact, lireConfigBackend, lireEmailContact, remplacerEmailContact } from '../server/contact.mjs';

/** Même adresse dynamique en développement que dans le serveur de production. */
export const onRequest = defineMiddleware(async (_context, next) => {
  const response = await next();
  if (!import.meta.env.DEV || !response.headers.get('content-type')?.includes('text/html')) return response;
  const backend = lireConfigBackend({ ...process.env, BACKEND_URL: process.env.BACKEND_URL || 'http://127.0.0.1:8080' });
  let email = lireEmailContact(process.env);
  if (backend) {
    try { email = await chargerEmailContact(backend); } catch { /* Amorçage local avant démarrage du backend. */ }
  }
  if (!email) return response;
  const headers = new Headers(response.headers);
  headers.delete('content-length');
  return new Response(remplacerEmailContact(await response.text(), email), { status: response.status, headers });
});
