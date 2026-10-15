# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Le portfolio de Charles Lindecker s’adresse en priorité aux grandes entreprises tech qui évaluent un profil de lead technique et management : le recruteur pressé d’abord, puis le lead technique qui creuse. Le site montre ce que Charles fait, sans annoncer de recherche de poste. Source : docs/prive/brief.md § 4.

## Product Purpose

Dire en un écran qui est Charles, avec trois preuves (Maîtriser, Réinventer, Emmener), puis raconter sa méthode et conduire vers un projet ou vers « Discutons ». L’accueil porte le récit ; la vitrine range neuf projets en quatre familles (Lead et équipe, Jeu vidéo, Outils, IA), chacun avec ce qu’il prouve ; chaque page de projet montre le besoin, la part de Charles, les usages réels, ses décisions et le résultat.

## Capabilities and Constraints

Astro, serveur Node sans dépendance, API Rust pour le contact et le blog. Dix-neuf pages publiques, dont neuf pages de projet sur un gabarit commun, dans l’ordre de la vitrine (décision du 14 octobre 2026) : PvZ Fusion (pôle francophone) ; Omnicard, Bloodborne Legendary Run, League Of Data Base ; gup, GitHealth ; Karl Scraper, Sillage, Relais. Life Pixel, img-convertor et Shreksophone sont dans les projets archivés.

Contraintes dures : CSP sans script en ligne ni origine tierce, contenu complet sans JavaScript, budgets de 15 Ko de JavaScript et 30 Ko de CSS gzip par page, contrats du blog rendu par Node, plan de marquage Umami, URL inchangées. Les faits viennent de docs/prive/matiere-premiere.md et des sources publiques ; un fait non confirmé reste marqué « à confirmer » et figure dans docs/prive/a-confirmer.md. Aucun dépôt privé cité (sauf Bloodborne Legendary Run, Karl Scraper, Sillage et Relais, sans lien ni nom de dépôt ; sans nommer l’outil source de Karl Scraper), aucun chiffre d’adoption, aucune métrique d’usage non publiée, aucun téléchargement npm affiché.

## Brand Commitments

Direction « Lanterne », retenue le 13 octobre 2026, avec les greffes de « Banc d’essai » (fiche technique en tableau à filets, index des étiquettes de preuve, acte bleu nuit et aplat bleu roi derrière « Discutons ») : DESIGN.md. Logo livre-lanterne, bleu roi de la chemise des photos, voix de Charles, français soigné en tournures neutres, sans anglais. « Mode d’emploi » ne reste qu’en clin d’œil. Rien de ce que Charles a demandé n’est retiré sans son accord.

## Evidence on Hand

Brief, entretien, matière première, maquette Lanterne (design/refonte/c-lanterne/), quatre photos réelles de la séance, captures des vraies applications et sources publiques. Registre des visuels : site/src/config/visuels.ts. Provenance des captures : site/src/assets/projets/README.md.

## Product Principles

- Une preuve par verbe dès le premier écran.
- Le problème avant les usages, les usages avant la technique, les décisions et le résultat en fin de page.
- Une seule chose éclairée par écran, une seule action principale : « Discutons → », vers /contact.
- Chaque capture répond à une question concrète et reste lisible à 390 px.
- Préserver la vérité du produit et la confidentialité du parcours.

## Accessibility & Inclusion

WCAG 2.2 AA de jour et de nuit, à 390 et 1 440 px, vérifié par axe ; navigation clavier ; mouvement réduit respecté ; fonctionnement complet sans JavaScript ; impression ; aucun débordement horizontal à 390 px.
