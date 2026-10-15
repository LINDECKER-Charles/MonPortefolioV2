# Visuels de la page Omnicard

Préparés le 13 octobre 2026 pour `site/src/pages/projets/omnicard.astro`.
Les fichiers livrés vivent dans `site/src/assets/projets/omnicard/`.

## Captures historiques

Source locale : `/Users/charles/Documents/GitHub/MonPortfolio/images/project/Omnicard/`.
Il s’agit des captures conservées dans le portfolio V1, pas de nouvelles captures de
la version actuelle du jeu. Elles montrent une version réellement développée ; leur
date précise n’est pas documentée. Les compteurs et les statistiques qu’elles affichent
ne sont pas présentés comme des chiffres actuels.

| Fichier livré | Fichier source | Contenu |
| --- | --- | --- |
| `collection.webp` | `collection.webp` | Catalogue, cartes possédées et filtres |
| `deck.webp` | `deck_building.webp` | Composition du deck et catalogue |
| `ouverture.webp` | `packet-opening-2.webp` | Cartes obtenues après ouverture d’un paquet |
| `accueil.webp` | `home_page.webp` | Page d’accueil du jeu : cartes en éventail et récompense quotidienne (ajoutée le 15 octobre 2026) |

Captures intégrales, sans recadrage ni modification du contenu. Conversion WebP,
qualité 90, largeur maximale 1 800 px, sans agrandissement.

`accueil.webp` est réduite de 1 819 à 1 800 px de largeur, en qualité 86, sans recadrage.
Charles trouve que cette page d’accueil a « très bien vieilli » (retours du 15 octobre 2026) :
elle remplace l’illustration OMN-01 en tête de la page Omnicard, sur la carte Omnicard de
l’accueil et sur celle de la vitrine. Aucun pseudonyme, compte ni compteur n’y apparaît.

## Cartes issues du projet

Sources : fichiers du projet fournis localement par Charles pour cette page.
La [présentation publique d’Omnicard](https://github.com/LINDECKER-Charles/public-Omnicard)
rassemble les règles, les guides et la galerie de cartes ; elle constitue le lien public
du projet, sans servir de lien de téléchargement pour ces fichiers locaux.

Les cartes sont rendues avec l’outil d’export existant du projet, à partir des données
de jeu, des illustrations et des cadres fournis localement. La police utilisée
par cet export est Arial Bold, avec une échelle de police de 0,65.
Ce sont des exports du projet, pas des captures de son interface Angular.

| Fichier livré | ID | Carte | Univers des données locales |
| --- | --- | --- | --- |
| `carte-gehrman.webp` | 10 | Gehrman : Premier Chasseur | Bloodborne |
| `carte-jonathan.webp` | 79 | Jonathan Joestar | JoJo |
| `carte-floppa.webp` | 5 | Floppa : Mage | WTF |
| `carte-gitgud.webp` | 9 | GitGud | WTF |

Les illustrations, cadres, logos et symboles sont ceux du jeu.
Le rendu original a été réduit à 720 px de largeur et converti en WebP, qualité 90.
Aucune nouvelle illustration n’a été créée.

## Cartes de la saison 1

Source : l’archive du [dépôt de présentation public](https://github.com/LINDECKER-Charles/public-Omnicard),
dossier `Archive/Carte/saison_01/`, révision `8be9cbb` du 19 mai 2026, relue le 13 octobre 2026.
Ces cartes servent au comparateur « Rééquilibrer mes propres cartes » : la même carte dans
la saison 1 et dans la version actuelle du projet (exports ci-dessus).

| Fichier livré | Fichier source | Valeurs lues sur la carte |
| --- | --- | --- |
| `archive-gehrman.webp` | `bloodborne/Unite/gehrman_premier_chasseur_card.png` | coût 12, 4/8 (export actuel : 12, 4/15) |
| `archive-gitgud.webp` | `wtf/Sort/gitgud.png` | coût 13 (export actuel : 10) |
| `archive-floppa.webp` | `wtf/Unite/floppa_mage.png` | coût 5, 0/4 (export actuel : 6, 2/8) |

Cartes copiées telles quelles, réduites à 720 px de largeur et converties en WebP, qualité 90.
Le catalogue public (`docs/cards/*.md`) affiche encore 4/8 pour Gehrman et 0/4 pour
Floppa : Mage, et une capture historique de la collection montre Gehrman à 4/8 dans une
version en ligne antérieure. La page dit « Version actuelle du projet » pour les exports,
avec la marque « à confirmer », et le rappelle dans sa note de sources ; la version en ligne
de ces valeurs reste à confirmer par Charles.

## Limites et contenu

- Omnicard est hors ligne, en attente de refonte, selon Charles le 13 octobre 2026.
- Le front source n’a ni dépendances installées ni build local. Le catalogue dépend
  de l’API ; les écrans deck et ouverture nécessitent une session. Aucun compte ni
  donnée de production n’a été utilisé pour cette préparation.
- Les effets cités dans la page doivent venir des données fournies. Les valeurs des
  exports actuels peuvent différer de celles des captures historiques.
- Les univers et leurs illustrations servent à présenter le projet. Ne pas attribuer
  à Charles la création des franchises ou de toutes leurs illustrations.
