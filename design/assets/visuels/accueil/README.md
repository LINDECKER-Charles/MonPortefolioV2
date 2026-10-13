# Masters des images générées — série « accueil »

## Planche d’essai, étape 0

Deux masters pour `ACC-03`, jour et nuit, selon la demande du 13 octobre 2026.
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
| `ACC-03.png` | [Jour : génération et corrections](#prompt-de-jour) | 13 octobre 2026 | Outil intégré OpenAI `image_gen`, références ci-dessous ; original final `exec-d7f203ed-0ead-4b9b-8ff8-f3a292afd7f9.png`. |
| `ACC-03.nuit.png` | [Édition de nuit](#prompt-de-nuit) | 13 octobre 2026 | Édition par `image_gen` du master de jour ; original final `exec-b5d3c47a-ba1f-49fb-89c4-f700a3273dda.png`. |

## Vérification par superposition

- Dimensions des deux masters : **1536 × 1024** ; fond opaque.
- Centre de la flamme, jour : **27,63 % × 59,94 %** ; nuit : **27,63 % × 60,04 %**.
- Cible : **28 % × 58 %**, avec une tolérance de ±3 points sur chaque axe depuis le coin supérieur gauche : conforme.
- Noir visuel nocturne : **88,96 %** des pixels opaques (alpha ≥ 250), avec les canaux RVB ≤ 32. Le seuil de 70 % est atteint avec ce critère ; il ne l’est pas pour le seul noir strict `#000000`.
- Cadrage général conservé ; certains contours et hachures sont légèrement redessinés. Aucun halo diffus ni rayon. Les flaques nocturnes sont dessinées en hachures rouges, conformément à la demande.

## Références jointes

- `design/assets/marque/livre-lanterne/logo-illustre.png`
- `site/src/assets/marque/logo-symbole.webp`
- `site/src/assets/visuels/accueil/ACC-14.svg`, rendu en PNG à 300 dpi sur blanc
- `site/src/assets/visuels/global/GLO-03.svg`, rendu en PNG à 300 dpi sur blanc
- `design/assets/illustrations/pc-vue-eclatee.svg`, rendu en PNG à 300 dpi sur blanc, uniquement pour la composition initiale ; chiffres et annotations exclus.

Les éditions joignent aussi le master précédent. Les corrections de position utilisent une
copie de contrôle avec repère bleu superposé ; le repère est supprimé par le générateur.
Les copies de contrôle restent hors du dépôt. Le point mesuré est le centroïde de la flamme
rouge isolée des autres hachures d’éclairage, contrôlé aussi visuellement par superposition.

## Prompt de jour

Texte exact de la génération initiale :

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

Subject: Taking apart old PCs with his father.
Composition: A workshop workbench seen in three-quarter view from slightly above: an old open PC tower in the centre; its side panel, motherboard, hard drive and two screws removed and arranged in an exploded view, each connected to its original place by a fine dotted assembly line; two pairs of hands, one adult's and one child's, each holding one part. A single lantern rests on the workbench at the left, its flame centred at 28% of the total image width and 58% of the total image height. It lights the parts. The workshop background is left white and empty. No brands, inscriptions or faces.

Simplified composition: a faceless adult silhouette at the left and a smaller faceless child silhouette at the right, both heads entirely within the frame, behind the table. Their plain black clothing forms large solid shapes; four simplified hands hold the motherboard and hard drive. The PC parts have only the few large features needed to identify them, no intricate circuits, labels or rows resembling text. The workbench is a large untouched white plane, except for sparse short hatching in shadows. No other objects. No rays, rings of light or hatch marks radiating into empty space. The red hatching is confined to the flame and small shadow areas on the illuminated PC parts. Framing: exact landscape 3:2, 1536 × 1024 canvas. Leave at least 4% clear margin around heads, all arms, table and parts; nothing cut by the image edge. Horizon at two-thirds height. Main outlines about 3 px at final 1800 px wide; shadow hatching about 1 px, with irregular hand-cut ends. Main subject fills at least 60% of frame, readable at 390 px. HARD registration: centre of flame at (430,594) on the 1536 × 1024 canvas, tolerance 3% of width/height. Lantern body around x=22–34%, y=42–71%.

The attached images are references only: images 1 and 2 for the hand-cut line and recurring lantern motif, images 3 and 4 for the simple square four-post lantern with a ring and a drop-shaped flame. Do not reproduce their book, lettering, colours, rays or glow. Key colours only, clean flat fills without microtexture. No light rays or radial marks anywhere: red light appears ONLY as a few hatch marks on the illuminated main object and inside the lantern flame. All elements remain inside the image with a clear uncut margin. Simplify hands to silhouettes, no anatomical rendering. Image 5 is a reference for the exploded arrangement and assembly dots only; omit its numbered labels, circles and annotations.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

### Correction de placement et simplification

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

Precise positional edit. Image 5 is the draft with a BLUE calibration cross and a BLUE tolerance rectangle, which are guides and MUST disappear from the final output. Images 1–4 are the same lantern references. Preserve the canvas dimensions and scene composition. Move the WHOLE lantern as a rigid object, without resizing it, until the CENTRE OF ITS RED FLAME sits exactly on the BLUE CROSS. Do not move the cross target, the other objects or the camera. Remove the original lantern at its old position and restore the background there. Only one lantern in the final image. No trace of blue calibration marks.

Canvas 1536 × 1024: move the lantern RIGHT about 90 pixels and UP about 80 pixels, so the flame centre is at (430,594), or 28% width and 58% height. Its red flame must be where the guide cross is now. The empty scene background and the table remain large clean white areas. Remove the uniform fine grain and most hatching from the tabletop, leaving just a few shadow strokes near objects. Make the detached PC side panel completely plain and blank: remove the row of black bars. No extra marks on blank panels. Keep both faceless heads fully visible.

All lines and shadows remain a spare wood engraving with slightly irregular hand-cut line ends, no micro-detail. Red is only the flame and a few hatches on the illuminated main subject, never rays or a halo. Nothing cropped.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

### Deuxième correction de placement

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

Edit image 5, the annotated illustration. Follow the blue ARROW: translate the entire lantern 55 pixels RIGHT and 56 pixels UP. The blue dashed rectangle shows its destination silhouette, and the blue circle and cross shows the destination centre of its flame. The final red flame must be centred inside the blue circle at x=430, y=594, in the full 1536 × 1024 image. The lantern is a single rigid object: move its ring, roof, cage, flame and base together. Do not change its scale, shape or orientation. Erase the old lantern position to the white tabletop. Remove ALL blue guides after moving it. Do not change the rest of the scene, camera, framing, dimensions, people, PC, parts or colours. Image 1–4 are lantern design references only. This is a precise local position edit, not a new illustration.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

### Calage final sur le gabarit superposé

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

EDIT THE FIRST IMAGE. Replace its blue ghost lantern outline with the real black-white-red lantern. The blue ghost outline is the exact required position and size of the lantern. Its blue centre dot must become the centre of the red flame. Erase the current black lantern to the RIGHT of the ghost outline and restore the tabletop and motherboard it covered. Final image: exactly ONE lantern, directly on top of the blue ghost guide, no blue pixels left. The flame centre must be at 430,594 on this 1536×1024 image. Preserve every other pixel position and the rest of the scene. Images 2–5 are visual references for the lantern shape only. DO NOT put the lantern to the right of the blue outline. The blue silhouette itself becomes the single finished lantern.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

## Prompt de nuit

Texte exact de l’édition du master de jour :

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge with opaque solid black night.

Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.

EDIT THE FIRST IMAGE, the final day master. Keep this exact 1536 × 1024 canvas and every object, silhouette, pose, camera, crop and contour position at the identical pixel coordinates. Do not move or resize the lantern: preserve the flame's current exact position. Change only colours and ink coverage. At least 75% of the full image is solid pure black #000000. The white paper background becomes pure black; the tabletop and PC surfaces become black. Outside the small lit pool, only sparse thin white lines suggest the father, child, PC, parts and workbench. No broad white masses or white surfaces. The red flame and red hatch marks on the nearby tabletop and motherboard are the only light, with a few red hatches on the main computer parts. All red hatching is clipped to the surfaces it lights, no light rays in the air, no halo, no glow, no diffuse red wash. The detached panel stays plain, no pseudo-text lines. Exactly the same scene, nothing added or removed. Images 2–5 are references for lantern style only.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```
