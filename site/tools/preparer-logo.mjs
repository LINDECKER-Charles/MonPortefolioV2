/** Exports du PNG validé : cadrages, tailles web et icônes, sans redessiner le logo. */
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const racine = fileURLToPath(new URL('../../', import.meta.url));
const source = path.join(racine, 'design/assets/marque/livre-lanterne/logo-gothique.png');
const marque = path.join(racine, 'design/assets/marque');
const sourceNuit = path.join(marque, 'logo-symbole-nuit.png');
const assets = path.join(racine, 'site/src/assets/marque');
const publicDir = path.join(racine, 'site/public');
await mkdir(assets, { recursive: true });

// La séparation entre l’emblème et le nom est déjà présente dans le PNG source.
const cadrages = {
  symbole: { left: 180, top: 0, width: 1176, height: 820 },
  nom: { left: 140, top: 822, width: 1260, height: 196 },
  complet: { left: 140, top: 0, width: 1260, height: 1018 },
};
const lumieres = [
  { left: 670, top: 347, width: 9, height: 229 },
  { left: 720, top: 325, width: 96, height: 232 },
  { left: 857, top: 347, width: 10, height: 229 },
];
await writeFile(path.join(assets, 'cadrages.json'), JSON.stringify({ cadrages, lumieres }, null, 2) + '\n');
for (const [nom, cadrage] of Object.entries(cadrages)) {
  const largeur = nom === 'nom' ? 756 : nom === 'complet' ? 504 : 352;
  await sharp(source).extract(cadrage).resize({ width: largeur }).webp({ quality: 95, effort: 6 })
    .toFile(path.join(assets, `logo-${nom}.webp`));
  await sharp(source).extract(cadrage).png().toFile(path.join(marque, `logo-${nom}.png`));
}

// La version claire est un export du masque utilisé par le composant LogoImage.
const symboles = {
  jour: await sharp(source).extract(cadrages.symbole).png().toBuffer(),
  nuit: await sharp(sourceNuit).png().toBuffer(),
};
async function icone(taille, zone = 0.88, transparent = false, variante = 'jour') {
  const largeur = Math.round(taille * zone);
  const symbole = await sharp(symboles[variante]).resize({ width: largeur }).png().toBuffer();
  const background = transparent ? { r: 0, g: 0, b: 0, alpha: 0 } : '#F5F6F8';
  return sharp({ create: { width: taille, height: taille, channels: 4, background } })
    .composite([{ input: symbole, gravity: 'centre' }]).png().toBuffer();
}
for (const [fichier, taille, zone, transparent, variante] of [
  ['favicon.png', 64, 0.94, true],
  ['favicon-nuit.png', 64, 0.94, true, 'nuit'],
  ['apple-touch-icon.png', 180, 0.88],
  ['icon-192.png', 192, 0.88],
  ['icon-512.png', 512, 0.88],
  ['icon-maskable-512.png', 512, 0.64],
]) {
  const contenu = await icone(taille, zone, transparent, variante);
  await writeFile(path.join(publicDir, fichier), contenu);
  await writeFile(path.join(marque, fichier), contenu);
}

// ICO à trois images PNG ; le champ largeur/hauteur vaut la taille à ces résolutions.
const tailles = [16, 32, 48];
const images = await Promise.all(tailles.map((taille) => icone(taille, 0.94, true)));
const entete = Buffer.alloc(6 + 16 * images.length);
entete.writeUInt16LE(1, 2);
entete.writeUInt16LE(images.length, 4);
let position = entete.length;
images.forEach((contenu, i) => {
  const entree = 6 + 16 * i;
  entete[entree] = tailles[i];
  entete[entree + 1] = tailles[i];
  entete.writeUInt16LE(1, entree + 4);
  entete.writeUInt16LE(32, entree + 6);
  entete.writeUInt32LE(contenu.length, entree + 8);
  entete.writeUInt32LE(position, entree + 12);
  position += contenu.length;
});
const ico = Buffer.concat([entete, ...images]);
await writeFile(path.join(publicDir, 'favicon.ico'), ico);
await writeFile(path.join(marque, 'favicon.ico'), ico);
console.log('Logo : trois cadrages web, six icônes PNG et un ICO exportés.');
