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
