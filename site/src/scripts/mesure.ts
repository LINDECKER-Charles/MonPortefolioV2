/**
 * Mesure d'audience des événements qui ne sont pas de simples clics (ceux-là
 * passent par les attributs data-umami-event). Les événements s'empilent dans
 * window.clFile ; le chargeur /mesure.js, servi par le serveur selon
 * l'environnement, remplace ce tableau par une file qui les envoie à Umami.
 * En cas d'opposition, de blocage ou sans traceur, ils ne partent jamais.
 *
 * Noms et valeurs : ceux du plan de marquage (docs/mesure-audience.md), en
 * listes fermées. Jamais de saisie libre ni de donnée personnelle.
 */
export type ValeurMesure = string | number | boolean;

type File = { push(entree: [string, Record<string, ValeurMesure>?]): unknown };

export function mesurer(nom: string, donnees?: Record<string, ValeurMesure>): void {
  try {
    const w = window as unknown as { clFile?: File };
    (w.clFile ??= [] as unknown as File).push(donnees ? [nom, donnees] : [nom]);
  } catch {
    // La mesure ne doit jamais casser une fonctionnalité.
  }
}
