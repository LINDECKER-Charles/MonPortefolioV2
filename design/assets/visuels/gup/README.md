# Masters générés — série « gup »

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
| [GUP-01.png](GUP-01.png) | [Jour](#gup-01--jour) | 2026-10-13 | `exec-a29e65de-caae-43df-a272-6fc930f093fd.png` |
| [GUP-01.nuit.png](GUP-01.nuit.png) | [Édition de nuit](#gup-01--nuit) | 2026-10-13 | `exec-84d0e33f-66a7-4435-8ad4-21d640e37111.png` |
| [GUP-03.png](GUP-03.png) | [Jour](#gup-03--jour) | 2026-10-13 | `exec-f65a7c76-3633-4ccb-9fc1-e43cfe8d2225.png` |
| [GUP-03.nuit.png](GUP-03.nuit.png) | [Édition de nuit](#gup-03--nuit) | 2026-10-13 | `exec-531e38c3-5463-423c-aba5-db3a37d9f69a.png` |

## Contrôles

Les coordonnées sont mesurées depuis le coin supérieur gauche jusqu’au centre de la flamme. Le contrôle associe superposition d’une croix et d’une boîte de tolérance de ±3 points de pourcentage, composantes rouges et inspection visuelle. Le pourcentage de noir porte sur les pixels opaques (alpha ≥250) dont les trois canaux sont ≤32/255 ; la transparence n’est pas comptée comme du noir.

| ID | Canvas final commun jour/nuit | Cible | Jour mesuré | Nuit mesurée | Noir nuit |
|---|---|---|---|---|---|
| GUP-01 | 1448 × 1086 | 76,00 % × 40,00 % | 78,28 % × 41,98 % | 78,21 % × 41,79 % | 81,59 % |
| GUP-03 | 1586 × 992 | 50,00 % × 70,00 % | 49,97 % × 72,58 % | 49,96 % × 72,52 % | 92,61 % |

Les 16 lanternes visibles de ce lot respectent la tolérance de position ; OMN-01 et BLR-05 placent la lanterne hors champ conformément à leurs fiches. Tous les fonds transparents le restent. Les marges de noir nocturnes dépassent 70 % selon la mesure ci-dessus.

Les sorties conservent des valeurs intermédiaires sur les contours et les surfaces issues du générateur : elles ne constituent donc pas une palette indexée strictement limitée aux trois codes hexadécimaux. Aucune quantification globale n’a été appliquée. Les ratios sont ceux demandés à l’arrondi natif près (écart relatif maximal de 0,161 % pour ce lot). Les dimensions jour/nuit sont identiques après les corrections de bord décrites ci-dessous ; le modèle a toutefois redessiné certains contours pendant l’édition nocturne. L’identité géométrique de chaque trait au pixel près n’est pas garantie.

Les six machines et six colis traduisent la demande de réduire de moitié les objets. Les écrans et étiquettes restent sans pseudo-texte. La flaque et les surfaces reçoivent des hachures rouges, sans ruban de lumière diffus.

## Opérations locales après génération

Translations sous masque de la lanterne complète et raccord du fond proche, sans déplacement du canvas ni des autres objets. Les corrections de bord des nuits ajoutent ou retirent uniquement 1–2 pixels sur les bords droit/bas, sans redimensionner la scène. Aucun changement global de palette.

| Fichier | Opération |
|---|---|
| GUP-01.png | translation (0, 0) px ; transparence hors support, fond local sur support ; hauteur de la lanterne ×1.15, pied maintenu à y=582 px |
| GUP-01.nuit.png | translation (-32, 0) px ; transparence hors support, fond local sur support ; hauteur de la lanterne ×1.15, pied maintenu à y=599 px ; 1447 × 1087 → 1448 × 1086 px par bord droit/bas, sans mise à l’échelle |
| GUP-03.png | aucune |
| GUP-03.nuit.png | aucune |

## GUP-01 — jour

Prompt initial, références communes jointes :

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.
Transparent background: nothing is drawn outside the subject.
Use case: illustration-story. Subject and composition: Six small different simple machines on left, each with one lever or crank, their tangled cables converge toward one clean box at right bearing a single circular arrow symbol. A lantern on the clean box illuminates only the box; machines stay in shadow. Simplify machines to solid bold silhouettes, no micro-mechanical parts. Entire composition fits margins and is readable at 320px wide.
Canvas EXACT 1200 x 900 pixels, aspect ratio 1200:900. Camera consistent with sober book wood engraving, horizon at two thirds where visible. Main cut lines about 3px at 1600px width, shadow hatches about 1px, sparse, no texture elsewhere. All objects stay within generous canvas margin. Light source anchor: center of red lantern flame at exactly x=76% of total canvas width and y=40% of total canvas height, measured from upper-left. Place the flame at that coordinate, not lantern top or base.
References 1-2 are lantern model only, ignore their colours, book, glow. References 3-4 define simplified cage geometry; omit their rays. Only black, white and pure red. Keep white paper absolutely clean and solid areas absolutely flat. No speckle, no paper grain. Simplified silhouettes, half the usual detail. No text-like strokes even on blank pages.
Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
Final direction: extremely SPARSE woodcut. At least half of object surfaces untouched white, shadows SOLID black. At most 20 short hatch strokes total. No uniform surface texture. The lantern is small and centered on its specified flame anchor.
```

### Correction ciblée de composition ou de placement

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.
Transparent background: nothing is drawn outside the subject.
Precise object EDIT of image 1. Move the lantern 73 pixels LEFT and 35 pixels UP so flame centroid is 76% canvas width and 40% height. Keep its supporting box under it. Give each machine and box broad opaque PURE WHITE faces with black shadows, so these are solid black-and-white objects on transparent background, rather than black-only outlines. Keep canvas dimensions and aspect ratio unchanged. Preserve other objects and sparse handcut style. No grey noise.
Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

## GUP-01 — nuit

Édition du jour livré avant recalage local éventuel, avec le jour en première référence puis les quatre références communes.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.
Transparent background: nothing is drawn outside the subject.
Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.
Use case: lighting-weather EDIT. IMAGE 1 IS THE DAY MASTER TO EDIT. Images 2-5 are supporting lantern geometry references only, not layouts. Keep EXACT 1448x1086 pixel canvas, every object silhouette, lantern position, framing, crop and perspective unchanged. Do not zoom, shift, add or delete objects. Change ONLY ink coverage and illumination. Replace broad white surfaces with solid black; leave a few thin white contours. At least 80 percent of opaque subject pixels must be pure #000000 black. Every transparent pixel outside subject stays transparent; do not fill the canvas. The flame is pure red, a small red hatch pool illuminates the principal subject. No gradients, no rays, no halo.   Use fewer lines than day; shadows entirely black, no large white fills. Limit whites to thin outlines. No paper grain.
Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

Empreintes SHA-256 des masters livrés :

- `GUP-01.png` : `22e990e12fe0e4f06d1d839e7e16fcbb55f0e1f8d7a6f5f5e039ac19b00aae7d`.
- `GUP-01.nuit.png` : `ce018e9b196cc38a5b66f5990301f49ad87b424ced104fdbb127db2e0367c83b`.

## GUP-03 — jour

Prompt initial, références communes jointes :

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.
The scene fills the frame edge to edge; empty areas are white paper.
Use case: illustration-story. Subject and composition: An empty generic terminal window centered, with a lantern standing in front. Around it an arc of six simple generic closed parcels. Lantern illuminates the nearest parcels with sparse short red hatches on their surfaces. No connecting light rays or flare lines. No characters inside terminal, not even a cursor. Window and lantern central for wide crop. Very simple broad silhouettes.
Canvas EXACT 1600 x 1000 pixels, aspect ratio 1600:1000. Camera consistent with sober book wood engraving, horizon at two thirds where visible. Main cut lines about 3px at 1600px width, shadow hatches about 1px, sparse, no texture elsewhere. All objects stay within generous canvas margin. Light source anchor: center of red lantern flame at exactly x=50% of total canvas width and y=70% of total canvas height, measured from upper-left. Place the flame at that coordinate, not lantern top or base.
References 1-2 are lantern model only, ignore their colours, book, glow. References 3-4 define simplified cage geometry; omit their rays. Only black, white and pure red. Keep white paper absolutely clean and solid areas absolutely flat. No speckle, no paper grain. Simplified silhouettes, half the usual detail. No text-like strokes even on blank pages.
Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
Final direction: extremely SPARSE woodcut. At least half of object surfaces untouched white, shadows SOLID black. At most 20 short hatch strokes total. No uniform surface texture. The lantern is small and centered on its specified flame anchor.
```

## GUP-03 — nuit

Édition du jour livré avant recalage local éventuel, avec le jour en première référence puis les quatre références communes.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.
The scene fills the frame edge to edge; empty background is solid black at night.
Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.
Use case: lighting-weather EDIT. IMAGE 1 IS THE DAY MASTER TO EDIT. Images 2-5 are supporting lantern geometry references only, not layouts. Keep EXACT 1586x992 pixel canvas, every object silhouette, lantern position, framing, crop and perspective unchanged. Do not zoom, shift, add or delete objects. Change ONLY ink coverage and illumination. Replace broad white surfaces with solid black; leave a few thin white contours. At least 80 percent of all image pixels must be pure #000000 black. Solid black night background, zero grain. The flame is pure red, a small red hatch pool illuminates the principal subject. No gradients, no rays, no halo.   Use fewer lines than day; shadows entirely black, no large white fills. Limit whites to thin outlines. No paper grain.
Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

Empreintes SHA-256 des masters livrés :

- `GUP-03.png` : `32b7e520e31df440c0089e9e29b75de9fea69f920b42a9bed7049625bf3c7cfe`.
- `GUP-03.nuit.png` : `2697f077392718421e5756fafdf54d6be22c0ad27847d09d780bdd01876e7991`.

## Retouches déterministes du 14 octobre 2026

Corrections demandées par l’audit des images et la relecture en situation, faites dans le dépôt avec Pillow (Python), sans génération ni édition générative : les opérations ci-dessous, aux coordonnées en pixels des masters. Les masters retouchés remplacent les précédents ; `npm run visuels:rendre <ID>` a refait leurs rendus.

| Fichier | Opération | Après |
|---|---|---|
| `GUP-01.nuit.png` | La flèche circulaire de la face de la boîte avait disparu. Report en blanc des traits épais du jour (ouverture de 9 px), boîte x 1030–1210, y 620–800 du jour, décalée de (+25, +10) px : la boîte de nuit est un peu plus grande et décalée par rapport au jour. | La face de la boîte porte de nouveau sa flèche. Restent, à reprendre : la flèche qui se lit comme un « C », le lavis rouge de la cage. |
