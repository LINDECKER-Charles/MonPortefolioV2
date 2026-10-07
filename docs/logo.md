# Refonte du logo — un livre, une lanterne dedans

> Brief du 2026-10-07. Le logo remplace le monogramme « CL » prévu pour la direction D et
> l'hexagone `</>#` de la V1. Il s'inscrit dans la [maquette D](../design/propositions/d-mode-d-emploi.html).
> Les règles générales de production sont dans [assets-a-generer.md](assets-a-generer.md#règles).

## L'idée

Un livre, et une lanterne dedans.

- **Le livre**, c'est le mode d'emploi : la direction du site, la documentation, la transmission
  (le formateur), et « je maîtrise d'abord les règles du jeu » — un livre de règles.
- **La lanterne**, c'est la lumière qu'on apporte aux autres (« emmener »), et la nuit du site.
  Pour qui connaît Bloodborne, ce sont aussi les lanternes où l'on revient pour progresser.

La double lecture est voulue : un recruteur y voit « éclairer, transmettre » ; un joueur y voit
le clin d'œil. C'est la touche Bloodborne du site, et elle tient dans un symbole.

## Contraintes de dessin

1. **Lanterne originale** : une lanterne victorienne à main (toit en pointe, anneau de suspension,
   cage à montants fins, vitres). Pas une lanterne de camping, et aucune forme reprise d'un jeu
   (ni réverbère, ni lanterne précise d'une œuvre existante). Les prompts ne nomment aucun jeu.
2. **Style de la direction D** : dessin au trait, épaisseur unique, construit sur une grille de
   64 unités, extrémités et jointures arrondies. La flamme est le seul élément plein.
3. **Couleurs** : trait bleu `#1F4FD1` le jour, `#8FB0FF` la nuit (`currentColor`). Flamme colza
   `#F5D33F` quand la lanterne est allumée, au trait quand elle est éteinte. Le logo réunit ainsi
   les deux couleurs du site.
4. **Lisibilité** : le symbole tient dans un carré. Il reste reconnaissable à 16 px dans une
   version simplifiée : à cette taille, ne garder que la silhouette du livre et la flamme.
5. **Pas de texte dans le symbole.** Le nom vient à côté, dans les déclinaisons avec le nom.
6. **Une couleur possible** : le logo doit tenir en une seule couleur, flamme comprise.

## Étape 1 — Explorations (s'arrêter ensuite et montrer la planche)

Dessiner six pistes en SVG (grille 64), chacune avec une phrase d'intention :

1. **Le creux des pages** : un livre ouvert, la lanterne posée dans la reliure ; sa lumière
   déborde sur les pages.
2. **Les pages pour vitres** : une lanterne dont la cage est un livre ouvert debout ; les pages
   forment les vitres.
3. **La fenêtre** : un livre fermé, de face, avec la lanterne découpée dans la couverture.
4. **Le signet** : le ruban marque-page sort du livre et devient la chaîne d'une petite lanterne
   suspendue.
5. **La flamme née du livre** : un livre ouvert de profil dont les pages, en s'élevant, dessinent
   la flamme.
6. **Piste libre**, dans le même esprit.

Livrable : `design/assets/marque/explorations/piste-<n>.svg` et une planche
`design/assets/marque/explorations/planche.html` qui montre chaque piste :

- à 16, 32, 64 et 256 px ;
- sur papier `#F5F6F8` et sur nuit `#0E1424` ;
- lanterne éteinte et allumée ;
- dans un en-tête de site (symbole suivi de « Charles Lindecker »).

**Arrêter le travail après la planche** : Charles choisit une piste, ou en mélange deux, avant la
finalisation.

Prompts de référence, facultatifs (image d'inspiration avant de dessiner, jamais vectorisée
automatiquement) — suffixe commun : *« Minimal line-art logo, single-weight royal blue strokes,
round caps, the flame as the only filled shape in warm yellow, flat vector, white background,
centred in a square, no text. »*

1. *« An open book with a small Victorian hand lantern standing in its centre fold, light spilling
   onto the pages. »*
2. *« A Victorian hand lantern whose glass panes are the pages of an open book standing upright. »*
3. *« A closed hardcover book seen from the front, a Victorian lantern shape cut out of its cover
   like a window. »*
4. *« A closed book with its ribbon bookmark hanging out and turning into the chain of a small
   Victorian lantern. »*
5. *« An open book in side view whose rising pages curve into a flame. »*

## Étape 2 — Finalisation (après le choix de Charles)

Dans `design/assets/marque/` :

| Fichier | Contenu |
|---|---|
| `logo-symbole.svg` | Le symbole, lanterne éteinte (flamme au trait), `currentColor` |
| `logo-symbole-allume.svg` | Le symbole, flamme pleine colza |
| `logo-horizontal.svg` | Symbole + « Charles Lindecker » (Atkinson Hyperlegible Next 700, texte converti en chemins) |
| `logo-vertical.svg` | Symbole au-dessus du nom, sous-titre « mode d'emploi » en option (fichier séparé `logo-vertical-sous-titre.svg`) |
| `logo-mono.svg` | Une seule couleur, flamme comprise |
| `favicon.svg` | Version simplifiée pour 16 px, `@media (prefers-color-scheme: dark)` interne au SVG |
| `favicon.ico` | 16, 32 et 48 px |
| `apple-touch-icon.png` | 180 px, fond papier `#F5F6F8` |
| `icon-192.png`, `icon-512.png` | Fond papier |
| `icon-maskable-512.png` | Symbole dans la zone sûre centrale de 80 % |
| `site.webmanifest` | Nom « Charles Lindecker », `theme_color` `#1F4FD1`, `background_color` `#F5F6F8` |
| `avatar-400.png` | Symbole allumé sur disque papier, pour les profils (GitHub, LinkedIn) |
| `logo-allumage.html` | Démonstration de l'animation d'allumage (ci-dessous) |
| `charte.html` | La charte d'usage (ci-dessous) |

### L'animation d'allumage

La flamme s'allume : elle passe du trait au plein, grandit de 0,6 à 1 et s'entoure d'un halo
léger, en 600 ms environ (`ease-out`). Elle se déclenche seulement sur une action (jamais au
chargement) : par exemple au passage en mode nuit. En `prefers-reduced-motion`, l'état final
s'affiche sans transition. Réalisation en SVG et CSS, sans bibliothèque.

### La charte d'usage (`charte.html`)

Dans l'esprit du site, le logo a son propre plan de montage :

- la construction sur la grille de 64, avec les cotes ;
- la zone de protection autour du symbole, et les tailles minimales (symbole simplifié dès
  16 px, symbole complet dès 24 px, version horizontale dès 120 px de large) ;
- les couleurs, jour et nuit, éteint et allumé ;
- ce qu'on ne fait pas : ombre, dégradé, contour ajouté, rotation, déformation, couleur hors
  palette ;
- des mises en situation : en-tête du site (jour et nuit), onglet de navigateur, avatar rond, en-tête
  de CV.

## Intégration

- **Maquette D** (`design/propositions/d-mode-d-emploi.html`) : le symbole devant « Charles
  Lindecker » dans l'en-tête et le pied de page ; le bloc du monogramme dans le design system
  remplacé par le logo et un lien vers la charte.
- **Option à faire valider par Charles avant de l'intégrer** : le bouton du mode nuit devient la
  lanterne du logo. Allumer la lanterne fait passer le site en mode nuit, et l'animation
  d'allumage sert de confirmation. La lune (D-05) n'aurait alors plus d'usage.
- Captures de la page à 1440 et 390 px, en jour et en nuit (`?nuit`), servies en HTTP local.
