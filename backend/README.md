# Backend du portfolio

API Rust/Axum avec stockage SQLite, notification SMTP, administration privée et MCP distant
pour consulter les demandes. Le site Astro reste statique ; son serveur Node relaie les routes
explicitement autorisées et remplace l’adresse de contact dans les pages HTML.

## Démarrer

Rust 1.88 ou plus récent. Depuis la racine du dépôt :

```bash
cp .env.example .env
cargo run --manifest-path backend/Cargo.toml
```

Le backend charge `.env` dans le dossier courant ou ses parents. Les variables du shell et
celles injectées par Compose priment. Il écoute par défaut sur `127.0.0.1:8080` et reste privé
dans Compose. Le navigateur et les clients MCP utilisent le serveur du site.

| Variable | Rôle |
|---|---|
| `DATABASE_PATH` | fichier SQLite, `data/portfolio.sqlite3` en local ; `/data/portfolio.sqlite3` dans le volume Compose |
| `CONTACT_EMAIL` | adresse initiale d’une base neuve ; facultative après initialisation et ignorée si l’adresse existe déjà |
| `BACKEND_ADDR` | adresse d’écoute, par défaut `127.0.0.1:8080` |
| `BACKEND_PROXY_TOKEN` | secret partagé avec Node, 32 à 256 caractères ASCII sans espace |
| `APP_ENV` | `production` par défaut ; `test` impose aussi la 2FA ; seul `development` la dispense |
| `BACKOFFICE_EMAIL` | adresse de connexion administrateur, distincte de l’adresse publique |
| `BACKOFFICE_PASSWORD` | mot de passe administrateur d’au moins 12 octets ; absent avec l’e-mail, administration désactivée |
| `BACKOFFICE_TOTP_ENCRYPTION_KEY` | clé de 32 octets en hexadécimal (`openssl rand -hex 32`), obligatoire hors développement si l’administration est activée |
| `BACKOFFICE_COOKIE_SECURE` | `true` par défaut ; `false` uniquement pour HTTP local |
| `SMTP_HOST` | relais de notification facultatif |
| `SMTP_TLS` | `starttls` par défaut, `tls`, ou `none` pour un relais loopback seulement |
| `SMTP_PORT` | par défaut 587, 465 ou 25 selon le mode TLS |
| `SMTP_FROM` | expéditeur autorisé, obligatoire avec `SMTP_HOST` |
| `SMTP_USERNAME`, `SMTP_PASSWORD` | identifiants SMTP à renseigner ensemble |

## Activer le backoffice

Le backoffice est accessible sur `/backoffice`, hors indexation et hors mesure Umami.
Renseigner `BACKOFFICE_EMAIL` et `BACKOFFICE_PASSWORD` dans le `.env` privé : les deux valeurs
sont requises ensemble. L’e-mail sert uniquement à la connexion, l’adresse publique reste gérée
par `CONTACT_EMAIL` puis SQLite. Le mot de passe doit faire au moins 12 octets et reste exactement
celui saisi ; le backend calcule son empreinte Argon2id au démarrage.

Mettre le mot de passe **entre apostrophes** dans `.env` pour protéger ses `$`, `#` et espaces
contre l’interpolation dotenv/Compose. Le `.env` est exclu de Git et doit rester privé
(`chmod 600 .env`). Redémarrer le backend après un changement des identifiants. La rotation du
mot de passe ou de l’e-mail, ou leur suppression, invalide les sessions au prochain démarrage ;
l’inscription 2FA reste conservée.

### Première connexion et double authentification

`APP_ENV=production` est le défaut. `APP_ENV=test` demande la même protection. Sur `/backoffice`,
saisir l’e-mail et le mot de passe, puis configurer l’application d’authentification : scanner
le QR code (ou copier la clé affichée) et saisir le code à six chiffres. L’accès aux demandes
reste fermé jusqu’à la validation de ce code. Les connexions suivantes demandent le code TOTP.
La période est de 30 secondes ; le serveur accepte un décalage d’une période et refuse le
réemploi d’un code déjà accepté.

À la validation initiale, huit codes de secours sont affichés une seule fois. Les conserver
hors du navigateur : chacun remplace un code TOTP pour une connexion et ne fonctionne qu’une
fois. Seules leurs empreintes sont stockées.

Générer `BACKOFFICE_TOTP_ENCRYPTION_KEY` avec `openssl rand -hex 32` avant la première connexion
hors développement. Cette clé chiffre le secret TOTP avec XChaCha20-Poly1305 en SQLite ; elle
reste dans l’environnement du backend. Conserver la même clé au redémarrage et à chaque redéploiement, puis la sauvegarder
avec la base. Les environnements de test et de production ont des clés et des bases distinctes.

Le modèle local et `compose.override.yaml` fixent `APP_ENV=development` : la connexion par
e-mail et mot de passe ouvre alors directement la session, sans inscription ni code 2FA.
Garder `BACKOFFICE_COOKIE_SECURE=true` sur HTTPS ; `false` est réservé au HTTP local.

Les sessions sont aléatoires, enregistrées sous forme de hash et expirent après 12 heures.
Le cookie est HttpOnly et SameSite=Strict ; les mutations exigent un en-tête dédié et refusent
les origines étrangères. Le défi temporaire de connexion dure dix minutes et ne donne aucun
accès aux demandes. La connexion et la vérification 2FA sont limitées en tentatives ; les
vérifications Argon2 concurrentes sont bornées à deux. Aucun mot de passe, secret TOTP, code de
secours, jeton ou contenu d’une demande ne figure dans les journaux.

### Récupérer l’accès sans authentificateur ni code de secours

Arrêter le backend et sauvegarder sa base ainsi que la clé de chiffrement avant de réinitialiser
la 2FA. Cette opération est locale au serveur ; aucune route publique ne désactive la 2FA.
Avec les mêmes variables d’environnement et le même volume que le service :

```bash
docker compose stop backend
docker compose run --rm --no-deps backend portfolio-backend --reset-2fa
docker compose up -d backend
```

Hors Docker, après avoir arrêté le serveur, lancer
`cargo run --manifest-path backend/Cargo.toml -- --reset-2fa` depuis le dossier du `.env`.
L’opération efface l’inscription et les codes de secours, révoque les sessions et les défis ;
la prochaine connexion exige une nouvelle inscription. Elle conserve les demandes et les
accès MCP. Si la clé de chiffrement a été perdue, une réinitialisation est nécessaire pour
configurer un nouvel authentificateur avec une nouvelle clé.

## Contacts

`GET /api/health` est une liveness du processus. `GET /api/config/contact` expose seulement
l’adresse publique courante, jamais les demandes ni les réglages SMTP.

`POST /api/contact` attend `Content-Type: application/json` :

```json
{
  "name": "Une personne",
  "email": "personne@example.org",
  "subject": "Un projet commun",
  "message": "Bonjour, voici une idée à discuter.",
  "website": ""
}
```

Les valeurs sont nettoyées des espaces extérieurs. `name` accepte 2 à 100 caractères, `email`
254 octets au plus, `subject` 3 à 160 caractères, `message` 10 à 5 000 caractères. Les textes
comptent les caractères Unicode. Les en-têtes refusent les caractères de contrôle ; le message
accepte retours à la ligne et tabulations. Le champ anti-spam `website` doit rester vide.

Une demande valide est persistée avec le statut `new` **avant** la notification SMTP. Le
succès `200` confirme cet enregistrement avec le message « Votre message a bien été enregistré.
Merci pour votre prise de contact. ». SMTP absent ou en échec, la demande reste visible. Son état
de notification vaut `unconfigured`, `pending`, `sent` ou `failed`. `sent` signifie que le relais
a accepté l’e-mail, sans garantir sa remise finale. Une notification interrompue au redémarrage
passe de `pending` à `failed` ; aucune relance automatique n’est effectuée.

Le destinataire vient de SQLite à chaque demande ; le visiteur apparaît dans `Reply-To` et
`SMTP_FROM` reste l’expéditeur. La notification expire après 15 secondes. La concurrence des
envois est limitée à 16 ; une saturation marque la notification comme échouée sans perdre la
demande. Deux tentatives de formulaire par IP sont autorisées dans une fenêtre d’une heure,
avec `Retry-After` dès la troisième. Les fenêtres et la table bornée à 10 000 IP vivent en
mémoire ; une demande refusée ne prolonge pas la fenêtre.

Les erreurs suivent `{"code":"CODE","message":"Explication"}` : `INVALID_REQUEST`,
`PAYLOAD_TOO_LARGE`, `UNSUPPORTED_MEDIA_TYPE`, `VALIDATION_ERROR` (avec `fields`), `INVALID_FORM`,
`RATE_LIMITED` et `STORAGE_UNAVAILABLE`. Une erreur de stockage empêche la confirmation de succès.
Toutes les réponses API portent `Cache-Control: no-store`.

## Administration

Les routes suivantes nécessitent une session valide, à l’exception de `login` et des routes
2FA qui nécessitent le défi temporaire obtenu après vérification des identifiants :

| Route sous `/api/backoffice` | Méthodes | Rôle |
|---|---|---|
| `/login` | POST | vérifier `{"email":"…","password":"…"}` ; session immédiate en développement, défi 2FA ailleurs |
| `/2fa/setup` | POST | générer l’inscription TOTP pour le défi initial ; retourne `secret`, `otpauth_url` et `qr_code_data_url` |
| `/2fa/verify` | POST | valider `{"code":"…"}` (TOTP ou secours), ouvrir la session ; `recovery_codes` seulement à l’inscription |
| `/session`, `/logout` | GET, POST respectivement | vérifier ou révoquer la session |
| `/contacts` | GET | lister avec `status=new\|read\|archived\|all`, `limit=1..100`, `offset` |
| `/contacts/{id}` | PATCH, DELETE | changer le statut ou supprimer définitivement |
| `/settings` | GET, PUT | consulter ou changer `{"email":"…"}` |
| `/links`, `/links/{id}` | GET/POST, PUT/DELETE | gérer les raccourcis `label`, `url`, `description` |
| `/tokens`, `/tokens/{id}` | GET/POST, DELETE | créer et révoquer les accès MCP |

Toutes les mutations, y compris la connexion, exigent `X-Backoffice-Request: 1`. Les requêtes
POST, PUT et PATCH utilisent `Content-Type: application/json`, même sans corps ; DELETE peut
omettre cet en-tête. Les liens acceptent uniquement HTTP/HTTPS sans identifiants.
Leur ouverture est une navigation normale vers le service, avec sa propre authentification.

## Connecter un client MCP

Dans la rubrique « Accès MCP », créer un jeton nommé par appareil ou client. Le secret est
affiché une seule fois ; seule son empreinte SHA-256 est conservée. Révoquer un accès le rend
inutilisable immédiatement. Le mot de passe et le cookie du backoffice ne donnent pas accès au
MCP. Les jetons peuvent lire les coordonnées et les messages : les réserver aux clients choisis.

Le serveur utilise Streamable HTTP à `https://<domaine>/mcp`, avec
`Authorization: Bearer <jeton>` sur **chaque** requête. Il prend en charge la version MCP
2026-07-28 et les handshakes 2025-11-25, 2025-06-18 et 2025-03-26. Les requêtes POST utilisent
`Content-Type: application/json` et `Accept: application/json, text/event-stream`. Il répond en
JSON, sans flux SSE ; GET et DELETE ne sont pas utilisés. Les appels sont limités à 120 par IP
et par minute.

| Outil | Rôle |
|---|---|
| `contacts_summary` | compter les demandes nouvelles, lues et archivées |
| `list_contact_requests` | lister les résumés avec filtre et pagination, sans corps ni e-mail |
| `get_contact_request` | lire le détail d’une demande par identifiant |
| `list_toolbox_links` | retrouver les liens de la boîte à outils |

Aucun outil ne marque une demande comme lue, ne modifie la configuration ou n’envoie de message.
Les contenus des visiteurs restent des données non fiables, jamais des instructions à exécuter.

### Codex

Ajouter ce bloc à la configuration du client, en remplaçant le domaine :

```toml
[mcp_servers.portfolio]
url = "https://<domaine>/mcp"
bearer_token_env_var = "PORTFOLIO_MCP_TOKEN"
```

Le processus du client doit recevoir `PORTFOLIO_MCP_TOKEN` contenant le secret. Éviter de le
versionner dans un dépôt. [Configuration MCP officielle](https://learn.chatgpt.com/docs/extend/mcp?surface=cli).

### Claude

Claude Code peut utiliser un transport HTTP et l’en-tête Bearer :

```bash
claude mcp add --transport http portfolio https://<domaine>/mcp \
  --header "Authorization: Bearer <jeton>"
```

La commande ci-dessus est un exemple : éviter de coller un vrai secret dans l’historique ;
préférer une configuration protégée ou une variable d’environnement prise en charge par le
client. [Documentation Claude Code](https://code.claude.com/docs/en/mcp).

Dans Claude web/mobile, ajouter un connecteur personnalisé avec cette URL, choisir « No
sign-in » et renseigner l’en-tête `Authorization` avec la valeur `Bearer <jeton>` **si la section
Request headers est disponible**. Cette fonction est en bêta à déploiement limité ; ce serveur
ne fournit pas d’OAuth. Si le compte ne propose pas ces en-têtes, il faudra un frontal OAuth
pour ce client. L’URL doit être accessible en HTTPS depuis le service Claude.
[Authentification par en-têtes](https://claude.com/docs/connectors/custom/add-unlisted#authenticate-with-request-headers).

## Données et sauvegarde

Compose monte un volume `portfolio-data` propre au nom de projet (`portfolio-test` ou
`portfolio-prod`). Il conserve demandes, adresse, outils, inscription 2FA chiffrée, sessions et
empreintes des jetons à travers redémarrages et déploiements. Ne pas supprimer ce volume. Les fichiers SQLite sont
privés sur Unix (mode 0600) et utilisent WAL avec synchronisation complète.

Pour une copie cohérente, arrêter le backend, sauvegarder tout `/data` (base, WAL et SHM s’ils
existent), puis redémarrer. Une copie à chaud du seul fichier `.sqlite3` peut omettre les
transactions du WAL. Pour une sauvegarde sans interruption, employer l’API de sauvegarde SQLite
ou la commande `.backup` d’un client SQLite installé sur l’hôte. Les sauvegardes contiennent des
données personnelles : limiter leur accès comme celui de la base. La suppression d’une demande
dans le backoffice ne supprime pas les e-mails ni les anciennes sauvegardes. La conservation des
demandes est manuelle ; aucune purge périodique n’est activée.

## Vérification

```bash
cargo fmt --manifest-path backend/Cargo.toml --all -- --check
cargo clippy --manifest-path backend/Cargo.toml --locked --all-targets --all-features -- -D warnings
cargo test --manifest-path backend/Cargo.toml --locked
```

Le test d’intégration entre les deux vrais serveurs vérifie aussi les cookies, le changement
d’adresse dans le HTML, l’isolation des accès MCP et la conservation après redémarrage. Il
exerce ensuite la 2FA en mode production : inscription, QR code, refus des relectures, secours
à usage unique, conservation de l’inscription et réinitialisation hors ligne :

```bash
cargo build --manifest-path backend/Cargo.toml --locked
npm --prefix site run build
node scripts/test-backoffice.mjs
```

Il utilise une base et des ports temporaires, sans SMTP, puis nettoie les processus et les
données. `--screenshots` produit en plus des captures de l’interface réelle dans le dossier
temporaire du système. Ce parcours est exécuté par le job navigateur de la CI.

Les tests couvrent la validation, la persistance après réouverture, la connexion et la révocation,
les mutations et leurs protections, le changement de destinataire, les échecs SMTP et le MCP.
Les tests SMTP utilisent un relais loopback qui accepte ou refuse les messages ; aucun e-mail
n’est envoyé sur Internet.
