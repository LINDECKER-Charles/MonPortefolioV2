/**
 * Les quatre allumages de Bloodborne Legendary Run
 * (components/projets/bloodborne/Rituels.astro) : une seule vidéo à la fois,
 * arrêtée quand on en choisit une autre, quand le lecteur quitte l’écran ou
 * quand l’onglet est masqué. Sur téléphone, choisir un rituel amène son
 * lecteur dans la vue s’il est sous le pli, sans jamais faire remonter la page.
 */
const rituels = document.querySelector<HTMLElement>('[data-blr-rituels]');
if (rituels) {
  const videos = [...rituels.querySelectorAll<HTMLVideoElement>('video')];
  const pause = () => videos.forEach((video) => video.pause());
  rituels.addEventListener('change', (event) => {
    pause();
    const choix = event.target;
    if (!(choix instanceof HTMLInputElement) || !choix.checked || !window.matchMedia('(max-width: 860px)').matches) return;
    const video = videos.find((element) => element.closest('[data-blr-rituel]')?.id === choix.getAttribute('aria-controls'));
    if (!video) return;
    const hautVisible = (document.querySelector('.entete')?.getBoundingClientRect().bottom ?? 0) + 16;
    const cadre = video.getBoundingClientRect();
    if (cadre.top <= hautVisible || cadre.bottom <= window.innerHeight - 16) return;
    window.scrollTo({
      top: window.scrollY + cadre.top - hautVisible,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
  });
  videos.forEach((video) => video.addEventListener('play', () => {
    videos.forEach((autre) => { if (autre !== video) autre.pause(); });
  }));
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
  const lecteurs = rituels.querySelector('.blr-rituels__lecteurs');
  if (lecteurs && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) pause(); }, { threshold: 0 }).observe(lecteurs);
  }
}
export {};
