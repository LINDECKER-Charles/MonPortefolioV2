/**
 * Le backoffice : session et navigation. Demandes, outils et destinataire sont
 * chargés après connexion dans backoffice-consultation.ts. Les accès MCP vivent dans
 * backoffice-acces.ts, le serveur d’envoi des e-mails dans backoffice-envoi.ts, l’atelier du blog dans blog-editor.ts (chargé à la
 * demande) ; sa barre, ses retours et ses aides d’erreur dans
 * backoffice-atelier.ts.
 *
 * Les accès MCP et les aides de l’atelier sont chargés après validation de la session. Les rubriques
 * Stockage et E-mails vivent dans backoffice-stockage.ts et backoffice-envoi.ts,
 * chargés à leur première visite.
 *
 * Les textes reçus de l’API sont toujours insérés comme texte.
 *
 * Retours : chaque action dit ce qui se passe à côté d’elle. Une commande
 * trouve sa zone par le `data-retour` de son conteneur le plus proche
 * (components/backoffice/Retour.astro) ; #bo-notice ne porte que la session
 * (vérification, expiration, déconnexion) et ce qui n’a plus de zone visible.
 *
 * Navigation : une rubrique est un lien (`aria-current="page"`) ; le clic est
 * intercepté, l’adresse et l’historique suivent, et le focus va au titre de
 * la rubrique.
 *
 * L’entrée (connexion, vérification, codes de secours) : `data-entree` sur
 * <body> tant qu’elle est affichée. Sa mise en scène vit dans
 * backoffice-entree.ts, chargé à part : chaque changement d’écran passe par
 * `jouer`, qui la confie au module s’il est là, sinon l’applique d’un coup.
 * Une session ouverte se mémorise (« cl-backoffice-session ») : la page
 * suivante attend sa vérification au lieu de jouer le générique
 * (public/backoffice-entree.js).
 */
import type { BlogWorkspace } from './blog-editor';
import type { Entree, Geste } from './backoffice-entree';
import type { RubriqueStockage } from './backoffice-stockage';
import type { RubriqueEnvoi } from './backoffice-envoi';
import type { RubriqueAcces } from './backoffice-acces';
import type { Atelier } from './backoffice-atelier';
import type { RubriquesConsultation } from './backoffice-consultation';
import { ErreurApi, messageDe, type Dire, type Etat } from './backoffice-commun';
import { TITRES_RUBRIQUES, type Rubrique } from '../components/backoffice/rubriques';
import { typo } from '../lib/typo';

interface Session { authenticated: boolean; smtp_configured: boolean }
interface Connexion extends Partial<Session> { two_factor_required?: boolean; enrollment_required?: boolean; recovery_codes?: string[] }
interface ConfigurationDeuxFacteurs { secret: string; otpauth_url: string; qr_code_data_url: string }

const RUBRIQUES_CONNUES: readonly Rubrique[] = ['contacts', 'settings', 'links', 'tokens', 'blog', 'storage'];
/** Une session ouverte dans ce navigateur (public/backoffice-entree.js le lit avant le premier rendu). */
const CLE_SESSION = 'cl-backoffice-session';

/** Mémorise qu’une session est ouverte, ou ne l’est plus : seulement un indice, jamais un secret. */
function memoriserSession(ouverte: boolean): void {
  try {
    if (ouverte) window.localStorage.setItem(CLE_SESSION, '1');
    else window.localStorage.removeItem(CLE_SESSION);
  } catch { /* Stockage bloqué : le générique se jouera, rien de plus. */ }
}

export function brancherBackoffice(): void {
  if (!document.getElementById('bo-workspace')) return;
  const element = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
  const texte = (id: string, valeur: string) => { element(id).textContent = valeur; };
  const creer = <K extends keyof HTMLElementTagNameMap>(balise: K, classe = '', contenu?: string) => {
    const noeud = document.createElement(balise);
    if (classe) noeud.className = classe;
    if (contenu !== undefined) noeud.textContent = contenu;
    return noeud;
  };
  const login = element('bo-login');
  const workspace = element('bo-workspace');
  const navigation = element('bo-navigation');
  const loginForm = element<HTMLFormElement>('bo-login-form');
  const password = element<HTMLInputElement>('bo-password');
  const loginEmail = element<HTMLInputElement>('bo-login-email');
  const twoFactor = element('bo-two-factor');
  const twoFactorForm = element<HTMLFormElement>('bo-two-factor-form');
  const twoFactorCode = element<HTMLInputElement>('bo-two-factor-code');
  const recovery = element('bo-recovery');
  const notice = element('bo-notice');
  const liens = [...navigation.querySelectorAll<HTMLAnchorElement>('a[data-panel]')];
  const confirm = element<HTMLDialogElement>('bo-confirm');
  const dates = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
  let authenticated = false;
  let challenge = false;
  let enrollment = false;
  let authSequence = 0;
  let actionSequence = 0;
  let activePanel: Rubrique = 'contacts';
  let blog: BlogWorkspace | undefined;
  let atelier: Atelier | undefined;
  let consultation: RubriquesConsultation | undefined;
  let chargementBlog: Promise<void> | undefined;
  let stockage: RubriqueStockage | undefined;
  let chargementStockage: Promise<RubriqueStockage> | undefined;
  let envoi: RubriqueEnvoi | undefined;
  let chargementEnvoi: Promise<RubriqueEnvoi> | undefined;
  let acces: RubriqueAcces | undefined;
  let chargementAcces: Promise<RubriqueAcces | undefined> | undefined;
  let navigationQueue = Promise.resolve();
  let visibleURL = `${window.location.pathname}${window.location.search}`;
  let historyPosition = typeof history.state?.backofficeIndex === 'number' ? history.state.backofficeIndex : 0;
  let restoringHistory = false;
  history.replaceState({ ...history.state, backofficeIndex: historyPosition }, '', visibleURL);
  const racine = document.documentElement;
  const page = document.body;
  let envoiAuto = 0;
  /** La mise en scène de l’entrée, chargée à part : sans elle, tout fonctionne, d’un coup. */
  let entree: Entree | undefined;
  /** L’ouverture posée avant le premier rendu ne se jouera pas : ses états de départ s’effacent. */
  const effacerOuverture = () => { for (const attribut of ['data-ouverture', 'data-pilote', 'data-nuit-forcee']) racine.removeAttribute(attribut); };
  void import('./backoffice-entree').then(({ brancherEntree }) => { entree = brancherEntree(); }).catch(effacerOuverture);

  /** Un geste de l’entrée, confié au module s’il est chargé ; ignoré si une autre connexion a pris la main entre-temps. */
  function jouer(geste: Geste, maj: () => void): Promise<void> {
    const sequence = authSequence;
    const appliquer = () => { if (sequence === authSequence) maj(); };
    if (entree) return entree.jouer(geste, appliquer);
    appliquer();
    return Promise.resolve();
  }

  /** Un message dans une zone de retour ; #bo-notice se montre, les retours locaux sont toujours là. */
  function afficher(zone: HTMLElement, message: string, etat: Etat = 'success'): void {
    zone.textContent = message;
    zone.dataset.state = etat;
    delete zone.dataset.attente;
    if (zone === notice) notice.hidden = false;
  }
  function annoncer(message: string, etat: Etat = 'success'): void {
    afficher(notice, message, etat);
  }
  function visible(zone: HTMLElement): boolean {
    return zone.isConnected && !zone.closest('[hidden]');
  }
  /** La zone de retour d’une commande : celle de son conteneur, sinon le retour de session. */
  function zoneDe(cible: HTMLElement): HTMLElement {
    const id = cible.closest<HTMLElement>('[data-retour]')?.dataset.retour;
    return (id && document.getElementById(id)) || notice;
  }
  function effacerRetours(): void {
    for (const zone of document.querySelectorAll<HTMLElement>('.bo-retour')) {
      zone.textContent = '';
      delete zone.dataset.state;
      delete zone.dataset.attente;
    }
  }
  function date(valeur: string): string {
    const instant = new Date(valeur);
    return Number.isNaN(instant.getTime()) ? 'Date inconnue' : dates.format(instant);
  }
  function effacerDeuxFacteurs(): void {
    twoFactorCode.value = '';
    twoFactorCode.disabled = false;
    element<HTMLButtonElement>('bo-two-factor-submit').disabled = false;
    element<HTMLInputElement>('bo-two-factor-secret').value = '';
    element<HTMLImageElement>('bo-two-factor-qr').removeAttribute('src');
    element('bo-two-factor-qr').hidden = true;
    element('bo-enrollment-details').hidden = true;
    element('bo-two-factor-retry').hidden = true;
    twoFactor.hidden = true;
  }
  function effacerCodesSecours(): void {
    element('bo-recovery-codes').replaceChildren();
    recovery.hidden = true;
  }
  function choisirRubrique(rubrique: Rubrique): void {
    if (activePanel === 'tokens' && rubrique !== 'tokens') acces?.cacherSecret();
    if (activePanel !== rubrique) effacerRetours();
    activePanel = rubrique;
    for (const lien of liens) {
      const actif = lien.dataset.panel === rubrique;
      if (actif) lien.setAttribute('aria-current', 'page');
      else lien.removeAttribute('aria-current');
      element(`bo-panel-${lien.dataset.panel}`).hidden = !actif;
    }
    if (rubrique === 'blog' && authenticated) document.body.dataset.blogWorkspace = 'true';
    else delete document.body.dataset.blogWorkspace;
    document.body.dataset.backofficePage = rubrique === 'blog' ? 'blog' : 'home';
    if (rubrique !== 'blog') document.title = `${TITRES_RUBRIQUES[rubrique]} — Backoffice`;
  }
  /** Le titre de la rubrique lue reçoit le focus ; l’atelier du blog gère le sien. */
  function focaliserRubrique(): void {
    if (authenticated && activePanel !== 'blog') element(`bo-titre-${activePanel}`).focus();
  }
  function rubriqueURL(value: string): Rubrique {
    const url = new URL(value, window.location.origin);
    if (/^\/backoffice\/blog(?:\/|$)/.test(url.pathname)) return 'blog';
    const rubrique = url.searchParams.get('rubrique');
    return rubrique && (RUBRIQUES_CONNUES as readonly string[]).includes(rubrique) ? rubrique as Rubrique : 'contacts';
  }
  async function chargerBlog(): Promise<void> {
    if (blog) return;
    if (!chargementBlog) {
      const sequence = authSequence;
      chargementBlog = import('./blog-editor').then(({ brancherBlog }) => {
        if (authenticated && sequence === authSequence) blog = brancherBlog({ api, isAuthenticated: () => authenticated, confirm: demanderConfirmation, navigate: naviguer });
      }).finally(() => { chargementBlog = undefined; });
    }
    await chargementBlog;
  }
  /** La rubrique Stockage, chargée à sa première visite. */
  function chargerStockage(): Promise<RubriqueStockage> {
    if (stockage) return Promise.resolve(stockage);
    chargementStockage ??= import('./backoffice-stockage').then(({ brancherStockage }) => {
      stockage = brancherStockage({
        api,
        action: (cible, operation, attente) => action(cible, operation, attente),
        afficher,
        confirmer: demanderConfirmation,
        estConnecte: () => authenticated,
        naviguer: (adresse) => naviguer(adresse),
      });
      return stockage;
    }).finally(() => { chargementStockage = undefined; });
    return chargementStockage;
  }
  /** La rubrique E-mails (serveur d’envoi), chargée à sa première visite. */
  function chargerEnvoi(): Promise<RubriqueEnvoi> {
    if (envoi) return Promise.resolve(envoi);
    chargementEnvoi ??= import('./backoffice-envoi').then(({ brancherEnvoi }) => {
      envoi = brancherEnvoi({
        api,
        action: (cible, operation, attente) => action(cible, operation, attente),
        afficher,
        confirmer: demanderConfirmation,
        estConnecte: () => authenticated,
        date,
        surEtat: (actif) => { element('bo-smtp-warning').hidden = actif; },
      });
      return envoi;
    }).finally(() => { chargementEnvoi = undefined; });
    return chargementEnvoi;
  }
  /** Aucun code de gestion MCP n’est téléchargé pour une session anonyme. */
  function chargerAcces(): Promise<RubriqueAcces | undefined> {
    if (acces) return Promise.resolve(acces);
    chargementAcces ??= import('./backoffice-acces').then(({ brancherAccesMcp }) => {
      if (!authenticated) return;
      acces = brancherAccesMcp({
        api,
        action: (cible, operation, attente) => action(cible, operation, attente),
        afficher,
        confirmer: demanderConfirmation,
        estConnecte: () => authenticated,
        estVisible: () => activePanel === 'tokens' && !workspace.hidden,
        date,
      });
      return acces;
    }).finally(() => { chargementAcces = undefined; });
    return chargementAcces;
  }
  function restaurerHistorique(targetPosition?: number): void {
    if (targetPosition !== undefined && targetPosition !== historyPosition) {
      restoringHistory = true;
      history.go(historyPosition - targetPosition);
    } else history.replaceState({ ...history.state, backofficeIndex: historyPosition }, '', visibleURL);
  }
  async function appliquerRoute(value: string, replace = false, popPosition?: number, retourAvant = atelier?.avantNavigation() ?? ''): Promise<void> {
    const url = new URL(value, window.location.origin);
    if (url.origin !== window.location.origin) return;
    let destination = `${url.pathname}${url.search}`;
    const rubrique = rubriqueURL(destination);
    if (rubrique === 'blog' && !/^\/backoffice\/blog(?:\/|$)/.test(url.pathname)) destination = '/backoffice/blog';
    if (!replace && authenticated && blog && !await blog.canNavigate(destination)) {
      if (popPosition !== undefined) restaurerHistorique(popPosition);
      return;
    }
    if (activePanel === 'blog' && rubrique !== 'blog') blog?.reset();
    if (popPosition !== undefined) historyPosition = popPosition;
    else if (replace || destination === visibleURL) history.replaceState({ ...history.state, backofficeIndex: historyPosition }, '', destination);
    else {
      historyPosition += 1;
      history.pushState({ backofficeIndex: historyPosition }, '', destination);
    }
    const memeVue = rubrique === activePanel && destination === visibleURL;
    visibleURL = destination;
    const arrivee = rubrique !== activePanel;
    if (rubrique === 'blog' && !memeVue) atelier?.apresNavigation(retourAvant);
    choisirRubrique(rubrique);
    // La dernière utilisation des accès change sans nous : relue à chaque visite.
    if (rubrique === 'tokens' && arrivee && authenticated) {
      void chargerAcces().then((rubriqueAcces) => rubriqueAcces?.charger()).catch((cause: unknown) => erreur(cause, element('bo-tokens-retour')));
    }
    // L’état de l’envoi peut changer sans nous (variables du serveur) : relu à chaque visite.
    if (rubrique === 'settings' && arrivee && authenticated) {
      void chargerEnvoi().then((rubriqueEnvoi) => rubriqueEnvoi.charger()).catch((cause: unknown) => erreur(cause, element('bo-mail-retour')));
    }
    // La place prise change à chaque import : relue à chaque visite.
    if (rubrique === 'storage' && arrivee && authenticated) {
      void chargerStockage().then((rubriqueStockage) => rubriqueStockage.charger()).catch((cause: unknown) => erreur(cause, element('bo-storage-retour')));
    }
    if (rubrique === 'blog' && authenticated) {
      // La vue demandée est déjà affichée (une validation qui y ramène, un
      // enregistrement sans changement d’adresse) : la rouvrir déplacerait le
      // focus et fermerait la bulle d’erreur du champ.
      const dejaOuvert = memeVue && blog !== undefined;
      await chargerBlog();
      if (authenticated && !dejaOuvert) await blog?.open(destination);
    }
  }
  function naviguer(value: string, replace = false): Promise<void> {
    const retourAvant = atelier?.avantNavigation() ?? '';
    const operation = navigationQueue.then(() => appliquerRoute(value, replace, undefined, retourAvant));
    navigationQueue = operation.catch((cause: unknown) => erreur(cause));
    return navigationQueue;
  }
  window.addEventListener('popstate', (event) => {
    if (restoringHistory) { restoringHistory = false; return; }
    const destination = `${window.location.pathname}${window.location.search}`;
    const position = typeof event.state?.backofficeIndex === 'number' ? event.state.backofficeIndex : historyPosition;
    const retourAvant = atelier?.avantNavigation() ?? '';
    const operation = navigationQueue.then(() => appliquerRoute(destination, false, position, retourAvant));
    navigationQueue = operation.catch((cause: unknown) => erreur(cause));
  });
  function retourConnexion(preserveBlogDraft = false): void {
    authSequence += 1;
    authenticated = false;
    blog?.reset(preserveBlogDraft);
    challenge = false;
    enrollment = false;
    password.value = '';
    effacerDeuxFacteurs();
    effacerCodesSecours();
    for (const controle of [loginForm, twoFactorForm, element('bo-two-factor-retry'), element('bo-recovery-continue'), element('bo-recovery-copy')]) {
      delete controle.dataset.busy;
      delete controle.dataset.execution;
      controle.removeAttribute('aria-busy');
      if (controle instanceof HTMLFormElement) controle.querySelector('fieldset')!.disabled = false;
      else if (controle instanceof HTMLButtonElement) controle.disabled = false;
    }
    consultation?.reinitialiser();
    acces?.reinitialiser();
    envoi?.reinitialiser();
    stockage?.reinitialiser();
    effacerRetours();
    choisirRubrique('contacts');
    workspace.hidden = true;
    navigation.hidden = true;
    login.hidden = false;
    page.dataset.entree = '';
    element('bo-logout').hidden = true;
    loginForm.querySelector('fieldset')!.disabled = false;
  }
  async function api<T>(chemin: string, method = 'GET', corps?: unknown): Promise<T> {
    const controleur = new AbortController();
    const minuterie = window.setTimeout(() => controleur.abort(), 20_000);
    try {
      const headers: Record<string, string> = { Accept: 'application/json' };
      // Le relais Node refuse en 415 toute mutation sans type JSON, même sans
      // corps (inscription 2FA, déconnexion) : le type part avec chaque mutation.
      if (method !== 'GET') {
        headers['X-Backoffice-Request'] = '1';
        headers['Content-Type'] = 'application/json';
      }
      const reponse = await fetch(`/api/backoffice${chemin}`, {
        method, headers, credentials: 'same-origin', cache: 'no-store',
        ...(corps !== undefined ? { body: JSON.stringify(corps) } : {}), signal: controleur.signal,
      });
      const contenu = await reponse.json().catch(() => ({})) as { message?: string; code?: string; fields?: Record<string, string> };
      if (!reponse.ok) {
        if (reponse.status === 401 && (authenticated || (challenge && contenu.code === 'CHALLENGE_EXPIRED'))) {
          const draft = blog?.hasUnsavedChanges();
          retourConnexion(true);
          memoriserSession(false);
          annoncer(draft ? 'La session a expiré. Reconnectez-vous pour retrouver votre rédaction conservée dans cet onglet.' : 'La session a expiré. Connectez-vous à nouveau.', 'error');
        }
        throw new ErreurApi(
          typeof contenu.message === 'string' && contenu.message
            ? contenu.message
            : reponse.status === 401 ? 'La session a expiré. Connectez-vous à nouveau.' : 'La demande n’a pas abouti. Réessayez dans un instant.',
          reponse.status,
          contenu.code,
          contenu.fields && typeof contenu.fields === 'object' ? contenu.fields : undefined,
          Number(reponse.headers.get('retry-after')) || undefined,
        );
      }
      return contenu as T;
    } finally {
      window.clearTimeout(minuterie);
    }
  }
  /** Une erreur dans sa zone, ou dans le retour de session si cette zone n’est plus affichée. */
  function erreur(cause: unknown, zone: HTMLElement = notice): void {
    const cible = visible(zone) ? zone : notice;
    afficher(cible, messageDe(cause), 'error');
    // Trop de tentatives : l’entrée compte les secondes avant le prochain essai (backoffice-saisie.ts).
    if (cause instanceof ErreurApi && cause.attente) cible.dataset.attente = String(cause.attente);
  }
  /**
   * Une action : verrou contre le double clic, champs désactivés, attente puis
   * résultat dans la zone de retour de la commande (`dire`).
   */
  async function action(cible: HTMLElement, operation: (dire: Dire) => Promise<void>, attente: string, zone = zoneDe(cible)): Promise<void> {
    if (cible.dataset.busy === 'true') return;
    const execution = String(++actionSequence);
    cible.dataset.execution = execution;
    cible.dataset.busy = 'true';
    cible.setAttribute('aria-busy', 'true');
    const controle = cible instanceof HTMLFormElement ? cible.querySelector('fieldset') : cible instanceof HTMLButtonElement ? cible : null;
    if (controle) controle.disabled = true;
    afficher(zone, attente, 'pending');
    zone.dataset.execution = execution;
    const dire: Dire = (message, etat = 'success') => afficher(visible(zone) ? zone : notice, message, etat);
    try {
      await operation(dire);
      // Sans message de résultat, l’attente s’efface.
      if (zone.dataset.execution === execution && zone.dataset.state === 'pending') {
        zone.textContent = '';
        delete zone.dataset.state;
        if (zone === notice) notice.hidden = true;
      }
    } catch (cause) { erreur(cause, zone); }
    finally {
      if (cible.dataset.execution === execution) {
        delete cible.dataset.busy;
        delete cible.dataset.execution;
        cible.removeAttribute('aria-busy');
        if (controle) controle.disabled = false;
      }
    }
  }
  /** Une confirmation ; `commande`, une ligne de terminal, se montre seule en code sous le message. */
  function demanderConfirmation(titre: string, message: string, libelle: string, commande = ''): Promise<boolean> {
    // Écrits dans les scripts, titre et message reçoivent ici leurs espaces insécables : le vérificateur du site ne les voit pas.
    texte('bo-confirm-title', typo(titre));
    texte('bo-confirm-message', typo(message));
    element('bo-confirm-code').replaceChildren(...(commande ? commande.split(' ') : []).flatMap((mot, rang) => [...(rang ? [' '] : []), creer('span', 'bo-commande__mot', mot)]));
    element('bo-confirm-code').parentElement!.hidden = !commande;
    texte('bo-confirm-submit', libelle);
    confirm.returnValue = '';
    confirm.showModal();
    return new Promise((resolve) => {
      confirm.addEventListener('close', () => resolve(confirm.returnValue === 'confirm'), { once: true });
    });
  }
  /** L’atelier : après une connexion (`finale`), la lumière le découvre ; une session retrouvée l’ouvre d’un coup. */
  async function ouvrirWorkspace(finale = false): Promise<void> {
    const sequence = authSequence;
    const session = await api<Session>('/session');
    if (sequence !== authSequence) return;
    if (!session.authenticated) { retourConnexion(); memoriserSession(false); notice.hidden = true; return; }
    authenticated = true;
    if (!atelier || !consultation) {
      const [moduleAtelier, moduleConsultation] = await Promise.all([
        atelier ? undefined : import('./backoffice-atelier'),
        consultation ? undefined : import('./backoffice-consultation'),
      ]);
      if (!authenticated || sequence !== authSequence) return;
      if (moduleAtelier) atelier ??= moduleAtelier.brancherAtelier();
      if (moduleConsultation) consultation ??= moduleConsultation.brancherConsultation({
        api, action, afficher, erreur, confirmer: demanderConfirmation,
        estConnecte: () => authenticated, date,
        destinataire: (email) => envoi?.destinataire(email),
      });
    }
    challenge = false;
    memoriserSession(true);
    const ouvrir = () => {
      effacerDeuxFacteurs();
      effacerCodesSecours();
      password.value = '';
      login.hidden = true;
      delete page.dataset.entree;
      effacerOuverture();
      workspace.hidden = false;
      navigation.hidden = false;
      element('bo-logout').hidden = false;
      element('bo-smtp-warning').hidden = session.smtp_configured;
    };
    if (finale) await jouer('atelier', ouvrir);
    else ouvrir();
    if (!authenticated || sequence !== authSequence) return;
    const reglages = await api<{ email: string }>('/settings');
    if (!authenticated || sequence !== authSequence) return;
    element<HTMLInputElement>('bo-email').value = reglages.email;
    await Promise.all([consultation!.charger(), chargerAcces().then((rubriqueAcces) => {
      if (authenticated && sequence === authSequence) return rubriqueAcces?.charger();
    })]);
    if (authenticated) {
      if (blog?.restoreDraft()) atelier?.conserver();
      await naviguer(`${window.location.pathname}${window.location.search}`, true);
    }
    if (authenticated) notice.hidden = true;
  }
  async function preparerDeuxFacteurs(): Promise<void> {
    const sequence = authSequence;
    twoFactorCode.disabled = true;
    element<HTMLButtonElement>('bo-two-factor-submit').disabled = true;
    element('bo-two-factor-retry').hidden = true;
    try {
      const configuration = await api<ConfigurationDeuxFacteurs>('/2fa/setup', 'POST');
      if (!challenge || sequence !== authSequence) return;
      element<HTMLInputElement>('bo-two-factor-secret').value = configuration.secret;
      const qr = element<HTMLImageElement>('bo-two-factor-qr');
      if (/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(configuration.qr_code_data_url)) {
        qr.src = configuration.qr_code_data_url;
        qr.hidden = false;
      }
      element('bo-enrollment-details').hidden = false;
      twoFactorCode.disabled = false;
      element<HTMLButtonElement>('bo-two-factor-submit').disabled = false;
      notice.hidden = true;
      twoFactorCode.focus();
    } catch (cause) {
      if (!challenge || sequence !== authSequence) return;
      element('bo-two-factor-retry').hidden = false;
      throw cause;
    }
  }
  async function afficherDeuxFacteurs(inscription: boolean): Promise<void> {
    const sequence = authSequence;
    challenge = true;
    enrollment = inscription;
    await jouer('verification', () => {
      effacerDeuxFacteurs();
      twoFactorForm.querySelector('fieldset')!.disabled = false;
      login.hidden = true;
      twoFactor.hidden = false;
      element('bo-enrollment').hidden = !inscription;
      texte('bo-two-factor-title', inscription ? 'Configurer la vérification en deux étapes' : 'Vérifier la connexion');
      texte('bo-two-factor-help', inscription ? 'Ajoutez le backoffice à votre application d’authentification pour protéger les prochaines connexions.' : 'Saisissez le code de votre application d’authentification ou un code de secours.');
      texte('bo-two-factor-submit', inscription ? 'Activer la vérification' : 'Vérifier le code');
      twoFactorCode.maxLength = inscription ? 6 : 64;
      twoFactorCode.inputMode = inscription ? 'numeric' : 'text';
      if (inscription) twoFactorCode.pattern = '[0-9]{6}';
      else twoFactorCode.removeAttribute('pattern');
    });
    if (sequence !== authSequence) return;
    if (inscription) {
      // L’échec de la préparation se dit sur l’écran de vérification, à côté de « Réessayer ».
      try { await preparerDeuxFacteurs(); } catch (cause) { erreur(cause, element('bo-two-factor-retour')); }
    } else { twoFactorForm.querySelector('fieldset')!.disabled = false; notice.hidden = true; twoFactorCode.focus(); }
  }
  async function afficherCodesSecours(codes: string[]): Promise<void> {
    authenticated = true;
    challenge = false;
    await jouer('codes', () => {
      effacerDeuxFacteurs();
      element('bo-recovery-codes').replaceChildren(...codes.map((code) => {
        const item = creer('li');
        const texte = creer('code');
        // Une coupure possible après chaque tiret : un code long passe à la ligne entre deux groupes.
        texte.append(...code.split('-').flatMap((groupe, rang) => (rang ? ['-', creer('wbr'), groupe] : [groupe])));
        item.append(texte);
        return item;
      }));
      recovery.hidden = false;
      element('bo-logout').hidden = false;
      notice.hidden = true;
    });
    element('bo-recovery-title').focus();
  }

  for (const lien of liens) {
    lien.addEventListener('click', (event) => {
      // Un clic du milieu ou avec une touche garde son comportement : un nouvel onglet.
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      const rubrique = lien.dataset.panel as Rubrique;
      void naviguer(lien.href).then(() => { if (activePanel === rubrique) focaliserRubrique(); });
    });
  }
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const sequence = authSequence;
    void action(loginForm, async () => {
      let connexion: Connexion;
      try {
        connexion = await api<Connexion>('/login', 'POST', { email: loginEmail.value.trim(), password: password.value });
      } catch (cause) {
        // Le backend répond 401 sans dire pourquoi (« Une connexion au backoffice est nécessaire. ») :
        // sur cet écran, c’est que l’adresse ou le mot de passe ne va pas. 429, 503… gardent leur message.
        if (cause instanceof ErreurApi && cause.status === 401) throw new ErreurApi('L’adresse e-mail ou le mot de passe est incorrect.', 401, cause.code);
        throw cause;
      }
      if (sequence !== authSequence) return;
      password.value = '';
      if (connexion.two_factor_required) await afficherDeuxFacteurs(Boolean(connexion.enrollment_required));
      else if (connexion.authenticated) { await ouvrirWorkspace(true); focaliserRubrique(); }
      else throw new ErreurApi('La connexion n’a pas abouti. Réessayez.', 502);
    }, 'Connexion…');
  });
  // Six chiffres d’une application : le code part seul, après un instant (une saisie qui continue l’annule),
  // jamais en saisie d’un code de secours (backoffice-saisie.ts pose `data-mode`).
  twoFactorCode.addEventListener('input', () => {
    window.clearTimeout(envoiAuto);
    if (/^\d{6}$/.test(twoFactorCode.value.trim()) && !twoFactorCode.closest('[data-mode="secours"]')) envoiAuto = window.setTimeout(() => twoFactorForm.requestSubmit(), 250);
  });
  twoFactorForm.addEventListener('submit', (event) => {
    event.preventDefault();
    window.clearTimeout(envoiAuto);
    const code = twoFactorCode.value.trim();
    const sequence = authSequence;
    void action(twoFactorForm, async () => {
      const connexion = await api<Connexion>('/2fa/verify', 'POST', { code });
      if (!challenge || sequence !== authSequence) return;
      twoFactorCode.value = '';
      if (!connexion.authenticated) throw new ErreurApi('Le code n’a pas pu être vérifié. Réessayez.', 502);
      authenticated = true;
      if (enrollment && connexion.recovery_codes?.length) await afficherCodesSecours(connexion.recovery_codes);
      else { await ouvrirWorkspace(true); focaliserRubrique(); }
    }, enrollment ? 'Activation de la vérification…' : 'Vérification du code…');
  });
  element('bo-two-factor-back').addEventListener('click', () => {
    void jouer('connexion', () => { retourConnexion(); notice.hidden = true; }).then(() => loginEmail.focus());
  });
  element('bo-two-factor-retry').addEventListener('click', (event) => {
    void action(event.currentTarget as HTMLButtonElement, preparerDeuxFacteurs, 'Préparation de la configuration…');
  });
  element('bo-recovery-continue').addEventListener('click', (event) => {
    void action(event.currentTarget as HTMLButtonElement, async () => {
      await ouvrirWorkspace(true);
      focaliserRubrique();
    }, 'Ouverture du backoffice…');
  });
  element('bo-recovery-copy').addEventListener('click', (event) => {
    void action(event.currentTarget as HTMLButtonElement, async (dire) => {
      try {
        await navigator.clipboard.writeText([...element('bo-recovery-codes').querySelectorAll('code')].map((code) => code.textContent).join('\n'));
        dire('Les codes de secours sont copiés. Conservez-les dans un endroit sûr.');
      } catch { dire('La copie est indisponible. Sélectionnez les codes et copiez-les manuellement.', 'error'); }
    }, 'Copie des codes…');
  });
  element<HTMLButtonElement>('bo-logout').addEventListener('click', (event) => {
    const cible = event.currentTarget as HTMLButtonElement;
    void (async () => {
      if (blog && !await blog.confirmDiscard()) return;
      await action(cible, async () => {
        await api('/logout', 'POST');
        memoriserSession(false);
        await jouer('sortie', () => { retourConnexion(); annoncer('Vous êtes déconnecté.'); });
        loginEmail.focus();
      }, 'Déconnexion…', notice);
    })();
  });
  function verifierSession(): void {
    const sequence = authSequence;
    void ouvrirWorkspace().catch((cause: unknown) => {
      if (sequence !== authSequence) return;
      if (cause instanceof ErreurApi && cause.status === 401) {
        retourConnexion();
        memoriserSession(false);
        notice.hidden = true;
      } else {
        loginForm.querySelector('fieldset')!.disabled = false;
        erreur(cause);
      }
    }).finally(() => racine.removeAttribute('data-session-probable'));
  }
  window.addEventListener('pagehide', () => retourConnexion());
  window.addEventListener('pageshow', (event) => { if (event.persisted) verifierSession(); });
  verifierSession();
}
