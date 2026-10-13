# Visuels à générer — commande de production

> **Fichier généré** depuis `site/src/config/visuels.ts` et l’état du disque par `npm run visuels:doc` (dans `site/`). Ne pas le corriger ici : corriger le registre ou livrer le fichier, puis relancer la commande. `npm run visuels` liste ce qu’il reste à produire, `npm run visuels -- --verifier` contrôle ce qui est livré.

## La mission

Tu produis **uniquement les images générées (IMG)** de la refonte du portfolio de Charles Lindecker : la **partie 1** en donne la file, « socle » d’abord, puis les fiches. Les autres fiches (dessins vectoriels, figures codées, captures, photos, images de partage) sont du contexte : l’équipe s’en charge (**partie 2**).

- Le registre recense **176 emplacements** (122 « socle », 54 « élargi »), dont **74 images à générer** : 74 restent à livrer, dont 60 « socle ».
- **Socle** : posé sur une page du site, qui affiche un cadre hachuré tant que le fichier manque. À produire d’abord.
- **Élargi** : aucune page ne l’attend encore ; chaque fiche dit pourquoi. Peut suivre.
- Le prompt d’une image se rédige en anglais : le bloc de style, la phrase de fond, puis la traduction des seuls champs **Sujet** et **Composition** de la fiche, enfin le prompt négatif. Le champ **Emplacement** donne le contexte et peut nommer une marque ou un jeu : il ne va jamais dans un prompt.

## Avant de commencer

**1. Le bloc de style**, identique pour tous les prompts, à recopier tel quel en tête :

```text
Reserve wood engraving, as in an old printed book: crisp hand-cut lines, parallel and cross hatching for every shadow, no gradient, no airbrush, no glow. Exactly three flat key colours: pure black #000000 for every line and hatch (the ink layer), pure white #FFFFFF for paper and lit surfaces (the flat layer), pure red #FF0000 only for the flame and the light it casts (the light layer); no other colour and no grey wash. A single hand lantern, a square cage with four posts, a ring on top and a drop-shaped flame, is the only light source of the scene: it lights one thing and everything else falls into hatched shadow. People are faceless silhouettes. Calm, sober, timeless.
```

Suivi de la phrase de fond que la fiche demande :

- fond transparent : `Transparent background: nothing is drawn outside the subject.`
- fond rempli d’aplat : `The scene fills the frame edge to edge; empty areas are white paper.`

**2. Le prompt négatif**, joint à chaque génération :

```text
text, letters, numbers, digits, signature, watermark, logo, brand mark, recognisable face, portrait, real person, character, card or symbol from an existing game or franchise, ornate gold frame, decorative border, gradient, soft glow, airbrush, photographic or 3D render, grey shading, any colour other than black, white and red
```

**3. Les références à joindre** au générateur, pour la main du trait et le modèle de la lanterne :

- `design/assets/marque/livre-lanterne/logo-illustre.png` : le logo validé : la lanterne et le livre, la main du trait
- `site/src/assets/marque/logo-symbole.webp` : l’emblème seul, tel que le site l’affiche
- `site/src/assets/visuels/accueil/ACC-14.svg` : trois lanternes du même modèle, au trait de la direction
- `site/src/assets/visuels/global/GLO-03.svg` : la lanterne de la bascule : cage à quatre montants, anneau, flamme en goutte

Un SVG se joint rendu en PNG : `node -e "require('sharp')(process.argv[1],{density:300}).png().toFile(process.argv[2])" <fichier.svg> <sortie.png>` (dans `site/`).

**4. Étape 0, la planche d’essai** : générer d’abord `ACC-03`, `PVZ-05`, `CMP-02`, une scène, une vignette de carte et une vignette de compétence, puis s’arrêter et les montrer à Charles. La série ne se lance qu’après sa validation du style, du trait et des couleurs de clé.

**5. Une lanterne en gras** dans une fiche est une contrainte dure : la lumière animée du site part de ce point. La vérifier en calquant l’image livrée sur la position donnée (en % de la largeur et de la hauteur, depuis le coin haut gauche).

## Règles communes

1. **Aucune propriété intellectuelle de tiers** : aucun personnage, logo, carte ou décor reconnaissable (PvZ, Riot, Sony, FromSoftware, 42, Trello, B-Hive, Elan, ATIS, Mission Locale, Shrek). Ne jamais nommer un jeu, un studio ou une marque dans le prompt.
2. **Jamais de visage de Charles généré** ; les personnages sont des silhouettes sans visage. Les portraits sont ses quatre vraies photos (détourage, bichromie et filtres déterministes seulement).
3. **Aucun texte dans l’image**, chiffres compris : les libellés, dates et légendes sont en HTML.
4. **Jamais une image générée présentée comme une capture ou comme une donnée** : les courbes, frises et schémas chiffrés sont des figures codées (FIG), les écrans sont des captures réelles (CAP).
5. **Une seule famille de style**, celle de la direction « Lanterne », retenue le 13 octobre 2026 (`design/refonte/c-lanterne/`) : **gravure en réserve**, trait clair sur fond sombre la nuit et inversé le jour ; la lanterne comme seule source de lumière de la scène, qui éclaire une seule chose et laisse le reste dans l’ombre. Même trait, même lumière, même angle par série (voir « Séries »). Aucun ornement de jeu, aucun cadre doré. La lanterne du logo est le motif récurrent des états (vide, succès, 404).
6. **Jour et nuit, tranché le 13 octobre 2026** : chaque image est générée en trois couleurs de clé franches, encre `#000000`, aplat `#FFFFFF` et lumière `#FF0000`, sur fond transparent ou rempli d’aplat selon la fiche. `node tools/separer-calques.mjs <ID>` (dans `site/`) en tire trois calques, `<ID>_<l>x<h>.aplat.webp`, `.encre.webp` et `.lumiere.webp`, que `components/ui/Visuel.astro` doit superposer en masques colorés par `--surface`, `--encre` et `--lanterne` : l’image suit la bascule de thème sans double téléchargement ni script. Le même script écrit `<ID>_<l>x<h>.webp`, le rendu de jour, pour les contextes sans masque. Une image sans ses calques fait échouer `npm run visuels -- --strict` et les tests.
7. **Livrables** : le master PNG en couleurs de clé, à la définition du générateur et au ratio exact de la fiche (à 1 % près), dans `design/assets/visuels/<série>/<ID>.png` ; le script le met aux dimensions exactes du nom et écrit les WebP (qualité 82, alpha conservé) dans `site/src/assets/visuels/<série>/`. Poids d’un WebP : 40 Ko au plus jusqu’à 480 px de grand côté, 120 Ko jusqu’à 1 200 px, 250 Ko au-delà. Prompt, date et provenance consignés dans `design/assets/visuels/<série>/README.md` et `site/src/assets/visuels/<série>/README.md`.
8. **Lisibilité mobile** : le sujet principal occupe au moins 60 % du cadre et se comprend à 390 px.

Exceptions à la règle 3 : le nom dans les déclinaisons du logo, et les images de partage (OG), composées en vraie typographie.

## Séries

Chaque image générée appartient à une seule série : mêmes angle, horizon, trait et place de la lanterne pour toutes ses images, vues côte à côte. Une exception est écrite ici, jamais improvisée.

| Série | Images | Angle | Horizon | Trait | Lanterne |
|---|---|---|---|---|---|
| Scènes du récit | ACC-03, ACC-04, ACC-05, ACC-07, ACC-08, ACC-09, ACC-11, ACC-16 | trois quarts en léger surplomb ; exceptions : ACC-04 vue de dessus (une table), ACC-08 de face (un mur droit) | aux deux tiers de la hauteur (aucun en vue de dessus) | trait principal d’environ 3 px à 1 800 px de large, hachures d’environ 1 px | posée dans la scène, à la position de la fiche ; contrainte dure pour les scènes animées |
| Cartes de la méthode | ACC-18, ACC-19, ACC-20 | vue frontale, légère contre-plongée | au tiers bas | trait principal d’environ 4 px à 1 200 px de large, hachures larges : lisible à 165 px | au premier plan, à la position de la fiche (contrainte dure) |
| Le pôle, en trois scènes | ACC-21, ACC-22, ACC-23 | trois quarts, à hauteur d’épaule ; même décor et mêmes silhouettes d’une scène à l’autre | à mi-hauteur | trait principal d’environ 4 px à 1 800 px de large, peu de hachures : lisible à 300 px | à la position de la fiche (contrainte dure) |
| Vitrine des projets | PRJ-01, PRJ-02, PRJ-06, PRJ-07, PRJ-08, PRJ-09, PRJ-10, PRJ-11, PRJ-12 | de face en légère plongée | aux deux tiers de la hauteur | trait principal d’environ 3 px à 1 600 px de large, hachures d’environ 1 px ; plus épais pour les vignettes « Aussi » (lisibles à 300 px) | posée bas dans le cadre, à la position de la fiche |
| PvZ Fusion, scènes | PVZ-01, PVZ-02a, PVZ-02b, PVZ-02c, PVZ-09, PVZ-10 | trois quarts en légère plongée ; exception : PVZ-09 de profil | à mi-hauteur | trait principal d’environ 3 px à 1 600 px de large | sur la table, à la position de la fiche |
| Vignettes à motif unique | PVZ-04, PVZ-05, PVZ-06, PVZ-07, PVZ-08, PVZ-11 | trois quarts, motif centré | aucun : fond transparent | trait épais, environ 8 px à 480 px de large, peu de hachures : lisible à 96 px | petite, à côté du motif |
| Pages de projet | LOD-02, LOD-04, OMN-01, BLR-01, BLR-03, BLR-04, BLR-05, GUP-01, GUP-03 | trois quarts en légère plongée ; exceptions : LOD-02 et BLR-04 de face, LOD-04 en coupe horizontale | aux deux tiers de la hauteur | trait principal d’environ 3 px à 1 600 px de large | à la position de la fiche |
| Parcours | PAR-01, PAR-02, PAR-03, PRO-01, PRO-02, PRO-03, PRO-04, PRO-05, PRO-06, FOR-01, FOR-02, CMP-01 | trois quarts en légère plongée ; exception : CMP-01 de face (un panneau au mur) | aux deux tiers de la hauteur | trait principal d’environ 3 px à 1 800 px de large, hachures d’environ 1 px | posée dans la scène, à la position de la fiche |
| Compétences humaines | CMP-02, CMP-03, CMP-04, CMP-05, CMP-06, CMP-07, CMP-08 | de face, un seul objet centré | au tiers bas, identique pour les sept | trait d’environ 6 px à 480 px de large : lisible à 160 px | petite, au bord de l’objet |
| Stations de la formation | FOR-03, FOR-04, FOR-05, FOR-06, FOR-07 | trois quarts, un seul objet | aucun : fond transparent | trait épais, environ 10 px à 384 px de large, aucune hachure fine : lisible à 56 px | petite, en haut à droite |
| États et lanterne du logo | CON-01, CON-02, CON-03, BLG-01, BLG-02, ERR-01 | de face, en légère plongée | aucun : fond transparent (BLG-02 en aplat) | trait régulier, environ 6 px à 480 px de large | la lanterne du logo (cage à quatre montants, anneau, flamme en goutte), sujet de la scène |

## Méthodes

| Méthode | Nature | Consigne |
|---|---|---|
| IMG | Image générée | Générer l’image avec Codex en trois couleurs de clé (règle 6), déposer le master PNG, puis lancer `node tools/separer-calques.mjs <ID>` dans `site/`. |
| SVG | Dessin vectoriel | Dessiner à la main : trait constant, `currentColor`, sans `<text>`, un `<title>` neutre en français. Ne jamais vectoriser une image générée. Un lot est un sprite : un `<symbol id>` par pièce, aux identifiants de la fiche. |
| FIG | Figure codée | Coder depuis des données sourcées. Jamais générée : pas de fichier image à produire ici. |
| CAP | Capture réelle | Capturer l’application ou la page réelle. Jamais une image générée présentée comme une capture. |
| PHO | Photo réelle | Photo réelle de Charles : détourage, bichromie et filtres déterministes seulement. Jamais régénérée. |
| OG | Image de partage | Composer en HTML avec la vraie typographie, puis rendre en PNG de 1 200 × 630. |

## Livraison

- **Image générée** : le master PNG en trois couleurs de clé (encre `#000000`, aplat `#FFFFFF`, lumière `#FF0000`), à la définition du générateur et au ratio exact de la fiche (à 1 % près), dans `design/assets/visuels/<série>/<ID>.png`. Puis, dans `site/` : `node tools/separer-calques.mjs <ID>`. Le script met l’image aux dimensions exactes du nom et écrit, en WebP qualité 82 avec alpha, le rendu `<ID>_<largeur>x<hauteur>.webp` et ses trois calques `.aplat.webp`, `.encre.webp`, `.lumiere.webp`, que le site colore : l’aplat par `--surface`, l’encre par `--encre`, la lumière par `--lanterne`.
- **Poids d’un WebP** (rendu et chaque calque), selon son plus grand côté : 40 Ko jusqu’à 480 px, 120 Ko jusqu’à 1 200 px, 250 Ko au-delà.
- **Dessin vectoriel** : `<ID>.svg`, au chemin attendu. Un lot est un sprite : un `<symbol id>` par pièce, aux identifiants listés par la fiche (« Pièces du fichier »).
- **Image de partage** : `public/og/<ID>_1200x630.png`, ou les fichiers nommés par la fiche quand elle en attend plusieurs.
- **Provenance** : pour chaque fichier, une ligne du tableau `Fichier | Prompt | Date | Provenance` de `design/assets/visuels/<série>/README.md` et de `site/src/assets/visuels/<série>/README.md`.
- **Vérifier** avec `npm run visuels -- --verifier` (dans `site/`) : dimensions annoncées par le nom, ratio, fond transparent, poids, calques, pièces d’un SVG. Puis relancer `npm run visuels:doc` : le visuel livré sort des files.

## Vue d’ensemble

| Série | Emplacements | Socle | Méthodes |
|---|---|---|---|
| Identité et éléments globaux | 13 | 6 | IMG 0 · SVG 11 · FIG 0 · CAP 0 · PHO 0 · OG 2 |
| Accueil | 23 | 17 | IMG 15 · SVG 3 · FIG 3 · CAP 1 · PHO 1 · OG 0 |
| Projets (vitrine) | 12 | 10 | IMG 10 · SVG 0 · FIG 0 · CAP 2 · PHO 0 · OG 0 |
| PvZ Fusion | 26 | 17 | IMG 13 · SVG 0 · FIG 6 · CAP 6 · PHO 0 · OG 1 |
| League Of Data Base | 24 | 16 | IMG 3 · SVG 9 · FIG 6 · CAP 6 · PHO 0 · OG 0 |
| Omnicard | 13 | 5 | IMG 2 · SVG 2 · FIG 3 · CAP 5 · PHO 0 · OG 1 |
| Bloodborne Legendary Run | 16 | 8 | IMG 4 · SVG 6 · FIG 1 · CAP 4 · PHO 0 · OG 1 |
| gup | 7 | 6 | IMG 2 · SVG 1 · FIG 3 · CAP 1 · PHO 0 · OG 0 |
| Parcours : hub, professionnel, compétences, formation | 33 | 30 | IMG 24 · SVG 4 · FIG 3 · CAP 1 · PHO 1 · OG 0 |
| Contact | 4 | 4 | IMG 3 · SVG 0 · FIG 0 · CAP 0 · PHO 1 · OG 0 |
| Blog | 2 | 1 | IMG 2 · SVG 0 · FIG 0 · CAP 0 · PHO 0 · OG 0 |
| États : 404 et hors ligne | 3 | 2 | IMG 1 · SVG 1 · FIG 0 · CAP 0 · PHO 1 · OG 0 |
| **Total** | **176** | **122** | IMG 79 · SVG 37 · FIG 25 · CAP 26 · PHO 4 · OG 5 |

## Partie 1 — Commande Codex : les images à générer

**Déjà livrées** : aucune.

**File « socle »**, dans l’ordre des séries :

- Accueil : ACC-03, ACC-04, ACC-08, ACC-09, ACC-11, ACC-18, ACC-19, ACC-20, ACC-21, ACC-22, ACC-23
- Projets (vitrine) : PRJ-01, PRJ-02, PRJ-06, PRJ-07, PRJ-08, PRJ-10, PRJ-11
- PvZ Fusion : PVZ-01, PVZ-02a, PVZ-02b, PVZ-02c, PVZ-04, PVZ-05, PVZ-06, PVZ-07, PVZ-08, PVZ-11
- League Of Data Base : LOD-04
- Omnicard : OMN-01
- Bloodborne Legendary Run : BLR-01
- gup : GUP-01
- Parcours : hub, professionnel, compétences, formation : PAR-01, PAR-02, PAR-03, PRO-01, PRO-02, PRO-03, PRO-04, PRO-05, PRO-06, CMP-02, CMP-03, CMP-04, CMP-05, CMP-06, CMP-07, CMP-08, FOR-01, FOR-02, FOR-03, FOR-04, FOR-05, FOR-06, FOR-07
- Contact : CON-01, CON-02, CON-03
- Blog : BLG-01
- États : 404 et hors ligne : ERR-01

**File « élargi »**, dans l’ordre des séries :

- Accueil : ACC-05, ACC-07, ACC-16
- Projets (vitrine) : PRJ-09, PRJ-12
- PvZ Fusion : PVZ-09, PVZ-10
- League Of Data Base : LOD-02
- Bloodborne Legendary Run : BLR-03, BLR-04, BLR-05
- gup : GUP-03
- Parcours : hub, professionnel, compétences, formation : CMP-01
- Blog : BLG-02

### Socle · Accueil

#### ACC-03 · Démonter de vieux PC avec son père

- **Priorité** : socle · **Méthode** : IMG, à générer (image) · **Série** : Scènes du récit
- **Produit par** : Codex
- **Emplacement** : `/` · 01, le terrain de jeu : scène « Un vieux PC, en vue éclatée », rejouable au clic _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/pages/index.astro`
- **Sujet** : Démonter de vieux PC avec son père
- **Composition (pour le prompt)** : Établi d’atelier vu de trois quarts, en léger surplomb : une vieille tour de PC ouverte au centre ; son panneau latéral, la carte mère, le disque dur et deux vis sortis et disposés en vue éclatée, chacun relié à sa place par un fin pointillé de montage ; deux paires de mains, celles d’un adulte et celles d’un enfant d’une dizaine d’années, tiennent chacune une pièce ; une lanterne posée sur l’établi, à gauche (vers 28 % de la largeur et 58 % de la hauteur), seule source de lumière, éclaire les pièces ; le fond de l’atelier reste en réserve, sans détail ; aucune marque, aucune inscription, aucun visage
- **Lanterne : 28 % × 58 %, contrainte dure** : la lumière animée du site part de ce point (largeur × hauteur, depuis le coin haut gauche).
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = établi, pièces du PC et mains ; lumière (#FF0000) = flamme et pièces éclairées · **Fond** : rempli d’aplat
- **Cadrage (pour vérifier)** : Affichée en 3:2 jusqu’à 400 px de large, pleine largeur sur mobile : les pièces et les mains se lisent à cette taille.
- **Format** : 3:2, 1800 × 1200
- **Fichier attendu** : `site/src/assets/visuels/accueil/ACC-03_1800x1200.webp`
- **Master** : `design/assets/visuels/accueil/ACC-03.png` → `node tools/separer-calques.mjs ACC-03` écrit le rendu et `ACC-03_1800x1200.aplat.webp`, `ACC-03_1800x1200.encre.webp`, `ACC-03_1800x1200.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Une vieille tour de PC démontée sur un établi, ses pièces en vue éclatée, tenues par un adulte et un enfant. »
- **Note** : Scène animée : la lumière part de la lanterne, à l’endroit indiqué, à l’arrivée de la scène puis à chaque clic (components/accueil/Scene.astro). Remplace le dessin au trait de l’ancienne direction, dont elle reprend les pièces : référence de composition, design/assets/illustrations/pc-vue-eclatee.svg.

#### ACC-04 · Le jeu de cartes papier inventé avec son cousin

- **Priorité** : socle · **Méthode** : IMG, à générer (image) · **Série** : Scènes du récit
- **Produit par** : Codex
- **Emplacement** : `/` · 01, le terrain de jeu : scène « Les cartes, plastifiées à la main », rejouable au clic (et Omnicard § 2) _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/pages/index.astro`
- **Sujet** : Le jeu de cartes papier inventé avec son cousin
- **Composition (pour le prompt)** : Table d’après-midi d’été vue de dessus : piles de cartes imprimées, une plastifieuse d’où sort une carte glissée dans sa pochette transparente, ciseaux, cartes déjà plastifiées aux coins cornés, une feuille de règles griffonnée illisible ; deux paires de mains d’adolescents, l’une glisse une carte dans la plastifieuse, l’autre en découpe une ; une lanterne posée en haut à droite de la table (vers 78 % de la largeur et 26 % de la hauteur) éclaire la carte qui sort ; faces de cartes génériques, faites de formes simples, sans personnage, sans chiffre, sans texte
- **Lanterne : 78 % × 26 %, contrainte dure** : la lumière animée du site part de ce point (largeur × hauteur, depuis le coin haut gauche).
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = table, cartes, plastifieuse et mains ; lumière (#FF0000) = flamme et carte qui sort · **Fond** : rempli d’aplat
- **Cadrage (pour vérifier)** : Affichée en 3:2 jusqu’à 400 px de large sur l’accueil et 480 px sur la page Omnicard (OMN-02) : la carte qui sort se lit à cette taille.
- **Format** : 3:2, 1800 × 1200
- **Fichier attendu** : `site/src/assets/visuels/accueil/ACC-04_1800x1200.webp`
- **Master** : `design/assets/visuels/accueil/ACC-04.png` → `node tools/separer-calques.mjs ACC-04` écrit le rendu et `ACC-04_1800x1200.aplat.webp`, `ACC-04_1800x1200.encre.webp`, `ACC-04_1800x1200.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Des mains d’adolescents plastifient à la main des cartes imprimées, sur une table d’été. »
- **Note** : Scène animée de l’accueil, comme ACC-03 ; même image reprise par OMN-02.

#### ACC-08 · Les portes qui ne s’ouvrent pas

- **Priorité** : socle · **Méthode** : IMG, à générer (image) · **Série** : Scènes du récit
- **Produit par** : Codex
- **Emplacement** : `/` · 01, les portes : scène « Des voies essayées, puis une réorientation », rejouable au clic ; intitulés des cinq portes en HTML dessous _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/pages/index.astro`
- **Sujet** : Les portes qui ne s’ouvrent pas
- **Composition (pour le prompt)** : Un mur vu de face, droit, sans perspective : cinq portes alignées de gauche à droite, chacune au centre de son cinquième de la largeur ; les quatre premières, de formes et d’époques différentes, restent fermées ; la cinquième, à droite, est entrouverte et laisse passer la lumière d’une lanterne posée derrière elle (vers 90 % de la largeur et 52 % de la hauteur), qui s’étale sur le sol ; aucune inscription ni plaque
- **Lanterne : 90 % × 52 %, contrainte dure** : la lumière animée du site part de ce point (largeur × hauteur, depuis le coin haut gauche).
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = mur, portes et sol ; lumière (#FF0000) = flamme, porte entrouverte et lumière au sol · **Fond** : rempli d’aplat
- **Cadrage (pour vérifier)** : Même cadrage 21:9 sur mobile, qui garde les cinq portes alignées sur leurs intitulés en HTML (le recadrage 4:5 du cahier les coupait) : chaque porte au centre de son cinquième.
- **Format** : 21:9, 2100 × 900
- **Fichier attendu** : `site/src/assets/visuels/accueil/ACC-08_2100x900.webp`
- **Master** : `design/assets/visuels/accueil/ACC-08.png` → `node tools/separer-calques.mjs ACC-08` écrit le rendu et `ACC-08_2100x900.aplat.webp`, `ACC-08_2100x900.encre.webp`, `ACC-08_2100x900.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Cinq portes alignées : quatre restent fermées, la cinquième s’entrouvre sur la lumière. »
- **Note** : Scène animée de l’accueil, comme ACC-03 ; les intitulés des cinq portes sont en HTML sous chaque porte.

#### ACC-09 · Le programme parcouru au pas de course

- **Priorité** : socle · **Méthode** : IMG, à générer (image) · **Série** : Scènes du récit
- **Produit par** : Codex
- **Emplacement** : `/` · 01, la voie qui marche : scène « Un mois pour parcourir le programme DWWM », rejouable au clic _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/pages/index.astro`
- **Sujet** : Le programme parcouru au pas de course
- **Composition (pour le prompt)** : Un grand chronomètre posé au-dessus de trois grands dossiers empilés en perspective, ses aiguilles presque revenues à leur point de départ ; devant, un rouleau de diplôme noué d’un ruban et scellé ; une lanterne à gauche (vers 22 % de la largeur et 40 % de la hauteur) éclaire le rouleau ; cadran sans chiffre, dossiers sans inscription
- **Lanterne : 22 % × 40 %, contrainte dure** : la lumière animée du site part de ce point (largeur × hauteur, depuis le coin haut gauche).
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = dossiers, chronomètre et rouleau ; lumière (#FF0000) = flamme et rouleau éclairé · **Fond** : rempli d’aplat
- **Cadrage (pour vérifier)** : Affichée recadrée en 2:1 au centre sur ordinateur (la bande centrale de 1600 × 800) : tout le sujet et la lanterne tiennent dans cette bande, rien d’important dans le sixième du haut ni dans le sixième du bas ; entière, en 4:3, sur mobile.
- **Format** : 4:3, 1600 × 1200
- **Fichier attendu** : `site/src/assets/visuels/accueil/ACC-09_1600x1200.webp`
- **Master** : `design/assets/visuels/accueil/ACC-09.png` → `node tools/separer-calques.mjs ACC-09` écrit le rendu et `ACC-09_1600x1200.aplat.webp`, `ACC-09_1600x1200.encre.webp`, `ACC-09_1600x1200.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Un chronomètre posé sur trois grands dossiers, devant un rouleau de diplôme noué. »
- **Note** : Composition validée le 8 octobre 2026. Scène animée de l’accueil, comme ACC-03. Recadrée en 2:1 au-delà de 860 px (components/accueil/Scene.astro, propriété recadrage), entière en 4:3 en dessous.

#### ACC-11 · La classe vue depuis le pupitre du formateur

- **Priorité** : socle · **Méthode** : IMG, à générer (image) · **Série** : Scènes du récit
- **Produit par** : Codex
- **Emplacement** : `/` · 01, de l’autre côté du bureau : scène « Passer de l’apprenant au formateur », rejouable au clic _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/pages/index.astro`
- **Sujet** : La classe vue depuis le pupitre du formateur
- **Composition (pour le prompt)** : Une salle de formation vue de trois quarts depuis l’estrade, derrière l’épaule du formateur : au premier plan, le pupitre et la silhouette du formateur, de dos ; devant lui, une dizaine de postes en deux rangées, des apprenants en silhouettes sans visage, penchés sur leurs écrans ; au mur, un tableau couvert d’un schéma de trois blocs reliés (interface, service, base de données) dessiné au trait, sans aucun mot ; une lanterne posée sur le pupitre (vers 30 % de la largeur et 70 % de la hauteur) éclaire la salle depuis l’avant
- **Lanterne : 30 % × 70 %, contrainte dure** : la lumière animée du site part de ce point (largeur × hauteur, depuis le coin haut gauche).
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = salle, postes, tableau et silhouettes ; lumière (#FF0000) = flamme et salle éclairée depuis le pupitre · **Fond** : rempli d’aplat
- **Cadrage (pour vérifier)** : Affichée recadrée en 2:1 au centre sur ordinateur (la bande centrale de 1600 × 800) : tout le sujet et la lanterne tiennent dans cette bande, rien d’important dans le sixième du haut ni dans le sixième du bas ; entière, en 4:3, sur mobile.
- **Format** : 4:3, 1600 × 1200
- **Fichier attendu** : `site/src/assets/visuels/accueil/ACC-11_1600x1200.webp`
- **Master** : `design/assets/visuels/accueil/ACC-11.png` → `node tools/separer-calques.mjs ACC-11` écrit le rendu et `ACC-11_1600x1200.aplat.webp`, `ACC-11_1600x1200.encre.webp`, `ACC-11_1600x1200.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Une salle de formation vue depuis le pupitre : une dizaine de postes, un tableau couvert d’un schéma. »
- **Note** : Scène animée de l’accueil, comme ACC-03. Recadrée en 2:1 au-delà de 860 px (components/accueil/Scene.astro, propriété recadrage), entière en 4:3 en dessous.

#### ACC-18 · Lire le jeu

- **Priorité** : socle · **Méthode** : IMG, à générer (image) · **Série** : Cartes de la méthode
- **Produit par** : Codex
- **Emplacement** : `/` · 01, Gwent, la méthode : carte 1 « Lire le jeu », illustration dans la fenêtre du cadre de carte codé _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/components/accueil/FigureGwent.astro`
- **Sujet** : Lire le jeu
- **Composition (pour le prompt)** : Illustration de carte en hauteur : au sommet d’une colline, une silhouette de dos, sans visage, observe à la loupe une citadelle et des champs en damier en contrebas ; quelques repères en croix posés sur le paysage ; une lanterne posée à ses pieds (vers 35 % de la largeur et 72 % de la hauteur) éclaire la lentille ; ciel en aplat, sans astre ; aucune carte, aucun personnage, aucun symbole ni décor d’un jeu existant
- **Lanterne : 35 % × 72 %, contrainte dure** : la lumière animée du site part de ce point (largeur × hauteur, depuis le coin haut gauche).
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = colline, citadelle, champs et ciel ; lumière (#FF0000) = flamme et lentille de la loupe · **Fond** : rempli d’aplat
- **Cadrage (pour vérifier)** : Rien d’important dans les 8 % du bord, que recouvre le cadre de carte codé ; affichée de 165 à 210 px de large (environ 200 px dans la rangée défilante sur mobile) : sujet principal au centre, lisible en petit.
- **Format** : 2:3, 1200 × 1800
- **Fichier attendu** : `site/src/assets/visuels/accueil/ACC-18_1200x1800.webp`
- **Master** : `design/assets/visuels/accueil/ACC-18.png` → `node tools/separer-calques.mjs ACC-18` écrit le rendu et `ACC-18_1200x1800.aplat.webp`, `ACC-18_1200x1800.encre.webp`, `ACC-18_1200x1800.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Une silhouette observe une citadelle à la loupe, éclairée par sa lanterne. »
- **Note** : Série de trois cartes (ACC-18 à ACC-20) : même cadrage, même lumière, même main. Le cadre ouvragé, la valeur et le titre restent codés (components/accueil/FigureGwent.astro) ; la lumière part de la lanterne à l’arrivée de la carte puis à chaque clic.

#### ACC-19 · Tester mes idées

- **Priorité** : socle · **Méthode** : IMG, à générer (image) · **Série** : Cartes de la méthode
- **Produit par** : Codex
- **Emplacement** : `/` · 01, Gwent, la méthode : carte 2 « Tester mes idées », illustration dans la fenêtre du cadre de carte codé _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/components/accueil/FigureGwent.astro`
- **Sujet** : Tester mes idées
- **Composition (pour le prompt)** : Illustration de carte en hauteur : sur une table, trois feuilles d’essai qui se chevauchent, la première barrée d’une croix, la deuxième annotée, la troisième en cours et cochée ; une plume qui écrit sur la dernière, un encrier à côté ; une lanterne en haut à droite (vers 70 % de la largeur et 24 % de la hauteur) éclaire la feuille cochée ; aucune écriture lisible, aucun symbole d’un jeu existant
- **Lanterne : 70 % × 24 %, contrainte dure** : la lumière animée du site part de ce point (largeur × hauteur, depuis le coin haut gauche).
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = table et feuilles ; lumière (#FF0000) = flamme et feuille cochée · **Fond** : rempli d’aplat
- **Cadrage (pour vérifier)** : Comme ACC-18 : rien d’important dans les 8 % du bord ; lisible à 165 px de large.
- **Format** : 2:3, 1200 × 1800
- **Fichier attendu** : `site/src/assets/visuels/accueil/ACC-19_1200x1800.webp`
- **Master** : `design/assets/visuels/accueil/ACC-19.png` → `node tools/separer-calques.mjs ACC-19` écrit le rendu et `ACC-19_1200x1800.aplat.webp`, `ACC-19_1200x1800.encre.webp`, `ACC-19_1200x1800.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Trois feuilles d’essai, la première barrée, la dernière cochée sous la plume. »
- **Note** : Deuxième carte de la série ACC-18 à ACC-20.

#### ACC-20 · Prendre le contre-pied

- **Priorité** : socle · **Méthode** : IMG, à générer (image) · **Série** : Cartes de la méthode
- **Produit par** : Codex
- **Emplacement** : `/` · 01, Gwent, la méthode : carte 3 « Prendre le contre-pied », illustration dans la fenêtre du cadre de carte codé _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/components/accueil/FigureGwent.astro`
- **Sujet** : Prendre le contre-pied
- **Composition (pour le prompt)** : Illustration de carte en hauteur : un large chemin battu monte vers la droite, vide ; un sentier neuf part à contre-sens vers la gauche, éclairé par une lanterne tenue à bout de bras par une silhouette de dos, sans visage (vers 40 % de la largeur et 46 % de la hauteur) ; arbres en silhouette de part et d’autre, montagne en réserve au fond ; aucun symbole d’un jeu existant
- **Lanterne : 40 % × 46 %, contrainte dure** : la lumière animée du site part de ce point (largeur × hauteur, depuis le coin haut gauche).
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = chemins, arbres et montagne ; lumière (#FF0000) = flamme et sentier éclairé · **Fond** : rempli d’aplat
- **Cadrage (pour vérifier)** : Comme ACC-18 : rien d’important dans les 8 % du bord ; lisible à 165 px de large.
- **Format** : 2:3, 1200 × 1800
- **Fichier attendu** : `site/src/assets/visuels/accueil/ACC-20_1200x1800.webp`
- **Master** : `design/assets/visuels/accueil/ACC-20.png` → `node tools/separer-calques.mjs ACC-20` écrit le rendu et `ACC-20_1200x1800.aplat.webp`, `ACC-20_1200x1800.encre.webp`, `ACC-20_1200x1800.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Une silhouette éclaire à la lanterne un sentier qui part à contre-sens du chemin battu. »
- **Note** : Troisième carte de la série ACC-18 à ACC-20.

#### ACC-21 · Accueillir les nouveaux

- **Priorité** : socle · **Méthode** : IMG, à générer (image) · **Série** : Le pôle, en trois scènes
- **Produit par** : Codex
- **Emplacement** : `/` · 02, du solo au collectif : scène 1 « Accueillir », rejouable au clic _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/components/accueil/FigureCollectif.astro`
- **Sujet** : Accueillir les nouveaux
- **Composition (pour le prompt)** : Une porte ouverte sur une pièce de travail ; sur le seuil, une silhouette accueille d’un geste de la main une nouvelle venue qui arrive avec un sac en bandoulière ; quelques traces de pas mènent à la porte ; une lanterne accrochée au chambranle (vers 46 % de la largeur et 24 % de la hauteur) éclaire l’arrivante ; silhouettes sans visage, aucune inscription
- **Lanterne : 46 % × 24 %, contrainte dure** : la lumière animée du site part de ce point (largeur × hauteur, depuis le coin haut gauche).
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = porte, pièce et silhouettes ; lumière (#FF0000) = flamme et arrivante éclairée · **Fond** : rempli d’aplat
- **Cadrage (pour vérifier)** : Affichée de 300 à 360 px de large, empilée en pleine largeur sur mobile : sujet principal au centre, sans détail fin.
- **Format** : 3:2, 1800 × 1200
- **Fichier attendu** : `site/src/assets/visuels/accueil/ACC-21_1800x1200.webp`
- **Master** : `design/assets/visuels/accueil/ACC-21.png` → `node tools/separer-calques.mjs ACC-21` écrit le rendu et `ACC-21_1800x1200.aplat.webp`, `ACC-21_1800x1200.encre.webp`, `ACC-21_1800x1200.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Une silhouette accueille une nouvelle venue sur le seuil d’une porte éclairée. »
- **Note** : Série de trois scènes (ACC-21 à ACC-23) : même décor et mêmes silhouettes d’une scène à l’autre. La lumière part de la lanterne à l’arrivée puis à chaque clic (components/accueil/FigureCollectif.astro).

#### ACC-22 · Former et relire

- **Priorité** : socle · **Méthode** : IMG, à générer (image) · **Série** : Le pôle, en trois scènes
- **Produit par** : Codex
- **Emplacement** : `/` · 02, du solo au collectif : scène 2 « Former et relire », rejouable au clic _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/components/accueil/FigureCollectif.astro`
- **Sujet** : Former et relire
- **Composition (pour le prompt)** : Deux silhouettes côte à côte à une même table, penchées sur une feuille : l’une montre une ligne du doigt, l’autre la corrige au crayon ; une coche dans la marge ; une lanterne posée sur la table, entre elles (vers 50 % de la largeur et 56 % de la hauteur), éclaire la feuille ; silhouettes sans visage, aucune écriture lisible
- **Lanterne : 50 % × 56 %, contrainte dure** : la lumière animée du site part de ce point (largeur × hauteur, depuis le coin haut gauche).
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = table, feuille et silhouettes ; lumière (#FF0000) = flamme et feuille éclairée · **Fond** : rempli d’aplat
- **Cadrage (pour vérifier)** : Comme ACC-21 : de 300 à 360 px de large, sujet au centre.
- **Format** : 3:2, 1800 × 1200
- **Fichier attendu** : `site/src/assets/visuels/accueil/ACC-22_1800x1200.webp`
- **Master** : `design/assets/visuels/accueil/ACC-22.png` → `node tools/separer-calques.mjs ACC-22` écrit le rendu et `ACC-22_1800x1200.aplat.webp`, `ACC-22_1800x1200.encre.webp`, `ACC-22_1800x1200.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Deux silhouettes relisent ensemble une feuille ; l’une la corrige au crayon. »
- **Note** : Deuxième scène de la série ACC-21 à ACC-23.

#### ACC-23 · Contribuer en autonomie

- **Priorité** : socle · **Méthode** : IMG, à générer (image) · **Série** : Le pôle, en trois scènes
- **Produit par** : Codex
- **Emplacement** : `/` · 02, du solo au collectif : scène 3 « Contribuer en autonomie », rejouable au clic _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/components/accueil/FigureCollectif.astro`
- **Sujet** : Contribuer en autonomie
- **Composition (pour le prompt)** : Une silhouette seule à son poste, de trois quarts dos, envoie une feuille terminée qui rejoint une petite pile de feuilles cochées sur une étagère ; sa propre lanterne, posée à côté de l’écran (vers 30 % de la largeur et 48 % de la hauteur), est allumée ; silhouette sans visage, écran sans interface lisible
- **Lanterne : 30 % × 48 %, contrainte dure** : la lumière animée du site part de ce point (largeur × hauteur, depuis le coin haut gauche).
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = poste, étagère, feuilles et silhouette ; lumière (#FF0000) = flamme et feuille envoyée · **Fond** : rempli d’aplat
- **Cadrage (pour vérifier)** : Comme ACC-21 : de 300 à 360 px de large, sujet au centre.
- **Format** : 3:2, 1800 × 1200
- **Fichier attendu** : `site/src/assets/visuels/accueil/ACC-23_1800x1200.webp`
- **Master** : `design/assets/visuels/accueil/ACC-23.png` → `node tools/separer-calques.mjs ACC-23` écrit le rendu et `ACC-23_1800x1200.aplat.webp`, `ACC-23_1800x1200.encre.webp`, `ACC-23_1800x1200.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Une silhouette, seule à son poste, envoie une feuille qui rejoint une pile de feuilles cochées. »
- **Note** : Troisième scène de la série ACC-21 à ACC-23.

### Socle · Projets (vitrine)

#### PRJ-01 · La traduction comme travail d’équipe

- **Priorité** : socle · **Méthode** : IMG, à générer (image) · **Série** : Vitrine des projets
- **Produit par** : Codex
- **Emplacement** : `/projets` · Carte PvZ (première, grande) _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/pages/projets/index.astro`
- **Sujet** : La traduction comme travail d’équipe
- **Composition (pour le prompt)** : Un tableau de travail mural vu de face, légèrement en plongée, en trois colonnes de fiches épinglées (à faire, en relecture, livré), sans aucune inscription ; quatre ou cinq mains anonymes, aux manches différentes, déplacent chacune une fiche d’une colonne à l’autre ; à droite, une main referme un paquet scellé de fiches qui part vers un grand coffre-dépôt commun, plus large que le tableau ; la lanterne, posée en bas au centre (vers 50 % de la largeur et 82 % de la hauteur), éclaire la colonne du milieu et laisse le reste dans la pénombre
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = mur, tableau, fiches et mains ; lumière (#FF0000) = flamme et colonne du milieu · **Fond** : rempli d’aplat
- **Cadrage (pour vérifier)** : Tableau et mains au centre du cadre : la composition se lit entière en 16:10 comme recadrée en 4:5. Sur la vitrine, la carte vedette garde le 16:10 sur mobile pour que son chiffre reste au premier écran.
- **Format** : 16:10, 1600 × 1000 ; 4:5 mobile (recadrage mobile 4:5)
- **Fichier attendu** : `site/src/assets/visuels/projets/PRJ-01_1600x1000.webp`
- **Master** : `design/assets/visuels/projets/PRJ-01.png` → `node tools/separer-calques.mjs PRJ-01` écrit le rendu et `PRJ-01_1600x1000.aplat.webp`, `PRJ-01_1600x1000.encre.webp`, `PRJ-01_1600x1000.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Un tableau de travail en trois colonnes où plusieurs mains déplacent des fiches, et un paquet scellé qui part vers un dépôt commun. »

#### PRJ-02 · Une archive versionnée

- **Priorité** : socle · **Méthode** : IMG, à générer (image) · **Série** : Vitrine des projets
- **Produit par** : Codex
- **Emplacement** : `/projets` · Carte LoD (et LOD-01) _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/pages/projets/index.astro`
- **Sujet** : Une archive versionnée
- **Composition (pour le prompt)** : Un registre relié, ouvert sur un pupitre, vu de trois quarts : ses pages sont des couches minces superposées qui s’éventaillent vers la droite comme un éventail de cartes, chacune avec une tranche marquée de simples traits, sans chiffre ni lettre ; un marque-page de tissu glissé loin dans les pages anciennes ; la lanterne, à gauche (vers 30 % de la largeur et 50 % de la hauteur), éclaire la page marquée, les couches récentes s’estompent dans l’ombre ; aucun personnage
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = pupitre et pages du registre ; lumière (#FF0000) = flamme et page marquée · **Fond** : rempli d’aplat
- **Cadrage (pour vérifier)** : Le registre ouvert, la page marquée et la lanterne tiennent dans le tiers central du cadre : l’image reste lisible recadrée en portrait 2:3 (carte de la vitrine sur ordinateur, environ 300 × 450 px) et en 1:1 (LOD-01).
- **Format** : 16:10 + 1:1 ; portrait 2:3 recadré dans la carte
- **Fichier attendu** : `site/src/assets/visuels/projets/PRJ-02_1600x1000.webp`
- **Master** : `design/assets/visuels/projets/PRJ-02.png` → `node tools/separer-calques.mjs PRJ-02` écrit le rendu et `PRJ-02_1600x1000.aplat.webp`, `PRJ-02_1600x1000.encre.webp`, `PRJ-02_1600x1000.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Un registre ouvert dont les pages datées s’éventaillent, un marque-page glissé dans les plus anciennes. »
- **Note** : Dans la carte de la vitrine, le visuel remplit tout son panneau : en 16:10 sur mobile, recadré en portrait sur ordinateur ; décoratif (alt vide), le nom de la carte dit le reste. LOD-01 (partage) le reprend, non posé.

#### PRJ-06 · Décider quoi faire d’une branche

- **Priorité** : socle · **Méthode** : IMG, à générer (image) · **Série** : Vitrine des projets
- **Produit par** : Codex
- **Emplacement** : `/projets` · « Aussi », GitHealth _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/config/vitrine.ts`, `src/components/vitrine/RangeeAussi.astro`
- **Sujet** : Décider quoi faire d’une branche
- **Composition (pour le prompt)** : Trois branches d’un même tronc, dessinées comme des rameaux stylisés partant d’une racine commune, chacune terminée par un petit picto de verdict sans texte : un sceau plein (garder), une loupe (revoir), un balai (nettoyer) ; la lanterne, posée au pied du tronc (vers 50 % de la largeur et 84 % de la hauteur), éclaire la branche à revoir ; fond en réserve, aucun personnage
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = tronc, branches et pictos de verdict ; lumière (#FF0000) = flamme et branche à revoir · **Fond** : transparent
- **Cadrage (pour vérifier)** : Vignette de la rangée « Aussi », 4:3, environ 300 px de large sur ordinateur et 45 % de la largeur sur mobile : le sujet se lit à cette taille.
- **Format** : 4:3, 1200 × 900
- **Fichier attendu** : `site/src/assets/visuels/projets/PRJ-06_1200x900.webp`
- **Master** : `design/assets/visuels/projets/PRJ-06.png` → `node tools/separer-calques.mjs PRJ-06` écrit le rendu et `PRJ-06_1200x900.aplat.webp`, `PRJ-06_1200x900.encre.webp`, `PRJ-06_1200x900.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Trois branches d’un même tronc, chacune avec son verdict : garder, revoir ou nettoyer. »
- **Note** : Posé dans la rangée « Aussi » de la vitrine (config/vitrine.ts, components/vitrine/RangeeAussi.astro) : décoratif, le texte voisin dit la même chose.

#### PRJ-07 · Une animation pixel art dans une page

- **Priorité** : socle · **Méthode** : IMG, à générer (image) · **Série** : Vitrine des projets
- **Produit par** : Codex
- **Emplacement** : `/projets` · « Aussi », Life Pixel _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/config/vitrine.ts`, `src/components/vitrine/RangeeAussi.astro`
- **Sujet** : Une animation pixel art dans une page
- **Composition (pour le prompt)** : Une grille de pixel art posée à plat sur une table, une petite mascotte ronde et générique (jamais un personnage connu) dessinée en trois images successives, superposées en pelure d’oignon ; un trait de lumière mène vers une fenêtre de navigateur vide de texte où la même mascotte, plus grande, s’anime ; la lanterne posée à gauche de la grille (vers 20 % de la largeur et 66 % de la hauteur) l’éclaire
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = table, grille et fenêtre ; lumière (#FF0000) = flamme, grille éclairée et trait de lumière · **Fond** : rempli d’aplat
- **Cadrage (pour vérifier)** : Vignette de la rangée « Aussi », 4:3, environ 300 px de large sur ordinateur et 45 % de la largeur sur mobile : le sujet se lit à cette taille.
- **Format** : 4:3
- **Fichier attendu** : `site/src/assets/visuels/projets/PRJ-07_1600x1200.webp`
- **Master** : `design/assets/visuels/projets/PRJ-07.png` → `node tools/separer-calques.mjs PRJ-07` écrit le rendu et `PRJ-07_1600x1200.aplat.webp`, `PRJ-07_1600x1200.encre.webp`, `PRJ-07_1600x1200.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Une mascotte en pixel art dessinée image par image, puis animée dans une page web. »
- **Note** : Posé dans la rangée « Aussi » de la vitrine (config/vitrine.ts, components/vitrine/RangeeAussi.astro) : décoratif, le texte voisin dit la même chose.

#### PRJ-08 · Une image, des variantes

- **Priorité** : socle · **Méthode** : IMG, à générer (image) · **Série** : Vitrine des projets
- **Produit par** : Codex
- **Emplacement** : `/projets` · « Aussi », img-convertor _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/config/vitrine.ts`, `src/components/vitrine/RangeeAussi.astro`
- **Sujet** : Une image, des variantes
- **Composition (pour le prompt)** : Une grande image encadrée (un paysage simple) à gauche, d’où partent quatre copies de la même image, de largeurs décroissantes, alignées en escalier vers la droite comme sur des écrans de tailles différentes (grand écran, portable, tablette, téléphone), sans poids ni chiffre ; la lanterne posée devant l’original (vers 22 % de la largeur et 78 % de la hauteur) l’éclaire
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = cadres et écrans ; lumière (#FF0000) = flamme et image originale · **Fond** : transparent
- **Cadrage (pour vérifier)** : Vignette de la rangée « Aussi », 4:3, environ 300 px de large sur ordinateur et 45 % de la largeur sur mobile : le sujet se lit à cette taille.
- **Format** : 4:3
- **Fichier attendu** : `site/src/assets/visuels/projets/PRJ-08_1600x1200.webp`
- **Master** : `design/assets/visuels/projets/PRJ-08.png` → `node tools/separer-calques.mjs PRJ-08` écrit le rendu et `PRJ-08_1600x1200.aplat.webp`, `PRJ-08_1600x1200.encre.webp`, `PRJ-08_1600x1200.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Une image et ses quatre déclinaisons, de la plus large à la plus étroite. »
- **Note** : Posé dans la rangée « Aussi » de la vitrine (config/vitrine.ts, components/vitrine/RangeeAussi.astro) : décoratif, le texte voisin dit la même chose.

#### PRJ-10 · L’absurde assumé

- **Priorité** : socle · **Méthode** : IMG, à générer (image) · **Série** : Vitrine des projets
- **Produit par** : Codex
- **Emplacement** : `/projets` · « Aussi », Shreksophone _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/config/vitrine.ts`, `src/components/vitrine/RangeeAussi.astro`
- **Sujet** : L’absurde assumé
- **Composition (pour le prompt)** : Une fenêtre de navigateur vide de texte, vue de face ; un saxophone en surgit à moitié, pavillon vers le haut, comme s’il crevait l’interface ; des notes de musique débordent du cadre et s’envolent ; absurde assumé, même gravure que le reste de la série ; aucun personnage ; la lanterne posée au pied de la fenêtre (vers 64 % de la largeur et 82 % de la hauteur) éclaire le pavillon
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = fenêtre, saxophone et notes ; lumière (#FF0000) = flamme et pavillon éclairé · **Fond** : transparent
- **Cadrage (pour vérifier)** : Vignette de la rangée « Aussi », 4:3, environ 300 px de large sur ordinateur et 45 % de la largeur sur mobile : le sujet se lit à cette taille.
- **Format** : 4:3, 1600 × 1200 (comme le reste de la rangée « Aussi »)
- **Fichier attendu** : `site/src/assets/visuels/projets/PRJ-10_1600x1200.webp`
- **Master** : `design/assets/visuels/projets/PRJ-10.png` → `node tools/separer-calques.mjs PRJ-10` écrit le rendu et `PRJ-10_1600x1200.aplat.webp`, `PRJ-10_1600x1200.encre.webp`, `PRJ-10_1600x1200.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Un saxophone qui surgit d’une fenêtre de navigateur, des notes qui débordent du cadre. »
- **Note** : Posé dans la rangée « Aussi » de la vitrine (config/vitrine.ts, components/vitrine/RangeeAussi.astro) : décoratif, le texte voisin dit la même chose. Passé de 1:1 à 4:3 pour s’aligner sur les trois autres.

#### PRJ-11 · Les portes ouvertes de l’open source

- **Priorité** : socle · **Méthode** : IMG, à générer (image) · **Série** : Vitrine des projets
- **Produit par** : Codex
- **Emplacement** : `/projets` · Bloc « Contribuer » _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/components/vitrine/BlocContribuer.astro`
- **Sujet** : Les portes ouvertes de l’open source
- **Composition (pour le prompt)** : Un chemin de pierres plates part du bas à gauche et mène à trois boîtes ouvertes de tailles différentes, posées en ligne (des dépôts) ; une petite lanterne est posée sur chaque couvercle : la première (vers 46 % de la largeur et 38 % de la hauteur) est allumée et seule éclaire la scène, les deux autres attendent qu’on les allume ; de la première boîte dépassent des outils simples (une règle, un pinceau) ; fond en réserve, aucun personnage
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = chemin, boîtes et outils ; lumière (#FF0000) = flamme de la première lanterne et sa boîte · **Fond** : rempli d’aplat
- **Cadrage (pour vérifier)** : Sur ordinateur, environ 530 × 177 px au pied de la colonne du titre ; sur mobile, cadre 3:2 centré sur la première boîte et sa lanterne : le chemin et les deux autres boîtes peuvent sortir du cadre.
- **Format** : 3:1, 1800 × 600 (recadrage mobile 3:2)
- **Fichier attendu** : `site/src/assets/visuels/projets/PRJ-11_1800x600.webp`
- **Master** : `design/assets/visuels/projets/PRJ-11.png` → `node tools/separer-calques.mjs PRJ-11` écrit le rendu et `PRJ-11_1800x600.aplat.webp`, `PRJ-11_1800x600.encre.webp`, `PRJ-11_1800x600.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Un chemin qui mène à trois boîtes ouvertes, une lanterne allumée sur la première, les deux autres prêtes. »
- **Note** : Posé dans l’acte de veille (sombre, jour et nuit) du bloc « Contribuer », aligné sur la fin de la liste. Décoratif, le texte voisin dit la même chose.

### Socle · PvZ Fusion

#### PVZ-01 · Traduction et équipe

- **Priorité** : socle · **Méthode** : IMG, à générer (image) · **Série** : PvZ Fusion, scènes
- **Produit par** : Codex
- **Emplacement** : `/projets/pvz-fusion` · En-tête _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/pages/projets/pvz-fusion.astro`
- **Sujet** : Traduction et équipe
- **Composition (pour le prompt)** : Une longue table de travail vue de trois quarts, en légère plongée : des fiches passent de main en main, de gauche à droite ; à gauche, une silhouette seule, assise, tend une fiche ; à droite, un groupe de silhouettes la reçoit et la relit ; derrière le groupe, une pile de fiches qui grossit ; la lanterne posée au centre de la table (vers 50 % de la largeur et 60 % de la hauteur) éclaire la fiche transmise, le reste dans l’ombre ; silhouettes sans visage ; aucun texte, aucune plante, aucun zombie, aucun jardin ni grille de pelouse
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = table, fiches et silhouettes ; lumière (#FF0000) = flamme et fiche transmise · **Fond** : rempli d’aplat
- **Cadrage (pour vérifier)** : 4:3 à toutes les largeurs : à droite du titre au-delà de 1 100 px, centré sous les repères chiffrés en dessous (640 px au plus). Sur mobile, l’image fait 358 × 268 px : la fiche transmise et la lanterne doivent s’y lire.
- **Format** : 4:3, 1600 × 1200
- **Fichier attendu** : `site/src/assets/visuels/pvz-fusion/PVZ-01_1600x1200.webp`
- **Master** : `design/assets/visuels/pvz-fusion/PVZ-01.png` → `node tools/separer-calques.mjs PVZ-01` écrit le rendu et `PVZ-01_1600x1200.aplat.webp`, `PVZ-01_1600x1200.encre.webp`, `PVZ-01_1600x1200.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Une longue table où des fiches passent d’une silhouette seule à un groupe, à la lumière d’une lanterne. »
- **Note** : Posé dans l’en-tête de la page (components/projets/gabarit/EnTeteProjet.astro, slot « visuel »), chargé en priorité. Réécrite le 13/10/2026 sans jardin : un jardin en grille vu en coupe est la signature du jeu tiers (règle 1).

#### PVZ-02a · Accueillir : montrer la fiche

- **Priorité** : socle · **Méthode** : IMG, à générer (image) · **Série** : PvZ Fusion, scènes
- **Produit par** : Codex
- **Emplacement** : `/projets/pvz-fusion` · § 2, l’équipe, case 1 du triptyque, au-dessus de « Accueillir » _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/config/pvz-fusion.ts`, `src/pages/projets/pvz-fusion.astro`
- **Sujet** : Accueillir : montrer la fiche
- **Composition (pour le prompt)** : Une table de travail vue de trois quarts ; à gauche, une silhouette debout tend une fiche annotée à une nouvelle venue assise ; la lanterne posée sur la table (vers 56 % de la largeur et 58 % de la hauteur) éclaire la fiche seule, le reste dans l’ombre ; silhouettes sans visage. Décor commun aux trois cases : même table, même lanterne, même cadrage, horizon à mi-hauteur
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = table, chaises et silhouettes ; lumière (#FF0000) = flamme et fiche tendue · **Fond** : rempli d’aplat
- **Cadrage (pour vérifier)** : Environ 380 px de large dans le triptyque ; le bord droit se raccorde au bord gauche de PVZ-02b (table continue), sans cadre ni marge.
- **Format** : 4:3, 1200 × 900
- **Fichier attendu** : `site/src/assets/visuels/pvz-fusion/PVZ-02a_1200x900.webp`
- **Master** : `design/assets/visuels/pvz-fusion/PVZ-02a.png` → `node tools/separer-calques.mjs PVZ-02a` écrit le rendu et `PVZ-02a_1200x900.aplat.webp`, `PVZ-02a_1200x900.encre.webp`, `PVZ-02a_1200x900.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Une personne montre une fiche annotée à une nouvelle venue, à la lumière d’une lanterne. »
- **Note** : Première case du triptyque PVZ-02 : même main, même décor, même lumière que PVZ-02b et PVZ-02c.

#### PVZ-02b · Former et relire : la voir travailler

- **Priorité** : socle · **Méthode** : IMG, à générer (image) · **Série** : PvZ Fusion, scènes
- **Produit par** : Codex
- **Emplacement** : `/projets/pvz-fusion` · § 2, l’équipe, case 2 du triptyque, au-dessus de « Former et relire » _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/config/pvz-fusion.ts`, `src/pages/projets/pvz-fusion.astro`
- **Sujet** : Former et relire : la voir travailler
- **Composition (pour le prompt)** : La même table et la même lanterne ; la nouvelle venue écrit sur la fiche, la silhouette de la case 1 se tient en retrait derrière son épaule et désigne une ligne du doigt ; la lumière tombe sur la main qui écrit ; silhouettes sans visage
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = table, chaises et silhouettes ; lumière (#FF0000) = flamme et main qui écrit · **Fond** : rempli d’aplat
- **Cadrage (pour vérifier)** : Case centrale du triptyque : se raccorde à PVZ-02a à gauche et à PVZ-02c à droite.
- **Format** : 4:3, 1200 × 900
- **Fichier attendu** : `site/src/assets/visuels/pvz-fusion/PVZ-02b_1200x900.webp`
- **Master** : `design/assets/visuels/pvz-fusion/PVZ-02b.png` → `node tools/separer-calques.mjs PVZ-02b` écrit le rendu et `PVZ-02b_1200x900.aplat.webp`, `PVZ-02b_1200x900.encre.webp`, `PVZ-02b_1200x900.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « La nouvelle venue écrit sur la fiche, accompagnée par la personne qui l’a accueillie. »
- **Note** : Case centrale du triptyque PVZ-02.

#### PVZ-02c · Faire confiance : relire seule

- **Priorité** : socle · **Méthode** : IMG, à générer (image) · **Série** : PvZ Fusion, scènes
- **Produit par** : Codex
- **Emplacement** : `/projets/pvz-fusion` · § 2, l’équipe, case 3 du triptyque, au-dessus de « Faire confiance » _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/config/pvz-fusion.ts`, `src/pages/projets/pvz-fusion.astro`
- **Sujet** : Faire confiance : relire seule
- **Composition (pour le prompt)** : La même table et la même lanterne ; la nouvelle venue, seule, relit la fiche d’une troisième personne posée devant elle et la coche ; la chaise de la silhouette de la case 1 est vide ; la lanterne éclaire la fiche relue ; silhouette sans visage
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = table, chaises et silhouette ; lumière (#FF0000) = flamme et fiche relue · **Fond** : rempli d’aplat
- **Cadrage (pour vérifier)** : Dernière case du triptyque : son bord gauche se raccorde à PVZ-02b.
- **Format** : 4:3, 1200 × 900
- **Fichier attendu** : `site/src/assets/visuels/pvz-fusion/PVZ-02c_1200x900.webp`
- **Master** : `design/assets/visuels/pvz-fusion/PVZ-02c.png` → `node tools/separer-calques.mjs PVZ-02c` écrit le rendu et `PVZ-02c_1200x900.aplat.webp`, `PVZ-02c_1200x900.encre.webp`, `PVZ-02c_1200x900.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « La nouvelle venue relit seule la fiche d’un autre membre, à la lumière de la lanterne. »
- **Note** : Dernière case du triptyque PVZ-02.

#### PVZ-04 · Repérer

- **Priorité** : socle · **Méthode** : IMG, à générer (image) · **Série** : Vignettes à motif unique
- **Produit par** : Codex
- **Emplacement** : `/projets/pvz-fusion` · § 3, bloc de l’outil du pôle (repérer ce qui manque) _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/pages/projets/pvz-fusion.astro`
- **Sujet** : Repérer
- **Composition (pour le prompt)** : Une loupe tenue au-dessus d’une longue feuille de lignes régulières, où quelques lignes manquent, laissées en creux ; la lumière de la lanterne, posée derrière la loupe (vers 70 % de la largeur et 30 % de la hauteur), passe par la lentille et éclaire seulement les creux
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = loupe et feuille de lignes ; lumière (#FF0000) = flamme et creux éclairés · **Fond** : transparent
- **Cadrage (pour vérifier)** : Affichée jusqu’à 360 px de large, dans l’acte de veille (sombre, jour et nuit) : la gravure doit rester lisible sur fond sombre.
- **Format** : 1:1, 480
- **Fichier attendu** : `site/src/assets/visuels/pvz-fusion/PVZ-04_480x480.webp`
- **Master** : `design/assets/visuels/pvz-fusion/PVZ-04.png` → `node tools/separer-calques.mjs PVZ-04` écrit le rendu et `PVZ-04_480x480.aplat.webp`, `PVZ-04_480x480.encre.webp`, `PVZ-04_480x480.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Une loupe au-dessus d’une feuille de lignes, dont la lumière éclaire les lignes manquantes. »
- **Note** : Posé dans l’acte de veille de l’outil. À compléter par la capture réelle du Console Manager (PVZ-C2) quand elle existe.

#### PVZ-05 · Organiser : un tableau commun

- **Priorité** : socle · **Méthode** : IMG, à générer (image) · **Série** : Vignettes à motif unique
- **Produit par** : Codex
- **Emplacement** : `/projets/pvz-fusion` · § 3, carte 1 de la semaine type, Organiser (accueil : les quatre gestes) _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/config/pvz-fusion.ts`, `src/components/projets/pvz/BoucleSemaine.astro`, `src/components/accueil/GestesPole.astro`
- **Sujet** : Organiser : un tableau commun
- **Composition (pour le prompt)** : Un seul motif centré : trois cartes vierges épinglées côte à côte ; une main anonyme, en silhouette, en décroche une ; la lanterne, en bas à droite (vers 78 % de la largeur et 80 % de la hauteur), éclaire la carte prise
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = cartes et main ; lumière (#FF0000) = flamme et carte décrochée · **Fond** : transparent
- **Cadrage (pour vérifier)** : Vignette de carte, affichée à 136 px de large en bureau, 96 px entre 1 101 et 1 240 px et sous 760 px, 160 à 300 px dans les quatre gestes de l’accueil : un seul motif centré, en silhouette, qui occupe au moins 60 % du cadre, sans détail fin.
- **Format** : 1:1, 480
- **Fichier attendu** : `site/src/assets/visuels/pvz-fusion/PVZ-05_480x480.webp`
- **Master** : `design/assets/visuels/pvz-fusion/PVZ-05.png` → `node tools/separer-calques.mjs PVZ-05` écrit le rendu et `PVZ-05_480x480.aplat.webp`, `PVZ-05_480x480.encre.webp`, `PVZ-05_480x480.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Une main décroche une carte vierge parmi trois, épinglées côte à côte. »
- **Note** : Carte « Organiser » de la semaine type, reprise dans les quatre gestes de l’accueil (ACC-15). Exception à la règle B8 (320 px au moins) : une vignette de carte, pas une illustration de section ; question ouverte, à faire trancher par Charles.

#### PVZ-06 · Traduire, relire, tester

- **Priorité** : socle · **Méthode** : IMG, à générer (image) · **Série** : Vignettes à motif unique
- **Produit par** : Codex
- **Emplacement** : `/projets/pvz-fusion` · § 4, le métier de traducteur, à côté des corrections et de la démonstration _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/pages/projets/pvz-fusion.astro`
- **Sujet** : Traduire, relire, tester
- **Composition (pour le prompt)** : Un seul motif centré : une plume posée en travers d’une fiche dont une ligne est barrée ; la lanterne, hors champ à droite (sa lumière entre vers 90 % de la largeur et 40 % de la hauteur), éclaire la plume
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = plume et fiche ; lumière (#FF0000) = lumière sur la plume · **Fond** : transparent
- **Cadrage (pour vérifier)** : Vignette de titre, affichée à 96 px de large à toutes les largeurs : silhouette simple, lisible en petit, sans détail fin.
- **Format** : 1:1, 480
- **Fichier attendu** : `site/src/assets/visuels/pvz-fusion/PVZ-06_480x480.webp`
- **Master** : `design/assets/visuels/pvz-fusion/PVZ-06.png` → `node tools/separer-calques.mjs PVZ-06` écrit le rendu et `PVZ-06_480x480.aplat.webp`, `PVZ-06_480x480.encre.webp`, `PVZ-06_480x480.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Une plume posée en travers d’une fiche dont une ligne est barrée. »
- **Note** : À gauche du titre « Traduire, c’est suivre des règles qui changent ». Exception à la règle B8 (320 px au moins) : une vignette de carte, pas une illustration de section ; question ouverte, à faire trancher par Charles.

#### PVZ-07 · Livrer : une proposition par semaine

- **Priorité** : socle · **Méthode** : IMG, à générer (image) · **Série** : Vignettes à motif unique
- **Produit par** : Codex
- **Emplacement** : `/projets/pvz-fusion` · § 3, carte 2 de la semaine type, Livrer (accueil : les quatre gestes) _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/config/pvz-fusion.ts`, `src/components/projets/pvz/BoucleSemaine.astro`, `src/components/accueil/GestesPole.astro`
- **Sujet** : Livrer : une proposition par semaine
- **Composition (pour le prompt)** : Un seul motif centré : un colis scellé, noué d’une ficelle où pendent quelques étiquettes vierges, sans nom ni chiffre ; la lanterne posée à côté (vers 76 % de la largeur et 70 % de la hauteur) éclaire les étiquettes
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = colis, ficelle et étiquettes ; lumière (#FF0000) = flamme et étiquettes éclairées · **Fond** : transparent
- **Cadrage (pour vérifier)** : Vignette de carte, affichée à 136 px de large en bureau, 96 px entre 1 101 et 1 240 px et sous 760 px, 160 à 300 px dans les quatre gestes de l’accueil : un seul motif centré, en silhouette, qui occupe au moins 60 % du cadre, sans détail fin.
- **Format** : 1:1, 480
- **Fichier attendu** : `site/src/assets/visuels/pvz-fusion/PVZ-07_480x480.webp`
- **Master** : `design/assets/visuels/pvz-fusion/PVZ-07.png` → `node tools/separer-calques.mjs PVZ-07` écrit le rendu et `PVZ-07_480x480.aplat.webp`, `PVZ-07_480x480.encre.webp`, `PVZ-07_480x480.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Un colis scellé, noué d’une ficelle où pendent des étiquettes vierges. »
- **Note** : Carte « Livrer » de la semaine type, reprise dans les quatre gestes de l’accueil (ACC-15). Exception à la règle B8 (320 px au moins) : une vignette de carte, pas une illustration de section ; question ouverte, à faire trancher par Charles.

#### PVZ-08 · Motiver : le classement de la semaine

- **Priorité** : socle · **Méthode** : IMG, à générer (image) · **Série** : Vignettes à motif unique
- **Produit par** : Codex
- **Emplacement** : `/projets/pvz-fusion` · § 3, carte 3 de la semaine type, Motiver (accueil : les quatre gestes) _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/config/pvz-fusion.ts`, `src/components/projets/pvz/BoucleSemaine.astro`, `src/components/accueil/GestesPole.astro`
- **Sujet** : Motiver : le classement de la semaine
- **Composition (pour le prompt)** : Un seul motif centré : un podium vide de trois marches, sans chiffre ni lettre, sous une étoile ; la lanterne posée sur la plus haute marche (vers 50 % de la largeur et 46 % de la hauteur) éclaire l’étoile
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = podium ; lumière (#FF0000) = flamme et étoile · **Fond** : transparent
- **Cadrage (pour vérifier)** : Vignette de carte, affichée à 136 px de large en bureau, 96 px entre 1 101 et 1 240 px et sous 760 px, 160 à 300 px dans les quatre gestes de l’accueil : un seul motif centré, en silhouette, qui occupe au moins 60 % du cadre, sans détail fin.
- **Format** : 1:1, 480
- **Fichier attendu** : `site/src/assets/visuels/pvz-fusion/PVZ-08_480x480.webp`
- **Master** : `design/assets/visuels/pvz-fusion/PVZ-08.png` → `node tools/separer-calques.mjs PVZ-08` écrit le rendu et `PVZ-08_480x480.aplat.webp`, `PVZ-08_480x480.encre.webp`, `PVZ-08_480x480.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Un podium vide de trois marches, sous une étoile. »
- **Note** : Ancienne station « Reconnaître » scindée le 13/10/2026 : le podium ici, la lettre en PVZ-11. Carte « Motiver » de la semaine type, reprise dans les quatre gestes de l’accueil (ACC-15). Exception à la règle B8 (320 px au moins) : une vignette de carte, pas une illustration de section ; question ouverte, à faire trancher par Charles.

#### PVZ-11 · Remercier : le récapitulatif individuel

- **Priorité** : socle · **Méthode** : IMG, à générer (image) · **Série** : Vignettes à motif unique
- **Produit par** : Codex
- **Emplacement** : `/projets/pvz-fusion` · § 3, carte 4 de la semaine type, Remercier (accueil : les quatre gestes) _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/config/pvz-fusion.ts`, `src/components/projets/pvz/BoucleSemaine.astro`, `src/components/accueil/GestesPole.astro`
- **Sujet** : Remercier : le récapitulatif individuel
- **Composition (pour le prompt)** : Un seul motif centré : une lettre pliée, nouée d’un ruban, sans écriture lisible ; la lanterne, juste derrière (vers 62 % de la largeur et 36 % de la hauteur), éclaire la lettre seule
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = lettre et ruban ; lumière (#FF0000) = flamme et lettre éclairée · **Fond** : transparent
- **Cadrage (pour vérifier)** : Vignette de carte, affichée à 136 px de large en bureau, 96 px entre 1 101 et 1 240 px et sous 760 px, 160 à 300 px dans les quatre gestes de l’accueil : un seul motif centré, en silhouette, qui occupe au moins 60 % du cadre, sans détail fin.
- **Format** : 1:1, 480
- **Fichier attendu** : `site/src/assets/visuels/pvz-fusion/PVZ-11_480x480.webp`
- **Master** : `design/assets/visuels/pvz-fusion/PVZ-11.png` → `node tools/separer-calques.mjs PVZ-11` écrit le rendu et `PVZ-11_480x480.aplat.webp`, `PVZ-11_480x480.encre.webp`, `PVZ-11_480x480.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Une lettre pliée, nouée d’un ruban. »
- **Note** : Ajouté le 13/10/2026 : la moitié « lettre » de l’ancienne station PVZ-08. Carte « Remercier » de la semaine type, reprise dans les quatre gestes de l’accueil (ACC-15). Même série, même main que PVZ-05, PVZ-07 et PVZ-08. Exception à la règle B8 (320 px au moins) : une vignette de carte, pas une illustration de section ; question ouverte, à faire trancher par Charles.

### Socle · League Of Data Base

#### LOD-04 · Changer de moteur sans perdre personne

- **Priorité** : socle · **Méthode** : IMG, à générer (image) · **Série** : Pages de projet
- **Produit par** : Codex
- **Emplacement** : `/projets/league-of-database` · § « Changer de moteur sans perdre personne », en tête _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/pages/projets/league-of-database.astro`
- **Sujet** : Changer de moteur sans perdre personne
- **Composition (pour le prompt)** : Coupe horizontale d’un train en gravure en réserve : à gauche, un moteur ancien à trois engrenages de tailles inégales, détaché, posé sur le quai et éteint ; à droite, un moteur neuf à deux engrenages déjà attelé. Au centre, un wagon dont les voyageurs, des silhouettes sans visage, restent assis. Une seule lanterne accrochée entre le wagon et le moteur neuf (vers 64 % de la largeur et 40 % de la hauteur) éclaire l’attelage ; le reste reste dans l’ombre. Aucun logo, aucun texte
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = quai, moteurs, wagon et silhouettes ; lumière (#FF0000) = flamme et attelage éclairé · **Fond** : rempli d’aplat
- **Cadrage (pour vérifier)** : 16:9 aussi sur mobile, le sujet (l’attelage éclairé) au centre du cadre ; affichée jusqu’à 540 px de large.
- **Format** : 16:9, 1600 × 900
- **Fichier attendu** : `site/src/assets/visuels/league-of-database/LOD-04_1600x900.webp`
- **Master** : `design/assets/visuels/league-of-database/LOD-04.png` → `node tools/separer-calques.mjs LOD-04` écrit le rendu et `LOD-04_1600x900.aplat.webp`, `LOD-04_1600x900.encre.webp`, `LOD-04_1600x900.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Un train dont on remplace le moteur pendant que les voyageurs restent assis. »
- **Note** : À côté du texte de la réécriture, au-dessus de la frise LOD-F6.

### Socle · Omnicard

#### OMN-01 · Du papier au jeu en ligne

- **Priorité** : socle · **Méthode** : IMG, à générer (image) · **Série** : Pages de projet
- **Produit par** : Codex
- **Emplacement** : `/projets/omnicard` · En-tête, à droite du titre (et PRJ-03 sur la vitrine) _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/pages/index.astro`, `src/pages/projets/omnicard.astro`
- **Sujet** : Du papier au jeu en ligne
- **Composition (pour le prompt)** : Une carte à jouer plastifiée à la main, pochette visible et coin corné, posée à cheval sur le bord d’une fenêtre de navigateur générique : la moitié hors de la fenêtre reste papier (bords de découpe aux ciseaux, reflet du plastique), la moitié dans la fenêtre devient une carte numérique nette. Face générique : cadre, losange central, pastille de coût et deux pastilles de statistiques vides, sans chiffre ni lettre. Sur la table, deux ou trois cartes papier éparses. La lanterne, posée hors champ à gauche (sa lumière entre vers 0 % de la largeur et 45 % de la hauteur), éclaire la carte seule ; la fenêtre et la table restent dans l’ombre. Aucun personnage, aucune illustration de carte reconnaissable, aucun texte
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = table, fenêtre et cartes ; lumière (#FF0000) = lumière sur la carte · **Fond** : rempli d’aplat
- **Cadrage (pour vérifier)** : Le recadrage 1:1 mobile garde la carte entière, au centre. Recadré en 16:10 et en portrait 2:3 pour la vitrine (PRJ-03) : la carte reste entière.
- **Format** : 4:3, 1600 × 1200 ; 1:1 mobile (recadrage mobile 1:1)
- **Fichier attendu** : `site/src/assets/visuels/omnicard/OMN-01_1600x1200.webp`
- **Master** : `design/assets/visuels/omnicard/OMN-01.png` → `node tools/separer-calques.mjs OMN-01` écrit le rendu et `OMN-01_1600x1200.aplat.webp`, `OMN-01_1600x1200.encre.webp`, `OMN-01_1600x1200.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Une carte plastifiée à la main qui devient numérique en passant dans une fenêtre de navigateur. »
- **Note** : En tête de la page Omnicard, sur la carte Omnicard de l’accueil, et recadré par PRJ-03.

### Socle · Bloodborne Legendary Run

#### BLR-01 · Quarante trophées, plus de mille objectifs

- **Priorité** : socle · **Méthode** : IMG, à générer (image) · **Série** : Pages de projet
- **Produit par** : Codex
- **Emplacement** : `/projets/bloodborne-legendary-run` · § Ranger 1 289 objectifs, sous le texte (colonne de gauche) _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/pages/projets/bloodborne-legendary-run.astro`
- **Sujet** : Quarante trophées, plus de mille objectifs
- **Composition (pour le prompt)** : À gauche, un carnet de cases à cocher qui déborde de la page, la plupart encore vides ; à droite, une petite rangée nette de quarante médailles ; la lanterne posée sur le carnet (vers 34 % de la largeur et 56 % de la hauteur) éclaire la case suivante et laisse le reste dans l’ombre ; aucune référence visuelle au jeu ni à une console
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = carnet, cases et médailles ; lumière (#FF0000) = flamme et case suivante · **Fond** : rempli d’aplat
- **Cadrage (pour vérifier)** : Affiché jusqu’à 540 px de large sur ordinateur, pleine largeur sur mobile.
- **Format** : 3:2, 1500 × 1000
- **Fichier attendu** : `site/src/assets/visuels/bloodborne/BLR-01_1500x1000.webp`
- **Master** : `design/assets/visuels/bloodborne/BLR-01.png` → `node tools/separer-calques.mjs BLR-01` écrit le rendu et `BLR-01_1500x1000.aplat.webp`, `BLR-01_1500x1000.encre.webp`, `BLR-01_1500x1000.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Un carnet de cases à cocher qui déborde de la page, à côté d’une rangée de quarante médailles. »
- **Note** : Posé avec un alt vide : le texte voisin dit la même chose (84 étoiles au premier ciel, dont les 40 trophées PlayStation, journal public du 06/09/2026) ; la légende est en HTML.

### Socle · gup

#### GUP-01 · Dispersé, puis un seul geste

- **Priorité** : socle · **Méthode** : IMG, à générer (image) · **Série** : Pages de projet
- **Produit par** : Codex
- **Emplacement** : `/projets/gup` · § 1, le problème : sous les deux paragraphes, à gauche de la figure des commandes (GUP-F1) ; 320 px de large sur ordinateur, masqué sous 860 px _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/pages/projets/gup.astro`
- **Sujet** : Dispersé, puis un seul geste
- **Composition (pour le prompt)** : Une douzaine de petites machines toutes différentes, chacune avec son propre levier ou sa propre manivelle, reliées par des fils emmêlés qui convergent vers une seule boîte nette marquée d’une flèche circulaire ; la lanterne posée sur la boîte (vers 76 % de la largeur et 40 % de la hauteur) l’éclaire, les machines restent dans la pénombre ; aucun caractère, aucune lettre, aucun chiffre, aucun logo
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = machines, fils et boîte ; lumière (#FF0000) = flamme et boîte éclairée · **Fond** : transparent
- **Cadrage (pour vérifier)** : Affichée à 320 px de large sur ordinateur, masquée sous 860 px : la boîte éclairée et les fils se lisent à cette taille.
- **Format** : 4:3, 1200 × 900
- **Fichier attendu** : `site/src/assets/visuels/gup/GUP-01_1200x900.webp`
- **Master** : `design/assets/visuels/gup/GUP-01.png` → `node tools/separer-calques.mjs GUP-01` écrit le rendu et `GUP-01_1200x900.aplat.webp`, `GUP-01_1200x900.encre.webp`, `GUP-01_1200x900.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Une douzaine de petites machines dont les fils emmêlés convergent vers une seule boîte éclairée par une lanterne. »
- **Note** : Posé dans la section « probleme », à gauche de la figure des commandes (GUP-F1), qui porte le fait ; l’image ne fait que le faire sentir.

### Socle · Parcours : hub, professionnel, compétences, formation

#### PAR-01 · Concevoir

- **Priorité** : socle · **Méthode** : IMG, à générer (image) · **Série** : Parcours
- **Produit par** : Codex
- **Emplacement** : `/parcours` · Hub, porte Professionnel : en tête de la carte (bandeau 2:1 pleine largeur de la carte, pour garder les portes près du pli ; 16:9 sur mobile) _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/config/parcours.ts`, `src/pages/parcours.astro`
- **Sujet** : Concevoir
- **Composition (pour le prompt)** : Une table à dessin vue de trois quarts, en légère plongée : un plan d’architecture logicielle déplié (blocs rectangulaires reliés par des flèches, trois couches empilées, sans aucune lettre), tenu à plat par une règle et un compas ; la lanterne posée à l’angle supérieur droit (vers 76 % de la largeur et 30 % de la hauteur) éclaire le plan en cône et laisse les bords dans l’ombre ; aucun personnage, aucun écran
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = table, plan, règle et compas ; lumière (#FF0000) = flamme et cône de lumière sur le plan · **Fond** : rempli d’aplat
- **Cadrage (pour vérifier)** : Bandeau 2:1 pleine largeur de la carte (environ 420 px) ; recadré en 16:9 sur mobile : sujet et lanterne dans la moitié centrale.
- **Format** : 2:1, 1600 × 800 ; 16:9 sur mobile (recadrage mobile 16:9)
- **Fichier attendu** : `site/src/assets/visuels/parcours/PAR-01_1600x800.webp`
- **Master** : `design/assets/visuels/parcours/PAR-01.png` → `node tools/separer-calques.mjs PAR-01` écrit le rendu et `PAR-01_1600x800.aplat.webp`, `PAR-01_1600x800.encre.webp`, `PAR-01_1600x800.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Une table à dessin où un plan d’architecture logicielle déplié est éclairé par une lanterne. »
- **Note** : Posé dans la carte de la porte (pages/parcours.astro) ; décoratif à l’usage (alt vide), le titre de la carte porte le lien. Série « Parcours » : trois quarts en légère plongée, horizon aux deux tiers, trait gravé, deux ou trois aplats, la lanterne seule source de lumière ; aucun texte, aucun chiffre, aucune marque dans l’image.

#### PAR-02 · La boîte à outils

- **Priorité** : socle · **Méthode** : IMG, à générer (image) · **Série** : Parcours
- **Produit par** : Codex
- **Emplacement** : `/parcours` · Hub, porte Compétences : en tête de la carte (bandeau 2:1 pleine largeur de la carte, pour garder les portes près du pli ; 16:9 sur mobile) _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/config/parcours.ts`, `src/pages/parcours.astro`
- **Sujet** : La boîte à outils
- **Composition (pour le prompt)** : Une boîte à outils en bois ouverte, vue de trois quarts en légère plongée, à quatre compartiments reconnaissables à leur forme et non à un mot : une équerre et des gabarits (l’interface), des engrenages imbriqués (l’API), des tiroirs de fiches empilées (les données), une caisse scellée prête à partir (la livraison) ; la lanterne accrochée à la poignée (vers 50 % de la largeur et 26 % de la hauteur) éclaire l’intérieur ; aucun logo
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = boîte et outils ; lumière (#FF0000) = flamme et intérieur de la boîte · **Fond** : rempli d’aplat
- **Cadrage (pour vérifier)** : Bandeau 2:1 pleine largeur de la carte (environ 420 px) ; recadré en 16:9 sur mobile : sujet et lanterne dans la moitié centrale.
- **Format** : 2:1, 1600 × 800 ; 16:9 sur mobile (recadrage mobile 16:9)
- **Fichier attendu** : `site/src/assets/visuels/parcours/PAR-02_1600x800.webp`
- **Master** : `design/assets/visuels/parcours/PAR-02.png` → `node tools/separer-calques.mjs PAR-02` écrit le rendu et `PAR-02_1600x800.aplat.webp`, `PAR-02_1600x800.encre.webp`, `PAR-02_1600x800.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Une boîte à outils ouverte, à quatre compartiments, éclairée par une lanterne accrochée à sa poignée. »
- **Note** : Posé dans la carte de la porte (pages/parcours.astro) ; décoratif à l’usage (alt vide), le titre de la carte porte le lien. Série « Parcours » : trois quarts en légère plongée, horizon aux deux tiers, trait gravé, deux ou trois aplats, la lanterne seule source de lumière ; aucun texte, aucun chiffre, aucune marque dans l’image.

#### PAR-03 · Ce que j’ai dans mon sac

- **Priorité** : socle · **Méthode** : IMG, à générer (image) · **Série** : Parcours
- **Produit par** : Codex
- **Emplacement** : `/parcours` · Hub, porte Formation : en tête de la carte (bandeau 2:1 pleine largeur de la carte, pour garder les portes près du pli ; 16:9 sur mobile) _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/config/parcours.ts`, `src/pages/parcours.astro`
- **Sujet** : Ce que j’ai dans mon sac
- **Composition (pour le prompt)** : Une pile de livres reliés couchés, vue de trois quarts en légère plongée, dos sans titre, de tailles décroissantes ; au sommet, un diplôme roulé noué d’un ruban ; quelques fiches volantes (des certificats, sans texte ni sceau lisible) glissées entre deux livres ; la lanterne sert de serre-livre à droite (vers 74 % de la largeur et 56 % de la hauteur) et éclaire la tranche des livres ; aucune marque d’école
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = livres, diplôme et fiches ; lumière (#FF0000) = flamme et tranche des livres · **Fond** : rempli d’aplat
- **Cadrage (pour vérifier)** : Bandeau 2:1 pleine largeur de la carte (environ 420 px) ; recadré en 16:9 sur mobile : sujet et lanterne dans la moitié centrale.
- **Format** : 2:1, 1600 × 800 ; 16:9 sur mobile (recadrage mobile 16:9)
- **Fichier attendu** : `site/src/assets/visuels/parcours/PAR-03_1600x800.webp`
- **Master** : `design/assets/visuels/parcours/PAR-03.png` → `node tools/separer-calques.mjs PAR-03` écrit le rendu et `PAR-03_1600x800.aplat.webp`, `PAR-03_1600x800.encre.webp`, `PAR-03_1600x800.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Une pile de livres et un diplôme roulé, la lanterne en serre-livre. »
- **Note** : Posé dans la carte de la porte (pages/parcours.astro) ; décoratif à l’usage (alt vide), le titre de la carte porte le lien. Série « Parcours » : trois quarts en légère plongée, horizon aux deux tiers, trait gravé, deux ou trois aplats, la lanterne seule source de lumière ; aucun texte, aucun chiffre, aucune marque dans l’image.

#### PRO-01 · Architecture logicielle

- **Priorité** : socle · **Méthode** : IMG, à générer (image) · **Série** : Parcours
- **Produit par** : Codex
- **Emplacement** : `/parcours/professionnel` · Professionnel, fiche du poste actuel : colonne de droite de la fiche (320 px) ; sur mobile, bandeau 16:9 pleine largeur sous le texte, pour que le rôle reste en tête _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/config/parcours.ts`, `src/components/parcours/FicheExperience.astro`
- **Sujet** : Architecture logicielle
- **Composition (pour le prompt)** : Une maquette d’architecte d’un petit bâtiment à trois étages, présentée en coupe et vue de trois quarts en légère plongée : chaque étage est une couche (en bas, des casiers de rangement pour les données ; au milieu, des salles reliées par des escaliers et des passerelles pour les services ; en haut, une galerie vitrée pour l’interface) ; des conduits verticaux relient les étages ; la lanterne posée au rez-de-chaussée, au centre (vers 50 % de la largeur et 72 % de la hauteur), éclaire la coupe de bas en haut ; aucun personnage, aucune lettre, aucun élément qui identifie un employeur
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = socle, étages, casiers et conduits ; lumière (#FF0000) = flamme et coupe éclairée · **Fond** : rempli d’aplat
- **Cadrage (pour vérifier)** : Affiché à 320 px de large dans la colonne de la fiche ; bandeau 16:9 pleine largeur sur mobile : sujet centré, rien d’important dans le huitième du haut ni dans le huitième du bas.
- **Format** : 3:2, 1800 × 1200 ; 16:9 sur mobile (recadrage mobile 16:9)
- **Fichier attendu** : `site/src/assets/visuels/parcours/PRO-01_1800x1200.webp`
- **Master** : `design/assets/visuels/parcours/PRO-01.png` → `node tools/separer-calques.mjs PRO-01` écrit le rendu et `PRO-01_1800x1200.aplat.webp`, `PRO-01_1800x1200.encre.webp`, `PRO-01_1800x1200.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Une maquette de bâtiment en coupe, ses trois étages reliés par des conduits, éclairée depuis le rez-de-chaussée. »
- **Note** : Posé dans la fiche (components/parcours/FicheExperience.astro) ; décoratif à l’usage (alt vide), la fiche dit tout. Série « Parcours » : trois quarts en légère plongée, horizon aux deux tiers, trait gravé, deux ou trois aplats, la lanterne seule source de lumière ; aucun texte, aucun chiffre, aucune marque dans l’image. Passé de 900 × 600 à 1800 × 1200 comme le reste de la série, et d’un plan au mur à une coupe de bâtiment pour ne pas répéter PAR-01.

#### PRO-02 · Former jusqu’au titre

- **Priorité** : socle · **Méthode** : IMG, à générer (image) · **Série** : Parcours
- **Produit par** : Codex
- **Emplacement** : `/parcours/professionnel` · Professionnel, fiche Elan Formation : colonne de droite de la fiche (320 px) ; sur mobile, bandeau 16:9 pleine largeur sous le texte, pour que le rôle reste en tête _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/config/parcours.ts`, `src/components/parcours/FicheExperience.astro`
- **Sujet** : Former jusqu’au titre
- **Composition (pour le prompt)** : Un couloir de centre de formation vu de trois quarts en légère plongée : le long du mur, une rangée d’une dizaine de diplômes roulés et noués, posés chacun sur une petite console ; au fond, une porte entrouverte sur une salle vide où l’on devine un tableau couvert d’un schéma à trois blocs ; la lanterne posée sur la première console (vers 24 % de la largeur et 62 % de la hauteur) éclaire la rangée de diplômes ; aucune silhouette, aucun logo d’organisme, aucune écriture
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = couloir, consoles, diplômes et porte ; lumière (#FF0000) = flamme et rangée de diplômes · **Fond** : rempli d’aplat
- **Cadrage (pour vérifier)** : Affiché à 320 px de large dans la colonne de la fiche ; bandeau 16:9 pleine largeur sur mobile : sujet centré, rien d’important dans le huitième du haut ni dans le huitième du bas.
- **Format** : 3:2, 1800 × 1200 ; 16:9 sur mobile (recadrage mobile 16:9)
- **Fichier attendu** : `site/src/assets/visuels/parcours/PRO-02_1800x1200.webp`
- **Master** : `design/assets/visuels/parcours/PRO-02.png` → `node tools/separer-calques.mjs PRO-02` écrit le rendu et `PRO-02_1800x1200.aplat.webp`, `PRO-02_1800x1200.encre.webp`, `PRO-02_1800x1200.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Un couloir où une dizaine de diplômes roulés attendent sur des consoles, éclairés par une lanterne. »
- **Note** : Posé dans la fiche (components/parcours/FicheExperience.astro) ; décoratif à l’usage (alt vide), la fiche dit tout. Série « Parcours » : trois quarts en légère plongée, horizon aux deux tiers, trait gravé, deux ou trois aplats, la lanterne seule source de lumière ; aucun texte, aucun chiffre, aucune marque dans l’image. Passé de la salle vue du pupitre à un couloir de remise des titres pour ne pas répéter ACC-11.

#### PRO-03 · Le pôle

- **Priorité** : socle · **Méthode** : IMG, à générer (image) · **Série** : Parcours
- **Produit par** : Codex
- **Emplacement** : `/parcours/professionnel` · Professionnel, fiche du pôle francophone : colonne de droite de la fiche (320 px) ; sur mobile, bandeau 16:9 pleine largeur sous le texte, pour que le rôle reste en tête _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/config/parcours.ts`, `src/components/parcours/FicheExperience.astro`
- **Sujet** : Le pôle
- **Composition (pour le prompt)** : Une table vue de trois quarts en légère plongée : de petits fanions de couleur unie, plantés chacun sur une fiche, avancent en plusieurs files depuis les bords de la table et convergent vers un seul coffre-dépôt ouvert, au centre ; deux rubans de couleurs différentes se nouent au-dessus du coffre (la fusion) ; la lanterne posée sur le couvercle du coffre (vers 52 % de la largeur et 44 % de la hauteur) éclaire les fiches qui y entrent ; aucun drapeau national, aucun texte, aucun personnage ni décor tiré d’un jeu existant
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = table, fiches, fanions et coffre ; lumière (#FF0000) = flamme et fiches qui entrent dans le coffre · **Fond** : rempli d’aplat
- **Cadrage (pour vérifier)** : Affiché à 320 px de large dans la colonne de la fiche ; bandeau 16:9 pleine largeur sur mobile : sujet centré, rien d’important dans le huitième du haut ni dans le huitième du bas.
- **Format** : 3:2, 1800 × 1200 ; 16:9 sur mobile (recadrage mobile 16:9)
- **Fichier attendu** : `site/src/assets/visuels/parcours/PRO-03_1800x1200.webp`
- **Master** : `design/assets/visuels/parcours/PRO-03.png` → `node tools/separer-calques.mjs PRO-03` écrit le rendu et `PRO-03_1800x1200.aplat.webp`, `PRO-03_1800x1200.encre.webp`, `PRO-03_1800x1200.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Des fiches à fanions convergent de toute la table vers un seul coffre, sous deux rubans noués. »
- **Note** : Posé dans la fiche (components/parcours/FicheExperience.astro) ; décoratif à l’usage (alt vide), la fiche dit tout. Série « Parcours » : trois quarts en légère plongée, horizon aux deux tiers, trait gravé, deux ou trois aplats, la lanterne seule source de lumière ; aucun texte, aucun chiffre, aucune marque dans l’image. Passé d’un tableau à trois colonnes, déjà vu en PRJ-01, CMP-03 et PVZ-05, à des files qui convergent ; rubans noués au lieu de pousses, qui renvoyaient au jeu tiers (règle 1).

#### PRO-04 · Initier au web

- **Priorité** : socle · **Méthode** : IMG, à générer (image) · **Série** : Parcours
- **Produit par** : Codex
- **Emplacement** : `/parcours/professionnel` · Professionnel, fiche Mission Locale : colonne de droite de la fiche (320 px) ; sur mobile, bandeau 16:9 pleine largeur sous le texte, pour que le rôle reste en tête _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/config/parcours.ts`, `src/components/parcours/FicheExperience.astro`
- **Sujet** : Initier au web
- **Composition (pour le prompt)** : Une table d’atelier vue de trois quarts en légère plongée : trois ordinateurs portables ouverts sur un premier programme (lignes de code illisibles), des post-it vierges collés au bord des écrans, des chaises tirées comme à la fin d’un atelier ; la lanterne posée au centre de la table (vers 50 % de la largeur et 58 % de la hauteur) ; aucune silhouette, aucun logo
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = table, chaises, portables et post-it ; lumière (#FF0000) = flamme et écrans éclairés · **Fond** : rempli d’aplat
- **Cadrage (pour vérifier)** : Affiché à 320 px de large dans la colonne de la fiche ; bandeau 16:9 pleine largeur sur mobile : sujet centré, rien d’important dans le huitième du haut ni dans le huitième du bas.
- **Format** : 3:2, 1800 × 1200 ; 16:9 sur mobile (recadrage mobile 16:9)
- **Fichier attendu** : `site/src/assets/visuels/parcours/PRO-04_1800x1200.webp`
- **Master** : `design/assets/visuels/parcours/PRO-04.png` → `node tools/separer-calques.mjs PRO-04` écrit le rendu et `PRO-04_1800x1200.aplat.webp`, `PRO-04_1800x1200.encre.webp`, `PRO-04_1800x1200.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Une table d’atelier avec des ordinateurs portables ouverts et des post-it, éclairée par une lanterne. »
- **Note** : Posé dans la fiche (components/parcours/FicheExperience.astro) ; décoratif à l’usage (alt vide), la fiche dit tout. Série « Parcours » : trois quarts en légère plongée, horizon aux deux tiers, trait gravé, deux ou trois aplats, la lanterne seule source de lumière ; aucun texte, aucun chiffre, aucune marque dans l’image.

#### PRO-05 · 30 % de temps de traitement administratif en moins

- **Priorité** : socle · **Méthode** : IMG, à générer (image) · **Série** : Parcours
- **Produit par** : Codex
- **Emplacement** : `/parcours/professionnel` · Professionnel, fiche du stage : colonne de droite de la fiche (320 px) ; sur mobile, bandeau 16:9 pleine largeur sous le texte, pour que le rôle reste en tête _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/config/parcours.ts`, `src/components/parcours/FicheExperience.astro`
- **Sujet** : 30 % de temps de traitement administratif en moins
- **Composition (pour le prompt)** : Un formulaire de suivi des temps et des contrats posé sur un bureau, vu de trois quarts en légère plongée (cases et colonnes sans aucun chiffre ni mot), un sablier à côté dont le sable du haut a nettement baissé, un tampon et un stylo ; la lanterne (vers 66 % de la largeur et 40 % de la hauteur) éclaire le sablier ; aucun logo de logiciel ni d’entreprise
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = bureau, formulaire, tampon et stylo ; lumière (#FF0000) = flamme et sablier éclairé · **Fond** : rempli d’aplat
- **Cadrage (pour vérifier)** : Affiché à 320 px de large dans la colonne de la fiche ; bandeau 16:9 pleine largeur sur mobile : sujet centré, rien d’important dans le huitième du haut ni dans le huitième du bas.
- **Format** : 3:2, 1800 × 1200 ; 16:9 sur mobile (recadrage mobile 16:9)
- **Fichier attendu** : `site/src/assets/visuels/parcours/PRO-05_1800x1200.webp`
- **Master** : `design/assets/visuels/parcours/PRO-05.png` → `node tools/separer-calques.mjs PRO-05` écrit le rendu et `PRO-05_1800x1200.aplat.webp`, `PRO-05_1800x1200.encre.webp`, `PRO-05_1800x1200.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Un formulaire de suivi des temps posé sur un bureau, à côté d’un sablier dont le sable a baissé. »
- **Note** : Posé dans la fiche (components/parcours/FicheExperience.astro) ; décoratif à l’usage (alt vide), la fiche dit tout. Série « Parcours » : trois quarts en légère plongée, horizon aux deux tiers, trait gravé, deux ou trois aplats, la lanterne seule source de lumière ; aucun texte, aucun chiffre, aucune marque dans l’image. Fait sourcé : −30 % de temps de traitement administratif (docs/matiere-premiere.md) ; l’image ne chiffre rien.

#### PRO-06 · Sur mesure

- **Priorité** : socle · **Méthode** : IMG, à générer (image) · **Série** : Parcours
- **Produit par** : Codex
- **Emplacement** : `/parcours/professionnel` · Professionnel, fiche Dev-Mates : colonne de droite de la fiche (320 px) ; sur mobile, bandeau 16:9 pleine largeur sous le texte, pour que le rôle reste en tête _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/config/parcours.ts`, `src/components/parcours/FicheExperience.astro`
- **Sujet** : Sur mesure
- **Composition (pour le prompt)** : Un cahier des charges relié, ouvert et annoté dans la marge (traits sans texte), posé à côté d’une maquette d’application dessinée sur papier (un écran de téléphone et un écran de navigateur en traits), vus de trois quarts en légère plongée ; une règle et un crayon ; la lanterne (vers 50 % de la largeur et 46 % de la hauteur) éclaire le point où les deux documents se touchent ; aucun logo
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = cahier, maquette, règle et crayon ; lumière (#FF0000) = flamme et point de contact des documents · **Fond** : rempli d’aplat
- **Cadrage (pour vérifier)** : Affiché à 320 px de large dans la colonne de la fiche ; bandeau 16:9 pleine largeur sur mobile : sujet centré, rien d’important dans le huitième du haut ni dans le huitième du bas.
- **Format** : 3:2, 1800 × 1200 ; 16:9 sur mobile (recadrage mobile 16:9)
- **Fichier attendu** : `site/src/assets/visuels/parcours/PRO-06_1800x1200.webp`
- **Master** : `design/assets/visuels/parcours/PRO-06.png` → `node tools/separer-calques.mjs PRO-06` écrit le rendu et `PRO-06_1800x1200.aplat.webp`, `PRO-06_1800x1200.encre.webp`, `PRO-06_1800x1200.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Un cahier des charges annoté à côté d’une maquette d’application dessinée sur papier. »
- **Note** : Posé : l’expérience Dev-Mates est gardée (Q9 : seule la mention « sans client actuellement » est retirée). Posé dans la fiche (components/parcours/FicheExperience.astro) ; décoratif à l’usage (alt vide), la fiche dit tout. Série « Parcours » : trois quarts en légère plongée, horizon aux deux tiers, trait gravé, deux ou trois aplats, la lanterne seule source de lumière ; aucun texte, aucun chiffre, aucune marque dans l’image.

#### CMP-02 · Le tableau et la craie

- **Priorité** : socle · **Méthode** : IMG, à générer (image) · **Série** : Compétences humaines
- **Produit par** : Codex
- **Emplacement** : `/parcours/competences` · Compétences humaines, carte « Pédagogie » (vignette carrée au-dessus de l’intitulé et des verbes) _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/config/competences.ts`, `src/pages/parcours/competences.astro`
- **Sujet** : Le tableau et la craie
- **Composition (pour le prompt)** : Un tableau noir sur pied : un schéma en trois cases reliées par deux flèches, la dernière case plus grande et pleine (l’élève qui va seul) ; un bâton de craie posé sur le rebord, la lanterne au pied du tableau (vers 26 % de la largeur et 84 % de la hauteur) qui l’éclaire de biais ; aucune personne, aucun écran, aucun texte ni chiffre
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = tableau et pied ; lumière (#FF0000) = flamme et schéma éclairé · **Fond** : transparent
- **Cadrage (pour vérifier)** : Vignette carrée affichée de 160 à 270 px : un seul objet principal centré, qui occupe au moins 70 % du cadre et se lit à 160 px.
- **Format** : 1:1, 480 × 480
- **Fichier attendu** : `site/src/assets/visuels/parcours/CMP-02_480x480.webp`
- **Master** : `design/assets/visuels/parcours/CMP-02.png` → `node tools/separer-calques.mjs CMP-02` écrit le rendu et `CMP-02_480x480.aplat.webp`, `CMP-02_480x480.encre.webp`, `CMP-02_480x480.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Un tableau noir et un schéma en trois cases reliées par des flèches, la craie posée au rebord. »
- **Note** : Série de sept vignettes (CMP-02 à CMP-08) vues côte à côte : même cadrage, même hauteur d’horizon, même épaisseur de trait. L’intitulé et les verbes restent en HTML sous l’image : la page la pose en décor (alt vide), l’alt ci-dessous décrit l’image.

#### CMP-03 · Le tableau à colonnes

- **Priorité** : socle · **Méthode** : IMG, à générer (image) · **Série** : Compétences humaines
- **Produit par** : Codex
- **Emplacement** : `/parcours/competences` · Compétences humaines, carte « Coordination » (vignette carrée au-dessus de l’intitulé et des verbes) _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/config/competences.ts`, `src/pages/parcours/competences.astro`
- **Sujet** : Le tableau à colonnes
- **Composition (pour le prompt)** : Un tableau de tâches à trois colonnes vu de face : des cartes vierges, dont deux déplacées d’une colonne à l’autre par des flèches courbes tracées à la main ; une épingle par carte, la lanterne accrochée en haut à droite (vers 82 % de la largeur et 16 % de la hauteur) ; aucune personne, aucun écran, aucun texte ni chiffre
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = tableau et cartes ; lumière (#FF0000) = flamme et cartes déplacées · **Fond** : transparent
- **Cadrage (pour vérifier)** : Vignette carrée affichée de 160 à 270 px : un seul objet principal centré, qui occupe au moins 70 % du cadre et se lit à 160 px.
- **Format** : 1:1, 480 × 480
- **Fichier attendu** : `site/src/assets/visuels/parcours/CMP-03_480x480.webp`
- **Master** : `design/assets/visuels/parcours/CMP-03.png` → `node tools/separer-calques.mjs CMP-03` écrit le rendu et `CMP-03_480x480.aplat.webp`, `CMP-03_480x480.encre.webp`, `CMP-03_480x480.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Un tableau de tâches à trois colonnes, deux cartes déplacées d’une colonne à l’autre. »
- **Note** : Série de sept vignettes (CMP-02 à CMP-08) vues côte à côte : même cadrage, même hauteur d’horizon, même épaisseur de trait. L’intitulé et les verbes restent en HTML sous l’image : la page la pose en décor (alt vide), l’alt ci-dessous décrit l’image.

#### CMP-04 · Le cahier annoté

- **Priorité** : socle · **Méthode** : IMG, à générer (image) · **Série** : Compétences humaines
- **Produit par** : Codex
- **Emplacement** : `/parcours/competences` · Compétences humaines, carte « Écoute et cadrage » (vignette carrée au-dessus de l’intitulé et des verbes) _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/config/competences.ts`, `src/pages/parcours/competences.astro`
- **Sujet** : Le cahier annoté
- **Composition (pour le prompt)** : Un cahier des charges ouvert, pages couvertes de lignes illisibles, la marge annotée de trois points d’interrogation et d’une accolade qui regroupe deux paragraphes ; un crayon posé en travers, la lanterne (vers 80 % de la largeur et 24 % de la hauteur) qui éclaire la page ; aucune personne, aucun écran, aucun texte lisible
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = cahier et crayon ; lumière (#FF0000) = flamme et page éclairée · **Fond** : transparent
- **Cadrage (pour vérifier)** : Vignette carrée affichée de 160 à 270 px : un seul objet principal centré, qui occupe au moins 70 % du cadre et se lit à 160 px.
- **Format** : 1:1, 480 × 480
- **Fichier attendu** : `site/src/assets/visuels/parcours/CMP-04_480x480.webp`
- **Master** : `design/assets/visuels/parcours/CMP-04.png` → `node tools/separer-calques.mjs CMP-04` écrit le rendu et `CMP-04_480x480.aplat.webp`, `CMP-04_480x480.encre.webp`, `CMP-04_480x480.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Un cahier des charges ouvert, la marge annotée de points d’interrogation. »
- **Note** : Série de sept vignettes (CMP-02 à CMP-08) vues côte à côte : même cadrage, même hauteur d’horizon, même épaisseur de trait. L’intitulé et les verbes restent en HTML sous l’image : la page la pose en décor (alt vide), l’alt ci-dessous décrit l’image.

#### CMP-05 · Deux bulles qui se répondent

- **Priorité** : socle · **Méthode** : IMG, à générer (image) · **Série** : Compétences humaines
- **Produit par** : Codex
- **Emplacement** : `/parcours/competences` · Compétences humaines, carte « Communication directe » (vignette carrée au-dessus de l’intitulé et des verbes) _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/config/competences.ts`, `src/pages/parcours/competences.astro`
- **Sujet** : Deux bulles qui se répondent
- **Composition (pour le prompt)** : Deux bulles de dialogue vides qui se répondent, de part et d’autre, à la même hauteur et de même taille (aucune ne domine) ; la lanterne posée entre elles (vers 50 % de la largeur et 70 % de la hauteur), sa lumière touche les deux ; aucune personne, aucun texte
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = bulles ; lumière (#FF0000) = flamme et bords éclairés des deux bulles · **Fond** : transparent
- **Cadrage (pour vérifier)** : Vignette carrée affichée de 160 à 270 px : un seul objet principal centré, qui occupe au moins 70 % du cadre et se lit à 160 px.
- **Format** : 1:1, 480 × 480
- **Fichier attendu** : `site/src/assets/visuels/parcours/CMP-05_480x480.webp`
- **Master** : `design/assets/visuels/parcours/CMP-05.png` → `node tools/separer-calques.mjs CMP-05` écrit le rendu et `CMP-05_480x480.aplat.webp`, `CMP-05_480x480.encre.webp`, `CMP-05_480x480.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Deux bulles de dialogue qui se répondent, une lanterne entre elles. »
- **Note** : Série de sept vignettes (CMP-02 à CMP-08) vues côte à côte : même cadrage, même hauteur d’horizon, même épaisseur de trait. L’intitulé et les verbes restent en HTML sous l’image : la page la pose en décor (alt vide), l’alt ci-dessous décrit l’image.

#### CMP-06 · La carte retournée

- **Priorité** : socle · **Méthode** : IMG, à générer (image) · **Série** : Compétences humaines
- **Produit par** : Codex
- **Emplacement** : `/parcours/competences` · Compétences humaines, carte « Créativité » (vignette carrée au-dessus de l’intitulé et des verbes) _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/config/competences.ts`, `src/pages/parcours/competences.astro`
- **Sujet** : La carte retournée
- **Composition (pour le prompt)** : Un éventail de cartes à jouer toutes identiques, dos visibles, au motif géométrique simple et inventé ; au centre, une seule carte retournée face visible et inclinée à contre-sens, éclairée par la lanterne posée devant l’éventail (vers 50 % de la largeur et 82 % de la hauteur) ; aucune carte d’un jeu existant, aucune illustration de personnage
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = cartes de l’éventail ; lumière (#FF0000) = flamme et carte retournée · **Fond** : transparent
- **Cadrage (pour vérifier)** : Vignette carrée affichée de 160 à 270 px : un seul objet principal centré, qui occupe au moins 70 % du cadre et se lit à 160 px.
- **Format** : 1:1, 480 × 480
- **Fichier attendu** : `site/src/assets/visuels/parcours/CMP-06_480x480.webp`
- **Master** : `design/assets/visuels/parcours/CMP-06.png` → `node tools/separer-calques.mjs CMP-06` écrit le rendu et `CMP-06_480x480.aplat.webp`, `CMP-06_480x480.encre.webp`, `CMP-06_480x480.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Un éventail de cartes identiques et, au milieu, une seule carte retournée à contre-sens. »
- **Note** : Série de sept vignettes (CMP-02 à CMP-08) vues côte à côte : même cadrage, même hauteur d’horizon, même épaisseur de trait. L’intitulé et les verbes restent en HTML sous l’image : la page la pose en décor (alt vide), l’alt ci-dessous décrit l’image.

#### CMP-07 · Le ruban de Möbius

- **Priorité** : socle · **Méthode** : IMG, à générer (image) · **Série** : Compétences humaines
- **Produit par** : Codex
- **Emplacement** : `/parcours/competences` · Compétences humaines, carte « Apprentissage et adaptation » (vignette carrée au-dessus de l’intitulé et des verbes) _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/config/competences.ts`, `src/pages/parcours/competences.astro`
- **Sujet** : Le ruban de Möbius
- **Composition (pour le prompt)** : Un ruban de Möbius posé debout, dessiné comme une boucle : sur une face trois encoches (comprendre, tester, ajuster) figurées par des formes simples (une loupe, une fiole, une clé), sans mots ; la lanterne derrière, au centre (vers 50 % de la largeur et 50 % de la hauteur), le ruban la laisse passer
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = ruban et formes ; lumière (#FF0000) = flamme vue à travers la boucle · **Fond** : transparent
- **Cadrage (pour vérifier)** : Vignette carrée affichée de 160 à 270 px : un seul objet principal centré, qui occupe au moins 70 % du cadre et se lit à 160 px.
- **Format** : 1:1, 480 × 480
- **Fichier attendu** : `site/src/assets/visuels/parcours/CMP-07_480x480.webp`
- **Master** : `design/assets/visuels/parcours/CMP-07.png` → `node tools/separer-calques.mjs CMP-07` écrit le rendu et `CMP-07_480x480.aplat.webp`, `CMP-07_480x480.encre.webp`, `CMP-07_480x480.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Un ruban de Möbius qui porte une loupe, une fiole et une clé : comprendre, tester, ajuster. »
- **Note** : Série de sept vignettes (CMP-02 à CMP-08) vues côte à côte : même cadrage, même hauteur d’horizon, même épaisseur de trait. L’intitulé et les verbes restent en HTML sous l’image : la page la pose en décor (alt vide), l’alt ci-dessous décrit l’image.

#### CMP-08 · Le tableau et le carnet relié

- **Priorité** : socle · **Méthode** : IMG, à générer (image) · **Série** : Compétences humaines
- **Produit par** : Codex
- **Emplacement** : `/parcours/competences` · Compétences humaines, carte « Méthodes de travail » (vignette carrée au-dessus de l’intitulé et des verbes) _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/config/competences.ts`, `src/pages/parcours/competences.astro`
- **Sujet** : Le tableau et le carnet relié
- **Composition (pour le prompt)** : Un petit tableau à colonnes (cartes vierges) relié par un fil à un document épais à onglets, posé à côté ; un trombone sur le document, la lanterne (vers 50 % de la largeur et 78 % de la hauteur) qui éclaire le fil ; aucun logo, aucun texte
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = tableau, document et trombone ; lumière (#FF0000) = flamme et fil éclairé · **Fond** : transparent
- **Cadrage (pour vérifier)** : Vignette carrée affichée de 160 à 270 px : un seul objet principal centré, qui occupe au moins 70 % du cadre et se lit à 160 px.
- **Format** : 1:1, 480 × 480
- **Fichier attendu** : `site/src/assets/visuels/parcours/CMP-08_480x480.webp`
- **Master** : `design/assets/visuels/parcours/CMP-08.png` → `node tools/separer-calques.mjs CMP-08` écrit le rendu et `CMP-08_480x480.aplat.webp`, `CMP-08_480x480.encre.webp`, `CMP-08_480x480.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Un petit tableau à colonnes relié par un fil à un document à onglets. »
- **Note** : Série de sept vignettes (CMP-02 à CMP-08) vues côte à côte : même cadrage, même hauteur d’horizon, même épaisseur de trait. L’intitulé et les verbes restent en HTML sous l’image : la page la pose en décor (alt vide), l’alt ci-dessous décrit l’image. La carte porte le lien officiel de Trello en HTML : aucun logo de Trello dans l’image.

#### FOR-01 · Une application web

- **Priorité** : socle · **Méthode** : IMG, à générer (image) · **Série** : Parcours
- **Produit par** : Codex
- **Emplacement** : `/parcours/formation` · Formation, titre DWWM : à droite du titre obtenu (sous le texte sur mobile, pour que le titre obtenu reste en tête) _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/config/formation.ts`, `src/pages/parcours/formation.astro`
- **Sujet** : Une application web
- **Composition (pour le prompt)** : Une application web en maquette éclatée, vue de trois quarts en légère plongée, en trois plans superposés : à l’avant un écran responsive (un navigateur et un téléphone côte à côte, blocs de contenu sans texte), au milieu un composant d’API (connecteurs, flèches de requête et de réponse), au fond une base de données (cylindres empilés) ; la lanterne posée au pied de la pile (vers 30 % de la largeur et 80 % de la hauteur) éclaire les trois plans ; aucun logo de framework
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = écrans, API et base de données ; lumière (#FF0000) = flamme et faces éclairées des trois plans · **Fond** : rempli d’aplat
- **Cadrage (pour vérifier)** : Affichée jusqu’à 520 px de large à droite du titre obtenu (sous le texte sur mobile).
- **Format** : 16:9, 1400 × 788
- **Fichier attendu** : `site/src/assets/visuels/parcours/FOR-01_1400x788.webp`
- **Master** : `design/assets/visuels/parcours/FOR-01.png` → `node tools/separer-calques.mjs FOR-01` écrit le rendu et `FOR-01_1400x788.aplat.webp`, `FOR-01_1400x788.encre.webp`, `FOR-01_1400x788.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Une application web en trois plans : l’écran, l’API et la base de données. »
- **Note** : Posé dans la carte du titre obtenu ; décoratif à l’usage (alt vide). Série « Parcours » : trois quarts en légère plongée, horizon aux deux tiers, trait gravé, deux ou trois aplats, la lanterne seule source de lumière ; aucun texte, aucun chiffre, aucune marque dans l’image.

#### FOR-02 · Les quatre cinquièmes

- **Priorité** : socle · **Méthode** : IMG, à générer (image) · **Série** : Parcours
- **Produit par** : Codex
- **Emplacement** : `/parcours/formation` · Formation, complément CDA : vignette à gauche du bandeau accolé au titre _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/config/formation.ts`, `src/pages/parcours/formation.astro`
- **Sujet** : Les quatre cinquièmes
- **Composition (pour le prompt)** : Le plan d’une application dessiné sur une grande feuille, vue de trois quarts en légère plongée, découpé en cinq zones : quatre zones tracées et remplies (écrans, services, données, tests, en formes sans mots), la cinquième seulement en pointillés et vide ; un crayon posé sur la zone vide ; la lanterne (vers 22 % de la largeur et 30 % de la hauteur) éclaire les quatre zones achevées
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = feuille, zones et crayon ; lumière (#FF0000) = flamme et quatre zones achevées · **Fond** : rempli d’aplat
- **Cadrage (pour vérifier)** : Vignette d’environ 180 px de large à gauche du bandeau CDA : les cinq zones se distinguent à cette taille.
- **Format** : 3:2, 600 × 400
- **Fichier attendu** : `site/src/assets/visuels/parcours/FOR-02_600x400.webp`
- **Master** : `design/assets/visuels/parcours/FOR-02.png` → `node tools/separer-calques.mjs FOR-02` écrit le rendu et `FOR-02_600x400.aplat.webp`, `FOR-02_600x400.encre.webp`, `FOR-02_600x400.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Un plan d’application rempli aux quatre cinquièmes, la dernière zone en pointillés. »
- **Note** : Posé dans le bandeau du programme CDA ; décoratif à l’usage (alt vide). Série « Parcours » : trois quarts en légère plongée, horizon aux deux tiers, trait gravé, deux ou trois aplats, la lanterne seule source de lumière ; aucun texte, aucun chiffre, aucune marque dans l’image.

#### FOR-03 · Autodidacte vers 13 ans

- **Priorité** : socle · **Méthode** : IMG, à générer (image) · **Série** : Stations de la formation
- **Produit par** : Codex
- **Emplacement** : `/parcours/formation` · Formation, station du chemin d’avant le titre : vignette carrée de 56 px à gauche de l’intitulé (au-dessus de lui dans une colonne étroite), 72 px à gauche du texte sur mobile : la station reste compacte, le titre obtenu domine _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/config/formation.ts`, `src/pages/parcours/formation.astro`
- **Sujet** : Autodidacte vers 13 ans
- **Composition (pour le prompt)** : Un seul objet : un livre ouvert à plat, vu de trois quarts, pages couvertes de lignes illisibles ; la lanterne (vers 80 % de la largeur et 22 % de la hauteur) éclaire la page de droite
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = livre ; lumière (#FF0000) = flamme et page de droite · **Fond** : transparent
- **Cadrage (pour vérifier)** : Vignette de 56 px (72 px sur mobile) : un seul objet silhouetté, qui occupe 80 % du cadre, sans aucun détail fin ni second objet.
- **Format** : 1:1, 384
- **Fichier attendu** : `site/src/assets/visuels/parcours/FOR-03_384x384.webp`
- **Master** : `design/assets/visuels/parcours/FOR-03.png` → `node tools/separer-calques.mjs FOR-03` écrit le rendu et `FOR-03_384x384.aplat.webp`, `FOR-03_384x384.encre.webp`, `FOR-03_384x384.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Un livre ouvert à la lumière d’une lanterne. »
- **Note** : Série de cinq vignettes (FOR-03 à FOR-07) : même cadrage, même lumière, un seul objet chacune ; posées dans la frise de formation, décoratives à l’usage (alt vide).

#### FOR-04 · BUT Informatique

- **Priorité** : socle · **Méthode** : IMG, à générer (image) · **Série** : Stations de la formation
- **Produit par** : Codex
- **Emplacement** : `/parcours/formation` · Formation, station du chemin d’avant le titre : vignette carrée de 56 px à gauche de l’intitulé (au-dessus de lui dans une colonne étroite), 72 px à gauche du texte sur mobile : la station reste compacte, le titre obtenu domine _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/config/formation.ts`, `src/pages/parcours/formation.astro`
- **Sujet** : BUT Informatique
- **Composition (pour le prompt)** : Un seul objet : un grand losange de décision d’organigramme, en relief, d’où partent deux flèches courtes ; la lanterne (vers 78 % de la largeur et 22 % de la hauteur) éclaire sa face
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = losange et flèches ; lumière (#FF0000) = flamme et face du losange · **Fond** : transparent
- **Cadrage (pour vérifier)** : Vignette de 56 px (72 px sur mobile) : un seul objet silhouetté, qui occupe 80 % du cadre, sans aucun détail fin ni second objet.
- **Format** : 1:1, 384
- **Fichier attendu** : `site/src/assets/visuels/parcours/FOR-04_384x384.webp`
- **Master** : `design/assets/visuels/parcours/FOR-04.png` → `node tools/separer-calques.mjs FOR-04` écrit le rendu et `FOR-04_384x384.aplat.webp`, `FOR-04_384x384.encre.webp`, `FOR-04_384x384.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Un losange de décision d’organigramme, d’où partent deux flèches. »
- **Note** : Série de cinq vignettes (FOR-03 à FOR-07) : même cadrage, même lumière, un seul objet chacune ; posées dans la frise de formation, décoratives à l’usage (alt vide).

#### FOR-05 · Physique-chimie

- **Priorité** : socle · **Méthode** : IMG, à générer (image) · **Série** : Stations de la formation
- **Produit par** : Codex
- **Emplacement** : `/parcours/formation` · Formation, station du chemin d’avant le titre : vignette carrée de 56 px à gauche de l’intitulé (au-dessus de lui dans une colonne étroite), 72 px à gauche du texte sur mobile : la station reste compacte, le titre obtenu domine _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/config/formation.ts`, `src/pages/parcours/formation.astro`
- **Sujet** : Physique-chimie
- **Composition (pour le prompt)** : Un seul objet : un erlenmeyer à moitié rempli ; la lanterne (vers 76 % de la largeur et 28 % de la hauteur) éclaire le liquide
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = verre du flacon ; lumière (#FF0000) = flamme et liquide éclairé · **Fond** : transparent
- **Cadrage (pour vérifier)** : Vignette de 56 px (72 px sur mobile) : un seul objet silhouetté, qui occupe 80 % du cadre, sans aucun détail fin ni second objet.
- **Format** : 1:1, 384
- **Fichier attendu** : `site/src/assets/visuels/parcours/FOR-05_384x384.webp`
- **Master** : `design/assets/visuels/parcours/FOR-05.png` → `node tools/separer-calques.mjs FOR-05` écrit le rendu et `FOR-05_384x384.aplat.webp`, `FOR-05_384x384.encre.webp`, `FOR-05_384x384.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Un erlenmeyer à moitié rempli, dont la lanterne éclaire le liquide. »
- **Note** : Série de cinq vignettes (FOR-03 à FOR-07) : même cadrage, même lumière, un seul objet chacune ; posées dans la frise de formation, décoratives à l’usage (alt vide).

#### FOR-06 · BUT Réseaux & Télécoms

- **Priorité** : socle · **Méthode** : IMG, à générer (image) · **Série** : Stations de la formation
- **Produit par** : Codex
- **Emplacement** : `/parcours/formation` · Formation, station du chemin d’avant le titre : vignette carrée de 56 px à gauche de l’intitulé (au-dessus de lui dans une colonne étroite), 72 px à gauche du texte sur mobile : la station reste compacte, le titre obtenu domine _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/config/formation.ts`, `src/pages/parcours/formation.astro`
- **Sujet** : BUT Réseaux & Télécoms
- **Composition (pour le prompt)** : Un seul objet : un commutateur réseau vu de trois quarts, trois câbles branchés sur sa face avant ; la lanterne (vers 76 % de la largeur et 26 % de la hauteur) éclaire les prises ; aucune marque d’équipement
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = boîtier et câbles ; lumière (#FF0000) = flamme et prises éclairées · **Fond** : transparent
- **Cadrage (pour vérifier)** : Vignette de 56 px (72 px sur mobile) : un seul objet silhouetté, qui occupe 80 % du cadre, sans aucun détail fin ni second objet.
- **Format** : 1:1, 384
- **Fichier attendu** : `site/src/assets/visuels/parcours/FOR-06_384x384.webp`
- **Master** : `design/assets/visuels/parcours/FOR-06.png` → `node tools/separer-calques.mjs FOR-06` écrit le rendu et `FOR-06_384x384.aplat.webp`, `FOR-06_384x384.encre.webp`, `FOR-06_384x384.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Un commutateur réseau où sont branchés trois câbles. »
- **Note** : Série de cinq vignettes (FOR-03 à FOR-07) : même cadrage, même lumière, un seul objet chacune ; posées dans la frise de formation, décoratives à l’usage (alt vide).

#### FOR-07 · Une échelle de bassin de piscine

- **Priorité** : socle · **Méthode** : IMG, à générer (image) · **Série** : Stations de la formation
- **Produit par** : Codex
- **Emplacement** : `/parcours/formation` · Formation, station du chemin d’avant le titre : vignette carrée de 56 px à gauche de l’intitulé (au-dessus de lui dans une colonne étroite), 72 px à gauche du texte sur mobile : la station reste compacte, le titre obtenu domine _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/config/formation.ts`, `src/pages/parcours/formation.astro`
- **Sujet pour le prompt** : Une échelle de bassin de piscine
- **Composition (pour le prompt)** : Un seul objet : une échelle de bassin de piscine, deux montants courbes et trois marches qui plongent dans une eau en aplat ; la lanterne posée sur le bord du bassin (vers 78 % de la largeur et 24 % de la hauteur) éclaire la marche du haut ; sans logo ni nom d’école
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = échelle et bord du bassin ; lumière (#FF0000) = flamme et marche du haut · **Fond** : transparent
- **Cadrage (pour vérifier)** : Vignette de 56 px (72 px sur mobile) : un seul objet silhouetté, qui occupe 80 % du cadre, sans aucun détail fin ni second objet.
- **Format** : 1:1, 384
- **Fichier attendu** : `site/src/assets/visuels/parcours/FOR-07_384x384.webp`
- **Master** : `design/assets/visuels/parcours/FOR-07.png` → `node tools/separer-calques.mjs FOR-07` écrit le rendu et `FOR-07_384x384.aplat.webp`, `FOR-07_384x384.encre.webp`, `FOR-07_384x384.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Une échelle de bassin de piscine, sa marche du haut éclairée. »
- **Note** : Série de cinq vignettes (FOR-03 à FOR-07) : même cadrage, même lumière, un seul objet chacune ; posées dans la frise de formation, décoratives à l’usage (alt vide).

### Socle · Contact

#### CON-01 · L’invitation : une enveloppe ouverte éclairée par la lanterne

- **Priorité** : socle · **Méthode** : IMG, à générer (image) · **Série** : États et lanterne du logo
- **Produit par** : Codex
- **Emplacement** : `/contact` · Contact, signe de la page : en tête de la carte du formulaire, à droite du titre « M’écrire » _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/pages/contact.astro`
- **Sujet** : L’invitation : une enveloppe ouverte éclairée par la lanterne
- **Composition (pour le prompt)** : Une enveloppe de papier épais posée de trois quarts, rabat ouvert vers le haut ; la lanterne du logo (cage à quatre montants, anneau, flamme en goutte) est posée juste derrière (vers 56 % de la largeur et 36 % de la hauteur), et sa lumière sort de l’enveloppe comme si la lettre l’emportait. Gravure en réserve, trait régulier, aucun personnage. Aucun texte, aucun timbre, aucune adresse
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = papier de l’enveloppe ; lumière (#FF0000) = flamme et halo qui sort de l’enveloppe · **Fond** : transparent
- **Cadrage (pour vérifier)** : Le sujet occupe 70 % du cadre et reste lisible à 88 px (signe de la page, à droite du titre « M’écrire »).
- **Format** : 1:1, 480 × 480, fond transparent
- **Fichier attendu** : `site/src/assets/visuels/contact/CON-01_480x480.webp`
- **Master** : `design/assets/visuels/contact/CON-01.png` → `node tools/separer-calques.mjs CON-01` écrit le rendu et `CON-01_480x480.aplat.webp`, `CON-01_480x480.encre.webp`, `CON-01_480x480.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Une enveloppe ouverte d’où sort la lumière d’une lanterne. »
- **Note** : Décoratif dans la page (alt vide passé par la page) : il remplace la plume de l’ancienne carte du formulaire.

#### CON-02 · Message reçu : la lanterne allumée sur une lettre cachetée

- **Priorité** : socle · **Méthode** : IMG, à générer (image) · **Série** : États et lanterne du logo
- **Produit par** : Codex
- **Emplacement** : `/contact` · Contact, panneau de réussite qui s’ouvre sous le bouton d’envoi _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/pages/contact.astro`
- **Sujet** : Message reçu : la lanterne allumée sur une lettre cachetée
- **Composition (pour le prompt)** : La lanterne du logo, flamme haute et halo net, posée sur une lettre pliée fermée par un cachet de cire rond et lisse (sans motif ni initiale) ; vue de face, légère plongée. Gravure en réserve. Aucun texte
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = papier de la lettre ; lumière (#FF0000) = flamme, halo et reflet sur le cachet · **Fond** : transparent
- **Cadrage (pour vérifier)** : Sujet centré à 75 % du cadre, lisible à 96 px.
- **Format** : 1:1, 360 × 360, fond transparent
- **Fichier attendu** : `site/src/assets/visuels/contact/CON-02_360x360.webp`
- **Master** : `design/assets/visuels/contact/CON-02.png` → `node tools/separer-calques.mjs CON-02` écrit le rendu et `CON-02_360x360.aplat.webp`, `CON-02_360x360.encre.webp`, `CON-02_360x360.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Une lanterne allumée posée sur une lettre cachetée. »
- **Note** : Décoratif dans la page (le message d’état dit la réussite) : affiché par CSS seulement quand l’état du formulaire vaut « success ».

#### CON-03 · Patience : la lanterne à flamme basse et un sablier

- **Priorité** : socle · **Méthode** : IMG, à générer (image) · **Série** : États et lanterne du logo
- **Produit par** : Codex
- **Emplacement** : `/contact` · Contact, message d’erreur ou de limite d’envoi, sous le bouton _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/pages/contact.astro`
- **Sujet** : Patience : la lanterne à flamme basse et un sablier
- **Composition (pour le prompt)** : La lanterne du logo, flamme réduite à une petite goutte, halo à peine visible ; à sa droite un petit sablier dont le sable est à moitié tombé. Même angle et même trait que CON-02, pour qu’on reconnaisse la même scène. Aucun texte
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = verre du sablier et sable ; lumière (#FF0000) = flamme réduite · **Fond** : transparent
- **Cadrage (pour vérifier)** : Lisible à 96 px.
- **Format** : 1:1, 360 × 360, fond transparent
- **Fichier attendu** : `site/src/assets/visuels/contact/CON-03_360x360.webp`
- **Master** : `design/assets/visuels/contact/CON-03.png` → `node tools/separer-calques.mjs CON-03` écrit le rendu et `CON-03_360x360.aplat.webp`, `CON-03_360x360.encre.webp`, `CON-03_360x360.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Une lanterne à la flamme basse à côté d’un sablier. »
- **Note** : Décoratif dans la page (le message d’état dit l’erreur) : affiché par CSS seulement quand l’état du formulaire vaut « error ».

### Socle · Blog

#### BLG-01 · Les pages à écrire : le livre du logo ouvert, éclairé par la lanterne

- **Priorité** : socle · **Méthode** : IMG, à générer (image) · **Série** : États et lanterne du logo
- **Produit par** : Codex
- **Emplacement** : `/blog` · Blog sans article : la zone éclairée, à droite du titre (sous le titre sur mobile) _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/pages/blog.astro`
- **Sujet** : Les pages à écrire : le livre du logo ouvert, éclairé par la lanterne
- **Composition (pour le prompt)** : Le livre du logo ouvert à plat, vu en légère plongée, sur des pages blanches dont seule la première est éclairée ; la lanterne posée en haut à droite du livre (vers 74 % de la largeur et 26 % de la hauteur) est la seule source de lumière, son halo s’arrête au bord de la page ; un crayon posé en travers de la page de gauche, pointe vers la lumière. Le reste du cadre reste dans l’ombre. Aucune écriture sur les pages
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = papier des pages ; lumière (#FF0000) = flamme et page éclairée · **Fond** : transparent
- **Cadrage (pour vérifier)** : Le livre occupe 70 % de la largeur ; affiché jusqu’à 640 px à droite du titre (sous le titre sur mobile).
- **Format** : 4:3, 960 × 720, fond transparent
- **Fichier attendu** : `site/src/assets/visuels/blog/BLG-01_960x720.webp`
- **Master** : `design/assets/visuels/blog/BLG-01.png` → `node tools/separer-calques.mjs BLG-01` écrit le rendu et `BLG-01_960x720.aplat.webp`, `BLG-01_960x720.encre.webp`, `BLG-01_960x720.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Un livre ouvert sur des pages blanches, éclairé par une lanterne, un crayon posé dessus. »
- **Note** : Décoratif dans la page (la phrase dit que le blog est vide). Disparaît avec l’état vide quand le serveur injecte la liste des articles.

### Socle · États : 404 et hors ligne

#### ERR-01 · La page qui manque : un manuel ouvert, une page arrachée

- **Priorité** : socle · **Méthode** : IMG, à générer (image) · **Série** : États et lanterne du logo
- **Produit par** : Codex
- **Emplacement** : `/404` · 404, la zone éclairée, à droite du titre (sous le titre sur mobile) _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/pages/404.astro`
- **Sujet** : La page qui manque : un manuel ouvert, une page arrachée
- **Composition (pour le prompt)** : Un manuel relié ouvert à plat, vu en légère plongée ; au milieu, le talon d’une page arrachée (bord déchiré net, quelques fibres) ; la lanterne du logo, posée sur la page de droite (vers 62 % de la largeur et 40 % de la hauteur), éclaire précisément le vide laissé par la page, le reste du livre est dans l’ombre. Aucune écriture, aucun numéro de page
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = papier du manuel ; lumière (#FF0000) = flamme, halo et vide de la page · **Fond** : transparent
- **Cadrage (pour vérifier)** : Le livre occupe 75 % de la largeur ; le coin bas droit reste calme : un médaillon photo (ERR-PHO) s’y pose.
- **Format** : 4:3, 1280 × 960, fond transparent
- **Fichier attendu** : `site/src/assets/visuels/etats/ERR-01_1280x960.webp`
- **Master** : `design/assets/visuels/etats/ERR-01.png` → `node tools/separer-calques.mjs ERR-01` écrit le rendu et `ERR-01_1280x960.aplat.webp`, `ERR-01_1280x960.encre.webp`, `ERR-01_1280x960.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Un manuel ouvert dont une page a été arrachée, éclairé par une lanterne. »
- **Note** : Reprend ETA-01 de docs/assets-complementaires.md (direction précédente). Décoratif dans la page (le titre dit déjà que la page manque).

### Élargi · Accueil

#### ACC-05 · Apprendre le C, pour passer ensuite au C++ et coder des jeux

- **Priorité** : élargi · **Méthode** : IMG, à générer (image) · **Série** : Scènes du récit
- **Produit par** : Codex
- **Emplacement** : `/` · 01, vers 13 ans _(contexte : ne pas le recopier dans un prompt)_
- **Élargi, non posé** : aucune scène de l’accueil ne l’appelle ; la frise de la formation garde l’autodidacte en vignette (FOR-03).
- **Sujet** : Apprendre le C, pour passer ensuite au C++ et coder des jeux
- **Composition (pour le prompt)** : Une chambre d’adolescent vue de trois quarts, en léger surplomb : un vieux PC à écran bombé allumé sur un bureau, un livre de programmation ouvert à plat près du clavier, quelques feuilles de listing aux lignes illisibles ; au mur, un croquis de niveau de jeu épinglé (plateformes et échelles en simples traits) ; la lanterne posée sur le bureau, à gauche de l’écran (vers 30 % de la largeur et 55 % de la hauteur), éclaire le livre ; aucun personnage, aucune manette ni console de marque, aucun caractère lisible à l’écran ni sur les feuilles
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = murs, bureau, feuilles et écran ; lumière (#FF0000) = flamme, livre ouvert et lueur de l’écran · **Fond** : rempli d’aplat
- **Cadrage (pour vérifier)** : Recadrable en 4:5 sur mobile autour du bureau et de la lanterne.
- **Format** : 4:3, 1600 × 1200
- **Fichier attendu** : `site/src/assets/visuels/accueil/ACC-05_1600x1200.webp`
- **Master** : `design/assets/visuels/accueil/ACC-05.png` → `node tools/separer-calques.mjs ACC-05` écrit le rendu et `ACC-05_1600x1200.aplat.webp`, `ACC-05_1600x1200.encre.webp`, `ACC-05_1600x1200.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Un vieux PC allumé dans une chambre d’adolescent, un livre de programmation ouvert et un croquis de niveau au mur. »

#### ACC-07 · Le plateau puis la percée

- **Priorité** : élargi · **Méthode** : IMG, à générer (image) · **Série** : Scènes du récit
- **Produit par** : Codex
- **Emplacement** : `/` · 01, Gwent, ouverture _(contexte : ne pas le recopier dans un prompt)_
- **Élargi, non posé** : la figure du plafond (ACC-06) et les cartes de la méthode (ACC-18 à ACC-20) portent déjà cette partie du récit.
- **Sujet** : Le plateau puis la percée
- **Composition (pour le prompt)** : Un joueur en silhouette, de dos et sans visage, assis devant une table vue de trois quarts : devant lui, une colonne de cartes identiques, dos visibles, bute sous une barre de lumière tendue au-dessus de la table comme un plafond ; une seule carte, retournée face visible (une forme géométrique simple), traverse la barre et monte au-dessus ; la lanterne posée sur la table, à droite (vers 70 % de la largeur et 60 % de la hauteur), éclaire la carte qui perce ; aucune carte, aucun symbole ni logo d’un jeu existant, aucun chiffre
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = table, cartes et silhouette ; lumière (#FF0000) = flamme, barre de lumière et carte qui perce · **Fond** : rempli d’aplat
- **Cadrage (pour vérifier)** : Recadrable en 4:5 sur mobile autour de la colonne de cartes et de la carte qui perce.
- **Format** : 16:9, 1920 × 1080
- **Fichier attendu** : `site/src/assets/visuels/accueil/ACC-07_1920x1080.webp`
- **Master** : `design/assets/visuels/accueil/ACC-07.png` → `node tools/separer-calques.mjs ACC-07` écrit le rendu et `ACC-07_1920x1080.aplat.webp`, `ACC-07_1920x1080.encre.webp`, `ACC-07_1920x1080.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Un joueur de dos devant une colonne de cartes bloquée sous une barre de lumière, qu’une seule carte retournée traverse. »

#### ACC-16 · La lanterne posée sur un livre ouvert, un chemin éclairé devant

- **Priorité** : élargi · **Méthode** : IMG, à générer (image) · **Série** : Scènes du récit
- **Produit par** : Codex
- **Emplacement** : `/` · 03, conclusion _(contexte : ne pas le recopier dans un prompt)_
- **Élargi, non posé** : la conclusion de l’accueil, « La suite », est un acte bleu nuit sans image, avec l’aplat bleu roi derrière « Discutons » (décision du 13/10/2026).
- **Sujet** : La lanterne posée sur un livre ouvert, un chemin éclairé devant
- **Composition (pour le prompt)** : Un livre ouvert posé à plat sur une table, vu de trois quarts en légère plongée, dans la moitié gauche du cadre ; la lanterne posée sur la page de droite (vers 34 % de la largeur et 46 % de la hauteur) projette devant le livre un chemin de lumière qui file vers le bord droit ; la moitié droite reste un aplat calme, sans détail ; aucun personnage, aucune écriture sur les pages
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = table et pages du livre ; lumière (#FF0000) = flamme et chemin de lumière · **Fond** : rempli d’aplat
- **Cadrage (pour vérifier)** : Moitié droite libre pour un bouton posé en HTML ; recadrage 4:5 sur mobile centré sur le livre et la lanterne.
- **Format** : 16:9, 1920 × 1080
- **Fichier attendu** : `site/src/assets/visuels/accueil/ACC-16_1920x1080.webp`
- **Master** : `design/assets/visuels/accueil/ACC-16.png` → `node tools/separer-calques.mjs ACC-16` écrit le rendu et `ACC-16_1920x1080.aplat.webp`, `ACC-16_1920x1080.encre.webp`, `ACC-16_1920x1080.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Une lanterne posée sur un livre ouvert éclaire un chemin qui file vers la droite. »
- **Note** : Reprend ILL-08 de docs/assets-complementaires.md (direction précédente).

### Élargi · Projets (vitrine)

#### PRJ-09 · La veille qui devient lecture

- **Priorité** : élargi · **Méthode** : IMG, à générer (image) · **Série** : Vitrine des projets
- **Produit par** : Codex
- **Emplacement** : `/projets` · « Aussi », MaVeille (si le site revient) _(contexte : ne pas le recopier dans un prompt)_
- **Élargi, non posé** : MaVeille n’est pas dans la rangée « Aussi » tant que son site n’est pas de retour en ligne.
- **Sujet** : La veille qui devient lecture
- **Composition (pour le prompt)** : Sur une table vue de trois quarts en légère plongée, une pile de rapports imprimés à gauche, aux tranches marquées de simples traits ; à droite, une seule page reliée, ouverte, dont la marge porte un sommaire en traits courts ; un ruban de lumière relie le haut de la pile à la page ; la lanterne posée derrière la page (vers 66 % de la largeur et 40 % de la hauteur) l’éclaire ; aucun chiffre, aucune date ni lettre lisible
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = table, rapports et page ; lumière (#FF0000) = flamme, ruban de lumière et page ouverte · **Fond** : rempli d’aplat
- **Cadrage (pour vérifier)** : Vignette de la rangée « Aussi », 4:3, environ 300 px de large sur ordinateur et 45 % de la largeur sur mobile : le sujet se lit à cette taille.
- **Format** : 4:3
- **Fichier attendu** : `site/src/assets/visuels/projets/PRJ-09_1600x1200.webp`
- **Master** : `design/assets/visuels/projets/PRJ-09.png` → `node tools/separer-calques.mjs PRJ-09` écrit le rendu et `PRJ-09_1600x1200.aplat.webp`, `PRJ-09_1600x1200.encre.webp`, `PRJ-09_1600x1200.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Une pile de rapports imprimés, reliée par un ruban de lumière à une page ouverte et son sommaire. »

#### PRJ-12 · La version précédente

- **Priorité** : élargi · **Méthode** : IMG, à générer (image) · **Série** : Vitrine des projets
- **Produit par** : Codex
- **Emplacement** : `/projets` · Archives (quand elles existent) _(contexte : ne pas le recopier dans un prompt)_
- **Élargi, non posé** : le volet des projets archivés est vide ; il reste une simple ligne tant qu’il ne contient aucun projet.
- **Sujet** : La version précédente
- **Composition (pour le prompt)** : Une étagère vue de face, en légère plongée : à gauche, un livre plus ancien, fermé, debout, au dos usé et sans titre ; à droite, posé à plat sur la tablette, un manuel neuf ouvert ; la lanterne posée entre les deux (vers 50 % de la largeur et 58 % de la hauteur) éclaire le dos de l’ancien livre ; aucun titre, aucune lettre
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = étagère et livres ; lumière (#FF0000) = flamme et dos de l’ancien livre · **Fond** : rempli d’aplat
- **Cadrage (pour vérifier)** : Vignette 4:3 d’environ 300 px de large : les deux livres se lisent à cette taille.
- **Format** : 4:3
- **Fichier attendu** : `site/src/assets/visuels/projets/PRJ-12_1600x1200.webp`
- **Master** : `design/assets/visuels/projets/PRJ-12.png` → `node tools/separer-calques.mjs PRJ-12` écrit le rendu et `PRJ-12_1600x1200.aplat.webp`, `PRJ-12_1600x1200.encre.webp`, `PRJ-12_1600x1200.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Un livre ancien debout sur une étagère, à côté d’un manuel neuf ouvert, éclairé par une lanterne. »
- **Note** : Reprend ILL-10 de docs/assets-complementaires.md (direction précédente).

### Élargi · PvZ Fusion

#### PVZ-09 · Rattraper, puis ne plus décrocher

- **Priorité** : élargi · **Méthode** : IMG, à générer (image) · **Série** : PvZ Fusion, scènes
- **Produit par** : Codex
- **Emplacement** : `/projets/pvz-fusion` · § 4, à côté de la courbe _(contexte : ne pas le recopier dans un prompt)_
- **Élargi, non posé** : la courbe du rattrapage (PVZ-F1) porte le fait ; l’image ne ferait que le répéter.
- **Sujet** : Rattraper, puis ne plus décrocher
- **Composition (pour le prompt)** : Diptyque en une seule image, deux moitiés séparées par un filet vertical, vues de profil, horizon à mi-hauteur : à gauche, une petite équipe de silhouettes sans visage marche derrière un long train de wagons chargés de fiches, qui s’allonge et la distance ; à droite, la même équipe marche à hauteur de la locomotive ; la lanterne, tenue par la silhouette de tête dans la moitié droite (vers 72 % de la largeur et 46 % de la hauteur), éclaire la locomotive ; aucun texte ni chiffre
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = train, wagons, fiches et silhouettes ; lumière (#FF0000) = flamme et locomotive éclairée · **Fond** : rempli d’aplat
- **Cadrage (pour vérifier)** : Sur mobile, les deux moitiés passent l’une au-dessus de l’autre : chacune doit se lire seule en 8:9.
- **Format** : 16:9
- **Fichier attendu** : `site/src/assets/visuels/pvz-fusion/PVZ-09_1600x900.webp`
- **Master** : `design/assets/visuels/pvz-fusion/PVZ-09.png` → `node tools/separer-calques.mjs PVZ-09` écrit le rendu et `PVZ-09_1600x900.aplat.webp`, `PVZ-09_1600x900.encre.webp`, `PVZ-09_1600x900.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Deux moments : une petite équipe derrière un long train de fiches, puis à sa hauteur. »

#### PVZ-10 · Un outil en ligne de commande dans un terminal

- **Priorité** : élargi · **Méthode** : IMG, à générer (image) · **Série** : PvZ Fusion, scènes
- **Produit par** : Codex
- **Emplacement** : `/projets/pvz-fusion` · § 3, bloc outil _(contexte : ne pas le recopier dans un prompt)_
- **Élargi, non posé** : le bloc de l’outil pose PVZ-04 ; la capture réelle du Console Manager (PVZ-C2) prendra cette place dès qu’elle existe.
- **Sujet pour le prompt** : Un outil en ligne de commande dans un terminal
- **Composition (pour le prompt)** : Une fenêtre de terminal générique vue de face, en légère plongée, sur un bureau : deux colonnes de barres horizontales de longueurs variées, sans aucun caractère ; dans la colonne de droite, quelques barres manquent et laissent des creux ; la lanterne posée devant la fenêtre, à droite (vers 78 % de la largeur et 70 % de la hauteur), éclaire seulement les creux ; aucun caractère, aucune lettre, aucun chiffre, aucune marque
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = bureau, fenêtre et barres ; lumière (#FF0000) = flamme et creux éclairés · **Fond** : rempli d’aplat
- **Cadrage (pour vérifier)** : Recadrable en 1:1 autour des deux colonnes.
- **Format** : 4:3
- **Fichier attendu** : `site/src/assets/visuels/pvz-fusion/PVZ-10_1600x1200.webp`
- **Master** : `design/assets/visuels/pvz-fusion/PVZ-10.png` → `node tools/separer-calques.mjs PVZ-10` écrit le rendu et `PVZ-10_1600x1200.aplat.webp`, `PVZ-10_1600x1200.encre.webp`, `PVZ-10_1600x1200.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Un terminal à deux colonnes de lignes, dont les lignes manquantes sont éclairées par une lanterne. »

### Élargi · League Of Data Base

#### LOD-02 · Le voyage dans le temps

- **Priorité** : élargi · **Méthode** : IMG, à générer (image) · **Série** : Pages de projet
- **Produit par** : Codex
- **Emplacement** : `/projets/league-of-database` · § 1, fond _(contexte : ne pas le recopier dans un prompt)_
- **Élargi, non posé** : le tableau d’Ahri se lit mieux sur un fond uni (refonte du 13 octobre 2026) ; à poser seulement si une version très claire ne gêne pas la lecture.
- **Sujet** : Le voyage dans le temps
- **Composition (pour le prompt)** : Un sablier stylisé vu de face, dans le tiers gauche du cadre (vers 18 % de la largeur), dont le sable est fait de minuscules signes géométriques (points, traits, losanges) ; un aplat très clair, à faible contraste ; les deux tiers droits restent vides, en réserve ; la lanterne posée au pied du sablier (vers 18 % de la largeur et 80 % de la hauteur) éclaire le bulbe du bas ; aucun chiffre ni lettre
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = sablier et signes ; lumière (#FF0000) = flamme et bulbe du bas · **Fond** : transparent
- **Cadrage (pour vérifier)** : Fond de section 21:9 derrière un tableau posé en HTML à droite : rien dans les deux tiers droits ; aplat à moins de 6 % d’opacité une fois posé.
- **Format** : 21:9, faible contraste
- **Fichier attendu** : `site/src/assets/visuels/league-of-database/LOD-02_2100x900.webp`
- **Master** : `design/assets/visuels/league-of-database/LOD-02.png` → `node tools/separer-calques.mjs LOD-02` écrit le rendu et `LOD-02_2100x900.aplat.webp`, `LOD-02_2100x900.encre.webp`, `LOD-02_2100x900.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Un sablier dont le sable est fait de petits signes, à gauche d’un grand espace vide. »

### Élargi · Bloodborne Legendary Run

#### BLR-03 · Du wiki à la fiche française

- **Priorité** : élargi · **Méthode** : IMG, à générer (image) · **Série** : Pages de projet
- **Produit par** : Codex
- **Emplacement** : `/projets/bloodborne-legendary-run` · § 4 _(contexte : ne pas le recopier dans un prompt)_
- **Élargi, non posé** : la section du guide montre la vraie fiche du Père Gascoigne (refonte du 13/10/2026) ; place prévue sous ses trois repères.
- **Sujet** : Du wiki à la fiche française
- **Composition (pour le prompt)** : Quatre vignettes reliées par des flèches, de gauche à droite, vues de face : une page source dense (blocs de lignes illisibles), un tableau à colonnes, un dictionnaire ouvert à deux colonnes, puis une fiche nette ; au-dessus du tableau, une loupe sur une cellule vide marquée d’un trait court ; la lanterne posée sous la fiche finale (vers 86 % de la largeur et 72 % de la hauteur) l’éclaire ; aucun caractère lisible, aucune référence visuelle à un jeu
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = vignettes, flèches et loupe ; lumière (#FF0000) = flamme et fiche finale · **Fond** : transparent
- **Cadrage (pour vérifier)** : Sur mobile, les quatre vignettes passent en grille de deux sur deux : chacune se lit seule.
- **Format** : 16:9
- **Fichier attendu** : `site/src/assets/visuels/bloodborne/BLR-03_1600x900.webp`
- **Master** : `design/assets/visuels/bloodborne/BLR-03.png` → `node tools/separer-calques.mjs BLR-03` écrit le rendu et `BLR-03_1600x900.aplat.webp`, `BLR-03_1600x900.encre.webp`, `BLR-03_1600x900.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Quatre vignettes reliées, de la page source à la fiche, une loupe sur une cellule vide. »

#### BLR-04 · Une réussite, une étoile

- **Priorité** : élargi · **Méthode** : IMG, à générer (image) · **Série** : Pages de projet
- **Produit par** : Codex
- **Emplacement** : `/projets/bloodborne-legendary-run` · § 2, poster de repli _(contexte : ne pas le recopier dans un prompt)_
- **Élargi, non posé** : les quatre vidéos ont déjà un poster réel pris au milieu de la cérémonie (BLR-C4), qui reste affiché en mouvement réduit.
- **Sujet** : Une réussite, une étoile
- **Composition (pour le prompt)** : Une main en silhouette, vue de face, l’index levé ; au bout du doigt, une étoile allumée ; autour de l’étoile, un anneau de progression rempli aux trois quarts ; la lanterne posée en bas à droite (vers 74 % de la largeur et 80 % de la hauteur) éclaire l’étoile ; aucune référence au jeu, aucun chiffre
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = main et anneau ; lumière (#FF0000) = flamme et étoile allumée · **Fond** : transparent
- **Cadrage (pour vérifier)** : Poster carré, affiché à la taille de la vidéo (390 px de large au plus) : l’étoile au centre.
- **Format** : 1:1, 800
- **Fichier attendu** : `site/src/assets/visuels/bloodborne/BLR-04_800x800.webp`
- **Master** : `design/assets/visuels/bloodborne/BLR-04.png` → `node tools/separer-calques.mjs BLR-04` écrit le rendu et `BLR-04_800x800.aplat.webp`, `BLR-04_800x800.encre.webp`, `BLR-04_800x800.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Une étoile allumée au bout d’un doigt, entourée d’un anneau rempli aux trois quarts. »

#### BLR-05 · Un ciel dans la main

- **Priorité** : élargi · **Méthode** : IMG, à générer (image) · **Série** : Pages de projet
- **Produit par** : Codex
- **Emplacement** : `/projets/bloodborne-legendary-run` · Hub (si les captures ne suffisent pas) _(contexte : ne pas le recopier dans un prompt)_
- **Élargi, non posé** : les captures réelles de l’en-tête et de l’atlas suffisent.
- **Sujet** : Un ciel dans la main
- **Composition (pour le prompt)** : Un téléphone générique tenu dans une main en silhouette, vu de trois quarts : à l’écran, une constellation de six étoiles reliées par des traits ; le pouce se pose sur une étoile, qui s’allume ; la lanterne posée hors champ à droite (sa lumière entre vers 90 % de la largeur et 40 % de la hauteur) éclaire l’écran ; aucune interface lisible, aucune marque
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = main et téléphone ; lumière (#FF0000) = étoile allumée et lumière sur l’écran · **Fond** : transparent
- **Cadrage (pour vérifier)** : Portrait 4:5 : le téléphone et le pouce au centre.
- **Format** : 4:5, 960 × 1200
- **Fichier attendu** : `site/src/assets/visuels/bloodborne/BLR-05_960x1200.webp`
- **Master** : `design/assets/visuels/bloodborne/BLR-05.png` → `node tools/separer-calques.mjs BLR-05` écrit le rendu et `BLR-05_960x1200.aplat.webp`, `BLR-05_960x1200.encre.webp`, `BLR-05_960x1200.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Un téléphone tenu en main affiche une constellation ; le pouce allume une étoile. »

### Élargi · gup

#### GUP-03 · Une commande, tout mettre à jour

- **Priorité** : élargi · **Méthode** : IMG, à générer (image) · **Série** : Pages de projet
- **Produit par** : Codex
- **Emplacement** : `/projets/gup` · Partage, hub de repli _(contexte : ne pas le recopier dans un prompt)_
- **Élargi, non posé** : la carte de la vitrine et l’image de partage montrent d’abord la vraie capture (src/assets/projets/gup/packages-select.webp) ; celle-ci sert de repli.
- **Sujet** : Une commande, tout mettre à jour
- **Composition (pour le prompt)** : Une fenêtre de terminal vide de tout caractère, au centre, éclairée par une lanterne posée devant elle (vers 50 % de la largeur et 70 % de la hauteur), d’où partent des rayons fins vers une douzaine de paquets génériques disposés en arc, qui s’allument là où le rayon les touche ; aucun caractère, aucune lettre, aucun logo
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = fenêtre et paquets ; lumière (#FF0000) = flamme, rayons et paquets touchés · **Fond** : rempli d’aplat
- **Cadrage (pour vérifier)** : Lisible recadrée en 1200 × 630 (partage) : la fenêtre et la lanterne au centre.
- **Format** : 1200 × 630 ; 16:10
- **Fichier attendu** : `site/src/assets/visuels/gup/GUP-03_1600x1000.webp`
- **Master** : `design/assets/visuels/gup/GUP-03.png` → `node tools/separer-calques.mjs GUP-03` écrit le rendu et `GUP-03_1600x1000.aplat.webp`, `GUP-03_1600x1000.encre.webp`, `GUP-03_1600x1000.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Une fenêtre de terminal éclairée par une lanterne, d’où partent des rayons vers des paquets. »

### Élargi · Parcours : hub, professionnel, compétences, formation

#### CMP-01 · L’établi

- **Priorité** : élargi · **Méthode** : IMG, à générer (image) · **Série** : Parcours
- **Produit par** : Codex
- **Emplacement** : `/parcours/competences` · Compétences, en-tête (non posé : la page tient en quatre écrans sans lui) _(contexte : ne pas le recopier dans un prompt)_
- **Élargi, non posé** : la page des compétences tient en quatre écrans sans lui ; à poser seulement si Charles veut une image d’en-tête.
- **Sujet** : L’établi
- **Composition (pour le prompt)** : Un panneau perforé d’atelier vu de face : chaque outil est accroché devant sa silhouette peinte, en quatre groupes (gabarits et équerres, connecteurs et câbles, tiroirs de fiches, caisse scellée) ; une silhouette reste vide, l’outil sorti ; la lanterne accrochée en haut à gauche (vers 14 % de la largeur et 22 % de la hauteur) éclaire la silhouette vide ; pas d’écran, pas de personnage, aucun mot
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = panneau, outils et silhouettes peintes ; lumière (#FF0000) = flamme et silhouette vide · **Fond** : rempli d’aplat
- **Cadrage (pour vérifier)** : En-tête 21:9 au-dessus du niveau « Au quotidien » : recadrable en 16:9 sur mobile.
- **Format** : 21:9, 1600 × 685
- **Fichier attendu** : `site/src/assets/visuels/parcours/CMP-01_1600x685.webp`
- **Master** : `design/assets/visuels/parcours/CMP-01.png` → `node tools/separer-calques.mjs CMP-01` écrit le rendu et `CMP-01_1600x685.aplat.webp`, `CMP-01_1600x685.encre.webp`, `CMP-01_1600x685.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Un panneau d’atelier où chaque outil pend devant sa silhouette, l’une vide, éclairée par une lanterne. »
- **Note** : Passé d’un établi à quatre compartiments, déjà vu en PAR-02, à un panneau d’outils.

### Élargi · Blog

#### BLG-02 · Couverture de secours : la lanterne sur une page de livre

- **Priorité** : élargi · **Méthode** : IMG, à générer (image) · **Série** : États et lanterne du logo
- **Produit par** : Codex
- **Emplacement** : `/blog` · Article sans image de couverture, et image de partage d’un article _(contexte : ne pas le recopier dans un prompt)_
- **Élargi, non posé** : le rendu des articles (server/blog.mjs) ne sait pas encore poser une couverture de secours : à brancher avec le serveur, hors refonte des pages.
- **Sujet** : Couverture de secours : la lanterne sur une page de livre
- **Composition (pour le prompt)** : Cadrage large : le coin d’une page de livre ouvert à gauche, la lanterne du logo à droite du centre (vers 62 % de la largeur et 50 % de la hauteur), son halo éclaire la page ; grand espace calme à gauche. Aucun texte
- **Calques** : encre (#000000) = traits, contours et hachures d’ombre ; aplat (#FFFFFF) = page du livre ; lumière (#FF0000) = flamme et halo sur la page · **Fond** : rempli d’aplat
- **Cadrage (pour vérifier)** : Espace calme à gauche pour qu’un titre posé en HTML reste lisible par-dessus ; déclinaison 1200 × 630 pour le partage.
- **Format** : 16:9, 1600 × 900 ; déclinaison 1200 × 630 pour le partage
- **Fichier attendu** : `site/src/assets/visuels/blog/BLG-02_1600x900.webp`
- **Master** : `design/assets/visuels/blog/BLG-02.png` → `node tools/separer-calques.mjs BLG-02` écrit le rendu et `BLG-02_1600x900.aplat.webp`, `BLG-02_1600x900.encre.webp`, `BLG-02_1600x900.lumiere.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Une lanterne éclaire la page d’un livre ouvert. »

### Reprises : rien à générer, mais leur cadrage contraint l’image d’origine

#### ACC-15 · Les quatre gestes

- **Priorité** : socle · **Méthode** : IMG, rien à produire, le fichier est celui d’un autre emplacement
- **Emplacement** : `/` · 02, du solo au collectif : « Comment j’organise le pôle, en quatre gestes » _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/components/accueil/GestesPole.astro`, `src/config/pvz-fusion.ts`
- **Sujet** : Les quatre gestes
- **Composition** : Les quatre images carrées de la semaine type de PvZ Fusion, sans nouvelle image : organiser (PVZ-05), livrer (PVZ-07), motiver (PVZ-08), remercier (PVZ-11)
- **Cadrage (pour vérifier)** : Quatre images carrées en tête de chaque geste, sur toute la largeur de sa colonne : environ 230 px sur ordinateur (quatre colonnes), 160 à 300 px sur tablette et mobile (deux colonnes). Les images doivent rester lisibles à 160 px.
- **Format** : 1:1
- **Fichier attendu** : aucun, reprend `PVZ-05`, `PVZ-07`, `PVZ-08`, `PVZ-11`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif
- **Note** : Posé par components/accueil/GestesPole.astro, avec les textes de config/pvz-fusion.ts ; décoratif (alt vide), chaque geste porte son intitulé.

#### PRJ-03 · Du papier au jeu en ligne

- **Priorité** : socle · **Méthode** : IMG, rien à produire, le fichier est celui d’un autre emplacement
- **Emplacement** : `/projets` · Carte Omnicard _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/pages/projets/index.astro`
- **Sujet** : Du papier au jeu en ligne
- **Composition** : Recadrage d’OMN-01, sans nouvelle image : la carte plastifiée à la main (pochette visible, coin corné) à cheval sur le bord d’une fenêtre de navigateur, moitié papier, moitié numérique
- **Cadrage (pour vérifier)** : Le recadrage garde au centre le bord de la fenêtre qui traverse la carte, les deux moitiés de la carte entières et la lumière de la lanterne sur la moitié papier ; il coupe d’abord le fond de la fenêtre et la table. Deux cadres : 16:10 sur mobile, portrait 2:3 (environ 300 × 450 px) sur ordinateur, où la carte, droite, doit tenir entière en hauteur.
- **Format** : 16:10 ; portrait 2:3 recadré dans la carte
- **Fichier attendu** : aucun, reprend `OMN-01`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Une carte de jeu plastifiée à la main qui passe le bord d’une fenêtre de navigateur et y devient numérique. »
- **Note** : Si OMN-01 ne laisse pas la carte entière dans le portrait 2:3, demander une variante en 2:3 (1000 × 1500) plutôt qu’un recadrage qui la coupe. Décoratif sur la vitrine (alt vide), le nom de la carte dit le reste.

#### PVZ-02 · Accueillir, former, faire confiance

- **Priorité** : socle · **Méthode** : IMG, rien à produire, le fichier est celui d’un autre emplacement
- **Emplacement** : `/projets/pvz-fusion` · § 2, l’équipe _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/pages/projets/pvz-fusion.astro`, `src/config/pvz-fusion.ts`
- **Sujet** : Accueillir, former, faire confiance
- **Composition** : Triptyque en trois images de même main et même décor (PVZ-02a, PVZ-02b, PVZ-02c) : montrer une fiche annotée à une nouvelle venue, la voir travailler, puis la laisser relire seule
- **Cadrage (pour vérifier)** : Bureau : les trois cases se touchent, sans gouttière, et se lisent comme un seul triptyque ; chacune coiffe son temps (Accueillir, Former et relire, Faire confiance), dont l’intitulé reste en HTML. Sous 860 px, chaque case passe au-dessus de son temps : aucun recadrage ne fait disparaître une case.
- **Format** : 3 × 4:3, juxtaposés en bureau
- **Fichier attendu** : aucun, reprend `PVZ-02a`, `PVZ-02b`, `PVZ-02c`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Trois moments dans le même décor : montrer une fiche annotée à une nouvelle venue, la voir travailler, puis la laisser relire seule. »

#### LOD-01 · Archive versionnée

- **Priorité** : élargi · **Méthode** : IMG, rien à produire, le fichier est celui d’un autre emplacement
- **Emplacement** : `/projets/league-of-database` · Hub, partage _(contexte : ne pas le recopier dans un prompt)_
- **Élargi, non posé** : la page du projet ouvre sur une capture réelle ; seule une image de partage le reprendrait.
- **Sujet** : Archive versionnée
- **Composition** : PRJ-02 recadré en 1:1 et en 1200 × 630, sans nouvelle image
- **Format** : 16:10, 1:1, 1200 × 630
- **Fichier attendu** : aucun, reprend `PRJ-02`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Un registre ouvert dont les pages s’éventaillent, un marque-page glissé dans les plus anciennes. »

#### OMN-02 · Les éditions sans fin

- **Priorité** : socle · **Méthode** : IMG, rien à produire, le fichier est celui d’un autre emplacement
- **Emplacement** : `/projets/omnicard` · « Le jeu papier », à côté du récit des éditions _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/pages/projets/omnicard.astro`
- **Sujet** : Les éditions sans fin
- **Composition** : ACC-04, sans nouvelle image : table d’après-midi d’été vue de dessus, cartes imprimées, plastifieuse et mains d’adolescents
- **Format** : 3:2
- **Fichier attendu** : aucun, reprend `ACC-04`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Deux adolescents découpent et plastifient leurs cartes sur une table d’été. »

## Partie 2 — À faire par l’équipe : dessins, figures, captures, partage

Rien ici n’est à générer : les dessins vectoriels s’écrivent à la main, les figures se codent depuis des données sourcées, les captures se prennent sur l’application ou la page réelle, les images de partage se composent en HTML.

**Déjà faits** : GLO-01, GLO-03, GLO-04, GLO-05, GLO-07, GLO-08, ACC-01, ACC-06, ACC-14, ACC-17, PRJ-04, PRJ-05, PVZ-03, PVZ-F1, PVZ-F2, PVZ-F3, PVZ-F4, PVZ-F5, LOD-03, LOD-05, LOD-06, LOD-07, LOD-08, LOD-09, LOD-10, LOD-11, LOD-12, LOD-F1, LOD-F2, LOD-F3, LOD-F4, LOD-F5, LOD-F6, OMN-03, OMN-04, OMN-05, BLR-06, BLR-07, BLR-08, BLR-09, BLR-10, BLR-F1, BLR-C4, GUP-02, GUP-F1, GUP-F2, GUP-F3, GUP-C1, PAR-PHO, PAR-F1, PRO-F1, CMP-F1, CMP-09, CMP-10, FOR-09, CON-PHO, ERR-PHO.

| Zone | Socle | Élargi |
|---|---|---|
| équipe Identité et éléments globaux | — | GLO-02 (SVG), GLO-06 (SVG), GLO-09 (SVG), GLO-10 (SVG), GLO-11 (SVG), GLO-12 (SVG), GLO-13 (SVG) |
| équipe Accueil | — | ACC-10 (FIG), ACC-12 (FIG), ACC-13 (CAP) |
| équipe PvZ Fusion | — | PVZ-C1 (CAP), PVZ-C2 (CAP), PVZ-C3 (CAP), PVZ-OG (OG) |
| équipe League Of Data Base | — | LOD-C1 (CAP), LOD-C2 (CAP), LOD-C3 (CAP) |
| équipe Omnicard | — | OMN-06 (SVG), OMN-07 (FIG), OMN-C5 (CAP), OMN-OG (OG) |
| équipe Bloodborne Legendary Run | — | BLR-02 (SVG), BLR-C1 (CAP), BLR-C2 (CAP), BLR-C3 (CAP), BLR-OG (OG) |
| équipe Parcours : hub, professionnel, compétences, formation | — | PRO-07 (SVG), FOR-08 (SVG) |
| équipe États : 404 et hors ligne | — | ERR-02 (SVG) |
| Charles | — | PVZ-C4 (CAP), PVZ-C5 (CAP), PVZ-C6 (CAP), LOD-C4 (CAP), LOD-C5 (CAP), LOD-C6 (CAP), OMN-08 (CAP), OMN-C2 (CAP), OMN-C3 (CAP), OMN-C4 (CAP) |

### Identité et éléments globaux

#### GLO-02 · Logo horizontal : emblème + nom

- **Priorité** : élargi · **Méthode** : SVG, à dessiner (vectoriel)
- **Produit par** : équipe Identité et éléments globaux
- **Emplacement** : toutes les pages · En-tête ordinateur, pied de page _(contexte : ne pas le recopier dans un prompt)_
- **Élargi, non posé** : components/ui/Logo.astro compose l’emblème et le nom à partir des images du logo validé (src/assets/marque/), qui en tiennent lieu ; le SVG les remplacera à l’identique.
- **Sujet** : Logo horizontal : emblème + nom
- **Composition** : Emblème à gauche, nom à droite, hauteur 40 px ; nom gothique conservé (direction « Lanterne »)
- **Format** : ≈ 5:1
- **Fichier attendu** : `site/src/assets/visuels/global/GLO-02.svg`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Charles Lindecker »

#### GLO-06 · Compléments de pictos : flèche interne, ancre, lien sortant unique, agrandir, lecture vidéo, succès, erreur, sommaire

- **Priorité** : élargi · **Méthode** : SVG, à dessiner (vectoriel)
- **Produit par** : équipe Identité et éléments globaux
- **Emplacement** : toutes les pages · Interface _(contexte : ne pas le recopier dans un prompt)_
- **Élargi, non posé** : aucun composant ne l’appelle ; l’interface emploie déjà les pictos de src/assets/pictos/interface/. À dessiner seulement pour les redessiner sur la grille de 24 de la direction : lien-externe.svg (lien sortant), agrandir.svg, sommaire.svg et haut-de-page.svg (flèche interne) à remplacer ; ancre, lecture vidéo, succès et erreur à créer.
- **Sujet** : Compléments de pictos : flèche interne, ancre, lien sortant unique, agrandir, lecture vidéo, succès, erreur, sommaire
- **Composition** : Grille 24, trait constant, currentColor
- **Format** : 1:1
- **Fichier attendu** : `site/src/assets/visuels/global/GLO-06.svg` (lot de 8)
- **Pièces du fichier** (8) : `GLO-06-fleche-interne`, `GLO-06-ancre`, `GLO-06-lien-sortant`, `GLO-06-agrandir`, `GLO-06-lecture`, `GLO-06-succes`, `GLO-06-erreur`, `GLO-06-sommaire`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif

#### GLO-09 · Grain de papier très léger, raccordable

- **Priorité** : élargi · **Méthode** : SVG, à dessiner (vectoriel)
- **Produit par** : équipe Identité et éléments globaux
- **Emplacement** : toutes les pages · Fond, jour _(contexte : ne pas le recopier dans un prompt)_
- **Élargi, non posé** : le fond du jour est un aplat ; le grain ne s’ajoutera que si Charles le demande et que le budget de poids de la page le permet.
- **Sujet** : Grain de papier très léger, raccordable
- **Composition** : Grain de papier procédural, sans image générée : un filtre SVG feTurbulence (fractalNoise, baseFrequency d’environ 0,8, deux octaves, stitchTiles) désaturé, sur une tuile raccordable de 512 × 512, posé à environ 3 % d’opacité
- **Format** : 512 × 512, tuile SVG raccordable
- **Fichier attendu** : `site/src/assets/visuels/global/GLO-09.svg`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif
- **Note** : Passé d’une image à générer à un grain procédural (constat du 13/10/2026) : une texture générée ne se raccorde pas proprement et pèse plus qu’un filtre.

#### GLO-10 · Grain de nuit, très faible

- **Priorité** : élargi · **Méthode** : SVG, à dessiner (vectoriel)
- **Produit par** : équipe Identité et éléments globaux
- **Emplacement** : toutes les pages · Fond, nuit _(contexte : ne pas le recopier dans un prompt)_
- **Élargi, non posé** : le fond de nuit est un aplat ; comme GLO-09, le grain attend la demande de Charles.
- **Sujet** : Grain de nuit, très faible
- **Composition** : Même grain procédural que GLO-09 (filtre SVG feTurbulence, tuile raccordable de 512 × 512), plus fin et posé à environ 2 % d’opacité sur la nuit
- **Format** : 512 × 512, tuile SVG raccordable
- **Fichier attendu** : `site/src/assets/visuels/global/GLO-10.svg`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif

#### GLO-11 · La flamme de la lanterne qui vacille ; statique en mouvement réduit

- **Priorité** : élargi · **Méthode** : SVG, à dessiner (vectoriel)
- **Produit par** : équipe Identité et éléments globaux
- **Emplacement** : toutes les pages · Chargement (formulaire, vidéo) _(contexte : ne pas le recopier dans un prompt)_
- **Élargi, non posé** : aucun composant ne l’appelle encore.
- **Sujet** : La flamme de la lanterne qui vacille ; statique en mouvement réduit
- **Composition** : Flamme seule
- **Format** : 1:1, 32 px
- **Fichier attendu** : `site/src/assets/visuels/global/GLO-11.svg`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif

#### GLO-12 · En-tête et pied imprimables (emblème, adresse du site)

- **Priorité** : élargi · **Méthode** : SVG, à dessiner (vectoriel)
- **Produit par** : équipe Identité et éléments globaux
- **Emplacement** : toutes les pages · Impression _(contexte : ne pas le recopier dans un prompt)_
- **Élargi, non posé** : aucune feuille d’impression ne l’appelle encore.
- **Sujet** : En-tête et pied imprimables (emblème, adresse du site)
- **Composition** : Une couleur
- **Format** : A4
- **Fichier attendu** : `site/src/assets/visuels/global/GLO-12.svg`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif

#### GLO-13 · Le logo en ASCII, 40 colonnes au plus

- **Priorité** : élargi · **Méthode** : SVG, à dessiner (vectoriel)
- **Produit par** : équipe Identité et éléments globaux
- **Emplacement** : toutes les pages · Console du navigateur _(contexte : ne pas le recopier dans un prompt)_
- **Élargi, non posé** : aucun script du site ne l’écrit dans la console.
- **Sujet** : Le logo en ASCII, 40 colonnes au plus
- **Composition** : —
- **Format** : texte
- **Fichier attendu** : `site/src/assets/visuels/global/GLO-13.txt`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif
- **Note** : Texte ASCII de 40 colonnes au plus, pas une image.

### Accueil

#### ACC-10 · −30 % de temps de traitement

- **Priorité** : élargi · **Méthode** : FIG, figure codée depuis des données, rien à générer
- **Produit par** : équipe Accueil
- **Emplacement** : `/` · 01, stage _(contexte : ne pas le recopier dans un prompt)_
- **Élargi, non posé** : la figure reste à coder ; le chiffre est dit en HTML dans la fiche du stage (Parcours professionnel).
- **Sujet** : −30 % de temps de traitement
- **Composition** : Deux barres avant / après, échelle honnête
- **Format** : 16:5
- **Composant** : aucun, figure à coder
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Deux barres, avant et après le stage : le temps de traitement administratif baisse de 30 %. »

#### ACC-12 · « Une dizaine, tous titrés »

- **Priorité** : élargi · **Méthode** : FIG, figure codée depuis des données, rien à générer
- **Produit par** : équipe Accueil
- **Emplacement** : `/` · 01, de l’autre côté du bureau _(contexte : ne pas le recopier dans un prompt)_
- **Élargi, non posé** : la figure reste à coder.
- **Sujet** : « Une dizaine, tous titrés »
- **Composition** : Rangée d’une dizaine de silhouettes cochées, environ moitié DWWM, moitié CDA (docs/matiere-premiere.md) ; légende « schéma : une dizaine »
- **Format** : 4:1
- **Composant** : aucun, figure à coder
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Une rangée d’une dizaine de silhouettes, toutes cochées. »

#### ACC-13 · Cartes projets LoD, Bloodborne, gup

- **Priorité** : élargi · **Méthode** : CAP, capture réelle, rien à générer
- **Produit par** : équipe Accueil
- **Emplacement** : `/` · 02, ce que je construis _(contexte : ne pas le recopier dans un prompt)_
- **Élargi, non posé** : l’accueil pose les trois captures réelles existantes, annotées d’une cible, d’une loupe et d’une légende (components/accueil/ProjetsConstruits.astro) ; ce fichier composé ne servirait qu’à une image de partage.
- **Sujet** : Cartes projets LoD, Bloodborne, gup
- **Composition** : Captures réelles dans les cadres GLO-05
- **Format** : 16:10
- **Fichier attendu** : `site/src/assets/visuels/accueil/ACC-13_1600x1000.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Captures de League Of Data Base, de Bloodborne Legendary Run et de gup »

### PvZ Fusion

#### PVZ-C1 · L’en-tête de la PR #110 et ses huit crédits

- **Priorité** : élargi · **Méthode** : CAP, capture réelle, rien à générer
- **Produit par** : équipe PvZ Fusion
- **Emplacement** : `/projets/pvz-fusion` · Section de l’équipe ou de la semaine type, près de la trace « La PR #110 et ses huit crédits » _(contexte : ne pas le recopier dans un prompt)_
- **Élargi, non posé** : la page renvoie à la PR #110 par un lien (trace de la carte « Livrer ») ; l’affichage des pseudonymes attend la réponse de Charles (Q7).
- **Sujet** : L’en-tête de la PR #110 et ses huit crédits
- **Composition** : Capture réelle de la page publique de la pull request #110 du dépôt amont : titre, auteur, état et la liste des huit crédits, sans retouche ; pseudonymes publics tels qu’affichés
- **Format** : 16:10, 1600 × 1000, densité 2
- **Fichier attendu** : `site/src/assets/visuels/pvz-fusion/PVZ-C1_1600x1000.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « La pull request #110 du dépôt amont, avec ses huit crédits. »
- **Note** : CAP-PVZ-1 du cahier (§ 6.12), page publique : capture à faire par l’équipe.

#### PVZ-C2 · Un outil en ligne de commande qui liste les traductions manquantes

- **Priorité** : élargi · **Méthode** : CAP, capture réelle, rien à générer
- **Produit par** : équipe PvZ Fusion
- **Emplacement** : `/projets/pvz-fusion` · § 3, bloc de l’outil du pôle, à côté de PVZ-04 _(contexte : ne pas le recopier dans un prompt)_
- **Élargi, non posé** : le bloc de l’outil pose PVZ-04 en attendant ; la capture le complétera, puis remplacera PVZ-10.
- **Sujet pour le prompt** : Un outil en ligne de commande qui liste les traductions manquantes
- **Composition** : Enregistrement réel du terminal : le menu de l’outil, puis le rapport des entrées sans traduction française sur une révision ancienne ; une image fixe tirée de l’enregistrement, sans retouche
- **Format** : vidéo 16:9 de 10 à 15 s et image fixe 1600 × 900
- **Fichier attendu** : `site/src/assets/visuels/pvz-fusion/PVZ-C2_1600x900.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Le Console Manager dans un terminal : le menu, puis le rapport des traductions françaises manquantes. »
- **Note** : CAP-PVZ-2 du cahier (§ 6.12) : capture à faire par l’équipe, depuis le dépôt public de l’outil.

#### PVZ-C3 · Le site d’un outil en ligne de commande, sa console interactive

- **Priorité** : élargi · **Méthode** : CAP, capture réelle, rien à générer
- **Produit par** : équipe PvZ Fusion
- **Emplacement** : `/projets/pvz-fusion` · § 3, bloc de l’outil du pôle _(contexte : ne pas le recopier dans un prompt)_
- **Élargi, non posé** : aucune page ne l’attend encore.
- **Sujet pour le prompt** : Le site d’un outil en ligne de commande, sa console interactive
- **Composition** : Capture réelle du site public de l’outil, sur sa console interactive, sans retouche
- **Format** : 16:10, 1600 × 1000
- **Fichier attendu** : `site/src/assets/visuels/pvz-fusion/PVZ-C3_1600x1000.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Le site du Console Manager, ouvert sur sa console interactive. »
- **Note** : CAP-PVZ-3 du cahier (§ 6.12) : capture à faire par l’équipe.

#### PVZ-C4 · Une fiche d’almanach en français, dans le jeu

- **Priorité** : élargi · **Méthode** : CAP, capture réelle, rien à générer
- **Produit par** : Charles
- **Emplacement** : `/projets/pvz-fusion` · § 4, le métier de traducteur _(contexte : ne pas le recopier dans un prompt)_
- **Élargi, non posé** : capture à faire par Charles dans le jeu installé ; la question de son usage reste ouverte.
- **Sujet** : Une fiche d’almanach en français, dans le jeu
- **Composition** : Capture native du jeu 4.0.5 installé, sur une fiche d’almanach traduite en français, sans retouche
- **Format** : 16:9 natif, 1920 × 1080
- **Fichier attendu** : `site/src/assets/visuels/pvz-fusion/PVZ-C4_1920x1080.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Une fiche d’almanach du jeu, traduite en français. »
- **Note** : CAP-PVZ-4 du cahier (§ 6.12).

#### PVZ-C5 · L’écran de sélection en français, dans le jeu

- **Priorité** : élargi · **Méthode** : CAP, capture réelle, rien à générer
- **Produit par** : Charles
- **Emplacement** : `/projets/pvz-fusion` · § 4, le métier de traducteur _(contexte : ne pas le recopier dans un prompt)_
- **Élargi, non posé** : capture à faire par Charles dans le jeu installé ; la question de son usage reste ouverte.
- **Sujet** : L’écran de sélection en français, dans le jeu
- **Composition** : Capture native du jeu 4.0.5 installé, sur l’écran de sélection en français, sans retouche
- **Format** : 16:9 natif, 1920 × 1080
- **Fichier attendu** : `site/src/assets/visuels/pvz-fusion/PVZ-C5_1920x1080.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « L’écran de sélection du jeu, en français. »
- **Note** : CAP-PVZ-5 du cahier (§ 6.12).

#### PVZ-C6 · Le tableau de tâches du pôle

- **Priorité** : élargi · **Méthode** : CAP, capture réelle, rien à générer
- **Produit par** : Charles
- **Emplacement** : `/projets/pvz-fusion` · § 3, la semaine type _(contexte : ne pas le recopier dans un prompt)_
- **Élargi, non posé** : capture à faire par Charles, seulement s’il l’autorise.
- **Sujet** : Le tableau de tâches du pôle
- **Composition** : Capture réelle du tableau de tâches du pôle, pseudonymes floutés, sans autre retouche
- **Format** : 16:10, 1600 × 1000
- **Fichier attendu** : `site/src/assets/visuels/pvz-fusion/PVZ-C6_1600x1000.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Le tableau de tâches du pôle francophone, pseudonymes floutés. »
- **Note** : CAP-PVZ-6 du cahier (§ 6.12).

#### PVZ-OG · Version simplifiée de PVZ-01

- **Priorité** : élargi · **Méthode** : OG, à composer en HTML puis rendre en PNG
- **Produit par** : équipe PvZ Fusion
- **Emplacement** : `/projets/pvz-fusion` · Partage _(contexte : ne pas le recopier dans un prompt)_
- **Élargi, non posé** : layouts/Base.astro ne pose que l’image de partage par défaut (GLO-07) ; ce visuel sert la déclinaison GLO-08-pvz-fusion.
- **Sujet** : Version simplifiée de PVZ-01
- **Composition** : Version simplifiée de PVZ-01 (la table et la fiche transmise à la lumière de la lanterne), composée en HTML avec le titre de la page ; marge de sécurité de 10 %
- **Format** : 1200 × 630
- **Fichier attendu** : `site/public/og/PVZ-OG_1200x630.png`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « PvZ Fusion, pôle francophone — Charles Lindecker »

### League Of Data Base

#### LOD-C1 · Le catalogue au patch 16.20.1

- **Priorité** : élargi · **Méthode** : CAP, capture réelle, rien à générer
- **Produit par** : équipe League Of Data Base
- **Emplacement** : `/projets/league-of-database` · § « Tout un état du jeu », à côté de la capture historique du catalogue _(contexte : ne pas le recopier dans un prompt)_
- **Élargi, non posé** : aucune page ne l’attend encore ; la section pose la capture historique.
- **Sujet** : Le catalogue au patch 16.20.1
- **Composition** : Capture réelle du site en production, catalogue des champions au patch 16.20.1, même cadrage que la capture historique histoire-champions, sans retouche
- **Format** : 16:10, densité 2
- **Fichier attendu** : `site/src/assets/visuels/league-of-database/LOD-C1_2880x1800.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Le catalogue des champions de League Of Data Base au patch 16.20.1. »
- **Note** : CAP-LOD-1 du cahier (§ 6.12), page publique : capture à faire par l’équipe.

#### LOD-C2 · Le portail de l’API

- **Priorité** : élargi · **Méthode** : CAP, capture réelle, rien à générer
- **Produit par** : équipe League Of Data Base
- **Emplacement** : `/projets/league-of-database` · Section de la production _(contexte : ne pas le recopier dans un prompt)_
- **Élargi, non posé** : aucune page ne l’attend encore.
- **Sujet** : Le portail de l’API
- **Composition** : Capture réelle de la page publique /fr/developers, sans retouche
- **Format** : 16:10, densité 2
- **Fichier attendu** : `site/src/assets/visuels/league-of-database/LOD-C2_2880x1800.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Le portail des développeurs de League Of Data Base. »
- **Note** : CAP-LOD-2 du cahier (§ 6.12), page publique : capture à faire par l’équipe.

#### LOD-C3 · L’avertissement des médias sous une capacité

- **Priorité** : élargi · **Méthode** : CAP, capture réelle, rien à générer
- **Produit par** : équipe League Of Data Base
- **Emplacement** : `/projets/league-of-database` · § « Ce que les données ne disent pas », carte 4 (médias sans version) _(contexte : ne pas le recopier dans un prompt)_
- **Élargi, non posé** : aucune page ne l’attend encore ; la carte 4 des pièges dit l’avertissement en texte.
- **Sujet** : L’avertissement des médias sous une capacité
- **Composition** : Capture réelle d’une fiche au patch 3.6.14, recadrée sur l’avertissement affiché sous une capacité, sans retouche
- **Format** : libre, densité 2
- **Fichier attendu** : `site/src/assets/visuels/league-of-database/LOD-C3.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « L’avertissement affiché sous une capacité : les illustrations et vidéos ne sont pas versionnées. »
- **Note** : CAP-LOD-3 du cahier (§ 6.12), page publique : capture à faire par l’équipe.

#### LOD-C4 · L’éditeur de builds

- **Priorité** : élargi · **Méthode** : CAP, capture réelle, rien à générer
- **Produit par** : Charles
- **Emplacement** : `/projets/league-of-database` · Section des comptes et des builds _(contexte : ne pas le recopier dans un prompt)_
- **Élargi, non posé** : il faut un compte de test (question ouverte du cahier, § 6.12).
- **Sujet** : L’éditeur de builds
- **Composition** : Capture réelle de l’éditeur de builds, connecté avec un compte de test, sans donnée personnelle
- **Format** : 16:10, densité 2
- **Fichier attendu** : `site/src/assets/visuels/league-of-database/LOD-C4_2880x1800.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « L’éditeur de builds de League Of Data Base. »
- **Note** : CAP-LOD-4 du cahier (§ 6.12).

#### LOD-C5 · Un build partagé

- **Priorité** : élargi · **Méthode** : CAP, capture réelle, rien à générer
- **Produit par** : Charles
- **Emplacement** : `/projets/league-of-database` · Section des comptes et des builds _(contexte : ne pas le recopier dans un prompt)_
- **Élargi, non posé** : il faut un compte de test (question ouverte du cahier, § 6.12).
- **Sujet** : Un build partagé
- **Composition** : Capture réelle d’un build partagé par un compte de test, sans donnée personnelle
- **Format** : 16:10, densité 2
- **Fichier attendu** : `site/src/assets/visuels/league-of-database/LOD-C5_2880x1800.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Un build partagé sur League Of Data Base. »
- **Note** : CAP-LOD-5 du cahier (§ 6.12).

#### LOD-C6 · Un profil public

- **Priorité** : élargi · **Méthode** : CAP, capture réelle, rien à générer
- **Produit par** : Charles
- **Emplacement** : `/projets/league-of-database` · Section des comptes et des builds _(contexte : ne pas le recopier dans un prompt)_
- **Élargi, non posé** : il faut un compte de test (question ouverte du cahier, § 6.12).
- **Sujet** : Un profil public
- **Composition** : Capture réelle du profil public d’un compte de test, sans donnée personnelle
- **Format** : 16:10, densité 2
- **Fichier attendu** : `site/src/assets/visuels/league-of-database/LOD-C6_2880x1800.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Le profil public d’un compte de test sur League Of Data Base. »
- **Note** : CAP-LOD-6 du cahier (§ 6.12).

### Omnicard

#### OMN-06 · Annotations de la partie

- **Priorité** : élargi · **Méthode** : SVG, à dessiner (vectoriel)
- **Produit par** : équipe Omnicard
- **Emplacement** : `/projets/omnicard` · « Une partie en trente secondes », calque de la capture OMN-08 _(contexte : ne pas le recopier dans un prompt)_
- **Élargi, non posé** : il annote la capture d’une vraie partie (OMN-08), qui n’existe pas encore ; le schéma OMN-03 tient la place.
- **Sujet** : Annotations de la partie
- **Composition** : Quatre pastilles numérotées et filets de rappel, posés sur la capture d’une vraie partie (OMN-08) : points de vie, deck, mana et cristaux, lignes d’unités
- **Format** : format de la capture
- **Fichier attendu** : `site/src/assets/visuels/omnicard/OMN-06.svg`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Quatre annotations numérotées sur la capture d’une partie »
- **Note** : Mêmes pastilles que les cibles numérotées des captures annotées (CaptureAnnotee).

#### OMN-07 · Du papier au lancement

- **Priorité** : élargi · **Méthode** : FIG, figure codée depuis des données, rien à générer
- **Produit par** : équipe Omnicard
- **Emplacement** : `/projets/omnicard` · « Ce que j’en retiens » _(contexte : ne pas le recopier dans un prompt)_
- **Élargi, non posé** : la date de lancement (16/05/2026, CHANGELOG du dépôt de présentation) attend la validation de Charles.
- **Sujet** : Du papier au lancement
- **Composition** : Frise : jeu papier → saison 1 → première ligne de code → lancement en ligne → hors ligne, en attente de refonte. Dates à confirmer par Charles avant tout affichage (cahier, Q8)
- **Format** : 5:1
- **Composant** : aucun, figure à coder
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Frise : le jeu papier, la saison 1, la première ligne de code, le lancement en ligne, puis la mise hors ligne. »

#### OMN-08 · Une partie en cours contre l’ordinateur

- **Priorité** : élargi · **Méthode** : CAP, capture réelle, rien à générer
- **Produit par** : Charles
- **Emplacement** : `/projets/omnicard` · « Une partie en trente secondes », à la place du schéma OMN-03 quand elle existe _(contexte : ne pas le recopier dans un prompt)_
- **Élargi, non posé** : capture à faire par Charles sur la stack locale (cahier § 6.12, CAP-OC-1) ; le schéma OMN-03 tient la place.
- **Sujet** : Une partie en cours contre l’ordinateur
- **Composition** : Capture réelle d’une partie contre l’ordinateur, en cours : les deux héros et leurs points de vie, des unités sur les deux lignes, la main du joueur, la mana et les cristaux visibles. Compte de démonstration, aucune donnée personnelle ni pseudonyme réel à l’écran
- **Format** : 16:10, 1600 × 1000 ; recadrage 4:5 mobile (recadrage mobile 4:5)
- **Fichier attendu** : `site/src/assets/visuels/omnicard/OMN-08_1600x1000.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Une partie d’Omnicard contre l’ordinateur : deux héros, deux lignes d’unités chacun, la main du joueur, la mana et les cristaux. »
- **Note** : Annotée ensuite par OMN-06.

#### OMN-C2 · La même partie, vue par l’adversaire

- **Priorité** : élargi · **Méthode** : CAP, capture réelle, rien à générer
- **Produit par** : Charles
- **Emplacement** : `/projets/omnicard` · « Une partie en trente secondes », à côté d’OMN-08 _(contexte : ne pas le recopier dans un prompt)_
- **Élargi, non posé** : capture à faire par Charles sur la stack locale, après OMN-08.
- **Sujet** : La même partie, vue par l’adversaire
- **Composition** : Capture réelle de la partie d’OMN-08 vue par l’adversaire ou un spectateur, sur la stack locale, compte de démonstration, aucune donnée personnelle
- **Format** : 16:10, 1600 × 1000 ; recadrage 4:5 mobile (recadrage mobile 4:5)
- **Fichier attendu** : `site/src/assets/visuels/omnicard/OMN-C2_1600x1000.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « La même partie d’Omnicard, vue depuis le camp adverse. »
- **Note** : CAP-OC-2 du cahier (§ 6.12).

#### OMN-C3 · Une fin de partie

- **Priorité** : élargi · **Méthode** : CAP, capture réelle, rien à générer
- **Produit par** : Charles
- **Emplacement** : `/projets/omnicard` · « Ce que j’en retiens » _(contexte : ne pas le recopier dans un prompt)_
- **Élargi, non posé** : capture à faire par Charles sur la stack locale.
- **Sujet** : Une fin de partie
- **Composition** : Capture réelle d’une fin de partie ou du mode classé, sur la stack locale, compte de démonstration
- **Format** : 4:3, 1600 × 1200
- **Fichier attendu** : `site/src/assets/visuels/omnicard/OMN-C3_1600x1200.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Une fin de partie d’Omnicard. »
- **Note** : CAP-OC-3 du cahier (§ 6.12).

#### OMN-C4 · L’atelier communautaire

- **Priorité** : élargi · **Méthode** : CAP, capture réelle, rien à générer
- **Produit par** : Charles
- **Emplacement** : `/projets/omnicard` · « Ce que j’en retiens » _(contexte : ne pas le recopier dans un prompt)_
- **Élargi, non posé** : capture à faire par Charles sur la stack locale.
- **Sujet** : L’atelier communautaire
- **Composition** : Capture réelle de l’atelier communautaire, sur la stack locale, compte de démonstration
- **Format** : 4:3, 1600 × 1200
- **Fichier attendu** : `site/src/assets/visuels/omnicard/OMN-C4_1600x1200.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « L’atelier communautaire d’Omnicard. »
- **Note** : CAP-OC-4 du cahier (§ 6.12).

#### OMN-C5 · Une carte de la saison 1, recadrée tête visible

- **Priorité** : élargi · **Méthode** : CAP, capture réelle, rien à générer
- **Produit par** : équipe Omnicard
- **Emplacement** : `/projets/omnicard` · Cartes de la saison 1 (éventail et comparateur des cartes) _(contexte : ne pas le recopier dans un prompt)_
- **Élargi, non posé** : aucune page n’attend ce recadrage : l’éventail et le comparateur posent la carte entière.
- **Sujet** : Une carte de la saison 1, recadrée tête visible
- **Composition** : Recadrage de la carte existante src/assets/projets/omnicard/carte-gehrman.webp, tête du personnage visible, sans retouche
- **Format** : 2:3, 720 × 1080
- **Fichier attendu** : `site/src/assets/visuels/omnicard/OMN-C5_720x1080.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Une carte de la saison 1 d’Omnicard, recadrée sur son personnage. »
- **Note** : CAP-OC-5 du cahier (§ 6.12) : recadrage à faire par l’équipe.

#### OMN-OG · Carte et engrenage imbriqués

- **Priorité** : élargi · **Méthode** : OG, à composer en HTML puis rendre en PNG
- **Produit par** : équipe Omnicard
- **Emplacement** : `/projets/omnicard` · Partage _(contexte : ne pas le recopier dans un prompt)_
- **Élargi, non posé** : layouts/Base.astro ne pose que l’image de partage par défaut (GLO-07) ; ce visuel sert la déclinaison GLO-08-omnicard.
- **Sujet** : Carte et engrenage imbriqués
- **Composition** : Centré, beaucoup d’air
- **Format** : 1200 × 630
- **Fichier attendu** : `site/public/og/OMN-OG_1200x630.png`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Omnicard, du jeu papier au jeu en ligne — Charles Lindecker »

### Bloodborne Legendary Run

#### BLR-02 · Des fiches déclarées à l’arbre dessiné

- **Priorité** : élargi · **Méthode** : SVG, à dessiner (vectoriel)
- **Produit par** : équipe Bloodborne Legendary Run
- **Emplacement** : `/projets/bloodborne-legendary-run` · § 3 _(contexte : ne pas le recopier dans un prompt)_
- **Élargi, non posé** : la compilation des arbres ne figure pas dans le journal public du projet ; à poser dans « Ranger 1 289 objectifs » si Charles l’autorise.
- **Sujet** : Des fiches déclarées à l’arbre dessiné
- **Composition** : Trois temps de gauche à droite, sans aucun mot ni chiffre : une pile de fiches vierges en éventail, une flèche simple au trait, puis un arbre d’étoiles propre, à racine unique, dont les branches ne se croisent pas ; la lanterne posée sur l’étoile racine, seule source de lumière ; le reste dans la pénombre
- **Format** : 16:9 ; 4:5 mobile (recadrage mobile 4:5)
- **Fichier attendu** : `site/src/assets/visuels/bloodborne/BLR-02.svg`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Une pile de fiches devient, d’un trait, un arbre d’étoiles parti d’une seule racine. »

#### BLR-C1 · Une galaxie entière, en arbre, sur ordinateur

- **Priorité** : élargi · **Méthode** : CAP, capture réelle, rien à générer
- **Produit par** : équipe Bloodborne Legendary Run
- **Emplacement** : `/projets/bloodborne-legendary-run` · § Ranger 1 289 objectifs _(contexte : ne pas le recopier dans un prompt)_
- **Élargi, non posé** : la section pose déjà la planche des 22 galaxies (BLR-F1).
- **Sujet** : Une galaxie entière, en arbre, sur ordinateur
- **Composition** : Capture réelle du front local, une galaxie entière dépliée en arbre sur ordinateur, avec les fixtures du dépôt (aucun compte réel)
- **Format** : 1440 × 900, densité 2
- **Fichier attendu** : `site/src/assets/visuels/bloodborne/BLR-C1_2880x1800.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Une galaxie de Bloodborne Legendary Run dépliée en arbre, sur ordinateur. »
- **Note** : CAP-BLR-1 du cahier (§ 6.12) : par l’équipe avec les fixtures du dépôt, ou par Charles.

#### BLR-C2 · Le journal public

- **Priorité** : élargi · **Méthode** : CAP, capture réelle, rien à générer
- **Produit par** : équipe Bloodborne Legendary Run
- **Emplacement** : `/projets/bloodborne-legendary-run` · Page du projet, près du lien vers le journal public _(contexte : ne pas le recopier dans un prompt)_
- **Élargi, non posé** : aucune page ne l’attend encore ; la page renvoie au journal par un lien.
- **Sujet** : Le journal public
- **Composition** : Capture réelle de la page publique /fr/changelog, sans retouche
- **Format** : 1280 × 800, densité 2
- **Fichier attendu** : `site/src/assets/visuels/bloodborne/BLR-C2_2560x1600.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Le journal public de Bloodborne Legendary Run. »
- **Note** : CAP-BLR-2 du cahier (§ 6.12), page publique : capture à faire par l’équipe.

#### BLR-C3 · La table d’amélioration d’une arme, dans le guide

- **Priorité** : élargi · **Méthode** : CAP, capture réelle, rien à générer
- **Produit par** : équipe Bloodborne Legendary Run
- **Emplacement** : `/projets/bloodborne-legendary-run` · § Un guide de 864 fiches, en français _(contexte : ne pas le recopier dans un prompt)_
- **Élargi, non posé** : la section du guide montre la fiche du Père Gascoigne ; aucune page n’attend celle-ci.
- **Sujet** : La table d’amélioration d’une arme, dans le guide
- **Composition** : Capture réelle d’une fiche du guide sur sa table d’amélioration d’arme, sans retouche
- **Format** : 16:10, 1600 × 1000
- **Fichier attendu** : `site/src/assets/visuels/bloodborne/BLR-C3_1600x1000.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « La table d’amélioration d’une arme, dans le guide de Bloodborne Legendary Run. »
- **Note** : CAP-BLR-3 du cahier (§ 6.12) : capture à faire par l’équipe.

#### BLR-OG · Trois silhouettes de galaxies

- **Priorité** : élargi · **Méthode** : OG, à composer en HTML puis rendre en PNG
- **Produit par** : équipe Bloodborne Legendary Run
- **Emplacement** : `/projets/bloodborne-legendary-run` · Partage _(contexte : ne pas le recopier dans un prompt)_
- **Élargi, non posé** : layouts/Base.astro ne pose que l’image de partage par défaut (GLO-07) ; ce visuel sert la déclinaison GLO-08-bloodborne-legendary-run.
- **Sujet** : Trois silhouettes de galaxies
- **Composition** : Titre à gauche, galaxies à droite
- **Format** : 1200 × 630
- **Fichier attendu** : `site/public/og/BLR-OG_1200x630.png`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Bloodborne Legendary Run — Charles Lindecker »

### Parcours : hub, professionnel, compétences, formation

#### PRO-07 · Repères des structures

- **Priorité** : élargi · **Méthode** : SVG, à dessiner (vectoriel)
- **Produit par** : équipe Parcours : hub, professionnel, compétences, formation
- **Emplacement** : `/parcours/professionnel` · Professionnel _(contexte : ne pas le recopier dans un prompt)_
- **Élargi, non posé** : aucune fiche ne l’appelle.
- **Sujet** : Repères des structures
- **Composition** : Monogrammes typographiques ; ne pas générer de logos d’organismes
- **Format** : 1:1
- **Fichier attendu** : `site/src/assets/visuels/parcours/PRO-07.svg` (lot de 5)
- **Pièces du fichier** (5) : `PRO-07-elan`, `PRO-07-pole-francophone`, `PRO-07-mission-locale`, `PRO-07-stage`, `PRO-07-dev-mates`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif
- **Note** : Aucun monogramme pour le poste actuel (confidentialité : il n’est décrit qu’en termes génériques).

#### FOR-08 · Domaines

- **Priorité** : élargi · **Méthode** : SVG, à dessiner (vectoriel)
- **Produit par** : équipe Parcours : hub, professionnel, compétences, formation
- **Emplacement** : `/parcours/formation` · Formation, certifications _(contexte : ne pas le recopier dans un prompt)_
- **Élargi, non posé** : les domaines portent pour l’instant les logos réels (JavaScript, Python, PostgreSQL, C#) et le picto « langue » pour l’anglais.
- **Sujet** : Domaines
- **Composition** : Web/JS, Python, API et données, C#, anglais
- **Format** : 5 × 1:1, 48
- **Fichier attendu** : `site/src/assets/visuels/parcours/FOR-08.svg` (lot de 5)
- **Pièces du fichier** (5) : `FOR-08-web`, `FOR-08-python`, `FOR-08-api-donnees`, `FOR-08-csharp`, `FOR-08-anglais`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif

### États : 404 et hors ligne

#### ERR-02 · La lanterne éteinte

- **Priorité** : élargi · **Méthode** : SVG, à dessiner (vectoriel)
- **Produit par** : équipe États : 404 et hors ligne
- **Emplacement** : toutes les pages · Maintenance, hors ligne _(contexte : ne pas le recopier dans un prompt)_
- **Élargi, non posé** : le site n’a pas encore de page de maintenance.
- **Sujet** : La lanterne éteinte
- **Composition** : La lanterne du logo seule, de face, cage à quatre montants et anneau, sans flamme ni halo ; même grille et même trait que la bascule GLO-03 (24 unités, trait 1,4 en currentColor), pour qu’elle se lise comme la bascule éteinte. Aucun texte
- **Format** : 1:1, viewBox 24
- **Fichier attendu** : `site/src/assets/visuels/etats/ERR-02.svg`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif

## Contexte : déjà faits, photos et reprises

Fiches pour mémoire : rien à produire.

### Identité et éléments globaux

#### GLO-01 · Emblème seul : la lanterne dans le livre

- **Priorité** : socle · **Méthode** : SVG, à dessiner (vectoriel)
- **Produit par** : équipe Identité et éléments globaux
- **Emplacement** : toutes les pages · En-tête mobile, favicon, icônes d’application _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/components/ui/Logo.astro`, `src/components/ui/Visuel.astro`
- **Sujet** : Emblème seul : la lanterne dans le livre
- **Composition** : Silhouette pleine, deux aplats au plus, flamme lisible à 16 px ; dérivé du logo validé, sans le nom
- **Format** : 1:1, viewBox 32 ; PNG 180, 192, 512, masquable
- **Fichier attendu** : `site/src/assets/visuels/global/GLO-01.svg`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif
- **Note** : Livré le 13 octobre 2026 : dessiné à la main sur une grille de 32, d’après le logo validé, sans le nom. Logo.astro le pose dans l’en-tête mobile (le logo validé reste sur ordinateur et dans le pied de page), Visuel.astro en filigrane des emplacements en attente ; tools/preparer-icones.mjs en tire favicons jour et nuit, ICO, icône Apple et icônes d’application.

#### GLO-03 · La lanterne en trois états : éteinte, qui s’allume, allumée avec halo

- **Priorité** : socle · **Méthode** : SVG, à dessiner (vectoriel)
- **Produit par** : équipe Identité et éléments globaux
- **Emplacement** : toutes les pages · Bascule jour/nuit _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/components/layout/BasculeLanterne.astro`
- **Sujet** : La lanterne en trois états : éteinte, qui s’allume, allumée avec halo
- **Composition** : Calques séparés (corps, flamme, halo) pour une transition CSS de 300 à 400 ms
- **Format** : 1:1, 24 et 64 px
- **Fichier attendu** : `site/src/assets/visuels/global/GLO-03.svg` (lot de 3)
- **Pièces du fichier** (3) : `lt-halo`, `lt-trait`, `lt-flamme`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif
- **Note** : Livré le 13 octobre 2026 : un seul fichier à trois calques (lt-halo, lt-trait, lt-flamme), dont le site anime les états en CSS (components/layout/BasculeLanterne.astro).

#### GLO-04 · Pictogrammes des trois verbes : maîtriser (un livre de règles ouvert, main posée à plat), réinventer (une carte retournée au milieu d’un éventail de cartes identiques), emmener (une lanterne qui en allume une seconde)

- **Priorité** : socle · **Méthode** : SVG, à dessiner (vectoriel)
- **Produit par** : équipe Identité et éléments globaux
- **Emplacement** : toutes les pages · Toutes les pages _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/components/ui/PictoVerbe.astro`
- **Sujet** : Pictogrammes des trois verbes : maîtriser (un livre de règles ouvert, main posée à plat), réinventer (une carte retournée au milieu d’un éventail de cartes identiques), emmener (une lanterne qui en allume une seconde)
- **Composition** : Même grille de 48, même trait
- **Format** : 3 × 1:1, 48 et 96 px
- **Fichier attendu** : `site/src/assets/visuels/global/GLO-04.svg` (lot de 3)
- **Pièces du fichier** (3) : `maitriser`, `reinventer`, `emmener`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif
- **Note** : Livré le 13 octobre 2026 : un fichier à trois <symbol>, dessinés à la main d’après la maquette « Lanterne » et insérés dans la page par components/ui/PictoVerbe.astro, qui les recolore par jetons. Ses identifiants de symbole, antérieurs à la règle des lots, ne portent pas le préfixe GLO-04.

#### GLO-05 · Cadres d’appareil neutres : navigateur, téléphone, terminal

- **Priorité** : socle · **Méthode** : SVG, à dessiner (vectoriel)
- **Produit par** : équipe Identité et éléments globaux
- **Emplacement** : toutes les pages · Toutes les captures _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/components/ui/CadreCapture.astro`
- **Sujet** : Cadres d’appareil neutres : navigateur, téléphone, terminal
- **Composition** : Trait de 1 px, sans marque, coins selon les jetons
- **Format** : 16:10 ; 9:19,5 ; 16:10
- **Fichier attendu** : `site/src/assets/visuels/global/GLO-05.svg` (lot de 3)
- **Pièces du fichier** (3) : `GLO-05-navigateur`, `GLO-05-telephone`, `GLO-05-terminal`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif
- **Note** : Livré le 13 octobre 2026, avec une quatrième pièce, GLO-05-points (les trois points de barre). CadreCapture.astro en insère les points et le haut-parleur du téléphone, dans les teintes de cadre ; le contour reste en CSS pour suivre la taille de chaque capture.

#### GLO-07 · Nom, métier, accroche, emblème, photo en couleur (chemise bleu roi)

- **Priorité** : socle · **Méthode** : OG, à composer en HTML puis rendre en PNG
- **Produit par** : équipe Identité et éléments globaux
- **Emplacement** : toutes les pages · Partage par défaut _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/lib/partage.ts`, `src/layouts/Base.astro`
- **Sujet** : Nom, métier, accroche, emblème, photo en couleur (chemise bleu roi)
- **Composition** : Typographie réelle de la direction : Instrument Serif pour l’accroche, Instrument Sans pour le nom et le métier, sur la pierre du jour
- **Format** : 1200 × 630
- **Fichier attendu** : `site/public/og/GLO-07_1200x630.png`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Charles Lindecker, architecte logiciel. Je maîtrise d’abord les règles du jeu. Ensuite, je les réinvente. »

#### GLO-08 · Gabarit de GLO-07 avec le visuel de la page : Projets, chaque projet, Parcours et ses trois pages, Contact, Blog, Mentions légales

- **Priorité** : socle · **Méthode** : OG, à composer en HTML puis rendre en PNG
- **Produit par** : équipe Identité et éléments globaux
- **Emplacement** : toutes les pages · Partage par page _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/lib/partage.ts`, `src/layouts/Base.astro`
- **Sujet** : Gabarit de GLO-07 avec le visuel de la page : Projets, chaque projet, Parcours et ses trois pages, Contact, Blog, Mentions légales
- **Composition** : Titre à gauche, visuel à droite, emblème en bas
- **Format** : 1200 × 630 (×13)
- **Fichiers attendus** (13) : `site/public/og/GLO-08-projets_1200x630.png` (alt « Charles Lindecker, Projets. ») ; `site/public/og/GLO-08-projets-pvz-fusion_1200x630.png` (alt « Charles Lindecker, PvZ Fusion, pôle francophone : une équipe formée et menée. ») ; `site/public/og/GLO-08-projets-league-of-database_1200x630.png` (alt « Charles Lindecker, League Of Data Base : un système en production. ») ; `site/public/og/GLO-08-projets-omnicard_1200x630.png` (alt « Charles Lindecker, Omnicard : réinventer. ») ; `site/public/og/GLO-08-projets-bloodborne-legendary-run_1200x630.png` (alt « Charles Lindecker, Bloodborne Legendary Run : un produit de bout en bout. ») ; `site/public/og/GLO-08-projets-gup_1200x630.png` (alt « Charles Lindecker, gup : un outil open source. ») ; `site/public/og/GLO-08-parcours_1200x630.png` (alt « Charles Lindecker, Parcours. ») ; `site/public/og/GLO-08-parcours-professionnel_1200x630.png` (alt « Charles Lindecker, Parcours professionnel. ») ; `site/public/og/GLO-08-parcours-competences_1200x630.png` (alt « Charles Lindecker, Compétences. ») ; `site/public/og/GLO-08-parcours-formation_1200x630.png` (alt « Charles Lindecker, Formation et certifications. ») ; `site/public/og/GLO-08-contact_1200x630.png` (alt « Charles Lindecker, Discutons. ») ; `site/public/og/GLO-08-blog_1200x630.png` (alt « Charles Lindecker, Blog. ») ; `site/public/og/GLO-08-mentions-legales_1200x630.png` (alt « Charles Lindecker, Mentions légales. »)
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Charles Lindecker et le titre de la page partagée, par exemple « Charles Lindecker, Parcours. » (voir chaque déclinaison). »
- **Note** : Treize déclinaisons, une par page publique, livrées le 13 octobre 2026 : lib/partage.ts est la seule source de leurs titres et de leurs alts, tools/generer-partage.mjs les compose en HTML avec la vraie typographie, et layouts/Base.astro choisit celle de la page. Le visuel de droite est une photo de séance (Contact, Parcours) ou la lanterne allumée ; PVZ-OG, OMN-OG et BLR-OG pourront le remplacer pour leur projet. La 404 garde l’image par défaut, GLO-07.

### Accueil

#### ACC-01 · Portrait de Charles dans le colza

- **Priorité** : socle · **Méthode** : PHO, photo réelle, traitements déterministes seulement
- **Produit par** : équipe Accueil
- **Emplacement** : `/` · Couverture, à droite de l’accroche ; sur mobile, après le bandeau des preuves _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/components/accueil/Couverture.astro`
- **Sujet** : Portrait de Charles dans le colza
- **Composition** : Photo existante charles-4, en couleur, cadrage vertical 4:5 sur le visage et la chemise bleu roi, sans agrandissement ; la nuit, un voile de lune et une lueur de lanterne posée sur le côté éclairé du visage, en CSS (composant Portrait)
- **Format** : 4:5
- **Fichier attendu** : `site/src/assets/photos/charles-4.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Charles Lindecker, chemise bleu roi, dans un champ de colza en fleur. »
- **Note** : Existe : photo charles-4, jamais régénérée. Lueur de nuit centrée sur la joue éclairée (54 % de la largeur, 39 % de la hauteur du cadre 4:5).

#### ACC-02 · Trois pictos des verbes

- **Priorité** : socle · **Méthode** : SVG, rien à produire, le fichier est celui d’un autre emplacement
- **Emplacement** : `/` · Couverture, bandeau des preuves _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/components/accueil/BandeauPreuves.astro`
- **Sujet** : Trois pictos des verbes
- **Composition** : Les trois pictos de GLO-04, sans nouveau dessin
- **Format** : —
- **Fichier attendu** : aucun, reprend `GLO-04`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif
- **Note** : Le bandeau des preuves pose les trois pictos de GLO-04 par components/ui/PictoVerbe.astro.

#### ACC-06 · Le plafond puis le saut

- **Priorité** : socle · **Méthode** : FIG, figure codée depuis des données, rien à générer
- **Produit par** : équipe Accueil
- **Emplacement** : `/` · 01, Gwent _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/pages/index.astro`
- **Sujet** : Le plafond puis le saut
- **Composition** : Figure existante FigurePlafond.astro, agrandie, sans « Fig. 1 » : courbe à l’encre tracée à l’arrivée, plateau de quatre mois grisé, percée au laiton le jour et à la lanterne la nuit ; se rejoue au clic
- **Format** : 16:9
- **Composant** : `site/src/components/accueil/FigurePlafond.astro`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Une courbe à l’encre qui plafonne pendant quatre mois, puis perce. »
- **Note** : Existe : FigurePlafond.astro.

#### ACC-14 · La flamme qui se transmet

- **Priorité** : socle · **Méthode** : SVG, à dessiner (vectoriel)
- **Produit par** : équipe Accueil
- **Emplacement** : `/` · 02, du solo au collectif : scène « Une lanterne allumée en allume d’autres », rejouable au clic _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/components/accueil/SceneLanternes.astro`
- **Sujet** : La flamme qui se transmet
- **Composition** : Trois lanternes de même modèle posées sur une ligne de sol, la première allumée ; une étincelle part de sa flamme et allume la deuxième, puis la troisième (dessin validé le 2026-10-08) ; trajets en pointillé ; calques séparés (lanternes au trait, lumières, étincelles) que le site anime
- **Format** : 4:3, viewBox 320 × 240
- **Fichier attendu** : `site/src/assets/visuels/accueil/ACC-14.svg`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Trois lanternes : la première, allumée, passe sa flamme à la deuxième, puis à la troisième. »
- **Note** : Livré le 13 octobre 2026 : un seul fichier à calques, inséré dans la page et animé en CSS (components/accueil/SceneLanternes.astro), comme la lanterne de la bascule (GLO-03). Remplace la commande d’image 21:9 du cahier.

#### ACC-17 · Le système qui communique

- **Priorité** : socle · **Méthode** : SVG, à dessiner (vectoriel)
- **Produit par** : équipe Accueil
- **Emplacement** : `/` · 02, aujourd’hui, à côté du métier : scène « Un petit système, en plan », qui communique en boucle tant qu’elle est visible _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/components/accueil/SceneSysteme.astro`
- **Sujet** : Le système qui communique
- **Composition** : Plan d’architecte vu de dessus, de la même main que les lanternes (ACC-14) et le logo : à gauche, une petite lanterne du même modèle, seule source de lumière, qui émet les messages ; au centre, à droite et en haut à droite, trois blocs en plan (murs doubles, cloisons, ouvertures, une porte en arc pointillé), sans aucun pictogramme ni glyphe, une partie de chaque bloc hachurée en réserve ; liaisons à angle droit et chemin de retour en pointillé ; des messages, points de lumière, circulent dans l’ordre requête, données, réponse, livraison ; deux aplats (surface et lanterne) sur le trait d’encre ; calques séparés (trait, aplats, hachures, lumière) que le site anime
- **Format** : 4:3, viewBox 320 × 240
- **Fichier attendu** : `site/src/assets/visuels/accueil/ACC-17.svg`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Un petit système en plan : une lanterne émet des messages de lumière qui traversent trois blocs reliés. »
- **Note** : Livré le 13 octobre 2026, redessiné le même jour : plus de poste « </> », de tour serveur, de cylindre ni de fenêtre cochée, mais des blocs en plan et la lanterne comme source. Animé en boucle en CSS (components/accueil/SceneSysteme.astro) ; la boucle s’arrête hors de l’écran, dans un onglet masqué et en mouvement réduit.

### Projets (vitrine)

#### PRJ-04 · Le ciel des objectifs

- **Priorité** : socle · **Méthode** : CAP, capture réelle, rien à générer
- **Produit par** : équipe Projets (vitrine)
- **Emplacement** : `/projets` · Carte Bloodborne _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/pages/projets/index.astro`
- **Sujet** : Le ciel des objectifs
- **Composition** : Capture réelle de l’atlas sur téléphone (écran /fr/sky à 390 × 844, densité 2), montrée entière dans le cadre téléphone (GLO-05) sur ordinateur, coupée sous la première galaxie sur mobile
- **Format** : 9:19,5, 780 × 1688 ; 4:5 mobile (recadrage mobile 4:5)
- **Fichier attendu** : `site/src/assets/projets/bloodborne/atlas.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « L’atlas de Bloodborne Legendary Run sur téléphone : chaque galaxie d’objectifs avec sa progression, et la chasse à reprendre en tête. »
- **Note** : Capture existante du 8 octobre 2026, provenance dans src/assets/projets/README.md. Posée par CadreCapture, pas par Visuel.

#### PRJ-05 · La sélection des mises à jour

- **Priorité** : socle · **Méthode** : CAP, capture réelle, rien à générer
- **Produit par** : équipe Projets (vitrine)
- **Emplacement** : `/projets` · Carte gup _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/pages/projets/index.astro`
- **Sujet** : La sélection des mises à jour
- **Composition** : Capture réelle de l’écran packages-select en français, déjà fenêtrée, dans le cadre terminal (GLO-05) : les paquets classés par source, une source en échec qui ne bloque pas les autres
- **Format** : ≈ 3:2, 1624 × 1052
- **Fichier attendu** : `site/src/assets/projets/gup-selection.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « gup en français dans un terminal : les mises à jour classées par source, et une source en échec qui ne bloque pas les autres. »
- **Note** : Capture existante (générateur de captures de gup, exécuté en français), provenance dans src/assets/projets/README.md. Posée par CadreCapture, pas par Visuel.

### PvZ Fusion

#### PVZ-03 · La boucle

- **Priorité** : socle · **Méthode** : FIG, figure codée depuis des données, rien à générer
- **Produit par** : équipe PvZ Fusion
- **Emplacement** : `/projets/pvz-fusion` · § 3, la semaine type _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/pages/projets/pvz-fusion.astro`
- **Sujet** : La boucle
- **Composition** : Les quatre cartes de gestion de projet (organiser, livrer, motiver, remercier) disposées deux sur deux dans le sens horaire, reliées par des flèches, « une semaine » au centre ; une liste ordonnée sur mobile
- **Format** : libre, suit la grille des cartes
- **Composant** : `site/src/components/projets/pvz/BoucleSemaine.astro`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « La semaine type en boucle : organiser, livrer, motiver, remercier. »
- **Note** : Dessinée en HTML et CSS, sans image à générer. Les vignettes des cartes sont PVZ-05, PVZ-07, PVZ-08 et PVZ-11.

#### PVZ-F1 · Courbe du rattrapage

- **Priorité** : socle · **Méthode** : FIG, figure codée depuis des données, rien à générer
- **Produit par** : équipe PvZ Fusion
- **Emplacement** : `/projets/pvz-fusion` · § 4 _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/pages/projets/pvz-fusion.astro`
- **Sujet** : Courbe du rattrapage
- **Composition** : Huit relevés de l’historique public, du 16/10/2025 au 12/10/2026 (docs/matiere-premiere.md) : entrées anglaises (la ligne), part traduite en encre, manquant en hachures, août 2026 marqué à la lanterne
- **Format** : 16:9 ; 4:5 mobile (recadrage mobile 4:5)
- **Composant** : `site/src/components/projets/pvz/FigureRattrapage.astro`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Courbe des entrées anglaises et de la part traduite, en huit relevés du 16/10/2025 au 12/10/2026. »
- **Note** : Codée : scène qui se trace à son arrivée et se rejoue au clic ; tableau des relevés en dessous.

#### PVZ-F2 · La 4.0 en six jours

- **Priorité** : socle · **Méthode** : FIG, figure codée depuis des données, rien à générer
- **Produit par** : équipe PvZ Fusion
- **Emplacement** : `/projets/pvz-fusion` · § 4 _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/pages/projets/pvz-fusion.astro`
- **Sujet** : La 4.0 en six jours
- **Composition** : 20/09 textes d’origine versés au dépôt → 26/09 PR française fusionnée → 01/10 sortie multilingue
- **Format** : 4:1
- **Composant** : `site/src/components/projets/pvz/FigureQuatreZero.astro`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Trois dates : textes d’origine versés le 20/09, traduction française fusionnée le 26/09, sortie multilingue le 01/10. »
- **Note** : Codée en HTML.

#### PVZ-F3 · Frise des arrivées

- **Priorité** : socle · **Méthode** : FIG, figure codée depuis des données, rien à générer
- **Produit par** : équipe PvZ Fusion
- **Emplacement** : `/projets/pvz-fusion` · § 2 _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/pages/projets/pvz-fusion.astro`
- **Sujet** : Frise des arrivées
- **Composition** : Neuf arrivées datées des journaux publics (08/12/2025 → 23/03/2026), en silhouettes anonymes empilées quand deux dates se touchent ; aucun pseudonyme
- **Format** : 4:1
- **Composant** : `site/src/components/projets/pvz/FigureEquipe.astro`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Neuf arrivées anonymes, du 08/12/2025 au 23/03/2026. »
- **Note** : Réunie avec PVZ-F4 dans une seule figure codée.

#### PVZ-F4 · Traducteur → Lead → Mainteneur

- **Priorité** : socle · **Méthode** : FIG, figure codée depuis des données, rien à générer
- **Produit par** : équipe PvZ Fusion
- **Emplacement** : `/projets/pvz-fusion` · En-tête, § 2 _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/pages/projets/pvz-fusion.astro`
- **Sujet** : Traducteur → Lead → Mainteneur
- **Composition** : Trois jalons datés : traducteur le 21/10/2025, lead du pôle le 05/12/2025 (journal public), mainteneur au plus tard le 26/09/2026 (il fusionne la PR #223)
- **Format** : 3:1
- **Composant** : `site/src/components/projets/pvz/FigureEquipe.astro`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Trois rôles datés : traducteur le 21/10/2025, lead du pôle le 05/12/2025, mainteneur au plus tard le 26/09/2026. »
- **Note** : Réunie avec PVZ-F3 dans une seule figure codée. Une scène : les arrivées apparaissent une à une, rejouable au clic.

#### PVZ-F5 · Le retard à l’arrivée, par catégorie

- **Priorité** : socle · **Méthode** : FIG, figure codée depuis des données, rien à générer
- **Produit par** : équipe PvZ Fusion
- **Emplacement** : `/projets/pvz-fusion` · § 1, le point de départ _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/pages/projets/pvz-fusion.astro`
- **Sujet** : Le retard à l’arrivée, par catégorie
- **Composition** : Trois barres au 16/10/2025 (plantes, zombies, textes d’interface) : traduit en encre, manquant en hachures, nombres et pourcentages en texte
- **Format** : libre, trois barres horizontales
- **Composant** : `site/src/components/projets/pvz/FigureDepart.astro`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Entrées anglaises sans équivalent français, le 16 octobre 2025 »
- **Note** : Codée en HTML, depuis le premier relevé.

### League Of Data Base

#### LOD-03 · Une donnée qui manque, rangée proprement

- **Priorité** : socle · **Méthode** : SVG, à dessiner (vectoriel)
- **Produit par** : équipe League Of Data Base
- **Emplacement** : `/projets/league-of-database` · § « Ce que les données ne disent pas », carte 1 (les runes absentes des anciens patchs) _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/config/league-of-database.ts`, `src/components/projets/league/PiegesDonnees.astro`
- **Sujet** : Une donnée qui manque, rangée proprement
- **Composition** : Une page de registre vue de face, lignes tracées en réserve ; au milieu, une case découpée laisse voir le vide, et un petit signet posé dans le trou dit que l’absence est notée, pas oubliée. Trait constant, deux aplats (encre, papier), la flamme de la lanterne en point de lumière sur le signet. Aucun texte ni chiffre
- **Format** : 1:1, grille 48, affiché à 96 px
- **Fichier attendu** : `site/src/assets/visuels/league-of-database/LOD-03.svg`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif
- **Note** : Livré le 13 octobre 2026 : dessin vectoriel écrit à la main, inséré dans la page par components/projets/league/PictoLeague.astro, qui en recolore les calques par les jetons (p-doux, p-aplat, p-lumiere…), jour et nuit. Premier des cinq pictos des pièges de la donnée (LOD-03, LOD-06 à LOD-09), dessinés de la même main : grille de 48, trait de 1,75 en currentColor, aucun texte. Posé en tête de la carte, au-dessus de son titre sur ordinateur et à sa gauche sur mobile.

#### LOD-05 · Le premier jet

- **Priorité** : socle · **Méthode** : SVG, à dessiner (vectoriel)
- **Produit par** : équipe League Of Data Base
- **Emplacement** : `/projets/league-of-database` · § « Changer de moteur sans perdre personne », frise LOD-F6, jalon 1 (août 2025, la première version) _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/config/league-of-database.ts`, `src/components/projets/league/FriseReecriture.astro`
- **Sujet** : Le premier jet
- **Composition** : Une feuille de brouillon froissée puis dépliée, couverte de traits illisibles, un crayon posé en travers. Trait constant, deux aplats (encre, papier). Aucun texte ni chiffre
- **Format** : 1:1, grille 48, affiché à 96 px
- **Fichier attendu** : `site/src/assets/visuels/league-of-database/LOD-05.svg`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif
- **Note** : Livré le 13 octobre 2026 : dessin vectoriel écrit à la main, inséré dans la page par components/projets/league/PictoLeague.astro, qui en recolore les calques par les jetons (p-doux, p-aplat, p-lumiere…), jour et nuit. Premier des quatre pictos des jalons de la réécriture (LOD-05, LOD-10 à LOD-12), de la main des pictos LOD-03 : grille de 48, trait de 1,75 en currentColor. Le jalon atteint (la bascule, LOD-12) porte seul la lumière de la lanterne.

#### LOD-06 · Une langue qui manque renvoie à la langue commune

- **Priorité** : socle · **Méthode** : SVG, à dessiner (vectoriel)
- **Produit par** : équipe League Of Data Base
- **Emplacement** : `/projets/league-of-database` · § « Ce que les données ne disent pas », carte 2 (les langues absentes d’une version) _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/config/league-of-database.ts`, `src/components/projets/league/PiegesDonnees.astro`
- **Sujet** : Une langue qui manque renvoie à la langue commune
- **Composition** : Deux bulles de parole : la première, vide et en pointillé, porte une petite flèche courbe qui la renvoie vers une seconde bulle pleine, plus grande, tracée en trait continu. Aucune lettre, aucun drapeau, aucun texte
- **Format** : 1:1, grille 48, affiché à 96 px
- **Fichier attendu** : `site/src/assets/visuels/league-of-database/LOD-06.svg`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif
- **Note** : Livré le 13 octobre 2026 : dessin vectoriel écrit à la main, inséré dans la page par components/projets/league/PictoLeague.astro, qui en recolore les calques par les jetons (p-doux, p-aplat, p-lumiere…), jour et nuit. Série des pictos des pièges : voir LOD-03.

#### LOD-07 · Deux jumeaux reliés

- **Priorité** : socle · **Méthode** : SVG, à dessiner (vectoriel)
- **Produit par** : équipe League Of Data Base
- **Emplacement** : `/projets/league-of-database` · § « Ce que les données ne disent pas », carte 3 (les objets en double pour une autre édition du jeu) _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/config/league-of-database.ts`, `src/components/projets/league/PiegesDonnees.astro`
- **Sujet** : Deux jumeaux reliés
- **Composition** : Deux petits objets identiques (deux gemmes taillées de face), l’un en trait plein, l’autre en trait double, reliés par un fil tendu qui fait une boucle à mi-chemin. Aucun objet de jeu reconnaissable, aucun texte
- **Format** : 1:1, grille 48, affiché à 96 px
- **Fichier attendu** : `site/src/assets/visuels/league-of-database/LOD-07.svg`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif
- **Note** : Livré le 13 octobre 2026 : dessin vectoriel écrit à la main, inséré dans la page par components/projets/league/PictoLeague.astro, qui en recolore les calques par les jetons (p-doux, p-aplat, p-lumiere…), jour et nuit. Série des pictos des pièges : voir LOD-03.

#### LOD-08 · Une image sans date

- **Priorité** : socle · **Méthode** : SVG, à dessiner (vectoriel)
- **Produit par** : équipe League Of Data Base
- **Emplacement** : `/projets/league-of-database` · § « Ce que les données ne disent pas », carte 4 (les illustrations et vidéos non versionnées) _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/config/league-of-database.ts`, `src/components/projets/league/PiegesDonnees.astro`
- **Sujet** : Une image sans date
- **Composition** : Une bande de pellicule de trois images vues de face ; l’étiquette de bord, là où une date s’écrirait, est vide et barrée d’un petit trait. Les images restent des rectangles sans sujet. Aucun texte ni chiffre
- **Format** : 1:1, grille 48, affiché à 96 px
- **Fichier attendu** : `site/src/assets/visuels/league-of-database/LOD-08.svg`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif
- **Note** : Livré le 13 octobre 2026 : dessin vectoriel écrit à la main, inséré dans la page par components/projets/league/PictoLeague.astro, qui en recolore les calques par les jetons (p-doux, p-aplat, p-lumiere…), jour et nuit. Série des pictos des pièges : voir LOD-03.

#### LOD-09 · Un éclair qui ne laisse pas de trace

- **Priorité** : socle · **Méthode** : SVG, à dessiner (vectoriel)
- **Produit par** : équipe League Of Data Base
- **Emplacement** : `/projets/league-of-database` · § « Ce que les données ne disent pas », carte 5 (une erreur passagère n’est jamais enregistrée comme une absence) _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/config/league-of-database.ts`, `src/components/projets/league/PiegesDonnees.astro`
- **Sujet** : Un éclair qui ne laisse pas de trace
- **Composition** : Un petit éclair qui frappe un registre fermé ; sous l’impact, la couverture reste intacte, sans brûlure ni marque, et le signet du registre (le même que LOD-03) n’a pas bougé. Aucun texte
- **Format** : 1:1, grille 48, affiché à 96 px
- **Fichier attendu** : `site/src/assets/visuels/league-of-database/LOD-09.svg`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif
- **Note** : Livré le 13 octobre 2026 : dessin vectoriel écrit à la main, inséré dans la page par components/projets/league/PictoLeague.astro, qui en recolore les calques par les jetons (p-doux, p-aplat, p-lumiere…), jour et nuit. Série des pictos des pièges : voir LOD-03.

#### LOD-10 · Un carnet de décisions

- **Priorité** : socle · **Méthode** : SVG, à dessiner (vectoriel)
- **Produit par** : équipe League Of Data Base
- **Emplacement** : `/projets/league-of-database` · § « Changer de moteur sans perdre personne », frise LOD-F6, jalon 2 (24 septembre 2026, les dix décisions écrites) _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/config/league-of-database.ts`, `src/components/projets/league/FriseReecriture.astro`
- **Sujet** : Un carnet de décisions
- **Composition** : Un carnet ouvert vu de trois quarts, dix onglets de couleur unie qui dépassent de la tranche, un ruban marque-page. Pages couvertes de traits illisibles. Aucun texte ni chiffre
- **Format** : 1:1, grille 48, affiché à 96 px
- **Fichier attendu** : `site/src/assets/visuels/league-of-database/LOD-10.svg`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif
- **Note** : Livré le 13 octobre 2026 : dessin vectoriel écrit à la main, inséré dans la page par components/projets/league/PictoLeague.astro, qui en recolore les calques par les jetons (p-doux, p-aplat, p-lumiere…), jour et nuit. Série des pictos des jalons : voir LOD-05.

#### LOD-11 · Une balance à l’équilibre

- **Priorité** : socle · **Méthode** : SVG, à dessiner (vectoriel)
- **Produit par** : équipe League Of Data Base
- **Emplacement** : `/projets/league-of-database` · § « Changer de moteur sans perdre personne », frise LOD-F6, jalon 3 (26 septembre 2026, la parité vérifiée) _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/config/league-of-database.ts`, `src/components/projets/league/FriseReecriture.astro`
- **Sujet** : Une balance à l’équilibre
- **Composition** : Une balance à deux plateaux parfaitement de niveau ; sur chaque plateau, une même petite pile de feuilles. Le fléau est horizontal. Aucun texte ni chiffre
- **Format** : 1:1, grille 48, affiché à 96 px
- **Fichier attendu** : `site/src/assets/visuels/league-of-database/LOD-11.svg`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif
- **Note** : Livré le 13 octobre 2026 : dessin vectoriel écrit à la main, inséré dans la page par components/projets/league/PictoLeague.astro, qui en recolore les calques par les jetons (p-doux, p-aplat, p-lumiere…), jour et nuit. Série des pictos des jalons : voir LOD-05.

#### LOD-12 · Une porte qui s’ouvre sur la lumière

- **Priorité** : socle · **Méthode** : SVG, à dessiner (vectoriel)
- **Produit par** : équipe League Of Data Base
- **Emplacement** : `/projets/league-of-database` · § « Changer de moteur sans perdre personne », frise LOD-F6, jalon 4 (4 octobre 2026, la bascule en production) _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/config/league-of-database.ts`, `src/components/projets/league/FriseReecriture.astro`
- **Sujet** : Une porte qui s’ouvre sur la lumière
- **Composition** : Une porte entrouverte vue de face ; par l’ouverture, la lumière de la lanterne trace un trapèze au sol. Seul picto de la série à porter l’aplat de lumière. Aucun texte
- **Format** : 1:1, grille 48, affiché à 96 px
- **Fichier attendu** : `site/src/assets/visuels/league-of-database/LOD-12.svg`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif
- **Note** : Livré le 13 octobre 2026 : dessin vectoriel écrit à la main, inséré dans la page par components/projets/league/PictoLeague.astro, qui en recolore les calques par les jetons (p-doux, p-aplat, p-lumiere…), jour et nuit. Série des pictos des jalons : voir LOD-05.

#### LOD-F1 · Ahri, patch 3.6.14 et patch 16.20.1

- **Priorité** : socle · **Méthode** : FIG, figure codée depuis des données, rien à générer
- **Produit par** : équipe League Of Data Base
- **Emplacement** : `/projets/league-of-database` · § « Ce n’était pas la même Ahri » _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/pages/projets/league-of-database.astro`
- **Sujet** : Ahri, patch 3.6.14 et patch 16.20.1
- **Composition** : Tableau HTML côte à côte, une ligne surlignée (les points de vie) ; les deux panneaux de statistiques réels à côté, agrandissables
- **Format** : —
- **Composant** : `site/src/components/projets/league/ComparaisonAhri.astro`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Ahri au patch 3.6.14 et au patch 16.20.1, côte à côte »
- **Note** : Codée en HTML, depuis config/league-of-database.ts (COMPARAISON). Relevés dans docs/matiere-premiere.md.

#### LOD-F2 · Le trafic

- **Priorité** : socle · **Méthode** : FIG, figure codée depuis des données, rien à générer
- **Produit par** : équipe League Of Data Base
- **Emplacement** : `/projets/league-of-database` · § « En production », le trafic _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/pages/projets/league-of-database.astro`
- **Sujet** : Le trafic
- **Composition** : Schéma simplifié : cache du patch actuel, cache des archives, préparation d’un nouveau patch
- **Format** : 16:9
- **Composant** : `site/src/components/projets/league/Fabrication.astro`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Trois caches : le patch actuel, les archives et la préparation d’un nouveau patch. »
- **Note** : Codée en HTML et SVG (bloc #trafic), réunie avec LOD-F3 à LOD-F5.

#### LOD-F3 · Une copie ailleurs, un retour vérifiable

- **Priorité** : socle · **Méthode** : FIG, figure codée depuis des données, rien à générer
- **Produit par** : équipe League Of Data Base
- **Emplacement** : `/projets/league-of-database` · § « En production », les sauvegardes _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/pages/projets/league-of-database.astro`
- **Sujet** : Une copie ailleurs, un retour vérifiable
- **Composition** : Chaîne en quatre étapes (base, copie, chiffrement, stockage hors du serveur) séparées par la frontière du serveur, puis le retour : restauration dans une base temporaire et journal des passes
- **Format** : libre, 4:1 sur ordinateur, en pile sur mobile
- **Composant** : `site/src/components/projets/league/Fabrication.astro`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « La chaîne des sauvegardes et de la restauration »
- **Note** : Codée en HTML et SVG (bloc #sauvegardes), réunie avec LOD-F2. Le dispositif est celui du dépôt public ; son activation en production reste à confirmer.

#### LOD-F4 · Construire une fois, livrer la même version

- **Priorité** : socle · **Méthode** : FIG, figure codée depuis des données, rien à générer
- **Produit par** : équipe League Of Data Base
- **Emplacement** : `/projets/league-of-database` · § « En production », la livraison _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/pages/projets/league-of-database.astro`
- **Sujet** : Construire une fois, livrer la même version
- **Composition** : Trois étapes (construire, valider en test, promouvoir en production) portant le même colis de trois images (API, web, serveur web), coché après le test
- **Format** : libre, 3:1 sur ordinateur, en pile sur mobile
- **Composant** : `site/src/components/projets/league/Fabrication.astro`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « La livraison des mêmes images, du test à la production »
- **Note** : Codée en HTML (bloc #livraison), avec les logos de src/assets/stacks/, réunie avec LOD-F2.

#### LOD-F5 · Le trajet d’un événement de mesure

- **Priorité** : socle · **Méthode** : FIG, figure codée depuis des données, rien à générer
- **Produit par** : équipe League Of Data Base
- **Emplacement** : `/projets/league-of-database` · § « En production », la mesure d’audience _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/pages/projets/league-of-database.astro`
- **Sujet** : Le trajet d’un événement de mesure
- **Composition** : Trois étapes : une fiche ouverte (page, langue, patch), un usage mesuré (recherche, partage), le tableau d’audience. Aucun chiffre ni écran simulé
- **Format** : libre, 3:1 sur ordinateur, en pile sur mobile
- **Composant** : `site/src/components/projets/league/Fabrication.astro`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Le trajet d’un événement de mesure d’audience »
- **Note** : Codée en HTML et SVG (bloc #audience), réunie avec LOD-F2. La capture du tableau attend un lien de partage public.

#### LOD-F6 · Quatre jalons datés de la réécriture

- **Priorité** : socle · **Méthode** : FIG, figure codée depuis des données, rien à générer
- **Produit par** : équipe League Of Data Base
- **Emplacement** : `/projets/league-of-database` · § « Changer de moteur sans perdre personne », la frise _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/pages/projets/league-of-database.astro`
- **Sujet** : Quatre jalons datés de la réécriture
- **Composition** : Frise horizontale de quatre jalons datés (première version, dix décisions, parité vérifiée, bascule), le dernier marqué à la lanterne ; verticale sur mobile. Pictos LOD-05, LOD-10, LOD-11 et LOD-12
- **Format** : libre, 4:1 sur ordinateur, en pile sur mobile
- **Composant** : `site/src/components/projets/league/FriseReecriture.astro`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « La réécriture en quatre jalons, d’août 2025 au 4 octobre 2026 »
- **Note** : Codée en HTML, depuis config/league-of-database.ts (JALONS).

### Omnicard

#### OMN-03 · Le plateau, en schéma

- **Priorité** : socle · **Méthode** : FIG, figure codée depuis des données, rien à générer
- **Produit par** : équipe Omnicard
- **Emplacement** : `/projets/omnicard` · « Une partie en trente secondes », à côté du résumé des règles _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/pages/projets/omnicard.astro`
- **Sujet** : Le plateau, en schéma
- **Composition** : Les deux camps face à face : pour chacun, le héros et ses 30 points de vie, deux lignes d’unités, le deck de 40 cartes, la jauge de mana (10 au plus) et les cristaux (5 au plus) ; la main adverse en dos de cartes. Quatre cibles numérotées renvoient à la liste des repères en HTML ; présenté comme un schéma, jamais comme une capture
- **Format** : libre, suit la colonne de la figure
- **Composant** : `site/src/components/projets/omnicard/PlateauPartie.astro`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Schéma du plateau : deux héros à 30 points de vie, deux lignes d’unités chacun, un deck de 40 cartes, la mana et les cristaux. »
- **Note** : Dessinée en HTML et CSS depuis la version joueur des règles du moteur (docs/rules.md du dépôt de présentation), sans image à générer. Repli tant que la capture d’une vraie partie (OMN-08) manque.

#### OMN-04 · Le serveur arbitre

- **Priorité** : socle · **Méthode** : SVG, à dessiner (vectoriel)
- **Produit par** : équipe Omnicard
- **Emplacement** : `/projets/omnicard` · « D’une phrase à une règle », au-dessus du trajet d’une action _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/components/projets/omnicard/ServeurArbitre.astro`, `src/pages/projets/omnicard.astro`
- **Sujet** : Le serveur arbitre
- **Composition** : Deux fenêtres de navigateur génériques, une à gauche et une à droite, tournées vers un serveur central dessiné comme une table d’arbitre que la lanterne éclaire seule. De chaque fenêtre part une flèche vers le serveur (l’action jouée) ; du serveur repart vers chacune une flèche (l’état de la partie). Dans chaque fenêtre, la main du joueur face visible et la main adverse en dos de cartes, faces génériques sans illustration. Pas de spectateur, aucun texte, aucun logo
- **Format** : 16:9, 1600 × 900
- **Fichier attendu** : `site/src/assets/visuels/omnicard/OMN-04.svg`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Deux navigateurs envoient leurs actions à un serveur qui arbitre et renvoie à chacun l’état de la partie. »
- **Note** : Livré le 13 octobre 2026 : dessin vectoriel écrit à la main, inséré dans la page par components/projets/omnicard/ServeurArbitre.astro, avec l’alt du registre, qui en recolore les calques par les jetons (oa-aplat, oa-fin, oa-halo…), jour et nuit. Trait constant, deux aplats au plus, recolorés par les jetons (currentColor) ; les intitulés des trois étapes restent en HTML sous le dessin.

#### OMN-05 · Le compte à rebours

- **Priorité** : socle · **Méthode** : FIG, figure codée depuis des données, rien à générer
- **Produit par** : équipe Omnicard
- **Emplacement** : `/projets/omnicard` · « D’une phrase à une règle », à côté de la carte GitGud _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/pages/projets/omnicard.astro`
- **Sujet** : Le compte à rebours
- **Composition** : La carte GitGud, puis neuf fins de tour en frise qui alternent le lanceur et l’adversaire ; le compteur part de 5 et ne baisse qu’aux fins de tour du lanceur, jusqu’à 0 et l’égalité, à la lanterne. Les fins de tour s’allument une à une à l’arrivée, puis au clic sur la frise
- **Format** : libre, frise de neuf étapes ; en grille sur mobile
- **Composant** : `site/src/components/projets/omnicard/CompteARebours.astro`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Le compteur de GitGud baisse de 5 à 0 aux seules fins de tour du lanceur : cinq tours sur neuf fins de tour. »
- **Note** : Dessinée en HTML et CSS depuis la carte (docs/cards/wtf.md) et le mot-clé Délai (docs/keywords.md), sans image à générer.

### Bloodborne Legendary Run

#### BLR-06 · Le ciel dans un navigateur

- **Priorité** : socle · **Méthode** : SVG, à dessiner (vectoriel)
- **Produit par** : équipe Bloodborne Legendary Run
- **Emplacement** : `/projets/bloodborne-legendary-run` · § L’essayer, carte « Application web » (remplace le dessin au trait bleu de l’ancienne page) _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/components/projets/bloodborne/Acces.astro`
- **Sujet** : Le ciel dans un navigateur
- **Composition** : Une fenêtre de navigateur vue de face, sans marque, sans texte ni barre d’adresse lisible ; dans la fenêtre, un petit ciel de quatre étoiles reliées par des traits ; la lanterne posée devant la fenêtre éclaire l’étoile la plus haute, le reste de la scène dans l’ombre ; sujet centré, lisible à 88 px
- **Format** : 1:1, viewBox 120 (affiché de 88 à 120 px)
- **Fichier attendu** : `site/src/assets/visuels/bloodborne/BLR-06.svg`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif
- **Note** : Livré le 13 octobre 2026 : dessin vectoriel écrit à la main, inséré par <Visuel> en image ; seul, il suit le color-scheme de son conteneur (svg:root et prefers-color-scheme). Pendant de BLR-07 : même angle, même trait, même lanterne. Décoratif : le titre de la carte dit « Application web ».

#### BLR-07 · Le ciel dans un téléphone

- **Priorité** : socle · **Méthode** : SVG, à dessiner (vectoriel)
- **Produit par** : équipe Bloodborne Legendary Run
- **Emplacement** : `/projets/bloodborne-legendary-run` · § L’essayer, carte « Application Android » (remplace le dessin au trait bleu de l’ancienne page) _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/components/projets/bloodborne/Acces.astro`
- **Sujet** : Le ciel dans un téléphone
- **Composition** : Un téléphone tenu droit, vu de face, sans marque ni texte ; à l’écran, trois étoiles reliées en chemin qui monte ; la lanterne posée à côté du téléphone éclaire l’étoile du haut ; sujet centré, lisible à 88 px
- **Format** : 1:1, viewBox 120 (affiché de 88 à 120 px)
- **Fichier attendu** : `site/src/assets/visuels/bloodborne/BLR-07.svg`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif
- **Note** : Livré le 13 octobre 2026 : dessin vectoriel écrit à la main, inséré par <Visuel> en image ; seul, il suit le color-scheme de son conteneur (svg:root et prefers-color-scheme). Pendant de BLR-06. Décoratif : le titre de la carte dit « Application Android ».

#### BLR-08 · Le même ciel, deux écrans

- **Priorité** : socle · **Méthode** : SVG, à dessiner (vectoriel)
- **Produit par** : équipe Bloodborne Legendary Run
- **Emplacement** : `/projets/bloodborne-legendary-run` · § Comment je l’ai construit, couche « L’interface » (remplace le dessin au trait bleu de l’ancienne page) _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/components/projets/bloodborne/Fabrication.astro`
- **Sujet** : Le même ciel, deux écrans
- **Composition** : Une fenêtre de navigateur et, devant elle à droite, un téléphone tenu droit ; les deux écrans montrent la même petite constellation de quatre étoiles reliées ; la lanterne posée entre eux éclaire l’étoile commune ; aucun texte, aucune marque
- **Format** : 2:1, viewBox 440 × 220 (affiché de 96 à 300 px)
- **Fichier attendu** : `site/src/assets/visuels/bloodborne/BLR-08.svg`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif
- **Note** : Livré le 13 octobre 2026 : dessin vectoriel écrit à la main, inséré par <Visuel> en image ; seul, il suit le color-scheme de son conteneur (svg:root et prefers-color-scheme). Série de trois (BLR-08 à BLR-10) dans les cartes cliquables des couches : même cadrage horizontal, même ligne de sol, même lanterne. Sous 860 px, la carte l’affiche à 96 px de large : le sujet doit se lire en petit.

#### BLR-09 · Une réussite qui passe par le serveur

- **Priorité** : socle · **Méthode** : SVG, à dessiner (vectoriel)
- **Produit par** : équipe Bloodborne Legendary Run
- **Emplacement** : `/projets/bloodborne-legendary-run` · § Comment je l’ai construit, couche « L’API » (remplace le dessin au trait bleu de l’ancienne page) _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/components/projets/bloodborne/Fabrication.astro`
- **Sujet** : Une réussite qui passe par le serveur
- **Composition** : Trois fiches empilées au centre, comme des requêtes rangées ; une étoile entre par la gauche le long d’une flèche et ressort à droite, rangée ; la lanterne posée au pied de la pile éclaire la fiche du dessus ; aucun texte, aucune marque
- **Format** : 2:1, viewBox 440 × 220 (affiché de 96 à 300 px)
- **Fichier attendu** : `site/src/assets/visuels/bloodborne/BLR-09.svg`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif
- **Note** : Livré le 13 octobre 2026 : dessin vectoriel écrit à la main, inséré par <Visuel> en image ; seul, il suit le color-scheme de son conteneur (svg:root et prefers-color-scheme). Série BLR-08 à BLR-10. Décoratif : la carte dit « L’API » et sa fonction.

#### BLR-10 · La partie gardée

- **Priorité** : socle · **Méthode** : SVG, à dessiner (vectoriel)
- **Produit par** : équipe Bloodborne Legendary Run
- **Emplacement** : `/projets/bloodborne-legendary-run` · § Comment je l’ai construit, couche « La sauvegarde » (remplace le dessin au trait bleu de l’ancienne page) _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/components/projets/bloodborne/Fabrication.astro`
- **Sujet** : La partie gardée
- **Composition** : Une pile de trois disques, comme une base de données, scellée au sommet par une étoile allumée ; la lanterne posée à côté éclaire le sceau, le reste dans l’ombre ; aucun texte, aucune marque
- **Format** : 2:1, viewBox 440 × 220 (affiché de 96 à 300 px)
- **Fichier attendu** : `site/src/assets/visuels/bloodborne/BLR-10.svg`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif
- **Note** : Livré le 13 octobre 2026 : dessin vectoriel écrit à la main, inséré par <Visuel> en image ; seul, il suit le color-scheme de son conteneur (svg:root et prefers-color-scheme). Série BLR-08 à BLR-10. Décoratif : la carte dit « La sauvegarde » et sa fonction.

#### BLR-F1 · Les 22 galaxies réelles

- **Priorité** : socle · **Méthode** : FIG, figure codée depuis des données, rien à générer
- **Produit par** : équipe Bloodborne Legendary Run
- **Emplacement** : `/projets/bloodborne-legendary-run` · § 3 _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/pages/projets/bloodborne-legendary-run.astro`
- **Sujet** : Les 22 galaxies réelles
- **Composition** : Planche des 22 silhouettes dessinées depuis constellation.json (poses et traits), nom et nombre d’étoiles en HTML
- **Format** : 16:9 ; 3:4 mobile (recadrage mobile 3:4)
- **Composant** : `site/src/components/projets/bloodborne/Constellations.astro`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Planche des 22 silhouettes de galaxies, dessinées depuis les données du ciel. »
- **Note** : Codée depuis config/bloodborne-constellations.ts (généré par tools/extraire-constellations.mjs depuis constellation.json). Une scène : les constellations s’allument l’une après l’autre à l’arrivée, rejouable au clic.

#### BLR-C4 · Les posters des vidéos d’allumage

- **Priorité** : socle · **Méthode** : CAP, capture réelle, rien à générer
- **Produit par** : équipe Bloodborne Legendary Run
- **Emplacement** : `/projets/bloodborne-legendary-run` · En-tête (poster de la vidéo) et § Une réussite, une étoile qui s’allume (posters des quatre allumages) _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/components/projets/bloodborne/Rituels.astro`, `src/components/projets/bloodborne/VisuelEnTete.astro`
- **Sujet** : Les posters des vidéos d’allumage
- **Composition** : Une image réelle de chaque vidéo, prise au milieu de la cérémonie, sans retouche
- **Format** : 390 × 844, format des vidéos
- **Fichiers attendus** (5) : `site/public/demos/bloodborne/boss-poster.webp` ; `site/public/demos/bloodborne/decouverte-poster.webp` ; `site/public/demos/bloodborne/rune-poster.webp` ; `site/public/demos/bloodborne/gemme-poster.webp` ; `site/public/demos/bloodborne/boss-fin-poster.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif
- **Note** : CAP-BLR-4 du cahier (§ 6.12) : livrés le 9 octobre 2026 avec les vidéos, provenance dans src/assets/projets/bloodborne/allumages/README.md. Décoratifs : chaque vidéo porte son nom accessible.

### gup

#### GUP-02 · Les choix d’ingénierie

- **Priorité** : socle · **Méthode** : SVG, à dessiner (vectoriel)
- **Produit par** : équipe gup
- **Emplacement** : `/projets/gup` · Comment je l’ai construit, au-dessus de l’intertitre « Et deux choix de plus », sous les quatre décisions ; bandeau en pleine mesure jusqu’à 576 px (pleine largeur sur mobile), six pictos de 96 px dans l’ordre des quatre décisions puis des deux choix _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/components/projets/gup/PictosChoix.astro`, `src/pages/projets/gup.astro`
- **Sujet** : Les choix d’ingénierie
- **Composition** : Bandeau de six pictogrammes alignés, de la même main, trait constant en currentColor, un accent lanterne au plus par picto, espacement régulier, sans texte ni filet entre eux. Dans l’ordre : 1. une cloison étanche entre deux compartiments, l’un fissuré, l’autre intact (une source en panne reste dans sa ligne) ; 2. une liste d’arguments en petits blocs séparés, sans coquille de shell autour (aucun shell) ; 3. une file de quatre colis séparés dont un seul est tombé, les autres continuent sur leur tapis (un paquet par appel : un échec ne fait tomber qu’une installation) ; 4. un réveil qui sonne puis s’éteint, sans fil vers rien (rien ne tourne en arrière-plan) ; 5. trois silhouettes génériques d’ordinateurs dont deux grisées en hachures (chaque système voit ses outils) ; 6. un œil devant deux pastilles contrastées (lisible partout). Aucun logo de système d’exploitation ni de gestionnaire de paquets, aucune lettre.
- **Format** : 6:1, 576 × 96
- **Fichier attendu** : `site/src/assets/visuels/gup/GUP-02.svg` (lot de 6)
- **Pièces du fichier** (6) : `GUP-02-cloison`, `GUP-02-arguments`, `GUP-02-colis`, `GUP-02-reveil`, `GUP-02-systemes`, `GUP-02-lisible`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif
- **Note** : Livré le 13 octobre 2026 : dessin vectoriel écrit à la main, inséré dans la page, décoratif, par components/projets/gup/PictosChoix.astro, qui recolore l’accent de chaque picto à la lanterne du thème. Un seul fichier SVG de 576 × 96 (viewBox 0 0 576 96), six cases de 96 × 96, chacune un groupe de classe GUP-02-… (les pièces) ; couleurs par currentColor et var(--lanterne) pour rester lisible jour et nuit. Les quatre premiers pictos répondent aux quatre décisions (la troisième, « un paquet par appel », remplace depuis le 13/10/2026 le lot administrateur unique, qui vient d’une contribution extérieure), les deux derniers aux deux choix qui suivent.

#### GUP-F1 · Les commandes réelles

- **Priorité** : socle · **Méthode** : FIG, figure codée depuis des données, rien à générer
- **Produit par** : équipe gup
- **Emplacement** : `/projets/gup` · § 1, le problème _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/pages/projets/gup.astro`
- **Sujet** : Les commandes réelles
- **Composition** : Onze commandes de mise à jour, une par outil, empilées dans une carte, face à gup éclairé
- **Format** : —
- **Composant** : `site/src/components/projets/gup/FigureCommandes.astro`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Onze commandes de mise à jour, une par outil, face à la seule commande gup »
- **Note** : Codée en HTML, données COMMANDES de config/gup.ts.

#### GUP-F2 · 153 sources par famille et par système

- **Priorité** : socle · **Méthode** : FIG, figure codée depuis des données, rien à générer
- **Produit par** : équipe gup
- **Emplacement** : `/projets/gup` · § 4, les règles de 153 outils _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/pages/projets/gup.astro`
- **Sujet** : 153 sources par famille et par système
- **Composition** : Sélecteur Windows, macOS, Linux qui grise en hachures les sources jamais lancées sur ce système ; un carré par source, vingt familles
- **Format** : 16:9
- **Composant** : `site/src/components/projets/gup/FigureSources.astro`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Un carré par source, 153 en vingt familles ; le sélecteur de système grise en hachures celles qui n’y tournent pas. »
- **Note** : Codée en HTML et CSS, sans script (:has), données config/gup-sources.ts tirées du registre de gup.

#### GUP-F3 · Les versions

- **Priorité** : socle · **Méthode** : FIG, figure codée depuis des données, rien à générer
- **Produit par** : équipe gup
- **Emplacement** : `/projets/gup` · § 5, tenu comme un produit _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/pages/projets/gup.astro`
- **Sujet** : Les versions
- **Composition** : Frise à l’échelle du temps des douze versions publiées sur npm, 0.1.0 → 0.5.3
- **Format** : 5:1
- **Composant** : `site/src/components/projets/gup/FigureVersions.astro`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Les douze versions publiées, de 0.1.0 à 0.5.3, à l’échelle du temps. »
- **Note** : Codée en HTML, données VERSIONS de config/gup.ts.

#### GUP-C1 · Les écrans de gup, en français

- **Priorité** : socle · **Méthode** : CAP, capture réelle, rien à générer
- **Produit par** : équipe gup
- **Emplacement** : `/projets/gup` · § Analyser, choisir, mettre à jour, garder une trace _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/pages/projets/gup.astro`, `src/config/gup.ts`
- **Sujet** : Les écrans de gup, en français
- **Composition** : Écrans réels du générateur de captures du dépôt, exécuté en français (paquets de démonstration, aucun gestionnaire de paquets lancé), sans recomposition
- **Format** : format natif des écrans
- **Fichiers attendus** (5) : `site/src/assets/projets/gup/packages-select.webp` ; `site/src/assets/projets/gup/scan-progress.webp` ; `site/src/assets/projets/gup/confirm-update.webp` ; `site/src/assets/projets/gup/update-running.webp` ; `site/src/assets/projets/gup/journal-activity.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif
- **Note** : CAP-GUP-1 du cahier (§ 6.12) : livrés, provenance dans src/assets/projets/gup/README.md ; leurs alts sont dans config/gup.ts. Les recadrages 4:5 pour mobile restent à faire.

### Parcours : hub, professionnel, compétences, formation

#### PAR-PHO · Portrait pensif

- **Priorité** : socle · **Méthode** : PHO, photo réelle, traitements déterministes seulement
- **Produit par** : équipe Parcours : hub, professionnel, compétences, formation
- **Emplacement** : `/parcours` · Hub, bandeau d’identité : à droite du titre et de l’identité (à droite de l’identité sur mobile) _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/pages/parcours.astro`
- **Sujet** : Portrait pensif
- **Composition** : Photo réelle n° 3 de la séance (chemise bleu roi, main au menton, parc en arrière-plan), recadrée en 4:5 depuis la source, sans détourage ni retouche ; la nuit, voile de lune et lueur de lanterne en CSS (composant Portrait)
- **Format** : 4:5, 960 × 1200
- **Fichier attendu** : `site/src/assets/visuels/parcours/PAR-PHO_960x1200.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Charles Lindecker, en chemise bleu roi, la main au menton, devant un parc. »
- **Note** : Livrée le 13 octobre 2026 : recadrage de design/assets/photos/sources/1536x2304_charles-3.webp (lignes 300 à 2 220, 1 536 px de large), jamais régénérée.

#### PAR-F1 · Mini-frise septembre 2023 → aujourd’hui

- **Priorité** : socle · **Méthode** : FIG, figure codée depuis des données, rien à générer
- **Produit par** : équipe Parcours : hub, professionnel, compétences, formation
- **Emplacement** : `/parcours` · Hub, sous le bandeau d’identité, pleine largeur _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/pages/parcours.astro`
- **Sujet** : Mini-frise septembre 2023 → aujourd’hui
- **Composition** : Trois couloirs (formation, travail, communauté), une ligne par activité, un mois vaut un mois de septembre 2023 (première activité) au mois de construction, filet plein à l’origine ; chaque ligne mène à sa fiche ; nature en forme et en mot, pointe pour ce qui continue, fondu pour une fin à confirmer, bords estompés pour une date connue à l’année ; la barre de PvZ Fusion se coupe en décembre 2025 (traducteur en contour, puis lead)
- **Format** : 16:5 sur ordinateur ; libellé au-dessus de chaque barre sur mobile
- **Composant** : `site/src/components/parcours/Frise.astro`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Le parcours de septembre 2023 à aujourd’hui, en trois couloirs : formation, travail et communauté. »
- **Note** : Codée le 13 octobre 2026 en HTML, depuis config/parcours.ts ; même composant que PRO-F1. La position du BUT Réseaux & Télécoms (connu à l’année, 2023–2024) est estompée aux deux bords. L’échelle commence en septembre 2023 : les huit premiers mois de 2023 étaient vides.

#### PRO-F1 · Chronologie

- **Priorité** : socle · **Méthode** : FIG, figure codée depuis des données, rien à générer
- **Produit par** : équipe Parcours : hub, professionnel, compétences, formation
- **Emplacement** : `/parcours/professionnel` · Professionnel, en tête du contenu, au-dessus des fiches _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/pages/parcours/professionnel.astro`
- **Sujet** : Chronologie
- **Composition** : Une ligne par expérience, de la plus récente à la plus ancienne, d’août 2025 au mois de construction, repères d’année et de trimestre ; nature en forme et en mot (plein, laiton, hachures, gris), pointe pour ce qui continue, fondu et mention « fin à confirmer » pour une date de fin inconnue ; filet plein à l’origine de l’échelle ; la barre de PvZ Fusion se coupe en décembre 2025 (traducteur en contour, puis lead) ; chaque ligne mène à sa fiche
- **Format** : 16:6 sur ordinateur ; libellé au-dessus de chaque barre sur mobile
- **Composant** : `site/src/components/parcours/Frise.astro`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Mes six expériences d’août 2025 à aujourd’hui, avec leurs durées et leurs chevauchements. »
- **Note** : Codée le 13 octobre 2026 en HTML, depuis config/parcours.ts ; même composant que PAR-F1.

#### CMP-F1 · Build-once : la chaîne de livraison de ce site

- **Priorité** : socle · **Méthode** : FIG, figure codée depuis des données, rien à générer
- **Produit par** : équipe Parcours : hub, professionnel, compétences, formation
- **Emplacement** : `/parcours/competences` · Compétences, Tests et livraison _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/pages/parcours/competences.astro`
- **Sujet** : Build-once : la chaîne de livraison de ce site
- **Composition** : Rail à cinq étapes relevées dans la CI du site (.github/workflows) : vérifier (types, tests unitaires et de bout en bout, build de contrôle non publié) → construire les images une seule fois (site et API, :sha, :staging) → déployer en test → porte humaine (fusion vers la branche principale) → promouvoir sans reconstruire (:staging → :prod, les deux images à la même révision) ; un sceau d’empreinte en laiton glisse de la construction à la production
- **Format** : 16:6 ; vertical sous 860 px
- **Composant** : `site/src/components/parcours/ChaineLivraison.astro`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Vérifier, construire les images une fois, les déployer en test, ouvrir la porte à la main, puis les promouvoir sans les reconstruire. »
- **Note** : Codée en HTML et CSS, depuis ci.yml, _build.yml et _promote.yml ; animée une fois à l’arrivée (environ 1,6 s, 400 ms par étape), rejouable au clic sur le rail, immobile en mouvement réduit.

#### CMP-09 · Trois capacités : assistants et agents, intégration aux applications (MCP), synthèse vocale

- **Priorité** : socle · **Méthode** : SVG, à dessiner (vectoriel)
- **Produit par** : équipe Parcours : hub, professionnel, compétences, formation
- **Emplacement** : `/parcours/competences` · Compétences, Intégration IA : un picto en tête de chacun des trois domaines _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/components/parcours/RepereCompetence.astro`
- **Sujet** : Trois capacités : assistants et agents, intégration aux applications (MCP), synthèse vocale
- **Composition** : Trois pictos au trait sur une grille de 48 : une bulle de dialogue contenant des chevrons de code, et une seconde bulle derrière (agents) ; une prise à deux broches reliée à un socle (connecteur) ; un micro de studio entouré d’ondes (voix). Trait de 1,6, une teinte de remplissage très légère, couleur du texte
- **Format** : 3 × 1:1, 48
- **Fichier attendu** : `site/src/assets/visuels/parcours/CMP-09.svg` (lot de 3)
- **Pièces du fichier** (3) : `CMP-09-agents`, `CMP-09-mcp`, `CMP-09-voix`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif
- **Note** : À la couleur de la lanterne dans le bandeau de veille.

#### CMP-10 · Claude, Codex, Kokoro, Piper, SQLx, OpenTUI, Dompdf, Axum, Make, axe-core, SQL, stockage S3 compatible, Nginx, PHPUnit, API Platform, Leaflet

- **Priorité** : socle · **Méthode** : SVG, à dessiner (vectoriel)
- **Produit par** : équipe Parcours : hub, professionnel, compétences, formation
- **Emplacement** : `/parcours/competences` · Compétences, pictos de repli des technologies sans logo officiel utilisable _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/components/parcours/IllustrationStack.astro`
- **Sujet** : Claude, Codex, Kokoro, Piper, SQLx, OpenTUI, Dompdf, Axum, Make, axe-core, SQL, stockage S3 compatible, Nginx, PHPUnit, API Platform, Leaflet
- **Composition** : Chercher d’abord les logos officiels et leurs conditions d’usage ; à défaut, un picto par fonction, au trait sur une grille de 24 (trait 1,5, extrémités arrondies), monochrome à l’encre du thème, lisible à 18 px : bulle de dialogue (Claude), chevrons et barre oblique (Codex), haut-parleur et ondes (Kokoro), barres d’égaliseur (Piper), base avec coche (SQLx), fenêtre de terminal avec invite (OpenTUI), feuille cornée (Dompdf), deux blocs reliés (Axum), trois nœuds en arbre (Make), silhouette d’accessibilité (axe-core), cylindre de base (SQL), seau (stockage S3), boîte traversée par une flèche (Nginx, serveur et proxy), presse-papiers coché (PHPUnit), cube (API Platform), repère de carte (Leaflet). Nginx, PHPUnit, API Platform et Leaflet ont un logo réduit à un mot-symbole, illisible à 18-28 px : leur picto le remplace. Aucun picto ne reprend la forme, la couleur ni la lettre d’un logo existant
- **Format** : 1:1, viewBox 24 ; affiché à 18 et 28 px
- **Fichier attendu** : `site/src/assets/visuels/parcours/CMP-10.svg` (lot de 16)
- **Pièces du fichier** (16) : `CMP-10-sql`, `CMP-10-axum`, `CMP-10-sqlx`, `CMP-10-stockage-s3`, `CMP-10-dompdf`, `CMP-10-opentui`, `CMP-10-make`, `CMP-10-axe-core`, `CMP-10-claude`, `CMP-10-codex`, `CMP-10-kokoro`, `CMP-10-piper`, `CMP-10-nginx`, `CMP-10-phpunit`, `CMP-10-api-platform`, `CMP-10-leaflet`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif
- **Note** : Dessinés de la même main que les pictos du site ; ils ne prétendent pas être des logos (src/assets/stacks/LISEZMOI.md). Un logo officiel retrouvé remplace son picto dans src/assets/stacks/ et LogoStack.astro.

#### FOR-09 · Solutions Frontend Mentor, en vraies captures

- **Priorité** : socle · **Méthode** : CAP, capture réelle, rien à générer
- **Produit par** : équipe Parcours : hub, professionnel, compétences, formation
- **Emplacement** : `/parcours/formation` · Formation, Frontend Mentor : à droite des chiffres (sous eux sur mobile) _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/config/formation.ts`, `src/pages/parcours/formation.astro`
- **Sujet** : Solutions Frontend Mentor, en vraies captures
- **Composition** : Mosaïque de quatre à six captures réelles de solutions publiées sur le profil public, chacune prise dans le navigateur à 1 440 px puis réduite à la même échelle ; grille de 3 × 2 (2 × 2 pour quatre), filet de 1 px entre les vignettes, aucune retouche
- **Format** : 16:10, 1600 × 1000
- **Fichier attendu** : `site/src/assets/visuels/parcours/FOR-09_1600x1000.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Des interfaces réalisées à partir de maquettes Frontend Mentor, en mosaïque. »
- **Note** : Livrée le 13 octobre 2026 : six solutions du profil public https://www.frontendmentor.io/profile/LINDECKER-Charles (Room Homepage, Loopstudios landing page, E-commerce product page, News Homepage, REST Countries API with color theme switcher, Time tracking dashboard), capturées en ligne à 1 440 px de large, réduites à la même échelle et assemblées en grille de 3 × 2, sans retouche (CAP-FOR-1 du cahier). Remplace l’ancienne illustration au trait de la section.

### Contact

#### CON-PHO · Portrait de Charles devant la friche

- **Priorité** : socle · **Méthode** : PHO, photo réelle, traitements déterministes seulement
- **Produit par** : équipe Contact
- **Emplacement** : `/contact` · Contact, carte d’identité à côté du formulaire (sous le formulaire sur mobile) _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/pages/contact.astro`
- **Sujet** : Portrait de Charles devant la friche
- **Composition** : Photo réelle n° 2 de la séance (friche industrielle, chemise bleu roi, regard vers la droite), recadrée en buste : visage dans le tiers haut, cravate et bretelles visibles. Recadrage et redimensionnement seulement, aucune retouche ; la nuit, voile de lune et lueur de lanterne posés en CSS par le composant Portrait
- **Format** : 4:5, 800 × 1000
- **Fichier attendu** : `site/src/assets/visuels/contact/CON-PHO_800x1000.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Charles Lindecker en chemise bleu roi, devant une friche industrielle. »
- **Note** : Livré le 13 octobre 2026 : recadrage déterministe de design/assets/photos/sources/1536x2304_charles-2.webp (zone 300, 300, 1 080 × 1 350), jamais régénéré. Photo autorisée sur Contact par défaut de la question Q10.

### États : 404 et hors ligne

#### ERR-PHO · Portrait de Charles qui regarde ailleurs

- **Priorité** : socle · **Méthode** : PHO, photo réelle, traitements déterministes seulement
- **Produit par** : équipe États : 404 et hors ligne
- **Emplacement** : `/404` · 404, médaillon posé sur le coin bas droit de l’illustration ERR-01, le regard tourné vers elle _(contexte : ne pas le recopier dans un prompt)_
- **Posé dans** : `src/pages/404.astro`
- **Sujet** : Portrait de Charles qui regarde ailleurs
- **Composition** : Photo réelle n° 1 de la séance (sous-bois, chemise bleu roi, cravate rayée, regard vers la gauche), recadrée en buste, visage dans le tiers haut. Recadrage et redimensionnement seulement, aucune retouche ; la nuit, voile de lune et lueur de lanterne posés en CSS par le composant Portrait
- **Format** : 4:5, 800 × 1000
- **Fichier attendu** : `site/src/assets/visuels/etats/ERR-PHO_800x1000.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Charles Lindecker en chemise bleu roi, le regard tourné vers la gauche. »
- **Note** : Livré le 13 octobre 2026 : recadrage déterministe de design/assets/photos/sources/1536x2304_charles-1.webp (zone 60, 330, 1 440 × 1 800), jamais régénéré. Photo autorisée sur la 404 par défaut de la question Q10 ; la n° 3 sert au Parcours (PAR-PHO).
