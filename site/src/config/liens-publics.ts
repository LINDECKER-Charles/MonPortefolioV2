/**
 * Liste blanche des liens publics vers les dépôts GitHub de Charles.
 *
 * Règle : un dépôt n’entre ici que s’il est PUBLIC (vérifié avec
 * `gh repo view LINDECKER-Charles/<dépôt> --json visibility`) et réellement
 * utilisé ou prévu par le cahier des charges de la refonte. Un dépôt privé n’y
 * entre jamais, et aucune page ne le cite ni ne s’en sert comme preuve, sauf
 * les exceptions décidées par Charles : Bloodborne Legendary Run, puis, le
 * 14/10/2026, AutoTicket, Sillage et Relais, présentés sans aucun lien ni
 * nom de dépôt.
 *
 * `tests/unit/liens-publics.test.ts` lit le HTML construit : il échoue sur tout
 * lien `github.com/LINDECKER-Charles/<dépôt>` absent d’ici, sur le dépôt de
 * Bloodborne Legendary Run, sur les dépôts privés présentés et sur les
 * domaines de démos hors ligne. `tests/unit/confidentialite.test.ts` refuse,
 * dans tout le site, les noms qui doivent rester privés. Ces deux listes-là
 * (dépôts privés présentés, noms privés) ne sont pas dans ce dépôt public :
 * elles vivent dans le cadrage privé, lu par `tests/support/prive.ts`.
 *
 * Pour ajouter un dépôt : le vérifier avec `gh`, l’ajouter ici avec la date de
 * vérification, puis lancer `npm test`.
 */

/** Compte GitHub de Charles (son profil, sans dépôt, est toujours admis). */
export const COMPTE_GITHUB = 'LINDECKER-Charles';

export interface DepotPublic {
  /** Nom exact du dépôt, tel que GitHub l’écrit. */
  nom: string;
  /** Pourquoi il figure ici. */
  usage: string;
  /** `lie` : déjà lié depuis le site ; `prevu` : prévu par le cahier des charges, pas encore lié. */
  statut: 'lie' | 'prevu';
  /** Date de la vérification de la visibilité (`gh repo view`). */
  verifie: string;
}

export const DEPOTS_PUBLICS: readonly DepotPublic[] = [
  { nom: 'PVZF-Translation-fr', usage: 'PvZ Fusion : fork de la traduction française, cité dans la note de méthode', statut: 'lie', verifie: '2026-10-13' },
  { nom: 'PVZ-Fuzion-ConsolManager', usage: 'PvZ Fusion : outil Console Manager, rattaché à la page PvZ', statut: 'lie', verifie: '2026-10-13' },
  { nom: 'LeagueOfDataBaseFinal', usage: 'League Of Data Base : le code, après correction de son README', statut: 'lie', verifie: '2026-10-13' },
  { nom: 'public-Omnicard', usage: 'Omnicard : règles et cartes, seul dépôt Omnicard public', statut: 'lie', verifie: '2026-10-13' },
  { nom: 'gup', usage: 'gup : le code, open source', statut: 'lie', verifie: '2026-10-13' },
  { nom: 'ShrekSophone', usage: 'Projets archivés : Shreksophone, clin d’œil (démo GitHub Pages)', statut: 'lie', verifie: '2026-10-13' },
  { nom: 'App.GitHealth', usage: 'GitHealth : carte de la vitrine (famille « Outils ») et sa page', statut: 'lie', verifie: '2026-10-13' },
  { nom: 'app-life-pixel', usage: 'Projets archivés : Life Pixel', statut: 'lie', verifie: '2026-10-13' },
  { nom: 'Web-Image-Formateur', usage: 'Projets archivés : img-convertor', statut: 'lie', verifie: '2026-10-13' },
  { nom: 'Piscine42-Mulhouse-2024', usage: 'Parcours, formation et accueil : piscine de 42 (juillet 2024)', statut: 'lie', verifie: '2026-10-13' },
];

/**
 * Dépôt de Bloodborne Legendary Run : privé. La page du projet ne renvoie
 * jamais vers lui, quel que soit le propriétaire d’un éventuel fork.
 */
export const DEPOT_BLOODBORNE = 'Bloodborne-Legendary-Run';

/**
 * Démos hors ligne : aucun lien ne doit y mener tant qu’elles ne répondent pas
 * (voir `DEMOS` dans `site.ts`). Les retirer d’ici seulement une fois remises
 * en ligne et vérifiées.
 */
export const DOMAINES_HORS_LIGNE: readonly string[] = [
  'omnicard.fr',
  'test.omnicard.fr',
  'modding.pvzf-almanac.com',
  'shrek.charles-lindecker.com',
  '213.210.20.90',
];
