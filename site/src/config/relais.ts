/**
 * ÉBAUCHE du socle : remplacée par la page du projet.
 *
 * Données de Relais (/projets/relais) : la carte de la vitrine (CARTE), puis
 * les données de sa page. Ce fichier appartient à la page Relais :
 * config/vitrine.ts et lib/seo.ts ne font que l’importer.
 *
 * Dépôt privé (décision de Charles du 14/10/2026) : aucun lien, aucun nom de
 * dépôt. Faits relus le 14/10/2026 à la révision bdf041f du dépôt
 * (14/10/2026), sauf mention.
 */
import type { EntreeSommaire } from './navigation';
import type { CarteVitrine } from './vitrine';
import type { Decision, DonneesFiche, LienProjet, PreuveEnTete, SchemaProjet } from '../components/projets/gabarit/types';
import angular from '../assets/stacks/angular.svg';
import rust from '../assets/stacks/rust.svg';
import sqlite from '../assets/stacks/sqlite.svg';

/* ------------------------------------------------------------------ */
/* La carte de la vitrine (/projets, famille « IA »)                   */
/* ------------------------------------------------------------------ */

export const CARTE: CarteVitrine = {
  besoin: 'Donner à tous les outils de ma machine un seul point d’accès local à Claude Code et à Codex, avec des abonnements isolés, leurs quotas et leurs permissions.',
  // docs/registre-correctifs.md, l. 3-6 : la base après trois jours de service (21-23/09/2026).
  chiffre: { valeur: '1 011', libelle: 'décisions de permission en trois jours de service', releve: '14 octobre 2026' },
  role: 'Conçu et développé seul',
  statut: { texte: 'Outil personnel, en usage quotidien' },
  liens: [],
  technos: [
    { src: rust, alt: 'Rust', mono: true },
    { src: angular, alt: 'Angular' },
    { src: sqlite, alt: 'SQLite' },
  ],
};

/* ------------------------------------------------------------------ */
/* La page (ÉBAUCHE) : en-tête, fiche, sections, décisions, sortie      */
/* ------------------------------------------------------------------ */

export const EN_TETE = {
  titre: 'Un seul point d’accès aux agents de la machine.',
  chapeau:
    'Relais lance sa propre version de Claude Code et de Codex, isole chaque abonnement, tient leurs quotas et leurs permissions, et garde chaque conversation. Les outils de la machine passent par lui au lieu de lancer leur agent eux-mêmes. Je l’ai conçu et développé seul.',
  liens: [] satisfies LienProjet[],
};

export const PREUVES: readonly PreuveEnTete[] = [
  {
    valeur: '1 011',
    libelle: 'décisions de permission en trois jours de service',
    source: 'Registre des correctifs du dépôt',
    date: 'du 21 au 23/09/2026',
    surligne: true,
    href: '#construit',
  },
  {
    valeur: '52',
    libelle: 'cas d’audit du périmètre de fichiers, conformes une fois un défaut corrigé',
    source: 'Audit des permissions du dépôt',
    date: '20/09/2026',
    href: '#construit',
  },
];

export const FICHE: DonneesFiche = {
  besoin: 'Donner à tous les outils de ma machine un seul point d’accès local aux agents IA, avec des abonnements isolés.',
  part: 'J’ai conçu et développé seul le serveur en Rust et l’interface Angular, avec leurs tests et leur documentation.',
  role: 'Conception et développement',
  periode: 'Depuis septembre 2026',
  equipe: 'Projet personnel, seul',
  statut: { texte: 'Outil personnel, en usage quotidien' },
  liens: [],
};

/** Les sections du corps : sommaire de l’en-tête et navigation de page. */
export const SECTIONS: readonly EntreeSommaire[] = [
  { id: 'apercu', titre: 'En bref' },
  { id: 'construit', titre: 'Comment je l’ai construit' },
  { id: 'retiens', titre: 'Ce que j’en retiens' },
];

export const DECISIONS: readonly Decision[] = [
  {
    contrainte: 'Un orchestrateur confie un dossier en écriture et d’autres en lecture seule, alors que les permissions de l’agent ne sont pas une isolation.',
    choix: 'Relais décide lui-même de chaque lecture et de chaque écriture, sur le chemin réel du fichier : liens, remontées et fichiers à liens multiples refusés.',
    effet: 'Les 52 cas de l’audit sont conformes, et le défaut trouvé a été fermé.',
  },
  {
    contrainte: 'Un outil a recréé une session par minute pendant sept heures, chacune morte en deux secondes.',
    choix: 'Un frein par application et par abonnement : vingt sessions d’affilée, puis une toutes les trois secondes ; trois échecs au démarrage ferment l’abonnement.',
    effet: 'L’abonnement est suspendu, et l’interface montre le démarrage en échec, avec « Réessayer ».',
  },
];

/** Dépôt privé : aucun lien public. */
export const LIENS_SORTIE: readonly LienProjet[] = [];

/** Ce que schema.org dit du projet (lib/seo.ts) : validé en intégration continue sur Windows et macOS. */
export const SCHEMA: SchemaProjet = { type: 'SoftwareApplication', categorie: 'DeveloperApplication', systemes: 'Windows, macOS' };
