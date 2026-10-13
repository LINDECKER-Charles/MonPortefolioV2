---
name: "MonPortefolioV2 — Mode d’emploi"
description: "Un manuel clair, des figures et des preuves authentiques."
colors:
  papier: "#f3f5f7"
  blanc: "#ffffff"
  encre: "#14161b"
  graphite: "#59606d"
  bleu: "#1f4fd1"
  bleu-survol: "#173ca6"
  sur-bleu: "#ffffff"
  colza: "#f5d33f"
  sur-colza: "#14161b"
  filet: "#d8dde5"
  trait: "#59606d"
  trait-doux: "#aab2bf"
  pointille: "#b9c0cb"
  voile: "rgb(245 246 248 / 0.92)"
  nuit-papier: "#0e1424"
  nuit-blanc: "#151e33"
  nuit-encre: "#e6eaf2"
  nuit-graphite: "#a3adbf"
  nuit-bleu: "#8fb0ff"
  nuit-bleu-survol: "#b5cbff"
  nuit-sur-bleu: "#0e1424"
  nuit-colza: "#e2c044"
  nuit-sur-colza: "#14161b"
  nuit-filet: "#26304a"
  nuit-trait: "#a3adbf"
  nuit-trait-doux: "#4a5672"
  nuit-pointille: "#3a4664"
  nuit-voile: "rgb(14 20 36 / 0.92)"
  lod-accent: "#075d68"
  lod-pale: "#dceef0"
  lod-ecran: "#081018"
  lod-sur-ecran: "#ffffff"
  lod-nuit-accent: "#72d7df"
  lod-nuit-pale: "#182e3b"
typography:
  display:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "clamp(2.75rem, 1.15rem + 4.6vw, 5.25rem)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  signature:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "clamp(3.5rem, 10vw, 9rem)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-.055em"
  headline:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 1.2rem + 4vw, 4.5rem)"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.022em"
  title:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  chapeau:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "1.3125rem"
    lineHeight: 1.5
  body:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.6
  small:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "1rem"
  caption:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "0.9375rem"
    lineHeight: 1.45
  metadata:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "1rem"
    lineHeight: 1.4
  note:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.45
  button:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.2
  lod-display:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "clamp(2.8rem, 4.6vw, 4.5rem)"
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: "-.035em"
  lod-headline:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "clamp(2.2rem, 3.9vw, 3.5rem)"
    fontWeight: 800
    lineHeight: 1.08
    letterSpacing: "-.03em"
rounded:
  rayon: "4px"
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
  s10: "128px"
  gouttiere: "clamp(24px, 4vw, 56px)"
components:
  button-primary:
    backgroundColor: "{colors.bleu}"
    textColor: "{colors.sur-bleu}"
    rounded: "{rounded.rayon}"
    padding: "11px 22px"
    typography: "{typography.button}"
  button-primary-hover:
    backgroundColor: "{colors.bleu-survol}"
    textColor: "{colors.sur-bleu}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.bleu}"
    rounded: "{rounded.rayon}"
    padding: "11px 22px"
    typography: "{typography.button}"
  button-small:
    padding: "8px 16px"
  button-icon:
    backgroundColor: "transparent"
    textColor: "{colors.encre}"
    rounded: "{rounded.rayon}"
    width: "44px"
    height: "44px"
    padding: "0"
  nav-link:
    textColor: "{colors.graphite}"
  nav-link-current:
    textColor: "{colors.encre}"
  metadata:
    textColor: "{colors.graphite}"
    typography: "{typography.metadata}"
  figure-panel:
    backgroundColor: "{colors.blanc}"
    rounded: "{rounded.rayon}"
    padding: "clamp(10px, 2.4vw, 28px)"
  lod-choice:
    rounded: "{rounded.rayon}"
    padding: "12px 22px"
  lod-choice-selected:
    backgroundColor: "{colors.bleu}"
    textColor: "{colors.sur-bleu}"
---

# Design System: MonPortefolioV2

## Overview

**Creative North Star: "Mode d’emploi"**

Le « Mode d’emploi » validé donne au portfolio la clarté d’un manuel : papier froid, encre nette, figures légendées et annotations au stylo bleu. Atkinson porte la lecture ; Newsreader apporte la voix personnelle. Le logo livre-lanterne reste l’identité de la marque.

Les pages de projets laissent les réalisations occuper l’espace. Les captures authentiques et les figures expliquent les usages ; le texte précise ce que le visuel ne suffit pas à comprendre. Le thème nuit adapte la même hiérarchie sans transformer tout le portfolio en décor de jeu.

**Key Characteristics:**

- Papier et encre, filets fins et espaces généreux.
- Bleu des actions et annotations ; jaune réservé aux preuves.
- Titres nets, notes en italique et médias lisibles.
- Jour et nuit, clavier, mouvement réduit et impression.

Source visuelle actuelle : `site/src/styles/global.css`. Direction confirmée : `docs/brief.md` et `design/propositions/d-mode-d-emploi.html`. Le code fait autorité pour les valeurs livrées : le papier, le conteneur, la gouttière et les titres ont évolué depuis la maquette. Ce document décrit le socle public et l’extension League Of Database ; il n’impose pas un gabarit commun aux études de cas.

## Colors

La palette associe le papier froid et l’encre au bleu roi de l’auteur, avec un jaune colza de surligneur. Les valeurs normatives sont dans le frontmatter ; les noms préfixés `nuit-` sont les remplacements du même rôle.

### Primary

- **Bleu roi** (`bleu`, `bleu-survol`, `sur-bleu`) : commandes, liens, focus, dessins et annotations. En nuit, le bleu devient plus clair et son texte inverse devient sombre.

### Secondary

- **Jaune colza** (`colza`, `sur-colza`) : preuve chiffrée et sélection de texte. Le trait SVG du surligneur s’adapte en hauteur la nuit pour conserver la lisibilité.
- **Pétrole League Of Database** (`lod-accent`, `lod-pale`, `lod-nuit-accent`, `lod-nuit-pale`) : seconde ligne du titre, annotations de langue, dessins techniques et fond de l’atelier de captures. Override local, pas nouvelle palette globale.

### Neutral

- **Papier froid / planche blanche** (`papier`, `blanc`) : fond de page et surfaces des figures.
- **Encre / graphite** (`encre`, `graphite`) : lecture principale et informations secondaires.
- **Filet / traits** (`filet`, `trait`, `trait-doux`, `pointille`) : séparations, cadres de formulaire et construction des figures.
- **Voile** (`voile`) : en-tête translucide, avec flou local.
- **Écran sombre** (`lod-ecran`, `lod-sur-ecran`) : visionneuse plein écran de League Of Database ; indépendant du thème.

**The Blue Ink Rule.** Le bleu porte les liens, commandes, tracés et notes de l’auteur. Le pétrole reste propre à League Of Database.

**The Evidence Rule.** Le surligneur jaune souligne un seul chiffre sourcé par preuve ; la valeur reste écrite et lisible.

## Typography

**Display / Body Font:** Atkinson Hyperlegible Next, puis system-ui et sans-serif.
**Note Font:** Newsreader, puis Georgia et serif ; toujours en italique dans les annotations.

Les deux polices sont locales, configurées dans `site/astro.config.mjs` et chargées par `site/src/layouts/Base.astro`. La sans-serif privilégie des formes différenciées et des titres épais ; la sérif intervient comme une note écrite dans la marge.

- **Display / signature** : le jeton display est le socle ; la grande signature de la couverture possède son rôle distinct, sans être un titre générique de toutes les pages.
- **Headline / title** : titres de chapitres amples, titres internes plus compacts, interlignage serré. Sources : `site/src/components/accueil/Chapitre.astro` et `Couverture.astro`.
- **Body / chapeau / small** : lecture courante, introduction et informations secondaires. Les largeurs de texte sont locales : par exemple 46ch pour la couverture et 43ch pour plusieurs textes League Of Database.
- **Caption / metadata / note** : légende nette, métadonnée discrète et annotation personnelle. La métadonnée de `site/src/components/accueil/Fiche.astro` est aujourd’hui du texte simple, sans capsule.
- **League Of Database** : rôles `lod-display` et `lod-headline` plus resserrés, chiffres tabulaires sur toute l’étude de cas. Les chiffres de comparaison restent de grande taille, avec leur nom de valeur.

**The Legibility Rule.** Les figures et captures gardent leurs légendes, leurs proportions et une variante adaptée à la largeur disponible.

## Layout

Le conteneur partagé atteint 1360px avec la gouttière fluide du frontmatter. Le rythme utilise `s1` à `s10` ; les chapitres du récit emploient `s9` en hauteur. L’en-tête collant mesure au moins 72px et les ancres compensent cette hauteur. Les compositions changent par composant, sans grille universelle imposée.

La navigation principale passe au menu mobile à 1099px ; à 760px, l’en-tête garde le symbole du logo et compacte ses commandes. Les figures dessinées remplacent leur version bureau par une version compacte à 640px. Sources : `site/src/components/layout/Entete.astro`, `MenuMobile.astro` et `site/src/styles/global.css`.

League Of Database conserve des écrans dominants : couverture 3.8fr / 1fr, titres et texte 1.3fr / 1fr, catalogue 2.5fr / 1fr. Les ajustements intermédiaires arrivent à 1050px, puis la composition devient une colonne à 799px. Les sections passent de 88px à 56px de hauteur interne. La capture mobile de couverture et les traductions sont limitées à 382px ; les captures restent entières. L’atelier limite sa hauteur selon le viewport avec une réserve de 260px, portée à 294px sous 399px. Les petits écrans très courts ont aussi leur adaptation. Source : `site/src/styles/league-of-database.css`.

## Elevation & Depth

Le socle repose sur le contraste des surfaces et les filets, plutôt que sur une ombre de carte généralisée. L’en-tête utilise un voile et un flou de 8px. League Of Database ajoute une ombre diffuse sous la capture de couverture ; la visionneuse occupe tout l’écran sur un fond opaque. L’ombre exacte et les transitions sont conservées dans `.impeccable/design.json`, pas dans les tokens du frontmatter.

## Shapes

Le petit rayon partagé est celui des boutons, champs et planches. Les traits de séparation mesurent 1px ; le focus est un contour bleu de 2px, décalé de 3px. Les formes plus rondes répondent à un usage précis : rail Jour / Nuit, pastilles de règles et points de schéma. Le logo livre-lanterne vient des assets existants dans `site/src/assets/marque/`, via `site/src/components/ui/Logo.astro`.

## Components

### Buttons

Commandes nettes, pleines ou en contour. Le bouton standard a une hauteur minimale de 48px ; la variante petite et le bouton carré à icône ont une cible de 44px. Survol bleu plus profond pour le plein, mélange bleu à 9% pour le contour ; transitions de couleur à 150ms. Le focus suit le socle. Source : `site/src/styles/global.css`.

### Cards / Containers

Une planche de figure utilise une surface blanche, un filet et le petit rayon. Les fiches du récit se séparent par des règles et disposent d’une grande zone de média ; elles ne sont pas toutes des cartes encadrées. Sources : `site/src/styles/global.css`, `site/src/components/accueil/Fiche.astro` et `site/src/components/ui/Planche.astro`.

### Navigation

L’en-tête garde une navigation sobre : liens graphite, encre au survol, page courante en gras avec un trait bleu inférieur. Jour / Nuit reste une commande explicite à deux pictogrammes. Le menu mobile conserve la navigation clavier ; l’impression masque les commandes. Source : `site/src/components/layout/Entete.astro`.

### League Of Database — écrans et choix natifs

L’étude de cas montre l’historique par deux captures vérifiées, puis le catalogue, les fiches et les traductions. Les comparaisons, sous-fiches et langues utilisent des groupes de radios natifs et leurs labels, avec sélection bleue et focus reporté sur le label ; ils fonctionnent sans JavaScript. Cette composition reste décrite dans `.impeccable/surfaces/site-src-pages-projets-league-of-database-astro.md`.

Chaque capture garde sa proportion et s’ouvre en grand. La visionneuse utilise `object-fit: contain`, se ferme au clic ou avec Échap et conserve des états d’attente ou d’erreur. À l’impression, toutes les variantes sont visibles. Sources : `site/src/components/projets/CaptureLeague.astro`, `site/src/scripts/league-captures.ts` et `site/src/styles/league-of-database.css`.

Le changement de version apparaît en 220ms ; les labels évoluent en 180ms. Les figures du récit se jouent à leur arrivée puis au clic ou au clavier ; les boucles sont suspendues hors écran ou dans un onglet masqué. Le changement de thème dure 380ms uniquement lorsqu’il est demandé. Avec mouvement réduit, les illustrations restent complètes et les transitions de la surface sont supprimées.

## Do's and Don'ts

### Do:

- Do reprendre les variables du socle et leurs variantes nuit.
- Do utiliser le logo existant et des captures authentiques, avec provenance.
- Do garder les choix, le focus et les légendes visibles au clavier et sur petit écran.
- Do réserver les overrides d’une étude de cas à sa propre surface.

### Don't:

- Don’t réintroduire les directions visuelles écartées dans le portfolio.
- Don’t inventer une preuve chiffrée ou présenter des captures comme une application interactive.
- Don’t faire du pétrole ou de la composition League Of Database une règle de toutes les pages.
- Don’t recadrer une capture au point de masquer l’information qu’elle démontre.
