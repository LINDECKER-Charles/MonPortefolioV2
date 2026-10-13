# Allumages de Bloodborne Legendary Run

Les vidéos et leurs posters sont servis depuis `site/public/demos/bloodborne/`. Ce relevé et
`captures.json` restent ici, hors de `public/` : ils documentent les captures et ne sont pas
publiés avec le site.

Vidéos enregistrées le **9 octobre 2026** dans le vrai front Angular de
`Bloodborne-Legendary-Run`, au format mobile **390 × 844**. Elles utilisent le build local
disponible du **5 octobre 2026** (`front/dist/front/browser/index.html`, modifié à 13 h 58,
heure de Paris), avec le catalogue JSON courant du projet.

Le compte Gehrman et sa progression sont des données de démonstration. Chaque route API est
interceptée par Playwright ; aucun backend ni compte réel n’est contacté ou modifié. Les
illustrations, les moteurs Canvas et les contrôles viennent de l’application sans modification.

Chaque vidéo conserve la séquence réelle : étoile éteinte, appui maintenu sur le bouton
« Éveiller », réponse de sauvegarde de la fixture, cérémonie complète, retour au ciel avec
l’étoile allumée et le bouton « Éteindre ». Le chargement initial est retiré ; le geste et le
rituel ne sont ni accélérés, ni recomposés. Les clips sont sans piste audio.

| Fichiers MP4 / WebM | Objectif | Rituel |
|---|---|---|
| `boss` | `bos-001` — Monstre clérical | Proie abattue |
| `decouverte` | `loc-003` — La lanterne de Yharnam | Découverte d’un lieu |
| `rune` | `run-001` — Métamorphose horaire | Rune de Caryll |
| `gemme` | `spr-001` — Gemme radiale rouge | Gemme de sang |

Les quatre clips durent **10,4 secondes**. Les fichiers `*-poster.webp` sont des images
capturées pendant la cérémonie. `boss-fin-poster.webp`, poster de l’en-tête de la page du
projet, est la dernière image de `boss.mp4` (retour au ciel, étoile allumée), extraite le
13 octobre 2026 sans retouche : `ffmpeg -sseof -0.15 -i boss.mp4 -frames:v 1`, puis
`cwebp -q 80`. Elle remplace dans l’en-tête l’image de la proclamation, presque noire et
coiffée de l’icône de son de l’application. `captures.json` conserve les objectifs, les dimensions,
les durées, les poids et le résultat de la vérification de chaque allumage. Les chiffres de
progression visibles ne mesurent pas l’adoption de l’application.

## Reproduire les captures

Depuis `site/`, avec les dépendances du portfolio installées, Chromium Playwright et
`ffmpeg` / `ffprobe` disponibles :

```sh
node tools/capturer-bloodborne.cjs /chemin/vers/Bloodborne-Legendary-Run
```

Le script lit le build et les données du projet sans l’écrire. Il démarre un serveur SPA sur
un port local libre, enregistre chaque scénario dans un contexte navigateur distinct et
contrôle l’écriture simulée, la fin naturelle du rituel et l’état du bouton. Il encode ensuite
les clips en H.264 / MP4 et VP9 / WebM, sous 1,5 Mo chacun, puis crée les posters avec Sharp.

Sources : `front/e2e/mobile-fixtures.cjs`, `front/e2e/rituals.cjs`,
`front/e2e/material-rituals.cjs`, `docs/guides/rituels.md` et
`back/src/BloodborneRun.Api/Features/Constellation/Source/constellation.json` du projet.
Visuels du jeu © Sony Interactive Entertainment / FromSoftware ; leur provenance demeure
documentée dans le dépôt Bloodborne Legendary Run.
