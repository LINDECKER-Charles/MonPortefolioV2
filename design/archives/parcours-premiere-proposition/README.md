> Prototype historique antérieur au parcours Astro. Conservé comme source de conception ;
> les contenus et le CV de cette proposition ne décrivent pas le site actuel.

# MonPortefolioV2

Première proposition de la page **Parcours** de Charles Lindecker, réalisée en HTML, CSS et JavaScript. Le projet est statique, sans dépendance, et nécessite **Node.js 20 ou supérieur** pour les commandes locales.

## Lancer la page

```sh
npm run dev
```

Ouvrir [la page Parcours](http://localhost:5173/parcours).

Pour créer puis consulter la version de production :

```sh
npm run build
npm run preview -- --port 5174
```

Le contenu et la présentation se modifient dans `index.html`, `styles.css` et `app.js`.

## Contenu repris

Les informations proviennent de l’ancien dépôt `MonPortfolio`, dans `front-portfolio/src/app/components/page/works/works.data.ts` et `front-portfolio/public/lang/works/works.fr.json` : **6 expériences, dont 3 bénévolats, 1 formation et 12 certifications**. Elles constituent une première base à compléter au fil des échanges.

Le CV existant était repris sans modification dans `assets/cv-charles-lindecker.pdf` ; il est rangé depuis le 2026-10-15 dans le cadrage privé (`docs/prive/cv/`), hors du dépôt public.

## Accessibilité et navigation

La page prévoit une structure HTML sémantique, un lien d’évitement vers le contenu, des détails dépliables natifs et des filtres ajoutés progressivement avec JavaScript. Elle reste lisible sans JavaScript, dispose d’une présentation pour l’impression et n’impose pas d’animations.

Ces choix guident la conception ; ils ne constituent pas une certification de conformité WCAG.
