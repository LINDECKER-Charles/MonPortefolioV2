/**
 * Durée de lecture d'un fragment HTML : le texte lu, hors scripts, styles et
 * figures dessinées (leurs étiquettes se regardent plus qu'elles ne se
 * lisent), à 200 mots par minute — un rythme de lecture attentive en français,
 * pas de survol.
 */
export const MOTS_PAR_MINUTE = 200;

export function compterMots(html: string): number {
  const texte = html
    .replace(/<(script|style|svg)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(?:nbsp|#160|#xa0);/gi, ' ')
    .replace(/&[a-z0-9#]+;/gi, '');
  return texte.split(/\s+/).filter((mot) => /[\p{L}\p{N}]/u.test(mot)).length;
}

export function minutesDeLecture(html: string): number {
  return Math.max(1, Math.round(compterMots(html) / MOTS_PAR_MINUTE));
}
