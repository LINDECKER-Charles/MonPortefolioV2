/*
 * Direction C — « Lanterne » : thème, signature et petites interactions.
 * Chargé de façon synchrone dans <head> (aucun script en ligne) : le thème est
 * posé avant le premier rendu, le reste attend le DOM.
 *
 * Ordre de décision du thème : ?theme=jour|nuit, puis le choix enregistré
 * (localStorage « cl-theme »), puis prefers-color-scheme.
 */
(function () {
  'use strict';
  var racine = document.documentElement;
  /* Les commandes qui exigent le script (bascule, copie, annotations) ne
     s’affichent qu’avec lui : sans JavaScript, rien d’inerte à l’écran. */
  racine.classList.add('js');
  var CLE = 'cl-theme';
  var sombre = window.matchMedia('(prefers-color-scheme: dark)');
  var reduit = window.matchMedia('(prefers-reduced-motion: reduce)');

  function lire() {
    try { return localStorage.getItem(CLE); } catch (e) { return null; }
  }
  function ecrire(valeur) {
    try { localStorage.setItem(CLE, valeur); } catch (e) { /* stockage indisponible */ }
  }
  function themeDemande() {
    var parametre = new URLSearchParams(window.location.search).get('theme');
    if (parametre === 'jour' || parametre === 'nuit') return parametre;
    var enregistre = lire();
    if (enregistre === 'jour' || enregistre === 'nuit') return enregistre;
    return sombre.matches ? 'nuit' : 'jour';
  }
  function poser(theme) {
    racine.setAttribute('data-theme', theme);
    var boutons = document.querySelectorAll('[data-theme-bascule]');
    for (var i = 0; i < boutons.length; i++) {
      boutons[i].setAttribute('aria-pressed', theme === 'nuit' ? 'true' : 'false');
    }
  }

  poser(themeDemande());

  sombre.addEventListener('change', function () {
    var parametre = new URLSearchParams(window.location.search).get('theme');
    if (!parametre && !lire()) poser(sombre.matches ? 'nuit' : 'jour');
  });

  /* La signature : l’allumage. La nuit tombe depuis les bords et se referme
     sur la lanterne qu’on vient d’allumer ; le jour se lève à partir d’elle. */
  function basculer(evenement) {
    var bouton = evenement.currentTarget;
    var suivant = racine.getAttribute('data-theme') === 'nuit' ? 'jour' : 'nuit';
    ecrire(suivant);
    if (!document.startViewTransition || reduit.matches) {
      poser(suivant);
      return;
    }
    var boite = bouton.getBoundingClientRect();
    racine.style.setProperty('--vt-x', Math.round(boite.left + boite.width / 2) + 'px');
    racine.style.setProperty('--vt-y', Math.round(boite.top + boite.height / 2) + 'px');
    racine.classList.add(suivant === 'nuit' ? 'vers-nuit' : 'vers-jour');
    var transition = document.startViewTransition(function () { poser(suivant); });
    transition.finished.then(function () {
      racine.classList.remove('vers-nuit', 'vers-jour');
    });
  }

  function lumiereQuiSuit() {
    /* La nuit, une lumière douce suit la scène en cours. En mouvement réduit,
       toutes les scènes gardent leur lumière, sans changement. */
    if (reduit.matches || !('IntersectionObserver' in window)) return;
    var scenes = document.querySelectorAll('[data-scene]');
    if (!scenes.length) return;
    racine.classList.add('lumiere-mobile');
    var visibles = new Map();
    var observateur = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (entree) { visibles.set(entree.target, entree.intersectionRatio); });
      var meilleure = null;
      var score = 0;
      visibles.forEach(function (ratio, scene) {
        if (ratio > score) { score = ratio; meilleure = scene; }
      });
      scenes.forEach(function (scene) { scene.classList.toggle('est-eclairee', scene === meilleure); });
    }, { rootMargin: '-30% 0px -30% 0px', threshold: [0, .25, .5, .75, 1] });
    scenes.forEach(function (scene) { observateur.observe(scene); });
  }

  function sommaireDePage() {
    var liens = document.querySelectorAll('[data-sommaire] a[href^="#"]');
    if (!liens.length || !('IntersectionObserver' in window)) return;
    var parCible = new Map();
    liens.forEach(function (lien) {
      var cible = document.getElementById(lien.getAttribute('href').slice(1));
      if (cible) {
        if (!parCible.has(cible)) parCible.set(cible, []);
        parCible.get(cible).push(lien);
      }
    });
    var actives = new Set();
    var ordre = Array.from(parCible.keys());
    var observateur = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (entree) {
        if (entree.isIntersecting) actives.add(entree.target); else actives.delete(entree.target);
      });
      var presentes = ordre.filter(function (cible) { return actives.has(cible); });
      var courante = presentes[presentes.length - 1];
      liens.forEach(function (lien) { lien.removeAttribute('aria-current'); });
      if (courante) parCible.get(courante).forEach(function (lien) { lien.setAttribute('aria-current', 'location'); });
    }, { rootMargin: '-35% 0px -55% 0px' });
    parCible.forEach(function (_, cible) { observateur.observe(cible); });
  }

  function progression() {
    var barre = document.querySelector('.progression');
    if (!barre) return;
    var prevu = false;
    function mettreAJour() {
      prevu = false;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      barre.style.setProperty('--progression', max > 0 ? Math.min(1, window.scrollY / max).toFixed(4) : '0');
    }
    window.addEventListener('scroll', function () {
      if (!prevu) { prevu = true; window.requestAnimationFrame(mettreAJour); }
    }, { passive: true });
    mettreAJour();
  }

  function tracePlafond() {
    /* Seule figure animée de l’accueil : la courbe se trace à son arrivée,
       une fois ; le bouton « Rejouer le tracé » la relance. */
    var figures = document.querySelectorAll('[data-trace]');
    if (!figures.length || reduit.matches || !('IntersectionObserver' in window)) return;
    figures.forEach(function (figure) {
      figure.querySelectorAll('.fig-courbe, .fig-percee').forEach(function (chemin) {
        chemin.style.setProperty('--longueur', Math.ceil(chemin.getTotalLength()) + 'px');
      });
      figure.classList.add('trace-pret');
      var observateur = new IntersectionObserver(function (entrees) {
        if (entrees[0].isIntersecting) { figure.classList.add('trace-joue'); observateur.disconnect(); }
      }, { threshold: .45 });
      observateur.observe(figure);
      var bouton = figure.querySelector('.rejouer');
      if (bouton) {
        bouton.addEventListener('click', function () {
          figure.classList.remove('trace-joue');
          void figure.offsetWidth;
          figure.classList.add('trace-joue');
        });
      }
    });
  }

  function deroulants() {
    var tous = document.querySelectorAll('details.deroulant');
    document.addEventListener('keydown', function (evenement) {
      if (evenement.key !== 'Escape') return;
      tous.forEach(function (details) {
        if (details.open) { details.open = false; details.querySelector('summary').focus(); }
      });
    });
    document.addEventListener('click', function (evenement) {
      tous.forEach(function (details) {
        if (details.open && !details.contains(evenement.target)) details.open = false;
      });
    });
    tous.forEach(function (details) {
      details.querySelectorAll('a').forEach(function (lien) {
        lien.addEventListener('click', function () { details.open = false; });
      });
    });
  }

  function galeries() {
    /* Sur mobile, les galeries défilent par crans ; le compteur « 2 / 4 »
       suit l’image visible (règle E7). */
    document.querySelectorAll('[data-galerie]').forEach(function (galerie) {
      var piste = galerie.querySelector('.galerie__piste');
      var courant = galerie.querySelector('[data-galerie-courant]');
      if (!piste || !courant) return;
      /* Une piste qui défile doit être atteignable au clavier (flèches). */
      function focalisable() {
        if (piste.scrollWidth > piste.clientWidth + 1) piste.setAttribute('tabindex', '0');
        else piste.removeAttribute('tabindex');
      }
      focalisable();
      window.addEventListener('resize', focalisable, { passive: true });
      piste.addEventListener('scroll', function () {
        var premier = piste.firstElementChild;
        if (!premier) return;
        var pas = premier.getBoundingClientRect().width + parseFloat(getComputedStyle(piste).columnGap || 0);
        var indice = Math.round(piste.scrollLeft / pas) + 1;
        courant.textContent = String(Math.min(piste.children.length, Math.max(1, indice)));
      }, { passive: true });
    });
  }

  function ongletActif() {
    /* Barre d’onglets défilable : l’onglet courant est aligné à gauche, sans
       être coupé ; un fondu signale à droite (et à gauche une fois défilée)
       qu’il reste des onglets. */
    document.querySelectorAll('.onglets').forEach(function (barre) {
      var actif = barre.querySelector('[aria-current="page"]');
      function bords() {
        barre.classList.toggle('onglets--defile', barre.scrollLeft > 2);
        barre.classList.toggle('onglets--fin', barre.scrollLeft + barre.clientWidth >= barre.scrollWidth - 2);
      }
      var max = barre.scrollWidth - barre.clientWidth;
      if (actif && max > 1) {
        /* Le bord gauche tombe toujours au début d’un onglet : celui de
           l’onglet actif, ou du précédent si la barre ne défile pas assez. */
        var origine = barre.getBoundingClientRect().left - barre.scrollLeft;
        var debutActif = actif.getBoundingClientRect().left - origine;
        var cible = 0;
        barre.querySelectorAll('a').forEach(function (onglet) {
          var debut = onglet.getBoundingClientRect().left - origine;
          if (debut <= Math.min(max, debutActif) + 1) cible = Math.max(cible, debut);
        });
        barre.scrollLeft = cible;
      }
      bords();
      barre.addEventListener('scroll', bords, { passive: true });
      window.addEventListener('resize', bords, { passive: true });
    });
  }

  function copier() {
    /* Le lien mailto: reste le repli ; le bouton « Copier » n’apparaît
       qu’avec le script et le presse-papiers. */
    if (!navigator.clipboard) return;
    document.querySelectorAll('[data-copier]').forEach(function (bouton) {
      bouton.hidden = false;
      bouton.addEventListener('click', function () {
        var texte = bouton.getAttribute('data-copier');
        var etiquette = bouton.querySelector('[data-etiquette]') || bouton;
        var initial = etiquette.textContent;
        navigator.clipboard.writeText(texte).then(function () {
          etiquette.textContent = 'Adresse copiée';
          window.setTimeout(function () { etiquette.textContent = initial; }, 2000);
        });
      });
    });
  }

  function annotations() {
    /* Les annotations du gabarit E5 sont masquées par défaut : elles servent à
       relire la maquette, pas à la lire. ?annotations=1 les affiche d’emblée. */
    var bouton = document.querySelector('[data-annotations]');
    if (!bouton) return;
    function afficher(oui) {
      racine.classList.toggle('annotations-visibles', oui);
      bouton.setAttribute('aria-pressed', oui ? 'true' : 'false');
      bouton.textContent = oui ? 'Masquer les annotations du gabarit' : 'Afficher les annotations du gabarit';
    }
    afficher(new URLSearchParams(window.location.search).get('annotations') === '1');
    bouton.hidden = false;
    bouton.addEventListener('click', function () {
      afficher(!racine.classList.contains('annotations-visibles'));
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    poser(racine.getAttribute('data-theme') || themeDemande());
    document.querySelectorAll('[data-theme-bascule]').forEach(function (bouton) {
      bouton.addEventListener('click', basculer);
    });
    lumiereQuiSuit();
    sommaireDePage();
    progression();
    tracePlafond();
    deroulants();
    galeries();
    ongletActif();
    copier();
    annotations();
  });
})();
