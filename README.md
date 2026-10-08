# MonPortefolioV2

Portfolio de Charles Lindecker, version 2 : un **mode d'emploi**. L'accueil raconte, de haut en
bas, l'origine, aujourd'hui, les preuves et ce qui fait la personne, avec un seul appel à
l'action. Site statique produit par [Astro](https://astro.build), servi par un petit serveur
Node sans dépendance, en conteneur derrière l'edge TLS mutualisé du VPS.

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

`CONTACT_EMAIL` dans le `.env` racine pilote l’adresse affichée et le destinataire du
formulaire. Le serveur remplace l’adresse dans le HTML avant de le servir : les liens e-mail,
la copie et les mentions légales fonctionnent aussi sans JavaScript. Redémarrer après un
changement d’adresse suffit ; l’image Astro n’a pas besoin d’être reconstruite.

Pour activer l’envoi, renseigner `SMTP_HOST`, `SMTP_FROM` et les réglages du relais dans
`.env`. Sans SMTP, le backend démarre et le formulaire affiche une indisponibilité avec le
lien e-mail. Le formulaire ne confirme un succès qu’après acceptation par le relais SMTP.
Contrat de l’API et commandes Rust : [`backend/README.md`](backend/README.md).

## Carte du dépôt

| Chemin | Rôle |
|---|---|
| `docs/` | cadrage (brief, questionnaire, matière première, briefs d'assets) et exploitation (déploiement, secrets, mesure d'audience) |
| `design/` | maquettes et assets sources (logo, pictogrammes, illustrations, photos) |
| `site/` | le site Astro ; son `Dockerfile` produit l'image publiée |
| `site/src/` | pages, composants, scripts, styles, configuration du contenu |
| `site/server/` | serveur de production : 301 de la V1, 404, cache, en-têtes, mesure `/mesure.js`, configuration de l’adresse et relais API |
| `backend/` | API Rust (Axum), formulaire de contact et livraison SMTP ; image Docker indépendante |
| `site/tools/` | contrôles du site construit (SEO, CSP, ancres, typographie française, budgets) |
| `site/tests/` | `unit/` (Vitest) et `e2e/` (Playwright) |
| `compose*.yaml`, `.env*.example` | piles Compose et modèles d'environnement |
| `scripts/deploy-remote.sh` | ce qui s'exécute sur le VPS à chaque déploiement |
| `.github/workflows/` | `ci.yml` orchestre ; `_tests`, `_build`, `_promote`, `_deploy` font le travail |

## Pages et contenu

L’accueil garde le récit. Les pages `/projets`, `/parcours`, `/contact` et `/blog` sont accessibles
depuis la navigation et reliées entre elles. Les premières études de cas ont chacune un fichier
Astro dans `site/src/pages/projets/` : `pvz-fusion.astro`, `omnicard.astro` et `gup.astro`. Leur
mise en page reste indépendante ; elles partagent seulement le cadre et les composants utiles.

Pour ajouter un projet, créer sa page statique, l’inscrire dans l’index des projets et dans
`site/src/pages/sitemap.xml.ts`, puis ajouter son adresse à `PAGES` dans le support des tests
navigateur. Le build vérifie les liens internes et la cohérence du sitemap. Les descriptions
doivent faire 110 à 165 caractères, les titres 65 caractères au plus.

Le blog est ouvert sans article. Son mode d’alimentation reste à décider ; aucun CMS ni contenu
fictif n’est ajouté. Les figures de l’accueil se détaillent au clic ou au clavier, sans animation
quand le navigateur demande de réduire le mouvement.

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
