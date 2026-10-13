# Visuels de l’accueil

Chaque fichier livré prend une ligne : le prompt exact d’une image générée (sinon « — » et la méthode), la date de livraison et la provenance (master, script, source). Les images générées arrivent par `node tools/separer-calques.mjs <ID>` (dans `site/`), depuis leur master `design/assets/visuels/<série>/<ID>.png` : consigner le rendu et ses trois calques sur la même ligne. Consignes : `docs/visuels-a-generer.md`.

| Fichier | Visuel | Prompt | Date | Provenance |
|---|---|---|---|---|
| `ACC-14.svg` | Trois lanternes qui se transmettent la flamme, en calques (`lt-lumiere`, `lt-particule`, `lt-trajet`…) que le site anime en CSS : la première lanterne allumée passe sa flamme à la deuxième, puis à la troisième. | — (dessin vectoriel à la main) | 13 octobre 2026 | Dessin vectoriel écrit à la main, d’après la scène validée le 8 octobre 2026, redessiné pour la direction « Lanterne » (trait en `currentColor`, aplats recolorés par les jetons, gravure des parties métalliques). Repris le 13 octobre 2026. |
| `ACC-17.svg` | Un petit système en plan (poste, service, base de données, livraison) et ses messages, en calques (`sys-aplat`, `sys-hachure`, `sys-paquet`…) que le site anime en boucle en CSS. | — (dessin vectoriel à la main) | 13 octobre 2026 | Dessin vectoriel écrit à la main, d’après la vignette « architecte » du 8 octobre 2026, redessiné pour la direction « Lanterne » (hachures de gravure, messages à la lumière de la lanterne). Repris le 13 octobre 2026. |

Les images à générer de la série (ACC-03, ACC-04, ACC-08, ACC-09, ACC-11, ACC-18 à ACC-23) se déposent ici sous leur nom attendu (`config/visuels.ts`) ; consigner le prompt, la date et la provenance dans ce tableau.
