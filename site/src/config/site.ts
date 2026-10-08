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
} as const;

export const CONTACT = {
  /** Adresse de la V1. Une adresse en @charles-lindecker.com reste à décider (questionnaire G4). */
  email: 'charles.lindecker@outlook.fr',
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
 * Archive de la V1, sur son sous-domaine (brief § 6, encore à choisir). Tant
 * qu'elle n'existe pas, le pied de page ne la cite pas : la V1 occupe encore le
 * domaine que la V2 prendra.
 */
export const ARCHIVE_V1: string | null = null;

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
export const MAILTO = `mailto:${CONTACT.email}?subject=${encodeURIComponent('Discutons')}`;
