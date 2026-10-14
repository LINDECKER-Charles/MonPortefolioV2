import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { imageArticle, lienArticle } from './blog-regles.mjs';

const ORIGIN = 'https://charles-lindecker.com';
const AUTHOR = 'Charles Lindecker';
const MAX_RESPONSE = 8 * 1024 * 1024;
export const escapeHtml = (value = '') => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
/**
 * Typographie française du texte d’auteur, la règle de src/lib/typo.ts : espace
 * insécable avant « : ; ! ? » et dans les guillemets, apostrophe courbe entre
 * deux lettres. Jamais sur le code (marque code, bloc de code) ni sur une
 * adresse, qui n’est qu’un attribut.
 */
export function typoAuteur(texte) {
  return String(texte ?? '').replace(/(\p{L})'(?=\p{L})/gu, '$1’').replace(/[ \t]+([:;!?»])/g, '\u00a0$1').replace(/«[ \t]+/g, '«\u00a0');
}
const texteAuteur = (valeur) => escapeHtml(typoAuteur(valeur));
const jsonScript = (value) => JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');

/** Liens et images suivent la règle du backend (blog-regles.mjs) ; l’aperçu lit les images par la session. */
function safeUrl(value, image = false, preview = false) {
  if (!image) return lienArticle(value);
  const src = imageArticle(value);
  return src && preview ? src.replace('/api/blog/media/', '/api/backoffice/blog/media/') : src;
}

/*
 * Images : le backend décrit chaque image d’un article sous `media` (dimensions
 * réelles et largeurs des variantes, backend/src/blog_media.rs). Le rendu en
 * tire la taille d’affichage, posée en width/height (aucun décalage de mise en
 * page, jamais d’agrandissement), et un srcset qui ne sert jamais un original
 * plus large que 1 600 px. Les boîtes reprennent styles/blog.css.
 */
const PROSE = { largeur: 672, hauteur: 800 };          // .blog-prose (42rem) ; plafond des images du texte
const COUVERTURE = { largeur: 1000, hauteur: 650 };    // .blog-article__cover
const GOUTTIERES = 32;                                 // 2 × --gouttiere à 390 px
const VARIANTE_MAX = 1600;
const dimension = (valeur) => (Number.isInteger(valeur) && valeur > 0 && valeur <= 10_000 ? valeur : 0);

/** Les dimensions et variantes connues d’une image importée, ou null. */
function infoImage(media, src) {
  const info = media && typeof media === 'object' && Object.hasOwn(media, src) ? media[src] : null;
  const width = dimension(info?.width); const height = dimension(info?.height);
  if (!width || !height) return null;
  const variants = (Array.isArray(info.variants) ? info.variants : []).filter((largeur) => dimension(largeur) && largeur <= width).sort((a, b) => a - b);
  return { width, height, variants };
}
/** Réduit sans jamais agrandir, en gardant les proportions, pour tenir dans la boîte. */
function ajuster({ width, height }, boite) {
  const echelle = Math.min(1, boite.largeur / width, boite.hauteur / height);
  return { width: Math.max(1, Math.round(width * echelle)), height: Math.max(1, Math.round(height * echelle)) };
}
/** src, srcset et sizes d’une image importée ; `adresse` passe à l’aperçu privé. */
function sources(src, info, affichee, adresse, sizes) {
  const candidats = info ? info.variants.map((largeur) => [`${src}/${largeur}`, largeur]) : [];
  if (info && info.width <= VARIANTE_MAX && !info.variants.includes(info.width)) candidats.push([src, info.width]);
  // Sans variante, l’original seul n’a pas besoin de srcset.
  if (!candidats.length || (candidats.length === 1 && candidats[0][0] === src)) return `src="${escapeHtml(adresse(src))}"`;
  const repli = candidats.find(([, largeur]) => largeur >= (affichee?.width ?? 0)) ?? candidats.at(-1);
  const taille = sizes ?? `(max-width: ${affichee.width + GOUTTIERES}px) calc(100vw - ${GOUTTIERES}px), ${affichee.width}px`;
  return `src="${escapeHtml(adresse(repli[0]))}" srcset="${candidats.map(([url, largeur]) => `${escapeHtml(adresse(url))} ${largeur}w`).join(', ')}" sizes="${taille}"`;
}
const versApercu = (preview) => (url) => (preview ? url.replace('/api/blog/media/', '/api/backoffice/blog/media/') : url);
const attributsTaille = (taille) => (taille ? ` width="${taille.width}"${taille.height ? ` height="${taille.height}"` : ''}` : '');

/** Taille d’affichage d’une image du texte, selon ses dimensions et celles choisies par l’auteur. */
function tailleImage(attrs, info) {
  const largeur = dimension(attrs.width); const hauteur = dimension(attrs.height);
  if (info) {
    const base = largeur ? { width: largeur, height: Math.round((largeur * info.height) / info.width) }
      : hauteur ? { width: Math.round((hauteur * info.width) / info.height), height: hauteur }
        : info;
    return ajuster({ width: base.width, height: Math.max(1, base.height) }, PROSE);
  }
  // Sans dimensions connues, une hauteur seule déformerait l’image : seule la largeur passe.
  if (largeur && hauteur) return ajuster({ width: largeur, height: hauteur }, PROSE);
  return largeur ? { width: Math.min(largeur, PROSE.largeur), height: 0 } : null;
}

/** Identifiant d’ancre d’un titre : ASCII, minuscules et tirets, comme les slugs (« Œuvre & cœur » → oeuvre-coeur). */
export function slugTitre(texte) {
  const slug = String(texte).replace(/œ/gi, 'oe').replace(/æ/gi, 'ae').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+/, '').slice(0, 80).replace(/-+$/, '');
  return slug || 'section';
}
const texteDe = (node) => (node?.type === 'text' ? String(node.text ?? '') : node?.type === 'hardBreak' ? ' ' : (Array.isArray(node?.content) ? node.content : []).map(texteDe).join(''));

/**
 * Documents structurés uniquement : aucun HTML d’auteur ne traverse le renderer.
 * Chaque titre porte un identifiant tiré de son texte, unique dans la page
 * (`reserved` : ceux du gabarit), pour les ancres `#…` de l’auteur.
 */
export function renderDocument(doc, { preview = false, reserved = [], media = {} } = {}) {
  let count = 0;
  const used = new Set(reserved);
  const identifiant = (node) => {
    const base = slugTitre(texteDe(node));
    let id = base;
    for (let n = 2; used.has(id); n += 1) id = `${base}-${n}`;
    used.add(id);
    return id;
  };
  let tables = 0; let codes = 0;
  /**
   * Un lien coupé en plusieurs textes (« le **projet** Omnicard ») reste un seul
   * lien. Un lien sortant suit la grammaire du site (lib/liens.ts : ↗, rel
   * external, ni nouvel onglet ni classe d’auteur) et la mesure des liens
   * sortants, à l’emplacement `article` (docs/mesure-audience.md).
   */
  const lienDe = (node) => (Array.isArray(node?.marks) ? node.marks : []).find((mark) => mark?.type === 'link');
  const ancre = (href, attrs, interieur) => {
    const titre = attrs?.title ? ` title="${texteAuteur(attrs.title)}"` : '';
    if (!/^https?:\/\//.test(href)) return `<a href="${escapeHtml(href)}"${titre}>${interieur}</a>`;
    return `<a href="${escapeHtml(href)}"${titre} rel="external" data-umami-event="lien-sortant" data-umami-event-domaine="${escapeHtml(new URL(href).hostname)}" data-umami-event-emplacement="article">${interieur}<span class="fleche" aria-hidden="true">\u00a0↗</span></a>`;
  };
  const enLigne = (contenu, depth) => {
    let html = '';
    for (let i = 0; i < contenu.length;) {
      const lien = lienDe(contenu[i]);
      const href = lien ? safeUrl(lien.attrs?.href) : '';
      let j = i + 1;
      if (href) while (j < contenu.length && safeUrl(lienDe(contenu[j])?.attrs?.href) === href) j += 1;
      const morceau = contenu.slice(i, j).map((child) => render(child, depth + 1)).join('');
      html += href ? ancre(href, lien.attrs, morceau) : morceau;
      i = j;
    }
    return html;
  };
  // `portee` : portée des en-têtes de la ligne en cours (col en thead, row ailleurs).
  const render = (node, depth = 0, portee = 'row') => {
    if (!node || typeof node !== 'object' || depth > 30 || ++count > 20_000) return '';
    const attrs = node.attrs ?? {};
    const contenu = Array.isArray(node.content) ? node.content : [];
    const children = (suite = portee) => contenu.map((child) => render(child, depth + 1, suite)).join('');
    const align = ['center', 'right', 'justify'].includes(attrs.textAlign) ? ` class="blog-align-${attrs.textAlign}"` : '';
    switch (node.type) {
      case 'doc': return children();
      case 'text': {
        const marks = Array.isArray(node.marks) ? node.marks : [];
        let text = marks.some((mark) => mark?.type === 'code') ? escapeHtml(node.text) : texteAuteur(node.text);
        // Le lien se pose autour de ses textes (enLigne) : ici, les seules marques de forme.
        for (const mark of marks) {
          const tag = { bold: 'strong', italic: 'em', strike: 's', underline: 'u', code: 'code' }[mark?.type];
          if (tag) text = `<${tag}>${text}</${tag}>`;
        }
        return text;
      }
      case 'paragraph': return `<p${align}>${enLigne(contenu, depth)}</p>`;
      case 'heading': { const level = [2, 3, 4].includes(attrs.level) ? attrs.level : 2; return `<h${level}${align} id="${identifiant(node)}">${enLigne(contenu, depth)}</h${level}>`; }
      case 'bulletList': return `<ul>${children()}</ul>`;
      case 'orderedList': return `<ol${Number.isSafeInteger(attrs.start) && attrs.start > 0 ? ` start="${attrs.start}"` : ''}${['1', 'a', 'A', 'i', 'I'].includes(attrs.type) ? ` type="${attrs.type}"` : ''}>${children()}</ol>`;
      case 'listItem': return `<li>${children()}</li>`;
      case 'blockquote': return `<blockquote>${children()}</blockquote>`;
      // Tableaux et code défilent en largeur : la région prend le focus pour défiler au clavier (WCAG 2.1.1).
      case 'codeBlock': { codes += 1; const langage = typeof attrs.language === 'string' && attrs.language ? ` (${escapeHtml(attrs.language)})` : ''; return `<pre tabindex="0" role="region" aria-label="Code ${codes}${langage}"><code>${contenu.map((ligne) => (ligne?.type === 'text' ? escapeHtml(ligne.text) : '')).join('')}</code></pre>`; }
      case 'hardBreak': return '<br>';
      case 'horizontalRule': return '<hr>';
      case 'image': {
        const src = safeUrl(attrs.src, true);
        if (!src) return '';
        const info = infoImage(media, src);
        const taille = tailleImage(attrs, info);
        return `<figure><img ${sources(src, info, taille?.height ? taille : null, versApercu(preview))} alt="${texteAuteur(attrs.alt)}"${attributsTaille(taille)} loading="lazy" decoding="async">${attrs.title ? `<figcaption>${texteAuteur(attrs.title)}</figcaption>` : ''}</figure>`;
      }
      case 'table': {
        tables += 1;
        // Une première ligne faite d’en-têtes devient l’en-tête du tableau.
        const premiere = contenu[0];
        const entete = premiere?.type === 'tableRow' && Array.isArray(premiere.content) && premiere.content.length > 0 && premiere.content.every((cellule) => cellule?.type === 'tableHeader');
        const corps = (entete ? contenu.slice(1) : contenu).map((ligne) => render(ligne, depth + 1, 'row')).join('');
        return `<div class="blog-table" tabindex="0" role="region" aria-label="Tableau ${tables}"><table>${entete ? `<thead>${render(premiere, depth + 1, 'col')}</thead>` : ''}<tbody>${corps}</tbody></table></div>`;
      }
      case 'tableRow': return `<tr>${children()}</tr>`;
      case 'tableCell': case 'tableHeader': { const tag = node.type === 'tableHeader' ? 'th' : 'td'; const span = (key) => Number.isInteger(attrs[key]) && attrs[key] > 1 && attrs[key] <= 100 ? ` ${key}="${attrs[key]}"` : ''; const alignment = ['center', 'right', 'justify'].includes(attrs.align) ? ` class="blog-align-${attrs.align}"` : ''; const widths = Array.isArray(attrs.colwidth) && attrs.colwidth.length <= 100 && attrs.colwidth.every((w) => Number.isInteger(w) && w > 0 && w <= 10_000) ? attrs.colwidth.reduce((sum, width) => sum + width, 0) : 0; return `<${tag}${alignment}${tag === 'th' ? ` scope="${portee}"` : ''}${span('colspan')}${span('rowspan')}${widths ? ` style="width:${widths}px;min-width:${widths}px"` : ''}>${children('row')}</${tag}>`; }
      default: return '';
    }
  };
  return render(doc);
}

function textContent(node) {
  if (!node || typeof node !== 'object') return '';
  if (node.type === 'text') return String(node.text ?? '');
  return (node.content ?? []).map(textContent).join(' ');
}
const isoDate = (value) => { const date = new Date(typeof value === 'number' ? value * 1000 : value); return Number.isNaN(date.valueOf()) ? '' : date.toISOString(); };
const frenchDate = (value) => { const date = isoDate(value); return date ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeZone: 'Europe/Paris' }).format(new Date(date)) : ''; };
const frenchDateTime = (value) => { const date = isoDate(value); return date ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Europe/Paris' }).format(new Date(date)) : ''; };
/** Ce que montre l’aperçu, et ce que lisent les visiteurs pendant ce temps. */
function noticeApercu(post) {
  const ecart = (version) => post.has_unpublished_changes ? `Cette version de travail diffère de la version ${version}\u00a0: ${version === 'publique' ? 'publiez-la' : 'reprogrammez-la'} pour l’inclure.` : `La version ${version} est celle-ci.`;
  const etat = post.status === 'scheduled' && post.scheduled_at
    ? `La publication est programmée le ${escapeHtml(frenchDateTime(post.scheduled_at))} (heure de Paris). ${ecart('programmée')}`
    : post.status === 'published' ? `L’article est publié. ${ecart('publique')}` : 'Cet article n’est pas publié.';
  return `<div class="blog-preview-notice" role="status">Aperçu privé de la version de travail. ${etat}</div>`;
}
const tagsHtml = (post) => (post.tags?.length ? `<ul class="blog-tags" aria-label="Sujets">${post.tags.map((tag) => `<li>${texteAuteur(tag)}</li>`).join('')}</ul>` : '');

function metadata(post, preview) {
  const title = typoAuteur(post.seo_title || post.title);
  const description = typoAuteur(post.seo_description || post.excerpt || textContent(post.content).slice(0, 160));
  let canonical = `${ORIGIN}/blog/${encodeURIComponent(post.slug)}`;
  try { const url = new URL(post.canonical_url); if (url.protocol === 'https:' && !url.username && !url.password) canonical = url.href; } catch { /* Canonical propre à la publication. */ }
  const image = safeUrl(post.og_image || post.cover_image, true) || '/og/accueil.png';
  const published = isoDate(post.published_at);
  const modified = isoDate(post.updated_at) || published;
  const article = { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: typoAuteur(post.title), description, url: canonical, mainEntityOfPage: canonical, inLanguage: 'fr', author: { '@type': 'Person', name: AUTHOR, url: `${ORIGIN}/parcours` }, image: [`${ORIGIN}${image}`], ...(published ? { datePublished: published } : {}), ...(modified ? { dateModified: modified } : {}), keywords: post.tags ?? [] };
  return `<title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}"><meta name="robots" content="${preview || post.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'}">${preview ? '' : `<link rel="canonical" href="${escapeHtml(canonical)}">`}<meta property="og:type" content="article"><meta property="og:site_name" content="${AUTHOR}"><meta property="og:locale" content="fr_FR"><meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="${escapeHtml(canonical)}"><meta property="og:image" content="${escapeHtml(ORIGIN + image)}"><meta property="og:image:alt" content="${texteAuteur((!post.og_image && post.cover_alt) || post.title)}"><meta name="twitter:card" content="summary_large_image">${published ? `<meta property="article:published_time" content="${published}">` : ''}${modified ? `<meta property="article:modified_time" content="${modified}">` : ''}${preview ? '' : `<script type="application/ld+json">${jsonScript(article)}</script>`}`;
}

export function renderArticle(template, post, { preview = false } = {}) {
  const reading = Math.max(1, Math.ceil(textContent(post.content).trim().split(/\s+/).length / 220));
  const image = safeUrl(post.cover_image, true);
  // La couverture est le plus grand élément du premier écran : dimensionnée, chargée en priorité.
  const couverture = infoImage(post.media, image);
  const tailleCouverture = couverture && ajuster(couverture, COUVERTURE);
  const content = `<article class="wrap blog-article">${preview ? noticeApercu(post) : ''}<nav class="blog-article__nav" aria-label="Fil d’Ariane"><a href="/">Accueil</a><a href="/blog">Blog</a><span aria-current="page">${texteAuteur(post.title)}</span></nav><header class="blog-article__header"><p class="blog-meta">${AUTHOR}${post.published_at ? ` — <time datetime="${isoDate(post.published_at)}">${escapeHtml(frenchDate(post.published_at))}</time>` : ''} — ${reading} min de lecture</p><h1>${texteAuteur(post.title)}</h1><p class="blog-article__intro">${texteAuteur(post.excerpt)}</p>${tagsHtml(post)}</header>${image ? `<img class="blog-article__cover" ${sources(image, couverture, tailleCouverture, versApercu(preview))} alt="${texteAuteur(post.cover_alt)}"${attributsTaille(tailleCouverture)} fetchpriority="high" decoding="async">` : ''}<div class="blog-prose">${renderDocument(post.content, { preview, media: post.media, reserved: [...template.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]) })}</div></article>`;
  // Remplacement par fonction : un texte d’auteur qui porte $&, $' ou $$ serait sinon lu comme un motif de String.replace.
  let html = template.replace(/<title>[\s\S]*?<\/title>/, '').replace(/<meta\s+(?:name="(?:description|robots|twitter:[^"]*)"|property="(?:og:|article:)[^"]*")[^>]*>/g, '').replace(/<link rel="canonical"[^>]*>/g, '').replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '').replace('</head>', () => metadata(post, preview) + '</head>').replace(/<div id="blog-article-slot"[^>]*><\/div>/, () => content).replace(/<noscript>[\s\S]*?<\/noscript>/g, '');
  if (preview) html = html.replace(/<script[^>]*src="\/mesure.js"[^>]*><\/script>/g, '');
  return html;
}

export function renderIndex(template, page, number = 1) {
  if (!page.posts.length && number === 1) return template;
  // Vignettes recadrées en 16:9 par blog.css : la vedette prend 7/12 de 1 344 px, les autres la moitié.
  const list = page.posts.map((post, rang) => { const image = safeUrl(post.cover_image, true); const info = infoImage(post.media, image); const vignette = image ? `<img ${sources(image, info, info, (url) => url, `(max-width: 860px) calc(100vw - ${GOUTTIERES}px), ${rang ? 660 : 760}px`)} alt="${texteAuteur(post.cover_alt)}"${attributsTaille(info)}${rang ? ' loading="lazy"' : ''} decoding="async">` : ''; return `<article class="blog-list__article"><div><p class="blog-meta"><time datetime="${isoDate(post.published_at)}">${escapeHtml(frenchDate(post.published_at))}</time></p><h2><a href="/blog/${escapeHtml(post.slug)}">${texteAuteur(post.title)}</a></h2><p>${texteAuteur(post.excerpt)}</p>${tagsHtml(post)}</div>${vignette}</article>`; }).join('');
  const pagination = `<nav class="blog-pagination" aria-label="Pages du blog">${number > 1 ? `<a rel="prev" href="/blog${number === 2 ? '' : `?page=${number - 1}`}">Articles précédents</a>` : '<span></span>'}${number * 20 < page.total ? `<a rel="next" href="/blog?page=${number + 1}">Articles suivants</a>` : ''}</nav>`;
  let html = template.replace(/<div id="blog-publications"[^>]*>[\s\S]*?<\/section>\s*<\/div>/, () => `<div id="blog-publications"><section class="blog-list" aria-label="Articles publiés">${list}</section>${pagination}</div>`);
  if (number > 1) html = html.replaceAll(`href="${ORIGIN}/blog"`, `href="${ORIGIN}/blog?page=${number}"`).replaceAll(`content="${ORIGIN}/blog"`, `content="${ORIGIN}/blog?page=${number}"`);
  return html;
}

async function backendJson(config, route, cookie) {
  const response = await fetch(`${config.origine}${route}`, { headers: { Accept: 'application/json', ...(cookie ? { Cookie: cookie } : {}) }, signal: AbortSignal.timeout(5000), redirect: 'error' });
  if (!response.ok) { await response.body?.cancel(); const error = new Error('blog indisponible'); error.status = [401, 403, 404].includes(response.status) ? response.status : 503; throw error; }
  let size = 0; const parts = [];
  for await (const part of response.body) { size += part.length; if (size > MAX_RESPONSE) throw new Error('réponse blog trop grande'); parts.push(part); }
  return JSON.parse(Buffer.concat(parts).toString('utf8'));
}

/** Génère le HTML avant envoi : les moteurs lisent article et SEO sans JavaScript. */
export async function serveBlog(req, res, { pathname, search, root, backend, headers, replaceEmail = (html) => html, notFound, loadTemplate = (relative) => readFile(path.join(root, relative), 'utf8') }) {
  const preview = /^\/api\/backoffice\/blog\/preview\/([1-9]\d*)$/.exec(pathname);
  const article = /^\/blog\/([a-z0-9]+(?:-[a-z0-9]+)*)$/.exec(pathname);
  if (pathname === '/blog-modele') { await notFound(req, res); return true; }
  if (!preview && pathname !== '/blog' && pathname !== '/sitemap.xml' && !article) return false;
  if (!backend) { if (preview || article) { await notFound(req, res); return true; } return false; }
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405, { ...headers, Allow: 'GET, HEAD' }); res.end(); return true; }
  try {
    let html; let type = 'text/html; charset=utf-8'; let noindex = !!preview;
    if (pathname === '/sitemap.xml') {
      html = await loadTemplate('sitemap.xml');
      let offset = 0; const entries = [];
      do {
        const page = await backendJson(backend, `/api/blog/posts?limit=100&offset=${offset}`);
        for (const post of page.posts) {
          const own = `${ORIGIN}/blog/${post.slug}`;
          if (!post.noindex && (!post.canonical_url || post.canonical_url === own)) entries.push(`<url><loc>${escapeHtml(own)}</loc><lastmod>${escapeHtml(isoDate(post.updated_at) || isoDate(post.published_at))}</lastmod></url>`);
        }
        offset += page.posts.length;
        if (offset >= page.total || !page.posts.length) break;
        if (offset >= 50_000) throw new Error('sitemap trop grand');
      } while (true);
      html = html.replace('</urlset>', `${entries.join('')}\n</urlset>`); type = 'application/xml; charset=utf-8';
    } else if (preview || article) {
      const post = await backendJson(backend, preview ? `/api/backoffice/blog/posts/${preview[1]}/preview` : `/api/blog/posts/${article[1]}`, preview ? req.headers.cookie : undefined);
      const template = await loadTemplate('blog-modele/index.html');
      html = renderArticle(template, post, { preview: !!preview }); noindex ||= post.noindex;
    } else {
      const raw = new URLSearchParams(search).get('page') ?? '1';
      if (!/^[1-9]\d{0,5}$/.test(raw)) { await notFound(req, res); return true; }
      const number = Number(raw);
      const page = await backendJson(backend, `/api/blog/posts?limit=20&offset=${(number - 1) * 20}`);
      if (number > 1 && !page.posts.length) { await notFound(req, res); return true; }
      html = renderIndex(await loadTemplate('blog/index.html'), page, number);
    }
    const body = Buffer.from(replaceEmail(html));
    res.writeHead(200, { ...headers, 'Content-Type': type, 'Cache-Control': preview ? 'no-store' : 'no-cache', ...(noindex ? { 'X-Robots-Tag': 'noindex, nofollow' } : {}), 'Content-Length': body.length });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch (error) {
    if (error.status === 404) { await notFound(req, res); return true; }
    const status = error.status ?? 503;
    const message = status === 401 ? 'Connectez-vous au backoffice pour ouvrir cet aperçu.' : status === 403 ? 'Cet aperçu est privé.' : 'Le blog est momentanément indisponible. Réessayez dans quelques instants.';
    res.writeHead(status, { ...headers, 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' });
    res.end(req.method === 'HEAD' ? undefined : message);
  }
  return true;
}
