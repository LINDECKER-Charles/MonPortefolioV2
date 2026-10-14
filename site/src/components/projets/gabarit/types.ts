/**
 * Types du gabarit commun des pages de projet (règle E5). Les données d’une
 * page vivent dans `src/config/<projet>.ts` et se typent avec ceux-ci.
 */

/** Un lien public : sortie du site (mesurée en `lien-sortant`) ou page interne. */
export interface LienProjet {
  href: string;
  libelle: string;
}

/** Un repère chiffré de l’en-tête : un chiffre sourcé et daté (règle C1). */
export interface PreuveEnTete {
  valeur: string;
  libelle: string;
  source: string;
  date?: string;
  /** Le colza, sur un seul chiffre de l’en-tête au plus. */
  surligne?: boolean;
  /** Section de la page qui raconte la preuve (ancre ou page interne). */
  href?: string;
}

export type ChampFiche = 'besoin' | 'part' | 'role' | 'periode' | 'equipe';

/** La fiche technique en tableau à filets (greffe de la direction B). */
export interface DonneesFiche {
  /** Le besoin, en une phrase. */
  besoin: string;
  /** Ma part : ce que j’ai fait, en une phrase. */
  part: string;
  role: string;
  periode: string;
  equipe: string;
  statut: { texte: string; etat?: 'actif' | 'ouvert' | 'eteint' };
  /** Liens publics (dépôts publics de la liste blanche, application en ligne). */
  liens: readonly LienProjet[];
  /** Ce qui reste à confirmer, champ par champ (info-bulle de la marque). */
  aConfirmer?: Partial<Record<ChampFiche, string>>;
}

/**
 * Ce que schema.org dit d’un projet (lib/seo.ts, nœud du projet dans le
 * JSON-LD de sa page) : son type, et pour une application sa catégorie et ses
 * systèmes. L’adresse du nœud est le premier lien public de la fiche, ou la
 * page du projet pour un projet sans lien public.
 */
export interface SchemaProjet {
  type: 'CreativeWork' | 'SoftwareApplication';
  /** Catégorie d’application (`applicationCategory`) : DeveloperApplication… */
  categorie?: string;
  /** Systèmes (`operatingSystem`) : « Windows, macOS, Linux ». */
  systemes?: string;
  /**
   * Langue(s) du logiciel (`inLanguage`), code BCP 47 : 'en' pour une
   * interface en anglais seulement. Sans elle, la langue du site.
   */
  langue?: string | readonly string[];
}

/** Une décision de « Comment je l’ai construit » : contrainte, choix, effet. */
export interface Decision {
  contrainte: string;
  choix: string;
  effet: string;
  /** La trace publique de la décision. */
  lien?: LienProjet;
}
