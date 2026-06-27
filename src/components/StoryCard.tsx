import { forwardRef } from 'react';
import { APP_NAME, TAGLINE, shareHost } from '../config';
import type { IronRankResult } from '../lib/result';
import { ResultCard } from './ResultCard';

/** 1080×1920 Stories/Reels variant (§6.4). Card centered, headline + handle. */
export const StoryCard = forwardRef<HTMLDivElement, { result: IronRankResult }>(
  function StoryCard({ result }, ref) {
    return (
      <div
        ref={ref}
        className="app-bg flex flex-col items-center justify-between"
        style={{ width: 1080, height: 1920, padding: '120px 80px' }}
      >
        <div className="text-center">
          <p className="font-display text-5xl font-black tracking-tight text-text">
            {APP_NAME}
            <span style={{ color: 'var(--color-accent)' }}>.</span>
          </p>
          <p className="font-ui mt-3 text-2xl text-text2">{TAGLINE}</p>
        </div>

        <div style={{ transform: 'scale(2.35)', transformOrigin: 'center' }}>
          <ResultCard result={result} animate={false} />
        </div>

        <div className="text-center">
          <p className="font-ui text-2xl font-semibold text-text">{TAGLINE}</p>
          <p className="font-display mt-2 text-3xl font-extrabold text-accent">{shareHost()}</p>
        </div>
      </div>
    );
  },
);
