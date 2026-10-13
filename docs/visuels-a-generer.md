# Visuels à générer — commande de production

> **Fichier généré** depuis `site/src/config/visuels.ts` par `npm run visuels:doc` (dans `site/`). Ne pas le corriger ici : corriger le registre, puis relancer la commande. `npm run visuels` liste ce qu’il reste à produire.

## La mission

Tu produis les visuels de la refonte du portfolio de Charles Lindecker. Le registre recense **153 emplacements** (103 « socle », 50 « élargi »). Pour chaque fiche ci-dessous, livre le **fichier attendu**, au chemin indiqué, en respectant le sujet, la composition et le format. Les règles communes valent pour toutes les fiches.

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
| Accueil | 23 | 18 | IMG 15 · SVG 3 · FIG 3 · CAP 1 · PHO 1 · OG 0 |
| Projets (hub) | 12 | 5 | IMG 10 · SVG 0 · FIG 0 · CAP 2 · PHO 0 · OG 0 |
| PvZ Fusion | 20 | 16 | IMG 13 · SVG 0 · FIG 6 · CAP 0 · PHO 0 · OG 1 |
| League Of Data Base | 18 | 9 | IMG 3 · SVG 9 · FIG 6 · CAP 0 · PHO 0 · OG 0 |
| Omnicard | 9 | 5 | IMG 2 · SVG 2 · FIG 3 · CAP 1 · PHO 0 · OG 1 |
| Bloodborne Legendary Run | 12 | 9 | IMG 4 · SVG 6 · FIG 1 · CAP 0 · PHO 0 · OG 1 |
| gup | 6 | 2 | IMG 2 · SVG 1 · FIG 3 · CAP 0 · PHO 0 · OG 0 |
| Parcours : hub, professionnel, compétences, formation | 32 | 27 | IMG 24 · SVG 4 · FIG 3 · CAP 0 · PHO 1 · OG 0 |
| Contact | 4 | 3 | IMG 3 · SVG 0 · FIG 0 · CAP 0 · PHO 1 · OG 0 |
| Blog | 2 | 1 | IMG 2 · SVG 0 · FIG 0 · CAP 0 · PHO 0 · OG 0 |
| États : 404 et hors ligne | 2 | 1 | IMG 1 · SVG 1 · FIG 0 · CAP 0 · PHO 0 · OG 0 |
| **Total** | **153** | **103** | IMG 81 · SVG 35 · FIG 25 · CAP 4 · PHO 3 · OG 5 |

## File de travail « socle »

Les visuels « socle » à produire ici (IMG, SVG, OG), dans l’ordre des séries. Les emplacements qui reprennent le fichier d’un autre n’y figurent pas.

- **Identité et éléments globaux** : GLO-01 (SVG), GLO-02 (SVG), GLO-03 (SVG), GLO-04 (SVG), GLO-05 (SVG), GLO-06 (SVG), GLO-07 (OG)
- **Accueil** : ACC-03 (IMG), ACC-04 (IMG), ACC-08 (IMG), ACC-09 (IMG), ACC-11 (IMG), ACC-14 (SVG), ACC-17 (SVG), ACC-18 (IMG), ACC-19 (IMG), ACC-20 (IMG), ACC-21 (IMG), ACC-22 (IMG), ACC-23 (IMG)
- **Projets (hub)** : PRJ-01 (IMG), PRJ-02 (IMG)
- **PvZ Fusion** : PVZ-01 (IMG), PVZ-02a (IMG), PVZ-02b (IMG), PVZ-02c (IMG), PVZ-04 (IMG), PVZ-05 (IMG), PVZ-06 (IMG), PVZ-07 (IMG), PVZ-08 (IMG), PVZ-11 (IMG)
- **League Of Data Base** : LOD-03 (SVG), LOD-04 (IMG), LOD-06 (SVG), LOD-07 (SVG), LOD-08 (SVG), LOD-09 (SVG)
- **Omnicard** : OMN-01 (IMG), OMN-04 (SVG), OMN-06 (SVG)
- **Bloodborne Legendary Run** : BLR-01 (IMG), BLR-02 (SVG), BLR-04 (IMG), BLR-06 (SVG), BLR-07 (SVG), BLR-08 (SVG), BLR-09 (SVG), BLR-10 (SVG)
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
- **Emplacement** : `/` · Couverture, à droite de l’accroche ; sur mobile, après le bandeau des preuves _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Portrait de Charles dans le colza
- **Composition** : Photo existante charles-4, en couleur, cadrage vertical 4:5 sur le visage et la chemise bleu roi, sans agrandissement ; la nuit, un voile de lune et une lueur de lanterne posée sur le côté éclairé du visage, en CSS (composant Portrait)
- **Format** : 4:5
- **Fichier attendu** : `site/src/assets/photos/charles-4.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Charles Lindecker, chemise bleu roi, dans un champ de colza en fleur. »
- **Note** : Existe : photo charles-4, jamais régénérée. Lueur de nuit centrée sur la joue éclairée (54 % de la largeur, 39 % de la hauteur du cadre 4:5).

### ACC-02 · Trois pictos des verbes

- **Priorité** : socle · **Méthode** : SVG, rien à produire, le fichier est celui d’un autre emplacement
- **Emplacement** : `/` · Couverture, bandeau des preuves _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Trois pictos des verbes
- **Composition** : Voir GLO-04
- **Format** : —
- **Fichier attendu** : aucun, reprend `GLO-04`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif
- **Note** : En attendant GLO-04, trois pictos au trait, repris de la maquette « Lanterne », sont dessinés dans le bandeau (components/accueil/BandeauPreuves.astro).

### ACC-03 · Démonter de vieux PC avec son père

- **Priorité** : socle · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/` · 01, le terrain de jeu : scène « Un vieux PC, en vue éclatée », rejouable au clic _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Démonter de vieux PC avec son père
- **Composition** : Établi d’atelier vu de trois quarts, en léger surplomb : une vieille tour de PC ouverte au centre ; son panneau latéral, la carte mère, le disque dur et deux vis sortis et disposés en vue éclatée, chacun relié à sa place par un fin pointillé de montage ; deux paires de mains, celles d’un adulte et celles d’un enfant d’une dizaine d’années, tiennent chacune une pièce ; une lanterne posée sur l’établi, à gauche (vers 28 % de la largeur et 58 % de la hauteur), seule source de lumière, éclaire les pièces ; le fond de l’atelier reste dans l’ombre ; aucune marque, aucune inscription, aucun visage
- **Format** : 3:2, 1800 × 1200
- **Fichier attendu** : `site/src/assets/visuels/accueil/ACC-03_1800x1200.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Une vieille tour de PC démontée sur un établi, ses pièces en vue éclatée, tenues par un adulte et un enfant. »
- **Note** : Scène animée : la lumière part de la lanterne, à l’endroit indiqué, à l’arrivée de la scène puis à chaque clic (components/accueil/Scene.astro). Remplace le dessin au trait de l’ancienne direction, dont elle reprend les pièces.

### ACC-04 · Le jeu de cartes papier inventé avec son cousin

- **Priorité** : socle · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/` · 01, le terrain de jeu : scène « Les cartes, plastifiées à la main », rejouable au clic (et Omnicard § 2) _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Le jeu de cartes papier inventé avec son cousin
- **Composition** : Table d’après-midi d’été vue de dessus : piles de cartes imprimées, une plastifieuse d’où sort une carte glissée dans sa pochette transparente, ciseaux, cartes déjà plastifiées aux coins cornés, une feuille de règles griffonnée illisible ; deux paires de mains d’adolescents, l’une glisse une carte dans la plastifieuse, l’autre en découpe une ; une lanterne posée en haut à droite de la table (vers 78 % de la largeur et 26 % de la hauteur) éclaire la carte qui sort ; faces de cartes génériques, faites de formes simples, sans personnage, sans chiffre, sans texte
- **Format** : 3:2, 1800 × 1200
- **Fichier attendu** : `site/src/assets/visuels/accueil/ACC-04_1800x1200.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Des mains d’adolescents plastifient à la main des cartes imprimées, sur une table d’été. »
- **Note** : Scène animée de l’accueil, comme ACC-03 ; même image reprise par OMN-02.

### ACC-05 · Apprendre le C, pour passer ensuite au C++ et coder des jeux

- **Priorité** : élargi · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/` · 01, vers 13 ans _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Apprendre le C, pour passer ensuite au C++ et coder des jeux
- **Composition** : Vieux PC allumé dans une chambre d’adolescent, tutoriel de programmation ouvert, listing illisible, croquis de niveau de jeu épinglé au mur (sans manette de marque)
- **Format** : 4:3, 1600 × 1200
- **Fichier attendu** : `site/src/assets/visuels/accueil/ACC-05_1600x1200.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Apprendre le C pour coder des jeux »

### ACC-06 · Le plafond puis le saut

- **Priorité** : socle · **Méthode** : FIG, à coder (figure de données), rien à générer
- **Emplacement** : `/` · 01, Gwent _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Le plafond puis le saut
- **Composition** : Figure existante FigurePlafond.astro, agrandie, sans « Fig. 1 » : courbe à l’encre tracée à l’arrivée, plateau de quatre mois grisé, percée au laiton le jour et à la lanterne la nuit ; se rejoue au clic
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
- **Emplacement** : `/` · 01, les portes : scène « Des voies essayées, puis une réorientation », rejouable au clic ; intitulés des cinq portes en HTML dessous _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Les portes qui ne s’ouvrent pas
- **Composition** : Un mur vu de face, droit, sans perspective : cinq portes alignées de gauche à droite, chacune au centre de son cinquième de la largeur ; les quatre premières, de formes et d’époques différentes, restent fermées ; la cinquième, à droite, est entrouverte et laisse passer la lumière d’une lanterne posée derrière elle (vers 90 % de la largeur et 52 % de la hauteur), qui s’étale sur le sol ; aucune inscription ni plaque, les intitulés sont en HTML sous chaque porte
- **Format** : 21:9, 2100 × 900
- **Fichier attendu** : `site/src/assets/visuels/accueil/ACC-08_2100x900.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Cinq portes alignées : quatre restent fermées, la cinquième s’entrouvre sur la lumière. »
- **Note** : Même cadrage 21:9 sur mobile, qui garde les cinq portes alignées sur leurs intitulés (le recadrage 4:5 du cahier les coupait). Scène animée de l’accueil, comme ACC-03.

### ACC-09 · Le programme parcouru au pas de course

- **Priorité** : socle · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/` · 01, la voie qui marche : scène « Un mois pour parcourir le programme DWWM », rejouable au clic _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Le programme parcouru au pas de course
- **Composition** : Composition validée le 2026-10-08 : un grand chronomètre posé au-dessus de trois grands dossiers empilés en perspective, ses aiguilles presque revenues à leur point de départ ; devant, un rouleau de diplôme noué d’un ruban et scellé ; une lanterne à gauche (vers 22 % de la largeur et 40 % de la hauteur) éclaire le rouleau ; cadran sans chiffre, dossiers sans inscription ; affichée recadrée en 2:1 au centre sur ordinateur (la bande centrale de 1600 × 800) : tout le sujet et la lanterne tiennent dans cette bande, rien d’important dans le sixième du haut ni dans le sixième du bas ; entière, en 4:3, sur mobile
- **Format** : 4:3, 1600 × 1200
- **Fichier attendu** : `site/src/assets/visuels/accueil/ACC-09_1600x1200.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Un chronomètre posé sur trois grands dossiers, devant un rouleau de diplôme noué. »
- **Note** : Scène animée de l’accueil, comme ACC-03. Recadrée en 2:1 au-delà de 860 px (components/accueil/Scene.astro, propriété recadrage), entière en 4:3 en dessous.

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
- **Emplacement** : `/` · 01, de l’autre côté du bureau : scène « Passer de l’apprenant au formateur », rejouable au clic _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : La classe vue depuis le pupitre du formateur
- **Composition** : Une salle de formation vue de trois quarts depuis l’estrade, derrière l’épaule du formateur : au premier plan, le pupitre et la silhouette du formateur, de dos ; devant lui, une dizaine de postes en deux rangées, des apprenants en silhouettes sans visage, penchés sur leurs écrans ; au mur, un tableau couvert d’un schéma de trois blocs reliés (interface, service, base de données) dessiné au trait, sans aucun mot ; une lanterne posée sur le pupitre (vers 30 % de la largeur et 70 % de la hauteur) éclaire la salle depuis l’avant ; affichée recadrée en 2:1 au centre sur ordinateur (la bande centrale de 1600 × 800) : tout le sujet et la lanterne tiennent dans cette bande, rien d’important dans le sixième du haut ni dans le sixième du bas ; entière, en 4:3, sur mobile
- **Format** : 4:3, 1600 × 1200
- **Fichier attendu** : `site/src/assets/visuels/accueil/ACC-11_1600x1200.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Une salle de formation vue depuis le pupitre : une dizaine de postes, un tableau couvert d’un schéma. »
- **Note** : Scène animée de l’accueil, comme ACC-03. Recadrée en 2:1 au-delà de 860 px (components/accueil/Scene.astro, propriété recadrage), entière en 4:3 en dessous.

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
- **Note** : Posées sur l’accueil avec les trois captures réelles existantes, annotées d’une cible, d’une loupe et d’une légende (components/accueil/ProjetsConstruits.astro). Ce fichier composé ne sert plus qu’à une éventuelle image de partage.

### ACC-14 · La flamme qui se transmet

- **Priorité** : socle · **Méthode** : SVG, à dessiner (vectoriel)
- **Emplacement** : `/` · 02, du solo au collectif : scène « Une lanterne allumée en allume d’autres », rejouable au clic _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : La flamme qui se transmet
- **Composition** : Trois lanternes de même modèle posées sur une ligne de sol, la première allumée ; une étincelle part de sa flamme et allume la deuxième, puis la troisième (dessin validé le 2026-10-08) ; trajets en pointillé ; calques séparés (lanternes au trait, lumières, étincelles) que le site anime
- **Format** : 4:3, viewBox 320 × 240
- **Fichier attendu** : `site/src/assets/visuels/accueil/ACC-14.svg`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Trois lanternes : la première, allumée, passe sa flamme à la deuxième, puis à la troisième. »
- **Note** : Livré le 13 octobre 2026 : un seul fichier à calques, inséré dans la page et animé en CSS (components/accueil/SceneLanternes.astro), comme la lanterne de la bascule (GLO-03). Remplace la commande d’image 21:9 du cahier.

### ACC-15 · Les quatre gestes

- **Priorité** : socle · **Méthode** : IMG, rien à produire, le fichier est celui d’un autre emplacement
- **Emplacement** : `/` · 02, du solo au collectif : « Comment j’organise le pôle, en quatre gestes » _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Les quatre gestes
- **Composition** : Réutilise les quatre cartes de gestion de projet de la page PvZ Fusion : organiser (PVZ-05), livrer (PVZ-07), motiver (PVZ-08), remercier (PVZ-11)
- **Format** : 1:1
- **Fichier attendu** : aucun, reprend `PVZ-05`, `PVZ-07`, `PVZ-08`, `PVZ-11`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Les quatre gestes »
- **Note** : Posé en quatre images carrées, en tête de chaque geste, sur toute la largeur de sa colonne : environ 230 px sur ordinateur (quatre colonnes), 160 à 300 px sur tablette et mobile (deux colonnes) (components/accueil/GestesPole.astro), avec les textes de config/pvz-fusion.ts. Les images PVZ-05, 07, 08 et 11 doivent rester lisibles à 160 px.

### ACC-16 · La lanterne posée sur un livre ouvert, un chemin éclairé devant

- **Priorité** : élargi · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/` · 03, conclusion _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : La lanterne posée sur un livre ouvert, un chemin éclairé devant
- **Composition** : Espace libre à droite pour le bouton (reprend ILL-08)
- **Format** : 16:9, 1920 × 1080
- **Fichier attendu** : `site/src/assets/visuels/accueil/ACC-16_1920x1080.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « La lanterne posée sur un livre ouvert, un chemin éclairé devant »
- **Note** : Reprend ILL-08 de docs/assets-a-generer.md.

### ACC-17 · Le système qui communique

- **Priorité** : socle · **Méthode** : SVG, à dessiner (vectoriel)
- **Emplacement** : `/` · 02, aujourd’hui, à côté du métier : scène « Un petit système, en plan », qui communique en boucle tant qu’elle est visible _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Le système qui communique
- **Composition** : Plan d’architecte vu de dessus, de la même main que les lanternes (ACC-14) et le logo : à gauche, une petite lanterne du même modèle, seule source de lumière, qui émet les messages ; au centre, à droite et en haut à droite, trois blocs en plan (murs doubles, cloisons, ouvertures, une porte en arc pointillé), sans aucun pictogramme ni glyphe, une partie de chaque bloc hachurée en réserve ; liaisons à angle droit et chemin de retour en pointillé ; des messages, points de lumière, circulent dans l’ordre requête, données, réponse, livraison ; deux aplats (surface et lanterne) sur le trait d’encre ; calques séparés (trait, aplats, hachures, lumière) que le site anime
- **Format** : 4:3, viewBox 320 × 240
- **Fichier attendu** : `site/src/assets/visuels/accueil/ACC-17.svg`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Un petit système en plan : une lanterne émet des messages de lumière qui traversent trois blocs reliés. »
- **Note** : Livré le 13 octobre 2026, redessiné le même jour : plus de poste « </> », de tour serveur, de cylindre ni de fenêtre cochée, mais des blocs en plan et la lanterne comme source. Animé en boucle en CSS (components/accueil/SceneSysteme.astro) ; la boucle s’arrête hors de l’écran, dans un onglet masqué et en mouvement réduit.

### ACC-18 · Lire le jeu

- **Priorité** : socle · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/` · 01, Gwent, la méthode : carte 1 « Lire le jeu », illustration dans la fenêtre du cadre de carte codé _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Lire le jeu
- **Composition** : Illustration de carte en hauteur : au sommet d’une colline, une silhouette de dos, sans visage, observe à la loupe une citadelle et des champs en damier en contrebas ; quelques repères en croix posés sur le paysage ; une lanterne posée à ses pieds (vers 35 % de la largeur et 72 % de la hauteur) éclaire la lentille ; ciel de nuit calme ; rien d’important dans les 8 % du bord, que recouvre le cadre de carte ; aucune carte, aucun personnage, aucun symbole ni décor d’un jeu existant
- **Format** : 2:3, 1200 × 1800
- **Fichier attendu** : `site/src/assets/visuels/accueil/ACC-18_1200x1800.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Une silhouette observe une citadelle à la loupe, éclairée par sa lanterne. »
- **Note** : Série de trois cartes (ACC-18 à ACC-20) : même cadrage, même lumière, même main. Le cadre ouvragé, la valeur et le titre restent codés (components/accueil/FigureGwent.astro) ; la lumière part de la lanterne à l’arrivée de la carte puis à chaque clic. Affichée de 165 à 210 px de large (en rangée défilante sur mobile, environ 200 px) : sujet principal au centre, lisible en petit.

### ACC-19 · Tester mes idées

- **Priorité** : socle · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/` · 01, Gwent, la méthode : carte 2 « Tester mes idées », illustration dans la fenêtre du cadre de carte codé _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Tester mes idées
- **Composition** : Illustration de carte en hauteur : sur une table, trois feuilles d’essai qui se chevauchent, la première barrée d’une croix, la deuxième annotée, la troisième en cours et cochée ; une plume qui écrit sur la dernière, un encrier à côté ; une lanterne en haut à droite (vers 70 % de la largeur et 24 % de la hauteur) éclaire la feuille cochée ; rien d’important dans les 8 % du bord ; aucune écriture lisible, aucun symbole d’un jeu existant
- **Format** : 2:3, 1200 × 1800
- **Fichier attendu** : `site/src/assets/visuels/accueil/ACC-19_1200x1800.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Trois feuilles d’essai, la première barrée, la dernière cochée sous la plume. »
- **Note** : Deuxième carte de la série ACC-18 à ACC-20.

### ACC-20 · Prendre le contre-pied

- **Priorité** : socle · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/` · 01, Gwent, la méthode : carte 3 « Prendre le contre-pied », illustration dans la fenêtre du cadre de carte codé _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Prendre le contre-pied
- **Composition** : Illustration de carte en hauteur : un large chemin battu monte vers la droite, vide ; un sentier neuf part à contre-sens vers la gauche, éclairé par une lanterne tenue à bout de bras par une silhouette de dos, sans visage (vers 40 % de la largeur et 46 % de la hauteur) ; arbres en silhouette de part et d’autre, montagne dans l’ombre au fond ; rien d’important dans les 8 % du bord ; aucun symbole d’un jeu existant
- **Format** : 2:3, 1200 × 1800
- **Fichier attendu** : `site/src/assets/visuels/accueil/ACC-20_1200x1800.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Une silhouette éclaire à la lanterne un sentier qui part à contre-sens du chemin battu. »
- **Note** : Troisième carte de la série ACC-18 à ACC-20.

### ACC-21 · Accueillir les nouveaux

- **Priorité** : socle · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/` · 02, du solo au collectif : scène 1 « Accueillir », rejouable au clic _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Accueillir les nouveaux
- **Composition** : Une porte ouverte sur une pièce de travail ; sur le seuil, une silhouette accueille d’un geste de la main une nouvelle venue qui arrive avec un sac en bandoulière ; quelques traces de pas mènent à la porte ; une lanterne accrochée au chambranle (vers 46 % de la largeur et 24 % de la hauteur) éclaire l’arrivante ; silhouettes sans visage, aucune inscription
- **Format** : 3:2, 1800 × 1200
- **Fichier attendu** : `site/src/assets/visuels/accueil/ACC-21_1800x1200.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Une silhouette accueille une nouvelle venue sur le seuil d’une porte éclairée. »
- **Note** : Série de trois scènes (ACC-21 à ACC-23) : même décor et mêmes silhouettes d’une scène à l’autre. Affichées de 300 à 360 px de large (empilées, pleine largeur, sur mobile) : sujet principal au centre, sans détail fin. La lumière part de la lanterne à l’arrivée puis à chaque clic (components/accueil/FigureCollectif.astro).

### ACC-22 · Former et relire

- **Priorité** : socle · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/` · 02, du solo au collectif : scène 2 « Former et relire », rejouable au clic _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Former et relire
- **Composition** : Deux silhouettes côte à côte à une même table, penchées sur une feuille : l’une montre une ligne du doigt, l’autre la corrige au crayon ; une coche dans la marge ; une lanterne posée sur la table, entre elles (vers 50 % de la largeur et 56 % de la hauteur), éclaire la feuille ; silhouettes sans visage, aucune écriture lisible
- **Format** : 3:2, 1800 × 1200
- **Fichier attendu** : `site/src/assets/visuels/accueil/ACC-22_1800x1200.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Deux silhouettes relisent ensemble une feuille ; l’une la corrige au crayon. »
- **Note** : Deuxième scène de la série ACC-21 à ACC-23.

### ACC-23 · Contribuer en autonomie

- **Priorité** : socle · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/` · 02, du solo au collectif : scène 3 « Contribuer en autonomie », rejouable au clic _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Contribuer en autonomie
- **Composition** : Une silhouette seule à son poste, de trois quarts dos, envoie une feuille terminée qui rejoint une petite pile de feuilles cochées sur une étagère ; sa propre lanterne, posée à côté de l’écran (vers 30 % de la largeur et 48 % de la hauteur), est allumée ; silhouette sans visage, écran sans interface lisible
- **Format** : 3:2, 1800 × 1200
- **Fichier attendu** : `site/src/assets/visuels/accueil/ACC-23_1800x1200.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Une silhouette, seule à son poste, envoie une feuille qui rejoint une pile de feuilles cochées. »
- **Note** : Troisième scène de la série ACC-21 à ACC-23.

## Projets (hub)

### PRJ-01 · La traduction comme travail d’équipe

- **Priorité** : socle · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/projets` · Carte PvZ (première, grande) _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : La traduction comme travail d’équipe
- **Composition** : Un tableau de travail mural vu de face, légèrement en plongée, en trois colonnes de fiches épinglées (à faire, en relecture, livré), sans aucune inscription ; quatre ou cinq mains anonymes, aux manches différentes, déplacent chacune une fiche d’une colonne à l’autre ; à droite, une main referme un paquet scellé de fiches qui part vers un grand coffre-dépôt commun, plus large que le tableau ; la lanterne, posée en bas au centre, éclaire la colonne du milieu et laisse le reste dans la pénombre. Tableau et mains au centre du cadre, lisibles recadrés en 4:5
- **Format** : 16:10, 1600 × 1000 ; 4:5 mobile (recadrage mobile 4:5)
- **Fichier attendu** : `site/src/assets/visuels/projets/PRJ-01_1600x1000.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Un tableau de travail en trois colonnes où plusieurs mains déplacent des fiches, et un paquet scellé qui part vers un dépôt commun. »
- **Note** : Sur la vitrine, la carte vedette garde le 16:10 sur mobile pour que son chiffre reste au premier écran : la composition doit se lire entière en 16:10 comme recadrée en 4:5.

### PRJ-02 · Une archive versionnée

- **Priorité** : socle · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/projets` · Carte LoD (et LOD-01) _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Une archive versionnée
- **Composition** : Un registre relié, ouvert sur un pupitre, vu de trois quarts : ses pages sont des couches minces superposées qui s’éventaillent vers la droite comme un éventail de cartes, chacune avec une tranche marquée de simples traits, sans chiffre ni lettre ; un marque-page de tissu glissé loin dans les pages anciennes ; la lanterne, à gauche, éclaire la page marquée, les couches récentes s’estompent dans l’ombre ; aucun personnage. Le registre ouvert, la page marquée et la lanterne tiennent dans le tiers central du cadre : l’image doit rester lisible recadrée en 1:1 (LOD-01) et en portrait 2:3 (carte de la vitrine sur ordinateur)
- **Format** : 16:10 + 1:1 ; portrait 2:3 recadré dans la carte
- **Fichier attendu** : `site/src/assets/visuels/projets/PRJ-02_1600x1000.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Un registre ouvert dont les pages datées s’éventaillent, un marque-page glissé dans les plus anciennes. »
- **Note** : Dans la carte de la vitrine, le visuel remplit tout son panneau : en 16:10 sur mobile, recadré en portrait (environ 300 × 450 px, 2:3) sur ordinateur ; décoratif (alt vide), le nom de la carte dit le reste. Repris en 1:1 par LOD-01 sur la page du projet.

### PRJ-03 · Du papier au jeu en ligne

- **Priorité** : socle · **Méthode** : IMG, rien à produire, le fichier est celui d’un autre emplacement
- **Emplacement** : `/projets` · Carte Omnicard _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Du papier au jeu en ligne
- **Composition** : Recadrage d’OMN-01, sans nouvelle image : la carte plastifiée à la main (pochette visible, coin corné) à cheval sur le bord d’une fenêtre de navigateur, moitié papier, moitié numérique. Le recadrage garde au centre le bord de la fenêtre qui traverse la carte, les deux moitiés de la carte entières et la lumière de la lanterne sur la moitié papier ; il coupe d’abord le fond de la fenêtre et la table. Deux cadres : 16:10 sur mobile, portrait 2:3 (environ 300 × 450 px) sur ordinateur, où la carte, droite, doit tenir entière en hauteur
- **Format** : 16:10 ; portrait 2:3 recadré dans la carte
- **Fichier attendu** : aucun, reprend `OMN-01`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Une carte de jeu plastifiée à la main qui passe le bord d’une fenêtre de navigateur et y devient numérique. »
- **Note** : Si OMN-01 ne laisse pas la carte entière dans le portrait 2:3, demander une variante en 2:3 (1000 × 1500) plutôt qu’un recadrage qui la coupe. Décoratif sur la vitrine (alt vide), le nom de la carte dit le reste.

### PRJ-04 · Le ciel des objectifs

- **Priorité** : socle · **Méthode** : CAP, à capturer (écran réel), rien à générer
- **Emplacement** : `/projets` · Carte Bloodborne _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Le ciel des objectifs
- **Composition** : Capture réelle de l’atlas sur téléphone (écran /fr/sky à 390 × 844, densité 2), montrée entière dans le cadre téléphone (GLO-05) sur ordinateur, coupée sous la première galaxie sur mobile
- **Format** : 9:19,5, 780 × 1688 ; 4:5 mobile (recadrage mobile 4:5)
- **Fichier attendu** : `site/src/assets/projets/bloodborne/atlas.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « L’atlas de Bloodborne Legendary Run sur téléphone : chaque galaxie d’objectifs avec sa progression, et la chasse à reprendre en tête. »
- **Note** : Capture existante du 8 octobre 2026, provenance dans src/assets/projets/README.md. Posée par CadreCapture, pas par Visuel.

### PRJ-05 · La sélection des mises à jour

- **Priorité** : socle · **Méthode** : CAP, à capturer (écran réel), rien à générer
- **Emplacement** : `/projets` · Carte gup _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : La sélection des mises à jour
- **Composition** : Capture réelle de l’écran packages-select en français, déjà fenêtrée, dans le cadre terminal (GLO-05) : les paquets classés par source, une source en échec qui ne bloque pas les autres
- **Format** : ≈ 3:2, 1624 × 1052
- **Fichier attendu** : `site/src/assets/projets/gup-selection.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « gup en français dans un terminal : les mises à jour classées par source, et une source en échec qui ne bloque pas les autres. »
- **Note** : Capture existante (générateur de captures de gup, exécuté en français), provenance dans src/assets/projets/README.md. Posée par CadreCapture, pas par Visuel.

### PRJ-06 · Décider quoi faire d’une branche

- **Priorité** : élargi · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/projets` · « Aussi », GitHealth _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Décider quoi faire d’une branche
- **Composition** : Trois branches d’un même tronc, dessinées comme des rameaux stylisés partant d’une racine commune, chacune terminée par un petit picto de verdict sans texte : un sceau plein (garder), une loupe (revoir), un balai (nettoyer) ; la lanterne, posée au pied du tronc, éclaire la branche à revoir ; fond nu, aucun personnage
- **Format** : 4:3, 1200 × 900
- **Fichier attendu** : `site/src/assets/visuels/projets/PRJ-06_1200x900.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Trois branches d’un même tronc, chacune avec son verdict : garder, revoir ou nettoyer. »
- **Note** : Vignette de la rangée « Aussi » (4:3, environ 300 px de large sur ordinateur) : décorative sur la vitrine, le texte voisin dit la même chose.

### PRJ-07 · Une animation pixel art dans une page

- **Priorité** : élargi · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/projets` · « Aussi », Life Pixel _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Une animation pixel art dans une page
- **Composition** : Une grille de pixel art posée à plat sur une table, une petite mascotte ronde et générique (jamais un personnage connu) dessinée en trois images successives, superposées en pelure d’oignon ; un trait de lumière mène vers une fenêtre de navigateur vide de texte où la même mascotte, plus grande, s’anime ; la lanterne éclaire la grille
- **Format** : 4:3
- **Fichier attendu** : `site/src/assets/visuels/projets/PRJ-07_1600x1200.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Une mascotte en pixel art dessinée image par image, puis animée dans une page web. »
- **Note** : Vignette de la rangée « Aussi » (4:3, environ 300 px de large sur ordinateur) : décorative sur la vitrine, le texte voisin dit la même chose.

### PRJ-08 · Une image, des variantes

- **Priorité** : élargi · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/projets` · « Aussi », img-convertor _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Une image, des variantes
- **Composition** : Une grande image encadrée (un paysage simple) à gauche, d’où partent quatre copies de la même image, de largeurs décroissantes, alignées en escalier vers la droite comme sur des écrans de tailles différentes (grand écran, portable, tablette, téléphone), sans poids ni chiffre ; la lanterne éclaire l’original
- **Format** : 4:3
- **Fichier attendu** : `site/src/assets/visuels/projets/PRJ-08_1600x1200.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Une image et ses quatre déclinaisons, de la plus large à la plus étroite. »
- **Note** : Vignette de la rangée « Aussi » (4:3, environ 300 px de large sur ordinateur) : décorative sur la vitrine, le texte voisin dit la même chose.

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
- **Composition** : Une fenêtre de navigateur vide de texte, vue de face ; un saxophone en surgit à moitié, pavillon vers le haut, comme s’il crevait l’interface ; des notes de musique débordent du cadre et s’envolent ; absurde assumé, même gravure que le reste de la série ; aucun personnage ; la lanterne éclaire le pavillon
- **Format** : 4:3, 1600 × 1200 (comme le reste de la rangée « Aussi »)
- **Fichier attendu** : `site/src/assets/visuels/projets/PRJ-10_1600x1200.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Un saxophone qui surgit d’une fenêtre de navigateur, des notes qui débordent du cadre. »
- **Note** : Vignette de la rangée « Aussi » (4:3, environ 300 px de large sur ordinateur) : décorative sur la vitrine, le texte voisin dit la même chose. Passée de 1:1 à 4:3 pour s’aligner sur les trois autres.

### PRJ-11 · Les portes ouvertes de l’open source

- **Priorité** : élargi · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/projets` · Bloc « Contribuer » _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Les portes ouvertes de l’open source
- **Composition** : Un chemin de pierres plates part du bas à gauche et mène à trois boîtes ouvertes de tailles différentes, posées en ligne (des dépôts) ; une petite lanterne est posée sur chaque couvercle : la première est allumée et seule éclaire la scène, les deux autres attendent qu’on les allume ; de la première boîte dépassent des outils simples (une règle, un pinceau) ; nuit, aucun personnage. Sur mobile, le cadre passe en 3:2 centré sur la première boîte et sa lanterne : le chemin et les deux autres boîtes peuvent sortir du cadre
- **Format** : 3:1, 1800 × 600 (recadrage mobile 3:2)
- **Fichier attendu** : `site/src/assets/visuels/projets/PRJ-11_1800x600.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Un chemin qui mène à trois boîtes ouvertes, une lanterne allumée sur la première, les deux autres prêtes. »
- **Note** : Posé dans l’acte de veille (sombre, jour et nuit) du bloc « Contribuer » : sur ordinateur, au pied de la colonne du titre (environ 530 × 177 px), aligné sur la fin de la liste ; sur mobile, en 3:2 sous la liste. Décoratif, le texte voisin dit la même chose.

### PRJ-12 · La version précédente

- **Priorité** : élargi · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/projets` · Archives (quand elles existent) _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : La version précédente
- **Composition** : Un livre plus ancien sur une étagère à côté du manuel ouvert (reprend ILL-10)
- **Format** : 4:3
- **Fichier attendu** : `site/src/assets/visuels/projets/PRJ-12_1600x1200.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « La version précédente »
- **Note** : Reprend ILL-10 de docs/assets-a-generer.md. À poser dans le volet des projets archivés quand il contiendra un projet : tant qu’il est vide, il reste une simple ligne.

## PvZ Fusion

### PVZ-01 · Traduction et équipe

- **Priorité** : socle · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/projets/pvz-fusion` · En-tête _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Traduction et équipe
- **Composition** : Jardin-plateau en coupe, plantes génériques stylisées ; de petites silhouettes posent des étiquettes ; une seule à gauche, un groupe à droite ; derrière, une pile de fiches qui grossit
- **Format** : 4:3, 1600 × 1200
- **Fichier attendu** : `site/src/assets/visuels/pvz-fusion/PVZ-01_1600x1200.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Un jardin en coupe où de petites silhouettes posent des étiquettes sur des plantes, une seule à gauche, un groupe à droite. »
- **Note** : Posé dans l’en-tête de la page (components/projets/gabarit/EnTeteProjet.astro, slot « visuel ») : 4:3 à toutes les largeurs, à droite du titre au-delà de 1 100 px, centré sous les repères chiffrés en dessous (640 px au plus). Garder le sujet lisible au centre : en mobile, l’image fait 358 × 268 px.

### PVZ-02 · Accueillir, former, faire confiance

- **Priorité** : socle · **Méthode** : IMG, rien à produire, le fichier est celui d’un autre emplacement
- **Emplacement** : `/projets/pvz-fusion` · § 2, l’équipe _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Accueillir, former, faire confiance
- **Composition** : Triptyque en trois fichiers de même main et même décor (PVZ-02a, PVZ-02b, PVZ-02c) : montrer une fiche annotée à une nouvelle venue, la voir travailler, puis la laisser relire seule
- **Format** : 3 × 4:3, juxtaposés en bureau
- **Fichier attendu** : aucun, reprend `PVZ-02a`, `PVZ-02b`, `PVZ-02c`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Trois moments dans le même décor : montrer une fiche annotée à une nouvelle venue, la voir travailler, puis la laisser relire seule. »
- **Note** : Bureau : les trois cases se touchent, sans gouttière, et se lisent comme un seul triptyque ; chacune coiffe son temps (Accueillir, Former et relire, Faire confiance), dont l’intitulé reste en HTML. Sous 860 px, chaque case passe au-dessus de son temps : aucun recadrage ne fait disparaître une case.

### PVZ-02a · Accueillir : montrer la fiche

- **Priorité** : socle · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/projets/pvz-fusion` · § 2, l’équipe, case 1 du triptyque, au-dessus de « Accueillir » _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Accueillir : montrer la fiche
- **Composition** : Une table de travail vue de trois quarts ; à gauche, une silhouette debout tend une fiche annotée à une nouvelle venue assise ; la lanterne posée sur la table éclaire la fiche seule, le reste dans l’ombre. Décor commun aux trois cases : même table, même lanterne, même cadrage, horizon à mi-hauteur
- **Format** : 4:3, 1200 × 900
- **Fichier attendu** : `site/src/assets/visuels/pvz-fusion/PVZ-02a_1200x900.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Une personne montre une fiche annotée à une nouvelle venue, à la lumière d’une lanterne. »
- **Note** : Première case du triptyque PVZ-02 : même main, même décor, même lumière que PVZ-02b et PVZ-02c. Le bord droit se raccorde au bord gauche de PVZ-02b (table continue), sans cadre ni marge.

### PVZ-02b · Former et relire : la voir travailler

- **Priorité** : socle · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/projets/pvz-fusion` · § 2, l’équipe, case 2 du triptyque, au-dessus de « Former et relire » _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Former et relire : la voir travailler
- **Composition** : La même table et la même lanterne ; la nouvelle venue écrit sur la fiche, la silhouette de la case 1 se tient en retrait derrière son épaule et désigne une ligne du doigt ; la lumière tombe sur la main qui écrit
- **Format** : 4:3, 1200 × 900
- **Fichier attendu** : `site/src/assets/visuels/pvz-fusion/PVZ-02b_1200x900.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « La nouvelle venue écrit sur la fiche, accompagnée par la personne qui l’a accueillie. »
- **Note** : Case centrale du triptyque PVZ-02 : se raccorde à PVZ-02a à gauche et à PVZ-02c à droite.

### PVZ-02c · Faire confiance : relire seule

- **Priorité** : socle · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/projets/pvz-fusion` · § 2, l’équipe, case 3 du triptyque, au-dessus de « Faire confiance » _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Faire confiance : relire seule
- **Composition** : La même table et la même lanterne ; la nouvelle venue, seule, relit la fiche d’une troisième personne posée devant elle et la coche ; la chaise de la silhouette de la case 1 est vide ; la lanterne éclaire la fiche relue
- **Format** : 4:3, 1200 × 900
- **Fichier attendu** : `site/src/assets/visuels/pvz-fusion/PVZ-02c_1200x900.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « La nouvelle venue relit seule la fiche d’un autre membre, à la lumière de la lanterne. »
- **Note** : Dernière case du triptyque PVZ-02 : son bord gauche se raccorde à PVZ-02b.

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
- **Composition** : Un seul motif centré : trois cartes vierges épinglées côte à côte ; une main anonyme, en silhouette, en décroche une ; la lanterne, en bas à droite, éclaire la carte prise
- **Format** : 1:1, 480
- **Fichier attendu** : `site/src/assets/visuels/pvz-fusion/PVZ-05_480x480.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Organiser : un tableau commun »
- **Note** : Vignette de carte, affichée à 136 px de large en bureau, 96 px entre 1 101 et 1 240 px et sous 760 px : un seul motif centré, en silhouette, qui occupe au moins 60 % du cadre, sans détail fin. Gravure en réserve sur papier, recolorée par les jetons du thème courant (papier le jour, nuit la nuit). Exception assumée à la règle B8 (320 px au moins) : une vignette de carte, pas une illustration de section, à faire valider par Charles.

### PVZ-06 · Traduire, relire, tester

- **Priorité** : socle · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/projets/pvz-fusion` · § 4, le métier de traducteur, à côté des corrections et de la démonstration _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Traduire, relire, tester
- **Composition** : Un seul motif centré : une plume posée en travers d’une fiche dont une ligne est barrée ; la lanterne, hors champ à droite, éclaire la plume
- **Format** : 1:1, 480
- **Fichier attendu** : `site/src/assets/visuels/pvz-fusion/PVZ-06_480x480.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Traduire, relire, tester »
- **Note** : Vignette de titre, affichée à 96 px de large à toutes les largeurs, à gauche du titre « Traduire, c’est suivre des règles qui changent » : silhouette simple, lisible en petit, sans détail fin. Gravure en réserve sur papier, recolorée par les jetons du thème courant. Exception assumée à la règle B8 (320 px au moins), à faire valider par Charles.

### PVZ-07 · Livrer : une proposition par semaine

- **Priorité** : socle · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/projets/pvz-fusion` · § 3, carte 2 de la semaine type, Livrer (accueil : les quatre gestes) _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Livrer : une proposition par semaine
- **Composition** : Un seul motif centré : un colis scellé, noué d’une ficelle où pendent quelques étiquettes vierges, sans nom ni chiffre ; la lanterne posée à côté éclaire les étiquettes
- **Format** : 1:1, 480
- **Fichier attendu** : `site/src/assets/visuels/pvz-fusion/PVZ-07_480x480.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Livrer : une proposition par semaine »
- **Note** : Vignette de carte, affichée à 136 px de large en bureau, 96 px entre 1 101 et 1 240 px et sous 760 px : un seul motif centré, en silhouette, qui occupe au moins 60 % du cadre, sans détail fin. Gravure en réserve sur papier, recolorée par les jetons du thème courant (papier le jour, nuit la nuit). Exception assumée à la règle B8 (320 px au moins) : une vignette de carte, pas une illustration de section, à faire valider par Charles.

### PVZ-08 · Motiver : le classement de la semaine

- **Priorité** : socle · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/projets/pvz-fusion` · § 3, carte 3 de la semaine type, Motiver (accueil : les quatre gestes) _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Motiver : le classement de la semaine
- **Composition** : Un seul motif centré : un podium vide de trois marches, sans chiffre ni lettre, sous une étoile ; la lanterne posée sur la plus haute marche éclaire l’étoile
- **Format** : 1:1, 480
- **Fichier attendu** : `site/src/assets/visuels/pvz-fusion/PVZ-08_480x480.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Motiver : le classement de la semaine »
- **Note** : Ancienne station « Reconnaître » scindée le 13/10/2026 : le podium ici, la lettre en PVZ-11, pour les quatre cartes conservées de la gestion de projet. Vignette de carte, affichée à 136 px de large en bureau, 96 px entre 1 101 et 1 240 px et sous 760 px : un seul motif centré, en silhouette, qui occupe au moins 60 % du cadre, sans détail fin. Gravure en réserve sur papier, recolorée par les jetons du thème courant (papier le jour, nuit la nuit). Exception assumée à la règle B8 (320 px au moins) : une vignette de carte, pas une illustration de section, à faire valider par Charles.

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
- **Composition** : Un seul motif centré : une lettre pliée, nouée d’un ruban, sans écriture lisible ; la lanterne, juste derrière, éclaire la lettre seule
- **Format** : 1:1, 480
- **Fichier attendu** : `site/src/assets/visuels/pvz-fusion/PVZ-11_480x480.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Remercier : le récapitulatif individuel »
- **Note** : Ajouté le 13/10/2026 : la moitié « lettre » de l’ancienne station PVZ-08, pour la quatrième carte de gestion de projet. Même série, même main que PVZ-05, PVZ-07 et PVZ-08. Vignette de carte, affichée à 136 px de large en bureau, 96 px entre 1 101 et 1 240 px et sous 760 px : un seul motif centré, en silhouette, qui occupe au moins 60 % du cadre, sans détail fin. Gravure en réserve sur papier, recolorée par les jetons du thème courant (papier le jour, nuit la nuit). Exception assumée à la règle B8 (320 px au moins) : une vignette de carte, pas une illustration de section, à faire valider par Charles.

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
- **Note** : Non posé dans la refonte du 13 octobre 2026 : le tableau d’Ahri se lit mieux sur un fond uni. À poser seulement si une version très claire (aplat à moins de 6 % d’opacité) ne gêne pas la lecture.

### LOD-03 · Une donnée qui manque, rangée proprement

- **Priorité** : socle · **Méthode** : SVG, à dessiner (vectoriel)
- **Emplacement** : `/projets/league-of-database` · § « Ce que les données ne disent pas », carte 1 (les runes absentes des anciens patchs) _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Une donnée qui manque, rangée proprement
- **Composition** : Une page de registre vue de face, lignes tracées en réserve ; au milieu, une case découpée laisse voir le vide, et un petit signet posé dans le trou dit que l’absence est notée, pas oubliée. Trait constant, deux aplats (encre, papier), la flamme de la lanterne en point de lumière sur le signet. Aucun texte ni chiffre
- **Format** : 1:1, grille 48, affiché à 96 px
- **Fichier attendu** : `site/src/assets/visuels/league-of-database/LOD-03.svg`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif
- **Note** : Premier des cinq pictos des pièges de la donnée (LOD-03, LOD-06 à LOD-09), dessinés de la même main : grille de 48, trait de 1,75 en currentColor, aucun texte. Posé en tête de la carte, au-dessus de son titre sur ordinateur et à sa gauche sur mobile.

### LOD-04 · Changer de moteur sans perdre personne

- **Priorité** : socle · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/projets/league-of-database` · § « Changer de moteur sans perdre personne », en tête _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Changer de moteur sans perdre personne
- **Composition** : Coupe horizontale d’un train de nuit en gravure en réserve : à gauche, un moteur ancien à trois engrenages de tailles inégales, détaché, posé sur le quai et éteint ; à droite, un moteur neuf à deux engrenages déjà attelé. Au centre, un wagon dont les silhouettes de voyageurs restent assises, sans visage reconnaissable. Une seule lanterne accrochée entre le wagon et le moteur neuf éclaire l’attelage ; le reste reste dans l’ombre. Aucun logo, aucun texte
- **Format** : 16:9, 1600 × 900
- **Fichier attendu** : `site/src/assets/visuels/league-of-database/LOD-04_1600x900.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Un train dont on remplace le moteur pendant que les voyageurs restent assis. »
- **Note** : À côté du texte de la réécriture, au-dessus de la frise LOD-F6 ; 16:9 aussi sur mobile, le sujet (l’attelage éclairé) au centre du cadre.

### LOD-05 · Le premier jet

- **Priorité** : élargi · **Méthode** : SVG, à dessiner (vectoriel)
- **Emplacement** : `/projets/league-of-database` · § « Changer de moteur sans perdre personne », frise LOD-F6, jalon 1 (août 2025, la première version) _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Le premier jet
- **Composition** : Une feuille de brouillon froissée puis dépliée, couverte de traits illisibles, un crayon posé en travers. Trait constant, deux aplats (encre, papier). Aucun texte ni chiffre
- **Format** : 1:1, grille 48, affiché à 96 px
- **Fichier attendu** : `site/src/assets/visuels/league-of-database/LOD-05.svg`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif
- **Note** : Premier des quatre pictos des jalons de la réécriture (LOD-05, LOD-10 à LOD-12), de la main des pictos LOD-03 : grille de 48, trait de 1,75 en currentColor. Le jalon atteint (la bascule, LOD-12) porte seul la lumière de la lanterne.

### LOD-06 · Une langue qui manque renvoie à la langue commune

- **Priorité** : socle · **Méthode** : SVG, à dessiner (vectoriel)
- **Emplacement** : `/projets/league-of-database` · § « Ce que les données ne disent pas », carte 2 (les langues absentes d’une version) _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Une langue qui manque renvoie à la langue commune
- **Composition** : Deux bulles de parole : la première, vide et en pointillé, porte une petite flèche courbe qui la renvoie vers une seconde bulle pleine, plus grande, tracée en trait continu. Aucune lettre, aucun drapeau, aucun texte
- **Format** : 1:1, grille 48, affiché à 96 px
- **Fichier attendu** : `site/src/assets/visuels/league-of-database/LOD-06.svg`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif
- **Note** : Série des pictos des pièges : voir LOD-03.

### LOD-07 · Deux jumeaux reliés

- **Priorité** : socle · **Méthode** : SVG, à dessiner (vectoriel)
- **Emplacement** : `/projets/league-of-database` · § « Ce que les données ne disent pas », carte 3 (les objets en double pour une autre édition du jeu) _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Deux jumeaux reliés
- **Composition** : Deux petits objets identiques (deux gemmes taillées de face), l’un en trait plein, l’autre en trait double, reliés par un fil tendu qui fait une boucle à mi-chemin. Aucun objet de jeu reconnaissable, aucun texte
- **Format** : 1:1, grille 48, affiché à 96 px
- **Fichier attendu** : `site/src/assets/visuels/league-of-database/LOD-07.svg`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif
- **Note** : Série des pictos des pièges : voir LOD-03.

### LOD-08 · Une image sans date

- **Priorité** : socle · **Méthode** : SVG, à dessiner (vectoriel)
- **Emplacement** : `/projets/league-of-database` · § « Ce que les données ne disent pas », carte 4 (les illustrations et vidéos non versionnées) _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Une image sans date
- **Composition** : Une bande de pellicule de trois images vues de face ; l’étiquette de bord, là où une date s’écrirait, est vide et barrée d’un petit trait. Les images restent des rectangles sans sujet. Aucun texte ni chiffre
- **Format** : 1:1, grille 48, affiché à 96 px
- **Fichier attendu** : `site/src/assets/visuels/league-of-database/LOD-08.svg`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif
- **Note** : Série des pictos des pièges : voir LOD-03.

### LOD-09 · Un éclair qui ne laisse pas de trace

- **Priorité** : socle · **Méthode** : SVG, à dessiner (vectoriel)
- **Emplacement** : `/projets/league-of-database` · § « Ce que les données ne disent pas », carte 5 (une erreur passagère n’est jamais enregistrée comme une absence) _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Un éclair qui ne laisse pas de trace
- **Composition** : Un petit éclair qui frappe un registre fermé ; sous l’impact, la couverture reste intacte, sans brûlure ni marque, et le signet du registre (le même que LOD-03) n’a pas bougé. Aucun texte
- **Format** : 1:1, grille 48, affiché à 96 px
- **Fichier attendu** : `site/src/assets/visuels/league-of-database/LOD-09.svg`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif
- **Note** : Série des pictos des pièges : voir LOD-03.

### LOD-10 · Un carnet de décisions

- **Priorité** : élargi · **Méthode** : SVG, à dessiner (vectoriel)
- **Emplacement** : `/projets/league-of-database` · § « Changer de moteur sans perdre personne », frise LOD-F6, jalon 2 (24 septembre 2026, les dix décisions écrites) _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Un carnet de décisions
- **Composition** : Un carnet ouvert vu de trois quarts, dix onglets de couleur unie qui dépassent de la tranche, un ruban marque-page. Pages couvertes de traits illisibles. Aucun texte ni chiffre
- **Format** : 1:1, grille 48, affiché à 96 px
- **Fichier attendu** : `site/src/assets/visuels/league-of-database/LOD-10.svg`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif
- **Note** : Série des pictos des jalons : voir LOD-05.

### LOD-11 · Une balance à l’équilibre

- **Priorité** : élargi · **Méthode** : SVG, à dessiner (vectoriel)
- **Emplacement** : `/projets/league-of-database` · § « Changer de moteur sans perdre personne », frise LOD-F6, jalon 3 (26 septembre 2026, la parité vérifiée) _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Une balance à l’équilibre
- **Composition** : Une balance à deux plateaux parfaitement de niveau ; sur chaque plateau, une même petite pile de feuilles. Le fléau est horizontal. Aucun texte ni chiffre
- **Format** : 1:1, grille 48, affiché à 96 px
- **Fichier attendu** : `site/src/assets/visuels/league-of-database/LOD-11.svg`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif
- **Note** : Série des pictos des jalons : voir LOD-05.

### LOD-12 · Une porte qui s’ouvre sur la lumière

- **Priorité** : élargi · **Méthode** : SVG, à dessiner (vectoriel)
- **Emplacement** : `/projets/league-of-database` · § « Changer de moteur sans perdre personne », frise LOD-F6, jalon 4 (4 octobre 2026, la bascule en production) _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Une porte qui s’ouvre sur la lumière
- **Composition** : Une porte entrouverte vue de face ; par l’ouverture, la lumière de la lanterne trace un trapèze au sol. Seul picto de la série à porter l’aplat de lumière. Aucun texte
- **Format** : 1:1, grille 48, affiché à 96 px
- **Fichier attendu** : `site/src/assets/visuels/league-of-database/LOD-12.svg`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif
- **Note** : Série des pictos des jalons : voir LOD-05.

### LOD-F1 · Ahri, patch 3.6.14 et patch 16.20.1

- **Priorité** : socle · **Méthode** : FIG, à coder (figure de données), rien à générer
- **Emplacement** : `/projets/league-of-database` · § « Ce n’était pas la même Ahri » _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Ahri, patch 3.6.14 et patch 16.20.1
- **Composition** : Tableau HTML côte à côte, une ligne surlignée (les points de vie) ; les deux panneaux de statistiques réels à côté, agrandissables
- **Format** : —
- **Fichier attendu** : aucune image, figure codée
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Ahri au patch 3.6.14 et au patch 16.20.1, côte à côte »
- **Note** : Codée en HTML : components/projets/league/ComparaisonAhri.astro, depuis config/league-of-database.ts (COMPARAISON). Relevés dans docs/matiere-premiere.md.

### LOD-F2 · Le trafic

- **Priorité** : élargi · **Méthode** : FIG, à coder (figure de données), rien à générer
- **Emplacement** : `/projets/league-of-database` · § « En production », le trafic _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Le trafic
- **Composition** : Schéma simplifié : cache du patch actuel, cache des archives, préparation d’un nouveau patch
- **Format** : 16:9
- **Fichier attendu** : aucune image, figure codée
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Le trafic »
- **Note** : Codée en HTML et SVG : components/projets/league/Fabrication.astro (#trafic).

### LOD-F3 · Une copie ailleurs, un retour vérifiable

- **Priorité** : élargi · **Méthode** : FIG, à coder (figure de données), rien à générer
- **Emplacement** : `/projets/league-of-database` · § « En production », les sauvegardes _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Une copie ailleurs, un retour vérifiable
- **Composition** : Chaîne en quatre étapes (base, copie, chiffrement, stockage hors du serveur) séparées par la frontière du serveur, puis le retour : restauration dans une base temporaire et journal des passes
- **Format** : libre, 4:1 sur ordinateur, en pile sur mobile
- **Fichier attendu** : aucune image, figure codée
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « La chaîne des sauvegardes et de la restauration »
- **Note** : Codée en HTML et SVG : components/projets/league/Fabrication.astro (#sauvegardes). Le dispositif est celui du dépôt public ; son activation en production reste à confirmer.

### LOD-F4 · Construire une fois, livrer la même version

- **Priorité** : élargi · **Méthode** : FIG, à coder (figure de données), rien à générer
- **Emplacement** : `/projets/league-of-database` · § « En production », la livraison _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Construire une fois, livrer la même version
- **Composition** : Trois étapes (construire, valider en test, promouvoir en production) portant le même colis de trois images (API, web, serveur web), coché après le test
- **Format** : libre, 3:1 sur ordinateur, en pile sur mobile
- **Fichier attendu** : aucune image, figure codée
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « La livraison des mêmes images, du test à la production »
- **Note** : Codée en HTML : components/projets/league/Fabrication.astro (#livraison), avec les logos de src/assets/stacks/.

### LOD-F5 · Le trajet d’un événement de mesure

- **Priorité** : élargi · **Méthode** : FIG, à coder (figure de données), rien à générer
- **Emplacement** : `/projets/league-of-database` · § « En production », la mesure d’audience _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Le trajet d’un événement de mesure
- **Composition** : Trois étapes : une fiche ouverte (page, langue, patch), un usage mesuré (recherche, partage), le tableau d’audience. Aucun chiffre ni écran simulé
- **Format** : libre, 3:1 sur ordinateur, en pile sur mobile
- **Fichier attendu** : aucune image, figure codée
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Le trajet d’un événement de mesure d’audience »
- **Note** : Codée en HTML et SVG : components/projets/league/Fabrication.astro (#audience). La capture du tableau attend un lien de partage public.

### LOD-F6 · Quatre jalons datés de la réécriture

- **Priorité** : socle · **Méthode** : FIG, à coder (figure de données), rien à générer
- **Emplacement** : `/projets/league-of-database` · § « Changer de moteur sans perdre personne », la frise _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Quatre jalons datés de la réécriture
- **Composition** : Frise horizontale de quatre jalons datés (première version, dix décisions, parité vérifiée, bascule), le dernier marqué à la lanterne ; verticale sur mobile. Pictos LOD-05, LOD-10, LOD-11 et LOD-12
- **Format** : libre, 4:1 sur ordinateur, en pile sur mobile
- **Fichier attendu** : aucune image, figure codée
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « La réécriture en quatre jalons, d’août 2025 au 4 octobre 2026 »
- **Note** : Codée en HTML : components/projets/league/FriseReecriture.astro, depuis config/league-of-database.ts (JALONS).

## Omnicard

### OMN-01 · Du papier au jeu en ligne

- **Priorité** : socle · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/projets/omnicard` · En-tête, à droite du titre (et PRJ-03 sur la vitrine) _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Du papier au jeu en ligne
- **Composition** : Une carte à jouer plastifiée à la main, pochette visible et coin corné, posée à cheval sur le bord d’une fenêtre de navigateur générique : la moitié hors de la fenêtre reste papier (bords de découpe aux ciseaux, reflet du plastique), la moitié dans la fenêtre devient une carte numérique nette. Face générique : cadre, losange central, pastille de coût et deux pastilles de statistiques vides, sans chiffre ni lettre. Sur la table, deux ou trois cartes papier éparses. La lanterne, posée hors champ à gauche, éclaire la carte seule ; la fenêtre et la table restent dans l’ombre. Aucun personnage, aucune illustration de carte reconnaissable, aucun texte
- **Format** : 4:3, 1600 × 1200 ; 1:1 mobile (recadrage mobile 1:1)
- **Fichier attendu** : `site/src/assets/visuels/omnicard/OMN-01_1600x1200.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Une carte plastifiée à la main qui devient numérique en passant dans une fenêtre de navigateur. »
- **Note** : Le recadrage 1:1 mobile garde la carte entière, au centre. Recadré en 16:10 pour la vitrine (PRJ-03) : la carte reste au tiers droit.

### OMN-02 · Les éditions sans fin

- **Priorité** : socle · **Méthode** : IMG, rien à produire, le fichier est celui d’un autre emplacement
- **Emplacement** : `/projets/omnicard` · « Le jeu papier », à côté du récit des éditions _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Les éditions sans fin
- **Composition** : Même fichier qu’ACC-04 : table d’après-midi d’été vue de dessus, piles de cartes imprimées, plastifieuse, ciseaux, cartes en pochettes aux coins cornés, feuille de règles griffonnée illisible, deux paires de mains d’adolescents
- **Format** : 3:2
- **Fichier attendu** : aucun, reprend `ACC-04`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Deux adolescents découpent et plastifient leurs cartes sur une table d’été. »

### OMN-03 · Le plateau, en schéma

- **Priorité** : socle · **Méthode** : FIG, à coder (figure de données), rien à générer
- **Emplacement** : `/projets/omnicard` · « Une partie en trente secondes », à côté du résumé des règles _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Le plateau, en schéma
- **Composition** : Les deux camps face à face : pour chacun, le héros et ses 30 points de vie, deux lignes d’unités, le deck de 40 cartes, la jauge de mana (10 au plus) et les cristaux (5 au plus) ; la main adverse en dos de cartes. Quatre cibles numérotées renvoient à la liste des repères en HTML ; présenté comme un schéma, jamais comme une capture
- **Format** : libre, suit la colonne de la figure
- **Fichier attendu** : aucune image, figure codée
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Schéma du plateau : deux héros à 30 points de vie, deux lignes d’unités chacun, un deck de 40 cartes, la mana et les cristaux. »
- **Note** : Dessinée en HTML et CSS depuis la version joueur des règles du moteur (docs/rules.md du dépôt de présentation), sans image à générer : components/projets/omnicard/PlateauPartie.astro. Repli tant que la capture d’une vraie partie (OMN-08) manque.

### OMN-04 · Le serveur arbitre

- **Priorité** : socle · **Méthode** : SVG, à dessiner (vectoriel)
- **Emplacement** : `/projets/omnicard` · « D’une phrase à une règle », au-dessus du trajet d’une action _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Le serveur arbitre
- **Composition** : Deux fenêtres de navigateur génériques, une à gauche et une à droite, tournées vers un serveur central dessiné comme une table d’arbitre que la lanterne éclaire seule. De chaque fenêtre part une flèche vers le serveur (l’action jouée) ; du serveur repart vers chacune une flèche (l’état de la partie). Dans chaque fenêtre, la main du joueur face visible et la main adverse en dos de cartes, faces génériques sans illustration. Pas de spectateur, aucun texte, aucun logo
- **Format** : 16:9, 1600 × 900
- **Fichier attendu** : `site/src/assets/visuels/omnicard/OMN-04.svg`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Deux navigateurs envoient leurs actions à un serveur qui arbitre et renvoie à chacun l’état de la partie. »
- **Note** : Trait constant, deux aplats au plus, recolorés par les jetons (currentColor) ; les intitulés des trois étapes restent en HTML sous le dessin.

### OMN-05 · Le compte à rebours

- **Priorité** : élargi · **Méthode** : FIG, à coder (figure de données), rien à générer
- **Emplacement** : `/projets/omnicard` · « D’une phrase à une règle », à côté de la carte GitGud _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Le compte à rebours
- **Composition** : La carte GitGud, puis neuf fins de tour en frise qui alternent le lanceur et l’adversaire ; le compteur part de 5 et ne baisse qu’aux fins de tour du lanceur, jusqu’à 0 et l’égalité, à la lanterne. Les fins de tour s’allument une à une à l’arrivée, puis au clic sur la frise
- **Format** : libre, frise de neuf étapes ; en grille sur mobile
- **Fichier attendu** : aucune image, figure codée
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Le compteur de GitGud baisse de 5 à 0 aux seules fins de tour du lanceur : cinq tours sur neuf fins de tour. »
- **Note** : Dessinée en HTML et CSS depuis la carte (docs/cards/wtf.md) et le mot-clé Délai (docs/keywords.md), sans image à générer : components/projets/omnicard/CompteARebours.astro.

### OMN-06 · Annotations de la partie

- **Priorité** : socle · **Méthode** : SVG, à dessiner (vectoriel)
- **Emplacement** : `/projets/omnicard` · « Une partie en trente secondes », calque de la capture OMN-08 _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Annotations de la partie
- **Composition** : Quatre pastilles numérotées et filets de rappel, posés sur la capture d’une vraie partie (OMN-08) : points de vie, deck, mana et cristaux, lignes d’unités
- **Format** : format de la capture
- **Fichier attendu** : `site/src/assets/visuels/omnicard/OMN-06.svg`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Quatre annotations numérotées sur la capture d’une partie »
- **Note** : Socle si la capture OMN-08 existe. Mêmes pastilles que les cibles numérotées des captures annotées (CaptureAnnotee).

### OMN-07 · Du papier au lancement

- **Priorité** : élargi · **Méthode** : FIG, à coder (figure de données), rien à générer
- **Emplacement** : `/projets/omnicard` · « Ce que j’en retiens » _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Du papier au lancement
- **Composition** : Frise : jeu papier → saison 1 → première ligne de code → lancement en ligne → hors ligne, en attente de refonte. Dates à confirmer par Charles avant tout affichage (cahier, Q8)
- **Format** : 5:1
- **Fichier attendu** : aucune image, figure codée
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Du papier au lancement »
- **Note** : Non posée : la date de lancement (16/05/2026, CHANGELOG du dépôt de présentation) attend la validation de Charles.

### OMN-08 · Une partie en cours contre l’ordinateur

- **Priorité** : élargi · **Méthode** : CAP, à capturer (écran réel), rien à générer
- **Emplacement** : `/projets/omnicard` · « Une partie en trente secondes », à la place du schéma OMN-03 quand elle existe _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Une partie en cours contre l’ordinateur
- **Composition** : Capture réelle d’une partie contre l’ordinateur, en cours : les deux héros et leurs points de vie, des unités sur les deux lignes, la main du joueur, la mana et les cristaux visibles. Compte de démonstration, aucune donnée personnelle ni pseudonyme réel à l’écran
- **Format** : 16:10, 1600 × 1000 ; recadrage 4:5 mobile (recadrage mobile 4:5)
- **Fichier attendu** : `site/src/assets/visuels/omnicard/OMN-08_1600x1000.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Une partie d’Omnicard contre l’ordinateur : deux héros, deux lignes d’unités chacun, la main du joueur, la mana et les cristaux. »
- **Note** : Capture à faire par Charles sur la stack locale (cahier § 6.12, CAP-OC-1). Annotée ensuite par OMN-06.

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
- **Emplacement** : `/projets/bloodborne-legendary-run` · § Ranger 1 289 objectifs, sous le texte (colonne de gauche) _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Quarante trophées, plus de mille objectifs
- **Composition** : À gauche, un carnet de cases à cocher qui déborde de la page, la plupart encore vides ; à droite, une petite rangée nette de quarante médailles ; la lanterne posée sur le carnet éclaire la case suivante et laisse le reste dans l’ombre ; aucune référence visuelle au jeu ni à une console ; la légende est en HTML
- **Format** : 3:2, 1500 × 1000
- **Fichier attendu** : `site/src/assets/visuels/bloodborne/BLR-01_1500x1000.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Quarante trophées, plus de mille objectifs »
- **Note** : Posé avec un alt vide : le texte voisin dit la même chose (84 étoiles au premier ciel, dont les 40 trophées PlayStation, journal public du 06/09/2026). Affiché jusqu’à 540 px de large sur ordinateur, pleine largeur sur mobile.

### BLR-02 · Des fiches déclarées à l’arbre dessiné

- **Priorité** : socle · **Méthode** : SVG, à dessiner (vectoriel)
- **Emplacement** : `/projets/bloodborne-legendary-run` · § 3 _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Des fiches déclarées à l’arbre dessiné
- **Composition** : Trois temps de gauche à droite, sans aucun mot ni chiffre : une pile de fiches vierges en éventail, une flèche simple au trait, puis un arbre d’étoiles propre, à racine unique, dont les branches ne se croisent pas ; la lanterne posée sur l’étoile racine, seule source de lumière ; le reste dans la pénombre
- **Format** : 16:9 ; 4:5 mobile (recadrage mobile 4:5)
- **Fichier attendu** : `site/src/assets/visuels/bloodborne/BLR-02.svg`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Une pile de fiches devient, d’un trait, un arbre d’étoiles parti d’une seule racine. »
- **Note** : Non posé sur la page refaite le 13/10/2026 : la compilation des arbres ne figure pas dans le journal public du projet. À poser dans « Ranger 1 289 objectifs » si Charles l’autorise.

### BLR-03 · Du wiki à la fiche française

- **Priorité** : élargi · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/projets/bloodborne-legendary-run` · § 4 _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Du wiki à la fiche française
- **Composition** : Quatre vignettes reliées : page source → tableau → dictionnaire bilingue → fiche ; une loupe sur une cellule vide qui reste un tiret
- **Format** : 16:9
- **Fichier attendu** : `site/src/assets/visuels/bloodborne/BLR-03_1600x900.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Du wiki à la fiche française »
- **Note** : Non posé sur la page refaite le 13/10/2026 (élargi) : la section du guide montre la vraie fiche du Père Gascoigne. Place prévue : sous ses trois repères.

### BLR-04 · Une réussite, une étoile

- **Priorité** : socle · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/projets/bloodborne-legendary-run` · § 2, poster de repli _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Une réussite, une étoile
- **Composition** : Une étoile au bout d’un doigt, anneau de progression aux trois quarts
- **Format** : 1:1, 800
- **Fichier attendu** : `site/src/assets/visuels/bloodborne/BLR-04_800x800.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Une réussite, une étoile »
- **Note** : Non posé pour l’instant : les quatre vidéos ont déjà un poster réel pris au milieu de la cérémonie (public/demos/bloodborne, fichiers -poster.webp), qui reste affiché en mouvement réduit.

### BLR-05 · Un ciel dans la main

- **Priorité** : élargi · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/projets/bloodborne-legendary-run` · Hub (si les captures ne suffisent pas) _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Un ciel dans la main
- **Composition** : Téléphone stylisé affichant une constellation, le pouce sur une étoile
- **Format** : 4:5, 960 × 1200
- **Fichier attendu** : `site/src/assets/visuels/bloodborne/BLR-05_960x1200.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Un ciel dans la main »

### BLR-06 · Le ciel dans un navigateur

- **Priorité** : socle · **Méthode** : SVG, à dessiner (vectoriel)
- **Emplacement** : `/projets/bloodborne-legendary-run` · § L’essayer, carte « Application web » (remplace le dessin au trait bleu de l’ancienne page) _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Le ciel dans un navigateur
- **Composition** : Une fenêtre de navigateur vue de face, sans marque, sans texte ni barre d’adresse lisible ; dans la fenêtre, un petit ciel de quatre étoiles reliées par des traits ; la lanterne posée devant la fenêtre éclaire l’étoile la plus haute, le reste de la scène dans l’ombre ; sujet centré, lisible à 88 px
- **Format** : 1:1, viewBox 120 (affiché de 88 à 120 px)
- **Fichier attendu** : `site/src/assets/visuels/bloodborne/BLR-06.svg`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif
- **Note** : Pendant de BLR-07 : même angle, même trait, même lanterne. Décoratif : le titre de la carte dit « Application web ».

### BLR-07 · Le ciel dans un téléphone

- **Priorité** : socle · **Méthode** : SVG, à dessiner (vectoriel)
- **Emplacement** : `/projets/bloodborne-legendary-run` · § L’essayer, carte « Application Android » (remplace le dessin au trait bleu de l’ancienne page) _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Le ciel dans un téléphone
- **Composition** : Un téléphone tenu droit, vu de face, sans marque ni texte ; à l’écran, trois étoiles reliées en chemin qui monte ; la lanterne posée à côté du téléphone éclaire l’étoile du haut ; sujet centré, lisible à 88 px
- **Format** : 1:1, viewBox 120 (affiché de 88 à 120 px)
- **Fichier attendu** : `site/src/assets/visuels/bloodborne/BLR-07.svg`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif
- **Note** : Pendant de BLR-06. Décoratif : le titre de la carte dit « Application Android ».

### BLR-08 · Le même ciel, deux écrans

- **Priorité** : socle · **Méthode** : SVG, à dessiner (vectoriel)
- **Emplacement** : `/projets/bloodborne-legendary-run` · § Comment je l’ai construit, couche « L’interface » (remplace le dessin au trait bleu de l’ancienne page) _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Le même ciel, deux écrans
- **Composition** : Une fenêtre de navigateur et, devant elle à droite, un téléphone tenu droit ; les deux écrans montrent la même petite constellation de quatre étoiles reliées ; la lanterne posée entre eux éclaire l’étoile commune ; aucun texte, aucune marque
- **Format** : 2:1, viewBox 440 × 220 (affiché de 96 à 300 px)
- **Fichier attendu** : `site/src/assets/visuels/bloodborne/BLR-08.svg`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif
- **Note** : Série de trois (BLR-08 à BLR-10) dans les cartes cliquables des couches : même cadrage horizontal, même ligne de sol, même lanterne. Sous 860 px, la carte l’affiche à 96 px de large : le sujet doit se lire en petit.

### BLR-09 · Une réussite qui passe par le serveur

- **Priorité** : socle · **Méthode** : SVG, à dessiner (vectoriel)
- **Emplacement** : `/projets/bloodborne-legendary-run` · § Comment je l’ai construit, couche « L’API » (remplace le dessin au trait bleu de l’ancienne page) _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Une réussite qui passe par le serveur
- **Composition** : Trois fiches empilées au centre, comme des requêtes rangées ; une étoile entre par la gauche le long d’une flèche et ressort à droite, rangée ; la lanterne posée au pied de la pile éclaire la fiche du dessus ; aucun texte, aucune marque
- **Format** : 2:1, viewBox 440 × 220 (affiché de 96 à 300 px)
- **Fichier attendu** : `site/src/assets/visuels/bloodborne/BLR-09.svg`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif
- **Note** : Série BLR-08 à BLR-10. Décoratif : la carte dit « L’API » et sa fonction.

### BLR-10 · La partie gardée

- **Priorité** : socle · **Méthode** : SVG, à dessiner (vectoriel)
- **Emplacement** : `/projets/bloodborne-legendary-run` · § Comment je l’ai construit, couche « La sauvegarde » (remplace le dessin au trait bleu de l’ancienne page) _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : La partie gardée
- **Composition** : Une pile de trois disques, comme une base de données, scellée au sommet par une étoile allumée ; la lanterne posée à côté éclaire le sceau, le reste dans l’ombre ; aucun texte, aucune marque
- **Format** : 2:1, viewBox 440 × 220 (affiché de 96 à 300 px)
- **Fichier attendu** : `site/src/assets/visuels/bloodborne/BLR-10.svg`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif
- **Note** : Série BLR-08 à BLR-10. Décoratif : la carte dit « La sauvegarde » et sa fonction.

### BLR-F1 · Les 22 galaxies réelles

- **Priorité** : socle · **Méthode** : FIG, à coder (figure de données), rien à générer
- **Emplacement** : `/projets/bloodborne-legendary-run` · § 3 _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Les 22 galaxies réelles
- **Composition** : Planche des 22 silhouettes dessinées depuis constellation.json (poses et traits), nom et nombre d’étoiles en HTML
- **Format** : 16:9 ; 3:4 mobile (recadrage mobile 3:4)
- **Fichier attendu** : aucune image, figure codée
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Les 22 galaxies réelles »
- **Note** : Codée : components/projets/bloodborne/Constellations.astro, depuis config/bloodborne-constellations.ts (généré par tools/extraire-constellations.mjs depuis constellation.json). Une scène : les constellations s’allument l’une après l’autre à l’arrivée, rejouable au clic.

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
- **Emplacement** : `/projets/gup` · § 2, à côté des commandes _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Dispersé, puis un seul geste
- **Composition** : Une douzaine de petites machines de formes différentes, chacune avec son levier, reliées par des fils emmêlés qui convergent vers une boîte nette à flèche circulaire
- **Format** : 4:3, 1200 × 900
- **Fichier attendu** : `site/src/assets/visuels/gup/GUP-01_1200x900.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Dispersé, puis un seul geste »

### GUP-02 · Les choix d’ingénierie

- **Priorité** : socle · **Méthode** : SVG, à dessiner (vectoriel)
- **Emplacement** : `/projets/gup` · § 4, six cartes _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Les choix d’ingénierie
- **Composition** : Six pictos : cloison étanche, liste d’arguments sans coquillage, clé unique, réveil qui s’éteint, trois silhouettes de systèmes dont deux grisées, œil et contraste
- **Format** : 6 × 1:1, 96
- **Fichier attendu** : `site/src/assets/visuels/gup/GUP-02.svg` (lot de 6)
- **Alt prévu** (pour le HTML, jamais pour un prompt) : aucun, visuel décoratif

### GUP-03 · Une commande, tout mettre à jour

- **Priorité** : élargi · **Méthode** : IMG, à générer (image)
- **Emplacement** : `/projets/gup` · Partage, hub de repli _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Une commande, tout mettre à jour
- **Composition** : Fenêtre de terminal d’où partent des rayons vers des paquets génériques, sans logo
- **Format** : 1200 × 630 ; 16:10
- **Fichier attendu** : `site/src/assets/visuels/gup/GUP-03_1600x1000.webp`
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Une commande, tout mettre à jour »

### GUP-F1 · Les commandes réelles

- **Priorité** : socle · **Méthode** : FIG, à coder (figure de données), rien à générer
- **Emplacement** : `/projets/gup` · § 2 _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Les commandes réelles
- **Composition** : Colonne HTML de commandes empilées face à gup
- **Format** : —
- **Fichier attendu** : aucune image, figure codée
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Les commandes réelles, empilées face à gup »

### GUP-F2 · 153 sources par famille et par système

- **Priorité** : élargi · **Méthode** : FIG, à coder (figure de données), rien à générer
- **Emplacement** : `/projets/gup` · § 5 _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : 153 sources par famille et par système
- **Composition** : Sélecteur Windows / macOS / Linux qui grise les sources incompatibles, données du registre
- **Format** : 16:9
- **Fichier attendu** : aucune image, figure codée
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « 153 sources par famille et par système »

### GUP-F3 · Les versions

- **Priorité** : élargi · **Méthode** : FIG, à coder (figure de données), rien à générer
- **Emplacement** : `/projets/gup` · § 6 _(contexte : ne pas le recopier dans un prompt)_
- **Sujet** : Les versions
- **Composition** : Frise 0.1.0 → 0.5.3
- **Format** : 5:1
- **Fichier attendu** : aucune image, figure codée
- **Alt prévu** (pour le HTML, jamais pour un prompt) : « Les versions »

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
