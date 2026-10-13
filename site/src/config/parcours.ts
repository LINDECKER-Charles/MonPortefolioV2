/**
 * Le parcours : ses pages (hub, onglets, « Pour continuer ») et les
 * expériences professionnelles, qui nourrissent la fiche de chaque rôle, la
 * chronologie de la page Professionnel (PRO-F1) et la mini-frise du hub
 * (PAR-F1). Une seule source : les dates ne s’écrivent qu’ici.
 *
 * Faits : docs/matiere-premiere.md (Identité, Parcours), docs/questions.md
 * (A2, B3, C5, C7) et, pour les rôles chez PvZ Fusion, le journal public du
 * pôle (config/pvz-fusion.ts, ROLES). Une date de fin inconnue n’est jamais
 * extrapolée : elle reste « à confirmer ».
 */

/** Les trois pages du parcours, partagées par le hub, les onglets et la suite de lecture. */
export const PAGES_PARCOURS = [
  {
    href: '/parcours/professionnel',
    titre: 'Parcours professionnel',
    court: 'Professionnel',
    description: 'Mes rôles, mes missions et le travail avec les équipes.',
    illustration: 'professionnel',
    visuel: 'PAR-01',
    action: 'Découvrir mes expériences',
  },
  {
    href: '/parcours/competences',
    titre: 'Compétences',
    court: 'Compétences',
    description: 'Développer, concevoir et faire progresser un collectif.',
    illustration: 'competences',
    visuel: 'PAR-02',
    action: 'Explorer mes compétences',
  },
  {
    href: '/parcours/formation',
    titre: 'Formation et certifications',
    court: 'Formation',
    description: 'Mes études, mon titre professionnel et mes certifications.',
    illustration: 'formation',
    visuel: 'PAR-03',
    action: 'Voir ma formation',
  },
] as const;

/** Nature d’une activité : un mot, et une forme dans les frises (jamais la couleur seule). */
export type Nature = 'cdi' | 'freelance' | 'benevolat' | 'stage' | 'formation';

export const NATURES: Readonly<Record<Nature, string>> = {
  cdi: 'CDI',
  freelance: 'Freelance',
  benevolat: 'Bénévolat',
  stage: 'Stage',
  formation: 'Formation',
};

/** Mois au format `AAAA-MM`. */
export type Mois = `${number}-${string}`;

export interface PreuveExperience {
  valeur: string;
  libelle: string;
  source: string;
  date?: string;
  surligne?: boolean;
}

export interface Experience {
  /** Ancre de la fiche, et entrée de la navigation de page. */
  id: string;
  /** Repère court de la navigation de page. */
  repere: string;
  /** Le rôle : ce qui domine la fiche. */
  role: string;
  structure: string;
  lieu: string;
  nature: Nature;
  debut: Mois;
  /** Dernier mois de l’activité ; `null` si elle continue. */
  fin: Mois | null;
  /** Terminée, mais à une date que Charles n’a pas encore donnée. */
  finAConfirmer?: boolean;
  /** Statut honnête, en un mot ou deux (composant Statut). */
  statut: { texte: string; etat: 'actif' | 'ouvert' | 'eteint' };
  mission: string;
  preuve?: PreuveExperience;
  /** Contexte replié : le résumé est l’intitulé, les paragraphes s’ouvrent au clic. */
  contexte?: { resume: string; paragraphes: readonly string[] };
  /** Évolution du rôle, datée (PvZ Fusion). */
  etapes?: readonly { titre: string; date: string }[];
  /**
   * Le rôle affiché n’est tenu que depuis ce mois : la période le dit
   * (« lead depuis décembre 2025 ») et la barre de frise se coupe en deux.
   */
  bascule?: { mois: Mois; role: string };
  liens?: readonly { href: string; libelle: string }[];
  /** Emplacement du visuel (config/visuels.ts). */
  visuel: string;
  /** Libellé de la frise du hub (PAR-F1) et de la chronologie (PRO-F1). */
  frise: string;
}

/** Du plus récent au plus ancien, par date de début (retour du 2026-10-09). */
export const EXPERIENCES: readonly Experience[] = [
  {
    id: 'architecture',
    repere: 'Architecte logiciel',
    role: 'Architecte logiciel',
    structure: 'B-Hive',
    lieu: 'Mulhouse',
    nature: 'cdi',
    debut: '2026-08',
    fin: null,
    statut: { texte: 'En poste', etat: 'actif' },
    mission: 'Je travaille sur le développement web et le DevOps.',
    liens: [
      { href: '/parcours/competences', libelle: 'Mes compétences' },
      { href: '/projets', libelle: 'Mes projets' },
    ],
    visuel: 'PRO-01',
    frise: 'Architecte logiciel, B-Hive',
  },
  {
    id: 'mission-locale',
    repere: 'Mission Locale',
    role: 'Mentor et animateur d’ateliers',
    structure: 'Mission Locale',
    lieu: 'Altkirch',
    nature: 'benevolat',
    debut: '2026-01',
    fin: null,
    finAConfirmer: true,
    statut: { texte: 'Terminé', etat: 'eteint' },
    mission: 'J’ai accompagné des jeunes vers les métiers du web et animé leurs premiers ateliers de code.',
    visuel: 'PRO-04',
    frise: 'Mentor, Mission Locale',
  },
  {
    id: 'elan',
    repere: 'Elan Formation',
    role: 'Formateur en développement web',
    structure: 'Elan Formation',
    lieu: 'Mulhouse',
    nature: 'freelance',
    debut: '2025-12',
    fin: null,
    finAConfirmer: true,
    statut: { texte: 'Mission terminée', etat: 'eteint' },
    mission: 'J’ai repris en urgence une promotion DWWM et CDA et l’ai accompagnée jusqu’à la soutenance.',
    preuve: { valeur: 'Tous titrés', libelle: 'une dizaine d’apprenants accompagnés', source: 'Témoignage' },
    contexte: {
      resume: 'Le contexte chez Elan',
      paragraphes: [
        'Deux mois après mon titre, Elan perd son formateur en fin de promotion. Des étudiants que j’ai croisés pendant ma formation donnent mon nom.',
        'Environ la moitié de mes apprenants prépare le CDA, un niveau au-dessus de mon propre titre.',
      ],
    },
    visuel: 'PRO-02',
    frise: 'Formateur, Elan Formation',
  },
  {
    id: 'devmates',
    repere: 'Dev-Mates',
    role: 'Développeur indépendant',
    structure: 'Dev-Mates',
    lieu: 'Ma société',
    nature: 'freelance',
    debut: '2025-11',
    fin: null,
    statut: { texte: 'Société ouverte', etat: 'ouvert' },
    mission: 'Des applications sur mesure, de la conception à la mise en production.',
    contexte: {
      resume: 'Le travail chez Dev-Mates',
      paragraphes: ['J’y ai développé des sites et des applications web. Le travail comprenait aussi le conseil et la relation client.'],
    },
    visuel: 'PRO-06',
    frise: 'Indépendant, Dev-Mates',
  },
  {
    id: 'pvz',
    repere: 'PvZ Fusion',
    role: 'Lead et mainteneur',
    structure: 'PvZ Fusion, pôle francophone',
    lieu: 'Communauté, à distance',
    nature: 'benevolat',
    debut: '2025-10',
    fin: null,
    statut: { texte: 'En cours', etat: 'actif' },
    mission: 'J’accueille les nouveaux, je documente et j’organise le travail.',
    etapes: [
      { titre: 'Traducteur', date: 'octobre 2025' },
      { titre: 'Lead du pôle francophone', date: 'décembre 2025' },
      { titre: 'Mainteneur du projet multilingue', date: 'septembre 2026 au plus tard' },
    ],
    // Octobre 2025 : l’arrivée comme traducteur ; lead depuis décembre 2025 (décision du 13/10/2026).
    bascule: { mois: '2025-12', role: 'lead' },
    preuve: { valeur: '20', libelle: 'contributeurs formés', source: 'Témoignage', date: 'confirmé le 13 octobre 2026', surligne: true },
    liens: [{ href: '/projets/pvz-fusion', libelle: 'Voir le travail avec la communauté' }],
    visuel: 'PRO-03',
    frise: 'Traducteur puis lead, PvZ Fusion',
  },
  {
    id: 'atis',
    repere: 'ATIS Solutions',
    role: 'Développeur full stack',
    structure: 'ATIS Solutions',
    lieu: 'Sausheim',
    nature: 'stage',
    debut: '2025-08',
    fin: '2025-09',
    statut: { texte: 'Stage terminé', etat: 'eteint' },
    mission: 'J’ai développé des modules Dolibarr pour le suivi des temps et des contrats.',
    preuve: { valeur: '−30 %', libelle: 'de temps de traitement administratif', source: 'Témoignage', surligne: true },
    contexte: {
      resume: 'Le contexte du stage',
      paragraphes: ['J’ai rédigé le cahier des charges avec l’équipe, puis développé des modules qui simplifient le suivi administratif.'],
    },
    visuel: 'PRO-05',
    frise: 'Développeur full stack, ATIS Solutions',
  },
];

const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

/** « août 2026 » depuis « 2026-08 ». */
export function moisEnClair(mois: Mois): string {
  const [annee, numero] = mois.split('-').map(Number);
  return `${MOIS[numero - 1]} ${annee}`;
}

/** Nombre de mois écoulés depuis l’an 0 : sert aux positions des frises. */
export function rangDuMois(mois: Mois): number {
  const [annee, numero] = mois.split('-').map(Number);
  return annee * 12 + numero - 1;
}

/** Période d’une expérience, en clair : « Depuis août 2026 », « Août – septembre 2025 » (le tiret d’intervalle : les flèches sont réservées aux liens, règle E2). */
export function periodeEnClair(experience: Pick<Experience, 'debut' | 'fin' | 'finAConfirmer'>): string {
  const debut = moisEnClair(experience.debut);
  if (experience.fin) {
    const [anneeDebut] = experience.debut.split('-');
    const [anneeFin] = experience.fin.split('-');
    const premier = anneeDebut === anneeFin ? debut.replace(/ \d+$/, '') : debut;
    return majuscule(`${premier} – ${moisEnClair(experience.fin)}`);
  }
  if (experience.finAConfirmer) return majuscule(`${debut} – terminé`);
  return `Depuis ${debut}`;
}

export function majuscule(texte: string): string {
  return texte.charAt(0).toUpperCase() + texte.slice(1);
}

/** Nature et période pour une ligne de frise : « CDI, depuis août 2026 ». */
export function periodeDeFrise(experience: Pick<Experience, 'debut' | 'fin' | 'finAConfirmer' | 'nature' | 'bascule'>): string {
  const periode = experience.finAConfirmer && !experience.fin
    ? `${moisEnClair(experience.debut)} – fin à confirmer`
    : periodeEnClair(experience);
  const role = experience.bascule ? `, ${experience.bascule.role} depuis ${moisEnClair(experience.bascule.mois)}` : '';
  return `${NATURES[experience.nature]}, ${periode.charAt(0).toLowerCase()}${periode.slice(1)}${role}`;
}

/** Une expérience en ligne de frise, vers sa fiche sur la page Professionnel. */
export function ligneDeFrise(experience: Experience, page = '/parcours/professionnel') {
  return {
    cle: experience.id,
    href: `${page}#${experience.id}`,
    libelle: experience.frise,
    periode: periodeDeFrise(experience),
    nature: experience.nature,
    debut: experience.debut,
    fin: experience.fin,
    finAConfirmer: experience.finAConfirmer,
    bascule: experience.bascule?.mois,
  };
}

/** Le hub en chiffres : un fait par porte. */
export const NOMBRE_EXPERIENCES = EXPERIENCES.length;
