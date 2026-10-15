import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Données privées des garde-fous : noms internes, dépôts privés présentés,
 * motifs refusés par page et sources des citations. Le dépôt est public ; ces
 * données vivent dans le dépôt privé LINDECKER-Charles/MonPortefolioV2-cadrage,
 * cloné dans docs/prive/ (ignoré par git, README « Dossier privé »). La CI le
 * récupère en lecture avec une clé de déploiement.
 *
 * Dans un worktree, docs/prive/ est cherché dans le worktree, puis dans le dépôt
 * principal. Sans lui, les garde-fous échouent au lieu de passer à vide.
 *
 * Un message d’échec ne cite jamais une donnée privée : les journaux de la CI
 * sont publics. `motifsTrouves` désigne une faute par le numéro de son motif.
 */

export interface Confidentialite {
  /** Noms jamais écrits sur le site. */
  nomsInternes: readonly string[];
  /** Dépôts privés dont le projet est présenté sans lien ni nom de dépôt. */
  depotsPrivesPresentes: readonly string[];
  /** Motif de l’employeur, refusé sur les pages « IA » hors du nœud de la personne. */
  employeur: string;
  /** Noms ajoutés aux marques refusées dans les consignes d’images. */
  marques: readonly string[];
  /** Motifs refusés sur une page de projet, par identifiant de page. */
  motifsPages: Readonly<Record<string, readonly string[]>>;
}

const RACINE = fileURLToPath(new URL('../../../', import.meta.url));
const TEMOIN = 'confidentialite.json';

function dossiersCandidats(): string[] {
  const dossiers = [path.join(RACINE, 'docs/prive')];
  try {
    const commun = execFileSync('git', ['rev-parse', '--path-format=absolute', '--git-common-dir'], { cwd: RACINE, encoding: 'utf8' }).trim();
    dossiers.push(path.join(path.dirname(commun), 'docs/prive'));
  } catch {
    // Hors d’un dépôt git : seul le dossier de cette copie compte.
  }
  return dossiers;
}

let dossier: string | undefined;

/** Le dossier privé, ou une erreur qui dit comment le poser. */
export function dossierPrive(): string {
  dossier ??= dossiersCandidats().find((d) => existsSync(path.join(d, TEMOIN)));
  if (!dossier) {
    throw new Error('Dossier privé introuvable : cloner LINDECKER-Charles/MonPortefolioV2-cadrage dans docs/prive (README, « Dossier privé »).');
  }
  return dossier;
}

let donnees: Confidentialite | undefined;

export function confidentialite(): Confidentialite {
  donnees ??= JSON.parse(readFileSync(path.join(dossierPrive(), TEMOIN), 'utf8')) as Confidentialite;
  return donnees;
}

/** Un document privé, par son chemin dans le dépôt (`docs/prive/questions.md`) ou son seul nom. */
export function lireDocPrive(chemin: string): string {
  return readFileSync(path.join(dossierPrive(), chemin.replace(/^docs\/prive\//, '')), 'utf8');
}

/** Les motifs refusés sur une page de projet, compilés sans distinction de casse. */
export function motifsPage(page: string): RegExp[] {
  const motifs = confidentialite().motifsPages[page];
  if (!motifs?.length) throw new Error(`Aucun motif privé pour la page ${page}.`);
  return motifs.map((m) => new RegExp(m, 'i'));
}

/** Les motifs présents dans le texte, désignés par leur numéro (« motif privé n°2 »), jamais par leur texte. */
export function motifsTrouves(texte: string, motifs: readonly RegExp[]): string[] {
  return motifs.flatMap((motif, i) => (motif.test(texte) ? [`motif privé n°${i + 1}`] : []));
}
