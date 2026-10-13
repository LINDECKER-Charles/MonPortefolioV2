import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { visuelParId, VISUELS } from '../../src/config/visuels';
import { COMMANDE, rendreCommande, SORTIE } from '../../tools/generer-visuels.mjs';

/**
 * La commande de production des images (docs/visuels-a-generer.md) est une
 * sortie du registre : ce test échoue si on corrige l’un sans régénérer l’autre.
 */

const MARQUES = /\b(?:pvz|plants vs\.? zombies|riot|league of legends|sony|fromsoftware|trello|b-hive|elan formation|atis|mission locale|shrek|gwent|bloodborne|omnicard|unreal|unity)\b|\b42\b/i;

describe('commande de production des visuels', () => {
  const doc = rendreCommande();

  it('est à jour avec le registre', () => {
    expect(readFileSync(SORTIE, 'utf8'), `lancer ${COMMANDE} dans site/`).toBe(doc);
  });

  it('porte une fiche par visuel, les règles communes et le fichier attendu', () => {
    for (const v of VISUELS) {
      expect(doc, v.id).toContain(`### ${v.id} · `);
      if (v.fichier) expect(doc, v.id).toContain(`site/${v.fichier}`);
    }
    expect((doc.match(/^### /gm) ?? []).length).toBe(127);
    for (let i = 1; i <= 8; i++) expect(doc).toContain(`\n${i}. `);
    expect(doc).toContain('Ne jamais nommer un jeu, un studio ou une marque dans le prompt');
  });

  it('ne met aucun nom de marque dans les titres de fiche ni dans les sujets des images à générer', () => {
    for (const ligne of doc.split('\n')) {
      if (/^### /.test(ligne) || /^- \*\*Sujet/.test(ligne)) {
        const id = /^### ([A-Z]{3}-\w+)/.exec(ligne)?.[1];
        const v = id ? visuelParId(id) : undefined;
        if (v?.methode === 'IMG' && !v.reprend?.length) expect(ligne.replace(/^### [A-Z]{3}-\w+/, ''), ligne).not.toMatch(MARQUES);
      }
    }
  });
});
