/**
 * Ce que les emplacements de visuels (components/ui/Visuel.astro) ont besoin
 * de savoir au moment du rendu, hors du registre.
 */

/**
 * Vrai quand un visuel manquant doit afficher sa commande de production
 * (identifiant, sujet, composition, format) : en développement, ou au build
 * avec `VISUELS_BROUILLON=1`. Sinon, le visiteur voit un cadre neutre au bon
 * ratio : la commande ne part jamais en ligne. `VISUELS_BROUILLON=0` force le
 * rendu public, même en développement.
 */
export function visuelsEnBrouillon(): boolean {
  const drapeau = process.env.VISUELS_BROUILLON;
  if (drapeau === '1') return true;
  if (drapeau === '0') return false;
  return import.meta.env.DEV;
}

let compteur = 0;

const echapper = (texte: string) => texte.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/**
 * Un dessin SVG du registre, prêt à insérer dans la page : sans prologue ni
 * <title>, à la taille de son cadre, avec son nom accessible (ou décoratif),
 * et des identifiants internes préfixés pour qu’un même dessin puisse
 * apparaître deux fois dans une page. Inséré en ligne, il hérite de la couleur
 * du texte (`currentColor`) et des jetons : un <img> ne le ferait pas.
 */
export function svgEnLigne(brut: string, { alt, classe }: { alt: string; classe?: string }): string {
  const prefixe = `v${(compteur += 1)}-`;
  const ouverture = /<svg\b[^>]*>/.exec(brut)?.[0];
  if (!ouverture) throw new Error('Dessin SVG sans balise <svg>');
  const viewBox = /\sviewBox="([^"]+)"/.exec(ouverture)?.[1];
  const garder = [...ouverture.matchAll(/\s(fill|stroke|stroke-width|stroke-linecap|stroke-linejoin)="([^"]*)"/g)].map(([, cle, valeur]) => ` ${cle}="${valeur}"`).join('');
  const nom = alt ? ` role="img" aria-label="${echapper(alt)}"` : ' aria-hidden="true"';
  const corps = brut
    .slice(brut.indexOf(ouverture) + ouverture.length, brut.lastIndexOf('</svg>'))
    .replace(/<title>[\s\S]*?<\/title>/, '')
    .replace(/\sid="([^"]+)"/g, ` id="${prefixe}$1"`)
    .replace(/url\(#([^)]+)\)/g, `url(#${prefixe}$1)`)
    .replace(/(\s(?:xlink:)?href)="#([^"]+)"/g, `$1="#${prefixe}$2"`)
    .trim();
  return `<svg xmlns="http://www.w3.org/2000/svg"${viewBox ? ` viewBox="${viewBox}"` : ''}${garder}${classe ? ` class="${classe}"` : ''}${nom} focusable="false">${corps}</svg>`;
}
