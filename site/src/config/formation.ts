/** Certificats vérifiés sur le profil public hexanti le 9 octobre 2026. */
const certificat = 'https://www.freecodecamp.org/certification/hexanti/';

export const DOMAINES_CERTIFICATIONS = [
  {
    id: 'web',
    titre: 'Web et JavaScript',
    certifications: [
      { titre: 'JavaScript', version: 'V9', date: '2026-03-14', periode: 'Mars 2026', url: `${certificat}javascript-v9` },
      { titre: 'Responsive Web Design', version: 'V9', date: '2026-03-03', periode: 'Mars 2026', url: `${certificat}responsive-web-design-v9` },
      { titre: 'Legacy JavaScript Algorithms and Data Structures', version: 'V7', date: '2025-11-23', periode: 'Novembre 2025', url: `${certificat}javascript-algorithms-and-data-structures` },
      { titre: 'Legacy JavaScript Algorithms and Data Structures', version: 'V8', date: '2025-06-26', periode: 'Juin 2025', url: `${certificat}javascript-algorithms-and-data-structures-v8` },
      { titre: 'Legacy Responsive Web Design', version: 'V8', date: '2024-11-27', periode: 'Novembre 2024', url: `${certificat}responsive-web-design` },
    ],
  },
  {
    id: 'python',
    titre: 'Python',
    certifications: [
      { titre: 'Python', version: 'V9', date: '2026-03-06', periode: 'Mars 2026', url: `${certificat}python-v9` },
    ],
  },
  {
    id: 'donnees',
    titre: 'API et bases de données',
    certifications: [
      { titre: 'Relational Database', version: 'V9', date: '2026-03-05', periode: 'Mars 2026', url: `${certificat}relational-databases-v9` },
      { titre: 'Relational Database', version: 'V8', date: '2026-03-05', periode: 'Mars 2026', url: `${certificat}relational-database-v8` },
      { titre: 'Back-End Development and APIs', version: 'V8', date: '2025-06-28', periode: 'Juin 2025', url: `${certificat}back-end-development-and-apis` },
    ],
  },
  {
    id: 'csharp',
    titre: 'C#',
    certifications: [
      { titre: 'Foundational C# with Microsoft', date: '2025-11-18', periode: 'Novembre 2025', url: `${certificat}foundational-c-sharp-with-microsoft` },
    ],
  },
  {
    id: 'anglais',
    titre: 'Anglais technique',
    certifications: [
      { titre: 'B1 English for Developers', date: '2026-03-05', periode: 'Mars 2026', url: `${certificat}b1-english-for-developers` },
      { titre: 'A2 English for Developers', date: '2026-03-04', periode: 'Mars 2026', url: `${certificat}a2-english-for-developers` },
    ],
  },
] as const;

export const NOMBRE_CERTIFICATIONS = DOMAINES_CERTIFICATIONS.reduce(
  (nombre, domaine) => nombre + domaine.certifications.length, 0,
);
