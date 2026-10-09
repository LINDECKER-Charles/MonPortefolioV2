/** Espace privé. Les textes reçus de l’API sont toujours insérés comme texte. */
import type { BlogWorkspace } from './blog-editor';
type Statut = 'new' | 'read' | 'archived';
type Filtre = Statut | 'all';
type Rubrique = 'contacts' | 'settings' | 'links' | 'tokens' | 'blog';
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
interface Jeton { id: number; name: string; created_at: string; last_used_at: string | null; scopes?: string[] }
interface Boite { contacts: Demande[]; total: number; new_count: number }
interface Session { authenticated: boolean; smtp_configured: boolean }
interface Connexion extends Partial<Session> { two_factor_required?: boolean; enrollment_required?: boolean; recovery_codes?: string[] }
interface ConfigurationDeuxFacteurs { secret: string; otpauth_url: string; qr_code_data_url: string }
class ErreurApi extends Error {
  constructor(message: string, readonly status: number, readonly code?: string) { super(message); }
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
  const loginForm = element<HTMLFormElement>('bo-login-form');
  const password = element<HTMLInputElement>('bo-password');
  const loginEmail = element<HTMLInputElement>('bo-login-email');
  const twoFactor = element('bo-two-factor');
  const twoFactorForm = element<HTMLFormElement>('bo-two-factor-form');
  const twoFactorCode = element<HTMLInputElement>('bo-two-factor-code');
  const recovery = element('bo-recovery');
  const filter = element<HTMLSelectElement>('bo-filter');
  const notice = element('bo-notice');
  const tabs = [...document.querySelectorAll<HTMLButtonElement>('[data-panel]')];
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
  let tokens: Jeton[] = [];
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

  function annoncer(message: string, etat: 'pending' | 'success' | 'error' = 'success'): void {
    notice.textContent = message;
    notice.dataset.state = etat;
    notice.hidden = false;
  }
  function date(valeur: string): string {
    const instant = new Date(valeur);
    return Number.isNaN(instant.getTime()) ? 'Date inconnue' : dates.format(instant);
  }
  function cacherSecret(): void {
    element<HTMLInputElement>('bo-token-secret').value = '';
    element('bo-secret').hidden = true;
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
  function choisirRubrique(rubrique: Rubrique, focus = false): void {
    if (activePanel === 'tokens' && rubrique !== 'tokens') cacherSecret();
    activePanel = rubrique;
    for (const tab of tabs) {
      const active = tab.dataset.panel === rubrique;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      element(`bo-panel-${tab.dataset.panel}`).hidden = !active;
      if (active && focus) tab.focus();
    }
    if (rubrique === 'blog' && authenticated) document.body.dataset.blogWorkspace = 'true';
    else delete document.body.dataset.blogWorkspace;
    document.body.dataset.backofficePage = rubrique === 'blog' ? 'blog' : 'home';
    if (rubrique !== 'blog') document.title = `${{ contacts: 'Demandes', settings: 'Destinataire', links: 'Boîte à outils', tokens: 'Accès MCP' }[rubrique]} — Backoffice`;
  }
  function rubriqueURL(value: string): Rubrique {
    const url = new URL(value, window.location.origin);
    if (/^\/backoffice\/blog(?:\/|$)/.test(url.pathname)) return 'blog';
    const rubrique = url.searchParams.get('rubrique');
    return rubrique && ['contacts', 'settings', 'links', 'tokens', 'blog'].includes(rubrique) ? rubrique as Rubrique : 'contacts';
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
    choisirRubrique(rubrique);
    if (rubrique === 'blog' && authenticated) {
      await chargerBlog();
      if (authenticated) await blog?.open(destination);
    }
  }
  function naviguer(value: string, replace = false): Promise<void> {
    const operation = navigationQueue.then(() => appliquerRoute(value, replace));
    navigationQueue = operation.catch(erreur);
    return navigationQueue;
  }
  function allerRubrique(rubrique: Rubrique, focus = false): void {
    const url = rubrique === 'blog' ? '/backoffice/blog' : `/backoffice?rubrique=${rubrique}`;
    void naviguer(url).then(() => { if (focus && activePanel === rubrique) tabs.find((tab) => tab.dataset.panel === rubrique)?.focus(); });
  }
  window.addEventListener('popstate', (event) => {
    if (restoringHistory) { restoringHistory = false; return; }
    const destination = `${window.location.pathname}${window.location.search}`;
    const position = typeof event.state?.backofficeIndex === 'number' ? event.state.backofficeIndex : historyPosition;
    const operation = navigationQueue.then(() => appliquerRoute(destination, false, position));
    navigationQueue = operation.catch(erreur);
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
    tokens = [];
    selected = undefined;
    offset = 0;
    total = 0;
    filter.value = 'new';
    for (const id of ['bo-contact-list', 'bo-link-list', 'bo-token-list']) element(id).replaceChildren();
    for (const id of ['bo-contact-name', 'bo-contact-email', 'bo-contact-date', 'bo-contact-state', 'bo-contact-delivery', 'bo-contact-message']) texte(id, '');
    element('bo-contact-email').removeAttribute('href');
    element('bo-contact-detail').hidden = true;
    texte('bo-contact-title', 'Choisissez une demande');
    element('bo-detail-placeholder').hidden = false;
    element<HTMLFormElement>('bo-settings-form').reset();
    element<HTMLFormElement>('bo-token-form').reset();
    resetLinkForm();
    cacherSecret();
    choisirRubrique('contacts');
    workspace.hidden = true;
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
  function erreur(cause: unknown): void {
    annoncer(cause instanceof ErreurApi ? cause.message : 'Le backoffice est injoignable. Vérifiez la connexion puis réessayez.', 'error');
  }
  async function action(cible: HTMLElement, operation: () => Promise<void>, attente: string): Promise<void> {
    if (cible.dataset.busy === 'true') return;
    const execution = String(++actionSequence);
    cible.dataset.execution = execution;
    cible.dataset.busy = 'true';
    cible.setAttribute('aria-busy', 'true');
    const controle = cible instanceof HTMLFormElement ? cible.querySelector('fieldset') : cible instanceof HTMLButtonElement ? cible : null;
    if (controle) controle.disabled = true;
    annoncer(attente, 'pending');
    try { await operation(); } catch (cause) { erreur(cause); }
    finally {
      if (cible.dataset.execution === execution) {
        delete cible.dataset.busy;
        delete cible.dataset.execution;
        cible.removeAttribute('aria-busy');
        if (controle) controle.disabled = false;
      }
    }
  }
  function demanderConfirmation(titre: string, message: string, libelle: string): Promise<boolean> {
    texte('bo-confirm-title', titre);
    texte('bo-confirm-message', message);
    texte('bo-confirm-submit', libelle);
    confirm.returnValue = '';
    confirm.showModal();
    return new Promise((resolve) => {
      confirm.addEventListener('close', () => resolve(confirm.returnValue === 'confirm'), { once: true });
    });
  }
  function bouton(libelle: string, operation: (bouton: HTMLButtonElement) => Promise<void> | void, danger = false): HTMLButtonElement {
    const noeud = creer('button', `bo-button${danger ? ' bo-button--danger' : ''}`, libelle);
    noeud.type = 'button';
    noeud.addEventListener('click', () => { void operation(noeud); });
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
    if (!demande) return;
    texte('bo-contact-name', demande.name);
    const email = element<HTMLAnchorElement>('bo-contact-email');
    email.textContent = demande.email;
    email.href = `mailto:${encodeURIComponent(demande.email)}`;
    texte('bo-contact-date', date(demande.created_at));
    texte('bo-contact-state', statuts[demande.status] ?? demande.status);
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
    const compteur = element('bo-new-count');
    compteur.textContent = String(boite.new_count);
    compteur.setAttribute('aria-label', `${boite.new_count} nouvelle${boite.new_count > 1 ? 's' : ''} demande${boite.new_count > 1 ? 's' : ''}`);
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
      const statut = creer('span', 'bo-state', statuts[demande.status] ?? demande.status);
      statut.dataset.state = demande.status;
      const moment = creer('time', 'bo-row-date', date(demande.created_at));
      moment.dateTime = demande.created_at;
      metadonnees.append(statut, moment);
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
    await action(cible, async () => {
      await api(`/contacts/${id}`, 'PATCH', { status: statut });
      await chargerDemandes();
      annoncer(statut === 'read' ? 'La demande est marquée comme lue.' : statut === 'new' ? 'La demande est marquée comme nouvelle.' : 'La demande est archivée.');
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
        titre.append(lien);
      } else titre.textContent = outil.label;
      item.append(titre);
      if (outil.description) item.append(creer('p', '', outil.description));
      const actions = creer('div', 'bo-actions');
      actions.append(bouton('Modifier', () => {
        editingLink = outil.id;
        element<HTMLInputElement>('bo-link-label').value = outil.label;
        element<HTMLInputElement>('bo-link-url').value = outil.url;
        element<HTMLInputElement>('bo-link-description').value = outil.description;
        texte('bo-link-form-title', 'Modifier l’outil');
        texte('bo-link-submit', 'Enregistrer l’outil');
        element('bo-link-cancel').hidden = false;
        element('bo-link-label').focus();
      }), bouton('Supprimer', async (cible) => {
        const accord = await demanderConfirmation('Supprimer ce raccourci ?', `Le lien vers ${outil.label} sera supprimé de la boîte à outils.`, 'Supprimer le raccourci');
        if (!accord) return;
        await action(cible, async () => {
          await api(`/links/${outil.id}`, 'DELETE');
          if (editingLink === outil.id) resetLinkForm();
          await chargerOutils();
          annoncer('Le raccourci est supprimé.');
        }, 'Suppression du raccourci…');
      }, true));
      item.append(actions);
      return item;
    }));
  }
  async function chargerJetons(): Promise<void> {
    const reponse = await api<{ tokens: Jeton[] }>('/tokens');
    if (!authenticated) return;
    tokens = reponse.tokens;
    element('bo-tokens-empty').hidden = tokens.length > 0;
    element('bo-token-list').replaceChildren(...tokens.map((jeton) => {
      const item = creer('li', 'bo-token');
      const informations = creer('div');
      informations.append(creer('h3', '', jeton.name), creer('p', '', `Créé le ${date(jeton.created_at)}`), creer('p', '', jeton.last_used_at ? `Dernier accès le ${date(jeton.last_used_at)}` : 'Pas encore utilisé'));
      informations.append(creer('p', '', jeton.scopes?.includes('blog:publish') ? 'Blog : rédaction et publication' : jeton.scopes?.includes('blog:write') ? 'Blog : rédaction et images' : 'Lecture seule'));
      item.append(informations, bouton('Révoquer', async (cible) => {
        const accord = await demanderConfirmation('Révoquer cet accès ?', `La connexion ${jeton.name} ne pourra plus consulter les demandes avec ce jeton.`, 'Révoquer l’accès');
        if (!accord) return;
        await action(cible, async () => {
          await api(`/tokens/${jeton.id}`, 'DELETE');
          cacherSecret();
          await chargerJetons();
          annoncer('L’accès MCP est révoqué.');
        }, 'Révocation de l’accès…');
      }, true));
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
    element('bo-logout').hidden = false;
    element('bo-smtp-warning').hidden = session.smtp_configured;
    texte('bo-mcp-url', `${window.location.origin}/mcp`);
    const reglages = await api<{ email: string }>('/settings');
    if (!authenticated || sequence !== authSequence) return;
    element<HTMLInputElement>('bo-email').value = reglages.email;
    await Promise.all([chargerDemandes(), chargerOutils(), chargerJetons()]);
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
    if (inscription) await preparerDeuxFacteurs();
    else { twoFactorForm.querySelector('fieldset')!.disabled = false; notice.hidden = true; twoFactorCode.focus(); }
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

  for (const tab of tabs) {
    tab.addEventListener('click', (event) => { event.preventDefault(); allerRubrique(tab.dataset.panel as Rubrique); });
    tab.addEventListener('keydown', (event) => {
      const index = tabs.indexOf(tab);
      let destination: number | undefined;
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') destination = (index + 1) % tabs.length;
      else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') destination = (index + tabs.length - 1) % tabs.length;
      else if (event.key === 'Home') destination = 0;
      else if (event.key === 'End') destination = tabs.length - 1;
      if (destination !== undefined) { event.preventDefault(); allerRubrique(tabs[destination]!.dataset.panel as Rubrique, true); }
    });
  }
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const sequence = authSequence;
    void action(loginForm, async () => {
      const connexion = await api<Connexion>('/login', 'POST', { email: loginEmail.value.trim(), password: password.value });
      if (sequence !== authSequence) return;
      password.value = '';
      if (connexion.two_factor_required) await afficherDeuxFacteurs(Boolean(connexion.enrollment_required));
      else if (connexion.authenticated) { await ouvrirWorkspace(); if (authenticated && activePanel !== 'blog') tabs.find((tab) => tab.dataset.panel === activePanel)?.focus(); }
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
      else { await ouvrirWorkspace(); if (authenticated && activePanel !== 'blog') tabs.find((tab) => tab.dataset.panel === activePanel)?.focus(); }
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
      if (authenticated && activePanel !== 'blog') tabs.find((tab) => tab.dataset.panel === activePanel)?.focus();
    }, 'Ouverture de l’atelier…');
  });
  element('bo-recovery-copy').addEventListener('click', (event) => {
    void action(event.currentTarget as HTMLButtonElement, async () => {
      try {
        await navigator.clipboard.writeText([...element('bo-recovery-codes').querySelectorAll('code')].map((code) => code.textContent).join('\n'));
        annoncer('Les codes de secours sont copiés. Conservez-les dans un endroit sûr.');
      } catch { annoncer('La copie est indisponible. Sélectionnez les codes et copiez-les manuellement.', 'error'); }
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
      }, 'Déconnexion…');
    })();
  });
  filter.addEventListener('change', () => {
    offset = 0;
    void chargerDemandes().catch(erreur);
  });
  element<HTMLButtonElement>('bo-refresh').addEventListener('click', (event) => {
    void action(event.currentTarget as HTMLButtonElement, async () => {
      await chargerDemandes();
      annoncer('Les demandes sont à jour.');
    }, 'Actualisation des demandes…');
  });
  for (const [id, sens] of [['bo-previous', -1], ['bo-next', 1]] as const) {
    element(id).addEventListener('click', () => { offset = Math.max(0, offset + sens * limit); void chargerDemandes().catch(erreur); });
  }
  for (const [id, statut] of [['bo-contact-read', 'read'], ['bo-contact-new', 'new'], ['bo-contact-archive', 'archived']] as const) {
    element<HTMLButtonElement>(id).addEventListener('click', (event) => { void changerStatut(event.currentTarget as HTMLButtonElement, statut); });
  }
  element<HTMLButtonElement>('bo-contact-delete').addEventListener('click', async (event) => {
    if (!selected) return;
    const id = selected.id;
    const cible = event.currentTarget as HTMLButtonElement;
    const accord = await demanderConfirmation('Supprimer cette demande ?', `Le message « ${selected.subject} » et ses coordonnées seront supprimés définitivement du backoffice.`, 'Supprimer définitivement');
    if (!accord) return;
    await action(cible, async () => {
      await api(`/contacts/${id}`, 'DELETE');
      await chargerDemandes();
      annoncer('La demande est supprimée.');
      element('bo-filter').focus();
    }, 'Suppression de la demande…');
  });
  const settingsForm = element<HTMLFormElement>('bo-settings-form');
  settingsForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = element<HTMLInputElement>('bo-email').value.trim();
    void action(settingsForm, async () => {
      await api('/settings', 'PUT', { email });
      annoncer('L’adresse de contact est enregistrée.');
    }, 'Enregistrement de l’adresse…');
  });
  const linkForm = element<HTMLFormElement>('bo-link-form');
  linkForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const url = element<HTMLInputElement>('bo-link-url').value.trim();
    if (!adresseWeb(url)) { annoncer('Saisissez une adresse commençant par https:// ou http://.', 'error'); element('bo-link-url').focus(); return; }
    const corps = {
      label: element<HTMLInputElement>('bo-link-label').value.trim(), url,
      description: element<HTMLInputElement>('bo-link-description').value.trim(),
    };
    const id = editingLink;
    void action(linkForm, async () => {
      await api(id === undefined ? '/links' : `/links/${id}`, id === undefined ? 'POST' : 'PUT', corps);
      resetLinkForm();
      await chargerOutils();
      annoncer(id === undefined ? 'L’outil est ajouté.' : 'L’outil est enregistré.');
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
  const tokenForm = element<HTMLFormElement>('bo-token-form');
  tokenForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = element<HTMLInputElement>('bo-token-name').value.trim();
    const permission = element<HTMLSelectElement>('bo-token-permissions').value;
    const scopes = ['contacts:read', 'blog:read', ...(permission === 'write' || permission === 'publish' ? ['blog:write'] : []), ...(permission === 'publish' ? ['blog:publish'] : [])];
    void action(tokenForm, async () => {
      cacherSecret();
      const jeton = await api<{ token: string }>('/tokens', 'POST', { name, scopes });
      if (authenticated && activePanel === 'tokens') {
        element<HTMLInputElement>('bo-token-secret').value = jeton.token;
        element('bo-secret').hidden = false;
      }
      tokenForm.reset();
      await chargerJetons();
      if (activePanel === 'tokens') {
        annoncer('Le jeton est créé. Conservez-le avant de quitter cette rubrique.');
        element('bo-token-secret').focus();
      } else annoncer('Le jeton est créé. Son secret n’est plus affiché. Révoquez cet accès et recréez-le pour obtenir un nouveau jeton.');
    }, 'Création du jeton…');
  });
  element('bo-token-hide').addEventListener('click', () => { cacherSecret(); annoncer('Le jeton n’est plus affiché.'); });
  element<HTMLButtonElement>('bo-token-copy').addEventListener('click', (event) => {
    void action(event.currentTarget as HTMLButtonElement, async () => {
      try {
        await navigator.clipboard.writeText(element<HTMLInputElement>('bo-token-secret').value);
        annoncer('Le jeton est copié.');
      } catch { annoncer('La copie est indisponible. Sélectionnez le jeton et copiez-le manuellement.', 'error'); }
    }, 'Copie du jeton…');
  });
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
