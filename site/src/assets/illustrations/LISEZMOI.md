# Planches du site

Masques alpha monochromes (traits opaques sur fond transparent), colorés en CSS par
`src/components/ui/Planche.astro` : bleu le jour, bleu de lune la nuit.

Les originaux sont dans `design/assets/illustrations/` et `design/assets/etudes-de-cas/`.
Ici, ils sont **recadrés sur le dessin**, avec une marge régulière : les originaux gardent
de larges marges pour se poser seuls sur une planche ; dans une marge de 13 rem, ce vide
réduirait le trait à presque rien.

```sh
# Illustrations (originaux 1280×960)
magick design/assets/illustrations/1280x960_<nom>.png -trim +repage \
  -bordercolor none -border 32 site/src/assets/illustrations/<nom>.png

# Couvertures des études de cas (originaux 2400×1000)
magick design/assets/etudes-de-cas/2400x1000_<nom>.png -resize 1200x -trim +repage \
  -bordercolor none -border 40 site/src/assets/etudes-de-cas/<nom>.png
```

`pc-vue-eclatee.svg` est le fichier de `design/assets/illustrations/`, tel quel. Astro
produit les WebP aux largeurs d'affichage au build.

## Figures interactives (2026-10-08)

`FigureGwent.astro` utilise des dessins SVG originaux : silhouettes verticales, doubles cadres et
repères d’angle inspirés des cartes de Gwent, avec le tracé bleu du site. Références officielles
consultées : [Price of Power](https://www.playgwent.com/en/updates/price-of-power) et
[Gwent cards: how they come to life](https://www.playgwent.com/en/news/6591/gwent-cards-how-they-come-to-life).
Les cartes racontent le raisonnement de Charles, sans lui attribuer de carte ni de deck précis.

`FigureCollectif.astro` remplace le graphe de personnes par trois actions explicites du pôle
francophone. Le SVG de chaque carte ou étape est directement enveloppé dans une commande native
accessible au clic, à Entrée et à Espace ; aucun bouton de rejeu séparé ni texte à ouvrir.

Les scènes du récit sont désormais des SVG en plusieurs pièces dans `ScenesOrigine.astro` et
`ScenesSuite.astro` et `SceneLanternes.astro`, affichés par `Illustration.astro`. Leurs animations montrent le démontage du
PC, la plastification d’une carte, l’ouverture du portail, le diplôme, le pupitre et la transmission
d’une flamme. Les scènes se jouent à leur première arrivée dans l’écran puis se rejouent sur le
dessin. Le diplôme reprend la composition d’origine : chronomètre, dossiers et rouleau noué.
Le système d’architecture fait circuler des messages tant qu’il est visible et que
l’onglet est actif. Les anciens masques restent disponibles ; `Planche.astro` sert aux couvertures
statiques des projets. Sans JavaScript, avec mouvement réduit ou à l’impression, tous les dessins
et tous les textes sont complets.
