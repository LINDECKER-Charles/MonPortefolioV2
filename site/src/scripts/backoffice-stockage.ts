/**
 * Stockage (components/backoffice/RubriqueStockage.astro) : lire ce que la
 * base occupe (GET /api/backoffice/storage) et l’afficher ; supprimer une
 * image inutilisée, après confirmation.
 *
 * Chargé à la demande, à la première visite de la rubrique
 * (scripts/backoffice.ts) : le reste du backoffice n’en paie pas le poids.
 * Relu à chaque visite et par « Actualiser ».
 *
 * Les textes reçus de l’API (noms de fichiers, titres) sont insérés comme
 * texte ; les vignettes viennent des adresses privées construites ici depuis
 * l’identifiant, jamais d’une adresse reçue.
 */
import { disqueSeRemplit, octets, part } from '../lib/octets';
import { ErreurApi, type Dire, type Etat } from './backoffice-commun';

type EtatArticle = 'draft' | 'scheduled' | 'published';
interface ArticleCite { id: number; slug: string; title: string; status: EtatArticle }
interface ImageStockee {
  id: number;
  filename: string;
  content_type: string;
  width: number | null;
  height: number | null;
  size: number;
  variants: { count: number; size: number; widths: number[] };
  total: number;
  posts: ArticleCite[];
}
interface Rapport {
  disk: { total: number; available: number } | null;
  database: { file: number | null; wal: number | null; size: number; free: number; page_size: number };
  categories: { media_originals: number; media_variants: number; posts: number; contacts: number; system: number };
  media: ImageStockee[];
  posts: (ArticleCite & { size: number })[];
  contacts: { count: number; size: number };
}

export interface ContexteStockage {
  api: <T>(chemin: string, method?: string, corps?: unknown) => Promise<T>;
  action: (cible: HTMLElement, operation: (dire: Dire) => Promise<void>, attente: string) => Promise<void>;
  afficher: (zone: HTMLElement, message: string, etat?: Etat) => void;
  confirmer: (titre: string, message: string, libelle: string) => Promise<boolean>;
  estConnecte: () => boolean;
  /** Ouvre une adresse du backoffice sans recharger la page (l’atelier du blog). */
  naviguer: (adresse: string) => Promise<void>;
}

export interface RubriqueStockage {
  charger: () => Promise<void>;
  reinitialiser: () => void;
}

const NBSP = '\u00a0';
const NNBSP = '\u202f';
const cite = (texte: string) => `«${NBSP}${texte}${NBSP}»`;
const ETATS: Record<EtatArticle, string> = { draft: 'Brouillon', scheduled: 'Programmé', published: 'Publié' };
/** La vignette : une boîte fixe, pour qu’aucune image ne décale la liste en arrivant. */
const VIGNETTE = { largeur: 96, hauteur: 72 };
/** Les parts de la base, dans l’ordre de la barre et de la légende. */
const PARTS = [
  ['media_originals', 'Originaux des images'],
  ['media_variants', 'Variantes des images'],
  ['posts', 'Articles'],
  ['contacts', 'Demandes de contact'],
  ['system', 'Fonctionnement'],
  ['free', 'Espace libéré'],
] as const;

const pluriel = (nombre: number, singulier: string, plurielForme = `${singulier}s`) => `${nombre}${NBSP}${nombre > 1 ? plurielForme : singulier}`;

export function brancherStockage(contexte: ContexteStockage): RubriqueStockage {
  const element = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
  const texte = (id: string, valeur: string) => { element(id).textContent = valeur; };
  const creer = <K extends keyof HTMLElementTagNameMap>(balise: K, classe = '', contenu?: string) => {
    const noeud = document.createElement(balise);
    if (classe) noeud.className = classe;
    if (contenu !== undefined) noeud.textContent = contenu;
    return noeud;
  };
  const contenu = element('bo-storage');
  const retour = element('bo-storage-retour');
  let rapport: Rapport | undefined;
  let sequence = 0;

  /** Un lien vers l’article dans l’atelier ; un clic ordinaire reste dans la page. */
  function lienArticle(article: ArticleCite): HTMLAnchorElement {
    const lien = creer('a', 'bo-stockage__article', article.title || 'Article sans titre');
    lien.href = `/backoffice/blog/redaction?id=${encodeURIComponent(String(article.id))}`;
    lien.addEventListener('click', (evenement) => {
      if (evenement.button !== 0 || evenement.metaKey || evenement.ctrlKey || evenement.shiftKey || evenement.altKey) return;
      evenement.preventDefault();
      void contexte.naviguer(lien.href);
    });
    return lien;
  }
  function etat(statut: EtatArticle): HTMLSpanElement {
    const noeud = creer('span', 'bo-state', ETATS[statut] ?? statut);
    noeud.dataset.state = statut;
    return noeud;
  }

  function afficherDisque(disque: Rapport['disk']): void {
    element('bo-storage-disk').hidden = !disque;
    element('bo-storage-disk-unknown').hidden = Boolean(disque);
    const alerte = element('bo-storage-disk-alert');
    if (!disque) { alerte.textContent = ''; return; }
    const occupe = Math.max(0, disque.total - disque.available);
    texte('bo-storage-disk-free', octets(disque.available));
    texte('bo-storage-disk-total', octets(disque.total));
    texte('bo-storage-disk-used', `Occupé${NBSP}: ${octets(occupe)}, ${part(occupe, disque.total)}`);
    element('bo-storage-disk-bar').style.inlineSize = disque.total > 0 ? `${(occupe / disque.total) * 100}%` : '0%';
    const plein = disqueSeRemplit(disque);
    element('bo-storage-disk').dataset.plein = String(plein);
    alerte.textContent = plein ? `Le disque se remplit${NBSP}: il reste ${octets(disque.available)}, ${part(disque.available, disque.total)} du disque.` : '';
  }

  function afficherBase(base: Rapport['database'], parts: Rapport['categories']): void {
    const surDisque = base.file === null ? base.size : base.file + (base.wal ?? 0);
    texte('bo-storage-db-total', octets(surDisque));
    texte('bo-storage-db-files', base.file === null
      ? `Base en mémoire, ${octets(base.size)} de pages.`
      : base.wal
        ? `Fichier ${octets(base.file)} et journal ${octets(base.wal)}.`
        : `Fichier ${octets(base.file)}, journal vide.`);
    const valeurs = PARTS.map(([cle, libelle]) => ({ cle, libelle, valeur: cle === 'free' ? base.free : parts[cle] }));
    const somme = valeurs.reduce((total, { valeur }) => total + valeur, 0) || 1;
    element('bo-storage-db-bar').replaceChildren(...valeurs.filter(({ valeur }) => valeur > 0).map(({ cle, valeur }) => {
      const segment = creer('span', 'bo-barre-stock__part');
      segment.dataset.part = cle;
      segment.style.flexGrow = String(valeur / somme);
      return segment;
    }));
    element('bo-storage-db-legend').replaceChildren(...valeurs.map(({ cle, libelle, valeur }) => {
      const item = creer('li');
      item.dataset.part = cle;
      item.append(creer('span', 'bo-legende__libelle', libelle), creer('span', 'bo-legende__valeur', octets(valeur)), creer('span', 'bo-legende__part', part(valeur, somme)));
      return item;
    }));
  }

  function vignette(image: ImageStockee): HTMLImageElement {
    const plusPetite = [...image.variants.widths].filter((largeur) => Number.isInteger(largeur) && largeur > 0).sort((a, b) => a - b)[0];
    const img = creer('img', 'bo-fiche__vignette');
    img.src = `/api/backoffice/blog/media/${encodeURIComponent(String(image.id))}${plusPetite ? `/${plusPetite}` : ''}`;
    // Décorative : le nom est écrit juste à côté, comme dans la bibliothèque de l’atelier.
    img.alt = '';
    img.width = VIGNETTE.largeur;
    img.height = VIGNETTE.hauteur;
    img.loading = 'lazy';
    img.decoding = 'async';
    return img;
  }

  function ficheImage(image: ImageStockee): HTMLLIElement {
    const item = creer('li', 'bo-fiche bo-fiche--image');
    item.dataset.mediaId = String(image.id);
    const corps = creer('div', 'bo-fiche__corps');
    const nom = creer('p', 'bo-fiche__nom', image.filename);
    const details = creer('p', 'bo-fiche__details chiffres');
    if (image.width && image.height) details.append(creer('span', '', `${image.width}${NNBSP}×${NNBSP}${image.height}${NBSP}px`));
    const variantes = image.variants.count
      ? `original ${octets(image.size)} et ${pluriel(image.variants.count, 'variante')} ${octets(image.variants.size)}`
      : `original ${octets(image.size)}, sans variante`;
    details.append(creer('span', '', variantes));
    corps.append(nom, details);

    const usage = creer('div', 'bo-fiche__usage');
    if (image.posts.length) {
      usage.append(creer('p', 'bo-fiche__intitule', 'Utilisée dans'));
      const liste = creer('ul', 'bo-fiche__articles');
      liste.append(...image.posts.map((article) => {
        const ligne = creer('li');
        ligne.append(lienArticle(article), etat(article.status));
        return ligne;
      }));
      usage.append(liste);
    } else usage.append(creer('p', 'bo-fiche__inutilisee', 'Inutilisée'));
    corps.append(usage);

    item.append(vignette(image), corps, creer('p', 'bo-fiche__poids chiffres', octets(image.total)));
    if (!image.posts.length) {
      const supprimer = creer('button', 'bo-button bo-button--danger bo-button--petit bo-fiche__action', 'Supprimer');
      supprimer.type = 'button';
      supprimer.append(creer('span', 'sr', ` ${image.filename}`));
      supprimer.addEventListener('click', () => { void supprimerImage(image, supprimer); });
      item.append(supprimer);
    }
    return item;
  }

  function ficheArticle(article: Rapport['posts'][number]): HTMLLIElement {
    const item = creer('li', 'bo-fiche bo-fiche--article');
    const corps = creer('div', 'bo-fiche__corps');
    corps.append(lienArticle(article), etat(article.status));
    item.append(corps, creer('p', 'bo-fiche__poids chiffres', octets(article.size)));
    return item;
  }

  function afficher(donnees: Rapport): void {
    rapport = donnees;
    afficherDisque(donnees.disk);
    afficherBase(donnees.database, donnees.categories);

    const images = donnees.media;
    const poidsImages = images.reduce((total, image) => total + image.total, 0);
    texte('bo-storage-media-count', images.length ? `${pluriel(images.length, 'image')}, ${octets(poidsImages)}` : '');
    element('bo-storage-media').replaceChildren(...images.map(ficheImage));
    element('bo-storage-media-empty').hidden = images.length > 0;

    const articles = donnees.posts;
    texte('bo-storage-posts-count', articles.length ? pluriel(articles.length, 'article') : '');
    element('bo-storage-posts').replaceChildren(...articles.map(ficheArticle));
    element('bo-storage-posts-empty').hidden = articles.length > 0;

    texte('bo-storage-contacts-count', donnees.contacts.count ? pluriel(donnees.contacts.count, 'demande') : 'Aucune demande');
    texte('bo-storage-contacts-size', octets(donnees.contacts.size));
    contenu.hidden = false;
  }

  async function charger(): Promise<void> {
    const numero = ++sequence;
    if (!rapport) contexte.afficher(retour, 'Mesure de la place prise…', 'pending');
    try {
      const donnees = await contexte.api<Rapport>('/storage');
      if (!contexte.estConnecte() || numero !== sequence) return;
      afficher(donnees);
      if (retour.dataset.state === 'pending') { retour.textContent = ''; delete retour.dataset.state; }
    } catch (cause) {
      if (numero === sequence && retour.dataset.state === 'pending') { retour.textContent = ''; delete retour.dataset.state; }
      throw cause;
    }
  }

  async function supprimerImage(image: ImageStockee, bouton: HTMLButtonElement): Promise<void> {
    const accord = await contexte.confirmer(
      'Supprimer cette image ?',
      `${cite(image.filename)} et ses variantes seront supprimées définitivement de la bibliothèque. Aucun article ne l’utilise.`,
      'Supprimer l’image',
    );
    if (!accord) return;
    await contexte.action(bouton, async (dire) => {
      try {
        // Le relais n’accepte une mutation du blog qu’en JSON, même sans contenu.
        await contexte.api(`/blog/media/${encodeURIComponent(String(image.id))}`, 'DELETE', {});
      } catch (cause) {
        if (cause instanceof ErreurApi && (cause.code === 'MEDIA_IN_USE' || cause.status === 404)) {
          await charger();
          dire(cause.code === 'MEDIA_IN_USE'
            ? `${cite(image.filename)} vient d’être utilisée dans un article${NBSP}: elle reste. La liste est à jour.`
            : `${cite(image.filename)} n’existe plus. La liste est à jour.`, 'error');
          element('bo-storage-media-title').focus();
          return;
        }
        throw cause;
      }
      await charger();
      dire(`${cite(image.filename)} est supprimée. Sa place sera réutilisée par les prochains imports.`);
      element('bo-storage-media-title').focus();
    }, 'Suppression de l’image…');
  }

  element('bo-storage-refresh').addEventListener('click', (evenement) => {
    void contexte.action(evenement.currentTarget as HTMLButtonElement, async (dire) => {
      await charger();
      dire('Les chiffres sont à jour.');
    }, 'Actualisation des chiffres…');
  });

  function reinitialiser(): void {
    sequence += 1;
    rapport = undefined;
    contenu.hidden = true;
    for (const id of ['bo-storage-media', 'bo-storage-posts', 'bo-storage-db-bar', 'bo-storage-db-legend']) element(id).replaceChildren();
    for (const id of ['bo-storage-media-count', 'bo-storage-posts-count', 'bo-storage-contacts-count', 'bo-storage-contacts-size', 'bo-storage-disk-free', 'bo-storage-disk-total', 'bo-storage-disk-used', 'bo-storage-disk-alert', 'bo-storage-db-total', 'bo-storage-db-files']) texte(id, '');
  }

  return { charger, reinitialiser };
}
