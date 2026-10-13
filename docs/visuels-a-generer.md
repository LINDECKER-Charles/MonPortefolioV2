# Visuels à générer — commande de production

> **Fichier généré** depuis `site/src/config/visuels.ts` par `npm run visuels:doc` (dans `site/`). Ne pas le corriger ici : corriger le registre, puis relancer la commande. `npm run visuels` liste ce qu’il reste à produire.

## La mission

Tu produis les visuels de la refonte du portfolio de Charles Lindecker. Le registre recense **126 emplacements** (82 « socle », 44 « élargi »). Pour chaque fiche ci-dessous, livre le **fichier attendu**, au chemin indiqué, en respectant le sujet, la composition et le format. Les règles communes valent pour toutes les fiches.

- **Socle** : nécessaire au lancement de la refonte. À produire d’abord.
- **Élargi** : enrichit le site et peut suivre.
- Seules les méthodes **IMG**, **SVG** et **OG** se produisent ici. Les figures (**FIG**), les captures (**CAP**) et les photos (**PHO**) sont codées, capturées ou traitées ailleurs : leurs fiches donnent le contexte, pas une tâche de génération.
- La famille de style (règle 5) est arrêtée : la direction « Lanterne », retenue le 13 octobre 2026 (`design/refonte/c-lanterne/README.md`). Gravure en réserve, deux ou trois aplats séparables (encre, aplat, lumière) recolorés par les jetons, la lanterne comme seule source de lumière.
- Le prompt d’une image se rédige en anglais, à partir des seuls champs **Sujet** et **Composition** de la fiche. Le champ **Emplacement** donne le contexte et peut nommer une marque ou un jeu : il ne va jamais dans un prompt.

## Règles communes

1. **Aucune propriété intellectuelle de tiers** : aucun personnage, logo, carte ou décor reconnaissable (PvZ, Riot, Sony, FromSoftware, 42, Trello, B-Hive, Elan, ATIS, Mission Locale, Shrek). Ne jamais nommer un jeu, un studio ou une marque dans le prompt (règle 1 de `docs/assets-a-generer.md`).
2. **Jamais de visage de Charles généré** ; les personnages sont des silhouettes sans ressemblance. Les portraits sont ses quatre vraies photos (détourage, bichromie et filtres déterministes seulement).
3. **Aucun texte dans l’image**, chiffres compris : les libellés, dates et légendes sont en HTML.
4. **Jamais une image générée présentée comme une capture ou comme une donnée** : les courbes, frises et schémas chiffrés sont des figures codées (FIG), les écrans sont des captures réelles (CAP).
5. **Une seule famille de style**, celle de la direction « Lanterne », retenue le 13 octobre 2026 (`design/refonte/c-lanterne/`) : **gravure en réserve**, trait clair sur fond sombre la nuit et inversé le jour ; deux ou trois aplats francs et séparables (encre, aplat, lumière) ; la lanterne comme seule source de lumière de la scène, qui éclaire une seule chose et laisse le reste dans l’ombre. Même trait, même lumière, même angle par série. Aucun ornement de jeu, aucun cadre doré. La lanterne du logo est le motif récurrent des états (vide, succès, 404).
6. **Jour et nuit** : par défaut, l’illustration est livrée en deux ou trois aplats francs sur fond transparent (encre, aplat, lumière), puis séparée par script en calques recolorés par les jetons CSS. Elle suit ainsi la bascule de thème sans double téléchargement et sans script en ligne. C’est une extension du masque monochrome actuel (`Planche.astro`), retenue le 13 octobre 2026.
7. **Livrables** : master PNG 2× + WebP ; nommage `<ID>_<largeur>x<hauteur>.webp` ; prompt, date et provenance consignés dans `design/assets/<série>/README.md` et `site/src/assets/…/README.md`.
8. **Lisibilité mobile** : le sujet principal occupe au moins 60 % du cadre et se comprend à 390 px.

Exceptions à la règle 3 : le nom dans les déclinaisons du logo, et les images de partage (OG), composées en vraie typographie.

## Méthodes

| Méthode | Nature | Consigne |
|---|---|---|
| IMG | Image générée | Générer l’image avec Codex, puis la livrer en WebP. |
| SVG | Dessin vectoriel | Dessiner à la main : trait constant, `currentColor`, sans `<text>`, un `<title>` neutre en français. Ne jamais vectoriser une image générée. |
| FIG | Figure codée | Coder depuis des données sourcées. Jamais générée : pas de fichier image à produire ici. |
| CAP | Capture réelle | Capturer l’application réelle. Jamais une image générée présentée comme une capture. |
| PHO | Photo réelle | Photo réelle de Charles : détourage, bichromie et filtres déterministes seulement. Jamais régénérée. |
| OG | Image de partage | Composer en HTML avec la vraie typographie, puis rendre en PNG de 1 200 × 630. |

## Livraison

- Image : master PNG 2× + WebP (qualité ≈ 82), au chemin attendu. Nom : `<ID>_<largeur>x<hauteur>.webp`.
- Dessin vectoriel : `<ID>.svg`, au chemin attendu. Un lot (pictos d’une même planche) tient dans un seul fichier.
- Image de partage : `public/og/<ID>_1200x630.png`.
- Consigner pour chaque série le prompt, la date et la provenance dans `design/assets/<série>/README.md` et `site/src/assets/visuels/<série>/README.md`.
- Vérifier avec `npm run visuels` (dans `site/`) : le visuel livré disparaît de la liste des manquants.

## Vue d’ensemble

| Série | Emplacements | Socle | Méthodes |
|---|---|---|---|
| Identité et éléments globaux | 13 | 7 | IMG 2 · SVG 9 · FIG 0 · CAP 0 · PHO 0 · OG 2 |
| Accueil | 16 | 10 | IMG 10 · SVG 1 · FIG 3 · CAP 1 · PHO 1 · OG 0 |
| Projets (hub) | 12 | 5 | IMG 10 · SVG 0 · FIG 0 · CAP 2 · PHO 0 · OG 0 |
| PvZ Fusion | 17 | 13 | IMG 10 · SVG 0 · FIG 6 · CAP 0 · PHO 0 · OG 1 |
| League Of Data Base | 7 | 4 | IMG 3 · SVG 2 · FIG 2 · CAP 0 · PHO 0 · OG 0 |
| Omnicard | 8 | 5 | IMG 2 · SVG 4 · FIG 1 · CAP 0 · PHO 0 · OG 1 |
| Bloodborne Legendary Run | 7 | 4 | IMG 4 · SVG 1 · FIG 1 · CAP 0 · PHO 0 · OG 1 |
| gup | 6 | 2 | IMG 2 · SVG 1 · FIG 3 · CAP 0 · PHO 0 · OG 0 |
| Parcours : hub, professionnel, compétences, formation | 32 | 27 | IMG 24 · SVG 4 · FIG 3 · CAP 0 · PHO 1 · OG 0 |
| Contact | 4 | 3 | IMG 3 · SVG 0 · FIG 0 · CAP 0 · PHO 1 · OG 0 |
| Blog | 2 | 1 | IMG 2 · SVG 0 · FIG 0 · CAP 0 · PHO 0 · OG 0 |
| États : 404 et hors ligne | 2 | 1 | IMG 1 · SVG 1 · FIG 0 · CAP 0 · PHO 0 · OG 0 |
| **Total** | **126** | **82** | IMG 73 · SVG 23 · FIG 19 · CAP 3 · PHO 3 · OG 5 |

## File de travail « socle »

Les visuels « socle » à produire ici (IMG, SVG, OG), dans l’ordre des séries. Les emplacements qui reprennent le fichier d’un autre n’y figurent pas.

- **Identité et éléments globaux** : GLO-01 (SVG), GLO-02 (SVG), GLO-03 (SVG), GLO-04 (SVG), GLO-05 (SVG), GLO-06 (SVG), GLO-07 (OG)
- **Accueil** : ACC-03 (IMG), ACC-04 (IMG), ACC-08 (IMG), ACC-09 (IMG), ACC-11 (IMG)
- **Projets (hub)** : PRJ-01 (IMG), PRJ-02 (IMG)
- **PvZ Fusion** : PVZ-01 (IMG), PVZ-02 (IMG), PVZ-04 (IMG), PVZ-05 (IMG), PVZ-06 (IMG), PVZ-07 (IMG), PVZ-08 (IMG), PVZ-11 (IMG)
- **League Of Data Base** : LOD-03 (SVG), LOD-04 (IMG)
- **Omnicard** : OMN-01 (IMG), OMN-03 (SVG), OMN-04 (SVG), OMN-06 (SVG)
- **Bloodborne Legendary Run** : BLR-01 (IMG), BLR-02 (SVG), BLR-04 (IMG)
- **gup** : GUP-02 (SVG)
- **Parcours : hub, professionnel, compétences, formation** : PAR-01 (IMG), PAR-02 (IMG), PAR-03 (IMG), PRO-01 (IMG), PRO-02 (IMG), PRO-03 (IMG), PRO-04 (IMG), PRO-05 (IMG), CMP-02 (IMG), CMP-03 (IMG), CMP-04 (IMG), CMP-05 (IMG), CMP-06 (IMG), CMP-07 (IMG), CMP-08 (IMG), CMP-10 (SVG), FOR-01 (IMG), FOR-02 (IMG), FOR-03 (IMG), FOR-04 (IMG), FOR-05 (IMG), FOR-06 (IMG), FOR-07 (IMG)
- **Contact** : CON-01 (IMG), CON-02 (IMG)
- **Blog** : BLG-01 (IMG)
- **États : 404 et hors ligne** : ERR-01 (IMG)

## Identité et éléments globaux

### GLO-01 · Emblème seul : la lanterne dans le livre

- **Priorité** : socle · **Méthode** : SVG, à dessiner (vectoriel)
- **Emplacement** : toutes les pages · En-tête mobile, favicon, icônes d’application _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Emblème seul : la lanterne dans le livre
- **Composition** : Silhouette pleine, deux aplats au plus, flamme lisible à 16 px ; dérivé du logo validé, sans le nom
- **Format** : 1:1, viewBox 32 ; PNG 180, 192, 512, masquable
- **Fichier attendu** : `site/src/assets/visuels/global/GLO-01.svg`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif

### GLO-02 · Logo horizontal : emblème + nom

- **Priorité** : socle · **Méthode** : SVG, à dessiner (vectoriel)
- **Emplacement** : toutes les pages · En-tête ordinateur, pied de page _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Logo horizontal : emblème + nom
- **Composition** : Emblème à gauche, nom à droite, hauteur 40 px ; nom gothique conservé (direction « Lanterne »)
- **Format** : ≈ 5:1
- **Fichier attendu** : `site/src/assets/visuels/global/GLO-02.svg`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Charles Lindecker »
- **Note** : En attendant le SVG, l’en-tête et le pied de page composent l’emblème et le nom à partir des images du logo validé (components/ui/Logo.astro).

### GLO-03 · La lanterne en trois états : éteinte, qui s’allume, allumée avec halo

- **Priorité** : socle · **Méthode** : SVG, à dessiner (vectoriel)
- **Emplacement** : toutes les pages · Bascule jour/nuit _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : La lanterne en trois états : éteinte, qui s’allume, allumée avec halo
- **Composition** : Calques séparés (corps, flamme, halo) pour une transition CSS de 300 à 400 ms
- **Format** : 1:1, 24 et 64 px
- **Fichier attendu** : `site/src/assets/visuels/global/GLO-03.svg` (lot de 3)
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif
- **Note** : Livré le 13 octobre 2026 : un seul fichier à trois calques (lt-halo, lt-trait, lt-flamme), dont le site anime les états en CSS (components/layout/BasculeLanterne.astro).

### GLO-04 · Pictogrammes des trois verbes : maîtriser (un livre de règles ouvert, main posée à plat), réinventer (une carte retournée au milieu d’un éventail de cartes identiques), emmener (une lanterne qui en allume une seconde)

- **Priorité** : socle · **Méthode** : SVG, à dessiner (vectoriel)
- **Emplacement** : toutes les pages · Toutes les pages _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Pictogrammes des trois verbes : maîtriser (un livre de règles ouvert, main posée à plat), réinventer (une carte retournée au milieu d’un éventail de cartes identiques), emmener (une lanterne qui en allume une seconde)
- **Composition** : Même grille de 48, même trait
- **Format** : 3 × 1:1, 48 et 96 px
- **Fichier attendu** : `site/src/assets/visuels/global/GLO-04.svg` (lot de 3)
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif

### GLO-05 · Cadres d’appareil neutres : navigateur, téléphone, terminal

- **Priorité** : socle · **Méthode** : SVG, à dessiner (vectoriel)
- **Emplacement** : toutes les pages · Toutes les captures _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Cadres d’appareil neutres : navigateur, téléphone, terminal
- **Composition** : Trait de 1 px, sans marque, coins selon les jetons
- **Format** : 16:10 ; 9:19,5 ; 16:10
- **Fichier attendu** : `site/src/assets/visuels/global/GLO-05.svg` (lot de 3)
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Cadres neutres de navigateur, de téléphone et de terminal »
- **Note** : Trois cadres : navigateur, téléphone, terminal. En attendant le SVG, components/ui/CadreCapture.astro les dessine en CSS.

### GLO-06 · Compléments de pictos : flèche interne, ancre, lien sortant unique, agrandir, lecture vidéo, succès, erreur, sommaire

- **Priorité** : socle · **Méthode** : SVG, à dessiner (vectoriel)
- **Emplacement** : toutes les pages · Interface _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Compléments de pictos : flèche interne, ancre, lien sortant unique, agrandir, lecture vidéo, succès, erreur, sommaire
- **Composition** : Grille 24, trait constant, currentColor
- **Format** : 1:1
- **Fichier attendu** : `site/src/assets/visuels/global/GLO-06.svg`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif

### GLO-07 · Nom, métier, accroche, emblème, photo en couleur (chemise bleu roi)

- **Priorité** : socle · **Méthode** : OG, à composer en HTML puis rendre en PNG
- **Emplacement** : toutes les pages · Partage par défaut _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Nom, métier, accroche, emblème, photo en couleur (chemise bleu roi)
- **Composition** : Typographie réelle de la direction : Instrument Serif pour l’accroche, Instrument Sans pour le nom et le métier, sur la pierre du jour
- **Format** : 1200 × 630
- **Fichier attendu** : `site/public/og/GLO-07_1200x630.png`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Charles Lindecker, architecte logiciel. Je maîtrise d’abord les règles du jeu. Ensuite, je les réinvente. »

### GLO-08 · Gabarit de GLO-07 avec le visuel de la page : Projets, Parcours, Contact, Blog, 404 et chaque projet

- **Priorité** : élargi · **Méthode** : OG, à composer en HTML puis rendre en PNG
- **Emplacement** : toutes les pages · Partage par page _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Gabarit de GLO-07 avec le visuel de la page : Projets, Parcours, Contact, Blog, 404 et chaque projet
- **Composition** : Titre à gauche, visuel à droite, emblème en bas
- **Format** : 1200 × 630 (×10)
- **Fichier attendu** : `site/public/og/GLO-08_1200x630.png` (lot de 10)
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Charles Lindecker, mode d’emploi »
- **Note** : Dix déclinaisons : Projets, Parcours, Contact, Blog, 404 et chaque projet.

### GLO-09 · Grain de papier très léger, raccordable

- **Priorité** : élargi · **Méthode** : IMG, à générer (image)
- **Emplacement** : toutes les pages · Fond, jour _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Grain de papier très léger, raccordable
- **Composition** : Opacité d’usage ≈ 3 %
- **Format** : 512 × 512
- **Fichier attendu** : `site/src/assets/visuels/global/GLO-09_512x512.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif

### GLO-10 · Grain de nuit, très faible

- **Priorité** : élargi · **Méthode** : IMG, à générer (image)
- **Emplacement** : toutes les pages · Fond, nuit _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Grain de nuit, très faible
- **Composition** : Idem
- **Format** : 512 × 512
- **Fichier attendu** : `site/src/assets/visuels/global/GLO-10_512x512.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif

### GLO-11 · La flamme de la lanterne qui vacille ; statique en mouvement réduit

- **Priorité** : élargi · **Méthode** : SVG, à dessiner (vectoriel)
- **Emplacement** : toutes les pages · Chargement (formulaire, vidéo) _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : La flamme de la lanterne qui vacille ; statique en mouvement réduit
- **Composition** : Flamme seule
- **Format** : 1:1, 32 px
- **Fichier attendu** : `site/src/assets/visuels/global/GLO-11.svg`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif

### GLO-12 · En-tête et pied imprimables (emblème, adresse du site)

- **Priorité** : élargi · **Méthode** : SVG, à dessiner (vectoriel)
- **Emplacement** : toutes les pages · Impression _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : En-tête et pied imprimables (emblème, adresse du site)
- **Composition** : Une couleur
- **Format** : A4
- **Fichier attendu** : `site/src/assets/visuels/global/GLO-12.svg`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif

### GLO-13 · Le logo en ASCII, 40 colonnes au plus

- **Priorité** : élargi · **Méthode** : SVG, à dessiner (vectoriel)
- **Emplacement** : toutes les pages · Console du navigateur _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Le logo en ASCII, 40 colonnes au plus
- **Composition** : —
- **Format** : texte
- **Fichier attendu** : `site/src/assets/visuels/global/GLO-13.txt`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif
- **Note** : Texte ASCII de 40 colonnes au plus, pas une image.

## Accueil

### ACC-01 · Portrait de Charles dans le colza

- **Priorité** : socle · **Méthode** : PHO, photo réelle, traitements déterministes seulement
- **Emplacement** : `/` · Couverture _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Portrait de Charles dans le colza
- **Composition** : Photo existante charles-4, cadrage vertical plein, sans agrandissement ; bichromie nuit existante
- **Format** : 4:5
- **Fichier attendu** : `site/src/assets/photos/charles-4.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Portrait de Charles dans le colza »
- **Note** : Existe : photo charles-4, jamais régénérée.

### ACC-02 · Trois pictos des verbes

- **Priorité** : socle · **Méthode** : SVG, rien à produire, le fichier est celui d’un autre emplacement
- **Emplacement** : `/` · Couverture, bandeau des preuves _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Trois pictos des verbes
- **Composition** : Voir GLO-04
- **Format** : —
- **Fichier attendu** : aucun, reprend `GLO-04`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif

### ACC-03 · Démonter de vieux PC avec son père

- **Priorité** : socle · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/` · 01, le terrain de jeu _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Démonter de vieux PC avec son père
- **Composition** : Établi vu de trois quarts, tour ouverte, composants posés en vue éclatée, deux paires de mains (adulte, enfant), aucune inscription
- **Format** : 3:2, 1800 × 1200
- **Fichier attendu** : `site/src/assets/visuels/accueil/ACC-03_1800x1200.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Démonter de vieux PC avec son père »

### ACC-04 · Le jeu de cartes papier inventé avec son cousin

- **Priorité** : socle · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/` · 01, le terrain de jeu (et Omnicard § 2) _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Le jeu de cartes papier inventé avec son cousin
- **Composition** : Table d’après-midi d’été vue de dessus : piles de cartes imprimées, plastifieuse, ciseaux, cartes en pochettes aux coins cornés, feuille de règles griffonnée illisible, deux paires de mains d’adolescents
- **Format** : 3:2, 1800 × 1200
- **Fichier attendu** : `site/src/assets/visuels/accueil/ACC-04_1800x1200.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Le jeu de cartes papier inventé avec son cousin »

### ACC-05 · Apprendre le C pour coder des jeux

- **Priorité** : élargi · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/` · 01, vers 13 ans _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Apprendre le C pour coder des jeux
- **Composition** : Vieux PC allumé, tutoriel ouvert, listing illisible, croquis de niveau de jeu épinglé au mur (sans manette de marque)
- **Format** : 4:3, 1600 × 1200
- **Fichier attendu** : `site/src/assets/visuels/accueil/ACC-05_1600x1200.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Apprendre le C pour coder des jeux »

### ACC-06 · Le plafond puis le saut

- **Priorité** : socle · **Méthode** : FIG, à coder (figure de données), rien à générer
- **Emplacement** : `/` · 01, Gwent _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Le plafond puis le saut
- **Composition** : Figure existante FigurePlafond.astro, agrandie, sans « Fig. 1 », tracée à l’arrivée
- **Format** : 16:9
- **Fichier attendu** : `site/src/components/accueil/FigurePlafond.astro`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Le plafond puis le saut »
- **Note** : Existe : FigurePlafond.astro.

### ACC-07 · Le plateau puis la percée

- **Priorité** : élargi · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/` · 01, Gwent, ouverture _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Le plateau puis la percée
- **Composition** : Un joueur de dos devant une table, une colonne de cartes identiques bloquée sous un plafond lumineux, une carte retournée qui le traverse ; aucune carte ni logo du jeu
- **Format** : 16:9, 1920 × 1080
- **Fichier attendu** : `site/src/assets/visuels/accueil/ACC-07_1920x1080.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Le plateau puis la percée »

### ACC-08 · Les portes qui ne s’ouvrent pas

- **Priorité** : socle · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/` · 01, les portes _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Les portes qui ne s’ouvrent pas
- **Composition** : Couloir de quatre portes fermées, une cinquième entrouverte sur la lumière, sans inscription (intitulés en HTML dessous)
- **Format** : 21:9, 2100 × 900 ; recadrage 4:5 mobile (recadrage mobile 4:5)
- **Fichier attendu** : `site/src/assets/visuels/accueil/ACC-08_2100x900.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Les portes qui ne s’ouvrent pas »

### ACC-09 · Le programme bouclé en un mois

- **Priorité** : socle · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/` · 01, la voie qui marche _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Le programme bouclé en un mois
- **Composition** : Composition validée le 2026-10-08 : chronomètre, grands dossiers en perspective, rouleau de diplôme noué
- **Format** : 4:3, 1600 × 1200
- **Fichier attendu** : `site/src/assets/visuels/accueil/ACC-09_1600x1200.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Le programme bouclé en un mois »

### ACC-10 · −30 % de temps de traitement

- **Priorité** : élargi · **Méthode** : FIG, à coder (figure de données), rien à générer
- **Emplacement** : `/` · 01, stage _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : −30 % de temps de traitement
- **Composition** : Deux barres avant / après, échelle honnête
- **Format** : 16:5
- **Fichier attendu** : aucune image, figure codée
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « −30 % de temps de traitement »

### ACC-11 · La classe vue depuis le pupitre du formateur

- **Priorité** : socle · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/` · 01, de l’autre côté du bureau _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : La classe vue depuis le pupitre du formateur
- **Composition** : Une dizaine de postes, silhouettes de dos, tableau couvert d’un schéma front / API / base
- **Format** : 4:3, 1600 × 1200
- **Fichier attendu** : `site/src/assets/visuels/accueil/ACC-11_1600x1200.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « La classe vue depuis le pupitre du formateur »

### ACC-12 · « Une dizaine, tous titrés »

- **Priorité** : élargi · **Méthode** : FIG, à coder (figure de données), rien à générer
- **Emplacement** : `/` · 01, de l’autre côté du bureau _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : « Une dizaine, tous titrés »
- **Composition** : Rangée de silhouettes cochées, moitié DWWM, moitié CDA ; légende « schéma : une dizaine »
- **Format** : 4:1
- **Fichier attendu** : aucune image, figure codée
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « « Une dizaine, tous titrés » »

### ACC-13 · Cartes projets LoD, Bloodborne, gup

- **Priorité** : socle · **Méthode** : CAP, à capturer (écran réel), rien à générer
- **Emplacement** : `/` · 02, ce que je construis _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Cartes projets LoD, Bloodborne, gup
- **Composition** : Captures réelles dans les cadres GLO-05
- **Format** : 16:10
- **Fichier attendu** : `site/src/assets/visuels/accueil/ACC-13_1600x1000.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Captures de League Of Data Base, de Bloodborne Legendary Run et de gup »

### ACC-14 · La flamme qui se transmet

- **Priorité** : élargi · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/` · 02, à plusieurs, en tête _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : La flamme qui se transmet
- **Composition** : Trois lanternes de tailles proches, la flamme passe de gauche à droite (dessin validé le 2026-10-08), discret, au service du chiffre
- **Format** : 21:9, 2100 × 900
- **Fichier attendu** : `site/src/assets/visuels/accueil/ACC-14_2100x900.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « La flamme qui se transmet »

### ACC-15 · Les quatre gestes

- **Priorité** : socle · **Méthode** : IMG, rien à produire, le fichier est celui d’un autre emplacement
- **Emplacement** : `/` · 02, à plusieurs _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Les quatre gestes
- **Composition** : Réutilise les quatre cartes de gestion de projet de la page PvZ Fusion : organiser (PVZ-05), livrer (PVZ-07), motiver (PVZ-08), remercier (PVZ-11)
- **Format** : 1:1
- **Fichier attendu** : aucun, reprend `PVZ-05`, `PVZ-07`, `PVZ-08`, `PVZ-11`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Les quatre gestes »

### ACC-16 · La lanterne posée sur un livre ouvert, un chemin éclairé devant

- **Priorité** : élargi · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/` · 03, conclusion _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : La lanterne posée sur un livre ouvert, un chemin éclairé devant
- **Composition** : Espace libre à droite pour le bouton (reprend ILL-08)
- **Format** : 16:9, 1920 × 1080
- **Fichier attendu** : `site/src/assets/visuels/accueil/ACC-16_1920x1080.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « La lanterne posée sur un livre ouvert, un chemin éclairé devant »
- **Note** : Reprend ILL-08 de docs/assets-a-generer.md.

## Projets (hub)

### PRJ-01 · La traduction comme travail d’équipe

- **Priorité** : socle · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/projets` · Carte PvZ (première, grande) _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : La traduction comme travail d’équipe
- **Composition** : Tableau de travail à trois colonnes (à faire, en relecture, livré) sans marque, plusieurs mains anonymes, un paquet scellé qui part vers un grand dépôt commun
- **Format** : 16:10, 1600 × 1000 ; 4:5 mobile (recadrage mobile 4:5)
- **Fichier attendu** : `site/src/assets/visuels/projets/PRJ-01_1600x1000.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « La traduction comme travail d’équipe »

### PRJ-02 · Une archive versionnée

- **Priorité** : socle · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/projets` · Carte LoD (et LOD-01) _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Une archive versionnée
- **Composition** : Registre relié ouvert dont les pages sont des couches datées superposées qui s’éventaillent vers la droite, marque-page sur une page ancienne ; aucun personnage
- **Format** : 16:10 + 1:1
- **Fichier attendu** : `site/src/assets/visuels/projets/PRJ-02_1600x1000.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Une archive versionnée »

### PRJ-03 · Du papier au jeu en ligne

- **Priorité** : socle · **Méthode** : IMG, rien à produire, le fichier est celui d’un autre emplacement
- **Emplacement** : `/projets` · Carte Omnicard _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Du papier au jeu en ligne
- **Composition** : Recadrage d’OMN-01
- **Format** : 16:10
- **Fichier attendu** : aucun, reprend `OMN-01`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Du papier au jeu en ligne »

### PRJ-04 · Le ciel des objectifs

- **Priorité** : socle · **Méthode** : CAP, à capturer (écran réel), rien à générer
- **Emplacement** : `/projets` · Carte Bloodborne _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Le ciel des objectifs
- **Composition** : Capture réelle atlas.webp ou constellation mobile dans GLO-05
- **Format** : 16:10
- **Fichier attendu** : `site/src/assets/visuels/projets/PRJ-04_1600x1000.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Le ciel des objectifs »
- **Note** : Capture réelle existante : atlas.webp (assets/projets/bloodborne), ou constellation mobile.

### PRJ-05 · La sélection des mises à jour

- **Priorité** : socle · **Méthode** : CAP, à capturer (écran réel), rien à générer
- **Emplacement** : `/projets` · Carte gup _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : La sélection des mises à jour
- **Composition** : Capture packages-select en français, SVG, dans le cadre terminal
- **Format** : 16:10
- **Fichier attendu** : `site/src/assets/visuels/projets/PRJ-05_1600x1000.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « La sélection des mises à jour »
- **Note** : Capture existante à régénérer en français : packages-select.

### PRJ-06 · Décider quoi faire d’une branche

- **Priorité** : élargi · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/projets` · « Aussi », GitHealth _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Décider quoi faire d’une branche
- **Composition** : Trois branches stylisées, chacune avec un picto de verdict (garder, revoir, nettoyer), sans texte
- **Format** : 4:3, 1200 × 900
- **Fichier attendu** : `site/src/assets/visuels/projets/PRJ-06_1200x900.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Décider quoi faire d’une branche »

### PRJ-07 · Une animation pixel art dans une page

- **Priorité** : élargi · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/projets` · « Aussi », Life Pixel _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Une animation pixel art dans une page
- **Composition** : Grille de pixel art, mascotte en trois images en pelure d’oignon, flèche vers une page web où elle s’anime
- **Format** : 4:3
- **Fichier attendu** : `site/src/assets/visuels/projets/PRJ-07_1600x1200.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Une animation pixel art dans une page »

### PRJ-08 · Une image, des variantes

- **Priorité** : élargi · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/projets` · « Aussi », img-convertor _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Une image, des variantes
- **Composition** : Une grande image qui se décline en quatre variantes de largeurs différentes, sans poids chiffré
- **Format** : 4:3
- **Fichier attendu** : `site/src/assets/visuels/projets/PRJ-08_1600x1200.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Une image, des variantes »

### PRJ-09 · La veille qui devient lecture

- **Priorité** : élargi · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/projets` · « Aussi », MaVeille (si le site revient) _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : La veille qui devient lecture
- **Composition** : Pile de rapports datés qui devient une page avec sommaire
- **Format** : 4:3
- **Fichier attendu** : `site/src/assets/visuels/projets/PRJ-09_1600x1200.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « La veille qui devient lecture »

### PRJ-10 · L’absurde assumé

- **Priorité** : élargi · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/projets` · « Aussi », Shreksophone _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : L’absurde assumé
- **Composition** : Un saxophone qui surgit d’une fenêtre de navigateur, notes qui débordent du cadre ; aucun personnage
- **Format** : 1:1, 960 × 960
- **Fichier attendu** : `site/src/assets/visuels/projets/PRJ-10_960x960.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « L’absurde assumé »

### PRJ-11 · Les portes ouvertes de l’open source

- **Priorité** : élargi · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/projets` · Bloc « Contribuer » _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Les portes ouvertes de l’open source
- **Composition** : Trois lanternes posées sur trois boîtes (dépôts), un chemin qui y mène
- **Format** : 3:1, 1800 × 600
- **Fichier attendu** : `site/src/assets/visuels/projets/PRJ-11_1800x600.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Les portes ouvertes de l’open source »

### PRJ-12 · La version précédente

- **Priorité** : élargi · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/projets` · Archives (quand elles existent) _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : La version précédente
- **Composition** : Un livre plus ancien sur une étagère à côté du manuel ouvert (reprend ILL-10)
- **Format** : 4:3
- **Fichier attendu** : `site/src/assets/visuels/projets/PRJ-12_1600x1200.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « La version précédente »
- **Note** : Reprend ILL-10 de docs/assets-a-generer.md.

## PvZ Fusion

### PVZ-01 · Traduction et équipe

- **Priorité** : socle · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/projets/pvz-fusion` · En-tête _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Traduction et équipe
- **Composition** : Jardin-plateau en coupe, plantes génériques stylisées ; de petites silhouettes posent des étiquettes ; une seule à gauche, un groupe à droite ; derrière, une pile de fiches qui grossit
- **Format** : 4:3, 1600 × 1200 ; 1:1 mobile (recadrage mobile 1:1)
- **Fichier attendu** : `site/src/assets/visuels/pvz-fusion/PVZ-01_1600x1200.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Un jardin en coupe où de petites silhouettes posent des étiquettes sur des plantes, une seule à gauche, un groupe à droite. »
- **Note** : Posé dans l’en-tête de la page (components/projets/gabarit/EnTeteProjet.astro, slot « visuel ») : 4:3 sur ordinateur, 1:1 sous 860 px.

### PVZ-02 · Accueillir, former, faire confiance

- **Priorité** : socle · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/projets/pvz-fusion` · § 2, l’équipe _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Accueillir, former, faire confiance
- **Composition** : Triptyque dans le même décor : une personne montre une fiche annotée à une nouvelle venue ; la nouvelle venue travaille ; elle relit seule la fiche d’un troisième
- **Format** : 3:1 ; 3 × 4:3 mobile (recadrage mobile 4:3)
- **Fichier attendu** : `site/src/assets/visuels/pvz-fusion/PVZ-02_1800x600.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Trois moments dans le même décor : montrer une fiche annotée à une nouvelle venue, la voir travailler, puis relire seule. »
- **Note** : Au-dessus des trois temps de la formation (Accueillir, Former et relire, Faire confiance), dont les intitulés restent en HTML : les trois cases du triptyque leur répondent de gauche à droite.

### PVZ-03 · La boucle

- **Priorité** : socle · **Méthode** : FIG, à coder (figure de données), rien à générer
- **Emplacement** : `/projets/pvz-fusion` · § 3, la semaine type _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : La boucle
- **Composition** : Les quatre cartes de gestion de projet (organiser, livrer, motiver, remercier) disposées deux sur deux dans le sens horaire, reliées par des flèches, « une semaine » au centre ; une liste ordonnée sur mobile
- **Format** : libre, suit la grille des cartes
- **Fichier attendu** : aucune image, figure codée
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « La semaine type, en quatre gestes »
- **Note** : Dessinée en HTML et CSS, sans image à générer : components/projets/pvz/BoucleSemaine.astro. Les vignettes des cartes sont PVZ-05, PVZ-07, PVZ-08 et PVZ-11.

### PVZ-04 · Repérer

- **Priorité** : socle · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/projets/pvz-fusion` · § 3, bloc de l’outil du pôle (repérer ce qui manque) _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Repérer
- **Composition** : Une loupe tenue au-dessus d’une longue feuille de lignes régulières, où quelques lignes manquent, laissées en creux ; la lumière de la lanterne passe par la loupe et éclaire seulement les creux
- **Format** : 1:1, 480
- **Fichier attendu** : `site/src/assets/visuels/pvz-fusion/PVZ-04_480x480.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Repérer »
- **Note** : Posé dans l’acte de veille de l’outil : la gravure doit rester lisible sur fond sombre. À compléter par la capture réelle du Console Manager (CAP-PVZ-2, cahier § 6.12) quand elle existe.

### PVZ-05 · Organiser : un tableau commun

- **Priorité** : socle · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/projets/pvz-fusion` · § 3, carte 1 de la semaine type, Organiser (accueil : les quatre gestes) _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Organiser : un tableau commun
- **Composition** : Tableau de cartes épinglées en trois colonnes, sans marque ni texte ; plusieurs mains anonymes prennent chacune une carte ; la lanterne posée au pied du tableau
- **Format** : 1:1, 480
- **Fichier attendu** : `site/src/assets/visuels/pvz-fusion/PVZ-05_480x480.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Organiser : un tableau commun »
- **Note** : Vignette de carte, affichée entre 96 et 136 px : le sujet doit se lire en petit, sujet principal au centre, sans détail fin.

### PVZ-06 · Traduire, relire, tester

- **Priorité** : socle · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/projets/pvz-fusion` · § 4, le métier de traducteur, à côté des corrections et de la démonstration _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Traduire, relire, tester
- **Composition** : Une plume posée sur une fiche barrée puis récrite, une coche de relecture dans la marge, une loupe sur un écran de jeu générique sans personnage ni interface lisible
- **Format** : 1:1, 480
- **Fichier attendu** : `site/src/assets/visuels/pvz-fusion/PVZ-06_480x480.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Traduire, relire, tester »
- **Note** : Vignette de titre, affichée à 72 px : silhouette simple, lisible en petit.

### PVZ-07 · Livrer : une proposition par semaine

- **Priorité** : socle · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/projets/pvz-fusion` · § 3, carte 2 de la semaine type, Livrer (accueil : les quatre gestes) _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Livrer : une proposition par semaine
- **Composition** : Calendrier de semaines, chacune cochée d’un colis scellé qui rejoint un tronc commun ; plusieurs petites étiquettes sans nom nouées sur le colis de la semaine
- **Format** : 1:1, 480
- **Fichier attendu** : `site/src/assets/visuels/pvz-fusion/PVZ-07_480x480.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Livrer : une proposition par semaine »
- **Note** : Vignette de carte, affichée entre 96 et 136 px.

### PVZ-08 · Motiver : le classement de la semaine

- **Priorité** : socle · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/projets/pvz-fusion` · § 3, carte 3 de la semaine type, Motiver (accueil : les quatre gestes) _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Motiver : le classement de la semaine
- **Composition** : Petit podium de trois marches sans chiffre, trois silhouettes anonymes de tailles proches, une étoile au-dessus de la plus haute marche, éclairée par la lanterne, sans lettre ni ruban
- **Format** : 1:1, 480
- **Fichier attendu** : `site/src/assets/visuels/pvz-fusion/PVZ-08_480x480.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Motiver : le classement de la semaine »
- **Note** : Ancienne station « Reconnaître » scindée le 13/10/2026 : le podium ici, la lettre en PVZ-11, pour les quatre cartes conservées de la gestion de projet.

### PVZ-09 · Rattraper, puis ne plus décrocher

- **Priorité** : élargi · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/projets/pvz-fusion` · § 4, à côté de la courbe _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Rattraper, puis ne plus décrocher
- **Composition** : Diptyque : une petite équipe derrière un train de wagons-fiches qui s’allonge, puis à sa hauteur
- **Format** : 16:9
- **Fichier attendu** : `site/src/assets/visuels/pvz-fusion/PVZ-09_1600x900.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Rattraper, puis ne plus décrocher »

### PVZ-10 · Un outil en ligne de commande dans un terminal

- **Priorité** : élargi · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/projets/pvz-fusion` · § 3, bloc outil _(contexte : ne pas le recopier dans un prompt)_
- **Sujet pour le prompt** : Un outil en ligne de commande dans un terminal
- **Composition** : Terminal stylisé à deux colonnes, lignes manquantes en creux
- **Format** : 4:3
- **Fichier attendu** : `site/src/assets/visuels/pvz-fusion/PVZ-10_1600x1200.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Le Console Manager »
- **Note** : À remplacer par la capture CAP-PVZ-2 dès qu’elle existe.

### PVZ-11 · Remercier : le récapitulatif individuel

- **Priorité** : socle · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/projets/pvz-fusion` · § 3, carte 4 de la semaine type, Remercier (accueil : les quatre gestes) _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Remercier : le récapitulatif individuel
- **Composition** : Une lettre personnelle pliée, nouée d’un ruban, tendue par une main anonyme vers une autre ; derrière, une petite pile de fiches de la semaine ; la lanterne éclaire la lettre seule
- **Format** : 1:1, 480
- **Fichier attendu** : `site/src/assets/visuels/pvz-fusion/PVZ-11_480x480.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Remercier : le récapitulatif individuel »
- **Note** : Ajouté le 13/10/2026 : la moitié « lettre » de l’ancienne station PVZ-08, pour la quatrième carte de gestion de projet. Même série, même main que PVZ-05, PVZ-07 et PVZ-08.

### PVZ-F1 · Courbe du rattrapage

- **Priorité** : socle · **Méthode** : FIG, à coder (figure de données), rien à générer
- **Emplacement** : `/projets/pvz-fusion` · § 4 _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Courbe du rattrapage
- **Composition** : Huit relevés de l’historique public, du 16/10/2025 au 12/10/2026 (docs/matiere-premiere.md) : entrées anglaises (la ligne), part traduite en encre, manquant en hachures, août 2026 marqué à la lanterne
- **Format** : 16:9 ; 4:5 mobile (recadrage mobile 4:5)
- **Fichier attendu** : aucune image, figure codée
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Courbe du rattrapage »
- **Note** : Codée : components/projets/pvz/FigureRattrapage.astro, scène qui se trace à son arrivée et se rejoue au clic ; tableau des relevés en dessous.

### PVZ-F2 · La 4.0 en six jours

- **Priorité** : socle · **Méthode** : FIG, à coder (figure de données), rien à générer
- **Emplacement** : `/projets/pvz-fusion` · § 4 _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : La 4.0 en six jours
- **Composition** : 20/09 textes d’origine versés au dépôt → 26/09 PR française fusionnée → 01/10 sortie multilingue
- **Format** : 4:1
- **Fichier attendu** : aucune image, figure codée
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « La 4.0 en six jours »
- **Note** : Codée en HTML : components/projets/pvz/FigureQuatreZero.astro.

### PVZ-F3 · Frise des arrivées

- **Priorité** : élargi · **Méthode** : FIG, à coder (figure de données), rien à générer
- **Emplacement** : `/projets/pvz-fusion` · § 2 _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Frise des arrivées
- **Composition** : Neuf arrivées datées des journaux publics (08/12/2025 → 23/03/2026), en silhouettes anonymes empilées quand deux dates se touchent ; aucun pseudonyme
- **Format** : 4:1
- **Fichier attendu** : aucune image, figure codée
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Frise des arrivées »
- **Note** : Réunie avec PVZ-F4 dans une seule figure codée : components/projets/pvz/FigureEquipe.astro.

### PVZ-F4 · Traducteur → Lead → Mainteneur

- **Priorité** : socle · **Méthode** : FIG, à coder (figure de données), rien à générer
- **Emplacement** : `/projets/pvz-fusion` · En-tête, § 2 _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Traducteur → Lead → Mainteneur
- **Composition** : Trois jalons datés : traducteur le 21/10/2025, lead du pôle le 05/12/2025 (journal public), mainteneur au plus tard le 26/09/2026 (il fusionne la PR #223)
- **Format** : 3:1
- **Fichier attendu** : aucune image, figure codée
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Traducteur → Lead → Mainteneur »
- **Note** : Réunie avec PVZ-F3 : components/projets/pvz/FigureEquipe.astro. Une scène : les arrivées apparaissent une à une, rejouable au clic.

### PVZ-F5 · Le retard à l’arrivée, par catégorie

- **Priorité** : socle · **Méthode** : FIG, à coder (figure de données), rien à générer
- **Emplacement** : `/projets/pvz-fusion` · § 1, le point de départ _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Le retard à l’arrivée, par catégorie
- **Composition** : Trois barres au 16/10/2025 (plantes, zombies, textes d’interface) : traduit en encre, manquant en hachures, nombres et pourcentages en texte
- **Format** : libre, trois barres horizontales
- **Fichier attendu** : aucune image, figure codée
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Entrées anglaises sans équivalent français, le 16 octobre 2025 »
- **Note** : Codée en HTML : components/projets/pvz/FigureDepart.astro, depuis le premier relevé.

### PVZ-OG · Version simplifiée de PVZ-01

- **Priorité** : élargi · **Méthode** : OG, à composer en HTML puis rendre en PNG
- **Emplacement** : `/projets/pvz-fusion` · Partage _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Version simplifiée de PVZ-01
- **Composition** : Marge de sécurité 10 %
- **Format** : 1200 × 630
- **Fichier attendu** : `site/public/og/PVZ-OG_1200x630.png`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Traduction et équipe »

## League Of Data Base

### LOD-01 · Archive versionnée

- **Priorité** : socle · **Méthode** : IMG, rien à produire, le fichier est celui d’un autre emplacement
- **Emplacement** : `/projets/league-of-database` · Hub, partage _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Archive versionnée
- **Composition** : Voir PRJ-02
- **Format** : 16:10, 1:1, 1200 × 630
- **Fichier attendu** : aucun, reprend `PRJ-02`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Archive versionnée »

### LOD-02 · Le voyage dans le temps

- **Priorité** : élargi · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/projets/league-of-database` · § 1, fond _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Le voyage dans le temps
- **Composition** : Sablier stylisé dont le sable est fait de petits signes, très clair, vide à droite pour le tableau
- **Format** : 21:9, faible contraste
- **Fichier attendu** : `site/src/assets/visuels/league-of-database/LOD-02_2100x900.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Le voyage dans le temps »

### LOD-03 · Les pièges de la donnée

- **Priorité** : socle · **Méthode** : SVG, à dessiner (vectoriel)
- **Emplacement** : `/projets/league-of-database` · § 4, une icône par piège (5) _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Les pièges de la donnée
- **Composition** : (a) page de données trouée ; (b) bulle de langue qui renvoie vers une bulle « par défaut » ; (c) deux objets jumeaux reliés par un fil ; (d) pellicule sans date ; (e) éclair qui ne laisse pas de trace
- **Format** : 5 × 1:1, grille 48
- **Fichier attendu** : `site/src/assets/visuels/league-of-database/LOD-03.svg` (lot de 5)
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif

### LOD-04 · Changer de moteur sans perdre personne

- **Priorité** : socle · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/projets/league-of-database` · § 5, en tête _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Changer de moteur sans perdre personne
- **Composition** : Coupe d’un train : moteur ancien à trois engrenages remplacé par un moteur à deux engrenages pendant que des voyageurs restent assis
- **Format** : 16:9, 1600 × 900
- **Fichier attendu** : `site/src/assets/visuels/league-of-database/LOD-04_1600x900.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Changer de moteur sans perdre personne »

### LOD-05 · Quatre jalons

- **Priorité** : élargi · **Méthode** : SVG, à dessiner (vectoriel)
- **Emplacement** : `/projets/league-of-database` · § 5, frise _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Quatre jalons
- **Composition** : Brouillon, carnet de décisions, balance, porte qui s’ouvre
- **Format** : 4 × 1:1 ou bande 4:1
- **Fichier attendu** : `site/src/assets/visuels/league-of-database/LOD-05.svg` (lot de 4)
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif

### LOD-F1 · Ahri 2013 / 2026

- **Priorité** : socle · **Méthode** : FIG, à coder (figure de données), rien à générer
- **Emplacement** : `/projets/league-of-database` · § 1 _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Ahri 2013 / 2026
- **Composition** : Tableau HTML côte à côte, une ligne surlignée
- **Format** : —
- **Fichier attendu** : aucune image, figure codée
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Ahri en 2013 et en 2026, côte à côte »

### LOD-F2 · Le trafic

- **Priorité** : élargi · **Méthode** : FIG, à coder (figure de données), rien à générer
- **Emplacement** : `/projets/league-of-database` · § 6 _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Le trafic
- **Composition** : Schéma simplifié : cache du patch actuel, cache des archives, préparation d’un nouveau patch
- **Format** : 16:9
- **Fichier attendu** : aucune image, figure codée
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Le trafic »

## Omnicard

### OMN-01 · Du papier au jeu en ligne

- **Priorité** : socle · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/projets/omnicard` · En-tête (et PRJ-03) _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Du papier au jeu en ligne
- **Composition** : Une carte plastifiée à la main (pochette visible, coin corné) à cheval sur le bord d’une fenêtre de navigateur, où elle devient numérique ; face générique (cadre, losange, pastilles de coût et de stats sans chiffres)
- **Format** : 4:3, 1600 × 1200 ; 1:1 mobile (recadrage mobile 1:1)
- **Fichier attendu** : `site/src/assets/visuels/omnicard/OMN-01_1600x1200.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Du papier au jeu en ligne »

### OMN-02 · Les éditions sans fin

- **Priorité** : socle · **Méthode** : IMG, rien à produire, le fichier est celui d’un autre emplacement
- **Emplacement** : `/projets/omnicard` · § 2 _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Les éditions sans fin
- **Composition** : Même fichier qu’ACC-04
- **Format** : 3:2
- **Fichier attendu** : aucun, reprend `ACC-04`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Les éditions sans fin »

### OMN-03 · Le plateau, en schéma

- **Priorité** : socle · **Méthode** : SVG, à dessiner (vectoriel)
- **Emplacement** : `/projets/omnicard` · § 4, repli si la capture manque _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Le plateau, en schéma
- **Composition** : Deux lignes, points de vie, énergie et cristaux, main ; présenté comme un schéma, jamais comme une capture
- **Format** : 16:10
- **Fichier attendu** : `site/src/assets/visuels/omnicard/OMN-03.svg`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Le plateau, en schéma »

### OMN-04 · Le serveur arbitre

- **Priorité** : socle · **Méthode** : SVG, à dessiner (vectoriel)
- **Emplacement** : `/projets/omnicard` · § 6 _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Le serveur arbitre
- **Composition** : Deux navigateurs et un œil (spectateur) reliés à un serveur central ; flèches « intention » vers le serveur, « ta vue » vers chacun ; la main adverse en dos de cartes ; trois états livrés en calques
- **Format** : 16:9, 1600 × 900
- **Fichier attendu** : `site/src/assets/visuels/omnicard/OMN-04.svg`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Le serveur arbitre »

### OMN-05 · Le compte à rebours

- **Priorité** : élargi · **Méthode** : SVG, à dessiner (vectoriel)
- **Emplacement** : `/projets/omnicard` · § 5 _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Le compte à rebours
- **Composition** : Carte de face, cinq encoches au bord droit alternant deux tons (lanceur, adversaire)
- **Format** : 1:1, 600
- **Fichier attendu** : `site/src/assets/visuels/omnicard/OMN-05.svg`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Le compte à rebours »

### OMN-06 · Annotations de la partie

- **Priorité** : socle · **Méthode** : SVG, à dessiner (vectoriel)
- **Emplacement** : `/projets/omnicard` · § 4, calque _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Annotations de la partie
- **Composition** : Quatre pastilles numérotées et filets de rappel, posés sur CAP-OC-1
- **Format** : format de la capture
- **Fichier attendu** : `site/src/assets/visuels/omnicard/OMN-06.svg`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Quatre annotations numérotées sur la capture d’une partie »
- **Note** : Socle si la capture CAP-OC-1 existe.

### OMN-07 · Du papier au lancement

- **Priorité** : élargi · **Méthode** : FIG, à coder (figure de données), rien à générer
- **Emplacement** : `/projets/omnicard` · § 8 _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Du papier au lancement
- **Composition** : Frise : jeu papier → saison 1 (2025) → première ligne (mars 2026) → lancement (16 mai 2026) → hors ligne, refonte
- **Format** : 5:1
- **Fichier attendu** : aucune image, figure codée
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Du papier au lancement »

### OMN-OG · Carte et engrenage imbriqués

- **Priorité** : élargi · **Méthode** : OG, à composer en HTML puis rendre en PNG
- **Emplacement** : `/projets/omnicard` · Partage _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Carte et engrenage imbriqués
- **Composition** : Centré, beaucoup d’air
- **Format** : 1200 × 630
- **Fichier attendu** : `site/public/og/OMN-OG_1200x630.png`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Une carte et un engrenage imbriqués »

## Bloodborne Legendary Run

### BLR-01 · Quarante trophées, plus de mille objectifs

- **Priorité** : socle · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/projets/bloodborne-legendary-run` · § 1, le problème _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Quarante trophées, plus de mille objectifs
- **Composition** : À gauche, un carnet de cases à cocher qui déborde de la page ; à droite, une petite rangée nette de 40 médailles ; aucune référence visuelle au jeu ni à une console ; la légende est en HTML
- **Format** : 3:2, 1500 × 1000
- **Fichier attendu** : `site/src/assets/visuels/bloodborne/BLR-01_1500x1000.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Quarante trophées, plus de mille objectifs »

### BLR-02 · Déclarer → compiler → dessiner

- **Priorité** : socle · **Méthode** : SVG, à dessiner (vectoriel)
- **Emplacement** : `/projets/bloodborne-legendary-run` · § 3 _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Déclarer → compiler → dessiner
- **Composition** : Trois blocs : une fiche d’« actes » et de « familles » (chaîne, gerbe), une flèche « script », un arbre propre à racine unique
- **Format** : 16:9 ; 4:5 mobile (recadrage mobile 4:5)
- **Fichier attendu** : `site/src/assets/visuels/bloodborne/BLR-02.svg`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Déclarer → compiler → dessiner »

### BLR-03 · Du wiki à la fiche française

- **Priorité** : élargi · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/projets/bloodborne-legendary-run` · § 4 _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Du wiki à la fiche française
- **Composition** : Quatre vignettes reliées : page source → tableau → dictionnaire bilingue → fiche ; une loupe sur une cellule vide qui reste un tiret
- **Format** : 16:9
- **Fichier attendu** : `site/src/assets/visuels/bloodborne/BLR-03_1600x900.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Du wiki à la fiche française »

### BLR-04 · Une réussite, une étoile

- **Priorité** : socle · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/projets/bloodborne-legendary-run` · § 2, poster de repli _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Une réussite, une étoile
- **Composition** : Une étoile au bout d’un doigt, anneau de progression aux trois quarts
- **Format** : 1:1, 800
- **Fichier attendu** : `site/src/assets/visuels/bloodborne/BLR-04_800x800.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Une réussite, une étoile »

### BLR-05 · Un ciel dans la main

- **Priorité** : élargi · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/projets/bloodborne-legendary-run` · Hub (si les captures ne suffisent pas) _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Un ciel dans la main
- **Composition** : Téléphone stylisé affichant une constellation, le pouce sur une étoile
- **Format** : 4:5, 960 × 1200
- **Fichier attendu** : `site/src/assets/visuels/bloodborne/BLR-05_960x1200.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Un ciel dans la main »

### BLR-F1 · Les 22 galaxies réelles

- **Priorité** : socle · **Méthode** : FIG, à coder (figure de données), rien à générer
- **Emplacement** : `/projets/bloodborne-legendary-run` · § 3 _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Les 22 galaxies réelles
- **Composition** : Planche des 22 silhouettes dessinées depuis constellation.json (poses et traits), nom et nombre d’étoiles en HTML
- **Format** : 16:9 ; 3:4 mobile (recadrage mobile 3:4)
- **Fichier attendu** : aucune image, figure codée
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Les 22 galaxies réelles »

### BLR-OG · Trois silhouettes de galaxies

- **Priorité** : élargi · **Méthode** : OG, à composer en HTML puis rendre en PNG
- **Emplacement** : `/projets/bloodborne-legendary-run` · Partage _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Trois silhouettes de galaxies
- **Composition** : Titre à gauche, galaxies à droite
- **Format** : 1200 × 630
- **Fichier attendu** : `site/public/og/BLR-OG_1200x630.png`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Trois silhouettes de galaxies »

## gup

### GUP-01 · Dispersé, puis un seul geste

- **Priorité** : élargi · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/projets/gup` · § 1, le problème : sous les deux paragraphes, à gauche de la figure des commandes (GUP-F1) ; 320 px de large sur ordinateur, masqué sous 860 px _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Dispersé, puis un seul geste
- **Composition** : Une douzaine de petites machines toutes différentes, chacune avec sa propre commande, reliées par des fils emmêlés qui convergent vers une seule boîte nette à flèche circulaire, éclairée par une lanterne
- **Format** : 4:3, 1200 × 900
- **Fichier attendu** : `site/src/assets/visuels/gup/GUP-01_1200x900.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Une douzaine de petites machines dont les fils emmêlés convergent vers une seule boîte éclairée par une lanterne. »
- **Note** : Posé dans le slot « texte » de la section « probleme » de pages/projets/gup.astro. La figure des commandes (GUP-F1) porte le fait ; l’image ne fait que le faire sentir.

### GUP-02 · Les choix d’ingénierie

- **Priorité** : socle · **Méthode** : SVG, à dessiner (vectoriel)
- **Emplacement** : `/projets/gup` · Comment je l’ai construit : à gauche du titre « Et deux choix de plus », sous les quatre décisions ; 96 px _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Les choix d’ingénierie
- **Composition** : Planche de six pictogrammes de la même main, trait constant, currentColor, un accent lanterne au plus par picto, sans texte : une cloison étanche entre deux compartiments (une panne reste locale) ; une liste d’arguments séparés, sans coquille de shell (aucun shell) ; une clé unique sur un anneau (une seule demande de droits) ; un réveil qui sonne puis s’éteint (rien de résident) ; trois silhouettes génériques d’ordinateurs dont deux grisées en hachures (chaque système voit ses outils) ; un œil devant deux pastilles contrastées (lisible partout). Aucun logo de système d’exploitation.
- **Format** : 6 × 1:1, 96
- **Fichier attendu** : `site/src/assets/visuels/gup/GUP-02.svg` (lot de 6)
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif
- **Note** : Un seul fichier posé à 96 px dans la page (le lot peut être livré en symboles d’un même SVG). Les quatre premiers pictos répondent aux quatre décisions, les deux derniers aux deux choix qui suivent.

### GUP-03 · Une commande, tout mettre à jour

- **Priorité** : élargi · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/projets/gup` · Partage, hub de repli _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Une commande, tout mettre à jour
- **Composition** : Une fenêtre de terminal vide de tout caractère, éclairée par une lanterne, d’où partent des rayons fins vers une douzaine de paquets génériques qui s’allument là où le rayon les touche
- **Format** : 1200 × 630 ; 16:10
- **Fichier attendu** : `site/src/assets/visuels/gup/GUP-03_1600x1000.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Une fenêtre de terminal éclairée par une lanterne, d’où partent des rayons vers des paquets. »
- **Note** : Pas posé dans la page : la carte de la vitrine et l’image de partage montrent d’abord la vraie capture (src/assets/projets/gup/packages-select.webp) ; celle-ci sert de repli.

### GUP-F1 · Les commandes réelles

- **Priorité** : socle · **Méthode** : FIG, à coder (figure de données), rien à générer
- **Emplacement** : `/projets/gup` · § 1, le problème _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Les commandes réelles
- **Composition** : Onze commandes de mise à jour, une par outil, empilées dans une carte, face à gup éclairé
- **Format** : —
- **Fichier attendu** : aucune image, figure codée
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Onze commandes de mise à jour, une par outil, face à la seule commande gup »
- **Note** : Codée en HTML : components/projets/gup/FigureCommandes.astro, données COMMANDES de config/gup.ts.

### GUP-F2 · 153 sources par famille et par système

- **Priorité** : élargi · **Méthode** : FIG, à coder (figure de données), rien à générer
- **Emplacement** : `/projets/gup` · § 4, les règles de 153 outils _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : 153 sources par famille et par système
- **Composition** : Sélecteur Windows, macOS, Linux qui grise en hachures les sources jamais lancées sur ce système ; un carré par source, vingt familles
- **Format** : 16:9
- **Fichier attendu** : aucune image, figure codée
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « 153 sources par famille et par système »
- **Note** : Codée en HTML et CSS, sans script (:has) : components/projets/gup/FigureSources.astro, données config/gup-sources.ts tirées du registre de gup.

### GUP-F3 · Les versions

- **Priorité** : élargi · **Méthode** : FIG, à coder (figure de données), rien à générer
- **Emplacement** : `/projets/gup` · § 5, tenu comme un produit _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Les versions
- **Composition** : Frise à l’échelle du temps des douze versions publiées sur npm, 0.1.0 → 0.5.3
- **Format** : 5:1
- **Fichier attendu** : aucune image, figure codée
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Les versions »
- **Note** : Codée en HTML : components/projets/gup/FigureVersions.astro, données VERSIONS de config/gup.ts (registre npm).

## Parcours : hub, professionnel, compétences, formation

### PAR-PHO · Portrait pensif

- **Priorité** : socle · **Méthode** : PHO, photo réelle, traitements déterministes seulement
- **Emplacement** : `/parcours` · Hub, bandeau d’identité _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Portrait pensif
- **Composition** : Photo réelle n° 3 (main au menton), détourée
- **Format** : 4:5
- **Fichier attendu** : `site/src/assets/visuels/parcours/PAR-PHO_960x1200.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Portrait pensif »
- **Note** : À confirmer.

### PAR-F1 · Mini-frise 2023 → aujourd’hui

- **Priorité** : socle · **Méthode** : FIG, à coder (figure de données), rien à générer
- **Emplacement** : `/parcours` · Hub _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Mini-frise 2023 → aujourd’hui
- **Composition** : Trois couloirs (formation, travail, communauté), segments cliquables
- **Format** : 16:5 ; vertical mobile
- **Fichier attendu** : aucune image, figure codée
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Mini-frise 2023 → aujourd’hui »

### PAR-01 · Concevoir

- **Priorité** : socle · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/parcours` · Hub, porte Professionnel _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Concevoir
- **Composition** : Table à dessin : plan d’architecture déplié, la lanterne posée dessus, sans personnage
- **Format** : 4:3, 1200 × 900
- **Fichier attendu** : `site/src/assets/visuels/parcours/PAR-01_1200x900.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Concevoir »

### PAR-02 · La boîte à outils

- **Priorité** : socle · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/parcours` · Hub, porte Compétences _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : La boîte à outils
- **Composition** : Boîte à outils ouverte, compartiments distincts symbolisant interface, API, données, livraison (formes, pas de mots)
- **Format** : 4:3, 1200 × 900
- **Fichier attendu** : `site/src/assets/visuels/parcours/PAR-02_1200x900.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « La boîte à outils »

### PAR-03 · Ce que j’ai dans mon sac

- **Priorité** : socle · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/parcours` · Hub, porte Formation _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Ce que j’ai dans mon sac
- **Composition** : Pile de livres reliés, diplôme roulé et noué, la lanterne en serre-livre
- **Format** : 4:3, 1200 × 900
- **Fichier attendu** : `site/src/assets/visuels/parcours/PAR-03_1200x900.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Ce que j’ai dans mon sac »

### PRO-F1 · Chronologie

- **Priorité** : socle · **Méthode** : FIG, à coder (figure de données), rien à générer
- **Emplacement** : `/parcours/professionnel` · Professionnel _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Chronologie
- **Composition** : Gantt août 2025 → aujourd’hui, natures en couleurs, fins inconnues en dégradé
- **Format** : 16:6 ; vertical mobile
- **Fichier attendu** : aucune image, figure codée
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Chronologie »

### PRO-01 · Architecture logicielle

- **Priorité** : socle · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/parcours/professionnel` · Professionnel, poste actuel _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Architecture logicielle
- **Composition** : Plan épinglé : blocs, flèches, conteneurs ; aucun élément identifiant l’employeur
- **Format** : 3:2, 900 × 600
- **Fichier attendu** : `site/src/assets/visuels/parcours/PRO-01_900x600.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Architecture logicielle »

### PRO-02 · Former jusqu’au titre

- **Priorité** : socle · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/parcours/professionnel` · Professionnel, Elan _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Former jusqu’au titre
- **Composition** : Tableau blanc avec un schéma front / API / base, chaises alignées, diplômes roulés au premier plan
- **Format** : 3:2
- **Fichier attendu** : `site/src/assets/visuels/parcours/PRO-02_1800x1200.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Former jusqu’au titre »

### PRO-03 · Le pôle

- **Priorité** : socle · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/parcours/professionnel` · Professionnel, PvZ _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Le pôle
- **Composition** : Tableau à colonnes, cartes à fanions de langue génériques, symbole de fusion en coin
- **Format** : 3:2
- **Fichier attendu** : `site/src/assets/visuels/parcours/PRO-03_1800x1200.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Le pôle »

### PRO-04 · Initier au web

- **Priorité** : socle · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/parcours/professionnel` · Professionnel, Mission Locale _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Initier au web
- **Composition** : Table d’atelier, ordinateurs portables ouverts, post-it
- **Format** : 3:2
- **Fichier attendu** : `site/src/assets/visuels/parcours/PRO-04_1800x1200.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Initier au web »

### PRO-05 · −30 %

- **Priorité** : socle · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/parcours/professionnel` · Professionnel, ATIS _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : −30 %
- **Composition** : Formulaire de suivi des temps, sablier dont le sable a diminué d’un tiers
- **Format** : 3:2
- **Fichier attendu** : `site/src/assets/visuels/parcours/PRO-05_1800x1200.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « −30 % »

### PRO-06 · Sur mesure

- **Priorité** : élargi · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/parcours/professionnel` · Professionnel, Dev-Mates (si conservé) _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Sur mesure
- **Composition** : Cahier des charges relié et maquette d’application posés côte à côte
- **Format** : 3:2
- **Fichier attendu** : `site/src/assets/visuels/parcours/PRO-06_1800x1200.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Sur mesure »
- **Note** : À confirmer.

### PRO-07 · Repères des structures

- **Priorité** : élargi · **Méthode** : SVG, à dessiner (vectoriel)
- **Emplacement** : `/parcours/professionnel` · Professionnel _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Repères des structures
- **Composition** : Monogrammes typographiques ; ne pas générer de logos d’organismes
- **Format** : 1:1
- **Fichier attendu** : `site/src/assets/visuels/parcours/PRO-07.svg`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif

### CMP-01 · L’établi

- **Priorité** : élargi · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/parcours/competences` · Compétences, en-tête _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : L’établi
- **Composition** : Établi vu de dessus, outils rangés dans des compartiments, pas d’écran ni de personnage
- **Format** : 21:9, 1600 × 685
- **Fichier attendu** : `site/src/assets/visuels/parcours/CMP-01_1600x685.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « L’établi »

### CMP-F1 · Build-once

- **Priorité** : socle · **Méthode** : FIG, à coder (figure de données), rien à générer
- **Emplacement** : `/parcours/competences` · Compétences, livraison _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Build-once
- **Composition** : Build unique → image scellée → test → promotion des mêmes empreintes
- **Format** : 16:6
- **Fichier attendu** : aucune image, figure codée
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Build-once »

### CMP-02 · Pédagogie

- **Priorité** : socle · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/parcours/competences` · Compétences humaines _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Pédagogie
- **Composition** : Tableau, schéma en trois étapes, craie posée
- **Format** : 1:1, 480
- **Fichier attendu** : `site/src/assets/visuels/parcours/CMP-02_480x480.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Pédagogie »

### CMP-03 · Coordination

- **Priorité** : socle · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/parcours/competences` · Idem _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Coordination
- **Composition** : Tableau de tâches à colonnes, cartes déplacées par des flèches
- **Format** : 1:1, 480
- **Fichier attendu** : `site/src/assets/visuels/parcours/CMP-03_480x480.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Coordination »

### CMP-04 · Écoute

- **Priorité** : socle · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/parcours/competences` · Idem _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Écoute
- **Composition** : Cahier des charges annoté de points d’interrogation dans la marge
- **Format** : 1:1, 480
- **Fichier attendu** : `site/src/assets/visuels/parcours/CMP-04_480x480.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Écoute »

### CMP-05 · Communication

- **Priorité** : socle · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/parcours/competences` · Idem _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Communication
- **Composition** : Deux bulles de dialogue qui se répondent, la lanterne entre elles
- **Format** : 1:1, 480
- **Fichier attendu** : `site/src/assets/visuels/parcours/CMP-05_480x480.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Communication »

### CMP-06 · Créativité

- **Priorité** : socle · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/parcours/competences` · Idem _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Créativité
- **Composition** : Une carte retournée à contre-courant au milieu d’un éventail de cartes identiques
- **Format** : 1:1, 480
- **Fichier attendu** : `site/src/assets/visuels/parcours/CMP-06_480x480.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Créativité »

### CMP-07 · Adaptation

- **Priorité** : socle · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/parcours/competences` · Idem _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Adaptation
- **Composition** : Boucle tester → ajuster dessinée en ruban de Möbius
- **Format** : 1:1, 480
- **Fichier attendu** : `site/src/assets/visuels/parcours/CMP-07_480x480.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Adaptation »

### CMP-08 · Méthodes de travail

- **Priorité** : socle · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/parcours/competences` · Idem _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Méthodes de travail
- **Composition** : Tableau Kanban et document relié
- **Format** : 1:1, 480
- **Fichier attendu** : `site/src/assets/visuels/parcours/CMP-08_480x480.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Méthodes de travail »

### CMP-09 · Trois capacités

- **Priorité** : élargi · **Méthode** : SVG, à dessiner (vectoriel)
- **Emplacement** : `/parcours/competences` · Compétences, IA _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Trois capacités
- **Composition** : Assistants et agents, connecteur MCP (prise), synthèse vocale (onde)
- **Format** : 3 × 1:1, 48
- **Fichier attendu** : `site/src/assets/visuels/parcours/CMP-09.svg` (lot de 3)
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif

### CMP-10 · Claude, Codex, Kokoro, Piper, Photino.NET, SQLx, OpenTUI, Dompdf

- **Priorité** : socle · **Méthode** : SVG, à dessiner (vectoriel)
- **Emplacement** : `/parcours/competences` · Compétences, logos manquants _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Claude, Codex, Kokoro, Piper, Photino.NET, SQLx, OpenTUI, Dompdf
- **Composition** : Chercher d’abord les logos officiels ; à défaut, picto dans le style des logos (aplat)
- **Format** : 1:1
- **Fichier attendu** : `site/src/assets/visuels/parcours/CMP-10.svg` (lot de 8)
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif
- **Note** : Chercher d’abord les logos officiels ; à défaut, un picto dans le style des logos.

### FOR-01 · Une application web

- **Priorité** : socle · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/parcours/formation` · Formation, titre DWWM _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Une application web
- **Composition** : Application en perspective : maquette responsive, composant d’API, base de données
- **Format** : 16:9, 1400 × 788
- **Fichier attendu** : `site/src/assets/visuels/parcours/FOR-01_1400x788.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Une application web »

### FOR-02 · Les quatre cinquièmes

- **Priorité** : socle · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/parcours/formation` · Formation, CDA _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Les quatre cinquièmes
- **Composition** : Plan d’application rempli aux quatre cinquièmes, dernière zone en pointillés
- **Format** : 3:2, 600 × 400
- **Fichier attendu** : `site/src/assets/visuels/parcours/FOR-02_600x400.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Les quatre cinquièmes »

### FOR-03 · Autodidacte vers 13 ans

- **Priorité** : socle · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/parcours/formation` · Formation, station _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Autodidacte vers 13 ans
- **Composition** : Livre ouvert sur un listing illisible, la lanterne
- **Format** : 1:1, 384
- **Fichier attendu** : `site/src/assets/visuels/parcours/FOR-03_384x384.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Autodidacte vers 13 ans »

### FOR-04 · BUT Informatique

- **Priorité** : socle · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/parcours/formation` · Formation, station _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : BUT Informatique
- **Composition** : Code et organigramme d’algorithme
- **Format** : 1:1, 384
- **Fichier attendu** : `site/src/assets/visuels/parcours/FOR-04_384x384.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « BUT Informatique »

### FOR-05 · Physique-chimie

- **Priorité** : socle · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/parcours/formation` · Formation, station _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Physique-chimie
- **Composition** : Verrerie de laboratoire et atome
- **Format** : 1:1, 384
- **Fichier attendu** : `site/src/assets/visuels/parcours/FOR-05_384x384.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Physique-chimie »

### FOR-06 · BUT Réseaux & Télécoms

- **Priorité** : socle · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/parcours/formation` · Formation, station _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : BUT Réseaux & Télécoms
- **Composition** : Routeur, commutateur, trois postes
- **Format** : 1:1, 384
- **Fichier attendu** : `site/src/assets/visuels/parcours/FOR-06_384x384.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « BUT Réseaux & Télécoms »

### FOR-07 · Un terminal et un chronomètre, avec une échelle de piscine en clin d’œil

- **Priorité** : socle · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/parcours/formation` · Formation, station _(contexte : ne pas le recopier dans un prompt)_
- **Sujet pour le prompt** : Un terminal et un chronomètre, avec une échelle de piscine en clin d’œil
- **Composition** : Terminal et chronomètre, avec une échelle de piscine en clin d’œil ; sans le logo de l’école
- **Format** : 1:1, 384
- **Fichier attendu** : `site/src/assets/visuels/parcours/FOR-07_384x384.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Piscine de 42 »

### FOR-08 · Domaines

- **Priorité** : élargi · **Méthode** : SVG, à dessiner (vectoriel)
- **Emplacement** : `/parcours/formation` · Formation, certifications _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Domaines
- **Composition** : Web/JS, Python, API et données, C#, anglais
- **Format** : 5 × 1:1, 48
- **Fichier attendu** : `site/src/assets/visuels/parcours/FOR-08.svg` (lot de 5)
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif

## Contact

### CON-PHO · Portrait

- **Priorité** : socle · **Méthode** : PHO, photo réelle, traitements déterministes seulement
- **Emplacement** : `/contact` · Contact, colonne gauche _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Portrait
- **Composition** : Photo réelle n° 2 (friche), cadrage buste
- **Format** : 4:5, 800 × 1000
- **Fichier attendu** : `site/src/assets/visuels/contact/CON-PHO_800x1000.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Portrait »
- **Note** : À confirmer.

### CON-01 · L’invitation

- **Priorité** : socle · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/contact` · Contact, signe de la page _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : L’invitation
- **Composition** : Enveloppe ouverte d’où s’échappe la lumière de la lanterne
- **Format** : 1:1, 480
- **Fichier attendu** : `site/src/assets/visuels/contact/CON-01_480x480.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « L’invitation »

### CON-02 · Message reçu

- **Priorité** : socle · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/contact` · Contact, réussite _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Message reçu
- **Composition** : Lanterne allumée posée sur une lettre cachetée
- **Format** : 1:1, 360
- **Fichier attendu** : `site/src/assets/visuels/contact/CON-02_360x360.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Message reçu »

### CON-03 · Patience

- **Priorité** : élargi · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/contact` · Contact, erreur ou limite de débit _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Patience
- **Composition** : Lanterne à flamme basse à côté d’un petit sablier
- **Format** : 1:1, 360
- **Fichier attendu** : `site/src/assets/visuels/contact/CON-03_360x360.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Patience »

## Blog

### BLG-01 · Les pages à écrire

- **Priorité** : socle · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/blog` · Blog vide _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Les pages à écrire
- **Composition** : Le livre du logo ouvert sur des pages blanches, la lanterne éclaire la première page, un crayon posé
- **Format** : 4:3, 960 × 720
- **Fichier attendu** : `site/src/assets/visuels/blog/BLG-01_960x720.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Les pages à écrire »

### BLG-02 · Couverture de secours

- **Priorité** : élargi · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/blog` · Article sans image, partage _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Couverture de secours
- **Composition** : Motif de la direction + lanterne
- **Format** : 16:9, 1600 × 900 ; 1200 × 630
- **Fichier attendu** : `site/src/assets/visuels/blog/BLG-02_1600x900.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Couverture de secours »

## États : 404 et hors ligne

### ERR-01 · La page qui manque

- **Priorité** : socle · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/404` · 404 _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : La page qui manque
- **Composition** : Un manuel ouvert dont une page a été arrachée (bord déchiré), la lanterne éclaire le vide (reprend ETA-01)
- **Format** : 4:3, 1280 × 960
- **Fichier attendu** : `site/src/assets/visuels/etats/ERR-01_1280x960.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « La page qui manque »
- **Note** : Reprend ETA-01 de docs/assets-a-generer.md.

### ERR-02 · La lanterne éteinte

- **Priorité** : élargi · **Méthode** : SVG, à dessiner (vectoriel)
- **Emplacement** : toutes les pages · Maintenance, hors ligne _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : La lanterne éteinte
- **Composition** : Lanterne seule, flamme absente
- **Format** : 1:1
- **Fichier attendu** : `site/src/assets/visuels/etats/ERR-02.svg`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif
