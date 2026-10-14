# Archive de la V1

La première version du portfolio (dépôt public
[`MonPortfolio`](https://github.com/LINDECKER-Charles/MonPortfolio), Angular) reste en ligne,
figée et hors index, sur **`https://yharnam.charles-lindecker.com`**. Elle ne disparaît pas :
elle sert de preuve, et le pied de page de la V2 y renvoie (`ARCHIVE_V1`, `site/src/config/site.ts`).

Décisions du 2026-10-14 ([`docs/questions.md`](../docs/questions.md), bloc F) : le sous-domaine
`yharnam.`, et la refonte d’août plutôt que la version que servait la production. Ordre de mise
en ligne et gestes manuels : [`docs/bascule.md`](../docs/bascule.md).

## Ce qui est archivé

Le commit `216d6b0` de `MonPortfolio` (pointe de `dev` le 2026-10-14), exactement ce que servait
`test.charles-lindecker.com`. Le dépôt de la V1 n’est jamais modifié : tout ce qui fait d’elle
une archive est ici.

| Différence avec la V1 | Où | Pourquoi |
|---|---|---|
| Bandeau « Archive de la première version de mon portfolio. Voir le site actuel ↗ » | `bandeau/`, posé dans `src/index.html` avant la construction | dire où l’on est et renvoyer vers la V2 |
| `SITE_URL=https://yharnam.charles-lindecker.com` à la construction | `.github/workflows/archive-v1.yml` | balises canoniques, JSON-LD, sitemap et robots.txt désignent l’archive, jamais le domaine de la V2 |
| `ROBOTS_NOINDEX=1` à l’exécution | `compose.yaml` | `X-Robots-Tag: noindex, nofollow` sur toutes les réponses : l’archive ne concurrence pas la V2 |
| `NG_ALLOWED_HOSTS` sur le sous-domaine | `compose.yaml` | sans lui, le serveur d’Angular retombe en rendu client |

Le robots.txt de l’archive laisse l’exploration ouverte, et c’est voulu : un robot bloqué par
`Disallow: /` ne lirait jamais l’en-tête `noindex`. Les balises `<meta name="robots">` de la V1
disent encore `index, follow` ; l’en-tête l’emporte, les moteurs retenant la consigne la plus
restrictive.

## Construction et mise en ligne

`.github/workflows/archive-v1.yml`, déclenché par un push sur `dev` qui touche l’archive, ou à la
main (`gh workflow run archive-v1.yml --ref main`) :

1. extrait la V1 au commit figé, pose le bandeau (`node archive-v1/bandeau/poser.mjs`) ;
2. construit l’image avec le Dockerfile de la V1, la publie sur GHCR
   (`ghcr.io/lindecker-charles/monportfolio-archive`) ;
3. dépose `compose.yaml` et `scripts/deploy-archive-v1.sh` dans `/opt/monportfolio-archive`, et
   démarre la pile `monportfolio-archive` avec l’image **épinglée par son digest**.

Le script refuse de déclarer `charles-lindecker.com` ou `www.`, ou un domaine qu’un autre projet
de l’hôte déclare déjà ; il échoue si la réponse publique n’a pas de certificat valide, pas de
prérendu, pas de bandeau ou pas d’en-tête `noindex`. Il ne redémarre jamais l’edge partagé.

Aucun secret propre : l’archive réutilise `PROD_HOST`, `PROD_SSH_USER` et `PROD_SSH_KEY`.

## Sur l’hôte

```bash
ssh root@charles-lindecker.com
cd /opt/monportfolio-archive
cat DEPLOIEMENT.txt          # image (digest), domaine, date
docker compose ps
docker compose logs --tail 100 web
```

## Retoucher le bandeau

Modifier `bandeau/`, vérifier avec `node --test archive-v1/bandeau/poser.test.mjs`, pousser sur
`dev` : l’archive est reconstruite et redéployée. Le style vit dans `archive-bandeau.css`, en
valeurs écrites en dur : il est hors des deux systèmes de jetons, et posé par-dessus le fond sombre
de la V1 aux couleurs de jour de la V2.
