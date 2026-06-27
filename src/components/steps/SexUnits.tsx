import { useQuiz } from '../../state/QuizContext';
import { Segmented, StepShell, type SegOption } from '../ui';
import type { Sex } from '../../data/standards';
import type { Unit } from '../../lib/units';

const SEX_OPTIONS: SegOption<Sex>[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

const UNIT_OPTIONS: SegOption<Unit>[] = [
  { value: 'kg', label: 'Kilograms', hint: 'kg' },
  { value: 'lb', label: 'Pounds', hint: 'lb' },
];

export function SexUnits() {
  const { state, dispatch } = useQuiz();
  return (
    <StepShell
      kicker="Step 1 · The basics"
      title="Let's set the baseline"
      subtitle="Sex sets the standards and DOTS coefficients. Units are just how you read weight — switch anytime."
    >
      <div className="flex flex-col gap-6">
        <div>
          <p className="font-mono mb-2 text-xs uppercase tracking-wide text-textmut">Sex</p>
          <Segmented
            ariaLabel="Sex"
            options={SEX_OPTIONS}
            value={state.sex}
            onChange={(v) => dispatch({ type: 'SET_SEX', sex: v })}
          />
        </div>
        <div>
          <p className="font-mono mb-2 text-xs uppercase tracking-wide text-textmut">Units</p>
          <Segmented
            ariaLabel="Units"
            options={UNIT_OPTIONS}
            value={state.unit}
            onChange={(v) => dispatch({ type: 'SET_UNIT', unit: v })}
          />
        </div>
      </div>
    </StepShell>
  );
}
