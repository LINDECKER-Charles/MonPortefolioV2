# Masters des images générées — série « parcours »

## Planche d’essai, étape 0

Deux masters pour `CMP-02`, jour et nuit, selon la demande du 13 octobre 2026.
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
| `CMP-02.png` | [Jour : génération et corrections](#prompt-de-jour) | 13 octobre 2026 | Outil intégré OpenAI `image_gen`, références ci-dessous ; original final `exec-a4f24919-e74a-4509-8f28-25de14ae7cb3.png`. |
| `CMP-02.nuit.png` | [Édition de nuit](#prompt-de-nuit) | 13 octobre 2026 | Édition par `image_gen` du master de jour, puis correction locale du schéma éclairé ; original final `exec-bda196c0-8707-4526-9418-0afa94a513c0.png`. |

## Vérification par superposition

- Dimensions des deux masters : **1254 × 1254** ; fond transparent.
- Centre de la flamme, jour : **26,52 % × 84,40 %** ; nuit : **26,49 % × 84,49 %**.
- Cible : **26 % × 84 %**, avec une tolérance de ±3 points sur chaque axe depuis le coin supérieur gauche : conforme.
- Noir visuel nocturne : **78,19 %** des pixels opaques (alpha ≥ 250), avec les canaux RVB ≤ 32. Le seuil de 70 % est atteint avec ce critère ; il ne l’est pas pour le seul noir strict `#000000`.
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

Subject: The blackboard and the chalk.
Composition: A freestanding blackboard, front view, one centred object: a diagram with three boxes joined by exactly two arrows, the final box larger and filled (the pupil proceeding independently); a stick of chalk on the ledge. A small lantern at the foot of the blackboard, its flame centred at 26% of the total image width and 84% of the total image height, lights the diagram obliquely. No person, no screen, no text or numbers.

Simplified composition: plain frame and stand with broad untouched white areas and large solid black masses, just a few sparse short hatch strokes in the shadows, no wood grain. Three simple diagram boxes and exactly two arrows. The last bigger box is filled; a few red hatches on that box indicate the illumination. No radiating lines around it. The chalk is one plain short stick with no markings. The lantern has one simple drop flame, and no rays, glow or red marks outside the opaque object. Framing: exact square 1:1, 1280 × 1280 canvas. Actual transparent background. The blackboard and stand occupy at least 70% of the square; board top at 7%, board bottom around 67%, feet down to 95%; level reference at lower third. Main strokes about 6 px at final 480 px, readable at 160 px. Minimum 4% uncut margin. HARD registration: centre of flame (333,1075) on 1280 × 1280, tolerance 3% of width/height. Small lantern cage x=20–32%, y=77–91%, ring near y=70%, base at y=95%.

The attached images are references only: images 1 and 2 for the hand-cut line and recurring lantern motif, images 3 and 4 for the simple square four-post lantern with a ring and a drop-shaped flame. Do not reproduce their book, lettering, colours, rays or glow. Key colours only, clean flat fills without microtexture. No light rays or radial marks anywhere: red light appears ONLY as a few hatch marks on the illuminated main object and inside the lantern flame. All elements remain inside the image with a clear uncut margin. Simplify hands to silhouettes, no anatomical rendering.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

## Prompt de nuit

Texte exact de l’édition du master de jour :

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

Transparent background: nothing is drawn outside the subject. Preserve the existing transparent pixels and silhouette exactly.

Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.

EDIT image 5, the supplied final day master. Keep its exact native pixel dimensions, crop, camera, every object position, shape, size, overlap and pose. Do not generate a new composition. Only change ink coverage and illumination. Lock the lantern and its red flame in place at 26% width and 84% height. Keep all white outlines on the same existing edges. Replace broad white surfaces with solid black; allow only a few very thin white engraved contour lines outside the lit area. At least 70% of the opaque subject pixels must be pure black #000000. Preserve the transparent background; black fills belong only inside existing object silhouettes. The red hatch marks follow illuminated surfaces near the lantern and the main subject, never float through the air; no rays, halo, diffuse glow, gradient, radiating marks, or large red wash. Use pure black, white and red only, no grey texture. Images 1–4 are lantern style references, never composition alternatives.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

### Correction du schéma éclairé

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

Transparent background: nothing is drawn outside the subject.

Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.

EDIT THE FIRST IMAGE, which is the night version. Keep every object and every edge at exactly the same pixel coordinates. Keep the same transparent background and dimensions. Change only the diagonal WHITE hatch strokes inside the large RIGHTMOST BOX on the blackboard into RED #FF0000 hatch strokes, so the lantern lights this main subject. Do not add light rays, do not change the arrows or move any object. Keep at least 70% of the opaque picture black, and the red flame exactly where it is. Images 2–5 are lantern style references only.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```
