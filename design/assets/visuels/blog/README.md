# Masters des images générées — série « blog »

<!-- production-complete-2026-10-13 -->

## Production de la série — 13 octobre 2026

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
| BLG-01 | 1447 × 1087 | transparent | 74,00 % × 26,00 % | 72,97 % × 27,21 % | 72,47 % × 27,65 % | 70,84 % | 34,92 % |
| BLG-02 | 1672 × 941 | opaque | 62,00 % × 50,00 % | 64,66 % × 51,76 % | 64,62 % × 51,80 % | 90,67 % | 54,09 % |

### BLG-01

- Date : **13 octobre 2026**.
- Format demandé : 4:3, 1600 × 1200 px. Format livré : 1447 × 1087 px pour les deux variantes.
- Jour : [BLG-01.png](BLG-01.png), source native finale avant retouche locale : `exec-cb16df42-0020-44fc-9a64-be73ec12fd7e.png`.
- Nuit : [BLG-01.nuit.png](BLG-01.nuit.png), source native finale avant retouche locale : `exec-5b11bf20-4614-464e-9c26-5cba89bc4df9.png`.
- Première composition remplacée : jour `exec-716acc21-dc76-4185-9962-218e15b8ba46.png`, nuit `exec-5c6db043-b82a-4387-a150-38c7e28dc766.png`. La cage a été allongée par édition pour rapprocher la flamme de la cible tout en gardant la lanterne posée sur le livre.
- Éditions de composition successives : `exec-1feece7c-fda9-41f9-b00f-fbdf5e046fa8.png`, `exec-cb16df42-0020-44fc-9a64-be73ec12fd7e.png`.
- SHA-256 livré, jour : `d706da66dbabe9a213c2c3257aa9bb03662ad7ea8aa0f878f930b3dd889a3a16`.
- SHA-256 livré, nuit : `352876092d63e09033e384e0312d34ec185b381fe56bde7e67d3ee38a4ab95d1`.

**Retouche locale autorisée.** Les paramètres ci-dessous partent de la source native indiquée, avant harmonisation des bords. Les tables de coordonnées donnent les points de correspondance `source → destination` ; interpolation linéaire entre points pour le déplacement, échantillonnage au voisin le plus proche pour conserver les couleurs. Le déplacement varie donc par bande pour conserver le pied de la lanterne à sa place. Cette réduction locale est non uniforme, et non une mise à l’échelle de l’image entière.

- Jour : compression verticale locale par bandes, pied fixe. Zone x = 943 à 1180 px. Y : 0 → 0 ; 420 → 390 ; 520 → 520.

**Harmonisation de la nuit.** Natif 1446 × 1087 px → 1447 × 1087 px. Retrait : droite 0 px, bas 0 px ; ajout : droite 1 px, bas 0 px, fond transparent. Aucune mise à l’échelle ni translation de la scène.

La dernière nuit est une édition du jour déjà recalé ; le recalage du jour n’a pas été appliqué une seconde fois à la nuit.

**Prompt initial de jour, texte exact :**

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

Transparent background: nothing is drawn outside the subject.

Subject: Pages waiting to be written: an open book lit by a lantern.
Composition: An open book lying flat, seen slightly from above, its pages blank and only the first page illuminated. The recurring lantern sits at the upper right of the book, its flame centred at 74% width and 26% height, as the only light source, its illumination stopping at the page edge. A pencil lies across the left page, its tip pointing towards the light. The rest of the subject is in shadow. No writing on the pages.

Framing: EXACT 4:3 aspect ratio, requested canvas 1600 × 1200. Book occupies 70% of canvas width, complete and uncut. Regular strokes about 6 px at 480 px width. No horizon. Red illumination is engraved hatch marks on the page only, never a halo or rays. Large quiet blank areas on day pages, sparse hatch corners. HARD registration constraint: the CENTRE of the red flame is at 74% width, 26% height, measured from the upper-left corner; tolerance at most ±3 percentage points per axis. Position the whole small lantern around that point.

The four attached images are STYLE REFERENCES only, not scene alternatives: images 1 and 2 for the recurring lantern and hand-cut line; images 3 and 4 for its plain four-post cage, ring and drop-shaped flame. Never copy their lettering, colours, rays, halo or glow. Pure black, white and red only. Red marks belong on the illuminated object surfaces and flame, never in empty space.

Economical drawing: at most3–5 broad hatches per shadow corner; large plain white planes, solid black shadow masses, no grain or tiny texture. One simple solid red drop flame with no additional tongues. Very simple geometry and generous uncut margins. Red only a SMALL patch of hatching on the lit surface, never rays or marks in empty space.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

**Journal des prompts de correction, textes exacts :** certaines sorties intermédiaires ont été écartées ; seule la source finale indiquée plus haut est livrée.

Correction 1 :

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The subject alone, on a fully transparent background; no floor, no ground shadow, no surrounding scene.

EDIT image 1, the day master, with images 2–5 as style references only. Keep EXACT 1448 × 1086 canvas, transparency, framing, entire open book, pencil and every detail of the book unchanged. Keep the FOOT of the lantern firmly on the same right-hand page at its present position. Locally redesign ONLY the lantern: use a taller cage with a compact roof and ring near the top of the canvas, entirely inside the canvas. Raise the burner within the cage on a simple slender pedestal so that the CENTRE of its one red drop flame is exactly at 74% canvas width and 26% canvas height (1072,282 pixels). The cage is taller, with its light chamber in the upper half, and its foot still touching the book. Preserve the four posts, ring and square silhouette. Preserve pure black outlines, white surfaces, red hatches on the book, no colour other than black white red. Do not move the book, do not lift the lantern away from it, do not crop the ring. Red flame centre must lie between y250 and y310 pixels. No blue calibration marks.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

Correction 2 :

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The subject alone, on a fully transparent background; no floor, no ground shadow, no surrounding scene.

EDIT image 1. Preserve EXACT 1448 × 1086 dimensions, full open book, pencil, every page edge, lantern foot and the bottom half of the lantern at the same positions. Images 2–5 are style references only. Make only this precise lantern correction: shrink its roof and ring until the entire roof ends at y=175 pixels. The ring is small, between y=10 and y=80. The lantern cage extends from y=180 to y=550, with its unchanged base on the book. The red flame is centred exactly at pixel x=1072, y=282 (74% width, 26% height), NOT y=380. Its tip is at y=225 and bottom at y=330. The burner directly below it sits on a long black thin pedestal that reaches down to the existing cage bottom. A tall cage, tiny roof, tiny ring, and elevated flame on a pedestal. White paper surfaces, sparse pure red hatching on right page, four black posts. Keep all book and pencil details unchanged. No other object. Do not crop the ring or lift the foot off the book.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

**Premier prompt de nuit, composition remplacée :**

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

Transparent background: nothing is drawn outside the subject. Preserve all outside alpha transparency.

Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.

EDIT image 1, the final DAY master. Images 2–5 are the four common style references. Preserve the EXACT 1448 × 1086 canvas, exact framing and object silhouettes, and exact lantern/flame position. Do not move, resize, add or remove any object. Transform lighting only. Target 90% pure #000000 among OPAQUE pixels, minimum 70%. Every formerly white object surface becomes solid black, suggested by a few thin sparse white contours. Keep only the red flame and a SMALL patch of red hatching on the main subject nearest the lantern. No white paper field, broad white plane or white cage panel. All black must be flat #000000 without gray texture. Keep transparent pixels outside the objects; do not use transparency instead of black inside objects.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

**Prompt de nuit livré, texte exact :**

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The subject alone, on a fully transparent background; no floor, no ground shadow, no surrounding scene.

Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.

EDIT image 1, the final day master. Images 2–5 are only the four common style references. Keep EXACT 1447 × 1087 pixel canvas, transparency, aspect ratio, framing, book, pencil, tall lantern cage, elevated burner pedestal and every outline and position. Keep the flame centre at 73% width, 27.2% height. Only replace broad white surfaces with solid pure black, use very sparse thin white edge outlines, and sparse red hatching on the page around the foot. Target 90% black among opaque pixels, minimum 70%. Do not add grain, grey, new objects, a background, floor, shadow, border, rays or glow. Preserve the tall lantern and small roof exactly. Do not return the short lantern from the style references.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

### BLG-02

- Date : **13 octobre 2026**.
- Format demandé : 16:9, 1600 × 900 px. Format livré : 1672 × 941 px pour les deux variantes.
- Jour : [BLG-02.png](BLG-02.png), source native finale avant retouche locale : `exec-5c63a4cc-794f-4b97-9768-66ce486a6f5e.png`.
- Nuit : [BLG-02.nuit.png](BLG-02.nuit.png), source native finale avant retouche locale : `exec-0922ff67-49fb-4399-8bfc-779828630a78.png`.
- SHA-256 livré, jour : `fae7c5035795deccb06b88543868698211f306e2efa36198c5ddd97c5f60394c`.
- SHA-256 livré, nuit : `daf32aea592ab245d63185162dbcb11a5fc6d71e91df10d0fc7bb34c19b5baeb`.

**Retouche locale autorisée.** Les paramètres ci-dessous partent de la source native indiquée, avant harmonisation des bords. Les tables de coordonnées donnent les points de correspondance `source → destination` ; interpolation linéaire entre points pour le déplacement, échantillonnage au voisin le plus proche pour conserver les couleurs. Le déplacement varie donc par bande pour conserver le pied de la lanterne à sa place. Cette réduction locale est non uniforme, et non une mise à l’échelle de l’image entière.

- Jour : recalage local par bandes, contour de la scène et pied fixes. Boîte [gauche, haut, droite, bas] = [900, 0, 1290, 702] px. X : 900 → 900 ; 1096 → 1079 ; 1290 → 1290. Y : 0 → 0 ; 702 → 702. Le déplacement horizontal revient progressivement à zéro entre y600 et y702.
- Nuit : recalage local par bandes, contour de la scène et pied fixes. Boîte [gauche, haut, droite, bas] = [900, 0, 1290, 702] px. X : 900 → 900 ; 1096 → 1079 ; 1290 → 1290. Y : 0 → 0 ; 702 → 702. Le déplacement horizontal revient progressivement à zéro entre y600 et y702.

**Prompt initial de jour, texte exact :**

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

Subject: A lantern on an open book page.
Composition: Wide framing: the corner of an open book page on the left; the recurring lantern sits just right of centre, its flame centred at 62% width and 50% height, illuminating the page. A large quiet space on the left. No text.

Framing: EXACT 16:9 aspect ratio, requested canvas 1600 × 900. Front view slightly from above. The left half remains very quiet with no writing or marks beyond the plain page edge. Regular hand-cut strokes, no horizon. Red light is represented by a few hatches on the page immediately around the lantern, no halo or rays. HARD registration constraint: the CENTRE of the red flame is at 62% width, 50% height, measured from the upper-left corner; tolerance at most ±3 percentage points per axis. Position the whole small lantern around that point.

The four attached images are STYLE REFERENCES only, not scene alternatives: images 1 and 2 for the recurring lantern and hand-cut line; images 3 and 4 for its plain four-post cage, ring and drop-shaped flame. Never copy their lettering, colours, rays, halo or glow. Pure black, white and red only. Red marks belong on the illuminated object surfaces and flame, never in empty space.

Economical drawing: at most3–5 broad hatches per shadow corner; large plain white planes, solid black shadow masses, no grain or tiny texture. One simple solid red drop flame with no additional tongues. Very simple geometry and generous uncut margins. Red only a SMALL patch of hatching on the lit surface, never rays or marks in empty space.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

**Prompt de nuit livré, texte exact :**

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; the background is now solid black.

Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.

EDIT image 1, the final DAY master. Images 2–5 are the four common style references. Preserve the EXACT 1672 × 941 canvas, exact framing and object silhouettes, and exact lantern/flame position. Do not move, resize, add or remove any object. Transform lighting only. Target 90% pure #000000 among OPAQUE pixels, minimum 70%. Every formerly white object surface becomes solid black, suggested by a few thin sparse white contours. Keep only the red flame and a SMALL patch of red hatching on the main subject nearest the lantern. No white paper field, broad white plane or white cage panel. All black must be flat #000000 without gray texture. Keep transparent pixels outside the objects; do not use transparency instead of black inside objects.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

## Retouches déterministes du 14 octobre 2026

Corrections demandées par l’audit des images et la relecture en situation, faites dans le dépôt avec Pillow (Python), sans génération ni édition générative : les opérations ci-dessous, aux coordonnées en pixels des masters. Les masters retouchés remplacent les précédents ; `npm run visuels:rendre <ID>` a refait leurs rendus.

| Fichier | Opération | Après |
|---|---|---|
| `BLG-02.png`, `BLG-02.nuit.png` | Recadrage commun en 16:9 depuis le coin haut gauche, (0, 0, 1568, 882) px : il retire l’objet noir coupé du coin bas droit, dont les découpes blanches imitaient des lettres. | Masters de 1568 × 882 ; anneau et pied de la lanterne gardés, flamme vers 69 × 55 % (composition du registre mise à jour). Le rendu reste en 1600 × 900. |
