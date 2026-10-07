# Assets à générer — liste 1, le socle (direction D « Mode d'emploi »)

> Brief de production des visuels de la direction retenue le 2026-10-07. Référence visuelle : la
> [maquette D](../design/propositions/d-mode-d-emploi.html), qui marque chaque visuel provisoire
> d'une étiquette « À générer : <ID> ». Les prompts d'image sont en anglais.

## Les trois briefs

| Brief | Contenu | Quand |
|---|---|---|
| [logo.md](logo.md) | La refonte du logo (un livre, une lanterne dedans), favicons et charte | En premier : six explorations, puis pause pour le choix de Charles |
| **Liste 1** (ce fichier) | Le socle : ce dont l'accueil a besoin pour exister | En parallèle des explorations du logo |
| [assets-complementaires.md](assets-complementaires.md) | Liste 2 : tout le reste, du parcours illustré au CV | Ensuite, par priorité |

Les règles ci-dessous valent pour les trois briefs.

## Règles

1. **Aucune propriété intellectuelle de tiers.** Pas de symbole, personnage, logo ni capture d'un
   jeu ou d'une marque. Ne jamais nommer un jeu, un studio ou une marque dans un prompt. Les seuls
   logos de marque admis sont les logos officiels de LinkedIn, GitHub et npm, repris tels quels.
2. **Jamais de fausse photo de Charles.** Ses seules images sont ses quatre vraies photos
   (`design/assets/photos/sources/`, 1536×2304). Détourage, bichromie et stylisation déterministe
   (filtres) sont permis ; le visage, les lunettes, les vêtements et la pose restent strictement
   identiques. Jamais de régénération de la photo par un modèle d'image.
3. **Pas de texte dans les visuels.** Les textes restent en HTML. Exceptions : le nom dans les
   déclinaisons du logo, et les images de partage, composées en vraie typographie (HTML rendu en
   PNG).
4. **Les dessins simples sont des SVG écrits à la main** (pictogrammes, symboles, annotations) :
   géométrie exacte, épaisseur de trait constante, `stroke="currentColor"`, pas de remplissage sauf
   mention, pas de `<text>`, pas de dégradé ni d'ombre, un `<title>` neutre en français. Avec
   `currentColor`, ils suivent le mode nuit sans variante. Les prompts « référence » servent à
   générer une image d'inspiration avant de dessiner : ne jamais vectoriser automatiquement une
   image générée (le trait devient irrégulier).
5. **Les illustrations riches peuvent être générées en image**, puis livrées en **masque alpha
   monochrome** : traits noirs sur fond transparent, PNG master 2× + WebP. Le site les colore en
   CSS (`mask-image` + `background-color: currentColor`), si bien qu'elles suivent aussi le mode
   nuit. Les masques CSS ne fonctionnent pas en `file://` : pour vérifier, servir le dossier en
   HTTP local.
6. **Formats raster** : WebP qualité ≈ 82 + master PNG. Nommage hérité de la V1 :
   `<largeur>x<hauteur>_<nom>.webp`.
7. **Palette.** Jour : bleu `#1F4FD1`, encre `#14161B`, papier `#F5F6F8`, colza `#F5D33F`.
   Nuit : fond `#0E1424`, bleu `#8FB0FF`, texte `#E6EAF2`.
8. **Rangement** : tout dans `design/assets/`. Ne rien modifier d'autre dans le dépôt, hors
   intégration dans la maquette D. Les fichiers temporaires vont hors du dépôt.

## Livrables de la liste 1

| Ordre | ID | Fichiers dans `design/assets/` | Méthode | Priorité |
|---|---|---|---|---|
| 1 | D-04 | `pictos/cartes.svg`, `plume.svg`, `pupitre.svg`, `groupe.svg`, `saxophone.svg`, `cadenas.svg`, `lune.svg` | SVG à la main | Haute |
| 2 | D-05 | `pictos/lune-mode-nuit.svg` | SVG à la main | Haute |
| 3 | D-03 | `illustrations/pc-vue-eclatee.svg` | SVG à la main | Haute |
| 4 | D-02 | `photos/1536x2304_charles-4-detoure.png` et ses déclinaisons, bichromies jour et nuit | Segmentation + ImageMagick | Haute |
| 5 | D-07 | `partage/og-mode-d-emploi.png` + sa source `partage/og-mode-d-emploi.html` | HTML rendu en PNG, après le logo | Moyenne |
| 6 | COM-01 | `photos/1536x2304_charles-{1,2,3}-detoure.png` et déclinaisons | Segmentation | Basse |

Le logo, les favicons et les icônes d'application sont dans [logo.md](logo.md). Rien à produire
pour les figures 1 et 2 : elles sont déjà codées en SVG dans la maquette.

## Détail par asset

### D-04 — Pictogrammes, style notice de montage

- **Dessin** : grille `viewBox="0 0 48 48"`, trait de 1,75, extrémités et jointures arrondies,
  aucun remplissage, même taille optique pour les sept. Sujets : deux cartes à jouer qui se
  chevauchent (un losange sur celle de devant), une plume, un pupitre, un groupe de trois
  personnes, un saxophone, un cadenas, un croissant de lune.
- **Référence** (optionnelle) : *« Consistent set of seven line icons on a 48×48 grid, 1.75 px
  stroke, round caps and joins, single colour, no fill, assembly-manual style: two overlapping
  playing cards with a diamond, a quill, a lectern, a group of three people, a saxophone, a padlock,
  a crescent moon. Same optical size, white background. »*
- **Acceptation** : planche de contrôle des sept à 24, 48 et 96 px, côte à côte, en jour et en nuit ;
  chacun pèse moins de 2 Ko.

### D-05 — Lune du mode nuit

- **Dessin** : le croissant de D-04 redessiné pour `viewBox="0 0 24 24"`, trait de 1,6, avec une
  petite étincelle à quatre branches. C'est l'icône du bouton qui bascule en mode nuit.
- **Acceptation** : nette à 20 et 24 px, même famille visuelle que D-04.
- Si Charles valide l'option du brief logo (le bouton du mode nuit devient la lanterne), D-05 tombe.

### D-03 — Vue éclatée d'un vieux PC tour

- **Dessin** : `viewBox="0 0 480 400"`, isométrique, trait de 2 (même épaisseur apparente que les
  pictogrammes à leur taille d'usage). Une tour des années 2000 : panneau latéral écarté, carte mère
  avec quelques puces, disque dur et vis décalés le long de pointillés de mouvement. Des cercles de
  repère numérotés de 1 à 6, chiffres tracés en chemins (pas de `<text>`). Elle illustre l'étape
  1.1 du parcours : les PC démontés avec son père.
- **Référence** (optionnelle) : *« Exploded-view assembly-instruction line drawing of an old 2000s
  PC tower: side panel pulled away, motherboard with chips, hard drive and screws offset along dashed
  motion lines, small numbered callout circles. Single-weight royal blue outlines, white background,
  isometric, flat, no shading, no text. »*
- **Acceptation** : lisible à 240 px de large, moins de 15 Ko. Si le SVG à la main manque de
  finesse, passer par la règle 5 (image générée livrée en masque alpha).

### D-02 — Portrait détouré en bichromie bleue (photo 4, le champ de colza)

1. **Détourage** de `photos/sources/1536x2304_charles-4.webp` avec un outil de segmentation local
   (par exemple `rembg` et un modèle portrait) : cheveux, lunettes, bretelles et montre gardés, bords
   doux. Sortie : `photos/1536x2304_charles-4-detoure.png` (master transparent), puis
   `1200x1800_charles-4-detoure.webp` et `768x1152_charles-4-detoure.webp`.
2. **Bichromie**, transparence conservée (recette testée) :

   ```sh
   magick photos/1536x2304_charles-4-detoure.png \
     \( +clone -alpha extract \) \
     \( -clone 0 -alpha off -colorspace gray -level 6%,97% \
        \( -size 1x256 gradient:'#1F4FD1-#FFFFFF' \) -clut \) \
     -delete 0 +swap -alpha off -compose CopyOpacity -composite \
     photos/1536x2304_charles-4-bichromie-jour.png
   ```

   Variante nuit avec le dégradé `'#16224A-#C9D8FF'` → `…-bichromie-nuit.png`. Décliner chacune
   en WebP 1200×1800 et 768×1152.
- **Acceptation** : superposée à l'original, la silhouette ne bouge pas d'un pixel ; aucune
  auréole claire posée sur `#F5F6F8`, ni sombre posée sur `#0E1424`.

### D-07 — Image de partage de l'accueil

- **Composition** (1200×630) : une couverture de notice technique. Fond papier `#F5F6F8`, le
  symbole du logo ([logo.md](logo.md)) en bleu, lanterne allumée, le titre « Charles Lindecker, mode
  d'emploi » en Atkinson Hyperlegible Next 800, l'accroche « Je maîtrise d'abord les règles du jeu.
  Ensuite, je les réinvente. » en 400, un trait de surligneur colza sous « mode d'emploi », de fines
  lignes de rappel bleues. Pas de photo.
- **Méthode** : page `partage/og-mode-d-emploi.html` rendue en PNG par un navigateur sans
  interface, à 1200×630. Elle sert de gabarit aux images de partage des autres pages (liste 2,
  PAR-01).
- **Acceptation** : lisible en vignette de 600×315, moins de 300 Ko.

### COM-01 — Les autres portraits détourés

Même procédure que l'étape 1 de D-02 pour `charles-1`, `charles-2` et `charles-3`, sans bichromie
(les bichromies de ces photos sont dans la liste 2, POR-02).

## Intégration dans la maquette D

Dans `design/propositions/d-mode-d-emploi.html` :

- remplacer les dessins provisoires par les nouveaux fichiers (`../assets/…`) : la vue éclatée de
  l'étape 1.1, les pictogrammes de « En dehors du code » et du design system, la lune de l'en-tête
  et du design system, la bichromie du design system ;
- retirer l'étiquette « À générer » de chaque asset livré, et elle seule ;
- capturer la page à 1440 et 390 px de large, en jour puis en mode nuit (`?nuit`), servie en HTTP
  local, et vérifier qu'aucun visuel ne déborde ni ne disparaît sur fond sombre.

## À faire par Charles, hors génération

| ID | Quoi | Pourquoi |
|---|---|---|
| COM-04 | Captures propres des projets : Omnicard (le moteur en partie, sans les cartes tirées d'autres licences), FusionDocs, PvZ Fusion (avant/après de la traduction, tableau de contributions), gup (enregistrement de terminal) | Les captures actuelles viennent de la V1 et montrent des illustrations de tiers |
| COM-05 | Photos réelles en situation : formation, présentation, équipe | Elles ne se génèrent pas : ce serait un faux |
| — | Trancher les dates du rôle de lead sur PvZ Fusion | Le tableau de contributions indique le 05/12/2025, l'entretien parle d'environ six mois après l'arrivée |
| — | Fournir les données des figures de la liste 2 marquées « données à fournir » | Une figure ne montre que des chiffres sourcés |
