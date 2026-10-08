/** Les trois entrées du parcours, partagées par le hub et ses pages. */
export const PAGES_PARCOURS = [
  {
    href: '/parcours/professionnel',
    titre: 'Parcours professionnel',
    description: 'Mes rôles, mes missions et le travail avec les équipes.',
    repere: 'Architecture logicielle, développement et transmission',
    picto: 'pupitre',
  },
  {
    href: '/parcours/competences',
    titre: 'Compétences',
    description: 'Mes savoir-faire, de l’interface à la mise en production.',
    repere: 'Développement web, données, DevOps et travail collectif',
    picto: 'interface/sommaire',
  },
  {
    href: '/parcours/formation',
    titre: 'Formation et certifications',
    description: 'Mes études, mes réorientations et ce que je continue à apprendre.',
    repere: 'Autodidacte, titre DWWM et certifications',
    picto: 'interface/glossaire',
  },
] as const;
