/**
 * Section en cours : chaque lien d’un sommaire de page (`[data-sommaire]`,
 * la colonne « Dans cette page » et le sommaire de l’en-tête) reçoit
 * aria-current="location" quand sa section occupe le milieu de l’écran.
 * Sans JavaScript, les ancres fonctionnent, sans marque de section.
 */
let branche = false;

export function brancherSommaire(): void {
  // L’en-tête et la navigation de page l’appellent tous deux : une seule fois.
  if (branche) return;
  branche = true;
  const liens = [...document.querySelectorAll<HTMLAnchorElement>('[data-sommaire] a[href^="#"]')];
  if (!liens.length || !('IntersectionObserver' in window)) return;

  const parCible = new Map<Element, HTMLAnchorElement[]>();
  for (const lien of liens) {
    const cible = document.getElementById(decodeURIComponent(lien.hash.slice(1)));
    if (!cible) continue;
    parCible.set(cible, [...(parCible.get(cible) ?? []), lien]);
  }
  const ordre = [...parCible.keys()];
  const visibles = new Set<Element>();

  const observateur = new IntersectionObserver(
    (entrees) => {
      for (const entree of entrees) {
        if (entree.isIntersecting) visibles.add(entree.target);
        else visibles.delete(entree.target);
      }
      const courante = ordre.filter((cible) => visibles.has(cible)).at(-1);
      for (const lien of liens) lien.removeAttribute('aria-current');
      if (courante) for (const lien of parCible.get(courante) ?? []) lien.setAttribute('aria-current', 'location');
    },
    { rootMargin: '-35% 0px -55% 0px' },
  );
  for (const cible of ordre) observateur.observe(cible);
}
