/**
 * Copie de l'adresse e-mail dans le presse-papiers. En cas de refus (contexte
 * non sécurisé, permission), l'adresse affichée est sélectionnée : il ne reste
 * qu'à la copier au clavier. Dans les deux cas, le libellé dit ce qui s'est
 * passé, puis revient à son état initial.
 */
import { mesurer } from './mesure';

const DUREE_CONFIRMATION = 2500;

function selectionner(texte: string): boolean {
  const cible = [...document.querySelectorAll<HTMLElement>('[data-adresse]')].find(
    (element) => element.textContent?.trim() === texte,
  );
  if (!cible) return false;
  const plage = document.createRange();
  plage.selectNodeContents(cible);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(plage);
  return true;
}

export function brancherCopie(): void {
  for (const bouton of document.querySelectorAll<HTMLButtonElement>('[data-copier]')) {
    const libelle = bouton.querySelector<HTMLElement>('.copier__libelle');
    const statut = bouton.nextElementSibling?.matches('[data-copier-statut]')
      ? (bouton.nextElementSibling as HTMLElement)
      : null;
    const initial = libelle?.textContent ?? '';
    let minuterie: number | undefined;

    const annoncer = (texte: string, reussi: boolean) => {
      if (libelle) libelle.textContent = texte;
      if (statut) statut.textContent = texte;
      bouton.classList.toggle('est-copie', reussi);
      window.clearTimeout(minuterie);
      minuterie = window.setTimeout(() => {
        if (libelle) libelle.textContent = initial;
        if (statut) statut.textContent = '';
        bouton.classList.remove('est-copie');
      }, DUREE_CONFIRMATION);
    };

    bouton.addEventListener('click', async () => {
      const adresse = bouton.dataset.copier ?? '';
      mesurer('contact-copie', { emplacement: bouton.dataset.emplacement ?? '' });
      try {
        await navigator.clipboard.writeText(adresse);
        annoncer('Adresse copiée', true);
      } catch {
        annoncer(selectionner(adresse) ? 'Adresse sélectionnée' : 'Copie impossible', false);
      }
    });
  }
}
