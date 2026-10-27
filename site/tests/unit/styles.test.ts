import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/**
 * Règle T13 du cahier (et B1) : aucune couleur ni taille de texte écrite en
 * dur hors de styles/jetons.css, dans les feuilles du site et les <style> des
 * composants et des pages. Les masques n’écrivent pas de noir (currentColor) ;
 * les captures et les logos tiers passent par des jetons (--capture-*,
 * --papier-logo).
 *
 * Exception assumée : les tailles des textes internes aux figures SVG, en
 * unités de leur viewBox (une coordonnée, pas une taille d’interface) : les
 * fichiers de FIGURES_SVG. Le backoffice entier (styles/backoffice.css,
 * styles/blog-editor.css, components/backoffice) suit la règle depuis sa
 * refonte « Lanterne », le 14 octobre 2026.
 *
 * Même règle pour le mouvement (M2) : une durée ou un délai d’animation et de
 * transition s’écrit avec --d-ui, --d-scene ou --d-recit (au besoin en
 * multiple : `calc(var(--d-scene) * 4)`), jamais en dur. Seuls `0s` et
 * `0.01ms` (mouvement réduit) restent littéraux, sans exception de fichier
 * depuis la migration des scènes, le 13 octobre 2026.
 */

const SRC = fileURLToPath(new URL('../../src/', import.meta.url));
const EXCLUS = new Set(['styles/jetons.css']);
const FIGURES_SVG = new Set([
  'components/accueil/FigureGwent.astro',
  'components/accueil/FigurePlafond.astro',
  'components/parcours/VisuelFormation.astro',
  'components/projets/GesteCollectif.astro',
  'components/projets/pvz/FigureEquipe.astro',
  'components/projets/pvz/FigureRattrapage.astro',
]);

const COULEUR = /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|oklch|lab|lch)\(|(?<![\w-])(?:white|black|red|blue|green|gr[ae]y|yellow|orange|purple)(?![\w-])/i;
/** Une durée littérale (hors 0s et 0.01ms) dans une déclaration d’animation ou de transition. */
const DUREE = /(?:animation|transition)(?:-duration|-delay)?\s*:[^;]*?(?<![\w.-])(?!0s\b|0\.01ms\b)\d*\.?\d+m?s\b/;
const TAILLE = /font-size\s*:(?!\s*(?:var\(|inherit|100%))|(?<![\w-])font\s*:[^;]*\d(?:px|rem|em|pt)\b/;

function fichiers(dossier: string): string[] {
  return readdirSync(dossier).flatMap((nom) => {
    const chemin = join(dossier, nom);
    if (statSync(chemin).isDirectory()) return fichiers(chemin);
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
    .map((chemin) => ({ chemin, nom: relative(SRC, chemin).replaceAll('\\', '/') }))
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

  it('n’écrit aucune durée d’animation ou de transition en dur hors des jetons (règle M2)', () => {
    const fautes = sources.flatMap(({ chemin, nom }) => lignesDeStyle(chemin).filter(({ texte }) => DUREE.test(texte)).map(({ ligne, texte }) => `${nom}:${ligne} ${texte.trim()}`));
    expect(fautes).toEqual([]);
  });

  it('reconnaît une durée écrite en dur, et laisse passer les jetons et le mouvement réduit', () => {
    for (const faute of ['animation: x 1.9s ease both;', 'transition: opacity 0.45s ease;', 'transition-delay: 1.45s;', 'animation-delay: calc(var(--rang) * 70ms);', 'animation: y 800ms linear infinite;']) expect(DUREE.test(faute), faute).toBe(true);
    for (const juste of ['animation: x var(--d-recit) var(--courbe) both;', 'transition: rotate var(--d-ui) var(--courbe);', 'animation: z calc(var(--d-scene) * 4) var(--courbe) both;', 'transition-duration: 0s !important;', 'animation-duration: 0.01ms !important;']) expect(DUREE.test(juste), juste).toBe(false);
  });
});
