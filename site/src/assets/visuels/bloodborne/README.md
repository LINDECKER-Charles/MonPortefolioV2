# Visuels de Bloodborne Legendary Run

Chaque fichier livré prend une ligne : le prompt exact d’une image générée (sinon « — » et la méthode), la date de livraison et la provenance (master, script, source). Les images générées arrivent par `node tools/separer-calques.mjs <ID>` (dans `site/`), depuis leur master `design/assets/visuels/<série>/<ID>.png` : consigner le rendu et ses trois calques sur la même ligne. Consignes : `docs/visuels-a-generer.md`.

| Fichier | Visuel | Prompt | Date | Provenance |
|---|---|---|---|---|
| `BLR-06.svg` | Le ciel dans un navigateur : une fenêtre sur pied, quatre étoiles reliées, la plus haute allumée par la lanterne posée devant. | — (dessin vectoriel à la main) | 13 octobre 2026 | Dessin vectoriel écrit à la main pour la direction « Lanterne », viewBox 120, trait de 1,6. Lisible de 88 à 120 px. Dessiné le 13 octobre 2026. |
| `BLR-07.svg` | Le ciel dans un téléphone : trois étoiles en chemin qui monte, l’étoile du haut allumée par la lanterne posée à côté. | — (dessin vectoriel à la main) | 13 octobre 2026 | Pendant de BLR-06 : même sol, même lanterne, même trait. Dessiné le 13 octobre 2026. |
| `BLR-08.svg` | Le même ciel, deux écrans : la même constellation dans la fenêtre et dans le téléphone, la lanterne entre eux. | — (dessin vectoriel à la main) | 13 octobre 2026 | Série BLR-08 à BLR-10 : viewBox 440 × 220 dessiné en 220 × 110 (`scale(2)`), même ligne de sol (y = 100), même lanterne à droite du sujet, trait de 1,6. Lisible de 96 à 300 px. Dessiné le 13 octobre 2026. |
| `BLR-09.svg` | Une réussite qui passe par le serveur : une étoile éteinte entre à gauche, traverse trois fiches empilées, ressort allumée et rangée à droite. | — (dessin vectoriel à la main) | 13 octobre 2026 | Série BLR-08 à BLR-10. Dessiné le 13 octobre 2026. |
| `BLR-10.svg` | La partie gardée : une pile de trois disques scellée par une étoile allumée, la lanterne à côté. | — (dessin vectoriel à la main) | 13 octobre 2026 | Série BLR-08 à BLR-10. Dessiné le 13 octobre 2026. |

Les cinq dessins partagent la lanterne de la bascule jour / nuit (GLO-03, grille de 24), le sol
au filet et ses hachures, les hachures de gravure à l’ombre et l’étoile à quatre branches.
Affichés en `<img>` par `<Visuel>`, ils ne lisent pas les jetons du site : leurs couleurs sont
celles des jetons, recopiées dans leur feuille de style interne, et la nuit passe par
`prefers-color-scheme`, qui suit le `color-scheme` de la page (le thème choisi et les actes
sombres), pas seulement celui du système. Aucun texte, aucune marque, aucun visuel du jeu.

Les images à générer de la série (BLR-01, BLR-03 à BLR-05) se déposent ici sous leur nom
attendu (`config/visuels.ts`) ; consigner le prompt, la date et la provenance dans ce tableau.

Les posters des vidéos (BLR-C4) restent dans `public/demos/bloodborne/`, à côté des vidéos ; leur provenance est dans `src/assets/projets/bloodborne/allumages/README.md`.
