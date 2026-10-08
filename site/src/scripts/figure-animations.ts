/** Les boutons rejouent les dessins sans ouvrir de contenu supplémentaire. */
export function brancherAnimationsFigures(): void {
  const mouvementReduit = window.matchMedia('(prefers-reduced-motion: reduce)');
  const afficherComplet = (zone: HTMLElement) => {
    zone.classList.remove('animation-en-cours');
    if (!zone.hasAttribute('data-plafond')) return;
    for (const courbe of zone.querySelectorAll<SVGPolylineElement>('.courbe')) {
      courbe.style.transition = 'none';
      courbe.style.strokeDasharray = 'none';
      courbe.style.strokeDashoffset = '0';
    }
    zone.classList.remove('est-pret');
    zone.classList.add('est-trace');
  };

  for (const bouton of document.querySelectorAll<HTMLButtonElement>('[data-rejouer]')) {
    const zone = bouton.closest<HTMLElement>('[data-figure-animation]');
    if (!zone) continue;
    let version = 0;
    mouvementReduit.addEventListener('change', () => {
      if (!mouvementReduit.matches) return;
      version++;
      afficherComplet(zone);
    });
    bouton.addEventListener('click', () => {
      const rejeu = ++version;
      zone.querySelector('.planche__dessin')?.classList.add('est-proche');
      if (mouvementReduit.matches) {
        afficherComplet(zone);
        return;
      }
      if (zone.hasAttribute('data-plafond')) {
        const courbes = [...zone.querySelectorAll<SVGPolylineElement>('.courbe')].filter((courbe) => {
          let longueur = 0;
          try { longueur = courbe.getTotalLength(); } catch { return false; }
          if (!longueur) return false;
          courbe.style.transition = 'none';
          courbe.style.strokeDasharray = String(longueur);
          courbe.style.strokeDashoffset = String(longueur);
          return true;
        });
        if (!courbes.length) return;
        zone.classList.remove('est-trace');
        zone.classList.add('est-pret');
        window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
          if (rejeu !== version) return;
          if (mouvementReduit.matches) {
            afficherComplet(zone);
            return;
          }
          for (const courbe of courbes) {
            courbe.style.transition = 'stroke-dashoffset 1.8s cubic-bezier(.4, 0, .2, 1)';
            courbe.style.strokeDashoffset = '0';
          }
          zone.classList.add('est-trace');
        }));
        return;
      }
      zone.classList.remove('animation-en-cours');
      // Un rendu sépare la remise à zéro du rejeu, même pendant l’animation.
      void zone.offsetWidth;
      zone.classList.add('animation-en-cours');
      void Promise.allSettled(zone.getAnimations({ subtree: true }).map((animation) => animation.finished))
        .then(() => {
          if (rejeu === version) zone.classList.remove('animation-en-cours');
        });
    });
  }
}
