# Captures de GitHealth (14 octobre 2026)

Vraies vues de **GitHealth**, l’application de bureau du dépôt public
[`LINDECKER-Charles/App.GitHealth`](https://github.com/LINDECKER-Charles/App.GitHealth), lancée en
local sur des dépôts Git de démonstration fabriqués pour l’occasion. L’interface n’est ni retouchée
ni recomposée : aucun texte n’a été remplacé. Elle est en anglais, comme l’application.

## Version capturée

L’état de la branche `dev` à la révision **`bd2e5c9`**
(`bd2e5c9743cea30ff64498830191ed0d49ecfe52`, 16 septembre 2026), et non le tag `v0.2.0`
(`4cd740d`, 14 septembre 2026). Le build vient d’une copie du dépôt, publiée en `osx-arm64`
autonome (`dotnet publish`, Release). Le badge de l’application affiche **0.2.0** : la version n’a
pas changé depuis la release. Deux éléments de `dev`, absents de la 0.2.0 publiée, sont visibles
sans être ouverts :

- l’icône engrenage (Settings) de la barre du haut, à droite de l’icône de téléchargement (écran
  de l’accès à une API locale), sur les six captures ;
- l’en-tête de la section « Scheduled scan » (scans planifiés), en bas de `politique.webp`. La page
  le recadre ; il ne reste visible que dans la visionneuse.

Les écrans qu’ils ouvrent ne sont pas capturés. Tout le reste de ce que montrent les captures existe
dans la 0.2.0 publiée (notes de version et guide de l’utilisateur, à la révision `4cd740d`).

## Méthode

1. Application lancée sans fenêtre (`githealth --no-browser --port <port> --data-dir <dossier de
   démonstration>`), avec un environnement vidé et un dossier personnel de démonstration : une
   base SQLite neuve, jamais la base réelle de l’utilisateur.
2. Dépôts ajoutés et analysés par l’interface (clics et saisies seulement), chemins saisis à la
   main : le sélecteur de dossiers qui parcourt le disque n’a jamais été ouvert.
3. Chromium headless (Playwright 1.63), `deviceScaleFactor` 2, `reducedMotion: 'reduce'` (pas
   d’introduction, état final des transitions), thème clair, souris sortie de la zone utile avant
   chaque prise. Fenêtre de 1440 × 900 px CSS (2880 × 1800 px), sauf la fiche de branche et la
   carte de topologie, prises à 1600 × 1000 px CSS (3200 × 2000 px) pour que la barre d’outils et
   les libellés de la carte tiennent sans chevauchement.
4. Chaque PNG converti en WebP qualité 88 avec Sharp, ramené à 2400 px de large, sans recadrage ni
   retouche. `vitrine-fiche-branche.webp` est le seul recadrage : le panneau de la fiche de branche,
   extrait des pixels d’origine de la même capture.

## Données de démonstration

- **Auteurs fictifs**, tous en `@example.invalid` : Alice Martin (alias « A. Martin », fusionné par
  `.mailmap`), Bruno Keller, Chloé Weber, Dario Rossi, Emma Laurent. Configuration Git de
  l’utilisateur neutralisée : ni signature, ni hook, ni identité réelle.
- **`atlas-web`** : 18 branches locales, dont `main`, datées par rapport au jour du semis pour que
  les verdicts restent stables, couvrant tous les verdicts ; `release/1.0` et `release/1.1` sont
  rendues « Excluded » par le motif protégé `refs/heads/release/*`. Un dépôt nu local sert
  d’`origin`, sans aucun réseau.
- **`atlas-platform`** : copie d’`atlas-web` plus 152 branches `ticket/ATL-401` à `ATL-552`, pour
  que l’analyse dure assez longtemps pour être prise en cours.
- **`atlas-mobile`** : un tronc de 72 commits et neuf branches ouvertes à des moments différents,
  pour la carte de topologie.
- **`atlas-docs`** : un petit dépôt de trois branches, pour que la liste des dépôts ne soit pas vide.

Tous les chemins affichés sont sous `/private/tmp/demo-githealth/`. L’assistant de l’application
n’a pas été lancé, et l’écran de l’API locale n’a pas été ouvert : aucun jeton n’a été émis.

## Les fichiers

| Fichier | Capture d’origine | Dimensions | Scène | Usage |
|---|---|---|---|---|
| `diagnostic.webp` | 1440 × 900 CSS | 2400 × 1500 | Diagnostic d’`atlas-web` : 17 branches, tuiles Keep 4, Done 2, Review 6, Cleanup possible 2, Excluded 3 | En-tête de `/projets/githealth` |
| `fiche-branche.webp` | 1600 × 1000 CSS | 2400 × 1500 | Fiche de `feature/advanced-search` : « Review », trace des règles, avance et retard | § Les verdicts |
| `politique.webp` | 1440 × 900 CSS | 2400 × 1500 | Politique saisie, pas encore enregistrée : effet projeté Review −3, Excluded +3 | § La politique (recadrée au-dessus de « Scheduled scan ») |
| `analyse-en-cours.webp` | 1440 × 900 CSS | 2400 × 1500 | Première analyse d’`atlas-platform`, prise à 106 branches sur 169 (étape 2 sur 5) | § L’analyse en direct |
| `carte-topologie.webp` | 1600 × 1000 CSS | 2400 × 1500 | Carte de topologie d’`atlas-mobile`, filtre « Open » : neuf branches divergées | § Les visualisations (recadrée sous la carte) |
| `registre-activite.webp` | 1440 × 900 CSS | 2400 × 1500 | Registre d’activité d’`atlas-web` : bandes de 30 et 90 jours, verdicts recalculés | § Les visualisations |
| `vitrine-fiche-branche.webp` | fiche de branche | 806 × 1205 | Le panneau de la fiche de branche seul (verdict, règles, avance et retard) | Carte de la vitrine, `/projets` |

## Défauts réels de l’application, laissés tels quels

- Dans la fiche de branche, la règle de topologie (`git merge-base --is-ancestor + git rev-list
  --count`) est plus large que le panneau : la commande passe à la ligne après `--`. La loupe de la
  page montre l’âge et la conclusion, pas cette ligne.
- Dans `diagnostic.webp` et `registre-activite.webp`, la dernière ligne visible est coupée par le
  bas de la zone qui défile ; dans `analyse-en-cours.webp`, la première, parce que la liste défile
  pendant l’analyse.
- Dans `politique.webp`, les textes indicatifs des champs de motif sont tronqués.
- La carte de topologie ne montre aucune branche en avance sans retard : leurs libellés
  chevauchent les traits voisins dans la version capturée. Le dépôt `atlas-mobile` est semé pour
  contourner ce défaut, sans le corriger.

Les nombres visibles (branches, commits, durées) viennent des dépôts de démonstration et ne
mesurent aucun usage réel.
