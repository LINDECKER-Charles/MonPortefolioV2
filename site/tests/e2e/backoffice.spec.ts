import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { MESURE } from './support/serveurs.mjs';
import { fileDeMesure } from './support/navigateur';

test.use({ reducedMotion: 'reduce' });

const SECRET = 'mcp_secret_de_test_affiche_une_fois';
const CLE_DEUX_FACTEURS = 'JBSWY3DPEHPK3PXP';
const QR_DEUX_FACTEURS = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
const CODES_SECOURS = ['ABCD-1234-EFGH-5678', 'IJKL-9012-MNOP-3456'];
const DEMANDE = {
  id: 1, name: 'Camille Martin', email: 'camille@example.test',
  subject: 'Un projet à construire', message: 'Bonjour Charles, parlons de mon projet.\n<img src=x onerror="window.injection=true">',
  status: 'new', delivery_status: 'failed', created_at: '2026-10-08T08:30:00Z',
};
const REGLES_AXE = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];
const ARTICLE = { id: 1, slug: 'preparer-une-mise-en-ligne', title: 'Préparer une mise en ligne', status: 'draft' };
/** La bibliothèque du stockage : une image citée par un brouillon, une autre inutilisée. */
const IMAGES = [
  { id: 1, filename: 'capture-atelier.jpg', content_type: 'image/jpeg', width: 2000, height: 1250, size: 1_108_935, variants: { count: 3, size: 1_003_325, widths: [960, 480, 1600] }, total: 2_112_260, created_at: '2026-10-14T14:05:34.594Z', url: '/api/blog/media/1', admin_url: '/api/backoffice/blog/media/1', posts: [ARTICLE] },
  { id: 2, filename: 'schema.png', content_type: 'image/png', width: 640, height: 400, size: 592_856, variants: { count: 0, size: 0, widths: [] as number[] }, total: 592_856, created_at: '2026-10-14T14:05:35.031Z', url: '/api/blog/media/2', admin_url: '/api/backoffice/blog/media/2', posts: [] as typeof ARTICLE[] },
];
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aXioAAAAASUVORK5CYII=', 'base64');
const NBSP = '\u00a0';
const NNBSP = '\u202f';

/** Doubles de l’API, sans stockage réel ni envoi de courriel. */
async function apiDouble(page: Page, options: { authenticated?: boolean; smtp?: boolean; twoFactor?: boolean; enrollment?: boolean; setupFailures?: number; tokenLimit?: boolean; disque?: { total: number; available: number } | null; imagePriseEntreTemps?: number; journalVide?: boolean } = {}) {
  const etat = {
    authenticated: options.authenticated ?? false,
    smtp: options.smtp ?? true,
    challenge: false,
    enrollment: options.enrollment ?? false,
    setupFailures: options.setupFailures ?? 0,
    email: 'contact@example.test',
    contacts: [{ ...DEMANDE }],
    links: [] as { id: number; label: string; url: string; description: string }[],
    tokens: [] as { id: number; name: string; created_at: string; last_used_at: string | null; scopes: string[] }[],
    images: structuredClone(IMAGES),
    mutations: [] as { path: string; method: string; body: unknown; header: string | undefined }[],
    consultations: [] as string[],
  };
  await page.route('**/api/backoffice/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname.replace('/api/backoffice', '');
    const method = request.method();
    const body = request.postData() ? request.postDataJSON() as Record<string, string> : undefined;
    const repondre = async (contenu: unknown, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(contenu) });
    if (method !== 'GET') etat.mutations.push({ path, method, body, header: request.headers()['x-backoffice-request'] });
    else etat.consultations.push(path);
    if (path === '/login') {
      if (body?.email !== 'admin@example.test' || body?.password !== 'mot-de-passe-test') { await repondre({ code: 'UNAUTHORIZED', message: 'Une connexion au backoffice est nécessaire.' }, 401); return; }
      if (options.twoFactor) {
        etat.challenge = true;
        await repondre({ authenticated: false, two_factor_required: true, enrollment_required: etat.enrollment }); return;
      }
      etat.authenticated = true;
      await repondre({ authenticated: true }, 200);
      return;
    }
    if (path === '/2fa/setup' || path === '/2fa/verify') {
      if (!etat.challenge) { await repondre({ code: 'CHALLENGE_EXPIRED', message: 'La vérification a expiré. Connectez-vous à nouveau.' }, 401); return; }
      if (path === '/2fa/setup') {
        if (etat.setupFailures-- > 0) { await repondre({ code: 'SERVICE_UNAVAILABLE', message: 'La configuration est momentanément indisponible. Réessayez.' }, 503); return; }
        await repondre({ secret: CLE_DEUX_FACTEURS, otpauth_url: 'otpauth://totp/Portfolio:admin%40example.test?secret=' + CLE_DEUX_FACTEURS, qr_code_data_url: QR_DEUX_FACTEURS }); return;
      }
      if (body?.code !== '123456' && (!CODES_SECOURS.includes(body?.code ?? '') || etat.enrollment)) {
        await repondre({ code: 'INVALID_TWO_FACTOR', message: 'Le code est incorrect ou a déjà été utilisé.' }, 401); return;
      }
      const inscription = etat.enrollment;
      etat.authenticated = true;
      etat.challenge = false;
      etat.enrollment = false;
      await repondre({ authenticated: true, smtp_configured: etat.smtp, ...(inscription ? { recovery_codes: CODES_SECOURS } : {}) }); return;
    }
    if (!etat.authenticated) { await repondre({ code: 'unauthorized', message: 'Connectez-vous pour ouvrir le backoffice.' }, 401); return; }
    if (path === '/session') { await repondre({ authenticated: true, smtp_configured: etat.smtp }); return; }
    if (path === '/logout') { etat.authenticated = false; await repondre({}); return; }
    if (path === '/contacts') {
      const filtre = url.searchParams.get('status');
      const demandes = etat.contacts.filter((demande) => filtre === 'all' || demande.status === filtre);
      const offset = Number(url.searchParams.get('offset'));
      const limit = Number(url.searchParams.get('limit'));
      await repondre({ contacts: demandes.slice(offset, offset + limit), total: demandes.length, new_count: etat.contacts.filter((demande) => demande.status === 'new').length });
      return;
    }
    if (path.startsWith('/contacts/')) {
      const id = Number(path.split('/').at(-1));
      if (method === 'PATCH') etat.contacts = etat.contacts.map((demande) => demande.id === id ? { ...demande, status: body!.status! } : demande);
      if (method === 'DELETE') etat.contacts = etat.contacts.filter((demande) => demande.id !== id);
      await repondre({}); return;
    }
    if (path === '/settings') {
      if (method === 'PUT') etat.email = body!.email!;
      await repondre({ email: etat.email }); return;
    }
    if (path === '/links') {
      if (method === 'POST') etat.links.push({ id: 1, label: body!.label!, url: body!.url!, description: body!.description! });
      await repondre({ links: etat.links }); return;
    }
    if (path.startsWith('/links/')) {
      const id = Number(path.split('/').at(-1));
      if (method === 'PUT') etat.links = etat.links.map((outil) => outil.id === id ? { id, label: body!.label!, url: body!.url!, description: body!.description! } : outil);
      if (method === 'DELETE') etat.links = etat.links.filter((outil) => outil.id !== id);
      await repondre({}); return;
    }
    if (path === '/tokens') {
      if (method === 'POST') {
        if (options.tokenLimit) { await repondre({ code: 'TOKEN_LIMIT_REACHED', message: 'Le portfolio compte déjà 64 accès MCP, le maximum. Révoquez un accès inutilisé pour en créer un autre.' }, 409); return; }
        const corps = body as unknown as { name: string; scopes: string[] };
        const jeton = { id: etat.tokens.length + 1, name: corps.name, created_at: '2026-10-08T09:00:00Z', last_used_at: null, scopes: corps.scopes };
        etat.tokens.unshift(jeton);
        await repondre({ ...jeton, token: SECRET }, 201); return;
      }
      await repondre({ tokens: etat.tokens }); return;
    }
    if (path === '/storage') {
      const enMemoire = options.disque === null;
      const somme = (cle: 'size' | 'total') => etat.images.reduce((total, image) => total + image[cle], 0);
      await repondre({
        disk: enMemoire ? null : options.disque ?? { total: 994_662_584_320, available: 247_984_865_280 },
        database: { file: enMemoire ? null : 4096, wal: enMemoire ? null : options.journalVide ? 0 : 3_695_672, size: 3_399_680, free: 397_312, page_size: 4096 },
        categories: { media_originals: somme('size'), media_variants: somme('total') - somme('size'), posts: 16_384, contacts: 8192, system: 57_344 },
        media: [...etat.images].sort((a, b) => b.total - a.total),
        posts: [{ ...ARTICLE, size: 377 }],
        contacts: { count: etat.contacts.length, size: 8192 },
      });
      return;
    }
    if (path.startsWith('/blog/media/')) {
      const id = Number(path.split('/')[3]);
      if (method === 'GET') { await route.fulfill({ status: 200, contentType: 'image/png', body: PNG }); return; }
      const image = etat.images.find((item) => item.id === id);
      if (!image) { await repondre({ code: 'NOT_FOUND', message: 'Image introuvable.' }, 404); return; }
      // Un article s’en est servi entre l’affichage et la suppression.
      if (id === options.imagePriseEntreTemps) image.posts = [ARTICLE];
      if (image.posts.length) { await repondre({ code: 'MEDIA_IN_USE', message: 'Cette image est utilisée par un article.' }, 409); return; }
      etat.images = etat.images.filter((item) => item.id !== id);
      await repondre({ deleted: true, id }); return;
    }
    if (path.startsWith('/tokens/')) {
      etat.tokens = etat.tokens.filter((jeton) => jeton.id !== Number(path.split('/').at(-1)));
      await repondre({}); return;
    }
    await repondre({ message: 'Route de test inconnue.' }, 404);
  });
  return etat;
}

async function accessibilite(page: Page) {
  const resultats = await new AxeBuilder({ page }).withTags(REGLES_AXE).analyze();
  expect(resultats.violations.map((violation) => ({ regle: violation.id, cibles: violation.nodes.map((noeud) => noeud.target) }))).toEqual([]);
}
async function connecter(page: Page) {
  await page.getByLabel('Adresse e-mail de connexion', { exact: true }).fill('admin@example.test');
  await page.getByLabel('Mot de passe', { exact: true }).fill('mot-de-passe-test');
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
  await expect(page.locator('#bo-workspace')).toBeVisible();
  await expect(page.locator('#bo-notice')).toBeHidden();
}
/** Une rubrique, par la navigation de l’en-tête. */
function rubrique(page: Page, nom: string | RegExp) {
  return page.getByRole('navigation', { name: 'Rubriques du backoffice' }).getByRole('link', { name: nom });
}
/** Double du serveur MCP (révision 2026-07-28) ; `reponse` remplace la réponse normale. */
async function mcpDouble(page: Page, reponse?: (methode: string) => Promise<{ status: number; corps: unknown } | 'jamais'>) {
  const appels: { methode: string; autorisation?: string; cookie?: string; origine?: string; version?: string; enTeteMethode?: string }[] = [];
  await page.route('**/mcp', async (route) => {
    const requete = route.request();
    const corps = requete.postDataJSON() as { id: number; method: string };
    const enTetes = requete.headers();
    appels.push({ methode: corps.method, autorisation: enTetes.authorization, cookie: enTetes.cookie, origine: enTetes.origin, version: enTetes['mcp-protocol-version'], enTeteMethode: enTetes['mcp-method'] });
    const special = await reponse?.(corps.method);
    if (special === 'jamais') return;
    if (special) { await route.fulfill({ status: special.status, contentType: 'application/json', body: JSON.stringify(special.corps) }); return; }
    const cache = { resultType: 'complete', ttlMs: 300000, cacheScope: 'private' };
    const resultat = corps.method === 'server/discover'
      ? { supportedVersions: ['2026-07-28', '2025-11-25'], capabilities: { tools: {} }, ...cache }
      : { tools: [{ name: 'blog_list_posts', title: 'Lister les articles' }, { name: 'blog_create_post', title: 'Créer un brouillon' }], ...cache };
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ jsonrpc: '2.0', id: corps.id, result: resultat }) });
  });
  return appels;
}
function verifierMutations(mutations: { header: string | undefined }[]) {
  expect(mutations.length).toBeGreaterThan(0);
  for (const mutation of mutations) expect(mutation.header).toBe('1');
}

test('connexion accessible, hors index et hors mesure même sur le serveur suivi', async ({ page }) => {
  const etat = await apiDouble(page);
  const requetesMesure: string[] = [];
  page.on('request', (request) => { if (/mesure\.js|umami|script\.js/.test(request.url())) requetesMesure.push(request.url()); });
  await page.goto(`${MESURE.url}/backoffice`);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow, noarchive');
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Se connecter', exact: true })).toBeEnabled();
  await accessibilite(page);
  await page.getByLabel('Adresse e-mail de connexion', { exact: true }).fill('admin@example.test');
  await page.getByLabel('Mot de passe', { exact: true }).fill('mauvais-mot-de-passe');
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
  await expect(page.locator('#bo-login-retour')).toHaveText('L’adresse e-mail ou le mot de passe est incorrect.');
  await expect(page.locator('#bo-login-retour')).toHaveAttribute('data-state', 'error');
  await expect(page.locator('#bo-workspace')).toBeHidden();
  await connecter(page);
  await expect(page.getByRole('heading', { name: 'Demandes de contact', level: 2 })).toBeFocused();
  await expect(rubrique(page, /^Demandes/)).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('#bo-password')).toHaveValue('');
  await accessibilite(page);
  expect(requetesMesure).toEqual([]);
  expect(await fileDeMesure(page)).toEqual([]);
  const sitemap = await page.request.get('/sitemap.xml');
  expect(await sitemap.text()).not.toContain('/backoffice');
  verifierMutations(etat.mutations);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('la première connexion configure la 2FA avant l’accès et affiche les codes de secours une seule fois', async ({ page }) => {
  const etat = await apiDouble(page, { twoFactor: true, enrollment: true });
  await page.goto('/backoffice');
  await page.getByLabel('Adresse e-mail de connexion').fill('admin@example.test');
  await page.getByLabel('Mot de passe', { exact: true }).fill('mot-de-passe-test');
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Configurer la vérification en deux étapes' })).toBeVisible();
  await expect(page.getByLabel('Clé à saisir manuellement')).toHaveValue(CLE_DEUX_FACTEURS);
  await expect(page.locator('#bo-two-factor-qr')).toHaveAttribute('src', QR_DEUX_FACTEURS);
  await expect(page.locator('#bo-password')).toHaveValue('');
  await expect(page.locator('#bo-workspace')).toBeHidden();
  expect(etat.consultations).toEqual(['/session']);
  await accessibilite(page);
  await page.getByLabel('Code de vérification').fill('000000');
  await page.getByRole('button', { name: 'Activer la vérification', exact: true }).click();
  await expect(page.locator('#bo-two-factor-retour')).toHaveText('Le code est incorrect ou a déjà été utilisé.');
  await expect(page.getByLabel('Clé à saisir manuellement')).toHaveValue(CLE_DEUX_FACTEURS);
  await expect(page.locator('#bo-login')).toBeHidden();
  await page.getByLabel('Code de vérification').fill('123456');
  await page.getByRole('button', { name: 'Activer la vérification', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Conservez vos codes de secours' })).toBeVisible();
  await expect(page.locator('#bo-recovery-codes code')).toHaveText(CODES_SECOURS);
  await expect(page.locator('#bo-workspace')).toBeHidden();
  await expect(page.locator('#bo-two-factor-secret')).toHaveValue('');
  await expect(page.locator('#bo-two-factor-code')).toHaveValue('');
  await expect(page.locator('#bo-two-factor-qr')).not.toHaveAttribute('src');
  expect(etat.consultations).toEqual(['/session']);
  await accessibilite(page);
  await page.getByRole('button', { name: 'J’ai conservé mes codes', exact: true }).click();
  await expect(page.locator('#bo-workspace')).toBeVisible();
  await expect(page.locator('#bo-recovery-codes')).toBeEmpty();
  await expect(page.locator('#bo-recovery')).toBeHidden();
  await page.getByRole('button', { name: 'Se déconnecter', exact: true }).click();
  await expect(page.locator('#bo-login')).toBeVisible();
  await expect(page.locator('#bo-two-factor-secret')).toHaveValue('');
  await expect(page.locator('#bo-recovery-codes')).toBeEmpty();
  verifierMutations(etat.mutations);
  expect(etat.mutations[0]?.body).toEqual({ email: 'admin@example.test', password: 'mot-de-passe-test' });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('les connexions suivantes acceptent un code d’application ou un code de secours sans nouvelle configuration', async ({ page }) => {
  const etat = await apiDouble(page, { twoFactor: true });
  await page.goto('/backoffice');
  for (const code of ['123456', CODES_SECOURS[0]!]) {
    await page.getByLabel('Adresse e-mail de connexion').fill('admin@example.test');
    await page.getByLabel('Mot de passe', { exact: true }).fill('mot-de-passe-test');
    await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Vérifier la connexion', exact: true })).toBeVisible();
    await expect(page.locator('#bo-enrollment')).toBeHidden();
    await expect(page.locator('#bo-workspace')).toBeHidden();
    await accessibilite(page);
    await page.getByLabel('Code de vérification').fill(code);
    await page.getByRole('button', { name: 'Vérifier le code', exact: true }).click();
    await expect(page.locator('#bo-workspace')).toBeVisible();
    await expect(page.locator('#bo-two-factor-code')).toHaveValue('');
    await expect(page.locator('#bo-recovery-codes')).toBeEmpty();
    await page.getByRole('button', { name: 'Se déconnecter', exact: true }).click();
    await expect(page.locator('#bo-login')).toBeVisible();
  }
  expect(etat.mutations.some(({ path }) => path === '/2fa/setup')).toBe(false);
  verifierMutations(etat.mutations);
});

test('une préparation interrompue peut être relancée et un défi expiré revient à la connexion sans secrets', async ({ page }) => {
  const etat = await apiDouble(page, { twoFactor: true, enrollment: true, setupFailures: 1 });
  await page.goto('/backoffice');
  await page.getByLabel('Adresse e-mail de connexion').fill('admin@example.test');
  await page.getByLabel('Mot de passe', { exact: true }).fill('mot-de-passe-test');
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
  await expect(page.locator('#bo-two-factor-retour')).toHaveText('La configuration est momentanément indisponible. Réessayez.');
  await expect(page.getByRole('button', { name: 'Revenir à la connexion' })).toBeEnabled();
  await page.getByRole('button', { name: 'Réessayer la configuration' }).click();
  await expect(page.getByLabel('Clé à saisir manuellement')).toHaveValue(CLE_DEUX_FACTEURS);
  etat.challenge = false;
  await page.getByLabel('Code de vérification').fill('123456');
  await page.getByRole('button', { name: 'Activer la vérification', exact: true }).click();
  await expect(page.locator('#bo-login')).toBeVisible();
  await expect(page.locator('#bo-two-factor')).toBeHidden();
  await expect(page.locator('#bo-two-factor-secret')).toHaveValue('');
  await expect(page.locator('#bo-two-factor-code')).toHaveValue('');
  await expect(page.locator('#bo-two-factor-qr')).not.toHaveAttribute('src');
  await expect(page.locator('#bo-workspace')).toBeHidden();
  await expect(page.locator('#bo-notice')).toHaveText('La vérification a expiré. Connectez-vous à nouveau.');
  await accessibilite(page);
});

test('une ancienne préparation ne remplace pas le secret d’une nouvelle connexion', async ({ page }) => {
  await apiDouble(page, { twoFactor: true, enrollment: true });
  let premier = true;
  let signalerAnciennePreparation!: () => void;
  let terminerAnciennePreparation!: () => void;
  const anciennePreparation = new Promise<void>((resolve) => { signalerAnciennePreparation = resolve; });
  const ancienneReponse = new Promise<void>((resolve) => { terminerAnciennePreparation = resolve; });
  await page.route('**/api/backoffice/2fa/setup', async (route) => {
    if (!premier) { await route.fallback(); return; }
    premier = false;
    signalerAnciennePreparation();
    await ancienneReponse;
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ secret: 'ANCIENNECLE', otpauth_url: 'otpauth://totp/Ancienne?secret=ANCIENNECLE', qr_code_data_url: QR_DEUX_FACTEURS }) });
  });
  await page.goto('/backoffice');
  await page.getByLabel('Adresse e-mail de connexion').fill('admin@example.test');
  await page.getByLabel('Mot de passe', { exact: true }).fill('mot-de-passe-test');
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
  await anciennePreparation;
  await page.getByRole('button', { name: 'Revenir à la connexion' }).click();
  await expect(page.locator('#bo-login')).toBeVisible();
  await page.getByLabel('Mot de passe', { exact: true }).fill('mot-de-passe-test');
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
  await expect(page.getByLabel('Clé à saisir manuellement')).toHaveValue(CLE_DEUX_FACTEURS);
  const reponseObsolete = page.waitForResponse((response) => response.url().endsWith('/2fa/setup'));
  terminerAnciennePreparation();
  await reponseObsolete;
  await expect(page.getByLabel('Clé à saisir manuellement')).toHaveValue(CLE_DEUX_FACTEURS);
  await page.getByLabel('Code de vérification').fill('123456');
  await page.getByRole('button', { name: 'Activer la vérification', exact: true }).click();
  await expect(page.locator('#bo-recovery-codes code')).toHaveText(CODES_SECOURS);
  await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true })));
  await expect(page.locator('#bo-recovery-codes')).toBeEmpty();
  await expect(page.locator('#bo-login')).toBeVisible();
  await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })));
  await expect(page.locator('#bo-workspace')).toBeVisible();
  await expect(page.locator('#bo-recovery-codes')).toBeEmpty();
  await expect(page.locator('#bo-two-factor-secret')).toHaveValue('');
});

test('la boîte réception gère les statuts et confirme la suppression sans exécuter le message', async ({ page }) => {
  const etat = await apiDouble(page, { authenticated: true });
  await page.goto('/backoffice');
  const ligne = page.locator('#bo-contact-list').getByRole('button');
  await expect(ligne).toHaveCount(1);
  await ligne.click();
  await expect(page.locator('#bo-contact-message')).toHaveText(DEMANDE.message);
  await expect(page.locator('#bo-contact-message img')).toHaveCount(0);
  expect(await page.evaluate(() => (window as unknown as { injection?: boolean }).injection)).toBeUndefined();
  await expect(page.locator('#bo-contact-delivery')).toHaveText('Échec de l’envoi');
  await expect(page.locator('#bo-contact-article')).toHaveClass(/foyer/);
  await page.getByRole('button', { name: 'Marquer comme lue', exact: true }).click();
  await expect(page.locator('#bo-new-count')).toHaveText('0');
  await expect(page.locator('#bo-contact-retour')).toHaveText('La demande est marquée comme lue.');
  await expect(rubrique(page, /^Demandes/)).toHaveAccessibleName('Demandes (aucune nouvelle demande)');
  await expect(page.locator('#bo-contact-empty')).toBeVisible();
  await page.getByLabel('Afficher les demandes').selectOption('read');
  await page.locator('#bo-contact-list').getByRole('button').click();
  await page.getByRole('button', { name: 'Marquer comme nouvelle', exact: true }).click();
  await expect(page.locator('#bo-new-count')).toHaveText('1');
  await page.getByLabel('Afficher les demandes').selectOption('all');
  await page.locator('#bo-contact-list').getByRole('button').click();
  await page.getByRole('button', { name: 'Archiver', exact: true }).click();
  await expect(page.locator('#bo-contact-state')).toHaveText('Archivée');
  await page.getByLabel('Afficher les demandes').selectOption('archived');
  await expect(page.locator('#bo-contact-list').getByRole('button')).toHaveCount(1);
  await page.getByRole('button', { name: 'Supprimer la demande', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await accessibilite(page);
  await page.getByRole('button', { name: 'Annuler', exact: true }).click();
  expect(etat.contacts).toHaveLength(1);
  await page.getByRole('button', { name: 'Supprimer la demande', exact: true }).click();
  await page.getByRole('button', { name: 'Supprimer définitivement', exact: true }).click();
  await expect(page.locator('#bo-contact-empty')).toBeVisible();
  await expect(page.locator('#bo-contact-retour')).toHaveText('La demande est supprimée.');
  expect(etat.contacts).toHaveLength(0);
  expect(etat.mutations.map(({ method, body }) => ({ method, body }))).toEqual([
    { method: 'PATCH', body: { status: 'read' } },
    { method: 'PATCH', body: { status: 'new' } },
    { method: 'PATCH', body: { status: 'archived' } },
    { method: 'DELETE', body: undefined },
  ]);
  verifierMutations(etat.mutations);
  await accessibilite(page);
});

test('le destinataire et les outils sont modifiables et les suggestions attendent une vraie adresse', async ({ page }) => {
  const etat = await apiDouble(page, { authenticated: true, smtp: false });
  await page.goto('/backoffice');
  await expect(page.locator('#bo-contact-list').getByRole('button')).toHaveCount(1);
  await rubrique(page, 'Adresse').focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/backoffice\?rubrique=settings$/);
  await expect(page.getByRole('heading', { name: 'Adresse de contact', level: 2 })).toBeFocused();
  await expect(rubrique(page, 'Adresse')).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('#bo-smtp-warning')).toBeVisible();
  await page.getByLabel('Adresse e-mail', { exact: true }).fill('nouvelle-adresse@example.test');
  await page.getByRole('button', { name: 'Enregistrer l’adresse' }).click();
  await expect(page.locator('#bo-settings-retour')).toHaveText('L’adresse de contact est enregistrée.');
  await expect(page.locator('#bo-notice')).toBeHidden();
  expect(etat.email).toBe('nouvelle-adresse@example.test');
  await accessibilite(page);
  await rubrique(page, 'Boîte à outils').click();
  await expect(page.locator('#bo-settings-retour')).toBeEmpty();
  await expect(page.locator('#bo-links-empty')).toBeVisible();
  await expect(page.locator('#bo-link-list a')).toHaveCount(0);
  await page.getByRole('button', { name: 'Umami', exact: true }).click();
  await expect(page.getByLabel('Nom de l’outil')).toHaveValue('Umami');
  await expect(page.getByLabel('Adresse du service')).toHaveValue('');
  expect(etat.links).toEqual([]);
  await page.getByLabel('Adresse du service').fill('https://umami.example.test');
  await page.locator('#bo-panel-links').getByLabel(/Description/).fill('Mesure d’audience');
  await page.getByRole('button', { name: 'Ajouter l’outil', exact: true }).click();
  const outil = page.locator('#bo-link-list li');
  await expect(outil.getByRole('link')).toHaveAttribute('href', 'https://umami.example.test/');
  await expect(outil.getByRole('link')).toHaveAttribute('rel', 'noopener noreferrer');
  await expect(page.locator('#bo-links-retour')).toHaveText('L’outil est ajouté.');
  await outil.getByRole('button', { name: 'Modifier Umami', exact: true }).click();
  await page.getByLabel('Nom de l’outil').fill('Mon Umami');
  await page.getByRole('button', { name: 'Enregistrer l’outil', exact: true }).click();
  await expect(outil.getByRole('link', { name: 'Mon Umami, ouvrir dans un nouvel onglet' })).toContainText('Mon Umami');
  await accessibilite(page);
  await outil.getByRole('button', { name: 'Supprimer Mon Umami', exact: true }).click();
  await page.getByRole('button', { name: 'Supprimer le raccourci', exact: true }).click();
  await expect(page.locator('#bo-links-empty')).toBeVisible();
  await expect(page.locator('#bo-links-list-retour')).toHaveText('Le raccourci vers Mon Umami est supprimé.');
  expect(etat.links).toEqual([]);
  verifierMutations(etat.mutations);
});

test('nouvel accès MCP en un geste : Rédaction sans les demandes, commande prête, vérification puis révocation', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const etat = await apiDouble(page, { authenticated: true });
  const appelsMcp = await mcpDouble(page);
  await page.goto('/backoffice');
  await expect(page.locator('#bo-contact-list').getByRole('button')).toHaveCount(1);
  await rubrique(page, 'Accès MCP').click();
  await expect(page).toHaveURL(/\/backoffice\?rubrique=tokens$/);
  await expect(page.getByRole('heading', { name: 'Accès MCP', level: 2 })).toBeFocused();
  await expect(page.locator('#bo-tokens-empty')).toBeVisible();
  const origine = new URL(page.url()).origin;
  await expect(page.locator('#bo-mcp-url')).toHaveText(`${origine}/mcp`);

  // Un geste : le nom est proposé, Rédaction est choisie, les demandes ne le sont pas.
  await expect(page.getByLabel('Nom de l’accès')).toHaveValue('Claude Code');
  await expect(page.getByRole('radio', { name: 'Rédaction', exact: true })).toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'Lire aussi les demandes de contact' })).not.toBeChecked();
  // Tout est prérempli : sur un écran de bureau, le bouton se voit sans défiler.
  const ecran = page.viewportSize()!;
  if (ecran.width >= 1200) {
    const bouton = await page.getByRole('button', { name: 'Créer l’accès', exact: true }).boundingBox();
    expect(bouton!.y + bouton!.height).toBeLessThanOrEqual(ecran.height);
  }
  await accessibilite(page);
  await page.getByRole('button', { name: 'Créer l’accès', exact: true }).click();
  expect(etat.mutations.find(({ path }) => path === '/tokens')?.body).toEqual({ name: 'Claude Code', scopes: ['blog:read', 'blog:write'] });

  // Une seule zone éclairée : la commande, avec l’origine du site et le secret.
  // Deux lignes : le serveur du même nom est d’abord retiré, pour qu’un nouvel accès remplace l’ancien.
  const commande = `claude mcp remove --scope user portfolio-local 2>/dev/null\nclaude mcp add --transport http --scope user portfolio-local ${origine}/mcp --header "Authorization: Bearer ${SECRET}"`;
  const carte = page.locator('#bo-secret');
  await expect(carte).toBeVisible();
  await expect(carte).toHaveClass(/foyer/);
  await expect(page.locator('.foyer:visible')).toHaveCount(1);
  await expect(page.locator('#bo-token-form')).toBeHidden();
  await expect(page.getByRole('heading', { name: 'L’accès « Claude Code » est prêt' })).toBeFocused();
  await expect(page.locator('#bo-token-command')).toHaveText(commande);
  await expect(page.locator('#bo-token-command .bo-commande__secret')).toHaveText(`${SECRET}"`);
  await expect(page.locator('#bo-token-command .bo-commande__mot').filter({ hasText: /^--scope$/ })).toHaveCount(2);
  // Une ligne de commande par bloc, sans ligne vide entre les deux ; quand la largeur
  // coupe une ligne, sa suite part en retrait (retrait suspendu) : elle ne se lit pas
  // comme une commande à part.
  const lignes = await page.locator('#bo-token-command .bo-commande__ligne').evaluateAll((blocs) => blocs.map((bloc) => {
    const mots = [...bloc.querySelectorAll('.bo-commande__mot, .bo-commande__secret')].flatMap((mot) => [...mot.getClientRects()]);
    const hauts = [...new Set(mots.map((rect) => Math.round(rect.top)))].sort((a, b) => a - b);
    const debut = bloc.getBoundingClientRect().left + Number.parseFloat(getComputedStyle(bloc).paddingLeft);
    const premiers = hauts.map((haut) => Math.min(...mots.filter((rect) => Math.round(rect.top) === haut).map((rect) => rect.left)));
    return { texte: bloc.textContent, haut: bloc.getBoundingClientRect().top, bas: bloc.getBoundingClientRect().bottom, lignes: hauts.length, interligne: Number.parseFloat(getComputedStyle(bloc).lineHeight), retraits: premiers.map((gauche) => Math.round(gauche - debut)) };
  }));
  expect(lignes.map(({ texte }) => texte)).toEqual(commande.split('\n').map((ligne, rang, toutes) => (rang < toutes.length - 1 ? `${ligne}\n` : ligne)));
  expect(Math.round(lignes[1].haut), 'aucune ligne vide entre les deux commandes').toBe(Math.round(lignes[0].bas));
  for (const ligne of lignes) {
    expect(Math.round(ligne.bas - ligne.haut), `${ligne.texte} : autant de lignes que de rangées de mots`).toBe(Math.round(ligne.lignes * ligne.interligne));
    expect(ligne.retraits[0], 'la commande commence au bord').toBeLessThan(0);
    for (const retrait of ligne.retraits.slice(1)) expect(retrait, 'sa suite est en retrait').toBeGreaterThanOrEqual(-1);
  }
  await expect(page.locator('#bo-secret-retour')).toHaveText('Accès créé avec la permission Rédaction.');
  await expect(page.locator('#bo-secret [data-serveur-mcp]')).toHaveText('portfolio-local');
  await page.getByRole('button', { name: 'Copier la commande', exact: true }).click();
  await expect(page.locator('#bo-secret-retour')).toHaveText('Commande copiée. Collez-la dans un terminal.');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(commande);
  await accessibilite(page);

  // La vérification suit Claude Code (révision 2026-07-28), avec le secret et sans cookie.
  await page.getByRole('button', { name: 'Vérifier l’accès', exact: true }).click();
  await expect(page.locator('#bo-token-tools-list li')).toHaveText(['Lister les articles', 'Créer un brouillon']);
  await expect(page.locator('#bo-secret-retour')).toHaveText('L’accès répond : le serveur MCP accepte ce secret.');
  expect(appelsMcp.map(({ methode }) => methode)).toEqual(['server/discover', 'tools/list']);
  for (const appel of appelsMcp) {
    expect(appel.autorisation).toBe(`Bearer ${SECRET}`);
    expect(appel.cookie).toBeUndefined();
    expect(appel.version).toBe('2026-07-28');
    expect(appel.enTeteMethode).toBe(appel.methode);
  }

  // La liste dit les permissions en mots ; la révocation rappelle de retirer le serveur.
  const ligne = page.locator('#bo-token-list tr');
  await expect(ligne).toHaveCount(1);
  await expect(ligne.getByRole('rowheader')).toHaveText('Claude Code');
  await expect(ligne.locator('.bo-etiquette')).toHaveText(['Rédaction']);
  await expect(ligne).toContainText('Jamais');
  await ligne.getByRole('button', { name: 'Révoquer Claude Code', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('ne pourra plus rien faire sur le portfolio');
  // La commande de retrait, seule en code, sans point collé.
  await expect(page.locator('#bo-confirm-code')).toHaveText('claude mcp remove --scope user portfolio-local');
  await expect(page.locator('#bo-confirm-message')).not.toContainText('claude mcp');
  await accessibilite(page);
  await page.getByRole('button', { name: 'Révoquer l’accès', exact: true }).click();
  await expect(page.locator('#bo-tokens-empty')).toBeVisible();
  await expect(page.locator('#bo-tokens-retour')).toHaveText('L’accès « Claude Code » est révoqué.');
  await expect(carte).toBeHidden();
  await expect(page.locator('#bo-token-command')).toBeEmpty();
  await expect(page.locator('#bo-token-secret')).toHaveValue('');
  expect(etat.tokens).toEqual([]);
  verifierMutations(etat.mutations);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('le secret ne s’affiche qu’une fois et les demandes de contact se demandent exprès', async ({ page }) => {
  const etat = await apiDouble(page, { authenticated: true });
  await page.goto('/backoffice?rubrique=tokens');
  await expect(page.getByLabel('Nom de l’accès')).toHaveValue('Claude Code');
  await page.getByLabel('Nom de l’accès').fill('Claude Code — MacBook');
  await page.getByRole('radio', { name: 'Publication', exact: true }).check();
  await page.getByRole('checkbox', { name: 'Lire aussi les demandes de contact' }).check();
  await page.getByRole('button', { name: 'Créer l’accès', exact: true }).click();
  expect(etat.mutations.at(-1)?.body).toEqual({ name: 'Claude Code — MacBook', scopes: ['contacts:read', 'blog:read', 'blog:write', 'blog:publish'] });
  await expect(page.locator('#bo-token-secret')).toHaveValue(SECRET);
  await expect(page.locator('#bo-secret-retour')).toHaveText('Accès créé avec les permissions Publication et Demandes de contact.');
  await expect(page.locator('#bo-token-list .bo-etiquette')).toHaveText(['Publication', 'Demandes de contact']);

  // Quitter la rubrique efface le secret ; au retour, le formulaire est prêt, avec un nom libre.
  await rubrique(page, 'Boîte à outils').click();
  await rubrique(page, 'Accès MCP').click();
  await expect(page.locator('#bo-secret')).toBeHidden();
  await expect(page.locator('#bo-token-secret')).toHaveValue('');
  await expect(page.locator('#bo-token-command')).toBeEmpty();
  await expect(page.getByRole('radio', { name: 'Rédaction', exact: true })).toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'Lire aussi les demandes de contact' })).not.toBeChecked();

  // « Terminé » efface aussi le secret et le dit là où était la carte.
  await page.getByRole('button', { name: 'Créer l’accès', exact: true }).click();
  expect(etat.mutations.at(-1)?.body).toEqual({ name: 'Claude Code', scopes: ['blog:read', 'blog:write'] });
  await page.getByRole('button', { name: 'Terminé', exact: true }).click();
  await expect(page.locator('#bo-token-secret')).toHaveValue('');
  await expect(page.locator('#bo-token-form-retour')).toHaveText('L’accès « Claude Code » reste actif. Son secret n’est plus affiché.');
  await expect(page.getByLabel('Nom de l’accès')).toHaveValue('Claude Code 2');
  await page.getByRole('button', { name: 'Se déconnecter', exact: true }).click();
  await expect(page.locator('#bo-login')).toBeVisible();
  await expect(page.locator('#bo-workspace')).toBeHidden();
  await expect(page.locator('#bo-navigation')).toBeHidden();
  await expect(page.locator('#bo-contact-list')).toBeEmpty();
  await expect(page.locator('#bo-token-list')).toBeEmpty();
  await expect(page.locator('#bo-email')).toHaveValue('');
  verifierMutations(etat.mutations);
});

test('le plafond des accès MCP s’explique à côté du formulaire', async ({ page }) => {
  await apiDouble(page, { authenticated: true, tokenLimit: true });
  await page.goto('/backoffice?rubrique=tokens');
  await page.getByRole('button', { name: 'Créer l’accès', exact: true }).click();
  await expect(page.locator('#bo-token-form-retour')).toHaveText('Le portfolio compte déjà 64 accès MCP, le maximum. Révoquez un accès inutilisé pour en créer un autre.');
  await expect(page.locator('#bo-token-form-retour')).toHaveAttribute('data-state', 'error');
  await expect(page.locator('#bo-secret')).toBeHidden();
  await expect(page.locator('#bo-notice')).toBeHidden();
});

test('une vérification abandonnée par « Terminé » se tait ; un secret refusé le dit dans la carte', async ({ page }) => {
  await apiDouble(page, { authenticated: true });
  let refuser = false;
  const appels = await mcpDouble(page, async () => (refuser
    ? { status: 401, corps: { jsonrpc: '2.0', id: 1, error: { code: -32001, message: 'Jeton refusé.' } } }
    : 'jamais'));
  await page.goto('/backoffice?rubrique=tokens');
  await page.getByRole('button', { name: 'Créer l’accès', exact: true }).click();
  await page.getByRole('button', { name: 'Vérifier l’accès', exact: true }).click();
  await expect(page.locator('#bo-secret-retour')).toHaveText('Vérification de l’accès…');
  await expect.poll(() => appels.length).toBe(1);
  await page.getByRole('button', { name: 'Terminé', exact: true }).click();
  await expect(page.locator('#bo-token-form-retour')).toHaveText('L’accès « Claude Code » reste actif. Son secret n’est plus affiché.');
  // Laisse à l’annulation le temps d’arriver : aucune fausse panne MCP.
  await page.evaluate(() => new Promise((fin) => setTimeout(fin, 300)));
  await expect(page.locator('#bo-notice')).toBeHidden();
  await expect(page.locator('#bo-notice')).not.toContainText('MCP');

  // Un secret refusé (accès révoqué ailleurs) : le message reste dans la carte.
  refuser = true;
  await page.getByRole('button', { name: 'Créer l’accès', exact: true }).click();
  await page.getByRole('button', { name: 'Vérifier l’accès', exact: true }).click();
  await expect(page.locator('#bo-secret-retour')).toHaveText('Le serveur MCP refuse ce secret : l’accès a sans doute été révoqué.');
  await expect(page.locator('#bo-secret-retour')).toHaveAttribute('data-state', 'error');
  await expect(page.locator('#bo-notice')).toBeHidden();
});

test('révoquer un accès efface « reste actif » sous le formulaire', async ({ page }) => {
  await apiDouble(page, { authenticated: true });
  await page.goto('/backoffice?rubrique=tokens');
  await page.getByRole('button', { name: 'Créer l’accès', exact: true }).click();
  await page.getByRole('button', { name: 'Terminé', exact: true }).click();
  await expect(page.locator('#bo-token-form-retour')).toHaveText('L’accès « Claude Code » reste actif. Son secret n’est plus affiché.');
  await page.locator('#bo-token-list tr').getByRole('button', { name: 'Révoquer Claude Code', exact: true }).click();
  await page.getByRole('button', { name: 'Révoquer l’accès', exact: true }).click();
  await expect(page.locator('#bo-tokens-retour')).toHaveText('L’accès « Claude Code » est révoqué.');
  await expect(page.locator('#bo-tokens-empty')).toBeVisible();
  await expect(page.locator('#bo-token-form-retour')).toBeEmpty();
});

test('Stockage : le disque, la base, les images et les articles, du plus lourd au plus léger', async ({ page }) => {
  const etat = await apiDouble(page, { authenticated: true });
  await page.goto('/backoffice');
  await expect(page.locator('#bo-contact-list').getByRole('button')).toHaveCount(1);
  // Dernière rubrique de l’en-tête, après Blog.
  await expect(page.getByRole('navigation', { name: 'Rubriques du backoffice' }).getByRole('link')).toHaveText([/^Demandes/, 'Adresse', 'Boîte à outils', 'Accès MCP', 'Blog', 'Stockage']);
  await rubrique(page, 'Stockage').click();
  await expect(page).toHaveURL(/\/backoffice\?rubrique=storage$/);
  await expect(page.getByRole('heading', { name: 'Stockage', level: 2 })).toBeFocused();
  await expect(rubrique(page, 'Stockage')).toHaveAttribute('aria-current', 'page');
  await expect(page).toHaveTitle('Stockage — Backoffice');
  const panneau = page.locator('#bo-panel-storage');
  await expect(panneau.locator('#bo-storage')).toBeVisible();

  // Le disque : l’espace libre sur l’espace total, sans alerte quand il reste de la place.
  await expect(panneau.locator('#bo-storage-disk-free')).toHaveText(`248${NBSP}Go`);
  await expect(panneau.locator('#bo-storage-disk-total')).toHaveText(`994,7${NBSP}Go`);
  await expect(panneau.locator('#bo-storage-disk-used')).toHaveText(`Occupé${NBSP}: 746,7${NBSP}Go, 75${NBSP}%`);
  await expect(panneau.locator('#bo-storage-disk-alert')).toBeEmpty();
  // La base : fichier et journal, puis sa répartition chiffrée.
  await expect(panneau.locator('#bo-storage-db-total')).toHaveText(`3,7${NBSP}Mo`);
  await expect(panneau.locator('#bo-storage-db-files')).toHaveText(`Fichier 4,1${NBSP}Ko et journal 3,7${NBSP}Mo.`);
  await expect(panneau.locator('#bo-storage-db-legend .bo-legende__libelle')).toHaveText(['Originaux des images', 'Variantes des images', 'Articles', 'Demandes de contact', 'Fonctionnement', 'Espace libéré']);
  await expect(panneau.getByText('Espace libéré : réutilisé par les prochains imports, le fichier ne rétrécit pas.')).toBeVisible();

  // Les images : la plus lourde d’abord ; l’image citée mène à son article et ne se supprime pas.
  const fiches = panneau.locator('#bo-storage-media > li');
  await expect(fiches).toHaveCount(2);
  await expect(panneau.locator('#bo-storage-media-count')).toHaveText(`2${NBSP}images, 2,7${NBSP}Mo`);
  const citee = fiches.nth(0);
  await expect(citee.locator('.bo-fiche__nom')).toHaveText('capture-atelier.jpg');
  await expect(citee).toContainText(`2000${NNBSP}×${NNBSP}1250${NBSP}px`);
  await expect(citee.locator('.bo-fiche__poids')).toHaveText(`2,1${NBSP}Mo`);
  await expect(citee).toContainText(`original 1,1${NBSP}Mo et 3${NBSP}variantes 1${NBSP}Mo`);
  // La vignette : la plus petite variante, privée, chargée à la demande, à taille fixe.
  const vignette = citee.getByRole('img', { name: 'capture-atelier.jpg' });
  await expect(vignette).toHaveAttribute('src', '/api/backoffice/blog/media/1/480');
  await expect(vignette).toHaveAttribute('loading', 'lazy');
  await expect(vignette).toHaveAttribute('width', '96');
  await expect(vignette).toHaveAttribute('height', '72');
  await expect(citee.getByRole('link', { name: 'Préparer une mise en ligne' })).toHaveAttribute('href', '/backoffice/blog/redaction?id=1');
  await expect(citee.locator('.bo-state')).toHaveText('Brouillon');
  await expect(citee.getByRole('button')).toHaveCount(0);
  const inutilisee = fiches.nth(1);
  await expect(inutilisee).toContainText('Inutilisée');
  await expect(inutilisee.getByRole('img', { name: 'schema.png' })).toHaveAttribute('src', '/api/backoffice/blog/media/2');
  // Les articles et les demandes.
  await expect(panneau.locator('#bo-storage-posts > li')).toHaveCount(1);
  await expect(panneau.locator('#bo-storage-posts').getByRole('link', { name: 'Préparer une mise en ligne' })).toBeVisible();
  await expect(panneau.locator('#bo-storage-posts .bo-fiche__poids')).toHaveText(`377${NBSP}o`);
  await expect(panneau.locator('#bo-storage-contacts-count')).toHaveText(`1${NBSP}demande`);
  await expect(page.locator('.foyer:visible')).toHaveCount(0);
  await accessibilite(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

  // Supprimer une image inutilisée : confirmée, puis elle disparaît et les chiffres suivent.
  await inutilisee.getByRole('button', { name: 'Supprimer schema.png', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('« schema.png » et ses variantes seront supprimées définitivement');
  await accessibilite(page);
  await page.getByRole('button', { name: 'Annuler', exact: true }).click();
  expect(etat.images).toHaveLength(2);
  await inutilisee.getByRole('button', { name: 'Supprimer schema.png', exact: true }).click();
  await page.getByRole('button', { name: 'Supprimer l’image', exact: true }).click();
  await expect(fiches).toHaveCount(1);
  await expect(panneau.locator('#bo-storage-media-retour')).toHaveText('« schema.png » est supprimée. Sa place sera réutilisée par les prochains imports.');
  await expect(panneau.locator('#bo-storage-media-count')).toHaveText(`1${NBSP}image, 2,1${NBSP}Mo`);
  await expect(page.getByRole('heading', { name: 'Images', level: 3 })).toBeFocused();
  expect(etat.images.map(({ id }) => id)).toEqual([1]);
  // Un corps JSON vide : le relais refuse une mutation du blog sans Content-Type JSON.
  expect(etat.mutations.map(({ method, path, body }) => ({ method, path, body }))).toEqual([{ method: 'DELETE', path: '/blog/media/2', body: {} }]);
  verifierMutations(etat.mutations);

  // « Actualiser » relit les chiffres et le dit à côté.
  await page.getByRole('button', { name: 'Actualiser', exact: true }).click();
  await expect(panneau.locator('#bo-storage-retour')).toHaveText('Les chiffres sont à jour.');
  // Quitter puis revenir relit le stockage.
  const lectures = etat.consultations.filter((chemin) => chemin === '/storage').length;
  await rubrique(page, 'Adresse').click();
  await rubrique(page, 'Stockage').click();
  await expect.poll(() => etat.consultations.filter((chemin) => chemin === '/storage').length).toBe(lectures + 1);
});

test('Stockage par son adresse : le disque qui se remplit, et une image prise entre-temps', async ({ page }) => {
  const etat = await apiDouble(page, { authenticated: true, disque: { total: 100_000_000_000, available: 5_000_000_000 }, imagePriseEntreTemps: 2, journalVide: true });
  await page.goto('/backoffice?rubrique=storage');
  await expect(page.getByRole('heading', { name: 'Stockage', level: 2 })).toBeVisible();
  // Après un redémarrage, le journal est vide : rien n’attend d’être reporté.
  await expect(page.locator('#bo-storage-db-files')).toHaveText(`Fichier 4,1${NBSP}Ko, journal vide.`);
  const alerte = page.locator('#bo-storage-disk-alert');
  await expect(alerte).toHaveRole('status');
  await expect(alerte).toHaveText(`Le disque se remplit${NBSP}: il reste 5${NBSP}Go, 5${NBSP}% du disque.`);
  await expect(page.locator('#bo-storage-disk')).toHaveAttribute('data-plein', 'true');
  await accessibilite(page);
  // Un article s’en sert depuis l’affichage : la suppression est refusée, la liste suit.
  await page.getByRole('button', { name: 'Supprimer schema.png', exact: true }).click();
  await page.getByRole('button', { name: 'Supprimer l’image', exact: true }).click();
  const retour = page.locator('#bo-storage-media-retour');
  await expect(retour).toHaveText('« schema.png » vient d’être utilisée dans un article : elle reste. La liste est à jour.');
  await expect(retour).toHaveAttribute('data-state', 'error');
  await expect(page.locator('#bo-storage-media .bo-fiche__action')).toHaveCount(0);
  await expect(page.locator('#bo-storage-media > li').nth(1)).toContainText('Utilisée dans');
  expect(etat.images).toHaveLength(2);
  await expect(page.locator('#bo-notice')).toBeHidden();
});

test('Stockage d’une base en mémoire : le disque est inconnu', async ({ page }) => {
  await apiDouble(page, { authenticated: true, disque: null });
  await page.goto('/backoffice?rubrique=storage');
  await expect(page.getByText('Disque inconnu : la base est en mémoire.')).toBeVisible();
  await expect(page.locator('#bo-storage-disk')).toBeHidden();
  await expect(page.locator('#bo-storage-db-total')).toHaveText(`3,4${NBSP}Mo`);
  await expect(page.locator('#bo-storage-db-files')).toHaveText(`Base en mémoire, 3,4${NBSP}Mo de pages.`);
});

test('la lanterne du backoffice passe à la nuit sans rien mettre en file de mesure', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await apiDouble(page, { authenticated: true });
  const requetesMesure: string[] = [];
  page.on('request', (request) => { if (/mesure\.js|umami|script\.js/.test(request.url())) requetesMesure.push(request.url()); });
  // Le serveur suivi : même là, le backoffice reste hors mesure.
  await page.goto(`${MESURE.url}/backoffice?rubrique=tokens`);
  await expect(page.locator('#bo-workspace')).toBeVisible();
  const bascule = page.locator('[data-theme-bascule]');
  await expect(bascule).toHaveCount(1);
  await expect(bascule).toHaveAttribute('data-sans-mesure', '');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'jour');
  await expect(bascule).toHaveAttribute('aria-pressed', 'false');
  await bascule.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'nuit');
  await expect(bascule).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Créer l’accès', exact: true }).click();
  await expect(page.locator('#bo-secret')).toBeVisible();
  await accessibilite(page);
  expect(await fileDeMesure(page)).toEqual([]);
  expect(requetesMesure).toEqual([]);
});

for (const theme of ['jour', 'nuit'] as const) {
  test.describe(`thème ${theme}`, () => {
    test.use({ colorScheme: theme === 'nuit' ? 'dark' : 'light' });

    test(`axe : la connexion (${theme})`, async ({ page }) => {
      await apiDouble(page);
      await page.goto('/backoffice');
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await expect(page.getByRole('button', { name: 'Se connecter', exact: true })).toBeEnabled();
      await expect(page.locator('#bo-login')).toHaveClass(/foyer/);
      await accessibilite(page);
    });

    test(`axe : chaque rubrique du backoffice et la carte du secret (${theme})`, async ({ page }) => {
      await apiDouble(page, { authenticated: true });
      await page.goto('/backoffice');
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await expect(page.locator('#bo-contact-list').getByRole('button')).toHaveCount(1);
      await page.locator('#bo-contact-list').getByRole('button').click();
      await accessibilite(page);
      for (const nom of ['Adresse', 'Boîte à outils', 'Accès MCP']) {
        await rubrique(page, nom).click();
        await expect(rubrique(page, nom)).toHaveAttribute('aria-current', 'page');
        await accessibilite(page);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      }
      await page.getByRole('button', { name: 'Créer l’accès', exact: true }).click();
      await expect(page.locator('#bo-secret')).toBeVisible();
      await page.locator('#bo-secret summary').click();
      await accessibilite(page);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    });

    test(`axe : la rubrique Stockage, disque plein compris (${theme})`, async ({ page }) => {
      await apiDouble(page, { authenticated: true, disque: { total: 100_000_000_000, available: 1_500_000_000 } });
      await page.goto('/backoffice?rubrique=storage');
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await expect(page.locator('#bo-storage-media > li')).toHaveCount(2);
      await expect(page.locator('#bo-storage-disk-alert')).not.toBeEmpty();
      await accessibilite(page);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    });
  });
}

test('une session expirée efface les données privées et revient à la connexion', async ({ page }) => {
  const etat = await apiDouble(page, { authenticated: true });
  await page.goto('/backoffice');
  await expect(page.locator('#bo-contact-list').getByRole('button')).toHaveCount(1);
  await page.locator('#bo-contact-list').getByRole('button').click();
  etat.authenticated = false;
  await page.getByRole('button', { name: 'Actualiser', exact: true }).click();
  await expect(page.locator('#bo-login')).toBeVisible();
  await expect(page.locator('#bo-workspace')).toBeHidden();
  await expect(page.locator('#bo-contact-message')).toBeEmpty();
  await expect(page.locator('#bo-contact-list')).toBeEmpty();
  await expect(page.locator('#bo-token-secret')).toHaveValue('');
  await expect(page.locator('#bo-notice')).toHaveAttribute('data-state', 'error');
  await accessibilite(page);
});
