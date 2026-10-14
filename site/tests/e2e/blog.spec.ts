import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const REGLES_AXE = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

type Post = {
  id: number; title: string; slug: string; excerpt: string; content: Record<string, unknown>;
  cover_image: string | null; cover_alt: string; tags: string[]; seo_title: string; seo_description: string;
  canonical_url: string | null; og_image: string | null; noindex: boolean;
  status: 'draft' | 'scheduled' | 'published'; scheduled_at: number | null; published_at: number | null;
  created_at: string; updated_at: string; revision: number; has_unpublished_changes: boolean; scheduled_revision: number | null;
};
const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jZioAAAAASUVORK5CYII=';
const DESCRIPTION = 'Un retour sur la conception d’un blog administrable, la préparation des brouillons et le choix de leurs dates de publication.';
function post(id = 1): Post {
  return { id, title: 'Préparer une publication avec soin', slug: 'preparer-une-publication', excerpt: DESCRIPTION,
    content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Le contenu conservé.' }] }] },
    cover_image: null, cover_alt: '', tags: [], seo_title: '', seo_description: '', canonical_url: null, og_image: null,
    noindex: false, status: 'draft', scheduled_at: null, published_at: null, created_at: '2026-10-08T09:00:00Z',
    updated_at: '2026-10-08T09:00:00Z', revision: 1, has_unpublished_changes: false, scheduled_revision: null };
}
async function mockApi(page: Page, posts: Post[] = []) {
  const state = { posts, authenticated: true, conflict: false, media: [] as { id: number; filename: string; url: string; content_type: string; size: number; created_at: string }[], mutations: [] as { path: string; method: string; body: Record<string, unknown>; header?: string }[], uploadRefusal: null as null | { status: number; code: string; message: string } };
  await page.context().route('**/api/backoffice/**', async (route) => {
    const request = route.request(); const url = new URL(request.url());
    const path = url.pathname.replace('/api/backoffice', '');
    const method = request.method();
    const body = request.postData() ? request.postDataJSON() as Record<string, unknown> : {};
    const send = (value: unknown, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(value) });
    if (path === '/session') { await send({ authenticated: state.authenticated, smtp_configured: true }, state.authenticated ? 200 : 401); return; }
    if (path === '/login') { state.authenticated = true; await send({ authenticated: true }); return; }
    if (!state.authenticated) { await send({ message: 'La session a expiré. Connectez-vous à nouveau.' }, 401); return; }
    if (method !== 'GET') state.mutations.push({ path, method, body, header: request.headers()['x-backoffice-request'] });
    if (path === '/settings') { await send({ email: 'contact@example.test' }); return; }
    if (path === '/contacts') { await send({ contacts: [], total: 0, new_count: 0 }); return; }
    if (path === '/links') { await send({ links: [] }); return; }
    if (path === '/tokens') {
      await send(method === 'POST' ? { token: 'test-token', id: 1, name: body.name, scopes: body.scopes } : { tokens: [] }); return;
    }
    if (path === '/logout') { state.authenticated = false; await send({}); return; }
    if (path.startsWith('/blog/media/')) { await route.fulfill({ contentType: 'image/png', body: Buffer.from(PNG, 'base64') }); return; }
    if (path.startsWith('/blog/preview/')) { await route.fulfill({ contentType: 'text/html; charset=utf-8', body: '<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Aperçu privé</title></head><body><h1>Aperçu privé</h1></body></html>' }); return; }
    if (path === '/blog/media') {
      if (method === 'POST' && state.uploadRefusal) {
        const { status, code, message } = state.uploadRefusal;
        await route.fulfill({ status, contentType: 'application/json', headers: status === 503 ? { 'Retry-After': '10' } : {}, body: JSON.stringify({ code, message }) }); return;
      }
      if (method === 'POST') {
        const item = { id: state.media.length + 1, filename: String(body.filename), content_type: String(body.content_type), size: 68, url: `/api/blog/media/${state.media.length + 1}`, created_at: '2026-10-08T09:00:00Z' };
        state.media.push(item); await send(item); return;
      }
      const offset = Number(url.searchParams.get('offset') ?? 0); const limit = Number(url.searchParams.get('limit') ?? 100);
      await send({ media: state.media.slice(offset, offset + limit), offset, limit }); return;
    }
    if (path === '/blog/posts') {
      if (method === 'POST') {
        const created = { ...post(state.posts.length + 1), ...body } as Post;
        state.posts.push(created); await send(created); return;
      }
      const status = url.searchParams.get('status');
      const matching = state.posts.filter((item) => !status || status === 'all' || item.status === status);
      const offset = Number(url.searchParams.get('offset') ?? 0); const limit = Number(url.searchParams.get('limit') ?? 20);
      await send({ posts: matching.slice(offset, offset + limit).map(({ content: _content, ...summary }) => summary), total: matching.length, offset, limit }); return;
    }
    const match = path.match(/^\/blog\/posts\/(\d+)(?:\/(publish|schedule|unpublish))?$/);
    if (match) {
      const item = state.posts.find((entry) => entry.id === Number(match[1]));
      if (!item) { await send({ message: 'Cet article n’existe pas.', code: 'NOT_FOUND' }, 404); return; }
      if (method !== 'GET' && (state.conflict || item.revision !== body.revision)) { await send({ message: 'L’article a été modifié depuis son ouverture.', code: 'REVISION_CONFLICT' }, 409); return; }
      if (method === 'PUT') { Object.assign(item, body); item.revision += 1; item.has_unpublished_changes = item.status !== 'draft'; }
      if (match[2] === 'publish') { item.status = 'published'; item.published_at = Math.floor(Date.now() / 1000); item.scheduled_at = null; item.revision += 1; item.has_unpublished_changes = false; }
      if (match[2] === 'schedule') { item.status = 'scheduled'; item.scheduled_at = Number(body.scheduled_at); item.revision += 1; item.scheduled_revision = item.revision; item.has_unpublished_changes = false; }
      if (match[2] === 'unpublish') { item.status = 'draft'; item.scheduled_at = null; item.revision += 1; item.has_unpublished_changes = false; }
      if (method === 'DELETE') { state.posts = state.posts.filter((entry) => entry.id !== item.id); await send({}); return; }
      await send(item); return;
    }
    await send({ message: 'Route de test inconnue.' }, 404);
  });
  return state;
}
/** Une rubrique du backoffice, par la navigation de l’en-tête. */
function rubrique(page: Page, nom: string) {
  return page.getByRole('navigation', { name: 'Rubriques du backoffice' }).getByRole('link', { name: nom, exact: true });
}
async function openBlog(page: Page) {
  await page.goto('/backoffice');
  await expect(page.locator('#bo-workspace')).toBeVisible();
  await rubrique(page, 'Blog').click();
  await expect(page).toHaveURL(/\/backoffice\/blog$/);
  await expect(page.getByRole('button', { name: 'Nouvel article', exact: true })).toBeEnabled();
}
type Section = 'redaction' | 'medias' | 'seo' | 'publication';
const SECTIONS: Section[] = ['redaction', 'medias', 'seo', 'publication'];
const SECTION_MARKERS: Record<Section, string> = { redaction: '#blog-editor', medias: '#blog-cover', seo: '#blog-seo-title', publication: '#blog-scheduled-at' };
async function onlySection(page: Page, section: Section) {
  await expect(page.locator('#blog-list-view')).toBeHidden();
  for (const candidate of SECTIONS) {
    const marker = page.locator(SECTION_MARKERS[candidate]);
    if (candidate === section) await expect(marker).toBeVisible();
    else await expect(marker).toBeHidden();
  }
  for (const selector of ['#blog-save', '#blog-preview', '#blog-back']) {
    await expect(page.locator(selector)).toHaveCount(1);
    await expect(page.locator(selector)).toBeVisible();
  }
  await expect(page.locator('#blog-save')).toHaveText('Enregistrer');
  await expect(page.locator('#blog-preview')).toHaveText('Aperçu');
  await expect(page.locator('#blog-back')).toHaveText('Retour aux articles');
}
async function section(page: Page, target: Section, id?: number) {
  await page.locator(`[data-blog-section-link="${target}"]`).click();
  await expect(page).toHaveURL(new RegExp(`/backoffice/blog/${target}${id ? `\\?id=${id}` : ''}$`));
  await onlySection(page, target);
}
async function accessible(page: Page) {
  // La barre de l’article colle en haut pendant l’édition : selon le défilement,
  // axe la compte comme un obstacle posé sur les commandes qu’elle survole
  // (target-size, color-contrast). L’analyse part donc du haut de la page ;
  // l’état défilé, lui, est couvert par « la barre collante ne masque jamais
  // le champ qui reçoit le focus », au clavier, sur chaque page de l’article.
  await page.evaluate(() => window.scrollTo(0, 0));
  const result = await new AxeBuilder({ page }).withTags(REGLES_AXE).analyze();
  expect(result.violations.map((entry) => ({ rule: entry.id, nodes: entry.nodes.map((node) => node.target) }))).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
}

test('rédiger un brouillon riche, décrire une image et ouvrir un aperçu privé', async ({ page }) => {
  const state = await mockApi(page);
  const errors: string[] = []; page.on('pageerror', (error) => errors.push(error.message));
  await openBlog(page);
  await expect(page.locator('#blog-empty')).toBeVisible();
  await page.getByRole('button', { name: 'Nouvel article', exact: true }).click();
  await expect(page).toHaveURL(/\/backoffice\/blog\/redaction$/);
  await onlySection(page, 'redaction');
  await page.getByLabel('Titre de l’article', { exact: true }).fill('Écrire et relire avant de publier');
  await expect(page.getByLabel('Adresse de l’article', { exact: true })).toHaveValue('ecrire-et-relire-avant-de-publier');
  await page.getByLabel('Résumé', { exact: true }).fill(DESCRIPTION);
  const editor = page.getByRole('textbox', { name: 'Contenu de l’article', exact: true });
  await editor.fill('Une méthode de rédaction');
  await editor.press('ControlOrMeta+A');
  await page.getByRole('button', { name: 'Gras', exact: true }).click();
  await page.getByLabel('Style du paragraphe').selectOption('2');
  await editor.press('ArrowRight');
  await editor.press('Enter');
  await page.getByRole('button', { name: 'Image', exact: true }).click();
  await page.getByLabel('Fichier image').setInputFiles({ name: 'illustration.png', mimeType: 'image/png', buffer: Buffer.from(PNG, 'base64') });
  await page.getByRole('button', { name: 'Téléverser l’image', exact: true }).click();
  await expect(page.locator('#blog-image-src')).toHaveValue('/api/blog/media/1');
  await page.getByLabel('Description de l’image', { exact: true }).fill('Un point lumineux sur fond clair');
  await page.getByRole('button', { name: 'Utiliser cette image', exact: true }).click();
  await expect(editor.locator('img')).toHaveAttribute('src', '/api/backoffice/blog/media/1');
  await editor.press('ControlOrMeta+End');
  await page.getByRole('button', { name: 'Tableau', exact: true }).click();
  await expect(editor.locator('table')).toBeVisible();
  for (let index = 0; index < 3; index += 1) await editor.locator('th p').nth(index).fill(`Colonne ${index + 1}`);
  if ((page.viewportSize()?.width ?? 1440) <= 760) {
    const tableScroll = editor.locator('.tableWrapper');
    expect(await tableScroll.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
    await tableScroll.focus();
    await tableScroll.evaluate((element) => { element.scrollLeft = 0; });
    await tableScroll.press('ArrowRight');
    expect(await tableScroll.evaluate((element) => element.scrollLeft > 0)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
  await accessible(page);
  await page.locator('#blog-save').click();
  await expect(page.locator('#blog-save-state')).toHaveText('Enregistré');
  await expect(page).toHaveURL(/\/backoffice\/blog\/redaction\?id=1$/);
  await section(page, 'seo', 1);
  await page.getByLabel('Titre pour les moteurs de recherche', { exact: true }).fill('Un blog avec brouillons, relecture et publication');
  await expect(page.locator('#blog-serp-title')).toHaveText('Un blog avec brouillons, relecture et publication');
  await section(page, 'publication', 1);
  await expect(page.getByRole('button', { name: 'Publier maintenant', exact: true })).toBeDisabled();
  await page.locator('#blog-save').click();
  await expect(page.locator('#blog-save-state')).toHaveText('Enregistré');
  expect(state.posts).toHaveLength(1);
  expect(state.posts[0]?.status).toBe('draft');
  const content = JSON.stringify(state.posts[0]?.content);
  expect(content).toContain('"bold"'); expect(content).toContain('"heading"'); expect(content).toContain('"table"');
  expect(content).toContain('/api/blog/media/1'); expect(content).not.toContain('/api/backoffice/blog/media/1');
  await accessible(page);
  const popup = page.waitForEvent('popup');
  await page.locator('#blog-preview').click();
  const preview = await popup;
  await expect(preview).toHaveURL(/\/api\/backoffice\/blog\/preview\/1$/);
  await expect(preview.getByRole('heading', { name: 'Aperçu privé' })).toBeVisible();
  await preview.close();
  expect(state.posts[0]?.status).toBe('draft');
  expect(errors).toEqual([]);
  for (const mutation of state.mutations) expect(mutation.header).toBe('1');
});

test('l’atelier montre tel quel le refus d’une image trop lourde à réduire ou d’un import en attente', async ({ page }) => {
  const state = await mockApi(page);
  await openBlog(page);
  await page.getByRole('button', { name: 'Nouvel article', exact: true }).click();
  await onlySection(page, 'redaction');
  await page.getByRole('button', { name: 'Image', exact: true }).click();
  const notice = page.locator('#blog-media-notice');
  // Les messages du backend (blog.rs, upload_queue.rs), recopiés tels quels.
  for (const refusal of [
    { status: 422, code: 'IMAGE_TOO_HEAVY', message: 'Cette image est trop lourde à réduire. Exportez-la en JPEG ou en PNG 8 bits, ou réduisez-la (3\u202f000\u00a0px sur le plus grand côté suffisent).' },
    { status: 503, code: 'UPLOAD_BUSY', message: 'D’autres images sont en cours d’import. Réessayez dans quelques secondes.' },
  ]) {
    state.uploadRefusal = refusal;
    await page.getByLabel('Fichier image').setInputFiles({ name: 'photo.png', mimeType: 'image/png', buffer: Buffer.from(PNG, 'base64') });
    await page.getByRole('button', { name: 'Téléverser l’image', exact: true }).click();
    await expect(notice).toHaveText(refusal.message);
    await expect(notice).toHaveAttribute('data-state', 'error');
    await expect(page.locator('#blog-image-src')).toHaveValue('');
  }
  expect(state.media).toEqual([]);
  await expect(page.getByRole('button', { name: 'Téléverser l’image', exact: true })).toBeEnabled();
});

test('programmer en heure locale, garder les retouches privées et republier avec une révision', async ({ page }) => {
  const state = await mockApi(page, [post()]);
  await openBlog(page);
  await page.locator('#blog-post-list').getByRole('link').click();
  await expect(page).toHaveURL(/\/backoffice\/blog\/redaction\?id=1$/);
  await section(page, 'publication', 1);
  await expect(page.locator('#blog-timezone')).toContainText('Europe/Paris');
  await page.getByLabel('Date et heure de publication').fill('2030-06-08T14:30');
  await page.getByRole('button', { name: 'Programmer la publication', exact: true }).click();
  await expect(page.locator('#blog-status')).toHaveText('Programmé');
  expect(state.posts[0]?.scheduled_at).toBe(Date.parse('2030-06-08T12:30:00Z') / 1000);
  const scheduledRevision = state.posts[0]?.scheduled_revision;
  await section(page, 'redaction', 1);
  await page.getByLabel('Titre de l’article', { exact: true }).fill('Une retouche encore privée');
  await page.locator('#blog-save').click();
  await expect(page.locator('#blog-save-state')).toHaveText('Enregistré');
  await section(page, 'publication', 1);
  await expect(page.locator('#blog-publication-help')).toContainText('Reprogrammez');
  expect(state.posts[0]?.scheduled_revision).toBe(scheduledRevision);
  await page.getByRole('button', { name: 'Publier maintenant', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Publier cet article ?' })).toBeVisible();
  await page.getByRole('button', { name: 'Publier l’article', exact: true }).click();
  await expect(page.locator('#blog-status')).toHaveText('Publié');
  expect(state.posts[0]?.scheduled_at).toBeNull();
  await page.getByRole('button', { name: 'Revenir en brouillon', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Revenir en brouillon', exact: true }).click();
  await expect(page.locator('#blog-status')).toHaveText('Brouillon');
  const actions = state.mutations.filter((mutation) => /\/posts\/1\//.test(mutation.path));
  expect(actions.map((action) => action.body.revision)).toEqual([1, 3, 4]);
  await accessible(page);
});

test('un conflit conserve le travail, les sorties le protègent et la suppression exige une confirmation', async ({ page }) => {
  const state = await mockApi(page, [post()]);
  await openBlog(page); await page.locator('#blog-post-list').getByRole('link').click();
  await page.getByLabel('Titre de l’article', { exact: true }).fill('Ma version à conserver');
  state.conflict = true;
  await page.locator('#blog-save').click();
  await expect(page.locator('#blog-notice')).toContainText('Vos modifications restent dans l’éditeur');
  await expect(page.getByLabel('Titre de l’article', { exact: true })).toHaveValue('Ma version à conserver');
  await page.locator('#blog-back').click();
  await page.getByRole('dialog').getByRole('button', { name: 'Annuler', exact: true }).click();
  await expect(page.getByLabel('Titre de l’article', { exact: true })).toHaveValue('Ma version à conserver');
  state.conflict = false;
  await page.locator('#blog-back').click();
  await page.getByRole('button', { name: 'Quitter sans enregistrer', exact: true }).click();
  await expect(page).toHaveURL(/\/backoffice\/blog$/);
  await page.locator('#blog-post-list').getByRole('link').click();
  await expect(page.getByLabel('Titre de l’article', { exact: true })).toHaveValue('Préparer une publication avec soin');
  await section(page, 'publication', 1);
  await page.locator('.blog-danger-zone summary').click();
  await page.locator('#blog-delete').click();
  await page.getByRole('dialog').getByRole('button', { name: 'Annuler', exact: true }).click();
  expect(state.posts).toHaveLength(1);
  await page.locator('#blog-delete').click();
  await page.getByRole('dialog').getByRole('button', { name: 'Supprimer l’article', exact: true }).click();
  await expect(page.locator('#blog-empty')).toBeVisible();
  await expect(page).toHaveURL(/\/backoffice\/blog$/);
  expect(state.posts).toHaveLength(0);
  expect(state.mutations.find((mutation) => mutation.method === 'DELETE')?.body).toEqual({ revision: 1 });
});

test('un accès MCP de rédaction ne lit pas les demandes par défaut et une expiration efface l’article privé', async ({ page }) => {
  const state = await mockApi(page, [post()]);
  await openBlog(page);
  await rubrique(page, 'Accès MCP').click();
  await page.getByLabel('Nom de l’accès').fill('Rédacteur');
  await expect(page.getByRole('radio', { name: 'Rédaction', exact: true })).toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'Lire aussi les demandes de contact' })).not.toBeChecked();
  await page.getByRole('button', { name: 'Créer l’accès', exact: true }).click();
  await expect(page.locator('#bo-token-command')).toContainText('Authorization: Bearer test-token');
  expect(state.mutations.find((mutation) => mutation.path === '/tokens')?.body).toEqual({ name: 'Rédacteur', scopes: ['blog:read', 'blog:write'] });
  await rubrique(page, 'Blog').click();
  await expect(page.locator('#bo-token-command')).toBeEmpty();
  await page.locator('#blog-post-list').getByRole('link').click();
  await page.getByLabel('Titre de l’article', { exact: true }).fill('Titre privé de la session');
  state.authenticated = false;
  await page.locator('#blog-save').click();
  await expect(page.locator('#bo-workspace')).toBeHidden();
  await expect(page.locator('#bo-login')).toBeVisible();
  await expect(page.locator('#blog-title')).toHaveValue('');
  await expect(page.locator('.blog-editor-content')).not.toContainText('Le contenu conservé.');
  await expect(page.locator('#blog-post-list')).toBeEmpty();
  await expect(page.locator('#bo-token-secret')).toHaveValue('');
  await page.getByLabel('Adresse e-mail de connexion', { exact: true }).fill('admin@example.test');
  await page.getByLabel('Mot de passe', { exact: true }).fill('mot-de-passe-test');
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
  await expect(page.getByLabel('Titre de l’article', { exact: true })).toHaveValue('Titre privé de la session');
  await expect(page.locator('#blog-save-state')).toHaveText('Modifications non enregistrées');
  await expect(page.locator('#blog-notice')).toContainText('Votre rédaction a été conservée');
});

test('la bibliothèque charge les images suivantes et les liens internes sont conservés', async ({ page }) => {
  const state = await mockApi(page, [post()]);
  state.media = Array.from({ length: 101 }, (_, index) => ({ id: index + 1, filename: `image-${index + 1}.png`, url: `/api/blog/media/${index + 1}`, content_type: 'image/png', size: 68, created_at: '2026-10-08T09:00:00Z' }));
  await openBlog(page); await page.locator('#blog-post-list').getByRole('link').click();
  await expect(page.getByLabel('Titre de l’article', { exact: true })).toBeFocused();
  const editor = page.getByRole('textbox', { name: 'Contenu de l’article', exact: true });
  await editor.fill('Lire l’article précédent'); await editor.press('ControlOrMeta+A');
  await page.getByRole('button', { name: 'Lien', exact: true }).click();
  await page.getByLabel('Adresse du lien', { exact: true }).fill('/blog/article-precedent');
  await page.getByRole('button', { name: 'Appliquer le lien', exact: true }).click();
  await expect(editor.locator('a')).toHaveAttribute('href', '/blog/article-precedent');
  await editor.press('ArrowRight'); await editor.press('Enter');
  await page.getByRole('button', { name: 'Image', exact: true }).click();
  await expect(page.locator('#blog-media-list button')).toHaveCount(100);
  await page.getByRole('button', { name: 'Charger plus d’images', exact: true }).click();
  await expect(page.locator('#blog-media-list button')).toHaveCount(101);
  await expect(page.getByRole('button', { name: 'Charger plus d’images', exact: true })).toBeHidden();
  await page.getByRole('button', { name: 'image-101.png', exact: true }).click();
  await page.getByLabel('Description de l’image', { exact: true }).fill('La dernière image de la bibliothèque');
  await page.getByRole('button', { name: 'Utiliser cette image', exact: true }).click();
  await page.locator('#blog-save').click();
  await expect(page.locator('#blog-save-state')).toHaveText('Enregistré');
  const saved = JSON.stringify(state.posts[0]?.content);
  expect(saved).toContain('/blog/article-precedent'); expect(saved).toContain('/api/blog/media/101');
});

test('chaque écran possède une adresse directe et reste unique, accessible et rechargeable', async ({ page }) => {
  await mockApi(page, [post()]);
  for (const target of SECTIONS) {
    await page.goto(`/backoffice/blog/${target}?id=1`);
    await expect(page.locator('#bo-workspace')).toBeVisible();
    await onlySection(page, target);
    await expect(page.locator('#blog-title')).toHaveValue('Préparer une publication avec soin');
    await accessible(page);
    await page.reload();
    await expect(page).toHaveURL(new RegExp(`/backoffice/blog/${target}\\?id=1$`));
    await onlySection(page, target);
    await expect(page.locator('#blog-title')).toHaveValue('Préparer une publication avec soin');
  }
  await page.goto('/backoffice/blog');
  await expect(page.locator('#blog-post-list').getByRole('link')).toHaveCount(1);
  await expect(page.locator('#blog-edit-view')).toBeHidden();
  await accessible(page);
});

test('la rédaction reste intacte entre les pages et les retours du navigateur, sans enregistrement implicite', async ({ page }) => {
  const state = await mockApi(page, [post()]);
  await openBlog(page);
  await page.locator('#blog-post-list').getByRole('link').click();
  await expect(page).toHaveURL(/\/backoffice\/blog\/redaction\?id=1$/);
  await page.locator('#blog-title').fill('Une rédaction conservée entre les écrans');
  await page.getByRole('textbox', { name: 'Contenu de l’article', exact: true }).fill('Le texte encore non enregistré accompagne la navigation.');
  await section(page, 'seo', 1);
  await page.locator('#blog-seo-title').fill('Un titre SEO conservé pendant la navigation');
  await section(page, 'medias', 1);
  await page.locator('#blog-cover-alt').fill('Une description préparée pour la couverture');
  await section(page, 'publication', 1);
  await expect(page.locator('#blog-publish')).toBeDisabled();
  expect(state.mutations).toHaveLength(0);

  await page.goBack();
  await expect(page).toHaveURL(/\/backoffice\/blog\/medias\?id=1$/);
  await onlySection(page, 'medias');
  await expect(page.locator('#blog-cover-alt')).toHaveValue('Une description préparée pour la couverture');
  await page.goBack();
  await onlySection(page, 'seo');
  await expect(page.locator('#blog-seo-title')).toHaveValue('Un titre SEO conservé pendant la navigation');
  await page.goBack();
  await onlySection(page, 'redaction');
  await expect(page.locator('#blog-title')).toHaveValue('Une rédaction conservée entre les écrans');
  await expect(page.getByRole('textbox', { name: 'Contenu de l’article', exact: true })).toContainText('Le texte encore non enregistré accompagne la navigation.');
  expect(state.mutations).toHaveLength(0);

  await page.goBack();
  await expect(page.getByRole('dialog', { name: 'Quitter sans enregistrer ?' })).toBeVisible();
  await page.getByRole('dialog').getByRole('button', { name: 'Annuler', exact: true }).click();
  await expect(page).toHaveURL(/\/backoffice\/blog\/redaction\?id=1$/);
  await expect(page.locator('#blog-title')).toHaveValue('Une rédaction conservée entre les écrans');
  await page.locator('#blog-save').click();
  await expect(page.locator('#blog-save-state')).toHaveText('Enregistré');
  expect(state.posts[0]?.seo_title).toBe('Un titre SEO conservé pendant la navigation');
  expect(state.posts[0]?.cover_alt).toBe('Une description préparée pour la couverture');
  await page.reload();
  await onlySection(page, 'redaction');
  await expect(page.locator('#blog-title')).toHaveValue('Une rédaction conservée entre les écrans');
  await section(page, 'seo', 1);
  await expect(page.locator('#blog-seo-title')).toHaveValue('Un titre SEO conservé pendant la navigation');
});

test('la liste permet de retrouver un article puis ouvre son adresse de rédaction', async ({ page }) => {
  const first = { ...post(1), title: 'Comprendre une infrastructure', slug: 'comprendre-infrastructure' };
  const second = { ...post(2), title: 'Transmettre une méthode', slug: 'transmettre-methode', status: 'published' as const };
  await mockApi(page, [first, second]);
  await openBlog(page);
  await expect(page.locator('#blog-post-list').getByRole('link')).toHaveCount(2);
  await page.locator('#blog-list-search').fill('infrastructure');
  await expect(page.locator('#blog-post-list').getByRole('link')).toHaveCount(1);
  await expect(page.locator('#blog-post-list')).toContainText(first.title);
  await page.locator('#blog-list-search').fill('');
  await expect(page.locator('#blog-post-list').getByRole('link')).toHaveCount(2);
  await page.locator('#blog-filter').selectOption('published');
  await expect(page.locator('#blog-post-list').getByRole('link')).toHaveCount(1);
  await page.locator('#blog-post-list').getByRole('link').click();
  await expect(page).toHaveURL(/\/backoffice\/blog\/redaction\?id=2$/);
  await expect(page.locator('#blog-title')).toHaveValue(second.title);
});

test('un accès direct privé demande la connexion et reprend l’écran demandé après authentification', async ({ page }) => {
  const state = await mockApi(page, [post()]);
  state.authenticated = false;
  await page.goto('/backoffice/blog/seo?id=1');
  await expect(page.locator('#bo-login')).toBeVisible();
  await expect(page.locator('#bo-workspace')).toBeHidden();
  await expect(page.locator('#blog-title')).toHaveValue('');
  await page.getByLabel('Adresse e-mail de connexion', { exact: true }).fill('admin@example.test');
  await page.getByLabel('Mot de passe', { exact: true }).fill('mot-de-passe-test');
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
  await expect(page).toHaveURL(/\/backoffice\/blog\/seo\?id=1$/);
  await onlySection(page, 'seo');
  await expect(page.locator('#blog-title')).toHaveValue('Préparer une publication avec soin');
});

for (const theme of ['jour', 'nuit'] as const) {
  test.describe(`atelier du blog, thème ${theme}`, () => {
    test.use({ colorScheme: theme === 'nuit' ? 'dark' : 'light' });

    test(`axe : la liste, chaque page de l’article et la bibliothèque (${theme})`, async ({ page }) => {
      const scheduled = { ...post(2), title: 'Une publication programmée', slug: 'programmee', status: 'scheduled' as const, scheduled_at: 1_900_000_000, has_unpublished_changes: true, cover_image: '/api/blog/media/1', cover_alt: 'Une couverture' };
      await mockApi(page, [post(), scheduled]);
      await page.goto('/backoffice/blog');
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await expect(page.locator('#blog-post-list').getByRole('link')).toHaveCount(2);
      await accessible(page);
      await page.locator('#blog-filter').selectOption('published');
      await expect(page.locator('#blog-empty')).toBeVisible();
      await accessible(page);
      for (const target of SECTIONS) {
        await page.goto(`/backoffice/blog/${target}?id=2`);
        await onlySection(page, target);
        await expect(page.locator('#blog-title')).toHaveValue('Une publication programmée');
        await accessible(page);
      }
      // Une seule zone éclairée par écran : la feuille, l’aperçu de recherche, la version à publier.
      for (const [target, foyer] of [['redaction', '.blog-feuille'], ['seo', '.blog-serp'], ['publication', '.blog-publication-review']] as const) {
        await page.locator(`[data-blog-section-link="${target}"]`).click();
        await onlySection(page, target);
        await expect(page.locator('#bo-panel-blog .foyer:visible')).toHaveCount(1);
        await expect(page.locator(foyer)).toHaveClass(/foyer/);
      }
      await page.locator('[data-blog-section-link="redaction"]').click();
      await page.locator('.blog-toolbar-more summary').first().click();
      await expect(page.getByRole('button', { name: 'Citation', exact: true })).toBeVisible();
      await accessible(page);
      await page.getByRole('button', { name: 'Image', exact: true }).click();
      await expect(page.getByRole('dialog', { name: 'Insérer une image' })).toBeVisible();
      await accessible(page);
    });
  });
}

test('la barre collante ne masque jamais le champ qui reçoit le focus, sur chaque page de l’article', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await mockApi(page, [post()]);
  // Un retour sur plusieurs lignes fait grandir la barre : le défilement doit suivre.
  for (const target of SECTIONS) {
    await page.goto(`/backoffice/blog/${target}?id=1`);
    await onlySection(page, target);
    await page.evaluate(() => {
      const retour = document.getElementById('blog-notice')!;
      retour.textContent = 'Un retour assez long pour passer sur plusieurs lignes à 390 px : la barre grandit, et le défilement lui réserve sa nouvelle hauteur.';
      retour.hidden = false;
    });
    // Du bas de la page, en remontant au clavier jusqu’à la barre.
    await page.locator('.bo-pied a').first().focus();
    const masques: string[] = [];
    for (let pas = 0; pas < 120; pas += 1) {
      await page.keyboard.press('Shift+Tab');
      // Ce que voit la personne : après le défilement du focus, deux images plus tard.
      await page.evaluate(() => new Promise((fin) => requestAnimationFrame(() => requestAnimationFrame(fin))));
      const mesure = await page.evaluate(() => {
        const actif = document.activeElement as HTMLElement | null;
        const barre = document.querySelector('.blog-barre')!;
        if (!actif || actif === document.body) return { fin: true };
        if (barre.contains(actif) || actif.closest('.bo-entete, .bo-rubrique__entete, .blog-article-nav')) return { fin: true };
        const boite = actif.getBoundingClientRect();
        const bas = barre.getBoundingClientRect().bottom;
        const visible = boite.height <= window.innerHeight - bas ? boite.top >= bas - 1 : boite.bottom > bas + 1;
        return { fin: false, visible, nom: `${actif.tagName.toLowerCase()}${actif.id ? `#${actif.id}` : ''} (haut ${Math.round(boite.top)}, barre ${Math.round(bas)}` };
      });
      if (mesure.fin) break;
      if (!mesure.visible) masques.push(`${target} : ${mesure.nom}`);
    }
    expect(masques).toEqual([]);
  }
});

test('une adresse refusée le dit sous le champ et garde le focus ; le retour d’enregistrement ne survit ni à une page ni à une retouche', async ({ page }) => {
  await mockApi(page, [post()]);
  await page.goto('/backoffice/blog/seo?id=1');
  await onlySection(page, 'seo');
  await page.locator('#blog-save').click();
  await expect(page.locator('#blog-notice')).toContainText('Le brouillon est enregistré');

  // Une retouche efface « enregistré » : l’état dit seul ce qui reste à faire.
  await page.locator('#blog-slug').fill('Slug Invalide !!');
  await expect(page.locator('#blog-notice')).toBeHidden();
  await page.locator('#blog-save').click();
  await expect(page.locator('#blog-slug')).toBeFocused();
  await expect(page.locator('#blog-slug')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#blog-slug-erreur')).toBeVisible();
  await expect(page.locator('#blog-slug')).toHaveAttribute('aria-describedby', 'blog-slug-help blog-slug-erreur');
  await accessible(page);
  await page.locator('#blog-slug').fill('slug-valide');
  await expect(page.locator('#blog-slug-erreur')).toBeHidden();
  await expect(page.locator('#blog-slug')).not.toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#blog-slug')).toHaveAttribute('aria-describedby', 'blog-slug-help');

  // Changer de page de l’article efface aussi le retour.
  await page.locator('#blog-save').click();
  await expect(page.locator('#blog-notice')).toContainText('Le brouillon est enregistré');
  await section(page, 'publication', 1);
  await expect(page.locator('#blog-notice')).toBeHidden();
});

test('un champ refusé sur une autre page que celle affichée y ramène et garde le focus', async ({ page }) => {
  const state = await mockApi(page, [post()]);
  await page.goto('/backoffice/blog/seo?id=1');
  await onlySection(page, 'seo');
  await page.locator('#blog-slug').fill('Slug Invalide !!');
  await section(page, 'redaction', 1);

  // Enregistrer depuis la Rédaction : la page Référencement s’ouvre, puis le
  // champ refusé reçoit le focus et sa bulle ; l’ouverture ne le lui vole plus.
  await page.locator('#blog-save').click();
  await expect(page).toHaveURL(/\/backoffice\/blog\/seo\?id=1$/);
  await onlySection(page, 'seo');
  await expect(page.locator('#blog-slug')).toBeFocused();
  await expect(page.locator('#blog-slug')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#blog-slug-erreur')).toBeVisible();
  // Plus rien ne le déplace une fois la navigation terminée.
  await page.evaluate(() => new Promise((fin) => requestAnimationFrame(() => requestAnimationFrame(fin))));
  expect(await page.evaluate(() => document.activeElement?.id)).toBe('blog-slug');
  expect(state.mutations.filter((mutation) => mutation.method === 'PUT')).toEqual([]);
});
