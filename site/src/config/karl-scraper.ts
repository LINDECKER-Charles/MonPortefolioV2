/**
 * Données de Karl Scraper (/projets/karl-scraper) : la carte de la vitrine
 * (CARTE), puis les données de sa page. Ce fichier appartient à la page Karl
 * Scraper : config/vitrine.ts et lib/seo.ts ne font que l’importer.
 *
 * Dépôt privé (décision de Charles du 14/10/2026) : aucun lien, aucun nom de
 * dépôt. Le projet se présente sous l’angle de l’automatisation de tâches ;
 * l’outil qu’il lit se dit « un outil de gestion de tâches », sans jamais
 * nommer l’outil source, ses utilisateurs ni leurs projets, ni
 * aucun volume réel de tâches.
 *
 * Faits relus le 14/10/2026 à la révision 6615950 du dépôt (09/10/2026),
 * source notée à côté de chacun (chemins du dépôt privé). Ce qui est écrit
 * mais pas livré (le « dossier de tâche », au-delà de son lot 0) n’entre pas
 * ici ; les enchaînements sont livrés sans aucune règle : la page le dit.
 *
 * Captures : vraies vues de l’application lancée en local avec des données de
 * démonstration fictives, provisoires jusqu’à la refonte graphique de son
 * interface (src/assets/projets/karl-scraper/README.md).
 */
import type { EntreeSommaire } from './navigation';
import type { CarteVitrine } from './vitrine';
import type { Decision, DonneesFiche, LienProjet, PreuveEnTete, SchemaProjet } from '../components/projets/gabarit/types';
import galaxie from '../assets/projets/karl-scraper/galaxie.webp';
import angular from '../assets/stacks/angular.svg';
import dotnet from '../assets/stacks/dotnet.svg';
import sqlite from '../assets/stacks/sqlite.svg';

/* ------------------------------------------------------------------ */
/* La carte de la vitrine (/projets, famille « IA »)                   */
/* ------------------------------------------------------------------ */

export const CARTE: CarteVitrine = {
  besoin: 'Garder une copie locale de mes tâches, la donner à lire à des agents IA et automatiser le chemin d’un ticket jusqu’à sa pull request.',
  // Core/Automation/AutomationAction.cs et AutomationTrigger.cs @ 6615950 : 18 actions, 14 déclencheurs.
  chiffre: { valeur: '18', libelle: 'actions et 14 déclencheurs pour enchaîner les gestes d’un ticket', releve: '14 octobre 2026' },
  role: 'Conçu et développé seul',
  statut: { texte: 'Outil personnel, en usage quotidien' },
  liens: [],
  // backend/Directory.Build.props (net10.0) ; frontend Angular 22 ; EF Core et SQLite (Directory.Packages.props).
  technos: [
    { src: dotnet, alt: '.NET' },
    { src: angular, alt: 'Angular' },
    { src: sqlite, alt: 'SQLite' },
  ],
  // La Galaxie se lit à la taille d’une carte : une scène, pas un texte (KSC-C1).
  visuel: {
    capture: {
      type: 'navigateur',
      src: galaxie,
      alt: 'La Galaxie de Karl Scraper : des tâches fictives sur les anneaux de leur statut, les retards en rouge.',
      ratio: '16 / 10',
      position: '50% 45%',
      widths: [480, 800, 1200],
    },
  },
};

/* ------------------------------------------------------------------ */
/* En-tête (gabarit E5 · 1 et 2)                                       */
/* ------------------------------------------------------------------ */

export const EN_TETE = {
  titre: ['Automatiser le chemin d’un ticket.', 'Garder la main.'],
  chapeau:
    'Mes tâches vivent dans un outil de gestion de tâches en ligne. Karl Scraper en tient une copie locale, la donne à lire à des agents IA et enchaîne les gestes d’un ticket jusqu’à sa pull request, sans leur ouvrir l’outil source. Je l’ai conçu et développé seul.',
  liens: [] satisfies LienProjet[],
};

export const PREUVES: readonly PreuveEnTete[] = [
  {
    // Core/Automation/AutomationAction.cs (18 constantes) et AutomationTrigger.cs (14) @ 6615950.
    valeur: '18',
    libelle: 'actions et 14 déclencheurs pour enchaîner les gestes d’un ticket',
    source: 'Catalogue des enchaînements du dépôt',
    date: 'relevé le 14/10/2026',
    surligne: true,
    href: '#chaine',
  },
  {
    // Projet Mcp, Tools/*.cs @ 6615950 : 13 McpServerTool, dont 10 ReadOnly = true.
    valeur: '13',
    libelle: 'outils MCP pour les agents, dont 10 en lecture seule',
    source: 'Serveur MCP du dépôt',
    date: 'relevé le 14/10/2026',
    href: '#agent',
  },
  {
    // Liste blanche du client HTTP (MethodGuard) et docs/invariants/securite.md @ 6615950 : le PATCH du statut, seule écriture.
    valeur: '1',
    libelle: 'seule écriture admise vers l’outil source : le statut d’une tâche',
    source: 'Garde des appels réseau du dépôt',
    date: 'relevé le 14/10/2026',
    href: '#construit',
  },
];

export const FICHE: DonneesFiche = {
  besoin: 'Garder une copie locale de mes tâches, la donner à lire à des agents IA et automatiser le chemin d’un ticket jusqu’à sa pull request.',
  // git log @ 6615950 : 282 commits, un seul auteur, du 28/08 au 09/10/2026.
  part: 'J’ai conçu et développé seul le service, son serveur MCP et son interface : 282 commits en six semaines.',
  role: 'Conception et développement',
  periode: 'Depuis fin août 2026',
  equipe: 'Projet personnel, seul',
  statut: { texte: 'Outil personnel, en usage quotidien' },
  liens: [],
};

/** Les sections du corps : sommaire de l’en-tête et navigation de page. */
export const SECTIONS: readonly EntreeSommaire[] = [
  { id: 'copie', titre: 'Une copie locale' },
  { id: 'galaxie', titre: 'La Galaxie' },
  { id: 'agent', titre: 'Ce que l’agent lit' },
  { id: 'chaine', titre: 'Du ticket à la pull request' },
  { id: 'construit', titre: 'Comment je l’ai construit' },
  { id: 'retiens', titre: 'Où il en est' },
];

/* ------------------------------------------------------------------ */
/* Les écrans : alts et légendes (KSC-C1, données de démonstration)     */
/* ------------------------------------------------------------------ */

export const ECRANS = {
  enchainements: {
    alt: 'Les réglages des enchaînements : l’interrupteur général allumé, des plafonds de lancement, puis deux règles qui retiennent une lecture et la confient à Relais.',
    legende: 'Deux règles écrites pour la démonstration : retenir une lecture proposée, puis la confier à un agent. Un clic agrandit l’écran.',
  },
  tableauDeBord: {
    alt: 'Le tableau de bord sur trois projets fictifs : les tâches par projet, par statut, et l’écart avec l’observation précédente, cinq statuts changés et une tâche nouvelle.',
    legende: 'L’écart avec l’observation précédente : cinq statuts ont changé, une tâche est apparue.',
  },
  galaxie: {
    alt: 'La Galaxie : seize tâches fictives sur les anneaux de leur statut, deux en retard, le goulot à « À faire », et la frise des trois observations.',
    legende: 'Seize tâches de démonstration, de « À faire », à l’extérieur, à « À valider », au centre. La scène reste sombre, quel que soit le thème.',
  },
  vueAgent: {
    alt: 'L’onglet « Vue agent » d’une tâche fictive : la donnée exacte que le serveur MCP sert à un agent, figée sur une observation scellée.',
    legende: 'La tâche telle qu’un agent la lit, avec l’observation d’où elle vient.',
  },
} as const;

/* ------------------------------------------------------------------ */
/* Du ticket à la pull request (KSC-F1)                                 */
/* ------------------------------------------------------------------ */

/** Ce qu’une étape peut faire dans l’outil source : le lire, rien, ou y écrire le statut. */
export type AccesSource = 'lecture' | 'aucun' | 'statut';

export interface EtapeChaine {
  geste: string;
  /** Qui agit : le service, un agent, moi, ou une règle que j’ai écrite. */
  acteur: string;
  texte: string;
  acces: AccesSource;
}

/**
 * La chaîne d’un ticket, dans l’ordre, @ 6615950 : synchronisation et
 * observations scellées (docs/PLAN-snapshots-detail.md), préparation et
 * arbitrage (PLAN-preparation.md, PLAN-chaine-de-travail.md § 2), réalisation
 * (PLAN-realisation.md : un worktree et une PR par dépôt modifié), statut
 * (docs/invariants/securite.md : un clic, ou une règle écrite et activée).
 */
export const CHAINE: readonly EtapeChaine[] = [
  { geste: 'Synchroniser', acteur: 'Le service', texte: 'Relit mes tâches assignées et scelle une observation locale.', acces: 'lecture' },
  { geste: 'Comprendre', acteur: 'Un agent', texte: 'Lit la tâche par le serveur MCP, explore les dépôts en lecture et désigne le dépôt et le worktree.', acces: 'aucun' },
  { geste: 'Trancher', acteur: 'Moi, ou une règle que j’ai écrite', texte: 'Retenir ou écarter sa lecture : le seul arbitrage de la chaîne.', acces: 'aucun' },
  { geste: 'Réaliser', acteur: 'Un agent, lancé par Relais', texte: 'Travaille dans un worktree et ouvre une pull request par dépôt touché.', acces: 'aucun' },
  { geste: 'Poser le statut', acteur: 'Moi d’un clic, ou une règle', texte: 'Le statut de la tâche, relu dans la source juste avant.', acces: 'statut' },
];

/* ------------------------------------------------------------------ */
/* Comment je l’ai construit (gabarit E5 · 4)                          */
/* ------------------------------------------------------------------ */

export const DECISIONS: readonly Decision[] = [
  {
    // docs/invariants/securite.md:10-26 ; garde du client HTTP, sur liste blanche @ 6615950.
    contrainte: 'L’outil garde une session complète sur une application en production.',
    choix: 'Chaque appel réseau passe par une liste blanche : des lectures, plus une seule écriture, le statut d’une tâche, relu dans la source juste avant.',
    effet: 'Un défaut de l’outil ne peut modifier qu’un statut.',
  },
  {
    // Core/StorageServiceCollectionExtensions.cs:68-71 (Mode=ReadOnly) ; Tests/Architecture/McpIsolationTests.cs:13-15.
    contrainte: 'Un agent doit lire les tâches sans pouvoir appeler la source ni écrire dans la copie locale.',
    choix: 'Le serveur MCP tourne dans un processus à part, ouvre la base en lecture seule et ne connaît ni la synchronisation ni le navigateur.',
    effet: 'Un test d’architecture le vérifie à chaque build : la règle n’est pas qu’un commentaire.',
  },
  {
    // AGENTS.md (Stockage) ; docs/invariants/stockage.md:26-47 (magasin illisible en quarantaine, lecture seule).
    contrainte: 'Un agent doit raisonner sur un état figé, et aucune de mes décisions ne doit se perdre.',
    choix: 'Chaque passage scelle une observation, et le serveur MCP choisit la sienne à son lancement, jamais en cours de session. Un fichier de décisions illisible reste intact, en lecture seule, au lieu d’être lu vide puis écrasé.',
    effet: 'Deux appels identiques rendent la même réponse, et une décision prise ne se perd pas.',
  },
  {
    // PLAN-enchainements.md § 0, points 2-3 ; Core/Automation/AutomationHost.cs:32-40.
    contrainte: 'Enchaîner les gestes d’un ticket sans qu’une règle fasse ce que je n’aurais pas validé.',
    choix: 'Les déclencheurs et les actions vivent dans le code, les règles dans mes réglages. Une règle a les gardes d’un clic, relit la tâche dans la source et la pull request chez GitHub, cède au geste qui la contredit et ne défait jamais rien.',
    effet: 'Sans règle, l’outil se comporte comme avant, et un test le vérifie.',
  },
];

/* ------------------------------------------------------------------ */
/* Sortie (gabarit E5 · 5)                                             */
/* ------------------------------------------------------------------ */

/** Dépôt privé : aucun lien public. */
export const LIENS_SORTIE: readonly LienProjet[] = [];

/** Ce que schema.org dit du projet (lib/seo.ts) : un service local, sur macOS. */
export const SCHEMA: SchemaProjet = { type: 'SoftwareApplication', categorie: 'DeveloperApplication', systemes: 'macOS' };
