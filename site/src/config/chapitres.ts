/**
 * Les chapitres de l'accueil, dans l'ordre de lecture. Le sommaire, le repère
 * de lecture (bureau), le sommaire mobile et la mesure de lecture lisent cette
 * liste : un chapitre ajouté ici apparaît partout à la fois.
 *
 * `id` est aussi la valeur de `chapitre` de l'événement `lecture`
 * (docs/mesure-audience.md) : le changer, c'est casser la série statistique.
 */
export interface Chapitre {
  id: 'origine' | 'aujourdhui' | 'preuves' | 'dehors' | 'discutons';
  num: number;
  titre: string;
  /** Ligne du sommaire, après les pointillés. */
  resume: string;
}

export const CHAPITRES: readonly Chapitre[] = [
  { id: 'origine', num: 1, titre: 'L’origine', resume: 'du premier PC aux premières équipes' },
  { id: 'aujourdhui', num: 2, titre: 'Aujourd’hui', resume: 'comprendre, construire, transmettre' },
  { id: 'preuves', num: 3, titre: 'Les preuves', resume: 'les projets et les décisions' },
  { id: 'dehors', num: 4, titre: 'En dehors du code', resume: 'ce qui nourrit ma curiosité' },
  { id: 'discutons', num: 5, titre: 'Discutons', resume: 'faire connaissance' },
];

export function chapitre(id: Chapitre['id']): Chapitre {
  const trouve = CHAPITRES.find((c) => c.id === id);
  if (!trouve) throw new Error(`Chapitre inconnu : ${id}`);
  return trouve;
}
