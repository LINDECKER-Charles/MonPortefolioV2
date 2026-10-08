import { isIP } from 'node:net';

/** Marqueur du build : remplacé au démarrage dans toutes les pages HTML. */
export const EMAIL_CONTACT_MARQUEUR = 'contact@portfolio.invalid';
const TAILLE_MAX = 24 * 1024;
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

async function lireCorps(req) {
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
      if (taille > TAILLE_MAX) finir(new Error('trop-grand'));
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

async function lireReponse(reponse) {
  const morceaux = [];
  let taille = 0;
  for await (const morceau of reponse.body ?? []) {
    taille += morceau.length;
    if (taille > TAILLE_MAX) throw new Error('réponse trop grande');
    morceaux.push(morceau);
  }
  return Buffer.concat(morceaux).toString('utf8');
}

/** Relais borné : deux routes exactes, aucune URL fournie par un visiteur. */
export async function relayerApi(req, res, chemin, config, communs) {
  const contact = chemin === '/api/contact';
  const sante = chemin === '/api/health';
  const erreur = (statut, code, message, supplement = {}) => repondreJson(req, res, statut, { code, message }, communs, supplement);
  if (!contact && !sante) {
    erreur(404, 'not_found', 'Cette adresse n’existe pas.');
    return;
  }
  if (contact ? req.method !== 'POST' : !['GET', 'HEAD'].includes(req.method)) {
    erreur(405, 'method_not_allowed', 'Cette méthode n’est pas disponible.', { Allow: contact ? 'POST' : 'GET, HEAD' });
    return;
  }
  if (contact) {
    const origine = req.headers.origin;
    if (origine) {
      let url;
      try { url = new URL(origine); } catch { /* origine invalide */ }
      if (!url || !['http:', 'https:'].includes(url.protocol) || url.host.toLowerCase() !== String(req.headers.host ?? '').toLowerCase()) {
        erreur(403, 'forbidden_origin', 'Le formulaire doit être envoyé depuis ce site.');
        return;
      }
    }
    if (!/^application\/json(?:\s*;|$)/i.test(String(req.headers['content-type'] ?? ''))) {
      erreur(415, 'unsupported_media_type', 'Le formulaire doit être envoyé au format JSON.');
      return;
    }
    if (Number(req.headers['content-length']) > TAILLE_MAX) {
      erreur(413, 'payload_too_large', 'Le message est trop volumineux.');
      return;
    }
  }
  if (!config) {
    erreur(503, 'service_unavailable', 'L’envoi est momentanément indisponible. Vous pouvez me contacter par e-mail.');
    return;
  }
  let corps;
  try { corps = contact ? await lireCorps(req) : undefined; } catch (incident) {
    erreur(incident.message === 'delai' ? 408 : 413, incident.message === 'delai' ? 'request_timeout' : 'payload_too_large', incident.message === 'delai' ? 'L’envoi du formulaire a pris trop de temps.' : 'Le message est trop volumineux.', { Connection: 'close' });
    return;
  }
  const controleur = new AbortController();
  const minuterie = setTimeout(() => controleur.abort(), DELAI_API);
  const annuler = () => { if (!res.writableEnded) controleur.abort(); };
  res.once('close', annuler);
  try {
    const headers = { Accept: 'application/json', 'X-Contact-Client-IP': adresseClient(req, config) };
    if (contact) headers['Content-Type'] = 'application/json';
    if (config.token) headers['X-Contact-Proxy-Token'] = config.token;
    const reponse = await fetch(`${config.origine}${chemin}`, {
      method: req.method === 'HEAD' ? 'GET' : req.method,
      headers,
      body: corps,
      signal: controleur.signal,
      redirect: 'error',
    });
    if (!/^application\/json(?:\s*;|$)/i.test(reponse.headers.get('content-type') ?? '')) {
      throw new Error('réponse invalide');
    }
    const contenu = await lireReponse(reponse);
    const donnees = JSON.parse(contenu);
    const retry = reponse.headers.get('retry-after');
    repondreJson(req, res, reponse.status, donnees, communs, retry && /^\d+$/.test(retry) ? { 'Retry-After': retry } : {});
  } catch {
    if (!res.destroyed) erreur(503, 'service_unavailable', 'L’envoi est momentanément indisponible. Vous pouvez me contacter par e-mail.');
  } finally {
    clearTimeout(minuterie);
    res.off('close', annuler);
  }
}
