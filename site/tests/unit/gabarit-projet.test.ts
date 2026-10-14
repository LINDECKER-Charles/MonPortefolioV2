import { describe, expect, it } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import DecisionsProjet from '../../src/components/projets/gabarit/DecisionsProjet.astro';
import EnTeteProjet from '../../src/components/projets/gabarit/EnTeteProjet.astro';
import FicheProjet from '../../src/components/projets/gabarit/FicheProjet.astro';
import SortieProjet from '../../src/components/projets/gabarit/SortieProjet.astro';
import SourcesProjet from '../../src/components/projets/gabarit/SourcesProjet.astro';
import { FAMILLES_PROJETS, projetDeLaVitrine, VEDETTE, VITRINE, VITRINE_PAR_FAMILLE } from '../../src/config/projets';
import { anglaises, DECISIONS, EN_TETE, FICHE, manquantes, PREUVES, RELEVE_ATTEINT, RELEVES } from '../../src/config/pvz-fusion';

/**
 * Le gabarit commun des pages de projet (règle E5) : un ordre de vitrine et
 * des noms canoniques uniques (E6), une fiche à sept cases, un en-tête qui
 * marque son premier écran (E1), deux à quatre décisions et une sortie vers
 * le projet suivant et « Discutons ». Les données de PvZ Fusion servent de
 * cas réel.
 */

const rendre = async (composant: Parameters<AstroContainer['renderToString']>[0], props: Record<string, unknown> = {}, slots: Record<string, string> = {}) => {
  const conteneur = await AstroContainer.create();
  return (await conteneur.renderToString(composant, { props, slots })).replaceAll('&nbsp;', ' ');
};

describe('la vitrine, source des noms canoniques', () => {
  it('range les projets famille par famille, dans l’ordre de ce qu’ils prouvent (décision du 14/10/2026)', () => {
    expect(VITRINE.map((projet) => projet.id)).toEqual(['pvz', 'omnicard', 'bloodborne', 'league', 'gup', 'githealth', 'karl-scraper', 'sillage', 'relais']);
    expect(VITRINE[0]).toMatchObject({ nom: 'PvZ Fusion, pôle francophone', href: '/projets/pvz-fusion', preuve: 'Une équipe formée et menée' });
    expect(VEDETTE).toBe('pvz');
  });

  it('nomme quatre familles en français, dans l’ordre de la page', () => {
    expect(FAMILLES_PROJETS.map(({ id, titre }) => [id, titre])).toEqual([
      ['equipe', 'Lead et équipe'],
      ['jeu', 'Jeu vidéo'],
      ['outils', 'Outils'],
      ['ia', 'IA'],
    ]);
  });

  it('garde chaque famille d’un seul tenant, dans l’ordre des familles, sans famille vide', () => {
    // Les familles se suivent : jamais un projet d’une famille entre deux d’une autre.
    const suite = VITRINE.map((projet) => projet.famille).filter((famille, i, toutes) => i === 0 || famille !== toutes[i - 1]);
    expect(suite).toEqual(FAMILLES_PROJETS.map((famille) => famille.id));
    for (const famille of VITRINE_PAR_FAMILLE) expect(famille.projets.length, famille.id).toBeGreaterThan(0);
    expect(VITRINE_PAR_FAMILLE.flatMap((famille) => famille.projets)).toEqual([...VITRINE]);
    expect(VITRINE.find((projet) => projet.id === VEDETTE)?.famille).toBe(FAMILLES_PROJETS[0].id);
  });

  it('donne des noms, des adresses et des étiquettes uniques', () => {
    for (const cle of ['id', 'nom', 'href', 'preuve'] as const) expect(new Set(VITRINE.map((projet) => projet[cle])).size, cle).toBe(VITRINE.length);
  });

  it('donne le rang, la famille et les voisins d’un projet, d’une famille à l’autre, sans boucler', () => {
    const premier = projetDeLaVitrine('pvz');
    expect(premier.rang).toBe(1);
    expect(premier.famille).toEqual({ id: 'equipe', titre: 'Lead et équipe' });
    expect(premier.precedent).toBeUndefined();
    expect(premier.suivant?.id).toBe('omnicard');
    expect(projetDeLaVitrine('gup')).toMatchObject({ rang: 5, famille: { id: 'outils' }, precedent: { id: 'league' }, suivant: { id: 'githealth' } });
    const dernier = projetDeLaVitrine(VITRINE[VITRINE.length - 1].id);
    expect(dernier.rang).toBe(VITRINE.length);
    expect(dernier.precedent?.id).toBe(VITRINE[VITRINE.length - 2].id);
    expect(dernier.suivant).toBeUndefined();
    expect(() => projetDeLaVitrine('inconnu' as never)).toThrow(/VITRINE/);
  });
});

describe('FicheProjet', () => {
  it('pose les sept cases dans l’ordre, en tableau à filets', async () => {
    const html = await rendre(FicheProjet, { fiche: FICHE });
    expect(html).toMatch(/role="group" aria-label="Fiche du projet"/);
    expect([...html.matchAll(/<dt[^>]*>([^<]+)<\/dt>/g)].map((m) => m[1])).toEqual(['Besoin', 'Ma part', 'Rôle', 'Période', 'Équipe', 'Statut', 'Liens publics']);
  });

  it('mesure chaque lien public comme une sortie, avec son nom d’hôte', async () => {
    const html = await rendre(FicheProjet, { fiche: FICHE });
    const liens = [...html.matchAll(/<a href="(https?:[^"]+)"[^>]*>/g)];
    expect(liens).toHaveLength(FICHE.liens.length);
    for (const [balise, href] of liens) {
      expect(balise).toContain('rel="external"');
      expect(balise).toContain('data-umami-event="lien-sortant"');
      expect(balise).toContain(`data-umami-event-domaine="${new URL(href).hostname}"`);
      expect(balise).toContain('data-umami-event-emplacement="preuves"');
    }
  });

  it('propose « Discutons de ce projet → » vers /contact, mesuré en fiche-projet, sous le tableau des sorties', async () => {
    const html = await rendre(FicheProjet, { fiche: FICHE });
    expect(html.indexOf('</dl>')).toBeLessThan(html.indexOf('Discutons de ce projet'));
    expect(html).toMatch(/<a href="\/contact"[^>]*data-umami-event="contact-page"[^>]*data-umami-event-emplacement="fiche-projet"[^>]*>\s*Discutons de ce projet<span class="fleche" aria-hidden="true"[^>]*>\s→<\/span>/);
  });

  it('marque ce qui reste à confirmer, case par case', async () => {
    const html = await rendre(FicheProjet, { fiche: { ...FICHE, aConfirmer: { periode: 'Date du lancement (Q8)' } } });
    expect(html).toMatch(/class="a-confirmer" title="Date du lancement \(Q8\)">à confirmer</);
  });
});

describe('EnTeteProjet', () => {
  const props = { projet: 'pvz', titre: EN_TETE.titre, chapeau: EN_TETE.chapeau, liens: EN_TETE.liens, preuves: PREUVES, fiche: FICHE };

  it('marque le premier écran : titre, identité, preuve, action', async () => {
    const html = await rendre(EnTeteProjet, props);
    for (const marque of ['titre', 'identite', 'preuve', 'action']) expect(html).toContain(`data-pli="${marque}"`);
    // Une phrase par ligne : le parallèle des deux phrases ne se casse pas.
    const titre = /<h1[^>]*data-pli="titre"[^>]*>(.*?)<\/h1>/.exec(html)?.[1] ?? '';
    expect([...titre.matchAll(/<span class="projet-tete__ligne"[^>]*>([^<]+)<\/span>/g)].map((m) => m[1])).toEqual(['Traduire un jeu.', 'Faire grandir une équipe.']);
    expect(titre.replace(/<[^>]+>/g, '')).toBe('Traduire un jeu. Faire grandir une équipe.');
  });

  it('accepte aussi un titre d’un seul tenant', async () => {
    const html = await rendre(EnTeteProjet, { ...props, titre: 'Un titre en une phrase.' });
    expect(html).toMatch(/<h1[^>]*data-pli="titre"[^>]*><span class="projet-tete__ligne"[^>]*>Un titre en une phrase\.<\/span><\/h1>/);
  });

  it('reprend le nom canonique et l’étiquette de la vitrine, et mène d’abord à « Comment je l’ai construit »', async () => {
    const html = await rendre(EnTeteProjet, props);
    expect(html).toContain('PvZ Fusion, pôle francophone');
    expect(html).toContain('Une équipe formée et menée');
    expect(html).toMatch(/aria-current="page"[^>]*>PvZ Fusion, pôle francophone</);
    const actions = html.slice(html.indexOf('data-pli="action"'));
    expect(actions.match(/<a [^>]*href="([^"]+)"/)?.[1]).toBe('#construit');
  });

  it('refuse plus de trois repères ou plus d’un chiffre surligné', async () => {
    await expect(rendre(EnTeteProjet, { ...props, preuves: [...PREUVES, PREUVES[0]] })).rejects.toThrow(/un à trois repères/);
    await expect(rendre(EnTeteProjet, { ...props, preuves: PREUVES.map((preuve) => ({ ...preuve, surligne: true })) })).rejects.toThrow(/un seul chiffre surligné/);
  });
});

describe('DecisionsProjet', () => {
  it('pose « Comment je l’ai construit » à l’ancre attendue, une carte par décision', async () => {
    const html = await rendre(DecisionsProjet, { decisions: DECISIONS });
    expect(html).toMatch(/<section id="construit"[^>]*aria-labelledby="construit-titre"/);
    expect(html).toMatch(/<h2[^>]*id="construit-titre"[^>]*>Comment je l’ai construit<\/h2>/);
    expect(html.match(/<li class="decision"/g)).toHaveLength(DECISIONS.length);
    expect([...html.matchAll(/<dt[^>]*>([^<]+)<\/dt>/g)].slice(0, 3).map((m) => m[1])).toEqual(['Contrainte', 'Choix', 'Effet']);
  });

  it('refuse moins de deux ou plus de quatre décisions', async () => {
    await expect(rendre(DecisionsProjet, { decisions: DECISIONS.slice(0, 1) })).rejects.toThrow(/deux à quatre/);
    await expect(rendre(DecisionsProjet, { decisions: [...DECISIONS, ...DECISIONS] })).rejects.toThrow(/deux à quatre/);
  });
});

describe('SortieProjet', () => {
  it('mène au projet suivant de la vitrine, à la vitrine et à « Discutons »', async () => {
    const html = await rendre(SortieProjet, { projet: 'pvz' }, { default: '<p>Ce que j’en retiens.</p>' });
    expect(html).toMatch(/<a class="voisin[^"]*" href="\/projets\/omnicard"/);
    expect(html).toContain('Projet suivant');
    expect(html).not.toContain('Projet précédent');
    expect(html).toMatch(/href="\/projets"/);
    expect(html).toMatch(/<a class="bouton[^"]*" href="\/contact"[^>]*data-umami-event="contact-page"[^>]*data-umami-event-emplacement="discutons"/);
  });

  it('propose le précédent et le suivant au milieu de la vitrine, chacun avec la flèche de son sens', async () => {
    const html = await rendre(SortieProjet, { projet: 'bloodborne' });
    expect(html).toContain('href="/projets/league-of-database"');
    expect(html).toContain('href="/projets/omnicard"');
    expect(html).toMatch(/href="\/projets\/omnicard"[\s\S]*?<span class="fleche" aria-hidden="true"[^>]*>←\s<\/span>Omnicard/);
    expect(html).toMatch(/League Of Data Base<span class="fleche" aria-hidden="true"[^>]*>\s→<\/span>/);
  });

  it('mène le dernier projet de la vitrine aux autres projets publics (« Aussi »)', async () => {
    const html = await rendre(SortieProjet, { projet: VITRINE[VITRINE.length - 1].id });
    expect(html).not.toContain('Projet suivant');
    expect(html).toMatch(/<a class="voisin[^"]*" href="\/projets#aussi"/);
    expect(html).toContain('Les autres projets publics');
  });
});

describe('SourcesProjet', () => {
  it('replie la note dans un <details> fermé, à l’ancre #sources, le texte présent dans le HTML', async () => {
    const html = await rendre(SourcesProjet, {}, { default: '<p><b>Couverture.</b> Relevé du 13/10/2026.</p>' });
    expect(html).toMatch(/<details id="sources" class="sources-projet[^"]*" data-sources[ >]/);
    expect(html).not.toMatch(/<details[^>]*\sopen/);
    expect(html).toMatch(/<summary[^>]*>[\s\S]*Sources et méthode[\s\S]*<\/summary>/);
    expect(html).toContain('Relevé du 13/10/2026.');
  });
});

describe('PvZ Fusion : les données de la page', () => {
  it('reprend les relevés consignés, de 1 335 manquantes sur 2 415 à zéro en août 2026', () => {
    expect([manquantes(RELEVES[0]), anglaises(RELEVES[0])]).toEqual([1335, 2415]);
    const atteint = RELEVES.find((releve) => releve.date === RELEVE_ATTEINT)!;
    expect([manquantes(atteint), anglaises(atteint)]).toEqual([0, 4368]);
    expect(RELEVES.map((releve) => releve.date)).toEqual([...RELEVES.map((releve) => releve.date)].sort());
  });

  it('garde la part personnelle des traductions hors de l’en-tête (note de sources seulement)', () => {
    const entete = JSON.stringify({ EN_TETE, PREUVES, FICHE });
    expect(entete).not.toMatch(/4[\s ]?862/);
    expect(PREUVES.filter((preuve) => preuve.surligne)).toHaveLength(1);
  });
});
