/*
 * Interactions de la maquette B « Banc d’essai ».
 * Tout le contenu reste lisible sans ce script : il ajoute la section
 * active, la progression, le tracé du plafond, les onglets de la boucle,
 * le réticule de lecture des figures et la copie de l’adresse.
 */
(function () {
  'use strict';
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduit = function () { return window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches; };

  /* 1. Navigation de page : règle graduée, sommaire mobile, progression */
  function navigationDePage() {
    var liensRail = $$('.rail a[href^="#"]');
    var liensSommaire = $$('[data-sommaire] a[href^="#"]');
    var tous = liensRail.concat(liensSommaire);
    var ids = liensRail.length ? liensRail : liensSommaire;
    var sections = ids.map(function (a) { return document.getElementById(a.hash.slice(1)); }).filter(Boolean);
    var regle = document.querySelector('.rail__regle');
    var curseur = document.querySelector('.rail__curseur');
    var barre = document.querySelector('.progression span');
    var actif;

    function maj() {
      var max = document.documentElement.scrollHeight - innerHeight;
      if (barre) barre.style.setProperty('--lu', max > 0 ? Math.min(1, Math.max(0, scrollY / max)).toFixed(4) : 0);
      if (!sections.length) return;
      var ligne = innerHeight * 0.3;
      var courant = null;
      sections.forEach(function (s) { if (s.getBoundingClientRect().top <= ligne) courant = s; });
      if (courant === actif) return;
      actif = courant;
      tous.forEach(function (a) {
        if (courant && a.hash === '#' + courant.id) a.setAttribute('aria-current', 'location');
        else a.removeAttribute('aria-current');
      });
      if (curseur && regle) {
        var a = liensRail.filter(function (l) { return l.hasAttribute('aria-current'); })[0];
        if (a) {
          var r = a.getBoundingClientRect(), g = regle.getBoundingClientRect();
          curseur.style.setProperty('--y', (r.top - g.top) + 'px');
          curseur.style.setProperty('--h', r.height + 'px');
        }
        curseur.style.opacity = a ? '1' : '0';
      }
    }
    addEventListener('scroll', maj, { passive: true });
    addEventListener('resize', maj);
    maj();

    liensSommaire.forEach(function (a) {
      a.addEventListener('click', function () { var d = a.closest('details'); if (d) d.open = false; });
    });
  }

  /* 1 bis. La nuit, la lanterne éclaire la zone lue : un halo et les relevés à l’ambre */
  function zoneEclairee() {
    var zones = $$('[data-zone]');
    if (!zones.length) return;
    var courante;
    function maj() {
      var ligne = innerHeight * 0.35, choix = zones[0];
      zones.forEach(function (z) { if (z.getBoundingClientRect().top <= ligne) choix = z; });
      if (choix === courante) return;
      if (courante) courante.classList.remove('eclairee');
      choix.classList.add('eclairee');
      courante = choix;
    }
    addEventListener('scroll', maj, { passive: true });
    addEventListener('resize', maj);
    maj();
  }

  /* 2. Menus repliables : Échap et clic extérieur ferment, le focus revient */
  function deroulants() {
    var tous = $$('details.deroulant');
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      tous.forEach(function (d) {
        if (d.open) { d.open = false; var s = d.querySelector('summary'); if (s) s.focus(); }
      });
    });
    document.addEventListener('click', function (e) {
      tous.forEach(function (d) { if (d.open && !d.contains(e.target)) d.open = false; });
    });
    tous.forEach(function (d) {
      d.addEventListener('toggle', function () {
        if (d.open) tous.forEach(function (o) { if (o !== d) o.open = false; });
      });
    });
  }

  /* 3. Le plafond : tracé une fois à l’arrivée, rejouable */
  function plafond() {
    $$('[data-plafond]').forEach(function (fig) {
      $$('.courbe', fig).forEach(function (c) {
        var l = 0;
        try { l = c.getTotalLength(); } catch (e) { l = 0; }
        c.style.setProperty('--long', String(Math.ceil(l || 1200)));
      });
      var bouton = fig.querySelector('[data-rejouer]');
      if (reduit()) { if (bouton) bouton.hidden = true; return; }
      fig.classList.add('est-pret');
      var tracer = function () {
        fig.classList.remove('est-trace');
        void fig.getBoundingClientRect();
        requestAnimationFrame(function () { requestAnimationFrame(function () { fig.classList.add('est-trace'); }); });
      };
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (es) {
          es.forEach(function (e) { if (e.isIntersecting) { tracer(); io.disconnect(); } });
        }, { threshold: 0.4 });
        io.observe(fig);
      } else { fig.classList.add('est-trace'); }
      if (bouton) bouton.addEventListener('click', tracer);
    });
  }

  /* 4. Onglets accessibles (la boucle de la semaine type) */
  function onglets() {
    $$('[data-onglets]').forEach(function (bloc) {
      var listes = $$('[role="tablist"]', bloc);
      var tabs = $$('[role="tab"]', bloc);
      var panneaux = $$('[role="tabpanel"]', bloc);
      if (!tabs.length) return;
      listes.forEach(function (l) { l.hidden = false; });
      $$('details.temps', bloc).forEach(function (d) {
        d.open = true;
        var r = d.querySelector('summary');
        if (r) { r.tabIndex = -1; r.addEventListener('click', function (e) { e.preventDefault(); }); }
      });
      bloc.classList.add('onglets-actifs');
      function choisir(id, focus) {
        tabs.forEach(function (t) {
          var oui = t.getAttribute('aria-controls') === id;
          t.setAttribute('aria-selected', oui ? 'true' : 'false');
          t.tabIndex = oui ? 0 : -1;
          if (oui && focus) t.focus();
        });
        panneaux.forEach(function (p) { p.hidden = p.id !== id; });
        bloc.setAttribute('data-station', id);
      }
      tabs.forEach(function (t) {
        t.addEventListener('click', function () { choisir(t.getAttribute('aria-controls'), false); });
        t.addEventListener('keydown', function (e) {
          var liste = $$('[role="tab"]', t.parentElement);
          var i = liste.indexOf(t), n = liste.length, j = null;
          if (e.key === 'ArrowRight' || e.key === 'ArrowDown') j = (i + 1) % n;
          if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') j = (i - 1 + n) % n;
          if (e.key === 'Home') j = 0;
          if (e.key === 'End') j = n - 1;
          if (j !== null) { e.preventDefault(); choisir(liste[j].getAttribute('aria-controls'), true); }
        });
      });
      var premier = tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0] || tabs[0];
      choisir(premier.getAttribute('aria-controls'), false);
    });
  }

  /* 5. Réticule de lecture des figures : survol ou focus d’une colonne */
  function reticuleFigures() {
    $$('[data-lecture]').forEach(function (fig) {
      var svg = fig.querySelector('svg');
      var lecture = fig.querySelector('.lecture');
      var viseur = fig.querySelector('.viseur');
      var vx = viseur && viseur.querySelector('[data-vx]');
      var vy = viseur && viseur.querySelector('[data-vy]');
      var cibles = $$('.col-cible', fig);
      if (!svg || !lecture) return;
      function montrer(c) {
        var d = c.dataset;
        lecture.innerHTML = '<b>' + d.date + '</b><dl>' +
          '<dt>Entrées anglaises</dt><dd>' + d.total + '</dd>' +
          '<dt>Sans équivalent français</dt><dd>' + d.manque + '</dd>' +
          '<dt>dont plantes</dt><dd>' + d.plantes + '</dd>' +
          '<dt>dont zombies</dt><dd>' + d.zombies + '</dd>' +
          '<dt>dont interface</dt><dd>' + d.interface + '</dd></dl>';
        var cx = parseFloat(d.cx), cy = parseFloat(d.cy);
        if (vx) { vx.setAttribute('x1', cx); vx.setAttribute('x2', cx); }
        if (vy) { vy.setAttribute('y1', cy); vy.setAttribute('y2', cy); }
        if (viseur) viseur.classList.add('actif');
        $$('.col-focus', fig).forEach(function (f) { f.classList.toggle('actif', f.previousElementSibling === c); });
        var vb = svg.viewBox.baseVal, r = svg.getBoundingClientRect(), fr = fig.getBoundingClientRect();
        var px = r.left - fr.left + (cx / vb.width) * r.width;
        var py = r.top - fr.top + (cy / vb.height) * r.height;
        lecture.classList.add('actif');
        var lw = lecture.offsetWidth, lh = lecture.offsetHeight;
        var x = px + 16; if (x + lw > fr.width) x = px - lw - 16; if (x < 0) x = 0;
        var y = py - lh - 12; if (y < 0) y = py + 16;
        lecture.style.left = x + 'px';
        lecture.style.top = y + 'px';
      }
      function cacher() {
        lecture.classList.remove('actif');
        if (viseur) viseur.classList.remove('actif');
        $$('.col-focus', fig).forEach(function (f) { f.classList.remove('actif'); });
      }
      cibles.forEach(function (c) {
        c.addEventListener('pointerenter', function () { montrer(c); });
        c.addEventListener('focus', function () { montrer(c); });
        c.addEventListener('blur', cacher);
      });
      svg.addEventListener('pointerleave', cacher);
    });
  }

  /* 6. Copier l’adresse e-mail */
  function copier() {
    $$('[data-copier]').forEach(function (b) {
      var lib = b.querySelector('[data-copier-libelle]') || b;
      var depart = lib.textContent;
      b.addEventListener('click', function () {
        var adresse = b.getAttribute('data-copier');
        var fini = function (txt) { lib.textContent = txt; setTimeout(function () { lib.textContent = depart; }, 2400); };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(adresse).then(function () { fini('Adresse copiée'); }, function () { location.href = 'mailto:' + adresse; });
        } else { location.href = 'mailto:' + adresse; }
      });
    });
  }

  /* 7. Galeries défilantes sur mobile : compteur « 2 / 3 » (E7) */
  function carrousels() {
    $$('[data-carrousel]').forEach(function (g) {
      var compteur = g.parentElement.querySelector('[data-compteur]');
      var items = Array.prototype.slice.call(g.children);
      if (!compteur || !items.length) return;
      var maj = function () {
        var gauche = g.getBoundingClientRect().left;
        var i = 0, meilleur = Infinity;
        items.forEach(function (it, k) {
          var d = Math.abs(it.getBoundingClientRect().left - gauche - parseFloat(getComputedStyle(g).paddingLeft));
          if (d < meilleur) { meilleur = d; i = k; }
        });
        compteur.textContent = (i + 1) + ' / ' + items.length;
      };
      g.addEventListener('scroll', function () { requestAnimationFrame(maj); }, { passive: true });
      maj();
    });
  }

  /* 8. Onglets du parcours : l’onglet actif reste dans la vue (E7) */
  function ongletsParcours() {
    $$('.onglets-parcours').forEach(function (barre) {
      var actif = barre.querySelector('[aria-current="page"]');
      if (actif && barre.scrollWidth > barre.clientWidth) {
        barre.scrollLeft = Math.max(0, actif.offsetLeft - barre.clientWidth / 2 + actif.offsetWidth / 2);
      }
    });
  }

  /* 9. Page « hors maquette » : nommer la page demandée */
  function horsMaquette() {
    var cible = document.querySelector('[data-page-demandee]');
    if (!cible) return;
    var p = new URLSearchParams(location.search).get('page') || '';
    var noms = {
      'contact': 'Contact', 'parcours': 'Parcours', 'parcours/formation': 'Formation et certifications',
      'parcours/professionnel': 'Parcours professionnel', 'projets/league-of-database': 'League Of Data Base',
      'projets/omnicard': 'Omnicard', 'projets/bloodborne-legendary-run': 'Bloodborne Legendary Run',
      'projets/gup': 'gup', 'mentions-legales': 'Mentions légales'
    };
    cible.textContent = noms[p] || 'Cette page';
    var url = document.querySelector('[data-url-demandee]');
    if (url) url.textContent = '/' + p;
  }

  document.addEventListener('DOMContentLoaded', function () {
    navigationDePage();
    zoneEclairee();
    deroulants();
    plafond();
    onglets();
    reticuleFigures();
    copier();
    carrousels();
    ongletsParcours();
    horsMaquette();
  });
})();
