#!/usr/bin/env node
/**
 * Vérifie, depuis l’extérieur, ce que les moteurs de recherche verront de la
 * bascule : la V2 indexable sur le domaine principal, www renvoyé vers l’apex,
 * chaque adresse de la V1 redirigée en 301 vers son équivalent, et l’archive
 * de la V1 hors index sur son sous-domaine. Lecture seule : rien n’est modifié.
 *
 * Usage :
 *   node scripts/verifier-bascule.mjs                    # après la bascule
 *   node scripts/verifier-bascule.mjs --site https://test.charles-lindecker.com \
 *     --indexable non --www=                             # la V2 en test, avant
 *
 * Options (valeur vide = contrôle sauté) :
 *   --site <origine>     la V2 (défaut : https://charles-lindecker.com)
 *   --www <origine>      l’hôte secondaire (défaut : https://www.charles-lindecker.com)
 *   --archive <origine>  l’archive de la V1 (défaut : https://yharnam.charles-lindecker.com,
 *                        comme ARCHIVE_V1 dans site/src/config/site.ts)
 *   --indexable oui|non  la V2 doit-elle être indexable (défaut : oui)
 *
 * Code de sortie : 0 si tout passe, 1 sinon. Les redirections attendues sont
 * lues dans site/server/redirections.mjs, la même table que le serveur.
 */
import { pathToFileURL } from 'node:url';
import { REDIRECTIONS } from '../site/server/redirections.mjs';

/** Origine canonique de la V2 : celle que toutes ses pages désignent, test compris. */
export const ORIGINE_CANONIQUE = 'https://charles-lindecker.com';
export const ARCHIVE_PAR_DEFAUT = 'https://yharnam.charles-lindecker.com';
const VERIFICATION_GOOGLE = 'google-site-verification';

/**
 * Tous les contrôles, dans l’ordre. `requete(url)` renvoie
 * `{ statut, entetes: Headers, corps }` sans suivre les redirections.
 * Renvoie la liste des résultats `{ ok, libelle, detail }`.
 */
export async function verifier({ site, www, archive, indexable }, requete) {
  const resultats = [];
  const noter = (ok, libelle, detail = '') => resultats.push({ ok, libelle, detail });
  const lire = async (url) => {
    try {
      return await requete(url);
    } catch (erreur) {
      return { statut: 0, entetes: new Headers(), corps: '', erreur: erreur.cause?.code ?? erreur.message };
    }
  };
  const statutAttendu = (reponse, attendu) =>
    reponse.statut === attendu ? '' : reponse.statut === 0 ? `injoignable (${reponse.erreur})` : `statut ${reponse.statut}`;

  if (site) {
    const accueil = await lire(`${site}/`);
    noter(accueil.statut === 200, `${site}/ répond 200`, statutAttendu(accueil, 200));
    const robots = accueil.entetes.get('x-robots-tag') ?? '';
    if (indexable) {
      noter(robots !== '' && !/noindex/i.test(robots), 'la V2 est indexable (X-Robots-Tag sans noindex)', `X-Robots-Tag : « ${robots} »`);
    } else {
      noter(/noindex/i.test(robots), 'la V2 reste hors index (X-Robots-Tag: noindex)', `X-Robots-Tag : « ${robots} »`);
    }
    noter(
      accueil.corps.includes(`<link rel="canonical" href="${ORIGINE_CANONIQUE}/">`),
      `l’accueil désigne ${ORIGINE_CANONIQUE}/ comme adresse canonique`,
    );
    noter(accueil.corps.includes(`name="${VERIFICATION_GOOGLE}"`), 'l’accueil garde la balise de vérification Search Console');
    if (archive) {
      noter(accueil.corps.includes(`href="${archive}"`), `le pied de page renvoie vers l’archive (${archive})`);
    }

    const robotsTxt = await lire(`${site}/robots.txt`);
    noter(
      robotsTxt.statut === 200 && robotsTxt.corps.includes(`Sitemap: ${ORIGINE_CANONIQUE}/sitemap.xml`),
      'robots.txt annonce le sitemap',
      statutAttendu(robotsTxt, 200),
    );
    noter(robotsTxt.statut === 200 && !/^Disallow:\s*\/\s*$/m.test(robotsTxt.corps), 'robots.txt ne bloque pas l’exploration');

    const sitemap = await lire(`${site}/sitemap.xml`);
    noter(
      sitemap.statut === 200 && sitemap.corps.includes(`<loc>${ORIGINE_CANONIQUE}/</loc>`),
      'sitemap.xml liste l’accueil',
      statutAttendu(sitemap, 200),
    );

    for (const [source, destination] of REDIRECTIONS) {
      const reponse = await lire(`${site}${source}`);
      const location = reponse.entetes.get('location') ?? '';
      noter(
        reponse.statut === 301 && location === destination,
        `${source} → 301 ${destination}`,
        reponse.statut === 301 ? `Location : « ${location} »` : statutAttendu(reponse, 301),
      );
    }
    for (const destination of new Set([...REDIRECTIONS.values(), '/mentions-legales'])) {
      const reponse = await lire(`${site}${destination}`);
      noter(reponse.statut === 200, `${destination} répond 200`, statutAttendu(reponse, 200));
    }
    const absente = await lire(`${site}/page-qui-n-existe-pas`);
    noter(absente.statut === 404, 'une adresse inconnue répond 404', statutAttendu(absente, 404));
  }

  if (www) {
    const reponse = await lire(`${www}/projets?depuis=verification`);
    const attendu = `${ORIGINE_CANONIQUE}/projets?depuis=verification`;
    const location = reponse.entetes.get('location') ?? '';
    noter(
      reponse.statut === 301 && location === attendu,
      `${www} → 301 vers ${ORIGINE_CANONIQUE}, chemin et requête conservés`,
      reponse.statut === 301 ? `Location : « ${location} »` : statutAttendu(reponse, 301),
    );
  }

  if (archive) {
    const accueil = await lire(`${archive}/`);
    noter(accueil.statut === 200, `${archive}/ répond 200`, statutAttendu(accueil, 200));
    const robots = accueil.entetes.get('x-robots-tag') ?? '';
    noter(/noindex/i.test(robots), 'l’archive reste hors index (X-Robots-Tag: noindex)', `X-Robots-Tag : « ${robots} »`);
    noter(accueil.corps.includes('class="archive-bandeau"'), 'l’archive montre son bandeau');
    noter(accueil.corps.includes('ng-server-context="ssg'), 'l’archive sert ses pages prérendues');
    const lien = accueil.corps.match(/<link\b[^>]*\brel="canonical"[^>]*>/)?.[0] ?? '';
    const canonique = lien.match(/\bhref="([^"]*)"/)?.[1] ?? '';
    noter(
      canonique.startsWith(archive),
      'les balises canoniques de l’archive désignent l’archive, pas le domaine de la V2',
      `canonical : « ${canonique} »`,
    );
    // Un robots.txt qui bloque l’exploration cacherait l’en-tête noindex aux
    // moteurs : ils garderaient d’anciennes adresses en index, sans contenu.
    const robotsTxt = await lire(`${archive}/robots.txt`);
    noter(
      robotsTxt.statut === 200 && !/^Disallow:\s*\/\s*$/m.test(robotsTxt.corps),
      'le robots.txt de l’archive laisse lire son noindex',
      statutAttendu(robotsTxt, 200),
    );
  }

  return resultats;
}

function lireOptions(argv) {
  const options = { site: ORIGINE_CANONIQUE, www: 'https://www.charles-lindecker.com', archive: ARCHIVE_PAR_DEFAUT, indexable: true };
  for (let i = 0; i < argv.length; i += 1) {
    const [cle, valeurJointe] = argv[i].split(/=(.*)/s);
    const valeur = valeurJointe ?? argv[(i += 1)];
    if (valeur === undefined) throw new Error(`valeur manquante pour ${cle}`);
    if (cle === '--indexable') {
      if (!['oui', 'non'].includes(valeur)) throw new Error('--indexable vaut oui ou non');
      options.indexable = valeur === 'oui';
    } else if (['--site', '--www', '--archive'].includes(cle)) {
      // http seulement pour le serveur local (npm run serve) : en ligne, tout est en https.
      if (valeur !== '' && !/^https?:\/\/[^/]+$/.test(valeur)) throw new Error(`${cle} attend une origine sans chemin : « ${valeur} »`);
      options[cle.slice(2)] = valeur;
    } else {
      throw new Error(`option inconnue : ${cle}`);
    }
  }
  return options;
}

async function requeteHttp(url) {
  const reponse = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(15_000) });
  return { statut: reponse.status, entetes: reponse.headers, corps: await reponse.text() };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  let options;
  try {
    options = lireOptions(process.argv.slice(2));
  } catch (erreur) {
    console.error(`[bascule] ${erreur.message}`);
    process.exit(2);
  }
  const resultats = await verifier(options, requeteHttp);
  for (const { ok, libelle, detail } of resultats) {
    console.log(`${ok ? '✓' : '✗'} ${libelle}${!ok && detail ? ` — ${detail}` : ''}`);
  }
  const echecs = resultats.filter((r) => !r.ok).length;
  console.log(echecs ? `\n${echecs} contrôle(s) en échec sur ${resultats.length}.` : `\n${resultats.length} contrôles passés.`);
  process.exit(echecs ? 1 : 0);
}
