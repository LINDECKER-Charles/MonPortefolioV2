# Direction B — « Banc d’essai »

Maquette de la refonte du portfolio, direction B du cahier des charges (synthèse de l’audit, § 8.3).
Quatre planches navigables : [accueil](accueil.html), [projets](projets.html),
[PvZ Fusion](pvz-fusion.html) et [compétences](competences.html). Les liens vers les autres pages
du site mènent à [hors-maquette.html](hors-maquette.html), qui nomme la page demandée.

Ouvrir un fichier dans le navigateur suffit. `?theme=jour` ou `?theme=nuit` force le thème.
Sinon, le choix mémorisé (`localStorage['cl-theme']`) ou la préférence du système s’applique.
Les notes de maquette (identifiants d’emplacement, formats, gabarit commun, planche) sont masquées :
le bouton « Notes de maquette » du pied de page ou `?notes=1` les affiche, et le choix est mémorisé.

## Le concept en trois phrases

Chaque page est un banc d’essai : une fiche technique dit ce qu’on a voulu, des relevés datés disent
ce qu’on a mesuré, et les captures sont annotées comme des pièces sous test. La rigueur tient lieu de
décor : une grille visible, des cotes, des données en mono, un seul jaune pour la mesure qui prouve,
et la voix de Charles en italique, rare. La nuit, l’instrument passe dans un noir bleuté : la grille
s’éteint, la lanterne n’éclaire que la zone lue, et seuls les relevés de cette zone passent à l’ambre.

## Jetons

Un seul fichier, [style.css](style.css), section 1 « Jetons ». Hors de cette section, aucune couleur
ni taille de texte n’est écrite en dur, à part la valeur de masque `currentColor` du viseur.

### Couleurs et contrastes (WCAG 2.x, calculés)

| Jeton | Jour | Contraste | Nuit « instrument » | Contraste |
|---|---|---|---|---|
| `--fond` | `#FAFAF8` | — | noir bleuté `#0C1220` | — |
| `--surface` | `#FFFFFF` | 1,05:1 sur le fond, séparée par un filet | `#172033` | 1,15:1 sur le fond |
| `--grille` (décor) | `#E6E6E2` | 1,20:1 | `#1E2738`, éteinte | — |
| `--encre` | `#111214` | 17,9:1 fond · 18,7:1 surface | `#ECEDEE` | 16,0:1 · 13,9:1 |
| `--gris` | `#5D6066` | 6,0:1 · 6,3:1 | `#9AA3B5` | 7,4:1 · 6,4:1 |
| `--trait` (filet porteur) | `#8A8D93` | 3,2:1 · 3,3:1 | `#6B7589` | 4,0:1 · 3,5:1 |
| `--accent` (commandes) | bleu roi `#1F4FD1` | 6,5:1 · 6,8:1 | ambre de lanterne `#FFB547` | 10,6:1 · 9,3:1 |
| `--lien` (liens) | `#1F4FD1` | 6,5:1 | `#7FA2FF`, comme le focus | 7,6:1 · 6,6:1 |
| `--sur-accent` | `#FFFFFF` | 6,8:1 sur l’accent | `#0C1220` | 10,6:1 sur l’accent |
| `--focus` | `#1F4FD1` | 6,5:1 | `#7FA2FF` | 7,6:1 · 6,6:1 |
| `--colza` (étiquette de mesure) | `#F5D33F` | encre dessus 12,7:1 | `#F5D33F` | fond dessus 12,7:1 |
| `--releve` (état atteint d’une figure) | `#1F4FD1` | 6,8:1 sur la surface | `#FFB547` dans la zone éclairée | 9,3:1 |
| `--releve-eteint` (hors de la zone éclairée) | — | — | `#8C95A8` | 5,4:1 sur la surface |
| `--releve-doux` (manque, en hachures) | `#8A8D93` | 3,3:1 sur la surface | `#6B7589` | 3,5:1 |
| `--chiffre` (chiffres-preuves) | = encre | — | `#FFB547` dans la zone éclairée, encre ailleurs | 10,6:1 |
| `--lueur` (halo de la lanterne) | transparent | — | `rgb(255 181 71 / .13)` | décor |

Actes (B6). Chaque acte redéfinit les jetons de son contenu :

| Acte | Fond | Encre | Gris | Filet | Accent |
|---|---|---|---|---|---|
| Sombre, jour (« Aujourd’hui ») | `#111214` | `#FAFAF8` 17,9:1 | `#A3A6AC` 7,7:1 | `#6A6E76` 3,7:1 | `#8FAEFF` 8,6:1 |
| Sombre, nuit | `#121A2B` (1,08:1 sur la page, bordé d’un filet à 3,9:1) | `#ECEDEE` 14,8:1 | `#9DA5B6` 7,0:1 | `#6E788C` 3,9:1 | `#FFB547` 9,9:1 ; liens `#7FA2FF` 7,1:1 |
| Bleu nuit, jour (« La suite ») | `#0F2A7A` | `#FAFAF8` 12,3:1 | `#C3CCEB` 8,1:1 | `#7083C4` 3,5:1 | bouton `#FAFAF8`, texte bleu 12,3:1 ; focus colza 8,7:1 |
| Bleu nuit, nuit | `#111B3D` (1,11:1, bordé d’un filet) | `#ECEDEE` 14,4:1 | `#A9B1C9` 7,9:1 | `#5F6B96` 3,2:1 | `#FFB547` 9,6:1 ; liens `#7FA2FF` 6,8:1 |

Fixes, identiques jour et nuit : `--ecran #0B0C0E` (fond des captures), `--etiquette-fonce #111214`
et `--etiquette-clair #FAFAF8` (cotes du réticule, colza dessus 12,7:1).

### Typographies (OFL)

- **Archivo** variable, axes graisse et largeur. Titres en largeur 125 %, graisse 600 ; texte en 100 %,
  graisse 400, 17 px ; étiquettes en largeur 82 %. Ses chiffres n’ont pas de zéro barré : tous les
  chiffres-preuves sont composés en Archivo.
- **JetBrains Mono** pour les données : dates, versions, sources, identifiants d’emplacement, cotes.
  Son zéro est pointé, jamais barré (`font-feature-settings: 'zero' 0` posé sur `body`).
- **Newsreader** italique, une seule graisse : la voix de Charles, trois citations par page au plus.

La maquette charge les polices depuis Google Fonts. Le site les auto-hébergera en trois fichiers
`woff2` sous-ensemble latin français (Archivo variable, JetBrains Mono, Newsreader italique) ;
vérifier `≈`, `→`, `↗`, `↓` dans le sous-ensemble.

### Échelle (8 tailles, rapport ≈ 1,25)

`--t-1` 13 px · `--t0` 15 px · `--t1` 17 px (texte) · `--t2` 20 px (chapô) ·
`--t3` 22 → 26 px · `--t4` 28 → 38 px · `--t5` 36 → 54 px · `--t6` 38 → 62 px (accroche).
Crénages : `--c-titre` −0,022 em, `--c-sous` −0,01 em, `--c-0`, `--c-etiq` +0,02 em.
Interlignage : 1,02-1,12 pour les titres, 1,5-1,6 pour le texte.

### Rayons, élévations, mouvement

- **Rayons** : `--r0` 0 (cadres, figures), `--r1` 3 px (commandes, cartes), `--r2` pilule (bascule,
  stations de la boucle).
- **Élévations** : `--e0` à plat ; `--e1` cartes survolées ; `--e2` bulles, menus, lecture des
  figures. La nuit, l’élévation passe par un liseré clair et une surface plus claire, pas par l’ombre.
- **Mouvement** : une courbe `cubic-bezier(.2, .7, .2, 1)`, deux durées, 200 ms pour l’interface et
  400 ms pour les scènes. Le tracé du plafond dure 1,6 s, une fois, à son arrivée.

## Composants

En-tête collant (emblème et nom réels, navigation, bascule-lanterne ; sur mobile : Sommaire, Contact,
Menu et lanterne, tous sans cadre, 44 px) · barre de progression de 2 px (mobile) · **règle graduée**
« Dans cette page » (sans boîte, intitulés en 15 px, section active en `aria-current="location"` et
marquée d’un trait épais à l’encre, ambré et lumineux la nuit) · réglet de colonnes en tête de page et
de pied · plaque de chapitre · fiche technique · relevés
(chiffre, unité, source datée) · étiquette de mesure colza · marque « à confirmer » · citation ·
bulle de glossaire (`popover` natif, ancrée) · boutons et liens fléchés (`→` interne, `↓` ancre,
`↗` sortie) · cadre de capture (navigateur, terminal) avec cible, **réticule** et **loupe** ·
recadrage annoté · **planche** d’illustration (fond teinté, sujet en titre, esquisse isométrique) ·
capture à faire (le vrai cadre, écran hachuré, sujet au centre) ·
figures codées (plafond, jauges, colonnes du rattrapage avec lecture au réticule, frise des rôles,
jalons de la 4.0) · avant / après · décisions « contrainte → choix → effet » · carte projet du récit ·
ligne de vitrine (matrice) · tuile et pastille de technologie (logos réels harmonisés en gris) ·
onglets du parcours défilables · boucle à onglets · cartouche de pied de page.

## La signature

1. **Le réticule.** Chaque capture porte au repos une cible numérotée et, juste dessous, sa loupe
   (détail agrandi lisible) et sa légende au même numéro. Au survol ou au focus de la carte, le viseur
   s’allume : croix de visée sur toute la capture, cadre à crans, cote mono qui nomme la zone. Sur les
   figures, le même viseur lit les données au survol et au clavier (flèches de tabulation entre les
   colonnes du rattrapage). Captures : `captures/etat-accueil-reticule-*.webp`,
   `captures/etat-pvz-lecture-*.webp`.
2. **La bascule.** La lanterne du logo (dessin GLO-03 proposé, en SVG) s’allume, puis une ligne de
   mesure colza balaie la page de haut en bas et révèle la nuit derrière elle (View Transitions,
   640 ms). La grille s’éteint, les relevés passent à l’ambre. En mouvement réduit, ou sans
   View Transitions, le thème change d’un coup. Capture : `captures/etat-accueil-bascule-milieu.webp`.
3. **La nuit-instrument.** Le fond passe au noir bleuté ; la lanterne (`maquette.js`, classe
   `.eclairee`) n’éclaire que la zone lue : un halo ambré très faible derrière son titre, le curseur ambré
   de la règle graduée, et ses relevés (séries atteintes, chiffres-preuves) à l’ambre. Hors de la zone,
   les relevés s’éteignent en gris clair. Sans script, tout reste allumé. Captures :
   `captures/etat-pvz-nuit-zone.webp`, `captures/etat-accueil-nuit-zone.webp`.

Les photos réelles sont en couleur légèrement désaturée (saturation 56 %, contraste doux, sans retouche
du visage) : la chemise garde naturellement son bleu, sans effet de couleur sélective.
`assets/photos/charles-{2,3,4}-desature.webp`.

## Respect des règles du § 3

**Beauté**
- **B1** Jetons uniques : 8 tailles, 3 rayons, 3 élévations, 4 crénages ; aucune couleur ni taille en
  dur hors jetons (vérifié par `grep` sur `style.css`).
- **B2** Deux familles (Archivo, Newsreader italique) plus une mono ; trois fichiers en production.
- **B3** Chiffres-preuves en Archivo, zéro sans barre ; mono à zéro pointé ; `tabular-nums` dans les
  tableaux et la lecture des figures.
- **B4** Un seul titre dominant par écran ; le nom est un petit sur-titre de l’`h1` de l’accueil.
- **B5** L’accent ne sert qu’aux liens, commandes, focus et à un élément d’identité par écran (la
  série mise en avant d’une figure). Numéros, sur-titres et étiquettes sont en encre ou en gris.
- **B6** Trois paliers et des actes : accueil clair → acte sombre « Aujourd’hui » → acte bleu nuit
  « La suite » ; surfaces séparées par des filets ≥ 3:1 (tableaux ci-dessus).
- **B7** Deux cadres (navigateur, terminal) ; chaque capture réduite a sa loupe ou un recadrage
  annoté ; la barre de fenêtre native de gup est rognée pour ne pas doubler le cadre.
- **B8** Une famille d’illustrations à commander, en vues éclatées au trait sur grille isométrique,
  deux ou trois aplats (encre, bleu roi, lumière) recolorés par les jetons. Chaque emplacement montre
  déjà une esquisse de la série (SVG en ligne, trait de 1,25 px). Les grands emplacements font au moins
  384 px de large sur ordinateur, les gestes 280 px, les compétences humaines 320 px. **Écart** :
  ACC-04 et ACC-09 restent des vignettes (230 à 290 px), comme demandé.
- **B9** Aucune référence de jeu dans les libellés, commandes ou cadres ; le jeu n’apparaît que dans
  le récit et les projets.

**Ergonomie**
- **E1** Au pli, à 1440 × 900 comme à 390 × 844 : titre, ligne d’identité, une preuve et l’action
  (`captures/*-pli.webp`) ; attribut `data-pli` sur chaque premier bloc. Sur PvZ, les trois repères
  sont sous le chapô, avant la fiche (bureau) et avant PVZ-01 (mobile). Sur l’accueil mobile, les trois
  preuves passent avant l’action et le chapô.
- **E2** « Discutons → » partout, vers Contact ; `→` interne, `↓` ancre, `↗` sortie.
- **E3** Longueurs tenues (tableau plus bas).
- **E4** Une seule navigation de page, la règle graduée : colonne collante dès 1 024 px, bouton
  Sommaire et barre de 2 px sur mobile, un seul élément collant en haut ; sans script, les ancres
  restent.
- **E5** Le squelette commun est **annoté sur la page PvZ** dans les notes de maquette (« gabarit
  commun · 1 en-tête », « 2 repères chiffrés », « 3 corps libre », « 4 contrainte → choix → effet »,
  « 5 sortie ») :
  en-tête avec nom canonique, besoin, ma part, fiche (rôle, période, équipe, statut, liens publics) et
  visuel ; trois repères sourcés et datés ; corps libre en quatre sections ; « Comment je l’ai
  construit » atteint en un clic depuis l’en-tête ; sortie avec ce que j’en retiens, liens, projet
  suivant et Discutons.
- **E6** Noms canoniques : « PvZ Fusion, pôle francophone », « League Of Data Base », « Omnicard »,
  « Bloodborne Legendary Run », « gup ».
- **E7** Mobile : colonne de texte pleine largeur, galerie des projets en `scroll-snap` avec compteur
  « 1 / 3 », onglets du parcours défilables avec dégradé et onglet actif ramené dans la vue,
  cibles ≥ 44 px.
- **E8** Ni blog, ni CV, ni archive, ni démo hors ligne. Dans la maquette, les pages non dessinées
  pointent vers `hors-maquette.html`, qui le dit.

**Contenu**
- **C1** Chaque chiffre affiché vient du cahier des charges, de la matière première ou des audits ;
  les relevés 🔍 de l’audit portent « à consigner » ; une étiquette colza par preuve (`data-source`).
- **C2** Citations au mot près : « juste moi et mes propres décisions », « J’ai recommencé jusqu’à
  réussir et je me suis réorienté autant que nécessaire », « La seule chose qui a changé, c’est le
  titre », « Seul on va vite, à plusieurs on va loin : la qualité et la sincérité des échanges
  démultiplient les résultats », « un moment j’en ai eu marre, j’ai repris le projet » (à confirmer).
- **C3** Liens sortants : seulement des dépôts publics (`gup`, `public-Omnicard`,
  `LeagueOfDataBaseFinal`, `PVZ-Fuzion-ConsolManager`, `PVZF-Translation-fr` dans la note de sources,
  `App.GitHealth`, `app-life-pixel`, `Web-Image-Formateur`, `ShrekSophone`), le dépôt officiel
  `Teyliu/PVZF-Translation`, les applications en ligne et les sites officiels des technologies.
  Aucun lien vers le dépôt de Bloodborne ni vers un dépôt privé.
- **C4** Poste actuel en termes génériques ; aucune formulation de recherche de poste.
- **C5** Pages de consultation : une phrase sous le titre, pas d’introduction.
- **C6** Page PvZ à la première personne ; problème, équipe, méthode, résultat, puis décisions.
- **C7** Chaque histoire est racontée une fois ; plus de notes de marge, de « Règles 1, 2, 3 » ni de
  synthèse au milieu.
- **C8** Aucune consigne d’interface affichée.
- **C9** Statuts honnêtes (« Hors ligne, en refonte », « Android en test »), téléchargements npm
  datés, jamais « utilisateurs ».

**Accessibilité et mouvement** : focus visible partout (`captures/etat-projets-focus.webp`), lien
d’évitement, menus fermés par Échap, boucle navigable aux flèches, figures avec `desc` et tableau de
données, aucune information portée par la couleur seule (statuts dessinés, avant / après barré ou
souligné, légendes), `prefers-reduced-motion` respecté (état final complet), impression en encre.

Contrôles passés : axe-core (WCAG 2.2 AA et bonnes pratiques) sans violation sur les cinq pages, en
jour et en nuit, à 390 et 1440 px ; aucun débordement horizontal ; budgets tenus (CSS 19,2 Ko gzip,
scripts 5,1 Ko gzip). Glossaire : sans positionnement par ancre, la bulle s’affiche en bas de l’écran.

## Hauteurs mesurées

Écrans de 900 px (ordinateur, 1440 px de large) et de 844 px (mobile, 390 px).

| Page | Ordinateur | Sans script | Cible | Mobile | Sans script | Cible |
|---|---|---|---|---|---|---|
| Accueil | 6,49 | 6,47 | ≤ 6,5 | 10,68 | 10,66 | ≤ 11 |
| Projets | 2,93 | 2,91 | ≤ 3 | 4,81 | 4,78 | ≤ 5 |
| PvZ Fusion | 5,82 | 5,80 | ≤ 6 | 9,89 | 9,83 | ≤ 10 |
| Compétences | 3,95 | 3,93 | ≤ 4 | 6,86 | 6,83 | ≤ 7 |

## Visuels

### Réels, utilisés tels quels

- Logo : `site/src/assets/marque/logo-symbole.webp`, `logo-nom.webp` ; nuit :
  `design/assets/marque/logo-symbole-nuit.png` ; le nom passe en clair par filtre CSS.
- Photo : `design/refonte/commun/photos/charles-4.webp`, en couleur légèrement désaturée
  (`assets/photos/charles-4-desature.webp`, ACC-01). Les versions 2 et 3 sont prêtes pour Contact et
  Parcours.
- Captures : `site/public/images/league-of-database/histoire-version.webp`,
  `site/src/assets/projets/bloodborne/parcours-desktop.webp`, `site/src/assets/projets/gup-selection.webp`
  (accueil, ACC-13 ; vitrine, PRJ-04 et PRJ-05 en recadrages annotés).
- Logos de technologies : `site/src/assets/stacks/*`, en gris le jour et en négatif la nuit ; couleur
  d’origine au survol. Sans logo officiel (SQL, SQLx, stockage S3, Axum, axe-core, Dompdf, OpenTUI,
  Make, Claude, Codex, Kokoro, Piper) : pictos dessinés au trait de l’interface.

### Figures codées, dessinées pour de vrai

- **ACC-06** Le plafond Gwent : large et compacte, cotes « ≈ 1 an » et « 4 mois », tracée une fois,
  rejouable.
- **PVZ-F1** Le rattrapage : huit relevés de l’audit (§ 2.1 de `projet-pvz-fusion.md`), colonnes
  empilées, lecture au réticule, version mobile 4:5 et tableau de données.
- **Jauges du 16/10/2025** : la même source, pour poser le point de départ.
- **PVZ-F2** La 4.0 en six jours : jalons du 20/09, du 26/09 et du 01/10/2026.
- **PVZ-F3 + PVZ-F4** Rôles (traducteur, lead, mainteneur) et neuf arrivées anonymes du journal public.
- **PVZ-03** La boucle de la semaine, en SVG, avec ses cinq stations en onglets.
- **CMP-F1** La chaîne *build-once*, en HTML.

### Emplacements à faire générer ou capturer (planches au bon ratio, esquisse et sujet lisibles)

- **Accueil** : ACC-03, ACC-04 (dans la carte Omnicard), ACC-08, ACC-09, ACC-11 ; gestes PVZ-05,
  PVZ-07, PVZ-08a et PVZ-08b (ACC-15).
- **Projets** : PRJ-01, PRJ-02, PRJ-03 ; PRJ-06 à PRJ-10 cités dans la rangée « Aussi ».
- **PvZ Fusion** : PVZ-01, PVZ-02, PVZ-04 à PVZ-08 ; captures à faire CAP-PVZ-1, CAP-PVZ-2,
  CAP-PVZ-4, CAP-PVZ-6, CAP-PVZ-7.
- **Compétences** : CMP-02 à CMP-08 (16:10 dans cette direction) ; CMP-10 en pictos dessinés pour
  Claude, Codex, Kokoro, Piper, SQL, Axum, SQLx, Stockage S3 compatible, Dompdf, OpenTUI, Make et axe-core.

Commande de style pour toute la série : vue éclatée technique, trait régulier de 1,25 px sur grille
isométrique stricte, encre, un aplat bleu roi et une touche de lumière, fond transparent, aucun
texte, aucun visage. Les esquisses de la maquette (générées par un petit script de primitives
isométriques : boîtes, plans, cylindres, silhouettes sans visage) fixent la composition de chaque sujet ;
elles ne sont pas l’illustration finale.

## Limites et points à confirmer

- Les quatre gestes du pôle ne disposent que de trois commandes (PVZ-05, PVZ-07, PVZ-08) : la
  maquette propose de scinder PVZ-08 en podium (08a) et lettre (08b).
- ACC-02 (pictos des trois verbes, GLO-04) n’est pas posé : la direction préfère des verbes composés
  en grand ; à réintroduire si Charles y tient.
- La hiérarchie des technologies en trois niveaux est une proposition depuis la stack du CV (Q9).
- Liens « SQL » (norme ISO payante) et « Stockage S3 compatible » (documentation AWS) à remplacer.
- La date du titre de lead, la place du Console Manager, la part personnelle des traductions, le nom
  « League Of Data Base », le « seul » de Bloodborne et la citation sur Omnicard restent marqués.
- Les relevés de l’audit (couverture, 1 225 téléchargements npm, 20 PR en 21 semaines) doivent être
  consignés dans `docs/matiere-premiere.md` avant toute mise en ligne.
- Les notes de maquette (gabarit commun, identifiants, formats, consignes) sont masquées par défaut
  et ne doivent pas exister en production.
- Compétences n’a pas d’acte sombre : la page est à 6,86 écrans sur 7 sur mobile, sans marge pour
  une bande pleine largeur.
- Les esquisses restent des esquisses : le rendu final des vues éclatées dépend de la commande.

## Fichiers

`accueil.html`, `projets.html`, `pvz-fusion.html`, `competences.html`, `hors-maquette.html` ·
`style.css` (jetons et composants) · `theme.js` (thème, bascule, notes de maquette) · `maquette.js`
(règle graduée, zone éclairée, plafond, boucle, réticule des figures, galerie, copie de l’adresse) ·
`assets/photos/` · `captures/` (pages entières jour et nuit, plis, et quinze états d’interaction).

## Corrections après jugement

Trois juges ont évalué la direction (recruteur technique, qualité d’exécution, ergonomie et récit).
Toutes leurs corrections impératives sont appliquées ; la direction garde son vocabulaire (fiche,
relevés, réticule, loupes, cotes, mono pour les données).

**Identité et nuit**
- Photo : la couleur sélective (noir et blanc, chemise bleue) est abandonnée pour une couleur
  légèrement désaturée ; le bleu d’identité reste porté par le bouton, le logo et la chemise elle-même.
- Nuit : noir bleuté (`#0C1220`) au lieu du noir neutre ; la lanterne éclaire la zone lue (halo ambré,
  curseur ambré de la règle, relevés ambrés), le reste s’éteint. Ambre réservé à la commande principale
  et aux relevés ; liens en `#7FA2FF`, comme le focus.
- Figures PvZ : la sémantique est inversée. Traduit à l’encre pleine, manquant en hachures grises,
  bleu roi (ambre la nuit) seulement sur l’état atteint, le « 0 » d’août 2026. Jauges du 16/10/2025
  sur le même code.

**Premier écran**
- PvZ, 1440 × 900 : les trois repères (20 / 0 / 35) remontent sous le chapô, la fiche descend dessous ;
  390 × 844 : repères avant PVZ-01, « Comment je l’ai construit » réduit à un lien. Un chiffre est
  dans chaque premier écran.
- Accueil mobile : titre, identité, les trois preuves resserrées, puis l’action ; les trois verbes et
  « Discutons » sont au pli. Le chapô et la photo suivent.
- Accueil, `h1` : deux phrases composées (« Je maîtrise d’abord / les règles du jeu. / Ensuite, je les /
  réinvente. » sur ordinateur), espaces insécables, accroche plafonnée à 62 px, alignement optique du J.
- En-tête mobile : Sommaire, Contact, Menu et lanterne ont une seule forme, sans cadre, 44 px ; seul le
  menu ouvert prend un cadre.

**Système et finitions**
- Planches : les cadres croisés en pointillé deviennent des planches teintées, sujet en titre lisible et
  esquisse isométrique de la série ; trois grandes planches sur l’accueil (ACC-03, ACC-08, ACC-11),
  ACC-04 et ACC-09 en vignettes. Gestes PVZ-05 à PVZ-08 à 280 px, compétences humaines à 324 px.
  Les captures à faire sont posées dans leur vrai cadre (navigateur, terminal).
- Notes de maquette masquées par défaut (« gabarit commun », « 01 / 05 », identifiants, formats,
  consignes, « Maquette B… planche ») ; un bouton du pied de page les affiche.
- Acte « Aujourd’hui » : les trois captures en 16:10, loupes de même hauteur, titres alignés (sous-grille) ;
  loupes et recadrages à bords fondus et recentrés, plus aucun glyphe coupé net.
- Grille : plus derrière le texte. Elle devient un réglet de douze colonnes réelles en tête de page et de
  pied, et un quadrillage sous les figures (plafond, jauges) ; la nuit, elle s’éteint.
- Règle graduée : sans boîte, intitulés en 15 px, section active marquée d’un trait épais.
- Mono réduit à une ligne de source par figure (révisions et « couverture par clé » renvoyées à la note
  de sources) ; date de lead en texte.
- Compétences : pictos dessinés à la place des monogrammes pointillés ; l’invitation « Discutons » occupe
  la dernière rangée des compétences humaines.
- PvZ mobile : « Liens publics » en pleine largeur dans la fiche ; arrivées de la frise des rôles
  décalées pour dégager les dates.
- Titres longs (« PvZ Fusion, pôle francophone », « Bloodborne Legendary Run ») en largeur 100 % sur
  mobile.

**Faits, ergonomie, accessibilité**
- Accueil : sources séparées, « témoignage » sous 20 et 10, « liste publique » sous 35.
- Projets : « couverture de tests 100 % » retiré d’img-convertor (à revérifier avant affichage).
- Pied de page : « Architecte logiciel, à Mulhouse » ; adresse en lien `mailto:` visible
  (`data-evenement="contact-email"`) en plus de la copie ; mentions légales dans le colophon.
- Sans script : chaque temps de la boucle PvZ est un `<details>` (le premier ouvert) et le schéma décoratif
  se retire ; PvZ passe de 7,62 / 11,36 à 5,80 / 9,83 écrans.
- Glossaire : repli en bas d’écran quand le positionnement par ancre manque.

Non retenu : greffer un acte sur Compétences (plus de marge de longueur sur mobile) ; changer
d’Archivo, qui reste la signature de la direction, la voix en italique de Newsreader la réchauffe.
