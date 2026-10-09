/** Les trois entrées du parcours, partagées par le hub et ses pages. */
export const PAGES_PARCOURS = [
  {
    href: '/parcours/professionnel',
    titre: 'Parcours professionnel',
    description: 'Mes rôles, mes missions et le travail avec les équipes.',
    illustration: 'professionnel',
    action: 'Découvrir mes expériences',
  },
  {
    href: '/parcours/competences',
    titre: 'Compétences',
    description: 'Développer, concevoir et faire progresser un collectif.',
    illustration: 'competences',
    action: 'Explorer mes compétences',
  },
  {
    href: '/parcours/formation',
    titre: 'Formation et certifications',
    description: 'Mes études, mes réorientations et ce que je continue à apprendre.',
    illustration: 'formation',
    action: 'Voir ma formation',
  },
] as const;
