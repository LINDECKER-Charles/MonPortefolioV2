import { describe, expect, it } from 'vitest';
import { DEPOTS_PRIVES_PRESENTES, NOMS_INTERNES } from '../../src/config/liens-publics';
import { VITRINE } from '../../src/config/projets';
import { DELAI_BUILD, pagesConstruites } from './support/dist';

/**
 * Garde-fou « confidentialité » (décision de Charles du 14/10/2026) : Karl
 * Scraper, Sillage et Relais sont des dépôts privés présentés sans lien ni nom
 * de dépôt. Dans tout le site construit
 * (texte, attributs, JSON-LD), aucun nom interne (NOMS_INTERNES : l’adresse de
 * l’outil source, le nom technique de Karl Scraper, les projets internes) ni
 * aucun nom de ces dépôts (DEPOTS_PRIVES_PRESENTES) ; et sur les pages de la
 * famille « IA », aucune mention de l’employeur, hors du nœud de la personne
 * dans le JSON-LD (employeur affiché ailleurs avec l’accord de Charles,
 * questions.md, A2) : rien n’y nomme l’employeur.
 */

const echapper = (texte: string) => texte.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/** Un nom entier : ni lettre, ni chiffre, ni « _ » collés de part et d’autre (« depot-prive » n’est pas « depot-prive »). */
const motEntier = (nom: string) => new RegExp(`(?<![\\p{L}\\p{N}_])${echapper(nom)}(?![\\p{L}\\p{N}_]|-[\\p{L}\\p{N}])`, 'iu');
const INTERDITS = [...NOMS_INTERNES, ...DEPOTS_PRIVES_PRESENTES].map((nom) => ({ nom, motif: motEntier(nom) }));
const EMPLOYEUR = /b[-\s]?hive/i;

/** Le HTML sans les adresses de fichiers construits ni les données en ligne, où un hachage pourrait former un nom par hasard. */
function sansAdressesDeFichiers(html: string): string {
  return html.replace(/\/_astro\/[^"'\s),]+/g, ' ').replace(/data:[a-z]+\/[a-z0-9.+-]+;base64,[A-Za-z0-9+/=]+/gi, ' ');
}

/** Le HTML, les nœuds Person de son JSON-LD retirés (le reste du graphe gardé). */
function sansPersonne(html: string): string {
  return html.replace(/(<script type="application\/ld\+json"[^>]*>)([\s\S]*?)(<\/script>)/g, (_, ouvre: string, json: string, ferme: string) => {
    const donnees = JSON.parse(json) as { '@graph'?: { '@type'?: string }[] };
    const graphe = (donnees['@graph'] ?? []).filter((noeud) => noeud['@type'] !== 'Person');
    return `${ouvre}${JSON.stringify({ ...donnees, '@graph': graphe })}${ferme}`;
  });
}

function nomsInterdits(html: string): string[] {
  const propre = sansAdressesDeFichiers(html);
  return INTERDITS.filter(({ motif }) => motif.test(propre)).map(({ nom }) => nom);
}

describe('confidentialité : le détecteur', () => {
  it('refuse chaque nom interne et chaque nom de dépôt privé, quelle que soit la casse', () => {
    for (const nom of [...NOMS_INTERNES, ...DEPOTS_PRIVES_PRESENTES]) {
      expect(nomsInterdits(`<p>Voir ${nom.toUpperCase()}.</p>`), nom).toContain(nom);
      expect(nomsInterdits(`<img alt="capture de ${nom}" src="/a.webp">`), nom).toContain(nom);
    }
    expect(nomsInterdits('<script type="application/ld+json">{"url":"https://outil-source.example/t/12"}</script>')).toContain('outil-source.example');
  });

  it('admet les mots voisins et les hachages des fichiers construits', () => {
    expect(nomsInterdits('<p>La force d’un outil, un holon, un relais de lanterne.</p>')).toEqual([]);
    expect(nomsInterdits('<img src="/_astro/atlas.nom-interne_nom-interne.webp" alt="">')).toEqual([]);
    expect(nomsInterdits('<p>Karl Scraper, Sillage et Relais.</p>')).toEqual([]);
  });

  it('retire le seul nœud de la personne du JSON-LD, le reste gardé', () => {
    const html = '<script type="application/ld+json">{"@graph":[{"@type":"Person","worksFor":{"name":"B-Hive"}},{"@type":"WebPage","name":"Relais"}]}</script>';
    expect(sansPersonne(html)).not.toMatch(EMPLOYEUR);
    expect(sansPersonne(html)).toContain('"name":"Relais"');
    expect(sansPersonne(html.replace('"WebPage","name":"Relais"', '"WebPage","name":"Relais chez B-Hive"'))).toMatch(EMPLOYEUR);
  });
});

describe('confidentialité dans le HTML construit', () => {
  it('aucune page ne cite un nom interne ni un dépôt privé présenté', async () => {
    const pages = await pagesConstruites();
    expect(pages.length).toBeGreaterThan(10);
    const fautes = pages.flatMap(({ url, html }) => nomsInterdits(html).map((nom) => `${url} : ${nom}`));
    expect(fautes).toEqual([]);
  }, DELAI_BUILD);

  it('les pages de la famille « IA » ne nomment pas l’employeur, hors du nœud de la personne', async () => {
    const pages = await pagesConstruites();
    const ia = VITRINE.filter((projet) => projet.famille === 'ia');
    expect(ia.length).toBeGreaterThan(0);
    for (const projet of ia) {
      const page = pages.find((p) => p.url === projet.href);
      expect(page, projet.href).toBeDefined();
      const reste = sansPersonne(sansAdressesDeFichiers(page!.html));
      const trouve = EMPLOYEUR.exec(reste);
      expect(trouve ? `…${reste.slice(Math.max(0, trouve.index - 60), trouve.index + 40)}…` : null, projet.href).toBeNull();
    }
  }, DELAI_BUILD);
});
