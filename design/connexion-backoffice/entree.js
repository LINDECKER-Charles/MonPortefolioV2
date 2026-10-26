/*
 * Maquette « L’atelier s’allume » : la scène, sa mise en mouvement et le
 * parcours de connexion.
 *
 * Le mouvement s’écrit comme un générique de film : une caméra (le plan de la
 * lanterne) qui recule depuis un gros plan sur la flamme, des calques à des
 * profondeurs différentes (bokeh, rayons, poussière) qui suivent la main, un
 * carton-titre qui glisse à sa place, des bandes de cinéma. Tout passe par Web
 * Animations : les instants s’écrivent en millisecondes à vitesse normale et
 * passent par t(), qui suit --d-scene (le ralenti de la régie les étire), et
 * les courbes viennent des jetons. L’état final est l’état par défaut du CSS :
 * abréger, c’est annuler les animations.
 *
 * Le script joue aussi le serveur (`serveur`, en bas) ; au portage, la scène et
 * les champs rejoignent un module du backoffice, qui garde ses identifiants,
 * ses appels et ses retours.
 *
 * Plan : outils · séquences · scène · titres · gestes communs · bandes ·
 * écrans et étapes · générique · connexion · vérification · configuration ·
 * codes de secours · atelier · horodatage · serveur simulé · régie · démarrage.
 */
(function () {
  'use strict';

  var racine = document.documentElement;
  var $ = function (id) { return document.getElementById(id); };
  var entree = $('entree');
  var NBSP = ' ';
  var pointeurFin = window.matchMedia('(pointer: fine)');
  var etroit = window.matchMedia('(max-width: 860px)');

  /* ===== Outils ===== */
  function reduit() {
    return racine.classList.contains('mouvement-reduit');
  }
  function dScene() {
    return parseFloat(getComputedStyle(racine).getPropertyValue('--d-scene')) || 400;
  }
  /** Un instant ou une durée de la chorégraphie, écrit à vitesse normale (le ralenti l’étire). */
  function t(ms) {
    return (ms * dScene()) / 400;
  }
  function jeton(nom, element) {
    return getComputedStyle(element || racine).getPropertyValue(nom).trim();
  }
  function attendre(ms) {
    return new Promise(function (fin) { window.setTimeout(fin, ms); });
  }
  /** Un retour posé à côté de son action : le texte dit toujours ce qui se passe. */
  function dire(zone, message, etat) {
    zone.textContent = message || '';
    if (message && etat) zone.dataset.state = etat;
    else delete zone.dataset.state;
  }
  function annoncer(message, etat) {
    var notice = $('bo-notice');
    dire(notice, message, etat || 'success');
    notice.hidden = !message;
  }
  /** Le libellé d’un bouton principal (son texte vit dans `.entree__action-texte`). */
  function libeller(bouton, texte) {
    var cible = bouton.querySelector('.entree__action-texte') || bouton;
    cible.textContent = texte;
  }
  /** Une action en cours : verrou, champs désactivés, attente dite à côté. */
  function occuper(formulaire, zone, message) {
    formulaire.dataset.busy = 'true';
    formulaire.setAttribute('aria-busy', 'true');
    var groupe = formulaire.querySelector('fieldset');
    if (groupe) groupe.disabled = true;
    else formulaire.disabled = true;
    dire(zone, message, 'pending');
  }
  function liberer(formulaire) {
    delete formulaire.dataset.busy;
    formulaire.removeAttribute('aria-busy');
    var groupe = formulaire.querySelector('fieldset');
    if (groupe) groupe.disabled = false;
    else formulaire.disabled = false;
  }
  /** Relance une animation CSS portée par un attribut. */
  function rejouer(element, attribut) {
    element.removeAttribute(attribut);
    void element.offsetWidth;
    element.setAttribute(attribut, '');
  }

  var COURBE = jeton('--courbe');
  var EXPO = jeton('--courbe-expo');
  var EXPO_ENTREE = jeton('--courbe-entree');
  var RESSORT = jeton('--courbe-ressort');
  // Un navigateur sans `linear()` refuserait l’animation : le ressort devient une sortie exponentielle.
  try {
    document.body.animate([], { easing: RESSORT });
  } catch (erreur) {
    RESSORT = EXPO;
  }

  /* ===== Séquences : des animations et des rendez-vous qu’on annule ensemble ===== */
  function sequence() {
    var animations = [];
    var minuteries = [];
    return {
      animer: function (element, images, options) {
        if (!element) return null;
        var animation = element.animate(images, options);
        animations.push(animation);
        return animation;
      },
      plusTard: function (ms, action) {
        minuteries.push(window.setTimeout(action, ms));
      },
      fini: function () {
        return Promise.all(animations.map(function (animation) { return animation.finished; }));
      },
      annuler: function () {
        minuteries.forEach(window.clearTimeout);
        animations.forEach(function (animation) { animation.cancel(); });
        animations = [];
        minuteries = [];
      },
    };
  }

  /* ===== La scène : flamme, caméra, balancier, parallaxe, lumières ===== */
  var scene = (function () {
    var calques = $('scene');
    var plan = $('plan');
    var bokeh = $('bokeh');
    var suspension = $('suspension');
    var lanterne = $('lanterne');
    var corde = entree.querySelector('.suspension__corde');
    var traits = Array.prototype.slice.call(entree.querySelectorAll('.lanterne__traits > *'));
    var flamme = entree.querySelector('.flamme');
    var sursaut = entree.querySelector('.flamme__sursaut');
    var vitre = entree.querySelector('.lanterne__vitre');
    var halo = entree.querySelector('.lanterne__halo');
    var rayons = entree.querySelector('.lanterne__rayons');
    var poussieres = $('poussieres');
    var eclat = entree.querySelector('.lanterne__eclat');
    var trainee = entree.querySelector('.lanterne__trainee');
    var etincelles = $('etincelles');
    // L’ordre du tracé : anneau, col, toit, montants, traverses, fenêtre, bougie, socle, pieds.
    var RANGS = [0, 1, 2, 3, 3, 4, 4, 5, 6, 7, 8, 8];
    var carte = null;
    var derniereFrappe = 0;

    function etat(valeur) {
      entree.dataset.flamme = valeur;
    }
    function palier(niveau) {
      entree.dataset.palier = String(niveau);
    }
    /** La carte qui reçoit la lumière (et l’ombre qui suit le balancier). */
    function suivreCarte(element) {
      if (carte && carte !== element) carte.style.removeProperty('--balance');
      carte = element;
    }

    /** Une frappe : la flamme sursaute, un éclat passe. */
    function frapper(fort) {
      var maintenant = performance.now();
      if (reduit() || entree.dataset.flamme === 'soufflee' || maintenant - derniereFrappe < 90) return;
      derniereFrappe = maintenant;
      var ampleur = fort ? 1.22 : 1.1;
      sursaut.animate(
        [{ transform: 'scale(1)' }, { transform: 'scale(' + (ampleur - 0.04) + ', ' + ampleur + ')', offset: 0.35 }, { transform: 'scale(1)' }],
        { duration: t(fort ? 520 : 300), easing: COURBE }
      );
      eclat.animate(
        [{ opacity: 0, scale: 0.85 }, { opacity: fort ? 1 : 0.75, scale: 1.08, offset: 0.3 }, { opacity: 0, scale: 1 }],
        { duration: t(fort ? 700 : 420), easing: 'ease-out' }
      );
    }

    /** La traînée d’objectif s’étire sur un éclat de la flamme. */
    function trainer(fort) {
      if (reduit()) return;
      trainee.animate([
        { transform: 'scaleX(0.3)', opacity: 0.2 },
        { transform: 'scaleX(' + (fort ? 1.9 : 1.35) + ')', opacity: 1, offset: 0.22 },
        { transform: 'scaleX(1)', opacity: 0.4 },
      ], { duration: t(fort ? 1300 : 800), easing: EXPO });
    }

    /** Des étincelles jaillissent de la flamme, en éventail, puis retombent. */
    function etinceler(nombre, force) {
      if (reduit()) return;
      for (var i = 0; i < nombre; i++) {
        (function () {
          var grain = document.createElement('span');
          grain.className = 'etincelle';
          etincelles.appendChild(grain);
          var angle = ((-90 + (Math.random() - 0.5) * 200) * Math.PI) / 180;
          var distance = (24 + Math.random() * 64) * (force || 1);
          var dx = Math.cos(angle) * distance;
          var dy = Math.sin(angle) * distance;
          var animation = grain.animate([
            { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
            { transform: 'translate(calc(-50% + ' + (dx * 0.7).toFixed(1) + 'px), calc(-50% + ' + (dy * 0.7).toFixed(1) + 'px)) scale(0.8)', opacity: 1, offset: 0.5 },
            { transform: 'translate(calc(-50% + ' + dx.toFixed(1) + 'px), calc(-50% + ' + (dy + 18).toFixed(1) + 'px)) scale(0.2)', opacity: 0 },
          ], { duration: t(550 + Math.random() * 550), easing: 'cubic-bezier(0.15, 0.6, 0.35, 1)' });
          animation.onfinish = function () { grain.remove(); };
        })();
      }
    }

    /** Un refus : la flamme se couche, faiblit ; la lumière quitte un instant le bord de la carte. */
    function vaciller() {
      if (reduit()) return;
      sursaut.animate([
        { transform: 'scale(1) skewX(0deg)', opacity: 1 },
        { transform: 'scale(0.6, 0.45) skewX(10deg)', opacity: 0.5, offset: 0.22 },
        { transform: 'scale(0.8, 0.72) skewX(-6deg)', opacity: 0.8, offset: 0.5 },
        { transform: 'scale(1) skewX(0deg)', opacity: 1 },
      ], { duration: t(1200), easing: COURBE });
      halo.animate([{ opacity: 1 }, { opacity: 0.32, offset: 0.25 }, { opacity: 1 }], { duration: t(1400), easing: 'ease-in-out' });
      if (carte) carte.animate([{ opacity: 1 }, { opacity: 0.1, offset: 0.25 }, { opacity: 1 }], { duration: t(1200), easing: 'ease-in-out', pseudoElement: '::after' });
    }

    /**
     * L’allumage : la mèche crache deux fois avant de prendre ; à la prise, le
     * halo jette un éclat, la traînée s’étire, des étincelles jaillissent, puis
     * les rayons et la poussière apparaissent. Rend l’instant de la prise.
     */
    function allumer(seq, depart, rapide) {
      var duree = rapide ? 700 : 950;
      seq.animer(flamme, [
        { scale: 0, opacity: 0 },
        { scale: 0.3, opacity: 1, offset: 0.12 },
        { scale: 0.06, opacity: 0.25, offset: 0.22 },
        { scale: 0.38, opacity: 1, offset: 0.36 },
        { scale: 0.1, opacity: 0.45, offset: 0.46 },
        { scale: 1.35, opacity: 1, offset: 0.7 },
        { scale: 1, opacity: 1 },
      ], { duration: t(duree), delay: t(depart), fill: 'both' });
      var prise = depart + duree * 0.66;
      seq.animer(halo, [{ opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1.22, offset: 0.35 }, { opacity: 1, scale: 1 }], { duration: t(1200), delay: t(prise), easing: EXPO, fill: 'both' });
      seq.animer(vitre, [{ opacity: 0 }, { opacity: 1 }], { duration: t(500), delay: t(prise), easing: COURBE, fill: 'both' });
      seq.animer(trainee, [
        { transform: 'scaleX(0.2)', opacity: 0 },
        { transform: 'scaleX(1.9)', opacity: 1, offset: 0.22 },
        { transform: 'scaleX(1)', opacity: 0.4 },
      ], { duration: t(1300), delay: t(prise), easing: EXPO, fill: 'both' });
      seq.animer(rayons, [{ opacity: 0 }, { opacity: 1 }], { duration: t(1800), delay: t(prise + 120), easing: COURBE, fill: 'both' });
      seq.animer(poussieres, [{ opacity: 0 }, { opacity: 1 }], { duration: t(1600), delay: t(prise + 200), easing: COURBE, fill: 'both' });
      seq.plusTard(t(prise), function () {
        frapper(true);
        etinceler(10, 1);
      });
      return prise;
    }

    /** La flamme revient après un 429 : d’une braise, elle reprend. */
    function rallumer() {
      etat('vive');
      if (reduit()) return;
      var seq = sequence();
      allumer(seq, 0, true);
      seq.fini().then(seq.annuler, seq.annuler);
    }

    /** Le dessin se trace : la corde descend du haut, puis les traits de la lanterne, dans l’ordre. */
    function tracer(seq, depart) {
      seq.animer(corde, [{ transform: 'scaleY(0)' }, { transform: 'none' }], { duration: t(900), delay: t(depart), easing: EXPO, fill: 'both' });
      // Un peu plus que 1 au départ : un tiret de longueur nulle dessinerait déjà un point (bout rond).
      traits.forEach(function (trait, i) {
        seq.animer(trait, [{ strokeDashoffset: 1.02 }, { strokeDashoffset: 0 }], { duration: t(1050), delay: t(depart + 50 + RANGS[i] * 75), easing: COURBE, fill: 'both' });
      });
    }

    /**
     * La caméra : un gros plan sur la flamme (le plan agrandi autour d’elle,
     * ramenée en haut et au centre de l’écran), puis le recul jusqu’au plan
     * large ; le bokeh, plus lointain, recule moins vite.
     */
    function cadrer(seq, depart, duree) {
      figer();
      var flammeEcran = centreFlamme();
      var boite = plan.getBoundingClientRect();
      var vise = { x: window.innerWidth / 2, y: window.innerHeight * (etroit.matches ? 0.3 : 0.32) };
      var echelle = etroit.matches ? 1.9 : 2.4;
      plan.style.transformOrigin = (flammeEcran.x - boite.left).toFixed(1) + 'px ' + (flammeEcran.y - boite.top).toFixed(1) + 'px';
      seq.animer(plan, [
        { transform: 'translate(' + (vise.x - flammeEcran.x).toFixed(1) + 'px, ' + (vise.y - flammeEcran.y).toFixed(1) + 'px) scale(' + echelle + ')' },
        { transform: 'none' },
      ], { duration: t(duree), delay: t(depart), easing: EXPO, fill: 'both' });
      seq.animer(bokeh, [{ transform: 'scale(1.45)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: t(duree + 300), delay: t(depart - 150), easing: EXPO, fill: 'both' });
    }
    function decadrer() {
      plan.style.removeProperty('transform-origin');
    }

    /** Le centre de la flamme à l’écran, d’après la boîte du dessin (indépendant de l’état de la flamme). */
    function centreFlamme() {
      var boite = lanterne.getBoundingClientRect();
      return { x: boite.left + boite.width / 2, y: boite.top + boite.height * 0.675 };
    }

    /* Le balancier : un pendule amorti autour du point d’attache, et l’air de
       l’atelier qui le berce. Angle en degrés, vitesse en degrés par seconde.
       La même boucle fait suivre la main aux calques (parallaxe) et écarte
       l’ombre de la carte. */
    var angle = 0;
    var vitesse = 0;
    var dernier = 0;
    var boucle = 0;
    var actif = false;
    var RAIDEUR = 9;   // ≈ 2,1 s par aller-retour
    var AMORTI = 0.85; // revient au calme en cinq ou six secondes
    var px = 0;
    var py = 0;
    var cibleX = 0;
    var cibleY = 0;
    var ecritX = 0;
    var ecritY = 0;

    function pas(instant) {
      var dt = Math.min(0.05, (instant - dernier) / 1000 || 0.016);
      dernier = instant;
      var air = Math.sin(instant / 2300) * 0.4 + Math.sin(instant / 3700 + 1.3) * 0.3;
      vitesse += (-RAIDEUR * (angle - air) - AMORTI * vitesse) * dt;
      angle += vitesse * dt;
      suspension.style.transform = 'rotate(' + angle.toFixed(3) + 'deg)';
      if (carte) carte.style.setProperty('--balance', angle.toFixed(2));
      var lissage = Math.min(1, dt * 3.5);
      px += (cibleX - px) * lissage;
      py += (cibleY - py) * lissage;
      if (Math.abs(px - ecritX) > 0.002 || Math.abs(py - ecritY) > 0.002) {
        ecritX = px;
        ecritY = py;
        calques.style.setProperty('--px', px.toFixed(3));
        calques.style.setProperty('--py', py.toFixed(3));
      }
      boucle = window.requestAnimationFrame(pas);
    }
    function lancer(angleInitial) {
      if (typeof angleInitial === 'number') angle = angleInitial;
      if (actif || reduit()) return;
      actif = true;
      dernier = performance.now();
      boucle = window.requestAnimationFrame(pas);
    }
    function arreter() {
      actif = false;
      window.cancelAnimationFrame(boucle);
    }
    function figer() {
      arreter();
      angle = 0;
      vitesse = 0;
      suspension.style.transform = '';
      if (carte) carte.style.removeProperty('--balance');
    }
    function pousser(impulsion) {
      if (reduit()) return;
      vitesse = Math.max(-80, Math.min(80, vitesse + impulsion));
      lancer();
    }

    /* La main pousse la lanterne : en passant (selon sa vitesse) ou d’un clic. */
    var dernierX = null;
    var dernierT = 0;
    lanterne.addEventListener('pointermove', function (evenement) {
      var instant = performance.now();
      if (dernierX !== null && instant - dernierT < 120) {
        var vx = (evenement.clientX - dernierX) / Math.max(0.008, (instant - dernierT) / 1000);
        pousser(Math.max(-24, Math.min(24, -vx * 0.025)));
      }
      dernierX = evenement.clientX;
      dernierT = instant;
    });
    lanterne.addEventListener('pointerleave', function () { dernierX = null; });
    lanterne.addEventListener('pointerdown', function (evenement) {
      var boite = lanterne.getBoundingClientRect();
      pousser(evenement.clientX < boite.left + boite.width / 2 ? -42 : 42);
      frapper(true);
      etinceler(4, 0.6);
    });

    /* La parallaxe : les calques lointains suivent la main plus que le plan. */
    document.addEventListener('pointermove', function (evenement) {
      if (evenement.pointerType !== 'mouse' || reduit()) return;
      cibleX = (evenement.clientX / window.innerWidth) * 2 - 1;
      cibleY = (evenement.clientY / window.innerHeight) * 2 - 1;
    });
    document.documentElement.addEventListener('pointerleave', function () {
      cibleX = 0;
      cibleY = 0;
    });

    /* La poussière qui danse dans la lumière : positions, tailles et durées
       tirées au sort, en multiples de --d-scene. */
    function semer(nombre) {
      poussieres.textContent = '';
      for (var i = 0; i < nombre; i++) {
        var grain = document.createElement('span');
        grain.className = 'poussiere';
        var style = grain.style;
        var duree = 22 + Math.random() * 26;
        style.setProperty('--x', (8 + Math.random() * 84).toFixed(1) + '%');
        style.setProperty('--y', (12 + Math.random() * 80).toFixed(1) + '%');
        style.setProperty('--taille', (1 + Math.random() * 2.2).toFixed(2) + 'px');
        style.setProperty('--o', (0.3 + Math.random() * 0.65).toFixed(2));
        style.setProperty('--dx', ((Math.random() - 0.5) * 70).toFixed(0) + 'px');
        style.setProperty('--dy', (-25 - Math.random() * 80).toFixed(0) + 'px');
        style.setProperty('--duree', 'calc(var(--d-scene) * ' + duree.toFixed(1) + ')');
        style.setProperty('--retard', 'calc(var(--d-scene) * -' + (Math.random() * duree).toFixed(1) + ')');
        poussieres.appendChild(grain);
      }
    }

    /* Le liseré : la lumière accrochée au bord de la carte suit la main. */
    function liserer(element) {
      element.addEventListener('pointermove', function (evenement) {
        if (evenement.pointerType !== 'mouse') return;
        var boite = element.getBoundingClientRect();
        element.style.setProperty('--mx', (((evenement.clientX - boite.left) / boite.width) * 100).toFixed(1) + '%');
        element.style.setProperty('--my', (((evenement.clientY - boite.top) / boite.height) * 100).toFixed(1) + '%');
      });
      element.addEventListener('pointerleave', function () {
        element.style.removeProperty('--mx');
        element.style.removeProperty('--my');
      });
    }

    /* L’anneau de focus : il glisse d’un champ à l’autre de la carte. Le
       contour natif ne s’efface que quand l’anneau est posé (CSS :has). */
    function anneau(element) {
      var bague = document.createElement('span');
      bague.className = 'anneau';
      bague.setAttribute('aria-hidden', 'true');
      element.appendChild(bague);
      var pose = null;
      function cible(champ) {
        var boite = element.getBoundingClientRect();
        var r = champ.getBoundingClientRect();
        return { left: r.left - boite.left - 2, top: r.top - boite.top - 2, width: r.width + 4, height: r.height + 4 };
      }
      function geometrie(g) {
        return { left: g.left + 'px', top: g.top + 'px', width: g.width + 'px', height: g.height + 'px' };
      }
      element.addEventListener('focusin', function (evenement) {
        var champ = evenement.target;
        if (!champ.matches('.entree__formulaire input:not(.code__saisie), .code[data-mode="secours"] .code__saisie')) {
          bague.removeAttribute('data-actif');
          pose = null;
          return;
        }
        var arrivee = cible(champ);
        if (pose && !reduit()) bague.animate([geometrie(pose), geometrie(arrivee)], { duration: t(450), easing: EXPO });
        Object.assign(bague.style, geometrie(arrivee));
        bague.setAttribute('data-actif', '');
        pose = arrivee;
      });
      element.addEventListener('focusout', function (evenement) {
        var suivant = evenement.relatedTarget;
        if (!suivant || !element.contains(suivant) || !suivant.matches('input')) {
          bague.removeAttribute('data-actif');
          pose = null;
        }
      });
    }

    /* L’onde : la lumière part du point où l’on appuie sur un bouton principal. */
    document.addEventListener('pointerdown', function (evenement) {
      var bouton = evenement.target.closest && evenement.target.closest('.entree__action');
      if (!bouton || bouton.disabled || reduit()) return;
      var boite = bouton.getBoundingClientRect();
      var onde = document.createElement('span');
      onde.className = 'onde';
      onde.style.left = evenement.clientX - boite.left + 'px';
      onde.style.top = evenement.clientY - boite.top + 'px';
      bouton.appendChild(onde);
      onde.animate([{ transform: 'scale(0)', opacity: 0.9 }, { transform: 'scale(1)', opacity: 0 }], { duration: t(700), easing: EXPO }).onfinish = function () {
        onde.remove();
      };
    });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) arreter();
      else if (!entree.hidden) lancer();
    });

    return {
      etat: etat, palier: palier, suivreCarte: suivreCarte, frapper: frapper, trainer: trainer,
      etinceler: etinceler, vaciller: vaciller, allumer: allumer, rallumer: rallumer, tracer: tracer,
      cadrer: cadrer, decadrer: decadrer, centreFlamme: centreFlamme, lancer: lancer, arreter: arreter,
      figer: figer, semer: semer, liserer: liserer, anneau: anneau,
    };
  })();

  /* ===== Les titres, lettre à lettre =====
   * Un calque de lettres posé sur le texte réel, chaque lettre à sa place
   * exacte (mesurée par Range, crénage compris) ; le vrai texte devient
   * transparent le temps de l’animation, puis revient. Les lecteurs d’écran
   * lisent le titre, jamais le calque (aria-hidden).
   */
  var titres = (function () {
    /** Le vrai texte revient (le calque de lettres s’en va), sans toucher au mouvement en cours du titre. */
    function rendreTexte(titre) {
      var calque = titre.querySelector('.titre-lettres');
      if (calque) calque.remove();
      titre.classList.remove('titre--decoupe');
    }
    function nettoyer(titre) {
      rendreTexte(titre);
      titre.style.removeProperty('transform-origin');
    }
    function decouper(titre) {
      nettoyer(titre);
      var noeud = null;
      for (var i = 0; i < titre.childNodes.length; i++) {
        if (titre.childNodes[i].nodeType === 3 && titre.childNodes[i].textContent.trim()) {
          noeud = titre.childNodes[i];
          break;
        }
      }
      if (!noeud) return null;
      var boite = titre.getBoundingClientRect();
      var calque = document.createElement('span');
      calque.className = 'titre-lettres';
      calque.setAttribute('aria-hidden', 'true');
      var plage = document.createRange();
      var texte = noeud.textContent;
      var lettres = [];
      var etendue = { gauche: Infinity, haut: Infinity, droite: -Infinity, bas: -Infinity };
      for (var j = 0; j < texte.length; j++) {
        if (/\s/.test(texte.charAt(j))) continue;
        plage.setStart(noeud, j);
        plage.setEnd(noeud, j + 1);
        var r = plage.getBoundingClientRect();
        if (!r.width) continue;
        var lettre = document.createElement('span');
        lettre.className = 'titre-lettres__lettre';
        lettre.textContent = texte.charAt(j);
        lettre.style.left = (r.left - boite.left).toFixed(2) + 'px';
        lettre.style.top = (r.top - boite.top).toFixed(2) + 'px';
        lettre.style.lineHeight = r.height.toFixed(2) + 'px';
        calque.appendChild(lettre);
        lettres.push(lettre);
        etendue.gauche = Math.min(etendue.gauche, r.left);
        etendue.haut = Math.min(etendue.haut, r.top);
        etendue.droite = Math.max(etendue.droite, r.right);
        etendue.bas = Math.max(etendue.bas, r.bottom);
      }
      titre.appendChild(calque);
      titre.classList.add('titre--decoupe');
      return { lettres: lettres, etendue: etendue, boite: boite };
    }
    function couleurs(titre) {
      return { finale: getComputedStyle(titre).color, eclairee: jeton('--titre-eclaire', titre), lueur: jeton('--titre-lueur', titre) };
    }
    function rendre(animations, titre) {
      var fin = function () { nettoyer(titre); };
      Promise.all(animations.map(function (animation) { return animation.finished; })).then(fin, fin);
    }

    /** Les lettres montent de leur ligne, une à une, et la lumière les traverse. */
    function monter(seq, titre, depart) {
      if (!titre || reduit()) return;
      var c = couleurs(titre);
      var d = decouper(titre);
      if (!d) return;
      var animations = d.lettres.map(function (lettre, rang) {
        return seq.animer(lettre, [
          { opacity: 0, transform: 'translateY(0.42em) rotate(5deg)', filter: 'blur(6px)', color: c.eclairee, textShadow: '0 0 0.35em ' + c.lueur },
          { opacity: 1, transform: 'none', filter: 'blur(0px)', color: c.eclairee, textShadow: '0 0 0.35em ' + c.lueur, offset: 0.5 },
          { opacity: 1, transform: 'none', filter: 'blur(0px)', color: c.finale, textShadow: '0 0 0 transparent' },
        ], { duration: t(1000), delay: t(depart + rang * 24), easing: EXPO, fill: 'backwards' });
      });
      rendre(animations, titre);
    }

    /**
     * Le carton-titre du générique : le titre, seul au centre dans le noir, les
     * lettres qui se resserrent ; la flamme prend et sa lumière les traverse de
     * droite à gauche ; à l’aube, elles reprennent leur encre et le titre glisse
     * à sa place pendant que la caméra recule.
     */
    function carton(seq, titre, temps) {
      var c = couleurs(titre);
      var sombre = jeton('--lune');
      var eclairee = jeton('--lanterne-survol');
      var lueur = jeton('--lanterne-eclat');
      var d = decouper(titre);
      if (!d) return;
      var e = d.etendue;
      var ex = (e.gauche + e.droite) / 2;
      var ey = (e.haut + e.bas) / 2;
      var cx = window.innerWidth / 2;
      var cy = window.innerHeight * (etroit.matches ? 0.6 : 0.62);
      var echelle = etroit.matches ? 1.08 : 1.06;
      titre.style.transformOrigin = (ex - d.boite.left).toFixed(1) + 'px ' + (ey - d.boite.top).toFixed(1) + 'px';
      seq.animer(titre, [
        { transform: 'translate(' + (cx - ex).toFixed(1) + 'px, ' + (cy - ey).toFixed(1) + 'px) scale(' + echelle + ')' },
        { transform: 'none' },
      ], { duration: t(temps.duree), delay: t(temps.glisse), easing: EXPO, fill: 'both' });
      var n = d.lettres.length;
      d.lettres.forEach(function (lettre, rang) {
        var ecart = ((rang - (n - 1) / 2) * 0.1).toFixed(3);
        seq.animer(lettre, [
          { opacity: 0, transform: 'translateX(' + ecart + 'em) translateY(0.25em)', filter: 'blur(8px)', color: sombre },
          { opacity: 0.45, transform: 'none', filter: 'blur(0px)', color: sombre },
        ], { duration: t(1100), delay: t(temps.apparition + rang * 34), easing: EXPO, fill: 'both' });
        seq.animer(lettre, [
          { opacity: 0.45, color: sombre, textShadow: '0 0 0 transparent' },
          { opacity: 1, color: eclairee, textShadow: '0 0 0.4em ' + lueur },
        ], { duration: t(600), delay: t(temps.lumiere + (n - 1 - rang) * 26), easing: COURBE, fill: 'forwards' });
        seq.animer(lettre, [
          { opacity: 1, color: eclairee, textShadow: '0 0 0.4em ' + lueur },
          { opacity: 1, color: c.finale, textShadow: '0 0 0 transparent' },
        ], { duration: t(1200), delay: t(temps.aube + rang * 12), easing: COURBE, fill: 'forwards' });
      });
    }

    return { rendreTexte: rendreTexte, nettoyer: nettoyer, monter: monter, carton: carton };
  })();

  /* ===== Gestes communs ===== */
  function apparaitre(seq, element, depart, duree, montee, remplissage) {
    return seq.animer(element, [
      { opacity: 0, transform: 'translateY(' + (montee || 0) + 'px)' },
      { opacity: 1, transform: 'none' },
    ], { duration: t(duree), delay: t(depart), easing: EXPO, fill: remplissage || 'backwards' });
  }

  /** La carte se pose : elle sort du flou et se dépose sur un ressort. */
  function poserCarte(seq, carte, depart, remplissage) {
    seq.animer(carte, [
      { opacity: 0, transform: 'translateY(48px) scale(0.96)', filter: 'blur(10px)' },
      { opacity: 1, transform: 'none', filter: 'blur(0px)' },
    ], { duration: t(1100), delay: t(depart), easing: RESSORT, fill: remplissage || 'backwards' });
  }

  /** La lumière coule du haut de la carte le long de ses deux bords et se rejoint en bas. */
  function tracerCarte(seq, carte, depart) {
    if (reduit()) return;
    seq.animer(carte.querySelector('.carte__trace'), [
      { '--trace': '0deg', opacity: 1 },
      { '--trace': '180deg', opacity: 1, offset: 0.7 },
      { '--trace': '180deg', opacity: 0 },
    ], { duration: t(1300), delay: t(depart), easing: COURBE, fill: 'backwards' });
  }

  /** Les champs de la carte arrivent un à un. */
  function animerChamps(seq, carte, depart, remplissage) {
    if (reduit()) return;
    var elements = carte.querySelectorAll('.entree__formulaire fieldset > :not(legend), :scope > .bo-enrollment, :scope > .bo-recovery-codes, :scope > .bo-actions');
    Array.prototype.forEach.call(elements, function (element, rang) {
      seq.animer(element, [
        { opacity: 0, transform: 'translateY(14px)' },
        { opacity: 1, transform: 'none' },
      ], { duration: t(700), delay: t(depart + rang * 80), easing: EXPO, fill: remplissage || 'backwards' });
    });
  }

  /* ===== Les bandes de cinéma : le générique, et le passage dans l’atelier ===== */
  var bandes = (function () {
    var haut = document.querySelector('.bande--haut');
    var bas = document.querySelector('.bande--bas');
    var CACHE_HAUT = 'translateY(-101%)';
    var CACHE_BAS = 'translateY(101%)';
    function glisser(seq, depart, duree, dedans, remplissage) {
      var options = { duration: t(duree), delay: t(depart), easing: EXPO, fill: remplissage || 'forwards' };
      seq.animer(haut, dedans ? [{ transform: CACHE_HAUT }, { transform: 'none' }] : [{ transform: 'none' }, { transform: CACHE_HAUT }], options);
      seq.animer(bas, dedans ? [{ transform: CACHE_BAS }, { transform: 'none' }] : [{ transform: 'none' }, { transform: CACHE_BAS }], options);
    }
    return {
      entrer: function (seq, depart) {
        if (reduit()) return;
        racine.setAttribute('data-bandes', '');
        glisser(seq, depart, 550, true);
      },
      sortir: function (seq, depart, remplissage) { if (!reduit()) glisser(seq, depart, 850, false, remplissage); },
      /** Les bandes rangées : elles ne restent pas sous l’écran entre deux passages. */
      ranger: function () { racine.removeAttribute('data-bandes'); },
    };
  })();

  /* ===== Écrans et étapes ===== */
  var sections = { connexion: $('bo-login'), verification: $('bo-two-factor'), codes: $('bo-recovery') };
  var etapes = $('etapes');
  var inscription = false;

  function repereCourant() {
    var repere = etapes.querySelector('[data-etat="courante"] .etapes__repere');
    var boite = repere && repere.getBoundingClientRect();
    return boite && boite.width ? boite : null;
  }

  /** L’étape courante, et la lumière qui avance : faite, courante, à venir. */
  function marquerEtapes(ecran) {
    var ordre = inscription ? ['connexion', 'verification', 'codes', 'atelier'] : ['connexion', 'verification', 'atelier'];
    etapes.querySelector('[data-etape="codes"]').hidden = !inscription;
    var courant = ordre.indexOf(ecran);
    etapes.querySelectorAll('.etapes__etape').forEach(function (etape) {
      var rang = ordre.indexOf(etape.dataset.etape);
      if (rang < 0) return;
      etape.dataset.etat = rang < courant ? 'faite' : rang === courant ? 'courante' : 'a-venir';
      if (rang === courant) etape.setAttribute('aria-current', 'step');
      else etape.removeAttribute('aria-current');
      var mention = etape.querySelector('.etapes__faite');
      if (rang < courant && !mention) {
        mention = document.createElement('span');
        mention.className = 'sr etapes__faite';
        mention.textContent = ' (terminée)';
        etape.appendChild(mention);
      } else if (rang >= courant && mention) {
        mention.remove();
      }
    });
  }

  /** La lumière voyage du repère de l’étape quittée à celui de la nouvelle. */
  function voyager(avant) {
    var apres = repereCourant();
    if (!avant || !apres || reduit()) return;
    var cadre = $('etapes-cadre').getBoundingClientRect();
    var x0 = avant.left + avant.width / 2 - cadre.left;
    var y0 = avant.top + avant.height / 2 - cadre.top;
    var x1 = apres.left + apres.width / 2 - cadre.left;
    var y1 = apres.top + apres.height / 2 - cadre.top;
    $('etapes-lumiere').animate([
      { transform: 'translate(' + x0 + 'px, ' + y0 + 'px) scale(0.5)', opacity: 0 },
      { transform: 'translate(' + x0 + 'px, ' + y0 + 'px) scale(1)', opacity: 1, offset: 0.12 },
      { transform: 'translate(' + x1 + 'px, ' + y1 + 'px) scale(1.15)', opacity: 1, offset: 0.82 },
      { transform: 'translate(' + x1 + 'px, ' + y1 + 'px) scale(0.6)', opacity: 0 },
    ], { duration: t(1100), easing: 'cubic-bezier(0.65, 0, 0.35, 1)' });
  }

  /**
   * Change d’écran. Avec View Transitions, l’ancien récit monte et s’efface,
   * l’ancienne carte se dissout dans la lumière et la nouvelle en émerge ; les
   * lettres du titre, le tracé de la carte, ses champs et la lumière des
   * étapes arrivent ensuite, dans le rendu vivant de la transition.
   */
  function montrer(ecran, instantane) {
    if (generique.enCours()) generique.abreger();
    var avant = repereCourant();
    var section = sections[ecran];
    var carte = section.querySelector('.entree__carte');
    function changer() {
      Object.keys(sections).forEach(function (cle) { sections[cle].hidden = cle !== ecran; });
      entree.dataset.ecran = ecran;
      marquerEtapes(ecran);
      scene.palier(ecran === 'connexion' ? 1 : ecran === 'verification' ? 2 : 3);
      scene.suivreCarte(carte);
    }
    if (instantane || reduit()) {
      changer();
      return Promise.resolve();
    }
    var seq = sequence();
    function arrivee() {
      titres.monter(seq, section.querySelector('.entree__titre'), 140);
      tracerCarte(seq, carte, 120);
      animerChamps(seq, carte, 240);
      voyager(avant);
      scene.frapper(true);
      scene.trainer(false);
    }
    if (typeof document.startViewTransition === 'function') {
      var transition = document.startViewTransition(changer);
      transition.updateCallbackDone.then(arrivee, function () {});
      return transition.finished.catch(function () {});
    }
    changer();
    arrivee();
    return attendre(t(900));
  }

  /* ===== Le générique =====
   * Complet (première visite de l’onglet, ≈ 4,7 s), toujours de nuit : le noir
   * et les bandes ; le titre seul au centre ; l’étincelle crache deux fois et
   * prend ; en gros plan, la lanterne se dessine autour de la flamme ; la
   * caméra recule jusqu’au plan large et le titre glisse à sa place ; la carte
   * se pose et sa lumière coule le long des bords ; les champs, le texte, les
   * étapes ; les bandes s’ouvrent. S’il fait jour, le jour se lève alors depuis
   * la lanterne, du geste de la bascule du thème. Court (visites suivantes,
   * ≈ 1,9 s) : l’allumage, le titre, la carte. Une touche ou un clic abrège.
   */
  var generique = (function () {
    var seq = null;
    var actif = false;

    function enCours() {
      return actif;
    }
    function abreger() {
      if (!actif) return;
      actif = false;
      seq.annuler();
      [$('bo-login-title'), $('bo-two-factor-title'), $('bo-recovery-title')].forEach(titres.nettoyer);
      scene.decadrer();
      racine.removeAttribute('data-ouverture');
      racine.removeAttribute('data-pilote');
      entree.removeAttribute('data-aube');
      document.removeEventListener('keydown', abreger, true);
      document.removeEventListener('pointerdown', abreger, true);
      scene.lancer();
      if (pointeurFin.matches && !$('regie').open && document.activeElement === document.body) adresse.focus({ preventScroll: true });
    }
    function preparer(mode) {
      seq = sequence();
      actif = true;
      racine.setAttribute('data-ouverture', mode);
      racine.setAttribute('data-pilote', '');
      entree.removeAttribute('data-aube');
      document.addEventListener('keydown', abreger, true);
      document.addEventListener('pointerdown', abreger, true);
    }
    function complet() {
      var section = sections.connexion;
      var carte = section.querySelector('.entree__carte');
      preparer('complete');
      scene.cadrer(seq, 2500, 1350);
      scene.lancer(4);
      seq.animer($('noir'), [
        { opacity: 1 },
        { opacity: 1, offset: 0.46 },
        { opacity: 0.6, offset: 0.62 },
        { opacity: 0.6, offset: 0.7 },
        { opacity: 0 },
      ], { duration: t(3600), fill: 'both' });
      scene.tracer(seq, 1450);
      var prise = scene.allumer(seq, 1100, false);
      titres.carton(seq, $('bo-login-title'), { apparition: 250, lumiere: prise + 60, aube: 2650, glisse: 2550, duree: 1300 });
      var jour = racine.getAttribute('data-theme') !== 'nuit' && racine.getAttribute('data-scene-jour') !== 'veille';
      seq.plusTard(t(jour ? 3400 : 2500), function () { lever(jour); });
      apparaitre(seq, entree.querySelector('.entree__entete'), 3000, 800, 0, 'both');
      apparaitre(seq, entree.querySelector('.entree__surtitre'), 3300, 800, 12, 'both');
      poserCarte(seq, carte, 3100, 'both');
      tracerCarte(seq, carte, 3250);
      animerChamps(seq, carte, 3350, 'both');
      apparaitre(seq, section.querySelector('.entree__texte'), 3400, 900, 16, 'both');
      apparaitre(seq, $('etapes-cadre'), 3550, 800, 0, 'both');
      apparaitre(seq, entree.querySelector('.entree__pied'), 3700, 800, 0, 'both');
      bandes.sortir(seq, 3750, 'both');
      seq.plusTard(t(4700), abreger);
    }
    /**
     * L’aube. La nuit, rien ne change. Le jour, la lumière part de la lanterne
     * et gagne l’écran (View Transition « vers le jour », celle de la bascule) :
     * dedans, l’entrée a repris ses couleurs de jour et le vrai titre son encre.
     */
    function lever(jour) {
      if (!jour) {
        entree.setAttribute('data-aube', '');
        return;
      }
      var changer = function () {
        titres.rendreTexte($('bo-login-title'));
        entree.setAttribute('data-aube', '');
      };
      if (typeof document.startViewTransition !== 'function') {
        changer();
        return;
      }
      var flamme = scene.centreFlamme();
      racine.style.setProperty('--vt-x', Math.round(flamme.x) + 'px');
      racine.style.setProperty('--vt-y', Math.round(flamme.y) + 'px');
      racine.setAttribute('data-transition-theme', 'vers-jour');
      var transition = document.startViewTransition(changer);
      transition.finished.catch(function () {}).then(function () {
        racine.removeAttribute('data-transition-theme');
        racine.style.removeProperty('--vt-x');
        racine.style.removeProperty('--vt-y');
      });
    }
    function court() {
      var carte = sections.connexion.querySelector('.entree__carte');
      preparer('courte');
      scene.lancer(2.5);
      scene.allumer(seq, 0, true);
      titres.monter(seq, $('bo-login-title'), 160);
      poserCarte(seq, carte, 220, 'both');
      tracerCarte(seq, carte, 380);
      animerChamps(seq, carte, 420, 'both');
      seq.plusTard(t(1900), abreger);
    }
    function jouer(mode) {
      if (actif) abreger();
      if (reduit()) {
        racine.removeAttribute('data-ouverture');
        return;
      }
      // Les lettres se mesurent dans la police finale : on l’attend, 300 ms au plus.
      Promise.race([document.fonts.ready, attendre(300)]).then(mode === 'complete' ? complet : court);
    }
    return { jouer: jouer, abreger: abreger, enCours: enCours };
  })();

  /* ===== 1. Connexion ===== */
  var formulaireConnexion = $('bo-login-form');
  var adresse = $('bo-login-email');
  var motDePasse = $('bo-password');
  var boutonConnexion = $('bo-login-submit');
  var retourConnexion = $('bo-login-retour');
  var carteConnexion = sections.connexion.querySelector('.entree__carte');
  var compteARebours = 0;

  [adresse, motDePasse].forEach(function (champ) {
    champ.addEventListener('input', function () { scene.frapper(false); });
  });

  /* Afficher ou masquer : le nom accessible suit le texte visible. */
  $('bo-password-voir').addEventListener('click', function (evenement) {
    var bouton = evenement.currentTarget;
    var montre = motDePasse.type === 'password';
    motDePasse.type = montre ? 'text' : 'password';
    bouton.firstChild.textContent = montre ? 'Masquer' : 'Afficher';
  });

  /* Majuscules : dit sous le champ, tant qu’on y tape. */
  function verifierMajuscules(evenement) {
    if (typeof evenement.getModifierState !== 'function') return;
    $('bo-password-maj').hidden = !evenement.getModifierState('CapsLock');
  }
  motDePasse.addEventListener('keydown', verifierMajuscules);
  motDePasse.addEventListener('keyup', verifierMajuscules);
  motDePasse.addEventListener('blur', function () { $('bo-password-maj').hidden = true; });

  function refuser(carte) {
    if (reduit()) return;
    rejouer(carte, 'data-refus');
    window.setTimeout(function () { carte.removeAttribute('data-refus'); }, t(480));
  }

  formulaireConnexion.addEventListener('submit', function (evenement) {
    evenement.preventDefault();
    if (formulaireConnexion.dataset.busy === 'true') return;
    annoncer('');
    occuper(formulaireConnexion, retourConnexion, 'Connexion…');
    scene.etat('attente');
    serveur.connexion(adresse.value.trim(), motDePasse.value).then(function (reponse) {
      liberer(formulaireConnexion);
      motDePasse.value = '';
      dire(retourConnexion, '');
      scene.etat('vive');
      if (reponse.two_factor_required) return afficherVerification(Boolean(reponse.enrollment_required));
      return ouvrirAtelier();
    }).catch(function (erreur) {
      liberer(formulaireConnexion);
      if (erreur.status === 429) {
        bloquer(erreur.retryAfter || 60);
        return;
      }
      scene.etat('vive');
      scene.vaciller();
      refuser(carteConnexion);
      dire(retourConnexion, erreur.message, 'error');
      motDePasse.focus();
      motDePasse.select();
    });
  });

  /**
   * Trop de tentatives (429 et Retry-After) : la flamme est soufflée, le bouton
   * compte les secondes, puis la flamme se rallume et la main revient.
   * Le retour n’est annoncé qu’au début et à la fin, pas à chaque seconde.
   */
  function bloquer(secondes) {
    var fin = Date.now() + secondes * 1000;
    var groupe = formulaireConnexion.querySelector('fieldset');
    scene.etat('soufflee');
    scene.vaciller();
    groupe.disabled = true;
    dire(retourConnexion, 'Trop de tentatives. Patientez avant de réessayer' + NBSP + ': nouvel essai possible dans ' + secondes + NBSP + 'secondes.', 'error');
    function battre() {
      var reste = Math.max(0, Math.ceil((fin - Date.now()) / 1000));
      if (reste > 0) {
        libeller(boutonConnexion, 'Réessayer dans ' + reste + NBSP + 's');
        compteARebours = window.setTimeout(battre, 250);
        return;
      }
      libeller(boutonConnexion, 'Se connecter');
      groupe.disabled = false;
      scene.rallumer();
      dire(retourConnexion, 'Vous pouvez réessayer.', 'success');
      motDePasse.focus();
    }
    battre();
  }

  /* ===== 2. Vérification : le code à six chiffres, ou un code de secours ===== */
  var verification = sections.verification;
  var formulaireCode = $('bo-two-factor-form');
  var saisie = $('bo-two-factor-code');
  var zoneCode = $('bo-two-factor-saisie');
  var cases = zoneCode.querySelectorAll('.code__case');
  var boutonCode = $('bo-two-factor-submit');
  var retourCode = $('bo-two-factor-retour');
  var modeCode = 'application';
  var envoiAuto = 0;

  /** Les six cases sont l’image du vrai champ : chiffres, case active, curseur. */
  function peindreCode() {
    var valeur = modeCode === 'application' ? saisie.value : '';
    var actif = document.activeElement === saisie;
    var rangActif = Math.min(valeur.length, cases.length - 1);
    cases.forEach(function (une, rang) {
      var chiffre = valeur.charAt(rang);
      if (une.textContent !== chiffre) {
        une.textContent = chiffre;
        if (chiffre) rejouer(une, 'data-pose');
      }
      une.toggleAttribute('data-plein', Boolean(chiffre));
      une.toggleAttribute('data-active', actif && rang === rangActif);
    });
  }

  function viderCode() {
    window.clearTimeout(envoiAuto);
    saisie.value = '';
    zoneCode.removeAttribute('data-etat');
    peindreCode();
  }

  /** Un code de secours : 32 caractères hexadécimaux, groupés par huit. */
  function formaterSecours() {
    var brut = saisie.value.toUpperCase().replace(/[^0-9A-F]/g, '').slice(0, 32);
    var groupes = brut.match(/.{1,8}/g) || [];
    var formate = groupes.join('-');
    if (formate !== saisie.value) saisie.value = formate;
  }

  function choisirMode(mode) {
    modeCode = mode;
    zoneCode.dataset.mode = mode;
    var secours = mode === 'secours';
    $('bo-two-factor-label').textContent = secours ? 'Code de secours' : 'Code de vérification';
    saisie.inputMode = secours ? 'text' : 'numeric';
    saisie.maxLength = secours ? 35 : 6;
    saisie.autocomplete = secours ? 'off' : 'one-time-code';
    saisie.setAttribute('autocapitalize', secours ? 'characters' : 'off');
    if (secours) {
      saisie.removeAttribute('pattern');
      saisie.placeholder = 'XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX';
    } else {
      saisie.pattern = '[0-9]{6}';
      saisie.removeAttribute('placeholder');
    }
    $('bo-two-factor-mode').textContent = secours ? 'Utiliser le code de l’application' : 'Utiliser un code de secours';
    dire(retourCode, '');
    viderCode();
  }

  saisie.addEventListener('input', function () {
    if (modeCode === 'secours') {
      formaterSecours();
      scene.frapper(false);
      return;
    }
    var chiffres = saisie.value.replace(/\D/g, '').slice(0, 6);
    if (chiffres !== saisie.value) saisie.value = chiffres;
    zoneCode.removeAttribute('data-etat');
    peindreCode();
    scene.frapper(false);
    window.clearTimeout(envoiAuto);
    // Le sixième chiffre envoie le code (annoncé sous le champ) : le temps de le voir se poser.
    if (chiffres.length === 6) envoiAuto = window.setTimeout(function () { formulaireCode.requestSubmit(); }, 260);
  });
  ['focus', 'blur', 'click', 'keyup', 'select'].forEach(function (type) {
    saisie.addEventListener(type, function () {
      if (modeCode === 'application' && type !== 'blur') {
        var fin = saisie.value.length;
        if (saisie.selectionStart !== fin) saisie.setSelectionRange(fin, fin);
      }
      peindreCode();
    });
  });

  $('bo-two-factor-mode').addEventListener('click', function () {
    choisirMode(modeCode === 'application' ? 'secours' : 'application');
    saisie.focus();
  });

  formulaireCode.addEventListener('submit', function (evenement) {
    evenement.preventDefault();
    window.clearTimeout(envoiAuto);
    if (formulaireCode.dataset.busy === 'true') return;
    var code = saisie.value.trim();
    var attendu = modeCode === 'application' ? /^\d{6}$/ : /^[0-9A-F]{8}(-[0-9A-F]{8}){3}$/;
    if (!attendu.test(code)) {
      dire(retourCode, modeCode === 'application' ? 'Saisissez les six chiffres du code.' : 'Saisissez un code de secours complet, quatre groupes de huit caractères.', 'error');
      saisie.focus();
      return;
    }
    occuper(formulaireCode, retourCode, inscription ? 'Activation de la vérification…' : 'Vérification du code…');
    scene.etat('attente');
    serveur.verification(code).then(function (reponse) {
      zoneCode.dataset.etat = 'accepte';
      scene.etat('vive');
      scene.frapper(true);
      return attendre(t(480)).then(function () {
        liberer(formulaireCode);
        dire(retourCode, '');
        if (inscription && reponse.recovery_codes) return afficherCodes(reponse.recovery_codes);
        return ouvrirAtelier();
      });
    }).catch(function (erreur) {
      liberer(formulaireCode);
      scene.etat('vive');
      scene.vaciller();
      zoneCode.dataset.etat = 'refus';
      dire(retourCode, erreur.message, 'error');
      window.setTimeout(function () {
        viderCode();
        saisie.focus();
      }, t(640));
    });
  });

  $('bo-two-factor-back').addEventListener('click', function () {
    viderCode();
    dire(retourCode, '');
    montrer('connexion').then(function () { adresse.focus(); });
  });

  function afficherVerification(premiere) {
    inscription = premiere;
    verification.toggleAttribute('data-inscription', premiere);
    $('bo-enrollment').hidden = !premiere;
    $('bo-two-factor-title').textContent = premiere ? 'Configurer la vérification en deux étapes' : 'Vérifier la connexion';
    $('bo-two-factor-help').textContent = premiere
      ? 'Ajoutez le backoffice à votre application d’authentification pour protéger les prochaines connexions.'
      : 'Saisissez le code de votre application d’authentification ou un code de secours.';
    libeller(boutonCode, premiere ? 'Activer la vérification' : 'Vérifier le code');
    $('bo-two-factor-mode').hidden = premiere;
    choisirMode('application');
    // La configuration repart de zéro : plaque en attente, champ fermé jusqu’à la clé.
    $('bo-enrollment-details').hidden = true;
    $('bo-enrollment-attente').hidden = !premiere;
    saisie.disabled = premiere;
    boutonCode.disabled = premiere;
    return montrer('verification').then(function () {
      if (premiere) return preparerConfiguration();
      saisie.focus();
      return undefined;
    });
  }

  /* ===== Configuration : QR code balayé par la lumière, clé à copier ===== */
  function grouper(secret) {
    return (secret.match(/.{1,4}/g) || []).join(' ');
  }

  function preparerConfiguration() {
    var details = $('bo-enrollment-details');
    var attente = $('bo-enrollment-attente');
    details.hidden = true;
    attente.hidden = false;
    $('bo-two-factor-retry').hidden = true;
    saisie.disabled = true;
    boutonCode.disabled = true;
    dire(retourCode, 'Préparation de la configuration…', 'pending');
    return serveur.configuration().then(function (configuration) {
      var image = $('bo-two-factor-qr');
      image.src = configuration.qr_code_data_url;
      image.hidden = false;
      $('bo-two-factor-secret').value = grouper(configuration.secret);
      attente.hidden = true;
      details.hidden = false;
      rejouer(image.parentElement, 'data-balaye');
      if (!reduit()) {
        details.animate([{ opacity: 0, transform: 'translateY(10px)', filter: 'blur(6px)' }, { opacity: 1, transform: 'none', filter: 'blur(0px)' }], { duration: t(800), easing: EXPO });
      }
      saisie.disabled = false;
      boutonCode.disabled = false;
      dire(retourCode, '');
      saisie.focus();
    });
  }

  $('bo-two-factor-copy').addEventListener('click', function (evenement) {
    var bouton = evenement.currentTarget;
    var secret = $('bo-two-factor-secret').value.replace(/\s/g, '');
    copier(secret).then(function () {
      bouton.firstChild.textContent = 'Copiée';
      dire(retourCode, 'La clé est copiée. Ajoutez-la dans votre application d’authentification.', 'success');
      window.setTimeout(function () { bouton.firstChild.textContent = 'Copier'; }, 2000);
    }, function () {
      dire(retourCode, 'La copie est indisponible. Sélectionnez la clé et copiez-la manuellement.', 'error');
    });
  });

  function copier(texte) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(texte);
    return new Promise(function (ok, ko) {
      var zone = document.createElement('textarea');
      zone.value = texte;
      zone.setAttribute('readonly', '');
      zone.className = 'sr';
      document.body.appendChild(zone);
      zone.select();
      var reussi = document.execCommand('copy');
      zone.remove();
      if (reussi) ok();
      else ko(new Error('copie'));
    });
  }

  /* ===== 3. Codes de secours : montrés une fois, copiés ou téléchargés ===== */
  var listeCodes = $('bo-recovery-codes');
  var retourCodes = $('bo-recovery-retour');

  function afficherCodes(codes) {
    listeCodes.textContent = '';
    codes.forEach(function (code, rang) {
      var ligne = document.createElement('li');
      ligne.style.setProperty('--rang', String(rang));
      var texte = document.createElement('code');
      texte.textContent = code;
      ligne.appendChild(texte);
      listeCodes.appendChild(ligne);
    });
    rejouer(listeCodes, 'data-revele');
    dire(retourCodes, '');
    return montrer('codes').then(function () { $('bo-recovery-title').focus(); });
  }

  function codesAffiches() {
    return Array.prototype.map.call(listeCodes.querySelectorAll('code'), function (code) { return code.textContent; });
  }

  $('bo-recovery-copy').addEventListener('click', function () {
    copier(codesAffiches().join('\n')).then(function () {
      dire(retourCodes, 'Les codes de secours sont copiés. Conservez-les dans un endroit sûr.', 'success');
    }, function () {
      dire(retourCodes, 'La copie est indisponible. Sélectionnez les codes et copiez-les manuellement.', 'error');
    });
  });

  $('bo-recovery-download').addEventListener('click', function () {
    var date = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date());
    var lignes = ['Codes de secours du backoffice', 'Créés le ' + date + '. Chaque code ne sert qu’une fois.', '']
      .concat(codesAffiches().map(function (code, rang) { return String(rang + 1).padStart(2, '0') + '  ' + code; }));
    var lien = document.createElement('a');
    lien.href = URL.createObjectURL(new Blob([lignes.join('\n') + '\n'], { type: 'text/plain;charset=utf-8' }));
    lien.download = 'codes-de-secours-backoffice.txt';
    document.body.appendChild(lien);
    lien.click();
    lien.remove();
    window.setTimeout(function () { URL.revokeObjectURL(lien.href); }, 1000);
    dire(retourCodes, 'Le fichier des codes est téléchargé. Rangez-le dans un endroit sûr.', 'success');
  });

  $('bo-recovery-continue').addEventListener('click', function () {
    ouvrirAtelier();
  });

  /* ===== L’atelier s’ouvre, et se referme =====
   * Ouvrir : la flamme s’embrase et crache ses étincelles, les bandes de
   * cinéma entrent, la caméra pousse dans la flamme (zoom, flou, surexposé) ;
   * la lumière part d’elle et découvre l’atelier, qui se met au point ; les
   * bandes s’ouvrent. Fermer (déconnexion) : le geste inverse, la lumière
   * rentre dans la lanterne et l’entrée se remet au point.
   */
  var atelier = $('atelier');
  var front = $('front-lumiere');
  var seqAtelier = null;

  function viser(origine) {
    [atelier, front].forEach(function (calque) {
      calque.style.setProperty('--ox', origine.x + 'px');
      calque.style.setProperty('--oy', origine.y + 'px');
    });
  }

  /** La caméra pousse dans la flamme (vers l’avant) ou en revient. */
  function pousserCamera(seq, depart, duree, versAvant) {
    var origine = scene.centreFlamme();
    var boite = entree.getBoundingClientRect();
    entree.style.transformOrigin = (origine.x - boite.left).toFixed(1) + 'px ' + (origine.y - boite.top).toFixed(1) + 'px';
    var loin = { transform: 'scale(1.75)', filter: 'blur(8px) brightness(1.65)' };
    var pres = { transform: 'none', filter: 'none' };
    seq.animer(entree, versAvant ? [pres, loin] : [loin, pres], {
      duration: t(duree), delay: t(depart), easing: versAvant ? EXPO_ENTREE : EXPO, fill: versAvant ? 'forwards' : 'backwards',
    });
    return origine;
  }

  function ouvrirAtelier() {
    marquerEtapes('atelier');
    if (seqAtelier) seqAtelier.annuler();
    if (reduit()) {
      atelier.hidden = false;
      entree.hidden = true;
      scene.arreter();
      $('atelier-titre').focus();
      return Promise.resolve();
    }
    var seq = (seqAtelier = sequence());
    scene.etat('embrasee');
    scene.frapper(true);
    scene.trainer(true);
    scene.etinceler(14, 1.5);
    bandes.entrer(seq, 0);
    // La poussée accélère dans la flamme ; la lumière jaillit pendant qu’elle s’achève.
    var origine = pousserCamera(seq, 100, 1300, true);
    seq.plusTard(t(650), function () {
      viser(origine);
      atelier.hidden = false;
      atelier.dataset.revele = 'ouverture';
      front.dataset.revele = 'ouverture';
      rejouer(atelier, 'data-installe');
      // La mise au point : l’atelier arrive flou et un peu trop près, puis se pose.
      seq.animer(atelier, [{ transform: 'scale(1.08)', filter: 'blur(10px)' }, { transform: 'none', filter: 'none' }], { duration: t(1600), easing: EXPO, fill: 'backwards' });
    });
    bandes.sortir(seq, 1950);
    return attendre(t(2800)).then(function () {
      if (seqAtelier !== seq) return;
      delete atelier.dataset.revele;
      delete front.dataset.revele;
      entree.hidden = true;
      seq.annuler();
      bandes.ranger();
      entree.style.removeProperty('transform-origin');
      scene.arreter();
      $('atelier-titre').focus();
    });
  }

  $('bo-logout').addEventListener('click', function () {
    if (seqAtelier) seqAtelier.annuler();
    remettreAZero(true);
    annoncer('Vous êtes déconnecté.');
    if (reduit()) {
      atelier.hidden = true;
      adresse.focus();
      return;
    }
    var seq = (seqAtelier = sequence());
    scene.lancer();
    bandes.entrer(seq, 0);
    var origine = pousserCamera(seq, 350, 1400, false);
    viser(origine);
    atelier.dataset.revele = 'fermeture';
    front.dataset.revele = 'fermeture';
    bandes.sortir(seq, 1350);
    attendre(t(2200)).then(function () {
      if (seqAtelier !== seq) return;
      atelier.hidden = true;
      delete atelier.dataset.revele;
      delete front.dataset.revele;
      seq.annuler();
      bandes.ranger();
      entree.style.removeProperty('transform-origin');
      scene.frapper(true);
      adresse.focus();
    });
  });

  /* ===== Horodatage : le jour et l’heure, comme l’indication d’un plan ===== */
  function horodater() {
    var maintenant = new Date();
    var jour = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).format(maintenant);
    var heure = maintenant.getHours() + NBSP + 'h' + NBSP + String(maintenant.getMinutes()).padStart(2, '0');
    var temps = $('horodatage');
    temps.textContent = jour + ', ' + heure;
    temps.dateTime = maintenant.getFullYear() + '-' + String(maintenant.getMonth() + 1).padStart(2, '0') + '-' + String(maintenant.getDate()).padStart(2, '0') + 'T' + String(maintenant.getHours()).padStart(2, '0') + ':' + String(maintenant.getMinutes()).padStart(2, '0');
  }

  /* ===== Le serveur simulé (maquette seulement) =====
   * Mêmes réponses et mêmes messages que backend/src/admin.rs : 401 sans
   * raison (l’écran dit « adresse ou mot de passe »), 429 avec Retry-After,
   * « Ce code est incorrect ou a déjà été utilisé. », huit codes de secours
   * de 32 caractères hexadécimaux groupés par huit.
   */
  var serveur = (function () {
    var refus = [];
    function ErreurApi(status, message, retryAfter) {
      this.status = status;
      this.message = message;
      this.retryAfter = retryAfter;
    }
    function hexa(longueur) {
      var octets = new Uint8Array(longueur / 2);
      window.crypto.getRandomValues(octets);
      return Array.prototype.map.call(octets, function (octet) { return octet.toString(16).padStart(2, '0'); }).join('').toUpperCase();
    }
    function codes() {
      var liste = [];
      for (var i = 0; i < 8; i++) liste.push((hexa(32).match(/.{8}/g) || []).join('-'));
      return liste;
    }
    /** Un faux QR code (25 × 25, trois repères, synchronisation, alignement), tiré d’une graine. */
    function qr(graine) {
      var n = 25;
      var m = [];
      var etat = graine >>> 0;
      function alea() {
        etat = (etat + 0x6d2b79f5) >>> 0;
        var x = etat;
        x = Math.imul(x ^ (x >>> 15), x | 1);
        x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
        return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
      }
      for (var y = 0; y < n; y++) {
        m[y] = [];
        for (var x = 0; x < n; x++) m[y][x] = alea() > 0.52;
      }
      function repere(x0, y0) {
        for (var dy = -1; dy <= 7; dy++) {
          for (var dx = -1; dx <= 7; dx++) {
            var px = x0 + dx;
            var py = y0 + dy;
            if (px < 0 || py < 0 || px >= n || py >= n) continue;
            var bord = dx === -1 || dy === -1 || dx === 7 || dy === 7;
            var anneau = dx === 0 || dy === 0 || dx === 6 || dy === 6;
            var coeur = dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4;
            m[py][px] = !bord && (anneau || coeur);
          }
        }
      }
      repere(0, 0);
      repere(n - 7, 0);
      repere(0, n - 7);
      for (var i = 8; i < n - 8; i++) {
        m[6][i] = i % 2 === 0;
        m[i][6] = i % 2 === 0;
      }
      var a = n - 7;
      for (var ay = -2; ay <= 2; ay++) {
        for (var ax = -2; ax <= 2; ax++) m[a + ay][a + ax] = Math.max(Math.abs(ax), Math.abs(ay)) !== 1;
      }
      var marge = 2;
      var cote = n + marge * 2;
      var trace = '';
      for (var ly = 0; ly < n; ly++) {
        for (var lx = 0; lx < n; lx++) if (m[ly][lx]) trace += 'M' + (lx + marge) + ' ' + (ly + marge) + 'h1v1h-1z';
      }
      var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + cote + ' ' + cote + '" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#fff"/><path d="' + trace + '" fill="#000"/></svg>';
      return 'data:image/svg+xml,' + encodeURIComponent(svg);
    }
    return {
      codes: codes,
      connexion: function (email, motDePasseSaisi) {
        return attendre(950).then(function () {
          var maintenant = Date.now();
          refus = refus.filter(function (instant) { return maintenant - instant < 60000; });
          var mot = motDePasseSaisi.trim().toLowerCase();
          if (mot === 'bloque' || refus.length >= 5) {
            refus = [];
            throw new ErreurApi(429, 'Trop de tentatives. Patientez avant de réessayer.', 20);
          }
          if (mot === 'erreur') {
            refus.push(maintenant);
            throw new ErreurApi(401, 'L’adresse e-mail ou le mot de passe est incorrect.');
          }
          return { two_factor_required: true, enrollment_required: $('regie-premiere').checked };
        });
      },
      configuration: function () {
        return attendre(1300).then(function () {
          return { secret: 'JBSWY3DPEHPK3PXPAB3C7D2EQ4LM', qr_code_data_url: qr(20261026) };
        });
      },
      verification: function (code) {
        return attendre(850).then(function () {
          if (code === '000000') throw new ErreurApi(401, 'Ce code est incorrect ou a déjà été utilisé.');
          return { authenticated: true, recovery_codes: inscription ? codes() : undefined };
        });
      },
    };
  })();

  /* ===== Régie : hors design, pour parcourir les états ===== */
  /** Revient à l’écran de connexion ; `garderAtelier` laisse l’atelier se refermer de lui-même. */
  function remettreAZero(garderAtelier) {
    generique.abreger();
    window.clearTimeout(compteARebours);
    window.clearTimeout(envoiAuto);
    [formulaireConnexion, formulaireCode].forEach(liberer);
    libeller(boutonConnexion, 'Se connecter');
    [retourConnexion, retourCode, retourCodes].forEach(function (zone) { dire(zone, ''); });
    annoncer('');
    adresse.value = '';
    motDePasse.value = '';
    motDePasse.type = 'password';
    $('bo-password-voir').firstChild.textContent = 'Afficher';
    $('bo-password-maj').hidden = true;
    choisirMode('application');
    inscription = false;
    verification.removeAttribute('data-inscription');
    $('bo-two-factor-title').textContent = 'Vérifier la connexion';
    $('bo-enrollment').hidden = true;
    saisie.disabled = false;
    boutonCode.disabled = false;
    if (!garderAtelier) {
      if (seqAtelier) seqAtelier.annuler();
      bandes.ranger();
      atelier.hidden = true;
      delete atelier.dataset.revele;
      delete front.dataset.revele;
      entree.style.removeProperty('transform-origin');
    }
    entree.hidden = false;
    scene.etat('vive');
    montrer('connexion', true);
    scene.lancer();
    window.scrollTo(0, 0);
  }

  var regie = {
    ouverture: function () { remettreAZero(); generique.jouer('complete'); },
    'ouverture-courte': function () { remettreAZero(); generique.jouer('courte'); },
    connexion: function () { remettreAZero(); adresse.focus(); },
    erreur: function () {
      remettreAZero();
      adresse.value = 'charles@exemple.fr';
      motDePasse.value = 'erreur';
      formulaireConnexion.requestSubmit();
    },
    bloque: function () {
      remettreAZero();
      adresse.value = 'charles@exemple.fr';
      motDePasse.value = 'bloque';
      formulaireConnexion.requestSubmit();
    },
    verification: function () { remettreAZero(); afficherVerification(false); },
    secours: function () {
      remettreAZero();
      afficherVerification(false).then(function () {
        choisirMode('secours');
        saisie.focus();
      });
    },
    inscription: function () { remettreAZero(); afficherVerification(true); },
    codes: function () {
      remettreAZero();
      inscription = true;
      afficherCodes(serveur.codes());
    },
    expiree: function () {
      remettreAZero();
      annoncer('La session a expiré. Connectez-vous à nouveau.', 'error');
      adresse.focus();
    },
    atelier: function () { remettreAZero(); ouvrirAtelier(); },
  };

  document.querySelectorAll('[data-regie]').forEach(function (bouton) {
    bouton.addEventListener('click', function () { regie[bouton.dataset.regie](); });
  });
  $('regie-veille').checked = racine.getAttribute('data-scene-jour') === 'veille';
  $('regie-veille').addEventListener('change', function (evenement) {
    if (evenement.currentTarget.checked) racine.setAttribute('data-scene-jour', 'veille');
    else racine.removeAttribute('data-scene-jour');
  });
  $('regie-lent').checked = racine.style.getPropertyValue('--d-scene') !== '';
  $('regie-lent').addEventListener('change', function (evenement) {
    if (evenement.currentTarget.checked) {
      racine.style.setProperty('--d-ui', '600ms');
      racine.style.setProperty('--d-scene', '1200ms');
    } else {
      racine.style.removeProperty('--d-ui');
      racine.style.removeProperty('--d-scene');
    }
  });
  $('regie-reduit').checked = reduit();
  $('regie-reduit').addEventListener('change', function (evenement) {
    racine.classList.toggle('mouvement-reduit', evenement.currentTarget.checked);
    if (evenement.currentTarget.checked) {
      generique.abreger();
      scene.figer();
    } else {
      scene.semer(18);
      scene.lancer(3);
    }
  });

  /* ===== Démarrage ===== */
  entree.querySelectorAll('.entree__carte').forEach(function (carte) {
    scene.liserer(carte);
    scene.anneau(carte);
  });
  scene.suivreCarte(carteConnexion);
  if (!reduit()) scene.semer(18);
  horodater();
  window.setInterval(horodater, 15000);

  var ouvertureDemandee = racine.getAttribute('data-ouverture');
  var sceneDemandee = new URLSearchParams(window.location.search).get('scene');
  if (ouvertureDemandee) generique.jouer(ouvertureDemandee);
  else scene.lancer(0.8);
  if (sceneDemandee && regie[sceneDemandee]) regie[sceneDemandee]();
  else if (!ouvertureDemandee && pointeurFin.matches) adresse.focus({ preventScroll: true });
})();
