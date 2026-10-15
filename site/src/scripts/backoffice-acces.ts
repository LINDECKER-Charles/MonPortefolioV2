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
 * « Vérifier l’accès » appelle /mcp depuis cette page avec le nouveau secret,
 * par le chemin de Claude Code (révision 2026-07-28 : server/discover, puis
 * tools/list, avec les indications de cache que Claude Code exige) : même
 * origine, sans cookie. Le serveur accepte l’en-tête Origin de cette page
 * (backend/src/mcp.rs, valid_origin) et la CSP l’autorise
 * (`connect-src 'self'`). Cet appel compte comme une utilisation de l’accès.
 * Terminé, quitter la rubrique ou se déconnecter l’annule sans message ; un
 * serveur muet au-delà de 15 s le dit.
 *
 * Préréglages, libellés, nom de serveur et commande : lib/acces-mcp.ts.
 */
import {
  commandeRemplacement,
  commandeRetrait,
  depuis,
  DUREE_PAR_DEFAUT,
  DUREES,
  echeance,
  libelleEcheance,
  lignesCommande,
  libellesPermissions,
  nomPropose,
  nomServeur,
  permissionsDe,
  PREREGLAGE_PAR_DEFAUT,
  type Prereglage,
} from '../lib/acces-mcp';
import { ErreurApi, type Dire, type Etat } from './backoffice-commun';

interface Acces { id: number; name: string; created_at: string; last_used_at: string | null; scopes?: string[]; expires_at?: string; expired?: boolean }
interface AccesCree { id: number; name: string; token: string; scopes: string[]; expires_at?: string }
interface OutilMcp { name: string; title?: string }
/** Un résultat complet de la révision 2026-07-28, cachable. */
interface ResultatModerne { resultType?: string; ttlMs?: unknown; cacheScope?: unknown }

export interface ContexteAcces {
  api: <T>(chemin: string, method?: string, corps?: unknown) => Promise<T>;
  action: (cible: HTMLElement, operation: (dire: Dire) => Promise<void>, attente: string) => Promise<void>;
  afficher: (zone: HTMLElement, message: string, etat?: Etat) => void;
  /** `commande` : une ligne de terminal montrée seule, en code, sous le message. */
  confirmer: (titre: string, message: string, libelle: string, commande?: string) => Promise<boolean>;
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
/** La révision MCP que suit Claude Code. */
const VERSION_MODERNE = '2026-07-28';
/** Raisons d’abandon de la vérification : la minuterie, ou le secret qui n’est plus affiché. */
const DELAI_DEPASSE = 'delai-depasse';
const SECRET_CACHE = 'secret-cache';

/** La vérification a été abandonnée parce que le secret n’est plus affiché : rien à dire. */
class VerificationAnnulee extends Error {}
const jourCourt = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' });
const cite = (texte: string) => `«${NBSP}${texte}${NBSP}»`;
const liste = (mots: string[]) => (mots.length > 1 ? `${mots.slice(0, -1).join(', ')} et ${mots.at(-1)}` : mots[0] ?? '');

/** Pourquoi un appel a été abandonné : le délai (on le dit), ou le secret caché (on se tait). */
function abandon(signal: AbortSignal): Error {
  return signal.reason === DELAI_DEPASSE
    ? new ErreurApi('Le serveur MCP ne répond pas dans les temps. Réessayez dans un instant.', 0)
    : new VerificationAnnulee();
}

/** Un appel JSON-RPC au serveur MCP de ce site, avec le secret de l’accès, comme le fait Claude Code. */
async function appelMcp<T>(secret: string, id: number, method: string, signal: AbortSignal): Promise<T & ResultatModerne> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${secret}`,
    'Content-Type': 'application/json',
    Accept: 'application/json, text/event-stream',
    'MCP-Protocol-Version': VERSION_MODERNE,
    'MCP-Method': method,
  };
  const params = { _meta: { 'io.modelcontextprotocol/protocolVersion': VERSION_MODERNE, 'io.modelcontextprotocol/clientCapabilities': {} } };
  let reponse: Response;
  try {
    reponse = await fetch('/mcp', { method: 'POST', headers, body: JSON.stringify({ jsonrpc: '2.0', id, method, params }), credentials: 'omit', cache: 'no-store', signal });
  } catch {
    if (signal.aborted) throw abandon(signal);
    throw new ErreurApi('Le serveur MCP est injoignable. Vérifiez la connexion puis réessayez.', 0);
  }
  const contenu = await reponse.json().catch(() => ({})) as { result?: T & ResultatModerne; error?: { message?: string } };
  if (signal.aborted) throw abandon(signal);
  if (reponse.status === 401) {
    const code = (contenu as { code?: unknown }).code;
    throw code === 'TOKEN_EXPIRED'
      ? new ErreurApi(`Le serveur MCP refuse ce secret${NBSP}: l’accès a expiré. Créez-en un autre.`, 401, code)
      : new ErreurApi(`Le serveur MCP refuse ce secret${NBSP}: l’accès a sans doute été révoqué.`, 401);
  }
  if (reponse.status === 403) throw new ErreurApi('Le serveur MCP refuse cette origine. Ouvrez le backoffice depuis l’adresse du site.', 403);
  if (reponse.status === 429) throw new ErreurApi('Trop d’appels MCP depuis cette adresse. Réessayez dans une minute.', 429);
  if (!reponse.ok || contenu.error || contenu.result === undefined) {
    throw new ErreurApi(`Le serveur MCP n’a pas répondu comme prévu (statut ${reponse.status}). Réessayez dans un instant.`, reponse.status);
  }
  // Claude Code refuse un catalogue sans ses indications de cache (« tools fetch failed »).
  const resultat = contenu.result;
  if (resultat.resultType !== 'complete' || typeof resultat.ttlMs !== 'number' || typeof resultat.cacheScope !== 'string') {
    throw new ErreurApi(`Le serveur MCP répond, mais sans les indications de cache qu’exige Claude Code (${method}). Mettez le backend à jour.`, reponse.status);
  }
  return resultat;
}

/**
 * Ce que fait Claude Code à la connexion : la découverte du serveur, puis le
 * catalogue d’outils ouvert par les permissions de l’accès.
 */
async function outilsDisponibles(secret: string, signal: AbortSignal): Promise<OutilMcp[]> {
  const decouverte = await appelMcp<{ supportedVersions?: unknown }>(secret, 1, 'server/discover', signal);
  if (!Array.isArray(decouverte.supportedVersions) || !decouverte.supportedVersions.includes(VERSION_MODERNE)) {
    throw new ErreurApi(`Le serveur MCP ne propose pas la révision ${VERSION_MODERNE} que suit Claude Code. Mettez le backend à jour.`, 200);
  }
  const catalogue = await appelMcp<{ tools?: OutilMcp[] }>(secret, 2, 'tools/list', signal);
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
  const duree = element<HTMLSelectElement>('bo-token-duration');
  const finCarte = element('bo-token-expiry');
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
  for (const zone of rubrique.querySelectorAll('[data-serveur-mcp]')) zone.textContent = serveur;

  function effacer(zone: HTMLElement): void {
    zone.textContent = '';
    delete zone.dataset.state;
  }

  /**
   * La commande en mots : une option ne se coupe jamais, seul le secret peut aller à la ligne.
   * Chaque ligne de la commande est un bloc en retrait suspendu : sa suite, si la largeur la
   * coupe, est en retrait, et ne se lit pas comme une commande à part.
   */
  function afficherCommande(secretAcces: string): void {
    const lignes = lignesCommande(window.location.origin, serveur, secretAcces).map((mots, rangLigne, toutes) => {
      const morceaux: Node[] = [];
      mots.forEach((mot, rang) => {
        if (rang) morceaux.push(document.createTextNode(' '));
        const position = mot.indexOf(secretAcces);
        if (position < 0) { morceaux.push(creer('span', 'bo-commande__mot', mot)); return; }
        if (position) morceaux.push(creer('span', 'bo-commande__mot', mot.slice(0, position)));
        morceaux.push(creer('span', 'bo-commande__secret', mot.slice(position)));
      });
      // Le saut de ligne reste dans le texte, pour qui sélectionne la commande à la main.
      if (rangLigne < toutes.length - 1) morceaux.push(document.createTextNode('\n'));
      const ligne = document.createElement('span');
      ligne.className = 'bo-commande__ligne';
      ligne.append(...morceaux);
      return ligne;
    });
    commande.replaceChildren(...lignes);
  }

  function cacherSecret(): void {
    appelEnCours?.abort(SECRET_CACHE);
    appelEnCours = undefined;
    affiche = undefined;
    commande.replaceChildren();
    finCarte.textContent = '';
    secret.value = '';
    element('bo-token-tools-summary').textContent = '';
    element('bo-token-tools-list').replaceChildren();
    verification.hidden = true;
    effacer(retourCarte);
    for (const repli of carte.querySelectorAll('details')) repli.open = false;
    carte.hidden = true;
    formulaire.hidden = false;
  }

  function montrerSecret(cree: AccesCree): void {
    affiche = { id: cree.id, nom: cree.name, secret: cree.token };
    afficherCommande(cree.token);
    // La date de fin : l’accès ne se prolonge pas, il faudra en créer un autre.
    finCarte.textContent = cree.expires_at ? `${libelleEcheance(cree.expires_at)}. À cette date, Claude Code ne pourra plus s’en servir${NBSP}: créez alors un autre accès.` : '';
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
    const fin = creer('td');
    fin.dataset.label = 'Échéance';
    const expire = estExpire(item);
    if (item.expires_at) {
      // Une forme et des mots, jamais la couleur seule : proche (losange), expiré (trait).
      const terme = echeance(item.expires_at);
      const etat = expire ? 'expire' : terme.etat;
      const marque = creer('span', 'bo-echeance');
      marque.dataset.echeance = etat;
      // La date d’un tenant, puis ce qui reste dessous : « Expire le 22 oct. 2026 », « dans 7 jours ».
      const texte = creer('span', 'bo-echeance__texte');
      texte.append(temps(item.expires_at, `${etat === 'expire' ? 'Expiré' : 'Expire'} le ${terme.date}`));
      if (terme.etat === 'proche' && !expire) texte.append(creer('span', 'bo-echeance__reste', `dans ${terme.jours} jour${terme.jours > 1 ? 's' : ''}`));
      marque.append(texte);
      fin.append(marque);
      rang.dataset.echeance = etat;
    } else fin.append(creer('span', 'bo-jamais', 'Inconnue'));
    const action = creer('td');
    const revoquer = creer('button', 'bo-button bo-button--danger bo-button--petit', expire ? 'Supprimer' : 'Révoquer');
    revoquer.type = 'button';
    revoquer.append(creer('span', 'sr', ` ${item.name}`));
    revoquer.addEventListener('click', () => { void revoquerAcces(item, revoquer); });
    action.append(revoquer);
    rang.append(intitule, permissions, creation, usage, fin, action);
    return rang;
  }

  /** Expiré pour le serveur, ou passé depuis le dernier chargement de la liste. */
  function estExpire(item: Acces): boolean {
    return Boolean(item.expired) || (item.expires_at !== undefined && echeance(item.expires_at).etat === 'expire');
  }

  async function revoquerAcces(item: Acces, bouton: HTMLButtonElement): Promise<void> {
    const expire = estExpire(item);
    const accord = expire
      ? await contexte.confirmer(
        'Supprimer cet accès expiré ?',
        `${cite(item.name)} a expiré${NBSP}: ses appels sont déjà refusés. Il disparaîtra de la liste. Retirez-le aussi de Claude Code${NBSP}:`,
        'Supprimer l’accès',
        commandeRetrait(serveur),
      )
      : await contexte.confirmer(
        'Révoquer cet accès ?',
        `${cite(item.name)} ne pourra plus rien faire sur le portfolio${NBSP}: ses appels seront refusés dès maintenant. Retirez-le aussi de Claude Code${NBSP}:`,
        'Révoquer l’accès',
        commandeRetrait(serveur),
      );
    if (!accord) return;
    await contexte.action(bouton, async (dire) => {
      await contexte.api(`/tokens/${item.id}`, 'DELETE');
      if (affiche?.id === item.id) cacherSecret();
      // « L’accès … reste actif » ne vaut plus : la liste dit maintenant la révocation.
      effacer(retourFormulaire);
      await charger();
      dire(expire ? `L’accès expiré ${cite(item.name)} est supprimé.` : `L’accès ${cite(item.name)} est révoqué.`);
    }, expire ? 'Suppression de l’accès…' : 'Révocation de l’accès…');
  }

  async function charger(): Promise<void> {
    const reponse = await contexte.api<{ tokens: Acces[] }>('/tokens');
    if (!contexte.estConnecte()) return;
    acces = reponse.tokens;
    corps.replaceChildren(...acces.map(ligne));
    table.hidden = acces.length === 0;
    vide.hidden = acces.length > 0;
    const expires = acces.filter(estExpire).length;
    compte.textContent = acces.length ? `${acces.length} accès${expires ? `, dont ${expires} expiré${expires > 1 ? 's' : ''}` : ''}` : '';
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
    const jours = Number(duree.value);
    const expires_in_days = DUREES.some((option) => option.jours === jours) ? jours : DUREE_PAR_DEFAUT;
    void contexte.action(formulaire, async (dire) => {
      cacherSecret();
      const cree = await contexte.api<AccesCree>('/tokens', 'POST', { name, scopes, expires_in_days });
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
    void copier(affiche ? commandeRemplacement(window.location.origin, serveur, affiche.secret) : '', () => {
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
      const minuterie = window.setTimeout(() => controleur.abort(DELAI_DEPASSE), DELAI_VERIFICATION);
      try {
        let outils: OutilMcp[];
        try {
          outils = await outilsDisponibles(ouvert.secret, controleur.signal);
        } catch (cause) {
          // Terminé, la rubrique quittée ou la déconnexion : le secret n’est plus là, rien à dire.
          if (cause instanceof VerificationAnnulee || affiche?.secret !== ouvert.secret) return;
          throw cause;
        }
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
