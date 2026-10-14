/**
 * Ce que partagent les scripts du backoffice (backoffice.ts et ses modules) :
 * l’erreur de l’API et la façon de dire un retour à côté d’une action.
 */
export type Etat = 'pending' | 'success' | 'error';

/** Dit un retour dans la zone de l’action en cours (components/backoffice/Retour.astro). */
export type Dire = (message: string, etat?: Etat) => void;

/** Une erreur dont le message s’affiche tel quel : celui de l’API, ou un texte écrit pour l’interface. */
export class ErreurApi extends Error {
  constructor(message: string, readonly status: number, readonly code?: string) { super(message); }
}

/** Le message à montrer pour une erreur : le sien s’il a été écrit pour l’interface, sinon une panne de réseau. */
export function messageDe(cause: unknown): string {
  return cause instanceof ErreurApi ? cause.message : 'Le backoffice est injoignable. Vérifiez la connexion puis réessayez.';
}
