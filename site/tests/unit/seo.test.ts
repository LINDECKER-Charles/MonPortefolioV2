import { describe, expect, it } from 'vitest';
import { VITRINE } from '../../src/config/projets';
import { NOMBRE_CERTIFICATIONS } from '../../src/config/formation';
import { jsonLd, noeudAriane, noeudPage, noeudPersonne, noeudProjet, noeudSite, titreCourt, titreDePage } from '../../src/lib/seo';
import { SITE } from '../../src/config/site';
import { DELAI_BUILD, pagesConstruites } from './support/dist';

/**
 * Ce que lisent les moteurs et les réseaux (lib/seo.ts) : un seul gabarit de
 * titre, le fil d’Ariane en BreadcrumbList, le projet d’une page de projet et
 * l’employeur autorisé de Charles.
 */

describe('titre des pages', () => {
  it('compose « Titre court — Charles Lindecker », quel que soit le séparateur donné', () => {
    for (const titre of ['Parcours', 'Parcours de Charles Lindecker', 'Parcours, Charles Lindecker', 'Parcours · Charles Lindecker', 'Parcours | Charles Lindecker', 'Parcours — Charles Lindecker']) {
      expect(titreDePage(titre, '/parcours'), titre).toBe('Parcours — Charles Lindecker');
    }
    expect(titreCourt('Formation et certifications · Charles Lindecker')).toBe('Formation et certifications');
  });

  it('laisse l’accueil tel quel', () => {
    expect(titreDePage('Charles Lindecker — architecte logiciel', '/')).toBe('Charles Lindecker — architecte logiciel');
  });
});

describe('JSON-LD', () => {
  it('décrit le fil d’Ariane d’une page de projet, comme FilAriane', () => {
    const ariane = noeudAriane('/projets/gup', 'gup — Charles Lindecker');
    expect(ariane?.itemListElement.map((e) => [e.position, e.name, e.item])).toEqual([
      [1, 'Accueil', 'https://charles-lindecker.com/'],
      [2, 'Projets', 'https://charles-lindecker.com/projets'],
      [3, 'gup', 'https://charles-lindecker.com/projets/gup'],
    ]);
    expect(noeudAriane('/', 'Accueil')).toBeUndefined();
    expect(noeudAriane('/parcours/competences', 'Compétences')?.itemListElement.map((e) => e.name)).toEqual(['Accueil', 'Parcours', 'Compétences']);
  });

  it('ajoute le projet sur sa page, dont Charles est l’auteur, avec l’image de partage de la page', () => {
    expect(noeudProjet('/projets/gup', 'd', 'https://charles-lindecker.com/og/x.jpg')).toMatchObject({
      '@type': 'SoftwareSourceCode',
      name: 'gup',
      author: { '@id': 'https://charles-lindecker.com/#charles-lindecker' },
      codeRepository: 'https://github.com/LINDECKER-Charles/gup',
      image: 'https://charles-lindecker.com/og/x.jpg',
    });
    expect(noeudProjet('/projets/pvz-fusion', 'd')).toMatchObject({ '@type': 'CreativeWork', url: 'https://github.com/Teyliu/PVZF-Translation' });
    expect(noeudProjet('/projets/pvz-fusion', 'd')).not.toHaveProperty('codeRepository');
    // Un projet privé, sans lien public : le nœud prend l’adresse de sa page.
    for (const projet of VITRINE.filter((p) => p.prive)) {
      expect(noeudProjet(projet.href, 'd'), projet.id).toMatchObject({ name: projet.nom, url: `https://charles-lindecker.com${projet.href}` });
      expect(noeudProjet(projet.href, 'd'), projet.id).not.toHaveProperty('codeRepository');
    }
    expect(noeudProjet('/contact', 'd')).toBeUndefined();
  });

  it('ne déclare aucune application : Google y exige un prix et des notes qu’aucun projet n’a', () => {
    for (const projet of VITRINE) expect(['CreativeWork', 'SoftwareSourceCode'], projet.id).toContain(noeudProjet(projet.href, 'd')?.['@type']);
  });

  it('nomme le site sur l’accueil et date chaque page', () => {
    expect(noeudSite()).toMatchObject({ '@type': 'WebSite', '@id': 'https://charles-lindecker.com/#site', name: 'Charles Lindecker', url: 'https://charles-lindecker.com/', alternateName: 'charles-lindecker.com' });
    expect(noeudPage({ chemin: '/', titre: 't', description: 'd', maj: '2026-10-15' })).toMatchObject({ '@type': 'ProfilePage', dateModified: '2026-10-15', isPartOf: { '@id': 'https://charles-lindecker.com/#site' } });
    expect(noeudPage({ chemin: '/contact', titre: 't', description: 'd' })).not.toHaveProperty('dateModified');
  });

  it('décrit /projets comme la liste des projets de la vitrine, dans son ordre', () => {
    const page = noeudPage({ chemin: '/projets', titre: 't', description: 'd' });
    expect(page['@type']).toBe('CollectionPage');
    expect(page.mainEntity).toMatchObject({ '@type': 'ItemList' });
    const elements = (page.mainEntity as { itemListElement: { position: number; name: string; url: string }[] }).itemListElement;
    expect(elements.map((e) => [e.position, e.name, e.url])).toEqual(VITRINE.map((p, i) => [i + 1, p.nom, `https://charles-lindecker.com${p.href}`]));
  });

  it('complète la personne sur l’accueil : compétences, écoles, titre et certifications', () => {
    const complet = noeudPersonne(undefined, { complet: true });
    expect(complet.knowsAbout).toEqual(expect.arrayContaining(['Architecture logicielle', 'C#', 'Angular']));
    expect(complet.alumniOf?.map((ecole) => ecole.name)).toEqual(['Elan Formation', 'IUT Nancy-Brabois']);
    expect(complet.hasCredential).toHaveLength(1 + NOMBRE_CERTIFICATIONS);
    expect(complet.hasCredential?.[0]).toMatchObject({ name: 'Développeur Web et Web Mobile (DWWM)', credentialCategory: 'Titre professionnel' });
    expect(noeudPersonne()).not.toHaveProperty('hasCredential');
    expect(noeudPersonne().sameAs).toEqual(expect.arrayContaining(['https://www.linkedin.com/in/charles-lindecker/', 'https://github.com/LINDECKER-Charles', 'https://www.frontendmentor.io/profile/LINDECKER-Charles']));
  });

  it('nomme l’employeur et la ville autorisés (questions.md, A2)', () => {
    expect(noeudPersonne()).toMatchObject({ worksFor: { '@type': 'Organization', name: 'B-Hive', address: { addressLocality: 'Mulhouse' } } });
  });

  it('échappe < pour qu’aucune chaîne ne referme la balise', () => {
    expect(jsonLd([{ name: '</script>' }])).not.toContain('</script>');
  });
});

describe('Search Console', () => {
  it('l’accueil, et lui seul, garde la balise de vérification de la propriété', async () => {
    const balise = `<meta name="google-site-verification" content="${SITE.verificationGoogle}">`;
    const pages = await pagesConstruites();
    const porteuses = pages.filter(({ html }) => html.includes('google-site-verification')).map(({ url }) => url);
    expect(porteuses).toEqual(['/']);
    expect(pages.find(({ url }) => url === '/')?.html).toContain(balise);
  }, DELAI_BUILD);
});
