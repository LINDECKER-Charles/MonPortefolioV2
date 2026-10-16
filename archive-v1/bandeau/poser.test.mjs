/**
 * La pose du bandeau dans les sources de la V1 : une fois, au bon endroit, et
 * jamais en silence quand le gabarit ne ressemble pas à ce qui est attendu.
 * Lancement : node --test archive-v1/bandeau/poser.test.mjs
 */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, test } from 'node:test';
import { fileURLToPath } from 'node:url';

const POSER = fileURLToPath(new URL('./poser.mjs', import.meta.url));
const GABARIT_V1 = `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
  </head>
  <body>
    <app-root></app-root>
  </body>
</html>
`;

/** L’extrait de scripts/gen-env.mjs de la V1 (commit figé) qui écrit le robots.txt. */
const GENERATEUR_V1 = `const robots = \`User-agent: *
Allow: /

Host: \${siteUrl}
Sitemap: \${siteUrl}/sitemap.xml
\`;
writeFileSync(join(frontDir, 'public', 'robots.txt'), robots);
`;

const dossiers = [];
function sources(gabarit = GABARIT_V1, generateur = GENERATEUR_V1) {
  const dossier = mkdtempSync(path.join(tmpdir(), 'archive-v1-'));
  dossiers.push(dossier);
  mkdirSync(path.join(dossier, 'src'));
  mkdirSync(path.join(dossier, 'public'));
  mkdirSync(path.join(dossier, 'scripts'));
  writeFileSync(path.join(dossier, 'src', 'index.html'), gabarit);
  writeFileSync(path.join(dossier, 'scripts', 'gen-env.mjs'), generateur);
  return dossier;
}
const poser = (dossier) => execFileSync(process.execPath, [POSER, dossier], { encoding: 'utf8', stdio: 'pipe' });

afterEach(() => {
  for (const dossier of dossiers.splice(0)) rmSync(dossier, { recursive: true, force: true });
});

describe('bandeau de l’archive', () => {
  test('est posé une fois, hors de <app-root>, avec sa feuille de style', () => {
    const dossier = sources();
    poser(dossier);
    const html = readFileSync(path.join(dossier, 'src', 'index.html'), 'utf8');
    assert.equal(html.match(/class="archive-bandeau"/g)?.length, 1);
    assert.ok(html.indexOf('class="archive-bandeau"') < html.indexOf('<app-root>'));
    assert.ok(html.indexOf('archive-bandeau.css') < html.indexOf('</head>'));
    assert.match(html, /href="https:\/\/charles-lindecker\.com\/"/);
    assert.ok(existsSync(path.join(dossier, 'public', 'archive-bandeau.css')));
  });

  test('retire du robots.txt le sitemap et la directive Host, sans fermer l’exploration', () => {
    const dossier = sources();
    poser(dossier);
    const generateur = readFileSync(path.join(dossier, 'scripts', 'gen-env.mjs'), 'utf8');
    assert.match(generateur, /const robots = `User-agent: \*\nAllow: \/\n`;/);
    assert.doesNotMatch(generateur, /Sitemap|Host/);
  });

  test('refuse un générateur dont le robots.txt a changé', () => {
    assert.throws(() => poser(sources(GABARIT_V1, 'const robots = `User-agent: *\nDisallow: /\n`;\n')), /robots\.txt de la V1 introuvable/);
  });

  test('refuse d’être posé deux fois', () => {
    const dossier = sources();
    poser(dossier);
    assert.throws(() => poser(dossier), /déjà posé/);
  });

  test('refuse un gabarit sans <body> unique', () => {
    assert.throws(() => poser(sources(GABARIT_V1.replace(/<\/?body>/g, ''))), /une seule balise <body>/);
  });

  test('refuse un dossier qui n’est pas celui de la V1', () => {
    assert.throws(() => poser(path.join(tmpdir(), 'dossier-absent-archive-v1')), /gabarit introuvable/);
  });
});
