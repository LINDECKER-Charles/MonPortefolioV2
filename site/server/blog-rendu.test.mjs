/**
 * Rendu des articles par Node (server/blog.mjs), nœud par nœud et sur des
 * gabarits écrits à la main : ce que l’auteur écrit ne doit jamais casser la
 * page qui l’entoure. Le contrat avec le vrai gabarit construit reste dans
 * blog-dist.test.mjs.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { renderArticle, renderIndex } from './blog.mjs';

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
