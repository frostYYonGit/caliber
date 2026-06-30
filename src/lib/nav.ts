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
