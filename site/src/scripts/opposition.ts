/**
 * Opposition à la mesure d'audience : le bouton écrit ou retire la clé
 * `umami.disabled`, que le traceur relit avant chaque envoi et que le chargeur
 * /mesure.js consulte avant même de le télécharger. Effet immédiat et
 * durable, dans les deux sens. Aucun événement n'est envoyé au moment du
 * choix : ce serait mesurer précisément le refus.
 */
const CLE = 'umami.disabled';

function lireRefus(): boolean | null {
  try {
    return Boolean(window.localStorage.getItem(CLE));
  } catch {
    return null;
  }
}

export function brancherOpposition(): void {
  const bouton = document.querySelector<HTMLButtonElement>('[data-opposition]');
  const etat = document.querySelector<HTMLElement>('[data-opposition-etat]');
  if (!bouton || !etat) return;

  const afficher = () => {
    const refus = lireRefus();
    if (refus === null) {
      etat.textContent =
        'Votre navigateur bloque le stockage local\u00a0: votre choix ne peut pas être retenu. Le signal Global Privacy Control, s’il est activé, empêche toujours la mesure.';
      bouton.hidden = true;
      return;
    }
    if (navigator.globalPrivacyControl === true) {
      etat.textContent = 'Votre navigateur envoie le signal Global Privacy Control\u00a0: vos visites ne sont pas mesurées.';
    } else {
      etat.textContent = refus ? 'Vos visites ne sont pas mesurées.' : 'Vos visites sont mesurées, de façon anonyme.';
    }
    bouton.textContent = refus ? 'Accepter à nouveau la mesure' : 'Ne plus être mesuré';
    bouton.hidden = false;
  };

  bouton.addEventListener('click', () => {
    try {
      if (lireRefus()) window.localStorage.removeItem(CLE);
      else window.localStorage.setItem(CLE, '1');
    } catch {
      // Stockage bloqué : `afficher` le dit.
    }
    afficher();
  });

  afficher();
}

declare global {
  interface Navigator {
    globalPrivacyControl?: boolean;
  }
}
