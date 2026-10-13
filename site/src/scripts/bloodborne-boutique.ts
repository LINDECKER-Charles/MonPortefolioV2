/**
 * La boutique de Bloodborne Legendary Run en carrousel
 * (components/projets/bloodborne/Boutique.astro) : les rayons se choisissent
 * par leur nom, par Précédent et Suivant, ou aux flèches, Début et Fin dans
 * la galerie, sans déplacer la page. Seule la capture du rayon visible reste
 * dans l’ordre de tabulation ; le changement de rayon est annoncé.
 */
const boutique = document.querySelector<HTMLElement>('[data-blr-boutique]');
const ecrans = boutique?.querySelector<HTMLElement>('[data-blr-boutique-ecrans]');

if (boutique && ecrans) {
  const rayons = [...ecrans.querySelectorAll<HTMLElement>('[data-blr-boutique-rayon]')];
  const choix = [...boutique.querySelectorAll<HTMLButtonElement>('[data-blr-boutique-choix]')];
  const precedent = boutique.querySelector<HTMLButtonElement>('[data-blr-boutique-precedent]');
  const suivant = boutique.querySelector<HTMLButtonElement>('[data-blr-boutique-suivant]');
  const position = boutique.querySelector<HTMLElement>('[data-blr-boutique-position]');
  const annonce = boutique.querySelector<HTMLElement>('[data-blr-boutique-annonce]');
  const mouvementReduit = window.matchMedia('(prefers-reduced-motion: reduce)');
  let courant = 0;
  let frame = 0;

  const actualiser = (index: number, annoncer = false) => {
    const change = courant !== index;
    courant = index;
    choix.forEach((bouton, rayon) => bouton.setAttribute('aria-pressed', String(rayon === index)));
    rayons.forEach((rayon, numero) => {
      const lien = rayon.querySelector<HTMLAnchorElement>('a[data-agrandir]');
      if (lien) lien.tabIndex = numero === index ? 0 : -1;
    });
    precedent?.setAttribute('aria-disabled', String(index === 0));
    suivant?.setAttribute('aria-disabled', String(index === rayons.length - 1));
    if (position) position.textContent = `${index + 1} / ${rayons.length}`;
    if (annonce && (change || annoncer)) annonce.textContent = rayons[index]?.getAttribute('aria-label') ?? '';
  };

  const aller = (index: number) => {
    if (index < 0 || index >= rayons.length) return;
    ecrans.scrollTo({ left: rayons[index].offsetLeft - rayons[0].offsetLeft, behavior: mouvementReduit.matches ? 'instant' : 'smooth' });
  };

  choix.forEach((bouton, index) => bouton.addEventListener('click', () => aller(index)));
  precedent?.addEventListener('click', () => aller(courant - 1));
  suivant?.addEventListener('click', () => aller(courant + 1));
  ecrans.addEventListener('keydown', (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    let destination: number | undefined;
    if (event.key === 'ArrowLeft') destination = courant - 1;
    if (event.key === 'ArrowRight') destination = courant + 1;
    if (event.key === 'Home') destination = 0;
    if (event.key === 'End') destination = rayons.length - 1;
    if (destination === undefined) return;
    event.preventDefault();
    if (document.activeElement !== ecrans) ecrans.focus({ preventScroll: true });
    aller(destination);
  });
  ecrans.addEventListener('scroll', () => {
    if (frame) return;
    frame = window.requestAnimationFrame(() => {
      frame = 0;
      const gauche = ecrans.getBoundingClientRect().left;
      const index = rayons.reduce((proche, rayon, numero) => Math.abs(rayon.getBoundingClientRect().left - gauche) < Math.abs(rayons[proche].getBoundingClientRect().left - gauche) ? numero : proche, 0);
      actualiser(index);
    });
  }, { passive: true });
  boutique.querySelector<HTMLElement>('[data-blr-boutique-navigation]')?.removeAttribute('hidden');
  actualiser(0);
}

export {};
