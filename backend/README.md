# Backend du portfolio

API Rust/Axum avec stockage SQLite, notification SMTP, administration privée, blog et MCP distant.
Le site Astro fournit la structure statique ; son serveur Node relaie les routes explicitement
autorisées, remplace l’adresse de contact et rend les articles publiés avec leurs métadonnées SEO.

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
| `BACKOFFICE_TOTP_ENCRYPTION_KEY` | clé de 32 octets en hexadécimal (`openssl rand -hex 32`), obligatoire hors développement si l’administration est activée ; chiffre aussi, par une sous-clé, le mot de passe SMTP réglé dans le backoffice |
| `BACKOFFICE_COOKIE_SECURE` | `true` par défaut ; `false` uniquement pour HTTP local |
| `SMTP_HOST` | relais de notification facultatif, **repli** quand aucun serveur d’envoi n’est réglé dans le backoffice (voir « Serveur d’envoi des e-mails ») |
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
l’adresse d’expédition du serveur d’envoi (réglage du backoffice, sinon `SMTP_FROM`) reste
l’expéditeur. Le serveur utilisé est le réglage courant, lu sans redémarrage. Un réglage
enregistré mais inutilisable (mot de passe qui ne se déchiffre plus, connexion sans TLS hors
développement) marque la notification `failed` ; un envoi coupé ou absent, `unconfigured`. La notification expire après 15 secondes. La concurrence des
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
| `/mail` | GET, PUT, DELETE | lire, enregistrer ou oublier le serveur d’envoi des e-mails (voir « Serveur d’envoi des e-mails ») |
| `/mail/test` | POST | envoyer l’e-mail d’essai vers l’adresse de contact, avec le réglage courant |
| `/links`, `/links/{id}` | GET/POST, PUT/DELETE | gérer les raccourcis `label`, `url`, `description` |
| `/tokens`, `/tokens/{id}` | GET/POST, DELETE | lister (avec `expires_at` et `expired`), créer (`{"name":"…","scopes":[…],"expires_in_days":90}`, 201 avec le secret et `expires_at` ; 422 au-delà de 365 jours ; 409 `TOKEN_LIMIT_REACHED` au-delà de 64 accès) et révoquer ou supprimer les accès MCP |
| `/blog/posts` | GET/POST | lister avec `status=draft\|scheduled\|published\|all`, `limit=1..100`, `offset` ; créer un brouillon |
| `/blog/posts/{id}` | GET/PUT/DELETE | lire, remplacer les champs éditables avec `revision`, supprimer avec `{"revision":…}` |
| `/blog/posts/{id}/preview`, `/blog/posts/{id}/seo` | GET | lire le brouillon ou son audit SEO |
| `/blog/posts/{id}/publish`, `/blog/posts/{id}/unpublish` | POST | publier ou retirer avec `{"revision":…}` |
| `/blog/posts/{id}/schedule` | POST | programmer avec `{"revision":…, "scheduled_at":…}` |
| `/blog/media`, `/blog/media/{id}`, `/blog/media/{id}/{largeur}` | GET/POST, GET/DELETE, GET | lister/importer les images (refus : `422 IMAGE_TOO_LARGE` ou `IMAGE_TOO_HEAVY`, `503 UPLOAD_BUSY` après 10 s d’attente), lire leurs octets ou ceux d’une variante avec la session ; supprimer une image qu’aucune version d’article ne cite (sinon `409 MEDIA_IN_USE`) |
| `/storage` | GET | mesurer la place prise (session seulement, refusé à un accès MCP) |

Toutes les mutations, y compris la connexion, exigent `X-Backoffice-Request: 1`. Les requêtes
POST, PUT et PATCH utilisent `Content-Type: application/json`, même sans corps ; DELETE peut
omettre cet en-tête, sauf sous `/blog/` : à travers le relais Node, une DELETE du blog exige elle
aussi `Content-Type: application/json`, sinon `415` (le backoffice envoie alors le corps `{}`). Les liens acceptent uniquement HTTP/HTTPS sans identifiants.
Leur ouverture est une navigation normale vers le service, avec sa propre authentification.

### Serveur d’envoi des e-mails

Le backoffice règle le serveur SMTP des notifications (rubrique « E-mails »). **Priorité** : un
réglage enregistré en SQLite prime, qu’il active ou coupe l’envoi ; tant qu’aucun réglage n’est
enregistré, les variables `SMTP_*` servent de repli. `DELETE /api/backoffice/mail` oublie le
réglage et rend la main au repli. Chaque notification lit le réglage courant, sans redémarrage ;
le transport est reconstruit au premier envoi qui suit un enregistrement.

`GET /api/backoffice/mail` (comme les réponses de `PUT` et `DELETE`) :

```json
{
  "active": true,
  "source": "settings",
  "recipient": "contact@example.org",
  "settings": { "enabled": true, "host": "smtp.hostinger.com", "port": 465, "security": "tls",
                "username": "contact@example.org", "password_set": true,
                "from": "contact@example.org", "updated_at": "2026-10-15T09:25:45.184Z" },
  "environment": null,
  "problem": null,
  "password_storage": true,
  "allow_insecure": false,
  "allowed_ports": [465, 587, 25, 2525]
}
```

`source` vaut `settings`, `environment` (le repli `SMTP_*`, résumé dans `environment` : hôte,
port, sécurité, expéditeur, jamais l’identifiant ni le mot de passe) ou `none`. `active` dit si la
prochaine demande partira aussi par e-mail. `problem` signale un réglage qui ne peut pas servir :
`password_unreadable` (la clé a changé : ressaisir le mot de passe), `insecure_connection` ou
`invalid_settings`. `password_storage` est faux sans `BACKOFFICE_TOTP_ENCRYPTION_KEY` : un mot de
passe ne peut alors pas être enregistré (422 sur le champ `password`).

`PUT /api/backoffice/mail` prend `{"enabled":…, "host":"…", "port":…, "security":"tls|starttls|none",
"username":"…", "password":"…", "from":"…"}`. Un refus répond `422 VALIDATION_ERROR` avec
`fields` (`host`, `port`, `security`, `username`, `password`, `from`) :

- `host` : un nom d’hôte (lettres, chiffres, tirets, points) ou une adresse IP, jamais une URL ni
  un port ; avec TLS, il doit permettre de vérifier un certificat ;
- `port` : 465, 587, 25 ou 2525 ;
- `security` : `tls` (TLS implicite, en général 465) ou `starttls` (en général 587). Hors
  `APP_ENV=development`, aucune connexion sans TLS. En développement seulement, `none` vers un
  relais local, sur un port libre (mailpit, 1025) ;
- `username` et `password` : vides, pas d’authentification ; un identifiant exige un mot de
  passe. Un `password` vide ou absent **garde** celui qui est enregistré, tant que l’hôte, le
  port, la sécurité et l’identifiant ne changent pas : sinon, il faut le saisir de nouveau (422
  sur `password` quand l’envoi est activé ; envoi coupé, l’ancien est oublié), et le secret
  n’atteint jamais un autre serveur. Vider l’identifiant efface le mot de passe ;
- `from` : l’adresse d’expédition, exigée quand l’envoi est activé.

Le mot de passe est chiffré au repos : XChaCha20-Poly1305 avec une sous-clé SHA-256 tirée de
`BACKOFFICE_TOTP_ENCRYPTION_KEY` (contexte `portfolio-backoffice-smtp-password-key-v1`) et des
données associées propres à cet usage. Un chiffré du secret TOTP ne s’ouvre pas comme mot de
passe, ni l’inverse. Le choix de cette clé plutôt qu’une clé dédiée : une seule clé à générer, à
conserver et à sauvegarder avec la base, déjà obligatoire hors développement. Changer la clé rend
le mot de passe illisible (`problem: password_unreadable`) sans empêcher le démarrage. Le mot de
passe n’est jamais renvoyé par l’API (seulement `password_set`) ni écrit dans un journal.

Pour la messagerie d’Hostinger : hôte `smtp.hostinger.com`, port 465, TLS ; l’identifiant et
l’adresse d’expédition sont l’adresse de la boîte.

`POST /api/backoffice/mail/test` (corps `{}`) envoie un e-mail d’essai à l’adresse de contact,
avec le réglage courant (ou le repli). La connexion se fait d’abord, TLS et authentification
comprises, puis l’envoi ; 15 s au plus. Un essai toutes les 15 secondes, dix par heure
(`429 RATE_LIMITED` avec `Retry-After`). Réponses, sans détail du serveur ni secret :

| Statut | Code | Sens |
|---|---|---|
| 200 | — | `{"result":"sent","recipient":"…","message":"…"}` : le serveur a accepté l’e-mail |
| 409 | `SMTP_NOT_CONFIGURED` | aucun envoi actif |
| 409 | `SMTP_SETTINGS_UNREADABLE`, `SMTP_SETTINGS_INVALID`, `SMTP_INSECURE` | le réglage enregistré ne peut pas servir |
| 502 | `SMTP_CONNECTION_FAILED` | hôte injoignable, port fermé, TLS refusé ou serveur muet |
| 502 | `SMTP_AUTH_FAILED` | identifiant ou mot de passe refusé (530, 534, 535, 538) |
| 502 | `SMTP_SENDER_REJECTED` | expéditeur, destinataire ou message refusé |

### Stockage

`GET /api/backoffice/storage` répond, pour la session seulement (un Bearer MCP reçoit 401) :

- `disk` : `total` et `available` en octets, `null` pour une base en mémoire ;
- `database` : `file`, `wal` (`null` en mémoire), `size` (pages × `page_size`), `free` (espace
  libre interne, réutilisé aux prochaines écritures) et `page_size`. La place réelle sur le
  disque est `file` + `wal` ;
- `categories` : `media_originals`, `media_variants`, `posts`, `contacts`, `system`, en octets de
  pages (index compris, via `dbstat`) ; leur somme plus `free` vaut `size` ;
- `media` : par poids total décroissant, avec `id`, `filename`, `content_type`, `width`,
  `height` (`null` si non mesurée), `size`, `variants` (`count`, `size`, `widths`), `total`,
  `created_at`, `url`, `admin_url` et `posts` (les articles qui la citent, avec `status`
  `draft`, `scheduled` ou `published`) ;
- `posts` : par poids décroissant (`id`, `slug`, `title`, `status`, `size` des versions JSON) ;
- `contacts` : `count` et `size`.

Le calcul se fait dans une transaction de lecture sur une connexion à part. Les vignettes se
lisent par `admin_url` (original) ou `admin_url/{largeur}` (variante). Supprimer une image :
`DELETE /api/backoffice/blog/media/{id}` avec `X-Backoffice-Request: 1`, `Content-Type:
application/json` et le corps `{}` (415 sinon, à travers le relais) : 200, 409 `MEDIA_IN_USE`,
404, et les 401, 403 ou 503 de toute route du backoffice.

## Rédiger et publier le blog

Le backoffice propose un éditeur Tiptap : titres H2 à H4, gras, italique, soulignement, texte
barré, liens, listes, citations, code, séparateurs, alignement, tableaux et images. Le document
JSON structuré est conservé en SQLite ; le serveur valide les types de nœuds, leur hiérarchie,
les attributs et les URL avant de les enregistrer. Il refuse le HTML brut et les liens actifs
`javascript:` ou `data:`. La profondeur est limitée à 20, le nombre de nœuds à 5 000 et le
document sérialisé à 256 Kio.

Un article possède `title` (1 à 160 caractères), `slug` (1 à 100 caractères minuscules ASCII,
chiffres et tirets), `excerpt` (500 caractères au plus), `content`, `tags` (20 au plus, 50
caractères chacun), `cover_image`, `cover_alt`, `seo_title` (120 caractères au plus),
`seo_description` (320 caractères au plus), `canonical_url`, `og_image` et `noindex`.
Les champs facultatifs ont une valeur vide, `null` ou `false` par défaut. Les images (contenu,
couverture, partage) utilisent seulement les URL importées `/api/blog/media/{id}`. Un lien est
une adresse `http(s)` absolue sans identifiants, un chemin du site avec au besoin des paramètres
et une ancre (`[A-Za-z0-9/_.-]`, `?[A-Za-z0-9=&_.-]`, `#[A-Za-z0-9_-]` : `/blog?page=2`,
`/projets/omnicard#decisions`) ou l’ancre d’un titre de l’article (`#le-contexte`) ; `mailto:`
est refusé. L’éditeur et le rendu public appliquent la même règle. L’URL canonique accepte une
adresse HTTPS absolue sans identifiants.

Exemple d’arguments pour `blog_create_post` :

```json
{
  "title": "Expliquer une décision de conception",
  "slug": "expliquer-une-decision-de-conception",
  "excerpt": "Présenter le contexte, les choix possibles et les conséquences de la décision.",
  "content": {
    "type": "doc",
    "content": [
      { "type": "heading", "attrs": { "level": 2 }, "content": [{ "type": "text", "text": "Le contexte" }] },
      { "type": "paragraph", "content": [{ "type": "text", "text": "Commencer par le problème à résoudre." }] }
    ]
  },
  "tags": ["Architecture"]
}
```

Créer ou modifier un article prépare le contenu editable. La création produit toujours un
**brouillon**, et la modification d’un article publié conserve sa version publique jusqu’à
une nouvelle publication explicite. Le lien **Aperçu** ouvre le rendu du brouillon sous
`/api/backoffice/blog/preview/{id}`, avec une session backoffice valide. Cette page et ses
images restent privées et hors indexation. L’API JSON correspondante est
`GET /api/backoffice/blog/posts/{id}/preview`.

Chaque réponse contient une `revision` entière. La transmettre lors d’une modification, d’une
publication, d’une programmation, d’un retrait ou d’une suppression. Si une autre modification
ou une publication programmée a eu lieu entre-temps, `REVISION_CONFLICT` empêche d’écraser son
résultat : relire l’article et intégrer les changements avant de réessayer. Un slug déjà réservé
produit `SLUG_CONFLICT`.

**Publier** copie la version courante vers la version publique. Il faut un titre, un slug,
un extrait et un contenu non vide ; une couverture doit avoir un texte alternatif. **Programmer**
fige cette même version pour une date future, transmise en secondes Unix UTC dans `scheduled_at`
(au plus cinq ans). Le formulaire convertit la date locale du navigateur en UTC. Les modifications
suivantes ne changent pas la version programmée : reprogrammer après relecture pour les inclure.
Le backend vérifie les échéances au démarrage puis chaque minute ; les lectures publiques
vérifient aussi les échéances. Une échéance passée pendant un arrêt est donc reprise au redémarrage.
Un retrait annule la programmation et retire la version publique, en conservant le brouillon.

Les routes publiques sont `GET /api/blog/posts?limit=…&offset=…` (résumés publiés),
`GET /api/blog/posts/{slug}` (version publiée), `GET /api/blog/media/{id}` et ses variantes
`GET /api/blog/media/{id}/{largeur}`. Aucun brouillon
ni article programmé sans version publiée n’y apparaît. Une image importée reste inaccessible
par sa route publique tant qu’aucune version publiée ne la référence ; le backoffice peut la lire
via sa route privée. Les octets des images PNG, JPEG, GIF et WebP sont enregistrés dans SQLite,
avec vérification de leur signature et une limite de 4 Mio. Ce plafond est une décision : une
photo de plus de 4 Mio s’exporte plus petite avant l’import, puisque le site la sert sur
1 600 px au plus et que la mémoire de l’import dépend de ses pixels, pas du poids du fichier.
L’import prend `{"filename":"…", "content_type":"image/png", "data_base64":"…"}`, sans préfixe
`data:`.

À l’import, le backend lit l’en-tête de l’image (10 000 px de côté et 25 millions de pixels
au plus, sinon `422 IMAGE_TOO_LARGE`), puis la décode : 150 Mo au plus tenus par le décodage,
tampons propres au décodeur compris, une image à la fois, quelle que soit la voie (backoffice,
MCP ou démarrage). Une image dont le décodage demanderait plus (WebP de plus de 13 Mpx avec
transparence ou de 21 Mpx sans, JPEG progressif de plus de 16 Mpx en 4:4:4, PNG de 16 bits par
canal de plus de 12,5 Mpx…) est refusée à l’import : `422 IMAGE_TOO_HEAVY`, avec le message
« Cette image est trop lourde à réduire. Exportez-la en JPEG ou en PNG 8 bits, ou réduisez-la
(3 000 px sur le plus grand côté suffisent). », que l’atelier et l’outil MCP montrent tel quel.
Le seuil dépend du nombre de pixels : à 3 000 × 3 000 px, tous les formats passent, alors qu’un
portrait ramené à 3 000 px de large peut rester refusé. Sans variante, son original partirait tel
quel sur mobile, sans que son auteur le sache. Exportée en JPEG séquentiel ou en PNG 8 bits, une
image de 25 Mpx au plus passe toujours. Une image déjà en base, traitée au démarrage, reste
gardée sans variante. Avec les réglages de l’allocateur de l’image Docker (`backend/Dockerfile` :
`MALLOC_ARENA_MAX=2`, `MALLOC_MMAP_THRESHOLD_=1048576`), un PNG RGBA de 2 500 × 10 000 px monte à
144 Mio ; le pire pic mesuré, 168 Mio, est une photo d’iPhone de 24,5 Mpx en JPEG progressif ;
une image refusée par le seuil de décodage n’ajoute rien au service au repos (28 Mio). D’où les
320 Mio du service dans `compose.deploy.yaml`, détaillés dans
[`docs/deploiement.md`](../docs/deploiement.md).

Les gros imports attendent leur tour avant d’être lus. Une requête dont le corps peut dépasser
64 Kio (`Content-Length` au-dessus, ou absent avec un corps en flux), par le backoffice
(`POST /api/backoffice/blog/media`) ou par le MCP (`POST /mcp`, outil `blog_upload_media`), prend
l’une des deux places qu’ils partagent, une fois la session ou le jeton vérifiés. En attente, elle
ne lit pas son corps : TCP freine son client. Après 10 s, elle reçoit `503 UPLOAD_BUSY` avec
`Retry-After: 10` ; son corps est lu et jeté avant la réponse (9 Mio et 5 s au plus), sans quoi
la connexion serait réinitialisée et le client perdrait la réponse. Les 10 s laissent à l’import
le temps de finir avant les 20 s au bout desquelles le relais Node et l’atelier abandonnent. Un
import plus petit prend lui aussi une place, une fois son corps lu, avant son décodage : un
fichier de 15 Kio peut coûter autant à décoder qu’un fichier de 4 Mio (un GIF de 18,7 Mpx), et
une rafale de tels imports tuait le conteneur. Il reçoit la même réponse `503 UPLOAD_BUSY` après
10 s. Un import garde sa place jusqu’à la fin de son traitement, même si son client se
déconnecte. Les autres petites requêtes (appels MCP ordinaires, formulaire de contact, atelier)
ne passent jamais par cette file.

Mesuré dans un conteneur limité à 320 Mio sans swap, avec les réglages de l’allocateur : une
image lourde et 8 ou 16 imports de 4 Mio à la fois aboutissent tous, en 4,6 s au plus ; 48 à la
fois, 38 aboutissent et 11 reçoivent la réponse 503 après 10 s ; 171 Mio de mémoire anonyme au
pire. 12 à 48 GIF de 15 Kio et de 18,7 Mpx envoyés ensemble aboutissent tous, à 146 Mio au plus.
48 clients qui enchaînent des imports de 24 Mpx pendant 30 s montent à 175 Mio. Aucun OOM, et le
formulaire de contact répond pendant ce temps. Sans la file, 8 imports simultanés tuaient le
conteneur ; sans la place des petits imports, 12 GIF de 15 Kio à la fois ; sans les réglages de
l’allocateur, qui garde sinon par fil la mémoire libérée, 48 clients en continu le tuaient une
fois sur deux, à 313 Mio de mémoire anonyme.

Le backend mesure les dimensions de l’image,
orientation EXIF comprise, et prépare des variantes réduites aux largeurs 480, 960 et 1 600 px
(et à sa propre largeur si elle ne dépasse pas 1 600 px) : JPEG de qualité 80, ou WebP sans
perte si l’image a de la transparence. Une variante qui ne pèse pas moins que l’original n’est
pas gardée. Une image animée (GIF, PNG ou WebP) n’a pas de variante réduite, mais une image
fixe, sa première image (`still`, 1 600 px de large au plus), que le rendu sert sous
`prefers-reduced-motion: reduce`. L’original est gardé sans ses métadonnées : EXIF (position
GPS, appareil, date), XMP, IPTC, commentaires et textes PNG, vignettes et images secondaires
JPEG partent ; seule l’orientation est réécrite, seule, pour qu’il s’affiche comme avant. Une
image dont même l’en-tête ne se lit pas est refusée ; celle que le décodeur ne lit qu’en partie
reste admise, mesurée par son en-tête et sans variante. Les images importées avant cette mesure
sont traitées une fois, au démarrage : chacune est d’abord marquée 0 × 0, pour qu’une image qui
ferait tomber le service ne soit jamais relue. Chaque image de la bibliothèque porte `width`,
`height`, `variants` (largeurs servies sous `/api/blog/media/{id}/{largeur}`, avec la même
règle de visibilité que l’original) et, pour une image animée, `still`.
`GET /api/blog/posts/{slug}`, l’aperçu `GET /api/backoffice/blog/posts/{id}/preview` et, pour
les couvertures, la liste publique ajoutent `media` : pour chaque URL d’image de l’article,
`{"width":…, "height":…, "variants":[…]}`, avec `"still":…` pour une image animée. Le rendu
Node en tire `width`, `height`, `srcset`, `sizes` et la source fixe des images animées.

Le SEO se règle séparément du titre et de l’extrait : titre/description pour les moteurs,
adresse canonique, image de partage et exclusion de l’index. En leur absence, les métadonnées
reprennent le titre, l’extrait et la couverture. L’audit signale la longueur des métadonnées,
les titres de section, les alternatives des images, le partage social et l’indexation. Son score
sert à relire le contenu, sans promettre un classement dans les moteurs. Les versions publiques
alimentent les pages du blog, leurs données structurées et le sitemap ; les brouillons
et les aperçus restent hors de ces sorties.

## Connecter un client MCP

### Claude Code, en un geste

1. Dans le backoffice, rubrique « Accès MCP », le formulaire « Nouvel accès » est déjà rempli :
   nom « Claude Code » (« Claude Code 2 »… si le nom existe ; nommer plutôt l’appareil,
   « Claude Code — MacBook »), préréglage **Rédaction**, case « Lire aussi les demandes de
   contact » **décochée**, durée **90 jours** (7 jours, 30 jours ou 1 an au choix).
2. « Créer l’accès » : la carte éclairée montre la commande prête à copier, par exemple en
   production :

   ```bash
   claude mcp remove --scope user portfolio 2>/dev/null
   claude mcp add --transport http --scope user portfolio https://charles-lindecker.com/mcp --header "Authorization: Bearer <secret>"
   ```

   La première ligne retire un serveur du même nom s’il existe (un accès précédent, révoqué ou
   perdu) : `claude mcp add` refuse un nom déjà connu, et sort quand même avec le code 0. Sans
   elle, recréer un accès échouerait sans qu’on le voie.

   L’adresse vient de l’origine de la page ; le nom du serveur, de l’hôte : `portfolio` en
   production, `portfolio-test` sur `test.…`, `portfolio-local` sur le poste. `--scope user`
   rend le serveur disponible dans tous les projets. `--header` vient en dernier : l’option
   accepte plusieurs valeurs.
3. « Copier la commande », la coller dans un terminal, puis `claude mcp list` doit afficher
   `✔ Connected`. « Vérifier l’accès » fait la même preuve depuis le backoffice, par le chemin de
   Claude Code (révision 2026-07-28) : `server/discover` puis `tools/list` avec le nouveau
   secret, en exigeant les indications de cache (`resultType`, `ttlMs`, `cacheScope`) sans
   lesquelles Claude Code rejette le catalogue ; puis la liste des outils réellement ouverts (cet
   appel compte comme une utilisation). « Terminé » pendant la vérification l’annule sans
   message ; au-delà de 15 s, l’écran dit que le serveur ne répond pas.
4. « Terminé » : le secret n’est plus affiché. Il disparaît aussi en quittant la rubrique, à la
   déconnexion et à l’expiration de la session ; il n’est jamais conservé dans le navigateur.
   Perdu : révoquer l’accès et en créer un autre ; sa commande remplace l’ancien serveur.

La commande contient le secret : Claude Code l’enregistre de toute façon dans sa configuration
(`~/.claude.json`), et l’historique du shell le garde aussi. La coller dans son propre terminal
seulement ; une commande précédée d’une espace reste hors de l’historique si le shell ignore ces
lignes (`setopt HIST_IGNORE_SPACE` pour zsh).

La liste « Accès créés » montre pour chaque accès son nom, ses permissions en clair, sa date de
création, sa dernière utilisation (« À l’instant », « Il y a 3 heures »…) et son échéance.
« Révoquer » demande confirmation, rend le secret inutilisable immédiatement et rappelle, seule sur sa
ligne, la commande `claude mcp remove --scope user …` à lancer côté client.

### Expiration des accès

Chaque accès expire, **un an au plus** : une mesure de sécurité. Le formulaire propose 7 jours,
30 jours, 90 jours (par défaut) ou 1 an ; l’API accepte `expires_in_days` de 1 à 365 (90 sans
précision) et refuse au-delà (`422 VALIDATION_ERROR`). La carte de l’accès créé dit sa date de
fin ; la commande Claude Code ne change pas. Un accès ne se prolonge pas : à son terme, on en
crée un autre. Les accès créés avant l’expiration ont reçu un an depuis leur création, sans
jamais être prolongés ; ceux qui avaient déjà plus d’un an sont expirés.

La liste annonce « Expire le … », signale un accès qui expire dans moins de 14 jours (losange,
jours restants) et garde un accès expiré, « Expiré le … », à supprimer comme les autres. Le MCP
refuse un accès expiré en `401`, avec le même en-tête `WWW-Authenticate` et la même forme de
corps qu’un secret inconnu : `{"code":"TOKEN_EXPIRED","message":"…"}` au lieu de
`{"code":"INVALID_TOKEN","message":"…"}`, sans nom, date ni permission. Seul le détenteur du
secret apprend qu’il a expiré. Un appel refusé ne compte pas comme une utilisation.

### Préréglages et permissions

| Préréglage | Permissions envoyées | Ce que l’assistant peut faire |
|---|---|---|
| Lecture du blog | `blog:read` | lire les articles, les brouillons, leurs aperçus, l’audit SEO et les images |
| **Rédaction** (par défaut) | `blog:read`, `blog:write` | tout lire, créer et modifier des brouillons, importer des images ; rien n’est publié |
| Publication | `blog:read`, `blog:write`, `blog:publish` | la rédaction, plus publier, programmer, retirer ou supprimer un article ou une image (si aucun article ne la cite) |
| case « Lire aussi les demandes de contact » | ajoute `contacts:read` | lire les demandes (noms, e-mails, messages) et la boîte à outils, en lecture seule |

Les demandes de contact contiennent des données personnelles : elles ne sont jamais accordées par
défaut. Les accès déjà créés gardent leurs permissions ; avant le 14 octobre 2026, l’interface
ajoutait `contacts:read` à chaque accès, sans le dire. La liste l’affiche désormais en clair
(« Demandes de contact ») : révoquer et recréer un accès pour retirer cette permission.

Le secret est montré une seule fois ; seule son empreinte SHA-256 est conservée. Le mot de
passe et le cookie du backoffice ne donnent pas accès au MCP, et un secret MCP n’ouvre jamais
`/api/backoffice`. Aucun accès ne modifie les contacts, les réglages ou les accès. Le backoffice
compte au plus 64 accès : au-delà, la création répond 409 `TOKEN_LIMIT_REACHED` avec un message
qui demande d’en révoquer un.

| Permission | Accès |
|---|---|
| `contacts:read` | demandes de contact et liens ; contient des coordonnées et des messages privés |
| `blog:read` | articles, brouillons, aperçus, audit SEO et liste des images |
| `blog:write` | créer/modifier les brouillons et importer des images ; exige `blog:read` |
| `blog:publish` | publier, programmer, retirer et supprimer les articles et les images ; exige `blog:write` |

Par l’API, `POST /api/backoffice/tokens` accepte des permissions explicites, par exemple
`{"name":"Rédaction", "scopes":["blog:read", "blog:write"]}`. Une création sans `scopes` reçoit
seulement `blog:read` (`contacts:read` doit être demandé) ; l’interface envoie toujours des
permissions explicites. La liste des accès expose leurs permissions, jamais leurs secrets. Le
catalogue MCP ne montre que les outils autorisés, et chaque appel vérifie à nouveau la
permission.

### Le serveur

Le serveur utilise Streamable HTTP à `https://<domaine>/mcp`, avec
`Authorization: Bearer <secret>` sur **chaque** requête. Il prend en charge la version MCP
2026-07-28 et les handshakes 2025-11-25, 2025-06-18 et 2025-03-26. Les requêtes POST utilisent
`Content-Type: application/json` et `Accept: application/json, text/event-stream`. Il répond en
JSON, sans flux SSE ; GET et DELETE ne sont pas utilisés. En 2026-07-28, `server/discover` et
`tools/list` portent les indications de cache exigées (`ttlMs` de cinq minutes, `cacheScope`
privé : le catalogue dépend des permissions de l’accès) ; sans elles, Claude Code refuse le
catalogue. Les appels sont limités à 120 par IP et par minute. Un corps MCP accepte au plus
8 Mio pour permettre l’import d’images en base64 ; les limites du document et de l’image restent
contrôlées séparément. Un appel de plus de 64 Kio attend sa place dans la file des imports,
partagée avec le backoffice, avant que son corps soit lu ; un import d’image plus petit
(`blog_upload_media`) la prend une fois son corps lu. Après 10 s, la réponse HTTP est
`503 UPLOAD_BUSY` avec `Retry-After`, à réessayer.

| Outil | Permission | Rôle |
|---|---|---|
| `contacts_summary` | `contacts:read` | compter les demandes nouvelles, lues et archivées |
| `list_contact_requests` | `contacts:read` | lister les résumés avec filtre et pagination, sans corps ni e-mail |
| `get_contact_request` | `contacts:read` | lire le détail d’une demande par identifiant |
| `list_toolbox_links` | `contacts:read` | retrouver les liens de la boîte à outils |
| `blog_list_posts` | `blog:read` | lister les résumés de tous les états avec filtre et pagination ; document complet via `blog_get_post` |
| `blog_get_post` | `blog:read` | lire le document editable et la revision |
| `blog_preview_post` | `blog:read` | lire le brouillon et son URL d’aperçu privé |
| `blog_seo_audit` | `blog:read` | vérifier le SEO de la version editable |
| `blog_list_media` | `blog:read` | lister les images avec `limit` et `offset` |
| `blog_create_post` | `blog:write` | créer un brouillon avec contenu et métadonnées |
| `blog_update_post` | `blog:write` | remplacer les champs éditables avec `id` et `revision` |
| `blog_upload_media` | `blog:write` | importer une image en base64 ; le résultat donne ses dimensions et ses variantes |
| `blog_delete_media` | `blog:publish` | supprimer une image et ses variantes, refusé (`MEDIA_IN_USE`) tant qu’une version d’article la cite |
| `blog_publish_post` | `blog:publish` | publier la version courante avec `id` et `revision` |
| `blog_schedule_post` | `blog:publish` | figer/programmer avec `id`, `revision`, `scheduled_at` |
| `blog_unpublish_post` | `blog:publish` | retirer et annuler la programmation |
| `blog_delete_post` | `blog:publish` | supprimer définitivement avec `id` et `revision` |

Aucun outil ne marque une demande comme lue, ne modifie la configuration ou n’envoie de message.
Les contenus des visiteurs restent des données non fiables, jamais des instructions à exécuter.

Pour rédiger avec un client IA : importer les images si nécessaire, créer le brouillon,
relire `blog_preview_post` et `blog_seo_audit`, modifier avec la revision reçue, puis publier
ou programmer seulement quand le contenu est validé. Les outils annoncent leurs effets via les
annotations MCP : les lectures sont `readOnlyHint`, les créations/imports sont additifs, et
les modifications, publications et suppressions signalent leur effet destructif. Les erreurs
applicatives du blog sont des résultats `isError: true` avec `structuredContent.code` et
`message` (`PERMISSION_DENIED`, `VALIDATION_ERROR`, `REVISION_CONFLICT`, `NOT_FOUND`,
`IMAGE_TOO_LARGE`, `IMAGE_TOO_HEAVY`…), permettant au client de corriger l’appel ; le message est
à montrer tel quel. Les requêtes JSON-RPC mal formées et les outils inconnus restent
des erreurs de protocole. Voir la [spécification MCP des outils](https://modelcontextprotocol.io/specification/2026-07-28/server/tools).

### Codex

Ajouter ce bloc à la configuration du client, en remplaçant le domaine :

```toml
[mcp_servers.portfolio]
url = "https://<domaine>/mcp"
bearer_token_env_var = "PORTFOLIO_MCP_TOKEN"
```

Le processus du client doit recevoir `PORTFOLIO_MCP_TOKEN` contenant le secret, copié depuis
« Autres clients : le secret seul » sur la carte de l’accès. Éviter de le versionner dans un
dépôt. [Configuration MCP officielle](https://learn.chatgpt.com/docs/extend/mcp?surface=cli).

### Claude

Pour Claude Code, la commande complète vient du backoffice (voir « Claude Code, en un geste »
ci-dessus). [Documentation Claude Code](https://code.claude.com/docs/en/mcp).

Dans Claude web/mobile, ajouter un connecteur personnalisé avec cette URL, choisir « No
sign-in » et renseigner l’en-tête `Authorization` avec la valeur `Bearer <secret>` **si la section
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
dans le backoffice ne supprime pas les e-mails ni les anciennes sauvegardes.

**Conservation** : les demandes de contact sont supprimées automatiquement 3 ans après leur
réception, le maximum admis par la CNIL pour des contacts entrants. Le backend vérifie au
démarrage puis chaque heure (`contact::spawn_retention`) et ne journalise que le nombre de
demandes supprimées. Les sauvegardes suivent leur propre durée de conservation.

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

Il utilise une base et des ports temporaires, puis nettoie les processus et les données. Le seul
SMTP est un faux serveur sur la boucle locale : réglage du serveur d’envoi, mot de passe chiffré
au repos, e-mail d’essai, notification sans redémarrage, puis expiration d’un accès MCP
(`TOKEN_EXPIRED` à travers le relais). `--screenshots` produit en plus des captures de l’interface réelle dans le dossier
temporaire du système. Ce parcours est exécuté par le job navigateur de la CI.

Les tests couvrent la validation, la persistance après réouverture, la connexion et la révocation,
les mutations et leurs protections, le changement de destinataire, les échecs SMTP et le MCP.
Les tests SMTP (`tests/contact_api.rs`, `tests/mail_api.rs`) utilisent un relais loopback qui
accepte, refuse l’authentification ou l’expéditeur ; aucun e-mail n’est envoyé sur Internet.
