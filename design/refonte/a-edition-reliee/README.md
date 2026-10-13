# Direction A — « Édition reliée »

Maquette de la refonte, direction A du cahier des charges (`00-synthese.md`, § 8.2), sur le contenu
réel : accueil, vitrine des projets, page PvZ Fusion et page Compétences.

## Le concept en trois phrases

Le portfolio se lit comme un manuel relié, pas comme une notice de montage : une page de titre,
des chapitres numérotés, une colonne de lecture en Newsreader et une marge active où vivent les
gravures, les figures et les preuves. Le livre a une reliure : la colonne de gauche porte le sommaire
et un **signet**, un ruban bleu roi au bout duquel une petite lanterne s’allume au chapitre lu.
La nuit est une **veillée** : la page se tourne depuis la reliure, l’encre passe en ivoire, les liens
passent en bleu clair, la lumière de la lanterne (ambre) porte le bouton principal et éclaire
doucement la colonne de lecture.

## Ouvrir la maquette

Ouvrir `accueil.html` dans un navigateur récent (Chromium conseillé pour la transition de thème).
Les quatre pages se répondent par l’en-tête, le pied, les cartes et les liens « projet suivant ».
`?theme=jour` ou `?theme=nuit` force le thème ; sinon `prefers-color-scheme`, puis le choix
enregistré (`localStorage['cl-theme']`). Les liens vers des pages hors maquette (Contact, Parcours,
Formation, autres projets) affichent une courte notification au lieu d’une page vide.

| Fichier | Rôle |
|---|---|
| `accueil.html` | Couverture, bandeau des trois preuves, chapitres 01 L’origine, 02 Aujourd’hui, 03 La suite |
| `projets.html` | Vitrine ordonnée (PvZ, League Of Data Base, Omnicard, Bloodborne Legendary Run, gup), rangée « Aussi », bloc « Contribuer » |
| `pvz-fusion.html` | Page de projet et **squelette commun E5** (numéroté de 1 à 5 dans le signet seulement) |
| `competences.html` | Index typographique pensé d’abord pour le mobile |
| `style.css` | Jetons jour, nuit et actes ; échelle ; mise en page du livre ; composants |
| `theme.js` | Thème, page tournée, signet, sommaire mobile, figure du plafond, onglets, glossaire, copie |
| `captures/` | Captures finales WebP : `<page>-{bureau,mobile}-{jour,nuit}`, `-jour-pli`, plus `accueil-bascule-transition` (la page tournée en cours) et `accueil-signet-lecture` (le signet sur « Gwent, la méthode ») |

Polices chargées depuis Google Fonts pour la maquette (le site les auto-hébergera) : Newsreader
(romain variable avec axe optique, italique) et Instrument Sans. Trois fichiers par page.

## Jetons

### Couleurs et contrastes calculés (WCAG 2.x, luminance relative)

| Contexte | Paire | Valeurs | Contraste |
|---|---|---|---|
| Jour | encre / papier | `#1a1712` sur `#f5f1e8` | 15,85:1 |
| Jour | encre / surface | `#1a1712` sur `#fffdf8` | 17,58:1 |
| Jour | encre / acte teinté | `#1a1712` sur `#e3d8c2` | 12,65:1 |
| Jour | gris / papier | `#5e574d` sur `#f5f1e8` | 6,32:1 |
| Jour | gris / surface | `#5e574d` sur `#fffdf8` | 7,01:1 |
| Jour | gris / acte teinté | `#5e574d` sur `#e3d8c2` | 5,05:1 |
| Jour | bleu roi / papier | `#1f4fd1` sur `#f5f1e8` | 6,01:1 |
| Jour | bleu roi / acte teinté | `#1f4fd1` sur `#e3d8c2` | 4,80:1 |
| Jour | blanc / bleu roi (bouton) | `#ffffff` sur `#1f4fd1` | 6,78:1 |
| Jour | encre / colza (surligneur) | `#1a1712` sur `#f2cf3a` | 11,71:1 |
| Jour | filet porteur / papier | `#918571` sur `#f5f1e8` | 3,21:1 |
| Jour | filet porteur / surface | `#918571` sur `#fffdf8` | 3,56:1 |
| Jour | filet de l’acte teinté | `#7d7260` sur `#e3d8c2` | 3,34:1 |
| Jour, hors-texte sombre | ivoire / acte sombre | `#f5f1e8` sur `#1a1712` | 15,85:1 |
| Jour, hors-texte sombre | gris / acte sombre | `#b3a994` sur `#1a1712` | 7,67:1 |
| Jour, hors-texte sombre | lien et focus / acte sombre | `#a9bcff` sur `#1a1712` | 9,64:1 |
| Jour, hors-texte sombre | filet / acte sombre | `#7d7262` sur `#1a1712` | 3,79:1 |
| Nuit | encre / papier | `#ece4d4` sur `#14110d` | 14,89:1 |
| Nuit | encre / surface | `#ece4d4` sur `#1d1913` | 13,84:1 |
| Nuit | encre / acte teinté | `#ece4d4` sur `#2a241b` | 12,16:1 |
| Nuit | gris / papier | `#a39886` sur `#14110d` | 6,63:1 |
| Nuit | gris / surface | `#a39886` sur `#1d1913` | 6,16:1 |
| Nuit | gris / acte teinté | `#a39886` sur `#2a241b` | 5,41:1 |
| Nuit | lien bleu clair / papier | `#8fa8ff` sur `#14110d` | 8,26:1 |
| Nuit | lien bleu clair / acte teinté | `#8fa8ff` sur `#2a241b` | 6,74:1 |
| Nuit | ambre de lanterne (bouton) / papier | `#e3a548` sur `#14110d` | 8,73:1 |
| Nuit | ambre / acte teinté | `#e3a548` sur `#2a241b` | 7,13:1 |
| Nuit | fond / ambre (bouton) | `#14110d` sur `#e3a548` | 8,73:1 |
| Nuit | focus / papier | `#8fa8ff` sur `#14110d` | 8,26:1 |
| Nuit | fond / surligneur | `#14110d` sur `#e9c46a` | 11,27:1 |
| Nuit | filet porteur / papier | `#7a6e5c` sur `#14110d` | 3,78:1 |
| Nuit | filet porteur / surface | `#7a6e5c` sur `#1d1913` | 3,51:1 |
| Nuit | filet de l’acte teinté | `#7e725f` sur `#2a241b` | 3,26:1 |
| Nuit | encre / acte sombre | `#ece4d4` sur `#0b0907` | 15,73:1 |
| Surfaces | surface / papier, jour et nuit | — | 1,11:1 et 1,08:1, toujours bordées d’un filet ≥ 3:1 |
| Surfaces | acte teinté / papier, jour et nuit | — | 1,25:1 et 1,22:1 |

Le bleu roi `#1f4fd1` (chemise des photos, couverture du livre du logo) reste l’identité ; la nuit,
les liens, le focus et le signet passent en bleu clair `#8fa8ff`, le bouton principal (`--action`)
prend l’ambre de la flamme et le surligneur devient un trait épais sous le chiffre : liens, action
et surlignage ne se confondent plus. Les actes redéfinissent les jetons localement
(`.acte--sombre`, `.acte--teinte`) : tout composant posé dedans reste lisible sans règle spéciale.
Le décor (`--filet-doux`, hachures, halo de veillée) ne porte jamais d’information.

### Typographies

- **Newsreader**, romain variable avec axe optique : titres en graisse 500 (opsz 72 pour l’affiche),
  récit en 17-19 px, interlignage 1,55, colonne de 62 caractères. Son italique est la voix de
  Charles : citations seulement, quatre au plus par page.
- **Instrument Sans** : interface, légendes, fiches, données ; chiffres tabulaires dans les tableaux
  et les axes. Ni Newsreader ni Instrument Sans ne barrent le zéro (B3).
- Les flèches →, ↓ et ↗ manquent aux deux polices : elles sont dessinées (masques SVG, GLO-06),
  jamais tirées d’une police de secours.

### Échelle, crénage, rayons, élévations, mouvement

| Jeton | Valeur | Usage |
|---|---|---|
| `--t-1` | 13 px | légendes, marques « à confirmer », dates de section |
| `--t-2` | 15 px | interface, navigation, fiches |
| `--t-3` | 17 px | texte d’interface |
| `--t-4` | 17 → 19 px | récit en Newsreader |
| `--t-5` | 20 → 23 px | chapô, titres de section, citations |
| `--t-6` | 28 → 44 px | titres de partie |
| `--t-7` | 38 → 76 px | accroche, titres de page, repères chiffrés |
| `--t-8` | 64 → 136 px | numéros de chapitre |
| Crénage | `0`, `-0,012em`, `-0,028em`, `0,06em` | courant, titres, affiche, réserve |
| Rayons | `0`, `3px`, `999px` | planches et actes ; commandes ; pastilles et médaillons |
| Élévations | aucune, `--elev-1`, `--elev-2` | à plat ; planche posée ; menus, bulles, notification |
| Mouvement | une courbe `cubic-bezier(.2,.7,.15,1)`, 200 ms et 400 ms | interface ; scènes et page tournée |

Grille : 12 colonnes à partir de 1 120 px ; reliure sur 2 colonnes, colonne de lecture sur 5, marge
active sur 4 (≈ 410 px ; le cahier en proposait 3 : 4 garantissent les 320 px minimum des
illustrations, B8), élargie à 5 pour la figure du plafond.

## Composants

En-tête (logo réel en deux calques, navigation, bascule-lanterne ; sur mobile : emblème, Sommaire,
Contact, Menu) · fil du signet (progression de 2 px sur mobile) · signet de reliure (sommaire collant,
ruban, lanterne, Discutons) · couverture en couleur au bord franc, photo secondaire en bichromie ·
bandeau de preuves en tableau à filets · ouverture de chapitre (numéro et titre) · section de récit
(date, titre, texte, marge active) · acte sombre et acte teinté (bord à bord sur mobile, planche
hors-texte bordée d’un filet dans la colonne du contenu sur ordinateur) ·
cul-de-lampe (la lanterne en fin de chapitre) · planche, emplacement d’illustration avec repères de
coupe, cadres navigateur, téléphone et terminal, planche de capture (passe-partout clair et filet),
médaillon de détail agrandi · citation (voix) ·
terme de glossaire en bulle native · figures codées (plafond, barres, frise, courbe, jalons) · carte
de projet, entrée de vitrine (action « Voir le projet → », sorties en gris), fiche en tableau à
filets, pastille de statut · repères chiffrés soulignés au colza · décisions contrainte → choix →
effet · errata (avant / après) · boucle à onglets et roue · sortie (projet suivant) · note de
sources · tuiles, familles, étiquettes, repliable, capacités, chaîne de livraison · colophon
(pied de page) · notification.

## La signature

1. **Le signet.** Sur ordinateur, la reliure porte un ruban bleu roi qui descend jusqu’à la section
   lue ; au bout, la lanterne s’allume. C’est aussi la navigation de page unique (E4). Sur mobile,
   le ruban devient le fil de progression de 2 px sous l’en-tête et le bouton « Sommaire » ouvre le
   même sommaire, ruban compris.
2. **La page tournée.** La bascule est la lanterne du logo. Vers la nuit, la flamme grandit et
   s’entoure d’un halo, et la nouvelle page arrive depuis la reliure par un fondu à bord doux
   (View Transitions, 400 ms) ; en mouvement réduit, le thème change sans transition.
3. **La veillée.** La nuit, un halo ambré éclaire la colonne de lecture, le logo passe en ivoire et
   sa flamme garde son or, les photos passent en bichromie encre et ivoire (sans ambre).

## Règles du § 3

### Beauté

- **B1** Un seul fichier de jetons : 8 tailles, 4 crénages, 3 rayons, 3 élévations ; aucune couleur
  hors de la section des jetons (les actes redéfinissent les jetons dans cette section ; les seuls
  `#000` restants sont des masques alpha).
- **B2** Deux familles, trois fichiers ; récit très lisible en 19 px.
- **B3** Aucun zéro barré ; chiffres tabulaires dans les tableaux et les axes.
- **B4** Un titre dominant par écran ; le nom n’est qu’un sur-titre dans le `h1` de l’accueil.
- **B5** Le bleu roi est réservé aux liens, commandes, focus et au signet (élément d’identité) ; les
  numéros, sur-titres et dessins sont en encre ou en gris. La photo de couverture reste en couleur :
  sa chemise bleu roi est l’autre élément d’identité de l’écran.
- **B6** Trois paliers (papier, surface, acte teinté) plus l’acte sombre ; surfaces bordées d’un filet
  ≥ 3:1 ; un acte à chaque changement de partie (02 sombre, 03 teinté ; IA teinté sur Compétences).
- **B7** Un cadre par type de capture (navigateur, téléphone, terminal), captures entières ; un
  médaillon agrandit le détail illisible (3.6.14 sur League Of Data Base, la source en échec de gup).
- **B8** Une seule famille d’illustrations commandée : gravure au trait et hachures, encre et un
  aplat ; les emplacements montrent cette famille (hachures, repères de coupe) et font au moins
  320 px de large sur ordinateur ; les vignettes de série (gestes, compétences humaines, stations
  de la boucle) font au moins 240 px ; la rangée « Aussi » n’a plus de vignettes.
- **B9** Une référence de jeu par page hors projets de jeu (Gwent sur l’accueil) ; aucun lexique de
  jeu dans les libellés.

### Ergonomie

- **E1** Au pli, à 1440 × 900 et 390 × 844 : titre, identité ou besoin, preuve et action
  (`data-pli` posés). Sur la page PvZ, les repères chiffrés montent dans la colonne de titre.
- **E2** « Discutons » mène partout à la page Contact ; flèches dessinées → page interne, ↓ ancre,
  ↗ sortie du site.
- **E3** Longueurs mesurées (écrans de 900 / 844 px), avec JavaScript : accueil 6,49 / 10,91 ;
  projets 2,59 / 4,62 ; PvZ 5,50 / 9,30 ; compétences 3,95 / 6,79. Sans JavaScript : accueil
  6,49 / 10,97 ; projets 2,59 / 4,62 ; PvZ 5,90 / 9,85 ; compétences 3,95 / 6,97.
- **E4** Une seule navigation de page (`nav[aria-label="Dans cette page"]`), le signet ; sommaire
  d’ancres en tête sans JavaScript ; un seul élément collant sur mobile (l’en-tête).
- **E5** Squelette sur PvZ, numéroté dans le signet seulement (aucune pastille ni intitulé de
  gabarit dans la page) : 1 Fiche (nom canonique, étiquette de preuve, chapô qui dit le besoin et ce
  que j’ai fait, fiche rôle, période, équipe, statut, liens, visuel), 2 Repères, 3 Le projet (corps
  libre), 4 Comment je l’ai construit (acte teinté, atteignable depuis l’en-tête), 5 Ce que j’en
  retiens (liens, projet suivant, Discutons).
- **E6** Noms canoniques : « PvZ Fusion, pôle francophone », « League Of Data Base » (marqué à
  confirmer), « Omnicard », « Bloodborne Legendary Run », « gup ».
- **E7** Colonne de texte pleine largeur sur mobile ; vitrine en liste verticale (première carte
  en grand) ; galeries en défilement accroché avec compteur (projets de l’accueil, décisions) ;
  onglets défilants avec ombre de débordement ; cibles de 44 px.
- **E8** Aucune entrée vers un blog, un CV ou une archive qui n’existent pas.

### Contenu

- **C1** Chaque chiffre vient du cahier, de la matière première ou de l’audit PvZ ; les relevés 🔍
  portent « à consigner » ; un surlignage par preuve.
- **C2** Citations entre guillemets mot pour mot du brief et du questionnaire ; celle d’Omnicard
  porte « à confirmer ».
- **C3** Liens sortants : dépôts publics seulement (aucun lien vers le dépôt de Bloodborne, FusionDocs
  ou un dépôt privé) ; `public-Omnicard` libellé « Règles et cartes (GitHub) ».
- **C4** Poste actuel en termes génériques ; aucune formulation de recherche.
- **C5** Pages de consultation : une phrase sous le titre, puis intitulés, faits, logos et liens.
- **C6** Première personne, problème avant usages, décisions et résultat en fin de page.
- **C7** Chaque histoire une fois : les chiffres de PvZ ne se répètent pas entre repères, texte et
  décisions sauf l’effet des 35 PR.
- **C8** Aucune consigne d’interface affichée.
- **C9** Statuts honnêtes (« Hors ligne, en refonte », « Android en test ») ; aucun téléchargement
  npm ni métrique d’adoption affichés.

## Emplacements de visuels utilisés

Chaque emplacement affiche son identifiant, son sujet et, sur ordinateur, sa composition.

| Page | Emplacements à générer ou à capturer | Figures codées dessinées | Captures et photos réelles |
|---|---|---|---|
| Accueil | ACC-03, ACC-04, ACC-08, ACC-09, ACC-11, ACC-15 (bande de quatre vignettes reprenant PVZ-05, PVZ-07, PVZ-08) | ACC-06 plafond Gwent (tracé à l’arrivée, rejouable au clic sur le dessin) ; ACC-02 / GLO-04 pictogrammes des trois verbes ; GLO-03 lanterne | ACC-01 photo colza en couleur (bichromie encre et ivoire la nuit) ; `charles-2` en bichromie encre et bleu roi ; ACC-13 captures `histoire-version`, `parcours-desktop`, `gup-selection` au même ratio 16:10, avec médaillons |
| Projets | PRJ-01, PRJ-02, PRJ-03 | — | PRJ-04 `atlas` dans le cadre téléphone ; PRJ-05 `gup-selection` dans le cadre terminal, tous deux en planche ; logos de stack |
| PvZ Fusion | PVZ-01, PVZ-02, PVZ-04 à PVZ-08 ; CAP-PVZ-1, CAP-PVZ-2, CAP-PVZ-4, CAP-PVZ-6, CAP-PVZ-7 (journal d’un contributeur) | PVZ-03 roue de la semaine ; PVZ-F1 courbe du rattrapage (tableau des valeurs joint) ; PVZ-F2 la 4.0 en six jours ; PVZ-F3 et PVZ-F4 frise des rôles et des arrivées ; barres de l’état au 16 octobre 2025 | — |
| Compétences | CMP-02 à CMP-08 | CMP-F1 chaîne de livraison | 77 technologies : logos réels de `site/src/assets/stacks/` en monochrome, pictogrammes métier pour SQL, PHPUnit (le PNG de 32 px est illisible), Axum, SQLx, Stockage S3 compatible, Dompdf, OpenTUI, Make, axe-core, Claude, Codex, Kokoro, Piper |

Les photos ne sont que filtrées (bichromie déterministe par filtre SVG) : jamais régénérées.
Les emplacements PRJ-06, PRJ-07, PRJ-08 et PRJ-10 (« Aussi ») ne sont plus posés dans la maquette.

## Ce qui reste à trancher

- Hiérarchie des technologies en trois niveaux (proposition depuis la stack du CV), phrase de
  conclusion de l’accueil, date du titre de lead, part personnelle des traductions, place du Console
  Manager, attribution de la citation Omnicard, nom officiel de League Of Data Base, « seul » sur
  Bloodborne : tous marqués « à confirmer » dans les pages.
- Liens officiels SQL (norme ISO payante) et « Stockage S3 compatible » (documentation AWS) repris
  tels quels de `config/competences.ts`, signalés à corriger par le cahier.
- La bichromie des photos est faite ici par un filtre SVG en ligne ; le site final servira des
  fichiers pré-calculés (pas d’inline sous la CSP).

## Corrections après jugement

Trois juges (recruteur technique, direction artistique, ergonomie et récit) ont évalué la première
version. Corrections appliquées le 13 octobre 2026, vérifiées en deux tours de captures puis par une
mesure Playwright avec et sans JavaScript (hauteurs, pli, débordement, textes sous 12,5 px).

### Accueil

- **Couverture** : photo en couleur, bord franc et filet d’un pixel (plus de sépia, de marie-louise
  ni d’ombre portée) ; la chemise bleu roi et le colza réapparaissent. Format 2:3 sur ordinateur.
- **Ligne d’identité** en `--t-5`, encre, graisse 500 : deux lignes sur ordinateur.
- **Trois verbes** du bandeau en Newsreader `--t-5`, en encre, au-dessus de leur phrase ; sur mobile,
  verbe et phrase sur la même ligne (tête courante), pictos de 24 px ; la dernière syllabe et sa
  flèche sont insécables (« Fusion → » ne se sépare plus).
- **Mobile** : nom (logo-nom) dans l’en-tête, menu en icône seule quand « Sommaire » est présent ;
  ordre titre, identité, preuves, actions, puis chapeau et photo : les trois preuves et « Discutons »
  tiennent dans 844 px.
- **Gwent, la méthode** : « Au sommet… » et « Depuis, à chaque mise à jour… » reviennent dans la
  colonne de lecture. La figure du plafond se pose dans la marge active élargie (5 colonnes), le
  tracé occupe toute la largeur de sa planche, la légende est dessous et ne contient plus « Un clic
  rejoue le tracé » (C8) ; le dessin reste rejouable au clic.
- **Aujourd’hui** : les trois captures ont le même ratio 16:10 et un cadre de même hauteur (gup passe
  dans le cadre terminal) ; les titres sont alignés.
- **À plusieurs** : 20, 10 et 35 deviennent des repères chiffrés soulignés au colza dans la marge
  (retirés du paragraphe, C7) ; les quatre gestes forment une bande de quatre vignettes de 248 px sur
  la largeur du chapitre ; la citation de clôture rejoint la colonne de lecture.
- **La suite** : photo secondaire en bichromie encre et bleu roi.

### Tout le système

- **Actes** : sur ordinateur, planches hors-texte contenues dans la colonne du contenu, même marge de
  chaque côté et filet sur tout le pourtour (plus de bord gauche cassé à x = 269) ; bord à bord sur
  mobile.
- **Numéros de chapitre** entiers sous leur filet (24 px), en encre et graisse fine.
- **Nuit** : liens, focus et signet en bleu clair `#8fa8ff`, bouton principal en ambre, surligneur
  en trait épais sous le chiffre ; halo de veillée renforcé et visible ; photos en bichromie encre et
  ivoire ; l’acte sombre garde son filet et reste perceptible.
- **Bascule** : attribut renommé `data-theme-bascule` (contrat § 7.1-8) ; masquée sans JavaScript.
- **Sans JavaScript** : sommaire d’ancres compact en tête (une ligne de chapitres) ; sur PvZ, les
  cinq temps de la boucle restent lisibles mais seules les traces du premier s’affichent.
- **Pied de page** : le bouton « Copier » s’aligne sous l’adresse, à gauche.

### Projets

- Carte vedette : action principale « Lire l’étude de cas → » ; « Projet multilingue (GitHub) ↗ »
  passe en lien secondaire gris. Chaque carte a son lien interne « Voir le projet → ».
- Mobile : le carrousel « 1 / 5 » devient une liste verticale ; première carte en grand, les suivantes
  avec vignette, étiquette, nom, besoin, statut et chiffre sur une ligne, lien (4,6 écrans).
- Captures sombres (Bloodborne, gup) posées en planche sur papier, passe-partout clair et filet.
- « Aussi » devient un index typographique sans vignettes ; pieds de carte alignés en bas de rangée.

### PvZ Fusion

- Plus de pastilles « 1 Fiche », « 2 Repères »… ni d’intitulés « Le besoin » / « Ce que j’ai fait » :
  un chapô unique ; la numérotation vit dans le signet. 24 px sous le fil d’Ariane.
- « Comment je l’ai construit : trois décisions » dans un acte teinté (B6) ; « Ce que j’en retiens »
  devient un vrai titre. Décisions en une seule voix (intitulés en Instrument Sans, contenu en
  Newsreader), cartes alignées en haut.
- Boucle : les cinq onglets sur une ligne au-dessus du panneau et de la roue ; vignettes PVZ-04 à
  PVZ-08 à 240 px.
- Frise des rôles redessinée, textes à 13 px au moins ; « Lead, 5 déc. » et « trois jours plus tard »
  portent « date à confirmer ».

### Compétences

- Poids des logos harmonisés (aplats .NET, TS, C# allégés en gris moyen, logos au trait renforcés,
  logos clairs inversés) ; mots-marques Nginx, Leaflet et API Platform élargis ; PHPUnit en
  pictogramme ; flèche ↗ des tuiles dans le coin, décollée du nom.
- Compétences humaines : quatre par rangée, vignettes CMP-02 à CMP-08 de 248 px.
- « Exploré ou ponctuel » replié par défaut (30 technologies derrière le résumé), pour tenir 4 écrans.

### Écarts assumés

- La bichromie nuit (encre et ivoire) suit le juge recruteur et la direction artistique ; la photo de
  jour reste en couleur plutôt qu’en bichromie encre et bleu roi.
- Les numéros de chapitre 01, 02, 03 restent (ouverture de chapitre du § 8.2), mais en encre et sans
  rognage.
- ACC-07 n’est pas posé : la marge de « Gwent » porte la figure du plafond.
