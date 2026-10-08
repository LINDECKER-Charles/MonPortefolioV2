/**
 * Les bulles du glossaire : placées sous leur mot (au-dessus s'il n'y a pas la
 * place), gardées dans l'écran. Au défilement, la bulle suit son mot ; elle ne
 * se ferme que quand le mot sort de l'écran. Une bulle figée pendant que le
 * texte défile perdrait son mot ; une bulle qui se fermerait au moindre
 * défilement disparaîtrait sous le doigt, au moindre élan d'un écran tactile.
 */
import { mesurer } from './mesure';

const MARGE = 12;
const ECART = 8;

function placer(bulle: HTMLElement, mot: HTMLElement): void {
  const rect = mot.getBoundingClientRect();
  const largeur = bulle.offsetWidth;
  const hauteur = bulle.offsetHeight;
  const gauche = Math.min(Math.max(MARGE, rect.left), window.innerWidth - MARGE - largeur);
  let haut = rect.bottom + ECART;
  if (haut + hauteur > window.innerHeight - MARGE && rect.top - ECART - hauteur > MARGE) {
    haut = rect.top - ECART - hauteur;
  }
  bulle.style.left = `${Math.max(MARGE, gauche)}px`;
  bulle.style.top = `${haut}px`;
}

function horsEcran(mot: HTMLElement): boolean {
  const rect = mot.getBoundingClientRect();
  return rect.bottom < 0 || rect.top > window.innerHeight;
}

export function brancherGlossaire(): void {
  const paires = [...document.querySelectorAll<HTMLElement>('.terme__bulle[popover]')]
    .map((bulle) => ({ bulle, mot: document.querySelector<HTMLElement>(`[popovertarget="${bulle.id}"]`) }))
    .filter((paire): paire is { bulle: HTMLElement; mot: HTMLElement } => paire.mot !== null);
  if (!paires.length || !('showPopover' in HTMLElement.prototype)) return;

  for (const { bulle, mot } of paires) {
    bulle.addEventListener('toggle', (evenement) => {
      const ouvert = (evenement as ToggleEvent).newState === 'open';
      mot.setAttribute('aria-expanded', String(ouvert));
      if (!ouvert) return;
      placer(bulle, mot);
      mesurer('glossaire', { terme: mot.dataset.terme ?? '' });
    });
  }

  let enAttente = false;
  const suivre = () => {
    enAttente = false;
    for (const { bulle, mot } of paires) {
      if (!bulle.matches(':popover-open')) continue;
      if (horsEcran(mot)) bulle.hidePopover();
      else placer(bulle, mot);
    }
  };
  const planifier = () => {
    if (enAttente) return;
    enAttente = true;
    window.requestAnimationFrame(suivre);
  };
  window.addEventListener('scroll', planifier, { passive: true });
  window.addEventListener('resize', planifier);
}
