# Fixtures partagées du blog

Ces fichiers sont lus par les tests du site **et** par ceux du backend Rust
(`include_str!("../../site/tests/fixtures/…")` dans `backend/tests/blog_api.rs`) :
une seule source pour la règle que la validation applique et pour ce que le
rendu doit savoir afficher. Ils vivent ici parce que le site est le seul à les
lire au moment de l’exécution (Node, Playwright) ; Rust les embarque à la
compilation.

| Fichier | Contenu | Lu par |
|---|---|---|
| `schema-blog.json` | inventaire des nœuds, marques et attributs qu’un article admet, avec des valeurs admises et refusées (`chaqueValeur` : l’article de test doit montrer chaque valeur) | `blog_api.rs` (chaque valeur admise passe, chaque valeur refusée, les attributs des autres nœuds et des attributs inconnus sont refusés) ; `server/blog-schema.test.mjs` (une valeur refusée se rend comme un attribut absent ; l’article de test emploie tout l’inventaire) |
| `article-complet.json` | un article qui emploie tout l’inventaire, avec ses cas limites : motifs `$` dans le titre, le texte et le code, typographie naïve, liens internes avec ancre ou paramètres, ancres, liens sortants, tableaux larges, alignés et fusionnés, images avec et sans légende | `blog_api.rs` (il est publiable ; chacun de ses nœuds refuse un attribut inconnu, et ses liens, titres et images des valeurs dangereuses) ; `server/blog-schema.test.mjs` (HTML produit) ; `tests/e2e/blog-article.spec.ts` (rendu dans le navigateur) |
| `article-complet-media.json` | les images de l’article de test, comme le backend les décrit sous `media` (dimensions, variantes) | `server/blog-schema.test.mjs`, `tests/e2e/blog-article.spec.ts` |
| `liens-blog.json` | adresses de liens et d’images admises et refusées | `blog_api.rs`, `server/blog-rendu.test.mjs` (règle de `server/blog-regles.mjs`, reprise par l’éditeur) |

Pour admettre un nouveau nœud ou attribut : l’ajouter à la validation
(`backend/src/blog.rs`) et à `schema-blog.json`, avec des valeurs admises et
refusées que le test Rust vérifie ; l’employer dans `article-complet.json` (le
test Node échoue sinon), puis
vérifier son rendu dans `server/blog.mjs` et `styles/blog.css`.
