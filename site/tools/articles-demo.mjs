#!/usr/bin/env node
/**
 * Articles de démonstration du blog, pour voir le rendu réel en local :
 * typographie et texte long, titres et ancres, listes et citations, code,
 * tableaux, images aux formats extrêmes, bords (titre très long, article très
 * court, programmation). Chaque nœud, marque et attribut admis par la
 * validation du backend (backend/src/blog.rs) y apparaît au moins une fois ;
 * l’outil le vérifie avant d’envoyer quoi que ce soit.
 *
 *   npm run blog:demo                 crée ou met à jour les articles demo-*
 *   npm run blog:demo -- --nettoyer   retire les articles demo-* et leurs images
 *   npm run blog:demo -- --programmer-dans=3   échéance de demo-programme en minutes
 *                                              (7 jours par défaut)
 *
 * Aucun article fictif ne part en production : l’outil refuse toute cible qui
 * n’est pas sur la boucle locale (127.0.0.1, localhost, ::1) et tout
 * environnement autre que APP_ENV=development, puis vérifie que le backend
 * ouvre la session sans 2FA (ce qu’il ne fait qu’en development). Il lit
 * BACKEND_URL, APP_ENV, BACKOFFICE_EMAIL et BACKOFFICE_PASSWORD dans le .env
 * racine (le script npm le charge), et parle directement au backend Rust.
 *
 * Idempotent : les articles sont retrouvés par leur slug (préfixe demo-), les
 * images par leur nom de fichier (préfixe demo-) et leur taille. Les images
 * sont dessinées ici avec sharp (formes simples et la mention « Image de
 * démonstration ») : aucun fichier n’est écrit sur le disque.
 *
 * --nettoyer retire les articles demo-* puis les images demo-* par l’API
 * (DELETE /api/backoffice/blog/media/{id}), qui refuse une image encore citée
 * par un autre article.
 *
 * L’outil essaie aussi quelques documents que la validation doit refuser
 * (mailto:, paramètre ou ancre non sûrs, retour chariot, image qui n’est pas
 * importée) et en affiche le résultat ; rien n’en reste en base.
 */
import sharp from 'sharp';
import { typo } from '../src/lib/typo.ts';
import { slugTitre } from '../server/blog.mjs';

const args = process.argv.slice(2);
const NETTOYER = args.includes('--nettoyer');
const PROGRAMMER_DANS = Number(args.find((a) => a.startsWith('--programmer-dans='))?.split('=')[1] ?? 7 * 24 * 60);

function arreter(message) {
  console.error(`articles-demo : ${message}`);
  process.exit(1);
}

/* ===== Garde-fous ===== */
const cible = (() => {
  try { return new URL(process.env.BACKEND_URL ?? ''); } catch { return null; }
})();
if (!cible) arreter('BACKEND_URL manque ou n’est pas une URL (lancer par « npm run blog:demo » qui lit ../.env).');
if (!['127.0.0.1', 'localhost', '[::1]'].includes(cible.hostname) || !['http:', 'https:'].includes(cible.protocol)) {
  arreter(`cible refusée (${cible.origin}) : seul un backend sur 127.0.0.1, localhost ou ::1 est admis.`);
}
if (process.env.APP_ENV !== 'development') arreter('APP_ENV doit valoir development : les articles de démonstration ne vivent qu’en local.');
if (!Number.isFinite(PROGRAMMER_DANS) || PROGRAMMER_DANS < 1) arreter('--programmer-dans attend un nombre de minutes ≥ 1.');
const EMAIL = process.env.BACKOFFICE_EMAIL;
const MOT_DE_PASSE = process.env.BACKOFFICE_PASSWORD;
if (!EMAIL || !MOT_DE_PASSE) arreter('BACKOFFICE_EMAIL et BACKOFFICE_PASSWORD sont requis.');

/* ===== Client du backoffice ===== */
let cookie = '';
async function api(methode, route, corps) {
  const reponse = await fetch(new URL(route, cible), {
    method: methode,
    headers: { Accept: 'application/json', ...(corps === undefined ? {} : { 'Content-Type': 'application/json' }), 'X-Backoffice-Request': '1', ...(cookie ? { Cookie: cookie } : {}) },
    body: corps === undefined ? undefined : JSON.stringify(corps),
    redirect: 'error',
  });
  const recu = reponse.headers.getSetCookie?.() ?? [];
  const session = recu.map((c) => c.split(';')[0]).find((c) => c.startsWith('portfolio_backoffice=') && c.length > 'portfolio_backoffice='.length);
  if (session) cookie = session;
  const texte = await reponse.text();
  let json = null;
  try { json = texte ? JSON.parse(texte) : null; } catch { json = { brut: texte }; }
  return { status: reponse.status, json };
}
async function exiger(methode, route, corps) {
  const r = await api(methode, route, corps);
  if (r.status >= 400) arreter(`${methode} ${route} → ${r.status} ${JSON.stringify(r.json)}`);
  return r.json;
}
async function connecter() {
  const r = await api('POST', '/api/backoffice/login', { email: EMAIL, password: MOT_DE_PASSE });
  if (r.json?.two_factor_required) arreter('le backend exige la 2FA : il ne tourne pas en development. Abandon.');
  if (r.status >= 400 || !cookie) arreter(`connexion refusée (${r.status}) ${JSON.stringify(r.json)}`);
}
async function articlesDemo() {
  const tous = [];
  for (let offset = 0; ; offset += 100) {
    const page = await exiger('GET', `/api/backoffice/blog/posts?status=all&limit=100&offset=${offset}`);
    tous.push(...page.posts);
    if (!page.posts.length || tous.length >= page.total) break;
  }
  return new Map(tous.filter((p) => p.slug.startsWith('demo-')).map((p) => [p.slug, p]));
}
async function imagesEnBase() {
  const toutes = [];
  for (let offset = 0; ; offset += 100) {
    const page = await exiger('GET', `/api/backoffice/blog/media?limit=100&offset=${offset}`);
    toutes.push(...page.media);
    if (page.media.length < 100) break;
  }
  return toutes;
}

/* ===== Images de démonstration ===== */
const PALETTE = ['#1f3a5f', '#c9a227', '#7a4e2d', '#2f6b4f', '#8c2f39', '#4b4e6d'];
function dessin(largeur, hauteur, { fond = PALETTE[0], transparent = false, trait = '#111111', etiquette = '' } = {}) {
  const r = Math.min(largeur, hauteur);
  const taille = Math.max(14, Math.round(Math.min(largeur / 16, hauteur / 8)));
  const formes = Array.from({ length: 6 }, (_, i) => {
    const x = ((i + 1) * largeur) / 7;
    const y = hauteur / 2 + Math.sin(i) * (hauteur / 4);
    return i % 2
      ? `<circle cx="${x}" cy="${y}" r="${r / 6}" fill="${transparent ? 'none' : PALETTE[(i + 1) % PALETTE.length]}" stroke="${trait}" stroke-width="${Math.max(2, r / 80)}"/>`
      : `<rect x="${x - r / 8}" y="${y - r / 8}" width="${r / 4}" height="${r / 4}" rx="${r / 40}" fill="${transparent ? 'none' : PALETTE[(i + 2) % PALETTE.length]}" stroke="${trait}" stroke-width="${Math.max(2, r / 80)}"/>`;
  }).join('');
  const texte = (y, contenu, poids) => `<text x="50%" y="${y}" font-family="Helvetica, Arial, sans-serif" font-size="${taille}" font-weight="${poids}" text-anchor="middle" fill="${transparent ? trait : '#ffffff'}" stroke="${transparent ? 'none' : '#000000'}" stroke-width="${transparent ? 0 : taille / 18}" paint-order="stroke">${contenu}</text>`;
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${largeur}" height="${hauteur}">${transparent ? '' : `<rect width="100%" height="100%" fill="${fond}"/>`}${formes}${texte(hauteur / 2 - taille * 0.2, 'Image de démonstration', 700)}${texte(hauteur / 2 + taille * 1.1, `${largeur} × ${hauteur}${etiquette ? ` — ${etiquette}` : ''}`, 400)}</svg>`);
}
/** Bruit pseudo-aléatoire à graine fixe : le même fichier à chaque passage, donc réutilisé. */
function bruitFixe(largeur, hauteur) {
  const octets = Buffer.alloc(largeur * hauteur * 3);
  let graine = 2026;
  for (let i = 0; i < octets.length; i++) {
    graine = (Math.imul(graine, 1664525) + 1013904223) >>> 0;
    octets[i] = 64 + (graine >>> 25);
  }
  return octets;
}
async function jpegLourd() {
  for (const qualite of [92, 88, 84, 80, 75]) {
    const sortie = await sharp(bruitFixe(2600, 1800), { raw: { width: 2600, height: 1800, channels: 3 } }).composite([{ input: dessin(2600, 1800, { transparent: true, trait: '#ffffff', etiquette: 'JPEG lourd' }) }]).jpeg({ quality: qualite }).toBuffer();
    if (sortie.length <= 3.9 * 1024 * 1024) return sortie;
  }
  arreter('impossible de tenir le JPEG lourd sous 3,9 Mio.');
}
const IMAGES = {
  paysage: { fichier: 'demo-paysage-1600x1000.jpg', type: 'image/jpeg', creer: () => sharp(dessin(1600, 1000, { fond: PALETTE[0], etiquette: 'paysage' })).jpeg({ quality: 82 }).toBuffer() },
  large: { fichier: 'demo-tres-large-3200x600.jpg', type: 'image/jpeg', creer: () => sharp(dessin(3200, 600, { fond: PALETTE[3], etiquette: 'très large' })).jpeg({ quality: 82 }).toBuffer() },
  haute: { fichier: 'demo-tres-haute-800x2800.png', type: 'image/png', creer: () => sharp(dessin(800, 2800, { fond: PALETTE[4], etiquette: 'très haute' })).png().toBuffer() },
  petite: { fichier: 'demo-petite-320x200.png', type: 'image/png', creer: () => sharp(dessin(320, 200, { fond: PALETTE[5], etiquette: 'petite' })).png().toBuffer() },
  transparente: { fichier: 'demo-transparente-1200x800.png', type: 'image/png', creer: () => sharp(dessin(1200, 800, { transparent: true, trait: '#111111', etiquette: 'PNG transparent' })).png().toBuffer() },
  webp: { fichier: 'demo-webp-1200x900.webp', type: 'image/webp', creer: () => sharp(dessin(1200, 900, { fond: PALETTE[2], etiquette: 'WebP' })).webp({ quality: 80 }).toBuffer() },
  gif: {
    fichier: 'demo-animee-480x300.gif', type: 'image/gif',
    creer: async () => sharp(await Promise.all([PALETTE[0], PALETTE[3], PALETTE[4]].map((fond, i) => sharp(dessin(480, 300, { fond, etiquette: `GIF ${i + 1}/3` })).png().toBuffer())), { join: { animated: true } }).gif({ delay: 600, loop: 0 }).toBuffer(),
  },
  lourde: { fichier: 'demo-lourde-2600x1800.jpg', type: 'image/jpeg', creer: jpegLourd },
  portrait: { fichier: 'demo-couverture-portrait-800x1400.jpg', type: 'image/jpeg', creer: () => sharp(dessin(800, 1400, { fond: PALETTE[1], trait: '#111111', etiquette: 'portrait' })).jpeg({ quality: 82 }).toBuffer() },
  partage: { fichier: 'demo-partage-1200x630.png', type: 'image/png', creer: () => sharp(dessin(1200, 630, { fond: PALETTE[0], etiquette: 'partage' })).png().toBuffer() },
};
async function televerserImages() {
  const presentes = await imagesEnBase();
  const urls = {};
  for (const [cle, image] of Object.entries(IMAGES)) {
    const octets = await image.creer();
    const deja = presentes.find((m) => m.filename === image.fichier && m.size === octets.length && m.content_type === image.type);
    if (deja) { urls[cle] = deja.url; continue; }
    const cree = await exiger('POST', '/api/backoffice/blog/media', { filename: image.fichier, content_type: image.type, data_base64: octets.toString('base64') });
    urls[cle] = cree.url;
    console.log(`  image ${image.fichier} (${(octets.length / 1024).toFixed(0)} Kio) → ${cree.url}`);
  }
  return urls;
}

/* ===== Petit constructeur de documents Tiptap ===== */
const MARQUES = { g: 'bold', i: 'italic', s: 'strike', u: 'underline', c: 'code' };
/** Texte : typographie française appliquée ; `marques` = 'gi' (gras, italique…) ou objets. */
const t = (texte, ...marques) => texteBrut(typo(texte), ...marques);
function texteBrut(texte, ...marques) {
  const liste = marques.flatMap((m) => (typeof m === 'string' ? [...m].map((l) => ({ type: MARQUES[l] })) : [m]));
  return { type: 'text', text: texte, ...(liste.length ? { marks: liste } : {}) };
}
const lien = (href, attrs = {}) => ({ type: 'link', attrs: { href, ...attrs } });
const enfants = (liste) => liste.map((e) => (typeof e === 'string' ? t(e) : e));
const p = (...c) => ({ type: 'paragraph', content: enfants(c) });
const pa = (textAlign, ...c) => ({ type: 'paragraph', attrs: { textAlign }, content: enfants(c) });
const h = (level, ...c) => ({ type: 'heading', attrs: { level }, content: enfants(c) });
const ha = (level, textAlign, ...c) => ({ type: 'heading', attrs: { level, textAlign }, content: enfants(c) });
const br = () => ({ type: 'hardBreak' });
const hr = () => ({ type: 'horizontalRule' });
const li = (...c) => ({ type: 'listItem', content: c.map((e) => (typeof e === 'string' ? p(e) : e)) });
const ul = (...items) => ({ type: 'bulletList', content: items.map((e) => (typeof e === 'string' ? li(e) : e)) });
const ol = (attrs, ...items) => ({ type: 'orderedList', attrs, content: items.map((e) => (typeof e === 'string' ? li(e) : e)) });
const bq = (...c) => ({ type: 'blockquote', content: c.map((e) => (typeof e === 'string' ? p(e) : e)) });
const code = (language, texte) => ({ type: 'codeBlock', attrs: { language }, content: [{ type: 'text', text: texte }] });
const img = (src, attrs = {}) => ({ type: 'image', attrs: { src, ...Object.fromEntries(Object.entries(attrs).map(([k, v]) => [k, typeof v === 'string' ? typo(v) : v])) } });
const cellule = (type) => (attrs, ...c) => ({ type, attrs: { colspan: 1, rowspan: 1, colwidth: null, ...attrs }, content: c.map((e) => (typeof e === 'string' ? p(e) : e)) });
const td = cellule('tableCell');
const th = cellule('tableHeader');
const tr = (...cellules) => ({ type: 'tableRow', content: cellules.map((e) => (typeof e === 'string' ? td({}, e) : e)) });
const table = (...lignes) => ({ type: 'table', attrs: { class: null }, content: lignes });
const doc = (...c) => ({ type: 'doc', content: c });
const AVERTISSEMENT = () => p(t('Article de démonstration', 'g'), ' généré par l’outil local articles-demo pour vérifier le rendu du blog. Son texte ne parle pour personne et il n’est jamais publié en production.');

/* ===== Textes ===== */
const SUJETS = ['la mesure de la ligne', 'les intertitres', 'les espaces insécables', 'les images et leurs légendes', 'les tableaux', 'le code', 'les citations', 'les listes', 'le contraste de nuit', 'l’impression'];
function paragrapheCourant(n) {
  const sujet = SUJETS[n % SUJETS.length];
  return p(`Paragraphe de démonstration n° ${n + 1}, consacré à ${sujet}. Un texte long sert à juger le confort de lecture : la longueur des lignes, l’interligne, le rythme des paragraphes et la place laissée aux respirations. Sur un téléphone, la colonne doit rester lisible sans zoom ni défilement horizontal ; sur un grand écran, elle ne doit pas s’étirer au point de perdre l’œil en fin de ligne. Ce paragraphe répète volontairement des phrases ordinaires, sans information particulière, pour remplir l’espace comme le ferait un vrai article. Il contient quelques mots plus longs, comme « interopérabilité », « rétrocompatibilité » ou « internationalisation », et des chiffres tabulaires : 1 234, 56,7 % et 2026. La question à se poser en le relisant : la page donne-t-elle envie de continuer ?`);
}
/** Tronque ou complète un texte à `n` caractères exactement (limites du backend). */
function aLaLongueur(texte, n) {
  const caracteres = [...texte];
  if (caracteres.length < n) arreter(`texte trop court pour ${n} caractères : ${caracteres.length}`);
  return caracteres.slice(0, n).join('').replace(/\s$/, '.');
}
const TITRE_LONG = 'Septième titre de cent cinquante caractères environ, pour voir comment un intertitre très long se coupe sur un téléphone et sur un écran large';
const URL_LONGUE = 'https://example.org/demonstration/un-chemin-tres-long-sans-espace-pour-voir-la-coupure/avec-des-segments-encore-plus-longs?parametre=valeur-demo';

/* ===== Les articles ===== */
function articles(I) {
  const commun = { cover_image: null, cover_alt: '', seo_title: '', seo_description: '', canonical_url: null, og_image: null, noindex: false };
  return [
    {
      etat: 'publie',
      ...commun,
      slug: 'demo-titre-tres-long-article-tres-court',
      title: aLaLongueur(typo('Démonstration des bords : un titre de cent soixante caractères, avec un mot de quarante lettres intergouvernementalisationsdemonstration, pour voir l’en-tête, le fil d’Ariane et la carte de la liste quand le titre déborde largement'), 160),
      excerpt: aLaLongueur(typo('Extrait de cinq cents caractères, la limite du backend, pour voir comment la carte de la liste, l’en-tête de l’article et la description de partage se comportent quand l’auteur écrit long. Cet article est aussi très court : un seul paragraphe de cinq mots, aucun titre, aucune image, une canonical externe et l’indexation refusée. Il ne doit donc pas apparaître dans le sitemap, et ses en-têtes doivent porter X-Robots-Tag. Le reste de ce texte comble la limite : démonstration, démonstration, démonstration, démonstration, démonstration, démonstration, démonstration, démonstration, démonstration, démonstration.'), 500),
      tags: ['bords', 'noindex'],
      noindex: true,
      canonical_url: 'https://example.org/demonstration/canonical-externe',
      content: doc(p('Cinq mots, pas un de plus.')),
    },
    {
      etat: 'publie',
      ...commun,
      slug: 'demo-texte-long-typographie',
      title: typo('Démonstration : texte long et typographie française'),
      excerpt: typo('Article de démonstration local : un texte long, des paragraphes alignés, des marques cumulées et des pièges typographiques, pour juger la lecture sur mobile et sur ordinateur.'),
      tags: ['démonstration', 'typographie', 'lecture', 'mise en page', 'mobile', 'ordinateur', 'nuit', 'jour', 'impression', 'accessibilité', 'contraste', 'paragraphes', 'alignement', 'marques', 'liens', 'citations', 'listes', 'espaces insécables', 'apostrophes', 'typographiefrançaiseetmiseenpagedesarticlesdemonstration'.slice(0, 50)],
      cover_image: I.paysage,
      cover_alt: 'Image de démonstration au format paysage, 1 600 × 1 000 pixels, avec des formes géométriques sur fond bleu nuit.',
      seo_title: typo('Démonstration : texte long et typographie'),
      seo_description: typo('Démonstration locale du blog : texte long, alignements, marques cumulées et typographie française, pour vérifier la lecture sur mobile, sur ordinateur, de jour et de nuit.'),
      content: doc(
        AVERTISSEMENT(),
        h(2, 'Une typographie soignée'),
        p('Typographie attendue : l’apostrophe courbe, les guillemets « français » avec leurs espaces, une espace insécable avant les deux-points : avant le point-virgule ; avant le point d’exclamation ! et avant le point d’interrogation ? Les points de suspension… et les tirets — cadratins — complètent la démonstration.'),
        p(texteBrut('Typographie naïve, telle qu\'un auteur pressé la saisit : apostrophe droite, "guillemets anglais", espaces ordinaires avant les signes doubles : ici ; là ! vraiment ? Le rendu ne corrige rien, et un signe peut se retrouver seul en début de ligne sur un écran étroit : regardez la fin de cette phrase très longue qui pousse le deux-points vers le bord droit de la colonne :')),
        p('Mots insécables très longs : anticonstitutionnellement, intergouvernementalisations, et une adresse en clair de plus de cent caractères : ', texteBrut(URL_LONGUE), '.'),
        p('Marques seules : ', t('gras', 'g'), ', ', t('italique', 'i'), ', ', t('souligné', 'u'), ', ', t('barré', 's'), ', ', t('code en ligne', 'c'), ' et ', t('lien vers les projets', lien('/projets')), '. Marques cumulées sur le même texte : ', t('gras, italique, souligné, barré, code et lien', 'giusc', lien('/blog')), '.'),
        p('Motifs de remplacement dans le texte d’auteur : un prix de 5 $$, le motif $& et les motifs $’ et $` doivent sortir tels quels.'),
        p(texteBrut('Les mêmes motifs, saisis avec l\'apostrophe droite : $\' et $& et $$.')),
        p('Un paragraphe avec des retours à la ligne forcés :', br(), 'deuxième ligne,', br(), 'troisième ligne, comme une adresse ou un poème.'),
        pa('left', 'Paragraphe aligné à gauche explicitement (textAlign left).'),
        pa('center', 'Paragraphe centré : utile pour une mention ou une transition, à éviter pour un texte long.'),
        pa('right', 'Paragraphe aligné à droite, par exemple pour une signature.'),
        pa('justify', 'Paragraphe justifié : sur un écran étroit, la justification sans césure crée des rivières d’espaces entre les mots, surtout quand la phrase contient des mots longs comme interopérabilité ou rétrocompatibilité.'),
        { type: 'paragraph', attrs: { textAlign: null }, content: [t('Paragraphe sans alignement (textAlign null).')] },
        hr(),
        h(2, 'Un long texte courant'),
        ...Array.from({ length: 9 }, (_, n) => paragrapheCourant(n)),
        ul('Une liste simple au milieu du texte.', 'Deuxième élément, un peu plus long pour passer à la ligne sur un téléphone et voir l’alignement du retrait.', 'Troisième élément.'),
        bq('Une citation au milieu d’un texte long, en italique et en grand, pour voir la rupture de rythme.'),
        ...Array.from({ length: 9 }, (_, n) => paragrapheCourant(n + 9)),
        h(2, 'Fin du texte long'),
        p('Le texte s’arrête ici. Le temps de lecture affiché en tête découle du nombre de mots, à raison de 220 mots par minute.'),
      ),
    },
    {
      etat: 'publie',
      ...commun,
      slug: 'demo-titres-sommaire-ancres',
      title: typo('Démonstration : titres, ancres et liens'),
      excerpt: typo('Article de démonstration local : dix intertitres de niveaux 2 à 4, un titre centré, un titre très long, des ancres internes et des liens de toutes sortes.'),
      tags: ['démonstration', 'titres', 'ancres', 'liens'],
      og_image: I.partage,
      content: doc(
        AVERTISSEMENT(),
        p('Sommaire à la main, avec des ancres vers les identifiants que le rendu donne aux titres : ', t('aller au titre centré', lien(`#${slugTitre('Troisième titre, centré')}`)), ', ', t('aller au titre long', lien(`#${slugTitre(TITRE_LONG)}`)), ', ', t('aller à la fin', lien(`#${slugTitre('Dixième titre : la fin')}`)), '. Une ancre vers un titre inconnu ne mène nulle part : ', t('ancre morte', lien('#titre-inexistant')), '.'),
        h(2, 'Premier titre de niveau 2'),
        p('Liens internes : ', t('les projets', lien('/projets')), ', ', t('l’article sur le code', lien('/blog/demo-code-blocs')), ', ', t('le blog', lien('/blog', { target: '_self' })), ', ', t('les décisions d’Omnicard', lien('/projets/omnicard#decisions')), ' et ', t('la deuxième page du blog', lien('/blog?page=2')), '.'),
        p('Liens sortants : ', t('un site d’exemple avec un titre', lien('https://example.org/', { title: 'Site d’exemple, ouvert dans un nouvel onglet', target: '_blank', rel: 'noopener noreferrer nofollow', class: 'lien-demo' })), ' et ', t('un autre en http', lien('http://example.com/demo', { target: null, title: null, rel: null, class: null })), '.'),
        h(4, 'Un titre de niveau 4 directement après un niveau 2'),
        p('L’ordre des titres saute un niveau : axe le signale (heading-order).'),
        h(2, 'Deuxième titre de niveau 2'),
        h(3, 'Un titre de niveau 3'),
        p('Texte sous le niveau 3.'),
        h(4, 'Un titre de niveau 4'),
        p('Texte sous le niveau 4.'),
        h(3, 'Un second titre de niveau 3'),
        p('Texte.'),
        ha(2, 'center', 'Troisième titre, centré'),
        p('Le titre ci-dessus est centré (textAlign center).'),
        ha(2, 'right', 'Quatrième titre, aligné à droite'),
        ha(3, 'justify', 'Un titre de niveau 3 justifié, assez long pour passer sur deux lignes et montrer la justification'),
        ha(4, 'left', 'Un titre de niveau 4 aligné à gauche'),
        h(2, 'Cinquième titre', br(), 'avec un retour à la ligne forcé'),
        h(2, 'Sixième titre avec du ', t('code_en_ligne()', 'c'), ' et ', t('un lien', lien('/projets'))),
        h(2, TITRE_LONG),
        h(2, 'Huitième titre'),
        h(3, 'Niveau 3 sous le huitième'),
        h(4, 'Niveau 4 sous le niveau 3'),
        h(2, 'Neuvième titre'),
        p('Texte du neuvième.'),
        h(2, 'Dixième titre : la fin'),
        p('Retour au début : ', t('haut de l’article', lien('#premier-titre-de-niveau-2')), '.'),
      ),
    },
    {
      etat: 'brouillon',
      ...commun,
      slug: 'demo-listes-citations',
      title: typo('Démonstration : listes imbriquées et citations'),
      excerpt: typo('Article de démonstration local, laissé en brouillon : listes sur quatre niveaux, listes numérotées de tous types, éléments riches et citations imbriquées.'),
      tags: ['démonstration', 'listes', 'citations', 'brouillon'],
      cover_image: I.webp,
      cover_alt: 'Image de démonstration au format WebP, 1 200 × 900 pixels.',
      content: doc(
        AVERTISSEMENT(),
        h(2, 'Liste à puces sur quatre niveaux'),
        ul(
          li('Niveau 1, premier élément.', ul(li('Niveau 2.', ul(li('Niveau 3.', ul('Niveau 4, le plus profond.', 'Niveau 4, second élément, plus long pour voir le retrait sur un téléphone étroit.')))))),
          'Niveau 1, second élément.',
        ),
        h(2, 'Listes numérotées'),
        ol({ start: 7, type: null }, 'Commence à 7.', 'Puis 8.', 'Puis 9.'),
        ol({ start: null, type: 'a' }, 'Lettres minuscules.', 'Deuxième.'),
        ol({ start: 1, type: 'A' }, 'Lettres majuscules.', 'Deuxième.'),
        ol({ start: 3, type: 'i' }, 'Chiffres romains minuscules à partir de iii.', 'Suivant.'),
        ol({ start: 1, type: 'I' }, 'Chiffres romains majuscules.', 'Deuxième.'),
        ol({ type: '1' }, 'Type 1 explicite.', 'Deuxième.'),
        h(2, 'Éléments de liste riches'),
        ol({},
          li(p('Un élément à deux paragraphes : voici le premier.'), p('Et voici le second, qui doit garder un écart avec le premier.')),
          li(p('Un élément avec un bloc de code :'), code('bash', 'npm run blog:demo')),
          li(p('Un élément avec une image :'), img(I.petite, { alt: 'Petite image de démonstration, 320 × 200 pixels.', title: 'Petite image dans une liste.' })),
          li(p('Un élément avec une citation :'), bq('Citation dans un élément de liste.')),
          li(p('Un élément avec un tableau :'), table(tr(th({}, 'Clé'), th({}, 'Valeur')), tr('a', '1'))),
        ),
        h(2, 'Citations'),
        bq('Une citation de trois paragraphes : premier paragraphe.', 'Deuxième paragraphe de la même citation.', 'Troisième paragraphe, pour voir l’espacement interne.'),
        bq(p('Une citation qui contient une liste :'), ul('premier point', 'second point')),
        bq(p('Une citation qui en contient une autre :'), bq('La citation imbriquée.')),
        bq(pa('right', 'Une citation alignée à droite.')),
        bq(h(3, 'Un titre dans une citation'), p('Le schéma l’admet.')),
      ),
    },
    {
      etat: 'publie',
      ...commun,
      slug: 'demo-code-blocs',
      title: 'Démonstration\u00a0: code, motifs $$, $& et $\' dans un titre',
      excerpt: typo('Article de démonstration local : code en ligne, blocs de code de plusieurs langages, une ligne très longue, un bloc de deux cents lignes et des motifs $$ qui piègent les remplacements.'),
      tags: ['démonstration', 'code', 'bash', 'rust', 'json'],
      content: doc(
        AVERTISSEMENT(),
        p('Du ', t('code en ligne', 'c'), ' dans un paragraphe, puis ', t('du code dans un lien', 'c', lien('/blog/demo-tableaux')), ' et un nom très long : ', t('une_fonction_au_nom_particulierement_long_pour_voir_la_coupure()', 'c'), '.'),
        h(2, 'Un intertitre avec ', t('fn main()', 'c')),
        h(3, 'Rust'),
        code('rust', 'fn main() {\n    let message = "Bonjour depuis une démonstration";\n    for (i, mot) in message.split(\' \').enumerate() {\n        println!("{i}: {mot}");\n    }\n}'),
        h(3, 'Bash et ses dollars'),
        code('bash', '#!/usr/bin/env bash\nIFS=$\'\\n\'\necho "PID : $$"\necho "Motif : $&"\necho "Avant : $`"\nprintf \'%s\\n\' "$@"\nprix=5; echo "Total : ${prix} $$"'),
        h(3, 'JSON avec une ligne de quatre cents caractères'),
        code('json', `{\n  "titre": "démonstration",\n  "ligne_longue": "${'abcdefghij'.repeat(38)}",\n  "liste": [1, 2, 3]\n}`),
        h(3, 'HTML qui doit rester du texte'),
        code('html', '<!doctype html>\n<script>alert(1)</script>\n<img src=x onerror="alert(2)">\n<p class="x">Paragraphe & entité &amp;</p>'),
        h(3, 'Sans langage, avec des tabulations'),
        code(null, 'colonne1\tcolonne2\tcolonne3\n\tretrait par tabulation\n\t\tdouble tabulation'),
        h(3, 'Deux cents lignes'),
        code('text', Array.from({ length: 200 }, (_, i) => `ligne ${String(i + 1).padStart(3, '0')} : contenu de démonstration`).join('\n')),
        h(2, 'Code dans un tableau et dans une liste'),
        table(tr(th({}, 'Commande'), th({}, 'Effet')), tr(td({}, p(t('npm run blog:demo', 'c'))), td({}, 'crée les articles')), tr(td({}, code('bash', 'npm run blog:demo -- --nettoyer')), td({}, 'retire les articles et leurs images'))),
        ul(li(p('Un élément avec du code :'), code('rust', 'let x = 42;'))),
      ),
    },
    {
      etat: 'publie',
      ...commun,
      slug: 'demo-tableaux',
      title: typo('Démonstration : tableaux simples, larges et alignés'),
      excerpt: typo('Article de démonstration local : un tableau simple, un tableau de douze colonnes, des largeurs fixées, des fusions de cellules, des alignements et des cellules riches.'),
      tags: ['démonstration', 'tableaux'],
      cover_image: I.large,
      cover_alt: 'Image de démonstration très large, 3 200 × 600 pixels, en bandeau.',
      content: doc(
        AVERTISSEMENT(),
        h(2, 'Tableau simple'),
        table(tr(th({}, 'Colonne A'), th({}, 'Colonne B'), th({}, 'Colonne C')), tr('a1', 'b1', 'c1'), tr('a2', 'b2', 'c2')),
        h(2, 'Douze colonnes de texte long'),
        table(
          tr(...Array.from({ length: 12 }, (_, i) => th({}, `En-tête de colonne ${i + 1}`))),
          tr(...Array.from({ length: 12 }, (_, i) => td({}, `Texte de cellule assez long numéro ${i + 1}`))),
          tr(...Array.from({ length: 12 }, (_, i) => td({}, `motsansespace${'x'.repeat(10)}${i + 1}`))),
        ),
        h(2, 'Les mêmes, avec des largeurs fixées (colwidth)'),
        table(
          tr(...Array.from({ length: 12 }, (_, i) => th({ colwidth: [160] }, `En-tête de colonne ${i + 1}`))),
          tr(...Array.from({ length: 12 }, (_, i) => td({ colwidth: [160] }, `Texte de cellule assez long numéro ${i + 1}`))),
        ),
        h(2, 'Fusions de cellules'),
        table(
          tr(th({ colspan: 2 }, 'Deux colonnes fusionnées'), th({}, 'Seule')),
          tr(td({ rowspan: 2 }, 'Deux lignes fusionnées'), 'b2', 'c2'),
          tr('b3', 'c3'),
        ),
        h(2, 'Alignements de cellules'),
        table(
          tr(th({ align: 'left' }, 'Libellé'), th({ align: 'right' }, 'Montant'), th({ align: 'center' }, 'État'), th({ align: 'justify' }, 'Note')),
          tr(td({ align: 'left' }, 'Ligne courte'), td({ align: 'right' }, '1 234,50'), td({ align: 'center' }, 'oui'), td({ align: 'justify' }, 'Une note justifiée assez longue pour passer sur plusieurs lignes dans la cellule.')),
          tr(td({ align: null }, 'Ligne longue'), td({ align: 'right' }, '12,00'), td({ align: 'center' }, 'non'), td({}, 'Courte.')),
        ),
        h(2, 'Colonne d’en-tête'),
        table(tr(th({}, 'Ligne 1'), '10', '20'), tr(th({}, 'Ligne 2'), '30', '40')),
        h(2, 'Cellules riches'),
        table(
          tr(th({}, 'Contenu'), th({}, 'Exemple')),
          tr(td({}, 'Liste'), td({}, ul('un', 'deux'))),
          tr(td({}, 'Deux paragraphes'), td({}, p('Premier paragraphe.'), p('Second paragraphe.'))),
          tr(td({}, 'Image'), td({}, img(I.petite, { alt: 'Petite image de démonstration dans une cellule.', title: 'Légende dans une cellule.' }))),
          tr(td({}, 'Code'), td({}, p(t('let x = 1;', 'c')))),
        ),
      ),
    },
    {
      etat: 'programme',
      ...commun,
      slug: 'demo-programme',
      title: typo('Démonstration : article programmé'),
      excerpt: typo('Article de démonstration local, programmé dans le futur : sa version figée paraît à l’échéance, sans la retouche faite après la programmation.'),
      tags: ['démonstration', 'programmation'],
      cover_image: I.gif,
      cover_alt: 'Image animée de démonstration, 480 × 300 pixels.',
      content: doc(
        AVERTISSEMENT(),
        h(2, 'Version programmée'),
        p('Cette phrase appartient à la version figée au moment de la programmation.'),
        img(I.paysage, { alt: 'Image de démonstration au format paysage.', title: 'Elle ne doit pas être publique avant l’échéance.' }),
      ),
      retouche: p(t('Retouche faite après la programmation : elle ne doit pas paraître dans la version publique.', 'g')),
    },
    {
      etat: 'publie',
      ...commun,
      slug: 'demo-images-legendes',
      title: typo('Démonstration : images extrêmes, légendes et descriptions'),
      excerpt: typo('Article de démonstration local : couverture en portrait, image de partage distincte, images très larges, très hautes, petites, transparentes, animées et lourdes, avec ou sans légende.'),
      tags: ['démonstration', 'images', 'légendes'],
      cover_image: I.portrait,
      cover_alt: typo('Image de démonstration en portrait, 800 × 1 400 pixels, sur fond doré, avec des formes géométriques et la mention « Image de démonstration ». Cette description atteint la limite de trois cents caractères pour voir comment elle se comporte dans les métadonnées de partage et en lecture.').slice(0, 300),
      og_image: I.partage,
      content: doc(
        AVERTISSEMENT(),
        h(2, 'Formats'),
        img(I.paysage, { alt: 'Image de démonstration au format paysage, 1 600 × 1 000 pixels.', title: 'Paysage 1 600 × 1 000, en JPEG, sans dimensions déclarées.' }),
        img(I.large, { alt: 'Image de démonstration très large, 3 200 × 600 pixels.', title: 'Très large 3 200 × 600 : un panorama devient un fil sur un téléphone.', width: 3200, height: 600 }),
        img(I.haute, { alt: 'Image de démonstration très haute, 800 × 2 800 pixels.', title: 'Très haute 800 × 2 800 en PNG : plafonnée à 800 pixels de haut.' }),
        img(I.petite, { alt: 'Petite image de démonstration, 320 × 200 pixels.', title: 'Petite 320 × 200, sans largeur déclarée : étirée à la largeur du texte ?' }),
        img(I.petite, { alt: 'Petite image de démonstration affichée à 160 pixels de large.', title: 'Petite image avec width 160.', width: 160 }),
        img(I.transparente, { alt: 'Dessin de démonstration au trait noir sur fond transparent.', title: 'PNG transparent au trait noir : lisible la nuit ?' }),
        img(I.gif, { alt: 'Image animée de démonstration en trois couleurs.', title: 'GIF animé : insensible au mouvement réduit ?' }),
        img(I.webp, { alt: 'Image de démonstration en WebP.', title: 'WebP 1 200 × 900.', width: 1200, height: 900 }),
        img(I.lourde, { alt: 'Image de démonstration lourde, bruit photographique, 2 600 × 1 800 pixels.', title: 'JPEG proche de 3,9 Mio : le budget de 1,5 Mo par page à 390 pixels tient-il ?' }),
        h(2, 'Légendes et descriptions'),
        img(I.paysage, { alt: 'Image de démonstration sans légende.', title: null }),
        img(I.webp, { alt: 'Image de démonstration avec une légende de trois cents caractères.', title: typo('Légende de trois cents caractères : elle s’étend sur plusieurs lignes et doit rester lisible, de jour comme de nuit, sur un téléphone comme sur un grand écran. Elle sert aussi à vérifier le contraste de la couleur éteinte et la taille du texte des légendes, qui sont les plus petites du site.').slice(0, 300) }),
        img(I.petite, { title: 'Image sans attribut alt : le backend l’accepte, le rendu pose alt vide.' }),
        img(I.paysage, { alt: 'Image de démonstration avec largeur et hauteur.', title: 'Largeur et hauteur déclarées (1 600 × 1 000).', width: 1600, height: 1000 }),
        img(I.paysage, { alt: 'Image de démonstration avec seulement une hauteur.', title: 'Hauteur seule (300) : déformée ?', height: 300 }),
        h(2, 'Images dans d’autres blocs'),
        bq(p('Une image dans une citation :'), img(I.petite, { alt: 'Petite image dans une citation.', title: 'Dans une citation.' })),
        ul(li(p('Une image dans une liste :'), img(I.transparente, { alt: 'Dessin transparent dans une liste.', title: 'Dans une liste.' }))),
        table(tr(th({}, 'Image'), th({}, 'Commentaire')), tr(td({}, img(I.webp, { alt: 'Image WebP dans une cellule.', title: 'Dans une cellule.' })), td({}, 'Une image dans une cellule de tableau.'))),
      ),
    },
  ];
}

/* ===== Couverture du schéma admis ===== */
const NOEUDS = ['doc', 'paragraph', 'text', 'heading', 'bulletList', 'orderedList', 'listItem', 'blockquote', 'codeBlock', 'hardBreak', 'horizontalRule', 'image', 'table', 'tableRow', 'tableCell', 'tableHeader'];
const MARQUES_ADMISES = ['bold', 'italic', 'strike', 'underline', 'code', 'link'];
const ATTRIBUTS = ['paragraph.textAlign', 'heading.textAlign', 'heading.level', 'orderedList.start', 'orderedList.type', 'codeBlock.language', 'image.src', 'image.alt', 'image.title', 'image.width', 'image.height', 'tableCell.align', 'tableHeader.align', 'tableCell.colspan', 'tableHeader.colspan', 'tableCell.rowspan', 'tableCell.colwidth', 'tableHeader.colwidth', 'table.class', 'link.href', 'link.target', 'link.title', 'link.rel', 'link.class'];
function verifierCouverture(liste) {
  const vus = new Set();
  const parcourir = (n) => {
    vus.add(n.type);
    for (const cle of Object.keys(n.attrs ?? {})) vus.add(`${n.type}.${cle}`);
    for (const m of n.marks ?? []) { vus.add(`marque:${m.type}`); for (const cle of Object.keys(m.attrs ?? {})) vus.add(`${m.type}.${cle}`); }
    (n.content ?? []).forEach(parcourir);
  };
  liste.forEach((a) => parcourir(a.content));
  const manque = [...NOEUDS, ...MARQUES_ADMISES.map((m) => `marque:${m}`), ...ATTRIBUTS].filter((x) => !vus.has(x));
  if (manque.length) arreter(`la démonstration ne couvre pas : ${manque.join(', ')}`);
}

/* ===== Essais que la validation doit refuser ===== */
async function essais() {
  const base = (slug, content) => ({ title: 'Essai refusé', slug, excerpt: 'Essai.', content, tags: [], cover_image: null, cover_alt: '', seo_title: '', seo_description: '', canonical_url: null, og_image: null, noindex: true });
  const cas = [
    ['lien mailto:', doc(p(t('écrire', lien('mailto:demo@example.test'))))],
    ['lien interne avec un paramètre non sûr (/blog?page=<2>)', doc(p(t('lien', lien('/blog?page=<2>'))))],
    ['ancre vide (#)', doc(p(t('lien', lien('#'))))],
    ['texte avec \\r\\n (copier-coller Windows)', doc(p(texteBrut('ligne 1\r\nligne 2')))],
    ['image /images/… (existe dans public/)', doc(img('/images/charles.webp', { alt: 'x' }))],
    ['image /og/… (existe dans public/)', doc(img('/og/accueil.png', { alt: 'x' }))],
    ['image /assets/… (aucun dossier servi)', doc(img('/assets/demo/inexistante.png', { alt: 'x' }))],
    ['image /api/blog/media/ inconnue', doc(img('/api/blog/media/999999', { alt: 'x' }))],
    ['titre de niveau 1', doc({ type: 'heading', attrs: { level: 1 }, content: [t('H1')] })],
  ];
  console.log('Essais de validation (attendus : refus) :');
  for (const [nom, contenu] of cas) {
    const r = await api('POST', '/api/backoffice/blog/posts', base('demo-essai-refuse', contenu));
    if (r.status < 400) {
      console.log(`  ACCEPTÉ  ${nom}`);
      await api('DELETE', `/api/backoffice/blog/posts/${r.json.id}`, { revision: r.json.revision });
    } else console.log(`  refusé   ${nom} → ${r.status} ${r.json?.code ?? ''} « ${r.json?.message ?? ''} »`);
  }
  const svg = await api('POST', '/api/backoffice/blog/media', { filename: 'demo-essai.svg', content_type: 'image/svg+xml', data_base64: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>').toString('base64') });
  console.log(`  ${svg.status < 400 ? 'ACCEPTÉ ' : 'refusé  '} image SVG → ${svg.status} ${svg.json?.code ?? ''}`);
}

/* ===== Nettoyage ===== */
async function nettoyer() {
  const existants = await articlesDemo();
  for (const post of existants.values()) {
    await exiger('DELETE', `/api/backoffice/blog/posts/${post.id}`, { revision: post.revision });
    console.log(`  article ${post.slug} supprimé`);
  }
  let supprimees = 0; let citees = 0;
  for (const m of (await imagesEnBase()).filter((media) => media.filename.startsWith('demo-'))) {
    const r = await api('DELETE', `/api/backoffice/blog/media/${m.id}`, {});
    if (r.status === 409 && r.json?.code === 'MEDIA_IN_USE') citees += 1;
    else if (r.status >= 400) arreter(`DELETE ${m.url} → ${r.status} ${JSON.stringify(r.json)}`);
    else supprimees += 1;
  }
  console.log(`  ${supprimees} image(s) demo-* supprimée(s)${citees ? `, ${citees} laissée(s) : un autre article les cite` : ''}`);
}

/* ===== Création ou mise à jour ===== */
async function appliquer(article, existant) {
  const { etat, retouche, ...champs } = article;
  let post = existant
    ? await exiger('PUT', `/api/backoffice/blog/posts/${existant.id}`, { ...champs, revision: existant.revision })
    : await exiger('POST', '/api/backoffice/blog/posts', champs);
  if (etat === 'publie') post = await exiger('POST', `/api/backoffice/blog/posts/${post.id}/publish`, { revision: post.revision });
  if (etat !== 'publie' && post.status !== 'draft') post = await exiger('POST', `/api/backoffice/blog/posts/${post.id}/unpublish`, { revision: post.revision });
  if (etat === 'programme') {
    const echeance = Math.floor(Date.now() / 1000) + Math.round(PROGRAMMER_DANS * 60);
    post = await exiger('POST', `/api/backoffice/blog/posts/${post.id}/schedule`, { revision: post.revision, scheduled_at: echeance });
    if (retouche) post = await exiger('PUT', `/api/backoffice/blog/posts/${post.id}`, { ...champs, content: { ...champs.content, content: [...champs.content.content, retouche] }, revision: post.revision });
    console.log(`  ${post.slug} programmé pour ${new Date(echeance * 1000).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })} (id ${post.id}), retouché ensuite`);
    return;
  }
  console.log(`  ${post.slug} ${etat === 'publie' ? 'publié' : 'laissé en brouillon'} (id ${post.id}, aperçu : /api/backoffice/blog/preview/${post.id})`);
}

await connecter();
console.log(`Backend ${cible.origin} (APP_ENV=development, session ouverte sans 2FA).`);
if (NETTOYER) {
  await nettoyer();
} else {
  const urls = await televerserImages();
  const liste = articles(urls);
  verifierCouverture(liste);
  await essais();
  const existants = await articlesDemo();
  console.log('Articles :');
  for (const article of liste) await appliquer(article, existants.get(article.slug));
  console.log('Fait. Rendu réel : npm run build, puis npm run serve et /blog.');
}
