# Masters générés — série « omnicard »

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
| [OMN-01.png](OMN-01.png) | [Jour](#omn-01--jour) | 2026-10-13 | `exec-2db43107-a40e-4a8b-8b7a-fba0ce97c0ce.png` |
| [OMN-01.nuit.png](OMN-01.nuit.png) | [Édition de nuit](#omn-01--nuit) | 2026-10-13 | `exec-3ff06f00-fce0-4f89-93a2-a4692da52ca6.png` |

## Contrôles

Les coordonnées sont mesurées depuis le coin supérieur gauche jusqu’au centre de la flamme. Le contrôle associe superposition d’une croix et d’une boîte de tolérance de ±3 points de pourcentage, composantes rouges et inspection visuelle. Le pourcentage de noir porte sur les pixels opaques (alpha ≥250) dont les trois canaux sont ≤32/255 ; la transparence n’est pas comptée comme du noir.

| ID | Canvas final commun jour/nuit | Cible | Jour mesuré | Nuit mesurée | Noir nuit |
|---|---|---|---|---|---|
| OMN-01 | 1448 × 1086 | 0,00 % × 45,00 % | hors champ (fiche) | hors champ (fiche) | 90,06 % |

Les 16 lanternes visibles de ce lot respectent la tolérance de position ; OMN-01 et BLR-05 placent la lanterne hors champ conformément à leurs fiches. Tous les fonds transparents le restent. Les marges de noir nocturnes dépassent 70 % selon la mesure ci-dessus.

Les sorties conservent des valeurs intermédiaires sur les contours et les surfaces issues du générateur : elles ne constituent donc pas une palette indexée strictement limitée aux trois codes hexadécimaux. Aucune quantification globale n’a été appliquée. Les ratios sont ceux demandés à l’arrondi natif près (écart relatif maximal de 0,161 % pour ce lot). Les dimensions jour/nuit sont identiques après les corrections de bord décrites ci-dessous ; le modèle a toutefois redessiné certains contours pendant l’édition nocturne. L’identité géométrique de chaque trait au pixel près n’est pas garantie.

OMN-01 : la source est hors champ à gauche, selon la fiche. Il n’y a donc pas de flamme visible à mesurer. Les rayons diffus demandés initialement par la composition ont été remplacés par des hachures rouges sur les surfaces, conformément à la correction de style de Charles.

## Opérations locales après génération

Translations sous masque de la lanterne complète et raccord du fond proche, sans déplacement du canvas ni des autres objets. Les corrections de bord des nuits ajoutent ou retirent uniquement 1–2 pixels sur les bords droit/bas, sans redimensionner la scène. Aucun changement global de palette.

| Fichier | Opération |
|---|---|
| OMN-01.png | aucune |
| OMN-01.nuit.png | aucune |

## OMN-01 — jour

Prompt initial, références communes jointes :

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.
The scene fills the frame edge to edge; empty areas are white paper.
Use case: illustration-story. Subject and composition: One handmade laminated playing card with a visible plastic sleeve and bent corner straddles the edge of a generic browser window: the half outside remains handmade paper with scissor-cut edges, the half inside becomes a precise digital card. Generic blank face: plain outline frame, central diamond, one empty cost circle and two empty stat circles. Two blank paper cards lie on the table. The single lantern is completely OFF CANVAS to the left, its source at x0 percent y45 percent. Do not depict or crop any part of it. Only its red hatched illumination reaches the main card. Center the entire main card within the middle third so square and portrait crops retain it. No UI text, no person, no rays.
Canvas EXACT 1600 x 1200 pixels, aspect ratio 1600:1200. Camera consistent with sober book wood engraving, horizon at two thirds where visible. Main cut lines about 3px at 1600px width, shadow hatches about 1px, sparse, no texture elsewhere. All objects stay within generous canvas margin. Light source anchor: center of red lantern flame at exactly x=0% of total canvas width and y=45% of total canvas height, measured from upper-left. Lantern stays off canvas as described; this is light-entry anchor.
References 1-2 are lantern model only, ignore their colours, book, glow. References 3-4 define simplified cage geometry; omit their rays. Only black, white and pure red. Keep white paper absolutely clean and solid areas absolutely flat. No speckle, no paper grain. Simplified silhouettes, half the usual detail. No text-like strokes even on blank pages.
Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
Final direction: extremely SPARSE woodcut. At least half of object surfaces untouched white, shadows SOLID black. At most 20 short hatch strokes total. No uniform surface texture. The lantern is small and centered on its specified flame anchor.
```

### Correction ciblée de composition ou de placement

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.
The scene fills the frame edge to edge; empty areas are white paper.
Precise object EDIT of image 1. Erase ALL red strokes from empty air on left, leaving clean white paper. Keep red hatches ONLY on main card, NOT floating between source and card. The lantern stays completely off canvas at left. Keep canvas dimensions and aspect ratio unchanged. Preserve other objects and sparse handcut style. No grey noise.
Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

## OMN-01 — nuit

Édition du jour livré avant recalage local éventuel, avec le jour en première référence puis les quatre références communes.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.
The scene fills the frame edge to edge; empty background is solid black at night.
Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.
Use case: lighting-weather EDIT. IMAGE 1 IS THE DAY MASTER TO EDIT. Images 2-5 are supporting lantern geometry references only, not layouts. Keep EXACT 1448x1086 pixel canvas, every object silhouette, lantern position, framing, crop and perspective unchanged. Do not zoom, shift, add or delete objects. Change ONLY ink coverage and illumination. Replace broad white surfaces with solid black; leave a few thin white contours. At least 80 percent of all image pixels must be pure #000000 black. Solid black night background, zero grain. The flame is pure red, a small red hatch pool illuminates the principal subject. No gradients, no rays, no halo. Keep lantern OFF CANVAS as in source; do not add a visible lantern.  Use fewer lines than day; shadows entirely black, no large white fills. Limit whites to thin outlines. No paper grain.
Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

Empreintes SHA-256 des masters livrés :

- `OMN-01.png` : `aca032949d7d06e4eda5db029e575a5885543816b8de6087109cc90ee750b3a5`.
- `OMN-01.nuit.png` : `54191544ac9d367376903c13edc0a425d461b3ece88341a4e2f76d8f9288f5d6`.
