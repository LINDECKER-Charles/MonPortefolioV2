/**
 * Redirections permanentes (301) d'anciennes adresses vers les pages du site.
 *
 * Une famille aujourd'hui : les routes de la V1, l'application Angular du dépôt
 * MonPortfolio, servie sur charles-lindecker.com jusqu'à ce que la V2 prenne le
 * domaine. Elles ont des liens entrants (CV envoyés, profils, moteurs de
 * recherche) : les envoyer vers leur équivalent plutôt qu'en 404 conserve ce
 * qu'elles ont acquis. `/mentions-legales` existe sous la même adresse dans les
 * deux versions et n'a rien à faire ici.
 *
 * Les pages Projets et Parcours ont leur propre adresse dans la V2. Les
 * anciennes routes pointent vers leur équivalent. On change la destination, jamais la
 * source : c'est ce qui conserve l'historique de l'adresse dans Google.
 *
 * Clé = chemin exact, sans slash final ; valeur = destination (chemin du site,
 * sans slash final, page qui existe : une redirection vers une 404 perd tout).
 * Une destination n'est jamais elle-même une clé : pas de chaîne de 301.
 */
export const REDIRECTIONS = new Map([
  // Pages de la V1.
  ['/projects', '/projets'],
  ['/works', '/parcours'],
  ['/resume', '/parcours'],
  ['/linktree', '/contact'],

  // Séquences d'ouverture de la V1 : hors index, mais des liens ont circulé.
  ['/opening-home', '/'],
  ['/opening-resume', '/'],

  // Pages légales de la V1 : la V2 les réunit dans les mentions légales.
  ['/politique-confidentialite', '/mentions-legales'],
  ['/politique-cookies', '/mentions-legales'],
]);

/**
 * La comparaison ignore la casse. Rien ne garantit que les liens qui circulent
 * encore respectent celle des routes d'origine, et aucune page du site ne se
 * distingue d'une autre par la casse seule : l'ignorer ne peut détourner aucune
 * adresse actuelle.
 */
const PAR_CLE = new Map([...REDIRECTIONS].map(([source, destination]) => [source.toLowerCase(), destination]));

/** Destination d'un chemin (décodé, sans slash final), ou undefined. */
export function trouverRedirection(chemin) {
  return PAR_CLE.get(chemin.toLowerCase());
}
