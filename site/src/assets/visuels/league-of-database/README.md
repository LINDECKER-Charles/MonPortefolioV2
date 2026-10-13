# Visuels de League Of Data Base

Chaque fichier livré prend une ligne : le prompt exact d’une image générée (sinon « — » et la méthode), la date de livraison et la provenance (master, script, source). Les images générées arrivent par `node tools/separer-calques.mjs <ID>` (dans `site/`), depuis leur master `design/assets/visuels/<série>/<ID>.png` : consigner le rendu et ses trois calques sur la même ligne. Consignes : `docs/visuels-a-generer.md`.

| Fichier | Visuel | Prompt | Date | Provenance |
|---|---|---|---|---|
| `LOD-03.svg` | Piège 1 : une page de registre dont une case découpée laisse voir le vide, un signet posé dedans. | — (dessin vectoriel à la main) | 13 octobre 2026 | Dessin vectoriel écrit à la main pour la direction « Lanterne » : trait constant en `currentColor`, aplat et lumière par jetons (`--surface`, `--laiton`, `--lanterne`) ; seul, en `<img>`, il suit le `color-scheme` de son conteneur (`svg:root` et `prefers-color-scheme`). Grille de 48, trait de 1,75. |
| `LOD-06.svg` | Piège 2 : une bulle vide et pointillée renvoyée par une flèche vers une bulle pleine. | — (dessin vectoriel à la main) | 13 octobre 2026 | Même main que LOD-03. |
| `LOD-07.svg` | Piège 3 : deux gemmes identiques, trait simple et trait double, reliées par un fil à boucle. | — (dessin vectoriel à la main) | 13 octobre 2026 | Même main que LOD-03. |
| `LOD-08.svg` | Piège 4 : une bande de pellicule de trois images vides, l’étiquette de bord vide et barrée. | — (dessin vectoriel à la main) | 13 octobre 2026 | Même main que LOD-03. |
| `LOD-09.svg` | Piège 5 : un éclair frappe un registre fermé, intact, son signet en place. | — (dessin vectoriel à la main) | 13 octobre 2026 | Même main que LOD-03. |
| `LOD-05.svg` | Jalon 1 : une feuille de brouillon froissée puis dépliée, un crayon en travers. | — (dessin vectoriel à la main) | 13 octobre 2026 | Même main que LOD-03, sans lumière. |
| `LOD-10.svg` | Jalon 2 : un carnet ouvert, dix onglets sur la tranche, un ruban marque-page. | — (dessin vectoriel à la main) | 13 octobre 2026 | Même main que LOD-03, sans lumière. |
| `LOD-11.svg` | Jalon 3 : une balance à l’équilibre, une même pile de feuilles sur chaque plateau. | — (dessin vectoriel à la main) | 13 octobre 2026 | Même main que LOD-03, sans lumière. |
| `LOD-12.svg` | Jalon 4 : une porte entrouverte d’où la lumière trace un trapèze au sol. | — (dessin vectoriel à la main) | 13 octobre 2026 | Même main que LOD-03 ; seul picto de la série à porter la lumière. |
