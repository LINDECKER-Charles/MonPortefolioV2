#!/usr/bin/env node
/**
 * Liste les visuels de l’inventaire (src/config/visuels.ts) dont le fichier
 * attendu n’existe pas encore.
 *
 *   npm run visuels                 les visuels « socle » manquants
 *   npm run visuels -- --tout       aussi les visuels « élargi »
 *   npm run visuels -- --resume     une seule ligne (c’est ce qu’affiche le build)
 *   npm run visuels -- --strict     échoue s’il manque un visuel « socle »
 *
 * Pour l’instant la liste n’échoue jamais (le build non plus) : `--strict` est
 * la porte de promotion en production, à brancher quand les visuels « socle »
 * existeront (cahier des charges, T7).
 *
 * Une figure codée (FIG) n’a pas d’image : elle est « à coder » tant qu’aucun
 * composant n’est nommé dans le registre. Un emplacement qui reprend le fichier
 * d’un autre (`reprend`) n’est jamais compté deux fois.
 *
 * Node importe le registre TypeScript tel quel (syntaxe effaçable seulement) :
 * lancer avec `--disable-warning=ExperimentalWarning`, comme le fait npm.
 */
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fichiersAttendus, ORDRE_SERIES, VISUELS } from '../src/config/visuels.ts';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/**
 * État du registre sur le disque.
 * @param {string} [racine] dossier `site/` ; chemins du registre relatifs à lui
 * @param {readonly import('../src/config/visuels.ts').EntreeVisuel[]} [visuels]
 */
export function etatDesVisuels(racine = SITE, visuels = VISUELS) {
  const present = (fichier) => existsSync(path.join(racine, fichier));
  const manquants = [];
  const figuresACoder = [];
  let presents = 0;
  let reprises = 0;
  for (const visuel of visuels) {
    if (visuel.fichier === null && visuel.methode !== 'FIG' && visuel.reprend?.length) {
      reprises += 1; // son fichier est celui d’un autre emplacement, compté chez lui
      continue;
    }
    if (visuel.methode === 'FIG' && visuel.fichier === null) {
      figuresACoder.push(visuel);
      continue;
    }
    if (visuel.fichier && present(visuel.fichier)) presents += 1;
    else manquants.push(visuel);
  }
  const parPriorite = (liste, priorite) => liste.filter((v) => v.priorite === priorite);
  return {
    total: visuels.length,
    presents,
    reprises,
    manquants,
    manquantsSocle: parPriorite(manquants, 'socle'),
    manquantsElargi: parPriorite(manquants, 'elargi'),
    figuresACoder,
    figuresSocleACoder: parPriorite(figuresACoder, 'socle'),
    fichiersAttendus,
  };
}

/** Une ligne de la liste : identifiant, méthode, emplacement et fichier attendu. */
const ligne = (v) => `  ${v.id.padEnd(8)} ${v.methode.padEnd(3)}  ${v.page} · ${v.emplacement}\n           → ${v.fichier}`;

function groupes(liste) {
  return ORDRE_SERIES.map((serie) => [serie, liste.filter((v) => v.serie === serie)]).filter(([, l]) => l.length);
}

export function rapport(etat, { tout = false } = {}) {
  const sortie = [];
  const aFaire = tout ? etat.manquants : etat.manquantsSocle;
  const quoi = tout ? 'manquants' : '« socle » manquants';
  sortie.push(`[visuels] ${etat.total} emplacements : ${etat.presents} présents, ${etat.manquants.length} manquants (${etat.manquantsSocle.length} socle, ${etat.manquantsElargi.length} élargi), ${etat.figuresACoder.length} figures à coder, ${etat.reprises} reprises d’un autre fichier.`);
  sortie.push(`\nVisuels ${quoi} (${aFaire.length}) :`);
  for (const [serie, liste] of groupes(aFaire)) {
    sortie.push(`\n ${serie}`);
    for (const v of liste) sortie.push(ligne(v));
  }
  const figures = tout ? etat.figuresACoder : etat.figuresSocleACoder;
  if (figures.length) sortie.push(`\nFigures ${tout ? '' : '« socle » '}à coder (${figures.length}) : ${figures.map((f) => f.id).join(', ')}`);
  return sortie.join('\n');
}

export function resume(etat) {
  return `[visuels] ${etat.manquantsSocle.length} visuels « socle » manquants, ${etat.manquantsElargi.length} « élargi », ${etat.figuresSocleACoder.length} figures « socle » à coder (liste : npm run visuels ; non bloquant pour l’instant).`;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const options = new Set(process.argv.slice(2));
  const etat = etatDesVisuels();
  console.log(options.has('--resume') ? resume(etat) : rapport(etat, { tout: options.has('--tout') }));
  if (options.has('--strict') && etat.manquantsSocle.length) process.exit(1);
}
