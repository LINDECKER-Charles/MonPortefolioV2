# Visuels de gup

Chaque fichier livré prend une ligne : le prompt exact d’une image générée (sinon « — » et la méthode), la date de livraison et la provenance (master, script, source). Les images générées arrivent par `node tools/separer-calques.mjs <ID>` (dans `site/`), depuis leur master `design/assets/visuels/<série>/<ID>.png` : consigner le rendu et ses trois calques sur la même ligne. Consignes : `docs/visuels-a-generer.md`.

| Fichier | Visuel | Prompt | Date | Provenance |
|---|---|---|---|---|
| `GUP-02.svg` | Les six choix d’ingénierie, en bande de 576 × 96 : cloison étanche, arguments séparés, un seul colis tombé, réveil sans fil, un seul système actif, œil devant deux pastilles contrastées. | — (dessin vectoriel à la main) | 13 octobre 2026 | Dessin vectoriel écrit à la main pour la direction « Lanterne » : trait constant en `currentColor`, aplat et lumière par jetons (`--surface`, `--laiton`, `--lanterne`) ; seul, en `<img>`, il suit le `color-scheme` de son conteneur (`svg:root` et `prefers-color-scheme`). Chaque picto est aussi un `<symbol id="GUP-02-…">`. |

Les écrans réels de gup (GUP-C1) restent dans `src/assets/projets/gup/`, provenance dans son README.
