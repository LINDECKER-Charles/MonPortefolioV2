import { readFileSync } from 'node:fs';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { PAGES_SITEMAP } from '../../src/config/pages';
import { SITE } from '../../src/config/site';
import { DELAI_BUILD, pagesConstruites } from './support/dist';

/**
 * Le manifeste (public/site.webmanifest) rend le site installable : chaque
 * fichier qu’il cite existe aux dimensions qu’il déclare, ses raccourcis
 * mènent à des pages du sitemap, et ses textes suivent ceux du site.
 */

const publicFile = (nom: string) => readFileSync(new URL(`../../public/${nom}`, import.meta.url));
interface Image { src: string; sizes: string; type: string; purpose?: string; form_factor?: string; label?: string }
const manifeste = JSON.parse(publicFile('site.webmanifest').toString('utf8')) as {
  id: string; name: string; short_name: string; description: string; lang: string; start_url: string; scope: string; display: string;
  theme_color: string; icons: Image[]; shortcuts: { name: string; url: string }[]; screenshots: Image[];
};

describe('manifeste de l’application', () => {
  it('remplit ce que Chrome demande pour proposer l’installation', () => {
    expect(manifeste).toMatchObject({ id: '/', name: SITE.nom, lang: SITE.langue, start_url: '/', scope: '/', display: 'standalone', theme_color: SITE.couleurTheme });
    // Sous l’icône, un nom court qui ne se coupe pas (douze signes environ).
    expect(manifeste.short_name.length).toBeLessThanOrEqual(12);
    expect(manifeste.icons.map((icone) => `${icone.sizes} ${icone.purpose}`)).toEqual(expect.arrayContaining(['192x192 any', '512x512 any', '512x512 maskable']));
  });

  it('cite des icônes et des captures qui existent aux dimensions déclarées', async () => {
    for (const image of [...manifeste.icons, ...manifeste.screenshots]) {
      const meta = await sharp(publicFile(image.src)).metadata();
      expect(`${meta.width}x${meta.height}`, image.src).toBe(image.sizes);
      expect(`image/${meta.format}`, image.src).toBe(image.type);
    }
    // Une capture large pour l’ordinateur, une étroite pour le téléphone.
    expect(manifeste.screenshots.map((capture) => capture.form_factor).sort()).toEqual(['narrow', 'wide']);
  });

  it('propose des raccourcis vers des pages du sitemap', () => {
    const chemins = new Set<string>(PAGES_SITEMAP.map((page) => page.chemin));
    for (const raccourci of manifeste.shortcuts) expect(chemins.has(raccourci.url), raccourci.url).toBe(true);
  });

  it('reprend la description de l’accueil', async () => {
    const accueil = (await pagesConstruites()).find((page) => page.url === '/');
    expect(accueil?.page.meta.get('description')?.[0]).toBe(manifeste.description);
  }, DELAI_BUILD);
});
