/**
 * Adresses admises dans un article du blog : la règle de la validation Rust
 * (backend/src/blog.rs, `link_url` et `valid_image_url`), en un seul endroit
 * pour le rendu public (server/blog.mjs) et l’éditeur du backoffice
 * (src/scripts/blog-editor.ts). Les cas de tests/fixtures/liens-blog.json sont
 * vérifiés des deux côtés.
 *
 * Sans dépendance ni API de Node : le module part aussi dans le navigateur.
 */
const ANCRE = /^[A-Za-z0-9_-]+$/;
const INTERNE = /^(\/[A-Za-z0-9/_.-]*)(?:\?[A-Za-z0-9=&_.-]+)?(?:#[A-Za-z0-9_-]+)?$/;
const CONTROLE = /[\u0000-\u001f\u007f-\u009f]/;

/**
 * Le lien tel qu’il sera rendu, ou '' s’il est refusé : adresse http(s)
 * absolue sans identifiants ; chemin du site, avec au besoin des paramètres et
 * une ancre sûrs (`/blog?page=2`, `/projets/omnicard#decisions`) ; ancre d’un
 * titre de l’article (`#le-contexte`). Ni mailto:, ni javascript:, ni data:.
 * @param {unknown} href
 * @returns {string}
 */
export function lienArticle(href) {
  if (typeof href !== 'string' || !href || href.length > 2048 || CONTROLE.test(href)) return '';
  if (href.startsWith('#')) return ANCRE.test(href.slice(1)) ? href : '';
  const interne = INTERNE.exec(href);
  if (interne) return interne[1].includes('//') || interne[1].includes('..') ? '' : href;
  try {
    const url = new URL(href);
    return ['https:', 'http:'].includes(url.protocol) && url.hostname && !url.username && !url.password ? url.href : '';
  } catch {
    return '';
  }
}

/** Une image d’article est toujours une image importée : `/api/blog/media/{id}`. */
export const IMAGE_ARTICLE = /^\/api\/blog\/media\/[1-9]\d*$/;

/**
 * @param {unknown} src
 * @returns {string}
 */
export const imageArticle = (src) => (typeof src === 'string' && IMAGE_ARTICLE.test(src) ? src : '');
