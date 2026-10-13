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
  CLES,
  COULEURS_CLE,
  familleDe,
  FAMILLES,
  fichierMaster,
  fichierMasterNuit,
  fichierNuit,
  FOND_PROMPT,
  METHODES,
  MOINS_GENERE,
  NOMS_CLES,
  NEGATIVE_PROMPT,
  LANTERNE_PROMPT,
  NUIT_EDITION_PROMPT,
  NUIT_FOND_PROMPT,
  NUIT_PROMPT,
  ORDRE_SERIES,
  PLANCHE_ESSAI,
  PLAFONDS_POIDS,
  positionLanterne,
  producteur,
  REFERENCES_STYLE,
  REGLES_COMMUNES,
  REGLES_NUIT,
  RENDUS,
  STYLE_PROMPT,
  sujetPourGenerateur,
  TOLERANCE_LANTERNE,
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
const NOMS_COULEURS = { encre: 'encre', aplat: 'aplat', lumiere: 'lumière' };
/** « encre (`#000000`) → `--encre` », pour chaque clé d’un rendu. */
const correspondances = (rendu, nom = (cle) => `${NOMS_COULEURS[cle]} (${code(COULEURS_CLE[cle])})`) => CLES.map((cle) => `${nom(cle)} → ${code(RENDUS[rendu].jetons[cle])}`).join(', ');
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
  const lanterne = v.methode === 'IMG' && !estReprise(v) ? positionLanterne(v) : null;
  if (v.lumiere) lignes.push(`- **Lanterne : ${v.lumiere[0]} % × ${v.lumiere[1]} %, contrainte dure** : la lumière animée du site part de ce point (largeur × hauteur, depuis le coin haut gauche). À ${TOLERANCE_LANTERNE} % près, vérifiée en calquant le jour et la nuit avant de livrer.`);
  else if (lanterne) lignes.push(`- **Lanterne : ${lanterne[0]} % × ${lanterne[1]} %** (largeur × hauteur, depuis le coin haut gauche), à ${TOLERANCE_LANTERNE} % près, vérifiée en calquant le jour et la nuit avant de livrer.`);
  if (v.calques) lignes.push(`- **Couleurs de clé, le jour** : ${CLES.map((cle) => `${NOMS_COULEURS[cle]} (${COULEURS_CLE[cle]}) = ${v.calques[cle]}`).join(' ; ')} · **Fond** : ${v.fond === 'transparent' ? 'transparent, de jour comme de nuit' : 'rempli d’aplat'}`);
  if (v.cadrage) lignes.push(`- **Cadrage (pour vérifier)** : ${v.cadrage}`);
  lignes.push(`- **Format** : ${v.format}${v.ratioMobile ? ` (recadrage mobile ${v.ratioMobile.replace(' / ', ':')})` : ''}`);
  if (estReprise(v)) lignes.push(`- **Fichier attendu** : aucun, reprend ${v.reprend.map(code).join(', ')}`);
  else if (v.declinaisons?.length) lignes.push(`- **Fichiers attendus** (${v.declinaisons.length}) : ${v.declinaisons.map((d) => `${code(`site/${d.fichier}`)}${d.alt ? ` (alt « ${d.alt} »)` : ''}`).join(' ; ')}`);
  else if (v.methode === 'FIG') lignes.push(v.fichier ? `- **Composant** : ${code(`site/${v.fichier}`)}` : '- **Composant** : aucun, figure à coder');
  else if (v.fichier) {
    lignes.push(`- **Fichier attendu** : ${code(`site/${v.fichier}`)}${v.lot ? ` (lot de ${v.lot})` : ''}`);
    const nuit = fichierNuit(v);
    if (nuit) {
      lignes.push(`- **Masters** : jour ${code(fichierMaster(v))} ; nuit ${code(fichierMasterNuit(v))}, en édition depuis le jour, même cadrage au pixel près`);
      lignes.push(`- **Rendus** : ${code(`npm run visuels:rendre ${v.id}`)} écrit le jour ${code(path.posix.basename(v.fichier))} et la nuit ${code(path.posix.basename(nuit))}`);
    }
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
  sortie.push('**Ce document est la seule référence de la série.** Il porte les retours de Charles sur la planche d’essai du 13 octobre 2026 (moins « image générée », une vraie version de nuit) et remplace toute consigne antérieure. Lis-le de haut en bas avant la première image.', '');
  sortie.push(`- **Deux masters par image**, dessinés au même cadrage au pixel près, dans les trois mêmes couleurs de clé : le jour ${code('<ID>.png')}, puis la nuit ${code('<ID>.nuit.png')}, faite **en édition depuis le master de jour** (section « Version de nuit »). Le site affiche l’un ou l’autre selon le thème.`);
  sortie.push(`- Le registre recense **${visuels.length} emplacements** (${socle.length} « socle », ${visuels.length - socle.length} « élargi »), dont **${images.length} images à générer** : ${imagesAFaire.length} restent à livrer, dont ${imagesAFaire.filter((v) => v.priorite === 'socle').length} « socle ».`);
  sortie.push('- **Socle** : posé sur une page du site, qui affiche un cadre hachuré tant que le fichier manque. À produire d’abord.');
  sortie.push('- **Élargi** : aucune page ne l’attend encore ; chaque fiche dit pourquoi. Peut suivre.');
  sortie.push('- **Le prompt de jour** se rédige en anglais : le bloc de style, la phrase de fond, puis la traduction des seuls champs **Sujet** et **Composition** de la fiche, le calage de la lanterne quand la fiche la place, enfin le prompt négatif. Le champ **Emplacement** donne le contexte et peut nommer une marque ou un jeu : il ne va jamais dans un prompt.');
  sortie.push('- **Le prompt de nuit** est une édition du master de jour, joint en image 1 : le bloc de style, la phrase de fond de nuit, le prompt d’édition, la consigne d’édition, enfin le prompt négatif (section « Version de nuit »).', '');

  sortie.push('## Le déroulé', '');
  sortie.push(`1. **Étape 0, la planche d’essai** : ${PLANCHE_ESSAI.map(code).join(', ')} (une scène, une vignette de carte, une vignette de compétence), **en jour et en nuit**, six masters rendus par ${code(`npm run visuels:rendre ${PLANCHE_ESSAI.join(' ')}`)}, **validée par Charles le 13 octobre 2026** : ses masters sont la référence du trait, de la nuit et des couleurs de clé. Avant toute nouvelle série ou tout changement de style, refaire une planche de trois images de la même façon, puis **t’arrêter** et la montrer à Charles : la série ne se lance qu’après sa validation.`);
  sortie.push('2. **La file « socle »** de la partie 1, **série par série**, dans l’ordre donné (la file « élargi » seulement si Charles la demande). Pour chaque image, dans l’ordre :');
  sortie.push('   1. générer le **master de jour** (prompt de jour) et le relire contre les règles « Moins image générée » ;');
  sortie.push(`   2. **vérifier la lanterne** : à la position de la fiche, à ${TOLERANCE_LANTERNE} % près (voir « Avant de commencer », point 4) ; sinon, régénérer ;`);
  sortie.push('   3. générer le **master de nuit en édition** depuis ce master de jour (prompt de nuit) et le relire contre les règles « Version de nuit », lanterne comprise ;');
  sortie.push(`   4. déposer les deux masters dans ${code('design/assets/visuels/<série>/')} sous ${code('<ID>.png')} et ${code('<ID>.nuit.png')}, puis lancer ${code('npm run visuels:rendre <ID>')} dans \`site/\` : il refuse un master au mauvais ratio ou une nuit d’autres dimensions que le jour.`);
  sortie.push(`3. **À la fin de chaque série** : une ligne de provenance par master (section « Livraison »), ${code('npm run visuels -- --verifier')} sans écart, ${code('npm run visuels:doc')}, puis **un commit pour la série**.`, '');

  sortie.push('## Avant de commencer', '');
  sortie.push('**1. Le bloc de style**, identique pour tous les prompts de jour, à recopier tel quel en tête :', '');
  sortie.push('```text', STYLE_PROMPT, '```', '');
  sortie.push('Suivi de la phrase de fond que la fiche demande :', '');
  sortie.push(`- fond transparent : ${code(FOND_PROMPT.transparent)}`);
  sortie.push(`- fond rempli d’aplat : ${code(FOND_PROMPT.aplat)}`, '');
  sortie.push('**2. Le prompt négatif**, joint à chaque génération, de jour comme de nuit :', '');
  sortie.push('```text', NEGATIVE_PROMPT, '```', '');
  sortie.push('**3. Les références à joindre** au générateur, pour la main du trait et le modèle de la lanterne :', '');
  for (const { fichier, role } of REFERENCES_STYLE) sortie.push(`- ${code(fichier)} : ${role}`);
  sortie.push('', `Un SVG se joint rendu en PNG : ${code('node -e "require(\'sharp\')(process.argv[1],{density:300}).png().toFile(process.argv[2])" <fichier.svg> <sortie.png>')} (dans \`site/\`).`, '');
  sortie.push(`**4. La lanterne à la position de la fiche, à ${TOLERANCE_LANTERNE} % près.** Chaque fiche qui la place donne sa position en % de la largeur et de la hauteur, depuis le coin haut gauche (ligne **Lanterne**). Le prompt de jour la cale par cette phrase, ${code('{x}')} et ${code('{y}')} remplacés par la position de la fiche :`, '');
  sortie.push('```text', LANTERNE_PROMPT, '```', '');
  sortie.push(`Avant de livrer, la vérifier en calquant, sur le master de jour comme sur celui de nuit : mesurer en pixels le centre de la flamme rouge, isolée des hachures qu’elle éclaire, le diviser par la largeur et par la hauteur de l’image ; l’écart à la fiche ne dépasse pas ${TOLERANCE_LANTERNE} points dans chaque sens. Une lanterne **contrainte dure** est celle d’une scène animée : la lumière du site part de ce point. Une lanterne mal placée se corrige en édition, sur une copie de contrôle où un repère marque la cible ; le repère ne reste jamais dans le master.`, '');

  sortie.push('## Moins « image générée »', '');
  sortie.push('Retour de Charles sur la planche d’essai : le rendu fait « un peu trop IA par moment ». Chaque master, de jour comme de nuit, se relit contre ces règles avant d’être déposé :', '');
  for (const regle of MOINS_GENERE) sortie.push(`- ${regle}`);
  sortie.push('', 'Ces règles priment sur la composition d’une fiche : une feuille, une page ou une plaque reste vierge, ou ne porte que des formes simples (case, croix, coche, flèche, cercle) ; une lumière qui « éclaire » se dessine en hachures rouges ; un trajet est un fin pointillé.', '');

  sortie.push('## Version de nuit', '');
  sortie.push(`Le master de nuit ${code('<ID>.nuit.png')} se fait **en édition**, avec le master de jour validé joint en image 1 et les références de style en images 2 à 5, jamais en nouvelle génération. Le prompt de nuit enchaîne le bloc de style (« Avant de commencer », point 1), la phrase de fond de nuit que la fiche demande, à la place de celle du jour :`, '');
  sortie.push(`- fond transparent : ${code(NUIT_FOND_PROMPT.transparent)}`);
  sortie.push(`- fond rempli d’aplat : ${code(NUIT_FOND_PROMPT.aplat)}`, '');
  sortie.push('puis le prompt d’édition, à recopier tel quel :', '');
  sortie.push('```text', NUIT_PROMPT, '```', '');
  sortie.push('puis la consigne d’édition selon le fond, enfin le prompt négatif. Fond rempli d’aplat :', '');
  sortie.push('```text', NUIT_EDITION_PROMPT.aplat, '```', '');
  sortie.push('Fond transparent :', '');
  sortie.push('```text', NUIT_EDITION_PROMPT.transparent, '```', '');
  sortie.push('Ces textes sont ceux des 74 paires livrées le 13 octobre 2026 (prompts exacts dans `design/assets/visuels/<série>/README.md`). Le master de nuit se relit contre ces règles :', '');
  for (const regle of REGLES_NUIT) sortie.push(`- ${regle}`);
  sortie.push('');

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
  sortie.push(`- **Image générée** : deux masters PNG en trois couleurs de clé (${CLES.map((cle) => `${NOMS_COULEURS[cle]} ${code(COULEURS_CLE[cle])}`).join(', ')}), à la définition du générateur et au ratio exact de la fiche (à 1 % près), de mêmes dimensions au pixel près : le jour ${code('design/assets/visuels/<série>/<ID>.png')}, la nuit ${code('design/assets/visuels/<série>/<ID>.nuit.png')}. Puis, dans \`site/\` : ${code('npm run visuels:rendre <ID>')}. Le script contrôle le ratio et les dimensions des deux masters, les met aux dimensions exactes du nom et écrit, en WebP qualité 82 avec alpha (débarrassé du bruit du générateur), aux couleurs lues dans ${code('src/styles/jetons.css')} :`);
  sortie.push(`  - le rendu de jour ${code('<ID>_<largeur>x<hauteur>.webp')}, depuis le master de jour, thème clair : ${correspondances('jour')} ;`);
  sortie.push(`  - le rendu de nuit ${code('<ID>_<largeur>x<hauteur>.nuit.webp')}, depuis le master de nuit, thème nuit : ${correspondances('nuit', (cle) => `${NOMS_CLES[cle]} ${code(COULEURS_CLE[cle])}`)}.`);
  sortie.push(`- **Sans master de nuit**, le script écrit une nuit de repli « clair de lune » tirée du jour, sans inversion (${correspondances('repli')}), et le signale : ce n’est pas une livraison, \`npm run visuels\` la liste jusqu’à ce que le master de nuit arrive.`);
  sortie.push(`- **Poids d’un WebP** (chacun des deux rendus), selon son plus grand côté : ${PLAFONDS_POIDS.map((p) => (Number.isFinite(p.cote) ? `${p.ko} Ko jusqu’à ${p.cote.toLocaleString('fr-FR')} px` : `${p.ko} Ko au-delà`)).join(', ')}. Un rendu plus lourd en qualité 82 est réencodé, pour lui seul, à la qualité qui le fait tenir (pas de 2, jamais sous 50), et le script le signale ; un master trop chargé pour tenir même à 50 est à simplifier.`);
  sortie.push('- **Dessin vectoriel** : `<ID>.svg`, au chemin attendu. Un lot est un sprite : un `<symbol id>` par pièce, aux identifiants listés par la fiche (« Pièces du fichier »).');
  sortie.push('- **Image de partage** : `public/og/<ID>_1200x630.png`, ou les fichiers nommés par la fiche quand elle en attend plusieurs.');
  sortie.push('- **Provenance** : pour chaque fichier, une ligne du tableau `Fichier | Prompt | Date | Provenance` de `design/assets/visuels/<série>/README.md` et de `site/src/assets/visuels/<série>/README.md`.');
  sortie.push('- **Vérifier** avec `npm run visuels -- --verifier` (dans `site/`) : dimensions annoncées par le nom, ratio, fond transparent, poids, présence des deux rendus et des deux masters d’une image générée, au même cadrage ; pièces d’un SVG. Une nuit de repli y est un écart : il manque le master de nuit. Puis relancer `npm run visuels:doc` : le visuel livré sort des files.');
  sortie.push('- **Commit par série** : les masters, les rendus, les lignes de provenance et cette commande régénérée, en un commit Conventional Commits en français (section « commit » d’`AGENTS.md`), par exemple `feat(site): livrer les images de la série « Compétences humaines »`. Jamais d’image d’essai écartée dans un commit.', '');

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
    const file = imagesAFaire.filter((v) => v.priorite === prio);
    if (!file.length) {
      sortie.push(`**${nom}** : vide, toutes ses images sont livrées. Une image à refaire se reprend depuis sa fiche (« Images déjà livrées ») et remplace ses deux masters.`, '');
      continue;
    }
    sortie.push(`**${nom}**, dans l’ordre des séries :`, '');
    for (const serie of ORDRE_SERIES) {
      const l = file.filter((v) => v.serie === serie);
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
