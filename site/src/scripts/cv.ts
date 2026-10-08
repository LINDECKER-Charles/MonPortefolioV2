/**
 * Téléchargement du CV, mesuré par `mesurer()` et non par les attributs
 * data-umami-event : le traceur retient la navigation pour envoyer son
 * événement, et l'attribut `download` serait alors ignoré (le PDF s'ouvrirait
 * au lieu de se télécharger).
 */
import { mesurer } from './mesure';

export function brancherCv(): void {
  for (const lien of document.querySelectorAll<HTMLAnchorElement>('a[data-cv-telechargement]')) {
    lien.addEventListener('click', () => {
      mesurer('cv-telechargement', { emplacement: lien.dataset.cvTelechargement ?? '' });
    });
  }
}
