/**
 * Données de Relais (/projets/relais) : la carte de la vitrine (CARTE), puis
 * les données de sa page. Ce fichier appartient à la page Relais :
 * config/vitrine.ts et lib/seo.ts ne font que l’importer.
 *
 * Dépôt privé (décision de Charles du 14/10/2026) : aucun lien, aucun nom de
 * dépôt ni chemin. Faits relus le 14/10/2026 à la révision bdf041f de la
 * branche de développement (14/10/2026), sauf mention ; un fait non sourcé
 * n’entre pas ici. La source de chaque donnée est notée à côté.
 *
 * Capacité : la page la présente comme une visibilité sur la consommation et
 * une admission selon la charge (quotas lus, seuil de protection, session
 * ouverte jamais coupée). Elle ne montre ni la bascule entre abonnements ni la
 * connexion automatisée d’un compte (cadrage validé tel qu’affiché le
 * 15/10/2026, docs/prive/questions.md, J).
 *
 * Captures : Relais 0.2.0 lancé en local avec des données de démonstration,
 * un agent de démonstration à la place de Claude Code
 * (src/assets/projets/relais/README.md).
 */
import type { EntreeSommaire } from './navigation';
import type { CarteVitrine } from './vitrine';
import type { PointCapot, DonneesFiche, LienProjet, PreuveEnTete, SchemaProjet } from '../components/projets/gabarit/types';
import { typo } from '../lib/typo';
import carteDashboard from '../assets/projets/relais/carte-dashboard.webp';
import angular from '../assets/stacks/angular.svg';
import rust from '../assets/stacks/rust.svg';
import sqlite from '../assets/stacks/sqlite.svg';

/* ------------------------------------------------------------------ */
/* La carte de la vitrine (/projets, famille « IA »)                   */
/* ------------------------------------------------------------------ */

export const CARTE: CarteVitrine = {
  // README l. 6-8 : « lance sa propre version de Claude Code et de Codex CLI,
  // isole les comptes, expose une API aux outils de la machine et conserve les
  // conversations dans SQLite ».
  besoin: 'Donner aux outils de ma machine un seul point d’accès local aux agents Claude Code et Codex, qui isole leurs comptes, décide de leurs permissions et garde leurs conversations.',
  // docs/registre-correctifs.md l. 3-6 et 28 : la base de l’instance en
  // service après trois jours (du 21 au 23/09/2026), relue à bdf041f. Le
  // compte est figé au 23/09/2026 : c’est sa date, pas celle de la lecture.
  chiffre: { valeur: '1 011', libelle: 'décisions de permission en trois jours de service', releve: '23 septembre 2026' },
  // git log à bdf041f : 260 commits, un seul auteur.
  role: 'Conçu et développé seul',
  // Une instance en service sur la machine, vue le 14/10/2026 ; « en usage
  // quotidien » n’est pas sourcé : la page ne le dit pas, comme pour Sillage et
  // Karl Scraper (statut validé le 15/10/2026, docs/prive/questions.md, J).
  statut: { texte: 'Outil personnel, en usage sur ma machine' },
  liens: [],
  // backend/Cargo.toml (Rust, rusqlite), frontend/package.json (Angular 21.2).
  technos: [
    { src: rust, alt: 'Rust', mono: true },
    { src: angular, alt: 'Angular' },
    { src: sqlite, alt: 'SQLite' },
  ],
  // Recadrage du Dashboard de l’en-tête (REL-C1, carte-dashboard.webp) sur
  // ses deux premiers compteurs et la consommation locale : lisible à la taille
  // de la carte, sans chemin de démonstration, dans le cadre navigateur de ses
  // voisines de la famille « IA ».
  visuel: {
    capture: {
      type: 'navigateur',
      src: carteDashboard,
      alt: typo('Le Dashboard de Relais : les agents actifs, les tokens traités et la consommation locale jour par jour, sur des données de démonstration.'),
      widths: [480, 960],
    },
  },
};

/* ------------------------------------------------------------------ */
/* En-tête (gabarit E5 · 1 et 2)                                       */
/* ------------------------------------------------------------------ */

export const EN_TETE = {
  titre: 'Un seul point d’accès aux agents IA de ma machine.',
  chapeau:
    'Plusieurs de mes outils confient du travail à des agents Claude Code et Codex. Relais les lance à leur place : il isole chaque abonnement, en surveille la capacité, décide des permissions et garde les conversations. Je l’ai conçu et développé seul, en Rust et en Angular.',
  liens: [] satisfies LienProjet[],
};

export const PREUVES: readonly PreuveEnTete[] = [
  {
    // docs/registre-correctifs.md l. 28 (base de l’instance en service) et l. 208.
    valeur: '1 011',
    libelle: 'décisions de permission en trois jours de service',
    source: 'Registre des correctifs du dépôt',
    date: 'du 21 au 23/09/2026',
    surligne: true,
    href: '#perimetre',
  },
  {
    // docs/audit-permissions-demo.md l. 73-74 : 48 refus et 4 autorisations attendus.
    valeur: '52',
    libelle: 'cas d’audit du périmètre de fichiers : 48 refus et 4 autorisations attendus',
    source: 'Audit des permissions du dépôt',
    date: '20/09/2026',
    href: '#construit',
  },
  {
    // `#[test]` et `#[tokio::test]` dans backend/src, à bdf041f.
    valeur: '373',
    libelle: 'tests du serveur en Rust',
    source: 'Code du dépôt, révision bdf041f',
    date: 'relevé le 14/10/2026',
    href: '#sources',
  },
];

export const FICHE: DonneesFiche = {
  besoin: 'Donner aux outils de ma machine un seul point d’accès local aux agents IA, avec des comptes isolés et chaque permission décidée par Relais.',
  part: 'J’ai conçu et développé seul le serveur en Rust et l’interface Angular, avec leurs tests et leur documentation.',
  role: 'Conception et développement',
  // Premier commit le 18/09/2026 (9930260).
  periode: 'Depuis septembre 2026',
  // 260 commits à bdf041f, tous de Charles (deux graphies du nom).
  equipe: 'Projet personnel, seul',
  // Une instance en service sur la machine, vue le 14/10/2026 ; « en usage
  // quotidien » n’est pas sourcé.
  statut: { texte: 'Outil personnel, en usage sur ma machine' },
  liens: [],
};

/** Les sections du corps : sommaire de l’en-tête et navigation de page. */
export const SECTIONS: readonly EntreeSommaire[] = [
  { id: 'acces', titre: 'Le point d’accès' },
  { id: 'perimetre', titre: 'Le périmètre' },
  { id: 'capacite', titre: 'La capacité' },
  { id: 'analyse', titre: 'L’analyse' },
  { id: 'fonctions', titre: 'Ses fonctions' },
  { id: 'construit', titre: 'Sous le capot' },
  { id: 'retiens', titre: 'En une phrase' },
];

/* ------------------------------------------------------------------ */
/* Le point d’accès (REL-F1)                                           */
/* ------------------------------------------------------------------ */

/**
 * Qui passe par Relais, ce qu’il prend en charge et ce qu’il lance. Clients : Sillage
 * se déclare par `application_name` (docs/api-contract.md l. 342) ; Karl
 * Scraper confie ses agents à Relais depuis le 21/09/2026 (dossier de faits
 * de Karl Scraper) ; tout outil qui a la clé (page « Intégrer un outil ») ;
 * la console elle-même (« Nouvelle session »). Ce qu’il prend en charge : README
 * l. 6-8, docs/architecture.md, backend/src/launch_brake.rs. Versions
 * fixées par Relais : runtime/package.json.
 */
export const POINT_ACCES = {
  outils: [
    { nom: 'Sillage', role: 'orchestre des équipes d’agents' },
    { nom: 'Karl Scraper', role: 'automatise des tâches' },
    { nom: 'Un script', role: 'par l’API, avec la clé' },
    { nom: 'La console de Relais', role: 'une session lancée à la main' },
  ],
  relais: [
    'un dossier de configuration par abonnement',
    'le périmètre de fichiers et les permissions',
    'la capacité de chaque abonnement',
    'un frein sur les lancements',
    'les conversations, dans SQLite',
  ],
  agents: [
    { nom: 'Claude Code', version: '2.1.281' },
    { nom: 'Codex', version: '0.157.1' },
  ],
} as const;

/* ------------------------------------------------------------------ */
/* Les captures (REL-C1) : alt, légende, cible et loupe                */
/* ------------------------------------------------------------------ */

/** Une loupe de CaptureAnnotee (pourcentages de l’image entière). */
interface Loupe {
  x: number;
  y: number;
  zoom: number;
  largeur: number;
  ratio: string;
  coin: 'bas-droite' | 'bas-gauche' | 'haut-droite' | 'haut-gauche';
  dessous: boolean;
}

export interface CaptureRelais {
  alt: string;
  legende: string;
  cible?: { x: number; y: number };
  loupe?: Loupe;
}

/** Fichiers de src/assets/projets/relais/ (README.md : provenance), sans extension. */
export type NomCapture = 'dashboard' | 'conversation-perimetre' | 'capacite' | 'garde-fous' | 'analyse';

export const CAPTURES: Readonly<Record<NomCapture, CaptureRelais>> = {
  dashboard: {
    alt: typo('Le tableau de bord de Relais : cinq agents actifs, la consommation des sept derniers jours et la capacité de trois abonnements de démonstration.'),
    legende: 'Le tableau de bord, fenêtre entière, sur des données de démonstration. Un clic l’agrandit.',
  },
  'conversation-perimetre': {
    alt: typo('Une conversation dans Relais : chaque appel d’outil suivi de sa décision ; la lecture d’un fichier hors du périmètre échoue, avec son motif.'),
    legende: 'Lecture refusée hors du périmètre, motif à l’appui, sur des données de démonstration ; la réponse vient d’un agent de démonstration. À droite, les dossiers ouverts en lecture et en écriture.',
    // « Échec » sur la lecture refusée ; la loupe sur le motif rendu par Relais,
    // la phrase entière (x 14,5 à 42,4 % de l’image).
    cible: { x: 60.2, y: 38.2 },
    loupe: { x: 28.5, y: 58.4, zoom: 3.3, largeur: 60, ratio: '4 / 1', coin: 'haut-droite', dessous: true },
  },
  capacite: {
    alt: typo('La capacité de trois abonnements de démonstration : quotas de cinq heures et de sept jours, chacun face au repère de son seuil de protection.'),
    legende: 'Le quota de cinq heures de l’abonnement « Personnel » : 35,8 %, sous le repère de son seuil de protection. Les trois abonnements de démonstration sont disponibles.',
    // Le repère du seuil sur la jauge de cinq heures de « Personnel » ; la loupe
    // sur cette jauge, son pourcentage et sa réinitialisation (x 34,4 à 48,4 %).
    cible: { x: 47.7, y: 52.4 },
    loupe: { x: 41.3, y: 52.4, zoom: 6, largeur: 50, ratio: '3 / 1', coin: 'haut-droite', dessous: true },
  },
  'garde-fous': {
    alt: typo('Les garde-fous d’un abonnement : nouvelles sessions refusées dès 95 % du quota ; une session déjà ouverte n’est jamais coupée.'),
    legende: 'Le seuil de protection : nouvelles sessions refusées dès 95 % du quota, par défaut. Une session déjà ouverte n’est jamais coupée.',
    // Le champ « 95 », la cible un peu sous son centre : sa pastille reste à
    // gauche du libellé ; la loupe sur ce champ et son libellé (x 39 à 66 %).
    cible: { x: 39.6, y: 70 },
    loupe: { x: 52.6, y: 66, zoom: 3.4, largeur: 58, ratio: '9 / 2', coin: 'haut-droite', dessous: true },
  },
  analyse: {
    alt: typo('L’analyse de Relais sur des données de démonstration : durée médiane des tours, durée sous laquelle tombent 95 % d’entre eux, débit, et part des tokens relus depuis le cache.'),
    legende: 'La durée d’un tour : la médiane, et le P95, sous lequel tombent 95 % des tours. Calculés par Relais sur les données de démonstration.',
    // Le P95 d’un tour, la pastille à gauche de son libellé ; la loupe sur la
    // médiane et le P95 seuls (x 21 à 41 %).
    cible: { x: 33.2, y: 30.5 },
    loupe: { x: 31.2, y: 28, zoom: 4.8, largeur: 60, ratio: '7 / 2', coin: 'bas-droite', dessous: true },
  },
};

/* ------------------------------------------------------------------ */
/* Sous le capot (gabarit E5 · 4)                                      */
/* ------------------------------------------------------------------ */

/**
 * Relus le 15/10/2026 à la même révision bdf041f : README, docs/architecture.md,
 * docs/api-contract.md, docs/mcp-http.md, docs/conversation-design.md,
 * docs/diagnostics-design.md, docs/storage.md et le code cité à côté de chaque
 * point. Les extraits sont écrits pour la page (dépôt privé) : formes
 * simplifiées, sans code recopié ni chemin de la machine.
 */

/** Ce que fait Relais, fonction par fonction (section « fonctions »). */
export const FONCTIONS: readonly PointCapot[] = [
  {
    // docs/api-contract.md, « Sessions » ; README, « Démarrage », 3.
    titre: 'Lancer une session, pour un outil ou à la main',
    texte: 'Une session se demande par l’API, ou depuis la console : l’abonnement, le modèle, le dossier de travail, l’effort, la permission et la durée de vie. L’outil qui l’a demandée se déclare par son nom, et le tableau de bord le montre.',
  },
  {
    // docs/conversation-design.md (« Expérience livrée »).
    titre: 'Lire et piloter une conversation',
    texte: 'La conversation en plein écran : chaque étape horodatée à la seconde, chaque outil réuni avec son résultat, les demandes de permission et les questions de l’agent à traiter. Un panneau de pilotage ramène au contexte, aux outils ou au tour voulu ; jusqu’à dix instructions attendent leur tour dans une file, et la palette de commandes s’ouvre au clavier.',
  },
  {
    // README, « Ouvrir le terminal ».
    titre: 'Rejoindre la session depuis un terminal',
    texte: 'Un terminal se connecte à la même conversation, dans la console ou depuis un shell de la machine. Ce n’est ni une seconde conversation, ni un shell du système : il envoie des messages, interrompt un tour, se déconnecte sans arrêter la session.',
  },
  {
    // docs/architecture.md (« Profils indépendants », « Découverte »).
    titre: 'Des abonnements isolés, reconnus seuls',
    texte: 'Chaque abonnement a son propre dossier de configuration. Relais en reconnaît l’identité et les modèles en interrogeant l’agent, sans génération, et signale deux abonnements liés au même compte.',
  },
  {
    // docs/architecture.md (« Quotas ») ; README (Quotas, consommation).
    titre: 'Les quotas lus chez le fournisseur, la consommation comptée',
    texte: 'Les fenêtres de cinq heures et de sept jours, avec leur réinitialisation et leur fraîcheur, telles que le fournisseur les donne. À côté, les tokens comptés par Relais et un coût estimé, qui n’est pas une facture. Une donnée absente ou périmée n’est jamais lue comme un zéro.',
  },
  {
    // docs/analytics.md ; README (« Espace Analyse »).
    titre: 'Analyser chaque appel',
    texte: 'Des filtres croisés par agent, modèle, outil, abonnement, application et période : l’évolution de la consommation, la comparaison des coûts, la médiane et le P95 des tours, le cache, les erreurs. Le périmètre filtré s’exporte en CSV ou en JSON.',
  },
  {
    // docs/mcp-http.md l. 1-40.
    titre: 'Des serveurs MCP confiés session par session',
    texte: 'Un outil peut donner à sa session jusqu’à huit serveurs MCP, chacun avec la liste exacte de ses outils permis, d’un à cent. Relais refuse tout outil non listé, et le retire de ce que voit l’agent, qui sinon l’appelait pour rien.',
    extrait: {
      ecrit: true,
      langage: 'JSON',
      code: `{
  "mcp_servers": {
    "catalogue": {
      "url": "http://127.0.0.1:9500/mcp",
      "allowed_tools": ["lookup"]
    }
  }
}`,
    },
  },
  {
    // README (« Bibliothèque de skills », « Instructions permanentes »).
    titre: 'Une bibliothèque et des instructions par abonnement',
    texte: 'Des skills et des commandes, importés, écrits ou désactivés par abonnement, s’appellent d’une barre oblique dans la conversation. Des instructions permanentes, communes ou propres à un abonnement, s’ajoutent au prompt système des nouvelles conversations.',
  },
  {
    // docs/storage.md ; README (Stockage).
    titre: 'Un stockage qui se recycle seul',
    texte: 'Le poids des données par catégorie, par conversation et par abonnement. Les conversations terminées sont compressées après 7 jours, puis supprimées après 90 ; les métriques restent. Une conversation compressée se relit à l’identique.',
  },
  {
    // docs/diagnostics-design.md.
    titre: 'Diagnostiquer, sans jamais rien installer',
    texte: 'Le moteur, le port, la durée de fonctionnement et les agents actifs d’un regard, puis les journaux filtrés. Une carte compare la version de Claude Code fixée par Relais à la dernière publiée : Relais ne l’installe jamais lui-même, et une version nouvelle reste « pas encore validée ».',
  },
];

export const CAPOT: readonly PointCapot[] = [
  {
    // docs/architecture.md l. 1-20 (schéma et rôles).
    groupe: 'Architecture',
    titre: 'Rust possède les processus, Angular n’est qu’un client',
    texte: 'Le serveur, en Rust (Axum, Tokio, SQLite embarqué), possède les processus des agents, les règles de permission, l’état des sessions et la persistance. L’interface Angular passe par la même API que les autres outils de la machine, avec la même clé ; les identifiants des abonnements ne quittent jamais le serveur.',
    extrait: {
      ecrit: true,
      langage: 'Schéma',
      // Aligné à gauche, branches empilées : tient en 35 colonnes, la largeur d’un téléphone.
      code: `interface Angular
outils de la machine
│ clé + JSON
▼
API Rust (Axum)
├▶ SQLite
└▶ sessions et collecteur
  └▶ adaptateur Claude Code · Codex
    └▶ agent fixé par Relais
      ├ configuration, abonnement A
      └ configuration, abonnement B`,
    },
  },
  {
    // docs/architecture.md (« Transport ») ; README (Codex : codex app-server) ; docs/api-contract.md (rafraîchissement de 1,8 s).
    groupe: 'Architecture',
    titre: 'Deux protocoles d’agent, un seul modèle de session',
    texte: 'Avec Claude Code, Relais échange des messages JSON en flux sur l’entrée et la sortie standard ; avec Codex, il parle JSON-RPC à son serveur d’application. Les événements d’origine sont gardés tels quels, outils et demandes de permission compris, et la console relit le journal par morceaux.',
    extrait: {
      ecrit: true,
      langage: 'Schéma',
      // Aligné à gauche, branches empilées : tient en 35 colonnes, la largeur d’un téléphone.
      code: `Claude Code
  ⇄ stream-json, stdin et stdout
Codex
  ⇄ JSON-RPC, codex app-server
↓ événements d’origine,
  gardés tels quels
SQLite
├ sessions · événements
└ permissions · audit`,
    },
  },
  {
    // docs/architecture.md (« Durée de vie »).
    groupe: 'Architecture',
    titre: 'Une durée de vie dure, un arrêt progressif',
    texte: 'Chaque session a une échéance tenue par le serveur, même entre deux messages ; un signe de vie la prolonge, dans une borne maximale. À l’arrêt, Relais prévient l’agent, puis le coupe après 3 s : sous Unix, tout son groupe de processus ; sous Windows, un objet de tâche qui regroupe l’agent et ses descendants.',
  },
  {
    // backend/src/provider.rs l. 215 et 300-306 (environnement vidé, liste blanche, dossier de configuration
    // par profil) ; README l. 182 (« CLI épinglé dans `runtime/` ») ; docs/architecture.md l. 76.
    groupe: 'Décisions',
    titre: 'Une version fixée de chaque agent, un dossier par abonnement',
    contrainte: 'Plusieurs abonnements sur une même machine, alors que Claude Code et Codex lisent par défaut la connexion et les variables d’environnement de l’utilisateur.',
    choix: 'Relais lance sa propre version de chaque agent, fixée dans son dossier, jamais celle installée sur la machine, avec un dossier de configuration par abonnement et un environnement vidé, puis rempli depuis une liste blanche.',
    effet: 'Aucune clé ni variable d’un abonnement ne passe à un autre, et deux abonnements liés au même compte sont signalés.',
    extrait: {
      ecrit: true,
      langage: 'Configuration',
      code: `exécutable            runtime/ de Relais, version fixée (jamais celui du PATH)
environnement         vidé, puis rempli depuis une liste blanche
CLAUDE_CONFIG_DIR     le dossier de l’abonnement
ANTHROPIC_CONFIG_DIR  le dossier de l’abonnement`,
    },
  },
  {
    // docs/filesystem-scope.md l. 62-81 ; docs/audit-permissions-demo.md l. 12-17, 73-74 et 94-104 ;
    // docs/registre-correctifs.md C1 (l. 208-215) et son Statut (correctifs f2a2d68).
    groupe: 'Décisions',
    titre: 'Le chemin réel du fichier, pas celui que l’agent écrit',
    contrainte: 'Les permissions de l’agent ne suffisent pas à le garder dans les dossiers confiés : un chemin peut remonter hors du dossier, passer par un lien ou désigner un fichier qui porte un second nom ailleurs.',
    choix: 'Relais vérifie le chemin réel du fichier, pas celui que l’agent écrit : les chemins qui remontent hors du dossier, les liens qui en sortent et les fichiers à plusieurs liens physiques sont refusés.',
    effet: 'L’audit de 52 cas a trouvé un défaut sur les fichiers à plusieurs liens physiques, corrigé après signalement ; les 52 cas passent. Recoupés avec les paramètres des appels, les 69 refus de lecture et de recherche des trois premiers jours de service ont montré des recherches refusées à tort : j’ai assoupli les règles des recherches, sans rouvrir les chemins hors du périmètre.',
    extrait: {
      ecrit: true,
      langage: 'Règle',
      code: `chemin demandé → chemin réel (canonique)
  remonte hors du dossier confié         → refusé
  lien qui sort du dossier               → refusé
  fichier à plusieurs liens physiques    → refusé
  dans un dossier confié                 → admis, en lecture ou en écriture
le refus revient à l’agent avec son motif`,
    },
  },
  {
    // backend/src/quota_routing.rs l. 1-15 et 33 (40 sessions récentes) ; docs/architecture.md (« Quotas »).
    groupe: 'Décisions',
    titre: 'Admettre une session selon la charge réelle',
    contrainte: 'Un seuil fixe laisse entrer de nouvelles sessions alors que celles qui tournent consomment encore : huit agents lancés en parallèle peuvent faire passer un petit abonnement de 90 % à plus de 100 % de son quota avant que le premier ait fini.',
    choix: 'Avant d’admettre une session, Relais réserve ce que consommeront celles qui tournent et la nouvelle, au rythme qu’il apprend des 40 dernières sessions.',
    effet: 'La réserve suit l’usage réel de chaque abonnement, et l’abonnement refuse avant d’atteindre son seuil, au lieu de le laisser dépasser par les sessions déjà lancées.',
    extrait: {
      ecrit: true,
      langage: 'Pseudo-code',
      code: `admettre la session si
    quota lu chez le fournisseur
  + réserve des sessions en cours
  + réserve de la nouvelle session      ≤ seuil (95 % par défaut)
réserve : au rythme appris des 40 dernières sessions
une session déjà ouverte n’est jamais coupée`,
    },
  },
  {
    // backend/src/launch_brake.rs l. 1-35 ; commits f45d3bd (503 et Retry-After doublé pour un abonnement
    // suspendu nommé, 429 au-delà du débit) et cba3002 (« Réessayer »), du 05/10/2026.
    groupe: 'Décisions',
    titre: 'Un frein sur les lancements, né d’un incident',
    contrainte: 'Le 27/09/2026, un outil a recréé une session par minute pendant sept heures, sur un abonnement où chacune mourait en deux secondes ; Relais n’enregistrait qu’un code d’erreur, sans message.',
    choix: 'Un frein par application et par abonnement : vingt lancements d’affilée, puis un toutes les trois secondes. Trois échecs d’affilée au démarrage suspendent l’abonnement, et l’erreur cite la dernière ligne d’erreur de l’agent.',
    effet: 'Tant que l’abonnement est suspendu, un lancement qui le nomme est refusé avec une attente conseillée d’une minute, doublée à chaque refus jusqu’à une heure ; l’abonnement rouvre dès qu’une de ses sessions répond, ou d’un clic sur « Réessayer ».',
    extrait: {
      ecrit: true,
      langage: 'HTTP',
      code: `POST /api/sessions          (21e lancement d’affilée)
→ 429 Too Many Requests
  Retry-After: 3
  { "error_code": "rate_limited", "retry_after_seconds": 3 }`,
    },
  },
  {
    // docs/architecture.md (« Accès », « Permission »).
    groupe: 'Garde-fous, tests et limites',
    titre: 'La boucle locale, une clé, et des modes de permission',
    texte: 'Relais n’écoute que la machine, derrière une clé aléatoire, sans CORS ouvert. En lecture seule, l’agent n’a que Read, Glob, Grep et ses questions ; commandes, sous-agents, MCP et hooks du projet sont coupés. En écriture, chaque demande de permission se traite dans la console.',
  },
  {
    // git grep à bdf041f (373 tests) ; scripts/*.mjs (54) et scripts/fixtures/fake-*.mjs ; README l. 222-223 (CI).
    groupe: 'Garde-fous, tests et limites',
    titre: 'Des faux agents pour tout tester sans abonnement',
    texte: '373 tests du serveur en Rust et 54 scripts de vérification, dont des parcours Playwright avec contrôle d’accessibilité. Des faux Claude Code, Codex, navigateur, GitHub et registre npm, déterministes, remplacent les vrais : aucun abonnement consommé. L’intégration continue tourne sous Windows et sous macOS, sur processeurs Apple et Intel.',
  },
  {
    // docs/architecture.md (« Permission », « Persistance », « Durée de vie », « Évolution ») ; README l. 343.
    groupe: 'Garde-fous, tests et limites',
    titre: 'Ses limites, écrites',
    texte: 'Le contrôle des permissions n’est pas une isolation du système : l’agent tourne sous mon compte. Les conversations survivent à un redémarrage, pas les processus. Sous Unix, le nettoyage après un arrêt brutal de Relais n’est pas garanti. Un seul utilisateur, sur la machine : l’accès distant demanderait une authentification par appelant, un vrai bac à sable et TLS.',
  },
];

/* ------------------------------------------------------------------ */
/* Sortie (gabarit E5 · 5)                                             */
/* ------------------------------------------------------------------ */

/** Dépôt privé : aucun lien public. */
export const LIENS_SORTIE: readonly LienProjet[] = [];

/** Ce que schema.org dit du projet (lib/seo.ts) : intégration continue sur Windows et macOS (README l. 222-223). */
export const SCHEMA: SchemaProjet = { type: 'SoftwareApplication', categorie: 'DeveloperApplication', systemes: 'Windows, macOS' };
