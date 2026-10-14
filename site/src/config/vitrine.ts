/**
 * Contenu de la vitrine /projets (cahier des charges, § 5.2 ; décisions de
 * Charles du 13/10/2026). L’ordre, le nom canonique et l’étiquette de preuve
 * de chaque projet viennent de VITRINE (config/projets.ts) ; ce fichier n’y
 * ajoute que ce que la carte montre : le besoin, un seul chiffre, le rôle, le
 * statut, les liens publics et trois technologies au plus.
 *
 * Chaque fait vient de docs/matiere-premiere.md, d’un README public ou d’une
 * page publique du projet (source notée à côté). Un fait que Charles n’a pas
 * confirmé n’entre pas ici (Q8 : rien d’affiché sans réponse). La réserve sur
 * le nom « League Of Data Base » est dite une fois, dans la note de sources
 * de sa page, et non sur chaque carte.
 *
 * Liens : seulement les dépôts publics de la liste blanche
 * (config/liens-publics.ts), les sites en ligne des projets et leurs paquets.
 * Aucune démo hors ligne : celle de Shreksophone est servie par GitHub Pages
 * (réponse 200 vérifiée le 13/10/2026), pas par l’ancien domaine bloqué.
 */
import type { ImageMetadata } from 'astro';
import type { ProjetVitrine } from './projets';
import angular from '../assets/stacks/angular.svg';
import capacitor from '../assets/stacks/capacitor.svg';
import csharp from '../assets/stacks/csharp.svg';
import dotnet from '../assets/stacks/dotnet.svg';
import nodejs from '../assets/stacks/nodejs.svg';
import postgresql from '../assets/stacks/postgresql.svg';
import trello from '../assets/stacks/trello.svg';
import typescript from '../assets/stacks/typescript.svg';
import vitest from '../assets/stacks/vitest.svg';

export interface LienPublic {
  href: string;
  libelle: string;
}

export interface CarteVitrine {
  /** Le besoin en une phrase : à quoi sert le projet, avant les détails. */
  besoin: string;
  /** Un seul chiffre sourcé par carte. */
  chiffre: { valeur: string; libelle: string };
  role: string;
  statut: { texte: string; etat?: 'actif' | 'ouvert' | 'eteint' };
  liens: readonly LienPublic[];
  technos: readonly { src: ImageMetadata; alt: string }[];
  /** Ce qui reste à confirmer sur le nom, en info-bulle de la marque. */
  aConfirmer?: string;
}

export const CARTES: Readonly<Record<ProjetVitrine['id'], CarteVitrine>> = {
  pvz: {
    // Matière première : « Parcours » (lead, mainteneur, 20 personnes formées) ;
    // 15 versions du jeu d’août 2025 à octobre 2026, en 25 publications multilingues (page PvZ Fusion).
    besoin: 'Rattraper, à plusieurs, la traduction française d’un jeu qui sort une nouvelle version chaque mois environ.',
    chiffre: { valeur: '20', libelle: 'personnes formées au pôle francophone' },
    role: 'Lead du pôle, mainteneur du projet multilingue',
    statut: { texte: 'En cours, bénévole' },
    liens: [{ href: 'https://github.com/Teyliu/PVZF-Translation', libelle: 'Projet multilingue (GitHub)' }],
    // L’outil du pôle (Console Manager) et le tableau de travail commun.
    technos: [
      { src: typescript, alt: 'TypeScript' },
      { src: nodejs, alt: 'Node.js' },
      { src: trello, alt: 'Trello' },
    ],
  },
  league: {
    // Production publique, relevée le 13/10/2026 : 403 patchs dans /fr/patches,
    // 21 langues d’interface ; « conçu et maintenu par un développeur seul » (/fr/about).
    besoin: 'Retrouver les valeurs exactes d’un ancien patch de League of Legends, dans sa langue.',
    chiffre: { valeur: '403', libelle: 'patchs, dans 21 langues' },
    role: 'Conçu et maintenu seul',
    statut: { texte: 'En ligne' },
    liens: [
      { href: 'https://league-of-data-base.com/fr/', libelle: 'Application' },
      { href: 'https://github.com/LINDECKER-Charles/LeagueOfDataBaseFinal', libelle: 'Code' },
    ],
    technos: [
      { src: dotnet, alt: '.NET' },
      { src: angular, alt: 'Angular' },
      { src: postgresql, alt: 'PostgreSQL' },
    ],
  },
  omnicard: {
    // Questions D1 et matière première : jeu papier inventé avec son cousin,
    // moteur de règles C# côté serveur, hors ligne en attente de refonte.
    // Chiffre et rôle de la page Omnicard (config/omnicard.ts) : 181 cartes de la
    // galerie publique 1.2.0, relevée le 13/10/2026. Le lien mène aux règles,
    // jamais à la racine du dépôt, dont le README promet encore un jeu en ligne.
    besoin: 'Le jeu de cartes inventé sur papier avec mon cousin, devenu un jeu en ligne avec son moteur de règles.',
    chiffre: { valeur: '181', libelle: 'cartes dans le catalogue public' },
    role: 'Co-auteur du jeu papier ; seul pour le jeu en ligne (équilibrage, moteur, interface)',
    statut: { texte: 'Hors ligne, en attente de refonte', etat: 'eteint' },
    liens: [{ href: 'https://github.com/LINDECKER-Charles/public-Omnicard/blob/main/docs/rules.md', libelle: 'Règles du jeu (GitHub)' }],
    technos: [
      { src: csharp, alt: 'C#' },
      { src: angular, alt: 'Angular' },
      { src: postgresql, alt: 'PostgreSQL' },
    ],
  },
  bloodborne: {
    // Matière première, « Bloodborne Legendary Run — vérification du 2026-10-08 » :
    // 22 galaxies (les constellations de la page), 1 289 objectifs uniques affichés ; web public et Android de test.
    besoin: 'Retrouver ce qu’il reste à faire dans le jeu Bloodborne, parmi des objectifs rangés en 22 constellations.',
    chiffre: { valeur: '1 289', libelle: 'objectifs' },
    role: 'Conception et développement',
    statut: { texte: 'En ligne, web ; Android en test' },
    liens: [{ href: 'https://bloodborne-legendary-run.com/fr/sky', libelle: 'Application' }],
    technos: [
      { src: dotnet, alt: '.NET' },
      { src: angular, alt: 'Angular' },
      { src: capacitor, alt: 'Capacitor' },
    ],
  },
  gup: {
    // Matière première (« Projets ») et audit gup : 153 sources enregistrées,
    // Windows, macOS et Linux ; open source, publié sur npm.
    besoin: 'Mettre à jour en une commande tout ce qui est installé sur un poste de développeur.',
    chiffre: { valeur: '153', libelle: 'sources, sur Windows, macOS et Linux' },
    role: 'Auteur et mainteneur',
    statut: { texte: 'Open source, sur npm', etat: 'ouvert' },
    liens: [
      { href: 'https://github.com/LINDECKER-Charles/gup', libelle: 'Code' },
      { href: 'https://www.npmjs.com/package/@charles_lindecker/gup', libelle: 'npm' },
    ],
    technos: [
      { src: typescript, alt: 'TypeScript' },
      { src: nodejs, alt: 'Node.js' },
      { src: vitest, alt: 'Vitest' },
    ],
  },
};

/**
 * « Aussi » : quatre projets publics sans page dédiée (décision de Charles du
 * 13/10/2026), chacun avec son emplacement de visuel (PRJ-06 à PRJ-10).
 * Descriptions tirées de la matière première et des README publics.
 */
export interface ProjetAussi {
  id: string;
  nom: string;
  visuel: string;
  /** Nom de dépôt technique (« img-convertor ») : composé en linéale, son trait d’union ne s’ouvre pas. */
  technique?: boolean;
  description: string;
  liens: readonly LienPublic[];
}

export const AUSSI: readonly ProjetAussi[] = [
  {
    // README : « See which branches still matter — without touching the repository. »
    id: 'githealth',
    nom: 'GitHealth',
    visuel: 'PRJ-06',
    description: 'Voir quelles branches Git comptent encore, sans toucher au dépôt : une application de bureau qui travaille en local.',
    liens: [{ href: 'https://github.com/LINDECKER-Charles/App.GitHealth', libelle: 'Le code' }],
  },
  {
    id: 'life-pixel',
    nom: 'Life Pixel',
    visuel: 'PRJ-07',
    description: 'Un éditeur d’animations en pixel art qui exporte des lecteurs WebAssembly sans dépendance, avec un serveur MCP.',
    liens: [{ href: 'https://github.com/LINDECKER-Charles/app-life-pixel', libelle: 'Le code' }],
  },
  {
    id: 'img-convertor',
    nom: 'img-convertor',
    technique: true,
    visuel: 'PRJ-08',
    description: 'Convertir un dossier d’images et en tirer les déclinaisons adaptées à chaque largeur d’écran (WebP, AVIF…).',
    liens: [{ href: 'https://github.com/LINDECKER-Charles/Web-Image-Formateur', libelle: 'Le code' }],
  },
  {
    id: 'shreksophone',
    nom: 'Shreksophone',
    visuel: 'PRJ-10',
    description: 'Un clic, et l’interface laisse place à Shrek au saxophone. Volontairement absurde.',
    liens: [
      { href: 'https://lindecker-charles.github.io/ShrekSophone/', libelle: 'La démo' },
      { href: 'https://github.com/LINDECKER-Charles/ShrekSophone', libelle: 'Le code' },
    ],
  },
];

/**
 * « Contribuer » : les deux projets ouverts aux contributions, avec leur guide
 * (gup : .github/CONTRIBUTING.md ; Console Manager : CONTRIBUTING.md, vérifiés
 * le 13/10/2026).
 */
export const CONTRIBUER: readonly { nom: string; texte: string; lien: LienPublic }[] = [
  {
    nom: 'gup',
    // CONTRIBUTING : « The typical contribution is adding a provider ».
    texte: 'La contribution type : ajouter une source, un module isolé qui sait lister et mettre à jour ses paquets.',
    lien: { href: 'https://github.com/LINDECKER-Charles/gup/blob/main/.github/CONTRIBUTING.md', libelle: 'Guide de contribution' },
  },
  {
    nom: 'Console Manager de PvZ Fusion',
    // README : comparer chaque langue à la source, exporter le reliquat, documenter les contributeurs.
    texte: 'L’outil du pôle francophone de PvZ Fusion : il compare chaque langue à l’anglais et liste ce qu’il reste à traduire.',
    lien: { href: 'https://github.com/LINDECKER-Charles/PVZ-Fuzion-ConsolManager/blob/main/CONTRIBUTING.md', libelle: 'Guide de contribution' },
  },
];

/**
 * La date des chiffres des cartes, affichée sous la vitrine (règle C1 : un
 * chiffre a sa source et sa date). Les patchs de League Of Data Base
 * augmentent toutes les deux semaines : cette ligne change avec eux.
 */
export const RELEVE = 'Chiffres au 13 octobre 2026 ; objectifs de Bloodborne Legendary Run au 8 octobre 2026.';

/** Tous les dépôts publics de Charles, sur son profil GitHub. */
export const TOUS_LES_DEPOTS = 'https://github.com/LINDECKER-Charles?tab=repositories';
