import { createHash } from 'node:crypto';
import { isIP } from 'node:net';
import { request as requestHttp } from 'node:http';
import { request as requestHttps } from 'node:https';
import { Readable } from 'node:stream';

/** Marqueur du build : remplacé au démarrage dans toutes les pages HTML. */
export const EMAIL_CONTACT_MARQUEUR = 'contact@portfolio.invalid';
const TAILLE_MAX = 24 * 1024;
const TAILLE_REPONSE_PRIVEE = 4 * 1024 * 1024;
const DELAI_API = 20_000;

export function lireEmailContact(env) {
  const email = String(env.CONTACT_EMAIL ?? '').trim();
  if (!email) return null;
  if (
    email.length > 254 ||
    !/^[a-zA-Z0-9_%+-](?:[a-zA-Z0-9._%+-]{0,62}[a-zA-Z0-9_%+-])?@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}$/.test(email) ||
    email.split('@')[0].includes('..')
  ) {
    throw new Error('CONTACT_EMAIL doit être une adresse e-mail simple et valide.');
  }
  return email;
}

export function remplacerEmailContact(html, email) {
  if (!email) return html;
  // L'adresse est validée et ne contient aucun caractère HTML ou JSON. Le
  // mailto encode séparément les caractères de l'adresse, notamment « + ».
  return html
    .replaceAll(`mailto:${EMAIL_CONTACT_MARQUEUR}`, `mailto:${encodeURIComponent(email)}`)
    .replaceAll(encodeURIComponent(EMAIL_CONTACT_MARQUEUR), encodeURIComponent(email))
    .replaceAll(EMAIL_CONTACT_MARQUEUR, email);
}

export function lireConfigBackend(env) {
  const brute = String(env.BACKEND_URL ?? '').trim();
  if (!brute) return null;
  let url;
  try { url = new URL(brute); } catch { throw new Error('BACKEND_URL doit être une origine HTTP ou HTTPS.'); }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('BACKEND_URL doit être une origine HTTP ou HTTPS sans chemin ni identifiants.');
  }
  const token = String(env.BACKEND_PROXY_TOKEN ?? '').trim();
  if (token && (token.length < 32 || token.length > 256 || !/^[\x21-\x7e]+$/.test(token))) {
    throw new Error('BACKEND_PROXY_TOKEN doit contenir 32 à 256 caractères ASCII sans espace.');
  }
  return { origine: url.origin, token, proxyDeConfiance: env.TRUST_PROXY === '1' };
}

function adressePrivee(ip) {
  const v4 = ip?.replace(/^::ffff:/, '');
  return v4 === '::1' || /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(v4 ?? '') || /^f[cd][0-9a-f]{2}:|^fe[89ab][0-9a-f]:/i.test(v4 ?? '');
}

function adresseClient(req, config) {
  const socket = req.socket.remoteAddress ?? '127.0.0.1';
  if (config.proxyDeConfiance && adressePrivee(socket)) {
    // Caddy est le seul point d'entrée public. L'adresse ajoutée par le relais
    // se trouve à droite ; une valeur injectée par le visiteur est ignorée.
    const transmise = String(req.headers['x-forwarded-for'] ?? '').split(',').at(-1)?.trim();
    if (isIP(transmise ?? '')) return transmise;
  }
  return socket;
}

function repondreJson(req, res, statut, donnees, communs, supplement = {}) {
  const corps = Buffer.from(JSON.stringify(donnees));
  res.writeHead(statut, {
    ...communs,
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Content-Length': corps.length,
    ...supplement,
  });
  res.end(req.method === 'HEAD' ? undefined : corps);
}

async function lireCorps(req, maximum = TAILLE_MAX) {
  return new Promise((ok, ko) => {
    const morceaux = [];
    let taille = 0;
    const finir = (erreur) => {
      clearTimeout(minuterie);
      req.off('data', lire);
      req.off('end', termine);
      req.off('error', echoue);
      if (erreur) { req.resume(); ko(erreur); }
      else ok(Buffer.concat(morceaux));
    };
    const lire = (morceau) => {
      taille += morceau.length;
      if (taille > maximum) finir(new Error('trop-grand'));
      else morceaux.push(morceau);
    };
    const termine = () => finir();
    const echoue = (erreur) => finir(erreur);
    const minuterie = setTimeout(() => finir(new Error('delai')), 10_000);
    req.on('data', lire);
    req.once('end', termine);
    req.once('error', echoue);
  });
}

async function lireReponse(reponse, maximum = TAILLE_MAX) {
  const morceaux = [];
  let taille = 0;
  for await (const morceau of reponse.body ?? []) {
    taille += morceau.length;
    if (taille > maximum) throw new Error('réponse trop grande');
    morceaux.push(morceau);
  }
  return Buffer.concat(morceaux).toString('utf8');
}

/** Adresse persistée : bornée, validée avant toute insertion dans le HTML. */
export async function chargerEmailContact(config) {
  const reponse = await fetch(`${config.origine}/api/config/contact`, {
    signal: AbortSignal.timeout(2000), redirect: 'error', headers: { Accept: 'application/json' },
  });
  if (!reponse.ok) throw new Error('configuration indisponible');
  const donnees = JSON.parse(await lireReponse(reponse));
  const email = lireEmailContact({ CONTACT_EMAIL: donnees.email });
  if (!email) throw new Error('adresse absente');
  return email;
}

/** Le client HTTP natif conserve l’hôte public pour la vérification d’origine Rust. */
function requeteBackend(url, options) {
  return new Promise((resolve, reject) => {
    const request = (url.startsWith('https:') ? requestHttps : requestHttp)(url, {
      method: options.method, headers: options.headers, signal: options.signal,
    }, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400) {
        response.resume();
        reject(new Error('redirection interdite'));
        return;
      }
      const headers = new Headers();
      for (const [name, value] of Object.entries(response.headers)) {
        for (const entry of Array.isArray(value) ? value : value === undefined ? [] : [value]) headers.append(name, entry);
      }
      const empty = [202, 204, 304].includes(response.statusCode);
      if (empty) response.resume();
      resolve(new Response(empty ? null : Readable.toWeb(response), { status: response.statusCode, headers }));
    });
    request.once('error', reject);
    request.end(options.body);
  });
}

/** Routes explicites : aucune URL de destination fournie par un visiteur. */
export async function relayerApi(req, res, chemin, config, communs, recherche = '') {
  const contact = chemin === '/api/contact';
  const sante = chemin === '/api/health';
  const configuration = chemin === '/api/config/contact';
  const mcp = chemin === '/mcp';
  const prive = chemin.startsWith('/api/backoffice/');
  const blog = chemin.startsWith('/api/blog/') || chemin.startsWith('/api/backoffice/blog/');
  // Une image importée, ou l’une de ses variantes (/{largeur}, backend/src/blog_media.rs).
  const media = /^\/api\/(?:backoffice\/)?blog\/media\/[1-9]\d*(?:\/[1-9]\d{0,4})?$/.test(chemin);
  const maximumCorps = blog || mcp ? 8 * 1024 * 1024 : TAILLE_MAX;
  const routes = new Map([
    ['/api/backoffice/login', ['POST']], ['/api/backoffice/logout', ['POST']],
    ['/api/backoffice/2fa/setup', ['POST']], ['/api/backoffice/2fa/verify', ['POST']],
    ['/api/backoffice/session', ['GET', 'HEAD']], ['/api/backoffice/settings', ['GET', 'HEAD', 'PUT']],
    ['/api/backoffice/contacts', ['GET', 'HEAD']], ['/api/backoffice/links', ['GET', 'HEAD', 'POST']],
    ['/api/backoffice/tokens', ['GET', 'HEAD', 'POST']],
    ['/api/backoffice/blog/posts', ['GET', 'HEAD', 'POST']],
    ['/api/backoffice/blog/media', ['GET', 'HEAD', 'POST']],
    ['/api/blog/posts', ['GET', 'HEAD']],
  ]);
  let methodes = contact ? ['POST'] : sante || configuration ? ['GET', 'HEAD'] : mcp ? ['POST'] : routes.get(chemin);
  if (/^\/api\/backoffice\/contacts\/[1-9]\d*$/.test(chemin)) methodes = ['PATCH', 'DELETE'];
  if (/^\/api\/backoffice\/links\/[1-9]\d*$/.test(chemin)) methodes = ['PUT', 'DELETE'];
  if (/^\/api\/backoffice\/tokens\/[1-9]\d*$/.test(chemin)) methodes = ['DELETE'];
  if (/^\/api\/backoffice\/blog\/posts\/[1-9]\d*$/.test(chemin)) methodes = ['GET', 'HEAD', 'PUT', 'DELETE'];
  if (/^\/api\/backoffice\/blog\/posts\/[1-9]\d*\/(?:publish|schedule|unpublish)$/.test(chemin)) methodes = ['POST'];
  if (/^\/api\/backoffice\/blog\/posts\/[1-9]\d*\/(?:preview|seo)$/.test(chemin)) methodes = ['GET', 'HEAD'];
  if (/^\/api\/blog\/posts\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(chemin) || media) methodes = ['GET', 'HEAD'];
  const mutation = !['GET', 'HEAD'].includes(req.method) && (req.method !== 'DELETE' || blog);
  const erreur = (statut, code, message, supplement = {}) => repondreJson(req, res, statut, { code, message }, communs, supplement);
  if (!methodes) {
    erreur(404, 'not_found', 'Cette adresse n’existe pas.');
    return;
  }
  if (!methodes.includes(req.method)) {
    erreur(405, 'method_not_allowed', 'Cette méthode n’est pas disponible.', { Allow: methodes.join(', ') });
    return;
  }
  if (contact || prive || mcp) {
    const origine = req.headers.origin;
    if (origine) {
      let url;
      try { url = new URL(origine); } catch { /* origine invalide */ }
      if (!url || !['http:', 'https:'].includes(url.protocol) || url.host.toLowerCase() !== String(req.headers.host ?? '').toLowerCase()) {
        erreur(403, 'forbidden_origin', 'La requête doit provenir de ce site.');
        return;
      }
    }
    if (prive && !['GET', 'HEAD'].includes(req.method) && req.headers['x-backoffice-request'] !== '1') {
      erreur(403, 'forbidden_request', 'Rechargez le backoffice avant de réessayer.');
      return;
    }
    if (mutation && !/^application\/json(?:\s*;|$)/i.test(String(req.headers['content-type'] ?? ''))) {
      erreur(415, 'unsupported_media_type', 'Le formulaire doit être envoyé au format JSON.');
      return;
    }
    if (Number(req.headers['content-length']) > maximumCorps) {
      erreur(413, 'payload_too_large', 'Le message est trop volumineux.');
      return;
    }
  }
  if (!config) {
    erreur(503, 'service_unavailable', 'L’envoi est momentanément indisponible. Vous pouvez me contacter par e-mail.');
    return;
  }
  let corps;
  try { corps = mutation ? await lireCorps(req, maximumCorps) : undefined; } catch (incident) {
    erreur(incident.message === 'delai' ? 408 : 413, incident.message === 'delai' ? 'request_timeout' : 'payload_too_large', incident.message === 'delai' ? 'L’envoi du formulaire a pris trop de temps.' : 'Le message est trop volumineux.', { Connection: 'close' });
    return;
  }
  const controleur = new AbortController();
  const minuterie = setTimeout(() => controleur.abort(), DELAI_API);
  const annuler = () => { if (!res.writableEnded) controleur.abort(); };
  res.once('close', annuler);
  try {
    const headers = { Accept: mcp ? String(req.headers.accept ?? 'application/json, text/event-stream') : 'application/json', 'X-Contact-Client-IP': adresseClient(req, config) };
    if (mutation) headers['Content-Type'] = 'application/json';
    if (corps) headers['Content-Length'] = String(corps.length);
    if (config.token) headers['X-Contact-Proxy-Token'] = config.token;
    if (prive || mcp) {
      for (const nom of ['host', 'origin', ...(prive ? ['cookie', 'x-backoffice-request'] : ['authorization', 'mcp-protocol-version', 'mcp-method', 'mcp-name'])]) {
        if (typeof req.headers[nom] === 'string') headers[nom] = req.headers[nom];
      }
    }
    const query = chemin === '/api/backoffice/contacts' || chemin.endsWith('/blog/posts') || chemin.endsWith('/blog/media') ? new URLSearchParams(recherche) : null;
    const suffixe = query ? '?' + ['status', 'limit', 'offset'].filter((cle) => query.has(cle)).map((cle) => `${cle}=${encodeURIComponent(query.get(cle))}`).join('&') : '';
    const reponse = await requeteBackend(`${config.origine}${chemin}${suffixe}`, {
      method: req.method === 'HEAD' ? 'GET' : req.method,
      headers,
      body: corps,
      signal: controleur.signal,
      redirect: 'error',
    });
    const supplement = {};
    const retry = reponse.headers.get('retry-after');
    if (retry && /^\d+$/.test(retry)) supplement['Retry-After'] = retry;
    if (prive) {
      const cookies = reponse.headers.getSetCookie();
      if (cookies.length) supplement['Set-Cookie'] = cookies;
    }
    if (mcp && reponse.headers.has('www-authenticate')) supplement['WWW-Authenticate'] = reponse.headers.get('www-authenticate');
    if ([202, 204].includes(reponse.status)) {
      res.writeHead(reponse.status, { ...communs, ...supplement, 'Cache-Control': 'no-store' });
      res.end();
      return;
    }
    if (media && reponse.ok) {
      const type = reponse.headers.get('content-type') ?? '';
      if (!/^image\/(png|jpeg|gif|webp)$/.test(type)) throw new Error('format image invalide');
      const parts = []; let size = 0;
      for await (const part of reponse.body) { size += part.length; if (size > 5 * 1024 * 1024) throw new Error('image trop grande'); parts.push(part); }
      const image = Buffer.concat(parts);
      // Une image publique se revalide (no-cache) : elle redevient introuvable si
      // son article est retiré. L’empreinte de ses octets évite de la renvoyer.
      const etag = prive ? null : `"${createHash('sha256').update(image).digest('base64url')}"`;
      const enTetes = { ...communs, 'Content-Type': type, 'Cache-Control': prive ? 'no-store' : 'no-cache', ...(prive ? { 'X-Robots-Tag': 'noindex, nofollow' } : { ETag: etag }) };
      if (etag && String(req.headers['if-none-match'] ?? '').split(',').some((valeur) => valeur.trim().replace(/^W\//, '') === etag)) {
        res.writeHead(304, enTetes);
        res.end();
        return;
      }
      res.writeHead(200, { ...enTetes, 'Content-Length': image.length });
      res.end(req.method === 'HEAD' ? undefined : image);
      return;
    }
    if (!/^application\/json(?:\s*;|$)/i.test(reponse.headers.get('content-type') ?? '')) {
      throw new Error('réponse invalide');
    }
    const contenu = await lireReponse(reponse, blog || mcp ? 8 * 1024 * 1024 : prive ? TAILLE_REPONSE_PRIVEE : TAILLE_MAX);
    const donnees = JSON.parse(contenu);
    repondreJson(req, res, reponse.status, donnees, communs, supplement);
  } catch {
    if (!res.destroyed) erreur(503, 'service_unavailable', 'L’envoi est momentanément indisponible. Vous pouvez me contacter par e-mail.');
  } finally {
    clearTimeout(minuterie);
    res.off('close', annuler);
  }
}
