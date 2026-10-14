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

const cellule = (type, valeur, attrs = {}) => ({ type, attrs: { colspan: 1, rowspan: 1, colwidth: null, ...attrs }, content: [{ type: 'paragraph', content: [texte(valeur)] }] });
const ligne = (...cellules) => ({ type: 'tableRow', content: cellules });

test('tableaux et blocs de code défilent dans une région atteignable au clavier, nommée et numérotée', () => {
  const html = renderDocument({ type: 'doc', content: [
    { type: 'table', content: [ligne(cellule('tableCell', 'a'))] },
    { type: 'codeBlock', attrs: { language: 'bash' }, content: [texte('echo 1')] },
    { type: 'table', content: [ligne(cellule('tableCell', 'b'))] },
    { type: 'codeBlock', attrs: { language: null }, content: [texte('x')] },
  ] });
  assert.match(html, /^<div class="blog-table" tabindex="0" role="region" aria-label="Tableau 1"><table>/);
  assert.match(html, /<div class="blog-table" tabindex="0" role="region" aria-label="Tableau 2">/);
  assert.match(html, /<pre tabindex="0" role="region" aria-label="Code 1 \(bash\)"><code>echo 1<\/code><\/pre>/);
  assert.match(html, /<pre tabindex="0" role="region" aria-label="Code 2"><code>x<\/code><\/pre>/);
});

test('la ligne d’en-tête passe en thead et chaque en-tête déclare sa portée', () => {
  const html = renderDocument({ type: 'doc', content: [{ type: 'table', content: [
    ligne(cellule('tableHeader', 'Ligne'), cellule('tableHeader', 'Montant', { align: 'right' })),
    ligne(cellule('tableHeader', 'Total'), cellule('tableCell', '12', { align: 'right' })),
  ] }, { type: 'table', content: [ligne(cellule('tableHeader', 'Seule'), cellule('tableCell', 'ligne'))] }] });
  assert.match(html, /<table><thead><tr><th scope="col"><p>Ligne<\/p><\/th><th class="blog-align-right" scope="col"><p>Montant<\/p><\/th><\/tr><\/thead><tbody><tr><th scope="row"><p>Total<\/p><\/th><td class="blog-align-right"><p>12<\/p><\/td><\/tr><\/tbody><\/table>/);
  assert.match(html, /<table><tbody><tr><th scope="row"><p>Seule<\/p><\/th><td><p>ligne<\/p><\/td><\/tr><\/tbody><\/table>/, 'une ligne mixte reste dans tbody');
});

test('le texte d’auteur reçoit la typographie du site, sauf le code et les adresses', () => {
  const html = renderArticle(GABARIT, article({
    title: "Titre : l'essai !",
    excerpt: "L'extrait ; « court » ?",
    tags: ["l'été"],
    content: { type: 'doc', content: [
      { type: 'paragraph', content: [
        texte("L'article : ici ; là ! vraiment ? « citation » "),
        texte("a ? b : c'est", [{ type: 'code' }]),
        texte(" et un lien : ", []),
        texte("aujourd'hui", [{ type: 'link', attrs: { href: '/blog?page=2' } }]),
      ] },
      { type: 'codeBlock', attrs: { language: null }, content: [texte("x ? y : 'z' ; « a »")] },
      { type: 'image', attrs: { src: '/api/blog/media/1', alt: "L'image : un test", title: "Légende : l'image !" } },
    ] },
  }));
  const nb = ' ';
  assert.match(html, new RegExp(`<h1>Titre${nb}: l’essai${nb}!</h1>`));
  assert.match(html, new RegExp(`<title>Titre${nb}: l’essai${nb}!</title>`));
  assert.match(html, new RegExp(`<p class="blog-article__intro">L’extrait${nb}; «${nb}court${nb}»${nb}\\?</p>`));
  assert.match(html, /<li>l’été<\/li>/);
  assert.match(html, new RegExp(`<p>L’article${nb}: ici${nb}; là${nb}! vraiment${nb}\\? «${nb}citation${nb}» <code>a \\? b : c&#39;est</code> et un lien${nb}: <a href="/blog\\?page=2"[^>]*>aujourd’hui</a></p>`));
  assert.match(html, /<code>x \? y : &#39;z&#39; ; « a »<\/code>/, 'un bloc de code reste tel quel');
  assert.match(html, new RegExp(`alt="L’image${nb}: un test"`));
  assert.match(html, new RegExp(`<figcaption>Légende${nb}: l’image${nb}!</figcaption>`));
  assert.match(html, new RegExp(`1${nb}min de lecture`));
});

test('l’aperçu dit ce qui est publié, programmé ou en attente, dans un bloc d’état sans aside', () => {
  const apercu = (champs) => renderArticle(GABARIT, article(champs), { preview: true });
  const brouillon = apercu({ status: 'draft', published_at: null });
  assert.match(brouillon, /<div class="blog-preview-notice" role="status">Aperçu privé de la version de travail\. Cet article n’est pas publié\.<\/div>/);
  assert.doesNotMatch(brouillon, /<aside/);
  const programme = apercu({ status: 'scheduled', scheduled_at: 1791468000, published_at: null, has_unpublished_changes: true });
  assert.match(programme, /programmée le 8 octobre 2026 à \d\d:00 \(heure de Paris\)/);
  assert.match(programme, /Cette version de travail diffère de la version programmée/);
  const programmeAJour = apercu({ status: 'scheduled', scheduled_at: 1791468000, published_at: null, has_unpublished_changes: false });
  assert.match(programmeAJour, /La version programmée est celle-ci\./);
  const publie = apercu({ status: 'published', has_unpublished_changes: true });
  assert.match(publie, /Cette version de travail diffère de la version publique/);
  assert.match(apercu({ status: 'published', has_unpublished_changes: false }), /La version publique est celle-ci\./);
});

test('og:image:alt décrit l’image de partage réellement choisie', () => {
  const alt = (html) => html.match(/<meta property="og:image:alt" content="([^"]*)">/)[1];
  assert.equal(alt(renderArticle(GABARIT, article({ title: 'Le titre', cover_image: '/api/blog/media/1', cover_alt: 'La couverture' }))), 'La couverture');
  assert.equal(alt(renderArticle(GABARIT, article({ title: 'Le titre', cover_image: '/api/blog/media/1', cover_alt: 'La couverture', og_image: '/api/blog/media/2' }))), 'Le titre');
  assert.equal(alt(renderArticle(GABARIT, article({ title: 'Le titre' }))), 'Le titre');
});

test('un lien sortant suit la grammaire du site (↗, rel external) et la mesure, une seule fois par lien', () => {
  const lien = { type: 'link', attrs: { href: 'https://www.example.org/page', title: "L'exemple", target: '_blank', rel: 'noopener noreferrer nofollow', class: 'x' } };
  const html = renderDocument({ type: 'doc', content: [{ type: 'paragraph', content: [
    texte('Voir '), texte('le site', [{ type: 'bold' }, lien]), texte(' officiel', [lien]), texte(', puis '),
    texte('les projets', [{ type: 'link', attrs: { href: '/projets', target: '_blank' } }]), texte('.'),
  ] }] });
  assert.equal(compter(html, /<a /g), 2, 'un lien coupé en plusieurs textes reste un seul lien');
  assert.match(html, /<a href="https:\/\/www\.example\.org\/page" title="L’exemple" rel="external" data-umami-event="lien-sortant" data-umami-event-domaine="www\.example\.org" data-umami-event-emplacement="article"><strong>le site<\/strong> officiel<span class="fleche" aria-hidden="true"> ↗<\/span><\/a>/);
  assert.match(html, /<a href="\/projets">les projets<\/a>/, 'un lien interne reste une navigation ordinaire');
  assert.doesNotMatch(html, /target=|class="x"|nofollow/);
});

const MEDIA = {
  '/api/blog/media/1': { width: 1600, height: 1000, variants: [480, 960, 1600] },
  '/api/blog/media/2': { width: 800, height: 2800, variants: [480] },
  '/api/blog/media/3': { width: 320, height: 200, variants: [] },
  '/api/blog/media/4': { width: 3200, height: 600, variants: [480, 960, 1600] },
  '/api/blog/media/5': { width: 800, height: 1400, variants: [480, 800] },
};
const image = (src, attrs = {}) => ({ type: 'image', attrs: { src, alt: 'Une image', ...attrs } });
const balise = (html, src) => html.match(new RegExp(`<img src="${src.replace(/\//g, '\\/')}(?:\\/\\d+)?"[^>]*>`))?.[0] ?? '';

test('une image d’article porte sa taille d’affichage, ses variantes et un chargement différé', () => {
  const html = renderDocument({ type: 'doc', content: [
    image('/api/blog/media/1'),
    image('/api/blog/media/2'),
    image('/api/blog/media/3'),
    image('/api/blog/media/4'),
  ] }, { media: MEDIA });
  const paysage = balise(html, '/api/blog/media/1');
  assert.match(paysage, / width="672" height="420"/);
  assert.match(paysage, / srcset="\/api\/blog\/media\/1\/480 480w, \/api\/blog\/media\/1\/960 960w, \/api\/blog\/media\/1\/1600 1600w"/);
  assert.match(paysage, / sizes="\(max-width: 704px\) calc\(100vw - 32px\), 672px"/);
  assert.match(paysage, /^<img src="\/api\/blog\/media\/1\/960"/, 'la source de repli est la plus petite qui couvre l’affichage');
  assert.match(paysage, / loading="lazy" decoding="async"/);
  assert.doesNotMatch(html, /style=/, 'plus de largeur en ligne : les attributs suffisent');
  const haute = balise(html, '/api/blog/media/2');
  assert.match(haute, / width="229" height="800"/, 'une image très haute garde ses proportions sous 800 px');
  assert.match(haute, / srcset="\/api\/blog\/media\/2\/480 480w, \/api\/blog\/media\/2 800w"/, 'l’original complète les variantes à sa largeur');
  const petite = balise(html, '/api/blog/media/3');
  assert.match(petite, /^<img src="\/api\/blog\/media\/3" alt="Une image" width="320" height="200" loading/, 'une petite image n’est jamais agrandie');
  assert.doesNotMatch(petite, /srcset/);
  const large = balise(html, '/api/blog/media/4');
  assert.match(large, / width="672" height="126"/);
  assert.doesNotMatch(large, /\/api\/blog\/media\/4 3200w/, 'un original plus large que 1 600 px n’est jamais servi');
});

test('largeur ou hauteur choisie par l’auteur, image inconnue et aperçu', () => {
  const html = renderDocument({ type: 'doc', content: [
    image('/api/blog/media/3', { width: 160 }),
    image('/api/blog/media/1', { height: 300 }),
    image('/api/blog/media/9', { width: 500 }),
    image('/api/blog/media/8', { height: 300 }),
  ] }, { media: MEDIA });
  assert.match(balise(html, '/api/blog/media/3'), / width="160" height="100"/);
  assert.match(balise(html, '/api/blog/media/1'), / width="480" height="300"/, 'une hauteur seule garde le rapport de l’image');
  assert.match(balise(html, '/api/blog/media/9'), /^<img src="\/api\/blog\/media\/9" alt="Une image" width="500" loading/);
  assert.match(balise(html, '/api/blog/media/8'), /^<img src="\/api\/blog\/media\/8" alt="Une image" loading/, 'une hauteur seule, sans dimensions connues, est ignorée');
  const apercu = renderDocument({ type: 'doc', content: [image('/api/blog/media/1')] }, { media: MEDIA, preview: true });
  assert.match(apercu, /srcset="\/api\/backoffice\/blog\/media\/1\/480 480w, \/api\/backoffice\/blog\/media\/1\/960 960w/);
  assert.doesNotMatch(renderDocument({ type: 'doc', content: [image('/api/blog/media/1')] }, { media: { '/api/blog/media/1': { width: 'x', height: -1, variants: ['../'] } } }), /srcset|width=/, 'des dimensions invalides sont ignorées');
});

test('la couverture est dimensionnée et chargée en priorité, la liste dimensionne ses vignettes', () => {
  const html = renderArticle(GABARIT, article({ cover_image: '/api/blog/media/5', cover_alt: 'Un portrait', media: MEDIA }));
  const couverture = html.match(/<img class="blog-article__cover"[^>]*>/)[0];
  assert.match(couverture, / width="371" height="650"/);
  assert.match(couverture, / fetchpriority="high"/);
  assert.doesNotMatch(couverture, /loading=/);
  assert.match(couverture, / srcset="\/api\/blog\/media\/5\/480 480w, \/api\/blog\/media\/5\/800 800w"/);
  const liste = renderIndex(LISTE, { posts: [article({ cover_image: '/api/blog/media/1', cover_alt: 'Un paysage', media: MEDIA }), article({ slug: 'deux', cover_image: '/api/blog/media/5', cover_alt: 'Un portrait', media: MEDIA })], total: 2 });
  const [vedette, suivante] = [...liste.matchAll(/<img [^>]*>/g)].map((m) => m[0]);
  assert.match(vedette, / width="1600" height="1000"/);
  assert.match(vedette, / sizes="\(max-width: 860px\) calc\(100vw - 32px\), 760px"/);
  assert.match(suivante, / sizes="\(max-width: 860px\) calc\(100vw - 32px\), 660px"/);
  assert.match(suivante, / loading="lazy"/);
});

test('une vignette recadrée en 16:9 demande assez de pixels pour sa hauteur', () => {
  const liste = renderIndex(LISTE, { posts: [article({ cover_image: '/api/blog/media/3', cover_alt: 'Petite', media: MEDIA }), article({ slug: 'large', cover_image: '/api/blog/media/4', cover_alt: 'Panorama', media: MEDIA })], total: 2 });
  const [, panorama] = [...liste.matchAll(/<img [^>]*>/g)].map((m) => m[0]);
  // 3 200 × 600 recadrée en 16:9 : la hauteur de la vignette voit 3 fois sa largeur d’image.
  assert.match(panorama, / sizes="\(max-width: 860px\) calc\(\(100vw - 32px\) \* 3\), 1980px"/);
});
