/** Lecture facultative du rituel : son horloge ne pilote jamais l’authentification. */
import { brancherSonCinema } from './connexion-cinema-son';
// Les styles du film : un fichier à part, posé à la première ouverture, hors du
// budget de la page (Astro inline dans la page toute feuille importée par un script).
import feuilleCinema from '../styles/connexion-cinema.css?url';
export type CinemaPlan = 'invocation' | 'signes' | 'regard' | 'revelation' | 'duel' | 'adaptation' | 'expansion' | 'silence' | 'final';
export type CinemaEtat = 'closed' | 'loading' | 'playing' | 'paused' | 'final';
type Cinema = { ouvrir: (bouton: HTMLElement) => void; fermer: () => void; detruire: () => void };
const plans = [
  ['invocation', 'Invocation'], ['signes', 'Les dix ombres'], ['regard', 'Le regard'],
  ['revelation', 'Le général divin'], ['duel', 'Le duel'], ['adaptation', 'L’adaptation'],
  ['expansion', 'Extension du territoire'], ['silence', 'Le silence'],
  ['final', 'À vous d’entrer'],
] as const;

/** Pose la feuille du film ; la cinématique attend son chargement (connexion-sanctuaire.ts ne l’appelle qu’une fois par succès). */
export const chargerStylesCinema = () => new Promise<void>((resolve, reject) => {
  const lien = Object.assign(document.createElement('link'), { rel: 'stylesheet', href: feuilleCinema });
  lien.onload = () => resolve();
  lien.onerror = () => { lien.remove(); reject(new Error('Feuille de la cinématique indisponible.')); };
  document.head.append(lien);
});

export function brancherCinema(scene: HTMLElement, reduction: MediaQueryList, actualiserMouvement: () => void): Cinema | undefined {
  const dialog = document.querySelector<HTMLDialogElement>('#bo-cinema');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  const stage = dialog.querySelector<HTMLElement>('[data-cinema-stage]');
  const progression = dialog.querySelector<HTMLElement>('[data-cinema-progress]');
  const chapitre = dialog.querySelector<HTMLElement>('[data-cinema-chapter]');
  const fermerBouton = dialog.querySelector<HTMLButtonElement>('#bo-cinema-close');
  const pause = dialog.querySelector<HTMLButtonElement>('#bo-cinema-pause');
  const rejouer = dialog.querySelector<HTMLButtonElement>('#bo-cinema-replay');
  const entrer = dialog.querySelector<HTMLButtonElement>('#bo-cinema-enter');
  const ouvertures = scene.querySelectorAll<HTMLButtonElement>('[data-cinema-open]');
  const chapitres = [...dialog.querySelectorAll<HTMLButtonElement>('[data-cinema-seek]')];
  const son = dialog.querySelector<HTMLButtonElement>('#bo-cinema-sound')!;
  const pleinEcran = dialog.querySelector<HTMLButtonElement>('#bo-cinema-fullscreen')!;
  if (!stage || !progression || !chapitre || !fermerBouton || !pause || !rejouer || !entrer) return;
  const partition = brancherSonCinema(dialog, reduction, (attente) => {
    sonEnChargement = attente;
    synchroniser();
  });
  const evenements = new AbortController();
  const ecoute = { signal: evenements.signal };
  let ouvert = false;
  let pauseDemandee = false;
  let sonEnChargement = false;
  let cadre = 0;
  let dernierTemps = 0;
  let tempsLu = 0;
  let durees: number[] = [];
  let dureeTotale = 0;
  let planCourant: CinemaPlan | undefined;
  let etat: CinemaEtat = 'closed';
  let ouvreur: HTMLElement | null = null;
  let ouverture = 0;
  let pleinEcranDemande = false;

  function changerEtat(suivant: CinemaEtat): void {
    dialog!.dataset.cinemaState = suivant;
    if (etat === suivant) return;
    etat = suivant;
    actualiserMouvement();
  }

  function annulerCadre(): void {
    cancelAnimationFrame(cadre);
    cadre = 0;
  }

  function memoriserTemps(maintenant = performance.now()): void {
    if (etat === 'playing') tempsLu = Math.min(dureeTotale, tempsLu + Math.max(0, maintenant - dernierTemps));
    dernierTemps = maintenant;
  }

  function rendre(saut = false): void {
    if (reduction.matches) tempsLu = dureeTotale;
    const fini = reduction.matches || tempsLu >= dureeTotale;
    const focusPause = document.activeElement === pause;
    let index = 0;
    let finPlan = durees[0] ?? 0;
    while (index < durees.length && tempsLu >= finPlan) finPlan += durees[++index] ?? 0;
    if (fini) index = plans.length - 1;
    const [plan, libelle] = plans[index];
    changerEtat(document.hidden || (!fini && (pauseDemandee || sonEnChargement)) ? 'paused' : fini ? 'final' : 'playing');
    pause!.hidden = fini;
    pause!.disabled = fini || sonEnChargement;
    pause!.textContent = pauseDemandee ? 'Reprendre la lecture' : 'Mettre en pause';
    pause!.setAttribute('aria-pressed', String(pauseDemandee));
    progression!.style.setProperty('--cinema-progression', String(fini ? 1 : tempsLu / dureeTotale));
    if (plan !== planCourant) {
      planCourant = plan;
      stage!.dataset.shot = plan;
      chapitre!.textContent = libelle;
      chapitres.forEach((bouton) => bouton.setAttribute('aria-current', bouton.dataset.cinemaSeek === plan ? 'step' : 'false'));
    }
    partition.positionner(tempsLu / 1000, etat, saut);
    if (fini && focusPause) entrer!.focus({ preventScroll: true });
  }

  function avancer(maintenant: number): void {
    cadre = 0;
    if (!ouvert || !dialog!.open) return;
    memoriserTemps(maintenant);
    rendre();
    if (etat === 'playing') cadre = requestAnimationFrame(avancer);
  }

  function synchroniser(saut = false): void {
    if (!ouvert || etat === 'loading') return;
    memoriserTemps();
    annulerCadre();
    rendre(saut);
    if (etat === 'playing') cadre = requestAnimationFrame(avancer);
  }

  function commencer(): void {
    annulerCadre();
    son.disabled = false;
    chapitres.forEach((bouton) => { bouton.disabled = false; });
    const style = getComputedStyle(dialog!);
    // La minification CSS peut convertir les millisecondes des jetons en secondes.
    durees = plans.slice(0, -1).map(([plan]) => {
      const valeur = style.getPropertyValue(`--jjk-cine-${plan}`).trim();
      return Math.max(0, Number.parseFloat(valeur) * (valeur.endsWith('ms') ? 1 : 1000) || 0);
    });
    dureeTotale = durees.reduce((somme, duree) => somme + duree, 0);
    tempsLu = 0;
    dernierTemps = performance.now();
    pauseDemandee = false;
    planCourant = undefined;
    rendre(true);
    if (etat === 'playing') cadre = requestAnimationFrame(avancer);
  }

  function terminer(): void {
    if (!ouvert) return;
    ouvert = false;
    ouverture += 1;
    annulerCadre();
    changerEtat('closed');
    partition.arreter();
    if (pleinEcranDemande && document.fullscreenElement) void document.exitFullscreen().catch(() => {});
  }

  function fermer(cible: HTMLElement | null = ouvreur): void {
    if (!ouvert) return;
    dialog!.close();
    terminer();
    if (cible?.isConnected && cible.checkVisibility()) cible.focus({ preventScroll: true });
    ouvreur = null;
  }

  async function ouvrir(bouton: HTMLElement): Promise<void> {
    if (ouvert || scene.hidden) return;
    ouvreur = bouton;
    dialog!.dataset.technique = scene.dataset.technique ?? 'ombres';
    ouvert = true;
    const ticket = ++ouverture;
    dialog!.showModal();
    stage!.dataset.shot = 'invocation';
    changerEtat('loading');
    partition.positionner(0, 'loading');
    pause!.disabled = true;
    son.disabled = true;
    chapitres.forEach((bouton) => { bouton.disabled = true; });
    // Le montage démarre une fois ses plans décodés, y compris ceux encore masqués.
    const images = [...dialog!.querySelectorAll<HTMLImageElement>(reduction.matches ? '.jjk-film__decor img, .jjk-film__personnage img' : 'img')];
    images.forEach((image) => { image.loading = 'eager'; });
    fermerBouton!.focus({ preventScroll: true });
    if (reduction.matches) { commencer(); return; }
    await Promise.allSettled(images.map((image) => image.decode()));
    if (ouvert && ticket === ouverture) commencer();
  }
  chapitres.forEach((bouton, index) => bouton.addEventListener('click', () => {
    tempsLu = durees.slice(0, index).reduce((somme, duree) => somme + duree, 0);
    dernierTemps = performance.now();
    pauseDemandee = false;
    synchroniser(true);
    stage!.getAnimations({ subtree: true }).forEach((animation) => { animation.currentTime = 0; });
  }, ecoute));
  pleinEcran.hidden = !document.fullscreenEnabled;
  pleinEcran.addEventListener('click', () => {
    pleinEcranDemande = !document.fullscreenElement;
    void (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen()).catch(() => {});
  }, ecoute);
  document.addEventListener('fullscreenchange', () => {
    const actif = Boolean(document.fullscreenElement);
    pleinEcran.setAttribute('aria-pressed', String(actif));
    pleinEcran.setAttribute('aria-label', actif ? 'Quitter le plein écran' : 'Passer en plein écran');
  }, ecoute);
  fermerBouton.addEventListener('click', () => fermer(), ecoute);
  entrer.addEventListener('click', () => {
    const email = document.getElementById('bo-login-email');
    fermer(email);
    email?.scrollIntoView({ block: 'center', behavior: 'instant' });
  }, ecoute);
  pause.addEventListener('click', () => {
    memoriserTemps();
    pauseDemandee = !pauseDemandee;
    synchroniser();
  }, ecoute);
  rejouer.addEventListener('click', () => {
    commencer();
    (reduction.matches || dureeTotale === 0 ? entrer : pause).focus({ preventScroll: true });
  }, ecoute);
  // Escape et le confinement du focus restent ceux du dialog natif.
  dialog.addEventListener('close', () => { if (!dialog.open) terminer(); }, ecoute);
  document.addEventListener('visibilitychange', () => synchroniser(), ecoute);
  reduction.addEventListener('change', () => {
    const cible = document.activeElement;
    if (reduction.matches) tempsLu = dureeTotale;
    synchroniser();
    if (ouvert && reduction.matches && cible instanceof HTMLElement && !cible.checkVisibility()) entrer.focus({ preventScroll: true });
  }, ecoute);
  const visibilite = new MutationObserver(() => { if (scene.hidden) fermer(null); });
  visibilite.observe(scene, { attributes: true, attributeFilter: ['hidden'] });
  const controle: Cinema = {
    ouvrir,
    fermer: () => fermer(),
    detruire: () => {
      fermer(null);
      annulerCadre();
      evenements.abort();
      visibilite.disconnect();
      ouvertures.forEach((bouton) => { bouton.disabled = true; });
    },
  };
  window.addEventListener('pagehide', (event) => {
    if (event.persisted) fermer(null);
    else controle.detruire();
  }, ecoute);
  return controle;
}
