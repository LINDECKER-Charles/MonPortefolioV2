/**
 * Données de la page /projets/gup : textes du gabarit, relevés des figures et
 * liens publics. Chaque fait vient du dépôt public de gup, lu à la release
 * 0.5.3 (commit 0c0e85a du 06/10/2026), ou du registre npm, relevés le
 * 13/10/2026 (docs/matiere-premiere.md, « gup — relevés publics de la page de
 * projet ») ; un fait non sourcé n’entre pas ici.
 *
 * Liens : le dépôt gup (liste blanche, liens-publics.ts), son site GitHub
 * Pages et son paquet npm. Les preuves pointent vers des permaliens figés à la
 * révision relevée, pour qu’un lien ne change pas de sens avec le dépôt.
 *
 * Téléchargements npm : jamais affichés (décision du 13/10/2026). Ils se
 * concentrent les jours de publication et ne mesurent pas un usage.
 */
import type { EntreeSommaire } from './navigation';
import type { PointCapot, DonneesFiche, LienProjet, PreuveEnTete } from '../components/projets/gabarit/types';

/* ------------------------------------------------------------------ */
/* Liens publics                                                       */
/* ------------------------------------------------------------------ */

const DEPOT = 'https://github.com/LINDECKER-Charles/gup';
/** Révision relevée : la release 0.5.3 du 06/10/2026. */
export const REVISION = '0c0e85ab5ee715f1abdea9f08fde243dbe634d9f';
const fige = (chemin: string) => `${DEPOT}/blob/${REVISION}/${chemin}`;

export const LIENS = {
  depot: DEPOT,
  site: 'https://lindecker-charles.github.io/gup/',
  npm: 'https://www.npmjs.com/package/@charles_lindecker/gup',
  architecture: fige('docs/development/architecture.md'),
  decisions: fige('docs/development/architecture.md#notable-decisions'),
  /** L’exception Scoop à la règle « aucun shell », ligne 484 de l’architecture. */
  exceptionScoop: fige('docs/development/architecture.md?plain=1#L484'),
  pourquoi: fige('docs/guide/scope.md#why-it-exists'),
  registre: fige('src/core/registry.ts#L216'),
  catalogue: fige('docs/guide/providers-catalog.md#platform-support'),
  shell: fige('tests/security/shell-usage.test.ts'),
  planification: fige('docs/guide/scheduled-updates.md#how-it-runs'),
  contraste: fige('docs/guide/themes-and-accessibility.md'),
  ci: fige('.github/workflows/ci.yml#L34'),
  langue: fige('docs/guide/configuration.md'),
  notes: fige('docs/releases/README.md'),
  gouvernance: fige('.github/GOVERNANCE.md'),
  contribuer: fige('.github/CONTRIBUTING.md#2-provider-addition-workflow'),
  captures: fige('scripts/screenshots/fixtures/scan.ts'),
  winget: `${DEPOT}/commit/1c6777063b2e4dddf85509668190eceac51a048f`,
  wingetQuestion: `${DEPOT}/commit/f68551f139caeb5bdd20f93331986d625d53e72f`,
  choco: fige('src/providers/os/choco.ts#L84-L106'),
  ruby: fige('src/providers/lang-other/gem.ts#L63-L80'),
  doublons: fige('src/core/superseded.ts#L64'),
  path: fige('docs/releases/0.5.0.md'),
  quatreZero: fige('docs/releases/0.4.0.md'),
  /** Première phrase de la page de cadrage : « gup has one job ». */
  cadrage: fige('docs/guide/scope.md'),
  /** Les deux pull requests extérieures, fusionnées le 20/05/2026. */
  prAdministrateur: `${DEPOT}/pull/22`,
  prChocolatey: `${DEPOT}/pull/23`,
} as const;

/* ------------------------------------------------------------------ */
/* En-tête (gabarit E5 · 1 et 2)                                       */
/* ------------------------------------------------------------------ */

export const EN_TETE = {
  titre: 'Une commande pour mettre à jour toute sa machine.',
  chapeau:
    'Sur un poste de développeur, les logiciels arrivent par des dizaines de canaux, chacun avec sa commande de mise à jour. gup les interroge tous d’un coup, liste ce qui est en retard et lance au même endroit ce que je coche. Je l’ai conçu et je le publie en open source.',
  liens: [{ href: DEPOT, libelle: 'Le code' }] satisfies LienProjet[],
};

export const PREUVES: readonly PreuveEnTete[] = [
  {
    valeur: '153',
    libelle: 'sources de mises à jour, chacune avec ses propres règles',
    source: 'Registre du dépôt',
    date: 'relevé le 13/10/2026',
    surligne: true,
    href: '#regles',
  },
  {
    valeur: '3',
    libelle: 'systèmes testés à chaque pull request : Windows, macOS et Linux',
    source: 'Intégration continue du dépôt',
    date: 'relevé le 13/10/2026',
    href: '#produit',
  },
  {
    valeur: '12',
    libelle: 'versions publiées sur npm',
    source: 'Registre npm',
    date: 'du 19/05/2026 au 06/10/2026',
    href: '#produit',
  },
];

export const FICHE: DonneesFiche = {
  besoin: 'Mettre à jour en une fois tout ce qui est installé sur un poste de développeur, quel que soit l’outil qui l’a installé.',
  part: 'J’ai conçu l’outil et écrit l’essentiel de son code, de son architecture à ses 153 sources, avec ses tests et sa documentation ; je relis les contributions et je publie les versions.',
  role: 'Auteur et mainteneur',
  periode: 'Depuis mai 2026',
  equipe: 'Projet personnel mené par son mainteneur, ouvert aux contributions ; deux pull requests extérieures fusionnées en mai 2026',
  statut: { texte: 'Open source, sur npm', etat: 'ouvert' },
  liens: [
    { href: DEPOT, libelle: 'Le code' },
    { href: LIENS.site, libelle: 'Le site de gup' },
    { href: LIENS.npm, libelle: 'Le paquet npm' },
  ],
};

/** Les sections du corps : sommaire de l’en-tête et navigation de page. */
export const SECTIONS: readonly EntreeSommaire[] = [
  { id: 'probleme', titre: 'Le problème' },
  { id: 'etapes', titre: 'Comment ça se passe' },
  { id: 'essai', titre: 'La démonstration' },
  { id: 'regles', titre: 'Les règles de 153 outils' },
  { id: 'produit', titre: 'Tenu comme un produit' },
  { id: 'construit', titre: 'Sous le capot' },
  { id: 'retiens', titre: 'En une phrase' },
];

/* ------------------------------------------------------------------ */
/* Le problème (GUP-F1)                                                */
/* ------------------------------------------------------------------ */

/**
 * Onze commandes de mise à jour telles que gup les lance (arguments principaux),
 * lues dans les fichiers des sources à la release 0.5.3 (src/providers/…).
 * Les paquets nommés viennent de la machine d’exemple du dépôt.
 */
export const COMMANDES = [
  { source: 'Winget', commande: 'winget upgrade --id Git.Git --exact' },
  { source: 'Chocolatey', commande: 'choco upgrade all -y' },
  { source: 'Scoop', commande: 'scoop update *' },
  { source: 'Homebrew', commande: 'brew upgrade --formula' },
  { source: 'npm', commande: 'npm install -g typescript@latest' },
  { source: 'pipx', commande: 'pipx upgrade-all' },
  { source: 'uv', commande: 'uv tool upgrade --all' },
  { source: 'Cargo', commande: 'cargo install-update -a' },
  { source: 'Rustup', commande: 'rustup update' },
  { source: 'VS Code', commande: 'code --install-extension … --force' },
  { source: 'gcloud', commande: 'gcloud components update --quiet' },
] as const;

/* ------------------------------------------------------------------ */
/* Comment ça se passe : quatre écrans de la vraie application         */
/* ------------------------------------------------------------------ */

export interface Etape {
  id: 'analyser' | 'choisir' | 'mettre-a-jour' | 'trace';
  titre: string;
  texte: string;
  /** Fichier de src/assets/projets/gup/, sans extension. */
  capture: 'scan-progress' | 'confirm-update' | 'update-running' | 'journal-activity';
  /** Ratio natif de la capture, pour la montrer entière. */
  ratio: string;
  alt: string;
  legende: string;
  cible: { x: number; y: number };
  /**
   * La loupe : un détail lisible, posé dans une zone vide de l’écran pour ne
   * rien cacher (sous 560 px, elle passe sous la capture, en pleine largeur).
   * `x`/`y` : centre du détail dans l’image ; `zoom` : 1 / part de la largeur
   * de l’image montrée.
   */
  loupe: { x: number; y: number; zoom: number; largeur: number; ratio: string; coin: 'bas-droite' | 'bas-gauche' | 'haut-droite' | 'haut-gauche'; dessous?: boolean };
}

export const ETAPES: readonly Etape[] = [
  {
    id: 'analyser',
    titre: 'Analyser',
    texte: 'gup interroge toutes les sources en parallèle. Une source en panne ne coûte que sa propre ligne : l’analyse continue.',
    capture: 'scan-progress',
    ratio: '812 / 526',
    alt: 'L’analyse en cours dans gup : neuf sources sur quatorze ont répondu ; Scoop a échoué, les autres annoncent leurs mises à jour.',
    legende: 'Scoop échoue ; les treize autres sources continuent.',
    cible: { x: 31.3, y: 28.8 },
    loupe: { x: 79, y: 33.8, zoom: 2.7, largeur: 60, ratio: '4 / 1', coin: 'bas-droite', dessous: true },
  },
  {
    id: 'choisir',
    titre: 'Choisir',
    texte: 'Je coche un paquet, une source entière ou tout. Avant de lancer, gup annonce les paquets qui demandent les droits administrateur.',
    capture: 'confirm-update',
    ratio: '812 / 526',
    alt: 'La confirmation avant la mise à jour : six paquets cochés, dont un qui demande les droits administrateur, avec une seule invite en fin de lot.',
    legende: 'Une seule demande de droits administrateur, en fin de lot.',
    cible: { x: 15.6, y: 61.1 },
    loupe: { x: 37, y: 62.8, zoom: 2.17, largeur: 60, ratio: '6 / 1', coin: 'bas-droite', dessous: true },
  },
  {
    id: 'mettre-a-jour',
    titre: 'Mettre à jour',
    texte: 'Chaque installation se déroule dans l’application, dans un vrai terminal : la barre de progression et les questions de l’installateur restent visibles.',
    capture: 'update-running',
    ratio: '968 / 594',
    alt: 'La mise à jour en cours : trois paquets faits, PowerToys en téléchargement dans le terminal intégré, deux paquets en attente dont un réservé à l’étape administrateur.',
    legende: 'PowerToys se télécharge dans le terminal intégré.',
    cible: { x: 11.5, y: 54.1 },
    loupe: { x: 25.75, y: 48.4, zoom: 2.15, largeur: 60, ratio: '5 / 1', coin: 'bas-droite', dessous: true },
  },
  {
    id: 'trace',
    titre: 'Garder une trace',
    texte: 'gup tient un journal de ce qu’il a fait et en tire un rapport. Il sait aussi programmer des paquets précis, sans rien laisser tourner en arrière-plan.',
    capture: 'journal-activity',
    ratio: '968 / 594',
    alt: 'Le journal de gup sur douze mois d’exemple : mises à jour réussies, échecs, scans, et une carte des mises à jour par jour.',
    legende: 'Douze mois d’activité, échecs compris.',
    cible: { x: 25, y: 16.9 },
    loupe: { x: 48.5, y: 17.2, zoom: 2, largeur: 60, ratio: '7 / 1', coin: 'bas-droite', dessous: true },
  },
];

/* ------------------------------------------------------------------ */
/* Les règles de 153 outils                                            */
/* ------------------------------------------------------------------ */

export const CAS_PARTICULIERS: readonly { texte: string; trace: LienProjet }[] = [
  {
    texte: 'winget répond dans la langue du système : gup lit aussi sa sortie en français.',
    trace: { href: LIENS.winget, libelle: 'Le commit du 19/05/2026' },
  },
  {
    texte: 'winget peut s’arrêter sur une question (le dossier d’installation) et retenir tout le lot : gup lui interdit d’en poser, et donne la commande à lancer à la main.',
    trace: { href: LIENS.wingetQuestion, libelle: 'Le commit du 06/10/2026' },
  },
  {
    texte: 'Pour Chocolatey, les codes 3010 et 1641 ne sont pas des erreurs : la mise à jour a réussi, un redémarrage est requis.',
    trace: { href: LIENS.choco, libelle: 'La règle dans le code' },
  },
  {
    texte: 'Sur macOS, le Ruby d’Apple est figé par le système : gup l’écarte au lieu d’afficher une quarantaine de mises à jour impossibles.',
    trace: { href: LIENS.ruby, libelle: 'La règle dans le code' },
  },
  {
    texte: 'Un logiciel listé par deux sources n’apparaît qu’une fois, chez celle qui sait le mettre à jour.',
    trace: { href: LIENS.doublons, libelle: 'La règle dans le code' },
  },
  {
    texte: 'Sous Windows, chercher les outils dans le PATH figeait le terminal 3,3 à 3,8 s. Cela prend maintenant 9 ms.',
    trace: { href: LIENS.path, libelle: 'Les notes de la 0.5.0' },
  },
];

/* ------------------------------------------------------------------ */
/* Tenu comme un produit (GUP-F3)                                      */
/* ------------------------------------------------------------------ */

/** Les douze versions publiées sur npm (`npm view @charles_lindecker/gup time`, 13/10/2026). */
export const VERSIONS = [
  { version: '0.1.0', date: '2026-05-19' },
  { version: '0.1.1', date: '2026-05-20' },
  { version: '0.2.0', date: '2026-05-28' },
  { version: '0.2.1', date: '2026-06-22' },
  { version: '0.2.2', date: '2026-07-03' },
  { version: '0.3.0', date: '2026-08-08' },
  { version: '0.3.1', date: '2026-08-08' },
  { version: '0.3.2', date: '2026-08-09' },
  { version: '0.5.0', date: '2026-10-04' },
  { version: '0.5.1', date: '2026-10-04' },
  { version: '0.5.2', date: '2026-10-05' },
  { version: '0.5.3', date: '2026-10-06' },
] as const;

export const PRATIQUES: readonly { titre: string; texte: string; trace: LienProjet }[] = [
  {
    titre: 'Trois systèmes à chaque pull request',
    texte: 'L’intégration continue rejoue les tests sous Windows, macOS et Linux.',
    trace: { href: LIENS.ci, libelle: 'La configuration' },
  },
  {
    titre: 'Une note par version',
    texte: 'Chaque version a ses notes : ce qui change, ce qui casse, comment migrer.',
    trace: { href: LIENS.notes, libelle: 'Les notes de version' },
  },
  {
    titre: 'L’architecture écrite',
    texte: 'Couches, contrats des sources, pipeline de mise à jour et décisions motivées.',
    trace: { href: LIENS.architecture, libelle: 'L’architecture' },
  },
  {
    titre: 'Une gouvernance écrite',
    texte: 'Le projet est mené par son mainteneur ; les décisions se prennent en public, sur les issues et les pull requests.',
    trace: { href: LIENS.gouvernance, libelle: 'La gouvernance' },
  },
  {
    titre: 'Anglais et français',
    texte: 'L’interface parle les deux langues ; les captures de cette page sont en français.',
    trace: { href: LIENS.langue, libelle: 'La configuration' },
  },
];

/* ------------------------------------------------------------------ */
/* Sous le capot (gabarit E5 · 4)                                      */
/* ------------------------------------------------------------------ */

/**
 * Quatre décisions d’architecture, puis les deux choix qui suivaient sous
 * « Et deux choix de plus » (le filtre par système, le contraste), réunis le
 * 15/10/2026 dans la même liste ; GUP-02 dessine les six, dans cet ordre.
 * Extraits : dépôt public, release 0.5.3 (REVISION 0c0e85a), relus le 15/10/2026.
 */
export const CAPOT: readonly PointCapot[] = [
  {
    titre: 'Chaque source dans son fichier, derrière un contrat',
    contrainte: '153 outils, dont certains plantent, bloquent ou répondent n’importe quoi.',
    choix: 'Chaque source dans son propre fichier, derrière un contrat commun, sans dépendre des autres.',
    effet: 'Une source en panne ne perd que sa propre ligne.',
    lien: { href: LIENS.architecture, libelle: 'L’architecture' },
    extrait: {
      fichier: 'src/core/types.ts',
      langage: 'TypeScript',
      code: `export interface Provider {
  readonly id: string;
  readonly displayName: string;
  readonly platforms?: PlatformSet;
  // …
  isAvailable(): Promise<boolean>;
  listOutdated(): Promise<OutdatedPackage[]>;
  update(packageId: string, options?: UpdateOptions): Promise<UpdateOutcome>;
  // …
}`,
    },
  },
  {
    titre: 'Aucun programme lancé par un shell',
    contrainte: 'gup lance des programmes avec des noms de paquets venus de l’extérieur.',
    choix: 'Tous les programmes partent d’un seul point du code, arguments en liste, sans shell. Seul Scoop, qui l’exige, passe par une liste blanche contrôlée ; un test refuse tout nouvel appel à un shell.',
    effet: 'Un nom de paquet reste un argument, jamais une commande.',
    lien: { href: LIENS.shell, libelle: 'Le test de sécurité' },
    extrait: {
      fichier: 'tests/security/shell-usage.test.ts',
      langage: 'TypeScript',
      code: `it("no source file uses child_process directly — runner.ts is the single chokepoint", async () => {
  const files = await walk(SRC_ROOT);
  const offenders: string[] = [];
  for (const file of files) {
    const rel = toPosixRel(file);
    if (rel === "src/core/runner.ts") continue;
    const content = await readFile(file, "utf8");
    if (/from\\s+["']node:child_process["']/.test(content)) offenders.push(rel);
    if (/require\\(["']child_process["']\\)/.test(content)) offenders.push(rel);
  }
  expect(offenders).toEqual([]);
});`,
    },
  },
  {
    titre: 'Un paquet par appel au gestionnaire',
    contrainte: 'Une installation peut échouer ou dépasser son délai au milieu d’un lot.',
    choix: 'Un paquet par appel au gestionnaire, même quand l’outil sait tout mettre à jour d’un coup, au prix de quelques lancements de plus.',
    effet: 'Un échec ne fait tomber qu’une installation, jamais le lot entier.',
    lien: { href: LIENS.decisions, libelle: 'Les décisions notables' },
    extrait: {
      fichier: 'src/core/update/apply-update.ts',
      langage: 'TypeScript',
      code: `async function settledUpdate(
  provider: Provider,
  packageId: string,
  update: UpdateOptions | undefined,
): Promise<UpdateOutcome> {
  try {
    return update ? await provider.update(packageId, update) : await provider.update(packageId);
  } catch (error) {
    return { id: packageId, success: false, message: rejectionMessage(error) };
  }
}`,
    },
  },
  {
    titre: 'Un gup éphémère toutes les 15 minutes',
    contrainte: 'Programmer des mises à jour sans laisser un programme tourner en permanence.',
    choix: 'Le planificateur du système lance un gup éphémère toutes les 15 minutes, seulement si une programmation existe.',
    effet: 'Rien ne tourne en arrière-plan.',
    lien: { href: LIENS.planification, libelle: 'La planification' },
    extrait: {
      fichier: 'src/core/scheduler/scheduler-timing.ts',
      langage: 'TypeScript',
      code: `/**
 *     MAX_RUN_MINUTES + cap  <  TICK_WATCHDOG_MINUTES  <  EXECUTION_TIME_LIMIT_MINUTES
 *          120 + 30          <          170           <             180
 */

/** How often the OS trigger starts a tick: latency against wake-ups. */
export const TICK_INTERVAL_MINUTES = 15;`,
    },
  },
  {
    titre: 'Chaque système voit ses outils',
    texte: 'Une source d’un autre système est grisée et n’est jamais lancée, même si un exécutable du même nom traîne dans le PATH.',
    lien: { href: LIENS.catalogue, libelle: 'Le filtre par système' },
    extrait: {
      fichier: 'src/core/platform/is-supported-on.ts',
      langage: 'TypeScript',
      code: `export function isSupportedOn(
  subject: PlatformScoped,
  platform: NodeJS.Platform = process.platform,
): boolean {
  return subject.platforms === undefined || subject.platforms.includes(platform);
}`,
    },
  },
  {
    titre: 'Lisible partout, couleurs personnalisées comprises',
    texte: '27 thèmes, et chaque texte atteint le contraste WCAG AA, couleurs personnalisées comprises.',
    lien: { href: LIENS.contraste, libelle: 'La garantie de contraste' },
    extrait: {
      fichier: 'src/ui/theme/contrast-rules.ts',
      langage: 'TypeScript',
      code: `/** Minimum ratios: text (WCAG 1.4.3 / 1.4.6) and UI elements (1.4.11, which has no AAA). */
export const CONTRAST_TARGETS: Readonly<Record<ContrastLevel, { text: number; ui: number }>> = {
  AA: { text: 4.5, ui: 3 },
  AAA: { text: 7, ui: 3 },
};`,
    },
  },
];

/* ------------------------------------------------------------------ */
/* Sortie (gabarit E5 · 5)                                             */
/* ------------------------------------------------------------------ */

export const LIENS_SORTIE: readonly LienProjet[] = [
  { href: DEPOT, libelle: 'Le code' },
  { href: LIENS.site, libelle: 'Le site de gup' },
  { href: LIENS.npm, libelle: 'Le paquet npm' },
];
