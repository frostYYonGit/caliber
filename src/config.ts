/**
 * Single source for app identity. The share URL + handle are the invitation
 * that travels with every card — change them here once a domain is owned.
 */
export const APP_NAME = 'CALIBER';
export const HANDLE = '@caliberlifts';

/** Big, screenshot-friendly headline — the brand is the question. */
export const TAGLINE = "What's your Caliber?";

/**
 * Canonical public origin. The owned domain — every card/link prints this
 * (falls back to the live deploy origin only if ever unset).
 */
export const CANONICAL_ORIGIN: string | null = 'https://caliberlifts.app';

/** The origin to build share links against (canonical if set, else live). */
export function shareOrigin(): string {
  if (CANONICAL_ORIGIN) return CANONICAL_ORIGIN;
  if (typeof window !== 'undefined') return window.location.origin;
  return '';
}

/** Host only, for printing on the card (e.g. "caliberlifts.app"). */
export function shareHost(): string {
  return shareOrigin().replace(/^https?:\/\//, '');
}
