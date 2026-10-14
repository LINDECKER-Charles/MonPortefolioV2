import { describe, expect, it } from 'vitest';
import { jsonLd, noeudAriane, noeudPersonne, noeudProjet, titreCourt, titreDePage } from '../../src/lib/seo';
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

  it('ajoute le projet sur sa page, dont Charles est l’auteur', () => {
    expect(noeudProjet('/projets/gup', 'd')).toMatchObject({ '@type': 'SoftwareApplication', name: 'gup', author: { '@id': 'https://charles-lindecker.com/#charles-lindecker' } });
    expect(noeudProjet('/projets/pvz-fusion', 'd')).toMatchObject({ '@type': 'CreativeWork', url: 'https://github.com/Teyliu/PVZF-Translation' });
    expect(noeudProjet('/contact', 'd')).toBeUndefined();
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
