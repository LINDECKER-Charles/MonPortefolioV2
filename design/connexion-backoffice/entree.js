/*
 * Maquette « L’atelier s’allume » : la scène et le parcours de connexion.
 *
 * Le script joue aussi le serveur (`serveur`, en bas) : au portage, la scène
 * (balancier, poussière, liseré, états de la flamme, ouverture, fermeture) et
 * les champs (mot de passe, code à six chiffres, code de secours, codes)
 * rejoignent scripts/backoffice.ts, qui garde ses identifiants, ses appels et
 * ses retours.
 *
 * Plan : outils · scène · ouverture · écrans et étapes · connexion ·
 * vérification · configuration · codes de secours · atelier · horodatage ·
 * serveur simulé · régie · démarrage.
 */
(function () {
  'use strict';

  var racine = document.documentElement;
  var $ = function (id) { return document.getElementById(id); };
  var entree = $('entree');
  var NBSP = ' ';
  var pointeurFin = window.matchMedia('(pointer: fine)');

  /* ===== Outils ===== */
  function reduit() {
    return racine.classList.contains('mouvement-reduit');
  }
  function dScene() {
    return parseFloat(getComputedStyle(racine).getPropertyValue('--d-scene')) || 400;
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
  /** Un titre se compose mot à mot : chaque mot monte de sa ligne à l’ouverture. */
  function composerTitre(titre, texte) {
    var mots = (texte === undefined ? titre.textContent : texte).trim().split(/\s+/);
    titre.textContent = '';
    mots.forEach(function (mot, rang) {
      var enveloppe = document.createElement('span');
      enveloppe.className = 'mot';
      var interieur = document.createElement('span');
      interieur.textContent = mot;
      interieur.style.setProperty('--i', String(rang));
      enveloppe.appendChild(interieur);
      titre.appendChild(enveloppe);
      if (rang < mots.length - 1) titre.appendChild(document.createTextNode(' '));
    });
  }
  /** Relance une animation CSS portée par un attribut. */
  function rejouer(element, attribut) {
    element.removeAttribute(attribut);
    void element.offsetWidth;
    element.setAttribute(attribut, '');
  }

  /* ===== La scène : flamme, balancier, poussière, liseré ===== */
  var scene = (function () {
    var suspension = $('suspension');
    var lanterne = $('lanterne');
    var sursaut = entree.querySelector('.flamme__sursaut');
    var eclat = entree.querySelector('.lanterne__eclat');
    var halo = entree.querySelector('.lanterne__halo');
    var derniereFrappe = 0;

    function flamme(etat) {
      entree.dataset.flamme = etat;
    }
    function palier(niveau) {
      entree.dataset.palier = String(niveau);
    }

    /** Une frappe : la flamme sursaute, un éclat passe. */
    function frapper(fort) {
      var maintenant = performance.now();
      if (reduit() || entree.dataset.flamme === 'soufflee' || maintenant - derniereFrappe < 90) return;
      derniereFrappe = maintenant;
      var ampleur = fort ? 1.22 : 1.1;
      sursaut.animate(
        [{ transform: 'scale(1)' }, { transform: 'scale(' + (ampleur - 0.04) + ', ' + ampleur + ')', offset: 0.35 }, { transform: 'scale(1)' }],
        { duration: fort ? 520 : 300, easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)' }
      );
      eclat.animate(
        [{ opacity: 0, scale: 0.85 }, { opacity: fort ? 1 : 0.75, scale: 1.08, offset: 0.3 }, { opacity: 0, scale: 1 }],
        { duration: fort ? 700 : 420, easing: 'ease-out' }
      );
    }

    /** Un refus : la flamme se couche, faiblit, puis se redresse. */
    function vaciller() {
      if (reduit()) return;
      sursaut.animate(
        [
          { transform: 'scale(1) skewX(0deg)', opacity: 1 },
          { transform: 'scale(0.6, 0.45) skewX(10deg)', opacity: 0.5, offset: 0.22 },
          { transform: 'scale(0.8, 0.72) skewX(-6deg)', opacity: 0.8, offset: 0.5 },
          { transform: 'scale(1) skewX(0deg)', opacity: 1 },
        ],
        { duration: 1200, easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)' }
      );
      halo.animate([{ opacity: 1 }, { opacity: 0.32, offset: 0.25 }, { opacity: 1 }], { duration: 1400, easing: 'ease-in-out' });
    }

    /** La flamme revient : elle grandit d’une braise, avec un éclat. */
    function rallumer() {
      flamme('vive');
      frapper(true);
    }

    /* Le balancier : un pendule amorti autour du point d’attache, et l’air de
       l’atelier qui le berce. Angle en degrés, vitesse en degrés par seconde. */
    var angle = 0;
    var vitesse = 0;
    var dernier = 0;
    var boucle = 0;
    var actif = false;
    var RAIDEUR = 9;   // ≈ 2,1 s par aller-retour
    var AMORTI = 0.85; // revient au calme en cinq ou six secondes

    function pas(instant) {
      var dt = Math.min(0.05, (instant - dernier) / 1000 || 0.016);
      dernier = instant;
      var air = Math.sin(instant / 2300) * 0.4 + Math.sin(instant / 3700 + 1.3) * 0.3;
      vitesse += (-RAIDEUR * (angle - air) - AMORTI * vitesse) * dt;
      angle += vitesse * dt;
      suspension.style.transform = 'rotate(' + angle.toFixed(3) + 'deg)';
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
    });

    /* La poussière qui danse dans la lumière : positions, tailles et durées
       tirées au sort, en multiples de --d-scene. */
    function semer(nombre) {
      var conteneur = $('poussieres');
      conteneur.textContent = '';
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
        conteneur.appendChild(grain);
      }
    }

    /* Le liseré : la lumière accrochée au bord de la carte suit la main. */
    function liserer(carte) {
      carte.addEventListener('pointermove', function (evenement) {
        if (evenement.pointerType !== 'mouse') return;
        var boite = carte.getBoundingClientRect();
        carte.style.setProperty('--mx', (((evenement.clientX - boite.left) / boite.width) * 100).toFixed(1) + '%');
        carte.style.setProperty('--my', (((evenement.clientY - boite.top) / boite.height) * 100).toFixed(1) + '%');
      });
      carte.addEventListener('pointerleave', function () {
        carte.style.removeProperty('--mx');
        carte.style.removeProperty('--my');
      });
    }

    /** Le centre de la flamme à l’écran : l’origine de la lumière qui ouvre l’atelier. */
    function centreFlamme() {
      var boite = entree.querySelector('.flamme__corps').getBoundingClientRect();
      return { x: Math.round(boite.left + boite.width / 2), y: Math.round(boite.top + boite.height * 0.62) };
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) arreter();
      else if (!entree.hidden) lancer();
    });

    return {
      flamme: flamme, palier: palier, frapper: frapper, vaciller: vaciller, rallumer: rallumer,
      lancer: lancer, arreter: arreter, figer: figer, semer: semer, liserer: liserer, centreFlamme: centreFlamme,
    };
  })();

  /* ===== L’ouverture : une fois par session, abrégée par un geste ===== */
  var ouverture = (function () {
    var fin = 0;
    var DUREES = { complete: 7.2, courte: 2.9 };

    function enCours() {
      return racine.hasAttribute('data-ouverture');
    }
    function abreger() {
      window.clearTimeout(fin);
      racine.removeAttribute('data-ouverture');
      document.removeEventListener('keydown', abreger, true);
      document.removeEventListener('pointerdown', abreger, true);
    }
    function suivre(mode) {
      window.clearTimeout(fin);
      fin = window.setTimeout(abreger, dScene() * DUREES[mode]);
      document.addEventListener('keydown', abreger, true);
      document.addEventListener('pointerdown', abreger, true);
    }
    function jouer(mode) {
      abreger();
      if (reduit()) return;
      void entree.offsetWidth;
      racine.setAttribute('data-ouverture', mode);
      scene.lancer(mode === 'complete' ? 7 : 2.5);
      suivre(mode);
    }
    return { enCours: enCours, abreger: abreger, suivre: suivre, jouer: jouer };
  })();

  /* ===== Écrans et étapes ===== */
  var sections = { connexion: $('bo-login'), verification: $('bo-two-factor'), codes: $('bo-recovery') };
  var etapes = $('etapes');
  var inscription = false;

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

  /**
   * Change d’écran. Avec View Transitions, le récit sort par le haut et le
   * suivant monte, la carte se redimensionne ; sinon un fondu monté.
   */
  function montrer(ecran, instantane) {
    if (ouverture.enCours()) ouverture.abreger();
    function changer() {
      Object.keys(sections).forEach(function (cle) { sections[cle].hidden = cle !== ecran; });
      entree.dataset.ecran = ecran;
      marquerEtapes(ecran);
      scene.palier(ecran === 'connexion' ? 1 : ecran === 'verification' ? 2 : 3);
    }
    if (instantane || reduit()) {
      changer();
      return Promise.resolve();
    }
    if (typeof document.startViewTransition === 'function') {
      var transition = document.startViewTransition(changer);
      return transition.finished.catch(function () {});
    }
    changer();
    var section = sections[ecran];
    rejouer(section, 'data-arrivee');
    return attendre(dScene() * 1.75).then(function () { section.removeAttribute('data-arrivee'); });
  }

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
    window.setTimeout(function () { carte.removeAttribute('data-refus'); }, dScene() * 1.2);
  }

  formulaireConnexion.addEventListener('submit', function (evenement) {
    evenement.preventDefault();
    if (formulaireConnexion.dataset.busy === 'true') return;
    annoncer('');
    occuper(formulaireConnexion, retourConnexion, 'Connexion…');
    scene.flamme('attente');
    serveur.connexion(adresse.value.trim(), motDePasse.value).then(function (reponse) {
      liberer(formulaireConnexion);
      motDePasse.value = '';
      dire(retourConnexion, '');
      scene.flamme('vive');
      scene.frapper(true);
      if (reponse.two_factor_required) return afficherVerification(Boolean(reponse.enrollment_required));
      return ouvrirAtelier();
    }).catch(function (erreur) {
      liberer(formulaireConnexion);
      if (erreur.status === 429) {
        bloquer(erreur.retryAfter || 60);
        return;
      }
      scene.flamme('vive');
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
    scene.flamme('soufflee');
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
    scene.flamme('attente');
    serveur.verification(code).then(function (reponse) {
      zoneCode.dataset.etat = 'accepte';
      scene.flamme('vive');
      scene.frapper(true);
      return attendre(dScene() * 1.2).then(function () {
        liberer(formulaireCode);
        dire(retourCode, '');
        if (inscription && reponse.recovery_codes) return afficherCodes(reponse.recovery_codes);
        return ouvrirAtelier();
      });
    }).catch(function (erreur) {
      liberer(formulaireCode);
      scene.flamme('vive');
      scene.vaciller();
      zoneCode.dataset.etat = 'refus';
      dire(retourCode, erreur.message, 'error');
      window.setTimeout(function () {
        viderCode();
        saisie.focus();
      }, dScene() * 1.6);
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
    composerTitre($('bo-two-factor-title'), premiere ? 'Configurer la vérification en deux étapes' : 'Vérifier la connexion');
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

  /* ===== L’atelier s’ouvre, et se referme ===== */
  var atelier = $('atelier');
  var front = $('front-lumiere');

  function viser(origine) {
    [atelier, front].forEach(function (calque) {
      calque.style.setProperty('--ox', origine.x + 'px');
      calque.style.setProperty('--oy', origine.y + 'px');
    });
  }

  /**
   * La flamme s’embrase, puis la lumière part d’elle et gagne l’écran : elle
   * découvre l’atelier. Au portage, le chargement des rubriques
   * (ouvrirWorkspace) se fait pendant ce temps.
   */
  function ouvrirAtelier() {
    marquerEtapes('atelier');
    if (reduit()) {
      atelier.hidden = false;
      entree.hidden = true;
      scene.arreter();
      $('atelier-titre').focus();
      return Promise.resolve();
    }
    scene.flamme('embrasee');
    scene.frapper(true);
    return attendre(dScene() * 0.9).then(function () {
      viser(scene.centreFlamme());
      atelier.hidden = false;
      atelier.removeAttribute('data-installe');
      atelier.dataset.revele = 'ouverture';
      front.dataset.revele = 'ouverture';
      return attendre(dScene() * 3);
    }).then(function () {
      delete atelier.dataset.revele;
      delete front.dataset.revele;
      rejouer(atelier, 'data-installe');
      entree.hidden = true;
      scene.arreter();
      $('atelier-titre').focus();
    });
  }

  /** La déconnexion : la lumière revient dans la lanterne, l’entrée réapparaît. */
  $('bo-logout').addEventListener('click', function () {
    remettreAZero(true);
    annoncer('Vous êtes déconnecté.');
    if (reduit()) {
      atelier.hidden = true;
      adresse.focus();
      return;
    }
    scene.lancer();
    viser(scene.centreFlamme());
    atelier.dataset.revele = 'fermeture';
    front.dataset.revele = 'fermeture';
    attendre(dScene() * 2.5).then(function () {
      atelier.hidden = true;
      delete atelier.dataset.revele;
      delete front.dataset.revele;
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
        var t = etat;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
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
      ErreurApi: ErreurApi,
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
    ouverture.abreger();
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
    composerTitre($('bo-two-factor-title'), 'Vérifier la connexion');
    $('bo-enrollment').hidden = true;
    saisie.disabled = false;
    boutonCode.disabled = false;
    if (!garderAtelier) {
      atelier.hidden = true;
      delete atelier.dataset.revele;
      delete front.dataset.revele;
    }
    entree.hidden = false;
    scene.flamme('vive');
    montrer('connexion', true);
    scene.lancer();
    window.scrollTo(0, 0);
  }

  var regie = {
    ouverture: function () { remettreAZero(); ouverture.jouer('complete'); },
    'ouverture-courte': function () { remettreAZero(); ouverture.jouer('courte'); },
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
      ouverture.abreger();
      scene.figer();
    } else {
      scene.semer(18);
      scene.lancer(3);
    }
  });

  /* ===== Démarrage ===== */
  // Les titres arrivent déjà découpés en mots (HTML) : rien ne clignote avant ce script.
  entree.querySelectorAll('.entree__carte').forEach(scene.liserer);
  if (!reduit()) scene.semer(18);
  horodater();
  window.setInterval(horodater, 15000);

  var mode = racine.getAttribute('data-ouverture');
  if (mode) {
    scene.lancer(mode === 'complete' ? 7 : 2.5);
    ouverture.suivre(mode);
  } else {
    scene.lancer(0.8);
  }

  var demande = new URLSearchParams(window.location.search).get('scene');
  if (demande && regie[demande]) regie[demande]();
  else if (pointeurFin.matches) adresse.focus({ preventScroll: true });
})();
