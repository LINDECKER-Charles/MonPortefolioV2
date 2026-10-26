/*
 * Maquette « L’atelier s’allume » : thème et ouverture, posés avant le premier
 * rendu (chargé de façon synchrone dans <head> ; aucun script en ligne, comme
 * sur le site), puis la bascule lanterne et son allumage (scripts/theme.ts).
 *
 * Thème : ?theme=jour|nuit, puis le choix enregistré (localStorage
 * « cl-theme », celui du site), puis prefers-color-scheme.
 *
 * Ouverture : ?ouverture=complete|courte|aucune ; sinon complète à la
 * première visite de l’onglet, courte ensuite (sessionStorage). Aucune en
 * mouvement réduit, ni quand l’adresse demande une scène (?scene=…).
 *
 * Autres réglages de l’adresse : ?veille=1 (scène sombre le jour), ?reduit=1
 * (mouvement réduit simulé), ?lent=1 (ralenti × 3), ?regie=0 (régie
 * masquée, pour les captures).
 */
(function () {
  'use strict';
  var racine = document.documentElement;
  var parametres = new URLSearchParams(window.location.search);

  function lire(stockage, cle) {
    try { return window[stockage].getItem(cle); } catch (e) { return null; }
  }
  function ecrire(stockage, cle, valeur) {
    try { window[stockage].setItem(cle, valeur); } catch (e) { /* stockage indisponible : ce choix vaut pour la page */ }
  }

  var theme = parametres.get('theme');
  if (theme !== 'jour' && theme !== 'nuit') theme = lire('localStorage', 'cl-theme');
  if (theme !== 'jour' && theme !== 'nuit') theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'nuit' : 'jour';
  racine.setAttribute('data-theme', theme);
  racine.classList.add('js');

  var reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches || parametres.get('reduit') === '1';
  if (reduit) racine.classList.add('mouvement-reduit');
  if (parametres.get('veille') === '1') racine.setAttribute('data-scene-jour', 'veille');
  if (parametres.get('regie') === '0') racine.setAttribute('data-sans-regie', '');
  // Ralenti × 3 : toutes les durées découlent de --d-ui et --d-scene.
  if (parametres.get('lent') === '1') {
    racine.style.setProperty('--d-ui', '600ms');
    racine.style.setProperty('--d-scene', '1200ms');
  }

  var ouverture = parametres.get('ouverture');
  if (ouverture !== 'complete' && ouverture !== 'courte' && ouverture !== 'aucune') {
    ouverture = lire('sessionStorage', 'cl-atelier-ouverture') ? 'courte' : 'complete';
  }
  if (reduit || parametres.get('scene')) ouverture = 'aucune';
  if (ouverture !== 'aucune') racine.setAttribute('data-ouverture', ouverture);
  ecrire('sessionStorage', 'cl-atelier-ouverture', '1');

  /* La bascule : vers la nuit, l’obscurité tombe des bords et se referme sur la
     lanterne touchée ; vers le jour, la lumière part d’elle. */
  function poser(valeur) {
    racine.setAttribute('data-theme', valeur);
    var boutons = document.querySelectorAll('[data-theme-bascule]');
    for (var i = 0; i < boutons.length; i++) {
      boutons[i].setAttribute('aria-pressed', String(valeur === 'nuit'));
      boutons[i].title = valeur === 'nuit' ? 'Passer en mode jour' : 'Passer en mode nuit';
    }
  }

  function terminer() {
    racine.removeAttribute('data-transition-theme');
    racine.style.removeProperty('--vt-x');
    racine.style.removeProperty('--vt-y');
  }

  function basculer(bouton) {
    var suivant = racine.getAttribute('data-theme') === 'nuit' ? 'jour' : 'nuit';
    ecrire('localStorage', 'cl-theme', suivant);
    if (racine.classList.contains('mouvement-reduit')) {
      poser(suivant);
      return;
    }
    if (typeof document.startViewTransition === 'function') {
      var boite = bouton.getBoundingClientRect();
      racine.style.setProperty('--vt-x', Math.round(boite.left + boite.width / 2) + 'px');
      racine.style.setProperty('--vt-y', Math.round(boite.top + boite.height / 2) + 'px');
      racine.setAttribute('data-transition-theme', suivant === 'nuit' ? 'vers-nuit' : 'vers-jour');
      var transition = document.startViewTransition(function () { poser(suivant); });
      transition.finished.catch(function () {}).then(terminer);
      return;
    }
    racine.setAttribute('data-transition-theme', 'couleurs');
    void racine.offsetWidth;
    poser(suivant);
    window.setTimeout(terminer, 820);
  }

  document.addEventListener('DOMContentLoaded', function () {
    poser(racine.getAttribute('data-theme'));
    var boutons = document.querySelectorAll('[data-theme-bascule]');
    for (var i = 0; i < boutons.length; i++) {
      boutons[i].addEventListener('click', function (evenement) { basculer(evenement.currentTarget); });
    }
  });
})();
