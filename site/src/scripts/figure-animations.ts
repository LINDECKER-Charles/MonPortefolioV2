/** Chaque scène se joue à sa première arrivée, puis se rejoue sur le dessin. */
export function brancherAnimationsFigures(): void {
  const mouvementReduit = window.matchMedia('(prefers-reduced-motion: reduce)');
  const zones = [...document.querySelectorAll<HTMLElement>('[data-figure-animation]')];
  const boucles = zones.filter((zone) => zone.hasAttribute('data-animation-continue'));
  const dansEcran = new Set<HTMLElement>();
  const revelations = [...document.querySelectorAll<HTMLElement>('[data-revelation-progressive]')];
  const scenesDansEcran = new Set<HTMLElement>();
  const scenesLues = new Set<HTMLElement>();
  const rejouer = new Map<HTMLElement, () => void>();
  const versions = new Map<HTMLElement, number>();
  let observateurScenes: IntersectionObserver | undefined;
  let observateurRevelations: IntersectionObserver | undefined;
  let impression = false;

  const actualiserBoucles = () => {
    for (const zone of boucles) {
      zone.classList.toggle('est-visible', dansEcran.has(zone) && !document.hidden && !impression && !mouvementReduit.matches);
    }
  };
  if ('IntersectionObserver' in window) {
    const observateur = new IntersectionObserver((entrees) => {
      for (const entree of entrees) {
        const zone = entree.target as HTMLElement;
        if (entree.isIntersecting) dansEcran.add(zone);
        else dansEcran.delete(zone);
      }
      actualiserBoucles();
    }, { threshold: .1 });
    for (const zone of boucles) observateur.observe(zone);
  } else {
    for (const zone of boucles) dansEcran.add(zone);
    actualiserBoucles();
  }
  // Le texte reste entier sans JavaScript, avec mouvement réduit et à l’impression.
  if (!mouvementReduit.matches && 'IntersectionObserver' in window) {
    observateurRevelations = new IntersectionObserver((entrees) => {
      for (const entree of entrees) {
        if (!entree.isIntersecting) continue;
        entree.target.classList.add('est-revele');
        observateurRevelations?.unobserve(entree.target);
      }
    }, { threshold: .12 });
    for (const revelation of revelations) {
      revelation.classList.add('revelation-prepare');
      observateurRevelations.observe(revelation);
    }
  }
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

  mouvementReduit.addEventListener('change', () => {
    actualiserBoucles();
    if (!mouvementReduit.matches) return;
    observateurRevelations?.disconnect();
    for (const zone of zones) {
      versions.set(zone, (versions.get(zone) ?? 0) + 1);
      afficherComplet(zone);
    }
    for (const revelation of revelations) revelation.classList.remove('revelation-prepare', 'est-revele');
  });

  for (const bouton of document.querySelectorAll<HTMLButtonElement>('[data-rejouer]')) {
    const zone = bouton.closest<HTMLElement>('[data-figure-animation]');
    if (!zone) continue;
    const jouer = () => {
      const version = (versions.get(zone) ?? 0) + 1;
      versions.set(zone, version);
      if (mouvementReduit.matches || impression) {
        afficherComplet(zone);
        return;
      }
      if (zone.hasAttribute('data-animation-continue')) {
        zone.classList.remove('est-visible');
        void zone.offsetWidth;
        actualiserBoucles();
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
          if (version !== versions.get(zone)) return;
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
          if (version === versions.get(zone)) zone.classList.remove('animation-en-cours');
        });
    };
    rejouer.set(zone, jouer);
    bouton.addEventListener('click', () => {
      // Un clic avant l’arrivée automatique compte déjà comme une première lecture.
      scenesLues.add(zone);
      observateurScenes?.unobserve(zone);
      scenesDansEcran.delete(zone);
      jouer();
    });
  }

  const jouerScenesVisibles = () => {
    if (document.hidden || impression) return;
    for (const zone of scenesDansEcran) {
      if (scenesLues.has(zone)) continue;
      scenesLues.add(zone);
      observateurScenes?.unobserve(zone);
      rejouer.get(zone)?.();
    }
    scenesDansEcran.clear();
  };
  if ('IntersectionObserver' in window) {
    observateurScenes = new IntersectionObserver((entrees) => {
      for (const entree of entrees) {
        const zone = entree.target as HTMLElement;
        if (entree.isIntersecting && entree.intersectionRatio >= .4) scenesDansEcran.add(zone);
        else scenesDansEcran.delete(zone);
      }
      jouerScenesVisibles();
    }, { threshold: .4 });
    for (const zone of zones) {
      // Le graphique et le système en boucle ont leur propre déclenchement.
      if (!zone.hasAttribute('data-plafond') && !zone.hasAttribute('data-animation-continue')) {
        observateurScenes.observe(zone);
      }
    }
  }
  document.addEventListener('visibilitychange', () => {
    actualiserBoucles();
    jouerScenesVisibles();
  });
  window.addEventListener('beforeprint', () => {
    impression = true;
    actualiserBoucles();
    for (const zone of zones) {
      versions.set(zone, (versions.get(zone) ?? 0) + 1);
      afficherComplet(zone);
    }
  });
  window.addEventListener('afterprint', () => {
    impression = false;
    actualiserBoucles();
    jouerScenesVisibles();
  });
}
