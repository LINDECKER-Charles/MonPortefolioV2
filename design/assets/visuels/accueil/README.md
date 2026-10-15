# Masters des images générées — série « accueil »

## Planche d’essai, étape 0

Deux masters pour `ACC-03`, jour et nuit, selon la demande du 13 octobre 2026.
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


## Série complète — production du 13 octobre 2026

La génération complète a été autorisée après la planche d’essai. Les 13 paires suivantes complètent `ACC-03` : **14 illustrations, 28 masters** dans cette série.

Chaque nuit est une édition générative de son jour natif sélectionné, avec les quatre références de lanterne. Les recalages locaux autorisés ont ensuite été appliqués aux deux variantes avec la même translation. Aucun lancement de séparation ni changement du site. Les originaux de génération sont conservés hors du dépôt ; les noms ci-dessous en donnent la provenance.

### Contrôle des masters de production

Le point mesuré est le centroïde de la flamme rouge, isolée des hachures et vérifiée avec une croix et un rectangle de tolérance superposés. Coordonnées depuis le coin supérieur gauche ; tolérance de ±3 points par axe. Le noir nocturne est mesuré sur les pixels opaques (alpha ≥250, maximum RVB ≤32), sans quantification des couleurs.

| ID | Dimensions jour/nuit | Cible (%) | Jour (%) | Nuit (%) | Noir nocturne | Position |
|---|---|---|---|---|---|---|
| ACC-04 | 1536 × 1024 | 78 × 26 | 80,13 × 26,97 | 80,12 × 27,46 | 92,31 % | Conforme |
| ACC-08 | 1916 × 821 | 90 × 52 | 88,41 × 52,26 | 88,27 × 52,28 | 88,16 % | Conforme |
| ACC-09 | 1448 × 1086 | 22 × 40 | 22,52 × 41,81 | 22,90 × 42,54 | 88,77 % | Conforme |
| ACC-11 | 1448 × 1086 | 30 × 70 | 31,43 × 70,55 | 31,49 × 71,15 | 90,27 % | Conforme |
| ACC-18 | 1024 × 1536 | 35 × 72 | 35,31 × 72,78 | 35,30 × 72,79 | 91,24 % | Conforme |
| ACC-19 | 1024 × 1536 | 70 × 24 | 72,34 × 25,23 | 72,36 × 25,29 | 90,73 % | Conforme |
| ACC-20 | 1024 × 1536 | 40 × 46 | 40,21 × 44,75 | 40,16 × 44,77 | 93,33 % | Conforme |
| ACC-21 | 1536 × 1024 | 46 × 24 | 47,88 × 24,83 | 47,95 × 24,73 | 92,37 % | Conforme |
| ACC-22 | 1536 × 1024 | 50 × 56 | 49,05 × 57,91 | 49,02 × 57,88 | 92,83 % | Conforme |
| ACC-23 | 1536 × 1024 | 30 × 48 | 32,47 × 48,75 | 32,52 × 48,74 | 93,35 % | Conforme |
| ACC-05 | 1448 × 1086 | 30 × 55 | 30,89 × 55,99 | 31,41 × 56,04 | 87,77 % | Conforme |
| ACC-07 | 1672 × 941 | 70 × 60 | 71,69 × 62,23 | 71,77 × 62,21 | 93,15 % | Conforme |
| ACC-16 | 1672 × 941 | 34 × 46 | 36,45 × 48,00 | 36,28 × 47,88 | 92,50 % | Conforme |

Les canevas de jour et de nuit sont identiques. Pour `ACC-08`, la nuit native a reçu une colonne noire à droite ; pour `ACC-09`, une ligne noire de bord a été retirée en bas et une colonne noire ajoutée à droite. Aucun redimensionnement global des scènes. L’édition générative conserve le cadrage général mais redessine certains contours : une superposition géométrique parfaite de tous les traits n’est pas certifiée. Les clés noire, blanche et rouge sont prescrites ; les PNG gardent des valeurs intermédiaires d’anticrénelage et de grain.

### Recalages déterministes autorisés

Les coordonnées de boîte ci-dessous délimitent les zones de travail dans le jour natif et sa nuit. Les lanternes ont été translatées sans redimensionner le dessin. Pour `ACC-07`, `ACC-09`, `ACC-16` et `ACC-19`, les raccords ont ensuite été repris depuis les natifs avec un masque resserré sur leur silhouette : les traits du support hors masque ont été restaurés à leur position d’origine et seules les empreintes libérées ont été raccordées par clonage voisin. Les rectangles contenant les flammes sont restés inchangés au pixel près lors de cette reprise. Aucune quantification ni mise à l’échelle globale.

| ID | Boîte locale x1, y1, x2, y2 (px) | Translation x, y (px) |
|---|---|---|
| ACC-04 | 1040, 80, 1435, 425 | -30, 0 |
| ACC-09 | 195, 120, 485, 670 | 0, -8 |
| ACC-19 | 630, 25, 910, 605 | -30, 0 |
| ACC-23 | 459, 344, 575, 561 | -10, 0 |
| ACC-07 | 1130, 409, 1282, 709 | 0, -10 |
| ACC-16 | 525, 188, 780, 610 | -22, 0 |

### Prompts et provenance

Les textes ci-dessous sont les prompts réellement envoyés. Les essais de correction sont conservés comme historique ; la variante native retenue est explicitement identifiée, y compris lorsqu’un essai ultérieur a été écarté. Les fichiers temporaires de contrôle sont des copies de l’illustration avec repère bleu, jamais des masters livrés. Les deux références temporaires `visuels-lanterne-ACC-14.png` et `visuels-lanterne-GLO-03.png` sont les rendus PNG des SVG de même nom cités plus haut.

#### ACC-04

- Date : **13 octobre 2026**.
- Jour : [ACC-04.png](ACC-04.png), génération puis éditions par l’outil OpenAI `image_gen` ; original sélectionné `exec-9a0cb76f-d5d5-4330-9f86-3d1da366e071.png`.
- Nuit : [ACC-04.nuit.png](ACC-04.nuit.png), édition du jour sélectionné ; original `exec-fd22d802-8096-4881-9da5-9be66e003ffa.png`.
- Sélection : Conserver cette variante native antérieure, la suivante surcorrigeait la position ; recalage local autorisé ensuite.

<details>
<summary>Prompt de jour et références</summary>

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

Subject: The paper card game invented with a cousin.
Composition: A summer-afternoon table viewed directly from above. A few printed cards, a laminator with one card coming out in its transparent sleeve, scissors, a couple of worn laminated cards, one completely blank rule sheet. Two pairs of simplified teenage hands: one feeds a card into the laminator, the other cuts one with scissors. One lantern at the top right of the table lights the emerging card. Card faces have only simple large geometric shapes, no characters, numbers, lettering, bars or pretend writing.

Series: overhead view, no horizon; main lines about 3px at 1800px, shadow hatch 1px.  Canvas exactly 1536×1024, aspect ratio 1.5. HARD lantern registration: the CENTRE of the RED FLAME at x=78% of width and y=26% of height, measured from top left, within 3 percentage points. This means pixel (1198,266). Position the whole lantern around this flame point. Do not interpret coordinates as the lantern bottom or top. Main subject at least60% of frame. Everything fully inside image, no cropped heads, hands or objects. Large untouched white areas, solid black masses, only sparse shadow hatching. No fine surface texture, patterns or decorative marks. Paper faces remain blank. Red only the flame and red hatching on illuminated surfaces, no glow/rays.

Attached images1–4: references for the hand-cut line and same square four-post lantern with top ring and drop-shaped flame. Do not copy their books, lettering, warm colours, rays, glow or ornament. Interpret only black/white/red flat ink. Illustration-story, timeless wood engraving.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

- `design/assets/marque/livre-lanterne/logo-illustre.png`
- `site/src/assets/marque/logo-symbole.webp`
- `/tmp/visuels-lanterne-ACC-14.png`
- `/tmp/visuels-lanterne-GLO-03.png`

</details>

<details>
<summary>Essai de correction 1</summary>

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

EDIT image1, the day illustration with blue target. MOVE the WHOLE LANTERN so its red flame CENTRE is exactly on the BLUE CROSS. Remove the old lantern and ALL BLUE GUIDE MARKS. Keep same aspect ratio and canvas. Make the lantern smaller if necessary. Simplify this image drastically: remove three quarters of all texture lines from white surfaces, remove parallel strokes outside contact shadows, make hands simple outlines with no anatomy. Large untouched white paper and flat solid black. No cropped objects; bring the entire table, lantern ring and both pairs of disembodied hands with neat closed cuffs inside 6% clear white margins, no torsos crossing edges. Move flame left about70px and down about35px to target x1198,y266 on1536×1024. Red illumination only a small patch of hatching on emerging card and a small patch next to lantern.Image2–5 lantern and line references only, no books/lettering/ornament. Exact three flat keys black/white/red.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

- `/tmp/ACC-04-controle.png`
- `design/assets/marque/livre-lanterne/logo-illustre.png`
- `site/src/assets/marque/logo-symbole.webp`
- `/tmp/visuels-lanterne-ACC-14.png`
- `/tmp/visuels-lanterne-GLO-03.png`

</details>

<details>
<summary>Essai de correction 2</summary>

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

EDIT THE FIRST IMAGE. The BLUE GHOST LANTERN is the required finished lantern location: draw ONE finished black-white-red lantern directly on top of the blue wireframe. Its blue centre dot MUST become the red flame centre. Erase the old black lantern and restore blank paper there. No blue left. Do NOT draw the lantern near the ghost: replace the ghost itself with the actual lantern. Keep canvas and all other positions unchanged.

Images2–5 are only lantern design references. Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

- `/tmp/ACC-04-fantome.png`
- `design/assets/marque/livre-lanterne/logo-illustre.png`
- `site/src/assets/marque/logo-symbole.webp`
- `/tmp/visuels-lanterne-ACC-14.png`
- `/tmp/visuels-lanterne-GLO-03.png`

</details>

<details>
<summary>Essai de correction 3</summary>

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

Precise object edit of image1. Translate the lantern 100 pixels RIGHT and 50 pixels UP. Its red flame currently near(1096,316) must be centred at(1198,266) on1536x1024. Leave all other objects fixed. Preserve exact canvas dimensions, scene, camera and style. The point specified is the middle of red flame, not lantern top or base. Exactlyone lantern. The other4references are only design references.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

- `design/assets/visuels/accueil/ACC-04.png`
- `design/assets/marque/livre-lanterne/logo-illustre.png`
- `site/src/assets/marque/logo-symbole.webp`
- `/tmp/visuels-lanterne-ACC-14.png`
- `/tmp/visuels-lanterne-GLO-03.png`

</details>

<details>
<summary>Essai de correction 4</summary>

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

Edit first image. Move the lantern 64pixels LEFT and25pixels UP. Flame centre becomes1198,266 on1536x1024. Simplify hands to outlines. Remove the cropped upper torso and cropped sleeves at bottom: show only four separate hands ending in closed cuffs wholly INSIDE canvas, not attached to anything crossing the image edge. Keep all tabletopobjectsandcardpositions. Keep canvas size. Clear hand-cut outlines, few shadow hatches only, no grain. References2–5 lanternshapeonly.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

- `design/assets/visuels/accueil/ACC-04.png`
- `design/assets/marque/livre-lanterne/logo-illustre.png`
- `site/src/assets/marque/logo-symbole.webp`
- `/tmp/visuels-lanterne-ACC-14.png`
- `/tmp/visuels-lanterne-GLO-03.png`

</details>

<details>
<summary>Essai de correction 5</summary>

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

Precise edit of first image. Translate the whole lantern exactly 120 pixels RIGHT, keep its vertical position. Current red flame at(1075,273), required(1198,266) on1536×1024. Only move the lantern right. Erase the old location to plain white. Keep canvas and framing. References2–5 are lantern-shape references only. Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

- `design/assets/visuels/accueil/ACC-04.png`
- `design/assets/marque/livre-lanterne/logo-illustre.png`
- `site/src/assets/marque/logo-symbole.webp`
- `/tmp/visuels-lanterne-ACC-14.png`
- `/tmp/visuels-lanterne-GLO-03.png`

Source native de cet essai : `exec-47c97ade-64c5-4e16-a81b-b000c7bf6c1f.png`.

</details>

<details>
<summary>Essai de correction 6</summary>

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

Edit first image. Move only the whole lantern 40 pixels LEFT, no vertical move. This is a SMALL precise translation: preserve the lantern's size, every other pixel position and originalcanvas. Erase old lantern from its previous location. Reference images2–5 for same lantern model only.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

- `design/assets/visuels/accueil/ACC-04.png`
- `design/assets/marque/livre-lanterne/logo-illustre.png`
- `site/src/assets/marque/logo-symbole.webp`
- `/tmp/visuels-lanterne-ACC-14.png`
- `/tmp/visuels-lanterne-GLO-03.png`

Source native de cet essai : `exec-9a0cb76f-d5d5-4330-9f86-3d1da366e071.png`.

</details>

<details>
<summary>Prompt d’édition de nuit et références</summary>

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge with opaque solid black night.

Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.

EDIT FIRST IMAGE, the finished day master. Preserve exact 1536×1024 pixel canvas, all object contours, poses, camera, crop and lantern/flame position. Change only light and ink coverage. At least85% solidblack #000000 across the entire canvas. White backdrop and broadwhiteplanes become pureblack. Outside smalllitpool only rare thinwhite contours; omit most texture details. Red only flame and hatch marks ON smallpool and mainsubject. No halo, rays or glow. No largewhiteareas. References2–5 are lanternstyle only. Never add or move objects.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

- `design/assets/visuels/accueil/ACC-04.png`
- `design/assets/marque/livre-lanterne/logo-illustre.png`
- `site/src/assets/marque/logo-symbole.webp`
- `/tmp/visuels-lanterne-ACC-14.png`
- `/tmp/visuels-lanterne-GLO-03.png`

Le premier fichier joint correspond au jour natif sélectionné, avant le recalage déterministe appliqué aux deux variantes.

</details>

#### ACC-08

- Date : **13 octobre 2026**.
- Jour : [ACC-08.png](ACC-08.png), génération puis éditions par l’outil OpenAI `image_gen` ; original sélectionné `exec-ba7d4745-a190-4c4b-aa70-84370f270744.png`.
- Nuit : [ACC-08.nuit.png](ACC-08.nuit.png), édition du jour sélectionné ; original `exec-1650f952-ca55-4896-9500-9854793f9fae.png`.

<details>
<summary>Prompt de jour et références</summary>

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

Subject: Doors that do not open.
Composition: One straight wall, exactly five doors aligned across it, each centred in its own fifth of the image width. The first four doors, of differing simple shapes and periods, are closed. The fifth at right is slightly ajar. A single lantern visible behind that door lights the doorway and a small pool on the ground with red hatching. No plaques, inscriptions, symbols or door numbers. Whole door frames visible. Keep large empty white wall areas and plain black doors; no ornamental details.

Series: perfectly front-facing wall, no perspective; main lines 3px at1800px, hatch1px. Exact panoramic 21:9 canvas. Centres of five doors at 10%,30%,50%,70%,90% width. All five must appear; no cropped objects. Canvas exactly 2016×864, aspect ratio 2.3333333333333335. HARD lantern registration: the CENTRE of the RED FLAME at x=90% of width and y=52% of height, measured from top left, within 3 percentage points. This means pixel (1814,449). Position the whole lantern around this flame point. Do not interpret coordinates as the lantern bottom or top. Main subject at least60% of frame. Everything fully inside image, no cropped heads, hands or objects. Large untouched white areas, solid black masses, only sparse shadow hatching. No fine surface texture, patterns or decorative marks. Paper faces remain blank. Red only the flame and red hatching on illuminated surfaces, no glow/rays.

Attached images1–4: references for the hand-cut line and same square four-post lantern with top ring and drop-shaped flame. Do not copy their books, lettering, warm colours, rays, glow or ornament. Interpret only black/white/red flat ink. Illustration-story, timeless wood engraving.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

- `design/assets/marque/livre-lanterne/logo-illustre.png`
- `site/src/assets/marque/logo-symbole.webp`
- `/tmp/visuels-lanterne-ACC-14.png`
- `/tmp/visuels-lanterne-GLO-03.png`

</details>

<details>
<summary>Prompt d’édition de nuit et références</summary>

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge with opaque solid black night.

Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.

EDIT FIRST IMAGE, the finished day master. Preserve exact 1916×821 pixel canvas, every object contour, pose, camera, crop and lantern/flame position. Change only light and ink coverage. At least85% of entire canvas solidblack #000000. Former white background and broad whitesurfaces become pureblack. Outside the lantern's smalllitpool use only rare thin white contours; mostminor details disappear inblack. Redonly flame and redhatching ON smallpool andmainsubject. No atmospheric rays or halo. No broadwhite areas, no white vignette. References2–5 are lanternstyleonly. Never move objects or addanything.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

- `design/assets/visuels/accueil/ACC-08.png`
- `design/assets/marque/livre-lanterne/logo-illustre.png`
- `site/src/assets/marque/logo-symbole.webp`
- `/tmp/visuels-lanterne-ACC-14.png`
- `/tmp/visuels-lanterne-GLO-03.png`

Le premier fichier joint correspond au jour natif sélectionné, avant le recalage déterministe appliqué aux deux variantes.

</details>

#### ACC-09

- Date : **13 octobre 2026**.
- Jour : [ACC-09.png](ACC-09.png), génération puis éditions par l’outil OpenAI `image_gen` ; original sélectionné `exec-d58be2bd-a75c-4a7f-b8eb-f12ce08e9cb8.png`.
- Nuit : [ACC-09.nuit.png](ACC-09.nuit.png), édition du jour sélectionné ; original `exec-9072533e-6230-46a0-a706-eb0e8ab91477.png`.

<details>
<summary>Prompt de jour et références</summary>

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

Subject: Covering the curriculum at a run.
Composition: A large stopwatch resting on three large folders stacked in perspective, its hands almost back at their starting position; a rolled diploma tied with a ribbon and seal in front. A single lantern on the left lights the scroll. Plain unnumbered watch face, folders completely blank. Only these objects. Broad white paper spaces and black masses.

Series: three-quarter view from slightly above, horizon at two-thirds; main lines3px at1800px, hatch1px. The whole main subject and lantern fit the middle two-thirds of height, y=17–83%, for a future 2:1 centre crop. Exact4:3 canvas. Canvas exactly 1536×1152, aspect ratio 1.3333333333333333. HARD lantern registration: the CENTRE of the RED FLAME at x=22% of width and y=40% of height, measured from top left, within 3 percentage points. This means pixel (338,461). Position the whole lantern around this flame point. Do not interpret coordinates as the lantern bottom or top. Main subject at least60% of frame. Everything fully inside image, no cropped heads, hands or objects. Large untouched white areas, solid black masses, only sparse shadow hatching. No fine surface texture, patterns or decorative marks. Paper faces remain blank. Red only the flame and red hatching on illuminated surfaces, no glow/rays.

Attached images1–4: references for the hand-cut line and same square four-post lantern with top ring and drop-shaped flame. Do not copy their books, lettering, warm colours, rays, glow or ornament. Interpret only black/white/red flat ink. Illustration-story, timeless wood engraving.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

- `design/assets/marque/livre-lanterne/logo-illustre.png`
- `site/src/assets/marque/logo-symbole.webp`
- `/tmp/visuels-lanterne-ACC-14.png`
- `/tmp/visuels-lanterne-GLO-03.png`

</details>

<details>
<summary>Essai de correction 1</summary>

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

EDIT image1, the day illustration with blue target. MOVE the WHOLE LANTERN so its red flame CENTRE is exactly on the BLUE CROSS. Remove the old lantern and ALL BLUE GUIDE MARKS. Keep same aspect ratio and canvas. Make the lantern smaller if necessary. Simplify this image drastically: remove three quarters of all texture lines from white surfaces, remove parallel strokes outside contact shadows, make hands simple outlines with no anatomy. Large untouched white paper and flat solid black. No cropped objects; Move lantern flame right and UP to x319,y434 on1448×1086. Reduce stopwatch/folders/scroll composition until every mainobjectfits withiny17–83% ofcanvas, addblankwhitearound, to allow2:1centrecrop. No microtexture; folders andtableblank; scrollplain exceptsealandribbon. Image2–5 lantern and line references only, no books/lettering/ornament. Exact three flat keys black/white/red.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

- `/tmp/ACC-09-controle.png`
- `design/assets/marque/livre-lanterne/logo-illustre.png`
- `site/src/assets/marque/logo-symbole.webp`
- `/tmp/visuels-lanterne-ACC-14.png`
- `/tmp/visuels-lanterne-GLO-03.png`

</details>

<details>
<summary>Essai de correction 2</summary>

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

EDIT THE FIRST IMAGE. The BLUE GHOST LANTERN is the required finished lantern location: draw ONE finished black-white-red lantern directly on top of the blue wireframe. Its blue centre dot MUST become the red flame centre. Erase the old black lantern and restore blank paper there. No blue left. Do NOT draw the lantern near the ghost: replace the ghost itself with the actual lantern. Keep canvas and all other positions unchanged.

Images2–5 are only lantern design references. Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

- `/tmp/ACC-09-fantome.png`
- `design/assets/marque/livre-lanterne/logo-illustre.png`
- `site/src/assets/marque/logo-symbole.webp`
- `/tmp/visuels-lanterne-ACC-14.png`
- `/tmp/visuels-lanterne-GLO-03.png`

</details>

<details>
<summary>Essai de correction 3</summary>

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

Precise object edit of image1. Move the lantern UP by185pixels, slightlyLEFT20pixels, so flame now near(340,620) becomes(319,434) on1448x1086. The lantern may rest on the rear tableplane at this higher image position; change only the lantern. Preserve exact canvas dimensions, scene, camera and style. The point specified is the middle of red flame, not lantern top or base. Exactlyone lantern. The other4references are only design references.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

- `design/assets/visuels/accueil/ACC-09.png`
- `design/assets/marque/livre-lanterne/logo-illustre.png`
- `site/src/assets/marque/logo-symbole.webp`
- `/tmp/visuels-lanterne-ACC-14.png`
- `/tmp/visuels-lanterne-GLO-03.png`

</details>

<details>
<summary>Prompt d’édition de nuit et références</summary>

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge with opaque solid black night.

Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.

EDIT FIRST IMAGE, the finished day master. Preserve exact 1448×1086 pixel canvas, every object contour, pose, camera, crop and lantern/flame position. Change only light and ink coverage. At least85% of entire canvas solidblack #000000. Former white background and broad whitesurfaces become pureblack. Outside the lantern's smalllitpool use only rare thin white contours; mostminor details disappear inblack. Redonly flame and redhatching ON smallpool andmainsubject. No atmospheric rays or halo. No broadwhite areas, no white vignette. References2–5 are lanternstyleonly. Never move objects or addanything.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

- `design/assets/visuels/accueil/ACC-09.png`
- `design/assets/marque/livre-lanterne/logo-illustre.png`
- `site/src/assets/marque/logo-symbole.webp`
- `/tmp/visuels-lanterne-ACC-14.png`
- `/tmp/visuels-lanterne-GLO-03.png`

Le premier fichier joint correspond au jour natif sélectionné, avant le recalage déterministe appliqué aux deux variantes.

</details>

#### ACC-11

- Date : **13 octobre 2026**.
- Jour : [ACC-11.png](ACC-11.png), génération puis éditions par l’outil OpenAI `image_gen` ; original sélectionné `exec-5cb0c8be-9d54-401c-87a4-1f23eb3df8e1.png`.
- Nuit : [ACC-11.nuit.png](ACC-11.nuit.png), édition du jour sélectionné ; original `exec-dba75471-de25-446c-bba8-932097243ad5.png`.

<details>
<summary>Prompt de jour et références</summary>

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

Subject: The classroom seen from the instructor's lectern.
Composition: From the platform behind the instructor's shoulder: the lectern and back-facing faceless instructor in foreground. Ahead, about ten workstations in two rows, learners as extremely simple black faceless silhouettes leaning toward screens. On the wall, a board showing exactly three large connected empty blocks without any words. One lantern on the lectern lights the main teaching area from the front. Keep all heads fully inside canvas. Minimize furniture details and hatching; computers are plain rectangles.

Series: three-quarter view from slightly above; horizon two-thirds; main lines3px at1800px, hatch1px. Keep important subjects within the middle two-thirds of height y=17–83% for future2:1 centre crop. Exact4:3. Canvas exactly 1536×1152, aspect ratio 1.3333333333333333. HARD lantern registration: the CENTRE of the RED FLAME at x=30% of width and y=70% of height, measured from top left, within 3 percentage points. This means pixel (461,806). Position the whole lantern around this flame point. Do not interpret coordinates as the lantern bottom or top. Main subject at least60% of frame. Everything fully inside image, no cropped heads, hands or objects. Large untouched white areas, solid black masses, only sparse shadow hatching. No fine surface texture, patterns or decorative marks. Paper faces remain blank. Red only the flame and red hatching on illuminated surfaces, no glow/rays.

Attached images1–4: references for the hand-cut line and same square four-post lantern with top ring and drop-shaped flame. Do not copy their books, lettering, warm colours, rays, glow or ornament. Interpret only black/white/red flat ink. Illustration-story, timeless wood engraving.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

- `design/assets/marque/livre-lanterne/logo-illustre.png`
- `site/src/assets/marque/logo-symbole.webp`
- `/tmp/visuels-lanterne-ACC-14.png`
- `/tmp/visuels-lanterne-GLO-03.png`

</details>

<details>
<summary>Essai de correction 1</summary>

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

EDIT THE FIRST IMAGE. The BLUE GHOST LANTERN is the required finished lantern location: draw ONE finished black-white-red lantern directly on top of the blue wireframe. Its blue centre dot MUST become the red flame centre. Erase the old black lantern and restore blank paper there. No blue left. Do NOT draw the lantern near the ghost: replace the ghost itself with the actual lantern. Keep canvas and all other positions unchanged. Reduce all repetitive hatch textures by80%, leaving broad plain white tables and walls, solid black silhouettes.

Images2–5 are only lantern design references. Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

- `/tmp/ACC-11-fantome.png`
- `design/assets/marque/livre-lanterne/logo-illustre.png`
- `site/src/assets/marque/logo-symbole.webp`
- `/tmp/visuels-lanterne-ACC-14.png`
- `/tmp/visuels-lanterne-GLO-03.png`

</details>

<details>
<summary>Essai de correction 2</summary>

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

Precise object edit of image1. Move the lantern LEFT by90pixels and DOWN by40pixels. Current flame near(524,720) must become(434,760). Let it overlap the lectern and instructor's elbow naturally. Remove extra plant/shelf and eliminate most floor andclothingtexture. Preserve exact canvas dimensions, scene, camera and style. The point specified is the middle of red flame, not lantern top or base. Exactlyone lantern. The other4references are only design references.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

- `design/assets/visuels/accueil/ACC-11.png`
- `design/assets/marque/livre-lanterne/logo-illustre.png`
- `site/src/assets/marque/logo-symbole.webp`
- `/tmp/visuels-lanterne-ACC-14.png`
- `/tmp/visuels-lanterne-GLO-03.png`

</details>

<details>
<summary>Prompt d’édition de nuit et références</summary>

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge with opaque solid black night.

Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.

EDIT FIRST IMAGE, the finished day master. Preserve exact 1448×1086 pixel canvas, every object contour, pose, camera, crop and lantern/flame position. Change only light and ink coverage. At least85% of entire canvas solidblack #000000. Former white background and broad whitesurfaces become pureblack. Outside the lantern's smalllitpool use only rare thin white contours; mostminor details disappear inblack. Redonly flame and redhatching ON smallpool andmainsubject. No atmospheric rays or halo. No broadwhite areas, no white vignette. References2–5 are lanternstyleonly. Never move objects or addanything.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

- `design/assets/visuels/accueil/ACC-11.png`
- `design/assets/marque/livre-lanterne/logo-illustre.png`
- `site/src/assets/marque/logo-symbole.webp`
- `/tmp/visuels-lanterne-ACC-14.png`
- `/tmp/visuels-lanterne-GLO-03.png`

Le premier fichier joint correspond au jour natif sélectionné, avant le recalage déterministe appliqué aux deux variantes.

</details>

#### ACC-18

- Date : **13 octobre 2026**.
- Jour : [ACC-18.png](ACC-18.png), génération puis éditions par l’outil OpenAI `image_gen` ; original sélectionné `exec-34f390c5-6152-453b-8210-71ff3eb32708.png`.
- Nuit : [ACC-18.nuit.png](ACC-18.nuit.png), édition du jour sélectionné ; original `exec-06de078c-af25-409d-ba58-8b9455848b48.png`.

<details>
<summary>Prompt de jour et références</summary>

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

Subject: Reading the game.
Composition: Vertical card illustration with no frame. On a hilltop, a back-facing faceless silhouette studies a citadel and checkerboard fields below through a magnifying glass; a few cross-shaped markers in the landscape. One lantern at the silhouette's feet lights the magnifying lens. Plain empty sky, no celestial body. Very simple citadel and broad fields, no intricate buildings or ornament.

Series: front view slightly low angle, horizon lower third; main lines4px at1200px, broad shadow hatch readable at165px. Keep all important objects inside8% safe margins on each edge. Exact2:3 portrait. Canvas exactly 1024×1536, aspect ratio 0.6666666666666666. HARD lantern registration: the CENTRE of the RED FLAME at x=35% of width and y=72% of height, measured from top left, within 3 percentage points. This means pixel (358,1106). Position the whole lantern around this flame point. Do not interpret coordinates as the lantern bottom or top. Main subject at least60% of frame. Everything fully inside image, no cropped heads, hands or objects. Large untouched white areas, solid black masses, only sparse shadow hatching. No fine surface texture, patterns or decorative marks. Paper faces remain blank. Red only the flame and red hatching on illuminated surfaces, no glow/rays.

FIRST IMAGE IS A LAYOUT GUIDE ONLY: replace its blue wireframe lantern with the final black-white-red lantern at EXACTLY that position and size, centre of red flame at blue cross. Generate the described scene around it. Remove all blue. Preserve the guide canvas exactly. Images2–5: references for the hand-cut line and same square four-post lantern with top ring and drop-shaped flame. Do not copy their books, lettering, warm colours, rays, glow or ornament. Interpret only black/white/red flat ink. Illustration-story, timeless wood engraving.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

- `/tmp/ACC-18-fantome.png`
- `design/assets/marque/livre-lanterne/logo-illustre.png`
- `site/src/assets/marque/logo-symbole.webp`
- `/tmp/visuels-lanterne-ACC-14.png`
- `/tmp/visuels-lanterne-GLO-03.png`

</details>

<details>
<summary>Prompt d’édition de nuit et références</summary>

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge with opaque solid black night.

Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.

EDIT FIRST IMAGE, the finished day master. Preserve exact 1024×1536 pixel canvas, every object contour, pose, camera, crop and lantern/flame position. Change only light and ink coverage. At least85% of entire canvas solidblack #000000. Former white background and broad whitesurfaces become pureblack. Outside the lantern's smalllitpool use only rare thin white contours; mostminor details disappear inblack. Redonly flame and redhatching ON smallpool andmainsubject. No atmospheric rays or halo. No broadwhite areas, no white vignette. References2–5 are lanternstyleonly. Never move objects or addanything.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

- `design/assets/visuels/accueil/ACC-18.png`
- `design/assets/marque/livre-lanterne/logo-illustre.png`
- `site/src/assets/marque/logo-symbole.webp`
- `/tmp/visuels-lanterne-ACC-14.png`
- `/tmp/visuels-lanterne-GLO-03.png`

Le premier fichier joint correspond au jour natif sélectionné, avant le recalage déterministe appliqué aux deux variantes.

</details>

#### ACC-19

- Date : **13 octobre 2026**.
- Jour : [ACC-19.png](ACC-19.png), génération puis éditions par l’outil OpenAI `image_gen` ; original sélectionné `exec-6226a7ce-69ad-4de1-872e-ceefa60c080a.png`.
- Nuit : [ACC-19.nuit.png](ACC-19.nuit.png), édition du jour sélectionné ; original `exec-a5bac2cd-09b9-4573-8dbe-2835cabd358a.png`.
- Sélection : Conserver cette variante native antérieure, la suivante surcorrigeait la position ; recalage local autorisé ensuite.

<details>
<summary>Prompt de jour et références</summary>

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

Subject: Testing my ideas.
Composition: Vertical card illustration with no frame. Three overlapping test sheets on a table: first crossed out with a single large X, second completely blank, third bearing a single large checkmark. A quill touching the checked sheet, one inkpot beside. One lantern at top right lights the checked sheet. Only those large marks, no annotations or fake writing, all other surfaces blank.

Series: front view slightly low angle, horizon lower third; main lines4px at1200px, broad shadow hatch readable165px. Keep all important objects inside8% safe margins. Exact2:3 portrait. Canvas exactly 1024×1536, aspect ratio 0.6666666666666666. HARD lantern registration: the CENTRE of the RED FLAME at x=70% of width and y=24% of height, measured from top left, within 3 percentage points. This means pixel (717,369). Position the whole lantern around this flame point. Do not interpret coordinates as the lantern bottom or top. Main subject at least60% of frame. Everything fully inside image, no cropped heads, hands or objects. Large untouched white areas, solid black masses, only sparse shadow hatching. No fine surface texture, patterns or decorative marks. Paper faces remain blank. Red only the flame and red hatching on illuminated surfaces, no glow/rays.

FIRST IMAGE IS A LAYOUT GUIDE ONLY: replace its blue wireframe lantern with the final black-white-red lantern at EXACTLY that position and size, centre of red flame at blue cross. Generate the described scene around it. Remove all blue. Preserve the guide canvas exactly. Images2–5: references for the hand-cut line and same square four-post lantern with top ring and drop-shaped flame. Do not copy their books, lettering, warm colours, rays, glow or ornament. Interpret only black/white/red flat ink. Illustration-story, timeless wood engraving.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

- `/tmp/ACC-19-fantome.png`
- `design/assets/marque/livre-lanterne/logo-illustre.png`
- `site/src/assets/marque/logo-symbole.webp`
- `/tmp/visuels-lanterne-ACC-14.png`
- `/tmp/visuels-lanterne-GLO-03.png`

</details>

<details>
<summary>Essai de correction 1</summary>

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

Edit first image. Move the entire lantern UP80pixels and LEFT15pixels: flamecentre716,369 on1024x1536. Keep quill tip oncheckedsheet but redraw its feather shorter so its top isfully visiblewith8% rightmargin. Firstsheetalsoinside8%leftmargin. Remove 90% of tabletop texture, leaving large purewhite areas and plainblacktableedge. No chair needed. Keep canvas size. Clear hand-cut outlines, few shadow hatches only, no grain. References2–5 lanternshapeonly.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

- `design/assets/visuels/accueil/ACC-19.png`
- `design/assets/marque/livre-lanterne/logo-illustre.png`
- `site/src/assets/marque/logo-symbole.webp`
- `/tmp/visuels-lanterne-ACC-14.png`
- `/tmp/visuels-lanterne-GLO-03.png`

</details>

<details>
<summary>Essai de correction 2</summary>

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

Precise edit of first image. Move the whole lantern about90pixels RIGHT. Its current red flame at(626,393) must move to(716,369). Keep all sheets and quill fixed. Draw first sheet completely inside canvas with8% margin. Do not move lantern left. Keep canvas and framing. References2–5 are lantern-shape references only. Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

- `design/assets/visuels/accueil/ACC-19.png`
- `design/assets/marque/livre-lanterne/logo-illustre.png`
- `site/src/assets/marque/logo-symbole.webp`
- `/tmp/visuels-lanterne-ACC-14.png`
- `/tmp/visuels-lanterne-GLO-03.png`

Source native de cet essai : `exec-45bf24af-97d2-45cb-b5a9-459927bfd681.png`.

</details>

<details>
<summary>Essai de correction 3</summary>

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

Edit first image. Move only the whole lantern 35 pixels LEFT and20pixels UP. This is a SMALL precise translation: preserve the lantern's size, every other pixel position and originalcanvas. Erase old lantern from its previous location. Reference images2–5 for same lantern model only.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

- `design/assets/visuels/accueil/ACC-19.png`
- `design/assets/marque/livre-lanterne/logo-illustre.png`
- `site/src/assets/marque/logo-symbole.webp`
- `/tmp/visuels-lanterne-ACC-14.png`
- `/tmp/visuels-lanterne-GLO-03.png`

Source native de cet essai : `exec-6226a7ce-69ad-4de1-872e-ceefa60c080a.png`.

</details>

<details>
<summary>Prompt d’édition de nuit et références</summary>

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge with opaque solid black night.

Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.

EDIT FIRST IMAGE, the finished day master. Preserve exact 1024×1536 pixel canvas, all object contours, poses, camera, crop and lantern/flame position. Change only light and ink coverage. At least85% solidblack #000000 across the entire canvas. White backdrop and broadwhiteplanes become pureblack. Outside smalllitpool only rare thinwhite contours; omit most texture details. Red only flame and hatch marks ON smallpool and mainsubject. No halo, rays or glow. No largewhiteareas. References2–5 are lanternstyle only. Never add or move objects.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

- `design/assets/visuels/accueil/ACC-19.png`
- `design/assets/marque/livre-lanterne/logo-illustre.png`
- `site/src/assets/marque/logo-symbole.webp`
- `/tmp/visuels-lanterne-ACC-14.png`
- `/tmp/visuels-lanterne-GLO-03.png`

Le premier fichier joint correspond au jour natif sélectionné, avant le recalage déterministe appliqué aux deux variantes.

</details>

#### ACC-20

- Date : **13 octobre 2026**.
- Jour : [ACC-20.png](ACC-20.png), génération puis éditions par l’outil OpenAI `image_gen` ; original sélectionné `exec-00cbcc89-c777-4699-a309-852148f1d97f.png`.
- Nuit : [ACC-20.nuit.png](ACC-20.nuit.png), édition du jour sélectionné ; original `exec-0046cfe6-ed4b-4494-aede-8e62c1b30974.png`.

<details>
<summary>Prompt de jour et références</summary>

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

Subject: Taking the opposite direction.
Composition: Vertical card illustration with no frame. A broad worn path climbs right, empty. A fresh narrow path heads the opposite way to the left, lit by one lantern held at arm's length by a back-facing faceless silhouette. A few plain tree silhouettes on either side, a single mountain shape reserved in the background. Large clear masses, few strokes.

Series: front view slightly low angle, horizon lower third; main lines4px at1200px, broad shadow hatch readable165px. Keep all important objects inside8% safe margins. Exact2:3 portrait. Canvas exactly 1024×1536, aspect ratio 0.6666666666666666. HARD lantern registration: the CENTRE of the RED FLAME at x=40% of width and y=46% of height, measured from top left, within 3 percentage points. This means pixel (410,707). Position the whole lantern around this flame point. Do not interpret coordinates as the lantern bottom or top. Main subject at least60% of frame. Everything fully inside image, no cropped heads, hands or objects. Large untouched white areas, solid black masses, only sparse shadow hatching. No fine surface texture, patterns or decorative marks. Paper faces remain blank. Red only the flame and red hatching on illuminated surfaces, no glow/rays.

FIRST IMAGE IS A LAYOUT GUIDE ONLY: replace its blue wireframe lantern with the final black-white-red lantern at EXACTLY that position and size, centre of red flame at blue cross. Generate the described scene around it. Remove all blue. Preserve the guide canvas exactly. Images2–5: references for the hand-cut line and same square four-post lantern with top ring and drop-shaped flame. Do not copy their books, lettering, warm colours, rays, glow or ornament. Interpret only black/white/red flat ink. Illustration-story, timeless wood engraving.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

- `/tmp/ACC-20-fantome.png`
- `design/assets/marque/livre-lanterne/logo-illustre.png`
- `site/src/assets/marque/logo-symbole.webp`
- `/tmp/visuels-lanterne-ACC-14.png`
- `/tmp/visuels-lanterne-GLO-03.png`

</details>

<details>
<summary>Essai de correction 1</summary>

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

Edit first image. Move lantern and raised hand UP80pixels and LEFT25pixels: flamecentre410,707 on1024x1536. REMOVE the white/red halo around the lantern and figure. Simplify landscape enormously: two solidblacktrees, oneplainwhite mountain, broadplainwhite paths, solidblackrockshapes. Remove grassblades and90% hatchtexture; redonlyafewhatches ON theleftpath underlantern, nonefloatingaroundobjects. Keep canvas size. Clear hand-cut outlines, few shadow hatches only, no grain. References2–5 lanternshapeonly.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

- `design/assets/visuels/accueil/ACC-20.png`
- `design/assets/marque/livre-lanterne/logo-illustre.png`
- `site/src/assets/marque/logo-symbole.webp`
- `/tmp/visuels-lanterne-ACC-14.png`
- `/tmp/visuels-lanterne-GLO-03.png`

</details>

<details>
<summary>Essai de correction 2</summary>

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

Precise edit of first image. Lift the lantern and the figure's forearm UP60pixels. Keep horizontal position410. Flame target410,707 on1024×1536. Remove the wide white rim around figure and lantern; use normal thin black contours. Preserve large black masses and empty white paths. Keep canvas and framing. References2–5 are lantern-shape references only. Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

- `design/assets/visuels/accueil/ACC-20.png`
- `design/assets/marque/livre-lanterne/logo-illustre.png`
- `site/src/assets/marque/logo-symbole.webp`
- `/tmp/visuels-lanterne-ACC-14.png`
- `/tmp/visuels-lanterne-GLO-03.png`

Source native de cet essai : `exec-3c767f1a-fac6-4010-99c3-ce8dfbe9578e.png`.

</details>

<details>
<summary>Prompt d’édition de nuit et références</summary>

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge with opaque solid black night.

Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.

EDIT FIRST IMAGE, the finished day master. Preserve exact 1024×1536 pixel canvas, all object contours, poses, camera, crop and lantern/flame position. Change only light and ink coverage. At least85% solidblack #000000 across the entire canvas. White backdrop and broadwhiteplanes become pureblack. Outside smalllitpool only rare thinwhite contours; omit most texture details. Red only flame and hatch marks ON smallpool and mainsubject. No halo, rays or glow. No largewhiteareas. References2–5 are lanternstyle only. Never add or move objects.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

- `design/assets/visuels/accueil/ACC-20.png`
- `design/assets/marque/livre-lanterne/logo-illustre.png`
- `site/src/assets/marque/logo-symbole.webp`
- `/tmp/visuels-lanterne-ACC-14.png`
- `/tmp/visuels-lanterne-GLO-03.png`

Le premier fichier joint correspond au jour natif sélectionné, avant le recalage déterministe appliqué aux deux variantes.

</details>

#### ACC-21

- Date : **13 octobre 2026**.
- Jour : [ACC-21.png](ACC-21.png), génération puis éditions par l’outil OpenAI `image_gen` ; original sélectionné `exec-f71e2ef5-f564-47b9-ad90-e30273b39375.png`.
- Nuit : [ACC-21.nuit.png](ACC-21.nuit.png), édition du jour sélectionné ; original `exec-67e85eb6-e761-4268-b3e7-60113e377e3b.png`.

<details>
<summary>Prompt de jour et références</summary>

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

Subject: Welcoming newcomers.
Composition: An open door into a plain workroom. At the threshold a faceless silhouette welcomes with a simple hand gesture a newcomer carrying a shoulder bag. A few footprints lead to the door. One lantern hangs on the door jamb and lights the newcomer. Two simple black silhouettes with heads fully in canvas, no inscriptions. The modest room contains a plain worktable and shelf as a sparse background.

Series: three-quarter view at shoulder height, horizon middle; main lines4px at1800px, very few shadow hatches, readable300px. Keep main subject and lantern within y=12.5–87.5% for future2:1 crop. Establish same simple room, host in plain jacket and newcomer in plain pullover for two subsequent scenes. Exact3:2. Canvas exactly 1536×1024, aspect ratio 1.5. HARD lantern registration: the CENTRE of the RED FLAME at x=46% of width and y=24% of height, measured from top left, within 3 percentage points. This means pixel (707,246). Position the whole lantern around this flame point. Do not interpret coordinates as the lantern bottom or top. Main subject at least60% of frame. Everything fully inside image, no cropped heads, hands or objects. Large untouched white areas, solid black masses, only sparse shadow hatching. No fine surface texture, patterns or decorative marks. Paper faces remain blank. Red only the flame and red hatching on illuminated surfaces, no glow/rays.

FIRST IMAGE IS A LAYOUT GUIDE ONLY: replace its blue wireframe lantern with the final black-white-red lantern at EXACTLY that position and size, centre of red flame at blue cross. Generate the described scene around it. Remove all blue. Preserve guide canvas. Extremely economical cut wood, leave 65% untouched white paper; only a few clean carved outline strokes and large untextured black shapes. Omit wood-grain pattern entirely. No dense texture. Images2–5: references for the hand-cut line and same square four-post lantern with top ring and drop-shaped flame. Do not copy their books, lettering, warm colours, rays, glow or ornament. Interpret only black/white/red flat ink. Illustration-story, timeless wood engraving.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

- `/tmp/ACC-21-fantome.png`
- `design/assets/marque/livre-lanterne/logo-illustre.png`
- `site/src/assets/marque/logo-symbole.webp`
- `/tmp/visuels-lanterne-ACC-14.png`
- `/tmp/visuels-lanterne-GLO-03.png`

</details>

<details>
<summary>Essai de correction 1</summary>

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

Edit first image. Pull back within the SAME canvas so the two people, all their feet, door frame, table and shelf fit completely inside a 5% empty white border. Nobody cropped. Maintain lantern flame at46%width,24%height while rearranging plain doorway support around it. Remove most hatching from clothing, door and floor: solid black silhouettes and large white planes. No extra objects. Keep canvas dimensions. References2–5 lanternshapeonly. Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

- `design/assets/visuels/accueil/ACC-21.png`
- `design/assets/marque/livre-lanterne/logo-illustre.png`
- `site/src/assets/marque/logo-symbole.webp`
- `/tmp/visuels-lanterne-ACC-14.png`
- `/tmp/visuels-lanterne-GLO-03.png`

Source native de cet essai : `exec-02b90e74-1e21-4b78-9e7b-fa936f7f6e23.png`.

</details>

<details>
<summary>Essai de correction 2</summary>

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

Edit first image. Move lantern and its wall hook 50pixels RIGHT and40pixels UP, extending its support from door jamb. Keep all people and room fixed. This is a SMALL precise translation: preserve the lantern's size, every other pixel position and originalcanvas. Erase old lantern from its previous location. Reference images2–5 for same lantern model only.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

- `design/assets/visuels/accueil/ACC-21.png`
- `design/assets/marque/livre-lanterne/logo-illustre.png`
- `site/src/assets/marque/logo-symbole.webp`
- `/tmp/visuels-lanterne-ACC-14.png`
- `/tmp/visuels-lanterne-GLO-03.png`

Source native de cet essai : `exec-9c019d15-9bc2-4d42-acab-c16e41ba6a2b.png`.

</details>

<details>
<summary>Prompt d’édition de nuit et références</summary>

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge with opaque solid black night.

Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.

EDIT FIRST IMAGE, the finished day master. Preserve exact 1536×1024 pixel canvas, all object positions, poses, camera, crop and lantern/flame location. Only change light and ink coverage. At least85% solidblack #000000 across entire canvas. White backdrop and broad surfaces become pureblack. Outside smalllitpool only rare thin white contours, omit most fine detail. Redonly flame and red hatches ON smallpool and main subject; no atmospheric rays or halo. No broadwhite areas. References2–5 are only lanternstyle references. Never add or move objects.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

- `design/assets/visuels/accueil/ACC-21.png`
- `design/assets/marque/livre-lanterne/logo-illustre.png`
- `site/src/assets/marque/logo-symbole.webp`
- `/tmp/visuels-lanterne-ACC-14.png`
- `/tmp/visuels-lanterne-GLO-03.png`

Le premier fichier joint correspond au jour natif sélectionné, avant le recalage déterministe appliqué aux deux variantes.

</details>

#### ACC-22

- Date : **13 octobre 2026**.
- Jour : [ACC-22.png](ACC-22.png), génération puis éditions par l’outil OpenAI `image_gen` ; original sélectionné `exec-4b36dd0b-a5ff-4755-a0ad-e2c4493edbba.png`.
- Nuit : [ACC-22.nuit.png](ACC-22.nuit.png), édition du jour sélectionné ; original `exec-a448f05c-e617-4549-8c85-4e07272cbec1.png`.

<details>
<summary>Prompt de jour et références</summary>

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

Subject: Teaching and reviewing.
Composition: In the same plain workroom as the composition reference, the same two faceless silhouettes sit side by side at one table leaning over one sheet. One points at the page, the other corrects with a pencil; only a single large checkmark in the margin, all other paper completely blank. A single lantern on the table between them lights the sheet. Same plain jacket and plain pullover, very simplified hands.

Series: three-quarter view at shoulder height, horizon middle; main lines4px at1800px, very few shadowhatches readable300px. Keep main subject and lantern within y=12.5–87.5% for future2:1 crop. Exact3:2. Canvas exactly 1536×1024, aspect ratio 1.5. HARD lantern registration: the CENTRE of the RED FLAME at x=50% of width and y=56% of height, measured from top left, within 3 percentage points. This means pixel (768,573). Position the whole lantern around this flame point. Do not interpret coordinates as the lantern bottom or top. Main subject at least60% of frame. Everything fully inside image, no cropped heads, hands or objects. Large untouched white areas, solid black masses, only sparse shadow hatching. No fine surface texture, patterns or decorative marks. Paper faces remain blank. Red only the flame and red hatching on illuminated surfaces, no glow/rays.

First image is composition continuity reference only: reuse exactly the same plain room and faceless clothing silhouettes, compose the described new action, zoom out so no head/arm/object is cropped by canvas. Images2–5: references for the hand-cut line and same square four-post lantern with top ring and drop-shaped flame. Do not copy their books, lettering, warm colours, rays, glow or ornament. Interpret only black/white/red flat ink. Illustration-story, timeless wood engraving.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

- `design/assets/visuels/accueil/ACC-21.png`
- `design/assets/marque/livre-lanterne/logo-illustre.png`
- `site/src/assets/marque/logo-symbole.webp`
- `/tmp/visuels-lanterne-ACC-14.png`
- `/tmp/visuels-lanterne-GLO-03.png`

</details>

<details>
<summary>Essai de correction 1</summary>

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

Edit first image. Move the lantern DOWN100pixels and RIGHT15pixels, into the foreground on the table between the two people. Flamecentre768,573 on1536x1024. Keep the sheet and simplified hands unobscured to itsright. Remove90% tableandfloortexture, chairsandclothingmostlysolidblack. Do not change poses orcanvas. Keep canvas size. Clear hand-cut outlines, few shadow hatches only, no grain. References2–5 lanternshapeonly.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

- `design/assets/visuels/accueil/ACC-22.png`
- `design/assets/marque/livre-lanterne/logo-illustre.png`
- `site/src/assets/marque/logo-symbole.webp`
- `/tmp/visuels-lanterne-ACC-14.png`
- `/tmp/visuels-lanterne-GLO-03.png`

</details>

<details>
<summary>Prompt d’édition de nuit et références</summary>

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge with opaque solid black night.

Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.

EDIT FIRST IMAGE, the finished day master. Preserve exact 1536×1024 pixel canvas, all object contours, poses, camera, crop and lantern/flame position. Change only light and ink coverage. At least85% solidblack #000000 across the entire canvas. White backdrop and broadwhiteplanes become pureblack. Outside smalllitpool only rare thinwhite contours; omit most texture details. Red only flame and hatch marks ON smallpool and mainsubject. No halo, rays or glow. No largewhiteareas. References2–5 are lanternstyle only. Never add or move objects.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

- `design/assets/visuels/accueil/ACC-22.png`
- `design/assets/marque/livre-lanterne/logo-illustre.png`
- `site/src/assets/marque/logo-symbole.webp`
- `/tmp/visuels-lanterne-ACC-14.png`
- `/tmp/visuels-lanterne-GLO-03.png`

Le premier fichier joint correspond au jour natif sélectionné, avant le recalage déterministe appliqué aux deux variantes.

</details>

#### ACC-23

- Date : **13 octobre 2026**.
- Jour : [ACC-23.png](ACC-23.png), génération puis éditions par l’outil OpenAI `image_gen` ; original sélectionné `exec-abc600de-531b-4f32-9ba6-4bd1a0ee12bd.png`.
- Nuit : [ACC-23.nuit.png](ACC-23.nuit.png), édition du jour sélectionné ; original `exec-fa550404-be29-44b2-80f9-029bf43a5375.png`.

<details>
<summary>Prompt de jour et références</summary>

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

Subject: Contributing independently.
Composition: In the same plain workroom, the same pullover-wearing faceless silhouette alone at a workstation, viewed three-quarter from behind, sends a finished blank sheet toward a small pile of checked sheets on a shelf. Each paper is entirely blank except for one large checkmark. One lantern beside the screen is lit and lights the departing sheet. A plain screen without any interface or text. Simplified black silhouettes and broad blank surfaces.

Series: three-quarter view at shoulder height, horizon middle; main lines4px at1800px, veryfewshadowhatches readable300px. Keep subject and lantern withiny=12.5–87.5% forfuture2:1crop. Exact3:2. Canvas exactly 1536×1024, aspect ratio 1.5. HARD lantern registration: the CENTRE of the RED FLAME at x=30% of width and y=48% of height, measured from top left, within 3 percentage points. This means pixel (461,492). Position the whole lantern around this flame point. Do not interpret coordinates as the lantern bottom or top. Main subject at least60% of frame. Everything fully inside image, no cropped heads, hands or objects. Large untouched white areas, solid black masses, only sparse shadow hatching. No fine surface texture, patterns or decorative marks. Paper faces remain blank. Red only the flame and red hatching on illuminated surfaces, no glow/rays.

First image is composition continuity reference only: reuse exactly the same plain room and faceless clothing silhouettes, compose the described new action, zoom out so no head/arm/object is cropped by canvas. Images2–5: references for the hand-cut line and same square four-post lantern with top ring and drop-shaped flame. Do not copy their books, lettering, warm colours, rays, glow or ornament. Interpret only black/white/red flat ink. Illustration-story, timeless wood engraving.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

- `design/assets/visuels/accueil/ACC-21.png`
- `design/assets/marque/livre-lanterne/logo-illustre.png`
- `site/src/assets/marque/logo-symbole.webp`
- `/tmp/visuels-lanterne-ACC-14.png`
- `/tmp/visuels-lanterne-GLO-03.png`

</details>

<details>
<summary>Essai de correction 1</summary>

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

Precise edit of first image. Move the lantern LEFT65pixels, DOWN12pixels to flamecentre(461,492) on1536×1024. Simplify desk, stool and flooring by removing80% hatch texture, leaving solid white planes and solid black shapes. Keep other objects and pose fixed. Keep canvas and framing. References2–5 are lantern-shape references only. Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

- `design/assets/visuels/accueil/ACC-23.png`
- `design/assets/marque/livre-lanterne/logo-illustre.png`
- `site/src/assets/marque/logo-symbole.webp`
- `/tmp/visuels-lanterne-ACC-14.png`
- `/tmp/visuels-lanterne-GLO-03.png`

Source native de cet essai : `exec-9d3a2777-605c-4d5e-a840-65cda4dbb870.png`.

</details>

<details>
<summary>Prompt d’édition de nuit et références</summary>

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge with opaque solid black night.

Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.

EDIT FIRST IMAGE, the finished day master. Preserve exact 1536×1024 pixel canvas, all object contours, poses, camera, crop and lantern/flame position. Change only light and ink coverage. At least85% solidblack #000000 across the entire canvas. White backdrop and broadwhiteplanes become pureblack. Outside smalllitpool only rare thinwhite contours; omit most texture details. Red only flame and hatch marks ON smallpool and mainsubject. No halo, rays or glow. No largewhiteareas. References2–5 are lanternstyle only. Never add or move objects.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

- `design/assets/visuels/accueil/ACC-23.png`
- `design/assets/marque/livre-lanterne/logo-illustre.png`
- `site/src/assets/marque/logo-symbole.webp`
- `/tmp/visuels-lanterne-ACC-14.png`
- `/tmp/visuels-lanterne-GLO-03.png`

Le premier fichier joint correspond au jour natif sélectionné, avant le recalage déterministe appliqué aux deux variantes.

</details>

#### ACC-05

- Date : **13 octobre 2026**.
- Jour : [ACC-05.png](ACC-05.png), génération puis éditions par l’outil OpenAI `image_gen` ; original sélectionné `exec-7941d2fe-9235-45ce-9c07-fcd9722fc681.png`.
- Nuit : [ACC-05.nuit.png](ACC-05.nuit.png), édition du jour sélectionné ; original `exec-99b86109-af60-424e-b8b9-2900abf8d979.png`.

<details>
<summary>Prompt de jour et références</summary>

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

Subject: Learning programming to make games.
Composition: A teenager's bedroom, no person. An old computer with a curved CRT screen on a desk, an open programming book flat beside the keyboard, a couple of blank sheets. On the wall a pinned sketch of a generic platform level, just a few platforms and ladders as large simple lines. One lantern on the desk to the left of the screen lights the book. The screen is blank and does NOT glow; it reflects the lantern only. Book and sheets entirely blank, no text-like bars or lines.

Series: three-quarter view from slightly above,horizontwo-thirds; mainlines3pxat1800px,hatch1px. Centralize desk and lantern forpossible4:5crop. Exact4:3. Canvas exactly 1536×1152, aspect ratio 1.3333333333333333. HARD lantern registration: the CENTRE of the RED FLAME at x=30% of width and y=55% of height, measured from top left, within 3 percentage points. This means pixel (461,634). Position the whole lantern around this flame point. Do not interpret coordinates as the lantern bottom or top. Main subject at least60% of frame. Everything fully inside image, no cropped heads, hands or objects. Large untouched white areas, solid black masses, only sparse shadow hatching. No fine surface texture, patterns or decorative marks. Paper faces remain blank. Red only the flame and red hatching on illuminated surfaces, no glow/rays.

FIRST IMAGE IS A LAYOUT GUIDE ONLY: replace its blue wireframe lantern with the final black-white-red lantern at EXACTLY that position and size, centre of red flame at blue cross. Generate the described scene around it. Remove all blue. Preserve guide canvas. Extremely economical cut wood, leave 65% untouched white paper; only a few clean carved outline strokes and large untextured black shapes. Omit wood-grain pattern entirely. No dense texture. Images2–5: references for the hand-cut line and same square four-post lantern with top ring and drop-shaped flame. Do not copy their books, lettering, warm colours, rays, glow or ornament. Interpret only black/white/red flat ink. Illustration-story, timeless wood engraving.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

- `/tmp/ACC-05-fantome.png`
- `design/assets/marque/livre-lanterne/logo-illustre.png`
- `site/src/assets/marque/logo-symbole.webp`
- `/tmp/visuels-lanterne-ACC-14.png`
- `/tmp/visuels-lanterne-GLO-03.png`

</details>

<details>
<summary>Essai de correction 1</summary>

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

Edit first image. Keep the existing lantern EXACTLY in place. Erase the lantern reflection from the computer screen: the screen must be plain solid black. Remove the shelf, bed, figurine and pen pot, and 80% of all surface hatching; keep only the desk, CRT, keyboard, blank book and sheets, simple pinned platforms/ladders sketch. Fit the complete desk inside canvas with a small white margin, no object cropped. Keep canvas dimensions. References2–5 lanternshapeonly. Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

- `design/assets/visuels/accueil/ACC-05.png`
- `design/assets/marque/livre-lanterne/logo-illustre.png`
- `site/src/assets/marque/logo-symbole.webp`
- `/tmp/visuels-lanterne-ACC-14.png`
- `/tmp/visuels-lanterne-GLO-03.png`

Source native de cet essai : `exec-a672dc0e-5c39-40bb-901d-e9a08ca2db32.png`.

</details>

<details>
<summary>Prompt d’édition de nuit et références</summary>

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge with opaque solid black night.

Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.

EDIT FIRST IMAGE, the finished day master. Preserve exact 1448×1086 pixel canvas, all object positions, poses, camera, crop and lantern/flame location. Only change light and ink coverage. At least85% solidblack #000000 across entire canvas. White backdrop and broad surfaces become pureblack. Outside smalllitpool only rare thin white contours, omit most fine detail. Redonly flame and red hatches ON smallpool and main subject; no atmospheric rays or halo. No broadwhite areas. References2–5 are only lanternstyle references. Never add or move objects.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

- `design/assets/visuels/accueil/ACC-05.png`
- `design/assets/marque/livre-lanterne/logo-illustre.png`
- `site/src/assets/marque/logo-symbole.webp`
- `/tmp/visuels-lanterne-ACC-14.png`
- `/tmp/visuels-lanterne-GLO-03.png`

Le premier fichier joint correspond au jour natif sélectionné, avant le recalage déterministe appliqué aux deux variantes.

</details>

#### ACC-07

- Date : **13 octobre 2026**.
- Jour : [ACC-07.png](ACC-07.png), génération puis éditions par l’outil OpenAI `image_gen` ; original sélectionné `exec-3d2551f6-89c4-4e4d-bfb5-d59c188bd0e5.png`.
- Nuit : [ACC-07.nuit.png](ACC-07.nuit.png), édition du jour sélectionné ; original `exec-594cdd5c-39ff-4d97-8abf-45ead2a25988.png`.

<details>
<summary>Prompt de jour et références</summary>

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

Subject: A plateau followed by a breakthrough.
Composition: A back-facing faceless player seated at a table. In front a column of identical plain card backs stops under a simple solid black horizontal ceiling bar above the table. One face-up card showing only a simple geometric shape breaks above the bar. One lantern on the table to the right lights that breakthrough card with red hatching. No rays or luminous bar: the threshold bar is black to obey the lantern-only illumination. Whole figure including head is inside the frame.

Series: three-quarterviewslightlyabove,horizontwothirds; mainlines3pxat1800px,hatch1px. Exact16:9. Cards, breakthrough card and lantern readable when centrallycropped4:5. Canvas exactly 1536×864, aspect ratio 1.7777777777777777. HARD lantern registration: the CENTRE of the RED FLAME at x=70% of width and y=60% of height, measured from top left, within 3 percentage points. This means pixel (1075,518). Position the whole lantern around this flame point. Do not interpret coordinates as the lantern bottom or top. Main subject at least60% of frame. Everything fully inside image, no cropped heads, hands or objects. Large untouched white areas, solid black masses, only sparse shadow hatching. No fine surface texture, patterns or decorative marks. Paper faces remain blank. Red only the flame and red hatching on illuminated surfaces, no glow/rays.

FIRST IMAGE IS A LAYOUT GUIDE ONLY: replace its blue wireframe lantern with the final black-white-red lantern at EXACTLY that position and size, centre of red flame at blue cross. Generate the described scene around it. Remove all blue. Preserve guide canvas. Extremely economical cut wood, leave 65% untouched white paper; only a few clean carved outline strokes and large untextured black shapes. Omit wood-grain pattern entirely. No dense texture. Images2–5: references for the hand-cut line and same square four-post lantern with top ring and drop-shaped flame. Do not copy their books, lettering, warm colours, rays, glow or ornament. Interpret only black/white/red flat ink. Illustration-story, timeless wood engraving.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

- `/tmp/ACC-07-fantome.png`
- `design/assets/marque/livre-lanterne/logo-illustre.png`
- `site/src/assets/marque/logo-symbole.webp`
- `/tmp/visuels-lanterne-ACC-14.png`
- `/tmp/visuels-lanterne-GLO-03.png`

</details>

<details>
<summary>Essai de correction 1</summary>

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

Edit first image. Move the entire lantern UP60pixels and RIGHT32pixels. Required flamecentre(1170,565) on1672×941. Preserve all other positions. Remove red hatch strokes floating around the flying card: red illumination only on the card itself and on the tabletop near lantern. Keep canvas dimensions. References2–5 lanternshapeonly. Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

- `design/assets/visuels/accueil/ACC-07.png`
- `design/assets/marque/livre-lanterne/logo-illustre.png`
- `site/src/assets/marque/logo-symbole.webp`
- `/tmp/visuels-lanterne-ACC-14.png`
- `/tmp/visuels-lanterne-GLO-03.png`

Source native de cet essai : `exec-ac0e065b-2d15-4baa-859a-f02fc2d6ae28.png`.

</details>

<details>
<summary>Prompt d’édition de nuit et références</summary>

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge with opaque solid black night.

Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.

EDIT FIRST IMAGE, the finished day master. Preserve exact 1672×941 pixel canvas, all object positions, poses, camera, crop and lantern/flame location. Only change light and ink coverage. At least85% solidblack #000000 across entire canvas. White backdrop and broad surfaces become pureblack. Outside smalllitpool only rare thin white contours, omit most fine detail. Redonly flame and red hatches ON smallpool and main subject; no atmospheric rays or halo. No broadwhite areas. References2–5 are only lanternstyle references. Never add or move objects.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

- `design/assets/visuels/accueil/ACC-07.png`
- `design/assets/marque/livre-lanterne/logo-illustre.png`
- `site/src/assets/marque/logo-symbole.webp`
- `/tmp/visuels-lanterne-ACC-14.png`
- `/tmp/visuels-lanterne-GLO-03.png`

Le premier fichier joint correspond au jour natif sélectionné, avant le recalage déterministe appliqué aux deux variantes.

</details>

#### ACC-16

- Date : **13 octobre 2026**.
- Jour : [ACC-16.png](ACC-16.png), génération puis éditions par l’outil OpenAI `image_gen` ; original sélectionné `exec-c725dbc5-ee91-43f6-8d20-7c9172e8cb8a.png`.
- Nuit : [ACC-16.nuit.png](ACC-16.nuit.png), édition du jour sélectionné ; original `exec-6d06e815-9402-4805-a176-88471d5fddc8.png`.

<details>
<summary>Prompt de jour et références</summary>

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

Subject: A lantern resting on an open book, a lit path ahead.
Composition: An open book lies flat on a table in the left half of the frame. A single lantern on its right page casts a narrow path of sparse red hatching on the table toward the right. The right half stays calm and mostly plain, no details or objects there. No people, all pages blank, no script or fake writing. No literal rays or beam: illumination only red hatch marks on the flat surface.

Series: three-quarterviewslightlyabove,horizon2/3;mainlines3pxat1800px,hatch1px. Exact16:9. Right halfopen forHTMLbutton. Canvas exactly 1536×864, aspect ratio 1.7777777777777777. HARD lantern registration: the CENTRE of the RED FLAME at x=34% of width and y=46% of height, measured from top left, within 3 percentage points. This means pixel (522,397). Position the whole lantern around this flame point. Do not interpret coordinates as the lantern bottom or top. Main subject at least60% of frame. Everything fully inside image, no cropped heads, hands or objects. Large untouched white areas, solid black masses, only sparse shadow hatching. No fine surface texture, patterns or decorative marks. Paper faces remain blank. Red only the flame and red hatching on illuminated surfaces, no glow/rays.

FIRST IMAGE IS A LAYOUT GUIDE ONLY: replace its blue wireframe lantern with the final black-white-red lantern at EXACTLY that position and size, centre of red flame at blue cross. Generate the described scene around it. Remove all blue. Preserve guide canvas. Extremely economical cut wood, leave 65% untouched white paper; only a few clean carved outline strokes and large untextured black shapes. Omit wood-grain pattern entirely. No dense texture. Images2–5: references for the hand-cut line and same square four-post lantern with top ring and drop-shaped flame. Do not copy their books, lettering, warm colours, rays, glow or ornament. Interpret only black/white/red flat ink. Illustration-story, timeless wood engraving.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

- `/tmp/ACC-16-fantome.png`
- `design/assets/marque/livre-lanterne/logo-illustre.png`
- `site/src/assets/marque/logo-symbole.webp`
- `/tmp/visuels-lanterne-ACC-14.png`
- `/tmp/visuels-lanterne-GLO-03.png`

</details>

<details>
<summary>Essai de correction 1</summary>

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

Edit first image. Keep the lantern exactly in place. Reduce the open book around it so the ENTIRE book sits inside the image with a clear left white margin; no part of book cropped. Table no longer needs visible legs; show a simple outlined tabletop shape entirely within canvas. Remove 85% black texture from the table leaving plain untouched white paper. Red hatching path only on the tabletop, not floating past its edge. Keep canvas dimensions. References2–5 lanternshapeonly. Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

- `design/assets/visuels/accueil/ACC-16.png`
- `design/assets/marque/livre-lanterne/logo-illustre.png`
- `site/src/assets/marque/logo-symbole.webp`
- `/tmp/visuels-lanterne-ACC-14.png`
- `/tmp/visuels-lanterne-GLO-03.png`

Source native de cet essai : `exec-178556ed-8884-486d-a820-fc1d4cd38363.png`.

</details>

<details>
<summary>Prompt d’édition de nuit et références</summary>

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge with opaque solid black night.

Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.

EDIT FIRST IMAGE, the finished day master. Preserve exact 1672×941 pixel canvas, all object positions, poses, camera, crop and lantern/flame location. Only change light and ink coverage. At least85% solidblack #000000 across entire canvas. White backdrop and broad surfaces become pureblack. Outside smalllitpool only rare thin white contours, omit most fine detail. Redonly flame and red hatches ON smallpool and main subject; no atmospheric rays or halo. No broadwhite areas. References2–5 are only lanternstyle references. Never add or move objects.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

- `design/assets/visuels/accueil/ACC-16.png`
- `design/assets/marque/livre-lanterne/logo-illustre.png`
- `site/src/assets/marque/logo-symbole.webp`
- `/tmp/visuels-lanterne-ACC-14.png`
- `/tmp/visuels-lanterne-GLO-03.png`

Le premier fichier joint correspond au jour natif sélectionné, avant le recalage déterministe appliqué aux deux variantes.

</details>

## Retouches déterministes du 14 octobre 2026

Corrections demandées par l’audit des images et la relecture en situation, faites dans le dépôt avec Pillow (Python), sans génération ni édition générative : les opérations ci-dessous, aux coordonnées en pixels des masters. Les masters retouchés remplacent les précédents ; `npm run visuels:rendre <ID>` a refait leurs rendus.

| Fichier | Opération | Après |
|---|---|---|
| `ACC-09.nuit.png` | Vitres de la lanterne ramenées aux couleurs de clé : dans la zone x 220–450, y 330–565, hors coupelle de la bougie (x 268–404, y ≥ 518), chaque pixel à plus de 70 des trois clés (le remplissage beige rosé, par exemple (190, 139, 108), qui donnait un voile gris aux couleurs du site) devient rouge si sa part de lumière, R − min(V, B), dépasse 110, noir sinon. | Vitres noires à hachures rouges, comme le jour ; flamme inchangée (≈ 23 × 40 %). |
| `ACC-19.nuit.png` | La croix de la feuille 1 et la coche de la feuille 3, dessinées à l’encre le jour, disparaissaient dans le noir. Report en blanc `#FFFFFF` des traits épais du jour, avec leur antialiasing : ouverture morphologique de 9 px (seuls les traits plus épais restent, sans contours ni hachures), dans les boîtes x 40–315, y 700–880 (croix) et x 545–765, y 925–1100 (coche). Les feuilles de jour et de nuit coïncident. | La carte raconte de nouveau l’essai raté et l’essai réussi ; noir à 92 %. Le cercle de la feuille 2 et la bande de hachures sous le socle restent à reprendre. |
