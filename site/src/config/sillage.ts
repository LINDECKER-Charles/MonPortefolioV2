/**
 * Données de Sillage (/projets/sillage) : la carte de la vitrine (CARTE),
 * puis les données de sa page. Ce fichier appartient à la page Sillage :
 * config/vitrine.ts et lib/seo.ts ne font que l’importer.
 *
 * Dépôt privé (décision de Charles du 14/10/2026) : aucun lien, aucun nom de
 * dépôt, aucune tâche réelle nommée. Faits relus le 14/10/2026 à la révision
 * c256e76 du dépôt (13/10/2026), sauf mention :
 *   - 579 agents, 63 500 appels d’outils (dont 1 004 en échec, à l’origine de
 *     sept blocages durs), 26 commandes Git bloquées, 39 blocages de commit :
 *     registre des blocages, l. 3-6 et 23-35, révision 9b4533a (05/10/2026) ;
 *   - 10 000 à 27 000 caractères par réponse : contrats de contexte,
 *     révision 480e358 ;
 *   - 2,19 milliards de tokens relus sur 79 sessions de trois tâches,
 *     compaction vers 270 000 : plan de contexte, l. 8-34, révision ae2efd8
 *     (12/10/2026) ;
 *   - découplage de Relais : rapport d’architecture, révision ed4080b ;
 *   - deux corrections au plus (MAX_REPAIRS), fenêtre de 300 000 tokens par
 *     défaut, 643 tests Rust : code du serveur à c256e76.
 * Les écrans : src/assets/projets/sillage/README.md (données de démonstration).
 */
import type { EntreeSommaire } from './navigation';
import type { CarteVitrine } from './vitrine';
import type { Decision, DonneesFiche, LienProjet, PreuveEnTete, SchemaProjet } from '../components/projets/gabarit/types';
import angular from '../assets/stacks/angular.svg';
import rust from '../assets/stacks/rust.svg';
import sqlite from '../assets/stacks/sqlite.svg';
import grapheEnDirect from '../assets/projets/sillage/graphe-en-direct.webp';

/* ------------------------------------------------------------------ */
/* La carte de la vitrine (/projets, famille « IA »)                   */
/* ------------------------------------------------------------------ */

export const CARTE: CarteVitrine = {
  besoin: 'Confier un long travail à plusieurs agents IA sans perdre la main : dessiner leur graphe, puis les lancer, les suivre et reprendre après une coupure.',
  // Registre des blocages, l. 3-6 @ 9b4533a (05/10/2026) : neuf exécutions réelles, du 26/09 au 03/10/2026.
  chiffre: { valeur: '579', libelle: 'agents lancés sur neuf exécutions réelles', releve: '14 octobre 2026' },
  role: 'Conçu et développé seul',
  statut: { texte: 'Outil personnel, en usage quotidien' },
  liens: [],
  technos: [
    { src: rust, alt: 'Rust', mono: true },
    { src: angular, alt: 'Angular' },
    { src: sqlite, alt: 'SQLite' },
  ],
  // La vue du graphe (SIL-C1), recadrée sur l’exécution : le rail de navigation sort du cadre.
  visuel: {
    capture: {
      type: 'navigateur',
      src: grapheEnDirect,
      // Passé tel quel à l’image : l’insécable avant « : » s’écrit ici.
      alt: 'Une exécution en direct dans Sillage : un coordinateur et les trois sous-agents qu’il a créés en cours de route.',
      ratio: '5 / 4',
      position: '76% 0',
    },
  },
};

/* ------------------------------------------------------------------ */
/* En-tête (gabarit E5 · 1 et 2)                                       */
/* ------------------------------------------------------------------ */

export const EN_TETE = {
  titre: 'Confier un long travail à des agents, sans perdre la main.',
  chapeau:
    'Sillage lance sur ma machine un graphe d’agents IA, chacun avec sa mission, ses dossiers et son livrable. Il les suit, leur fait corriger une réponse mal formée et reprend le travail après une coupure. Je l’ai conçu et développé seul.',
  liens: [] satisfies LienProjet[],
};

export const PREUVES: readonly PreuveEnTete[] = [
  {
    valeur: '579',
    libelle: 'agents lancés sur neuf exécutions réelles',
    source: 'Registre des blocages du dépôt',
    date: 'du 26/09 au 03/10/2026',
    surligne: true,
    href: '#retiens',
  },
  {
    valeur: '63\u00a0500',
    libelle: 'appels d’outils pendant ces neuf exécutions',
    source: 'Registre des blocages du dépôt',
    date: 'du 26/09 au 03/10/2026',
    href: '#sources',
  },
  {
    valeur: '643',
    libelle: 'tests du serveur, en Rust',
    source: 'Code du serveur',
    date: 'relevé le 14/10/2026',
    href: '#sources',
  },
];

export const FICHE: DonneesFiche = {
  besoin: 'Confier un long travail à plusieurs agents IA sans perdre la main.',
  part: 'J’ai conçu et développé seul le serveur en Rust, l’interface Angular et leurs tests.',
  role: 'Conception et développement',
  periode: 'Depuis septembre 2026',
  equipe: 'Projet personnel, seul',
  statut: { texte: 'Outil personnel, en usage quotidien' },
  liens: [],
};

/** Les sections du corps : sommaire de l’en-tête et navigation de page. */
export const SECTIONS: readonly EntreeSommaire[] = [
  { id: 'principe', titre: 'Le principe' },
  { id: 'composer', titre: 'Composer une tâche' },
  { id: 'reprendre', titre: 'Reprendre après une coupure' },
  { id: 'resultat', titre: 'Le résultat' },
  { id: 'construit', titre: 'Comment je l’ai construit' },
  { id: 'retiens', titre: 'Aujourd’hui' },
];

/* ------------------------------------------------------------------ */
/* Les écrans (SIL-C1) : ce que chacun prouve                          */
/* ------------------------------------------------------------------ */

export interface EcranSillage {
  /** Ce que la capture prouve ; la page le passe par typo(). */
  alt: string;
  legende: string;
}

export const ECRANS = {
  graphe: {
    alt: 'Une exécution en direct dans Sillage : le cadrage est terminé, un coordinateur a créé trois sous-agents en cours de route, la relecture finale attend.',
    legende: 'Une exécution en direct, sur un projet de démonstration. Un clic l’agrandit.',
  },
  projet: {
    alt: 'La page du projet Carnet de route dans Sillage : un assistant compose une tâche pendant qu’une exécution tourne, et quatre tâches avec leur état.',
    legende: 'La page d’un projet : une tâche en composition, une en cours, une interrompue, une terminée.',
  },
  composer: {
    alt: 'L’assistant de création compose une tâche dans Sillage : un agent est refusé parce que sa dépendance n’existe pas encore, puis ajouté dans le bon ordre.',
    legende: 'Une relecture refusée : elle dépend d’une équipe pas encore ajoutée.',
  },
  reprendre: {
    alt: 'Le dialogue Reprendre l’exécution de Sillage : l’étape interrompue reprend sa session encore active, une étape suit, un agent terminé garde son résultat.',
    legende: '« Construire l’index » reprend sa session ; « Analyser la recherche » garde son résultat.',
  },
  resultat: {
    alt: 'Le récapitulatif d’une exécution terminée dans Sillage : dossier, branche et commit du résultat, état des worktrees, puis le résumé, les décisions et les contrôles de chaque agent.',
    legende: 'Le résultat final, les worktrees, puis ce que chaque agent a rendu. Un clic montre le panneau entier.',
  },
} as const satisfies Record<string, EcranSillage>;

/* ------------------------------------------------------------------ */
/* Comment je l’ai construit (gabarit E5 · 4)                          */
/* ------------------------------------------------------------------ */

export const DECISIONS: readonly Decision[] = [
  {
    contrainte: 'Les agents rendaient de 10\u00a0000 à 27\u00a0000 caractères, quelle que soit la suite, et une réponse mal formée cassait la chaîne.',
    choix: 'Chaque agent rend un résultat court et structuré : résumé, décisions, contrôles, blocages, suite. Une réponse hors contrat lui revient dans la même session, avec l’erreur, deux fois au plus.',
    effet: 'Les agents suivants reçoivent des faits et des références, pas des transcriptions ; un blocage arrête la suite.',
    lien: { href: '#resultat', libelle: 'Le récapitulatif' },
  },
  {
    contrainte: 'Des agents en parallèle dans un même dossier se gênaient : 26 commandes Git bloquées sur un verrou, des commits réécrits par un autre agent. Les agents que leur bac à sable empêchait de committer ont bloqué 39 fois en trois exécutions.',
    choix: 'Sillage crée lui-même le worktree de chaque agent avant sa première session, le garde pour les suivantes, committe pour l’agent si besoin, puis fusionne.',
    effet: 'Un seul mécanisme règle les deux blocages. Seuls les worktrees propres et fusionnés sont nettoyés, jamais les branches.',
  },
  {
    contrainte: 'À chaque appel, toute la conversation de l’agent était relue : 2,19 milliards de tokens sur 79 sessions de trois tâches, et rien ne bornait une session.',
    choix: 'Chaque session demande à Relais une fenêtre de compaction, de 300\u00a0000 tokens par défaut, réglable ou désactivable.',
    effet: 'Une session se compacte vers 270\u00a0000 tokens au lieu de grossir jusqu’à la limite du modèle.',
  },
  {
    contrainte: 'Des notions propres à Sillage étaient entrées dans Relais, et Sillage allait lire le jeton de Relais dans son dossier.',
    choix: 'Relais n’expose que des capacités génériques. Sillage garde son schéma de création de tâche et ses validations, et reçoit le jeton par ses paramètres.',
    effet: 'Plus aucune lecture du dossier voisin : deux applications qui s’installent séparément, et un fournisseur que d’autres outils utilisent.',
    lien: { href: '/projets/relais', libelle: 'Relais' },
  },
];

/* ------------------------------------------------------------------ */
/* Sortie (gabarit E5 · 5)                                             */
/* ------------------------------------------------------------------ */

/** Dépôt privé : aucun lien public. */
export const LIENS_SORTIE: readonly LienProjet[] = [];

/** Ce que schema.org dit du projet (lib/seo.ts) : validé en intégration continue sur macOS et Windows. */
export const SCHEMA: SchemaProjet = { type: 'SoftwareApplication', categorie: 'DeveloperApplication', systemes: 'macOS, Windows' };
