import { useQuiz } from '../../state/QuizContext';
import { StepShell } from '../ui';
import type { Population } from '../../data/standards';

const OPTIONS: { value: Population; label: string; hint: string }[] = [
  {
    value: 'general',
    label: 'General population',
    hint: 'Most adults don’t lift — easiest comparison.',
  },
  {
    value: 'gym',
    label: 'People who lift',
    hint: 'Regular gym-goers who train with intent.',
  },
  {
    value: 'serious',
    label: 'Serious / competitive lifters',
    hint: 'The strong crowd — toughest comparison.',
  },
];

export function Population() {
  const { state, dispatch } = useQuiz();
  return (
    <StepShell
      kicker="Step 4 · Compare me against"
      title="Who are you stacking up against?"
      subtitle="This visibly changes your percentile — and it’s printed on your card, so the ranking is honest."
    >
      <div role="radiogroup" aria-label="Comparison population" className="flex flex-col gap-2.5">
        {OPTIONS.map((opt) => {
          const selected = state.population === opt.value;
          return (
            <button
              key={opt.value}
              role="radio"
              aria-checked={selected}
              onClick={() => dispatch({ type: 'SET_POPULATION', population: opt.value })}
              className={
                'flex flex-col items-start rounded-xl border px-4 py-3.5 text-left transition-all ' +
                (selected
                  ? 'border-accent bg-accent/10'
                  : 'border-line bg-raised hover:border-textmut')
              }
            >
              <span className="text-base font-semibold text-text">{opt.label}</span>
              <span className="mt-0.5 text-[13px] text-text2">{opt.hint}</span>
            </button>
          );
        })}
      </div>
    </StepShell>
  );
}
