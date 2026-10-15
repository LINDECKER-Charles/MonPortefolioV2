# MonPortefolioV2

Portfolio de Charles Lindecker, version 2, dans la direction visuelle **« Lanterne »** retenue le
2026-10-13 ([`DESIGN.md`](DESIGN.md)) : une seule source de lumière, ce qui compte est éclairé.
L'accueil raconte, de haut en bas, l’origine, aujourd’hui, puis « La suite, à plusieurs » :
Maîtriser, Réinventer, puis Emmener, la preuve la plus forte, et l’invitation « Discutons » vers
`/contact`. Pages produites par [Astro](https://astro.build), servies par un petit serveur
Node sans dépendance, en conteneur derrière l'edge TLS mutualisé du VPS. Les publications du blog
sont rendues à la demande à partir des contenus persistés, sans reconstruction du site.

## Démarrer

Node 24 ou plus récent ; Rust 1.88 ou plus récent pour l’API.

Depuis la racine, copier le modèle d’environnement puis lancer le backend dans un terminal :

```bash
cp .env.example .env
cargo run --manifest-path backend/Cargo.toml    # http://127.0.0.1:8080
```

Dans un second terminal, lancer le site :

```bash
cd site
npm ci
npm run dev          # développement, http://localhost:4321
npm run preview      # build + serveur de production, http://127.0.0.1:4000
```

| Commande (dans `site/`) | Rôle |
|---|---|
| `npm run build` | build statique dans `dist/`, puis contrôles du site (`tools/verifier-site.mjs`) |
| `npm run check` | vérification des types (`astro check`) |
| `npm test` | tests unitaires (Vitest) et tests du serveur (`node --test`) ; les garde-fous qui lisent le HTML construit (blog, liens publics, citations, formulations interdites, sitemap) reconstruisent `dist/` s'il est périmé |
| `npm run visuels` | liste les visuels « socle » manquants du registre `src/config/visuels.ts`, rendus et masters de nuit compris (`-- --tout` pour tous, `-- --verifier` pour contrôler les fichiers livrés, `-- --strict` pour échouer s'il en manque) ; le build en affiche le décompte sans échouer |
| `npm run visuels:doc` | régénère `docs/visuels-a-generer.md`, la commande de production des images, depuis le registre |
| `npm run visuels:rendre <ID>` | rend les deux masters d’une image générée (`design/assets/visuels/<série>/<ID>.png` et `<ID>.nuit.png`) aux couleurs des jetons : `<ID>_<l>x<h>.webp` (jour) et `.nuit.webp` (nuit), sous le plafond de poids du registre ; `-- --tout` pour tous les masters déposés |
| `npm run blog:demo` | crée ou met à jour, sur un backend local seulement, les articles de démonstration `demo-*` du blog et leurs images (voir « Articles de démonstration ») ; `-- --nettoyer` les retire |
| `npm run test:e2e` | build + tests navigateur (Playwright, Chromium à 390 et 1440 px, axe ; favicons aussi dans Firefox et WebKit) |

Première exécution des tests navigateur : `npx playwright install chromium firefox webkit`.

```bash
docker compose up --build    # les deux services, http://127.0.0.1:4000
```

Les demandes du formulaire sont conservées dans une base SQLite persistante, puis notifiées
par e-mail si le relais SMTP est configuré. Un succès confirme leur enregistrement ; une panne
SMTP ne fait pas perdre la demande. Renseigner `SMTP_HOST`, `SMTP_FROM` et les réglages du relais
pour activer les notifications.

Le **backoffice `/backoffice`** rassemble les demandes (nouvelles, lues, archivées), leur état de
notification, le blog, l’adresse de contact, les liens de la boîte à outils, les accès MCP et le stockage (disque, base, images et articles
par poids, suppression d’une image inutilisée). Il
suit la direction « Lanterne » du site (jour et nuit, bascule lanterne, sans mesure d’audience) :
une navigation par rubriques dans l’en-tête et un retour affiché à côté de chaque action. L’adresse
modifiée est utilisée par le formulaire et les liens e-mail des pages sans redémarrage ni rebuild.
`CONTACT_EMAIL` initialise seulement une base neuve ; une base existante conserve sa valeur.

Pour activer la connexion, renseigner `BACKOFFICE_EMAIL` et `BACKOFFICE_PASSWORD` dans `.env`.
Le mot de passe doit faire au moins 12 octets ; le mettre **entre apostrophes** pour conserver
ses caractères. Le backend en calcule l’empreinte Argon2id. Les identifiants d’administration
sont indépendants de l’adresse de contact publique.

Avec `APP_ENV=production` (valeur par défaut) ou `APP_ENV=test`, la première connexion demande
la configuration d’une application d’authentification par QR code, puis un code à six chiffres.
Les connexions suivantes demandent ce code. Huit codes de secours à conserver sont affichés une
seule fois. Renseigner également `BACKOFFICE_TOTP_ENCRYPTION_KEY` avec `openssl rand -hex 32`.
Cette clé protège le secret 2FA en base et doit accompagner ses sauvegardes.
`APP_ENV=development`, fixé par le modèle local et le calque Compose local, dispense de 2FA.
En HTTP local seulement, poser `BACKOFFICE_COOKIE_SECURE=false` ; garder `true` sur HTTPS.
Sans identifiants, l’administration est désactivée. Configuration et récupération d’accès :
[`backend/README.md`](backend/README.md).

Brancher Claude Code sur le MCP distant `https://<domaine>/mcp` se fait en un geste : rubrique
« Accès MCP », « Créer l’accès », puis coller la commande affichée une seule fois avec son
secret (`claude mcp remove` du serveur du même nom, puis `claude mcp add …` : un nouvel accès
remplace l’ancien). Trois préréglages disent ce que l’assistant pourra faire : lecture du blog,
**rédaction** (par défaut) ou publication ; lire les demandes de contact est une case à part,
décochée par défaut. « Vérifier l’accès » montre les outils réellement ouverts, par le chemin de Claude Code. Chaque accès se
révoque individuellement, avec effet immédiat. Les accès existants gardent leurs permissions, et
la lecture des contacts ne marque aucune demande comme lue. Parcours complet, autres clients
(Codex), contrat de l’API et sauvegarde de la base : [`backend/README.md`](backend/README.md).

## Carte du dépôt

| Chemin | Rôle |
|---|---|
| `docs/` | cadrage (brief, questionnaire, matière première, briefs d'assets) et exploitation (déploiement, secrets, mesure d'audience) |
| `design/` | maquettes et assets sources (logo, pictogrammes, illustrations, photos) |
| `site/` | le site Astro ; son `Dockerfile` produit l'image publiée |
| `site/src/` | pages, composants, scripts, styles, configuration du contenu |
| `site/server/` | serveur de production : 301 de la V1, 404, cache, en-têtes, mesure `/mesure.js`, adresse persistée et relais API/MCP |
| `backend/` | API Rust (Axum), SQLite, contacts, administration, notifications SMTP et MCP ; image Docker indépendante |
| `site/tools/` | contrôles du site construit (SEO, CSP, ancres, typographie française, budgets), outils des visuels et `articles-demo.mjs` (`npm run blog:demo`), qui écrit des articles de démonstration dans un backend local |
| `site/tests/` | `unit/` (Vitest), `e2e/` (Playwright) et `fixtures/`, les cas partagés avec `backend/tests/blog_api.rs` ([`site/tests/fixtures/README.md`](site/tests/fixtures/README.md)) |
| `compose*.yaml`, `.env*.example` | piles Compose et modèles d'environnement |
| `scripts/deploy-remote.sh` | ce qui s'exécute sur le VPS à chaque déploiement |
| `.github/workflows/` | `ci.yml` orchestre ; `_tests`, `_build`, `_promote`, `_deploy` font le travail |

## Pages et contenu

L’accueil garde le récit, dans ses trois chapitres `origine`, `aujourdhui` et `discutons`. Le
premier écran porte l’accroche, l’identité et le bandeau des trois preuves (Maîtriser, Réinventer,
Emmener). « La suite, à plusieurs » est un acte bleu nuit : les trois règles apparaissent de 1 à 3,
puis « Discutons → » sur un aplat bleu roi mène à `/contact`, et « Contribuer à mes projets open
source » mène au bloc « Contribuer » de la vitrine (`/projets#contribuer`). La navigation finale
« Pour aller plus loin » mène à Projets, Parcours et Blog. Les pages `/projets`, `/parcours`,
`/contact` et `/blog` sont accessibles depuis la navigation et reliées entre elles.

Les neuf pages de projet (`site/src/pages/projets/`) suivent l’ordre de la vitrine, famille par
famille : PvZ Fusion ; Omnicard, Bloodborne Legendary Run et League Of Data Base ; gup et
GitHealth ; Karl Scraper, Sillage et Relais. Elles partagent le gabarit de
`site/src/components/projets/gabarit/` : un en-tête commun (nom canonique, étiquette de preuve,
fiche technique en tableau à filets, un à trois repères chiffrés sourcés et datés), un corps libre
avec sa navigation de page, « Sous le capot » (une liste de points d’une ligne, chacun dépliable
sur son explication et un extrait court ; les pages IA y ajoutent la liste de leurs fonctions),
une sortie commune (projet précédent et suivant, « Discutons ») et une note de sources. Le corps reste propre à chaque projet ; ses
données sont dans `site/src/config/<projet>.ts`, avec, pour les quatre pages entrées le
14 octobre 2026, la carte de la vitrine (`CARTE`). Karl Scraper, Sillage et Relais sont des
dépôts privés : ni lien ni nom de dépôt, leur fiche le dit.

La page `/parcours` est un hub vers `/parcours/professionnel`, `/parcours/competences` et
`/parcours/formation`. Ces trois pages partagent le gabarit `site/src/layouts/Parcours.astro`,
une navigation locale et un retour au hub. Les compétences sont présentées par domaine,
avec un logo ou une illustration et un lien officiel pour chaque technologie. Ces pages de
consultation privilégient les faits et les visuels ; le récit reste sur l’accueil.

La page Formation et certifications distingue une frise complète de formation (du DWWM
aux premiers apprentissages, avec des étapes illustrées de taille variable), un catalogue de
certifications par domaine et une section de pratique Frontend Mentor. Les intitulés,
versions, dates et liens individuels des certifications sont dans `site/src/config/formation.ts`.
Les illustrations SVG de
`site/src/components/parcours/VisuelFormation.astro` suivent les thèmes jour/nuit et
l’impression. Les cursus suivis et le programme CDA étudié sont distingués des titres obtenus.

Pour ajouter une page, l’inscrire dans `site/src/config/pages.ts` : le sitemap et la liste des
pages des tests navigateur en découlent. Pour ajouter un projet à la vitrine, l’ajouter aussi à
`VITRINE` (`site/src/config/projets.ts`, ordre, nom canonique et étiquette de preuve) et sa carte à
`site/src/config/vitrine.ts`. Le build vérifie les liens internes et la cohérence du sitemap. Les
descriptions doivent faire 110 à 165 caractères, les titres 65 caractères au plus.

Le blog se gère dans **`/backoffice/blog`**, avec une liste filtrable et des liens vers chaque
article. Quatre pages distinctes partagent la version de travail : **Rédaction**, **Images**,
**Référencement** et **Publication**. Leurs adresses `/backoffice/blog/redaction?id=…`,
`/backoffice/blog/medias?id=…`, `/backoffice/blog/seo?id=…` et
`/backoffice/blog/publication?id=…` se rechargent directement. Changer de page dans l’article
conserve les retouches ; quitter l’article demande confirmation si elles ne sont pas enregistrées.
Les commandes **Enregistrer** et **Aperçu** restent dans une barre collante en haut de l’article,
avec le retour de chaque action. La Rédaction reprend la typographie de l’article publié (titre,
chapeau, texte à la même mesure), jour et nuit. L’éditeur propose titres, listes, liens,
citations, code, tableaux, alignements, images avec légendes et descriptions, couverture et image
de partage. Les réglages SEO comprennent titre, description, slug, canonical, indexation et aperçu
du résultat de recherche. Les images JPEG, PNG, WebP et GIF (4 Mio maximum) sont conservées dans
la même base SQLite que les articles ; ses sauvegardes incluent donc les médias. À l’import, le
backend les mesure, retire leurs métadonnées et prépare leurs variantes réduites, et une image
fixe pour une image animée ([`backend/README.md`](backend/README.md)).

Un article commence en brouillon. **Enregistrer** conserve la version de travail ; **Aperçu**
ouvre la mise en page réelle dans une page privée, sans mesure ni indexation. **Publier** copie
explicitement cette version sur `/blog/<slug>`. Modifier un article publié garde sa version
publique jusqu’à sa nouvelle publication. **Programmer** capture la version enregistrée pour
l’échéance choisie ; les retouches suivantes restent privées jusqu’à une nouvelle programmation.
La date est saisie dans le fuseau affiché par l’interface puis enregistrée en UTC. Le backend
rattrape les échéances au démarrage et les traite chaque minute ainsi qu’à la lecture publique.
Il doit rester démarré pour assurer les publications à l’heure prévue.

Les treize outils MCP du blog permettent les mêmes opérations, y compris les images, l’aperçu et
l’audit SEO, plus la suppression d’une image qu’aucun article ne cite (`blog:publish`). Les révisions empêchent une IA et l’éditeur d’écraser leurs changements respectifs.
Les articles publics contiennent leur texte et leurs métadonnées dans le HTML, avec balisage
`BlogPosting` et sitemap actualisé. Aucun article fictif n’est publié. Contrat complet et exemple
de document structuré : [`backend/README.md`](backend/README.md).

**Articles de démonstration (local).** Pour juger le rendu réel des articles, `npm run blog:demo`
(dans `site/`, avec le `.env` racine) se connecte au backoffice et crée ou met à jour huit
articles `demo-*` : texte long et typographie, titres et ancres, listes et citations (laissé en
brouillon), code, tableaux, images aux formats extrêmes, bords (titre de 160 caractères, article
très court en `noindex`) et un article programmé dans sept jours puis retouché
(`-- --programmer-dans=<minutes>` pour voir l’échéance passer). Les images sont dessinées par
l’outil avec sharp. Chaque nœud, marque et attribut admis par la validation y figure ; l’outil
essaie aussi des documents que le backend doit refuser et affiche leur résultat. Il refuse toute
cible hors de la boucle locale (`BACKEND_URL` sur 127.0.0.1, localhost ou ::1), tout
`APP_ENV` autre que `development` et tout backend qui exige la 2FA : ces articles ne vont jamais
en production. Il est idempotent ; `-- --nettoyer` supprime les articles `demo-*`, puis leurs
images par l’API du backoffice, qui garde une image encore citée par un autre article.
Pour les voir : backend lancé depuis la racine, `npm run build`, puis `npm run serve` (qui lit
`BACKEND_URL` dans le `.env`) et `/blog` ; l’aperçu du brouillon demande une connexion au
backoffice sur la même origine.

Les illustrations de l’accueil jouent une scène propre à leur sujet à leur
première arrivée dans l’écran, puis la rejouent au clic sur le dessin ou au clavier. Le système
d’architecture fait circuler des messages en boucle
tant qu’il est visible ; les trois règles apparaissent dans l’ordre. Avec mouvement réduit,
sans JavaScript ou à l’impression, les illustrations restent complètes.

Les illustrations sont posées par `<Visuel id="…">` depuis le registre
`site/src/config/visuels.ts`. Une image générée a deux rendus dessinés, le jour et la nuit, tirés
de ses deux masters (`design/assets/visuels/<série>/`) par `npm run visuels:rendre` : `<Visuel>`
pose les deux et n’en montre qu’un, selon le thème (la nuit aussi dans un acte sombre, le jour à
l’impression) ; l’autre n’est ni lu ni téléchargé, avec ou sans JavaScript. Tant qu’un fichier manque, le site en ligne
montre un cadre neutre au bon ratio, avec l’alt du registre ; en développement (`astro dev`, ou
`VISUELS_BROUILLON=1` au build), un cadre hachuré affiche la consigne (identifiant, sujet,
composition, format). Un dessin SVG livré est inséré en ligne et suit les jetons.
`npm run visuels` liste ce qu’il reste à produire et `npm run visuels:doc` régénère
[`docs/visuels-a-generer.md`](docs/visuels-a-generer.md), la commande de production des images.

Le hub `/projets` commence par l’index des étiquettes de preuve, puis présente les neuf projets
en quatre familles : « Lead et équipe » (PvZ Fusion, en vedette), « Jeu vidéo » (Omnicard,
Bloodborne Legendary Run, League Of Data Base), « Outils » (gup, GitHealth) et « IA » (Karl
Scraper, Sillage, Relais). Chaque carte donne le besoin, un chiffre sourcé, le rôle, le statut et
les liens publics, et mène à la page du projet (« Voir le projet → »). Suivent la ligne des
relevés, le volet des projets archivés et le bloc « Contribuer ». Les démonstrations restent sur
les pages dédiées : gup utilise les données d’exemple de son dépôt, Bloodborne montre de vraies
captures, agrandissables au clic dans la visionneuse partagée, et les quatre projets entrés le
14 octobre 2026 se capturent sur leurs applications lancées en local, avec des données de
démonstration. La provenance des captures est détaillée dans `site/src/assets/projets/README.md`.

Le volet « Projets archivés » est replié par défaut. Depuis le 14 octobre 2026, il porte Life
Pixel, img-convertor et Shreksophone, l’ancienne rangée « Aussi », avec leurs vignettes et leurs
liens publics. Pour déplacer un projet hors de la vitrine, ajouter à `PROJETS_ARCHIVES`
(`site/src/config/projets.ts`) son identifiant, son nom, son résumé, sa vignette du registre et
soit sa page (`page`), soit ses liens publics (`liens`), puis retirer son entrée de `VITRINE` et
sa carte. S’il a une page, conserver son entrée dans `site/src/config/pages.ts` pour que les liens
existants continuent à fonctionner.

## Mise en ligne

**CI/CD automatique suspendue pendant la transition avec la V1.** Les push et les PR
ne déclenchent rien. Seul un lancement manuel (`workflow_dispatch`) peut exécuter la chaîne.
Pour réactiver les automatismes, rétablir dans `.github/workflows/ci.yml` les événements
`push` sur `[dev, main]` et `pull_request` sur `[dev]`.

Chaîne prévue après réactivation :

```
push dev  ->  tests  ->  fusion dev->test  ->  build (:sha + :staging)  ->  déploiement TEST
push main ->  promotion (:staging -> :prod)                             ->  déploiement PROD
```

La production ne reconstruit jamais : elle ré-étiquette les deux images validées en test,
après vérification de leur révision commune. L'edge TLS
(Caddy) et l'instance Umami appartiennent au dépôt `infra-vps` : ce dépôt ne fait que déclarer
ses domaines et son site Umami en étiquettes. Détails :
[`docs/deploiement.md`](docs/deploiement.md), [`docs/secrets.md`](docs/secrets.md),
[`docs/mesure-audience.md`](docs/mesure-audience.md).
