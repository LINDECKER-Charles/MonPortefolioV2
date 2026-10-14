/**
 * Rendu des articles par Node (server/blog.mjs), nœud par nœud et sur des
 * gabarits écrits à la main : ce que l’auteur écrit ne doit jamais casser la
 * page qui l’entoure. Le contrat avec le vrai gabarit construit reste dans
 * blog-dist.test.mjs.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderArticle, renderDocument, renderIndex } from './blog.mjs';
import { imageArticle, lienArticle } from './blog-regles.mjs';

/** Les cas que la validation Rust vérifie aussi (backend/tests/blog_api.rs). */
const REGLES = JSON.parse(readFileSync(new URL('../tests/fixtures/liens-blog.json', import.meta.url), 'utf8'));

const GABARIT = '<html><head><title>Gabarit</title><meta name="description" content="test"></head><body><header>Entête</header><main id="contenu"><div id="blog-article-slot"></div></main><footer>Pied</footer></body></html>';
const LISTE = '<html><head><title>Le blog</title></head><body><main><h1>Le blog.</h1><div id="blog-publications" data-astro-cid-blog><section><p>Le premier article reste à écrire.</p></section></div></main><footer>Pied</footer></body></html>';
const compter = (html, motif) => (html.match(motif) ?? []).length;
const texte = (valeur, marks) => ({ type: 'text', text: valeur, ...(marks ? { marks } : {}) });
const article = (champs = {}) => ({
  id: 1, slug: 'motifs', title: 'Titre', excerpt: 'Extrait.', tags: [], cover_image: null, cover_alt: '', seo_title: '', seo_description: '', canonical_url: null, og_image: null, noindex: false, published_at: 1791468000, updated_at: '2026-10-08T12:00:00Z',
  content: { type: 'doc', content: [{ type: 'paragraph', content: [texte('Corps.')] }] },
  ...champs,
});

test('les motifs $ de l’auteur ne réinjectent jamais le gabarit (titre, extrait, code)', () => {
  const motifs = 'Prix 5 $$, $& et $\' puis $`';
  const html = renderArticle(GABARIT, article({
    title: motifs,
    excerpt: motifs,
    tags: ['$&'],
    content: { type: 'doc', content: [
      { type: 'paragraph', content: [texte(motifs)] },
      { type: 'codeBlock', attrs: { language: 'bash' }, content: [texte("IFS=$'\\n'; echo $$ \"$&\" $` $'")] },
    ] },
  }));
  for (const balise of [/<html>/g, /<\/head>/g, /<main /g, /<footer>/g, /<header>Entête/g]) assert.equal(compter(html, balise), 1, `une seule occurrence de ${balise}`);
  assert.doesNotMatch(html, /blog-article-slot/, 'l’emplacement est consommé une fois, jamais recopié');
  assert.match(html, /<title>Prix 5 \$\$, \$&amp; et \$&#39; puis \$`<\/title>/);
  assert.match(html, /<h1>Prix 5 \$\$, \$&amp; et \$&#39; puis \$`<\/h1>/);
  assert.match(html, /<p class="blog-article__intro">Prix 5 \$\$, \$&amp; et \$&#39; puis \$`<\/p>/);
  assert.match(html, /<code>IFS=\$&#39;\\n&#39;; echo \$\$ &quot;\$&amp;&quot; \$` \$&#39;<\/code>/);
  const ld = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/)[1]);
  assert.equal(ld.headline, motifs);
});

test('les motifs $ d’un titre ne dupliquent pas la liste ni son état vide', () => {
  const html = renderIndex(LISTE, { posts: [article({ title: 'Motifs $$ $& $\' $`', excerpt: '$& et $$' })], total: 1 }, 1);
  assert.equal(compter(html, /id="blog-publications"/g), 1);
  assert.equal(compter(html, /<footer>/g), 1);
  assert.doesNotMatch(html, /Le premier article reste à écrire/);
  assert.match(html, /<a href="\/blog\/motifs">Motifs \$\$ \$&amp; \$&#39; \$`<\/a>/);
  assert.match(html, /<p>\$&amp; et \$\$<\/p>/);
});

test('liens et images suivent la règle du backend, cas par cas', () => {
  for (const href of REGLES.liens.admis) assert.ok(lienArticle(href), `lien admis : ${href}`);
  for (const href of REGLES.liens.refuses) assert.equal(lienArticle(href), '', `lien refusé : ${JSON.stringify(href)}`);
  for (const src of REGLES.images.admises) assert.equal(imageArticle(src), src, `image admise : ${src}`);
  for (const src of REGLES.images.refusees) assert.equal(imageArticle(src), '', `image refusée : ${src}`);
});

test('le rendu garde les liens internes avec ancre ou paramètres et retire mailto: et les images non importées', () => {
  const lien = (href) => ({ type: 'paragraph', content: [texte('lien', [{ type: 'link', attrs: { href } }])] });
  const html = renderDocument({ type: 'doc', content: [
    lien('/projets/omnicard#decisions'), lien('/blog?page=2'), lien('#le-contexte'), lien('mailto:owner@example.org'),
    { type: 'image', attrs: { src: '/assets/demo.png', alt: 'absente' } },
    { type: 'image', attrs: { src: '/images/charles.webp', alt: 'du site' } },
  ] });
  assert.match(html, /<a href="\/projets\/omnicard#decisions"/);
  assert.match(html, /<a href="\/blog\?page=2"/);
  assert.match(html, /<a href="#le-contexte"/);
  assert.doesNotMatch(html, /mailto:|\/assets\/|\/images\//);
  assert.match(html, /<p>lien<\/p>$/, 'le texte d’un lien refusé reste, sans lien');
});

test('chaque titre reçoit un identifiant stable, unique et distinct de ceux du gabarit', () => {
  const titre = (level, ...content) => ({ type: 'heading', attrs: { level }, content });
  const html = renderArticle(GABARIT.replace('<footer>', '<footer id="discutons">'), article({ content: { type: 'doc', content: [
    titre(2, texte('Le contexte')),
    titre(3, texte('Le contexte')),
    titre(2, texte('Œuvre & cœur : l’été à Noël !')),
    titre(2, texte('Avec du '), texte('code()', [{ type: 'code' }]), { type: 'hardBreak' }, texte('et un saut')),
    titre(4, texte('Discutons')),
    titre(2, texte('???')),
    titre(2, texte('x'.repeat(200))),
  ] } }));
  const ids = [...html.matchAll(/<h[234][^>]* id="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(ids, ['le-contexte', 'le-contexte-2', 'oeuvre-coeur-l-ete-a-noel', 'avec-du-code-et-un-saut', 'discutons-2', 'section', 'x'.repeat(80)]);
  assert.equal(compter(html, /id="discutons"/g), 1, 'l’identifiant du gabarit reste unique');
});
