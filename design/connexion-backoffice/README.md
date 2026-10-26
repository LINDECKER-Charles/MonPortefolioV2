# Connexion au backoffice — « L’atelier s’allume »

Maquette de la page de connexion de `/backoffice`, mise en scène comme un générique de film,
dans la direction « Lanterne » (`DESIGN.md`). Maquette statique, à valider avant le portage
dans le site : [`index.html`](index.html), [`style.css`](style.css), [`theme.js`](theme.js)
(thème et ouverture, avant le premier rendu) et [`entree.js`](entree.js) (la scène, sa
chorégraphie, le parcours, et un serveur simulé).

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

## Écarts au système, à valider

1. **Trois courbes de plus** : le système n’en a qu’une (`--courbe`). Le motion en demande
   d’autres, posées en jetons : `--courbe-expo` (l’arrivée d’un plan), `--courbe-entree`
   (l’accélération dans la lumière), `--courbe-ressort` (la carte qui se pose, un ressort
   amorti en `linear()`, repli automatique sur `--courbe-expo`).
2. **Le titre en `--t-4xl`**, la taille de l’accroche de l’accueil, pour la connexion et la
   vérification.
3. **Le générique se joue de nuit**, même le jour, et finit sur le lever du jour depuis la
   lanterne (la scène de jour reste la pierre). La régie garde l’option d’une scène sombre en
   permanence.
4. **Bandes de cinéma, traînée d’objectif, bokeh** : un vocabulaire de cinéma que le site
   n’emploie pas ailleurs ; ils restent réservés à cette page.

## Portage dans le site (proposition)

Contrats gardés : identifiants et libellés lus par `scripts/backoffice.ts`,
`tests/e2e/backoffice.spec.ts` et `scripts/test-backoffice.mjs`, routes et messages du
backend. Aucun changement côté Rust.

1. **`ConnexionBackoffice.astro`** : chaque écran devient un récit et une carte, sur la grille
   de l’entrée. Nouveaux identifiants : `bo-password-voir`, `bo-password-maj`,
   `bo-two-factor-label`, `bo-two-factor-saisie`, `bo-two-factor-mode`, `bo-two-factor-copy`,
   `bo-enrollment-attente`, `bo-recovery-download`, `etapes`. `#bo-recovery-codes` devient une
   liste ordonnée ; la clé manuelle s’affiche groupée.
2. **La scène** dans `BackofficePage.astro`, tant que la session n’est pas ouverte ; la
   chorégraphie dans un module à part (`scripts/backoffice-entree.ts`), appelé par
   `backoffice.ts`, qui garde ses appels, ses verrous et ses retours.
3. **L’ouverture avant le premier rendu** : un petit script synchrone propre au backoffice
   (`public/backoffice-entree.js`, comme `/theme.js`) pose `data-ouverture` d’après
   `sessionStorage` et le mouvement réduit. `/theme.js` reste intact.
4. **Session déjà ouverte** : la vérification de `/session` court pendant le générique ;
   valide, la flamme s’embrase aussitôt et l’atelier s’ouvre, sans attendre la fin.
5. **429** : `ErreurApi` porte `Retry-After` ; vérifier que le relais Node le transmet pour
   `/api/backoffice/login` (il le fait déjà pour le formulaire de contact).
6. **Jetons** : les nouveaux (`--scene-*`, `--halo-*`, `--rayon-lumiere`, `--trainee`,
   `--bokeh-*`, `--vitre-allumee`, `--flamme-coeur`, `--poussiere`, `--lisere`,
   `--titre-eclaire`, `--titre-lueur`, `--ombre-portee-couleur`, `--eclat-interieur`,
   `--anneau-halo`, `--reflet`, `--grain`, `--bande-hauteur`, et les trois courbes) rejoignent
   `jetons.css`, jour et nuit.
7. **Budgets** (15 Ko de JS et 30 Ko de CSS gzip par page) : c’est le vrai sujet. La maquette
   pèse 16 Ko de JS gzip (non minifié et très commenté, parcours de connexion compris, qui
   existe déjà dans `backoffice.ts`) et 16 Ko de CSS gzip (dont les jetons et primitives déjà
   présents). Estimation après portage : **+ 6 à 8 Ko de JS et + 8 Ko de CSS** sur la page du
   backoffice, qui dépasserait son budget de JS. Deux voies : charger la chorégraphie
   **après le premier rendu** (`import()` : le formulaire fonctionne sans elle, la scène
   arrive en état final puis s’anime), ou donner au backoffice, page privée hors index, **son
   propre budget**. À mesurer au build, puis à trancher.
8. **Tests** : mettre à jour les deux parcours du backoffice ; ajouter le mouvement réduit, le
   générique abrégé, le compte à rebours du 429, le collage d’un code et le code de secours.

## Choix à trancher

1. **Le générique** : sa durée (≈ 4,7 s, une fois par onglet), ou une fois par jour, ou
   toujours court ?
2. **La nuit du générique le jour**, puis le lever du jour depuis la lanterne : d’accord ?
3. **Les bandes de cinéma** : au générique et au passage dans l’atelier, ou seulement au
   générique, ou jamais ?
4. **L’envoi au sixième chiffre** : plus rapide, annoncé sous le champ (WCAG 3.2.2) ; ou le
   bouton seul.
5. **Le budget** : chorégraphie chargée après le premier rendu, ou budget propre au
   backoffice ?
6. **Grain, bokeh, horodatage** : purement décoratifs ; on peut retirer chacun sans rien
   perdre.
