/**
 * Contrat entre le HTML construit par Astro et le rendu du blog par Node.
 *
 * server/blog.mjs ne rend rien de zéro : il réécrit `dist/blog/index.html` et
 * `dist/blog-modele/index.html` avec des expressions régulières (emplacement
 * #blog-article-slot, bloc #blog-publications, métas `name=` / `property=`
 * avant `content=`, </head>, <noscript>, JSON-LD). Les tests de blog.test.mjs
 * s'exercent sur des gabarits écrits à la main : si Base.astro, blog.astro ou
 * blog-modele.astro changent de forme, ils restent verts pendant que le blog
 * public part vide ou sans SEO. Ici, les vrais fichiers construits passent
 * dans les vraies fonctions.
 *
 * Si ce test casse après une refonte de Base.astro, de blog.astro ou de
 * blog-modele.astro, c’est le gabarit qu’il faut corriger, pas le test.
 */
import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { assurerDist } from '../tools/assurer-dist.mjs';
import { renderArticle, renderIndex } from './blog.mjs';
import { creerServeur } from './server.mjs';

const ORIGINE = 'https://charles-lindecker.com';
const article = {
  id: 7,
  title: 'Un article factice pour le test',
  slug: 'article-factice-test',
  excerpt: 'Le résumé de l’article factice.',
  content: {
    type: 'doc',
    content: [
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Une section' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'Le corps de l’article factice.' }] },
    ],
  },
  cover_image: '',
  cover_alt: '',
  tags: ['Test'],
  seo_title: 'Titre SEO de l’article factice',
  seo_description: 'La description SEO de l’article factice, lue par les moteurs de recherche.',
  canonical_url: '',
  og_image: '',
  noindex: false,
  published_at: 1791468000,
  updated_at: '2026-10-08T12:00:00Z',
};

let dist; let gabaritArticle; let gabaritListe;
const compter = (html, motif) => (html.match(motif) ?? []).length;

before(async () => {
  dist = await assurerDist();
  gabaritArticle = await readFile(path.join(dist, 'blog-modele/index.html'), 'utf8');
  gabaritListe = await readFile(path.join(dist, 'blog/index.html'), 'utf8');
});

test('le gabarit construit offre les points d’accroche que le rendu Node attend', () => {
  assert.equal(compter(gabaritArticle, /<div id="blog-article-slot"[^>]*><\/div>/g), 1, 'un seul emplacement #blog-article-slot, vide');
  assert.equal(compter(gabaritArticle, /<\/head>/g), 1, 'un seul </head>');
  assert.match(gabaritArticle, /<noscript>/, 'le gabarit porte son <noscript>, que le rendu doit retirer');
  assert.match(gabaritArticle, /<meta\s+name="robots" content="noindex/, 'le gabarit est hors index');
  assert.doesNotMatch(gabaritArticle, /rel="canonical"/, 'pas de canonical sur le gabarit');
  assert.match(gabaritArticle, /<script defer src="\/mesure\.js"><\/script>/, 'le chargeur de mesure reste chargé sur les articles publics');
  assert.match(gabaritListe, /<div id="blog-publications"[^>]*>[\s\S]*?<\/section>\s*<\/div>/, 'le bloc des publications se termine par </section></div>');
  assert.equal(compter(gabaritListe, /id="blog-publications"/g), 1);
});

test('les métas du gabarit sont écrites dans l’ordre que les expressions du rendu retirent', () => {
  // renderArticle ne retire que `<meta name="…"` et `<meta property="…"` : un
  // `content=` placé avant laisserait deux descriptions, deux og:title, etc.
  for (const meta of gabaritArticle.match(/<meta\b[^>]*>/g) ?? []) {
    if (/\b(?:name|property)="(?:description|robots|twitter:[^"]*|og:[^"]*|article:[^"]*)"/.test(meta)) {
      assert.match(meta, /^<meta\s+(?:name|property)="/, `attribut name/property en premier : ${meta}`);
    }
  }
});

test('un article injecté dans le vrai gabarit porte un seul titre, canonical, JSON-LD et plus de <noscript>', () => {
  const html = renderArticle(gabaritArticle, article);

  assert.equal(compter(html, /<title>/g), 1, 'un seul <title>');
  assert.match(html, /<title>Titre SEO de l’article factice — Charles Lindecker<\/title>/);
  assert.doesNotMatch(html, /Aperçu d’un article \|/, 'le titre du gabarit a disparu');

  assert.equal(compter(html, /<link rel="canonical"/g), 1, 'un seul canonical');
  assert.match(html, new RegExp(`<link rel="canonical" href="${ORIGINE}/blog/article-factice-test">`));

  const blocs = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  assert.equal(blocs.length, 1, 'un seul bloc JSON-LD');
  const ld = JSON.parse(blocs[0][1])['@graph'][0];
  assert.equal(ld['@type'], 'BlogPosting');
  assert.equal(ld.headline, article.title);
  assert.equal(ld.url, `${ORIGINE}/blog/article-factice-test`);
  assert.equal(ld.author.name, 'Charles Lindecker');

  assert.equal(compter(html, /<noscript/g), 0, 'plus aucun <noscript> du gabarit');
  assert.match(html, /Le corps de l’article factice\./, 'le corps de l’article est dans la page');
  assert.doesNotMatch(html, /Ouvrez l’aperçu depuis le backoffice/);

  for (const cle of ['description', 'robots', 'twitter:card']) {
    assert.equal(compter(html, new RegExp(`<meta name="${cle}"`, 'g')), 1, `un seul ${cle}`);
  }
  for (const cle of ['og:title', 'og:description', 'og:image', 'og:type', 'og:url']) {
    assert.equal(compter(html, new RegExp(`<meta property="${cle}"`, 'g')), 1, `un seul ${cle}`);
  }
  assert.match(html, /<meta name="robots" content="index, follow/);
  assert.match(html, /<meta property="og:type" content="article">/);
});

test('l’article remplace l’emplacement et garde la mise en page, les styles du blog et la mesure', () => {
  const html = renderArticle(gabaritArticle, article);
  assert.doesNotMatch(html, /id="blog-article-slot"/, 'l’emplacement est consommé');
  assert.equal(compter(html, /<h1[ >]/g), 1, 'un seul h1 : celui de l’article');
  assert.match(html, /<h1>Un article factice pour le test<\/h1>/);
  assert.match(html, /<article class="wrap blog-article">/);
  assert.match(html, /Le corps de l’article factice\./);
  for (const classe of ['.blog-article', '.blog-prose']) {
    assert.ok(html.includes(classe), `la feuille du blog inlinée porte ${classe}`);
  }
  assert.match(html, /<script defer src="\/mesure\.js"><\/script>/);
  assert.match(html, /<header class="entete"/, 'l’en-tête du site entoure l’article');
  assert.match(html, /<main[^>]*id="contenu"/, 'le contenu garde son ancre d’évitement');
});

test('l’aperçu privé reste hors index, sans canonical, JSON-LD ni mesure', () => {
  const html = renderArticle(gabaritArticle, article, { preview: true });
  assert.match(html, /noindex, nofollow/);
  assert.doesNotMatch(html, /rel="canonical"|application\/ld\+json|mesure\.js|<noscript/);
  assert.match(html, /blog-preview-notice/);
});

test('la liste injecte les articles dans le vrai bloc #blog-publications et retire l’état vide', () => {
  const html = renderIndex(gabaritListe, { posts: [article], total: 1 }, 1);
  assert.match(html, /<div id="blog-publications"><section class="blog-list" aria-label="Articles publiés">/);
  assert.match(html, /<a href="\/blog\/article-factice-test">Un article factice pour le test<\/a>/);
  assert.doesNotMatch(html, /Le premier article reste à écrire/, 'le bloc « premier article » est remplacé');
  assert.equal(compter(html, /id="blog-publications"/g), 1);
  assert.equal(compter(html, /<h1[ >]/g), 1);
  assert.equal(compter(html, /<title>/g), 1);
  assert.equal(compter(html, /<link rel="canonical"/g), 1);
  assert.equal(compter(html, /application\/ld\+json/g), 1);
});

test('la liste vide garde le gabarit tel que construit', () => {
  assert.equal(renderIndex(gabaritListe, { posts: [], total: 0 }, 1), gabaritListe);
});

test('la page 2 de la liste réécrit le canonical vers ?page=2', () => {
  const html = renderIndex(gabaritListe, { posts: [article], total: 21 }, 2);
  assert.match(html, new RegExp(`<link rel="canonical" href="${ORIGINE}/blog\\?page=2"`));
  assert.match(html, /rel="prev" href="\/blog"/);
});

let backend; let serveur; let base;
before(async () => {
  backend = createServer((req, res) => {
    res.setHeader('Content-Type', 'application/json');
    if (req.url?.startsWith('/api/blog/posts?')) { res.end(JSON.stringify({ posts: [article], total: 1 })); return; }
    if (req.url === '/api/blog/posts/article-factice-test') { res.end(JSON.stringify(article)); return; }
    if (req.url === '/api/config/contact') { res.end('{"email":"owner@example.org"}'); return; }
    res.writeHead(404); res.end('{}');
  });
  await new Promise((resolve) => backend.listen(0, '127.0.0.1', resolve));
  serveur = creerServeur({ dossier: dist, env: { BACKEND_URL: `http://127.0.0.1:${backend.address().port}`, CONTACT_EMAIL: 'owner@example.org' } });
  await new Promise((resolve) => serveur.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${serveur.address().port}`;
});
after(async () => {
  await Promise.all([serveur, backend].filter(Boolean).map((s) => new Promise((resolve) => s.close(resolve))));
});

test('le serveur de production, branché sur le vrai dist/, publie l’article et la liste', async () => {
  const reponse = await fetch(`${base}/blog/article-factice-test`);
  assert.equal(reponse.status, 200);
  const page = await reponse.text();
  assert.match(page, /<title>Titre SEO de l’article factice — Charles Lindecker<\/title>/);
  assert.match(page, /<link rel="canonical" href="https:\/\/charles-lindecker\.com\/blog\/article-factice-test">/);
  assert.equal(compter(page, /application\/ld\+json/g), 1);
  assert.equal(compter(page, /<noscript/g), 0);
  assert.match(page, /Le corps de l’article factice\./, 'le corps de l’article est dans la page');

  const liste = await (await fetch(`${base}/blog`)).text();
  assert.match(liste, /href="\/blog\/article-factice-test"/);
  assert.doesNotMatch(liste, /Le premier article reste à écrire/);

  assert.equal((await fetch(`${base}/blog-modele`)).status, 404, 'le gabarit n’est pas public');
});
