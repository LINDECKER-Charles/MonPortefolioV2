#!/usr/bin/env node
/**
 * Icônes du site depuis l’emblème seul (GLO-01,
 * src/assets/visuels/global/GLO-01.svg) : favicon universel SVG/PNG, ICO 16, 32
 * et 48 px, icône Apple et icônes d’application (dont la masquable).
 *
 *   node tools/preparer-icones.mjs
 *
 * L’emblème est dessiné en `currentColor` : l’outil le recolore avant de le
 * rendre. Le favicon garde le fond transparent et ajoute un contour de lune
 * sous l’encre bleu nuit : sa lisibilité ne dépend ni du thème des onglets,
 * ni de la prise en charge de `media` sur les liens d’icône. Les icônes d’application posent
 * l’emblème sur la pierre du jour (fond opaque : iOS noircit la
 * transparence) ; la masquable le garde dans sa zone sûre (cercle de 80 %).
 * Rien n’est généré par une IA : un rendu déterministe d’un dessin vectoriel.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(SITE, 'public');
const brut = readFileSync(path.join(SITE, 'src/assets/visuels/global/GLO-01.svg'), 'utf8');

const ENCRE_JOUR = '#0a1428'; // le bleu nuit du logo validé (src/assets/marque)
const ENCRE_NUIT = '#e4e7ee'; // --lune
const PIERRE = '#ece9e3'; // --fond du jour

/**
 * Le contour est peint SOUS toutes les formes, puis le dessin intact par-dessus.
 * Le cadrage inclut le bas du livre (y = 32.9) et le contour, sans les couper.
 * Aucun fond plein, filtre ou CSS : le même dessin fonctionne aussi en ICO.
 */
const dessin = brut.replace(/<svg\b[^>]*>|<\/svg>|<title>[\s\S]*?<\/title>/g, '').trim();
const contour = dessin
  .replace(/fill="[^"]*"/g, `fill="${ENCRE_NUIT}"`)
  .replace(/<path\b/g, `<path stroke="${ENCRE_NUIT}" stroke-width="3.5" stroke-linejoin="round"`);
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -1 36 36" width="64" height="64">
  <title>Une lanterne au creux d’un livre ouvert</title>
  <g>${contour}</g>
  <g>${dessin.replace(/currentColor/g, ENCRE_JOUR)}</g>
</svg>\n`;

const rendreFavicon = (taille) => sharp(Buffer.from(favicon), { density: 288 })
  .resize(taille, taille).png({ compressionLevel: 9 }).toBuffer();

/** L’emblème recoloré, à la taille demandée. */
function embleme(encre, taille) {
  const svg = brut
    .replace(/currentColor/g, encre)
    .replace(/<svg\b[^>]*>/, (ouverture) => ouverture.replace(/\s(width|height)="[^"]*"/g, '').replace('<svg', `<svg width="${taille}" height="${taille}"`));
  return sharp(Buffer.from(svg), { density: 72 * Math.max(1, taille / 32) }).resize(taille, taille).png().toBuffer();
}

/** L’emblème centré sur la pierre, à `part` de la largeur du carré. */
async function surPierre(taille, part) {
  const cote = Math.round(taille * part);
  return sharp({ create: { width: taille, height: taille, channels: 4, background: PIERRE } })
    .composite([{ input: await embleme(ENCRE_JOUR, cote), gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/** Un fichier ICO qui contient des PNG (format admis par tous les navigateurs actuels). */
function ico(images) {
  const entete = Buffer.alloc(6 + 16 * images.length);
  entete.writeUInt16LE(0, 0);
  entete.writeUInt16LE(1, 2);
  entete.writeUInt16LE(images.length, 4);
  let decalage = entete.length;
  images.forEach(({ taille, donnees }, i) => {
    const o = 6 + 16 * i;
    entete.writeUInt8(taille >= 256 ? 0 : taille, o);
    entete.writeUInt8(taille >= 256 ? 0 : taille, o + 1);
    entete.writeUInt16LE(1, o + 4);
    entete.writeUInt16LE(32, o + 6);
    entete.writeUInt32LE(donnees.length, o + 8);
    entete.writeUInt32LE(decalage, o + 12);
    decalage += donnees.length;
  });
  return Buffer.concat([entete, ...images.map((image) => image.donnees)]);
}

const ecrire = (nom, donnees) => {
  writeFileSync(path.join(PUBLIC, nom), donnees);
  console.log(`public/${nom} (${donnees.length} octets)`);
};

ecrire('favicon.svg', Buffer.from(favicon));
const png = await rendreFavicon(64);
ecrire('favicon.png', png);
// Ancienne URL conservée pour les pages encore en cache et les favoris existants.
ecrire('favicon-nuit.png', png);
ecrire('favicon.ico', ico(await Promise.all([16, 32, 48].map(async (taille) => ({ taille, donnees: await rendreFavicon(taille) })))));
ecrire('apple-touch-icon.png', await surPierre(180, 0.78));
ecrire('icon-192.png', await surPierre(192, 0.78));
ecrire('icon-512.png', await surPierre(512, 0.78));
ecrire('icon-maskable-512.png', await surPierre(512, 0.6));
