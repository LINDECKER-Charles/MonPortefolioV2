import { describe, expect, it } from 'vitest';
import { COMPTE_GITHUB, DEPOT_BLOODBORNE, DEPOTS_PRIVES_PRESENTES, DEPOTS_PUBLICS, DOMAINES_HORS_LIGNE } from '../../src/config/liens-publics';
import { DELAI_BUILD, pagesConstruites } from './support/dist';

/**
 * Garde-fou « liens publics » : le HTML construit ne mène que vers des dépôts
 * publics de la liste blanche, jamais vers le dépôt de Bloodborne Legendary Run
 * ni vers ceux de Karl Scraper, Sillage et Relais (privés, présentés sans
 * lien), ni vers une démo hors ligne.
 */

const AUTORISES = new Set(DEPOTS_PUBLICS.map((d) => d.nom.toLowerCase()));

/** Dépôts `github.com/<compte>/<dépôt>` cités dans un HTML (profil seul ignoré). */
function depotsCites(html: string): string[] {
  const motif = new RegExp(`github[a-z]*\\.com/(?:repos/)?${COMPTE_GITHUB}/([A-Za-z0-9_.-]+)`, 'gi');
  return [...html.matchAll(motif)].map((m) => m[1].replace(/(\.git)?\.*$/i, ''));
}

const PRIVES = new Set(DEPOTS_PRIVES_PRESENTES.map((d) => d.toLowerCase()));

/** Fautes d’un HTML : dépôt hors liste, dépôt privé (Bloodborne et les projets présentés sans lien), domaine hors ligne. */
function fautesLiens(html: string): string[] {
  const fautes: string[] = [];
  for (const depot of new Set(depotsCites(html))) {
    if (depot.toLowerCase() === DEPOT_BLOODBORNE.toLowerCase()) {
      fautes.push(`dépôt de Bloodborne Legendary Run (privé) : ${COMPTE_GITHUB}/${depot}`);
    } else if (PRIVES.has(depot.toLowerCase())) {
      fautes.push(`dépôt privé présenté sans lien : ${COMPTE_GITHUB}/${depot}`);
    } else if (!AUTORISES.has(depot.toLowerCase())) {
      fautes.push(`dépôt hors liste blanche : ${COMPTE_GITHUB}/${depot}`);
    }
  }
  if (new RegExp(`github[a-z]*\\.com/[^\\s"'<>]*${DEPOT_BLOODBORNE}`, 'i').test(html)) {
    fautes.push(`lien GitHub vers ${DEPOT_BLOODBORNE}`);
  }
  // Sous n’importe quel compte (fork, organisation) : jamais un lien vers ces dépôts.
  for (const depot of DEPOTS_PRIVES_PRESENTES) {
    if (new RegExp(`github[a-z]*\\.com/[^\\s"'<>]*/${depot.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\w.-])`, 'i').test(html)) fautes.push(`lien GitHub vers ${depot}`);
  }
  const minuscules = html.toLowerCase();
  for (const domaine of DOMAINES_HORS_LIGNE) {
    const motif = new RegExp(`(?<![a-z0-9-])${domaine.replace(/\./g, '\\.')}(?![a-z0-9-])`);
    if (motif.test(minuscules)) fautes.push(`démo hors ligne : ${domaine}`);
  }
  return fautes;
}

describe('liste blanche des liens publics : la liste elle-même', () => {
  it('ne contient aucun doublon, ni le dépôt de Bloodborne, ni un dépôt privé présenté sans lien', () => {
    const noms = DEPOTS_PUBLICS.map((d) => d.nom.toLowerCase());
    expect(new Set(noms).size).toBe(noms.length);
    expect(noms).not.toContain(DEPOT_BLOODBORNE.toLowerCase());
    for (const prive of DEPOTS_PRIVES_PRESENTES) expect(noms, prive).not.toContain(prive.toLowerCase());
  });

  it('date chaque vérification de visibilité', () => {
    for (const depot of DEPOTS_PUBLICS) expect(depot.verifie).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('liste blanche des liens publics : le détecteur', () => {
  it('admet un dépôt de la liste, le profil seul et les sites tiers', () => {
    expect(fautesLiens(`<a href="https://github.com/${COMPTE_GITHUB}/gup">gup</a>`)).toEqual([]);
    expect(fautesLiens(`<a href="https://github.com/${COMPTE_GITHUB}">profil</a>`)).toEqual([]);
    expect(fautesLiens('<a href="https://github.com/Teyliu/PVZF-Translation">amont</a>')).toEqual([]);
  });

  it('refuse un dépôt hors liste, quelle que soit la casse', () => {
    expect(fautesLiens(`<a href="https://github.com/${COMPTE_GITHUB}/Omnicard-app">x</a>`)).toEqual([
      `dépôt hors liste blanche : ${COMPTE_GITHUB}/Omnicard-app`,
    ]);
    expect(fautesLiens(`github.com/${COMPTE_GITHUB.toLowerCase()}/infra-vps/blob/main/README.md`)).toHaveLength(1);
  });

  it('refuse le dépôt de Bloodborne Legendary Run, même sous un autre compte', () => {
    expect(fautesLiens(`<a href="https://github.com/${COMPTE_GITHUB}/${DEPOT_BLOODBORNE}">x</a>`).join()).toMatch(/Bloodborne/);
    expect(fautesLiens(`<a href="https://github.com/ailleurs/${DEPOT_BLOODBORNE}">x</a>`).join()).toMatch(/Bloodborne/);
  });

  it('refuse les dépôts privés de Karl Scraper, Sillage et Relais, sous tout compte', () => {
    for (const depot of DEPOTS_PRIVES_PRESENTES) {
      expect(fautesLiens(`<a href="https://github.com/${COMPTE_GITHUB}/${depot}">x</a>`).join(), depot).toMatch(/privé/);
      expect(fautesLiens(`<a href="https://github.com/ailleurs/${depot}/tree/dev">x</a>`).join(), depot).toMatch(new RegExp(depot));
    }
  });

  it('refuse les domaines de démos hors ligne, sous-domaines compris', () => {
    for (const domaine of ['omnicard.fr', 'test.omnicard.fr', 'modding.pvzf-almanac.com']) {
      expect(fautesLiens(`<a href="https://${domaine}/jouer">démo</a>`), domaine).toContain(`démo hors ligne : ${domaine}`);
    }
    expect(fautesLiens('<a href="https://www.omnicard.fr">x</a>')).toEqual(['démo hors ligne : omnicard.fr']);
    expect(fautesLiens('<a href="https://monomnicard.fr">x</a>')).toEqual([]);
  });
});

describe('liens publics dans le HTML construit', () => {
  it('toutes les pages ne citent que des dépôts de la liste blanche, aucune démo hors ligne', async () => {
    const pages = await pagesConstruites();
    expect(pages.length).toBeGreaterThan(10);
    const fautes = pages.flatMap(({ url, html }) => fautesLiens(html).map((f) => `${url} : ${f}`));
    expect(fautes).toEqual([]);
  }, DELAI_BUILD);
});
