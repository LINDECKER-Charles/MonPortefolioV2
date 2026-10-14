# Masters générés — série « league-of-database »

Production du 2026-10-13 : versions de jour et de nuit, à partir des fiches de [la commande](../../../../docs/visuels-a-generer.md) et des ajustements validés par Charles. Les versions de nuit sont des éditions du master de jour ; aucune n’a été produite comme une nouvelle scène indépendante.

Les PNG sont les masters. Aucun calque WebP n’a été généré et aucune commande du site n’a été lancée pour cette production. Le recalage local des lanternes a été autorisé par Charles le même jour.

## Références jointes

Dans cet ordre pour la génération du jour ; pour les éditions, l’image à éditer précède ces quatre références :

1. [Livre-lanterne illustré](../../marque/livre-lanterne/logo-illustre.png).
2. [Symbole de marque](../../../../site/src/assets/marque/logo-symbole.webp).
3. [ACC-14](../../../../site/src/assets/visuels/accueil/ACC-14.svg), rasterisé en PNG pour l’outil.
4. [GLO-03](../../../../site/src/assets/visuels/global/GLO-03.svg), rasterisé en PNG pour l’outil.

Le modèle de cage est repris ; les couleurs, rayons et halos des références sont exclus par les prompts. Les guides bleus de placement utilisés pour certaines corrections sont des documents de travail, absents des masters.

## Provenance

Outil : `image_gen.imagegen` intégré. Les noms `exec-….png` ci-dessous identifient les sorties natives, avant les opérations locales éventuelles. Pas de photographie ni de capture de jeu. Les prompts anglais complets, y compris style, phrase de fond et prompt négatif, sont archivés plus bas.

| Fichier | Prompt | Date | Sortie native |
|---|---|---|---|
| [LOD-02.png](LOD-02.png) | [Jour](#lod-02--jour) | 2026-10-13 | `exec-8851adae-4f26-4ed3-801b-318e9fff0f61.png` |
| [LOD-02.nuit.png](LOD-02.nuit.png) | [Édition de nuit](#lod-02--nuit) | 2026-10-13 | `exec-cbcb099d-3429-466f-81b7-179b2dd74819.png` |
| [LOD-04.png](LOD-04.png) | [Jour](#lod-04--jour) | 2026-10-13 | `exec-c60812c7-7aaf-4e52-9def-bc091e0a5fbd.png` |
| [LOD-04.nuit.png](LOD-04.nuit.png) | [Édition de nuit](#lod-04--nuit) | 2026-10-13 | `exec-e7e37f74-e370-4ecf-a41a-4378119f2376.png` |

## Contrôles

Les coordonnées sont mesurées depuis le coin supérieur gauche jusqu’au centre de la flamme. Le contrôle associe superposition d’une croix et d’une boîte de tolérance de ±3 points de pourcentage, composantes rouges et inspection visuelle. Le pourcentage de noir porte sur les pixels opaques (alpha ≥250) dont les trois canaux sont ≤32/255 ; la transparence n’est pas comptée comme du noir.

| ID | Canvas final commun jour/nuit | Cible | Jour mesuré | Nuit mesurée | Noir nuit |
|---|---|---|---|---|---|
| LOD-02 | 1916 × 821 | 18,00 % × 80,00 % | 20,40 % × 80,40 % | 20,49 % × 78,86 % | 74,73 % |
| LOD-04 | 1672 × 941 | 64,00 % × 40,00 % | 64,48 % × 42,44 % | 64,39 % × 42,59 % | 94,69 % |

Les 16 lanternes visibles de ce lot respectent la tolérance de position ; OMN-01 et BLR-05 placent la lanterne hors champ conformément à leurs fiches. Tous les fonds transparents le restent. Les marges de noir nocturnes dépassent 70 % selon la mesure ci-dessus.

Les sorties conservent des valeurs intermédiaires sur les contours et les surfaces issues du générateur : elles ne constituent donc pas une palette indexée strictement limitée aux trois codes hexadécimaux. Aucune quantification globale n’a été appliquée. Les ratios sont ceux demandés à l’arrondi natif près (écart relatif maximal de 0,161 % pour ce lot). Les dimensions jour/nuit sont identiques après les corrections de bord décrites ci-dessous ; le modèle a toutefois redessiné certains contours pendant l’édition nocturne. L’identité géométrique de chaque trait au pixel près n’est pas garantie.

## Opérations locales après génération

Translations sous masque de la lanterne complète et raccord du fond proche, sans déplacement du canvas ni des autres objets. Les corrections de bord des nuits ajoutent ou retirent uniquement 1–2 pixels sur les bords droit/bas, sans redimensionner la scène. Aucun changement global de palette.

| Fichier | Opération |
|---|---|
| LOD-02.png | aucune |
| LOD-02.nuit.png | 1915 × 821 → 1916 × 821 px par bord droit/bas, sans mise à l’échelle |
| LOD-04.png | translation (0, -23) px ; fond local blanc jour / noir nuit |
| LOD-04.nuit.png | translation (0, -23) px ; fond local blanc jour / noir nuit ; 1671 × 941 → 1672 × 941 px par bord droit/bas, sans mise à l’échelle |

## LOD-02 — jour

Prompt initial, références communes jointes :

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.
Transparent background: nothing is drawn outside the subject.
Use case: illustration-story. Subject and composition: A stylized hourglass seen frontally occupying only the left third of the canvas, centered horizontally at 18 percent canvas width. Sand represented by a few simple geometric dots and diamonds. A small lantern at foot illuminates lower bulb. The entire right two thirds must be empty fully transparent. Simple minimal silhouettes and no tiny texture.
Canvas EXACT 2100 x 900 pixels, aspect ratio 2100:900. Camera consistent with sober book wood engraving, horizon at two thirds where visible. Main cut lines about 3px at 1600px width, shadow hatches about 1px, sparse, no texture elsewhere. All objects stay within generous canvas margin. Light source anchor: center of red lantern flame at exactly x=18% of total canvas width and y=80% of total canvas height, measured from upper-left. Place the flame at that coordinate, not lantern top or base.
References 1-2 are lantern model only, ignore their colours, book, glow. References 3-4 define simplified cage geometry; omit their rays. Only black, white and pure red. Keep white paper absolutely clean and solid areas absolutely flat. No speckle, no paper grain. Simplified silhouettes, half the usual detail. No text-like strokes even on blank pages.
Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
Final direction: extremely SPARSE woodcut. At least half of object surfaces untouched white, shadows SOLID black. At most 20 short hatch strokes total. No uniform surface texture. The lantern is small and centered on its specified flame anchor.
```

## LOD-02 — nuit

Édition du jour livré avant recalage local éventuel, avec le jour en première référence puis les quatre références communes.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.
Transparent background: nothing is drawn outside the subject.
Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.
Use case: lighting-weather EDIT. IMAGE 1 IS THE DAY MASTER TO EDIT. Images 2-5 are supporting lantern geometry references only, not layouts. Keep EXACT 1916x821 pixel canvas, every object silhouette, lantern position, framing, crop and perspective unchanged. Do not zoom, shift, add or delete objects. Change ONLY ink coverage and illumination. Replace broad white surfaces with solid black; leave a few thin white contours. At least 80 percent of opaque subject pixels must be pure #000000 black. Every transparent pixel outside subject stays transparent; do not fill the canvas. The flame is pure red, a small red hatch pool illuminates the principal subject. No gradients, no rays, no halo.   Use fewer lines than day; shadows entirely black, no large white fills. Limit whites to thin outlines. No paper grain.
Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

Empreintes SHA-256 des masters livrés :

- `LOD-02.png` : `a67fa41639fea2651093d57f94b2189b844f2159a99b471d4ce935fada538176`.
- `LOD-02.nuit.png` : `fbac4cbe19ba6cf81a8a1de8dc5ee35b896a064b59c8403bc6e94f47b6e770e6`.

## LOD-04 — jour

Prompt initial, références communes jointes :

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.
The scene fills the frame edge to edge; empty areas are white paper.
Use case: illustration-story. Subject and composition: Horizontal cutaway of a train. At left, a detached old engine with three unequal gears rests dark on the platform. At right, a new engine with two gears is already coupled. Center, a carriage whose two faceless silhouette passengers remain seated. One lantern hanging between carriage and new engine illuminates the coupling only. Entire train and platform fit inside margins. Simple large silhouettes, no small mechanical parts beyond these gears.
Canvas EXACT 1600 x 900 pixels, aspect ratio 1600:900. Camera consistent with sober book wood engraving, horizon at two thirds where visible. Main cut lines about 3px at 1600px width, shadow hatches about 1px, sparse, no texture elsewhere. All objects stay within generous canvas margin. Light source anchor: center of red lantern flame at exactly x=64% of total canvas width and y=40% of total canvas height, measured from upper-left. Place the flame at that coordinate, not lantern top or base.
References 1-2 are lantern model only, ignore their colours, book, glow. References 3-4 define simplified cage geometry; omit their rays. Only black, white and pure red. Keep white paper absolutely clean and solid areas absolutely flat. No speckle, no paper grain. Simplified silhouettes, half the usual detail. No text-like strokes even on blank pages.
Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
Final direction: extremely SPARSE woodcut. At least half of object surfaces untouched white, shadows SOLID black. At most 20 short hatch strokes total. No uniform surface texture. The lantern is small and centered on its specified flame anchor.
```

### Correction ciblée de composition ou de placement

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.
The scene fills the frame edge to edge; empty areas are white paper.
Precise object EDIT of image 1. MOVE the hanging lantern 26 pixels RIGHT and 73 pixels UP, extend or shorten hanger as necessary. Redraw background vacated by lantern. Do not just change its design. New lit flame centroid must land at (64% width,40% height). All other objects, canvas dimensions and aspect, camera and crop unchanged. Remove every red hatch floating in air, red only on surface and flame. Detach the old engine at left from the carriage: clear visible gap, no connector; keep new engine at right coupled.
Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

## LOD-04 — nuit

Édition du jour livré avant recalage local éventuel, avec le jour en première référence puis les quatre références communes.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.
The scene fills the frame edge to edge; empty background is solid black at night.
Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.
Use case: lighting-weather EDIT. IMAGE 1 IS THE DAY MASTER TO EDIT. Images 2-5 are supporting lantern geometry references only, not layouts. Keep EXACT 1672x941 pixel canvas, every object silhouette, lantern position, framing, crop and perspective unchanged. Do not zoom, shift, add or delete objects. Change ONLY ink coverage and illumination. Replace broad white surfaces with solid black; leave a few thin white contours. At least 80 percent of all image pixels must be pure #000000 black. Solid black night background, zero grain. The flame is pure red, a small red hatch pool illuminates the principal subject. No gradients, no rays, no halo.   Use fewer lines than day; shadows entirely black, no large white fills. Limit whites to thin outlines. No paper grain.
Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

Empreintes SHA-256 des masters livrés :

- `LOD-04.png` : `1dd5bb76a96daddd51be6ef3609df2eae385c8679c0e3661964b4216a948fe51`.
- `LOD-04.nuit.png` : `ed4fd07c9d46ba7b490c11fd39e216de2586be38aa859c89c3093f7952f61b49`.
