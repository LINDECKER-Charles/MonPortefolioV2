# Visuels des états (404, maintenance)

Chaque fichier livré prend une ligne : le prompt exact d’une image générée (sinon « — » et la méthode), la date de livraison et la provenance (master, script, source). Les images générées arrivent par `npm run visuels:rendre <ID>` (dans `site/`), depuis leurs deux masters `design/assets/visuels/<série>/<ID>.png` (jour) et `<ID>.nuit.png` (nuit) : consigner le rendu de jour `<ID>_<l>x<h>.webp` et le rendu de nuit `.nuit.webp` sur la même ligne, avec les prompts du jour et de la nuit. Consignes : `docs/visuels-a-generer.md`.

| Fichier | Visuel | Prompt | Date | Provenance |
|---|---|---|---|---|
| `ERR-PHO_800x1000.webp` | Portrait de Charles, le regard tourné vers la gauche, en buste (4:5), posé en médaillon dans la colonne du titre de la 404, à côté de l’illustration, par le composant Portrait. | — (photo réelle) | 13 octobre 2026 | Photo réelle n° 1 de la séance (`design/assets/photos/sources/1536x2304_charles-1.webp`), recadrée (zone 60, 330, 1 440 × 1 800) et redimensionnée, sans autre retouche. Livré le 13 octobre 2026. La n° 3 sert au Parcours. |
| `ERR-01_1280x960.webp`, `ERR-01_1280x960.nuit.webp` | La page qui manque : un manuel ouvert, une page arrachée | Prompts exacts dans le README des masters : [jour et nuit](../../../../../design/assets/visuels/etats/README.md#err-01). | 13 octobre 2026 (masters) ; rendus le 14 octobre 2026 | Masters `design/assets/visuels/etats/ERR-01.png` et `ERR-01.nuit.png`, générés par Codex (outil intégré `image_gen`), la nuit en édition du jour. Rendus par `npm run visuels:rendre ERR-01` aux couleurs de `jetons.css`, WebP qualité 82. Masters retouchés le 14 octobre 2026 (« Retouches déterministes » du [README des masters](../../../../../design/assets/visuels/etats/README.md)), rendus refaits. |

ERR-02 (la lanterne éteinte, dessin vectoriel « élargi ») reste à produire : consignes dans `docs/visuels-a-generer.md`.
