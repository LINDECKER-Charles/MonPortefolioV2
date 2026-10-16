#!/usr/bin/env node
/**
 * Signale à IndexNow (Bing, Yandex, Seznam, Naver…) les pages du site
 * modifiées : les moteurs les relisent sans attendre leur prochain passage.
 * Les adresses viennent du sitemap en ligne, articles du blog compris ; seules
 * celles dont la date (`lastmod`) tombe le jour de `--depuis` ou après partent.
 *
 * Usage :
 *   node scripts/indexnow.mjs --depuis 2026-10-16   # modifiées depuis ce jour
 *   node scripts/indexnow.mjs                        # tout le sitemap
 *   node scripts/indexnow.mjs --blog --depuis 2026-10-16   # les seuls articles
 *   node scripts/indexnow.mjs --essai                # liste sans rien envoyer
 *
 * La CI l’appelle après chaque mise en production, pour les pages modifiées
 * depuis le jour de la précédente (ci.yml, job indexnow), et chaque nuit pour
 * les articles publiés ou retouchés la veille, qui ne passent pas par un
 * déploiement (indexnow.yml, avec --blog).
 *
 * La clé n’est pas un secret : IndexNow la vérifie en lisant le fichier
 * public `/<clé>.txt` du site (site/public/), qui ne contient qu’elle.
 *
 * Code de sortie : 0 si rien n’est à signaler ou si l’envoi est accepté,
 * 1 sinon.
 */
import { pathToFileURL } from 'node:url';

export const SITE = 'https://charles-lindecker.com';
export const CLE = '9500ee782e578d1b623112b755bbc8ae';
const API = 'https://api.indexnow.org/indexnow';
/** Ce qu’IndexNow accepte en un envoi. */
const MAX_URLS = 10_000;

/** Les entrées `{ url, lastmod }` d’un sitemap. */
export function lireSitemap(xml) {
  return [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(([, bloc]) => ({
    url: /<loc>([^<]+)<\/loc>/.exec(bloc)?.[1].trim().replace(/&amp;/g, '&') ?? '',
    lastmod: /<lastmod>([^<]+)<\/lastmod>/.exec(bloc)?.[1].trim() ?? '',
  })).filter((entree) => entree.url);
}

/**
 * Les adresses à signaler : toutes sans `depuis`, sinon celles dont la date
 * tombe ce jour-là ou après. Une page datée du jour même d’un déploiement
 * précédent repart : mieux vaut une relecture de trop qu’un oubli.
 */
export function aSignaler(entrees, depuis, { blog = false } = {}) {
  const jour = depuis ? depuis.slice(0, 10) : '';
  return entrees
    .filter((entree) => !blog || entree.url.startsWith(`${SITE}/blog/`))
    .filter((entree) => !jour || entree.lastmod.slice(0, 10) >= jour)
    .map((entree) => entree.url);
}

/** Le corps de l’appel, pour les seules adresses du site. */
export function corps(urls) {
  return {
    host: new URL(SITE).hostname,
    key: CLE,
    keyLocation: `${SITE}/${CLE}.txt`,
    urlList: urls.filter((url) => url === SITE || url.startsWith(`${SITE}/`)).slice(0, MAX_URLS),
  };
}

/** Ce que veut dire la réponse d’IndexNow (documentation du protocole). */
export function lireReponse(statut) {
  const sens = {
    200: 'adresses reçues',
    202: 'adresses reçues, clé en cours de vérification',
    400: 'requête invalide',
    403: 'clé refusée : le fichier de clé est-il en ligne ?',
    422: 'adresses hors du site, ou clé qui ne correspond pas',
    429: 'trop de demandes : réessayer plus tard',
  };
  return { ok: statut === 200 || statut === 202, sens: sens[statut] ?? `réponse inattendue (${statut})` };
}

function lireOptions(args) {
  const options = { depuis: '', essai: false, blog: false };
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === '--essai') options.essai = true;
    else if (args[i] === '--blog') options.blog = true;
    else if (args[i] === '--depuis') {
      options.depuis = args[++i] ?? '';
      if (options.depuis && !/^\d{4}-\d{2}-\d{2}/.test(options.depuis)) throw new Error(`--depuis attend une date AAAA-MM-JJ : « ${options.depuis} »`);
    } else throw new Error(`option inconnue : ${args[i]}`);
  }
  return options;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  let options;
  try {
    options = lireOptions(process.argv.slice(2));
  } catch (erreur) {
    console.error(`[indexnow] ${erreur.message}`);
    process.exit(2);
  }
  const reponseSitemap = await fetch(`${SITE}/sitemap.xml`, { signal: AbortSignal.timeout(15_000) });
  if (!reponseSitemap.ok) {
    console.error(`[indexnow] sitemap illisible (${reponseSitemap.status})`);
    process.exit(1);
  }
  const envoi = corps(aSignaler(lireSitemap(await reponseSitemap.text()), options.depuis, { blog: options.blog }));
  if (!envoi.urlList.length) {
    console.log(`[indexnow] rien à signaler${options.depuis ? ` depuis le ${options.depuis.slice(0, 10)}` : ''}.`);
    process.exit(0);
  }
  console.log(`[indexnow] ${envoi.urlList.length} adresse(s)${options.depuis ? ` modifiée(s) depuis le ${options.depuis.slice(0, 10)}` : ''} :`);
  for (const url of envoi.urlList) console.log(`  ${url}`);
  if (options.essai) process.exit(0);
  const reponse = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(envoi),
    signal: AbortSignal.timeout(30_000),
  });
  const { ok, sens } = lireReponse(reponse.status);
  console.log(`[indexnow] ${reponse.status} : ${sens}`);
  process.exit(ok ? 0 : 1);
}
