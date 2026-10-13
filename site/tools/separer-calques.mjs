#!/usr/bin/env node
/**
 * Sépare une image générée en calques recolorables (règle 6 de la commande,
 * docs/visuels-a-generer.md).
 *
 *   node tools/separer-calques.mjs ACC-03 [PVZ-05 …]   les masters nommés
 *   node tools/separer-calques.mjs --tout               tous les masters présents
 *
 * Le master est un PNG en trois couleurs de clé (encre #000000, aplat #FFFFFF,
 * lumière #FF0000), sur fond transparent ou rempli d’aplat, rangé dans
 * `design/assets/visuels/<série>/<ID>.png`, au ratio exact de la fiche (à 1 %
 * près). Le script le met aux dimensions du registre puis écrit, à côté du
 * fichier attendu (`src/assets/visuels/<série>/`) :
 *
 *   <ID>_<l>x<h>.aplat.webp    masque de l’aplat, que le site colore par --surface
 *   <ID>_<l>x<h>.encre.webp    masque de l’encre, coloré par --encre
 *   <ID>_<l>x<h>.lumiere.webp  masque de la lumière, coloré par --lanterne
 *   <ID>_<l>x<h>.webp          le rendu de jour, pour les contextes sans masque
 *
 * Chaque pixel se décompose en un mélange des trois clés : blanc = min(V, B),
 * rouge = R − min(V, B), noir = le reste. Le trait antialiasé d’un générateur
 * garde ainsi ses bords doux. Un masque est blanc, son alpha porte la part du
 * calque. WebP qualité 82, alpha conservé.
 */
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { fichierMaster, fichiersCalques, plafondPoids, visuelParId, VISUELS } from '../src/config/visuels.ts';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEPOT = path.resolve(SITE, '..');

/** Couleurs du rendu de jour (src/styles/jetons.css, thème clair). */
export const RENDU_JOUR = { aplat: [0xfb, 0xfa, 0xf7], encre: [0x14, 0x13, 0x12], lumiere: [0xf0, 0xb2, 0x4a] };

/**
 * Parts d’aplat, d’encre et de lumière de chaque pixel d’une image RVBA.
 * @param {Buffer} rgba pixels bruts, quatre octets chacun
 * @returns {{ aplat: Uint8Array, encre: Uint8Array, lumiere: Uint8Array }} alphas 0–255
 */
export function decomposer(rgba) {
  const n = rgba.length / 4;
  const aplat = new Uint8Array(n);
  const encre = new Uint8Array(n);
  const lumiere = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    const r = rgba[i * 4];
    const blanc = Math.min(rgba[i * 4 + 1], rgba[i * 4 + 2]);
    const rouge = Math.max(0, r - blanc);
    const noir = Math.max(0, 255 - blanc - rouge);
    const alpha = rgba[i * 4 + 3] / 255;
    aplat[i] = Math.round(blanc * alpha);
    lumiere[i] = Math.round(rouge * alpha);
    encre[i] = Math.round(noir * alpha);
  }
  return { aplat, encre, lumiere };
}

/** Le rendu de jour d’une décomposition : les trois parts colorées, alpha d’origine. */
export function rendreJour(parts, alphaOrigine) {
  const n = alphaOrigine.length;
  const sortie = Buffer.alloc(n * 4);
  for (let i = 0; i < n; i++) {
    const total = parts.aplat[i] + parts.encre[i] + parts.lumiere[i];
    for (let c = 0; c < 3; c++) {
      sortie[i * 4 + c] = total ? Math.round((parts.aplat[i] * RENDU_JOUR.aplat[c] + parts.encre[i] * RENDU_JOUR.encre[c] + parts.lumiere[i] * RENDU_JOUR.lumiere[c]) / total) : 0;
    }
    sortie[i * 4 + 3] = alphaOrigine[i];
  }
  return sortie;
}

const masque = (alphas) => {
  const sortie = Buffer.alloc(alphas.length * 4, 255);
  for (let i = 0; i < alphas.length; i++) sortie[i * 4 + 3] = alphas[i];
  return sortie;
};

/**
 * Sépare le master d’une entrée du registre. Rend les fichiers écrits et
 * leurs poids ; échoue si le master manque ou n’a pas le ratio de la fiche.
 * @param {string} id
 * @param {{ depot?: string, site?: string }} [racines]
 */
export async function separer(id, { depot = DEPOT, site = SITE } = {}) {
  const visuel = visuelParId(id);
  if (!visuel) throw new Error(`${id} : identifiant absent du registre`);
  const master = fichierMaster(visuel);
  const calques = fichiersCalques(visuel);
  if (!master || !calques || !visuel.largeur || !visuel.hauteur) throw new Error(`${id} : pas une image générée à fichier propre (${visuel.methode})`);
  const source = path.join(depot, master);
  if (!existsSync(source)) throw new Error(`${id} : master absent (${master})`);
  const meta = await sharp(source).metadata();
  const ecart = Math.abs(meta.width / meta.height / (visuel.largeur / visuel.hauteur) - 1);
  if (ecart > 0.01) throw new Error(`${id} : master en ${meta.width} × ${meta.height}, ratio attendu ${visuel.largeur} × ${visuel.hauteur} (écart ${(ecart * 100).toFixed(1)} %)`);

  const { data } = await sharp(source).resize(visuel.largeur, visuel.hauteur, { fit: 'fill', kernel: 'lanczos3' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const parts = decomposer(data);
  const alpha = new Uint8Array(data.length / 4);
  for (let i = 0; i < alpha.length; i++) alpha[i] = data[i * 4 + 3];
  const brut = { width: visuel.largeur, height: visuel.hauteur, channels: 4 };
  const webp = { quality: 82, alphaQuality: 90, effort: 6 };

  const ecrits = [];
  const ecrire = async (fichier, pixels) => {
    const cible = path.join(site, fichier);
    mkdirSync(path.dirname(cible), { recursive: true });
    await sharp(pixels, { raw: brut }).webp(webp).toFile(cible);
    const poids = statSync(cible).size;
    ecrits.push({ fichier, poids, plafond: plafondPoids(visuel.largeur, visuel.hauteur) });
  };
  await ecrire(visuel.fichier, rendreJour(parts, alpha));
  for (const calque of /** @type {const} */ (['aplat', 'encre', 'lumiere'])) await ecrire(calques[calque], masque(parts[calque]));
  return ecrits;
}

/** Les identifiants dont un master est déposé dans design/assets/visuels/. */
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
    console.error(`usage : node tools/separer-calques.mjs <ID>… | --tout${existsSync(dossier) ? ` (séries présentes : ${readdirSync(dossier).join(', ')})` : ''}`);
    process.exit(2);
  }
  let ko = false;
  for (const id of ids) {
    try {
      for (const { fichier, poids, plafond } of await separer(id)) {
        const trop = poids > plafond;
        ko ||= trop;
        console.log(`[calques] ${fichier} : ${Math.round(poids / 1024)} Ko${trop ? ` (au-delà de ${plafond / 1024} Ko)` : ''}`);
      }
    } catch (erreur) {
      ko = true;
      console.error(`[calques] ${erreur.message}`);
    }
  }
  if (ko) process.exitCode = 1;
}
