# Déploiement

Le portfolio utilise deux images Docker — le site Astro servi par Node et son API Rust —,
derrière l'**edge partagé** du VPS (dépôt `infra-vps`), le point d'entrée TLS
de tous les projets de l'hôte, V1 comprise. Ce document décrit l'architecture, la chaîne de mise en
ligne, la bascule depuis la V1, les gestes courants et les pièges connus. Les valeurs à configurer
sont dans [`secrets.md`](secrets.md) ; la mesure d'audience a son propre document,
[`mesure-audience.md`](mesure-audience.md).

> **Aujourd'hui, seul l'environnement de test de la V2 tourne.** La V1 (dépôt `MonPortfolio`,
> piles `monportfolio-staging` et `monportfolio-prod`) déclare `charles-lindecker.com`,
> `www.charles-lindecker.com` et `test.charles-lindecker.com` sur l'edge du même hôte. Deux
> conteneurs qui déclarent le même domaine se marchent dessus : la production de la V2 ne se
> déploie qu'**après** le déplacement de la V1 sur son sous-domaine d'archive (§ 4.2). Le
> déploiement le vérifie et refuse de démarrer sur un domaine qu'un autre projet déclare encore.

---

## 1. Architecture

```
                         Internet
                            |
                       :80  :443             <- seuls ports ouverts de l'hôte
                            |
            +--------------------------------+
            |  edge : caddy-docker-proxy     |   dépôt infra-vps,
            |  Let's Encrypt, journal accès  |   partagé par TOUS les projets
            +--------------------------------+
                            |  réseau docker « edge »
     +----------------------+---------------------+------------------------+
     |                      |                     |                        |
portfolio-prod-web-1   portfolio-test-web-1   monportfolio-* (V1)     analytics-umami
:4000 (interne)        :4000 (interne)        charles-lindecker.com   (pile analytics,
après la bascule :     test.v2.charles-       www., test.             infra-vps)
charles-lindecker.com  lindecker.com          jusqu'à la bascule,     /u/script.js,
www. -> 301 apex                              puis sous-domaine       /u/api/send
                                              d'archive
```

Trois propriétés structurent tout le reste :

- **La pile ne publie aucun port.** Caddy joint le conteneur par son IP sur le réseau `edge`.
  C'est ce qui permet à `portfolio-test` et `portfolio-prod` de coexister sur la même machine sans
  se disputer le port 4000, et ce qui rend impossible d'atteindre le site en contournant TLS.
- **Le projet ne *configure* jamais l'edge.** Il se déclare par des étiquettes (`caddy`,
  `caddy.reverse_proxy` ; `caddy.import: umami` et `umami.*` quand la mesure d'audience est
  active) et l'edge le découvre : aucun fichier d'`infra-vps` n'a à changer. Une seule exception,
  en dernier recours : si un domaine de cette pile ne sert pas de certificat valide, le
  déploiement **redémarre** le conteneur Caddy partagé pour débloquer l'émission, ce qui
  interrompt brièvement tous les sites de l'hôte (§ 6).
- **L'observabilité est gratuite.** Le conteneur est mesuré (CPU, RAM, réseau, I/O) et ses
  journaux collectés dès qu'il tourne ; tout site servi par l'edge apparaît dans le tableau de bord
  *Edge — trafic* sans rien déclarer.

Le serveur du site (`site/server/server.mjs`, sans dépendance) ajoute ce qu'un serveur de fichiers
générique ne ferait pas : URL sans slash final (les variantes `/x/` et `/x/index.html` partent en
301), 301 des anciennes routes de la V1 (`site/server/redirections.mjs`), redirection de l'hôte
secondaire vers l'hôte canonique, vraie 404 statique, trois régimes de cache, en-têtes de sécurité
(CSP stricte, sans aucune origine tierce) et le chargeur de mesure `/mesure.js`, écrit au démarrage
depuis l'environnement du conteneur.

Chaque pile possède aussi un service `backend:8080`, sur son réseau Compose seulement :
aucun port publié, aucune étiquette Caddy et aucune connexion au réseau `edge`. Le serveur
Node relaie les routes publiques de contact et de santé, les routes explicitement autorisées
du backoffice et `/mcp`, en même origine. Les corps sont limités à 24 Kio et le délai à
20 secondes. Le réseau bridge permet au backend de joindre le relais SMTP. `CONTACT_EMAIL`
initialise seulement une base neuve ; l’adresse enregistrée dans SQLite pilote ensuite le
destinataire et les pages HTML sans script ni reconstruction. Le volume `portfolio-data`,
propre à chaque nom de projet Compose, conserve les demandes et les réglages au déploiement.
Sauvegarde et connexion au backoffice : [`backend/README.md`](../backend/README.md).

En ligne, Node utilise l’adresse ajoutée par Caddy dans `X-Forwarded-For` et transmet
`X-Contact-Client-IP` avec le secret `BACKEND_PROXY_TOKEN`. Rust ignore une IP transmise
sans ce jeton. Le formulaire compte deux tentatives par IP sur une heure ; son état reste en
mémoire et se réinitialise au redémarrage. Le contrôle de santé confirme que le processus
répond, y compris lorsque SMTP n’est pas encore renseigné.

## 2. Chaîne de mise en ligne

**Déclenchements automatiques suspendus pendant la transition avec la V1 (2026-10-08).**
Les push, y compris sur `dev` et `main`, et les PR ne lancent aucun workflow. Le lancement
manuel reste disponible (§ « Redéployer sans nouveau commit »). Pour réactiver la chaîne,
rétablir `push` sur `[dev, main]` et `pull_request` sur `[dev]` dans `.github/workflows/ci.yml`.
Les déclenchements décrits ci-dessous correspondent au fonctionnement après réactivation.

```
push dev  ->  _tests  ->  fusion dev->test  ->  _build (:sha + :staging)  ->  _deploy TEST
push main ->  _promote (:staging -> :prod, :latest)                       ->  _deploy PROD
```

`_tests` joue quatre jobs en parallèle : l’API (`backend` : rustfmt, Clippy, tests dont SMTP
local), l'application (`front` : `astro check`, tests dont ceux
du serveur, build), le navigateur (`e2e` : Playwright sur le build servi par le serveur de
production) et la mise en ligne (`infra` : shellcheck, actionlint, combinaisons Compose,
construction des deux images sans publication). Une PR vers `dev` ne joue que `_tests`.

`test` ne déclenche jamais la chaîne : c'est la CI elle-même qui y pousse. `main` n'est atteinte
que par une fusion `test -> main` faite à la main : cette porte humaine est ce qui promeut en
production.

**La production ne reconstruit jamais.** Elle ré-étiquette les deux images déployées en test.
Chaque image porte le même SHA immuable et la même étiquette OCI de révision ; la promotion
refuse une paire de révisions différentes, puis utilise les digests contrôlés. Un
rebuild du même code produirait un binaire différent (dépendances résolues plus tard,
horodatages, cache) : ce ne serait plus l'artefact validé. C'est aussi pourquoi tout ce qui
distingue le test de la production — domaines, mesure d'audience, hôte canonique — arrive par
l'environnement du conteneur, jamais par le build. Conséquence : pousser sur `main` déploie
l'image de la pointe de `test`, avec les fichiers Compose de `main`. Si les deux branches ont
divergé, c'est la divergence qu'il faut résoudre, pas la chaîne.

### Ce que fait le déploiement sur l'hôte

`_deploy.yml` écrit le `.env` de l'hôte depuis le secret `ENV_TEST` ou `ENV_PROD`, dépose
`compose.yaml`, `compose.deploy.yaml`, `compose.umami.yaml` et `scripts/deploy-remote.sh`, puis
exécute ce dernier depuis le fichier. Le script :

1. vérifie le `.env` (`COMPOSE_PROJECT_NAME`, `CADDY_DOMAINS`) ;
2. **choisit les calques** : `compose.yaml` et `compose.deploy.yaml` toujours,
   `compose.umami.yaml` si `UMAMI_WEBSITE_ID` est posé. Un `COMPOSE_FILE` de confort périmé dans
   le `.env` est signalé ;
3. vérifie que le réseau `edge` existe, puis **refuse de continuer si un conteneur d'un autre
   projet déclare déjà l'un de ses domaines** (étiquettes `caddy` et `caddy_N`) ;
4. tire les deux images, démarre la pile, attend leurs états *healthy* — et échoue si un
   conteneur s'arrête dès son démarrage (configuration refusée par le serveur), en affichant ses
   journaux ;
5. écrit `DEPLOIEMENT.txt` (référence, date, projet, calques, deux images) et ne nettoie que les images
   de ce projet ;
6. vérifie le certificat et la réponse de chaque domaine public.

## 3. Test et production : ce qui les distingue

| | Test | Production |
|---|---|---|
| Branche | `test` (fusion automatique de `dev`) | `main` (fusion manuelle de `test`) |
| Image | `:staging`, construite par `_build` | `:prod`, la même image ré-étiquetée |
| `COMPOSE_PROJECT_NAME` | `portfolio-test` | `portfolio-prod` |
| Dossier sur l'hôte (`*_PATH`, proposé) | `/opt/portfolio-test` | `/opt/portfolio-prod` |
| Domaines | `test.v2.charles-lindecker.com` (proposé) | `charles-lindecker.com`, `www.charles-lindecker.com` |
| Hôte canonique | — | `www.` renvoyé en 301 vers l'apex |
| Indexation (`X-Robots-Tag`) | `noindex` | `all` |
| Mesure d'audience | active, site Umami « Portfolio V2 (test) » | préparée, commentée : après la purge à 25 mois |
| État au 2026-10-07 | à mettre en service (§ 4.1) | attend la bascule (§ 4.2) |

Les dossiers et les noms de projet de la V2 sont distincts de ceux de la V1
(`/opt/monportfolio-staging`, `/opt/monportfolio-prod`) : jamais de dossier partagé entre les
deux versions.

## 4. Mise en service

### 4.1 Premier déploiement de test (maintenant)

1. **L'edge tourne sur l'hôte** (dépôt `infra-vps`) :

   ```bash
   ssh root@<vps> 'docker network inspect edge >/dev/null && echo "edge OK"'
   ```

2. **Secrets posés** : [`secrets.md`](secrets.md) § 1 à § 6.
3. **DNS** : `test.v2.charles-lindecker.com` en A vers l'IP de l'hôte. Le nom n'a aucun
   enregistrement au 2026-10-07 : sans lui, Let's Encrypt échoue et Caddy entre en back-off.

   ```bash
   dig +short test.v2.charles-lindecker.com      # l'IP de l'hôte
   ```

4. **Premier passage** : `git push origin dev`. La chaîne joue les tests, fusionne dans `test`,
   construit l'image, la publie et la déploie. Puis :

   ```bash
   T=https://test.v2.charles-lindecker.com
   curl -I "$T/"                                                    # 200, certificat valide
   curl -sI "$T/" | grep -iE 'x-robots|content-security'            # noindex, CSP
   curl -o /dev/null -w '%{http_code}\n' "$T/page-inexistante"      # 404
   curl -o /dev/null -w '%{http_code} %{redirect_url}\n' "$T/projects"   # 301 vers /
   curl -s "$T/mesure.js" | grep -E 'data-website-id|data-domains'  # chargeur actif
   ssh root@<vps> 'cd /opt/portfolio-test && cat DEPLOIEMENT.txt && docker compose ps'
   ```

   > Si le package GHCR est privé et que l'hôte n'y a pas accès, c'est ici que ça se voit :
   > `docker compose pull` échoue après cinq tentatives. Voir [`secrets.md`](secrets.md) § 4d.

5. **Recette de la mesure d'audience** : [`mesure-audience.md`](mesure-audience.md) § 6.

### 4.2 Bascule depuis la V1 (plus tard)

L'invariant : **à aucun moment deux projets ne déclarent le même domaine.** La V1 quitte
`charles-lindecker.com` et `www.` avant que la V2 ne les déclare. Le garde-fou du déploiement
refuserait l'ordre inverse ; les étapes ci-dessous évitent d'en arriver là.

Prérequis : la recette en test est faite ; le sous-domaine d'archive et la version archivée sont
tranchés ([`questions.md`](questions.md), bloc F ; [`brief.md`](brief.md) § 6). Cas prévu : la V2
est déployée sur le même hôte que la V1, et le DNS de `charles-lindecker.com` et `www.` y pointe
déjà. Sur un autre hôte, il faudrait en plus une bascule DNS, avec `TLS_ASSERT=0` le temps de la
propagation.

1. **DNS du sous-domaine d'archive** (`v1.`, `yharnam.` ou `archive.`, à choisir) : A vers l'hôte.
2. **Secrets de production de la V2** : `PROD_*` et `ENV_PROD`, d'après `.env.prod.example`
   ([`secrets.md`](secrets.md)). `TLS_ASSERT=1` : les certificats de ces domaines sont déjà émis
   sur cet edge.
3. **Archive en ligne, sur son seul sous-domaine** (dépôt `MonPortfolio`, brief § 6) : une pile
   figée sur le digest de l'image `:prod` retenue, qui ne déclare que le sous-domaine d'archive.
   Côté V1, ce domaine doit figurer dans `NG_ALLOWED_HOSTS` (sinon la V1 y retombe en rendu
   client), avec `ROBOTS_NOINDEX=1`. Vérifier qu'elle répond ; `monportfolio-prod` sert toujours
   le domaine principal.
4. **La V1 quitte le domaine principal** : couper sa CI (`gh workflow disable ci.yml --repo
   LINDECKER-Charles/MonPortfolio`), sinon un prochain déploiement de la V1 réécrirait le `.env`
   de l'hôte depuis son secret et redéclarerait le domaine ; puis arrêter sa pile de production
   (`docker compose down` dans `/opt/monportfolio-prod`). Plus aucun conteneur de la V1 ne doit
   déclarer `charles-lindecker.com` ni `www.`. **Dès cet instant, le domaine principal ne répond
   plus : enchaîner aussitôt l'étape suivante**, à un moment creux.

   Variante plus courte : reconfigurer `monportfolio-prod` elle-même sur le sous-domaine
   d'archive (son secret `ENV_PROD`, puis un dernier déploiement de la V1) fond les étapes 3 et 4 ;
   couper la CI de la V1 juste après.
5. **La V2 en production** : fusionner `test` dans `main`, pousser. La chaîne promeut `:staging`
   en `:prod` et déploie ; le garde-fou vérifie que les domaines sont libres.
6. **Vérifier** :

   ```bash
   curl -sI https://charles-lindecker.com/ | grep -iE '^(HTTP|x-robots-tag)'       # 200, all
   curl -sI https://www.charles-lindecker.com/mentions-legales | grep -i '^location'
   #   location: https://charles-lindecker.com/mentions-legales
   curl -o /dev/null -w '%{http_code} %{redirect_url}\n' https://charles-lindecker.com/projects
   #   301 https://charles-lindecker.com/
   curl -sI https://<archive>.charles-lindecker.com/ | grep -i x-robots-tag        # noindex (V1)
   ```

7. **Après** : la pile `monportfolio-staging` (`test.charles-lindecker.com`) ne gêne pas la V2 ;
   l'arrêter avec la CI de la V1 si elle n'a plus d'usage. La mesure en production suit sa propre
   condition ([`mesure-audience.md`](mesure-audience.md) § 7).

---

## 5. Gestes courants

### Voir ce qui tourne

```bash
ssh root@<vps>
cd /opt/portfolio-prod                    # ou /opt/portfolio-test
cat DEPLOIEMENT.txt                       # référence, image et calques déployés
docker compose ps
docker compose logs -f --tail 100 web backend
```

Ces commandes chargent les calques du `COMPOSE_FILE` du `.env`, d'où l'alerte du déploiement quand
il diverge de ce qui a réellement été déployé. Sans `COMPOSE_FILE`, Compose ne chargerait que
`compose.yaml` : un `up` recréerait le conteneur sans ses étiquettes, donc hors de l'edge. En cas
de doute, reprendre la ligne `calques` de `DEPLOIEMENT.txt` :

```bash
COMPOSE_FILE="$(sed -n 's/^calques *: //p' DEPLOIEMENT.txt)" docker compose ps
```

Au démarrage, le serveur annonce sa configuration :

```
[serveur] /app/dist servi sur http://0.0.0.0:4000 — mesure d'audience active (site …, domaine test.v2.charles-lindecker.com) — pas d'hôte secondaire
```

### Revenir en arrière

Chaque build publie une étiquette immuable au SHA du commit poussé sur `dev`, en plus de
l'étiquette mobile. Un retour arrière ne reconstruit rien.

```bash
# Retrouver le SHA de la version saine. `read:packages` n'est pas accordé par
# `gh auth login` : poser le scope À FROID, pas pendant l'incident.
gh auth refresh -s read:packages
gh api /users/lindecker-charles/packages/container/monportefoliov2/versions \
  --jq '.[] | {tags: .metadata.container.tags, date: .created_at}' | head -20
```

- **En urgence, sur l'hôte** : épingler la version saine. Le changement est local : le prochain
  déploiement réécrit le `.env` depuis le secret et remet `prod`.

  ```bash
  ssh root@<vps>
  cd /opt/portfolio-prod
  sed -i 's/^IMAGE_TAG=.*/IMAGE_TAG=<sha>/' .env
  docker compose up -d
  ```

- **Re-promouvoir, par la chaîne** : ré-étiqueter `:staging` sur la version saine, puis rejouer
  `main`, qui la promeut en `:prod` et la déploie. La prochaine poussée sur `dev` reconstruira
  `:staging` à partir du code corrigé.

  ```bash
  gh auth refresh -s write:packages
  gh auth token | docker login ghcr.io -u LINDECKER-Charles --password-stdin
  IMG=ghcr.io/lindecker-charles/monportefoliov2
  docker buildx imagetools create --tag "$IMG:staging" "$IMG:<sha>"
  docker buildx imagetools create --tag "$IMG-backend:staging" "$IMG-backend:<sha>"
  gh workflow run ci.yml --ref main
  ```

La correction elle-même se fait dans le dépôt (revert sur `dev`, puis `test -> main`).

### Redéployer sans nouveau commit

```bash
gh workflow run ci.yml --ref main    # production
gh workflow run ci.yml --ref dev     # test (rejoue tests et build)
```

> GitHub n'expose `workflow_dispatch` que si le workflow le déclare sur la branche **par défaut**
> (`main`). Tant que `ci.yml` n'y est pas, le lancement manuel est indisponible. Pendant la
> suspension des automatismes, un commit vide sur `dev` ne relance rien non plus.

### Développer en local

```bash
cp .env.example .env              # depuis la racine
cargo run --manifest-path backend/Cargo.toml    # dans un premier terminal
# Dans un second terminal :
cd site
npm ci
npm run dev                       # Astro, rechargement à chaud : http://localhost:4321
npm run build && npm run serve    # le serveur de production : http://localhost:4000
npm test                          # dont les tests du serveur (node --test)
npx playwright test               # navigateur
```

`npm run dev` est le plus rapide pour travailler les pages, mais il ne passe pas par
`server/server.mjs` : ni CSP, ni redirections, ni vraie 404, et `/mesure.js` y est le fichier sans
effet de `public/`. Le serveur de production sert exactement ce qui part en ligne.
Le proxy Vite joint Rust sur `BACKEND_URL` (`http://127.0.0.1:8080` par défaut).
Renseigner les variables SMTP du `.env` pour recevoir les notifications e-mail. Sans relais,
le formulaire conserve les demandes dans le backoffice. Activer son accès avec
`BACKOFFICE_EMAIL` et `BACKOFFICE_PASSWORD` (au moins 12 octets, entre apostrophes dans `.env`).
Le modèle local fixe `APP_ENV=development` et dispense de 2FA. Le calque Compose local impose
également ce mode. Les environnements servis utilisent `APP_ENV=test` ou `production` ; la
première connexion y impose la configuration TOTP et affiche les codes de secours. Fournir
`BACKOFFICE_TOTP_ENCRYPTION_KEY` (`openssl rand -hex 32`) et garder
`BACKOFFICE_COOKIE_SECURE=true` sur HTTPS. Sauvegarder la clé avec la base SQLite.
Les tests utilisent exclusivement des relais locaux. Ne jamais supprimer le volume de données
pendant un déploiement ; prévoir sa sauvegarde indépendamment des images.

Pour vérifier l'image elle-même :

```bash
docker compose up --build         # http://127.0.0.1:4000
```

`compose.override.yaml` est chargé automatiquement : il construit les images depuis `site/`
et `backend/` et publie le port web sur la boucle locale uniquement. Pour inspecter la pile servie, sans les conforts de
développement :

```bash
CADDY_DOMAINS=exemple.test BACKEND_PROXY_TOKEN=exemple-token-local-de-trente-deux-caracteres CONTACT_EMAIL=contact@example.test COMPOSE_FILE=compose.yaml:compose.deploy.yaml docker compose config
```

---

## 6. Pièges connus

- **Ne jamais transmettre un script sur l'entrée standard de ssh** (`ssh hôte bash -s <<EOF`). Le
  shell distant lit le script sur stdin, et la première commande qui consomme stdin
  (`docker compose pull`, `up`, `ps`) en avale un morceau : les instructions suivantes sautent,
  sans erreur. C'était la forme du déploiement de la V1. Ici, le script est déposé puis exécuté
  depuis le fichier, avec `ssh -n`.

- **Ne jamais poser `caddy.import: umami` hors de `compose.umami.yaml`, ni avec un argument vide.**
  Un import refusé fait refuser la configuration entière de l'edge : ce sont tous les sites du VPS
  qui tombent. Le calque n'est chargé que si `UMAMI_WEBSITE_ID` est posé, et ses `${VAR:?}`
  refusent une valeur vide.

- **`COMPOSE_PROJECT_NAME` distinct pour chaque pile** : `portfolio-test`, `portfolio-prod`, et
  différent des piles de la V1. Deux piles qui partagent un nom de projet partagent leurs
  conteneurs : un déploiement de test écraserait la production. Le déploiement refuse un `.env`
  qui l'oublie.

- **Un domaine n'appartient qu'à un projet.** L'edge réunit dans un même bloc de site tout ce que
  les conteneurs déclarent pour un même domaine : on ne maîtrise plus qui répond. Le déploiement
  refuse de démarrer sur un domaine déjà déclaré par un autre projet de l'hôte (§ 4.2).

- **Ne jamais poser de directive `log` ni de label `caddy.import: journal-acces`** sur ce site.
  Caddy n'enregistrerait plus que les sites qui le demandent : tous les autres sites du VPS
  disparaîtraient du journal d'accès, en silence.

- **Un identifiant Umami par environnement**, fixé une fois pour toutes. Le test qui reprendrait
  l'ID de la production mélangerait ses visites aux siennes, et le reconciler signalerait un
  `conflit`.

- **Pas de `ports:` dans `compose.yaml` ni dans `compose.deploy.yaml`.** Sur un hôte mutualisé,
  c'est presque toujours une erreur : ça contourne l'edge et ça entre en collision avec l'autre
  environnement.

- **Le contrôle TLS peut redémarrer l'edge partagé**, une fois, après un échec réel, et jamais si
  `TLS_ASSERT=0`. C'est le seul geste de ce projet sur l'infrastructure partagée, et il coupe tous
  les sites du VPS quelques secondes : quand un domaine est cassé, corriger le DNS d'abord plutôt
  qu'enchaîner les redéploiements.

- **Une configuration incohérente arrête le conteneur.** Une seule des deux variables de mesure
  (`UMAMI_WEBSITE_ID`, `UMAMI_SITE_DOMAIN`) ou d'hôte canonique (`REDIRECT_HOSTS`,
  `CANONICAL_ORIGIN`), ou une valeur invalide : le serveur refuse de démarrer
  (`[serveur] démarrage refusé : …`), et le déploiement affiche ce message avant d'échouer.

- **La limite mémoire n'est pas décorative.** Sans elle, cAdvisor publie
  `container_spec_memory_limit_bytes = 0` et deux alertes d'`infra-vps` deviennent inertes. 256 Mio
  est une valeur de départ (le même serveur, mesuré sur le site L.I.S : 57 Mio au pic sous 400
  requêtes concurrentes) ; la règle d'`infra-vps` est 2× le pic observé, à re-mesurer après une
  semaine de production :
  `max_over_time(container_memory_working_set_bytes{stack=~"portfolio-.*"}[7d])`.

- **Le backend a 256 Mio pour importer les images du blog.** Son pic n'est pas le trafic mais
  l'import d'une image, borné par le code (`backend/src/blog_media.rs`) : 25 Mpx, 150 Mo au plus
  tenus par le décodage, tampons propres à chaque décodeur compris (au-delà, l'image est gardée
  sans variante), une image à la fois. Mesuré sous Linux (`memory.peak` du cgroup d'un conteneur
  limité à 256 Mio sans swap, comme en production, environ 32 Mio au repos compris) : 74 Mio pour
  une photo JPEG de 12 Mpx, 124 Mio pour un PNG RGBA de 25 Mpx tourné par son orientation EXIF,
  164 Mio pour un PNG RGBA de 2 500 × 10 000 ou un JPEG progressif de 24 Mpx, et 183 Mio au pire,
  pour un JPEG progressif en 4:4:4 de 16,6 Mpx, au seuil du décodage. Avant ce seuil, un WebP de
  24 Mpx avec transparence montait à 287 Mio et tuait le conteneur. À 128 Mio, une grande image
  tuait le conteneur en pleine requête, et le formulaire de contact avec lui jusqu'au redémarrage.
  256 Mio laissent 1,4× au pire cas mesuré. Les imports simultanés attendent leur tour, mais
  leurs fichiers reçus s'additionnent : quatre gros imports à la fois touchent la limite, huit
  la dépassent. Le pic réel reste à relever en production : `docker stats` au premier gros
  import. Pour baisser la limite, baisser d'abord `MAX_DECODING`, et aligner `backend/README.md`.
  Les mesures sont à refaire à chaque nouvelle version d'`image`, `image-webp` ou `zune-jpeg`,
  dont les tampons fondent le calcul du coût. La rubrique
  Stockage du backoffice montre ce qui prend de la place sur le disque et dans la base.

- **Un conteneur `unhealthy` n'est jamais redémarré.** `restart: unless-stopped` réagit à la sortie
  du processus, pas à l'état de santé. Le HEALTHCHECK sert au déploiement, qui refuse de conclure
  sur un conteneur non sain, pas à la supervision continue.

- **Le test sert les pages de la production.** Une même image sert les deux environnements : tout
  ce qui est écrit dans les pages (balises canoniques, sitemap) désigne la production. Sans
  conséquence tant que le test porte `ROBOTS_TAG=noindex`, ce qui est le défaut.
