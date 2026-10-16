#!/usr/bin/env node
/**
 * Pose le bandeau « archive » dans les sources de la V1, juste avant leur
 * construction par la CI (.github/workflows/archive-v1.yml).
 *
 * Usage : node archive-v1/bandeau/poser.mjs <dossier front-portfolio de la V1>
 *
 * Le point d'insertion est le gabarit `src/index.html` d'Angular : toutes les
 * pages prérendues, le rendu serveur et le rendu client en dérivent. Le bandeau
 * est placé hors de `<app-root>`, que l'hydratation d'Angular ne touche pas.
 * Sa feuille de style est copiée dans `public/`, servie à la racine du site.
 *
 * Le robots.txt, écrit à la construction par `scripts/gen-env.mjs`, perd son
 * sitemap et sa directive `Host` (propre à Yandex, abandonnée) : l’archive,
 * hors index, n’a aucune page à proposer aux robots. L’exploration reste
 * ouverte, pour qu’ils lisent l’en-tête noindex.
 *
 * Le dépôt de la V1 n'est jamais modifié : seule la copie extraite par la CI,
 * figée sur un commit, l'est. Toute surprise (gabarit introuvable, `<body>`
 * absent ou en double, bandeau déjà posé) arrête la construction plutôt que de
 * publier une archive sans bandeau.
 */
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const FEUILLE = 'archive-bandeau.css';
const SITE_ACTUEL = 'https://charles-lindecker.com/';

const BANDEAU = [
  '<aside class="archive-bandeau" lang="fr" aria-label="Version archivée">',
  '  <p class="archive-bandeau__texte">Archive de la première version de mon portfolio.',
  `    <a class="archive-bandeau__lien" href="${SITE_ACTUEL}">Voir le site actuel&nbsp;↗</a></p>`,
  '</aside>',
].join('\n');

function arreter(message) {
  console.error(`[bandeau] ${message}`);
  process.exit(1);
}

/** Les lignes du robots.txt de la V1 après « Allow: / », telles que les écrit son générateur. */
const ROBOTS_V1 = 'Allow: /\n\nHost: ${siteUrl}\nSitemap: ${siteUrl}/sitemap.xml\n';
const ROBOTS_ARCHIVE = 'Allow: /\n';

const dossier = process.argv[2];
if (!dossier) arreter('dossier front-portfolio de la V1 attendu en argument.');

const gabarit = path.join(dossier, 'src', 'index.html');
const publics = path.join(dossier, 'public');
const generateur = path.join(dossier, 'scripts', 'gen-env.mjs');
if (!existsSync(gabarit)) arreter(`gabarit introuvable : ${gabarit}`);
if (!existsSync(publics)) arreter(`dossier public introuvable : ${publics}`);

let html = readFileSync(gabarit, 'utf8');
if (html.includes('archive-bandeau')) arreter('le bandeau est déjà posé dans ce gabarit.');
if (!existsSync(generateur)) arreter(`générateur du robots.txt introuvable : ${generateur}`);
const generation = readFileSync(generateur, 'utf8');
if (generation.split(ROBOTS_V1).length !== 2) arreter(`robots.txt de la V1 introuvable ou en double dans ${generateur}.`);

const corps = html.match(/<body(\s[^>]*)?>/g) ?? [];
if (corps.length !== 1) arreter(`une seule balise <body> attendue, ${corps.length} trouvée(s).`);
const fermeture = html.match(/<\/head>/g) ?? [];
if (fermeture.length !== 1) arreter(`une seule balise </head> attendue, ${fermeture.length} trouvée(s).`);

html = html
  .replace('</head>', `  <link rel="stylesheet" href="/${FEUILLE}" />\n  </head>`)
  .replace(corps[0], `${corps[0]}\n${BANDEAU}`);
writeFileSync(gabarit, html);
copyFileSync(path.join(ICI, FEUILLE), path.join(publics, FEUILLE));
writeFileSync(generateur, generation.replace(ROBOTS_V1, ROBOTS_ARCHIVE));

console.log(`[bandeau] posé dans ${gabarit}, feuille copiée dans ${path.join(publics, FEUILLE)}, robots.txt sans sitemap`);
