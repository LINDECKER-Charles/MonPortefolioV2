# Captures de Sillage (14 octobre 2026)

Vraies vues de Sillage, l’application lancée en local avec des **données de démonstration**.
Le dépôt de Sillage est privé : ni lien ni nom de dépôt ici ni sur le site (décision de Charles du
14 octobre 2026).

## Version capturée

- Révision **`c256e76`** du dépôt (13 octobre 2026), branche `dev`, copiée pour l’occasion ;
  l’original n’a été ni modifié ni lancé.
- Serveur : le binaire de production du dépôt, plus récent que toutes les sources Rust de cette
  révision. Interface : le build Angular 22 du 13 octobre 2026, fait après le dernier commit de
  l’interface.
- Thème clair de l’application, Chromium (Playwright), densité 2, locale `fr-FR`, fuseau
  Europe/Paris.

## Données

Aucune donnée réelle. Un Sillage isolé tourne contre le **faux fournisseur des tests du dépôt**, à
la place de Relais : aucun abonnement, aucun appel réseau sortant, aucun agent réel lancé. Les
instances réelles du poste n’ont reçu aucune requête.

- Projets fictifs : « Carnet de route » (application web de carnets de voyage), « Atelier
  réservations », « Bibliothèque de quartier », chacun dans un dépôt Git de démonstration (auteur
  des commits : une équipe de démonstration).
- Abonnement « Abonnement principal », modèles et efforts renommés dans la copie du faux
  fournisseur.
- Tâches : « Recherche plein texte » (exécution interrompue par un redémarrage du serveur),
  « Exporter un carnet en PDF » (terminée), « Partager un carnet » (en cours : un coordinateur a
  créé trois sous-agents), « Rappels avant un atelier » (composée en direct par l’assistant de
  création, par le vrai serveur MCP de Sillage).
- Aucun marqueur de test dans le texte visible : le faux fournisseur lit ses comportements hors
  champ. Les résultats des agents sont des réponses au contrat court écrites pour la
  démonstration ; leurs durées, heures et commits changent à chaque rejeu.

## Fichiers

Chaque PNG est converti en WebP avec Sharp, sans retouche ni recomposition ; les trois vues de
fenêtre sont ramenées de 2 880 à 2 400 px de large (qualité 90), les autres gardent leur taille
(qualité 92 pour le dialogue, 90 sinon). Seul `recapitulatif-mobile.webp` est recadré dans son
fichier (le haut du panneau, 530 px). Les autres recadrages de la page se font en CSS
(`region`, `ratio` de CadreCapture) : le fichier reste entier pour la visionneuse.

Les deux vues de téléphone du dialogue et du récapitulatif ont été capturées le même jour, sur
les mêmes données de démonstration rejouées, dans une fenêtre de 390 px de large (densité 2) :
la page les montre sous 861 px, où les vues de bureau deviendraient illisibles. Leurs heures et
leurs commits diffèrent de ceux des vues de bureau : ils changent à chaque rejeu.

| Fichier | Scène | Dimensions | Usage |
|---|---|---|---|
| `graphe-en-direct.webp` | « Partager un carnet » en direct : cadrage terminé, coordinateur « Attend 3 / 3 enfants », trois sous-agents créés pendant l’exécution, relecture en attente ; bandeau « Exécution en direct ». Fenêtre 1 440 × 900. | 2400 × 1500 | En-tête de `/projets/sillage`, recadré sur le coordinateur et ses sous-agents ; carte de la vitrine (recadrée en CSS) |
| `creer-avec-un-agent.webp` | L’assistant compose « Rappels avant un atelier » : étapes, journal « Brouillon ouvert / Agent ajouté / Agent refusé (dépendance inconnue) / Relit le brouillon », et la demande. Fenêtre 1 440 × 1 040. | 2400 × 1733 | Section « Composer une tâche » |
| `reprendre-execution.webp` | Dialogue « Reprendre l’exécution » de « Recherche plein texte » : étape interrompue reprise dans sa session encore active, agent réutilisé sans nouvelle session, « Relancer 2 étapes ». Boîte du dialogue seule. | 1240 × 1432 | Section « Reprendre après une coupure » |
| `recapitulatif.webp` | « Ce qui a été fait » de l’export PDF terminé : dossier, branche et commit du résultat, worktrees de l’exécution, puis le résultat de chaque agent. Panneau seul. | 1588 × 2998 | Section « Le résultat » |
| `page-projet.webp` | Page du projet « Carnet de route » : actions, activité en cours, tâches et leur état. Fenêtre 1 440 × 900. | 2400 × 1500 | Section « Le principe », au-delà de 860 px, recadrée sur l’activité et les tâches |
| `reprendre-execution-mobile.webp` | Le même dialogue dans une fenêtre de 390 px de large. Boîte du dialogue seule. | 740 × 1648 | Section « Reprendre après une coupure », jusqu’à 860 px |
| `recapitulatif-mobile.webp` | Le haut du même panneau dans une fenêtre de 390 px de large : « Résultat final », dossier, branche et commit. | 664 × 530 | Section « Le résultat », jusqu’à 860 px |
| `page-projet-mobile.webp` | La même page en 390 × 844 : rail replié en menu, actions empilées, activité du projet. | 780 × 1688 | Section « Le principe », jusqu’à 860 px, dans un cadre de téléphone |

Non retenues : les paramètres (adresse du faux fournisseur, jeton) et l’onglet des échanges (JSON
brut). Le chemin affiché dans le récapitulatif est celui du dépôt de démonstration
(`/private/tmp/demo-sillage/…`) : aucun nom personnel.

L’interface de Sillage montre aussi des mots qu’elle écrit en anglais (« high », « worktree ») :
ils restent tels qu’à l’écran.
