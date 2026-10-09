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

/** Doubles de l’API, sans stockage réel ni envoi de courriel. */
async function apiDouble(page: Page, options: { authenticated?: boolean; smtp?: boolean; twoFactor?: boolean; enrollment?: boolean; setupFailures?: number } = {}) {
  const etat = {
    authenticated: options.authenticated ?? false,
    smtp: options.smtp ?? true,
    challenge: false,
    enrollment: options.enrollment ?? false,
    setupFailures: options.setupFailures ?? 0,
    email: 'contact@example.test',
    contacts: [{ ...DEMANDE }],
    links: [] as { id: number; label: string; url: string; description: string }[],
    tokens: [] as { id: number; name: string; created_at: string; last_used_at: string | null }[],
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
      if (body?.email !== 'admin@example.test' || body?.password !== 'mot-de-passe-test') { await repondre({ code: 'INVALID_CREDENTIALS', message: 'L’adresse e-mail ou le mot de passe est incorrect.' }, 401); return; }
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
        const jeton = { id: 1, name: body!.name!, created_at: '2026-10-08T09:00:00Z', last_used_at: null };
        etat.tokens.push(jeton);
        await repondre({ ...jeton, token: SECRET }); return;
      }
      await repondre({ tokens: etat.tokens }); return;
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
  await expect(page.locator('#bo-notice')).toHaveText('L’adresse e-mail ou le mot de passe est incorrect.');
  await expect(page.locator('#bo-workspace')).toBeHidden();
  await connecter(page);
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
  await expect(page.locator('#bo-notice')).toHaveText('Le code est incorrect ou a déjà été utilisé.');
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
  await expect(page.locator('#bo-notice')).toHaveText('La configuration est momentanément indisponible. Réessayez.');
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
  await page.getByRole('button', { name: 'Marquer comme lue', exact: true }).click();
  await expect(page.locator('#bo-new-count')).toHaveText('0');
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
  const tab = page.getByRole('tab', { name: /^Demandes/ });
  await tab.focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('tab', { name: 'Destinataire' })).toBeFocused();
  await expect(page.locator('#bo-smtp-warning')).toBeVisible();
  await page.getByLabel('Adresse e-mail', { exact: true }).fill('nouvelle-adresse@example.test');
  await page.getByRole('button', { name: 'Enregistrer l’adresse' }).click();
  await expect(page.locator('#bo-notice')).toHaveText('L’adresse de contact est enregistrée.');
  expect(etat.email).toBe('nouvelle-adresse@example.test');
  await accessibilite(page);
  await page.getByRole('tab', { name: 'Boîte à outils' }).click();
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
  await outil.getByRole('button', { name: 'Modifier', exact: true }).click();
  await page.getByLabel('Nom de l’outil').fill('Mon Umami');
  await page.getByRole('button', { name: 'Enregistrer l’outil', exact: true }).click();
  await expect(outil.getByRole('link')).toHaveText('Mon Umami');
  await accessibilite(page);
  await outil.getByRole('button', { name: 'Supprimer', exact: true }).click();
  await page.getByRole('button', { name: 'Supprimer le raccourci', exact: true }).click();
  await expect(page.locator('#bo-links-empty')).toBeVisible();
  expect(etat.links).toEqual([]);
  verifierMutations(etat.mutations);
});

test('le jeton MCP ne reste affiché qu’une fois puis son accès peut être révoqué', async ({ page }) => {
  const etat = await apiDouble(page, { authenticated: true });
  await page.goto('/backoffice');
  await expect(page.locator('#bo-contact-list').getByRole('button')).toHaveCount(1);
  await page.getByRole('tab', { name: 'Accès MCP', exact: true }).click();
  await expect(page.locator('#bo-mcp-url')).toHaveText(new URL('/mcp', page.url()).href);
  await expect(page.getByRole('heading', { name: 'Connexion MCP' })).toBeVisible();
  await page.getByLabel('Nom de la connexion').fill('Mon assistant');
  await page.getByRole('button', { name: 'Créer le jeton', exact: true }).click();
  await expect(page.getByLabel('Jeton de connexion')).toHaveValue(SECRET);
  await expect(page.locator('#bo-token-list')).toContainText('Mon assistant');
  await accessibilite(page);
  await page.getByRole('tab', { name: 'Boîte à outils', exact: true }).click();
  await page.getByRole('tab', { name: 'Accès MCP', exact: true }).click();
  await expect(page.locator('#bo-secret')).toBeHidden();
  await expect(page.locator('#bo-token-secret')).toHaveValue('');
  await page.getByRole('button', { name: 'Révoquer', exact: true }).click();
  await page.getByRole('button', { name: 'Révoquer l’accès', exact: true }).click();
  await expect(page.locator('#bo-tokens-empty')).toBeVisible();
  expect(etat.tokens).toEqual([]);
  await page.getByRole('button', { name: 'Se déconnecter', exact: true }).click();
  await expect(page.locator('#bo-login')).toBeVisible();
  await expect(page.locator('#bo-workspace')).toBeHidden();
  await expect(page.locator('#bo-contact-list')).toBeEmpty();
  await expect(page.locator('#bo-email')).toHaveValue('');
  verifierMutations(etat.mutations);
});

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
