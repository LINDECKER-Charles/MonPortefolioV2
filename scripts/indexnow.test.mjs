/**
 * Le choix des adresses signalées à IndexNow et le corps de l’appel, sans
 * réseau. Lancement : node --test scripts/indexnow.test.mjs
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { aSignaler, CLE, corps, lireReponse, lireSitemap, SITE } from './indexnow.mjs';

const SITEMAP = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://charles-lindecker.com/</loc>
    <lastmod>2026-10-16</lastmod>
  </url>
  <url>
    <loc>https://charles-lindecker.com/contact</loc>
    <lastmod>2026-10-13</lastmod>
  </url>
<url><loc>https://charles-lindecker.com/blog/un-article</loc><lastmod>2026-10-17T08:30:00.000Z</lastmod></url>
</urlset>
`;

test('lit les adresses et les dates du sitemap, pages et articles', () => {
  assert.deepEqual(lireSitemap(SITEMAP), [
    { url: 'https://charles-lindecker.com/', lastmod: '2026-10-16' },
    { url: 'https://charles-lindecker.com/contact', lastmod: '2026-10-13' },
    { url: 'https://charles-lindecker.com/blog/un-article', lastmod: '2026-10-17T08:30:00.000Z' },
  ]);
});

test('signale ce qui date du jour donné ou après, tout sans date', () => {
  const entrees = lireSitemap(SITEMAP);
  assert.deepEqual(aSignaler(entrees, '2026-10-16T10:21:41+02:00'), ['https://charles-lindecker.com/', 'https://charles-lindecker.com/blog/un-article']);
  assert.deepEqual(aSignaler(entrees, '2026-10-18'), []);
  assert.equal(aSignaler(entrees, '').length, 3);
  // La passe de nuit ne relit que les articles du blog.
  assert.deepEqual(aSignaler(entrees, '2026-10-16', { blog: true }), ['https://charles-lindecker.com/blog/un-article']);
});

test('n’envoie que les adresses du site, avec la clé et son fichier', () => {
  assert.deepEqual(corps(['https://charles-lindecker.com/', 'https://exemple.org/', 'https://charles-lindecker.com.exemple.org/x']), {
    host: 'charles-lindecker.com',
    key: CLE,
    keyLocation: `https://charles-lindecker.com/${CLE}.txt`,
    urlList: ['https://charles-lindecker.com/'],
  });
});

test('publie la clé dans site/public, seule dans son fichier', () => {
  assert.match(CLE, /^[0-9a-f]{32}$/);
  assert.equal(readFileSync(new URL(`../site/public/${CLE}.txt`, import.meta.url), 'utf8').trim(), CLE);
  assert.equal(SITE, 'https://charles-lindecker.com');
});

test('dit ce que veut dire la réponse d’IndexNow', () => {
  assert.equal(lireReponse(200).ok, true);
  assert.equal(lireReponse(202).ok, true);
  for (const statut of [400, 403, 422, 429, 500]) assert.equal(lireReponse(statut).ok, false, String(statut));
  assert.match(lireReponse(403).sens, /clé/);
});
