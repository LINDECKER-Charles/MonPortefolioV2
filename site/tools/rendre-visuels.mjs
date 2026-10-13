#!/usr/bin/env node
/**
 * Rend les masters d’une image générée aux couleurs du site, en jour et en
 * nuit (règle 6 de la commande, docs/visuels-a-generer.md).
 *
 *   npm run visuels:rendre ACC-03 [PVZ-05 …]   les images nommées
 *   npm run visuels:rendre -- --tout           toutes celles dont le master de jour est déposé
 *
 * Une image générée a deux masters PNG en trois couleurs de clé (encre
 * #000000, aplat #FFFFFF, lumière #FF0000), dessinés au même cadrage au pixel
 * près, sur fond transparent ou rempli selon la fiche :
 *
 *   design/assets/visuels/<série>/<ID>.png        le jour
 *   design/assets/visuels/<série>/<ID>.nuit.png   la nuit, faite en édition depuis le jour
 *
 * Le script contrôle le ratio de la fiche (à 1 % près) et que les deux masters
 * ont les mêmes dimensions, les met aux dimensions du registre puis écrit, à
 * côté du fichier attendu (`src/assets/visuels/<série>/`) :
 *
 *   <ID>_<l>x<h>.webp        le rendu de jour : aplat → --surface, encre → --encre,
 *                            lumière → --lanterne, du thème clair
 *   <ID>_<l>x<h>.nuit.webp   le rendu de nuit, depuis le master de nuit : noir →
 *                            --fond, blanc → --encre, rouge → --lanterne, du thème nuit
 *
 * Sans master de nuit, il écrit une nuit de repli « clair de lune » depuis le
 * master de jour, sans inversion (aplat → --papier-lune, encre → --fond de
 * nuit, lumière → --lanterne), et le signale : ce n’est pas une livraison.
 *
 * Les couleurs sont lues dans src/styles/jetons.css (`RENDUS` du registre dit
 * quel jeton remplace quelle clé), jamais recopiées. Chaque pixel se décompose
 * en parts des trois clés : blanc = min(V, B), rouge = R − blanc, noir = le
 * reste ; le trait antialiasé d’un générateur garde ses bords doux, et l’alpha
 * du master est conservé, débarrassé de son bruit (un sujet à 253 sur 255
 * devient opaque, un voile à 3 transparent). WebP qualité 82 ; si un rendu dépasse le plafond de
 * poids du registre (`PLAFONDS_POIDS`), la qualité de ce seul rendu descend
 * par pas de 2 jusqu’à tenir, et le script le signale. Un rendu qui ne tient
 * pas même à la qualité plancher fait échouer le script.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { CLES, fichierMaster, fichierMasterNuit, fichierNuit, plafondPoids, RENDUS, visuelParId, VISUELS } from '../src/config/visuels.ts';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEPOT = path.resolve(SITE, '..');
export const JETONS = path.join(SITE, 'src/styles/jetons.css');

/** Qualité WebP des rendus, et la plus basse qu’on s’autorise pour tenir un plafond de poids. */
export const QUALITE = 82;
export const QUALITE_PLANCHER = 50;

const hexVersRvb = (hex) => {
  const h = hex.length === 4 ? hex.replace(/[0-9a-f]/gi, (c) => c + c) : hex;
  return [1, 3, 5].map((i) => Number.parseInt(h.slice(i, i + 2), 16));
};

/** Les déclarations `--nom: valeur;` d’un bloc CSS, sans les commentaires. */
const declarations = (bloc) => Object.fromEntries([...bloc.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map(([, nom, valeur]) => [nom, valeur.trim()]));

/** Le corps du premier bloc dont le sélecteur vérifie `test`. */
function bloc(css, test) {
  for (const m of css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (test(m[1].trim())) return m[2];
  }
  throw new Error('jetons.css : bloc introuvable');
}

/**
 * Les jetons de jetons.css, par thème : le jour est le bloc `:root`, la nuit
 * le bloc `:root[data-theme='nuit']` posé par-dessus.
 * @param {string} css
 * @returns {{ jour: Record<string, string>, nuit: Record<string, string> }}
 */
export function lireJetons(css) {
  const jour = declarations(bloc(css, (s) => s === ':root'));
  const nuit = { ...jour, ...declarations(bloc(css, (s) => s.split(',').map((x) => x.trim()).includes(":root[data-theme='nuit']"))) };
  return { jour, nuit };
}

/**
 * Les couleurs RVB d’un rendu (`RENDUS`), une par clé, lues dans les jetons.
 * @param {{ jour: Record<string, string>, nuit: Record<string, string> }} jetons
 * @param {'jour' | 'nuit' | 'repli'} rendu
 * @returns {Record<'encre' | 'aplat' | 'lumiere', number[]>}
 */
export function couleursDuRendu(jetons, rendu) {
  const { theme, jetons: noms } = RENDUS[rendu];
  return /** @type {Record<'encre' | 'aplat' | 'lumiere', number[]>} */ (Object.fromEntries(
    CLES.map((cle) => {
      const valeur = jetons[theme][noms[cle]];
      if (!valeur || !/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(valeur)) throw new Error(`jetons.css : ${noms[cle]} (${theme}) absent ou pas en hexadécimal`);
      return [cle, hexVersRvb(valeur)];
    }),
  ));
}

/**
 * Parts d’encre, d’aplat et de lumière de chaque pixel d’une image RVBA :
 * trois nombres de 0 à 255 dont la somme vaut 255, indépendants de l’alpha.
 * @param {Uint8Array} rgba pixels bruts, quatre octets chacun
 * @returns {{ encre: Uint8Array, aplat: Uint8Array, lumiere: Uint8Array }}
 */
export function decomposer(rgba) {
  const n = rgba.length / 4;
  const parts = { encre: new Uint8Array(n), aplat: new Uint8Array(n), lumiere: new Uint8Array(n) };
  for (let i = 0; i < n; i++) {
    const blanc = Math.min(rgba[i * 4 + 1], rgba[i * 4 + 2]);
    const rouge = Math.max(0, rgba[i * 4] - blanc);
    parts.aplat[i] = blanc;
    parts.lumiere[i] = rouge;
    parts.encre[i] = 255 - blanc - rouge;
  }
  return parts;
}

/**
 * Seuils du bruit d’alpha d’un générateur : un sujet « opaque » y sort à 252
 * ou 253 sur 255, et un voile invisible de 1 à 5 traîne autour. Au-delà du
 * seuil haut, le pixel est opaque ; en deçà du seuil bas, transparent. Les
 * bords antialiasés, entre les deux, gardent leur alpha.
 */
export const ALPHA_OPAQUE = 248;
export const ALPHA_TRANSPARENT = 6;

/** L’alpha d’un pixel de master, débarrassé du bruit du générateur. */
export const nettoyerAlpha = (a) => (a >= ALPHA_OPAQUE ? 255 : a <= ALPHA_TRANSPARENT ? 0 : a);

/**
 * Recolore une image RVBA en couleurs de clé : chaque pixel prend le mélange
 * des couleurs du rendu dans ses parts de clés, et garde son alpha
 * (`nettoyerAlpha`).
 * @param {Uint8Array} rgba
 * @param {Record<'encre' | 'aplat' | 'lumiere', number[]>} couleurs
 */
export function recolorer(rgba, couleurs) {
  const parts = decomposer(rgba);
  const sortie = Buffer.alloc(rgba.length);
  for (let i = 0; i < parts.encre.length; i++) {
    for (let c = 0; c < 3; c++) {
      sortie[i * 4 + c] = Math.round((parts.encre[i] * couleurs.encre[c] + parts.aplat[i] * couleurs.aplat[c] + parts.lumiere[i] * couleurs.lumiere[c]) / 255);
    }
    sortie[i * 4 + 3] = nettoyerAlpha(rgba[i * 4 + 3]);
  }
  return sortie;
}

/**
 * Rend les deux versions d’une image du registre. Rend les fichiers écrits et
 * leurs poids, et `repli` quand la nuit vient du master de jour faute de
 * master de nuit ; échoue si le master de jour manque, s’il n’a pas le ratio
 * de la fiche, ou si le master de nuit n’a pas ses dimensions.
 * @param {string} id
 * @param {{ depot?: string, site?: string, jetons?: string }} [racines]
 */
export async function rendre(id, { depot = DEPOT, site = SITE, jetons = JETONS } = {}) {
  const visuel = visuelParId(id);
  if (!visuel) throw new Error(`${id} : identifiant absent du registre`);
  const master = fichierMaster(visuel);
  const masterNuit = fichierMasterNuit(visuel);
  const nuit = fichierNuit(visuel);
  if (!master || !masterNuit || !nuit || !visuel.fichier || !visuel.largeur || !visuel.hauteur) throw new Error(`${id} : pas une image générée à fichier propre (${visuel.methode})`);
  const source = path.join(depot, master);
  if (!existsSync(source)) throw new Error(`${id} : master de jour absent (${master})`);
  // Lus en mémoire : le cache de sharp garderait l’ancienne version d’un fichier réécrit.
  const lireMaster = (fichier) => sharp(readFileSync(fichier));
  const meta = await lireMaster(source).metadata();
  const ecart = Math.abs(meta.width / meta.height / (visuel.largeur / visuel.hauteur) - 1);
  if (ecart > 0.01) throw new Error(`${id} : master en ${meta.width} × ${meta.height}, ratio attendu ${visuel.largeur} × ${visuel.hauteur} (écart ${(ecart * 100).toFixed(1)} %)`);
  const sourceNuit = path.join(depot, masterNuit);
  const repli = !existsSync(sourceNuit);
  if (!repli) {
    const m = await lireMaster(sourceNuit).metadata();
    if (m.width !== meta.width || m.height !== meta.height) throw new Error(`${id} : master de nuit en ${m.width} × ${m.height}, master de jour en ${meta.width} × ${meta.height} : les deux doivent avoir le même cadrage au pixel près`);
  }

  const lus = lireJetons(readFileSync(jetons, 'utf8'));
  const pixels = async (fichier) => (await lireMaster(fichier).resize(visuel.largeur, visuel.hauteur, { fit: 'fill', kernel: 'lanczos3' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true })).data;
  const brut = { width: visuel.largeur, height: visuel.hauteur, channels: 4 };
  const plafond = plafondPoids(visuel.largeur, visuel.hauteur);
  const ecrits = [];
  const ecrire = async (fichier, donnees) => {
    const { webp, qualite } = await encoder(donnees, brut, plafond);
    const cible = path.join(site, fichier);
    mkdirSync(path.dirname(cible), { recursive: true });
    writeFileSync(cible, webp);
    ecrits.push({ fichier, poids: webp.length, plafond, qualite });
  };
  const jour = await pixels(source);
  await ecrire(visuel.fichier, recolorer(jour, couleursDuRendu(lus, 'jour')));
  await ecrire(nuit, repli ? recolorer(jour, couleursDuRendu(lus, 'repli')) : recolorer(await pixels(sourceNuit), couleursDuRendu(lus, 'nuit')));
  return { ecrits, repli, masterNuit };
}

/**
 * Encode des pixels RVBA en WebP, qualité `QUALITE` ; au-delà du plafond, la
 * qualité descend par pas de 2 jusqu’à tenir, sans passer sous
 * `QUALITE_PLANCHER` (le dernier essai est alors rendu, trop lourd).
 * @param {Buffer} donnees
 * @param {{ width: number, height: number, channels: 4 }} brut
 * @param {number} plafond en octets
 * @returns {Promise<{ webp: Buffer, qualite: number }>}
 */
export async function encoder(donnees, brut, plafond) {
  for (let qualite = QUALITE; ; qualite -= 2) {
    const webp = await sharp(donnees, { raw: brut }).webp({ quality: qualite, alphaQuality: 90, effort: 6 }).toBuffer();
    if (webp.length <= plafond || qualite - 2 < QUALITE_PLANCHER) return { webp, qualite };
  }
}

/** Les identifiants dont le master de jour est déposé dans design/assets/visuels/. */
export function mastersPresents(depot = DEPOT) {
  return VISUELS.filter((v) => {
    const master = fichierMaster(v);
    return master && existsSync(path.join(depot, master));
  }).map((v) => v.id);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const ids = args.includes('--tout') ? mastersPresents() : args.filter((a) => !a.startsWith('--'));
  if (!ids.length) {
    const dossier = path.join(DEPOT, 'design/assets/visuels');
    console.error(`usage : npm run visuels:rendre <ID>…, ou npm run visuels:rendre -- --tout${existsSync(dossier) ? ` (séries : ${readdirSync(dossier).join(', ')})` : ''}`);
    process.exit(2);
  }
  let ko = false;
  for (const id of ids) {
    try {
      const { ecrits, repli, masterNuit } = await rendre(id);
      for (const { fichier, poids, plafond, qualite } of ecrits) {
        const trop = poids > plafond;
        ko ||= trop;
        const note = trop ? ` (au-delà de ${plafond / 1024} Ko même en qualité ${qualite})` : qualite !== QUALITE ? ` (qualité ${qualite} au lieu de ${QUALITE}, pour tenir sous ${plafond / 1024} Ko)` : '';
        console.log(`[rendu] ${fichier} : ${Math.round(poids / 1024)} Ko${note}`);
      }
      if (repli) console.warn(`[rendu] ${id} : master de nuit absent (${masterNuit}) ; nuit de repli « clair de lune » tirée du jour, à remplacer par la vraie nuit`);
    } catch (erreur) {
      ko = true;
      console.error(`[rendu] ${erreur.message}`);
    }
  }
  if (ko) process.exitCode = 1;
}
