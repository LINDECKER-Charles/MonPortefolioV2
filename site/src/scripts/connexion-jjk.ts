/**
 * L’entrée Jujutsu Kaisen du backoffice, à la demande. Deux boutons
 * `[data-entree-jjk-bascule]` (le « JJK » discret du pied de l’entrée
 * lanterne, « Revenir à la lanterne » au pied du sanctuaire) posent ou
 * retirent `data-entree-jjk` sur <html> et le mémorisent
 * (« cl-backoffice-jjk ») : public/backoffice-entree.js le repose avant le
 * premier rendu. Le changement d’habit passe par une View Transition, une
 * entaille d’encre (styles/connexion-sanctuaire.css), sauf en mouvement réduit.
 *
 * La mise en scène JJK (connexion-sanctuaire.ts : roue, techniques,
 * territoire, cinématique) ne se charge qu’en mode JJK, la session vérifiée :
 * formulaire de connexion actif, ou un autre écran de l’entrée affiché. Une
 * session déjà ouverte n’en télécharge rien. Ni l’API ni la session ne
 * passent par ici. Chargé avec la page : compté dans son budget, d’où sa
 * concision.
 */
const CLE = 'cl-backoffice-jjk';

export function brancherEntreeJjk(): void {
  const racine = document.documentElement;
  const login = document.getElementById('bo-login')!;
  const champs = login.querySelector('fieldset')!;
  const bascules = [...document.querySelectorAll<HTMLButtonElement>('[data-entree-jjk-bascule]')];
  const actif = () => racine.hasAttribute('data-entree-jjk');
  let chargement: Promise<void> | undefined;

  function charger(): void {
    if (chargement || !actif() || !document.body.hasAttribute('data-entree') || (!login.hidden && champs.disabled)) return;
    chargement = import('./connexion-sanctuaire').then((module) => module.brancherSanctuaire(), () => { chargement = undefined; });
  }

  for (const bouton of bascules) {
    bouton.hidden = false;
    bouton.addEventListener('click', () => {
      const jjk = !actif();
      try {
        if (jjk) localStorage.setItem(CLE, '1');
        else localStorage.removeItem(CLE);
      } catch { /* Stockage bloqué : le choix vaut pour cette page. */ }
      const appliquer = () => {
        racine.toggleAttribute('data-entree-jjk', jjk);
        charger();
        // Le bouton pressé part avec son habit : le focus passe à celui de l’autre.
        bascules.find((autre) => autre !== bouton && autre.checkVisibility())?.focus();
      };
      if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) return appliquer();
      racine.dataset.transitionEntree = 'habit';
      const vue = document.startViewTransition(appliquer);
      const fin = () => { if (racine.dataset.transitionEntree === 'habit') delete racine.dataset.transitionEntree; };
      // Une transition sautée (onglet masqué, autre transition) rejette `ready` : ce n’est pas une erreur.
      void vue.ready.catch(fin);
      void vue.finished.then(fin, fin);
    });
  }
  new MutationObserver(charger).observe(login, { attributes: true, subtree: true, attributeFilter: ['hidden', 'disabled'] });
  new MutationObserver(charger).observe(document.body, { attributes: true, attributeFilter: ['data-entree'] });
  charger();
}
