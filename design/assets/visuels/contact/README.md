# Masters des images générées — série « contact »

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
| CON-01 | 1254 × 1254 | transparent | 56,00 % × 36,00 % | 58,86 % × 38,09 % | 58,23 % × 38,79 % | 80,29 % | 33,98 % |
| CON-02 | 1254 × 1254 | transparent | sans cible visible | 50,08 % × 50,20 % | 50,04 % × 50,16 % | 76,02 % | 32,04 % |
| CON-03 | 1254 × 1254 | transparent | sans cible visible | 41,71 % × 67,07 % | 41,73 % × 66,73 % | 75,93 % | 32,08 % |

### CON-01

- Date : **13 octobre 2026**.
- Format demandé : 1:1, 1280 × 1280 px. Format livré : 1254 × 1254 px pour les deux variantes.
- Jour : [CON-01.png](CON-01.png), source native finale avant retouche locale : `exec-fea9fd08-4b3a-441d-a66d-c608b350bdb8.png`.
- Nuit : [CON-01.nuit.png](CON-01.nuit.png), source native finale avant retouche locale : `exec-32634807-d604-4710-827f-c978259b057b.png`.
- Sortie écartée après correction : `exec-e3233fc0-340e-4c55-a95a-9927c35d7b21.png` ; la source retenue est celle indiquée ci-dessus.
- SHA-256 livré, jour : `1ead3d5ed43d98929efdd15567669d342e6bb803f115f83c713636f51eee0d76`.
- SHA-256 livré, nuit : `4ef59da673b435db76e5ba266257c8d57756f0f572e882789af600dfa822c79b`.

**Retouche locale autorisée.** Les paramètres ci-dessous partent de la source native indiquée, avant harmonisation des bords. Les tables de coordonnées donnent les points de correspondance `source → destination` ; interpolation linéaire entre points pour le déplacement, échantillonnage au voisin le plus proche pour conserver les couleurs. Le déplacement varie donc par bande pour conserver le pied de la lanterne à sa place. Cette réduction locale est non uniforme, et non une mise à l’échelle de l’image entière.

- Jour : recalage local par bandes, contour de la scène et pied fixes. Boîte [gauche, haut, droite, bas] = [570, 0, 975, 642] px. X : 570 → 570 ; 760 → 733 ; 975 → 975. Y : 0 → 0 ; 595 → 548 ; 642 → 642. Le déplacement horizontal revient progressivement à zéro entre y595 et y642 ; le rabat à gauche est protégé. suppression du petit fragment de rabat transplanté dans le fond transparent : x570–587, y400–487.
- Nuit : recalage local par bandes, contour de la scène et pied fixes. Boîte [gauche, haut, droite, bas] = [570, 0, 975, 642] px. X : 570 → 570 ; 760 → 733 ; 975 → 975. Y : 0 → 0 ; 595 → 548 ; 642 → 642. Le déplacement horizontal revient progressivement à zéro entre y595 et y642 ; le rabat à gauche est protégé. suppression du petit fragment de rabat transplanté dans le fond transparent : x570–587, y400–487.

**Prompt initial de jour, texte exact :**

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

Transparent background: nothing is drawn outside the subject.

Subject: An invitation: an open envelope lit by a lantern.
Composition: One thick-paper envelope set at a three-quarter angle, flap open upwards. The recurring lantern with four posts, a ring and a drop-shaped flame sits just behind it, flame centred at 56% width and 36% height. Its light emerges from the envelope as though the letter carries it. Regular wood-engraved lines, no person. No text, stamp or address.

Framing: EXACT 1:1 aspect ratio, requested canvas 1280 × 1280. Front view slightly from above. Subject occupies 70% of the canvas, reads at 88 px. Main strokes about 6 px at 480 px width. Red light is only a few hard-edged engraved hatch marks on the envelope, never rays or halo. At least 4% uncut margin. HARD registration constraint: the CENTRE of the red flame is at 56% width, 36% height, measured from the upper-left corner; tolerance at most ±3 percentage points per axis. Position the whole small lantern around that point.

The four attached images are STYLE REFERENCES only, not scene alternatives: images 1 and 2 for the recurring lantern and hand-cut line; images 3 and 4 for its plain four-post cage, ring and drop-shaped flame. Never copy their lettering, colours, rays, halo or glow. Pure black, white and red only. Red marks belong on the illuminated object surfaces and flame, never in empty space.

Economical drawing: at most3–5 broad hatches per shadow corner; large plain white planes, solid black shadow masses, no grain or tiny texture. One simple solid red drop flame with no additional tongues. Very simple geometry and generous uncut margins. Red only a SMALL patch of hatching on the lit surface, never rays or marks in empty space.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

**Journal des prompts de correction, textes exacts :** certaines sorties intermédiaires ont été écartées ; seule la source finale indiquée plus haut est livrée.

Correction 1 :

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

Transparent background: nothing is drawn outside the subject.

EDIT image1, refs2–5 style only. Keep exact1254×1254canvas and envelope/card geometry. Move the whole lantern LEFT60pixels and UP65pixels, restoring the previous background. Desired flame centre is702,451 (56%,36%), current761,519. Preserve envelope completely. Reduce75% of repeated fine hatches: a few bold hatches at corners, broad plainwhite card and envelope. One simple drop-shaped flame. No halo, no new objects.

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

### CON-02

- Date : **13 octobre 2026**.
- Format demandé : 1:1, 1280 × 1280 px. Format livré : 1254 × 1254 px pour les deux variantes.
- Jour : [CON-02.png](CON-02.png), source native finale avant retouche locale : `exec-dcade7ba-19f9-4bc9-bf25-cfa3d1d1ff60.png`.
- Nuit : [CON-02.nuit.png](CON-02.nuit.png), source native finale avant retouche locale : `exec-bd92cca9-d8bd-4a4c-9e26-20f16fb289e9.png`.
- SHA-256 livré, jour : `db970195a04263362ffde872160c7f620f8016c78cbec6801904a57b563b593d`.
- SHA-256 livré, nuit : `3437ab431751baadd60a05d399a4febcc78b4e63fc0c28f214f0dd66164154a5`.

**Prompt initial de jour, texte exact :**

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

Transparent background: nothing is drawn outside the subject.

Subject: Message received: a lit lantern on a sealed letter.
Composition: The recurring four-post lantern, with a tall drop-shaped flame, sits on a folded letter closed by a smooth round wax seal with no design or initials, seen from the front and slightly above. Reserve wood engraving. No text.

Framing: EXACT 1:1 aspect ratio, requested canvas 1280 × 1280. Centred subject occupying 75% of the frame, legible at 96 px. Main strokes about 6 px at 480 px width. Only lantern and sealed letter. The light is indicated only by small red hatch marks on the seal and paper, no halo or rays. Clear uncut margin.

The four attached images are STYLE REFERENCES only, not scene alternatives: images 1 and 2 for the recurring lantern and hand-cut line; images 3 and 4 for its plain four-post cage, ring and drop-shaped flame. Never copy their lettering, colours, rays, halo or glow. Pure black, white and red only. Red marks belong on the illuminated object surfaces and flame, never in empty space.

Economical drawing: at most3–5 broad hatches per shadow corner; large plain white planes, solid black shadow masses, no grain or tiny texture. One simple solid red drop flame with no additional tongues. Very simple geometry and generous uncut margins. Red only a SMALL patch of hatching on the lit surface, never rays or marks in empty space.

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

### CON-03

- Date : **13 octobre 2026**.
- Format demandé : 1:1, 1280 × 1280 px. Format livré : 1254 × 1254 px pour les deux variantes.
- Jour : [CON-03.png](CON-03.png), source native finale avant retouche locale : `exec-4ac406d7-4748-4d32-8dea-9350c98935b4.png`.
- Nuit : [CON-03.nuit.png](CON-03.nuit.png), source native finale avant retouche locale : `exec-4a62da31-eb59-4918-8b0f-fd8244e00873.png`.
- SHA-256 livré, jour : `27451087229e663fba711076fe23a9ef0c97b47bfa83fe8d0dfc85026865f862`.
- SHA-256 livré, nuit : `fc17316727bf2f533d4418aa48b84bfcb172fcc5cd2845bfa0207b89026f599b`.

**Prompt initial de jour, texte exact :**

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

Transparent background: nothing is drawn outside the subject.

Subject: Patience: a low-flame lantern and an hourglass.
Composition: The recurring four-post lantern with its flame reduced to a tiny drop. On its right, a small hourglass with half the sand fallen. The same front view, slightly from above, and the same regular line as the sealed-letter scene, so it reads as the same family. No text.

Framing: EXACT 1:1 aspect ratio, requested canvas 1280 × 1280. Main strokes about 6 px at 480 px width, readable at 96 px. Only the lantern and hourglass, no letter. Broad simple shapes, subject occupies 70% of square. No halo or rays; the tiny red flame is the only red mark. Clear uncut margin.

EDIT image1, the message-received lantern illustration, to create the waiting state. Preserve the same exact lantern camera angle and exact 1254×1254canvas. REMOVE the envelope and waxseal completely. Replace tall flame with a low tiny flame. Add the simple half-full hourglass immediately to its right. Re-centre the two-object motif, fill75% ofcanvas. Images2–5 are common style references. Never copy their lettering, colours, rays, halo or glow. Pure black, white and red only. Red marks belong on the illuminated object surfaces and flame, never in empty space.

Economical drawing: at most3–5 broad hatches per shadow corner; large plain white planes, solid black shadow masses, no grain or tiny texture. One simple solid red drop flame with no additional tongues. Very simple geometry and generous uncut margins. Red only a SMALL patch of hatching on the lit surface, never rays or marks in empty space.

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
