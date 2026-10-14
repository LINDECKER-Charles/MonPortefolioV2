/**
 * Accès MCP (components/backoffice/RubriqueAccesMcp.astro) : créer un accès
 * en un geste, montrer son secret une seule fois dans la commande Claude
 * Code, vérifier qu’il répond, lister et révoquer les accès.
 *
 * Le secret ne vit que dans la carte éclairée : jamais en localStorage, dans
 * l’adresse ni dans un journal. `cacherSecret()` l’efface à « Terminé », en
 * quittant la rubrique, à la déconnexion, au `pagehide` et à l’expiration de
 * la session (scripts/backoffice.ts).
 *
 * « Vérifier l’accès » appelle /mcp depuis cette page avec le nouveau secret
 * (initialize, puis tools/list) : même origine, sans cookie, comme un client
 * MCP. Le serveur accepte l’en-tête Origin de cette page (backend/src/mcp.rs,
 * valid_origin) et la CSP l’autorise (`connect-src 'self'`). Cet appel compte
 * comme une utilisation de l’accès.
 *
 * Préréglages, libellés, nom de serveur et commande : lib/acces-mcp.ts.
 */
import {
  commandeClaudeCode,
  commandeRetrait,
  depuis,
  libellesPermissions,
  nomPropose,
  nomServeur,
  permissionsDe,
  PREREGLAGE_PAR_DEFAUT,
  type Prereglage,
} from '../lib/acces-mcp';
import { ErreurApi, type Dire, type Etat } from './backoffice-commun';

interface Acces { id: number; name: string; created_at: string; last_used_at: string | null; scopes?: string[] }
interface AccesCree { id: number; name: string; token: string; scopes: string[] }
interface OutilMcp { name: string; title?: string }

export interface ContexteAcces {
  api: <T>(chemin: string, method?: string, corps?: unknown) => Promise<T>;
  action: (cible: HTMLElement, operation: (dire: Dire) => Promise<void>, attente: string) => Promise<void>;
  afficher: (zone: HTMLElement, message: string, etat?: Etat) => void;
  confirmer: (titre: string, message: string, libelle: string) => Promise<boolean>;
  estConnecte: () => boolean;
  /** Vrai quand la rubrique des accès est affichée. */
  estVisible: () => boolean;
  /** Date et heure complètes, pour les infobulles. */
  date: (valeur: string) => string;
}

export interface RubriqueAcces {
  charger: () => Promise<void>;
  cacherSecret: () => void;
  reinitialiser: () => void;
}

const NBSP = ' ';
const DELAI_VERIFICATION = 15_000;
const jourCourt = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' });
const cite = (texte: string) => `«${NBSP}${texte}${NBSP}»`;
const liste = (mots: string[]) => (mots.length > 1 ? `${mots.slice(0, -1).join(', ')} et ${mots.at(-1)}` : mots[0] ?? '');

/** Un appel JSON-RPC au serveur MCP de ce site, avec le secret de l’accès. */
async function appelMcp<T>(secret: string, corps: Record<string, unknown>, signal: AbortSignal, version?: string): Promise<T> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${secret}`,
    'Content-Type': 'application/json',
    Accept: 'application/json, text/event-stream',
  };
  if (version) headers['MCP-Protocol-Version'] = version;
  let reponse: Response;
  try {
    reponse = await fetch('/mcp', { method: 'POST', headers, body: JSON.stringify({ jsonrpc: '2.0', ...corps }), credentials: 'omit', cache: 'no-store', signal });
  } catch {
    throw new ErreurApi('Le serveur MCP est injoignable. Vérifiez la connexion puis réessayez.', 0);
  }
  const contenu = await reponse.json().catch(() => ({})) as { result?: T; error?: { message?: string } };
  if (reponse.status === 401) throw new ErreurApi(`Le serveur MCP refuse ce secret${NBSP}: l’accès a sans doute été révoqué.`, 401);
  if (reponse.status === 403) throw new ErreurApi('Le serveur MCP refuse cette origine. Ouvrez le backoffice depuis l’adresse du site.', 403);
  if (reponse.status === 429) throw new ErreurApi('Trop d’appels MCP depuis cette adresse. Réessayez dans une minute.', 429);
  if (!reponse.ok || contenu.error || contenu.result === undefined) {
    throw new ErreurApi(`Le serveur MCP n’a pas répondu comme prévu (statut ${reponse.status}). Réessayez dans un instant.`, reponse.status);
  }
  return contenu.result;
}

/** Ce que verra un client MCP : la poignée de main, puis le catalogue d’outils ouvert par les permissions. */
async function outilsDisponibles(secret: string, signal: AbortSignal): Promise<OutilMcp[]> {
  const accueil = await appelMcp<{ protocolVersion?: string }>(secret, {
    id: 1,
    method: 'initialize',
    params: { protocolVersion: '2025-11-25', capabilities: {}, clientInfo: { name: 'backoffice-portfolio', version: '1.0.0' } },
  }, signal);
  const catalogue = await appelMcp<{ tools?: OutilMcp[] }>(secret, { id: 2, method: 'tools/list', params: {} }, signal, accueil.protocolVersion);
  return Array.isArray(catalogue.tools) ? catalogue.tools : [];
}

export function brancherAccesMcp(contexte: ContexteAcces): RubriqueAcces {
  const element = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
  const creer = <K extends keyof HTMLElementTagNameMap>(balise: K, classe = '', contenu?: string) => {
    const noeud = document.createElement(balise);
    if (classe) noeud.className = classe;
    if (contenu !== undefined) noeud.textContent = contenu;
    return noeud;
  };
  const rubrique = element('bo-panel-tokens');
  const formulaire = element<HTMLFormElement>('bo-token-form');
  const nom = element<HTMLInputElement>('bo-token-name');
  const demandes = element<HTMLInputElement>('bo-token-contacts');
  const carte = element('bo-secret');
  const titreCarte = element('bo-secret-title');
  const commande = element('bo-token-command');
  const secret = element<HTMLInputElement>('bo-token-secret');
  const retourCarte = element('bo-secret-retour');
  const retourFormulaire = element('bo-token-form-retour');
  const verification = element('bo-token-tools');
  const table = element('bo-token-table');
  const corps = element('bo-token-list');
  const vide = element('bo-tokens-empty');
  const compte = element('bo-tokens-count');
  const serveur = nomServeur(window.location.hostname, rubrique.dataset.hoteCanonique ?? '');
  let acces: Acces[] = [];
  let affiche: { id: number; nom: string; secret: string } | undefined;
  let appelEnCours: AbortController | undefined;

  element('bo-mcp-url').textContent = `${window.location.origin}/mcp`;
  element('bo-token-remove').textContent = commandeRetrait(serveur);

  function cacherSecret(): void {
    appelEnCours?.abort();
    appelEnCours = undefined;
    affiche = undefined;
    commande.textContent = '';
    secret.value = '';
    element('bo-token-tools-summary').textContent = '';
    element('bo-token-tools-list').replaceChildren();
    verification.hidden = true;
    retourCarte.textContent = '';
    delete retourCarte.dataset.state;
    for (const repli of carte.querySelectorAll('details')) repli.open = false;
    carte.hidden = true;
    formulaire.hidden = false;
  }

  function montrerSecret(cree: AccesCree): void {
    affiche = { id: cree.id, nom: cree.name, secret: cree.token };
    commande.textContent = commandeClaudeCode(window.location.origin, serveur, cree.token);
    secret.value = cree.token;
    titreCarte.textContent = `L’accès ${cite(cree.name)} est prêt`;
    formulaire.hidden = true;
    carte.hidden = false;
    const libelles = libellesPermissions(cree.scopes);
    contexte.afficher(retourCarte, libelles.length > 1 ? `Accès créé avec les permissions ${liste(libelles)}.` : `Accès créé avec la permission ${libelles[0] ?? 'demandée'}.`);
    titreCarte.focus();
  }

  function temps(valeur: string, texte: string): HTMLTimeElement {
    const moment = creer('time', '', texte);
    moment.dateTime = valeur;
    moment.title = contexte.date(valeur);
    return moment;
  }

  function ligne(item: Acces): HTMLTableRowElement {
    const rang = creer('tr');
    const intitule = creer('th', '', item.name);
    intitule.scope = 'row';
    const permissions = creer('td');
    permissions.dataset.label = 'Permissions';
    const etiquettes = creer('ul', 'bo-etiquettes');
    const libelles = libellesPermissions(item.scopes ?? []);
    etiquettes.append(...(libelles.length ? libelles : ['Aucune']).map((libelle) => creer('li', 'bo-etiquette', libelle)));
    permissions.append(etiquettes);
    const creation = creer('td');
    creation.dataset.label = 'Création';
    const instant = Date.parse(item.created_at);
    creation.append(temps(item.created_at, Number.isNaN(instant) ? 'Date inconnue' : jourCourt.format(instant)));
    const usage = creer('td');
    usage.dataset.label = 'Dernière utilisation';
    if (item.last_used_at) usage.append(temps(item.last_used_at, depuis(item.last_used_at)));
    else usage.append(creer('span', 'bo-jamais', 'Jamais'));
    const action = creer('td');
    const revoquer = creer('button', 'bo-button bo-button--danger bo-button--petit', 'Révoquer');
    revoquer.type = 'button';
    revoquer.append(creer('span', 'sr', ` ${item.name}`));
    revoquer.addEventListener('click', () => { void revoquerAcces(item, revoquer); });
    action.append(revoquer);
    rang.append(intitule, permissions, creation, usage, action);
    return rang;
  }

  async function revoquerAcces(item: Acces, bouton: HTMLButtonElement): Promise<void> {
    const accord = await contexte.confirmer(
      'Révoquer cet accès ?',
      `${cite(item.name)} ne pourra plus rien faire sur le portfolio${NBSP}: ses appels seront refusés dès maintenant. Retirez-le aussi de Claude Code avec ${commandeRetrait(serveur)}.`,
      'Révoquer l’accès',
    );
    if (!accord) return;
    await contexte.action(bouton, async (dire) => {
      await contexte.api(`/tokens/${item.id}`, 'DELETE');
      if (affiche?.id === item.id) cacherSecret();
      await charger();
      dire(`L’accès ${cite(item.name)} est révoqué.`);
    }, 'Révocation de l’accès…');
  }

  async function charger(): Promise<void> {
    const reponse = await contexte.api<{ tokens: Acces[] }>('/tokens');
    if (!contexte.estConnecte()) return;
    acces = reponse.tokens;
    corps.replaceChildren(...acces.map(ligne));
    table.hidden = acces.length === 0;
    vide.hidden = acces.length > 0;
    compte.textContent = acces.length ? `${acces.length} accès` : '';
    // Le nom proposé ne double jamais un accès existant ; une saisie en cours reste.
    const ancien = nom.defaultValue;
    nom.defaultValue = nomPropose(acces.map(({ name }) => name));
    if (nom.value === ancien) nom.value = nom.defaultValue;
  }

  function reinitialiser(): void {
    acces = [];
    corps.replaceChildren();
    table.hidden = true;
    vide.hidden = true;
    compte.textContent = '';
    cacherSecret();
    formulaire.reset();
  }

  formulaire.addEventListener('submit', (evenement) => {
    evenement.preventDefault();
    const name = nom.value.trim();
    const choisi = formulaire.querySelector<HTMLInputElement>('input[name="prereglage"]:checked')?.value as Prereglage | undefined;
    const scopes = permissionsDe(choisi ?? PREREGLAGE_PAR_DEFAUT, demandes.checked);
    void contexte.action(formulaire, async (dire) => {
      cacherSecret();
      const cree = await contexte.api<AccesCree>('/tokens', 'POST', { name, scopes });
      if (!contexte.estConnecte()) return;
      formulaire.reset();
      if (contexte.estVisible()) montrerSecret({ ...cree, scopes: cree.scopes ?? scopes });
      else dire(`L’accès ${cite(cree.name)} est créé, mais son secret n’est plus affiché${NBSP}: révoquez-le et créez-en un autre.`, 'error');
      await charger();
    }, 'Création de l’accès…');
  });

  async function copier(texte: string, selectionner: () => void, quoi: 'commande' | 'secret'): Promise<void> {
    try {
      await navigator.clipboard.writeText(texte);
      contexte.afficher(retourCarte, quoi === 'commande' ? 'Commande copiée. Collez-la dans un terminal.' : 'Secret copié.');
    } catch {
      selectionner();
      contexte.afficher(retourCarte, `La copie automatique est indisponible${NBSP}: ${quoi === 'commande' ? 'la commande est sélectionnée' : 'le secret est sélectionné'}, copiez-${quoi === 'commande' ? 'la' : 'le'} au clavier.`, 'error');
    }
  }

  element('bo-token-copy').addEventListener('click', () => {
    void copier(commande.textContent ?? '', () => {
      const plage = document.createRange();
      plage.selectNodeContents(commande);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(plage);
    }, 'commande');
  });
  element('bo-token-copy-secret').addEventListener('click', () => {
    void copier(secret.value, () => { secret.focus(); secret.select(); }, 'secret');
  });

  element('bo-token-verify').addEventListener('click', (evenement) => {
    const ouvert = affiche;
    if (!ouvert) return;
    void contexte.action(evenement.currentTarget as HTMLButtonElement, async (dire) => {
      appelEnCours?.abort();
      const controleur = new AbortController();
      appelEnCours = controleur;
      const minuterie = window.setTimeout(() => controleur.abort(), DELAI_VERIFICATION);
      try {
        const outils = await outilsDisponibles(ouvert.secret, controleur.signal);
        if (affiche?.secret !== ouvert.secret) return;
        const nombre = outils.length;
        element('bo-token-tools-summary').textContent = `${nombre} outil${nombre > 1 ? 's' : ''} disponible${nombre > 1 ? 's' : ''} pour cet accès${NBSP}:`;
        element('bo-token-tools-list').replaceChildren(...outils.map((outil) => creer('li', '', outil.title || outil.name)));
        verification.hidden = false;
        dire(`L’accès répond${NBSP}: le serveur MCP accepte ce secret.`);
      } finally {
        window.clearTimeout(minuterie);
        if (appelEnCours === controleur) appelEnCours = undefined;
      }
      await charger();
    }, 'Vérification de l’accès…');
  });

  element('bo-token-hide').addEventListener('click', () => {
    const nomAffiche = affiche?.nom;
    cacherSecret();
    if (nomAffiche) contexte.afficher(retourFormulaire, `L’accès ${cite(nomAffiche)} reste actif. Son secret n’est plus affiché.`);
    element('bo-token-form-title').focus();
  });

  return { charger, cacherSecret, reinitialiser };
}
