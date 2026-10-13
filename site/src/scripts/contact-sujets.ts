/**
 * Puces de sujet du formulaire de contact : un clic remplit le champ « Le
 * sujet », qu’on peut ensuite retoucher ; « Autre » rend la main au champ
 * libre. La puce qui correspond au champ est marquée (aria-pressed). Le champ
 * reste la seule donnée envoyée : rien ne change du contrat de l’API ni de la
 * validation (scripts/contact.ts), qui écoute l’événement `input`.
 */
export function brancherSujets(): void {
  const champ = document.querySelector<HTMLInputElement>('#contact-subject');
  const puces = [...document.querySelectorAll<HTMLButtonElement>('[data-sujet]')];
  if (!champ || !puces.length) return;
  const suggestions = puces.map((puce) => puce.dataset.sujet ?? '').filter(Boolean);

  const actualiser = (): void => {
    const valeur = champ.value.trim();
    for (const puce of puces) {
      const sujet = puce.dataset.sujet ?? '';
      const choisie = sujet ? sujet === valeur : valeur !== '' && !suggestions.includes(valeur);
      puce.setAttribute('aria-pressed', String(choisie));
    }
  };

  for (const puce of puces) {
    puce.addEventListener('click', () => {
      const sujet = puce.dataset.sujet ?? '';
      if (sujet) {
        champ.value = sujet;
      } else {
        if (suggestions.includes(champ.value.trim())) champ.value = '';
        champ.focus();
      }
      champ.dispatchEvent(new Event('input', { bubbles: true }));
      actualiser();
    });
  }
  champ.addEventListener('input', actualiser);
  // Après un envoi réussi, le formulaire est vidé : les puces aussi.
  champ.form?.addEventListener('reset', () => window.setTimeout(actualiser));
  actualiser();
}
