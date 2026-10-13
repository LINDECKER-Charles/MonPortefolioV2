# Visuels d’Omnicard

Chaque fichier livré prend une ligne : le prompt exact d’une image générée (sinon « — » et la méthode), la date de livraison et la provenance (master, script, source). Les images générées arrivent par `node tools/separer-calques.mjs <ID>` (dans `site/`), depuis leur master `design/assets/visuels/<série>/<ID>.png` : consigner le rendu et ses trois calques sur la même ligne. Consignes : `docs/visuels-a-generer.md`.

| Fichier | Visuel | Prompt | Date | Provenance |
|---|---|---|---|---|
| `OMN-04.svg` | Le serveur arbitre : deux fenêtres de navigateur, chacune avec la main du joueur face visible et la main adverse en dos de cartes, envoient leur action à la table d’arbitre, qui est le serveur ; l’état de la partie leur revient en pointillé. | — (dessin vectoriel à la main) | 13 octobre 2026 | Dessin vectoriel écrit à la main pour la direction « Lanterne », viewBox 320 × 180 (16:9), trait de 1,3 en `currentColor`, cartes génériques sans illustration ; la lanterne est la seule lumière. Calques recolorés par `components/projets/omnicard/ServeurArbitre.astro`, qui l’insère dans la page avec l’alt du registre : `oa-aplat` (surface), `oa-fin` et `oa-hachure` (filet), `oa-halo` et `oa-flamme` (lanterne), `oa-voyant` et `oa-etat` (laiton). |
