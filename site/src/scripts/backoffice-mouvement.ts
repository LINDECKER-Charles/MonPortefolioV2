/**
 * Le mouvement de l’entrée du backoffice (scripts/backoffice-entree.ts).
 *
 * Il s’écrit comme un générique de film : les instants et les durées en
 * millisecondes, à vitesse normale, passés par t(), qui suit --d-scene ; les
 * courbes viennent de jetons.css. Tout passe par Web Animations, rangées en
 * séquences qu’on annule ensemble : l’état final est l’état par défaut du
 * CSS (styles/backoffice-entree.css), abréger, c’est annuler.
 *
 * Gestes communs : apparaître, poser une carte sur un ressort, faire couler la
 * lumière le long de ses bords, faire arriver ses champs un à un ; et les
 * titres, lettre à lettre : un calque de lettres posé exactement sur le texte
 * (crénage compris), jamais lu par les lecteurs d’écran (`aria-hidden`), le
 * vrai texte rendu transparent le temps de l’animation.
 */
const racine = document.documentElement;
const mouvementReduit = window.matchMedia('(prefers-reduced-motion: reduce)');

/** La mise en page à une colonne (styles/backoffice-entree.css). */
export const etroit = window.matchMedia('(max-width: 860px)');

/** Le mouvement est réduit (préférence du système, lue à chaque geste). */
export function reduit(): boolean {
  return mouvementReduit.matches;
}

/** La valeur calculée d’un jeton CSS. */
export function jeton(nom: string, element: Element = racine): string {
  return getComputedStyle(element).getPropertyValue(nom).trim();
}

/** Une durée CSS en millisecondes : « 400ms », ou « .4s » une fois la feuille minifiée. */
function enMillisecondes(duree: string): number {
  const nombre = Number.parseFloat(duree);
  return /\ds$/.test(duree) ? nombre * 1000 : nombre;
}

const ECHELLE = (enMillisecondes(jeton('--d-scene')) || 400) / 400;

/** Un instant ou une durée de la chorégraphie, écrit à vitesse normale (--d-scene à 400 ms). */
export function t(ms: number): number {
  return ms * ECHELLE;
}

export function attendre(ms: number): Promise<void> {
  return new Promise((fin) => { window.setTimeout(fin, ms); });
}

/** Relance une animation CSS portée par un attribut. */
export function rejouer(element: HTMLElement, attribut: string, valeur = ''): void {
  element.removeAttribute(attribut);
  void element.offsetWidth;
  element.setAttribute(attribut, valeur);
}

const EXPO = jeton('--courbe-expo') || 'ease-out';

/** Les courbes de jetons.css ; sans `linear()`, le ressort devient une sortie exponentielle. */
export const COURBES = {
  courbe: jeton('--courbe') || 'ease',
  expo: EXPO,
  entree: jeton('--courbe-entree') || 'ease-in',
  ressort: CSS.supports('animation-timing-function', 'linear(0, 1)') ? jeton('--courbe-ressort') || EXPO : EXPO,
} as const;

/** Des animations et des rendez-vous qu’on annule ensemble. */
export interface Sequence {
  animer(element: Element | null | undefined, images: Keyframe[], options: KeyframeAnimationOptions): Animation | undefined;
  plusTard(ms: number, action: () => void): void;
  annuler(): void;
}

export function sequence(): Sequence {
  let animations: Animation[] = [];
  let minuteries: number[] = [];
  return {
    animer(element, images, options) {
      if (!element) return undefined;
      const animation = element.animate(images, options);
      animations.push(animation);
      return animation;
    },
    plusTard(ms, action) {
      minuteries.push(window.setTimeout(action, ms));
    },
    annuler() {
      for (const minuterie of minuteries) window.clearTimeout(minuterie);
      for (const animation of animations) animation.cancel();
      animations = [];
      minuteries = [];
    },
  };
}

/* ===== Gestes communs ===== */

/** Un élément apparaît en montant de `montee` pixels. */
export function apparaitre(seq: Sequence, element: Element | null | undefined, depart: number, duree: number, montee = 0, remplissage: FillMode = 'backwards'): void {
  seq.animer(element, [
    { opacity: 0, transform: `translateY(${montee}px)` },
    { opacity: 1, transform: 'none' },
  ], { duration: t(duree), delay: t(depart), easing: COURBES.expo, fill: remplissage });
}

/** La carte se pose : elle sort du flou et se dépose sur un ressort. */
export function poserCarte(seq: Sequence, carte: Element, depart: number, remplissage: FillMode = 'backwards'): void {
  seq.animer(carte, [
    { opacity: 0, transform: 'translateY(48px) scale(0.96)', filter: 'blur(10px)' },
    { opacity: 1, transform: 'none', filter: 'blur(0px)' },
  ], { duration: t(1100), delay: t(depart), easing: COURBES.ressort, fill: remplissage });
}

/** La lumière coule du haut de la carte le long de ses deux bords et se rejoint en bas. */
export function tracerCarte(seq: Sequence, carte: Element, depart: number): void {
  seq.animer(carte.querySelector('.bo-entree__trace'), [
    { '--trace': '0deg', opacity: 1 },
    { '--trace': '180deg', opacity: 1, offset: 0.7 },
    { '--trace': '180deg', opacity: 0 },
  ], { duration: t(1300), delay: t(depart), easing: COURBES.courbe, fill: 'backwards' });
}

/** Les champs de la carte arrivent un à un. */
export function animerChamps(seq: Sequence, carte: Element, depart: number, remplissage: FillMode = 'backwards'): void {
  const elements = carte.querySelectorAll(':scope > .bo-enrollment:not([hidden]), .bo-entree__formulaire fieldset > :not(legend), :scope > .bo-recovery-codes, :scope > .bo-actions');
  elements.forEach((element, rang) => {
    seq.animer(element, [
      { opacity: 0, transform: 'translateY(14px)' },
      { opacity: 1, transform: 'none' },
    ], { duration: t(700), delay: t(depart + rang * 80), easing: COURBES.expo, fill: remplissage });
  });
}

/* ===== Les titres, lettre à lettre ===== */
const CALQUE = 'bo-titre-lettres';

/** Le vrai texte revient : le calque de lettres s’en va, sans toucher au mouvement du titre. */
export function rendreTexte(titre: HTMLElement): void {
  titre.querySelector(`.${CALQUE}`)?.remove();
  titre.classList.remove('bo-titre--decoupe');
}

/** Le titre redevient lui-même : texte rendu, centre du mouvement oublié. */
export function nettoyerTitre(titre: HTMLElement): void {
  rendreTexte(titre);
  titre.style.removeProperty('transform-origin');
}

interface Decoupe {
  lettres: HTMLSpanElement[];
  etendue: { gauche: number; haut: number; droite: number; bas: number };
  boite: DOMRect;
}

/** Pose sur le titre un calque de lettres, chacune à sa place exacte (mesurée par Range). */
function decouper(titre: HTMLElement): Decoupe | undefined {
  nettoyerTitre(titre);
  const noeud = [...titre.childNodes].find((enfant): enfant is Text => enfant.nodeType === Node.TEXT_NODE && Boolean(enfant.textContent?.trim()));
  if (!noeud) return undefined;
  const boite = titre.getBoundingClientRect();
  const calque = document.createElement('span');
  calque.className = CALQUE;
  calque.setAttribute('aria-hidden', 'true');
  const plage = document.createRange();
  const texte = noeud.data;
  const lettres: HTMLSpanElement[] = [];
  const etendue = { gauche: Infinity, haut: Infinity, droite: -Infinity, bas: -Infinity };
  for (let rang = 0; rang < texte.length; rang += 1) {
    if (/\s/.test(texte.charAt(rang))) continue;
    plage.setStart(noeud, rang);
    plage.setEnd(noeud, rang + 1);
    const r = plage.getBoundingClientRect();
    if (!r.width) continue;
    const lettre = document.createElement('span');
    lettre.className = `${CALQUE}__lettre`;
    lettre.textContent = texte.charAt(rang);
    lettre.style.left = `${(r.left - boite.left).toFixed(2)}px`;
    lettre.style.top = `${(r.top - boite.top).toFixed(2)}px`;
    lettre.style.lineHeight = `${r.height.toFixed(2)}px`;
    calque.append(lettre);
    lettres.push(lettre);
    etendue.gauche = Math.min(etendue.gauche, r.left);
    etendue.haut = Math.min(etendue.haut, r.top);
    etendue.droite = Math.max(etendue.droite, r.right);
    etendue.bas = Math.max(etendue.bas, r.bottom);
  }
  titre.append(calque);
  titre.classList.add('bo-titre--decoupe');
  return { lettres, etendue, boite };
}

function couleurs(titre: HTMLElement): { finale: string; eclairee: string; lueur: string } {
  return { finale: getComputedStyle(titre).color, eclairee: jeton('--titre-eclaire', titre), lueur: jeton('--titre-lueur', titre) };
}

/** À la fin (ou à l’annulation) des lettres, le titre redevient lui-même. */
function rendreApres(animations: (Animation | undefined)[], titre: HTMLElement): void {
  const fin = () => nettoyerTitre(titre);
  void Promise.all(animations.map((animation) => animation?.finished)).then(fin, fin);
}

/** Les lettres montent de leur ligne, une à une, et la lumière les traverse. */
export function monter(seq: Sequence, titre: HTMLElement | null, depart: number): void {
  if (!titre || reduit()) return;
  const c = couleurs(titre);
  const d = decouper(titre);
  if (!d) return;
  rendreApres(d.lettres.map((lettre, rang) => seq.animer(lettre, [
    { opacity: 0, transform: 'translateY(0.42em) rotate(5deg)', filter: 'blur(6px)', color: c.eclairee, textShadow: `0 0 0.35em ${c.lueur}` },
    { opacity: 1, transform: 'none', filter: 'blur(0px)', color: c.eclairee, textShadow: `0 0 0.35em ${c.lueur}`, offset: 0.5 },
    { opacity: 1, transform: 'none', filter: 'blur(0px)', color: c.finale, textShadow: '0 0 0 transparent' },
  ], { duration: t(1000), delay: t(depart + rang * 24), easing: COURBES.expo, fill: 'backwards' })), titre);
}

/** Les temps du carton-titre du générique. */
export interface TempsCarton {
  apparition: number;
  lumiere: number;
  aube: number;
  glisse: number;
  duree: number;
}

/**
 * Le carton-titre du générique : le titre, seul au centre dans le noir, les
 * lettres qui se resserrent ; la flamme prend et sa lumière les traverse de
 * droite à gauche ; à l’aube, elles reprennent leur encre et le titre glisse
 * à sa place pendant que la caméra recule.
 */
export function carton(seq: Sequence, titre: HTMLElement, temps: TempsCarton): void {
  const c = couleurs(titre);
  const sombre = jeton('--lune');
  const eclairee = jeton('--lanterne-survol');
  const lueur = jeton('--lanterne-eclat');
  const d = decouper(titre);
  if (!d) return;
  const { etendue: e, boite } = d;
  const ex = (e.gauche + e.droite) / 2;
  const ey = (e.haut + e.bas) / 2;
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight * (etroit.matches ? 0.6 : 0.62);
  const echelle = etroit.matches ? 1.08 : 1.06;
  titre.style.transformOrigin = `${(ex - boite.left).toFixed(1)}px ${(ey - boite.top).toFixed(1)}px`;
  seq.animer(titre, [
    { transform: `translate(${(cx - ex).toFixed(1)}px, ${(cy - ey).toFixed(1)}px) scale(${echelle})` },
    { transform: 'none' },
  ], { duration: t(temps.duree), delay: t(temps.glisse), easing: COURBES.expo, fill: 'both' });
  const n = d.lettres.length;
  d.lettres.forEach((lettre, rang) => {
    const ecart = ((rang - (n - 1) / 2) * 0.1).toFixed(3);
    seq.animer(lettre, [
      { opacity: 0, transform: `translateX(${ecart}em) translateY(0.25em)`, filter: 'blur(8px)', color: sombre },
      { opacity: 0.45, transform: 'none', filter: 'blur(0px)', color: sombre },
    ], { duration: t(1100), delay: t(temps.apparition + rang * 34), easing: COURBES.expo, fill: 'both' });
    seq.animer(lettre, [
      { opacity: 0.45, color: sombre, textShadow: '0 0 0 transparent' },
      { opacity: 1, color: eclairee, textShadow: `0 0 0.4em ${lueur}` },
    ], { duration: t(600), delay: t(temps.lumiere + (n - 1 - rang) * 26), easing: COURBES.courbe, fill: 'forwards' });
    seq.animer(lettre, [
      { opacity: 1, color: eclairee, textShadow: `0 0 0.4em ${lueur}` },
      { opacity: 1, color: c.finale, textShadow: '0 0 0 transparent' },
    ], { duration: t(1200), delay: t(temps.aube + rang * 12), easing: COURBES.courbe, fill: 'forwards' });
  });
}
