/**
 * Où en est le lecteur ?
 *   - Repère de lecture et sommaire mobile : le chapitre en cours, celui dont
 *     le titre a franchi le haut de l'écran (40 % de sa hauteur), est marqué
 *     `aria-current`. Au-dessus du premier chapitre, aucun ne l'est.
 *   - Mesure : un chapitre atteint envoie `lecture` une fois par chargement
 *     (docs/mesure-audience.md). C'est ce qui dit jusqu'où le récit est lu.
 */
import { mesurer } from './mesure';

const SEUIL = 0.4;

export function brancherLecture(): void {
  const chapitres = [...document.querySelectorAll<HTMLElement>('section[data-chapitre]')];
  if (!chapitres.length) return;
  const liens = [...document.querySelectorAll<HTMLAnchorElement>('a[data-repere]')];

  let enAttente = false;
  const majCourant = () => {
    enAttente = false;
    const limite = window.innerHeight * SEUIL;
    let courant: string | undefined;
    for (const chapitre of chapitres) {
      if (chapitre.getBoundingClientRect().top <= limite) courant = chapitre.dataset.chapitre;
    }
    for (const lien of liens) {
      if (lien.dataset.repere === courant) lien.setAttribute('aria-current', 'location');
      else lien.removeAttribute('aria-current');
    }
  };
  const planifier = () => {
    if (enAttente) return;
    enAttente = true;
    window.requestAnimationFrame(majCourant);
  };
  majCourant();
  window.addEventListener('scroll', planifier, { passive: true });
  window.addEventListener('resize', planifier);

  if (!('IntersectionObserver' in window)) return;
  const lus = new Set<string>();
  const observateur = new IntersectionObserver(
    (entrees) => {
      for (const entree of entrees) {
        if (!entree.isIntersecting) continue;
        const id = (entree.target.closest('section[data-chapitre]') as HTMLElement | null)?.dataset.chapitre;
        observateur.unobserve(entree.target);
        if (!id || lus.has(id)) continue;
        lus.add(id);
        mesurer('lecture', { chapitre: id });
      }
    },
    // Le titre du chapitre est entré dans les 60 % hauts de l'écran.
    { rootMargin: '0px 0px -40% 0px' },
  );
  for (const chapitre of chapitres) observateur.observe(chapitre.querySelector('h2') ?? chapitre);
}
