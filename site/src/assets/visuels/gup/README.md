# Visuels de gup

Chaque fichier livré prend une ligne : le prompt exact d’une image générée (sinon « — » et la méthode), la date de livraison et la provenance (master, script, source). Les images générées arrivent par `node tools/separer-calques.mjs <ID>` (dans `site/`), depuis leur master `design/assets/visuels/<série>/<ID>.png` : consigner le rendu et ses trois calques sur la même ligne. Consignes : `docs/visuels-a-generer.md`.

| Fichier | Visuel | Prompt | Date | Provenance |
|---|---|---|---|---|
| `GUP-02.svg` | Les six choix d’ingénierie, en bande de 576 × 96 : une cloison étanche, des arguments en blocs séparés, un seul colis tombé de son tapis, un réveil sans fil, un seul ordinateur actif sur trois, un œil devant deux pastilles contrastées. | — (dessin vectoriel à la main) | 13 octobre 2026 | Dessin vectoriel écrit à la main pour la direction « Lanterne » : trait de 2 en `currentColor`, un accent (classe `accent`) au plus par picto, hachures tracées sans motif ni identifiant. Chaque picto est un groupe de classe `GUP-02-…` (cloison, arguments, colis, reveil, systemes, lisible). `components/projets/gup/PictosChoix.astro` l’insère dans la page, décoratif, et recolore l’accent à la lanterne du thème. |

Les écrans réels de gup (GUP-C1) restent dans `src/assets/projets/gup/`, provenance dans son README.
