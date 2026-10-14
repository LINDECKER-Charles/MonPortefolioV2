/**
 * Données de GitHealth (/projets/githealth) : la carte de la vitrine (CARTE),
 * puis les données de sa page. Ce fichier appartient à la page GitHealth :
 * config/vitrine.ts et lib/seo.ts ne font que l’importer.
 *
 * Dépôt public App.GitHealth (liste blanche, liens-publics.ts), relu le
 * 14/10/2026 à deux révisions : bd2e5c9 (tête de dev, 16/09/2026) et la
 * release v0.2.0 (4cd740d, 14/09/2026). Chaque fait vient de ses documents, à
 * ces révisions, ou de la page de la release ; un fait non sourcé n’entre pas
 * ici. Les preuves pointent vers des permaliens figés à la révision relevée,
 * pour qu’un lien ne change pas de sens avec le dépôt.
 *
 * Captures : vraies vues de l’application lancée en local sur des dépôts de
 * démonstration (src/assets/projets/githealth/README.md). L’interface est en
 * anglais ; légendes et alts disent en français ce qu’on y voit.
 */
import type { EntreeSommaire } from './navigation';
import type { CarteVitrine } from './vitrine';
import type { Decision, DonneesFiche, LienProjet, PreuveEnTete, SchemaProjet } from '../components/projets/gabarit/types';
import ficheBrancheCarte from '../assets/projets/githealth/vitrine-fiche-branche.webp';
import angular from '../assets/stacks/angular.svg';
import dotnet from '../assets/stacks/dotnet.svg';
import sqlite from '../assets/stacks/sqlite.svg';

/* ------------------------------------------------------------------ */
/* Liens publics                                                       */
/* ------------------------------------------------------------------ */

const DEPOT = 'https://github.com/LINDECKER-Charles/App.GitHealth';
/** Révision courante relevée : tête de dev, 16/09/2026. */
export const REVISION = 'bd2e5c9743cea30ff64498830191ed0d49ecfe52';
/** La release 0.2.0 du 14/09/2026 (tête de main). */
export const REVISION_0_2_0 = '4cd740df0f8dd0e56e7ff3ee92a7a75758f26624';
const fige = (chemin: string) => `${DEPOT}/blob/${REVISION}/${chemin}`;
const fige020 = (chemin: string) => `${DEPOT}/blob/${REVISION_0_2_0}/${chemin}`;

export const LIENS = {
  depot: DEPOT,
  version: `${DEPOT}/releases/tag/v0.2.0`,
  /** Banc de la 0.2.0 : 1 000 branches, topologie en 231 ms (P95) pour 850 ms, l. 76 ; l’enrichissement domine, environ 26 ms par branche, l. 78-79. */
  rapport: fige020('docs/release/0.2.0.md?plain=1#L76-L79'),
  /** Les quatre cibles natives de la release, l. 27 à 33. */
  cibles: fige020('.github/workflows/release.yml#L27-L33'),
  /** La console de l’analyse en direct, ajoutée par la 0.2.0, l. 24 à 32. */
  console: fige020('CHANGELOG.md?plain=1#L24-L32'),
  /** L’onglet Visualisation, ajouté par la 0.2.0, l. 95 à 103. */
  visualisation: fige020('CHANGELOG.md?plain=1#L95-L103'),
  /** Les six commandes Git différentes de l’analyse, toutes en lecture, l. 84-85 : for-each-ref, rev-list, merge-base, log, cat-file, rev-parse. */
  limites: fige('docs/KNOWN_LIMITATIONS.md?plain=1#L84-L85'),
  /** Faits et interprétation séparés, aucune action Git déclenchée, l. 103 à 119. */
  etats: fige('docs/ARCHITECTURE.md?plain=1#L103-L119'),
  /** Un processus, un port, une origine ; installation sans droits d’administrateur, l. 55 à 59. */
  structure: fige('docs/ARCHITECTURE.md?plain=1#L55-L59'),
  /** L’assistant : capture seule, pont en lecture, jeton par exécution, accord par dépôt, l. 65 à 71. */
  assistant: fige('docs/ARCHITECTURE.md?plain=1#L65-L71'),
  /** Les options passées à chaque appel de Git (réseau, identifiants, maintenance), l. 172 à 188. */
  appelsGit: fige('src/App.GitHealth.Api/Git/Process/GitProcessRunner.cs#L172-L188'),
  /** La topologie en un seul appel (atome ahead-behind), l. 52. */
  topologie: fige('src/App.GitHealth.Api/Git/Scanning/GitTopologyReader.cs#L52'),
  /** Le test de bout en bout : empreinte du dépôt identique avant et après, l. 52 à 54. */
  empreinte: fige('tests/App.GitHealth.E2E/specs/mvp-flow.spec.ts#L52-L54'),
  /** L’échelle des verdicts et l’échelle courte des branches fusionnées, l. 539 à 554. */
  verdicts: fige('docs/USER_GUIDE.md?plain=1#L539-L554'),
  /** L’effet projeté de la politique, sans relancer Git, l. 556 à 559. */
  politique: fige('docs/USER_GUIDE.md?plain=1#L556-L559'),
} as const;

/* ------------------------------------------------------------------ */
/* La carte de la vitrine (/projets, famille « Outils »)               */
/* ------------------------------------------------------------------ */

export const CARTE: CarteVitrine = {
  // README : « See which branches still matter — without touching the repository. »
  besoin: 'Voir quelles branches Git comptent encore, sans toucher au dépôt : tout se passe en local, sur la machine.',
  // docs/release/0.2.0.md:76 @ 4cd740d : banc de la release, runner Windows hébergé, budget de 850 ms.
  chiffre: { valeur: '231 ms', libelle: 'pour situer 1 000 branches par rapport à main', releve: '14 octobre 2026' },
  role: 'Conçu et développé seul',
  statut: { texte: 'Open source, version 0.2.0', etat: 'ouvert' },
  liens: [{ href: DEPOT, libelle: 'Code' }],
  technos: [
    { src: dotnet, alt: '.NET' },
    { src: angular, alt: 'Angular' },
    { src: sqlite, alt: 'SQLite' },
  ],
  // La fiche de branche de la capture 03, recadrée sans retouche : le verdict et la règle qui l’a donné.
  visuel: {
    capture: {
      type: 'navigateur',
      src: ficheBrancheCarte,
      alt: 'La fiche d’une branche dans GitHealth : verdict Review pour une histoire divergée, et la trace des règles qui l’ont donné.',
      ratioMobile: '1 / 1',
      widths: [400, 806],
      sizes: '(max-width: 860px) 100vw, 280px',
    },
  },
};

/* ------------------------------------------------------------------ */
/* En-tête (gabarit E5 · 1 et 2)                                       */
/* ------------------------------------------------------------------ */

export const EN_TETE = {
  titre: 'Voir quelles branches comptent, sans toucher au dépôt.',
  chapeau:
    'Une application de bureau qui lit un dépôt Git en local, sans jamais l’écrire, et dit pour chaque branche ce qu’on peut en faire, avec la règle qui l’a décidé. Je l’ai conçue et développée seul, et je la publie en open source.',
  liens: [{ href: DEPOT, libelle: 'Le code' }] satisfies LienProjet[],
};

export const PREUVES: readonly PreuveEnTete[] = [
  {
    valeur: '231 ms',
    libelle: 'pour situer 1 000 branches par rapport à main (commits en plus et en moins), dans 95 % des mesures',
    source: 'Rapport de la version 0.2.0',
    date: '14/09/2026',
    surligne: true,
    href: '#construit',
  },
  {
    valeur: '6',
    libelle: 'commandes Git différentes pour toute l’analyse, toutes en lecture',
    source: 'Limites connues du dépôt',
    date: 'relevé le 14/10/2026',
    href: '#analyse',
  },
  {
    valeur: '4',
    libelle: 'cibles natives par version : Windows, macOS (Intel et Apple Silicon) et Linux',
    source: 'Publication de la version 0.2.0',
    date: '14/09/2026',
    href: '#retiens',
  },
];

export const FICHE: DonneesFiche = {
  besoin: 'Savoir quelles branches d’un dépôt Git comptent encore, sans risquer de le modifier.',
  part: 'J’ai conçu et développé seul l’application : le produit, l’architecture, l’interface, l’intégration continue et la distribution.',
  role: 'Auteur et mainteneur',
  periode: 'Depuis août 2026',
  equipe: 'Projet personnel, mené seul',
  statut: { texte: 'Open source, version 0.2.0', etat: 'ouvert' },
  liens: [
    { href: DEPOT, libelle: 'Le code' },
    { href: LIENS.version, libelle: 'La version 0.2.0' },
  ],
};

/** Les sections du corps : sommaire de l’en-tête et navigation de page. */
export const SECTIONS: readonly EntreeSommaire[] = [
  { id: 'verdicts', titre: 'Les verdicts' },
  { id: 'politique', titre: 'La politique' },
  { id: 'analyse', titre: 'L’analyse en direct' },
  { id: 'visualisation', titre: 'Les visualisations' },
  { id: 'construit', titre: 'Comment je l’ai construit' },
  { id: 'retiens', titre: 'Aujourd’hui' },
];

/* ------------------------------------------------------------------ */
/* Les verdicts : ce que disent les étiquettes anglaises de l’écran    */
/* ------------------------------------------------------------------ */

/**
 * Les cinq recommandations de l’application, dans son vocabulaire (l’écran
 * est en anglais), et ce qu’elles veulent dire. Règles : guide de
 * l’utilisateur, l. 539 à 554, la règle affichée par le registre d’activité
 * (activity-view.html, l. 195) et le classeur qui les applique
 * (BranchClassifier.cs, l. 108 à 134), à la révision bd2e5c9. Les seuils de
 * 7 et 30 jours portent sur l’âge du dernier commit de la branche, pas sur la
 * date de sa fusion ; « à jour » : au même commit que la base.
 */
export const VERDICTS: readonly { libelle: string; sens: string }[] = [
  { libelle: 'Keep', sens: 'elle porte des commits que la base n’a pas, n’a aucun retard sur elle, et n’est pas inactive.' },
  { libelle: 'Done', sens: 'fusionnée ou au même commit que la base, dernier commit d’il y a 7 jours au plus : rien à faire pour l’instant.' },
  { libelle: 'Review', sens: 'divergée, sans ancêtre commun, inactive, ou fusionnée (ou au même commit que la base) avec un dernier commit de 7 à 30 jours.' },
  { libelle: 'Cleanup possible', sens: 'fusionnée ou au même commit que la base, sans commit depuis plus de 30 jours : la supprimer ne perd aucun commit.' },
  { libelle: 'Excluded', sens: 'écartée par un motif protégé ou exclu de la politique.' },
];

/* ------------------------------------------------------------------ */
/* Les captures du corps : ce qu’elles prouvent                        */
/* ------------------------------------------------------------------ */

type Coin = 'bas-droite' | 'bas-gauche' | 'haut-droite' | 'haut-gauche';

/**
 * Coordonnées en pourcentages de l’image (CaptureAnnotee) : `cible` dans la
 * vue, `loupe.x/y` au centre du détail agrandi. La loupe de la fiche de
 * branche montre l’âge et la conclusion, pas la ligne de commande que
 * l’application coupe en deux (README de provenance).
 */
export const CAPTURES = {
  entete: {
    alt: 'Le diagnostic d’un dépôt de démonstration : 17 branches, dont 4 à garder, 2 terminées, 6 à revoir, 2 à nettoyer et 3 écartées, avec l’écart de chacune.',
    legende: 'Un dépôt de démonstration de 17 branches : chaque ligne donne l’écart avec main, sa forme (en avance, divergée, fusionnée), l’activité et le verdict. Un clic agrandit l’écran.',
  },
  verdicts: {
    alt: 'La fiche de la branche feature/advanced-search : verdict Review, puis les règles appliquées, de la divergence (+3 / −12) à l’âge du dernier commit.',
    legende: 'Dernier commit il y a 55 jours, entre les seuils de 30 et 90 jours : la règle est écrite en clair, avec ses seuils.',
    cible: { x: 76, y: 42.9 },
    loupe: { x: 87.4, y: 46.3, zoom: 4.1, largeur: 60, ratio: '4 / 1', coin: 'bas-gauche' as Coin, dessous: true },
  },
  politique: {
    alt: 'La politique d’un dépôt : seuils de 30 et 90 jours, un motif protégé, un motif exclu, et leur effet projeté sur la dernière analyse : Review −3, Excluded +3.',
    legende: 'Deux motifs ajoutés, pas encore enregistrés : trois branches passeraient de Review à Excluded.',
  },
  analyse: {
    alt: 'Une analyse en cours sur 169 branches, à mi-chemin : le registre se remplit, la carte des branches se dessine et la console liste les commandes git merge-base lancées.',
    legende: 'Une analyse prise en cours, à 106 branches sur 169 : la loupe montre deux appels à git merge-base, chacun avec sa durée en millisecondes.',
    cible: { x: 77.6, y: 65 },
    loupe: { x: 86.2, y: 76.5, zoom: 4.5, largeur: 60, ratio: '3 / 1', coin: 'bas-gauche' as Coin, dessous: true },
  },
  topologie: {
    alt: 'La carte des branches d’un dépôt de démonstration : neuf branches partent de main à des moments différents, de 64 à 16 commits de retard.',
    legende: 'La carte des branches : plus un trait est long, plus la branche s’est éloignée de main.',
  },
  activite: {
    alt: 'Le registre d’activité : pour chaque branche, le silence depuis son dernier commit, les bandes de 30 et 90 jours, et le verdict recalculé.',
    legende: 'Le registre d’activité : deux curseurs déplacent les seuils et relisent chaque verdict, sans rien enregistrer.',
  },
} as const;

/* ------------------------------------------------------------------ */
/* Comment je l’ai construit (gabarit E5 · 4)                          */
/* ------------------------------------------------------------------ */

export const DECISIONS: readonly Decision[] = [
  {
    contrainte: 'Un diagnostic ne doit jamais devenir une modification du dépôt observé.',
    choix: 'Git en ligne de commande, lancé sans passer par un interpréteur de commandes et limité à six commandes de lecture différentes ; chaque appel coupe le réseau, les identifiants et la maintenance automatique.',
    effet: 'Un test de bout en bout relève l’empreinte du dépôt avant et après tout le parcours : références, journaux, index et copie de travail restent identiques.',
    lien: { href: LIENS.empreinte, libelle: 'Le test d’empreinte' },
  },
  {
    contrainte: 'Livrer une application de bureau sur trois systèmes sans surveiller deux processus.',
    choix: 'Le serveur sert l’API et l’interface à une seule adresse locale, et ouvre la fenêtre du système dans le même processus.',
    effet: 'Un seul processus et une seule adresse locale ; l’installation se fait pour l’utilisateur, sans droits d’administrateur.',
    lien: { href: LIENS.structure, libelle: 'Les choix de structure' },
  },
  {
    contrainte: 'Rester rapide sur un dépôt de plusieurs centaines de branches.',
    choix: 'La position de toutes les branches par rapport à main se calcule en un seul appel à Git, avec un repli au parallélisme borné pour les versions anciennes ; un banc de mesure tient des budgets de durée.',
    effet: 'La position de 1 000 branches par rapport à main se lit en 231 ms dans 95 % des mesures, pour un budget de 850 ms. Reste l’étape la plus longue, le relevé des auteurs de chaque branche : environ 26 ms par branche sur le même banc.',
    lien: { href: LIENS.rapport, libelle: 'Le banc de la version 0.2.0' },
  },
  {
    contrainte: 'Un agent IA peut aider à lire un diagnostic, sans toucher au dépôt ni recevoir de données sans accord.',
    choix: 'Un accord par dépôt, vérifié par l’API. L’agent tourne dans un dossier vide, en lecture seule, et n’interroge qu’une analyse enregistrée, avec un jeton valable le temps d’une exécution.',
    effet: 'C’est la seule fonction qui envoie des données du dépôt hors de la machine, et elle reste facultative ; la lecture seule tient même si l’agent est un programme tiers.',
    lien: { href: LIENS.assistant, libelle: 'L’architecture de l’assistant' },
  },
];

/* ------------------------------------------------------------------ */
/* Sortie (gabarit E5 · 5)                                             */
/* ------------------------------------------------------------------ */

export const LIENS_SORTIE: readonly LienProjet[] = [
  { href: DEPOT, libelle: 'Le code de GitHealth' },
  { href: LIENS.version, libelle: 'La version 0.2.0 et ses installeurs' },
];

/** Ce que schema.org dit du projet (lib/seo.ts) : quatre cibles natives, Windows, macOS et Linux. */
export const SCHEMA: SchemaProjet = { type: 'SoftwareApplication', categorie: 'DeveloperApplication', systemes: 'Windows, macOS, Linux' };
