# Bascule de la V1 vers la V2

Ce document fait passer `charles-lindecker.com` de la V1 (dépôt `MonPortfolio`) à la V2, et met
la V1 en archive sur `yharnam.charles-lindecker.com`. Il liste, dans l’ordre, **tous les secrets
à poser et tous les gestes manuels**, puis ce que l’agent qui intègre la branche
`ci/bascule-v2-production` doit faire. Tout se passe sur l’hôte d’`infra-vps`, celui qui sert
déjà la V1.

Décisions prises le 2026-10-14 ([`questions.md`](prive/questions.md), bloc F) :

- **Sous-domaine de l’archive** : `yharnam.charles-lindecker.com`.
- **Version archivée** : la refonte d’août (autel, reliquaire, chronique et lanterne), celle de
  `test.charles-lindecker.com`, figée sur le commit `216d6b0` de `MonPortfolio`.

La règle qui commande l’ordre des étapes : **un domaine n’appartient jamais à deux projets en
même temps**. La V1 quitte `charles-lindecker.com` et `www.` avant que la V2 ne les déclare ; le
déploiement de la V2 refuse l’ordre inverse.

Coupure du domaine principal : **environ cinq minutes**, à la phase 3, entre l’arrêt de la V1 et
la fin du déploiement de la V2. Sans effet sur le référencement, à faire à un moment creux.

---

## Fait le 2026-10-15

| Étape | Heure (UTC) | Résultat |
|---|---|---|
| Archive de la V1 sur `yharnam.` | 13:07 | certificat, prérendu, bandeau et `noindex` vérifiés au déploiement |
| V2 en test sur `test.v2.` | 14:39 | 28 contrôles publics ; recette dans un navigateur : pages, thème, contact enregistré et notifié par e-mail, backoffice avec inscription 2FA |
| CI de la V1 coupée | 14:40 | `CI/CD` de `MonPortfolio` en `disabled_manually` |
| Piles de la V1 arrêtées | 14:40:13 | dossiers et `.env` gardés pour le retour arrière (§ 7) |
| V2 en production | 14:42:01 | 29 contrôles passés (`node scripts/verifier-bascule.mjs`), 18 pages sans erreur à 1 440 et 390 px |

Coupure du domaine principal : **environ deux minutes**. Écarts avec le déroulé qui suit :

- **Le dépôt est public.** Il a été recréé avec un historique réécrit, sans le cadrage ni les noms
  privés : le cadrage vit dans le dépôt privé `MonPortefolioV2-cadrage`, cloné dans
  `docs/prive/` ([`README`](../README.md), « Dossier privé »), et l’ancien dépôt, renommé
  `MonPortefolioV2-historique`, garde l’historique complet, en privé. Un onzième secret,
  `CADRAGE_DEPLOY_KEY` (clé de déploiement du cadrage, en lecture), sert aux tests ; il est
  aussi posé pour Dependabot.
- **Le test a repris `test.charles-lindecker.com`** une fois la V1 arrêtée : `test.v2.` et
  `test.yharnam.` ne servent plus (§ 6).
- **Première exécution réelle de la CI**, quatre défauts corrigés en route : le contrôle de
  l’archive (`printf … | grep -q` sous `pipefail` sur une page de 200 Ko), les délais d’un build à
  froid (plus de 1 000 images optimisées, près de 7 min) et le cache de ces images, et le rendu
  du texte par Chromium sous Linux (`--font-render-hinting=none`, `site/playwright.config.ts`).
- **Backoffice** : hors développement, l’inscription 2FA et la déconnexion échouaient en 415
  (mutation sans type JSON) ; corrigé et vérifié en test avant la mise en production.
- **Silence des alertes** (§ 5.5) : posé le même jour, 24 h, sur les deux piles de la V1.
- **Search Console** : sitemap renvoyé (18 pages découvertes, lu le 15/10) et indexation
  demandée pour 10 pages, jusqu’au quota du jour : `/`, `/projets`, `/parcours`, `/contact`,
  `/projets/pvz-fusion`, `omnicard`, `bloodborne-legendary-run`, `league-of-database`, `gup`,
  `githealth`. Restent, le lendemain : `karl-scraper`, `sillage`, `relais`,
  `/parcours/professionnel`, `/parcours/competences`, `/parcours/formation`, `/blog`,
  `/mentions-legales` (déjà dans le sitemap). Dépôts `MonPortfolio` et
  `MonPortefolioV2-historique` archivés sur GitHub.

---

## 0. Où en est-on (constaté le 2026-10-14)

| | État |
|---|---|
| Dépôt V2 | privé ; **aucun secret, aucune exécution de CI** ; `main` et `test` ne portent que le commit initial |
| `test.v2.charles-lindecker.com` | **aucun enregistrement DNS** : l’environnement de test de la V2 n’a jamais tourné |
| V1, production | pile `monportfolio-prod`, commit `78854e3` du 22 août, sur `charles-lindecker.com` et `www.` |
| V1, test | pile `monportfolio-staging`, refonte d’août (`216d6b0`), sur `test.charles-lindecker.com` |
| CI de la V1 | active (`push` sur `dev` et `main`) ; ses secrets sont posés |
| DNS | chez Hostinger (serveurs `ns1/ns2.dns-parking.com`) ; aucun enregistrement CAA |
| Hôte | l’adresse de `charles-lindecker.com` (`dig +short charles-lindecker.com`) |
| GHCR | l’image de la V1 est publique ; celles de la V2 et de l’archive n’existent pas encore |
| `infra-vps` | **rien à modifier** : l’edge, Umami et la supervision découvrent les sites par leurs étiquettes |

---

## 1. Ce que contient la branche

| Fichier | Rôle |
|---|---|
| `.github/workflows/ci.yml` | déclenchements rétablis : `push` sur `dev` et `main`, `pull_request` sur `dev` |
| `.github/workflows/archive-v1.yml` | construit l’archive depuis `MonPortfolio@216d6b0`, avec son bandeau et `SITE_URL` sur `yharnam.`, puis la déploie dans `/opt/monportfolio-archive` |
| `archive-v1/` | pile Compose de l’archive, bandeau « archive » posé dans le gabarit de la V1 et son test ([`README`](../archive-v1/README.md)) |
| `scripts/deploy-archive-v1.sh` | mise en ligne de l’archive sur l’hôte : refuse le domaine de la V2, vérifie certificat, prérendu, bandeau et `noindex` |
| `scripts/verifier-bascule.mjs` | contrôle public de la bascule, depuis le poste : indexabilité, `www.`, les 8 redirections de la V1, l’archive hors index |
| `compose.yaml` | le relais joint le backend par l’alias `portfolio-backend`, comme le veut le contrat d’`infra-vps` sur les réseaux partagés |
| `site/src/config/site.ts`, `layouts/Base.astro` | balise de vérification Search Console de la V1, gardée sur l’accueil |
| `site/src/config/site.ts`, `PiedDePage.astro` | lien « La première version de ce site ↗ » vers l’archive |
| `.github/workflows/_tests.yml` | job `infra` : shellcheck du nouveau script, tests des outils, pile de l’archive et alias du backend |

Le dépôt `MonPortfolio` n’est pas modifié : l’archive se construit depuis ce dépôt-ci, en lisant
la V1 publique à un commit fixe. La CI de la V1 peut donc être coupée sans perdre l’archive.

---

## 2. Pour l’agent qui intègre la branche

1. Fusionner `ci/bascule-v2-production` dans `dev`. Les conflits éventuels se limitent aux
   documents (`AGENTS.md`, `docs/`) et à `site/src/config/site.ts` : garder les deux côtés.
2. Vérifier, dans `site/` : `npm run check`, `npm test`, `npm run test:e2e` ; à la racine :
   `node --test scripts/verifier-bascule.test.mjs archive-v1/bandeau/poser.test.mjs`.
3. **Ne pas pousser `dev` avant que la phase 1 soit faite** (secrets et DNS). Pousser `dev`
   lance deux chaînes : la CI de la V2 (tests, fusion dans `test`, déploiement de test) et
   l’archive (construction et mise en ligne sur `yharnam.`). Sans secrets, elles échouent.
4. Ne rien pousser sur `main` : c’est la phase 3, qui coupe le domaine.
5. Ne pas toucher au dépôt `MonPortfolio`.

---

## 3. Phase 1 — Préparer (aucun effet visible)

### 3.1 DNS, chez Hostinger

hPanel → Domaines → `charles-lindecker.com` → DNS / Nameservers → Gérer les enregistrements DNS.

| Type | Nom | Valeur | TTL |
|---|---|---|---|
| A | `yharnam` | l’adresse de l’hôte (celle de l’enregistrement `@`) | 300 |
| A | `test.v2` | l’adresse de l’hôte | 300 |

Ne pas toucher aux enregistrements `@`, `www` et `test` : la bascule se fait sur le même hôte,
le DNS du domaine principal ne change pas.

```bash
dig +short charles-lindecker.com           # l'adresse de l'hôte
dig +short yharnam.charles-lindecker.com   # la même
dig +short test.v2.charles-lindecker.com   # la même
```

Sans ces deux enregistrements, Let’s Encrypt échoue et l’edge met l’émission en attente.

### 3.2 Clé SSH de déploiement de la V2

Une clé propre à ce dépôt, distincte de la tienne et de celle de la V1 :

```bash
ssh-keygen -t ed25519 -C "github-actions-monportefoliov2" -f ~/.ssh/portfolio_v2_deploy -N ""
ssh-copy-id -i ~/.ssh/portfolio_v2_deploy.pub root@charles-lindecker.com
ssh -i ~/.ssh/portfolio_v2_deploy root@charles-lindecker.com 'docker version --format {{.Server.Version}}'
```

### 3.3 Les deux fichiers d’environnement

Les remplir sur ton poste, **hors du dépôt** (ils ne se committent jamais) :

```bash
cp .env.test.example ~/portfolio-v2.env.test
cp .env.prod.example ~/portfolio-v2.env.prod
openssl rand -hex 32    # BACKEND_PROXY_TOKEN : une valeur pour le test, une autre pour la prod
openssl rand -hex 32    # BACKOFFICE_TOTP_ENCRYPTION_KEY : idem, une par environnement
```

| Clé | `ENV_TEST` | `ENV_PROD` |
|---|---|---|
| `COMPOSE_PROJECT_NAME` | `portfolio-test` | `portfolio-prod` |
| `IMAGE_TAG` | `staging` | `prod` |
| `APP_ENV` | `test` | `production` |
| `CADDY_DOMAINS` | `test.v2.charles-lindecker.com` | `charles-lindecker.com, www.charles-lindecker.com` |
| `ROBOTS_TAG` | `noindex` | `all` |
| `REDIRECT_HOSTS` / `CANONICAL_ORIGIN` | vides | `www.charles-lindecker.com` / `https://charles-lindecker.com` |
| `BACKEND_PROXY_TOKEN` | secret A (32 à 256 caractères) | secret B, différent |
| `CONTACT_EMAIL` | adresse initiale du formulaire | idem |
| `BACKOFFICE_EMAIL` | adresse de connexion | idem |
| `BACKOFFICE_PASSWORD` | mot de passe de test, **entre apostrophes** | mot de passe de prod, différent |
| `BACKOFFICE_TOTP_ENCRYPTION_KEY` | clé A | clé B, différente, **à sauvegarder** avec la base |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_TLS`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_FROM` | relais SMTP (facultatif : sans lui, les demandes restent dans le backoffice) | idem |
| `UMAMI_WEBSITE_ID`, `UMAMI_SITE_DOMAIN`, `UMAMI_SITE_NAME` | valeurs du modèle (site « Portfolio V2 (test) ») | **laisser commentées** : la mesure en production suit [`mesure-audience.md`](mesure-audience.md) § 7 |
| `TLS_ASSERT` | `1` | `1` |

Le détail de chaque clé est dans [`secrets.md`](secrets.md) § 2.

### 3.4 Les secrets GitHub de la V2

Dix secrets, tous dans `LINDECKER-Charles/MonPortefolioV2`. L’archive n’en demande aucun de plus :
elle réutilise ceux de la production (même hôte, même clé).

```bash
REPO=LINDECKER-Charles/MonPortefolioV2
HOTE="$(dig +short charles-lindecker.com)"

gh secret set TEST_HOST     --repo "$REPO" --body "$HOTE"
gh secret set TEST_SSH_USER --repo "$REPO" --body root
gh secret set TEST_SSH_KEY  --repo "$REPO" < ~/.ssh/portfolio_v2_deploy
gh secret set TEST_PATH     --repo "$REPO" --body /opt/portfolio-test
gh secret set ENV_TEST      --repo "$REPO" < ~/portfolio-v2.env.test

gh secret set PROD_HOST     --repo "$REPO" --body "$HOTE"
gh secret set PROD_SSH_USER --repo "$REPO" --body root
gh secret set PROD_SSH_KEY  --repo "$REPO" < ~/.ssh/portfolio_v2_deploy
gh secret set PROD_PATH     --repo "$REPO" --body /opt/portfolio-prod
gh secret set ENV_PROD      --repo "$REPO" < ~/portfolio-v2.env.prod

gh secret list --repo "$REPO"     # les 10
```

> Toujours passer la clé et les fichiers par redirection (`<`), jamais par `--body "$(cat …)"` :
> la dernière ligne serait mangée, et la clé refusée (`Permission denied (publickey)`).

Les secrets de la V1 (`STAGING_*`, `PROD_*`, `ENV_*`, `ACME_EMAIL` dans `MonPortfolio`) ne
changent pas et ne servent plus après la phase 3.

### 3.5 L’hôte

Ces prérequis valent déjà pour la V1 ; les vérifier suffit :

```bash
ssh root@charles-lindecker.com '
  docker network inspect edge >/dev/null && echo "edge OK"
  command -v docker curl >/dev/null && docker compose version
  grep -q max-size /etc/docker/daemon.json && echo "rotation des journaux OK"
  grep -c ghcr.io ~/.docker/config.json 2>/dev/null || echo "pas de connexion ghcr.io"
'
```

La dernière ligne dit si l’hôte est connecté à GHCR. S’il ne l’est pas, les trois images de la
phase 2 devront être rendues publiques (§ 4.2).

### 3.6 Search Console

Rien d’obligatoire : la V2 garde sur son accueil la balise de vérification de la V1, la propriété
reste donc vérifiée après la bascule. Recommandé, à faire quand tu veux : ajouter une **propriété
de type Domaine** (`charles-lindecker.com`), vérifiée par un enregistrement TXT chez Hostinger.
Elle couvre d’un coup l’apex, `www.`, l’archive et les sous-domaines de test, et ne dépend plus du
contenu du site.

---

## 4. Phase 2 — Intégrer : l’archive et la V2 en test (aucune coupure)

### 4.1 Pousser `dev`

L’agent intègre la branche (§ 2) puis pousse `dev`. Deux exécutions démarrent :

```bash
gh run list --repo LINDECKER-Charles/MonPortefolioV2 --limit 4
gh run watch --repo LINDECKER-Charles/MonPortefolioV2
```

- **CI/CD** : tests, fusion `dev → test`, construction des deux images (`:staging`),
  déploiement sur `test.v2.charles-lindecker.com`.
- **Archive V1** : construction de l’image `monportfolio-archive`, déploiement sur
  `yharnam.charles-lindecker.com`. La V1 continue de servir le domaine principal.

### 4.2 Première fois : rendre les images lisibles par l’hôte

Les images naissent privées, comme le dépôt. Si l’hôte n’est pas connecté à GHCR (§ 3.5), les
deux déploiements échouent au `docker compose pull`, avec un message qui renvoie ici. Rendre
publics les trois paquets (ils ne contiennent que le site compilé, son serveur et l’API compilée) :

> GitHub → ton profil → Packages → `monportefoliov2`, `monportefoliov2-backend`,
> `monportfolio-archive` → Package settings → Change visibility → Public.

Puis rejouer les seuls jobs en échec :

```bash
gh run rerun <id-de-l-execution> --failed --repo LINDECKER-Charles/MonPortefolioV2
```

Autre option, garder les paquets privés : connecter l’hôte avec un jeton `read:packages`
([`secrets.md`](secrets.md) § 4d).

### 4.3 Vérifier

```bash
node scripts/verifier-bascule.mjs --site https://test.v2.charles-lindecker.com --indexable non --www=
```

Attendu : tout en `✓`. La V2 en test reste hors index, ses 8 redirections répondent, l’archive
sert son bandeau, hors index, avec des balises canoniques sur `yharnam.`.

Puis la recette à la main, sur `https://test.v2.charles-lindecker.com` :

- les pages, la bascule jour et nuit, le pied de page et son lien vers l’archive ;
- le formulaire de contact (la demande arrive dans le backoffice, et par e-mail si SMTP est posé) ;
- `/backoffice` : connexion, inscription TOTP, **conserver les huit codes de secours** ;
- le blog : un brouillon, un aperçu, une publication.

Et sur `https://yharnam.charles-lindecker.com` : le bandeau en bas de l’écran, la navigation.

---

## 5. Phase 3 — Basculer (environ cinq minutes de coupure)

À un moment creux, d’une traite.

### 5.1 Couper la CI de la V1

Sans ça, un prochain push sur la V1 (Dependabot compris) redéploierait sa production et
redéclarerait le domaine principal.

```bash
gh workflow disable "CI/CD" --repo LINDECKER-Charles/MonPortfolio
gh workflow list --all --repo LINDECKER-Charles/MonPortfolio    # CI/CD : disabled_manually
```

### 5.2 Arrêter les piles de la V1

```bash
ssh root@charles-lindecker.com '
  cd /opt/monportfolio-prod && docker compose down
  cd /opt/monportfolio-staging && docker compose down
  docker ps --format "{{.Names}}" | grep monportfolio
'
```

La dernière commande ne doit lister que `monportfolio-archive-web-1`. Les dossiers et leur `.env`
restent en place : c’est ce qui permet de revenir en arrière (§ 7). **Dès cet instant, le domaine
principal ne répond plus : enchaîner.**

### 5.3 Mettre la V2 en production

La fusion `test → main` est la porte humaine qui promeut en production :

```bash
git fetch origin
git switch main
git merge --ff-only origin/test     # main ne porte que le commit initial : avance rapide
git push origin main
gh run watch --repo LINDECKER-Charles/MonPortefolioV2
```

La chaîne ré-étiquette `:staging` en `:prod` (aucune reconstruction), vérifie que plus aucun
autre projet ne déclare les domaines, démarre `portfolio-prod`, attend les deux services sains et
contrôle les certificats.

### 5.4 Vérifier

```bash
node scripts/verifier-bascule.mjs
```

Attendu : tout en `✓`. La V2 indexable, `www.` en 301 vers l’apex, les 8 routes de la V1 en 301,
l’archive hors index.

### 5.5 Faire taire l’alerte attendue

`infra-vps` signale pendant 24 h un service disparu quand une pile s’arrête. Ici, c’est voulu :

```bash
ssh root@charles-lindecker.com '
  cd /opt/observability
  for pile in monportfolio-prod monportfolio-staging; do
    docker compose exec -T alertmanager amtool silence add --alertmanager.url=http://localhost:9093 \
      --duration=24h --comment="bascule V1 vers V2" alertname=ServiceDisparu stack=$pile service=front
  done
'
```

---

## 6. Phase 4 — Après la bascule

- **Search Console**, le jour même : Sitemaps → soumettre `https://charles-lindecker.com/sitemap.xml` ;
  Inspection de l’URL → `/` puis `/projets` → Demander une indexation. Dans les semaines qui
  suivent, le rapport Pages range les adresses de la V1 en « Page avec redirection » : c’est
  l’effet attendu des 301.
- **Garder les redirections pour toujours** (`site/server/redirections.mjs`) : des CV déjà
  envoyés pointent encore vers `/resume` ou `/projects`.
- **DNS** : supprimer `test.v2` et `test.yharnam`, qui ne servent plus ; `test` sert désormais le
  test de la V2.
- **Dépôt `MonPortfolio`** : désactiver ses mises à jour Dependabot (Settings → Code security), ou
  archiver le dépôt sur GitHub. L’archive n’en a besoin qu’en lecture.
- **Mémoire** : après une semaine, rederiver les limites (256 Mio pour le site et l’archive,
  128 Mio pour l’API) avec
  `max_over_time(container_memory_working_set_bytes{stack=~"portfolio-prod|monportfolio-archive"}[7d])`.
- **Documentation** : fait le 2026-10-15 ([`deploiement.md`](deploiement.md), « État du projet »
  dans `AGENTS.md`).

---

## 7. Revenir en arrière

**La V2 ne démarre pas en production (phase 3).** La V1 est arrêtée mais intacte :

```bash
ssh root@charles-lindecker.com '
  cd /opt/portfolio-prod && docker compose down     # si la pile a démarré à moitié
  cd /opt/monportfolio-prod && docker compose up -d
'
```

Le `.env` de `monportfolio-prod` porte encore ses domaines et son `COMPOSE_FILE` : la V1 reprend
le domaine principal en une minute. Ne pas réactiver sa CI ; corriger la V2 sur `dev`, la faire
passer par le test, puis rejouer la phase 3.

**Un défaut découvert après la bascule** : corriger sur `dev` et promouvoir comme d’habitude, ou
épingler la version saine ([`deploiement.md`](deploiement.md), « Revenir en arrière »).

**L’archive** est indépendante : `docker compose down` dans `/opt/monportfolio-archive` la retire
sans toucher au reste, et `gh workflow run archive-v1.yml --ref main` la remet en ligne.

---

## 8. Points ouverts

- **Sauvegarde de la base de production.** Le volume `portfolio-data` (demandes de contact, blog,
  inscription 2FA) est une base SQLite. La pile `sauvegardes` d’`infra-vps` ne sauvegarde que des
  bases Postgres : rien ne copie encore ce volume hors de l’hôte. À décider : étendre
  `infra-vps`, ou une copie chiffrée propre au projet (`docs/APPLICATIONS.md` d’`infra-vps`, fin
  du chapitre sauvegardes), avec la clé `BACKOFFICE_TOTP_ENCRYPTION_KEY`
  ([`backend/README.md`](../backend/README.md), « Données et sauvegarde »).
- **Mesure d’audience en production** : préparée, à activer selon
  [`mesure-audience.md`](mesure-audience.md) § 7.
