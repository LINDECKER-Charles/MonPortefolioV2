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
 * connexion automatisée d’un compte (cadrage à confirmer, a-confirmer.md).
 *
 * Captures : Relais 0.2.0 lancé en local avec des données de démonstration,
 * un agent de démonstration à la place de Claude Code
 * (src/assets/projets/relais/README.md).
 */
import type { EntreeSommaire } from './navigation';
import type { CarteVitrine } from './vitrine';
import type { Decision, DonneesFiche, LienProjet, PreuveEnTete, SchemaProjet } from '../components/projets/gabarit/types';
import cartePerimetre from '../assets/projets/relais/carte-perimetre.webp';
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
  besoin: 'Donner aux outils de ma machine un seul point d’accès local aux agents Claude Code et Codex, qui tient leurs comptes, leurs permissions et leurs conversations.',
  // docs/registre-correctifs.md l. 3-6 et 28 : la base de l’instance en
  // service après trois jours (du 21 au 23/09/2026), relue à bdf041f.
  chiffre: { valeur: '1 011', libelle: 'décisions de permission en trois jours de service', releve: '14 octobre 2026' },
  // git log à bdf041f : 260 commits, un seul auteur.
  role: 'Conçu et développé seul',
  statut: { texte: 'Outil personnel, en usage quotidien' },
  liens: [],
  // backend/Cargo.toml (Rust, rusqlite), frontend/package.json (Angular 21.2).
  technos: [
    { src: rust, alt: 'Rust', mono: true },
    { src: angular, alt: 'Angular' },
    { src: sqlite, alt: 'SQLite' },
  ],
  // Recadrage du panneau de pilotage de la capture de la conversation
  // (REL-C1, carte-perimetre.webp) : lisible à la taille de la carte.
  visuel: {
    capture: {
      type: 'terminal',
      src: cartePerimetre,
      alt: 'Le périmètre d’une session dans Relais : aucun terminal, lecture seule dans les spécifications, écriture dans le seul projet confié.',
    },
  },
};

/* ------------------------------------------------------------------ */
/* En-tête (gabarit E5 · 1 et 2)                                       */
/* ------------------------------------------------------------------ */

export const EN_TETE = {
  titre: 'Un seul point d’accès aux agents IA de ma machine.',
  chapeau:
    'Plusieurs de mes outils confient du travail à des agents Claude Code et Codex. Relais les lance à leur place : il isole chaque abonnement, décide des permissions, tient la capacité et garde chaque conversation. Je l’ai conçu et développé seul, en Rust et en Angular.',
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
  besoin: 'Donner aux outils de ma machine un seul point d’accès local aux agents IA, avec des comptes isolés et des permissions tenues.',
  part: 'J’ai conçu et développé seul le serveur en Rust et l’interface Angular, avec leurs tests et leur documentation.',
  role: 'Conception et développement',
  // Premier commit le 18/09/2026 (9930260).
  periode: 'Depuis septembre 2026',
  // 260 commits à bdf041f, tous de Charles (deux graphies du nom).
  equipe: 'Projet personnel, seul',
  // Une instance en service sur la machine, vue le 14/10/2026.
  statut: { texte: 'Outil personnel, en usage quotidien' },
  liens: [],
};

/** Les sections du corps : sommaire de l’en-tête et navigation de page. */
export const SECTIONS: readonly EntreeSommaire[] = [
  { id: 'acces', titre: 'Le point d’accès' },
  { id: 'perimetre', titre: 'Le périmètre' },
  { id: 'capacite', titre: 'La capacité' },
  { id: 'analyse', titre: 'L’analyse' },
  { id: 'construit', titre: 'Comment je l’ai construit' },
  { id: 'retiens', titre: 'En une phrase' },
];

/* ------------------------------------------------------------------ */
/* Le point d’accès (REL-F1)                                           */
/* ------------------------------------------------------------------ */

/**
 * Qui passe par Relais, ce qu’il tient et ce qu’il lance. Clients : Sillage
 * se déclare par `application_name` (docs/api-contract.md l. 342) ; Karl
 * Scraper confie ses agents à Relais depuis le 21/09/2026 (dossier de faits
 * de Karl Scraper) ; tout outil qui a la clé (page « Intégrer un outil ») ;
 * la console elle-même (« Nouvelle session »). Ce que Relais tient : README
 * l. 6-8, docs/architecture.md, backend/src/launch_brake.rs. Versions
 * épinglées : runtime/package.json.
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
    alt: 'Le tableau de bord de Relais : cinq agents actifs, la consommation des sept derniers jours et la capacité de trois abonnements de démonstration.',
    legende: 'Le tableau de bord, fenêtre entière, sur des données de démonstration. Un clic l’agrandit.',
  },
  'conversation-perimetre': {
    alt: 'Une conversation dans Relais : chaque appel d’outil suivi de sa décision ; la lecture d’un fichier hors du périmètre échoue, avec son motif.',
    legende: 'Lecture refusée hors du périmètre, motif à l’appui ; à droite, les dossiers ouverts en lecture et en écriture.',
    // « Échec » sur la lecture refusée ; la loupe sur le motif rendu par Relais.
    cible: { x: 60.2, y: 38.2 },
    loupe: { x: 28.5, y: 58.5, zoom: 3.1, largeur: 60, ratio: '4 / 1', coin: 'haut-droite', dessous: true },
  },
  capacite: {
    alt: 'La capacité de trois abonnements de démonstration : quotas de cinq heures et de sept jours, chacun face au repère de son seuil de protection.',
    legende: 'Trois abonnements disponibles, chacun sous son seuil de protection.',
  },
  'garde-fous': {
    alt: 'Les garde-fous d’un abonnement : nouvelles sessions refusées dès 95 % du quota ; une session déjà ouverte n’est jamais coupée.',
    legende: 'Le seuil de protection : 95 % par défaut.',
    // Le champ « 95 » ; la loupe sur « Une session déjà ouverte n’est jamais coupée ».
    cible: { x: 40.8, y: 67.8 },
    loupe: { x: 54.5, y: 57.3, zoom: 2.5, largeur: 64, ratio: '6 / 1', coin: 'haut-droite', dessous: true },
  },
  analyse: {
    alt: 'L’analyse de Relais sur des données de démonstration : durée médiane et P95 des tours, débit, et part des tokens relus depuis le cache.',
    legende: 'Le P95 des tours, calculé par Relais sur les données de démonstration.',
    // Le P95 d’un tour ; la loupe sur les quatre mesures de performance.
    cible: { x: 34.5, y: 30 },
    loupe: { x: 41, y: 28, zoom: 2.4, largeur: 60, ratio: '3 / 1', coin: 'bas-droite', dessous: true },
  },
};

/* ------------------------------------------------------------------ */
/* Comment je l’ai construit (gabarit E5 · 4)                          */
/* ------------------------------------------------------------------ */

export const DECISIONS: readonly Decision[] = [
  {
    // backend/src/provider.rs l. 215 et 300-306 (environnement vidé, liste
    // blanche, dossier de configuration par profil) ; README l. 182 ;
    // docs/architecture.md l. 76.
    contrainte: 'Plusieurs abonnements sur une même machine, alors que le CLI lit par défaut la connexion et les variables d’environnement de l’utilisateur.',
    choix: 'Relais lance sa propre version épinglée de chaque CLI, jamais celle installée sur la machine, avec un dossier de configuration par abonnement et un environnement vidé, puis rempli depuis une liste blanche.',
    effet: 'Aucune clé ni variable d’un abonnement ne passe à un autre, et deux abonnements liés au même compte sont signalés.',
  },
  {
    // docs/filesystem-scope.md ; docs/audit-permissions-demo.md l. 12-21 et
    // 73-74 ; docs/registre-correctifs.md l. 208-210 et « Statut » de C1.
    contrainte: 'Un outil confie à l’agent un dossier où écrire et d’autres à lire seulement, alors que les permissions de l’agent ne l’isolent pas.',
    choix: 'En mode strict, sans terminal, Relais décide lui-même de chaque lecture et de chaque écriture, sur le chemin réel du fichier : remontées, liens et fichiers à plusieurs liens physiques refusés.',
    effet: 'Les 52 cas de l’audit passent. Recoupés un à un, les 69 refus de lecture et de recherche des trois jours de service ont fait corriger les motifs refusés à tort.',
  },
  {
    // backend/src/quota_routing.rs l. 1-15 et 33 (40 sessions récentes) ;
    // README l. 166-167 : « Seuils et limites refusent les nouvelles sessions
    // sans couper celles qui tournent ».
    contrainte: 'Un seuil fixe laisse entrer de nouvelles sessions alors que celles qui tournent consomment encore : huit agents en parallèle portent un petit abonnement de 90 % à plus de 100 %.',
    choix: 'Relais lit les quotas que communique le fournisseur et, avant d’admettre une session, réserve ce que consommeront celles qui tournent, au rythme appris des 40 dernières sessions.',
    effet: 'Près de son seuil, un abonnement refuse les nouvelles sessions, sans couper celles qui tournent.',
  },
  {
    // backend/src/launch_brake.rs l. 1-35 ; commits f45d3bd et cba3002 (05/10/2026).
    contrainte: 'Le 27/09/2026, un outil a recréé une session par minute pendant sept heures, sur un abonnement où chacune mourait en deux secondes ; Relais n’enregistrait que « code 1 ».',
    choix: 'Un frein par application et par abonnement : vingt lancements d’affilée, puis un toutes les trois secondes. Trois échecs au démarrage suspendent l’abonnement, et l’erreur cite la dernière ligne du CLI.',
    effet: 'Un lancement refusé attend une minute, puis le double à chaque refus, jusqu’à une heure ; l’abonnement rouvre dès qu’une session répond, ou d’un clic sur « Réessayer ».',
  },
];

/* ------------------------------------------------------------------ */
/* Sortie (gabarit E5 · 5)                                             */
/* ------------------------------------------------------------------ */

/** Dépôt privé : aucun lien public. */
export const LIENS_SORTIE: readonly LienProjet[] = [];

/** Ce que schema.org dit du projet (lib/seo.ts) : intégration continue sur Windows et macOS (README l. 222-223). */
export const SCHEMA: SchemaProjet = { type: 'SoftwareApplication', categorie: 'DeveloperApplication', systemes: 'Windows, macOS' };
