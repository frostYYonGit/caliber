import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { initAnalytics } from './lib/analytics';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// PostHog (~70KB) loads AFTER first paint so it never competes with the landing's
// critical render (P0: speed). Events fired before it's ready are queued by
// trackEvent and flushed on init; Vercel Analytics receives them immediately.
if (typeof window.requestIdleCallback === 'function') {
  window.requestIdleCallback(() => initAnalytics(), { timeout: 3000 });
} else {
  window.setTimeout(() => initAnalytics(), 1500);
}
