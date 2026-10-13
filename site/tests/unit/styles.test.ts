import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Règle T13 du cahier (et B1) : aucune couleur ni taille de texte écrite en
 * dur hors de styles/jetons.css, dans les feuilles du site et les <style> des
 * composants et des pages. Les masques n’écrivent pas de noir (currentColor) ;
 * les captures et les logos tiers passent par des jetons (--capture-*,
 * --papier-logo).
 *
 * Exceptions assumées : le backoffice (hors refonte), et les tailles des
 * textes internes aux figures SVG, en unités de leur viewBox (une coordonnée,
 * pas une taille d’interface) : les fichiers de FIGURES_SVG.
 */

const SRC = new URL('../../src/', import.meta.url).pathname;
const EXCLUS = new Set(['styles/jetons.css', 'styles/backoffice.css', 'styles/blog-editor.css']);
const FIGURES_SVG = new Set([
  'components/accueil/FigureGwent.astro',
  'components/accueil/FigurePlafond.astro',
  'components/parcours/VisuelFormation.astro',
  'components/projets/GesteCollectif.astro',
  'components/projets/pvz/FigureEquipe.astro',
  'components/projets/pvz/FigureRattrapage.astro',
]);

const COULEUR = /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|oklch|lab|lch)\(|(?<![\w-])(?:white|black|red|blue|green|gr[ae]y|yellow|orange|purple)(?![\w-])/i;
const TAILLE = /font-size\s*:(?!\s*(?:var\(|inherit|100%))|(?<![\w-])font\s*:[^;]*\d(?:px|rem|em|pt)\b/;

function fichiers(dossier: string): string[] {
  return readdirSync(dossier).flatMap((nom) => {
    const chemin = join(dossier, nom);
    if (statSync(chemin).isDirectory()) return nom === 'backoffice' ? [] : fichiers(chemin);
    return /\.(css|astro)$/.test(nom) ? [chemin] : [];
  });
}

/** Les déclarations de style d’un fichier, ligne par ligne, sans les commentaires. */
function lignesDeStyle(chemin: string): { ligne: number; texte: string }[] {
  const source = readFileSync(chemin, 'utf8');
  const blocs = chemin.endsWith('.css') ? [{ debut: 0, css: source }] : [...source.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => ({ debut: source.slice(0, m.index).split('\n').length - 1, css: m[1] }));
  return blocs.flatMap(({ debut, css }) =>
    css
      .replace(/\/\*[\s\S]*?\*\//g, (commentaire) => commentaire.replace(/[^\n]/g, ' '))
      .split('\n')
      .map((texte, i) => ({ ligne: debut + i + 1, texte })),
  );
}

describe('styles du site (règle T13)', () => {
  const sources = fichiers(SRC)
    .map((chemin) => ({ chemin, nom: relative(SRC, chemin) }))
    .filter(({ nom }) => !EXCLUS.has(nom));

  it('trouve les feuilles et les composants à vérifier', () => {
    expect(sources.length).toBeGreaterThan(100);
  });

  it('n’écrit aucune couleur en dur hors des jetons', () => {
    const fautes = sources.flatMap(({ chemin, nom }) => lignesDeStyle(chemin).filter(({ texte }) => COULEUR.test(texte)).map(({ ligne, texte }) => `${nom}:${ligne} ${texte.trim()}`));
    expect(fautes).toEqual([]);
  });

  it('n’écrit aucune taille de texte en dur hors de l’échelle, sauf dans les figures SVG', () => {
    const fautes = sources
      .filter(({ nom }) => !FIGURES_SVG.has(nom))
      .flatMap(({ chemin, nom }) => lignesDeStyle(chemin).filter(({ texte }) => TAILLE.test(texte)).map(({ ligne, texte }) => `${nom}:${ligne} ${texte.trim()}`));
    expect(fautes).toEqual([]);
  });
});
