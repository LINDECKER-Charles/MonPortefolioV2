#!/usr/bin/env node
/**
 * Génère `docs/visuels-a-generer.md` depuis le registre des visuels
 * (src/config/visuels.ts) : la commande de production des images, à donner à
 * Codex. Le fichier est une sortie, jamais une source : le corriger dans le
 * registre, puis relancer.
 *
 *   npm run visuels:doc                  écrit docs/visuels-a-generer.md
 *   npm run visuels:doc -- --verifier    échoue si le fichier n’est pas à jour
 *
 * Node importe le registre TypeScript tel quel (syntaxe effaçable seulement) :
 * lancer avec `--disable-warning=ExperimentalWarning`, comme le fait npm.
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { METHODES, ORDRE_SERIES, REGLES_COMMUNES, sujetPourGenerateur, VISUELS } from '../src/config/visuels.ts';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const SORTIE = path.resolve(SITE, '../docs/visuels-a-generer.md');
export const COMMANDE = 'npm run visuels:doc';

const SERIES = {
  global: 'Identité et éléments globaux',
  accueil: 'Accueil',
  projets: 'Projets (hub)',
  'pvz-fusion': 'PvZ Fusion',
  'league-of-database': 'League Of Data Base',
  omnicard: 'Omnicard',
  bloodborne: 'Bloodborne Legendary Run',
  gup: 'gup',
  parcours: 'Parcours : hub, professionnel, compétences, formation',
  contact: 'Contact',
  blog: 'Blog',
  etats: 'États : 404 et hors ligne',
};

/** Qui produit le fichier, selon la méthode. */
const TRAVAIL = {
  IMG: 'à générer (image)',
  SVG: 'à dessiner (vectoriel)',
  FIG: 'à coder (figure de données), rien à générer',
  CAP: 'à capturer (écran réel), rien à générer',
  PHO: 'photo réelle, traitements déterministes seulement',
  OG: 'à composer en HTML puis rendre en PNG',
};

const code = (t) => `\`${t}\``;
const priorite = (v) => (v.priorite === 'socle' ? 'socle' : 'élargi');

function fiche(v) {
  const lignes = [`### ${v.id} · ${sujetPourGenerateur(v)}`, ''];
  lignes.push(`- **Priorité** : ${priorite(v)} · **Méthode** : ${v.methode}, ${v.reprend?.length ? 'rien à produire, le fichier est celui d’un autre emplacement' : TRAVAIL[v.methode]}`);
  lignes.push(`- **Emplacement** : ${v.page === 'global' ? 'toutes les pages' : code(v.page)} · ${v.emplacement} _(contexte : ne pas le recopier dans un prompt)_`);
  const sujet = sujetPourGenerateur(v);
  lignes.push(`- **Sujet${sujet !== v.sujet ? ' pour le prompt' : ''}** : ${sujet}`);
  lignes.push(`- **Composition** : ${v.composition}`);
  lignes.push(`- **Format** : ${v.format}${v.ratioMobile ? ` (recadrage mobile ${v.ratioMobile.replace(' / ', ':')})` : ''}`);
  if (v.reprend?.length) lignes.push(`- **Fichier attendu** : aucun, reprend ${v.reprend.map(code).join(', ')}`);
  else if (v.fichier) lignes.push(`- **Fichier attendu** : ${code(`site/${v.fichier}`)}${v.lot ? ` (lot de ${v.lot})` : ''}`);
  else lignes.push('- **Fichier attendu** : aucune image, figure codée');
  lignes.push(`- **Alt prévu** (pour le HTML, jamais pour un prompt) : ${v.alt ? `« ${v.alt} »` : 'aucun, visuel décoratif'}`);
  if (v.note) lignes.push(`- **Note** : ${v.note}`);
  return lignes.join('\n');
}

/** Le contenu complet de docs/visuels-a-generer.md. Déterministe : pas de date. */
export function rendreCommande(visuels = VISUELS) {
  const socle = visuels.filter((v) => v.priorite === 'socle');
  const comptes = (liste) => Object.keys(METHODES).map((m) => `${m} ${liste.filter((v) => v.methode === m).length}`).join(' · ');
  const aProduire = (v) => ['IMG', 'SVG', 'OG'].includes(v.methode) && !v.reprend?.length;

  const sortie = [];
  sortie.push('# Visuels à générer — commande de production', '');
  sortie.push(`> **Fichier généré** depuis \`site/src/config/visuels.ts\` par ${code(COMMANDE)} (dans \`site/\`). Ne pas le corriger ici : corriger le registre, puis relancer la commande. \`npm run visuels\` liste ce qu’il reste à produire.`, '');

  sortie.push('## La mission', '');
  sortie.push(`Tu produis les visuels de la refonte du portfolio de Charles Lindecker. Le registre recense **${visuels.length} emplacements** (${socle.length} « socle », ${visuels.length - socle.length} « élargi »). Pour chaque fiche ci-dessous, livre le **fichier attendu**, au chemin indiqué, en respectant le sujet, la composition et le format. Les règles communes valent pour toutes les fiches.`, '');
  sortie.push('- **Socle** : nécessaire au lancement de la refonte. À produire d’abord.');
  sortie.push('- **Élargi** : enrichit le site et peut suivre.');
  sortie.push('- Seules les méthodes **IMG**, **SVG** et **OG** se produisent ici. Les figures (**FIG**), les captures (**CAP**) et les photos (**PHO**) sont codées, capturées ou traitées ailleurs : leurs fiches donnent le contexte, pas une tâche de génération.');
  sortie.push('- La famille de style (règle 5) est arrêtée : la direction « Lanterne », retenue le 13 octobre 2026 (`design/refonte/c-lanterne/README.md`). Gravure en réserve, deux ou trois aplats séparables (encre, aplat, lumière) recolorés par les jetons, la lanterne comme seule source de lumière.');
  sortie.push('- Le prompt d’une image se rédige en anglais, à partir des seuls champs **Sujet** et **Composition** de la fiche. Le champ **Emplacement** donne le contexte et peut nommer une marque ou un jeu : il ne va jamais dans un prompt.', '');

  sortie.push('## Règles communes', '');
  REGLES_COMMUNES.forEach((regle, i) => sortie.push(`${i + 1}. ${regle}`));
  sortie.push('', 'Exceptions à la règle 3 : le nom dans les déclinaisons du logo, et les images de partage (OG), composées en vraie typographie.', '');

  sortie.push('## Méthodes', '');
  sortie.push('| Méthode | Nature | Consigne |', '|---|---|---|');
  for (const [methode, { nom, consigne }] of Object.entries(METHODES)) sortie.push(`| ${methode} | ${nom} | ${consigne} |`);
  sortie.push('', '## Livraison', '');
  sortie.push('- Image : master PNG 2× + WebP (qualité ≈ 82), au chemin attendu. Nom : `<ID>_<largeur>x<hauteur>.webp`.');
  sortie.push('- Dessin vectoriel : `<ID>.svg`, au chemin attendu. Un lot (pictos d’une même planche) tient dans un seul fichier.');
  sortie.push('- Image de partage : `public/og/<ID>_1200x630.png`.');
  sortie.push('- Consigner pour chaque série le prompt, la date et la provenance dans `design/assets/<série>/README.md` et `site/src/assets/visuels/<série>/README.md`.');
  sortie.push('- Vérifier avec `npm run visuels` (dans `site/`) : le visuel livré disparaît de la liste des manquants.', '');

  sortie.push('## Vue d’ensemble', '');
  sortie.push('| Série | Emplacements | Socle | Méthodes |', '|---|---|---|---|');
  for (const serie of ORDRE_SERIES) {
    const liste = visuels.filter((v) => v.serie === serie);
    if (liste.length) sortie.push(`| ${SERIES[serie]} | ${liste.length} | ${liste.filter((v) => v.priorite === 'socle').length} | ${comptes(liste)} |`);
  }
  sortie.push(`| **Total** | **${visuels.length}** | **${socle.length}** | ${comptes(visuels)} |`, '');

  sortie.push('## File de travail « socle »', '');
  sortie.push('Les visuels « socle » à produire ici (IMG, SVG, OG), dans l’ordre des séries. Les emplacements qui reprennent le fichier d’un autre n’y figurent pas.', '');
  for (const serie of ORDRE_SERIES) {
    const liste = socle.filter((v) => v.serie === serie && aProduire(v));
    if (liste.length) sortie.push(`- **${SERIES[serie]}** : ${liste.map((v) => `${v.id} (${v.methode})`).join(', ')}`);
  }
  sortie.push('');

  for (const serie of ORDRE_SERIES) {
    const liste = visuels.filter((v) => v.serie === serie);
    if (!liste.length) continue;
    sortie.push(`## ${SERIES[serie]}`, '');
    for (const v of liste) sortie.push(fiche(v), '');
  }
  return `${sortie.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd()}\n`;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const contenu = rendreCommande();
  if (process.argv.includes('--verifier')) {
    const actuel = await readFile(SORTIE, 'utf8').catch(() => '');
    if (actuel !== contenu) {
      console.error(`[visuels] ${path.relative(SITE, SORTIE)} n’est pas à jour : lancer ${COMMANDE}`);
      process.exit(1);
    }
    console.log('[visuels] docs/visuels-a-generer.md est à jour.');
  } else {
    await writeFile(SORTIE, contenu);
    console.log(`[visuels] ${path.relative(SITE, SORTIE)} écrit (${VISUELS.length} fiches).`);
  }
}
