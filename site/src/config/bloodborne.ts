/**
 * Données de la page /projets/bloodborne-legendary-run : textes du gabarit,
 * repères chiffrés, décisions et liens publics. Chaque fait vient de
 * docs/matiere-premiere.md (« Bloodborne Legendary Run — vérification du
 * 2026-10-08 » et « journal public, relevé du 2026-10-13 ») ; un fait non
 * sourcé n’entre pas ici.
 *
 * Confidentialité : le dépôt du projet est privé. Bloodborne Legendary Run
 * est la seule exception qui permet d’en parler, jamais d’y renvoyer
 * (tests/unit/liens-publics.test.ts). Liens admis : l’application publique,
 * son journal, l’application web et l’APK de test (cahier, § 5.6 ; accès de
 * test gardés à la demande de Charles, 13/10/2026).
 */
import type { EntreeSommaire } from './navigation';
import type { Decision, DonneesFiche, PreuveEnTete } from '../components/projets/gabarit/types';

/* ------------------------------------------------------------------ */
/* Liens publics                                                       */
/* ------------------------------------------------------------------ */

export const LIENS = {
  application: 'https://bloodborne-legendary-run.com/fr/sky',
  journal: 'https://bloodborne-legendary-run.com/fr/changelog',
  webTest: 'https://test.bb-legendary.charles-lindecker.com/fr/sky',
  apkTest: 'https://test.bb-legendary.charles-lindecker.com/fr/download',
  angularPresse: 'https://angular.dev/press-kit',
  licenceCcBy: 'https://creativecommons.org/licenses/by/4.0/',
} as const;

/* ------------------------------------------------------------------ */
/* En-tête (gabarit E5 · 1 et 2)                                       */
/* ------------------------------------------------------------------ */

export const EN_TETE = {
  titre: 'Plus de mille objectifs, un ciel pour s’y retrouver.',
  chapeau:
    'Une application web et Android pour suivre une partie de Bloodborne : chaque objectif devient une étoile, avec un guide en français et des amis à qui comparer son ciel. Je l’ai conçue et développée, de l’interface à la mise en ligne.',
  liens: [{ href: LIENS.application, libelle: 'L’application' }],
};

export const PREUVES: readonly PreuveEnTete[] = [
  {
    valeur: '1 289',
    libelle: 'objectifs, une étoile chacun',
    source: 'Catalogue du projet',
    date: 'relevé le 08/10/2026',
    surligne: true,
  },
  { valeur: '22', libelle: 'constellations à thème, chacune un arbre', source: 'Catalogue du projet', date: 'relevé le 08/10/2026' },
  { valeur: '864', libelle: 'fiches de guide en français, en 12 familles', source: 'Catalogue du guide', date: 'relevé le 08/10/2026' },
];

export const FICHE: DonneesFiche = {
  besoin: 'Suivre plus de mille objectifs d’une partie de Bloodborne, savoir où reprendre et préparer la suite.',
  part: 'J’ai conçu et développé l’application web et Android, de l’interface à l’API et à sa mise en ligne, et rangé ses objectifs en constellations.',
  role: 'Conception et développement',
  periode: 'Depuis septembre 2026',
  equipe: 'Projet personnel',
  statut: { texte: 'En ligne', etat: 'actif' },
  liens: [
    { href: LIENS.application, libelle: 'L’application' },
    { href: LIENS.journal, libelle: 'Le journal du projet' },
  ],
};

/** Les sections du corps : sommaire de l’en-tête et navigation de page. */
export const SECTIONS: readonly EntreeSommaire[] = [
  { id: 'ciel', titre: 'Ranger 1 289 objectifs' },
  { id: 'reprendre', titre: 'Savoir où reprendre' },
  { id: 'geste', titre: 'Allumer une étoile' },
  { id: 'guide', titre: 'Le guide' },
  { id: 'amis', titre: 'Entre amis' },
  { id: 'boutique', titre: 'La boutique' },
  { id: 'essayer', titre: 'L’essayer' },
  { id: 'construit', titre: 'Comment je l’ai construit' },
  { id: 'retiens', titre: 'En une phrase' },
];

/* ------------------------------------------------------------------ */
/* Comment je l’ai construit (gabarit E5 · 4)                          */
/* ------------------------------------------------------------------ */

/** Trois décisions tirées du journal public, chacune avec son étape. */
export const DECISIONS: readonly Decision[] = [
  {
    contrainte: 'Près de mille succès dans un seul ciel formaient un buisson où personne ne retrouvait rien.',
    choix: 'Découper le ciel en constellations à thème, puis faire de chacune un arbre qui part d’une seule étoile d’entrée.',
    effet: 'Un seul croisement de traits sur 1 008, contre 68 sur 319.',
    lien: { href: LIENS.journal, libelle: 'Le journal, 06 et 07/09/2026' },
  },
  {
    contrainte: 'Trois gestes d’allumage cohabitaient selon le type d’objectif, et le joueur se heurtait à chaque changement.',
    choix: 'Un seul geste, l’appui maintenu, qui enregistre la réussite avant de lancer sa cérémonie.',
    effet: 'Un geste à apprendre, une mise en scène par type d’objectif.',
    lien: { href: LIENS.journal, libelle: 'Le journal, 08/09/2026' },
  },
  {
    contrainte: 'Une même application sur le web et sur Android, mise à jour au fil des étapes.',
    choix: 'Une seule interface Angular, Ionic et Capacitor ; des images construites une fois, validées en test, puis promues telles quelles.',
    effet: 'La version testée est celle qui part en ligne, et l’APK de test suit chaque mise à jour.',
  },
];

/* ------------------------------------------------------------------ */
/* Corps                                                               */
/* ------------------------------------------------------------------ */

/** Savoir où reprendre : trois écrans, dans l’ordre de la reprise. */
export const REPRISE = [
  { titre: 'Un personnage', detail: 'Jusqu’à cinq par compte, chacun avec sa progression.' },
  { titre: 'Un parcours', detail: 'La carte rouvre la constellation à reprendre.' },
  { titre: 'Une prochaine étoile', detail: 'L’objectif suivant, et ce qu’il faut faire pour l’allumer.' },
] as const;

/** Les quatre allumages enregistrés (public/demos/bloodborne/README.md). */
export const RITUELS = [
  {
    id: 'boss',
    titre: 'Un boss vaincu',
    detail: 'La victoire devient une proclamation.',
    nom: 'Le Monstre clérical',
    equivalent: 'Un appui maintenu éveille l’étoile du Monstre clérical. Une proclamation annonce la victoire, puis la carte retrouve l’étoile allumée.',
  },
  {
    id: 'decouverte',
    titre: 'Un lieu découvert',
    detail: 'Le paysage se révèle à l’encre.',
    nom: 'La lanterne de Yharnam',
    equivalent: 'Un appui maintenu éveille l’étoile de la lanterne de Yharnam. Le paysage se révèle à l’encre, puis la carte retrouve l’étoile allumée.',
  },
  {
    id: 'rune',
    titre: 'Une rune obtenue',
    detail: 'Le symbole se grave à l’écran.',
    nom: 'Métamorphose horaire',
    equivalent: 'Un appui maintenu éveille une rune. Son symbole se grave au cours du rituel, puis la carte retrouve l’étoile allumée.',
  },
  {
    id: 'gemme',
    titre: 'Une gemme trouvée',
    detail: 'Le cristal prend forme et s’illumine.',
    nom: 'Une gemme de sang',
    equivalent: 'Un appui maintenu éveille une gemme de sang. Le cristal prend forme et s’illumine, puis la carte retrouve l’étoile allumée.',
  },
] as const;

/** Le guide, sur la fiche du Père Gascoigne. */
export const REPERES_GUIDE = [
  { titre: 'Repérer sa faiblesse', detail: 'Ici, le feu.' },
  { titre: 'Préparer le combat', detail: 'Stratégie, parades et déroulé des phases.' },
  { titre: 'Voir ce qu’il rapporte', detail: 'Récompenses et suite de la chasse.' },
] as const;

/** Entre amis : trois écrans, dans l’ordre d’une comparaison. */
export const SOCIAL = [
  { titre: 'Retrouver ses amis', detail: 'Un code ou l’annuaire, une invitation acceptée. La dernière chasse de chacun donne des nouvelles.' },
  { titre: 'Croiser les constellations', detail: 'Un personnage de chaque côté : les étoiles de l’ami apparaissent en turquoise.' },
  { titre: 'Comparer une réussite', detail: 'Un même objectif peut être éteint d’un côté et allumé de l’autre.' },
] as const;
