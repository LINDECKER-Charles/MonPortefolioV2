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
import type { CarteVitrine } from './vitrine';
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
