/**
 * Données de la page /projets/league-of-database : textes du gabarit,
 * relevés des figures, captures et liens publics. Chaque fait vient de
 * docs/matiere-premiere.md (« League Of Database — vérification du 12 octobre
 * 2026 », son complément du 13 octobre et « Relevés publics de la page de
 * projet ») ; un fait non sourcé n’entre pas ici.
 *
 * Liens : l’application à l’apex (`www.` répond par une 301) et le dépôt
 * public LeagueOfDataBaseFinal (liste blanche, liens-publics.ts), en
 * permaliens figés à la révision auditée pour les preuves.
 */
import type { EntreeSommaire } from './navigation';
import type { PointCapot, DonneesFiche, LienProjet, PreuveEnTete } from '../components/projets/gabarit/types';

/* ------------------------------------------------------------------ */
/* Liens publics                                                       */
/* ------------------------------------------------------------------ */

const APPLICATION = 'https://league-of-data-base.com';
const DEPOT = 'https://github.com/LINDECKER-Charles/LeagueOfDataBaseFinal';
/** Révision publique auditée (12/10/2026). */
const REVISION = '1c9b44703283a482fdcc6ffc5984a6777d66cfe0';
const fige = (chemin: string) => `${DEPOT}/blob/${REVISION}/${chemin}`;

export const LIENS = {
  application: `${APPLICATION}/fr/`,
  patchs: `${APPLICATION}/fr/patches`,
  aPropos: `${APPLICATION}/fr/about`,
  ahriAncien: `${APPLICATION}/fr/3.6.14/champions/Ahri`,
  ahriActuel: `${APPLICATION}/fr/16.20.1/champions/Ahri`,
  catalogueAncien: `${APPLICATION}/fr/3.6.14/champions`,
  catalogueActuel: `${APPLICATION}/fr/16.20.1/champions`,
  recette: `${APPLICATION}/fr/16.20.1/items/3089-rabadons-deathcap`,
  code: DEPOT,
  heritage: fige('docs/reecriture/heritage.md'),
  decisions: `${DEPOT}/tree/${REVISION}/docs/reecriture/adr`,
  adr1: fige('docs/reecriture/adr/0001-reecriture-dotnet-angular.md'),
  parite: fige('docs/reecriture/rapports/parite-lot-1.md'),
  langues: fige('src/LoDb.Domain/Languages/LanguageFallback.cs'),
  medias: fige('src/LoDb.Ingestion/Catalog/Hotlinks/ChampionHotlinks.cs'),
  routage: fige('docker/nginx/sites/site.conf#L104'),
  rendus: fige('docs/guides/configuration.md#L233'),
  ingestion: fige('src/LoDb.Ingestion/Pipeline/Versions/VersionIngestion.cs#L102'),
  mesure: fige('docs/changelog/2026/2026-10-11-mesure-audience-umami.md'),
  sauvegardes: fige('docs/guides/sauvegardes.md#L3'),
  migration: fige('docs/guides/configuration.md#L537'),
  ci: fige('.github/workflows/ci.yml#L12'),
} as const;

/* ------------------------------------------------------------------ */
/* En-tête (gabarit E5 · 1 et 2)                                       */
/* ------------------------------------------------------------------ */

export const EN_TETE = {
  titre: 'Retrouver le jeu tel qu’il était.',
  chapeau:
    'League of Legends change à chaque patch : ses champions, ses objets, leurs chiffres. J’ai construit League Of Data Base pour retrouver ces valeurs telles qu’elles étaient, patch par patch et dans sa langue. Puis je l’ai entièrement réécrit, sans perdre un compte.',
  liens: [
    { href: LIENS.application, libelle: 'L’application' },
    { href: LIENS.code, libelle: 'Le code' },
  ] satisfies LienProjet[],
};

export const PREUVES: readonly PreuveEnTete[] = [
  {
    valeur: '403',
    libelle: 'patchs consultables, du 0.151.2 au 16.20.1',
    source: 'Historique public de l’application',
    date: 'relevé le 13/10/2026',
    surligne: true,
    href: '#versions',
  },
  { valeur: '21', libelle: 'langues, celles que publie Riot', source: 'Page « À propos » de l’application', date: 'relevé le 13/10/2026' },
  {
    valeur: '12 260',
    libelle: 'écarts entre les deux versions, tous classés avant la bascule',
    source: 'Rapport de parité public',
    date: '26/09/2026',
    href: '#reecriture',
  },
];

export const FICHE: DonneesFiche = {
  besoin: 'Retrouver les valeurs exactes d’un ancien patch de League of Legends, dans sa langue.',
  part: 'Tout, seul : la conception, le développement et l’exploitation, puis la réécriture complète et sa bascule en production.',
  role: 'Concepteur, développeur et exploitant',
  periode: 'Dépôt actuel depuis août 2025, réécrit en 2026',
  equipe: 'Seul',
  statut: { texte: 'En ligne', etat: 'actif' },
  liens: [
    { href: LIENS.application, libelle: 'Application' },
    { href: LIENS.code, libelle: 'Code' },
    { href: LIENS.patchs, libelle: 'Les patchs' },
  ],
};

/** Les sections du corps : sommaire de l’en-tête et navigation de page. */
export const SECTIONS: readonly EntreeSommaire[] = [
  { id: 'versions', titre: 'Ahri, d’un patch à l’autre' },
  { id: 'anciennes-fiches', titre: 'Tout un état du jeu' },
  { id: 'champions', titre: 'Les fiches à explorer' },
  { id: 'plateforme', titre: 'Autour de l’encyclopédie' },
  { id: 'donnees', titre: 'Les pièges des données' },
  { id: 'reecriture', titre: 'La réécriture' },
  { id: 'fabrication', titre: 'En production' },
  { id: 'construit', titre: 'Sous le capot' },
  { id: 'retiens', titre: 'Ce que j’en retiens' },
];

/* ------------------------------------------------------------------ */
/* Ahri entre deux patchs (LOD-F1)                                     */
/* ------------------------------------------------------------------ */

export interface LigneComparaison {
  libelle: string;
  ancien: string;
  actuel: string;
  /** Une valeur chiffrée (grand corps, chiffres tabulaires). */
  chiffre?: boolean;
  /** Le seul surlignage de la comparaison. */
  surligne?: boolean;
}

/** Fiches /fr/3.6.14/champions/Ahri et /fr/16.20.1/champions/Ahri, niveau 1, relevées le 13/10/2026. */
export const COMPARAISON: readonly LigneComparaison[] = [
  { libelle: 'Titre', ancien: 'Renard à neuf queues', actuel: 'Renarde à neuf queues' },
  { libelle: 'Points de vie', ancien: '380', actuel: '590', chiffre: true, surligne: true },
  { libelle: 'Attaque', ancien: '50', actuel: '53', chiffre: true },
  { libelle: 'Armure', ancien: '11', actuel: '21', chiffre: true },
  { libelle: 'Mana', ancien: '230', actuel: '418', chiffre: true },
  {
    libelle: 'Passif, Vol essentiel',
    ancien: 'À 9 charges, le sort suivant a un effet de Sort vampirique de 35\u00a0%.',
    actuel: 'Ahri récupère des PV après 9 sbires ou monstres tués, et davantage après une élimination.',
  },
  { libelle: 'Ultime, recharge', ancien: '110 / 95 / 80\u00a0s', actuel: '140 / 120 / 100\u00a0s' },
];

export const PATCHS = {
  ancien: { numero: '3.6.14', precision: 'le plus ancien des patchs 3.x', href: LIENS.ahriAncien, capture: 'ahri-archive-statistiques' },
  actuel: { numero: '16.20.1', precision: 'le patch actuel, au 13/10/2026', href: LIENS.ahriActuel, capture: 'ahri-actuel-statistiques' },
} as const;

/* ------------------------------------------------------------------ */
/* Tout un état du jeu : les trois langues                             */
/* ------------------------------------------------------------------ */

export const LANGUES = [
  { id: 'fr', nom: 'Français', accessible: 'Français', adjectif: 'française', langue: 'français', capture: 'ahri', titre: 'Ahri', sousTitre: 'Renarde à neuf queues' },
  { id: 'en', nom: 'English', accessible: 'Anglais', adjectif: 'anglaise', langue: 'anglais', capture: 'ahri-langue-anglaise', titre: 'Ahri', sousTitre: 'the Nine-Tailed Fox' },
  { id: 'ko', nom: '한국어', accessible: 'Coréen', adjectif: 'coréenne', langue: 'coréen', capture: 'ahri-langue-coreenne', titre: '아리', sousTitre: '구미호' },
] as const;

export const lienLangue = (id: string) => `${APPLICATION}/${id}/16.20.1/champions/Ahri`;

/* ------------------------------------------------------------------ */
/* Les fiches à explorer                                               */
/* ------------------------------------------------------------------ */

export const FICHES = [
  {
    nom: 'ahri',
    titre: 'Le champion',
    adresse: 'fr/champions/Ahri',
    alt: 'La fiche d’Ahri au patch 16.20.1 : son titre, ses rôles et ses caractéristiques.',
    legende: 'Ahri, ses rôles et ses caractéristiques.',
  },
  {
    nom: 'ahri-capacites',
    titre: 'Ses capacités',
    adresse: 'fr/champions/Ahri',
    alt: 'Les capacités d’Ahri au patch 16.20.1, leurs descriptions et leurs valeurs.',
    legende: 'Les effets, les valeurs et les temps de récupération.',
  },
  {
    nom: 'ahri-skins',
    titre: 'Ses apparences',
    adresse: 'fr/champions/Ahri',
    alt: 'La galerie des apparences d’Ahri et leurs chromas, au patch 16.20.1.',
    legende: 'Les illustrations du jeu, réunies dans une galerie.',
  },
  {
    nom: 'ahri-skin-detail',
    titre: 'En grand',
    adresse: 'fr/champions/Ahri',
    alt: 'L’apparence Ahri dynastique ouverte en grand dans la visionneuse de l’application.',
    legende: 'Une apparence ouverte dans la visionneuse de l’application.',
  },
  {
    nom: 'objet-recette',
    titre: 'Un objet',
    adresse: 'fr/items/3089-rabadons-deathcap',
    alt: 'La fiche de la Coiffe de Rabadon au patch 16.20.1 : 3 500 pièces d’or et une recette de deux Baguettes trop grosses.',
    legende: 'La Coiffe de Rabadon et sa recette : chaque composant ouvre sa fiche.',
    lien: { href: LIENS.recette, libelle: 'Ouvrir la recette' },
  },
  {
    nom: 'runes',
    titre: 'Les runes',
    adresse: 'fr/runes/8000-precision',
    alt: 'L’arbre Précision et les effets de la rune Attaque soutenue, au patch 16.20.1.',
    legende: 'L’arbre Précision et ses runes ; les sorts d’invocateur ont aussi leurs fiches.',
  },
] as const;

/* ------------------------------------------------------------------ */
/* Autour de l’encyclopédie (page À propos, relevée le 13/10/2026)     */
/* ------------------------------------------------------------------ */

export interface FonctionPlateforme {
  titre: string;
  texte: string;
}

export const PLATEFORME: readonly FonctionPlateforme[] = [
  {
    titre: 'Des builds partagés',
    texte: 'Un éditeur pour composer un build d’objets étape par étape, puis le partager par un lien. Les builds se votent, un profil public les rassemble.',
  },
  { titre: 'Les tendances', texte: 'Les fiches les plus consultées du site : une mesure de l’attention, pas des statistiques de parties.' },
  {
    titre: 'Une API publique',
    texte: 'Une API REST en JSON pour les profils publics, les builds partagés et les tendances, avec une offre gratuite.',
  },
  {
    titre: 'Gratuit, sans publicité',
    texte: 'Le site vit de dons volontaires et s’installe comme une application web.',
  },
];

/* ------------------------------------------------------------------ */
/* Ce que les données ne disent pas (héritage § 5 et § 6)              */
/* ------------------------------------------------------------------ */

export const PIEGES = [
  { visuel: 'LOD-03', piege: 'Des runes absentes avant le 7.22.1', reponse: 'Un jeu vide est enregistré : la page reste propre, jamais en erreur.' },
  { visuel: 'LOD-06', piege: 'Des langues absentes de nombreuses versions', reponse: 'La fiche se replie sur l’anglais, la seule langue présente partout.' },
  { visuel: 'LOD-07', piege: 'Des objets en double pour LoL Classic', reponse: 'Une édition à part entière, liée à son jumeau.' },
  { visuel: 'LOD-08', piege: 'Des illustrations et des vidéos sans version', reponse: 'Un avertissement le dit sous chaque capacité.' },
  { visuel: 'LOD-09', piege: 'Une erreur passagère chez Riot', reponse: 'Elle n’est jamais enregistrée comme une absence.' },
] as const;

/* ------------------------------------------------------------------ */
/* La réécriture (LOD-F6)                                              */
/* ------------------------------------------------------------------ */

export const JALONS = [
  {
    date: '2025-08-03',
    libelle: 'Août 2025',
    titre: 'Le dépôt actuel',
    texte: 'Symfony, Go et Vue : trois langages.',
    visuel: 'LOD-05',
    logos: ['symfony', 'go', 'vuejs'],
    /**
     * Premier commit du dépôt actuel. Un premier collecteur public date de mai 2025 :
     * le jalon dit « le dépôt actuel » plutôt que « première version » (retour du 15/10/2026).
     */
  },
  { date: '2026-09-24', libelle: '24/09/2026', titre: 'Dix décisions écrites', texte: '.NET 10 et Angular 22 : deux langages au lieu de trois, une seule API.', visuel: 'LOD-10', logos: [] },
  { date: '2026-09-26', libelle: '26/09/2026', titre: 'Parité vérifiée', texte: '75 couples (version, langue) comparés : 12\u00a0260 écarts, tous classés.', visuel: 'LOD-11', logos: [] },
  { date: '2026-10-04', libelle: '04/10/2026', titre: 'Bascule en production', texte: 'Version 3.0.0 : comptes, builds, favoris et clés d’API intacts.', visuel: 'LOD-12', logos: ['dotnet', 'angular'] },
] as const;

/* ------------------------------------------------------------------ */
/* Sous le capot (gabarit E5 · 4)                                      */
/* ------------------------------------------------------------------ */

/**
 * Extraits : dépôt public LeagueOfDataBaseFinal, à la révision auditée
 * (REVISION, 12/10/2026), relus le 15/10/2026.
 */
export const CAPOT: readonly PointCapot[] = [
  {
    titre: 'Chaque piège des données devient une règle',
    contrainte: 'Riot publie ses données telles quelles : fichiers manquants, langues absentes, objets en double.',
    choix: 'Chaque piège devient une règle et un test ; une absence définitive est enregistrée, une erreur passagère jamais.',
    effet: '403 patchs lisibles, même incomplets.',
    lien: { href: LIENS.heritage, libelle: 'Les pièges, dans le dépôt' },
    extrait: {
      fichier: 'src/LoDb.Ingestion/Egress/EgressFetcher.cs',
      langage: 'C#',
      code: `var status = response.StatusCode;
response.Dispose();
return status is HttpStatusCode.Forbidden or HttpStatusCode.NotFound
    ? new FetchOutcome.Absent((int)status)
    : throw new EgressTransientException($"Upstream answered {(int)status}.", status);`,
    },
  },
  {
    titre: 'Deux caches : le patch du jour et les archives',
    contrainte: 'Une visite des archives ne doit pas chasser le patch actuel du cache.',
    choix: 'Deux caches séparés, un rendu par adresse et des rendus simultanés bornés.',
    effet: 'Les archives sans ralentir le patch du jour.',
    lien: { href: LIENS.routage, libelle: 'Le routage du cache' },
    extrait: {
      fichier: 'docker/nginx/sites/site.conf',
      langage: 'nginx',
      code: `# The latest patch's pages (snippets/page-cache.conf) …
proxy_cache_path /var/cache/nginx/pages levels=1:2 use_temp_path=off
                 keys_zone=lodb_pages:\${LODB_PAGE_CACHE_KEYS_SIZE} …;
# The past patches' pages (snippets/archive-cache.conf) … a sweep of every
# patch cannot evict the latest patch's pages.
proxy_cache_path /var/cache/nginx/archive levels=1:2 use_temp_path=off
                 keys_zone=lodb_archive:\${LODB_ARCHIVE_CACHE_KEYS_SIZE} …;`,
    },
  },
  {
    titre: 'Comparer les deux moteurs avant de basculer',
    contrainte: 'Changer tout le moteur sans perdre un compte ni un lien.',
    choix: 'Comparer les deux versions sur 75 couples (version, langue) avant de basculer.',
    effet: '12 260 écarts classés, aucun défaut neuf.',
    lien: { href: LIENS.parite, libelle: 'Le rapport de parité' },
    extrait: {
      fichier: 'docs/reecriture/rapports/parite-lot-1.md',
      langage: 'Markdown',
      code: `**Résultat** : 12 260 écarts, tous classés. Aucun n'est un défaut de la nouvelle stack.
Trois règles couvrent 328 défauts de l'ancienne stack que la nouvelle corrige
volontairement ; trois règles couvrent 11 932 écarts attendus, tous dus au stockage
paresseux de l'ancienne stack.`,
    },
  },
];

/* ------------------------------------------------------------------ */
/* Sortie (gabarit E5 · 5)                                             */
/* ------------------------------------------------------------------ */

export const LIENS_SORTIE: readonly LienProjet[] = [
  { href: LIENS.application, libelle: 'Explorer l’application' },
  { href: LIENS.patchs, libelle: 'L’historique des 403 patchs' },
  { href: LIENS.code, libelle: 'Le code' },
  { href: LIENS.parite, libelle: 'Le rapport de parité' },
  { href: LIENS.decisions, libelle: 'Les dix décisions de la réécriture' },
];
