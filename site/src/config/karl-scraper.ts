/**
 * ÉBAUCHE du socle : remplacée par la page du projet.
 *
 * Données de Karl Scraper (/projets/karl-scraper) : la carte de la vitrine
 * (CARTE), puis les données de sa page. Ce fichier appartient à la page Karl
 * Scraper : config/vitrine.ts et lib/seo.ts ne font que l’importer.
 *
 * Dépôt privé (décision de Charles du 14/10/2026) : aucun lien, aucun nom de
 * dépôt. Le projet se présente sous l’angle de l’automatisation de tâches ;
 * l’outil qu’il lit se dit « un outil de gestion de tâches », sans jamais
 * nommer l’outil source, ses utilisateurs ni leurs projets.
 * Faits relus le 14/10/2026 à la révision 6615950 du dépôt (09/10/2026).
 */
import type { EntreeSommaire } from './navigation';
import type { CarteVitrine } from './vitrine';
import type { Decision, DonneesFiche, LienProjet, PreuveEnTete, SchemaProjet } from '../components/projets/gabarit/types';
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
  technos: [
    { src: dotnet, alt: '.NET' },
    { src: angular, alt: 'Angular' },
    { src: sqlite, alt: 'SQLite' },
  ],
};

/* ------------------------------------------------------------------ */
/* La page (ÉBAUCHE) : en-tête, fiche, sections, décisions, sortie      */
/* ------------------------------------------------------------------ */

export const EN_TETE = {
  titre: 'Automatiser le chemin d’un ticket.',
  chapeau:
    'Mes tâches vivent dans un outil de gestion de tâches en ligne. Karl Scraper en tient une copie locale, la donne à lire à des agents IA et enchaîne les gestes d’un ticket, de sa lecture à sa pull request. Je l’ai conçu et développé seul.',
  liens: [] satisfies LienProjet[],
};

export const PREUVES: readonly PreuveEnTete[] = [
  {
    valeur: '18',
    libelle: 'actions et 14 déclencheurs pour enchaîner les gestes d’un ticket',
    source: 'Catalogue des enchaînements du dépôt',
    date: 'relevé le 14/10/2026',
    surligne: true,
    href: '#apercu',
  },
  {
    valeur: '13',
    libelle: 'outils MCP pour les agents, dont 10 en lecture seule',
    source: 'Serveur MCP du dépôt',
    date: 'relevé le 14/10/2026',
    href: '#construit',
  },
];

export const FICHE: DonneesFiche = {
  besoin: 'Garder une copie locale de mes tâches, la donner à lire à des agents IA et automatiser le chemin d’un ticket.',
  part: 'J’ai conçu et développé seul le service, son serveur MCP et son interface.',
  role: 'Conception et développement',
  periode: 'Depuis août 2026',
  equipe: 'Projet personnel, seul',
  statut: { texte: 'Outil personnel, en usage quotidien' },
  liens: [],
};

/** Les sections du corps : sommaire de l’en-tête et navigation de page. */
export const SECTIONS: readonly EntreeSommaire[] = [
  { id: 'apercu', titre: 'En bref' },
  { id: 'construit', titre: 'Comment je l’ai construit' },
  { id: 'retiens', titre: 'Ce que j’en retiens' },
];

export const DECISIONS: readonly Decision[] = [
  {
    contrainte: 'L’outil garde une session complète sur une application en production.',
    choix: 'Chaque appel réseau passe par une liste blanche : les lectures, plus une seule écriture, le statut d’une tâche, relu dans la source juste avant.',
    effet: 'Un défaut de l’outil ne peut modifier qu’un statut.',
  },
  {
    contrainte: 'Un agent doit lire les tâches sans pouvoir appeler la source ni écrire dans la copie locale.',
    choix: 'Le serveur MCP tourne dans un processus à part, ouvre la base en lecture seule et ne connaît ni la synchronisation ni le navigateur.',
    effet: 'Un test d’architecture le vérifie à chaque build : la règle n’est pas qu’un commentaire.',
  },
];

/** Dépôt privé : aucun lien public. */
export const LIENS_SORTIE: readonly LienProjet[] = [];

/** Ce que schema.org dit du projet (lib/seo.ts) : un service local, sur macOS. */
export const SCHEMA: SchemaProjet = { type: 'SoftwareApplication', categorie: 'DeveloperApplication', systemes: 'macOS' };
