# Visuels de la page Contact

Chaque fichier livré prend une ligne : le prompt exact d’une image générée (sinon « — » et la méthode), la date de livraison et la provenance (master, script, source). Les images générées arrivent par `npm run visuels:rendre <ID>` (dans `site/`), depuis leurs deux masters `design/assets/visuels/<série>/<ID>.png` (jour) et `<ID>.nuit.png` (nuit) : consigner le rendu de jour `<ID>_<l>x<h>.webp` et le rendu de nuit `.nuit.webp` sur la même ligne, avec les prompts du jour et de la nuit. Consignes : `docs/visuels-a-generer.md`.

| Fichier | Visuel | Prompt | Date | Provenance |
|---|---|---|---|---|
| `CON-PHO_800x1000.webp` | Portrait de Charles devant la friche, en buste (4:5), posé dans la carte d’identité de la page par le composant Portrait (voile de lune et lueur de lanterne la nuit, en CSS). | — (photo réelle) | 13 octobre 2026 | Photo réelle n° 2 de la séance (`design/assets/photos/sources/1536x2304_charles-2.webp`), recadrée (zone 300, 300, 1 080 × 1 350) et redimensionnée, sans autre retouche. Livré le 13 octobre 2026. |

CON-01, CON-02 et CON-03 restent à générer : consignes dans `docs/visuels-a-generer.md`.
