/**
 * Error-Klasse fuer fehlende Authentifizierung.
 */
export class UnauthorizedError extends Error {}

/**
 * Error-Klasse fuer fehlende Berechtigung.
 */
export class ForbiddenError extends Error {}

/**
 * Error-Klasse fuer interne Security-Fehler.
 */
export class InternalServerError extends Error {}
