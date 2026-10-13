/**
 * Formulations que le site ne doit jamais employer : Charles est en poste (brief § 4,
 * « Cible et posture » ; cahier des charges C4). Le site montre ce qu’il fait
 * et sa façon de penser ; il n’annonce ni recherche de poste ni disponibilité.
 *
 * Contrôlées par `tests/unit/formulations-interdites.test.ts` sur le HTML
 * construit : texte visible, métadonnées, `alt`, `aria-label`, `title`,
 * JSON-LD. Les motifs s’appliquent à un texte en minuscules, apostrophes
 * droites, espaces simples.
 *
 * Pour en ajouter une : l’inscrire ici avec un exemple, puis lancer `npm test`.
 */

export interface FormulationInterdite {
  /** Libellé affiché par le test. */
  libelle: string;
  motif: RegExp;
  /** Une phrase qui doit être refusée (le test s’en sert pour vérifier le motif). */
  exemple: string;
}

const EMPLOI = '(?:poste|emploi|job|travail|cdi|cdd|contrat|mission|stage|alternance|opportunit\\w*|defi|challenge)';

export const FORMULATIONS_INTERDITES: readonly FormulationInterdite[] = [
  { libelle: 'recherche d’un poste', motif: new RegExp(`\\brecherch\\w*\\s+(?:un|une|d'un|d'une|mon|son|nouveau|nouvel|nouvelle|d'un nouveau|d'un nouvel|d'une nouvelle)\\s+${EMPLOI}`), exemple: 'Je recherche un poste de lead.' },
  { libelle: 'cherche un poste', motif: new RegExp(`\\bcherch\\w*\\s+(?:un|une|mon|son|un nouveau|un nouvel|une nouvelle)\\s+${EMPLOI}`), exemple: 'Je cherche un nouvel emploi.' },
  { libelle: 'à la recherche de', motif: new RegExp(`\\ba la recherche\\s+(?:d'un|d'une|de|d'|du)\\s*(?:nouveau\\s+|nouvelle\\s+)?${EMPLOI}`), exemple: 'À la recherche d’un nouveau défi.' },
  { libelle: 'recherche d’emploi', motif: /\brecherche (?:d'emploi|de poste|de travail|d'opportunit\w*)/, exemple: 'En recherche d’emploi.' },
  { libelle: 'en recherche active', motif: /\ben recherche (?:active|d'un|d'une|de poste|d'emploi|d'opportunit\w*)/, exemple: 'En recherche active.' },
  { libelle: 'recherche activement', motif: /\brecherch\w*\s+activement/, exemple: 'Je recherche activement.' },
  { libelle: 'disponible immédiatement', motif: /\bdisponible\s+(?:immediatement|de suite|tout de suite|des maintenant|rapidement|pour un (?:poste|emploi|cdi|cdd|nouveau))/, exemple: 'Disponible immédiatement.' },
  { libelle: 'open to work', motif: /\bopen[\s-]+to[\s-]+work\b|#opentowork/, exemple: 'Open to work.' },
  { libelle: 'available for hire', motif: /\bavailable\s+(?:for\s+(?:hire|work|freelance)|immediately)\b|\bhire\s+me\b|\blooking\s+for\s+(?:a\s+|new\s+|my\s+next\s+)?(?:job|role|position|opportunit\w*)/, exemple: 'Available for hire.' },
  { libelle: 'à l’écoute du marché', motif: /\ba l'ecoute (?:du marche|des opportunites|de nouvelles opportunites)/, exemple: 'À l’écoute du marché.' },
  { libelle: 'ouvert aux opportunités', motif: /\bouverte?\s+(?:aux|a de|a toute|a toutes)\s+(?:nouvelles\s+)?opportunit\w*|\bouverte?\s+a\s+(?:de\s+)?nouvelles\s+(?:opportunit\w*|propositions|offres)/, exemple: 'Ouvert aux opportunités.' },
  { libelle: 'recrutez-moi', motif: /\b(?:recrutez|embauchez|engagez)[\s-]+moi\b/, exemple: 'Embauchez-moi.' },
];
