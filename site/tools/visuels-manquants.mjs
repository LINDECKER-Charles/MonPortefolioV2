#!/usr/bin/env node
/**
 * Liste les visuels de l’inventaire (src/config/visuels.ts) dont le fichier
 * attendu n’existe pas encore, et contrôle ceux qui sont livrés.
 *
 *   npm run visuels                 les visuels « socle » manquants
 *   npm run visuels -- --tout       aussi les visuels « élargi »
 *   npm run visuels -- --resume     une seule ligne (c’est ce qu’affiche le build)
 *   npm run visuels -- --verifier   contrôle les fichiers livrés : dimensions
 *                                   du nom, ratio, alpha, poids, calques, pièces
 *                                   d’un SVG ; échoue au premier écart
 *   npm run visuels -- --strict     échoue s’il manque un visuel « socle » ou
 *                                   les calques d’une image livrée
 *
 * Pour l’instant le build n’échoue jamais sur un manque : `--strict` est la
 * porte de promotion en production, à brancher quand les visuels « socle »
 * existeront (cahier des charges, T7).
 *
 * Une figure codée (FIG) n’a pas d’image : elle est faite quand son composant,
 * nommé dans `fichier`, existe ; « à coder » tant qu’aucun ne l’est. Un
 * emplacement qui reprend le fichier d’un autre (`reprend`) n’est jamais compté
 * deux fois. Une image générée (IMG) n’est livrée qu’avec ses trois calques
 * (règle 6, tools/separer-calques.mjs).
 *
 * Node importe le registre TypeScript tel quel (syntaxe effaçable seulement) :
 * lancer avec `--disable-warning=ExperimentalWarning`, comme le fait npm.
 */
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CALQUES, fichiersAttendus, fichiersCalques, ORDRE_SERIES, plafondPoids, VISUELS } from '../src/config/visuels.ts';

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
  const calquesManquants = [];
  const livres = [];
  let reprises = 0;
  for (const visuel of visuels) {
    if (visuel.fichier === null && !visuel.declinaisons?.length && visuel.methode !== 'FIG' && visuel.reprend?.length) {
      reprises += 1; // son fichier est celui d’un autre emplacement, compté chez lui
      continue;
    }
    if (visuel.methode === 'FIG' && visuel.fichier === null) {
      figuresACoder.push(visuel);
      continue;
    }
    const attendus = fichiersAttendus(visuel);
    if (!attendus.length || !attendus.every(present)) {
      manquants.push(visuel);
      continue;
    }
    livres.push(visuel);
    const calques = fichiersCalques(visuel);
    if (calques && !CALQUES.every((c) => present(calques[c]))) calquesManquants.push(visuel);
  }
  const parPriorite = (liste, priorite) => liste.filter((v) => v.priorite === priorite);
  return {
    total: visuels.length,
    presents: livres.length,
    livres,
    reprises,
    manquants,
    manquantsSocle: parPriorite(manquants, 'socle'),
    manquantsElargi: parPriorite(manquants, 'elargi'),
    figuresACoder,
    figuresSocleACoder: parPriorite(figuresACoder, 'socle'),
    calquesManquants,
    fichiersAttendus,
  };
}

/** Dimensions annoncées par un nom `<ID>_<l>x<h>.<ext>` (ou `.<calque>.webp`), sinon `null`. */
export function dimensionsDuNom(fichier) {
  const m = /_(\d+)x(\d+)(?:\.[a-z]+)?\.(?:webp|png|jpe?g|avif)$/.exec(fichier);
  return m ? { largeur: Number(m[1]), hauteur: Number(m[2]) } : null;
}

const ratioDe = (ratio) => {
  const [a, b] = ratio.split(' / ').map(Number);
  return a / b;
};

/**
 * Contrôle des fichiers livrés : dimensions annoncées par le nom et par le
 * registre, ratio, transparence d’un fond transparent, poids d’une image
 * générée, calques, pièces et titre d’un SVG. Rend la liste des écarts.
 * @param {string} [racine]
 * @param {readonly import('../src/config/visuels.ts').EntreeVisuel[]} [visuels]
 */
export async function verifierLivres(racine = SITE, visuels = VISUELS) {
  const { default: sharp } = await import('sharp');
  const ecarts = [];
  const { livres } = etatDesVisuels(racine, visuels);
  for (const visuel of livres) {
    for (const fichier of fichiersAttendus(visuel)) {
      const chemin = path.join(racine, fichier);
      const dire = (message) => ecarts.push(`${visuel.id} · ${fichier} : ${message}`);
      if (fichier.endsWith('.svg')) {
        const svg = readFileSync(chemin, 'utf8');
        if (!/<title>[^<]+<\/title>/.test(svg)) dire('aucun <title>');
        if (/<text\b/.test(svg)) dire('contient un <text>');
        for (const piece of visuel.pieces ?? []) {
          if (!new RegExp(`\\bid="${piece}"|class="[^"]*\\b${piece}\\b`).test(svg)) dire(`pièce « ${piece} » absente`);
        }
        continue;
      }
      if (!/\.(?:webp|png|jpe?g|avif)$/.test(fichier) || visuel.methode === 'FIG') continue;
      const meta = await sharp(chemin).metadata();
      const nom = dimensionsDuNom(fichier);
      if (nom && (meta.width !== nom.largeur || meta.height !== nom.hauteur)) dire(`${meta.width} × ${meta.height} au lieu de ${nom.largeur} × ${nom.hauteur} (nom)`);
      if (visuel.largeur && visuel.hauteur && !visuel.declinaisons?.length && (meta.width !== visuel.largeur || meta.height !== visuel.hauteur)) dire(`${meta.width} × ${meta.height} au lieu de ${visuel.largeur} × ${visuel.hauteur} (registre)`);
      if (visuel.ratio && (visuel.methode === 'IMG' || visuel.methode === 'OG' || nom) && Math.abs(meta.width / meta.height / ratioDe(visuel.ratio) - 1) > 0.01) dire(`ratio ${meta.width} / ${meta.height} au lieu de ${visuel.ratio}`);
      if (visuel.methode !== 'IMG') continue;
      const plafond = plafondPoids(meta.width, meta.height);
      const verifierPoids = (f) => {
        const poids = statSync(path.join(racine, f)).size;
        if (poids > plafond) ecarts.push(`${visuel.id} · ${f} : ${Math.round(poids / 1024)} Ko, au-delà de ${plafond / 1024} Ko`);
      };
      verifierPoids(fichier);
      if (visuel.fond === 'transparent') {
        const { data, info } = await sharp(chemin).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
        const coins = [[0, 0], [info.width - 1, 0], [0, info.height - 1], [info.width - 1, info.height - 1]];
        const opaques = coins.filter(([x, y]) => data[(y * info.width + x) * info.channels + 3] > 16).length;
        if (!meta.hasAlpha || opaques === coins.length) dire('fond transparent attendu, coins opaques');
      }
      const calques = fichiersCalques(visuel);
      for (const calque of CALQUES) {
        const f = calques?.[calque];
        if (!f || !existsSync(path.join(racine, f))) {
          dire(`calque « ${calque} » absent (node tools/separer-calques.mjs ${visuel.id})`);
          continue;
        }
        const m = await sharp(path.join(racine, f)).metadata();
        if (m.width !== meta.width || m.height !== meta.height) ecarts.push(`${visuel.id} · ${f} : ${m.width} × ${m.height}, différent du rendu`);
        if (!m.hasAlpha) ecarts.push(`${visuel.id} · ${f} : calque sans alpha`);
        verifierPoids(f);
      }
    }
  }
  return ecarts;
}

/** Une ligne de la liste : identifiant, méthode, emplacement et fichier attendu. */
const ligne = (v) => `  ${v.id.padEnd(8)} ${v.methode.padEnd(3)}  ${v.page} · ${v.emplacement}\n           → ${fichiersAttendus(v).join(', ') || v.fichier}`;

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
  if (etat.calquesManquants.length) sortie.push(`\nImages livrées sans leurs calques (${etat.calquesManquants.length}) : ${etat.calquesManquants.map((v) => v.id).join(', ')} — lancer node tools/separer-calques.mjs <ID>`);
  return sortie.join('\n');
}

export function resume(etat) {
  const calques = etat.calquesManquants.length ? `, ${etat.calquesManquants.length} images sans calques` : '';
  return `[visuels] ${etat.manquantsSocle.length} visuels « socle » manquants, ${etat.manquantsElargi.length} « élargi », ${etat.figuresSocleACoder.length} figures « socle » à coder${calques} (liste : npm run visuels ; non bloquant pour l’instant).`;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const options = new Set(process.argv.slice(2));
  const etat = etatDesVisuels();
  console.log(options.has('--resume') ? resume(etat) : rapport(etat, { tout: options.has('--tout') }));
  if (options.has('--verifier')) {
    const ecarts = await verifierLivres();
    console.log(ecarts.length ? `\nÉcarts des fichiers livrés (${ecarts.length}) :\n${ecarts.map((e) => `  ${e}`).join('\n')}` : `\n[visuels] ${etat.presents} fichiers livrés conformes.`);
    if (ecarts.length) process.exitCode = 1;
  }
  if (options.has('--strict') && (etat.manquantsSocle.length || etat.calquesManquants.length)) process.exitCode = 1;
}
