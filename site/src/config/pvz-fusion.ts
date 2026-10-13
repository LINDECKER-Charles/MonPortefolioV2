/**
 * Données de la page /projets/pvz-fusion : textes du gabarit, relevés des
 * figures et liens publics. Chaque fait vient de docs/matiere-premiere.md
 * (« PvZ Fusion — témoignage du 2026-10-13 », « Audit public du 2026-10-13 »
 * et « Relevés publics de la page de projet ») ; un fait non sourcé n’entre
 * pas ici.
 *
 * Liens : seulement les dépôts publics de la liste blanche (liens-publics.ts)
 * et le projet multilingue amont. Le fork PVZF-Translation-fr ne sert qu’aux
 * permaliens de la note de méthode.
 */
import type { EntreeSommaire } from './navigation';
import type { DonneesFiche, PreuveEnTete } from '../components/projets/gabarit/types';

/* ------------------------------------------------------------------ */
/* Liens publics                                                       */
/* ------------------------------------------------------------------ */

const AMONT = 'https://github.com/Teyliu/PVZF-Translation';
/** Révision figée du bilan, dans le fork français (26/09/2026). */
const REVISION_BILAN = 'eda0b63fbacda194465144c9ec20cb975c7a9c6a';
/** Première révision relevée (16/10/2025) : le README amont y donne le jeu en 3.0.1, le français en 2.3.1. */
const REVISION_DEPART = 'c62379089f1a54883766e0310f77dfb783d23368';
const FORK = 'https://github.com/LINDECKER-Charles/PVZF-Translation-fr';

export const LIENS = {
  amont: AMONT,
  bilan: `${AMONT}/blob/main/Docs/french-contributions.md`,
  bilanFige: `${FORK}/blob/${REVISION_BILAN}/Docs/french-contributions.md`,
  textesSources: `${FORK}/blob/${REVISION_BILAN}/PvZ_Fusion_Translator/Localization/French/Strings/translation_strings.json#L40-L51`,
  journalFige: `${FORK}/blob/${REVISION_BILAN}/Docs/french-contributor/lindecker-charles.md`,
  prs: `${AMONT}/pulls?q=is%3Apr+is%3Amerged+author%3ALINDECKER-Charles+created%3A2025-10-16..2026-09-26`,
  pr110: `${AMONT}/pull/110`,
  /** Les publications du projet multilingue : 15 versions du jeu en 25 publications (PC, Android, préversions), du 12/08/2025 au 01/10/2026. */
  versions: `${AMONT}/releases`,
  readmeDepart: `${AMONT}/blob/${REVISION_DEPART}/README.md`,
  /** L’intégration du Console Manager au dépôt officiel, fusionnée le 31/10/2025. */
  pr23: `${AMONT}/pull/23`,
  outilCode: 'https://github.com/LINDECKER-Charles/PVZ-Fuzion-ConsolManager',
  outilSite: 'https://lindecker-charles.github.io/PVZ-Fuzion-ConsolManager/',
  outilNpm: 'https://www.npmjs.com/package/@charles_lindecker/pvzf-console',
} as const;

/* ------------------------------------------------------------------ */
/* En-tête (gabarit E5 · 1 et 2)                                       */
/* ------------------------------------------------------------------ */

export const EN_TETE = {
  /** Une phrase par ligne : le parallèle des deux phrases ne se casse pas. */
  titre: ['Traduire un jeu.', 'Faire grandir une équipe.'],
  chapeau:
    'PvZ Fusion change sans cesse : quinze versions en quatorze mois. Quand je suis arrivé, la traduction française avait plusieurs versions de retard. Dix mois plus tard, avec l’équipe que j’ai recrutée et formée, il ne manquait plus une seule entrée dans les fiches et les textes d’interface.',
  liens: [{ href: AMONT, libelle: 'Le projet multilingue' }],
};

export const PREUVES: readonly PreuveEnTete[] = [
  { valeur: '20', libelle: 'personnes formées au pôle francophone', source: 'Témoignage', date: 'confirmé le 13/10/2026' },
  {
    valeur: '0',
    libelle: 'entrée manquante en août 2026, contre 1\u00a0335 sur 2\u00a0415 à mon arrivée',
    source: 'Historique public du dépôt',
    date: 'relevé le 13/10/2026',
    surligne: true,
  },
  { valeur: '35', libelle: 'pull requests fusionnées dans le projet officiel', source: 'GitHub', date: 'du 16/10/2025 au 26/09/2026' },
];

export const FICHE: DonneesFiche = {
  besoin: 'Rattraper, à plusieurs, la traduction française d’un jeu qui sort une nouvelle version chaque mois environ.',
  part: 'J’ai recruté et formé l’équipe, construit l’outil qui transforme chaque mise à jour en liste de tâches, et livré son travail au projet officiel en créditant chacun.',
  role: 'Traducteur, puis lead du pôle francophone et mainteneur du projet multilingue',
  periode: 'Depuis octobre 2025 ; lead depuis décembre 2025',
  equipe: 'Bénévoles, jusqu’à dix en même temps',
  statut: { texte: 'En cours, bénévole', etat: 'actif' },
  liens: [
    { href: AMONT, libelle: 'Projet multilingue' },
    { href: `${AMONT}/blob/main/Docs/french-contributions.md`, libelle: 'Bilan du pôle' },
    { href: LIENS.outilSite, libelle: 'Console Manager' },
  ],
};

/** Les sections du corps : sommaire de l’en-tête et navigation de page. */
export const SECTIONS: readonly EntreeSommaire[] = [
  { id: 'depart', titre: 'Le point de départ' },
  { id: 'equipe', titre: 'L’équipe' },
  { id: 'semaine', titre: 'La semaine type' },
  { id: 'resultat', titre: 'Le résultat' },
  { id: 'construit', titre: 'Comment je l’ai construit' },
  { id: 'retiens', titre: 'Ce que j’en retiens' },
];

/* ------------------------------------------------------------------ */
/* Relevés (docs/matiere-premiere.md, « Relevés publics… »)            */
/* ------------------------------------------------------------------ */

/** Couverture du français par clé, une révision de la branche principale par relevé. */
export interface Releve {
  revision: string;
  /** Date ISO de la révision. */
  date: string;
  plantes: [manquantes: number, anglais: number];
  zombies: [manquants: number, anglais: number];
  textes: [manquants: number, anglais: number];
}

export const RELEVES: readonly Releve[] = [
  { revision: 'c623790', date: '2025-10-16', plantes: [218, 477], zombies: [76, 162], textes: [1041, 1776] },
  { revision: '9aaf6ed', date: '2025-12-15', plantes: [89, 499], zombies: [93, 179], textes: [1067, 1677] },
  { revision: 'c075005', date: '2026-02-15', plantes: [38, 552], zombies: [78, 191], textes: [1507, 2114] },
  { revision: '99bf30e', date: '2026-03-15', plantes: [0, 557], zombies: [67, 192], textes: [1536, 2173] },
  { revision: '05a1ceb', date: '2026-06-16', plantes: [34, 631], zombies: [10, 214], textes: [300, 3030] },
  { revision: '9428979', date: '2026-07-16', plantes: [0, 653], zombies: [0, 223], textes: [12, 3464] },
  { revision: 'c180d82', date: '2026-08-15', plantes: [0, 662], zombies: [0, 224], textes: [0, 3482] },
  { revision: '13d63b1', date: '2026-10-12', plantes: [5, 721], zombies: [0, 236], textes: [24, 3700] },
];

export const manquantes = (releve: Releve) => releve.plantes[0] + releve.zombies[0] + releve.textes[0];
export const anglaises = (releve: Releve) => releve.plantes[1] + releve.zombies[1] + releve.textes[1];

/** Le relevé où il ne manque plus rien (août 2026). */
export const RELEVE_ATTEINT = '2026-08-15';

/** Rôles de Charles (journal public) et arrivées consignées dans les journaux des membres. */
export const ROLES = [
  { titre: 'Traducteur', date: '2025-10-21', libelle: '21/10/2025' },
  { titre: 'Lead du pôle', date: '2025-12-05', libelle: '05/12/2025' },
  { titre: 'Mainteneur', date: '2026-09-26', libelle: 'au plus tard le 26/09/2026' },
] as const;

export const ARRIVEES: readonly string[] = [
  '2025-12-08',
  '2025-12-08',
  '2025-12-15',
  '2025-12-22',
  '2026-02-16',
  '2026-02-20',
  '2026-03-02',
  '2026-03-23',
  '2026-03-23',
];

/** La 4.0 en six jours. */
export const QUATRE_ZERO = [
  { date: '2026-09-20', libelle: '20/09/2026', texte: 'Textes d’origine de la 4.0 versés au dépôt' },
  { date: '2026-09-26', libelle: '26/09', texte: 'Pull request française fusionnée' },
  { date: '2026-10-01', libelle: '01/10', texte: 'Version multilingue publiée' },
] as const;

/* ------------------------------------------------------------------ */
/* L’équipe                                                            */
/* ------------------------------------------------------------------ */

/**
 * Les trois temps de la formation (page précédente, conservés), chacun sous
 * sa case du triptyque PVZ-02 (PVZ-02a, PVZ-02b, PVZ-02c du registre).
 */
export const PARCOURS_EQUIPE = [
  { visuel: 'PVZ-02a', titre: 'Accueillir', texte: 'Faire une place aux nouveaux et les accompagner dans leurs premières contributions.' },
  { visuel: 'PVZ-02b', titre: 'Former et relire', texte: 'Apprendre en faisant, expliquer les corrections et construire des repères communs.' },
  { visuel: 'PVZ-02c', titre: 'Contribuer en autonomie', texte: 'Faire confiance : laisser chacun avancer seul et prendre sa place dans le pôle.' },
] as const;

/* ------------------------------------------------------------------ */
/* La semaine type : les quatre gestes de gestion de projet            */
/* ------------------------------------------------------------------ */

export interface Geste {
  id: 'organiser' | 'livrer' | 'motiver' | 'remercier';
  /** Emplacement du registre des visuels. */
  visuel: string;
  outil: string;
  titre: string;
  texte: string;
  trace?: { href: string; libelle: string };
}

/** Témoignage de Charles (questions C7), dans l’ordre de la semaine. */
export const GESTES: readonly Geste[] = [
  {
    id: 'organiser',
    visuel: 'PVZ-05',
    outil: 'Trello',
    titre: 'Un endroit pour avancer ensemble.',
    texte: 'J’ai centralisé le travail sur un tableau commun pour que chacun puisse retrouver ce qu’il y avait à faire.',
  },
  {
    id: 'livrer',
    visuel: 'PVZ-07',
    outil: 'Une pull request par semaine',
    titre: 'Faire du travail une livraison.',
    texte: 'Je regroupais les contributions dans une pull request, une proposition de mise à jour adressée au projet multilingue, qui cite chacun.',
    trace: { href: LIENS.pr110, libelle: 'La PR #110 et ses huit crédits' },
  },
  {
    id: 'motiver',
    visuel: 'PVZ-08',
    outil: 'Classement hebdomadaire',
    titre: 'Donner envie de se dépasser.',
    texte: 'Chaque semaine, un classement mettait en avant les contributions de chacun.',
  },
  {
    id: 'remercier',
    visuel: 'PVZ-11',
    outil: 'Récapitulatif individuel',
    titre: 'Prendre le temps de dire merci.',
    texte: 'J’envoyais à chaque contributeur un petit bilan de sa semaine, pour le féliciter et le remercier de son travail.',
  },
];

/* ------------------------------------------------------------------ */
/* Le résultat                                                         */
/* ------------------------------------------------------------------ */

export const VOLUMES = [
  { valeur: '5\u00a0179', libelle: 'nouvelles traductions déclarées au bilan du pôle', source: 'Bilan public', date: '26/09/2026' },
  { valeur: '583', libelle: 'traductions ajustées au fil des versions', source: 'Bilan public', date: '26/09/2026' },
  { valeur: '637', libelle: 'relectures consignées dans mon bilan', source: 'Bilan public', date: '26/09/2026' },
] as const;

/** Corrections du journal public de Charles, semaine du 21/09/2026 (PR #223). */
export const CORRECTIONS = [
  { entree: 'Four Polaire, recharge', avant: '7,5\u00a0s', apres: '30\u00a0s' },
  { entree: 'Four Épicéa, retour au Four Polaire', avant: '210\u00a0s', apres: '125\u00a0s' },
  { entree: 'Carambole Maître-épéiste', avant: '« à portée infinie »', apres: '« à perforation infinie »' },
] as const;

/** Cinq commandes des menus, translation_strings.json, lignes 40 à 51 (révision du 26/09/2026). */
export const COMMANDES = [
  { origine: '选择你的植物', francais: 'Choisissez Vos Plantes' },
  { origine: '一起摇滚吧！', francais: 'C’est Parti\u00a0!' },
  { origine: '查看图鉴', francais: 'Voir l’Almanach' },
  { origine: '返回游戏', francais: 'Reprendre' },
  { origine: '重新开始', francais: 'Recommencer' },
] as const;

/* ------------------------------------------------------------------ */
/* Comment je l’ai construit (gabarit E5 · 4)                          */
/* ------------------------------------------------------------------ */

export const DECISIONS = [
  {
    contrainte: 'Une nouvelle version du jeu sort chaque mois environ, et personne ne sait ce qui manque.',
    choix: 'Un outil qui compare chaque langue à l’anglais et écrit le bloc exact à traduire.',
    effet: 'Chaque version devient une liste de tâches, entrée par entrée.',
    lien: { href: LIENS.outilCode, libelle: 'Le code du Console Manager' },
  },
  {
    contrainte: 'Des bénévoles qui arrivent sans savoir par où commencer.',
    choix: 'Une carte de tâche par entrée manquante : chacun prend ce qu’il peut traduire.',
    effet: 'Chacun prend une tâche à sa mesure, jusqu’à dix en même temps au plus fort.',
  },
  {
    contrainte: 'Un travail bénévole reste invisible si personne ne le nomme.',
    choix: 'Une pull request par semaine qui crédite chacun, et un bilan individuel tiré de l’outil.',
    effet: 'Douze personnes créditées en plus de moi ; la PR #110 en crédite huit, moi compris.',
    lien: { href: LIENS.pr110, libelle: 'La PR #110' },
  },
] as const;

/* ------------------------------------------------------------------ */
/* Sortie (gabarit E5 · 5)                                             */
/* ------------------------------------------------------------------ */

export const LIENS_SORTIE = [
  { href: AMONT, libelle: 'Le projet multilingue' },
  { href: LIENS.bilan, libelle: 'Le bilan du pôle' },
  { href: LIENS.prs, libelle: 'Les 35 pull requests fusionnées' },
  { href: LIENS.outilCode, libelle: 'Le Console Manager' },
] as const;
