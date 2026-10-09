import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const root = process.argv.includes('--dist') ? resolve(project, 'dist') : project;
const portArgument = process.argv.indexOf('--port');
const port = Number(portArgument > -1 ? process.argv[portArgument + 1] : process.env.PORT || 5173);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.pdf': 'application/pdf' };
const allowed = new Set(['index.html', 'styles.css', 'app.js']);

createServer(async (request, response) => {
  try {
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(405, { Allow: 'GET, HEAD' }).end();
      return;
    }
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const relative = ['/', '/parcours', '/parcours/', '/works', '/works/'].includes(pathname) ? 'index.html' : pathname.slice(1);
    const target = resolve(root, relative);
    const isAsset = target.startsWith(resolve(root, 'assets') + sep);
    if (!target.startsWith(root + sep) || (!allowed.has(relative) && !isAsset)) {
      response.writeHead(404).end('Page introuvable');
      return;
    }
    const content = await readFile(target);
    response.writeHead(200, { 'Content-Type': types[extname(target)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    response.end(request.method === 'HEAD' ? undefined : content);
  } catch (error) {
    response.writeHead(error.code === 'ENOENT' || error.code === 'EISDIR' ? 404 : 400).end('Ressource introuvable');
  }
}).listen(port, '127.0.0.1', () => console.log(`Parcours : http://localhost:${port}/parcours`));
