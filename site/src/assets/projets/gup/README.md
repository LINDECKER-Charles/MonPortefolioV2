# Captures de gup en français (13 octobre 2026)

Vraies vues de gup **0.5.3**, interface en **français**, produites par le générateur de captures
du dépôt public [`LINDECKER-Charles/gup`](https://github.com/LINDECKER-Charles/gup), commit
`0c0e85a` du 6 octobre 2026 (release 0.5.3).

Méthode, sans rien committer dans le dépôt de gup :

1. Copie temporaire du dépôt ; dans `scripts/screenshots/setup.ts`, `setActiveLocale("en")`
   devient `setActiveLocale("fr")` (la seule modification).
2. `npm run screenshots` : la vraie application OpenTUI rend chaque scène sur la machine
   d’exemple de `scripts/screenshots/fixtures/scan.ts` (versions inventées, aucune machine réelle,
   aucun gestionnaire de paquets lancé), horloge et fuseau figés par le générateur. Sortie en SVG.
3. Chaque SVG est rendu par Chromium à une densité de 3, puis converti en WebP qualité 92 avec
   Sharp, sans recadrage, retouche ni recomposition.

| Fichier | Scène du générateur | Dimensions | Usage |
|---|---|---|---|
| `packages-select.webp` | `packages-select` : la liste des paquets, Scoop en échec | 2436 × 1578 | En-tête de `/projets/gup` |
| `scan-progress.webp` | `scan-progress` : l’analyse en cours, Scoop en échec | 2436 × 1578 | Étape « Analyser » |
| `confirm-update.webp` | `confirm-update` : la confirmation, une seule invite UAC | 2436 × 1578 | Étape « Choisir » |
| `update-running.webp` | `update-running` : le terminal intégré pendant la mise à jour | 2904 × 1782 | Étape « Mettre à jour » |
| `journal-activity.webp` | `journal-activity` : douze mois de journal d’exemple | 2904 × 1782 | Étape « Garder une trace » |

Les textes des gestionnaires eux-mêmes (sortie de winget, message d’échec de Scoop) restent en
anglais : gup les affiche tels que l’outil les écrit. Les nombres visibles (versions, scans,
mises à jour) viennent de la machine d’exemple et ne mesurent aucun usage réel.

`../gup-selection.webp` est une capture antérieure de la même scène, gardée pour le hub et la
vedette.
