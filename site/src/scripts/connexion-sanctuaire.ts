/**
 * Mise en scène de l’entrée JJK, indépendante de son autorisation. Chargée par
 * connexion-jjk.ts seulement en mode JJK (`data-entree-jjk` sur <html>).
 * Les attributs hidden / data-busy / data-state du backoffice restent l’autorité.
 * Aucun appel réseau, aucune copie ni conservation des identifiants : seuls le
 * focus et les étapes réelles commandent la roue. Le succès ne retarde jamais
 * l’ouverture de l’atelier. Pause, onglet masqué, hors écran, mouvement réduit
 * et retour à la lanterne suspendent les animations et le suivi du pointeur.
 * Afficher le mot de passe et l’avertissement des majuscules sont ceux de
 * l’entrée, communs aux deux habits (backoffice-saisie.ts).
 */
import { brancherTerritoire } from './connexion-territoire';

export function brancherSanctuaire(): void {
  const scene = document.querySelector<HTMLElement>('[data-sanctuaire]');
  if (!scene || scene.dataset.initialise) return;
  scene.dataset.initialise = 'true';
  const trouver = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
  const login = trouver<HTMLElement>('bo-login');
  const verification = trouver<HTMLElement>('bo-two-factor');
  const secours = trouver<HTMLElement>('bo-recovery');
  const workspace = trouver<HTMLElement>('bo-workspace');
  const motDePasse = trouver<HTMLInputElement>('bo-password');
  const email = trouver<HTMLInputElement>('bo-login-email');
  const pause = trouver<HTMLButtonElement>('bo-motion-toggle');
  const rejouer = trouver<HTMLButtonElement>('bo-wheel-replay');
  const numero = scene.querySelector<HTMLElement>('[data-auth-number]')!;
  const legende = scene.querySelector<HTMLElement>('[data-wheel-caption]')!;
  const surface = scene.querySelector<HTMLElement>('[data-wheel-surface]')!;
  const passage = document.querySelector<HTMLElement>('.sanctuaire-passage')!;
  const racine = document.documentElement;
  const jjk = () => racine.hasAttribute('data-entree-jjk');
  const reduction = matchMedia('(prefers-reduced-motion: reduce)');
  const pointeurFin = matchMedia('(pointer: fine)');
  const formulaires = [trouver<HTMLFormElement>('bo-login-form'), trouver<HTMLFormElement>('bo-two-factor-form')];
  const retours = [trouver<HTMLElement>('bo-login-retour'), trouver<HTMLElement>('bo-two-factor-retour')];
  let pauseDemandee = false;
  let dansEcran = true;
  let roueVisible = true;
  let etaitConnecte = false;
  let tentative = false;
  let erreurRetouchee = false;
  let angle = 0;
  let cadre = 0;
  let impactCadre = 0;
  const territoire = brancherTerritoire(scene, reduction, () => tourner(true));
  const cinema = document.querySelector<HTMLDialogElement>('#bo-cinema')!;
  const retourCinema = trouver<HTMLElement>('bo-cinema-retour');
  let preparationCinema: Promise<ReturnType<typeof import('./connexion-cinema').brancherCinema> | void> | undefined;
  for (const bouton of scene.querySelectorAll<HTMLButtonElement>('[data-cinema-open]')) {
    bouton.disabled = false;
    bouton.addEventListener('click', async () => {
      retourCinema.hidden = true;
      bouton.setAttribute('aria-busy', 'true');
      preparationCinema ??= import('./connexion-cinema').then(async (module) => { await module.chargerStylesCinema(); return module.brancherCinema(scene, reduction, mouvement); })
        .catch(() => { preparationCinema = undefined; });
      const controle = await preparationCinema;
      bouton.setAttribute('aria-busy', 'false');
      if (controle) controle.ouvrir(bouton);
      else {
        retourCinema.textContent = 'Impossible de charger la cinématique. Réessayez.';
        retourCinema.hidden = false;
      }
    });
  }

  const legendes: Record<string, string> = {
    idle: 'L’adaptation commence.',
    identity: 'Premier sceau.',
    password: 'Votre clé.',
    verifying: 'Adaptation en cours…',
    challenge: 'Confirmez votre accès.',
    error: 'La barrière résiste.',
    success: 'Territoire ouvert.',
  };

  function recentrer(): void {
    cancelAnimationFrame(cadre);
    cadre = 0;
    surface.style.removeProperty('--regard-x');
    surface.style.removeProperty('--regard-y');
  }
  function mouvement(): void {
    const arrete = pauseDemandee || reduction.matches || document.hidden || !dansEcran || Boolean(scene!.hidden) || cinema.open || !jjk();
    scene!.dataset.motion = arrete ? 'paused' : 'active';
    surface.dataset.wheelMotion = arrete || !roueVisible ? 'paused' : 'active';
    pause.setAttribute('aria-pressed', String(pauseDemandee || reduction.matches));
    pause.setAttribute('aria-label', pauseDemandee ? 'Reprendre les animations' : 'Mettre les animations en pause');
    pause.hidden = reduction.matches;
    rejouer.disabled = arrete;
    if (arrete) {
      recentrer();
      cancelAnimationFrame(impactCadre);
      delete scene!.dataset.impact;
      if (reduction.matches || document.hidden || pauseDemandee) passage.hidden = true;
    }
    if (!roueVisible) recentrer();
    // Le son bref de succès accompagne le passage extérieur au sanctuaire :
    // masquer celui-ci ne doit pas couper la note, contrairement à une pause.
    territoire.synchroniser(pauseDemandee || reduction.matches || document.hidden || cinema.open || !jjk() || (!dansEcran && !scene!.hidden));
  }
  function tourner(onde = false): void {
    if (scene!.dataset.motion !== 'active') return;
    angle += 45;
    scene!.style.setProperty('--roue-angle', `${angle}deg`);
    if (onde) {
      delete scene!.dataset.impact;
      cancelAnimationFrame(impactCadre);
      impactCadre = requestAnimationFrame(() => {
        // Une seule onde, même si plusieurs clics arrivent avant le rendu.
        if (scene!.dataset.motion === 'active') scene!.dataset.impact = 'true';
      });
    }
  }
  function phase(nom: string): void {
    if (scene!.dataset.phase === nom) return;
    scene!.dataset.phase = nom;
    legende.textContent = legendes[nom];
    if (nom !== 'idle') tourner(nom === 'challenge' || nom === 'error');
  }
  function synchroniser(): void {
    const connecte = !workspace.hidden;
    const retour = etaitConnecte && !connecte;
    const ouverture = connecte && !etaitConnecte && tentative;
    scene!.hidden = connecte;
    numero.textContent = !secours.hidden ? '03 / 03' : !verification.hidden ? '02 / 03' : '01 / 03';
    if (connecte || !secours.hidden) phase('success');
    else if (formulaires.some((form) => !form.closest('[hidden]') && form.dataset.busy === 'true')) phase('verifying');
    else if (!erreurRetouchee && retours.some((retour) => !retour.closest('[hidden]') && retour.dataset.state === 'error')) phase('error');
    else if (!verification.hidden) phase('challenge');
    else if (document.activeElement === motDePasse) phase('password');
    else if (document.activeElement === email) phase('identity');
    else phase('idle');
    mouvement();
    if (ouverture && jjk() && !reduction.matches && !pauseDemandee && !document.hidden) {
      passage.hidden = false;
      territoire.reussir(passage);
    }
    if (connecte) tentative = false;
    etaitConnecte = connecte;
    // Le moteur focalise le champ avant que l’observateur ait dévoilé son
    // nouveau parent. À la déconnexion, restaurer ce même focus après lui.
    if (retour && !login.hidden) email.focus();
  }

  pause.addEventListener('click', () => { pauseDemandee = !pauseDemandee; mouvement(); });
  rejouer.addEventListener('click', () => tourner(true));
  scene.addEventListener('animationend', (event) => {
    if (event.animationName === 'sanctuaire-onde') delete scene.dataset.impact;
  });
  passage.addEventListener('animationend', () => { passage.hidden = true; });

  for (const formulaire of formulaires) {
    formulaire.addEventListener('submit', () => { tentative = true; erreurRetouchee = false; });
    formulaire.addEventListener('input', () => { erreurRetouchee = true; synchroniser(); });
    formulaire.addEventListener('focusin', (event) => {
      if (event.target instanceof HTMLInputElement) synchroniser();
    });
  }

  const observer = new MutationObserver((mutations) => {
    if (mutations.some((mutation) => retours.some((retour) => retour === mutation.target || retour.contains(mutation.target)))) erreurRetouchee = false;
    synchroniser();
  });
  for (const section of [login, verification, secours, workspace]) observer.observe(section, { attributes: true, attributeFilter: ['hidden'] });
  for (const formulaire of formulaires) observer.observe(formulaire, { attributes: true, attributeFilter: ['data-busy'] });
  for (const retour of retours) observer.observe(retour, { attributes: true, attributeFilter: ['data-state'], childList: true, subtree: true });

  surface.addEventListener('pointermove', (event) => {
    if (scene.dataset.motion !== 'active' || !pointeurFin.matches || event.pointerType === 'touch' || cadre) return;
    const { clientX, clientY } = event;
    cadre = requestAnimationFrame(() => {
      cadre = 0;
      if (scene.dataset.motion !== 'active') return;
      const rect = surface.getBoundingClientRect();
      surface.style.setProperty('--regard-x', `${((clientX - rect.left) / rect.width - .5) * 10}deg`);
      surface.style.setProperty('--regard-y', `${((clientY - rect.top) / rect.height - .5) * -10}deg`);
    });
  });
  surface.addEventListener('pointerleave', recentrer);
  // Sur mobile, les commandes restent actives au bas du formulaire même quand
  // la roue est sortie de l’écran ; seul son dessin suspend alors sa boucle.
  const intersection = new IntersectionObserver(([entree]) => { dansEcran = entree.isIntersecting; mouvement(); });
  intersection.observe(scene);
  const intersectionRoue = new IntersectionObserver(([entree]) => { roueVisible = entree.isIntersecting; mouvement(); });
  intersectionRoue.observe(surface);
  reduction.addEventListener('change', mouvement);
  // Retour à la lanterne : la scène se fige et le son se tait ; au retour du JJK, elle repart.
  new MutationObserver(mouvement).observe(racine, { attributes: true, attributeFilter: ['data-entree-jjk'] });
  document.addEventListener('visibilitychange', mouvement);
  window.addEventListener('pagehide', () => { recentrer(); cancelAnimationFrame(impactCadre); territoire.arreter(); });
  synchroniser();
}
