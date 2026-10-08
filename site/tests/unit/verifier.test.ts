import { describe, expect, it } from 'vitest';
import { analyser, fautesTypo } from '../../tools/verifier-site.mjs';

describe('vérificateur du site : typographie', () => {
  it('refuse l’apostrophe droite et l’espace ordinaire avant les signes doubles', () => {
    const fautes: string[] = fautesTypo("L'origine : le « jeu »");
    expect(fautes.some((f) => f.startsWith('apostrophe droite'))).toBe(true);
    expect(fautes.filter((f) => f.startsWith('espace ordinaire avant')).length).toBe(2);
    expect(fautes.some((f) => f.startsWith('espace ordinaire après'))).toBe(true);
  });

  it('accepte un texte composé correctement', () => {
    expect(fautesTypo('L’origine : le « jeu »')).toEqual([]);
  });
});

describe('vérificateur du site : lecture d’une page', () => {
  const page = analyser(`<!doctype html><html lang="fr"><head>
    <title>Titre</title><meta name="description" content="Desc">
    <script type="application/ld+json">{"@type":"Person"}</script>
    <script>alert(1)</script>
    </head><body onload="x()"><h1>Un</h1><h3>Saut</h3>
    <a href="#absente">lien</a><img src="/a.png">
    <svg><title>Figure</title><text>l'axe</text></svg>
    <p>Texte lu, avec l'apostrophe.</p><code>l'exemple</code></body></html>`);

  it('relève les scripts en ligne, les gestionnaires et les titres', () => {
    expect(page.enLigne).toEqual(['alert(1)']);
    expect(page.jsonLd).toHaveLength(1);
    expect(page.gestionnaires).toEqual(['<body onload>']);
    expect(page.titres).toEqual(['Titre']);
    expect(page.niveaux).toEqual([1, 3]);
  });

  it('ne lit comme texte ni les figures, ni le code', () => {
    expect(page.texte).toContain('Texte lu');
    expect(page.texte).not.toContain('l\'axe');
    expect(page.texte).not.toContain('l\'exemple');
  });
});
