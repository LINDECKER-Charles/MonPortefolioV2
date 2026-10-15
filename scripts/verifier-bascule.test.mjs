/**
 * Le vérificateur de bascule lui-même : il passe sur une bascule réussie, et
 * dénonce chacune des erreurs qui coûteraient du référencement.
 * Lancement : node --test scripts/verifier-bascule.test.mjs
 */
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { REDIRECTIONS } from '../site/server/redirections.mjs';
import { ARCHIVE_PAR_DEFAUT, ORIGINE_CANONIQUE, verifier } from './verifier-bascule.mjs';

const SITE = ORIGINE_CANONIQUE;
const WWW = 'https://www.charles-lindecker.com';
const ARCHIVE = ARCHIVE_PAR_DEFAUT;

const reponse = (statut, entetes = {}, corps = '') => ({ statut, entetes: new Headers(entetes), corps });

/** Une bascule réussie, à laquelle chaque test retire ou casse une chose. */
function bascule({ robotsV2 = 'all', redirections = REDIRECTIONS, robotsArchive = 'noindex, nofollow', canonicalArchive = ARCHIVE } = {}) {
  const pages = new Set(['/', '/mentions-legales', ...REDIRECTIONS.values()]);
  return async (url) => {
    const { origin, pathname, search } = new URL(url);
    if (origin === WWW) return reponse(301, { location: `${SITE}${pathname}${search}` });
    if (origin === ARCHIVE) {
      if (pathname === '/robots.txt') return reponse(200, {}, 'User-agent: *\nAllow: /\n');
      return reponse(200, { 'x-robots-tag': robotsArchive }, `<html ng-server-context="ssg"><head><link rel="canonical" href="${canonicalArchive}"></head><body><aside class="archive-bandeau"></aside></body></html>`);
    }
    if (origin !== SITE) throw new Error(`origine inattendue : ${origin}`);
    if (redirections.has(pathname)) return reponse(301, { location: redirections.get(pathname) });
    if (pathname === '/robots.txt') return reponse(200, {}, `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
    if (pathname === '/sitemap.xml') return reponse(200, {}, `<urlset><url><loc>${SITE}/</loc></url></urlset>`);
    if (pages.has(pathname)) {
      return reponse(200, { 'x-robots-tag': robotsV2 }, `<head><link rel="canonical" href="${SITE}/"><meta name="google-site-verification" content="x"></head><footer><a href="${ARCHIVE}">archive</a></footer>`);
    }
    return reponse(404);
  };
}

const options = { site: SITE, www: WWW, archive: ARCHIVE, indexable: true };
const echecs = (resultats) => resultats.filter((r) => !r.ok).map((r) => r.libelle);

describe('vérificateur de bascule', () => {
  test('une bascule réussie passe tous les contrôles', async () => {
    const resultats = await verifier(options, bascule());
    assert.deepEqual(echecs(resultats), []);
    // Chaque route de la V1 a son contrôle.
    assert.equal(resultats.filter((r) => r.libelle.startsWith('/') && r.libelle.includes('→ 301')).length, REDIRECTIONS.size);
  });

  test('la V2 laissée en noindex sur le domaine principal échoue', async () => {
    assert.deepEqual(echecs(await verifier(options, bascule({ robotsV2: 'noindex' }))), ['la V2 est indexable (X-Robots-Tag sans noindex)']);
  });

  test('en test, la V2 doit au contraire rester hors index', async () => {
    const enTest = { ...options, www: '', indexable: false };
    assert.deepEqual(echecs(await verifier(enTest, bascule({ robotsV2: 'noindex' }))), []);
    assert.deepEqual(echecs(await verifier(enTest, bascule())), ['la V2 reste hors index (X-Robots-Tag: noindex)']);
  });

  test('une route de la V1 qui tombe en 404 est dénoncée', async () => {
    const amputee = new Map([...REDIRECTIONS].filter(([source]) => source !== '/projects'));
    assert.deepEqual(echecs(await verifier(options, bascule({ redirections: amputee }))), ['/projects → 301 /projets']);
  });

  test('une archive indexable, ou qui désigne le domaine de la V2, est dénoncée', async () => {
    assert.deepEqual(echecs(await verifier(options, bascule({ robotsArchive: '' }))), ['l’archive reste hors index (X-Robots-Tag: noindex)']);
    assert.deepEqual(echecs(await verifier(options, bascule({ canonicalArchive: `${SITE}/projects` }))), [
      'les balises canoniques de l’archive désignent l’archive, pas le domaine de la V2',
    ]);
  });

  test('un hôte injoignable compte comme un échec, sans interrompre les autres contrôles', async () => {
    const panne = async (url) => {
      if (new URL(url).origin === ARCHIVE) throw new Error('fetch failed', { cause: { code: 'ENOTFOUND' } });
      return bascule()(url);
    };
    const resultats = await verifier(options, panne);
    assert.ok(echecs(resultats).includes(`${ARCHIVE}/ répond 200`));
    assert.match(resultats.find((r) => r.libelle === `${ARCHIVE}/ répond 200`).detail, /ENOTFOUND/);
    assert.ok(resultats.some((r) => r.ok && r.libelle.startsWith(`${SITE}/ répond 200`)));
  });
});
