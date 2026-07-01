import { useEffect, useMemo, useRef } from 'react';
import { decodeResult, decodeOpponent, isChallenge, encodeResult } from '../lib/share';
import { ResultView } from '../components/ResultView';
import { ChallengeView } from '../components/ChallengeView';
import { Shell } from '../components/Shell';
import { PrimaryButton } from '../components/ui';
import { APP_NAME, TAGLINE } from '../config';
import { trackEvent } from '../lib/analytics';
import { resultEventProps } from '../lib/analytics-result';
import { goToLanding, stashChallenger } from '../lib/nav';

/** Reads URL params and renders directly — skips onboarding (§6.2). Also handles
 *  the challenge loop: a challenge link shows "beat this", a `vs` link shows the
 *  head-to-head. `onStartQuiz` drops an accepting friend into the test. */
export function Result({ onStartQuiz }: { onStartQuiz: () => void }) {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const result = useMemo(() => decodeResult(params), [params]);
  const opponent = useMemo(() => decodeOpponent(params), [params]);
  const challengeMode = isChallenge(params);

  // Fire result_generated once for a shared-link landing (not per re-render).
  const fired = useRef(false);
  useEffect(() => {
    if (result && !fired.current) {
      fired.current = true;
      trackEvent('result_generated', {
        ...resultEventProps(result),
        source: challengeMode ? 'challenge_link' : opponent ? 'head_to_head_link' : 'shared_link',
      });
    }
  }, [result, challengeMode, opponent]);

  const goHome = () => goToLanding();

  const Header = ({ tagline = true }: { tagline?: boolean }) => (
    <div className="pt-6 text-center">
      <a
        href="/"
        onClick={(e) => {
          e.preventDefault();
          goToLanding();
        }}
        aria-label="Caliber home"
        className="font-display inline-block cursor-pointer text-xl font-black tracking-tight text-text transition-opacity hover:opacity-80"
      >
        {APP_NAME}
        <span className="text-accent">.</span>
      </a>
      {tagline && (
        <p className="font-mono mt-1 text-xs uppercase tracking-[0.2em] text-textmut">{TAGLINE}</p>
      )}
    </div>
  );

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

  // Challenge link → recipient sees the challenger's card + "take the test".
  if (challengeMode) {
    const takeTest = () => {
      stashChallenger(encodeResult(result));
      onStartQuiz();
    };
    return (
      <Shell>
        <Header tagline={false} />
        <div className="flex-1 py-4">
          <ChallengeView challenger={result} onTakeTest={takeTest} onJustRank={goHome} />
        </div>
      </Shell>
    );
  }

  // Plain result, or a shared head-to-head (`vs` present).
  return (
    <Shell>
      <Header />
      <div className="flex-1 py-6">
        <ResultView result={result} opponent={opponent} onStartOver={goHome} />
      </div>
    </Shell>
  );
}
