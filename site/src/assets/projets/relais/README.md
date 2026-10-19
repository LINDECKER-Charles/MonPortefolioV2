# Captures de Relais (19 octobre 2026)

Vraies vues de Relais **0.2.0**, lu à la révision **`e00f22b`** de sa branche de développement
(16 octobre 2026), après la refonte graphique de son interface. Cette série remplace celle du
14 octobre 2026 (révision `bdf041f`), prise avant la refonte. Le dépôt est privé : il n’est ni lié
ni nommé sur le site (décision de Charles du 14/10/2026).

Méthode, sans rien modifier dans le dépôt de Relais :

1. Copie temporaire du dépôt ; le serveur Rust et l’interface Angular y sont construits tels quels
   à cette révision, sans modification du code.
2. Une instance de démonstration tourne en local, sur un port libre, avec un dossier personnel et
   un dossier de données isolés : aucune instance réelle, aucune donnée réelle, aucun service
   distant n’est sollicité. Les projets fictifs vivent dans un chemin neutre,
   `/private/tmp/demo/workspace/`, le seul visible sur les captures.
3. Un **agent de démonstration** remplace Claude Code. Dérivé du double de test du dépôt, il parle
   le même protocole et rejoue des tours écrits à l’avance (raisonnement, appels d’outils,
   réponse, consommation et quotas), sans inférence ni appel réseau. Chaque appel d’outil passe
   par la vraie décision de permission de Relais : les autorisations, le refus hors du périmètre
   et son motif sont produits par Relais.
4. Données inventées : trois abonnements (« Personnel », « Atelier », « Recherche », adresses en
   `example.invalid`), quotas fixés pour la démonstration et relus par la vraie synchronisation de
   Relais ; quatre projets fictifs ; des applications appelantes (« Sillage », « Revue de code »,
   « Notes de version ») ; 26 conversations jouées puis antidatées du 13 au 18 octobre, et
   5 conversations ouvertes au moment des captures. Aucun abonnement de secours ni aucune bascule
   n’est configurée.
5. Chromium de Playwright, fenêtre de 1 440 × 900 en densité 2, thème clair, mouvement réduit,
   `fr-FR`, fuseau Europe/Paris ; capture de la fenêtre après chargement des polices, le
   19 octobre 2026 vers 10 h 18. Le script ne fait que défiler, cliquer, saisir une date et
   mesurer : aucune écriture dans la page, aucun texte remplacé ; il refuse toute vue où une ligne
   serait coupée par un bord. Les PNG sont convertis en WebP qualité 90 avec Sharp, sans
   recadrage, retouche ni recomposition, sauf la vignette de la vitrine (voir le tableau).

| Fichier | Scène | Dimensions | Usage |
|---|---|---|---|
| `dashboard.webp` | Dashboard : agents actifs, consommation du 13 au 19 octobre, capacité des trois abonnements | 2880 × 1800 | En-tête de `/projets/relais` |
| `conversation-perimetre.webp` | Conversation « Paginer la liste des produits » (Sillage, périmètre strict) : chaque appel d’outil suivi de sa décision, la lecture d’un fichier d’un autre projet refusée avec son motif ; panneau Pilotage | 2880 × 1800 | Section « Le périmètre » |
| `capacite.webp` | Fenêtre « Capacité des abonnements » : trois abonnements sous leur seuil de protection | 2880 × 1800 | Section « La capacité », « Voir » |
| `garde-fous.webp` | Abonnements › Personnel › Garde-fous : nouvelles sessions refusées dès 95 %, session ouverte jamais coupée | 2880 × 1800 | Section « La capacité », « Admettre » |
| `analyse.webp` | Analyse : « Temps, débit et fiabilité » (médiane et P95 des tours, débit) et « La réutilisation du contexte » (cache) | 2880 × 1800 | Section « L’analyse » |
| `carte-dashboard.webp` | Recadrage de `dashboard` sur les deux premiers compteurs et la consommation locale (zone de 1 170 × 1 170 à partir de 530, 340), ramené à 960 px, WebP qualité 90 | 960 × 960 | Carte de la vitrine (`/projets`) |

Les chiffres visibles (tokens, coûts, durées, quotas, nombre d’agents) sont calculés par Relais
sur ces données de démonstration : ils ne décrivent aucun usage réel. Restent tels que
l’application les affiche : « 35.8 % » (Dashboard) face à « 35,8 % » (fenêtre de capacité),
« Tous les modèles · 7 jours » sur deux lignes dans la fenêtre de capacité, la méta de l’en-tête
de conversation tronquée à 1 440 px, et le bouton flottant « Derniers messages », qui recouvre en
partie le chemin du dernier appel. Les mots anglais de l’interface (« Dashboard », « LIVE »,
« tokens », « P95 », noms des outils, modèle et intensité) restent tels qu’à l’écran.

Laissés hors champ : Diagnostics (il présenterait l’agent de démonstration comme le runtime géré),
la gestion des abonnements de Configuration (bascule entre abonnements), la connexion d’un
abonnement et la page « Intégrer un outil » (clé et identifiants).

Les scripts de rejeu (préparation, agent de démonstration, données, antidatage, captures) sont
hors du dépôt, avec la provenance détaillée de la série. Les heures, dates et réinitialisations
affichées dépendent du moment du rejeu.
