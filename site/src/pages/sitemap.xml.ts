/**
 * Sitemap écrit à la main : une date de mise à jour
 * vraie pour chacune — celle d'un contenu, jamais celle du build, qu'un moteur
 * finit par ignorer si elle change à chaque déploiement.
 */
import type { APIRoute } from 'astro';
import { SITE } from '../config/site';

const PAGES = [
  { chemin: '/', maj: '2026-10-08' },
  { chemin: '/projets', maj: '2026-10-08' },
  { chemin: '/projets/pvz-fusion', maj: '2026-10-08' },
  { chemin: '/projets/omnicard', maj: '2026-10-08' },
  { chemin: '/projets/gup', maj: '2026-10-08' },
  { chemin: '/projets/bloodborne-legendary-run', maj: '2026-10-08' },
  { chemin: '/parcours', maj: '2026-10-08' },
  { chemin: '/contact', maj: '2026-10-08' },
  { chemin: '/blog', maj: '2026-10-08' },
  { chemin: '/mentions-legales', maj: '2026-10-07' },
];

export const GET: APIRoute = () => {
  const urls = PAGES.map(
    ({ chemin, maj }) => `  <url>\n    <loc>${SITE.url}${chemin === '/' ? '/' : chemin}</loc>\n    <lastmod>${maj}</lastmod>\n  </url>`,
  ).join('\n');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};
