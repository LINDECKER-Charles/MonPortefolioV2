/**
 * Accès MCP du backoffice : les préréglages proposés, les permissions dites
 * en clair, le nom proposé, la commande Claude Code et l’âge d’une dernière
 * utilisation. Une seule source pour l’interface (scripts/backoffice-acces.ts)
 * et ses tests (tests/unit/acces-mcp.test.ts).
 *
 * Les permissions sont celles du backend (backend/src/admin.rs,
 * valid_token_scopes) : blog:read ⊂ blog:write ⊂ blog:publish, et
 * contacts:read à part. contacts:read ouvre les noms, adresses e-mail et
 * messages des visiteurs : jamais accordé par défaut, toujours une case
 * cochée exprès. Les accès déjà créés gardent leurs permissions.
 */
export type Permission = 'contacts:read' | 'blog:read' | 'blog:write' | 'blog:publish';
export type Prereglage = 'lecture' | 'redaction' | 'publication';

export interface DefinitionPrereglage {
  titre: string;
  /** Ce que l’assistant pourra faire, en une phrase. */
  description: string;
  permissions: readonly Permission[];
}

export const PREREGLAGES: Readonly<Record<Prereglage, DefinitionPrereglage>> = {
  lecture: {
    titre: 'Lecture du blog',
    description: 'Lire les articles, les brouillons, leurs aperçus, l’audit de référencement et les images.',
    permissions: ['blog:read'],
  },
  redaction: {
    titre: 'Rédaction',
    description: 'Tout lire, créer et modifier des brouillons, importer des images. Rien n’est publié.',
    permissions: ['blog:read', 'blog:write'],
  },
  publication: {
    titre: 'Publication',
    description: 'La rédaction, plus publier, programmer, retirer ou supprimer un article ou une image.',
    permissions: ['blog:read', 'blog:write', 'blog:publish'],
  },
};

export const ORDRE_PREREGLAGES: readonly Prereglage[] = ['lecture', 'redaction', 'publication'];
export const PREREGLAGE_PAR_DEFAUT: Prereglage = 'redaction';
export const NOM_PAR_DEFAUT = 'Claude Code';
/** Libellé de la permission séparée, dans la liste des accès. */
export const LIBELLE_DEMANDES = 'Demandes de contact';

/** Les permissions envoyées au backend : le préréglage, et les demandes seulement si on les a cochées. */
export function permissionsDe(prereglage: Prereglage, demandes: boolean): Permission[] {
  return [...(demandes ? (['contacts:read'] as const) : []), ...PREREGLAGES[prereglage].permissions];
}

/** Les permissions d’un accès, en mots : le niveau du blog, puis les demandes de contact. */
export function libellesPermissions(permissions: readonly string[]): string[] {
  const libelles: string[] = [];
  if (permissions.includes('blog:publish')) libelles.push(PREREGLAGES.publication.titre);
  else if (permissions.includes('blog:write')) libelles.push(PREREGLAGES.redaction.titre);
  else if (permissions.includes('blog:read')) libelles.push(PREREGLAGES.lecture.titre);
  if (permissions.includes('contacts:read')) libelles.push(LIBELLE_DEMANDES);
  return libelles;
}

/** « Claude Code », puis « Claude Code 2 », « Claude Code 3 »… si le nom sert déjà. */
export function nomPropose(existants: readonly string[], base = NOM_PAR_DEFAUT): string {
  const pris = new Set(existants.map((nom) => nom.trim().toLocaleLowerCase('fr')));
  if (!pris.has(base.toLocaleLowerCase('fr'))) return base;
  for (let rang = 2; ; rang += 1) {
    const nom = `${base} ${rang}`;
    if (!pris.has(nom.toLocaleLowerCase('fr'))) return nom;
  }
}

/**
 * Le nom du serveur dans Claude Code, déduit de l’hôte : `portfolio` en
 * production, `portfolio-local` sur le poste, `portfolio-<sous-domaine>`
 * ailleurs (`portfolio-test` sur test.v2…). Deux environnements ne se
 * marchent jamais dessus dans la configuration de Claude Code.
 */
export function nomServeur(hote: string, hoteCanonique: string): string {
  const nu = (valeur: string) => valeur.trim().toLowerCase().replace(/^\[|\]$/g, '').replace(/^www\./, '');
  const ici = nu(hote);
  if (ici === 'localhost' || ici.endsWith('.localhost') || ici === '::1' || /^127(?:\.\d{1,3}){3}$/.test(ici)) return 'portfolio-local';
  if (ici === nu(hoteCanonique)) return 'portfolio';
  const etiquette = (ici.split('.')[0] ?? '').replace(/[^a-z0-9-]/g, '').replace(/^-+|-+$/g, '');
  return etiquette ? `portfolio-${etiquette}` : 'portfolio';
}

/** Une valeur de commande shell : telle quelle si elle est sûre, sinon entre apostrophes droites échappées. */
function argument(valeur: string): string {
  return /^[\w.~+/=:@%-]+$/.test(valeur) ? valeur : `'${valeur.replaceAll("'", `'\\''`)}'`;
}

/**
 * La commande d’ajout (`claude mcp add --help`), mot par mot : transport
 * HTTP, portée utilisateur (le serveur sert dans tous les projets), en-tête
 * d’autorisation en dernier (`--header` accepte plusieurs valeurs). Le
 * secret du backend est hexadécimal ; un autre secret reste cité sans risque.
 */
export function motsAjout(origine: string, serveur: string, secret: string): string[] {
  const entete = `Authorization: Bearer ${secret}`;
  const enTeteCite = /^[\w .~+/=:-]+$/.test(entete) ? `"${entete}"` : argument(entete);
  return ['claude', 'mcp', 'add', '--transport', 'http', '--scope', 'user', argument(serveur), argument(`${origine}/mcp`), '--header', enTeteCite];
}

/** La commande d’ajout seule, sur une ligne. */
export function commandeClaudeCode(origine: string, serveur: string, secret: string): string {
  return motsAjout(origine, serveur, secret).join(' ');
}

/** La commande qui retire le serveur de Claude Code (portée utilisateur, celle de l’ajout). */
export function motsRetrait(serveur: string): string[] {
  return ['claude', 'mcp', 'remove', '--scope', 'user', argument(serveur)];
}

export function commandeRetrait(serveur: string): string {
  return motsRetrait(serveur).join(' ');
}

/** Ce qui suit le retrait dans la commande à coller : il échoue sans bruit quand le serveur est inconnu. */
export const RETRAIT_SILENCIEUX = '2>/dev/null';

/**
 * La commande à coller, en deux lignes : retirer le serveur du même nom s’il
 * existe (un accès précédent, révoqué ou perdu), puis l’ajouter avec le
 * nouveau secret. `claude mcp add` refuse un nom déjà connu, et sort quand
 * même avec le code 0 : sans la première ligne, recréer un accès échouerait
 * sans qu’on le voie.
 */
export function lignesCommande(origine: string, serveur: string, secret: string): string[][] {
  return [[...motsRetrait(serveur), RETRAIT_SILENCIEUX], motsAjout(origine, serveur, secret)];
}

export function commandeRemplacement(origine: string, serveur: string, secret: string): string {
  return lignesCommande(origine, serveur, secret).map((mots) => mots.join(' ')).join('\n');
}

const relatif = new Intl.RelativeTimeFormat('fr-FR', { numeric: 'auto' });
const jour = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' });

/** Une cellule commence par une capitale : « À l’instant », « Il y a 5 minutes », « Hier », « Le 14 oct. 2026 ». */
const capitale = (texte: string) => texte.charAt(0).toLocaleUpperCase('fr') + texte.slice(1);

/** L’âge d’une utilisation, « À l’instant », « Il y a 5 minutes », « Hier »… puis la date au-delà d’une semaine. */
export function depuis(valeur: string, maintenant = Date.now()): string {
  const instant = Date.parse(valeur);
  if (Number.isNaN(instant)) return 'Date inconnue';
  const secondes = Math.max(0, Math.round((maintenant - instant) / 1000));
  if (secondes < 60) return 'À l’instant';
  const minutes = Math.floor(secondes / 60);
  if (minutes < 60) return capitale(relatif.format(-minutes, 'minute'));
  const heures = Math.floor(minutes / 60);
  if (heures < 24) return capitale(relatif.format(-heures, 'hour'));
  const jours = Math.floor(heures / 24);
  if (jours < 7) return capitale(relatif.format(-jours, 'day'));
  return `Le ${jour.format(instant)}`;
}
