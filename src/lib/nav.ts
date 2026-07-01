/**
 * Tiny SPA navigation helper. App derives its route from the URL and listens for
 * popstate, so pushing the path + dispatching popstate switches routes without a
 * full reload (no flash, no refetch).
 */
export function goToLanding(): void {
  window.history.pushState({}, '', '/');
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo(0, 0);
}

/**
 * Session bridge for the challenge loop: when someone accepts a challenge we stash
 * the challenger's encoded result, and the funnel reads (and consumes) it on
 * finish to render the head-to-head. Kept out of the URL so it survives the
 * multi-step quiz; the result URL then carries it via `vs` for shareability.
 */
const CHALLENGER_KEY = 'caliber_challenger';

export function stashChallenger(encoded: string): void {
  try {
    sessionStorage.setItem(CHALLENGER_KEY, encoded);
  } catch {
    /* private mode / no storage — challenge just won't compare, still ranks */
  }
}

/** Read and clear the stashed challenger (consume-once). */
export function takeChallenger(): string | null {
  try {
    const v = sessionStorage.getItem(CHALLENGER_KEY);
    if (v) sessionStorage.removeItem(CHALLENGER_KEY);
    return v;
  } catch {
    return null;
  }
}
