# Secrets et variables à configurer

Tout ce qu'il faut poser pour que `git push` mette le portfolio en ligne sur le VPS mutualisé. Rien
de sensible ne vit dans le dépôt : les valeurs sont dans les secrets GitHub du dépôt
`LINDECKER-Charles/MonPortefolioV2`, et arrivent sur l'hôte sous forme de `.env` en `chmod 600`.

Trois niveaux, à ne pas confondre :

| Niveau | Où | Qui le pose |
|---|---|---|
| **Secrets GitHub du dépôt** | Settings → Secrets and variables → Actions | Charles, une fois |
| **Contenu de `ENV_TEST` / `ENV_PROD`** | dans les deux secrets ci-dessus | Charles, une fois, puis à chaque changement |
| **Prérequis sur l'hôte** | le VPS lui-même | Charles, une fois par machine |

Les secrets de la V1 (`STAGING_*`, `ENV_STAGING`, `REPO_URL`…) vivent dans le dépôt
`MonPortfolio` : la V2 n'en reprend aucun.

---

## 1. Secrets GitHub du dépôt

Onze secrets : cinq par environnement, et la clé du cadrage privé pour les tests. Aucun n'a de
valeur par défaut sauf `*_SSH_USER` : la chaîne
échoue tôt et bruyamment s'il en manque un, plutôt que de déployer à moitié.

### Environnement de test (branche `test`)

| Secret | Obligatoire | Contenu | Exemple |
|---|---|---|---|
| `TEST_HOST` | oui | IP ou FQDN du VPS | `203.0.113.10` |
| `TEST_SSH_USER` | non | utilisateur SSH (`root` si omis) | `root` |
| `TEST_SSH_KEY` | oui | clé privée SSH, **entière** (lignes `BEGIN`/`END` comprises) | voir § 3 |
| `TEST_PATH` | oui | chemin absolu du projet sur l'hôte | `/opt/portfolio-test` |
| `ENV_TEST` | oui | le `.env` complet de l'environnement de test (multi-lignes) | voir § 2 |

### Environnement de production (branche `main`)

| Secret | Obligatoire | Contenu | Exemple |
|---|---|---|---|
| `PROD_HOST` | oui | IP ou FQDN du VPS | `203.0.113.10` |
| `PROD_SSH_USER` | non | utilisateur SSH (`root` si omis) | `root` |
| `PROD_SSH_KEY` | oui | clé privée SSH, entière | voir § 3 |
| `PROD_PATH` | oui | chemin absolu du projet sur l'hôte | `/opt/portfolio-prod` |
| `ENV_PROD` | oui | le `.env` complet de la production | voir § 2 |

> Test et production vivent sur la **même machine**, celle de la V1 : `TEST_HOST` et `PROD_HOST`
> portent alors la même valeur, et `TEST_SSH_KEY` / `PROD_SSH_KEY` la même clé. Ils restent deux
> secrets distincts pour qu'un jour, séparer les deux environnements ne demande que de changer une
> valeur.
>
> Ce qui les isole n'est pas l'hôte mais `COMPOSE_PROJECT_NAME` (§ 2) : deux noms de projet
> Compose distincts, ce sont deux espaces de noms de conteneurs, de réseaux et de volumes
> distincts. Les chemins, eux, ne doivent jamais être ceux de la V1 (`/opt/monportfolio-staging`,
> `/opt/monportfolio-prod`).

### Tests (toutes branches)

| Secret | Obligatoire | Contenu |
|---|---|---|
| `CADRAGE_DEPLOY_KEY` | oui | clé privée SSH d'une clé de déploiement **en lecture seule** du dépôt privé `MonPortefolioV2-cadrage`, que `_tests` clone dans `docs/prive/` pour les garde-fous de confidentialité et de citations |

Le même secret est posé pour Dependabot (`gh secret set CADRAGE_DEPLOY_KEY --app dependabot`) :
une PR de Dependabot ne lit pas les secrets d'Actions. Pour le renouveler : une nouvelle paire
(`ssh-keygen -t ed25519`), la clé publique en clé de déploiement du cadrage
(`gh repo deploy-key add … --repo LINDECKER-Charles/MonPortefolioV2-cadrage`), la privée dans les
deux secrets, puis retirer l'ancienne clé de déploiement.

### Fourni automatiquement

| Secret | Pourquoi il n'est pas dans la liste |
|---|---|
| `GITHUB_TOKEN` | injecté par GitHub à chaque exécution. C'est lui qui pousse la fusion `dev -> test`, publie l'image sur GHCR (`_build`) et la ré-étiquette (`_promote`). Rien à créer. |

---

## 2. Contenu de `ENV_TEST` et `ENV_PROD`

Ce sont des secrets **multi-lignes**, et c'est volontaire : les pousser en un bloc évite d'avoir
dix secrets à garder synchronisés, et le fichier arrive sur l'hôte en `chmod 600`.

Les modèles versionnés sont [`.env.test.example`](../.env.test.example) et
[`.env.prod.example`](../.env.prod.example), commentés ligne à ligne. Le modèle de test
contient les valeurs publiques ; chaque environnement demande son jeton de relais et sa
configuration SMTP pour l’envoi réel. Récapitulatif :

| Clé | Obligatoire | Test | Production | Rôle |
|---|---|---|---|---|
| `COMPOSE_PROJECT_NAME` | oui | `portfolio-test` | `portfolio-prod` | isole les piles sur la même machine |
| `COMPOSE_FILE` | non | `compose.yaml:compose.deploy.yaml:compose.umami.yaml` | `compose.yaml:compose.deploy.yaml` | confort : un `docker compose` lancé à la main dans le dossier charge les bons calques. Le déploiement choisit les siens et signale un écart |
| `WEB_IMAGE` | non | `ghcr.io/lindecker-charles/monportefoliov2` | idem | image publiée par la CI |
| `BACKEND_IMAGE` | non | `ghcr.io/lindecker-charles/monportefoliov2-backend` | idem | image Rust publiée avec le site |
| `IMAGE_TAG` | oui | `staging` | `prod` | étiquette mobile déployée |
| `CONTACT_EMAIL` | base neuve | adresse initiale | adresse initiale | initialisation seulement ; ensuite l’adresse est modifiée dans le backoffice |
| `APP_ENV` | non | `test` | `production` | `production` par défaut ; seule la valeur `development` dispense de 2FA, réservée au poste local |
| `BACKOFFICE_EMAIL` | pour administrer | adresse de connexion | adresse de connexion | identifiant indépendant de l’adresse publique de contact |
| `BACKOFFICE_PASSWORD` | pour administrer | secret propre au test | secret propre à la production | au moins 12 octets, entre apostrophes dans `.env` ; le backend calcule l’empreinte Argon2id |
| `BACKOFFICE_TOTP_ENCRYPTION_KEY` | pour administrer hors dev | clé propre au test | clé propre à la production | `openssl rand -hex 32` ; chiffre le secret TOTP et, par une sous-clé, le mot de passe SMTP du backoffice en SQLite ; accompagne les sauvegardes |
| `BACKOFFICE_COOKIE_SECURE` | non | `true` | `true` | cookie sécurisé sur HTTPS ; `false` réservé au HTTP local |
| `BACKEND_PROXY_TOKEN` | oui | secret propre au test | secret propre à la production | protège la transmission de l’IP entre Node et Rust ; `openssl rand -hex 32` |
| `SMTP_HOST` | non : repli | relais SMTP | relais SMTP | repli quand aucun serveur d’envoi n’est réglé dans le backoffice ; sans l’un ni l’autre, demandes conservées sans notification e-mail |
| `SMTP_FROM` | avec le relais | expéditeur autorisé | expéditeur autorisé | adresse acceptée par le fournisseur SMTP ; le visiteur reste dans `Reply-To` |
| `SMTP_PORT`, `SMTP_TLS` | non | `587`, `starttls` | idem | STARTTLS obligatoire ou TLS direct (`465`, `tls`) ; `none` seulement sur boucle locale |
| `SMTP_USERNAME`, `SMTP_PASSWORD` | ensemble si nécessaires | compte SMTP | compte SMTP | identifiants du relais, uniquement dans le backend |
| `CADDY_DOMAINS` | **oui** | `test.charles-lindecker.com` | `charles-lindecker.com, www.charles-lindecker.com` | domaines servis par l'edge partagé |
| `ROBOTS_TAG` | non | `noindex` | `all` | en-tête `X-Robots-Tag` posé par l'edge |
| `REDIRECT_HOSTS` | non | — | `www.charles-lindecker.com` | hôtes renvoyés en 301 vers `CANONICAL_ORIGIN` par le serveur du site |
| `CANONICAL_ORIGIN` | avec `REDIRECT_HOSTS` | — | `https://charles-lindecker.com` | origine canonique (https, sans chemin) |
| `UMAMI_WEBSITE_ID` | pour mesurer | `100ee54a-6c1f-46cc-a67e-8ac78d57d51d` | plus tard : `0450b7ff-eb45-4328-a93e-496cd25b3348` | active la mesure d'audience : ajoute `compose.umami.yaml` |
| `UMAMI_SITE_DOMAIN` | avec l'ID | `test.charles-lindecker.com` | `charles-lindecker.com` | nom d'hôte nu mesuré (`data-domains`, `umami.domain`) |
| `UMAMI_SITE_NAME` | avec l'ID | `Portfolio V2 (test)` | `Portfolio` | nom du site dans Umami |
| `TLS_ASSERT` | non | `1` | `1` | échec du déploiement si un domaine ne sert pas un certificat valide |

Points à lire avant de remplir :

- **L’adresse est gérée dans le backoffice.** `CONTACT_EMAIL` initialise une base neuve ;
  modifier ensuite le destinataire dans `/backoffice` met à jour les pages, les liens et les
  prochaines notifications sans redémarrage. Le serveur d’envoi se règle aussi dans le
  backoffice (rubrique « E-mails », par exemple la messagerie Hostinger :
  `smtp.hostinger.com`, port 465, TLS) ; ce réglage prime sur les variables `SMTP_*`, qui
  restent le repli. Son mot de passe est chiffré en SQLite avec une sous-clé de
  `BACKOFFICE_TOTP_ENCRYPTION_KEY` et n’est jamais réaffiché. `BACKEND_URL` sert seulement en
  local à joindre Rust ; Compose fixe la destination à `http://portfolio-backend:8080`, l’alias
  du backend sur le réseau de la pile.
  Le jeton partagé accepte 32 à 256 caractères ASCII imprimables sans espace. Il doit être
  différent entre test et production ; aucune valeur remplie ne doit être versionnée.

- **Le relais SMTP doit autoriser `SMTP_FROM`.** Utiliser les identifiants et l’adresse fournis
  par le service de messagerie. Une adresse publique en Outlook ne signifie pas que le
  compte autorise automatiquement SMTP. Le succès du formulaire confirme l’enregistrement
  de la demande ; le statut de notification indique séparément l’acceptation par le relais ou
  l’échec. Une panne SMTP ne fait pas perdre le message.

- **Les identifiants et la clé 2FA restent des secrets.** Mettre `BACKOFFICE_PASSWORD` entre
  apostrophes dans `ENV_TEST` ou `ENV_PROD` pour préserver ses `$`, `#` et espaces. Utiliser des
  mots de passe et des clés `BACKOFFICE_TOTP_ENCRYPTION_KEY` différents par environnement.
  Hors développement, la première connexion configure TOTP ; conserver les huit codes de
  secours affichés une seule fois. La clé de chiffrement doit être sauvegardée avec la base :
  une base seule ne permet pas de récupérer le secret TOTP. Récupération d’accès et contrat :
  [`backend/README.md`](../backend/README.md). Les jetons MCP sont créés et révoqués dans le
  backoffice, pour un an au plus ; leurs empreintes vivent dans SQLite, leurs secrets dans les
  clients choisis, jamais dans le dépôt. Changer la clé rend illisible le mot de passe SMTP
  enregistré : le ressaisir dans le backoffice.

- **La production attend le départ de la V1.** Tant que la V1 déclare `charles-lindecker.com` et
  `www.` sur l'edge, le déploiement de production refuse de démarrer (domaine déjà déclaré par un
  autre projet). Poser `PROD_*` et `ENV_PROD` plus tôt est donc sans risque, et même nécessaire :
  l'archive de la V1 (`.github/workflows/archive-v1.yml`) se déploie avec `PROD_HOST`,
  `PROD_SSH_USER` et `PROD_SSH_KEY` dès l'intégration. L'ordre de bascule est dans
  [`bascule.md`](bascule.md).

- **`CADDY_DOMAINS` n'a pas de valeur par défaut, par construction.** Le calque de déploiement le
  déclare en `${CADDY_DOMAINS:?…}` : un `.env` qui l'oublie fait échouer le `docker compose up` au
  lieu de mettre en ligne un site sans domaine. Le test a d'abord tourné sur
  `test.v2.charles-lindecker.com`, tant que la V1 tenait `test.charles-lindecker.com` ; il a repris
  ce nom à la bascule du 2026-10-15. Un autre nom convient, pourvu qu'aucun autre projet de l'hôte
  ne le déclare et que `UMAMI_SITE_DOMAIN` le suive.

- **`ROBOTS_TAG` a pour défaut `noindex`.** Un environnement qui oublie de se déclarer n'est pas
  indexé ; seule la production pose `all`.

- **Les clés vont par paires, et une paire incomplète arrête le site.** `REDIRECT_HOSTS` sans
  `CANONICAL_ORIGIN` (ou l'inverse), `UMAMI_WEBSITE_ID` sans `UMAMI_SITE_DOMAIN`, une origine en
  http ou un UUID qu'Umami refuserait : le serveur ne démarre pas, et le déploiement échoue en
  affichant `[serveur] démarrage refusé : …`. Le calque de mesure, lui, refuse une valeur vide
  (`${VAR:?}`) : une étiquette vide ferait refuser la configuration de tout l'edge.

- **Les deux `UMAMI_WEBSITE_ID` sont fixés une fois pour toutes.** Générés pour ce projet, ils lui
  appartiennent (contrat `infra-vps`, `docs/APPLICATIONS.md` § 6) : Umami les reprend tels quels,
  même après une reconstruction de l'hôte. Ne jamais les regénérer (ce serait repartir d'un site
  vide), ni reprendre en test celui de la production. Détail :
  [`mesure-audience.md`](mesure-audience.md).

- **`TLS_ASSERT=0` est une bascule de migration, pas un réglage.** Il désactive le seul contrôle
  qui détecte une émission Let's Encrypt bloquée. Il ne sert que si la V2 part sur un autre hôte
  que celui de la V1, le temps que le DNS bascule.

---

## 3. Générer la clé SSH de déploiement

Une clé **dédiée à ce dépôt**, distincte de la clé personnelle et de celle de la V1 : elle se
révoque sans couper l'accès au serveur, ni le déploiement d'un autre projet.

```bash
ssh-keygen -t ed25519 -C "github-actions-monportefoliov2" -f ~/.ssh/portfolio_v2_deploy -N ""

# La publique va sur le VPS
ssh-copy-id -i ~/.ssh/portfolio_v2_deploy.pub root@<vps>

# La privée va dans les secrets GitHub (la même pour les deux environnements
# tant qu'ils partagent la machine)
REPO=LINDECKER-Charles/MonPortefolioV2
gh secret set TEST_SSH_KEY --repo "$REPO" < ~/.ssh/portfolio_v2_deploy
gh secret set PROD_SSH_KEY --repo "$REPO" < ~/.ssh/portfolio_v2_deploy
```

> `gh secret set … --body "$(cat clé)"` mange la dernière ligne et produit une clé invalide dont le
> seul symptôme est un `Permission denied (publickey)`. Toujours passer le fichier par
> redirection, comme ci-dessus.

---

## 4. Prérequis sur l'hôte

Ce ne sont pas des secrets, mais sans eux le premier déploiement échoue. Ceux qui valent pour tout
l'hôte (b, c, e) sont sans doute déjà en place pour les autres projets : les vérifier suffit.

### a. Les binaires attendus sur la machine

```bash
ssh root@<vps> 'command -v docker curl && docker compose version && bash --version | head -1'
```

`docker` (avec le plugin `compose` v2), `curl` et `bash` 4 ou plus suffisent. **`git` n'est pas
nécessaire** : l'hôte ne clone rien. Le job de déploiement lui envoie par `scp` les seuls fichiers
dont il a besoin — `compose.yaml`, `compose.deploy.yaml`, `compose.umami.yaml` et le script de
mise en ligne. Le VPS n'a donc besoin d'aucun accès en lecture au dépôt : ni clé de déploiement,
ni jeton. Sans `curl`, le déploiement échoue à la toute dernière étape, celle qui vérifie le
certificat TLS.

### b. Si le déploiement passe par un utilisateur non-root

`TEST_SSH_USER` / `PROD_SSH_USER` valent `root` par défaut. Un autre utilisateur doit pouvoir
parler au démon Docker et écrire dans les deux dossiers :

```bash
ssh root@<vps>
adduser --disabled-password --gecos "" deploy      # s'il n'existe pas déjà
usermod -aG docker deploy
mkdir -p /opt/portfolio-test /opt/portfolio-prod
chown deploy:deploy /opt/portfolio-test /opt/portfolio-prod
mkdir -p /home/deploy/.ssh && cat ~/.ssh/authorized_keys >> /home/deploy/.ssh/authorized_keys
chown -R deploy:deploy /home/deploy/.ssh && chmod 700 /home/deploy/.ssh
```

> Appartenir au groupe `docker` équivaut en pratique à un accès root sur la machine. Le gain par
> rapport à `root` tient surtout à la traçabilité et à la révocabilité du compte.

### c. L'edge partagé doit tourner

Le point d'entrée TLS (Caddy et le réseau `edge`) appartient au dépôt `infra-vps`, pas à ce
projet. **Le contact Let's Encrypt vit là-bas, jamais ici.**

```bash
ssh root@<vps> 'docker network inspect edge >/dev/null && echo "edge OK"'
```

Le script de déploiement se contente de vérifier que le réseau existe : il ne crée jamais
l'infrastructure partagée.

### d. Accès en lecture au registre GHCR

Le VPS fait `docker compose pull` sur trois images : `ghcr.io/lindecker-charles/monportefoliov2`,
`monportefoliov2-backend` et `monportfolio-archive` (l'archive de la V1). Nées d'un dépôt privé,
elles sont privées. Deux options :

**Option 1 — rendre les packages publics (recommandé).** Les images ne contiennent que le site
compilé, son serveur, l'API compilée et l'archive de la V1, dont le code est public. Aucun
identifiant à gérer sur le serveur.

> GitHub → profil → Packages → `monportefoliov2`, `monportefoliov2-backend`,
> `monportfolio-archive` → Package settings → Change visibility → Public.
> Un package n'apparaît qu'**après** sa première publication (`_build`, `archive-v1.yml`).

**Option 2 — garder le package privé.** Une authentification persistante sur l'hôte, avec un PAT
classique portant la seule portée `read:packages` :

```bash
ssh root@<vps>
echo '<PAT_read_packages>' | docker login ghcr.io -u LINDECKER-Charles --password-stdin
```

Les identifiants sont écrits dans `~/.docker/config.json` de l'utilisateur de déploiement. Un
`docker login ghcr.io` déjà fait pour ce compte sur l'hôte couvre aussi ce package. À refaire à
chaque expiration du PAT.

### e. Rotation des journaux Docker (une fois par hôte)

Un conteneur bavard sans rotation remplit le disque, partagé avec tous les autres projets. Dans
`/etc/docker/daemon.json` :

```json
{
  "log-driver": "json-file",
  "log-opts": { "max-size": "10m", "max-file": "3" }
}
```

puis `systemctl restart docker`. `compose.yaml` pose déjà la même politique pour ce service ; ceci
couvre en plus tout conteneur lancé à la main.

### f. Enregistrements DNS

| Nom | Type | Valeur | Pour | État au 2026-10-15 |
|---|---|---|---|---|
| `charles-lindecker.com` | A | IP de l'hôte | production | en place (sert la V2 depuis la bascule) |
| `www.charles-lindecker.com` | CNAME vers l'apex | — | production, redirigé vers l'apex | en place |
| `test.charles-lindecker.com` | A | IP de l'hôte | environnement de test | en place (servait le test de la V1 jusqu'à la bascule) |
| `yharnam.charles-lindecker.com` | A | IP de l'hôte | archive de la V1 | en place |
| `test.v2.charles-lindecker.com`, `test.yharnam.charles-lindecker.com` | A | IP de l'hôte | — | ne servent plus : à supprimer |

Sans enregistrement, Let's Encrypt échoue et Caddy entre en back-off.

---

## 5. Tout poser d'un coup

```bash
REPO=LINDECKER-Charles/MonPortefolioV2
VPS_IP=203.0.113.10          # IP du VPS

# --- test ---
gh secret set TEST_HOST     --repo "$REPO" --body "$VPS_IP"
gh secret set TEST_SSH_USER --repo "$REPO" --body "root"
gh secret set TEST_SSH_KEY  --repo "$REPO" < ~/.ssh/portfolio_v2_deploy
gh secret set TEST_PATH     --repo "$REPO" --body "/opt/portfolio-test"
gh secret set ENV_TEST      --repo "$REPO" < ./.env.test      # copie de .env.test.example

# --- production (sans effet tant que la V1 tient le domaine) ---
gh secret set PROD_HOST     --repo "$REPO" --body "$VPS_IP"
gh secret set PROD_SSH_USER --repo "$REPO" --body "root"
gh secret set PROD_SSH_KEY  --repo "$REPO" < ~/.ssh/portfolio_v2_deploy
gh secret set PROD_PATH     --repo "$REPO" --body "/opt/portfolio-prod"
gh secret set ENV_PROD      --repo "$REPO" < ./.env.prod      # copie de .env.prod.example

# --- tests : clé de déploiement en lecture du cadrage privé ---
gh secret set CADRAGE_DEPLOY_KEY --repo "$REPO" < ~/chemin/vers/cle-cadrage
gh secret set CADRAGE_DEPLOY_KEY --app dependabot --repo "$REPO" < ~/chemin/vers/cle-cadrage

gh secret list --repo "$REPO"
```

> Les copies remplies (`.env.test`, `.env.prod`) restent sur le poste : seuls les `.example` sont
> versionnés. Les remplir en local, les coller en secret, ne jamais les committer.

---

## 6. Vérifier avant le premier déploiement

```bash
REPO=LINDECKER-Charles/MonPortefolioV2
VPS=root@203.0.113.10

gh secret list --repo "$REPO"                                 # les 11 secrets sont là
dig +short test.charles-lindecker.com                         # renvoie l'IP du VPS
ssh -i ~/.ssh/portfolio_v2_deploy "$VPS" 'docker version'     # la clé de la CI passe
ssh "$VPS" 'command -v docker curl >/dev/null && echo "binaires OK"'
ssh "$VPS" 'docker network inspect edge >/dev/null && echo "edge OK"'
```

L'accès au registre ne se vérifie **pas** ici : l'étiquette `staging` n'existe qu'après le premier
passage de `_build`, donc après le premier `git push origin dev`. C'est l'étape 4 de
[`deploiement.md`](deploiement.md) § 4.1 qui le contrôle ; un `docker compose pull` refusé fait de
toute façon échouer le déploiement avec un message qui renvoie ici.

---

## 7. Faire tourner un secret

`gh secret set` écrase la valeur existante. Après rotation, **relancer la chaîne** pour que l'hôte
reçoive la nouvelle valeur : un secret changé sans redéploiement ne change rien sur le serveur.

```bash
gh workflow run ci.yml --ref dev     # rejoue tests -> build -> déploiement test
```

Pour la clé SSH, l'ordre compte : poser la nouvelle clé publique sur le VPS **avant** de remplacer
la privée dans les secrets, sinon la chaîne suivante ne peut plus se connecter pour réparer quoi
que ce soit.

```bash
ssh-keygen -t ed25519 -C "github-actions-monportefoliov2" -f ~/.ssh/portfolio_v2_deploy_new -N ""
ssh-copy-id -i ~/.ssh/portfolio_v2_deploy_new.pub root@<vps>                 # 1. la nouvelle entre
gh secret set TEST_SSH_KEY --repo "$REPO" < ~/.ssh/portfolio_v2_deploy_new   # 2. la CI l'utilise
gh secret set PROD_SSH_KEY --repo "$REPO" < ~/.ssh/portfolio_v2_deploy_new
# 3. une fois une chaîne verte, retirer l'ancienne clé de ~/.ssh/authorized_keys
```
