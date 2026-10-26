/**
 * L’entrée du backoffice mise en scène, « l’atelier s’allume » (maquette :
 * design/connexion-backoffice/). Chargé à part par scripts/backoffice.ts, qui
 * reste maître de la session, des requêtes et du DOM : chaque geste reçoit sa
 * mise à jour (`maj`) et la joue au bon moment, une seule fois, le plus
 * souvent dans une View Transition. Sans ce module, ou en mouvement réduit,
 * tout fonctionne d’un coup.
 *
 * Le générique (première visite de l’onglet, ≈ 4,7 s), toujours de nuit : le
 * noir et les bandes de cinéma ; le titre seul au centre ; l’étincelle crache
 * deux fois et prend ; en gros plan, la lanterne se dessine autour de la
 * flamme ; la caméra recule jusqu’au plan large et le titre glisse à sa
 * place ; la carte se pose et sa lumière coule le long des bords ; les
 * champs, le texte, les étapes ; les bandes s’ouvrent. S’il fait jour, le
 * jour se lève alors depuis la lanterne, du geste de la bascule du thème.
 * L’ouverture courte (visites suivantes, ≈ 1,9 s) : l’allumage, le titre, la
 * carte. Une touche ou un clic abrège.
 *
 * D’un écran à l’autre : l’ancien récit monte et s’efface, l’ancienne carte se
 * dissout dans la lumière et la nouvelle en émerge ; les lettres du titre, le
 * tracé de la carte, ses champs et la lumière des étapes suivent.
 *
 * L’atelier s’ouvre : la flamme s’embrase et crache ses étincelles, les bandes
 * entrent, la caméra pousse dans la flamme ; la lumière part d’elle et
 * découvre l’atelier, qui se met au point. À la déconnexion, le geste inverse :
 * la lumière rentre dans la lanterne et l’entrée recule jusqu’au plan large.
 *
 * Styles : styles/backoffice-entree.css ; scène : backoffice-scene.ts ;
 * champs : backoffice-saisie.ts ; temps, courbes, titres :
 * backoffice-mouvement.ts.
 */
import {
  COURBES, animerChamps, apparaitre, attendre, carton, monter, nettoyerTitre, poserCarte, reduit, rendreTexte,
  sequence, t, tracerCarte, type Sequence,
} from './backoffice-mouvement';
import { brancherScene, type Point, type Scene } from './backoffice-scene';
import { brancherSaisie } from './backoffice-saisie';

/** Un écran de l’entrée, ou l’un des deux passages de l’atelier. */
export type Geste = 'connexion' | 'verification' | 'codes' | 'atelier' | 'sortie';

export interface Entree {
  /**
   * Joue un geste ; `maj` change le DOM au bon moment, toujours une fois.
   * Résout dès le DOM à jour : l’animation continue sans retenir la suite.
   */
  jouer(geste: Geste, maj: () => void): Promise<void>;
}

type Ecran = 'connexion' | 'verification' | 'codes';
type Etape = Ecran | 'atelier';

const NBSP = ' ';
const racine = document.documentElement;
const page = document.body;
const $ = <T extends HTMLElement = HTMLElement>(id: string): T => document.getElementById(id) as T;
const transitions = typeof document.startViewTransition === 'function';
const pointeurFin = window.matchMedia('(pointer: fine)');

/** Un geste animé est-il possible ? Sinon, la mise à jour se fait d’un coup. */
function anime(): boolean {
  return transitions && !reduit() && !document.hidden;
}

/** Une View Transition, marquée sur la racine le temps de son geste (styles : `data-transition-entree`). */
function transition(nom: string, maj: () => void): ViewTransition {
  racine.dataset.transitionEntree = nom;
  const vue = document.startViewTransition(maj);
  // Une transition sautée (une autre commence) rejette `ready` : ce n’est pas une erreur.
  void vue.ready.catch(() => {});
  void vue.finished.catch(() => {}).then(() => {
    if (racine.dataset.transitionEntree === nom) delete racine.dataset.transitionEntree;
  });
  return vue;
}

/** Les bandes de cinéma : le générique, et le passage dans l’atelier. */
function brancherBandes() {
  const haut = document.querySelector<HTMLElement>('.bo-bande--haut');
  const bas = document.querySelector<HTMLElement>('.bo-bande--bas');
  const CACHE_HAUT = 'translateY(-101%)';
  const CACHE_BAS = 'translateY(101%)';
  function glisser(seq: Sequence, depart: number, duree: number, dedans: boolean, remplissage: FillMode = 'forwards'): void {
    const options = { duration: t(duree), delay: t(depart), easing: COURBES.expo, fill: remplissage };
    seq.animer(haut, dedans ? [{ transform: CACHE_HAUT }, { transform: 'none' }] : [{ transform: 'none' }, { transform: CACHE_HAUT }], options);
    seq.animer(bas, dedans ? [{ transform: CACHE_BAS }, { transform: 'none' }] : [{ transform: 'none' }, { transform: CACHE_BAS }], options);
  }
  return {
    entrer(seq: Sequence, depart: number): void {
      if (reduit()) return;
      racine.setAttribute('data-bandes', '');
      glisser(seq, depart, 550, true);
    },
    sortir(seq: Sequence, depart: number, remplissage?: FillMode): void {
      if (!reduit()) glisser(seq, depart, 850, false, remplissage);
    },
    /** Rangées : elles ne restent pas sous l’écran entre deux passages. */
    ranger(): void {
      racine.removeAttribute('data-bandes');
    },
  };
}

/** Les étapes de la connexion : un repère, un mot ; la lumière avance. */
function brancherEtapes() {
  const cadre = $('bo-etapes');
  const lumiere = cadre.querySelector<HTMLElement>('.bo-etapes__lumiere')!;
  const etapes = [...cadre.querySelectorAll<HTMLElement>('.bo-etapes__etape')];
  cadre.hidden = false;

  function repereCourant(): DOMRect | null {
    const boite = cadre.querySelector('[data-etat="courante"] .bo-etapes__repere')?.getBoundingClientRect();
    return boite?.width ? boite : null;
  }

  /** L’étape courante : faite, courante, à venir ; « Codes de secours » seulement à la première configuration. */
  function marquer(etape: Etape, inscription: boolean): void {
    const ordre: Etape[] = inscription ? ['connexion', 'verification', 'codes', 'atelier'] : ['connexion', 'verification', 'atelier'];
    const courant = ordre.indexOf(etape);
    for (const element of etapes) {
      const rang = ordre.indexOf(element.dataset.etape as Etape);
      element.hidden = rang < 0;
      if (rang < 0) continue;
      element.dataset.etat = rang < courant ? 'faite' : rang === courant ? 'courante' : 'a-venir';
      if (rang === courant) element.setAttribute('aria-current', 'step');
      else element.removeAttribute('aria-current');
      let mention = element.querySelector('.bo-etapes__faite');
      if (rang < courant && !mention) {
        mention = document.createElement('span');
        mention.className = 'sr bo-etapes__faite';
        mention.textContent = ' (terminée)';
        element.append(mention);
      } else if (rang >= courant) mention?.remove();
    }
  }

  /** La lumière voyage du repère de l’étape quittée à celui de la nouvelle. */
  function voyager(avant: DOMRect | null): void {
    const apres = repereCourant();
    if (!avant || !apres || reduit()) return;
    const boite = cadre.getBoundingClientRect();
    const [x0, y0] = [avant.left + avant.width / 2 - boite.left, avant.top + avant.height / 2 - boite.top];
    const [x1, y1] = [apres.left + apres.width / 2 - boite.left, apres.top + apres.height / 2 - boite.top];
    lumiere.animate([
      { transform: `translate(${x0}px, ${y0}px) scale(0.5)`, opacity: 0 },
      { transform: `translate(${x0}px, ${y0}px) scale(1)`, opacity: 1, offset: 0.12 },
      { transform: `translate(${x1}px, ${y1}px) scale(1.15)`, opacity: 1, offset: 0.82 },
      { transform: `translate(${x1}px, ${y1}px) scale(0.6)`, opacity: 0 },
    ], { duration: t(1100), easing: 'cubic-bezier(0.65, 0, 0.35, 1)' });
  }

  return { cadre, marquer, repereCourant, voyager };
}

/** L’horodatage, comme l’indication d’un plan : le jour et l’heure. */
function brancherHorodatage() {
  const temps = $<HTMLTimeElement>('bo-horodatage');
  const jours = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  const deux = (nombre: number) => String(nombre).padStart(2, '0');
  let minuterie = 0;
  function ecrire(): void {
    const maintenant = new Date();
    temps.textContent = `${jours.format(maintenant)}, ${maintenant.getHours()}${NBSP}h${NBSP}${deux(maintenant.getMinutes())}`;
    temps.dateTime = `${maintenant.getFullYear()}-${deux(maintenant.getMonth() + 1)}-${deux(maintenant.getDate())}T${deux(maintenant.getHours())}:${deux(maintenant.getMinutes())}`;
  }
  return {
    lancer(): void {
      ecrire();
      temps.parentElement!.hidden = false;
      window.clearInterval(minuterie);
      minuterie = window.setInterval(ecrire, 15_000);
    },
    arreter(): void {
      window.clearInterval(minuterie);
    },
  };
}

export function brancherEntree(): Entree {
  const sections: Record<Ecran, HTMLElement> = { connexion: $('bo-login'), verification: $('bo-two-factor'), codes: $('bo-recovery') };
  const carteDe = (ecran: Ecran) => sections[ecran].querySelector<HTMLElement>('.bo-entree__carte')!;
  const titres = Object.values(sections).map((section) => section.querySelector<HTMLElement>('.bo-entree__titre')!);
  const adresse = $<HTMLInputElement>('bo-login-email');
  const entete = document.querySelector<HTMLElement>('.bo-entete')!;
  const principal = $('contenu');
  const pied = document.querySelector<HTMLElement>('.bo-pied')!;
  const front = document.querySelector<HTMLElement>('.bo-front-lumiere')!;
  const scene: Scene | undefined = brancherScene();
  const saisie = brancherSaisie(scene);
  const bandes = brancherBandes();
  const etapes = brancherEtapes();
  const horodatage = brancherHorodatage();
  let ecran: Etape = ecranAffiche();
  let inscription = false;
  let seqArrivee: Sequence | undefined;
  let seqAtelier: Sequence | undefined;

  function ecranAffiche(): Etape {
    if (!page.hasAttribute('data-entree')) return 'atelier';
    return (Object.keys(sections) as Ecran[]).find((cle) => !sections[cle].hidden) ?? 'connexion';
  }

  /** Après chaque changement d’écran, fait ici ou par backoffice.ts : étapes, lumière, champs. */
  function suivre(vers: Etape): void {
    ecran = vers;
    if (vers === 'connexion') inscription = false;
    else if (vers === 'verification') inscription = !$('bo-enrollment').hidden;
    else if (vers === 'codes') inscription = true;
    etapes.marquer(vers, inscription);
    if (vers === 'atelier') return;
    scene?.suivreCarte(carteDe(vers));
    if (vers === 'connexion') saisie.reinitialiserConnexion();
    if (vers === 'verification') saisie.reinitialiserCode();
  }

  /** L’adresse reçoit le focus à l’arrivée, sur un écran à pointeur fin, si rien d’autre ne l’a. */
  function focaliserAdresse(): void {
    if (pointeurFin.matches && document.activeElement === document.body && ecran === 'connexion' && !adresse.matches(':disabled')) adresse.focus({ preventScroll: true });
  }

  /** Plus d’ouverture en attente : ses états de départ et de secours s’effacent. */
  function nettoyerOuverture(): void {
    for (const attribut of ['data-ouverture', 'data-pilote', 'data-nuit-forcee']) racine.removeAttribute(attribut);
  }

  /* ===== Le générique ===== */
  const generique = (() => {
    let seq = sequence();
    let aube: ViewTransition | undefined;
    let actif = false;
    const titre = titres[0]!;

    function abreger(): void {
      if (!actif) return;
      actif = false;
      seq.annuler();
      aube?.skipTransition();
      for (const un of titres) nettoyerTitre(un);
      scene?.decadrer();
      nettoyerOuverture();
      bandes.ranger();
      document.removeEventListener('keydown', abreger, true);
      document.removeEventListener('pointerdown', abreger, true);
      scene?.lancer();
      focaliserAdresse();
    }

    function preparer(mode: 'complete' | 'courte'): void {
      seq = sequence();
      actif = true;
      racine.setAttribute('data-ouverture', mode);
      racine.setAttribute('data-pilote', '');
      document.addEventListener('keydown', abreger, true);
      document.addEventListener('pointerdown', abreger, true);
    }

    /**
     * L’aube. La nuit, rien ne change. Le jour, la lumière part de la lanterne
     * et gagne l’écran (la View Transition « vers le jour » de la bascule) :
     * dedans, l’entrée a repris ses couleurs de jour et le titre son encre.
     */
    function lever(jour: boolean): void {
      const changer = () => {
        rendreTexte(titre);
        racine.removeAttribute('data-nuit-forcee');
      };
      if (!jour) {
        racine.removeAttribute('data-nuit-forcee');
        return;
      }
      if (!anime() || !scene) {
        changer();
        return;
      }
      const flamme = scene.centreFlamme();
      racine.style.setProperty('--vt-x', `${Math.round(flamme.x)}px`);
      racine.style.setProperty('--vt-y', `${Math.round(flamme.y)}px`);
      racine.setAttribute('data-transition-theme', 'vers-jour');
      const vue = document.startViewTransition(changer);
      aube = vue;
      void vue.ready.catch(() => {});
      void vue.finished.catch(() => {}).then(() => {
        if (aube === vue) aube = undefined;
        if (racine.getAttribute('data-transition-theme') !== 'vers-jour') return;
        racine.removeAttribute('data-transition-theme');
        racine.style.removeProperty('--vt-x');
        racine.style.removeProperty('--vt-y');
      });
    }

    function complet(): void {
      const carte = carteDe('connexion');
      preparer('complete');
      scene?.cadrer(seq, 2500, 1350);
      scene?.lancer(4);
      seq.animer(scene?.calques.querySelector('.bo-scene__noir'), [
        { opacity: 1 },
        { opacity: 1, offset: 0.46 },
        { opacity: 0.6, offset: 0.62 },
        { opacity: 0.6, offset: 0.7 },
        { opacity: 0 },
      ], { duration: t(3600), fill: 'both' });
      scene?.tracer(seq, 1450);
      const prise = scene?.allumer(seq, 1100, false) ?? 1727;
      carton(seq, titre, { apparition: 250, lumiere: prise + 60, aube: 2650, glisse: 2550, duree: 1300 });
      const jour = racine.getAttribute('data-theme') !== 'nuit';
      seq.plusTard(t(jour ? 3400 : 2500), () => lever(jour));
      apparaitre(seq, entete, 3000, 800, 0, 'both');
      apparaitre(seq, document.querySelector('.bo-tete'), 3300, 800, 12, 'both');
      poserCarte(seq, carte, 3100, 'both');
      tracerCarte(seq, carte, 3250);
      animerChamps(seq, carte, 3350, 'both');
      apparaitre(seq, sections.connexion.querySelector('.bo-entree__texte'), 3400, 900, 16, 'both');
      apparaitre(seq, etapes.cadre, 3550, 800, 0, 'both');
      apparaitre(seq, pied, 3700, 800, 0, 'both');
      bandes.sortir(seq, 3750, 'both');
      seq.plusTard(t(4700), abreger);
    }

    function court(): void {
      const carte = carteDe('connexion');
      preparer('courte');
      scene?.lancer(2.5);
      scene?.allumer(seq, 0, true);
      monter(seq, titre, 160);
      poserCarte(seq, carte, 220, 'both');
      tracerCarte(seq, carte, 380);
      animerChamps(seq, carte, 420, 'both');
      seq.plusTard(t(1900), abreger);
    }

    return {
      abreger,
      jouer(mode: 'complete' | 'courte'): void {
        abreger();
        if (reduit() || ecran !== 'connexion') {
          nettoyerOuverture();
          return;
        }
        racine.setAttribute('data-ouverture', mode);
        // Les lettres se mesurent dans la police finale : on l’attend, 300 ms au plus.
        void Promise.race([document.fonts.ready, attendre(300)]).then(() => {
          if (ecran !== 'connexion' || racine.getAttribute('data-ouverture') !== mode) return;
          if (mode === 'complete') complet();
          else court();
        });
      },
    };
  })();

  /* ===== D’un écran à l’autre ===== */
  /** L’arrivée sur un écran : les lettres du titre, le tracé de la carte, ses champs, la lumière des étapes. */
  function arriver(vers: Ecran, avant: DOMRect | null): void {
    seqArrivee?.annuler();
    const seq = (seqArrivee = sequence());
    const carte = carteDe(vers);
    monter(seq, sections[vers].querySelector('.bo-entree__titre'), 140);
    if (!reduit()) {
      tracerCarte(seq, carte, 120);
      animerChamps(seq, carte, 240);
    }
    etapes.voyager(avant);
    scene?.frapper(true);
    scene?.trainer(false);
  }

  async function montrer(vers: Ecran, maj: () => void): Promise<void> {
    generique.abreger();
    const avant = etapes.repereCourant();
    if (ecran === 'verification' && vers === 'codes') await saisie.accepter();
    const changer = () => {
      maj();
      suivre(vers);
    };
    if (!anime()) {
      changer();
      if (!reduit()) arriver(vers, avant);
      return;
    }
    await transition('ecran', changer).updateCallbackDone;
    arriver(vers, avant);
  }

  /* ===== L’atelier s’ouvre, et se referme ===== */
  /** Le centre des masques de passage : la flamme. */
  function viser(point: Point): void {
    racine.style.setProperty('--flamme-x', `${Math.round(point.x)}px`);
    racine.style.setProperty('--flamme-y', `${Math.round(point.y)}px`);
  }

  /** La caméra pousse dans la flamme : la page entière s’approche, floue et surexposée. */
  function pousser(seq: Sequence, origine: Point, depart: number, duree: number): void {
    for (const plan of [scene?.calques, entete, principal, pied]) {
      if (!plan) continue;
      const boite = plan.getBoundingClientRect();
      plan.style.transformOrigin = `${(origine.x - boite.left).toFixed(1)}px ${(origine.y - boite.top).toFixed(1)}px`;
      seq.animer(plan, [
        { transform: 'none', filter: 'none' },
        { transform: 'scale(1.75)', filter: 'blur(8px) brightness(1.65)' },
      ], { duration: t(duree), delay: t(depart), easing: COURBES.entree, fill: 'forwards' });
    }
  }

  function relacher(seq: Sequence): void {
    seq.annuler();
    for (const plan of [scene?.calques, entete, principal, pied]) plan?.style.removeProperty('transform-origin');
  }

  /** Après un passage : plus de front de lumière, plus de centre, la flamme au calme. */
  function terminerPassage(vue: ViewTransition, seq: Sequence): void {
    void vue.finished.catch(() => {}).then(() => {
      if (seqAtelier !== seq) return;
      delete front.dataset.revele;
      racine.style.removeProperty('--flamme-x');
      racine.style.removeProperty('--flamme-y');
    });
  }

  async function ouvrirAtelier(maj: () => void): Promise<void> {
    generique.abreger();
    if (ecran === 'verification') await saisie.accepter();
    const ouvrir = () => {
      maj();
      suivre('atelier');
      scene?.flamme('vive');
    };
    seqAtelier?.annuler();
    if (!anime() || !scene) {
      ouvrir();
      return;
    }
    const seq = (seqAtelier = sequence());
    const camera = sequence();
    scene.flamme('embrasee');
    scene.frapper(true);
    scene.trainer(true);
    scene.etinceler(14, 1.5);
    bandes.entrer(seq, 0);
    const origine = scene.centreFlamme();
    viser(origine);
    // La poussée accélère dans la flamme ; la lumière jaillit pendant qu’elle s’achève.
    pousser(camera, origine, 100, 1300);
    await attendre(t(550));
    if (seqAtelier !== seq) {
      relacher(camera);
      ouvrir();
      return;
    }
    const vue = transition('ouverture', () => {
      relacher(camera);
      ouvrir();
      front.dataset.revele = 'ouverture';
    });
    bandes.sortir(seq, 1400);
    seq.plusTard(t(2250), () => { if (seqAtelier === seq) bandes.ranger(); });
    terminerPassage(vue, seq);
    await vue.updateCallbackDone;
  }

  async function fermerAtelier(maj: () => void): Promise<void> {
    seqAtelier?.annuler();
    const revenir = () => {
      maj();
      suivre(ecranAffiche());
      scene?.flamme('vive');
    };
    if (!anime() || !scene) {
      revenir();
      return;
    }
    const seq = (seqAtelier = sequence());
    bandes.entrer(seq, 0);
    const vue = transition('fermeture', () => {
      revenir();
      viser(scene.centreFlamme());
      front.dataset.revele = 'fermeture';
    });
    bandes.sortir(seq, 1350);
    seq.plusTard(t(2200), () => { if (seqAtelier === seq) bandes.ranger(); });
    terminerPassage(vue, seq);
    void vue.finished.catch(() => {}).then(() => scene.frapper(true));
    await vue.updateCallbackDone;
  }

  /* ===== Ce que backoffice.ts change sans passer par ici ===== */
  // L’atelier ouvert (session retrouvée) ou l’entrée revenue (expiration) : la scène s’arrête ou repart.
  let entreeAffichee = page.hasAttribute('data-entree');
  new MutationObserver(() => {
    const affichee = page.hasAttribute('data-entree');
    if (affichee === entreeAffichee) return;
    entreeAffichee = affichee;
    if (affichee) {
      suivre(ecranAffiche());
      scene?.lancer();
      horodatage.lancer();
    } else {
      ecran = 'atelier';
      generique.abreger();
      nettoyerOuverture();
      scene?.arreter();
      horodatage.arreter();
    }
  }).observe(page, { attributes: true, attributeFilter: ['data-entree'] });

  // Un écran changé d’un coup (défi expiré, retour à la connexion) : les étapes et la lumière suivent.
  const observateurEcrans = new MutationObserver(() => {
    const affiche = ecranAffiche();
    if (affiche !== ecran && affiche !== 'atelier') suivre(affiche);
  });
  for (const section of Object.values(sections)) observateurEcrans.observe(section, { attributes: true, attributeFilter: ['hidden'] });

  // Une session était probable et ne l’est plus : l’entrée s’ouvre en court.
  if (racine.hasAttribute('data-session-probable')) {
    const observateur = new MutationObserver(() => {
      if (racine.hasAttribute('data-session-probable')) return;
      observateur.disconnect();
      if (page.hasAttribute('data-entree')) generique.jouer('courte');
    });
    observateur.observe(racine, { attributes: true, attributeFilter: ['data-session-probable'] });
  }

  /* ===== Démarrage ===== */
  if (!reduit()) scene?.semer(18);
  suivre(ecran);
  if (ecran === 'atelier') nettoyerOuverture();
  else {
    horodatage.lancer();
    const ouverture = racine.getAttribute('data-ouverture');
    if (racine.hasAttribute('data-session-probable')) nettoyerOuverture();
    else if (ouverture === 'complete' || ouverture === 'courte') generique.jouer(ouverture);
    else {
      scene?.lancer(0.8);
      focaliserAdresse();
    }
  }

  return {
    async jouer(geste, maj) {
      let faite = false;
      const une = () => {
        if (faite) return;
        faite = true;
        maj();
      };
      try {
        if (geste === 'atelier') await ouvrirAtelier(une);
        else if (geste === 'sortie') await fermerAtelier(une);
        else await montrer(geste, une);
      } finally {
        // Quoi qu’il arrive à la mise en scène, la mise à jour a lieu.
        une();
      }
    },
  };
}
