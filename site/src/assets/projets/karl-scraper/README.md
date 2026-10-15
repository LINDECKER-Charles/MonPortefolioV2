# Captures de Karl Scraper (14 octobre 2026)

**Captures provisoires, à refaire après la refonte graphique** de l’interface : son design actuel
attend une refonte, d’après Charles. Registre : `KSC-C1` (`src/config/visuels.ts`) ; alts et
légendes dans `src/config/karl-scraper.ts`.

Vraies vues de l’application lancée en local sur des **données de démonstration fictives**, sans
retouche ni texte remplacé. Le dépôt de Karl Scraper est privé (décision de Charles du
14/10/2026) : il n’est ni nommé ni lié sur le site.

- **Version capturée** : branche `dev`, révision `66159501f23187b2e776c5961bdf01521fdfd1ae`
  (`6615950`, 9 octobre 2026), copiée hors du dépôt sans aucune modification (état Git propre).
  Service .NET 10 compilé en Release depuis cette copie, interface Angular 22 servie en
  développement.
- **Dates** : série du 14 octobre 2026 vers 11 h 50 (heure de Paris), reprise vers 11 h 58 sur la
  même racine de démonstration (mêmes données, mêmes observations) ; la Galaxie vient de la
  première série.
- **Navigateur** : Chromium (Playwright), densité 2, locale `fr-FR`, fuseau `Europe/Paris`.
  Thème clair ; la Galaxie est une scène toujours sombre, imposée par l’application.
- **Conversion** : PNG converti en WebP qualité 90 avec Sharp, sans recadrage ; la Galaxie est
  ramenée de 3 200 à 2 400 px de large, assez pour la visionneuse. Seule exception au « sans
  recadrage » : la vignette de la vitrine (voir le tableau).

## Les fichiers

| Fichier | Scène | Ce qu’elle montre | Dimensions | Usage |
|---|---|---|---|---|
| `enchainements.webp` | Réglages, onglet Enchaînements | L’interrupteur général allumé, les plafonds (lancements d’agent par jour, créneaux laissés libres, abandon) et deux règles fictives : retenir une lecture proposée, puis la confier à Relais. Cadre arrêté sous la règle 2. | 2728 × 1278 | En-tête de `/projets/karl-scraper`, recadré sur sa colonne (marges vides hors cadre) |
| `tableau-de-bord.webp` | Tableau de bord | Les panneaux Par projet, Par statut et l’écart avec l’observation précédente (cinq statuts changés, une tâche nouvelle). | 2392 × 562 | § Une copie locale ; sur mobile, le seul panneau de l’écart |
| `galaxie.webp` | Galaxie | Les seize tâches sur les anneaux de leur statut, deux en retard, le goulot à « À faire », la frise des trois observations. Fenêtre entière, sans barre latérale. | 2400 × 1350 | § La Galaxie |
| `carte-galaxie.webp` | Galaxie, recadrée | Recadrage de `galaxie` sur la moitié gauche des anneaux (zone de 783 × 627 à partir de 550, 250) : les tâches reliées et les libellés « À valider » et « En relecture », sans en trancher aucun. WebP qualité 90. | 783 × 627 | Carte de la vitrine `/projets` |
| `vue-agent.webp` | Tâches, détail, onglet « Vue agent » | La donnée exacte que l’outil MCP `get_task` sert à un agent pour la tâche fictive n° 1204, figée sur une observation scellée, en entier. Prise à 900 px de large, où l’application empile le détail sur toute la largeur. | 1696 × 1668 | § Ce que l’agent lit |

## Ce qui reste hors champ

- **Aucun libellé qui nomme l’outil source.** Les écrans dont un libellé codé en dur le nomme
  (liste des tâches avec son détail, règle qui pose le statut, bandeau et cartes chiffrées du
  tableau de bord) ne sont pas publiés ; les cadrages retenus s’arrêtent avant eux. Le préfixe des
  références de tâche n’apparaît sur aucun des fichiers.
- **Barre latérale et barre du haut** : elles portent en dur l’adresse de l’outil source réel et
  le nom technique de l’application ; les écrans sont cadrés sur le seul panneau de contenu.
- **Lien profond** : le service de démonstration calcule un lien neutre
  (`http://127.0.0.1:8890/taches/{n}`), visible dans la vue agent.
- **Écrans d’agents** (préparation, répartition, espaces, plans, réalisation) : vides, aucun agent
  n’a tourné. La page les remplace par une figure codée (`KSC-F1`).
- **Pas de capture mobile** : l’application est un outil de bureau.

## Données utilisées (toutes inventées)

- Utilisateur fictif, quatre personnes fictives, aucune adresse e-mail servie.
- Deux clients fictifs (« Atelier Lumen », « Coopérative Rivage ») ; trois projets : « Boutique en
  ligne », « Portail des adhérents », « Application terrain », avec leurs catégories.
- Statuts : À faire, En cours, En relecture, À valider, Terminé. Natures : Évolution, Anomalie,
  Amélioration.
- Seize tâches de développement génériques (références 1171 à 1216), trois fils de commentaires,
  des listes à cocher, une pièce jointe (une maquette en fil de fer générée par le script).
- Trois passages de synchronisation lancés à la main ; entre deux, le faux serveur fait avancer des
  statuts et ajoute une tâche : d’où les trois observations, l’écart du tableau de bord et la frise
  de la Galaxie.
- Préréglages de filtres, tons de statut et règles d’enchaînement posés par l’API du service de
  démonstration.

## Isolement

- Racine de stockage vide et dossier personnel déplacé dans un dossier temporaire ; jamais la
  racine réelle de l’outil ni le port du service réel, qui n’a pas été touché.
- Session factice ; préparation, répartition et notifications coupées.
- Faux serveur source (Python, bibliothèque standard) en local : il ne sert que les routes lues par
  le client et la seule écriture de statut ; son journal ne montre que des lectures.
- Relais et Sillage pointés vers des ports morts, avec des jetons factices ; les agents et la CLI
  GitHub remplacés par de faux exécutables (aucun appel constaté). Les enchaînements sont allumés
  pour montrer l’écran dans son état actif : aucun déclencheur ne pouvait partir, faute de lecture
  ou de réalisation.
- Tous les processus lancés ont été arrêtés et leurs ports libérés à la fin.

Les scripts de rejeu (préparation de la racine, faux serveur, données, réglages, captures) sont
hors du dépôt, avec la provenance détaillée de la série. Les identifiants d’observation, les heures
et les échéances relatives changent à chaque rejeu.
