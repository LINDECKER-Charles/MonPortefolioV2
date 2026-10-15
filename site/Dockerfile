# syntax=docker/dockerfile:1

# Image du portfolio V2 — site statique produit par Astro, servi par un petit
# serveur Node sans dependance (server/server.mjs).
#
# Le contexte de build est `site/`, pas la racine du depot : la racine ne porte
# que la documentation, les maquettes et l'orchestration, rien dont la
# compilation ait besoin. Ce qui n'est pas dans ce dossier ne peut donc pas
# invalider une couche.

# Version epinglee, pas le tag mobile `24-alpine` : celui-ci est repousse
# plusieurs fois par mois et suit les montees d'Alpine, si bien que reconstruire
# le meme commit six semaines plus tard ne redonnerait pas la meme image. Monter
# de version devient ainsi un commit visible, comme l'exige infra-vps pour les
# images de l'edge et de l'observabilite. Meme majeure que la CI
# (.github/workflows/_tests.yml, `node-version: 24`).
ARG NODE_VERSION=24.21.0-alpine

# ── Dependances ───────────────────────────────────────────────────────────────
# Etape isolee pour que `npm ci` ne soit rejoue que quand package-lock.json
# change : c'est de loin la couche la plus lente du build, avec l'optimisation
# des images.
FROM node:${NODE_VERSION} AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund

# ── Compilation ───────────────────────────────────────────────────────────────
FROM deps AS build
WORKDIR /app
COPY . .
# `npm run build` produit dist/. Tout controle que le script enchaine apres
# `astro build` casse la construction de l'image au lieu d'etre mis en ligne en
# silence.
#
# Le cache d'Astro (node_modules/.astro : images deja optimisees, polices) vit
# dans un cache BuildKit, hors des couches : modifier un texte ne reencode pas
# toutes les images. Il ne profite qu'au builder qui l'a rempli — en CI, le
# builder est neuf a chaque job et le build part de zero, sans erreur.
RUN --mount=type=cache,target=/app/node_modules/.astro npm run build

# ── Execution ─────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION} AS runtime

# Le serveur n'a aucune dependance : l'image finale n'a pas de node_modules,
# donc pas la surface d'un arbre de dependances complet en production. Verifie
# a chaque build par l'etape `RUN node -e` ci-dessous.
#
# Ni tzdata ni TZ : le serveur ne calcule rien en heure locale, et les journaux
# du conteneur sont horodates par Docker.

# Etiquettes OCI. Elles ne sont pas decoratives : le script de deploiement s'en
# sert pour restreindre son "docker image prune" a NOS images. Sur un VPS
# mutualise, un prune non filtre supprimerait les images intermediaires des
# autres projets, dont c'est parfois le seul moyen de revenir en arriere.
LABEL org.opencontainers.image.title="monportefoliov2" \
      org.opencontainers.image.description="Portfolio V2 de Charles Lindecker, Astro statique" \
      org.opencontainers.image.source="https://github.com/LINDECKER-Charles/MonPortefolioV2" \
      org.opencontainers.image.licenses="MIT"

ENV NODE_ENV=production \
    PORT=4000

WORKDIR /app
# root:node, pas node:node : le compte qui execute garde la lecture par le
# groupe et perd l'ecriture. L'application ne peut donc pas se reecrire
# elle-meme, et cette garantie ne depend plus du `read_only: true` de
# compose.yaml — qu'un besoin banal (cache, upload) pourrait faire retirer.
COPY --from=build --chown=root:node /app/dist ./dist
COPY --from=build --chown=root:node /app/server ./server

# Le module se charge sans rien d'autre que Node : une dependance glissee un
# jour dans le serveur fait echouer ce build, pas le demarrage en production.
RUN node -e "import('/app/server/server.mjs').then((m) => { if (typeof m.creerServeur !== 'function') process.exit(1); })"

# Le port est fige, jamais publie sur l'hote : l'edge partage joint le conteneur
# par son IP sur le reseau `edge`. Le figer garde le HEALTHCHECK ci-dessous
# valide quoi qu'il arrive au .env de l'hote.
EXPOSE 4000

# `wget` vient de busybox, deja present dans l'image Alpine — pas de dependance
# ajoutee pour se surveiller. La racine est un fichier statique : elle teste le
# serveur, pas le contenu. L'hote 127.0.0.1 n'est jamais redirige vers l'hote
# canonique (REDIRECT_HOSTS refuse la boucle locale), et un conteneur dont
# l'environnement est invalide ne demarre pas : il n'atteint jamais healthy.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:4000/ || exit 1

USER node

CMD ["node", "server/server.mjs"]
