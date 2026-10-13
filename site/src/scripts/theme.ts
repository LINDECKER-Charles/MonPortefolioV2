/**
 * Le mode nuit : un choix du lecteur, mémorisé. Sans choix, le site suit la
 * préférence du système, y compris quand elle change en cours de lecture.
 * /theme.js a déjà posé `data-theme` avant le premier rendu ; ici, on ne fait
 * que réagir à la lanterne.
 *
 * La signature, « l’allumage » (styles/theme-transition.css) : vers la nuit,
 * l’obscurité gagne la page depuis les bords et se referme sur la lanterne
 * qu’on vient d’allumer ; vers le jour, la lumière part d’elle. View
 * Transitions et masque radial centré sur la bascule. Sans View Transitions,
 * les couleurs glissent ; en mouvement réduit, le thème change d’un coup.
 *
 * Une image générée a deux rendus, jour et nuit (components/ui/Visuel.astro),
 * et celui du thème masqué n’est pas téléchargé. Avant de basculer, le script
 * charge et décode le rendu visé des images proches de l’écran, 300 ms au
 * plus : la nouvelle vue capturée par la transition a déjà ses images. Il
 * s’y prend dès que la bascule devient probable (survol, focus, toucher de la
 * lanterne), pour que l’attente soit le plus souvent nulle.
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

/** La lanterne qu’on voit : celle qu’on vient de toucher, sinon la première bascule affichée. */
function lanterneVisible(origine?: Element): DOMRect | undefined {
  const candidates = [origine, ...document.querySelectorAll('[data-theme-bascule]')];
  for (const candidate of candidates) {
    const boite = candidate?.getBoundingClientRect();
    if (boite && boite.width > 0 && boite.height > 0 && boite.bottom > 0 && boite.top < window.innerHeight) return boite;
  }
  return undefined;
}

/** L’attente la plus longue avant de basculer, quand le rendu visé tarde. */
const ATTENTE_RENDUS = 300;

/**
 * Les images du rendu `theme` (jour ou nuit) des images générées à moins d’un
 * écran de la vue, hors des actes sombres, qui montrent la nuit dans les deux
 * thèmes. Un emplacement masqué (sans boîte) n’en a pas besoin.
 */
function rendusProches(theme: Theme): HTMLImageElement[] {
  const marge = window.innerHeight;
  return [...document.querySelectorAll<HTMLImageElement>(`figure.visuel--jour-nuit > picture.visuel__${theme} > img`)].filter((image) => {
    const figure = image.closest('figure')!;
    if (figure.closest('.acte-veille, .acte-bleu')) return false;
    const boite = figure.getBoundingClientRect();
    return boite.width > 0 && boite.bottom > -marge && boite.top < window.innerHeight + marge;
  });
}

/** Lance le chargement du rendu `theme` des images proches ; se résout quand elles sont décodées, ou au plus tard après ATTENTE_RENDUS. */
function prechauffer(theme: Theme): Promise<void> {
  const images = rendusProches(theme);
  if (!images.length) return Promise.resolve();
  for (const image of images) image.loading = 'eager';
  const decodees = Promise.all(images.map((image) => image.decode().catch(() => {})));
  return Promise.race([decodees.then(() => {}), new Promise<void>((fin) => setTimeout(fin, ATTENTE_RENDUS))]);
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

  function terminer(): void {
    racine.removeAttribute('data-transition-theme');
    racine.style.removeProperty('--vt-x');
    racine.style.removeProperty('--vt-y');
  }

  function appliquer(theme: Theme, origine?: Element): void {
    themeVise = theme;
    transition?.skipTransition();
    if (finCouleurs) clearTimeout(finCouleurs);
    const rendus = prechauffer(theme);

    if (mouvementReduit.matches) {
      terminer();
      void rendus.then(() => {
        if (themeVise === theme) poser(theme);
      });
      return;
    }

    if (typeof document.startViewTransition === 'function') {
      // Le centre du masque : la lanterne visible (celle qu’on vient de toucher,
      // sinon la bascule affichée de l’en-tête), à défaut le coin de l’en-tête.
      const boite = lanterneVisible(origine);
      if (boite) {
        racine.style.setProperty('--vt-x', `${Math.round(boite.left + boite.width / 2)}px`);
        racine.style.setProperty('--vt-y', `${Math.round(boite.top + boite.height / 2)}px`);
      }
      racine.setAttribute('data-transition-theme', theme === 'nuit' ? 'vers-nuit' : 'vers-jour');
      // La vue de départ est capturée tout de suite ; la nouvelle, une fois les rendus visés prêts.
      const nouvelleTransition = document.startViewTransition(async () => {
        await rendus;
        poser(themeVise);
      });
      transition = nouvelleTransition;
      // Un second geste peut interrompre la transition précédente avant sa capture.
      void nouvelleTransition.ready.catch(() => {});
      void nouvelleTransition.finished.catch(() => {}).then(() => {
        if (transition === nouvelleTransition) {
          terminer();
          transition = undefined;
        }
      });
      return;
    }

    void rendus.then(() => {
      if (themeVise !== theme) return;
      racine.setAttribute('data-transition-theme', 'couleurs');
      // Établir les couleurs actuelles avant de poser les nouvelles.
      void racine.offsetWidth;
      poser(theme);
      finCouleurs = setTimeout(terminer, 820);
    });
  }

  for (const bouton of document.querySelectorAll<HTMLButtonElement>('[data-theme-bascule]')) {
    // La bascule devient probable : le rendu de l’autre thème part sur le réseau.
    const anticiper = () => void prechauffer(themeVise === 'nuit' ? 'jour' : 'nuit');
    for (const evenement of ['pointerenter', 'focus', 'touchstart'] as const) bouton.addEventListener(evenement, anticiper, { passive: true });
    bouton.addEventListener('click', () => {
      const suivant: Theme = themeVise === 'nuit' ? 'jour' : 'nuit';
      choixSession = true;
      appliquer(suivant, bouton);
      memoriser(suivant);
      mesurer('theme', { choix: suivant });
    });
  }

  systeme.addEventListener('change', (evenement) => {
    if (!choixSession && !lireChoix()) appliquer(evenement.matches ? 'nuit' : 'jour');
  });
}
