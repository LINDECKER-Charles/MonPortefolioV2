#!/usr/bin/env bash
# Mise en ligne du portfolio V2 sur un hote du VPS mutualise.
#
# Ce script est DEPOSE sur l'hote (scp) puis execute DEPUIS UN FICHIER, jamais
# transmis sur l'entree standard de ssh. Regle apprise a la dure sur cette
# infrastructure : dans un "ssh hote bash -s <<EOF", le shell distant lit le
# script lui-meme sur stdin, et la premiere commande qui consomme stdin
# (docker compose pull, up, ps, exec, restart) en avale un morceau. Les
# instructions suivantes sautent, et rien ne le signale : deux deploiements
# verts ont deja laisse un service non redemarre a cause de ca.
#
# Usage : deploy-remote.sh <chemin_projet> <reference_deployee>
#
# L'hote ne clone RIEN. Les fichiers Compose dont il a besoin (la base, le
# calque de deploiement et le calque de mesure d'audience) lui sont envoyes par
# le job appelant, qui les a deja sous la main apres son checkout.
# Consequences voulues :
#   - aucun acces au depot n'est necessaire depuis le VPS, qu'il soit public ou
#     prive : ni cle de deploiement, ni jeton, ni git installe sur la machine ;
#   - compose.override.yaml, qui publie un port et construit l'image localement,
#     n'atterrit jamais sur le serveur. Le confort de developpement ne peut donc
#     pas etre charge par accident sur un environnement servi.
#
# Ce script ne cree ni ne modifie AUCUN fichier de l'infrastructure partagee, et
# ne touche a aucune ressource des autres projets de l'hote. Il agit sur l'edge
# en un seul cas, documente plus bas : debloquer une emission de certificat
# coincee en back-off, en le redemarrant une fois.
#
# Volontairement en ASCII strict : shellcheck perd son analyseur sur un tiret
# cadratin (il ne sait pas encoder le caractere dans son rapport) et sur une
# apostrophe placee dans un ${VAR:?message}.

set -euo pipefail

DEPLOY_PATH="${1:?chemin du projet sur le serveur attendu en 1er argument}"
REFERENCE="${2:-inconnue}"

# Etiquette portee par l'image de ce projet (voir site/Dockerfile). Elle sert a
# ne nettoyer QUE nos images sur un hote partage.
ETIQUETTE_IMAGE=org.opencontainers.image.title=monportefoliov2

log() { printf '\n== %s\n' "$*"; }

lire_env() {
  # Valeur d'une cle du .env de l'hote, lue comme le parseur dotenv de Compose la
  # lirait : derniere occurrence en cas de doublon, retour chariot d'un fichier
  # CRLF retire, commentaire de fin de ligne ignore, espaces et guillemets
  # retires. Chaine vide si la cle est absente, le "|| true" empechant set -e de
  # tuer le script sur un grep muet.
  #
  # Le nettoyage n'est pas cosmetique : le contenu de ce .env vient d'un secret
  # GitHub colle a la main. Colle depuis un editeur Windows, il arrive en CRLF, et
  # CADDY_DOMAINS vaudrait alors "charles-lindecker.com\r" : curl echouerait sur
  # un site parfaitement sain. Un "TLS_ASSERT=0 # bascule" ne serait, lui, jamais
  # reconnu comme valant 0.
  grep -E "^${1}=" .env 2>/dev/null \
    | tail -n 1 \
    | cut -d= -f2- \
    | tr -d '\r"' \
    | sed -e 's/[[:space:]]#.*$//' -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//' \
    || true
}

exiger_fichier() {
  if [ ! -f "$1" ]; then
    echo "Fichier $1 absent de ${DEPLOY_PATH}. Le depot par scp a echoue." >&2
    exit 1
  fi
}

cd "${DEPLOY_PATH}"

# --- Ce que le job a du deposer ----------------------------------------------
for fichier in compose.yaml compose.deploy.yaml .env; do
  exiger_fichier "${fichier}"
done

# Vestige possible d'un ancien deploiement : ce fichier publierait un port et
# tenterait de construire l'image sur le VPS des qu'un humain lance un
# "docker compose" sans COMPOSE_FILE dans ce repertoire.
rm -f compose.override.yaml

# --- Garde-fous sur le .env de l'hote ----------------------------------------
# compose.yaml porte "name: portfolio" comme defaut de developpement. Sur un
# hote mutualise, ce repli est un piege : si le .env oublie
# COMPOSE_PROJECT_NAME, les piles de test et de production prennent TOUTES DEUX
# le nom de projet "portfolio" et se partagent conteneurs et reseaux. Un
# deploiement de test remplacerait alors la production, sans le moindre
# message. Compose ne signale pas cette absence : c'est donc ici que ca doit
# echouer.
projet="$(lire_env COMPOSE_PROJECT_NAME)"
if [ -z "${projet}" ]; then
  echo "COMPOSE_PROJECT_NAME absent du .env de ${DEPLOY_PATH}." >&2
  echo "Sans lui, cette pile s'appellerait 'portfolio' comme l'autre environnement" >&2
  echo "et l'ecraserait. Ajouter COMPOSE_PROJECT_NAME=portfolio-test ou" >&2
  echo "portfolio-prod au secret ENV_TEST / ENV_PROD (voir docs/secrets.md)." >&2
  exit 1
fi

# CADDY_DOMAINS est deja obligatoire cote Compose (${CADDY_DOMAINS:?}), mais le
# controle TLS de la fin le relit ici : une valeur que Compose accepte et que ce
# script lit vide ferait boucler assert_tls sur zero domaine, donc reussir sans
# avoir rien verifie.
domaines="$(lire_env CADDY_DOMAINS | tr ',' ' ')"
if [ -z "$(printf '%s' "${domaines}" | tr -d '[:space:]')" ]; then
  echo "CADDY_DOMAINS est vide ou illisible dans le .env de ${DEPLOY_PATH}." >&2
  exit 1
fi

# --- Calques Compose ---------------------------------------------------------
# Choisis APRES lecture du .env, parce qu'ils en dependent : la mesure
# d'audience n'existe que sur un environnement qui la demande. Poses ici et pas
# seulement dans le .env : le deploiement doit rester correct meme si le .env
# de l'hote, qui vient d'un secret colle a la main, oublie COMPOSE_FILE ou en
# garde une valeur perimee.
calques="compose.yaml:compose.deploy.yaml"

# Le calque de mesure n'est ajoute que si l'ID du site est pose : c'est la seule
# forme sure (voir compose.umami.yaml). Hors de ce calque, l'etiquette
# caddy.import n'existe pas ; un import vide ferait au contraire refuser la
# configuration de l'edge, donc couperait TOUS les sites du VPS.
if [ -n "$(lire_env UMAMI_WEBSITE_ID)" ]; then
  exiger_fichier compose.umami.yaml
  calques="${calques}:compose.umami.yaml"
fi
export COMPOSE_FILE="${calques}"

# COMPOSE_FILE du .env n'est qu'un confort pour les commandes lancees a la main
# dans ce repertoire. S'il diverge, le premier "docker compose up" manuel
# recreerait le conteneur sans son calque de mesure, sans rien dire : on le
# signale a chaque deploiement, sans bloquer celui-ci.
confort="$(lire_env COMPOSE_FILE)"
if [ -n "${confort}" ] && [ "${confort}" != "${calques}" ]; then
  echo "Attention : COMPOSE_FILE du .env (${confort}) differe des calques deployes" >&2
  echo "(${calques}). Une commande docker compose lancee a la main ici chargerait une" >&2
  echo "autre pile. Aligner le secret ENV_TEST / ENV_PROD (voir docs/secrets.md)." >&2
fi
log "Calques : ${calques}"

# --- Infrastructure partagee -------------------------------------------------
# Simple assertion : l'edge et le reseau "edge" appartiennent au depot infra-vps,
# seul proprietaire de la pile d'edge sur l'hote.
if ! docker network inspect edge >/dev/null 2>&1; then
  echo "Reseau Docker edge absent. Deployer infra-vps avant ce projet." >&2
  exit 1
fi

# --- Domaines deja declares par un autre projet ------------------------------
# L'edge reunit dans un meme bloc de site tout ce que les conteneurs declarent
# pour un meme domaine : deux projets qui declarent le meme domaine se marchent
# dessus, et rien ne le signale. Cas connu : la V1 du portfolio (piles
# monportfolio-staging et monportfolio-prod) declare charles-lindecker.com,
# www. et test. tant qu'elle n'a pas ete deplacee sur son sous-domaine
# d'archive. Ce deploiement refuse donc de demarrer, AVANT le "up", tant qu'un
# conteneur d'un AUTRE projet declare l'un de nos domaines. Les conteneurs de ce
# projet-ci (meme nom de projet) sont ignores : ce sont ceux qu'il remplace.
domaines_des_autres() {
  # Une ligne "domaine|detenteur" par adresse declaree a l'edge (etiquettes
  # caddy et caddy_N) par un conteneur en cours d'execution d'un autre projet.
  # Adresses ramenees a un nom d'hote nu : minuscules, sans schema, port ni
  # chemin.
  local ids=()
  mapfile -t ids < <(docker ps -q)
  if [ "${#ids[@]}" -eq 0 ]; then
    return 0
  fi
  # Un conteneur peut s'arreter entre "ps" et "inspect" : inspect echoue alors
  # pour lui seul, et la sortie des autres reste exploitable.
  { docker inspect -f '{{$p := index .Config.Labels "com.docker.compose.project"}}{{range $k, $v := .Config.Labels}}{{$p}}|{{$k}}|{{$v}}{{println}}{{end}}' "${ids[@]}" 2>/dev/null || true; } \
    | awk -F'|' -v projet="${projet}" '
        $1 != projet && $2 ~ /^caddy(_[0-9]+)?$/ {
          n = split($3, adresses, /[ \t,]+/)
          for (i = 1; i <= n; i++) {
            a = tolower(adresses[i])
            sub(/^[a-z]+:\/\//, "", a)
            sub(/\/.*$/, "", a)
            sub(/:[0-9]*$/, "", a)
            if (a != "") print a "|" ($1 == "" ? "un conteneur hors Compose" : "le projet " $1)
          }
        }'
}

conflits="$(domaines_des_autres | awk -F'|' -v nos="${domaines}" '
  BEGIN {
    n = split(tolower(nos), t, /[ \t,]+/)
    for (i = 1; i <= n; i++) if (t[i] != "") cherche[t[i]] = 1
  }
  ($1 in cherche) { print "  " $1 " : declare par " $2 }' | sort -u)"
if [ -n "${conflits}" ]; then
  echo "Domaine deja declare a l'edge par un autre projet de l'hote :" >&2
  printf '%s\n' "${conflits}" >&2
  echo "Deux projets qui declarent le meme domaine se marchent dessus. Retirer" >&2
  echo "d'abord ce domaine de l'autre projet ; pour la V1 du portfolio, la" >&2
  echo "deplacer sur son sous-domaine d'archive (docs/deploiement.md, bascule)." >&2
  exit 1
fi

# --- Image -------------------------------------------------------------------
log "Recuperation de l'image (${REFERENCE})"
# Le registre casse parfois un layer en cours de copie (connection reset by
# peer). Sans ces reprises, le deploiement echouerait sur un incident passager.
# Aucun repli sur une construction locale n'est possible : compose.yaml ne porte
# deliberement pas de section build, donc l'hote ne sait pas compiler le site.
for attempt in 1 2 3 4 5; do
  if docker compose pull; then
    break
  fi
  if [ "${attempt}" = 5 ]; then
    echo "docker compose pull : echec apres 5 tentatives." >&2
    echo "Si l'erreur est un refus du registre, verifier l'acces GHCR de l'hote" >&2
    echo "(package public, ou docker login ghcr.io) : voir docs/secrets.md." >&2
    exit 1
  fi
  echo "pull en echec (tentative ${attempt}), nouvel essai dans $((attempt * 10))s." >&2
  sleep $((attempt * 10))
done

log "Demarrage de ${projet}"
docker compose up -d --remove-orphans

# --- Sante des deux services -------------------------------------------------
# Les deux images sont inseparables : un serveur web sain avec une API arretee
# ne constitue pas un deploiement reussi. La sante Rust est une liveness ; le
# formulaire reste explicitement indisponible tant que SMTP n'est pas configure.
log "Attente de l'etat healthy (web et backend)"
attendre_sante() {
  local service="$1" cid etat sante=""
  cid="$(docker compose ps -q "$service" | head -n 1)"
  if [ -z "$cid" ]; then
    echo "Conteneur $service introuvable apres up." >&2
    exit 1
  fi
  for _ in $(seq 1 30); do
    etat="$(docker inspect -f '{{.State.Status}}' "$cid")"
    if [ "$etat" = "restarting" ] || [ "$etat" = "exited" ]; then
      echo "Le conteneur $service s'arrete des son demarrage (etat : $etat)." >&2
      docker compose logs --tail 80 "$service" >&2 || true
      exit 1
    fi
    sante="$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}absent{{end}}' "$cid")"
    if [ "$sante" = "healthy" ]; then break; fi
    if [ "$sante" = "absent" ]; then
      echo "Image $service sans HEALTHCHECK : deploiement refuse." >&2
      exit 1
    fi
    sleep 5
  done
  if [ "$sante" != "healthy" ]; then
    echo "Le conteneur $service n'est pas devenu healthy (etat : $sante)." >&2
    docker compose logs --tail 80 "$service" >&2 || true
    exit 1
  fi
  echo "$service : $sante"
}
attendre_sante backend
attendre_sante web

# Trace locale lisible sans acces a GitHub ni au depot.
{
  echo "reference   : ${REFERENCE}"
  echo "deploye le  : $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
  echo "projet      : ${projet}"
  echo "calques     : ${calques}"
  for service in web backend; do
    cid="$(docker compose ps -q "$service" | head -n 1)"
    echo "image $service : $(docker inspect -f '{{.Config.Image}}' "$cid")"
  done
} > DEPLOIEMENT.txt

# Nettoyage restreint a nos deux images, jamais aux projets voisins.
docker image prune -f --filter "label=${ETIQUETTE_IMAGE}" >/dev/null
docker image prune -f --filter "label=org.opencontainers.image.title=monportefoliov2-backend" >/dev/null

# --- Verification TLS publique et reprise du certificat ----------------------
# L'edge partage emet les certificats Let's Encrypt a partir des etiquettes de
# CETTE pile. Si l'emission a echoue plus tot (DNS pas encore pointe sur l'hote
# au premier essai), le certificat reste bloque en back-off et un simple
# "up -d" ne le rejoue jamais. Une fois l'application sur le reseau edge, on
# verifie donc que chaque domaine public sert un certificat de confiance ;
# sinon on force un unique rechargement de l'edge pour relancer l'emission, puis
# on recontrole.

if [ "$(lire_env TLS_ASSERT)" = "0" ]; then
  log "Verification TLS DESACTIVEE (TLS_ASSERT=0)"
  echo "Attendu uniquement pendant une bascule DNS. Repasser TLS_ASSERT a 1" >&2
  echo "des que les enregistrements pointent sur cet hote." >&2
  exit 0
fi

log "Verification TLS des domaines publics"
assert_tls() {
  local domaine statut
  for domaine in ${domaines}; do
    # Ni -f ni -k : un succes signifie que la poignee de main TLS et la
    # verification du certificat ont abouti. Le code HTTP n'est pas ignore pour
    # autant : la racine est un fichier statique, elle doit repondre. Un 5xx ici
    # veut dire certificat valide mais routage casse cote edge, ce que le
    # HEALTHCHECK du conteneur ne peut pas voir puisqu'il interroge la boucle
    # locale.
    statut="$(curl -sS --max-time 10 -o /dev/null -w '%{http_code}' "https://${domaine}/")" || return 1
    if [ "${statut}" -ge 500 ]; then
      echo "https://${domaine}/ repond ${statut} : TLS valide, site injoignable." >&2
      return 1
    fi
  done
}

# Conteneur Caddy de l'edge, resolu depuis ses etiquettes Compose (projet edge,
# service caddy) : aucune dependance a l'endroit ou infra-vps range ses fichiers.
edge_caddy() {
  docker ps -q \
    --filter label=com.docker.compose.project=edge \
    --filter label=com.docker.compose.service=caddy
}

if assert_tls; then
  echo "TLS valide sur tous les domaines publics."
  exit 0
fi

# SEUL endroit ou ce projet agit sur l'infrastructure partagee. Un redemarrage de
# Caddy est bref (quelques secondes) mais il interrompt TOUS les sites de l'hote :
# il n'a lieu qu'en dernier recours, une seule fois, et seulement apres qu'un
# domaine de CETTE pile a echoue le controle.
echo "Controle TLS en echec. Rechargement de l'edge pour relancer l'emission." >&2
echo "Attention : ce redemarrage interrompt brievement tous les sites du VPS." >&2
caddy_id="$(edge_caddy)"
if [ -z "${caddy_id}" ]; then
  echo "Conteneur Caddy de l'edge introuvable. infra-vps est-il deploye ?" >&2
  exit 1
fi
docker restart "${caddy_id}" >/dev/null

for _ in $(seq 1 18); do   # 90 s : resoudre un challenge prend quelques secondes
  sleep 5
  if assert_tls; then
    echo "TLS retabli apres rechargement de l'edge."
    exit 0
  fi
done

echo "TLS toujours en echec apres rechargement. Verifier le DNS (A vers cet" >&2
echo "hote), les enregistrements CAA et les quotas Let's Encrypt :" >&2
docker logs --since 3m "${caddy_id}" 2>&1 \
  | grep -iE 'challenge failed|could not get certificate|rateLimited|unauthorized' >&2 || true
exit 1
