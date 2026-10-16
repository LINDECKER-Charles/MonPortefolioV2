/**
 * Les images de partage (Open Graph) de la direction « Lanterne » : une par
 * page publique, 1 200 × 630, composées en HTML avec la vraie typographie
 * puis rendues en JPEG par `node tools/generer-partage.mjs` (local, aucune
 * origine tierce), sous 300 Ko : WhatsApp n’affiche souvent pas l’aperçu
 * d’une image plus lourde. Les fichiers vivent dans public/og/ et sont versionnés.
 *
 *   - GLO-07, l’image par défaut (l’accueil, et toute page sans image) : le
 *     nom, le métier, l’accroche, la photo du colza en couleur, l’emblème.
 *   - GLO-08, une déclinaison par page : le titre de la page à gauche (le nom
 *     du projet et son étiquette de preuve sur une page de projet), à droite
 *     une photo de séance (Contact, Parcours) ou la lanterne allumée dans un
 *     acte de veille, l’emblème en bas.
 *
 * Cette liste est la seule source : le générateur la lit pour composer les
 * images, la coque (layouts/Base.astro) pour choisir og:image et son alt.
 * Aucun texte ne s’invente ici : titres et étiquettes viennent des pages et
 * de la vitrine (config/projets.ts).
 */
import { VITRINE } from '../config/projets.ts';

/** Le visuel de droite d’une image de partage. */
export type VisuelPartage = 'accueil' | 'contact' | 'parcours' | 'lanterne';

export interface ImagePartage {
  /** Chemin de la page. */
  chemin: string;
  /** Fichier sous public/ (adresse publique : sans `public`). */
  fichier: string;
  /** Le grand titre de l’image. */
  titre: string;
  /** Le titre composé ligne par ligne, comme sur la page (l’accroche). */
  lignes?: readonly string[];
  /** Une ligne au-dessus du titre (rubrique) ou l’étiquette de preuve d’un projet. */
  surtitre?: string;
  /** Étiquette de preuve, encadrée comme sur la page du projet. */
  etiquette?: string;
  visuel: VisuelPartage;
  alt: string;
}

export const ACCROCHE = 'Je maîtrise d’abord les règles du jeu. Ensuite, je les réinvente.';
const NOM = 'Charles Lindecker';

/** L’image par défaut (GLO-07). */
export const PARTAGE_DEFAUT: ImagePartage = {
  chemin: '/',
  fichier: 'public/og/GLO-07_1200x630.jpg',
  titre: ACCROCHE,
  lignes: ['Je maîtrise d’abord', 'les règles du jeu.', 'Ensuite, je les réinvente.'],
  surtitre: 'Architecte logiciel',
  visuel: 'accueil',
  alt: `${NOM}, architecte logiciel. ${ACCROCHE}`,
};

/** « Encadrer des agents IA » → « encadrer des agents IA » : seule l’initiale change, un sigle reste en capitales. */
const minusculeInitiale = (texte: string) => texte.charAt(0).toLowerCase() + texte.slice(1);

/** Une déclinaison de GLO-08 : `public/og/GLO-08-<page>_1200x630.jpg`. */
function declinaison(chemin: string, titre: string, visuel: VisuelPartage, options: { surtitre?: string; etiquette?: string } = {}): ImagePartage {
  const page = chemin.slice(1).replaceAll('/', '-');
  const description = (options.etiquette ? `${titre}\u00a0: ${minusculeInitiale(options.etiquette)}` : titre).replace(/\.$/, '');
  return { chemin, fichier: `public/og/GLO-08-${page}_1200x630.jpg`, titre, visuel, alt: `${NOM}, ${description}.`, ...options };
}

export const IMAGES_PARTAGE: readonly ImagePartage[] = [
  PARTAGE_DEFAUT,
  declinaison('/projets', 'Projets', 'lanterne', { surtitre: 'Une équipe, des systèmes en production, des outils publiés, des agents IA encadrés' }),
  ...VITRINE.map((projet) => declinaison(projet.href, projet.nom, 'lanterne', { surtitre: 'Projet', etiquette: projet.preuve })),
  declinaison('/parcours', 'Parcours', 'parcours'),
  declinaison('/parcours/professionnel', 'Parcours professionnel', 'parcours', { surtitre: 'Parcours' }),
  declinaison('/parcours/competences', 'Compétences', 'parcours', { surtitre: 'Parcours' }),
  declinaison('/parcours/formation', 'Formation et certifications', 'parcours', { surtitre: 'Parcours' }),
  declinaison('/contact', 'Discutons.', 'contact', { surtitre: 'Contact' }),
  declinaison('/blog', 'Blog', 'lanterne'),
  declinaison('/mentions-legales', 'Mentions légales', 'lanterne'),
];

/** L’image de partage d’une page : la sienne, sinon l’image par défaut. */
export function imagePartageDe(chemin: string): ImagePartage {
  return IMAGES_PARTAGE.find((image) => image.chemin === chemin) ?? PARTAGE_DEFAUT;
}
