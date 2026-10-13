import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Visuel from '../../src/components/ui/Visuel.astro';
import { fichiersAttendus, ORDRE_SERIES, REGLES_COMMUNES, sujetPourGenerateur, visuelParId, VISUELS } from '../../src/config/visuels';
import { etatDesVisuels, resume } from '../../tools/visuels-manquants.mjs';

/**
 * Garde-fous du registre des visuels (config/visuels.ts) : l’inventaire du
 * cahier des charges est complet, cohérent, nommé selon la règle de livraison,
 * et ne met aucun nom de marque dans ce qu’on donne à un générateur d’image.
 */

const SITE = new URL('../../', import.meta.url).pathname;
const MARQUES = /\b(?:pvz|plants vs\.? zombies|riot|league of legends|sony|fromsoftware|trello|b-hive|elan formation|atis|mission locale|shrek|gwent|bloodborne|omnicard|unreal|unity)\b|\b42\b/i;
const tous = (cle: 'sujet' | 'composition' | 'alt' | 'emplacement' | 'format' | 'note') => VISUELS.flatMap((v) => (v[cle] ? [[v.id, v[cle] as string] as const] : []));

describe('registre des visuels : l’inventaire', () => {
  it('recense les 155 emplacements, dont 106 « socle » et 49 « élargi »', () => {
    expect(VISUELS).toHaveLength(155);
    expect(VISUELS.filter((v) => v.priorite === 'socle')).toHaveLength(106);
    expect(VISUELS.filter((v) => v.priorite === 'elargi')).toHaveLength(49);
  });

  it('répartit les méthodes comme l’inventaire', () => {
    const par = (m: string) => VISUELS.filter((v) => v.methode === m).length;
    expect({ IMG: par('IMG'), SVG: par('SVG'), FIG: par('FIG'), CAP: par('CAP'), PHO: par('PHO'), OG: par('OG') }).toEqual({ IMG: 81, SVG: 35, FIG: 25, CAP: 5, PHO: 4, OG: 5 });
  });

  it('donne un identifiant unique, de la forme PREFIXE-NN, PREFIXE-FN, PREFIXE-OG ou PREFIXE-PHO', () => {
    const ids = VISUELS.map((v) => v.id);
    expect(new Set(ids).size).toBe(ids.length);
    // PREFIXE-NNa, b, c : les cases d’un emplacement découpé en plusieurs fichiers (triptyque PVZ-02).
    for (const id of ids) expect(id).toMatch(/^[A-Z]{3}-(?:\d{2}[a-c]?|F\d|OG|PHO)$/);
    for (const id of ids.filter((x) => /\d[a-c]$/.test(x))) expect(visuelParId(id.slice(0, -1))?.reprend, id).toContain(id);
  });

  it('range chaque visuel dans une série connue, dans l’ordre des séries', () => {
    const rangs = VISUELS.map((v) => ORDRE_SERIES.indexOf(v.serie));
    expect(rangs.every((r) => r >= 0)).toBe(true);
    expect(rangs).toEqual([...rangs].sort((a, b) => a - b));
  });

  it('remplit sujet, composition, emplacement, format et page', () => {
    for (const v of VISUELS) {
      for (const cle of ['sujet', 'composition', 'emplacement', 'format', 'page'] as const) expect(v[cle].trim().length, `${v.id}.${cle}`).toBeGreaterThan(0);
      expect(v.page === 'global' || v.page.startsWith('/'), `${v.id}.page`).toBe(true);
    }
  });

  it('écrit les ratios au format CSS et les tailles cohérentes avec eux', () => {
    for (const v of VISUELS) {
      if (v.ratio === null) continue;
      expect(v.ratio, v.id).toMatch(/^\d+(?:\.\d+)? \/ \d+(?:\.\d+)?$/);
      if (v.largeur && v.hauteur) {
        const [a, b] = v.ratio.split(' / ').map(Number);
        expect(Math.abs(v.largeur / v.hauteur / (a / b) - 1), `${v.id} ${v.largeur}×${v.hauteur} pour ${v.ratio}`).toBeLessThan(0.01);
      }
    }
  });

  it('cite des emplacements existants quand il en reprend le fichier, et les six reprises attendues', () => {
    for (const v of VISUELS) for (const cible of v.reprend ?? []) expect(visuelParId(cible), `${v.id} reprend ${cible}`).toBeDefined();
    expect(VISUELS.filter((v) => v.reprend?.length && v.methode !== 'FIG').map((v) => v.id).sort()).toEqual(['ACC-02', 'ACC-15', 'LOD-01', 'OMN-02', 'PRJ-03', 'PVZ-02']);
  });
});

describe('registre des visuels : fichiers attendus', () => {
  it('nomme chaque fichier selon sa méthode', () => {
    for (const v of VISUELS) {
      if (v.reprend?.length || v.methode === 'FIG' || !v.fichier) continue;
      const nom = path.posix.basename(v.fichier);
      // Photo et captures réelles existantes, nommées avant la refonte (la vitrine les pose dans leurs cadres).
      if (['ACC-01', 'PRJ-04', 'PRJ-05'].includes(v.id)) continue;
      if (v.methode === 'SVG') expect(v.fichier, v.id).toMatch(new RegExp(`^src/assets/visuels/${v.serie}/${v.id}\\.(?:svg|txt)$`));
      else if (v.methode === 'OG') expect(v.fichier, v.id).toBe(`public/og/${v.id}_1200x630.png`);
      else {
        expect(v.largeur && v.hauteur, `${v.id} sans taille`).toBeTruthy();
        expect(nom, v.id).toBe(`${v.id}_${v.largeur}x${v.hauteur}.webp`);
        expect(v.fichier, v.id).toBe(`src/assets/visuels/${v.serie}/${nom}`);
      }
    }
  });

  it('ne donne un fichier à aucune figure codée, sauf celle qui existe déjà', () => {
    const avecFichier = VISUELS.filter((v) => v.methode === 'FIG' && v.fichier).map((v) => v.id);
    expect(avecFichier).toEqual(['ACC-06']);
    expect(statSync(path.join(SITE, visuelParId('ACC-06')!.fichier!)).isFile()).toBe(true);
  });

  it('ne partage aucun fichier entre deux emplacements qui ne se déclarent pas en reprise', () => {
    const fichiers = VISUELS.flatMap((v) => (v.fichier ? [v.fichier] : []));
    expect(new Set(fichiers).size).toBe(fichiers.length);
  });

  it('résout les fichiers d’un emplacement qui en reprend plusieurs', () => {
    expect(fichiersAttendus(visuelParId('ACC-15')!)).toHaveLength(4);
    expect(fichiersAttendus(visuelParId('PVZ-02')!)).toEqual(['a', 'b', 'c'].map((c) => `src/assets/visuels/pvz-fusion/PVZ-02${c}_1200x900.webp`));
    expect(fichiersAttendus(visuelParId('OMN-02')!)).toEqual(fichiersAttendus(visuelParId('ACC-04')!));
  });

  it('pointe, pour la photo de Charles, le fichier qui existe', () => {
    expect(statSync(path.join(SITE, visuelParId('ACC-01')!.fichier!)).isFile()).toBe(true);
  });
});

describe('registre des visuels : textes', () => {
  it('emploie l’apostrophe typographique et aucune marque Markdown ou emoji de travail', () => {
    for (const cle of ['sujet', 'composition', 'alt', 'emplacement', 'format', 'note'] as const) {
      for (const [id, texte] of tous(cle)) {
        expect(texte, `${id}.${cle}`).not.toContain('\'');
        expect(texte, `${id}.${cle}`).not.toMatch(/[*`❓]|\s{2,}/);
      }
    }
  });

  it('prévoit un alt pour tout visuel qui informe, vide pour un décor', () => {
    const decoratifs = VISUELS.filter((v) => v.alt === '').map((v) => v.id).sort();
    expect(decoratifs).toEqual(['ACC-02', 'BLR-06', 'BLR-07', 'BLR-08', 'BLR-09', 'BLR-10', 'CMP-09', 'CMP-10', 'ERR-02', 'FOR-08', 'GLO-01', 'GLO-03', 'GLO-04', 'GLO-06', 'GLO-09', 'GLO-10', 'GLO-11', 'GLO-12', 'GLO-13', 'GUP-02', 'LOD-03', 'LOD-05', 'LOD-06', 'LOD-07', 'LOD-08', 'LOD-09', 'LOD-10', 'LOD-11', 'LOD-12', 'PRO-07']);
    for (const v of VISUELS) expect(v.alt.length, v.id).toBeLessThanOrEqual(140);
  });

  it('ne met aucun nom de marque dans ce qu’on donne à un générateur d’image (règle 1)', () => {
    for (const v of VISUELS.filter((x) => x.methode === 'IMG' && !x.reprend?.length)) {
      expect(`${sujetPourGenerateur(v)} ${v.composition}`, v.id).not.toMatch(MARQUES);
    }
  });

  it('garde un sujet neutre là où le sujet nomme une marque', () => {
    const avecNeutre = VISUELS.filter((v) => v.sujetNeutre).map((v) => v.id).sort();
    expect(avecNeutre).toEqual(['FOR-07', 'PVZ-10']);
    for (const v of VISUELS.filter((x) => x.sujetNeutre)) expect(v.sujetNeutre, v.id).not.toMatch(MARQUES);
  });

  it('reprend les huit règles communes du cahier des charges', () => {
    expect(REGLES_COMMUNES).toHaveLength(8);
    expect(REGLES_COMMUNES[0]).toMatch(/propriété intellectuelle/);
    expect(REGLES_COMMUNES[2]).toMatch(/Aucun texte dans l’image/);
  });
});

describe('registre des visuels : liste des manquants', () => {
  const racine = mkdtempSync(path.join(tmpdir(), 'visuels-'));
  const ecrire = (fichier: string) => {
    mkdirSync(path.dirname(path.join(racine, fichier)), { recursive: true });
    writeFileSync(path.join(racine, fichier), 'x');
  };

  it('compte tout comme manquant dans un dossier vide, sans compter deux fois les reprises', () => {
    const etat = etatDesVisuels(racine);
    expect(etat.total).toBe(155);
    expect(etat.presents).toBe(0);
    expect(etat.reprises).toBe(6);
    expect(etat.figuresACoder).toHaveLength(24); // les 25 figures, moins celle du plafond, dont le composant est nommé
    expect(etat.manquants).toHaveLength(155 - 6 - 24);
    expect(etat.manquantsSocle.length + etat.manquantsElargi.length).toBe(etat.manquants.length);
  });

  it('retire de la liste un visuel livré', () => {
    ecrire('src/assets/visuels/global/GLO-01.svg');
    const etat = etatDesVisuels(racine);
    expect(etat.presents).toBe(1);
    expect(etat.manquantsSocle.map((v: { id: string }) => v.id)).not.toContain('GLO-01');
    expect(etat.manquantsSocle.map((v: { id: string }) => v.id)).toContain('GLO-02');
  });

  it('sur le dépôt réel, ne signale comme présents que les photos (couverture, parcours, contact, 404), la figure du plafond, l’emblème seul, la lanterne de la bascule, les pictos des trois verbes, les cadres d’appareil, les deux dessins animés de l’accueil et les deux captures de la vitrine', () => {
    const etat = etatDesVisuels(SITE);
    expect(etat.presents).toBe(13);
    expect(etat.manquantsSocle).toHaveLength(74);
    for (const id of ['GLO-01', 'GLO-03', 'GLO-04', 'GLO-05', 'ACC-14', 'ACC-17', 'PRJ-04', 'PRJ-05', 'PAR-PHO', 'CON-PHO', 'ERR-PHO']) expect(etat.manquantsSocle.map((v: { id: string }) => v.id)).not.toContain(id);
    expect(resume(etat)).toMatch(/74 visuels « socle » manquants/);
  });

  afterAll(() => rmSync(racine, { recursive: true, force: true }));
});

describe('emplacements <Visuel> du site', () => {
  const sources: string[] = [];
  const parcourir = (dossier: string) => {
    for (const nom of readdirSync(dossier, { withFileTypes: true })) {
      const chemin = path.join(dossier, nom.name);
      if (nom.isDirectory()) parcourir(chemin);
      else if (nom.name.endsWith('.astro')) sources.push(chemin);
    }
  };
  parcourir(path.join(SITE, 'src'));

  it('n’appelle que des identifiants du registre', () => {
    const inconnus: string[] = [];
    for (const fichier of sources) {
      for (const m of readFileSync(fichier, 'utf8').matchAll(/<Visuel\b[^>]*\bid=["{']+([A-Z]{3}-\w+)/g)) {
        if (!visuelParId(m[1])) inconnus.push(`${path.relative(SITE, fichier)} : ${m[1]}`);
      }
    }
    expect(inconnus).toEqual([]);
  });
});

describe('composant Visuel', () => {
  it('affiche un cadre hachuré au bon ratio, avec l’identifiant et la consigne, quand le fichier manque', async () => {
    const conteneur = await AstroContainer.create();
    const html = await conteneur.renderToString(Visuel, { props: { id: 'ACC-03' } });
    expect(html).toContain('visuel--manquant');
    expect(html).toContain('data-visuel="ACC-03"');
    expect(html).toContain('--visuel-ratio:3 / 2');
    expect(html).toMatch(/<strong[^>]*>ACC-03<\/strong>/);
    expect(html).toContain('Démonter de vieux PC avec son père');
    expect(html).toContain('deux paires de mains');
    expect(html).not.toContain('<img');
  });

  it('donne un ratio mobile quand l’inventaire en prévoit un', async () => {
    const conteneur = await AstroContainer.create();
    const html = await conteneur.renderToString(Visuel, { props: { id: 'PRJ-01' } });
    expect(html).toContain('--visuel-ratio-mobile:4 / 5');
  });

  it('refuse un identifiant absent du registre', async () => {
    const conteneur = await AstroContainer.create();
    await expect(conteneur.renderToString(Visuel, { props: { id: 'XXX-99' } })).rejects.toThrow(/XXX-99/);
  });
});
