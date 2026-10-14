/**
 * Données de Sillage (/projets/sillage) : la carte de la vitrine (CARTE),
 * puis les données de sa page. Ce fichier appartient à la page Sillage :
 * config/vitrine.ts et lib/seo.ts ne font que l’importer.
 *
 * Dépôt privé (décision de Charles du 14/10/2026) : aucun lien, aucun nom de
 * dépôt, aucune tâche réelle nommée. Faits relus le 14/10/2026 à la révision
 * c256e76 du dépôt (13/10/2026), sauf mention :
 *   - 579 agents, 63 500 appels d’outils, dont 1 004 en échec (l. 3-6), sept
 *     blocages durs (l. 23-31), 26 commandes Git bloquées (B5) et 39 blocages
 *     dus au bac à sable des agents (B1 : ni commit, ni navigateur, ni réseau,
 *     l. 25 et 74-82) : registre des blocages, révision 9b4533a (05/10/2026) ;
 *   - 10 000 à 27 000 caractères rendus quelle que soit la cible annoncée :
 *     contrats de contexte, l. 46-47, révision 480e358 ;
 *   - worktree créé par Sillage quand la mission le demande ou qu’un autre
 *     agent écrit en même temps dans le même dossier : worktrees/managed.rs ;
 *   - 2,19 milliards de tokens relus sur 79 sessions de trois tâches,
 *     compaction vers 270 000 : plan de contexte, l. 8-34, révision ae2efd8
 *     (12/10/2026) ;
 *   - découplage de Relais (trois lectures du dossier voisin dans le code
 *     exécuté, puis aucune) : rapport d’architecture, révision ed4080b ;
 *   - deux corrections au plus (MAX_REPAIRS), fenêtre de 300 000 tokens par
 *     défaut, 643 tests Rust joués en intégration continue sous Windows et
 *     macOS : code du serveur et workflow de compatibilité à c256e76.
 * Statut : « en usage sur ma machine » (dossier de faits, § 6) ; « en usage
 * quotidien » attend la réponse de Charles (docs/a-confirmer.md).
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
  besoin: 'Confier un long travail de développement à plusieurs agents IA sans perdre la main : dessiner leur graphe, puis suivre l’exécution et la reprendre après une coupure.',
  // Registre des blocages, l. 3-6 @ 9b4533a (05/10/2026) : neuf exécutions réelles, du 26/09 au 03/10/2026.
  chiffre: { valeur: '579', libelle: 'agents lancés sur neuf exécutions réelles', releve: '14 octobre 2026' },
  role: 'Conçu et développé seul',
  statut: { texte: 'Outil personnel, en usage sur ma machine' },
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
    'Sillage orchestre sur ma machine des agents IA qui écrivent du code. Je décris le travail comme un graphe : qui fait quoi, dans quel ordre, avec quels dossiers et quel livrable. Sillage suit les agents, leur fait corriger une réponse mal formée et reprend le travail après une coupure. Je l’ai conçu et développé seul.',
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
    href: '#retiens',
  },
  {
    valeur: '643',
    libelle: 'tests du serveur, en Rust',
    source: 'Code du serveur',
    date: 'relevé le 14/10/2026',
    href: '#construit',
  },
];

export const FICHE: DonneesFiche = {
  besoin: 'Confier un long travail de développement à plusieurs agents IA sans perdre la main.',
  part: 'J’ai conçu et développé seul le serveur en Rust, l’interface Angular et leurs tests.',
  role: 'Conception et développement',
  periode: 'Depuis septembre 2026',
  equipe: 'Projet personnel, seul',
  statut: { texte: 'Outil personnel, en usage sur ma machine' },
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
    alt: 'Une exécution en direct dans Sillage : un coordinateur a créé trois sous-agents en cours de route, au travail en même temps, et la relecture finale les attend.',
    legende: 'Une exécution en direct, sur un projet de démonstration. Un clic montre l’écran entier.',
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
  resultatMobile: {
    alt: 'Le récapitulatif d’une exécution terminée dans Sillage, en largeur de téléphone : dossier, branche et commit du résultat final.',
    legende: 'Le résultat final : le dossier, la branche, le commit.',
  },
} as const satisfies Record<string, EcranSillage>;

/* ------------------------------------------------------------------ */
/* Comment je l’ai construit (gabarit E5 · 4)                          */
/* ------------------------------------------------------------------ */

export const DECISIONS: readonly Decision[] = [
  {
    contrainte: 'Les agents rendent de 10\u00a0000 à 27\u00a0000 caractères, quelle que soit la cible qu’on leur annonce, et une seule réponse mal formée peut casser la chaîne.',
    choix: 'Chaque agent rend un résultat court et structuré : résumé, décisions, contrôles, blocages, suite. Une réponse hors du format attendu lui revient dans la même session, avec l’erreur, deux fois au plus.',
    effet: 'Les agents suivants reçoivent des faits et des références, pas des conversations entières ; un blocage arrête la suite.',
    lien: { href: '#resultat', libelle: 'Le récapitulatif' },
  },
  {
    contrainte: 'Des agents en parallèle dans un même dossier se gênaient : 26 commandes Git bloquées sur un verrou, des commits réécrits par un autre agent. Enfermés dans leur bac à sable, d’autres agents ne pouvaient ni committer, ni ouvrir un navigateur, ni joindre le réseau : 39 blocages en trois exécutions.',
    choix: 'Quand un agent en a besoin (sa mission le demande, ou un autre agent écrit en même temps dans le même dossier), Sillage crée lui-même son worktree avant sa première session, le garde pour les suivantes, committe pour l’agent si besoin, puis fusionne.',
    effet: 'Le même mécanisme committe pour les agents enfermés et sépare ceux qui écrivent en parallèle. Seuls les worktrees propres et fusionnés sont nettoyés, jamais les branches.',
  },
  {
    contrainte: 'À chaque appel, toute la conversation de l’agent était relue : 2,19 milliards de tokens, les unités de texte que lit le modèle, sur 79 sessions de trois tâches, et rien ne bornait une session.',
    choix: 'Chaque session demande à Relais une fenêtre de compaction, de 300\u00a0000 tokens par défaut, réglable ou désactivable : au-delà, sa conversation est résumée.',
    effet: 'Une session est résumée vers 270\u00a0000 tokens au lieu de grossir jusqu’à la limite du modèle.',
  },
  {
    contrainte: 'Des notions propres à Sillage étaient entrées dans Relais, et Sillage allait lire le jeton de Relais dans son dossier : trois lectures dans le code exécuté.',
    choix: 'Relais n’expose que des capacités génériques. Sillage garde son schéma de création de tâche et ses validations, et reçoit le jeton par ses paramètres.',
    effet: 'Plus aucune lecture du dossier voisin : deux applications qui s’installent séparément, et un point d’accès que d’autres outils utilisent.',
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
