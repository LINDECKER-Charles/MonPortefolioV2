import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/**
 * Contrastes des jetons (styles/jetons.css), calculés comme WCAG 2.x. Règle
 * B6 du cahier : deux surfaces voisines se distinguent par un écart d’au
 * moins 1,15:1 ou par un filet d’au moins 3:1 ; le texte d’un acte reste à
 * 4,5:1 au moins. Les valeurs sont lues dans le fichier de jetons : changer
 * une couleur sans tenir ces paires fait échouer le test.
 */

const JETONS = readFileSync(new URL('../../src/styles/jetons.css', import.meta.url), 'utf8');

/** Le premier bloc de règles dont le sélecteur commence par `debut`. */
function bloc(debut: string): string {
  const depart = JETONS.indexOf(debut);
  if (depart < 0) throw new Error(`Bloc introuvable : ${debut}`);
  const ouverture = JETONS.indexOf('{', depart);
  return JETONS.slice(ouverture + 1, JETONS.indexOf('\n}', ouverture));
}

function jeton(source: string, nom: string): string {
  const valeur = new RegExp(`--${nom}:\\s*(#[0-9a-f]{6})\\b`, 'i').exec(source)?.[1];
  if (!valeur) throw new Error(`Jeton --${nom} absent ou pas en hexadécimal`);
  return valeur;
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contraste(a: string, b: string): number {
  const [clair, sombre] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (clair + 0.05) / (sombre + 0.05);
}

const jour = bloc(':root {');
const nuit = bloc(":root[data-theme='nuit'],");

describe('la connexion JJK', () => {
  it('garde les libellés, les erreurs et le bouton principal au contraste AA', () => {
    for (const fond of ['jjk-encre', 'jjk-surface']) {
      for (const texte of ['jjk-papier', 'jjk-muet', 'jjk-or', 'jjk-cyan', 'jjk-rouge-clair']) {
        expect(contraste(jeton(jour, texte), jeton(jour, fond)), `${texte} sur ${fond}`).toBeGreaterThanOrEqual(4.5);
      }
    }
    expect(contraste(jeton(jour, 'jjk-papier'), jeton(jour, 'jjk-rouge'))).toBeGreaterThanOrEqual(4.5);
    expect(contraste(jeton(jour, 'jjk-trait'), jeton(jour, 'jjk-surface'))).toBeGreaterThanOrEqual(3);
  });
});

describe('l’acte de veille, la nuit (règle B6)', () => {
  const suie = jeton(nuit, 'fond');
  const veille = jeton(jour, 'veille-nuit');
  const trait = jeton(nuit, 'trait');

  it('se détache de la page : un écart de surface, ou un filet porteur d’au moins 3:1', () => {
    expect(contraste(veille, suie)).toBeGreaterThan(1.1);
    expect(contraste(veille, suie) >= 1.15 || contraste(trait, suie) >= 3).toBe(true);
    expect(contraste(trait, suie)).toBeGreaterThanOrEqual(3);
    expect(contraste(trait, veille)).toBeGreaterThanOrEqual(3);
  });

  it('garde son texte, ses liens et son bouton lisibles', () => {
    for (const nom of ['encre', 'eteint', 'accent']) expect(contraste(jeton(nuit, nom), veille), nom).toBeGreaterThanOrEqual(4.5);
    expect(contraste(jeton(jour, 'lanterne'), veille), 'lanterne').toBeGreaterThanOrEqual(3);
  });
});

describe('l’acte de veille, le jour', () => {
  it('porte le texte de la nuit à 4,5:1 au moins et tranche sur la pierre', () => {
    const veille = jeton(jour, 'veille');
    for (const nom of ['encre', 'eteint', 'accent']) expect(contraste(jeton(nuit, nom), veille), nom).toBeGreaterThanOrEqual(4.5);
    expect(contraste(veille, jeton(jour, 'fond'))).toBeGreaterThanOrEqual(3);
  });
});

describe('les erreurs de saisie (--erreur)', () => {
  it('se lisent à 4,5:1 au moins sur le fond et la surface, le jour comme la nuit', () => {
    for (const [nom, theme] of [['jour', jour], ['nuit', nuit]] as const) {
      for (const fond of ['fond', 'surface']) expect(contraste(jeton(theme, 'erreur'), jeton(theme, fond)), `${nom}, ${fond}`).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe('l’acte teinté et l’acte bleu, la nuit (règle B6)', () => {
  const suie = jeton(nuit, 'fond');
  const bleu = bloc('/* Acte bleu nuit');

  it('restent proches de la suie : le filet porteur qui les cerne (global.css) tient 3:1', () => {
    expect(contraste(jeton(nuit, 'acte'), suie)).toBeLessThan(1.15);
    expect(contraste(jeton(nuit, 'trait'), suie)).toBeGreaterThanOrEqual(3);
    expect(contraste(jeton(bleu, 'trait'), suie)).toBeGreaterThanOrEqual(3);
  });
});

/** Une couleur `rgb(r g b / a)` posée sur un fond opaque, comme la page la compose. */
function composer(dessus: string, dessous: string): string {
  const [r, g, b, a] = /rgb\((\d+) (\d+) (\d+) \/ ([\d.]+)\)/.exec(dessus)?.slice(1).map(Number) ?? [];
  if (a === undefined) throw new Error(`Couleur translucide illisible : ${dessus}`);
  const fond = [1, 3, 5].map((i) => parseInt(dessous.slice(i, i + 2), 16));
  return `#${[r, g, b].map((c, i) => Math.round(a * c + (1 - a) * fond[i]).toString(16).padStart(2, '0')).join('')}`;
}

function translucide(source: string, nom: string): string {
  const valeur = new RegExp(`--${nom}:\\s*(rgb\\([^)]+\\))`).exec(source)?.[1];
  if (!valeur) throw new Error(`Jeton --${nom} absent ou pas en rgb()`);
  return valeur;
}

describe('le texte éteint sous la lumière d’un foyer (.foyer, --lumiere)', () => {
  it('garde 4,5:1 au centre du halo, à pleine opacité, sur le fond et la surface, le jour comme la nuit', () => {
    for (const [nom, theme] of [['jour', jour], ['nuit', nuit]] as const) {
      for (const fond of ['fond', 'surface']) {
        const compose = composer(translucide(theme, 'lumiere'), jeton(theme, fond));
        expect(contraste(jeton(theme, 'eteint'), compose), `${nom}, ${fond} + lumière (${compose})`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it('vaut aussi pour le repli sans JavaScript (préférence du système)', () => {
    const repli = bloc('  :root:not([data-theme]) {');
    expect(jeton(repli, 'eteint')).toBe(jeton(nuit, 'eteint'));
  });
});
