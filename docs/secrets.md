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

Dix secrets, cinq par environnement. Aucun n'a de valeur par défaut sauf `*_SSH_USER` : la chaîne
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

### Fourni automatiquement

| Secret | Pourquoi il n'est pas dans la liste |
|---|---|
| `GITHUB_TOKEN` | injecté par GitHub à chaque exécution. C'est lui qui pousse la fusion `dev -> test`, publie l'image sur GHCR (`_build`) et la ré-étiquette (`_promote`). Rien à créer. |

---

## 2. Contenu de `ENV_TEST` et `ENV_PROD`

Ce sont des secrets **multi-lignes**, et c'est volontaire : les pousser en un bloc évite d'avoir
dix secrets à garder synchronisés, et le fichier arrive sur l'hôte en `chmod 600`.

Les modèles versionnés sont [`.env.test.example`](../.env.test.example) et
[`.env.prod.example`](../.env.prod.example), commentés ligne à ligne. Le modèle de test est
complet tel quel ; celui de production aussi, mesure d'audience en commentaire. Récapitulatif :

| Clé | Obligatoire | Test | Production | Rôle |
|---|---|---|---|---|
| `COMPOSE_PROJECT_NAME` | oui | `portfolio-test` | `portfolio-prod` | isole les piles sur la même machine |
| `COMPOSE_FILE` | non | `compose.yaml:compose.deploy.yaml:compose.umami.yaml` | `compose.yaml:compose.deploy.yaml` | confort : un `docker compose` lancé à la main dans le dossier charge les bons calques. Le déploiement choisit les siens et signale un écart |
| `WEB_IMAGE` | non | `ghcr.io/lindecker-charles/monportefoliov2` | idem | image publiée par la CI |
| `IMAGE_TAG` | oui | `staging` | `prod` | étiquette mobile déployée |
| `CADDY_DOMAINS` | **oui** | `test.v2.charles-lindecker.com` (proposé) | `charles-lindecker.com, www.charles-lindecker.com` | domaines servis par l'edge partagé |
| `ROBOTS_TAG` | non | `noindex` | `all` | en-tête `X-Robots-Tag` posé par l'edge |
| `REDIRECT_HOSTS` | non | — | `www.charles-lindecker.com` | hôtes renvoyés en 301 vers `CANONICAL_ORIGIN` par le serveur du site |
| `CANONICAL_ORIGIN` | avec `REDIRECT_HOSTS` | — | `https://charles-lindecker.com` | origine canonique (https, sans chemin) |
| `UMAMI_WEBSITE_ID` | pour mesurer | `100ee54a-6c1f-46cc-a67e-8ac78d57d51d` | plus tard : `0450b7ff-eb45-4328-a93e-496cd25b3348` | active la mesure d'audience : ajoute `compose.umami.yaml` |
| `UMAMI_SITE_DOMAIN` | avec l'ID | `test.v2.charles-lindecker.com` | `charles-lindecker.com` | nom d'hôte nu mesuré (`data-domains`, `umami.domain`) |
| `UMAMI_SITE_NAME` | avec l'ID | `Portfolio V2 (test)` | `Portfolio` | nom du site dans Umami |
| `TLS_ASSERT` | non | `1` | `1` | échec du déploiement si un domaine ne sert pas un certificat valide |

Points à lire avant de remplir :

- **La production attend le départ de la V1.** Tant que la V1 déclare `charles-lindecker.com` et
  `www.` sur l'edge, le déploiement de production refuse de démarrer (domaine déjà déclaré par un
  autre projet). Poser `PROD_*` et `ENV_PROD` plus tôt est donc sans risque ; l'ordre de bascule
  est dans [`deploiement.md`](deploiement.md) § 4.2.

- **`CADDY_DOMAINS` n'a pas de valeur par défaut, par construction.** Le calque de déploiement le
  déclare en `${CADDY_DOMAINS:?…}` : un `.env` qui l'oublie fait échouer le `docker compose up` au
  lieu de mettre en ligne un site sans domaine. Le domaine de test est une proposition : un autre
  nom convient, pourvu qu'aucun autre projet de l'hôte ne le déclare (la V1 tient
  `test.charles-lindecker.com`) et que `UMAMI_SITE_DOMAIN` le suive.

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

Le VPS fait `docker compose pull` sur `ghcr.io/lindecker-charles/monportefoliov2`. Deux options :

**Option 1 — rendre le package public (recommandé).** L'image ne contient que le site compilé et
son serveur, publics de toute façon une fois en ligne. Aucun identifiant à gérer sur le serveur.

> GitHub → profil → Packages → `monportefoliov2` → Package settings → Change visibility → Public.
> Le package n'apparaît qu'**après** la première exécution de `_build`.

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

| Nom | Type | Valeur | Pour | État au 2026-10-07 |
|---|---|---|---|---|
| `test.v2.charles-lindecker.com` | A | IP de l'hôte | environnement de test | **à créer** avant le premier déploiement |
| `charles-lindecker.com` | A | IP de l'hôte | production | en place (sert la V1) |
| `www.charles-lindecker.com` | CNAME vers l'apex | — | production, redirigé vers l'apex | en place |
| sous-domaine d'archive de la V1 | A | IP de l'hôte | archive de la V1 | à créer à la bascule ([`deploiement.md`](deploiement.md) § 4.2) |

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

gh secret list --repo "$REPO"
```

> Les copies remplies (`.env.test`, `.env.prod`) restent sur le poste : seuls les `.example` sont
> versionnés. Les remplir en local, les coller en secret, ne jamais les committer.

---

## 6. Vérifier avant le premier déploiement

```bash
REPO=LINDECKER-Charles/MonPortefolioV2
VPS=root@203.0.113.10

gh secret list --repo "$REPO"                                 # les 10 secrets sont là
dig +short test.v2.charles-lindecker.com                      # renvoie l'IP du VPS
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
