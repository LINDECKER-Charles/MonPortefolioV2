# MonPortefolioV2

Portfolio de Charles Lindecker, version 2 : un **mode d'emploi**. L'accueil raconte, de haut en
bas, l’origine, aujourd’hui, puis « La suite, à plusieurs » : une invitation au contact et à la
contribution open source. Cette nouvelle conclusion est un essai autorisé le 2026-10-08,
à évaluer. Pages produites par [Astro](https://astro.build), servies par un petit serveur
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
| `npm test` | tests unitaires (Vitest) et tests du serveur (`node --test`) |
| `npm run test:e2e` | build + tests navigateur (Playwright, Chromium à 390 et 1440 px, axe) |

Première exécution des tests navigateur : `npx playwright install chromium`.

```bash
docker compose up --build    # les deux services, http://127.0.0.1:4000
```

Les demandes du formulaire sont conservées dans une base SQLite persistante, puis notifiées
par e-mail si le relais SMTP est configuré. Un succès confirme leur enregistrement ; une panne
SMTP ne fait pas perdre la demande. Renseigner `SMTP_HOST`, `SMTP_FROM` et les réglages du relais
pour activer les notifications.

Le **backoffice `/backoffice`** rassemble les demandes (nouvelles, lues, archivées), leur état de
notification, le blog, l’adresse de contact, les liens de la boîte à outils et les jetons MCP. L’adresse
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

Depuis le backoffice, créer un jeton par client pour consulter les demandes et gérer le blog via
le MCP distant `https://<domaine>/mcp`. Choisir ses permissions : lecture, rédaction ou publication.
Les jetons existants restent en lecture ; la rédaction et la publication sont des autorisations
distinctes. La lecture des contacts ne marque aucune demande comme lue.
Les jetons peuvent être révoqués individuellement. Connexion Claude/Codex, contrat de
l’API et sauvegarde de la base : [`backend/README.md`](backend/README.md).

## Carte du dépôt

| Chemin | Rôle |
|---|---|
| `docs/` | cadrage (brief, questionnaire, matière première, briefs d'assets) et exploitation (déploiement, secrets, mesure d'audience) |
| `design/` | maquettes et assets sources (logo, pictogrammes, illustrations, photos) |
| `site/` | le site Astro ; son `Dockerfile` produit l'image publiée |
| `site/src/` | pages, composants, scripts, styles, configuration du contenu |
| `site/server/` | serveur de production : 301 de la V1, 404, cache, en-têtes, mesure `/mesure.js`, adresse persistée et relais API/MCP |
| `backend/` | API Rust (Axum), SQLite, contacts, administration, notifications SMTP et MCP ; image Docker indépendante |
| `site/tools/` | contrôles du site construit (SEO, CSP, ancres, typographie française, budgets) |
| `site/tests/` | `unit/` (Vitest) et `e2e/` (Playwright) |
| `compose*.yaml`, `.env*.example` | piles Compose et modèles d'environnement |
| `scripts/deploy-remote.sh` | ce qui s'exécute sur le VPS à chaque déploiement |
| `.github/workflows/` | `ci.yml` orchestre ; `_tests`, `_build`, `_promote`, `_deploy` font le travail |

## Pages et contenu

L’accueil garde le récit. Les pages `/projets`, `/parcours`, `/contact` et `/blog` sont accessibles
depuis la navigation et reliées entre elles. L’essai de conclusion conserve trois chapitres :
`origine`, `aujourdhui` et `discutons` (03, « La suite, à plusieurs »). Les sections séparées de
preuves et de loisirs sont retirées ; les réalisations continuent à étayer le récit. Le CTA
principal « Parlons de votre projet » ouvre `/contact`, et « Contribuer à mes projets open source »
ouvre le profil GitHub public en attendant un parcours de contribution sur Projets. La navigation
finale « Pour aller plus loin » mène à Projets, Parcours et Blog.

Les premières études de cas ont chacune un fichier
Astro dans `site/src/pages/projets/` : `pvz-fusion.astro`, `omnicard.astro`, `gup.astro` et
`bloodborne-legendary-run.astro`. Leur
mise en page reste indépendante ; elles partagent seulement le cadre et les composants utiles.

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

Pour ajouter un projet, créer sa page statique, l’inscrire dans l’index des projets et dans
`site/src/pages/sitemap.xml.ts`, puis ajouter son adresse à `PAGES` dans le support des tests
navigateur. Le build vérifie les liens internes et la cohérence du sitemap. Les descriptions
doivent faire 110 à 165 caractères, les titres 65 caractères au plus.

Le blog se gère dans **`/backoffice/blog`**, avec une liste filtrable et des liens vers chaque
article. Quatre pages distinctes partagent la version de travail : **Rédaction**, **Images**,
**Référencement** et **Publication**. Leurs adresses `/backoffice/blog/redaction?id=…`,
`/backoffice/blog/medias?id=…`, `/backoffice/blog/seo?id=…` et
`/backoffice/blog/publication?id=…` se rechargent directement. Changer de page dans l’article
conserve les retouches ; quitter l’article demande confirmation si elles ne sont pas enregistrées.
Les commandes **Enregistrer** et **Aperçu** restent accessibles pendant la rédaction.
L’éditeur propose titres, listes, liens,
citations, code, tableaux, alignements, images avec légendes et descriptions, couverture et image
de partage. Les réglages SEO comprennent titre, description, slug, canonical, indexation et aperçu
du résultat de recherche. Les images JPEG, PNG, WebP et GIF (4 Mio maximum) sont conservées dans
la même base SQLite que les articles ; ses sauvegardes incluent donc les médias.

Un article commence en brouillon. **Enregistrer** conserve la version de travail ; **Aperçu**
ouvre la mise en page réelle dans une page privée, sans mesure ni indexation. **Publier** copie
explicitement cette version sur `/blog/<slug>`. Modifier un article publié garde sa version
publique jusqu’à sa nouvelle publication. **Programmer** capture la version enregistrée pour
l’échéance choisie ; les retouches suivantes restent privées jusqu’à une nouvelle programmation.
La date est saisie dans le fuseau affiché par l’interface puis enregistrée en UTC. Le backend
rattrape les échéances au démarrage et les traite chaque minute ainsi qu’à la lecture publique.
Il doit rester démarré pour assurer les publications à l’heure prévue.

Les douze outils MCP du blog permettent les mêmes opérations, y compris les images, l’aperçu et
l’audit SEO. Les révisions empêchent une IA et l’éditeur d’écraser leurs changements respectifs.
Les articles publics contiennent leur texte et leurs métadonnées dans le HTML, avec balisage
`BlogPosting` et sitemap actualisé. Aucun article fictif n’est publié. Contrat complet et exemple
de document structuré : [`backend/README.md`](backend/README.md).

Les illustrations de l’accueil jouent une scène propre à leur sujet à leur
première arrivée dans l’écran, puis la rejouent au clic sur le dessin ou au clavier. Le système
d’architecture fait circuler des messages en boucle
tant qu’il est visible ; les trois règles apparaissent dans l’ordre. Avec mouvement réduit,
sans JavaScript ou à l’impression, les illustrations restent complètes.

Le hub `/projets` commence par un projet à la une, puis oriente vers « Jouer et explorer » ou
« Simplifier le quotidien » par des ancres vers deux sections toujours visibles. Sa sélection comprend GUP, Bloodborne Legendary Run et PVZF
Translation. Les données de la sélection et le choix éditorial de la vedette se règlent dans
`site/src/config/projets.ts`. La vedette et les cartes montrent des captures statiques et mènent
directement aux pages des projets, sans fenêtre d’aperçu. Les démonstrations restent sur les
pages dédiées : GUP utilise les données d’exemple de son dépôt et Bloodborne montre de vraies
captures, agrandissables au clic. Les trois écrans de reprise de partie sont présentés entiers,
sans recadrage, et occupent une ligne chacun sur téléphone. Les nouvelles captures
Bloodborne et GUP proviennent de leurs interfaces locales sur données d’exemple ; leur
provenance est détaillée dans `site/src/assets/projets/README.md`.

Le volet « Projets archivés » est replié par défaut et vide pour l’instant. Pour déplacer un projet
hors de la vitrine, ajouter son nom, son adresse et son résumé dans
`site/src/config/projets.ts`, puis retirer son entrée de la sélection. Conserver sa page et son
entrée dans le sitemap pour que les liens existants continuent à fonctionner.

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
