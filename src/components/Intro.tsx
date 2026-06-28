import { APP_NAME } from '../config';
import { PrimaryButton } from './ui';
import { ARCHETYPES, ARCHETYPE_SHOWCASE } from '../data/archetypes';
import { buildResult } from '../lib/result';
import { ResultCard } from './ResultCard';

/** A real rendered sample card (Powerbuilder) — show the payoff, don't describe it. */
const SAMPLE = buildResult({
  sex: 'male',
  age: 28,
  bodyweightKg: 84,
  population: 'gym',
  unit: 'kg',
  entries: [
    { id: 'back_squat', weightKg: 165, reps: 1 },
    { id: 'bench_press', weightKg: 120, reps: 1 },
    { id: 'deadlift', weightKg: 205, reps: 1 },
    { id: 'overhead_press', weightKg: 80, reps: 1 },
  ],
});

const CHIPS = ARCHETYPE_SHOWCASE.slice(0, 4).map((id) => ARCHETYPES[id]);
const MORE = ARCHETYPE_SHOWCASE.length - CHIPS.length;

/** Value-first landing (Edit 4) — identity hook, with the score as credibility. */
export function Intro({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <div className="flex flex-1 flex-col pt-8">
        <p className="font-display text-lg font-extrabold tracking-tight text-text">
          {APP_NAME}
          <span className="text-accent">.</span>
        </p>
        <p className="font-mono mt-4 text-xs uppercase tracking-[0.3em] text-accent">Strength, typed.</p>
        <h1 className="font-display mt-2 text-[2.7rem] font-black leading-[0.97] tracking-[-0.03em] text-text">
          What kind of lifter are you?
        </h1>
        <p className="mt-3 max-w-[24rem] text-[15px] leading-snug text-text2">
          Enter your lifts. Get your <span className="text-text">type</span>, your rank, and the
          card to prove it.
        </p>

        {/* Visual proof — a real sample card, peeking */}
        <div className="mt-7 flex justify-center" aria-hidden>
          <div
            className="relative"
            style={{ width: 244, height: 304, overflow: 'hidden', transform: 'rotate(-2deg)', borderRadius: 22 }}
          >
            <div style={{ width: 392, transform: 'scale(0.622)', transformOrigin: 'top left', pointerEvents: 'none' }}>
              <ResultCard result={SAMPLE} animate={false} />
            </div>
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0"
              style={{ height: 130, background: 'linear-gradient(to bottom, transparent, var(--color-bg))' }}
            />
          </div>
        </div>

        {/* Type teaser chips */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5">
          {CHIPS.map((a) => (
            <span
              key={a.id}
              className="font-mono rounded-full border px-2.5 py-1 text-[11px] font-bold"
              style={{ color: a.color, borderColor: `${a.color}55`, background: `${a.color}14` }}
            >
              {a.name}
            </span>
          ))}
          <span className="font-mono rounded-full border border-line px-2.5 py-1 text-[11px] font-bold text-textmut">
            +{MORE} more
          </span>
        </div>
        <p className="mt-2 text-center text-sm font-semibold text-text">Which one are you?</p>

        {/* Credibility strip (secondary) */}
        <p className="font-mono mt-6 text-center text-[11px] leading-relaxed text-textmut">
          Epley 1RM · age &amp; bodyweight adjusted · DOTS · ranked vs a crowd you choose.
        </p>
      </div>

      <div className="sticky bottom-0 -mx-5 border-t border-line bg-bg px-5 pb-6 pt-4">
        <PrimaryButton onClick={onStart}>Find your type →</PrimaryButton>
        <p className="font-mono mt-3 text-center text-[11px] uppercase tracking-wide text-textmut">
          No signup · ~60 seconds · free
        </p>
      </div>
    </div>
  );
}
