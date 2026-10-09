# Captures des projets

Captures utilisées dans le hub et les pages dédiées.
Les cadres et la composition sont réalisés en CSS ; le contenu des interfaces n’est pas redessiné.

## Captures du 8 octobre 2026

- `bloodborne/parcours-desktop.webp` : vrai front Angular local, 1100 × 700, écran
  `/fr/sky`. Sert de vue principale dans la composition.
- `bloodborne/atlas.webp` : le même écran à 390 × 844.
- `bloodborne/constellation.webp` : `/fr/sky/l-arsenal-de-yharnam`, vue d’ensemble,
  à 390 × 844.
- `bloodborne/guide.webp` : `/fr/gallery/entries/father-gascoigne`, à 390 × 844.
- `gup-selection.webp` : vraie `MenuApp` et moteur OpenTUI, scène `packages-select`
  du générateur de captures, exécutée en français dans une copie temporaire de GUP.

Bloodborne tourne depuis le front local avec `front/e2e/mobile-fixtures.cjs` :
objectifs et portraits réels du catalogue, compte et progression d’exemple. Aucun compte réel
n’est utilisé et les chiffres visibles ne sont pas des métriques d’adoption du projet.
GUP utilise les paquets de démonstration du dépôt et n’exécute aucun gestionnaire de paquets.

## Captures historiques de Bloodborne Legendary Run

Deux captures authentiques du journal du projet complètent la page dédiée. Elles ne sont pas
des captures du 8 octobre : leur date est celle conservée dans
`back/src/BloodborneRun.Api/Features/Changelog/Source/changelog.json` du dépôt
`Bloodborne-Legendary-Run`.

- `bloodborne/fiche-objectif.webp` : 780 × 1688, **4 octobre 2026**. Fiche de Rom ouverte
  sous son étoile, critère et bouton d’allumage. Copie de
  `back/src/BloodborneRun.Api/Features/Changelog/Source/captures/full/2026-10-04-achievement-sheet-after.webp`,
  étape `2026-10-04-compact-achievement-sheet` : les onglets en colonne et la précision repliée
  rendent le critère plus lisible sur téléphone.
- `bloodborne/personnages.webp` : 780 × 1688, **6 octobre 2026**. Les cinq emplacements
  du compte sur le profil, avec Gehrman actif, Lady Maria, Eileen et la création d’un personnage.
  Copie de
  `back/src/BloodborneRun.Api/Features/Changelog/Source/captures/full/2026-10-06-roster-after.webp`,
  étape `2026-10-06-character-roster` : le choix du personnage devient visible en place.

Les fichiers WebP ont été vérifiés et inspectés ; ils sont copiés sans retouche. Les chiffres
de progression illustrent une partie et ne mesurent pas l’adoption du projet.

## Autres visuels et conversion

La capture de PvZ Fusion existante est conservée : aucun jeu local n’est disponible pour la
renouveler. `bloodborne/yharnam.webp` provient du visuel déjà utilisé sur la page dédiée ;
ses crédits figurent dans cette page.

Les PNG originaux des nouvelles captures sont convertis en WebP ; les captures historiques
sont déjà dans ce format. Astro produit les tailles adaptées et les AVIF.

## Démonstrations du 9 octobre 2026

- `bloodborne/social-amis.webp` : demande reçue, amis et dernières chasses.
- `bloodborne/social-comparaison.webp` : ciel comparé à Eileen et étoiles turquoise.
- `bloodborne/social-objectif.webp` : Hache de chasseur +9, éteinte pour soi et allumée pour Eileen.
- `bloodborne/social-ajout.webp` : volet code et annuaire, ouvert depuis la légende des amis.

Écrans authentiques du build Angular local disponible du 5 octobre, rejoués dans une copie
SPA temporaire avec les scénarios `front/e2e/friends.cjs`, `friend-comparison.cjs` et
`mobile-fixtures.cjs`. Viewport 390 × 844, DPR 2, fichiers 780 × 1688. Aucun compte réel ni
backend contacté ; seuls le compte et la progression sont simulés. Les screenshots sont
convertis en WebP avec Sharp, sans recomposition de l’interface.

Les quatre allumages mobiles sont dans `public/demos/bloodborne/` : boss, découverte, rune et
gemme, avec MP4, WebM et poster WebP. Chaque vidéo dure 10,4 secondes, sans audio ; le geste,
la cérémonie et le retour à l’étoile allumée sont conservés. Dates, objectifs et contrôles dans
[la provenance des vidéos](../../../public/demos/bloodborne/README.md) et `captures.json`.
Le script `tools/capturer-bloodborne.cjs` permet de les refaire sans modifier le dépôt source.

## Logos techniques

Les logos dans `bloodborne/technos/` sont les SVG officiels, sans redessin :

- Angular : [press kit](https://angular.dev/press-kit), source `angular/angular`,
  `adev/shared-docs/pipeline/tutorials/common/src/assets/angular.svg`. CC BY 4.0,
  attribution Google / Angular team dans les crédits de la page.
- .NET : [dotnet/brand](https://github.com/dotnet/brand), CC0.
- PostgreSQL : [wiki officiel](https://wiki.postgresql.org/wiki/Logo), Slonik trois couleurs.
- Docker : [media resources](https://www.docker.com/company/newsroom/media-resources/), Deep Blue.
- Ionic, Capacitor et GitHub : copies exactes d’Ionicons livré avec le projet Bloodborne,
  licence MIT conservée dans les commentaires XML des fichiers.

## Boutique historique

- `bloodborne/boutique.webp` : capture historique authentique du **6 octobre 2026**, 780 × 1688,
  copiée sans retouche depuis
  `back/src/BloodborneRun.Api/Features/Changelog/Source/captures/full/2026-10-06-shop-purse-after.webp`.
  Étape `2026-10-06-purse-everywhere`, bourse affichée à côté du titre. Premier aperçu
  de la boutique dans la page dédiée, conservé comme capture historique.

Les trois rayons du carrousel ont été capturés le **9 octobre 2026** dans le vrai front
Angular disponible du **5 octobre** (`index.html` : `2026-10-05T11:58:33.835Z`). Le viewport
mobile de 390 × 1100, DPR 2, produit des fichiers de **780 × 2200** : l’interface et les
modèles sont photographiés sans recomposition ni retouche, puis convertis en WebP avec Sharp.

- `bloodborne/boutique-fonds.webp` : `/fr/shop?kind=SKY_BACKGROUND`. Les fonds de galaxie,
  dont Lune pâle sur Yharnam, Ciel de sang pâle et Le Rêve du chasseur.
- `bloodborne/boutique-bannieres.webp` : `/fr/shop?kind=PROFILE_BANNER`. Les bannières de
  profil, dont L’atelier oublié et Le jardin oublié.
- `bloodborne/boutique-portraits.webp` : `/fr/shop?kind=PROFILE_PORTRAIT`. Les portraits de
  profil, dont Adeline, Adella, le Mendiant affligé et Alfred.

Catalogue réel : `back/src/BloodborneRun.Api/Features/Shop/Catalog/shop.json` ; aucune fiche
ni aucun produit n’est ajouté pour ces captures. Les prix suivent le calcul de
`Features/Shop/ShopPricing.cs` sur les étoiles posées et non voilées du JSON courant :
21 769 700 échos au total, budget de 90 %, tarif de 7222 échos par point de valeur et
arrondi inférieur au millier. La Lune pâle vaut ainsi 28K, le Ciel de sang pâle 43K et
Le Rêve du chasseur 72K. Ces tarifs décrivent ce catalogue à la date de la capture.

Les réponses API sont entièrement interceptées, sur le modèle de `front/e2e/shop.cjs`,
`shop-portraits.cjs` et `mobile-fixtures.cjs`. La bourse de 80K et l’état du compte sont des
fixtures locales ; aucun compte réel ni backend n’est utilisé. Les nombres visibles dans
ces écrans ne mesurent pas l’adoption du projet. Les images sont affichées entières dans
le carrousel et restent agrandissables.

Source de la mécanique : `docs/guides/boutique.md`. Les échos gagnés achètent des fonds, des
bannières et des portraits. Les titres sont gagnés par les réussites ; ils ne s’achètent pas.
