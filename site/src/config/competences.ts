/**
 * Compétences de Charles (/parcours/competences), en trois niveaux, puis
 * l’intégration IA, les tests et la livraison, et les compétences humaines.
 *
 * Inventaire public vérifié le 2026-10-09 : docs/matiere-premiere.md
 * (« Stack déclarée (CV) », « Actualisation des technologies », « Compétences
 * IA »). Les technologies des forks sont retenues seulement sur contribution
 * attestée.
 *
 * Hiérarchie en trois niveaux (cahier, § 5.10 ; Q9) : proposée à partir de la
 * stack déclarée du CV, actualisée par l’audit public, et gardée par Charles
 * à sa relecture du 15/10/2026 (plus de marque « à confirmer »).
 *   - Au quotidien : le cœur et les ops du CV, en grandes tuiles ;
 *   - Pratiqué : le reste du CV et ce que mes projets mettent en œuvre
 *     (Rust, Axum, Tokio et SQLx portent Life Pixel et l’API de ce site ;
 *     React porte gup) ;
 *   - Exploré ou ponctuel : exercices, essais, contributions ciblées.
 * Aucun niveau n’est une note de maîtrise : chaque technologie garde un logo
 * (ou un picto de repli) et le lien de son site officiel.
 */

export interface TechnoQuotidien {
  nom: string;
  /** Ce que la technologie fait dans ma stack, en deux ou trois mots. */
  role: string;
}

export const QUOTIDIEN = [
  { nom: 'C#', role: 'Langage' },
  { nom: '.NET', role: 'Plateforme et API' },
  { nom: 'Angular', role: 'Interfaces' },
  { nom: 'TypeScript', role: 'Langage' },
  { nom: 'PostgreSQL', role: 'Données' },
  { nom: 'Docker', role: 'Conteneurs' },
  { nom: 'Git', role: 'Versions' },
  { nom: 'GitHub Actions', role: 'Intégration continue' },
] as const;

/**
 * Pratiqué, par famille. Les trois familles du milieu (web, backend, données)
 * sont coiffées par le schéma « Interface ↔ API ↔ Données » de la page.
 */
export const PRATIQUE = [
  { nom: 'Langages', outils: ['JavaScript', 'PHP', 'Python', 'Java', 'Rust', 'SQL'] },
  { nom: 'Web et interfaces', outils: ['HTML', 'CSS', 'Sass', 'Tailwind CSS', 'RxJS', 'GSAP', 'React'] },
  { nom: 'Backend et API', outils: ['ASP.NET Core', 'SignalR', 'Node.js', 'Symfony', 'Spring Boot', 'Twig', 'Axum', 'Tokio'] },
  { nom: 'Données', outils: ['EF Core', 'MySQL', 'SQLite', 'Doctrine', 'SQLx'] },
  { nom: 'Mobile', outils: ['Ionic', 'Capacitor'] },
] as const;

/** Exploré ou ponctuel, rangé par famille (langages, web, API, données, bureau, outils). */
export const EXPLORE = [
  'Vue.js', 'Go', 'C', 'WebAssembly',
  'Express', 'FastAPI', 'API Platform',
  'Stockage S3 compatible',
  'Tauri', 'Photino.NET',
  'Leaflet', 'Chart.js',
  'Bash', 'sharp', 'Pillow', 'Dompdf', 'OpenTUI', 'Make', 'GCC',
] as const;

/**
 * Intégration IA : ce que mes projets publics font, sans entraînement de
 * modèle (pas de fine-tuning, de RAG ni de transcription attestés).
 */
export const DOMAINES_IA = [
  { nom: 'Assistants et agents', picto: 'agents', outils: ['Claude', 'Codex'], points: ['Développement assisté', 'Intégration CLI', 'Prompts et contexte', 'Veille automatisée'] },
  { nom: 'Intégration aux applications', picto: 'mcp', outils: ['MCP'], points: ['Serveurs et outils MCP', 'Schémas JSON', 'Permissions et quotas'] },
  { nom: 'Synthèse vocale', picto: 'voix', outils: ['Kokoro', 'Piper'], points: ['Modèles auto-hébergés', 'Streaming audio', 'Cache des générations'] },
] as const;

export const DOMAINES_QUALITE = [
  { nom: 'Tests et qualité', outils: ['xUnit', 'Vitest', 'PHPUnit', 'pytest', 'Playwright', 'Karma', 'Jasmine', 'axe-core', 'ESLint', 'Prettier'] },
  { nom: 'Livraison et observabilité', outils: ['Linux', 'Apache', 'Nginx', 'Caddy', 'Vite', 'OpenTelemetry', 'Prometheus'] },
] as const;

type Technologie =
  | (typeof QUOTIDIEN)[number]['nom']
  | (typeof PRATIQUE)[number]['outils'][number]
  | (typeof EXPLORE)[number]
  | (typeof DOMAINES_IA)[number]['outils'][number]
  | (typeof DOMAINES_QUALITE)[number]['outils'][number];

// Sites des éditeurs, mainteneurs ou organismes de normalisation vérifiés le 2026-10-09 ;
// SQL et stockage S3 revus le 2026-10-13 : documentations publiques de ce que j’utilise.
export const SITES_OFFICIELS = {
  TypeScript: 'https://www.typescriptlang.org/',
  JavaScript: 'https://tc39.es/',
  'C#': 'https://learn.microsoft.com/dotnet/csharp/',
  PHP: 'https://www.php.net/',
  Java: 'https://dev.java/',
  Python: 'https://www.python.org/',
  Rust: 'https://rust-lang.org/',
  Go: 'https://go.dev/',
  C: 'https://www.open-std.org/jtc1/sc22/wg14/',
  SQL: 'https://www.postgresql.org/docs/current/sql.html',
  HTML: 'https://html.spec.whatwg.org/multipage/',
  CSS: 'https://www.w3.org/Style/CSS/',
  Angular: 'https://angular.dev/',
  React: 'https://react.dev/',
  'Vue.js': 'https://vuejs.org/',
  'Tailwind CSS': 'https://tailwindcss.com/',
  Sass: 'https://sass-lang.com/',
  RxJS: 'https://rxjs.dev/',
  GSAP: 'https://gsap.com/',
  Twig: 'https://twig.symfony.com/',
  Leaflet: 'https://leafletjs.com/',
  'Chart.js': 'https://www.chartjs.org/',
  WebAssembly: 'https://webassembly.org/',
  '.NET': 'https://dotnet.microsoft.com/',
  'ASP.NET Core': 'https://learn.microsoft.com/aspnet/core/',
  'Node.js': 'https://nodejs.org/',
  Express: 'https://expressjs.com/',
  Symfony: 'https://symfony.com/',
  'Spring Boot': 'https://spring.io/projects/spring-boot/',
  FastAPI: 'https://fastapi.tiangolo.com/',
  Axum: 'https://github.com/tokio-rs/axum',
  Tokio: 'https://tokio.rs/',
  SignalR: 'https://learn.microsoft.com/aspnet/core/signalr/',
  'API Platform': 'https://api-platform.com/',
  MCP: 'https://modelcontextprotocol.io/',
  Claude: 'https://claude.com/',
  Codex: 'https://openai.com/codex/',
  Kokoro: 'https://github.com/hexgrad/kokoro',
  Piper: 'https://github.com/OHF-Voice/piper1-gpl',
  PostgreSQL: 'https://www.postgresql.org/',
  MySQL: 'https://www.mysql.com/',
  SQLite: 'https://sqlite.org/',
  'EF Core': 'https://learn.microsoft.com/ef/core/',
  Doctrine: 'https://www.doctrine-project.org/',
  SQLx: 'https://github.com/transact-rs/sqlx',
  // La bibliothèque de l’adaptateur de Life Pixel (crates/server/src/storage/objects.rs), pas AWS.
  'Stockage S3 compatible': 'https://docs.rs/object_store/latest/object_store/',
  Ionic: 'https://ionicframework.com/',
  Capacitor: 'https://capacitorjs.com/',
  Tauri: 'https://tauri.app/',
  'Photino.NET': 'https://www.tryphotino.io/',
  Bash: 'https://www.gnu.org/software/bash/',
  sharp: 'https://sharp.pixelplumbing.com/',
  Pillow: 'https://pillow.readthedocs.io/en/stable/',
  Dompdf: 'https://dompdf.github.io/',
  OpenTUI: 'https://opentui.com/',
  Make: 'https://www.gnu.org/software/make/',
  GCC: 'https://gcc.gnu.org/',
  xUnit: 'https://xunit.net/',
  Vitest: 'https://vitest.dev/',
  PHPUnit: 'https://phpunit.de/',
  pytest: 'https://docs.pytest.org/',
  Playwright: 'https://playwright.dev/',
  Karma: 'https://karma-runner.github.io/',
  Jasmine: 'https://jasmine.github.io/',
  'axe-core': 'https://github.com/dequelabs/axe-core',
  ESLint: 'https://eslint.org/',
  Prettier: 'https://prettier.io/',
  Git: 'https://git-scm.com/',
  'GitHub Actions': 'https://github.com/features/actions',
  Docker: 'https://www.docker.com/',
  Linux: 'https://kernel.org/',
  Apache: 'https://httpd.apache.org/',
  Nginx: 'https://nginx.org/',
  Caddy: 'https://caddyserver.com/',
  Vite: 'https://vite.dev/',
  OpenTelemetry: 'https://opentelemetry.io/',
  Prometheus: 'https://prometheus.io/',
  Trello: 'https://trello.com/',
} as const satisfies Record<Technologie | 'Trello', string>;

/**
 * Compétences humaines : un intitulé, trois verbes, une illustration
 * (CMP-02 à CMP-08). `demarche` : les verbes forment une suite (›) plutôt
 * qu’une liste (·). Les verbes, reformulés depuis la V1 (adjectifs ou noms
 * seuls), sont validés par Charles le 15/10/2026. Pas de ligne de fait (Q9).
 */
export const COMPETENCES_HUMAINES = [
  { nom: 'Pédagogie', visuel: 'CMP-02', verbes: ['Expliquer', 'Accompagner', 'Rendre autonome'], demarche: true },
  { nom: 'Coordination', visuel: 'CMP-03', verbes: ['Accueillir', 'Organiser', 'Relire'], demarche: false },
  { nom: 'Écoute et cadrage', visuel: 'CMP-04', verbes: ['Écouter le besoin', 'Échanger', 'Cadrer'], demarche: true },
  { nom: 'Communication directe', visuel: 'CMP-05', verbes: ['Dire franchement', 'Échanger sincèrement', 'Avancer ensemble'], demarche: false },
  { nom: 'Créativité', visuel: 'CMP-06', verbes: ['Expérimenter', 'Réinventer', 'Prendre à contre-courant'], demarche: false },
  { nom: 'Apprentissage et adaptation', visuel: 'CMP-07', verbes: ['Comprendre', 'Tester', 'Ajuster'], demarche: true },
] as const;

/** Septième carte : les méthodes de travail du CV, Trello lié à son site. */
export const METHODES = { nom: 'Méthodes de travail', visuel: 'CMP-08', outil: 'Trello', pratiques: ['Agile et Scrum', 'Cahiers des charges', 'Documentation'] } as const;

/** Nombre de technologies affichées, Trello compris (contrat du test de la page). */
export const NOMBRE_TECHNOLOGIES =
  QUOTIDIEN.length
  + PRATIQUE.reduce((total, famille) => total + famille.outils.length, 0)
  + EXPLORE.length
  + DOMAINES_IA.reduce((total, domaine) => total + domaine.outils.length, 0)
  + DOMAINES_QUALITE.reduce((total, domaine) => total + domaine.outils.length, 0)
  + 1;
