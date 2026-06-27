import type { ReactNode } from 'react';
import { useQuiz } from '../state/QuizContext';
import { MAX_REPS, parseNum } from '../state/quizReducer';
import { LIFT_BY_ID, TIER_COLOR, type LiftId } from '../data/standards';
import { oneRM, scoreLift } from '../lib/scoring';
import { formatWeight, toKg } from '../lib/units';

/** Big weight input + reps stepper + live methodology readout (§3). */
export function LiftCard({ id }: { id: LiftId }) {
  const { state, dispatch } = useQuiz();
  const meta = LIFT_BY_ID[id];
  const draft = state.lifts[id]!;

  const weightNum = parseNum(draft.weight);
  const bwKg = toKg(parseNum(state.bodyweight), state.unit);
  const hasWeight =
    Number.isFinite(weightNum) && (meta.addedLoad ? weightNum >= 0 : weightNum > 0);
  const canScore = hasWeight && state.sex && bwKg > 0 && Number.isFinite(parseNum(state.age));

  let readout: ReactNode = (
    <span className="text-textmut">
      {meta.addedLoad ? 'Added weight over bodyweight' : 'Enter your best set'}
    </span>
  );
  // Reaffirming, signal-true per-lift feedback (Edit B) — never shames a low number.
  let affirm: { text: string; cls: string } | null = null;

  if (canScore) {
    const weightKg = toKg(weightNum, state.unit);
    const est1rm = oneRM(weightKg, draft.reps);
    const ratio = est1rm / bwKg;
    const res = scoreLift(
      { id, weightKg, reps: draft.reps },
      {
        sex: state.sex!,
        age: parseNum(state.age),
        bodyweightKg: bwKg,
        population: state.population,
      },
    );
    readout = (
      <span className="text-text2">
        ≈ <span className="text-text">{formatWeight(est1rm, state.unit)}</span> 1RM
        <span className="mx-1.5 text-line">·</span>
        {ratio.toFixed(2)}× BW
        <span className="mx-1.5 text-line">·</span>
        <span style={{ color: TIER_COLOR[res.tier] }} className="font-semibold">
          {res.tier}
        </span>
      </span>
    );
    affirm =
      res.percentile >= 80
        ? { text: 'Strong number — top of the pack.', cls: 'text-accent' }
        : res.percentile >= 40
          ? { text: 'Solid. Right in the mix.', cls: 'text-text2' }
          : { text: 'Logged. That’s your baseline to beat.', cls: 'text-textmut' };
  }

  const setReps = (delta: number) =>
    dispatch({ type: 'SET_LIFT_REPS', id, reps: draft.reps + delta });

  return (
    <div className="rounded-2xl border border-line bg-surface p-3.5">
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold uppercase tracking-wide text-text">
              {meta.name}
            </span>
            {!meta.scored && (
              <span className="font-mono rounded bg-raised px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-textmut">
                tracked
              </span>
            )}
          </div>
          {meta.hint && (
            <span className="font-mono text-[10px] uppercase tracking-wide text-textmut">
              {meta.hint}
            </span>
          )}
        </div>
        <button
          aria-label={`Remove ${meta.name}`}
          onClick={() => dispatch({ type: 'REMOVE_LIFT', id })}
          className="-mt-1 rounded-md px-2 py-0.5 text-lg leading-none text-textmut transition-colors hover:text-accent"
        >
          ×
        </button>
      </div>

      <div className="mt-2.5 flex items-stretch gap-2.5">
        {/* Big weight input */}
        <div className="flex flex-1 items-center rounded-xl border border-line bg-raised px-4 focus-within:border-accent">
          <input
            type="number"
            inputMode="decimal"
            aria-label={`${meta.name} weight`}
            value={draft.weight}
            placeholder={meta.addedLoad ? '0' : '—'}
            onChange={(e) => dispatch({ type: 'SET_LIFT_WEIGHT', id, weight: e.target.value })}
            className="font-display w-full bg-transparent py-2.5 text-2xl font-extrabold text-text outline-none placeholder:text-textmut/40"
            style={{ minHeight: 50 }}
          />
          <span className="font-mono ml-2 shrink-0 text-sm font-bold uppercase text-textmut">
            {state.unit}
          </span>
        </div>

        {/* Reps stepper */}
        <div className="flex shrink-0 items-center rounded-xl border border-line bg-raised">
          <button
            aria-label="Fewer reps"
            onClick={() => setReps(-1)}
            disabled={draft.reps <= 1}
            className="flex h-full w-10 items-center justify-center text-xl font-bold text-text2 disabled:text-textmut/40"
          >
            −
          </button>
          <div className="flex w-12 flex-col items-center justify-center px-1">
            <span className="font-display text-xl font-extrabold leading-none text-text">
              {draft.reps}
            </span>
            <span className="font-mono mt-0.5 text-[10px] uppercase text-textmut">reps</span>
          </div>
          <button
            aria-label="More reps"
            onClick={() => setReps(1)}
            disabled={draft.reps >= MAX_REPS}
            className="flex h-full w-10 items-center justify-center text-xl font-bold text-text2 disabled:text-textmut/40"
          >
            +
          </button>
        </div>
      </div>

      <p className="font-mono mt-2.5 text-[13px]">{readout}</p>
      {affirm && <p className={`mt-1 text-[12px] ${affirm.cls}`}>{affirm.text}</p>}
    </div>
  );
}
