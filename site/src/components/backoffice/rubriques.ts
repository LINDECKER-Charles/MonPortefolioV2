/**
 * Les rubriques de l’atelier, dans l’ordre de la navigation : une seule
 * source pour l’en-tête (EnteteBackoffice), les titres des rubriques et le
 * titre de l’onglet (scripts/backoffice.ts).
 *
 * `lien` est l’adresse réelle de la rubrique : un clic ordinaire est
 * intercepté par le script, un clic du milieu ouvre un nouvel onglet.
 */
export type Rubrique = 'contacts' | 'settings' | 'links' | 'tokens' | 'blog' | 'storage';

export interface DefinitionRubrique {
  id: Rubrique;
  lien: string;
  /** Libellé de la navigation. */
  titreCourt: string;
  /** Titre de la rubrique et de l’onglet du navigateur. */
  titre: string;
}

export const RUBRIQUES: readonly DefinitionRubrique[] = [
  { id: 'contacts', lien: '/backoffice?rubrique=contacts', titreCourt: 'Demandes', titre: 'Demandes de contact' },
  { id: 'settings', lien: '/backoffice?rubrique=settings', titreCourt: 'Adresse', titre: 'Adresse de contact' },
  { id: 'links', lien: '/backoffice?rubrique=links', titreCourt: 'Boîte à outils', titre: 'Boîte à outils' },
  { id: 'tokens', lien: '/backoffice?rubrique=tokens', titreCourt: 'Accès MCP', titre: 'Accès MCP' },
  { id: 'blog', lien: '/backoffice/blog', titreCourt: 'Blog', titre: 'Blog' },
  { id: 'storage', lien: '/backoffice?rubrique=storage', titreCourt: 'Stockage', titre: 'Stockage' },
];

export const TITRES_RUBRIQUES = Object.fromEntries(RUBRIQUES.map(({ id, titre }) => [id, titre])) as Record<Rubrique, string>;
