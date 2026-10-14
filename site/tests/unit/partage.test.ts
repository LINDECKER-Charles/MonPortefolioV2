import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { PAGES_SITEMAP } from '../../src/config/pages';
import { visuelParId } from '../../src/config/visuels';
import { IMAGES_PARTAGE, imagePartageDe, PARTAGE_DEFAUT } from '../../src/lib/partage';
import { DELAI_BUILD, pagesConstruites } from './support/dist';

/**
 * Les images de partage (lib/partage.ts, tools/generer-partage.mjs) : une
 * par page publique, de la direction « Lanterne », livrée en PNG de
 * 1 200 × 630, et c’est bien elle que la page annonce en og:image, avec son
 * alt. L’image par défaut est GLO-07 dès qu’elle existe.
 */

const SITE = path.resolve(import.meta.dirname, '../..');
/** Largeur et hauteur d’un PNG, lues dans son en-tête IHDR. */
const dimensions = (fichier: string) => {
  const octets = readFileSync(path.join(SITE, fichier));
  expect(octets.subarray(1, 4).toString('latin1'), fichier).toBe('PNG');
  return [octets.readUInt32BE(16), octets.readUInt32BE(20)];
};

describe('images de partage', () => {
  it('prévoit une image pour chaque page publique', () => {
    for (const { chemin } of PAGES_SITEMAP) expect(imagePartageDe(chemin).chemin, chemin).toBe(chemin);
  });

  it('livre chaque image prévue, en PNG de 1 200 × 630, dans public/og/', () => {
    for (const image of IMAGES_PARTAGE) {
      expect(image.fichier).toMatch(/^public\/og\/GLO-0[78][\w-]*_1200x630\.png$/);
      expect(existsSync(path.join(SITE, image.fichier)), image.fichier).toBe(true);
      expect(dimensions(image.fichier), image.fichier).toEqual([1200, 630]);
    }
  });

  it('reprend au registre des visuels les mêmes fichiers et les mêmes alts (GLO-07, déclinaisons de GLO-08)', () => {
    expect(visuelParId('GLO-07')).toMatchObject({ fichier: PARTAGE_DEFAUT.fichier, alt: PARTAGE_DEFAUT.alt });
    const declinaisons = visuelParId('GLO-08')?.declinaisons ?? [];
    expect(declinaisons.map(({ fichier, alt }) => ({ fichier, alt }))).toEqual(IMAGES_PARTAGE.filter((i) => i !== PARTAGE_DEFAUT).map(({ fichier, alt }) => ({ fichier, alt })));
  });

  it('donne à chaque image un alt qui nomme Charles et la page, sans « mode d’emploi »', () => {
    for (const image of IMAGES_PARTAGE) {
      expect(image.alt).toMatch(/^Charles Lindecker, /);
      expect(image.alt).not.toMatch(/mode d’emploi/i);
    }
  });

  it('annonce sur chaque page son image et son alt (og:image, og:image:alt)', async () => {
    const pages = await pagesConstruites();
    for (const { chemin } of PAGES_SITEMAP) {
      const construite = pages.find((p) => p.url === chemin);
      expect(construite, chemin).toBeDefined();
      const attendue = imagePartageDe(chemin);
      expect(construite?.html, chemin).toContain(`<meta property="og:image" content="https://charles-lindecker.com${attendue.fichier.replace(/^public/, '')}"`);
      expect(construite?.html, chemin).toContain(`<meta property="og:image:alt" content="${attendue.alt}"`);
    }
    const introuvable = pages.find((p) => p.url === '/404');
    expect(introuvable?.html).toContain(`content="https://charles-lindecker.com${PARTAGE_DEFAUT.fichier.replace(/^public/, '')}"`);
  }, DELAI_BUILD);
});
