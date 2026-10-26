# MonPortefolioV2

Portfolio personnel de Charles Lindecker, version 2. Il remplace la V1
([`MonPortfolio`](https://github.com/LINDECKER-Charles/MonPortfolio)), qui sera archivée sur un
sous-domaine.

## État du projet

**Récit validé (2026-10-07). Direction visuelle D « Mode d'emploi » (2026-10-07), remplacée par
C « Lanterne » le 2026-10-13.
Accueil codé en Astro (2026-10-07) : `site/`, avec la page Mentions légales, la 404, l'image
Docker, la CI build-once et la mesure d'audience Umami préparée. Logo livre-lanterne gothique
validé et intégré (2026-10-08, [`docs/logo.md`](docs/logo.md)). Pages Projets, Parcours, Contact et
Blog créées, avec des études de cas statiques (neuf pages de projet depuis le 2026-10-14, voir
« Vitrine finale » ci-dessous), navigation globale,
transition Jour / Nuit et figures interactives (2026-10-08). Page Contact retravaillée avec
formulaire et backend Rust/Axum avec livraison SMTP (2026-10-08). Backoffice privé,
stockage SQLite persistant, adresse modifiable et accès MCP ajoutés (2026-10-08). Blog éditable,
SEO, médias privés, versions de travail/publiées et programmation persistante ajoutés (2026-10-08).**

**Refonte « Lanterne » (2026-10-13, branche `feat/refonte-ux-ui`).** Après un audit complet, Charles
retient la direction C « Lanterne », avec trois greffes de la direction B, à la place de D « Mode
d’emploi », avec cinq autres décisions (vitrine, tout garder, ordre des preuves, défauts du
cahier, voix), consignées dans [`docs/prive/questions.md`](docs/prive/questions.md), section H. Le socle est dans
le code : jetons jour et nuit, deux polices, coque commune (en-tête, pied, bascule lanterne,
allumage), composants partagés et gabarit des pages de projet. Les quinze pages de la refonte,
puis les quatre pages de projet du 14/10/2026, sont faites dessus. Le lot 0 a posé les garde-fous
(liens publics, citations, formulations interdites, pages, visuels) et le registre des
emplacements de visuels (182 au 14/10/2026) ; les dessins, captures et images de partage sont livrés, et les 74 images générées
aussi (2026-10-13), chacune en deux versions dessinées, jour et nuit, branchées sur le thème :
plus aucun visuel « socle » ne manque. Prochaines étapes : le CV et les premiers articles.

**Vitrine finale, backoffice et blog (2026-10-14).** Le 14/10/2026, la vitrine finale est en
place, le backoffice et ses accès MCP sont refaits dans la coque « Lanterne », et les articles de
démonstration (`npm run blog:demo`) ont servi à corriger le rendu du blog. Charles range la
vitrine en quatre familles, « Lead et équipe » (PvZ Fusion), « Jeu vidéo » (Omnicard, Bloodborne
Legendary Run, League Of Data Base), « Outils » (gup, GitHealth) et « IA » (Karl Scraper, Sillage,
Relais), et archive Life Pixel, img-convertor et Shreksophone ([`docs/prive/questions.md`](docs/prive/questions.md),
section I). Karl Scraper, Sillage et Relais sont des dépôts privés, présentés sans lien.

**Relecture finale (2026-10-15).** Après la relecture de Charles, le parcours est daté (fins
d’Elan et de la Mission Locale, piscine de 42, études d’avant le titre), les jeux vidéo montrent
de vraies captures, « Sous le capot » remplace « Comment je l’ai construit », les pages IA sont
détaillées, les accès MCP expirent au bout d’un an au plus, le serveur d’envoi se règle dans le
backoffice, les demandes sont purgées après trois ans, et plus aucune marque « à confirmer » ne
reste sur le site ([`docs/prive/questions.md`](docs/prive/questions.md), section J).

**Entrée du backoffice (2026-10-27).** La connexion du backoffice devient « l’atelier
s’allume » : une scène de lanterne, un générique d’ouverture, des passages d’écran en View
Transitions et l’atelier qui s’ouvre dans la lumière (maquette `design/connexion-backoffice/`,
règle ci-dessous, « Entrée du backoffice »).

**Bascule faite (2026-10-15).** La V2 sert `charles-lindecker.com` (`www.` en 301 vers l’apex,
les adresses de la V1 en 301), son test `test.charles-lindecker.com`, et la V1 est archivée,
figée, sur `yharnam.charles-lindecker.com` (`archive-v1/`). Le dépôt est public depuis le même
jour, avec un historique réécrit : le cadrage vit dans le dépôt privé cloné dans `docs/prive/`
(section « Confidentialité »), et l’ancien historique complet dans le dépôt privé
`MonPortefolioV2-historique`. Déroulé, écarts et retour arrière :
[`docs/bascule.md`](docs/bascule.md).

Avant toute intervention, lire dans l'ordre. Les documents 1, 2, 3 et 5 sont dans `docs/prive/`,
le cadrage privé : un clone de `LINDECKER-Charles/MonPortefolioV2-cadrage`, ignoré par git
([`README.md`](README.md), « Dossier privé »). Ce dépôt est public depuis le 2026-10-15 ; rien de
`docs/prive/` n’y entre.

1. [`docs/prive/brief.md`](docs/prive/brief.md) — diagnostic de la V1, décisions prises, **récit validé
   (§ 4)**, structure visée (§ 5).
2. [`docs/prive/questions.md`](docs/prive/questions.md) — entretien de cadrage : réponses brutes et citations.
3. [`docs/prive/matiere-premiere.md`](docs/prive/matiere-premiere.md) — faits : parcours, projets, liens.
4. [`design/refonte/c-lanterne/`](design/refonte/c-lanterne/README.md) — la maquette retenue et
   son système (jetons, typographie, allumage, gabarit des pages de projet), avec les greffes de
   [`design/refonte/b-banc-essai/`](design/refonte/b-banc-essai/README.md) : fiche technique en
   tableau à filets, index des étiquettes de preuve et « Voir le projet → » sur chaque carte, acte
   bleu nuit pour « La suite » avec un aplat bleu roi derrière « Discutons ». Le reste de B et la
   direction A sont écartés. `design/propositions/` (dont D « Mode d’emploi ») est un historique :
   ne pas s’en inspirer. « Mode d’emploi » ne reste qu’en clin d’œil.
5. [`docs/prive/a-confirmer.md`](docs/prive/a-confirmer.md) — les dernières questions ouvertes pour Charles
   (backoffice, blog, choix techniques invisibles du visiteur) et ses actions hors du site.
6. [`README.md`](README.md) — le site, ses commandes et sa mise en ligne.

## Règles de travail

- **Ordre : récit → contenu et structure → design → code.** Le récit (brief § 4) est la source :
  accroche, textes, structure et UI en découlent. Ne pas le réinventer.
- **Les réponses au questionnaire priment sur le brief.** Mettre le brief à jour dès qu'une réponse
  le contredit.
- **Questions encore ouvertes** : elles sont rassemblées dans
  [`docs/prive/a-confirmer.md`](docs/prive/a-confirmer.md), par thème. Les poser comme un entretien, un bloc à
  la fois, puis consigner les réponses dans `docs/prive/questions.md` et retirer la question du document.
  Rester au niveau stratégique ; les métriques fines viendront plus tard.
- **Tout garder** (décision du 2026-10-13) : aucun élément existant ni demandé par Charles n’est
  retiré sans son accord explicite (cartes de Gwent, règles 1 à 3, système en boucle, lanternes,
  scènes rejouables, « Pour aller plus loin », Blog dans la navigation, carrousel et écrans
  sociaux de Bloodborne, sauvegardes et Umami de League, quatre cartes de gestion de PvZ…).
  On peut les redessiner, les déplacer ou les replier, pas les supprimer. Les longueurs de page du
  cahier des charges sont indicatives.
- **Écrire avec la voix de Charles** : reprendre ses phrases (brief § 4, « Écrire avec sa voix »),
  des phrases nettes mais pas hachées.
- **Adapter la quantité de texte au rôle de la page.** L’accueil raconte une histoire ; les pages
  de consultation (compétences, formations, listes de projets) se lisent en diagonale : intitulés,
  faits et liens courts, avec des logos, illustrations ou captures lisibles. Ne pas y ajouter de
  paragraphes de présentation, d’anecdotes ni d’explications qui répètent ce que le visuel montre.
  Sur une page de projet, montrer les usages et réserver le texte aux explications nécessaires.
- **Ne rien inventer sur le parcours.** Depuis le 15/10/2026, plus aucune marque « à confirmer »
  sur le site : Charles a validé ce qu’il affichait, la marque est retirée du code et les tests
  refusent « à confirmer » sur les pages. Un fait nouveau non sourcé n’entre pas sur le site ; sa
  question va dans `docs/prive/a-confirmer.md`.
- **La V1 (`../MonPortfolio`) est une source de faits et d'infrastructure** (CI build-once,
  overlays compose, labels Caddy), pas un modèle de contenu ni de structure.

## Confidentialité

- **Le dépôt est public** (depuis le 2026-10-15), les journaux de sa CI aussi ; le cadrage reste
  privé, dans `docs/prive/`. Les règles de confidentialité du site sont dans
  [`docs/prive/confidentialite.md`](docs/prive/confidentialite.md) : les lire avant d’écrire sur
  un projet privé, le poste actuel ou le parcours.
- **Rien de privé dans le dépôt** : ni nom interne, ni nom de dépôt privé, ni contenu de
  `docs/prive/`, que ce soit dans le code, un test, un commentaire, un message de commit ou de
  PR. Un garde-fou qui a besoin d’une liste privée la lit par `site/tests/support/prive.ts`, et
  son message d’échec désigne la faute par un numéro, jamais par le nom.
- **Dépôts privés présentés** : Bloodborne Legendary Run, Karl Scraper, Sillage et Relais, sans
  lien ni nom de dépôt (`prive: true` dans `VITRINE`). Aucun autre dépôt privé n’est mentionné
  ni ne sert de preuve.
- **Poste actuel** : seulement en termes génériques (architecte logiciel, développement web,
  DevOps), sans mission ni client.

## Le site (`site/`)

Astro 7, rendu statique avec publications du blog rendues à la demande, servi par
`site/server/server.mjs` (Node sans dépendance). Commandes,
carte du dépôt et mise en ligne : [`README.md`](README.md).

- **Avant de pousser sur `dev`** : le hook `.githooks/pre-push` joue `npm run test:e2e` et le
  parcours réel du backoffice (`scripts/test-backoffice.mjs`), que la CI ne joue plus au push ;
  ne pas le contourner (`--no-verify`) sans l’accord de Charles. Il se pose au `npm install` de
  `site/` ; sinon : `git config core.hooksPath .githooks`.
- **Avant de rendre la main** : `npm run check`, `npm test` et `npm run test:e2e` dans `site/`,
  avec `docs/prive/` en place (dans un worktree, celui du dépôt principal suffit).
  Le build échoue sur toute erreur de `tools/verifier-site.mjs` : c'est voulu.
- **Le texte vient du récit** (brief § 4) et de la matière première ; un fait non sourcé n'entre
  pas sur le site. Les chiffres surlignés sont des faits sourcés, un seul par preuve.
- **Typographie française** : apostrophe `’`, espace insécable avant `: ; ! ?` et dans les
  guillemets. Le vérificateur refuse le reste ; `lib/typo.ts` pose les espaces des textes passés
  en propriétés.
- **Aucun script en ligne** : la CSP du serveur (`script-src 'self'`) les bloquerait. Ni `on*=`,
  ni origine tierce (police, CDN, iframe, vidéo distante). Contenu complet sans JavaScript.
- **Un seul système, la direction « Lanterne »** (`DESIGN.md`). Couleurs, tailles de texte,
  rayons, ombres et durées s’écrivent seulement dans `site/src/styles/jetons.css`, jour et nuit ;
  `tests/unit/styles.test.ts` refuse toute valeur en dur ailleurs et
  `tests/unit/contrastes.test.ts` vérifie les paires de contraste. Rayons de 4 et 6 px, pilule
  pour les boutons et la bascule. Une seule zone éclairée par écran : la prop `foyer` (classe
  `.foyer`), un seul halo de jour. Le bleu roi (la lune, la nuit) ne porte que ce qui se clique ;
  le colza surligne un seul chiffre sourcé par preuve. Socle : `styles/global.css`,
  `layouts/Base.astro`, `components/{layout,ui,pages}/`, chacun documenté en tête de fichier.
  Le backoffice et l’atelier du blog suivent les mêmes jetons depuis le 14/10/2026
  (`components/backoffice/`, `styles/backoffice.css`, `styles/blog-editor.css`, parcourus par
  `styles.test.ts`) ; leur coque est décrite dans `DESIGN.md` (« Backoffice »).
- **Polices** : Instrument Serif (titres, citations de Charles, la voix) et Instrument Sans (texte
  courant, interface, chiffres-preuves en graisse 600 et chiffres tabulaires). Trois fichiers
  auto-hébergés dans `site/src/assets/fonts/`, déclarés dans `astro.config.mjs` (`fonts`).
  Atkinson Hyperlegible est écartée : son zéro est barré.
- **Actes** : chaque changement de partie d’une page longue change de lumière, avec
  `<Acte ton="pierre|teinte|veille|bleu">`. L’acte de veille fait entrer la nuit dans le jour,
  là où attendent les captures sombres ; « La suite » de l’accueil est en acte bleu nuit, et
  « Discutons » s’y pose sur un aplat bleu roi (`AppelDiscutons variante="aplat"`).
- **Allumage et thème** : la bascule est une lanterne (`BasculeLanterne.astro`) ; passer à la
  nuit l’allume et fait tomber l’obscurité depuis les bords (`scripts/theme.ts`,
  `styles/theme-transition.css`). Contrat de thème inchangé : `data-theme`,
  `localStorage['cl-theme']`, `[data-theme-bascule]` avec `aria-label="Mode nuit"` et
  `aria-pressed`. Sans JavaScript, le thème suit `prefers-color-scheme` et la bascule est masquée.
- **Mouvement** : la figure 1 se trace à son arrivée, les règles apparaissent de 1 à 3 et le
  système d’architecture fait circuler des messages en boucle tant qu’il est visible. Les autres
  scènes (cartes de Gwent, lanternes…) se jouent une fois à leur arrivée dans l’écran, puis se
  rejouent en cliquant directement sur leur dessin ou au clavier
  (`scripts/figure-animations.ts`). Respecter `prefers-reduced-motion` (état final complet, ni
  transition ni allumage) et suspendre la boucle hors écran ou dans un onglet masqué.
- **Entrée du backoffice** (depuis le 27/10/2026, maquette `design/connexion-backoffice/`) :
  connexion, vérification en deux étapes et codes de secours sur une scène de lanterne
  (`SceneEntree.astro`, `ConnexionBackoffice.astro`, `styles/backoffice-entree.css`), tant que
  `<body>` porte `data-entree` (posé et retiré par `scripts/backoffice.ts`). L’ouverture se pose
  avant le premier rendu (`public/backoffice-entree.js`, après `/theme.js`) : générique de nuit à
  la première visite de l’onglet, ouverture courte ensuite, rien en mouvement réduit ni quand une
  session est probable (« cl-backoffice-session », un indice, jamais un secret). La mise en scène
  (`scripts/backoffice-entree.ts`, avec `backoffice-scene.ts`, `backoffice-saisie.ts` et
  `backoffice-mouvement.ts`) se charge à la demande, hors du budget de la page comme l’atelier du
  blog : sans elle, la connexion marche, d’un coup. `backoffice.ts` reste maître de la session et
  du DOM ; chaque changement d’écran passe par `jouer(geste, maj)`. Le code part seul au sixième
  chiffre (jamais un code de secours) ; un 429 compte les secondes de `Retry-After`. Ses trois
  courbes, son titre en `--t-4xl` et son vocabulaire de cinéma (bandes, traînée, bokeh, grain)
  ne sortent pas de cette page.
- **Liens** : une seule grammaire, dans `lib/liens.ts` (`→` page interne, `↓` ancre, `↗` sortie
  du site ou e-mail), portée par `Bouton`, `LienAction` et `CarteProjet`. L’action principale est
  « Discutons → », vers `/contact`, partout. L’adresse e-mail passe seulement par `CONTACT.email`
  ou `MAILTO`. Les URL existantes ne changent pas.
- **Vitrine et archives** : l’ordre de la vitrine, la famille (`FAMILLES_PROJETS` : « Lead et
  équipe », « Jeu vidéo », « Outils », « IA »), le nom canonique, l’étiquette de preuve et le
  drapeau `prive` de chaque projet s’écrivent une fois dans `VITRINE` (`config/projets.ts`) ;
  la vedette est `VEDETTE` (PvZ Fusion), et le rang, le précédent et le suivant suivent cette
  seule suite, d’une famille à l’autre. `/projets` rend une section par famille (`h2`, ids
  `famille-<id>`), puis le volet replié « Projets archivés » : un projet sorti de la vitrine
  rejoint `PROJETS_ARCHIVES` (même fichier) avec sa vignette et ses liens publics, ou sa page,
  qui garde son adresse et son entrée dans `config/pages.ts`.
- **Gabarit des pages de projet** : chaque page
  assemble `components/projets/gabarit/` : `EnTeteProjet` (le h1 nomme le projet avant sa phrase,
  l’étiquette de preuve à côté, hors du titre ; fiche technique en tableau à filets, repères
  chiffrés sourcés et datés), `CorpsProjet` et `SectionProjet`, `SousLeCapot` (depuis le
  15/10/2026, à la place de « Comment je l’ai construit », jugé trop lourd : une liste serrée de
  deux à dix points d’une ligne, ancre `#construit` gardée, chacun dépliable en `<details>` natif
  sur « contrainte, choix, effet » ou un texte, puis un extrait court de douze lignes au plus ;
  groupes titrés facultatifs ; tout déplié à l’impression), `SortieProjet` (ce que j’en retiens,
  Discutons, projet précédent et suivant) et `SourcesProjet`. Un extrait est du vrai code d’un
  dépôt public de la liste blanche, avec son chemin et sa révision dans la note de sources, ou,
  pour un dépôt privé, une forme écrite pour la page (`ecrit: true` : configuration, commande,
  structure de données, pseudo-code), jamais du code recopié, ni nom interne, chemin ou secret.
  Les pages IA (Karl Scraper, Sillage, Relais) posent aussi la même liste en section `fonctions`
  (« Toutes ses fonctions, une ligne chacune »), et leur « Sous le capot » se range en groupes
  (Architecture, Décisions, Garde-fous, tests et limites). Ses données vivent dans
  `config/<projet>.ts` ; pour GitHealth, Karl Scraper, Sillage et Relais, la carte de la vitrine
  aussi (export `CARTE`, importé par `config/vitrine.ts` ; `FICHE` et `SCHEMA` sont lus par
  `lib/seo.ts`). Un projet est `SoftwareSourceCode` (dépôt public, `codeRepository`) ou
  `CreativeWork`, jamais `SoftwareApplication` : Google y exige un prix et des notes qu’aucun projet
  n’a. Un projet privé n’a aucun lien (`liens: []`) et sa fiche le dit (« Aucun : le
  code est dans un dépôt privé. ») ; un projet public sans lien fait échouer le build.
- **Visuels** : toute illustration qui n’est ni une photo, ni une capture réelle, ni un logo, ni
  une figure codée est un `<Visuel id="…">` du registre `site/src/config/visuels.ts`, avec sa
  consigne complète (sujet, composition, format, alt). Tant que le fichier manque, le site en
  ligne montre un cadre neutre au bon ratio, avec l’alt du registre et l’emblème en filigrane ;
  le cadre hachuré qui porte la commande ne s’affiche qu’en `astro dev` ou avec
  `VISUELS_BROUILLON=1` (`lib/visuels.ts`). Un dessin SVG livré est inséré en ligne : il suit
  `currentColor` et les jetons. Codex génère les images (IMG) dans le style « gravure
  en réserve » de la direction, au trait économe : deux masters par image, au même cadrage au
  pixel près, en trois couleurs de clé, le jour `<ID>.png` et la nuit `<ID>.nuit.png` faite en
  édition depuis le jour (décision du 2026-10-13), dans `design/assets/visuels/<série>/`, avec
  leurs prompts dans le README de la série. `npm run visuels:rendre <ID>` (ou `-- --tout`) les
  rend aux couleurs lues dans `jetons.css`, en `<ID>_<l>x<h>.webp` (jour) et `.nuit.webp` (nuit),
  dans `site/src/assets/visuels/<série>/` ; sans master de nuit, il écrit une nuit de repli
  « clair de lune », signalée. Seuls les rendus WebP sont versionnés côté site, jamais une copie
  des masters. Le noir d’un master de nuit à fond rempli (ou d’une image posée sur une carte,
  `support: 'surface'`) devient `--surface`, comme le blanc du jour : une plaque dans les deux
  thèmes. `<Visuel>` pose les deux rendus d’une image générée (même alt, mêmes tailles) et n’en
  affiche qu’un, en CSS : le jour par défaut, la nuit sous les trois portes de `jetons.css`
  (`data-theme='nuit'`, acte sombre, `prefers-color-scheme: dark` sans JavaScript), le jour à
  l’impression. L’autre est en `display: none` : ni lu ni téléchargé. Les deux sont toujours
  chargés à la demande (une page qui veut un chargement immédiat obtient `fetchpriority="high"`) ;
  sans JavaScript, où le navigateur ignore `loading="lazy"`, une source neutre `(scripting: none)`
  remplace la version masquée (`ui/ImageAdaptative.astro`). Un emplacement toujours posé dans un
  acte sombre le déclare (`acte`). À la bascule, `scripts/theme.ts` charge et décode le rendu visé
  des images proches avant d’afficher la nouvelle vue. Une scène animée (`components/accueil/Scene.astro`) refuse une lumière qui
  ne part pas de la lanterne du registre. Les figures codées (FIG), les dessins vectoriels écrits
  à la main (SVG) et les captures réelles (CAP) se font dans le dépôt. Les images de partage (OG,
  `tools/generer-partage.mjs`) sont en JPEG sous 300 Ko, au-delà desquels WhatsApp n’affiche
  souvent pas l’aperçu ; les captures du manifeste se reprennent avec
  `tools/capturer-installation.mjs`. `npm run visuels` liste ce
  qui manque (rendus et masters de nuit compris), `-- --verifier` contrôle ce qui est livré
  (dimensions, ratio, poids, fond, les deux masters et les deux rendus) ; `npm run visuels:doc`
  régénère [`docs/visuels-a-generer.md`](docs/visuels-a-generer.md), la commande à donner à
  Codex, seule référence des prochaines générations : ne jamais la corriger à la main.
  Les séries des quatre pages entrées le 14/10/2026 (`SERIES_VITRINE_FINALE` : `githealth`,
  `karl-scraper`, `sillage`, `relais`, ids `GTH-`, `KSC-`, `SIL-`, `REL-`) s’écrivent chacune
  sous son repère du registre (`// GTH — GitHealth …` jusqu’à `// ↑ fin des entrées GTH`) ; les
  compteurs figés de `tests/unit/visuels.test.ts` ne comptent que l’inventaire hors de ces séries.
- **Garde-fous** (tests sur le HTML construit, dans `site/tests/unit/`) : liste blanche des liens
  publics (`config/liens-publics.ts`, aucun dépôt privé ni démo hors ligne), citations de Charles
  recopiées mot pour mot (`config/citations.ts`), formulations interdites de recherche de poste
  (`config/formulations-interdites.ts`), pages du sitemap et des tests tirées de
  `config/pages.ts`, registre des visuels et sa commande, gabarit des projets, confidentialité
  des projets privés (`confidentialite.test.ts`). Les listes privées (noms internes, dépôts
  privés présentés, motifs refusés par page, sources des citations) se lisent dans `docs/prive/`
  par `tests/support/prive.ts` ; sans ce dossier, ces garde-fous échouent. Pour ajouter un
  dépôt, une citation ou une page : l’inscrire dans le fichier de configuration, puis `npm test`.
- **Mesure d'audience** : tout événement ou emplacement nouveau passe d'abord par
  [`docs/mesure-audience.md`](docs/mesure-audience.md), puis par
  `site/tests/e2e/plan-de-marquage.ts`, puis par le type `Emplacement` de `lib/liens.ts` (valeurs
  fermées). Un lien sortant sans emplacement fait échouer le build. Les chapitres de l’accueil
  gardent leurs identifiants `origine`, `aujourdhui` et `discutons`.
- **Contrats du blog** : la coque reste compatible avec `server/blog.mjs` (`#blog-article-slot`,
  `#blog-publications`, classes `.blog-*`) ; `server/blog-dist.test.mjs` le vérifie sur le vrai
  HTML construit. Le rendu remplace par fonction (un `$` d’auteur n’est jamais un motif), donne
  un identifiant d’ancre à chaque titre, pose la typographie française hors du code, la flèche ↗
  et la mesure (`lien-sortant`, emplacement `article`) sur les liens externes, et tire `width`,
  `height` et `srcset` des dimensions que le backend joint sous `media`. Liens et images suivent
  `server/blog-regles.mjs`, la règle de `backend/src/blog.rs`, partagée avec l’éditeur ; les cas
  de `tests/fixtures/liens-blog.json` sont vérifiés des deux côtés. `tests/fixtures/schema-blog.json`
  inventorie les nœuds, marques et attributs admis, avec des valeurs admises et refusées :
  `backend/tests/blog_api.rs` y confronte la validation, `server/blog-schema.test.mjs` le rendu
  (une valeur refusée se rend comme absente). `tests/fixtures/article-complet.json` emploie tout
  l’inventaire et ses cas limites ; Rust le publie, `blog-schema.test.mjs` vérifie son HTML et
  `tests/e2e/blog-article.spec.ts` le rend sur le serveur de production, avec une doublure du
  backend. Un nœud ou un attribut nouveau passe par ces trois fichiers
  (`tests/fixtures/README.md`).
- **Hors du périmètre du design** : `site/server/*`, les contrats du backoffice (API, session,
  identifiants et libellés lus par `scripts/backoffice.ts`, `scripts/blog-editor.ts` et leurs
  tests), `middleware.ts`, la CSP d’`astro.config.mjs`, `public/theme.js` et `public/mesure.js`
  ne changent qu’avec un besoin explicite et leurs tests serveur. L’apparence du backoffice, elle,
  suit le système (règle « Un seul système »).
- **Budgets** : 15 Ko de JavaScript et 30 Ko de CSS gzip par page, vérifiés au build ; 1,5 Mo
  d’images par page à 390 px, page entière parcourue, avec et sans JavaScript
  (`tests/e2e/visuels-jour-nuit.spec.ts`, sur les pages les plus chargées). Un rendu WebP d’image générée tient sous son plafond du registre
  (`PLAFONDS_POIDS`) : `npm run visuels:rendre` abaisse au besoin sa seule qualité et le signale.
- **Ce qui n'existe pas encore ne s'affiche pas** : le CV vaut `null` dans
  `site/src/config/site.ts` tant qu'il n'est pas prêt. L’archive de la V1 (`ARCHIVE_V1`) est
  posée parce qu’elle se met en ligne avant la V2 ([`docs/bascule.md`](docs/bascule.md)). Seule
  exception : les emplacements de visuels, qui restent posés en cadre neutre jusqu’à la livraison
  de leur fichier.
- **IndexNow** : chaque mise en production signale aux moteurs les pages dont la date `maj` de
  `config/pages.ts` tombe depuis la précédente (`scripts/indexnow.mjs`, job `indexnow`), et les
  articles du blog passent chaque nuit (`indexnow.yml`). Une page retouchée change de `maj`.
- **Search Console** : l’accueil garde la balise de vérification de la V1
  (`SITE.verificationGoogle`) ; la retirer ferait perdre la propriété.

## Le backend (`backend/`)

API Rust/Axum indépendante du rendu Astro. Configuration commune dans le `.env` racine,
contrat et commandes dans [`backend/README.md`](backend/README.md). Le serveur Node relaie
les routes publiques de l’API ; le service Rust reste privé dans Compose.

- **Avant de rendre la main pour un changement backend** : `cargo fmt --manifest-path
  backend/Cargo.toml --all -- --check`, `cargo clippy --manifest-path backend/Cargo.toml
  --locked --all-targets --all-features -- -D warnings` et `cargo test --manifest-path
  backend/Cargo.toml --locked`.
- **Contact** : destinataire enregistré en SQLite et modifiable dans `/backoffice` ;
  `CONTACT_EMAIL` initialise seulement une base neuve. Serveur d’envoi réglable dans le
  backoffice (rubrique « E-mails », `/api/backoffice/mail`) : il prime sur les variables
  `SMTP_*`, qui restent le repli ; mot de passe chiffré au repos par une sous-clé de
  `BACKOFFICE_TOTP_ENCRYPTION_KEY`, jamais renvoyé ; hors `APP_ENV=development`, TLS ou STARTTLS
  seulement, ports 465, 587, 25 ou 2525 ; e-mail d’essai limité en fréquence. Adresse du visiteur
  en `Reply-To`. Un succès confirme la persistance, avant la notification SMTP facultative. Les
  demandes sont supprimées automatiquement 3 ans après leur réception (tâche horaire), comme le
  disent les mentions légales. Aucun contenu du formulaire, adresse du visiteur ni secret dans
  les journaux ou la mesure d’audience. Le backoffice reste hors mesure et hors index.
- **Administration** : identifiants `BACKOFFICE_EMAIL` et `BACKOFFICE_PASSWORD` dans `.env`,
  empreinte Argon2id calculée par le backend. Hors `APP_ENV=development`, inscription TOTP à la
  première connexion, vérification ensuite et codes de secours à usage unique. Secret chiffré
  avec `BACKOFFICE_TOTP_ENCRYPTION_KEY`. Sessions HttpOnly/SameSite et mutations protégées contre
  les requêtes intersites. Jetons MCP distincts, hashés, révocables et limités par scopes :
  `contacts:read`, `blog:read`, `blog:write`, `blog:publish`. Une création sans `scopes` ne reçoit
  que `blog:read` (`contacts:read` se demande exprès, depuis le 14/10/2026) ; les accès existants
  gardent leurs droits. Chaque jeton expire, un an au plus (90 jours par défaut) ; expiré, il
  reste listé, le MCP le refuse (`401 TOKEN_EXPIRED`) et il ne se prolonge pas.
  Toute suppression (article ou image) exige `blog:publish`.
  SQLite doit être sauvegardée et montée dans un volume persistant propre à chaque environnement.
- **Blog** : documents Tiptap JSON validés par une liste de nœuds et attributs admis ; aucun HTML
  d’auteur. Enregistrer ne modifie jamais le snapshot publié. Publier et programmer sont explicites
  et exigent la révision courante. Programmer fige une version ; une retouche exige une nouvelle
  programmation. Images raster en SQLite, accessibles publiquement seulement si une version publiée
  les référence ; à l’import, bornées (4 Mio par fichier, une décision : une photo plus lourde
  s’exporte plus petite ; 25 Mpx ; 150 Mo tenus par le décodage, une image décodée à la fois :
  le pire pic mesuré, 168 Mio, fixe les 320 Mio du service dans `compose.deploy.yaml`, avec les
  réglages de l’allocateur de `backend/Dockerfile`, à garder), mesurées,
  débarrassées de leurs métadonnées (GPS compris, orientation gardée) et réduites en variantes de 480, 960 et 1 600 px,
  avec une image fixe pour une image animée (`src/blog_media.rs`), et supprimables seulement
  quand aucune version ne les cite. Une image trop lourde à réduire est refusée à l’import
  (`422 IMAGE_TOO_HEAVY`, message montré tel quel par l’atelier et l’outil MCP) ; déjà en base,
  elle reste gardée sans variante. Les gros imports (corps de plus de 64 Kio, backoffice et
  `blog_upload_media`) attendent l’une de deux places avant d’être lus (`src/upload_queue.rs`),
  10 s au plus, puis `503 UPLOAD_BUSY` ; un petit import prend sa place une fois lu, avant son
  décodage, et chaque import la garde jusqu’à la fin de son traitement ; les autres petites
  requêtes n’y passent jamais. Aperçu HTML sous `/api/backoffice/blog/preview/{id}` pour conserver le cookie privé.
  Le serveur Node rend les articles, leur SEO, le sitemap et le flux RSS (`/blog/rss.xml`) sans
  JavaScript client ni rebuild ; tant qu’aucun article n’est publié, `/blog` reste hors index et
  hors sitemap ;
  `blog-modele.astro` est un gabarit hors index, dont l’adresse publique reste inaccessible.
  L’atelier `/backoffice/blog` sépare liste, rédaction, images, référencement et publication.
  Les pages d’un article partagent sa version de travail et sa révision ; leur navigation garde
  les retouches, tandis qu’une sortie de l’article protège les changements non enregistrés.
- **Stockage** : `GET /api/backoffice/storage` (session seulement, ni accès MCP ni outil MCP ;
  `src/usage.rs`) donne le disque, la base par catégorie, les images avec leurs articles et les
  articles par poids. La rubrique `/backoffice?rubrique=storage` l’affiche et supprime une image
  inutilisée. Les articles qui citent une image viennent de `blog::media_citations`, la même
  règle que la suppression (`MEDIA_IN_USE`). Contrat : `backend/README.md`.
- **Nouvelles routes** : les ajouter au routeur Rust et explicitement au relais Node ainsi
  qu’au proxy Astro local (`site/src/lib/proxy-dev.mjs`, et son test). Les deux images partagent la même révision et sont promues ensemble.

## Conventions

Conventions transverses (Conventional Commits en français, nommage des branches) : instructions
globales de l'utilisateur. La carte des scopes est ci-dessous ; `/project-init` peut l'affiner.

## commit

Convention de commits (maintenue par /commit).
- Style : Conventional Commits — langue : fr
- Scopes (chemin → scope) :
  - `site/**` → `site`
  - `backend/**` → `backend`
  - `.github/**` → `ci`
  - `compose*.yaml`, `.env*.example`, `scripts/**`, `archive-v1/**`, `docs/deploiement.md`,
    `docs/secrets.md`, `docs/mesure-audience.md`, `docs/bascule.md` → `infra`
  - `docs/**` (le reste) → `cadrage`
  - `AGENTS.md`, `README.md`, `.gitignore` → `agents`
  - `design/**` → `design`
