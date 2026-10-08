/**
 * Le moment du site : la figure 1 se trace une fois, quand elle entre à
 * l'écran. La courbe se dessine en 1,8 s, puis les annotations apparaissent
 * dans l'ordre de la lecture — le plafond, la percée, le deck.
 *
 * Rien ne se prépare si le lecteur a demandé moins de mouvement, si
 * l'observateur d'intersection manque, ou si la figure est déjà visible au
 * chargement (retour sur la page, lien direct) : elle s'affiche alors
 * complète, comme sans JavaScript.
 */
const DUREE = '1.8s';

export function brancherPlafond(): void {
  const plan = document.querySelector<HTMLElement>('[data-plafond]');
  if (!plan) return;
  const mouvementReduit = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (mouvementReduit.matches) return;
  if (!('IntersectionObserver' in window)) return;
  if (plan.getBoundingClientRect().top < window.innerHeight) return;

  // Les deux versions (bureau, mobile) sont préparées : un changement
  // d'orientation entre-temps ne laisse pas une courbe invisible.
  // Une version masquée peut refuser de se mesurer (selon le navigateur) :
  // elle reste alors entière, sans tiret.
  const courbes = [...plan.querySelectorAll<SVGPolylineElement>('.courbe')].filter((courbe) => {
    let longueur = 0;
    try {
      longueur = courbe.getTotalLength();
    } catch {
      return false;
    }
    if (!longueur) return false;
    courbe.style.strokeDasharray = String(longueur);
    courbe.style.strokeDashoffset = String(longueur);
    return true;
  });
  if (!courbes.length) return;
  plan.classList.add('est-pret');

  const observateur = new IntersectionObserver(
    (entrees) => {
      if (!entrees.some((entree) => entree.isIntersecting)) return;
      observateur.disconnect();
      for (const courbe of courbes) {
        courbe.getBoundingClientRect();
        courbe.style.transition = mouvementReduit.matches ? 'none' : `stroke-dashoffset ${DUREE} cubic-bezier(.4, 0, .2, 1)`;
        courbe.style.strokeDashoffset = '0';
      }
      plan.classList.add('est-trace');
    },
    { threshold: 0.45 },
  );
  observateur.observe(plan);
}
