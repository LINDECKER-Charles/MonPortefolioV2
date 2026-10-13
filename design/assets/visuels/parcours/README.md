# Masters des images générées — série « parcours »

## Planche d’essai, étape 0

Deux masters pour `CMP-02`, jour et nuit, selon la demande du 13 octobre 2026.
Le bloc de style inclut « Economical line work… » et le prompt négatif les exclusions
supplémentaires demandées. La version de nuit est une édition du jour, jamais une nouvelle
composition. La production complète a ensuite été autorisée.

Pour cette seule planche d’essai CMP-02, aucun traitement des pixels après génération :
les PNG natifs sont copiés tels quels.
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

## Production complète — 13 octobre 2026

La production autorisée ajoute **23 paires, soit 46 masters PNG** : PAR-01 à PAR-03,
PRO-01 à PRO-06, CMP-01 et CMP-03 à CMP-08, FOR-01 à FOR-07.
La paire CMP-02 de la planche d’essai est conservée. Toutes les générations et éditions
ci-dessous datent du **13 octobre 2026** et proviennent de l’outil intégré OpenAI `image_gen`.
Les nuits sont des éditions de leurs jours ; des corrections de nuit poursuivent cette même
chaîne. Les coordonnées des lanternes ont ensuite été contrôlées en superposition.

Charles a autorisé le recalage local des lanternes. Les opérations déterministes retenues
sont consignées sous chaque paire : déplacements et redimensionnements locaux avec masques,
raccords au support, restauration du fond et harmonisation de deux canevas par une colonne
noire à droite. CMP-06 nuit a reçu une translation de l’ensemble de 38 px vers le bas pour
rétablir son alignement avec le jour. Aucun traitement global de quantification des couleurs
n’a été appliqué. Les sources natives sont conservées à leurs chemins de provenance.

Aucun WebP ni calque séparé n’est produit dans ce lot. Le site et la commande de génération
ne sont pas modifiés. Les résolutions natives du générateur sont consignées ci-dessous ;
elles peuvent différer des tailles demandées dans les prompts. Les paires ont le même canevas,
sans agrandissement artificiel. Les contours et les hachures peuvent être légèrement redessinés
par les éditions génératives : l’identité géométrique au pixel près n’est pas revendiquée.

### Références et paramètres communs

Les quatre références jointes à chaque génération sont, dans cet ordre :

1. `design/assets/marque/livre-lanterne/logo-illustre.png`
2. `site/src/assets/marque/logo-symbole.webp`
3. `site/src/assets/visuels/accueil/ACC-14.svg`, rendu PNG à 300 dpi sur blanc dans `/tmp/visuels-lanterne-ACC-14.png`
4. `site/src/assets/visuels/global/GLO-03.svg`, rendu PNG à 300 dpi sur blanc dans `/tmp/visuels-lanterne-GLO-03.png`

Pour une édition, la version de travail à éditer précède ces quatre références. Les premières
corrections de position ont employé une copie de contrôle marquée en bleu, retiré dans le résultat.
Ces repères et les calques de contrôle ne sont pas livrés dans les masters. Les éditions de nuit
partent du jour retenu, ou poursuivent l’édition de nuit déjà dérivée de ce jour. Pour CMP-03 et
CMP-07, le même recalage déterministe a été appliqué aux deux variantes après génération.
Les prompts exacts sont reproduits plus bas ; leurs valeurs de taille sont les demandes faites
au générateur, et non une déclaration des dimensions finalement obtenues.

### Contrôles des masters livrés

Le point mesuré est le centroïde de la composante connexe principale de la flamme rouge
(R > 180, V < 70, B < 70, alpha > 200), distinguée visuellement des autres hachures rouges,
en pourcentage du canevas depuis le coin supérieur gauche. Chaque coordonnée
jour et nuit passe la tolérance de ±3 points par rapport à la cible de sa fiche.

Le « noir visuel » signifie RVB ≤ 32 sur les pixels opaques d’alpha ≥ 250 ; toutes les nuits
dépassent 70 % selon ce critère. La colonne de noir strict ne compte que `#000000` : elle
montre que les trois couleurs de clé prescrites ne sont pas obtenues exactement. Le générateur
conserve du grain et de l’anticrénelage. Aucun résultat n’est présenté comme une palette à trois
couleurs exactes. La transparence des illustrations détourées est conservée.

| ID | Canevas jour et nuit | Fond | Cible x / y | Flamme jour x / y | Flamme nuit x / y | Noir visuel nuit | Noir strict nuit |
|---|---|---|---|---|---|---|---|
| PAR-01 | 1774 × 887 | plein | 76,00 % / 30,00 % | 78,23 % / 27,95 % | 78,23 % / 27,86 % | 85,49 % | 29,19 % |
| PAR-02 | 1774 × 887 | plein | 50,00 % / 26,00 % | 52,90 % / 27,99 % | 52,90 % / 27,93 % | 87,66 % | 49,24 % |
| PAR-03 | 1774 × 887 | plein | 74,00 % / 56,00 % | 74,17 % / 57,58 % | 74,19 % / 56,47 % | 86,73 % | 50,35 % |
| PRO-01 | 1536 × 1024 | plein | 50,00 % / 72,00 % | 49,94 % / 71,67 % | 49,91 % / 71,78 % | 87,58 % | 37,71 % |
| PRO-02 | 1536 × 1024 | plein | 24,00 % / 62,00 % | 24,38 % / 64,87 % | 24,32 % / 64,90 % | 88,45 % | 49,19 % |
| PRO-03 | 1536 × 1024 | plein | 52,00 % / 44,00 % | 51,89 % / 43,11 % | 51,90 % / 43,28 % | 87,32 % | 42,57 % |
| PRO-04 | 1536 × 1024 | plein | 50,00 % / 58,00 % | 49,75 % / 58,45 % | 49,71 % / 57,80 % | 89,97 % | 51,68 % |
| PRO-05 | 1536 × 1024 | plein | 66,00 % / 40,00 % | 65,38 % / 41,49 % | 65,32 % / 41,59 % | 88,52 % | 49,92 % |
| PRO-06 | 1536 × 1024 | plein | 50,00 % / 46,00 % | 50,08 % / 45,81 % | 50,08 % / 45,31 % | 92,89 % | 60,28 % |
| CMP-01 | 1916 × 821 | plein | 14,00 % / 22,00 % | 13,02 % / 24,31 % | 12,95 % / 24,35 % | 85,63 % | 39,55 % |
| CMP-03 | 1254 × 1254 | transparent | 82,00 % / 16,00 % | 83,11 % / 17,62 % | 83,15 % / 17,73 % | 76,78 % | 30,65 % |
| CMP-04 | 1254 × 1254 | transparent | 80,00 % / 24,00 % | 79,07 % / 25,04 % | 80,85 % / 26,60 % | 75,53 % | 27,03 % |
| CMP-05 | 1254 × 1254 | transparent | 50,00 % / 70,00 % | 50,02 % / 71,65 % | 50,14 % / 71,82 % | 82,47 % | 48,51 % |
| CMP-06 | 1254 × 1254 | transparent | 50,00 % / 82,00 % | 49,90 % / 84,76 % | 49,97 % / 84,77 % | 72,70 % | 25,16 % |
| CMP-07 | 1254 × 1254 | transparent | 50,00 % / 50,00 % | 49,98 % / 52,23 % | 50,03 % / 52,28 % | 73,00 % | 24,31 % |
| CMP-08 | 1254 × 1254 | transparent | 50,00 % / 78,00 % | 49,12 % / 76,26 % | 49,11 % / 76,34 % | 73,10 % | 33,35 % |
| FOR-01 | 1672 × 941 | plein | 30,00 % / 80,00 % | 30,60 % / 81,19 % | 30,54 % / 81,02 % | 89,38 % | 55,41 % |
| FOR-02 | 1536 × 1024 | plein | 22,00 % / 30,00 % | 20,99 % / 31,90 % | 20,93 % / 31,94 % | 91,59 % | 57,45 % |
| FOR-03 | 1254 × 1254 | transparent | 80,00 % / 22,00 % | 80,02 % / 22,03 % | 80,05 % / 22,07 % | 75,46 % | 33,33 % |
| FOR-04 | 1254 × 1254 | transparent | 78,00 % / 22,00 % | 77,64 % / 24,92 % | 77,72 % / 24,90 % | 76,63 % | 31,84 % |
| FOR-05 | 1254 × 1254 | transparent | 76,00 % / 28,00 % | 75,95 % / 28,16 % | 75,90 % / 28,24 % | 75,54 % | 33,93 % |
| FOR-06 | 1254 × 1254 | transparent | 76,00 % / 26,00 % | 73,12 % / 28,90 % | 73,31 % / 28,86 % | 79,37 % | 32,21 % |
| FOR-07 | 1254 × 1254 | transparent | 78,00 % / 24,00 % | 80,65 % / 26,43 % | 80,65 % / 26,53 % | 83,61 % | 42,64 % |

### Prompts et provenance des 23 paires

Chaque entrée conserve le prompt initial enregistré et la dernière édition générative retenue,
lorsqu’elle diffère. Les essais abandonnés ne sont pas développés ici. Les éventuelles opérations
locales décrivent le passage du PNG natif au master livré. Les empreintes SHA-256 permettent de
distinguer ces deux états. Les chemins des sources sont ceux retournés par le générateur local.


#### PAR-01

Sujet : **Designing**. Date : **13 octobre 2026**. Provenance : `image_gen`.

Fichiers livrés : [`PAR-01.png`](PAR-01.png) et [`PAR-01.nuit.png`](PAR-01.nuit.png).


<details>
<summary>Prompt exact du jour retenu</summary>

Source native : `/Users/charles/.codex/generated_images/01a136b9-d2db-7fb2-a10c-6fc43794bbfd/exec-f40c758a-dc1d-4f37-b160-0de45039f2d0.png`.

SHA-256 natif : `e25f54c8d967a8622f824f8d21d664ff53c10c36f1666e57106704e28518c728`.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

Subject: Designing.
Composition: A drawing table seen in three-quarter view from slightly above: an unfolded software architecture plan, rectangular blocks connected by arrows and three stacked layers, without any letters, held flat by a ruler and a compass. The lantern rests at the upper right corner and lights the plan, leaving its edges in shadow. No person, no screen.

Framing: exact 2:1 canvas, 2048 × 1024. Three-quarter view from slightly above, horizon at two-thirds height, main lines about 3 px at 1800 px. Sparse hatching only in shadow, readable at 320 px. Keep all objects uncut, inside a clear margin. HARD lantern registration: the centre of its RED FLAME must be at x=76% of total width and y=30% of total height from the top-left, within 3 percentage points on each axis. This is the flame centre, not the base or the top ring. Make the lantern small enough for its ring, cage and base to fit around this exact point. The main subject occupies at least 60% of the frame. Pure red is only a few simple hatch strokes on the lit main object and the flame. No light rays, radial marks, halo, glow or microtexture; no wood grain or fake text.

The four attached images are references only: images 1 and 2 define the recurring hand-cut style and lantern motif; images 3 and 4 define the simple square four-post lantern, top ring and drop-shaped flame. Do not copy their book, lettering, colours, rays or glow. No marks outside the subject.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

</details>


<details>
<summary>Prompt exact de la nuit retenue</summary>

Source native : `/Users/charles/.codex/generated_images/01a136b9-d2db-7fb2-a10c-6fc43794bbfd/exec-54ad480a-db28-438f-8512-b2db30fb3893.png`.

SHA-256 natif : `1bb6f81c82083b898dbc251f8e51b8fb8ae1d21f500273afd697bb5c789fe694`.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.

EDIT IMAGE 1, the supplied day master; images 2–5 are the lantern style references. Keep the exact native dimensions, canvas ratio, camera, crop, every object position, shape, size, overlap and pose of image 1. Do not produce a new composition. Only change ink coverage and illumination. Keep the red flame at its existing registered position x=76%, y=30%. Replace broad white areas with SOLID PURE BLACK #000000, at least 80% of the whole image. Use only sparse thin pure white outlines on existing edges outside the small lit pool. A few red hatch strokes light the main subject and a small pool around the lantern, following surfaces, never floating in the air. No large white areas. No diffuse glow, no rays, no halo, no texture or grain. Deep solid black room fills the frame.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

</details>


**Jour — master final** : `PAR-01.png`.

SHA-256 livré : `e25f54c8d967a8622f824f8d21d664ff53c10c36f1666e57106704e28518c728`.

Master copié depuis ce PNG natif, sans retouche raster après cette dernière génération.


**Nuit — master final** : `PAR-01.nuit.png`.

SHA-256 livré : `1bb6f81c82083b898dbc251f8e51b8fb8ae1d21f500273afd697bb5c789fe694`.

Master copié depuis ce PNG natif, sans retouche raster après cette dernière génération.


#### PAR-02

Sujet : **The toolbox**. Date : **13 octobre 2026**. Provenance : `image_gen`.

Fichiers livrés : [`PAR-02.png`](PAR-02.png) et [`PAR-02.nuit.png`](PAR-02.nuit.png).


<details>
<summary>Prompt initial enregistré du jour</summary>

Source native : `/Users/charles/.codex/generated_images/01a136b9-d2db-7fb2-a10c-6fc43794bbfd/exec-b51308bb-e9ca-43b2-abd1-f376a69e19e4.png`.

SHA-256 natif : `16768b8ce763c1823c7dfa7ccc4434894399fffe0a40e0db5bb0c3e94c5a186d`.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

Subject: The toolbox.
Composition: An open wooden toolbox seen in three-quarter view from slightly above, with four compartments recognisable by their shapes rather than words: a set square and templates; meshing gears; drawers of stacked blank cards; and a sealed crate ready to leave. A lantern hangs from the handle and lights the interior. No logo.

Framing: exact 2:1 canvas, 2048 × 1024. Three-quarter view from slightly above, horizon at two-thirds height, main lines about 3 px at 1800 px. Sparse hatching only in shadow, readable at 320 px. Keep all objects uncut, inside a clear margin. HARD lantern registration: the centre of its RED FLAME must be at x=50% of total width and y=26% of total height from the top-left, within 3 percentage points on each axis. This is the flame centre, not the base or the top ring. Make the lantern small enough for its ring, cage and base to fit around this exact point. The main subject occupies at least 60% of the frame. Pure red is only a few simple hatch strokes on the lit main object and the flame. No light rays, radial marks, halo, glow or microtexture; no wood grain or fake text.

The four attached images are references only: images 1 and 2 define the recurring hand-cut style and lantern motif; images 3 and 4 define the simple square four-post lantern, top ring and drop-shaped flame. Do not copy their book, lettering, colours, rays or glow. No marks outside the subject.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

</details>


<details>
<summary>Prompt exact du jour retenu</summary>

Source native : `/Users/charles/.codex/generated_images/01a136b9-d2db-7fb2-a10c-6fc43794bbfd/exec-2c1dcada-d1be-4cf9-b467-8019b2846410.png`.

SHA-256 natif : `902902c47c7dcb002aca312ce372339b3954e8faca37303f27c714486c9a6086`.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

EDIT IMAGE 1. This day illustration includes a BLUE REGISTRATION CROSS at the REQUIRED new flame centre. Move the entire lantern UP by 36 pixels and RIGHT by 12 pixels, so its red flame centre is exactly on the blue cross at 50% width, 26% height. Keep the toolbox composition and native 1774×887 dimensions unchanged. Remove every blue guide mark completely. Simplify the decorative wood-grain hatching into large clean white areas and solid black shadows. Keep four compartments and all tools. Images 2–5 only show the recurring lantern. No additional objects.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

</details>


<details>
<summary>Prompt exact de la nuit retenue</summary>

Source native : `/Users/charles/.codex/generated_images/01a136b9-d2db-7fb2-a10c-6fc43794bbfd/exec-d3d8d7dd-746e-4ff1-b627-c19cc8a1ee8f.png`.

SHA-256 natif : `7c3bafdb1c57b484eb1c0efae7c3e205da82d4036e5f0e164ec2b18e4b42b3ba`.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.

EDIT IMAGE 1, the supplied day master; images 2–5 are the lantern style references. Keep the exact native dimensions, canvas ratio, camera, crop, every object position, shape, size, overlap and pose of image 1. Do not produce a new composition. Only change ink coverage and illumination. Keep the red flame at its existing registered position x=50%, y=26%. Replace broad white areas with SOLID PURE BLACK #000000, at least 80% of the whole image. Use only sparse thin pure white outlines on existing edges outside the small lit pool. A few red hatch strokes light the main subject and a small pool around the lantern, following surfaces, never floating in the air. No large white areas. No diffuse glow, no rays, no halo, no texture or grain. Deep solid black room fills the frame.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

</details>


**Jour — master final** : `PAR-02.png`.

SHA-256 livré : `902902c47c7dcb002aca312ce372339b3954e8faca37303f27c714486c9a6086`.

Master copié depuis ce PNG natif, sans retouche raster après cette dernière génération.


**Nuit — master final** : `PAR-02.nuit.png`.

SHA-256 livré : `7c3bafdb1c57b484eb1c0efae7c3e205da82d4036e5f0e164ec2b18e4b42b3ba`.

Master copié depuis ce PNG natif, sans retouche raster après cette dernière génération.


#### PAR-03

Sujet : **What I carry in my bag**. Date : **13 octobre 2026**. Provenance : `image_gen`.

Fichiers livrés : [`PAR-03.png`](PAR-03.png) et [`PAR-03.nuit.png`](PAR-03.nuit.png).


<details>
<summary>Prompt initial enregistré du jour</summary>

Source native : `/Users/charles/.codex/generated_images/01a136b9-d2db-7fb2-a10c-6fc43794bbfd/exec-fdc3b3a4-a35e-4eb1-966d-7fedbe04fa81.png`.

SHA-256 natif : `281ca812a230aec9ca8d0c633f443672b17d2679957867fedd8fc20f30fb91ed`.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

Subject: What I carry in my bag.
Composition: A stack of closed bound books lying flat, in decreasing sizes, seen in three-quarter view from slightly above. Untitled spines. On top, a rolled diploma tied with a ribbon. A few loose blank certificate sheets without writing or seals slip between two books. The lantern acts as a bookend on the right and lights the book edges. No school marks.

Framing: exact 2:1 canvas, 2048 × 1024. Three-quarter view from slightly above, horizon at two-thirds height, main lines about 3 px at 1800 px. Sparse hatching only in shadow, readable at 320 px. Keep all objects uncut, inside a clear margin. HARD lantern registration: the centre of its RED FLAME must be at x=74% of total width and y=56% of total height from the top-left, within 3 percentage points on each axis. This is the flame centre, not the base or the top ring. Make the lantern small enough for its ring, cage and base to fit around this exact point. The main subject occupies at least 60% of the frame. Pure red is only a few simple hatch strokes on the lit main object and the flame. No light rays, radial marks, halo, glow or microtexture; no wood grain or fake text.

The four attached images are references only: images 1 and 2 define the recurring hand-cut style and lantern motif; images 3 and 4 define the simple square four-post lantern, top ring and drop-shaped flame. Do not copy their book, lettering, colours, rays or glow. No marks outside the subject.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

</details>


<details>
<summary>Prompt exact du jour retenu</summary>

Source native : `/Users/charles/.codex/generated_images/01a136b9-d2db-7fb2-a10c-6fc43794bbfd/exec-c2f97773-17bc-435d-9b78-138418582221.png`.

SHA-256 natif : `d5d65164777e58b661a41c8a664b2192000537ced431dc118052a64107bae40d`.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

EDIT IMAGE 1. This day illustration includes a BLUE REGISTRATION CROSS at the REQUIRED new flame centre. Move the entire lantern LEFT by 121 pixels so its red flame centre is exactly on the blue cross at 74% width, 56% height. Keep the books and diploma composition and native 1774×887 dimensions unchanged. Remove every blue guide mark completely. Simplify dense hatching into clean white paper and solid black shadows. Images 2–5 only show the recurring lantern. No additional objects.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

</details>


<details>
<summary>Prompt exact de la nuit retenue</summary>

Source native : `/Users/charles/.codex/generated_images/01a136b9-d2db-7fb2-a10c-6fc43794bbfd/exec-2f795889-1d48-4413-ba38-47bed3dbc609.png`.

SHA-256 natif : `95b0465ccb5e22d11aa9ea1748eb1406eae2e3e76c756be9ad05b2d8aaad5920`.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.

EDIT IMAGE 1, the supplied day master; images 2–5 are the lantern style references. Keep the exact native dimensions, canvas ratio, camera, crop, every object position, shape, size, overlap and pose of image 1. Do not produce a new composition. Only change ink coverage and illumination. Keep the red flame at its existing registered position x=74%, y=56%. Replace broad white areas with SOLID PURE BLACK #000000, at least 80% of the whole image. Use only sparse thin pure white outlines on existing edges outside the small lit pool. A few red hatch strokes light the main subject and a small pool around the lantern, following surfaces, never floating in the air. No large white areas. No diffuse glow, no rays, no halo, no texture or grain. Deep solid black room fills the frame.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

</details>


**Jour — master final** : `PAR-03.png`.

SHA-256 livré : `d5d65164777e58b661a41c8a664b2192000537ced431dc118052a64107bae40d`.

Master copié depuis ce PNG natif, sans retouche raster après cette dernière génération.


**Nuit — master final** : `PAR-03.nuit.png`.

SHA-256 livré : `95b0465ccb5e22d11aa9ea1748eb1406eae2e3e76c756be9ad05b2d8aaad5920`.

Master copié depuis ce PNG natif, sans retouche raster après cette dernière génération.


#### PRO-01

Sujet : **Software architecture**. Date : **13 octobre 2026**. Provenance : `image_gen`.

Fichiers livrés : [`PRO-01.png`](PRO-01.png) et [`PRO-01.nuit.png`](PRO-01.nuit.png).


<details>
<summary>Prompt initial enregistré du jour</summary>

Source native : `/Users/charles/.codex/generated_images/01a136b9-d2db-7fb2-a10c-6fc43794bbfd/exec-4e40ca08-9801-4c0f-ba5f-7c204a587640.png`.

SHA-256 natif : `369d3136af6ebf3fd769e87c35acb979b24574aa636bf464de02cbd1c9386e33`.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

Subject: Software architecture.
Composition: A small architect's model of a three-storey building in cutaway, seen in three-quarter view from slightly above. On the bottom storey, storage cubbies for data; in the middle, rooms joined by stairs and bridges for services; on top, a glazed gallery for the interface. Vertical conduits join the storeys. A lantern rests centrally on the ground floor and lights the cutaway from below. No people, no letters, no identifying organisation details.

Framing: exact 3:2 canvas, 1536 × 1024. Three-quarter view from slightly above, horizon at two-thirds height, main lines about 3 px at 1800 px. Sparse hatching only in shadow, readable at 320 px. Keep all important parts in the middle 75% of image height for a 16:9 crop. Keep all objects uncut, inside a clear margin. HARD lantern registration: the centre of its RED FLAME must be at x=50% of total width and y=72% of total height from the top-left, within 3 percentage points on each axis. This is the flame centre, not the base or the top ring. Make the lantern small enough for its ring, cage and base to fit around this exact point. The main subject occupies at least 60% of the frame. Pure red is only a few simple hatch strokes on the lit main object and the flame. No light rays, radial marks, halo, glow or microtexture; no wood grain or fake text.

The four attached images are references only: images 1 and 2 define the recurring hand-cut style and lantern motif; images 3 and 4 define the simple square four-post lantern, top ring and drop-shaped flame. Do not copy their book, lettering, colours, rays or glow. No marks outside the subject.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

</details>


<details>
<summary>Prompt exact du jour retenu</summary>

Source native : `/Users/charles/.codex/generated_images/01a136b9-d2db-7fb2-a10c-6fc43794bbfd/exec-20a03264-af2f-48d8-a06f-864ce8f3589a.png`.

SHA-256 natif : `83005f07a9a2871d49e3a74ee20c920d756d16261b5311dee3338f2127138cf6`.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

EDIT IMAGE 1, a day engraving. Move the ENTIRE small lantern, including ring, roof, cage, flame and base, STRAIGHT UP by 50 pixels. The current flame is too low. Its centre must align to the BLUE CROSS at (768,737). Keep all other pixels, structure and framing unchanged. Remove every blue mark. Native canvas remains1536×1024. Images2–5 are references for the lantern only. No new objects, no radiating strokes, no glow.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines, people, human figures, hands
```

</details>


<details>
<summary>Prompt exact de la nuit retenue</summary>

Source native : `/Users/charles/.codex/generated_images/01a136b9-d2db-7fb2-a10c-6fc43794bbfd/exec-813a4a51-2e9d-4870-9a7a-240f414bb67f.png`.

SHA-256 natif : `52034e261dc70749d529f0870548f755151a4f8d07fd15294bdd4f5f5bdefe17`.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.

EDIT IMAGE 1, the supplied day master; images 2–5 are the lantern style references. Keep the exact native dimensions, canvas ratio, camera, crop, every object position, shape, size, overlap and pose of image 1. Do not produce a new composition. Only change ink coverage and illumination. Keep the red flame at its existing registered position x=50%, y=72%. Replace broad white areas with SOLID PURE BLACK #000000, at least 80% of the whole image. Use only sparse thin pure white outlines on existing edges outside the small lit pool. A few red hatch strokes light the main subject and a small pool around the lantern, following surfaces, never floating in the air. No large white areas. No diffuse glow, no rays, no halo, no texture or grain. Deep solid black room fills the frame.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

</details>


**Jour — master final** : `PRO-01.png`.

SHA-256 livré : `83005f07a9a2871d49e3a74ee20c920d756d16261b5311dee3338f2127138cf6`.

Master copié depuis ce PNG natif, sans retouche raster après cette dernière génération.


**Nuit — master final** : `PRO-01.nuit.png`.

SHA-256 livré : `52034e261dc70749d529f0870548f755151a4f8d07fd15294bdd4f5f5bdefe17`.

Master copié depuis ce PNG natif, sans retouche raster après cette dernière génération.


#### PRO-02

Sujet : **Teaching through qualification**. Date : **13 octobre 2026**. Provenance : `image_gen`.

Fichiers livrés : [`PRO-02.png`](PRO-02.png) et [`PRO-02.nuit.png`](PRO-02.nuit.png).


<details>
<summary>Prompt initial enregistré du jour</summary>

Source native : `/Users/charles/.codex/generated_images/01a136b9-d2db-7fb2-a10c-6fc43794bbfd/exec-bd307b44-81c0-4793-a23e-bfa9ab20fc86.png`.

SHA-256 natif : `535b4b27dc8084f2c73bba63bc15a831573b4b1a61def661602c0045be775989`.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

Subject: Teaching through qualification.
Composition: A training-centre corridor seen in three-quarter view from slightly above. Along the wall, a row of about ten rolled and tied diplomas, each on a small wall console. At the end, a door is ajar to an empty room with a blackboard carrying a simple three-block diagram. A lantern on the first console lights the row of diplomas. No people, no organisation logos, no writing.

Framing: exact 3:2 canvas, 1536 × 1024. Three-quarter view from slightly above, horizon at two-thirds height, main lines about 3 px at 1800 px. Sparse hatching only in shadow, readable at 320 px. Keep all important parts in the middle 75% of image height for a 16:9 crop. Keep all objects uncut, inside a clear margin. HARD lantern registration: the centre of its RED FLAME must be at x=24% of total width and y=62% of total height from the top-left, within 3 percentage points on each axis. This is the flame centre, not the base or the top ring. Make the lantern small enough for its ring, cage and base to fit around this exact point. The main subject occupies at least 60% of the frame. Pure red is only a few simple hatch strokes on the lit main object and the flame. No light rays, radial marks, halo, glow or microtexture; no wood grain or fake text.

The four attached images are references only: images 1 and 2 define the recurring hand-cut style and lantern motif; images 3 and 4 define the simple square four-post lantern, top ring and drop-shaped flame. Do not copy their book, lettering, colours, rays or glow. No marks outside the subject.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

</details>


<details>
<summary>Prompt exact du jour retenu</summary>

Source native : `/Users/charles/.codex/generated_images/01a136b9-d2db-7fb2-a10c-6fc43794bbfd/exec-bb82cee2-4484-4a76-9673-3e7a178af9d3.png`.

SHA-256 natif : `2bd3f038074c7e5b4bf002445e97e583c4d1d6ed7c070621070b5d33d18f0807`.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

EDIT IMAGE1. Move the FIRST CONSOLE and its LANTERN together DOWN80 pixels and RIGHT50 pixels. The red flame currently at319,563 must be at369,635. The ENTIRE LANTERN must move, not merely its base. The FLAME itself occupies the blue rectangle. Lower the whole console shelf to y760. Eliminate excessive wall hatching. Remove ALL blue guide marks. Native1536×1024 unchanged. Images2–5 lantern references only. No people.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

</details>


<details>
<summary>Prompt exact de la nuit retenue</summary>

Source native : `/Users/charles/.codex/generated_images/01a136b9-d2db-7fb2-a10c-6fc43794bbfd/exec-41f6bc16-9289-48d7-b5f5-93359b2a3f81.png`.

SHA-256 natif : `0298f81d3ba821a5f473673fd038f8301e813e2e00d64c5f4aa5c11002506839`.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.

EDIT IMAGE 1, the supplied day master; images 2–5 are the lantern style references. Keep the exact native dimensions, canvas ratio, camera, crop, every object position, shape, size, overlap and pose of image 1. Do not produce a new composition. Only change ink coverage and illumination. Keep the red flame at its existing registered position x=24%, y=62%. Replace broad white areas with SOLID PURE BLACK #000000, at least 80% of the whole image. Use only sparse thin pure white outlines on existing edges outside the small lit pool. A few red hatch strokes light the main subject and a small pool around the lantern, following surfaces, never floating in the air. No large white areas. No diffuse glow, no rays, no halo, no texture or grain. Deep solid black room fills the frame.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

</details>


**Jour — master final** : `PRO-02.png`.

SHA-256 livré : `2bd3f038074c7e5b4bf002445e97e583c4d1d6ed7c070621070b5d33d18f0807`.

Master copié depuis ce PNG natif, sans retouche raster après cette dernière génération.


**Nuit — master final** : `PRO-02.nuit.png`.

SHA-256 livré : `0298f81d3ba821a5f473673fd038f8301e813e2e00d64c5f4aa5c11002506839`.

Master copié depuis ce PNG natif, sans retouche raster après cette dernière génération.


#### PRO-03

Sujet : **The team**. Date : **13 octobre 2026**. Provenance : `image_gen`.

Fichiers livrés : [`PRO-03.png`](PRO-03.png) et [`PRO-03.nuit.png`](PRO-03.nuit.png).


<details>
<summary>Prompt initial enregistré du jour</summary>

Source native : `/Users/charles/.codex/generated_images/01a136b9-d2db-7fb2-a10c-6fc43794bbfd/exec-4d50181f-2a04-4832-a29b-02e8e5d7fa27.png`.

SHA-256 natif : `cb9089dd97d4b9c6347715c68e431c2b6179613424b28a93ff413ed59b715bf5`.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

Subject: The team.
Composition: A table seen in three-quarter view from slightly above. Small plain pennants planted on blank cards move in several lines from the table edges towards a single open repository chest in the centre. Above the chest, two ribbons of different flat key tones are tied together. A lantern rests on the chest lid and lights the cards entering it. No national flags, no words, no people, no setting from an existing game.

Framing: exact 3:2 canvas, 1536 × 1024. Three-quarter view from slightly above, horizon at two-thirds height, main lines about 3 px at 1800 px. Sparse hatching only in shadow, readable at 320 px. Keep all important parts in the middle 75% of image height for a 16:9 crop. Keep all objects uncut, inside a clear margin. HARD lantern registration: the centre of its RED FLAME must be at x=52% of total width and y=44% of total height from the top-left, within 3 percentage points on each axis. This is the flame centre, not the base or the top ring. Make the lantern small enough for its ring, cage and base to fit around this exact point. The main subject occupies at least 60% of the frame. Pure red is only a few simple hatch strokes on the lit main object and the flame. No light rays, radial marks, halo, glow or microtexture; no wood grain or fake text.

The four attached images are references only: images 1 and 2 define the recurring hand-cut style and lantern motif; images 3 and 4 define the simple square four-post lantern, top ring and drop-shaped flame. Do not copy their book, lettering, colours, rays or glow. No marks outside the subject.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

</details>


<details>
<summary>Prompt exact du jour retenu</summary>

Source native : `/Users/charles/.codex/generated_images/01a136b9-d2db-7fb2-a10c-6fc43794bbfd/exec-b14cffdc-25cb-433d-9d1f-436ef1fce41a.png`.

SHA-256 natif : `d2bffca40d45de6e89e96de1471090032f8be0a282ba0cf6b938395f47ab871c`.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

EDIT IMAGE1, the existing day image with blue registration guide. Erase the lantern and tie on the chest. DRAW THE LANTERN AGAIN with its red drop flame exactly centred on the BLUE CROSS at pixel799,451. The blue rectangle encloses the FLAME, not the lantern base. The new flame is visibly LOWER than the old flame. Set lantern on a small ledge of the chest at y535 and put tied black and white ribbons above the lantern. Remove all blue marks. Keep empty room and table of pennant cards. No people. Preserve native1536×1024 framing. Images2–5 define lantern only.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

</details>


<details>
<summary>Prompt exact de la nuit retenue</summary>

Source native : `/Users/charles/.codex/generated_images/01a136b9-d2db-7fb2-a10c-6fc43794bbfd/exec-04d627e3-9367-4bb8-9998-e8bdb1ee8b95.png`.

SHA-256 natif : `2f76f9171b523c3420a34d3cccb7bc67c72c922a5479fba6227c0a00ff9cb94a`.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.

EDIT IMAGE 1, the supplied day master; images 2–5 are the lantern style references. Keep the exact native dimensions, canvas ratio, camera, crop, every object position, shape, size, overlap and pose of image 1. Do not produce a new composition. Only change ink coverage and illumination. Keep the red flame at its existing registered position x=52%, y=44%. Replace broad white areas with SOLID PURE BLACK #000000, at least 80% of the whole image. Use only sparse thin pure white outlines on existing edges outside the small lit pool. A few red hatch strokes light the main subject and a small pool around the lantern, following surfaces, never floating in the air. No large white areas. No diffuse glow, no rays, no halo, no texture or grain. Deep solid black room fills the frame.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

</details>


**Jour — master final** : `PRO-03.png`.

SHA-256 livré : `d2bffca40d45de6e89e96de1471090032f8be0a282ba0cf6b938395f47ab871c`.

Master copié depuis ce PNG natif, sans retouche raster après cette dernière génération.


**Nuit — master final** : `PRO-03.nuit.png`.

SHA-256 livré : `2f76f9171b523c3420a34d3cccb7bc67c72c922a5479fba6227c0a00ff9cb94a`.

Master copié depuis ce PNG natif, sans retouche raster après cette dernière génération.


#### PRO-04

Sujet : **Introducing web development**. Date : **13 octobre 2026**. Provenance : `image_gen`.

Fichiers livrés : [`PRO-04.png`](PRO-04.png) et [`PRO-04.nuit.png`](PRO-04.nuit.png).


<details>
<summary>Prompt initial enregistré du jour</summary>

Source native : `/Users/charles/.codex/generated_images/01a136b9-d2db-7fb2-a10c-6fc43794bbfd/exec-6a66058f-96fd-481e-a61a-8ac8253d457d.png`.

SHA-256 natif : `b5e4cba675aa68b5e02224fbc16f67e9e942e98ee8f7c136eeec246f0915ee2e`.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

Subject: Introducing web development.
Composition: A workshop table seen in three-quarter view from slightly above. Three open laptops with elementary program-like abstract block arrangements on their screens, blank sticky notes on the screen edges, chairs pulled out as if a workshop has just ended. The lantern rests in the centre of the table and lights the screens. No people, no logos, no characters or fake text lines on screens.

Framing: exact 3:2 canvas, 1536 × 1024. Three-quarter view from slightly above, horizon at two-thirds height, main lines about 3 px at 1800 px. Sparse hatching only in shadow, readable at 320 px. Keep all important parts in the middle 75% of image height for a 16:9 crop. Keep all objects uncut, inside a clear margin. HARD lantern registration: the centre of its RED FLAME must be at x=50% of total width and y=58% of total height from the top-left, within 3 percentage points on each axis. This is the flame centre, not the base or the top ring. Make the lantern small enough for its ring, cage and base to fit around this exact point. The main subject occupies at least 60% of the frame. Pure red is only a few simple hatch strokes on the lit main object and the flame. No light rays, radial marks, halo, glow or microtexture; no wood grain or fake text.

The four attached images are references only: images 1 and 2 define the recurring hand-cut style and lantern motif; images 3 and 4 define the simple square four-post lantern, top ring and drop-shaped flame. Do not copy their book, lettering, colours, rays or glow. No marks outside the subject.

This scene contains ZERO people, human figures, bodies or hands. Objects only. Keep the lantern small and use its exact flame-centre registration as the primary layout anchor.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

</details>


<details>
<summary>Prompt exact du jour retenu</summary>

Source native : `/Users/charles/.codex/generated_images/01a136b9-d2db-7fb2-a10c-6fc43794bbfd/exec-4bd75385-c7e6-4434-b533-a19aea0467e3.png`.

SHA-256 natif : `0af810b8ee68ba8f6f9ccf6bd9bc71e54dd2f0fdec918a0ae13c80921b2508cb`.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

EDIT IMAGE1. Move ENTIRE lantern straight DOWN50 pixels. Do not resize. Current flame centre765,546; target768,594. Flame centre must match BLUE CROSS and base must be y704. Keep all else. Remove all blue guide marks. Native1536×1024 unchanged. Images2–5 lantern references only. No people.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

</details>


<details>
<summary>Prompt exact de la nuit retenue</summary>

Source native : `/Users/charles/.codex/generated_images/01a136b9-d2db-7fb2-a10c-6fc43794bbfd/exec-ff6525e7-088c-4962-9843-79a998ab741c.png`.

SHA-256 natif : `f2a882fe5305644a689fc06e6ab472203c95fc9e29243951f2d877b48dbd82d5`.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.

EDIT IMAGE 1, the supplied day master; images 2–5 are the lantern style references. Keep the exact native dimensions, canvas ratio, camera, crop, every object position, shape, size, overlap and pose of image 1. Do not produce a new composition. Only change ink coverage and illumination. Keep the red flame at its existing registered position x=50%, y=58%. Replace broad white areas with SOLID PURE BLACK #000000, at least 80% of the whole image. Use only sparse thin pure white outlines on existing edges outside the small lit pool. A few red hatch strokes light the main subject and a small pool around the lantern, following surfaces, never floating in the air. No large white areas. No diffuse glow, no rays, no halo, no texture or grain. Deep solid black room fills the frame.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

</details>


**Jour — master final** : `PRO-04.png`.

SHA-256 livré : `0af810b8ee68ba8f6f9ccf6bd9bc71e54dd2f0fdec918a0ae13c80921b2508cb`.

Master copié depuis ce PNG natif, sans retouche raster après cette dernière génération.


**Nuit — master final** : `PRO-04.nuit.png`.

SHA-256 livré : `f2a882fe5305644a689fc06e6ab472203c95fc9e29243951f2d877b48dbd82d5`.

Master copié depuis ce PNG natif, sans retouche raster après cette dernière génération.


#### PRO-05

Sujet : **Less time spent on administrative processing**. Date : **13 octobre 2026**. Provenance : `image_gen`.

Fichiers livrés : [`PRO-05.png`](PRO-05.png) et [`PRO-05.nuit.png`](PRO-05.nuit.png).


<details>
<summary>Prompt initial enregistré du jour</summary>

Source native : `/Users/charles/.codex/generated_images/01a136b9-d2db-7fb2-a10c-6fc43794bbfd/exec-a469aacc-1d9c-4947-8839-f083bf209ff6.png`.

SHA-256 natif : `c0932eafdece9c08e6282758e860424056880ea6bb352c06f23006b8d4feb5e3`.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

Subject: Less time spent on administrative processing.
Composition: A timesheet and contract tracking form on a desk, seen in three-quarter view from slightly above, with empty boxes and columns and no words or numbers. An hourglass beside it has distinctly less sand in its upper bulb. A stamp and a pen lie nearby. A lantern lights the hourglass. No company or software logos.

Framing: exact 3:2 canvas, 1536 × 1024. Three-quarter view from slightly above, horizon at two-thirds height, main lines about 3 px at 1800 px. Sparse hatching only in shadow, readable at 320 px. Keep all important parts in the middle 75% of image height for a 16:9 crop. Keep all objects uncut, inside a clear margin. HARD lantern registration: the centre of its RED FLAME must be at x=66% of total width and y=40% of total height from the top-left, within 3 percentage points on each axis. This is the flame centre, not the base or the top ring. Make the lantern small enough for its ring, cage and base to fit around this exact point. The main subject occupies at least 60% of the frame. Pure red is only a few simple hatch strokes on the lit main object and the flame. No light rays, radial marks, halo, glow or microtexture; no wood grain or fake text.

The four attached images are references only: images 1 and 2 define the recurring hand-cut style and lantern motif; images 3 and 4 define the simple square four-post lantern, top ring and drop-shaped flame. Do not copy their book, lettering, colours, rays or glow. No marks outside the subject.

This scene contains ZERO people, human figures, bodies or hands. Objects only. Keep the lantern small and use its exact flame-centre registration as the primary layout anchor.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

</details>


<details>
<summary>Prompt exact du jour retenu</summary>

Source native : `/Users/charles/.codex/generated_images/01a136b9-d2db-7fb2-a10c-6fc43794bbfd/exec-b0efcd8c-ed73-48d0-b03e-e29b73e5e98c.png`.

SHA-256 natif : `955fad1b0ff04487d14a0aa468a0f00cce2e91a032a8883f32853a0b1f662813`.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

EDIT IMAGE1. Move the lantern a TINY distance left, about half the width of its cage. Keep it to the right of the hourglass without overlap. Flame centre at66%canvaswidth and40%height. Preserve all else. Do not shift it far enough to overlap the hourglass. Native1536×1024 unchanged. Images2–5 lantern references only.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

</details>


<details>
<summary>Prompt exact de la nuit retenue</summary>

Source native : `/Users/charles/.codex/generated_images/01a136b9-d2db-7fb2-a10c-6fc43794bbfd/exec-9fd5e1f4-50e5-40f1-9200-dfe57b0bf70a.png`.

SHA-256 natif : `fa05fe8f9bf1c80b936912443f79f1062e5ee74e13aafbef612778b9bf660044`.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.

EDIT IMAGE 1, the supplied day master; images 2–5 are the lantern style references. Keep the exact native dimensions, canvas ratio, camera, crop, every object position, shape, size, overlap and pose of image 1. Do not produce a new composition. Only change ink coverage and illumination. Keep the red flame at its existing registered position x=66%, y=40%. Replace broad white areas with SOLID PURE BLACK #000000, at least 80% of the whole image. Use only sparse thin pure white outlines on existing edges outside the small lit pool. A few red hatch strokes light the main subject and a small pool around the lantern, following surfaces, never floating in the air. No large white areas. No diffuse glow, no rays, no halo, no texture or grain. Deep solid black room fills the frame.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

</details>


**Jour — master final** : `PRO-05.png`.

SHA-256 livré : `955fad1b0ff04487d14a0aa468a0f00cce2e91a032a8883f32853a0b1f662813`.

Master copié depuis ce PNG natif, sans retouche raster après cette dernière génération.


**Nuit — master final** : `PRO-05.nuit.png`.

SHA-256 livré : `fa05fe8f9bf1c80b936912443f79f1062e5ee74e13aafbef612778b9bf660044`.

Master copié depuis ce PNG natif, sans retouche raster après cette dernière génération.


#### PRO-06

Sujet : **Made to measure**. Date : **13 octobre 2026**. Provenance : `image_gen`.

Fichiers livrés : [`PRO-06.png`](PRO-06.png) et [`PRO-06.nuit.png`](PRO-06.nuit.png).


<details>
<summary>Prompt initial enregistré du jour</summary>

Source native : `/Users/charles/.codex/generated_images/01a136b9-d2db-7fb2-a10c-6fc43794bbfd/exec-52d936d7-bc65-4a9c-9baa-c62047eda111.png`.

SHA-256 natif : `9bafa29d68117fe7f590004c409afcbac854dea1c2590599a2771344140ef660`.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

Subject: Made to measure.
Composition: An open bound specification notebook with abstract margin marks, beside a paper application mockup showing a phone screen and a browser screen as simple outlined rectangles, viewed in three-quarter view from slightly above. A ruler and pencil lie beside the papers. A lantern lights the point where the two documents touch. No logos, letters or fake text lines.

Framing: exact 3:2 canvas, 1536 × 1024. Three-quarter view from slightly above, horizon at two-thirds height, main lines about 3 px at 1800 px. Sparse hatching only in shadow, readable at 320 px. Keep all important parts in the middle 75% of image height for a 16:9 crop. Keep all objects uncut, inside a clear margin. HARD lantern registration: the centre of its RED FLAME must be at x=50% of total width and y=46% of total height from the top-left, within 3 percentage points on each axis. This is the flame centre, not the base or the top ring. Make the lantern small enough for its ring, cage and base to fit around this exact point. The main subject occupies at least 60% of the frame. Pure red is only a few simple hatch strokes on the lit main object and the flame. No light rays, radial marks, halo, glow or microtexture; no wood grain or fake text.

The four attached images are references only: images 1 and 2 define the recurring hand-cut style and lantern motif; images 3 and 4 define the simple square four-post lantern, top ring and drop-shaped flame. Do not copy their book, lettering, colours, rays or glow. No marks outside the subject.

This scene contains ZERO people, human figures, bodies or hands. Objects only. Keep the lantern small and use its exact flame-centre registration as the primary layout anchor.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

</details>


<details>
<summary>Prompt exact du jour retenu</summary>

Source native : `/Users/charles/.codex/generated_images/01a136b9-d2db-7fb2-a10c-6fc43794bbfd/exec-12bd4042-4825-4e12-960f-a07428558a04.png`.

SHA-256 natif : `1eab74a376cb8e92e31bd6305a46281a7b419cda3a2083a1c6d52d094721e0df`.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

EDIT IMAGE1 only to remove the thin vertical WHITE GUIDE LINE at the very centre x768, extending from lantern ring down through flame and book. Restore underlying black outlines and red flame where that straight line interrupted them. No other change: lantern and every object stay exactly in place, native1536×1024 remains. Do not add any guide or alignment mark.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

</details>


<details>
<summary>Prompt exact de la nuit retenue</summary>

Source native : `/Users/charles/.codex/generated_images/01a136b9-d2db-7fb2-a10c-6fc43794bbfd/exec-aebf858d-8f7e-4066-a9b0-442a4e6132b4.png`.

SHA-256 natif : `accb1d7c76b69a4fdf2febf2ce12a60c041756912110cfb00c6cfdff3334547f`.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.

EDIT IMAGE 1, the supplied day master; images 2–5 are the lantern style references. Keep the exact native dimensions, canvas ratio, camera, crop, every object position, shape, size, overlap and pose of image 1. Do not produce a new composition. Only change ink coverage and illumination. Keep the red flame at its existing registered position x=50%, y=46%. Replace broad white areas with SOLID PURE BLACK #000000, at least 80% of the whole image. Use only sparse thin pure white outlines on existing edges outside the small lit pool. A few red hatch strokes light the main subject and a small pool around the lantern, following surfaces, never floating in the air. No large white areas. No diffuse glow, no rays, no halo, no texture or grain. Deep solid black room fills the frame.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

</details>


**Jour — master final** : `PRO-06.png`.

SHA-256 livré : `1eab74a376cb8e92e31bd6305a46281a7b419cda3a2083a1c6d52d094721e0df`.

Master copié depuis ce PNG natif, sans retouche raster après cette dernière génération.


**Nuit — master final** : `PRO-06.nuit.png`.

SHA-256 livré : `accb1d7c76b69a4fdf2febf2ce12a60c041756912110cfb00c6cfdff3334547f`.

Master copié depuis ce PNG natif, sans retouche raster après cette dernière génération.


#### CMP-01

Sujet : **The workbench**. Date : **13 octobre 2026**. Provenance : `image_gen`.

Fichiers livrés : [`CMP-01.png`](CMP-01.png) et [`CMP-01.nuit.png`](CMP-01.nuit.png).


<details>
<summary>Prompt exact du jour retenu</summary>

Source native : `/Users/charles/.codex/generated_images/01a136b9-d2db-7fb2-a10c-6fc43794bbfd/exec-d11af8fb-f250-4025-b463-7df86b22a89f.png`.

SHA-256 natif : `c2a0ac6ec61a13c5dac9856446b73edf24d38b485ecc352271b7d048b12aefb9`.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

Subject: The workbench.
Composition: A workshop pegboard seen straight on. Every tool hangs in front of its painted silhouette, in four groups: templates and set squares; connectors and cables; card drawers; a sealed crate. One silhouette is empty because its tool has been taken out. A lantern hangs at the upper left and lights that empty silhouette. No screen, no person, no words.

Framing: exact 21:9 canvas, 1792 × 768. Three-quarter view from slightly above, horizon at two-thirds height, main lines about 3 px at 1800 px. Sparse hatching only in shadow, readable at 320 px. Keep all objects uncut, inside a clear margin. HARD lantern registration: the centre of its RED FLAME must be at x=14% of total width and y=22% of total height from the top-left, within 3 percentage points on each axis. This is the flame centre, not the base or the top ring. Make the lantern small enough for its ring, cage and base to fit around this exact point. The main subject occupies at least 60% of the frame. Pure red is only a few simple hatch strokes on the lit main object and the flame. No light rays, radial marks, halo, glow or microtexture; no wood grain or fake text.

The four attached images are references only: images 1 and 2 define the recurring hand-cut style and lantern motif; images 3 and 4 define the simple square four-post lantern, top ring and drop-shaped flame. Do not copy their book, lettering, colours, rays or glow. No marks outside the subject.

This scene contains ZERO people, human figures, bodies or hands. Objects only. Keep the lantern small and use its exact flame-centre registration as the primary layout anchor.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

</details>


<details>
<summary>Prompt exact de la nuit retenue</summary>

Source native : `/Users/charles/.codex/generated_images/01a136b9-d2db-7fb2-a10c-6fc43794bbfd/exec-b57cced8-a1ca-4539-a4b2-353a43756fa2.png`.

SHA-256 natif : `e4413bf0c1652e13f3497aec0997c7c4c1908cec28532415e2659030e7db0b4a`.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.

EDIT IMAGE 1, the supplied day master; images 2–5 are the lantern style references. Keep the exact native dimensions, canvas ratio, camera, crop, every object position, shape, size, overlap and pose of image 1. Do not produce a new composition. Only change ink coverage and illumination. Keep the red flame at its existing registered position x=14%, y=22%. Replace broad white areas with SOLID PURE BLACK #000000, at least 80% of the whole image. Use only sparse thin pure white outlines on existing edges outside the small lit pool. A few red hatch strokes light the main subject and a small pool around the lantern, following surfaces, never floating in the air. No large white areas. No diffuse glow, no rays, no halo, no texture or grain. Deep solid black room fills the frame.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

</details>


**Jour — master final** : `CMP-01.png`.

SHA-256 livré : `c2a0ac6ec61a13c5dac9856446b73edf24d38b485ecc352271b7d048b12aefb9`.

Master copié depuis ce PNG natif, sans retouche raster après cette dernière génération.


**Nuit — master final** : `CMP-01.nuit.png`.

SHA-256 livré : `acc2dcbdb40729dc7db31f881cc95f7fca04dc8a66723aed64c2e89f7ff47874`.

Opérations locales retenues, coordonnées en pixels :


```json
{
  "id": "CMP-01",
  "variant": "nuit",
  "date": "2026-10-13",
  "file": "/Users/charles/Documents/GitHub/MonPortefolioV2/design/assets/visuels/parcours/CMP-01.nuit.png",
  "sourceHash": "e4413bf0c1652e13f3497aec0997c7c4c1908cec28532415e2659030e7db0b4a",
  "before": [
    1915,
    821
  ],
  "after": [
    1916,
    821
  ],
  "operation": "Ajout d’une colonne noire opaque à droite ; dessin natif inchangé et non redimensionné."
}
```


#### CMP-03

Sujet : **The column board**. Date : **13 octobre 2026**. Provenance : `image_gen`.

Fichiers livrés : [`CMP-03.png`](CMP-03.png) et [`CMP-03.nuit.png`](CMP-03.nuit.png).


<details>
<summary>Prompt initial enregistré du jour</summary>

Source native : `/Users/charles/.codex/generated_images/01a136b9-d2db-7fb2-a10c-6fc43794bbfd/exec-c8d40b96-67ec-413f-a9d7-4d82433a1c16.png`.

SHA-256 natif : `3ab33b1ed9471c4dfeef9727518158c48d37b41eedd8844bb6262a36b79dc94f`.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

Transparent background: nothing is drawn outside the subject.

Subject: The column board.
Composition: A three-column task board viewed straight on: blank cards, two moved from one column to another indicated by hand-drawn curved arrows. One pin per card. A small lantern hangs at the upper right and lights the moved cards. No person, no screen, no words or numbers.

Framing: exact 1:1 canvas, 1280 × 1280. Front view, one centred main object occupying at least 70% of the square, horizon at the lower third; bold main lines about 6 px at 480 px, readable at 160 px. Keep all objects uncut, inside a clear margin. HARD lantern registration: the centre of its RED FLAME must be at x=82% of total width and y=16% of total height from the top-left, within 3 percentage points on each axis. This is the flame centre, not the base or the top ring. Make the lantern small enough for its ring, cage and base to fit around this exact point. The main subject occupies at least 60% of the frame. Pure red is only a few simple hatch strokes on the lit main object and the flame. No light rays, radial marks, halo, glow or microtexture; no wood grain or fake text.

The four attached images are references only: images 1 and 2 define the recurring hand-cut style and lantern motif; images 3 and 4 define the simple square four-post lantern, top ring and drop-shaped flame. Do not copy their book, lettering, colours, rays or glow. No marks outside the subject.

This scene contains ZERO people, human figures, bodies or hands. Objects only. Keep the lantern small and use its exact flame-centre registration as the primary layout anchor.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

</details>


<details>
<summary>Prompt exact du jour retenu</summary>

Source native : `/Users/charles/.codex/generated_images/01a136b9-d2db-7fb2-a10c-6fc43794bbfd/exec-710a2612-837e-46f0-9873-436eb75a1dc1.png`.

SHA-256 natif : `9493f7cc89270e08d51764782aa853fcc97ccef07d4f05e09cd8ac6ab1a5232f`.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

EDIT IMAGE1. Make the lantern HALF ITS CURRENT SIZE, hanging at same top hook. Its flame must move up to the BLUE CROSS at82%width16%height. Change the two curved arrows from red to BLACK: red is for light only. Keep taskboard and cards unchanged. Remove all blue guides. Native1254×1254 and transparent background unchanged. Images2–5 lantern references.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

</details>


<details>
<summary>Prompt exact de la nuit retenue</summary>

Source native : `/Users/charles/.codex/generated_images/01a136b9-d2db-7fb2-a10c-6fc43794bbfd/exec-c04d107c-de46-4ffd-ae9a-f8c4923b3f7a.png`.

SHA-256 natif : `c647146a72e083c33c47e8fe6f12bd37f99c4ee8422737f761e3e4e7aeb4d67e`.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

Transparent background: nothing is drawn outside the subject. Preserve the original transparency.

Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.

EDIT IMAGE 1, the supplied day master; images 2–5 are the lantern style references. Keep the exact native dimensions, canvas ratio, camera, crop, every object position, shape, size, overlap and pose of image 1. Do not produce a new composition. Only change ink coverage and illumination. Keep the red flame at its CURRENT actual position in image1, do not shift it. Replace broad white areas with SOLID PURE BLACK #000000, at least 80% of the OPAQUE subject pixels (not counting the transparent background). Use only sparse thin pure white outlines on existing edges outside the small lit pool. A few red hatch strokes light the main subject and a small pool around the lantern, following surfaces, never floating in the air. No large white areas. No diffuse glow, no rays, no halo, no texture or grain. Keep the background transparent, and retain opaque solid black inside the object silhouettes; do not turn the dark object interior transparent.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

</details>


**Jour — master final** : `CMP-03.png`.

SHA-256 livré : `281e03ca4200336c1a56decd2900b33f35b37ee9aaf962b3d65fddbdf68cdbaa`.

Opérations locales retenues, coordonnées en pixels :


```json
{
  "id": "CMP-03",
  "kind": "day",
  "source": "/Users/charles/.codex/generated_images/01a136b9-d2db-7fb2-a10c-6fc43794bbfd/exec-710a2612-837e-46f0-9873-436eb75a1dc1.png",
  "dest": "/Users/charles/Documents/GitHub/MonPortefolioV2/design/assets/visuels/parcours/CMP-03.png",
  "scale": 0.78,
  "anchor": [
    1043,
    80
  ],
  "bounds": [
    973,
    78,
    141,
    255
  ],
  "shapes": "<ellipse cx=\"1043\" cy=\"110\" rx=\"33\" ry=\"35\"/><polygon points=\"1031,139 1058,139 1063,155 1109,194 1112,210 1096,218 1096,298 1108,304 1108,325 1071,337 981,323 980,306 992,297 992,220 980,211 977,194 1026,158\"/>",
  "renderBounds": [
    988,
    78,
    110,
    199
  ],
  "note": "Réduction autour du crochet, suppression des hachures suspendues dans le vide sous la lanterne."
}
```


**Nuit — master final** : `CMP-03.nuit.png`.

SHA-256 livré : `194d8f793429f5664f05a4410b975f76075de5efb5627006a75395c3f3f47e78`.

Opérations locales retenues, coordonnées en pixels :


```json
{
  "id": "CMP-03",
  "kind": "night",
  "source": "/Users/charles/.codex/generated_images/01a136b9-d2db-7fb2-a10c-6fc43794bbfd/exec-c04d107c-de46-4ffd-ae9a-f8c4923b3f7a.png",
  "dest": "/Users/charles/Documents/GitHub/MonPortefolioV2/design/assets/visuels/parcours/CMP-03.nuit.png",
  "scale": 0.78,
  "anchor": [
    1043,
    80
  ],
  "bounds": [
    973,
    78,
    141,
    255
  ],
  "shapes": "<ellipse cx=\"1043\" cy=\"110\" rx=\"33\" ry=\"35\"/><polygon points=\"1031,139 1058,139 1063,155 1109,194 1112,210 1096,218 1096,298 1108,304 1108,325 1071,337 981,323 980,306 992,297 992,220 980,211 977,194 1026,158\"/>",
  "renderBounds": [
    988,
    78,
    110,
    199
  ],
  "note": "Réduction autour du crochet, suppression des hachures suspendues dans le vide sous la lanterne."
}
```


#### CMP-04

Sujet : **The annotated notebook**. Date : **13 octobre 2026**. Provenance : `image_gen`.

Fichiers livrés : [`CMP-04.png`](CMP-04.png) et [`CMP-04.nuit.png`](CMP-04.nuit.png).


<details>
<summary>Prompt initial enregistré du jour</summary>

Source native : `/Users/charles/.codex/generated_images/01a136b9-d2db-7fb2-a10c-6fc43794bbfd/exec-c6aa90dd-bc23-4ef0-959f-814c4983e23a.png`.

SHA-256 natif : `2d21e0bb6e0b930b34031c86809cb0169461bc94b7c9ff913429811ab080dac1`.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

Transparent background: nothing is drawn outside the subject.

Subject: The annotated notebook.
Composition: An open specification notebook, with abstract short marks rather than fake text, three question-mark shapes in the margin and a brace grouping two blank paragraph areas. A pencil rests across it. A small lantern at the upper right lights the page. No person, no screen, no legible text.

Framing: exact 1:1 canvas, 1280 × 1280. Front view, one centred main object occupying at least 70% of the square, horizon at the lower third; bold main lines about 6 px at 480 px, readable at 160 px. Keep all objects uncut, inside a clear margin. HARD lantern registration: the centre of its RED FLAME must be at x=80% of total width and y=24% of total height from the top-left, within 3 percentage points on each axis. This is the flame centre, not the base or the top ring. Make the lantern small enough for its ring, cage and base to fit around this exact point. The main subject occupies at least 60% of the frame. Pure red is only a few simple hatch strokes on the lit main object and the flame. No light rays, radial marks, halo, glow or microtexture; no wood grain or fake text.

The four attached images are references only: images 1 and 2 define the recurring hand-cut style and lantern motif; images 3 and 4 define the simple square four-post lantern, top ring and drop-shaped flame. Do not copy their book, lettering, colours, rays or glow. No marks outside the subject.

This scene contains ZERO people, human figures, bodies or hands. Objects only. Keep the lantern small and use its exact flame-centre registration as the primary layout anchor.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

</details>


<details>
<summary>Prompt exact du jour retenu</summary>

Source native : `/Users/charles/.codex/generated_images/01a136b8-11b0-7ef1-8420-f989ed366996/exec-ef40114e-eb5d-40b7-b53c-a6efb27f872d.png`.

SHA-256 natif : `41b43cf9a8684d27b16abbbb277c49406d4063d5421a22adaa38e29e4a7d1ecf`.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

Transparent background: nothing is drawn outside the subject.

Edit the FIRST image, the annotated notebook with pencil and lantern. Preserve the exact1254×1254 square and transparency. Reposition the WHOLE illustration (book, pencil AND lantern together) UP by120pixels, without changing their relative placement or size. Everything fits inside the canvas: original lantern ring starts220pixels fromtop and will nowstart100pixels fromtop. This moves the flame fromy428 toy308, close to24% ofcanvasheight. Keep book and pencil unchanged, all page marks blank outlined boxes and questionmarks, no horizontal fake writing lines. Lantern stays resting directly on the book. The composition is the same objects, only placed higher in the same canvas. Do not crop any objects. Images2–5 references only for lantern style, no book from those references.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

</details>


<details>
<summary>Prompt exact de la nuit retenue</summary>

Source native : `/Users/charles/.codex/generated_images/01a136b8-11b0-7ef1-8420-f989ed366996/exec-16137372-a46c-4d59-a50d-fd3e71325e1e.png`.

SHA-256 natif : `4727d9d82403ab604e484d8b737fd1c423c444463e7160fb8a88f667ff839537`.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

Transparent background: nothing is drawn outside the subject. Preserve the original transparency.

Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.

EDIT IMAGE 1, the supplied day master; images 2–5 are the lantern style references. Keep the exact native dimensions, canvas ratio, camera, crop, every object position, shape, size, overlap and pose of image 1. Do not produce a new composition. Only change ink coverage and illumination. Keep the red flame at its CURRENT actual position in image1, do not shift it. Replace broad white areas with SOLID PURE BLACK #000000, at least 80% of the OPAQUE subject pixels (not counting the transparent background). Use only sparse thin pure white outlines on existing edges outside the small lit pool. A few red hatch strokes light the main subject and a small pool around the lantern, following surfaces, never floating in the air. No large white areas. No diffuse glow, no rays, no halo, no texture or grain. Keep the background transparent, and retain opaque solid black inside the object silhouettes; do not turn the dark object interior transparent.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

</details>


**Jour — master final** : `CMP-04.png`.

SHA-256 livré : `41b43cf9a8684d27b16abbbb277c49406d4063d5421a22adaa38e29e4a7d1ecf`.

Master copié depuis ce PNG natif, sans retouche raster après cette dernière génération.


**Nuit — master final** : `CMP-04.nuit.png`.

SHA-256 livré : `b6012649b3bcf5fc68c497d30d2b790e8951794e8aa2f7289aeaaa40011e5a40`.

Opérations locales retenues, coordonnées en pixels :


```json
{
  "id": "CMP-04",
  "date": "2026-10-13",
  "variant": "nuit",
  "source": "/Users/charles/.codex/generated_images/01a136b8-11b0-7ef1-8420-f989ed366996/exec-16137372-a46c-4d59-a50d-fd3e71325e1e.png",
  "output": "/Users/charles/Documents/GitHub/MonPortefolioV2/design/assets/visuels/parcours/CMP-04.nuit.png",
  "dimensions": [
    1254,
    1254
  ],
  "target": [
    80,
    24
  ],
  "tolerance": 3,
  "parameters": {
    "box": [
      931,
      0,
      1120,
      399
    ],
    "sourceToDestinationY": [
      [
        0,
        0
      ],
      [
        116,
        110
      ],
      [
        380,
        374
      ],
      [
        399,
        399
      ]
    ],
    "horizontalDisplacement": 0,
    "maxUpwardDisplacement": 6,
    "fixedBelowY": 399,
    "sampling": "voisin le plus proche",
    "protected": "pixels x<945 pour y>350, afin de conserver le bord du livre",
    "description": "déplacer le haut et la cage de 6 px vers le haut ; raccord progressif au pied fixe"
  }
}
```


#### CMP-05

Sujet : **Two speech bubbles replying to one another**. Date : **13 octobre 2026**. Provenance : `image_gen`.

Fichiers livrés : [`CMP-05.png`](CMP-05.png) et [`CMP-05.nuit.png`](CMP-05.nuit.png).


<details>
<summary>Prompt exact du jour retenu</summary>

Source native : `/Users/charles/.codex/generated_images/01a136b9-d2db-7fb2-a10c-6fc43794bbfd/exec-a6152ac2-179b-49ca-a376-cbec575edf3d.png`.

SHA-256 natif : `dece0ce3239dfb41469e9954ca7c435e4306ede34fd6e104e27bbaacb7345d6b`.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

Transparent background: nothing is drawn outside the subject.

Subject: Two speech bubbles replying to one another.
Composition: Two empty speech bubbles facing each other at the same height and exactly the same size, neither dominates. A small lantern stands between them and its light touches both. No person, no words.

Framing: exact 1:1 canvas, 1280 × 1280. Front view, one centred main object occupying at least 70% of the square, horizon at the lower third; bold main lines about 6 px at 480 px, readable at 160 px. Keep all objects uncut, inside a clear margin. HARD lantern registration: the centre of its RED FLAME must be at x=50% of total width and y=70% of total height from the top-left, within 3 percentage points on each axis. This is the flame centre, not the base or the top ring. Make the lantern small enough for its ring, cage and base to fit around this exact point. The main subject occupies at least 60% of the frame. Pure red is only a few simple hatch strokes on the lit main object and the flame. No light rays, radial marks, halo, glow or microtexture; no wood grain or fake text.

The four attached images are references only: images 1 and 2 define the recurring hand-cut style and lantern motif; images 3 and 4 define the simple square four-post lantern, top ring and drop-shaped flame. Do not copy their book, lettering, colours, rays or glow. No marks outside the subject.

This scene contains ZERO people, human figures, bodies or hands. Objects only. Keep the lantern small and use its exact flame-centre registration as the primary layout anchor.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

</details>


<details>
<summary>Prompt exact de la nuit retenue</summary>

Source native : `/Users/charles/.codex/generated_images/01a136b9-d2db-7fb2-a10c-6fc43794bbfd/exec-417a6dd7-8998-4a57-8ecb-c9617591a759.png`.

SHA-256 natif : `c70f97f03973bc1c216ce221c74da56c3712cf02a483e811ee98d0678ef23c50`.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

Transparent background: nothing is drawn outside the subject. Preserve the original transparency.

Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.

EDIT IMAGE 1, the supplied day master; images 2–5 are the lantern style references. Keep the exact native dimensions, canvas ratio, camera, crop, every object position, shape, size, overlap and pose of image 1. Do not produce a new composition. Only change ink coverage and illumination. Keep the red flame at its CURRENT actual position in image1, do not shift it. Replace broad white areas with SOLID PURE BLACK #000000, at least 80% of the OPAQUE subject pixels (not counting the transparent background). Use only sparse thin pure white outlines on existing edges outside the small lit pool. A few red hatch strokes light the main subject and a small pool around the lantern, following surfaces, never floating in the air. No large white areas. No diffuse glow, no rays, no halo, no texture or grain. Keep the background transparent, and retain opaque solid black inside the object silhouettes; do not turn the dark object interior transparent.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

</details>


**Jour — master final** : `CMP-05.png`.

SHA-256 livré : `dece0ce3239dfb41469e9954ca7c435e4306ede34fd6e104e27bbaacb7345d6b`.

Master copié depuis ce PNG natif, sans retouche raster après cette dernière génération.


**Nuit — master final** : `CMP-05.nuit.png`.

SHA-256 livré : `c70f97f03973bc1c216ce221c74da56c3712cf02a483e811ee98d0678ef23c50`.

Master copié depuis ce PNG natif, sans retouche raster après cette dernière génération.


#### CMP-06

Sujet : **The turned-over card**. Date : **13 octobre 2026**. Provenance : `image_gen`.

Fichiers livrés : [`CMP-06.png`](CMP-06.png) et [`CMP-06.nuit.png`](CMP-06.nuit.png).


<details>
<summary>Prompt initial enregistré du jour</summary>

Source native : `/Users/charles/.codex/generated_images/01a136b9-d2db-7fb2-a10c-6fc43794bbfd/exec-5318fc8b-4c0c-4ec4-ac74-cebdb693c7a8.png`.

SHA-256 natif : `5acd1ae2a4415c928e829ca6b0f65a022aa434a6afbe4971d301cb1c81bf025a`.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

Transparent background: nothing is drawn outside the subject.

Subject: The turned-over card.
Composition: A fan of identical playing cards with their backs visible, bearing a simple invented geometric motif. In the centre, a single card is face up and tilted in the opposite direction. A small lantern in front of the fan lights that turned card. No card from an existing game, no character illustrations.

Framing: exact 1:1 canvas, 1280 × 1280. Front view, one centred main object occupying at least 70% of the square, horizon at the lower third; bold main lines about 6 px at 480 px, readable at 160 px. Keep all objects uncut, inside a clear margin. HARD lantern registration: the centre of its RED FLAME must be at x=50% of total width and y=82% of total height from the top-left, within 3 percentage points on each axis. This is the flame centre, not the base or the top ring. Make the lantern small enough for its ring, cage and base to fit around this exact point. The main subject occupies at least 60% of the frame. Pure red is only a few simple hatch strokes on the lit main object and the flame. No light rays, radial marks, halo, glow or microtexture; no wood grain or fake text.

The four attached images are references only: images 1 and 2 define the recurring hand-cut style and lantern motif; images 3 and 4 define the simple square four-post lantern, top ring and drop-shaped flame. Do not copy their book, lettering, colours, rays or glow. No marks outside the subject.

This scene contains ZERO people, human figures, bodies or hands. Objects only. Keep the lantern small and use its exact flame-centre registration as the primary layout anchor.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

</details>


<details>
<summary>Prompt exact du jour retenu</summary>

Source native : `/Users/charles/.codex/generated_images/01a136b9-d2db-7fb2-a10c-6fc43794bbfd/exec-40ef0272-fcc8-4527-82cd-5922f4e020d8.png`.

SHA-256 natif : `fe02e31f207f95805dc3411f40ebdcf56850d295177e245d18b338305da30c0c`.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.
Transparent background: nothing is drawn outside the subject.
EDIT ONLY image1, the native day illustration. Translate the ENTIRE illustration (all playing cards together with lantern and its light pool) DOWN by exactly 96 pixels on this square 1254x1254 canvas. Keep the group exactly the same native size, objects and arrangement; just reframe it 96 pixels lower. The current red flame centre is at y=74.3%; the final red flame centre must be y=82%, x=50%. There is ample bottom transparent margin; keep every shape uncut. Do not detach or move the lantern relative to the cards. Do not add or remove objects. No labels, no guide marks. Images2–5 are references only; preserve image1 subjects.
Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

</details>


<details>
<summary>Prompt exact de la nuit retenue</summary>

Source native : `/Users/charles/.codex/generated_images/01a136b9-d2db-7fb2-a10c-6fc43794bbfd/exec-f4c911ae-2175-47db-80b1-3c53d90d7a13.png`.

SHA-256 natif : `1b58c725aa80687b336b1025bd603532c95caefcdc83fbd332b3046f6c50b5dc`.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

Transparent background: nothing is drawn outside the subject. Preserve the original transparency.

Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.

EDIT IMAGE 1, the supplied day master; images 2–5 are the lantern style references. Keep the exact native dimensions, canvas ratio, camera, crop, every object position, shape, size, overlap and pose of image 1. Do not produce a new composition. Only change ink coverage and illumination. Keep the red flame at its CURRENT actual position in image1, do not shift it. Replace broad white areas with SOLID PURE BLACK #000000, at least 80% of the OPAQUE subject pixels (not counting the transparent background). Use only sparse thin pure white outlines on existing edges outside the small lit pool. A few red hatch strokes light the main subject and a small pool around the lantern, following surfaces, never floating in the air. No large white areas. No diffuse glow, no rays, no halo, no texture or grain. Keep the background transparent, and retain opaque solid black inside the object silhouettes; do not turn the dark object interior transparent.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

</details>


**Jour — master final** : `CMP-06.png`.

SHA-256 livré : `fe02e31f207f95805dc3411f40ebdcf56850d295177e245d18b338305da30c0c`.

Master copié depuis ce PNG natif, sans retouche raster après cette dernière génération.


**Nuit — master final** : `CMP-06.nuit.png`.

SHA-256 livré : `0274c64d16a0bf03a5120b9d1369395ea0b64ed34132e0874d5986b221c4e18d`.

Opérations locales retenues, coordonnées en pixels :


```json
{
  "id": "CMP-06",
  "source": "/Users/charles/.codex/generated_images/01a136b9-d2db-7fb2-a10c-6fc43794bbfd/exec-f4c911ae-2175-47db-80b1-3c53d90d7a13.png",
  "dest": "/Users/charles/Documents/GitHub/MonPortefolioV2/design/assets/visuels/parcours/CMP-06.nuit.png",
  "translation": [
    0,
    38
  ],
  "reason": "alignement technique de la nuit éditée sur les repères et la flamme du jour, sans redimensionner ni recréer de pixels",
  "dimensions": [
    1254,
    1254
  ],
  "opaqueBoundsBefore": [
    23,
    389,
    1231,
    1142
  ],
  "opaqueBoundsAfter": [
    23,
    427,
    1231,
    1180
  ],
  "clippedAlphaNoise": {
    "pixelsAlphaAbove0": 15,
    "pixelsAlphaAtLeast250": 0,
    "maxAlpha": 1
  }
}
```

Les 15 pixels sortis du canevas n’avaient qu’un alpha de 1 ; aucun pixel opaque du sujet n’est rogné. Les marges opaques finales restent dans le canevas.


#### CMP-07

Sujet : **The Möbius strip**. Date : **13 octobre 2026**. Provenance : `image_gen`.

Fichiers livrés : [`CMP-07.png`](CMP-07.png) et [`CMP-07.nuit.png`](CMP-07.nuit.png).


<details>
<summary>Prompt exact du jour retenu</summary>

Source native : `/Users/charles/.codex/generated_images/01a136b9-d2db-7fb2-a10c-6fc43794bbfd/exec-cb75f085-7473-49a2-91a9-ab4f74092d91.png`.

SHA-256 natif : `f97a2583d6fb8c3ab056fe3ff58fdbf1155a8b3c33480494d94f91a1f8474ba1`.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

Transparent background: nothing is drawn outside the subject.

Subject: The Möbius strip.
Composition: An upright Möbius strip drawn as a loop. On one face, three simple notches represented by shapes, a magnifying glass, a flask and a key, without words. A small lantern sits behind, centrally, visible through the opening of the loop.

Framing: exact 1:1 canvas, 1280 × 1280. Front view, one centred main object occupying at least 70% of the square, horizon at the lower third; bold main lines about 6 px at 480 px, readable at 160 px. Keep all objects uncut, inside a clear margin. HARD lantern registration: the centre of its RED FLAME must be at x=50% of total width and y=50% of total height from the top-left, within 3 percentage points on each axis. This is the flame centre, not the base or the top ring. Make the lantern small enough for its ring, cage and base to fit around this exact point. The main subject occupies at least 60% of the frame. Pure red is only a few simple hatch strokes on the lit main object and the flame. No light rays, radial marks, halo, glow or microtexture; no wood grain or fake text.

The four attached images are references only: images 1 and 2 define the recurring hand-cut style and lantern motif; images 3 and 4 define the simple square four-post lantern, top ring and drop-shaped flame. Do not copy their book, lettering, colours, rays or glow. No marks outside the subject.

This scene contains ZERO people, human figures, bodies or hands. Objects only. Keep the lantern small and use its exact flame-centre registration as the primary layout anchor.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

</details>


<details>
<summary>Prompt exact de la nuit retenue</summary>

Source native : `/Users/charles/.codex/generated_images/01a136b9-d2db-7fb2-a10c-6fc43794bbfd/exec-3ac4483b-33e7-4236-8179-938ec2fa5eed.png`.

SHA-256 natif : `d9c00b68aff42a6c00838278e1ae0c91cf5439cba1dce7d4f2f8c5ab7365f81b`.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

Transparent background: nothing is drawn outside the subject. Preserve the original transparency.

Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.

EDIT IMAGE 1, the supplied day master; images 2–5 are the lantern style references. Keep the exact native dimensions, canvas ratio, camera, crop, every object position, shape, size, overlap and pose of image 1. Do not produce a new composition. Only change ink coverage and illumination. Keep the red flame at its CURRENT actual position in image1, do not shift it. Replace broad white areas with SOLID PURE BLACK #000000, at least 80% of the OPAQUE subject pixels (not counting the transparent background). Use only sparse thin pure white outlines on existing edges outside the small lit pool. A few red hatch strokes light the main subject and a small pool around the lantern, following surfaces, never floating in the air. No large white areas. No diffuse glow, no rays, no halo, no texture or grain. Keep the background transparent, and retain opaque solid black inside the object silhouettes; do not turn the dark object interior transparent.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines

The edited subject MUST REMAIN the UPRIGHT MÖBIUS BAND bearing a magnifier, flask and key, with a lantern through its triangular opening. ABSOLUTELY NO BOOK. Image1 is the ONLY composition reference; images2–5 must not be copied. Preserve transparent square1254×1254.
```

</details>


**Jour — master final** : `CMP-07.png`.

SHA-256 livré : `b7ea3ee6443b3de4a1fa8ee96d9c10a580f471d93b1c89d2b20bbfa157a069cf`.

Opérations locales retenues, coordonnées en pixels :


```json
{
  "id": "CMP-07",
  "kind": "day",
  "source": "/Users/charles/.codex/generated_images/01a136b9-d2db-7fb2-a10c-6fc43794bbfd/exec-cb75f085-7473-49a2-91a9-ab4f74092d91.png",
  "dest": "/Users/charles/Documents/GitHub/MonPortefolioV2/design/assets/visuels/parcours/CMP-07.png",
  "scale": 1.34,
  "anchor": [
    627,
    817
  ],
  "bounds": [
    528,
    443,
    196,
    386
  ],
  "shapes": "<ellipse cx=\"627\" cy=\"490\" rx=\"46\" ry=\"44\"/><polygon points=\"608,521 646,521 649,535 673,555 721,583 721,603 706,614 706,769 720,784 724,810 674,827 532,815 529,794 542,778 548,613 533,608 530,584 599,545 605,535\"/>",
  "renderBounds": [
    494,
    316,
    263,
    517
  ],
  "note": "Agrandissement autour du pied fixe. Le ruban au premier plan occulte les parties agrandies qui le rencontrent."
}
```


**Nuit — master final** : `CMP-07.nuit.png`.

SHA-256 livré : `bd0fbc7dc7a493f35c5983dd6b2ff17fe2b34bbdc3bf1ad9ffbf4dcf4d7efddd`.

Opérations locales retenues, coordonnées en pixels :


```json
{
  "id": "CMP-07",
  "kind": "night",
  "source": "/Users/charles/.codex/generated_images/01a136b9-d2db-7fb2-a10c-6fc43794bbfd/exec-3ac4483b-33e7-4236-8179-938ec2fa5eed.png",
  "dest": "/Users/charles/Documents/GitHub/MonPortefolioV2/design/assets/visuels/parcours/CMP-07.nuit.png",
  "scale": 1.34,
  "anchor": [
    627,
    817
  ],
  "bounds": [
    528,
    443,
    196,
    386
  ],
  "shapes": "<ellipse cx=\"627\" cy=\"490\" rx=\"46\" ry=\"44\"/><polygon points=\"608,521 646,521 649,535 673,555 721,583 721,603 706,614 706,769 720,784 724,810 674,827 532,815 529,794 542,778 548,613 533,608 530,584 599,545 605,535\"/>",
  "renderBounds": [
    494,
    316,
    263,
    517
  ],
  "note": "Agrandissement autour du pied fixe. Le ruban au premier plan occulte les parties agrandies qui le rencontrent."
}
```


#### CMP-08

Sujet : **The board and bound notebook**. Date : **13 octobre 2026**. Provenance : `image_gen`.

Fichiers livrés : [`CMP-08.png`](CMP-08.png) et [`CMP-08.nuit.png`](CMP-08.nuit.png).


<details>
<summary>Prompt exact du jour retenu</summary>

Source native : `/Users/charles/.codex/generated_images/01a136b9-d2db-7fb2-a10c-6fc43794bbfd/exec-1bf17be8-e5b6-44ab-bf14-bc6bc53c9854.png`.

SHA-256 natif : `0df89ba0227fc8535169ad669010d69242a5adb91c97efd815b65032d3bbdbcd`.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

Transparent background: nothing is drawn outside the subject.

Subject: The board and bound notebook.
Composition: A small column board holding blank cards is linked by a thread to a thick tabbed document beside it. A paperclip lies on the document. A small lantern at the lower centre lights the thread. No logo, no words.

Framing: exact 1:1 canvas, 1280 × 1280. Front view, one centred main object occupying at least 70% of the square, horizon at the lower third; bold main lines about 6 px at 480 px, readable at 160 px. Keep all objects uncut, inside a clear margin. HARD lantern registration: the centre of its RED FLAME must be at x=50% of total width and y=78% of total height from the top-left, within 3 percentage points on each axis. This is the flame centre, not the base or the top ring. Make the lantern small enough for its ring, cage and base to fit around this exact point. The main subject occupies at least 60% of the frame. Pure red is only a few simple hatch strokes on the lit main object and the flame. No light rays, radial marks, halo, glow or microtexture; no wood grain or fake text.

The four attached images are references only: images 1 and 2 define the recurring hand-cut style and lantern motif; images 3 and 4 define the simple square four-post lantern, top ring and drop-shaped flame. Do not copy their book, lettering, colours, rays or glow. No marks outside the subject.

This scene contains ZERO people, human figures, bodies or hands. Objects only. Keep the lantern small and use its exact flame-centre registration as the primary layout anchor.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

</details>


<details>
<summary>Prompt exact de la nuit retenue</summary>

Source native : `/Users/charles/.codex/generated_images/01a136b9-d2db-7fb2-a10c-6fc43794bbfd/exec-56d5397e-974e-4f1f-a368-89e5c70c12ca.png`.

SHA-256 natif : `1c797110284d44ef215147fc0e563a585c2d2a124395a828fb3a01f206044679`.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

Transparent background: nothing is drawn outside the subject. Preserve the original transparency.

Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.

EDIT IMAGE 1, the supplied day master; images 2–5 are the lantern style references. Keep the exact native dimensions, canvas ratio, camera, crop, every object position, shape, size, overlap and pose of image 1. Do not produce a new composition. Only change ink coverage and illumination. Keep the red flame at its CURRENT actual position in image1, do not shift it. Replace broad white areas with SOLID PURE BLACK #000000, at least 80% of the OPAQUE subject pixels (not counting the transparent background). Use only sparse thin pure white outlines on existing edges outside the small lit pool. A few red hatch strokes light the main subject and a small pool around the lantern, following surfaces, never floating in the air. No large white areas. No diffuse glow, no rays, no halo, no texture or grain. Keep the background transparent, and retain opaque solid black inside the object silhouettes; do not turn the dark object interior transparent.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

</details>


**Jour — master final** : `CMP-08.png`.

SHA-256 livré : `0df89ba0227fc8535169ad669010d69242a5adb91c97efd815b65032d3bbdbcd`.

Master copié depuis ce PNG natif, sans retouche raster après cette dernière génération.


**Nuit — master final** : `CMP-08.nuit.png`.

SHA-256 livré : `1c797110284d44ef215147fc0e563a585c2d2a124395a828fb3a01f206044679`.

Master copié depuis ce PNG natif, sans retouche raster après cette dernière génération.


#### FOR-01

Sujet : **A web application**. Date : **13 octobre 2026**. Provenance : `image_gen`.

Fichiers livrés : [`FOR-01.png`](FOR-01.png) et [`FOR-01.nuit.png`](FOR-01.nuit.png).


<details>
<summary>Prompt initial enregistré du jour</summary>

Source native : `/Users/charles/.codex/generated_images/01a136b9-d2db-7fb2-a10c-6fc43794bbfd/exec-e99c0440-9673-4bef-9af8-8053d2f7dedd.png`.

SHA-256 natif : `96e35263e3deedf031662b6225df56d2b91f33eaa7c6a4a059e83978f9cdd692`.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

Subject: A web application.
Composition: An exploded model of a web application viewed in three-quarter view from slightly above, in three stacked planes: at the front a responsive screen, with a browser and phone side by side containing simple content blocks without text; in the middle an API component with connectors and request and response arrows; behind a database of stacked cylinders. A lantern rests at the foot of the stack and lights all three planes. No framework logos.

Framing: exact 16:9 canvas, 1792 × 1008. Three-quarter view from slightly above, horizon at two-thirds height, main lines about 3 px at 1800 px. Sparse hatching only in shadow, readable at 320 px. Keep all objects uncut, inside a clear margin. HARD lantern registration: the centre of its RED FLAME must be at x=30% of total width and y=80% of total height from the top-left, within 3 percentage points on each axis. This is the flame centre, not the base or the top ring. Make the lantern small enough for its ring, cage and base to fit around this exact point. The main subject occupies at least 60% of the frame. Pure red is only a few simple hatch strokes on the lit main object and the flame. No light rays, radial marks, halo, glow or microtexture; no wood grain or fake text.

The four attached images are references only: images 1 and 2 define the recurring hand-cut style and lantern motif; images 3 and 4 define the simple square four-post lantern, top ring and drop-shaped flame. Do not copy their book, lettering, colours, rays or glow. No marks outside the subject.

This scene contains ZERO people, human figures, bodies or hands. Objects only. Keep the lantern small and use its exact flame-centre registration as the primary layout anchor.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

</details>


<details>
<summary>Prompt exact du jour retenu</summary>

Source native : `/Users/charles/.codex/generated_images/01a136b9-d2db-7fb2-a10c-6fc43794bbfd/exec-0ae9482b-aacf-4b8a-9831-28115971b00d.png`.

SHA-256 natif : `1df913ae7a9c17b75969b16b0a1cf05cf340a1f2fa3d14e85f83c66188dadef2`.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

EDIT IMAGE1. Erase all fake-text horizontal marks inside browser and phone, leaving only outlined layout rectangles. Move whole lantern a little UP, redflamecentre y80% instead of84.7%. Redlight only following physical surfaces, no rays. Keep layoutandnative1672×941. No people. Images2–5 lanternreferences.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

</details>


<details>
<summary>Prompt exact de la nuit retenue</summary>

Source native : `/Users/charles/.codex/generated_images/01a136b8-11b0-7ef1-8420-f989ed366996/exec-3e156818-0d06-4bd4-ab89-083f062d22ae.png`.

SHA-256 natif : `5af82fc7b30bde65ce90b605d2a03e227e70171bbfbcea9423b16e9f4086d773`.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge with opaque solid black night.

Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.

EDIT IMAGE 1, the supplied day master; images 2–5 are the lantern style references. Keep the exact native dimensions, canvas ratio, camera, crop, every object position, shape, size, overlap and pose of image 1. Do not produce a new composition. Only change ink coverage and illumination. Keep the red flame at its CURRENT actual position in image1, do not shift it. Replace broad white areas with SOLID PURE BLACK #000000, at least 80% of the whole image. Use only sparse thin pure white outlines on existing edges outside the small lit pool. A few red hatch strokes light the main subject and a small pool around the lantern, following surfaces, never floating in the air. No large white areas. No diffuse glow, no rays, no halo, no texture or grain. Deep solid black room fills the frame.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

</details>


**Jour — master final** : `FOR-01.png`.

SHA-256 livré : `1df913ae7a9c17b75969b16b0a1cf05cf340a1f2fa3d14e85f83c66188dadef2`.

Master copié depuis ce PNG natif, sans retouche raster après cette dernière génération.


**Nuit — master final** : `FOR-01.nuit.png`.

SHA-256 livré : `0d478a924fa8df673ba10209890445b868fe6c7ce7465034c59890d710a0516a`.

Opérations locales retenues, coordonnées en pixels :


```json
{
  "id": "FOR-01",
  "variant": "nuit",
  "date": "2026-10-13",
  "file": "/Users/charles/Documents/GitHub/MonPortefolioV2/design/assets/visuels/parcours/FOR-01.nuit.png",
  "sourceHash": "5af82fc7b30bde65ce90b605d2a03e227e70171bbfbcea9423b16e9f4086d773",
  "before": [
    1671,
    941
  ],
  "after": [
    1672,
    941
  ],
  "operation": "Ajout d’une colonne noire opaque à droite ; dessin natif inchangé et non redimensionné."
}
```


#### FOR-02

Sujet : **Four fifths**. Date : **13 octobre 2026**. Provenance : `image_gen`.

Fichiers livrés : [`FOR-02.png`](FOR-02.png) et [`FOR-02.nuit.png`](FOR-02.nuit.png).


<details>
<summary>Prompt initial enregistré du jour</summary>

Source native : `/Users/charles/.codex/generated_images/01a136b9-d2db-7fb2-a10c-6fc43794bbfd/exec-e53b3f4b-0e41-46e6-afe9-bdb1d78e195f.png`.

SHA-256 natif : `1a7b7ef8ccc76b46947373ed4afbc622103b2bea6a2bf9afc8c3783130a8e655`.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

Subject: Four fifths.
Composition: An application plan drawn on a large sheet, seen in three-quarter view from slightly above, divided into exactly five zones: four outlined and filled with simple shapes for screens, services, data and tests, while the fifth remains empty and dotted. A pencil rests on the empty zone. A lantern lights the four completed zones.

Framing: exact 3:2 canvas, 1536 × 1024. Three-quarter view from slightly above, horizon at two-thirds height, main lines about 3 px at 1800 px. Sparse hatching only in shadow, readable at 320 px. Keep all objects uncut, inside a clear margin. HARD lantern registration: the centre of its RED FLAME must be at x=22% of total width and y=30% of total height from the top-left, within 3 percentage points on each axis. This is the flame centre, not the base or the top ring. Make the lantern small enough for its ring, cage and base to fit around this exact point. The main subject occupies at least 60% of the frame. Pure red is only a few simple hatch strokes on the lit main object and the flame. No light rays, radial marks, halo, glow or microtexture; no wood grain or fake text.

The four attached images are references only: images 1 and 2 define the recurring hand-cut style and lantern motif; images 3 and 4 define the simple square four-post lantern, top ring and drop-shaped flame. Do not copy their book, lettering, colours, rays or glow. No marks outside the subject.

This scene contains ZERO people, human figures, bodies or hands. Objects only. Keep the lantern small and use its exact flame-centre registration as the primary layout anchor.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

</details>


<details>
<summary>Prompt exact du jour retenu</summary>

Source native : `/Users/charles/.codex/generated_images/01a136b8-11b0-7ef1-8420-f989ed366996/exec-e5736084-2367-4412-8438-620193ff24a4.png`.

SHA-256 natif : `776ad76e48657f5425d0e5333fff20d85f22ba54ecd2ce5a5980e41cf3a3c345`.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

Edit ONLY the first image. Keep the same canvas, the same camera and the same parchment plan and its five panels. Simplify drastically: erase ALL the hatching and grain from the background and tabletop, leaving large pure WHITE untouched paper outside the main scroll and just a few short contact shadow strokes near it. Keep large black masses in object shadows. REMOVE the three horizontal fake text bars beside the checkboxes on the clipboard in the bottom-middle panel: show only the three checkbox squares and their check marks, with blank paper to their right. All papers have NO text or pseudo-text rows. Simplify the server/cloud icons and leave their surfaces mostly blank. Keep only a few shadows, no dense microtexture. Keep the lantern exactly at its current position and size. Its red light appears only as short shadow hatches on the nearby plan, never as an aura or rays. All other panels and object positions remain unchanged. Images2–5 references only for lantern and hand-cut lines.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

</details>


<details>
<summary>Prompt exact de la nuit retenue</summary>

Source native : `/Users/charles/.codex/generated_images/01a136b9-d2db-7fb2-a10c-6fc43794bbfd/exec-7d19b770-bd2c-4517-98ab-8be7e1aff8d0.png`.

SHA-256 natif : `54a05e0b3a746e4c11f44f3b135381bf87a1fad0c929e0482340f2a0605dee2c`.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

The scene fills the frame edge to edge; empty areas are white paper.

Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.

EDIT IMAGE 1, the supplied day master; images 2–5 are the lantern style references. Keep the exact native dimensions, canvas ratio, camera, crop, every object position, shape, size, overlap and pose of image 1. Do not produce a new composition. Only change ink coverage and illumination. Keep the red flame at its CURRENT actual position in image1, do not shift it. Replace broad white areas with SOLID PURE BLACK #000000, at least 80% of the whole image. Use only sparse thin pure white outlines on existing edges outside the small lit pool. A few red hatch strokes light the main subject and a small pool around the lantern, following surfaces, never floating in the air. No large white areas. No diffuse glow, no rays, no halo, no texture or grain. Deep solid black room fills the frame.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

</details>


**Jour — master final** : `FOR-02.png`.

SHA-256 livré : `9f582113aeab75f183ac806bfd72804ea79bf651601118e318a7389e6942e5ac`.

Opérations locales retenues, coordonnées en pixels :


```json
{
  "id": "FOR-02",
  "source": "/Users/charles/.codex/generated_images/01a136b8-11b0-7ef1-8420-f989ed366996/exec-e5736084-2367-4412-8438-620193ff24a4.png",
  "path": "/Users/charles/Documents/GitHub/MonPortefolioV2/design/assets/visuels/parcours/FOR-02.png",
  "operation": "remappage vertical du haut/cage -42px, raccord au pied fixé sousy510 ; suppression des fragments de contour de feuille révélés au-dessus du toit",
  "bounds": [
    223,
    0,
    437,
    510
  ],
  "sourceToDestinationY": [
    [
      0,
      0
    ],
    [
      112,
      70
    ],
    [
      420,
      378
    ],
    [
      510,
      510
    ]
  ],
  "sampling": "voisin le plus proche"
}
```

Restauration complémentaire en blanc : fragments de contour de feuille dans x = 370–440, y = 140–219, pour y < 0,57 × (x − 337) + 157. Les autres objets restent hors du masque.


**Nuit — master final** : `FOR-02.nuit.png`.

SHA-256 livré : `54a05e0b3a746e4c11f44f3b135381bf87a1fad0c929e0482340f2a0605dee2c`.

Master copié depuis ce PNG natif, sans retouche raster après cette dernière génération.


#### FOR-03

Sujet : **Self-taught in early adolescence**. Date : **13 octobre 2026**. Provenance : `image_gen`.

Fichiers livrés : [`FOR-03.png`](FOR-03.png) et [`FOR-03.nuit.png`](FOR-03.nuit.png).


<details>
<summary>Prompt initial enregistré du jour</summary>

Source native : `/Users/charles/.codex/generated_images/01a136b9-d2db-7fb2-a10c-6fc43794bbfd/exec-8f745b14-7336-4f6b-8c29-bb8a5200f66c.png`.

SHA-256 natif : `cc8ae3e467011bb51a951c5d7c88efde430340e9752b9e74a761cf31bca6f13c`.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

Transparent background: nothing is drawn outside the subject.

Subject: Self-taught in early adolescence.
Composition: One main object: a book lying open, seen in three-quarter view. Pages have only a few abstract marks and broad blank paper, no fake text lines. A small lantern at the upper right lights the right page.

Framing: exact 1:1 canvas, 1280 × 1280. Three-quarter view, one main object occupying 80% of the square, no horizon, extremely bold silhouettes with main lines about 10 px at 384 px, no fine hatching, readable at 56 px. Keep all objects uncut, inside a clear margin. HARD lantern registration: the centre of its RED FLAME must be at x=80% of total width and y=22% of total height from the top-left, within 3 percentage points on each axis. This is the flame centre, not the base or the top ring. Make the lantern small enough for its ring, cage and base to fit around this exact point. The main subject occupies at least 60% of the frame. Pure red is only a few simple hatch strokes on the lit main object and the flame. No light rays, radial marks, halo, glow or microtexture; no wood grain or fake text.

The four attached images are references only: images 1 and 2 define the recurring hand-cut style and lantern motif; images 3 and 4 define the simple square four-post lantern, top ring and drop-shaped flame. Do not copy their book, lettering, colours, rays or glow. No marks outside the subject.

This scene contains ZERO people, human figures, bodies or hands. Objects only. Keep the lantern small and use its exact flame-centre registration as the primary layout anchor.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

</details>


<details>
<summary>Prompt exact du jour retenu</summary>

Source native : `/Users/charles/.codex/generated_images/01a136b9-d2db-7fb2-a10c-6fc43794bbfd/exec-7613b8a6-355a-4294-b8a6-c6913f457e8b.png`.

SHA-256 natif : `fa8f310556021b12fec3aace8822a27c052df0ffee997007ee73ce9cf19f0c9d`.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.
Transparent background: nothing is drawn outside the subject.
Edit only image1. Reframe this illustration: move the open book higher by about100px; make the lantern much SMALLER and move it UP so its red flame centre is EXACTLY x=80%, y=22% of the full square canvas. Its whole ring, roof, cage and base must fit within x=72–88%, y=6–30%. The small lantern sits behind the top-right page, or appears just above it as a detached emblem; preserve the large book in the lower half. Show the same blank open book, without fake text. Do not crop any object. 1254x1254 square canvas. Images2–5 are style references only, not compositions.
Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

</details>


<details>
<summary>Prompt exact de la nuit retenue</summary>

Source native : `/Users/charles/.codex/generated_images/01a136b9-ecbc-7ca3-90ed-40adc76135c1/exec-0464de4b-c2a9-4147-9cf7-0d7bc2c6039c.png`.

SHA-256 natif : `a3d448750c3db34393415e6b3585631ffa70874daaa32be99e9759116107d35a`.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

Transparent background: nothing is drawn outside the subject. Preserve the original transparency.

Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.

EDIT IMAGE 1, the supplied recalibrated day master. Images 2–5 are only the recurring lantern style references. Keep EXACTLY 1254 × 1254 pixels, its square canvas, alpha background, camera, book placement, all page edges, the separate small lantern emblem above the right page, its ring, cage, base and flame. Do not produce a new composition. Do not move or resize any object. Keep the centre of the red flame at 80% width and 22% height, its CURRENT position. Only change ink coverage and illumination. All broad white areas inside the book and lantern become solid pure black #000000; target 90% black of the opaque pixels, minimum 70%. Show only a few very thin white outlines of the existing page edges and binding outside the tiny illuminated pool. Sparse red hatches light the right page and the flame; no marks in the transparent gap. Preserve opaque black inside all silhouettes. Avoid grain, grey, white floods, micro-detail, floor, ground shadow, rays, halo and glow. No lettering, fake text, page diagrams, extra objects, people or hands. Keep transparency outside the two existing shapes.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

</details>


**Jour — master final** : `FOR-03.png`.

SHA-256 livré : `56b34fd11623c6e5bb7e6958200f57c67fe4a5483e1e60a712bc506e7ab3442a`.

Opérations locales retenues, coordonnées en pixels :


```json
{
  "dimensions": [
    1254,
    1254
  ],
  "scale": 1,
  "translation": [
    14,
    -89
  ],
  "mask": [
    [
      900,
      130
    ],
    [
      1085,
      130
    ],
    [
      1085,
      282
    ],
    [
      1068,
      300
    ],
    [
      1068,
      414
    ],
    [
      1076,
      418
    ],
    [
      1076,
      446
    ],
    [
      1032,
      483
    ],
    [
      905,
      451
    ],
    [
      905,
      421
    ],
    [
      913,
      413
    ],
    [
      913,
      297
    ],
    [
      900,
      290
    ]
  ],
  "backgroundRestoration": "alpha=0 dans l’ancien emplacement et son ombre détachée, au-dessus de la courbe du livre ; livre protégé avec marge 12 px avant les premiers pixels blancs",
  "pageWhiteEdgeSamples": [
    [
      790,
      486
    ],
    [
      810,
      479
    ],
    [
      830,
      474
    ],
    [
      850,
      472
    ],
    [
      870,
      472
    ],
    [
      890,
      474
    ],
    [
      910,
      477
    ],
    [
      950,
      486
    ],
    [
      990,
      497
    ],
    [
      1030,
      510
    ],
    [
      1085,
      519
    ],
    [
      1110,
      522
    ],
    [
      1140,
      526
    ]
  ],
  "pageEdgeMargin": 12,
  "localColourChanges": false
}
```


**Nuit — master final** : `FOR-03.nuit.png`.

SHA-256 livré : `a3d448750c3db34393415e6b3585631ffa70874daaa32be99e9759116107d35a`.

Master copié depuis ce PNG natif, sans retouche raster après cette dernière génération.


#### FOR-04

Sujet : **Studying computing**. Date : **13 octobre 2026**. Provenance : `image_gen`.

Fichiers livrés : [`FOR-04.png`](FOR-04.png) et [`FOR-04.nuit.png`](FOR-04.nuit.png).


<details>
<summary>Prompt initial enregistré du jour</summary>

Source native : `/Users/charles/.codex/generated_images/01a136b9-d2db-7fb2-a10c-6fc43794bbfd/exec-c9f9b92a-75ac-418e-a147-41f93918704d.png`.

SHA-256 natif : `4f3990c1d347c1c561855045f940db7ad795cc0f9d157cfc8c149aeec069ac3f`.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

Transparent background: nothing is drawn outside the subject.

Subject: Studying computing.
Composition: One main object: a large raised flowchart decision diamond with exactly two short arrows leaving it. A small lantern at the upper right lights its face.

Framing: exact 1:1 canvas, 1280 × 1280. Three-quarter view, one main object occupying 80% of the square, no horizon, extremely bold silhouettes with main lines about 10 px at 384 px, no fine hatching, readable at 56 px. Keep all objects uncut, inside a clear margin. HARD lantern registration: the centre of its RED FLAME must be at x=78% of total width and y=22% of total height from the top-left, within 3 percentage points on each axis. This is the flame centre, not the base or the top ring. Make the lantern small enough for its ring, cage and base to fit around this exact point. The main subject occupies at least 60% of the frame. Pure red is only a few simple hatch strokes on the lit main object and the flame. No light rays, radial marks, halo, glow or microtexture; no wood grain or fake text.

The four attached images are references only: images 1 and 2 define the recurring hand-cut style and lantern motif; images 3 and 4 define the simple square four-post lantern, top ring and drop-shaped flame. Do not copy their book, lettering, colours, rays or glow. No marks outside the subject.

This scene contains ZERO people, human figures, bodies or hands. Objects only. Keep the lantern small and use its exact flame-centre registration as the primary layout anchor.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

</details>


<details>
<summary>Prompt exact du jour retenu</summary>

Source native : `/Users/charles/.codex/generated_images/01a136b9-d2db-7fb2-a10c-6fc43794bbfd/exec-c0e41a33-a2f5-4804-bb5f-82ce81c39bf1.png`.

SHA-256 natif : `10a1912f859d2d051835bba0c1d7f0067be2f6cfb149fddd706d3831dadb6a6c`.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.
Transparent background: nothing is drawn outside the subject.
EDIT ONLY image1, the native day illustration. Translate the ENTIRE illustration (flowchart diamond, both arrows and lantern together) UP by exactly 32 pixels and RIGHT by exactly 15 pixels. Keep their size and arrangement, simply reframe this complete group. The final red flame centre must be x=75.7%, y=24.6%, within the desired target78/22±3. Keep all shapes uncut. Do not detach the lantern from its support. Do not add or remove objects. No labels, no guide marks. Images2–5 are references only; preserve image1 subjects.
Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

</details>


<details>
<summary>Prompt exact de la nuit retenue</summary>

Source native : `/Users/charles/.codex/generated_images/01a136b9-d2db-7fb2-a10c-6fc43794bbfd/exec-a3834520-c40d-4b35-8b1e-bb024f678d1d.png`.

SHA-256 natif : `93b6ad012eb52864ed259faa015b83e2ac10ae60ed7cbea8fe044bf9f3b89cca`.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

Transparent background: nothing is drawn outside the subject. Preserve the original transparency.

Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.

EDIT IMAGE 1, the supplied day master; images 2–5 are the lantern style references. Keep the exact native dimensions, canvas ratio, camera, crop, every object position, shape, size, overlap and pose of image 1. Do not produce a new composition. Only change ink coverage and illumination. Keep the red flame at its CURRENT actual position in image1, do not shift it. Replace broad white areas with SOLID PURE BLACK #000000, at least 80% of the OPAQUE subject pixels (not counting the transparent background). Use only sparse thin pure white outlines on existing edges outside the small lit pool. A few red hatch strokes light the main subject and a small pool around the lantern, following surfaces, never floating in the air. No large white areas. No diffuse glow, no rays, no halo, no texture or grain. Keep the background transparent, and retain opaque solid black inside the object silhouettes; do not turn the dark object interior transparent.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

</details>


**Jour — master final** : `FOR-04.png`.

SHA-256 livré : `980e5ac0d955940476229ddba4e21362d85204e8052fe1ab2cfd511d68b0dd82`.

Opérations locales retenues, coordonnées en pixels :


```json
{
  "id": "FOR-04",
  "variant": "jour",
  "date": "2026-10-13",
  "source": "/Users/charles/.codex/generated_images/01a136b9-d2db-7fb2-a10c-6fc43794bbfd/exec-c0e41a33-a2f5-4804-bb5f-82ce81c39bf1.png",
  "dest": "/Users/charles/Documents/GitHub/MonPortefolioV2/design/assets/visuels/parcours/FOR-04.png",
  "dimensions": [
    1254,
    1254
  ],
  "parameters": {
    "box": [
      862,
      0,
      1105,
      395
    ],
    "sourceToDestinationY": [
      [
        11,
        0
      ],
      [
        375,
        364
      ],
      [
        395,
        395
      ]
    ],
    "maxUpwardDisplacement": 11,
    "fixedBelowY": 395,
    "protected": "x<886 pour y>375, afin de conserver le bord du support",
    "sampling": "voisin le plus proche"
  },
  "note": "Haut et cage remontés de 11 px ; raccord progressif au pied fixe. Fond transparent conservé."
}
```


**Nuit — master final** : `FOR-04.nuit.png`.

SHA-256 livré : `0f3b39229a495297b626051e98cb78e15749c3ac697c6ce31a06ecb3dc0a5e6d`.

Opérations locales retenues, coordonnées en pixels :


```json
{
  "id": "FOR-04",
  "variant": "nuit",
  "date": "2026-10-13",
  "source": "/Users/charles/.codex/generated_images/01a136b9-d2db-7fb2-a10c-6fc43794bbfd/exec-a3834520-c40d-4b35-8b1e-bb024f678d1d.png",
  "dest": "/Users/charles/Documents/GitHub/MonPortefolioV2/design/assets/visuels/parcours/FOR-04.nuit.png",
  "dimensions": [
    1254,
    1254
  ],
  "parameters": {
    "box": [
      862,
      100,
      1105,
      395
    ],
    "sourceToDestinationY": [
      [
        100,
        100
      ],
      [
        200,
        195
      ],
      [
        370,
        365
      ],
      [
        395,
        395
      ]
    ],
    "maxUpwardDisplacement": 5,
    "fixedAboveY": 100,
    "fixedBelowY": 395,
    "protected": "x<886 pour y>375, afin de conserver le bord du support",
    "sampling": "voisin le plus proche"
  },
  "note": "Cage et flamme remontées de5px, raccords progressifs vers anneau et pied fixes. Fond transparent conservé."
}
```


#### FOR-05

Sujet : **Physics and chemistry**. Date : **13 octobre 2026**. Provenance : `image_gen`.

Fichiers livrés : [`FOR-05.png`](FOR-05.png) et [`FOR-05.nuit.png`](FOR-05.nuit.png).


<details>
<summary>Prompt exact du jour retenu</summary>

Source native : `/Users/charles/.codex/generated_images/01a136b9-d2db-7fb2-a10c-6fc43794bbfd/exec-52cca193-e091-41c8-b6ec-94b68edbd1ed.png`.

SHA-256 natif : `a7814046351a77fe8941b0816eb167ee74673b63df2af880419b2bf8ba484f35`.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

Transparent background: nothing is drawn outside the subject.

Subject: Physics and chemistry.
Composition: One main object: a half-filled conical laboratory flask. A small lantern at the upper right lights the liquid.

Framing: exact 1:1 canvas, 1280 × 1280. Three-quarter view, one main object occupying 80% of the square, no horizon, extremely bold silhouettes with main lines about 10 px at 384 px, no fine hatching, readable at 56 px. Keep all objects uncut, inside a clear margin. HARD lantern registration: the centre of its RED FLAME must be at x=76% of total width and y=28% of total height from the top-left, within 3 percentage points on each axis. This is the flame centre, not the base or the top ring. Make the lantern small enough for its ring, cage and base to fit around this exact point. The main subject occupies at least 60% of the frame. Pure red is only a few simple hatch strokes on the lit main object and the flame. No light rays, radial marks, halo, glow or microtexture; no wood grain or fake text.

The four attached images are references only: images 1 and 2 define the recurring hand-cut style and lantern motif; images 3 and 4 define the simple square four-post lantern, top ring and drop-shaped flame. Do not copy their book, lettering, colours, rays or glow. No marks outside the subject.

This scene contains ZERO people, human figures, bodies or hands. Objects only. Keep the lantern small and use its exact flame-centre registration as the primary layout anchor.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

</details>


<details>
<summary>Prompt exact de la nuit retenue</summary>

Source native : `/Users/charles/.codex/generated_images/01a136b9-d2db-7fb2-a10c-6fc43794bbfd/exec-bc1ad106-47a0-498d-af18-158e7a374c73.png`.

SHA-256 natif : `eb7e46d52e9d9172cd2516126e2e7c3a8b16a8720be1f074c210b82fc9755a69`.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

Transparent background: nothing is drawn outside the subject. Preserve the original transparency.

Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.

EDIT IMAGE 1, the supplied day master; images 2–5 are the lantern style references. Keep the exact native dimensions, canvas ratio, camera, crop, every object position, shape, size, overlap and pose of image 1. Do not produce a new composition. Only change ink coverage and illumination. Keep the red flame at its CURRENT actual position in image1, do not shift it. Replace broad white areas with SOLID PURE BLACK #000000, at least 80% of the OPAQUE subject pixels (not counting the transparent background). Use only sparse thin pure white outlines on existing edges outside the small lit pool. A few red hatch strokes light the main subject and a small pool around the lantern, following surfaces, never floating in the air. No large white areas. No diffuse glow, no rays, no halo, no texture or grain. Keep the background transparent, and retain opaque solid black inside the object silhouettes; do not turn the dark object interior transparent.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

</details>


**Jour — master final** : `FOR-05.png`.

SHA-256 livré : `a7814046351a77fe8941b0816eb167ee74673b63df2af880419b2bf8ba484f35`.

Master copié depuis ce PNG natif, sans retouche raster après cette dernière génération.


**Nuit — master final** : `FOR-05.nuit.png`.

SHA-256 livré : `eb7e46d52e9d9172cd2516126e2e7c3a8b16a8720be1f074c210b82fc9755a69`.

Master copié depuis ce PNG natif, sans retouche raster après cette dernière génération.


#### FOR-06

Sujet : **Studying networks and telecommunications**. Date : **13 octobre 2026**. Provenance : `image_gen`.

Fichiers livrés : [`FOR-06.png`](FOR-06.png) et [`FOR-06.nuit.png`](FOR-06.nuit.png).


<details>
<summary>Prompt initial enregistré du jour</summary>

Source native : `/Users/charles/.codex/generated_images/01a136b9-d2db-7fb2-a10c-6fc43794bbfd/exec-7c5078e2-744b-45aa-add2-efdfea8dfb91.png`.

SHA-256 natif : `bf47537cac95d1cc5db236b41a2a21b1d86be11425cc2066f40e4d8b9b30d9db`.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

Transparent background: nothing is drawn outside the subject.

Subject: Studying networks and telecommunications.
Composition: One main object: a network switch seen in three-quarter view with exactly three cables plugged into its front. A small lantern at the upper right lights the sockets. No equipment brand.

Framing: exact 1:1 canvas, 1280 × 1280. Three-quarter view, one main object occupying 80% of the square, no horizon, extremely bold silhouettes with main lines about 10 px at 384 px, no fine hatching, readable at 56 px. Keep all objects uncut, inside a clear margin. HARD lantern registration: the centre of its RED FLAME must be at x=76% of total width and y=26% of total height from the top-left, within 3 percentage points on each axis. This is the flame centre, not the base or the top ring. Make the lantern small enough for its ring, cage and base to fit around this exact point. The main subject occupies at least 60% of the frame. Pure red is only a few simple hatch strokes on the lit main object and the flame. No light rays, radial marks, halo, glow or microtexture; no wood grain or fake text.

The four attached images are references only: images 1 and 2 define the recurring hand-cut style and lantern motif; images 3 and 4 define the simple square four-post lantern, top ring and drop-shaped flame. Do not copy their book, lettering, colours, rays or glow. No marks outside the subject.

This scene contains ZERO people, human figures, bodies or hands. Objects only. Keep the lantern small and use its exact flame-centre registration as the primary layout anchor.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

</details>


<details>
<summary>Prompt exact du jour retenu</summary>

Source native : `/Users/charles/.codex/generated_images/01a136b9-d2db-7fb2-a10c-6fc43794bbfd/exec-06074319-e937-40f8-8591-d5290b97ec3c.png`.

SHA-256 natif : `7fd6ab2d777b1dd142599cdc917b49dba09bea7bda3d0acaf5acd8393f73992a`.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.
Transparent background: nothing is drawn outside the subject.
EDIT ONLY image1, the native day illustration. Translate the ENTIRE illustration (network switch, its exactly three cables and its lantern together) UP by exactly68 pixels and LEFT by exactly15 pixels. Keep group size and object arrangement, simply reframe this complete group. Final red flame centre x=78.5%, y=28.4%, within76/26±3. Keep every shape uncut. Do not detach lantern from switch. Do not add or remove objects. No labels, no guide marks. Images2–5 are references only; preserve image1 subjects.
Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

</details>


<details>
<summary>Édition de nuit avant assombrissement final</summary>

Source native : `/Users/charles/.codex/generated_images/01a136b9-d2db-7fb2-a10c-6fc43794bbfd/exec-adb3813a-78de-46eb-842f-57d2d306d931.png`.

SHA-256 natif : `03966a95d29871722bcc9d36699335bf4aae41738229f755048fb121903e0efd`.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

Transparent background: nothing is drawn outside the subject. Preserve the original transparency.

Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.

EDIT IMAGE 1, the supplied day master; images 2–5 are the lantern style references. Keep the exact native dimensions, canvas ratio, camera, crop, every object position, shape, size, overlap and pose of image 1. Do not produce a new composition. Only change ink coverage and illumination. Keep the red flame at its CURRENT actual position in image1, do not shift it. Replace broad white areas with SOLID PURE BLACK #000000, at least 80% of the OPAQUE subject pixels (not counting the transparent background). Use only sparse thin pure white outlines on existing edges outside the small lit pool. A few red hatch strokes light the main subject and a small pool around the lantern, following surfaces, never floating in the air. No large white areas. No diffuse glow, no rays, no halo, no texture or grain. Keep the background transparent, and retain opaque solid black inside the object silhouettes; do not turn the dark object interior transparent.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

</details>


<details>
<summary>Prompt exact de la nuit retenue</summary>

Source native : `/Users/charles/.codex/generated_images/01a136b9-d2db-7fb2-a10c-6fc43794bbfd/exec-1dec3d9f-c792-4788-87c0-53fac30fb6ab.png`.

SHA-256 natif : `bab8da0ad2f3ca6853f2ebec0eff5065771bd1a2a0ff791fc59edf3660652970`.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.
Transparent background: nothing is drawn outside the subject. Preserve existing transparency.
Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.
EDIT image1, the already NIGHT network switch illustration. Preserve every object at exactly the same coordinates. Reduce WHITE INK coverage dramatically: the faces and three cables must have only sparse thin white contours; erase most dense white hatch stripes and wide white borders on ports and cable plugs. At least85%of OPAQUE object pixels, not transparent background, must be visually solid black. Currently only67%passes; thin or remove more than half the white strokes, keep subject recognizable. Blacken large white side panes inside the lantern, leave red flame and sparse red hatching. Preserve camera, crop and1254square dimensions. Images2–5references only. Do not move flame or lantern at73.2/28.8%. No rays, glow or halo.
Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

</details>


**Jour — master final** : `FOR-06.png`.

SHA-256 livré : `7fd6ab2d777b1dd142599cdc917b49dba09bea7bda3d0acaf5acd8393f73992a`.

Master copié depuis ce PNG natif, sans retouche raster après cette dernière génération.


**Nuit — master final** : `FOR-06.nuit.png`.

SHA-256 livré : `bab8da0ad2f3ca6853f2ebec0eff5065771bd1a2a0ff791fc59edf3660652970`.

Master copié depuis ce PNG natif, sans retouche raster après cette dernière génération.


#### FOR-07

Sujet : **A swimming pool ladder**. Date : **13 octobre 2026**. Provenance : `image_gen`.

Fichiers livrés : [`FOR-07.png`](FOR-07.png) et [`FOR-07.nuit.png`](FOR-07.nuit.png).


<details>
<summary>Prompt initial enregistré du jour</summary>

Source native : `/Users/charles/.codex/generated_images/01a136b9-d2db-7fb2-a10c-6fc43794bbfd/exec-102af974-a66a-4da8-b860-583dcbe34964.png`.

SHA-256 natif : `eaec581a8f54a3b303081b6e274bb3dc1cf6732a84b3ce27a086b405ab0e3ae0`.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

Transparent background: nothing is drawn outside the subject.

Subject: A swimming pool ladder.
Composition: One main object: a swimming pool ladder, two curved side rails and exactly three rungs descending into flat-filled water. A small lantern sits on the pool edge at the upper right and lights the top rung. No logo or school name.

Framing: exact 1:1 canvas, 1280 × 1280. Three-quarter view, one main object occupying 80% of the square, no horizon, extremely bold silhouettes with main lines about 10 px at 384 px, no fine hatching, readable at 56 px. Keep all objects uncut, inside a clear margin. HARD lantern registration: the centre of its RED FLAME must be at x=78% of total width and y=24% of total height from the top-left, within 3 percentage points on each axis. This is the flame centre, not the base or the top ring. Make the lantern small enough for its ring, cage and base to fit around this exact point. The main subject occupies at least 60% of the frame. Pure red is only a few simple hatch strokes on the lit main object and the flame. No light rays, radial marks, halo, glow or microtexture; no wood grain or fake text.

The four attached images are references only: images 1 and 2 define the recurring hand-cut style and lantern motif; images 3 and 4 define the simple square four-post lantern, top ring and drop-shaped flame. Do not copy their book, lettering, colours, rays or glow. No marks outside the subject.

This scene contains ZERO people, human figures, bodies or hands. Objects only. Keep the lantern small and use its exact flame-centre registration as the primary layout anchor.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

</details>


<details>
<summary>Prompt exact du jour retenu</summary>

Source native : `/Users/charles/.codex/generated_images/01a136e5-3bd9-7711-8c97-0929271adc60/exec-e016a122-bf8e-4227-a923-fbe46bc8ec16.png`.

SHA-256 natif : `70bf4e4e0bade01b6f048dafdc991bd8b4d4fa96e6c18ca4c37070bc8745f232`.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

Transparent background: nothing is drawn outside the subject. Preserve original transparency.

EDIT IMAGE 1, the supplied square swimming-pool ladder illustration. The other four attached images are style references only. Preserve the exact square canvas, exact camera angle, crop, two curved side rails, stone pool rim, lantern, water and every existing object position. Make just this precise construction correction: add ONE clearly visible third ladder rung in the empty gap halfway between the two existing rungs. It must be the same simple thick bar in the same perspective and join the same two rails. The existing top rung runs from approximately (390,545) to (703,620); the existing bottom rung runs from approximately (390,730) to (702,810). Add the new middle rung from approximately (390,638) to (702,716). Thus the final ladder has exactly THREE distinct equally spaced rungs, all visible above the water: upper, middle, lower. Keep the old two rungs untouched. Do not draw a fourth rung. Do not change the lantern or its position. Do not change the canvas dimensions. No additional objects.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

</details>


<details>
<summary>Édition de nuit depuis le jour corrigé</summary>

Source native : `/Users/charles/.codex/generated_images/01a136e5-3bd9-7711-8c97-0929271adc60/exec-c73c8203-a4b7-4105-b94f-4a7501ebe690.png`.

SHA-256 natif : `6146597c412550f8dcc967a4c29c6006fc66aa6adc1ff770e575d5340a7cecb6`.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

Transparent background: nothing is drawn outside the subject. Preserve the original transparency.

Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.

EDIT IMAGE 1, the supplied final corrected day master. Images 2–5 are style references only. Keep the exact 1254×1254 pixel canvas, square crop, camera and framing. Preserve the EXACT geometry and placement of the two curved rails, exactly THREE visible ladder rungs, stone pool rim, water and small lantern. Never add or remove any rung. The lantern flame centre must remain exactly where it is in image 1: x=80.64% and y=26.44% of the full canvas; don't shift or enlarge the lantern. Change only illumination and ink coverage. At least 85% of OPAQUE subject pixels must be solid pure black; retain transparency outside the subject and inside every existing transparent gap, including the holes above the pool between the curved rails. Sparse thin white outline on the existing rail edges, the existing three rung edges and water ripples; do not retain broad white rail or water bands. A few simple red hatch strokes only on the top rung and the small pool immediately around the lantern on the stone rim. No giant white areas, no diffuse red wash, no halo. Main object stays black and opaque, not transparent.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

</details>


<details>
<summary>Prompt exact de la nuit retenue</summary>

Source native : `/Users/charles/.codex/generated_images/01a136e5-3bd9-7711-8c97-0929271adc60/exec-f307f80d-e24c-4c5a-b9ce-8adf7d4f6ccf.png`.

SHA-256 natif : `0caabedb704341e15712ea5da498503029390046eeb4b830e87fe6f55fe4f065`.

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless. Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.

Transparent background: nothing is drawn outside the subject. Preserve the original transparency.

Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.

EDIT IMAGE 1, the night variant derived from the corrected day. Reference images 2–5 are only style references. Keep exact 1254×1254 canvas, precise framing and placement of every existing outline, rail, all THREE rungs, stone rim and lantern. Keep the red flame exactly at x80.65%, y26.52%. There are too many white hatch lines and broad white water stripes. Make ONLY these night-value corrections: fill all broad white water reflection bands with solid opaque pure black, retaining only occasional hairline white ripples along their existing boundaries. Erase 90% of the white diagonal hatching on the stone deck, wall tiles and metal rails by filling it with opaque black; keep the outer edge contours and a few sparse thin white lines. The solid black dominates at least 85% of opaque subject area. Do not alter alpha outside the subject, do not remove any object, do not turn the subject transparent. Preserve the small red illumination around the lantern and upper rung. No broad white water stripes, no grey wash, no global airbrush.

Negative prompt: text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red, glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines
```

</details>


**Jour — master final** : `FOR-07.png`.

SHA-256 livré : `27b6ed8be5e8be76e69be7a74d49a54ee8b1a2fe35a6017c233c99aaedcbefcb`.

Opérations locales retenues, coordonnées en pixels :


```json
{
  "source": "/Users/charles/.codex/generated_images/01a136e5-3bd9-7711-8c97-0929271adc60/exec-e016a122-bf8e-4227-a923-fbe46bc8ec16.png",
  "output": "/Users/charles/Documents/GitHub/MonPortefolioV2/design/assets/visuels/parcours/FOR-07.png",
  "canvas": [
    1254,
    1254
  ],
  "translation": [
    -16,
    -16
  ],
  "mask": "<circle cx=\"1030\" cy=\"207\" r=\"36\"/><polygon points=\"1013,232 1047,232 1049,245 1100,272 1100,293 1092,299 1092,402 1105,408 1105,442 1075,465 958,448 958,418 968,403 968,299 962,296 962,274 1012,242\"/>",
  "maskStroke": 2,
  "restoration": "transparence au-dessus du bord de piscine ; clonage voisin (35,7) px sur le bord de piscine, (−50,30) px sous la base ; scène originale hors masque",
  "edgeLine": [
    0.21,
    193
  ]
}
```


**Nuit — master final** : `FOR-07.nuit.png`.

SHA-256 livré : `0caabedb704341e15712ea5da498503029390046eeb4b830e87fe6f55fe4f065`.

Master copié depuis ce PNG natif, sans retouche raster après cette dernière génération.

## Retouches déterministes du 14 octobre 2026

Corrections demandées par l’audit des images et la relecture en situation, faites dans le dépôt avec Pillow (Python), sans génération ni édition générative : les opérations ci-dessous, aux coordonnées en pixels des masters. Les masters retouchés remplacent les précédents ; `npm run visuels:rendre <ID>` a refait leurs rendus.

| Fichier | Opération | Après |
|---|---|---|
| `PRO-06.png` | Résidu du repère d’alignement : les colonnes 767 et 768, plus claires dans tous les noirs (≈ 99 contre ≈ 35 autour, de y ≈ 280 à 960), remplacées sur toute la hauteur par l’interpolation linéaire entre les colonnes 766 et 769. Nuit inchangée. | Plus de trait vertical dans la lanterne, le toit, le socle ni la règle. |
| `CMP-04.nuit.png` | Recalage sur le jour : redimensionné en 1191 × 1216 px (Lanczos), collé sur une toile transparente de 1254 × 1254 au décalage (+32, −16) px. | Superposition des silhouettes opaques avec le jour : IoU 0,85 → 0,97 ; points d’interrogation, cadres, accolade, crayon et lanterne coïncident. |
| `FOR-04.png`, `FOR-04.nuit.png` | Marge transparente d’environ 3,5 % : chaque master posé au centre d’une toile de 1340 × 1340 px, puis ramené à 1254 × 1254 (Lanczos), à l’identique le jour et la nuit. | Boîte du jour (0, 1, 1238, 1226) → (40, 41, 1199, 1188) : l’anneau et les pointes des flèches respirent. Flamme vers 76 × 26 %, reportée dans la composition du registre. |
