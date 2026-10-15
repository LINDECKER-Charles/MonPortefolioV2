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
import type { PointCapot, DonneesFiche, LienProjet, PreuveEnTete, SchemaProjet } from '../components/projets/gabarit/types';
import carteGalaxie from '../assets/projets/karl-scraper/carte-galaxie.webp';
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
  // quotidien n’est pas sourcé : la carte ne le dit pas (statut validé le 15/10/2026).
  statut: { texte: 'Outil personnel, en service sur mon poste' },
  liens: [],
  // backend/Directory.Build.props (net10.0) ; frontend Angular 22 ; EF Core et SQLite (Directory.Packages.props).
  technos: [
    { src: dotnet, alt: '.NET' },
    { src: angular, alt: 'Angular' },
    { src: sqlite, alt: 'SQLite' },
  ],
  // La Galaxie, recadrée sur ses anneaux (KSC-C1, carte-galaxie.webp) : entière,
  // ses tâches ne faisaient que 2 ou 3 px à la taille d’une carte. Le recadrage
  // garde les tâches reliées et deux libellés de statut, sans en trancher aucun.
  visuel: {
    capture: {
      type: 'navigateur',
      src: carteGalaxie,
      alt: 'La Galaxie de Karl Scraper : des tâches fictives sur les anneaux de leur statut, reliées entre elles.',
      widths: [400, 783],
    },
  },
};

/* ------------------------------------------------------------------ */
/* En-tête (gabarit E5 · 1 et 2)                                       */
/* ------------------------------------------------------------------ */

export const EN_TETE = {
  // Second vers propre au projet (aucun agent n’ouvre l’outil source), pas la formule de Sillage (Q96).
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
  // Le service tourne sur mon poste (relevé le 14/10/2026) ; « en usage quotidien » n’est pas
  // sourcé : la fiche ne le dit pas (statut validé le 15/10/2026, Q72, docs/questions.md, J).
  statut: { texte: 'Outil personnel, en service sur mon poste' },
  liens: [],
};

/** Les sections du corps : sommaire de l’en-tête et navigation de page. */
export const SECTIONS: readonly EntreeSommaire[] = [
  { id: 'copie', titre: 'Une copie locale' },
  { id: 'galaxie', titre: 'La Galaxie' },
  { id: 'agent', titre: 'Ce que l’agent lit' },
  { id: 'chaine', titre: 'Du ticket à la pull request' },
  { id: 'fonctions', titre: 'Ses fonctions' },
  { id: 'construit', titre: 'Sous le capot' },
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
 * Les acteurs disent ce que l’outil permet, pas mon usage (Q94).
 */
export const CHAINE: readonly EtapeChaine[] = [
  { geste: 'Synchroniser', acteur: 'Le service', texte: 'Relit mes tâches assignées et scelle une observation locale.', acces: 'lecture' },
  { geste: 'Comprendre', acteur: 'Un agent', texte: 'Lit la tâche dans un dossier que le service lui prépare, explore les dépôts en lecture et désigne le dépôt et le worktree où la faire.', acces: 'aucun' },
  { geste: 'Trancher', acteur: 'Moi, ou une règle écrite et activée', texte: 'Retient ou écarte sa compréhension : le seul arbitrage avant que du code s’écrive.', acces: 'aucun' },
  { geste: 'Réaliser', acteur: 'Un agent, lancé par Relais', texte: 'Travaille dans un worktree et ouvre une pull request par dépôt touché.', acces: 'aucun' },
  { geste: 'Poser le statut', acteur: 'Moi d’un clic, ou une règle activée', texte: 'Écrit le statut de la tâche, relu dans la source juste avant.', acces: 'statut' },
];

/* ------------------------------------------------------------------ */
/* Sous le capot (gabarit E5 · 4)                                      */
/* ------------------------------------------------------------------ */

/**
 * Relus le 15/10/2026 à la même révision 6615950 : docs/PLAN-*.md, AGENTS.md,
 * docs/invariants/*.md, docs/API-publique.md, le code cité à côté de chaque
 * point. Les extraits sont écrits pour la page (dépôt privé) : aucune ligne
 * de code recopiée, aucun nom interne, aucun chemin de la machine.
 */

/** Ce que fait l’outil, fonction par fonction (section « fonctions »). */
export const FONCTIONS: readonly PointCapot[] = [
  {
    // docs/PLAN-sync-*.md ; README ; Core/Settings (heures creuses).
    titre: 'Synchroniser mes tâches assignées',
    texte: 'Un navigateur piloté par Playwright garde ma session ouverte sur l’outil de gestion de tâches. Le service relit mes tâches assignées, avec leur détail, leurs commentaires, leurs listes à cocher, leur historique, leurs images et leurs catégories, dans une base SQLite sur mon poste. Les passages se planifient, heures creuses comprises.',
  },
  {
    // docs/PLAN-snapshots-detail.md ; docs/AVANCEMENT.md:607 et 755.
    titre: 'Sceller une observation à chaque passage',
    texte: 'Chaque passage scelle une observation qui ne bougera plus. On en épingle une, on lit l’écart entre deux. Une empreinte évite de relire en détail ce qui n’a pas bougé : un passage sans changement côté source ne fait aucune requête d’enrichissement ; sinon, deux par tâche.',
  },
  {
    // Écrans Tâches, Tableau de bord, Métriques, Galaxie (frontend/src/app/app.routes.ts) ; FTS5.
    titre: 'Lire, chercher et voir où tout en est',
    texte: 'La liste des tâches se filtre avec des préréglages et se cherche en plein texte (FTS5 de SQLite). Le tableau de bord agrège par projet et par statut, les métriques suivent le poids des données locales et la tendance de l’arriéré, et la Galaxie met le tout en scène.',
  },
  {
    // docs/PLAN-preparation.md ; PLAN-chaine-de-travail.md § 2.
    titre: 'Préparer : un agent lit chaque nouvelle tâche',
    texte: 'Après un passage, un agent lit chaque nouvelle tâche, explore les dépôts en lecture et rend une compréhension courte : le dépôt et le worktree où la faire. Je la retiens, je l’écarte, je la précise ou je pose une question ; une précision relance l’agent.',
  },
  {
    // docs/PLAN-realisation.md.
    titre: 'Réaliser : un agent ouvre la pull request',
    texte: 'Confiée à Relais, une tâche retenue part chez le seul agent qui écrit : il travaille dans un worktree, sur une branche cible choisie parmi celles du dépôt, et ouvre une pull request par dépôt touché. Le service relit l’état des pull requests chez GitHub. Une réalisation se reprend, se relance ou se programme, par exemple pour le soir même.',
  },
  {
    // docs/PLAN-mode-plan.md ; PLAN-orchestrateur.md § 2.
    titre: 'Planifier une tâche complexe',
    texte: 'On y joint des ressources, du texte ou un PDF. Un agent propose une résolution, que je relis pas à pas ; elle s’exécute ensuite par Relais, ou part dans Sillage, où l’assistant compose le graphe d’agents au périmètre du plan.',
  },
  {
    // Core/Automation/AutomationTrigger.cs (14) et AutomationAction.cs (18) ; PLAN-enchainements.md § 0.
    titre: 'Enchaîner les gestes par des règles',
    texte: 'Des règles « quand…, alors… », écrites et activées dans les réglages, font les gestes à la place d’un clic. Le moteur passe une fois par minute, fait une étape par tâche, et un quota quotidien borne les lancements d’agent. Aucune règle n’est livrée.',
    extrait: {
      ecrit: true,
      langage: 'Règles',
      code: `quand  lecture-proposee      alors  retenir
quand  lecture-retenue       alors  confier-a-relais
quand  realisation-reussie   alors  passer-en-relecture`,
    },
  },
  {
    // docs/API-publique.md ; Api/Notifications (macOS).
    titre: 'Une API locale en lecture seule, et des notifications',
    texte: 'Un script ou un tableau de bord lit les tâches par une API HTTP locale, ouverte par une clé révocable : des lectures seulement, et toute autre méthode refusée avant même le routage. Des notifications macOS disent ce que les agents ont fini.',
    extrait: {
      ecrit: true,
      langage: 'HTTP',
      code: `GET /api/public/v1/tasks
GET /api/public/v1/tasks/overview
GET /api/public/v1/status
Authorization: Bearer <clé révocable>

POST, PUT, DELETE…  → 405, avant le routage`,
    },
  },
];

export const CAPOT: readonly PointCapot[] = [
  {
    // Projets de la solution : Api, Core, Sync, Mcp, Tests ; backend/Directory.Build.props (net10.0),
    // Directory.Packages.props (EF Core et SQLite 10.0.11, Playwright 1.62.0, MCP 2.2.0) ; frontend Angular 22.
    groupe: 'Architecture',
    titre: 'Un service .NET 10, cinq projets, une interface Angular',
    texte: 'Un service ASP.NET Core en API minimale tient la synchronisation, les agents et l’interface ; la synchronisation, le cœur métier, le serveur MCP et les tests vivent chacun dans leur projet. Les données : SQLite par EF Core, recherche plein texte FTS5, et des magasins JSON écrits d’un bloc pour ce qui ne doit jamais se perdre. L’interface Angular 22 suit le travail des agents en direct par SignalR.',
    extrait: {
      ecrit: true,
      langage: 'Schéma',
      code: `navigateur piloté (Playwright) ──▶ outil de gestion de tâches
          │  lectures, et une seule écriture : le statut
service .NET 10 ── SQLite (EF Core, FTS5) · magasins JSON
   ├─ SignalR ─▶ interface Angular 22
   └─ HTTP ────▶ Relais (agents) · Sillage (plans) · gh (pull requests)
serveur MCP, processus à part ── base en lecture seule ──▶ agent IA`,
    },
  },
  {
    // Api/Hosting/LoopbackBinding.cs ; scripts/start.sh (agent launchd).
    groupe: 'Architecture',
    titre: 'N’écouter que la machine, par le code',
    texte: 'L’adresse d’écoute n’est pas un réglage : un appel explicite à la boucle locale l’emporte sur toute variable d’environnement, et seul le port se change. Le service tourne en natif sur macOS, lancé par launchd, sans conteneur ni exposition.',
    extrait: {
      ecrit: true,
      langage: 'C#',
      code: `// L’adresse est dans le code ; seul le port se règle
builder.WebHost.ConfigureKestrel(serveur =>
    serveur.Listen(IPAddress.Loopback, port)); // l’emporte sur --urls et ASPNETCORE_URLS`,
    },
  },
  {
    // Projet Mcp, Tools/*.cs : 13 McpServerTool, dont 10 ReadOnly = true ; serveur stdio.
    groupe: 'Architecture',
    titre: 'Un serveur MCP de treize outils, dix en lecture seule',
    texte: 'Le serveur MCP parle à l’agent sur l’entrée et la sortie standard. Sa source se choisit à son lancement : le cache vivant, une observation scellée ou un espace de travail, et chaque réponse dit d’où elle vient. Trois outils seulement ne sont pas en lecture seule : deux déposent une analyse, le troisième demande un passage au service, qui seul lit la source.',
    extrait: {
      ecrit: true,
      langage: 'Outils MCP',
      code: `lecture   list_my_tasks · get_task · search_tasks · tasks_overview
          get_task_attachment · list_snapshots · list_workspaces
          sync_status · analysis_progress · get_group_plan
dépôt     submit_task_understanding · submit_task_fix_plan
passage   trigger_sync`,
    },
  },
  {
    // docs/invariants/securite.md:10-26 ; garde du client HTTP vers l’outil source, sur liste blanche @ 6615950.
    // Les appels vers Relais, Sillage et GitHub n’y passent pas.
    groupe: 'Décisions',
    titre: 'Des lectures, et une seule écriture vers l’outil source',
    contrainte: 'L’outil garde une session complète sur une application en production.',
    choix: 'Chaque appel vers l’outil source passe par une liste blanche : des lectures, plus une seule écriture, le statut d’une tâche, relu dans la source juste avant.',
    effet: 'Un défaut de l’outil ne peut modifier qu’un statut.',
    extrait: {
      ecrit: true,
      langage: 'Règle',
      code: `GET    toute lecture                 → admis
PATCH  /…/tâches/{uuid}/statut       → admis, après relecture du statut
tout le reste                        → refusé, avant le réseau`,
    },
  },
  {
    // Core/StorageServiceCollectionExtensions.cs:68-71 (Mode=ReadOnly) ; Tests/Architecture/McpIsolationTests.cs.
    // trigger_sync (Mcp/Tools/SyncTools.cs:50-66) demande un passage au service, qui seul lit la source.
    // Aucune CI à 6615950 : le test tourne avec la suite de tests, pas « à chaque build ».
    groupe: 'Décisions',
    titre: 'Le serveur MCP n’a pas de plume',
    contrainte: 'Un agent doit lire les tâches sans appeler lui-même la source ni écrire dans la copie locale.',
    choix: 'Le serveur MCP tourne dans un processus à part, ouvre la base en lecture seule et ne connaît ni la synchronisation ni le navigateur.',
    effet: 'Un test d’architecture le vérifie à chaque passage des tests : la règle n’est pas qu’un commentaire.',
    extrait: {
      ecrit: true,
      langage: 'C#',
      code: `// Le test d’architecture, en substance
var fermeture = AssembliesTransitives(serveurMcp);
Assert.DoesNotContain("Microsoft.Playwright", fermeture);
Assert.DoesNotContain(clientDeLaSource, fermeture);
// et aucune source du serveur ne nomme une écriture :
// connexion en écriture, journal des enchaînements, SaveAsync, UpdateAsync`,
    },
  },
  {
    // AGENTS.md (Stockage) ; docs/invariants/stockage.md:26-47 (magasin illisible en quarantaine, lecture seule) ;
    // docs/PLAN-snapshots-detail.md:296-301 (source `live` par défaut, `latest` ou un run ; pas de `pin_snapshot` ;
    // chaque réponse porte sa source).
    groupe: 'Décisions',
    titre: 'Une source figée au lancement, rien qui se perde',
    contrainte: 'Un agent doit pouvoir raisonner sur un état figé, et aucune de mes décisions ne doit se perdre.',
    choix: 'Chaque passage scelle une observation, et le serveur MCP fixe sa source à son lancement, le cache vivant ou une observation scellée, jamais en cours de session ; chaque réponse dit d’où elle vient. Un fichier de décisions illisible reste intact, en lecture seule, au lieu d’être lu vide puis écrasé.',
    effet: 'Sur une observation, deux appels identiques rendent la même réponse, et une décision prise ne se perd pas.',
  },
  {
    // PLAN-enchainements.md § 0, points 2-3 et 6-8 ; Core/Automation/AutomationHost.cs:32-40.
    groupe: 'Décisions',
    titre: 'Des règles qui ont les gardes d’un clic',
    contrainte: 'Enchaîner les gestes d’un ticket sans qu’une règle fasse ce que je n’aurais pas validé.',
    choix: 'Les déclencheurs et les actions vivent dans le code, les règles dans mes réglages. Une règle a les gardes d’un clic, relit la tâche dans la source et la pull request chez GitHub, cède au geste qui la contredit et ne défait jamais rien. Son journal s’écrit avant d’agir : une action à l’issue inconnue n’est jamais rejouée à l’aveugle.',
    effet: 'Sans règle, l’outil se comporte comme avant, et un test le vérifie.',
  },
  {
    // AGENTS.md (Agents, Réalisation) ; docs/invariants/agents.md:10 (un seul plafond) et 84-90 ; RelaisReadOnlyGuard.
    groupe: 'Garde-fous, tests et limites',
    titre: 'Les agents qui lisent n’ont que Read, Glob et Grep',
    texte: 'Cinq métiers d’agent (préparer, répartir, rédiger, planifier, réaliser) partagent un seul plafond de sessions simultanées. Ceux qui lisent tournent dans une session Relais en lecture seule, relue après coup ; un seul métier écrit, et seulement dans un worktree, jamais dans le dépôt principal.',
  },
  {
    // git grep à 6615950, en début de ligne : 1 227 [Fact] et 113 [Theory] dans 207 fichiers de test, 718 it( dans 114 fichiers spec.
    groupe: 'Garde-fous, tests et limites',
    titre: 'Plus de deux mille cas de test déclarés',
    texte: '1 340 cas de test côté serveur (xUnit v3) et 718 côté interface (Vitest), comptés dans le code à la révision lue, sans les exécuter. Il n’y a pas d’intégration continue : les tests tournent sur mon poste.',
  },
  {
    // docs/AVANCEMENT.md:44 ; PLAN-enchainements.md:3 (dossier de tâche : lot 0 seul) ; macOS (launchd, notifications).
    groupe: 'Garde-fous, tests et limites',
    titre: 'Ce qui n’est pas encore là',
    texte: 'Le « dossier de tâche » unifié, écrit dans les plans, n’a livré que son premier lot. L’outil ne tourne que sur macOS, n’est ni déployé ni partagé, et son interface attend une refonte graphique.',
  },
];

/* ------------------------------------------------------------------ */
/* Sortie (gabarit E5 · 5)                                             */
/* ------------------------------------------------------------------ */

/** Dépôt privé : aucun lien public. */
export const LIENS_SORTIE: readonly LienProjet[] = [];

/** Ce que schema.org dit du projet (lib/seo.ts) : un service local, sur macOS. */
export const SCHEMA: SchemaProjet = { type: 'SoftwareApplication', categorie: 'DeveloperApplication', systemes: 'macOS' };
