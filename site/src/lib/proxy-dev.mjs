// @ts-check
/**
 * Les routes que le proxy d’`astro dev` (astro.config.mjs) relaie vers le
 * backend : les mêmes que le relais de production (server/contact.mjs), et
 * rien d’autre. Les listes (demandes, articles, images) passent leurs filtres
 * en paramètres : l’expression admet une chaîne de requête. Une image du blog
 * se relaie seule ou par l’une de ses variantes (`/media/{id}/{largeur}`).
 *
 * Une route nouvelle s’ajoute ici, au routeur Rust et au relais Node ;
 * tests/unit/proxy-dev.test.ts dit ce qui passe et ce qui ne passe pas.
 */
export const ROUTES_PROXY_DEV =
  '^/(api/(contact|health|config/contact|blog/(posts(/[a-z0-9-]+)?|media/[1-9][0-9]*(/[1-9][0-9]*)?)|backoffice/((login|logout|session|settings|contacts|links|tokens)(/[1-9][0-9]*)?|storage|mail(/test)?|2fa/(setup|verify)|blog/(posts(/[1-9][0-9]*(/(publish|schedule|unpublish|preview|seo))?)?|media(/[1-9][0-9]*(/[1-9][0-9]*)?)?)))|mcp)(\\?.*)?$';
