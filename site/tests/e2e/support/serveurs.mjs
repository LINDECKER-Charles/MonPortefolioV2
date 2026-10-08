/**
 * Serveurs des tests de bout en bout, partagés par playwright.config.ts et les
 * specs. En JavaScript : ce module touche à Node (processus, ports), et
 * `astro check` vérifie les .ts du projet.
 *
 * Deux instances du VRAI serveur de production (server/server.mjs), sur le
 * même dist/ :
 *   - le site, sans mesure d'audience — l'état d'un poste local ou de la CI ;
 *   - le même site avec la mesure active, pour vérifier le chargeur
 *     /mesure.js dans un vrai navigateur (le traceur y est remplacé par une
 *     doublure, voir mesure.spec.ts).
 */
import { execFileSync } from 'node:child_process';

/**
 * Deux ports libres, choisis UNE fois par le processus principal : la variable
 * est héritée par les workers, qui relisent la configuration.
 */
function portsLibres() {
  const script = [
    "const net = require('node:net');",
    'const a = net.createServer(), b = net.createServer();',
    "a.listen(0, '127.0.0.1', () => b.listen(0, '127.0.0.1', () => {",
    "  process.stdout.write(a.address().port + ' ' + b.address().port);",
    '  a.close(); b.close();',
    '}));',
  ].join('\n');
  return execFileSync(process.execPath, ['-e', script], { encoding: 'utf8' }).trim();
}

process.env.E2E_PORTS ??= portsLibres();
const [portSite, portMesure] = process.env.E2E_PORTS.split(' ');

export const IS_CI = Boolean(process.env.CI);

/** Pour itérer sans reconstruire : `E2E_SKIP_BUILD=1 npx playwright test`. */
export const SKIP_BUILD = Boolean(process.env.E2E_SKIP_BUILD);

/** Identifiant de site factice, accepté par le serveur (UUID v4) et reconnaissable. */
export const MESURE_SITE_ID = '00000000-0000-4000-8000-0000000e2e00';
export const MESURE_DOMAINE = 'mesure.charles-lindecker.test';

/** Adresse de test, distincte de l’adresse publique et sans boîte réelle. */
export const CONTACT_EMAIL = 'e2e-contact@example.test';

/** Variables posées à vide : celles du poste ne doivent pas fuiter dans les tests. */
const ENV_HERMETIQUE = {
  HOST: '127.0.0.1',
  UMAMI_WEBSITE_ID: '',
  UMAMI_SITE_DOMAIN: '',
  REDIRECT_HOSTS: '',
  CANONICAL_ORIGIN: '',
  CONTACT_EMAIL,
  BACKEND_URL: '',
};

export const SITE = {
  url: `http://127.0.0.1:${portSite}`,
  /** @type {Record<string, string>} */
  env: { ...ENV_HERMETIQUE, PORT: portSite },
};

export const MESURE = {
  url: `http://127.0.0.1:${portMesure}`,
  /** @type {Record<string, string>} */
  env: {
    ...ENV_HERMETIQUE,
    PORT: portMesure,
    UMAMI_WEBSITE_ID: MESURE_SITE_ID,
    UMAMI_SITE_DOMAIN: MESURE_DOMAINE,
  },
};
