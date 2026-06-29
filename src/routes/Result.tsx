import { useEffect, useMemo, useRef } from 'react';
import { decodeResult } from '../lib/share';
import { ResultView } from '../components/ResultView';
import { Shell } from './Home';
import { PrimaryButton } from '../components/ui';
import { APP_NAME, TAGLINE } from '../config';
import { trackEvent, resultEventProps } from '../lib/analytics';

/** Reads URL params and renders the card directly — skips onboarding (§6.2). */
export function Result() {
  const result = useMemo(
    () => decodeResult(new URLSearchParams(window.location.search)),
    [],
  );

  // Fire result_generated once for a shared-link landing (not per re-render).
  const fired = useRef(false);
  useEffect(() => {
    if (result && !fired.current) {
      fired.current = true;
      trackEvent('result_generated', { ...resultEventProps(result), source: 'shared_link' });
    }
  }, [result]);

  const goHome = () => {
    window.history.pushState({}, '', '/');
    window.location.reload();
  };

  if (!result) {
    return (
      <Shell>
        <div className="flex min-h-dvh flex-col items-center justify-center gap-5 text-center">
          <p className="font-display text-3xl font-black text-text">
            {APP_NAME}
            <span className="text-accent">.</span>
          </p>
          <p className="text-text2">That result link looks broken or incomplete.</p>
          <div className="w-full max-w-[280px]">
            <PrimaryButton onClick={goHome}>Rank yourself →</PrimaryButton>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="pt-6 text-center">
        <p className="font-display text-xl font-black tracking-tight text-text">
          {APP_NAME}
          <span className="text-accent">.</span>
        </p>
        <p className="font-mono mt-1 text-xs uppercase tracking-[0.2em] text-textmut">
          {TAGLINE}
        </p>
      </div>
      <div className="flex-1 py-6">
        <ResultView result={result} onStartOver={goHome} />
      </div>
    </Shell>
  );
}
