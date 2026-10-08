/**
 * Tests du serveur de production, sans navigateur ni dépendance :
 * `node --test "server/*.test.mjs"` (lancé par `npm test`).
 * Chaque groupe monte un dist/ factice dans un dossier temporaire ; le chargeur
 * de mesure est exécuté dans un bac à sable `vm`, avec un DOM réduit au strict
 * nécessaire, pour en vérifier le comportement et pas seulement le texte.
 */
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { request } from 'node:http';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import {
  creerServeur,
  chargeurMesure,
  lireConfigHoteCanonique,
  lireConfigMesure,
  MESURE_DESACTIVEE,
  POLITIQUE_CSP,
} from './server.mjs';
import { REDIRECTIONS } from './redirections.mjs';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const UUID = '3f1c2b9e-8a41-4c5d-9e0f-1a2b3c4d5e6f';
const MESURE = { UMAMI_WEBSITE_ID: UUID, UMAMI_SITE_DOMAIN: 'test.exemple.org' };
const CANONIQUE = { REDIRECT_HOSTS: 'www.exemple.org', CANONICAL_ORIGIN: 'https://exemple.org' };

const page = (titre) =>
  `<!doctype html><html lang="fr"><head><title>${titre}</title><script src="/theme.js"></script><script defer src="/mesure.js"></script></head><body>${titre}</body></html>`;

/** Le dist/ du contrat de build (astro.config.mjs), réduit à l'essentiel. */
async function distFactice() {
  const dossier = await mkdtemp(path.join(tmpdir(), 'portfolio-dist-'));
  const fichiers = {
    'index.html': page('Accueil'),
    'mentions-legales/index.html': page('Mentions légales'),
    'projets/index.html': page('Projets'),
    'parcours/index.html': page('Parcours'),
    'contact/index.html': page('Contact'),
    'rubrique/sous-page/index.html': page('Sous-page'),
    '404.html': page('Introuvable'),
    '_astro/app.Ab12Cd34.js': 'console.log(1)',
    '_astro/site.Ef56Gh78.css': 'body{margin:0}',
    'img/portrait.webp': 'RIFFxxxxWEBP',
    'favicon.ico': 'ICO',
    'favicon.svg': '<svg xmlns="http://www.w3.org/2000/svg"/>',
    'site.webmanifest': '{"name":"Portfolio"}',
    'theme.js': "document.documentElement.dataset.theme = 'jour';",
    'robots.txt': 'User-agent: *\n',
    'sitemap.xml': '<urlset></urlset>',
    // Copie de public/mesure.js : la route générée doit l'emporter.
    'mesure.js': '/* fichier statique : ne doit jamais être servi */',
    '.secret': 'NE PAS SERVIR',
  };
  for (const [nom, contenu] of Object.entries(fichiers)) {
    const chemin = path.join(dossier, nom);
    await mkdir(path.dirname(chemin), { recursive: true });
    await writeFile(chemin, contenu);
  }
  return dossier;
}

async function demarrer(env = {}) {
  const dossier = await distFactice();
  const serveur = creerServeur({ dossier, env });
  await new Promise((ok) => serveur.listen(0, '127.0.0.1', ok));
  const { port } = serveur.address();
  return {
    base: `http://127.0.0.1:${port}`,
    port,
    dossier,
    async fermer() {
      serveur.closeAllConnections();
      await new Promise((ok) => serveur.close(ok));
      await rm(dossier, { recursive: true, force: true });
    },
  };
}

/** `fetch` refuse TRACE, réécrit certaines cibles et impose son Host : requête brute. */
function brute(port, methode, cible, enTetes = {}) {
  return new Promise((ok, ko) => {
    const req = request({ host: '127.0.0.1', port, method: methode, path: cible, headers: enTetes }, (res) => {
      let corps = '';
      res.on('data', (morceau) => (corps += morceau));
      res.on('end', () => ok({ statut: res.statusCode, enTetes: res.headers, corps }));
    });
    req.on('error', ko);
    req.end();
  });
}

/** Directives de la CSP, par nom. */
function directives(csp) {
  return new Map(
    csp
      .split(';')
      .map((d) => d.trim().split(/\s+/))
      .filter((morceaux) => morceaux[0])
      .map(([nom, ...valeurs]) => [nom, valeurs]),
  );
}

/**
 * Exécute le chargeur dans un bac à sable : `window`, `document`, `navigator`
 * et `localStorage` réduits à ce qu'il touche. Renvoie la fenêtre et les
 * balises insérées dans <head>.
 */
function executerChargeur(code, { stockage = {}, stockageBloque = false, gpc = false, fenetre = {} } = {}) {
  const inserees = [];
  const window = { ...fenetre };
  Object.defineProperty(window, 'localStorage', {
    get() {
      if (stockageBloque) throw new Error('SecurityError: accès refusé');
      return { getItem: (cle) => (cle in stockage ? stockage[cle] : null) };
    },
  });
  const document = {
    createElement: (balise) => ({
      tagName: balise.toUpperCase(),
      attributs: {},
      setAttribute(nom, valeur) {
        this.attributs[nom] = String(valeur);
      },
    }),
    head: { appendChild: (element) => inserees.push(element) },
  };
  const navigator = gpc ? { globalPrivacyControl: true } : {};
  vm.runInContext(code, vm.createContext({ window, document, navigator, URL }));
  return { window, inserees };
}

/** Simule le chargement du traceur : un `umami.track` qui enregistre ses appels. */
function chargerTraceur(window, balise) {
  const appels = [];
  window.umami = { track: (nom, donnees) => appels.push([nom, donnees]) };
  balise.onload();
  return appels;
}

describe('pages et fichiers', () => {
  let site;
  before(async () => (site = await demarrer()));
  after(() => site.fermer());

  test('la racine est servie telle quelle, revalidée, avec un ETag faible', async () => {
    const res = await fetch(`${site.base}/`);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('content-type'), 'text/html; charset=utf-8');
    assert.equal(res.headers.get('cache-control'), 'no-cache');
    assert.match(res.headers.get('etag'), /^W\/"[0-9a-f]+-[0-9a-f]+"$/);
    assert.equal(await res.text(), page('Accueil'));
  });

  test('le HTML est relu sur le disque : aucun cache en mémoire', async () => {
    const premier = await fetch(`${site.base}/mentions-legales`);
    assert.match(await premier.text(), /Mentions légales/);
    await writeFile(path.join(site.dossier, 'mentions-legales/index.html'), page('Mentions, version deux'));
    const second = await fetch(`${site.base}/mentions-legales`);
    assert.match(await second.text(), /version deux/);
    assert.notEqual(second.headers.get('etag'), premier.headers.get('etag'));
  });

  test('une URL sans slash final sert la page du dossier, à tout niveau', async () => {
    for (const [cible, titre] of [['/mentions-legales', /Mentions/], ['/rubrique/sous-page', /Sous-page/]]) {
      const res = await fetch(`${site.base}${cible}`, { redirect: 'manual' });
      assert.equal(res.status, 200, cible);
      assert.match(await res.text(), titre, cible);
    }
  });

  test('slash final et index.html redirigent en 301 vers l’URL canonique', async () => {
    for (const [cible, destination] of [
      ['/mentions-legales/', '/mentions-legales'],
      ['/mentions-legales/index.html', '/mentions-legales'],
      ['/index.html', '/'],
      ['/mentions-legales/?ref=cv', '/mentions-legales?ref=cv'],
      ['/rubrique/sous-page///', '/rubrique/sous-page'],
    ]) {
      const res = await fetch(`${site.base}${cible}`, { redirect: 'manual' });
      assert.equal(res.status, 301, cible);
      assert.equal(res.headers.get('location'), destination, cible);
    }
  });

  test('une double barre initiale ne produit jamais de redirection ouverte', async () => {
    const res = await brute(site.port, 'GET', '//exemple.org/piege');
    assert.equal(res.statut, 301);
    assert.equal(res.enTetes.location, '/exemple.org/piege');
  });

  test('une URL inconnue sert la page 404 du site, avec le statut 404', async () => {
    const res = await fetch(`${site.base}/page-qui-n-existe-pas`);
    assert.equal(res.status, 404);
    assert.equal(res.headers.get('cache-control'), 'no-cache');
    assert.match(await res.text(), /Introuvable/);
  });

  test('la page 404 demandée par son nom garde le statut 404', async () => {
    for (const cible of ['/404.html', '/404', '/404.HTML']) {
      const res = await fetch(`${site.base}${cible}`, { redirect: 'manual' });
      assert.equal(res.status, 404, cible);
      assert.match(await res.text(), /Introuvable/, cible);
    }
  });

  test('une page n’a qu’une adresse : ni /x.html ni /index', async () => {
    for (const cible of ['/mentions-legales.html', '/index']) {
      const res = await fetch(`${site.base}${cible}`, { redirect: 'manual' });
      assert.equal(res.status, 404, cible);
    }
  });

  test('If-None-Match ne produit jamais de 304 sur une adresse inconnue', async () => {
    const premier = await fetch(`${site.base}/absente`);
    const etag = premier.headers.get('etag');
    const second = await fetch(`${site.base}/absente`, { headers: { 'If-None-Match': etag } });
    assert.equal(second.status, 404);
  });

  test('fichiers cachés et remontées de dossier ne sortent jamais de dist/', async () => {
    for (const cible of ['/.secret', '/%2e%2e/%2e%2e/etc/passwd', '/mentions-legales/../.secret', '/..%2f.secret']) {
      const res = await brute(site.port, 'GET', cible);
      assert.ok([301, 404].includes(res.statut), `${cible} -> ${res.statut}`);
      assert.doesNotMatch(res.corps, /NE PAS SERVIR/, cible);
    }
  });

  test('un encodage ou une cible invalide est refusé en 400', async () => {
    for (const cible of ['/%E0%A4%A', 'pas-une-url']) {
      const res = await brute(site.port, 'GET', cible);
      assert.equal(res.statut, 400, cible);
    }
  });

  test('les méthodes autres que GET et HEAD sont refusées en 405', async () => {
    for (const methode of ['POST', 'PUT', 'DELETE', 'TRACE', 'OPTIONS']) {
      const res = await brute(site.port, methode, '/');
      assert.equal(res.statut, 405, methode);
      assert.equal(res.enTetes.allow, 'GET, HEAD', methode);
    }
  });

  test('HEAD renvoie les en-têtes du GET, sans corps', async () => {
    for (const [cible, statut] of [['/', 200], ['/absente', 404], ['/mesure.js', 200], ['/theme.js', 200]]) {
      const get = await fetch(`${site.base}${cible}`);
      const corpsGet = await get.arrayBuffer();
      const head = await brute(site.port, 'HEAD', cible);
      assert.equal(head.statut, statut, cible);
      assert.equal(head.corps, '', cible);
      assert.equal(Number(head.enTetes['content-length']), corpsGet.byteLength, cible);
    }
  });

  test('If-None-Match renvoie 304 pour une page comme pour un fichier', async () => {
    for (const cible of ['/', '/img/portrait.webp', '/theme.js', '/mesure.js']) {
      const premier = await fetch(`${site.base}${cible}`);
      const etag = premier.headers.get('etag');
      const second = await fetch(`${site.base}${cible}`, { headers: { 'If-None-Match': etag } });
      assert.equal(second.status, 304, cible);
    }
  });

  test('trois régimes de cache selon le fichier, et le bon type pour chacun', async () => {
    const attendus = [
      ['/_astro/app.Ab12Cd34.js', 'public, max-age=31536000, immutable', 'text/javascript; charset=utf-8'],
      ['/_astro/site.Ef56Gh78.css', 'public, max-age=31536000, immutable', 'text/css; charset=utf-8'],
      ['/img/portrait.webp', 'public, max-age=3600', 'image/webp'],
      ['/theme.js', 'public, max-age=3600', 'text/javascript; charset=utf-8'],
      ['/favicon.ico', 'public, max-age=3600', 'image/x-icon'],
      ['/favicon.svg', 'public, max-age=3600', 'image/svg+xml'],
      ['/site.webmanifest', 'no-cache', 'application/manifest+json; charset=utf-8'],
      ['/robots.txt', 'no-cache', 'text/plain; charset=utf-8'],
      ['/sitemap.xml', 'no-cache', 'application/xml; charset=utf-8'],
    ];
    for (const [cible, cache, type] of attendus) {
      const res = await fetch(`${site.base}${cible}`);
      assert.equal(res.status, 200, cible);
      assert.equal(res.headers.get('cache-control'), cache, cible);
      assert.equal(res.headers.get('content-type'), type, cible);
    }
  });
});

describe('redirections historiques', () => {
  let site;
  before(async () => (site = await demarrer()));
  after(() => site.fermer());

  test('chaque ancienne route de la V1 part en 301 vers sa page', async () => {
    for (const [source, destination] of REDIRECTIONS) {
      const res = await fetch(`${site.base}${source}`, { redirect: 'manual' });
      assert.equal(res.status, 301, source);
      assert.equal(res.headers.get('location'), destination, source);
      assert.equal(res.headers.get('cache-control'), 'public, max-age=3600', source);
    }
  });

  test('la table couvre les routes connues de la V1, sans chaîne ni slash final', () => {
    assert.deepEqual(
      [...REDIRECTIONS.keys()].sort(),
      [
        '/linktree',
        '/opening-home',
        '/opening-resume',
        '/politique-confidentialite',
        '/politique-cookies',
        '/projects',
        '/resume',
        '/works',
      ],
    );
    for (const [source, destination] of REDIRECTIONS) {
      assert.match(source, /^\/[^?#]*[^/]$/, source);
      assert.match(destination, /^\/(?:[a-z0-9-]+(?:\/[a-z0-9-]+)*)?$/, destination);
      assert.ok(!REDIRECTIONS.has(destination), `chaîne de redirections : ${source} -> ${destination}`);
    }
  });

  test('une route conservée par la V2 n’est jamais redirigée', async () => {
    assert.ok(!REDIRECTIONS.has('/mentions-legales'));
    const res = await fetch(`${site.base}/mentions-legales`, { redirect: 'manual' });
    assert.equal(res.status, 200);
  });

  test('la casse, un slash final et la requête ne font pas manquer la redirection', async () => {
    for (const [cible, destination] of [
      ['/Projects', '/projets'],
      ['/WORKS/', '/parcours'],
      ['/opening-home?replay', '/?replay'],
      ['/Politique-Cookies', '/mentions-legales'],
      ['/politique-confidentialite/?ref=pied', '/mentions-legales?ref=pied'],
    ]) {
      const res = await fetch(`${site.base}${cible}`, { redirect: 'manual' });
      assert.equal(res.status, 301, cible);
      assert.equal(res.headers.get('location'), destination, cible);
    }
  });
});

describe('en-têtes de sécurité', () => {
  let site;
  before(async () => (site = await demarrer({ ...MESURE, ...CANONIQUE })));
  after(() => site.fermer());

  test('la CSP est exactement celle du contrat', () => {
    assert.equal(
      POLITIQUE_CSP,
      "default-src 'self'; script-src 'self'; connect-src 'self'; img-src 'self' data:; " +
        "style-src 'self' 'unsafe-inline'; font-src 'self'; object-src 'none'; base-uri 'self'; " +
        "form-action 'self'; frame-ancestors 'none'",
    );
  });

  test('la CSP n’autorise aucune origine tierce, ni script en ligne', () => {
    const csp = directives(POLITIQUE_CSP);
    assert.deepEqual(csp.get('script-src'), ["'self'"]);
    assert.deepEqual(csp.get('connect-src'), ["'self'"]);
    assert.deepEqual(csp.get('default-src'), ["'self'"]);
    assert.deepEqual(csp.get('form-action'), ["'self'"]);
    assert.deepEqual(csp.get('frame-ancestors'), ["'none'"]);
    assert.deepEqual(csp.get('object-src'), ["'none'"]);
    assert.ok(!csp.has('frame-src'), 'aucun cadre tiers');
    for (const [nom, valeurs] of csp) {
      assert.deepEqual(
        valeurs.filter((v) => /^(?:https?:|\*)/.test(v)),
        [],
        nom,
      );
    }
    assert.ok(!POLITIQUE_CSP.includes('unsafe-eval'));
  });

  test('chaque réponse porte les mêmes en-têtes, mesure active ou non', async () => {
    const attendus = {
      'content-security-policy': POLITIQUE_CSP,
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'strict-origin-when-cross-origin',
      'cross-origin-opener-policy': 'same-origin',
      'x-frame-options': 'DENY',
      'strict-transport-security': 'max-age=31536000',
    };
    const reponses = [
      await brute(site.port, 'GET', '/'),
      await brute(site.port, 'GET', '/mesure.js'),
      await brute(site.port, 'GET', '/theme.js'),
      await brute(site.port, 'GET', '/mentions-legales/'),
      await brute(site.port, 'GET', '/projects'),
      await brute(site.port, 'GET', '/absente'),
      await brute(site.port, 'POST', '/'),
      await brute(site.port, 'GET', '/', { Host: 'www.exemple.org' }),
    ];
    for (const res of reponses) {
      for (const [nom, valeur] of Object.entries(attendus)) {
        assert.equal(res.enTetes[nom], valeur, `${nom} sur une réponse ${res.statut}`);
      }
      assert.match(res.enTetes['permissions-policy'], /camera=\(\)/);
    }
  });
});

describe('/mesure.js sans mesure d’audience', () => {
  let site;
  before(async () => (site = await demarrer()));
  after(() => site.fermer());

  test('le chargeur se réduit à un commentaire, et prime sur le fichier de dist/', async () => {
    const res = await fetch(`${site.base}/mesure.js`);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('content-type'), 'text/javascript; charset=utf-8');
    assert.equal(res.headers.get('cache-control'), 'public, max-age=3600');
    assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(await res.text(), MESURE_DESACTIVEE);
  });

  test('les pages sont servies sans aucune balise de mesure ajoutée', async () => {
    const corps = await (await fetch(`${site.base}/`)).text();
    assert.doesNotMatch(corps, /data-website-id|u\/script\.js/);
  });

  test('le commentaire s’exécute sans effet', () => {
    const { window, inserees } = executerChargeur(MESURE_DESACTIVEE);
    assert.equal(inserees.length, 0);
    assert.equal(window.clFile, undefined);
    assert.equal(window.clChargeur, undefined);
  });
});

describe('/mesure.js avec mesure d’audience', () => {
  let site;
  let code;
  before(async () => {
    site = await demarrer(MESURE);
    code = await (await fetch(`${site.base}/mesure.js`)).text();
  });
  after(() => site.fermer());

  test('le chargeur est servi en JavaScript, en cache une heure', async () => {
    const res = await fetch(`${site.base}/mesure.js?v=1`);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('content-type'), 'text/javascript; charset=utf-8');
    assert.equal(res.headers.get('cache-control'), 'public, max-age=3600');
    assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
    assert.match(res.headers.get('etag'), /^"[\w-]+"$/);
    assert.equal(await res.text(), code);
  });

  test('il porte l’ID, le domaine et les réglages du plan de marquage', () => {
    assert.ok(code.includes(`'data-website-id', "${UUID}"`));
    assert.ok(code.includes(`'data-domains', "test.exemple.org"`));
    for (const reglage of ['exclude-search', 'exclude-hash', 'do-not-track', 'performance']) {
      assert.ok(code.includes(`'data-${reglage}', 'true'`), reglage);
    }
    assert.ok(code.includes(`'data-before-send', 'clAvantEnvoi'`));
    assert.ok(code.includes("s.src = '/u/script.js'"));
    assert.doesNotMatch(code, /https?:\/\//, 'aucune origine tierce dans le chargeur');
  });

  test('ses noms globaux sont ceux du site : clFile, clChargeur, clAvantEnvoi', () => {
    for (const nom of ['w.clFile', 'w.clChargeur', 'w.clAvantEnvoi']) {
      assert.ok(code.includes(nom), nom);
    }
    assert.doesNotMatch(code, /\blis[A-Z]/, 'aucun nom repris d’un autre site');
  });

  test('l’opposition et le signal GPC figurent dans le code, avant le chargement', () => {
    const opposition = code.indexOf("localStorage.getItem('umami.disabled')");
    const gpc = code.indexOf('navigator.globalPrivacyControl === true');
    const insertion = code.indexOf('appendChild');
    assert.ok(opposition > 0 && gpc > 0 && insertion > 0);
    assert.ok(opposition < insertion && gpc < insertion);
  });

  test('il insère /u/script.js avec ses attributs', () => {
    const { window, inserees } = executerChargeur(code);
    assert.equal(inserees.length, 1);
    const [balise] = inserees;
    assert.equal(balise.tagName, 'SCRIPT');
    assert.equal(balise.src, '/u/script.js');
    assert.deepEqual(balise.attributs, {
      'data-website-id': UUID,
      'data-domains': 'test.exemple.org',
      'data-exclude-search': 'true',
      'data-exclude-hash': 'true',
      'data-do-not-track': 'true',
      'data-performance': 'true',
      'data-before-send': 'clAvantEnvoi',
    });
    assert.equal(typeof window.clAvantEnvoi, 'function');
    assert.equal(window.clChargeur, true);
  });

  test('une opposition enregistrée empêche tout chargement', () => {
    for (const valeur of ['1', 'true', 'oui']) {
      const { window, inserees } = executerChargeur(code, { stockage: { 'umami.disabled': valeur } });
      assert.equal(inserees.length, 0, valeur);
      assert.equal(window.clAvantEnvoi, undefined, valeur);
      // Tableau du bac à sable (autre royaume) : on en vérifie la forme, pas le prototype.
      assert.ok(Array.isArray(window.clFile) && window.clFile.length === 0, 'la file existe, mais rien ne la videra');
    }
  });

  test('le signal Global Privacy Control empêche tout chargement', () => {
    const { inserees } = executerChargeur(code, { gpc: true });
    assert.equal(inserees.length, 0);
  });

  test('un stockage local bloqué ne bloque pas la mesure', () => {
    const { inserees } = executerChargeur(code, { stockageBloque: true });
    assert.equal(inserees.length, 1);
  });

  test('la file est vidée dans umami.track au chargement, puis les envois sont directs', () => {
    const enAttente = [['contact-email', { emplacement: 'en-tete' }], ['erreur-404', { origine: 'directe' }]];
    const { window, inserees } = executerChargeur(code, { fenetre: { clFile: [...enAttente] } });
    const appels = chargerTraceur(window, inserees[0]);
    assert.deepEqual(appels, enAttente);
    window.clFile.push(['lecture', { chapitre: 'preuves' }]);
    assert.deepEqual(appels.at(-1), ['lecture', { chapitre: 'preuves' }]);
  });

  test('une erreur du traceur ne remonte jamais jusqu’au site', () => {
    const { window, inserees } = executerChargeur(code, { fenetre: { clFile: [['a']] } });
    window.umami = {
      track: () => {
        throw new Error('traceur cassé');
      },
    };
    assert.doesNotThrow(() => inserees[0].onload());
    assert.doesNotThrow(() => window.clFile.push(['b']));
  });

  test('clAvantEnvoi annule identify et retire l’identifiant distinct', () => {
    const { window } = executerChargeur(code);
    assert.equal(window.clAvantEnvoi('identify', { id: 'visiteur-42', website: UUID }), null);
    const charge = window.clAvantEnvoi('event', { id: 'visiteur-42', name: 'contact-email', website: UUID });
    assert.ok(!('id' in charge));
    assert.equal(charge.name, 'contact-email');
    assert.equal(window.clAvantEnvoi('event', undefined), undefined);
  });

  test('clAvantEnvoi réduit un référent externe à son origine', () => {
    const { window } = executerChargeur(code);
    const referent = (valeur) => window.clAvantEnvoi('event', { referrer: valeur }).referrer;
    assert.equal(referent('https://www.google.com/search?q=portfolio'), 'https://www.google.com/');
    assert.equal(referent('https://exemple.org:8443/chemin/page#ancre'), 'https://exemple.org:8443/');
    assert.equal(referent('android-app://com.google.android.gm/'), 'android-app://com.google.android.gm/');
    // Interne : le traceur l'a déjà ramené à son chemin, Umami n'en garde pas le domaine.
    assert.equal(referent('/mentions-legales'), '/mentions-legales');
    assert.equal(referent('pas une adresse'), '');
    assert.equal(referent('data:text/plain,x'), '');
    assert.equal(referent(''), '');
  });

  test('une seconde inclusion du chargeur ne double pas la mesure', () => {
    const { window } = executerChargeur(code);
    const inserees = [];
    const document = { createElement: () => ({ setAttribute() {} }), head: { appendChild: (e) => inserees.push(e) } };
    vm.runInContext(code, vm.createContext({ window, document, navigator: {}, URL }));
    assert.equal(inserees.length, 0);
  });

  test('les pages sont servies telles quelles, sans balise injectée', async () => {
    const corps = await (await fetch(`${site.base}/`)).text();
    assert.equal(corps, page('Accueil'));
  });
});

describe('écriture du chargeur', () => {
  test('les valeurs sont échappées : rien ne sort de sa chaîne', () => {
    // Valeurs que la validation refuserait : on vérifie la seconde barrière.
    const piege = { websiteId: `x'); alert(1); ('`, domaine: `"</script><script>alert(2)</script>\n ` };
    const code = chargeurMesure(piege);
    assert.doesNotThrow(() => new vm.Script(code));
    const { inserees } = executerChargeur(code);
    assert.equal(inserees[0].attributs['data-website-id'], piege.websiteId);
    assert.equal(inserees[0].attributs['data-domains'], piege.domaine);
  });
});

describe('configuration de la mesure', () => {
  test('rien de posé : mesure désactivée', () => {
    assert.equal(lireConfigMesure({}), null);
    assert.equal(lireConfigMesure({ UMAMI_WEBSITE_ID: ' ', UMAMI_SITE_DOMAIN: '' }), null);
  });

  test('les valeurs sont ramenées en minuscules', () => {
    const config = lireConfigMesure({ UMAMI_WEBSITE_ID: ` ${UUID.toUpperCase()} `, UMAMI_SITE_DOMAIN: 'Test.Exemple.ORG' });
    assert.deepEqual(config, { websiteId: UUID, domaine: 'test.exemple.org' });
  });

  test('les identifiants des modèles .env.*.example sont acceptés', () => {
    for (const id of ['100ee54a-6c1f-46cc-a67e-8ac78d57d51d', '0450b7ff-eb45-4328-a93e-496cd25b3348']) {
      assert.equal(lireConfigMesure({ UMAMI_WEBSITE_ID: id, UMAMI_SITE_DOMAIN: 'exemple.org' }).websiteId, id);
    }
  });

  test('une configuration incomplète ou invalide empêche le démarrage', () => {
    const cas = [
      { UMAMI_WEBSITE_ID: UUID },
      { UMAMI_SITE_DOMAIN: 'test.exemple.org' },
      { ...MESURE, UMAMI_WEBSITE_ID: 'abc' },
      { ...MESURE, UMAMI_WEBSITE_ID: '3f1c2b9e-8a41-0c5d-9e0f-1a2b3c4d5e6f' }, // version 0
      { ...MESURE, UMAMI_WEBSITE_ID: '3f1c2b9e-8a41-4c5d-ce0f-1a2b3c4d5e6f' }, // variante hors RFC
      { ...MESURE, UMAMI_WEBSITE_ID: `${UUID}0` },
      { ...MESURE, UMAMI_SITE_DOMAIN: 'https://test.exemple.org' },
      { ...MESURE, UMAMI_SITE_DOMAIN: 'test.exemple.org:8443' },
      { ...MESURE, UMAMI_SITE_DOMAIN: 'test.exemple.org/blog' },
      { ...MESURE, UMAMI_SITE_DOMAIN: 'test.exemple.org.' },
      { ...MESURE, UMAMI_SITE_DOMAIN: 'test exemple.org' },
      { ...MESURE, UMAMI_SITE_DOMAIN: 'a.exemple.org,b.exemple.org' },
      { ...MESURE, UMAMI_SITE_DOMAIN: '"><script>' },
      { ...MESURE, UMAMI_SITE_DOMAIN: 'localhost' },
    ];
    for (const env of cas) {
      assert.throws(() => lireConfigMesure(env), JSON.stringify(env));
      assert.throws(() => creerServeur({ dossier: tmpdir(), env }), JSON.stringify(env));
    }
  });
});

describe('hôte canonique', () => {
  let site;
  before(async () => (site = await demarrer({ ...CANONIQUE, REDIRECT_HOSTS: 'www.exemple.org, ancien.exemple.org' })));
  after(() => site.fermer());

  test('un hôte secondaire part en 301 vers l’origine canonique, chemin et requête compris', async () => {
    for (const [hote, cible, destination] of [
      ['www.exemple.org', '/', 'https://exemple.org/'],
      ['www.exemple.org', '/mentions-legales?ref=cv', 'https://exemple.org/mentions-legales?ref=cv'],
      ['WWW.Exemple.ORG:443', '/mentions-legales', 'https://exemple.org/mentions-legales'],
      ['www.exemple.org.', '/mentions-legales', 'https://exemple.org/mentions-legales'],
      ['ancien.exemple.org', '/absente', 'https://exemple.org/absente'],
      ['www.exemple.org', '/mesure.js', 'https://exemple.org/mesure.js'],
      // L'hôte secondaire passe avant les anciennes routes : une seule 301 de plus, pas de boucle.
      ['www.exemple.org', '/projects', 'https://exemple.org/projects'],
      ['www.exemple.org', '//exemple.net/piege', 'https://exemple.org//exemple.net/piege'],
      ['www.exemple.org', '/caf%C3%A9', 'https://exemple.org/caf%C3%A9'],
    ]) {
      const res = await brute(site.port, 'GET', cible, { Host: hote });
      assert.equal(res.statut, 301, `${hote}${cible}`);
      assert.equal(res.enTetes.location, destination, `${hote}${cible}`);
    }
    const head = await brute(site.port, 'HEAD', '/', { Host: 'www.exemple.org' });
    assert.equal(head.statut, 301);
  });

  test('jamais de redirection sur la boucle locale, l’hôte canonique ou un autre hôte', async () => {
    for (const hote of [`127.0.0.1:${site.port}`, `localhost:${site.port}`, 'exemple.org', 'test.exemple.org', '[::1]:4000']) {
      const res = await brute(site.port, 'GET', '/', { Host: hote });
      assert.equal(res.statut, 200, hote);
    }
  });

  test('sans configuration, aucun hôte n’est redirigé', async () => {
    const autre = await demarrer();
    try {
      const res = await brute(autre.port, 'GET', '/', { Host: 'www.exemple.org' });
      assert.equal(res.statut, 200);
    } finally {
      await autre.fermer();
    }
  });

  test('lecture de la configuration', () => {
    assert.equal(lireConfigHoteCanonique({}), null);
    assert.equal(lireConfigHoteCanonique({ REDIRECT_HOSTS: ' ', CANONICAL_ORIGIN: '' }), null);
    const config = lireConfigHoteCanonique({ REDIRECT_HOSTS: 'WWW.exemple.org,ancien.exemple.org  autre.exemple.org', CANONICAL_ORIGIN: 'https://exemple.org/' });
    assert.deepEqual([...config.hotes], ['www.exemple.org', 'ancien.exemple.org', 'autre.exemple.org']);
    assert.equal(config.origine, 'https://exemple.org');
  });

  test('la configuration du modèle .env.prod.example est acceptée', () => {
    const config = lireConfigHoteCanonique({
      REDIRECT_HOSTS: 'www.charles-lindecker.com',
      CANONICAL_ORIGIN: 'https://charles-lindecker.com',
    });
    assert.deepEqual([...config.hotes], ['www.charles-lindecker.com']);
    assert.equal(config.origine, 'https://charles-lindecker.com');
  });

  test('une configuration incomplète ou dangereuse empêche le démarrage', () => {
    const cas = [
      { REDIRECT_HOSTS: 'www.exemple.org' },
      { CANONICAL_ORIGIN: 'https://exemple.org' },
      { ...CANONIQUE, CANONICAL_ORIGIN: 'exemple.org' },
      { ...CANONIQUE, CANONICAL_ORIGIN: 'http://exemple.org' },
      { ...CANONIQUE, CANONICAL_ORIGIN: 'https://exemple.org/accueil' },
      { ...CANONIQUE, CANONICAL_ORIGIN: 'https://exemple.org/?x=1' },
      { ...CANONIQUE, CANONICAL_ORIGIN: 'https://moi:secret@exemple.org' },
      { ...CANONIQUE, REDIRECT_HOSTS: 'www.exemple.org, exemple.org' }, // boucle
      { ...CANONIQUE, REDIRECT_HOSTS: 'localhost' },
      { ...CANONIQUE, REDIRECT_HOSTS: 'app.localhost' },
      { ...CANONIQUE, REDIRECT_HOSTS: '127.0.0.1' },
      { ...CANONIQUE, REDIRECT_HOSTS: '[::1]' },
      { ...CANONIQUE, REDIRECT_HOSTS: 'https://www.exemple.org' },
      { ...CANONIQUE, REDIRECT_HOSTS: 'www.exemple.org:443' },
    ];
    for (const env of cas) {
      assert.throws(() => lireConfigHoteCanonique(env), JSON.stringify(env));
      assert.throws(() => creerServeur({ dossier: tmpdir(), env }), JSON.stringify(env));
    }
  });
});

describe('exécution directe', () => {
  /** Lance `node server/server.mjs` avec un environnement maîtrisé. */
  function lancer(env) {
    const enfant = spawn(process.execPath, [path.join(ICI, 'server.mjs')], {
      env: { PATH: process.env.PATH, HOST: '127.0.0.1', PORT: '0', CONTACT_EMAIL: 'contact@example.test', ...env },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const sortie = { stdout: '', stderr: '' };
    enfant.stdout.on('data', (morceau) => (sortie.stdout += morceau));
    enfant.stderr.on('data', (morceau) => (sortie.stderr += morceau));
    const fin = new Promise((ok) => enfant.on('exit', (code, signal) => ok({ code, signal })));
    return { enfant, sortie, fin };
  }

  test('une configuration invalide arrête le processus avec un message lisible', async () => {
    const { sortie, fin } = lancer({ UMAMI_WEBSITE_ID: UUID });
    const { code } = await fin;
    assert.equal(code, 1);
    assert.match(sortie.stderr, /démarrage refusé : UMAMI_WEBSITE_ID et UMAMI_SITE_DOMAIN se posent ensemble/);
    assert.doesNotMatch(sortie.stderr, /at creerServeur/, 'pas de pile, seulement le message');
  });

  test('une adresse de contact absente refuse le démarrage', async () => {
    const { sortie, fin } = lancer({ CONTACT_EMAIL: '' });
    assert.equal((await fin).code, 1);
    assert.match(sortie.stderr, /CONTACT_EMAIL est obligatoire/);
  });

  test('le serveur annonce sa configuration, sert le chargeur et s’arrête proprement sur SIGTERM', async () => {
    const { enfant, sortie, fin } = lancer({ ...MESURE, ...CANONIQUE });
    const port = await new Promise((ok, ko) => {
      const minuterie = setTimeout(() => ko(new Error(`pas de démarrage : ${sortie.stderr}`)), 10_000);
      enfant.stdout.on('data', () => {
        const trouve = /servi sur http:\/\/127\.0\.0\.1:(\d+)/.exec(sortie.stdout);
        if (trouve) {
          clearTimeout(minuterie);
          ok(Number(trouve[1]));
        }
      });
    });
    assert.match(sortie.stdout, new RegExp(`mesure d'audience active \\(site ${UUID}, domaine test\\.exemple\\.org\\)`));
    assert.match(sortie.stdout, /www\.exemple\.org redirigé vers https:\/\/exemple\.org/);
    const res = await fetch(`http://127.0.0.1:${port}/mesure.js`);
    assert.match(await res.text(), new RegExp(UUID));

    const debut = Date.now();
    enfant.kill('SIGTERM');
    const { code } = await fin;
    assert.equal(code, 0);
    assert.ok(Date.now() - debut < 3_000, 'arrêt sans attendre le délai de grâce');
  });
});
