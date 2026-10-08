# Backend du portfolio

API Rust asynchrone construite avec Axum et Tokio. Le routeur, la configuration, les erreurs,
la validation et la livraison SMTP vivent dans des modules séparés pour accueillir les
prochaines fonctionnalités. Aucune base de données n’est nécessaire au formulaire.

## Démarrer

Rust 1.88 ou plus récent. Depuis la racine du dépôt, préparer `.env` à partir du modèle,
puis lancer :

```bash
cargo run --manifest-path backend/Cargo.toml
cargo test --manifest-path backend/Cargo.toml --locked
cargo clippy --manifest-path backend/Cargo.toml --all-targets --locked -- -D warnings
```

Le backend cherche `.env` dans le dossier courant puis ses parents. Les variables du shell
et celles injectées par Compose priment sur ce fichier. Par défaut, il écoute sur
`127.0.0.1:8080`. En production, le serveur du site relaie `/api/` vers ce service, qui reste
sur le réseau privé Compose.

| Variable | Rôle |
|---|---|
| `CONTACT_EMAIL` | destinataire des messages, obligatoire ; aucune adresse dans le code |
| `BACKEND_ADDR` | adresse et port d’écoute, par défaut `127.0.0.1:8080` |
| `BACKEND_PROXY_TOKEN` | secret partagé avec le serveur du site, de 32 à 256 caractères ASCII imprimables sans espace |
| `SMTP_HOST` | hôte du relais ; absent, le formulaire répond `503` |
| `SMTP_TLS` | `starttls` par défaut (obligatoire), `tls`, ou `none` pour un hôte loopback uniquement |
| `SMTP_PORT` | par défaut `587` en STARTTLS, `465` en TLS ou `25` en mode local |
| `SMTP_FROM` | expéditeur autorisé par le relais, obligatoire avec `SMTP_HOST` |
| `SMTP_USERNAME`, `SMTP_PASSWORD` | authentification SMTP, à renseigner ensemble si nécessaire |

Le visiteur apparaît dans `Reply-To`. Le destinataire et l’expéditeur proviennent exclusivement
de la configuration. L’envoi expire après 15 secondes. Le succès confirme l’acceptation du
message par le relais SMTP, pas sa lecture ni sa remise finale en boîte de réception.

## API

`GET /api/health` retourne `200` avec `{"status":"ok","service":"portfolio-backend"}`.
Il confirme que le processus répond, même sans relais SMTP.

`POST /api/contact` attend `Content-Type: application/json` :

```json
{
  "name": "Une personne",
  "email": "personne@example.org",
  "subject": "Un projet commun",
  "message": "Bonjour, voici une idée à discuter.",
  "website": ""
}
```

Les valeurs sont nettoyées des espaces de début et de fin. `name` accepte 2 à 100 caractères,
`email` 254 octets au plus et une adresse valide, `subject` 3 à 160 caractères,
`message` 10 à 5 000 caractères. Les longueurs textuelles comptent les caractères Unicode.
Les champs d’en-tête refusent les caractères de contrôle ; le message accepte les retours
à la ligne et les tabulations. `website` est un champ anti-spam facultatif qui doit rester vide.

Après acceptation SMTP, `200` retourne `{"message":"Votre message a bien été envoyé. Merci pour votre prise de contact."}`.
Les erreurs partagent `{"code":"CODE","message":"Explication"}` :

| Statut | Code | Sens |
|---|---|---|
| `400` / `422` | `INVALID_REQUEST` | JSON mal formé ou structure invalide |
| `413` | `PAYLOAD_TOO_LARGE` | corps supérieur à 24 Kio |
| `415` | `UNSUPPORTED_MEDIA_TYPE` | format autre que JSON |
| `422` | `VALIDATION_ERROR` | champs invalides, détaillés dans l’objet `fields` |
| `422` | `INVALID_FORM` | champ anti-spam rempli ; aucun message envoyé |
| `429` | `RATE_LIMITED` | limite atteinte, délai dans l’en-tête `Retry-After` |
| `503` | `CONTACT_UNAVAILABLE` | relais SMTP non configuré |
| `502` | `DELIVERY_FAILED` | relais SMTP inaccessible, refus ou délai dépassé |

Toutes les réponses portent `Cache-Control: no-store`. Les erreurs et les journaux ne
reprennent ni contenu du formulaire, ni coordonnées du visiteur, ni détails SMTP.

## Protection et limites

Cinq tentatives par adresse IP sont autorisées dans une fenêtre de dix minutes ouverte par
la première tentative. Une tentative refusée ne prolonge pas cette fenêtre. Dès la sixième,
l’API répond `429` et indique le temps restant dans `Retry-After`, en secondes arrondies au
supérieur. Cette limite compte aussi les tentatives invalides et les échecs SMTP.
Les fenêtres expirent et la table est bornée à
10 000 adresses ; les envois simultanés sont bornés à 16. La limite vit en mémoire et se
réinitialise au redémarrage ; plusieurs réplicas auraient besoin d’un stockage partagé.

L’adresse de la connexion est utilisée par défaut. Le backend accepte `X-Contact-Client-IP`
seulement depuis une connexion loopback ou privée avec `X-Contact-Proxy-Token` égal au secret
configuré (comparaison en temps constant). Aucun en-tête `Forwarded` ou `X-Forwarded-For`
du navigateur n’est directement accepté. Le proxy doit remplacer les deux en-têtes.

Les tests vérifient la validation, les limites, les erreurs, le refus d’une IP forgée et
le transport SMTP face à un relais local qui accepte ou refuse le message. Ils n’envoient
aucun e-mail sur Internet.
