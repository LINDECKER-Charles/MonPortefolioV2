import { afterEach, describe, expect, it } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import AConfirmer from '../../src/components/ui/AConfirmer.astro';
import Acte from '../../src/components/ui/Acte.astro';
import Bouton from '../../src/components/ui/Bouton.astro';
import CaptureAnnotee from '../../src/components/ui/CaptureAnnotee.astro';
import LienAction from '../../src/components/ui/LienAction.astro';
import PreuveChiffree from '../../src/components/ui/PreuveChiffree.astro';
import Statut from '../../src/components/ui/Statut.astro';
import Surligneur from '../../src/components/ui/Surligneur.astro';
import Visionneuse from '../../src/components/ui/Visionneuse.astro';
import Visuel from '../../src/components/ui/Visuel.astro';
import AppelDiscutons from '../../src/components/pages/AppelDiscutons.astro';
import CarteProjet from '../../src/components/pages/CarteProjet.astro';
import IndexPreuves from '../../src/components/pages/IndexPreuves.astro';
import NavigationPage from '../../src/components/pages/NavigationPage.astro';
import gup from '../../src/assets/projets/gup-selection.webp';
import { attributsMesure, sorteDeLien } from '../../src/lib/liens';

/**
 * Contrats des composants partagés de la direction « Lanterne » : la
 * grammaire des flèches et la mesure des liens (règle E2, plan de marquage),
 * le surligneur sourcé (C1), l’appel unique « Discutons » vers /contact, la
 * navigation de page unique (E4) et ce que lisent les scripts.
 */

const rendre = async (composant: Parameters<AstroContainer['renderToString']>[0], props: Record<string, unknown> = {}, slots: Record<string, string> = {}) => {
  const conteneur = await AstroContainer.create();
  // Une espace insécable s’écrit &nbsp; dans un gabarit, \u00a0 dans une expression.
  return (await conteneur.renderToString(composant, { props, slots })).replaceAll('&nbsp;', '\u00a0');
};

describe('grammaire des liens', () => {
  it('reconnaît une page interne, une ancre, une sortie et un e-mail', () => {
    expect(['/projets', '#origine', 'https://github.com/x', 'mailto:a@b.c'].map(sorteDeLien)).toEqual(['interne', 'ancre', 'externe', 'courriel']);
  });

  it('marque une sortie avec son nom d’hôte, et refuse une sortie sans emplacement', () => {
    expect(attributsMesure('https://www.linkedin.com/in/x/', { emplacement: 'contact' })).toEqual({
      'data-umami-event': 'lien-sortant',
      'data-umami-event-domaine': 'www.linkedin.com',
      'data-umami-event-emplacement': 'contact',
    });
    expect(() => attributsMesure('https://github.com/x')).toThrow(/emplacement/);
    expect(() => attributsMesure('mailto:a@b.c')).toThrow(/emplacement/);
    expect(attributsMesure('/projets')).toEqual({});
  });
});

describe('Bouton et LienAction', () => {
  it('posent la flèche de la grammaire, hors du nom accessible', async () => {
    const interne = await rendre(Bouton, { href: '/contact', evenement: 'contact-page', emplacement: 'discutons' }, { default: 'Discutons' });
    expect(interne).toMatch(/class="bouton[^"]*"/);
    expect(interne).toMatch(/<span class="fleche" aria-hidden="true"[^>]*>\u00a0→<\/span>/);
    expect(interne).toContain('data-umami-event="contact-page"');
    expect(interne).toContain('data-umami-event-emplacement="discutons"');

    const ancre = await rendre(LienAction, { href: '#origine' }, { default: 'Lire mon histoire' });
    expect(ancre).toContain('class="lien-action"');
    expect(ancre).toContain('\u00a0↓');
    expect(ancre).not.toContain('data-umami-event');

    const sortie = await rendre(LienAction, { href: 'https://github.com/LINDECKER-Charles', emplacement: 'preuves' }, { default: 'Le code' });
    expect(sortie).toContain('\u00a0↗');
    expect(sortie).toContain('rel="external"');
    expect(sortie).toContain('data-umami-event-domaine="github.com"');
  });

  it('rend un <button> sans href, et échoue sur une sortie non mesurée', async () => {
    expect(await rendre(Bouton, { type: 'submit' }, { default: 'Envoyer' })).toMatch(/<button class="bouton"[^>]*type="submit"/);
    await expect(rendre(Bouton, { href: 'https://github.com/x' }, { default: 'Code' })).rejects.toThrow(/emplacement/);
  });
});

describe('preuves', () => {
  it('surligne un chiffre avec sa source et sa date, et pose les espaces insécables', async () => {
    const html = await rendre(PreuveChiffree, { valeur: '20', libelle: 'contributeurs formés : au total', source: 'Entretien, C7', date: '2026', surligne: true });
    expect(html).toMatch(/<mark class="surligneur" data-source="Entretien, C7, 2026"[^>]*>20<\/mark>/);
    expect(html).toContain('formés\u00a0: au total');
    expect(html).toMatch(/^<li/);
  });

  it('ne surligne rien par défaut et refuse un lien sortant', async () => {
    expect(await rendre(PreuveChiffree, { valeur: '403', libelle: 'patchs', source: 'Audit' })).not.toContain('<mark');
    await expect(rendre(PreuveChiffree, { valeur: '1', libelle: 'x', source: 'y', href: 'https://example.com' })).rejects.toThrow(/interne/);
  });

  it('exige la source du surligneur et dit « à confirmer » par un mot', async () => {
    expect(await rendre(Surligneur, { source: 'docs/matiere-premiere.md' }, { default: '35' })).toMatch(/<mark class="surligneur" data-source="docs\/matiere-premiere.md"[^>]*>35<\/mark>/);
    expect(await rendre(AConfirmer, { titre: 'Nom officiel (Q8)' })).toMatch(/<span class="a-confirmer" title="Nom officiel \(Q8\)">à confirmer<\/span>/);
  });

  it('donne au statut une forme et un mot', async () => {
    expect(await rendre(Statut, { etat: 'eteint' }, { default: 'Hors ligne, en refonte' })).toMatch(/class="statut statut--eteint[^"]*"[^>]*>Hors ligne, en refonte</);
    expect(await rendre(Statut, {}, { default: 'En ligne' })).toContain('statut--actif');
  });
});

describe('actes et appel de fin', () => {
  it('pose la classe de l’acte, qui porte ses jetons', async () => {
    expect(await rendre(Acte, { ton: 'veille', id: 'aujourdhui' }, { default: '<p>x</p>' })).toMatch(/<section id="aujourdhui"[^>]*class="acte acte-veille acte--espace/);
    expect(await rendre(Acte, { ton: 'bleu', as: 'div' })).toMatch(/<div[^>]*class="acte acte-bleu/);
    expect(await rendre(Acte, {})).not.toMatch(/acte-pierre/);
  });

  it('mène « Discutons » à /contact, mesuré, sur l’aplat bleu roi si demandé', async () => {
    const html = await rendre(AppelDiscutons, { variante: 'aplat', emplacement: 'discutons' }, { default: 'Une idée à confronter' });
    expect(html).toContain('aplat-roi');
    expect(html).toMatch(/<a class="bouton[^"]*" href="\/contact"[^>]*data-umami-event="contact-page"[^>]*data-umami-event-emplacement="discutons"/);
    expect(html).toMatch(/Discutons<span class="fleche" aria-hidden="true"[^>]*>\u00a0→/);
  });
});

describe('vitrine', () => {
  const carte = {
    variante: 'vedette',
    rang: 1,
    id: 'pvz',
    href: '/projets/pvz-fusion',
    nom: 'PvZ Fusion, pôle francophone',
    preuve: 'Mener une équipe',
    besoin: 'Rattraper, à plusieurs, une traduction.',
    chiffre: { valeur: '20', libelle: 'contributeurs formés' },
    role: 'Lead du pôle',
    statut: { texte: 'En cours, bénévole' },
    liens: [{ href: 'https://github.com/Teyliu/PVZF-Translation', libelle: 'Projet multilingue (GitHub)' }],
  };

  it('fait de la carte un lien vers le projet, avec son étiquette de preuve et « Voir le projet → »', async () => {
    const html = await rendre(CarteProjet, carte);
    expect(html).toMatch(/<li id="pvz"[^>]*class="carte-projet carte-projet--vedette"/);
    expect(html).toMatch(/<h2 class="carte-projet__nom"[^>]*>\s*<a href="\/projets\/pvz-fusion"[^>]*>PvZ Fusion, pôle francophone<\/a>/);
    expect(html).toContain('Mener une équipe');
    expect(html).toMatch(/Voir le projet<span class="fleche"[^>]*>\u00a0→/);
    expect(html).toContain('data-umami-event-domaine="github.com"');
    expect(html).toContain('data-umami-event-emplacement="preuves"');
    expect(await rendre(CarteProjet, { ...carte, niveau: 3 })).toMatch(/<h3 class="carte-projet__nom/);
  });

  it('numérote l’index des preuves et mène à chaque carte', async () => {
    const html = await rendre(IndexPreuves, { entrees: [{ id: 'pvz', preuve: 'Mener une équipe' }, { id: 'lodb', preuve: 'Un système en production' }] });
    expect(html).toContain('href="#pvz"');
    expect(html).toContain('>02<');
    expect(html).toContain('\u00a0↓');
  });
});

describe('navigation de page', () => {
  it('pose un seul nav « Dans cette page », lu par le script des sections', async () => {
    const html = await rendre(NavigationPage, { entrees: [{ id: 'besoin', titre: 'Le besoin' }, { id: 'equipe', titre: 'L’équipe' }] }, { default: '<section id="besoin"></section>' });
    expect(html.match(/aria-label="Dans cette page"/g)).toHaveLength(1);
    expect(html).toContain('data-sommaire');
    expect(html).toContain('href="#equipe"');
  });
});

describe('captures', () => {
  it('pose la visionneuse que lit scripts/visionneuse.ts', async () => {
    const html = await rendre(Visionneuse);
    for (const attribut of ['data-visionneuse', 'data-visionneuse-image', 'data-visionneuse-legende', 'data-visionneuse-etat', 'data-visionneuse-fermer']) {
      expect(html).toContain(attribut);
    }
    expect(html).toMatch(/<dialog[^>]*aria-labelledby="visionneuse-legende"/);
  });

  it('annote une capture : cible et loupe décoratives, légende numérotée, lien d’agrandissement', async () => {
    const html = await rendre(CaptureAnnotee, {
      src: gup,
      alt: 'gup en français.',
      legende: 'Une source en échec : les autres continuent.',
      type: 'terminal',
      cible: { x: 30, y: 60 },
      loupe: { x: 30, y: 60, zoom: 2 },
      agrandir: true,
    });
    expect(html).toMatch(/class="cible"[^>]*style="--cx:30%;--cy:60%"[^>]*aria-hidden="true"|style="--cx:30%;--cy:60%"[^>]*aria-hidden="true"/);
    expect(html).toMatch(/class="loupe loupe--bas-droite[^"]*"/);
    expect(html).toMatch(/<a class="capture__agrandir"[^>]*href="\/[^"]+"[^>]*data-agrandir/);
    expect(html).toContain('échec\u00a0: les autres');
    expect(html).toContain('alt="gup en français."');
  });
});

describe('Visuel manquant', () => {
  afterEach(() => {
    delete process.env.VISUELS_BROUILLON;
  });

  // Toutes les images générées sont livrées (13 octobre 2026) : une capture « élargi » sert d’exemple.
  it('en ligne, montre un cadre neutre au bon ratio, avec l’alt du registre, jamais la commande', async () => {
    process.env.VISUELS_BROUILLON = '0';
    const html = await rendre(Visuel, { id: 'OMN-08' });
    expect(html).toContain('visuel--attente');
    expect(html).toContain('data-manquant');
    expect(html).toContain('--visuel-ratio:16 / 10');
    expect(html).toMatch(/role="img"[^>]*aria-label="[^"]+"|aria-label="[^"]+"[^>]*role="img"/);
    for (const commande of ['OMN-08</strong>', 'Capture à faire', 'visuel__consigne', 'visuel__format', '1600 × 1000']) expect(html).not.toContain(commande);
    const decoratif = await rendre(Visuel, { id: 'OMN-08', alt: '' });
    expect(decoratif).toContain('aria-hidden="true"');
    expect(decoratif).not.toContain('role="img"');
  });

  it('en brouillon (VISUELS_BROUILLON=1), affiche la commande', async () => {
    process.env.VISUELS_BROUILLON = '1';
    expect(await rendre(Visuel, { id: 'OMN-08' })).toContain('Capture à faire · élargi');
  });

  it('affiche la commande complète en développement : identifiant, nature, sujet, composition et format', async () => {
    const html = await rendre(Visuel, { id: 'OMN-08', foyer: true });
    expect(html).toContain('visuel--foyer');
    expect(html).toContain('Capture à faire · élargi');
    expect(html).toMatch(/class="visuel__format[^"]*"[^>]*>16:10, 1600 × 1000/);
  });

});

describe('Visuel dessiné (méthode SVG)', () => {
  it('insère le dessin en ligne : son trait en currentColor suit le thème, jamais un <img src=*.svg>', async () => {
    const html = await rendre(Visuel, { id: 'ACC-14' });
    expect(html).toContain('visuel--dessin');
    expect(html).toMatch(/<svg[^>]*stroke="currentColor"/);
    expect(html).toMatch(/<svg[^>]*role="img"[^>]*aria-label="Trois lanternes/);
    expect(html).not.toMatch(/<img\b[^>]*src="[^"]*\.svg/);
    expect(html).not.toContain('<title>');
  });

  it('reste décoratif quand l’alt est vide', async () => {
    const html = await rendre(Visuel, { id: 'ACC-14', alt: '' });
    expect(html).toMatch(/<svg[^>]*aria-hidden="true"/);
    expect(html).not.toContain('role="img"');
  });
});
