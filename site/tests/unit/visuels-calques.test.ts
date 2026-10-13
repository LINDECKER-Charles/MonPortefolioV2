import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { afterAll, describe, expect, it } from 'vitest';
import { fichiersCalques, visuelParId } from '../../src/config/visuels';
import { decomposer, mastersPresents, separer } from '../../tools/separer-calques.mjs';
import { verifierLivres } from '../../tools/visuels-manquants.mjs';

/**
 * Règle 6 de la commande : une image générée en trois couleurs de clé se
 * sépare en calques recolorables (tools/separer-calques.mjs).
 */

const pixel = (r: number, g: number, b: number, a = 255) => Buffer.from([r, g, b, a]);

describe('séparation en calques', () => {
  it('décompose chaque clé dans son calque, et un mélange en parts', () => {
    const { aplat, encre, lumiere } = decomposer(Buffer.concat([pixel(0, 0, 0), pixel(255, 255, 255), pixel(255, 0, 0), pixel(128, 128, 128), pixel(255, 0, 0, 0)]));
    expect([...encre]).toEqual([255, 0, 0, 127, 0]);
    expect([...aplat]).toEqual([0, 255, 0, 128, 0]);
    expect([...lumiere]).toEqual([0, 0, 255, 0, 0]);
  });

  const racine = mkdtempSync(path.join(tmpdir(), 'calques-'));
  const depot = path.join(racine, 'depot');
  const site = path.join(racine, 'site');

  it('écrit le rendu et les trois calques aux dimensions du nom, conformes à la vérification', async () => {
    mkdirSync(path.join(depot, 'design/assets/visuels/contact'), { recursive: true });
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="720" height="720"><circle cx="360" cy="360" r="250" fill="#fff" stroke="#000" stroke-width="30"/><circle cx="360" cy="330" r="60" fill="#f00"/></svg>';
    await sharp(Buffer.from(svg)).png().toFile(path.join(depot, 'design/assets/visuels/contact/CON-02.png'));
    expect(mastersPresents(depot)).toEqual(['CON-02']);
    const ecrits = await separer('CON-02', { depot, site });
    const v = visuelParId('CON-02')!;
    expect(ecrits.map((e: { fichier: string }) => e.fichier)).toEqual([v.fichier, ...Object.values(fichiersCalques(v)!)]);
    for (const { fichier, poids, plafond } of ecrits) {
      const meta = await sharp(path.join(site, fichier)).metadata();
      expect([meta.width, meta.height, meta.hasAlpha], fichier).toEqual([360, 360, true]);
      expect(poids, fichier).toBeLessThan(plafond);
    }
    const lumiere = await sharp(path.join(site, fichiersCalques(v)!.lumiere)).ensureAlpha().raw().toBuffer();
    expect(lumiere[(165 * 360 + 180) * 4 + 3]).toBeGreaterThan(240); // le centre de la flamme
    expect(lumiere[(10 * 360 + 10) * 4 + 3]).toBe(0); // le coin, transparent
    expect(await verifierLivres(site, [v])).toEqual([]);
  });

  it('refuse un master au mauvais ratio', async () => {
    mkdirSync(path.join(depot, 'design/assets/visuels/accueil'), { recursive: true });
    await sharp({ create: { width: 1024, height: 1024, channels: 4, background: '#ffffff' } }).png().toFile(path.join(depot, 'design/assets/visuels/accueil/ACC-03.png'));
    await expect(separer('ACC-03', { depot, site })).rejects.toThrow(/ratio attendu 1800 × 1200/);
  });

  afterAll(() => rmSync(racine, { recursive: true, force: true }));
});
