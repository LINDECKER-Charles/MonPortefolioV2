/**
 * Grammaire des liens du site (règle E2) et marquage de la mesure, en un seul
 * endroit pour Bouton, LienAction, CarteProjet et AppelDiscutons.
 *
 *   → page interne · ↓ ancre de la page · ↗ sortie du site (et mailto:)
 *
 * Mesure (docs/mesure-audience.md) : un lien externe porte `lien-sortant`,
 * le nom d’hôte exact de sa cible et un emplacement ; un mailto: porte
 * `contact-email` et un emplacement. Sans emplacement, le build échoue : un
 * lien sortant non mesuré ne part jamais en ligne.
 */

/** Valeurs fermées de la propriété `emplacement` (plan de marquage). */
export type Emplacement =
  | 'en-tete'
  | 'sommaire'
  | 'hero'
  | 'preuves'
  | 'fiche-projet'
  | 'competences'
  | 'discutons'
  | 'contact'
  | 'pied-de-page'
  | 'page-404'
  | 'mentions'
  | 'article';

export type SorteDeLien = 'interne' | 'ancre' | 'externe' | 'courriel';

export const FLECHES: Readonly<Record<SorteDeLien, string>> = {
  interne: '→',
  ancre: '↓',
  externe: '↗',
  courriel: '↗',
};

export function sorteDeLien(href: string): SorteDeLien {
  if (href.startsWith('#')) return 'ancre';
  if (href.startsWith('mailto:')) return 'courriel';
  if (/^https?:\/\//.test(href)) return 'externe';
  return 'interne';
}

/** Nom d’hôte d’un lien externe (`www.linkedin.com`, `github.com`…). */
export function domaineDe(href: string): string {
  return new URL(href).hostname;
}

export interface OptionsMesure {
  emplacement?: Emplacement;
  /**
   * Événement d’un lien interne : seulement `contact-page`, pour un appel à
   * l’action vers la page Contact.
   */
  evenement?: 'contact-page';
}

/** Attributs data-umami-* d’un lien, selon sa sorte. */
export function attributsMesure(href: string, { emplacement, evenement }: OptionsMesure = {}): Record<string, string> {
  const sorte = sorteDeLien(href);
  if (sorte === 'externe' || sorte === 'courriel') {
    if (!emplacement) throw new Error(`Lien ${href} : un emplacement de mesure est obligatoire (docs/mesure-audience.md).`);
    return sorte === 'externe'
      ? { 'data-umami-event': 'lien-sortant', 'data-umami-event-domaine': domaineDe(href), 'data-umami-event-emplacement': emplacement }
      : { 'data-umami-event': 'contact-email', 'data-umami-event-emplacement': emplacement };
  }
  if (evenement) {
    if (!emplacement) throw new Error(`Lien ${href} : l’événement ${evenement} demande un emplacement.`);
    return { 'data-umami-event': evenement, 'data-umami-event-emplacement': emplacement };
  }
  return {};
}
