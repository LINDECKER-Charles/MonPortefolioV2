/**
 * En-tête : menus déroulants et barre de progression.
 *
 * Les menus sont des <details> (complets sans JavaScript). Ici : Échap
 * referme celui qui est ouvert et rend le focus à son bouton ; un clic
 * ailleurs ou sur un lien le referme ; en ouvrir un referme l’autre ; passer
 * en largeur d’ordinateur referme le menu mobile.
 *
 * La barre de 2 px (visible sous 860 px) suit la part de la page déjà lue ;
 * le sommaire de l’en-tête marque la section en cours (scripts/sommaire.ts).
 */
import { brancherSommaire } from './sommaire';

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
      if ((evenement.target as Element).closest('a')) menu.open = false;
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
