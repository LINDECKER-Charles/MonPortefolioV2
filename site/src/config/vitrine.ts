/**
 * Contenu des cartes de la vitrine /projets (cahier des charges, § 5.2 ;
 * décisions de Charles du 13 et du 14/10/2026). L’ordre, la famille, le nom
 * canonique et l’étiquette de preuve de chaque projet viennent de VITRINE
 * (config/projets.ts) ; une carte n’y ajoute que ce qu’elle montre : le
 * besoin, un seul chiffre, le rôle, le statut, les liens publics, trois
 * technologies au plus et, pour les projets entrés le 14/10/2026, League Of
 * Data Base et Omnicard, son visuel.
 *
 * Les cartes de PvZ Fusion, Omnicard, Bloodborne Legendary Run, League Of Data
 * Base et gup s’écrivent ici. Depuis le 15/10/2026, les jeux vidéo montrent
 * une vraie capture (retour de Charles : « plus vendeur ») ; seule la vedette,
 * PvZ Fusion, garde son illustration. Celles de GitHealth, Karl Scraper, Sillage et
 * Relais vivent dans le fichier de leur page (config/<projet>.ts, export
 * CARTE), que chaque page tient seule : ce fichier ne fait que les importer.
 *
 * Chaque fait vient de docs/matiere-premiere.md, d’un README public ou d’une
 * page publique du projet (source notée à côté). Un fait que Charles n’a pas
 * confirmé n’entre pas ici (Q8 : rien d’affiché sans réponse). La réserve sur
 * le nom « League Of Data Base » est dite une fois, dans la note de sources
 * de sa page, et non sur chaque carte.
 *
 * Liens : seulement les dépôts publics de la liste blanche
 * (config/liens-publics.ts), les sites en ligne des projets et leurs paquets ;
 * aucun pour un projet privé (`prive` dans VITRINE). Aucune démo hors ligne.
 */
import type { ImageMetadata } from 'astro';
import { VITRINE, type ProjetVitrine } from './projets';
import { CARTE as CARTE_GITHEALTH } from './githealth';
import { CARTE as CARTE_KARL_SCRAPER } from './karl-scraper';
import { CARTE as CARTE_RELAIS } from './relais';
import { CARTE as CARTE_SILLAGE } from './sillage';
import championsLeague from '../assets/projets/league-of-database/champions.webp';
import accueilOmnicard from '../assets/projets/omnicard/accueil.webp';
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

/** Une capture réelle posée sur une carte, dans son cadre d’appareil (CadreCapture). */
export interface CaptureCarte {
  type: 'navigateur' | 'telephone' | 'terminal';
  src: ImageMetadata;
  /** Ce que la capture prouve (règle A5), pas ce qu’elle montre en vrac. */
  alt: string;
  /** Adresse affichée dans la barre du navigateur (sans https://). */
  adresse?: string;
  /** Recadrage de la vue (« 16 / 10 ») ; sans lui, la capture est montrée entière. */
  ratio?: string;
  /** Recadrage sous 860 px, s’il diffère. */
  ratioMobile?: string;
  /** Position du recadrage (object-position). */
  position?: string;
  /** Largeurs produites (srcset). */
  widths?: number[];
  /**
   * Sur ordinateur, la capture remplit tout le panneau de la carte, recadrée
   * (object-fit: cover, selon `position`), comme le terminal de gup : dans
   * une famille de trois, le panneau prend la hauteur du plus haut visuel.
   */
  remplir?: boolean;
  sizes?: string;
}

/**
 * Le visuel d’une carte, posé par pages/projets/index.astro : une capture
 * réelle (`capture`), ou un emplacement du registre des visuels (`visuel`,
 * son identifiant), posé dans l’acte de veille de la carte. Le fichier qui
 * écrit `visuel: 'PRJ-06'` figure dans la `pose` de l’entrée
 * (config/visuels.ts). Sans visuel, la carte n’a que son texte.
 */
export type VisuelCarte =
  | { capture: CaptureCarte; visuel?: never }
  | { visuel: string; /** Décoratif par défaut : le nom de la carte dit le reste. */ alt?: string; ratioMobile?: string; capture?: never };

export interface CarteVitrine {
  /** Le besoin en une phrase : à quoi sert le projet, avant les détails. */
  besoin: string;
  /**
   * Un seul chiffre sourcé par carte. `releve` : sa date (« 14 octobre
   * 2026 »), quand elle diffère de celle des cinq premières cartes ; la ligne
   * des relevés sous la vitrine (RELEVE) la reprend.
   */
  chiffre: { valeur: string; libelle: string; releve?: string };
  role: string;
  statut: { texte: string; etat?: 'actif' | 'ouvert' | 'eteint' };
  liens: readonly LienPublic[];
  /** Trois au plus ; `mono` : logo monochrome, inversé la nuit. */
  technos: readonly { src: ImageMetadata; alt: string; mono?: boolean }[];
  /** Ce qui reste à confirmer sur le nom, en info-bulle de la marque. */
  aConfirmer?: string;
  /**
   * Le visuel de la carte, quand la carte le décrit : projets entrés le
   * 14/10/2026, League Of Data Base et Omnicard (15/10/2026). PvZ Fusion,
   * Bloodborne Legendary Run et gup gardent le leur, posé par la page.
   */
  visuel?: VisuelCarte;
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
    // Capture réelle de l’application (assets/projets/league-of-database, README de la
    // page) : le catalogue des champions d’un patch, avec le choix du patch et de la langue
    // en haut à droite ; recadrée sur la première rangée de champions.
    visuel: {
      capture: {
        type: 'navigateur',
        src: championsLeague,
        adresse: 'league-of-data-base.com/fr',
        alt: 'Le catalogue des champions de League Of Data Base, en français, avec le patch et la langue choisis en haut à droite.',
        ratio: '16 / 10',
        remplir: true,
        position: '50% 0',
        widths: [480, 960, 1440],
      },
    },
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
    // La page d’accueil du jeu, capture d’une version précédente conservée par la V1
    // (docs/assets-omnicard.md) : Charles la trouve « très bien vieillie » (15/10/2026).
    // Sans adresse : omnicard.fr est hors ligne (liens-publics.ts, DOMAINES_HORS_LIGNE).
    visuel: {
      capture: {
        type: 'navigateur',
        src: accueilOmnicard,
        alt: 'La page d’accueil d’Omnicard : des cartes qui flottent au-dessus d’un paysage nocturne, autour du dos de carte du jeu.',
        ratio: '16 / 10',
        position: '50% 12%',
        remplir: true,
        widths: [480, 960, 1440],
      },
    },
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
  githealth: CARTE_GITHEALTH,
  'karl-scraper': CARTE_KARL_SCRAPER,
  sillage: CARTE_SILLAGE,
  relais: CARTE_RELAIS,
};

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

/** Le relevé commun des cinq premières cartes. */
const RELEVE_COMMUN = 'Chiffres au 13 octobre 2026 ; objectifs de Bloodborne Legendary Run au 8 octobre 2026';

/** « A », « A et B », « A, B et C ». */
const enListe = (noms: readonly string[]) => (noms.length < 2 ? noms.join('') : `${noms.slice(0, -1).join(', ')} et ${noms.at(-1)}`);

/** Les cartes à relevé propre (`chiffre.releve`), regroupées par date, dans l’ordre de la vitrine. */
const relevesPropres = new Map<string, string[]>();
for (const projet of VITRINE) {
  const date = CARTES[projet.id].chiffre.releve;
  if (date) relevesPropres.set(date, [...(relevesPropres.get(date) ?? []), projet.nom]);
}

/**
 * La date des chiffres des cartes, affichée sous la vitrine (règle C1 : un
 * chiffre a sa source et sa date). Les patchs de League Of Data Base
 * augmentent toutes les deux semaines : cette ligne change avec eux. Une carte
 * relevée à une autre date le dit par son `chiffre.releve`, que la ligne
 * reprend : « … ; GitHealth et Relais au 14 octobre 2026. »
 */
export const RELEVE = `${[RELEVE_COMMUN, ...[...relevesPropres].map(([date, noms]) => `${enListe(noms)} au ${date}`)].join(' ; ')}.`;

/** Tous les dépôts publics de Charles, sur son profil GitHub. */
export const TOUS_LES_DEPOTS = 'https://github.com/LINDECKER-Charles?tab=repositories';
