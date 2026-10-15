/*
 * Thème appliqué AVANT le premier rendu : chargé en synchrone dans le <head>,
 * il évite qu'une page s'affiche en jour puis bascule en nuit. Fichier et non
 * script en ligne : la CSP du site interdit tout script en ligne.
 *
 * Le choix mémorisé du lecteur prime ; sans choix, la préférence du système.
 * La classe `js` permet aux styles de préparer ce que les scripts animeront
 * (tracé de la figure 1, illustrations chargées à l'approche).
 */
(function () {
  var racine = document.documentElement;
  var choix = null;
  try {
    choix = window.localStorage.getItem('cl-theme');
  } catch (e) {}
  if (choix !== 'nuit' && choix !== 'jour') choix = null;
  var nuit = choix ? choix === 'nuit' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  racine.setAttribute('data-theme', nuit ? 'nuit' : 'jour');
  racine.classList.add('js');
})();
