import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { assurerDist } from '../../../tools/assurer-dist.mjs';
import { analyser, decoder } from '../../../tools/verifier-site.mjs';

/**
 * Délai d’un test qui peut déclencher un build complet : quelques dizaines de
 * secondes sur un poste au cache d’Astro chaud, près de 7 min à froid en CI
 * (plus de 1 000 images optimisées, mesuré le 15/10/2026).
 */
export const DELAI_BUILD = process.env.CI ? 900_000 : 240_000;

export interface PageConstruite {
  /** Adresse publique : `/`, `/blog`, `/404`… */
  url: string;
  /** HTML tel que construit. */
  html: string;
  /** Lecture structurée (voir tools/verifier-site.mjs). */
  page: ReturnType<typeof analyser>;
}

/**
 * Toutes les pages HTML du vrai `dist/`, reconstruit au besoin (voir
 * tools/assurer-dist.mjs). Le résultat est mis en cache pour la durée du
 * processus de test.
 */
let cache: Promise<PageConstruite[]> | undefined;
export function pagesConstruites(): Promise<PageConstruite[]> {
  cache ??= (async () => {
    const dist = await assurerDist();
    const fichiers = (await readdir(dist, { recursive: true })).map((f) => String(f).split(path.sep).join('/'));
    const pages: PageConstruite[] = [];
    for (const f of fichiers.filter((x) => x.endsWith('.html')).sort()) {
      const html = await readFile(path.join(dist, f), 'utf8');
      const url = f === 'index.html' ? '/' : f === '404.html' ? '/404' : `/${f.replace(/\/index\.html$/, '')}`;
      pages.push({ url, html, page: analyser(html) });
    }
    return pages;
  })();
  return cache;
}

/** Texte brut d’un morceau de HTML : balises retirées, entités décodées, espaces normalisés. */
export function texteDe(html: string): string {
  return decoder(html.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
}
