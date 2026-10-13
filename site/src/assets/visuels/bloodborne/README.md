# Visuels de Bloodborne Legendary Run

Chaque fichier livré prend une ligne : le prompt exact d’une image générée (sinon « — » et la méthode), la date de livraison et la provenance (master, script, source). Les images générées arrivent par `node tools/separer-calques.mjs <ID>` (dans `site/`), depuis leur master `design/assets/visuels/<série>/<ID>.png` : consigner le rendu et ses trois calques sur la même ligne. Consignes : `docs/visuels-a-generer.md`.

| Fichier | Visuel | Prompt | Date | Provenance |
|---|---|---|---|---|
| `BLR-06.svg` | L’application web : une fenêtre de navigateur, quatre étoiles reliées, la plus haute éclairée par la lanterne. | — (dessin vectoriel à la main) | 13 octobre 2026 | Dessin vectoriel écrit à la main pour la direction « Lanterne » : trait constant en `currentColor`, aplat et lumière par jetons (`--surface`, `--laiton`, `--lanterne`) ; seul, en `<img>`, il suit le `color-scheme` de son conteneur (`svg:root` et `prefers-color-scheme`). viewBox 120. |
| `BLR-07.svg` | L’application Android : un téléphone, trois étoiles qui montent, la plus haute éclairée. | — (dessin vectoriel à la main) | 13 octobre 2026 | Pendant de BLR-06. |
| `BLR-08.svg` | La couche « L’interface » : une fenêtre et un téléphone montrent la même constellation, la lanterne entre eux. | — (dessin vectoriel à la main) | 13 octobre 2026 | viewBox 440 × 220 ; série BLR-08 à BLR-10, même ligne de sol, même lanterne. |
| `BLR-09.svg` | La couche « L’API » : une étoile passe par une pile de trois fiches et ressort rangée. | — (dessin vectoriel à la main) | 13 octobre 2026 | Série BLR-08 à BLR-10. |
| `BLR-10.svg` | La couche « La sauvegarde » : une pile de trois disques scellée par une étoile allumée. | — (dessin vectoriel à la main) | 13 octobre 2026 | Série BLR-08 à BLR-10. |

Les posters des vidéos (BLR-C4) restent dans `public/demos/bloodborne/`, provenance dans son README.
