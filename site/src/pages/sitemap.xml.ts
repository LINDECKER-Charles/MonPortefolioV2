/**
 * Sitemap écrit à la main depuis `config/pages.ts` : une date de mise à jour
 * vraie pour chaque page — celle d'un contenu, jamais celle du build.
 */
import type { APIRoute } from 'astro';
import { PAGES_SITEMAP } from '../config/pages';
import { SITE } from '../config/site';

export const GET: APIRoute = () => {
  const urls = PAGES_SITEMAP.map(
    ({ chemin, maj }) => `  <url>\n    <loc>${SITE.url}${chemin === '/' ? '/' : chemin}</loc>\n    <lastmod>${maj}</lastmod>\n  </url>`,
  ).join('\n');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};
