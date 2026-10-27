# Bande sonore de la connexion JJK

Montage réalisé le 27 octobre 2026 pour la cinématique privée du backoffice.
Le fichier livré est `site/public/audio/connexion-jjk.mp3` : 21,3 secondes,
stéréo 48 kHz, MP3 à 160 kbit/s, 427 337 octets.

La direction sonore s’appuie sur une référence repérée pendant la recherche,
[l’edit JJK d’ImportedMaple](https://www.youtube.com/watch?v=7WXKlCmOtVI) :
masse grave de créature et de cor, attaques de lames, puis rupture de silence.
Cette vidéo sert de référence de direction ; les huit enregistrements employés
dans le montage proviennent du catalogue Mixkit ci-dessous.

## Composition et synchronisation

Le script lit les durées `--jjk-cine-*` dans `site/src/styles/jetons.css`.
Le dernier plan conserve une queue musicale de 3,5 secondes.

| Plan | Début | Durée | Montage |
| --- | ---: | ---: | --- |
| Invocation | 0 s | 1,8 s | Nappe de cuivres descendue, cor assombri, entrée progressive. |
| Signes | 1,8 s | 2,2 s | Trois pulsations graves, hauteurs légèrement différentes. |
| Regard | 4 s | 1,6 s | Aspiration inversée filtrée jusqu’à la révélation. |
| Révélation | 5,6 s | 3,2 s | Impact ample, cor grave et résonance métallique lointaine. |
| Duel | 8,8 s | 2,6 s | Trois lames alternées en stéréo, coup grave de conclusion. |
| Adaptation | 11,4 s | 2,6 s | Cloche abaissée, deux crans métalliques et réflexions courtes. |
| Expansion | 14 s | 2,8 s | Aspiration puis impact à 15,44 s, doublé de cor et de métal. |
| Silence | 16,8 s | 1 s | Zéro échantillon sur toute la seconde après décodage du MP3. |
| Final | 17,8 s | 3,5 s | Deux résonances de cloche et un cor doux, extinction progressive. |

Les 23 couches sont recoupées, transposées, filtrées, enveloppées et repositionnées
par le script. Le grave reste au centre ; les déplacements des lames sont limités
à ±35 % et les cloches à ±18 %. Les réflexions à 91 et 173 ms restent discrètes.
Des gardes muettes de 80 ms autour du silence absorbent les queues des filtres et
le recouvrement des blocs MP3. Le montage comporte un fondu d’entrée et de sortie.

## Sources et droits

Les huit enregistrements sont publiés par **Mixkit** sous la
[Mixkit Sound Effects Free License](https://mixkit.co/license/modal/sfxFree/),
une licence propriétaire gratuite pour les usages personnels et commerciaux
autorisés. Elle permet d’incorporer les sons, modifiés, dans un produit final
plus large. Elle interdit leur redistribution isolée, en stock, dans un outil ou
un modèle, ou avec les fichiers sources. Ce montage aplati accompagne la
cinématique du site ; les enregistrements bruts restent dans un dossier ignoré.
Leurs droits restent à leurs titulaires et ne deviennent pas une création
originale exclusive du portfolio.

[L’attribution est facultative](https://mixkit.co/free-sound-effects/).
Les crédits et les empreintes sont néanmoins conservés pour la traçabilité.
Les fiches ne nomment pas d’auteur individuel. Aucun numéro de version n’est
affiché sur la licence ; elle a été vérifiée le 27 octobre 2026. Les
[conditions d’utilisation](https://mixkit.co/terms/) consultées sont datées du
2 octobre 2025.

| Rôle | Enregistrement | Page officielle |
| --- | --- | --- |
| Nappe | Cinematic transition brass hum — 2282 | [Téléchargement officiel](https://mixkit.co/free-sound-effects/download/2282/?context=item+grid) |
| Pulsation | Cinematic whoosh deep impact — 1143 | [Téléchargement officiel](https://mixkit.co/free-sound-effects/download/1143/?context=item+grid) |
| Aspiration | Reverse cinematic impact trailer — 784 | [Téléchargement officiel](https://mixkit.co/free-sound-effects/download/784/?context=item+grid) |
| Cloche | Cinematic church bell hit — 619 | [Téléchargement officiel](https://mixkit.co/free-sound-effects/download/619/?context=item+grid) |
| Lame rapide | Fast sword whoosh — 2792 | [Téléchargement officiel](https://mixkit.co/free-sound-effects/download/2792/?context=item+grid) |
| Lame ample | Sword slash swoosh — 1476 | [Téléchargement officiel](https://mixkit.co/free-sound-effects/download/1476/?context=item+grid) |
| Impact | Big cinematic impact — 788 | [Téléchargement officiel](https://mixkit.co/free-sound-effects/download/788/?context=item+grid) |
| Cor | Warfare horn — 2289 | [Téléchargement officiel](https://mixkit.co/free-sound-effects/download/2289/?context=item+grid) |

[`sources.json`](sources.json) contient les URL des fichiers complets officiels,
leurs SHA-256, les SHA-256 des copies locales et les commandes de conversion
WAV → FLAC sans perte. Les trois MP3 sources restent inchangés. Les huit copies
locales représentent 6 785 218 octets. Aucun fichier brut n’est versionné.

## Reproduire le montage

Prérequis : Node.js 24 et un FFmpeg complet avec `libmp3lame`, `loudnorm`,
`aecho` et `acompressor`. Le rendu validé emploie FFmpeg 7.1.
Le petit FFmpeg fourni avec Playwright ne dispose pas des encodeurs audio requis.

Depuis `site/`, avec les sources locales déjà présentes :

```sh
node tools/mixer-connexion-jjk.mjs --ffmpeg /chemin/vers/ffmpeg
```

Depuis une nouvelle copie, les huit téléchargements officiels peuvent être
repris dans `.impeccable/review/audio-sources/` :

```sh
node tools/mixer-connexion-jjk.mjs --ffmpeg /chemin/vers/ffmpeg --telecharger
```

Chaque fichier est contrôlé par son SHA-256 avant utilisation. Un original
téléchargé peut être utilisé directement ; la compression FLAC des copies
locales conserve le même signal. Les pistes préparées, le WAV de montage et le
master normalisé restent dans `.impeccable/review/audio-mix/`, également ignoré.
Le script n’écrit dans le produit qu’après validation du candidat encodé.

La normalisation s’effectue en deux passes vers −18 LUFS avec un plafond de
−2 dBTP avant encodage. Le script mesure de nouveau le MP3, vérifie une crête
réelle ≤ −1,5 dBTP, une sonie à ±1,1 LU de la cible, la durée exacte décodée,
le silence intégral entre 16,8 et 17,8 secondes et un poids ≤ 450 000 octets.
Il conserve les mesures par plan et les 23 décisions de montage dans
[`mix.json`](mix.json).

## Mesures de la livraison

- Sonie intégrée : **−18,76 LUFS**.
- Crête réelle après encodage : **−2,23 dBTP**.
- Étendue de sonie : **8,5 LU**.
- Durée décodée : **21,3 s** ; silence décodé : **1 s exacte**, échantillons nuls.
- SHA-256 : `20183e6cb7ede3bc03d863bc64190e8b25e4ed6e4baba4aa2e08337756c1718a`.

| Plan | Crête échantillonnée, dBFS | RMS, dBFS |
| --- | ---: | ---: |
| Invocation | −10,15 | −22,38 |
| Signes | −3,24 | −17,25 |
| Regard | −8,52 | −23,10 |
| Révélation | −2,45 | −17,31 |
| Duel | −2,43 | −20,63 |
| Adaptation | −9,28 | −22,63 |
| Expansion | −2,42 | −15,56 |
| Silence | −∞ | −∞ |
| Final | −13,26 | −26,92 |

Les crêtes par plan sont mesurées sur les échantillons PCM décodés. La crête
réelle de la bande entière est mesurée séparément par `loudnorm` et tient compte
des pointes entre échantillons. Les filtres sont exécutés sur un seul thread pour
stabiliser l’ordre des opérations. Trois rendus consécutifs ont produit cette même
empreinte SHA-256. Les versions de FFmpeg peuvent modifier l’encodage binaire,
d’où la conservation de sa version dans le rapport.
