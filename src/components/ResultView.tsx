import { useRef } from 'react';
import { rankUpLabel, type IronRankResult } from '../lib/result';
import { ARCHETYPES } from '../data/archetypes';
import { trackEvent } from '../lib/analytics';
import { ResultCard } from './ResultCard';
import { ShareActions } from './ShareActions';

/**
 * Result screen: the lean hero card → share actions (right under it) → the
 * demoted secondary details → methodology → rank again. Share sits directly
 * below the card so it's the first thing after the result (Edit 2).
 */
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
  const arch = result.archetype ? ARCHETYPES[result.archetype.id] : null;
  const rankUp = rankUpLabel(result);

  const rankAgain = () => {
    trackEvent('rank_again_clicked', {
      previous_archetype: arch ? arch.name : 'none',
      previous_strength_score: result.composite.strengthScore,
    });
    onStartOver();
  };

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <ResultCard ref={cardRef} result={result} animate={animate} />

      {/* Share — directly below the card, the first thing after the result */}
      <ShareActions result={result} cardRef={cardRef} />
      <div className="-mt-2 w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-center">
        <p className="text-[13px] text-text2">
          Post your card.{' '}
          <span className="text-text">Tag your weakest lift.</span>{' '}
          <span className="text-accent">→ build in public</span>
        </p>
      </div>

      {/* Secondary details — demoted, below the card + share */}
      {(rankUp || arch) && (
        <div className="flex w-full flex-col gap-3">
          {rankUp && (
            <div
              className="flex items-center gap-2 rounded-xl px-4 py-2.5"
              style={{ background: 'rgba(255,122,46,0.08)', border: '1px solid rgba(255,122,46,0.25)' }}
            >
              <span className="text-sm font-bold text-accent">↑</span>
              <span className="text-[13px] text-text2">
                Next rank-up: <span className="font-mono font-bold text-text">{rankUp}</span>
              </span>
            </div>
          )}
          {arch && (
            <>
              <p className="text-[13px] leading-relaxed text-text2">{arch.description}</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-line bg-surface px-3 py-2">
                  <p className="font-mono text-[10px] uppercase tracking-wide" style={{ color: arch.color }}>
                    Flex
                  </p>
                  <p className="mt-0.5 text-[12px] leading-snug text-text">{arch.flex}</p>
                </div>
                <div className="rounded-lg border border-line bg-surface px-3 py-2">
                  <p className="font-mono text-[10px] uppercase tracking-wide text-textmut">Flaw</p>
                  <p className="mt-0.5 text-[12px] leading-snug text-text2">{arch.flaw}</p>
                </div>
              </div>
              <p className="font-mono text-center text-[11px] text-textmut">
                Your rival:{' '}
                <span className="font-bold" style={{ color: ARCHETYPES[arch.rival].color }}>
                  {ARCHETYPES[arch.rival].name}
                </span>
                .
              </p>
            </>
          )}
        </div>
      )}

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
        onClick={rankAgain}
        className="font-mono text-sm text-textmut underline-offset-4 transition-colors hover:text-text hover:underline"
      >
        ↺ Rank yourself again
      </button>
    </div>
  );
}
