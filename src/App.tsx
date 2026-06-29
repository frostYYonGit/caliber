import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Landing } from './routes/Landing';
import { Shell } from './components/Shell';

// Code-split: the funnel (scoring engine, html-to-image, step UI) and the
// shared-result view load ONLY when needed, never on the landing (P0: speed).
const Quiz = lazy(() => import('./routes/Quiz'));
const Result = lazy(() => import('./routes/Result').then((m) => ({ default: m.Result })));

type Route = 'landing' | 'quiz' | 'result';

function getRoute(): Route {
  const path = window.location.pathname.replace(/\/+$/, '');
  const params = new URLSearchParams(window.location.search);
  return path === '/r' || params.has('s') ? 'result' : 'landing';
}

/** Lightweight hold while a lazy chunk loads — no heavy deps, no layout jump. */
function Splash() {
  return (
    <Shell>
      <div className="flex min-h-dvh items-center justify-center">
        <p className="font-display text-2xl font-black tracking-tight text-textmut">
          CALIBER<span className="text-accent">.</span>
        </p>
      </div>
    </Shell>
  );
}

export default function App() {
  const [route, setRoute] = useState<Route>(getRoute);

  useEffect(() => {
    const onPop = () => setRoute(getRoute());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const startQuiz = useCallback(() => {
    setRoute('quiz');
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      {route === 'result' ? (
        <Suspense fallback={<Splash />}>
          <Result />
        </Suspense>
      ) : route === 'quiz' ? (
        <Suspense fallback={<Splash />}>
          <Quiz />
        </Suspense>
      ) : (
        <Landing onStart={startQuiz} />
      )}
      <Analytics />
      <SpeedInsights />
    </>
  );
}
