/**
 * Ce que les balises de partage et le JSON-LD ont en commun : adresses
 * absolues, nœuds schema.org de la personne et de la page.
 */
import { CONTACT, SITE } from '../config/site';

/** Adresse absolue sur l'hôte canonique : '/x' -> 'https://charles-lindecker.com/x'. */
export function absolue(chemin: string): string {
  return new URL(chemin, SITE.url).href.replace(/\/$/, chemin === '/' ? '/' : '');
}

export const PERSONNE_ID = `${SITE.url}/#charles-lindecker`;

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
  };
}

/**
 * JSON-LD sérialisé pour un <script type="application/ld+json"> : `<` échappé,
 * aucune chaîne ne peut refermer la balise.
 */
export function jsonLd(noeuds: Record<string, unknown>[]): string {
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': noeuds }).replace(/</g, '\\u003c');
}
