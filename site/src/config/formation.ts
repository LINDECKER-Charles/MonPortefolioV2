/**
 * Formation et certifications : le titre obtenu, le chemin d’avant, les douze
 * certifications et la pratique sur Frontend Mentor.
 *
 * Faits : docs/matiere-premiere.md (Parcours, Certifications) et
 * docs/questions.md (C1, C3, C5). Aucune date inventée : seules les études
 * datées par Charles portent une date (Q9 : pas de date pour la piscine de 42).
 */

/** Certificats vérifiés sur le profil public hexanti le 9 octobre 2026. */
const certificat = 'https://www.freecodecamp.org/certification/hexanti/';

export const PROFIL_FREECODECAMP = 'https://www.freecodecamp.org/hexanti';

export const DOMAINES_CERTIFICATIONS = [
  {
    id: 'web',
    titre: 'Web et JavaScript',
    organisme: 'freeCodeCamp',
    logo: 'javascript',
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
    organisme: 'freeCodeCamp',
    logo: 'python',
    certifications: [
      { titre: 'Python', version: 'V9', date: '2026-03-06', periode: 'Mars 2026', url: `${certificat}python-v9` },
    ],
  },
  {
    id: 'donnees',
    titre: 'API et bases de données',
    organisme: 'freeCodeCamp',
    logo: 'postgresql',
    certifications: [
      { titre: 'Relational Database', version: 'V9', date: '2026-03-05', periode: 'Mars 2026', url: `${certificat}relational-databases-v9` },
      { titre: 'Relational Database', version: 'V8', date: '2026-03-05', periode: 'Mars 2026', url: `${certificat}relational-database-v8` },
      { titre: 'Back-End Development and APIs', version: 'V8', date: '2025-06-28', periode: 'Juin 2025', url: `${certificat}back-end-development-and-apis` },
    ],
  },
  {
    id: 'csharp',
    titre: 'C#',
    organisme: 'Microsoft et freeCodeCamp',
    logo: 'csharp',
    certifications: [
      { titre: 'Foundational C# with Microsoft', date: '2025-11-18', periode: 'Novembre 2025', url: `${certificat}foundational-c-sharp-with-microsoft` },
    ],
  },
  {
    id: 'anglais',
    titre: 'Anglais technique',
    organisme: 'freeCodeCamp',
    logo: null,
    certifications: [
      { titre: 'B1 English for Developers', date: '2026-03-05', periode: 'Mars 2026', url: `${certificat}b1-english-for-developers` },
      { titre: 'A2 English for Developers', date: '2026-03-04', periode: 'Mars 2026', url: `${certificat}a2-english-for-developers` },
    ],
  },
] as const;

export type Domaine = (typeof DOMAINES_CERTIFICATIONS)[number];
type Certification = Domaine['certifications'][number];

export const NOMBRE_CERTIFICATIONS = DOMAINES_CERTIFICATIONS.reduce(
  (nombre, domaine) => nombre + domaine.certifications.length, 0,
);

/**
 * Les versions d’une même certification réunies sur une ligne (« Relational
 * Database — V9, V8 »), chacune avec son certificat et sa date : la liste se
 * lit plus vite, aucune preuve ne disparaît.
 */
export function certificationsGroupees(domaine: Domaine): { titre: string; versions: Certification[] }[] {
  const groupes = new Map<string, Certification[]>();
  for (const certification of domaine.certifications) {
    groupes.set(certification.titre, [...(groupes.get(certification.titre) ?? []), certification]);
  }
  return [...groupes].map(([titre, versions]) => ({ titre, versions }));
}

/** Première et dernière année des certifications : « 2024–2026 ». */
export const ANNEES_CERTIFICATIONS = (() => {
  const annees = DOMAINES_CERTIFICATIONS.flatMap((d) => d.certifications.map((c) => Number(c.date.slice(0, 4))));
  return `${Math.min(...annees)}–${Math.max(...annees)}`;
})();

/** Le titre obtenu : ce qui domine la page. */
export const DIPLOME = {
  statut: 'Titre professionnel obtenu',
  titre: 'Développeur Web et Web Mobile',
  sigle: 'DWWM',
  organisme: 'Elan Formation, Mulhouse',
  debut: '2025-04',
  fin: '2025-10',
  niveau: 'RNCP niveau 5',
  equivalence: 'bac + 2',
  preuve: { valeur: '1 mois', libelle: 'pour boucler le programme', source: 'Témoignage' },
  visuel: 'FOR-01',
} as const;

/** Le programme étudié en complément : distinct du titre obtenu (précision du 2026-10-09). */
export const COMPLEMENT_CDA = {
  statut: 'Programme étudié en complément',
  titre: 'Concepteur Développeur d’Applications',
  contexte: 'Pendant le DWWM',
  niveau: 'RNCP niveau 6',
  part: 80,
  titreNonPasse: 'Titre non passé',
  visuel: 'FOR-02',
} as const;

export interface Etude {
  id: string;
  titre: string;
  /** Établissement ou nature de l’étape. */
  organisme: string;
  /** Année ou repère de temps, seulement s’il est sourcé. */
  quand?: { texte: string; debut?: string; fin?: string };
  /** Ce qui a été suivi. */
  suivi?: string;
  statut?: string;
  visuel: string;
  lien?: { href: string; libelle: string };
}

/**
 * Le chemin d’avant le titre, du plus récent au plus ancien (ordre demandé le
 * 2026-10-09). Les deux premières années n’ont pas de date sourcée.
 */
export const ETUDES_AVANT: readonly Etude[] = [
  {
    id: 'piscine',
    titre: 'Piscine de 42',
    organisme: 'Sélection d’entrée',
    statut: 'Candidature non retenue',
    visuel: 'FOR-07',
    lien: { href: 'https://github.com/LINDECKER-Charles/Piscine42-Mulhouse-2024', libelle: 'Mes exercices' },
  },
  {
    id: 'reseaux',
    titre: 'BUT Réseaux & Télécoms',
    organisme: 'IUT Nancy-Brabois',
    quand: { texte: '2023–2024', debut: '2023', fin: '2024' },
    suivi: 'Première année suivie',
    statut: 'Cursus non poursuivi',
    visuel: 'FOR-06',
  },
  {
    id: 'physique',
    titre: 'Physique-chimie',
    organisme: 'Université',
    suivi: 'Première année suivie',
    statut: 'Cursus non poursuivi',
    visuel: 'FOR-05',
  },
  {
    id: 'informatique',
    titre: 'BUT Informatique',
    organisme: 'IUT',
    suivi: 'Première année suivie',
    statut: 'Cursus non poursuivi',
    visuel: 'FOR-04',
  },
  {
    id: 'autodidacte',
    titre: 'Programmation en autodidacte',
    organisme: 'OpenClassrooms',
    quand: { texte: 'Vers 13 ans' },
    suivi: 'Le C, pour passer ensuite au C++ et coder mes jeux sur Unreal Engine',
    visuel: 'FOR-03',
  },
];

/** Profil public vérifié le 9 octobre 2026 : 20 solutions publiées, 385 points. */
export const FRONTEND_MENTOR = {
  profil: 'https://www.frontendmentor.io/profile/LINDECKER-Charles',
  projets: '20',
  points: '385',
  releve: 'Repères relevés le 9 octobre 2026.',
  visuel: 'FOR-09',
} as const;
