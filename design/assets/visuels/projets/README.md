# Masters générés — série « projets »

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
| [PRJ-01.png](PRJ-01.png) | [Jour](#prj-01--jour) | 2026-10-13 | `exec-540e126d-5be9-4ff7-9685-6d348addfc93.png` |
| [PRJ-01.nuit.png](PRJ-01.nuit.png) | [Édition de nuit](#prj-01--nuit) | 2026-10-13 | `exec-f44677fe-dc84-4bec-947c-a07dfcafd353.png` |
| [PRJ-02.png](PRJ-02.png) | [Jour](#prj-02--jour) | 2026-10-13 | `exec-3a0ed613-24d9-4428-9cd7-435bfa04f750.png` |
| [PRJ-02.nuit.png](PRJ-02.nuit.png) | [Édition de nuit](#prj-02--nuit) | 2026-10-13 | `exec-f3eac644-45b6-4ee8-ba22-d60bbd7379ce.png` |
| [PRJ-06.png](PRJ-06.png) | [Jour](#prj-06--jour) | 2026-10-13 | `exec-6b25e624-7586-43fe-9563-50211dc92769.png` |
| [PRJ-06.nuit.png](PRJ-06.nuit.png) | [Édition de nuit](#prj-06--nuit) | 2026-10-13 | `exec-680499c4-a902-48db-b7c1-13ca6216b823.png` |
| [PRJ-07.png](PRJ-07.png) | [Jour](#prj-07--jour) | 2026-10-13 | `exec-99971dcc-c88e-4bc3-a79a-85a94cb9ea65.png` |
| [PRJ-07.nuit.png](PRJ-07.nuit.png) | [Édition de nuit](#prj-07--nuit) | 2026-10-13 | `exec-b841ec33-e355-405b-bf6b-5698545d7409.png` |
| [PRJ-08.png](PRJ-08.png) | [Jour](#prj-08--jour) | 2026-10-13 | `exec-456acfc4-1407-4e6b-b437-c1392fb03bdd.png` |
| [PRJ-08.nuit.png](PRJ-08.nuit.png) | [Édition de nuit](#prj-08--nuit) | 2026-10-13 | `exec-b09a56c9-c0f0-43e8-a4ac-b80a5b16cdd1.png` |
| [PRJ-09.png](PRJ-09.png) | [Jour](#prj-09--jour) | 2026-10-13 | `exec-0a3586c1-3476-48c8-8f7a-1503c7bc143e.png` |
| [PRJ-09.nuit.png](PRJ-09.nuit.png) | [Édition de nuit](#prj-09--nuit) | 2026-10-13 | `exec-c8106804-47be-402d-ae79-0eaad6debd93.png` |
| [PRJ-10.png](PRJ-10.png) | [Jour](#prj-10--jour) | 2026-10-13 | `exec-a7a5c7fb-bcfe-4f70-81e6-67b33fefa833.png` |
| [PRJ-10.nuit.png](PRJ-10.nuit.png) | [Édition de nuit](#prj-10--nuit) | 2026-10-13 | `exec-8860093f-40c6-45fb-95e5-eb7add3a9f44.png` |
| [PRJ-11.png](PRJ-11.png) | [Jour](#prj-11--jour) | 2026-10-13 | `exec-5a5770a9-6a35-430b-829b-858d8ee2b73c.png` |
| [PRJ-11.nuit.png](PRJ-11.nuit.png) | [Édition de nuit](#prj-11--nuit) | 2026-10-13 | `exec-a3f2fc01-c060-41c5-9cee-9a86b3c58f3b.png` |
| [PRJ-12.png](PRJ-12.png) | [Jour](#prj-12--jour) | 2026-10-13 | `exec-324e7200-3136-4abf-ba32-a6151fb5a753.png` |
| [PRJ-12.nuit.png](PRJ-12.nuit.png) | [Édition de nuit](#prj-12--nuit) | 2026-10-13 | `exec-a6f6034f-ea7f-4ffe-8ca8-43e5f48559c0.png` |

## Contrôles

Les coordonnées sont mesurées depuis le coin supérieur gauche jusqu’au centre de la flamme. Le contrôle associe superposition d’une croix et d’une boîte de tolérance de ±3 points de pourcentage, composantes rouges et inspection visuelle. Le pourcentage de noir porte sur les pixels opaques (alpha ≥250) dont les trois canaux sont ≤32/255 ; la transparence n’est pas comptée comme du noir.

| ID | Canvas final commun jour/nuit | Cible | Jour mesuré | Nuit mesurée | Noir nuit |
|---|---|---|---|---|---|
| PRJ-01 | 1586 × 992 | 50,00 % × 82,00 % | 50,02 % × 81,95 % | 49,94 % × 82,23 % | 89,74 % |
| PRJ-02 | 1586 × 992 | 30,00 % × 50,00 % | 28,48 % × 48,78 % | 28,35 % × 48,40 % | 91,19 % |
| PRJ-06 | 1448 × 1086 | 50,00 % × 84,00 % | 49,44 % × 81,80 % | 49,31 % × 81,85 % | 77,00 % |
| PRJ-07 | 1448 × 1086 | 20,00 % × 66,00 % | 18,66 % × 65,98 % | 18,62 % × 66,16 % | 93,37 % |
| PRJ-08 | 1447 × 1087 | 22,00 % × 78,00 % | 24,42 % × 75,90 % | 24,73 % × 77,31 % | 84,07 % |
| PRJ-09 | 1448 × 1086 | 66,00 % × 40,00 % | 67,94 % × 42,70 % | 68,63 % × 42,21 % | 93,26 % |
| PRJ-10 | 1448 × 1086 | 64,00 % × 82,00 % | 63,38 % × 80,69 % | 63,40 % × 80,00 %¹ | 80,49 % |
| PRJ-11 | 2172 × 724 | 46,00 % × 38,00 % | 46,96 % × 35,69 % | 47,01 % × 35,65 % | 95,46 % |
| PRJ-12 | 1448 × 1086 | 50,00 % × 58,00 % | 48,86 % × 58,21 % | 49,72 % × 58,76 % | 93,74 % |

Les 16 lanternes visibles de ce lot respectent la tolérance de position ; OMN-01 et BLR-05 placent la lanterne hors champ conformément à leurs fiches. Tous les fonds transparents le restent. Les marges de noir nocturnes dépassent 70 % selon la mesure ci-dessus.

Les sorties conservent des valeurs intermédiaires sur les contours et les surfaces issues du générateur : elles ne constituent donc pas une palette indexée strictement limitée aux trois codes hexadécimaux. Aucune quantification globale n’a été appliquée. Les ratios sont ceux demandés à l’arrondi natif près (écart relatif maximal de 0,161 % pour ce lot). Les dimensions jour/nuit sont identiques après les corrections de bord décrites ci-dessous ; le modèle a toutefois redessiné certains contours pendant l’édition nocturne. L’identité géométrique de chaque trait au pixel près n’est pas garantie.

¹ Pour PRJ-10 nuit, le rouge de la vitre est connecté à la flamme. La position indiquée est celle de la flamme visible, contrôlée au calque ; le centroïde de toute la composante rouge serait trompeur. PRJ-01 conserve un bout de manche au bord gauche malgré les demandes de marge ; aucune tête n’est coupée.

## Opérations locales après génération

Translations sous masque de la lanterne complète et raccord du fond proche, sans déplacement du canvas ni des autres objets. Les corrections de bord des nuits ajoutent ou retirent uniquement 1–2 pixels sur les bords droit/bas, sans redimensionner la scène. Aucun changement global de palette.

| Fichier | Opération |
|---|---|
| PRJ-01.png | translation (97, 45) px ; fond local blanc jour / noir nuit |
| PRJ-01.nuit.png | translation (97, 45) px ; fond local blanc jour / noir nuit |
| PRJ-02.png | translation (0, 20) px ; fond local blanc jour / noir nuit |
| PRJ-02.nuit.png | translation (0, 20) px ; fond local blanc jour / noir nuit ; 1584 × 993 → 1586 × 992 px par bord droit/bas, sans mise à l’échelle |
| PRJ-06.png | translation (0, 40) px ; fond local blanc jour / noir nuit |
| PRJ-06.nuit.png | translation (0, 40) px ; fond local blanc jour / noir nuit |
| PRJ-07.png | translation (0, 56) px ; fond local blanc jour / noir nuit |
| PRJ-07.nuit.png | translation (0, 56) px ; fond local blanc jour / noir nuit |
| PRJ-08.png | translation (-25, 0) px ; clone voisin (150, −21) px sur cadre, fond local ailleurs |
| PRJ-08.nuit.png | translation (-25, 0) px ; clone voisin (150, −21) px sur cadre, fond local ailleurs ; 1446 × 1087 → 1447 × 1087 px par bord droit/bas, sans mise à l’échelle |
| PRJ-09.png | translation (-11, -5) px ; prolongation du fond voisin sur chaque ligne |
| PRJ-09.nuit.png | translation (-11, -5) px ; prolongation du fond voisin sur chaque ligne |
| PRJ-10.png | aucune |
| PRJ-10.nuit.png | aucune |
| PRJ-11.png | aucune |
| PRJ-11.nuit.png | aucune |
| PRJ-12.png | aucune |
| PRJ-12.nuit.png | aucune |

## PRJ-01 — jour

Prompt initial, références communes jointes :

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.
The scene fills the frame edge to edge; empty areas are white paper.
Use case: illustration-story. Subject and composition: Team translation as shared work. A frontal wall board viewed slightly from above, three columns of entirely blank pinned cards, four simple anonymous hands with different sleeves moving the cards between columns. At right a hand closes a sealed card packet beside a large common storage chest wider than the board. Keep only two cards per column. The lantern sits low at center and lights the middle column with sparse red hatching. Hands and board centered for portrait crop; no arms cut by canvas edges.
Canvas EXACT 1600 x 1000 pixels, aspect ratio 1600:1000. Camera consistent with sober book wood engraving, horizon at two thirds where visible. Main cut lines about 3px at 1600px width, shadow hatches about 1px, sparse, no texture elsewhere. All objects stay within generous canvas margin. Light source anchor: center of red lantern flame at exactly x=50% of total canvas width and y=82% of total canvas height, measured from upper-left. Place the flame at that coordinate, not lantern top or base.
References 1-2 are lantern model only, ignore their colours, book, glow. References 3-4 define simplified cage geometry; omit their rays. Only black, white and pure red. Keep white paper absolutely clean and solid areas absolutely flat. No speckle, no paper grain. Simplified silhouettes, half the usual detail. No text-like strokes even on blank pages.
Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

### Correction avec croix de position

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.
The scene fills the frame edge to edge; empty areas are white paper.
EDIT image 1, a placement proof. The BLUE cross is the required center of the RED FLAME, inside the BLUE rectangle tolerance area. Move the complete lantern so the flame CENTER sits exactly at that cross (50% width, 82% height). Remove old lantern completely, reconstitute exposed background; then remove all blue guides. Do NOT add a second lantern. Keep existing canvas dimensions and aspect. Simplify image strongly: erase at least HALF of the hatching; replace with broad flat black shadow areas and untouched white paper. Hand-cut economical engraving, no microtexture. Shrink entire composition slightly if needed so all hands, sleeves, chest and board have white margin; no sleeves cropped at edges. Retain objects and narrative. Supporting images 2-5 only define lantern model.
Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

### Correction avec silhouette guide

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.
The scene fills the frame edge to edge; empty areas are white paper.
Precise object EDIT of image 1. ERASE the old black lantern and its old flame completely. Replace the BLUE GHOST LANTERN with a real small BLACK AND WHITE WOODCUT LANTERN containing a PURE RED FLAME, occupying exactly the blue ghost's size and position. The blue drop is the exact destination of red flame. Do NOT preserve the old lantern's size or location. Required flame center (50%,82%). Rebuild blank paper or object where old lantern was. Remove every blue mark. Keep every other object and original image dimensions unchanged. Single small lantern only. No crop. Reduce hatching where removed lantern was.
Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

## PRJ-01 — nuit

Édition du jour livré avant recalage local éventuel, avec le jour en première référence puis les quatre références communes.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.
The scene fills the frame edge to edge; empty background is solid black at night.
Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.
Use case: lighting-weather EDIT. IMAGE 1 IS THE DAY MASTER TO EDIT. Images 2-5 are supporting lantern geometry references only, not layouts. Keep EXACT 1586x992 pixel canvas, every object silhouette, lantern position, framing, crop and perspective unchanged. Do not zoom, shift, add or delete objects. Change ONLY ink coverage and illumination. Replace broad white surfaces with solid black; leave a few thin white contours. At least 80 percent of all image pixels must be pure #000000 black. Solid black night background, zero grain. The flame is pure red, a small red hatch pool illuminates the principal subject. No gradients, no rays, no halo.   Use fewer lines than day; shadows entirely black, no large white fills. Limit whites to thin outlines. No paper grain.
Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

Empreintes SHA-256 des masters livrés :

- `PRJ-01.png` : `2eeda880bb78ff4aa5ad58061585c5bffd6d0982a0ce14fd2bd2d828b653fa46`.
- `PRJ-01.nuit.png` : `73b862998ce40e6d67938e27c8d137ac799764b99c3a80f83b5f4d32d7ae4d3a`.

## PRJ-02 — jour

Prompt initial, références communes jointes :

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.
The scene fills the frame edge to edge; empty areas are white paper.
Use case: illustration-story. Subject and composition: A bound register open on a lectern in three-quarter view: a few thin page layers fan to the right like cards, blank unmarked edges. A fabric bookmark rests deep in the older pages. Lantern at left illuminates only the marked page. No people. Register, marked page and lantern clustered centrally, readable after a portrait crop.
Canvas EXACT 1600 x 1000 pixels, aspect ratio 1600:1000. Camera consistent with sober book wood engraving, horizon at two thirds where visible. Main cut lines about 3px at 1600px width, shadow hatches about 1px, sparse, no texture elsewhere. All objects stay within generous canvas margin. Light source anchor: center of red lantern flame at exactly x=30% of total canvas width and y=50% of total canvas height, measured from upper-left. Place the flame at that coordinate, not lantern top or base.
References 1-2 are lantern model only, ignore their colours, book, glow. References 3-4 define simplified cage geometry; omit their rays. Only black, white and pure red. Keep white paper absolutely clean and solid areas absolutely flat. No speckle, no paper grain. Simplified silhouettes, half the usual detail. No text-like strokes even on blank pages.
Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

### Correction avec croix de position

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.
The scene fills the frame edge to edge; empty areas are white paper.
EDIT image 1, a placement proof. The BLUE cross is the required center of the RED FLAME, inside the BLUE rectangle tolerance area. Move the complete lantern so the flame CENTER sits exactly at that cross (30% width, 50% height). Remove old lantern completely, reconstitute exposed background; then remove all blue guides. Do NOT add a second lantern. Keep existing canvas dimensions and aspect. Simplify image strongly: erase at least HALF of the hatching; replace with broad flat black shadow areas and untouched white paper. Hand-cut economical engraving, no microtexture.  Retain objects and narrative. Supporting images 2-5 only define lantern model.
Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

### Correction avec silhouette guide

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.
The scene fills the frame edge to edge; empty areas are white paper.
Precise object EDIT of image 1. ERASE the old black lantern and its old flame completely. Replace the BLUE GHOST LANTERN with a real small BLACK AND WHITE WOODCUT LANTERN containing a PURE RED FLAME, occupying exactly the blue ghost's size and position. The blue drop is the exact destination of red flame. Do NOT preserve the old lantern's size or location. Required flame center (30%,50%). Rebuild blank paper or object where old lantern was. Remove every blue mark. Keep every other object and original image dimensions unchanged. Single small lantern only. No crop. Reduce hatching where removed lantern was.
Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

## PRJ-02 — nuit

Édition du jour livré avant recalage local éventuel, avec le jour en première référence puis les quatre références communes.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.
The scene fills the frame edge to edge; empty background is solid black at night.
Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.
Use case: lighting-weather EDIT. IMAGE 1 IS THE DAY MASTER TO EDIT. Images 2-5 are supporting lantern geometry references only, not layouts. Keep EXACT 1586x992 pixel canvas, every object silhouette, lantern position, framing, crop and perspective unchanged. Do not zoom, shift, add or delete objects. Change ONLY ink coverage and illumination. Replace broad white surfaces with solid black; leave a few thin white contours. At least 80 percent of all image pixels must be pure #000000 black. Solid black night background, zero grain. The flame is pure red, a small red hatch pool illuminates the principal subject. No gradients, no rays, no halo.   Use fewer lines than day; shadows entirely black, no large white fills. Limit whites to thin outlines. No paper grain.
Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

Empreintes SHA-256 des masters livrés :

- `PRJ-02.png` : `e9cd9d8411e550b3ab57c7d567053ba61d41e8d7d7ba67eaf4284029e087073c`.
- `PRJ-02.nuit.png` : `7b2c688b876292416ef7cf540fea5f1240a46345bfeaaeca842a1dbde542d97c`.

## PRJ-06 — jour

Prompt initial, références communes jointes :

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.
Transparent background: nothing is drawn outside the subject.
Use case: illustration-story. Subject and composition: Three stylized branches rise from one common trunk and root. Each ends in one simple verdict object: a solid wax seal, a magnifying glass, and a small broom. Lantern at the trunk foot lights the branch with magnifying glass. No foliage, no people. Three decisive bold branch strokes, very few hatches.
Canvas EXACT 1200 x 900 pixels, aspect ratio 1200:900. Camera consistent with sober book wood engraving, horizon at two thirds where visible. Main cut lines about 5px at 1600px width, shadow hatches about 1px, sparse, no texture elsewhere. All objects stay within generous canvas margin. Light source anchor: center of red lantern flame at exactly x=50% of total canvas width and y=84% of total canvas height, measured from upper-left. Place the flame at that coordinate, not lantern top or base.
References 1-2 are lantern model only, ignore their colours, book, glow. References 3-4 define simplified cage geometry; omit their rays. Only black, white and pure red. Keep white paper absolutely clean and solid areas absolutely flat. No speckle, no paper grain. Simplified silhouettes, half the usual detail. No text-like strokes even on blank pages.
Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

### Correction avec croix de position

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.
Transparent background: nothing is drawn outside the subject.
EDIT image 1, a placement proof. The BLUE cross is the required center of the RED FLAME, inside the BLUE rectangle tolerance area. Move the complete lantern so the flame CENTER sits exactly at that cross (50% width, 84% height). Remove old lantern completely, reconstitute exposed background; then remove all blue guides. Do NOT add a second lantern. Keep existing canvas dimensions and aspect. Simplify image strongly: erase at least HALF of the hatching; replace with broad flat black shadow areas and untouched white paper. Hand-cut economical engraving, no microtexture.  Retain objects and narrative. Supporting images 2-5 only define lantern model.
Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

### Correction avec silhouette guide

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.
Transparent background: nothing is drawn outside the subject.
Precise object EDIT of image 1. ERASE the old black lantern and its old flame completely. Replace the BLUE GHOST LANTERN with a real small BLACK AND WHITE WOODCUT LANTERN containing a PURE RED FLAME, occupying exactly the blue ghost's size and position. The blue drop is the exact destination of red flame. Do NOT preserve the old lantern's size or location. Required flame center (50%,84%). Rebuild blank paper or object where old lantern was. Remove every blue mark. Keep every other object and original image dimensions unchanged. Single small lantern only. No crop. Reduce hatching where removed lantern was.
Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

## PRJ-06 — nuit

Édition du jour livré avant recalage local éventuel, avec le jour en première référence puis les quatre références communes.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.
Transparent background: nothing is drawn outside the subject.
Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.
Use case: lighting-weather EDIT. IMAGE 1 IS THE DAY MASTER TO EDIT. Images 2-5 are supporting lantern geometry references only, not layouts. Keep EXACT 1448x1086 pixel canvas, every object silhouette, lantern position, framing, crop and perspective unchanged. Do not zoom, shift, add or delete objects. Change ONLY ink coverage and illumination. Replace broad white surfaces with solid black; leave a few thin white contours. At least 80 percent of opaque subject pixels must be pure #000000 black. Every transparent pixel outside subject stays transparent; do not fill the canvas. The flame is pure red, a small red hatch pool illuminates the principal subject. No gradients, no rays, no halo.   Use fewer lines than day; shadows entirely black, no large white fills. Limit whites to thin outlines. No paper grain.
Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

Empreintes SHA-256 des masters livrés :

- `PRJ-06.png` : `e8af0e80317f6ee71743f64f3e03c34d76923c604b7c125bcdc2e1d1adfd9a45`.
- `PRJ-06.nuit.png` : `3fc54566db2a1eb1e4aeda60f5b26981c3eb323d88c512d61cd9ef95878e328c`.

## PRJ-07 — jour

Prompt initial, références communes jointes :

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.
The scene fills the frame edge to edge; empty areas are white paper.
Use case: illustration-story. Subject and composition: On a table, a small pixel-art grid lies flat with one generic round mascot depicted in three overlapping successive poses like onion skin animation. Beside it stands a generic blank browser window containing the same round mascot larger. Lantern left of grid illuminates only the grid in sparse red hatching. Keep grid coarse and simple; browser has no top-bar dots or text lines. Do not draw a connecting light ray.
Canvas EXACT 1600 x 1200 pixels, aspect ratio 1600:1200. Camera consistent with sober book wood engraving, horizon at two thirds where visible. Main cut lines about 5px at 1600px width, shadow hatches about 1px, sparse, no texture elsewhere. All objects stay within generous canvas margin. Light source anchor: center of red lantern flame at exactly x=20% of total canvas width and y=66% of total canvas height, measured from upper-left. Place the flame at that coordinate, not lantern top or base.
References 1-2 are lantern model only, ignore their colours, book, glow. References 3-4 define simplified cage geometry; omit their rays. Only black, white and pure red. Keep white paper absolutely clean and solid areas absolutely flat. No speckle, no paper grain. Simplified silhouettes, half the usual detail. No text-like strokes even on blank pages.
Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
Final direction: make this an extremely SPARSE woodcut. At least half of object surfaces remain untouched white, shadow areas SOLID black. At most 20 short hatch strokes total in the entire scene. No uniform surface texture.
```

### Correction ciblée de composition ou de placement

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.
The scene fills the frame edge to edge; empty areas are white paper.
Precise object EDIT of image 1, original size 1448x1086. MOVE THE ENTIRE LANTERN 25 pixels LEFT and 173 pixels DOWN, including its flame. Redraw background vacated by lantern. Do not just change its design. The new flame centroid must land at (20% width,66% height). It should be visibly much LOWER in the frame than now. All other objects, canvas size, camera and crop unchanged. Remove all red hatches that float in air; red only on surfaces and flame. Only small pool of red hatching. Absolutely no extra lantern.
Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

## PRJ-07 — nuit

Édition du jour livré avant recalage local éventuel, avec le jour en première référence puis les quatre références communes.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.
The scene fills the frame edge to edge; empty background is solid black at night.
Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.
Use case: lighting-weather EDIT. IMAGE 1 IS THE DAY MASTER TO EDIT. Images 2-5 are supporting lantern geometry references only, not layouts. Keep EXACT 1448x1086 pixel canvas, every object silhouette, lantern position, framing, crop and perspective unchanged. Do not zoom, shift, add or delete objects. Change ONLY ink coverage and illumination. Replace broad white surfaces with solid black; leave a few thin white contours. At least 80 percent of all image pixels must be pure #000000 black. Solid black night background, zero grain. The flame is pure red, a small red hatch pool illuminates the principal subject. No gradients, no rays, no halo.   Use fewer lines than day; shadows entirely black, no large white fills. Limit whites to thin outlines. No paper grain.
Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

Empreintes SHA-256 des masters livrés :

- `PRJ-07.png` : `15fceb2de2f822fd870ffe7b5581f7bba9b58c66189c693d1ebe6f1e2f6ebea8`.
- `PRJ-07.nuit.png` : `f66d1552e862e6d2e1ba055becff944a1d858427b4d4b7322640bccda505415e`.

## PRJ-08 — jour

Prompt initial, références communes jointes :

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.
Transparent background: nothing is drawn outside the subject.
Use case: illustration-story. Subject and composition: A large framed image of an extremely simple two-hill landscape at left, with four copies of that identical image decreasing in width, stepping to the right like monitor, laptop, tablet and phone. Exactly five framed landscape images total. Lantern in front of original illuminates it. Bold simple silhouettes, few lines, no screen UI.
Canvas EXACT 1600 x 1200 pixels, aspect ratio 1600:1200. Camera consistent with sober book wood engraving, horizon at two thirds where visible. Main cut lines about 5px at 1600px width, shadow hatches about 1px, sparse, no texture elsewhere. All objects stay within generous canvas margin. Light source anchor: center of red lantern flame at exactly x=22% of total canvas width and y=78% of total canvas height, measured from upper-left. Place the flame at that coordinate, not lantern top or base.
References 1-2 are lantern model only, ignore their colours, book, glow. References 3-4 define simplified cage geometry; omit their rays. Only black, white and pure red. Keep white paper absolutely clean and solid areas absolutely flat. No speckle, no paper grain. Simplified silhouettes, half the usual detail. No text-like strokes even on blank pages.
Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
Final direction: make this an extremely SPARSE woodcut. At least half of object surfaces remain untouched white, shadow areas SOLID black. At most 20 short hatch strokes total in the entire scene. No uniform surface texture.
```

### Correction ciblée de composition ou de placement

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.
Transparent background: nothing is drawn outside the subject.
Precise object EDIT of image 1, original size 1448x1086. MOVE THE ENTIRE LANTERN 15 pixels RIGHT and 85 pixels DOWN, including its flame. Redraw background vacated by lantern. Do not just change its design. The new flame centroid must land at (22% width,78% height). It should be visibly much LOWER in the frame than now. All other objects, canvas size, camera and crop unchanged. Remove all red hatches that float in air; red only on surfaces and flame. Only small pool of red hatching. Absolutely no extra lantern.
Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

## PRJ-08 — nuit

Édition du jour livré avant recalage local éventuel, avec le jour en première référence puis les quatre références communes.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.
Transparent background: nothing is drawn outside the subject.
Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.
Use case: lighting-weather EDIT. IMAGE 1 IS THE DAY MASTER TO EDIT. Images 2-5 are supporting lantern geometry references only, not layouts. Keep EXACT 1447x1087 pixel canvas, every object silhouette, lantern position, framing, crop and perspective unchanged. Do not zoom, shift, add or delete objects. Change ONLY ink coverage and illumination. Replace broad white surfaces with solid black; leave a few thin white contours. At least 80 percent of opaque subject pixels must be pure #000000 black. Every transparent pixel outside subject stays transparent; do not fill the canvas. The flame is pure red, a small red hatch pool illuminates the principal subject. No gradients, no rays, no halo.   Use fewer lines than day; shadows entirely black, no large white fills. Limit whites to thin outlines. No paper grain.
Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

Empreintes SHA-256 des masters livrés :

- `PRJ-08.png` : `fe3b18ca8f01a5212b147d512da8a30cf7cb174b2be99fb61f3439a25aacc398`.
- `PRJ-08.nuit.png` : `9129fba3c3480a6e044ba36102dca021d1469f01a7d30ab395e4d5cc070822a7`.

## PRJ-09 — jour

Prompt initial, références communes jointes :

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.
The scene fills the frame edge to edge; empty areas are white paper.
Use case: illustration-story. Subject and composition: A table seen at three quarters slightly from above. At left a small stack of three printed reports with entirely blank covers and page edges; at right a single bound page lies open with a wide completely blank margin. Lantern behind the open page illuminates it in red hatching. No light ribbon, no text or strokes that resemble text.
Canvas EXACT 1600 x 1200 pixels, aspect ratio 1600:1200. Camera consistent with sober book wood engraving, horizon at two thirds where visible. Main cut lines about 5px at 1600px width, shadow hatches about 1px, sparse, no texture elsewhere. All objects stay within generous canvas margin. Light source anchor: center of red lantern flame at exactly x=66% of total canvas width and y=40% of total canvas height, measured from upper-left. Place the flame at that coordinate, not lantern top or base.
References 1-2 are lantern model only, ignore their colours, book, glow. References 3-4 define simplified cage geometry; omit their rays. Only black, white and pure red. Keep white paper absolutely clean and solid areas absolutely flat. No speckle, no paper grain. Simplified silhouettes, half the usual detail. No text-like strokes even on blank pages.
Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
Final direction: make this an extremely SPARSE woodcut. At least half of object surfaces remain untouched white, shadow areas SOLID black. At most 20 short hatch strokes total in the entire scene. No uniform surface texture.
```

### Correction ciblée de composition ou de placement

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.
The scene fills the frame edge to edge; empty areas are white paper.
Precise object EDIT of image 1, original size 1448x1086. MOVE THE ENTIRE LANTERN 11 pixels RIGHT and 43 pixels DOWN, including its flame. Redraw background vacated by lantern. Do not just change its design. The new flame centroid must land at (66% width,40% height). It should be visibly slightly LOWER in the frame than now. All other objects, canvas size, camera and crop unchanged. Remove all red hatches that float in air; red only on surfaces and flame. Only small pool of red hatching. Absolutely no extra lantern.
Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

## PRJ-09 — nuit

Édition du jour livré avant recalage local éventuel, avec le jour en première référence puis les quatre références communes.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.
The scene fills the frame edge to edge; empty background is solid black at night.
Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.
Use case: lighting-weather EDIT. IMAGE 1 IS THE DAY MASTER TO EDIT. Images 2-5 are supporting lantern geometry references only, not layouts. Keep EXACT 1448x1086 pixel canvas, every object silhouette, lantern position, framing, crop and perspective unchanged. Do not zoom, shift, add or delete objects. Change ONLY ink coverage and illumination. Replace broad white surfaces with solid black; leave a few thin white contours. At least 80 percent of all image pixels must be pure #000000 black. Solid black night background, zero grain. The flame is pure red, a small red hatch pool illuminates the principal subject. No gradients, no rays, no halo.   Use fewer lines than day; shadows entirely black, no large white fills. Limit whites to thin outlines. No paper grain.
Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

Empreintes SHA-256 des masters livrés :

- `PRJ-09.png` : `d3f512a94358021538fa2d14c7563b68d3a4c52db7bcf83f9c4659ad696c82f5`.
- `PRJ-09.nuit.png` : `f96e337ac22be3626e72f3bf8d96caa2590ad00ab1b0b7eb5ac89b86e088e7d9`.

## PRJ-10 — jour

Prompt initial, références communes jointes :

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.
Transparent background: nothing is drawn outside the subject.
Use case: illustration-story. Subject and composition: A generic browser window without any text, shown frontally. A saxophone emerges halfway through the window, its bell facing upward as though piercing the interface. Three simple musical notes float beyond the browser frame, all safely inside the canvas. No people. Lantern at window foot illuminates saxophone bell. Simplify instrument to bold recognizable outline and just a few keys.
Canvas EXACT 1600 x 1200 pixels, aspect ratio 1600:1200. Camera consistent with sober book wood engraving, horizon at two thirds where visible. Main cut lines about 5px at 1600px width, shadow hatches about 1px, sparse, no texture elsewhere. All objects stay within generous canvas margin. Light source anchor: center of red lantern flame at exactly x=64% of total canvas width and y=82% of total canvas height, measured from upper-left. Place the flame at that coordinate, not lantern top or base.
References 1-2 are lantern model only, ignore their colours, book, glow. References 3-4 define simplified cage geometry; omit their rays. Only black, white and pure red. Keep white paper absolutely clean and solid areas absolutely flat. No speckle, no paper grain. Simplified silhouettes, half the usual detail. No text-like strokes even on blank pages.
Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
Final direction: this is an extremely SPARSE woodcut. At least half of object surfaces untouched white, shadow areas SOLID black. At most 20 short hatch strokes in entire scene. No uniform surface texture. Lantern must be SMALL so flame coordinates remain precisely as specified.
```

## PRJ-10 — nuit

Édition du jour livré avant recalage local éventuel, avec le jour en première référence puis les quatre références communes.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.
Transparent background: nothing is drawn outside the subject.
Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.
Use case: lighting-weather EDIT. IMAGE 1 IS THE DAY MASTER TO EDIT. Images 2-5 are supporting lantern geometry references only, not layouts. Keep EXACT 1448x1086 pixel canvas, every object silhouette, lantern position, framing, crop and perspective unchanged. Do not zoom, shift, add or delete objects. Change ONLY ink coverage and illumination. Replace broad white surfaces with solid black; leave a few thin white contours. At least 80 percent of opaque subject pixels must be pure #000000 black. Every transparent pixel outside subject stays transparent; do not fill the canvas. The flame is pure red, a small red hatch pool illuminates the principal subject. No gradients, no rays, no halo.   Use fewer lines than day; shadows entirely black, no large white fills. Limit whites to thin outlines. No paper grain.
Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

Empreintes SHA-256 des masters livrés :

- `PRJ-10.png` : `e84ba79b359801bf5a6ac3c614ee5bb892d96b6888609470560f17f76bfc4f44`.
- `PRJ-10.nuit.png` : `5cfad5299eab9fa85fbcefaa5c09a598bf591b8ec3e089aec13b66daf21d7927`.

## PRJ-11 — jour

Prompt initial, références communes jointes :

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.
The scene fills the frame edge to edge; empty areas are white paper.
Use case: illustration-story. Subject and composition: A path of three flat stones leads from lower left toward three open storage boxes of different sizes in a row. A small lantern stands on each lid: only the first lantern is lit, the other two are unlit black silhouettes. A ruler and brush protrude from the first box. The first lit lantern is the only light source. All three boxes and all stones entirely contained in wide panoramic canvas, first box central.
Canvas EXACT 1800 x 600 pixels, aspect ratio 1800:600. Camera consistent with sober book wood engraving, horizon at two thirds where visible. Main cut lines about 5px at 1600px width, shadow hatches about 1px, sparse, no texture elsewhere. All objects stay within generous canvas margin. Light source anchor: center of red lantern flame at exactly x=46% of total canvas width and y=38% of total canvas height, measured from upper-left. Place the flame at that coordinate, not lantern top or base.
References 1-2 are lantern model only, ignore their colours, book, glow. References 3-4 define simplified cage geometry; omit their rays. Only black, white and pure red. Keep white paper absolutely clean and solid areas absolutely flat. No speckle, no paper grain. Simplified silhouettes, half the usual detail. No text-like strokes even on blank pages.
Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
Final direction: this is an extremely SPARSE woodcut. At least half of object surfaces untouched white, shadow areas SOLID black. At most 20 short hatch strokes in entire scene. No uniform surface texture. Lantern must be SMALL so flame coordinates remain precisely as specified.
```

### Correction ciblée de composition ou de placement

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.
The scene fills the frame edge to edge; empty areas are white paper.
Precise object EDIT of image 1. MOVE the first LIT lantern 23 pixels RIGHT and 51 pixels DOWN. Keep other two lanterns unlit and fixed. Redraw background vacated by lantern. Do not just change its design. New lit flame centroid must land at (46% width,38% height). All other objects, canvas dimensions and aspect, camera and crop unchanged. Remove every red hatch floating in air, red only on surface and flame.
Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

## PRJ-11 — nuit

Édition du jour livré avant recalage local éventuel, avec le jour en première référence puis les quatre références communes.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.
The scene fills the frame edge to edge; empty background is solid black at night.
Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.
Use case: lighting-weather EDIT. IMAGE 1 IS THE DAY MASTER TO EDIT. Images 2-5 are supporting lantern geometry references only, not layouts. Keep EXACT 2172x724 pixel canvas, every object silhouette, lantern position, framing, crop and perspective unchanged. Do not zoom, shift, add or delete objects. Change ONLY ink coverage and illumination. Replace broad white surfaces with solid black; leave a few thin white contours. At least 80 percent of all image pixels must be pure #000000 black. Solid black night background, zero grain. The flame is pure red, a small red hatch pool illuminates the principal subject. No gradients, no rays, no halo.  Only first lantern lit; other two stay unlit. Use fewer lines than day; shadows entirely black, no large white fills. Limit whites to thin outlines. No paper grain.
Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

Empreintes SHA-256 des masters livrés :

- `PRJ-11.png` : `20878084fa41c94d07a3aeecf3c8fead80fb166622db30001df94a065ba28426`.
- `PRJ-11.nuit.png` : `b807d5f55a7aec49a30957fa7db95f02bd9f77f1c6236ba0459e52b7b8d99c9b`.

## PRJ-12 — jour

Prompt initial, références communes jointes :

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.
The scene fills the frame edge to edge; empty areas are white paper.
Use case: illustration-story. Subject and composition: An open shelf seen frontally from slightly above: at left an older closed book standing vertically with a worn blank spine; at right a new manual open flat on the shelf. A lantern between them illuminates only the old book spine with red hatching. Pages and spines blank. Minimal shelf with no decorative trim.
Canvas EXACT 1600 x 1200 pixels, aspect ratio 1600:1200. Camera consistent with sober book wood engraving, horizon at two thirds where visible. Main cut lines about 5px at 1600px width, shadow hatches about 1px, sparse, no texture elsewhere. All objects stay within generous canvas margin. Light source anchor: center of red lantern flame at exactly x=50% of total canvas width and y=58% of total canvas height, measured from upper-left. Place the flame at that coordinate, not lantern top or base.
References 1-2 are lantern model only, ignore their colours, book, glow. References 3-4 define simplified cage geometry; omit their rays. Only black, white and pure red. Keep white paper absolutely clean and solid areas absolutely flat. No speckle, no paper grain. Simplified silhouettes, half the usual detail. No text-like strokes even on blank pages.
Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
Final direction: this is an extremely SPARSE woodcut. At least half of object surfaces untouched white, shadow areas SOLID black. At most 20 short hatch strokes in entire scene. No uniform surface texture. Lantern must be SMALL so flame coordinates remain precisely as specified.
```

### Correction ciblée de composition ou de placement

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.
The scene fills the frame edge to edge; empty areas are white paper.
Precise object EDIT of image 1. MOVE the lantern 72 pixels RIGHT, no vertical shift. Redraw background vacated by lantern. Do not just change its design. New lit flame centroid must land at (50% width,58% height). All other objects, canvas dimensions and aspect, camera and crop unchanged. Remove every red hatch floating in air, red only on surface and flame.
Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

## PRJ-12 — nuit

Édition du jour livré avant recalage local éventuel, avec le jour en première référence puis les quatre références communes.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.
The scene fills the frame edge to edge; empty background is solid black at night.
Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.
Use case: lighting-weather EDIT. IMAGE 1 IS THE DAY MASTER TO EDIT. Images 2-5 are supporting lantern geometry references only, not layouts. Keep EXACT 1448x1086 pixel canvas, every object silhouette, lantern position, framing, crop and perspective unchanged. Do not zoom, shift, add or delete objects. Change ONLY ink coverage and illumination. Replace broad white surfaces with solid black; leave a few thin white contours. At least 80 percent of all image pixels must be pure #000000 black. Solid black night background, zero grain. The flame is pure red, a small red hatch pool illuminates the principal subject. No gradients, no rays, no halo.   Use fewer lines than day; shadows entirely black, no large white fills. Limit whites to thin outlines. No paper grain.
Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

Empreintes SHA-256 des masters livrés :

- `PRJ-12.png` : `663b5bb8d944cbbf47cb28b4c5f32228cb17ab44e67df18d549c7026c159b0d0`.
- `PRJ-12.nuit.png` : `4592c9564c15ce837bc16cddaaaa44bcf6109d92a40eee17ef5ba9b7e851af50`.

## Retouches déterministes du 14 octobre 2026

Corrections demandées par l’audit des images et la relecture en situation, faites dans le dépôt avec Pillow (Python), sans génération ni édition générative : les opérations ci-dessous, aux coordonnées en pixels des masters. Les masters retouchés remplacent les précédents ; `npm run visuels:rendre <ID>` a refait leurs rendus.

| Fichier | Opération | Après |
|---|---|---|
| `PRJ-10.nuit.png` | Les notes de musique, restées noires sur fond transparent, disparaissaient sur le fond de nuit. Report en blanc des traits du jour, sans ouverture, dans les boîtes x 900–1010, y 20–320 et x 1010–1160, y 20–368, avec l’opacité du jour. | Les trois notes en blanc, à la même place que le jour. |
