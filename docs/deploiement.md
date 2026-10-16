# Déploiement

Le portfolio utilise deux images Docker — le site Astro servi par Node et son API Rust —,
derrière l'**edge partagé** du VPS (dépôt `infra-vps`), le point d'entrée TLS
de tous les projets de l'hôte, V1 comprise. Ce document décrit l'architecture, la chaîne de mise en
ligne, la bascule depuis la V1, les gestes courants et les pièges connus. Les valeurs à configurer
sont dans [`secrets.md`](secrets.md) ; la mesure d'audience a son propre document,
[`mesure-audience.md`](mesure-audience.md).

> **Depuis le 2026-10-15, la V2 sert `charles-lindecker.com`** (`www.` en 301 vers l'apex) et
> son test `test.charles-lindecker.com` ; la V1 est arrêtée et archivée, figée, sur
> `yharnam.charles-lindecker.com`. Deux conteneurs qui déclarent le même domaine se marchent
> dessus : le déploiement refuse toujours de démarrer sur un domaine qu'un autre projet de l'hôte
> déclare encore. Déroulé de la bascule, écarts et retour arrière : [`bascule.md`](bascule.md).

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
portfolio-prod-web-1   portfolio-test-web-1   monportfolio-archive    analytics-umami
:4000 (interne)        :4000 (interne)        (V1 figée)              (pile analytics,
charles-lindecker.com  test.charles-          yharnam.charles-        infra-vps)
www. -> 301 apex       lindecker.com          lindecker.com           /u/script.js,
                                              hors index              /u/api/send
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

Chaque pile possède aussi un service `backend:8080` (alias `portfolio-backend`), sur son réseau Compose seulement :
aucun port publié, aucune étiquette Caddy et aucune connexion au réseau `edge`. Le serveur
Node relaie les routes publiques de contact et de santé, les routes explicitement autorisées
du backoffice et `/mcp`, en même origine. Les corps sont limités à 24 Kio et le délai à
20 secondes. Le réseau bridge permet au backend de joindre le serveur SMTP (celui réglé dans
le backoffice, rubrique « E-mails », sinon le repli `SMTP_*`). `CONTACT_EMAIL`
initialise seulement une base neuve ; l’adresse enregistrée dans SQLite pilote ensuite le
destinataire et les pages HTML sans script ni reconstruction. Le volume `portfolio-data`,
propre à chaque nom de projet Compose, conserve les demandes et les réglages au déploiement.
Le backend supprime chaque heure les demandes reçues il y a plus de 3 ans.
Sauvegarde et connexion au backoffice : [`backend/README.md`](../backend/README.md).

En ligne, Node utilise l’adresse ajoutée par Caddy dans `X-Forwarded-For` et transmet
`X-Contact-Client-IP` avec le secret `BACKEND_PROXY_TOKEN`. Rust ignore une IP transmise
sans ce jeton. Le formulaire compte deux tentatives par IP sur une heure ; son état reste en
mémoire et se réinitialise au redémarrage. Le contrôle de santé confirme que le processus
répond, y compris lorsque SMTP n’est pas encore renseigné.

## 2. Chaîne de mise en ligne

Les déclenchements automatiques, suspendus pendant la transition avec la V1 (2026-10-08), sont
rétablis par la branche de bascule (2026-10-14) : `push` sur `dev` et `main`, `pull_request` sur
`dev`, et le lancement manuel.

```
push dev  ->  _tests  ->  fusion dev->test  ->  _build (:sha + :staging)  ->  _deploy TEST
push main ->  _promote (:staging -> :prod, :latest)                       ->  _deploy PROD
```

L'archive de la V1 a sa propre chaîne, `.github/workflows/archive-v1.yml` : un push sur `dev` qui
touche `archive-v1/` (ou un lancement manuel) la reconstruit depuis le dépôt `MonPortfolio` figé
et la redéploie dans `/opt/monportfolio-archive` ([`archive-v1/README.md`](../archive-v1/README.md)).

`_tests` joue ses jobs en parallèle : l’API (`backend` : rustfmt, Clippy, tests dont SMTP
local), l'application (`front` : `astro check`, tests dont ceux
du serveur, build), le navigateur (`e2e` : Playwright sur le build servi par le serveur de
production, puis le parcours réel du backoffice et du MCP) et la mise en ligne (`infra` :
shellcheck, actionlint, combinaisons Compose, construction des deux images sans publication).
Une PR vers `dev` ne joue que `_tests`.

Depuis le 2026-10-16, `e2e` ne joue plus que sur une PR (Dependabot compris) : il prenait près
d’un quart d’heure à chaque push. Au push sur `dev`, c’est le hook `.githooks/pre-push` qui le
joue en local, sur l’arbre de travail, avant que le commit ne parte : `npm run test:e2e`, puis le
parcours réel du backoffice (`scripts/test-backoffice.mjs`). Il ne s’arme que si le push touche
`site/` ou `backend/`, refuse un arbre de travail qui n’est pas exactement ce qui part, et se pose
tout seul au `npm install` de `site/` (script `prepare` : `git config core.hooksPath .githooks`).
`git push --no-verify` passe outre, en connaissance de cause.

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
`compose.yaml`, `compose.deploy.yaml`, `compose.umami.yaml`, `compose.umami-tableau.yaml` et
`scripts/deploy-remote.sh`, puis exécute ce dernier depuis le fichier. Le script :

1. vérifie le `.env` (`COMPOSE_PROJECT_NAME`, `CADDY_DOMAINS`) ;
2. **choisit les calques** : `compose.yaml` et `compose.deploy.yaml` toujours,
   `compose.umami.yaml` si `UMAMI_WEBSITE_ID` est posé, `compose.umami-tableau.yaml` si
   `UMAMI_DASHBOARD_DOMAIN` l'est (refusé sans ID). Un `COMPOSE_FILE` de confort périmé dans le
   `.env` est signalé ;
3. vérifie que le réseau `edge` existe, puis **refuse de continuer si un conteneur d'un autre
   projet déclare déjà l'un de ses domaines** (étiquettes `caddy` et `caddy_N`), domaine du
   tableau de bord Umami compris ;
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
| Domaines | `test.charles-lindecker.com` (`test.v2.` jusqu'à la bascule) | `charles-lindecker.com`, `www.charles-lindecker.com` |
| Hôte canonique | — | `www.` renvoyé en 301 vers l'apex |
| Indexation (`X-Robots-Tag`) | `noindex` | `all` |
| Mesure d'audience | active, site Umami « Portfolio V2 (test) » | active depuis le 2026-10-16, site Umami « Portfolio » |
| Tableau de bord Umami | — | `stats.charles-lindecker.com` (`UMAMI_DASHBOARD_DOMAIN`) |
| État au 2026-10-15 | en service | en service depuis la bascule ([`bascule.md`](bascule.md)) |

Les dossiers et les noms de projet de la V2 sont distincts de ceux de la V1
(`/opt/monportfolio-staging`, `/opt/monportfolio-prod`) : jamais de dossier partagé entre les
deux versions.

## 4. Mise en service

### 4.1 Premier déploiement de test (fait le 2026-10-15)

1. **L'edge tourne sur l'hôte** (dépôt `infra-vps`) :

   ```bash
   ssh root@<vps> 'docker network inspect edge >/dev/null && echo "edge OK"'
   ```

2. **Secrets posés** : [`secrets.md`](secrets.md) § 1 à § 6.
3. **DNS** : le domaine de test en A vers l'IP de l'hôte (`test.v2.` pendant la bascule,
   `test.` depuis) : sans lui, Let's Encrypt échoue et Caddy entre en back-off.

   ```bash
   dig +short test.charles-lindecker.com         # l'IP de l'hôte
   ```

4. **Premier passage** : `git push origin dev`. La chaîne joue les tests, fusionne dans `test`,
   construit l'image, la publie et la déploie. Puis :

   ```bash
   T=https://test.charles-lindecker.com
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

### 4.2 Bascule depuis la V1 et archive (faite le 2026-10-15)

L'invariant : **à aucun moment deux projets ne déclarent le même domaine.** La V1 quitte
`charles-lindecker.com` et `www.` avant que la V2 ne les déclare ; le garde-fou du déploiement
refuserait l'ordre inverse. La procédure complète, avec les secrets, le DNS, les gestes manuels,
les vérifications et le retour arrière, est dans [`bascule.md`](bascule.md). En résumé :

1. **Préparer** : DNS de `yharnam.` et `test.v2.`, clé SSH, `ENV_TEST`, `ENV_PROD` et les onze
   secrets. Rien ne change en ligne.
2. **Intégrer** : un push sur `dev` met en ligne la V2 en test et l'archive de la V1 sur
   `yharnam.charles-lindecker.com` (`.github/workflows/archive-v1.yml`, [`archive-v1/`](../archive-v1/README.md)).
   La V1 sert toujours le domaine principal.
3. **Basculer** : couper la CI de la V1, arrêter ses deux piles, fusionner `test` dans `main`.
   Environ cinq minutes de coupure.
4. **Vérifier** depuis le poste : `node scripts/verifier-bascule.mjs`.

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
[serveur] /app/dist servi sur http://0.0.0.0:4000 — mesure d'audience active (site …, domaine test.charles-lindecker.com) — pas d'hôte secondaire
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
> (`main`). Tant que `ci.yml` n'y est pas, c'est-à-dire jusqu'à la bascule, le lancement manuel
> est indisponible : un push sur `dev` relance la chaîne de test.

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
npx playwright test               # navigateur (joué aussi par le hook avant un push sur dev)
```

`npm run dev` est le plus rapide pour travailler les pages, mais il ne passe pas par
`server/server.mjs` : ni CSP, ni redirections, ni vraie 404, et `/mesure.js` y est le fichier sans
effet de `public/`. Le serveur de production sert exactement ce qui part en ligne.
Le proxy Vite joint Rust sur `BACKEND_URL` (`http://127.0.0.1:8080` par défaut).
Régler le serveur d’envoi dans le backoffice (rubrique « E-mails ») pour recevoir les
notifications e-mail ; les variables `SMTP_*` du `.env` servent de repli tant qu’aucun réglage
n’y est enregistré. Le réglage prime, sans redémarrage. Sans l’un ni l’autre, le formulaire
conserve les demandes dans le backoffice. Activer son accès avec
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

- **Le relais joint le backend par son alias `portfolio-backend`, jamais par `backend`.** Le
  service web rejoint le réseau `edge`, partagé par tous les projets de l'hôte, où chaque service
  est inscrit sous son nom court : un service `backend` d'un autre projet y deviendrait homonyme,
  et le DNS de Docker pourrait lui envoyer les demandes de contact et le jeton du relais. Règle
  d'`infra-vps` (`docs/APPLICATIONS.md`, réseaux), vérifiée par le job `infra`.

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

- **Le backend a 320 Mio pour importer les images du blog.** Son pic n'est pas le trafic mais
  l'import d'une image, borné par le code (`backend/src/blog_media.rs`) : 4 Mio par fichier,
  25 Mpx, 150 Mo au plus tenus par le décodage, tampons propres à chaque décodeur compris
  (au-delà, l'import est refusé : `422 IMAGE_TOO_HEAVY`), une image décodée à la fois. Mesuré
  sous Linux (`memory.peak` du cgroup d'un conteneur neuf limité à 320 Mio sans swap, comme en
  production, avec les réglages de l'allocateur de l'image, 28 Mio au repos compris) : 92 à
  94 Mio pour un JPEG séquentiel de 24 Mpx, 144 Mio pour un PNG RGBA de 2 500 × 10 000, 150 à
  163 Mio pour les images au seuil du décodage (WebP, GIF, PNG de 16 bits, JPEG progressifs en
  4:4:4 ou en CMJN), et 168 Mio au pire, pour une photo d'iPhone de 24,5 Mpx en JPEG progressif ;
  une image refusée par le seuil de décodage n'ajoute rien au service au repos. 320 Mio laissent
  1,9× ce pire cas.
  Les gros imports (`backend/src/upload_queue.rs`) attendent leur tour sans lire leur corps,
  deux à la fois, 10 s au plus avant une réponse `503 UPLOAD_BUSY` ; un import plus petit prend
  sa place une fois lu, avant son décodage, car un fichier de 15 Kio peut coûter autant à décoder
  qu'un fichier de 4 Mio. Une image lourde et 8 ou 16 imports de 4 Mio à la fois aboutissent
  tous ; 48 à la fois, 38 aboutissent et 11 reçoivent la réponse 503 ; 171 Mio de mémoire anonyme
  au pire. 48 clients qui enchaînent des imports de 24 Mpx pendant 30 s montent à 175 Mio : la
  limite vaut 1,8× ce pic. Aucun OOM, et le formulaire de contact répond pendant ce temps (le cache
  de fichiers de SQLite remplit le reste du cgroup, que le noyau récupère). Sans la file, 8
  imports simultanés tuaient le conteneur en pleine requête, à 256 Mio comme à 320, et le
  formulaire de contact avec lui jusqu'au redémarrage ; sans la place des petits imports, 12 GIF
  de 15 Kio à la fois. L'allocateur est réglé dans `backend/Dockerfile` (`MALLOC_ARENA_MAX=2`,
  `MALLOC_MMAP_THRESHOLD_=1048576`) : sans ces réglages, la glibc garde par fil la mémoire
  libérée, le pire import seul monte à 184 Mio, et 48 clients en continu tuaient le conteneur
  une fois sur deux, à 313 Mio de mémoire anonyme. Ne pas les retirer. Le plafond de 4 Mio par
  fichier est une décision : une photo plus lourde s'exporte plus petite avant l'import.
  Le pic réel reste à relever en production : `docker stats` au premier gros import. Pour
  baisser la limite, baisser d'abord `MAX_DECODING`, puis remesurer, et aligner
  `backend/README.md`. Les mesures sont à refaire à chaque nouvelle version d'`image`,
  `image-webp` ou `zune-jpeg`, dont les tampons fondent le calcul du coût. La rubrique
  Stockage du backoffice montre ce qui prend de la place sur le disque et dans la base.

- **Un conteneur `unhealthy` n'est jamais redémarré.** `restart: unless-stopped` réagit à la sortie
  du processus, pas à l'état de santé. Le HEALTHCHECK sert au déploiement, qui refuse de conclure
  sur un conteneur non sain, pas à la supervision continue.

- **Le test sert les pages de la production.** Une même image sert les deux environnements : tout
  ce qui est écrit dans les pages (balises canoniques, sitemap) désigne la production. Sans
  conséquence tant que le test porte `ROBOTS_TAG=noindex`, ce qui est le défaut.
