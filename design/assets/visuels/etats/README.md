# Masters des images générées — série « etats »

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
| ERR-01 | 1448 × 1086 | transparent | 62,00 % × 40,00 % | 63,72 % × 39,78 % | 63,94 % × 39,97 % | 75,66 % | 34,99 % |

### ERR-01

- Date : **13 octobre 2026**.
- Format demandé : 4:3, 1600 × 1200 px. Format livré : 1448 × 1086 px pour les deux variantes.
- Jour : [ERR-01.png](ERR-01.png), source native finale avant retouche locale : `exec-9f614ddd-0278-4e36-b7c4-ac9b71dbfaab.png`.
- Nuit : [ERR-01.nuit.png](ERR-01.nuit.png), source native finale avant retouche locale : `exec-f52ac8cd-8ce4-43ca-a233-a6215b876d07.png`.
- SHA-256 livré, jour : `eb3baa8fde28144f49ac3b14fb12bd27dff0e98e705ea422bc14e4b986a0dd25`.
- SHA-256 livré, nuit : `729fcea8d0b74039b2518837418f4299ab1067d65428ab90eccdedfd8f51296a`.

**Retouche locale autorisée.** Les paramètres ci-dessous partent de la source native indiquée, avant harmonisation des bords. Les tables de coordonnées donnent les points de correspondance `source → destination` ; interpolation linéaire entre points pour le déplacement, échantillonnage au voisin le plus proche pour conserver les couleurs. Le déplacement varie donc par bande pour conserver le pied de la lanterne à sa place. Cette réduction locale est non uniforme, et non une mise à l’échelle de l’image entière.

- Jour : échelle 1, translation [-90, 0] px, masque polygonal [[882,0],[1148,0],[1148,332],[1129,341],[1129,511],[1144,516],[1144,559],[1080,621],[884,577],[884,545],[905,527],[905,327],[882,327]]. Ancien emplacement rétabli en papier/transparent puis raccordé par édition locale décrite ci-dessous.
- Nuit : échelle 1, translation [-90, 0] px, masque polygonal [[882,0],[1148,0],[1148,332],[1129,341],[1129,511],[1144,516],[1144,559],[1080,621],[884,577],[884,545],[905,527],[905,327],[882,327]]. Ancien emplacement rétabli en papier/transparent puis raccordé par édition locale décrite ci-dessous.

**Prompt initial de jour, texte exact :**

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

Transparent background: nothing is drawn outside the subject.

Subject: A missing page: an open manual with one torn-out page.
Composition: A bound manual lying open flat, viewed slightly from above. In the middle, the stub of a torn-out page, a clear torn edge with just a few paper fibres. The recurring lantern sits on the right page, its flame centred at 62% width and 40% height, illuminating precisely the empty place left by the missing page, while the rest of the book lies in shadow. No writing or page numbers.

Framing: EXACT 4:3 aspect ratio, requested canvas 1600 × 1200. The book occupies 75% of image width, with the lower-right corner quiet. Regular strokes about 6 px at 480 px width. No horizon. Red light is represented only by hatch marks on the paper, never rays or a halo. Complete uncut subject, at least 4% clear margin. HARD registration constraint: the CENTRE of the red flame is at 62% width, 40% height, measured from the upper-left corner; tolerance at most ±3 percentage points per axis. Position the whole small lantern around that point.

The four attached images are STYLE REFERENCES only, not scene alternatives: images 1 and 2 for the recurring lantern and hand-cut line; images 3 and 4 for its plain four-post cage, ring and drop-shaped flame. Never copy their lettering, colours, rays, halo or glow. Pure black, white and red only. Red marks belong on the illuminated object surfaces and flame, never in empty space.

Economical drawing: at most3–5 broad hatches per shadow corner; large plain white planes, solid black shadow masses, no grain or tiny texture. One simple solid red drop flame with no additional tongues. Very simple geometry and generous uncut margins. Red only a SMALL patch of hatching on the lit surface, never rays or marks in empty space.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

**Prompt de nuit livré, texte exact :**

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

Transparent background: nothing is drawn outside the subject. Preserve all outside alpha transparency.

Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.

EDIT image 1, the final DAY master. Images 2–5 are the four common style references. Preserve the EXACT 1448 × 1086 canvas, exact framing and object silhouettes, and exact lantern/flame position. Do not move, resize, add or remove any object. Transform lighting only. Target 90% pure #000000 among OPAQUE pixels, minimum 70%. Every formerly white object surface becomes solid black, suggested by a few thin sparse white contours. Keep only the red flame and a SMALL patch of red hatching on the main subject nearest the lantern. No white paper field, broad white plane or white cage panel. All black must be flat #000000 without gray texture. Keep transparent pixels outside the objects; do not use transparency instead of black inside objects.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

**Raccord local de l’ancien emplacement :**

Les sorties de réparation n’ont pas remplacé l’image entière. Seuls les pixels de l’ancien masque et du petit raccord de page à droite ont été reportés, en protégeant le nouveau masque de la lanterne. Zone de travail x1030–1209, y325–664 ; extension des hachures à droite x1040–1194, y491–644. Le livre hors de cette zone conserve ses pixels.

Jour : source `exec-32030e09-fa59-43ba-8c70-e0a095d356c5.png`, lecture de la zone source à y + 9 px pour raccorder le bord existant. Prompt exact :

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The subject alone, on a fully transparent background; no floor, no ground shadow, no surrounding scene.

EDIT image 1. Restore the small damaged paper patch immediately to the RIGHT of the lantern, between x=1035 and x=1150, y=340 and y=630, on the existing 1448×1086 canvas. This patch is the erased old footprint of the lamp: restore a continuous thin page top edge and natural white paper surface with red diagonal hatching matching the neighbouring hatches. No sharp polygon-shaped gap in the red hatching and no thick straight bar at the top edge. Keep the book, torn page, lantern, flame, framing, dimensions, alpha and ALL other pixels exactly unchanged. The flame stays at 63.8% width and 40% height. Do not move any object. Only restore the missing paper background and matching sparse hatching in that small patch. Images 2–5 are style references only.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

Nuit : source `exec-fb425868-20a8-4075-bb7c-55527ab7362b.png`, lecture de la zone source à y + 14 px pour raccorder le bord existant. Prompt exact :

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The subject alone, on a fully transparent background; no floor, no ground shadow, no surrounding scene.

Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.

EDIT image 1. Restore the small damaged paper patch immediately to the RIGHT of the lantern, between x=1035 and x=1150, y=340 and y=630, on the existing 1448×1086 canvas. This patch is the erased old footprint of the lamp: restore a continuous thin page top edge and natural black paper surface with red diagonal hatching matching the neighbouring hatches. No sharp polygon-shaped gap in the red hatching and no thick straight bar at the top edge. Keep the book, torn page, lantern, flame, framing, dimensions, alpha and ALL other pixels exactly unchanged. The flame stays at 63.8% width and 40% height. Do not move any object. Only restore the missing paper background and matching sparse hatching in that small patch. Images 2–5 are style references only.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

## Retouches déterministes du 14 octobre 2026

Corrections demandées par l’audit des images et la relecture en situation, faites dans le dépôt avec Pillow (Python), sans génération ni édition générative : les opérations ci-dessous, aux coordonnées en pixels des masters. Les masters retouchés remplacent les précédents ; `npm run visuels:rendre <ID>` a refait leurs rendus.

| Fichier | Opération | Après |
|---|---|---|
| `ERR-01.png`, `ERR-01.nuit.png` | Raccords du déplacement de la lanterne. Encoche du coin bas droit du socle (polygone (1032, 581), (1007, 605), (1033, 612)) comblée par les hachures voisines prises à (+28, −7) px, le long des hachures. Marche du bord haut de la page, à droite de la cage : le jour, colonnes x 1030–1040 recopiées depuis 12 px à droite, y 336–366 telles quelles et y 366–384 à 3 px plus haut ; la nuit, x 1035–1040, y 336–372, depuis 10 px à droite. | Bord de page continu jusqu’à la cage, socle refermé. La coupure verticale des hachures à gauche du socle (x 792–800) reste, peu visible : à reprendre avec la consigne de l’audit si besoin. |
