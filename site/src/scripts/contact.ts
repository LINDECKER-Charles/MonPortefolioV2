/** Formulaire de contact : le succès suit la confirmation du serveur SMTP. */
const CHAMPS = ['name', 'email', 'subject', 'message'] as const;
type Champ = (typeof CHAMPS)[number];
type Saisie = HTMLInputElement | HTMLTextAreaElement;
interface ReponseContact {
  message?: string;
  fields?: Partial<Record<Champ, string>>;
}

export function brancherContact(): void {
  const formulaire = document.querySelector<HTMLFormElement>('[data-contact-form]');
  if (!formulaire) return;
  const bouton = formulaire.querySelector<HTMLButtonElement>('button[type="submit"]');
  const libelle = bouton?.querySelector<HTMLElement>('[data-contact-submit-label]');
  const statut = formulaire.querySelector<HTMLElement>('[data-contact-status]');
  const groupe = formulaire.querySelector<HTMLFieldSetElement>('fieldset');
  if (!bouton || !libelle || !statut || !groupe) return;

  let enCours = false;
  const champs = Object.fromEntries(CHAMPS.map((nom) => [nom, formulaire.elements.namedItem(nom)])) as Record<Champ, Saisie>;
  function effacerErreurs(): void {
    for (const nom of CHAMPS) {
      champs[nom].removeAttribute('aria-invalid');
      const erreur = document.getElementById(`contact-${nom}-error`);
      if (erreur) { erreur.hidden = true; erreur.textContent = ''; }
    }
  }
  function afficherErreurs(erreurs: Partial<Record<Champ, string>>): void {
    for (const nom of CHAMPS) {
      const texte = erreurs[nom];
      if (typeof texte !== 'string' || !texte) continue;
      champs[nom].setAttribute('aria-invalid', 'true');
      const erreur = document.getElementById(`contact-${nom}-error`);
      if (erreur) { erreur.textContent = texte; erreur.hidden = false; }
    }
  }
  function annoncer(texte: string): void {
    statut!.textContent = texte;
    statut!.hidden = false;
  }
  // La validation personnalisée permet d’associer chaque erreur à son champ.
  formulaire.noValidate = true;
  bouton.disabled = false;
  formulaire.addEventListener('submit', async (evenement) => {
    evenement.preventDefault();
    if (enCours) return;
    effacerErreurs();
    statut.hidden = true;
    const saisie = Object.fromEntries(CHAMPS.map((nom) => [nom, champs[nom].value.trim()])) as Record<Champ, string>;
    const erreurs: Partial<Record<Champ, string>> = {};
    const limites = { name: [2, 100], subject: [3, 160], message: [10, 5000] } as const;
    for (const nom of ['name', 'subject', 'message'] as const) {
      const longueur = [...saisie[nom]].length;
      const [min, max] = limites[nom];
      if (longueur < min || longueur > max) erreurs[nom] = `Saisissez entre ${min} et ${max} caractères.`;
    }
    if (!saisie.email || saisie.email.length > 254 || champs.email.validity.typeMismatch) erreurs.email = 'Saisissez une adresse e-mail valide.';
    if (Object.keys(erreurs).length) {
      afficherErreurs(erreurs);
      annoncer('Vérifiez les champs indiqués avant d’envoyer votre message.');
      champs[CHAMPS.find((nom) => erreurs[nom])!].focus();
      return;
    }
    enCours = true;
    bouton.disabled = true;
    groupe.disabled = true;
    formulaire.setAttribute('aria-busy', 'true');
    libelle.textContent = 'Envoi en cours…';
    annoncer('Envoi en cours…');
    const controleur = new AbortController();
    const minuterie = window.setTimeout(() => controleur.abort(), 30_000);
    let premierInvalide: Champ | undefined;
    try {
      const piege = formulaire.elements.namedItem('website') as HTMLInputElement;
      const reponse = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...saisie, website: piege.value }),
        signal: controleur.signal,
        credentials: 'same-origin',
      });
      const corps = await reponse.json().catch(() => ({})) as ReponseContact;
      if (reponse.ok) {
        formulaire.reset();
        annoncer('Votre message a bien été envoyé. Je vous répondrai par e-mail.');
      } else {
        if (reponse.status === 422 && corps.fields) {
          afficherErreurs(corps.fields);
          premierInvalide = CHAMPS.find((nom) => typeof corps.fields?.[nom] === 'string' && corps.fields[nom]);
        }
        const defaut = reponse.status === 429
          ? 'Trop de messages ont été envoyés. Patientez quelques minutes avant de réessayer.'
          : 'Le message n’a pas pu être envoyé. Réessayez dans un instant ou écrivez-moi directement par e-mail.';
        annoncer(typeof corps.message === 'string' && corps.message ? corps.message : defaut);
      }
    } catch {
      annoncer('L’envoi n’a pas pu être confirmé. Réessayez dans un instant ou écrivez-moi directement par e-mail.');
    } finally {
      window.clearTimeout(minuterie);
      enCours = false;
      bouton.disabled = false;
      groupe.disabled = false;
      formulaire.removeAttribute('aria-busy');
      libelle.textContent = 'Envoyer le message';
      if (premierInvalide) champs[premierInvalide].focus();
      else statut.focus();
    }
  });
}
