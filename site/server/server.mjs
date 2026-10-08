/**
 * Serveur de production du portfolio : sert les fichiers statiques produits par
 * `astro build`, derrière l'edge Caddy mutualisé du VPS.
 *
 * Zéro dépendance, volontairement. L'image d'exécution ne porte ni
 * node_modules ni framework : ce dossier et `dist/`, rien d'autre. Toute la
 * surface exposée tient dans ce fichier, et il se teste sans navigateur
 * (`server/server.test.mjs`).
 *
 * Ce qu'il fait, et pourquoi il existe plutôt qu'un serveur générique :
 *   - des URL sans slash final (`/mentions-legales`), la forme de la V1 que
 *     Google connaît déjà : `/x/` et `/x/index.html` redirigent en 301 vers
 *     `/x`, pour qu'aucune page n'existe sous deux adresses ;
 *   - les 301 des anciennes routes de la V1 (`redirections.mjs`) et celle de
 *     l'hôte secondaire vers l'hôte canonique (`www.` vers l'apex), qui suivent
 *     l'image de test en production sans rien changer à l'edge partagé ;
 *   - la page 404 du site, en statique et avec le vrai statut 404 — y compris
 *     quand on la demande par son nom ;
 *   - trois régimes de cache, selon que le nom du fichier porte ou non
 *     l'empreinte de son contenu ;
 *   - le chargeur de mesure d'audience `/mesure.js`, écrit AU DÉMARRAGE depuis
 *     l'environnement du conteneur. La CI construit une seule image en test
 *     puis la promeut telle quelle en production : une configuration figée au
 *     build enverrait les visites de la production vers le site de test.
 *
 * Le build suppose `build.format: 'directory'` et `trailingSlash: 'never'`
 * (astro.config.mjs) : chaque page est un `x/index.html`, et à la racine, seuls
 * `index.html` (l'accueil) et `404.html` sont des pages.
 */

import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { isIP } from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { trouverRedirection } from './redirections.mjs';

const ICI = path.dirname(fileURLToPath(import.meta.url));

/** Seules méthodes servies : le site est entièrement statique. */
const METHODES = new Set(['GET', 'HEAD']);

const TYPES = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.map', 'application/json; charset=utf-8'],
  ['.xml', 'application/xml; charset=utf-8'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.webmanifest', 'application/manifest+json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.avif', 'image/avif'],
  ['.gif', 'image/gif'],
  ['.ico', 'image/x-icon'],
  ['.woff2', 'font/woff2'],
  ['.woff', 'font/woff'],
  ['.pdf', 'application/pdf'],
]);

/** `/_astro/` ne contient que des fichiers nommés d'après le hachage de leur contenu. */
const PREFIXE_EMPREINTE = '/_astro/';
/** Ce qui pilote le rendu ou les robots : toujours revalidé. */
const A_REVALIDER = new Set(['.html', '.xml', '.txt', '.webmanifest', '.json']);

/** Adresse du chargeur. Elle prime sur `public/mesure.js`, simple no-op pour `astro dev`. */
const CHEMIN_MESURE = '/mesure.js';
export const MESURE_DESACTIVEE = "/* mesure d'audience désactivée */\n";

/**
 * Ce qu'Umami 3.4.0 accepte comme identifiant de site (`z.uuid()` : version 1
 * à 8, variante RFC 9562), la règle même du reconciler d'infra-vps. Un ID qu'il
 * refuserait laisserait le site sans mesure, sans autre signal qu'une alerte.
 */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
/** Nom d'hôte nu : ni schéma, ni port, ni chemin, ni point final. */
const NOM_HOTE = /^(?=.{1,253}$)(?:[a-z0-9_-]{1,63}\.)+[a-z0-9_-]{2,63}$/;

const lire = (env, cle) => String(env[cle] ?? '').trim();

/**
 * Configuration de la mesure d'audience. Les deux variables vont ensemble :
 * absentes toutes les deux, la mesure est désactivée (poste local, CI, et tout
 * environnement sans le calque compose.umami.yaml) ; une seule posée, ou une
 * valeur invalide, c'est un oubli, et le conteneur refuse de démarrer. Le
 * déploiement attend l'état healthy : l'erreur se voit au déploiement plutôt
 * que dans des statistiques vides découvertes trois semaines plus tard.
 */
export function lireConfigMesure(env) {
  const websiteId = lire(env, 'UMAMI_WEBSITE_ID');
  const domaine = lire(env, 'UMAMI_SITE_DOMAIN');
  if (!websiteId && !domaine) return null;
  if (!websiteId || !domaine) {
    throw new Error('UMAMI_WEBSITE_ID et UMAMI_SITE_DOMAIN se posent ensemble (ou pas du tout).');
  }
  // Umami range ses identifiants et ses domaines en minuscules, et le traceur
  // compare `data-domains` à `location.hostname`, toujours en minuscules.
  const config = { websiteId: websiteId.toLowerCase(), domaine: domaine.toLowerCase() };
  if (!UUID.test(config.websiteId)) {
    throw new Error(
      `UMAMI_WEBSITE_ID doit être un UUID accepté par Umami (version 1 à 8, variante RFC) : « ${websiteId} ».`,
    );
  }
  if (!NOM_HOTE.test(config.domaine)) {
    throw new Error(`UMAMI_SITE_DOMAIN doit être un nom d'hôte nu, sans schéma, port ni chemin : « ${domaine} ».`);
  }
  return config;
}

/**
 * Le chargeur servi sous `/mesure.js` quand la mesure est active. Il vit dans
 * un fichier et non dans la page parce que la CSP interdit tout script en
 * ligne ; il est écrit ici, et non au build, parce que l'ID diffère entre test
 * et production pour une même image.
 *
 * Ce qu'il fait, dans l'ordre :
 *   - il crée la file `window.clFile`, la même que celle de la fonction
 *     `mesurer()` du site : les événements y attendent le traceur — et y
 *     restent pour toujours en cas d'opposition ou de blocage ;
 *   - il s'arrête là si le visiteur s'est opposé à la mesure (bouton des
 *     mentions légales, clé `umami.disabled` qu'Umami relit lui-même à chaque
 *     envoi) ou si son navigateur envoie le signal Global Privacy Control : le
 *     traceur n'est alors même pas téléchargé ;
 *   - il définit `clAvantEnvoi`, que le traceur appelle avant chaque envoi
 *     (`data-before-send`). Elle annule `identify`, et retire `id` de toutes
 *     les charges utiles : `umami.identify()` mémorise l'identifiant AVANT
 *     l'envoi que l'on annule, et le traceur l'ajouterait ensuite à chaque
 *     événement. Elle réduit un référent externe à son origine, comme le
 *     demande l'outil d'auto-évaluation de la CNIL (le traceur ramène déjà un
 *     référent interne à son chemin) ;
 *   - il insère `/u/script.js`, servi en même origine par l'edge (snippet
 *     `umami` d'infra-vps), avec les réglages du plan de marquage, puis vide
 *     la file dans `umami.track` une fois le traceur chargé.
 *
 * `JSON.stringify` écrit les deux valeurs : même une valeur qui aurait échappé
 * à la validation ne pourrait pas sortir de sa chaîne.
 */
export function chargeurMesure({ websiteId, domaine }) {
  return `/* Mesure d'audience du portfolio : chargeur écrit au démarrage du serveur. */
(function () {
  var w = window, d = document;
  if (w.clChargeur) return;
  w.clChargeur = true;
  var file = (w.clFile = w.clFile || []);
  try { if (w.localStorage.getItem('umami.disabled')) return; } catch (e) {}
  if (navigator.globalPrivacyControl === true) return;
  w.clAvantEnvoi = function (type, p) {
    if (type === 'identify') return null;
    if (p) {
      delete p.id;
      if (p.referrer && p.referrer.charAt(0) !== '/') {
        try {
          var u = new URL(p.referrer);
          p.referrer = u.host ? u.protocol + '//' + u.host + '/' : '';
        } catch (e) { p.referrer = ''; }
      }
    }
    return p;
  };
  var s = d.createElement('script');
  s.src = '/u/script.js';
  s.setAttribute('data-website-id', ${JSON.stringify(websiteId)});
  s.setAttribute('data-domains', ${JSON.stringify(domaine)});
  s.setAttribute('data-exclude-search', 'true');
  s.setAttribute('data-exclude-hash', 'true');
  s.setAttribute('data-do-not-track', 'true');
  s.setAttribute('data-performance', 'true');
  s.setAttribute('data-before-send', 'clAvantEnvoi');
  s.onload = function () {
    var envoyer = function (e) { try { if (e && w.umami) w.umami.track(e[0], e[1]); } catch (x) {} };
    for (var i = 0; i < file.length; i++) envoyer(file[i]);
    w.clFile = { push: envoyer };
  };
  d.head.appendChild(s);
})();
`;
}

/**
 * Hôte canonique. Une requête arrivée par l'un des REDIRECT_HOSTS (en
 * production : `www.charles-lindecker.com`) est renvoyée en 301 vers
 * CANONICAL_ORIGIN, même chemin, même requête. Fait ici plutôt que par une
 * étiquette de l'edge : un second bloc de site déclaré avec un domaine vide
 * ferait refuser la configuration de TOUS les sites du VPS
 * (docs/deploiement.md), alors qu'une variable vide laisse simplement ce
 * serveur sans redirection.
 *
 * Mêmes règles que la mesure : les deux variables vont ensemble, et une valeur
 * invalide empêche le démarrage. La boucle locale et les adresses IP sont
 * refusées dans la liste : le HEALTHCHECK de l'image interroge 127.0.0.1, et
 * le rediriger rendrait le conteneur « unhealthy ».
 */
export function lireConfigHoteCanonique(env) {
  const liste = lire(env, 'REDIRECT_HOSTS');
  const origineBrute = lire(env, 'CANONICAL_ORIGIN');
  if (!liste && !origineBrute) return null;
  if (!liste || !origineBrute) {
    throw new Error('REDIRECT_HOSTS et CANONICAL_ORIGIN se posent ensemble (ou pas du tout).');
  }

  let origine;
  try {
    origine = new URL(origineBrute);
  } catch {
    throw new Error(`CANONICAL_ORIGIN n'est pas une URL : « ${origineBrute} ».`);
  }
  if (
    origine.protocol !== 'https:' ||
    origine.pathname !== '/' ||
    origine.search ||
    origine.hash ||
    origine.username ||
    origine.password
  ) {
    throw new Error(
      `CANONICAL_ORIGIN doit être une origine https, sans chemin (ex. https://charles-lindecker.com) : « ${origineBrute} ».`,
    );
  }

  const hotes = new Set();
  for (const brut of liste.split(/[\s,]+/).filter(Boolean)) {
    const hote = brut.toLowerCase();
    if (hote === 'localhost' || hote.endsWith('.localhost') || isIP(hote.replace(/^\[|\]$/g, ''))) {
      throw new Error(`REDIRECT_HOSTS ne doit contenir ni la boucle locale ni une adresse IP : « ${brut} ».`);
    }
    if (!NOM_HOTE.test(hote)) {
      throw new Error(`REDIRECT_HOSTS contient une valeur qui n'est pas un nom d'hôte nu : « ${brut} ».`);
    }
    hotes.add(hote);
  }
  if (hotes.has(origine.hostname)) {
    throw new Error(`L'hôte de CANONICAL_ORIGIN figure dans REDIRECT_HOSTS : il se redirigerait vers lui-même (${origine.hostname}).`);
  }
  return { hotes, origine: origine.origin };
}

/** En-tête Host -> nom d'hôte comparable : minuscules, sans port ni point final. */
function nomHoteDemande(entete) {
  return (entete ?? '').trim().toLowerCase().replace(/:\d*$/, '').replace(/\.$/, '');
}

/**
 * Politique de sécurité du contenu, la même dans tous les environnements.
 *
 * Aucune origine tierce, dans aucune directive : ni cadre, ni police, ni image
 * distante. Le site ne doit émettre aucun script en ligne, et `script-src` se
 * passe donc de 'unsafe-inline' : le script de thème, qui doit s'exécuter avant
 * le premier rendu, est un fichier (`/theme.js`, copié de public/), pas un bloc
 * dans la page. Le JSON-LD n'est pas concerné, ce n'est pas du code exécuté.
 * `style-src` admet 'unsafe-inline' pour les petites feuilles qu'Astro inscrit
 * dans la page.
 *
 * Le chargeur `/mesure.js`, le traceur `/u/script.js` et sa collecte
 * `/u/api/send` sont tous en même origine (l'edge relaie `/u/` vers Umami) :
 * `'self'` suffit, sans aucun nom de domaine propre à un environnement.
 *
 * `form-action 'self'` : le site n'a pas de formulaire. Le contact passe par un
 * lien `mailto:`, une navigation que `form-action` ne régit pas.
 */
export const POLITIQUE_CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "connect-src 'self'",
  "img-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

const EN_TETES_COMMUNS = Object.freeze({
  'Content-Security-Policy': POLITIQUE_CSP,
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
  // Doublon de `frame-ancestors` pour les navigateurs qui ignorent la CSP.
  'X-Frame-Options': 'DENY',
  'Strict-Transport-Security': 'max-age=31536000',
});

function regimeDeCache(cheminUrl, extension) {
  if (cheminUrl.startsWith(PREFIXE_EMPREINTE)) return 'public, max-age=31536000, immutable';
  if (A_REVALIDER.has(extension)) return 'no-cache';
  // Images, icônes, `theme.js` : fichiers de public/, à nom stable et contenu
  // remplaçable. Une heure : un fichier remplacé se voit dans l'heure.
  return 'public, max-age=3600';
}

/** Comparaison faible d'If-None-Match (RFC 9110 §13.1.2), liste et `*` compris. */
function correspondEtag(entete, etag) {
  if (!entete) return false;
  if (entete.trim() === '*') return true;
  const sansFaible = (valeur) => valeur.trim().replace(/^W\//, '');
  return entete.split(',').some((candidat) => sansFaible(candidat) === sansFaible(etag));
}

async function estFichier(chemin) {
  try {
    return (await stat(chemin)).isFile();
  } catch {
    return false;
  }
}

/**
 * Construit le serveur, sans l'ouvrir : les tests l'écoutent sur un port
 * éphémère, l'exécution directe sur PORT. Lève une erreur si l'environnement
 * est incohérent : mieux vaut un conteneur qui ne démarre pas qu'un site qui
 * mesure de travers.
 */
export function creerServeur({ dossier, env = process.env } = {}) {
  const racine = path.resolve(dossier ?? path.join(ICI, '..', 'dist'));
  const page404 = path.join(racine, '404.html');
  const mesure = lireConfigMesure(env);
  const hoteCanonique = lireConfigHoteCanonique(env);

  // Le chargeur ne dépend que de l'environnement, fixé pour la vie du
  // processus : il est écrit une fois, avec son empreinte.
  const corpsMesure = Buffer.from(mesure ? chargeurMesure(mesure) : MESURE_DESACTIVEE, 'utf8');
  const etagMesure = `"${createHash('sha1').update(corpsMesure).digest('base64url')}"`;

  function repondreTexte(res, statut, texte, enTetes = {}) {
    res.writeHead(statut, { ...EN_TETES_COMMUNS, 'Content-Type': 'text/plain; charset=utf-8', ...enTetes });
    res.end(texte);
  }

  function rediriger(res, destination) {
    res.writeHead(301, { ...EN_TETES_COMMUNS, Location: destination, 'Cache-Control': 'public, max-age=3600' });
    res.end();
  }

  /** Chemin d'URL décodé et normalisé -> fichier de dist/, ou null. */
  async function resoudre(cheminUrl) {
    const relatif = cheminUrl === '/' ? '/index.html' : path.posix.extname(cheminUrl) ? cheminUrl : `${cheminUrl}/index.html`;
    const chemin = path.join(racine, relatif);
    if (!chemin.startsWith(racine + path.sep)) return null;
    return (await estFichier(chemin)) ? chemin : null;
  }

  function envoyerMesure(req, res) {
    const enTetes = {
      ...EN_TETES_COMMUNS,
      'Content-Type': 'text/javascript; charset=utf-8',
      // L'ID ne change qu'au redéploiement, et chaque environnement a son
      // propre nom d'hôte, donc sa propre entrée dans le cache du navigateur.
      'Cache-Control': 'public, max-age=3600',
      ETag: etagMesure,
    };
    if (correspondEtag(req.headers['if-none-match'], etagMesure)) {
      res.writeHead(304, enTetes);
      res.end();
      return;
    }
    enTetes['Content-Length'] = corpsMesure.length;
    res.writeHead(200, enTetes);
    res.end(req.method === 'HEAD' ? undefined : corpsMesure);
  }

  /**
   * Envoie un fichier de dist/ tel quel, HTML compris : rien n'est réécrit, et
   * l'ETag faible vient de la taille et de la date du fichier, comme pour tout
   * le reste. Le contenu de l'image est immuable : rien à invalider.
   */
  async function envoyer(req, res, chemin, statut, cheminUrl) {
    const extension = path.extname(chemin).toLowerCase();
    const infos = await stat(chemin);
    const etag = `W/"${infos.size.toString(16)}-${Math.trunc(infos.mtimeMs).toString(16)}"`;
    const enTetes = {
      ...EN_TETES_COMMUNS,
      'Content-Type': TYPES.get(extension) ?? 'application/octet-stream',
      'Cache-Control': statut === 200 ? regimeDeCache(cheminUrl, extension) : 'no-cache',
      ETag: etag,
    };
    // Un 304 affirme que la ressource existe : jamais en réponse à une adresse inconnue.
    if (statut === 200 && correspondEtag(req.headers['if-none-match'], etag)) {
      res.writeHead(304, enTetes);
      res.end();
      return;
    }
    enTetes['Content-Length'] = infos.size;
    res.writeHead(statut, enTetes);
    if (req.method === 'HEAD') {
      res.end();
      return;
    }
    const flux = createReadStream(chemin);
    flux.on('error', () => res.destroy());
    flux.pipe(res);
  }

  /** La page 404 du site, en statique : une adresse inconnue coûte le prix d'un fichier. */
  async function introuvable(req, res) {
    if (await estFichier(page404)) {
      await envoyer(req, res, page404, 404, '/404');
      return;
    }
    repondreTexte(res, 404, req.method === 'HEAD' ? undefined : 'Page introuvable.\n');
  }

  async function traiter(req, res) {
    if (!METHODES.has(req.method)) {
      // Une méthode inattendue (TRACE, POST...) n'a rien à faire ici : 405
      // immédiat, sans toucher au disque.
      res.writeHead(405, { ...EN_TETES_COMMUNS, Allow: 'GET, HEAD' });
      res.end();
      return;
    }

    // Cible d'origine (`/chemin?requête`) ; une forme absolue est ramenée à son chemin.
    const brut = req.url ?? '/';
    let cible;
    try {
      cible = brut.startsWith('/') ? new URL(`http://site${brut}`) : new URL(brut);
    } catch {
      repondreTexte(res, 400, 'Requête invalide.\n');
      return;
    }
    const requete = cible.search;

    // Avant tout le reste : sur l'hôte secondaire, même une adresse inconnue
    // part vers l'hôte canonique, qui en jugera. `pathname` et `search` sont
    // déjà en ASCII encodé, et l'origine est fixée : pas de redirection ouverte.
    if (hoteCanonique?.hotes.has(nomHoteDemande(req.headers.host))) {
      rediriger(res, `${hoteCanonique.origine}${cible.pathname}${requete}`);
      return;
    }

    let chemin;
    try {
      chemin = decodeURIComponent(cible.pathname);
    } catch {
      repondreTexte(res, 400, 'Requête invalide.\n');
      return;
    }
    if (chemin.includes('\0')) {
      repondreTexte(res, 400, 'Requête invalide.\n');
      return;
    }

    // Barres obliques multiples : `//exemple.com` dans un en-tête Location
    // serait une URL relative au protocole, donc une redirection ouverte.
    const nettoye = chemin.replace(/\/{2,}/g, '/');
    const normalise = path.posix.normalize(nettoye);
    if (normalise.startsWith('/..') || normalise.split('/').some((s) => s.startsWith('.') && s !== '.well-known')) {
      await introuvable(req, res);
      return;
    }

    const destination = trouverRedirection(normalise.replace(/\/+$/, '') || '/');
    if (destination) {
      rediriger(res, `${destination}${requete}`);
      return;
    }
    // Les destinations sont construites depuis le chemin DÉCODÉ : elles sont
    // ré-encodées, un en-tête Location ne transporte que de l'ASCII.
    if (normalise === '/index.html' || normalise.endsWith('/index.html')) {
      rediriger(res, `${encodeURI(normalise.slice(0, -'/index.html'.length) || '/')}${requete}`);
      return;
    }
    if (normalise.length > 1 && normalise.endsWith('/')) {
      rediriger(res, `${encodeURI(normalise.replace(/\/+$/, ''))}${requete}`);
      return;
    }
    if (normalise !== chemin) {
      rediriger(res, `${encodeURI(normalise)}${requete}`);
      return;
    }

    if (normalise === CHEMIN_MESURE) {
      envoyerMesure(req, res);
      return;
    }

    const fichier = await resoudre(normalise);
    // `/404.html` demandé par son nom reste une page d'erreur : servie en 200,
    // elle deviendrait une page indexable de plus, au contenu d'erreur. La
    // casse est ignorée pour les systèmes de fichiers qui l'ignorent (macOS).
    if (!fichier || fichier.toLowerCase() === page404.toLowerCase()) {
      await introuvable(req, res);
      return;
    }
    await envoyer(req, res, fichier, 200, normalise);
  }

  const serveur = createServer((req, res) => {
    traiter(req, res).catch((erreur) => {
      console.error('[serveur] erreur inattendue :', erreur);
      if (!res.headersSent) {
        repondreTexte(res, 500, 'Erreur interne.\n');
      } else {
        res.destroy();
      }
    });
  });

  // L'edge garde ses connexions vers le conteneur ouvertes jusqu'à 2 min. Un
  // délai de maintien plus court côté Node ferme des connexions que Caddy croit
  // encore utilisables : la requête suivante part sur une socket morte.
  serveur.keepAliveTimeout = 125_000;
  serveur.headersTimeout = 126_000;

  serveur.mesure = mesure;
  serveur.hoteCanonique = hoteCanonique;
  serveur.racine = racine;
  return serveur;
}

/** Exécution directe : `node server/server.mjs`. */
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT ?? 4000);
  const hote = process.env.HOST ?? '0.0.0.0';

  let serveur;
  try {
    serveur = creerServeur();
  } catch (erreur) {
    // Message seul, sans pile : c'est lui que le déploiement affiche quand le
    // conteneur ne devient jamais healthy.
    console.error(`[serveur] démarrage refusé : ${erreur.message}`);
    process.exit(1);
  }

  serveur.listen(port, hote, () => {
    const { port: ecoute } = serveur.address();
    const mesure = serveur.mesure
      ? `mesure d'audience active (site ${serveur.mesure.websiteId}, domaine ${serveur.mesure.domaine})`
      : "mesure d'audience désactivée";
    const canonique = serveur.hoteCanonique
      ? `${[...serveur.hoteCanonique.hotes].join(', ')} redirigé vers ${serveur.hoteCanonique.origine}`
      : "pas d'hôte secondaire";
    console.log(`[serveur] ${serveur.racine} servi sur http://${hote}:${ecoute} — ${mesure} — ${canonique}`);
  });

  // SIGTERM du déploiement : on cesse d'accepter, on laisse finir les requêtes
  // en vol, et on sort au plus tard après 5 s plutôt que d'attendre le SIGKILL.
  const arreter = () => {
    serveur.close(() => process.exit(0));
    serveur.closeIdleConnections();
    setTimeout(() => process.exit(0), 5_000).unref();
  };
  process.on('SIGTERM', arreter);
  process.on('SIGINT', arreter);
}
