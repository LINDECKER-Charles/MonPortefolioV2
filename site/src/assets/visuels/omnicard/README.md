# Visuels d’Omnicard

Chaque fichier livré prend une ligne : le prompt exact d’une image générée (sinon « — » et la méthode), la date de livraison et la provenance (master, script, source). Les images générées arrivent par `node tools/separer-calques.mjs <ID>` (dans `site/`), depuis leur master `design/assets/visuels/<série>/<ID>.png` : consigner le rendu et ses trois calques sur la même ligne. Consignes : `docs/visuels-a-generer.md`.

| Fichier | Visuel | Prompt | Date | Provenance |
|---|---|---|---|---|
| `OMN-04.svg` | Le serveur arbitre : deux fenêtres de navigateur envoient leur action à une table d’arbitre éclairée par la lanterne, qui leur renvoie l’état de la partie. | — (dessin vectoriel à la main) | 13 octobre 2026 | Dessin vectoriel écrit à la main pour la direction « Lanterne » : trait constant en `currentColor`, aplat et lumière par jetons (`--surface`, `--laiton`, `--lanterne`) ; seul, en `<img>`, il suit le `color-scheme` de son conteneur (`svg:root` et `prefers-color-scheme`). viewBox 640 × 360 ; cartes génériques, sans illustration. |
