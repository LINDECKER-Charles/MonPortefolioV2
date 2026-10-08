/**
 * Les planches au trait (masques CSS) ne se téléchargent qu'à l'approche :
 * marquées `est-proche` à 800 px de l'écran, elles arrivent avant que le
 * lecteur les atteigne, sans peser sur le premier affichage. Sans observateur
 * d'intersection, tout est chargé tout de suite.
 */
export function brancherPlanches(): void {
  const dessins = [...document.querySelectorAll<HTMLElement>('.planche__dessin')];
  if (!dessins.length) return;
  if (!('IntersectionObserver' in window)) {
    for (const dessin of dessins) dessin.classList.add('est-proche');
    return;
  }
  const observateur = new IntersectionObserver(
    (entrees) => {
      for (const entree of entrees) {
        if (!entree.isIntersecting) continue;
        entree.target.classList.add('est-proche');
        observateur.unobserve(entree.target);
      }
    },
    { rootMargin: '800px 0px' },
  );
  for (const dessin of dessins) observateur.observe(dessin);
  // Avant une impression, tout doit être là.
  window.addEventListener('beforeprint', () => {
    for (const dessin of dessins) dessin.classList.add('est-proche');
  });
}
