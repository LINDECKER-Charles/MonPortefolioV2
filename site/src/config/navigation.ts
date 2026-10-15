/**
 * Navigation globale : la même liste pour l’en-tête, le menu mobile et le
 * pied de page. L’en-tête d’ordinateur n’affiche pas l’accueil (l’emblème y
 * mène déjà).
 */
export interface PageNavigation {
  href: string;
  titre: string;
}

export const PAGES_PRINCIPALES: readonly PageNavigation[] = [
  { href: '/', titre: 'Accueil' },
  { href: '/projets', titre: 'Projets' },
  { href: '/parcours', titre: 'Parcours' },
  { href: '/blog', titre: 'Blog' },
  { href: '/contact', titre: 'Contact' },
];

/** Vrai si `chemin` est la page `href` ou l’une de ses pages filles. */
export function pageActive(href: string, chemin: string): boolean {
  const propre = chemin.replace(/\/$/, '') || '/';
  return href === '/' ? propre === '/' : propre === href || propre.startsWith(`${href}/`);
}

/** Une section de la page, pour le sommaire de l’en-tête et la navigation de page. */
export interface EntreeSommaire {
  /** Identifiant de la section visée (sans #). */
  id: string;
  titre: string;
}
