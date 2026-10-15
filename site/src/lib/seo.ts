/**
 * Ce que les balises de partage et le JSON-LD ont en commun : adresses
 * absolues, titre des pages, nœuds schema.org de la personne, de la page, du
 * fil d’Ariane et du projet.
 */
import { VITRINE, type ProjetVitrine } from '../config/projets';
import { CONTACT, SITE } from '../config/site';
import { FICHE as FICHE_BLOODBORNE } from '../config/bloodborne';
import { FICHE as FICHE_GITHEALTH, SCHEMA as SCHEMA_GITHEALTH } from '../config/githealth';
import { FICHE as FICHE_GUP } from '../config/gup';
import { FICHE as FICHE_KARL_SCRAPER, SCHEMA as SCHEMA_KARL_SCRAPER } from '../config/karl-scraper';
import { FICHE as FICHE_LEAGUE } from '../config/league-of-database';
import { FICHE as FICHE_OMNICARD } from '../config/omnicard';
import { FICHE as FICHE_PVZ } from '../config/pvz-fusion';
import { FICHE as FICHE_RELAIS, SCHEMA as SCHEMA_RELAIS } from '../config/relais';
import { FICHE as FICHE_SILLAGE, SCHEMA as SCHEMA_SILLAGE } from '../config/sillage';
import type { SchemaProjet } from '../components/projets/gabarit/types';

/** Adresse absolue sur l'hôte canonique : '/x' -> 'https://charles-lindecker.com/x'. */
export function absolue(chemin: string): string {
  return new URL(chemin, SITE.url).href.replace(/\/$/, chemin === '/' ? '/' : '');
}

export const PERSONNE_ID = `${SITE.url}/#charles-lindecker`;

const NOM = SITE.nom.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/** Un titre qui porte déjà le nom, quel qu’en soit le séparateur. */
const SUFFIXE_NOM = new RegExp(`(?:\\s*[—–|·,-]\\s*|\\s+de\\s+)${NOM}$`);

/**
 * Le <title> d’une page, sur un seul gabarit : « Titre court — Charles
 * Lindecker ». L’accueil garde le sien (« Charles Lindecker — architecte
 * logiciel »). Une page qui passe encore son titre complet, avec une virgule,
 * un point médian, un trait vertical ou « de Charles Lindecker », est ramenée
 * au gabarit : les pages n’ont à passer que leur titre court.
 */
export function titreDePage(titre: string, chemin: string): string {
  if (chemin === '/') return titre;
  return `${titre.replace(SUFFIXE_NOM, '').trim()} — ${SITE.nom}`;
}

/** Le titre court d’une page (sans le nom), pour le fil d’Ariane et les images de partage. */
export function titreCourt(titre: string): string {
  return titre.replace(SUFFIXE_NOM, '').trim();
}

interface Image {
  url: string;
  largeur: number;
  hauteur: number;
}

export function noeudPersonne(photo?: Image) {
  return {
    '@type': 'Person',
    '@id': PERSONNE_ID,
    name: SITE.nom,
    jobTitle: SITE.metier,
    url: `${SITE.url}/`,
    ...(photo && {
      image: { '@type': 'ImageObject', url: photo.url, width: photo.largeur, height: photo.hauteur },
    }),
    sameAs: [CONTACT.linkedin, CONTACT.github],
    knowsLanguage: ['fr', 'en'],
    // Employeur et ville affichés avec l’accord de Charles (questions.md, A2, 2026-10-09).
    worksFor: { '@type': 'Organization', name: 'B-Hive', address: { '@type': 'PostalAddress', addressLocality: 'Mulhouse', addressCountry: 'FR' } },
    workLocation: { '@type': 'Place', address: { '@type': 'PostalAddress', addressLocality: 'Mulhouse', addressCountry: 'FR' } },
  };
}

/** Les pages dont le fil d’Ariane nomme autre chose que le titre court. */
const NOMS_ARIANE: Readonly<Record<string, string>> = {
  '/projets': 'Projets',
  '/parcours': 'Parcours',
  '/parcours/professionnel': 'Parcours professionnel',
  '/parcours/competences': 'Compétences',
  '/parcours/formation': 'Formation et certifications',
  '/contact': 'Contact',
  '/blog': 'Blog',
  '/mentions-legales': 'Mentions légales',
  ...Object.fromEntries(VITRINE.map((projet) => [projet.href, projet.nom])),
};

/**
 * Le fil d’Ariane de la page en BreadcrumbList, comme le montre FilAriane :
 * l’accueil, les parents (« Projets », « Parcours »), la page. Rien pour
 * l’accueil.
 */
export function noeudAriane(chemin: string, titre: string) {
  if (chemin === '/') return undefined;
  const segments = chemin.split('/').filter(Boolean);
  const etapes = [{ nom: 'Accueil', chemin: '/' }, ...segments.map((_, i) => {
    const sous = `/${segments.slice(0, i + 1).join('/')}`;
    return { nom: NOMS_ARIANE[sous] ?? (sous === chemin ? titreCourt(titre) : sous), chemin: sous };
  })];
  return {
    '@type': 'BreadcrumbList',
    '@id': `${absolue(chemin)}#ariane`,
    itemListElement: etapes.map((etape, i) => ({ '@type': 'ListItem', position: i + 1, name: etape.nom, item: absolue(etape.chemin) })),
  };
}

/**
 * Ce que schema.org dit de chaque projet, et son adresse publique : le premier
 * lien de sa fiche, ou rien pour un projet sans lien public (dépôt privé), que
 * le nœud nomme alors par sa page. Les projets entrés le 14/10/2026 décrivent
 * le leur dans leur fichier (config/<projet>.ts, export SCHEMA).
 */
const PROJETS_SCHEMA: Readonly<Record<ProjetVitrine['id'], SchemaProjet & { url?: string }>> = {
  pvz: { type: 'CreativeWork', url: FICHE_PVZ.liens[0]?.href },
  league: { type: 'SoftwareApplication', url: FICHE_LEAGUE.liens[0]?.href, categorie: 'ReferenceApplication', systemes: 'Web' },
  omnicard: { type: 'CreativeWork', url: FICHE_OMNICARD.liens[0]?.href },
  bloodborne: { type: 'SoftwareApplication', url: FICHE_BLOODBORNE.liens[0]?.href, categorie: 'GameApplication', systemes: 'Web, Android' },
  // Interface en anglais et en français (`gup language fr`) : docs/prive/matiere-premiere.md.
  gup: { type: 'SoftwareApplication', url: FICHE_GUP.liens[0]?.href, categorie: 'DeveloperApplication', systemes: 'Windows, macOS, Linux', langue: ['en', 'fr'] },
  githealth: { ...SCHEMA_GITHEALTH, url: FICHE_GITHEALTH.liens[0]?.href },
  'karl-scraper': { ...SCHEMA_KARL_SCRAPER, url: FICHE_KARL_SCRAPER.liens[0]?.href },
  sillage: { ...SCHEMA_SILLAGE, url: FICHE_SILLAGE.liens[0]?.href },
  relais: { ...SCHEMA_RELAIS, url: FICHE_RELAIS.liens[0]?.href },
};

/** Le projet d’une page de projet de la vitrine (CreativeWork ou SoftwareApplication), dont Charles est l’auteur. */
export function noeudProjet(chemin: string, description: string) {
  const projet = VITRINE.find((p) => p.href === chemin);
  if (!projet) return undefined;
  const schema = PROJETS_SCHEMA[projet.id];
  return {
    '@type': schema.type,
    '@id': `${absolue(chemin)}#projet`,
    name: projet.nom,
    description,
    url: schema.url ?? absolue(chemin),
    author: { '@id': PERSONNE_ID },
    inLanguage: schema.langue ?? SITE.langue,
    ...(schema.categorie && { applicationCategory: schema.categorie }),
    ...(schema.systemes && { operatingSystem: schema.systemes }),
  };
}

export function noeudPage({ chemin, titre, description }: { chemin: string; titre: string; description: string }) {
  const url = absolue(chemin);
  return {
    '@type': chemin === '/' ? 'ProfilePage' : 'WebPage',
    '@id': `${url}#page`,
    url,
    name: titre,
    description,
    inLanguage: SITE.langue,
    isPartOf: { '@type': 'WebSite', '@id': `${SITE.url}/#site`, url: `${SITE.url}/`, name: SITE.nom },
    ...(chemin === '/' ? { mainEntity: { '@id': PERSONNE_ID } } : { about: { '@id': PERSONNE_ID } }),
    ...(chemin !== '/' && { breadcrumb: { '@id': `${url}#ariane` } }),
    ...(VITRINE.some((projet) => projet.href === chemin) && { mainEntity: { '@id': `${url}#projet` } }),
  };
}

/**
 * JSON-LD sérialisé pour un <script type="application/ld+json"> : `<` échappé,
 * aucune chaîne ne peut refermer la balise.
 */
export function jsonLd(noeuds: Record<string, unknown>[]): string {
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': noeuds }).replace(/</g, '\\u003c');
}
