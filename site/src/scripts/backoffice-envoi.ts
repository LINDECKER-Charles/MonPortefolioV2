/**
 * Le serveur d’envoi des e-mails (components/backoffice/RubriqueEmails.astro) :
 * le réglage, son état, l’e-mail d’essai et le retour aux variables du serveur.
 *
 * API (backend/src/mail_settings.rs) : GET, PUT et DELETE /mail, POST
 * /mail/test. Le mot de passe ne revient jamais : le champ reste vide, et
 * vide à l’enregistrement, il garde celui qui est enregistré. Un refus de
 * champ (`fields`) se dit sous le champ, qui reçoit `aria-invalid`.
 */
import { ErreurApi, type Dire, type Etat } from './backoffice-commun';

type Securite = 'tls' | 'starttls' | 'none';
interface Reglage { enabled: boolean; host: string; port: number; security: Securite; username: string; password_set: boolean; from: string; updated_at: string }
interface Serveur { host: string; port: number; security: Securite; from: string }
export interface VueEnvoi {
  active: boolean;
  source: 'settings' | 'environment' | 'none';
  recipient: string;
  settings: Reglage | null;
  environment: Serveur | null;
  problem: 'password_unreadable' | 'insecure_connection' | 'invalid_settings' | null;
  password_storage: boolean;
  allow_insecure: boolean;
}

export interface ContexteEnvoi {
  api: <T>(chemin: string, method?: string, corps?: unknown) => Promise<T>;
  action: (cible: HTMLElement, operation: (dire: Dire) => Promise<void>, attente: string) => Promise<void>;
  afficher: (zone: HTMLElement, message: string, etat?: Etat) => void;
  confirmer: (titre: string, message: string, libelle: string) => Promise<boolean>;
  estConnecte: () => boolean;
  /** Date et heure complètes. */
  date: (valeur: string) => string;
  /** L’envoi est actif ou non : l’avis de la rubrique suit. */
  surEtat: (actif: boolean) => void;
}

export interface RubriqueEnvoi {
  charger: () => Promise<void>;
  /** L’adresse de contact vient de changer : l’état la montre. */
  destinataire: (adresse: string) => void;
  reinitialiser: () => void;
}

const NBSP = ' ';
const CHAMPS = ['host', 'security', 'port', 'username', 'password', 'from'] as const;
type Champ = (typeof CHAMPS)[number];
const PORT_PAR_DEFAUT: Record<Securite, number> = { tls: 465, starttls: 587, none: 25 };
const LIBELLES_SECURITE: Record<Securite, string> = { tls: 'TLS', starttls: 'STARTTLS', none: 'sans TLS' };
const HOSTINGER = { host: 'smtp.hostinger.com', port: 465, security: 'tls' as Securite };
const PROBLEMES: Record<NonNullable<VueEnvoi['problem']>, string> = {
  password_unreadable: `Le mot de passe enregistré ne se déchiffre plus (la clé du serveur a changé)${NBSP}: saisissez-le à nouveau, puis enregistrez.`,
  insecure_connection: `Ce réglage se connecte sans TLS, ce qui n’est permis qu’en développement${NBSP}: choisissez TLS ou STARTTLS, puis enregistrez.`,
  invalid_settings: 'Ce réglage ne permet pas de préparer l’envoi. Vérifiez l’hôte et l’adresse d’expédition, puis enregistrez.',
};

export function brancherEnvoi(contexte: ContexteEnvoi): RubriqueEnvoi {
  const element = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
  const formulaire = element<HTMLFormElement>('bo-mail-form');
  const active = element<HTMLInputElement>('bo-mail-enabled');
  const hote = element<HTMLInputElement>('bo-mail-host');
  const port = element<HTMLInputElement>('bo-mail-port');
  const identifiant = element<HTMLInputElement>('bo-mail-username');
  const motDePasse = element<HTMLInputElement>('bo-mail-password');
  const expediteur = element<HTMLInputElement>('bo-mail-from');
  const retourFormulaire = element('bo-mail-retour');
  const retourEssai = element('bo-mail-test-retour');
  const champs: Record<Champ, HTMLElement> = {
    host: hote, security: element('bo-mail-security'), port, username: identifiant, password: motDePasse, from: expediteur,
  };
  let vue: VueEnvoi | undefined;
  /** Des changements non enregistrés : l’essai, qui suit le réglage enregistré, attend. */
  let modifie = false;

  const securite = (): Securite => (formulaire.querySelector<HTMLInputElement>('input[name="security"]:checked')?.value as Securite | undefined) ?? 'tls';
  function choisirSecurite(valeur: Securite): void {
    const option = element<HTMLInputElement>(`bo-mail-security-${valeur}`);
    option.closest<HTMLElement>('[data-securite]')!.hidden = false;
    option.checked = true;
  }

  function effacerErreurs(): void {
    for (const champ of CHAMPS) {
      champs[champ].removeAttribute('aria-invalid');
      const erreur = element(`bo-mail-${champ}-erreur`);
      erreur.textContent = '';
      erreur.hidden = true;
    }
  }

  function montrerErreurs(refus: Readonly<Record<string, string>>): void {
    let premier: HTMLElement | undefined;
    for (const champ of CHAMPS) {
      const message = refus[champ];
      if (!message) continue;
      champs[champ].setAttribute('aria-invalid', 'true');
      const erreur = element(`bo-mail-${champ}-erreur`);
      erreur.textContent = message;
      erreur.hidden = false;
      premier ??= champ === 'security' ? formulaire.querySelector<HTMLInputElement>('input[name="security"]:checked') ?? undefined : champs[champ];
    }
    premier?.focus();
  }

  function decrireSource(donnees: VueEnvoi): string {
    if (donnees.source === 'settings' && donnees.settings) {
      const reglage = donnees.settings;
      return `Ce réglage, enregistré le ${contexte.date(reglage.updated_at)}${reglage.enabled ? '' : ' (envoi coupé)'}`;
    }
    if (donnees.source === 'environment' && donnees.environment) {
      const serveur = donnees.environment;
      return `Variables SMTP_* du serveur${NBSP}: ${serveur.host}, port ${serveur.port}, ${LIBELLES_SECURITE[serveur.security]}`;
    }
    return 'Aucun serveur configuré';
  }

  function afficherEtat(donnees: VueEnvoi): void {
    const etat = element('bo-mail-active');
    etat.textContent = donnees.active ? 'Actives' : 'Coupées';
    // Disque plein : actives ; cercle vide : coupées (une forme et un mot).
    etat.dataset.state = donnees.active ? 'published' : 'draft';
    element('bo-mail-source').textContent = decrireSource(donnees);
    element('bo-mail-recipient').textContent = donnees.recipient;
    const probleme = element('bo-mail-problem');
    probleme.textContent = donnees.problem ? PROBLEMES[donnees.problem] : '';
    probleme.hidden = !donnees.problem;
    const repli = element('bo-mail-forget-zone');
    repli.hidden = donnees.source !== 'settings';
    element('bo-mail-forget').textContent = donnees.environment ? 'Revenir aux variables du serveur' : 'Oublier ce réglage';
    element('bo-mail-forget-help').textContent = donnees.environment
      ? `Les variables SMTP_* (${donnees.environment.host}) reprendront la main.`
      : `Sans variables SMTP_* sur le serveur, l’envoi sera coupé${NBSP}; les demandes restent conservées.`;
    contexte.surEtat(donnees.active);
  }

  function remplir(donnees: VueEnvoi): void {
    vue = donnees;
    effacerErreurs();
    element('bo-mail-security-none').closest<HTMLElement>('[data-securite]')!.hidden = !donnees.allow_insecure && donnees.settings?.security !== 'none';
    const reglage = donnees.settings;
    // Sans réglage enregistré, le formulaire part du repli du serveur, s’il existe.
    const depart = reglage ?? donnees.environment;
    active.checked = reglage ? reglage.enabled : true;
    hote.value = depart?.host ?? '';
    choisirSecurite(depart?.security ?? 'tls');
    port.value = String(depart?.port ?? PORT_PAR_DEFAUT[securite()]);
    identifiant.value = reglage?.username ?? '';
    expediteur.value = depart?.from ?? '';
    motDePasse.value = '';
    motDePasse.placeholder = reglage?.password_set ? 'Enregistré, laisser vide pour le garder' : '';
    element('bo-mail-password-help').textContent = !donnees.password_storage
      ? `Le serveur n’a pas de clé de chiffrement (BACKOFFICE_TOTP_ENCRYPTION_KEY)${NBSP}: un mot de passe ne peut pas être enregistré.`
      : reglage?.password_set
        ? 'Un mot de passe est enregistré, chiffré. Laissez le champ vide pour le garder.'
        : 'Chiffré avant d’être enregistré, il ne s’affiche plus ensuite.';
    modifie = false;
    afficherEtat(donnees);
  }

  async function charger(): Promise<void> {
    const donnees = await contexte.api<VueEnvoi>('/mail');
    if (!contexte.estConnecte()) return;
    remplir(donnees);
  }

  function reinitialiser(): void {
    vue = undefined;
    formulaire.reset();
    effacerErreurs();
    modifie = false;
    for (const id of ['bo-mail-source', 'bo-mail-recipient', 'bo-mail-problem']) element(id).textContent = '';
    element('bo-mail-problem').hidden = true;
    element('bo-mail-forget-zone').hidden = true;
  }

  formulaire.addEventListener('input', () => { modifie = true; });
  // L’identifiant d’une boîte est souvent son adresse d’expédition : la recopier tant qu’on n’a rien écrit d’autre.
  let identifiantPrecedent = '';
  identifiant.addEventListener('focus', () => { identifiantPrecedent = identifiant.value.trim(); });
  identifiant.addEventListener('input', () => {
    const avant = expediteur.value.trim();
    if ((avant === '' || avant === identifiantPrecedent) && identifiant.value.includes('@')) expediteur.value = identifiant.value.trim();
    identifiantPrecedent = identifiant.value.trim();
  });
  for (const option of formulaire.querySelectorAll<HTMLInputElement>('input[name="security"]')) {
    option.addEventListener('change', () => {
      // Le port suit la sécurité tant qu’il est celui de l’autre mode.
      if (Object.values(PORT_PAR_DEFAUT).includes(Number(port.value))) port.value = String(PORT_PAR_DEFAUT[securite()]);
    });
  }

  element('bo-mail-hostinger').addEventListener('click', () => {
    hote.value = HOSTINGER.host;
    choisirSecurite(HOSTINGER.security);
    port.value = String(HOSTINGER.port);
    active.checked = true;
    modifie = true;
    effacerErreurs();
    contexte.afficher(retourFormulaire, `Hôte, port et sécurité préremplis pour Hostinger. Indiquez l’adresse de la boîte comme identifiant et comme expéditeur, et son mot de passe, puis enregistrez.`);
    identifiant.focus();
  });

  formulaire.addEventListener('submit', (evenement) => {
    evenement.preventDefault();
    const corps: Record<string, unknown> = {
      enabled: active.checked,
      host: hote.value.trim(),
      port: Number(port.value),
      security: securite(),
      username: identifiant.value.trim(),
      from: expediteur.value.trim(),
    };
    if (motDePasse.value) corps.password = motDePasse.value;
    void contexte.action(formulaire, async (dire) => {
      effacerErreurs();
      let donnees: VueEnvoi;
      try {
        donnees = await contexte.api<VueEnvoi>('/mail', 'PUT', corps);
      } catch (cause) {
        if (cause instanceof ErreurApi && cause.champs) {
          const refus = cause.champs;
          // Le focus va au premier champ refusé, une fois le formulaire rouvert.
          window.setTimeout(() => montrerErreurs(refus));
          throw new ErreurApi(Object.keys(refus).length > 1 ? 'Des champs sont à corriger, chacun avec son message.' : 'Un champ est à corriger, avec son message.', cause.status, cause.code);
        }
        throw cause;
      }
      if (!contexte.estConnecte()) return;
      remplir(donnees);
      dire(donnees.settings?.enabled
        ? `Le serveur d’envoi est enregistré${NBSP}: la prochaine demande l’utilisera. Envoyez un e-mail de test pour le vérifier.`
        : `Le réglage est enregistré, envoi coupé${NBSP}: les demandes sont seulement conservées.`);
    }, 'Enregistrement du serveur d’envoi…');
  });

  element('bo-mail-test').addEventListener('click', (evenement) => {
    const bouton = evenement.currentTarget as HTMLButtonElement;
    if (modifie) {
      contexte.afficher(retourEssai, `L’essai utilise les réglages enregistrés${NBSP}: enregistrez d’abord vos changements.`, 'error');
      return;
    }
    void contexte.action(bouton, async (dire) => {
      const reponse = await contexte.api<{ result: string; recipient: string }>('/mail/test', 'POST', {});
      dire(`E-mail d’essai accepté par le serveur, pour ${reponse.recipient}. Vérifiez la boîte de réception, et les indésirables.`);
    }, 'Envoi de l’e-mail d’essai…');
  });

  element('bo-mail-forget').addEventListener('click', (evenement) => {
    const bouton = evenement.currentTarget as HTMLButtonElement;
    const repli = vue?.environment;
    void (async () => {
      const accord = await contexte.confirmer(
        repli ? 'Revenir aux variables du serveur ?' : 'Oublier ce réglage ?',
        repli
          ? `Le réglage du backoffice sera supprimé, mot de passe compris. Les variables SMTP_* du serveur (${repli.host}) enverront les prochaines notifications.`
          : `Le réglage du backoffice sera supprimé, mot de passe compris. Sans variables SMTP_* sur le serveur, l’envoi sera coupé.`,
        repli ? 'Revenir aux variables' : 'Oublier le réglage',
      );
      if (!accord) return;
      await contexte.action(bouton, async (dire) => {
        const donnees = await contexte.api<VueEnvoi>('/mail', 'DELETE');
        if (!contexte.estConnecte()) return;
        remplir(donnees);
        dire(donnees.source === 'environment' ? 'Les variables SMTP_* du serveur reprennent la main.' : `Le réglage est oublié${NBSP}: l’envoi est coupé.`);
      }, 'Suppression du réglage…');
    })();
  });

  return {
    charger,
    destinataire: (adresse) => {
      if (vue) vue.recipient = adresse;
      element('bo-mail-recipient').textContent = adresse;
    },
    reinitialiser,
  };
}
