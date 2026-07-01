import { forwardRef } from 'react';
import { APP_NAME, shareHost } from '../config';
import { LIFT_BY_ID, TIER_COLOR } from '../data/standards';
import { ARCHETYPES } from '../data/archetypes';
import { topPercent, type IronRankResult } from '../lib/result';
import { compareResults, type Outcome } from '../lib/compare';

function hexToRgba(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

const OUTCOME_COLOR: Record<Outcome, string> = {
  win: '#5FD08A', // green — you're on top
  lose: '#8AB4F8', // calm steel — not an alarming red
  tie: '#FFD45E', // gold
};

interface Side {
  label: string;
  name: string;
  color: string;
  icon: string;
  top: string;
  score: number;
}

function sideOf(result: IronRankResult, label: string): Side {
  const arch = result.archetype ? ARCHETYPES[result.archetype.id] : null;
  const tier = result.composite.overallTier;
  return {
    label,
    name: arch ? arch.name : tier,
    color: arch ? arch.color : TIER_COLOR[tier],
    icon: arch ? arch.icon : '◆',
    top: topPercent(result.composite.overallPct),
    score: result.composite.strengthScore,
  };
}

function Column({ s, win }: { s: Side; win: boolean }) {
  const words = s.name.split(' ');
  const longest = Math.max(...words.map((w) => w.length));
  // Sized to the longest unwrappable word so "POWERBUILDER" never clips the column.
  const nameSize = longest >= 12 ? 13 : longest >= 10 ? 15 : longest >= 8 ? 18 : 22;
  return (
    <div
      className="relative flex flex-1 flex-col items-center overflow-hidden text-center"
      style={{ opacity: win ? 1 : 0.82 }}
    >
      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-textmut">
        {s.label}
      </span>
      <span className="mt-1.5 text-2xl leading-none" style={{ color: s.color }}>
        {s.icon}
      </span>
      <span
        className="font-display mt-1.5 font-black uppercase leading-[0.95]"
        style={{ color: s.color, fontSize: nameSize, letterSpacing: '-0.02em' }}
      >
        {s.name}
      </span>
      <span className="font-display mt-2 whitespace-nowrap text-[22px] font-black capitalize leading-none text-text">
        {s.top.toLowerCase()}
      </span>
      <span className="font-mono mt-1 text-[10px] uppercase tracking-wide text-textmut">
        Score {s.score}
      </span>
    </div>
  );
}

/**
 * Side-by-side compare card — the "I beat Jake" trophy. Premium + screenshot-
 * worthy, exportable (forwardRef) so it's its own share trigger. All from URL
 * state; no accounts.
 */
export const HeadToHead = forwardRef<
  HTMLDivElement,
  { you: IronRankResult; them: IronRankResult }
>(function HeadToHead({ you, them }, ref) {
  const cmp = compareResults(you, them);
  const oc = OUTCOME_COLOR[cmp.outcome];
  const youSide = sideOf(you, 'You');
  const themSide = sideOf(them, 'Rival');

  return (
    <div
      ref={ref}
      className="relative overflow-hidden"
      style={{
        width: 392,
        background: `radial-gradient(130% 90% at 50% -10%, ${hexToRgba(oc, 0.35)} 0%, transparent 55%), linear-gradient(168deg, ${hexToRgba(oc, 0.06)} 0%, #141519 42%, #0E0F12 100%)`,
        border: '1px solid var(--color-line)',
        borderRadius: 22,
        padding: 24,
        color: 'var(--color-text)',
      }}
    >
      <div aria-hidden style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: oc }} />

      {/* Header */}
      <div className="mt-1 flex items-center justify-between">
        <span className="font-display text-lg font-extrabold tracking-tight">
          {APP_NAME}
          <span style={{ color: 'var(--color-accent)' }}>.</span>
        </span>
        <span className="font-mono rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ background: 'var(--color-raised)', color: 'var(--color-text2)' }}>
          Head to Head
        </span>
      </div>

      {/* Verdict */}
      <p className="font-display mt-5 text-center text-[2.4rem] font-black leading-none" style={{ color: oc }}>
        {cmp.verdict}
      </p>
      <p className="mt-1 text-center text-[13px] text-text2">
        {cmp.outcome === 'tie'
          ? `${cmp.youScore} — ${cmp.themScore}, no daylight.`
          : `Strength Score ${cmp.youScore} vs ${cmp.themScore}.`}
      </p>

      {/* Two identities */}
      <div className="relative mt-5 flex items-stretch gap-2">
        <Column s={youSide} win={cmp.outcome !== 'lose'} />
        <div className="flex items-center">
          <span className="font-display text-sm font-black text-textmut">VS</span>
        </div>
        <Column s={themSide} win={cmp.outcome !== 'win'} />
      </div>

      {/* Per-lift duel — fuels the group-chat argument */}
      {cmp.lifts.length > 0 && (
        <>
          <div className="my-4 h-px w-full" style={{ background: 'var(--color-line)' }} />
          <div className="flex flex-col gap-2">
            {cmp.lifts.map((d) => (
              <div key={d.id} className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold uppercase tracking-wide text-text2">
                  {LIFT_BY_ID[d.id]?.short ?? d.name}
                </span>
                <span className="font-mono text-[11px]">
                  <span style={{ color: d.winner === 'you' ? OUTCOME_COLOR.win : 'var(--color-textmut)', fontWeight: d.winner === 'you' ? 700 : 400 }}>
                    you {Math.round(d.youPct)}
                  </span>
                  <span className="text-line">{'  ·  '}</span>
                  <span style={{ color: d.winner === 'them' ? OUTCOME_COLOR.win : 'var(--color-textmut)', fontWeight: d.winner === 'them' ? 700 : 400 }}>
                    rival {Math.round(d.themPct)}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Footer — keep the loop going */}
      <div className="mt-4 border-t border-line pt-3 text-center">
        <p className="font-display text-[14px] font-extrabold tracking-tight" style={{ color: oc }}>
          {cmp.outcome === 'win' ? 'Think you can beat me?' : "Your turn."} → {shareHost()}
        </p>
      </div>
    </div>
  );
});
