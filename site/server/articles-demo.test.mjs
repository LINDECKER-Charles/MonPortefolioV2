/**
 * Garde-fous de l’outil d’articles de démonstration (tools/articles-demo.mjs) :
 * ils portent la règle « aucun article fictif en production ». L’outil refuse
 * toute cible hors de la boucle locale et tout APP_ENV autre que development,
 * avant la moindre requête. Un serveur local compte ce qui lui parvient : il
 * ne doit rien recevoir. La cible non locale qui résout vers la boucle
 * (`localhost.`) ferait échouer le test sans jamais joindre un vrai service si
 * le contrôle disparaissait.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';

const OUTIL = fileURLToPath(new URL('../tools/articles-demo.mjs', import.meta.url));

function lancer(env) {
  return new Promise((resolve) => {
    const enfant = spawn(process.execPath, ['--disable-warning=ExperimentalWarning', OUTIL], {
      env: { PATH: process.env.PATH, BACKOFFICE_EMAIL: 'demo@example.test', BACKOFFICE_PASSWORD: 'mot-de-passe-de-test', ...env },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let erreur = '';
    enfant.stderr.on('data', (morceau) => { erreur += morceau; });
    const minuteur = setTimeout(() => enfant.kill('SIGKILL'), 20_000);
    enfant.on('close', (code) => { clearTimeout(minuteur); resolve({ code, erreur }); });
  });
}

test('l’outil de démonstration refuse toute cible qui n’est pas locale et en development, sans rien envoyer', async (t) => {
  let requetes = 0;
  const serveur = createServer((_req, res) => { requetes += 1; res.writeHead(503); res.end(); });
  await new Promise((resolve) => serveur.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => serveur.close(resolve)));
  const port = serveur.address().port;
  const cas = [
    { nom: 'adresse publique', env: { APP_ENV: 'development', BACKEND_URL: 'https://charles-lindecker.invalid' }, refus: /cible refusée/ },
    { nom: 'nom qui n’est pas sur la liste, même résolu en local', env: { APP_ENV: 'development', BACKEND_URL: `http://localhost.:${port}` }, refus: /cible refusée/ },
    { nom: 'APP_ENV=production', env: { APP_ENV: 'production', BACKEND_URL: `http://127.0.0.1:${port}` }, refus: /APP_ENV doit valoir development/ },
    { nom: 'APP_ENV absent', env: { BACKEND_URL: `http://127.0.0.1:${port}` }, refus: /APP_ENV doit valoir development/ },
    { nom: 'BACKEND_URL absent', env: { APP_ENV: 'development' }, refus: /BACKEND_URL manque/ },
  ];
  for (const { nom, env, refus } of cas) {
    const { code, erreur } = await lancer(env);
    assert.equal(code, 1, nom);
    assert.match(erreur, refus, nom);
  }
  assert.equal(requetes, 0, 'aucune requête n’est partie');
});
