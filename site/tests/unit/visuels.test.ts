import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Visuel from '../../src/components/ui/Visuel.astro';
import {
  CALQUES,
  FAMILLES,
  familleDe,
  fichiersAttendus,
  fichiersCalques,
  ORDRE_SERIES,
  plafondPoids,
  REGLES_COMMUNES,
  sujetPourGenerateur,
  visuelParId,
  VISUELS,
} from '../../src/config/visuels';
import { dimensionsDuNom, etatDesVisuels, resume, verifierLivres } from '../../tools/visuels-manquants.mjs';

/**
 * Garde-fous du registre des visuels (config/visuels.ts) : l’inventaire du
 * cahier des charges est complet, cohérent, nommé selon la règle de livraison,
 * ne met aucun nom de marque dans ce qu’on donne à un générateur d’image, et
 * dit où chaque entrée est posée.
 */

const SITE = new URL('../../', import.meta.url).pathname;
const SRC = path.join(SITE, 'src');
const MARQUES = /\b(?:pvz|plants vs\.? zombies|riot|league of legends|sony|fromsoftware|trello|b-hive|elan formation|atis|mission locale|shrek|gwent|bloodborne|omnicard|unreal|unity)\b|\b42\b/i;
const tous = (cle: 'sujet' | 'composition' | 'cadrage' | 'alt' | 'emplacement' | 'format' | 'note' | 'raisonNonPose') => VISUELS.flatMap((v) => (v[cle] ? [[v.id, v[cle] as string] as const] : []));
const images = VISUELS.filter((v) => v.methode === 'IMG' && !v.reprend?.length);

describe('registre des visuels : l’inventaire', () => {
  it('recense les 176 emplacements, dont 117 « socle » et 59 « élargi »', () => {
    expect(VISUELS).toHaveLength(176);
    expect(VISUELS.filter((v) => v.priorite === 'socle')).toHaveLength(117);
    expect(VISUELS.filter((v) => v.priorite === 'elargi')).toHaveLength(59);
  });

  it('répartit les méthodes comme l’inventaire, captures du cahier (§ 6.12) comprises', () => {
    const par = (m: string) => VISUELS.filter((v) => v.methode === m).length;
    expect({ IMG: par('IMG'), SVG: par('SVG'), FIG: par('FIG'), CAP: par('CAP'), PHO: par('PHO'), OG: par('OG') }).toEqual({ IMG: 79, SVG: 37, FIG: 25, CAP: 26, PHO: 4, OG: 5 });
  });

  it('donne un identifiant unique, de la forme PREFIXE-NN, PREFIXE-FN, PREFIXE-CN, PREFIXE-OG ou PREFIXE-PHO', () => {
    const ids = VISUELS.map((v) => v.id);
    expect(new Set(ids).size).toBe(ids.length);
    // PREFIXE-NNa, b, c : les cases d’un emplacement découpé en plusieurs fichiers (triptyque PVZ-02).
    for (const id of ids) expect(id).toMatch(/^[A-Z]{3}-(?:\d{2}[a-c]?|[FC]\d|OG|PHO)$/);
    for (const id of ids.filter((x) => /\d[a-c]$/.test(x))) expect(visuelParId(id.slice(0, -1))?.reprend, id).toContain(id);
    for (const id of ids.filter((x) => /-C\d$/.test(x))) expect(visuelParId(id)?.methode, id).toBe('CAP');
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

  it('compte chaque lot : pièces d’un SVG, déclinaisons d’une image de partage, emplacements repris', () => {
    for (const v of VISUELS.filter((x) => x.lot)) {
      if (v.reprend?.length) expect(v.reprend, v.id).toHaveLength(v.lot!);
      else if (v.methode === 'SVG') expect(v.pieces, v.id).toHaveLength(v.lot!);
      else if (v.methode === 'OG') expect(v.declinaisons, v.id).toHaveLength(v.lot!);
    }
    for (const v of VISUELS.filter((x) => x.pieces?.length)) {
      expect(v.methode, v.id).toBe('SVG');
      expect(new Set(v.pieces).size, v.id).toBe(v.pieces!.length);
      // Préfixe de l’identifiant, sauf les symboles de GLO-04 livrés avant la règle et les calques de la bascule.
      if (!['GLO-03', 'GLO-04'].includes(v.id)) for (const piece of v.pieces!) expect(piece, v.id).toMatch(new RegExp(`^${v.id}-[a-z0-9-]+$`));
    }
  });
});

describe('registre des visuels : où chaque entrée est posée', () => {
  it('pose toute entrée « socle », et seulement elles ; dit pourquoi une entrée « élargi » ne l’est pas', () => {
    for (const v of VISUELS) {
      if (v.priorite === 'socle') {
        expect(v.pose?.length, `${v.id} socle sans pose`).toBeGreaterThan(0);
        expect(v.raisonNonPose, v.id).toBeUndefined();
      } else {
        expect(v.pose, `${v.id} élargi mais posé`).toBeNull();
        expect(v.raisonNonPose?.trim().length, `${v.id} sans raison`).toBeGreaterThan(10);
      }
    }
  });

  it('nomme des fichiers de src/ qui existent et appellent bien l’entrée', () => {
    for (const v of VISUELS.filter((x) => x.pose)) {
      const sources = v.pose!.map((p) => {
        const chemin = path.join(SRC, p);
        expect(existsSync(chemin), `${v.id} : src/${p}`).toBe(true);
        return readFileSync(chemin, 'utf8');
      });
      const reperes = [
        v.id,
        ...(v.reprend ?? []),
        ...fichiersAttendus(v).map((f) => path.posix.basename(f)),
        // Une figure codée est posée par la page qui importe son composant.
        ...(v.methode === 'FIG' && v.fichier ? [v.fichier.split('/').slice(-2).join('/')] : []),
      ];
      expect(sources.some((s) => reperes.some((r) => s.includes(r))), `${v.id} : aucun de ${v.pose!.join(', ')} ne l’appelle`).toBe(true);
    }
  });

  it('déclare chaque appel du site dans la pose de l’entrée appelée, toujours « socle » : aucun cadre d’un « élargi » en ligne', () => {
    const fichiers: string[] = [];
    const parcourir = (dossier: string) => {
      for (const nom of readdirSync(dossier, { withFileTypes: true })) {
        const chemin = path.join(dossier, nom.name);
        if (nom.isDirectory()) parcourir(chemin);
        else if (/\.(?:astro|ts)$/.test(nom.name) && !chemin.endsWith(path.join('config', 'visuels.ts'))) fichiers.push(chemin);
      }
    };
    parcourir(SRC);
    const appels: [string, string][] = [];
    for (const fichier of fichiers) {
      const source = readFileSync(fichier, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/<!--[\s\S]*?-->/g, '');
      const motifs = [/<(?:Visuel|Scene)\b[^>]*?\bid=["']([A-Z]{3}-\w+)["']/g, /\bvisuel:\s*['"]([A-Z]{3}-\w+)['"]/g, /visuelParId\(\s*['"]([A-Z]{3}-\w+)['"]\s*\)/g];
      for (const motif of motifs) for (const m of source.matchAll(motif)) appels.push([path.relative(SRC, fichier), m[1]]);
    }
    expect(appels.length).toBeGreaterThan(60);
    const ecarts = appels.flatMap(([fichier, id]) => {
      const v = visuelParId(id);
      if (!v) return [`${fichier} : ${id} absent du registre`];
      if (v.priorite !== 'socle') return [`${fichier} : ${id} posé mais « élargi »`];
      return v.pose?.includes(fichier) ? [] : [`${fichier} : absent de la pose de ${id}`];
    });
    expect(ecarts).toEqual([]);
  });

  it('garde la position de la lanterne identique entre le registre et les scènes animées', () => {
    const lu = new Map<string, string>();
    const index = readFileSync(path.join(SRC, 'pages/index.astro'), 'utf8');
    for (const m of index.matchAll(/<Scene\b[^>]*?\bid="([A-Z]{3}-\d{2})"[^>]*?\blumiere=\{\[(\d+),\s*(\d+)\]\}/g)) lu.set(m[1], `${m[2]},${m[3]}`);
    for (const composant of ['components/accueil/FigureGwent.astro', 'components/accueil/FigureCollectif.astro']) {
      const source = readFileSync(path.join(SRC, composant), 'utf8');
      for (const m of source.matchAll(/visuel:\s*'([A-Z]{3}-\d{2})'[^}]*?lumiere:\s*\[(\d+),\s*(\d+)\]/g)) lu.set(m[1], `${m[2]},${m[3]}`);
    }
    const registre = new Map(VISUELS.filter((v) => v.lumiere).map((v) => [v.id, v.lumiere!.join(',')]));
    expect(registre.size).toBe(11);
    expect(Object.fromEntries(lu)).toEqual(Object.fromEntries(registre));
    // La composition donnée au générateur dit la même position.
    for (const v of VISUELS.filter((x) => x.lumiere)) expect(v.composition, v.id).toContain(`vers ${v.lumiere![0]} % de la largeur et ${v.lumiere![1]} % de la hauteur`);
  });
});

describe('registre des visuels : la commande des images générées', () => {
  it('donne à chaque image ses trois calques, son fond et une seule série de dessin', () => {
    for (const v of images) {
      for (const calque of ['encre', 'aplat', 'lumiere'] as const) expect(v.calques?.[calque]?.trim().length, `${v.id}.calques.${calque}`).toBeGreaterThan(3);
      expect(['transparent', 'aplat'], v.id).toContain(v.fond);
      expect(FAMILLES.filter((f) => f.ids.includes(v.id)), v.id).toHaveLength(1);
      expect(familleDe(v)).toBeDefined();
    }
    for (const id of FAMILLES.flatMap((f) => f.ids)) expect(images.map((v) => v.id), id).toContain(id);
  });

  it('garde la scène seule dans la composition : ni date, ni recadrage, ni taille d’affichage, ni nuit figée', () => {
    for (const v of images) {
      expect(v.composition, v.id).not.toMatch(/validée le|recadr|affichée?|\d\s?px\b|\bnuit\b/i);
      expect(v.cadrage?.trim().length, `${v.id}.cadrage`).toBeGreaterThan(10);
    }
  });

  it('veut des silhouettes sans visage et aucun caractère là où le sujet y pousse', () => {
    for (const id of ['ACC-07', 'ACC-11', 'ACC-18', 'ACC-20', 'ACC-21', 'ACC-22', 'ACC-23', 'PVZ-01', 'PVZ-02a', 'PVZ-02b', 'PVZ-02c', 'PVZ-09', 'LOD-04']) expect(visuelParId(id)!.composition, id).toMatch(/sans visage/);
    for (const id of ['PVZ-10', 'GUP-01', 'GUP-03']) expect(visuelParId(id)!.composition, id).toMatch(/aucun caractère/);
    expect(visuelParId('PVZ-01')!.composition).toMatch(/aucune plante, aucun zombie, aucun jardin ni grille de pelouse/);
    expect(visuelParId('PRO-03')!.composition).not.toMatch(/pousse|tige|plante/);
  });

  it('ne chiffre pas plus que le fait sourcé (stage : −30 %, pas un tiers)', () => {
    const stage = visuelParId('PRO-05')!;
    expect(`${stage.sujet} ${stage.composition} ${stage.alt}`).not.toMatch(/tiers/);
    expect(stage.sujet).toMatch(/^30 %/);
  });
});

describe('registre des visuels : fichiers attendus', () => {
  it('nomme chaque fichier selon sa méthode', () => {
    for (const v of VISUELS) {
      if (v.reprend?.length || v.methode === 'FIG') continue;
      if (v.declinaisons?.length) {
        if (v.methode === 'OG') for (const d of v.declinaisons) expect(d.fichier, v.id).toBe(`public/og/${v.id}-${d.nom}_1200x630.png`);
        continue;
      }
      if (!v.fichier) continue;
      const nom = path.posix.basename(v.fichier);
      // Photo et captures réelles existantes, nommées avant la refonte (la vitrine les pose dans leurs cadres).
      if (['ACC-01', 'PRJ-04', 'PRJ-05'].includes(v.id)) continue;
      if (v.methode === 'SVG') expect(v.fichier, v.id).toMatch(new RegExp(`^src/assets/visuels/${v.serie}/${v.id}\\.(?:svg|txt)$`));
      else if (v.methode === 'OG') expect(v.fichier, v.id).toBe(`public/og/${v.id}_1200x630.png`);
      else if (v.methode === 'CAP' && !v.largeur) expect(v.fichier, v.id).toBe(`src/assets/visuels/${v.serie}/${v.id}.webp`);
      else {
        expect(v.largeur && v.hauteur, `${v.id} sans taille`).toBeTruthy();
        expect(nom, v.id).toBe(`${v.id}_${v.largeur}x${v.hauteur}.webp`);
        expect(v.fichier, v.id).toBe(`src/assets/visuels/${v.serie}/${nom}`);
        expect(dimensionsDuNom(v.fichier), v.id).toEqual({ largeur: v.largeur, hauteur: v.hauteur });
      }
    }
  });

  it('nomme le composant de chaque figure codée, sauf les trois qui restent à coder', () => {
    const figures = VISUELS.filter((v) => v.methode === 'FIG');
    expect(figures.filter((v) => !v.fichier).map((v) => v.id)).toEqual(['ACC-10', 'ACC-12', 'OMN-07']);
    for (const v of figures.filter((x) => !x.fichier)) expect(v.priorite, v.id).toBe('elargi');
    for (const v of figures.filter((x) => x.fichier)) {
      expect(v.fichier, v.id).toMatch(/^src\/components\/.+\.astro$/);
      expect(statSync(path.join(SITE, v.fichier!)).isFile(), v.id).toBe(true);
    }
  });

  it('ne partage aucun fichier entre deux emplacements, sauf le composant de figures réunies', () => {
    const fichiers = VISUELS.filter((v) => v.methode !== 'FIG').flatMap((v) => fichiersAttendus(v).length && !v.reprend?.length ? fichiersAttendus(v) : []);
    expect(new Set(fichiers).size).toBe(fichiers.length);
  });

  it('résout les fichiers d’un emplacement qui en reprend ou en décline plusieurs', () => {
    expect(fichiersAttendus(visuelParId('ACC-15')!)).toHaveLength(4);
    expect(fichiersAttendus(visuelParId('PVZ-02')!)).toEqual(['a', 'b', 'c'].map((c) => `src/assets/visuels/pvz-fusion/PVZ-02${c}_1200x900.webp`));
    expect(fichiersAttendus(visuelParId('OMN-02')!)).toEqual(fichiersAttendus(visuelParId('ACC-04')!));
    expect(fichiersAttendus(visuelParId('GLO-08')!)).toHaveLength(10);
  });

  it('nomme les calques d’une image générée, et seulement d’elle', () => {
    expect(fichiersCalques(visuelParId('ACC-03')!)).toEqual({
      aplat: 'src/assets/visuels/accueil/ACC-03_1800x1200.aplat.webp',
      encre: 'src/assets/visuels/accueil/ACC-03_1800x1200.encre.webp',
      lumiere: 'src/assets/visuels/accueil/ACC-03_1800x1200.lumiere.webp',
    });
    expect(fichiersCalques(visuelParId('LOD-03')!)).toBeNull();
    expect(fichiersCalques(visuelParId('PRJ-03')!)).toBeNull();
    expect(CALQUES).toEqual(['aplat', 'encre', 'lumiere']);
  });

  it('plafonne le poids selon le plus grand côté', () => {
    expect(plafondPoids(480, 480)).toBe(40 * 1024);
    expect(plafondPoids(1200, 900)).toBe(120 * 1024);
    expect(plafondPoids(1800, 1200)).toBe(250 * 1024);
  });

  it('pointe, pour la photo de Charles, le fichier qui existe', () => {
    expect(statSync(path.join(SITE, visuelParId('ACC-01')!.fichier!)).isFile()).toBe(true);
  });
});

describe('registre des visuels : textes', () => {
  it('emploie l’apostrophe typographique et aucune marque Markdown ou emoji de travail', () => {
    for (const cle of ['sujet', 'composition', 'cadrage', 'alt', 'emplacement', 'format', 'note', 'raisonNonPose'] as const) {
      for (const [id, texte] of tous(cle)) {
        expect(texte, `${id}.${cle}`).not.toContain('\'');
        expect(texte, `${id}.${cle}`).not.toMatch(/[*`❓]|\s{2,}/);
      }
    }
  });

  it('prévoit un alt pour tout visuel qui informe, vide pour un décor', () => {
    const decoratifs = VISUELS.filter((v) => v.alt === '').map((v) => v.id).sort();
    expect(decoratifs).toEqual(['ACC-02', 'ACC-15', 'BLR-06', 'BLR-07', 'BLR-08', 'BLR-09', 'BLR-10', 'BLR-C4', 'CMP-09', 'CMP-10', 'ERR-02', 'FOR-08', 'GLO-01', 'GLO-03', 'GLO-04', 'GLO-05', 'GLO-06', 'GLO-09', 'GLO-10', 'GLO-11', 'GLO-12', 'GLO-13', 'GUP-02', 'GUP-C1', 'LOD-03', 'LOD-05', 'LOD-06', 'LOD-07', 'LOD-08', 'LOD-09', 'LOD-10', 'LOD-11', 'LOD-12', 'PRO-07']);
    for (const v of VISUELS) expect(v.alt.length, v.id).toBeLessThanOrEqual(140);
  });

  it('décrit l’image dans l’alt, au lieu de recopier le sujet', () => {
    for (const v of VISUELS.filter((x) => x.alt)) {
      expect(v.alt.toLowerCase(), v.id).not.toBe(v.sujet.toLowerCase());
      expect(v.alt, v.id).not.toBe(v.sujetNeutre);
    }
  });

  it('ne met aucun nom de marque dans ce qu’on donne à un générateur d’image (règle 1)', () => {
    for (const v of images) expect(`${sujetPourGenerateur(v)} ${v.composition}`, v.id).not.toMatch(MARQUES);
  });

  it('garde un sujet neutre là où le sujet nomme une marque', () => {
    const avecNeutre = VISUELS.filter((v) => v.sujetNeutre).map((v) => v.id).sort();
    expect(avecNeutre).toEqual(['FOR-07', 'PVZ-10', 'PVZ-C2', 'PVZ-C3']);
    for (const v of VISUELS.filter((x) => x.sujetNeutre)) expect(v.sujetNeutre, v.id).not.toMatch(MARQUES);
  });

  it('reprend les huit règles communes du cahier des charges, la règle 6 tranchée', () => {
    expect(REGLES_COMMUNES).toHaveLength(8);
    expect(REGLES_COMMUNES[0]).toMatch(/propriété intellectuelle/);
    expect(REGLES_COMMUNES[2]).toMatch(/Aucun texte dans l’image/);
    expect(REGLES_COMMUNES[5]).toMatch(/#000000.*#FFFFFF.*#FF0000/);
    expect(REGLES_COMMUNES[5]).toMatch(/separer-calques/);
  });

  it('ne renvoie plus à une ancienne commande pour une règle', () => {
    for (const [id, note] of tous('note')) expect(note, id).not.toMatch(/assets-a-generer/);
    expect(REGLES_COMMUNES.join(' ')).not.toMatch(/assets-a-generer/);
  });
});

describe('registre des visuels : liste des manquants', () => {
  const racine = mkdtempSync(path.join(tmpdir(), 'visuels-'));
  const ecrire = (fichier: string, contenu: string | Buffer = 'x') => {
    mkdirSync(path.dirname(path.join(racine, fichier)), { recursive: true });
    writeFileSync(path.join(racine, fichier), contenu);
  };

  it('compte tout comme manquant dans un dossier vide, sans compter deux fois les reprises', () => {
    const etat = etatDesVisuels(racine);
    expect(etat.total).toBe(176);
    expect(etat.presents).toBe(0);
    expect(etat.reprises).toBe(6);
    expect(etat.figuresACoder.map((v: { id: string }) => v.id)).toEqual(['ACC-10', 'ACC-12', 'OMN-07']);
    expect(etat.figuresSocleACoder).toHaveLength(0);
    expect(etat.manquants).toHaveLength(176 - 6 - 3);
    expect(etat.manquantsSocle.length + etat.manquantsElargi.length).toBe(etat.manquants.length);
  });

  it('retire de la liste un visuel livré, et attend toutes les déclinaisons d’un lot', () => {
    ecrire('src/assets/visuels/league-of-database/LOD-03.svg');
    ecrire('public/og/GLO-08-projets_1200x630.png');
    const etat = etatDesVisuels(racine);
    expect(etat.presents).toBe(1);
    expect(etat.manquantsSocle.map((v: { id: string }) => v.id)).not.toContain('LOD-03');
    expect(etat.manquantsSocle.map((v: { id: string }) => v.id)).toContain('LOD-06');
    expect(etat.manquantsElargi.map((v: { id: string }) => v.id)).toContain('GLO-08');
  });

  it('signale une image générée livrée sans ses calques, puis la rend conforme', () => {
    const v = visuelParId('CON-02')!;
    ecrire(v.fichier!);
    expect(etatDesVisuels(racine).calquesManquants.map((x: { id: string }) => x.id)).toEqual(['CON-02']);
    for (const f of Object.values(fichiersCalques(v)!)) ecrire(f);
    expect(etatDesVisuels(racine).calquesManquants).toHaveLength(0);
  });

  it('sur le dépôt réel : les photos, les dessins et captures livrés, les composants des figures', () => {
    const etat = etatDesVisuels(SITE);
    expect(etat.presents).toBe(51);
    expect(etat.calquesManquants).toHaveLength(0);
    expect(etat.manquantsSocle).toHaveLength(61);
    const manquants = etat.manquantsSocle.map((v: { id: string }) => v.id);
    for (const id of ['GLO-03', 'GLO-04', 'ACC-14', 'ACC-17', 'PRJ-04', 'PRJ-05', 'PAR-PHO', 'CON-PHO', 'ERR-PHO', 'LOD-03', 'LOD-12', 'BLR-06', 'BLR-10', 'GUP-02', 'OMN-04', 'FOR-09', 'BLR-C4', 'GUP-C1']) expect(manquants).not.toContain(id);
    // Seules restent les images à générer, et l’image de partage par défaut.
    expect(etat.manquantsSocle.filter((v: { methode: string }) => v.methode !== 'IMG').map((v: { id: string }) => v.id)).toEqual(['GLO-07']);
    expect(resume(etat)).toMatch(/61 visuels « socle » manquants/);
  });

  it('contrôle les fichiers livrés du dépôt : dimensions, ratio, pièces et titre des SVG', async () => {
    expect(await verifierLivres(SITE)).toEqual([]);
  });

  it('refuse un fichier livré aux mauvaises dimensions ou un SVG sans ses pièces', async () => {
    const sharp = (await import('sharp')).default;
    const v = visuelParId('PVZ-05')!;
    ecrire(v.fichier!, await sharp({ create: { width: 400, height: 480, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).webp().toBuffer());
    ecrire('src/assets/visuels/gup/GUP-02.svg', '<svg xmlns="http://www.w3.org/2000/svg"><title>Bande</title><symbol id="GUP-02-cloison" /></svg>');
    const ecarts = await verifierLivres(racine, [v, visuelParId('GUP-02')!]);
    expect(ecarts.join('\n')).toMatch(/PVZ-05 .* 400 × 480 au lieu de 480 × 480/);
    expect(ecarts.join('\n')).toMatch(/calque « aplat » absent/);
    expect(ecarts.join('\n')).toMatch(/GUP-02 .* pièce « GUP-02-arguments » absente/);
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
  parcourir(SRC);

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

  it('affiche le dessin livré en image, sans cadre hachuré', async () => {
    const conteneur = await AstroContainer.create();
    const html = await conteneur.renderToString(Visuel, { props: { id: 'LOD-12' } });
    expect(html).not.toContain('visuel--manquant');
    expect(html).toMatch(/<img[^>]+LOD-12/);
  });

  it('refuse un identifiant absent du registre', async () => {
    const conteneur = await AstroContainer.create();
    await expect(conteneur.renderToString(Visuel, { props: { id: 'XXX-99' } })).rejects.toThrow(/XXX-99/);
  });
});
