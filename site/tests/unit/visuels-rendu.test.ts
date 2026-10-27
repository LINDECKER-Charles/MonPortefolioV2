import { mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { afterAll, describe, expect, it } from 'vitest';
import { fichierMaster, fichierMasterNuit, fichierNuit, RENDUS, renduNuit, visuelParId, VISUELS } from '../../src/config/visuels';
import { couleursDuRendu, decomposer, encoder, JETONS, lireJetons, mastersPresents, nettoyerAlpha, QUALITE, QUALITE_PLANCHER, recolorer, rendre } from '../../tools/rendre-visuels.mjs';
import { etatDesVisuels, verifierLivres } from '../../tools/visuels-manquants.mjs';

/**
 * Règle 6 de la commande : une image générée a deux masters en trois couleurs
 * de clé, le jour et la nuit, que tools/rendre-visuels.mjs rend aux couleurs
 * des jetons (src/styles/jetons.css).
 */

const pixel = (r: number, g: number, b: number, a = 255) => [r, g, b, a];
const rvb = (hex: string) => [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16));
const jetons = lireJetons(readFileSync(JETONS, 'utf8'));

/** Noir, blanc et rouge purs, un trait antialiasé (gris moyen), un rose (blanc et rouge mêlés), un pixel transparent. */
const ECHANTILLON = Uint8Array.from([...pixel(0, 0, 0), ...pixel(255, 255, 255), ...pixel(255, 0, 0), ...pixel(128, 128, 128), ...pixel(255, 128, 128), ...pixel(255, 255, 255, 0)]);

describe('lecture des jetons', () => {
  it('lit le jour dans :root et la nuit par-dessus, sans recopier les valeurs', () => {
    expect(jetons.jour['--surface']).toBe('#fbfaf7');
    expect(jetons.jour['--encre']).toBe('#141312');
    expect(jetons.nuit['--encre']).toBe('#e4e7ee');
    expect(jetons.nuit['--fond']).toBe('#0b0d12');
    expect(jetons.nuit['--lanterne']).toBe(jetons.jour['--lanterne']);
    expect(jetons.nuit['--papier-lune']).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('donne à chaque rendu les couleurs de ses jetons', () => {
    for (const rendu of ['jour', 'nuit', 'nuitSurface', 'repli'] as const) {
      const { theme, jetons: noms } = RENDUS[rendu];
      expect(couleursDuRendu(jetons, rendu)).toEqual({ encre: rvb(jetons[theme][noms.encre]), aplat: rvb(jetons[theme][noms.aplat]), lumiere: rvb(jetons[theme][noms.lumiere]) });
    }
    expect(RENDUS.jour.jetons).toEqual({ encre: '--encre', aplat: '--surface', lumiere: '--lanterne' });
    expect(RENDUS.nuit.jetons).toEqual({ encre: '--fond', aplat: '--encre', lumiere: '--lanterne' });
    expect(RENDUS.repli.jetons).toEqual({ encre: '--fond', aplat: '--papier-lune', lumiere: '--lanterne' });
    expect(RENDUS.nuitSurface.jetons).toEqual({ encre: '--surface', aplat: '--encre', lumiere: '--lanterne' });
  });

  it('rend le noir d’un fond rempli en surface de nuit, symétrique du jour ; celui d’une image transparente en fond, sauf posée sur une carte', () => {
    // Le jour, l’aplat d’un fond rempli devient --surface : la nuit, son noir aussi, pour que la plaque réponde à celle du jour.
    expect(renduNuit(visuelParId('PRO-01')!)).toBe('nuitSurface');
    expect(renduNuit(visuelParId('CON-02')!)).toBe('nuit');
    expect(renduNuit(visuelParId('CON-01')!)).toBe('nuitSurface');
    for (const v of VISUELS.filter((x) => x.methode === 'IMG' && x.fichier)) {
      expect(renduNuit(v), v.id).toBe(v.fond === 'aplat' || v.support === 'surface' ? 'nuitSurface' : 'nuit');
      // Un support ne se donne qu’à une image transparente : un fond rempli a déjà sa surface.
      if (v.support) expect(v.fond, v.id).toBe('transparent');
    }
    expect(jetons.nuit['--surface']).toBe('#1a1e29');
  });

  it('refuse un jeton absent ou qui n’est pas en hexadécimal', () => {
    const css = ':root { --surface: #fff; --encre: rgb(0 0 0); } :root[data-theme=\'nuit\'], .acte-veille { --fond: #000; }';
    expect(() => couleursDuRendu(lireJetons(css), 'jour')).toThrow(/--encre \(jour\) absent ou pas en hexadécimal/);
  });
});

describe('décomposition et rendu', () => {
  it('décompose chaque pixel en parts de clés dont la somme vaut 255', () => {
    const { encre, aplat, lumiere } = decomposer(ECHANTILLON);
    expect([...encre]).toEqual([255, 0, 0, 127, 0, 0]);
    expect([...aplat]).toEqual([0, 255, 0, 128, 128, 255]);
    expect([...lumiere]).toEqual([0, 0, 255, 0, 127, 0]);
  });

  it('débarrasse l’alpha du bruit du générateur, sans toucher aux bords antialiasés', () => {
    expect([0, 3, 6, 7, 128, 247, 248, 253, 255].map(nettoyerAlpha)).toEqual([0, 0, 0, 7, 128, 247, 255, 255, 255]);
    // Un sujet « opaque » à 253 devient opaque ; un voile à 3, transparent ; un bord à 128 reste un bord.
    const sortie = recolorer(Uint8Array.from([...pixel(0, 0, 0, 253), ...pixel(255, 255, 255, 3), ...pixel(255, 0, 0, 128)]), couleursDuRendu(jetons, 'jour'));
    expect([sortie[3], sortie[7], sortie[11]]).toEqual([255, 0, 128]);
  });

  const melange = (a: number[], b: number[], pa: number, pb: number) => a.map((c, i) => Math.round((c * pa + b[i] * pb) / 255));
  for (const rendu of ['jour', 'nuit', 'nuitSurface', 'repli'] as const) {
    it(`rend les clés pures, les bords antialiasés et la transparence (${rendu})`, () => {
      const c = couleursDuRendu(jetons, rendu);
      const sortie = [...recolorer(ECHANTILLON, c)];
      const px = (i: number) => sortie.slice(i * 4, i * 4 + 4);
      expect(px(0)).toEqual([...c.encre, 255]);
      expect(px(1)).toEqual([...c.aplat, 255]);
      expect(px(2)).toEqual([...c.lumiere, 255]);
      expect(px(3)).toEqual([...melange(c.encre, c.aplat, 127, 128), 255]);
      expect(px(4)).toEqual([...melange(c.aplat, c.lumiere, 128, 127), 255]);
      expect(px(5)).toEqual([...c.aplat, 0]);
    });
  }
});

describe('encodage sous le plafond de poids', () => {
  /** Un bruit pseudo-aléatoire, mauvais élève de la compression. */
  const bruit = (cote: number) => {
    const donnees = Buffer.alloc(cote * cote * 4);
    let graine = 7;
    for (let i = 0; i < donnees.length; i++) donnees[i] = i % 4 === 3 ? 255 : (graine = (graine * 1103515245 + 12345) % 2147483648) & 255;
    return { donnees, brut: { width: cote, height: cote, channels: 4 as const } };
  };

  it('garde la qualité 82 quand le rendu tient sous son plafond', async () => {
    const { donnees, brut } = bruit(64);
    const { qualite, webp } = await encoder(donnees, brut, 1024 * 1024);
    expect(qualite).toBe(QUALITE);
    expect((await sharp(webp).metadata()).format).toBe('webp');
  });

  it('abaisse la qualité de ce seul rendu par pas de 2 jusqu’à tenir, sans passer sous le plancher', async () => {
    const { donnees, brut } = bruit(160);
    const libre = await encoder(donnees, brut, 1024 * 1024);
    const plafond = Math.round(libre.webp.length * 0.8);
    const tenu = await encoder(donnees, brut, plafond);
    expect(tenu.qualite).toBeLessThan(QUALITE);
    expect((QUALITE - tenu.qualite) % 2).toBe(0);
    expect(tenu.webp.length).toBeLessThanOrEqual(plafond);
    const impossible = await encoder(donnees, brut, 100);
    expect(impossible.qualite).toBe(QUALITE_PLANCHER);
    expect(impossible.webp.length).toBeGreaterThan(100);
  });
});

describe('rendu des masters', () => {
  const racine = mkdtempSync(path.join(tmpdir(), 'rendu-'));
  const depot = path.join(racine, 'depot');
  const site = path.join(depot, 'site');
  const v = visuelParId('CON-02')!;
  /** Un master de 720 px : un disque blanc cerné de noir, une flamme rouge, sur fond transparent. */
  const master = (fond: string, trait: string) =>
    sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="720" height="720"><circle cx="360" cy="360" r="250" fill="${fond}" stroke="${trait}" stroke-width="30"/><circle cx="360" cy="330" r="60" fill="#f00"/></svg>`)).png();
  const lire = async (fichier: string) => sharp(readFileSync(path.join(site, fichier))).ensureAlpha().raw().toBuffer();
  const proche = (pixels: Buffer, x: number, y: number, attendu: number[]) => {
    const i = (y * 360 + x) * 4;
    for (let c = 0; c < 3; c++) expect(Math.abs(pixels[i + c] - attendu[c]), `canal ${c} en ${x},${y}`).toBeLessThan(12);
  };

  it('écrit une nuit de repli « clair de lune » depuis le jour quand le master de nuit manque, et la signale', async () => {
    mkdirSync(path.join(depot, 'design/assets/visuels/contact'), { recursive: true });
    await master('#fff', '#000').toFile(path.join(depot, fichierMaster(v)!));
    expect(mastersPresents(depot)).toEqual(['CON-02']);
    const { ecrits, repli } = await rendre('CON-02', { depot, site });
    expect(repli).toBe(true);
    expect(ecrits.map((e: { fichier: string }) => e.fichier)).toEqual([v.fichier, fichierNuit(v)]);
    for (const { fichier, poids, plafond } of ecrits) {
      // Le cache natif de sharp ne doit pas garder le fichier ouvert sous Windows.
      const meta = await sharp(readFileSync(path.join(site, fichier))).metadata();
      expect([meta.width, meta.height, meta.hasAlpha], fichier).toEqual([360, 360, true]);
      expect(poids, fichier).toBeLessThan(plafond);
    }
    const jour = await lire(v.fichier!);
    const nuit = await lire(fichierNuit(v)!);
    proche(jour, 180, 240, rvb(jetons.jour['--surface'])); // le disque
    proche(jour, 180, 165, rvb(jetons.jour['--lanterne'])); // la flamme
    proche(nuit, 180, 240, rvb(jetons.nuit['--papier-lune']));
    proche(nuit, 180, 165, rvb(jetons.nuit['--lanterne']));
    expect(jour[(10 * 360 + 10) * 4 + 3]).toBe(0); // le coin, transparent
    expect(nuit[(10 * 360 + 10) * 4 + 3]).toBe(0);
    // Signalée, pas livrée : le contrôle réclame le master de nuit.
    expect(etatDesVisuels(site, [v], depot).nuitsDeRepli.map((x: { id: string }) => x.id)).toEqual(['CON-02']);
    expect((await verifierLivres(site, [v], depot)).join('\n')).toMatch(/master de nuit absent .*CON-02\.nuit\.png/);
  });

  it('rend la nuit depuis son master : noir → fond de nuit, blanc → encre de nuit, rouge → lanterne', async () => {
    await master('#000', '#fff').toFile(path.join(depot, fichierMasterNuit(v)!));
    const { repli } = await rendre('CON-02', { depot, site });
    expect(repli).toBe(false);
    const nuit = await lire(fichierNuit(v)!);
    proche(nuit, 180, 240, rvb(jetons.nuit['--fond']));
    proche(nuit, 180, 165, rvb(jetons.nuit['--lanterne']));
    proche(nuit, 180, 57, rvb(jetons.nuit['--encre'])); // le cerne, blanc dans le master de nuit
    expect(nuit[(10 * 360 + 10) * 4 + 3]).toBe(0); // un fond transparent reste transparent
    const etat = etatDesVisuels(site, [v], depot);
    expect([etat.nuitsDeRepli, etat.nuitsManquantes]).toEqual([[], []]);
    expect(await verifierLivres(site, [v], depot)).toEqual([]);
  });

  it('refuse un master de nuit qui n’a pas les dimensions du jour', async () => {
    await sharp({ create: { width: 700, height: 700, channels: 4, background: '#000000' } }).png().toFile(path.join(depot, fichierMasterNuit(v)!));
    await expect(rendre('CON-02', { depot, site })).rejects.toThrow(/master de nuit en 700 × 700, master de jour en 720 × 720/);
    expect((await verifierLivres(site, [v], depot)).join('\n')).toMatch(/CON-02\.nuit\.png : 700 × 700, master de jour en 720 × 720/);
  });

  it('refuse un master de jour absent ou au mauvais ratio', async () => {
    await expect(rendre('ACC-03', { depot, site })).rejects.toThrow(/master de jour absent \(design\/assets\/visuels\/accueil\/ACC-03\.png\)/);
    mkdirSync(path.join(depot, 'design/assets/visuels/accueil'), { recursive: true });
    await sharp({ create: { width: 1024, height: 1024, channels: 4, background: '#ffffff' } }).png().toFile(path.join(depot, 'design/assets/visuels/accueil/ACC-03.png'));
    await expect(rendre('ACC-03', { depot, site })).rejects.toThrow(/ratio attendu 1800 × 1200/);
    await expect(rendre('LOD-03', { depot, site })).rejects.toThrow(/pas une image générée/);
  });

  afterAll(() => rmSync(racine, { recursive: true, force: true }));
});
