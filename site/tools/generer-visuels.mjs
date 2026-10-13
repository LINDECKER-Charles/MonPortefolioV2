#!/usr/bin/env node
/**
 * Génère `docs/visuels-a-generer.md` depuis le registre des visuels
 * (src/config/visuels.ts) et l’état du disque : la commande de production des
 * images, à donner à Codex. Le fichier est une sortie, jamais une source : le
 * corriger dans le registre, puis relancer.
 *
 *   npm run visuels:doc                  écrit docs/visuels-a-generer.md
 *   npm run visuels:doc -- --verifier    échoue si le fichier n’est pas à jour
 *
 * Deux parties : la commande de Codex (les images générées pas encore livrées,
 * « socle » d’abord), puis ce que l’équipe fait (dessins, figures, captures,
 * images de partage), zone par zone. Les fichiers déjà présents sur le disque
 * sortent des files : régénérer après chaque livraison.
 *
 * Node importe le registre TypeScript tel quel (syntaxe effaçable seulement) :
 * lancer avec `--disable-warning=ExperimentalWarning`, comme le fait npm.
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CALQUES,
  CLES_CALQUES,
  familleDe,
  FAMILLES,
  fichierMaster,
  fichiersCalques,
  FOND_PROMPT,
  JETONS_CALQUES,
  METHODES,
  NEGATIVE_PROMPT,
  ORDRE_SERIES,
  PLANCHE_ESSAI,
  PLAFONDS_POIDS,
  producteur,
  REFERENCES_STYLE,
  REGLES_COMMUNES,
  STYLE_PROMPT,
  sujetPourGenerateur,
  VISUELS,
} from '../src/config/visuels.ts';
import { etatDesVisuels } from './visuels-manquants.mjs';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const SORTIE = path.resolve(SITE, '../docs/visuels-a-generer.md');
export const COMMANDE = 'npm run visuels:doc';

export const SERIES = {
  global: 'Identité et éléments globaux',
  accueil: 'Accueil',
  projets: 'Projets (vitrine)',
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

/** Ce que demande chaque méthode, dit en une ligne de fiche. */
const TRAVAIL = {
  IMG: 'à générer (image)',
  SVG: 'à dessiner (vectoriel)',
  FIG: 'figure codée depuis des données, rien à générer',
  CAP: 'capture réelle, rien à générer',
  PHO: 'photo réelle, traitements déterministes seulement',
  OG: 'à composer en HTML puis rendre en PNG',
};

const code = (t) => `\`${t}\``;
const NOMS_CALQUES = { aplat: 'l’aplat', encre: 'l’encre', lumiere: 'la lumière' };
const priorite = (v) => (v.priorite === 'socle' ? 'socle' : 'élargi');
const ids = (liste) => liste.map((v) => v.id).join(', ');
const estReprise = (v) => Boolean(v.reprend?.length) && !v.fichier && !v.declinaisons?.length;
const qui = (v) => ({ codex: 'Codex', equipe: `équipe ${SERIES[v.serie]}`, charles: 'Charles' })[producteur(v)];

function fiche(v) {
  const lignes = [`#### ${v.id} · ${sujetPourGenerateur(v)}`, ''];
  const famille = familleDe(v);
  const travail = estReprise(v) ? 'rien à produire, le fichier est celui d’un autre emplacement' : TRAVAIL[v.methode];
  lignes.push(`- **Priorité** : ${priorite(v)} · **Méthode** : ${v.methode}, ${travail}${famille ? ` · **Série** : ${famille.nom}` : ''}`);
  if (!estReprise(v)) lignes.push(`- **Produit par** : ${qui(v)}`);
  lignes.push(`- **Emplacement** : ${v.page === 'global' ? 'toutes les pages' : code(v.page)} · ${v.emplacement} _(contexte : ne pas le recopier dans un prompt)_`);
  lignes.push(v.pose ? `- **Posé dans** : ${v.pose.map((p) => code(`src/${p}`)).join(', ')}` : `- **Élargi, non posé** : ${v.raisonNonPose}`);
  const sujet = sujetPourGenerateur(v);
  lignes.push(`- **Sujet${sujet !== v.sujet ? ' pour le prompt' : ''}** : ${sujet}`);
  lignes.push(`- **Composition${v.methode === 'IMG' && !estReprise(v) ? ' (pour le prompt)' : ''}** : ${v.composition}`);
  if (v.lumiere) lignes.push(`- **Lanterne : ${v.lumiere[0]} % × ${v.lumiere[1]} %, contrainte dure** : la lumière animée du site part de ce point (largeur × hauteur, depuis le coin haut gauche).`);
  if (v.calques) lignes.push(`- **Calques** : encre (${CLES_CALQUES.encre}) = ${v.calques.encre} ; aplat (${CLES_CALQUES.aplat}) = ${v.calques.aplat} ; lumière (${CLES_CALQUES.lumiere}) = ${v.calques.lumiere} · **Fond** : ${v.fond === 'transparent' ? 'transparent' : 'rempli d’aplat'}`);
  if (v.cadrage) lignes.push(`- **Cadrage (pour vérifier)** : ${v.cadrage}`);
  lignes.push(`- **Format** : ${v.format}${v.ratioMobile ? ` (recadrage mobile ${v.ratioMobile.replace(' / ', ':')})` : ''}`);
  if (estReprise(v)) lignes.push(`- **Fichier attendu** : aucun, reprend ${v.reprend.map(code).join(', ')}`);
  else if (v.declinaisons?.length) lignes.push(`- **Fichiers attendus** (${v.declinaisons.length}) : ${v.declinaisons.map((d) => `${code(`site/${d.fichier}`)}${d.alt ? ` (alt « ${d.alt} »)` : ''}`).join(' ; ')}`);
  else if (v.methode === 'FIG') lignes.push(v.fichier ? `- **Composant** : ${code(`site/${v.fichier}`)}` : '- **Composant** : aucun, figure à coder');
  else if (v.fichier) {
    lignes.push(`- **Fichier attendu** : ${code(`site/${v.fichier}`)}${v.lot ? ` (lot de ${v.lot})` : ''}`);
    const master = fichierMaster(v);
    const calques = fichiersCalques(v);
    if (master && calques) lignes.push(`- **Master** : ${code(master)} → ${code(`node tools/separer-calques.mjs ${v.id}`)} écrit le rendu et ${Object.values(calques).map((f) => code(path.posix.basename(f))).join(', ')}`);
  }
  if (v.pieces?.length) lignes.push(`- **Pièces du fichier** (${v.pieces.length}) : ${v.pieces.map(code).join(', ')}`);
  lignes.push(`- **Alt prévu** (pour le HTML, jamais pour un prompt) : ${v.alt ? `« ${v.alt} »` : 'aucun, visuel décoratif'}`);
  if (v.note) lignes.push(`- **Note** : ${v.note}`);
  return lignes.join('\n');
}

function parSerie(sortie, liste, titre = (serie) => `### ${SERIES[serie]}`) {
  for (const serie of ORDRE_SERIES) {
    const l = liste.filter((v) => v.serie === serie);
    if (!l.length) continue;
    sortie.push(titre(serie), '');
    for (const v of l) sortie.push(fiche(v), '');
  }
}

/** Le contenu complet de docs/visuels-a-generer.md. Déterministe : pas de date. */
export function rendreCommande(visuels = VISUELS, racine = SITE) {
  const etat = etatDesVisuels(racine, visuels);
  const livres = new Set(etat.livres.map((v) => v.id));
  const socle = visuels.filter((v) => v.priorite === 'socle');
  const comptes = (liste) => Object.keys(METHODES).map((m) => `${m} ${liste.filter((v) => v.methode === m).length}`).join(' · ');

  const images = visuels.filter((v) => v.methode === 'IMG' && !estReprise(v));
  const imagesAFaire = images.filter((v) => !livres.has(v.id));
  const imagesLivrees = images.filter((v) => livres.has(v.id));
  const reprisesImages = visuels.filter((v) => v.methode === 'IMG' && estReprise(v));
  const equipe = visuels.filter((v) => v.methode !== 'IMG' && !estReprise(v));
  const equipeAFaire = equipe.filter((v) => !livres.has(v.id));
  const equipeFaite = equipe.filter((v) => livres.has(v.id));
  const autresReprises = visuels.filter((v) => v.methode !== 'IMG' && estReprise(v));

  const sortie = [];
  sortie.push('# Visuels à générer — commande de production', '');
  sortie.push(`> **Fichier généré** depuis \`site/src/config/visuels.ts\` et l’état du disque par ${code(COMMANDE)} (dans \`site/\`). Ne pas le corriger ici : corriger le registre ou livrer le fichier, puis relancer la commande. \`npm run visuels\` liste ce qu’il reste à produire, \`npm run visuels -- --verifier\` contrôle ce qui est livré.`, '');

  sortie.push('## La mission', '');
  sortie.push(`Tu produis **uniquement les images générées (IMG)** de la refonte du portfolio de Charles Lindecker : la **partie 1** en donne la file, « socle » d’abord, puis les fiches. Les autres fiches (dessins vectoriels, figures codées, captures, photos, images de partage) sont du contexte : l’équipe s’en charge (**partie 2**).`, '');
  sortie.push(`- Le registre recense **${visuels.length} emplacements** (${socle.length} « socle », ${visuels.length - socle.length} « élargi »), dont **${images.length} images à générer** : ${imagesAFaire.length} restent à livrer, dont ${imagesAFaire.filter((v) => v.priorite === 'socle').length} « socle ».`);
  sortie.push('- **Socle** : posé sur une page du site, qui affiche un cadre hachuré tant que le fichier manque. À produire d’abord.');
  sortie.push('- **Élargi** : aucune page ne l’attend encore ; chaque fiche dit pourquoi. Peut suivre.');
  sortie.push('- Le prompt d’une image se rédige en anglais : le bloc de style, la phrase de fond, puis la traduction des seuls champs **Sujet** et **Composition** de la fiche, enfin le prompt négatif. Le champ **Emplacement** donne le contexte et peut nommer une marque ou un jeu : il ne va jamais dans un prompt.', '');

  sortie.push('## Avant de commencer', '');
  sortie.push('**1. Le bloc de style**, identique pour tous les prompts, à recopier tel quel en tête :', '');
  sortie.push('```text', STYLE_PROMPT, '```', '');
  sortie.push('Suivi de la phrase de fond que la fiche demande :', '');
  sortie.push(`- fond transparent : ${code(FOND_PROMPT.transparent)}`);
  sortie.push(`- fond rempli d’aplat : ${code(FOND_PROMPT.aplat)}`, '');
  sortie.push('**2. Le prompt négatif**, joint à chaque génération :', '');
  sortie.push('```text', NEGATIVE_PROMPT, '```', '');
  sortie.push('**3. Les références à joindre** au générateur, pour la main du trait et le modèle de la lanterne :', '');
  for (const { fichier, role } of REFERENCES_STYLE) sortie.push(`- ${code(fichier)} : ${role}`);
  sortie.push('', `Un SVG se joint rendu en PNG : ${code('node -e "require(\'sharp\')(process.argv[1],{density:300}).png().toFile(process.argv[2])" <fichier.svg> <sortie.png>')} (dans \`site/\`).`, '');
  sortie.push(`**4. Étape 0, la planche d’essai** : générer d’abord ${PLANCHE_ESSAI.map(code).join(', ')}, une scène, une vignette de carte et une vignette de compétence, puis s’arrêter et les montrer à Charles. La série ne se lance qu’après sa validation du style, du trait et des couleurs de clé.`, '');
  sortie.push('**5. Une lanterne en gras** dans une fiche est une contrainte dure : la lumière animée du site part de ce point. La vérifier en calquant l’image livrée sur la position donnée (en % de la largeur et de la hauteur, depuis le coin haut gauche).', '');

  sortie.push('## Règles communes', '');
  REGLES_COMMUNES.forEach((regle, i) => sortie.push(`${i + 1}. ${regle}`));
  sortie.push('', 'Exceptions à la règle 3 : le nom dans les déclinaisons du logo, et les images de partage (OG), composées en vraie typographie.', '');

  sortie.push('## Séries', '');
  sortie.push('Chaque image générée appartient à une seule série : mêmes angle, horizon, trait et place de la lanterne pour toutes ses images, vues côte à côte. Une exception est écrite ici, jamais improvisée.', '');
  sortie.push('| Série | Images | Angle | Horizon | Trait | Lanterne |', '|---|---|---|---|---|---|');
  for (const f of FAMILLES) sortie.push(`| ${f.nom} | ${f.ids.join(', ')} | ${f.angle} | ${f.horizon} | ${f.trait} | ${f.lanterne} |`);
  sortie.push('');

  sortie.push('## Méthodes', '');
  sortie.push('| Méthode | Nature | Consigne |', '|---|---|---|');
  for (const [methode, { nom, consigne }] of Object.entries(METHODES)) sortie.push(`| ${methode} | ${nom} | ${consigne} |`);
  sortie.push('', '## Livraison', '');
  sortie.push(`- **Image générée** : le master PNG en trois couleurs de clé (encre ${code(CLES_CALQUES.encre)}, aplat ${code(CLES_CALQUES.aplat)}, lumière ${code(CLES_CALQUES.lumiere)}), à la définition du générateur et au ratio exact de la fiche (à 1 % près), dans ${code('design/assets/visuels/<série>/<ID>.png')}. Puis, dans \`site/\` : ${code('node tools/separer-calques.mjs <ID>')}. Le script met l’image aux dimensions exactes du nom et écrit, en WebP qualité 82 avec alpha, le rendu ${code('<ID>_<largeur>x<hauteur>.webp')} et ses trois calques ${code('.aplat.webp')}, ${code('.encre.webp')}, ${code('.lumiere.webp')}, que le site colore : ${CALQUES.map((c) => `${NOMS_CALQUES[c]} par ${code(JETONS_CALQUES[c])}`).join(', ')}.`);
  sortie.push(`- **Poids d’un WebP** (rendu et chaque calque), selon son plus grand côté : ${PLAFONDS_POIDS.map((p) => (Number.isFinite(p.cote) ? `${p.ko} Ko jusqu’à ${p.cote.toLocaleString('fr-FR')} px` : `${p.ko} Ko au-delà`)).join(', ')}.`);
  sortie.push('- **Dessin vectoriel** : `<ID>.svg`, au chemin attendu. Un lot est un sprite : un `<symbol id>` par pièce, aux identifiants listés par la fiche (« Pièces du fichier »).');
  sortie.push('- **Image de partage** : `public/og/<ID>_1200x630.png`, ou les fichiers nommés par la fiche quand elle en attend plusieurs.');
  sortie.push('- **Provenance** : pour chaque fichier, une ligne du tableau `Fichier | Prompt | Date | Provenance` de `design/assets/visuels/<série>/README.md` et de `site/src/assets/visuels/<série>/README.md`.');
  sortie.push('- **Vérifier** avec `npm run visuels -- --verifier` (dans `site/`) : dimensions annoncées par le nom, ratio, fond transparent, poids, calques, pièces d’un SVG. Puis relancer `npm run visuels:doc` : le visuel livré sort des files.', '');

  sortie.push('## Vue d’ensemble', '');
  sortie.push('| Série | Emplacements | Socle | Méthodes |', '|---|---|---|---|');
  for (const serie of ORDRE_SERIES) {
    const liste = visuels.filter((v) => v.serie === serie);
    if (liste.length) sortie.push(`| ${SERIES[serie]} | ${liste.length} | ${liste.filter((v) => v.priorite === 'socle').length} | ${comptes(liste)} |`);
  }
  sortie.push(`| **Total** | **${visuels.length}** | **${socle.length}** | ${comptes(visuels)} |`, '');

  sortie.push('## Partie 1 — Commande Codex : les images à générer', '');
  sortie.push(`**Déjà livrées** : ${imagesLivrees.length ? ids(imagesLivrees) : 'aucune'}.`, '');
  for (const [nom, prio] of [['File « socle »', 'socle'], ['File « élargi »', 'elargi']]) {
    sortie.push(`**${nom}**, dans l’ordre des séries :`, '');
    for (const serie of ORDRE_SERIES) {
      const l = imagesAFaire.filter((v) => v.serie === serie && v.priorite === prio);
      if (l.length) sortie.push(`- ${SERIES[serie]} : ${ids(l)}`);
    }
    sortie.push('');
  }
  parSerie(sortie, imagesAFaire.filter((v) => v.priorite === 'socle'), (s) => `### Socle · ${SERIES[s]}`);
  parSerie(sortie, imagesAFaire.filter((v) => v.priorite === 'elargi'), (s) => `### Élargi · ${SERIES[s]}`);
  sortie.push('### Reprises : rien à générer, mais leur cadrage contraint l’image d’origine', '');
  for (const v of reprisesImages) sortie.push(fiche(v), '');
  if (imagesLivrees.length) {
    sortie.push('### Images déjà livrées', '');
    for (const v of imagesLivrees) sortie.push(fiche(v), '');
  }

  sortie.push('## Partie 2 — À faire par l’équipe : dessins, figures, captures, partage', '');
  sortie.push('Rien ici n’est à générer : les dessins vectoriels s’écrivent à la main, les figures se codent depuis des données sourcées, les captures se prennent sur l’application ou la page réelle, les images de partage se composent en HTML.', '');
  sortie.push(`**Déjà faits** : ${ids(equipeFaite)}.`, '');
  sortie.push('| Zone | Socle | Élargi |', '|---|---|---|');
  const zones = [...ORDRE_SERIES.map((s) => [`équipe ${SERIES[s]}`, (v) => v.serie === s && producteur(v) === 'equipe']), ['Charles', (v) => producteur(v) === 'charles']];
  for (const [zone, filtre] of zones) {
    const l = equipeAFaire.filter(filtre);
    if (!l.length) continue;
    const cellule = (p) => l.filter((v) => v.priorite === p).map((v) => `${v.id} (${v.methode})`).join(', ') || '—';
    sortie.push(`| ${zone} | ${cellule('socle')} | ${cellule('elargi')} |`);
  }
  sortie.push('');
  parSerie(sortie, equipeAFaire);

  sortie.push('## Contexte : déjà faits, photos et reprises', '');
  sortie.push('Fiches pour mémoire : rien à produire.', '');
  parSerie(sortie, [...equipeFaite, ...autresReprises].sort((a, b) => visuels.indexOf(a) - visuels.indexOf(b)));
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
