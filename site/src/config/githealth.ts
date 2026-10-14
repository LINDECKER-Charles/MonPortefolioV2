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
import type { CarteVitrine } from './vitrine';
import angular from '../assets/stacks/angular.svg';
import dotnet from '../assets/stacks/dotnet.svg';
import sqlite from '../assets/stacks/sqlite.svg';

/* ------------------------------------------------------------------ */
/* Liens publics                                                       */
/* ------------------------------------------------------------------ */

const DEPOT = 'https://github.com/LINDECKER-Charles/App.GitHealth';

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
