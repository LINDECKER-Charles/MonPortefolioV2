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
import type { EntreeSommaire } from './navigation';
import type { CarteVitrine } from './vitrine';
import type { Decision, DonneesFiche, LienProjet, PreuveEnTete, SchemaProjet } from '../components/projets/gabarit/types';
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

/* ------------------------------------------------------------------ */
/* La page (ÉBAUCHE) : en-tête, fiche, sections, décisions, sortie      */
/* ------------------------------------------------------------------ */

export const EN_TETE = {
  titre: 'Confier un long travail à des agents, sans perdre la main.',
  chapeau:
    'Sillage lance un graphe d’agents IA, chacun avec sa consigne, ses dossiers et son livrable, puis les suit, corrige leurs réponses et reprend après une coupure, en local. Je l’ai conçu et développé seul.',
  liens: [] satisfies LienProjet[],
};

export const PREUVES: readonly PreuveEnTete[] = [
  {
    valeur: '579',
    libelle: 'agents lancés sur neuf exécutions réelles',
    source: 'Registre des blocages du dépôt',
    date: 'du 26/09 au 03/10/2026',
    surligne: true,
    href: '#construit',
  },
  {
    valeur: '300 000',
    libelle: 'tokens : la fenêtre de compaction par défaut de chaque session',
    source: 'Code du serveur',
    date: 'relevé le 14/10/2026',
    href: '#construit',
  },
];

export const FICHE: DonneesFiche = {
  besoin: 'Confier un long travail à plusieurs agents IA sans perdre la main.',
  part: 'J’ai conçu et développé seul le serveur en Rust et l’interface Angular.',
  role: 'Conception et développement',
  periode: 'Depuis septembre 2026',
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
    contrainte: 'Les agents rendaient de 10 000 à 27 000 caractères quelle que soit la cible, et une réponse mal formée cassait la chaîne.',
    choix: 'Chaque agent rend un résumé borné ; une réponse hors contrat lui est renvoyée dans la même session, avec l’erreur, deux fois au plus.',
    effet: 'Les agents suivants reçoivent des faits et des références, pas des transcriptions ; un blocage arrête la suite.',
  },
  {
    contrainte: 'Une session renvoyait toute sa conversation à chaque appel : 2,19 milliards de tokens relus sur 79 sessions.',
    choix: 'Chaque session demande une fenêtre de compaction, de 300 000 tokens par défaut, réglable.',
    effet: 'Une session se compacte vers 270 000 tokens au lieu de grossir jusqu’à la fenêtre du modèle.',
  },
];

/** Dépôt privé : aucun lien public. */
export const LIENS_SORTIE: readonly LienProjet[] = [];

/** Ce que schema.org dit du projet (lib/seo.ts) : validé en intégration continue sur macOS et Windows. */
export const SCHEMA: SchemaProjet = { type: 'SoftwareApplication', categorie: 'DeveloperApplication', systemes: 'macOS, Windows' };
