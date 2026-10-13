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
