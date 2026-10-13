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

- `bloodborne/ciel-lisible-avant.webp` et `bloodborne/ciel-lisible-apres.webp` : 780 × 1688,
  **8 septembre 2026**. La Nuit de la chasse avant et après l’étape `2026-09-08-readable-sky`
  (version 12) : les prochaines étapes passent en braise. Copies de
  `back/src/BloodborneRun.Api/Features/Changelog/Source/captures/full/2026-09-08-readable-sky-before.webp`
  et `2026-09-08-readable-sky.webp`, ajoutées le 13 octobre 2026.

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

## League Of Database — 12 octobre 2026

Captures authentiques du [site en production](https://www.league-of-data-base.com),
version affichée **3.0.0**, langue française et patch **16.20.1**. Le crawl ancien du site
et la note de bascule du README du projet ne reflètent plus l’interface observée.
Aucun compte connecté ni fixture, aucune mutation distante. Les données du catalogue,
les illustrations et les vidéos de capacités proviennent de Riot Games.

Les fichiers sont dans `site/public/images/league-of-database/`. Depuis la refonte du
13 octobre 2026, la page en importe des copies identiques depuis
`site/src/assets/projets/league-of-database/` (28 fichiers, octet pour octet) : Astro en
dérive les formats AVIF et WebP, les largeurs servies et l’original agrandi par la
visionneuse partagée. Les originaux publics restent en place tant qu’une autre page les cite.
Les captures de viewport
sont converties en WebP (qualité 94), sans recomposition de l’interface ni retouche.
Les variantes mobiles sont servies dans des éléments `picture` ; le clic agrandit l’écran
réellement affiché. Les viewports restent 1440 × 1000 et 430 × 932, avec un DPR de 2 : la netteté vient des captures natives, sans agrandissement artificiel. La visionneuse de l’application est également montrée dans l’onglet « En grand ».

Les aperçus du dossier `apercus/` sont dérivés de ces mêmes WebP avec Sharp 0.35.5,
sans recadrage ni recomposition : réduction proportionnelle avec `withoutEnlargement: true`,
puis WebP qualité 92. Les captures desktop affichées ont des largeurs de 720, 1440 et
2160 pixels ; leurs variantes mobiles ont un aperçu de 430 pixels. Le téléphone du héros
(`histoire-ahri-mobile`) dispose aussi d’une largeur de 320 pixels. `srcset` et `sizes`
sélectionnent l’aperçu adapté à sa place dans la page et à la densité de l’écran. Les
originaux restent intacts et servent à l’agrandissement, ainsi qu’au lien sans JavaScript.

| Fichier | Route et geste | Dimensions |
|---|---|---|
| `champions.webp` | `/fr/champions`, catalogue et filtres | 2880 × 2000 |
| `ahri.webp` | `/fr/champions/Ahri`, présentation | 2880 × 2000 |
| `ahri-capacites.webp` | même fiche, Q sélectionné et vidéo jouée | 2880 × 2000 |
| `ahri-skins.webp` | même fiche, galerie et chromas chargés | 2880 × 2000 |
| `ahri-skin-detail.webp` | même fiche, premier skin ouvert en grand | 2880 × 2000 |
| `objets.webp` | `/fr/items`, catalogue et recherche | 2880 × 2000 |
| `objet-recette.webp` | `/fr/items/3089-rabadons-deathcap`, recette de Rabadon | 2880 × 2000 |
| `runes.webp` | `/fr/runes/8000-precision`, arbre Précision | 2880 × 2000 |
| `versions-langues.webp` | `/fr/champions`, menu Patch & langue ouvert | 2880 × 2000 |
| `ahri-skin-detail-mobile.webp` | même fiche, premier skin ouvert en grand | 860 × 1864 |
| `ahri-mobile.webp` | `/fr/champions/Ahri`, présentation | 860 × 1864 |
| `ahri-capacites-mobile.webp` | même fiche, Q, vidéo et description | 860 × 1864 |
| `ahri-skins-mobile.webp` | même fiche, galerie et chromas | 860 × 1864 |
| `objets-mobile.webp` | `/fr/items`, liste et recherche | 860 × 1864 |
| `objet-recette-mobile.webp` | fiche de Rabadon, défilement de 250 px pour montrer l’arbre | 860 × 1864 |
| `versions-langues-mobile.webp` | `/fr/champions`, menu ouvert | 860 × 1864 |
| `runes-mobile.webp` | arbre Précision et première rune | 860 × 1864 |

La capture Umami n’est pas disponible : `stats.league-of-data-base.com` mène à une
connexion, et aucun lien de partage public n’est présent dans les sources.
La rubrique montre le trajet de la mesure, sans reproduire ni inventer un dashboard.

### Historique des données — reprise du 12 octobre

Le parcours commence par l’historique, puis les données d’une version réellement consultée.
Les captures `histoire-*` viennent exclusivement des routes publiques explicites du
patch **3.6.14** ; choisir simplement ce patch dans le menu du catalogue courant ne suffisait
pas à garantir le contexte de la liste. La table de l’historique reste sur `/fr/patches`.
Le clic agrandit la véritable variante mobile ou desktop affichée.

Chaque ligne ci-dessous désigne une paire `nom.webp` / `nom-mobile.webp`, respectivement
**2880 × 2000** et **860 × 1864**, DPR 2, WebP qualité 94. Capture de viewport, sans
recomposition de l’interface, compte connecté ni donnée d’exemple.

| Noms des paires | Route et geste |
|---|---|
| `historique-patchs` | `/fr/patches`, tête de l’historique |
| `historique-anciens-patchs` | même page, patch 3.6.14 centré parmi les versions voisines |
| `histoire-champions` | `/fr/3.6.14/champions`, 113 champions du patch |
| `histoire-version` | même catalogue, menu Patch & langue ouvert |
| `histoire-ahri` | `/fr/3.6.14/champions/Ahri`, présentation |
| `histoire-ahri-statistiques` | même fiche, statistiques de base au niveau 1 |
| `histoire-ahri-capacites` | même fiche, Q sélectionné |
| `histoire-skins` | même fiche, galerie des trois apparences du patch |
| `histoire-navigation` | même fiche, liens vers les six patchs précédents |

Les données et les icônes correspondent au patch. Les vidéos de compétences restent celles
de la version actuelle des sorts, comme l’indique l’avertissement de l’application ; elles
ne sont pas présentées comme des vidéos historiques. Les illustrations des skins utilisent
elles aussi des adresses sans patch : c’est la liste d’apparences disponibles qui sert de
preuve historique.

### Retrouver les anciennes valeurs — 13 octobre 2026

Nouvelles captures de la production publique **v3.0.0**, sans compte connecté, fixture,
masque ni modification de l’interface. Le même champion est consulté au niveau **1**
dans les patchs **3.6.14** et **16.20.1**. Les polices et les images visibles sont
chargées avant la capture. La route explicite du patch actuel redirige vers sa route
courte ; le panneau de statistiques et l’en-tête identifient bien **16.20.1**.

| Nom | Route demandée et geste | Dimensions originales desktop / mobile |
|---|---|---|
| `ahri-archive-statistiques` | `/fr/3.6.14/champions/Ahri`, capture native de l’élément `#stats` complet au niveau 1 | 672 × 1302 / 764 × 1302 |
| `ahri-actuel-statistiques` | `/fr/16.20.1/champions/Ahri` → `/fr/champions/Ahri`, même panneau au niveau 1 | 672 × 1302 / 764 × 1302 |
| `ahri-langue-anglaise` | `/en/16.20.1/champions/Ahri` → `/en/champions/Ahri`, présentation de la fiche en anglais | 2880 × 2000 / 860 × 1864 |
| `ahri-langue-coreenne` | `/ko/16.20.1/champions/Ahri` → `/ko/champions/Ahri`, présentation de la fiche en coréen | 2880 × 2000 / 860 × 1864 |

Chaque nom a un original `nom.webp` et une variante `nom-mobile.webp`. Les viewports
restent **1440 × 1000** et **430 × 932**, avec un **DPR de 2**, et les originaux sont
convertis en WebP qualité 94. Les panneaux `*-statistiques` conservent exactement leur
rectangle natif dans l’application, sans agrandissement artificiel ni recomposition.
Le défilement place le panneau entier au-dessus des indicateurs fixes de l’application.
Les captures de viewport ont des aperçus proportionnels qualité 92 dans `apercus/`,
aux largeurs 720, 1440 et 2160 pixels sur ordinateur, et 430 pixels sur mobile.
La couverture `histoire-ahri` du 12 octobre dispose également de ces quatre nouveaux
aperçus ; son aperçu mobile de 320 pixels existant reste disponible.

Valeurs lues dans les deux fiches au niveau 1 :

| Statistique d’Ahri | Patch 3.6.14 | Patch 16.20.1 |
|---|---|---|
| Points de vie | 380 | 590 |
| Dégâts d’attaque | 50 | 53 |
| Armure | 11 | 21 |
| Mana | 230 | 418 |

Les écrans anglais et coréen montrent la même fiche, le même patch et leurs données
localisées (`en_US`, `ko_KR`) ; le nom coréen affiché est « 아리 ». Certains libellés
d’interface restent en anglais dans la locale coréenne. Le périmètre du catalogue est
celui des versions et langues publiées dans **Data Dragon** ; une langue absente d’un
ancien dataset peut se replier sur l’anglais. Les illustrations et vidéos non versionnées
ne constituent toujours pas des preuves de médias historiques.
