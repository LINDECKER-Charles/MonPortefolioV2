import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { decouper } from '../../tools/verifier-site.mjs';
import { CITATIONS } from '../../src/config/citations';
import { DELAI_BUILD, pagesConstruites } from './support/dist';

/**
 * Garde-fou « citations » : tout texte présenté comme une citation de Charles
 * dans le HTML construit (blockquote, q, élément marqué data-citation) est une
 * de ses phrases, mot pour mot, listée dans src/config/citations.ts — elle-même
 * recopiée depuis docs/questions.md et docs/brief.md.
 */

const RACINE = new URL('../../../', import.meta.url);
const lireDoc = (source: string): string => readFileSync(new URL(source, RACINE), 'utf8');

/** Le document tel qu’on le lit : marques de citation Markdown et retours à la ligne ôtés, rien d’autre modifié. */
const aplatirDoc = (texte: string): string => texte.replace(/^\s*>\s?/gm, '').replace(/\s+/g, ' ');

/** Forme comparable : mêmes apostrophes, espaces, casse et ponctuation de fin. */
function normaliser(texte: string): string {
  return texte
    .replace(/[«»]/g, ' ')
    .replace(/[  \s]+/g, ' ')
    .replace(/[’‘`]/g, '\'')
    .trim()
    .toLowerCase()
    .replace(/[\s.…!?;:,]+$/u, '')
    .replace(/^[\s.…!?;:,]+/u, '');
}

const AUTORISEES = CITATIONS.map((c) => normaliser(c.texte));

/** Vrai si le texte est une citation de la liste ou un extrait d’une d’elles, sur des mots entiers. */
function estAutorisee(texte: string): boolean {
  const cherche = normaliser(texte);
  if (!cherche) return false;
  const motif = new RegExp(`(?<![\\p{L}\\p{N}])${cherche.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\p{L}\\p{N}])`, 'u');
  return AUTORISEES.some((citation) => motif.test(citation));
}

/** Textes présentés comme citations dans un HTML. */
function citationsAffichees(html: string): string[] {
  const trouvees: string[] = [];
  const ouvertes: { nom: string; profondeur: number; texte: string[] }[] = [];
  const pile: string[] = [];
  const VIDES = /^(area|base|br|col|embed|hr|img|input|link|meta|source|track|wbr)$/;
  /** Attribution (« — Charles ») : lue comme légende, pas comme citation. */
  let legende = 0;
  for (const j of decouper(html)) {
    if (j.type === 'texte') {
      if (!j.brut && !legende) for (const o of ouvertes) o.texte.push(j.texte);
      continue;
    }
    if (j.type === 'ouvrante') {
      if (j.nom === 'br') for (const o of ouvertes) o.texte.push(' ');
      if (VIDES.test(j.nom)) continue;
      pile.push(j.nom);
      if (j.nom === 'cite' || j.nom === 'figcaption' || j.nom === 'footer') legende += 1;
      if (j.nom === 'blockquote' || j.nom === 'q' || j.attrs.has('data-citation')) {
        ouvertes.push({ nom: j.nom, profondeur: pile.length, texte: [] });
      }
      continue;
    }
    if (j.nom === 'cite' || j.nom === 'figcaption' || j.nom === 'footer') legende = Math.max(0, legende - 1);
    const dernier = ouvertes.at(-1);
    if (dernier && dernier.nom === j.nom && dernier.profondeur === pile.length) {
      trouvees.push(dernier.texte.join(' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim());
      ouvertes.pop();
    }
    const i = pile.lastIndexOf(j.nom);
    if (i >= 0) pile.length = i;
  }
  return trouvees.filter(Boolean);
}

/** Fautes d’un HTML : citations affichées qui ne sont pas de la liste. */
const fautesCitations = (html: string): string[] =>
  citationsAffichees(html).filter((t) => !estAutorisee(t)).map((t) => `citation hors liste : « ${t} »`);

describe('citations : la liste est fidèle à ses sources', () => {
  const sources = new Map(['docs/questions.md', 'docs/brief.md'].map((s) => [s, aplatirDoc(lireDoc(s))]));

  it.each(CITATIONS.map((c) => [c.texte, c] as const))('« %s » figure mot pour mot dans sa source', (_texte, citation) => {
    expect(sources.get(citation.source)).toContain(citation.texte);
  });

  it('ne contient pas de doublon et date chaque endroit', () => {
    const cles = CITATIONS.map((c) => `${c.source}|${c.texte}`);
    expect(new Set(cles).size).toBe(cles.length);
    for (const c of CITATIONS) expect(c.endroit.length).toBeGreaterThan(3);
  });

  it('ne reprend pas la phrase inventée du compagnon Bloodborne', () => {
    expect(estAutorisee('J’ai créé ce compagnon pour retrouver mes repères entre deux sessions.')).toBe(false);
    for (const c of CITATIONS) expect(c.texte).not.toMatch(/compagnon/i);
  });
});

describe('citations : le détecteur', () => {
  it('admet une citation entière ou un extrait sur des mots entiers, quels que soient apostrophes et casse', () => {
    expect(fautesCitations('<blockquote><p>«&nbsp;La seule chose qui a changé,<br />c’est le titre.&nbsp;»</p></blockquote>')).toEqual([]);
    expect(fautesCitations('<blockquote class="citation"><p>«&nbsp;J’ai recommencé jusqu’à réussir.&nbsp;»</p></blockquote>')).toEqual([]);
    expect(fautesCitations('<p data-citation>l’aventure humaine</p>')).toEqual([]);
  });

  it('refuse une phrase inventée dans un blockquote, un q ou un élément data-citation', () => {
    const inventee = 'J’ai créé ce compagnon pour retrouver mes repères entre deux sessions.';
    expect(fautesCitations(`<blockquote><p>«&nbsp;${inventee}&nbsp;»</p></blockquote>`).join()).toContain('compagnon');
    expect(fautesCitations(`<p>Il dit <q>${inventee}</q></p>`)).toHaveLength(1);
    expect(fautesCitations(`<div data-citation><p>${inventee}</p></div>`)).toHaveLength(1);
  });

  it('refuse un extrait qui coupe un mot ou une phrase qui déborde de la citation', () => {
    expect(fautesCitations('<blockquote>la seule chose qui a chang</blockquote>')).toHaveLength(1);
    expect(fautesCitations('<blockquote>La seule chose qui a changé, c’est le titre, et le reste aussi.</blockquote>')).toHaveLength(1);
  });

  it('lit une attribution comme légende et ignore les paragraphes qui ne sont pas des citations', () => {
    expect(fautesCitations('<figure><blockquote>La seule chose qui a changé, c’est le titre.</blockquote><figcaption>Charles</figcaption></figure>')).toEqual([]);
    expect(fautesCitations('<p>Une phrase quelconque, sans citation.</p>')).toEqual([]);
  });
});

describe('citations dans le HTML construit', () => {
  it('toutes les citations affichées sont des phrases de Charles', async () => {
    const pages = await pagesConstruites();
    const affichees = pages.flatMap(({ url, html }) => citationsAffichees(html).map((t) => ({ url, t })));
    expect(affichees.length, 'le site affiche au moins une citation').toBeGreaterThan(0);
    const fautes = pages.flatMap(({ url, html }) => fautesCitations(html).map((f) => `${url} : ${f}`));
    expect(fautes).toEqual([]);
  }, DELAI_BUILD);
});
