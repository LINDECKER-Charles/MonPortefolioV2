import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { assurerDist } from '../../tools/assurer-dist.mjs';
import { PAGES_SITEMAP } from '../../src/config/pages';
import { SITE } from '../../src/config/site';
import { DELAI_BUILD } from './support/dist';

/**
 * La liste des pages des tests de bout en bout vient de config/pages.ts, la
 * source du sitemap : ce test vérifie que le sitemap construit la reprend
 * exactement, donc qu’aucune page n’échappe aux tests.
 */
describe('pages du site', () => {
  it('le sitemap construit liste exactement les pages de config/pages.ts', async () => {
    const dist = await assurerDist();
    const xml = await readFile(path.join(dist, 'sitemap.xml'), 'utf8');
    const cites = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(cites).toEqual(PAGES_SITEMAP.map(({ chemin }) => `${SITE.url}${chemin}`));
  }, DELAI_BUILD);

  it('ne liste aucune page deux fois, avec une date de contenu', () => {
    const chemins = PAGES_SITEMAP.map((p) => p.chemin);
    expect(new Set(chemins).size).toBe(chemins.length);
    for (const { maj } of PAGES_SITEMAP) expect(maj).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
