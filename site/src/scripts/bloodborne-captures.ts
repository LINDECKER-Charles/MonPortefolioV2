const page = document.querySelector<HTMLElement>('[data-bloodborne-page]');
const dialog = page?.querySelector<HTMLDialogElement>('[data-blr-dialog]');
if (page && dialog && typeof dialog.showModal === 'function') {
  const caption = dialog.querySelector<HTMLElement>('[data-blr-caption]');
  const images = [...dialog.querySelectorAll<HTMLElement>('[data-blr-full]')];
  let opener: HTMLAnchorElement | null = null;
  let previousOverflow = '';
  let position = { x: 0, y: 0 };
  page.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    const link = event.target.closest<HTMLAnchorElement>('a[data-blr-capture]');
    if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = images.find((element) => element.dataset.blrFull === link.dataset.blrCapture);
    if (!target) return;
    event.preventDefault();
    images.forEach((element) => { element.hidden = element !== target; });
    if (caption) caption.textContent = target.querySelector('[data-blr-image-title]')?.textContent ?? '';
    opener = link;
    previousOverflow = document.documentElement.style.overflow;
    position = { x: window.scrollX, y: window.scrollY };
    dialog.showModal();
    document.documentElement.style.overflow = 'hidden';
    target.querySelector<HTMLButtonElement>('[data-blr-close]')?.focus({ preventScroll: true });
  });
  // Cliquer l’image ou le fond suffit ; Échap conserve le comportement natif.
  dialog.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    document.documentElement.style.overflow = previousOverflow;
    window.scrollTo({ left: position.x, top: position.y, behavior: 'instant' });
    opener?.focus({ preventScroll: true });
  });
}
export {};
