#!/usr/bin/env node
/**
 * Images de partage de la direction « Lanterne » (GLO-07 et les déclinaisons
 * de GLO-08), une par page de src/lib/partage.ts : composées en HTML avec la
 * vraie typographie du site (Instrument Serif et Instrument Sans, fichiers de
 * src/assets/fonts), puis rendues en PNG de 1 200 × 630 par le Chromium de
 * Playwright.
 *
 *   node --disable-warning=ExperimentalWarning tools/generer-partage.mjs
 *
 * Tout est local : polices, photos et logo sont lus sur le disque et posés en
 * data: dans la page ; aucune requête ne sort de la machine. Les fichiers
 * produits vont dans public/og/ et se versionnent : le build et le serveur ne
 * dépendent pas d’un navigateur. L’image par défaut est aussi copiée en
 * public/og/accueil.png, l’image de repli des articles du blog
 * (server/blog.mjs).
 *
 * Rien n’est généré par une IA : la photo est une vraie photo de Charles,
 * l’emblème est le logo validé ou son dessin GLO-01.
 */
import { copyFileSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import sharp from 'sharp';
import { IMAGES_PARTAGE, PARTAGE_DEFAUT } from '../src/lib/partage.ts';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const lire = (fichier) => readFileSync(path.join(SITE, fichier));
const enDonnees = (fichier, type) => `data:${type};base64,${lire(fichier).toString('base64')}`;

const POLICES = {
  sans: enDonnees('src/assets/fonts/instrument-sans-latin-wght.woff2', 'font/woff2'),
  serif: enDonnees('src/assets/fonts/instrument-serif-latin.woff2', 'font/woff2'),
};

/** Les photos sont réduites avant d’entrer dans la page : la composition n’a besoin que de 630 px de haut. */
async function photo(fichier) {
  const donnees = await sharp(lire(fichier)).resize({ height: 1260, withoutEnlargement: true }).webp({ quality: 88 }).toBuffer();
  return `data:image/webp;base64,${donnees.toString('base64')}`;
}

const VISUELS = {
  accueil: { src: await photo('src/assets/photos/charles-4.webp'), position: '50% 30%' },
  contact: { src: await photo('src/assets/visuels/contact/CON-PHO_800x1000.webp'), position: '50% 20%' },
  parcours: { src: await photo('src/assets/visuels/parcours/PAR-PHO_960x1200.webp'), position: '50% 20%' },
};
const LOGO = {
  symbole: enDonnees('src/assets/marque/logo-symbole.webp', 'image/webp'),
  nom: enDonnees('src/assets/marque/logo-nom.webp', 'image/webp'),
};
/** L’emblème dessiné (GLO-01) à l’encre de lune, allumé : la lanterne de l’acte de veille. */
const LANTERNE = lire('src/assets/visuels/global/GLO-01.svg')
  .toString()
  .replace(/<title>[\s\S]*?<\/title>/, '')
  .replace(/currentColor/g, '#e4e7ee')
  .replace(/#0a1428/g, '#0b0d12');

const echapper = (texte) => texte.replace(/&/g, '&amp;').replace(/</g, '&lt;');

/** Le corps du titre selon sa longueur : un mot en très grand, une accroche sur trois lignes. */
function corpsDuTitre(titre) {
  if (titre.length <= 10) return 132;
  if (titre.length <= 18) return 104;
  if (titre.length <= 30) return 84;
  return 72;
}

function page(image) {
  const visuel = image.visuel === 'lanterne'
    ? `<div class="visuel visuel--lanterne">${LANTERNE}</div>`
    : `<div class="visuel"><img src="${VISUELS[image.visuel].src}" style="object-position:${VISUELS[image.visuel].position}" alt=""></div>`;
  const identite = image.chemin === '/'
    ? `<p class="nom">Charles Lindecker</p><p class="surtitre surtitre--metier">${echapper(image.surtitre ?? '')}</p>`
    : image.surtitre ? `<p class="surtitre">${echapper(image.surtitre)}</p>` : '';
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>
    @font-face { font-family: 'Instrument Sans'; src: url(${POLICES.sans}) format('woff2'); font-weight: 400 700; }
    @font-face { font-family: 'Instrument Serif'; src: url(${POLICES.serif}) format('woff2'); font-weight: 400; }
    * { box-sizing: border-box; margin: 0; }
    html, body { width: 1200px; height: 630px; overflow: hidden; }
    body { background: #ece9e3; color: #141312; font-family: 'Instrument Sans', sans-serif; font-kerning: normal; -webkit-font-smoothing: antialiased; }
    .page { display: grid; grid-template-columns: minmax(0, 1fr) 420px; height: 100%; }
    .texte { position: relative; isolation: isolate; display: flex; flex-direction: column; padding: 60px 56px 44px 72px; }
    .texte::before { content: ''; position: absolute; inset: 40px 0 120px -40px; z-index: -1; background: radial-gradient(closest-side, rgb(255 253 246 / .95), transparent); }
    .nom { font-size: 34px; font-weight: 600; letter-spacing: .01em; }
    .surtitre { font-size: 27px; font-weight: 500; color: #59544c; letter-spacing: .01em; }
    .surtitre--metier { margin-top: 4px; font-weight: 400; }
    .titre { margin-top: 26px; font-family: 'Instrument Serif', serif; font-weight: 400; line-height: .98; letter-spacing: -.018em; text-wrap: balance; }
    .ligne { display: block; white-space: nowrap; }
    .etiquette { align-self: flex-start; margin-top: 30px; padding: 4px 16px; border: 1.5px solid #7b7368; border-radius: 6px; font-size: 26px; font-weight: 500; color: #59544c; }
    .pied { margin-top: auto; display: flex; align-items: center; gap: 18px; }
    .pied .symbole { width: 92px; }
    .pied .marque { width: 230px; }
    .pied .adresse { margin-left: auto; font-size: 22px; color: #59544c; letter-spacing: .01em; }
    .visuel { position: relative; overflow: hidden; background: #15171d; }
    .visuel img { display: block; width: 100%; height: 100%; object-fit: cover; }
    .visuel--lanterne { display: grid; place-items: center; background: radial-gradient(circle at 50% 50%, rgb(240 178 74 / .26), transparent 58%), #15171d; }
    .visuel--lanterne svg { width: 230px; height: 230px; }
  </style></head><body><div class="page">
    <div class="texte">
      ${identite}
      <h1 class="titre" style="font-size:${image.lignes ? 72 : corpsDuTitre(image.titre)}px">${image.lignes ? image.lignes.map((ligne) => `<span class="ligne">${echapper(ligne)}</span>`).join(' ') : echapper(image.titre)}</h1>
      ${image.etiquette ? `<p class="etiquette">${echapper(image.etiquette)}</p>` : ''}
      <div class="pied"><img class="symbole" src="${LOGO.symbole}" alt="">${image.chemin === '/' ? '' : `<img class="marque" src="${LOGO.nom}" alt="">`}<span class="adresse">charles-lindecker.com</span></div>
    </div>
    ${visuel}
  </div></body></html>`;
}

const navigateur = await chromium.launch();
const onglet = await navigateur.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
// Aucune requête vers l’extérieur : tout est en data:.
await onglet.route(/^(?!data:)/, (route) => route.abort());
for (const image of IMAGES_PARTAGE) {
  await onglet.setContent(page(image), { waitUntil: 'load' });
  await onglet.evaluate(() => document.fonts.ready);
  const brut = await onglet.screenshot({ type: 'png' });
  const sortie = path.join(SITE, image.fichier);
  const png = image.visuel === 'lanterne' ? sharp(brut).png({ palette: true, quality: 92, compressionLevel: 9 }) : sharp(brut).png({ compressionLevel: 9 });
  const { size } = await png.toFile(sortie);
  console.log(`${image.fichier} (${Math.round(size / 1024)} Ko)`);
}
await navigateur.close();

copyFileSync(path.join(SITE, PARTAGE_DEFAUT.fichier), path.join(SITE, 'public/og/accueil.png'));
console.log('public/og/accueil.png (copie de l’image par défaut)');
