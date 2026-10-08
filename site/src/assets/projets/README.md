# Captures des projets

Captures du 8 octobre 2026, utilisées dans le hub et les fenêtres de découverte.
Les cadres et la composition sont réalisés en CSS ; le contenu des interfaces n’est pas redessiné.

- `bloodborne/parcours-desktop.webp` : vrai front Angular local, 1100 × 700, écran
  `/fr/sky`. Sert de vue principale dans la composition.
- `bloodborne/atlas.webp` : le même écran à 390 × 844.
- `bloodborne/constellation.webp` : `/fr/sky/l-arsenal-de-yharnam`, vue d’ensemble,
  à 390 × 844.
- `bloodborne/guide.webp` : `/fr/gallery/entries/father-gascoigne`, à 390 × 844.
- `gup-selection.webp` : vraie `MenuApp` et moteur OpenTUI, scène `packages-select`
  du générateur de captures, exécutée en français dans une copie temporaire de GUP.

Bloodborne tourne depuis le front local avec `front/e2e/mobile-fixtures.cjs` :
objectifs et portraits réels du catalogue, compte et progression d’exemple. Aucun compte réel
n’est utilisé et les chiffres visibles ne sont pas des métriques d’adoption du projet.
GUP utilise les paquets de démonstration du dépôt et n’exécute aucun gestionnaire de paquets.

La capture de PvZ Fusion existante est conservée : aucun jeu local n’est disponible pour la
renouveler. `bloodborne/yharnam.webp` provient du visuel déjà utilisé sur la page dédiée ;
ses crédits figurent dans cette page.

Les PNG originaux sont convertis en WebP ; Astro produit les tailles adaptées et les AVIF.
