/*
 * Direction A — « Édition reliée » : comportements de la maquette.
 *
 * Chargé de façon synchrone dans <head> pour poser le thème avant le premier
 * rendu, puis branché au chargement du document. Tout le contenu reste lisible
 * sans ce script ; il n’ajoute que des confort : bascule de thème, signet qui
 * suit la lecture, sommaire mobile, figure du plafond, onglets de la boucle.
 *
 * Thème : ?theme=jour|nuit (prioritaire, pour les captures), puis le choix
 * enregistré (localStorage « cl-theme »), sinon prefers-color-scheme.
 */
(function () {
  'use strict';

  var racine = document.documentElement;
  racine.classList.add('js');

  var CLE = 'cl-theme';
  var media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  var mouvementReduit = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function lireParametre() {
    try {
      var valeur = new URLSearchParams(window.location.search).get('theme');
      return valeur === 'jour' || valeur === 'nuit' ? valeur : null;
    } catch (e) { return null; }
  }
  function lireChoix() {
    try { var v = localStorage.getItem(CLE); return v === 'jour' || v === 'nuit' ? v : null; } catch (e) { return null; }
  }
  function ecrireChoix(v) { try { localStorage.setItem(CLE, v); } catch (e) { /* stockage indisponible */ } }

  var parametre = lireParametre();
  var initial = parametre || lireChoix();
  if (initial) racine.setAttribute('data-theme', initial);

  function themeCourant() {
    var attribut = racine.getAttribute('data-theme');
    if (attribut) return attribut;
    return media && media.matches ? 'nuit' : 'jour';
  }

  function appliquer(theme) {
    racine.setAttribute('data-theme', theme);
    var boutons = document.querySelectorAll('[data-theme-bascule]');
    for (var i = 0; i < boutons.length; i++) {
      boutons[i].setAttribute('aria-pressed', theme === 'nuit' ? 'true' : 'false');
    }
  }

  function basculer() {
    var suivant = themeCourant() === 'nuit' ? 'jour' : 'nuit';
    ecrireChoix(suivant);
    if (!mouvementReduit && document.startViewTransition) {
      document.startViewTransition(function () { appliquer(suivant); });
    } else {
      appliquer(suivant);
    }
  }

  /* Notification courte pour les pages qui n’appartiennent pas à la maquette */
  var toastMinuterie;
  function annoncer(message) {
    var toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      toast.setAttribute('role', 'status');
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('est-visible');
    clearTimeout(toastMinuterie);
    toastMinuterie = setTimeout(function () { toast.classList.remove('est-visible'); }, 2600);
  }

  function brancherBascule() {
    var boutons = document.querySelectorAll('[data-theme-bascule]');
    for (var i = 0; i < boutons.length; i++) {
      boutons[i].setAttribute('aria-pressed', themeCourant() === 'nuit' ? 'true' : 'false');
      boutons[i].addEventListener('click', basculer);
    }
    if (media && media.addEventListener) {
      media.addEventListener('change', function () {
        if (!racine.getAttribute('data-theme') || (!lireChoix() && !parametre)) {
          racine.removeAttribute('data-theme');
          var b = document.querySelectorAll('[data-theme-bascule]');
          for (var j = 0; j < b.length; j++) b[j].setAttribute('aria-pressed', media.matches ? 'true' : 'false');
        }
      });
    }
  }

  function brancherHorsMaquette() {
    document.addEventListener('click', function (evenement) {
      var lien = evenement.target.closest ? evenement.target.closest('a[data-hors-maquette]') : null;
      if (!lien) return;
      evenement.preventDefault();
      annoncer('« ' + lien.getAttribute('data-hors-maquette') + ' » n’est pas maquettée dans cette direction.');
    });
  }

  /* Menu mobile : fermeture à Échap et au clic extérieur */
  function brancherMenu() {
    var menus = document.querySelectorAll('.menu-mobile');
    for (var i = 0; i < menus.length; i++) {
      (function (menu) {
        menu.addEventListener('keydown', function (e) {
          if (e.key === 'Escape' && menu.open) { menu.open = false; menu.querySelector('summary').focus(); }
        });
        document.addEventListener('click', function (e) {
          if (menu.open && !menu.contains(e.target)) menu.open = false;
        });
      })(menus[i]);
    }
  }

  /* Le signet : la lanterne suit la section lue, le ruban s’allonge jusqu’à elle. */
  function brancherSignet() {
    var signet = document.querySelector('.signet');
    if (!signet) return;
    var bouton = document.querySelector('.bouton-sommaire');
    if (bouton) {
      bouton.setAttribute('data-actif', '');
      bouton.addEventListener('click', function () {
        var ouvert = signet.classList.toggle('est-ouvert');
        bouton.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
        positionnerRuban();
      });
      signet.addEventListener('click', function (e) {
        if (e.target.closest('a') && signet.classList.contains('est-ouvert')) {
          signet.classList.remove('est-ouvert');
          bouton.setAttribute('aria-expanded', 'false');
        }
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && signet.classList.contains('est-ouvert')) {
          signet.classList.remove('est-ouvert');
          bouton.setAttribute('aria-expanded', 'false');
          bouton.focus();
        }
      });
    }

    var liens = signet.querySelectorAll('a[href^="#"]');
    var cibles = [];
    for (var i = 0; i < liens.length; i++) {
      var id = liens[i].getAttribute('href').slice(1);
      var cible = document.getElementById(id);
      if (cible) cibles.push({ lien: liens[i], cible: cible });
    }
    if (!cibles.length) return;

    var courant = null;
    function positionnerRuban() {
      if (!courant) return;
      var item = courant.lien.closest('.signet__liste > li');
      var repere = courant.lien.closest('.signet__sous') ? courant.lien : item.querySelector(':scope > a');
      var haut = repere.getBoundingClientRect().top - signet.getBoundingClientRect().top;
      signet.style.setProperty('--ruban', Math.max(8, haut + repere.offsetHeight / 2 - 12) + 'px');
    }
    function activer(entree) {
      if (courant === entree) return;
      courant = entree;
      for (var j = 0; j < cibles.length; j++) {
        cibles[j].lien.removeAttribute('aria-current');
        var li = cibles[j].lien.closest('.signet__liste > li');
        if (li) li.classList.remove('est-courant');
      }
      entree.lien.setAttribute('aria-current', 'location');
      var parent = entree.lien.closest('.signet__liste > li');
      if (parent) parent.classList.add('est-courant');
      positionnerRuban();
    }
    function mesurer() {
      var ligne = window.innerHeight * 0.32;
      var choisi = cibles[0];
      for (var k = 0; k < cibles.length; k++) {
        if (cibles[k].cible.getBoundingClientRect().top - ligne <= 0) choisi = cibles[k];
      }
      activer(choisi);
    }
    var attente = false;
    window.addEventListener('scroll', function () {
      if (attente) return;
      attente = true;
      requestAnimationFrame(function () { attente = false; mesurer(); });
    }, { passive: true });
    window.addEventListener('resize', function () { positionnerRuban(); });
    mesurer();
  }

  /* La figure du plafond : la courbe se trace à son arrivée, se rejoue au clic. */
  function brancherPlafond() {
    var figures = document.querySelectorAll('.figure-plafond');
    for (var i = 0; i < figures.length; i++) {
      (function (bouton) {
        var courbes = bouton.querySelectorAll('.fig-courbe');
        for (var c = 0; c < courbes.length; c++) {
          var l = Math.ceil(courbes[c].getTotalLength ? courbes[c].getTotalLength() : 1200);
          courbes[c].style.setProperty('--longueur', l);
        }
        if (mouvementReduit) return;
        function jouer() {
          bouton.classList.remove('est-trace');
          bouton.classList.add('est-pret');
          void bouton.offsetWidth;
          requestAnimationFrame(function () { bouton.classList.add('est-trace'); });
        }
        bouton.classList.add('est-pret');
        if ('IntersectionObserver' in window) {
          var obs = new IntersectionObserver(function (entrees) {
            for (var e = 0; e < entrees.length; e++) {
              if (entrees[e].isIntersecting) { bouton.classList.add('est-trace'); obs.disconnect(); }
            }
          }, { threshold: 0.45 });
          obs.observe(bouton);
        } else {
          bouton.classList.add('est-trace');
        }
        bouton.addEventListener('click', jouer);
      })(figures[i]);
    }
  }

  /* Onglets de la boucle (PvZ) : flèches gauche / droite, Début, Fin. */
  function brancherOnglets() {
    var listes = document.querySelectorAll('[role="tablist"]');
    for (var i = 0; i < listes.length; i++) {
      (function (liste) {
        var onglets = Array.prototype.slice.call(liste.querySelectorAll('[role="tab"]'));
        var stations = document.querySelectorAll('[data-station]');
        function choisir(index, focaliser) {
          onglets.forEach(function (o, n) {
            var actif = n === index;
            o.setAttribute('aria-selected', actif ? 'true' : 'false');
            o.tabIndex = actif ? 0 : -1;
            var panneau = document.getElementById(o.getAttribute('aria-controls'));
            if (panneau) panneau.hidden = !actif;
          });
          for (var s = 0; s < stations.length; s++) {
            stations[s].classList.toggle('est-active', Number(stations[s].getAttribute('data-station')) === index);
          }
          if (focaliser) onglets[index].focus();
        }
        onglets.forEach(function (o, n) {
          o.addEventListener('click', function () { choisir(n, false); });
          o.addEventListener('keydown', function (e) {
            var cible = null;
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') cible = (n + 1) % onglets.length;
            if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') cible = (n - 1 + onglets.length) % onglets.length;
            if (e.key === 'Home') cible = 0;
            if (e.key === 'End') cible = onglets.length - 1;
            if (cible !== null) { e.preventDefault(); choisir(cible, true); }
          });
        });
        for (var s = 0; s < stations.length; s++) {
          stations[s].addEventListener('click', function () { choisir(Number(this.getAttribute('data-station')), false); });
        }
        choisir(0, false);
      })(listes[i]);
    }
  }

  /* Galerie défilante (mobile) : compteur « 2 / 3 » (E7) */
  function brancherCompteurs() {
    var galeries = document.querySelectorAll('[data-galerie]');
    for (var i = 0; i < galeries.length; i++) {
      (function (galerie) {
        var compteur = document.getElementById(galerie.getAttribute('data-galerie'));
        if (!compteur) return;
        var items = galerie.children;
        function maj() {
          var largeur = items[0] ? items[0].getBoundingClientRect().width : 1;
          var n = Math.round(galerie.scrollLeft / (largeur + 16)) + 1;
          compteur.textContent = Math.min(items.length, Math.max(1, n)) + ' / ' + items.length;
        }
        galerie.addEventListener('scroll', function () { requestAnimationFrame(maj); }, { passive: true });
        maj();
      })(galeries[i]);
    }
  }

  /* Glossaire : la définition s’ouvre sous le terme. */
  function brancherGlossaire() {
    var termes = document.querySelectorAll('.terme[popovertarget]');
    for (var i = 0; i < termes.length; i++) {
      (function (terme) {
        var bulle = document.getElementById(terme.getAttribute('popovertarget'));
        if (!bulle) return;
        bulle.addEventListener('toggle', function (e) {
          if (e.newState !== 'open') return;
          var r = terme.getBoundingClientRect();
          var largeur = bulle.offsetWidth;
          var gauche = Math.min(Math.max(12, r.left), window.innerWidth - largeur - 12);
          var haut = r.bottom + 8;
          if (haut + bulle.offsetHeight > window.innerHeight - 12) haut = r.top - bulle.offsetHeight - 8;
          bulle.style.left = gauche + 'px';
          bulle.style.top = haut + 'px';
        });
      })(termes[i]);
    }
  }

  /* Copie de l’adresse e-mail */
  function brancherCopie() {
    var boutons = document.querySelectorAll('[data-copier]');
    for (var i = 0; i < boutons.length; i++) {
      boutons[i].hidden = false;
      boutons[i].addEventListener('click', function () {
        var texte = this.getAttribute('data-copier');
        var bouton = this;
        function fini() { bouton.textContent = 'Copiée'; setTimeout(function () { bouton.textContent = 'Copier'; }, 1800); }
        if (navigator.clipboard) navigator.clipboard.writeText(texte).then(fini, fini); else fini();
      });
    }
  }

  /* Repliables ouverts d’office sur grand écran */
  function ouvrirSurGrandEcran() {
    if (!window.matchMedia('(min-width: 70rem)').matches) return;
    var blocs = document.querySelectorAll('details[data-ouvert-large]');
    for (var i = 0; i < blocs.length; i++) blocs[i].open = true;
  }

  function demarrer() {
    brancherBascule();
    brancherHorsMaquette();
    brancherMenu();
    brancherSignet();
    brancherPlafond();
    brancherOnglets();
    brancherCompteurs();
    brancherGlossaire();
    brancherCopie();
    ouvrirSurGrandEcran();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', demarrer);
  else demarrer();
})();
