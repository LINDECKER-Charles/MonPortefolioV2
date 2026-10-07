# Assets à générer — liste 2, les compléments (direction D « Mode d'emploi »)

> Deuxième liste, volontairement large : mieux vaut un asset de trop qu'un manque au moment
> d'écrire les pages. Elle complète la [liste 1](assets-a-generer.md) (le socle) et le
> [brief du logo](logo.md). Les **règles de production** sont celles de la liste 1, à relire avant
> de commencer.

## Méthode de travail

- **Par priorité** : toutes les « Haute » d'abord, puis « Moyenne », puis « Basse ». Après chaque
  palier, s'arrêter et montrer les planches à Charles avant de continuer.
- **Une planche par famille** : `design/assets/<famille>/planche.html` montre chaque asset de la
  famille côte à côte, à sa taille d'usage et en grand, sur papier `#F5F6F8` et sur nuit
  `#0E1424`. Servir en HTTP local pour la vérifier (les masques CSS ne marchent pas en `file://`).
- **Rien d'inventé** : une figure ne montre que des chiffres sourcés. Les assets marqués « données à
  fournir » attendent les chiffres de Charles ; ne pas les produire avec des valeurs d'exemple.

## Le style commun des illustrations

Le site est un manuel : ses illustrations sont des **planches de notice de montage**. Trait
unique, isométrie ou vue de face, aucun ombrage, aucun texte, des repères numérotés au besoin.

Elles peuvent être générées en image, puis livrées en **masque alpha monochrome** (règle 5 de la
liste 1). Suffixe à ajouter à chaque prompt d'illustration :

> *« Assembly-manual line illustration, single-weight black strokes on a pure white background,
> round caps, isometric or flat front view, no fill, no shading, no gradient, no text, no logos,
> generous margins. »*

Conversion du rendu (traits noirs sur blanc) en masque alpha, recette testée :

```sh
magick rendu.png -colorspace gray -level 3%,92% -negate -alpha copy \
  -fill black -colorize 100 1280x960_<nom>.png
```

Le site colore ensuite le masque en CSS (`mask-image` + `background-color: currentColor`) : bleu le
jour, bleu clair la nuit, sans variante de fichier. Master PNG 2× + WebP.

---

## ILL — Illustrations du parcours et du présent

Masques alpha, 1280×960 (4:3). Rangement : `design/assets/illustrations/`.

| ID | Fichier | Sujet | Où | Priorité |
|---|---|---|---|---|
| ILL-01 | `cartes-faites-main` | Le jeu de cartes inventé avec son cousin | L'origine 1.1, avec la vue éclatée D-03 | Haute |
| ILL-02 | `trois-decks` | Trois mains de cartes ; dans la troisième, une carte à l'envers | L'origine 1.2, Gwent | Haute |
| ILL-03 | `portes-fermees` | Quatre portes fermées, puis une voie ouverte | L'origine 1.3 | Haute |
| ILL-04 | `un-mois` | Le programme bouclé en un mois | L'origine 1.4 | Haute |
| ILL-05 | `cote-bureau` | La classe vue depuis le pupitre du formateur | L'origine 1.5 | Haute |
| ILL-06 | `architecte` | Un petit système logiciel en plan technique | Aujourd'hui | Haute |
| ILL-07 | `lanternes` | Une lanterne qui allume les suivantes | Aujourd'hui, le verbe « emmener » | Haute |
| ILL-08 | `manuel-de-nuit` | Le manuel ouvert, une lanterne allumée posée dessus, la lune à la fenêtre | Mode nuit, section Discutons | Moyenne |
| ILL-09 | `assistance` | Une enveloppe glissée entre les pages comme un marque-page | Discutons | Moyenne |
| ILL-10 | `version-1` | Un livre plus ancien sur une étagère, à côté du nouveau manuel ouvert | Historique des versions, lien vers l'archive de la V1 | Moyenne |

Prompts (à compléter par le suffixe commun) :

- **ILL-01** — *« A stack of hand-cut paper playing cards, a laminating pouch, scissors and a ruler
  on a table; one card is being slid into its clear plastic sleeve. »*
- **ILL-02** — *« Three fans of playing cards side by side; in the third fan, exactly one card stands
  upside down, against the others. »*
- **ILL-03** — *« Four closed doors in a row, each in a different style (a lecture-hall door, a
  laboratory door, a server-room door, a modern glass door); a path runs past them to an open gate on
  the right. »*
- **ILL-04** — *« A stopwatch resting on a stack of finished project folders, next to a rolled
  diploma tied with a ribbon. »*
- **ILL-05** — *« A classroom seen from behind the teacher's lectern: the lectern in the foreground,
  ten empty student desks facing it. »* (dix pupitres : « une dizaine d'apprenants »)
- **ILL-06** — *« Isometric technical drawing of a small software system: a browser window, an API
  server, a database cylinder, a stack of containers and a delivery pipeline drawn as a conveyor
  belt, all connected by dashed lines. »*
- **ILL-07** — *« A row of Victorian hand lanterns: the first one is lit and passes its flame to the
  second; the lanterns further down the row are still unlit. »*
- **ILL-08** — *« An open manual on a desk at night, a lit Victorian hand lantern standing on its
  pages, a crescent moon visible through a window behind. »*
- **ILL-09** — *« An open book with a sealed envelope slipped between its pages like a bookmark. »*
- **ILL-10** — *« An older closed hardcover book with a crescent moon embossed on its cover, standing
  on a shelf next to a newer manual lying open. »*

Acceptation : même épaisseur de trait apparente dans toute la série (vérifiée sur la planche),
masque sans halo gris, lisible à 50 % de sa taille, moins de 120 Ko en WebP. Aucune lanterne ne
reprend une forme tirée d'un jeu.

## COV — Couvertures des études de cas

Masques alpha, 1200×500. Rangement : `design/assets/etudes-de-cas/`. Aucune image du jeu PvZ
Fusion ni d'aucune licence.

| ID | Fichier | Sujet | Priorité |
|---|---|---|---|
| COV-01 | `pvz-fusion` | La traduction comme travail d'équipe | Haute |
| COV-02 | `omnicard` | Du jeu papier au moteur maison | Haute |
| COV-03 | `gup` | Une commande, tout mettre à jour | Haute |
| COV-04 | `portfolio-v1` | Si la 3e étude de cas est la V1 | Moyenne |
| COV-05 | `fusiondocs` | Si FusionDocs devient une étude de cas | Basse |

- **COV-01** — *« An open book whose two facing pages show columns of text lines linked by small
  arrows, as in a translation; check marks in the margin; a small group of people gathered around
  the book. »*
- **COV-02** — *« On the left a hand-cut paper playing card, on the right a browser window showing
  the same card; between them, gears and a small server connected by two-way arrows. »*
- **COV-03** — *« A single terminal window issuing one command; around it, many small package boxes
  each with a circular update arrow, and three generic computers. »*
- **COV-04** — *« An older book with a crescent moon on its cover, open to pages showing layout
  grids, a colour-contrast swatch and a keyboard key. »*
- **COV-05** — *« An open book with a wrench as its bookmark, pages showing numbered tutorial steps
  and a speech bubble. »*

Acceptation : comme la famille ILL, et lisibles en bandeau étroit (recadrage 1200×300 sans perte du
sujet).

## FIG — Figures de données

SVG codés à la main, versions bureau et mobile, `role="img"` avec une description textuelle, source
des chiffres citée en commentaire dans le SVG. Rangement : `design/assets/figures/`.

| ID | Figure | Données | Priorité |
|---|---|---|---|
| FIG-01 | Le plafond (Gwent) | Déjà dans la maquette D : à extraire en fichier autonome | Haute |
| FIG-02 | Du solo au collectif | Déjà dans la maquette D : à extraire | Haute |
| FIG-03 | Une dizaine d'apprenants, tous titrés : une rangée de silhouettes cochées, moitié DWWM, moitié CDA | Brief § 4 ; légende « schéma : une dizaine » tant que le nombre exact n'est pas confirmé | Moyenne |
| FIG-04 | gup : les 153 sources, par système et par type | À extraire du dépôt public de gup (définitions des sources) | Moyenne |
| FIG-05 | Omnicard : l'architecture (navigateur Angular, SignalR, API .NET, PostgreSQL, cache, prérendu serveur) | Brief § 4 ; schéma à faire valider par Charles | Moyenne |
| FIG-06 | PvZ Fusion : la traduction avant et après, version par version | **Données à fournir** | Moyenne |
| FIG-07 | ATIS : le temps de traitement administratif, avant et après (−30 %) | Brief § 4 | Basse |
| FIG-08 | Le parcours en frise, pour la page « Parcours complet » | Brief § 4 ; pas de date précise là où elle reste « à confirmer » | Basse |

Acceptation : lisible à 360 px de large, mêmes conventions graphiques que les figures 1 et 2 de la
maquette (axes, légendes « Fig. n », annotations en italique bleu).

## PIC — Pictogrammes

SVG à la main, `currentColor`. Rangement : `design/assets/pictos/`.

**PIC-01 — Interface** (Haute) : grille 24, trait de 1,6, même famille que D-04 et D-05. Menu,
fermer, lien externe, télécharger, e-mail, copier, copié (coche), haut de page, sommaire,
glossaire (un livre et un point d'interrogation), historique des versions (un livre et une
horloge), imprimer, langue (globe), mode jour (soleil), mode nuit (lune), agrandir une figure,
réduire une figure.

**PIC-02 — Projets** (Moyenne) : grille 48, trait de 1,75, un pictogramme par projet pour la page
« Tous les projets ». Aucun logo ni élément d'une licence de tiers.

| Projet | Motif |
|---|---|
| Omnicard | Une carte à jouer et un engrenage |
| PvZ Fusion, pôle francophone | Deux bulles de dialogue (traduction) |
| FusionDocs | Un livre et une clé à molette |
| gup | Une flèche circulaire autour d'une boîte |
| PVZ Fuzion Console Manager | Un terminal et une loupe |
| img-convertor | Une image et des flèches de redimensionnement |
| Blender Collection | Un cube en perspective et un dossier |
| League of Data Base | Un cylindre de données et un calendrier |
| GlossaireQuest | Une bulle avec un point d'interrogation et une coche |
| GitHealth | Une branche Git et une ligne de pouls |
| Life Pixel | Une grille de pixels et un bouton lecture |
| MaVeille | Un journal plié et un œil |
| Bloodborne Legendary Run | Trois étoiles reliées (une constellation) |
| Shreksophone | Un saxophone (celui de D-04) |
| Portfolio V1 | Un livre et un croissant de lune |
| Dev-Mates | Deux silhouettes côte à côte |
| LIS Web, Lucie Fiquet-Albin | Une fenêtre de navigateur, avec un globe ou un appareil photo |

**PIC-03 — Réseaux** (Haute) : LinkedIn, GitHub, npm. **Ne pas dessiner** : reprendre les logos
officiels en version monochrome, selon les règles de chaque marque.

Pas de logos de technologies (Angular, .NET…) : la stack s'affiche en étiquettes de texte.

Acceptation : planche à 1× et 2×, jour et nuit ; moins de 2 Ko par fichier.

## ANN — Annotations au stylo et surligneurs

La voix de l'auteur, comme sur un manuel annoté au stylo. SVG à la main, avec une légère
irrégularité de tracé mais une épaisseur constante (`vector-effect="non-scaling-stroke"` pour que
le trait ne se déforme pas quand on étire). Rangement : `design/assets/annotations/`.

| ID | Contenu | Priorité |
|---|---|---|
| ANN-01 | Six traces de surligneur colza, de longueurs différentes, bords irréguliers, remplissage plein, `preserveAspectRatio="none"` pour s'étirer derrière un chiffre | Haute |
| ANN-02 | Annotations au stylo bleu : trois cercles à main levée, trois soulignements, quatre flèches courbes (une par orientation), une accolade, un astérisque, une coche, une croix — chemins ouverts, animables par `stroke-dashoffset` | Moyenne |
| ANN-03 | Repères numérotés de 1 à 9 (cercles, chiffres tracés en chemins) pour les figures et la vue éclatée | Moyenne |
| ANN-04 | Lignes de rappel avec point d'ancrage, comme les annotations de la figure 0 | Basse |

## TEX — Textures et motifs

Rangement : `design/assets/textures/`.

| ID | Contenu | Méthode | Priorité |
|---|---|---|---|
| TEX-01 | Grain de papier très léger, raccordable, 512×512, opacité d'usage ≈ 3 % | Image ou bruit généré par script | Basse |
| TEX-02 | Grille de points et papier millimétré pour le fond des figures | Motif SVG codé | Moyenne |
| TEX-03 | Signet (ruban marque-page) qui marque la section courante du sommaire collant ; écho à la piste 4 du logo | SVG à la main | Moyenne |
| TEX-04 | Coin de page corné pour les fiches techniques | SVG à la main | Basse |
| TEX-05 | Grain de nuit, raccordable, très faible | Image ou bruit généré par script | Basse |

## POR — Portraits

Uniquement à partir des vraies photos (règle 2 de la liste 1). Rangement : `design/assets/photos/`.

| ID | Contenu | Méthode | Priorité |
|---|---|---|---|
| POR-01 | Bichromies jour et nuit des photos 1 à 3 | Recette de D-02 | Basse |
| POR-02 | Portrait au trait bleu d'après `charles-3`, pour la page 404 ou la section Discutons | Stylisation **déterministe** (filtre de contours de type XDoG, puis nettoyage), jamais régénérée | Moyenne |
| POR-03 | Avatars ronds 400×400 : photo 4 détourée sur disque papier, et sa bichromie | Script | Basse |

Acceptation : comme D-02 ; pour POR-02, la superposition avec la photo source montre les mêmes
contours.

## ETA — États et pages spéciales

| ID | Contenu | Méthode | Priorité |
|---|---|---|---|
| ETA-01 | Page 404 : un manuel ouvert dont une page a été arrachée, une lanterne allumée éclaire le vide. Masque alpha 1280×960 | Illustration (style commun) | Moyenne |
| ETA-02 | Chargement : la flamme de la lanterne du logo qui vacille, statique en mouvement réduit | SVG + CSS | Basse |
| ETA-03 | Impression : en-tête et pied de page de la version imprimable (logo, adresse du site) | SVG + CSS d'impression | Basse |
| ETA-04 | Hors ligne : la lanterne du logo, éteinte | SVG | Basse |

- **ETA-01** — *« An open manual with one page torn out, leaving a ragged stub in the binding; a lit
  Victorian hand lantern stands beside the book and lights the gap. »*

## PAR — Partage et réseaux

| ID | Contenu | Format | Priorité |
|---|---|---|---|
| PAR-01 | Images de partage des autres pages, sur le gabarit de D-07 : Parcours, Projets, chaque étude de cas, 404 | 1200×630 | Moyenne |
| PAR-02 | Bannière LinkedIn | 1584×396 | Basse, pour plus tard |
| PAR-03 | En-tête du profil GitHub | 1280×320 | Basse, pour plus tard |
| PAR-04 | Logo pour signature d'e-mail | PNG 2×, 240×60 | Basse, pour plus tard |

La communication sur les réseaux est hors du périmètre actuel : PAR-02 à PAR-04 sont préparés pour
plus tard.

## CV — Le CV aligné sur le récit

| ID | Contenu | Méthode | Priorité |
|---|---|---|---|
| CV-01 | Logo vectoriel pour l'impression, une couleur | Dérivé du logo (SVG + PDF) | Moyenne |
| CV-02 | Pictogrammes de contact (e-mail, lieu, site, LinkedIn, GitHub) en tailles d'impression | Dérivés de PIC-01 et PIC-03 | Moyenne |
| CV-03 | QR code vers charles-lindecker.com, bleu sur blanc, zone de silence respectée | Script (bibliothèque de QR code) | Moyenne |
| CV-04 | La figure du plafond simplifiée, en une couleur, 60 mm de large | Dérivée de FIG-01 | Basse |

Acceptation de CV-03 : il se lit avec un téléphone, imprimé à 20 mm.

## EGG — Clins d'œil

| ID | Contenu | Priorité |
|---|---|---|
| EGG-01 | Le logo en art ASCII (40 colonnes au plus) pour la console du navigateur ; le texte qui l'accompagne s'écrira avec Charles | Basse |
| EGG-02 | L'animation d'allumage de la lanterne au passage en mode nuit : voir [logo.md](logo.md) | — |
