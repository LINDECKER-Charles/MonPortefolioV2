/** Demandes, outils et destinataire : chargés uniquement après validation de la session.
 * La coque conserve API, actions, confirmations et décision d’accès. */
import type { Dire, Etat } from './backoffice-commun';

interface ContexteConsultation {
  api: <T>(chemin: string, method?: string, corps?: unknown) => Promise<T>;
  action: (cible: HTMLElement, operation: (dire: Dire) => Promise<void>, attente: string) => Promise<void>;
  afficher: (zone: HTMLElement, message: string, etat?: Etat) => void;
  erreur: (cause: unknown, zone?: HTMLElement) => void;
  confirmer: (titre: string, message: string, libelle: string) => Promise<boolean>;
  estConnecte: () => boolean;
  date: (valeur: string) => string;
  destinataire: (email: string) => void;
}
export interface RubriquesConsultation {
  charger: () => Promise<void>;
  reinitialiser: () => void;
}

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
const NBSP = ' ';

export function brancherConsultation(contexte: ContexteConsultation): RubriquesConsultation {
  const { api, action, afficher, erreur, confirmer: demanderConfirmation, estConnecte, date, destinataire } = contexte;
  const element = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
  const texte = (id: string, valeur: string) => { element(id).textContent = valeur; };
  const creer = <K extends keyof HTMLElementTagNameMap>(balise: K, classe = '', contenu?: string) => {
    const noeud = document.createElement(balise);
    if (classe) noeud.className = classe;
    if (contenu !== undefined) noeud.textContent = contenu;
    return noeud;
  };
  const filter = element<HTMLSelectElement>('bo-filter');
  const statuts: Record<Statut, string> = { new: 'Nouvelle', read: 'Lue', archived: 'Archivée' };
  const livraisons: Record<Demande['delivery_status'], string> = {
    pending: 'En cours', sent: 'Envoyée', failed: 'Échec de l’envoi', unconfigured: 'Désactivée',
  };
  let contacts: Demande[] = [];
  let selected: Demande | undefined;
  let links: Outil[] = [];
  let editingLink: number | undefined;
  let offset = 0;
  let total = 0;
  let requestSequence = 0;
  const limit = 50;

  function resetLinkForm(): void {
    editingLink = undefined;
    element<HTMLFormElement>('bo-link-form').reset();
    texte('bo-link-form-title', 'Ajouter un outil');
    texte('bo-link-submit', 'Ajouter l’outil');
    element('bo-link-cancel').hidden = true;
  }
  /** Un bouton de ligne : le libellé visible, puis l’élément visé pour les lecteurs d’écran. */
  function bouton(libelle: string, nomAccessible: string, operation: (bouton: HTMLButtonElement) => Promise<void> | void, classe = ''): HTMLButtonElement {
    const noeud = creer('button', `bo-button bo-button--petit${classe ? ` ${classe}` : ''}`, libelle);
    noeud.type = 'button';
    noeud.append(creer('span', 'sr', ` ${nomAccessible}`));
    noeud.addEventListener('click', () => { void operation(noeud); });
    return noeud;
  }

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
    if (!estConnecte() || sequence !== requestSequence) return;
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
    if (!estConnecte()) return;
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
      destinataire(email);
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
  return {
    async charger(): Promise<void> { await Promise.all([chargerDemandes(), chargerOutils()]); },
    reinitialiser(): void {
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
    },
  };
}
