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
  // Sourcé : le service tourne sur mon poste (127.0.0.1:5177, relevé le 14/10/2026). L’usage
  // quotidien attend la réponse de Charles (K3) : la carte n’a pas de marque par champ.
  statut: { texte: 'Outil personnel, en service sur mon poste' },
  liens: [],
  // backend/Directory.Build.props (net10.0) ; frontend Angular 22 ; EF Core et SQLite (Directory.Packages.props).
  technos: [
    { src: dotnet, alt: '.NET' },
    { src: angular, alt: 'Angular' },
    { src: sqlite, alt: 'SQLite' },
  ],
  // La Galaxie se lit à la taille d’une carte : une scène, pas un texte (KSC-C1).
  // Entière, à son ratio natif (16:9) : un recadrage trancherait ses libellés.
  visuel: {
    capture: {
      type: 'navigateur',
      src: galaxie,
      alt: 'La Galaxie de Karl Scraper : des tâches fictives sur les anneaux de leur statut, les retards en rouge.',
      widths: [480, 800, 1200],
    },
  },
};

/* ------------------------------------------------------------------ */
/* En-tête (gabarit E5 · 1 et 2)                                       */
/* ------------------------------------------------------------------ */

export const EN_TETE = {
  // Second vers propre au projet (aucun agent n’ouvre l’outil source), pas la formule de Sillage (K5).
  titre: ['Automatiser le chemin d’un ticket.', 'Sans ouvrir l’outil aux agents.'],
  chapeau:
    'Mes tâches vivent dans un outil de gestion de tâches en ligne. Karl Scraper en tient une copie locale, la donne à lire à des agents IA et enchaîne les gestes d’une tâche, du ticket à sa pull request, sans leur ouvrir l’outil source. Je l’ai conçu et développé seul.',
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
    libelle: 'outils donnés à un agent IA, dont 10 en lecture seule',
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
  part: 'J’ai conçu et développé seul le service, le serveur qui sert les tâches aux agents et l’interface : 282 commits en six semaines.',
  role: 'Conception et développement',
  periode: 'Depuis fin août 2026',
  equipe: 'Projet personnel, seul',
  // Le service tourne sur mon poste (relevé le 14/10/2026) ; « en usage quotidien » attend K3.
  statut: { texte: 'Outil personnel, en service sur mon poste' },
  liens: [],
  aConfirmer: { equipe: 'Présentation en projet personnel à confirmer par Charles (K1)' },
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
    legende: 'Deux règles écrites pour la démonstration : retenir la compréhension qu’un agent propose (une « lecture », à l’écran), puis la confier à un agent. Un clic agrandit l’écran.',
  },
  tableauDeBord: {
    alt: 'Le tableau de bord sur trois projets fictifs : les tâches par projet, par statut, et l’écart avec l’observation précédente, cinq statuts changés et une tâche nouvelle.',
    legende: 'L’écart avec l’observation précédente : cinq statuts ont changé, une tâche est apparue.',
  },
  galaxie: {
    alt: 'La Galaxie : seize tâches fictives sur les anneaux de leur statut, deux en retard, le goulot à « À faire », et la frise des trois observations.',
    legende: 'En haut, le compte : seize tâches de démonstration, dont deux en retard, et le goulot. L’anneau extérieur est « À faire », le centre « À valider ».',
  },
  vueAgent: {
    alt: 'L’onglet « Vue agent » d’une tâche fictive : la donnée exacte que le serveur MCP sert à un agent, figée sur une observation scellée.',
    legende: 'L’observation d’où vient la donnée que montre l’onglet « Vue agent » : la « snapshot » de l’écran, avec son identifiant et sa date.',
  },
} as const;

/* ------------------------------------------------------------------ */
/* Du ticket à la pull request (KSC-F1)                                 */
/* ------------------------------------------------------------------ */

/** Ce qu’une étape peut faire dans l’outil source : le lire, rien, ou y écrire le statut. */
export type AccesSource = 'lecture' | 'aucun' | 'statut';

export interface EtapeChaine {
  geste: string;
  /** Qui agit : le service, un agent, moi, ou une règle écrite et activée. */
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
 * L’agent qui prépare ne passe pas par le serveur MCP : le service recopie
 * le cache dans le dossier de son lancement (TicketCorpus) et il n’a que
 * Read, Glob et Grep (docs/invariants/agents.md:84-90, preparation.md:167-168).
 * Les acteurs disent ce que l’outil permet, pas mon usage (K3).
 */
export const CHAINE: readonly EtapeChaine[] = [
  { geste: 'Synchroniser', acteur: 'Le service', texte: 'Relit mes tâches assignées et scelle une observation locale.', acces: 'lecture' },
  { geste: 'Comprendre', acteur: 'Un agent', texte: 'Lit la tâche dans un dossier que le service lui prépare, explore les dépôts en lecture et désigne le dépôt et le worktree où la faire.', acces: 'aucun' },
  { geste: 'Trancher', acteur: 'Moi, ou une règle écrite et activée', texte: 'Retient ou écarte sa compréhension : le seul arbitrage avant que du code s’écrive.', acces: 'aucun' },
  { geste: 'Réaliser', acteur: 'Un agent, lancé par Relais', texte: 'Travaille dans un worktree et ouvre une pull request par dépôt touché.', acces: 'aucun' },
  { geste: 'Poser le statut', acteur: 'Moi d’un clic, ou une règle activée', texte: 'Écrit le statut de la tâche, relu dans la source juste avant.', acces: 'statut' },
];

/* ------------------------------------------------------------------ */
/* Comment je l’ai construit (gabarit E5 · 4)                          */
/* ------------------------------------------------------------------ */

export const DECISIONS: readonly Decision[] = [
  {
    // docs/invariants/securite.md:10-26 ; garde du client HTTP vers l’outil source (KarlGuardHandler,
    // KarlMethodGuard), sur liste blanche @ 6615950. Les appels vers Relais, Sillage et GitHub n’y passent pas.
    contrainte: 'L’outil garde une session complète sur une application en production.',
    choix: 'Chaque appel vers l’outil source passe par une liste blanche : des lectures, plus une seule écriture, le statut d’une tâche, relu dans la source juste avant.',
    effet: 'Un défaut de l’outil ne peut modifier qu’un statut.',
  },
  {
    // Core/StorageServiceCollectionExtensions.cs:68-71 (Mode=ReadOnly) ; Tests/Architecture/McpIsolationTests.cs:13-15.
    // trigger_sync (Mcp/Tools/SyncTools.cs:50-66) demande un passage au service, qui seul lit la source.
    // Aucune CI à 6615950 : le test tourne avec la suite de tests, pas « à chaque build ».
    contrainte: 'Un agent doit lire les tâches sans appeler lui-même la source ni écrire dans la copie locale.',
    choix: 'Le serveur MCP tourne dans un processus à part, ouvre la base en lecture seule et ne connaît ni la synchronisation ni le navigateur.',
    effet: 'Un test d’architecture le vérifie à chaque passage des tests : la règle n’est pas qu’un commentaire.',
  },
  {
    // AGENTS.md (Stockage) ; docs/invariants/stockage.md:26-47 (magasin illisible en quarantaine, lecture seule) ;
    // docs/PLAN-snapshots-detail.md:296-301 (source `live` par défaut, `latest` ou un run ; pas de `pin_snapshot` ;
    // chaque réponse porte sa source).
    contrainte: 'Un agent doit pouvoir raisonner sur un état figé, et aucune de mes décisions ne doit se perdre.',
    choix: 'Chaque passage scelle une observation, et le serveur MCP fixe sa source à son lancement, le cache vivant ou une observation scellée, jamais en cours de session ; chaque réponse dit d’où elle vient. Un fichier de décisions illisible reste intact, en lecture seule, au lieu d’être lu vide puis écrasé.',
    effet: 'Sur une observation, deux appels identiques rendent la même réponse, et une décision prise ne se perd pas.',
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
