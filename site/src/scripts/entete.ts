/**
 * En-tête : menus déroulants et barre de progression.
 *
 * Les menus sont des <details> (complets sans JavaScript). Ici : Échap
 * referme celui qui est ouvert et rend le focus à son bouton ; un clic
 * ailleurs ou sur un lien le referme ; en ouvrir un referme l’autre ; passer
 * en largeur d’ordinateur referme le menu mobile.
 *
 * Choisir une section dans le sommaire referme le menu et donne le focus au
 * titre atteint (tabindex="-1", sans défilement : l’ancre s’en charge, sous
 * l’en-tête grâce à scroll-padding-top). Un lecteur d’écran annonce ce
 * titre, et non le corps de la page.
 *
 * La barre de 2 px (visible sous 860 px) suit la part de la page déjà lue ;
 * le sommaire de l’en-tête marque la section en cours (scripts/sommaire.ts).
 */
import { brancherSommaire } from './sommaire';

/** Le titre de la section visée par une ancre (ou la section elle-même) reçoit le focus. */
function donnerLeFocus(ancre: string): void {
  let section: HTMLElement | null = null;
  try {
    section = document.getElementById(decodeURIComponent(ancre.slice(1)));
  } catch {
    return;
  }
  if (!section) return;
  const titre = section.matches('h1, h2, h3') ? section : (section.querySelector<HTMLElement>('h2, h3') ?? section);
  if (!titre.hasAttribute('tabindex')) titre.setAttribute('tabindex', '-1');
  titre.classList.add('cible-sommaire');
  titre.focus({ preventScroll: true });
}

export function brancherEntete(): void {
  if (document.querySelector('.entete [data-sommaire]')) brancherSommaire();

  const menus = [...document.querySelectorAll<HTMLDetailsElement>('details[data-deroulant]')];

  document.addEventListener('keydown', (evenement) => {
    if (evenement.key !== 'Escape') return;
    for (const menu of menus) {
      if (!menu.open) continue;
      menu.open = false;
      menu.querySelector('summary')?.focus();
    }
  });

  document.addEventListener('click', (evenement) => {
    const cible = evenement.target as Node;
    for (const menu of menus) {
      if (menu.open && !menu.contains(cible)) menu.open = false;
    }
  });

  for (const menu of menus) {
    menu.addEventListener('click', (evenement) => {
      const lien = (evenement.target as Element).closest('a');
      if (!lien) return;
      menu.open = false;
      // Après la navigation vers l’ancre, qui rend le focus au corps de page.
      if (lien.hash && lien.pathname === location.pathname) setTimeout(() => donnerLeFocus(lien.hash), 0);
    });
    menu.addEventListener('toggle', () => {
      if (!menu.open) return;
      for (const autre of menus) if (autre !== menu) autre.open = false;
    });
  }

  window.matchMedia('(min-width: 861px)').addEventListener('change', (evenement) => {
    if (!evenement.matches) return;
    for (const menu of document.querySelectorAll<HTMLDetailsElement>('details[data-menu-mobile]')) menu.open = false;
  });

  const barre = document.querySelector<HTMLElement>('[data-progression]');
  if (!barre) return;
  let prevu = false;
  const mettreAJour = () => {
    prevu = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    barre.style.setProperty('--progression', max > 0 ? Math.min(1, window.scrollY / max).toFixed(4) : '0');
  };
  window.addEventListener(
    'scroll',
    () => {
      if (prevu) return;
      prevu = true;
      window.requestAnimationFrame(mettreAJour);
    },
    { passive: true },
  );
  mettreAJour();
}
