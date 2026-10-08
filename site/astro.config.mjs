// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

/**
 * Aucun <script> exécutable en ligne : la CSP envoyée par server/server.mjs
 * (`script-src 'self'`) n'a ainsi besoin d'aucune empreinte. Vite inlinerait
 * sinon les petits modules dans la page ; les petites feuilles CSS, elles,
 * peuvent l'être (`style-src` admet 'unsafe-inline' pour elles et pour le
 * <style> émis par <Font />). Contrôlé après chaque build par
 * tools/verifier-site.mjs.
 * @param {string} chemin
 */
const jamaisDeScriptEnLigne = (chemin) => (chemin.endsWith('.js') ? false : undefined);

export default defineConfig({
  // Hôte canonique de toutes les balises (canonical, og:url, sitemap, JSON-LD).
  // L'environnement de test sert les mêmes fichiers : il est tenu hors index
  // par l'en-tête X-Robots-Tag de l'edge, pas par le build.
  site: 'https://charles-lindecker.com',

  // Adresses sans slash final ; le serveur sert /x depuis x/index.html et
  // redirige /x/ et /x/index.html en 301.
  trailingSlash: 'never',
  // Feuilles de style dans la page : sur un site de trois pages lues de haut
  // en bas, deux requêtes bloquantes de moins comptent plus qu'un cache
  // partagé (≈ 8 Ko compressés). La CSP admet les styles en ligne.
  build: { format: 'directory', inlineStylesheets: 'always' },

  compressHTML: true,

  // Deux sources pour une même adresse : le build échoue au lieu d'avertir.
  prerenderConflictBehavior: 'error',

  // Pas de barre d'outils de développement : elle masquerait le pied de page
  // pendant les relectures, et le site n'en a pas l'usage.
  devToolbar: { enabled: false },

  image: {
    // Les images déclarent elles-mêmes leurs largeurs (photo de la couverture) :
    // pas de styles responsifs injectés par Astro.
    responsiveStyles: false,
  },

  // Polices auto-hébergées, sous-ensembles latins préparés pour le site (voir
  // src/assets/fonts/LISEZMOI.md). Astro calcule les polices de repli ajustées
  // (taille, approche) : le texte ne saute pas quand la vraie police arrive.
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Atkinson Hyperlegible Next',
      cssVariable: '--police-texte',
      fallbacks: ['system-ui', 'sans-serif'],
      options: {
        variants: [
          {
            src: ['./src/assets/fonts/atkinson-hyperlegible-next-latin-wght.woff2'],
            weight: '400 800',
            style: 'normal',
          },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Newsreader',
      cssVariable: '--police-note',
      fallbacks: ['Georgia', 'serif'],
      options: {
        variants: [
          {
            src: ['./src/assets/fonts/newsreader-italic-400-latin-opsz.woff2'],
            weight: '400',
            style: 'italic',
          },
        ],
      },
    },
  ],

  vite: {
    build: { assetsInlineLimit: jamaisDeScriptEnLigne },
  },
});
