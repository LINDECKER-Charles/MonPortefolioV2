/*
 * Thème jour / nuit de la direction B « Banc d’essai ».
 * Chargé de façon synchrone dans <head> pour éviter tout flash.
 *
 * Priorité : ?theme=jour|nuit dans l’adresse, puis le choix mémorisé
 * (localStorage « cl-theme », comme le site actuel), puis la préférence
 * du système (prefers-color-scheme).
 *
 * Signature : la lanterne s’allume, puis une ligne de mesure balaie la page
 * de haut en bas ; la nuit apparaît derrière elle, la grille s’éteint.
 * En mouvement réduit, ou sans View Transitions, le thème change d’un coup.
 */
(function () {
  var CLE = 'cl-theme';
  var racine = document.documentElement;

  function lireAdresse() {
    try {
      var t = new URLSearchParams(location.search).get('theme');
      return t === 'jour' || t === 'nuit' ? t : null;
    } catch (e) { return null; }
  }
  function lireMemoire() {
    try {
      var t = localStorage.getItem(CLE);
      return t === 'jour' || t === 'nuit' ? t : null;
    } catch (e) { return null; }
  }
  function systeme() {
    return window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'nuit' : 'jour';
  }

  var depuisAdresse = lireAdresse();
  racine.setAttribute('data-theme', depuisAdresse || lireMemoire() || systeme());
  racine.classList.add('js');

  // Notes de maquette (identifiants, formats, gabarit) : masquées par défaut,
  // affichées par ?notes=1 ou par le bouton du pied de page, mémorisées.
  var CLE_NOTES = 'b-notes';
  function notesVoulues() {
    try {
      var n = new URLSearchParams(location.search).get('notes');
      if (n === '1' || n === '0') return n === '1';
    } catch (e) { /* adresse illisible : on passe à la mémoire */ }
    try { return localStorage.getItem(CLE_NOTES) === '1'; } catch (e) { return false; }
  }
  racine.classList.toggle('notes', notesVoulues());

  function synchroniser() {
    var nuit = racine.getAttribute('data-theme') === 'nuit';
    document.querySelectorAll('[data-theme-bascule]').forEach(function (b) {
      b.setAttribute('aria-pressed', nuit ? 'true' : 'false');
      b.setAttribute('title', nuit ? 'Revenir au jour' : 'Passer à la nuit');
    });
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', nuit ? '#0C1220' : '#FAFAF8');
  }

  function appliquer(theme) {
    racine.setAttribute('data-theme', theme);
    try { localStorage.setItem(CLE, theme); } catch (e) { /* stockage indisponible : rien à faire */ }
    synchroniser();
  }

  function basculer() {
    var suivant = racine.getAttribute('data-theme') === 'nuit' ? 'jour' : 'nuit';
    var reduit = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduit || !document.startViewTransition) { appliquer(suivant); return; }

    // La lanterne s’allume (ou s’éteint) d’abord, puis le balayage révèle la page.
    document.querySelectorAll('[data-theme-bascule]').forEach(function (b) {
      b.setAttribute('aria-pressed', suivant === 'nuit' ? 'true' : 'false');
    });
    window.setTimeout(function () {
      var transition = document.startViewTransition(function () {
        racine.classList.add('en-balayage');
        appliquer(suivant);
      });
      transition.finished.finally(function () { racine.classList.remove('en-balayage'); });
    }, 160);
  }

  // Suivre le système tant que personne n’a choisi.
  if (window.matchMedia) {
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
      if (!lireMemoire() && !depuisAdresse) { racine.setAttribute('data-theme', e.matches ? 'nuit' : 'jour'); synchroniser(); }
    });
  }

  function synchroniserNotes() {
    var oui = racine.classList.contains('notes');
    document.querySelectorAll('[data-notes]').forEach(function (b) {
      b.setAttribute('aria-pressed', oui ? 'true' : 'false');
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    synchroniser();
    synchroniserNotes();
    document.querySelectorAll('[data-notes]').forEach(function (b) {
      b.addEventListener('click', function () {
        var oui = !racine.classList.contains('notes');
        racine.classList.toggle('notes', oui);
        try { localStorage.setItem(CLE_NOTES, oui ? '1' : '0'); } catch (e) { /* stockage indisponible */ }
        synchroniserNotes();
      });
    });
    document.querySelectorAll('[data-theme-bascule]').forEach(function (b) {
      b.addEventListener('click', basculer);
    });
  });
})();
