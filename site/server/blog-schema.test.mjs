/**
 * Couverture systématique du rendu des articles (server/blog.mjs), tirée des
 * fixtures que la validation Rust lit aussi (backend/tests/blog_api.rs) :
 *   - tests/fixtures/schema-blog.json : l’inventaire des nœuds, marques et
 *     attributs admis, avec des valeurs admises et refusées ;
 *   - tests/fixtures/article-complet.json : un article qui emploie toute
 *     l’inventaire et ses cas limites, que tests/e2e/blog-article.spec.ts rend
 *     aussi dans un navigateur, avec les images de article-complet-media.json.
 *
 * Un nœud ou un attribut ajouté au backend entre d’abord dans l’inventaire
 * (le test Rust l’exige), puis dans l’article de test (ce fichier l’exige),
 * et son rendu est alors vérifié ici et dans le navigateur.
 * Les cas ciblés (motifs $, images, aperçu…) restent dans blog-rendu.test.mjs.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { escapeHtml, renderArticle, renderDocument, renderIndex, typoAuteur } from './blog.mjs';

const lire = (nom) => JSON.parse(readFileSync(new URL(`../tests/fixtures/${nom}`, import.meta.url), 'utf8'));
const SCHEMA = lire('schema-blog.json');
const ARTICLE = lire('article-complet.json');
const MEDIA = Object.fromEntries(Object.entries(lire('article-complet-media.json').images).map(([id, { width, height, variants }]) => [`/api/blog/media/${id}`, { width, height, variants }]));

const GABARIT = '<!doctype html><html lang="fr"><head><title>Gabarit</title><meta name="description" content="test"></head><body><header id="entete">Entête</header><main id="contenu"><div id="blog-article-slot"></div></main><footer id="discutons">Pied</footer></body></html>';
const LISTE = '<html><head><title>Le blog</title></head><body><main><h1>Le blog.</h1><div id="blog-publications" data-astro-cid-blog><section><p>Le premier article reste à écrire.</p></section></div></main><footer>Pied</footer></body></html>';
const NB = ' ';
const compter = (html, motif) => (html.match(motif) ?? []).length;
const echapper = (texte) => texte.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Tous les nœuds d’un document, dans l’ordre du texte. */
function* noeuds(node) {
  if (!node || typeof node !== 'object') return;
  yield node;
  for (const enfant of Array.isArray(node.content) ? node.content : []) yield* noeuds(enfant);
}
const publie = { id: 1, ...ARTICLE, status: 'published', published_at: 1791468000, updated_at: '2026-10-08T12:00:00Z', media: MEDIA };
const PAGE = renderArticle(GABARIT, publie);
const PROSE = PAGE.slice(PAGE.indexOf('<div class="blog-prose">'), PAGE.lastIndexOf('</article>'));

/*
 * Documents minimaux : chaque nœud à une place que la validation admet (la même
 * construction que `placed` et `marked` dans backend/tests/blog_api.rs).
 */
const x = { type: 'text', text: 'x' };
const paragraphe = { type: 'paragraph', content: [x] };
const doc = (...blocs) => ({ type: 'doc', content: blocs });
const cellule = (type, attrs) => ({ type, attrs, content: [paragraphe] });
const tableau = (ligne) => doc({ type: 'table', content: [ligne] });
const PLACES = {
  doc: (attrs) => ({ type: 'doc', attrs, content: [paragraphe] }),
  paragraph: (attrs) => doc({ type: 'paragraph', attrs, content: [x] }),
  heading: (attrs) => doc({ type: 'heading', attrs: { level: 2, ...attrs }, content: [x] }),
  text: (attrs) => doc({ type: 'paragraph', content: [{ ...x, attrs }] }),
  hardBreak: (attrs) => doc({ type: 'paragraph', content: [x, { type: 'hardBreak', attrs }] }),
  horizontalRule: (attrs) => doc({ type: 'horizontalRule', attrs }),
  bulletList: (attrs) => doc({ type: 'bulletList', attrs, content: [{ type: 'listItem', content: [paragraphe] }] }),
  orderedList: (attrs) => doc({ type: 'orderedList', attrs, content: [{ type: 'listItem', content: [paragraphe] }] }),
  listItem: (attrs) => doc({ type: 'bulletList', content: [{ type: 'listItem', attrs, content: [paragraphe] }] }),
  blockquote: (attrs) => doc({ type: 'blockquote', attrs, content: [paragraphe] }),
  codeBlock: (attrs) => doc({ type: 'codeBlock', attrs, content: [x] }),
  image: (attrs) => doc({ type: 'image', attrs: { src: '/api/blog/media/1', ...attrs } }),
  table: (attrs) => doc({ type: 'table', attrs, content: [{ type: 'tableRow', content: [cellule('tableCell', {})] }] }),
  tableRow: (attrs) => tableau({ type: 'tableRow', attrs, content: [cellule('tableCell', {})] }),
  tableCell: (attrs) => tableau({ type: 'tableRow', content: [cellule('tableCell', attrs)] }),
  tableHeader: (attrs) => tableau({ type: 'tableRow', content: [cellule('tableHeader', attrs)] }),
};
const marque = (type) => (attrs) => doc({ type: 'paragraph', content: [{ ...x, marks: [{ type, attrs: type === 'link' ? { href: '/blog', ...attrs } : attrs }] }] });
const construire = (groupe, nom) => (groupe === 'noeuds' ? PLACES[nom] : marque(nom));
const inventaire = () => ['noeuds', 'marques'].flatMap((groupe) => Object.entries(SCHEMA[groupe]).map(([nom, attributs]) => [groupe, nom, attributs]));

test('l’inventaire et ses documents minimaux couvrent les mêmes nœuds', () => {
  assert.deepEqual(Object.keys(PLACES).sort(), Object.keys(SCHEMA.noeuds).sort());
});

test('l’article de test emploie chaque nœud, marque et attribut de l’inventaire', () => {
  const vus = new Map();
  const noter = (cle, valeur) => vus.set(cle, [...(vus.get(cle) ?? []), valeur]);
  for (const node of noeuds(ARTICLE.content)) {
    noter(`noeuds.${node.type}`);
    for (const [nom, valeur] of Object.entries(node.attrs ?? {})) noter(`noeuds.${node.type}.${nom}`, valeur);
    for (const mark of node.marks ?? []) {
      noter(`marques.${mark.type}`);
      for (const [nom, valeur] of Object.entries(mark.attrs ?? {})) noter(`marques.${mark.type}.${nom}`, valeur);
    }
  }
  const manques = [];
  for (const [groupe, nom, attributs] of inventaire()) {
    if (!vus.has(`${groupe}.${nom}`)) manques.push(`${groupe}.${nom}`);
    for (const [attribut, { admis, chaqueValeur }] of Object.entries(attributs)) {
      const valeurs = vus.get(`${groupe}.${nom}.${attribut}`) ?? [];
      const nonNulles = admis.filter((valeur) => valeur !== null);
      if (!valeurs.length) manques.push(`${groupe}.${nom}.${attribut}`);
      else if (nonNulles.length && !valeurs.some((valeur) => valeur !== null)) manques.push(`${groupe}.${nom}.${attribut} non nul`);
      for (const valeur of chaqueValeur ? nonNulles : []) if (!valeurs.some((vue) => JSON.stringify(vue) === JSON.stringify(valeur))) manques.push(`${groupe}.${nom}.${attribut} = ${JSON.stringify(valeur)}`);
    }
  }
  assert.deepEqual(manques, []);
});

test('l’article de test garde ses cas limites', () => {
  const textes = [...noeuds(ARTICLE.content)].filter((node) => node.type === 'text');
  const code = (node) => node.marks?.some((mark) => mark.type === 'code');
  const prose = textes.filter((node) => !code(node)).map((node) => node.text).join(' ');
  const blocs = [...noeuds(ARTICLE.content)].filter((node) => node.type === 'codeBlock').map((node) => node.content.map((t) => t.text).join(''));
  const liens = [...noeuds(ARTICLE.content)].flatMap((node) => (node.marks ?? []).filter((mark) => mark.type === 'link').map((mark) => mark.attrs.href));
  for (const motif of ['$$', '$&', "$'", '$`']) {
    assert.ok(prose.includes(motif), `${motif} dans le texte`);
    assert.ok(blocs.some((bloc) => bloc.includes(motif)), `${motif} dans un bloc de code`);
    assert.ok(`${ARTICLE.title} ${ARTICLE.excerpt} ${ARTICLE.tags.join(' ')}`.includes(motif), `${motif} dans le titre, l’extrait ou les étiquettes`);
  }
  assert.match(prose, /\p{L}'\p{L}/u, 'une apostrophe droite');
  assert.match(prose, /"[^"]+"/, 'des guillemets droits');
  assert.match(prose, / [:;!?]/, 'une ponctuation double après une espace ordinaire');
  assert.match(prose, /\?!/, 'une ponctuation double collée');
  assert.ok(blocs.some((bloc) => /\p{L}'\p{L}/u.test(bloc) && / [:;!]/.test(bloc)), 'un bloc de code à garder tel quel');
  assert.ok(liens.some((href) => /^\/[^#?]*#/.test(href)), 'un lien interne avec ancre');
  assert.ok(liens.some((href) => /^\/[^#]*\?/.test(href)), 'un lien interne avec paramètres');
  assert.ok(liens.some((href) => href.startsWith('#')), 'une ancre de l’article');
  assert.ok(liens.some((href) => href.startsWith('https://')), 'un lien sortant');
  const images = [...noeuds(ARTICLE.content)].filter((node) => node.type === 'image');
  assert.ok(images.some((image) => image.attrs.title && image.attrs.alt), 'une image avec légende et description');
  assert.ok(images.some((image) => !image.attrs.title), 'une image sans légende');
  const tables = [...noeuds(ARTICLE.content)].filter((node) => node.type === 'table');
  assert.ok(tables.some((table) => table.content[0].content.length >= 8), 'un tableau large');
  assert.ok(tables.some((table) => [...noeuds(table)].some((node) => node.attrs?.align && node.attrs.align !== 'left')), 'un tableau aligné');
});

test('une valeur que la validation refuse se rend comme un attribut absent', () => {
  for (const [groupe, nom, attributs] of inventaire()) {
    const construit = construire(groupe, nom);
    for (const [attribut, { refuses }] of Object.entries(attributs)) {
      const absent = renderDocument(construit({ [attribut]: undefined }));
      for (const valeur of refuses) assert.equal(renderDocument(construit({ [attribut]: valeur })), absent, `${nom}.${attribut} = ${JSON.stringify(valeur)}`);
    }
  }
  assert.equal(renderDocument(doc({ type: 'html', attrs: { html: '<script>x</script>' } }, { type: 'iframe', content: [paragraphe] })), '', 'un nœud inconnu ne rend rien');
  assert.equal(renderDocument(doc({ type: 'paragraph', content: [{ ...x, marks: [{ type: 'script' }, { type: 'span', attrs: { style: 'x' } }] }] })), '<p>x</p>', 'une marque inconnue est ignorée');
});

/** Le HTML exact de chaque nœud et de chaque marque, attributs et échappement compris. */
const t = (text, marks) => ({ type: 'text', text, ...(marks ? { marks } : {}) });
const p = (...content) => ({ type: 'paragraph', content });
const CATALOGUE = [
  ['paragraph', doc(p(t('x'))), '<p>x</p>'],
  ['paragraph.textAlign', PLACES.paragraph({ textAlign: 'center' }), '<p class="blog-align-center">x</p>'],
  ['paragraph.textAlign left', PLACES.paragraph({ textAlign: 'left' }), '<p>x</p>'],
  ['heading', PLACES.heading({ level: 3, textAlign: 'right' }), '<h3 class="blog-align-right" id="x">x</h3>'],
  ['heading 4', PLACES.heading({ level: 4 }), '<h4 id="x">x</h4>'],
  ['text échappé et typographié', doc(p(t('<script>alert("x")</script> & l\'été : oui ? « non »'))), `<p>&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; l’été${NB}: oui${NB}? «${NB}non${NB}»</p>`],
  ['hardBreak', PLACES.hardBreak({}), '<p>x<br></p>'],
  ['horizontalRule', PLACES.horizontalRule({}), '<hr>'],
  ['bulletList et listItem', PLACES.bulletList({}), '<ul><li><p>x</p></li></ul>'],
  ['orderedList', doc({ type: 'orderedList', attrs: { start: 7, type: 'i' }, content: [{ type: 'listItem', content: [p(t('x')), { type: 'bulletList', content: [{ type: 'listItem', content: [p(t('y'))] }] }] }] }), '<ol start="7" type="i"><li><p>x</p><ul><li><p>y</p></li></ul></li></ol>'],
  ['blockquote', doc({ type: 'blockquote', content: [PLACES.heading({ level: 3 }).content[0], p(t('y'))] }), '<blockquote><h3 id="x">x</h3><p>y</p></blockquote>'],
  ['codeBlock', doc({ type: 'codeBlock', attrs: { language: 'rust' }, content: [t('<a href="x">&\'$& : ;')] }), '<pre tabindex="0" role="region" aria-label="Code 1 (rust)"><code>&lt;a href=&quot;x&quot;&gt;&amp;&#39;$&amp; : ;</code></pre>'],
  ['codeBlock sans langage', PLACES.codeBlock({ language: null }), '<pre tabindex="0" role="region" aria-label="Code 1"><code>x</code></pre>'],
  ['image', PLACES.image({ alt: 'Une "image"', title: 'Légende : <b>', width: 160 }), `<figure><img src="/api/blog/media/1" alt="Une &quot;image&quot;" width="160" loading="lazy" decoding="async"><figcaption>Légende${NB}: &lt;b&gt;</figcaption></figure>`],
  ['image sans alt', PLACES.image({ alt: null }), '<figure><img src="/api/blog/media/1" alt="" loading="lazy" decoding="async"></figure>'],
  ['table, tableRow, tableHeader, tableCell', doc({ type: 'table', content: [
    { type: 'tableRow', content: [cellule('tableHeader', { colspan: 2 })] },
    { type: 'tableRow', content: [cellule('tableHeader', { rowspan: 2, align: 'right' }), cellule('tableCell', { colwidth: [100, 200], align: 'center' })] },
  ] }), '<div class="blog-table" tabindex="0" role="region" aria-label="Tableau 1"><table><thead><tr><th scope="col" colspan="2"><p>x</p></th></tr></thead><tbody><tr><th class="blog-align-right" scope="row" rowspan="2"><p>x</p></th><td class="blog-align-center" style="width:300px;min-width:300px"><p>x</p></td></tr></tbody></table></div>'],
  ['bold', marque('bold')(), '<p><strong>x</strong></p>'],
  ['italic', marque('italic')(), '<p><em>x</em></p>'],
  ['strike', marque('strike')(), '<p><s>x</s></p>'],
  ['underline', marque('underline')(), '<p><u>x</u></p>'],
  ['code, sans typographie', doc(p(t("l'a : b", [{ type: 'code' }]))), '<p><code>l&#39;a : b</code></p>'],
  ['marques cumulées', doc(p(t('x', [{ type: 'bold' }, { type: 'italic' }, { type: 'underline' }, { type: 'strike' }, { type: 'code' }]))), '<p><code><s><u><em><strong>x</strong></em></u></s></code></p>'],
  ['link interne', marque('link')({ href: '/blog?page=2', title: "L'index", target: '_blank', rel: 'nofollow', class: 'x' }), '<p><a href="/blog?page=2" title="L’index">x</a></p>'],
  ['link ancre', marque('link')({ href: '#fin' }), '<p><a href="#fin">x</a></p>'],
  ['link sortant', doc(p(t('a', [{ type: 'italic' }, { type: 'link', attrs: { href: 'https://example.org/a?b=1&c="2"', target: '_blank' } }]))), '<p><a href="https://example.org/a?b=1&amp;c=%222%22" rel="external" data-umami-event="lien-sortant" data-umami-event-domaine="example.org" data-umami-event-emplacement="article"><em>a</em><span class="fleche" aria-hidden="true"> ↗</span></a></p>'],
];

for (const [nom, document, attendu] of CATALOGUE) {
  test(`rendu de ${nom}`, () => assert.equal(renderDocument(document), attendu));
}

test('chaque entrée de l’inventaire a son rendu dans le catalogue', () => {
  const couverts = CATALOGUE.flatMap(([, document]) => [...noeuds(document)].flatMap((node) => [node.type, ...(node.marks ?? []).map((mark) => mark.type)]));
  const manques = inventaire().map(([, nom]) => nom).filter((nom) => !couverts.includes(nom));
  assert.deepEqual(manques, []);
});

test('l’article de test se pose une fois dans son gabarit, sans balise ni attribut étranger', () => {
  for (const balise of [/<html /g, /<\/head>/g, /<main /g, /<footer /g, /<header id/g, /<h1>/g, /<title>/g]) assert.equal(compter(PAGE, balise), 1, `une seule occurrence de ${balise}`);
  assert.doesNotMatch(PAGE, /blog-article-slot/);
  const balises = new Set([...PROSE.matchAll(/<([a-z0-9]+)[\s>]/g)].map((m) => m[1]));
  const admises = new Set(['div', 'p', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'br', 'hr', 'figure', 'img', 'figcaption', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'strong', 'em', 's', 'u', 'a', 'span']);
  assert.deepEqual([...balises].filter((balise) => !admises.has(balise)), []);
  assert.doesNotMatch(PROSE, /\son[a-z]+=|javascript:|<script|target=|class="lien-auteur"/i);
  const styles = [...PROSE.matchAll(/ style="([^"]*)"/g)].map((m) => m[1]);
  assert.ok(styles.length > 0 && styles.every((style) => /^width:\d+px;min-width:\d+px$/.test(style)), 'seule la largeur choisie d’une colonne passe en style');
});

test('chaque texte de l’auteur arrive dans la page, typographié hors du code et intact dans le code', () => {
  const manques = [];
  for (const node of noeuds(ARTICLE.content)) {
    if (node.type === 'codeBlock') {
      const brut = node.content.map((ligne) => ligne.text).join('');
      if (!PROSE.includes(`<code>${escapeHtml(brut)}</code></pre>`)) manques.push(`bloc ${brut.slice(0, 30)}`);
    } else if (node.type === 'paragraph' || node.type === 'heading') {
      for (const enfant of node.content ?? []) {
        if (enfant.type !== 'text') continue;
        const code = enfant.marks?.some((mark) => mark.type === 'code');
        // Le code peut porter d’autres marques, posées à l’intérieur de <code>.
        const attendu = code ? new RegExp(`<code>(?:<[a-z]+>)*${echapper(escapeHtml(enfant.text))}`) : null;
        if (code ? !attendu.test(PROSE) : !PROSE.includes(escapeHtml(typoAuteur(enfant.text)))) manques.push(enfant.text.slice(0, 40));
      }
    }
  }
  assert.deepEqual(manques, []);
  const texte = (html) => html.replace(/<pre[\s\S]*?<\/pre>|<code>[\s\S]*?<\/code>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&');
  const lu = texte(PROSE) + texte(PAGE.slice(PAGE.indexOf('<header class="blog-article__header">'), PAGE.indexOf('<div class="blog-prose">')));
  assert.doesNotMatch(lu, /[ \t][:;!?»]/, 'jamais d’espace ordinaire avant : ; ! ? »');
  assert.doesNotMatch(lu, /«[ \t]/, 'jamais d’espace ordinaire après «');
  assert.doesNotMatch(lu, /\p{L}'\p{L}/u, 'jamais d’apostrophe droite entre deux lettres');
  assert.match(PAGE, new RegExp(`<title>Article de test${NB}: l’essai \\$&amp; d’un mot`));
  assert.match(PROSE, /<code>IFS=\$&#39;\\n&#39;\necho \$\$ &quot;\$&amp;&quot; \$` \$&#39;\nprintf &#39;%s&#39; &quot;l&#39;apostrophe : reste droite ; ici !&quot;<\/code>/, 'le code garde ses apostrophes et ses espaces');
});

test('chaque titre a un identifiant unique et chaque ancre de l’article mène à un titre', () => {
  const ids = [...PAGE.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(new Set(ids).size, ids.length, `identifiants en double : ${ids.filter((id, i) => ids.indexOf(id) !== i)}`);
  const titres = [...noeuds(ARTICLE.content)].filter((node) => node.type === 'heading').length;
  assert.equal(compter(PROSE, /<h[234][^>]* id="[a-z0-9-]+"/g), titres);
  const ancres = [...PROSE.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]);
  assert.ok(ancres.length >= 3, 'l’article de test garde des ancres');
  assert.deepEqual(ancres.filter((ancre) => !ids.includes(ancre)), [], 'ancres mortes');
});

test('chaque tableau et chaque bloc de code est une région nommée, atteignable au clavier', () => {
  const nombre = (type) => [...noeuds(ARTICLE.content)].filter((node) => node.type === type).length;
  const tables = [...PROSE.matchAll(/<div class="blog-table"([^>]*)>/g)].map((m) => m[1]);
  const codes = [...PROSE.matchAll(/<pre([^>]*)>/g)].map((m) => m[1]);
  assert.equal(tables.length, nombre('table'));
  assert.equal(codes.length, nombre('codeBlock'));
  const noms = [...tables, ...codes].map((attributs) => {
    assert.match(attributs, / tabindex="0" role="region" aria-label="[^"]+"/);
    return attributs.match(/aria-label="([^"]+)"/)[1];
  });
  assert.equal(new Set(noms).size, noms.length, 'chaque région a son propre nom');
});

test('liens et images de l’article suivent la grammaire du site', () => {
  const sortants = [...PROSE.matchAll(/<a href="(https?:[^"]+)"([^>]*)>([\s\S]*?)<\/a>/g)];
  assert.ok(sortants.length >= 2);
  for (const [, href, attributs, interieur] of sortants) {
    assert.match(attributs, / rel="external" data-umami-event="lien-sortant" data-umami-event-domaine="[^"]+" data-umami-event-emplacement="article"/, href);
    assert.match(interieur, /<span class="fleche" aria-hidden="true"> ↗<\/span>$/, href);
  }
  assert.equal(compter(PROSE, /href="https:\/\/example\.org\/doc"/g), 1, 'un lien en deux morceaux reste un seul lien');
  const images = [...PROSE.matchAll(/<img [^>]*>/g)].map((m) => m[0]);
  assert.equal(images.length, [...noeuds(ARTICLE.content)].filter((node) => node.type === 'image').length);
  for (const image of images) assert.match(image, /^<img src="\/api\/blog\/media\/\d+(?:\/\d+)?"(?: srcset="[^"]+" sizes="[^"]+")? alt="[^"]*" width="\d+" height="\d+" loading="lazy" decoding="async">$/, image);
  assert.match(PAGE, /<img class="blog-article__cover" src="\/api\/blog\/media\/5[^"]*"[^>]* width="\d+" height="\d+" fetchpriority="high"/);
});

test('la liste du blog pose l’article de test une fois, avec ses motifs $', () => {
  const { content: _contenu, ...resume } = publie;
  const html = renderIndex(LISTE, { posts: [resume, { ...resume, slug: 'deux' }], total: 2 });
  assert.equal(compter(html, /id="blog-publications"/g), 1);
  assert.equal(compter(html, /<footer>/g), 1);
  assert.equal(compter(html, /<article class="blog-list__article">/g), 2);
  assert.doesNotMatch(html, /Le premier article reste à écrire/);
  assert.match(html, new RegExp(`<a href="/blog/article-complet">Article de test${NB}: l’essai \\$&amp; d’un mot`));
  assert.match(html, /Motifs \$\$ et \$&#39; compris/);
});
