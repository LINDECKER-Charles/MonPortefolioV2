/**
 * ÉBAUCHE du socle : remplacée par la page du projet.
 *
 * Données de Sillage (/projets/sillage) : la carte de la vitrine (CARTE),
 * puis les données de sa page. Ce fichier appartient à la page Sillage :
 * config/vitrine.ts et lib/seo.ts ne font que l’importer.
 *
 * Dépôt privé (décision de Charles du 14/10/2026) : aucun lien, aucun nom de
 * dépôt. Faits relus le 14/10/2026 à la révision c256e76 du dépôt
 * (13/10/2026), sauf mention.
 */
import type { CarteVitrine } from './vitrine';
import angular from '../assets/stacks/angular.svg';
import rust from '../assets/stacks/rust.svg';
import sqlite from '../assets/stacks/sqlite.svg';

/* ------------------------------------------------------------------ */
/* La carte de la vitrine (/projets, famille « IA »)                   */
/* ------------------------------------------------------------------ */

export const CARTE: CarteVitrine = {
  besoin: 'Confier un long travail à plusieurs agents IA sans perdre la main : dessiner leur graphe, puis les lancer, les suivre et reprendre après une coupure.',
  // docs/blocages-agents.md:3-6 @ 9b4533a (05/10/2026) : neuf exécutions réelles, du 26/09 au 03/10/2026.
  chiffre: { valeur: '579', libelle: 'agents lancés sur neuf exécutions réelles', releve: '14 octobre 2026' },
  role: 'Conçu et développé seul',
  statut: { texte: 'Outil personnel, en usage quotidien' },
  liens: [],
  technos: [
    { src: rust, alt: 'Rust', mono: true },
    { src: angular, alt: 'Angular' },
    { src: sqlite, alt: 'SQLite' },
  ],
};
