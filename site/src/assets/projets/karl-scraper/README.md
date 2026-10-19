# Captures de Karl Scraper (19 octobre 2026)

Série refaite après la refonte graphique de l’interface, fusionnée dans la branche de
développement le 19 octobre 2026 ; elle remplace la série provisoire du 14 octobre. Registre :
`KSC-C1` (`src/config/visuels.ts`) ; alts et légendes dans `src/config/karl-scraper.ts`.

Vraies vues de l’application lancée en local sur des **données de démonstration fictives**, sans
retouche ni texte remplacé. Le dépôt de Karl Scraper est privé (décision de Charles du
14/10/2026) : il n’est ni nommé ni lié sur le site.

- **Version capturée** : branche `dev`, révision `4e054a3789bd12aa2aa98432aab8e48184ce3efe`
  (`4e054a3`, 19 octobre 2026), copiée hors du dépôt sans aucune modification (état Git propre).
  Service .NET 10 publié en Release depuis cette copie, interface Angular 22 construite en
  production et servie par le service lui-même, comme le fait le script de build du projet.
- **Date** : série du 19 octobre 2026 vers 10 h 10 (heure de Paris), rejouée de bout en bout sur
  une racine de stockage vide.
- **Navigateur** : Chromium (Playwright), densité 2, locale `fr-FR`, fuseau `Europe/Paris`,
  mouvement réduit. Thème clair ; la Galaxie est une scène toujours sombre, imposée par
  l’application.
- **Cadrage** : la refonte a posé une coquille (rail de navigation, barre du haut, barre d’état)
  dont des libellés codés en dur nomment l’outil source ; chaque écran, sauf la Galaxie qui couvre
  la coquille, est donc pris par le `clip` de Playwright sur la boîte de son panneau de contenu,
  mesurée dans la page. Aucun recadrage après coup, sauf la vignette de la vitrine.
- **Conversion** : PNG converti en WebP qualité 90 avec Sharp ; la Galaxie est ramenée de 2 880 à
  2 400 px de large, assez pour la visionneuse.

## Les fichiers

| Fichier | Scène | Ce qu’elle montre | Dimensions | Usage |
|---|---|---|---|---|
| `enchainements.webp` | Réglages, Enchaînements (fenêtre de 1 440 × 900) | La colonne des enchaînements : l’interrupteur général allumé, les plafonds (lancements d’agent par jour, créneaux laissés libres, abandon, heures creuses), puis les deux règles fictives, allumées : retenir une lecture proposée, puis la confier à Relais. Cadre arrêté sous la règle 2. | 1808 × 1186 | En-tête de `/projets/karl-scraper` ; sur mobile, les deux règles seules |
| `tableau-de-bord.webp` | Tableau de bord, bloc des panneaux (fenêtre de 1 440 × 900) | L’écart avec l’observation précédente (cinq statuts changés, une tâche nouvelle), puis les panneaux Par projet et Par statut. | 2352 × 1060 | § Une copie locale ; sur mobile, l’écart seul |
| `galaxie.webp` | Galaxie, fenêtre entière (1 440 × 900) | Les seize tâches sur les anneaux de leur statut, deux en retard, le goulot à « À faire », la frise des trois observations. | 2400 × 1500 | § La Galaxie |
| `carte-galaxie.webp` | Galaxie, recadrée | Recadrage de `galaxie` avant réduction (zone de 780 × 630 à partir de 735, 485 dans l’image de 2 880 px) : des tâches reliées à leurs positions précédentes et les libellés « À valider » et « En relecture », sans en trancher aucun. | 780 × 630 | Carte de la vitrine `/projets` |
| `vue-agent.webp` | Tâches, détail, onglet « Vue agent » (fenêtre de 900 px de large) | La donnée exacte que l’outil MCP `get_task` sert à un agent pour la tâche fictive n° 1204, figée sur une observation scellée, en entier. À cette largeur, le détail s’ouvre en tiroir ; le cadre va de la barre d’onglets au bas de l’onglet. | 1086 × 1602 | § Ce que l’agent lit |

## Ce qui reste hors champ

- **Aucun libellé qui nomme l’outil source.** La coquille (rail, barre du haut, barre d’état), la
  navigation latérale des réglages, les tuiles chiffrées et l’encart de session du tableau de
  bord, et l’en-tête du détail d’une tâche portent de tels libellés : les cadrages s’arrêtent
  avant eux. Le titre et le projet de la tâche se lisent dans la donnée de la vue agent. Le
  préfixe des références de tâche n’apparaît sur aucun des fichiers ; la bulle de survol de la
  Galaxie, qui le porte, n’est pas ouverte.
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
  des listes à cocher, une pièce jointe (une maquette en fil de fer générée par le script) ; deux
  tâches en retard.
- Trois passages de synchronisation lancés à la main ; entre deux, le faux serveur fait avancer des
  statuts et ajoute une tâche : d’où les trois observations, l’écart du tableau de bord et la frise
  de la Galaxie.
- Préréglages de filtres, tons de statut et règles d’enchaînement posés par l’API du service de
  démonstration. La règle 1 exige depuis la refonte une confiance et une liste de dépôts : la
  confiance « haute » et trois dépôts fictifs vides, créés dans le dossier personnel de
  démonstration, invisibles à l’écran.

## Isolement

- Racine de stockage vide et dossier personnel déplacé dans un dossier temporaire ; jamais la
  racine réelle de l’outil ni le port du service réel, qui n’a reçu aucune requête.
- Session factice ; préparation, répartition et notifications coupées.
- Faux serveur source (Python, bibliothèque standard) en local : il ne sert que les routes lues par
  le client ; son journal ne montre que des lectures, aucune écriture. Le navigateur n’a rien
  demandé hors de la machine.
- Relais et Sillage pointés vers des ports morts, avec des jetons factices ; les agents et la CLI
  GitHub remplacés par de faux exécutables (aucun appel constaté). Les enchaînements sont allumés
  pour montrer l’écran dans son état actif : aucun déclencheur ne pouvait partir, faute de lecture
  ou de réalisation.
- Tous les processus lancés ont été arrêtés et leurs ports libérés à la fin.

Les scripts de rejeu (préparation de la racine, faux serveur, données, réglages, captures et
mesures) sont hors du dépôt, avec la provenance détaillée de la série. Les identifiants
d’observation, les heures et les échéances relatives changent à chaque rejeu.
