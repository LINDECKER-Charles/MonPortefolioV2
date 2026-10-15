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
 * quotidien » n’est pas sourcé : la page ne le dit pas (statut validé le
 * 15/10/2026, docs/prive/questions.md, J).
 * Les écrans : src/assets/projets/sillage/README.md (données de démonstration).
 */
import type { EntreeSommaire } from './navigation';
import type { CarteVitrine } from './vitrine';
import type { PointCapot, DonneesFiche, LienProjet, PreuveEnTete, SchemaProjet } from '../components/projets/gabarit/types';
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
  { id: 'fonctions', titre: 'Ses fonctions' },
  { id: 'construit', titre: 'Sous le capot' },
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
/* Sous le capot (gabarit E5 · 4)                                      */
/* ------------------------------------------------------------------ */

/**
 * Relus le 15/10/2026 à la même révision c256e76 : README (« Utiliser
 * l’orchestrateur », « Permissions et fonctionnement »), docs/api.md,
 * docs/context-contracts.md et le code cité à côté de chaque point. Les
 * extraits sont écrits pour la page (dépôt privé) : formes simplifiées, sans
 * code recopié ni chemin de la machine.
 */

/** Ce que fait Sillage, fonction par fonction (section « fonctions »). */
export const FONCTIONS: readonly PointCapot[] = [
  {
    // README, « Utiliser l’orchestrateur », 1 et 2.
    titre: 'Des projets, et les dossiers qu’ils confient',
    texte: 'Un projet donne ses permissions globales : les dossiers en lecture et en écriture que recevront toutes ses tâches, choisis avec le sélecteur du système. Une tâche peut ajouter ses propres dossiers, jamais en retirer, et ils ne changent pas pendant qu’elle s’exécute.',
  },
  {
    // README, « Utiliser l’orchestrateur », 3 et 4 ; agents dynamiques.
    titre: 'Composer un graphe d’agents',
    texte: 'Chaque agent a sa mission, ses ressources, son livrable, son modèle et son effort. Un agent déterministe garde une place fixe ; un agent dynamique répartit son travail entre des sous-agents qu’il crée en cours de route. Les liaisons vont d’une sortie à une entrée, et les cycles sont refusés. Un contexte commun et une méthode de travail s’ajoutent au message de chaque agent.',
  },
  {
    // docs/estimation-duree.md.
    titre: 'Estimer la durée avant de lancer',
    texte: 'À chaque agent, effort ou liaison changé, l’éditeur rejoue le graphe avec la session typique de chaque modèle et de chaque effort, tirée des exécutions passées, sous les limites de parallélisme : une durée typique et sa fourchette.',
  },
  {
    // README l. 229-272 ; docs/task-creation.md.
    titre: 'Créer ou planifier avec un agent',
    texte: 'Un assistant compose la tâche par les outils MCP que Sillage lui ouvre, un agent par appel, dans un brouillon visible en direct. Un autre écrit un plan dans le dépôt du projet ; plan, création et exécution peuvent s’enchaîner sans moi.',
  },
  {
    // README, 5 ; docs/DESIGN-NOTES.md (Supervision).
    titre: 'Suivre une exécution en direct',
    texte: 'Le graphe montre les agents actifs et les sous-agents dès leur création, avec leur consommation. Le suivi distingue les sessions, les attentes datées et leurs causes ; le journal des erreurs réunit ce qui a échoué ; les échanges montrent, dans l’ordre, le message exact reçu par chaque agent et sa réponse.',
  },
  {
    // README, « Navigateur des agents » ; docs/retours-visuels.md.
    titre: 'Donner un navigateur aux agents',
    texte: 'Un agent dont la mission parle de navigateur reçoit un Chromium sans interface, à lui seul, par les outils de Playwright MCP : il ouvre les pages du projet, clique, saisit et capture l’écran. Les retours visuels montrent l’exécution en images, étape par étape.',
  },
  {
    // README, 6 (« Reprendre »).
    titre: 'Reprendre, relancer, restaurer',
    texte: 'Après une coupure, un arrêt ou un échec, la reprise relance les étapes non abouties et se rattache aux sessions restées actives chez Relais. « Relancer depuis cet agent » repart de n’importe quelle étape ; « Voir ce qui a changé » compare la tâche à son exécution, et une définition exécutée se restaure.',
  },
  {
    // README, 5 (Récapitulatif, Exécutions) ; docs/historique-projet.md.
    titre: 'Retrouver le résultat et l’historique',
    texte: 'Le récapitulatif désigne le résultat final, worktree, branche et commit, puis ce que chaque agent a fait, et se copie en Markdown pour une pull request. Les exécutions se comparent et se regroupent en sprint ; l’historique du projet donne la durée, les tokens et l’équivalent API de chaque action.',
  },
  {
    // docs/assistant-projet.md.
    titre: 'Un assistant pour chaque projet',
    texte: 'Une conversation gardée par projet : il répond sur le projet, ses tâches et ses exécutions, et ses actions s’affichent en cartes, une idée notée, un fait retenu, un plan ou une exécution lancés.',
  },
  {
    // README, « Permissions et fonctionnement » (veille, worktrees, stockage).
    titre: 'Garder la machine éveillée, nettoyer derrière',
    texte: 'Tant qu’un agent travaille, Sillage empêche la mise en veille et le dit. À la fin d’une exécution aboutie, il supprime les worktrees propres et fusionnés, jamais les branches ; un panneau liste les autres, avec ce qui les retient.',
  },
];

export const CAPOT: readonly PointCapot[] = [
  {
    // backend/Cargo.toml (Axum 0.8, Tokio, rusqlite 0.38 bundled) ; docs/api.md l. 1-30 et 2504 (SSE, quatre envois par seconde au plus).
    groupe: 'Architecture',
    titre: 'Un serveur Rust, une interface Angular, un flux SSE',
    texte: 'Le serveur, en Rust (Axum et Tokio), garde l’état en mémoire et le persiste dans un SQLite embarqué. Il n’écoute que la boucle locale : toutes les routes de l’API demandent un jeton, et les en-têtes Host et Origin doivent être locaux. L’interface Angular reçoit l’état par un flux SSE, un instantané après chaque modification enregistrée, quatre envois par seconde au plus.',
    extrait: {
      ecrit: true,
      langage: 'Schéma',
      // Aligné à gauche, branches empilées : tient en 35 colonnes, la largeur d’un téléphone.
      code: `interface Angular 22
 ↓ HTTP + jeton
 ↑ SSE : l’état,
   ≤ 4 envois par seconde
serveur Rust (Axum, Tokio)
├▶ SQLite embarqué
├▶ Relais, par HTTP + jeton
└▶ assistants, par outils MCP
   (création, plan)
agents ◀ Playwright MCP :
   un navigateur chacun`,
    },
  },
  {
    // README, agents dynamiques ; backend/src/delegation.rs, group.rs.
    groupe: 'Architecture',
    titre: 'Un coordinateur planifie, le serveur vérifie',
    texte: 'Un agent dynamique inventorie les unités de travail de sa mission et les répartit entre le plus petit nombre de sous-agents utile. Avant d’en lancer un seul, le serveur contrôle le plafond, la couverture des unités, les champs délégués et les couples modèle et effort autorisés ; un plan refusé revient au coordinateur, dans la même session, deux fois au plus. Un sous-agent perdu rend le groupe partiel, sans perdre le travail des autres.',
  },
  {
    // backend/src/provider.rs l. 600-610 (client_session_id) ; contrat de Relais (création idempotente).
    groupe: 'Architecture',
    titre: 'Une session ne part jamais deux fois',
    texte: 'Chaque demande de session à Relais porte un identifiant choisi par Sillage. Si la réponse se perd, Sillage renvoie la même demande, et Relais rend la session déjà créée au lieu d’en lancer une seconde.',
    extrait: {
      ecrit: true,
      langage: 'HTTP',
      code: `POST /api/sessions                      (chez Relais)
{ "client_session_id": "<UUID v4>", "application_name": "Sillage",
  "model": "…", "effort": "…", "workspace": "…", "ttl_seconds": … }

→ 201  la première fois
→ 200  la même session, quand la demande est rejouée à l’identique
→ 409  le même identifiant pour une autre demande`,
    },
  },
  {
    // docs/context-contracts.md l. 1-60 et 195-215 ; README l. 172-197 ; backend/src/short_result.rs:11 (MAX_REPAIRS = 2).
    groupe: 'Décisions',
    titre: 'Un résultat court, corrigé dans la même session',
    contrainte: 'Les agents rendent de 10 000 à 27 000 caractères, quelle que soit la cible qu’on leur annonce, et une seule réponse mal formée peut casser la chaîne.',
    choix: 'Chaque agent rend un résultat court et structuré : résumé, décisions, contrôles, blocages, suite. Une réponse hors du format attendu lui revient dans la même session, avec l’erreur, deux fois au plus.',
    effet: 'Les agents suivants reçoivent des faits et des références, pas des conversations entières ; un blocage arrête la suite.',
    lien: { href: '#resultat', libelle: 'Le récapitulatif' },
    extrait: {
      ecrit: true,
      langage: 'JSON',
      code: `{
  "outcome": "partial",
  "summary": "Interfaces examinées ; raccordement restant.",
  "decisions": [],
  "checks": [{ "kind": "runtime_test", "status": "not_run" }],
  "blockers": [],
  "next_action": "Effectuer les essais dans le navigateur."
}`,
    },
  },
  {
    // docs/blocages-agents.md:25-35 (révision 9b4533a) ; backend/src/session/worktree.rs:1-5 ; README l. 392-410.
    groupe: 'Décisions',
    titre: 'Sillage crée lui-même le worktree de l’agent',
    contrainte: 'Des agents en parallèle dans un même dossier se gênaient : 26 commandes Git bloquées sur un verrou, des commits réécrits par un autre agent. Enfermés dans leur bac à sable, d’autres agents ne pouvaient ni committer, ni ouvrir un navigateur, ni joindre le réseau : 39 blocages en trois exécutions.',
    choix: 'Quand un agent en a besoin (sa mission le demande, ou un autre agent écrit en même temps dans le même dossier), Sillage crée lui-même son worktree avant sa première session, le garde pour les suivantes, committe pour l’agent si besoin, puis fusionne.',
    effet: 'Le même mécanisme committe pour les agents enfermés et sépare ceux qui écrivent en parallèle. Seuls les worktrees propres et fusionnés sont nettoyés, jamais les branches.',
  },
  {
    // docs/plan-contexte-agents.md:8-34 (révision ae2efd8) ; backend/src/models.rs:725-729 (300 000) ; README l. 450-458.
    groupe: 'Décisions',
    titre: 'Une fenêtre de compaction pour chaque session',
    contrainte: 'À chaque appel, toute la conversation de l’agent était relue : 2,19 milliards de tokens, les unités de texte que lit le modèle, sur 79 sessions de trois tâches, et rien ne bornait une session.',
    choix: 'Chaque session demande à Relais une fenêtre de compaction, de 300 000 tokens par défaut, réglable ou désactivable : au-delà, sa conversation est résumée.',
    effet: 'Une session est résumée vers 270 000 tokens au lieu de grossir jusqu’à la limite du modèle.',
    extrait: {
      ecrit: true,
      langage: 'JSON annoté',
      code: `// Demande de session à Relais, réglage par défaut
{ "autocompact_tokens": 300000 }`,
    },
  },
  {
    // docs/architecture-report.md (révision ed4080b) ; README l. 47-50 ; capacités annoncées par Relais.
    groupe: 'Décisions',
    titre: 'Relais n’expose que des capacités génériques',
    contrainte: 'Des notions propres à Sillage étaient entrées dans Relais, et Sillage allait lire le jeton de Relais dans son dossier : trois lectures dans le code exécuté.',
    choix: 'Relais n’expose que des capacités génériques. Sillage garde son schéma de création de tâche et ses validations, et reçoit le jeton par ses paramètres.',
    effet: 'Plus aucune lecture du dossier voisin : deux applications qui s’installent séparément, et un point d’accès que d’autres outils utilisent.',
    lien: { href: '/projets/relais', libelle: 'Relais' },
    extrait: {
      ecrit: true,
      langage: 'JSON annoté',
      code: `// GET /api/status chez Relais : les capacités dont Sillage se sert
{ "capabilities": {
    "working_context": true, "filesystem_scope": true,
    "idempotent_session_creation": true, "mcp_http": true, "mcp_http_auto": true } }`,
    },
  },
  {
    // README, « Permissions et fonctionnement ».
    groupe: 'Garde-fous, tests et limites',
    titre: 'Des consignes et des contrôles, pas une isolation',
    texte: 'Une tâche qui écrit donne aux agents un terminal, dont chaque commande passe par le classificateur de l’agent ; une tâche sans dossier d’écriture reste en lecture seule stricte, chaque lecture contrôlée par Relais. Les sous-agents héritent des permissions sans pouvoir les élargir. Aucun de ces modes n’isole le système des autres processus de la machine : c’est écrit.',
  },
  {
    // README (erreurs temporaires, authentification, quotas) ; backend/src/models.rs:720-723 (240 s).
    groupe: 'Garde-fous, tests et limites',
    titre: 'Une panne du fournisseur ne fait pas échouer l’agent',
    texte: 'Sur une erreur temporaire de l’API (529, 5xx), l’agent attend 30 s, puis le double, sans dépasser 240 s par défaut, et reprend dans la même session si elle le permet. Une authentification expirée ou un quota atteint met ses agents en attente : l’exécution repart seule à la reconnexion ou à la réinitialisation.',
  },
  {
    // git grep à c256e76 : 643 tests Rust, 206 tests Node, 22 parcours UI, 14 scénarios E2E ;
    // .github/workflows/compatibility.yml (windows-latest, macos-15, macos-15-intel).
    groupe: 'Garde-fous, tests et limites',
    titre: '643 tests du serveur, et des parcours complets',
    texte: '643 tests en Rust, 206 tests des scripts, 22 parcours d’interface Playwright et 14 scénarios de bout en bout, tous contre un faux fournisseur : aucun abonnement consommé. L’intégration continue les joue sous Windows et sous macOS, sur processeurs Apple et Intel.',
  },
];

/* ------------------------------------------------------------------ */
/* Sortie (gabarit E5 · 5)                                             */
/* ------------------------------------------------------------------ */

/** Dépôt privé : aucun lien public. */
export const LIENS_SORTIE: readonly LienProjet[] = [];

/** Ce que schema.org dit du projet (lib/seo.ts) : validé en intégration continue sur macOS et Windows. */
export const SCHEMA: SchemaProjet = { type: 'SoftwareApplication', categorie: 'DeveloperApplication', systemes: 'macOS, Windows' };
