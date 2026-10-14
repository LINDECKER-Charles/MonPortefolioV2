import { describe, expect, it } from 'vitest';
import { decoder } from '../../tools/verifier-site.mjs';
import { FORMULATIONS_INTERDITES } from '../../src/config/formulations-interdites';
import { DELAI_BUILD, pagesConstruites } from './support/dist';

/**
 * Garde-fou « posture » : le HTML construit ne contient
 * aucune formulation de recherche d’emploi ou de disponibilité.
 */

/** Forme comparée par les motifs : minuscules, sans accents, apostrophes droites, espaces simples. */
function normaliser(texte: string): string {
  return texte
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[’‘`]/g, '\'')
    .replace(/[  \s]+/g, ' ')
    .toLowerCase();
}

/** Tout ce qu’un lecteur, un moteur ou un lecteur d’écran reçoit d’une page. */
function textePublic(html: string): string {
  const sansCode = html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script\b(?![^>]*application\/(?:ld\+)?json)[^>]*>[\s\S]*?<\/script>/gi, ' ');
  const attributs = [...sansCode.matchAll(/\b(?:alt|title|aria-label|content|placeholder)="([^"]*)"/g)].map((m) => m[1]);
  const texte = sansCode.replace(/<[^>]*>/g, ' ');
  return normaliser(decoder(`${texte} ${attributs.join(' ')}`));
}

function fautesPosture(html: string): string[] {
  const texte = textePublic(html);
  return FORMULATIONS_INTERDITES.flatMap(({ libelle, motif }) => {
    const m = motif.exec(texte);
    return m ? [`formulation interdite « ${libelle} » : « …${texte.slice(Math.max(0, m.index - 30), m.index + m[0].length + 30)}… »`] : [];
  });
}

describe('formulations interdites : le détecteur', () => {
  it.each(FORMULATIONS_INTERDITES.map((f) => [f.libelle, f] as const))('refuse « %s » dans le texte, les attributs et le JSON-LD', (_nom, f) => {
    expect(fautesPosture(`<p>${f.exemple}</p>`), 'texte').not.toEqual([]);
    expect(fautesPosture(`<meta name="description" content="${f.exemple}">`), 'méta').not.toEqual([]);
    expect(fautesPosture(`<img alt="${f.exemple}" src="/a.png">`), 'alt').not.toEqual([]);
    expect(fautesPosture(`<script type="application/ld+json">{"description":"${f.exemple}"}</script>`), 'JSON-LD').not.toEqual([]);
  });

  it('refuse les variantes d’espace, d’accent et d’apostrophe', () => {
    expect(fautesPosture('<p>Je recherche&nbsp;un&nbsp;poste.</p>')).not.toEqual([]);
    expect(fautesPosture('<p>À L’ÉCOUTE DU MARCHÉ</p>')).not.toEqual([]);
    expect(fautesPosture('<p>OPEN TO WORK</p>')).not.toEqual([]);
  });

  it('admet les emplois légitimes de ces mots', () => {
    expect(fautesPosture('<p>Je recherche un champion par son nom.</p>')).toEqual([]);
    expect(fautesPosture('<p>La recherche de l’utilisateur trouve les patchs. Le poste actuel : architecte logiciel.</p>')).toEqual([]);
    expect(fautesPosture('<p>Disponible en français et en anglais. Ouvert à tous les contributeurs.</p>')).toEqual([]);
    expect(fautesPosture('<style>.open-to-work { color: red }</style><script>var x = "open to work"</script>')).toEqual([]);
  });
});

describe('formulations interdites dans le HTML construit', () => {
  it('aucune page n’annonce une recherche de poste ni une disponibilité', async () => {
    const pages = await pagesConstruites();
    const fautes = pages.flatMap(({ url, html }) => fautesPosture(html).map((f) => `${url} : ${f}`));
    expect(fautes).toEqual([]);
  }, DELAI_BUILD);
});
