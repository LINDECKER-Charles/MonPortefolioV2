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

**Depuis la refonte « Lanterne » (13 octobre 2026)**, les scènes de l’accueil ne sont plus
dessinées au trait bleu de l’ancienne direction : leurs images sont des emplacements du registre
`src/config/visuels.ts`, à générer dans le style « Lanterne » (gravure en réserve, la lanterne
seule source de lumière). Le PC, les cartes plastifiées, les portes, le diplôme et le pupitre sont
ACC-03, ACC-04, ACC-08, ACC-09 et ACC-11 ; les illustrations des trois cartes de Gwent, ACC-18 à
ACC-20 ; les trois temps du pôle, ACC-21 à ACC-23. Chaque scène reste rejouable au clic et au
clavier (`components/accueil/Scene.astro`) : la lumière part de la place de la lanterne que la
consigne impose à l’image. Le cadre des cartes de Gwent, inspiré de leur silhouette (références :
[Price of Power](https://www.playgwent.com/en/updates/price-of-power) et
[Gwent cards: how they come to life](https://www.playgwent.com/en/news/6591/gwent-cards-how-they-come-to-life)),
reste codé dans `FigureGwent.astro`, aux couleurs des jetons. Le système qui communique en boucle
et les lanternes qui se transmettent la flamme sont des fichiers SVG à calques,
`src/assets/visuels/accueil/ACC-17.svg` et `ACC-14.svg`, insérés et animés par
`SceneSysteme.astro` et `SceneLanternes.astro`. Les fichiers de ce dossier restent en place ; sans
JavaScript, avec mouvement réduit ou à l’impression, tous les dessins et tous les textes sont
complets.
