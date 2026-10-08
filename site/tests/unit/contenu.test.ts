import { describe, expect, it } from 'vitest';
import { CHAPITRES } from '../../src/config/chapitres';
import { GLOSSAIRE } from '../../src/config/glossaire';
import { ARCHIVE_V1, CONTACT, CV, MAILTO, SITE } from '../../src/config/site';
import { jsonLd, noeudPage, noeudPersonne } from '../../src/lib/seo';

describe('chapitres', () => {
  it('sont numérotés dans l’ordre, avec des identifiants uniques', () => {
    expect(CHAPITRES.map((c) => c.num)).toEqual([1, 2, 3, 4, 5]);
    expect(new Set(CHAPITRES.map((c) => c.id)).size).toBe(CHAPITRES.length);
  });

  it('gardent les identifiants du plan de marquage', () => {
    // Changer un identifiant casse la série statistique de l'événement `lecture`.
    expect(CHAPITRES.map((c) => c.id)).toEqual(['origine', 'aujourdhui', 'preuves', 'dehors', 'discutons']);
  });
});

describe('glossaire', () => {
  it('chaque terme a un identifiant stable en kebab-case et une définition courte', () => {
    const ids = Object.values(GLOSSAIRE).map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const terme of Object.values(GLOSSAIRE)) {
      expect(terme.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(terme.definition.length).toBeLessThanOrEqual(180);
      expect(terme.definition).not.toMatch(/'/);
    }
  });
});

describe('coordonnées', () => {
  it('le lien d’écriture vise l’adresse de contact, avec un objet', () => {
    expect(MAILTO).toBe(`mailto:${encodeURIComponent(CONTACT.email)}?subject=Discutons`);
  });

  it('aucun lien vers ce qui n’existe pas encore', () => {
    // Le CV aligné sur le récit et l'archive de la V1 restent à produire :
    // tant qu'ils valent null, aucun bouton ni lien ne s'affiche.
    expect(CV === null || CV.startsWith('/')).toBe(true);
    expect(ARCHIVE_V1 === null || ARCHIVE_V1.startsWith('https://')).toBe(true);
  });
});

describe('JSON-LD', () => {
  it('décrit une page de profil et sa personne, sans pouvoir refermer la balise', () => {
    const texte = jsonLd([
      noeudPage({ chemin: '/', titre: 'Titre </script>', description: 'Description' }),
      noeudPersonne({ url: `${SITE.url}/photo.jpg`, largeur: 800, hauteur: 1200 }),
    ]);
    expect(texte).not.toContain('</script>');
    const donnees = JSON.parse(texte);
    expect(donnees['@graph'][0]['@type']).toBe('ProfilePage');
    expect(donnees['@graph'][0].mainEntity['@id']).toBe(donnees['@graph'][1]['@id']);
    expect(donnees['@graph'][1].sameAs).toEqual([CONTACT.linkedin, CONTACT.github]);
  });
});
