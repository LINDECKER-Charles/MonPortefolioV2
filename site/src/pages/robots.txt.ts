/**
 * Tout est ouvert à tous les robots. L'environnement de test, qui sert les
 * mêmes fichiers, est tenu hors index par l'en-tête `X-Robots-Tag: noindex` de
 * l'edge : un robots.txt par environnement ne peut pas venir d'un build unique.
 */
import type { APIRoute } from 'astro';
import { SITE } from '../config/site';

export const GET: APIRoute = () =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: ${SITE.url}/sitemap.xml\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
