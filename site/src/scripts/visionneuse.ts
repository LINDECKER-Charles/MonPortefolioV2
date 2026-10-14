/**
 * La visionneuse partagée (components/ui/Visionneuse.astro) : un clic sur un
 * lien `a[data-agrandir]` ouvre son image en plein écran, dans un <dialog>
 * modal. Échap, un clic sur l’image ou le fond, ou le bouton « Fermer » la
 * referment ; le focus revient au lien, la page reprend où elle était.
 *
 * Sans JavaScript, sans <dialog> ou avec une touche de modification (nouvel
 * onglet), le lien ouvre simplement l’image.
 *
 * Attributs du lien : href (l’image pleine taille), data-legende (texte de
 * la légende, sinon l’alt de l’image du lien).
 */
export function brancherVisionneuse(): void {
  const dialogue = document.querySelector<HTMLDialogElement>('dialog[data-visionneuse]');
  if (!dialogue || typeof dialogue.showModal !== 'function') return;
  const image = dialogue.querySelector<HTMLImageElement>('[data-visionneuse-image]');
  const legende = dialogue.querySelector<HTMLElement>('[data-visionneuse-legende]');
  const etat = dialogue.querySelector<HTMLElement>('[data-visionneuse-etat]');
  const fermer = dialogue.querySelector<HTMLButtonElement>('[data-visionneuse-fermer]');
  if (!image || !legende || !etat || !fermer) return;

  let source: HTMLAnchorElement | null = null;
  let debordement = '';
  let position = { x: 0, y: 0 };
  let tour = 0;

  document.addEventListener('click', (evenement) => {
    if (!(evenement.target instanceof Element)) return;
    const lien = evenement.target.closest<HTMLAnchorElement>('a[data-agrandir]');
    if (!lien || evenement.defaultPrevented || evenement.button !== 0) return;
    if (evenement.metaKey || evenement.ctrlKey || evenement.shiftKey || evenement.altKey) return;
    evenement.preventDefault();

    source = lien;
    const alt = lien.querySelector('img')?.alt ?? '';
    legende.textContent = lien.dataset.legende || alt;
    image.alt = alt;
    image.hidden = true;
    etat.textContent = 'Chargement de la capture…';
    dialogue.setAttribute('aria-busy', 'true');
    image.src = lien.href;

    debordement = document.documentElement.style.overflow;
    position = { x: window.scrollX, y: window.scrollY };
    dialogue.showModal();
    document.documentElement.style.overflow = 'hidden';
    fermer.focus({ preventScroll: true });

    const courant = ++tour;
    image.decode().then(
      () => {
        if (courant !== tour) return;
        image.hidden = false;
        etat.textContent = '';
        dialogue.setAttribute('aria-busy', 'false');
      },
      () => {
        if (courant !== tour) return;
        etat.textContent = 'Image indisponible. Fermez la visionneuse et réessayez.';
        dialogue.setAttribute('aria-busy', 'false');
      },
    );
  });

  // Un clic sur l’image ou sur le fond referme ; un clic sur la légende, non.
  dialogue.addEventListener('click', (evenement) => {
    if (evenement.target === dialogue || evenement.target === image) dialogue.close();
  });
  fermer.addEventListener('click', () => dialogue.close());

  dialogue.addEventListener('close', () => {
    tour++;
    image.removeAttribute('src');
    document.documentElement.style.overflow = debordement;
    window.scrollTo({ left: position.x, top: position.y, behavior: 'instant' });
    source?.focus({ preventScroll: true });
    source = null;
  });
}
