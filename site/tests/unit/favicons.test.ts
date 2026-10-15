import { readFileSync } from 'node:fs';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { DELAI_BUILD, pagesConstruites } from './support/dist';

const publicFile = (nom: string) => readFileSync(new URL(`../../public/${nom}`, import.meta.url));
const ico = publicFile('favicon.ico');
const entrees = Array.from({ length: ico.readUInt16LE(4) }, (_, i) => {
  const position = 6 + i * 16;
  const debut = ico.readUInt32LE(position + 12);
  const longueur = ico.readUInt32LE(position + 8);
  return { taille: ico[position], image: ico.subarray(debut, debut + longueur) };
});

const luminance = (rgb: number[]) => rgb.map((v) => {
  const s = v / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}).reduce((somme, v, i) => somme + v * [0.2126, 0.7152, 0.0722][i], 0);

describe('favicons transparents et lisibles', () => {
  it('fournit trois vraies résolutions dans le repli ICO', async () => {
    expect(ico.readUInt16LE(0)).toBe(0);
    expect(ico.readUInt16LE(2)).toBe(1);
    expect(entrees.map((e) => e.taille)).toEqual([16, 32, 48]);
    for (const { taille, image } of entrees) {
      expect(await sharp(image).metadata()).toMatchObject({ format: 'png', width: taille, height: taille });
    }
  });

  it('garde la transparence et les deux parties du symbole sur huit fonds à 16 px', async () => {
    const fonds = ['#ffffff', '#ece9e3', '#202124', '#0b0d12', '#000000', '#1f4fd1', '#808080', '#f0b24a'];
    const fichiers: [string, Buffer][] = [
      ['SVG', publicFile('favicon.svg')], ['PNG', publicFile('favicon.png')],
      ...entrees.map(({ taille, image }): [string, Buffer] => [`ICO ${taille}`, image]),
    ];
    for (const [nom, image] of fichiers) {
      const data = await sharp(image).resize(16, 16).ensureAlpha().raw().toBuffer();
      expect(data[3], `${nom} : coin transparent`).toBe(0);
      for (const fond of fonds) {
        const rgb = [1, 3, 5].map((i) => parseInt(fond.slice(i, i + 2), 16));
        const lFond = luminance(rgb);
        const visibles = { lanterne: 0, livre: 0 };
        for (let pixel = 0; pixel < 256; pixel++) {
          const alpha = data[pixel * 4 + 3] / 255;
          const lPixel = luminance(rgb.map((v, canal) => v * (1 - alpha) + data[pixel * 4 + canal] * alpha));
          const contraste = (Math.max(lFond, lPixel) + 0.05) / (Math.min(lFond, lPixel) + 0.05);
          if (contraste >= 3) visibles[pixel < 160 ? 'lanterne' : 'livre']++;
        }
        // Seuil de régression du dessin à 16 px, pas une certification WCAG de logo.
        expect(visibles.lanterne, `${nom}, ${fond} : lanterne`).toBeGreaterThanOrEqual(8);
        expect(visibles.livre, `${nom}, ${fond} : livre`).toBeGreaterThanOrEqual(8);
      }
    }
  });

  it('conserve l’ancienne URL de nuit avec le dessin universel', () => {
    expect(publicFile('favicon-nuit.png')).toEqual(publicFile('favicon.png'));
  });

  it('annonce les trois formats sans condition de thème sur toutes les pages construites', async () => {
    for (const { url, html } of await pagesConstruites()) {
      const icones = html.match(/<link\b[^>]*rel="icon"[^>]*>/g) ?? [];
      expect(icones, url).toHaveLength(3);
      for (const icone of icones) {
        expect(icone, url).not.toContain('media=');
        expect(icone, url).toMatch(/href="\/favicon\.(ico|png|svg)\?v=[^"]+"/);
      }
    }
  }, DELAI_BUILD);
});
