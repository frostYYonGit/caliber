import type { ReactNode } from 'react';
import { useQuiz } from '../state/QuizContext';
import { MAX_REPS, isLiftEntered, parseNum } from '../state/quizReducer';
import { LIFT_BY_ID, TIER_COLOR, customName, isCustom, isScored, type LiftId } from '../data/standards';
import { oneRM, scoreLift } from '../lib/scoring';
import { formatWeight, fromKg, toKg, type Unit } from '../lib/units';
import { trackEvent, trackEventOnce } from '../lib/analytics';

/** Sample placeholder number so the field reads as typeable, sized to the lift. */
function placeholder(unit: Unit, addedLoad: boolean, perHand: boolean): string {
  if (addedLoad) return unit === 'kg' ? '20' : '45';
  if (perHand) return unit === 'kg' ? '20' : '45';
  return unit === 'kg' ? '60' : '135';
}

/** Always-expanded weight input + reps stepper + live readout (§3). Custom
 *  (logged, unscored) lifts accept a number but never affect the rank. */
export function LiftCard({ id }: { id: LiftId }) {
  const { state, dispatch } = useQuiz();
  const custom = isCustom(id);
  const meta = custom ? null : LIFT_BY_ID[id];
  const draft = state.lifts[id]!;
  // Tracked-only: a real catalog lift with no verified standard — logged, never ranked.
  const ranked = !custom && isScored(id);

  const name = custom ? customName(id) : meta!.name;
  const addedLoad = !custom && meta!.addedLoad;
  const perHand = !custom && !!meta!.perHand;
  const hint = custom ? 'logged · not ranked yet' : meta?.hint;

  const weightNum = parseNum(draft.weight);
  const bwKg = toKg(parseNum(state.bodyweight), state.unit);
  const hasWeight = Number.isFinite(weightNum) && (addedLoad ? weightNum >= 0 : weightNum > 0);
  const canScore = ranked && hasWeight && state.sex && bwKg > 0 && Number.isFinite(parseNum(state.age));

  let readout: ReactNode = null;
  if (canScore) {
    const weightKg = toKg(weightNum, state.unit);
    const est1rm = oneRM(weightKg, draft.reps);
    const ratio = est1rm / bwKg;
    const res = scoreLift(
      { id, weightKg, reps: draft.reps },
      { sex: state.sex!, age: parseNum(state.age), bodyweightKg: bwKg, population: state.population },
    );
    const affirm =
      res.percentile >= 80
        ? { text: 'Strong number — top of the pack.', cls: 'text-accent' }
        : res.percentile >= 40
          ? { text: 'Solid. Right in the mix.', cls: 'text-text2' }
          : { text: 'Logged. That’s your baseline to beat.', cls: 'text-textmut' };
    readout = (
      <>
        <p className="font-mono mt-2.5 text-[13px] text-text2">
          ≈ <span className="text-text">{formatWeight(est1rm, state.unit)}</span> 1RM
          <span className="mx-1.5 text-line">·</span>
          {ratio.toFixed(2)}× BW
          <span className="mx-1.5 text-line">·</span>
          <span style={{ color: TIER_COLOR[res.tier] }} className="font-semibold">
            {res.tier}
          </span>
        </p>
        <p className={`mt-1 text-[12px] ${affirm.cls}`}>{affirm.text}</p>
      </>
    );
  } else if (!ranked) {
    readout = <p className="font-mono mt-2.5 text-[13px] text-textmut">Logged — won’t affect your rank.</p>;
  }

  const setReps = (delta: number) =>
    dispatch({ type: 'SET_LIFT_REPS', id, reps: draft.reps + delta });

  // Funnel events on a committed (valid) entry — first_lift_entered fires once.
  const fireLiftEvent = () => {
    if (!canScore) return;
    const weightKg = toKg(weightNum, state.unit);
    const est1rm = oneRM(weightKg, draft.reps);
    const props = {
      lift_name: name,
      weight: weightNum,
      reps: draft.reps,
      estimated_1rm: Math.round(fromKg(est1rm, state.unit)),
      bodyweight_ratio: +(est1rm / bwKg).toFixed(2),
    };
    trackEventOnce('first_lift', 'first_lift_entered', props);
    trackEvent('lift_added_or_updated', {
      ...props,
      lift_category: meta?.bodyPart,
      total_valid_lifts: state.order.filter(
        (lid) => LIFT_BY_ID[lid] && isLiftEntered(lid, state.lifts[lid]),
      ).length,
    });
  };

  return (
    <div className="rounded-2xl border border-line bg-surface p-3.5">
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold uppercase tracking-wide text-text">{name}</span>
            {!ranked && (
              <span className="font-mono rounded bg-raised px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-textmut">
                tracked · not ranked
              </span>
            )}
          </div>
          {hint && (
            <span className="font-mono text-[10px] uppercase tracking-wide text-textmut">{hint}</span>
          )}
        </div>
        <button
          aria-label={`Remove ${name}`}
          onClick={() => dispatch({ type: 'REMOVE_LIFT', id })}
          className="-mt-1 rounded-md px-2 py-0.5 text-lg leading-none text-textmut transition-colors hover:text-accent"
        >
          ×
        </button>
      </div>

      <div className="mt-2.5 flex items-stretch gap-2.5">
        <div className="flex flex-1 items-center rounded-xl border border-line bg-raised px-4 focus-within:border-accent">
          <input
            type="number"
            inputMode="decimal"
            aria-label={`${name} weight`}
            value={draft.weight}
            placeholder={placeholder(state.unit, addedLoad, perHand)}
            onChange={(e) => dispatch({ type: 'SET_LIFT_WEIGHT', id, weight: e.target.value })}
            onBlur={fireLiftEvent}
            className="font-display w-full bg-transparent py-2.5 text-2xl font-extrabold text-text caret-accent outline-none placeholder:text-textmut/40"
            style={{ minHeight: 50 }}
          />
          <span className="font-mono ml-2 shrink-0 text-sm font-bold uppercase text-textmut">
            {state.unit}
          </span>
        </div>

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
            <span className="font-display text-xl font-extrabold leading-none text-text">{draft.reps}</span>
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

      {draft.reps >= MAX_REPS && (
        <p className="font-mono mt-2 text-[11px] leading-snug text-textmut">
          Capped at {MAX_REPS} — past this, a 1-rep-max estimate isn’t accurate. Enter a heavier set
          for a true read.
        </p>
      )}

      {readout}
    </div>
  );
}
