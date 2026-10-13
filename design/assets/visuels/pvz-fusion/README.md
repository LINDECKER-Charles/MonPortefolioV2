# Masters des images générées — série « pvz-fusion »

## Planche d’essai, étape 0

Deux masters pour `PVZ-05`, jour et nuit, selon la demande du 13 octobre 2026.
Le bloc de style inclut « Economical line work… » et le prompt négatif les exclusions
supplémentaires demandées. La version de nuit est une édition du jour, jamais une nouvelle
composition. La série complète attend la validation de cette nouvelle planche.

Aucun traitement des pixels après génération : les PNG natifs sont copiés tels quels.
Les trois couleurs de clé sont prescrites au générateur ; ses bords anticrénelés et son grain
conservent des valeurs intermédiaires. Les dimensions sont identiques dans chaque paire,
mais l’édition générative redessine légèrement certains contours : l’identité géométrique
au pixel près n’est pas certifiée. Les fonds transparents restent transparents.

Le script de séparation n’a pas été lancé pour ces versions ; aucun WebP n’est livré.
Le code du site et la commande `docs/visuels-a-generer.md` ne sont pas modifiés.

| Fichier | Prompt | Date | Provenance |
|---|---|---|---|
| `PVZ-05.png` | [Jour : génération et corrections](#prompt-de-jour) | 13 octobre 2026 | Outil intégré OpenAI `image_gen`, références ci-dessous ; original final `exec-fae40f5c-ee0d-4119-b9cb-e18f320aefd7.png`. |
| `PVZ-05.nuit.png` | [Édition de nuit](#prompt-de-nuit) | 13 octobre 2026 | Édition par `image_gen` du master de jour ; original final `exec-8ccc060d-fee7-4f46-92d9-99c6f26df6d4.png`. |

## Vérification par superposition

- Dimensions des deux masters : **1254 × 1254** ; fond transparent.
- Centre de la flamme, jour : **77,87 % × 79,69 %** ; nuit : **77,73 % × 77,77 %**.
- Cible : **78 % × 80 %**, avec une tolérance de ±3 points sur chaque axe depuis le coin supérieur gauche : conforme.
- Noir visuel nocturne : **79,92 %** des pixels opaques (alpha ≥ 250), avec les canaux RVB ≤ 32. Le seuil de 70 % est atteint avec ce critère ; il ne l’est pas pour le seul noir strict `#000000`.
- Cadrage général conservé ; certains contours et hachures sont légèrement redessinés. Aucun halo diffus ni rayon. Les flaques nocturnes sont dessinées en hachures rouges, conformément à la demande.

## Références jointes

- `design/assets/marque/livre-lanterne/logo-illustre.png`
- `site/src/assets/marque/logo-symbole.webp`
- `site/src/assets/visuels/accueil/ACC-14.svg`, rendu en PNG à 300 dpi sur blanc
- `site/src/assets/visuels/global/GLO-03.svg`, rendu en PNG à 300 dpi sur blanc

Les éditions joignent aussi le master précédent. Les corrections de position utilisent une
copie de contrôle avec repère bleu superposé ; le repère est supprimé par le générateur.
Les copies de contrôle restent hors du dépôt. Le point mesuré est le centroïde de la flamme
rouge isolée des autres hachures d’éclairage, contrôlé aussi visuellement par superposition.

## Prompt de jour

Texte exact de la génération initiale :

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

Transparent background: nothing is drawn outside the subject.

Subject: Organising: a shared board.
Composition: A single centred motif: three blank cards pinned side by side, seen in three-quarter view; an anonymous simplified silhouette hand unpins one; a small lantern at the bottom right, its flame centred at 78% of the total image width and 80% of the total image height, lights the card being taken.

Simplified composition: only the three cards with their three pins, one hand with a short plain cuff fully contained in the frame, and the small lantern. No wooden backing board, no extra objects. Large uninterrupted white card faces; broad black silhouette areas on the hand, thick irregular hand-cut outlines. Just 3–5 widely spaced hatches in a shadow corner of a card, no detailed anatomy or wood grain. Red hatching only on the centre card being taken and the drop-shaped flame. No red rays or light drawn in the transparent gaps. Framing: exact square 1:1, 1280 × 1280 canvas. No horizon, actual transparent background. Motif occupies at least 60% of the frame and is legible at 96 px, main strokes about 8 px at final 480 px. At least 4% clear margin, no cropped wrist, cuff, cards or lantern. HARD registration: flame centre (998,1024) on 1280 × 1280, tolerance 3% of width/height. The lantern is small: cage about x=71–85%, y=71–90%; top ring around y=64%, base at y=94%.

The attached images are references only: images 1 and 2 for the hand-cut line and recurring lantern motif, images 3 and 4 for the simple square four-post lantern with a ring and a drop-shaped flame. Do not reproduce their book, lettering, colours, rays or glow. Key colours only, clean flat fills without microtexture. No light rays or radial marks anywhere: red light appears ONLY as a few hatch marks on the illuminated main object and inside the lantern flame. All elements remain inside the image with a clear uncut margin. Simplify hands to silhouettes, no anatomical rendering.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

### Correction de placement

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

Transparent background: nothing is drawn outside the subject.

Precise positional edit. Image 5 is the draft with a BLUE calibration cross and a BLUE tolerance rectangle, which are guides and MUST disappear from the final output. Images 1–4 are the same lantern references. Preserve the canvas dimensions and scene composition. Move the WHOLE lantern as a rigid object, without resizing it, until the CENTRE OF ITS RED FLAME sits exactly on the BLUE CROSS. Do not move the cross target, the other objects or the camera. Remove the original lantern at its old position and restore the background there. Only one lantern in the final image. No trace of blue calibration marks.

Canvas 1254 × 1254: move the lantern RIGHT about 80 pixels and DOWN about 40 pixels, so the flame centre is at (978,1003), or 78% width and 80% height. Its red flame must be where the blue guide cross is now. Keep the cards, pins and hand exactly where they are; preserve actual transparency. Keep the lantern base completely inside the frame. Simplify the card shadow corners to at most five short hand-cut hatches each, keep the card faces completely blank, with no grain.

All lines and shadows remain a spare wood engraving with slightly irregular hand-cut line ends, no micro-detail. Red is only the flame and a few hatches on the illuminated main subject, never rays or a halo. Nothing cropped.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

## Prompt de nuit

Texte exact de l’édition du master de jour :

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

Transparent background: nothing is drawn outside the subject. Preserve the existing transparent pixels and silhouette exactly.

Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.

EDIT image 5, the supplied final day master. Keep its exact native pixel dimensions, crop, camera, every object position, shape, size, overlap and pose. Do not generate a new composition. Only change ink coverage and illumination. Lock the lantern and its red flame in place at 78% width and 80% height. Keep all white outlines on the same existing edges. Replace broad white surfaces with solid black; allow only a few very thin white engraved contour lines outside the lit area. At least 70% of the opaque subject pixels must be pure black #000000. Preserve the transparent background; black fills belong only inside existing object silhouettes. The red hatch marks follow illuminated surfaces near the lantern and the main subject, never float through the air; no rays, halo, diffuse glow, gradient, radiating marks, or large red wash. Use pure black, white and red only, no grey texture. Images 1–4 are lantern style references, never composition alternatives.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```
