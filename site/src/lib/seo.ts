/**
 * Ce que les balises de partage et le JSON-LD ont en commun : adresses
 * absolues, titre des pages, nœuds schema.org du site, de la personne, de la
 * page, du fil d’Ariane et du projet.
 */
import { QUOTIDIEN } from '../config/competences';
import { DIPLOME, DOMAINES_CERTIFICATIONS, ETUDES_AVANT, FRONTEND_MENTOR, PROFIL_FREECODECAMP } from '../config/formation';
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
import type { DonneesFiche, SchemaProjet } from '../components/projets/gabarit/types';

/** Adresse absolue sur l'hôte canonique : '/x' -> 'https://charles-lindecker.com/x'. */
export function absolue(chemin: string): string {
  return new URL(chemin, SITE.url).href.replace(/\/$/, chemin === '/' ? '/' : '');
}

export const PERSONNE_ID = `${SITE.url}/#charles-lindecker`;
export const SITE_ID = `${SITE.url}/#site`;

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

/**
 * Le site, sur l’accueil : la forme que Google lit pour choisir le nom du
 * site affiché dans ses résultats.
 */
export function noeudSite() {
  return {
    '@type': 'WebSite',
    '@id': SITE_ID,
    url: `${SITE.url}/`,
    name: SITE.nom,
    alternateName: new URL(SITE.url).hostname,
    inLanguage: SITE.langue,
    publisher: { '@id': PERSONNE_ID },
  };
}

const MULHOUSE = { '@type': 'PostalAddress', addressLocality: 'Mulhouse', addressCountry: 'FR' } as const;

/**
 * Ce que la page Formation montre, en schema.org : l’école du titre et celle
 * du BUT Réseaux & Télécoms, seules nommées, puis le titre et les douze
 * certifications, chacune avec son certificat.
 */
function formation() {
  const [ecole, ville] = DIPLOME.organisme.split(', ');
  const iut = ETUDES_AVANT.find((etude) => etude.id === 'reseaux')?.organisme;
  return {
    alumniOf: [
      { '@type': 'EducationalOrganization', name: ecole, ...(ville === 'Mulhouse' && { address: MULHOUSE }) },
      ...(iut ? [{ '@type': 'EducationalOrganization', name: iut }] : []),
    ],
    hasCredential: [
      { '@type': 'EducationalOccupationalCredential', name: `${DIPLOME.titre} (${DIPLOME.sigle})`, credentialCategory: 'Titre professionnel', educationalLevel: DIPLOME.niveau },
      ...DOMAINES_CERTIFICATIONS.flatMap((domaine) =>
        domaine.certifications.map((certification) => ({
          '@type': 'EducationalOccupationalCredential',
          name: 'version' in certification ? `${certification.titre} (${certification.version})` : certification.titre,
          credentialCategory: 'Certification',
          url: certification.url,
          dateCreated: certification.date,
          recognizedBy: domaine.organisme.split(' et ').map((name) => ({ '@type': 'Organization', name })),
        })),
      ),
    ],
  };
}

/**
 * Charles. Chaque page le décrit sous le même @id ; l’accueil, sa page de
 * profil, ajoute ce qu’il sait faire (le métier et la stack du quotidien),
 * ses écoles et ses certifications.
 */
export function noeudPersonne(photo?: Image, { complet = false } = {}) {
  return {
    '@type': 'Person',
    '@id': PERSONNE_ID,
    name: SITE.nom,
    jobTitle: SITE.metier,
    url: `${SITE.url}/`,
    ...(photo && {
      image: { '@type': 'ImageObject', url: photo.url, width: photo.largeur, height: photo.hauteur },
    }),
    sameAs: [CONTACT.linkedin, CONTACT.github, FRONTEND_MENTOR.profil, PROFIL_FREECODECAMP],
    knowsLanguage: ['fr', 'en'],
    // Employeur et ville affichés avec l’accord de Charles (questions.md, A2, 2026-10-09).
    worksFor: { '@type': 'Organization', name: 'B-Hive', address: MULHOUSE },
    workLocation: { '@type': 'Place', address: MULHOUSE },
    ...(complet && {
      knowsAbout: ['Architecture logicielle', 'Développement web', 'DevOps', ...QUOTIDIEN.map((techno) => techno.nom)],
      ...formation(),
    }),
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

type SchemaAvecAdresses = SchemaProjet & { url?: string; depot?: string };

/** Le schéma d’un projet, son adresse publique (le premier lien de sa fiche) et, pour un code public, son dépôt GitHub. */
function avecAdresses(schema: SchemaProjet, fiche: DonneesFiche): SchemaAvecAdresses {
  const depot = fiche.liens.find((lien) => lien.href.startsWith('https://github.com/'))?.href;
  return { ...schema, url: fiche.liens[0]?.href, ...(schema.type === 'SoftwareSourceCode' && depot && { depot }) };
}

/**
 * Ce que schema.org dit de chaque projet, et son adresse publique : le premier
 * lien de sa fiche, ou rien pour un projet sans lien public (dépôt privé), que
 * le nœud nomme alors par sa page. Les projets entrés le 14/10/2026 décrivent
 * le leur dans leur fichier (config/<projet>.ts, export SCHEMA).
 */
const PROJETS_SCHEMA: Readonly<Record<ProjetVitrine['id'], SchemaAvecAdresses>> = {
  pvz: avecAdresses({ type: 'CreativeWork' }, FICHE_PVZ),
  league: avecAdresses({ type: 'SoftwareSourceCode' }, FICHE_LEAGUE),
  omnicard: avecAdresses({ type: 'CreativeWork' }, FICHE_OMNICARD),
  bloodborne: avecAdresses({ type: 'CreativeWork' }, FICHE_BLOODBORNE),
  // Interface en anglais et en français (`gup language fr`) : docs/prive/matiere-premiere.md.
  gup: avecAdresses({ type: 'SoftwareSourceCode', langue: ['en', 'fr'] }, FICHE_GUP),
  githealth: avecAdresses(SCHEMA_GITHEALTH, FICHE_GITHEALTH),
  'karl-scraper': avecAdresses(SCHEMA_KARL_SCRAPER, FICHE_KARL_SCRAPER),
  sillage: avecAdresses(SCHEMA_SILLAGE, FICHE_SILLAGE),
  relais: avecAdresses(SCHEMA_RELAIS, FICHE_RELAIS),
};

/**
 * Le projet d’une page de projet de la vitrine (CreativeWork, ou
 * SoftwareSourceCode et son dépôt), dont Charles est l’auteur, avec l’image
 * de partage de sa page.
 */
export function noeudProjet(chemin: string, description: string, image?: string) {
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
    ...(image && { image }),
    ...(schema.depot && { codeRepository: schema.depot }),
  };
}

/**
 * La page : le profil de Charles sur l’accueil, la liste des projets de la
 * vitrine sur /projets, une page web ailleurs ; `maj`, la date de son dernier
 * contenu (config/pages.ts), devient dateModified.
 */
export function noeudPage({ chemin, titre, description, maj }: { chemin: string; titre: string; description: string; maj?: string }) {
  const url = absolue(chemin);
  const type = chemin === '/' ? 'ProfilePage' : chemin === '/projets' ? 'CollectionPage' : 'WebPage';
  return {
    '@type': type,
    '@id': `${url}#page`,
    url,
    name: titre,
    description,
    inLanguage: SITE.langue,
    ...(maj && { dateModified: maj }),
    isPartOf: chemin === '/' ? { '@id': SITE_ID } : { '@type': 'WebSite', '@id': SITE_ID, url: `${SITE.url}/`, name: SITE.nom },
    ...(chemin === '/' ? { mainEntity: { '@id': PERSONNE_ID } } : { about: { '@id': PERSONNE_ID } }),
    ...(chemin !== '/' && { breadcrumb: { '@id': `${url}#ariane` } }),
    ...(VITRINE.some((projet) => projet.href === chemin) && { mainEntity: { '@id': `${url}#projet` } }),
    ...(type === 'CollectionPage' && {
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: VITRINE.map((projet, i) => ({ '@type': 'ListItem', position: i + 1, name: projet.nom, url: absolue(projet.href) })),
      },
    }),
  };
}

/**
 * JSON-LD sérialisé pour un <script type="application/ld+json"> : `<` échappé,
 * aucune chaîne ne peut refermer la balise.
 */
export function jsonLd(noeuds: Record<string, unknown>[]): string {
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': noeuds }).replace(/</g, '\\u003c');
}
