# Masters des images générées — série « pvz-fusion »

## Planche d’essai, étape 0

Deux masters pour `PVZ-05`, jour et nuit, selon la demande du 13 octobre 2026.
Le bloc de style inclut « Economical line work… » et le prompt négatif les exclusions
supplémentaires demandées. La version de nuit est une édition du jour, jamais une nouvelle
composition. La production complète a ensuite été autorisée ; elle est documentée plus bas.

Pour cette planche d’essai, aucun traitement des pixels après génération : les PNG natifs sont copiés tels quels.
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

<!-- production-complete-2026-10-13 -->

## Production de la série — 13 octobre 2026

La production complète a été autorisée après la planche d’essai. Les deux masters validés de `PVZ-05` et leur historique ci-dessus sont conservés sans modification. La présente section documente les onze nouvelles paires.

Livraison des masters de jour `<ID>.png` et de nuit `<ID>.nuit.png`. Générations et éditions réalisées avec l’outil intégré OpenAI `image_gen`, sans modèle détaillé ni graine fournis par le service. Chaque nuit a été créée en édition de son jour. Les recalages locaux des lanternes ont été autorisés, puis appliqués avec Sharp ; leurs paramètres sont consignés par image. Aucun lancement du script de séparation, aucune production de WebP ni modification du code ou de la commande.

Les dimensions natives sont conservées pour les jours ; elles sont inférieures aux dimensions demandées pour les carrés et les images 4:3. Les nuits ont la même taille que leur jour après, lorsque nécessaire, ajout ou retrait d’un pixel de bord, sans redimensionnement de la scène. Le cadrage général est commun, mais l’édition générative peut redessiner légèrement les contours : superposition au pixel près non garantie.

### Références et contrôle

Les quatre références suivantes sont jointes à chaque appel, dans cet ordre pour une génération initiale. Une édition joint d’abord son image à modifier, puis ces quatre références :

- `design/assets/marque/livre-lanterne/logo-illustre.png`
- `site/src/assets/marque/logo-symbole.webp`
- `site/src/assets/visuels/accueil/ACC-14.svg`, copie PNG de référence à 300 dpi sur blanc
- `site/src/assets/visuels/global/GLO-03.svg`, copie PNG de référence à 300 dpi sur blanc

Les copies de contrôle avec croix et rectangle bleus restent hors du dépôt. La position est le centroïde des pixels rouges de la flamme, isolée visuellement des reflets, depuis le coin supérieur gauche. Le contrôle utilise alpha > 200, R > 140, V/B < 110 et R > 1,7 × V. La cible autorise ±3 points sur chaque axe.

Le « noir visuel » compte les pixels opaques (alpha ≥ 250) dont les trois canaux RVB sont ≤ 32. Toutes les nuits dépassent 70 % selon ce critère. **Le noir strict `#000000` reste sous 70 %** : le grain et l’anticrénelage natifs conservent des valeurs intermédiaires malgré le prompt de trois couleurs pures. Aucune quantification globale n’a été appliquée. Les hachures demeurent parfois plus denses que la consigne économique. Ces PNG ne constituent donc pas encore des calques à clés chromatiques parfaitement pures.

| Paire | Dimensions finales | Fond | Cible flamme | Jour | Nuit | Noir visuel nuit | Noir strict nuit |
|---|---|---|---|---|---|---|---|
| PVZ-01 | 1448 × 1086 | opaque | 50,00 % × 60,00 % | 49,70 % × 60,50 % | 49,50 % × 60,73 % | 90,41 % | 53,97 % |
| PVZ-02a | 1448 × 1086 | opaque | 56,00 % × 58,00 % | 57,42 % × 57,60 % | 57,15 % × 57,33 % | 92,50 % | 63,64 % |
| PVZ-04 | 1254 × 1254 | transparent | 70,00 % × 30,00 % | 71,20 % × 31,79 % | 71,97 % × 32,58 % | 78,79 % | 38,77 % |
| PVZ-02b | 1448 × 1086 | opaque | 56,00 % × 58,00 % | 57,83 % × 58,67 % | 58,41 % × 59,27 % | 93,11 % | 63,42 % |
| PVZ-02c | 1448 × 1086 | opaque | 56,00 % × 58,00 % | 54,94 % × 56,85 % | 55,98 % × 57,86 % | 93,32 % | 64,82 % |
| PVZ-06 | 1254 × 1254 | transparent | sans cible visible | hors cadre | hors cadre | 82,19 % | 41,43 % |
| PVZ-07 | 1254 × 1254 | transparent | 76,00 % × 70,00 % | 75,04 % × 69,79 % | 75,12 % × 69,70 % | 73,10 % | 27,68 % |
| PVZ-08 | 1254 × 1254 | transparent | 50,00 % × 46,00 % | 50,00 % × 46,19 % | 49,81 % × 46,33 % | 85,87 % | 52,25 % |
| PVZ-11 | 1254 × 1254 | transparent | 62,00 % × 36,00 % | 61,12 % × 37,47 % | 61,15 % × 38,67 % | 72,16 % | 30,53 % |
| PVZ-09 | 1671 × 941 | opaque | 72,00 % × 46,00 % | 69,44 % × 48,74 % | 69,37 % × 48,43 % | 92,78 % | 52,69 % |
| PVZ-10 | 1447 × 1087 | opaque | 78,00 % × 70,00 % | 77,96 % × 69,08 % | 77,99 % × 69,19 % | 88,26 % | 45,06 % |

### PVZ-01

- Date : **13 octobre 2026**.
- Format demandé : 4:3, 1600 × 1200 px. Format livré : 1448 × 1086 px pour les deux variantes.
- Jour : [PVZ-01.png](PVZ-01.png), source native finale avant retouche locale : `exec-a2c54720-0ca9-409a-8ab6-08ba33178f6a.png`.
- Nuit : [PVZ-01.nuit.png](PVZ-01.nuit.png), source native finale avant retouche locale : `exec-584cea70-94c6-4ab9-b7ea-07ef3af42e77.png`.
- Première génération : `exec-c26b061b-9b4e-4564-a8cc-194f4a0e4b82.png`.
- SHA-256 livré, jour : `69f1dad7f6f7594ccdbbd260d1695fd041bdacb72714c359d468ffd0c2f06621`.
- SHA-256 livré, nuit : `1a6eca9aa98db53dadf28c006bcc7305d3ac27095e2322fd3f1728795f901d3d`.

**Prompt initial de jour, texte exact :**

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

Subject: Translation and teamwork.
Composition: A long work table in three-quarter view, seen slightly from above: paper cards pass from hand to hand, left to right. On the left, a single seated faceless silhouette passes a card; on the right, a small group of faceless silhouettes receives and checks it. Behind the group, a growing stack of cards. One lantern at the centre of the table, its flame centred at 50% width and 60% height, lights the card being passed while everything else is in hatched shadow. No writing, plants, zombies, garden or lawn grid.

Framing: EXACT 4:3 aspect ratio, requested canvas 1600 × 1200. Horizon at half height. Main outlines about 3 px at 1600 px width. The passing card and lantern must read at 358 px width. Few simple silhouettes, no detailed anatomy. HARD registration constraint: the CENTRE of the red flame is at 50% width, 60% height, measured from the upper-left corner; tolerance at most ±3 percentage points per axis. Position the whole small lantern around that point.

The four attached images are STYLE REFERENCES only, not scene alternatives: images 1 and 2 for the recurring lantern and hand-cut line; images 3 and 4 for its plain four-post cage, ring and drop-shaped flame. Never copy their lettering, colours, rays, halo or glow. Pure black, white and red only. Red marks belong on the illuminated object surfaces and flame, never in empty space.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

**Journal des prompts de correction, textes exacts :** certaines sorties intermédiaires ont été écartées ; seule la source finale indiquée plus haut est livrée.

Correction 1 :

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

EDIT image 1, using images 2–5 only as the recurring lantern style references. Keep exact canvas dimensions and aspect ratio. Keep the flame at 50% width and 60% height. Zoom the people back slightly so every head and shoulder is completely inside the canvas. Keep the table, passing card and card pile arrangement. The blue cross and rectangle are calibration guides only: remove them completely in the output. ECONOMICAL ENGRAVING CORRECTION: remove at least 90% of the existing hatching and all surface grain. Large clean white areas and broad solid black shapes; at most three to five coarse, widely spaced hatches in one shadow corner per object. No hatching over entire tabletop or clothing. Hands are simple solid silhouettes with no anatomical detail. Red light is a few sparse hatch marks only on the main card/sheet, not a large pool on the table. Use one flat pure-red drop flame, not a white inner flame. No gradients, tiny texture or excessive detail.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

**Prompt de nuit livré, texte exact :**

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas become solid black in this night edition.

Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.

EDIT image 1, the final day master; images 2–5 are the four lantern style references. Keep the EXACT native 1448 × 1086 pixel dimensions, aspect ratio, framing, camera, every object position, outline, scale, pose and overlap. Change ONLY ink coverage and illumination. Do not invent new objects. Lantern flame centre remains 50% width, 60% height. Target 90% pure black #000000 coverage across the opaque image, minimum 70%. All former white background and broad object surfaces become SOLID PURE BLACK, no grain or grey. Only very sparse thin white edge lines suggest the silhouettes outside the tiny illuminated pool. Red hatching lands only on the transmitted card and near the lantern; no white or red flood, no rays, no glow. Preserve the existing sparse woodcut outline, avoid adding fine detail.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

### PVZ-02a

- Date : **13 octobre 2026**.
- Format demandé : 4:3, 1600 × 1200 px. Format livré : 1448 × 1086 px pour les deux variantes.
- Jour : [PVZ-02a.png](PVZ-02a.png), source native finale avant retouche locale : `exec-a24695dc-1025-4015-b416-b4c6bfe87c12.png`.
- Nuit : [PVZ-02a.nuit.png](PVZ-02a.nuit.png), source native finale avant retouche locale : `exec-2f5f3996-b83f-4bfa-a069-532a6b856781.png`.
- Première génération : `exec-10f5e622-7a57-4593-a938-018bcf8365c3.png`.
- SHA-256 livré, jour : `fe3a34e63b0cd0ff359594834a36c3f372e689e910389d30337e02424d1af41d`.
- SHA-256 livré, nuit : `adf1089b2be961147378a6441c001f2e8222da65f4a5f4065462bae458328efd`.

**Harmonisation de la nuit.** Natif 1447 × 1087 px → 1448 × 1086 px. Retrait : droite 0 px, bas 1 px ; ajout : droite 1 px, bas 0 px, fond noir. Aucune mise à l’échelle ni translation de la scène.

**Prompt initial de jour, texte exact :**

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

Subject: Welcoming: showing the card.
Composition: A work table in three-quarter view, seen slightly from above. On the left, a standing faceless silhouette passes a paper card with simple nonverbal marks to a seated newcomer. One lantern placed on the table, its flame centred at 56% width and 58% height, illuminates only the card, everything else is in hatched shadow. Shared setting for a three-panel sequence: the same table, the same lantern, the same framing, horizon at half height.

Framing: EXACT 4:3 aspect ratio, requested canvas 1600 × 1200. This is the first panel of a continuous three-panel table, without a border or margin; the tabletop extends horizontally to both side edges but no person or lantern is cropped. Main outlines about 3 px at 1600 px width. Simple blank faces and simple silhouette hands. Card face is blank except a single abstract geometrical mark, no fake text. HARD registration constraint: the CENTRE of the red flame is at 56% width, 58% height, measured from the upper-left corner; tolerance at most ±3 percentage points per axis. Position the whole small lantern around that point.

The four attached images are STYLE REFERENCES only, not scene alternatives: images 1 and 2 for the recurring lantern and hand-cut line; images 3 and 4 for its plain four-post cage, ring and drop-shaped flame. Never copy their lettering, colours, rays, halo or glow. Pure black, white and red only. Red marks belong on the illuminated object surfaces and flame, never in empty space.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

**Journal des prompts de correction, textes exacts :** certaines sorties intermédiaires ont été écartées ; seule la source finale indiquée plus haut est livrée.

Correction 1 :

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

EDIT image 1, using images 2–5 only as the recurring lantern style references. Keep exact canvas dimensions and aspect ratio. The blue cross is the flame target at (811,630) on a 1448×1086 canvas. Move the WHOLE lantern left by 50 pixels and DOWN by 73 pixels without resizing. Put the CENTRE of its red flame exactly on the blue cross. Restore blank paper where it used to be. Make the standing silhouette smaller so the entire head is visible with 5% space above it. Remove all extra items: books, pen cup, bottle, feather and cloth. Only the table, two simple chairs, two faceless silhouettes, card and lantern remain. Remove the diamond from the card; keep it completely blank. The blue cross and rectangle are calibration guides only: remove them completely in the output. ECONOMICAL ENGRAVING CORRECTION: remove at least 90% of the existing hatching and all surface grain. Large clean white areas and broad solid black shapes; at most three to five coarse, widely spaced hatches in one shadow corner per object. No hatching over entire tabletop or clothing. Hands are simple solid silhouettes with no anatomical detail. Red light is a few sparse hatch marks only on the main card/sheet, not a large pool on the table. Use one flat pure-red drop flame, not a white inner flame. No gradients, tiny texture or excessive detail.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

**Prompt de nuit livré, texte exact :**

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas become solid black in this night edition.

Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.

EDIT image 1, the final day master; images 2–5 are the four lantern style references. Keep the EXACT native 1448 × 1086 pixel dimensions, aspect ratio, framing, camera, every object position, outline, scale, pose and overlap. Change ONLY ink coverage and illumination. Do not invent new objects. Lantern flame centre remains 56% width, 58% height. Target 90% pure black #000000 coverage across the opaque image, minimum 70%. All former white background and broad object surfaces become SOLID PURE BLACK, no grain or grey. Only very sparse thin white edge lines suggest the silhouettes outside the tiny illuminated pool. Red hatching lands only on the transmitted card and near the lantern; no white or red flood, no rays, no glow. Preserve the existing sparse woodcut outline, avoid adding fine detail.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

### PVZ-04

- Date : **13 octobre 2026**.
- Format demandé : 1:1, 1280 × 1280 px. Format livré : 1254 × 1254 px pour les deux variantes.
- Jour : [PVZ-04.png](PVZ-04.png), source native finale avant retouche locale : `exec-125e5ee9-9f98-4c45-b983-5442944a1c23.png`.
- Nuit : [PVZ-04.nuit.png](PVZ-04.nuit.png), source native finale avant retouche locale : `exec-a52f7a08-e6cd-490f-90b6-98fff8e901f6.png`.
- Première génération : `exec-c55ed820-cfab-4273-ba22-cdcd7f6abb6f.png`.
- Sortie écartée après correction : `exec-7a36d134-bb1a-474b-ae97-98706ab37a6b.png` ; la source retenue est celle indiquée ci-dessus.
- SHA-256 livré, jour : `30c5f62d7db8a3b81fafcac9dc4c3af659d403390e08c7c23efc2a7dc6ec7734`.
- SHA-256 livré, nuit : `c6e191f85f1ee3fcbef228ed3ce61039320c51aaf88164302dabf5fbaf1ddeb2`.

**Retouche locale autorisée.** Les paramètres ci-dessous partent de la source native indiquée, avant harmonisation des bords. Les tables de coordonnées donnent les points de correspondance `source → destination` ; interpolation linéaire entre points pour le déplacement, échantillonnage au voisin le plus proche pour conserver les couleurs. Le déplacement varie donc par bande pour conserver le pied de la lanterne à sa place. Cette réduction locale est non uniforme, et non une mise à l’échelle de l’image entière.

- Jour : compression verticale locale par bandes, pied fixe. Zone x = 720 à 1110 px. Y : 0 → 0 ; 480 → 455 ; 520 → 520.
- Nuit : compression verticale locale par bandes, pied fixe. Zone x = 720 à 1110 px. Y : 0 → 0 ; 480 → 455 ; 520 → 520.

**Prompt initial de jour, texte exact :**

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

Transparent background: nothing is drawn outside the subject.

Subject: Spotting what is missing.
Composition: A magnifying glass held above one long sheet of evenly spaced horizontal graphic rules, with a few rules absent, leaving gaps. The lantern placed behind the magnifying glass, its flame centred at 70% width and 30% height, lights only the missing gaps through the lens.

Framing: EXACT 1:1 aspect ratio, requested canvas 1280 × 1280. Single centred motif, three-quarter view, no horizon. Thick hand-cut outlines about 8 px at 480 px width, only a few broad hatches. Motif occupies at least 65% of the square and reads at 96 px. The horizontal rules are a simple diagram of at most six broad bars, never fake writing. Only the magnifying glass, sheet and lantern, no extra hand or object. HARD registration constraint: the CENTRE of the red flame is at 70% width, 30% height, measured from the upper-left corner; tolerance at most ±3 percentage points per axis. Position the whole small lantern around that point.

The four attached images are STYLE REFERENCES only, not scene alternatives: images 1 and 2 for the recurring lantern and hand-cut line; images 3 and 4 for its plain four-post cage, ring and drop-shaped flame. Never copy their lettering, colours, rays, halo or glow. Pure black, white and red only. Red marks belong on the illuminated object surfaces and flame, never in empty space.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

**Journal des prompts de correction, textes exacts :** certaines sorties intermédiaires ont été écartées ; seule la source finale indiquée plus haut est livrée.

Correction 1 :

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

Transparent background: nothing is drawn outside the subject.

EDIT image 1, using images 2–5 only as the recurring lantern style references. Keep exact canvas dimensions and aspect ratio. The blue cross is the flame target at (878,376) on a 1254×1254 canvas. Move the WHOLE lantern LEFT by 29 pixels and UP by 65 pixels without resizing, so the CENTRE of its red flame is exactly on the blue cross. Keep actual background transparency and everything uncut. Keep the magnifying glass and sheet in place; use only six horizontal bars with two gaps, no more. The blue cross and rectangle are calibration guides only: remove them completely in the output. ECONOMICAL ENGRAVING CORRECTION: remove at least 90% of the existing hatching and all surface grain. Large clean white areas and broad solid black shapes; at most three to five coarse, widely spaced hatches in one shadow corner per object. No hatching over entire tabletop or clothing. Hands are simple solid silhouettes with no anatomical detail. Red light is a few sparse hatch marks only on the main card/sheet, not a large pool on the table. Use one flat pure-red drop flame, not a white inner flame. No gradients, tiny texture or excessive detail.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

Correction 2 :

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

Transparent background: nothing is drawn outside the subject.

EDIT image 1. Images 2–5 are style references only. Only correct the lantern position, everything else stays EXACTLY in place. Native square canvas 1254 × 1254. The blue cross at (878,376) marks the desired CENTRE of the red flame. Current flame centre is (798,441). Move the WHOLE lantern RIGHT by 80 pixels and UP by 65 pixels without changing size. Its red flame centre must be at the blue cross, not the cage post or base. Remove the old lantern and restore transparency there. Remove ALL blue guides from the finished image. Keep the lens, handle and sheet fixed, preserve actual transparency. Do not recenter the composition. Only one lantern. No text, no extra detail.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

Correction 3 :

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

Transparent background: nothing is drawn outside the subject.

EDIT image 1, a transparent square magnifier-and-lantern image with blue diagnostic guides. Images 2–5 are common style references only. Preserve EXACT 1254 × 1254 canvas and all elements except the lantern. Blue cross is desired flame centre (878,376). The red flame centre is currently (893,421). Move the WHOLE LANTERN 15 pixels LEFT and 45 pixels UP, with unchanged size. Its ring must remain entirely inside the canvas. Erase old lantern position, restore transparency there. Remove the blue cross and rectangle completely. Keep sheet, magnifier, hatchwork and red lit surfaces unchanged. Do not re-centre the entire image.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

**Prompt de nuit livré, texte exact :**

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

Transparent background: nothing is drawn outside the subject. Preserve all outside alpha transparency.

Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.

EDIT image 1, the final DAY master. Images 2–5 are the four common style references. Preserve the EXACT 1254 × 1254 canvas, exact framing and object silhouettes, and exact lantern/flame position. Do not move, resize, add or remove any object. Transform lighting only. Target 90% pure #000000 among OPAQUE pixels, minimum 70%. Every formerly white object surface becomes solid black, suggested by a few thin sparse white contours. Keep only the red flame and a SMALL patch of red hatching on the main subject nearest the lantern. No white paper field, broad white plane or white cage panel. All black must be flat #000000 without gray texture. Keep transparent pixels outside the objects; do not use transparency instead of black inside objects.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

### PVZ-02b

- Date : **13 octobre 2026**.
- Format demandé : 4:3, 1600 × 1200 px. Format livré : 1448 × 1086 px pour les deux variantes.
- Jour : [PVZ-02b.png](PVZ-02b.png), source native finale avant retouche locale : `exec-6d1051c9-ebc4-447b-a29d-de6e5744c522.png`.
- Nuit : [PVZ-02b.nuit.png](PVZ-02b.nuit.png), source native finale avant retouche locale : `exec-79178c44-c137-48ee-a395-5d91e7c0edfe.png`.
- Image de départ du jour : master de jour `PVZ-02a`, joint avant les quatre références communes.
- SHA-256 livré, jour : `c736e2f3639071ae11af014e52a312a8ee62861bcb627fc2a8f018d3393ec886`.
- SHA-256 livré, nuit : `4447ef1db77c039f240dd543dcafd1e054c1c70c51ebc0f8ae39461c51c945fb`.

**Prompt initial de jour, texte exact :**

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

Subject: Training and reviewing: watching her work.
Composition: The same work table and the same lantern as the first panel. The seated newcomer writes on the paper card; the standing silhouette from the first panel stands slightly back, behind her shoulder, pointing at one line with a finger. The light falls on the writing hand. Both are faceless silhouettes.

Framing: EXACT 4:3 aspect ratio, requested canvas 1600 × 1200. Middle panel of the same three-panel table: same three-quarter view slightly from above, horizon at half height, continuous tabletop, no frame. Preserve the lantern flame at 56% width and 58% height, and table geometry from image 1. No detailed anatomy; no text or fake writing, just a blank card with a single abstract mark. HARD registration constraint: the CENTRE of the red flame is at 56% width, 58% height, measured from the upper-left corner; tolerance at most ±3 percentage points per axis. Position the whole small lantern around that point.

EDIT image 1 (the first panel) to create this next moment. Keep the EXACT 1448 × 1086 canvas, camera, tabletop, and lantern geometry. Images 2–5 are the four shared STYLE REFERENCES only. Never copy their lettering, colours, rays, halo or glow. Pure black, white and red only. Red marks belong on the illuminated object surfaces and flame, never in empty space.

Simplify linework: at most 3–5 broad hatches per shadow corner, no hatches across full objects; broad solid black and plain white areas, no texture.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

**Prompt de nuit livré, texte exact :**

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; the background is now solid black.

Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.

EDIT image 1, the final DAY master. Images 2–5 are the four common style references. Preserve the EXACT 1448 × 1086 canvas, exact framing and object silhouettes, and exact lantern/flame position. Do not move, resize, add or remove any object. Transform lighting only. Target 90% pure #000000 among OPAQUE pixels, minimum 70%. Every formerly white object surface becomes solid black, suggested by a few thin sparse white contours. Keep only the red flame and a SMALL patch of red hatching on the main subject nearest the lantern. No white paper field, broad white plane or white cage panel. All black must be flat #000000 without gray texture. Keep transparent pixels outside the objects; do not use transparency instead of black inside objects.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

### PVZ-02c

- Date : **13 octobre 2026**.
- Format demandé : 4:3, 1600 × 1200 px. Format livré : 1448 × 1086 px pour les deux variantes.
- Jour : [PVZ-02c.png](PVZ-02c.png), source native finale avant retouche locale : `exec-d6af29b2-79ca-4fd9-8648-319f23d40fd9.png`.
- Nuit : [PVZ-02c.nuit.png](PVZ-02c.nuit.png), source native finale avant retouche locale : `exec-ff65c3a7-823a-444e-bc7c-2138833cfea3.png`.
- Image de départ du jour : master de jour `PVZ-02a`, joint avant les quatre références communes.
- SHA-256 livré, jour : `88579aafb363dc77855f4e4851219be2d2095b294faf08e2d43dd7d7319b2c1c`.
- SHA-256 livré, nuit : `bb9f9a93915a0b92d8c1e6116fe2bc06a459fa508c12036dd597d877070450b8`.

**Harmonisation de la nuit.** Natif 1447 × 1087 px → 1448 × 1086 px. Retrait : droite 0 px, bas 1 px ; ajout : droite 1 px, bas 0 px, fond noir. Aucune mise à l’échelle ni translation de la scène.

**Prompt initial de jour, texte exact :**

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

Subject: Contributing independently: reviewing alone.
Composition: The same work table and the same lantern. The newcomer is now alone, checking a paper card made by a third person lying in front of her, and marking it with a simple tick. The first person's chair is empty. The lantern illuminates the reviewed card. A faceless silhouette.

Framing: EXACT 4:3 aspect ratio, requested canvas 1600 × 1200. Last panel of the same three-panel table: same three-quarter view slightly from above, horizon at half height, continuous tabletop, no frame. Preserve the lantern flame at 56% width and 58% height and table geometry from image 1. No detailed anatomy, no writing other than the simple tick. HARD registration constraint: the CENTRE of the red flame is at 56% width, 58% height, measured from the upper-left corner; tolerance at most ±3 percentage points per axis. Position the whole small lantern around that point.

EDIT image 1 (the first panel) to create this next moment. Keep the EXACT 1448 × 1086 canvas, camera, tabletop, and lantern geometry. Images 2–5 are the four shared STYLE REFERENCES only. Never copy their lettering, colours, rays, halo or glow. Pure black, white and red only. Red marks belong on the illuminated object surfaces and flame, never in empty space.

Simplify linework: at most 3–5 broad hatches per shadow corner, no hatches across full objects; broad solid black and plain white areas, no texture.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

**Prompt de nuit livré, texte exact :**

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; the background is now solid black.

Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.

EDIT image 1, the final DAY master. Images 2–5 are the four common style references. Preserve the EXACT 1448 × 1086 canvas, exact framing and object silhouettes, and exact lantern/flame position. Do not move, resize, add or remove any object. Transform lighting only. Target 90% pure #000000 among OPAQUE pixels, minimum 70%. Every formerly white object surface becomes solid black, suggested by a few thin sparse white contours. Keep only the red flame and a SMALL patch of red hatching on the main subject nearest the lantern. No white paper field, broad white plane or white cage panel. All black must be flat #000000 without gray texture. Keep transparent pixels outside the objects; do not use transparency instead of black inside objects.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

### PVZ-06

- Date : **13 octobre 2026**.
- Format demandé : 1:1, 1280 × 1280 px. Format livré : 1254 × 1254 px pour les deux variantes.
- Jour : [PVZ-06.png](PVZ-06.png), source native finale avant retouche locale : `exec-9476ba3a-69be-483f-8e1e-34210d1f9505.png`.
- Nuit : [PVZ-06.nuit.png](PVZ-06.nuit.png), source native finale avant retouche locale : `exec-2e65273a-6730-4cff-a494-6267cfbbd82b.png`.
- Première génération : `exec-b7dd3ccc-37ba-4aac-ba76-5889b33c209b.png`.
- SHA-256 livré, jour : `6f74f8b173bae7a149cd8531bae85ae2feca3033cdfa5a615d7e07dd2cb95eb3`.
- SHA-256 livré, nuit : `82091b4e998656aa03e5f47414b0700c5f5777e7104ea5d748c56121ef8d1257`.

La lanterne demeure volontairement hors cadre, conformément à la fiche ; la position de sa flamme n’est pas mesurable dans ce PNG.

**Prompt initial de jour, texte exact :**

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

Transparent background: nothing is drawn outside the subject.

Subject: Translating, reviewing and testing.
Composition: One centred motif: a quill laid across a paper card with one graphic line crossed out. The single lantern is off-canvas to the right, its illumination enters from 90% width and 40% height and lights the quill. The lantern itself is deliberately outside the frame and is not drawn.

Framing: EXACT 1:1 aspect ratio, requested canvas 1280 × 1280. Three-quarter view, no horizon. Only a quill and one card. Broad irregular outlines about 8 px at 480 px width, very few broad hatches, readable at 96 px. Subject occupies 65% of the square, with an uncut margin. The single crossed-out line is a simple graphic rule, not fake writing. No red light in transparent space; red hatching belongs on the quill only.

The four attached images are STYLE REFERENCES only, not scene alternatives: images 1 and 2 for the recurring lantern and hand-cut line; images 3 and 4 for its plain four-post cage, ring and drop-shaped flame. Never copy their lettering, colours, rays, halo or glow. Pure black, white and red only. Red marks belong on the illuminated object surfaces and flame, never in empty space.

Economical drawing: no texture or detailed hatch fields. At most 3–5 broad hatches per shadow corner; large plain white planes and solid black masses. Maintain generous transparent padding around every object.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

**Journal des prompts de correction, textes exacts :** certaines sorties intermédiaires ont été écartées ; seule la source finale indiquée plus haut est livrée.

Correction 1 :

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

Transparent background: nothing is drawn outside the subject.

EDIT image 1. Images 2–5 are common style references only. Keep the exact quill/card composition and 1254 × 1254 canvas. Turn the red crossing-out stroke on the paper card BLACK. Only the right edge of the quill is lit red by an offscreen source. Remove 75% of the hatching: a few broad uneven lines only on the shadow side of the quill and two card corners. Broad clean white planes. No visible lantern.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

Correction 2 :

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

Transparent background: nothing is drawn outside the subject.

EDIT image 1. Images 2–5 are shared style references only. Exact 1254 × 1254 canvas. Keep quill, card, framing, hatching, alpha, and colours identical. Only add ONE short BLACK diagonal stroke through the middle of the existing long black line on the paper card, visibly crossing it out. It is an abstract mark, not a letter. Do not erase or replace the long black line. No other changes.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

**Prompt de nuit livré, texte exact :**

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

Transparent background: nothing is drawn outside the subject. Preserve all outside alpha transparency.

Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.

EDIT image 1, the final DAY master. Images 2–5 are the four common style references. Preserve the EXACT 1254 × 1254 canvas, exact framing and object silhouettes, and exact quill/card position. Do not move, resize, add or remove any object. Transform lighting only. Target 90% pure #000000 among OPAQUE pixels, minimum 70%. Every formerly white object surface becomes solid black, suggested by a few thin sparse white contours. The sole lantern is OUTSIDE the frame at the right; do not add a visible lantern or flame. Its small red light illuminates only the right edge of the quill from 90% width,40%height. Keep the crossed-out graphic line visible as two sparse white strokes on the dark card. No white paper field, broad white plane or white cage panel. All black must be flat #000000 without gray texture. Keep transparent pixels outside the objects; do not use transparency instead of black inside objects.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

### PVZ-07

- Date : **13 octobre 2026**.
- Format demandé : 1:1, 1280 × 1280 px. Format livré : 1254 × 1254 px pour les deux variantes.
- Jour : [PVZ-07.png](PVZ-07.png), source native finale avant retouche locale : `exec-519053ab-dd72-4908-995d-841a898364e4.png`.
- Nuit : [PVZ-07.nuit.png](PVZ-07.nuit.png), source native finale avant retouche locale : `exec-a9c56dc7-f3ef-437c-9e26-4ff75edcddf3.png`.
- Première génération : `exec-d90cb8dc-8662-4bd1-b867-386e0d603956.png`.
- SHA-256 livré, jour : `f17a14b023e0cbb0c6b41c9de05952870b6077cd2c05fb70053ae665c81aa07d`.
- SHA-256 livré, nuit : `b5cbe7cdd986cb9cbc9215c29d1d67eb984d01f6fab428330415e94eccd3651d`.

**Prompt initial de jour, texte exact :**

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

Transparent background: nothing is drawn outside the subject.

Subject: Delivering: a weekly proposal.
Composition: One centred motif: a sealed parcel tied with string, from which a few completely blank tags hang, without names or numbers. A small lantern placed beside it, its flame centred at 76% width and 70% height, lights the tags.

Framing: EXACT 1:1 aspect ratio, requested canvas 1280 × 1280. Three-quarter view, no horizon. Thick irregular outlines about 8 px at 480 px width and a few broad hatches. Motif occupies at least 65% of the square and reads at 96 px. At least 4% clear uncut margin, no extra objects. HARD registration constraint: the CENTRE of the red flame is at 76% width, 70% height, measured from the upper-left corner; tolerance at most ±3 percentage points per axis. Position the whole small lantern around that point.

The four attached images are STYLE REFERENCES only, not scene alternatives: images 1 and 2 for the recurring lantern and hand-cut line; images 3 and 4 for its plain four-post cage, ring and drop-shaped flame. Never copy their lettering, colours, rays, halo or glow. Pure black, white and red only. Red marks belong on the illuminated object surfaces and flame, never in empty space.

Economical drawing: no texture or detailed hatch fields. At most 3–5 broad hatches per shadow corner; large plain white planes and solid black masses. Maintain generous transparent padding around every object.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

**Journal des prompts de correction, textes exacts :** certaines sorties intermédiaires ont été écartées ; seule la source finale indiquée plus haut est livrée.

Correction 1 :

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

Transparent background: nothing is drawn outside the subject.

EDIT image 1. Images 2–5 are common style references only. Keep the exact 1254 × 1254 canvas and parcel geometry. The blue cross is the desired red flame centre at (953,878), 76% width /70% height. Move the WHOLE lantern LEFT by76pixels and UP by25pixels, preserving scale, so its flame centre coincides with that cross. Remove old lamp and restore underlying parcel/transparency. Remove blue guides. Simplify 75% of fine hatching and string texture; use very few broad hatches only on shadow corners, large plain white areas and solid black shadow masses. Lantern has a SINGLE drop-shaped solid red flame without additional curled flames. Keep tags blank.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

Correction 2 :

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

Transparent background: nothing is drawn outside the subject.

EDIT image 1. Images 2–5 are common style references only. Exact 1254 × 1254 canvas. Keep the parcel and tags completely fixed. MOVE THE ENTIRE LANTERN LEFT by70pixels and UP by28pixels. Target flame centre is x953,y878 (76%,70%) from top-left; current centre is x998,y905. Remove the old lantern and restore transparency/parcel behind it. Keep the exact lantern design, one drop-shaped flame. All else unchanged, no re-centering of the overall image.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

**Prompt de nuit livré, texte exact :**

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

Transparent background: nothing is drawn outside the subject. Preserve all outside alpha transparency.

Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.

EDIT image 1, the final DAY master. Images 2–5 are the four common style references. Preserve the EXACT 1254 × 1254 canvas, exact framing and object silhouettes, and exact lantern/flame position. Do not move, resize, add or remove any object. Transform lighting only. Target 90% pure #000000 among OPAQUE pixels, minimum 70%. Every formerly white object surface becomes solid black, suggested by a few thin sparse white contours. Keep only the red flame and a SMALL patch of red hatching on the main subject nearest the lantern. No white paper field, broad white plane or white cage panel. All black must be flat #000000 without gray texture. Keep transparent pixels outside the objects; do not use transparency instead of black inside objects.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

### PVZ-08

- Date : **13 octobre 2026**.
- Format demandé : 1:1, 1280 × 1280 px. Format livré : 1254 × 1254 px pour les deux variantes.
- Jour : [PVZ-08.png](PVZ-08.png), source native finale avant retouche locale : `exec-fb8fefe9-572d-4733-8d71-ee9fc317efb0.png`.
- Nuit : [PVZ-08.nuit.png](PVZ-08.nuit.png), source native finale avant retouche locale : `exec-b8aea01e-3c8a-4d6d-9477-69995edbb7af.png`.
- Première génération : `exec-6786e610-7901-4fec-a5f6-cce6ea5d5991.png`.
- SHA-256 livré, jour : `c0503480d9cc562b811708366dbd326506fa416af4deef339041333ac30a2632`.
- SHA-256 livré, nuit : `45526c8a0c37bdfd90a44f8801bb6a54c7aece79e56c51b0727a75139068e3ec`.

**Prompt initial de jour, texte exact :**

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

Transparent background: nothing is drawn outside the subject.

Subject: Encouraging: the weekly ranking.
Composition: One centred motif: an empty three-step podium, with no numbers or letters, beneath one simple star. The small lantern sits on the highest middle step, its flame centred at 50% width and 46% height, lighting only the star.

Framing: EXACT 1:1 aspect ratio, requested canvas 1280 × 1280. Three-quarter view, no horizon. Thick irregular outlines about 8 px at 480 px width and a few broad hatches. Motif occupies at least 65% of the square and reads at 96 px. At least 4% clear uncut margin. The star is a plain cut-out silhouette, not a glowing star; no sparkle lines. HARD registration constraint: the CENTRE of the red flame is at 50% width, 46% height, measured from the upper-left corner; tolerance at most ±3 percentage points per axis. Position the whole small lantern around that point.

The four attached images are STYLE REFERENCES only, not scene alternatives: images 1 and 2 for the recurring lantern and hand-cut line; images 3 and 4 for its plain four-post cage, ring and drop-shaped flame. Never copy their lettering, colours, rays, halo or glow. Pure black, white and red only. Red marks belong on the illuminated object surfaces and flame, never in empty space.

Economical drawing: no texture or detailed hatch fields. At most 3–5 broad hatches per shadow corner; large plain white planes and solid black masses. Maintain generous transparent padding around every object.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

**Journal des prompts de correction, textes exacts :** certaines sorties intermédiaires ont été écartées ; seule la source finale indiquée plus haut est livrée.

Correction 1 :

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

Transparent background: nothing is drawn outside the subject.

EDIT image 1. Images 2–5 are common style references only. Keep the exact 1254 × 1254 canvas. Blue cross marks desired flame centre (627,577), 50% width/46% height. Raise the WHOLE lantern and the top of its central podium step by52pixels, so lantern still rests on its step and flame centre coincides with cross. Keep left/right steps fixed. Reduce the star by20% around its current centre to give the raised lantern ring room, keeping entire star uncropped. Remove blue guides. Simplify hatching by75%, only 3–5 broad hatches per shadow corner. Red light ONLY on star and flame, no red on podium. SINGLE solid red drop flame.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

**Prompt de nuit livré, texte exact :**

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

Transparent background: nothing is drawn outside the subject. Preserve all outside alpha transparency.

Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.

EDIT image 1, the final DAY master. Images 2–5 are the four common style references. Preserve the EXACT 1254 × 1254 canvas, exact framing and object silhouettes, and exact lantern/flame position. Do not move, resize, add or remove any object. Transform lighting only. Target 90% pure #000000 among OPAQUE pixels, minimum 70%. Every formerly white object surface becomes solid black, suggested by a few thin sparse white contours. The lantern flame remains at 50% width, 46% height. Keep only the red flame and a SMALL patch of red hatching on the star directly above the lantern. No white paper field, broad white plane or white cage panel. All black must be flat #000000 without gray texture. Keep transparent pixels outside the objects; do not use transparency instead of black inside objects.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

### PVZ-11

- Date : **13 octobre 2026**.
- Format demandé : 1:1, 1280 × 1280 px. Format livré : 1254 × 1254 px pour les deux variantes.
- Jour : [PVZ-11.png](PVZ-11.png), source native finale avant retouche locale : `exec-45154cea-0627-4521-973b-b9e3a1d14766.png`.
- Nuit : [PVZ-11.nuit.png](PVZ-11.nuit.png), source native finale avant retouche locale : `exec-7d28e3e4-1788-438f-8341-c796c354a75c.png`.
- Première génération : `exec-e654a975-61b9-4d1f-8df7-61d077954561.png`.
- Sortie écartée après correction : `exec-e28b6541-e921-4aa8-a953-7633856d827c.png` ; la source retenue est celle indiquée ci-dessus.
- SHA-256 livré, jour : `e38b26b7a1795720219ebcb03173690d110163fb351cb85e1fb89771237afc1f`.
- SHA-256 livré, nuit : `95f8ad3cbd53c55910ea5281f209a305ed571227e9da3968406c8a719f4e7315`.

**Retouche locale autorisée.** Les paramètres ci-dessous partent de la source native indiquée, avant harmonisation des bords. Les tables de coordonnées donnent les points de correspondance `source → destination` ; interpolation linéaire entre points pour le déplacement, échantillonnage au voisin le plus proche pour conserver les couleurs. Le déplacement varie donc par bande pour conserver le pied de la lanterne à sa place. Cette réduction locale est non uniforme, et non une mise à l’échelle de l’image entière.

- Jour : compression verticale locale par bandes, pied fixe. Zone x = 545 à 985 px. Y : 0 → 0 ; 590 → 557 ; 640 → 640.
- Nuit : compression verticale locale par bandes, pied fixe. Zone x = 545 à 985 px. Y : 0 → 0 ; 590 → 557 ; 640 → 640.

**Prompt initial de jour, texte exact :**

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

Transparent background: nothing is drawn outside the subject.

Subject: Thanking: a personal recap.
Composition: One centred motif: a folded letter tied with a ribbon, completely without writing. A small lantern placed just behind it, its flame centred at 62% width and 36% height, illuminates only the letter.

Framing: EXACT 1:1 aspect ratio, requested canvas 1280 × 1280. Three-quarter view, no horizon. Thick irregular outlines about 8 px at 480 px width and a few broad hatches. Motif occupies at least 65% of the square and reads at 96 px. At least 4% clear uncut margin, no extra objects. HARD registration constraint: the CENTRE of the red flame is at 62% width, 36% height, measured from the upper-left corner; tolerance at most ±3 percentage points per axis. Position the whole small lantern around that point.

The four attached images are STYLE REFERENCES only, not scene alternatives: images 1 and 2 for the recurring lantern and hand-cut line; images 3 and 4 for its plain four-post cage, ring and drop-shaped flame. Never copy their lettering, colours, rays, halo or glow. Pure black, white and red only. Red marks belong on the illuminated object surfaces and flame, never in empty space.

Economical drawing: at most 3–5 broad hatches per shadow corner, not full fields of lines; large plain white planes and solid black masses. Single simple drop-shaped flame, no multiple tongues. Maintain transparent padding.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

**Journal des prompts de correction, textes exacts :** certaines sorties intermédiaires ont été écartées ; seule la source finale indiquée plus haut est livrée.

Correction 1 :

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

Transparent background: nothing is drawn outside the subject.

EDIT image 1 with the blue diagnostic cross and rectangle. Images 2–5 are shared style references only. Keep exact 1254 × 1254 canvas. Move the whole lantern LEFT15pixels and UP50pixels so its red flame centre sits exactly on the blue cross at (777,451),62%width36%height. Remove blue guides. Preserve letter position and bounds. Simplify 75% of tiny hatching into a few broad irregular lines in shadow corners, broad white planes and flat black masses. Use one plain solid red drop-shaped flame. The ribbon is BLACK and WHITE, not red fabric: red may appear only as a small patch of light hatching on the letter nearest the lantern. Do not crop the ring.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

Correction 2 :

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

Transparent background: nothing is drawn outside the subject.

EDIT image 1, the current scene with blue diagnostic guides. Images2–5 are style references only. Exact1254×1254canvas. Keep letter fixed. RESIZE WHOLE LANTERN to90% of current size, anchored at its top ring (top margin stays20pixels). Move its horizontal centre to777pixels. This raises flame centre from y498 to y451 without cropping ring. Target flame centre is blue cross (777,451). Remove blue guides. ONE solid red drop-shaped flame. Same composition otherwise.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

**Prompt de nuit livré, texte exact :**

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

Transparent background: nothing is drawn outside the subject. Preserve all outside alpha transparency.

Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.

EDIT image 1, the final DAY master. Images 2–5 are the four common style references. Preserve the EXACT 1254 × 1254 canvas, exact framing and object silhouettes, and exact lantern/flame position. Do not move, resize, add or remove any object. Transform lighting only. Target 90% pure #000000 among OPAQUE pixels, minimum 70%. Every formerly white object surface becomes solid black, suggested by a few thin sparse white contours. Keep only the red flame and a SMALL patch of red hatching on the main subject nearest the lantern. No white paper field, broad white plane or white cage panel. All black must be flat #000000 without gray texture. Keep transparent pixels outside the objects; do not use transparency instead of black inside objects.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

### PVZ-09

- Date : **13 octobre 2026**.
- Format demandé : 16:9, 1600 × 900 px. Format livré : 1671 × 941 px pour les deux variantes.
- Jour : [PVZ-09.png](PVZ-09.png), source native finale avant retouche locale : `exec-6f90ac96-0921-433c-bd89-7be8f4bf136f.png`.
- Nuit : [PVZ-09.nuit.png](PVZ-09.nuit.png), source native finale avant retouche locale : `exec-ac5fc55f-f058-441b-beee-fe46afd10d7f.png`.
- Première génération : `exec-cf51df9e-e491-431c-a18b-13c89c45c6ef.png`.
- SHA-256 livré, jour : `1151ff42a93da3d5162e4b03ce67aa8fa6266092c71957fa5c2af5b4c4ce584e`.
- SHA-256 livré, nuit : `f52c9e0cf2aaa3eee67cdaf0507cd5affe8dba8a7e400c600732d383f829ad5b`.

**Retouche locale autorisée.** Les paramètres ci-dessous partent de la source native indiquée, avant harmonisation des bords. Les tables de coordonnées donnent les points de correspondance `source → destination` ; interpolation linéaire entre points pour le déplacement, échantillonnage au voisin le plus proche pour conserver les couleurs. Le déplacement varie donc par bande pour conserver le pied de la lanterne à sa place. Cette réduction locale est non uniforme, et non une mise à l’échelle de l’image entière.

- Jour : recalage local par bandes, contour de la scène et pied fixes. Boîte [gauche, haut, droite, bas] = [1140, 415, 1180, 495] px. X : 1140 → 1140 ; 1180 → 1180. Y : 415 → 415 ; 483 → 471 ; 495 → 495.
- Nuit : recalage local par bandes, contour de la scène et pied fixes. Boîte [gauche, haut, droite, bas] = [1140, 415, 1180, 495] px. X : 1140 → 1140 ; 1180 → 1180. Y : 415 → 415 ; 483 → 471 ; 495 → 495.

**Harmonisation de la nuit.** Natif 1670 × 942 px → 1671 × 941 px. Retrait : droite 0 px, bas 1 px ; ajout : droite 1 px, bas 0 px, fond noir. Aucune mise à l’échelle ni translation de la scène.

**Prompt initial de jour, texte exact :**

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

Subject: Catching up.
Composition: A diptych in one image, two halves divided by a thin vertical rule, in profile with the horizon at half height. On the left, a small team of faceless silhouettes walks behind a long train of wagons loaded with cards, which gets longer and pulls away. On the right, the same team walks level with the locomotive. The leading silhouette in the right half holds one lantern, with its flame centred at 72% of the whole canvas width and 46% of its height, illuminating the locomotive. No text or numbers.

Framing: EXACT 16:9 aspect ratio, requested canvas 1600 × 900. Each half must be understandable separately in an 8:9 crop. All people and engine shapes stay inside the canvas. Main outlines about 3 px at 1600 px width, sparse hatching. The lantern is carried just beside the locomotive, in the right half. HARD registration constraint: the CENTRE of the red flame is at 72% width, 46% height, measured from the upper-left corner; tolerance at most ±3 percentage points per axis. Position the whole small lantern around that point.

The four attached images are STYLE REFERENCES only, not scene alternatives: images 1 and 2 for the recurring lantern and hand-cut line; images 3 and 4 for its plain four-post cage, ring and drop-shaped flame. Never copy their lettering, colours, rays, halo or glow. Pure black, white and red only. Red marks belong on the illuminated object surfaces and flame, never in empty space.

Economical linework: no texture, at most 3–5 broad hatches per shadow corner. Single small solid-red drop-shaped flame. Empty background with no furniture or background ornaments, no extra props.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

**Journal des prompts de correction, textes exacts :** certaines sorties intermédiaires ont été écartées ; seule la source finale indiquée plus haut est livrée.

Correction 1 :

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

EDIT image 1, the current scene with blue diagnostic guides. Images2–5 are style references only. Exact1672×941canvas. Keep two equal halves with divider. Redraw the right half much more simply, as a TRUE SIDE PROFILE of a small complete locomotive, from x1250 to1580, entirely within canvas. Three small faceless walking silhouettes from x920 to1200 beside it. The leading silhouette holds lantern HIGH at face height so flame centre is precisely blue cross x1204,y433 (72%,46%). Move/delete old lantern. No giant closeup, no front perspective, no cropped engine. Keep left half small team behind long receding card-wagon train. ALL scene details fit with4% margins. Reduce fine hatch texture by90%; only sparse broad hatching and solid black. Pure white paper background; no grey grain. Remove blue guides.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

Correction 2 :

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

EDIT image1 only, shared style refs2–5. Exact1671×941canvas and exact two-panel composition. Preserve all scenery and people positions. Remove ALL short red radial rays around the lantern, replacing them with blank white. Move just the small lantern 57pixels RIGHT and64pixels UP, centre of red flame at1203,433 (72%,46%ofcanvas). Adjust only the lead silhouette's extended arm so the hand still holds the ring, raised higher and further right. Keep one lantern only. Red light uses hatching on locomotive surfaces only, never in blank background. Remove any red floating hatch patch between lantern and engine. No other changes.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

**Prompt de nuit livré, texte exact :**

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; the background is now solid black.

Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.

EDIT image 1, the final DAY master. Images 2–5 are the four common style references. Preserve the EXACT 1671 × 941 canvas, exact framing and object silhouettes, and exact lantern/flame position. Do not move, resize, add or remove any object. Transform lighting only. Target 90% pure #000000 among OPAQUE pixels, minimum 70%. Every formerly white object surface becomes solid black, suggested by a few thin sparse white contours. Keep only the red flame and a SMALL patch of red hatching on the main subject nearest the lantern. No white paper field, broad white plane or white cage panel. All black must be flat #000000 without gray texture. Keep transparent pixels outside the objects; do not use transparency instead of black inside objects.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

### PVZ-10

- Date : **13 octobre 2026**.
- Format demandé : 4:3, 1600 × 1200 px. Format livré : 1447 × 1087 px pour les deux variantes.
- Jour : [PVZ-10.png](PVZ-10.png), source native finale avant retouche locale : `exec-0ceae48e-cdd6-4e3c-9330-ee666baf5a85.png`.
- Nuit : [PVZ-10.nuit.png](PVZ-10.nuit.png), source native finale avant retouche locale : `exec-8d545803-8791-43df-879e-d0e8fc141f73.png`.
- Première génération : `exec-835923cf-7e31-427c-bd9f-8d01e5cd5881.png`.
- SHA-256 livré, jour : `93bc1cd9808a0f2ceb4c70bbd8b9dc232f0574ef5b0fb80a7e5422b21b01d0fa`.
- SHA-256 livré, nuit : `0272ef4fc785d83d054457ccc8a3b9c60611fad20a968964da58b5d4074e989b`.

**Harmonisation de la nuit.** Natif 1446 × 1087 px → 1447 × 1087 px. Retrait : droite 0 px, bas 0 px ; ajout : droite 1 px, bas 0 px, fond noir. Aucune mise à l’échelle ni translation de la scène.

**Prompt initial de jour, texte exact :**

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

Subject: A command-line tool in a terminal.
Composition: A generic terminal window seen from the front and slightly above, on a desk: two columns of horizontal bars of varied lengths, without any characters. A few bars are missing in the right-hand column, leaving gaps. The single lantern in front of the window at the right, its flame centred at 78% width and 70% height, illuminates only these gaps. No characters, letters, numbers or brands.

Framing: EXACT 4:3 aspect ratio, requested canvas 1600 × 1200. Keep both columns within a central square crop. Main outlines about 3 px at 1600 px width. Minimal generic rectangle for the terminal window, with simple graphical bars, absolutely no buttons, fake writing or recognisable interface. HARD registration constraint: the CENTRE of the red flame is at 78% width, 70% height, measured from the upper-left corner; tolerance at most ±3 percentage points per axis. Position the whole small lantern around that point.

The four attached images are STYLE REFERENCES only, not scene alternatives: images 1 and 2 for the recurring lantern and hand-cut line; images 3 and 4 for its plain four-post cage, ring and drop-shaped flame. Never copy their lettering, colours, rays, halo or glow. Pure black, white and red only. Red marks belong on the illuminated object surfaces and flame, never in empty space.

Economical linework: no texture, at most 3–5 broad hatches per shadow corner. Single small solid-red drop-shaped flame. Empty background with no furniture or background ornaments, no extra props.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

**Journal des prompts de correction, textes exacts :** certaines sorties intermédiaires ont été écartées ; seule la source finale indiquée plus haut est livrée.

Correction 1 :

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

EDIT image 1, the current scene with blue diagnostic guides. Images2–5 are style references only. Exact1448×1086canvas. Keep laptop and table framing. Move WHOLE LANTERN LEFT120pixels and DOWN41pixels so red flame centre exactly coincides with blue cross at1129,760 (78%,70%). Remove old lantern, fill old position appropriately. Remove blue guides. Delete the THREE RED BARS in the middle of the RIGHT COLUMN: leave BLACK EMPTY GAPS at these three row locations. Keep remaining bars white; use only a little red hatching along edges of those gaps to show reflected lantern light. Remove90% of fine hatch marks from keyboard, table, computer frame and glass: clean white surfaces, solidblack masses, a few broad corner hatches. No glow, rays or colored interface elements.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

Correction 2 :

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

EDIT image1 only, shared style refs2–5. Exact1447×1087canvas. Preserve laptop, bars, three gaps, keyboard, table. Move ONLY the WHOLE lantern51pixels LEFT and22pixels UP. The red flame centre must be1129,761 (78%,70%). Current centre is1180,783. Restore previous location with existing laptop/table background. No overall recentering or changes to scale. Keep red limited to flame and short hatches adjacent to missing bars. No other changes.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

**Prompt de nuit livré, texte exact :**

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; the background is now solid black.

Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.

EDIT image 1, the final DAY master. Images 2–5 are the four common style references. Preserve the EXACT 1447 × 1087 canvas, exact framing and object silhouettes, and exact lantern/flame position. Do not move, resize, add or remove any object. Transform lighting only. Target 90% pure #000000 among OPAQUE pixels, minimum 70%. Every formerly white object surface becomes solid black, suggested by a few thin sparse white contours. Keep only the red flame and a SMALL patch of red hatching on the main subject nearest the lantern. No white paper field, broad white plane or white cage panel. All black must be flat #000000 without gray texture. Keep transparent pixels outside the objects; do not use transparency instead of black inside objects.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

## Retouches déterministes du 14 octobre 2026

Corrections demandées par l’audit des images et la relecture en situation, faites dans le dépôt avec Pillow (Python), sans génération ni édition générative : les opérations ci-dessous, aux coordonnées en pixels des masters. Les masters retouchés remplacent les précédents ; `npm run visuels:rendre <ID>` a refait leurs rendus.

| Fichier | Opération | Après |
|---|---|---|
| `PVZ-02c.nuit.png` | La coche de la fiche avait disparu. Report en rouge `#FF0000` de la coche rouge du jour (part de lumière, ouverture de 5 px), boîte x 795–865, y 765–830 du jour, décalée de (+18, +12) px vers la fiche de nuit ; master gardé en RVB. | La fiche relue porte sa coche, dans la lumière de la lanterne. |
