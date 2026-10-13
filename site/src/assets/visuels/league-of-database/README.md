# Visuels de League Of Data Base

Chaque fichier livré prend une ligne : le prompt exact d’une image générée (sinon « — » et la méthode), la date de livraison et la provenance (master, script, source). Les images générées arrivent par `npm run visuels:rendre <ID>` (dans `site/`), depuis leurs deux masters `design/assets/visuels/<série>/<ID>.png` (jour) et `<ID>.nuit.png` (nuit) : consigner le rendu de jour `<ID>_<l>x<h>.webp` et le rendu de nuit `.nuit.webp` sur la même ligne, avec les prompts du jour et de la nuit. Consignes : `docs/visuels-a-generer.md`.

| Fichier | Visuel | Prompt | Date | Provenance |
|---|---|---|---|---|
| `LOD-03.svg` | Piège 1, les runes absentes : une page de registre dont une case découpée, laissée vide, porte un signet. | — (dessin vectoriel à la main) | 13 octobre 2026 | Dessin vectoriel écrit à la main pour la direction « Lanterne », grille de 48, trait de 1,75 en `currentColor`, sans texte. 13 octobre 2026. |
| `LOD-06.svg` | Piège 2, les langues absentes : une bulle vide, en pointillé, renvoyée par une flèche vers une bulle pleine. | — (dessin vectoriel à la main) | 13 octobre 2026 | Même main que LOD-03. |
| `LOD-07.svg` | Piège 3, les objets en double : deux gemmes identiques, l’une en trait plein, l’autre en trait double, reliées par un fil qui fait une boucle. | — (dessin vectoriel à la main) | 13 octobre 2026 | Même main que LOD-03. |
| `LOD-08.svg` | Piège 4, les médias sans version : une bande de pellicule de trois images, son étiquette vide et barrée. | — (dessin vectoriel à la main) | 13 octobre 2026 | Même main que LOD-03. |
| `LOD-09.svg` | Piège 5, l’erreur passagère : un éclair frappe un registre fermé, qui reste intact, son signet en place. | — (dessin vectoriel à la main) | 13 octobre 2026 | Même main que LOD-03. |
| `LOD-05.svg` | Jalon 1, la première version : une feuille de brouillon dépliée, ses plis et ses traits illisibles, un crayon en travers. | — (dessin vectoriel à la main) | 13 octobre 2026 | Même main que LOD-03. |
| `LOD-10.svg` | Jalon 2, les dix décisions : un carnet ouvert, dix onglets sur la tranche, un ruban. | — (dessin vectoriel à la main) | 13 octobre 2026 | Même main que LOD-03. |
| `LOD-11.svg` | Jalon 3, la parité : une balance à l’équilibre, la même pile de feuilles sur chaque plateau. | — (dessin vectoriel à la main) | 13 octobre 2026 | Même main que LOD-03. |
| `LOD-12.svg` | Jalon 4, la bascule : une porte entrouverte dont la lumière trace un trapèze au sol. Seul picto de la série à porter la lumière de la lanterne. | — (dessin vectoriel à la main) | 13 octobre 2026 | Même main que LOD-03. |
| `LOD-02_2100x900.webp`, `LOD-02_2100x900.nuit.webp` | Le voyage dans le temps | Prompts exacts dans le README des masters : [jour](../../../../../design/assets/visuels/league-of-database/README.md#lod-02--jour) et [nuit](../../../../../design/assets/visuels/league-of-database/README.md#lod-02--nuit). | 13 octobre 2026 (masters) ; rendus le 14 octobre 2026 | Masters `design/assets/visuels/league-of-database/LOD-02.png` et `LOD-02.nuit.png`, générés par Codex (outil intégré `image_gen`), la nuit en édition du jour. Rendus par `npm run visuels:rendre LOD-02` aux couleurs de `jetons.css`, WebP qualité 82. |
| `LOD-04_1600x900.webp`, `LOD-04_1600x900.nuit.webp` | Changer de moteur sans perdre personne | Prompts exacts dans le README des masters : [jour](../../../../../design/assets/visuels/league-of-database/README.md#lod-04--jour) et [nuit](../../../../../design/assets/visuels/league-of-database/README.md#lod-04--nuit). | 13 octobre 2026 (masters) ; rendus le 14 octobre 2026 | Masters `design/assets/visuels/league-of-database/LOD-04.png` et `LOD-04.nuit.png`, générés par Codex (outil intégré `image_gen`), la nuit en édition du jour. Rendus par `npm run visuels:rendre LOD-04` aux couleurs de `jetons.css`, WebP qualité 82. |

Classes recolorées par la page (`components/projets/league/PictoLeague.astro`, qui insère le
dessin sans requête) : `p-doux` (filet), `p-pointille`, `p-aplat` (encre diluée), `p-plein`
(encre), `p-creux` et `p-fond` (couleur du fond qui porte le picto), `p-lumiere` (la lanterne).
Les attributs des fichiers gardent un rendu lisible quand on les ouvre seuls.
