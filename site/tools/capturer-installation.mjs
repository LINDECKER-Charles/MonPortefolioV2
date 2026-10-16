#!/usr/bin/env node
/**
 * Captures d’écran du manifeste (public/site.webmanifest, `screenshots`) :
 * l’accueil sur ordinateur (« wide ») et sur téléphone (« narrow »), que
 * Chrome montre dans sa fenêtre d’installation. Elles se prennent sur le vrai
 * site construit, de jour, mouvement réduit (chaque scène dans son état
 * final), puis s’écrivent en WebP dans public/installation/, versionnées.
 *
 *   npm run build && npm run serve      (dans un autre terminal)
 *   node tools/capturer-installation.mjs http://localhost:4321
 *
 * Les dimensions écrites ici sont celles que déclare le manifeste ;
 * tests/unit/manifeste.test.ts vérifie qu’elles concordent.
 */
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import sharp from 'sharp';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = process.argv[2];
if (!base) {
  console.error('[installation] adresse du site construit attendue, ex. http://localhost:4321');
  process.exit(1);
}

const CAPTURES = [
  { fichier: 'public/installation/accueil-large.webp', largeur: 1280, hauteur: 800 },
  { fichier: 'public/installation/accueil-etroit.webp', largeur: 390, hauteur: 844 },
];

mkdirSync(path.join(SITE, 'public/installation'), { recursive: true });
const navigateur = await chromium.launch();
for (const capture of CAPTURES) {
  const page = await navigateur.newPage({ viewport: { width: capture.largeur, height: capture.hauteur }, reducedMotion: 'reduce' });
  await page.addInitScript(() => localStorage.setItem('cl-theme', 'jour'));
  await page.goto(`${base}/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const brut = await page.screenshot({ type: 'png' });
  const { size } = await sharp(brut).webp({ quality: 82 }).toFile(path.join(SITE, capture.fichier));
  console.log(`${capture.fichier} (${capture.largeur} × ${capture.hauteur}, ${Math.round(size / 1024)} Ko)`);
  await page.close();
}
await navigateur.close();
