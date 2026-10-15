# PIC-03 — Logos officiels des réseaux

Sources consultées et fichiers récupérés le 2026-10-07. Les chemins sont repris à l’identique ; seuls l’enveloppe SVG, les titres accessibles, les commentaires et le mode de sélection d’une couleur autorisée changent.

| Fichier | Source officielle du dessin | Règle de marque |
|---|---|---|
| `linkedin.svg` | Sprite SVG lié par la page officielle [in] Logo : [icons.svg](https://delivery-p143253-e1476319.adobeaemcloud.com/adobe/assets/urn:aaid:aem:cdd21f1b-fa7e-4cb1-951b-310afb840af2/original/as/icons.svg), symbole `app-linkedin-bug-black-icon` | [LinkedIn — [in] Logo](https://brand.linkedin.com/in-logo) : usage permis comme lien vers le profil ou dans une série de réseaux ; noir, blanc ou bleu officiel uniquement. La planche retient noir/blanc. |
| `github.svg` | [GitHub_Logos.zip](https://brand.github.com/GitHub_Logos.zip), `GitHub Logos/SVG/GitHub_Invertocat_Black.svg` | [GitHub — Logo](https://brand.github.com/foundations/logo) : bouton vers un profil/projet permis, pas de modification du dessin ni d’affiliation implicite. La planche utilise uniquement les variantes noir/blanc. |
| `npm.svg` | [npm-logo-black.svg](https://raw.githubusercontent.com/npm/logos/master/npm%20logo/npm-logo-black.svg), dépôt officiel [npm/logos](https://github.com/npm/logos) | [npm — Logos and Usage](https://docs.npmjs.com/policies/logos-and-usage/) : permission préalable requise pour l’usage du logo, y compris nominatif. Fichier préparé pour revue locale ; ne pas le publier sans permission. Couleur officielle `#231F20` conservée. |

`linkedin.svg` et `github.svg` utilisent `currentColor` pour sélectionner le noir ou le blanc. Ne pas appliquer le bleu du portfolio ni une autre teinte. Leur couleur par défaut en fichier autonome suit `prefers-color-scheme` : noir le jour, blanc la nuit. Dans un SVG intégré au HTML, définir explicitement `color: #000` ou `color: #fff` sur le conteneur.

Respecter le ratio et la zone libre autour des marques. La planche réserve une marge de 16 px et affiche LinkedIn à 32 px (marque de 27,2 px), puis 64 px ; GitHub à 32/64 px. Le mot-symbole npm garde son ratio 780:250, à 24/48 px de hauteur, sur un support clair dans les deux thèmes afin de conserver sa couleur officielle.

npm is a registered trademark of npm, Inc.
