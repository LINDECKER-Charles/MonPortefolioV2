/**
 * Identité du site et coordonnées : une seule source pour l'en-tête, le pied de
 * page, les balises de partage et le JSON-LD.
 *
 * Ce qui n'existe pas encore vaut `null` et n'est pas affiché : aucun lien du
 * site ne mène à une page vide.
 */
export const SITE = {
  url: 'https://charles-lindecker.com',
  nom: 'Charles Lindecker',
  /** Sous-titre du site, à côté du nom. */
  sousTitre: 'mode d’emploi',
  lieu: 'près de Mulhouse',
  metier: 'Architecte logiciel',
  langue: 'fr',
  locale: 'fr_FR',
  /** Couleur du navigateur mobile : le bleu roi du site. */
  couleurTheme: '#1F4FD1',
  /**
   * Jeton de la propriété Search Console de charles-lindecker.com, repris de
   * la V1 (`front-portfolio/src/index.html`). Google revérifie la propriété de
   * temps en temps : sans cette balise sur l’accueil, elle se perdrait au
   * moment où la V2 prend le domaine, celui où il faut suivre la réindexation.
   */
  verificationGoogle: '8ktW_VNmaBZquKlGxRbpspq5KO7jrgMHQ3hH1asr06s',
} as const;

export const CONTACT = {
  /** Le serveur remplace ce marqueur par l’adresse persistée du backoffice. */
  email: import.meta.env.PUBLIC_CONTACT_EMAIL || 'contact@portfolio.invalid',
  linkedin: 'https://www.linkedin.com/in/charles-lindecker/',
  github: 'https://github.com/LINDECKER-Charles',
} as const;

/**
 * Le CV aligné sur le nouveau récit n'existe pas encore : celui de la V1 est
 * obsolète. Poser ici son chemin (ex. '/charles-lindecker-cv.pdf', déposé dans
 * public/) fait apparaître les boutons « Télécharger mon CV ».
 */
export const CV: string | null = null;

/**
 * Archive de la V1, sur son sous-domaine (questions.md, F1 : `yharnam.`,
 * 2026-10-14). Construite et mise en ligne par `archive-v1/`, avant la
 * production de la V2 (docs/bascule.md) : le pied de page ne la cite qu’une
 * fois qu’elle répond. `null` la retire du pied de page.
 */
export const ARCHIVE_V1: string | null = 'https://yharnam.charles-lindecker.com';

/**
 * Démos en ligne. Au 2026-10-07, les deux adresses de la V1 (test.omnicard.fr,
 * shrek.charles-lindecker.com) pointent vers un ancien serveur qui ne répond
 * plus : les liens n'apparaissent pas tant qu'elles valent null. Les remettre
 * ici dès que les démos sont de nouveau servies.
 */
export const DEMOS: { omnicard: string | null; shreksophone: string | null } = {
  omnicard: null,
  shreksophone: null,
};

/** Mailto de l'adresse de contact, avec un objet prérempli. */
export const MAILTO = `mailto:${encodeURIComponent(CONTACT.email)}?subject=${encodeURIComponent('Discutons')}`;
