/**
 * Le backoffice : session, navigation entre rubriques et rubriques simples
 * (demandes, adresse, boîte à outils). Les accès MCP vivent dans
 * backoffice-acces.ts, l’atelier du blog dans blog-editor.ts (chargé à la
 * demande).
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
 */
import type { BlogWorkspace } from './blog-editor';
import { brancherAccesMcp } from './backoffice-acces';
import { ErreurApi, messageDe, type Dire, type Etat } from './backoffice-commun';
import { TITRES_RUBRIQUES, type Rubrique } from '../components/backoffice/rubriques';

type Statut = 'new' | 'read' | 'archived';
type Filtre = Statut | 'all';
interface Demande {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: Statut;
  delivery_status: 'pending' | 'sent' | 'failed' | 'unconfigured';
  created_at: string;
}
interface Outil { id: number; label: string; url: string; description: string }
interface Boite { contacts: Demande[]; total: number; new_count: number }
interface Session { authenticated: boolean; smtp_configured: boolean }
interface Connexion extends Partial<Session> { two_factor_required?: boolean; enrollment_required?: boolean; recovery_codes?: string[] }
interface ConfigurationDeuxFacteurs { secret: string; otpauth_url: string; qr_code_data_url: string }

const RUBRIQUES_CONNUES: readonly Rubrique[] = ['contacts', 'settings', 'links', 'tokens', 'blog'];
const NBSP = ' ';

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
  const filter = element<HTMLSelectElement>('bo-filter');
  const notice = element('bo-notice');
  const liens = [...navigation.querySelectorAll<HTMLAnchorElement>('a[data-panel]')];
  const confirm = element<HTMLDialogElement>('bo-confirm');
  const dates = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
  const statuts: Record<Statut, string> = { new: 'Nouvelle', read: 'Lue', archived: 'Archivée' };
  const livraisons: Record<Demande['delivery_status'], string> = {
    pending: 'En cours', sent: 'Envoyée', failed: 'Échec de l’envoi', unconfigured: 'Désactivée',
  };
  let authenticated = false;
  let challenge = false;
  let enrollment = false;
  let authSequence = 0;
  let actionSequence = 0;
  let activePanel: Rubrique = 'contacts';
  let contacts: Demande[] = [];
  let selected: Demande | undefined;
  let links: Outil[] = [];
  let editingLink: number | undefined;
  let offset = 0;
  let total = 0;
  let requestSequence = 0;
  const limit = 50;
  let blog: BlogWorkspace | undefined;
  let chargementBlog: Promise<void> | undefined;
  let navigationQueue = Promise.resolve();
  let visibleURL = `${window.location.pathname}${window.location.search}`;
  let historyPosition = typeof history.state?.backofficeIndex === 'number' ? history.state.backofficeIndex : 0;
  let restoringHistory = false;
  history.replaceState({ ...history.state, backofficeIndex: historyPosition }, '', visibleURL);

  /** Un message dans une zone de retour ; #bo-notice se montre, les retours locaux sont toujours là. */
  function afficher(zone: HTMLElement, message: string, etat: Etat = 'success'): void {
    zone.textContent = message;
    zone.dataset.state = etat;
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
    if (activePanel === 'tokens' && rubrique !== 'tokens') acces.cacherSecret();
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
  function restaurerHistorique(targetPosition?: number): void {
    if (targetPosition !== undefined && targetPosition !== historyPosition) {
      restoringHistory = true;
      history.go(historyPosition - targetPosition);
    } else history.replaceState({ ...history.state, backofficeIndex: historyPosition }, '', visibleURL);
  }
  async function appliquerRoute(value: string, replace = false, popPosition?: number): Promise<void> {
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
    visibleURL = destination;
    const arrivee = rubrique !== activePanel;
    choisirRubrique(rubrique);
    // La dernière utilisation des accès change sans nous : relue à chaque visite.
    if (rubrique === 'tokens' && arrivee && authenticated) void acces.charger().catch((cause: unknown) => erreur(cause, element('bo-tokens-retour')));
    if (rubrique === 'blog' && authenticated) {
      await chargerBlog();
      if (authenticated) await blog?.open(destination);
    }
  }
  function naviguer(value: string, replace = false): Promise<void> {
    const operation = navigationQueue.then(() => appliquerRoute(value, replace));
    navigationQueue = operation.catch((cause: unknown) => erreur(cause));
    return navigationQueue;
  }
  window.addEventListener('popstate', (event) => {
    if (restoringHistory) { restoringHistory = false; return; }
    const destination = `${window.location.pathname}${window.location.search}`;
    const position = typeof event.state?.backofficeIndex === 'number' ? event.state.backofficeIndex : historyPosition;
    const operation = navigationQueue.then(() => appliquerRoute(destination, false, position));
    navigationQueue = operation.catch((cause: unknown) => erreur(cause));
  });
  function resetLinkForm(): void {
    editingLink = undefined;
    element<HTMLFormElement>('bo-link-form').reset();
    texte('bo-link-form-title', 'Ajouter un outil');
    texte('bo-link-submit', 'Ajouter l’outil');
    element('bo-link-cancel').hidden = true;
  }
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
    requestSequence += 1;
    contacts = [];
    links = [];
    selected = undefined;
    offset = 0;
    total = 0;
    filter.value = 'new';
    for (const id of ['bo-contact-list', 'bo-link-list']) element(id).replaceChildren();
    for (const id of ['bo-contact-name', 'bo-contact-email', 'bo-contact-date', 'bo-contact-state', 'bo-contact-delivery', 'bo-contact-message', 'bo-total']) texte(id, '');
    element('bo-contact-email').removeAttribute('href');
    element('bo-contact-detail').hidden = true;
    element('bo-contact-article').classList.remove('foyer');
    texte('bo-contact-title', 'Choisissez une demande');
    element('bo-detail-placeholder').hidden = false;
    element<HTMLFormElement>('bo-settings-form').reset();
    resetLinkForm();
    acces.reinitialiser();
    effacerRetours();
    choisirRubrique('contacts');
    workspace.hidden = true;
    navigation.hidden = true;
    login.hidden = false;
    element('bo-logout').hidden = true;
    loginForm.querySelector('fieldset')!.disabled = false;
  }
  async function api<T>(chemin: string, method = 'GET', corps?: unknown): Promise<T> {
    const controleur = new AbortController();
    const minuterie = window.setTimeout(() => controleur.abort(), 20_000);
    try {
      const headers: Record<string, string> = { Accept: 'application/json' };
      if (method !== 'GET') headers['X-Backoffice-Request'] = '1';
      if (corps !== undefined) headers['Content-Type'] = 'application/json';
      const reponse = await fetch(`/api/backoffice${chemin}`, {
        method, headers, credentials: 'same-origin', cache: 'no-store',
        ...(corps !== undefined ? { body: JSON.stringify(corps) } : {}), signal: controleur.signal,
      });
      const contenu = await reponse.json().catch(() => ({})) as { message?: string; code?: string };
      if (!reponse.ok) {
        if (reponse.status === 401 && (authenticated || (challenge && contenu.code === 'CHALLENGE_EXPIRED'))) {
          const draft = blog?.hasUnsavedChanges();
          retourConnexion(true);
          annoncer(draft ? 'La session a expiré. Reconnectez-vous pour retrouver votre rédaction conservée dans cet onglet.' : 'La session a expiré. Connectez-vous à nouveau.', 'error');
        }
        throw new ErreurApi(
          typeof contenu.message === 'string' && contenu.message
            ? contenu.message
            : reponse.status === 401 ? 'La session a expiré. Connectez-vous à nouveau.' : 'La demande n’a pas abouti. Réessayez dans un instant.',
          reponse.status,
          contenu.code,
        );
      }
      return contenu as T;
    } finally {
      window.clearTimeout(minuterie);
    }
  }
  /** Une erreur dans sa zone, ou dans le retour de session si cette zone n’est plus affichée. */
  function erreur(cause: unknown, zone: HTMLElement = notice): void {
    afficher(visible(zone) ? zone : notice, messageDe(cause), 'error');
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
    texte('bo-confirm-title', titre);
    texte('bo-confirm-message', message);
    element('bo-confirm-code').replaceChildren(...(commande ? commande.split(' ') : []).flatMap((mot, rang) => [...(rang ? [' '] : []), creer('span', 'bo-commande__mot', mot)]));
    element('bo-confirm-code').parentElement!.hidden = !commande;
    texte('bo-confirm-submit', libelle);
    confirm.returnValue = '';
    confirm.showModal();
    return new Promise((resolve) => {
      confirm.addEventListener('close', () => resolve(confirm.returnValue === 'confirm'), { once: true });
    });
  }
  /** Un bouton de ligne : le libellé visible, puis l’élément visé pour les lecteurs d’écran. */
  function bouton(libelle: string, nomAccessible: string, operation: (bouton: HTMLButtonElement) => Promise<void> | void, classe = ''): HTMLButtonElement {
    const noeud = creer('button', `bo-button bo-button--petit${classe ? ` ${classe}` : ''}`, libelle);
    noeud.type = 'button';
    noeud.append(creer('span', 'sr', ` ${nomAccessible}`));
    noeud.addEventListener('click', () => { void operation(noeud); });
    return noeud;
  }

  const acces = brancherAccesMcp({
    api,
    action: (cible, operation, attente) => action(cible, operation, attente),
    afficher,
    confirmer: demanderConfirmation,
    estConnecte: () => authenticated,
    estVisible: () => activePanel === 'tokens' && !workspace.hidden,
    date,
  });

  function statutDe(statut: Statut): HTMLSpanElement {
    const noeud = creer('span', 'bo-state', statuts[statut] ?? statut);
    noeud.dataset.state = statut;
    return noeud;
  }
  function afficherDemande(demande?: Demande, focus = false): void {
    selected = demande;
    for (const ligne of document.querySelectorAll<HTMLElement>('[data-contact-id]')) {
      ligne.setAttribute('aria-pressed', String(Number(ligne.dataset.contactId) === demande?.id));
    }
    texte('bo-contact-title', demande?.subject ?? 'Choisissez une demande');
    element('bo-detail-placeholder').hidden = Boolean(demande);
    element('bo-contact-detail').hidden = !demande;
    // La demande ouverte est la zone éclairée de l’écran.
    element('bo-contact-article').classList.toggle('foyer', Boolean(demande));
    if (!demande) return;
    texte('bo-contact-name', demande.name);
    const email = element<HTMLAnchorElement>('bo-contact-email');
    email.textContent = demande.email;
    email.href = `mailto:${encodeURIComponent(demande.email)}`;
    texte('bo-contact-date', date(demande.created_at));
    element('bo-contact-state').replaceChildren(statutDe(demande.status));
    texte('bo-contact-delivery', livraisons[demande.delivery_status] ?? demande.delivery_status);
    texte('bo-contact-message', demande.message);
    element('bo-contact-read').hidden = demande.status === 'read';
    element('bo-contact-new').hidden = demande.status === 'new';
    element('bo-contact-archive').hidden = demande.status === 'archived';
    if (focus) {
      const titre = element('bo-contact-title');
      titre.tabIndex = -1;
      titre.focus({ preventScroll: true });
      if (window.matchMedia('(max-width: 1100px)').matches) titre.scrollIntoView({ block: 'start', behavior: 'instant' });
    }
  }
  function afficherBoite(boite: Boite): void {
    contacts = boite.contacts;
    total = boite.total;
    const nouvelles = boite.new_count;
    const compteur = element('bo-new-count');
    compteur.textContent = String(nouvelles);
    compteur.dataset.nombre = String(nouvelles);
    texte('bo-new-count-label', nouvelles === 0 ? ' (aucune nouvelle demande)' : ` (${nouvelles} nouvelle${nouvelles > 1 ? 's' : ''} demande${nouvelles > 1 ? 's' : ''})`);
    texte('bo-total', `${total} demande${total > 1 ? 's' : ''}`);
    const liste = element('bo-contact-list');
    liste.replaceChildren(...contacts.map((demande) => {
      const item = creer('li');
      const ligne = creer('button', 'bo-contact-row');
      ligne.type = 'button';
      ligne.dataset.contactId = String(demande.id);
      ligne.setAttribute('aria-pressed', String(selected?.id === demande.id));
      ligne.append(creer('strong', '', demande.subject), creer('span', 'bo-row-person', demande.name));
      const metadonnees = creer('span', 'bo-row-meta');
      const moment = creer('time', 'bo-row-date', date(demande.created_at));
      moment.dateTime = demande.created_at;
      metadonnees.append(statutDe(demande.status), moment);
      ligne.append(metadonnees);
      ligne.addEventListener('click', () => afficherDemande(demande, true));
      item.append(ligne);
      return item;
    }));
    element('bo-contact-empty').hidden = contacts.length > 0;
    texte('bo-contact-empty', filter.value === 'new'
      ? 'Aucune nouvelle demande. Les autres messages restent accessibles dans les filtres.'
      : 'Aucune demande dans ce filtre.');
    element('bo-pagination').hidden = total <= limit;
    element<HTMLButtonElement>('bo-previous').disabled = offset === 0;
    element<HTMLButtonElement>('bo-next').disabled = offset + limit >= total;
    texte('bo-page', `${Math.floor(offset / limit) + 1} / ${Math.max(1, Math.ceil(total / limit))}`);
    afficherDemande(contacts.find((demande) => demande.id === selected?.id));
  }
  async function chargerDemandes(): Promise<void> {
    const sequence = ++requestSequence;
    const rubrique = filter.value as Filtre;
    const boite = await api<Boite>(`/contacts?status=${rubrique}&limit=${limit}&offset=${offset}`);
    if (!authenticated || sequence !== requestSequence) return;
    if (!boite.contacts.length && offset > 0) {
      offset = Math.max(0, offset - limit);
      await chargerDemandes();
      return;
    }
    afficherBoite(boite);
  }
  async function changerStatut(cible: HTMLButtonElement, statut: Statut): Promise<void> {
    if (!selected) return;
    const id = selected.id;
    await action(cible, async (dire) => {
      await api(`/contacts/${id}`, 'PATCH', { status: statut });
      await chargerDemandes();
      dire(statut === 'read' ? 'La demande est marquée comme lue.' : statut === 'new' ? 'La demande est marquée comme nouvelle.' : 'La demande est archivée.');
    }, 'Mise à jour de la demande…');
  }

  function adresseWeb(valeur: string): string | undefined {
    try {
      const url = new URL(valeur);
      if (url.protocol === 'https:' || url.protocol === 'http:') return url.href;
    } catch { /* Une adresse invalide n’est jamais rendue comme lien. */ }
    return undefined;
  }
  async function chargerOutils(): Promise<void> {
    const reponse = await api<{ links: Outil[] }>('/links');
    if (!authenticated) return;
    links = reponse.links;
    element('bo-links-empty').hidden = links.length > 0;
    element('bo-link-list').replaceChildren(...links.map((outil) => {
      const item = creer('li', 'bo-tool');
      const titre = creer('h3');
      const url = adresseWeb(outil.url);
      if (url) {
        const lien = creer('a', '', outil.label);
        lien.href = url;
        lien.target = '_blank';
        lien.rel = 'noopener noreferrer';
        lien.setAttribute('aria-label', `${outil.label}, ouvrir dans un nouvel onglet`);
        const fleche = creer('span', 'fleche', `${NBSP}↗`);
        fleche.setAttribute('aria-hidden', 'true');
        lien.append(fleche);
        titre.append(lien);
      } else titre.textContent = outil.label;
      item.append(titre);
      if (outil.description) item.append(creer('p', '', outil.description));
      const actions = creer('div', 'bo-actions');
      actions.append(bouton('Modifier', outil.label, () => {
        editingLink = outil.id;
        element<HTMLInputElement>('bo-link-label').value = outil.label;
        element<HTMLInputElement>('bo-link-url').value = outil.url;
        element<HTMLInputElement>('bo-link-description').value = outil.description;
        texte('bo-link-form-title', 'Modifier l’outil');
        texte('bo-link-submit', 'Enregistrer l’outil');
        element('bo-link-cancel').hidden = false;
        element('bo-link-label').focus();
      }), bouton('Supprimer', outil.label, async (cible) => {
        const accord = await demanderConfirmation('Supprimer ce raccourci ?', `Le lien vers ${outil.label} sera supprimé de la boîte à outils.`, 'Supprimer le raccourci');
        if (!accord) return;
        await action(cible, async (dire) => {
          await api(`/links/${outil.id}`, 'DELETE');
          if (editingLink === outil.id) resetLinkForm();
          await chargerOutils();
          dire(`Le raccourci vers ${outil.label} est supprimé.`);
        }, 'Suppression du raccourci…');
      }, 'bo-button--danger'));
      item.append(actions);
      return item;
    }));
  }
  async function ouvrirWorkspace(): Promise<void> {
    const sequence = authSequence;
    const session = await api<Session>('/session');
    if (sequence !== authSequence) return;
    if (!session.authenticated) { retourConnexion(); notice.hidden = true; return; }
    authenticated = true;
    challenge = false;
    effacerDeuxFacteurs();
    effacerCodesSecours();
    password.value = '';
    login.hidden = true;
    workspace.hidden = false;
    navigation.hidden = false;
    element('bo-logout').hidden = false;
    element('bo-smtp-warning').hidden = session.smtp_configured;
    const reglages = await api<{ email: string }>('/settings');
    if (!authenticated || sequence !== authSequence) return;
    element<HTMLInputElement>('bo-email').value = reglages.email;
    await Promise.all([chargerDemandes(), chargerOutils(), acces.charger()]);
    if (authenticated) {
      blog?.restoreDraft();
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
    challenge = true;
    enrollment = inscription;
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
    if (inscription) {
      // L’échec de la préparation se dit sur l’écran de vérification, à côté de « Réessayer ».
      try { await preparerDeuxFacteurs(); } catch (cause) { erreur(cause, element('bo-two-factor-retour')); }
    } else { twoFactorForm.querySelector('fieldset')!.disabled = false; notice.hidden = true; twoFactorCode.focus(); }
  }
  function afficherCodesSecours(codes: string[]): void {
    authenticated = true;
    challenge = false;
    effacerDeuxFacteurs();
    element('bo-recovery-codes').replaceChildren(...codes.map((code) => {
      const item = creer('li');
      item.append(creer('code', '', code));
      return item;
    }));
    recovery.hidden = false;
    element('bo-logout').hidden = false;
    notice.hidden = true;
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
      else if (connexion.authenticated) { await ouvrirWorkspace(); focaliserRubrique(); }
      else throw new ErreurApi('La connexion n’a pas abouti. Réessayez.', 502);
    }, 'Connexion…');
  });
  twoFactorForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const code = twoFactorCode.value.trim();
    const sequence = authSequence;
    void action(twoFactorForm, async () => {
      const connexion = await api<Connexion>('/2fa/verify', 'POST', { code });
      if (!challenge || sequence !== authSequence) return;
      twoFactorCode.value = '';
      if (!connexion.authenticated) throw new ErreurApi('Le code n’a pas pu être vérifié. Réessayez.', 502);
      authenticated = true;
      if (enrollment && connexion.recovery_codes?.length) afficherCodesSecours(connexion.recovery_codes);
      else { await ouvrirWorkspace(); focaliserRubrique(); }
    }, enrollment ? 'Activation de la vérification…' : 'Vérification du code…');
  });
  element('bo-two-factor-back').addEventListener('click', () => { retourConnexion(); notice.hidden = true; loginEmail.focus(); });
  element('bo-two-factor-retry').addEventListener('click', (event) => {
    void action(event.currentTarget as HTMLButtonElement, preparerDeuxFacteurs, 'Préparation de la configuration…');
  });
  element('bo-recovery-continue').addEventListener('click', (event) => {
    void action(event.currentTarget as HTMLButtonElement, async () => {
      effacerCodesSecours();
      await ouvrirWorkspace();
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
        retourConnexion();
        annoncer('Vous êtes déconnecté.');
        loginEmail.focus();
      }, 'Déconnexion…', notice);
    })();
  });
  filter.addEventListener('change', () => {
    offset = 0;
    void chargerDemandes().catch((cause: unknown) => erreur(cause, element('bo-inbox-retour')));
  });
  element<HTMLButtonElement>('bo-refresh').addEventListener('click', (event) => {
    void action(event.currentTarget as HTMLButtonElement, async (dire) => {
      await chargerDemandes();
      dire('Les demandes sont à jour.');
    }, 'Actualisation des demandes…');
  });
  for (const [id, sens] of [['bo-previous', -1], ['bo-next', 1]] as const) {
    element(id).addEventListener('click', () => {
      offset = Math.max(0, offset + sens * limit);
      void chargerDemandes().catch((cause: unknown) => erreur(cause, element('bo-inbox-retour')));
    });
  }
  for (const [id, statut] of [['bo-contact-read', 'read'], ['bo-contact-new', 'new'], ['bo-contact-archive', 'archived']] as const) {
    element<HTMLButtonElement>(id).addEventListener('click', (event) => { void changerStatut(event.currentTarget as HTMLButtonElement, statut); });
  }
  element<HTMLButtonElement>('bo-contact-delete').addEventListener('click', async (event) => {
    if (!selected) return;
    const id = selected.id;
    const cible = event.currentTarget as HTMLButtonElement;
    const accord = await demanderConfirmation('Supprimer cette demande ?', `Le message «${NBSP}${selected.subject}${NBSP}» et ses coordonnées seront supprimés définitivement du backoffice.`, 'Supprimer définitivement');
    if (!accord) return;
    await action(cible, async (dire) => {
      await api(`/contacts/${id}`, 'DELETE');
      await chargerDemandes();
      dire('La demande est supprimée.');
      const titre = element('bo-contact-title');
      titre.tabIndex = -1;
      titre.focus();
    }, 'Suppression de la demande…');
  });
  const settingsForm = element<HTMLFormElement>('bo-settings-form');
  settingsForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = element<HTMLInputElement>('bo-email').value.trim();
    void action(settingsForm, async (dire) => {
      await api('/settings', 'PUT', { email });
      dire('L’adresse de contact est enregistrée.');
    }, 'Enregistrement de l’adresse…');
  });
  const linkForm = element<HTMLFormElement>('bo-link-form');
  linkForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const url = element<HTMLInputElement>('bo-link-url').value.trim();
    if (!adresseWeb(url)) { afficher(element('bo-links-retour'), 'Saisissez une adresse commençant par https:// ou http://.', 'error'); element('bo-link-url').focus(); return; }
    const corps = {
      label: element<HTMLInputElement>('bo-link-label').value.trim(), url,
      description: element<HTMLInputElement>('bo-link-description').value.trim(),
    };
    const id = editingLink;
    void action(linkForm, async (dire) => {
      await api(id === undefined ? '/links' : `/links/${id}`, id === undefined ? 'POST' : 'PUT', corps);
      resetLinkForm();
      await chargerOutils();
      dire(id === undefined ? 'L’outil est ajouté.' : 'L’outil est enregistré.');
    }, 'Enregistrement de l’outil…');
  });
  element('bo-link-cancel').addEventListener('click', resetLinkForm);
  for (const suggestion of document.querySelectorAll<HTMLButtonElement>('[data-suggest]')) {
    suggestion.addEventListener('click', () => {
      resetLinkForm();
      element<HTMLInputElement>('bo-link-label').value = suggestion.dataset.suggest ?? '';
      element('bo-link-url').focus();
    });
  }
  function verifierSession(): void {
    const sequence = authSequence;
    void ouvrirWorkspace().catch((cause: unknown) => {
      if (sequence !== authSequence) return;
      if (cause instanceof ErreurApi && cause.status === 401) {
        retourConnexion();
        notice.hidden = true;
      } else {
        loginForm.querySelector('fieldset')!.disabled = false;
        erreur(cause);
      }
    });
  }
  window.addEventListener('pagehide', () => retourConnexion());
  window.addEventListener('pageshow', (event) => { if (event.persisted) verifierSession(); });
  verifierSession();
}
