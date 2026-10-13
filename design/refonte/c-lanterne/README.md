# Direction C — « Lanterne »

Maquette de la direction C du cahier des charges de la refonte (§ 8.4). Quatre pages statiques
sur le contenu réel : [accueil](accueil.html), [projets](projets.html),
[PvZ Fusion](pvz-fusion.html) (gabarit commun des pages de projet) et
[compétences](competences.html). Feuille unique [style.css](style.css), script unique
[theme.js](theme.js), polices auto-hébergées dans [polices/](polices/), captures finales dans
[captures/](captures/).

## Le concept en trois phrases

Une seule source de lumière : sur chaque scène, une seule chose est éclairée (la phrase, le
chiffre, la capture) et le reste se tait. Le jour est une aube sur pierre claire où la nuit entre
par des « actes de veille » sombres, là où les captures d’écran attendent ; la nuit est un clair
de lune bleuté où la lanterne pose un halo ambré sur la zone active. La lanterne du logo devient
un principe de hiérarchie et un geste : on l’allume pour faire tomber la nuit.

## Jetons

Un seul bloc de jetons, en tête de `style.css` (jour sur `:root`, nuit sur
`:root[data-theme="nuit"]` et `.acte-veille`, repli `prefers-color-scheme` sans JavaScript). Aucune
couleur ni taille de texte en dur hors de ce bloc, sauf les logos tiers, les captures et les
coordonnées internes des figures SVG.

### Couleurs et contrastes (WCAG 2.x, calculés)

| Jeton | Jour « aube » | Contraste | Nuit « clair de lune » | Contraste |
|---|---|---|---|---|
| `--fond` | pierre `#ECE9E3` | — | suie `#0B0D12` | — |
| `--surface` | `#FBFAF7` | 1,16:1 sur le fond | `#1A1E29` | 1,17:1 sur le fond |
| `--acte` (teinté) | `#DCD6CB` | 1,19:1 sur le fond | `#12151C` | — |
| acte de veille (sombre) | `#15171D` | jetons de nuit dedans | `#10131A` | filets en bordure |
| `--encre` | `#141312` | 15,3 fond · 17,8 surface · 12,8 acte | lune `#E4E7EE` | 15,7 fond · 13,5 surface |
| `--eteint` (texte secondaire) | `#59544C` | 6,2 fond · 7,2 surface · 5,2 acte | `#9499A3` | 6,8 fond · 5,8 surface |
| `--trait` (filet porteur) | `#7B7368` | 3,9 fond · 4,5 surface · 3,2 acte | `#687083` | 3,9 fond · 3,4 surface |
| `--accent` (liens, commandes) | bleu roi `#1F4FD1` | 5,6 fond · 6,5 surface · 4,7 acte | lune `#A9BBFF` | 10,4 fond · 8,9 surface |
| texte sur bouton | blanc sur bleu roi | 6,8:1 | suie sur lanterne `#F0B24A` | 10,3:1 |
| `--focus` | bleu roi | 5,6 fond | lanterne `#F0B24A` | 10,3 fond |
| `--laiton` (marques de figure) | `#7A4F10` | 5,9 fond | lanterne `#F0B24A` | 10,3 fond |
| `--surligneur` | colza `#F2CF3A`, encre dessus | 12,2:1 | `#E8C75A`, suie dessus | 11,8:1 |
| acte de veille (jour) | lune sur `#15171D` | 14,5 · éteint 6,3 · lune 9,6 · filet 3,6 | — | — |

Constantes communes : `--lanterne`, `--lanterne-survol`, `--lanterne-halo` (ambre à 22 %),
`--lanterne-eclat` (55 %), `--suie`, `--lune`, `--veille-nuit`, les teintes des cadres de
capture, et trois voiles : `--voile-lune` et `--lueur-portrait` (la photo de nuit),
`--voile-cible` (l’anneau des cibles sur les captures). Le bleu roi reste l’identité (la chemise des quatre photos) ; il ne porte que ce qui est
cliquable. La nuit, la lumière se partage : la lune pour les liens, la lanterne pour l’action
principale, le focus et la zone éclairée.

### Typographie

- **Instrument Serif** (romain et italique, OFL) : titres en très grand corps, citations de
  Charles, la voix. Son zéro n’est pas barré.
- **Instrument Sans** (variable 400 à 700, largeur 75 à 100 %, OFL) : texte courant 17 à 18 px,
  interface, données en chiffres tabulaires, et **les chiffres-preuves** (20, 403, 1 289, 153,
  35…) en graisse 600, chiffres tabulaires, jamais sous `--t-2xl`.
- **Atkinson Hyperlegible Next écartée**, contre la description du § 8.4 : vérification faite sur
  le fichier de Google Fonts, son zéro est barré dans les deux glyphes disponibles (`zero`,
  `zero.tf`) sans aucune variante. La garder imposait une troisième famille et un quatrième
  fichier, contraire à B2.
- Trois fichiers, **117 Ko** en tout (sous-ensemble latin, flèches `→ ↗ ↓` et `≈` compris).

Échelle (huit tailles, B1) : `--t-xs` 14 · `--t-s` 16 · `--t-m` 17→18 (texte) · `--t-l` 19→22
(chapeaux) · `--t-xl` 26→34 · `--t-2xl` 32→46 (titres de section) · `--t-3xl` 40→68 (titres de
page et de chapitre) · `--t-4xl` 46→92 (l’accroche seule). Crénage : `0`, `-.01em`, `-.018em`,
`.01em`. Interlignage 1,6 pour le texte, 0,95 à 1,1 pour les titres.

### Espaces, rayons, élévations, mouvement

- Espaces : 4, 8, 12, 16, 24, 32, 48, 64, 96 px ; gouttière 16 à 48 px ; conteneur 1 344 px ;
  mesure de lecture 35 rem (≈ 62 caractères).
- Rayons : `--r1` 3 px (étiquettes, champs, surligneur), `--r2` 12 px (cartes, captures,
  emplacements), `--r3` pilule (boutons, bascule). Seuls les cadres de téléphone ont leur propre
  courbure, qui dessine l’appareil.
- Élévations : aucune ; `--ombre-1` (carte) ; `--ombre-2` (carte survolée, panneau). La nuit, les
  ombres deviennent un filet et un halo de lanterne.
- Mouvement : une courbe `cubic-bezier(.2, .7, .2, 1)`, deux durées, 200 ms (interface) et 400 ms
  (scènes). La transition de thème dure deux scènes.

## Composants

En-tête collant (emblème réel, nom réel, navigation, Contact, Menu et Sommaire en `<details>`,
bascule lanterne, barre de progression de 2 px sur mobile) · pied de page · bouton pilule et lien
d’action · surligneur · fil d’Ariane · onglets du parcours défilables · navigation de page en
colonne · zone éclairée `.foyer` · actes `.acte-teinte` et `.acte-veille` · emplacement
d’illustration · cadre de capture (navigateur, téléphone, terminal) · capture annotée (cadre 16:10,
cible numérotée, loupe éclairée, légende) · figure codée · pictogrammes des trois verbes (GLO-04,
dessinés) et pictos de repli des technologies (CMP-10, même main) · carte de projet (vedette et
ligne) · fiche, repères chiffrés (en bandeau ou en pile), décisions « contrainte, choix, effet »,
sortie de projet · appel de fin de page · galerie à crans avec compteur · glossaire en popover
natif · tuiles, familles et étiquettes de technologies · statut (forme et mot) · marque « à
confirmer » · bouton des annotations du gabarit.

## La signature : l’allumage

La bascule jour / nuit est une lanterne dessinée (GLO-03) : éteinte le jour, sa flamme s’allume en
400 ms. Le passage à la nuit fait tomber l’obscurité depuis les bords de l’écran, qui se referme
sur la lanterne qu’on vient d’allumer (View Transitions et masque radial) ; le retour au jour fait
partir la lumière de la lanterne vers les bords. Dans le même temps, la flamme du logo s’entoure
d’un halo, la photo de couverture garde ses couleurs mais s’assombrit sous un voile de lune, la
lanterne posée sur le côté éclairé du visage (filtres déterministes, aucune image régénérée ; la
chemise reste bleu roi), et chaque scène garde une seule zone éclairée. La nuit, la lumière suit la scène
en cours ; en mouvement réduit, tout arrive à l’état final, sans transition ni lumière mobile. Le
jour, la même idée devient une flaque de lumière douce derrière l’élément qui compte, et les
logos du quotidien sont « allumés » (en couleur) quand les autres restent éteints (en gris).

## Le gabarit des pages de projet (E5)

La page PvZ Fusion porte des annotations de maquette en pointillé bleu (`Gabarit E5 · 1` à
`· 5`), **masquées par défaut** pour ne pas fausser la lecture des plis : le bouton « Afficher les
annotations du gabarit », dans le pied de page, les montre (ou `?annotations=1` dans l’adresse).
Elles disparaissent du site : 1 en-tête commun (nom canonique, besoin, ce que j’ai fait,
fiche, visuel), 2 trois chiffres sourcés et datés, 3 corps libre, 4 « Comment je l’ai construit »
(lien depuis l’en-tête), 5 sortie commune. Tout l’en-tête tient dans le premier écran à
1 440 × 900, chiffres compris.

## Respect des règles du § 3

| Règle | Comment la maquette la tient |
|---|---|
| B1 | Un bloc de jetons ; huit tailles ; trois rayons ; trois élévations ; quatre crénages ; couleurs en jetons. Exceptions assumées : cadres de téléphone, coordonnées des SVG. |
| B2 | Deux familles, trois fichiers, 117 Ko ; texte courant en Instrument Sans 17-18 px. |
| B3 | Aucun zéro barré (vérifié sur les glyphes) ; chiffres tabulaires dans les tableaux, les identifiants et les compteurs. |
| B4 | Un seul titre dominant par écran ; le nom est un sur-titre de 16 px dans le `h1`. |
| B5 | Bleu roi (lune la nuit) seulement sur liens, boutons et focus ; un élément d’identité, la lanterne. Les numéros, sur-titres et dates sont en encre ou en éteint. |
| B6 | Fond, surface (1,16:1), acte teinté (1,19:1) et acte de veille sombre ; filets porteurs ≥ 3:1. Sur l’accueil, chaque chapitre change d’acte (pierre, veille, teinté). |
| B7 | Un cadre par type (navigateur avec adresse, téléphone, terminal déjà fenêtré) ; captures entières ; la nuit, le cadre s’efface derrière un halo. |
| B8 | Une seule famille commandée : gravure en réserve, une lumière (voir § Emplacements). Limite : les vignettes de série sont sous 320 px (voir Limites). |
| B9 | Aucun lexique de jeu dans les libellés ; seule référence de jeu de l’accueil, Gwent, qui est le récit lui-même. |
| E1 | `data-pli` sur titre, identité, preuve, action ; vérifié en capture à 1 440 × 900 et 390 × 844 (accueil et PvZ : les quatre ; projets et compétences : titre, ligne, preuve). |
| E2 | « Discutons » mène partout à `/contact` (`contact.html` dans la maquette). Flèches vérifiées par script : `→` page interne, `↓` ancre, `↗` sortie, sans exception. |
| E3 | Voir les hauteurs ci-dessous : toutes dans les cibles. |
| E4 | Un seul `nav[aria-label="Dans cette page"]` par page longue : colonne collante au-delà de 1 100 px, section active (`aria-current="location"` et point de lanterne) ; en dessous, bouton « Sommaire » dans l’en-tête et barre de progression de 2 px. Un seul élément collant sur mobile. |
| E5 | Squelette annoté sur PvZ Fusion, réutilisable tel quel pour les quatre autres pages. |
| E6 | « PvZ Fusion, pôle francophone », « League Of Data Base » (marqué à confirmer), « Omnicard », « Bloodborne Legendary Run », « gup ». |
| E7 | Colonne de texte pleine largeur sur mobile ; galeries en `scroll-snap` avec compteur « 1 / 3 », focalisables au clavier quand elles défilent ; onglets défilables, fondu de débordement, onglet actif aligné à gauche sans être coupé ; décisions en pile verticale ; cibles de 44 px. |
| E8 | Ni blog, ni CV, ni archive, ni démo hors ligne ; la démo de Shreksophone est marquée à confirmer. |
| C1 | Chaque chiffre a sa source et sa date ; les relevés de l’audit portent « à consigner » ; un seul surlignage par preuve. |
| C2 | Citations reprises mot pour mot de `questions.md` et du brief : « juste moi et mes propres décisions », « j’apprends de ce flop… », « J’ai recommencé jusqu’à réussir… », « Un moment j’en ai eu marre… » (à confirmer), « La seule chose qui a changé, c’est le titre », « Seul on va vite… ». |
| C3 | Liens sortants publics uniquement : `Teyliu/PVZF-Translation` et son bilan, la PR #110, le Console Manager (dépôt, site, npm), `public-Omnicard`, `LeagueOfDataBaseFinal`, `league-of-data-base.com/fr/`, `bloodborne-legendary-run.com/fr/sky`, `gup` (dépôt, npm), GitHealth, Life Pixel, `Web-Image-Formateur`, la démo de Shreksophone, LinkedIn, GitHub, les sites officiels des technologies. Aucun dépôt privé. |
| C4 | Aucun dépôt privé nommé ; B-Hive, Mulhouse et août 2026 seulement (autorisés) ; aucune formulation de recherche de poste. |
| C5 | Projets et Compétences : un titre, une phrase, puis des faits. |
| C6 | Première personne ; problème, équipe, méthode, résultat, puis décisions. |
| C7 | Une histoire racontée une fois ; le bandeau des preuves et la conclusion renvoient vers la section qui la raconte. |
| C8 | Aucune consigne d’interface ; le compteur des galeries suffit. |
| C9 | « En ligne », « En cours, bénévole », « Hors ligne, en refonte », « Open source, sur npm » ; aucun chiffre d’usage. |

Accessibilité : axe (WCAG 2.2 AA et bonnes pratiques), 0 violation sur les quatre pages, jour et
nuit, 1 440 et 390 px ; focus visible (bleu roi le jour, lanterne la nuit) ; aucune information
portée par la seule couleur (statuts à forme et mot, hachures pour le manquant, texte des
figures) ; `prefers-reduced-motion` respecté ; aucun débordement horizontal.

## Hauteurs mesurées (écrans de 900 / 844 px)

| Page | Ordinateur | Mobile | Cible |
|---|---|---|---|
| Accueil | 6,48 | 10,54 | ≤ 6,5 / 11 |
| Projets | 2,99 | 4,99 | ≤ 3 / 5 |
| PvZ Fusion | 5,59 | 9,95 | ≤ 6 / 10 |
| Compétences | 3,96 | 6,89 | ≤ 4 / 7 |

Mêmes hauteurs sans JavaScript (PvZ mobile : 9,93).

## Emplacements de visuels utilisés

Chaque emplacement est un cadre hachuré au bon ratio, dans la lumière de la direction, qui affiche
son identifiant, son sujet, sa composition et son format. Style commandé : **gravure en réserve**
(trait clair sur fond sombre la nuit, inversé le jour), deux ou trois aplats séparables (encre,
aplat, lumière), la lanterne comme seule source de lumière dans la scène.

- **Accueil** — images : ACC-03, ACC-04 (reprise en OMN-02), OMN-01 (carte Omnicard), ACC-08
  (intitulés des portes en HTML), ACC-09 et ACC-11 (recadrés 2:1 sur l’accueil), ACC-15 en quatre
  vignettes (PVZ-05, PVZ-08 en deux moitiés, PVZ-07). Réels : ACC-01 (photo colza, voile de
  lune et lueur de lanterne en CSS la nuit), ACC-13 (captures de League Of Data Base, Bloodborne
  Legendary Run et gup, annotées d’une cible, d’une loupe et d’une légende), logo.
  Dessinés : ACC-06 (figure du plafond, seule figure animée), ACC-02 / GLO-04 (pictos des verbes),
  GLO-03 (bascule lanterne), ACC-14 (lanternes qui se transmettent la flamme, posé et livré).
  Non posés (élargi) : ACC-05, ACC-07, ACC-10, ACC-12, ACC-16.
- **Projets** — images : PRJ-01, PRJ-02, PRJ-03 ; captures réelles : PRJ-04 (atlas Bloodborne
  dans le cadre téléphone), PRJ-05 (gup en français). Non posés (élargi) : PRJ-06 à PRJ-12.
- **PvZ Fusion** — images : PVZ-01, PVZ-02 ; PVZ-04 à PVZ-08 dans les cercles de la boucle ;
  capture à faire : CAP-PVZ-2 (Console Manager). Dessinés depuis les données : PVZ-03 (boucle),
  PVZ-F1 (courbe du rattrapage, huit relevés mensuels), PVZ-F2 (la 4.0 en six jours), PVZ-F3 et
  PVZ-F4 réunies (rôles et neuf arrivées anonymes), barres « manquant / traduit » du 16/10/2025.
  Non posés : PVZ-09, PVZ-10, CAP-PVZ-1 (remplacée par le lien vers la PR #110), CAP-PVZ-4 à 6.
- **Compétences** — logos réels de `site/src/assets/stacks/` ; CMP-10 en pictos dessinés (base,
  API, seau, document, terminal, graphe de cibles, dialogue, code, voix, onde, accessibilité) pour
  Claude, Codex, Kokoro, Piper, SQLx, OpenTUI, Dompdf, Axum, Make, axe-core, SQL et le stockage
  S3, en attendant leurs logos officiels monochromes ; CMP-F1 (chaîne build-once) dessinée en HTML ; CMP-02 à CMP-08 en images. Non
  posés (élargi) : CMP-01, CMP-09.

## Liens hors maquette

Les pages absentes de la maquette sont liées à leur futur nom (`contact.html`, `omnicard.html`,
`league-of-database.html`, `bloodborne-legendary-run.html`, `gup.html`, `parcours.html`,
`professionnel.html`, `formation.html`, `mentions-legales.html`) et ne mènent à rien ici. Les
quatre pages de la maquette se lient entre elles ; « Parcours » ouvre Compétences.

## Limites et points ouverts

- Vignettes de série sous le seuil B8 de 320 px : ACC-15 (≈ 240 px), CMP-02 à CMP-08 (≈ 270 px),
  PVZ-04 à PVZ-08 (cercles de la boucle). À arbitrer : les agrandir allonge l’accueil et
  Compétences au-delà de leur cible.
- PVZ-08 couvre deux gestes (podium et lettre) : l’accueil le montre en deux moitiés.
- Recadrages non prévus par l’inventaire : ACC-09 et ACC-11 en 2:1 sur l’accueil, PVZ-01 reste en
  4:3 sur mobile (au lieu de 1:1) pour tenir la longueur.
- Les longueurs tiennent à quelques pixels près de leur cible : tout ajout devra en retirer autant.
- Hiérarchie des technologies en trois niveaux, verbes reformulés de trois compétences humaines,
  date du titre de lead, part personnelle des traductions, rôle du Console Manager, nom « League
  Of Data Base », citation Omnicard, sélection « Aussi » : marqués « à confirmer ».
- Sans JavaScript, le thème suit `prefers-color-scheme` (jetons et photo de nuit compris) et la
  bascule est masquée ; la lumière qui suit la scène, le bouton « Copier » et celui des
  annotations demandent le script.
- Les polices sont auto-hébergées ici en sous-ensemble ; le site devra les déclarer dans
  `astro.config.mjs` comme les autres.

## Corrections après jugement

Trois juges (recruteur lead, qualité d’exécution, ergonomie et récit) ont noté la maquette. Toutes
leurs corrections impératives sont appliquées, ainsi que les faiblesses jugées fondées, sans
greffer de traits d’une autre direction.

**Preuves et lecture du lead**

- Chiffres-preuves (20, 0, 35, 403, 1 289, 153, 3 mois) en Instrument Sans 600, chiffres
  tabulaires, palier `--t-2xl` au moins, sur l’accueil, Projets et PvZ. L’Instrument Serif reste
  aux titres et à la voix.
- Accueil, « À plusieurs » : 20 contributeurs formés · 10 en même temps · 35 pull requests
  fusionnées sortent du paragraphe et deviennent trois repères sourcés et datés, la zone éclairée
  de la scène. « Seul on va vite… » redescend au corps des citations (≈ 22 px, sans halo), en
  conclusion du bloc, après les quatre gestes.
- Accueil, « Ce que je construis » : les trois captures partagent un cadre 16:10 (le terminal de
  gup en 7:5, pour la même hauteur avec la barre d’adresse des deux autres) et portent chacune
  une cible numérotée, une loupe éclairée par la lanterne et une légende : le patch 3.6.14 en
  français, une galaxie et sa progression, une source en échec qui ne bloque pas les autres. Les
  loupes ont un fondu de bord : aucun glyphe n’est tranché net.
- Projets : « Voir le projet → » explicite sur la carte vedette ; la capture de Bloodborne est
  montrée entière (9:19,5) sur ordinateur et coupée entre deux cartes, jamais dans un texte, sur
  mobile.
- PvZ : annotations du gabarit masquées par défaut (bouton dans le pied de page) ; fiche « Équipe »
  réécrite en « Bénévoles, jusqu’à dix en même temps » (le 20 reste au premier repère, C7) ;
  révision et « couverture par clé » renvoyées à la note de sources.
- Compétences : « Au quotidien » reprend la stack du CV (C#, .NET, Angular, TypeScript,
  PostgreSQL, Docker, Git, GitHub Actions) ; Tailwind CSS et GSAP passent dans « Web et
  interfaces », EF Core dans « Données » ; un appel « Discutons → » clôt la page (E2).

**Voix, nuit, finitions**

- Couverture : le chapeau (« Je code depuis mes 13 ans… ») passe en encre et en `--t-l`, la ligne
  d’identité en graisse normale : la voix domine la fiche de poste. L’accroche est composée phrase
  par phrase, équilibrée (« Je maîtrise d’abord / les règles du jeu. / Ensuite, je les
  réinvente. »), avec un retrait optique pour le crochet du J.
- Nuit : la photo n’est plus virée à l’ambre. Elle reste en couleur, assombrie sous un voile de
  lune, avec la lumière de la lanterne sur le côté du visage ; la chemise reste bleu roi. C’est ce
  qui sépare la nuit de Nocturne.
- Figures de PvZ : le traduit reste en encre (atténuée la nuit), le manquant en hachures ; l’accent
  ne marque plus que l’état atteint (0 manquante en août 2026).
- En-tête mobile : une seule forme de commande, du texte sans boîte (Sommaire et Menu avec un
  chevron, Contact) et la lanterne sans cercle, toutes à 44 px.
- Mobile : les trois preuves tiennent au pli, « Emmener » compris ; onglet actif de Compétences
  aligné à gauche sans coupure, fondu de débordement à droite ; « Comment je l’ai construit » en
  pile verticale (plus de carrousel) ; boucle de la semaine réduite à ses numéros lisibles (la
  liste numérotée porte les libellés).
- Espaces insécables avant chaque flèche `→ ↓ ↗` et dans « B-Hive » : plus de flèche ni de
  syllabe seule en bout de ligne.
- Pied de page, toutes les pages : « à Mulhouse » ; adresse en lien `mailto:` visible (événement
  `contact-email`), bouton « Copier » révélé par le script seulement. La bascule lanterne est
  masquée sans JavaScript.
- Compétences : monogrammes pointillés remplacés par des pictos dessinés de la même main.

**Non repris, et pourquoi**

- Une partie des notes du juge « qualité d’exécution » vise une autre direction (Archivo étendu,
  mono, photo en noir et blanc où seule la chemise reste bleue, grille en filigrane, cartouche,
  croix filaires) : sans objet ici. Les points transposables sont appliqués (sémantique des jauges,
  loupes propres, ratio commun des captures, notes de maquette, coupures du titre, en-tête
  mobile, monogrammes, métadonnées renvoyées aux sources).
- Vignettes de série à 280 px : ACC-15 reste à ≈ 245 px et CMP-02 à CMP-08 à ≈ 272 px. Les
  agrandir impose de sortir de la colonne du sommaire ou de passer les gestes en 2 × 2, ce qui
  dépasse la longueur cible de l’accueil (déjà à 6,48 / 6,5).

Vérifications : axe (WCAG 2.2 AA et bonnes pratiques) à 0 violation sur les quatre pages, jour et
nuit, 1 440 et 390 px ; aucun débordement horizontal ; aucun texte sous 12 px hors figures ;
`[data-pli]` visibles au premier écran partout, avec et sans JavaScript.
