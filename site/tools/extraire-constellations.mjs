#!/usr/bin/env node
/**
 * Extraire la planche des 22 constellations de Bloodborne Legendary Run
 * (visuel BLR-F1, figure codée) depuis le catalogue du projet.
 *
 *   node tools/extraire-constellations.mjs /chemin/vers/Bloodborne-Legendary-Run
 *
 * Lit `back/src/BloodborneRun.Api/Features/Constellation/Source/constellation.json`
 * sans l’écrire, et produit `src/config/bloodborne-constellations.ts` : pour
 * chaque constellation, son nom, son nombre d’étoiles, ses proportions, ses
 * étoiles (un point chacune), ses traits (un par prérequis) et son étoile
 * d’entrée, en coordonnées réduites. Aucun code d’objectif ni texte du
 * catalogue n’est recopié, seulement la géométrie publique du ciel.
 *
 * Le script vérifie les deux faits consignés dans docs/prive/matiere-premiere.md :
 * 22 constellations et 1 289 objectifs uniques (étoiles et succès globaux).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const depot = process.argv[2];
if (!depot) {
  console.error('Indiquer le chemin du dépôt Bloodborne-Legendary-Run.');
  process.exit(2);
}

const SOURCE = 'back/src/BloodborneRun.Api/Features/Constellation/Source/constellation.json';
const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SORTIE = path.join(SITE, 'src/config/bloodborne-constellations.ts');
/** Plus grande dimension d’une silhouette, en unités du viewBox. */
const COTE = 200;

const catalogue = JSON.parse(readFileSync(path.join(depot, SOURCE), 'utf8'));
const galaxies = [...catalogue.galaxies].sort((a, b) => a.orderIndex - b.orderIndex);

const uniques = new Set();
for (const galaxie of galaxies) {
  for (const etoile of galaxie.stars) uniques.add(etoile.code);
  for (const globale of galaxie.globals ?? []) uniques.add(typeof globale === 'string' ? globale : globale.code);
}
if (galaxies.length !== 22) throw new Error(`22 constellations attendues, ${galaxies.length} trouvées.`);
if (uniques.size !== 1289) throw new Error(`1 289 objectifs uniques attendus, ${uniques.size} trouvés.`);

const arrondi = (n) => Math.round(n);

const constellations = galaxies.map((galaxie) => {
  const xs = galaxie.stars.map((e) => e.x);
  const ys = galaxie.stars.map((e) => e.y);
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const echelle = COTE / Math.max(maxX - minX, maxY - minY, 1);
  const largeur = Math.max(arrondi((maxX - minX) * echelle), 1);
  const hauteur = Math.max(arrondi((maxY - minY) * echelle), 1);
  const position = new Map(galaxie.stars.map((e) => [e.code, [arrondi((e.x - minX) * echelle), arrondi((e.y - minY) * echelle)]]));

  const traits = [];
  const cibles = new Set();
  for (const lien of galaxie.links ?? []) {
    const depart = position.get(lien.from);
    const arrivee = position.get(lien.to);
    if (!depart || !arrivee) continue;
    cibles.add(lien.to);
    traits.push(`M${depart[0]} ${depart[1]}L${arrivee[0]} ${arrivee[1]}`);
  }
  const entrees = galaxie.stars.filter((e) => !cibles.has(e.code)).map((e) => position.get(e.code));
  const points = galaxie.stars.map((e) => position.get(e.code)).map(([x, y]) => `M${x} ${y}h0`);

  return {
    nom: galaxie.label.replaceAll("'", '’'),
    etoiles: galaxie.stars.length,
    largeur,
    hauteur,
    traits: traits.join(''),
    points: points.join(''),
    entree: entrees.length === 1 ? `M${entrees[0][0]} ${entrees[0][1]}h0` : '',
  };
});

const date = new Date().toISOString().slice(0, 10);
const contenu = `/**
 * Planche des 22 constellations de Bloodborne Legendary Run (visuel BLR-F1).
 * Fichier GÉNÉRÉ par tools/extraire-constellations.mjs le ${date} depuis
 * \`${SOURCE}\` du dépôt du projet : ne pas le modifier à la main.
 *
 * Géométrie seule, réduite à ${COTE} unités sur le plus grand côté : un point
 * par étoile (\`points\`), un trait par prérequis (\`traits\`), l’étoile
 * d’entrée de l’arbre (\`entree\`). \`etoiles\` compte les étoiles posées dans
 * la constellation ; une étoile partagée entre plusieurs constellations ne
 * compte qu’une fois dans les ${uniques.size} objectifs uniques du catalogue.
 */
export interface Constellation {
  nom: string;
  etoiles: number;
  largeur: number;
  hauteur: number;
  traits: string;
  points: string;
  entree: string;
}

export const OBJECTIFS_UNIQUES = ${uniques.size};

export const CONSTELLATIONS: readonly Constellation[] = ${JSON.stringify(constellations, null, 2)};
`;
writeFileSync(SORTIE, contenu);
console.log(`${constellations.length} constellations, ${uniques.size} objectifs uniques → ${path.relative(SITE, SORTIE)}`);
