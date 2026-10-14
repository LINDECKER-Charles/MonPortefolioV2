import { Editor, type JSONContent } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { TableKit, TableView } from '@tiptap/extension-table';
import TextAlign from '@tiptap/extension-text-align';
import { imageArticle, lienArticle } from '../../server/blog-regles.mjs';

class KeyboardTableView extends TableView {
  constructor(...args: ConstructorParameters<typeof TableView>) {
    super(...args);
    this.dom.tabIndex = 0;
    this.dom.setAttribute('role', 'region');
    this.dom.setAttribute('aria-label', 'Tableau de l’article');
    this.dom.addEventListener('keydown', (event) => {
      if (event.target !== this.dom || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault(); event.stopPropagation();
      this.dom.scrollBy({ left: event.key === 'ArrowRight' ? 160 : -160 });
    });
  }
}

interface BlogPost {
  id: number; title: string; slug: string; excerpt: string; content: JSONContent;
  cover_image: string | null; cover_alt: string; tags: string[];
  seo_title: string; seo_description: string; canonical_url: string | null;
  og_image: string | null; noindex: boolean; status: 'draft' | 'scheduled' | 'published';
  scheduled_at: number | null; published_at: number | null;
  created_at: string; updated_at: string; revision: number;
  has_unpublished_changes: boolean; scheduled_revision: number | null;
}
interface Media { id: number; filename: string; content_type: string; size: number; url: string; created_at: string }
interface Context {
  api: <T>(path: string, method?: string, body?: unknown) => Promise<T>;
  isAuthenticated: () => boolean;
  confirm: (title: string, message: string, button: string) => Promise<boolean>;
  navigate: (url: string, replace?: boolean) => Promise<void>;
}
export interface BlogWorkspace {
  open: (url?: string) => Promise<void>;
  canNavigate: (url: string) => Promise<boolean>;
  reset: (preserveDraft?: boolean) => void;
  restoreDraft: () => boolean;
  hasUnsavedChanges: () => boolean;
  confirmDiscard: () => Promise<boolean>;
}

type BlogSection = 'redaction' | 'medias' | 'seo' | 'publication';
const sections: BlogSection[] = ['redaction', 'medias', 'seo', 'publication'];
const sectionCopy: Record<BlogSection, { title: string; description: string; next: string }> = {
  redaction: { title: 'Rédaction', description: 'Le titre, le résumé et le texte. Un espace pour écrire et mettre en forme.', next: 'Choisir les images' },
  medias: { title: 'Images et classement', description: 'Choisir la couverture, décrire les images et classer l’article.', next: 'Préparer le référencement' },
  seo: { title: 'Référencement', description: 'Préparer le résultat de recherche et l’aperçu partagé sur les réseaux.', next: 'Préparer la publication' },
  publication: { title: 'Publication', description: 'Relire la version enregistrée, puis publier maintenant ou choisir une date.', next: '' },
};

function blogRoute(value: string) {
  const url = new URL(value, window.location.origin);
  const match = url.pathname.match(/^\/backoffice\/blog(?:\/(redaction|medias|seo|publication))?\/?$/);
  if (!match) return undefined;
  const raw = url.searchParams.get('id');
  const id = raw && /^\d+$/.test(raw) && Number.isSafeInteger(Number(raw)) && Number(raw) > 0 ? Number(raw) : null;
  return { section: match[1] as BlogSection | undefined, id, invalid: raw !== null && id === null };
}

const emptyDocument: JSONContent = { type: 'doc', content: [{ type: 'paragraph' }] };
const labels = { draft: 'Brouillon', scheduled: 'Programmé', published: 'Publié' };
const privateMediaUrl = (url: string) => url.replace(/^\/api\/blog\/media\/(\d+)$/, '/api/backoffice/blog/media/$1');
const publicMediaUrl = (url: string) => url.replace(/^\/api\/backoffice\/blog\/media\/(\d+)$/, '/api/blog/media/$1');

/** L’image garde son adresse publique dans le document et utilise la session pour son aperçu. */
const PrivateImage = Image.extend({
  addNodeView() {
    return ({ node }) => {
      const figure = document.createElement('figure');
      const img = document.createElement('img');
      const caption = document.createElement('figcaption');
      figure.append(img, caption);
      const render = (attrs: Record<string, unknown>) => {
        img.src = privateMediaUrl(String(attrs.src ?? ''));
        img.alt = String(attrs.alt ?? '');
        for (const attr of ['width', 'height']) {
          const value = Number(attrs[attr]);
          if (Number.isInteger(value) && value > 0 && value <= 10000) img.setAttribute(attr, String(value));
          else img.removeAttribute(attr);
        }
        caption.textContent = String(attrs.title ?? '');
        caption.hidden = !caption.textContent;
      };
      render(node.attrs);
      return { dom: figure, update: (next) => {
        if (next.type !== node.type) return false;
        render(next.attrs);
        return true;
      } };
    };
  },
});
/** Les alignements passent par une classe de données compatible avec la CSP. */
const Align = TextAlign.extend({
  addGlobalAttributes() {
    return [{ types: this.options.types, attributes: { textAlign: {
      default: this.options.defaultAlignment,
      parseHTML: (element: HTMLElement) => element.dataset.align || element.style.textAlign || this.options.defaultAlignment,
      renderHTML: (attributes: Record<string, unknown>) => attributes.textAlign ? { 'data-align': attributes.textAlign } : {},
    } } }];
  },
});

export function brancherBlog(context: Context): BlogWorkspace {
  const el = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
  const input = (id: string) => el<HTMLInputElement>(id);
  const button = (id: string) => el<HTMLButtonElement>(id);
  const text = (id: string, value: string) => { el(id).textContent = value; };
  const create = <K extends keyof HTMLElementTagNameMap>(tag: K, className = '', value?: string) => {
    const node = document.createElement(tag);
    node.className = className;
    if (value !== undefined) node.textContent = value;
    return node;
  };
  const form = el<HTMLFormElement>('blog-form');
  form.noValidate = true;
  const mediaDialog = el<HTMLDialogElement>('blog-media-dialog');
  const linkDialog = el<HTMLDialogElement>('blog-link-dialog');
  const dateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  let selected: BlogPost | undefined;
  let editing = false;
  let activeSection: BlogSection = 'redaction';
  let loaded = false;
  let loadedFilter = '';
  let loadedOffset = -1;
  let snapshot = '';
  let suppressUpdate = false;
  let busy = false;
  let generation = 0;
  let listSequence = 0;
  let offset = 0;
  let total = 0;
  const limit = 20;
  let media: Media[] = [];
  let imageTarget: 'content' | 'cover' | 'og' = 'content';
  let slugEdited = false;
  let retainedDraft: { post?: BlogPost; fields: ReturnType<typeof payload>; snapshot: string; scheduledAt: string; section: BlogSection } | undefined;
  let mediaOffset = 0;
  let mediaTotal = 0;
  let editor: Editor;
  function createEditor(content: JSONContent): Editor { return new Editor({
    element: el('blog-editor'), injectCSS: false,
    extensions: [StarterKit.configure({ heading: { levels: [2, 3, 4] }, link: { openOnClick: false, autolink: false } }), PrivateImage, TableKit.configure({ table: { resizable: false, renderWrapper: true, cellMinWidth: 180, View: KeyboardTableView } }), Align.configure({ types: ['heading', 'paragraph'] })],
    content,
    editorProps: { attributes: { class: 'blog-editor-content', role: 'textbox', 'aria-labelledby': 'blog-content-label', 'aria-multiline': 'true', 'aria-describedby': 'blog-word-count' } },
    onUpdate: () => { if (!suppressUpdate) changed(); },
    onSelectionUpdate: () => updateToolbar(),
    onTransaction: () => updateToolbar(),
  }); }
  suppressUpdate = true;
  editor = createEditor(emptyDocument);
  suppressUpdate = false;

  function notice(message: string, error = false, target = 'blog-notice') {
    text(target, message);
    el(target).dataset.state = error ? 'error' : 'success';
    el(target).hidden = false;
  }
  function error(cause: unknown, target = 'blog-notice') {
    const message = cause instanceof Error && !(cause instanceof TypeError) && !(cause instanceof DOMException) ? cause.message : 'Le blog est injoignable. Vérifiez la connexion puis réessayez.';
    const conflict = typeof cause === 'object' && cause !== null && 'status' in cause && cause.status === 409;
    notice(conflict ? `${message} Vos modifications restent dans l’éditeur. Revenez à la liste et rechargez l’article pour récupérer la dernière version.` : message, true, target);
  }
  function payload() {
    return {
      title: input('blog-title').value.trim(), slug: input('blog-slug').value.trim(),
      excerpt: el<HTMLTextAreaElement>('blog-excerpt').value.trim(), content: normalizeDocument(editor.getJSON()),
      cover_image: publicMediaUrl(input('blog-cover').value.trim()) || null,
      cover_alt: input('blog-cover-alt').value.trim(),
      tags: [...new Set(input('blog-tags').value.split(',').map((tag) => tag.trim()).filter(Boolean))],
      seo_title: input('blog-seo-title').value.trim(), seo_description: el<HTMLTextAreaElement>('blog-seo-description').value.trim(),
      canonical_url: input('blog-canonical').value.trim() || null,
      og_image: publicMediaUrl(input('blog-og-image').value.trim()) || null,
      noindex: input('blog-noindex').checked,
    };
  }
  function normalizeDocument(node: JSONContent): JSONContent {
    const result = { ...node };
    if (node.type === 'image' && node.attrs) result.attrs = { ...node.attrs, src: publicMediaUrl(String(node.attrs.src ?? '')) };
    if (node.content) result.content = node.content.map(normalizeDocument);
    return result;
  }
  function dirty() { return editing && snapshot !== JSON.stringify(payload()); }
  function sectionURL(section: BlogSection, id = selected?.id) {
    return `/backoffice/blog/${section}${id ? `?id=${id}` : ''}`;
  }
  function listURL() {
    const params = new URLSearchParams();
    const status = el<HTMLSelectElement>('blog-filter').value;
    if (status !== 'all') params.set('status', status);
    if (offset) params.set('page', String(Math.floor(offset / limit) + 1));
    return `/backoffice/blog${params.size ? `?${params}` : ''}`;
  }
  function updateLinks() {
    for (const link of document.querySelectorAll<HTMLAnchorElement>('[data-blog-section-link]')) {
      const section = link.dataset.blogSectionLink as BlogSection;
      if (!sections.includes(section)) continue;
      link.href = sectionURL(section);
      if (editing && activeSection === section) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    }
    const next = el<HTMLAnchorElement>('blog-next-section');
    if (next) {
      const following = sections[sections.indexOf(activeSection) + 1];
      next.hidden = !editing || !following;
      if (following) { next.href = sectionURL(following); next.textContent = sectionCopy[activeSection].next; }
    }
    const back = el<HTMLAnchorElement>('blog-back');
    if (back instanceof HTMLAnchorElement) back.href = listURL();
  }
  function showSection(section: BlogSection, focus = false) {
    activeSection = section;
    document.body.dataset.blogSection = section;
    for (const page of document.querySelectorAll<HTMLElement>('[data-blog-page]')) page.hidden = page.dataset.blogPage !== section;
    text('blog-workspace-title', sectionCopy[section].title);
    text('blog-workspace-description', sectionCopy[section].description);
    el('blog-list-view').hidden = true; el('blog-edit-view').hidden = false;
    el('blog-new').hidden = true;
    el('blog-article-nav').hidden = false;
    document.title = `${sectionCopy[section].title} — Blog — Backoffice`;
    updateLinks();
    if (focus) {
      const target = section === 'redaction' ? input('blog-title') : el('blog-workspace-title');
      target.tabIndex = section === 'redaction' ? 0 : -1;
      target.focus({ preventScroll: true });
      if (section !== 'redaction') window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }
  function showList() {
    editing = false; selected = undefined;
    document.body.dataset.blogSection = 'list';
    el('blog-edit-view').hidden = true; el('blog-list-view').hidden = false;
    el('blog-new').hidden = false; el('blog-article-nav').hidden = true;
    text('blog-workspace-title', 'Articles');
    text('blog-workspace-description', 'Retrouver un article, préparer un brouillon et suivre les publications.');
    document.title = 'Articles — Blog — Backoffice';
  }
  async function canNavigate(url: string) {
    const target = blogRoute(url);
    const sameArticle = editing && target?.section && !target.invalid && target.id === (selected?.id ?? null);
    if (sameArticle) return true;
    if (busy) return false;
    return await confirmDiscard();
  }
  async function confirmDiscard() {
    if (!dirty()) return true;
    return context.confirm('Quitter sans enregistrer ?', 'Les modifications de cet article ne sont pas enregistrées. Vous pouvez annuler pour les conserver.', 'Quitter sans enregistrer');
  }
  function changed() { if (editing) { updatePublication(); updateSEO(); } }
  function updatePublication() {
    const modified = dirty();
    text('blog-status', selected ? labels[selected.status] : 'Brouillon');
    el('blog-status').dataset.state = selected?.status ?? 'draft';
    text('blog-save-state', modified ? 'Modifications non enregistrées' : selected ? 'Enregistré' : 'Non enregistré');
    text('blog-save', 'Enregistrer');
    text('blog-document-title', input('blog-title').value.trim() || 'Nouvel article');
    text('blog-publish', selected?.status === 'published' ? 'Publier les modifications' : 'Publier maintenant');
    button('blog-publish').disabled = busy || !selected || modified;
    button('blog-schedule').disabled = busy || !selected || modified;
    button('blog-unpublish').hidden = !selected || selected.status === 'draft';
    button('blog-unpublish').disabled = busy || modified;
    button('blog-delete').hidden = !selected;
    button('blog-delete').disabled = busy;
    text('blog-publication-help', selected?.status === 'published'
      ? 'L’article public reste sur sa dernière version publiée. Enregistrez et relisez vos modifications, puis publiez-les pour les mettre en ligne.'
      : selected?.status === 'scheduled' && selected.scheduled_at
        ? `Publication prévue le ${dateFormat.format(new Date(selected.scheduled_at * 1000))} (${timezone}).${selected.has_unpublished_changes ? ' Des modifications restent privées. Reprogrammez pour les inclure dans cette publication.' : ' La version capturée lors de la programmation sera publiée.'}`
        : 'Un brouillon reste privé. L’aperçu utilise la dernière version enregistrée.');
    const cover = input('blog-cover').value.trim();
    el<HTMLImageElement>('blog-cover-preview').hidden = !cover;
    if (cover) el<HTMLImageElement>('blog-cover-preview').src = privateMediaUrl(cover);
    else el('blog-cover-preview').removeAttribute('src');
    const review = {
      'blog-review-title': input('blog-title').value.trim() || 'Titre à compléter',
      'blog-review-excerpt': el<HTMLTextAreaElement>('blog-excerpt').value.trim() || 'Résumé à compléter',
      'blog-review-url': `/blog/${input('blog-slug').value.trim() || 'adresse-a-completer'}`,
      'blog-review-visibility': input('blog-noindex').checked ? 'Indexation désactivée' : 'Indexation autorisée après publication',
      'blog-review-changes': modified ? 'Des modifications ne sont pas encore enregistrées.' : selected?.has_unpublished_changes ? 'Des modifications enregistrées restent privées.' : selected?.status === 'scheduled' ? 'La version programmée est prête à être publiée.' : selected?.status === 'published' ? 'La version enregistrée est publiée.' : 'La version enregistrée reste privée.',
    };
    for (const [id, value] of Object.entries(review)) if (el(id)) text(id, value);
    updateLinks();
  }
  function updateSEO() {
    const data = payload();
    const title = data.seo_title || data.title;
    const description = data.seo_description || data.excerpt;
    text('blog-title-counter', `${title.length} caractères · repère : 30 à 65`);
    text('blog-description-counter', `${description.length} caractères · repère : 110 à 165`);
    text('blog-serp-url', `${window.location.origin}/blog/${data.slug || 'adresse-de-l-article'}`);
    text('blog-serp-title', title || 'Titre de l’article');
    text('blog-serp-description', description || 'La description apparaîtra ici.');
    const words = editor.getText().trim().split(/\s+/).filter(Boolean).length;
    text('blog-word-count', `${words} mot${words > 1 ? 's' : ''} · environ ${Math.max(1, Math.ceil(words / 200))} min de lecture`);
    const images: JSONContent[] = [];
    let headings = 0;
    const walk = (node: JSONContent) => {
      if (node.type === 'image') images.push(node);
      if (node.type === 'heading') headings += 1;
      node.content?.forEach(walk);
    };
    walk(data.content);
    const checks: [boolean, string, string][] = [
      [title.length >= 30 && title.length <= 65, 'Le titre du résultat reste dans le repère de longueur.', 'Préparez un titre descriptif de 30 à 65 caractères.'],
      [description.length >= 110 && description.length <= 165, 'La description du résultat reste dans le repère de longueur.', 'Écrivez une description de 110 à 165 caractères qui présente le sujet.'],
      [headings > 0, 'Des intertitres structurent la lecture.', 'Ajoutez des intertitres pour guider la lecture.'],
      [images.every((image) => String(image.attrs?.alt ?? '').trim()) && (!data.cover_image || Boolean(data.cover_alt)), 'Les images ont une description.', 'Décrivez chaque image, couverture comprise.'],
      [Boolean(data.og_image || data.cover_image), 'Une image est prévue pour le partage.', 'Ajoutez une couverture ou une image de partage.'],
      [!data.noindex, 'L’indexation est autorisée après publication.', 'L’indexation est désactivée pour cet article.'],
    ];
    el('blog-seo-audit').replaceChildren(...checks.map(([pass, success, advice]) => {
      const li = create('li', '', pass ? success : advice);
      li.dataset.pass = String(pass);
      return li;
    }));
  }
  function updateToolbar() {
    if (!editor || editor.isDestroyed) return;
    for (const control of document.querySelectorAll<HTMLButtonElement>('[data-editor]')) {
      const name = control.dataset.editor!;
      if (control.hasAttribute('aria-pressed')) control.setAttribute('aria-pressed', String(editor.isActive(name)));
      if (['addRowAfter', 'addColumnAfter', 'deleteRow', 'deleteColumn', 'deleteTable'].includes(name)) control.disabled = busy || !editor.isActive('table');
      if (name === 'undo') control.disabled = busy || !editor.can().undo();
      if (name === 'redo') control.disabled = busy || !editor.can().redo();
      if (name === 'unlink') control.disabled = busy || !editor.isActive('link');
    }
    const level = [2, 3, 4].find((value) => editor.isActive('heading', { level: value }));
    el<HTMLSelectElement>('blog-block').value = level ? String(level) : editor.isActive('codeBlock') ? 'code' : 'paragraph';
    el<HTMLSelectElement>('blog-align').value = String(editor.getAttributes(editor.isActive('heading') ? 'heading' : 'paragraph').textAlign ?? 'left');
  }
  async function run(operation: () => Promise<void>, message: string, target = 'blog-notice') {
    if (busy || !context.isAuthenticated()) return;
    const sequence = generation;
    busy = true;
    el<HTMLSelectElement>('blog-filter').disabled = true;
    el<HTMLFieldSetElement>('blog-schedule-form').querySelector('fieldset')!.disabled = true;
    el<HTMLFieldSetElement>('blog-fields').disabled = true;
    editor.setEditable(false);
    for (const id of ['blog-new', 'blog-refresh', 'blog-save', 'blog-preview', 'blog-publish', 'blog-schedule', 'blog-unpublish', 'blog-delete']) button(id).disabled = true;
    form.setAttribute('aria-busy', 'true');
    notice(message, false, target);
    try { await operation(); }
    catch (cause) { if (sequence === generation && context.isAuthenticated()) error(cause, target); }
    finally {
      if (sequence === generation) {
        busy = false;
        el<HTMLSelectElement>('blog-filter').disabled = false;
        el('blog-schedule-form').querySelector('fieldset')!.disabled = false;
        el<HTMLFieldSetElement>('blog-fields').disabled = false;
        editor.setEditable(true);
        for (const id of ['blog-new', 'blog-refresh', 'blog-save', 'blog-preview']) button(id).disabled = false;
        form.removeAttribute('aria-busy');
        if (editing) updatePublication();
        updateToolbar();
      }
    }
  }
  function fill(post?: BlogPost, section: BlogSection = activeSection) {
    selected = post;
    editing = true;
    form.reset();
    for (const [id, value] of [
      ['blog-title', post?.title], ['blog-slug', post?.slug], ['blog-excerpt', post?.excerpt],
      ['blog-cover', post?.cover_image], ['blog-cover-alt', post?.cover_alt], ['blog-tags', post?.tags.join(', ')],
      ['blog-seo-title', post?.seo_title], ['blog-seo-description', post?.seo_description],
      ['blog-canonical', post?.canonical_url], ['blog-og-image', post?.og_image],
    ]) (el(id!) as HTMLInputElement).value = value ?? '';
    input('blog-noindex').checked = post?.noindex ?? false;
    slugEdited = Boolean(post);
    suppressUpdate = true;
    editor.destroy();
    editor = createEditor(post?.content ?? emptyDocument);
    suppressUpdate = false;
    snapshot = JSON.stringify(payload());
    showSection(section);
    el('blog-notice').hidden = true;
    input('blog-scheduled-at').value = post?.scheduled_at ? localDateTime(new Date(post.scheduled_at * 1000)) : '';
    updatePublication(); updateSEO();
  }
  function localDateTime(date: Date) {
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
    return local.toISOString().slice(0, 16);
  }
  async function loadList() {
    const sequence = ++listSequence;
    const authGeneration = generation;
    const status = el<HTMLSelectElement>('blog-filter').value;
    const response = await context.api<{ posts: BlogPost[]; total: number }>(`/blog/posts?status=${status}&limit=${limit}&offset=${offset}`);
    if (sequence !== listSequence || generation !== authGeneration || !context.isAuthenticated()) return;
    if (offset > 0 && !response.posts.length) { offset = Math.max(0, offset - limit); await loadList(); return; }
    total = response.total;
    loaded = true;
    loadedFilter = status; loadedOffset = offset;
    el('blog-post-list').replaceChildren(...response.posts.map((post) => {
      const li = create('li');
      li.dataset.search = [post.title, post.excerpt, ...post.tags].join(' ');
      const row = create('a', 'blog-post-row'); row.href = sectionURL('redaction', post.id);
      const state = create('span', 'bo-state', labels[post.status]); state.dataset.state = post.status;
      const date = new Date(post.updated_at);
      const details = create('span', 'blog-post-summary');
      details.append(create('strong', '', post.title));
      if (post.excerpt) details.append(create('span', 'blog-post-excerpt', post.excerpt));
      if (post.cover_image) {
        const image = create('img', 'blog-post-cover'); image.alt = ''; image.src = privateMediaUrl(post.cover_image); image.loading = 'lazy'; image.width = 128; image.height = 86;
        row.append(image);
      }
      const states = create('span', 'blog-post-states'); states.append(state);
      if (post.has_unpublished_changes) states.append(create('span', 'bo-state blog-private-state', 'Retouches privées'));
      row.append(details, states, create('small', '', post.status === 'scheduled' && post.scheduled_at
        ? `Publication le ${dateFormat.format(new Date(post.scheduled_at * 1000))}`
        : `Modifié le ${Number.isNaN(date.getTime()) ? post.updated_at : dateFormat.format(date)}`));
      row.addEventListener('click', (event) => {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
        event.preventDefault(); void context.navigate(row.href);
      });
      li.append(row); return li;
    }));
    el('blog-empty').hidden = response.posts.length > 0;
    const emptyTitle = el('blog-empty').querySelector('h3');
    if (emptyTitle) emptyTitle.textContent = status === 'all' ? 'Votre premier article commence ici.' : 'Aucun article dans ce filtre.';
    el('blog-pagination').hidden = total <= limit;
    button('blog-previous').disabled = offset === 0;
    button('blog-next').disabled = offset + limit >= total;
    text('blog-page', `${Math.floor(offset / limit) + 1} / ${Math.max(1, Math.ceil(total / limit))}`);
    filterList();
    el('blog-notice').hidden = true;
  }
  function filterList() {
    const search = input('blog-list-search');
    if (!search) return;
    const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('fr-FR');
    const query = normalize(search.value.trim());
    const rows = [...el('blog-post-list').querySelectorAll<HTMLLIElement>('li')];
    let visible = 0;
    for (const row of rows) {
      row.hidden = Boolean(query) && !normalize(row.dataset.search ?? row.textContent ?? '').includes(query);
      if (!row.hidden) visible += 1;
    }
    if (el('blog-search-empty')) el('blog-search-empty').hidden = !query || visible > 0 || rows.length === 0;
    if (el('blog-results-count')) text('blog-results-count', query ? `${visible} résultat${visible > 1 ? 's' : ''} sur cette page` : `${total} article${total > 1 ? 's' : ''}`);
  }
  async function openRoute(value = `${window.location.pathname}${window.location.search}`) {
    const route = blogRoute(value);
    if (!route || route.invalid) {
      showList();
      notice('Cette adresse d’article est invalide. Revenez à la liste pour choisir un article.', true);
      return;
    }
    if (!route.section) {
      showList();
      const url = new URL(value, window.location.origin);
      const status = url.searchParams.get('status') ?? 'all';
      el<HTMLSelectElement>('blog-filter').value = ['all', 'draft', 'scheduled', 'published'].includes(status) ? status : 'all';
      const page = Number(url.searchParams.get('page') ?? '1');
      offset = Number.isSafeInteger(page) && page > 0 && page <= 100000 ? (page - 1) * limit : 0;
      if (!loaded || loadedFilter !== el<HTMLSelectElement>('blog-filter').value || loadedOffset !== offset) await run(loadList, 'Chargement des articles…');
      else filterList();
      updateLinks();
      return;
    }
    if (editing && route.id === (selected?.id ?? null)) { showSection(route.section, true); return; }
    const current = generation;
    if (route.id === null) {
      fill(undefined, route.section);
      showSection(route.section, true);
      return;
    }
    showList();
    await run(async () => {
      const post = await context.api<BlogPost>(`/blog/posts/${route.id}`);
      if (generation === current && context.isAuthenticated()) fill(post, route.section);
    }, 'Chargement de l’article…');
    if (generation === current && context.isAuthenticated() && editing) showSection(route.section, true);
  }
  /**
   * Ramène à la page de l’article qui porte le refus, PUIS y pose le focus, le
   * message et la bulle du champ. Dans l’autre ordre, l’ouverture de la page
   * (showSection(…, true)) volerait le focus au champ refusé. validate() reste
   * synchrone : l’aperçu ouvre son onglet dans le geste de l’utilisateur.
   */
  async function refuser(section: BlogSection, refus: { message?: string; champ?: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement; signaler?: boolean }) {
    showSection(section);
    await context.navigate(sectionURL(section));
    if (refus.message) notice(refus.message, true);
    refus.champ?.focus();
    if (refus.signaler) refus.champ?.reportValidity();
  }
  function validate() {
    const invalid = form.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('input:invalid, textarea:invalid, select:invalid');
    if (invalid) {
      const section = invalid.closest<HTMLElement>('[data-blog-page]')?.dataset.blogPage as BlogSection | undefined;
      if (section) void refuser(section, { champ: invalid, signaler: true });
      else { invalid.focus(); invalid.reportValidity(); }
      return false;
    }
    const data = payload();
    if (data.cover_image && !data.cover_alt) { void refuser('medias', { message: 'Décrivez l’image de couverture avant d’enregistrer.', champ: input('blog-cover-alt') }); return false; }
    if (data.tags.length > 20 || data.tags.some((tag) => tag.length > 50)) { void refuser('medias', { message: 'Utilisez au plus 20 étiquettes de 50 caractères chacune.', champ: input('blog-tags') }); return false; }
    if ((data.cover_image && !imageArticle(data.cover_image)) || (data.og_image && !imageArticle(data.og_image))) { void refuser(data.cover_image && !imageArticle(data.cover_image) ? 'medias' : 'seo', { message: 'Choisissez la couverture et l’image de partage dans la bibliothèque d’images.' }); return false; }
    if (data.canonical_url && !data.canonical_url.startsWith('https://')) { void refuser('seo', { message: 'L’adresse canonique doit commencer par https://.', champ: input('blog-canonical') }); return false; }
    let missingAlt = false;
    const check = (node: JSONContent) => { if (node.type === 'image' && !String(node.attrs?.alt ?? '').trim()) missingAlt = true; node.content?.forEach(check); };
    check(data.content);
    if (missingAlt) { void refuser('redaction', { message: 'Une image du contenu n’a pas de description. Sélectionnez-la et utilisez Image pour compléter sa description.' }); return false; }
    return true;
  }
  async function save(): Promise<BlogPost | undefined> {
    const current = generation;
    const post = await context.api<BlogPost>(selected ? `/blog/posts/${selected.id}` : '/blog/posts', selected ? 'PUT' : 'POST', { ...payload(), ...(selected ? { revision: selected.revision } : {}) });
    if (generation !== current || !context.isAuthenticated()) return;
    selected = post;
    snapshot = JSON.stringify(payload());
    loaded = false;
    updatePublication();
    await context.navigate(sectionURL(activeSection, post.id), true);
    notice(post.status === 'published' ? 'Les modifications sont enregistrées. Publiez-les pour mettre à jour l’article public.' : post.status === 'scheduled' ? 'Les modifications sont enregistrées. Reprogrammez la publication pour y inclure cette version.' : 'Le brouillon est enregistré. Vous pouvez ouvrir son aperçu.');
    return post;
  }
  async function publication(action: 'publish' | 'unpublish' | 'schedule', scheduled_at?: number) {
    if (!selected || dirty()) { notice('Enregistrez l’article avant de modifier sa publication.', true); return; }
    const id = selected.id;
    const revision = selected.revision;
    const current = generation;
    await run(async () => {
      const post = await context.api<BlogPost>(`/blog/posts/${id}/${action}`, 'POST', { revision, ...(scheduled_at !== undefined ? { scheduled_at } : {}) });
      if (generation !== current || !context.isAuthenticated()) return;
      selected = post; loaded = false; updatePublication();
      notice(action === 'publish' ? 'L’article est publié.' : action === 'unpublish' ? 'L’article est revenu en brouillon. Sa publication programmée est annulée.' : `La publication est programmée le ${dateFormat.format(new Date(scheduled_at! * 1000))} (${timezone}).`);
    }, action === 'publish' ? 'Publication de l’article…' : action === 'unpublish' ? 'Retour en brouillon…' : 'Programmation de la publication…');
  }

  function renderMedia() {
    el('blog-media-list').replaceChildren(...media.map((item) => {
      const li = create('li'); const control = create('button'); control.type = 'button';
      control.setAttribute('aria-pressed', String(input('blog-image-src').value === item.url));
      const img = create('img'); img.src = privateMediaUrl(item.url); img.alt = ''; img.loading = 'lazy';
      control.append(img, create('span', '', item.filename));
      control.addEventListener('click', () => { input('blog-image-src').value = item.url; renderMedia(); input('blog-image-alt').focus(); });
      li.append(control); return li;
    }));
  }
  async function openMedia(target: typeof imageTarget) {
    imageTarget = target;
    el<HTMLFormElement>('blog-image-form').reset();
    el<HTMLFormElement>('blog-upload-form').reset();
    el('blog-media-list').replaceChildren(); el('blog-media-notice').hidden = true;
    text('blog-media-title', target === 'content' ? 'Insérer une image' : target === 'cover' ? 'Choisir la couverture' : 'Choisir l’image de partage');
    const attrs = target === 'content' && editor.isActive('image') ? editor.getAttributes('image') : undefined;
    input('blog-image-src').value = attrs ? String(attrs.src) : target === 'cover' ? input('blog-cover').value : target === 'og' ? input('blog-og-image').value : '';
    input('blog-image-alt').value = attrs ? String(attrs.alt ?? '') : target === 'cover' ? input('blog-cover-alt').value : '';
    input('blog-image-title').value = attrs ? String(attrs.title ?? '') : '';
    mediaDialog.showModal();
    mediaOffset = 0; mediaTotal = 0;
    button('blog-media-more').hidden = true;
    const current = generation;
    try {
      const response = await context.api<{ media: Media[]; total?: number }>('/blog/media?limit=100&offset=0');
      if (generation !== current || !context.isAuthenticated() || !mediaDialog.open) return;
      media = response.media; mediaOffset = media.length; mediaTotal = response.total ?? (media.length === 100 ? Infinity : media.length); renderMedia();
      button('blog-media-more').hidden = mediaOffset >= mediaTotal;
      if (!media.length) notice('La bibliothèque est vide. Téléversez votre première image.', false, 'blog-media-notice');
    } catch (cause) { if (generation === current && context.isAuthenticated()) error(cause, 'blog-media-notice'); }
  }
  for (const [id, target] of [['blog-insert-image', 'content'], ['blog-cover-choose', 'cover'], ['blog-og-choose', 'og']] as const) button(id).addEventListener('click', () => { void openMedia(target); });
  button('blog-media-close').addEventListener('click', () => mediaDialog.close());
  button('blog-media-more').addEventListener('click', async () => {
    const current = generation;
    button('blog-media-more').disabled = true;
    try {
      const response = await context.api<{ media: Media[]; total?: number }>(`/blog/media?limit=100&offset=${mediaOffset}`);
      if (generation !== current || !context.isAuthenticated() || !mediaDialog.open) return;
      media.push(...response.media); mediaOffset += response.media.length; mediaTotal = response.total ?? (response.media.length === 100 ? Infinity : media.length);
      renderMedia(); button('blog-media-more').hidden = mediaOffset >= mediaTotal || !response.media.length;
    } catch (cause) { if (generation === current && context.isAuthenticated()) error(cause, 'blog-media-notice'); }
    finally { if (generation === current) button('blog-media-more').disabled = false; }
  });
  el<HTMLFormElement>('blog-upload-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const file = input('blog-upload').files?.[0];
    if (!file) { notice('Choisissez un fichier image.', true, 'blog-media-notice'); return; }
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type) || file.size > 4 * 1024 * 1024) { notice('Choisissez un fichier JPEG, PNG, WebP ou GIF de 4 Mo maximum.', true, 'blog-media-notice'); return; }
    void run(async () => {
      const current = generation;
      const data = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result).split(',')[1]!); reader.onerror = () => reject(new Error('Le fichier ne peut pas être lu.')); reader.readAsDataURL(file); });
      if (generation !== current || !context.isAuthenticated()) return;
      const result = await context.api<Media>('/blog/media', 'POST', { filename: file.name, content_type: file.type, data_base64: data });
      if (generation !== current || !context.isAuthenticated()) return;
      media = [result, ...media]; mediaOffset += 1; mediaTotal += 1; input('blog-image-src').value = result.url;
      renderMedia(); notice('L’image est téléversée. Ajoutez sa description puis utilisez-la.', false, 'blog-media-notice'); input('blog-image-alt').focus();
    }, 'Téléversement de l’image…', 'blog-media-notice');
  });
  el<HTMLFormElement>('blog-image-form').addEventListener('submit', (event) => {
    event.preventDefault();
    if (busy) return;
    const src = publicMediaUrl(input('blog-image-src').value.trim());
    const alt = input('blog-image-alt').value.trim();
    if (!src || !alt) { notice('Choisissez une image et décrivez-la.', true, 'blog-media-notice'); return; }
    if (imageTarget === 'content') {
      const attrs = { src, alt, title: input('blog-image-title').value.trim() };
      if (editor.isActive('image')) editor.chain().focus().updateAttributes('image', attrs).run();
      else editor.chain().focus().insertContentAt(editor.state.selection.to, { type: 'image', attrs }).run();
    } else if (imageTarget === 'cover') { input('blog-cover').value = src; input('blog-cover-alt').value = alt; }
    else input('blog-og-image').value = src;
    mediaDialog.close(); changed();
  });
  button('blog-link').addEventListener('click', () => {
    input('blog-link-url').value = String(editor.getAttributes('link').href ?? ''); linkDialog.showModal();
  });
  button('blog-link-close').addEventListener('click', () => linkDialog.close());
  el<HTMLFormElement>('blog-link-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const href = input('blog-link-url').value.trim();
    try {
      // La règle du backend et du rendu public (server/blog-regles.mjs).
      if (!lienArticle(href)) throw new Error('invalid');
      editor.chain().focus().extendMarkRange('link').setLink({ href }).run(); linkDialog.close();
    } catch { input('blog-link-url').setCustomValidity('Saisissez une adresse http:// ou https://, un chemin du site comme /blog/article ou /projets/omnicard#decisions, ou une ancre #titre.'); input('blog-link-url').reportValidity(); }
  });
  input('blog-link-url').addEventListener('input', () => input('blog-link-url').setCustomValidity(''));

  for (const control of document.querySelectorAll<HTMLButtonElement>('[data-editor]')) {
    control.addEventListener('mousedown', (event) => event.preventDefault());
    control.addEventListener('click', () => {
      const chain = editor.chain().focus();
      switch (control.dataset.editor) {
        case 'bold': chain.toggleBold().run(); break;
        case 'italic': chain.toggleItalic().run(); break;
        case 'underline': chain.toggleUnderline().run(); break;
        case 'strike': chain.toggleStrike().run(); break;
        case 'code': chain.toggleCode().run(); break;
        case 'bulletList': chain.toggleBulletList().run(); break;
        case 'orderedList': chain.toggleOrderedList().run(); break;
        case 'blockquote': chain.toggleBlockquote().run(); break;
        case 'unlink': chain.unsetLink().run(); break;
        case 'horizontalRule': chain.setHorizontalRule().run(); break;
        case 'table': chain.insertContentAt(editor.state.selection.to, { type: 'table', content: Array.from({ length: 3 }, (_, row) => ({ type: 'tableRow', content: Array.from({ length: 3 }, () => ({ type: row === 0 ? 'tableHeader' : 'tableCell', content: [{ type: 'paragraph' }] })) })) }).run(); break;
        case 'addRowAfter': chain.addRowAfter().run(); break;
        case 'addColumnAfter': chain.addColumnAfter().run(); break;
        case 'deleteRow': chain.deleteRow().run(); break;
        case 'deleteColumn': chain.deleteColumn().run(); break;
        case 'deleteTable': chain.deleteTable().run(); break;
        case 'undo': chain.undo().run(); break;
        case 'redo': chain.redo().run(); break;
      }
    });
  }
  el<HTMLSelectElement>('blog-block').addEventListener('change', (event) => {
    const value = (event.target as HTMLSelectElement).value;
    if (value === 'paragraph') editor.chain().focus().setParagraph().run();
    else if (value === 'code') editor.chain().focus().toggleCodeBlock().run();
    else editor.chain().focus().setHeading({ level: Number(value) as 2 | 3 | 4 }).run();
  });
  el<HTMLSelectElement>('blog-align').addEventListener('change', (event) => editor.chain().focus().setTextAlign((event.target as HTMLSelectElement).value).run());
  form.addEventListener('input', changed);
  input('blog-slug').addEventListener('input', () => { slugEdited = true; });
  input('blog-title').addEventListener('input', () => {
    if (!slugEdited) input('blog-slug').value = input('blog-title').value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 100).replace(/-$/, '');
    changed();
  });
  form.addEventListener('submit', (event) => { event.preventDefault(); if (validate()) void run(async () => { await save(); }, 'Enregistrement de l’article…'); });
  button('blog-preview').addEventListener('click', () => {
    if (!validate() || busy) return;
    const popup = window.open('about:blank', '_blank');
    if (popup) popup.opener = null;
    void run(async () => {
      try {
        const post = await save();
        if (!post) { popup?.close(); return; }
        const url = `/api/backoffice/blog/preview/${post.id}`;
        if (popup) popup.location.replace(url);
        else {
          notice('L’aperçu est prêt. Ouvrez-le avec le lien ci-dessous.');
          const link = create('a', '', 'Ouvrir l’aperçu dans un nouvel onglet'); link.href = url; link.target = '_blank'; link.rel = 'noopener noreferrer';
          el('blog-notice').append(document.createElement('br'), link);
        }
      } catch (cause) { popup?.close(); throw cause; }
    }, 'Préparation de l’aperçu…');
  });
  button('blog-publish').addEventListener('click', async () => {
    if (!selected || busy || dirty()) return;
    if (await context.confirm('Publier cet article ?', `La version enregistrée de « ${selected.title} » sera visible par tous sur le blog.`, 'Publier l’article')) await publication('publish');
  });
  button('blog-unpublish').addEventListener('click', async () => {
    if (!selected || busy) return;
    if (await context.confirm('Revenir en brouillon ?', 'L’article sera retiré du blog public et sa programmation sera annulée. Le contenu restera dans le backoffice.', 'Revenir en brouillon')) await publication('unpublish');
  });
  el<HTMLFormElement>('blog-schedule-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const instant = new Date(input('blog-scheduled-at').value);
    const scheduled_at = Math.floor(instant.getTime() / 1000);
    if (!Number.isFinite(scheduled_at) || scheduled_at <= Date.now() / 1000 + 60) { notice('Choisissez une date au moins une minute dans le futur.', true); input('blog-scheduled-at').focus(); return; }
    if (localDateTime(instant) !== input('blog-scheduled-at').value) { notice('Cette heure n’existe pas dans votre fuseau au changement d’heure. Choisissez un autre horaire.', true); input('blog-scheduled-at').focus(); return; }
    // Le contrôle datetime-local est interprété dans le fuseau affiché, puis converti en UTC.
    void publication('schedule', scheduled_at);
  });
  text('blog-timezone', `Heure locale : ${timezone}. La publication est enregistrée en UTC.`);
  button('blog-delete').addEventListener('click', async () => {
    if (!selected || busy) return;
    const post = selected;
    if (!await context.confirm('Supprimer cet article ?', `« ${post.title} » sera supprimé définitivement et retiré du blog public.`, 'Supprimer l’article')) return;
    await run(async () => {
      const current = generation;
      await context.api(`/blog/posts/${post.id}`, 'DELETE', { revision: post.revision });
      if (generation !== current || !context.isAuthenticated()) return;
      showList(); loaded = false;
      await context.navigate(listURL(), true);
      await loadList(); notice('L’article est supprimé.');
    }, 'Suppression de l’article…');
  });
  button('blog-new').addEventListener('click', () => { if (!busy) void context.navigate(sectionURL('redaction', undefined)); });
  el('blog-back').addEventListener('click', (event) => {
    if (event instanceof MouseEvent && (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0)) return;
    event.preventDefault(); if (!busy) void context.navigate(listURL());
  });
  button('blog-refresh').addEventListener('click', () => { void run(loadList, 'Actualisation des articles…'); });
  el<HTMLSelectElement>('blog-filter').addEventListener('change', () => { offset = 0; void context.navigate(listURL()); });
  input('blog-list-search')?.addEventListener('input', filterList);
  for (const [id, direction] of [['blog-previous', -1], ['blog-next', 1]] as const) button(id).addEventListener('click', () => { if (busy) return; offset = Math.max(0, offset + direction * limit); void context.navigate(listURL()); });
  for (const link of document.querySelectorAll<HTMLAnchorElement>('[data-blog-section-link], #blog-next-section')) link.addEventListener('click', (event) => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault(); void context.navigate(link.href);
  });
  window.addEventListener('beforeunload', (event) => { if (dirty()) event.preventDefault(); });

  function reset(preserveDraft = false) {
    if (preserveDraft && dirty()) retainedDraft = { post: selected ? structuredClone(selected) : undefined, fields: payload(), snapshot, scheduledAt: input('blog-scheduled-at').value, section: activeSection };
    else if (!preserveDraft) retainedDraft = undefined;
    generation += 1; listSequence += 1; selected = undefined; editing = false; loaded = false; busy = false;
    snapshot = ''; offset = 0; total = 0; media = []; loadedFilter = ''; loadedOffset = -1;
    form.reset(); el<HTMLFormElement>('blog-image-form').reset(); el<HTMLFormElement>('blog-upload-form').reset();
    el<HTMLFormElement>('blog-schedule-form').reset(); el<HTMLFormElement>('blog-link-form').reset();
    suppressUpdate = true; editor.destroy(); editor = createEditor(emptyDocument); suppressUpdate = false;
    editor.setEditable(true); el<HTMLFieldSetElement>('blog-fields').disabled = false;
    el<HTMLSelectElement>('blog-filter').disabled = false; el('blog-schedule-form').querySelector('fieldset')!.disabled = false;
    form.removeAttribute('aria-busy');
    for (const id of ['blog-post-list', 'blog-media-list', 'blog-seo-audit']) el(id).replaceChildren();
    for (const id of ['blog-notice', 'blog-media-notice', 'blog-serp-title', 'blog-serp-description', 'blog-serp-url', 'blog-publication-help', 'blog-word-count', 'blog-save-state', 'blog-document-title', 'blog-review-title', 'blog-review-excerpt', 'blog-review-url', 'blog-review-visibility', 'blog-review-changes']) if (el(id)) text(id, '');
    for (const id of ['blog-new', 'blog-refresh', 'blog-save', 'blog-preview']) button(id).disabled = false;
    el('blog-cover-preview').removeAttribute('src'); el('blog-cover-preview').hidden = true;
    el('blog-edit-view').hidden = true; el('blog-list-view').hidden = false; el('blog-notice').hidden = true;
    el('blog-pagination').hidden = true;
    el<HTMLSelectElement>('blog-filter').value = 'all';
    if (input('blog-list-search')) input('blog-list-search').value = '';
    mediaDialog.close(); linkDialog.close();
    updateToolbar();
  }
  function restoreDraft() {
    if (!retainedDraft) return false;
    const draft = retainedDraft; retainedDraft = undefined;
    const shell: BlogPost = { id: 0, status: 'draft', created_at: '', updated_at: '', revision: 0, published_at: null, scheduled_at: null, has_unpublished_changes: false, scheduled_revision: null, ...draft.post, ...draft.fields };
    fill(shell, draft.section); selected = draft.post; snapshot = draft.snapshot;
    input('blog-scheduled-at').value = draft.scheduledAt;
    updatePublication(); updateSEO(); showSection(draft.section);
    notice('Votre rédaction a été conservée pendant l’expiration de la session. Enregistrez-la pour la conserver en base.');
    return true;
  }
  return { open: openRoute, canNavigate, reset, restoreDraft, hasUnsavedChanges: dirty, confirmDiscard };
}
