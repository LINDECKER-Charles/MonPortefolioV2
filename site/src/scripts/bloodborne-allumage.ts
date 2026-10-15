/**
 * L’allumage d’une étoile, dans l’en-tête de Bloodborne Legendary Run
 * (components/projets/bloodborne/VisuelEnTete.astro) : la vidéo, muette, se
 * joue une fois à son arrivée dans l’écran, puis se rejoue d’un clic ou au
 * clavier sur le téléphone.
 *
 * Mouvement réduit : pas de lecture automatique, le poster reste ; un clic
 * la lance, à la demande. Hors de l’écran ou dans un onglet masqué, elle
 * s’arrête. Sans JavaScript, le lecteur garde ses commandes natives.
 */
export function brancherAllumage(): void {
  const video = document.querySelector<HTMLVideoElement>('video[data-blr-allumage]');
  const rejouer = document.querySelector<HTMLButtonElement>('[data-blr-rejouer]');
  if (!video || !rejouer) return;

  const mouvementReduit = window.matchMedia('(prefers-reduced-motion: reduce)');
  // Le téléphone devient la commande : plus de barre de lecture par-dessus l’écran.
  video.controls = false;
  video.muted = true;
  let joue = false;
  let visible = false;

  const lire = () => {
    video.currentTime = 0;
    void video.play().catch(() => {
      // Lecture refusée (économie de données, navigateur) : le poster reste.
    });
  };

  // Plus de cinq secondes de mouvement : le même geste l’arrête (WCAG 2.2.2).
  const libeller = () => {
    const enCours = !video.paused && !video.ended;
    rejouer.setAttribute('aria-label', enCours ? 'Mettre en pause l’allumage de l’étoile' : 'Rejouer l’allumage de l’étoile');
  };
  for (const evenement of ['play', 'pause', 'ended']) video.addEventListener(evenement, libeller);

  rejouer.addEventListener('click', () => {
    joue = true;
    if (!video.paused && !video.ended) {
      video.pause();
      return;
    }
    lire();
  });

  const premiereLecture = () => {
    if (joue || !visible || document.hidden || mouvementReduit.matches) return;
    joue = true;
    lire();
  };

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entree]) => {
      visible = entree.isIntersecting && entree.intersectionRatio >= 0.4;
      if (!entree.isIntersecting) video.pause();
      premiereLecture();
    }, { threshold: [0, 0.4] }).observe(video);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) video.pause();
    else premiereLecture();
  });
  mouvementReduit.addEventListener('change', () => {
    if (mouvementReduit.matches) video.pause();
  });
}
