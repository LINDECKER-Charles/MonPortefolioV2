/**
 * Typographie française des textes passés en propriétés (fiches, glossaire) :
 * espace insécable avant « : ; ! ? » et à l'intérieur des guillemets, pour
 * qu'un signe ne se retrouve jamais seul en début de ligne. Les textes écrits
 * dans les gabarits portent déjà leurs &nbsp; ; tools/verifier-site.mjs
 * contrôle le résultat sur tout le site construit.
 */
export function typo(texte: string): string {
  return texte.replace(/ ([:;!?»])/g, ' $1').replace(/« /g, '« ');
}
