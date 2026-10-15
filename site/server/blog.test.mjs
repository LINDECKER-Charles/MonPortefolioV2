import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { creerServeur } from './server.mjs';
import { renderArticle, renderDocument } from './blog.mjs';

const template = '<html><head><title>Gabarit</title><meta name="robots" content="noindex"><meta name="description" content="test"><meta property="og:type" content="website"><script src="/mesure.js"></script></head><body><main><div id="blog-article-slot"></div></main><noscript><h1>Gabarit</h1></noscript></body></html>';
const post = { id: 1, title: 'Comprendre les décisions', slug: 'comprendre-les-decisions', excerpt: 'Des décisions expliquées.', content: { type: 'doc', content: [{ type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'La méthode' }] }, { type: 'paragraph', content: [{ type: 'text', text: 'Le contenu publié.', marks: [{ type: 'bold' }] }] }, { type: 'image', attrs: { src: '/api/blog/media/1', alt: 'La figure', title: 'Une légende' } }] }, cover_image: '/api/blog/media/1', cover_alt: 'La couverture', tags: ['Architecture'], seo_title: 'Décisions et architecture', seo_description: 'Un article sur la méthode.', canonical_url: '', og_image: '', noindex: false, published_at: 1791468000, updated_at: '2026-10-08T12:00:00Z' };

test('le document rend la mise en page et échappe tous les textes et liens', () => {
  const html = renderDocument({ type: 'doc', content: [
    { type: 'paragraph', attrs: { textAlign: 'center' }, content: [{ type: 'text', text: '<script>alert(1)</script>', marks: [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }] }] },
    { type: 'image', attrs: { src: 'https://evil.test/image.svg', alt: '" onerror="alert(1)' } },
    { type: 'table', content: [{ type: 'tableRow', content: [{ type: 'tableHeader', attrs: { align: 'right' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Critère' }] }] }] }] },
    { type: 'html', text: '<iframe src="https://evil.test"></iframe>' },
  ] });
  assert.match(html, /blog-align-center/);
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /<th class="blog-align-right" scope="col"><p>Critère<\/p><\/th>/);
  assert.doesNotMatch(html, /<script|javascript:|onerror|iframe|evil.test/);
});

test('article SEO et aperçu partagent le rendu, avec médias privés et sans mesure pour aperçu', () => {
  const publicHtml = renderArticle(template, post);
  assert.match(publicHtml, /<h1>Comprendre les décisions<\/h1>/);
  assert.equal((publicHtml.match(/<h1>/g) ?? []).length, 1);
  assert.match(publicHtml, /<title>Décisions et architecture<\/title>/);
  assert.match(publicHtml, /rel="canonical" href="https:\/\/charles-lindecker.com\/blog\/comprendre-les-decisions"/);
  const ld = JSON.parse(publicHtml.match(/<script type="application\/ld\+json">(.*?)<\/script>/)[1]);
  assert.equal(ld['@type'], 'BlogPosting');
  assert.equal(ld.author.name, 'Charles Lindecker');
  const preview = renderArticle(template, { ...post, title: '</script><script>alert(1)</script>' }, { preview: true });
  assert.match(preview, /noindex, nofollow/);
  assert.match(preview, /src="\/api\/backoffice\/blog\/media\/1"/);
  assert.doesNotMatch(preview, /mesure.js|rel="canonical"|application\/ld\+json|<script>alert/);
});

let directory; let server; let backend; let base; let calls = []; let offline = false;
before(async () => {
  directory = await mkdtemp(path.join(tmpdir(), 'portfolio-blog-'));
  for (const folder of ['blog', 'blog-modele']) await mkdir(path.join(directory, folder));
  await writeFile(path.join(directory, 'blog-modele/index.html'), template);
  await writeFile(path.join(directory, 'blog/index.html'), '<html><head></head><body><h1>Le blog.</h1><div id="blog-publications" data-astro-cid-blog><section><p>Aucun article.</p></section></div></body></html>');
  await writeFile(path.join(directory, 'sitemap.xml'), '<urlset><url><loc>https://charles-lindecker.com/blog</loc></url></urlset>');
  await writeFile(path.join(directory, '404.html'), '<h1>Introuvable</h1>');
  backend = createServer(async (req, res) => {
    const chunks = []; for await (const chunk of req) chunks.push(chunk);
    calls.push({ url: req.url, headers: req.headers, body: Buffer.concat(chunks).toString('utf8') });
    res.setHeader('Content-Type', 'application/json');
    if (offline) { res.writeHead(503); res.end('{}'); return; }
    if (req.url === '/api/config/contact') { res.end('{"email":"owner@example.org"}'); return; }
    if (req.url.startsWith('/api/blog/posts?')) { res.end(JSON.stringify({ posts: [post, { ...post, id: 2, slug: 'prive-du-sitemap', noindex: true }], total: 2 })); return; }
    if (req.url === '/api/blog/posts/comprendre-les-decisions') { res.end(JSON.stringify(post)); return; }
    if (req.url === '/api/backoffice/blog/posts/1/preview') { if (!req.headers.cookie?.includes('session=test')) { res.writeHead(401); res.end('{}'); return; } res.end(JSON.stringify({ ...post, title: 'Brouillon privé' })); return; }
    if (req.method === 'GET' && /^\/api\/(backoffice\/)?blog\/media\/1(\/480)?$/.test(req.url)) { res.setHeader('Content-Type', req.url.endsWith('/480') ? 'image/jpeg' : 'image/png'); res.end(Buffer.from(req.url.endsWith('/480') ? [255, 216, 255, 217] : [137, 80, 78, 71, 13, 10, 26, 10])); return; }
    if (req.method === 'DELETE' && req.url === '/api/backoffice/blog/media/1') { res.end('{"deleted":true,"id":1}'); return; }
    if (req.url === '/api/backoffice/blog/posts/1') { res.end(JSON.stringify(post)); return; }
    res.writeHead(404); res.end('{}');
  });
  await new Promise((resolve) => backend.listen(0, '127.0.0.1', resolve));
  server = creerServeur({ dossier: directory, env: { BACKEND_URL: `http://127.0.0.1:${backend.address().port}`, CONTACT_EMAIL: 'owner@example.org' } });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => { await Promise.all([new Promise((resolve) => server.close(resolve)), new Promise((resolve) => backend.close(resolve))]); await rm(directory, { recursive: true, force: true }); });

test('les articles et le sitemap sont disponibles dans le HTML dès la publication', async () => {
  const article = await fetch(`${base}/blog/comprendre-les-decisions`);
  assert.equal(article.status, 200);
  assert.match(await article.text(), /Le contenu publié/);
  const list = await fetch(`${base}/blog`);
  assert.match(await list.text(), /href="\/blog\/comprendre-les-decisions"/);
  const sitemap = await fetch(`${base}/sitemap.xml`);
  const xml = await sitemap.text();
  assert.match(xml, /\/blog\/comprendre-les-decisions/);
  assert.doesNotMatch(xml, /prive-du-sitemap|backoffice/);
  assert.equal((await fetch(`${base}/blog-modele`)).status, 404);
});

test('l’aperçu exige une session et ne peut être mis en cache ou indexé', async () => {
  assert.equal((await fetch(`${base}/api/backoffice/blog/preview/1`)).status, 401);
  const response = await fetch(`${base}/api/backoffice/blog/preview/1`, { headers: { Cookie: 'session=test' } });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(response.headers.get('x-robots-tag'), 'noindex, nofollow');
  assert.match(await response.text(), /Brouillon privé/);
  assert.equal((await fetch(`${base}/blog/article-brouillon`)).status, 404);
});

test('le relais transmet médias binaires et révision de suppression, avec limites dédiées au blog', async () => {
  const image = await fetch(`${base}/api/blog/media/1`);
  assert.equal(image.headers.get('content-type'), 'image/png');
  assert.deepEqual([...new Uint8Array(await image.arrayBuffer())], [137, 80, 78, 71, 13, 10, 26, 10]);
  const payload = JSON.stringify({ revision: 2, content: 'x'.repeat(30_000) });
  assert.equal((await fetch(`${base}/api/backoffice/blog/posts/1`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-Backoffice-Request': '1' }, body: payload })).status, 200);
  assert.equal(calls.at(-1).body, payload);
  await fetch(`${base}/api/backoffice/blog/posts/1`, { method: 'DELETE', headers: { 'Content-Type': 'application/json', 'X-Backoffice-Request': '1' }, body: '{"revision":2}' });
  assert.equal(calls.at(-1).body, '{"revision":2}');
  assert.equal((await fetch(`${base}/api/contact`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload })).status, 413);
  assert.equal((await fetch(`${base}/api/blog/not-a-route`)).status, 404);
});

test('le relais sert les variantes, revalide les images publiques par ETag et transmet la suppression', async () => {
  const variante = await fetch(`${base}/api/blog/media/1/480`);
  assert.equal(variante.status, 200);
  assert.equal(variante.headers.get('content-type'), 'image/jpeg');
  assert.deepEqual([...new Uint8Array(await variante.arrayBuffer())], [255, 216, 255, 217]);
  const image = await fetch(`${base}/api/blog/media/1`);
  const etag = image.headers.get('etag');
  assert.match(etag ?? '', /^"[\w-]{20,}"$/);
  assert.equal(image.headers.get('cache-control'), 'no-cache');
  const revalidee = await fetch(`${base}/api/blog/media/1`, { headers: { 'If-None-Match': etag } });
  assert.equal(revalidee.status, 304);
  assert.equal(revalidee.headers.get('etag'), etag);
  assert.equal((await fetch(`${base}/api/blog/media/1/480`, { headers: { 'If-None-Match': etag } })).status, 200, 'chaque variante a sa propre empreinte');
  const privee = await fetch(`${base}/api/backoffice/blog/media/1/480`, { headers: { Cookie: 'session=test' } });
  assert.equal(privee.status, 200);
  assert.equal(privee.headers.get('cache-control'), 'no-store');
  assert.equal(privee.headers.get('etag'), null);
  const suppression = await fetch(`${base}/api/backoffice/blog/media/1`, { method: 'DELETE', headers: { 'Content-Type': 'application/json', 'X-Backoffice-Request': '1' }, body: '{}' });
  assert.equal(suppression.status, 200);
  assert.deepEqual(await suppression.json(), { deleted: true, id: 1 });
  assert.equal((await fetch(`${base}/api/blog/media/1`, { method: 'DELETE' })).status, 405, 'la route publique reste en lecture');
  assert.equal((await fetch(`${base}/api/blog/media/1/480/2`)).status, 404);
});

test('une panne backend ne présente pas le blog comme vide ou les articles comme supprimés', async () => {
  offline = true;
  try { assert.equal((await fetch(`${base}/blog`)).status, 503); assert.equal((await fetch(`${base}/blog/comprendre-les-decisions`)).status, 503); }
  finally { offline = false; }
});
