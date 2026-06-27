import { useRef } from 'react';
import type { IronRankResult } from '../lib/result';
import { ResultCard } from './ResultCard';
import { ShareActions } from './ShareActions';

/** The full result screen: card + share actions + methodology + nudge (§5/§6). */
export function ResultView({
  result,
  onStartOver,
  animate = true,
}: {
  result: IronRankResult;
  onStartOver: () => void;
  animate?: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <ResultCard ref={cardRef} result={result} animate={animate} />

      <ShareActions result={result} cardRef={cardRef} />

      {/* Post-result nudge (in-app, not on the card) §6.6 */}
      <div className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-center">
        <p className="text-sm text-text2">
          Screenshot it. Post it.{' '}
          <span className="text-text">Tag your weakest lift.</span>{' '}
          <span className="text-accent">→ build in public</span>
        </p>
      </div>

      {/* Expandable methodology (§4.5) */}
      <details className="w-full rounded-xl border border-line bg-surface px-4 py-3">
        <summary className="cursor-pointer text-sm font-semibold text-text2 marker:text-accent">
          How is this calculated?
        </summary>
        <p className="mt-2 text-[13px] leading-relaxed text-text2">
          Your score is the bodyweight-, age-, and population-adjusted percentile of your
          lifts, mapped to 0–1000. Each lift’s 1-rep max is estimated via the Epley formula,
          divided by your bodyweight, age-calibrated to peak-age standards, then ranked
          against the population you chose. DOTS uses the official IPF coefficients.
        </p>
      </details>

      <button
        onClick={onStartOver}
        className="font-mono text-sm text-textmut underline-offset-4 transition-colors hover:text-text hover:underline"
      >
        ↺ Rank yourself again
      </button>
    </div>
  );
}
