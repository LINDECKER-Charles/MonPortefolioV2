import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { NEGATIVE_PROMPT, PLANCHE_ESSAI, REFERENCES_STYLE, STYLE_PROMPT, visuelParId, VISUELS } from '../../src/config/visuels';
import { COMMANDE, rendreCommande, SORTIE } from '../../tools/generer-visuels.mjs';

/**
 * La commande de production des images (docs/visuels-a-generer.md) est une
 * sortie du registre et de l’état du disque : ce test échoue si on corrige l’un
 * ou livre un fichier sans régénérer l’autre.
 */

const MARQUES = /\b(?:pvz|plants vs\.? zombies|riot|league of legends|sony|fromsoftware|trello|b-hive|elan formation|atis|mission locale|shrek|gwent|bloodborne|omnicard|unreal|unity)\b|\b42\b/i;
const DEPOT = new URL('../../../', import.meta.url).pathname;

describe('commande de production des visuels', () => {
  const doc = rendreCommande();
  const partie = (debut: string, fin: string) => doc.slice(doc.indexOf(debut), doc.indexOf(fin));

  it('est à jour avec le registre et le disque', () => {
    expect(readFileSync(SORTIE, 'utf8'), `lancer ${COMMANDE} dans site/`).toBe(doc);
  });

  it('porte une fiche par visuel, les règles communes et le fichier attendu', () => {
    for (const v of VISUELS) {
      expect(doc, v.id).toContain(`#### ${v.id} · `);
      if (v.fichier && v.methode !== 'FIG') expect(doc, v.id).toContain(`site/${v.fichier}`);
    }
    expect((doc.match(/^#### /gm) ?? []).length).toBe(VISUELS.length);
    for (let i = 1; i <= 8; i++) expect(doc).toContain(`\n${i}. `);
    expect(doc).toContain('Ne jamais nommer un jeu, un studio ou une marque dans le prompt');
  });

  it('ne confie à Codex que des images générées, et à l’équipe tout le reste', () => {
    expect(doc).toContain('Tu produis **uniquement les images générées (IMG)**');
    const codex = partie('## Partie 1', '## Partie 2');
    const equipe = partie('## Partie 2', '## Contexte');
    for (const [, id] of codex.matchAll(/^#### ([A-Z]{3}-\w+) · /gm)) expect(visuelParId(id)?.methode, id).toBe('IMG');
    for (const [, id] of equipe.matchAll(/^#### ([A-Z]{3}-\w+) · /gm)) expect(visuelParId(id)?.methode, id).not.toBe('IMG');
    // Ce qui est livré sort des files de travail.
    for (const id of ['GLO-03', 'GLO-04', 'ACC-14', 'ACC-17', 'LOD-03', 'OMN-04']) {
      expect(codex).not.toContain(`#### ${id} · `);
      expect(equipe).not.toContain(`#### ${id} · `);
    }
    expect(equipe).toMatch(/\*\*Déjà faits\*\* : .*GLO-03.*ACC-14.*ACC-17/);
  });

  it('donne le bloc de style, le prompt négatif, les références et la planche d’essai avant la série', () => {
    const avant = partie('## Avant de commencer', '## Règles communes');
    expect(avant).toContain(STYLE_PROMPT);
    expect(avant).toContain(NEGATIVE_PROMPT);
    expect(STYLE_PROMPT).toMatch(/four posts.*ring.*drop-shaped flame/);
    for (const { fichier } of REFERENCES_STYLE) {
      expect(avant).toContain(fichier);
      expect(() => readFileSync(`${DEPOT}${fichier}`), fichier).not.toThrow();
    }
    for (const id of PLANCHE_ESSAI) expect(avant).toContain(`\`${id}\``);
  });

  it('dit la place de la lanterne en gras quand elle est une contrainte dure', () => {
    for (const v of VISUELS.filter((x) => x.lumiere)) expect(doc, v.id).toContain(`**Lanterne : ${v.lumiere![0]} % × ${v.lumiere![1]} %, contrainte dure**`);
  });

  it('ne met aucun nom de marque dans les titres de fiche ni dans les sujets des images à générer', () => {
    for (const ligne of doc.split('\n')) {
      if (/^#### /.test(ligne) || /^- \*\*Sujet/.test(ligne)) {
        const id = /^#### ([A-Z]{3}-\w+)/.exec(ligne)?.[1];
        const v = id ? visuelParId(id) : undefined;
        if (v?.methode === 'IMG' && !v.reprend?.length) expect(ligne.replace(/^#### [A-Z]{3}-\w+/, ''), ligne).not.toMatch(MARQUES);
      }
    }
    expect(STYLE_PROMPT).not.toMatch(MARQUES);
    expect(NEGATIVE_PROMPT).not.toMatch(MARQUES);
  });
});
