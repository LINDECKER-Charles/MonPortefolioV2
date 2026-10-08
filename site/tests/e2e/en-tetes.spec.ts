import { expect, test, type APIResponse } from '@playwright/test';

/**
 * En-têtes de sécurité et de cache du serveur de production, sur le build
 * réel. La CSP est lue directive par directive : aucune origine tierce n'y
 * entre, le chargeur et le traceur de mesure étant en même origine.
 */

function directives(csp: string): Map<string, string[]> {
  return new Map(
    csp
      .split(';')
      .map((directive) => directive.trim().split(/\s+/))
      .filter((morceaux) => morceaux[0])
      .map(([nom, ...valeurs]) => [nom, valeurs]),
  );
}

function verifierSecurite(reponse: APIResponse, libelle: string) {
  const entetes = reponse.headers();
  expect(entetes['x-content-type-options'], libelle).toBe('nosniff');
  expect(entetes['x-frame-options'], libelle).toBe('DENY');
  expect(entetes['referrer-policy'], libelle).toBe('strict-origin-when-cross-origin');
  expect(entetes['cross-origin-opener-policy'], libelle).toBe('same-origin');
  expect(entetes['strict-transport-security'], libelle).toMatch(/^max-age=\d+/);
  expect(entetes['permissions-policy'], libelle).toMatch(/camera=\(\)/);

  const csp = directives(entetes['content-security-policy'] ?? '');
  expect(csp.get('default-src'), libelle).toEqual(["'self'"]);
  expect(csp.get('script-src'), libelle).toEqual(["'self'"]);
  expect(csp.get('connect-src'), libelle).toEqual(["'self'"]);
  expect(csp.get('object-src'), libelle).toEqual(["'none'"]);
  expect(csp.get('form-action'), libelle).toEqual(["'self'"]);
  expect(csp.get('frame-ancestors'), libelle).toEqual(["'none'"]);
  for (const [nom, valeurs] of csp) {
    expect(valeurs.filter((v) => /^https?:/.test(v)), `${libelle} : origine tierce dans ${nom}`).toEqual([]);
  }
}

test('pages, fichiers, chargeur, redirections et erreurs portent les mêmes en-têtes', async ({ request, page }) => {
  await page.goto('/');
  const fichiers = await page
    .locator('link[href^="/_astro/"], script[src^="/_astro/"]')
    .evaluateAll((elements) => elements.map((e) => e.getAttribute('href') ?? e.getAttribute('src')));
  const empreinte = fichiers.find((f): f is string => Boolean(f));

  const cas: [string, number, string][] = [
    ['/', 200, 'no-cache'],
    ['/mentions-legales', 200, 'no-cache'],
    ['/mesure.js', 200, 'public, max-age=3600'],
    ['/theme.js', 200, 'public, max-age=3600'],
    ['/favicon.png', 200, 'public, max-age=3600'],
    ['/favicon-nuit.png', 200, 'public, max-age=3600'],
    ['/sitemap.xml', 200, 'no-cache'],
    ['/index.html', 301, 'public, max-age=3600'],
    ['/mentions-legales/', 301, 'public, max-age=3600'],
    ['/projects', 301, 'public, max-age=3600'],
    ['/cette-adresse-n-existe-pas', 404, 'no-cache'],
  ];
  if (empreinte) cas.push([empreinte, 200, 'public, max-age=31536000, immutable']);

  for (const [chemin, statut, cache] of cas) {
    const reponse = await request.get(chemin, { maxRedirects: 0 });
    expect(reponse.status(), chemin).toBe(statut);
    expect(reponse.headers()['cache-control'], chemin).toBe(cache);
    verifierSecurite(reponse, chemin);
  }
});

test('les anciennes adresses de la V1 mènent à leur équivalent', async ({ request }) => {
  for (const [ancienne, nouvelle] of [
    ['/projects', '/projets'],
    ['/works', '/parcours'],
    ['/resume', '/parcours'],
    ['/linktree', '/contact'],
    ['/politique-confidentialite', '/mentions-legales'],
  ]) {
    const reponse = await request.get(ancienne, { maxRedirects: 0 });
    expect(reponse.status(), ancienne).toBe(301);
    expect(new URL(reponse.headers().location ?? '', 'http://x').pathname, ancienne).toBe(nouvelle);
  }
});

test('une méthode autre que GET ou HEAD est refusée', async ({ request }) => {
  const reponse = await request.post('/', { data: 'x' });
  expect(reponse.status()).toBe(405);
  expect(reponse.headers().allow).toBe('GET, HEAD');
});
