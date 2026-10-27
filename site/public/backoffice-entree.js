/* L’ouverture de l’entrée du backoffice, posée avant le premier rendu
   (components/backoffice/BackofficePage.astro) ; l’entrée JJK, sans générique. */
(function () {
  var racine = document.documentElement;
  function lire(stockage, cle) {
    try {
      return window[stockage].getItem(cle);
    } catch (e) {
      return null;
    }
  }
  var jjk = lire('localStorage', 'cl-backoffice-jjk') === '1';
  if (jjk) racine.setAttribute('data-entree-jjk', '');
  if (lire('localStorage', 'cl-backoffice-session')) return racine.setAttribute('data-session-probable', '');
  if (jjk || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var complete = !lire('sessionStorage', 'cl-backoffice-generique');
  racine.setAttribute('data-ouverture', complete ? 'complete' : 'courte');
  if (complete) racine.setAttribute('data-nuit-forcee', '');
  try {
    window.sessionStorage.setItem('cl-backoffice-generique', '1');
  } catch (e) {}
})();
