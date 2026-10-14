#!/usr/bin/env node
/**
 * Liste les visuels de l’inventaire (src/config/visuels.ts) dont le fichier
 * attendu n’existe pas encore, et contrôle ceux qui sont livrés.
 *
 *   npm run visuels                 les visuels « socle » manquants
 *   npm run visuels -- --tout       aussi les visuels « élargi »
 *   npm run visuels -- --resume     une seule ligne (c’est ce qu’affiche le build)
 *   npm run visuels -- --verifier   contrôle les fichiers livrés : dimensions
 *                                   du nom, ratio, alpha, poids, pièces d’un
 *                                   SVG ; pour une image générée, ses deux
 *                                   rendus et ses deux masters ; échoue sur
 *                                   tout écart
 *   npm run visuels -- --strict     échoue s’il manque un visuel « socle », ou
 *                                   le rendu de nuit d’une image « socle » (une
 *                                   nuit de repli est signalée, pas bloquante)
 *
 * Le build n’échoue jamais sur un manque : `--strict` est la porte de
 * promotion en production (cahier des charges, T7). Tous les visuels « socle »
 * existent depuis le 13 octobre 2026 ; la brancher reste à décider
 * (docs/a-confirmer.md, S1).
 *
 * Une figure codée (FIG) n’a pas d’image : elle est faite quand son composant,
 * nommé dans `fichier`, existe ; « à coder » tant qu’aucun ne l’est. Un
 * emplacement qui reprend le fichier d’un autre (`reprend`) n’est jamais compté
 * deux fois. Une image générée (IMG) a deux rendus, `<ID>_<l>x<h>.webp` (jour)
 * et `.nuit.webp`, tirés de ses deux masters `design/assets/visuels/<série>/
 * <ID>.png` et `<ID>.nuit.png` (règle 6, `npm run visuels:rendre <ID>`). Un
 * rendu de nuit sans master de nuit est une nuit de repli : signalée, à
 * remplacer.
 *
 * Node importe le registre TypeScript tel quel (syntaxe effaçable seulement) :
 * lancer avec `--disable-warning=ExperimentalWarning`, comme le fait npm.
 */
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fichierMaster, fichierMasterNuit, fichierNuit, fichiersAttendus, ORDRE_SERIES, plafondPoids, VISUELS } from '../src/config/visuels.ts';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/**
 * État du registre sur le disque.
 * @param {string} [racine] dossier `site/` ; chemins du registre relatifs à lui
 * @param {readonly import('../src/config/visuels.ts').EntreeVisuel[]} [visuels]
 * @param {string} [depot] racine du dépôt, où sont les masters des images générées
 */
export function etatDesVisuels(racine = SITE, visuels = VISUELS, depot = path.resolve(racine, '..')) {
  const present = (fichier) => existsSync(path.join(racine, fichier));
  const manquants = [];
  const figuresACoder = [];
  const nuitsManquantes = [];
  const nuitsDeRepli = [];
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
    const nuit = fichierNuit(visuel);
    if (!nuit) continue;
    if (!present(nuit)) nuitsManquantes.push(visuel);
    else if (!existsSync(path.join(depot, fichierMasterNuit(visuel)))) nuitsDeRepli.push(visuel);
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
    nuitsManquantes,
    nuitsSocleManquantes: parPriorite(nuitsManquantes, 'socle'),
    nuitsDeRepli,
    fichiersAttendus,
  };
}

/** Dimensions annoncées par un nom `<ID>_<l>x<h>.<ext>` (ou `.nuit.webp`), sinon `null`. */
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
 * registre, ratio, transparence d’un fond transparent, pièces et titre d’un
 * SVG ; pour une image générée, le poids et la présence de ses deux rendus et
 * de ses deux masters, au même cadrage. Rend la liste des écarts.
 * @param {string} [racine]
 * @param {readonly import('../src/config/visuels.ts').EntreeVisuel[]} [visuels]
 * @param {string} [depot] racine du dépôt, où sont les masters
 */
export async function verifierLivres(racine = SITE, visuels = VISUELS, depot = path.resolve(racine, '..')) {
  const { default: sharp } = await import('sharp');
  // Lus en mémoire : le cache de sharp garderait l’ancienne version d’un fichier réécrit.
  const image = (chemin) => sharp(readFileSync(chemin));
  const ecarts = [];
  const { livres } = etatDesVisuels(racine, visuels, depot);
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
      const meta = await image(chemin).metadata();
      const nom = dimensionsDuNom(fichier);
      if (nom && (meta.width !== nom.largeur || meta.height !== nom.hauteur)) dire(`${meta.width} × ${meta.height} au lieu de ${nom.largeur} × ${nom.hauteur} (nom)`);
      if (visuel.largeur && visuel.hauteur && !visuel.declinaisons?.length && (meta.width !== visuel.largeur || meta.height !== visuel.hauteur)) dire(`${meta.width} × ${meta.height} au lieu de ${visuel.largeur} × ${visuel.hauteur} (registre)`);
      if (visuel.ratio && (visuel.methode === 'IMG' || visuel.methode === 'OG' || nom) && Math.abs(meta.width / meta.height / ratioDe(visuel.ratio) - 1) > 0.01) dire(`ratio ${meta.width} / ${meta.height} au lieu de ${visuel.ratio}`);
      if (visuel.methode !== 'IMG') continue;
      const plafond = plafondPoids(meta.width, meta.height);
      /** Poids et fond d’un rendu : le jour, puis la nuit. */
      const verifierRendu = async (f, m) => {
        const poids = statSync(path.join(racine, f)).size;
        if (poids > plafond) ecarts.push(`${visuel.id} · ${f} : ${Math.round(poids / 1024)} Ko, au-delà de ${plafond / 1024} Ko`);
        if (visuel.fond !== 'transparent') return;
        const { data, info } = await image(path.join(racine, f)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
        const coins = [[0, 0], [info.width - 1, 0], [0, info.height - 1], [info.width - 1, info.height - 1]];
        const opaques = coins.filter(([x, y]) => data[(y * info.width + x) * info.channels + 3] > 16).length;
        if (!m.hasAlpha || opaques === coins.length) ecarts.push(`${visuel.id} · ${f} : fond transparent attendu, coins opaques`);
      };
      await verifierRendu(fichier, meta);
      const nuit = fichierNuit(visuel);
      if (!nuit) continue;
      const rendre = `npm run visuels:rendre ${visuel.id}`;
      if (!existsSync(path.join(racine, nuit))) dire(`rendu de nuit absent (${rendre})`);
      else {
        const m = await image(path.join(racine, nuit)).metadata();
        if (m.width !== meta.width || m.height !== meta.height) ecarts.push(`${visuel.id} · ${nuit} : ${m.width} × ${m.height}, différent du rendu de jour`);
        await verifierRendu(nuit, m);
      }
      const [master, masterNuit] = [fichierMaster(visuel), fichierMasterNuit(visuel)];
      const presents = [master, masterNuit].map((f) => existsSync(path.join(depot, f)));
      if (!presents[0]) dire(`master de jour absent (${master})`);
      if (!presents[1]) dire(`master de nuit absent (${masterNuit}) : le rendu de nuit est une nuit de repli`);
      if (presents[0] && presents[1]) {
        const [a, b] = await Promise.all([master, masterNuit].map((f) => image(path.join(depot, f)).metadata()));
        if (a.width !== b.width || a.height !== b.height) ecarts.push(`${visuel.id} · ${masterNuit} : ${b.width} × ${b.height}, master de jour en ${a.width} × ${a.height} (même cadrage au pixel près attendu)`);
      }
    }
  }
  return ecarts;
}

/** Une ligne de la liste : identifiant, méthode, emplacement et fichier attendu. */
const ligne = (v) => {
  const nuit = fichierNuit(v);
  const fichiers = nuit ? `${v.fichier} + ${path.posix.basename(nuit)}, depuis ${fichierMaster(v)} et ${path.posix.basename(fichierMasterNuit(v))}` : fichiersAttendus(v).join(', ') || v.fichier;
  return `  ${v.id.padEnd(8)} ${v.methode.padEnd(3)}  ${v.page} · ${v.emplacement}\n           → ${fichiers}`;
};

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
  if (etat.nuitsManquantes.length) sortie.push(`\nImages livrées sans rendu de nuit (${etat.nuitsManquantes.length}) : ${etat.nuitsManquantes.map((v) => v.id).join(', ')} — déposer le master de nuit, puis npm run visuels:rendre <ID>`);
  if (etat.nuitsDeRepli.length) sortie.push(`\nNuits de repli, master de nuit à livrer (${etat.nuitsDeRepli.length}) : ${etat.nuitsDeRepli.map((v) => `${v.id} (${fichierMasterNuit(v)})`).join(', ')} — puis npm run visuels:rendre <ID>`);
  return sortie.join('\n');
}

export function resume(etat) {
  const nuits = [
    etat.nuitsManquantes.length ? `${etat.nuitsManquantes.length} images sans rendu de nuit` : '',
    etat.nuitsDeRepli.length ? `${etat.nuitsDeRepli.length} nuits de repli` : '',
  ].filter(Boolean).map((t) => `, ${t}`).join('');
  return `[visuels] ${etat.manquantsSocle.length} visuels « socle » manquants, ${etat.manquantsElargi.length} « élargi », ${etat.figuresSocleACoder.length} figures « socle » à coder${nuits} (liste : npm run visuels ; non bloquant pour l’instant).`;
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
  if (options.has('--strict') && (etat.manquantsSocle.length || etat.nuitsSocleManquantes.length)) process.exitCode = 1;
}
