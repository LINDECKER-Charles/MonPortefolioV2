/**
 * Le glossaire : les mots du récit qu'un lecteur extérieur au jeu ou à la
 * formation française n'a pas à connaître (brief § 4 : « pas de jargon de jeu
 * sans explication »). Chaque terme s'ouvre au clic, là où il apparaît.
 *
 * `id` est la valeur de `terme` de l'événement `glossaire`
 * (docs/mesure-audience.md) : stable, en kebab-case.
 */
export interface Terme {
  id: string;
  /** Le mot tel qu'il s'écrit dans la définition affichée. */
  mot: string;
  definition: string;
}

export const GLOSSAIRE = {
  deck: {
    id: 'deck',
    mot: 'Deck',
    definition: 'Le paquet de cartes qu’un joueur compose avant la partie. Le choisir, c’est déjà choisir sa stratégie.',
  },
  classementMondial: {
    id: 'classement-mondial',
    mot: 'Classement mondial',
    definition: 'Le dernier palier de Gwent, le rang 0 : on n’y monte plus de palier en palier, on y est classé parmi les meilleurs joueurs du monde.',
  },
  meta: {
    id: 'meta',
    mot: 'Méta',
    definition: 'Les stratégies que presque tout le monde joue à un moment donné, parce qu’elles gagnent le plus. Chaque mise à jour du jeu la rebat.',
  },
  pvzFusion: {
    id: 'pvz-fusion',
    mot: 'PvZ Fusion',
    definition: 'Un jeu amateur dérivé de Plants vs. Zombies. Sa traduction en plusieurs langues est un projet open source, tenu par des bénévoles.',
  },
  dwwm: {
    id: 'dwwm',
    mot: 'Développeur web et web mobile',
    definition: 'Un titre professionnel reconnu par l’État français, de niveau bac + 2 (RNCP 5).',
  },
  cda: {
    id: 'cda',
    mot: 'CDA',
    definition: 'Concepteur développeur d’applications : le titre professionnel du niveau au-dessus, équivalent bac + 3/4 (RNCP 6).',
  },
} as const satisfies Record<string, Terme>;
