const page = document.querySelector<HTMLElement>('[data-omnicard-page]');
const dialog = page?.querySelector<HTMLDialogElement>('[data-oc-dialog]');
const image = dialog?.querySelector<HTMLImageElement>('[data-oc-zoom-image]');
const statut = dialog?.querySelector<HTMLElement>('[data-oc-zoom-status]');

if (page && dialog && image && statut && typeof dialog.showModal === 'function') {
  let opener: HTMLAnchorElement | null = null;
  let previousOverflow = '';
  let position = { x: 0, y: 0 };
  let sequence = 0;
  page.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    const link = event.target.closest<HTMLAnchorElement>('[data-oc-capture]');
    if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    opener = link;
    previousOverflow = document.documentElement.style.overflow;
    position = { x: window.scrollX, y: window.scrollY };
    image.alt = link.querySelector('img')?.alt ?? 'Capture d’Omnicard';
    image.src = link.href;
    image.hidden = true;
    statut.textContent = 'Chargement de la capture…';
    dialog.setAttribute('aria-busy', 'true');
    dialog.showModal();
    document.documentElement.style.overflow = 'hidden';
    const current = ++sequence;
    void image.decode().then(() => {
      if (current !== sequence) return;
      image.hidden = false;
      statut.textContent = '';
      dialog.setAttribute('aria-busy', 'false');
    }, () => {
      if (current !== sequence) return;
      statut.textContent = 'Image indisponible. Fermez la capture et réessayez.';
      dialog.setAttribute('aria-busy', 'false');
    });
  });
  dialog.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    sequence++;
    document.documentElement.style.overflow = previousOverflow;
    window.scrollTo({ left: position.x, top: position.y, behavior: 'instant' });
    opener?.focus({ preventScroll: true });
  });
}
export {};
