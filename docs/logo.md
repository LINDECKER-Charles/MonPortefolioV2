# Refonte du logo — un livre et une lanterne

> Brief du 2026-10-07, sens précisé par Charles le 2026-10-08. Le logo remplace le monogramme « CL » prévu pour la direction D et
> l'hexagone `</>#` de la V1. Il s'inscrit dans la [maquette D](../design/propositions/d-mode-d-emploi.html).
> Les règles générales de production sont dans [assets-a-generer.md](assets-a-generer.md#règles).

## Version retenue et intégration — 2026-10-08

Charles valide la variante minimaliste gothique et demande son intégration au site. Le master
est [logo-gothique.png](../design/assets/marque/livre-lanterne/logo-gothique.png). La silhouette
et la typographie sont celles de cette image ; les exports ne les redessinent pas.

- **En-tête** : emblème à côté du nom, avec le sous-titre du site. Sous 375 px, seul l’emblème
  s’affiche pour garder de la place aux actions ; le lien conserve son nom accessible.
- **Pied de page** : logo complet, emblème au-dessus du nom.
- **Mode nuit** : l’alpha du PNG sert de masque pour l’encre claire ; trois zones de la lanterne
  conservent les couleurs dorées du même fichier. Aucune nouvelle forme n’est générée.
- **Icônes** : favicon PNG 64 px et ICO 16/32/48 px sur fond transparent, conformément à la
  demande de Charles. Le PNG possède une version claire sélectionnée selon la préférence
  sombre du navigateur. Apple 180 px, application 192/512 px et variante maskable avec une
  marge adaptée à la zone sûre. Toutes utilisent l’emblème seul.
- **Partage** : l’image 1200 × 630 reprend le livre et la lanterne.

Les exports web résident dans `site/src/assets/marque/`. Les sources PNG cadrées et les icônes
résident dans `design/assets/marque/`. Le symbole clair `logo-symbole-nuit.png` est un export
du masque du composant en mode nuit, sur fond transparent. Pour reproduire les exports depuis
ces PNG de référence :

```sh
cd site
node tools/preparer-logo.mjs
```

L’image de partage est un rendu de `design/assets/partage/og-mode-d-emploi.html` à 1200 × 630 px,
copié vers `site/public/og/accueil.png`. Aucun événement de mesure n’est ajouté.

## L'idée

Un livre ouvert avec une lanterne gothique en son creux. La composition est validée.

- **Le livre**, c’est d’abord **la connaissance** (précision de Charles du 2026-10-08). Il rejoint
  le mode d’emploi, la documentation et la transmission, sans se limiter au rôle de formateur.
- **La lanterne**, c’est **la lumière qui avance dans l’obscurité**, et un clin d’œil à son amour
  de Bloodborne. Elle évoque le fait d’avancer dans l’inconnu, d’apprendre et de persévérer.

La double lecture est voulue : le livre et la lumière se comprennent sans connaître le jeu ;
un joueur peut y retrouver le clin d’œil. C’est la touche Bloodborne du site, dans un symbole.

### Reprise du 2026-10-08 — le livre ouvert et la lanterne

Le site affiche encore « cl. » ; les six premières pistes sont restées des explorations.
Charles n’est pas convaincu du logo affiché et précise le sens du livre et de la lanterne.

La [planche au trait](../design/assets/marque/livre-lanterne/planche-trait.html) propose une composition
unique : **une lanterne posée au creux d’un livre ouvert**. Le livre reste ample et reconnaissable ;
la poignée, le toit bombé et la cage distinguent la lanterne d’une simple flamme. Le trait garde
la géométrie de la direction D ; le jaune est réservé à la lumière. Le dessin est original.

Les vues jour, nuit, monochrome, éteinte, les petites tailles et une simulation d’en-tête servent
à juger cette proposition avant la finalisation. Source :
`design/assets/marque/livre-lanterne/proposition.svg` ; version simplifiée pour 16 px :
`proposition-simplifiee.svg`. **Proposition à valider, pas un logo final intégré au site.**

### Retour sur le dessin au trait — logo complet en image

Charles précise ensuite : « J’aimerai plutôt que tu me fasses un vrai logo complet pas un SVG ».
Cette demande remplace les contraintes de production SVG ci-dessous, conservées comme historique
des premières explorations.

La nouvelle proposition est **un logo illustré en PNG, sur fond transparent**, composé d’un
emblème et du nom « Charles Lindecker ». Le livre ouvert a une couverture bleu roi et des pages
ivoire ; la lanterne ancienne est travaillée, avec une lumière dorée. Des aplats et des détails
de gravure suggèrent le volume. Le symbole garde une silhouette compacte et claire. Aucun slogan
n’est ajouté.

Le nom peut être inclus dans ce logo complet ; la demande de Charles prime sur la règle
générale « pas de texte dans les visuels ». Les déclinaisons et l’intégration suivent le choix
de cette nouvelle forme.

**Livrable** : [logo illustré complet](../design/assets/marque/livre-lanterne/logo-illustre.png),
PNG RGBA de 1536 × 1024 px, fond transparent vérifié et nom relu. Généré avec ImageGen intégré ;
[prompt exact](../design/assets/marque/livre-lanterne/prompt-logo.txt).
La [planche illustrée](../design/assets/marque/livre-lanterne/planche-illustree.html) affiche l’image sur fond clair
et permet de télécharger le PNG. Cette proposition reste à évaluer par Charles.

### Affinement — minimalisme et caractère gothique

Charles juge la version illustrée « pas mal », mais trouve qu’elle manque de caractère. Il
demande « plus minimaliste et une touche gothique pour le côté bloodborne ».

La nouvelle variante garde le livre, la lanterne et le nom, en réduisant les textures, les
reflets métalliques et les détails des pages. Le caractère vient des masses, des espaces vides,
du toit pointu de la lanterne et d’une typographie à empattements anguleux. La palette se
concentre sur l’encre bleu nuit et la lumière dorée. Le logo reste livré en PNG sur fond
transparent. La touche gothique concerne cette marque ; la direction du site demeure D,
« Mode d’emploi ».

**Livrable actuel** : [logo minimaliste gothique](../design/assets/marque/livre-lanterne/logo-gothique.png),
PNG RGBA de 1536 × 1024 px, fond transparent vérifié et nom relu. ImageGen intégré a transformé
le logo illustré de référence ; [prompt exact](../design/assets/marque/livre-lanterne/prompt-logo-gothique.txt).
La [planche actuelle](../design/assets/marque/livre-lanterne/planche.html) affiche cette variante
sur fond clair, avec un lien vers la version précédente. **Variante validée par Charles.**

## Historique — contraintes des explorations SVG

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

## Historique — premières explorations SVG

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

## Historique — finalisation envisagée pour les SVG

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
