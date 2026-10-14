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
import { typo } from '../lib/typo';
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
  besoin: 'Donner aux outils de ma machine un seul point d’accès local aux agents Claude Code et Codex, qui isole leurs comptes, décide de leurs permissions et garde leurs conversations.',
  // docs/registre-correctifs.md l. 3-6 et 28 : la base de l’instance en
  // service après trois jours (du 21 au 23/09/2026), relue à bdf041f. Le
  // compte est figé au 23/09/2026 : c’est sa date, pas celle de la lecture.
  chiffre: { valeur: '1 011', libelle: 'décisions de permission en trois jours de service', releve: '23 septembre 2026' },
  // git log à bdf041f : 260 commits, un seul auteur.
  role: 'Conçu et développé seul',
  // Une instance en service sur la machine, vue le 14/10/2026 ; « en usage
  // quotidien » n’est pas sourcé et attend la réponse de Charles, comme pour
  // Sillage et Karl Scraper (docs/a-confirmer.md).
  statut: { texte: 'Outil personnel, en usage sur ma machine' },
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
      alt: typo('Le périmètre d’une session dans Relais : aucun terminal, lecture seule dans les spécifications, écriture dans le seul projet confié.'),
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
  // quotidien » attend la réponse de Charles.
  statut: { texte: 'Outil personnel, en usage sur ma machine' },
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
/* Comment je l’ai construit (gabarit E5 · 4)                          */
/* ------------------------------------------------------------------ */

export const DECISIONS: readonly Decision[] = [
  {
    // backend/src/provider.rs l. 215 et 300-306 (environnement vidé, liste
    // blanche, dossier de configuration par profil) ; README l. 182 (« CLI
    // épinglé dans `runtime/` ») ; docs/architecture.md l. 76.
    contrainte: 'Plusieurs abonnements sur une même machine, alors que Claude Code et Codex lisent par défaut la connexion et les variables d’environnement de l’utilisateur.',
    choix: 'Relais lance sa propre version de chaque agent, fixée dans son dossier, jamais celle installée sur la machine, avec un dossier de configuration par abonnement et un environnement vidé, puis rempli depuis une liste blanche.',
    effet: 'Aucune clé ni variable d’un abonnement ne passe à un autre, et deux abonnements liés au même compte sont signalés.',
  },
  {
    // docs/filesystem-scope.md l. 62-81 (liens et jonctions sortant des
    // racines, `..`, fichiers à plusieurs liens physiques) ;
    // docs/audit-permissions-demo.md l. 12-17, 73-74 et 94-104 (défaut
    // reproduit puis corrigé après signalement) ; docs/registre-correctifs.md
    // C1 (l. 208-215, « Recoupés avec les paramètres des appels ») et son
    // Statut (correctifs f2a2d68 : groupes, négation, motif absolu, racine du
    // parcours, dossiers ignorés ; `..`, `~`, `:` toujours refusés).
    contrainte: 'Les permissions de l’agent ne suffisent pas à le garder dans les dossiers confiés : un chemin peut remonter hors du dossier, passer par un lien ou désigner un fichier qui porte un second nom ailleurs.',
    choix: 'Relais vérifie le chemin réel du fichier, pas celui que l’agent écrit : les chemins qui remontent hors du dossier, les liens qui en sortent et les fichiers à plusieurs liens physiques sont refusés.',
    effet: 'L’audit de 52 cas a trouvé un défaut sur les fichiers à plusieurs liens physiques, corrigé après signalement ; les 52 cas passent. Recoupés avec les paramètres des appels, les 69 refus de lecture et de recherche des trois premiers jours de service ont montré des recherches refusées à tort : j’ai assoupli les règles des recherches, sans rouvrir les chemins hors du périmètre.',
  },
  {
    // backend/src/quota_routing.rs l. 1-15 et 33 (40 sessions récentes).
    contrainte: 'Un seuil fixe laisse entrer de nouvelles sessions alors que celles qui tournent consomment encore : huit agents lancés en parallèle peuvent faire passer un petit abonnement de 90 % à plus de 100 % de son quota avant que le premier ait fini.',
    choix: 'Avant d’admettre une session, Relais réserve ce que consommeront celles qui tournent et la nouvelle, au rythme qu’il apprend des 40 dernières sessions.',
    effet: 'La réserve suit l’usage réel de chaque abonnement, et l’abonnement refuse avant d’atteindre son seuil, au lieu de le laisser dépasser par les sessions déjà lancées.',
  },
  {
    // backend/src/launch_brake.rs l. 1-35 ; commits f45d3bd (503 et
    // Retry-After doublé pour un abonnement suspendu nommé, 429 au-delà du
    // débit) et cba3002 (« Réessayer »), du 05/10/2026.
    contrainte: 'Le 27/09/2026, un outil a recréé une session par minute pendant sept heures, sur un abonnement où chacune mourait en deux secondes ; Relais n’enregistrait qu’un code d’erreur, sans message.',
    choix: 'Un frein par application et par abonnement : vingt lancements d’affilée, puis un toutes les trois secondes. Trois échecs d’affilée au démarrage suspendent l’abonnement, et l’erreur cite la dernière ligne d’erreur de l’agent.',
    effet: 'Tant que l’abonnement est suspendu, un lancement qui le nomme est refusé avec une attente conseillée d’une minute, doublée à chaque refus jusqu’à une heure ; l’abonnement rouvre dès qu’une de ses sessions répond, ou d’un clic sur « Réessayer ».',
  },
];

/* ------------------------------------------------------------------ */
/* Sortie (gabarit E5 · 5)                                             */
/* ------------------------------------------------------------------ */

/** Dépôt privé : aucun lien public. */
export const LIENS_SORTIE: readonly LienProjet[] = [];

/** Ce que schema.org dit du projet (lib/seo.ts) : intégration continue sur Windows et macOS (README l. 222-223). */
export const SCHEMA: SchemaProjet = { type: 'SoftwareApplication', categorie: 'DeveloperApplication', systemes: 'Windows, macOS' };
