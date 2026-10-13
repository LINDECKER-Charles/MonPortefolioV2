const page = document.querySelector<HTMLElement>('[data-lod-page]');
const fiches = page?.querySelector<HTMLFieldSetElement>('.lod-fiches');
if (page && fiches) {
  const entete = document.querySelector<HTMLElement>('.entete');
  const sommaire = page.querySelector<HTMLElement>('.lod-sommaire');
  const hauteurBarres = () => (entete?.getBoundingClientRect().height ?? 0)
    + (sommaire?.getBoundingClientRect().height ?? 0);
  const ajusterHauteur = () => {
    const selection = fiches.querySelector<HTMLInputElement>('input[name="fiche-ahri"]:checked');
    const capture = selection && fiches.querySelector<HTMLElement>(`.lod-fiche--${selection.id.replace('fiche-', '')} .lod-capture`);
    if (!capture) return;
    // Les commandes, la légende et les espacements peuvent changer avec la
    // largeur ou la taille du texte. Seule la capture prend la place restante.
    const horsCapture = fiches.getBoundingClientRect().height - capture.getBoundingClientRect().height;
    const disponible = Math.floor(window.innerHeight - hauteurBarres() - 12 - horsCapture - 8);
    const hauteur = `${Math.max(48, Math.min(700, disponible))}px`;
    if (fiches.style.getPropertyValue('--lod-fiche-hauteur') !== hauteur) {
      fiches.style.setProperty('--lod-fiche-hauteur', hauteur);
    }
  };
  ajusterHauteur();
  window.addEventListener('resize', ajusterHauteur);
  if ('ResizeObserver' in window) {
    let frame = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(ajusterHauteur);
    });
    for (const element of [entete, sommaire, fiches.querySelector('.lod-fiches__choix'), ...fiches.querySelectorAll('figcaption')]) {
      if (element) observer.observe(element);
    }
  }
  fiches.addEventListener('change', (event) => {
    if (!(event.target instanceof HTMLInputElement) || event.target.name !== 'fiche-ahri') return;
    ajusterHauteur();
    const cadre = fiches.getBoundingClientRect();
    const haut = hauteurBarres() + 12;
    if (cadre.top < haut - 1 || cadre.bottom > window.innerHeight - 7) {
      window.scrollTo({ top: window.scrollY + cadre.top - haut, behavior: 'instant' });
    }
  });
}
function suivreChargement(image: HTMLImageElement, cadre: HTMLElement, statut: HTMLElement, messageErreur = 'Capture indisponible. Fermez puis réessayez.') {
  let sequence = 0;
  let attente = 0;
  const terminer = (erreur: boolean, tour: number) => {
    if (tour !== sequence) return;
    clearTimeout(attente);
    cadre.setAttribute('aria-busy', 'false');
    cadre.toggleAttribute('data-erreur', erreur);
    statut.textContent = erreur ? messageErreur : '';
    statut.hidden = !erreur;
  };
  const afficher = (tour: number) => {
    void image.decode().then(() => terminer(false, tour), () => {
      if (image.complete) terminer(image.naturalWidth === 0, tour);
    });
  };
  image.addEventListener('load', () => afficher(sequence));
  image.addEventListener('error', () => terminer(true, sequence));
  return {
    demarrer() {
      const tour = ++sequence;
      clearTimeout(attente);
      cadre.setAttribute('aria-busy', 'true');
      cadre.removeAttribute('data-erreur');
      statut.hidden = true;
      statut.textContent = '';
      // Une capture déjà en cache apparaît sans faire clignoter un indicateur.
      attente = window.setTimeout(() => {
        if (tour !== sequence) return;
        statut.textContent = 'Chargement de la capture…';
        statut.hidden = false;
      }, 180);
      if (image.complete) afficher(tour);
    },
    annuler() {
      ++sequence;
      clearTimeout(attente);
      cadre.setAttribute('aria-busy', 'false');
      statut.hidden = true;
    },
  };
}

for (const cadre of page?.querySelectorAll<HTMLAnchorElement>('.lod-fiche [data-lod-capture]') ?? []) {
  const image = cadre.querySelector<HTMLImageElement>('img');
  if (!image) continue;
  const statut = document.createElement('span');
  statut.className = 'lod-capture__statut';
  statut.setAttribute('role', 'status');
  statut.hidden = true;
  cadre.append(statut);
  suivreChargement(image, cadre, statut, 'Capture indisponible. Cliquez pour ouvrir l’original.').demarrer();
}

const dialog = page?.querySelector<HTMLDialogElement>('[data-lod-dialog]');
const image = dialog?.querySelector<HTMLImageElement>('[data-lod-full]');
if (page && dialog && image && typeof dialog.showModal === 'function') {
  const caption = dialog.querySelector<HTMLElement>('[data-lod-caption]');
  const bouton = dialog.querySelector<HTMLButtonElement>('.lod-visionneuse__image')!;
  const statut = dialog.querySelector<HTMLElement>('[data-lod-status]')!;
  const chargement = suivreChargement(image, bouton, statut);
  let opener: HTMLAnchorElement | null = null;
  let previousOverflow = '';
  let position = { x: 0, y: 0 };
  page.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    const link = event.target.closest<HTMLAnchorElement>('a[data-lod-capture]');
    const preview = link?.querySelector<HTMLImageElement>('img');
    if (!link || !preview || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    // Le choix de l’original reste indépendant du chargement et du format
    // réduit de l’aperçu, y compris quand le lecteur clique immédiatement.
    const originale = window.matchMedia('(max-width: 799px)').matches
      ? link.dataset.lodOriginalMobile || link.href
      : link.href;
    image.src = new URL(originale, document.baseURI).href;
    image.alt = preview.alt;
    chargement.demarrer();
    if (caption) caption.textContent = preview.alt;
    opener = link;
    previousOverflow = document.documentElement.style.overflow;
    position = { x: window.scrollX, y: window.scrollY };
    dialog.showModal();
    document.documentElement.style.overflow = 'hidden';
    bouton.focus({ preventScroll: true });
  });
  dialog.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    chargement.annuler();
    document.documentElement.style.overflow = previousOverflow;
    window.scrollTo({ left: position.x, top: position.y, behavior: 'instant' });
    // Le navigateur rend déjà le focus à la fermeture native. Le lecteur peut
    // avoir rejoint un autre contrôle avant la livraison de l’événement close.
    if (document.activeElement === document.body || dialog.contains(document.activeElement)) {
      opener?.focus({ preventScroll: true });
    }
  });
}
export {};
