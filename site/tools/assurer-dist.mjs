/**
 * Garantit un `dist/` à jour pour les tests qui lisent le vrai HTML construit.
 *
 * Un test qui lirait un build périmé mentirait : si une source (src/, public/,
 * la configuration Astro) est plus récente que `dist/index.html`, le site est
 * reconstruit avec `npm run build` — le vérificateur du site compris. Un verrou
 * évite que plusieurs fichiers de test, lancés en parallèle, construisent en
 * même temps ou lisent un build à moitié écrit.
 *
 * Usage : `const dist = await assurerDist();` (renvoie le chemin absolu de dist/).
 */
import { execFileSync } from 'node:child_process';
import { mkdir, readdir, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(SITE, 'dist');
const VERROU = path.join(SITE, '.astro', 'dist.lock');
const SOURCES = ['src', 'public'];
const FICHIERS_SOURCES = ['astro.config.mjs', 'package.json', 'package-lock.json', 'tsconfig.json'];
// Plus long qu'un build : un build à froid en CI optimise plus de 1 000 images
// (près de 7 min, 15/10/2026), contre quelques dizaines de secondes en local.
const ATTENTE_MAX_MS = (process.env.CI ? 15 : 6) * 60_000;

const dormir = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function mtime(chemin) {
  try {
    return (await stat(chemin)).mtimeMs;
  } catch {
    return 0;
  }
}

async function plusRecent(dossier) {
  let max = 0;
  let entrees;
  try {
    entrees = await readdir(dossier, { recursive: true, withFileTypes: true });
  } catch {
    return 0;
  }
  // Les dossiers comptent aussi : supprimer un fichier en change la date.
  max = await mtime(dossier);
  for (const e of entrees) {
    if (e.isFile() || e.isDirectory()) max = Math.max(max, await mtime(path.join(e.parentPath, e.name)));
  }
  return max;
}

/** Vrai si dist/ manque ou si une source l'a dépassé. */
export async function distPerime() {
  const construit = await mtime(path.join(DIST, 'index.html'));
  if (!construit) return true;
  const sources = await Promise.all([
    ...SOURCES.map((d) => plusRecent(path.join(SITE, d))),
    ...FICHIERS_SOURCES.map((f) => mtime(path.join(SITE, f))),
  ]);
  return Math.max(...sources) > construit;
}

async function prendreVerrou() {
  await mkdir(path.dirname(VERROU), { recursive: true });
  const debut = Date.now();
  for (;;) {
    try {
      await mkdir(VERROU);
      return;
    } catch (erreur) {
      if (erreur.code !== 'EEXIST') throw erreur;
    }
    // Un verrou plus vieux que la durée d'un build est celui d'un processus mort.
    if (Date.now() - (await mtime(VERROU)) > ATTENTE_MAX_MS) await rm(VERROU, { recursive: true, force: true });
    if (Date.now() - debut > ATTENTE_MAX_MS) throw new Error(`verrou du build bloqué : supprimer ${VERROU}`);
    await dormir(400);
  }
}

/** @returns {Promise<string>} chemin absolu de `dist/`, à jour. */
export async function assurerDist() {
  await prendreVerrou();
  try {
    if (await distPerime()) {
      console.log('[assurer-dist] dist/ absent ou périmé : npm run build');
      execFileSync('npm', ['run', 'build'], { cwd: SITE, stdio: 'inherit' });
    }
  } finally {
    await rm(VERROU, { recursive: true, force: true });
  }
  return DIST;
}
