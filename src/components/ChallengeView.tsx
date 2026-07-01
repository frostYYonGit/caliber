import { useEffect, useRef } from 'react';
import type { IronRankResult } from '../lib/result';
import { topPercent } from '../lib/result';
import { ARCHETYPES } from '../data/archetypes';
import { trackEvent } from '../lib/analytics';
import { shareEventProps } from '../lib/analytics-result';
import { ResultCard } from './ResultCard';

/**
 * What a friend sees when they open a "Challenge a friend" link. The challenger's
 * card is shown up front, framed as a dare, with one obvious response: take the
 * test and beat it. Pure URL-state — the challenger's result came in the link.
 */
export function ChallengeView({
  challenger,
  onTakeTest,
  onJustRank,
}: {
  challenger: IronRankResult;
  onTakeTest: () => void;
  onJustRank: () => void;
}) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    trackEvent('challenge_viewed', shareEventProps(challenger));
  }, [challenger]);

  const arch = challenger.archetype ? ARCHETYPES[challenger.archetype.id] : null;
  const score = challenger.composite.strengthScore;
  const top = topPercent(challenger.composite.overallPct);

  const take = () => {
    trackEvent('take_challenge_clicked', shareEventProps(challenger));
    onTakeTest();
  };

  return (
    <div className="flex w-full flex-col items-center">
      <p className="font-mono mt-2 text-xs font-bold uppercase tracking-[0.25em] text-accent">
        ⚔ You’ve been challenged
      </p>
      <h1 className="font-display mt-2 text-center text-[2rem] font-black leading-[1.02] tracking-tight text-text">
        {arch ? `A ${arch.name}` : `A ${top}`} says beat this.
      </h1>
      <p className="mt-2 text-center text-[15px] text-text2">
        They scored <span className="font-bold text-text">{score}</span> · {top}. Your move.
      </p>

      <div className="mt-6">
        <ResultCard result={challenger} animate={false} />
      </div>

      <div className="mt-6 w-full">
        <button
          onClick={take}
          className="font-display flex w-full items-center justify-center rounded-xl bg-accent px-5 text-[17px] font-black tracking-tight text-[#0E0F12] transition-colors hover:bg-[#ff8a45]"
          style={{ minHeight: 56 }}
        >
          Take the test → beat this
        </button>
        <p className="mt-2 text-center text-[13px] text-text2">Free · No signup · 60 seconds</p>
      </div>

      <button
        onClick={onJustRank}
        className="font-mono mt-4 text-sm text-textmut underline-offset-4 transition-colors hover:text-text hover:underline"
      >
        Just rank myself instead
      </button>
    </div>
  );
}
