# Masters générés — série « bloodborne »

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
| [BLR-01.png](BLR-01.png) | [Jour](#blr-01--jour) | 2026-10-13 | `exec-a773b2da-bf17-4afb-b7e7-d18b10071a7d.png` |
| [BLR-01.nuit.png](BLR-01.nuit.png) | [Édition de nuit](#blr-01--nuit) | 2026-10-13 | `exec-8966df31-f2e1-4479-9281-c915481adad7.png` |
| [BLR-03.png](BLR-03.png) | [Jour](#blr-03--jour) | 2026-10-13 | `exec-576ec7c6-b89c-43f3-9f34-fb2f52527f3e.png` |
| [BLR-03.nuit.png](BLR-03.nuit.png) | [Édition de nuit](#blr-03--nuit) | 2026-10-13 | `exec-e1d6e31b-336e-4dc3-a690-f7aacc31b055.png` |
| [BLR-04.png](BLR-04.png) | [Jour](#blr-04--jour) | 2026-10-13 | `exec-9d021e74-3e5a-46a9-a1e9-0ffdab097142.png` |
| [BLR-04.nuit.png](BLR-04.nuit.png) | [Édition de nuit](#blr-04--nuit) | 2026-10-13 | `exec-4b409f05-89a0-4123-b79e-285d716b1b2d.png` |
| [BLR-05.png](BLR-05.png) | [Jour](#blr-05--jour) | 2026-10-13 | `exec-8f8a9e62-a775-4c6a-aafd-a3dbc50a9dbc.png` |
| [BLR-05.nuit.png](BLR-05.nuit.png) | [Édition de nuit](#blr-05--nuit) | 2026-10-13 | `exec-b3b6b7ec-c8aa-4e71-856b-f5c8b9171a40.png` |

## Contrôles

Les coordonnées sont mesurées depuis le coin supérieur gauche jusqu’au centre de la flamme. Le contrôle associe superposition d’une croix et d’une boîte de tolérance de ±3 points de pourcentage, composantes rouges et inspection visuelle. Le pourcentage de noir porte sur les pixels opaques (alpha ≥250) dont les trois canaux sont ≤32/255 ; la transparence n’est pas comptée comme du noir.

| ID | Canvas final commun jour/nuit | Cible | Jour mesuré | Nuit mesurée | Noir nuit |
|---|---|---|---|---|---|
| BLR-01 | 1536 × 1024 | 34,00 % × 56,00 % | 31,66 % × 54,82 % | 31,62 % × 54,70 % | 91,70 % |
| BLR-03 | 1672 × 941 | 86,00 % × 72,00 % | 88,63 % × 72,35 % | 88,64 % × 72,46 % | 84,42 % |
| BLR-04 | 1254 × 1254 | 74,00 % × 80,00 % | 72,61 % × 78,57 % | 72,78 % × 79,02 % | 73,75 % |
| BLR-05 | 1122 × 1402 | 90,00 % × 40,00 % | hors champ (fiche) | hors champ (fiche) | 87,04 % |

Les 16 lanternes visibles de ce lot respectent la tolérance de position ; OMN-01 et BLR-05 placent la lanterne hors champ conformément à leurs fiches. Tous les fonds transparents le restent. Les marges de noir nocturnes dépassent 70 % selon la mesure ci-dessus.

Les sorties conservent des valeurs intermédiaires sur les contours et les surfaces issues du générateur : elles ne constituent donc pas une palette indexée strictement limitée aux trois codes hexadécimaux. Aucune quantification globale n’a été appliquée. Les ratios sont ceux demandés à l’arrondi natif près (écart relatif maximal de 0,161 % pour ce lot). Les dimensions jour/nuit sont identiques après les corrections de bord décrites ci-dessous ; le modèle a toutefois redessiné certains contours pendant l’édition nocturne. L’identité géométrique de chaque trait au pixel près n’est pas garantie.

BLR-01 : exactement 40 médailles visibles, en quatre rangées de dix, après trois éditions ciblées. Le nombre a été recompté dans le jour et la nuit. BLR-05 garde la lanterne hors champ à droite ; son point correspond à l’entrée de lumière.

## Opérations locales après génération

Translations sous masque de la lanterne complète et raccord du fond proche, sans déplacement du canvas ni des autres objets. Les corrections de bord des nuits ajoutent ou retirent uniquement 1–2 pixels sur les bords droit/bas, sans redimensionner la scène. Aucun changement global de palette.

| Fichier | Opération |
|---|---|
| BLR-01.png | aucune |
| BLR-01.nuit.png | aucune |
| BLR-03.png | aucune |
| BLR-03.nuit.png | aucune |
| BLR-04.png | aucune |
| BLR-04.nuit.png | aucune |
| BLR-05.png | aucune |
| BLR-05.nuit.png | aucune |

## BLR-01 — jour

Prompt initial, références communes jointes :

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.
The scene fills the frame edge to edge; empty areas are white paper.
Use case: illustration-story. Subject and composition: At left a notebook with a grid of empty checkbox squares spilling out as one additional blank page, almost every square empty. At right a neat compact row arrangement of forty very simple circular medals with short ribbon silhouettes. A lantern on notebook lights the next empty checkbox. No emblems or inscriptions. Simplify medals to identical silhouette shapes; avoid decorative anatomy or textures. Every object inside canvas.
Canvas EXACT 1500 x 1000 pixels, aspect ratio 1500:1000. Camera consistent with sober book wood engraving, horizon at two thirds where visible. Main cut lines about 3px at 1600px width, shadow hatches about 1px, sparse, no texture elsewhere. All objects stay within generous canvas margin. Light source anchor: center of red lantern flame at exactly x=34% of total canvas width and y=56% of total canvas height, measured from upper-left. Place the flame at that coordinate, not lantern top or base.
References 1-2 are lantern model only, ignore their colours, book, glow. References 3-4 define simplified cage geometry; omit their rays. Only black, white and pure red. Keep white paper absolutely clean and solid areas absolutely flat. No speckle, no paper grain. Simplified silhouettes, half the usual detail. No text-like strokes even on blank pages.
Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
Final direction: extremely SPARSE woodcut. At least half of object surfaces untouched white, shadows SOLID black. At most 20 short hatch strokes total. No uniform surface texture. The lantern is small and centered on its specified flame anchor.
```

### Correction ciblée de composition ou de placement

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.
The scene fills the frame edge to edge; empty areas are white paper.
Precise object EDIT of image 1. Move the lantern 12 pixels LEFT and 140 pixels DOWN so flame centroid is 34% canvas width and 56% height. Make notebook smaller within current canvas so its ENTIRE left edge is visible with white margin. Keep forty simple medals, exactly five rows of EIGHT medals, not nine. No extra medals. Keep canvas dimensions and aspect ratio unchanged. Preserve other objects and sparse handcut style. No grey noise.
Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

### Correction du nombre de médailles, essai 5 × 8 (résultat : 36)

```text
EDIT THE FIRST IMAGE ONLY. Make one isolated correction: the medals at the right must be EXACTLY FORTY medals in EXACTLY FIVE HORIZONTAL ROWS with EXACTLY EIGHT medals in EACH ROW. 5 rows × 8 columns = 40. Replace the existing 4 rows of 9 with that 5-by-8 rectangular grid. This exact count is the only requested structural change. Make medals small enough so all forty fit comfortably in the same right-hand area. Every medal is the same plain black circle hanging from one short black ribbon, with a little white connector. Preserve every pixel of the entire left notebook, lantern and flame area, preserve the lantern flame anchor x=31.65%,y=54.87%, the notebook shape and its empty checkboxes. No other changes. Keep the exact existing 1536 × 1024 canvas and framing. No words, letters, numerals or marks anywhere.
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.
The scene fills the frame edge to edge; empty areas are white paper.
Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

Sortie : `exec-5b7449ad-a732-4c54-bf46-6f1fb8c8f799.png`.

### Correction du nombre de médailles, essai 4 × 10 (résultat : 44)

```text
EDIT FIRST IMAGE. Keep notebook and lantern on left completely unchanged. The medals at right are currently four rows of nine (=36), which is WRONG. On the RIGHT HALF only, change the medal grid to FOUR ROWS OF TEN (=40). Keep four rows, add ONE extra medal PER ROW. Shrink their width and horizontal spacing to fit TEN in each row. Count columns carefully: ten columns, four rows. Total exactly forty simple black medals. Each medal is one black circular disk and one short black ribbon. Leave the whole left half unchanged. Exact canvas1536x1024, same camera, no cropping. Only the medal count changes. No text or numbers.
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.
The scene fills the frame edge to edge; empty areas are white paper.
Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

Sortie : `exec-edadb97a-04ac-4d78-a7bf-ddcdc9821a20.png`.

### Suppression ciblée de la dernière colonne (résultat retenu : 40)

```text
EDIT FIRST IMAGE. Erase ONLY the FAR-RIGHT vertical column of four medals. These four medals occupy x=1450 through1508 pixels, y=132 through720 pixels. Replace that narrow far-right column with pure white empty paper. Leave the other TEN columns of medals completely unchanged. Leave the entire notebook and lantern unchanged. Do not add any medal. Do not rearrange anything. The final grid must have four rows and ten columns, total40. Exactly1536x1024canvas. No text.
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.
The scene fills the frame edge to edge; empty areas are white paper.
Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

Sortie : `exec-a773b2da-bf17-4afb-b7e7-d18b10071a7d.png`.

Jour précédent non retenu (36 médailles) : `exec-5639d0f6-5698-4626-bd07-1b47ff0d04f3.png`.

## BLR-01 — nuit

Édition du jour livré avant recalage local éventuel, avec le jour en première référence puis les quatre références communes.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.
The scene fills the frame edge to edge; empty background is solid black at night.
Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.
Use case: lighting-weather EDIT. IMAGE 1 IS THE DAY MASTER TO EDIT. Images 2-5 are supporting lantern geometry references only, not layouts. Keep EXACT 1536x1024 pixel canvas, every object silhouette, lantern position, framing, crop and perspective unchanged. Do not zoom, shift, add or delete objects. Change ONLY ink coverage and illumination. Replace broad white surfaces with solid black; leave a few thin white contours. At least 80 percent of all image pixels must be pure #000000 black. Solid black night background, zero grain. The flame is pure red, a small red hatch pool illuminates the principal subject. No gradients, no rays, no halo.   Use fewer lines than day; shadows entirely black, no large white fills. Limit whites to thin outlines. No paper grain.
Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
Preserve the EXACT forty medals in four rows of ten. Do not change that count or move any medal. Only turn their solid black silhouettes into black silhouettes with sparse white outlines.
```

### Première nuit, remplacée après correction des médailles

Sortie non retenue : `exec-2e35280a-eb9a-47ee-8a75-c4ad6be69b8c.png`.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.
The scene fills the frame edge to edge; empty background is solid black at night.
Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.
Use case: lighting-weather EDIT. IMAGE 1 IS THE DAY MASTER TO EDIT. Images 2-5 are supporting lantern geometry references only, not layouts. Keep EXACT 1536x1024 pixel canvas, every object silhouette, lantern position, framing, crop and perspective unchanged. Do not zoom, shift, add or delete objects. Change ONLY ink coverage and illumination. Replace broad white surfaces with solid black; leave a few thin white contours. At least 80 percent of all image pixels must be pure #000000 black. Solid black night background, zero grain. The flame is pure red, a small red hatch pool illuminates the principal subject. No gradients, no rays, no halo.   Use fewer lines than day; shadows entirely black, no large white fills. Limit whites to thin outlines. No paper grain.
Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

Empreintes SHA-256 des masters livrés :

- `BLR-01.png` : `8c3cfb81f2e5866df91d13c278f449bd9aef6891b71a72951f8061e270d44e6c`.
- `BLR-01.nuit.png` : `35474677c540c3c00b542364e9f702615ae4c71db87bf0ac51217e552d3e9a77`.

## BLR-03 — jour

Prompt initial, références communes jointes :

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.
Transparent background: nothing is drawn outside the subject.
Use case: illustration-story. Subject and composition: Four simple standalone motifs arranged left to right with three small black directional arrows between: an entirely blank source page, a three-column empty table, an open dictionary with entirely blank pages, and a clean blank final sheet. Above the table a magnifying glass over an empty cell. A small lantern beneath final sheet illuminates it. Every paper is completely blank: no fake text strokes. No tiny clutter, no border around overall image. Frontally composed strip.
Canvas EXACT 1600 x 900 pixels, aspect ratio 1600:900. Camera consistent with sober book wood engraving, horizon at two thirds where visible. Main cut lines about 3px at 1600px width, shadow hatches about 1px, sparse, no texture elsewhere. All objects stay within generous canvas margin. Light source anchor: center of red lantern flame at exactly x=86% of total canvas width and y=72% of total canvas height, measured from upper-left. Place the flame at that coordinate, not lantern top or base.
References 1-2 are lantern model only, ignore their colours, book, glow. References 3-4 define simplified cage geometry; omit their rays. Only black, white and pure red. Keep white paper absolutely clean and solid areas absolutely flat. No speckle, no paper grain. Simplified silhouettes, half the usual detail. No text-like strokes even on blank pages.
Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
Final direction: extremely SPARSE woodcut. At least half of object surfaces untouched white, shadows SOLID black. At most 20 short hatch strokes total. No uniform surface texture. The lantern is small and centered on its specified flame anchor.
```

## BLR-03 — nuit

Édition du jour livré avant recalage local éventuel, avec le jour en première référence puis les quatre références communes.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.
Transparent background: nothing is drawn outside the subject.
Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.
Use case: lighting-weather EDIT. IMAGE 1 IS THE DAY MASTER TO EDIT. Images 2-5 are supporting lantern geometry references only, not layouts. Keep EXACT 1672x941 pixel canvas, every object silhouette, lantern position, framing, crop and perspective unchanged. Do not zoom, shift, add or delete objects. Change ONLY ink coverage and illumination. Replace broad white surfaces with solid black; leave a few thin white contours. At least 80 percent of opaque subject pixels must be pure #000000 black. Every transparent pixel outside subject stays transparent; do not fill the canvas. The flame is pure red, a small red hatch pool illuminates the principal subject. No gradients, no rays, no halo.   Use fewer lines than day; shadows entirely black, no large white fills. Limit whites to thin outlines. No paper grain.
Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

Empreintes SHA-256 des masters livrés :

- `BLR-03.png` : `9771393869169ec6e3ddf2c44eb60068cc57277d30223afd430944e33e418a0b`.
- `BLR-03.nuit.png` : `c3177356f52e5ab5d1179a35fa965d90d993864f9d20d7e9a1afa054a3f640cb`.

## BLR-04 — jour

Prompt initial, références communes jointes :

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.
Transparent background: nothing is drawn outside the subject.
Use case: illustration-story. Subject and composition: One simple solid silhouette hand viewed frontally, index finger raised. A small five-point star touches the fingertip at canvas center, receiving red hatched lantern light. Around star a circular progress ring filled for exactly three quarters. A small lantern at bottom right is sole source. Star has no glow or rays. Hand should be symbolic mittenlike silhouette, no detailed anatomy. Entire hand and wrist termination inside margins.
Canvas EXACT 800 x 800 pixels, aspect ratio 800:800. Camera consistent with sober book wood engraving, horizon at two thirds where visible. Main cut lines about 3px at 1600px width, shadow hatches about 1px, sparse, no texture elsewhere. All objects stay within generous canvas margin. Light source anchor: center of red lantern flame at exactly x=74% of total canvas width and y=80% of total canvas height, measured from upper-left. Place the flame at that coordinate, not lantern top or base.
References 1-2 are lantern model only, ignore their colours, book, glow. References 3-4 define simplified cage geometry; omit their rays. Only black, white and pure red. Keep white paper absolutely clean and solid areas absolutely flat. No speckle, no paper grain. Simplified silhouettes, half the usual detail. No text-like strokes even on blank pages.
Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
Final direction: extremely SPARSE woodcut. At least half of object surfaces untouched white, shadows SOLID black. At most 20 short hatch strokes total. No uniform surface texture. The lantern is small and centered on its specified flame anchor.
```

## BLR-04 — nuit

Édition du jour livré avant recalage local éventuel, avec le jour en première référence puis les quatre références communes.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.
Transparent background: nothing is drawn outside the subject.
Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.
Use case: lighting-weather EDIT. IMAGE 1 IS THE DAY MASTER TO EDIT. Images 2-5 are supporting lantern geometry references only, not layouts. Keep EXACT 1254x1254 pixel canvas, every object silhouette, lantern position, framing, crop and perspective unchanged. Do not zoom, shift, add or delete objects. Change ONLY ink coverage and illumination. Replace broad white surfaces with solid black; leave a few thin white contours. At least 80 percent of opaque subject pixels must be pure #000000 black. Every transparent pixel outside subject stays transparent; do not fill the canvas. The flame is pure red, a small red hatch pool illuminates the principal subject. No gradients, no rays, no halo.   Use fewer lines than day; shadows entirely black, no large white fills. Limit whites to thin outlines. No paper grain.
Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

Empreintes SHA-256 des masters livrés :

- `BLR-04.png` : `05de8188a24b55a5e437c47391d679d266c936b180c757b23ded8a0b33a6054e`.
- `BLR-04.nuit.png` : `871d8506f044efb09e1fa64a85b114a96d859f129510b38feb5e3274fc8f4614`.

## BLR-05 — jour

Prompt initial, références communes jointes :

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.
Transparent background: nothing is drawn outside the subject.
Use case: illustration-story. Subject and composition: One generic phone held by a simplified solid silhouette hand, viewed in three quarters. On screen six simple small stars linked by thin black lines, a constellation. Thumb touches one star, which alone is red. No UI. Single lantern is completely OFF CANVAS to right; light enters from x90 percent y40 percent and falls on screen in sparse red hatching. Do not depict or crop the lantern. Center phone and thumb. Entire hand wrist and phone contained in frame. No light rays.
Canvas EXACT 960 x 1200 pixels, aspect ratio 960:1200. Camera consistent with sober book wood engraving, horizon at two thirds where visible. Main cut lines about 3px at 1600px width, shadow hatches about 1px, sparse, no texture elsewhere. All objects stay within generous canvas margin. Light source anchor: center of red lantern flame at exactly x=90% of total canvas width and y=40% of total canvas height, measured from upper-left. Lantern stays off canvas as described; this is light-entry anchor.
References 1-2 are lantern model only, ignore their colours, book, glow. References 3-4 define simplified cage geometry; omit their rays. Only black, white and pure red. Keep white paper absolutely clean and solid areas absolutely flat. No speckle, no paper grain. Simplified silhouettes, half the usual detail. No text-like strokes even on blank pages.
Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
Final direction: extremely SPARSE woodcut. At least half of object surfaces untouched white, shadows SOLID black. At most 20 short hatch strokes total. No uniform surface texture. The lantern is small and centered on its specified flame anchor.
```

## BLR-05 — nuit

Édition du jour livré avant recalage local éventuel, avec le jour en première référence puis les quatre références communes.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.
Transparent background: nothing is drawn outside the subject.
Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.
Use case: lighting-weather EDIT. IMAGE 1 IS THE DAY MASTER TO EDIT. Images 2-5 are supporting lantern geometry references only, not layouts. Keep EXACT 1122x1402 pixel canvas, every object silhouette, lantern position, framing, crop and perspective unchanged. Do not zoom, shift, add or delete objects. Change ONLY ink coverage and illumination. Replace broad white surfaces with solid black; leave a few thin white contours. At least 80 percent of opaque subject pixels must be pure #000000 black. Every transparent pixel outside subject stays transparent; do not fill the canvas. The flame is pure red, a small red hatch pool illuminates the principal subject. No gradients, no rays, no halo. Keep lantern OFF CANVAS as in source; do not add a visible lantern.  Use fewer lines than day; shadows entirely black, no large white fills. Limit whites to thin outlines. No paper grain.
Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

Empreintes SHA-256 des masters livrés :

- `BLR-05.png` : `a49b94ec23db5f430bd71e12d4d82a234bf0dbedcf113bc08e9fd503dcfa30b3`.
- `BLR-05.nuit.png` : `e0e321bb9df69d473d6c1a1f3320b328f13442723809e3e99ee27496cb5a344b`.
