/**
 * La vitrine de la refonte : quatre familles, dans l’ordre de la page, et
 * dans chaque famille l’ordre de ce que chaque projet prouve (décision de
 * Charles du 14/10/2026, qui remplace l’ordre du 13/10/2026). Le nom
 * canonique de chaque projet (règle E6) s’écrit ici, une fois : le gabarit des
 * pages de projet (components/projets/gabarit) en tire le fil d’Ariane,
 * l’en-tête et le projet précédent ou suivant ; la vitrine (/projets), ses
 * sections, son index et ses rangs ; les images de partage, leur titre.
 *
 * Ce fichier n’importe que des types (`import type`) : tools/generer-partage.mjs
 * le lit sous Node, sans compilation.
 */
import type { LienProjet } from '../components/projets/gabarit/types';

/** Les familles de la vitrine. */
export type FamilleProjet = 'equipe' | 'jeu' | 'outils' | 'ia';

/**
 * Les familles, dans l’ordre de la page. Charles a écrit « Lead & Equipe »,
 * « Orienter gamedev », « Outil » et « IA » : « gamedev » se dit « Jeu vidéo »
 * (pas d’anglais), « & » s’écrit « et ».
 */
export const FAMILLES_PROJETS: readonly { id: FamilleProjet; titre: string }[] = [
  { id: 'equipe', titre: 'Lead et équipe' },
  { id: 'jeu', titre: 'Jeu vidéo' },
  { id: 'outils', titre: 'Outils' },
  { id: 'ia', titre: 'IA' },
];

export interface ProjetVitrine {
  id: 'pvz' | 'omnicard' | 'bloodborne' | 'league' | 'gup' | 'githealth' | 'autoticket' | 'sillage' | 'relais';
  famille: FamilleProjet;
  /** Nom canonique, repris partout. */
  nom: string;
  href: `/projets/${string}`;
  /** Étiquette de preuve : ce que le projet prouve. */
  preuve: string;
  /**
   * Dépôt privé, présenté sans lien vers son code ni nom de dépôt (décision du
   * 14/10/2026, exception à la règle de confidentialité, comme Bloodborne
   * Legendary Run) : sa fiche le dit à la place des liens publics.
   */
  prive?: true;
}

/**
 * Rangée famille par famille, dans l’ordre de FAMILLES_PROJETS : le rang, le
 * précédent et le suivant suivent cette seule suite, d’une famille à l’autre.
 * Les étiquettes de GitHealth, AutoTicket, Sillage et Relais, proposées le
 * 14/10/2026, sont validées telles qu’affichées le 15/10/2026.
 */
export const VITRINE: readonly ProjetVitrine[] = [
  { id: 'pvz', famille: 'equipe', nom: 'PvZ Fusion, pôle francophone', href: '/projets/pvz-fusion', preuve: 'Une équipe formée et menée' },
  { id: 'omnicard', famille: 'jeu', nom: 'Omnicard', href: '/projets/omnicard', preuve: 'Réinventer' },
  { id: 'bloodborne', famille: 'jeu', nom: 'Bloodborne Legendary Run', href: '/projets/bloodborne-legendary-run', preuve: 'Un produit de bout en bout' },
  { id: 'league', famille: 'jeu', nom: 'League Of Data Base', href: '/projets/league-of-database', preuve: 'Un système en production' },
  { id: 'gup', famille: 'outils', nom: 'gup', href: '/projets/gup', preuve: 'Un outil open source' },
  { id: 'githealth', famille: 'outils', nom: 'GitHealth', href: '/projets/githealth', preuve: 'Une application de bureau' },
  { id: 'autoticket', famille: 'ia', nom: 'AutoTicket', href: '/projets/autoticket', preuve: 'Automatiser des tâches', prive: true },
  { id: 'sillage', famille: 'ia', nom: 'Sillage', href: '/projets/sillage', preuve: 'Orchestrer des agents IA', prive: true },
  { id: 'relais', famille: 'ia', nom: 'Relais', href: '/projets/relais', preuve: 'Encadrer des agents IA', prive: true },
];

/** La vedette de la vitrine : la carte pleine largeur, dont le chiffre tient au premier écran (E1). */
export const VEDETTE: ProjetVitrine['id'] = 'pvz';

/** Les familles et leurs projets, dans l’ordre de VITRINE. */
export const VITRINE_PAR_FAMILLE = FAMILLES_PROJETS.map((famille) => ({
  ...famille,
  projets: VITRINE.filter((projet) => projet.famille === famille.id),
}));

/** Le titre d’une famille. */
export function titreDeFamille(id: FamilleProjet): string {
  const famille = FAMILLES_PROJETS.find((f) => f.id === id);
  if (!famille) throw new Error(`Famille « ${id} » absente de FAMILLES_PROJETS (config/projets.ts).`);
  return famille.titre;
}

/**
 * Un projet de la vitrine, son rang (à partir de 1), sa famille et ses voisins
 * dans l’ordre de VITRINE, sans boucler.
 */
export function projetDeLaVitrine(id: ProjetVitrine['id']) {
  const index = VITRINE.findIndex((projet) => projet.id === id);
  if (index < 0) throw new Error(`Projet « ${id} » absent de VITRINE (config/projets.ts).`);
  const projet = VITRINE[index];
  return {
    projet,
    rang: index + 1,
    famille: { id: projet.famille, titre: titreDeFamille(projet.famille) },
    precedent: index > 0 ? VITRINE[index - 1] : undefined,
    suivant: index < VITRINE.length - 1 ? VITRINE[index + 1] : undefined,
  };
}

/**
 * Un projet sorti de la vitrine, rangé dans le volet replié « Projets
 * archivés » (components/vitrine/ArchivesProjets.astro) : il garde sa page et
 * son adresse (`page`), ou, s’il n’en a jamais eu, ses liens publics (`liens` :
 * dépôt de la liste blanche, démo en ligne).
 */
export type ProjetArchive = {
  /** Identifiant de l’entrée, et son ancre dans /projets. */
  id: string;
  nom: string;
  /** Une phrase : ce que fait le projet. */
  resume: string;
  /** Emplacement du registre des visuels (sa vignette), gardé à l’archivage. */
  visuel?: string;
  /** Nom de dépôt technique (« img-convertor ») : composé en linéale, son trait d’union ne s’ouvre pas. */
  technique?: true;
} & ({ page: `/projets/${string}`; liens?: never } | { page?: never; liens: readonly LienProjet[] });

/**
 * Les projets archivés. Life Pixel, img-convertor et Shreksophone quittent la
 * rangée « Aussi » (décision de Charles du 14/10/2026) avec leur vignette
 * (PRJ-07, PRJ-08, PRJ-10) et leurs liens publics ; leurs phrases viennent de
 * la matière première et des README publics. La démo de Shreksophone est
 * servie par GitHub Pages (réponse 200 vérifiée le 13/10/2026), pas par
 * l’ancien domaine bloqué.
 */
export const PROJETS_ARCHIVES: readonly ProjetArchive[] = [
  {
    id: 'life-pixel',
    nom: 'Life Pixel',
    visuel: 'PRJ-07',
    resume: 'Un éditeur d’animations en pixel art qui exporte des lecteurs WebAssembly sans dépendance, avec un serveur MCP.',
    liens: [{ href: 'https://github.com/LINDECKER-Charles/app-life-pixel', libelle: 'Le code' }],
  },
  {
    id: 'img-convertor',
    nom: 'img-convertor',
    technique: true,
    visuel: 'PRJ-08',
    resume: 'Convertir un dossier d’images et en tirer les déclinaisons adaptées à chaque largeur d’écran (WebP, AVIF…).',
    liens: [{ href: 'https://github.com/LINDECKER-Charles/Web-Image-Formateur', libelle: 'Le code' }],
  },
  {
    id: 'shreksophone',
    nom: 'Shreksophone',
    visuel: 'PRJ-10',
    resume: 'Un clic, et l’interface laisse place à Shrek au saxophone. Volontairement absurde.',
    liens: [
      { href: 'https://lindecker-charles.github.io/ShrekSophone/', libelle: 'La démo' },
      { href: 'https://github.com/LINDECKER-Charles/ShrekSophone', libelle: 'Le code' },
    ],
  },
];
