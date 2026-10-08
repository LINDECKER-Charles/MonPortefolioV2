import { expect, test, type Page } from '@playwright/test';
import { MESURE, MESURE_DOMAINE, MESURE_SITE_ID, SITE } from './support/serveurs.mjs';

/**
 * Chargeur de mesure /mesure.js dans un vrai navigateur, servi par le serveur
 * de production avec la mesure active. Le traceur d'Umami est remplacé par
 * une doublure, servie sous la même adresse (/u/script.js) : elle relève les
 * réglages lus sur sa balise et appelle `data-before-send` comme le vrai
 * traceur avant chaque envoi.
 */
test.use({ baseURL: MESURE.url });

const DOUBLURE = `(function () {
  var script = document.currentScript, attributs = {};
  for (var i = 0; i < script.attributes.length; i++) attributs[script.attributes[i].name] = script.attributes[i].value;
  var appels = [];
  var avant = function (type, charge) {
    var fn = window[attributs['data-before-send']];
    return typeof fn === 'function' ? fn(type, charge) : charge;
  };
  window.__doublure = { attributs: attributs, appels: appels };
  window.umami = {
    track: function (nom, donnees) {
      var charge = { website: attributs['data-website-id'], name: nom, data: donnees,
        id: 'visiteur-identifie', referrer: 'https://www.google.com/search?q=charles+lindecker' };
      appels.push({ nom: nom, donnees: donnees, envoye: avant('event', charge) });
    },
    identify: function (id) { appels.push({ nom: 'identify', envoye: avant('identify', { id: id }) }); },
  };
})();`;

interface Appel {
  nom: string;
  donnees?: Record<string, string>;
  envoye: Record<string, unknown> | null;
}
interface FenetreMesuree {
  __doublure?: { attributs: Record<string, string>; appels: Appel[] };
  clFile?: unknown;
  clChargeur?: boolean;
  clAvantEnvoi?: unknown;
  umami?: { identify(id: string): void };
}

async function servirDoublure(page: Page): Promise<string[]> {
  const demandes: string[] = [];
  await page.route('**/u/script.js', async (route) => {
    demandes.push(route.request().url());
    await route.fulfill({ status: 200, contentType: 'text/javascript; charset=utf-8', body: DOUBLURE });
  });
  return demandes;
}

test('le chargeur insère le traceur avec les réglages du plan de marquage', async ({ page }) => {
  const demandes = await servirDoublure(page);
  await page.goto('/');
  await page.waitForFunction(() => Boolean((window as unknown as FenetreMesuree).__doublure));
  expect(demandes).toHaveLength(1);
  const attributs = await page.evaluate(() => (window as unknown as FenetreMesuree).__doublure?.attributs);
  expect(attributs).toEqual({
    src: '/u/script.js',
    'data-website-id': MESURE_SITE_ID,
    'data-domains': MESURE_DOMAINE,
    'data-exclude-search': 'true',
    'data-exclude-hash': 'true',
    'data-do-not-track': 'true',
    'data-performance': 'true',
    'data-before-send': 'clAvantEnvoi',
  });
});

test('les événements en attente partent au chargement, les suivants aussitôt, épurés', async ({ page }) => {
  await servirDoublure(page);
  await page.addInitScript(() => {
    (window as unknown as FenetreMesuree).clFile = [['lecture', { chapitre: 'origine' }]];
  });
  await page.goto('/');
  await page.waitForFunction(() => {
    const w = window as unknown as FenetreMesuree;
    return Boolean(w.__doublure) && !Array.isArray(w.clFile);
  });
  await page.getByRole('button', { name: 'Mode nuit' }).click();
  await page.evaluate(() => (window as unknown as FenetreMesuree).umami?.identify('recruteur-42'));
  const appels = await page.evaluate(() => (window as unknown as FenetreMesuree).__doublure?.appels ?? []);
  const sansLecture = appels.filter((a) => a.nom !== 'lecture' || a.donnees?.chapitre === 'origine');
  expect(sansLecture.map((a) => [a.nom, a.donnees])).toEqual([
    ['lecture', { chapitre: 'origine' }],
    ['theme', { choix: 'nuit' }],
    ['identify', undefined],
  ]);
  for (const appel of sansLecture.slice(0, 2)) {
    expect(appel.envoye).not.toHaveProperty('id');
    expect(appel.envoye?.referrer).toBe('https://www.google.com/');
  }
  expect(sansLecture[2].envoye, 'identify est annulé').toBeNull();
});

test('une opposition enregistrée : le traceur n’est même pas demandé', async ({ page }) => {
  const demandes = await servirDoublure(page);
  await page.addInitScript(() => window.localStorage.setItem('umami.disabled', '1'));
  await page.goto('/');
  await page.waitForFunction(() => (window as unknown as FenetreMesuree).clChargeur === true);
  await page.waitForLoadState('load');
  expect(demandes).toEqual([]);
});

test('le signal Global Privacy Control : le traceur n’est même pas demandé', async ({ page }) => {
  const demandes = await servirDoublure(page);
  await page.addInitScript(() => {
    Object.defineProperty(Navigator.prototype, 'globalPrivacyControl', { get: () => true, configurable: true });
  });
  await page.goto('/');
  await page.waitForFunction(() => (window as unknown as FenetreMesuree).clChargeur === true);
  await page.waitForLoadState('load');
  expect(demandes).toEqual([]);
});

test('le bouton d’opposition des mentions légales fonctionne dans les deux sens, sans rien mesurer', async ({
  page,
}) => {
  await servirDoublure(page);
  await page.goto('/mentions-legales');
  const etat = page.locator('[data-opposition-etat]');
  const bouton = page.getByRole('button', { name: 'Ne plus être mesuré' });
  await expect(etat).toHaveText('Vos visites sont mesurées, de façon anonyme.');
  const avant = await page.evaluate(() => (window as unknown as FenetreMesuree).__doublure?.appels.length ?? 0);

  await bouton.click();
  await expect(etat).toHaveText('Vos visites ne sont pas mesurées.');
  expect(await page.evaluate(() => window.localStorage.getItem('umami.disabled'))).toBe('1');
  await page.getByRole('button', { name: 'Accepter à nouveau la mesure' }).click();
  await expect(etat).toHaveText('Vos visites sont mesurées, de façon anonyme.');
  expect(await page.evaluate(() => window.localStorage.getItem('umami.disabled'))).toBeNull();

  const apres = await page.evaluate(() => (window as unknown as FenetreMesuree).__doublure?.appels.length ?? 0);
  expect(apres, 'aucun événement au moment du choix').toBe(avant);
});

test.describe('serveur sans mesure', () => {
  test.use({ baseURL: SITE.url });

  test('le chargeur est un commentaire, et rien d’autre n’est demandé', async ({ page, request }) => {
    const demandes = await servirDoublure(page);
    const chargeur = await request.get('/mesure.js');
    expect(await chargeur.text()).toBe("/* mesure d'audience désactivée */\n");
    await page.goto('/');
    await page.waitForLoadState('load');
    expect(demandes).toEqual([]);
    expect(await page.evaluate(() => (window as unknown as FenetreMesuree).clChargeur)).toBeUndefined();
  });
});
