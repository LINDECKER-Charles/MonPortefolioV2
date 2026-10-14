/**
 * Les pages publiques et indexables du site, avec la date de leur dernière
 * mise à jour de contenu : source unique du sitemap (`pages/sitemap.xml.ts`) et
 * de la liste `PAGES` des tests de bout en bout, qui n’a donc plus à être
 * dupliquée. Une page ajoutée ici entre dans le sitemap et dans les tests ; le
 * vérificateur du build (`tools/verifier-site.mjs`) échoue si le sitemap et les
 * pages indexables construites divergent.
 *
 * La date est celle d’un contenu, jamais celle du build, qu’un moteur finit
 * par ignorer si elle change à chaque déploiement.
 */
export const PAGES_SITEMAP = [
  { chemin: '/', maj: '2026-10-13' },
  { chemin: '/projets', maj: '2026-10-13' },
  { chemin: '/projets/pvz-fusion', maj: '2026-10-13' },
  { chemin: '/projets/omnicard', maj: '2026-10-13' },
  { chemin: '/projets/gup', maj: '2026-10-13' },
  { chemin: '/projets/bloodborne-legendary-run', maj: '2026-10-13' },
  { chemin: '/projets/league-of-database', maj: '2026-10-13' },
  { chemin: '/parcours', maj: '2026-10-13' },
  { chemin: '/parcours/professionnel', maj: '2026-10-13' },
  { chemin: '/parcours/competences', maj: '2026-10-13' },
  { chemin: '/parcours/formation', maj: '2026-10-13' },
  { chemin: '/contact', maj: '2026-10-13' },
  { chemin: '/blog', maj: '2026-10-13' },
  { chemin: '/mentions-legales', maj: '2026-10-13' },
] as const;
