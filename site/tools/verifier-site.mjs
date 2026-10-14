#!/usr/bin/env node
/**
 * Contrôles du site construit, enchaînés par `npm run build` : une seule
 * erreur fait échouer le build, donc l'image Docker et le déploiement.
 *
 *   - ce que lisent les moteurs et les réseaux : langue, titre, description,
 *     canonical, Open Graph, JSON-LD valide, sitemap cohérent ;
 *   - ce que la CSP du serveur bloquerait : script en ligne, gestionnaire
 *     d'événement, URL javascript: ;
 *   - ce qui casserait la lecture : un seul h1, niveaux de titres sans saut,
 *     identifiants uniques, ancres et liens internes qui mènent quelque part,
 *     images décrites ;
 *   - la typographie française du texte visible : apostrophe typographique,
 *     espace insécable avant « : ; ! ? » et dans les guillemets ;
 *   - les budgets de poids (JavaScript et CSS, compressés).
 *
 * Zéro dépendance, comme server/server.mjs : le HTML d'Astro est régulier, un
 * découpage en balises suffit.
 *
 * Usage : node tools/verifier-site.mjs [dist]
 */
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

export const SITE_URL = 'https://charles-lindecker.com';

export const LIMITES = Object.freeze({
  titreMax: 65,
  descriptionMin: 110,
  descriptionMax: 165,
  jsGzip: 15 * 1024,
  cssGzip: 30 * 1024,
});

/** Seuls blocs <script> admis en ligne : des données, jamais du code. */
const SCRIPTS_DONNEES = new Set(['application/ld+json', 'application/json']);
/** Éléments dont le contenu n'est pas du texte lu. */
const BRUT = new Set(['script', 'style']);
const SANS_TEXTE_LU = new Set(['script', 'style', 'code', 'pre', 'svg', 'title']);

/* ------------------------------------------------------------------------ */
/* Lecture du HTML                                                           */
/* ------------------------------------------------------------------------ */

const ENTITES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

export function decoder(texte) {
  return texte.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (tout, corps) => {
    if (corps[0] === '#') {
      const code = corps[1].toLowerCase() === 'x' ? Number.parseInt(corps.slice(2), 16) : Number.parseInt(corps.slice(1), 10);
      return Number.isInteger(code) ? String.fromCodePoint(code) : tout;
    }
    return ENTITES[corps.toLowerCase()] ?? tout;
  });
}

const BALISE = /<!--[\s\S]*?-->|<![^>]*>|<(\/?)([a-zA-Z][a-zA-Z0-9:-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g;
const ATTRIBUT = /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

/**
 * Découpe un document en balises et en textes, dans l'ordre.
 * @returns {Array<{ type: 'ouvrante' | 'fermante' | 'texte', nom?: string, attrs?: Map<string, string>, texte?: string }>}
 */
export function decouper(html) {
  const jetons = [];
  let curseur = 0;
  BALISE.lastIndex = 0;
  let m;
  while ((m = BALISE.exec(html))) {
    if (m.index > curseur) jetons.push({ type: 'texte', texte: html.slice(curseur, m.index) });
    curseur = BALISE.lastIndex;
    if (!m[2]) continue; // commentaire ou doctype
    const nom = m[2].toLowerCase();
    if (m[1]) {
      jetons.push({ type: 'fermante', nom });
      continue;
    }
    const attrs = new Map();
    for (const a of (m[3] ?? '').replace(/\/\s*$/, '').matchAll(ATTRIBUT)) {
      const cle = a[1].toLowerCase();
      if (!attrs.has(cle)) attrs.set(cle, decoder(a[2] ?? a[3] ?? a[4] ?? ''));
    }
    jetons.push({ type: 'ouvrante', nom, attrs });
    if (BRUT.has(nom)) {
      const fin = new RegExp(`</${nom}\\s*>`, 'ig');
      fin.lastIndex = curseur;
      const f = fin.exec(html);
      const arret = f ? f.index : html.length;
      jetons.push({ type: 'texte', texte: html.slice(curseur, arret), brut: true });
      if (f) jetons.push({ type: 'fermante', nom });
      curseur = f ? fin.lastIndex : html.length;
      BALISE.lastIndex = curseur;
    }
  }
  if (curseur < html.length) jetons.push({ type: 'texte', texte: html.slice(curseur) });
  return jetons;
}

/* ------------------------------------------------------------------------ */
/* Typographie                                                               */
/* ------------------------------------------------------------------------ */

/**
 * Les adresses d’un attribut `srcset`, découpé comme le fait le navigateur
 * (spécification HTML) : une adresse court jusqu’au premier blanc, virgules
 * comprises, et ses descripteurs jusqu’à la virgule suivante. Une adresse
 * `data:` (une source neutre) garde donc sa virgule.
 * @param {string} srcset
 * @returns {string[]}
 */
export function urlsDuSrcset(srcset) {
  const urls = [];
  let i = 0;
  while (i < srcset.length) {
    while (i < srcset.length && /[\s,]/.test(srcset[i])) i++;
    if (i >= srcset.length) break;
    let j = i;
    while (j < srcset.length && !/\s/.test(srcset[j])) j++;
    const url = srcset.slice(i, j);
    if (url.endsWith(',')) {
      urls.push(url.replace(/,+$/, ''));
      i = j;
      continue;
    }
    urls.push(url);
    while (j < srcset.length && srcset[j] !== ',') j++;
    i = j + 1;
  }
  return urls;
}

/**
 * Fautes typographiques d'un texte visible. Renvoie une liste d'extraits.
 * Les espaces ordinaires avant « : ; ! ? » sont refusés, comme l'apostrophe
 * droite : une heure (« 14:30 ») ou une adresse ne passent pas par ici.
 */
export function fautesTypo(texte) {
  const fautes = [];
  const extrait = (i) => texte.slice(Math.max(0, i - 24), i + 12).replace(/\s+/g, ' ');
  for (const m of texte.matchAll(/'/g)) fautes.push(`apostrophe droite : « ${extrait(m.index)} »`);
  for (const m of texte.matchAll(/[ \t\n]([:;!?»])/g)) fautes.push(`espace ordinaire avant « ${m[1]} » : « ${extrait(m.index)} »`);
  for (const m of texte.matchAll(/«[ \t\n]/g)) fautes.push(`espace ordinaire après « : « ${extrait(m.index)} »`);
  return fautes;
}

/* ------------------------------------------------------------------------ */
/* Analyse d'une page                                                        */
/* ------------------------------------------------------------------------ */

export function analyser(html) {
  const page = {
    lang: undefined,
    titres: [],
    h1: 0,
    niveaux: [],
    ids: new Map(),
    meta: new Map(),
    canonicals: [],
    liens: [],
    images: [],
    scripts: [],
    feuilles: [],
    stylesEnLigne: [],
    enLigne: [],
    jsonLd: [],
    gestionnaires: [],
    urlsJavascript: [],
    texte: '',
  };
  const pile = [];
  let textesLus = [];
  let titreEnCours = null;

  for (const j of decouper(html)) {
    if (j.type === 'texte') {
      if (j.brut) {
        const parent = pile.at(-1);
        if (parent?.nom === 'style') page.stylesEnLigne.push(j.texte);
        if (parent?.nom === 'script') {
          const type = (parent.attrs.get('type') ?? '').toLowerCase();
          if (type === 'application/ld+json') page.jsonLd.push(j.texte);
          if (!parent.attrs.has('src') && !SCRIPTS_DONNEES.has(type) && j.texte.trim()) page.enLigne.push(j.texte.trim().slice(0, 60));
        }
        continue;
      }
      if (titreEnCours !== null) titreEnCours += j.texte;
      if (!pile.some((e) => SANS_TEXTE_LU.has(e.nom))) textesLus.push(j.texte);
      continue;
    }
    if (j.type === 'fermante') {
      if (j.nom === 'title' && titreEnCours !== null && !pile.some((e) => e.nom === 'svg')) {
        page.titres.push(decoder(titreEnCours).trim());
      }
      if (j.nom === 'title') titreEnCours = null;
      const i = pile.findLastIndex((e) => e.nom === j.nom);
      if (i >= 0) pile.length = i;
      // Une fin de bloc sépare deux mots qui se touchent dans le source.
      textesLus.push(' ');
      continue;
    }

    const { nom, attrs } = j;
    for (const [cle, valeur] of attrs) {
      if (/^on[a-z]+$/.test(cle)) page.gestionnaires.push(`<${nom} ${cle}>`);
      if ((cle === 'href' || cle === 'src' || cle === 'action') && /^\s*javascript:/i.test(valeur)) page.urlsJavascript.push(`<${nom} ${cle}>`);
      if (cle === 'id' && valeur) page.ids.set(valeur, (page.ids.get(valeur) ?? 0) + 1);
    }
    const dansSvg = pile.some((e) => e.nom === 'svg');
    if (/^h[1-6]$/.test(nom) && !dansSvg) {
      page.niveaux.push(Number(nom[1]));
      if (nom === 'h1') page.h1 += 1;
    }
    switch (nom) {
      case 'html':
        page.lang = attrs.get('lang');
        break;
      case 'title':
        titreEnCours = '';
        break;
      case 'meta': {
        const cle = attrs.get('name') ?? attrs.get('property');
        if (cle) page.meta.set(cle.toLowerCase(), [...(page.meta.get(cle.toLowerCase()) ?? []), attrs.get('content') ?? '']);
        break;
      }
      case 'link': {
        const rel = (attrs.get('rel') ?? '').toLowerCase().split(/\s+/);
        if (rel.includes('canonical')) page.canonicals.push(attrs.get('href') ?? '');
        if (rel.includes('stylesheet')) page.feuilles.push(attrs.get('href') ?? '');
        if (rel.includes('preload') || rel.includes('icon') || rel.includes('manifest') || rel.includes('apple-touch-icon')) {
          page.liens.push({ url: attrs.get('href') ?? '', balise: 'link' });
        }
        break;
      }
      case 'a':
        if (attrs.has('href')) page.liens.push({ url: attrs.get('href') ?? '', balise: 'a' });
        break;
      case 'img':
        page.images.push(attrs);
        page.liens.push({ url: attrs.get('src') ?? '', balise: 'img' });
        break;
      case 'source':
        for (const url of urlsDuSrcset(attrs.get('srcset') ?? '')) page.liens.push({ url, balise: 'source' });
        break;
      case 'script':
        if (attrs.has('src')) page.scripts.push(attrs.get('src') ?? '');
        break;
      case 'button':
        if (attrs.has('popovertarget')) page.liens.push({ url: `#${attrs.get('popovertarget')}`, balise: 'button' });
        break;
      default:
        break;
    }
    const vide = /^(area|base|br|col|embed|hr|img|input|link|meta|source|track|wbr)$/.test(nom);
    if (!vide) pile.push({ nom, attrs });
  }
  page.texte = decoder(textesLus.join(''));
  return page;
}

/* ------------------------------------------------------------------------ */
/* Site                                                                       */
/* ------------------------------------------------------------------------ */

async function fichiers(dossier) {
  const tout = await readdir(dossier, { recursive: true });
  return tout.map((f) => String(f).split(path.sep).join('/'));
}

/** Chemin d'URL -> fichier de dist/ (build.format 'directory'). */
function fichierPour(dist, cheminUrl) {
  const propre = decodeURIComponent(cheminUrl.split(/[?#]/)[0]);
  if (propre === '/' || propre === '') return path.join(dist, 'index.html');
  if (path.posix.extname(propre)) return path.join(dist, propre);
  return path.join(dist, propre, 'index.html');
}

async function existe(chemin) {
  try {
    return (await stat(chemin)).isFile();
  } catch {
    return false;
  }
}

export async function verifier(dist) {
  const erreurs = [];
  const tous = await fichiers(dist);
  const pagesHtml = tous.filter((f) => f.endsWith('.html'));
  const analyses = new Map();

  for (const f of pagesHtml) {
    const html = await readFile(path.join(dist, f), 'utf8');
    const url = f === 'index.html' ? '/' : f === '404.html' ? '/404' : `/${f.replace(/\/index\.html$/, '')}`;
    analyses.set(url, { fichier: f, page: analyser(html) });
  }

  for (const [url, { page }] of analyses) {
    const e = (message) => erreurs.push(`${url} : ${message}`);
    const robots = page.meta.get('robots')?.[0] ?? '';
    const horsIndex = /noindex/.test(robots);

    if (page.lang !== 'fr') e(`lang="${page.lang ?? ''}" au lieu de "fr"`);
    if (page.titres.length !== 1) e(`${page.titres.length} balises <title>`);
    const titre = page.titres[0] ?? '';
    if (!titre || titre.length > LIMITES.titreMax) e(`titre de ${titre.length} caractères (max ${LIMITES.titreMax})`);
    const description = page.meta.get('description')?.[0] ?? '';
    if (description.length < LIMITES.descriptionMin || description.length > LIMITES.descriptionMax) {
      e(`description de ${description.length} caractères (${LIMITES.descriptionMin} à ${LIMITES.descriptionMax})`);
    }
    for (const cle of ['og:title', 'og:description', 'og:image', 'og:type', 'twitter:card']) {
      if ((page.meta.get(cle) ?? []).length !== 1) e(`balise ${cle} absente ou en double`);
    }
    if (horsIndex) {
      if (page.canonicals.length) e('canonical sur une page hors index');
    } else {
      if (page.canonicals.length !== 1) e(`${page.canonicals.length} canonical`);
      const attendu = url === '/' ? `${SITE_URL}/` : `${SITE_URL}${url}`;
      if (page.canonicals[0] && page.canonicals[0] !== attendu) e(`canonical ${page.canonicals[0]} au lieu de ${attendu}`);
      if (page.jsonLd.length !== 1) e(`${page.jsonLd.length} blocs JSON-LD`);
    }
    for (const bloc of page.jsonLd) {
      try {
        JSON.parse(bloc);
      } catch (erreur) {
        e(`JSON-LD illisible : ${erreur.message}`);
      }
    }

    if (page.h1 !== 1) e(`${page.h1} titres h1`);
    page.niveaux.forEach((niveau, i) => {
      if (i > 0 && niveau > page.niveaux[i - 1] + 1) e(`titre h${niveau} après h${page.niveaux[i - 1]} : niveau sauté`);
    });
    for (const [id, n] of page.ids) if (n > 1) e(`identifiant « ${id} » présent ${n} fois`);

    for (const bout of page.enLigne) e(`script en ligne bloqué par la CSP : ${bout}`);
    for (const g of page.gestionnaires) e(`gestionnaire d'événement en ligne : ${g}`);
    for (const u of page.urlsJavascript) e(`URL javascript: ${u}`);

    for (const img of page.images) if (!img.has('alt')) e(`image sans alt : ${img.get('src')}`);

    for (const { url: cible, balise } of page.liens) {
      if (!cible || /^(mailto:|tel:|https?:|data:)/.test(cible)) continue;
      const [chemin, ancre] = cible.split('#');
      if (!chemin) {
        if (ancre && ancre !== 'top' && !page.ids.has(ancre)) e(`ancre #${ancre} introuvable (<${balise}>)`);
        continue;
      }
      if (!chemin.startsWith('/')) {
        e(`lien relatif « ${cible} » (<${balise}>)`);
        continue;
      }
      if (!(await existe(fichierPour(dist, chemin)))) {
        e(`lien vers ${chemin} : rien de construit à cette adresse (<${balise}>)`);
        continue;
      }
      if (ancre && ancre !== 'top') {
        const autre = analyses.get(chemin.replace(/\/$/, '') || '/');
        if (autre && !autre.page.ids.has(ancre)) e(`ancre ${chemin}#${ancre} introuvable`);
      }
    }

    for (const faute of fautesTypo(page.texte)) e(faute);

    let js = 0;
    for (const src of page.scripts) {
      const fichier = fichierPour(dist, src);
      if (await existe(fichier)) js += gzipSync(await readFile(fichier)).length;
    }
    if (js > LIMITES.jsGzip) e(`JavaScript : ${js} octets compressés (max ${LIMITES.jsGzip})`);
    // Feuilles liées et styles en ligne (build.inlineStylesheets) : le même budget.
    let css = page.stylesEnLigne.length ? gzipSync(page.stylesEnLigne.join('\n')).length : 0;
    for (const href of page.feuilles) {
      const fichier = fichierPour(dist, href);
      if (await existe(fichier)) css += gzipSync(await readFile(fichier)).length;
    }
    if (css > LIMITES.cssGzip) e(`CSS : ${css} octets compressés (max ${LIMITES.cssGzip})`);
  }

  // Le sitemap ne cite que des pages construites et indexables, et toutes celles-là.
  const sitemap = await readFile(path.join(dist, 'sitemap.xml'), 'utf8').catch(() => '');
  const cites = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const indexables = [...analyses]
    .filter(([url, { page }]) => url !== '/404' && !/noindex/.test(page.meta.get('robots')?.[0] ?? ''))
    .map(([url]) => (url === '/' ? `${SITE_URL}/` : `${SITE_URL}${url}`));
  for (const loc of cites) if (!indexables.includes(loc)) erreurs.push(`sitemap.xml : ${loc} n'est pas une page indexable du build`);
  for (const loc of indexables) if (!cites.includes(loc)) erreurs.push(`sitemap.xml : ${loc} manque`);
  const robots = await readFile(path.join(dist, 'robots.txt'), 'utf8').catch(() => '');
  if (!robots.includes(`Sitemap: ${SITE_URL}/sitemap.xml`)) erreurs.push('robots.txt : ligne Sitemap absente');

  return { erreurs, pages: [...analyses.keys()] };
}

/* ------------------------------------------------------------------------ */

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const dist = path.resolve(process.argv[2] ?? 'dist');
  const { erreurs, pages } = await verifier(dist);
  if (erreurs.length) {
    console.error(`\n[verifier-site] ${erreurs.length} erreur(s) :`);
    for (const erreur of erreurs) console.error(`  - ${erreur}`);
    process.exit(1);
  }
  console.log(`[verifier-site] ${pages.length} pages vérifiées : ${pages.join(', ')}`);
}
