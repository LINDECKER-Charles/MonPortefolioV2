/**
 * Dictionnaire du plan de marquage, tel que les tests le vérifient. La
 * référence lisible, avec le pourquoi de chaque événement, est
 * docs/mesure-audience.md : les deux se modifient ensemble.
 *
 * Des noms en kebab-case de 50 caractères au plus et des propriétés à valeurs
 * FERMÉES : aucune saisie libre, aucune donnée personnelle.
 */
import { CHAPITRES } from '../../src/config/chapitres';
import { GLOSSAIRE } from '../../src/config/glossaire';

export const EMPLACEMENTS = [
  'en-tete',
  'sommaire',
  'hero',
  'preuves',
  'discutons',
  'contact',
  'pied-de-page',
  'page-404',
  'mentions',
] as const;

/** Règle d'une propriété : liste fermée, ou nom d'hôte de la cible du lien. */
export type Regle = readonly string[] | 'hote-du-lien';

export const EVENEMENTS: Readonly<Record<string, Readonly<Record<string, Regle>>>> = {
  'contact-page': { emplacement: EMPLACEMENTS },
  'contact-email': { emplacement: EMPLACEMENTS },
  'contact-copie': { emplacement: EMPLACEMENTS },
  'cv-telechargement': { emplacement: EMPLACEMENTS },
  'lien-sortant': { domaine: 'hote-du-lien', emplacement: EMPLACEMENTS },
  lecture: { chapitre: CHAPITRES.map((c) => c.id) },
  theme: { choix: ['nuit', 'jour'] },
  glossaire: { terme: Object.values(GLOSSAIRE).map((t) => t.id) },
  'erreur-404': { origine: ['interne', 'externe', 'directe'] },
};

/**
 * Les problèmes d'un événement : nom inconnu ou trop long, propriété inconnue,
 * manquante, ou valeur hors de sa liste. Une liste vide si tout va bien.
 */
export function problemesEvenement(nom: string, donnees: Record<string, unknown>, href?: string): string[] {
  const regles = EVENEMENTS[nom];
  if (!regles) return [`événement inconnu « ${nom} »`];
  const problemes: string[] = nom.length > 50 ? [`nom trop long « ${nom} »`] : [];
  for (const [propriete, valeur] of Object.entries(donnees)) {
    const regle = regles[propriete];
    if (!regle) {
      problemes.push(`${nom} : propriété inconnue « ${propriete} »`);
    } else if (regle === 'hote-du-lien') {
      const hote = href ? new URL(href).hostname : '';
      if (valeur !== hote) problemes.push(`${nom} : domaine « ${String(valeur)} » au lieu de « ${hote} »`);
    } else if (!regle.includes(String(valeur))) {
      problemes.push(`${nom} : ${propriete} = « ${String(valeur)} » hors de la liste`);
    }
  }
  for (const propriete of Object.keys(regles)) {
    if (!(propriete in donnees)) problemes.push(`${nom} : propriété « ${propriete} » manquante`);
  }
  return problemes;
}
