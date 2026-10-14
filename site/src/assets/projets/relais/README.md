# Captures de Relais (14 octobre 2026)

Vraies vues de Relais **0.2.0**, lu à la révision **`bdf041f`** de sa branche de développement
(14 octobre 2026). Le dépôt est privé : il n’est ni lié ni nommé sur le site (décision de Charles
du 14/10/2026).

Méthode, sans rien modifier dans le dépôt de Relais :

1. Copie temporaire du dépôt ; le binaire du serveur et l’interface déjà construits à cette
   révision sont lancés tels quels, sans recompilation ni modification du code.
2. Une instance de démonstration tourne en local, sur un port libre, avec un dossier personnel et
   un dossier de données isolés : aucune instance réelle, aucune donnée réelle, aucun service
   distant n’est sollicité.
3. Un **agent de démonstration** remplace Claude Code. Dérivé du double de test du dépôt, il parle
   le même protocole et rejoue des tours écrits à l’avance (raisonnement, appels d’outils,
   réponse, consommation et quotas), sans inférence ni appel réseau. Chaque appel d’outil passe
   par la vraie décision de permission de Relais : les autorisations, le refus hors du périmètre
   et son motif sont produits par Relais.
4. Données inventées : trois abonnements (« Personnel », « Atelier », « Recherche », adresses en
   `example.invalid`), quotas fixés pour la démonstration et relus par la vraie synchronisation de
   Relais ; quatre projets fictifs ; des applications appelantes (« Sillage », « Revue de code »,
   « Notes de version ») ; 26 conversations jouées puis antidatées sur les six jours précédents,
   et 5 conversations ouvertes au moment des captures. Aucun abonnement de secours ni aucune
   bascule n’est configurée.
5. Chromium de Playwright, fenêtre de 1 440 × 900 en densité 2, thème clair, mouvement réduit,
   `fr-FR`, fuseau Europe/Paris ; capture de la fenêtre après chargement des polices. Le script
   ne fait que défiler, cliquer, saisir une date et mesurer : aucune écriture dans la page, aucun
   texte remplacé. Les PNG sont convertis en WebP qualité 90 avec Sharp, sans recadrage, retouche
   ni recomposition, sauf la vignette de la vitrine (voir le tableau).

| Fichier | Scène | Dimensions | Usage |
|---|---|---|---|
| `dashboard.webp` | Dashboard : agents actifs, consommation du 8 au 14 octobre, capacité des trois abonnements | 2880 × 1800 | En-tête de `/projets/relais` |
| `conversation-perimetre.webp` | Conversation « Paginer la liste des produits » (Sillage, périmètre strict) : chaque appel d’outil suivi de sa décision, la lecture d’un fichier d’un autre projet refusée avec son motif ; panneau Pilotage | 2880 × 1800 | Section « Le périmètre » |
| `capacite.webp` | Vue d’ensemble « Capacité des abonnements » : trois abonnements sous leur seuil de protection | 2880 × 1800 | Section « La capacité », « Voir » |
| `garde-fous.webp` | Abonnements › Personnel › Garde-fous : nouvelles sessions refusées dès 95 %, session ouverte jamais coupée | 2880 × 1800 | Section « La capacité », « Admettre » |
| `analyse.webp` | Analyse › Performance et Cache : médiane et P95 des tours, débit, cache | 2880 × 1800 | Section « L’analyse » |
| `carte-dashboard.webp` | Recadrage de `dashboard` sur les deux premiers compteurs et la consommation locale (zone de 1 170 × 1 170 à partir de 530, 440), ramené à 960 px, WebP qualité 90 | 960 × 960 | Carte de la vitrine (`/projets`) |

Les chiffres visibles (tokens, coûts, durées, quotas, nombre d’agents) sont calculés par Relais
sur ces données de démonstration : ils ne décrivent aucun usage réel. Les incohérences de format
« 35.8 % » (Dashboard) et « 35,8 % » (vue d’ensemble) sont celles de l’application. La méta de
l’en-tête de conversation tronquée en « S. » est l’affichage de l’application à 1 440 px.

Laissés hors champ : Diagnostics (il présenterait l’agent de démonstration comme le runtime géré),
la gestion des abonnements de Configuration (bascule entre abonnements), la connexion d’un
abonnement et la page « Intégrer un outil » (clé et identifiants). Une sixième vue, une demande
de permission, a été écartée : deux lignes y étaient coupées par les bords de la fenêtre.
