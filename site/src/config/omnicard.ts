/**
 * Données de la page /projets/omnicard : textes du gabarit, cartes, règles et
 * liens publics. Chaque fait vient de docs/questions.md (D1, D2 et « Page
 * Omnicard (2026-10-13) »), de docs/matiere-premiere.md (« Omnicard —
 * complément du 2026-10-13 ») ou du dépôt de présentation public, relu le
 * 13/10/2026 à la révision 8be9cbb (README, CARDS-SHOWCASE.md, docs/rules.md,
 * docs/keywords.md, docs/cards/*.md, Archive/Carte/saison_01). Un fait non
 * sourcé n’entre pas ici.
 *
 * Liens : seulement le dépôt de présentation public (liste blanche,
 * liens-publics.ts). Jamais le code privé, ni omnicard.fr, ni test.omnicard.fr
 * (hors ligne, en attente de refonte), ni Discord, ni Ko-fi.
 *
 * Non affiché tant que Charles ne l’a pas validé (cahier, Q8) : la date de
 * lancement du 16/05/2026 (CHANGELOG.md, 1.0.0).
 */
import type { EntreeSommaire } from './navigation';
import type { Decision, DonneesFiche, LienProjet, PreuveEnTete } from '../components/projets/gabarit/types';

/* ------------------------------------------------------------------ */
/* Liens publics : le dépôt de présentation, et lui seul                */
/* ------------------------------------------------------------------ */

const DEPOT = 'https://github.com/LINDECKER-Charles/public-Omnicard';

export const LIENS = {
  depot: DEPOT,
  regles: `${DEPOT}/blob/main/docs/rules.md`,
  motsCles: `${DEPOT}/blob/main/docs/keywords.md`,
  galerie: `${DEPOT}/blob/main/CARDS-SHOWCASE.md`,
  archive: `${DEPOT}/tree/main/Archive/Carte/saison_01`,
} as const;

/* ------------------------------------------------------------------ */
/* En-tête (gabarit E5 · 1 et 2)                                       */
/* ------------------------------------------------------------------ */

export const EN_TETE = {
  titre: 'Imaginer le jeu. Construire les règles.',
  chapeau:
    'Un jeu de cartes inventé sur papier avec mon cousin, que j’ai transformé seul en jeu en ligne : les cartes rééquilibrées, le serveur qui arbitre les parties et l’interface.',
  liens: [{ href: DEPOT, libelle: 'Règles et cartes (GitHub)' }] satisfies LienProjet[],
};

export const PREUVES: readonly PreuveEnTete[] = [
  {
    valeur: '≈ 3 mois',
    libelle: 'de développement cumulé, seul',
    source: 'Témoignage',
    date: 'questionnaire D1 et D2',
    surligne: true,
  },
  {
    valeur: '181',
    libelle: 'cartes dans le catalogue public, réparties en trois univers',
    source: 'Galerie publique, version 1.2.0',
    date: 'relevée le 13/10/2026',
    href: '#partie',
  },
  {
    valeur: '5',
    libelle: 'types de cartes arbitrés par le moteur de règles',
    source: 'Règles publiques du moteur',
    date: 'relevées le 13/10/2026',
    href: '#moteur',
  },
];

export const FICHE: DonneesFiche = {
  besoin: 'Faire enfin passer au numérique le jeu de cartes que nous avions inventé sur papier, mon cousin et moi.',
  part: 'J’ai repris le projet seul : rééquilibré les cartes, écrit le moteur de règles en C# qui arbitre les parties côté serveur, puis construit l’interface Angular.',
  role: 'Co-auteur du jeu papier, seul pour le jeu en ligne',
  periode: 'Depuis l’adolescence, puis en ligne',
  equipe: 'À deux sur papier, seul pour le code',
  statut: { texte: 'Hors ligne, en attente de refonte', etat: 'eteint' },
  liens: [
    { href: DEPOT, libelle: 'Dépôt public' },
    { href: LIENS.regles, libelle: 'Règles' },
    { href: LIENS.galerie, libelle: 'Galerie de cartes' },
  ],
  aConfirmer: { periode: 'Dates de début et de lancement à confirmer par Charles (Q8)' },
};

/** Les sections du corps : sommaire de l’en-tête et navigation de page. */
export const SECTIONS: readonly EntreeSommaire[] = [
  { id: 'papier', titre: 'Le jeu papier' },
  { id: 'reequilibrer', titre: 'Rééquilibrer les cartes' },
  { id: 'partie', titre: 'Une partie' },
  { id: 'jeu', titre: 'Le jeu en images' },
  { id: 'moteur', titre: 'Le moteur de règles' },
  { id: 'construit', titre: 'Comment je l’ai construit' },
  { id: 'retiens', titre: 'Ce que j’en retiens' },
];

/* ------------------------------------------------------------------ */
/* Trois univers, trois façons de jouer (l’éventail de cartes)         */
/* ------------------------------------------------------------------ */

export interface CarteUnivers {
  id: 'gehrman' | 'jonathan' | 'floppa';
  univers: string;
  nom: string;
  /** Le mot-clé de la carte, tiré de son effet (docs/cards/*.md). */
  mecanique: string;
  detail: string;
}

/** Effets relus dans docs/cards/{bloodborne,jojo,wtf}.md (cartes 10, 79 et 5). */
export const CARTES_UNIVERS: readonly CarteUnivers[] = [
  {
    id: 'gehrman',
    univers: 'Bloodborne',
    nom: 'Gehrman, Premier Chasseur',
    mecanique: 'Invoquer',
    detail: 'En fin de tour, il invoque un chasseur d’un coût de 6 au plus : une carte en fait entrer une autre en jeu.',
  },
  {
    id: 'jonathan',
    univers: 'JoJo',
    nom: 'Jonathan Joestar',
    mecanique: 'Transformer',
    detail: 'Il se transforme selon les alliés présents sur sa ligne : les cartes se répondent et changent la partie.',
  },
  {
    id: 'floppa',
    univers: 'WTF',
    nom: 'Floppa : Mage',
    mecanique: 'Piocher',
    detail: 'En fin de tour, il pioche une carte ; si c’est un sort, il gagne une esquive. Même un chat a sa stratégie.',
  },
];

/* ------------------------------------------------------------------ */
/* Rééquilibrer mes propres cartes                                      */
/* ------------------------------------------------------------------ */

/** Où se lit la valeur sur la carte : la pastille de coût, la case de gauche ou celle de droite. */
export type ZoneCarte = 'cout' | 'gauche' | 'droite';

export interface Reequilibrage {
  id: 'gehrman' | 'gitgud' | 'floppa';
  nom: string;
  /** Le nom court, sur la commande. */
  court: string;
  /** Ce qui change, valeur par valeur, lu sur les deux cartes. */
  changements: readonly { quoi: string; avant: string; apres: string; zones: readonly ZoneCarte[] }[];
}

/**
 * Saison 1 : cartes de l’archive publique (Archive/Carte/saison_01). Version
 * actuelle du projet : exports de l’outil du projet, depuis ses données, le
 * 13/10/2026 (docs/assets-omnicard.md). Le catalogue public 1.2.0 affiche
 * encore 4/8 pour Gehrman et 0/4 pour Floppa : Mage ; la version en ligne de
 * ces valeurs reste à confirmer par Charles, d’où la marque « à confirmer ».
 */
export const REEQUILIBRAGES: readonly Reequilibrage[] = [
  { id: 'gehrman', nom: 'Gehrman, Premier Chasseur', court: 'Gehrman', changements: [{ quoi: 'Statistiques', avant: '4/8', apres: '4/15', zones: ['droite'] }] },
  { id: 'gitgud', nom: 'GitGud', court: 'GitGud', changements: [{ quoi: 'Coût', avant: '13', apres: '10', zones: ['cout'] }] },
  {
    id: 'floppa',
    nom: 'Floppa : Mage',
    court: 'Floppa',
    changements: [
      { quoi: 'Coût', avant: '5', apres: '6', zones: ['cout'] },
      { quoi: 'Statistiques', avant: '0/4', apres: '2/8', zones: ['gauche', 'droite'] },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Une partie en trente secondes (docs/rules.md)                        */
/* ------------------------------------------------------------------ */

/** Les repères du plateau, chacun lu dans la version joueur des règles du moteur. */
export const REPERES_PARTIE = [
  { valeur: '30', libelle: 'points de vie par héros ; à 0, la partie est perdue' },
  { valeur: '40', libelle: 'cartes par deck, à puiser dans les trois univers' },
  { valeur: '10', libelle: 'mana au plus, +1 à chaque tour ; ce qui reste devient cristaux, 5 au plus' },
  { valeur: '2', libelle: 'lignes d’unités par joueur, 10 places chacune' },
] as const;

/* ------------------------------------------------------------------ */
/* Le jeu en images : captures d’une version précédente                 */
/* ------------------------------------------------------------------ */

export interface Ecran {
  id: 'collection' | 'deck' | 'ouverture';
  titre: string;
  sousTitre: string;
  alt: string;
  detail: string;
}

export const ECRANS: readonly Ecran[] = [
  {
    id: 'collection',
    titre: 'Collectionner',
    sousTitre: 'Des cartes de plusieurs univers',
    alt: 'La collection Omnicard : les cartes possédées, leur nombre d’exemplaires et des filtres par type, statut, rareté et série.',
    detail: 'Retrouver ses cartes, explorer leurs effets et filtrer par univers, type ou rareté.',
  },
  {
    id: 'deck',
    titre: 'Composer son deck',
    sousTitre: 'Faire des choix qui se répondent',
    alt: 'Le deck prédéfini « Chasse Sanglante » à gauche et le catalogue des cartes à droite, dans le créateur de deck Omnicard.',
    detail: 'Un deck, c’est le jeu de cartes que l’on prépare pour la partie. À gauche, sa sélection ; à droite, les cartes à y ajouter.',
  },
  {
    id: 'ouverture',
    titre: 'Ouvrir un booster',
    sousTitre: 'Découvrir de nouvelles possibilités',
    alt: 'L’écran d’ouverture d’un booster Omnicard révèle sept nouvelles cartes de l’univers Bloodborne.',
    detail: 'Un booster est un paquet de cartes à découvrir : de quoi enrichir sa collection et imaginer de nouvelles combinaisons.',
  },
];

/* ------------------------------------------------------------------ */
/* Le moteur de règles                                                  */
/* ------------------------------------------------------------------ */

/**
 * GitGud (carte 9, docs/cards/wtf.md) : « Dans 5 tours, la partie se termine
 * par une égalité. » Délai(N) (docs/keywords.md) : le compteur ne décrémente
 * qu’à la fin du tour du joueur qui a programmé l’effet.
 */
export const GITGUD = {
  effet: 'Dans 5 tours, la partie se termine par une égalité.',
  delai: 5,
} as const;

/** Le trajet d’une action de jeu, du navigateur au serveur et retour. */
export const TRAJET = [
  { logo: 'angular', titre: 'Le joueur choisit', detail: 'L’interface Angular : le rendu des cartes, le catalogue, les filtres et l’éditeur de decks.' },
  { logo: 'csharp', titre: 'Le moteur résout', detail: 'Les règles en C#, côté serveur : le moteur vérifie l’action et applique ses effets.' },
  { logo: 'dotnet', titre: 'La partie se met à jour', detail: 'SignalR, la liaison en temps réel, renvoie l’état de la partie aux deux joueurs.' },
] as const;

/* ------------------------------------------------------------------ */
/* Comment je l’ai construit (gabarit E5 · 4)                          */
/* ------------------------------------------------------------------ */

export const DECISIONS: readonly Decision[] = [
  {
    contrainte: 'Le passage au jeu vidéo traînait, et je voulais jouer vite.',
    choix: 'Angular et .NET, que je connaissais déjà, plutôt qu’un moteur de jeu à découvrir.',
    effet: 'Un jeu dans le navigateur, sur une stack maîtrisée mais pas faite pour ça.',
  },
  {
    contrainte: 'Deux navigateurs, une seule partie : il faut un arbitre.',
    choix: 'Un moteur de règles en C#, côté serveur : il mélange, fait piocher, déroule les tours et résout chaque effet.',
    effet: 'Chaque joueur envoie son action ; le serveur tranche et renvoie l’état de la partie.',
    lien: { href: LIENS.regles, libelle: 'Les règles du moteur, version joueur' },
  },
  {
    contrainte: 'Des parties en temps réel, sur une stack qui n’était pas pensée pour un jeu.',
    choix: 'SignalR pour le temps réel, puis le cache, le prérendu serveur et un déploiement optimisé.',
    effet: 'Des outils que je pensais connaître, approfondis un par un.',
  },
];

/* ------------------------------------------------------------------ */
/* Sortie (gabarit E5 · 5)                                             */
/* ------------------------------------------------------------------ */

export const LIENS_SORTIE: readonly LienProjet[] = [
  { href: DEPOT, libelle: 'Le dépôt de présentation' },
  { href: LIENS.regles, libelle: 'Les règles du jeu' },
  { href: LIENS.galerie, libelle: 'La galerie des 181 cartes' },
  { href: LIENS.archive, libelle: 'L’archive de la saison 1' },
];
