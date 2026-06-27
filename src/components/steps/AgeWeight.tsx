import { useQuiz } from '../../state/QuizContext';
import { BigNumberInput, StepShell } from '../ui';
import { parseNum } from '../../state/quizReducer';

export function AgeWeight() {
  const { state, dispatch } = useQuiz();
  const a = parseNum(state.age);
  const ageBad = state.age !== '' && (a < 13 || a > 80);
  const ageOk = Number.isFinite(a) && a >= 13 && a <= 80;
  const bwOk = Number.isFinite(parseNum(state.bodyweight)) && parseNum(state.bodyweight) > 0;

  // Affirmations (Edit B) — contextual, teach that the method is *for* them.
  const ageMsg = !ageOk
    ? null
    : a < 20
      ? "Young — your numbers get age-adjusted, so you're compared fairly, not against grown men in their prime."
      : a <= 34
        ? 'Prime years for this.'
        : "We age-adjust — you're ranked against your own decade.";

  return (
    <StepShell
      kicker="Step 2 · You"
      title="Age & bodyweight"
      subtitle="Both feed the math: every lift is scored relative to your bodyweight, then age-calibrated so the comparison is fair."
    >
      <div className="flex flex-col gap-5">
        <div>
          <p className="font-mono mb-2 text-xs uppercase tracking-wide text-textmut">Age</p>
          <BigNumberInput
            ariaLabel="Age in years"
            value={state.age}
            unit="yrs"
            placeholder="28"
            autoFocus
            onChange={(v) => dispatch({ type: 'SET_AGE', age: v })}
          />
          {ageBad && <p className="mt-2 text-sm text-accent">Enter an age between 13 and 80.</p>}
          {ageMsg && <p className="mt-2 text-[13px] leading-snug text-text2">{ageMsg}</p>}
        </div>
        <div>
          <p className="font-mono mb-2 text-xs uppercase tracking-wide text-textmut">
            Bodyweight
          </p>
          <BigNumberInput
            ariaLabel="Bodyweight"
            value={state.bodyweight}
            unit={state.unit}
            placeholder={state.unit === 'kg' ? '84' : '185'}
            onChange={(v) => dispatch({ type: 'SET_BODYWEIGHT', bodyweight: v })}
          />
          {bwOk && (
            <p className="mt-2 text-[13px] leading-snug text-text2">
              Locked. Everything from here is measured relative to this — the honest way to
              rank strength.
            </p>
          )}
        </div>
      </div>
    </StepShell>
  );
}
