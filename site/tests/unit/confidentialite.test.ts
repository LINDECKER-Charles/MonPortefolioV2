import { describe, expect, it } from 'vitest';
import { VITRINE } from '../../src/config/projets';
import { confidentialite } from '../support/prive';
import { DELAI_BUILD, pagesConstruites } from './support/dist';

/**
 * Garde-fou « confidentialité » (décision de Charles du 14/10/2026) :
 * AutoTicket, Sillage et Relais sont des dépôts privés présentés sans lien ni nom
 * de dépôt. Dans tout le site construit (texte, attributs, JSON-LD), aucun nom
 * privé : ni nom interne, ni nom de ces dépôts. Et sur les pages de la famille
 * « IA », aucune mention de l’employeur hors du nœud de la personne dans le
 * JSON-LD (employeur affiché ailleurs avec l’accord de Charles).
 *
 * Les noms et le motif de l’employeur vivent dans le cadrage privé
 * (`tests/support/prive.ts`) : ce dépôt et les journaux de sa CI sont publics,
 * une faute se désigne donc par le numéro du nom, jamais par le nom.
 */

const { nomsInternes, depotsPrivesPresentes, employeur } = confidentialite();
const NOMS = [...nomsInternes, ...depotsPrivesPresentes];
const echapper = (texte: string) => texte.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/** Un nom entier : ni lettre, ni chiffre, ni « _ » collés de part et d’autre (« app-x » n’est pas « app-x-v2 »). */
const motEntier = (nom: string) => new RegExp(`(?<![\\p{L}\\p{N}_])${echapper(nom)}(?![\\p{L}\\p{N}_]|-[\\p{L}\\p{N}])`, 'iu');
const INTERDITS = NOMS.map((nom, i) => ({ repere: `nom privé n°${i + 1}`, motif: motEntier(nom) }));
const EMPLOYEUR = new RegExp(employeur, 'i');

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
  return INTERDITS.filter(({ motif }) => motif.test(propre)).map(({ repere }) => repere);
}

describe('confidentialité : le détecteur', () => {
  it('lit des listes non vides dans le cadrage privé', () => {
    expect(nomsInternes.length).toBeGreaterThan(0);
    expect(depotsPrivesPresentes.length).toBeGreaterThan(0);
  });

  it('refuse chaque nom privé, quelle que soit la casse', () => {
    NOMS.forEach((nom, i) => {
      const repere = `nom privé n°${i + 1}`;
      expect(nomsInterdits(`<p>Voir ${nom.toUpperCase()}.</p>`), repere).toContain(repere);
      expect(nomsInterdits(`<img alt="capture de ${nom}" src="/a.webp">`), repere).toContain(repere);
      expect(nomsInterdits(`<script type="application/ld+json">{"url":"https://exemple.test/${nom}/12"}</script>`), repere).toContain(repere);
    });
  });

  it('admet les mots voisins et les hachages des fichiers construits', () => {
    NOMS.forEach((nom, i) => {
      const repere = `nom privé n°${i + 1}`;
      expect(nomsInterdits(`<p>${nom}x et x${nom}</p>`), repere).not.toContain(repere);
      expect(nomsInterdits(`<img src="/_astro/atlas.${nom}.webp" alt="">`), repere).toEqual([]);
    });
    expect(nomsInterdits('<p>AutoTicket, Sillage et Relais.</p>')).toEqual([]);
  });

  it('retire le seul nœud de la personne du JSON-LD, le reste gardé', () => {
    const graphe = (relais: string) => `<script type="application/ld+json">{"@graph":[{"@type":"Person","worksFor":{"name":"EMPLOYEUR"}},{"@type":"WebPage","name":"${relais}"}]}</script>`;
    const html = graphe('Relais');
    expect(sansPersonne(html)).not.toContain('EMPLOYEUR');
    expect(sansPersonne(html)).toContain('"name":"Relais"');
    expect(sansPersonne(graphe('Relais chez EMPLOYEUR'))).toContain('EMPLOYEUR');
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
