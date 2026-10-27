/**
 * La scène de l’entrée du backoffice (components/backoffice/SceneEntree.astro),
 * pilotée par scripts/backoffice-entree.ts : la flamme et ses états, la
 * caméra (gros plan sur la flamme, puis recul), le balancier de la lanterne
 * et l’air de l’atelier qui la berce, la parallaxe des calques, la poussière
 * dans la lumière et les étincelles.
 *
 * Le balancier est un pendule amorti autour du point d’attache ; la même
 * boucle (requestAnimationFrame) fait suivre la main aux calques et écarte
 * l’ombre de la carte éclairée (--balance). Elle ne tourne que si l’entrée est
 * affichée, l’onglet visible et le mouvement permis.
 */
import { COURBES, etroit, reduit, sequence, t, type Sequence } from './backoffice-mouvement';

export type EtatFlamme = 'vive' | 'soufflee' | 'embrasee';

export interface Point {
  x: number;
  y: number;
}

export interface Scene {
  /** La racine de la scène, que la caméra pousse avec le reste de la page. */
  readonly calques: HTMLElement;
  flamme(etat: EtatFlamme): void;
  suivreCarte(carte: HTMLElement | null): void;
  frapper(fort: boolean): void;
  trainer(fort: boolean): void;
  etinceler(nombre: number, force?: number): void;
  vaciller(): void;
  allumer(seq: Sequence, depart: number, rapide: boolean): number;
  rallumer(): void;
  tracer(seq: Sequence, depart: number): void;
  cadrer(seq: Sequence, depart: number, duree: number): void;
  decadrer(): void;
  centreFlamme(): Point;
  lancer(angleInitial?: number): void;
  arreter(): void;
  semer(nombre: number): void;
}

/** L’ordre du tracé de la lanterne : anneau, col, toit, montants, traverses, fenêtre, bougie, socle, pieds. */
const RANGS = [0, 1, 2, 3, 3, 4, 4, 5, 6, 7, 8, 8];
/** Raideur et amorti du balancier : ≈ 2,1 s par aller-retour, le calme en cinq ou six secondes. */
const RAIDEUR = 9;
const AMORTI = 0.85;

export function brancherScene(): Scene | undefined {
  const trouvee = document.querySelector<HTMLElement>('.bo-scene');
  if (!trouvee) return undefined;
  const calques: HTMLElement = trouvee;
  const page = document.body;
  const partie = <T extends Element = HTMLElement>(classe: string): T => calques.querySelector<T>(`.${classe}`)!;
  const plan = partie('bo-scene__plan');
  const bokeh = partie('bo-scene__bokeh');
  const suspension = partie('bo-suspension');
  const lanterne = partie('bo-suspension__lanterne');
  const corde = partie('bo-suspension__corde');
  const traits = [...calques.querySelectorAll<SVGElement>('.bo-lanterne__traits > *')];
  const flamme = partie<SVGGElement>('bo-flamme');
  const sursaut = partie<SVGGElement>('bo-flamme__sursaut');
  const vitre = partie<SVGPathElement>('bo-lanterne__vitre');
  const halo = partie('bo-lanterne__halo');
  const rayons = partie('bo-lanterne__rayons');
  const poussieres = partie('bo-lanterne__poussieres');
  const eclat = partie('bo-lanterne__eclat');
  const trainee = partie('bo-lanterne__trainee');
  const etincelles = partie('bo-lanterne__etincelles');
  let carte: HTMLElement | null = null;
  let derniereFrappe = 0;

  function etat(valeur: EtatFlamme): void {
    if (valeur === 'vive') delete page.dataset.flamme;
    else page.dataset.flamme = valeur;
  }

  /** La carte qui reçoit la lumière, et l’ombre qui suit le balancier. */
  function suivreCarte(element: HTMLElement | null): void {
    if (carte && carte !== element) carte.style.removeProperty('--balance');
    carte = element;
  }

  /** Une frappe : la flamme sursaute, un éclat passe. */
  function frapper(fort: boolean): void {
    const maintenant = performance.now();
    if (reduit() || page.dataset.flamme === 'soufflee' || maintenant - derniereFrappe < 90) return;
    derniereFrappe = maintenant;
    const ampleur = fort ? 1.22 : 1.1;
    sursaut.animate(
      [{ transform: 'scale(1)' }, { transform: `scale(${ampleur - 0.04}, ${ampleur})`, offset: 0.35 }, { transform: 'scale(1)' }],
      { duration: t(fort ? 520 : 300), easing: COURBES.courbe },
    );
    eclat.animate(
      [{ opacity: 0, scale: 0.85 }, { opacity: fort ? 1 : 0.75, scale: 1.08, offset: 0.3 }, { opacity: 0, scale: 1 }],
      { duration: t(fort ? 700 : 420), easing: 'ease-out' },
    );
  }

  /** La traînée d’objectif s’étire sur un éclat de la flamme. */
  function trainer(fort: boolean): void {
    if (reduit()) return;
    trainee.animate([
      { transform: 'scaleX(0.3)', opacity: 0.2 },
      { transform: `scaleX(${fort ? 1.9 : 1.35})`, opacity: 1, offset: 0.22 },
      { transform: 'scaleX(1)', opacity: 0.4 },
    ], { duration: t(fort ? 1300 : 800), easing: COURBES.expo });
  }

  /** Des étincelles jaillissent de la flamme, en éventail, puis retombent. */
  function etinceler(nombre: number, force = 1): void {
    if (reduit()) return;
    for (let rang = 0; rang < nombre; rang += 1) {
      const grain = document.createElement('span');
      grain.className = 'bo-etincelle';
      etincelles.append(grain);
      const angle = ((-90 + (Math.random() - 0.5) * 200) * Math.PI) / 180;
      const distance = (24 + Math.random() * 64) * force;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;
      grain.animate([
        { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
        { transform: `translate(calc(-50% + ${(dx * 0.7).toFixed(1)}px), calc(-50% + ${(dy * 0.7).toFixed(1)}px)) scale(0.8)`, opacity: 1, offset: 0.5 },
        { transform: `translate(calc(-50% + ${dx.toFixed(1)}px), calc(-50% + ${(dy + 18).toFixed(1)}px)) scale(0.2)`, opacity: 0 },
      ], { duration: t(550 + Math.random() * 550), easing: 'cubic-bezier(0.15, 0.6, 0.35, 1)' }).onfinish = () => grain.remove();
    }
  }

  /** Un refus : la flamme se couche, faiblit ; la lumière quitte un instant le bord de la carte. */
  function vaciller(): void {
    if (reduit()) return;
    sursaut.animate([
      { transform: 'scale(1) skewX(0deg)', opacity: 1 },
      { transform: 'scale(0.6, 0.45) skewX(10deg)', opacity: 0.5, offset: 0.22 },
      { transform: 'scale(0.8, 0.72) skewX(-6deg)', opacity: 0.8, offset: 0.5 },
      { transform: 'scale(1) skewX(0deg)', opacity: 1 },
    ], { duration: t(1200), easing: COURBES.courbe });
    halo.animate([{ opacity: 1 }, { opacity: 0.32, offset: 0.25 }, { opacity: 1 }], { duration: t(1400), easing: 'ease-in-out' });
    try {
      carte?.animate([{ opacity: 1 }, { opacity: 0.1, offset: 0.25 }, { opacity: 1 }], { duration: t(1200), easing: 'ease-in-out', pseudoElement: '::after' });
    } catch {
      // Un navigateur sans animation de pseudo-élément garde le liseré allumé.
    }
  }

  /**
   * L’allumage : la mèche crache deux fois avant de prendre ; à la prise, le
   * halo jette un éclat, la traînée s’étire, des étincelles jaillissent, puis
   * les rayons et la poussière apparaissent. Rend l’instant de la prise.
   */
  function allumer(seq: Sequence, depart: number, rapide: boolean): number {
    const duree = rapide ? 700 : 950;
    seq.animer(flamme, [
      { scale: 0, opacity: 0 },
      { scale: 0.3, opacity: 1, offset: 0.12 },
      { scale: 0.06, opacity: 0.25, offset: 0.22 },
      { scale: 0.38, opacity: 1, offset: 0.36 },
      { scale: 0.1, opacity: 0.45, offset: 0.46 },
      { scale: 1.35, opacity: 1, offset: 0.7 },
      { scale: 1, opacity: 1 },
    ], { duration: t(duree), delay: t(depart), fill: 'both' });
    const prise = depart + duree * 0.66;
    seq.animer(halo, [{ opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1.22, offset: 0.35 }, { opacity: 1, scale: 1 }], { duration: t(1200), delay: t(prise), easing: COURBES.expo, fill: 'both' });
    seq.animer(vitre, [{ opacity: 0 }, { opacity: 1 }], { duration: t(500), delay: t(prise), easing: COURBES.courbe, fill: 'both' });
    seq.animer(trainee, [
      { transform: 'scaleX(0.2)', opacity: 0 },
      { transform: 'scaleX(1.9)', opacity: 1, offset: 0.22 },
      { transform: 'scaleX(1)', opacity: 0.4 },
    ], { duration: t(1300), delay: t(prise), easing: COURBES.expo, fill: 'both' });
    seq.animer(rayons, [{ opacity: 0 }, { opacity: 1 }], { duration: t(1800), delay: t(prise + 120), easing: COURBES.courbe, fill: 'both' });
    seq.animer(poussieres, [{ opacity: 0 }, { opacity: 1 }], { duration: t(1600), delay: t(prise + 200), easing: COURBES.courbe, fill: 'both' });
    seq.plusTard(t(prise), () => {
      frapper(true);
      etinceler(10, 1);
    });
    return prise;
  }

  /** La flamme revient après un trop grand nombre d’essais : d’une braise, elle reprend. */
  function rallumer(): void {
    etat('vive');
    if (reduit()) return;
    const seq = sequence();
    allumer(seq, 0, true);
    window.setTimeout(() => seq.annuler(), t(2600));
  }

  /** Le dessin se trace : la corde descend du haut, puis les traits de la lanterne, dans l’ordre. */
  function tracer(seq: Sequence, depart: number): void {
    seq.animer(corde, [{ transform: 'scaleY(0)' }, { transform: 'none' }], { duration: t(900), delay: t(depart), easing: COURBES.expo, fill: 'both' });
    // Un peu plus que 1 au départ : un tiret de longueur nulle dessinerait déjà un point (bout rond).
    traits.forEach((trait, rang) => {
      seq.animer(trait, [{ strokeDashoffset: 1.02 }, { strokeDashoffset: 0 }], { duration: t(1050), delay: t(depart + 50 + (RANGS[rang] ?? 8) * 75), easing: COURBES.courbe, fill: 'both' });
    });
  }

  /** Le centre de la flamme à l’écran, d’après la boîte du dessin (indépendant de l’état de la flamme). */
  function centreFlamme(): Point {
    const boite = lanterne.getBoundingClientRect();
    return { x: boite.left + boite.width / 2, y: boite.top + boite.height * 0.675 };
  }

  /**
   * La caméra : un gros plan sur la flamme (le plan agrandi autour d’elle,
   * ramenée en haut et au centre de l’écran), puis le recul jusqu’au plan
   * large ; le bokeh, plus lointain, recule moins vite.
   */
  function cadrer(seq: Sequence, depart: number, duree: number): void {
    figer();
    const flammeEcran = centreFlamme();
    const boite = plan.getBoundingClientRect();
    const vise = { x: window.innerWidth / 2, y: window.innerHeight * (etroit.matches ? 0.3 : 0.32) };
    const echelle = etroit.matches ? 1.9 : 2.4;
    plan.style.transformOrigin = `${(flammeEcran.x - boite.left).toFixed(1)}px ${(flammeEcran.y - boite.top).toFixed(1)}px`;
    seq.animer(plan, [
      { transform: `translate(${(vise.x - flammeEcran.x).toFixed(1)}px, ${(vise.y - flammeEcran.y).toFixed(1)}px) scale(${echelle})` },
      { transform: 'none' },
    ], { duration: t(duree), delay: t(depart), easing: COURBES.expo, fill: 'both' });
    seq.animer(bokeh, [{ transform: 'scale(1.45)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: t(duree + 300), delay: t(depart - 150), easing: COURBES.expo, fill: 'both' });
  }

  function decadrer(): void {
    plan.style.removeProperty('transform-origin');
  }

  /* Le balancier (angle en degrés, vitesse en degrés par seconde) et la parallaxe. */
  let angle = 0;
  let vitesse = 0;
  let dernier = 0;
  let boucle = 0;
  let actif = false;
  let px = 0;
  let py = 0;
  let cibleX = 0;
  let cibleY = 0;
  let ecritX = 0;
  let ecritY = 0;

  function pas(instant: number): void {
    const dt = Math.min(0.05, (instant - dernier) / 1000 || 0.016);
    dernier = instant;
    const air = Math.sin(instant / 2300) * 0.4 + Math.sin(instant / 3700 + 1.3) * 0.3;
    vitesse += (-RAIDEUR * (angle - air) - AMORTI * vitesse) * dt;
    angle += vitesse * dt;
    suspension.style.transform = `rotate(${angle.toFixed(3)}deg)`;
    carte?.style.setProperty('--balance', angle.toFixed(2));
    const lissage = Math.min(1, dt * 3.5);
    px += (cibleX - px) * lissage;
    py += (cibleY - py) * lissage;
    if (Math.abs(px - ecritX) > 0.002 || Math.abs(py - ecritY) > 0.002) {
      ecritX = px;
      ecritY = py;
      calques.style.setProperty('--px', px.toFixed(3));
      calques.style.setProperty('--py', py.toFixed(3));
    }
    boucle = window.requestAnimationFrame(pas);
  }

  function lancer(angleInitial?: number): void {
    if (typeof angleInitial === 'number') angle = angleInitial;
    // L’entrée JJK (connexion-jjk.ts) cache la scène : rien ne tourne pour elle.
    if (actif || reduit() || document.hidden || !page.hasAttribute('data-entree') || document.documentElement.hasAttribute('data-entree-jjk')) return;
    actif = true;
    dernier = performance.now();
    boucle = window.requestAnimationFrame(pas);
  }

  function arreter(): void {
    actif = false;
    window.cancelAnimationFrame(boucle);
  }

  function figer(): void {
    arreter();
    angle = 0;
    vitesse = 0;
    suspension.style.removeProperty('transform');
    carte?.style.removeProperty('--balance');
  }

  function pousser(impulsion: number): void {
    if (reduit()) return;
    vitesse = Math.max(-80, Math.min(80, vitesse + impulsion));
    lancer();
  }

  /* La main pousse la lanterne : en passant (selon sa vitesse) ou d’un clic. */
  let dernierX: number | null = null;
  let dernierT = 0;
  lanterne.addEventListener('pointermove', (evenement) => {
    const instant = performance.now();
    if (dernierX !== null && instant - dernierT < 120) {
      const vx = (evenement.clientX - dernierX) / Math.max(0.008, (instant - dernierT) / 1000);
      pousser(Math.max(-24, Math.min(24, -vx * 0.025)));
    }
    dernierX = evenement.clientX;
    dernierT = instant;
  });
  lanterne.addEventListener('pointerleave', () => { dernierX = null; });
  lanterne.addEventListener('pointerdown', (evenement) => {
    const boite = lanterne.getBoundingClientRect();
    pousser(evenement.clientX < boite.left + boite.width / 2 ? -42 : 42);
    frapper(true);
    etinceler(4, 0.6);
  });

  /* La parallaxe : les calques lointains suivent la main plus que le plan. */
  document.addEventListener('pointermove', (evenement) => {
    if (evenement.pointerType !== 'mouse' || reduit()) return;
    cibleX = (evenement.clientX / window.innerWidth) * 2 - 1;
    cibleY = (evenement.clientY / window.innerHeight) * 2 - 1;
  });
  document.documentElement.addEventListener('pointerleave', () => {
    cibleX = 0;
    cibleY = 0;
  });

  /** La poussière qui danse dans la lumière : positions, tailles et durées tirées au sort, en multiples de --d-scene. */
  function semer(nombre: number): void {
    const grains = Array.from({ length: nombre }, () => {
      const grain = document.createElement('span');
      grain.className = 'bo-poussiere';
      const duree = 22 + Math.random() * 26;
      for (const [nom, valeur] of [
        ['--x', `${(8 + Math.random() * 84).toFixed(1)}%`],
        ['--y', `${(12 + Math.random() * 80).toFixed(1)}%`],
        ['--taille', `${(1 + Math.random() * 2.2).toFixed(2)}px`],
        ['--o', (0.3 + Math.random() * 0.65).toFixed(2)],
        ['--dx', `${((Math.random() - 0.5) * 70).toFixed(0)}px`],
        ['--dy', `${(-25 - Math.random() * 80).toFixed(0)}px`],
        ['--duree', `calc(var(--d-scene) * ${duree.toFixed(1)})`],
        ['--retard', `calc(var(--d-scene) * -${(Math.random() * duree).toFixed(1)})`],
      ] as const) grain.style.setProperty(nom, valeur);
      return grain;
    });
    poussieres.replaceChildren(...grains);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) arreter();
    else lancer();
  });

  return {
    calques, flamme: etat, suivreCarte, frapper, trainer, etinceler, vaciller, allumer, rallumer,
    tracer, cadrer, decadrer, centreFlamme, lancer, arreter, semer,
  };
}
