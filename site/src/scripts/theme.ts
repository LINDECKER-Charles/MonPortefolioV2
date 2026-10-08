/**
 * Le mode nuit : un choix du lecteur, mémorisé. Sans choix, le site suit la
 * préférence du système, y compris quand elle change en cours de lecture.
 * /theme.js a déjà posé `data-theme` avant le premier rendu ; ici, on ne fait
 * que réagir au bouton.
 */
import { mesurer } from './mesure';

const CLE = 'cl-theme';
type Theme = 'jour' | 'nuit';

function lireChoix(): Theme | null {
  try {
    const valeur = window.localStorage.getItem(CLE);
    return valeur === 'jour' || valeur === 'nuit' ? valeur : null;
  } catch {
    return null;
  }
}

function memoriser(theme: Theme): void {
  try {
    window.localStorage.setItem(CLE, theme);
  } catch {
    // Stockage bloqué : le choix vaut pour cette page seulement.
  }
}

function poser(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme);
  for (const bouton of document.querySelectorAll<HTMLButtonElement>('[data-theme-bascule]')) {
    bouton.setAttribute('aria-pressed', String(theme === 'nuit'));
    bouton.title = theme === 'nuit' ? 'Passer en mode jour' : 'Passer en mode nuit';
  }
}

export function brancherTheme(): void {
  const racine = document.documentElement;
  const systeme = window.matchMedia('(prefers-color-scheme: dark)');
  const mouvementReduit = window.matchMedia('(prefers-reduced-motion: reduce)');
  let themeVise: Theme = racine.getAttribute('data-theme') === 'nuit' ? 'nuit' : 'jour';
  let transition: ViewTransition | undefined;
  let finCouleurs: ReturnType<typeof setTimeout> | undefined;
  let choixSession = false;

  // Le script synchrone a déjà choisi les couleurs : aucune animation à l’arrivée.
  poser(themeVise);

  function appliquer(theme: Theme): void {
    themeVise = theme;
    transition?.skipTransition();
    if (finCouleurs) clearTimeout(finCouleurs);

    if (mouvementReduit.matches) {
      racine.removeAttribute('data-transition-theme');
      poser(theme);
      return;
    }

    if (typeof document.startViewTransition === 'function') {
      racine.setAttribute('data-transition-theme', 'fondu');
      const nouvelleTransition = document.startViewTransition(() => poser(theme));
      transition = nouvelleTransition;
      // Un second geste peut interrompre le fondu précédent avant sa capture.
      void nouvelleTransition.ready.catch(() => {});
      void nouvelleTransition.finished.catch(() => {}).then(() => {
        if (transition === nouvelleTransition) {
          racine.removeAttribute('data-transition-theme');
          transition = undefined;
        }
      });
      return;
    }

    racine.setAttribute('data-transition-theme', 'couleurs');
    // Établir les couleurs actuelles avant de poser les nouvelles.
    void racine.offsetWidth;
    poser(theme);
    finCouleurs = setTimeout(() => racine.removeAttribute('data-transition-theme'), 420);
  }

  for (const bouton of document.querySelectorAll<HTMLButtonElement>('[data-theme-bascule]')) {
    bouton.addEventListener('click', () => {
      const suivant: Theme = themeVise === 'nuit' ? 'jour' : 'nuit';
      choixSession = true;
      appliquer(suivant);
      memoriser(suivant);
      mesurer('theme', { choix: suivant });
    });
  }

  systeme.addEventListener('change', (evenement) => {
    if (!choixSession && !lireChoix()) appliquer(evenement.matches ? 'nuit' : 'jour');
  });
}
