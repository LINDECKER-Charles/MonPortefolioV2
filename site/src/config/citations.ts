/**
 * Citations de Charles autorisées sur le site.
 *
 * Règle (cahier des charges, C2) : tout texte présenté comme une citation de
 * Charles — `<blockquote>`, `<q>` ou élément marqué `data-citation` — est une
 * de ses phrases, mot pour mot, ou un extrait de l’une d’elles. Aucune
 * reformulation, aucune phrase « dans sa voix » : si elle n’est pas ici, elle
 * ne se présente pas comme sa citation.
 *
 * Chaque entrée est recopiée à l’identique (apostrophes et ponctuation
 * comprises) depuis `docs/questions.md` ou `docs/brief.md`, et
 * `tests/unit/citations.test.ts` vérifie qu’elle s’y trouve toujours. Les
 * retours de Charles sur le design du site (« mieux mais brouillon »…) sont
 * des consignes de travail, pas des citations à afficher : ils n’entrent pas ici.
 *
 * Pour en ajouter une : la recopier depuis le document source, indiquer où
 * elle se trouve, puis lancer `npm test`.
 */

export interface Citation {
  /** La phrase de Charles, sans guillemets, telle qu’écrite dans le document source. */
  texte: string;
  /** Document source, relatif à la racine du dépôt. */
  source: 'docs/questions.md' | 'docs/brief.md';
  /** Où la retrouver dans ce document. */
  endroit: string;
}

export const CITATIONS: readonly Citation[] = [
  // Parcours et réorientations
  { texte: 'Ça n\'a pas vraiment marché', source: 'docs/questions.md', endroit: 'C3, le BUT et les premières filières' },
  { texte: 'j\'ai recommencé jusqu\'à réussir et je me suis réorienté autant que nécessaire', source: 'docs/questions.md', endroit: 'C3, le BUT et les premières filières' },

  // Elan
  { texte: 'Une expérience très formatrice.', source: 'docs/questions.md', endroit: 'C5, devenir formateur' },

  // PvZ Fusion
  { texte: 'La seule chose qui a changé, c\'est le titre.', source: 'docs/questions.md', endroit: 'C6, de traducteur à lead' },
  { texte: 'la seule chose qui a changé, c\'est le titre', source: 'docs/brief.md', endroit: '§ 4, Écrire avec sa voix' },
  { texte: 'l’aventure humaine', source: 'docs/questions.md', endroit: 'C7, la page de projet PvZ Fusion' },
  { texte: 'Seul on va vite, à plusieurs on va loin : la qualité et la sincérité des échanges démultiplient les résultats.', source: 'docs/questions.md', endroit: 'C9, former et coder' },
  { texte: 'la qualité et la sincérité des échanges démultiplient les résultats', source: 'docs/brief.md', endroit: '§ 4, Écrire avec sa voix' },
  { texte: 'un moment j\'en ai eu marre, j\'ai repris le projet', source: 'docs/brief.md', endroit: '§ 4, Écrire avec sa voix' },

  // Gwent
  { texte: 'pas d\'excuse en cas de défaite pour jeter la faute sur un autre, juste moi et mes propres décisions', source: 'docs/questions.md', endroit: 'C8, Gwent, l\'origine de la méthode' },
  { texte: 'seul acteur de ses choix', source: 'docs/questions.md', endroit: 'C8, Gwent, l\'origine de la méthode' },
  { texte: 'je roule sur la méta en la prenant à contre-courant', source: 'docs/questions.md', endroit: 'C8, la boucle' },
  { texte: 'mais j\'apprends de ce flop et je comprends où mon instinct m\'a trompé, ce qui l\'aiguise', source: 'docs/questions.md', endroit: 'C8, la boucle' },
  { texte: 'j\'apprends de ce flop et je comprends où mon instinct m\'a trompé, ce qui l\'aiguise', source: 'docs/brief.md', endroit: '§ 4, Écrire avec sa voix' },
  { texte: 'tracer mon propre chemin', source: 'docs/questions.md', endroit: 'C8, la percée' },
  { texte: 'deux jours à jouer la méta', source: 'docs/questions.md', endroit: 'C8, la méthode rodée' },

  // Omnicard
  { texte: 'un nombre incalculable d\'éditions', source: 'docs/questions.md', endroit: 'D1, Omnicard' },
  { texte: 'Le projet qui m\'a fait le plus apprendre.', source: 'docs/questions.md', endroit: 'D1, Omnicard' },
  { texte: 'je voulais me lancer direct et pas perdre de temps', source: 'docs/questions.md', endroit: 'D1, Omnicard' },
  { texte: 'l’aspect créatif et le désir de se dépasser', source: 'docs/questions.md', endroit: 'D1, page Omnicard du 2026-10-13' },

  // Logo
  { texte: 'Le livre pour la connaissance et la lanterne mon amour de bloodborne en clin d’oeil et la lumière qui avance dans l’obscurité', source: 'docs/questions.md', endroit: 'E1, précision sur le logo du 2026-10-08' },

  // Accroche
  { texte: 'Je maîtrise d\'abord les règles du jeu. Ensuite, je les réinvente.', source: 'docs/brief.md', endroit: '§ 4, L\'accroche' },
];
