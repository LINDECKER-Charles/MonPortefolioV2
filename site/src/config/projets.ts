/**
 * La vitrine de la refonte, dans l’ordre de ce que chaque projet prouve
 * (cahier des charges, § 5.2 ; décision de Charles du 13/10/2026). Le nom
 * canonique de chaque projet (règle E6) s’écrit ici, une fois : le gabarit des
 * pages de projet (components/projets/gabarit) en tire le fil d’Ariane,
 * l’en-tête et le projet précédent ou suivant.
 */
export interface ProjetVitrine {
  id: 'pvz' | 'league' | 'omnicard' | 'bloodborne' | 'gup';
  /** Nom canonique, repris partout. */
  nom: string;
  href: `/projets/${string}`;
  /** Étiquette de preuve : ce que le projet prouve. */
  preuve: string;
}

export const VITRINE: readonly ProjetVitrine[] = [
  { id: 'pvz', nom: 'PvZ Fusion, pôle francophone', href: '/projets/pvz-fusion', preuve: 'Mener une équipe' },
  { id: 'league', nom: 'League Of Data Base', href: '/projets/league-of-database', preuve: 'Un système en production' },
  { id: 'omnicard', nom: 'Omnicard', href: '/projets/omnicard', preuve: 'Inventer' },
  { id: 'bloodborne', nom: 'Bloodborne Legendary Run', href: '/projets/bloodborne-legendary-run', preuve: 'Un produit de bout en bout' },
  { id: 'gup', nom: 'gup', href: '/projets/gup', preuve: 'Un outil open source' },
];

/** Un projet de la vitrine, son rang (à partir de 1) et ses voisins dans l’ordre. */
export function projetDeLaVitrine(id: ProjetVitrine['id']) {
  const index = VITRINE.findIndex((projet) => projet.id === id);
  if (index < 0) throw new Error(`Projet « ${id} » absent de VITRINE (config/projets.ts).`);
  return {
    projet: VITRINE[index],
    rang: index + 1,
    precedent: index > 0 ? VITRINE[index - 1] : undefined,
    suivant: index < VITRINE.length - 1 ? VITRINE[index + 1] : undefined,
  };
}

/** Un projet quitte la vitrine en gardant sa page et son adresse. */
export interface ProjetArchive {
  nom: string;
  href: `/projets/${string}`;
  resume: string;
}

export const PROJETS_ARCHIVES: readonly ProjetArchive[] = [];

export const THEMES_PROJETS = [
  { id: 'jeux', nom: 'Jouer et explorer', resume: 'Suivre une aventure, comprendre un jeu et le découvrir autrement.' },
  { id: 'outils', nom: 'Simplifier le quotidien', resume: 'Rassembler les tâches répétitives et reprendre la main sur ses outils.' },
] as const;

export const PROJETS_ACTIFS = [
  {
    id: 'bloodborne',
    nom: 'Bloodborne Legendary Run',
    href: '/projets/bloodborne-legendary-run',
    categories: ['jeux'],
    usage: 'Guide et suivi de partie',
    promesse: 'Retrouver ce qu’il reste à faire dans Bloodborne.',
    resume: 'Un guide pour le jeu d’action Bloodborne : retrouver les objets à collecter, préparer les combats et cocher les objectifs accomplis pour reprendre sa partie.',
    resultat: 'Le joueur garde la trace des combats gagnés et des objets trouvés.',
  },
  {
    id: 'gup',
    nom: 'GUP',
    href: '/projets/gup',
    categories: ['outils'],
    usage: 'Mises à jour des logiciels',
    promesse: 'Vérifier et mettre à jour ses outils au même endroit.',
    resume: 'Pour les développeurs : regrouper les mises à jour des logiciels et outils de développement, puis choisir celles à lancer, sans multiplier les commandes.',
    resultat: 'Une seule interface pour vérifier, choisir et lancer les mises à jour.',
  },
  {
    id: 'pvz',
    nom: 'PVZF Translation',
    href: '/projets/pvz-fusion',
    categories: ['jeux'],
    usage: 'Traduction française d’un jeu',
    promesse: 'Comprendre les plantes pour choisir leurs combinaisons.',
    resume: 'Dans Plants vs. Zombies Fusion, on combine des plantes pour défendre son jardin. La traduction française rend les menus et les capacités des plantes compréhensibles.',
    resultat: 'Les joueurs francophones peuvent lire les menus et les capacités des plantes.',
  },
  {
    id: 'league',
    nom: 'League of Database',
    href: '/projets/league-of-database',
    categories: ['jeux'],
    usage: 'Historique des données de League of Legends',
    promesse: 'Retrouver les valeurs d’un ancien patch de League.',
    resume: 'Une encyclopédie multilingue de League of Legends pour retrouver les champions, objets, runes et sorts d’une version précise du jeu.',
    resultat: 'Les données du jeu restent consultables par langue et par version.',
  },
] as const;

export type ProjetActif = (typeof PROJETS_ACTIFS)[number];

/** Une mise en avant éditoriale, choisie indépendamment des visites. */
export const PROJET_A_LA_UNE: ProjetActif['id'] = 'bloodborne';
