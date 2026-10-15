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

/**
 * Un extrait de « Sous le capot ». Du vrai code seulement pour un dépôt public
 * de la liste blanche (config/liens-publics.ts) : `fichier` donne son chemin,
 * à la révision citée dans la note de sources. Pour un dépôt privé, une forme
 * écrite pour la page (`ecrit`) : configuration, commande, structure de
 * données ou pseudo-code simplifié, jamais du code recopié, ni nom d’employeur,
 * de client, de chemin interne ou de secret.
 */
export type Extrait = {
  /**
   * Le code tel qu’il s’affiche, indentation comprise ; douze lignes au plus.
   * Un schéma (`langage: 'Schéma'`) s’aligne à gauche, en 35 colonnes au plus.
   */
  code: string;
  /** Le langage, dit dans la légende : « C# », « TypeScript », « JSON »… */
  langage: string;
  /**
   * De la prose (un paragraphe de Markdown, pas un tableau ni du code) : ses
   * lignes se replient à la largeur du cadre au lieu de défiler.
   */
  prose?: true;
} & ({ fichier: string; ecrit?: never } | { ecrit: true; fichier?: never });

/**
 * Un point de « Sous le capot » (gabarit E5 · 4) : une ligne, dépliable sur
 * son explication et un extrait court. Une décision se dit « contrainte,
 * choix, effet » ; un fait technique qui n’en est pas une se dit en `texte`.
 */
export interface PointCapot {
  /** Le point en une ligne : ce que l’on lit replié. */
  titre: string;
  contrainte?: string;
  choix?: string;
  effet?: string;
  /** L’explication, quand le point n’est pas une décision. */
  texte?: string;
  extrait?: Extrait;
  /** La trace publique du point. */
  lien?: LienProjet;
  /** Le groupe du point (« Architecture », « Garde-fous »…), titre de sa liste. */
  groupe?: string;
}
