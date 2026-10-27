# Connexion au backoffice — « L’atelier s’allume »

Maquette de la page de connexion de `/backoffice`, mise en scène comme un générique de film,
dans la direction « Lanterne » (`DESIGN.md`) : [`index.html`](index.html),
[`style.css`](style.css), [`theme.js`](theme.js) (thème et ouverture, avant le premier rendu)
et [`entree.js`](entree.js) (la scène, sa chorégraphie, le parcours, et un serveur simulé).
**Portée dans le site le 27/10/2026** (section « Portage dans le site ») : la maquette reste la
référence du mouvement, le site fait foi pour le reste.

## La voir

Les chemins remontent vers `site/src/assets/marque/` et `design/refonte/c-lanterne/polices/` :
servir la **racine du dépôt**, puis ouvrir `/design/connexion-backoffice/`.

```sh
python -m http.server 4791   # depuis la racine du dépôt
# http://127.0.0.1:4791/design/connexion-backoffice/?ouverture=complete
```

- **Régie** (en bas à droite, hors design) : chaque scène, le générique complet ou court, la
  scène sombre le jour, le mouvement réduit, le **ralenti × 3** (pour décortiquer la
  chorégraphie), la première connexion (configuration de la 2FA).
- **Simulation** : tout mot de passe mène à la vérification, sauf `erreur` (refus) et
  `bloque` (trop de tentatives) ; le code `000000` est refusé ; tout autre code ouvre
  l’atelier.
- **Adresse** : `?theme=jour|nuit`, `?ouverture=complete|courte|aucune`,
  `?scene=connexion|erreur|bloque|verification|secours|inscription|codes|expiree|atelier`,
  `?veille=1`, `?reduit=1`, `?lent=1`, `?regie=0`.

## Le concept

Une lanterne pend au-dessus de la carte de connexion : c’est la seule lumière de l’écran, et
elle raconte le parcours. Sa flamme écoute la frappe, vacille sur un refus, se fait souffler
quand le serveur impose d’attendre, grandit d’une étape à l’autre ; à la fin, la caméra pousse
dans la flamme et sa lumière découvre l’atelier. La déconnexion fait le geste inverse.

Le mouvement s’écrit comme du motion design : une caméra (gros plan, recul, poussée), des
calques à des profondeurs différentes qui suivent la main (bokeh au loin, lanterne, carte), une
lumière qui a du volume (halo, rayons entre les montants de la cage, traînée d’objectif
anamorphique, poussière), une typographie cinétique (carton-titre, lettres qui montent sous la
lumière), et des bandes de cinéma pour les deux temps forts. Rien d’un jeu : pas d’ornement,
pas de braises qui montent, pas de cadre doré ; quelques étincelles à l’allumage, comme une
allumette.

## Chorégraphie

Toutes les durées découlent de `--d-scene` (le ralenti les multiplie par trois) ; les instants
ci-dessous sont à vitesse normale.

### Le générique (première visite de l’onglet, ≈ 4,7 s)

| Moment | Ce qui se passe |
|---|---|
| 0 | noir, bandes de cinéma ; le grain de pellicule |
| 0,25 → 1,5 s | **carton-titre** : « Entrer dans l’atelier » seul au centre, les lettres se resserrent en sortant du flou, éteintes |
| 1,1 → 2,05 s | **l’étincelle** : la mèche crache deux fois, puis prend ; éclat du halo, traînée d’objectif sur toute la largeur, étincelles |
| 1,45 → 2,5 s | en **gros plan**, la corde descend et la lanterne se dessine trait à trait autour de la flamme ; les rayons percent |
| 1,8 → 2,6 s | la lumière traverse le titre, de la lanterne vers la gauche : les lettres s’allument une à une |
| 2,5 → 3,85 s | **la caméra recule** jusqu’au plan large ; le bokeh, plus lointain, recule moins ; le titre **glisse à sa place** et reprend son encre |
| 3,1 → 4,2 s | **la carte se pose** sur un ressort, sortie du flou ; la lumière coule du haut le long de ses deux bords ; les champs arrivent un à un |
| 3,0 → 4,5 s | en-tête, surtitre, texte, étapes, pied ; **les bandes s’ouvrent** |
| 3,4 s (jour) | le générique se joue toujours de nuit ; s’il fait jour, **le jour se lève depuis la lanterne**, du geste de la bascule du thème (le même masque radial) |

**Ouverture courte** (visites suivantes, ≈ 1,9 s) : l’allumage, le titre lettre à lettre, la
carte et ses champs. **Aucune** en mouvement réduit. Un clic ou une touche abrège tout : l’état
final est l’état par défaut du CSS, abréger revient à annuler les animations. Si le script ne
tourne pas, des animations de secours finissent l’ouverture seules.

### D’un écran à l’autre (≈ 1 s)

L’ancien récit monte et s’efface ; l’ancienne carte **se dissout dans la lumière**
(surexposée, floue) pendant que la nouvelle en émerge et change de taille ; la lumière coule le
long de ses bords ; les lettres du nouveau titre montent une à une, traversées par la lumière ;
les champs arrivent ; **un point de lumière voyage** du repère de l’étape quittée à la
suivante ; la lanterne sursaute et gagne un palier de lumière. (View Transitions ; sans elles,
mêmes gestes sans le fondu croisé.)

### L’atelier s’ouvre (≈ 2,8 s), et se referme

La flamme **s’embrase** et crache ses étincelles, les bandes entrent ; la caméra **pousse dans
la flamme** en accélérant (zoom, flou, surexposition) ; la lumière **jaillit** de la flamme et
traverse l’écran (un disque d’éclat chaud bordé d’ambre) ; l’atelier apparaît **en se mettant
au point** ; les bandes s’ouvrent. Déconnexion : la lumière rentre dans la lanterne et l’entrée
se remet au point.

### Au repos

La flamme vacille (trois enveloppes à des périodes premières entre elles), le halo respire, et
**toute la pièce vacille avec elle** (rayons, chaleur, traînée, à la même période) ; la
poussière danse dans la lumière, le bokeh dérive, le grain court. La lanterne se balance à
peine (un balancier amorti bercé par « l’air de l’atelier ») ; **l’ombre de la carte et la
flaque de lumière suivent son balancement**. La main la pousse en passant, ou d’un clic (avec
quelques étincelles) ; les calques suivent la main en **parallaxe**.

## Les écrans et leurs états

| État | Ce qu’on voit | Ce qu’on entend (lecteur d’écran) |
|---|---|---|
| Connexion | grand titre, carte éclairée, étapes « Connexion — Vérification — Atelier » | champs et étiquettes inchangés |
| Focus | un **anneau de lumière glisse** d’un champ à l’autre | le focus natif |
| Frappe | la flamme sursaute, un éclat passe | — |
| Attente | un reflet court sur le bouton ; flamme et halo s’accélèrent | « Connexion… » |
| Appui | une **onde de lumière** part du point d’appui sur le bouton | — |
| Refus (401) | la flamme se couche, la lumière quitte un instant le bord de la carte, la carte se dérobe ; mot de passe sélectionné | « L’adresse e-mail ou le mot de passe est incorrect. » |
| Trop de tentatives (429) | flamme soufflée, braise et deux filets de fumée, la pièce s’éteint ; « Réessayer dans 18 s » au contour ; à zéro, la flamme se **rallume** (crache, prend) | annoncé au début et à la fin seulement |
| Vérification | six cases ; chaque chiffre **tombe** dans sa case ; code juste : les cases s’allument une à une | « Le code est vérifié dès le sixième chiffre. » |
| Code refusé | cases en erreur, secousse, puis vidées | « Ce code est incorrect ou a déjà été utilisé. » |
| Code de secours | un champ à chasse fixe, mis en forme pendant la frappe | « Code de secours » |
| Configuration 2FA | plaque balayée par la lumière pendant la préparation, puis le QR balayé une fois, la clé groupée par quatre et « Copier » | « La clé est copiée… » |
| Codes de secours | les huit codes **s’éclairent** un à un ; Copier, Télécharger, J’ai conservé mes codes | messages de copie et de téléchargement |
| Session expirée, déconnexion | un avis qui se déroule sous le surtitre | `role="status"` |

## Accessibilité et robustesse

- Le décor est `aria-hidden` ; les titres animés gardent leur texte réel (le calque de lettres
  est `aria-hidden`, posé au pixel près grâce aux mesures `Range`, crénage compris, et retiré à
  la fin) ; tout ce qui compte est dit en texte, à côté de l’action.
- **Mouvement réduit** : ni générique, ni caméra, ni balancier, ni parallaxe, ni poussière, ni
  grain, ni étincelles, ni bandes ; écrans et atelier changent d’un coup.
- **Ce qu’on ne fait jamais attendre** : une touche ou un clic abrège le générique, et la
  touche part dans le champ.
- Le contour de focus natif reste, sauf quand l’anneau lumineux le remplace (CSS `:has`).
- Contrastes : seuls les jetons existants servent au texte et aux commandes ; les jetons
  nouveaux sont décoratifs (lumières, bokeh, grain, ombre portée, éclat).
- Vérifié sur Chromium à 1 440 × 900 et 390 × 844, jour et nuit, image par image au ralenti :
  dix parcours automatisés (connexion jusqu’à l’atelier et retour, configuration et codes,
  refus et code de secours, 429, mot de passe, bascule de thème, générique complet et court
  jusqu’à leur état final, générique abrégé, mouvement réduit), sans erreur JavaScript.

## Écarts au système, acceptés au portage

1. **Trois courbes de plus** : le système n’en a qu’une (`--courbe`). Le motion en demande
   d’autres, posées en jetons et réservées à l’entrée : `--courbe-expo` (l’arrivée d’un
   plan), `--courbe-entree` (l’accélération dans la lumière), `--courbe-ressort` (la carte
   qui se pose, un ressort amorti en `linear()`, repli automatique sur `--courbe-expo`).
2. **Le titre en `--t-4xl`**, la taille de l’accroche de l’accueil, pour la connexion et la
   vérification.
3. **Le générique se joue de nuit**, même le jour, et finit sur le lever du jour depuis la
   lanterne (la scène de jour reste la pierre). L’option d’une scène sombre en permanence
   n’a pas été portée.
4. **Bandes de cinéma, traînée d’objectif, bokeh** : un vocabulaire de cinéma que le site
   n’emploie pas ailleurs ; ils restent réservés à cette page.

## Portage dans le site (27/10/2026)

Contrats gardés : identifiants et libellés lus par `scripts/backoffice.ts`,
`tests/e2e/backoffice.spec.ts`, `tests/e2e/blog.spec.ts` et `scripts/test-backoffice.mjs`,
routes et messages du backend. Aucun changement côté Rust.

- **Balisage** : `SceneEntree.astro` (la scène, le front de lumière, les bandes) et
  `ConnexionBackoffice.astro` (trois écrans, chacun un récit et une carte, puis les étapes).
  Classes préfixées (`bo-scene`, `bo-entree__*`, `bo-code-saisie`…). Nouveaux identifiants :
  `bo-password-voir`, `bo-password-maj`, `bo-two-factor-saisie`, `bo-two-factor-auto`,
  `bo-two-factor-mode`, `bo-two-factor-copy`, `bo-recovery-download`, `bo-etapes`,
  `bo-horodatage`. Ce qui ne marche qu’avec le module est `hidden` jusqu’à son chargement.
- **Écarts à la proposition** : l’étiquette du code reste « Code de vérification » (le mode
  secours se dit par sa bascule et son exemple) ; la plaque d’attente du QR code se déduit du
  DOM en CSS (`:has`) ; la clé s’affiche brute (la valeur du champ est le secret) ; les codes
  de secours se coupent entre deux groupes (`<wbr>`) ; l’atelier n’est pas un calque à part :
  les passages sont des View Transitions de la vraie page.
- **Session déjà ouverte** : un indice (`localStorage`, « cl-backoffice-session », jamais un
  secret) fait attendre la vérification sans générique ; une session trouvée pendant le
  générique l’abrège et ouvre l’atelier d’un coup.
- **Avant le premier rendu** : `public/backoffice-entree.js`, après `/theme.js`, intact.
- **Scripts** : `backoffice.ts` reste maître de la session et du DOM ; chaque changement
  d’écran passe par `jouer(geste, maj)`, confié au module `backoffice-entree.ts` (avec
  `backoffice-scene.ts`, `backoffice-saisie.ts`, `backoffice-mouvement.ts`) s’il est chargé.
  L’envoi au sixième chiffre et `Retry-After` (`ErreurApi.attente`) vivent dans
  `backoffice.ts` ; le compte à rebours et la flamme soufflée, dans le module, qui observe les
  retours (`data-state`, `data-attente`).
- **Budgets mesurés au build** : JS de la page 14 972 o sur 15 360 (script synchrone 418 o,
  `backoffice.ts` + 460 o) ; CSS 19,8 Ko sur 30 ; le module, chargé à la demande comme
  l’atelier du blog, pèse 9,6 Ko gzip, hors budget de la page.
- **Tests** : `tests/e2e/backoffice.spec.ts` (code envoyé seul au sixième chiffre, mot de
  passe, 429, clé, téléchargement, code de secours, code refusé, session mémorisée, générique
  et passages sans mouvement réduit).

## Choix retenus

1. **Le générique** : complet à la première visite de l’onglet (≈ 4,7 s), court ensuite.
2. **La nuit du générique le jour**, puis le lever du jour depuis la lanterne.
3. **Les bandes de cinéma** : au générique et aux deux passages de l’atelier.
4. **L’envoi au sixième chiffre**, annoncé sous le champ (WCAG 3.2.2), après 250 ms (une
   saisie qui continue l’annule) ; jamais en saisie d’un code de secours.
5. **Le budget** : chorégraphie chargée à la demande, hors du budget de la page.
6. **Grain, bokeh, horodatage** : gardés.
