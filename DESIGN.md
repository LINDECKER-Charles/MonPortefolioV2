---
name: "MonPortefolioV2 — Lanterne"
description: "Une seule source de lumière : ce qui compte est éclairé, le reste se tait."
colors:
  fond: "#ece9e3"
  surface: "#fbfaf7"
  acte: "#dcd6cb"
  encre: "#141312"
  eteint: "#59544c"
  trait: "#7b7368"
  filet: "#d2ccc1"
  accent: "#1f4fd1"
  accent-survol: "#173fae"
  accent-texte: "#ffffff"
  laiton: "#7a4f10"
  erreur: "#a4271a"
  surligneur: "#f2cf3a"
  sur-surligneur: "#141312"
  focus: "#1f4fd1"
  emplacement: "#e3ded4"
  veille: "#15171d"
  nuit-fond: "#0b0d12"
  nuit-surface: "#1a1e29"
  nuit-acte: "#12151c"
  nuit-encre: "#e4e7ee"
  nuit-eteint: "#9499a3"
  nuit-trait: "#687083"
  nuit-filet: "#262b37"
  nuit-accent: "#a9bbff"
  nuit-accent-survol: "#c7d2ff"
  nuit-accent-texte: "#0b0d12"
  nuit-erreur: "#ff9d8a"
  nuit-surligneur: "#e8c75a"
  nuit-sur-surligneur: "#0b0d12"
  nuit-focus: "#f0b24a"
  veille-nuit: "#141a2b"
  lanterne: "#f0b24a"
  lanterne-survol: "#f6c670"
  lanterne-halo: "rgb(240 178 74 / 0.22)"
  suie: "#0b0d12"
  lune: "#e4e7ee"
  bleu-roi: "#1f4fd1"
  bleu-nuit: "#101b3e"
  bleu-nuit-surface: "#182752"
  bleu-nuit-encre: "#eef1f8"
  bleu-nuit-eteint: "#aeb8d6"
  aplat-roi-surface: "#2a5ae0"
  aplat-roi-eteint: "#dce3fa"
  cadre: "#0e1016"
typography:
  affiche:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontSize: "clamp(2.875rem, 1.1rem + 5.4vw, 5.75rem)"
    fontWeight: 400
    lineHeight: 0.95
    letterSpacing: "-0.018em"
  titre-page:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontSize: "clamp(2.5rem, 1.6rem + 2.8vw, 4.25rem)"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "-0.01em"
  titre-section:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontSize: "clamp(2rem, 1.4rem + 1.6vw, 2.875rem)"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "-0.01em"
  titre:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontSize: "clamp(1.625rem, 1.3rem + 0.9vw, 2.125rem)"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  citation:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontSize: "clamp(1.625rem, 1.3rem + 0.9vw, 2.125rem)"
    fontStyle: "italic"
    lineHeight: 1.22
  chapeau:
    fontFamily: "Instrument Sans, system-ui, sans-serif"
    fontSize: "clamp(1.1875rem, 1.05rem + 0.5vw, 1.375rem)"
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: "Instrument Sans, system-ui, sans-serif"
    fontSize: "clamp(1.0625rem, 1rem + 0.2vw, 1.125rem)"
    fontWeight: 400
    lineHeight: 1.6
  small:
    fontFamily: "Instrument Sans, system-ui, sans-serif"
    fontSize: "1rem"
    lineHeight: 1.5
  legende:
    fontFamily: "Instrument Sans, system-ui, sans-serif"
    fontSize: "0.875rem"
    lineHeight: 1.5
    letterSpacing: "0.01em"
  preuve:
    fontFamily: "Instrument Sans, system-ui, sans-serif"
    fontSize: "clamp(2rem, 1.4rem + 1.6vw, 2.875rem)"
    fontWeight: 600
    lineHeight: 1
    fontFeature: "tnum, lnum"
  button:
    fontFamily: "Instrument Sans, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.01em"
rounded:
  r1: "4px"
  r2: "6px"
  r3: "999px"
spacing:
  s1: "4px"
  s2: "8px"
  s3: "12px"
  s4: "16px"
  s5: "24px"
  s6: "32px"
  s7: "48px"
  s8: "64px"
  s9: "96px"
  gouttiere: "clamp(16px, 3.6vw, 48px)"
  section: "clamp(64px, 7vw, 112px)"
  largeur: "1344px"
  mesure: "35rem"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-texte}"
    rounded: "{rounded.r3}"
    padding: "0 24px"
    height: "48px"
    typography: "{typography.button}"
  button-primary-hover:
    backgroundColor: "{colors.accent-survol}"
    textColor: "{colors.accent-texte}"
  button-primary-nuit:
    backgroundColor: "{colors.lanterne}"
    textColor: "{colors.suie}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.accent}"
    rounded: "{rounded.r3}"
    padding: "0 24px"
    height: "48px"
    typography: "{typography.button}"
  lien-action:
    textColor: "{colors.accent}"
    height: "48px"
    typography: "{typography.body}"
  carte:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.r2}"
  etiquette:
    rounded: "{rounded.r1}"
    typography: "{typography.legende}"
  surligneur:
    backgroundColor: "{colors.surligneur}"
    textColor: "{colors.sur-surligneur}"
    rounded: "{rounded.r1}"
  aplat-roi:
    backgroundColor: "{colors.bleu-roi}"
    textColor: "#ffffff"
  acte-bleu:
    backgroundColor: "{colors.bleu-nuit}"
    textColor: "{colors.bleu-nuit-encre}"
  acte-veille:
    backgroundColor: "{colors.veille}"
    textColor: "{colors.lune}"
---

# Design System: MonPortefolioV2

## Overview

**Creative North Star: « Lanterne »**

Une seule source de lumière : sur chaque écran, une seule chose est éclairée (la phrase, le
chiffre, la capture) et le reste se tait. Le jour est une aube sur pierre claire où la nuit entre
par des « actes de veille » sombres, là où les captures attendent ; la nuit est un clair de lune
bleuté où la lanterne pose un halo ambré sur la zone active. La lanterne du logo devient un
principe de hiérarchie et un geste : on l’allume pour faire tomber la nuit.

Direction retenue par Charles le 13 octobre 2026, avec trois greffes de la direction « Banc
d’essai » : la fiche technique des projets en tableau à filets ; l’index des étiquettes de preuve
et « Voir le projet → » sur chaque carte de la vitrine ; l’acte bleu nuit de « La suite », avec un
aplat bleu roi derrière « Discutons ». Rayons de 4 à 6 px, un seul halo de jour par écran.

**Key Characteristics:**

- Pierre claire le jour, suie bleutée la nuit ; des actes qui changent de lumière à chaque partie.
- Instrument Serif pour la voix et les titres, Instrument Sans pour le texte et les preuves.
- Bleu roi pour ce qui se clique, colza pour un seul chiffre sourcé, lanterne pour la zone éclairée.
- Jour et nuit, clavier, mouvement réduit, impression et lecture sans JavaScript.

**Sources.** Maquette : `design/refonte/c-lanterne/` (README = système, contrastes calculés,
hauteurs mesurées) et les greffes de `design/refonte/b-banc-essai/`. Valeurs livrées :
`site/src/styles/jetons.css` (le seul fichier de valeurs) et `site/src/styles/global.css`. Le code
fait autorité : depuis la maquette, les rayons sont passés de 3 et 12 px à 4 et 6 px, l’acte de
veille de nuit est devenu un bleu nuit franc et deux actes ont été ajoutés (bleu nuit, aplat bleu
roi). Les directions D « Mode d’emploi » (`design/propositions/`) et A « Édition reliée » sont
écartées.

## Colors

Les valeurs normatives sont dans le frontmatter ; les noms préfixés `nuit-` sont les
remplacements du même rôle la nuit. Les mêmes jetons de nuit servent aux actes sombres du jour
(`.acte-veille`, `.acte-bleu`) : tout ce qu’ils contiennent suit sans rien ajouter.

### Primary

- **Bleu roi** (`accent`, `accent-survol`, `accent-texte`) : liens, commandes, focus. Il vient de
  la chemise des quatre photos et reste l’identité. La nuit, la lumière se partage : la lune
  (`nuit-accent`) pour les liens, la lanterne pour l’action principale, le focus et la zone
  éclairée.
- **Lanterne** (`lanterne`, `lanterne-survol`, `lanterne-halo`) : la lumière chaude. Bouton
  principal et focus la nuit, halo de la zone active, flamme de la bascule.

### Secondary

- **Colza** (`surligneur`, `sur-surligneur`) : un seul chiffre sourcé par preuve, et la sélection
  de texte.
- **Laiton** (`laiton`) : marques secondaires des figures le jour (lanterne la nuit).
- **Bleu nuit** (`bleu-nuit` et ses dérivés) : l’acte « La suite » de l’accueil.
- **Aplat bleu roi** (`bleu-roi`, `aplat-roi-*`) : derrière l’appel « Discutons » ; bouton blanc à
  texte bleu roi le jour, lanterne la nuit, focus colza.
- **Erreur** (`erreur`) : erreurs de saisie, toujours avec un mot.

### Neutral

- **Pierre, surface, acte** (`fond`, `surface`, `acte`) : trois paliers tonals le jour (1,16:1 et
  1,19:1).
- **Encre et éteint** (`encre`, `eteint`) : lecture principale et texte secondaire.
- **Trait et filet** (`trait`, `filet`) : le trait porte un état (≥ 3:1) ; le filet ne fait que
  séparer.
- **Veille** (`veille`, `veille-nuit`) : l’acte sombre, la nuit dans le jour.
- **Cadres de capture** (`cadre` et ses dérivés dans `jetons.css`) : les appareils autour des
  captures, indépendants du thème.

**The Single Light Rule.** Une seule zone éclairée par écran (`.foyer`, prop `foyer`) : un seul
halo de jour, une seule lueur de lanterne la nuit.

**The Click Rule.** Le bleu roi (la lune, la nuit) ne porte que ce qui se clique. Numéros,
sur-titres et dates restent en encre ou en éteint.

**The Evidence Rule.** Le colza souligne un seul chiffre sourcé par preuve ; la valeur reste
écrite et lisible, sa source et sa date à côté.

**Contrastes.** Calculés en WCAG 2.x dans `design/refonte/c-lanterne/README.md` et vérifiés par
`site/tests/unit/contrastes.test.ts` : texte ≥ 4,5:1 sur chaque surface et chaque acte, trait
porteur ≥ 3:1. La nuit, les actes restent proches de la suie et sont cernés du trait porteur.

## Typography

**Titres et voix :** Instrument Serif, romain et italique, une seule graisse (jamais de faux gras).
**Texte, interface et données :** Instrument Sans, variable de 400 à 700.

Trois fichiers auto-hébergés (sous-ensemble latin, flèches `→ ↗ ↓` et `≈` compris) dans
`site/src/assets/fonts/`, déclarés dans `site/astro.config.mjs` (`fonts`) et chargés par
`site/src/layouts/Base.astro`. Atkinson Hyperlegible est écartée : son zéro est barré, sans
variante.

- **Affiche** : l’accroche seule, composée phrase par phrase.
- **Titre de page, de section, titre** : Instrument Serif, interlignage serré, `text-wrap:
  balance`. Un seul titre dominant par écran ; le nom est un sur-titre dans le `h1`.
- **Citation** : l’italique d’Instrument Serif, pour les phrases de Charles recopiées mot pour mot.
- **Chapeau, body, small, légende** : Instrument Sans, texte courant de 17 à 18 px, mesure de
  lecture de 35 rem (≈ 62 caractères).
- **Preuve** : les chiffres-preuves (20, 35, 403, 1 289, 153…) en Instrument Sans 600, chiffres
  tabulaires, jamais sous la taille des titres de section. Aucun zéro barré.

Échelle de huit tailles (`--t-xs` à `--t-4xl`), quatre crénages. Aucune taille de texte en dur
hors de `jetons.css` (`site/tests/unit/styles.test.ts`).

**The Legibility Rule.** Les figures et captures gardent leurs légendes, leurs proportions et une
variante lisible à 390 px ; un chiffre n’existe jamais seulement dans une image.

## Layout

Conteneur de 1 344 px, gouttière fluide de 16 à 48 px, espaces de 4 à 96 px. Les grandes sections
sont des **actes** bord à bord (`<Acte ton="pierre|teinte|veille|bleu">`) : chaque changement de
partie d’une page longue change de lumière. Sur l’accueil, chaque chapitre a son acte ; « La suite »
est en bleu nuit. Les pages de consultation (hub, Compétences, Formation, Professionnel) restent
claires et denses.

Navigation de page unique (`NavigationPage`) : colonne collante « Dans cette page » au-delà de
1 100 px, section lue marquée d’un point de lanterne ; en dessous, bouton « Sommaire » dans
l’en-tête et barre de progression de 2 px. Un seul élément collant sur mobile. Points de rupture
principaux : 1 100 px (colonne de navigation) et 860 px (mobile, en-tête de 60 px).

Pages de projet : un gabarit commun (`site/src/components/projets/gabarit/`). L’en-tête tient au
premier écran à 1 440 × 900 (nom canonique, étiquette de preuve, titre, chapeau, actions, visuel,
repères chiffrés, fiche technique en tableau à filets) ; puis un corps libre, « Comment je l’ai
construit », la sortie commune et la note de sources.

## Elevation & Depth

Trois niveaux : aucun, carte (`--ombre-1`), panneau ou carte survolée (`--ombre-2`). La nuit, les
ombres deviennent un filet et un halo de lanterne. La profondeur vient d’abord des actes et des
filets porteurs, puis de la zone éclairée.

## Shapes

Trois rayons : `r1` 4 px (étiquettes, champs, surligneur, focus), `r2` 6 px (cartes, cadres,
captures, emplacements de visuels), `r3` pilule (boutons, bascule). Seuls les cadres de téléphone
dessinent leur propre courbure. Focus : contour de 2 px décalé de 3 px, bleu roi le jour,
lanterne la nuit.

Illustrations : une seule famille, la **gravure en réserve** (trait clair sur fond sombre la nuit,
inversé le jour), deux ou trois aplats séparables recolorés par les jetons, la lanterne comme
seule source de lumière de la scène. Aucun ornement de jeu, aucun cadre doré. Chaque emplacement
est un `<Visuel id>` du registre `site/src/config/visuels.ts`.

## Components

Chaque composant est documenté en tête de son fichier.

- **Coque** (`components/layout/`) : en-tête collant (emblème, navigation, Contact, Menu et
  Sommaire en `<details>`, bascule lanterne), pied de page (pages, e-mail copiable, profils,
  colophon).
- **Bouton** (`ui/Bouton.astro`) : pilule de 48 px, une seule action principale par écran ; bleu
  roi le jour, lanterne la nuit et dans les actes sombres, blanc sur l’aplat bleu roi. Variante
  contour pour les actions publiques.
- **Lien d’action** (`ui/LienAction.astro`) : souligné, cible de 48 px. La flèche suit
  `lib/liens.ts` : `→` page interne, `↓` ancre, `↗` sortie du site ou e-mail.
- **Preuves** (`ui/PreuveChiffree.astro`, `ui/PreuvesChiffrees.astro`, `ui/Surligneur.astro`) :
  un chiffre, ce qu’il compte, sa source et sa date.
- **Captures** (`ui/CadreCapture.astro`, `ui/CaptureAnnotee.astro`, `ui/Visionneuse.astro`) : un
  cadre par type (navigateur, téléphone, terminal) ; cible numérotée, loupe éclairée par la
  lanterne et légende au même numéro ; visionneuse plein écran partagée.
- **Statut** (`ui/Statut.astro`) : une forme et un mot, jamais la couleur seule.
- **À confirmer** (`ui/AConfirmer.astro`) : la marque d’un fait que Charles n’a pas validé.
- **Visuel** (`ui/Visuel.astro`) : l’image du registre, le dessin SVG inséré en ligne, ou, tant
  que le fichier manque, un cadre neutre en ligne et un cadre hachuré qui porte sa commande en
  développement.
- **Vitrine** (`pages/IndexPreuves.astro`, `pages/CarteProjet.astro`, `pages/Vitrine.astro`) :
  l’index des étiquettes de preuve, en bande, une colonne par famille (repliée sous 860 px en
  pastilles numérotées, l’étiquette ne restant que dans le nom du lien), puis une section par
  famille (« Lead et équipe », « Jeu vidéo », « Outils », « IA », titres en `h2`), ses cartes (vedette, ligne ; une famille de trois
  en trois colonnes au-delà de 1 100 px, une carte par ligne entre 861 et 1 100 px), chacune avec
  « Voir le projet → » ; une carte de dépôt privé sans lien public dit « Dépôt privé ». En fin
  de page, le
  volet replié des projets archivés (`vitrine/ArchivesProjets.astro`), avec leurs vignettes ;
  une ancre qui le vise (`#projets-archives`) l’ouvre.
- **Appel** (`pages/AppelDiscutons.astro`) : « Discutons → » vers `/contact`, après un filet ou sur
  l’aplat bleu roi.
- **Gabarit de projet** (`projets/gabarit/`) : `EnTeteProjet`, `FicheProjet`, `CorpsProjet`,
  `SectionProjet`, `DecisionsProjet`, `SortieProjet`, `SourcesProjet`.
- **Backoffice** (`components/backoffice/`, depuis le 14 octobre 2026) : le même système que le
  site, mêmes jetons (`tests/unit/styles.test.ts` le parcourt), styles dans
  `styles/backoffice.css` et, pour l’atelier du blog, `styles/blog-editor.css`, sur les mêmes
  primitives. Une coque autonome (`BackofficePage.astro`, hors `Base.astro` : ni mesure, ni
  en-tête ni pied du site public) ; un en-tête à rubriques non collant (`EnteteBackoffice.astro` :
  emblème, navigation tirée de `rubriques.ts`, bascule lanterne sans mesure, `mesure={false}`
  qui pose `data-sans-mesure`, déconnexion) ; chaque rubrique ouverte par `EnTeteRubrique.astro`
  (un titre en Instrument Serif, une phrase, son action à droite) ; le retour de chaque action
  posé à côté d’elle (`Retour.astro`, région `status`, forme selon `data-state`). Une zone
  éclairée (`.foyer`) par écran : la carte de connexion, la carte de l’accès MCP créé (secret et
  commande à copier), la feuille de rédaction, l’aperçu du résultat de recherche ou la version à
  publier. Dans l’atelier, la barre de l’article (`blog/BarreArticle.astro`) est collante :
  Enregistrer et Aperçu restent à portée. Les images de la rédaction s’affichent comme dans
  l’article publié : taille de leurs attributs, au plus la colonne et 800 px de haut, sur la
  plaque claire des logos. La rubrique Stockage (`RubriqueStockage.astro`) est une page de
  consultation sans zone éclairée : deux cartes (le disque, la base en barre empilée légendée,
  parts distinguées par la valeur et la trame), puis des fiches à filets du plus lourd au plus
  léger ; tailles en base 1000 comme le Finder (`lib/octets.ts`).

### Motion

Une courbe, `cubic-bezier(.2, .7, .2, 1)`, deux durées : 200 ms pour l’interface, 400 ms pour les
scènes. **L’allumage** est la signature : la bascule lanterne s’allume en 400 ms, l’obscurité
tombe depuis les bords et se referme sur elle (View Transitions et masque radial, deux scènes) ;
le retour au jour fait partir la lumière vers les bords. La figure du plafond se trace à son
arrivée, les règles apparaissent de 1 à 3, le système fait circuler des messages en boucle tant
qu’il est visible ; les autres scènes se jouent une fois à leur arrivée, puis se rejouent au clic
ou au clavier. Mouvement réduit : état final complet, sans transition ni allumage ; boucle
suspendue hors écran et dans un onglet masqué.

## Do's and Don'ts

### Do:

- Do écrire toute valeur dans `jetons.css`, jour et nuit, et vérifier ses contrastes.
- Do garder une seule zone éclairée et une seule action principale par écran.
- Do montrer des captures réelles, entières ou annotées, avec leur provenance.
- Do poser chaque illustration par `<Visuel id>`, avec sa consigne complète au registre.
- Do garder le contenu complet sans JavaScript, au clavier, à 390 px et à l’impression.

### Don't:

- Don’t réintroduire D « Mode d’emploi », A « Édition reliée » ni le reste de B ; « mode
  d’emploi » ne reste qu’en clin d’œil (pied de page, 404).
- Don’t ajouter d’ornement, de cadre doré ni de lexique de jeu : la nuit ne doit jamais rappeler
  Nocturne.
- Don’t mettre le bleu roi sur ce qui ne se clique pas, ni surligner deux chiffres d’une preuve.
- Don’t présenter une image générée comme une capture ou une donnée.
- Don’t recadrer une capture au point de masquer ce qu’elle prouve.
