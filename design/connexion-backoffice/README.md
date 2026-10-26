# Connexion au backoffice — « L’atelier s’allume »

Maquette de la page de connexion de `/backoffice`, refaite en scène, dans la direction
« Lanterne » (`DESIGN.md`). Maquette statique, à valider avant le portage dans le site :
[`index.html`](index.html), [`style.css`](style.css), [`theme.js`](theme.js) (thème et
ouverture, avant le premier rendu) et [`entree.js`](entree.js) (la scène, le parcours, et un
serveur simulé).

## La voir

Les chemins remontent vers `site/src/assets/marque/` et `design/refonte/c-lanterne/polices/` :
servir la **racine du dépôt**, puis ouvrir `/design/connexion-backoffice/`.

```sh
python -m http.server 4791   # depuis la racine du dépôt
# http://127.0.0.1:4791/design/connexion-backoffice/
```

- **Régie** (en bas à droite, hors design) : chaque scène, la scène sombre le jour, le
  mouvement réduit, le ralenti × 3, la première connexion (configuration de la 2FA).
- **Simulation** : tout mot de passe mène à la vérification, sauf `erreur` (refus) et
  `bloque` (trop de tentatives) ; le code `000000` est refusé ; tout autre code ouvre
  l’atelier.
- **Adresse** : `?theme=jour|nuit`, `?ouverture=complete|courte|aucune`,
  `?scene=connexion|erreur|bloque|verification|secours|inscription|codes|expiree|atelier`,
  `?veille=1`, `?reduit=1`, `?lent=1`, `?regie=0`.

## Le concept

Une lanterne pend au-dessus de la carte de connexion : c’est la seule lumière de l’écran (la
zone éclairée unique du système), et elle raconte le parcours. Sa flamme écoute la frappe,
vacille sur un refus, se fait souffler quand le serveur impose d’attendre, grandit d’une
étape à l’autre ; à la fin, elle s’embrase et sa lumière gagne l’écran : l’atelier s’ouvre.
La déconnexion fait le geste inverse, la lumière rentre dans la lanterne.

C’est l’allumage du thème (`theme-transition.css`) décliné pour l’entrée : même masque
radial, même front ambre, même courbe. La lanterne est celle du logo (GLO-01), redessinée au
trait : anneau, toit en cloche, cage, fenêtre en arc brisé, bougie. Rien d’un jeu : pas
d’ornement, pas de braises qui montent, pas de cadre doré.

## Chorégraphie

**Ouverture complète** (première visite de l’onglet, ≈ 2,8 s ; toutes les durées sont des
multiples de `--d-scene`) :

| Moment | Ce qui se passe |
|---|---|
| 0 → 0,6 s | la corde descend du haut de l’écran |
| 0,3 → 1,5 s | la lanterne se dessine trait à trait, en se balançant comme si on venait de l’accrocher |
| 1,5 s | la flamme s’allume (0,15 → 1,3 → 1), le halo jette un éclat |
| 1,7 s | la carte sort du flou dans la lumière |
| 1,8 s | le titre monte mot à mot |
| 2,1 s | surtitre, texte, étapes et pied apparaissent |

**Ouverture courte** (visites suivantes, ≈ 1 s) : allumage, carte, titre. **Aucune** en
mouvement réduit. Un clic ou une touche abrège l’ouverture : elle ne retient jamais la main.
L’état final est l’état par défaut du CSS ; l’ouverture n’est qu’un attribut
(`data-ouverture`) qu’on retire.

**Au repos** : la flamme vacille (trois enveloppes animées à des périodes premières entre
elles), le halo respire, une poussière fine danse dans la lumière, un grain de pellicule
très léger couvre le décor, et la lanterne se balance à peine, bercée par « l’air de
l’atelier » (un balancier amorti, ≈ 2,1 s par aller-retour). La main peut la pousser : en
passant dessus, selon sa vitesse, ou d’un clic.

## Les écrans et leurs états

| État | Ce qu’on voit | Ce qu’on entend (lecteur d’écran) |
|---|---|---|
| Connexion | grand titre, carte éclairée, étapes « Connexion — Vérification — Atelier » | champs et étiquettes inchangés |
| Frappe | la flamme sursaute, un éclat passe (une fois toutes les 90 ms au plus) | — |
| Attente | un reflet court sur le bouton ; flamme et halo s’accélèrent | « Connexion… » |
| Refus (401) | la flamme se couche puis se redresse, la carte se dérobe de 7 px, le mot de passe est sélectionné | « L’adresse e-mail ou le mot de passe est incorrect. » |
| Trop de tentatives (429) | flamme soufflée : une braise et un filet de fumée, la flaque s’éteint ; le bouton, au contour, compte « Réessayer dans 18 s » ; à zéro, la flamme se rallume et la main revient au mot de passe | annoncé au début et à la fin seulement, jamais chaque seconde |
| Vérification | la lumière monte d’un palier ; récit et carte changent par View Transition ; six cases | « Code de vérification », « Le code est vérifié dès le sixième chiffre. » |
| Code juste | les six cases s’allument l’une après l’autre | — |
| Code refusé | cases en erreur, secousse, puis vidées | « Ce code est incorrect ou a déjà été utilisé. » |
| Code de secours | un champ à chasse fixe, mis en forme pendant la frappe (`XXXXXXXX-…`) | « Code de secours » |
| Configuration 2FA | une plaque que la lumière balaie pendant la préparation, puis le QR code balayé une fois, son aide, la clé groupée par quatre et « Copier » | « La clé est copiée… » |
| Codes de secours | la lumière monte encore ; les huit codes s’éclairent un à un ; Copier, Télécharger, J’ai conservé mes codes | messages de copie et de téléchargement |
| Session expirée, déconnexion | un avis sous le surtitre | `role="status"` |
| L’atelier s’ouvre | la flamme s’embrase, puis la lumière part d’elle et découvre l’atelier (aperçu simplifié) ; le focus va au titre de la rubrique | — |

La scène suit le thème : pierre et flaque de lumière le jour, suie et clair de lune bleuté la
nuit, la lanterne seule source chaude. La régie propose aussi une **scène sombre le jour**
(l’atelier fermé, comme un acte de veille) : à trancher, voir plus bas.

## Interactions ajoutées

- **Mot de passe** : Afficher ou Masquer (le nom accessible suit le texte visible) ;
  avertissement « Majuscules activées » tant qu’on tape.
- **Code à six chiffres** : un seul vrai champ (étiquette, `autocomplete="one-time-code"`,
  collage d’un code entier), dont les cases sont l’image ; envoi au sixième chiffre, annoncé
  sous le champ ; bascule vers un code de secours, mis en forme et validé avant l’envoi.
- **Configuration** : clé copiable d’un geste (copiée sans espaces).
- **Codes de secours** : copier les huit, ou les télécharger en `.txt` daté.
- **Trop de tentatives** : un compte à rebours tiré de `Retry-After`, puis la main rendue.
- **Étapes** : où l’on en est, forme et mot (`aria-current="step"`, « terminée » pour les
  lecteurs d’écran) ; sur mobile, les repères et le seul nom de l’étape en cours.
- **Focus** : posé à chaque écran (champ, titre de l’étape, titre de la rubrique), comme
  aujourd’hui.
- **Lumière** : le liseré de la carte suit le pointeur ; la lanterne se pousse.
- **Horodatage** à côté du surtitre (« lundi 26 octobre, 21 h 04 »), comme l’indication
  d’un plan.

## Accessibilité et robustesse

- Le décor est `aria-hidden` ; tout ce qui compte est dit en texte, à côté de l’action.
- Mouvement réduit : ni ouverture, ni balancier, ni poussière, ni grain, ni transition ; les
  écrans changent d’un coup, l’atelier aussi.
- Contrastes : uniquement les jetons existants pour le texte et les commandes ; les jetons
  nouveaux sont décoratifs (halo, poussière, grain, vignette, ombre portée).
- Clavier : ordre naturel, focus visible (bleu roi le jour, lanterne la nuit), aucun piège ;
  les titres focalisés par script n’ont pas de contour (ce ne sont pas des commandes).
- Le balancier s’arrête quand l’onglet est masqué ; l’atelier ouvert, la scène aussi.
- Vérifié sur Chromium à 1 440 × 900 et 390 × 844, jour, nuit, scène sombre, mouvement
  réduit : huit parcours (connexion, configuration, refus, code de secours, 429, bascule de
  thème, ouverture abrégée, mouvement réduit), sans erreur JavaScript.

## Portage dans le site (proposition)

Contrats gardés : identifiants et libellés lus par `scripts/backoffice.ts`,
`tests/e2e/backoffice.spec.ts` et `scripts/test-backoffice.mjs`, routes et messages du
backend. Aucun changement côté Rust.

1. **`ConnexionBackoffice.astro`** : chaque écran devient un récit (titre, texte) et une carte
   éclairée, sur la grille de l’entrée. Nouveaux identifiants : `bo-password-voir`,
   `bo-password-maj`, `bo-two-factor-label`, `bo-two-factor-saisie`, `bo-two-factor-mode`,
   `bo-two-factor-copy`, `bo-enrollment-attente`, `bo-recovery-download`, `etapes`.
   `#bo-recovery-codes` devient une liste ordonnée ; la clé manuelle s’affiche groupée.
2. **La scène** dans `BackofficePage.astro`, tant que la session n’est pas ouverte ; le code
   de la scène dans un module à part (`scripts/backoffice-entree.ts`), appelé par
   `backoffice.ts`, qui garde ses appels, ses verrous et ses retours.
3. **L’ouverture avant le premier rendu** : un petit script synchrone propre au backoffice
   (`public/backoffice-entree.js`, comme `/theme.js`) pose `data-ouverture` d’après
   `sessionStorage` et le mouvement réduit. `/theme.js` reste intact.
4. **Session déjà ouverte** : la vérification de `/session` court pendant l’ouverture ;
   valide, la flamme s’embrase aussitôt et l’atelier s’ouvre, sans attendre la fin.
5. **429** : `ErreurApi` porte `Retry-After` ; vérifier que le relais Node le transmet pour
   `/api/backoffice/login` (il le fait déjà pour le formulaire de contact).
6. **Styles** : `styles/backoffice-entree.css`, sur les primitives de `backoffice.css` ; les
   jetons nouveaux rejoignent `jetons.css`, jour et nuit (`--scene-*`, `--halo-*`,
   `--vitre-allumee`, `--flamme-coeur`, `--poussiere`, `--lisere`, `--ombre-portee`,
   `--reflet`, `--grain`), et `contrastes.test.ts` n’a rien de nouveau à couvrir.
7. **Budgets** (15 Ko de JS et 30 Ko de CSS gzip par page) : la maquette pèse ≈ 9 Ko de JS
   et ≈ 13 Ko de CSS gzip non minifiés, dont une bonne part existe déjà dans le site (jetons,
   primitives, parcours de connexion). Estimation après portage : + 4 Ko de JS et + 6 Ko de
   CSS sur la page du backoffice, à mesurer au build ; si le JS dépasse, la scène (purement
   décorative) se charge après le premier rendu.
8. **Tests** : mettre à jour les deux parcours du backoffice ; ajouter le mouvement réduit,
   le compte à rebours du 429, le collage d’un code et le code de secours.

## Choix à trancher

1. **La scène de jour** : claire, sur la pierre (par défaut, fidèle au système), ou sombre
   (« Scène sombre le jour » dans la régie) ? La sombre est plus spectaculaire et donne tout
   son sens à l’ouverture de l’atelier (la lumière du jour entre) ; elle étire la règle des
   actes de veille, réservés jusqu’ici aux captures sombres.
2. **Le titre en `--t-4xl`** : la taille de l’accroche de l’accueil, pour la connexion et la
   vérification. Exception assumée pour une page d’entrée ; sinon `--t-3xl`.
3. **L’envoi au sixième chiffre** : plus rapide, annoncé sous le champ (WCAG 3.2.2) ; on
   peut le retirer et garder le bouton seul.
4. **Ouverture complète une fois par onglet** : ou une fois par jour (`localStorage` daté),
   ou jamais (courte toujours) ?
5. **Grain et horodatage** : purement décoratifs ; on peut les retirer sans rien perdre.
