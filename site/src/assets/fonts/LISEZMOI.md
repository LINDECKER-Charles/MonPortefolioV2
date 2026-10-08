# Polices du site

Deux familles, sous licence SIL Open Font License 1.1 (textes joints), auto-hébergées :
aucune requête vers un service de polices tiers.

| Fichier | Famille | Rôle | Axes conservés | Poids |
|---|---|---|---|---|
| `atkinson-hyperlegible-next-latin-wght.woff2` | Atkinson Hyperlegible Next | tout le texte | `wght` 400 à 800 | ≈ 26 Ko |
| `newsreader-italic-400-latin-opsz.woff2` | Newsreader, italique | la voix de l'auteur : notes, citations, annotations | `opsz` 12 à 48, `wght` figé à 400 | ≈ 60 Ko |

## Comment ils ont été produits

Sources : les fichiers variables complets du dépôt `google/fonts`
(`ofl/atkinsonhyperlegiblenext/AtkinsonHyperlegibleNext[wght].ttf` et
`ofl/newsreader/Newsreader-Italic[opsz,wght].ttf`). Les sous-ensembles de Fontsource
ont été écartés : il leur manque `≈` (U+2248), qu'affichent les chiffres clés.

```sh
U="U+0020-007E,U+00A0-00FF,U+0131,U+0152-0153,U+0178,U+02C6,U+02DA,U+02DC,U+2009,U+200B,U+2010-2015,U+2018-201E,U+2022,U+2026,U+202F,U+2039-203A,U+20AC,U+2122,U+2212,U+2248"

fonttools varLib.instancer 'AtkinsonHyperlegibleNext[wght].ttf' wght=400:800 -o atk.ttf
pyftsubset atk.ttf --unicodes="$U" --layout-features='*' --flavor=woff2 \
  --output-file=atkinson-hyperlegible-next-latin-wght.woff2

fonttools varLib.instancer 'Newsreader-Italic[opsz,wght].ttf' wght=400 opsz=12:48 -o news.ttf
pyftsubset news.ttf --unicodes="$U" --layout-features='*' --flavor=woff2 \
  --output-file=newsreader-italic-400-latin-opsz.woff2
```

La plage couvre le français complet (accents, `œ`, guillemets, apostrophe typographique,
espaces insécables), les tirets, `€`, `−` et `≈`. Un caractère hors plage s'affiche dans la
police de repli : l'ajouter à `U` et régénérer plutôt que de le contourner dans le texte.
