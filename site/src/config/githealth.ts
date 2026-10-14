/**
 * ÉBAUCHE du socle : remplacée par la page du projet.
 *
 * Données de GitHealth (/projets/githealth) : la carte de la vitrine (CARTE),
 * puis les données de sa page. Ce fichier appartient à la page GitHealth :
 * config/vitrine.ts et lib/seo.ts ne font que l’importer.
 *
 * Dépôt public App.GitHealth (liste blanche, liens-publics.ts), relu le
 * 14/10/2026 : révision bd2e5c9 (tête de dev, 16/09/2026) et release v0.2.0
 * (4cd740d, 14/09/2026). Chaque fait vient de ses documents, à ces révisions ;
 * un fait non sourcé n’entre pas ici.
 */
import type { EntreeSommaire } from './navigation';
import type { CarteVitrine } from './vitrine';
import type { Decision, DonneesFiche, LienProjet, PreuveEnTete, SchemaProjet } from '../components/projets/gabarit/types';
import angular from '../assets/stacks/angular.svg';
import dotnet from '../assets/stacks/dotnet.svg';
import sqlite from '../assets/stacks/sqlite.svg';

/* ------------------------------------------------------------------ */
/* Liens publics                                                       */
/* ------------------------------------------------------------------ */

const DEPOT = 'https://github.com/LINDECKER-Charles/App.GitHealth';
/** Révision courante relevée : tête de dev, 16/09/2026. */
const REVISION = 'bd2e5c9743cea30ff64498830191ed0d49ecfe52';
/** La release 0.2.0 du 14/09/2026 (tête de main). */
const REVISION_0_2_0 = '4cd740df0f8dd0e56e7ff3ee92a7a75758f26624';

export const LIENS = {
  depot: DEPOT,
  version: `${DEPOT}/releases/tag/v0.2.0`,
  /** Banc et recette de la 0.2.0 : 1 000 branches, topologie en 231 ms (P95), l. 76. */
  rapport: `${DEPOT}/blob/${REVISION_0_2_0}/docs/release/0.2.0.md`,
  architecture: `${DEPOT}/blob/${REVISION}/docs/ARCHITECTURE.md`,
  /** Les six commandes Git de l’analyse, toutes en lecture (l. 84-85). */
  limites: `${DEPOT}/blob/${REVISION}/docs/KNOWN_LIMITATIONS.md`,
} as const;

/* ------------------------------------------------------------------ */
/* La carte de la vitrine (/projets, famille « Outils »)               */
/* ------------------------------------------------------------------ */

export const CARTE: CarteVitrine = {
  // README : « See which branches still matter — without touching the repository. »
  besoin: 'Voir quelles branches Git comptent encore, sans toucher au dépôt : une application de bureau qui travaille en local.',
  // docs/release/0.2.0.md:76 @ 4cd740d : banc de la release, runner Windows hébergé, budget de 850 ms.
  chiffre: { valeur: '231', libelle: 'millisecondes pour lire la topologie de 1 000 branches', releve: '14 octobre 2026' },
  role: 'Conçu et développé seul',
  statut: { texte: 'Open source, version 0.2.0', etat: 'ouvert' },
  liens: [{ href: DEPOT, libelle: 'Code' }],
  technos: [
    { src: dotnet, alt: '.NET' },
    { src: angular, alt: 'Angular' },
    { src: sqlite, alt: 'SQLite' },
  ],
  // En attendant sa capture : l’illustration de l’ancienne rangée « Aussi ».
  visuel: { visuel: 'PRJ-06' },
};

/* ------------------------------------------------------------------ */
/* La page (ÉBAUCHE) : en-tête, fiche, sections, décisions, sortie      */
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
    libelle: 'pour lire la topologie de 1 000 branches (P95), pour un budget de 850 ms',
    source: 'Rapport de la version 0.2.0',
    date: 'banc du 14/09/2026',
    surligne: true,
    href: '#construit',
  },
  {
    valeur: '6',
    libelle: 'commandes Git, toutes en lecture',
    source: 'Limites connues du dépôt',
    date: 'relevé le 14/10/2026',
    href: '#construit',
  },
];

export const FICHE: DonneesFiche = {
  besoin: 'Voir quelles branches Git comptent encore, sans toucher au dépôt.',
  part: 'J’ai conçu et développé seul l’application : le produit, l’architecture, l’interface, l’intégration continue et la distribution.',
  role: 'Auteur et mainteneur',
  periode: 'Depuis août 2026',
  equipe: 'Projet personnel, seul',
  statut: { texte: 'Open source, version 0.2.0', etat: 'ouvert' },
  liens: [
    { href: DEPOT, libelle: 'Le code' },
    { href: LIENS.version, libelle: 'La version 0.2.0' },
  ],
};

/** Les sections du corps : sommaire de l’en-tête et navigation de page. */
export const SECTIONS: readonly EntreeSommaire[] = [
  { id: 'apercu', titre: 'En bref' },
  { id: 'construit', titre: 'Comment je l’ai construit' },
  { id: 'retiens', titre: 'Ce que j’en retiens' },
];

export const DECISIONS: readonly Decision[] = [
  {
    contrainte: 'Un diagnostic ne doit jamais devenir une modification du dépôt observé.',
    choix: 'Git en ligne de commande, sans shell, limité à six commandes de lecture, chaque appel coupé du réseau et de la maintenance automatique.',
    effet: 'Le dépôt est relu avant et après l’analyse : références, journaux, index et copie de travail restent identiques.',
    lien: { href: LIENS.architecture, libelle: 'L’architecture, à la révision relevée' },
  },
  {
    contrainte: 'Livrer une application de bureau sur trois systèmes sans surveiller deux processus.',
    choix: 'Le serveur sert l’API et l’interface sur une seule origine, et ouvre la fenêtre du système dans le même processus.',
    effet: 'Un processus, un port, une origine : la sécurité reste simple, et l’installeur se passe des droits d’administrateur.',
  },
];

export const LIENS_SORTIE: readonly LienProjet[] = [
  { href: DEPOT, libelle: 'Le code de GitHealth' },
  { href: LIENS.version, libelle: 'La version 0.2.0 et ses installeurs' },
];

/** Ce que schema.org dit du projet (lib/seo.ts) : quatre cibles natives, Windows, macOS et Linux. */
export const SCHEMA: SchemaProjet = { type: 'SoftwareApplication', categorie: 'DeveloperApplication', systemes: 'Windows, macOS, Linux' };
