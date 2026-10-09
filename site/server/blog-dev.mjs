import { randomUUID } from 'node:crypto';
import { serveBlog } from './blog.mjs';

/** Même rendu dynamique en développement, avec le gabarit compilé par Astro à la demande. */
export function blogDevelopment(backend) {
  const templateKey = randomUUID();
  return {
    name: 'portfolio-blog-development',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.headers['x-portfolio-template'] === templateKey) { next(); return; }
        const url = new URL(req.url ?? '/', 'http://localhost');
        if (!/^\/(?:blog(?:\/[a-z0-9-]+)?|blog-modele|sitemap.xml|api\/backoffice\/blog\/preview\/[1-9]\d*)$/.test(url.pathname)) { next(); return; }
        const address = server.httpServer?.address();
        if (!address || typeof address === 'string') { next(); return; }
        try {
          const handled = await serveBlog(req, res, {
            pathname: url.pathname, search: url.search, backend, headers: {},
            loadTemplate: async (relative) => {
              const route = '/' + relative.replace(/\/index.html$/, '');
              const response = await fetch(`http://127.0.0.1:${address.port}${route}`, { headers: { 'X-Portfolio-Template': templateKey }, signal: AbortSignal.timeout(10_000) });
              if (!response.ok) throw new Error('gabarit indisponible');
              return response.text();
            },
            notFound: async (_req, response) => { response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); response.end('Page introuvable.'); },
          });
          if (!handled) next();
        } catch (error) { next(error); }
      });
    },
  };
}
