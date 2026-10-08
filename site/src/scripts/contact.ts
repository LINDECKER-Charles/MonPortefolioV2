/** Formulaire de contact : le succès confirme l’enregistrement de la demande. */
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
  const compteur = formulaire.querySelector<HTMLElement>('[data-contact-count]');
  const attente = formulaire.querySelector<HTMLElement>('[data-contact-spinner]');

  let enCours = false;
  let erreurValidation = false;
  let finAttente = 0;
  let minuterieAttente: number | undefined;
  const visites = new Set<Champ>();
  const champs = Object.fromEntries(CHAMPS.map((nom) => [nom, formulaire.elements.namedItem(nom)])) as Record<Champ, Saisie>;
  const nombres = new Intl.NumberFormat('fr-FR');
  const requis: Record<Champ, string> = {
    name: 'Indiquez votre nom.',
    email: 'Indiquez votre adresse e-mail.',
    subject: 'Indiquez le sujet de votre message.',
    message: 'Écrivez votre message.',
  };
  function valider(nom: Champ): string | undefined {
    const valeur = champs[nom].value.trim();
    if (!valeur) return requis[nom];
    if (nom === 'email') {
      if (valeur.length > 254 || champs.email.validity.typeMismatch) return 'Saisissez une adresse e-mail valide.';
      return;
    }
    const limites = { name: [2, 100], subject: [3, 160], message: [10, 5000] } as const;
    const longueur = [...valeur].length;
    const [min, max] = limites[nom];
    if (longueur < min) return `Saisissez au moins ${min} caractères.`;
    if (longueur > max) return `Saisissez au maximum ${nombres.format(max)} caractères.`;
  }
  function signalerChamp(nom: Champ, texte?: string): void {
    const erreur = document.getElementById(`contact-${nom}-error`);
    if (texte) {
      champs[nom].setAttribute('aria-invalid', 'true');
      delete champs[nom].dataset.valid;
    } else {
      champs[nom].removeAttribute('aria-invalid');
      if (visites.has(nom)) champs[nom].dataset.valid = 'true';
      else delete champs[nom].dataset.valid;
    }
    if (erreur) {
      erreur.hidden = !texte;
      if (erreur.textContent !== (texte ?? '')) erreur.textContent = texte ?? '';
    }
  }
  function effacerErreurs(): void {
    for (const nom of CHAMPS) signalerChamp(nom);
  }
  function afficherErreurs(erreurs: Partial<Record<Champ, string>>): void {
    for (const nom of CHAMPS) {
      const texte = erreurs[nom];
      if (typeof texte !== 'string' || !texte) continue;
      visites.add(nom);
      signalerChamp(nom, texte);
    }
  }
  function annoncer(texte: string, etat: 'pending' | 'success' | 'error'): void {
    statut!.textContent = texte;
    statut!.dataset.state = etat;
    statut!.hidden = false;
  }
  function actualiserCompteur(): void {
    if (!compteur) return;
    const longueur = [...champs.message.value].length;
    compteur.textContent = `${nombres.format(longueur)} / ${nombres.format(5000)} caractères`;
    compteur.dataset.state = longueur > 5000 ? 'error' : longueur >= 4500 ? 'limite' : 'normal';
  }
  function actualiserBouton(): void {
    const secondes = Math.max(0, Math.ceil((finAttente - Date.now()) / 1000));
    bouton!.disabled = enCours || secondes > 0;
    libelle!.textContent = enCours ? 'Envoi en cours…' : secondes > 0 ? `Réessayer dans ${secondes} s` : 'Envoyer le message';
    formulaire!.toggleAttribute('data-contact-cooldown', secondes > 0);
    if (attente) attente.hidden = !enCours;
    if (secondes === 0 && minuterieAttente !== undefined) {
      window.clearInterval(minuterieAttente);
      minuterieAttente = undefined;
    }
  }
  function respecterDelai(valeur: string | null): void {
    if (!valeur || !/^\d+$/.test(valeur)) return;
    const secondes = Number(valeur);
    if (!Number.isSafeInteger(secondes) || secondes <= 0 || secondes > 86_400) return;
    finAttente = Date.now() + secondes * 1000;
    if (minuterieAttente !== undefined) window.clearInterval(minuterieAttente);
    minuterieAttente = window.setInterval(actualiserBouton, 1000);
  }
  for (const nom of CHAMPS) {
    champs[nom].addEventListener('blur', (evenement) => {
      // L’erreur ne doit pas déplacer le bouton entre son appui et son relâchement.
      // La soumission valide tous les champs quand le focus passe au bouton.
      if (enCours || (evenement as FocusEvent).relatedTarget === bouton) return;
      visites.add(nom);
      signalerChamp(nom, valider(nom));
    });
    champs[nom].addEventListener('input', () => {
      if (statut.dataset.state === 'success') statut.hidden = true;
      if (nom === 'message') actualiserCompteur();
      if (visites.has(nom)) signalerChamp(nom, valider(nom));
      if (erreurValidation && CHAMPS.every((champ) => champs[champ].getAttribute('aria-invalid') !== 'true')) {
        statut.hidden = true;
        erreurValidation = false;
      }
    });
  }
  // La validation personnalisée permet d’associer chaque erreur à son champ.
  formulaire.noValidate = true;
  actualiserBouton();
  actualiserCompteur();
  formulaire.addEventListener('submit', async (evenement) => {
    evenement.preventDefault();
    if (enCours || Date.now() < finAttente) return;
    effacerErreurs();
    statut.hidden = true;
    erreurValidation = false;
    const saisie = Object.fromEntries(CHAMPS.map((nom) => [nom, champs[nom].value.trim()])) as Record<Champ, string>;
    const erreurs: Partial<Record<Champ, string>> = {};
    for (const nom of CHAMPS) {
      visites.add(nom);
      const erreur = valider(nom);
      if (erreur) erreurs[nom] = erreur;
      else signalerChamp(nom);
    }
    if (Object.keys(erreurs).length) {
      erreurValidation = true;
      afficherErreurs(erreurs);
      annoncer('Vérifiez les champs indiqués avant d’envoyer votre message.', 'error');
      champs[CHAMPS.find((nom) => erreurs[nom])!].focus();
      return;
    }
    enCours = true;
    groupe.disabled = true;
    formulaire.setAttribute('aria-busy', 'true');
    actualiserBouton();
    annoncer('Envoi en cours…', 'pending');
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
        visites.clear();
        effacerErreurs();
        actualiserCompteur();
        annoncer('Votre message a bien été envoyé. Je vous répondrai par e-mail.', 'success');
      } else {
        if (reponse.status === 422 && corps.fields) {
          erreurValidation = true;
          afficherErreurs(corps.fields);
          premierInvalide = CHAMPS.find((nom) => typeof corps.fields?.[nom] === 'string' && corps.fields[nom]);
        }
        const defaut = reponse.status === 429
          ? 'Trop de messages ont été envoyés. Patientez avant de réessayer.'
          : 'Le message n’a pas pu être envoyé. Réessayez dans un instant ou écrivez-moi directement par e-mail.';
        if (reponse.status === 429) respecterDelai(reponse.headers.get('Retry-After'));
        annoncer(typeof corps.message === 'string' && corps.message ? corps.message : defaut, 'error');
      }
    } catch {
      annoncer('L’envoi n’a pas pu être confirmé. Réessayez dans un instant ou écrivez-moi directement par e-mail.', 'error');
    } finally {
      window.clearTimeout(minuterie);
      enCours = false;
      groupe.disabled = false;
      formulaire.removeAttribute('aria-busy');
      actualiserBouton();
      if (premierInvalide) champs[premierInvalide].focus();
      else statut.focus();
    }
  });
}
