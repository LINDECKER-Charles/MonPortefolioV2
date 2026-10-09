import { cp, mkdir, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, 'dist');
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const file of ['index.html', 'styles.css', 'app.js', 'assets']) {
  await cp(resolve(root, file), resolve(output, file), { recursive: true });
}
await mkdir(resolve(output, 'parcours'), { recursive: true });
await cp(resolve(root, 'index.html'), resolve(output, 'parcours/index.html'));
console.log('Page prête dans dist/');

