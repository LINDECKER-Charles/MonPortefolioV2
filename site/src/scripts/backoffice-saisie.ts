/**
 * Les champs de l’entrée du backoffice et ce qui leur répond, pour
 * scripts/backoffice-entree.ts : afficher le mot de passe, l’avertir des
 * majuscules, peindre les six cases du code, passer au code de secours,
 * copier la clé de configuration, télécharger les codes de secours, compter
 * les secondes après trop de tentatives (429, `Retry-After`), et la flamme
 * qui vacille à chaque refus. Les cartes aussi : leur liseré suit la main,
 * l’anneau de focus glisse d’un champ à l’autre, la lumière part du point où
 * l’on appuie sur un bouton principal.
 *
 * Les retours viennent de scripts/backoffice.ts, qui les pose dans la zone de
 * chaque écran (`data-state`, et `data-attente` pour un 429) : ce module les
 * observe, il ne touche ni aux requêtes ni à la session. L’envoi du code au
 * sixième chiffre reste dans backoffice.ts, qui marche sans ce module.
 */
import { COURBES, attendre, reduit, rejouer, t } from './backoffice-mouvement';
import type { Scene } from './backoffice-scene';

const NBSP = ' ';
const $ = <T extends HTMLElement = HTMLElement>(id: string): T => document.getElementById(id) as T;

type Mode = 'application' | 'secours';

export interface Saisie {
  /** Le mot de passe masqué, l’avertissement des majuscules effacé. */
  reinitialiserConnexion(): void;
  /** Le code vide, en mode application. */
  reinitialiserCode(): void;
  /** Le code juste : les cases s’allument l’une après l’autre, le temps de le voir. */
  accepter(): Promise<void>;
}

export function brancherSaisie(scene: Scene | undefined): Saisie {
  /** Les messages que ce module a écrits lui-même : son observateur les ignore. */
  const propres = new WeakMap<HTMLElement, string>();
  function dire(zone: HTMLElement, message: string, etat: 'success' | 'error'): void {
    propres.set(zone, message);
    zone.textContent = message;
    zone.dataset.state = etat;
    delete zone.dataset.attente;
  }

  /* ===== Connexion : afficher le mot de passe, les majuscules ===== */
  const adresse = $<HTMLInputElement>('bo-login-email');
  const motDePasse = $<HTMLInputElement>('bo-password');
  const voir = $<HTMLButtonElement>('bo-password-voir');
  const majuscules = $('bo-password-maj');
  const libelleVoir = voir.firstChild!;
  voir.hidden = false;

  function montrerMotDePasse(visible: boolean): void {
    motDePasse.type = visible ? 'text' : 'password';
    libelleVoir.textContent = visible ? 'Masquer' : 'Afficher';
  }
  voir.addEventListener('click', () => montrerMotDePasse(motDePasse.type === 'password'));
  // Le formulaire part avec le mot de passe masqué : le gestionnaire de mots de passe le reconnaît.
  motDePasse.form?.addEventListener('submit', () => montrerMotDePasse(false));

  /** Les majuscules, dites sous le champ tant qu’on y tape ; la description ne vaut que pendant ce temps. */
  function direMajuscules(actives: boolean): void {
    majuscules.hidden = !actives;
    if (actives) motDePasse.setAttribute('aria-describedby', majuscules.id);
    else motDePasse.removeAttribute('aria-describedby');
  }
  const surTouche = (evenement: KeyboardEvent) => {
    if (typeof evenement.getModifierState === 'function') direMajuscules(evenement.getModifierState('CapsLock'));
  };
  motDePasse.addEventListener('keydown', surTouche);
  motDePasse.addEventListener('keyup', surTouche);
  motDePasse.addEventListener('blur', () => direMajuscules(false));
  for (const champ of [adresse, motDePasse]) champ.addEventListener('input', () => scene?.frapper(false));

  /* ===== Vérification : six cases, ou un code de secours ===== */
  const code = $<HTMLInputElement>('bo-two-factor-code');
  const saisie = $('bo-two-factor-saisie');
  const cases = [...saisie.querySelectorAll<HTMLElement>('.bo-code-saisie__case')];
  const bascule = $<HTMLButtonElement>('bo-two-factor-mode');
  const inscription = $('bo-enrollment');
  let mode: Mode = 'application';
  saisie.dataset.cases = '';
  saisie.dataset.mode = mode;

  /** Les six cases sont l’image du vrai champ : chiffres, case active, curseur. */
  function peindre(): void {
    const valeur = mode === 'application' ? code.value : '';
    const actif = document.activeElement === code;
    const rangActif = Math.min(valeur.length, cases.length - 1);
    cases.forEach((une, rang) => {
      const chiffre = valeur.charAt(rang);
      if (une.textContent !== chiffre) {
        une.textContent = chiffre;
        if (chiffre && !reduit()) rejouer(une, 'data-pose');
      }
      une.toggleAttribute('data-plein', Boolean(chiffre));
      une.toggleAttribute('data-active', actif && rang === rangActif);
    });
  }

  function choisir(nouveau: Mode, garderValeur = false): void {
    mode = nouveau;
    saisie.dataset.mode = nouveau;
    const secours = nouveau === 'secours';
    code.setAttribute('inputmode', secours ? 'text' : 'numeric');
    code.setAttribute('autocomplete', secours ? 'off' : 'one-time-code');
    code.setAttribute('autocapitalize', secours ? 'characters' : 'off');
    code.placeholder = secours ? 'XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX' : '';
    // L’envoi au sixième chiffre ne vaut pas pour un code de secours : son aide se tait.
    code.setAttribute('aria-describedby', secours ? 'bo-two-factor-help' : 'bo-two-factor-help bo-two-factor-auto');
    bascule.textContent = secours ? 'Utiliser le code de l’application' : 'Utiliser un code de secours';
    delete saisie.dataset.etat;
    if (!garderValeur) code.value = '';
    peindre();
  }

  /** Signale au formulaire une valeur réécrite : l’envoi au sixième chiffre la voit. */
  function reecrire(valeur: string): void {
    code.value = valeur;
    code.dispatchEvent(new Event('input', { bubbles: true }));
  }

  code.addEventListener('input', () => {
    delete saisie.dataset.etat;
    if (mode === 'application') {
      const brut = code.value.replace(/\s+/g, '');
      if (/^\d*$/.test(brut)) {
        if (brut.slice(0, 6) !== code.value) return reecrire(brut.slice(0, 6));
      } else if (inscription.hidden) {
        // Une lettre ou un tiret : c’est un code de secours, gardé tel quel.
        choisir('secours', true);
      } else {
        return reecrire(brut.replace(/\D/g, '').slice(0, 6));
      }
    }
    peindre();
    scene?.frapper(false);
  });
  for (const type of ['focus', 'blur', 'click', 'keyup', 'select'] as const) {
    code.addEventListener(type, () => {
      // Le curseur reste au bout du code, sauf quand un code refusé est sélectionné pour être retapé.
      if (mode === 'application' && type !== 'blur' && saisie.dataset.etat !== 'refus') {
        const fin = code.value.length;
        if (code.selectionStart !== fin || code.selectionEnd !== fin) code.setSelectionRange(fin, fin);
      }
      peindre();
    });
  }
  bascule.addEventListener('click', () => {
    choisir(mode === 'application' ? 'secours' : 'application');
    // Le refus du code précédent ne vaut plus pour l’autre façon de se vérifier.
    const retour = $('bo-two-factor-retour');
    if (retour.dataset.state === 'error') {
      retour.textContent = '';
      delete retour.dataset.state;
    }
    code.focus();
  });

  /* ===== Configuration : copier la clé ===== */
  const copierCle = $<HTMLButtonElement>('bo-two-factor-copy');
  const libelleCopie = copierCle.firstChild!;
  copierCle.hidden = false;
  copierCle.addEventListener('click', () => {
    const retour = $('bo-two-factor-retour');
    // Écrit pendant le clic (certains navigateurs l’exigent) ; sans presse-papiers, la copie se dit indisponible.
    let ecriture: Promise<void>;
    try {
      ecriture = navigator.clipboard.writeText($<HTMLInputElement>('bo-two-factor-secret').value.replace(/\s/g, ''));
    } catch (cause) {
      ecriture = Promise.reject(cause);
    }
    void ecriture.then(() => {
      libelleCopie.textContent = 'Copiée';
      dire(retour, 'La clé est copiée. Ajoutez-la dans votre application d’authentification.', 'success');
      window.setTimeout(() => { libelleCopie.textContent = 'Copier'; }, t(4000));
    }, () => dire(retour, 'La copie est indisponible. Sélectionnez la clé et copiez-la manuellement.', 'error'));
  });

  /* ===== Codes de secours : télécharger ===== */
  const telecharger = $<HTMLButtonElement>('bo-recovery-download');
  telecharger.hidden = false;
  telecharger.addEventListener('click', () => {
    const codes = [...$('bo-recovery-codes').querySelectorAll('code')].map((element) => element.textContent ?? '');
    const date = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date());
    const lignes = ['Codes de secours du backoffice', `Créés le ${date}. Chaque code ne sert qu’une fois.`, '', ...codes.map((valeur, rang) => `${String(rang + 1).padStart(2, '0')}  ${valeur}`)];
    const lien = document.createElement('a');
    lien.href = URL.createObjectURL(new Blob([`${lignes.join('\n')}\n`], { type: 'text/plain;charset=utf-8' }));
    lien.download = 'codes-de-secours-backoffice.txt';
    document.body.append(lien);
    lien.click();
    lien.remove();
    window.setTimeout(() => URL.revokeObjectURL(lien.href), 1000);
    dire($('bo-recovery-retour'), 'Le fichier des codes est téléchargé. Rangez-le dans un endroit sûr.', 'success');
  });

  /* ===== Refus et trop de tentatives ===== */
  let compteARebours = 0;

  /**
   * Trop de tentatives (429 et Retry-After) : la flamme est soufflée, le
   * bouton compte les secondes, puis la flamme se rallume et la main revient.
   * Le retour n’est annoncé qu’au début (backoffice.ts) et à la fin.
   */
  function bloquer(zone: HTMLElement, secondes: number): void {
    const formulaire = zone.closest('.bo-entree__carte')?.querySelector('form');
    const groupe = formulaire?.querySelector('fieldset');
    const bouton = formulaire?.querySelector<HTMLButtonElement>('.bo-entree__action');
    if (!formulaire || !groupe || !bouton) return;
    window.clearTimeout(compteARebours);
    const libelle = bouton.dataset.libelle ?? bouton.textContent ?? '';
    bouton.dataset.libelle = libelle;
    const fin = Date.now() + secondes * 1000;
    scene?.flamme('soufflee');
    scene?.vaciller();
    const battre = () => {
      const reste = Math.ceil((fin - Date.now()) / 1000);
      if (reste > 0 && !formulaire.closest('[hidden]')) {
        groupe.disabled = true;
        bouton.textContent = `Réessayer dans ${reste}${NBSP}s`;
        compteARebours = window.setTimeout(battre, 250);
        return;
      }
      bouton.textContent = libelle;
      delete bouton.dataset.libelle;
      groupe.disabled = false;
      scene?.rallumer();
      if (reste > 0) return;
      dire(zone, 'Vous pouvez réessayer.', 'success');
      formulaire.querySelector<HTMLInputElement>('input:not([type="hidden"]):not(:disabled)')?.focus();
    };
    battre();
  }

  /** La carte se dérobe à peine et la flamme vacille ; le champ fautif se prête à une nouvelle saisie. */
  function refuser(zone: HTMLElement): void {
    const carte = zone.closest<HTMLElement>('.bo-entree__carte');
    scene?.vaciller();
    if (carte && !reduit()) {
      rejouer(carte, 'data-refus');
      window.setTimeout(() => carte.removeAttribute('data-refus'), t(480));
    }
    if (zone.id === 'bo-login-retour') {
      motDePasse.focus();
      motDePasse.select();
    } else if (zone.id === 'bo-two-factor-retour' && $('bo-two-factor-retry').hidden) {
      // Le code refusé reste affiché en rouge, sélectionné : le prochain chiffre le remplace.
      rejouer(saisie, 'data-etat', 'refus');
      code.focus();
      code.select();
      peindre();
    }
  }

  const zones = [$('bo-login-retour'), $('bo-two-factor-retour')];
  const observateur = new MutationObserver((changements) => {
    for (const zone of zones) {
      if (!changements.some((changement) => zone.contains(changement.target))) continue;
      if (zone.dataset.state !== 'error' || propres.get(zone) === zone.textContent) continue;
      const attente = Number(zone.dataset.attente);
      if (attente > 0) bloquer(zone, attente);
      else refuser(zone);
    }
  });
  for (const zone of zones) observateur.observe(zone, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['data-state', 'data-attente'] });

  /* ===== Les cartes : liseré, anneau de focus, onde ===== */
  for (const carte of document.querySelectorAll<HTMLElement>('.bo-entree__carte')) {
    carte.addEventListener('pointermove', (evenement) => {
      if (evenement.pointerType !== 'mouse') return;
      const boite = carte.getBoundingClientRect();
      carte.style.setProperty('--lisere-x', `${(((evenement.clientX - boite.left) / boite.width) * 100).toFixed(1)}%`);
      carte.style.setProperty('--lisere-y', `${(((evenement.clientY - boite.top) / boite.height) * 100).toFixed(1)}%`);
    });
    carte.addEventListener('pointerleave', () => {
      carte.style.removeProperty('--lisere-x');
      carte.style.removeProperty('--lisere-y');
    });
    brancherAnneau(carte);
  }

  /* L’onde : la lumière part du point où l’on appuie sur un bouton principal. */
  document.addEventListener('pointerdown', (evenement) => {
    const bouton = evenement.target instanceof Element ? evenement.target.closest<HTMLButtonElement>('.bo-entree__action') : null;
    if (!bouton || bouton.disabled || reduit()) return;
    const boite = bouton.getBoundingClientRect();
    const onde = document.createElement('span');
    onde.className = 'bo-onde';
    onde.setAttribute('aria-hidden', 'true');
    onde.style.left = `${evenement.clientX - boite.left}px`;
    onde.style.top = `${evenement.clientY - boite.top}px`;
    bouton.append(onde);
    onde.animate([{ transform: 'scale(0)', opacity: 0.9 }, { transform: 'scale(1)', opacity: 0 }], { duration: t(700), easing: COURBES.expo }).onfinish = () => onde.remove();
  });

  return {
    reinitialiserConnexion() {
      montrerMotDePasse(false);
      direMajuscules(false);
    },
    reinitialiserCode() {
      choisir('application');
      bascule.hidden = !inscription.hidden;
    },
    async accepter() {
      if (mode !== 'application' || reduit()) return;
      saisie.dataset.etat = 'accepte';
      scene?.frapper(true);
      await attendre(t(480));
    },
  };
}

/**
 * L’anneau de focus d’une carte : il glisse d’un champ à l’autre. Le contour
 * natif ne s’efface que quand l’anneau est posé (styles, `:has`).
 */
function brancherAnneau(carte: HTMLElement): void {
  const bague = document.createElement('span');
  bague.className = 'bo-anneau';
  bague.setAttribute('aria-hidden', 'true');
  carte.append(bague);
  type Geometrie = { left: number; top: number; width: number; height: number };
  let pose: Geometrie | null = null;
  const enPixels = (g: Geometrie) => ({ left: `${g.left}px`, top: `${g.top}px`, width: `${g.width}px`, height: `${g.height}px` });
  const eteindre = () => {
    bague.removeAttribute('data-actif');
    pose = null;
  };
  carte.addEventListener('focusin', (evenement) => {
    const champ = evenement.target;
    if (!(champ instanceof HTMLInputElement) || !champ.matches('.bo-entree__formulaire input:not(.bo-code-saisie__champ), .bo-code-saisie[data-mode="secours"] .bo-code-saisie__champ')) {
      eteindre();
      return;
    }
    const boite = carte.getBoundingClientRect();
    const r = champ.getBoundingClientRect();
    const arrivee = { left: r.left - boite.left - 2, top: r.top - boite.top - 2, width: r.width + 4, height: r.height + 4 };
    if (pose && !reduit()) bague.animate([enPixels(pose), enPixels(arrivee)], { duration: t(450), easing: COURBES.expo });
    Object.assign(bague.style, enPixels(arrivee));
    bague.setAttribute('data-actif', '');
    pose = arrivee;
  });
  carte.addEventListener('focusout', (evenement) => {
    const suivant = evenement.relatedTarget;
    if (!(suivant instanceof HTMLInputElement) || !carte.contains(suivant)) eteindre();
  });
}
