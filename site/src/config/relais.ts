/**
 * ÉBAUCHE du socle : remplacée par la page du projet.
 *
 * Données de Relais (/projets/relais) : la carte de la vitrine (CARTE), puis
 * les données de sa page. Ce fichier appartient à la page Relais :
 * config/vitrine.ts et lib/seo.ts ne font que l’importer.
 *
 * Dépôt privé (décision de Charles du 14/10/2026) : aucun lien, aucun nom de
 * dépôt. Faits relus le 14/10/2026 à la révision bdf041f du dépôt
 * (14/10/2026), sauf mention.
 */
import type { CarteVitrine } from './vitrine';
import angular from '../assets/stacks/angular.svg';
import rust from '../assets/stacks/rust.svg';
import sqlite from '../assets/stacks/sqlite.svg';

/* ------------------------------------------------------------------ */
/* La carte de la vitrine (/projets, famille « IA »)                   */
/* ------------------------------------------------------------------ */

export const CARTE: CarteVitrine = {
  besoin: 'Donner à tous les outils de ma machine un seul point d’accès local à Claude Code et à Codex, avec des abonnements isolés, leurs quotas et leurs permissions.',
  // docs/registre-correctifs.md, l. 3-6 : la base après trois jours de service (21-23/09/2026).
  chiffre: { valeur: '1 011', libelle: 'décisions de permission en trois jours de service', releve: '14 octobre 2026' },
  role: 'Conçu et développé seul',
  statut: { texte: 'Outil personnel, en usage quotidien' },
  liens: [],
  technos: [
    { src: rust, alt: 'Rust', mono: true },
    { src: angular, alt: 'Angular' },
    { src: sqlite, alt: 'SQLite' },
  ],
};
