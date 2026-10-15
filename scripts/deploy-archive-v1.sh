#!/usr/bin/env bash
# Mise en ligne de l'archive de la V1 sur l'hote mutualise.
#
# Usage : deploy-archive-v1.sh <chemin_projet> <image@digest> <domaine>
#
# Depose par .github/workflows/archive-v1.yml avec archive-v1/compose.yaml, puis
# execute DEPUIS LE FICHIER (ssh -n), jamais sur l'entree standard de ssh : voir
# scripts/deploy-remote.sh pour la raison. Meme principes que ce dernier, en
# plus court : l'archive est une pile figee, a un seul service, sans secret.
#
# Ce script ecrit le .env de la pile lui-meme (aucun secret colle a la main),
# refuse de declarer un domaine de la V2 ou un domaine qu'un autre projet de
# l'hote declare deja, et verifie la reponse publique : certificat, prerendu,
# bandeau et en-tete noindex. Il ne touche jamais a l'edge partage : si le
# certificat ne vient pas, il le dit et s'arrete.
#
# Volontairement en ASCII strict (voir scripts/deploy-remote.sh).

set -euo pipefail

DEPLOY_PATH="${1:?chemin du projet sur le serveur attendu en 1er argument}"
IMAGE="${2:?image epinglee par digest attendue en 2e argument}"
DOMAINE="${3:?domaine de l archive attendu en 3e argument}"

PROJET=monportfolio-archive
ETIQUETTE_IMAGE=org.opencontainers.image.title=monportfolio-archive

log() { printf '\n== %s\n' "$*"; }

# --- Arguments ---------------------------------------------------------------
# Une image designee par une etiquette mobile pourrait changer sous l'archive au
# prochain pull : seule une image epinglee par son digest est acceptee.
if ! [[ "${IMAGE}" =~ ^ghcr\.io/[a-z0-9._/-]+@sha256:[0-9a-f]{64}$ ]]; then
  echo "Image refusee : ${IMAGE}. Attendu ghcr.io/...@sha256:<digest>." >&2
  exit 1
fi
if ! [[ "${DOMAINE}" =~ ^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$ ]]; then
  echo "Domaine refuse : ${DOMAINE}. Attendu un nom d hote nu, en minuscules." >&2
  exit 1
fi
# Le domaine principal et www appartiennent a la V2. Les declarer ici les
# ferait servir par deux projets a la fois.
case "${DOMAINE}" in
  charles-lindecker.com|www.charles-lindecker.com)
    echo "${DOMAINE} appartient a la V2 : l archive vit sur son seul sous-domaine." >&2
    exit 1
    ;;
esac

cd "${DEPLOY_PATH}"
if [ ! -f compose.yaml ]; then
  echo "compose.yaml absent de ${DEPLOY_PATH}. Le depot par scp a echoue." >&2
  exit 1
fi

# --- .env de la pile ---------------------------------------------------------
# umask avant l'ecriture : le fichier n'est jamais lisible par d'autres, meme
# un instant. Il ne contient rien de secret, mais c'est la regle de l'hote.
(
  umask 077
  {
    echo "COMPOSE_PROJECT_NAME=${PROJET}"
    echo "COMPOSE_FILE=compose.yaml"
    echo "ARCHIVE_IMAGE=${IMAGE}"
    echo "ARCHIVE_DOMAINE=${DOMAINE}"
  } > .env
)
export COMPOSE_FILE=compose.yaml

# --- Infrastructure partagee -------------------------------------------------
if ! docker network inspect edge >/dev/null 2>&1; then
  echo "Reseau Docker edge absent. Deployer infra-vps avant ce projet." >&2
  exit 1
fi

# --- Domaine deja declare par un autre projet --------------------------------
# Meme controle que scripts/deploy-remote.sh : une ligne par adresse declaree a
# l'edge (etiquettes caddy et caddy_N) par un conteneur d'un AUTRE projet,
# ramenee a un nom d'hote nu.
detenteurs="$(
  ids="$(docker ps -q)"
  if [ -n "${ids}" ]; then
    # shellcheck disable=SC2086 # un identifiant par mot, voulu
    { docker inspect -f '{{$p := index .Config.Labels "com.docker.compose.project"}}{{range $k, $v := .Config.Labels}}{{$p}}|{{$k}}|{{$v}}{{println}}{{end}}' ${ids} 2>/dev/null || true; } \
      | awk -F'|' -v projet="${PROJET}" -v cherche="${DOMAINE}" '
          $1 != projet && $2 ~ /^caddy(_[0-9]+)?$/ {
            n = split($3, adresses, /[ \t,]+/)
            for (i = 1; i <= n; i++) {
              a = tolower(adresses[i])
              sub(/^[a-z]+:\/\//, "", a)
              sub(/\/.*$/, "", a)
              sub(/:[0-9]*$/, "", a)
              if (a == cherche) print "  " a " : declare par " ($1 == "" ? "un conteneur hors Compose" : "le projet " $1)
            }
          }' | sort -u
  fi
)"
if [ -n "${detenteurs}" ]; then
  echo "Domaine deja declare a l'edge par un autre projet de l'hote :" >&2
  printf '%s\n' "${detenteurs}" >&2
  exit 1
fi

# --- Image et demarrage ------------------------------------------------------
log "Recuperation de ${IMAGE}"
for attempt in 1 2 3 4 5; do
  if docker compose pull; then
    break
  fi
  if [ "${attempt}" = 5 ]; then
    echo "docker compose pull : echec apres 5 tentatives." >&2
    echo "Si le registre refuse l'acces, rendre le package monportfolio-archive" >&2
    echo "public ou authentifier l'hote sur ghcr.io (docs/bascule.md)." >&2
    exit 1
  fi
  echo "pull en echec (tentative ${attempt}), nouvel essai dans $((attempt * 10))s." >&2
  sleep $((attempt * 10))
done

log "Demarrage de ${PROJET}"
docker compose up -d --remove-orphans

log "Attente de l'etat healthy"
cid="$(docker compose ps -q web | head -n 1)"
if [ -z "${cid}" ]; then
  echo "Conteneur web introuvable apres up." >&2
  exit 1
fi
sante=""
for _ in $(seq 1 30); do
  etat="$(docker inspect -f '{{.State.Status}}' "${cid}")"
  if [ "${etat}" = "restarting" ] || [ "${etat}" = "exited" ]; then
    echo "Le conteneur s'arrete des son demarrage (etat : ${etat})." >&2
    docker compose logs --tail 80 web >&2 || true
    exit 1
  fi
  sante="$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}absent{{end}}' "${cid}")"
  if [ "${sante}" = "healthy" ]; then break; fi
  if [ "${sante}" = "absent" ]; then
    echo "Image sans HEALTHCHECK : deploiement refuse." >&2
    exit 1
  fi
  sleep 5
done
if [ "${sante}" != "healthy" ]; then
  echo "Le conteneur n'est pas devenu healthy (etat : ${sante})." >&2
  docker compose logs --tail 80 web >&2 || true
  exit 1
fi

{
  echo "image       : ${IMAGE}"
  echo "domaine     : ${DOMAINE}"
  echo "deploye le  : $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
  echo "projet      : ${PROJET}"
} > DEPLOIEMENT.txt

docker image prune -f --filter "label=${ETIQUETTE_IMAGE}" >/dev/null

# --- Contrat public ----------------------------------------------------------
# Un premier certificat s'emet en quelques secondes quand le DNS pointe deja
# sur l'hote. On laisse deux minutes a l'edge, sans jamais le redemarrer : il
# sert tous les sites de l'hote, et l'archive ne merite pas de les couper.
log "Verification publique de https://${DOMAINE}/"
url="https://${DOMAINE}/"
entetes=""
for _ in $(seq 1 24); do
  if entetes="$(curl -sS --max-time 10 -o /dev/null -D - "${url}" 2>/dev/null)" \
    && grep -qE '^HTTP/[0-9.]+ 200' <<<"${entetes}"; then
    break
  fi
  entetes=""
  sleep 5
done
if [ -z "${entetes}" ]; then
  echo "https://${DOMAINE}/ ne repond pas 200 avec un certificat valide." >&2
  echo "Verifier l'enregistrement DNS (A vers cet hote) : dig +short ${DOMAINE}" >&2
  echo "Si le DNS etait en retard, l'emission peut rester en attente : relancer" >&2
  echo "l'edge a un moment creux (coupe tous les sites quelques secondes) :" >&2
  echo "  docker restart \$(docker ps -q --filter label=com.docker.compose.project=edge --filter label=com.docker.compose.service=caddy)" >&2
  exit 1
fi
if ! grep -qiE '^x-robots-tag:.*noindex' <<<"${entetes}"; then
  echo "https://${DOMAINE}/ ne porte pas X-Robots-Tag: noindex. L'archive serait indexee." >&2
  exit 1
fi
page="$(curl -fsS --max-time 10 "${url}")"
# Lu par <<< et non par un tube : `grep -q` s'arrete au premier resultat, et
# `printf` qui ecrit encore une page de 200 Ko recoit alors SIGPIPE ; avec
# pipefail, le controle echouerait sur une page pourtant conforme.
if ! grep -q 'ng-server-context="ssg' <<<"${page}"; then
  echo "https://${DOMAINE}/ ne sert pas le prerendu (verifier NG_ALLOWED_HOSTS)." >&2
  exit 1
fi
if ! grep -q 'class="archive-bandeau"' <<<"${page}"; then
  echo "https://${DOMAINE}/ ne montre pas le bandeau d'archive." >&2
  exit 1
fi
echo "Archive en ligne : certificat, prerendu, bandeau et noindex verifies."
