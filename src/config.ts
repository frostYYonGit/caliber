/**
 * Single source for app identity. The share URL + handle are the invitation
 * that travels with every card — change them here once a domain is owned.
 */
export const APP_NAME = 'CALIBER';
export const HANDLE = '@caliber';

/** Big, screenshot-friendly headline — the brand is the question. */
export const TAGLINE = "What's your Caliber?";

/**
 * Canonical public origin (e.g. "https://caliber.app"). Leave null until a
 * domain is actually owned — cards then fall back to the live deploy origin so
 * we never print a URL we don't control.
 */
export const CANONICAL_ORIGIN: string | null = null;

/** The origin to build share links against (canonical if set, else live). */
export function shareOrigin(): string {
  if (CANONICAL_ORIGIN) return CANONICAL_ORIGIN;
  if (typeof window !== 'undefined') return window.location.origin;
  return '';
}

/** Host only, for printing on the card ("caliber.app" / "caliber.netlify.app"). */
export function shareHost(): string {
  return shareOrigin().replace(/^https?:\/\//, '');
}
