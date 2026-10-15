import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  fichierMaster,
  fichierMasterNuit,
  fichierNuit,
  MOINS_GENERE,
  LANTERNE_PROMPT,
  NEGATIVE_PROMPT,
  NUIT_EDITION_PROMPT,
  NUIT_FOND_PROMPT,
  NUIT_PROMPT,
  PLANCHE_ESSAI,
  positionLanterne,
  REFERENCES_STYLE,
  REGLES_NUIT,
  STYLE_PROMPT,
  visuelParId,
  VISUELS,
} from '../../src/config/visuels';
import { COMMANDE, rendreCommande, SORTIE } from '../../tools/generer-visuels.mjs';
import { confidentialite } from '../support/prive';

/**
 * La commande de production des images (docs/visuels-a-generer.md) est une
 * sortie du registre et de l’état du disque : ce test échoue si on corrige l’un
 * ou livre un fichier sans régénérer l’autre.
 */

/** Marques refusées, plus celles du cadrage privé (tests/support/prive.ts). */
const MARQUES = new RegExp(String.raw`\b(?:pvz|plants vs\.? zombies|riot|league of legends|sony|fromsoftware|trello|b-hive|karl|claude|codex|elan formation|atis|mission locale|shrek|gwent|bloodborne|omnicard|unreal|unity|${confidentialite().marques.join('|')})\b|\b42\b`, 'i');
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

  it('donne le bloc de style, le prompt négatif et les références avant la série, la planche d’essai en premier', () => {
    const avant = partie('## Avant de commencer', '## Règles communes');
    expect(avant).toContain(STYLE_PROMPT);
    expect(avant).toContain(NEGATIVE_PROMPT);
    expect(STYLE_PROMPT).toMatch(/four posts.*ring.*drop-shaped flame/);
    for (const { fichier } of REFERENCES_STYLE) {
      expect(avant).toContain(fichier);
      expect(() => readFileSync(`${DEPOT}${fichier}`), fichier).not.toThrow();
    }
    for (const id of PLANCHE_ESSAI) expect(partie('## Le déroulé', '## Avant de commencer')).toContain(`\`${id}\``);
  });

  it('porte le retour de Charles du 13 octobre 2026 : moins « image générée » et une nuit dessinée', () => {
    expect(doc).toContain('**Ce document est la seule référence de la série.**');
    expect(STYLE_PROMPT).toContain('Economical line work: large untouched white areas and solid black masses, hatching only in the shadows, slightly irregular hand-cut line ends. Few objects, simple silhouettes, nothing cropped at the edge.');
    expect(NEGATIVE_PROMPT).toContain('glow, halo, light rays, sparkle lines, lens flare, hyper-detailed, intricate micro-detail, uniform texture, digital painting, smooth airbrush, detailed anatomy, fake text lines');
    expect(NUIT_PROMPT).toBe(
      'Same scene and exact same framing, at night: the room is in deep darkness and solid black dominates. The lantern is the only light: its red light falls in red hatching on a small pool around it and on the main subject. Outside this pool, shapes are only suggested by sparse thin white outlines. No large white areas.',
    );
    const moins = partie('## Moins « image générée »', '## Version de nuit');
    for (const regle of MOINS_GENERE) expect(moins).toContain(regle);
    for (const mot of ['Moitié moins de détails', 'papier blanc intact', 'hachures seulement dans les ombres', 'gravure sur bois', 'Aucune lueur, aucun halo, aucun rayon', 'hachures rouges, jamais en voile diffus', 'Mains et silhouettes simplifiées', 'Rien de coupé au bord', 'Aucun motif qui imite du texte']) expect(moins).toContain(mot);
    const nuit = partie('## Version de nuit', '## Règles communes');
    expect(nuit).toContain(NUIT_PROMPT);
    for (const phrase of [...Object.values(NUIT_FOND_PROMPT), ...Object.values(NUIT_EDITION_PROMPT)]) expect(nuit).toContain(phrase);
    for (const regle of REGLES_NUIT) expect(nuit).toContain(regle);
    for (const mot of ['en édition', 'au moins 70 %', 'flaque', 'rares traits blancs fins', 'reste transparent', 'Même cadrage au pixel près']) expect(nuit).toContain(mot);
    expect(doc).not.toMatch(/trait clair sur fond sombre|separer-calques|\.aplat\.webp|\.lumiere\.webp|\.encre\.webp/);
  });

  it('reprend les textes réellement envoyés au générateur pour les 74 paires livrées (README des séries)', () => {
    const dossier = `${DEPOT}design/assets/visuels`;
    const readmes = readdirSync(dossier, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => readFileSync(`${dossier}/${d.name}/README.md`, 'utf8'))
      .join('\n');
    // Le bloc de style ouvre chaque prompt consigné, de jour comme de nuit, tel quel.
    const blocs = readmes.split('\n').filter((ligne) => ligne.startsWith('Reserve wood engraving'));
    expect(blocs.length).toBeGreaterThan(148);
    for (const bloc of blocs) expect(bloc).toBe(STYLE_PROMPT);
    expect(readmes).toContain(`Negative prompt: ${NEGATIVE_PROMPT}`);
    for (const phrase of [NUIT_PROMPT, ...Object.values(NUIT_FOND_PROMPT), ...Object.values(NUIT_EDITION_PROMPT)]) expect(readmes).toContain(phrase);
    // Le calage de la lanterne, tel qu’employé pour PRO-01 (76 % × 30 %).
    expect(readmes).toContain(LANTERNE_PROMPT.replace('{x}', '76').replace('{y}', '30'));
    const avant = partie('## Avant de commencer', '## Règles communes');
    expect(avant).toContain(LANTERNE_PROMPT);
  });

  it('déroule la commande : planche d’essai en jour et nuit, série par série, rendu, vérification et commit', () => {
    const deroule = partie('## Le déroulé', '## Avant de commencer');
    expect(deroule).toMatch(/Étape 0, la planche d’essai.*en jour et en nuit.*six masters.*validée par Charles le 13 octobre 2026/);
    expect(deroule).toContain(`npm run visuels:rendre ${PLANCHE_ESSAI.join(' ')}`);
    expect(deroule).toMatch(/t’arrêter/);
    expect(deroule).toMatch(/série par série/);
    expect(deroule).toContain('à 3 % près');
    expect(deroule).toContain('`npm run visuels -- --verifier` sans écart');
    expect(deroule).toContain('un commit pour la série');
    const livraison = partie('## Livraison', '## Vue d’ensemble');
    expect(livraison).toContain('`npm run visuels:rendre <ID>`');
    expect(livraison).toMatch(/--surface.*--lanterne[\s\S]*--fond.*--encre.*--lanterne/);
    expect(livraison).toMatch(/Commit par série/);
  });

  it('dit, pour chaque image à générer, ses deux masters, ses deux rendus et la place de sa lanterne', () => {
    for (const v of VISUELS.filter((x) => x.methode === 'IMG' && x.fichier)) {
      const bloc = doc.slice(doc.indexOf(`#### ${v.id} · `), doc.indexOf('\n####', doc.indexOf(`#### ${v.id} · `) + 1));
      expect(bloc, v.id).toContain(`- **Masters** : jour \`${fichierMaster(v)}\` ; nuit \`${fichierMasterNuit(v)}\``);
      expect(bloc, v.id).toContain(`\`npm run visuels:rendre ${v.id}\` écrit le jour \`${path.posix.basename(v.fichier!)}\` et la nuit \`${path.posix.basename(fichierNuit(v)!)}\``);
      expect(bloc, v.id).toContain('- **Couleurs de clé, le jour** : encre (#000000) = ');
      const lanterne = positionLanterne(v);
      if (lanterne) expect(bloc, v.id).toMatch(new RegExp(`\\*\\*Lanterne : ${lanterne[0]} % × ${lanterne[1]} %.*[àÀ] 3 % près`));
    }
  });

  it('dit la place de la lanterne en gras quand elle est une contrainte dure', () => {
    for (const v of VISUELS.filter((x) => x.lumiere)) expect(doc, v.id).toContain(`**Lanterne : ${v.lumiere![0]} % × ${v.lumiere![1]} %, contrainte dure**`);
  });

  it('ne met aucun nom de marque dans les titres de fiche ni dans les sujets des images à générer', () => {
    for (const ligne of doc.split('\n')) {
      if (/^#### /.test(ligne) || /^- \*\*Sujet/.test(ligne)) {
        const id = /^#### ([A-Z]{3}-\w+)/.exec(ligne)?.[1];
        const v = id ? visuelParId(id) : undefined;
        if (v?.methode === 'IMG' && !v.reprend?.length) expect(MARQUES.test(ligne.replace(/^#### [A-Z]{3}-\w+/, '')), ligne).toBe(false);
      }
    }
    expect(MARQUES.test(STYLE_PROMPT)).toBe(false);
    expect(MARQUES.test(NEGATIVE_PROMPT)).toBe(false);
  });
});
