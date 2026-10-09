// Inventaire public vérifié le 2026-10-09 : docs/matiere-premiere.md.
// Les technologies des forks sont retenues seulement sur contribution attestée.
export const DOMAINES_TECHNIQUES = [
  { nom: 'Langages', outils: ['TypeScript', 'JavaScript', 'C#', 'PHP', 'Java', 'Python', 'Rust', 'Go', 'C', 'SQL'] },
  { nom: 'Web et interfaces', outils: ['HTML', 'CSS', 'Angular', 'React', 'Vue.js', 'Tailwind CSS', 'Sass', 'RxJS', 'GSAP', 'Twig', 'Leaflet', 'Chart.js', 'WebAssembly'] },
  { nom: 'Backend et API', outils: ['.NET', 'ASP.NET Core', 'Node.js', 'Express', 'Symfony', 'Spring Boot', 'FastAPI', 'Axum', 'Tokio', 'SignalR', 'API Platform', 'MCP'] },
  { nom: 'Données et persistance', outils: ['PostgreSQL', 'MySQL', 'SQLite', 'EF Core', 'Doctrine', 'SQLx', 'Stockage S3 compatible'] },
  { nom: 'Mobile et applications de bureau', outils: ['Ionic', 'Capacitor', 'Tauri', 'Photino.NET'] },
  { nom: 'Scripts, fichiers et outils en console', outils: ['Bash', 'sharp', 'Pillow', 'Dompdf', 'OpenTUI', 'Make', 'GCC'] },
] as const;

export const DOMAINES_QUALITE = [
  { nom: 'Tests et qualité', outils: ['xUnit', 'Vitest', 'PHPUnit', 'pytest', 'Playwright', 'Karma', 'Jasmine', 'axe-core', 'ESLint', 'Prettier'] },
  { nom: 'Livraison et observabilité', outils: ['Git', 'GitHub Actions', 'Docker', 'Linux', 'Apache', 'Nginx', 'Caddy', 'Vite', 'OpenTelemetry', 'Prometheus'] },
] as const;

export const COMPETENCES_HUMAINES = [
  { nom: 'Pédagogie', categorie: 'pedagogie' as const, points: ['Expliquer', 'Accompagner', 'Autonomie'], schema: true },
  { nom: 'Coordination', categorie: 'coordination' as const, points: ['Accueillir', 'Organiser', 'Relire'], schema: false },
  { nom: 'Écoute et cadrage', categorie: 'ecoute' as const, points: ['Besoin', 'Échanges', 'Cadrage'], schema: true },
  { nom: 'Communication directe', categorie: 'communication' as const, points: ['Franchise', 'Sincérité', 'Collectif'], schema: false },
  { nom: 'Créativité', categorie: 'creativite' as const, points: ['Expérimenter', 'Réinventer', 'Contre-courant'], schema: false },
  { nom: 'Apprentissage et adaptation', categorie: 'adaptation' as const, points: ['Comprendre', 'Tester', 'Ajuster'], schema: true },
] as const;
