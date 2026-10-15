/**
 * Ce que la coque du backoffice (scripts/backoffice.ts) fait pour l’atelier
 * du blog, sans toucher à sa logique (scripts/blog-editor.ts) :
 *
 * - la hauteur réelle de la barre collante de l’article (`.blog-barre`, qui
 *   grandit avec #blog-notice) dans `--barre-article`, que
 *   styles/blog-editor.css réserve au défilement : un champ qui reçoit le
 *   focus s’arrête sous la barre, jamais dessous (WCAG 2.4.11) ; un champ
 *   que le navigateur laisse à moitié dessous finit d’être dégagé ;
 * - #blog-notice s’efface au changement de page de l’article et à la
 *   première modification, pour ne pas dire « enregistré » à côté de
 *   « Modifications non enregistrées ». Un message écrit pendant la
 *   navigation (celui d’une validation) reste ; celui de la rédaction
 *   conservée après une session expirée reste jusqu’à ce qu’un autre le
 *   remplace (`conserver`).
 * - une aide d’erreur posée à côté d’un champ (`aria-errormessage`) se montre
 *   et se lit quand le champ est refusé, même si la bulle du navigateur se
 *   ferme ; elle s’efface dès que la saisie redevient valide.
 */
export interface Atelier {
  /** Le retour affiché au moment où une navigation est demandée. */
  avantNavigation: () => string;
  /** La page de l’article a changé : le retour s’efface s’il n’a pas été réécrit entre-temps. */
  apresNavigation: (avant: string) => void;
  /** Le retour affiché survit aux changements de page et aux modifications. */
  conserver: () => void;
}

type Champ = HTMLInputElement | HTMLTextAreaElement;

export function brancherAtelier(): Atelier {
  const retour = document.getElementById('blog-notice');
  const barre = document.querySelector<HTMLElement>('.blog-barre');
  let persistant = '';

  if (barre && 'ResizeObserver' in window) {
    new ResizeObserver(() => {
      document.documentElement.style.setProperty('--barre-article', `${Math.ceil(barre.getBoundingClientRect().height)}px`);
    }).observe(barre);
  }

  // Le défilement du navigateur au focus laisse un champ à moitié visible
  // quand il dépasse déjà sous la barre : on finit de le dégager.
  document.addEventListener('focusin', (evenement) => {
    const cible = evenement.target;
    if (!barre || !(cible instanceof HTMLElement) || !cible.closest('#blog-edit-view')) return;
    window.requestAnimationFrame(() => {
      if (document.activeElement !== cible || getComputedStyle(barre).position !== 'sticky') return;
      const reserve = Number.parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      const boite = cible.getBoundingClientRect();
      if (boite.top < barre.getBoundingClientRect().bottom && boite.height <= window.innerHeight - reserve) window.scrollBy({ top: boite.top - reserve, behavior: 'instant' });
    });
  });

  function effacer(): void {
    if (!retour || retour.hidden || (persistant && retour.textContent === persistant)) return;
    retour.replaceChildren();
    delete retour.dataset.state;
    retour.hidden = true;
  }

  function marquer(champ: Champ, refuse: boolean): void {
    const aide = champ.getAttribute('aria-errormessage');
    if (!aide) return;
    const decrit = (champ.getAttribute('aria-describedby') ?? '').split(/\s+/).filter((id) => id && id !== aide);
    if (refuse) {
      champ.setAttribute('aria-invalid', 'true');
      decrit.push(aide);
    } else champ.removeAttribute('aria-invalid');
    champ.setAttribute('aria-describedby', decrit.join(' '));
  }
  const champAide = (cible: EventTarget | null): Champ | undefined =>
    (cible instanceof HTMLInputElement || cible instanceof HTMLTextAreaElement) && cible.hasAttribute('aria-errormessage') ? cible : undefined;

  // `invalid` ne remonte pas : écouté en capture.
  document.addEventListener('invalid', (evenement) => { const champ = champAide(evenement.target); if (champ) marquer(champ, true); }, true);
  document.addEventListener('change', (evenement) => { const champ = champAide(evenement.target); if (champ) marquer(champ, !champ.validity.valid); });
  /** Un champ refusé redevenu valide, par la saisie ou par le script (adresse tirée du titre, formulaire vidé). */
  function revoir(): void {
    for (const champ of document.querySelectorAll<Champ>('[aria-errormessage][aria-invalid="true"]')) if (champ.validity.valid) marquer(champ, false);
  }
  document.addEventListener('input', (evenement) => {
    revoir();
    if (evenement.target instanceof Element && evenement.target.closest('#blog-edit-view')) effacer();
  });
  // `reset` part avant que les valeurs ne reviennent : la relecture attend la suite.
  document.addEventListener('reset', () => { window.setTimeout(revoir); });

  return {
    avantNavigation: () => retour?.textContent ?? '',
    apresNavigation: (avant) => { if ((retour?.textContent ?? '') === avant) effacer(); },
    conserver: () => { persistant = retour && !retour.hidden ? retour.textContent ?? '' : ''; },
  };
}
