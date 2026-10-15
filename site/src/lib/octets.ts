/**
 * Les tailles du stockage (rubrique Stockage du backoffice), comme les écrit
 * le Finder : base 1000, o, Ko, Mo, Go, To, une décimale au plus, chiffres
 * français et espace insécable avant l’unité.
 *
 *   octets(1_108_935)        → « 1,1 Mo »
 *   octets(994_662_584_320)  → « 994,7 Go »
 *
 * Et le seuil d’alerte du disque : moins de 10 % ou moins de 2 Go libres.
 */
const NBSP = '\u00a0';
const UNITES = ['o', 'Ko', 'Mo', 'Go', 'To'] as const;
const nombre = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 });
/** Un pour cent entier ; l’espace insécable est posé ici, pareil dans tous les navigateurs. */
const pourcent = (ratio: number) => `${nombre.format(Math.round(ratio * 100))}${NBSP}%`;

/** Une taille en octets, dans l’unité la plus lisible. */
export function octets(valeur: number): string {
  if (!Number.isFinite(valeur) || valeur < 0) return `0${NBSP}o`;
  let rang = 0;
  let reste = valeur;
  while (reste >= 1000 && rang < UNITES.length - 1) {
    reste /= 1000;
    rang += 1;
  }
  // 999 950 o s’arrondit à « 1 000 Ko » : on passe à l’unité suivante.
  if (rang < UNITES.length - 1 && Math.round(reste * 10) / 10 >= 1000) {
    reste /= 1000;
    rang += 1;
  }
  const texte = rang === 0 ? nombre.format(Math.round(reste)) : nombre.format(reste);
  return `${texte}${NBSP}${UNITES[rang]}`;
}

/** Une part, en pour cent entier (« 75 % ») ; une part non nulle ne s’affiche jamais « 0 % ». */
export function part(valeur: number, total: number): string {
  if (!(total > 0)) return pourcent(0);
  const ratio = Math.min(1, Math.max(0, valeur / total));
  return ratio > 0 && ratio < 0.005 ? `<${NBSP}${pourcent(0.01)}` : pourcent(ratio);
}

/** Seuils du disque : en dessous de l’un ou de l’autre, le backoffice prévient. */
export const SEUIL_DISQUE = { part: 0.1, octets: 2_000_000_000 } as const;

/** Vrai quand le disque se remplit : moins de 10 % ou moins de 2 Go libres. */
export function disqueSeRemplit(disque: { total: number; available: number }): boolean {
  return disque.available < SEUIL_DISQUE.octets || (disque.total > 0 && disque.available / disque.total < SEUIL_DISQUE.part);
}
