# Mesure d'audience

Le site est mesuré par **Umami 3.4.0**, l'instance partagée du VPS (pile `analytics` du dépôt
`infra-vps`), auto-hébergée, sans cookie. Ce document est la référence du **plan de marquage** —
chaque événement, chaque propriété et ce qu'on en lit — et de son cadre : ce qui est mesuré sans
consentement, pourquoi, et ce qui ne l'est pas. Il se modifie **avant** le code qui ajoute ou change
un événement, et les tests qui vérifient le marquage se modifient avec lui.

---

## 1. Comment la mesure arrive dans la page

```
page HTML (statique)          <script defer src="/mesure.js">       même origine
   │
   ▼
/mesure.js                    écrit AU DÉMARRAGE par site/server/server.mjs depuis
   │                          UMAMI_WEBSITE_ID + UMAMI_SITE_DOMAIN ; sans elles :
   │                          « /* mesure d'audience désactivée */ »
   ▼
/u/script.js  ─────────────►  l'edge (snippet `umami` d'infra-vps) relaie vers
/u/api/send   ─────────────►  Umami, en retirant Cookie et Authorization
```

- **Une seule image pour le test et la production.** L'identifiant du site Umami diffère entre les
  deux environnements ; il ne peut donc pas être écrit au build. Le serveur écrit le chargeur au
  démarrage du conteneur, depuis son environnement, que fournit le calque `compose.umami.yaml`.
- **Tout est en même origine.** La CSP s'en tient à `script-src 'self'` et `connect-src 'self'`,
  sans aucun nom de domaine propre à un environnement.
- **Le chargeur** (`/mesure.js`), dans l'ordre :
  1. crée la file `window.clFile`, où `mesurer()` dépose les événements en attendant le traceur ;
  2. **s'arrête** si le visiteur s'est opposé à la mesure (`localStorage['umami.disabled']`) ou si
     son navigateur envoie le signal *Global Privacy Control* : le traceur n'est alors même pas
     téléchargé ;
  3. définit `clAvantEnvoi`, appelée par le traceur avant chaque envoi (`data-before-send`) : elle
     annule `identify`, retire l'identifiant distinct `id` de toutes les charges utiles, et réduit
     un référent externe à son origine (`https://www.google.com/`) ;
  4. insère `/u/script.js` avec ses réglages (ci-dessous), puis vide la file dans `umami.track`
     une fois le traceur chargé. Le drapeau `window.clChargeur` empêche une double inclusion de
     doubler la mesure.
- **Hors ligne** : `astro dev` sert `public/mesure.js`, un commentaire sans effet ; le serveur de
  production sans variable sert le sien, tout aussi vide. Un poste de développement ou la CI ne
  mesurent jamais rien.

### Réglages du traceur, et pourquoi

| Attribut | Valeur | Raison |
|---|---|---|
| `data-website-id` | ID de l'environnement | un site Umami par environnement : le test ne pollue pas la production |
| `data-domains` | `UMAMI_SITE_DOMAIN` | comparé **exactement** à `location.hostname` : une copie du site servie ailleurs n'alimente pas les statistiques. `www.charles-lindecker.com` est redirigé vers l'apex, seul hôte mesuré |
| `data-exclude-search` | `true` | retire la *query string* de l'adresse **et** du référent : ni UTM, ni identifiant de clic |
| `data-exclude-hash` | `true` | retire le fragment `#…` |
| `data-do-not-track` | `true` | le signal DNT est respecté (le chargeur ajoute GPC) |
| `data-performance` | `true` | Web Vitals réels (LCP, INP, CLS, FCP, TTFB) |
| `data-before-send` | `clAvantEnvoi` | voir ci-dessus |

Jamais posés : `data-host-url` (la collecte suit le script sous `/u/`), `data-tag` (cohortes A/B,
hors exemption), `data-distinct-id` (identifiant durable, hors exemption),
`data-auto-track="false"` (couperait aussi le suivi des clics).

### Deux façons d'envoyer un événement

- **Clic simple** : attributs sur l'élément.

  ```html
  <a href="mailto:…"
     data-umami-event="contact-email"
     data-umami-event-emplacement="contact">Envoyer un e-mail</a>

  <a href="/contact"
     data-umami-event="contact-page"
     data-umami-event-emplacement="discutons">Parlons de votre projet</a>

  <a href="https://github.com/LINDECKER-Charles"
     data-umami-event="lien-sortant"
     data-umami-event-domaine="github.com"
     data-umami-event-emplacement="discutons">Contribuer à mes projets open source</a>
  ```

  Pour un lien ouvert dans le même onglet (`mailto:`, lien interne), le traceur **retient la
  navigation** le temps de l'envoi, puis navigue lui-même. Conséquences : un attribut `download`
  est ignoré (le fichier s'ouvre au lieu de se télécharger : passer par `mesurer()`), et si Umami
  répond lentement, le clic l'attend. Umami arrêté, l'edge répond aussitôt en 502 et le lien part
  normalement. Avec `target="_blank"`, rien n'est retardé. Traceur bloqué ou opposition : les
  attributs sont ignorés, le lien fonctionne.
- **Tout le reste** : la fonction `mesurer(nom, données)` du site, qui dépose l'événement dans
  `window.clFile` et ne lève jamais d'exception. Exemple : `mesurer('lecture', { chapitre:
  'discutons' })`.

Toutes les valeurs d'attributs partent en chaînes ; `mesurer()` peut envoyer nombres et booléens.

---

## 2. Dictionnaire des événements

Conventions : noms en kebab-case, en français sans accent, **50 caractères au plus** (Umami tronque
au-delà), préfixés par famille (`contact-`…) pour les objectifs à joker. Propriétés à **valeurs
fermées** : jamais de texte saisi, d'e-mail, de nom ni d'adresse. Pas de propriété `page` : Umami
enregistre déjà le chemin de chaque événement. Une conversion n'a qu'une source.

| Événement | Déclencheur | Moyen | Propriétés |
|---|---|---|---|
| `contact-page` | clic sur un appel à l’action vers la page Contact | attributs `data-umami-event` | `emplacement` |
| `contact-email` | clic sur un lien `mailto:` | attributs `data-umami-event` | `emplacement` |
| `contact-copie` | bouton « Copier l'adresse » | `mesurer()` | `emplacement` |
| `cv-telechargement` | lien de téléchargement du CV (quand le CV existera) | `mesurer()` | `emplacement` |
| `lien-sortant` | lien vers LinkedIn, GitHub, npm, une démo ou un dépôt | attributs | `domaine` (nom d'hôte de la cible), `emplacement` |
| `lecture` | un chapitre de l'accueil atteint, une fois par chargement | `mesurer()` | `chapitre` = `origine` \| `aujourdhui` \| `discutons` |
| `theme` | bascule jour/nuit par le visiteur | `mesurer()` | `choix` = `nuit` \| `jour` |
| `glossaire` | ouverture d'une définition | `mesurer()` | `terme` (identifiant stable) |
| `erreur-404` | affichage de la page 404 | `mesurer()` | `origine` = `interne` \| `externe` \| `directe` |
| *(automatique)* page vue | chargement de chaque page | traceur | — |
| *(automatique)* performance | `data-performance` | traceur | LCP, INP, CLS, FCP, TTFB |

Précisions :

- `lecture` part au plus une fois par chapitre et par chargement de page : on lit jusqu'où le
  récit est lu, pas combien de fois on y revient.
- `theme` ne part que sur un geste du visiteur, jamais quand le site applique de lui-même la
  préférence du système ou le choix mémorisé.
- `erreur-404` tire son `origine` de l'hôte du référent : le site lui-même (`interne`, un lien
  cassé chez nous), un autre site (`externe`), aucun (`directe`).
- `cv-telechargement` passe par `mesurer()` parce que les attributs feraient perdre le
  téléchargement (voir § 1).

### Valeurs autorisées

| Propriété | Valeurs |
|---|---|
| `emplacement` | `en-tete`, `sommaire`, `hero`, `preuves`, `discutons`, `contact`, `pied-de-page`, `page-404`, `mentions` |
| `chapitre` | `origine`, `aujourdhui`, `discutons` |
| `choix` | `nuit`, `jour` |
| `origine` | `interne`, `externe`, `directe` |
| `domaine` | nom d'hôte exact de la cible (`github.com`, `www.linkedin.com`, `www.npmjs.com`…) |
| `terme` | identifiant stable du terme, en kebab-case |

**À ne jamais créer** : un événement au moment de l'opposition (ce serait mesurer précisément quand
le visiteur refuse) ; un événement par frappe ou par défilement ; une propriété qui reprend une
saisie ; un nom qui commence par `=`, `+`, `-` ou `@` (Umami rejette la requête, protection contre
l'injection dans les exports CSV).

Depuis le 2026-10-08, la page `/contact` utilise l’emplacement `contact` pour l’e-mail, la copie
d’adresse et les liens vers les profils publics. Les autres liens internes du menu et des pages restent
des navigations ordinaires : les pages vues permettent de lire ce parcours. Les ouvertures de
détail des illustrations ne créent aucun événement supplémentaire.

L’essai de conclusion de l’accueil du 2026-10-08 conserve l’ancre et la valeur `discutons` pour
le chapitre 03 « La suite, à plusieurs ». Son action principale « Parlons de votre projet »
utilise l’événement `contact-page`, avec `emplacement` = `discutons`. L’invitation
« Contribuer à mes projets open source » utilise `lien-sortant`, `domaine` = `github.com` et
`emplacement` = `discutons`. Les liens de « Pour aller plus loin » vers Projets, Parcours et Blog
restent des navigations ordinaires.

L’emplacement `preuves` reste actif sur les pages de projets qui utilisent le composant `Fiche`.

**Historique avant cet essai** : les valeurs de `chapitre` `preuves` et `dehors`, ainsi que
l’emplacement `dehors`, ne font plus partie du plan courant. Les données déjà collectées sous
ces valeurs restent à lire dans le contexte de l’ancienne structure de l’accueil. L’emplacement
`preuves` conserve son usage sur les pages de projets.

### Ce qui est vérifié automatiquement

- `site/server/server.test.mjs` : le chargeur, exécuté dans un bac à sable — réglages de la
  balise, file vidée au chargement, `id` retiré, référent réduit, `identify` annulé, opposition et
  GPC respectés, noms `clFile`, `clChargeur`, `clAvantEnvoi`.
- À couvrir par les tests de bout en bout, sur chaque page construite : tout attribut
  `data-umami-*` appartient au dictionnaire, toute valeur à sa liste ; tout lien `mailto:` est
  mesuré, avec son `emplacement` ; le `domaine` d'un `lien-sortant` est bien l'hôte du lien.

---

## 3. Objectifs et entonnoir

À créer dans Umami, dans chaque site (test, puis production). Un objectif compte des **sessions**
(des visiteurs sur la période), pas des visites ; le joker `*` fonctionne en début ou en fin, sur
les chemins comme sur les noms d'événements.

| # | Nom | Valeur | Lecture |
|---|---|---|---|
| O1 | Contacts | événement `contact-*` | page Contact ouverte depuis un CTA, e-mail ouvert ou adresse copiée : les intentions de contact |
| O2 | Récit lu jusqu'au bout | `lecture` avec `chapitre` = `discutons` | le visiteur a atteint l'appel à l'action |
| O3 | Invitation open source suivie | `lien-sortant` avec `emplacement` = `discutons` et `domaine` = `github.com` | l’invitation finale donne envie de découvrir les projets publics |
| O4 | Pages introuvables | événement `erreur-404` | qualité : liens cassés, anciennes adresses à rediriger |

O2 et O3 portent sur des valeurs de propriété. Si l'écran des objectifs ne filtre pas sur les
propriétés, lire la même chose dans *Événements → Propriétés* (`lecture` par `chapitre`,
`lien-sortant` par `emplacement`), ou dans un entonnoir dont l'étape porte le filtre.

| # | Nom | Étapes | Fenêtre (proposée) |
|---|---|---|---|
| E1 | Lecture → contact | page `/` → `lecture` (`chapitre` = `discutons`) → `contact-*` | 30 min |

La fenêtre est le délai maximal, en minutes, entre deux étapes consécutives. Un filtre d'étape
n'accepte que `=`, `≠`, « contient » et « ne contient pas », combinés en ET.

À lire chaque mois : pages d'entrée et référents (réduits à leur origine), O1 à O4, `lecture` par
`chapitre` (où le récit perd ses lecteurs), `lien-sortant` par `domaine`, Web Vitals au
75ᵉ centile, 404 par `origine`. Une **annotation** à chaque mise en ligne marquante.

**Limites de lecture** (Umami 3.4.0) : une *visite* est une session dans une même heure
d'horloge (10 h 58 puis 11 h 02 font deux visites) ; un *rebond* est une visite d'une seule page
vue **sans événement** ; les Web Vitals partent une fois par page, au premier de : page masquée,
`pagehide` ou 10 s.

---

## 4. Opposition

Obligatoire dès lors que la mesure repose sur l'intérêt légitime, et attendue sous la forme d'un
bouton.

- **Le bouton** vit dans la section « Mesure d'audience » des mentions légales
  (`/mentions-legales#mesure-audience`), qui informe aussi le visiteur. Il affiche l'état courant
  et fonctionne dans les deux sens : il écrit ou retire `localStorage['umami.disabled']`.
- **Effet immédiat et durable** : le traceur relit cette clé avant chaque envoi, et le chargeur ne
  télécharge plus le traceur aux visites suivantes. Pas d'expiration : un refus ne se réactive pas
  tout seul.
- **Aucun événement** n'est envoyé au moment du refus ni de la réactivation.
- **Signaux du navigateur** : *Global Privacy Control* (le chargeur ne charge rien) et
  *Do Not Track* (le traceur n'envoie rien) sont respectés sans aucun geste du visiteur.
- **Par origine** : le choix est propre à `charles-lindecker.com`. C'est une raison de plus de la
  redirection 301 de `www.` vers l'apex : un seul stockage, un seul choix. Si le navigateur bloque
  le stockage local, le refus ne peut pas être conservé : le texte du bouton le dit et renvoie vers
  GPC.

---

## 5. Cadre CNIL : ce qui est exempté, et pourquoi

Textes : article 82 de la loi Informatique et Libertés ; lignes directrices de la CNIL
(délibération n° 2020-091, article 5, points 50 à 52) ; page « Cookies : solutions pour les outils
de mesure d'audience » (4 juillet 2025) et son outil d'auto-évaluation (juillet 2025).

### Exempté de consentement, sous conditions

La mesure est exemptée tant que **toutes** ces conditions tiennent :

| Condition | Comment elle est tenue |
|---|---|
| Finalité limitée à l'audience, pour le compte exclusif de l'éditeur du site | pages, lecture du récit, temps de chargement, usage des fonctions du site ; enregistrement de sessions et heatmaps forcés à `false` par l'infrastructure |
| Pas de suivi d'un site à l'autre | traceur servi depuis le domaine du site ; identifiant calculé avec l'ID du site |
| Aucun traceur durable sur le terminal | aucun cookie ; le seul stockage est le refus (`umami.disabled`), dont la conservation est elle-même exemptée |
| Données minimisées, aucune donnée personnelle collectée | propriétés à valeurs fermées ; pas d'`identify` ni de `distinct-id` (le chargeur les neutralise) |
| Pas d'UTM ni d'identifiant de campagne ; référent réduit au domaine | `data-exclude-search` ; référent externe ramené à son origine par `clAvantEnvoi` |
| Adresse IP | **jamais stockée** : elle sert le temps de la requête à situer la ville et à calculer l'identifiant de visiteur, un hachage avec l'ID du site et un sel **mensuel**. C'est une pseudonymisation, pas une anonymisation |
| Pas de mise en commun ni de transmission | un site Umami par environnement, aucun rapport inter-sites, aucune transmission à des tiers |
| Opposition | § 4 |
| Information | section « Mesure d'audience » des mentions légales |
| Conservation de 25 mois au plus | **à mettre en place avant la production** : Umami auto-hébergé garde tout indéfiniment (§ 7) |

### Écarts documentés, et leurs compensations

L'interface d'Umami montre deux choses que l'outil d'auto-évaluation écarte et qu'aucun réglage ne
retire : la vue **Sessions** (le parcours d'un visiteur) et des chiffres **exacts** plutôt
qu'arrondis. Sur un site personnel à faible trafic, ce sont précisément les vues qui permettraient
de reconnaître un visiteur — un recruteur qui ouvre le site juste après un échange, par exemple.
Compensations :

- règle écrite : ne jamais exploiter les vues Sessions et Temps réel pour observer un individu,
  ne jamais les croiser avec les e-mails reçus ou les échanges en cours ;
- pas d'export brut, pas de lien de partage public ;
- accès limité au compte d'administration de l'instance, double authentification activée.

Ne jamais présenter la solution comme « certifiée » ou « validée par la CNIL ».

### Ce qui n'est PAS exempté

- **Les UTM et identifiants de campagne.** Ils ne sont **pas collectés** (`data-exclude-search`) :
  les liens diffusés (CV, profils, signatures) restent sans UTM, et leur effet se lit dans les
  référents réduits à leur origine et dans la Search Console.
- **Les liens et pixels traçants dans les e-mails** : aucun *Pixel* ni *Link* Umami.
- **Tout contenu tiers** : il n'y en a pas, et la CSP l'interdit (aucune origine tierce).

---

## 6. Recette en test

L'environnement de test a son propre site Umami, « Portfolio V2 (test) ». Son identifiant est déjà
dans `.env.test.example` : la mesure est active dès le premier déploiement de test.

1. **Le déploiement** ajoute de lui-même `compose.umami.yaml` (`== Calques : …` dans le journal).
2. **Contrôles en ligne de commande** :

   ```bash
   T=https://test.v2.charles-lindecker.com
   curl -s "$T/mesure.js" | grep -E 'data-website-id|data-domains'
   curl -sI "$T/u/script.js" | head -1        # 200
   ```

   Dans Umami : le site « Portfolio V2 (test) » apparaît quelques secondes après le démarrage du
   conteneur (journal du reconciler), puis une visite en Temps réel. Un événement envoyé avant
   que le site existe est rejeté (« Website not found ») : c'est la fenêtre des premières secondes.
3. **Dans le navigateur** (outils de développement, onglet Réseau) : `/mesure.js`, puis
   `/u/script.js`, puis un `POST /u/api/send` par page vue. Dans la charge utile : pas de champ
   `id`, une `url` sans `?` ni `#`, un `referrer` réduit à une origine quand on arrive d'un autre
   site.
4. **Opposition** : le bouton des mentions légales, puis rechargement — plus aucune requête vers
   `/u/` ; même chose avec GPC activé. Avec DNT, `/u/script.js` se charge mais rien ne part vers
   `/u/api/send`.
5. **Chaque événement du § 2** : déclencher l'action, retrouver l'événement et ses propriétés dans
   Umami (*Événements*, puis *Propriétés*).
6. **Créer les objectifs et l'entonnoir du § 3**, et vérifier qu'ils se remplissent.

---

## 7. Exploitation

- **Où vivent les valeurs** : `UMAMI_WEBSITE_ID`, `UMAMI_SITE_DOMAIN` et `UMAMI_SITE_NAME` dans
  `ENV_TEST` et `ENV_PROD` ([`secrets.md`](secrets.md)). Sans `UMAMI_WEBSITE_ID`, le calque de
  mesure n'est pas chargé : le site n'est pas mesuré, et rien n'est déclaré à l'edge.
- **Un ID par environnement, pour toujours** : test `100ee54a-6c1f-46cc-a67e-8ac78d57d51d`,
  production `0450b7ff-eb45-4328-a93e-496cd25b3348`. Générés une fois pour toutes, ils
  appartiennent au projet (contrat `infra-vps`, `docs/APPLICATIONS.md` § 6) : Umami recrée le site
  sous le même ID après une reconstruction de l'hôte, seul l'historique dépend d'une sauvegarde. En
  changer, c'est repartir d'un site vide.
- **Pas de team, pas de domaine de tableau de bord dédié** : il n'y a aucun client à qui ouvrir un
  accès. Le site se consulte avec le compte d'administration de l'instance.
- **Arrêter de mesurer** : retirer les clés Umami du secret et redéployer. Le site et son
  historique restent dans Umami (le reconciler ne supprime rien) ; le supprimer dans l'interface si
  l'historique n'a plus lieu d'être.
- **Purge à 25 mois** : Umami n'en a pas. Elle se fait côté `infra-vps` (pile `analytics`), pour
  tous les sites de l'hôte, par une tâche mensuelle validée d'abord sur une copie de la base, et
  s'applique aussi aux sauvegardes. Au 2026-10-07, elle n'existe pas encore. **Prérequis de
  l'activation en production.**
- **Activer la production** (après la recette en test et la purge) : dans `ENV_PROD`, décommenter
  les trois lignes Umami de `.env.prod.example` et compléter `COMPOSE_FILE` avec
  `:compose.umami.yaml`, puis redéployer. Le site « Portfolio » apparaît dans Umami ; refaire la
  recette du § 6 sur `charles-lindecker.com`, et créer les objectifs du § 3 dans ce site.
- **Panne d'Umami** : l'edge répond 502 sur `/u/*`, le traceur ignore l'erreur, le site ne change
  pas.
- **Listes de filtrage** : au relevé du 7 octobre 2026 (fait pour le site L.I.S, mêmes chemins),
  rien dans les listes courantes (EasyPrivacy, AdGuard, uBlock, Liste FR) ne vise `/mesure.js`,
  `/u/script.js` ni `/u/api/send`. Ne jamais employer « umami », « analytics », « stats »,
  « track » ou « collect » dans un chemin servi par le site.
