// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { fileURLToPath } from 'node:url';
import { lireConfigBackend } from './server/contact.mjs';
import { blogDevelopment } from './server/blog-dev.mjs';
import { ROUTES_PROXY_DEV } from './src/lib/proxy-dev.mjs';

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

  integrations: [{
    name: 'contact-local',
    hooks: {
      'astro:config:setup': ({ command, updateConfig }) => {
        // getViteConfig monte aussi un serveur Vite pour Vitest ; les tests
        // n'ont besoin ni des coordonnées locales ni d'un backend personnel.
        if (command !== 'dev' || process.env.VITEST) return;
        const environnement = fileURLToPath(new URL('../.env', import.meta.url));
        if (existsSync(environnement)) loadEnvFile(environnement);
        const backend = lireConfigBackend({ ...process.env, BACKEND_URL: process.env.BACKEND_URL || 'http://127.0.0.1:8080' });
        updateConfig({
          vite: {
            plugins: [blogDevelopment(backend)],
            define: { 'import.meta.env.PUBLIC_CONTACT_EMAIL': JSON.stringify('') },
            server: {
              // Routes relayées et chaîne de requête : src/lib/proxy-dev.mjs.
              proxy: {
                [ROUTES_PROXY_DEV]: {
                  target: backend?.origine,
                  timeout: 20_000,
                  proxyTimeout: 20_000,
                  headers: {
                    'X-Contact-Client-IP': '127.0.0.1',
                    ...(backend?.token ? { 'X-Contact-Proxy-Token': backend.token } : {}),
                  },
                },
              },
            },
          },
        });
      },
    },
  }],

  image: {
    // Les images déclarent elles-mêmes leurs largeurs (photo de la couverture) :
    // pas de styles responsifs injectés par Astro.
    responsiveStyles: false,
  },

  // Polices auto-hébergées, sous-ensembles latins préparés pour le site (voir
  // src/assets/fonts/LISEZMOI.md). Astro calcule les polices de repli ajustées
  // (taille, approche) : le texte ne saute pas quand la vraie police arrive.
  // Le backoffice lit aussi --police-texte.
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Instrument Sans',
      cssVariable: '--police-texte',
      fallbacks: ['Arial', 'sans-serif'],
      options: {
        variants: [
          {
            src: ['./src/assets/fonts/instrument-sans-latin-wght.woff2'],
            weight: '400 700',
            style: 'normal',
          },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Instrument Serif',
      cssVariable: '--police-titre',
      fallbacks: ['Georgia', 'serif'],
      options: {
        variants: [
          {
            src: ['./src/assets/fonts/instrument-serif-latin.woff2'],
            weight: '400',
            style: 'normal',
          },
          {
            src: ['./src/assets/fonts/instrument-serif-italic-latin.woff2'],
            weight: '400',
            style: 'italic',
          },
        ],
      },
    },
  ],

  vite: {
    // Le build conserve le marqueur, quelle que soit la machine : le mail
    // définitif est injecté depuis la configuration persistée, sans reconstruction.
    define: { 'import.meta.env.PUBLIC_CONTACT_EMAIL': JSON.stringify('') },
    build: { assetsInlineLimit: jamaisDeScriptEnLigne },
  },
});
