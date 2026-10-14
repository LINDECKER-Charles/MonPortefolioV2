# Polices du site

Deux familles de la direction « Lanterne », sous licence SIL Open Font License 1.1 (textes
joints), auto-hébergées : aucune requête vers un service de polices tiers. Trois fichiers, ≈ 80 Ko
en tout.

| Fichier | Famille | Rôle | Axes conservés | Poids |
|---|---|---|---|---|
| `instrument-sans-latin-wght.woff2` | Instrument Sans | texte courant, interface, données et chiffres-preuves (graisse 600, chiffres tabulaires) | `wght` 400 à 700 | ≈ 37 Ko |
| `instrument-serif-latin.woff2` | Instrument Serif, romain | titres, une seule graisse | — | ≈ 22 Ko |
| `instrument-serif-italic-latin.woff2` | Instrument Serif, italique | la voix : citations, dates de scène, sur-titres | — | ≈ 22 Ko |

Aucune des deux n’a de zéro barré. Atkinson Hyperlegible Next et Newsreader, polices de la
direction précédente, ont été retirées : plus rien ne les utilise (le backoffice lit
`--police-texte`, désormais Instrument Sans).

## Comment ils ont été produits

Sources : les fichiers complets du dépôt `google/fonts` (`ofl/instrumentsans/InstrumentSans[wdth,wght].ttf`,
`ofl/instrumentserif/InstrumentSerif-Regular.ttf` et `InstrumentSerif-Italic.ttf`), traités par
`site/tools/preparer-polices.py` (fontTools 4.66) :

```sh
python3 -m venv venv && venv/bin/pip install fonttools brotli
venv/bin/python -I site/tools/preparer-polices.py <dossier des sources> site/src/assets/fonts
```

Le script :

1. fixe la chasse d’Instrument Sans à 100 % (l’axe `wdth` n’est pas utilisé) et garde `wght` ;
2. complète ce qui manque aux sources mais que le site affiche :
   - l’espace fine insécable (U+202F) et l’espace fine (U+2009) pointent vers l’espace insécable de
     la police (0,2 em en Sans, 0,17 em en Serif) ;
   - `≈` (U+2248) est composé de deux tildes de la police, centrés sur l’axe du signe `=` ;
   - les flèches `← ↑ → ↓ ↔ ↕ ↖ ↗ ↘ ↙` de la Serif reprennent le dessin de la Sans en
     graisse 400 (même famille, même unité de 1 000) ;
3. découpe le sous-ensemble ci-dessous, toutes fonctions OpenType conservées (`tnum`, `case`…), en
   woff2.

```
U+0020-007E,U+00A0-00FF,U+0131,U+0152-0153,U+0178,U+02C6,U+02DA,U+02DC,U+2009,U+2010-2015,
U+2018-201E,U+2022,U+2026,U+202F,U+2039-203A,U+20AC,U+2122,U+2190-2199,U+2212,U+2248
```

La plage couvre le français complet (accents, `œ`, guillemets, apostrophe typographique, espaces
insécables et fines), les tirets, `€`, `−`, `≈` et les flèches de la grammaire du site (`→` page
interne, `↓` ancre, `↗` sortie du site). Un caractère hors plage s’affiche dans la police de
repli : l’ajouter à la plage et régénérer plutôt que de le contourner dans le texte. Les noms
étrangers en d’autres écritures (chinois, coréen) restent volontairement à la police du système.
